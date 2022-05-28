import { message, Modal } from "antd";
import {
    detail,
    getValues,
    saveInst,
    GetSerialNumSeed,
    verifyThirdPartyAPI
} from "../../services/FormBuilder/FormBuilder";
import FORMSTATUS from "../../enums/FormStatus";
import FormControlType from "../../enums/FormControlType";
import ControlType from "../../enums/ControlType";
import FormType from "../../enums/FormType";
import FORMRENDERSTYLE from "../../enums/FormRenderStyle";
import { getFormulaValue, initDataLinker } from "../../components/FormControl/DataLinker/DataLinker";
import {
    effects,
    reducers,
    buildFormDataModel,
    getAllLinkProxyDatas,
    initControlExtra,
    parseFormValue,
    buildItemValus,
    buildFormBody,
    getBussinessComponentsList,
    loadFormPermission,
    buildFormList,
    initProxyPool,
    FormControlList,
    buildFormValue,
    buildControlAuthority,
    linkFormData,
    getAllChildren,
    getFormContainerByContainerId,
    combineFormData,
    initTableLinker,
    checkFormReady
} from "commonForm";
import { fromJS } from "immutable";
import { ValidateFormNew, initValidateRelations } from "../../components/FormControl/ValidateForm";
import FORM_TYPE from "../../enums/FormType";
import _ from "underscore";
import bussinessComponents from "../../plugins/businessComponents/componentsList";
import com from "../../utils/com";
import { config } from "rxjs";
import moment from "moment";

const controlExtraList = ["valueType", "formControlType", "event", "bussinessComponents"];

const generatePreview = ({ rulesList, numValue, timeValue, rootItems }) => {
    return rulesList.reduce((prev, rule) => {
        switch (rule["type"]) {
            case "1":
                if (rule.value && rule.value.digit && rule.value.isFixedDigit) {// 如果设置了计数位数且固定位数 则自动补全位数
                    return prev + (Array(rule.value.digit).join("0") + numValue).slice(-rule.value.digit);
                } else {
                    return prev + numValue;
                }
            case "2":
                return prev + timeValue;
            case "3":
                return prev + rule["value"];
            default:
                let tempStr = rootItems.find(item => item.id === rule.type).value || "";
                return prev + tempStr;
        }
    }, "");
};

function getAllItems(id, formBody, containContainer = false) {
    let l = formBody.filter(a => a.container === id);
    let temp = [];
    l.forEach(function(a) {
        if (a.formControlType > 0) {
            temp = temp.concat(getAllItems(a.id, formBody));
            if (containContainer) temp.push(a);
        } else {
            temp.push(a);
        }
    });
    return temp;
}

function* registgerBussinessComponent({ bussinessComponentsList, effects, query }) {
    let proxyStateList = [],
        permissionList = [],
        submitInfoList = [],
        componentList = [];
    let list = bussinessComponents.filter(a => bussinessComponentsList.includes(a.key));
    for (let i = 0; i < list.length; i++) {
        let component = list[i];
        let proxyState = fromJS(component.initialProxyState || {}).toJS();
        let submitInfo = {
            key: component.key,
            list: []
        };
        proxyStateList.push({
            key: component.key,
            proxyState
        });
        submitInfoList.push(submitInfo);
        if (component.components)
            componentList.push({
                key: component.key,
                components: component.components
            });
    }
    return {
        proxyStateList,
        permissionList,
        submitInfoList,
        componentList
    };
}

function* linkBussinComponents({ effects, list, formItem, proxyIndex, proxyPool, controlExtra, data, formBody, formTemplateVersionId, bussinessComSetting }) {
    let itemType = formItem.get("itemType");
    let paramData = data;
    if (controlExtra.event[itemType]["onLinkToBussinessComponent"] instanceof Function) {
        paramData = controlExtra.event[itemType]["onLinkToBussinessComponent"].call(null, {
            data,
            props: { ...formItem.get("itemBase").toJS() },
            id: formItem.get("id")
        });
    }
    for (let businessKey of list) {
        let exist = bussinessComponents.find(b => b.key === businessKey);
        let proxyState = {},
            list = [];
        let setProxyState = state => {
            proxyState = { ...proxyState, ...state };
        };
        let setValue = ({ id, value, index = -1 }) => {
            let proxyIndex = index;
            let formItem = formBody.find(a => a.get("id") === id);
            if (formItem) {
                if (formItem.get("delegate") !== true) proxyIndex = -1;
                let newList = [{ proxyIndex, items: [{ id, data: { value } }] }];
                list = combineFormData(list, newList, formBody);
            }
        };
        let rowDataList = [];
        let removeRowDataList = [];
        let addRowData = (id, rowData) => {
            let primaryKeyValue = com.Guid();
            rowDataList.push({ id, rowData, primaryKeyValue });
            return primaryKeyValue;
        };
        let removeRowData = (id, primaryKeyValue) => {
            removeRowDataList.push({ id, primaryKeyValue });
        };
        if (exist && exist.onLink instanceof Function) {
            yield effects.call(exist.onLink, {
                id: formItem.get("id"),
                data: paramData,
                index: proxyIndex,
                setProxyState,
                setValue,
                setting: bussinessComSetting[exist.key],
                addRowData,
                removeRowData
            });
            yield effects.put({
                type: "updateBussinessProxyState",
                formTemplateVersionId,
                newState: proxyState,
                key: exist.key
            });
            for (let rowData of rowDataList) {
                yield effects.put({
                    type: "addRowData",
                    ...rowData
                });
            }
            for (let rowData of removeRowData) {
                yield effects.put({
                    type: "removeRowData",
                    ...rowData
                });
            }
            if (list.length > 0)
                yield effects.put({
                    type: "setValue",
                    formTemplateVersionId,
                    list
                });
        }
    }
}

function setFormData(action, state, attr) {
    let { formTemplateVersionId, [attr]: property } = action;
    let all = state.all;
    let formState = all[formTemplateVersionId];
    all[formTemplateVersionId] = formState.set(attr, property);
    return {
        ...state,
        all
    };
}

//业务组件权限注入
function injectFieldsPermissionWithBussiness({ formBody, permissionList }) {
    permissionList.forEach(item => {
        let key = item.key;
        formBody
            .filter(a => item.edit.includes(a.id))// && a.formControlType <= FormControlType.Group)
            .forEach(formItem => {
                if (formItem.formControlType === FormControlType.GroupItem) {
                    let groupItem = formBody.find(a => a.id === formItem.container);
                    groupItem.authority.disabled[key] = false;
                }
                formItem.authority.disabled[key] = false;
            });
        formBody
            .filter(a => item.show.includes(a.id))// && a.formControlType <= FormControlType.Group)
            .forEach(formItem => {
                if (formItem.formControlType === FormControlType.GroupItem) {
                    let groupItem = formBody.find(a => a.id === formItem.container);
                    groupItem.authority.hidden[key] = false;
                }
                formItem.authority.hidden[key] = false;
            });
        formBody
            .filter(a => item.hidden.includes(a.id))// && a.formControlType <= FormControlType.Group)
            .forEach(formItem => {
                if (formItem.formControlType === FormControlType.GroupItem) {
                    let groupItem = formBody.find(a => a.id === formItem.container);
                    groupItem.authority.hidden[key] = true;
                }
                formItem.authority.hidden[key] = true;
            });
        formBody
            .filter(a => item.disabled.includes(a.id))// && a.formControlType <= FormControlType.Group)
            .forEach(formItem => {
                if (formItem.formControlType === FormControlType.GroupItem) {
                    let groupItem = formBody.find(a => a.id === formItem.container);
                    groupItem.authority.disabled[key] = true;
                }
                formItem.authority.disabled[key] = true;
            });
        formBody
            .filter(a => item.required.includes(a.id))// && a.formControlType <= FormControlType.Group)
            .forEach(formItem => {
                if (formItem.formControlType === FormControlType.GroupItem) {
                    let groupItem = formBody.find(a => a.id === formItem.container);
                    //groupItem.authority.required[key] = true;
                    //groupItem.itemBase.required = true;
                    if (groupItem.itemBase.groupItems[formItem.itemBase.key].private !== true) {
                        formItem.authority.required[key] = true;
                        formItem.itemBase.required = true;
                        groupItem.itemBase.groupItems[formItem.itemBase.key].required = true;
                    }
                }
                else {
                    formItem.authority.required[key] = true;
                    formItem.itemBase.required = true;
                }
            });
    });
    return formBody;
}

//表单内置权限注入
function injectFieldsPermissionWithForm({ formBody, permission }) {
    let key = "system";
    let exceptList = [];
    formBody
        .filter(a => permission.show.includes(a.id))
        .forEach(formItem => {
            if (formItem.formControlType === FormControlType.GroupItem) {
                let groupItem = formBody.find(a => a.id === formItem.container);
                groupItem.authority.hidden[key] = false;
                exceptList.push(groupItem.id);
            }
            formItem.authority.hidden[key] = false;
            exceptList.push(formItem.id);
        });
    formBody
        .filter(a => permission.edit.includes(a.id))
        .forEach(formItem => {
            if (formItem.formControlType === FormControlType.GroupItem) {
                let groupItem = formBody.find(a => a.id === formItem.container);
                groupItem.authority.disabled[key] = false;
                exceptList.push(groupItem.id);
            }
            formItem.authority.disabled[key] = false;
            exceptList.push(formItem.id);
        });
    formBody
        .filter(a => !exceptList.includes(a.id) && a.formControlType < FormControlType.Container)
        .forEach(formItem => {
            if (formItem.formControlType === FormControlType.GroupItem) {
                let groupItem = formBody.find(a => a.id === formItem.container);
                if (!exceptList.includes(groupItem.id)) groupItem.authority.hidden[key] = true;
            }
            formItem.authority.hidden[key] = true;
        });
    formBody
        .filter(a => permission.hidden.includes(a.id))
        .forEach(formItem => {
            if (formItem.formControlType === FormControlType.GroupItem) {
                let groupItem = formBody.find(a => a.id === formItem.container);
                groupItem.authority.hidden[key] = true;
                exceptList.push(groupItem.id);
            }
            formItem.authority.hidden[key] = true;
            exceptList.push(formItem.id);
        });
    formBody
        .filter(a => permission.disabled.includes(a.id))
        .forEach(formItem => {
            if (formItem.formControlType === FormControlType.GroupItem) {
                let groupItem = formBody.find(a => a.id === formItem.container);
                groupItem.authority.disabled[key] = true;
                exceptList.push(groupItem.id);
            }
            formItem.authority.disabled[key] = true;
            exceptList.push(formItem.id);
        });
    // //没有赋权限的控件组，不显示
    // formBody.filter(a=>a.formControlType===FormControlType.Group&&a.itemType!=='Root'&&!permission.show.includes(a.id)&&!permission.show.includes(a.id))
    // .forEach(formItem => {

    // });
    //现在没有对容器的权限进行明确赋值 未赋值默认显示
    //formBody.filter(a=>a.formControlType===FormControlType.Container&&a.itemType!=='Root'&&!permission.show.includes(a.id)&&!permission.show.includes(a.id))
    return formBody;
}

//表单项校验
function* validateFormItem({ effects, validateItems, formDataModel, getRelationsItems, formTemplateVersionId }) {
    let { formList } = yield effects.select(state => {
        let formState = state.formRender.all[formTemplateVersionId];
        return {
            formList: formState.get("formList")
        };
    });
    // getFormDataModel = () => formDataModel;
    let validateMsg = [];
    let pass = true;
    for (let k = 0, l = validateItems.length; k < l; k++) {
        let formItem = validateItems[k], res = null;
        if (buildControlAuthority(formItem.authority).hidden !== true) {
            let form = formDataModel.find(a => a.formId === formItem.formId);
            let valueList = [];
            switch (form.formType) {
                default:
                case FORM_TYPE.mainForm:
                    valueList = [form.values];
                    break;
                case FORM_TYPE.subForm:
                    valueList = form.values.map(a => a.list);
                    break;
            }
            let proxyIndex = form.formType === FORM_TYPE.mainForm ? -1 : 0;
            switch (formItem.formControlType) {
                //控件组表单项验证，对相应的groupItem进行验证
                case FormControlType.Group:
                    for (let rowData of valueList) {
                        let groupRes = [];
                        let validateItem = { proxyIndex, items: [] };
                        for (let k in formItem.itemBase.groupItems) {
                            let res = { help: "" };
                            let groupItem = formItem.itemBase.groupItems[k];
                            if (groupItem.private) continue;
                            if (groupItem.required === true || groupItem.formartValue === true || groupItem.decimal === false || groupItem.range === true) {
                                let grouitemValue = rowData.find(a => a.id === groupItem.id).value;
                                try {
                                    let r = yield effects.call(ValidateFormNew, {
                                        ...groupItem,
                                        proxyIndex,
                                        getRelationsItems,
                                        formDataModel,
                                        formId: formItem.formId,
                                        value: grouitemValue // || ''
                                    });
                                    if (r && (res.help !== groupItem.help || res.validateStatus !== groupItem.validateStatus)) {
                                        if (r.help.length > 0)
                                            r.help = (formItem.itemBase.dicMode
                                                ? formItem.itemBase.name
                                                : groupItem.name) + r.help;
                                        groupRes.push(r);
                                        validateItem.items.push({ id: groupItem.id, data: r });
                                    }
                                } catch (err) {
                                    //验证逻辑报错走这里
                                    console.log(err);
                                }
                                // 控件组多个验证的时候 toString()数组转字符串的时候会添加逗号
                                res.help = groupRes.map(a => a.help).filter(a => a !== "");
                                if (res.help.length > 0) {
                                    pass = false;
                                    res.help = `${res.help.filter(a => a !== "").join("，")}。`;
                                    res.validateStatus = "error";
                                }
                                else {
                                    res.validateStatus = "";
                                    res.help = "";
                                }
                                validateItem.items.push({ id: formItem.id, data: res });
                                validateMsg.push(validateItem);
                            }
                        }
                        proxyIndex++;
                    }
                    break;
                default:
                    for (let rowData of valueList) {
                        try {
                            res = yield effects.call(ValidateFormNew, {
                                ...formItem.itemBase,
                                proxyIndex,
                                code: formItem.code,
                                table: formList.find(a => a.get("id") === formItem.formId).toJS().code,
                                id: formItem.id,
                                formDataModel,
                                formId: formItem.formId,
                                getRelationsItems,
                                value: rowData.find(a => a.id === formItem.id).value // || ''
                            });
                            if (res && res.help !== "") {
                                if (formItem.formControlType === FormControlType.GroupItem && !validateItems.some(a => a.id === formItem.container))
                                    continue;
                                pass = false;
                                validateMsg.push({
                                    proxyIndex,
                                    items: [{ id: formItem.id, data: res }]
                                });
                            }
                        } catch (err) {
                            //验证逻辑报错走这里
                            console.log(err);
                        }
                        finally {
                            proxyIndex++;
                        }
                    }
                    break;
            }
        }
    }
    if (validateMsg.length > 0) {
        yield effects.put({
            type: "setValue",
            list: validateMsg,
            formTemplateVersionId,
            ignoreLink: true,
            mode: "validate"
        });
    }
    return pass;
}

//表单校验
function* validateForm({ formSubmitVerification, formDataModel, formBody, rootFormId, effects }) {
    if (formSubmitVerification) {
        //校验
        let ids = (formSubmitVerification || "").split("\u2800").filter((e, i) => i % 2 !== 0);
        let allRelItems = formBody
            .filter(a => ids.includes(a.id))
            .map(a => ({
                id: a.id,
                value: a.itemBase.value,
                text: a.itemBase.text,
                valueType: a.valueType,
                delegate: a.delegate,
                formId: a.formId,
                container: a.container
            }));
        let value = yield effects.call(getFormulaValue, "boolean", rootFormId, -1, formSubmitVerification, allRelItems, formDataModel, null);
        if (!value) {
            message.error("未通过表单提交验证，请修改后提交！");
            return false;
        }
    }
    return true;
}

function* excuteBussinessComponentsEvent({
                                             submitKey, submitName, params, formDataModel, bussinessComponentsList, query, event, setProxyState, formInstanceId,
                                             formTemplateVersionId, effects, getOtherBussinessProxyState, bussinessProxyState, ignoreErr = false,
                                             submitData, formList
                                         }) {
    let resultList = [];
    for (let businessKey of bussinessComponentsList) {
        let bussinessComponent = bussinessComponents.find(a => a.key === businessKey);
        if (bussinessComponent && bussinessComponent[event] instanceof Function) {
            let currentProxyState = bussinessProxyState.find(a => a.key === businessKey);
            try {
                let result = yield effects.call(bussinessComponent[event],
                    {
                        params: submitKey === businessKey ? params : null,
                        submitName,
                        query,
                        proxyState: currentProxyState.proxyState,
                        formDataModel,
                        setProxyState: setProxyState.bind(null, businessKey, formTemplateVersionId),
                        getOtherBussinessProxyState,
                        bussinessComponentsList,
                        submitData,
                        formInstanceId,
                        formList
                    });
                if (result) {
                    if (result.success === false && ignoreErr === false) {
                        let other = ["BudgetCostResult", "BudgetApplicationResult", "BudgetAllocationResult"];//这三个只能存在一个
                        if (other.indexOf(bussinessComponent.key) !== -1) {
                            //预算提示
                        } else {
                            result.msg = `${bussinessComponent.name}校验失败：${result.msg}`;
                        }
                        return result;
                    }
                    else {
                        resultList.push(result);
                    }
                }
            }
            catch (e) {
                return { success: true };
            }
        }
    }
    return ignoreErr ? resultList : {
        success: true
    };
}

function buildSubmitFormData({
                                 formBody, oldValues, formTemplateVersionId, formInstanceId,
                                 rootContainer, formStatus, proxyPool, originalValue = false
                             }) {
    let userMess = localStorage.getItem("author") || "{}";
    userMess = JSON.parse(userMess);
    formBody.forEach((a, i) => {
        a.order = i;
    });
    let codeMap = formBody
        .filter(a => a.code)
        .map(a => ({
            code: a.code,
            id: a.id
        }));
    let areas = formBody.filter(a => a.formControlType > 0 && a.id !== rootContainer && a.delegate !== true && a.noMappad !== true);
    let items = formBody.filter(a => (a.formControlType === FormControlType.Item || a.formControlType === FormControlType.GroupItem || a.formControlType === FormControlType.System) && a.noMappad !== true); //排除掉external的item
    let formItemList = [];
    let rootItems = items.filter(a => a.container === rootContainer);
    let rootItem = formBody.find(a => a.itemType === "Root");
    let primaryKey = formBody.find(a => a.container === rootContainer && a.controlType === ControlType.PrimaryKey); //主表主键
    let primaryKeyValue = (
        oldValues.find(a => a.code === primaryKey.code) || {
            value: com.Guid()
        }
    ).value;
    //主表++++++++
    rootItems.forEach(e => {
        let exist = oldValues.find(a => a.code === e.code);
        let value = originalValue ? e.itemBase.value : buildFormValue(e.itemBase.value, e.valueType);
        let operationStatus = exist && exist.value === value ? FORMSTATUS.NoChange : formStatus === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify;
        formItemList.push({
            //isHide: e.authority.hidden.system,///e.isHide,
            id: e.id,
            code: e.code,
            formInstanceId,
            formTemplateVersionId,
            operationStatus,
            formVersionHistoryId: e.id,
            value,
            rowId: 0,
            formType: FormType.mainForm,
            formId: rootItem.formId,
            primaryKeyValue,
            primaryKeyId: primaryKey.id,
            isPrimaryKey: primaryKey.id === e.id,
            OrganizationId: userMess.currentDeptId,
            valueType: e.valueType
        });
    });
    //主表主键
    let pExist = oldValues.some(a => a.code === primaryKey.code);
    if (!pExist) {
        formItemList.push({
            isHide: primaryKey.authority.hidden.system, //.isHide,
            code: primaryKey.code,
            operationStatus: FORMSTATUS.Add,
            formVersionHistoryId: primaryKey.id,
            value: primaryKeyValue,
            formInstanceId,
            //rowId: 0,
            id: primaryKey.id,
            formId: rootItem.formId,
            formType: FormType.mainForm,
            primaryKeyValue,
            primaryKeyId: primaryKey.id,
            formTemplateVersionId,
            isPrimaryKey: true,
            OrganizationId: userMess.currentDeptId
        });
    }

    //子表/关联控件/普通容器++++++++++++
    areas.forEach(e => {
        // const { formId, ...other } = e.itemBase;
        if (e.formControlType > 0 && !e.proxy) {
            let areasItemList = items.filter(a => a.container === e.id && a.controlType < 100); // && !a.isHide);
            //普通容器数据提交
            areasItemList.forEach(a => {
                let exist = oldValues.find(b => b.code === a.code);
                let value = originalValue ? a.itemBase.value : buildFormValue(a.itemBase.value, a.valueType);
                let operationStatus = exist && exist.value === value ? FORMSTATUS.NoChange : formStatus === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify;
                formItemList.push({
                    id: a.id,
                    isHide: a.authority.hidden.system, //.isHide,
                    code: a.code,
                    operationStatus,
                    formVersionHistoryId: a.id,
                    value,
                    formInstanceId,
                    formId: e.formId,
                    formType: e.isSubTable === true ? FormType.subForm : FormType.mainForm,
                    primaryKeyValue,
                    primaryKeyId: primaryKey.id,
                    formTemplateVersionId,
                    isPrimaryKey: primaryKey.id === a.id,
                    //rowId: 0,
                    valueType: a.valueType,
                    OrganizationId: userMess.currentDeptId
                });
            });
        }
        //如果是代理容器，则调用顶层代理容器对应的onSubmit获取表单提交数据
        if (e.proxy) {
            const proxyData = e.proxyEvents.onSubmit.call(null, proxyPool[e.id], e);
            if (e.isSubTable === true) {
                let areaFormItemList = getAllItems(e.id, formBody);
                let tableLinker = formBody.find(a => a.container === e.id && a.status !== FORMSTATUS.Delete && a.itemType === "TableLinker");
                areaFormItemList = areaFormItemList.map(a => ({
                    id: a.id,
                    isHide: a.authority.hidden.system, //.isHide,
                    code: a.code,
                    operationStatus: a.status,
                    formVersionHistoryId: a.id,
                    value: null,
                    formInstanceId,
                    formId: e.itemBase.formId,
                    formType: FormType.subForm,
                    primaryKeyValue,
                    primaryKeyId: primaryKey.id,
                    formTemplateVersionId,
                    valueType: a.valueType,
                    isPrimaryKey: primaryKey.id === a.id,
                    OrganizationId: userMess.currentDeptId
                }));
                let tempData = [];
                let subPrimaryKey = formBody.find(b => b.container === e.id && b.controlType === ControlType.PrimaryKey); //子表主键
                let subForeignKey = formBody.find(b => b.container === e.id && b.controlType === ControlType.ForeignKey); //子表外键
                let currentSubPrimaryKeyValues = [];
                let oldSubPrimaryKeyValues = oldValues.filter(a => a.code === subPrimaryKey.code);
                proxyData.forEach((a, i) => {
                    let subPrimaryKeyValue = a[codeMap.find(a => a.code === subPrimaryKey.code).id] || com.Guid(); //子表主键_值
                    let subOperationStatus = oldSubPrimaryKeyValues.some(a => a.value === subPrimaryKeyValue) ? FORMSTATUS.Modify : FORMSTATUS.Add;
                    let subPrimaryKeyItem = oldValues.find(a => a.value === subPrimaryKeyValue);
                    currentSubPrimaryKeyValues.push(subPrimaryKeyValue);
                    let tableLinkerValue = undefined;
                    Object.keys(a).forEach(b => {
                        let aItem = areaFormItemList.find(c => c.id === b);
                        if (aItem) {
                            let { id, valueType, ...proxyItem } = aItem;
                            let item = {
                                ...proxyItem,
                                formInstanceId,
                                primaryKeyValue: subPrimaryKeyValue,
                                primaryKeyId: subPrimaryKey.id,
                                sortIndex: i,
                                value: originalValue ? a[b] : buildFormValue(a[b], valueType),
                                valueType,
                                OrganizationId: userMess.currentDeptId
                            };
                            delete item.id;
                            if (tableLinker) {
                                item.tableLinkerValue = a[tableLinker.id];
                                tableLinkerValue = a[tableLinker.id];
                            }
                            let aexist = oldValues.find(c => c.code === item.code && c.primaryKeyValue === subPrimaryKeyValue);
                            let operationStatus = FORMSTATUS.Add;
                            if (aexist) {
                                if (aexist.value !== item.value) operationStatus = FORMSTATUS.Modify;
                                else operationStatus = FORMSTATUS.NoChange;
                            }

                            item.operationStatus = operationStatus;
                            tempData.push(item);
                        }
                    });
                    //需要额外创建子表主外键
                    if (e.isSubTable && !subPrimaryKeyItem) {
                        //let subPrimaryKeyValue = com.Guid();//子表主键_值
                        let subForeignKeyValue = primaryKeyValue;//子表外键_值===主表主键_值
                        //子表主键
                        formItemList.push({
                            isHide: subPrimaryKey.authority.hidden.system, //.isHide,
                            code: subPrimaryKey.code,
                            operationStatus: subOperationStatus,
                            formVersionHistoryId: subPrimaryKey.id,
                            value: subPrimaryKeyValue,
                            formInstanceId,
                            formType: FormType.subForm,
                            id: subPrimaryKey.id,
                            //rowId: i,
                            sortIndex: i,
                            formId: e.itemBase.formId,
                            primaryKeyValue: subPrimaryKeyValue,
                            primaryKeyId: subPrimaryKey.id,
                            formTemplateVersionId,
                            isPrimaryKey: true,
                            OrganizationId: userMess.currentDeptId,
                            tableLinkerValue
                        });
                        //子表外键
                        formItemList.push({
                            isHide: subForeignKey.authority.hidden.system,//.isHide,
                            code: subForeignKey.code,
                            operationStatus: subOperationStatus,
                            formVersionHistoryId: subForeignKey.id,
                            value: subForeignKeyValue,
                            formInstanceId,
                            formType: FormType.subForm,
                            //id:e.id,
                            //rowId: i,
                            sortIndex: i,
                            formId: e.itemBase.formId,
                            primaryKeyValue: subPrimaryKeyValue,
                            primaryKeyId: subPrimaryKey.id,
                            formTemplateVersionId,
                            isPrimaryKey: false,
                            OrganizationId: userMess.currentDeptId
                        });
                    }
                });
                formItemList = formItemList.concat(tempData);
                let delSubPKeyValues = oldSubPrimaryKeyValues.filter(a => !currentSubPrimaryKeyValues.includes(a.value)).map(a => a.primaryKeyValue);
                oldValues
                    .filter(a => a.code !== "FormInstanceId" && delSubPKeyValues.includes(a.primaryKeyValue))
                    .forEach(a => {
                        let { id, ...proxyItem } = areaFormItemList.find(b => b.code === a.code);
                        formItemList.push({
                            ...proxyItem,
                            formInstanceId,
                            operationStatus: FORMSTATUS.Delete,
                            value: a.value,
                            primaryKeyValue: a.primaryKeyValue,
                            primaryKeyId: a.primaryKeyId,
                            formTemplateVersionId,
                            isPrimaryKey: subPrimaryKey.id === a.id,
                            OrganizationId: userMess.currentDeptId
                            //tableLinkerValue
                        });
                    });
            } else {
                formItemList = formItemList.concat(proxyData);
            }
        }
        //formItemList = formItemList.concat(areaFormItemList);
    });
    return formItemList;
}


function buildInstFormData({ submitFormData, formList, formTemplateVersionId, extraProps = [] }) {
    let result = {
        addFormItems: [],
        modifyFormItems: [],
        removeFormItems: []
    };
    let author = localStorage.getItem("author") || "{}";
    author = JSON.parse(author);
    let organizationId = author.currentDeptId;
    let instGroup = _.groupBy(submitFormData, a => a.formInstanceId);
    for (let formInstanceId in instGroup) {
        let formGroup = _.groupBy(instGroup[formInstanceId], a => a.primaryKeyId);
        for (let fId in formGroup) {
            let rowGroup = _.groupBy(formGroup[fId], a => a.primaryKeyValue);
            for (let pId in rowGroup) {
                let { code: primaryKeyCode, primaryKeyValue, formId, ...extra } = rowGroup[pId].find(a => a.value === a.primaryKeyValue);
                let extraP = {};
                extraProps.forEach(p => {
                    extraP[p] = extra[p];
                });
                let { code: formCode, name: formName, sortIndex } = formList.find(a => a.id === formId);
                let addItems = {}, modifyItems = {}, removeItems = {};
                rowGroup[pId].forEach(a => {
                    switch (a.operationStatus) {
                        case FORMSTATUS.Add:
                            addItems[a.code] = a.value;
                            break;
                        case FORMSTATUS.Modify:
                            modifyItems[a.code] = a.value;
                            break;
                        case FORMSTATUS.Delete:
                            removeItems[a.code] = a.value;
                            break;
                    }
                });
                if (Object.keys(addItems).length > 0) {
                    result.addFormItems.push({
                        formInstanceId,
                        formItems: addItems,
                        formName,
                        formCode,
                        primaryKeyCode,
                        primaryKeyValue,
                        organizationId,
                        formTemplateVersionId,
                        sortIndex,
                        ...extraP
                    });
                }
                if (Object.keys(modifyItems).length > 0) {
                    result.modifyFormItems.push({
                        formInstanceId,
                        formItems: modifyItems,
                        formName,
                        formCode,
                        primaryKeyCode,
                        primaryKeyValue,
                        organizationId,
                        formTemplateVersionId,
                        sortIndex,
                        ...extraP
                    });
                }
                if (Object.keys(removeItems).length > 0) {
                    result.removeFormItems.push({
                        formInstanceId,
                        formItems: removeItems,
                        formName,
                        formCode,
                        primaryKeyCode,
                        primaryKeyValue,
                        organizationId,
                        formTemplateVersionId,
                        sortIndex,
                        ...extraP
                    });
                }
            }
        }
    }
    return result;
}

export default {
    namespace: "formRender",
    state: {
        all: {},
        controlExtra: initControlExtra(controlExtraList)
    },
    // subscriptions: {},
    effects: {
        ...effects("formRender"),
        * loadFormValues(action, effects) {
            let { formTemplateVersionId, instId, hideProgress, query, readOnly, ignoreLinker } = action;
            let formValues = {
                mainForm: [],
                subForm: []
            };
            if (instId) {
                yield effects.put({
                    type: "changeLoading",
                    formTemplateVersionId,
                    formLoading: true
                });
                let { formBody, formList } = yield effects.select(state => {
                    let formState = state.formRender.all[formTemplateVersionId];
                    return {
                        formBody: formState.get("formBody").toJS(),
                        formList: formState.get("formList").toJS()
                    };
                });
                let taskList = [];
                for (let i = 0, j = formList.length; i < j; i++) {
                    let formItemQueryRequest = formBody
                        .filter(a => a.formId === formList[i].id && a.code)
                        .map(formItem => ({
                            id: formItem.id,
                            code: formItem.code,
                            noMappad: formItem.noMappad === true,
                            formInstanceId: instId,
                            tableCode: formList[i].code,
                            formTemplateVersionId,
                            isPrimaryKey: formItem.itemType === "PrimaryKey"
                        }));
                    taskList.push(
                        effects.call(getValues, {
                            id: instId,
                            formId: formList[i].id,
                            formItemQueryRequest,
                            platform: "FormEngine",
                            hideProgress: hideProgress === true
                        })
                    );
                }
                yield effects.put({
                    type: "changeLoading",
                    formTemplateVersionId,
                    formLoading: false
                });
                let allResult = yield effects.all(taskList);
                allResult.forEach((valueResult, i) => {
                    switch (formList[i].formType) {
                        default:
                        case 0:
                            formValues.mainForm = formValues.mainForm.concat(
                                valueResult.data.map(a => ({
                                    code: a.code,
                                    value: a.value,
                                    primaryKeyValue: a.primaryKeyValue,
                                    primaryKeyId: a.primaryKeyId
                                }))
                            );
                            break;
                        case 1:
                            formValues.subForm.push({
                                formId: formList[i].id,
                                values: valueResult.data
                                    .map(a => ({
                                        code: a.code,
                                        value: a.value,
                                        primaryKeyValue: a.primaryKeyValue,
                                        primaryKeyId: a.primaryKeyId
                                    }))
                                    .sort((a, b) => {
                                        if (a.rowId > b.rowId) return -1;
                                        else if (a.rowId < b.rowId) return 1;
                                        else return 0;
                                    })
                            });
                            break;
                    }
                });
            }
            //else if (ignoreLinker !== true) {
            let { dataLinker, formBody } = yield effects.select(state => {
                return {
                    dataLinker: state.formRender.all[formTemplateVersionId].get("dataLinker").toJS(),
                    formBody: state.formRender.all[formTemplateVersionId]
                        .get("formBody")
                        .toJS()
                        .filter(a => a.status !== FORMSTATUS.Delete)
                };
            });
            let allLinkIds = Object.keys(dataLinker).concat(formBody.filter(a => Array.isArray(a.dataLinker) && a.dataLinker.length > 0).map(a => a.id));
            debugger
            yield effects.call(linkFormData, [], new Set(allLinkIds), formTemplateVersionId, effects, "formRender", true, instId ? 0 : 10, true);
            //}
            yield effects.put({
                type: "buildFormValueModel",
                formTemplateVersionId,
                readOnly,
                instId,
                values: formValues,
                query
            });
            // yield effects.put({
            //     type: "changeLoading",
            //     formTemplateVersionId,
            //     formLoading: false
            // });
        },
        * beginLoadForm(action, effects) {
            let {
                formTemplateVersionId, instId, query, hideProgress, readOnly, isAdmin,
                loadBussinessComponents, workFlowId, ignoreLinker
            } = action;
            yield effects.put({ type: "changeLoading", formTemplateVersionId, formLoading: true });
            //yield effects.put({ type: "setSubmitting", formTemplateVersionId, submitting: true });
            yield effects.put({
                type: "BtnDisabled",
                formTemplateVersionId,
                BtnDisabled: true
            });
            const { data } = yield effects.call(detail, {
                EntityId: formTemplateVersionId,
                hideProgress: action.hideProgress === true
            });
            if (data.name) {
                let reg = new RegExp("\\$u2800", "gm");
                let moduleId = data.moduleId;
                let rootArea = data.areaActionRequests.find(a => a.areaType === "Root");
                const rootContainer = rootArea.id;
                let rootFormId = data.formsActionRequests.find(a => a.areaId === rootArea.id).id;
                const formTitle = data.name;
                const formStatus = action.formStatus || FORMSTATUS.NoChange;
                let formProperties = JSON.parse(data.property.replace(reg, "\u2800"));
                let formBody = buildFormBody({
                    data,
                    reg,
                    formProperties,
                    readOnly
                });
                let formList = buildFormList(data.formsActionRequests);
                let showFields = [],
                    operationPermission = [];
                //如果是非流程表单或者是台账加载（不加载业务组件），加载自带权限
                if (query.formTemplateType === "0" || loadBussinessComponents === false) {
                    let formPermission = yield effects.call(loadFormPermission, {
                        moduleId,
                        effects,
                        sourceType: query.sourceType || null
                    });
                    formBody = injectFieldsPermissionWithForm({
                        formBody,
                        permission: formPermission.fieldsPermission
                    });
                    showFields = formPermission.fieldsPermission.show;
                    operationPermission = formPermission.operationPermission;
                }

                formBody = fromJS(formBody);
                let { dataLinker, valid } = initDataLinker(formBody);
                let validateRelations = initValidateRelations(formBody.filter(a => a.hasIn(["itemBase", "validateCustom"])).map(a => ({
                    id: a.get("id"),
                    relations: a.getIn(["itemBase", "validateCustom", "relations"])
                })).toJS());
                if (valid.length > 0)
                    message.warn(`表单联动设置存在循环,请在表单设计器中重新设置相关表单项：${valid.map(a => a.name).toString()}！`);
                formBody = initTableLinker(formProperties.tableLinker || {}, formBody);
                let result = initProxyPool(formBody, FormControlList, rootContainer);
                formBody = result.formBody;
                let proxyPool = result.proxyPool;
                if (loadBussinessComponents !== false) {
                    let bussinessComponentsList = yield effects.call(getBussinessComponentsList, {
                        bussinessComSetting: formProperties.bussinessComSetting || {},
                        query
                    });
                    let { proxyStateList, submitInfoList, permissionList, componentList } = yield effects.call(registgerBussinessComponent, {
                        bussinessComponentsList,
                        effects,
                        query: {
                            ...query
                        }
                    });
                    yield effects.put({
                        type: "initBussinessComponentsInfo",
                        formTemplateVersionId,
                        proxyStateList,
                        submitInfoList,
                        permissionList,
                        componentList,
                        bussinessComponentsList
                    });
                }
                yield effects.put({
                    type: "setLoadForm",
                    formTemplateVersionId,
                    formBody,
                    formList,
                    dataLinker,
                    proxyPool,
                    formProperties,
                    formTitle,
                    formStatus,
                    rootFormId,
                    rootContainer,
                    validateRelations,
                    isUsed: data.isUsed,
                    publishStatus: data.publishStatus,
                    formTemplateId: data.id,
                    serialNumSeedActionRequest: data.serialNumSeedActionRequest,
                    workFlowId,
                    viewCode: data.code,
                    moduleId,
                    instId: instId ? instId : com.Guid(),
                    operationPermission,
                    showFields,
                    formVersion: data.formVersion
                });
                yield effects.put({
                    type: "applyLang",
                    formTemplateVersionId,
                    lang: config.defaultLang || "zhcn"
                });
                yield effects.put({
                    type: "beginLoadBussinessComponents",
                    formTemplateVersionId,
                    instType: instId ? "modify" : "new",
                    readOnly,
                    formBody,
                    query
                });
                yield effects.put({
                    type: "loadFormValues",
                    formBody,
                    formList,
                    formTemplateVersionId,
                    instId,
                    hideProgress,
                    ignoreLinker,
                    query,
                    readOnly
                });
                yield effects.put({
                    type: "changeLoading",
                    formTemplateVersionId,
                    formLoading: false
                });
                while (true) {
                    let action = yield effects.take("endLoadBussinessComponents");
                    if (action.formTemplateVersionId === formTemplateVersionId) {
                        yield effects.put({
                            type: "endLoadForm",
                            formTemplateVersionId,
                            formEnable: true
                        });
                        break;
                    }
                }
            }
        },
        * refreshPermission(action, effects) {
            let { formTemplateVersionId } = action;
            let moduleId = yield effects.select(state => state.formRender.all[formTemplateVersionId].get("moduleId"));
            let { operationPermission, fieldsPermission } = yield effects.call(loadFormPermission, {
                moduleId,
                effects
            });
            yield effects.put({
                type: "setOperationPermission",
                formTemplateVersionId,
                operationPermission,
                fieldsPermission
            });
        },
        * buildFormValueModel(action, { select, call, put }) {
            let { formBody, formDataModel, controlExtra } = yield select(state => {
                let formState = state.formRender.all[action.formTemplateVersionId];
                let formBody = formState.get("formBody");
                let proxyPool = formState.get("proxyPool");
                let formDataModel = buildFormDataModel(formBody, getAllLinkProxyDatas(formBody, proxyPool));
                return {
                    formBody: formBody.toJS(),
                    formDataModel,
                    controlExtra: state.formRender.controlExtra
                };
            });
            let { formTemplateVersionId, values, query, readOnly, instId } = action;
            let codeMap = formBody
                .filter(a => a.code)
                .map(a => ({
                    code: a.code,
                    id: a.id
                }));
            let mainFormDataModel = formDataModel.find(a => a.formType === FORM_TYPE.mainForm);
            values.mainForm.forEach(a => {
                let item = formBody.find(b => b.code === a.code);
                let itemValue = a.value;
                if (!item) return;
                switch (item.formControlType) {
                    //如果是控件组项，需要去itemBase找valueType
                    case FormControlType.GroupItem:
                        itemValue = parseFormValue(itemValue, item.itemBase.valueType);
                        break;
                    default:
                        itemValue = parseFormValue(itemValue, controlExtra.valueType[item.itemType]);
                        break;
                }
                mainFormDataModel.update = true;
                let updateFormItem = mainFormDataModel.values.find(v => v.id === codeMap.find(c => c.code === a.code).id);
                updateFormItem.update = true;
                updateFormItem.value = itemValue;
                a.formType = FORM_TYPE.mainForm;
            });
            let oldValues = [...values.mainForm];
            values.subForm.forEach(a => {
                oldValues = oldValues.concat(a.values);
            });
            values.subForm.forEach(a => {
                a.formType = FORM_TYPE.subForm;
                let item = formBody.find(b => b.itemBase.formId === a.formId);
                let subFormDataModel = formDataModel.find(b => b.formId === a.formId);
                subFormDataModel.update = true;
                let subFormItemList = formBody.filter(b => b.formId === a.formId && b.formControlType < FormControlType.Group);
                let rowValueList = _.groupBy(a.values, b => b.primaryKeyValue);
                for (let primaryKeyValue in rowValueList) {
                    let row = rowValueList[primaryKeyValue];
                    let subRowDataModel = {
                        list: [],
                        parentProxyIndex: 0,
                        update: true
                    };
                    row.forEach(col => {
                        let subFormItem = subFormItemList.find(c => c.code === col.code);
                        if (!subFormItem) {
                            return;
                        }
                        let colValue = col.value;
                        switch (subFormItem.formControlType) {
                            case FormControlType.GroupItem:
                                colValue = parseFormValue(colValue, item.itemBase.valueType);
                                break;
                            default:
                                colValue = parseFormValue(colValue, controlExtra.valueType[item.itemType]);
                                break;
                        }
                        let subId = codeMap.find(c => c.code === col.code).id;
                        subRowDataModel.list.push({
                            id: subId,
                            value: parseFormValue(col.value, subFormItemList.find(c => c.id === subId).valueType),
                            update: true
                        });
                    });
                    subFormDataModel.values.push(subRowDataModel);
                }
            });
            if (instId)
                yield put({
                    type: "setFormMirror",
                    formTemplateVersionId,
                    oldValues,
                    instId
                });
            let newList = buildItemValus(formDataModel);
            if (newList.length > 0)
                yield put({
                    type: "setValue",
                    formTemplateVersionId,
                    list: newList,
                    ignoreLink: true,//关联数据
                    loadValue: true,
                    delay: 0
                });
            yield put({
                type: "BtnDisabled",
                formTemplateVersionId,
                BtnDisabled: false
            });


        },
        * beginLoadBussinessComponents(action, effects) {
            let { formTemplateVersionId, query, readOnly, instType, formBody } = action;
            let { bussinessComponentsList, oldProxyStateList, workFlowId, bussinessComSetting, formInstanceId } = yield effects.select(state => {
                let formState = state.formRender.all[formTemplateVersionId];
                let bussinessComSetting = formState.getIn(["formProperties", "bussinessComSetting"]);
                if (bussinessComSetting !== undefined) bussinessComSetting = bussinessComSetting.toJS();
                else bussinessComSetting = {};
                return {
                    bussinessComponentsList: formState.get("bussinessComponentsList").toJS(),
                    oldProxyStateList: formState.get("bussinessProxyState").toJS(),
                    workFlowId: formState.get("workFlowId"),
                    bussinessComSetting,
                    formInstanceId: formState.get("instId")
                };
            });
            let proxyStateList = [],
                permissionList = [],
                submitInfoList = [],
                bussinessLinkerList = [];
            let list = bussinessComponents.filter(a => bussinessComponentsList.includes(a.key));
            let taskList = [];
            for (let i = 0; i < list.length; i++) {
                taskList.push(effects.call(function* () {
                    try {
                        let component = list[i];
                        let proxyState = oldProxyStateList.find(a => a.key === component.key);
                        let setting = bussinessComSetting[component.key] || {};
                        let oldProxyState = proxyState;
                        let permission = null;
                        let submitInfo = null;
                        const setPermission = p => {
                            permission = {
                                key: component.key,
                                ...p
                            };
                        };
                        const setSubmitInfo = s => {
                            submitInfo = {
                                key: component.key,
                                list: s
                            };
                        };
                        const setProxyState = state => {
                            proxyState = {
                                key: component.key,
                                proxyState: {
                                    ...proxyState.proxyState,
                                    ...state
                                }
                            };
                        };
                        const addLinker = (...formItemIds) => {
                            let exist = bussinessLinkerList.find(a => a.key === component.key);
                            if (exist === undefined) {
                                exist = { key: component.key, list: formItemIds };
                                bussinessLinkerList.push(exist);
                            } else {
                                let tempList = exist.list.concat(formItemIds);
                                exist.list = Array.from(new Set(tempList));
                            }
                        };
                        if (component.onLoaded instanceof Function) {
                            yield effects.call(component.onLoaded, {
                                query,
                                proxyState: proxyState.proxyState,
                                setPermission,
                                setSubmitInfo,
                                setProxyState,
                                readOnly,
                                workFlowId,
                                addLinker,
                                instType,
                                setting,
                                formBody,
                                formInstanceId
                            });
                        }
                        if (!Object.is(oldProxyState, proxyState)) proxyStateList.push(proxyState);
                        if (permission) permissionList.push(permission);
                        if (submitInfo) submitInfoList.push(submitInfo);

                    } catch (e) {
                        //后期加入记录业务组件加载错误的日志
                        console.log(e);
                    }
                }));
            }
            yield effects.all(taskList);
            if (permissionList.length > 0)
                yield effects.put({
                    type: "updatePermission",
                    formTemplateVersionId,
                    permissionList
                });
            if (proxyStateList.length > 0)
                yield effects.put({
                    type: "updateProxyState",
                    formTemplateVersionId,
                    proxyStateList
                });
            if (submitInfoList.length > 0)
                yield effects.put({
                    type: "updateSubmitInfo",
                    formTemplateVersionId,
                    submitInfoList
                });
            if (bussinessLinkerList.length > 0)
                yield effects.put({
                    type: "updateBussinessLinker",
                    formTemplateVersionId,
                    bussinessLinkerList
                });
            yield effects.put({
                type: "endLoadBussinessComponents",
                formTemplateVersionId
            });
        },

        * beginSubmit(action, effects) {
            let {
                formTemplateVersionId, submitKey, params, setProxyState, query,
                onCompleted, getOtherBussinessProxyState, submitName, tempSave
            } = action;
            let {
                formProperties,
                formBody,
                proxyPool,
                rootFormId,
                bussinessComponentsList,
                formList,
                bussinessProxyState,
                formStatus,
                oldValues,
                rootContainer,
                serialNumSeedActionRequest,
                formInstanceId
            } = yield effects.select(state => {
                let formState = state.formRender.all[formTemplateVersionId];
                return {
                    formStatus: formState.get("formStatus"),
                    rootContainer: formState.get("rootContainer"),
                    oldValues: formState.get("oldValues").toJS(),
                    formProperties: formState.get("formProperties").toJS(),
                    formBody: formState.get("formBody"),
                    proxyPool: formState.get("proxyPool").toJS(),
                    formInstanceId: formState.get("instId"),
                    formList: formState.get("formList").toJS(),
                    rootFormId: formState.get("rootFormId"),
                    bussinessComponentsList: formState.get("bussinessComponentsList").toJS(),
                    bussinessProxyState: formState.get("bussinessProxyState").toJS(),
                    serialNumSeedActionRequest: formState.get("serialNumSeedActionRequest")
                };
            });
            let checkReady = checkFormReady(formBody);
            if (checkReady && tempSave === false) {
                message.error(`请完成${checkReady}的填写！`);
                return;
            }
            let linkProxyDatas = getAllLinkProxyDatas(formBody, fromJS(proxyPool));
            let formDataModel = buildFormDataModel(formBody, linkProxyDatas);
            formBody = formBody.toJS();
            let { formSubmitVerification, formSubmitVerificationMsg, thirdPartyId, thirdPartyVerification } = formProperties;
            let baseHideItems = formBody.filter(a => a.itemType !== "Root" && buildControlAuthority(a.authority).hidden === true);

            let hideList = [];
            baseHideItems.forEach(a => {
                switch (a.formControlType) {
                    case FormControlType.Container:
                        hideList.push(...getAllItems(a.id, formBody, true).map(a => a.id));
                }
                hideList.push(a.id);
            });

            let validateItems = formBody.filter(a => {
                return (a.itemBase.required === true || buildControlAuthority(a.authority).required === true || a.formControlType === FormControlType.Group ||
                    a.itemBase.validateCustom || //新增
                    a.itemBase.formartValue || a.itemBase.decimal === false || a.itemBase.range)
                    && !hideList.includes(a.id) && a.formControlType !== FormControlType.GroupItem;
            });
            let getRelationsItems = (ids) => {
                return formBody.filter(a => ids.includes(a.id)).map(a => ({ id: a.id, formId: a.formId }));
            };
            yield effects.put({
                type: "setSubmitting",
                formTemplateVersionId,
                submitting: true
            });
            yield effects.put({
                type: "changeLoading",
                formTemplateVersionId,
                formLoading: true
            });
            //验证 表单项验证，表单验证，第三方api验证
            let [formItemValidate, formValidate] = tempSave === true ? [true, true] : yield effects.all([
                effects.call(validateFormItem, {
                    effects,
                    validateItems,
                    getRelationsItems,
                    formDataModel,
                    formTemplateVersionId
                }),
                effects.call(validateForm, {
                    formSubmitVerification,
                    formDataModel,
                    formBody,
                    rootFormId,
                    effects
                })
            ]);
            let formEnable = false;
            // if (formItemValidate || formValidate) {
            //     message.error("校验失败，请检查表单数据！");
            // }
            // return;
            if (formItemValidate && formValidate) {
                if (tempSave !== true) {
                    // 组装第三方数据源校验参数
                    let formVerification = [];
                    Array.isArray(thirdPartyId) &&
                    thirdPartyId.forEach(a => {
                        let arr = [];
                        let tempVerification = thirdPartyVerification.filter(b => b.sourceTypeConfigId === a) || [];
                        tempVerification.forEach(c => {
                            let obj = {
                                sourceParameterId: c.sourceTypeConfigId,
                                value: c.value
                            };
                            if (c.targetId) obj.value = formBody.find(d => d.id === c.targetId).itemBase.value;
                            arr.push(obj);
                        });
                        let requestObj = {
                            sourceTypeConfigId: a,
                            parameters: arr,
                            platform: "FormEngine"
                        };
                        formVerification.push(requestObj);
                    });

                    //校验第三方API验证
                    let resultArr = [];
                    for (let i = 0, j = formVerification.length; i < j; i++) {
                        let verifyResult = yield effects.call(verifyThirdPartyAPI, formVerification[i]);
                        resultArr.push(verifyResult);
                    }
                    let resultObj = resultArr.find(a => a.success === false);
                    if (resultObj) {
                        if (resultObj.msg) message.error(`保存失败：第三方数据源校验失败：${resultObj.msg}`);
                        yield effects.put({
                            type: "setSubmitting",
                            formTemplateVersionId,
                            submitting: false
                        });
                        yield effects.put({
                            type: "changeLoading",
                            formTemplateVersionId,
                            formLoading: false,
                            formEnable: true
                        });
                        return;
                    }

                    //业务组件beforeSubmit调用
                    let result = yield effects.call(excuteBussinessComponentsEvent, {
                        submitKey,
                        submitName,
                        params: params.params,
                        formDataModel,
                        bussinessComponentsList,
                        event: "beforeSubmit",
                        formTemplateVersionId,
                        setProxyState,
                        getOtherBussinessProxyState,
                        effects,
                        bussinessProxyState
                    });
                    if (result.success === false) {
                        if (result.msg)
                            message.info(result.msg);
                        yield effects.put({
                            type: "setSubmitting",
                            formTemplateVersionId,
                            submitting: false
                        });
                        yield effects.put({
                            type: "changeLoading",
                            formTemplateVersionId,
                            formLoading: false,
                            formEnable: true
                        });
                        return;
                    }
                    //重新获取一次proxyState,因为beforeSubmit可能会改变proxyState
                    bussinessProxyState = yield effects.select(state => state.formRender.all[formTemplateVersionId].get("bussinessProxyState").toJS());
                    //业务组件onAuthority调用
                    result = yield effects.call(excuteBussinessComponentsEvent, {
                        submitKey,
                        submitName,
                        params,
                        formDataModel,
                        bussinessComponentsList,
                        getOtherBussinessProxyState,
                        event: "onAuthority",
                        formTemplateVersionId,
                        setProxyState,
                        effects,
                        bussinessProxyState
                    });
                    if (result.success === false) {
                        if (result.msg)
                            message.info(result.msg);
                        // yield effects.put({
                        //     type: "setSubmitting",
                        //     formTemplateVersionId,
                        //     submitting: false
                        // });
                        yield effects.put({
                            type: "changeLoading",
                            formTemplateVersionId,
                            formLoading: false,
                            formEnable: true
                        });
                        return;
                    }
                }
                //构建表单数据
                let submitFormData = yield effects.call(buildSubmitFormData, {
                    formBody,
                    oldValues,
                    formTemplateVersionId,
                    formInstanceId,
                    rootContainer,
                    formStatus,
                    proxyPool
                });
                // 流水号生成
                if (formStatus === FORMSTATUS.Add) {
                    let serialItem = formBody.find(item => item.itemType === "SerialNumber" && !item.isExternal);
                    if (serialItem && !serialItem.itemBase.value) {
                        let {
                            data: { isValid, dateTimeFormat, serialNum }
                        } = yield effects.call(GetSerialNumSeed, {
                            id: serialNumSeedActionRequest.id
                        });
                        if (!isValid) {
                            message.error(`${serialItem.itemBase.name}生成失败！`);
                            return;
                        }
                        let serialFormItem = submitFormData.find(item => item.code === serialItem.code);
                        if (serialFormItem) {
                            let serialIndexOf = submitFormData.indexOf(serialFormItem);
                            serialFormItem.value = generatePreview({
                                rulesList: serialItem.itemBase.rulesList,
                                numValue: serialNum,
                                timeValue: dateTimeFormat,
                                rootItems: submitFormData
                            });
                            yield effects.put({
                                type: "setValue",
                                formTemplateVersionId,
                                list: [{
                                    proxyIndex: -1,
                                    items: [{ id: serialItem.id, data: { value: serialFormItem.value } }]
                                }]
                            });
                            submitFormData.splice(serialIndexOf, 1, serialFormItem);
                        }
                    }
                }

                let submitData = submitFormData.map(a => {
                    if (a.valueType) {
                        let r = { ...a, value: parseFormValue(a.value, a.valueType) };
                        if (r.value instanceof Date) {
                            r.value = moment(r.value).format("YYYY-MM-DD HH:mm:ss");
                        }
                        return r;
                    }
                    return a;
                });

                //内置业务组件调用onBuildSubmitData
                for (let businessKey of bussinessComponentsList) {
                    let bussinessComponent = bussinessComponents.find(a => a.key === businessKey);
                    if (bussinessComponent && bussinessComponent.onBuildSubmitData instanceof Function) {
                        let currentProxyState = bussinessProxyState.find(a => a.key === businessKey);
                        submitFormData = yield effects.call(bussinessComponent.onBuildSubmitData,
                            {
                                params: submitKey === businessKey ? params : null,
                                proxyState: currentProxyState.proxyState,
                                getOtherBussinessProxyState,
                                submitFormData,
                                query
                            });
                    }
                }
                let formData = submitFormData.filter(a => a.operationStatus !== FORMSTATUS.NoChange);
                let check = formData.length > 0;

                //保存之前验证
                let result = yield effects.call(excuteBussinessComponentsEvent, {
                    submitKey,
                    submitName,
                    params: params.params,
                    formDataModel,
                    bussinessComponentsList,
                    event: "beforeTempSave",
                    formTemplateVersionId,
                    setProxyState,
                    getOtherBussinessProxyState,
                    effects,
                    bussinessProxyState
                });
                if (result.success === false) {
                    if (result.msg)
                        message.info(result.msg);
                    yield effects.put({
                        type: "setSubmitting",
                        formTemplateVersionId,
                        submitting: false
                    });
                    yield effects.put({
                        type: "changeLoading",
                        formTemplateVersionId,
                        formLoading: false,
                        formEnable: true
                    });
                    return;
                }


                //表单提交
                formData = buildInstFormData({
                    submitFormData,
                    formList, formTemplateVersionId, extraProps: ["workFlowId", "templateId"]
                });
                if (check) {
                    let submitResult = yield effects.call(saveInst, formData);
                    if (!submitResult.data.isValid) {
                        message.error(`表单提交保存失败：${submitResult.data.errorMessages}`);
                        yield effects.put({
                            type: "setSubmitting",
                            formTemplateVersionId,
                            submitting: false
                        });
                        yield effects.put({
                            type: "changeLoading",
                            formTemplateVersionId,
                            formLoading: false,
                            formEnable: true
                        });
                        return;
                    }
                }
                if (tempSave !== true) {
                    //业务组件beforeSave
                    let result = yield effects.call(excuteBussinessComponentsEvent, {
                        submitKey,
                        submitName,
                        params,
                        query,
                        formDataModel,
                        bussinessComponentsList,
                        getOtherBussinessProxyState,
                        event: "beforeSave",
                        formTemplateVersionId,
                        setProxyState,
                        formInstanceId,
                        effects,
                        bussinessProxyState,
                        submitData,
                        formList
                    });
                    if (result && !result.success) {
                        if (!result.isCancel) {
                            //message.error(result.msg);
                            Modal.error({
                                title: "提交失败",
                                content: result.msg,
                                okText: "确定",
                                onOk() {
                                }
                            });
                        }
                        // if (result.success === false) {
                        //     if (result.msg)
                        //         message.error(result.msg);
                        yield effects.put({
                            type: "setSubmitting",
                            formTemplateVersionId,
                            submitting: false
                        });
                        yield effects.put({
                            type: "changeLoading",
                            formTemplateVersionId,
                            formLoading: false,
                            formEnable: true
                        });
                        yield effects.put({
                            type: "saveSubmitComplete",
                            submitFormData,
                            formTemplateVersionId
                        });

                        //取消之后重置所有beforeSave状态
                        let { bussinessProxyState } = yield effects.select(state => {
                            let formState = state.formRender.all[formTemplateVersionId];
                            return {
                                bussinessProxyState: formState.get("bussinessProxyState").toJS()
                            };
                        });
                        yield effects.put({
                            type: "setOtherBussinessProxyState",
                            formTemplateVersionId,
                            bussinessProxyState,
                            changeObj: {
                                SubmitForConfirmation: false
                            }
                        });
                        return;
                    }
                    //业务组件提交onSubmit
                    for (let businessKey of bussinessComponentsList) {
                        let bussinessComponent = bussinessComponents.find(a => a.key === businessKey);
                        if (bussinessComponent && bussinessComponent.onSubmit instanceof Function) {
                            let currentProxyState = bussinessProxyState.find(a => a.key === businessKey);
                            try {
                                let result = yield effects.call(bussinessComponent.onSubmit,
                                    {
                                        params: submitKey === businessKey ? params.params : null,
                                        proxyState: currentProxyState.proxyState,
                                        bussinessComponentsList,
                                        getOtherBussinessProxyState,
                                        submitData,
                                        formInstanceId,
                                        formList,
                                        query,
                                        setProxyState: setProxyState.bind(null, businessKey, formTemplateVersionId),
                                        submitFormData
                                    });
                                if (result && !result.success) {
                                    if (!result.isCancel) {
                                        //message.error(result.msg);
                                        Modal.error({
                                            title: "提交失败",
                                            content: result.msg,
                                            onOk() {
                                            }
                                        });
                                    }
                                    yield effects.put({
                                        type: "setSubmitting",
                                        formTemplateVersionId,
                                        submitting: false
                                    });
                                    yield effects.put({
                                        type: "changeLoading",
                                        formTemplateVersionId,
                                        formLoading: false,
                                        formEnable: true
                                    });
                                    yield effects.put({
                                        type: "saveSubmitComplete",
                                        formTemplateVersionId,
                                        submitFormData
                                    });
                                    return;
                                }
                            }
                            catch (e) {
                            }

                        }
                    }
                } else {
                    //只执行暂存逻辑
                    for (let businessKey of bussinessComponentsList) {
                        let bussinessComponent = bussinessComponents.find(a => a.key === businessKey);
                        if (bussinessComponent && bussinessComponent.onTempSave instanceof Function) {
                            let currentProxyState = bussinessProxyState.find(a => a.key === businessKey);
                            try {
                                let result = yield effects.call(bussinessComponent.onTempSave,
                                    {
                                        params: submitKey === businessKey ? params.params : null,
                                        proxyState: currentProxyState.proxyState,
                                        getOtherBussinessProxyState,
                                        submitData,
                                        formInstanceId,
                                        formList,
                                        query,
                                        setProxyState: setProxyState.bind(null, businessKey, formTemplateVersionId)
                                    });
                                if (result && !result.success) {
                                    message.error(result.msg);
                                    yield effects.put({
                                        type: "setSubmitting",
                                        formTemplateVersionId,
                                        submitting: false
                                    });
                                    yield effects.put({
                                        type: "changeLoading",
                                        formTemplateVersionId,
                                        formLoading: false,
                                        formEnable: true
                                    });
                                    yield effects.put({
                                        type: "saveSubmitComplete",
                                        formTemplateVersionId,
                                        submitFormData
                                    });
                                    return;
                                }
                            }
                            catch (e) {
                                console.log(e);
                            }
                        }
                    }
                }
                message.success(tempSave ? "保存成功" : "提交成功");
                if (onCompleted instanceof Function)
                    onCompleted();
                // yield effects.put({
                //     type: "submitComplete",
                //     formTemplateVersionId
                // });
                yield effects.put({
                    type: "setSubmitKey",
                    submitKey: null
                });
            }
            else {
                if (!formValidate)
                    message.error(formSubmitVerificationMsg || "校验失败，请检查表单数据！");
                else
                    message.error("校验失败，请检查表单数据！");
                formEnable = true;
            }
            yield effects.put({
                type: "setSubmitting",
                formTemplateVersionId,
                submitting: false
            });
            yield effects.put({
                type: "changeLoading",
                formTemplateVersionId,
                formLoading: false,
                formEnable
            });
        },
        * triggerBussinessButton(action, effects) {
            let { formTemplateVersionId, submitKey, params, setProxyState, query, getOtherBussinessProxyState } = action;
            let oldProxyStateList = yield effects.select(state => state.formRender.all[formTemplateVersionId].get("bussinessProxyState").toJS()
            );
            let bussinessComponent = bussinessComponents.find(a => a.key === submitKey);
            if (bussinessComponent && bussinessComponent.onClick instanceof Function) {
                let proxyState = oldProxyStateList.find(a => a.key === submitKey);
                let oldProxyState = proxyState;
                const setProxyState = (state) => {
                    proxyState = {
                        key: submitKey,
                        proxyState: {
                            ...proxyState.proxyState, ...state
                        }
                    };
                };
                yield effects.call(bussinessComponent.onClick,
                    {
                        params: params.params,
                        proxyState: proxyState.proxyState,
                        getOtherBussinessProxyState,
                        setProxyState,
                        query
                    });
                if (!Object.is(oldProxyState, proxyState)) {
                    yield effects.put({
                        type: "updateProxyState",
                        formTemplateVersionId,
                        proxyStateList: [proxyState]
                    });
                }
            }
        },
        * getFormData(action, effects) {
            let { formTemplateVersionId, onSuccess } = action;
            if (onSuccess instanceof Function) {
                let {
                    //formProperties, rootFormId, bussinessComponentsList, bussinessProxyState,
                    formList, formBody, proxyPool, formStatus, oldValues, rootContainer,
                    formInstanceId
                }
                    = yield effects.select(state => {
                    let formState = state.formRender.all[formTemplateVersionId];
                    return {
                        formStatus: formState.get("formStatus"),
                        rootContainer: formState.get("rootContainer"),
                        oldValues: formState.get("oldValues").toJS(),
                        //formProperties: formState.get("formProperties").toJS(),
                        formBody: formState.get("formBody").toJS(),
                        proxyPool: formState.get("proxyPool").toJS(),
                        formInstanceId: formState.get("instId"),
                        formList: formState.get("formList").toJS()
                        //rootFormId: formState.get("rootFormId"),
                        //bussinessComponentsList: formState.get("bussinessComponentsList").toJS(),
                        //bussinessProxyState: formState.get("bussinessProxyState").toJS(),
                        //serialNumSeedActionRequest: formState.get("serialNumSeedActionRequest")
                    };
                });
                let submitData = yield effects.call(buildSubmitFormData, {
                    formBody,
                    oldValues,
                    formTemplateVersionId,
                    formInstanceId,
                    rootContainer,
                    formStatus,
                    proxyPool,
                    originalValue: true
                });
                submitData.forEach(item => {
                    if (item.value instanceof Date) {
                        item.value = moment(item.value).format("YYYY-MM-DD HH:mm:ss");
                    }
                });
                onSuccess.call(null, { submitData, formInstanceId, formList });
            }
        },
        * getOtherBussinessProxyState(action, effects) {
            let { formTemplateVersionId, onSuccess, businessKey } = action;
            if (onSuccess instanceof Function) {
                let { bussinessProxyState } = yield effects.select(state => {
                    let formState = state.formRender.all[formTemplateVersionId];
                    return {
                        bussinessProxyState: formState.get("bussinessProxyState").toJS()
                    };
                });
                let exist = bussinessProxyState.find(a => a.key === businessKey);
                if (exist)
                    onSuccess.call(null, { otherProxyState: exist.proxyState });
                else
                    onSuccess.call(null, { otherProxyState: {} });
            }
        },
        linkBussinessLinker: [function* (effects) {
            yield effects.takeEvery("formRender/setValue", function* (action) {
                let { list, formTemplateVersionId } = action;
                list = list.filter(a => a.items.length > 0);
                let { bussinessLinker, formBody, controlExtra, proxyPool, bussinessComSetting } = yield effects.select(state =>
                    ({
                        bussinessLinker: state.formRender.all[formTemplateVersionId].get("bussinessLinker").toJS(),
                        formBody: state.formRender.all[formTemplateVersionId].get("formBody"),
                        controlExtra: state.formRender.controlExtra,
                        proxyPool: state.formRender.all[formTemplateVersionId].get("proxyPool").toJS(),
                        bussinessComSetting: state.formRender.all[formTemplateVersionId].getIn(["formProperties", "bussinessComSetting"]) ? state.formRender.all[formTemplateVersionId].getIn(["formProperties", "bussinessComSetting"]).toJS() : []
                    }));
                for (let itemList of list) {
                    let proxyIndex = itemList.proxyIndex;
                    if (proxyIndex < 0) {
                        for (let item of itemList.items) {
                            if (item.data.value && Array.isArray(bussinessLinker[item.id])) {
                                let formItem = formBody.find(a => a.get("id") === item.id);
                                yield effects.call(linkBussinComponents, {
                                    effects,
                                    bussinessComSetting,
                                    proxyIndex,
                                    formBody,
                                    proxyPool,
                                    list: bussinessLinker[item.id],
                                    formItem,
                                    controlExtra,
                                    data: [item.data.value],
                                    formTemplateVersionId
                                });
                            }
                        }
                    }
                    else {
                        let parent = getFormContainerByContainerId(
                            formBody.find(a => a.get("id") === itemList.items[0].id).get("container"),
                            formBody
                        );
                        let parentProxyData = [];
                        if (parent.has("proxyEvents")) {
                            if (parent.getIn(["proxyEvents", "onLinkGet"]) instanceof Function) {
                                parentProxyData = parent.getIn(["proxyEvents", "onLinkGet"]).call(null, {
                                    proxy: proxyPool[parent.get("id")]
                                });
                            }
                            for (let item of itemList.items) {
                                if (item.data.value && Array.isArray(bussinessLinker[item.id])) {
                                    let formItem = formBody.find(a => a.get("id") === item.id);
                                    yield effects.call(linkBussinComponents, {
                                        effects,
                                        bussinessComSetting,
                                        proxyIndex,
                                        proxyPool,
                                        formBody,
                                        list: bussinessLinker[item.id],
                                        formItem,
                                        controlExtra,
                                        data: parentProxyData.map(a => a[item.id].value),
                                        formTemplateVersionId
                                    });
                                }
                            }
                        }

                    }
                }
            });
        }, { type: "watcher" }],
        watchSetProxy: [
            function* (effects) {
                while (true) {
                    try {
                        let { formTemplateVersionId, id } = yield effects.take("setProxy");
                        let { bussinessLinker, formBody, controlExtra, proxyPool, bussinessComSetting, checker } = yield effects.select(state =>
                            ({
                                bussinessLinker: state.formRender.all[formTemplateVersionId].get("bussinessLinker").toJS(),
                                formBody: state.formRender.all[formTemplateVersionId].get("formBody"),
                                controlExtra: state.formRender.controlExtra,
                                proxyPool: state.formRender.all[formTemplateVersionId].get("proxyPool").toJS(),
                                bussinessComSetting: state.formRender.all[formTemplateVersionId].getIn(["formProperties", "bussinessComSetting"]).toJS(),
                                checker: state.formRender.all[formTemplateVersionId].getIn(["proxyChecker", id])
                            })
                        );
                        let proxyItem = formBody.find(a => a.get("id") === id);
                        let currentProxyLinkData = proxyItem.getIn(["proxyEvents", "onLinkGet"])({ proxy: proxyPool[id] });
                        if (currentProxyLinkData.length !== checker) {
                            let allIds = getAllChildren(id, formBody.toJS()).map(a => a.id);
                            for (let id of allIds) {
                                let formItem = formBody.find(a => a.get("id") === id);
                                if (formItem && Array.isArray(bussinessLinker[id])) {
                                    yield effects.call(linkBussinComponents, {
                                        effects,
                                        bussinessComSetting,
                                        formItem,
                                        formBody,
                                        controlExtra,
                                        list: bussinessLinker[id],
                                        data: currentProxyLinkData.map(a => {
                                            if (a[id])
                                                return a[id].value;
                                            return null;
                                        }),
                                        formTemplateVersionId
                                    });
                                }
                            }
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            },
            { type: "watcher" }
        ]
    },
    reducers: {
        ...reducers(FORMRENDERSTYLE.PC),
        initBussinessComponentsInfo(state, action) {
            let { formTemplateVersionId, proxyStateList, permissionList, submitInfoList, componentList, watcherList, bussinessComponentsList } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            all[formTemplateVersionId] = formState
                .set("bussinessProxyState", fromJS(proxyStateList))
                .set("bussinessPermission", permissionList)
                .set("bussinessComponents", fromJS(componentList))
                .set("bussinessSubmitInfo", submitInfoList)
                .set("bussinessComponentsList", fromJS(bussinessComponentsList));
            return {
                ...state,
                all
            };
        },
        setSubmitting(state, action) {
            return setFormData(action, state, "submitting");
        },
        // setSubmitKey(state, action) {
        //     return setFormData(action, state, 'submitKey');
        // },
        setFormStatus(state, action) {
            return setFormData(action, state, "formStatus");
        },
        setLoadForm(state, action) {
            let {
                formTemplateVersionId, formBody, formList, dataLinker, proxyPool, formProperties, validateRelations,
                formTitle, formStatus, rootFormId, rootContainer, isUsed, formTemplateId, serialNumSeedActionRequest,
                viewCode, moduleId, formVersion, instId, publishStatus, showFields, operationPermission,
                //bussinessComponentsList,
                formTemplateType, workFlowId
            } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            all[formTemplateVersionId] = formState
                .set("loaded", true)
                .set("rootContainer", rootContainer)
                .set("rootFormId", rootFormId)
                .set("formStatus", formStatus)
                .set("formList", fromJS(formList))
                .set("formTemplateVersionId", formTemplateVersionId)
                .set("formTitle", formTitle)
                //.set('bussinessComponentsList', bussinessComponentsList)
                .set("workFlowId", workFlowId)
                .set("operationPermission", fromJS(operationPermission))
                .set("publishStatus", publishStatus)
                .set("formTemplateId", formTemplateId)
                .set("validateRelations", fromJS(validateRelations))
                .set("instId", instId)
                .set("oldValues", fromJS([]))
                .set("isUsed", isUsed)
                .set("dataLinker", fromJS(dataLinker))
                .set("formBody", formBody)
                .set("proxyPool", proxyPool)
                .set("formProperties", fromJS(formProperties))
                .set("serialNumSeedActionRequest", serialNumSeedActionRequest)
                .set("viewCode", viewCode) //视图名称
                .set("moduleId", moduleId)
                .set("showFields", showFields)
                .set("bussinessLinker", fromJS({}))
                .set("formVersion", formVersion);
            return {
                ...state,
                all
            };
        },
        endLoadForm(state, action) {
            return setFormData(action, state, "formEnable");
        },
        setOtherBussinessProxyState(state, action) {
            let { formTemplateVersionId, bussinessProxyState, businessKey, changeObj } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            if (businessKey) {
                bussinessProxyState.map(a => {
                    if (a.key === businessKey) {
                        Object.keys(changeObj).map((b, i) => {
                            a.proxyState[b] = Object.values(changeObj)[i];
                        });
                    }
                });
            } else {
                bussinessProxyState.map(a => {
                    Object.keys(changeObj).map((b, i) => {
                        a.proxyState[b] = Object.values(changeObj)[i];
                    });
                });
            }
            all[formTemplateVersionId] = formState
                .set("bussinessProxyState", fromJS(bussinessProxyState));
            return { ...state, all };
        },
        setBussinessProxyState(state, action) {
            let { formTemplateVersionId, key, proxyState } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let proxyStateList = formState.get("proxyStateList") || fromJS([]);
            proxyStateList = proxyStateList.push(proxyState);
            all[formTemplateVersionId] = formState.set("proxyStateList", proxyStateList);
            return {
                ...state,
                all
            };
        },
        updateBussinessProxyState(state, action) {
            let { formTemplateVersionId, key, newState } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let bussinessProxyState = formState.get("bussinessProxyState");
            let current = bussinessProxyState.find(a => a.get("key") === key);
            let index = bussinessProxyState.indexOf(current);
            bussinessProxyState = bussinessProxyState.set(index, current.set("proxyState", current.get("proxyState").merge(fromJS(newState))));
            all[formTemplateVersionId] = formState.set("bussinessProxyState", bussinessProxyState);
            return {
                ...state,
                all
            };
        },
        setBussinessPermission(state, action) {
            let { formTemplateVersionId, key, permission } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let permissionList = formState.get("permissionList") || fromJS([]);
            permissionList = proxyStateList.push(permission);
            all[formTemplateVersionId] = formState.set("permissionList", permissionList);
            return {
                ...state,
                all
            };
        },
        saveSubmitComplete(state, action) {
            let { formTemplateVersionId, submitFormData } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let primaryKeyItem = formBody.find(a => a.get("container") === formState.get("rootContainer") && a.get("controlType") === ControlType.PrimaryKey);
            let index = formBody.indexOf(primaryKeyItem);
            formBody = formBody.set(index, primaryKeyItem.setIn(["itemBase", "value"], submitFormData[0].primaryKeyValue));
            submitFormData.find(a => a.code === primaryKeyItem.get("code")).value = submitFormData[0].primaryKeyValue;
            all[formTemplateVersionId] = formState.set("oldValues", fromJS(submitFormData))
                .set("formStatus", FORMSTATUS.NoChange)
                .set("formBody", formBody);
            return {
                ...state,
                all
            };
        },
        setBussinessSubmitInfo(state, action) {
            let { formTemplateVersionId, key, submitInfo } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let submitInfoList = formState.get("submitInfoList") || fromJS([]);
            submitInfoList = proxyStateList.push(submitInfo);
            all[formTemplateVersionId] = formState.set("submitInfoList", submitInfoList);
            return {
                ...state,
                all
            };
        },
        setFormMirror(state, action) {
            let { instId, oldValues, formTemplateVersionId } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            formState = formState.set("oldValues", fromJS(oldValues)).set("instId", instId);
            all[formTemplateVersionId] = formState;
            return {
                ...state,
                all
            };
        },
        changeLoading(state, action) {
            let { formLoading, formTemplateVersionId, formEnable } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            formState = formState.set("formLoading", formLoading);
            // if (formLoading === true)
            //     formState = formState.set("formEnable", false);
            if (formEnable !== undefined)
                formState = formState.set("formEnable", formEnable);
            else
                formState = formState.set("formEnable", !formLoading);
            all[formTemplateVersionId] = formState;
            return {
                ...state,
                all
            };
        },
        BtnDisabled(state, action) {
            let { BtnDisabled, formTemplateVersionId } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            formState = formState.set("BtnDisabled", BtnDisabled);
            all[formTemplateVersionId] = formState;
            return {
                ...state,
                all
            };
        },
        updateProxyState(state, action) {
            let { formTemplateVersionId, proxyStateList } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let bussinessProxyState = formState.get("bussinessProxyState").toJS();
            let newKeys = proxyStateList.map(a => a.key);
            bussinessProxyState = fromJS(bussinessProxyState.filter(a => !newKeys.includes(a.key)).concat(proxyStateList));
            all[formTemplateVersionId] = formState.set("bussinessProxyState", bussinessProxyState);
            return {
                ...state,
                all
            };
        },
        updatePermission(state, action) {
            let { formTemplateVersionId, permissionList } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody").toJS();
            formBody = injectFieldsPermissionWithBussiness({
                formBody,
                permissionList
            });

            // //流程控制的是否必填
            // let baseRequiredItems = formBody.filter(a => a.itemType !== "Root" && buildControlAuthority(a.authority).required === true);
            // //处理流程传递过来的必填项
            // if (baseRequiredItems) {
            //     formBody.map(a => {
            //         baseRequiredItems.map(b => {
            //             if (a.id === b.id) {
            //                 a.itemBase.required = true;
            //             }
            //         });
            //
            //     });
            // }
            all[formTemplateVersionId] = formState.set("formBody", fromJS(formBody)).set("renderList", fromJS(formBody.map(a => a.id)));
            return {
                ...state,
                all
            };
        },
        setOperationPermission(state, action) {
            let { formTemplateVersionId, operationPermission, fieldsPermission } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            all[formTemplateVersionId] = formState
                .set("operationPermission", fromJS(operationPermission))
                .set("showFields", fromJS(fieldsPermission.show));
            return {
                ...state,
                all
            };
        },
        updateSubmitInfo(state, action) {
            let { formTemplateVersionId, submitInfoList } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let bussinessSubmitInfo = formState.get("bussinessSubmitInfo");
            let newKeys = submitInfoList.map(a => a.key);
            bussinessSubmitInfo = bussinessSubmitInfo.filter(a => !newKeys.includes(a.key)).concat(submitInfoList);
            all[formTemplateVersionId] = formState.set("bussinessSubmitInfo", bussinessSubmitInfo);
            return {
                ...state,
                all
            };
        },
        updateBussinessLinker(state, action) {
            let { formTemplateVersionId, bussinessLinkerList } = action;
            let bussinessLinker = {};
            let all = state.all;
            let formState = all[formTemplateVersionId];
            bussinessLinkerList.forEach(item => {
                let key = item.key;
                item.list.forEach(id => {
                    if (bussinessLinker[id] === undefined)
                        bussinessLinker[id] = [];
                    bussinessLinker[id].push(key);
                });
            });
            all[formTemplateVersionId] = formState.set("bussinessLinker", fromJS(bussinessLinker));
            return {
                ...state,
                all
            };
        },
        endLoadBussinessComponents(state) {
            return state;
        },
        submitComplete(state, action) {
            return state;
        }
    }
};

/*
beginloadform effect ------------ loadform reducer
watch beginloadform--------------beginloadFormPermission effects---------------  setFormPermission reducer
watch beginloadform ------------- registerBussinessComponents effect------------ setBussinessComponentsInfo reducer
                                                                                 all[setFormPermission   setBussinessComponentsInfo ]------------setpermission
                                                                                                                                     ------------setBussinessComponents
                                                                                                                                     ------------setSubmitInfo
                                  watch loadform---------- loadformvalue effect-------------buildFormValueModel effect ---------- setFormMirror reducer
                                                                                                                        ----------setValue reducer



请求获取表单模板
同时开始初始化业务组件
同时开始获取表单引擎内部权限
    获取到fetch数据
        开始构建formBody
        同时开始判断是否有instId，如果有，加载表单数据
当业务组件和内部权限获取全部完成后，开始向formBody注入权限
同时业务组件完成后 开始注入提交信息和外挂组件
获取到表单数据后，开始构建formDataModel
*/
