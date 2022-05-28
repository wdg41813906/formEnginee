import _ from "underscore";
import { message } from "antd";
import { fromJS } from "immutable";
import FormDragSource from "../../components/HOC/FormDragSource";
import FormSortDrop from "../../components/HOC/FormSortDrop";
import com from "../../utils/com";
import FORMSTATUS from "../../enums/FormStatus";
import FORMRENDERSTYLE from "../../enums/FormRenderStyle";
import FormControlType from "../../enums/FormControlType";
import ControlStatus from "../../enums/FormControlStatus";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import ControlType from "../../enums/ControlType";
import {
    save,
    detail,
    //getAllFormTemplate,
    GetSerialNumSeed,
    getAllThirdParty,
    getAllWithValide
} from "../../services/FormBuilder/FormBuilder";
import { publishForm, getUserFuncs } from "../../services/FormViewList/FormViewList";
import { initDataLinker, LINKTYPE } from "../../components/FormControl/DataLinker/DataLinker";
import {
    initProxyPool,
    setFormProxy,
    getAllDelegateAttr,
    initFormItem,
    initProxyItemWithPool,
    effects,
    reducers,
    getAllDelegateParents,
    ControlTypeTransf,
    FormControlList,
    getFormContainerByContainerId,
    initControlExtra,
    linkFormData,
    buildLinkFormList,
    initTableLinker,
    buildFormBody
} from "commonForm";
import FormContainerBase, { formContainerBaseInitialEvent } from "../../components/FormControl/FormContainerBase";
import FormGroupBase, { formGroupBaseInitialEvent } from "../../components/FormControl/FormGroupBase";
import FormItemBase, { formItemBaseInitialEvent } from "../../components/FormControl/FormItemBase";
import FormExternalBase, { formExternalBaseInitialEvent } from "../../components/FormControl/FormExternalBase";
import FormMarkBase, { formMarkBaseInitialEvent } from "../../components/FormControl/FormMarkBase";
import FORM_TYPE from "../../enums/FormType";
import { initValidateRelations } from "../../components/FormControl/ValidateForm";
//控件扩展属性映射
const controlExtraList = ["dropCount", "valueType", "dropItemValueTypes", "formControlType", "event", "dropOnSubForm", "isSubTable"];
const designProps = ["extraExternalOption"];

//获取所有下级控件
function getAllChildren(id, formBody) {
    let l = formBody.filter(a => a.get("container") === id);
    l.forEach(function(a) {
        if (a.get("formControlType") > 0) {
            l = l.concat(getAllChildren(a.get("id"), formBody));
        }
    });
    return l;
}

function getExternalContainer(id, formBody) {
    let container = formBody.find(a => a.get("id") === id);
    //if (container.get('formControlType') !== FormControlType.External)
    if (container.get("isExternal") === true) return getExternalContainer(container.get("container"), formBody);
    return container;
}

function dropCountCheck(formBody, itemType, dropCount) {
    return (
        formBody.filter(
            a => a.get("itemType") === itemType && a.get("status") !== FORMSTATUS.Delete && a.get("isExternal") !== true
        ).size >= dropCount
    );
}

//构建表单关系配置
let FormRelation = [];

function BuildSaveData(BuildContactData, currentFormData, formTemplateVersionId) {
    if (BuildContactData) {
        BuildContactData.forEach(a => {
            currentFormData.forEach(b => {
                if (a.pid === b.formId && b.name.indexOf(`PrimaryKey`) !== -1) {
                    FormRelation.push({
                        ParentFormId: a.pid,
                        ParentFormVersionHistoryId: b.id,
                        ChildFormId: a.formId,
                        ChildFormVersionHistoryId: null,
                        FormTemplateVersionId: formTemplateVersionId,
                        id: com.Guid(),
                        operationStatus: FORMSTATUS.Add// 操作类型：0删除，1新增，2修改，3默认
                    });
                }
            });
            if (a.children) {
                BuildSaveData(a.children, currentFormData, formTemplateVersionId);
            }
        });
        return FormRelation;
    } else {
        return [];
    }

}


//移除表单项
function delFormItem(c, formState) {
    let formBody = formState.get("formBody");
    let parent = formBody.find(a => a.get("id") === c.get("container"));
    let pindex = formBody.indexOf(parent);
    formBody = formBody.set(
        pindex,
        parent.set("status", parent.get("status") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify)
    );
    formState = formState.set("formBody", formBody);
    if (c.get("isExternal") === true) {
        let externalContainer = formBody.find(a => a.get("id") === c.get("container"));
        let externalSubForm;
        if (externalContainer.get("isSubTable") === true) {
            externalSubForm = externalContainer;
            if (externalSubForm.get("isExternal") === true)
                externalContainer = formBody.find(a => a.get("id") === externalSubForm.get("container"));
            formState = handleMoveItemEvent("onRemoveItem", formState, externalSubForm, c);
            formBody = formState.get("formBody");
            externalSubForm = formBody.find(a => a.get("id") === externalSubForm.get("id"));
        } else if (externalContainer.get("formControlType") !== FormControlType.External)
            externalContainer = getExternalContainer(externalContainer.get("container"), formBody);
        let externalIndex = formBody.indexOf(externalContainer);
        let relationColumns = externalContainer.getIn(["itemBase", "relationColumns"]);
        if (relationColumns) {
            //第三方数据源关联不会有这个
            relationColumns = relationColumns.filter(a => a.get("id") !== c.getIn(["itemBase", "externalId"]));
            externalContainer = externalContainer.setIn(["itemBase", "relationColumns"], relationColumns);
        }
        formBody = formBody.set(externalIndex, externalContainer);
        formState = formState.set("formBody", formBody);
        //子表代理容器字段少于1时，移除代理容器
        if (
            externalSubForm &&
            externalSubForm.get("isExternal") === true &&
            formBody.filter(
                a => a.get("container") === externalSubForm.get("id") && a.get("status") !== FORMSTATUS.Delete
            ).size < 4
        ) {
            formState = delFormItem(externalSubForm, formState);
            return formState;
        }
    }
    formBody = formState.get("formBody");
    c = formBody.find(a => a.get("id") === c.get("id"));
    if (c.get("formControlType") > 0) {
        let list = fromJS(getAllChildren(c.get("id"), formBody));
        let addList = list.filter(a => a.get("status") === FORMSTATUS.Add);
        let modifyList = list.filter(
            a => a.get("status") === FORMSTATUS.Modify || a.get("status") === FORMSTATUS.NoChange
        );
        formBody = formBody.filter(a => !addList.includes(a));
        modifyList.forEach(a => {
            let index = formBody.indexOf(a);
            formBody = formBody.setIn([index, "status"], FORMSTATUS.Delete);
        });
        //如果是有formId的容器，则同时需要删除其对应的form
        if (c.hasIn(["itemBase", "formId"])) {
            let formList = formState.get("formList");
            let formItem = formList.find(a => a.get("id") === c.getIn(["itemBase", "formId"]));
            if (formItem) {
                let index = formList.indexOf(formItem);
                let operationStatus = formItem.get("operationStatus");
                if (operationStatus === FORMSTATUS.Add)
                    formList = formList.delete(index);
                else
                    formList = formList.set(index, formItem.set("operationStatus", FORMSTATUS.Delete));
                formState = formState.set("formList", formList);
            }
        }
    }
    let fidx = formBody.indexOf(c);
    if (c.get("status") === FORMSTATUS.Add) {
        formBody = formBody.delete(fidx);
    } else {
        formBody = formBody.setIn([fidx, "status"], FORMSTATUS.Delete);
    }
    return formState.set("formBody", formBody);
}

//控件分组
const filterLeftList = (list, type) => {
    return list
        .filter(e => e.group === type)
        .map(function(C, i) {
            return {
                Component: FormDragSource(C.name, C.ico)(),
                itemType: C.itemType,
                valueType: C.valueType,
                formControlType: C.formControlType
                //dropItemValueTypes: C.dropItemValueTypes
            };
        });
};

//触发容器控件添加/移除事件
function handleMoveItemEvent(event, formState, container, item, groupId) {
    console.log(event, formState.toJS(), groupId);
    let index = formState.get("formBody").indexOf(container);
    container = container.set(
        "status",
        container.get("status") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify
    );
    formState = formState.setIn(["formBody", index], container);
    if (container.getIn(["event", event]) instanceof Function) {
        let { proxy: proxyData, containerBase, itemBase } = container.getIn(["event", event]).call(null, {
            containerBase: {
                ...container.get("itemBase").toJS(),
                id: container.get("id"),
                groupId
            },
            itemBase: { ...item.get("itemBase").toJS(), id: item.get("id"), valueType: item.get("valueType") },
            proxy: container.get("proxy") ? formState.getIn(["proxyPool", container.get("id")]).toJS() : null
        });
        if (container.has("proxy") && proxyData) {
            formState = setFormProxy(formState, { /* ...action,  */ proxyData, id: container.get("id") });
        }
        //合并containerBase
        if (containerBase instanceof Object && Object.keys(containerBase).length > 0) {
            formState = formState.setIn(
                ["formBody", index],
                container.set("itemBase", container.get("itemBase").merge(fromJS(containerBase)))
            );
        }
        //合并itemBase
        if (itemBase instanceof Object && Object.keys(containerBase).length > 0) {
            let itemIndex = formState.get("formBody").indexOf(item);
            formState = formState.setIn(
                ["formBody", itemIndex],
                item.set("itemBase", item.get("itemBase").merge(fromJS(itemBase)))
            );
        }
        // //如果新容器被代理，则冒泡触发onAddItem至顶层代理控件
        // if (container.get('delegate')) {
        //     let parent = formState.get('formBody').find(a => a.get('id') === container.get('container'));
        //     debugger
        //     formState = handleMoveItemEvent(event, formState, parent, item);
        // }
    }
    console.log(event, "finish", formState.toJS());
    return formState;
}

//获取所有容器
function getAllContainers(id, list) {
    let result = [id];
    let childrenContainers = list.filter(a => a.get("container") === id && a.get("formControlType") > 0);
    childrenContainers.forEach(a => {
        result = result.concat(getAllContainers(a.get("id"), list));
    });
    return result;
}

//修改控件的选中状态
function changeSelect(id, formBody, select) {
    let item = formBody.find(a => a.get("id") === id);
    if (item) {
        let index = formBody.indexOf(item);
        formBody = formBody.set(index, item.set("select", select));
        return formBody;
    }
    return formBody;
}

//添加表键
function addTableSystemItem(container, formId, formBody, itemType, id, itemBase, noMappad = false) {
    return formBody.push(
        fromJS({
            id,
            dataLinker: [],
            itemType,
            container,
            formId,
            controlType: ControlTypeTransf(itemType),
            status: FORMSTATUS.Add,
            formControlType: FormControlType.System,
            controlStatus: ControlStatus.Static,
            authority: { hidden: { system: true }, disabled: {} },
            isHide: true,
            noMappad,
            itemBase: { name: itemType, ...itemBase }
        })
    );
}

//添加表form
function addTableForm(item, formList) {
    return formList.push(
        fromJS({
            id: item.itemBase.formId,
            name: item.itemBase.name,
            formType: 1,
            areaId: item.id,
            sortIndex: item.order,
            property: "{}",
            //isUsed,
            operationStatus: item.status,
            isCreatedForm: item.isExternal !== true
        })
    );
}

//对表单项进行排序，主外键等系统类型字段不参与排序，根据排序是否变动进行operationStatus的修改
function orderFormBody(formBody) {
    debugger
    let result = formBody.filter(
        a =>
            a.get("controlType") > 99 ||
            a.get("controlType") < 0 ||
            a.get("status") === FORMSTATUS.Delete ||
            a.get("container") === undefined
    );
    let gp = _.groupBy(
        formBody
            .filter(a => a.get("container") !== undefined && a.get("controlType") > -1
                && a.get("controlType") < 100 && a.get("status") !== FORMSTATUS.Delete)
            .toJSON(),
        a => a.get("container")
    );
    Object.keys(gp).forEach(key => {
        gp[key].forEach((item, o) => {
            if (item.get("order") !== o + 1) {
                result = result.push(
                    item
                        .set("order", o + 1)
                        .set("status", item.get("status") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify)
                );
            } else {
                result = result.push(item);
            }
        });
    });
    return result;
}

//构建数据联动外键
function buildLinkerForeignKey(formVersionHistoryId, currentColumnName, foreignKey, formBody) {
    let primaryForm = getFormContainerByContainerId(
        formBody.find(a => a.get("id") === formVersionHistoryId).get("container"),
        formBody
    );
    return {
        ...foreignKey,
        formVersionHistoryId,
        formId: primaryForm.getIn(["itemBase", "formId"]),
        formName: primaryForm.getIn(["itemBase", "name"]),
        currentColumnName,
        // DisplayFormId: displayForm.getIn(['itemBase', 'formId']),
        // DisplayFormName: displayForm.getIn(['itemBase', 'name']),
        //id: com.Guid(),
        operationStatus: FORMSTATUS.Add
    };
}

function buildForeignKeys(formBody, oldForeignKeys, isUpdateVersion) {
    let foreignKeys = [];
    let subTables = formBody.filter(
        a => a.get("isSubTable") === true && a.get("itemType") !== "Root" && a.get("noMappad") !== true &&
            a.get("status") !== FORMSTATUS.Delete
    );
    //子表构建外键关联
    subTables.forEach(a => {
        if (isUpdateVersion) {
            let index = formBody.indexOf(a);
            a = a.setIn(["itemBase", "formForeignKeyId"], com.Guid());
            formBody = formBody.set(index, a);
        }
        foreignKeys = addTableForeignkey(
            a,
            a.get("container"),
            a.getIn(["itemBase", "formForeignKeyId"]),
            formBody.filter(a => a.get("status") !== FORMSTATUS.Delete),
            foreignKeys,
            isUpdateVersion
        );
    });
    //数据联动/关联类控件构建外键关联
    let filter = a =>
        (a.get("linkType") === LINKTYPE.Linker || a.get("linkType") === LINKTYPE.External) &&
        a.get("persisted") === true;
    let linkerItems = formBody.filter(a => a.has("dataLinker") && a.get("dataLinker").some(filter));
    linkerItems.forEach(item => {
        let foreignLinker = item.get("dataLinker").filter(filter);
        let foreignItem =
            item.get("formControlType") === FormControlType.Item
                ? item
                : formBody.find(
                a =>
                    a.get("container") === item.get("id") &&
                    a.get("controlType") === ControlType.ForeignKey &&
                    a.getIn(["itemBase", "name"]) === "ForeignKey"
                );
        let foreignItemId = foreignItem.get("id");
        let foreignItemCode = foreignItem.get("code") || "";
        foreignLinker.forEach(item => {
            item.get("foreignKeys").forEach(key => {
                let item = buildLinkerForeignKey(foreignItemId, foreignItemCode, key.toJS(), formBody);
                foreignKeys.push(item);
            });
        });
    });
    let delkeys = oldForeignKeys.filter(a => !foreignKeys.some(b => b.id === a.id));
    let addkeys = foreignKeys.filter(a => !oldForeignKeys.some(b => b.id === a.id));
    delkeys.forEach(a => {
        a.operationStatus = FORMSTATUS.Delete;
    });
    let newForeignKeys = oldForeignKeys
        .filter(a => !delkeys.includes(a))
        .concat(addkeys)
        .map(a => {
            let b = Object.assign({}, { ...a, operationStatus: FORMSTATUS.NoChange });
            return b;
        });
    return { submitKeys: delkeys.concat(addkeys), newForeignKeys, formBody };
}

//添加表关联
function addTableForeignkey(item, container, id, formBody, foreignKeys, isUpdateVersion) {
    let formContainer = getFormContainerByContainerId(container, formBody);
    return buildTableForeignkey({
        id,
        discription: "",

        primaryFormId: item.getIn(["itemBase", "formId"]),
        primaryFormName: item.getIn(["itemBase", "name"]),
        primaryHistoryId: formBody
            .find(
                a =>
                    a.get("container") === item.get("id") &&
                    a.get("controlType") === ControlType.ForeignKey &&
                    a.get("itemType") === "ForeignKey"
            )
            .get("id"),
        primaryColName: "",

        foreignFormId: formContainer.getIn(["itemBase", "formId"]),
        foreignFormName: formContainer.getIn(["itemBase", "name"]),
        foreignHistoryId: formBody
            .find(
                a =>
                    a.get("container") === formContainer.get("id") &&
                    a.get("controlType") === ControlType.PrimaryKey &&
                    a.get("itemType") === "PrimaryKey"
            )
            .get("id"),
        foreignColName: "",
        foreignKeys,
        operationStatus: isUpdateVersion ? FORMSTATUS.Add : item.get("status")
    });
}

function buildTableForeignkey({
                                  primaryFormId,
                                  primaryFormName,
                                  primaryHistoryId,
                                  primaryColName,
                                  foreignFormId,
                                  foreignFormName,
                                  foreignHistoryId,
                                  foreignColName,
                                  displayFormId,
                                  displayFormName,
                                  displayHistoryId,
                                  displayColName,
                                  discription,
                                  operationStatus,
                                  id,
                                  foreignKeys
                              }) {
    let item = {
        //主键
        formId: primaryFormId,
        formName: primaryFormName,
        formVersionHistoryId: primaryHistoryId,
        currentColumnName: primaryColName || "",
        //外键
        foreignFormId: foreignFormId, //外键表单Id,B
        foreignFormName: foreignFormName, //B
        foreignHistoryId: foreignHistoryId, //外键表单版本历史Id
        foreignColumnName: foreignColName,
        //显示字段
        // DisplayFormId: displayFormId || foreignFormId,//C,若没有，则和B相同
        // DisplayFormName: displayFormName || foreignFormName,//C
        // DisplayVersionHistoryId: displayHistoryId || foreignHistoryId,//显示字段Id
        // DisplayName: displayColName || foreignColName,

        //Description: discription || '',//this.props.self.id,
        id,
        operationStatus
    };
    let exist = foreignKeys.find(a => a.id === id);
    if (exist) {
        let index = foreignKeys.indexOf(exist);
        foreignKeys[index] = item;
    } else {
        foreignKeys.push(item);
    }
    return foreignKeys;
}

/**
 * 创建表单项
 * @param {}} id 
 * @param {*} itemType 控件类型
 * @param {*} container 容器id
 * @param {*} formState 表单属性
 * @param {*} wrappedComponent 
 * @param {*} extraProps 
 * @param {*} extraItemBaseProps 
 * @returns 
 */
function buildFormItem(id, itemType, container, formState, wrappedComponent, extraProps, extraItemBaseProps) {
    console.log(FormControlList)
    let controlItem = FormControlList.find(a => a.itemType === itemType);
    if (controlItem) {
        let formProperties = formState.get("formProperties").toJS();
        let item = {
            id,
            itemType,
            Component: wrappedComponent.filter(a => a.itemType === itemType)[0].Component,
            WrappedComponent: initFormItem(controlItem.formControlType, controlItem.Component),
            container,
            status: FORMSTATUS.Add,
            valueType: controlItem.valueType,
            formControlType: controlItem.formControlType,
            controlType: ControlTypeTransf(itemType),
            controlStatus: ControlStatus.Normal,
            authority: { hidden: {}, disabled: {}, readOnly: {} },
            dataLinker: [],
            isExternal: false,
            noMappad: controlItem.noMappad === true,
            renderStyle: formState.get("formRenderStyle"),
            itemBase: { ...controlItem.initFormItemBase(), ...extraItemBaseProps },
            event: controlItem.event || {},
            formLayout: formProperties.formLayout, //1单列,2双列
            formControlStyleModel: formProperties.formControlStyleModel, //表单模式,1水平,2垂直
            border: formProperties.border, //是否显示border,
            ...extraProps
        };
        return item;
    }
    return null;
}

//控件注册
function registFormItem(item, formState, noMappad, exGroupItems) {
    let controlItem = FormControlList.find(a => a.itemType === item.itemType);
    let formBody = formState.get("formBody");
    let rootContainer = formState.get("rootContainer");
    let container = item.container;
    // item.itemBase = { ...item.itemBase, ...controlItem.initFormItemBase() };
    // item.itemBase.name = name;
    for (let key in item.authority) {
        if (item.authority[key].itemBase === true) item.itemBase[key] = true;
    }
    if (item.formControlType > 0) {
        item.layer = formBody.find(a => a.get("id") === container).get("layer") + 1;
    }
    item.formId = getFormContainerByContainerId(container, formBody).getIn(["itemBase", "formId"]);
    item.containerMode = controlItem.containerMode === true;
    switch (item.formControlType) {
        case FormControlType.Container:
            item.isSubTable = controlItem.isSubTable === true;
            item.controlType = ControlType.Container;
            if (item.isSubTable) {
                item.itemBase.formId = com.Guid();
                item.formId = item.itemBase.formId;
                item.itemBase.foreignKeyId = com.Guid();
                item.itemBase.formForeignKeyId = com.Guid();
                item.itemBase.primaryKeyId = com.Guid();
                formBody = addTableSystemItem(item.id, item.itemBase.formId, formBody, "PrimaryKey", item.itemBase.primaryKeyId);
                formBody = addTableSystemItem(item.id, item.itemBase.formId, formBody, "ForeignKey", item.itemBase.foreignKeyId);
                let formList = addTableForm(item, formState.get("formList"));
                formState = formState.set("formBody", formBody).set("formList", formList);
            }
            break;
        case FormControlType.External:
            item.controlType = ControlType.Container;
            item.itemBase.foreignKeyId = com.Guid();
            break;
        case FormControlType.Group: //控件组
            item.controlType = ControlType.Container;
            if (Array.isArray(controlItem.items)) {
                let groupItems = {};
                controlItem.items.forEach(a => {
                    let gId = com.Guid();
                    let authority = Object.assign({}, item.authority);
                    authority.hidden = { ...authority.hidden };
                    //个会导致台账该字段无权限可以查询显示
                    if (a.private === true)
                        authority.hidden.system = true;
                    let groupItem = {
                        id: gId,
                        container: item.id,
                        itemType: "None", //`${itemType}_${a.key}`,
                        authority,
                        dataLinker: [],
                        formId: item.formId,
                        status: FORMSTATUS.Add,
                        formControlType: FormControlType.GroupItem,
                        controlStatus: ControlStatus.GroupItem,
                        controlType: ControlType.None,
                        noMappad: noMappad === true,
                        itemBase: {
                            value: null,
                            name: a.name.replace(/\{name\}/gm, item.itemBase.name),
                            key: a.key,
                            valueType: a.valueType
                        },
                        valueType: a.valueType
                    };
                    if (exGroupItems) {
                        groupItem.isExternal = true;
                        groupItem.itemBase.isExternal = true;
                        groupItem.itemBase.externalId = exGroupItems[a.key].id;
                    }
                    formBody = formBody.push(fromJS(groupItem));
                    groupItems[a.key] = { ...a, id: groupItem.id };
                });
                item.itemBase.groupItems = groupItems;
            }
            break;
        case FormControlType.Item:
            item.itemBase = { ...item.itemBase, ...controlItem.itemBase };
            break;
        default:
            break;
    }
    //代理初始化
    if (controlItem.proxy instanceof Object)
        formState = formState.setIn(["proxyPool", item.id], fromJS(initProxyItemWithPool(item, controlItem)));
    item = fromJS(item);
    formBody = formBody.push(item);
    formState = formState.set("formBody", formBody);
    if (container !== rootContainer) {
        let newContainer = formBody.find(a => a.get("id") === container);
        let idx = formBody.indexOf(newContainer);
        newContainer = newContainer.set(
            "status",
            newContainer.get("status") === FORMSTATUS.NoChange ? FORMSTATUS.Modify : newContainer.get("status")
        );
        formBody = formBody.set(idx, newContainer);
        let index = formBody.indexOf(item);
        if (newContainer.has("proxy")) {
            item = item
                .set("delegate", true)
                .set(
                    "delegateAttr",
                    (item.get("delegateAttr") || fromJS({})).merge(
                        fromJS(getAllDelegateAttr(item, formBody, rootContainer))
                    )
                );
            formBody = formBody.set(index, item);
        }
        formState = formState.set("formBody", formBody);
        let renderList = getAllDelegateParents([], container, formState.get("formBody"), rootContainer);
        //控件额外增加控件事件触发
        formState = handleMoveItemEvent("onAddItem", formState, newContainer, item).set(
            "renderList",
            fromJS(renderList)
        );
    } else {
        let r = formBody.get(0);
        formBody = formBody.set(
            0,
            r.set("status", r.get("status") === FORMSTATUS.NoChange ? FORMSTATUS.Modify : r.get("status"))
        );
        formState = formState.set("formBody", formBody);
    }
    return formState.set(
        "formStatus",
        formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify
    );
}

function getAreaLayer(area, areaList, count = 0) {
    let parent = areaList.find(a => a.id === area.parentId);
    if (parent) {
        return getAreaLayer(parent, areaList, count + 1);
    } else return area.layer + count;
}

//设置控件的formId
function setItemFormId(formId, item, formState) {
    let formBody = formState.get("formBody");
    let index = formBody.indexOf(item);
    item = item.set("formId", formId);
    formBody = formBody.set(index, item);
    formState = formState.set("formBody", formBody);
    formBody
        .filter(a => a.get("container") === item.get("id") && !a.hasIn(["itemBase", "formId"]))
        .forEach(a => {
            formState = setItemFormId(formId, a, formState);
        });
    return formState;
}

//判断是否需要更新formVersion
function checkUpdateVersion(publishStatus, isUsed, updateDataLinker, formBody) {
    // if (publishStatus !== true && isUsed === false)
    //     return false;
    let formCheck =
        formBody.find(a => a.get("status") === FORMSTATUS.Delete || a.get("status") === FORMSTATUS.Add) !== undefined;
    if ((formCheck || updateDataLinker) && isUsed) return true;
    return false;
}

export default {
    namespace: "formBuilder",
    state: {
        leftListGroup: [
            { name: "基础控件", group: filterLeftList(FormControlList, FORM_CONTROLLIST_GROUP.Normal) },
            { name: "高级控件", group: filterLeftList(FormControlList, FORM_CONTROLLIST_GROUP.Advanced) },
            { name: "部门成员控件", group: filterLeftList(FormControlList, FORM_CONTROLLIST_GROUP.Department) }
        ],
        wrappedComponent: FormControlList.map(C => {
            switch (C.formControlType) {
                case FormControlType.Container:
                    C.event = { ...formContainerBaseInitialEvent, ...C.event };
                    return {
                        Component: FormContainerBase(FormSortDrop(FormDragSource()(C.Component), {
                            canDelete: C.__canDelete
                        })),
                        itemType: C.itemType
                    };
                case FormControlType.Item:
                    C.event = { ...formItemBaseInitialEvent, ...C.event };
                    return {
                        Component: FormItemBase(C.Component, true, {
                            canCopy: C.__canCopy,
                            canDelete: C.__canDelete
                        }), itemType: C.itemType
                    };
                case FormControlType.External:
                    C.event = { ...formExternalBaseInitialEvent, ...C.event };
                    return {
                        Component: FormExternalBase(FormSortDrop(FormDragSource()(C.Component), {
                            canCopy: C.__canCopy,
                            canDelete: C.__canDelete
                        })),
                        itemType: C.itemType
                    };
                case FormControlType.Group:
                    C.event = { ...formGroupBaseInitialEvent, ...C.event };
                    return {
                        Component: FormGroupBase(C.Component, true, {
                            canCopy: C.__canCopy,
                            canDelete: C.__canDelete
                        }), itemType: C.itemType
                    };
                case FormControlType.Mark:
                    C.event = { ...formMarkBaseInitialEvent, ...C.event };
                    return {
                        Component: FormMarkBase(FormSortDrop(FormDragSource()(C.Component), {
                            canCopy: C.__canCopy,
                            canDelete: C.__canDelete
                        })),
                        itemType: C.itemType
                    };
                default:
                    return {
                        Component: FormItemBase(C.Component, true, {
                            canCopy: C.__canCopy,
                            canDelete: C.__canDelete
                        }), itemType: C.itemType
                    };
            }
        }),
        all: {},
        controlExtra: initControlExtra(controlExtraList),
        linkFormList: []
    },
    subscriptions: {
        initLinkFormList({ dispatch }) {
            dispatch({
                type: "getLinkFormList"
            });
        },
        initThirdPartyList({ dispatch }) {
            dispatch({
                type: "getThirdPartyList"
            });
        },
        initAllWithValide({ dispatch }) {
            dispatch({
                type: "getAllWithValide"
            });
        }
    },
    effects: {
        //设置子表链接器
        setFormProperties: [function* (action, effects) {
            let { formTemplateVersionId, data } = action;
            let formState = yield effects.select(state => state.formBuilder.all[formTemplateVersionId]);
            let tableLinker = data.tableLinker;
            // let tableLinker = tr ? fromJS({
            //     '66a030e9-5136-acde-123d-ace19ea115be': ['4dcf0c97-3ab5-653e-4cde-6a9818e1ff21', 'b2ce510d-80bb-aa2b-1d9c-d5bf653c9b39'],
            //     '4dcf0c97-3ab5-653e-4cde-6a9818e1ff21': ['b196d9f7-64a5-1d92-0d0c-3b0c7b63a382', '16bf3499-51f8-8492-bfc0-9f94e73d7032']
            // }) : fromJS({
            //     '66a030e9-5136-acde-123d-ace19ea115be': ['4dcf0c97-3ab5-653e-4cde-6a9818e1ff21', 'b2ce510d-80bb-aa2b-1d9c-d5bf653c9b39'],
            //     //'4dcf0c97-3ab5-653e-4cde-6a9818e1ff21': ['b196d9f7-64a5-1d92-0d0c-3b0c7b63a382', '16bf3499-51f8-8492-bfc0-9f94e73d7032']
            // });
            if (tableLinker !== undefined) {
                //let allLinker = new Set();
                let formBody = formState.get("formBody");
                let rootFormId = formBody.find(a => a.get("itemType") === "Root").get("id");
                let rootTableLinker = [];//主表直接链接的子表链接器
                let addTableLinkerList = [];//新增的子表链接器
                let addTableLinkerNameList = [];//新增的子表链接器Name
                let modifyTableLinkerList = [];//修改的子表链接器Name
                let allDropTableLinker = [];//移除的子表链接器
                let renderList = new Set();
                //与主表直接链接的子表只包含TableLinker不包含TableLinkerName
                //并且需要设置TableLinker的dataLinker
                if (Array.isArray(tableLinker[rootFormId]))
                    tableLinker[rootFormId].forEach(subTableId => {
                        let existTableLinker = formBody.find(a => a.get("container") === subTableId && a.get("itemType") === "TableLinker" && a.get("status") !== FORMSTATUS.delete);
                        rootTableLinker.push(subTableId);
                        if (existTableLinker) {
                            if (existTableLinker.getIn(["itemBase", "tableLinkerParentId"]) !== rootFormId)
                                modifyTableLinkerList.push({ id: existTableLinker.get("id"), parentId: rootFormId });
                        }
                        else {
                            addTableLinkerList.push({ container: subTableId, parentId: rootFormId });
                            renderList.add(subTableId);
                        }
                        let existName = formBody.find(a => a.get("container") === subTableId && a.get("itemType") === "TableLinkerName" && a.get("status") !== FORMSTATUS.delete);
                        if (existName) {
                            allDropTableLinker.push(existName.get("id"));
                        }
                    });

                for (let link in tableLinker) {
                    allDropTableLinker = allDropTableLinker.concat(formBody.filter(a => (a.get("itemType") === "TableLinker" || a.get("itemType") === "TableLinkerName") &&
                        a.getIn(["itemBase", "tableLinkerParentId"]) === link && !tableLinker[link].includes(a.get("container")) &&
                        a.get("status") !== FORMSTATUS.Delete).map(a => a.get("id")).toJS());
                    for (let l of tableLinker[link]) {
                        //allLinker.add(l);
                        if (!rootTableLinker.includes(l)) {
                            let existTableLinker = formBody.find(a => a.get("container") === l && a.get("itemType") === "TableLinker" && a.get("status") !== FORMSTATUS.delete);
                            let obj = { container: l, parentId: link };
                            renderList.add(l);
                            if (existTableLinker) {
                                if (existTableLinker.getIn(["itemBase", "tableLinkerParentId"]) !== link)
                                    modifyTableLinkerList.push({ id: existTableLinker.get("id"), parentId: link });
                            }
                            else {
                                addTableLinkerList.push(obj);
                            }
                            let existName = formBody.find(a => a.get("container") === l && a.get("itemType") === "TableLinkerName" && a.get("status") !== FORMSTATUS.delete);
                            if (existName) {
                                if (existName.getIn(["itemBase", "tableLinkerParentId"]) !== link)
                                    modifyTableLinkerList.push({ id: existName.get("id"), parentId: link });
                            }
                            else {
                                addTableLinkerNameList.push(obj);
                            }
                        }
                    }
                }
                if (addTableLinkerList.length > 0 || addTableLinkerNameList.length > 0)
                    yield effects.put({
                        type: "addTableLinker",
                        formTemplateVersionId,
                        linker: addTableLinkerList,
                        linkerName: addTableLinkerNameList
                    });
                if (allDropTableLinker.length > 0)
                    yield effects.put({
                        type: "removeFormItemBatch",
                        formTemplateVersionId,
                        list: allDropTableLinker
                    });
                if (modifyTableLinkerList.length > 0) {
                    yield effects.put({
                        type: "setValue",
                        formTemplateVersionId,
                        list: [{
                            proxyIndex: -1,
                            items: modifyTableLinkerList.map(a => ({
                                id: a.id,
                                data: { tableLinkerParentId: a.parentId }
                            }))
                        }]
                    });
                }
                if (renderList.size > 0)
                    yield effects.put({
                        type: "setRenderList",
                        formTemplateVersionId,
                        list: Array.from(renderList).concat(allDropTableLinker)
                    });

            }
        }, { type: "takeEvery" }],
        * buildFormDataFilter(action, { select, call, put }) {
            let { formTemplateVersionId, filter } = action;
            let { formBody, currentIndex, formList } = yield select(state => {
                let formState = state.formBuilder.all[formTemplateVersionId];
                return {
                    formBody: formState.get("formBody"),
                    formList: formState.get("formList").toJS(),
                    currentIndex: formState.get("currentIndex")
                };
            });
            if (filter === "tablelinker") {
                currentIndex = formBody.find(a => a.get("id") === currentIndex).getIn(["itemBase", "tableLinkerParentId"]);
            }
            let currentItem = formBody.find(a => a.get("id") === currentIndex);
            let currentFormId = currentItem ? currentItem.get("formId") : null;
            let currentForm = currentFormId ? formList.find(a => a.id === currentFormId) : { formType: FORM_TYPE.null };
            let itemFilterList = [];
            let formFilter;
            let showParentName = true;
            let useContainerParams = true;
            let useFormId = false;
            let withForm = false;
            let useAllGroupItem = false;
            switch (currentForm.formType) {
                default:
                    formFilter = () => true;
                    break;
                case FORM_TYPE.mainForm:
                    //formFilter = a => a.get("formId") === currentFormId;
                    formFilter = filter === "linker" ? a => a.get("formId") === currentFormId : () => true;
                    break;
                case FORM_TYPE.subForm:
                    formFilter = a => a.get("formId") === currentFormId || a.get("formId") === formList.find(a => a.formType === FORM_TYPE.mainForm).id;
                    break;
            }
            switch (filter) {
                case "display":
                    formFilter = () => true;
                    itemFilterList = formBody.filter(
                        a =>
                            a.get("formControlType") === FormControlType.Item &&
                            a.get("status") !== FORMSTATUS.Delete &&
                            a.get("id") !== currentIndex
                    ).filter(formFilter);
                    break;
                case "request":
                    useAllGroupItem = true;
                case "formula": //公式计算
                case "linker": //数据联动
                    itemFilterList = formBody.filter(
                        a =>
                            a.get("formControlType") === FormControlType.Item &&
                            a.get("status") !== FORMSTATUS.Delete &&
                            a.get("id") !== currentIndex
                    ).filter(formFilter);
                    break;
                case "validation":
                    itemFilterList = formBody.filter(
                        a =>
                            a.get("formControlType") === FormControlType.Item &&
                            a.get("status") !== FORMSTATUS.Delete
                    ).filter(formFilter);
                    break;
                case "bussiness":
                    useFormId = true;
                    withForm = true;
                    itemFilterList = formBody.filter(
                        a =>
                            a.get("formControlType") === FormControlType.Item &&
                            a.get("status") !== FORMSTATUS.Delete
                    );
                    break;
                case "department": //部门
                    useContainerParams = false;
                    showParentName = false;
                    itemFilterList = formBody.filter(
                        a => a.get("itemType") === "Department" && a.get("status") !== FORMSTATUS.Delete
                    ).filter(formFilter).map(a => {
                        let groupItems = a.getIn(["itemBase", "groupItems"]);
                        let valueItem = groupItems.find(a => a.get("key") === "value");
                        return formBody.find(b => b.get("id") === valueItem.get("id")).setIn(["itemBase", "name"], a.getIn(["itemBase", "name"]));
                    });
                    break;
                case "tableRelation":
                    useFormId = true;
                    withForm = true;
                    itemFilterList = formBody.filter(
                        a =>
                            a.get("formControlType") === FormControlType.System &&
                            a.get("status") !== FORMSTATUS.Delete
                    );
                    break;
                case "relation": //关联条件
                    let allContainers = getAllContainers(currentIndex, formBody);
                    itemFilterList = formBody.filter(
                        a =>
                            a.get("formControlType") === FormControlType.Item &&
                            a.get("status") !== FORMSTATUS.Delete &&
                            a.get("id") !== currentIndex &&
                            !allContainers.includes(a.get("container"))
                    ).filter(formFilter);
                    break;
                case "formVerification":
                    itemFilterList = formBody.filter(
                        a =>
                            a.get("formControlType") === FormControlType.Item &&
                            a.get("status") !== FORMSTATUS.Delete
                    );
                    formFilter = a => true;
                    break;
                case "tablelinker":
                    showParentName = false;
                    useContainerParams = false;
                    itemFilterList = formBody.filter(
                        a =>
                            a.get("formControlType") === FormControlType.Item &&
                            a.get("status") !== FORMSTATUS.Delete &&
                            a.get("id") !== currentIndex &&
                            a.get("formId") === currentFormId
                    );
                    break;
            }
            let containerParams = [];
            if (useAllGroupItem) {
                formBody.filter(a => a.get("formControlType") === FormControlType.Group).filter(formFilter).forEach(a => {
                    let groupItems = a.getIn(["itemBase", "groupItems"]).toJS();
                    for (let key in groupItems) {
                        let groupItem = formBody.find(a => a.get("id") === groupItems[key].id);
                        if (groupItem) {
                            let name = groupItem.getIn(["itemBase", "name"]);
                            if (showParentName) {
                                let parent = formBody.find(b => b.get("id") === a.get("container"));
                                while (parent.get("itemType") !== "Root") {
                                    name = `${parent.getIn(["itemBase", "name"])}.${name}`;
                                    parent = formBody.find(b => b.get("id") === parent.get("container"));
                                }
                            }
                            containerParams.push({
                                id: groupItem.get("id"),
                                name,
                                type: groupItem.get("itemType"),
                                valueType: groupItem.get("valueType")
                            });
                        }
                    }
                });
            }
            else {
                //如果容器类控件拥有onGetParams时，调用获取
                let containers = formBody.filter(
                    a =>
                        a.get("formControlType") > 0 &&
                        a.get("status") !== FORMSTATUS.Delete &&
                        a.get("id") !== currentIndex &&
                        a.hasIn(["event", "onGetLinkerParams"])
                ).filter(formFilter);
                containerParams = useContainerParams ? containers
                    .map(a => {
                        let result = a.getIn(["event", "onGetLinkerParams"])({
                            ...a.get("itemBase").toJS(),
                            id: a.get("id")
                        });
                        if (showParentName) {
                            let parent = formBody.find(b => b.get("id") === a.get("container"));
                            let pName = '';
                            while (parent.get("itemType") !== "Root") {
                                pName = `${parent.getIn(["itemBase", "name"])}.${pName}`;
                                parent = formBody.find(b => b.get("id") === parent.get("container"));
                            }
                            result.forEach(r => {
                                r.name = pName === '' ? r.name : `${pName}${r.name}`;
                            });
                        }
                        if (useFormId) {
                            result.forEach(r => {
                                r.formId = a.get("formId");
                            });
                        }
                        return result;
                    }).reduce((a, b) => a.concat(b), []) : [];
            }
            let list = itemFilterList
                .map(a => {
                    let name = a.getIn(["itemBase", "name"]);
                    if (showParentName) {
                        let parent = formBody.find(b => b.get("id") === a.get("container"));
                        while (parent.get("itemType") !== "Root") {
                            name = `${parent.getIn(["itemBase", "name"])}.${name}`;
                            parent = formBody.find(b => b.get("id") === parent.get("container"));
                        }
                    }
                    let obj = {
                        id: a.get("id"),
                        name,
                        type: a.get("itemType"),
                        valueType: a.get("valueType")
                    };
                    if (useFormId)
                        obj.formId = a.get("formId");
                    return obj;
                })
                .concat(containerParams);


            if (withForm && useFormId) {
                //let usedFormId = Array.from(new Set(list.map(a => a.formId)));
                let formItems = formBody.filter(a => a.get("isSubTable") === true);// && usedFormId.includes(a.get('formId')));
                list = list.map(a => ({ ...a, type: "formItem" })).concat(formItems.map(a => {
                    let formType = formList.find(b => b.id === a.get("formId")).formType;
                    return {
                        id: a.get("id"),
                        formId: a.get("formId"),
                        name: formType === 0 ? formList.find(b => b.id === a.get("formId")).name : a.getIn(["itemBase", "name"]),
                        type: "form",
                        formType
                    };
                }));
            }
            yield put({
                formTemplateVersionId,
                type: "setcurrentFormData",
                list
            });
        },
        * beginSave(action, { select, call, put }) {
            let { formTemplateVersionId, addToModify, Release, funcId, saveStatus } = action;
            let {
                formBody,
                formList,
                rootContainer,
                //foreignKeys,
                formTemplateId,
                formVersion,
                rootFormId,
                formTitle,
                formStatus,
                isUsed,
                formProperties,
                //dataLinker,
                updateDataLinker,
                formForeignKeys,
                serialNumSeedActionRequest,
                //publishStatus,
                viewCode,
                moduleId,
                formTemplateType,
                currentFormData,
                BuildContactData
            } = yield select(state => state.formBuilder.all[formTemplateVersionId].toJSON());
            let FormRelationActionRequests = BuildSaveData(BuildContactData, currentFormData, formTemplateVersionId);
            FormRelationActionRequests.map(a => {
                formBody.forEach(b => {
                    if (b.get("formId") === a.ChildFormId && b.get("itemType") === "TableLinker") {
                        a.ChildFormVersionHistoryId = b.get("id");
                    }
                });
            });
            let { dataLinker, valid } = initDataLinker(formBody);
            if (valid.length > 0) {
                message.error(`表单联动设置存在循环,请重新设置相关表单项：${valid.map(a => a.name).toString()}！`);
                saveStatus(false);
                yield put({
                    type: "setCurrent",
                    formTemplateVersionId,
                    id: valid[0].id
                });
                return;
            }
            //初始化表单关系
            FormRelation = [];
            if (formStatus !== FORMSTATUS.NoChange) {
                formBody = orderFormBody(formBody);
                let isUpdateVersion = checkUpdateVersion(
                    formStatus,
                    isUsed,
                    updateDataLinker,
                    formBody
                );
                let areas = formBody
                    .filter(a => a.get("formControlType") > 0 && a.get("status") !== FORMSTATUS.NoChange)
                    .toJS();
                let items = formBody
                    .filter(a => a.get("formControlType") < 1 && a.get("status") !== FORMSTATUS.NoChange)
                    .toJS();
                formList = formList.toJS();
                let { submitKeys, newForeignKeys, formBody: newFormBody } = buildForeignKeys(
                    formBody,
                    formForeignKeys.toJS(), isUpdateVersion
                );
                formBody = newFormBody;
                formForeignKeys = submitKeys;
                let areaList = [],
                    formItemList = [],
                    changeFormList = [];
                let reg = new RegExp("\u2800", "gm");
                debugger
                let itemsGroup = _.groupBy(items, a => a.container);
                let existAreas = [];
                for (let containerId in itemsGroup) {
                    let container = formBody.find(a => a.get("id") === containerId).toJS();
                    container.itemBase.isExternal = container.isExternal || false;
                    container.itemBase.noMappad = container.noMappad;
                    let needArea = false;
                    itemsGroup[containerId].forEach(formItem => {
                        if (!changeFormList.includes(formItem.formId)) {
                            changeFormList.push(formItem.formId);
                        }
                        if (formItem.status === FORMSTATUS.Add || formItem.status === FORMSTATUS.Delete)
                            needArea = true;
                        formItemList.push({
                            areaId: containerId,
                            id: formItem.id,
                            formId: formItem.formId,
                            name: formItem.itemBase.name,
                            controlType: ControlTypeTransf(formItem.itemType),
                            controlTypeDes: formItem.itemType,
                            property: JSON.stringify(formItem.itemBase).replace(reg, "$u2800"),
                            sortIndex: formItem.order,
                            operationStatus: formItem.status,
                            dataLink: JSON.stringify(formItem.dataLinker).replace(reg, "$u2800"),
                            noMappad: (formItem.noMappad && container.itemType === "Root" ? true : container.noMappad) === true,
                            code: formItem.code,
                            isHide: formItem.authority.hidden.system === true
                        });
                    });
                    if (container.status !== FORMSTATUS.NoChange || needArea) {
                        existAreas.push(containerId);
                        areaList.push({
                            id: container.id,
                            formId: container.formId,
                            property: JSON.stringify(container.itemBase).replace(reg, "$u2800"),
                            dataLink: JSON.stringify(container.dataLinker).replace(reg, "$u2800"),
                            formTemplateVersionId,
                            areaType: container.itemType,
                            name: container.itemBase.name,
                            layer: 0, // i,
                            parentId: container.container,
                            sortIndex: container.order,
                            operationStatus: container.status,
                            isOwner: !!container.isSubTable //form拥有者
                        });
                    }
                }

                areas
                    .filter(a => !existAreas.includes(a.id))
                    .forEach(container => {
                        let formId = container.itemBase.formId;
                        if (formId === undefined) {
                            formId = getFormContainerByContainerId(container.id, formBody).getIn([
                                "itemBase",
                                "formId"
                            ]);
                        }
                        if (!changeFormList.includes(formId))
                            changeFormList.push(formId);
                        areaList.push({
                            id: container.id,
                            formId,
                            property: JSON.stringify(container.itemBase).replace(reg, "$u2800"),
                            dataLink: JSON.stringify(container.dataLinker).replace(reg, "$u2800"),
                            formTemplateVersionId,
                            areaType: container.itemType,
                            name: container.itemBase.name,
                            layer: 0, //i,
                            parentId: container.container,
                            sortIndex: container.order,
                            operationStatus: container.status,
                            isOwner: !!container.isSubTable //form拥有者
                        });
                    });

                areaList.forEach(a => {
                    a.layer = getAreaLayer(a, areaList);
                });
                // 特殊组件 序列号的 信息
                const SerialNumSeedActionRequest = {};
                let serialCom = formBody.find(a => a.get("itemType") === "SerialNumber" && a.get("delegate") !== true && a.get("isExternal") !== true);
                if (serialCom && serialCom.get("status") !== FORMSTATUS.NoChange) {
                    const ruleList = serialCom
                        .get("itemBase")
                        .get("rulesList")
                        .toJS();
                    //console.log(ruleList);
                    SerialNumSeedActionRequest.Id = !serialNumSeedActionRequest
                        ? com.Guid()
                        : serialNumSeedActionRequest.id;
                    SerialNumSeedActionRequest.FormTemplateId = formTemplateId;
                    SerialNumSeedActionRequest.DateFormat = "";
                    SerialNumSeedActionRequest.currentDateTime = serialNumSeedActionRequest
                        ? serialNumSeedActionRequest.currentDateTime
                        : null;
                    SerialNumSeedActionRequest.currentValue = serialNumSeedActionRequest
                        ? serialNumSeedActionRequest.currentValue
                        : null;
                    ruleList.forEach(rule => {
                        let { value } = rule;
                        switch (rule["type"]) {
                            case "1":
                                SerialNumSeedActionRequest.MaxLen = value.digit;
                                SerialNumSeedActionRequest.RepeatType = value.period;
                                SerialNumSeedActionRequest.StartIndex = value.initValue;
                                SerialNumSeedActionRequest.IsFixed = value.isFixedDigit;
                                break;
                            case "2":
                                SerialNumSeedActionRequest.DateFormat = value.value;
                                break;
                        }
                    });
                }
                let submitFormList = formList
                    .filter(a => changeFormList.includes(a.id) || a.operationStatus !== FORMSTATUS.NoChange)
                    .map(a => {
                        if (a.operationStatus === FORMSTATUS.NoChange)
                            a.operationStatus = FORMSTATUS.Modify;
                        let exsit = formBody.find(b => b.get("formId") === a.id && b.get("isSubTable") === true);
                        if (exsit)
                            a.name = exsit.getIn(["itemBase", "name"]);
                        return a;
                    });

                let postData = {
                    id: formTemplateId,
                    formTemplateVersionId,
                    isUpdateVersion, //: action.publishStatus,
                    name: formTitle,
                    areaActionRequests: areaList,
                    formsActionRequests: submitFormList,
                    serialNumSeedActionRequest: SerialNumSeedActionRequest,
                    formVersionHistoryActionRequests: formItemList,
                    formForeiginKeyActionRequests: formForeignKeys, //数据联动和引用
                    operationStatus: formStatus, //1新增，2修改，0删除
                    status: 0,
                    categoryId: com.Guid(),
                    Property: JSON.stringify(formProperties).replace(reg, "$u2800"),
                    code: viewCode,
                    moduleId,
                    formTemplateType: Number(formTemplateType),
                    FormRelationActionRequests//构建表单关系配置 数据
                };
                // 如果action的moduleId为空，就重新生成一个新的moduleId
                if (!postData.moduleId) {
                    postData.moduleId = com.Guid();
                }
                //如果是修改表单模板，且有新子表单加入，则需要把主表的form和主键附加到提交流程
                if (
                    areas.some(item => item.itemType === "SubForm" && item.status === FORMSTATUS.Add) &&
                    formStatus === FORMSTATUS.Modify
                ) {
                    //添加主键
                    let pk = formBody.find(
                        a =>
                            a.get("container") === rootContainer &&
                            a.get("controlType") === ControlType.PrimaryKey
                    );
                    if (!postData.formVersionHistoryActionRequests.some(a => a.id === pk.get("id"))) {
                        postData.formVersionHistoryActionRequests.push({
                            areaId: pk.get("container"),
                            id: pk.get("id"),
                            code: pk.get("code"),
                            formId: pk.get("formId"),
                            name: pk.getIn(["itemBase", "name"]),
                            controlType: pk.get("controlType"),
                            controlTypeDes: pk.get("itemType"),
                            property: JSON.stringify(pk.get("itemBase").toJS()).replace(reg, "$u2800"),
                            sortIndex: pk.get("order"),
                            operationStatus: pk.get("status"),
                            dataLink: JSON.stringify(pk.get("dataLinker").toJS()).replace(
                                new RegExp("\u2800", "gm"),
                                "$u2800"
                            ),
                            noMappad: pk.get("noMappad") === true,
                            isHide: pk.getIn(["authority", "hidden", "system"]) === true // ee.get('isHide') === true
                        });
                    }
                    //添加主表form
                    let pf = formList.find(a => a.id === rootFormId);
                    if (!postData.formsActionRequests.some(a => a.id === pf.id)) {
                        postData.formsActionRequests.push(pf);
                    }
                }
                let mode = formStatus === FORMSTATUS.Add ? "New" : "Modify";
                if (mode === "Modify") postData.formVersion = formVersion;
                //postData.tableHead = JSON.stringify(generateTableHeader(formBody));
                yield put({ type: "beginSubmitting", formTemplateVersionId });
                // console.log(postData)
                // debugger
                // return;
                if (postData.formVersionHistoryActionRequests.length === 1 &&
                    postData.formVersionHistoryActionRequests[0].controlTypeDes === "PrimaryKey" &&
                    postData.formVersionHistoryActionRequests[0].operationStatus === FORMSTATUS.Add) {
                    message.warn("表单模板不能为空！");
                    yield put({ type: "cancelSubmitting", formTemplateVersionId });
                } else {
                    const { data } = yield call(save, postData, mode);
                    if (data.isValid) {
                        if (Release) {
                            saveStatus(true);
                            yield put({
                                type: "SendPublishForm",
                                formTemplateVersionId,
                                saveStatus,
                                funcId
                            });
                        } else {
                            message.success("保存成功！");
                            saveStatus(false);
                        }
                        yield put({
                            type: "endSubmitting",
                            formBody,
                            newForeignKeys,
                            formTemplateVersionId,
                            entityId: data.entityId,
                            moduleId: postData.moduleId,
                            mode
                        });
                        addToModify(formTemplateId, data.entityId, postData.moduleId);
                        yield put({
                            type: "beginLoadForm",
                            refresh: true,
                            id: data.entityId
                        });
                    } else {
                        saveStatus(false);
                        message.error("保存失败！");
                        yield put({
                            type: "submitFailed",
                            formTemplateVersionId
                        });
                    }
                }
            } else {
                if (Release) {
                    saveStatus(true);
                    yield put({
                        type: "SendPublishForm",
                        formTemplateVersionId,
                        saveStatus,
                        funcId
                    });
                } else {
                    saveStatus(false);
                    message.info("没有需要保存的数据！");
                }
            }
        },
        * beginLoadForm(action, { select, call, put }) {
            let { loaded, loading } = yield select(state => {
                return {
                    loaded: state.formBuilder.all[action.id].get("loaded") === true,
                    loading: state.formBuilder.all[action.id].get("formLoading")
                };
            });
            //初始化表单关系
            FormRelation = [];
            // if (loaded || loading)
            //     return;
            yield put({ type: "changeLoading", formTemplateVersionId: action.id, formLoading: true });
            const { data } = yield call(detail, { EntityId: action.id });
            //console.log("beginLoadForm", data);
            if (data.name) {
                if (action.refresh !== true)
                    message.success("载入成功！");
                yield put({
                    type: "loadForm",
                    formTemplateVersionId: action.id,
                    ...data
                });
                //yield put({ type: 'beginLoadUsedFormDetail', formTemplateVersionId: action.id })
                yield put({
                    type: "initAuthority",
                    formTemplateVersionId: action.id
                });
            } else {
                message.error("载入失败！");
                yield put({
                    type: "loadFailed"
                });
            }
            yield put({ type: "changeLoading", formTemplateVersionId: action.id, formLoading: false });
        },
        // * beginLoadUsedFormDetail(action, effects) {
        //     let formBody = yield effects.select(state => state.formBuilder.all[action.formTemplateVersionId].get('formBody').toJS());
        //     let relationList = Array.from(new Set(formBody.filter(a => a.itemBase.relationTableId).map(a => a.itemBase.relationTableId)));
        //     if (relationList.length > 0) {
        //         let { data } = yield effects.call(GetFormTemplateWithFieldByIds, { entityIdList: relationList });
        //         debugger
        //     }
        // },
        * getLinkFormList(action, { call, put }) {
            // let now = new Date();
            // let formList = JSON.parse(localStorage.getItem('formList'));
            // if (formList === null || now - formList.time > 5 * 60 * 1000) {
            //     const {data} = yield call(getAllFormTemplate);
            //     console.log(JSON.stringify(data))
            //     yield put({
            //         type: 'setLinkFormList',
            //         linkFormList: data,
            //         saveToStorage: true
            //     });
            // } else {
            //     yield put({
            //         type: 'setLinkFormList',
            //         linkFormList: formList.linkFormList
            //     });
            // }
        },
        // 获取第三方数据源数据
        * getThirdPartyList(action, { call, put }) {
            const { data } = yield call(getAllThirdParty);
            yield put({
                type: "setThirdParty",
                thirdPartyList: data
            });
        },
        // 获取第三方数据源校验数据
        * getAllWithValide(action, { call, put }) {
            const { data } = yield call(getAllWithValide);
            yield put({
                type: "setAllWithValide",
                allWithValideList: data
            });
        },
        * getBusinessPosition(action, effects) {
            let { formTemplateVersionId, onSuccess } = action;
            let formState = yield effects.select(state => state.formBuilder.all[formTemplateVersionId]);
            let rootContainer = formState.get("rootContainer");
            let formBody = formState.get("formBody");
            let rootList = formBody.filter(a => a.get("container") === rootContainer && a.get("formControlType") > FormControlType.System).toJS().map(a => ({
                id: a.id,
                name: a.itemBase.name
            }));
            if (onSuccess instanceof Function)
                onSuccess.call(null, rootList);
        },
        * PreviewShowFn(action, effects) {
            let { formTemplateVersionId } = action;
            yield effects.put.resolve({
                type: "PreviewShowFnSuccess",
                formTemplateVersionId
            });
            let { dataLinker, formBody } = yield effects.select(state => {
                return {
                    dataLinker: state.formBuilder.all[formTemplateVersionId].get("dataLinker").toJS(),
                    formBody: state.formBuilder.all[formTemplateVersionId]
                        .get("formBody")
                        .toJS()
                        .filter(a => a.status !== FORMSTATUS.Delete)
                };
            });
            let allLinkIds = Object.keys(dataLinker).concat(
                formBody.filter(a => Array.isArray(a.dataLinker) && a.dataLinker.length > 0).map(a => a.id)
            );
            yield effects.put({
                type: "applyLang",
                formTemplateVersionId,
                lang: "zhcn"
            });
            debugger
            yield effects.call(
                linkFormData,
                [],
                new Set(allLinkIds),
                formTemplateVersionId,
                effects,
                "formBuilder",
                true,
                10,
                true
            );
        },
        * GetSerialNumSeed(action, { select, call, put }) {
            const { id, formTemplateVersionId } = action;
            const { data } = yield call(GetSerialNumSeed, { Id: id });
            if (data) {
                // 提交的 时候 在 进行拼接 字符串
                /* const serailItem = formState.get("formBody").filter(item => item.get("itemType") === "SerialNumber");
                const ruleList = serailItem.get(0).get("itemBase").get("rulesList");
                console.log(ruleList);
                let tempSerialValue = ruleList.reduce((prev, rule) => {
                    const { type } = rule;
                    switch (type) {
                        case "1":
                            return prev + data["serialNum"];
                        case "2":
                            return prev + data["dateTimeFormat"];
                        case "3":
                            return prev + rule["value"];
                        default:

                    }
                }, ""); */
                yield put({
                    type: "setSerialNum",
                    value: `${data["serialNum"]}_${data["dateTimeFormat"]}`,
                    formTemplateVersionId
                });
            }
        },
        //表单内发布
        * SendPublishForm(action, { select, call, put }) {
            let { formTemplateVersionId, funcId } = action;
            const { data } = yield call(publishForm, { entityId: formTemplateVersionId, ParentFuncId: funcId });
            action.saveStatus(false);
            if (data.isValid) {
                message.success("表单发布成功！");
            } else {
                message.error("表单发布失败！");
            }
        },
        * getUserFuncs(action, { call, put }) {
            let { formTemplateVersionId } = action;
            const { data } = yield call(getUserFuncs, {
                "Platform": "NPF"
            });
            if (data) {
                // console.log('---', data)
                yield put({
                    type: "showUserFuncsModel",
                    formTemplateVersionId,
                    data
                });

            } else {
                yield put({
                    type: "showUserFuncsModel",
                    formTemplateVersionId
                });
                // Modal.error({
                //     title: '错误',
                //     content: data.errors.errorItems ? data.errors.errorItems.map((item, index) => {
                //         return <span key={index}>[{item.propertyName}] {item.errorMessage}<br /></span>
                //     }) : error.message,
                //     okText: '确定'
                // });
            }
        },
        ...effects("formBuilder")
    },
    reducers: {
        addTableLinker(state, action) {
            let { formTemplateVersionId, linker, linkerName } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            linkerName.forEach(l => {
                let item = buildFormItem(com.Guid(), "TableLinkerName", l.container, formState,
                    state.wrappedComponent, null, { tableLinkerParentId: l.parentId });
                formState = registFormItem(item, formState);
            });
            formBody = formState.get("formBody");
            linker.forEach(l => {
                formBody = addTableSystemItem(l.container, formBody.find(a => a.get("id") === l.container).get("formId"), formBody, "TableLinker",
                    com.Guid(), { tableLinkerParentId: l.parentId });
            });
            all[action.formTemplateVersionId] = formState.set("formBody", formBody).set(
                "formStatus",
                formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify
            );
            return { ...state, all };
        },
        modifyTableLinker(state, action) {
            let { formTemplateVersionId, linker } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            if (linker.length > 0) {
                linker.forEach(l => {
                    let item = formBody.find(a => a.get("id") === id);
                    let index = formBody.indexOf(item);
                    formBody = formBody.set(index, item.setIn(["itemBase", "tableLinkerParentId"], l.id));
                });
                all[action.formTemplateVersionId] = formState.set("formBody", formBody).set(
                    "formStatus",
                    formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify
                );
                return { ...state, all };
            }
            else
                return state;
        },
        setTitleDisabled(state, action) {
            let all = state.all;
            const { titleDisabled, formTemplateVersionId } = action;
            let formState = all[formTemplateVersionId];
            all[formTemplateVersionId] = formState.set("titleDisabled", titleDisabled);
            return { ...state, all };
        },
        loadForm(state, action) {
            let areaActionRequests = action.areaActionRequests.map(a => {
                return { ...a, property: JSON.parse(a.property || "{}") };
            });
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let rootArea = areaActionRequests.find(a => a.areaType === "Root");
            const rootContainer = rootArea.id;
            let rootForm = action.formsActionRequests.find(a => a.areaId === rootArea.id);
            const formTitle = action.name;
            const formStatus = action.formStatus || FORMSTATUS.NoChange;
            let reg = new RegExp("\\$u2800", "gm");
            let formProperties = JSON.parse(action.property.replace(reg, "\u2800"));

            let formList = action.formsActionRequests.map(a => ({
                id: a.id,
                name: a.name,
                formType: a.formType,
                areaId: a.areaId,
                sortIndex: a.sortIndex,
                property: a.property,
                isUsed: a.isUsed,
                operationStatus: FORMSTATUS.NoChange,
                isCreatedForm: a.isCreatedForm,
                versionId: a.versionId,
                code: a.code
            }));
            let formBody = buildFormBody({
                data: action, reg, design: true, formProperties,
                wrappedComponent: state.wrappedComponent, renderStyle: formState.get("formRenderStyle"),
                designProps
            });
            formBody = fromJS(formBody);
            let { dataLinker, valid } = initDataLinker(formBody);
            let validateRelations = initValidateRelations(formBody.filter(a => a.hasIn(["itemBase", "validateCustom"])).map(a => ({
                id: a.get("id"),
                relations: a.getIn(["itemBase", "validateCustom", "relations"])
            })).toJS());
            if (valid.length > 0) {
                message.error(`表单联动设置存在循环,请重新设置相关表单项：${valid.map(a => a.name).toString()}！`);
            }
            let result = initProxyPool(formBody, FormControlList, rootContainer);
            formBody = result.formBody;
            let proxyPool = result.proxyPool;
            formState = formState
                .set("loaded", true)
                .set("rootContainer", rootContainer)
                .set("rootFormId", rootForm.id)
                .set("formStatus", formStatus)
                .set("formList", fromJS(formList))
                .set("formTemplateVersionId", action.formTemplateVersionId)
                .set("formTitle", formTitle)
                .set("tabId", action.formTemplateVersionId)
                .set("publishStatus", action.publishStatus)
                .set("formTemplateId", action.id)
                .set("validateRelations", fromJS(validateRelations))
                .set("instId", null)
                .set("oldValues", fromJS([]))
                .set("isUsed", action.isUsed)
                .set("dataLinker", fromJS(dataLinker))
                .set("formBody", formBody)
                .set("proxyPool", proxyPool)
                .set("formProperties", fromJS(formProperties))
                .set("serialNumSeedActionRequest", action.serialNumSeedActionRequest)
                .set("viewCode", action.code) //视图名称
                .set("moduleId", action.moduleId)
                .set("formVersion", action.formVersion)
                .set("formTemplateType", action.formTemplateType) //是否挂载流程
                .set("formForeignKeys", fromJS(action.formForeiginKeyActionRequests));
            all[action.formTemplateVersionId] = formState;
            return { ...state, all };
        },
        // 设置 流水号 值到 value 中
        setSerialNum(state, action) {
            let all = state.all;
            const { value, formTemplateVersionId } = action;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let formItem = formBody.find(item => item.get("itemType") === "SerialNumber");
            let index = formBody.indexOf(formItem);
            formItem = formItem.setIn(["itemBase", "value"], value);
            formBody = formBody.set(index, formItem);
            all[formTemplateVersionId] = formState.set("formBody", formBody);
            return { ...state, all };
        },
        // //设置外部关联表字段值
        // setForeignTableData(state, action) {
        //     console.log('setForeignTableData');
        //     let all = state.all;
        //     let formState = all[action.formTemplateVersionId];
        //     // let foreignForm = fromJS(action.foreignForm);
        //     // let foreignFormData = fromJS(action.foreignFormData);
        //     all[action.formTemplateVersionId] = formState.set('foreignForm', fromJS(action.foreignForm)).set('foreignFormData', fromJS(action.foreignFormData));
        //     return { ...state, all }
        // },
        //设置表单计算元素
        setcurrentFormData(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            all[action.formTemplateVersionId] = formState.set("currentFormData", fromJS(action.list));
            return { ...state, all };
        },
        unload(state, action) {
            let all = state.all;
            delete all[action.formTemplateVersionId];
            return { ...state, all };
        },
        beginSubmitting(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            all[action.formTemplateVersionId] = formState.set("isSubmitting", true);
            return { ...state, all };
        },
        cancelSubmitting(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            all[action.formTemplateVersionId] = formState.set("isSubmitting", false);
            return { ...state, all };
        },
        refresh(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            all[action.formTemplateVersionId] = formState
                .set("loaded", false)
                .set("currentIndex", -1);
            return { ...state, all };
        },
        endSubmitting(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = action.formBody;
            let formList = formState.get("formList");
            formBody = formBody
                .filter(a => a.get("status") !== FORMSTATUS.Delete)
                .map(a => a.set("status", FORMSTATUS.NoChange));
            formList = formList
                .filter(a => a.get("status") !== FORMSTATUS.Delete)
                .map(a => a.set("operationStatus", FORMSTATUS.NoChange).set("isCreatedForm", false));
            delete all[action.formTemplateVersionId];
            if (action.mode === "New") formState = formState.set("publishStatus", false);
            all[action.entityId] = formState
                .set("isSubmitting", false)
                .set("formStatus", FORMSTATUS.NoChange)
                .set("formBody", formBody)
                .set("formTemplateVersionId", action.entityId)
                .set("formList", formList)
                .set("currentIndex", -1)
                .set("moduleId", action.moduleId)
                .set("loaded", false)
                .set("formForeignKeys", fromJS(action.newForeignKeys));
            return { ...state, all };
        },
        submitFailed(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            all[action.formTemplateVersionId] = formState.set("isSubmitting", false);
            return { ...state, all };
        },
        loadFailed(state) {
            return { ...state };
        },
        setLinkFormList(state, action) {
            let linkFormList = action.linkFormList;
            let foreignFormData = [];
            if (action.saveToStorage) {
                let r = buildLinkFormList(linkFormList, state.controlExtra);
                linkFormList = r.linkFormList;
                foreignFormData = r.foreignFormData;
                // linkFormList.forEach(a => {
                //     //将控件组放入
                //     a.areas.forEach(area => {
                //         let property = JSON.parse(area.property || '{}');
                //         if (property.groupItems) {
                //             let formCode = '';
                //             for (let groupKey in property.groupItems) {
                //                 var groupItem = property.groupItems[groupKey];
                //                 var filed = _.where(a.fields, { id: groupItem.id })[0];
                //                 if (filed) {
                //                     formCode = filed.formCode;
                //                     filed.groupId = area.id;
                //                     property.groupItems[groupKey] = { ...property.groupItems[groupKey], ...filed };
                //                 }
                //             }
                //             let group = {
                //                 id: area.id,
                //                 formCode: formCode,
                //                 name: property.name,
                //                 controlType: property.type,
                //                 formControlType: FormControlType.Group,
                //                 valueType: state.controlExtra.valueType[area.areaType],
                //                 groupItems: property.groupItems
                //             };
                //             if (
                //                 state.controlExtra.event[area.areaType] &&
                //                 state.controlExtra.event[area.areaType].onGetLinkerParams instanceof Function
                //             ) {
                //                 let groupFormularItems = state.controlExtra.event[area.areaType].onGetLinkerParams(
                //                     property
                //                 );
                //                 groupFormularItems.forEach(g => {
                //                     let groupItem = a.fields.find(b => b.id === g.id);
                //                     if (groupItem) {
                //                         group.formType = groupItem.formType;
                //                         groupItem.groupItem = true;
                //                         groupItem.groupItemPrivate = g.private === true;
                //                         groupItem.valueType = g.valueType;
                //                         groupItem.name = g.name;
                //                     }
                //                 });
                //             }
                //             a.fields.push(group);
                //         }
                //     });
                //     a.fields.forEach(field => {
                //         if (field.controlType !== 'None') {
                //             let valueType = state.controlExtra.valueType[field.controlType];
                //             field.valueType = valueType;
                //         }
                //         foreignFormData.push({
                //             id: field.id,
                //             name: field.name,
                //             type: field.controlType,
                //             valueType: field.valueType,
                //             hidden: field.hidden
                //         });
                //     });
                // });
                localStorage.setItem("formList", JSON.stringify({ time: new Date(), linkFormList }));
            }
            return { ...state, linkFormList, foreignFormData };
        },
        // 保存第三方数据源数据到reducers
        setThirdParty(state, action) {
            let { thirdPartyList } = action;
            if (Array.isArray(thirdPartyList)) {
                thirdPartyList.forEach(a => {
                    if (!a.configuration) return;
                    let tempConfiguration = typeof a.configuration === "string" ? a.configuration : JSON.stringify(a.configuration);
                    let configuration = JSON.parse(tempConfiguration);
                    configuration.forEach(b => {
                        b.valueType = state.controlExtra.valueType[b.controlType];
                    });
                    a.configuration = configuration;
                });
            }
            else
                thirdPartyList = [];
            return { ...state, thirdPartyList };
        },
        // 保存第三方数据源校验数据到reducers
        setAllWithValide(state, action) {
            let { allWithValideList } = action;
            allWithValideList.forEach(a => {
                if (!a.configuration) return;
                let configuration = JSON.parse(a.configuration);
                configuration.forEach(b => {
                    b.valueType = state.controlExtra.valueType[b.controlType];
                });
                a.configuration = configuration;
            });
            return { ...state, allWithValideList };
        },
        // getLinkFormLDetail(state, action) {
        //     debugger
        //     const { formTemplateVersionId, id, saveTo } = action;
        //     console.log(state.linkFormList);
        //     let all = state.all;
        //     let exist = state.linkFormList.find(a => a.id === id);
        //     let linkFormDetail = [];
        //     if (exist) linkFormDetail = state.linkFormList.find(a => a.id === id).fields;
        //     let formState = all[formTemplateVersionId];
        //     let formBody = formState.get("formBody");
        //     let target = formBody.find(a => a.get("id") === saveTo);
        //     let index = formBody.indexOf(target);
        //     formBody = formBody.setIn([index, "linkFormDetail"], linkFormDetail);
        //     console.log(linkFormDetail);
        //     formState = formState.set("formBody", formBody);
        //     all[formTemplateVersionId] = formState;
        //     return { ...state, all };
        // },
        addExternalFormItem(state, action) {
            //新增关联字段
            let all = state.all;
            let { id, itemType, container, formType, exContainerId, name, externalId, noMappad } = action;
            let renderList = [container];
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            let formList = formState.get("formList");
            let item = buildFormItem(
                id,
                itemType,
                container,
                formState,
                state.wrappedComponent,
                {
                    isExternal: true,
                    noMappad,
                    authority: { hidden: {}, disabled: {}, readOnly: { external: true } }
                },
                { name, externalId, isExternal: true, disabled: true }
            );
            //子表单的某一列
            if (formType === 1) {
                let subContainer = formBody.find(
                    a => a.getIn(["itemBase", "externalId"]) === exContainerId && a.get("container") === container
                );
                if (subContainer === undefined) {
                    let subId = com.Guid();
                    renderList.push(subId);
                    subContainer = buildFormItem(
                        subId,
                        "SubForm",
                        container,
                        formState,
                        state.wrappedComponent,
                        {
                            isSubTable: true,
                            isExternal: true,
                            authority: { hidden: {}, disabled: {}, readOnly: { external: true } },
                            noMappad
                        },
                        {
                            name: name.substr(0, name.indexOf(".")),
                            disabled: true,
                            externalId: exContainerId,
                            isExternal: true
                        }
                    );
                    formState = registFormItem(subContainer, formState, noMappad);
                }
                else {
                    subContainer = subContainer.toJS();
                    renderList.push(subContainer.id);
                }
                item.container = subContainer.id;
                let title = name.substr(name.indexOf(".") + 1);
                item.itemBase.name = title;
                item.controlStatus = ControlStatus.Static;
                item.delegateAttr = { ...item.delegateAttr, ...subContainer.proxyAttr };
                item.delegate = true;
            }
            formState = registFormItem(item, formState, noMappad, action.groupItems);
            all[action.formTemplateVersionId] = formState
                .set("isUpdateVersion", true)
                .set("formList", formList)
                .set("renderList", fromJS(renderList))
                .set("formStatus", formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify);
            return { ...state, all };
        },
        addFormItemSimple(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            const { itemType } = action;
            let container = formState.get("rootContainer");
            let controlItem = FormControlList.find(a => a.itemType === itemType);
            let formBody = formState.get("formBody");
            let foreignKeys = formState.get("foreignKeys");
            let currentIndex = formState.get("currentIndex");
            let currentItem = formBody.find(a => a.get("id") === currentIndex);
            if (
                currentItem &&
                currentItem.get("formControlType") === FormControlType.Container &&
                currentItem.get("delegate") !== true
            ) {
                container = currentItem.get("id");
                formState = formState.set("renderList", fromJS([container]));
                let dropItemValueTypes = state.controlExtra.dropItemValueTypes[currentItem.get("itemType")];
                //容器是否支持当前控件的放入
                if (
                    dropItemValueTypes &&
                    dropItemValueTypes.indexOf(state.controlExtra.valueType[controlItem.itemType]) === -1
                ) {
                    message.error(`${controlItem.name}不支持放入${currentItem.getIn(["itemBase", "typeName"])}!`);
                    return state;
                }
                if (state.controlExtra.isSubTable[currentItem.get("itemType")] === true && state.controlExtra.dropOnSubForm[itemType] === false) {
                    message.error(`${controlItem.name}不支持放入${currentItem.getIn(["itemBase", "typeName"])}!`);
                    return state;
                }
            }
            //控件数放入检测
            let count = parseInt(state.controlExtra.dropCount[itemType]);
            if (dropCountCheck(formBody, itemType, count)) {
                message.error(`${controlItem.name}已达到最大上限${count}个!`);
                return state;
            }
            let item = buildFormItem(com.Guid(), itemType, container, formState, state.wrappedComponent, {
                select: false,
                dragging: false
            });
            item.itemBase.name += formBody.filter(a => a.get("itemType") === item.itemType).size + 1;
            item.itemBase.lang = { [config.defaultLang]: item.itemBase.name };
            formState = registFormItem(item, formState);
            formBody = formState.get("formBody");

            all[action.formTemplateVersionId] = formState
                .set("isCanCancelMoveFormItem", false)
                .set("formBody", formBody)
                .set("foreignKeys", foreignKeys)
                .set("isUpdateVersion", true);
            return { ...state, all };
        },
        //获取子表列表
        getSubTableList(state, action) {
            let { formTemplateVersionId, id } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let currentTable = formBody.find(a => a.get("id") === id);
            if (currentTable) {
                let subTableList = formBody.filter(a => a.get("id") !== id && a.get("isSubTable") === true &&
                    a.get("itemType") !== "Root" && a.get("status") !== FORMSTATUS.Delete)
                    .map(a => ({
                        id: a.get("id"),
                        name: a.getIn(["itemBase", "name"])
                    })).toJS();
                let index = formBody.indexOf(currentTable);
                all[action.formTemplateVersionId] = formState.set("formBody", formBody.set(index, currentTable.set("subTableList", subTableList)));
                return { ...state, all };
            }
            return state;
        },

        addFormItem(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            if (formState.get("dragIndex")) {
                const { id, itemType, container, isCanCancelMoveFormItem } = action;
                //let foreignKeys = formState.get("foreignKeys");
                let currentIndex = formState.get("currentIndex");
                let formBody = formState.get("formBody");
                let item = buildFormItem(id, itemType, container, formState, state.wrappedComponent, {
                    select: true,
                    dragging: true
                });
                item.itemBase.name += formBody.filter(a => a.get("itemType") === item.itemType).size + 1;
                item.itemBase.lang = { [config.defaultLang]: item.itemBase.name };
                formState = registFormItem(item, formState);
                formBody = formState.get("formBody");
                if ("isCanCancelMoveFormItem" in action) {
                    formState = formState.set("isCanCancelMoveFormItem", isCanCancelMoveFormItem);
                }
                if (currentIndex !== -1) {
                    formBody = changeSelect(currentIndex, formBody, false);
                    formState = formState.set("formBody", formBody);
                }
                all[action.formTemplateVersionId] = formState
                //.set("foreignKeys", foreignKeys)
                    .set("dragIndex", id)
                    .set("currentIndex", id)
                    .set("isUpdateVersion", true);
            }
            return { ...state, all };
        },
        addForeignKey(state, action) {
            let { type, formTemplateVersionId, ...other } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            all[formTemplateVersionId] = formState.set("foreignKeys", buildTableForeignkey(action));
            return { ...state, all };
        },
        //复制
        copyFormItem(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            const { id, itemType } = action;
            let formBody = formState.get("formBody");
            let dropCount = state.controlExtra.dropCount[itemType];
            if (dropCountCheck(formBody, itemType, dropCount)) {
                message.error("已达到最大上限，无法复制！");
                return state;
            }
            const current = formBody.find(i => i.get("id") === id);
            let newItem = current
                .set("id", com.Guid())
                .set("status", FORMSTATUS.Add) /*.set('dataLinker', fromJS([]))*/
                .set("select", false)
                .toJS();
            formState = registFormItem(newItem, formState);
            all[action.formTemplateVersionId] = formState;
            return { ...state, all };
        },
        removeFormItemBatch(state, action) {
            if (action.list.length > 0) {
                let all = state.all;
                let formState = all[action.formTemplateVersionId];
                let formBody = formState.get("formBody");
                let delList = formBody.filter(a => action.list.includes(a.get("id")));
                delList.forEach(c => {
                    formState = delFormItem(c, formState);
                });
                all[action.formTemplateVersionId] = formState
                //.set("formBody", formBody)
                    .set("currentIndex", -1)
                    .set(
                        "formStatus",
                        formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify
                    )
                    .set("isUpdateVersion", true);
                return { ...state, all };
            } else return state;
        },
        removeFormExternalItemBatch(state, action) {
            if (action.list.length > 0) {
                let all = state.all;
                let formState = all[action.formTemplateVersionId];
                let formBody = formState.get("formBody");
                let allContainers = getAllContainers(action.id, formBody);
                let delList = formBody.filter(
                    a =>
                        action.list.includes(a.getIn(["itemBase", "externalId"])) &&
                        allContainers.includes(a.get("container"))
                );
                let renderList = getAllDelegateParents(
                    allContainers, //delList.map(a => a.get("id")).toJS(),
                    action.id,
                    formState.get("formBody"),
                    formState.get("rootContainer")
                );
                delList.forEach(c => {
                    formState = delFormItem(c, formState);
                });
                all[action.formTemplateVersionId] = formState
                    .set("renderList", fromJS(renderList))
                    .set(
                        "formStatus",
                        formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify
                    )
                    .set("isUpdateVersion", true);
                return { ...state, all };
            } else return state;
        },
        removeFormItem(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            const id = action.id;
            const c = formBody.find(i => i.get("id") === id);
            formState = delFormItem(c, formState);
            let renderList = getAllDelegateParents(id, c.get("container"), formBody, formState.get("rootContainer"));
            all[action.formTemplateVersionId] = formState
                .set("currentIndex", -1)
                .set("formStatus", formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify)
                .set("renderList", fromJS(renderList))
                .set("isUpdateVersion", true);
            return { ...state, all };
        },
        moveFormItem(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let { frm, to } = action;
            if (frm === -1 && state.get("dragIndex") !== -1) frm = formState.get("dragIndex");
            let formBody = formState.get("formBody");
            let rootContainer = formState.get("rootContainer");
            let frmC = formBody.find(i => i.get("id") === frm);
            if (frmC === undefined) return state;
            let toC = formBody.find(i => i.get("id") === to);
            let fidx = formBody.indexOf(frmC);
            let tidx = formBody.indexOf(toC);
            let getRenderList = () => {
                let containers = getAllDelegateParents(frm, frmC.get("container"), formBody, rootContainer);
                //console.log(' tab renderlist', containers)
                return fromJS(containers);
            };
            if (action.formControlType === FormControlType.Container) {
                switch (action.direction) {
                    case "top":
                        if (fidx > tidx) {
                            formBody = formBody.delete(fidx).insert(tidx, frmC);
                            all[action.formTemplateVersionId] = formState
                                .set("formBody", formBody)
                                .set("renderList", getRenderList());
                            return { ...state, all };
                        }
                        break;
                    case "bottom":
                        if (fidx < tidx) {
                            formBody = formBody.delete(fidx).insert(tidx, frmC);
                            all[action.formTemplateVersionId] = formState
                                .set("formBody", formBody)
                                .set("renderList", getRenderList());
                            return { ...state, all };
                        }
                        break;
                    default:
                        break;
                }
                return state;
            } else {
                formBody = formBody.delete(fidx).insert(tidx, frmC);
                all[action.formTemplateVersionId] = formState
                    .set("formBody", formBody)
                    .set("renderList", getRenderList())
                    .set(
                        "formStatus",
                        formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify
                    );
                return { ...state, all };
            }
        },
        isCanCancelMoveFormItem(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            all[action.formTemplateVersionId] = formState.set("isCanCancelMoveFormItem", action.flag);
            return { ...state, all };
        },
        setGroupName(state, action) {
            let { id, formTemplateVersionId, name } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let groupItem = formBody.find(a => a.get("id") === id);
            if (groupItem) {
                let gIndex = formBody.indexOf(groupItem);
                let groupChildren = groupItem.getIn(["itemBase", "groupItems"]).toJS();
                let reg = new RegExp(/\{name\}/, "gm");
                for (let key in groupChildren) {
                    let child = formBody.find(a => a.get("id") === groupChildren[key].id);
                    if (child) {
                        let cIndex = formBody.indexOf(child);
                        formBody = formBody.set(
                            cIndex,
                            child.setIn(["itemBase", "name"], groupChildren[key].name.replace(reg, name))
                                .set("status", child.get("status") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify)
                        );
                    }
                }
                formBody = formBody.set(
                    gIndex,
                    groupItem
                        .setIn(["itemBase", "name"], name)
                        .set("status", groupItem.get("status") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify)
                );
                all[formTemplateVersionId] = formState
                    .set("formBody", formBody)
                    .set(
                        "formStatus",
                        formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify
                    );
                return { ...state, all };
            }
            return state;
        },
        cancelMoveFormItem(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            let oldContainer = formState.get("oldContainer");
            let rootContainer = formState.get("rootContainer");
            let isCanCancelMoveFormItem = formState.get("isCanCancelMoveFormItem");
            if (!isCanCancelMoveFormItem) {
                return state;
            }
            if (oldContainer) {
                let item = formBody.find(i => i.get("id") === action.id);
                let index = formBody.indexOf(item);
                if (item === undefined) {
                    return state;
                }
                let renderList = getAllDelegateParents(action.id, item.get("container"), formBody, rootContainer);
                renderList = renderList.concat(
                    getAllChildren(oldContainer, formBody, rootContainer).filter(a => !renderList.includes(a))
                );

                item = item.set("container", oldContainer); // || rootContainer);
                formBody = formBody.set(index, item);
                all[action.formTemplateVersionId] = formState
                    .set("dragIndex", -1)
                    .set("formBody", formBody)
                    .set("renderList", fromJS(renderList));
                return { ...state, all };
            } else {
                const id = formState.get("dragIndex");
                let item = formBody.find(a => a.get("id") === id);
                let index = formBody.indexOf(item);
                formBody = formBody.delete(index);
                if ("isCanCancelMoveFormItem" in action) {
                    formState = formState.set("isCanCancelMoveFormItem", action.isCanCancelMoveFormItem);
                }
                all[action.formTemplateVersionId] = formState
                    .set("formBody", formBody)
                    .set("dragIndex", -1)
                    .set("currentIndex", -1);
                return { ...state, all };
            }
        },
        beginDragItem(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            let dragIndex = formState.get("dragIndex");
            if (dragIndex !== -1 && action.id !== dragIndex) {
                let oldItem = formBody.find(a => a.get("id") === dragIndex);
                let oldIndex = formBody.indexOf(oldItem);
                formBody = formBody.set(oldIndex, oldItem.set("dragging", false));
            }
            const id = dragIndex === -1 ? action.id : dragIndex;
            if (id !== dragIndex) {
                let newItem = formBody.find(a => a.get("id") === id);
                let newIndex = formBody.indexOf(newItem);
                formBody = formBody.set(newIndex, newItem.set("dragging", true));
            }
            all[action.formTemplateVersionId] = formState
                .set("dragIndex", id)
                .set("oldContainer", action.container)
                .set("formBody", formBody);
            return { ...state, all };
        },
        endDragItem(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            let newItem = formBody.find(a => a.get("id") === action.id);
            if (newItem) {
                let newIndex = formBody.indexOf(newItem);
                let renderList = getAllDelegateParents(
                    newItem.get("id"),
                    newItem.get("container"),
                    formBody,
                    formState.get("rootContainer")
                );
                formBody = formBody.set(newIndex, newItem.set("dragging", false));
                formState = formState.set("isCanCancelMoveFormItem", false);
                all[action.formTemplateVersionId] = formState
                    .set("dragIndex", -1)
                    .set("formBody", formBody)
                    .set("renderList", fromJS(renderList));
                return { ...state, all };
            }
            return state;
        },
        setCurrent(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            let rootContainer = formState.get("rootContainer");
            let currentIndex = formState.get("currentIndex");
            if (action.hasOwnProperty("id") && currentIndex !== action.id) {
                formBody = changeSelect(currentIndex, formBody, false);
                let index = -1;
                let item = formBody.find(a => a.get("id") === action.id);
                if (item) {
                    console.log(item.toJS());
                    //选中
                    index = action.id;
                    formBody = changeSelect(index, formBody, true);
                    let renderList = getAllDelegateParents(action.id, item.get("container"), formBody, rootContainer);
                    if (currentIndex !== -1) {
                        let oldCurrent = formBody.find(a => a.get("id") === currentIndex);
                        renderList = renderList.concat(
                            getAllDelegateParents(
                                oldCurrent.get("id"),
                                oldCurrent.get("container"),
                                formBody,
                                rootContainer
                            )
                        );
                    }
                    all[action.formTemplateVersionId] = formState
                        .set("currentIndex", index)
                        .set("formBody", formBody)
                        .set("renderList", fromJS(renderList));
                } else {
                    //选表单属性
                    formBody = changeSelect(index, formBody, true);
                    all[action.formTemplateVersionId] = formState.set("currentIndex", index).set("formBody", formBody);
                }

                return { ...state };
            }
            return state;
        },
        setFormProperties(state, action) {
            //设置表单属性
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formProperties = formState.get("formProperties");
            //let { key, value } = action.data;
            let data = action.data;
            formProperties = formProperties.merge(fromJS(data));
            let formBody = formState.get("formBody");
            formBody = formBody.map(
                e => e.merge(fromJS(data)) //.set(key, value)
            );
            //console.log(formBody.toJS())
            let renderList = formBody.filter(a => a.get("formControlType") > 0).map(a => a.get("id"));
            all[action.formTemplateVersionId] = formState
                .set("formProperties", formProperties)
                .set("formBody", formBody)
                .set("formStatus", formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify)
                .set("renderList", renderList);
            return { ...state, all };
        },
        setTitle(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            let formList = formState.get("formList").toJS();
            let mainForm = formList.find(a => a.formType === FORM_TYPE.mainForm);
            mainForm.name = action.formTitle;
            mainForm.operationStatus = mainForm.operationStatus === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify;
            formBody = formBody.set(0, formBody.get(0).setIn(["itemBase", "name"], action.formTitle));
            formState = formState
                .set("formTitle", action.formTitle)
                .set("formList", fromJS(formList))
                .set("formBody", formBody);
            if (formState.get("formStatus") !== FORMSTATUS.Add) {
                formState = formState.set("formStatus", FORMSTATUS.Modify);
            }
            all[action.formTemplateVersionId] = formState;
            return { ...state, all };
        },
        setStatus(state, action) {
            //改变状态
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");

            if (formState.get("formStatus") !== FORMSTATUS.Add) {
                let self = formBody.find((e, i) => {
                    return e.id === action.id;
                });
                if (self.status !== FORMSTATUS.Add) {
                    self.status = FORMSTATUS.Modify;
                    let father = formBody.find((e, i) => {
                        return e.id === self.container;
                    });
                    father && (father.status = FORMSTATUS.Modify);
                }
                all[action.formTemplateVersionId] = formState
                    .set("formStatus", FORMSTATUS.Modify)
                    .set("formBody", formBody);
            }
            return { ...state, all };
        },
        removeDataLinker(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            let item = formBody.find(a => a.get("id") === action.id);
            if (item) {
                let index = formBody.indexOf(item);
                //改变子，父，状态
                if (item.get("status") !== FORMSTATUS.Add) {
                    item = item.set("status", FORMSTATUS.Modify);
                }
                let dataLinker = item.get("dataLinker").toJS();
                let except = dataLinker.filter(action.filter);
                let newDataLinker = dataLinker.filter(a => !except.includes(a));
                item = item.set("dataLinker", fromJS(newDataLinker));
                formBody = formBody.set(index, item);
                formState = formState
                    .set("formBody", formBody)
                    .set("updateDataLinker", true)
                    .set("renderList", fromJS([action.id]));
                if (formState.get("formStatus") !== FORMSTATUS.Add) {
                    formState = formState.set("formStatus", FORMSTATUS.Modify);
                }
                all[action.formTemplateVersionId] = formState;
                return { ...state, all };
            } else return state;
        },
        setDataLinker(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            let item = formBody.find(a => a.get("id") === action.id);
            if (item) {
                let index = formBody.indexOf(item);
                //改变子，父，状态
                if (item.get("status") !== FORMSTATUS.Add) {
                    item = item.set("status", FORMSTATUS.Modify);
                    let parent = getFormContainerByContainerId(item.get("container"), formBody);
                    let pidx = formBody.indexOf(parent);
                    formBody = formBody.set(
                        pidx,
                        parent.set(
                            "status",
                            parent.get("status") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify
                        )
                    );
                }
                //这些类型的联动关系不能并存
                // DefaultValue: 0,//默认值
                // Formula: 1,//公式计算
                // Linker: 2,//数据联动
                // Request: 3,//数据请求
                // Resource: 4,//其他资源
                // External: 5,//外部引用
                // //以下联动关系独立存在
                // environment:6,//环境变量
                // Display: 8,//显示
                // Custom: 9//自定义
                let dataLinker = item.get("dataLinker");
                let newDataLinker = action.dataLinker;
                let { linkType } = newDataLinker;
                if (linkType < 6 && dataLinker.some(e => e.get("linkType") < 6)) {
                    //0-5只能存在一个
                    dataLinker = dataLinker.filter(a => a.get("linkType") > 6);
                } else if (dataLinker.some(a => a.get("linkType") === linkType)) {
                    //如果存在就替换，否则新增
                    dataLinker = dataLinker.filter(a => a.get("linkType") !== linkType);
                }
                dataLinker = dataLinker.push(fromJS(newDataLinker));
                item = item.set("dataLinker", dataLinker);
                switch (newDataLinker.linkType) {
                    case LINKTYPE.DefaultValue:
                        item = item
                            .setIn(["itemBase", "defaultValue"], newDataLinker.linkValue)
                            .deleteIn(["authority", "readOnly", "dataLinker"]);
                        break;
                    case LINKTYPE.Linker:
                    case LINKTYPE.Formula:
                    case LINKTYPE.Resource:
                    case LINKTYPE.External:
                        //case LINKTYPE.Environment:
                        //item = item.setIn(['authority', 'readOnly', 'dataLinker'], true).setIn(['itemBase', 'defaultValue'], null);
                        item = item.setIn(["itemBase", "defaultValue"], null);
                        break;
                    default:
                        //item = item.deleteIn(['authority', 'readOnly', 'dataLinker']).deleteIn(['itemBase', 'defaultValue']);
                        item = item.deleteIn(["itemBase", "defaultValue"]);
                        break;
                }
                formBody = formBody.set(index, item);
                formState = formState.set("formBody", formBody).set("updateDataLinker", true); //.set('updateFlag', !formState.get('updateFlag'));
                if (formState.get("formStatus") !== FORMSTATUS.Add) {
                    formState = formState.set("formStatus", FORMSTATUS.Modify);
                }
                all[action.formTemplateVersionId] = formState;
                return { ...state, all };
            }
            else
                return state;
        },
        changeContainer(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            let item = formBody.find(a => a.get("id") === action.id);
            //console.log('changeContainer', item.toJS(), action);
            if (
                item &&
                (item.get("container") !== action.to ||
                    (action.groupId && item.getIn(["itemBase", "groupId"]) !== action.groupId)) &&
                item.get("id") !== action.to
            ) {
                //console.log('change container', action, item.toJS());
                let index = formBody.indexOf(item);
                let rootContainer = formState.get("rootContainer");
                let renderList = [];
                let changeTable = false;
                let oldContainer = formBody.find(a => a.get("id") === item.get("container"));
                let newContainer = formBody.find(a => a.get("id") === action.to);
                let oldIndex = formBody.indexOf(oldContainer);
                let newIndex = formBody.indexOf(newContainer);
                let excutedMove = false;
                // if (newContainer.get("valueType") === item.get("valueType")) {
                //     message.error(`${newContainer.get("itemBase").toJS().typeName}不支持放入${item.get("itemBase").toJS().typeName}!`);
                //     return state;
                // }
                //容器需要做全子级valueType 和 dropOnSubForm判定
                if (item.get("formControlType") === FormControlType.Container) {
                    let dropItemValueTypes = state.controlExtra.dropItemValueTypes[newContainer.get("itemType")];
                    let allChildren = getAllChildren(item.get("id"), formBody);
                    let allValueTypes = Array.from(new Set(allChildren.map(a => a.get("valueType")).toJS().concat([item.get("valueType")]))).filter(a => a);
                    if (dropItemValueTypes &&
                        allValueTypes.some(a => !dropItemValueTypes.includes(a))) {
                        message.error(`${item.getIn(["itemBase", "name"])}中有控件不支持放入${newContainer.getIn(["itemBase", "name"])}!`);
                        return state;
                    }
                    if (newContainer.get("isSubTable") === true) {
                        let allItemTypes = Array.from(new Set(allChildren.map(a => a.get("itemType")).toJS().concat([item.get("valueType")]))).filter(a => a);
                        if (allItemTypes.some(a => state.controlExtra.dropOnSubForm[a]) === false)
                            message.error(`${item.getIn(["itemBase", "name"])}中有控件不支持放入${newContainer.getIn(["itemBase", "name"])}!`);
                        return state;
                    }
                }
                let frm = item.get("container");
                if (oldContainer.get("formId") !== newContainer.get("formId")) {
                    changeTable = true;
                }
                //只有是新加的表单项字段可以跨表拖拽
                if ((changeTable && item.get("status") === FORMSTATUS.Add) || !changeTable) {
                    item = item
                        .set("container", action.to)
                        .set("status", item.get("status") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify);
                    formBody = formBody.set(index, item);
                    formState = formState.set("formBody", formBody);
                    if (!item.hasIn(["itemBase", "formId"]))
                        formState = setItemFormId(
                            getFormContainerByContainerId(item.get("container"), formBody).getIn([
                                "itemBase",
                                "formId"
                            ]),
                            item,
                            formState
                        );
                    item = formState.getIn(["formBody", index]);
                    formState = formState.set(
                        "formStatus",
                        formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify
                    );
                    excutedMove = true;
                }
                if (excutedMove) {
                    if (frm !== rootContainer) {
                        if (oldContainer.has("proxy")) {
                            //移除代理
                            item = item.delete("delegateAttr").delete("delegate");
                            formState = formState.setIn(["formBody", index], item);
                        }
                        //console.log('onRemoveItem begin', formState.toJS());
                        formState = handleMoveItemEvent(
                            "onRemoveItem",
                            formState,
                            oldContainer,
                            item,
                            item.getIn(["itemBase", "groupId"])
                        );
                        //console.log('onRemoveItem end', formState.toJS());
                        renderList = getAllDelegateParents(action.id, frm, formState.get("formBody"), rootContainer);
                        item = formState.getIn(["formBody", index]);
                    }
                    if (action.to !== rootContainer) {
                        if (oldIndex === newIndex) {
                            newContainer = formState.getIn(["formBody", newIndex]);
                        }
                        if (newContainer.has("proxy") || newContainer.has("delegateAttr")) {
                            item = item
                                .set("delegate", true)
                                .set(
                                    "delegateAttr",
                                    (item.get("delegateAttr") || fromJS({})).merge(
                                        fromJS(getAllDelegateAttr(item, formBody, rootContainer))
                                    )
                                );
                            formState = formState.setIn(["formBody", index], item);
                        }
                        //console.log('onAddItem begin', formState.toJS());
                        //控件额外增加控件事件触发
                        formState = handleMoveItemEvent("onAddItem", formState, newContainer, item, action.groupId);
                        //`console`.log('onAddItem end', formState.toJS());
                        renderList = renderList.concat(
                            getAllDelegateParents([], action.to, formState.get("formBody"), rootContainer).filter(
                                a => !renderList.includes(a)
                            )
                        );
                    }
                    //console.log('change container ', formState.toJS());
                }

                all[action.formTemplateVersionId] = formState.set("renderList", fromJS(renderList));
                return { ...state, all };
            } else return state;
        },
        saveSuccess(state) {
            return { ...state };
        },
        PreviewShowFnSuccess(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            formState = formState.set("formBodyBak", formBody).set("formStatusBak", formState.get("formStatus"));
            let rootContainer = formState.get("rootContainer");
            let { dataLinker, valid } = initDataLinker(formBody.filter(a => a.get("status") !== FORMSTATUS.Delete));
            let validateRelations = initValidateRelations(formBody.filter(a => a.hasIn(["itemBase", "validateCustom"])).map(a => ({
                id: a.get("id"),
                relations: a.getIn(["itemBase", "validateCustom", "relations"])
            })).toJS());
            if (valid.length > 0)
                message.warn(`表单联动设置存在循环,请重新设置相关表单项：${valid.map(a => a.name).toString()}！`);
            formBody = initTableLinker(formState.hasIn(["formProperties", "tableLinker"]) ? formState.getIn(["formProperties", "tableLinker"]).toJS() : {}, formBody);
            formBody = formBody.map(e => {
                let previewComponent = state.wrappedComponent.find(a => a.itemType === e.get("itemType"));
                if (previewComponent) {
                    return e
                        .set("Component", e.get("WrappedComponent"))
                        .set("renderStyle", formState.get("formPreviewRenderStyle"));
                } else return e;
            });
            let result = initProxyPool(formBody, FormControlList, rootContainer);
            formBody = result.formBody;
            let proxyPool = result.proxyPool;
            //let proxyLinkData = initProxyLinkData(formBody, proxyPool);
            all[action.formTemplateVersionId] = formState
                .set("formBody", formBody)
                .set("showPreview", true)
                .set("dataLinker", fromJS(dataLinker))
                .set("validateRelations", fromJS(validateRelations))
                .set("bussinessLinker", fromJS({}))
                .set("proxyPool", proxyPool)
                .set("formRenderStyle", FORMRENDERSTYLE.PC);
            //.set('proxyLinkData', proxyLinkData);
            return { ...state, all };
        },
        PreviewHideFn(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBodyBak");
            let result = initProxyPool(formBody, FormControlList, formState.get("rootContainer"));
            let proxyPool = result.proxyPool;
            all[action.formTemplateVersionId] = formState
                .set("formBody", formBody)
                .set("proxyPool", proxyPool)
                .set("showPreview", false)
                .set("dataLinker", fromJS({}))
                .set("formStatus", formState.get("formStatusBak"))
                .set("formRenderStyle", FORMRENDERSTYLE.Design);
            return { ...state, all };
        },
        setIsUsed(state, action) {
            let { formTemplateVersionId } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            if (formState)
                all[formTemplateVersionId] = formState.set("isUsed", true);
            return { ...state, all };
        },
        setAuthority(state, action) {
            let { attr, key, formTemplateVersionId, value, id } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let item = formBody.find(a => a.get("id") === id);
            let index = formBody.indexOf(item);
            item = item
                .setIn(["authority", attr, key], value)
                .set("status", item.get("status") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify);
            if (key === "itemBase") {
                item = item.setIn([key, attr], value);
                formState = formState.set(
                    "formStatus",
                    formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify
                );
            }
            formBody = formBody.set(index, item);
            all[formTemplateVersionId] = formState
                .set("formBody", formBody)
                .set("renderList", fromJS([item.get("container"), item.get("id")]));
            return { ...state, all };
        },
        setExternalId(state, action) {
            let { externalId, id, formTemplateVersionId } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let item = formBody.find(a => a.get("id") === id);
            let index = formBody.indexOf(item);
            item = item
                .setIn(["itemBase", "externalId"], externalId)
                .set("isExternal", true)
                .set("status", item.get("status") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify);
            formBody = formBody.set(index, item);
            all[formTemplateVersionId] = formState.set("formBody", formBody);
            return { ...state, all };
        },
        showUserFuncsModel(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            all[action.formTemplateVersionId] = formState
                .set("userFuncsVisible", true)
                .set("userFuncsData", action.data);
            return { ...state, all };
        },
        userFuncsCancel(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            all[action.formTemplateVersionId] = formState
                .set("userFuncsVisible", false);
            //.set('proxyLinkData', proxyLinkData);
            action.saveStatus(false);
            return { ...state, all };
        },
        //添加业务组件
        addBusiness(state, action) {
            let { fieldAuth } = action;
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let container = formState.get("rootContainer");
            let formBody = formState.get("formBody");
            let businessKeyList = formBody.filter(a => a.get("itemType") === "BusinessKey");
            let currentList = businessKeyList.map(a => a.getIn(["itemBase", "businessKey"]));
            let fieldList = fieldAuth.map(a => a.key);
            let addList = [];
            // console.log(fieldAuth, currentList.toJS());
            // console.log(fieldAuth.filter(a => !currentList.includes(a.key)));
            addList = addList.concat(fieldAuth.filter(a => !currentList.includes(a.key)));
            businessKeyList.forEach(item => {
                if (item.get("status") === FORMSTATUS.Delete) {
                    // addList = fieldAuth.filter(a => currentList.includes(a.key));
                    addList = addList.concat(fieldAuth.filter(a => a.key === item.getIn(["itemBase", "businessKey"])));
                }

            });
            //console.log(addList);
            let delList = currentList.filter(a => !fieldList.includes(a));
            addList.forEach(item => {
                if (Array.isArray(item.fieldAuth)) {
                    item.fieldAuth.forEach(_item => {
                        let itemBase = {
                            name: _item.name,
                            businessKey: item.key,
                            bussineskeyAuth: _item.key
                        };
                        // itemBase.name = _item.name;
                        // itemBase.businessKey = item.key;
                        // itemBase.bussineskeyAuth = _item.key;
                        formBody = addTableSystemItem(container, formState.get("formList").find(a => a.get("formType") === FORM_TYPE.mainForm).get("id"), formBody, "BusinessKey", com.Guid(), itemBase, true);
                    });
                    //console.log(formBody.toJS());
                }
            });
            delList.forEach(item => {
                let l = formBody.filter(a => a.getIn(["itemBase", "businessKey"]) === item);
                l.forEach(a => {
                    if (a.get("status") === FORMSTATUS.Add) {
                        formBody = formBody.filter(b => b.get("id") !== a.get("id"));
                    } else {
                        let index = formBody.indexOf(a);
                        formBody = formBody.set(index, a.set("status", FORMSTATUS.Delete));
                    }
                });
            });
            all[action.formTemplateVersionId] = formState.set("formBody", formBody)
                .set("formStatus", formState.get("formStatus") === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify);
            //console.log(formBody.toJS());
            return { ...state, all };
        },
        //构建表单关系配置
        buildSaveData(state, action) {
            let all = state.all;
            let { dataMain, formTemplateVersionId } = action;
            let formState = all[formTemplateVersionId];
            all[action.formTemplateVersionId] = formState
                .set("BuildContactData", dataMain);
            return { ...state, all };
        },
        setLangValue(state, action) {
            let { id, lang, value, formTemplateVersionId } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let formItem = formBody.find(a => a.get("id") === id);
            if (formItem) {
                let index = formBody.indexOf(formItem);
                formItem = formItem.setIn(["itemBase", "lang", lang], value);
                formBody = formBody.set(index, formItem);
                all[action.formTemplateVersionId] = formState
                    .set("formBody", formBody);
                return { ...state, all };

            }
            else {
                return state;
            }
        },
        ...reducers(FORMRENDERSTYLE.Design)
    }
};
