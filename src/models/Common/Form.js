import React from "react";
import { fromJS } from "immutable";
import _ from "underscore";
import FormControlType from "../../enums/FormControlType";
import ControlStatus from "../../enums/FormControlStatus";
import FORMSTATUS from "../../enums/FormStatus";
import RenderStyle from "../../enums/FormRenderStyle";
import { delay } from "redux-saga";
import {
    getExternalValue,
    getFormulaValue,
    getLinkRelations,
    LINKTYPE,
    getAllRelations
} from "../../components/FormControl/DataLinker/DataLinker";
import { ValidateFormNew } from "../../components/FormControl/ValidateForm";
import ControlType from "../../enums/ControlType";
import ControlList from "../../components/FormControl/FormControlList";
import FORM_TYPE from "../../enums/FormType";
import com from "../../utils/com";
import { getModifyDataSource, requestData } from "../../services/FormBuilder/FormBuilder";
import { methodTypeList } from "../../utils/DataSourceConfig";
import { exportJsonData } from "../../utils/dynamicJson";
import FormContainerBase, { formContainerBaseInitialEvent } from "../../components/FormControl/FormContainerBase";
import FormGroupBase, { formGroupBaseInitialEvent } from "../../components/FormControl/FormGroupBase";
import FormItemBase, { formItemBaseInitialEvent } from "../../components/FormControl/FormItemBase";
import FormExternalBase, { formExternalBaseInitialEvent } from "../../components/FormControl/FormExternalBase";
import FormMarkBase, { formMarkBaseInitialEvent } from "../../components/FormControl/FormMarkBase";
import moment from "moment";
import bussinessComponents from "../../plugins/businessComponents/componentsList";
import { GetPermission } from "../../services/Workflow/Workflow";
import { getEnvironmentValue } from "../../enums/EnvironmentType";
import { Tooltip } from "antd";
import styles from "./Form.less";

//表单数据模型
// let formDataModel = [
//     //主表
//     {
//         formId: 0,
//         formType: 0,
//         values: [{ id: 'a', value: 2, authority: {}, updated: true }, { id: 'b', value: 2 }]
//     },
//     //子表
//     {
//         formId: 1,
//         formType: 1,
//         parentFormId: 0,
//         values: [
//             { list: [{ id: 'c', value: 2 }, { id: 'd', value: 2 }, { id: 'e', value: 2 }], parentIndex: 0 },
//             { list: [{ id: 'c', value: 2 }, { id: 'd', value: 2 }, { id: 'e', value: 2 }], parentIndex: 0 },
//         ]
//     },
//     //子表嵌入子表
//     {
//         formId: 2,
//         formType: 1,
//         parentFormId: 1,
//         values: [
//             { list: [{ id: 'f', value: 2 }, { id: 'g', value: 2 }, { id: 'h', value: 2 }], parentIndex: 0 },
//             { list: [{ id: 'f', value: 2 }, { id: 'g', value: 2 }, { id: 'h', value: 2 }], parentIndex: 0 },
//             { list: [{ id: 'f', value: 2 }, { id: 'g', value: 2 }, { id: 'h', value: 2 }], parentIndex: 1 },
//             { list: [{ id: 'f', value: 2 }, { id: 'g', value: 2 }, { id: 'h', value: 2 }], parentIndex: 1 },
//         ]
//     },
// ];
const tdStyle = { padding: "6px 10px" };
const errTdStyle = { "boxShadow": "inset 0 0 8px #f5222d" };

//初始化控件扩展属性
export function initControlExtra(controlExtraList) {
    let extra = {};
    controlExtraList.forEach(b => {
        extra[b] = {};
    });
    ControlList.forEach(a => {
        controlExtraList.forEach(b => {
            if (a[b] !== undefined) extra[b][a.itemType] = a[b];
        });
    });
    return extra;
}

export function buildLinkFormList(linkFormList, controlExtra) {
    let foreignFormData = [];
    linkFormList.forEach(a => {
        //将控件组放入
        a.areas.forEach(area => {
            let property = JSON.parse(area.property || "{}");
            if (property.groupItems) {
                let formCode = "";
                for (let groupKey in property.groupItems) {
                    let groupItem = property.groupItems[groupKey];
                    let filed = a.fields.find(f => f.id === groupItem.id); //_.where(a.fields, { id: groupItem.id })[0];
                    if (filed) {
                        formCode = filed.formCode;
                        filed.groupId = area.id;
                        filed.groupItem = true;
                        filed.groupItemPrivate = property.groupItems[groupKey].private === true;
                        property.groupItems[groupKey] = { ...property.groupItems[groupKey], ...filed };

                    }
                }
                let group = {
                    id: area.id,
                    formCode: formCode,
                    name: property.name,
                    controlType: property.type,
                    formControlType: FormControlType.Group,
                    valueType: controlExtra.valueType[area.areaType],
                    groupItems: property.groupItems
                };
                if (
                    controlExtra.event[area.areaType] &&
                    controlExtra.event[area.areaType].onGetLinkerParams instanceof Function
                ) {
                    let groupFormularItems = controlExtra.event[area.areaType].onGetLinkerParams(
                        property
                    );
                    groupFormularItems.forEach(g => {
                        let groupItem = a.fields.find(b => b.id === g.id);
                        if (groupItem) {
                            group.formType = groupItem.formType;
                            groupItem.groupItem = true;
                            groupItem.groupItemPrivate = g.private === true;
                            groupItem.valueType = g.valueType;
                            let str1 = groupItem.name;
                            let str2 = g.name;
                            if (str1.indexOf("{name}") > -1) {
                                groupItem.name = str1.replace(/{name}/gm, str2);
                            }
                            else {
                                let name = str1.replace(str2.replace(/^([^s]*)\./, ""), "") + str2;
                                groupItem.name = name;
                            }
                            if (property.dicMode) {
                                group.name = groupItem.name;
                                group.status = groupItem.status;
                            }
                        }
                    });
                }
                a.fields.push(group);
            }
        });
        a.fields.forEach(field => {
            if (field.controlType !== "None") {
                let valueType = controlExtra.valueType[field.controlType];
                field.valueType = valueType;
            }
            foreignFormData.push({
                id: field.id,
                name: field.name,
                type: field.controlType,
                valueType: field.valueType,
                hidden: field.hidden
            });
        });
    });
    return { linkFormList, foreignFormData };
}

//权限权重
const formAutorityPower = Object.freeze({
    external: 10,//关联
    formula: 9,//公式  条件隐藏
    itemBase: 8,//控件属性
    workFlow: 7,//流程权限控制
    //业务组件默认为6
    system: 5//系统缺省
});

export function checkFormReady(formBody) {
    let exist = formBody.find(a => a.getIn(["itemBase", "readyToSubmit"]) === false);
    if (exist)
        return exist.getIn(["itemBase", "name"]);
    return null;
}

export function buildControlAuthority(authority) {
    let controlAuthority = { hidden: false, disabled: false, readOnly: false };
    if (authority) {
        for (let key in controlAuthority) {
            let highestTrue = 0, highestFalse = 0;
            for (let type in authority[key]) {
                //找不到说明是业务组件
                let power = formAutorityPower[type] === undefined ? 6 : formAutorityPower[type];
                if (authority[key][type] === true && power > highestTrue) {
                    highestTrue = formAutorityPower[type];
                }
                else if (power > highestFalse) {
                    highestFalse = formAutorityPower[type];
                }
            }
            if (highestTrue !== 0) {
                if (highestTrue >= highestFalse)
                    controlAuthority[key] = true;
                else
                    controlAuthority[key] = false;
            }
        }
    }
    let { required, ...other } = controlAuthority;
    if (required !== undefined)
        return controlAuthority;
    return other;
}

export const FormControlList = ControlList;

let showCollapse = false;

export function ControlTypeTransf(e) {
    if (Object.keys(ControlType).indexOf(e) > -1) {
        return ControlType[e];
    } else {
        let key = null;
        for (let i in ControlType) {
            if (ControlType[i] === e) {
                key = i;
                return key;
            }
        }
        return ControlType.None;
    }
}

export function initTableLinker(tableLinker, formBody) {
    // tableLinker = {
    //     '66a030e9-5136-acde-123d-ace19ea115be': ['4dcf0c97-3ab5-653e-4cde-6a9818e1ff21', 'b2ce510d-80bb-aa2b-1d9c-d5bf653c9b39'],
    //     '4dcf0c97-3ab5-653e-4cde-6a9818e1ff21': ['b196d9f7-64a5-1d92-0d0c-3b0c7b63a382', '16bf3499-51f8-8492-bfc0-9f94e73d7032']
    // };
    for (let parentTableId in tableLinker) {
        tableLinker[parentTableId].forEach(subTableId => {
            let subTable = formBody.find(a => a.get("id") === subTableId);
            if (subTable) {
                let index = formBody.indexOf(subTable);
                let exist = formBody.find(a => a.get("container") === subTableId && a.get("itemType") === "TableLinker" && a.get("status") !== FORMSTATUS.Delete);
                if (exist)
                    formBody = formBody.set(index, subTable.set("tableLinkerId", exist.get("id")));
            }
        });
    }
    return formBody;
}

function buildValidateList(validateRelations, list, formDataModel, formBody) {
    let extraList = [];
    let formBodyJs = formBody.toJS();
    list.forEach(a => {
        let currentIds = a.items.map(a => a.id);
        let currentForm = formBody.find(a => a.get("id") === currentIds[0]);
        let currentFormId = currentForm ? currentForm.get("formId") : null;
        let allIds = getAllRelations(currentIds, validateRelations);
        allIds.filter(b => !currentIds.includes(b)).forEach(b => {
            let formId = formBody.find(c => c.get("id") === b).get("formId");
            if (formId === currentFormId) {
                a.items.push({
                    id: b,
                    data: { value: getFormItemValueNew(b, formBodyJs, formDataModel, a.proxyIndex) }
                });
            }
            else {
                let extraForm = formDataModel.find(c => c.id === formId);
                switch (extraForm.formType) {
                    default:
                    case FORM_TYPE.mainForm:
                        extraList.push({
                            proxyIndex: -1,
                            items: [{ id: b, data: { value: extraForm.values.find(c => c.id === b).value } }]
                        });
                        break;
                    case FORM_TYPE.subForm:
                        extraForm.values.forEach((c, i) => {
                            extraList.push({
                                proxyIndex: i,
                                items: [{ id: b, data: { value: c.list.find(d => d.id === b).value } }]
                            });
                        });
                        break;
                }
            }
        });
    });
    return combineFormData(list, extraList, formBody);
}

function buildDelegateAttr(containerId, formBody, rootContainer) {
    let newFormBody = formBody;
    formBody
        .filter(a => a.get("container") === containerId)
        .forEach(item => {
            let index = formBody.indexOf(item);
            let delegateAttr = item.get("delegateAttr") || fromJS({});
            //代理配置写入
            newFormBody = newFormBody.set(
                index,
                item
                    .set("delegate", true)
                    .set("delegateAttr", delegateAttr.merge(fromJS(getAllDelegateAttr(item, formBody, rootContainer))))
            );
            if (item.get("formControlType") > 0) newFormBody = buildDelegateAttr(item.get("id"), newFormBody);
        });
    return newFormBody;
}

//初始化代理池,代理属性注入
export function initProxyPool(formBody, controlList, rootContainer) {
    let proxyPool = {};
    let newFormBody = formBody;
    let proxyList = formBody
        .filter(
            a =>
                a.get("proxy") &&
                (a.get("formControlType") === FormControlType.Container ||
                    a.get("formControlType") === FormControlType.External)
        )
        .groupBy(a => a.get("itemType"));
    proxyList.forEach(list => {
        let control = controlList.find(a => a.itemType === list.getIn([0, "itemType"]));
        list.forEach(proxyItem => {
            //代理池存储
            if (control.proxy.storage instanceof Function)
                proxyPool[proxyItem.get("id")] = control.proxy.storage() || {};
            //代理初始化完成事件
            if (control.proxy.events && control.proxy.events.onInit instanceof Function) {
                proxyPool[proxyItem.get("id")] = control.proxy.events.onInit.call(
                    proxyItem.get("itemBase").toJS(),
                    proxyPool[proxyItem.get("id")]
                );
                //无数据时，子控件状态为静态
                newFormBody
                    .filter(a => a.get("container") === proxyItem.get("id"))
                    .forEach(item => {
                        let index = newFormBody.indexOf(item);
                        newFormBody = newFormBody.setIn([index, "controlStatus"], ControlStatus.Static);
                    });
            }
            newFormBody = buildDelegateAttr(proxyItem.get("id"), newFormBody, rootContainer);
        });
    });
    return { formBody: newFormBody, proxyPool: fromJS(proxyPool) };
}

//初始化代理控件
export function initProxyItem(item, controlItem) {
    item.proxy = true;
    //代理配置注册
    item.proxyAttr = controlItem.proxy.attr;
    //事件注册
    if (controlItem.proxy.events instanceof Object) {
        item.proxyEvents = controlItem.proxy.events;
    }
}

//初始化代理控件及代理池
export function initProxyItemWithPool(item, controlItem) {
    // let a = new SYLaunch()
    item.proxy = true;
    //代理配置注册
    item.proxyAttr = controlItem.proxy.attr;
    let itemBase = item.itemBase;
    let proxyPoolItem = {};
    //代理池注册
    if (controlItem.proxy.storage instanceof Function) proxyPoolItem = controlItem.proxy.storage.call(itemBase) || {};
    //事件注册
    if (controlItem.proxy.events instanceof Object) {
        item.proxyEvents = controlItem.proxy.events;
        //代理初始化事件
        if (item.proxyEvents.onInit instanceof Function) {
            proxyPoolItem = item.proxyEvents.onInit.call(itemBase, proxyPoolItem /*, []*/);
        }
    }
    return proxyPoolItem;
}

function buildDataFilterCondition({ condition: { field, formCode, formType, operationType = "4", targetType = "formItem", targetValue, targetId }, allRelItems, formDataModel, proxyIndex }) {
    let value = getTargetTypeValue({ targetType, targetId, targetValue, allRelItems, formDataModel, proxyIndex });
    if ((value || "") === "")
        return null;
    return {
        field,
        mark: com.dealConfigArr.find(a => a.value === operationType).condition.replace("value", value),
        formCode,
        formType
    };
}

function getTargetTypeValue({ targetType, targetId, targetValue, allRelItems, formDataModel, proxyIndex }) {
    let value = null;
    switch (targetType) {
        case "formItem":
            value = getFormItemValueNew(targetId, allRelItems, formDataModel, proxyIndex);
            break;
        case "environment":
            value = getEnvironmentValue(targetValue);
            break;
        case "value":
            value = targetValue;
            break;
    }
    return value;
}

function getFormItemValueNew(id, allRelItems, formDataModel, proxyIndex) {
    let item = allRelItems.find(a => a.id === id);
    if (item) {
        let formData = formDataModel.find(a => a.formId === item.formId);
        switch (formData.formType) {
            default:
            case FORM_TYPE.mainForm:
                return parseFormFilterValue(formData.values.find(a => a.id === id).value, item.valueType);
                // let v = formData.values.find(a => a.id === id);
                // return parseFormFilterValue(v ? v.value : null, item.valueType);
            case FORM_TYPE.subForm:
                if (proxyIndex !== undefined && formData.values[proxyIndex]) {
                    return parseFormFilterValue(formData.values[proxyIndex].list.find(a => a.id === id).value, item.valueType);
                } else {
                    let list = [];
                    formData.values.forEach(a => {
                        list.push(a.list.find(b => b.id === id).value);
                    });
                    return parseFormFilterValue(list, item.valueType);
                }
        }
    }
}

//构建表单项值用于提交后台
export function buildFormValue(value, valueType) {
    switch ((valueType || "").trim().toLocaleLowerCase()) {
        case "array":
            return value ? JSON.stringify(value) : value;
        default:
        case "string":
            return value ? value.toString() : value;
        case "number":
            if (value === null || value === undefined)
                return null;
            let number = Number(value);
            return isNaN(number) ? null : number.valueOf();
        case "datetime":
            if (value instanceof Date && !isNaN(value.getTime())) {
                return moment(value).format("YYYY-MM-DD HH:mm:ss");//value.toLocaleString()//value.toGMTString()
            } else {
                return null;
            }
        case "boolean":
            if (typeof value === "boolean") return value;
            return false;
    }
}

//转换表单项值用于前端存储
export function parseFormValue(value, valueType) {
    switch ((valueType || "").trim().toLocaleLowerCase()) {
        case "array":
            if (Array.isArray(value)) return value;
            else {
                try {
                    let ra = JSON.parse(value || "[]");
                    if (Array.isArray(ra))
                        return ra;
                    else {
                        value = value.toString();
                        if (value.indexOf(",") > -1)
                            return value.split(",");
                        else
                            return [value];
                    }
                }
                catch (e) {
                    return [value.toString()];
                }
            }
        // (value || '').split(',');
        case "string":
            return value ? value.toString() : value; //
        case "number":
            if (value === "" || value === null || value === undefined) return null;
            let number = Number(value);
            return isNaN(number) ? null : number.valueOf();
        default:
            return value;
        case "datetime":
            if (value === null || value === undefined) return null;
            let date = new Date(value);
            if (date instanceof Date && !isNaN(date.getTime())) return date;
            else return null;
        case "boolean":
            if (typeof value === "boolean") return value;
            else if (
                (value || "")
                    .toString()
                    .trim()
                    .toLocaleLowerCase() === "true"
            )
                return true;
            else {
                let boolNum = Number(value).valueOf();
                if (isNaN(boolNum)) return false;
                else return !!boolNum;
            }
    }
}

//用于数据联动条件字段转换
function parseFormFilterValue(value, valueType) {
    switch ((valueType || "").trim().toLocaleLowerCase()) {
        case "array":
            if (Array.isArray(value)) {
                if (value.length > 0)
                    return JSON.stringify(value);
                return "[]";
            }
            return value ? [value.toString()] : "[]";
        default:
        case "string":
        case "number":
        case "boolean":
            return value ? value.toString() : "";
    }
}

export function initFormItem(formControlType, item) {
    switch (formControlType) {
        case FormControlType.Container:
            return FormContainerBase(item);
        case FormControlType.External:
            return FormExternalBase(item);
        case FormControlType.Group:
            return FormGroupBase(item);
        case FormControlType.Mark:
            return FormMarkBase(item);
        case FormControlType.Item:
        default:
            return FormItemBase(item);
    }
}

function initFormItemEvent(formControlType) {
    switch (formControlType) {
        case FormControlType.Container:
            return formContainerBaseInitialEvent;
        case FormControlType.External:
            return formExternalBaseInitialEvent;
        case FormControlType.Group:
            return formGroupBaseInitialEvent;
        case FormControlType.Item:
        default:
            return formItemBaseInitialEvent;
    }
}

//获取所有的上级id集合
export function getAllParents(id, formBody, rootContainer) {
    let all = [];
    if (id === rootContainer) return all;
    else all = [id];
    let item = formBody.find(a => a.get("id") === id);
    let parent = formBody.find(a => a.get("id") === item.get("container"));
    if (parent && parent.get("id") !== rootContainer) {
        all.push(parent.get("id"));
        all = all.concat(getAllParents(parent.get("container"), formBody, rootContainer));
    }
    return all;
}

//获取上级代理容器，直到容器为非代理容器为止
export function getAllDelegateParents(ids, parentId, formBody, rootContainer) {
    let all = ids instanceof Array ? ids : [ids];
    if (parentId === rootContainer) return all;
    let parent = formBody.find(a => a.get("id") === parentId);
    if (parent) {
        all.push(parent.get("id"));
        if (parent.get("delegate") === true)
            all = getAllDelegateParents(all, parent.get("container"), formBody, rootContainer);
    }
    return all;
}

//获取上级有formId的容器
export function getFormContainerByContainerId(containerId, formBody) {
    let container = formBody.find(a => a.get("id") === containerId);
    if (container && container.hasIn(["itemBase", "formId"])) {
        return container;
    } else {
        return getFormContainerByContainerId(container.get("container"), formBody);
    }
}

//获取所有容器的联动数据集合
export function getAllLinkProxyDatas(formBody, proxyPool) {
    let linkProxyDatas = {}; //代理联动数据集合
    let allProxyContainers = formBody.filter(a => a.get("proxy") === true);
    allProxyContainers.forEach(proxyItem => {
        if (proxyItem.has("proxyEvents") && proxyItem.getIn(["proxyEvents", "onLinkGet"]) instanceof Function) {
            let proxyDatas = proxyItem
                .getIn(["proxyEvents", "onLinkGet"])
                .call(null, { proxy: proxyPool.get(proxyItem.get("id")).toJS() });
            let data = proxyDatas || [];
            if (!(data instanceof Array)) {
                data = [data];
            }
            linkProxyDatas[proxyItem.get("id")] = data;
        }
    });
    return linkProxyDatas;
}

//优化联动项触发顺序
export function orderLinkers(linkers, dataLinker) {
    let newLinkers;
    let allRelIds = new Set();
    for (let id in dataLinker) {
        allRelIds.add(id);
        dataLinker[id].forEach(i => {
            allRelIds.add(i);
            // //为了处理成员部门控件特殊dataLinker兼容，不确定是否会引起其他问题
            // linkers.filter(a => a.container === i && a.formControlType === FormControlType.groupItems).forEach(a => {
            //     allRelIds.add(a.id);
            //     if (!Array.isArray(dataLinker[i]))
            //         dataLinker[i] = [];
            //     if (!dataLinker[i].includes(a.id))
            //         dataLinker.push(a.id);
            // })
        });

    }
    allRelIds = Array.from(allRelIds);
    newLinkers = linkers.filter(a => !allRelIds.includes(a.id));
    let linkRels = linkers.map(a => a.id);
    let parents = Object.keys(dataLinker);
    let notTopParents = [];
    parents.forEach(k => {
        let other = parents.filter(a => a !== k);
        other.forEach(a => {
            if (dataLinker[a].includes(k) && !notTopParents.includes(k)) {
                notTopParents.push(k);
            }
        });
    });
    let topParents = parents.filter(a => !notTopParents.includes(a));
    let newOrder = topParents.concat();
    let nextLevel = topParents.concat();
    while (nextLevel.length > 0) {
        let nextCheck = [];
        nextLevel.forEach(a => {
            if (dataLinker[a]) {
                newOrder = newOrder.concat(dataLinker[a]);
                nextCheck = nextCheck.concat(dataLinker[a]);
            }
        });
        nextCheck = Array.from(new Set(nextCheck));
        nextLevel = nextCheck;
    }
    linkRels.forEach(a => {
        while (newOrder.indexOf(a) !== newOrder.lastIndexOf(a)) {
            newOrder.splice(newOrder.indexOf(a), 1);
        }
    });
    newOrder.forEach(a => {
        let exist = linkers.find(b => b.id === a);
        if (exist) newLinkers.push(exist);
    });
    return newLinkers;
}

function getAllChildContainer(list, formBody) {
    if (list.length === 0) return [];
    let childContainers = formBody
        .filter(a => list.includes(a.container) && a.formControlType === FormControlType.Container)
        .map(a => a.id);
    childContainers = childContainers.concat(getAllChildContainer(childContainers, formBody));
    return list.concat(childContainers);
}

//获取区域的formId
function getAreaFormId(areaId, areaList) {
    let area = areaList.find(a => a.id === areaId);
    if (area) {
        if (area.property.formId) return area.property.formId;
        else return getAreaFormId(area.parentId, areaList);
    }
}

//获取所有的子级控件
export function getAllChildren(id, formBody) {
    let list = [];
    let children = formBody.filter(a => a.container === id);
    children.forEach(item => {
        list.push(item);
        if (item.formControlType > 0) {
            list = list.concat(getAllChildren(item.id, formBody));
        }
    });
    return list;
}

//构建子表单数据模型
export function buildSubFormRowDataModel(containerId, formBody, instId) {
    let rowData = {};
    let children = formBody.filter(a => a.container === containerId && a.status !== FORMSTATUS.Delete);
    children.forEach(item => {
        switch (item.formControlType) {
            case FormControlType.Item:
                rowData[item.id] = parseFormValue(null, item.valueType);
                break;
            case FormControlType.Group:
                // if (item.event.onGetLinkerParams instanceof Function) {
                //     let list = item.event.onGetLinkerParams({
                //         ...item.itemBase,
                //         id: item.id
                //     });
                //     list.forEach(l => {
                //         //let groupItem=formBody.find(a=>a.id===l.id);
                //         rowData[l.id] = parseFormValue(null, l.valueType);
                //     });
                // }
                formBody.filter(a => a.container === item.id && a.status !== FORMSTATUS.Delete).forEach(b => {
                    rowData[b.id] = parseFormValue(null, b.valueType);
                });
                break;
            case FormControlType.External:
            case FormControlType.Container:
                rowData = { ...rowData, ...buildSubFormRowDataModel(item.id, formBody), instId };
                break;
            case FormControlType.System:
                if (item.itemType === "PrimaryKey")
                    rowData[item.id] = com.Guid();
                else if (item.itemType === "TableLinker") {
                    let tableLinker = formBody.find(a => a.itemType === "TableLinker" && a.container === containerId && a.status !== FORMSTATUS.Delete);
                    if (tableLinker.itemBase.tableLinkerParentId === formBody.find(a => a.itemType === "Root").id) {
                        rowData[item.id] = instId;
                    }
                    else
                        rowData[item.id] = null;
                }
                break;
        }
    });
    return rowData;
}

function buildThirdResourceParams(params, extraParams, formDataModel, proxyIndex) {
    let paramsUrl = {},
        paramsBody = {},
        paramsHeader = {};
    params.forEach(param => {
        switch (param.type) {
            case 0: //动态参数
                let valueGet = false;
                switch (param.targetType) {
                    case 0: //表单项
                        let subForms = formDataModel.filter(a => a.formType === FORM_TYPE.subForm);
                        subForms.forEach(s => {
                            if (valueGet) return;
                            let exist = s.values[proxyIndex] ? s.values[proxyIndex].list.find(a => a.id === param.targetId) : null;
                            if (exist) {
                                valueGet = true;
                                param.value = parseFormFilterValue(exist.value);
                            }
                        });
                        //} else {
                        let mainForms = formDataModel.filter(a => a.formType === FORM_TYPE.mainForm);
                        mainForms.forEach(s => {
                            if (valueGet) return;
                            let exist = s.values.find(a => a.id === param.targetId);
                            if (exist) {
                                valueGet = true;
                                param.value = parseFormFilterValue(exist.value);
                            }
                        });
                        //}
                        break;
                    case 1: //用户数据
                        break;
                }
            case 1: //固定
                switch (param.requestType) {
                    case 0: //body
                        paramsBody[param.name] = param.value;
                        break;
                    case 1: //url
                        paramsUrl[param.name] = param.value;
                        break;
                    case 2: //header
                        paramsHeader[param.name] = param.value;
                        break;
                }
                break;
        }
    });
    for (let extraKey in extraParams) {
        if (paramsUrl.hasOwnProperty(extraKey)) {
            paramsUrl[extraKey] = extraParams[extraKey];
        }
        if (paramsBody.hasOwnProperty(extraKey)) {
            paramsBody[extraKey] = extraParams[extraKey];
        }
        if (paramsHeader.hasOwnProperty(extraKey)) {
            paramsHeader[extraKey] = extraParams[extraKey];
        }
    }
    return { paramsUrl, paramsBody, paramsHeader };
}

// function buildThirdResourceData(linker) {
//     return linker.bindMap
//         .map(a => ({
//             field: a.requestAttr.substr(a.requestAttr.lastIndexOf(".") + 1),
//             id: a.targetId
//         }))
//         .concat(
//             linker.extraBindMap.map(a => ({
//                 field: a.requestAttr.substr(a.requestAttr.lastIndexOf(".") + 1),
//                 id: a.targetId
//             }))
//         );
// }
function buildThirdResourceData(linker) {
    let fields = [];
    return linker.bindMap
        .map(a => {
            if (a.requestAttr instanceof Array) {
                a.requestAttr.forEach(v => {
                    fields.push(v.substr(v.lastIndexOf(".") + 1));
                });
            } else {
                fields = a.requestAttr.substr(a.requestAttr.lastIndexOf(".") + 1);
            }
            return {
                field: fields,
                id: a.targetId
            };
        })
        .concat(
            linker.extraBindMap.map(a => ({
                field: a.requestAttr.substr(a.requestAttr.lastIndexOf(".") + 1),
                id: a.targetId
            }))
        );
}

function updateFormDataModel({ id, formId, proxyIndex, result, formDataModel }) {
    let updateForm = formDataModel.find(a => a.formId === formId);
    updateForm.update = true;
    let updateItem = null;
    let index = null;
    switch (updateForm.formType) {
        default:
        case FORM_TYPE.mainForm:
            updateItem = updateForm.values.find(a => a.id === id);
            index = updateForm.values.indexOf(updateItem);
            if (index > -1) {
                updateForm.values[index] = { ...updateItem, ...result, update: true };
            } else updateForm.values.push({ id, ...result, update: true });
            break;
        case FORM_TYPE.subForm:
            if (isNaN(proxyIndex))
                proxyIndex = -1;
            //表单项属性修改
            if (proxyIndex === -1) {
                let exist = formDataModel.find(a => a.id === updateForm.formId && a.formType === 0);
                if (!exist) {
                    exist = {
                        formId: updateForm.formId,
                        formType: 0,
                        values: []
                    };
                    formDataModel.push(exist);
                }
                exist.values.push({ id, ...result, update: true });
                exist.update = true;
            }
            //表单项值修改
            else {
                let updateRow = updateForm.values[proxyIndex];
                if (updateRow) {
                    //updateRow.update = true;
                    updateItem = updateRow.list.find(a => a.id === id);
                    if (updateItem === undefined) {
                        updateItem = { id };
                        updateRow.list.push(updateItem);
                    }
                    index = updateRow.list.indexOf(updateItem);
                    updateRow.list[index] = { ...updateItem, ...result, update: true };
                }
            }

            break;
    }
    return formDataModel;
}

function* getLinkValue({
    put, formTemplateVersionId, item, preLoad = false, formDataModel, allRelItems, allRelItemsOther, staticItems, formBody,
    proxyIndex, initial, invisibleTxtInit//不可见字段赋值:1原值，2空值，3始终重新计算
}) {
    let all = allRelItems.concat(allRelItemsOther);
    for (let i = 0, j = item.dataLinker.length; i < j; i++) {
        let linker = item.dataLinker[i];
        let authority = item.formControlType === FormControlType.GroupItem ? buildControlAuthority(formBody.find(a => a.get("id") === item.container).toJS().authority) : buildControlAuthority(item.authority);
        let result = {}, passUpdate = false;
        if (authority.hidden === true && (invisibleTxtInit === 1 || invisibleTxtInit === 2) && linker.linkType !== LINKTYPE.Display) {
            switch (invisibleTxtInit) {
                default:
                case 1:
                    break;
                case 2:
                    result.value = null;
                    break;
            }
        }
        switch (linker.linkType) {
            case LINKTYPE.Formula:
                if (preLoad) break;
                result.value = yield* getFormulaValue(
                    item.valueType,
                    item.formId,
                    proxyIndex,
                    linker.expression,
                    all.filter(a => linker.relations.includes(a.id)),
                    formDataModel,
                    linker.foreignData
                );
                break;
            case LINKTYPE.Display:
                //debugger
                let hidden = yield* getFormulaValue(
                    "boolean",
                    item.formId,
                    proxyIndex,
                    linker.expression,
                    all.filter(a => linker.relations.includes(a.id)),
                    formDataModel,
                    linker.foreignData
                );
                //debugger
                result.authority = { hidden: { formula: !hidden } };
                break;
            case LINKTYPE.Resource:
            case LINKTYPE.Request:
                if (linker.autoFill === true || linker.linkType === LINKTYPE.Request) {
                    if (item.isSubTable === true && preLoad)
                        break;
                    yield put.resolve({
                        type: "beginLoadResourceData",
                        allRelItems,
                        formDataModel,
                        expression: linker.expression,
                        formTemplateVersionId,
                        linker,
                        id: item.id,
                        ignoreConditions: item.isSubTable === true || item.formControlType === FormControlType.Item,
                        proxyIndex,
                        autoFill: linker.linkType === LINKTYPE.Request ? false : linker.autoFill,
                        force: true
                    });
                }
                break;
            case LINKTYPE.Linker:
            case LINKTYPE.External:
                //debugger
                if (linker.autoFill === true || (linker.linkType === LINKTYPE.Linker && item.itemBase.autoFill)) {
                    //是否自动计算赋值
                    yield put.resolve({
                        type: "beginLoadExternalData",
                        allRelItems,
                        formDataModel,
                        expression: linker.expression,
                        formTemplateVersionId,
                        id: item.id,
                        ignoreConditions: item.isSubTable === true,
                        proxyIndex,
                        autoFill:
                            linker.linkType === LINKTYPE.Linker ? item.itemBase.autoFill !== false : linker.autoFill
                    });
                }
                break;
            case LINKTYPE.Environment:
                if (linker.initial !== true && initial !== false || linker.initial === true && initial === true) {
                    result.value = parseFormValue(getEnvironmentValue(linker.environmentValue), item.valueType);
                }
                break;
            case LINKTYPE.DefaultValue:
                if (linker.useFormula === true && initial === true)
                    result.value = yield* getFormulaValue(
                        item.valueType,
                        item.formId,
                        proxyIndex,
                        linker.linkValue,
                        all.filter(a => linker.relations.includes(a.id)),
                        formDataModel,
                        linker.foreignData
                    );
                else if (initial === true)
                    result.value = linker.linkValue;
                break;
            case LINKTYPE.Clearn:
                if (initial !== true && preLoad !== true && allRelItems.some(a => a.id === linker.triggerId)) {
                    for (let rId of linker.relations) {
                        formDataModel = updateFormDataModel({
                            id: rId,
                            formId: item.formId,
                            proxyIndex,
                            result: { value: null },
                            formDataModel
                        });
                    }
                    passUpdate = true;
                }
                break;
        }
      if (!passUpdate)
      // debugger;
        formDataModel = updateFormDataModel({
          id: item.id,
          formDataModel,
          proxyIndex,
          formId: item.formId,
          result
        });
        //}
    }
    //debugger
    return formDataModel;
}

//获取所有的父辈的代理属性
export function getAllDelegateAttr(item, formBody, rootContainer) {
    let delegateAttr = item.get("delegateAttr");
    let proxyAttr = item.get("proxyAttr");
    delegateAttr = delegateAttr ? delegateAttr.toJS() : {};
    proxyAttr = proxyAttr ? proxyAttr.toJS() : {};
    let attrs = { ...delegateAttr, ...proxyAttr };
    if (item.get("container") === rootContainer) return attrs;
    let parent = formBody.find(a => a.get("id") === item.get("container"));
    attrs = { ...attrs, ...getAllDelegateAttr(parent, formBody, rootContainer) };
    return attrs;
}

//设置代理
export function setFormProxy(formState, action) {
    let proxyPoolItem = formState.getIn(["proxyPool", action.id]);
    proxyPoolItem = proxyPoolItem.merge(fromJS(action.proxyData));
    return formState.setIn(["proxyPool", action.id], proxyPoolItem);
}

function* valiedateFormData(list, formTemplateVersionId, effects) {
    yield delay(1000);
    yield effects.put({
        type: "validateFormValue",
        formTemplateVersionId,
        list
    });
}

export function* linkFormData(
    list,
    allListItems,
    formTemplateVersionId,
    effects,
    model,
    withTrigger = false,
    delayTime = 1000,
    initial = false
) {
    if (delayTime !== 0) yield delay(delayTime);
    let { dataLinker, proxyPool, formBody, invisibleTxtInit } = yield effects.select(state => {
        let formState = state[model].all[formTemplateVersionId];
        return {
            dataLinker: formState.get("dataLinker").toJS(),
            //bussinessLinker: formState.get("bussinessLinker").toJS(),
            proxyPool: formState.get("proxyPool"),
            formBody: formState.get("formBody"),
            invisibleTxtInit: formState.getIn(["formProperties", "invisibleTxtInit"])//不可见字段赋值:1原值，2空值，3始终重新计算
        };
    });
    let linkRels = getLinkRelations(allListItems, dataLinker); //需要重新计算赋值和校验的itemId集合
    if (withTrigger === true)//部门组件设置条件隐藏加默认值环境变量需要分类触发datalinker，所以要加入原始触发者
        linkRels = Array.from(allListItems).concat(linkRels);
    if (linkRels.length === 0) return;
    let allLinkItems = formBody.filter(a => linkRels.includes(a.get("id"))).toJS(); //所有关联的控件
    let allNeedItemIds = linkRels.concat(); //所有参与到联动计算的itemId集合
    let allOtherNeedItemIds = [];
    //其他需要使用的item，不需要重新计算值的
    Object.keys(dataLinker).forEach(l => {
        if (!allNeedItemIds.includes(l) && dataLinker[l].filter(a => linkRels.includes(a)).length > 0) {
            allOtherNeedItemIds.push(l);
        }
    });
    let allRelItems = formBody
        .filter(a => allNeedItemIds.includes(a.get("id")))
        .map(a => ({
            id: a.get("id"),
            value: a.getIn(["itemBase", "value"]),
            text: a.getIn(["itemBase", "text"]),
            valueType: a.get("valueType"),
            delegate: a.get("delegate"),
            formId: a.get("formId"),
            container: a.get("container")
        }))
        .toJS();
    let allRelItemsOther = formBody
        .filter(a => allOtherNeedItemIds.includes(a.get("id")))
        .map(a => ({
            id: a.get("id"),
            value: a.getIn(["itemBase", "value"]),
            text: a.getIn(["itemBase", "text"]),
            valueType: a.get("valueType"),
            delegate: a.get("delegate"),
            formId: a.get("formId"),
            container: a.get("container")
        }))
        .toJS();
    //所有被代理的关联控件及主动触发的控件，取出他们的值用于后面的联动计算
    allLinkItems
        .filter(a => a.delegate)
        .forEach(a => {
            allListItems.add(a.id);
        });

    // //按照同步、异步分组
    let asyncLinkItems = [];
    let syncLinkItems = [];
    allLinkItems.forEach(linkItem => {
        let asyncExist = linkItem.dataLinker.filter(a => a.async === true || a.linkType === LINKTYPE.External);
        if (asyncExist.length > 0) {
            asyncLinkItems.push(linkItem);
        }
    });
    //将与异步联动项有关的联动项全部抽出来
    let asyncRels = asyncLinkItems.map(a => a.id);
    asyncLinkItems.forEach(item => {
        let rel = getLinkRelations([item.id], dataLinker);
        asyncRels = asyncRels.concat(rel.filter(a => !asyncRels.includes(a)));
    });
    //排序
    allLinkItems = orderLinkers(allLinkItems, dataLinker);
    //去掉与异步联动有关的所有联动项
    syncLinkItems = allLinkItems.filter(a => !asyncRels.includes(a.id));
    asyncLinkItems = allLinkItems.filter(a => asyncRels.includes(a.id));
    //分组
    //所有静态控件，如果计算关系中包含静态控件，则不进行相应的联动计算
    let staticItems = formBody
        .filter(a => a.get("controlStatus") === ControlStatus.Static)
        .map(a => a.get("id"))
        .toJS();
    let linkProxyDatas = getAllLinkProxyDatas(formBody, proxyPool);
    let formDataModel = buildFormDataModel(formBody, linkProxyDatas);
    //同步联动赋值
    if (syncLinkItems.length > 0)
        yield effects.put.resolve({
            type: "linkItemsValue",
            list,
            dataLinker,
            formBody,
            formTemplateVersionId,
            items: syncLinkItems,
            allRelItems,
            allRelItemsOther,
            staticItems,
            formDataModel,
            invisibleTxtInit,
            initial,
            preLoad: delayTime === 0
        });
    //异步联动赋值
    if (asyncLinkItems.length > 0)
        yield effects.put.resolve({
            type: "linkItemsValue",
            list,
            formBody,
            dataLinker,
            formTemplateVersionId,
            items: asyncLinkItems,
            allRelItems,
            allRelItemsOther,
            staticItems,
            formDataModel,
            invisibleTxtInit,
            initial,
            preLoad: delayTime === 0
        });
    yield effects.put({
        type: "linkItemsValueComplete",
        allLinkItems,
        formTemplateVersionId
    });
}

function* buildRenderList(list, formTemplateVersionId, effects, model) {
    let { formBody, rootContainer } = yield effects.select(state => {
        let formState = state[model].all[formTemplateVersionId];
        return {
            formBody: formState.get("formBody"),
            rootContainer: formState.get("rootContainer")
        };
    });
    let idList = new Set();
    list.forEach(a => {
        a.items.forEach(b => {
            idList.add(b.id);
        });
    });
    let renderList = new Set();
    idList.forEach(id => {
        let formItem = formBody.find(a => a.get("id") === id);
        if (formItem) {
            if (formItem.get("formControlType") > 0)
                renderList.add(formItem.get("id"));
            getAllDelegateParents(id, formItem.get("container"), formBody, rootContainer).forEach(a => {
                renderList.add(a);
            });
        }
    });
    yield effects.put({
        type: "setRenderList",
        formTemplateVersionId,
        list: Array.from(renderList)
    });
}

export function combineFormData(oldList, list, formBody) {
    //list=[{proxyIndex:0,items:[{id:'',data:{value:'',....}},{}]}]
    let newList = [];
    let oldMainFormData = oldList.filter(a => a.proxyIndex === -1);
    let mainFormData = list.filter(a => a.proxyIndex === -1);
    let mainData = buildFormData(
        -1,
        [...oldMainFormData, ...mainFormData],
        formBody.find(a => a.get("itemType") === "Root").getIn(["itemBase", "formId"])
    );
    if (mainData.items.length > 0) newList.push(mainData);
    let oldProxyFormData = oldList.filter(a => a.proxyIndex !== -1);
    let proxyFormData = list.filter(a => a.proxyIndex !== -1);
    let allProxyFormData = oldProxyFormData.concat(proxyFormData);
    let groupedProxyFormData = _.groupBy(allProxyFormData, a => a.proxyIndex);
    for (let key in groupedProxyFormData) {
        let map = {};
        let formMap = {};
        groupedProxyFormData[key].forEach((a, i) => {
            let parentContainer = getFormContainerByContainerId(
                formBody.find(b => b.get("id") === a.items[0].id).get("container"),
                formBody
            );
            let parent = parentContainer.get("container");
            if (map[parent] === undefined) map[parent] = [i];
            else map[parent].push(i);
            if (formMap[parent] === undefined) formMap[parent] = parentContainer.getIn(["itemBase", "formId"]);
        });

        for (let p in map) {
            let l = [];
            map[p].forEach(a => {
                l.push(groupedProxyFormData[key][a]);
            });
            let fData = buildFormData(parseInt(key), l, formMap[p]);
            if (fData.items.length > 0) newList.push(fData);
        }
    }
    return newList;
}

function buildFormData(proxyIndex, list, formId) {
    let allFormData = [];
    if (list.length > 0) allFormData = list.reduce((pre, cur) => pre.concat(cur.items), allFormData);
    let allKey = new Set(allFormData.map(a => a.id));
    let newFormData = { proxyIndex, items: [], formId };
    allKey.forEach(a => {
        let item = { id: a, data: {}, authority: {} };
        allFormData
            .filter(b => b.id === a)
            .forEach(b => {
                item = {
                    id: item.id,
                    data: { ...item.data, ...b.data },
                    authority: { ...item.authority, ...b.authority }
                };
            });
        newFormData.items.push(item);
    });
    return newFormData;
}

//构建表单数据模型
export function buildFormDataModel(formBody, linkProxyDatas) {
    let formDataModel = [];
    let mainFormData = {
        formId: formBody.find(a => a.get("itemType") === "Root").getIn(["itemBase", "formId"]),
        formType: FORM_TYPE.mainForm,
        values: []
    };
    //主表数据模型
    formBody
        .filter(a => a.get("delegate") !== true && a.get("formControlType") < FormControlType.Group)
        .forEach(a => {
            let itemBase = a.get("itemBase").toJS();
            let value = itemBase.value;
            if (a.hasIn(["event", "onBuildFormDataModel"]))
                value = a.getIn(["event", "onBuildFormDataModel"])(value, { ...itemBase, id: a.get("id") });
            mainFormData.values.push({
                id: a.get("id"),
                value
            });
        });
    formDataModel.push(mainFormData);
    //子表数据模型
    for (let subId in linkProxyDatas) {
        let subFormData = {
            formId: formBody.find(a => a.get("id") === subId).getIn(["itemBase", "formId"]),
            formType: FORM_TYPE.subForm,
            parentFormId: getFormContainerByContainerId(
                formBody.find(a => a.get("id") === subId).get("container"),
                formBody
            ).getIn(["itemBase", "formId"]),
            values: []
        };
        linkProxyDatas[subId].forEach(a => {
            //暂不考虑子表嵌子表，所以parentIndex始终是主表的0
            let subItem = { list: [], parentIndex: 0 };
            for (let subItemId in a) {
                subItem.list.push({ id: subItemId, ...a[subItemId] });
            }
            subFormData.values.push(subItem);
        });
        formDataModel.push(subFormData);
    }
    return formDataModel;
}

function getTrigger(ids, dataLinker) {
    //var i = 0;
    let list = new Set();
    for (let trigger in dataLinker) {
        if (dataLinker[trigger].filter(a => ids.includes(a)).length > 0) list.add(trigger);
    }
    return Array.from(list);
}

//检查导致这个控件需要重新赋值的关联控件中是否存在跨form的情况
function checkCrossFrom(id, formId, allRelItems, dataLinker) {
    let triggerList = getTrigger([id], dataLinker);
    let check = null;
    while (triggerList.length > 0) {
        for (let i = 0, j = triggerList.length; i < j; i++) {
            let exist = allRelItems.find(a => a.id === triggerList[i]);
            if (exist && formId !== exist.formId) {
                check = exist;
                break;
            }
        }
        triggerList = getTrigger(triggerList, dataLinker);
    }
    return check;
}

//将全局数据模型转换为保存数据模型
export function buildItemValus(formDataModel) {
    //list=[{proxyIndex:0,items:[{id:'',data:{value:'',....},authority},{}]}];
    let list = [];
    formDataModel
        .filter(a => a.update === true)
        .forEach(formData => {
            formData.update = false;
            switch (formData.formType) {
                case FORM_TYPE.mainForm:
                    let mainListItem = {
                        proxyIndex: -1,
                        items: []
                    };
                    formData.values
                        .filter(b => b.update === true)
                        .forEach(itemData => {
                            itemData.update = false;
                            let { id, update, authority, ...data } = itemData;
                            mainListItem.items.push({
                                id,
                                data,
                                authority
                            });
                        });
                    if (mainListItem.items.length > 0) list.push(mainListItem);
                    break;
                case FORM_TYPE.subForm:
                    formData.values.forEach((rowData, proxyIndex) => {
                        let subListItem = {
                            proxyIndex,
                            items: []
                        };
                        rowData.list
                            .filter(b => b.update === true)
                            .forEach(itemData => {
                                itemData.update = false;
                                let { id, update, authority, ...data } = itemData;
                                subListItem.items.push({
                                    id,
                                    data,
                                    authority
                                });
                            });
                        if (subListItem.items.length > 0) list.push(subListItem);
                    });
                    break;
            }
        });
    return list;
}

//初始化业务规则
export function initBusinessRule(formTemplateVersionId, formTemplateType) {
    return fromJS({
        formTemplateComLoading: false,
        formTemplateWithFields: [],
        initFormTemplateWithFields: [],
        formTempatePagination: {
            pageCount: 1,
            pageIndex: 1,
            pageSize: 10,
            skipCount: 0,
            totalCount: 1
        },
        loading: false,
        operateShow: false,
        actionLogShow: false,
        id: "",
        mode: "add", //add,modify
        formList: [],
        form: { formId: "", form: "", formType: "" },
        currentFields: [], //表单模板
        currentFormField: [], //表单
        templateFields: [],
        templateMapFields: [],
        name: "",
        pushType: "", //触发动作类型（add，modify，delete）
        triggerCondition: [], //触发条件
        schedueList: [], //执行动作计划集合
        pushRelationList: [],
        pagination: {
            pageCount: 1,
            pageIndex: 1,
            pageSize: 10,
            skipCount: 0,
            totalCount: 1
        },
        currentPushRelationId: "",
        pushQueueList: [],
        logPagination: {
            pageCount: 1,
            pageIndex: 1,
            pageSize: 10,
            skipCount: 0,
            totalCount: 1
        },
        exteralList: [],//外部数据api接口集合
        dataInterfaceList: [],//已选择的api接口
        pushCommandActionRequests: []
    });
}

//初始化表单
export function initForm(formTemplateVersionId, formTemplateType) {
    let rootAreaId = com.Guid();
    let rootFormId = com.Guid();
    let rootContainer = com.Guid();
    let rootPrimaryKey = com.Guid();
    return fromJS({
        rootAreaId,
        rootContainer,
        rootFormId,
        rootPrimaryKey,
        formTemplateVersionId, //版本id
        formTemplateType, //是否挂载流程 0否1是
        anchorIndex: 0, //锚点索引
        formTemplateId: formTemplateVersionId, //模板id，新增时候使用url
        formForeignKeys: [],
        formList: [
            {
                //默认根form
                id: rootFormId,
                formType: 0,
                //versionId:com.Guid(),
                name: "新建表单",
                areaId: rootContainer,
                formId: rootFormId,
                sortIndex: 0,
                property: "{}",
                isUsed: false,
                operationStatus: 1,
                isCreatedForm: true
            }
        ],
        formBody: [
            {
                //默认加入主表主键和根容器
                id: rootContainer,
                dataLinker: [],
                itemType: "Root",
                status: FORMSTATUS.Add,
                formControlType: FormControlType.Container,
                itemBase: { name: "新建表单", formId: rootFormId },
                order: 0,
                layer: 0,
                formId: rootFormId,
                isSubTable: true,
                authority: {
                    control: {
                        hidden: {
                            system: true,
                            condition: false
                        },
                        disabled: {
                            system: false,
                            workFlow: false,
                            role: false,
                            condition: false
                        }
                    },
                    buttons: ["add", "modify", "delete", "print"]
                }
            },
            {
                id: rootPrimaryKey,
                dataLinker: [],
                itemType: "PrimaryKey",
                container: rootContainer,
                controlType: ControlType.PrimaryKey,
                status: FORMSTATUS.Add,
                formControlType: FormControlType.System,
                formId: rootFormId,
                authority: { hidden: { system: true }, disabled: {} },
                isHide: true,
                itemBase: { name: "RootPrimaryKey" },
                operationStatus: 1
            }
        ],
        formTitle: "新建表单",
        formStatus: FORMSTATUS.Add, //1新增,2修改,0删除,3不变
        formRenderStyle: RenderStyle.Design, //设计时渲染的风格
        formPreviewRenderStyle: RenderStyle.PC, //预览时渲染的风格
        currentIndex: -1, //当前选中的控件id
        dragIndex: -1, //当前被拖拽的控件的id
        oldContainer: null, //当前被拖拽的控件起始容器
        proxyPool: {}, //代理池
        proxyChecker: {}, //代理池检测器
        //proxyLinkData: {},//用于数据联动计算的被代理控件的值集合
        showPreview: false,
        previewRootList: [],
        isSubmitting: false,
        isUsed: false,
        dataLinker: {}, //数据联动关系集合
        formProperties: {
            //表单属性
            //dataLinker: [],
            formLayout: 2, //1单列,2双列
            formControlStyleModel: 1, //表单模式,1水平,2垂直
            border: null, //是否显示border
            invisibleTxtInit: 1, //不可见字段赋值:1原值，2空值，3始终重新计算
            formSubmitVerification: "", //表单提交校验
            thirdPartyId: [], // 第三方数据源提交校验ID
            thirdPartyVerification: [], // 第三方数据源关联参数列表
            bussinessComSetting: {},//业务组件配置
            tableLinker: {}//子表链接
        },
        publishStatus: true, //发布状态
        updateFlag: true,
        validateFlag: true,
        bussinessProxyState: [],//业务组件状态
        bussinessComponents: [],//业务组件嵌入组件
        bussinessComponentsList: [],//加载的业务组件key集合
        bussinessSubmitInfo: [],//业务组件提交按钮集合
        isCanCancelMoveFormItem: false, //是否可以CanCancelMoveFormItem
        isUpdateVersion: false, //保存使用，area,form,item新增或删除true,其他false
        formForeiginKeyActionRequests: [], //传后台的关系
        currentFormData: [], //当前表单字段
        foreignFormData: [], //外部表单字段
        renderList: [] //需要重新渲染的容器集合
    });
}

export function effects(model) {
    return {
        computeFormData: [
            function* (effects) {
                let oldList = [];
                let linkTask = null;
                let validateTask = null;
                while (true) {
                    let { list, formTemplateVersionId, ignoreLink, delay, initial } = yield effects.take(`setValue`);
                    debugger
                    if (list[0].items[0].data.hasOwnProperty("value") && ignoreLink !== true) {
                        let formBody = yield effects.select(state =>
                            state[model].all[formTemplateVersionId].get("formBody")
                        );
                        if (linkTask && linkTask.isRunning()) {
                            linkTask.cancel();
                            validateTask.cancel();
                            list = combineFormData(oldList, list, formBody);
                        } else list = combineFormData([], list, formBody);
                        oldList = list;
                        validateTask = yield effects.fork(
                            valiedateFormData,
                            list,
                            formTemplateVersionId,
                            effects
                        );
                        let allListItems = new Set(); //所有主动被改变赋值的项集合
                        list.forEach(a => {
                            a.items.forEach(item => {
                                allListItems.add(item.id);
                            });
                        });
                        debugger
                        linkTask = yield effects.fork(
                            linkFormData,
                            list,
                            allListItems,
                            formTemplateVersionId,
                            effects,
                            model,
                            false,
                            delay,
                            initial
                        );
                    }
                    yield effects.call(buildRenderList, list, formTemplateVersionId, effects, model);
                }
            },
            { type: "watcher" }
        ],
        setProxy: [
            function* (action, effects) {
                let { formTemplateVersionId, id } = action;
                let formState = yield effects.select(state => state[model].all[formTemplateVersionId]);
                let checker = formState.getIn(["proxyChecker", id]) || 0;
                let formBody = formState.get("formBody");
                let proxyItem = formBody.find(a => a.get("id") === id);
                let proxyPool = formState.get("proxyPool").toJS();
                let currentProxyLinkData = proxyItem.getIn(["proxyEvents", "onLinkGet"])({
                    proxy: proxyPool[id]
                });
                if (currentProxyLinkData.length !== checker) {
                    let dataLinker = formState.get("dataLinker").toJS();
                    let allIds = getAllChildren(id, formBody.toJS()).map(a => a.id);
                    let formId = proxyItem.get("formId");
                    let allLinkIds = new Set();
                    Object.keys(dataLinker)
                        .filter(a => allIds.includes(a))
                        .forEach(id => {
                            let relations = dataLinker[id];
                            relations.forEach(r => {
                                let item = formBody.find(a => a.get("id") === r);
                                if (item.get("formId") !== formId)
                                    allLinkIds.add(r);
                            });
                        });
                        debugger
                    yield effects.call(
                        linkFormData,
                        [],
                        allLinkIds,
                        formTemplateVersionId,
                        effects,
                        model,
                        true
                    );
                    yield effects.call(
                        valiedateFormData,
                        [],//list,
                        formTemplateVersionId,
                        effects
                    );
                }
                //链接器链式删除检测
                let tableLinkers = formBody.filter(a => a.get("status") !== FORMSTATUS.Delete && a.get("itemType") === "TableLinker" && a.getIn(["itemBase", "tableLinkerParentId"]) === id).toJS();
                let primaryKeyId = formBody.find(a => a.get("status") !== FORMSTATUS.Delete && a.get("itemType") === "PrimaryKey" && a.get("container") === id).get("id");
                let allPrimaryKeyValues = currentProxyLinkData.map(a => a[primaryKeyId].value);
                for (let item of tableLinkers) {
                    let subTable = formBody.find(a => a.get("id") === item.container).toJS();
                    if (subTable.proxyEvents.onLinkGet instanceof Function) {
                        let subProxyLinkData = subTable.proxyEvents.onLinkGet({ proxy: proxyPool[subTable.id] });
                        let newSbProxyLinkData = subProxyLinkData.filter(a => allPrimaryKeyValues.includes(a[item.id].value));
                        if (newSbProxyLinkData.length !== subProxyLinkData) {
                            let newSubProxyData = subTable.proxyEvents.onLinkSet({
                                linkData: newSbProxyLinkData,
                                proxy: proxyPool[subTable.id]
                            });
                            yield effects.put({
                                type: "setProxy",
                                formTemplateVersionId,
                                id: subTable.id,
                                proxyData: newSubProxyData
                            });
                        }
                    }
                }
            },
            { type: "takeEvery" }
        ],
        validateLinkData: [
            function* (effects) {
                yield effects.takeEvery(`${model}/setValue`, function* (action) {
                    let { list, formTemplateVersionId, mode } = action;
                    list.forEach(a => {
                        a.items = a.items.filter(a => a.data.hasOwnProperty("value"));
                    });
                    list = list.filter(a => a.items.length > 0);
                    if (mode !== "validate" && list.length > 0) {
                        yield effects.call(
                            valiedateFormData,
                            list,
                            formTemplateVersionId,
                            effects
                        );
                    }
                });
            }, { type: "watcher" }
        ],
        * linkItemsValue(action, { call, put }) {
            let {
                formTemplateVersionId,
                items,
                formBody,
                allRelItems,
                allRelItemsOther,
                staticItems,
                formDataModel,
                dataLinker,
                list,
                preLoad,
                initial,
                invisibleTxtInit //不可见字段赋值:1原值，2空值，3始终重新计算
            } = action;
            //let allRelItems2 = allRelItems;
            //allRelItems = allRelItems.concat(allRelItemsOther);
            for (let i = 0, j = items.length; i < j; i++) {
                let item = items[i];
                let formType = formDataModel.find(a => a.formId === item.formId).formType;
                switch (formType) {
                    case FORM_TYPE.mainForm:
                        // debugger
                        formDataModel = yield call(getLinkValue, {
                            put,
                            formTemplateVersionId,
                            item,
                            formBody,
                            formDataModel,
                            allRelItems,
                            allRelItemsOther,
                            staticItems,
                            invisibleTxtInit,
                            initial,
                            preLoad
                        });
                        break;
                    //如果是子表，则计算所有需要重新计算值的行
                    case FORM_TYPE.subForm:
                        if (item.isSubTable) {
                            // debugger
                            formDataModel = yield call(getLinkValue, {
                                put,
                                formTemplateVersionId,
                                item,
                                formBody,
                                formDataModel,
                                allRelItems,
                                allRelItemsOther,
                                staticItems,
                                invisibleTxtInit,
                                initial,
                                proxyIndex: -1,
                                preLoad
                            });
                        } else {
                            let crossFormItem = checkCrossFrom(item.id, item.formId, allRelItems.concat(allRelItemsOther), dataLinker);
                            let proxyIndexList;
                            //如果引起重算的元素中有跨表单的，则全体重算
                            if (crossFormItem) {
                                if (action.proxyIndex > -1)
                                    //如果有明确的指明proxyIndex 就用指明的
                                    proxyIndexList = [action.proxyIndex];
                                else
                                    proxyIndexList = formDataModel
                                        .find(a => a.formId === item.formId)
                                        .values.map((a, i) => i);
                                if (proxyIndexList.length === 0)
                                    proxyIndexList = [-1];
                            } else {
                                if (action.proxyIndex > -1)
                                    //如果有明确的指明proxyIndex 就用指明的
                                    proxyIndexList = [action.proxyIndex];
                                //如果是控件组容器，则是属性操作
                                else proxyIndexList =
                                    list.length > 0
                                        ? list.filter(a => a.formId === item.formId).map(a => a.proxyIndex)
                                        : formDataModel.find(a => a.formId === item.formId).values.map((a, i) => i);
                                if (item.formControlType === FormControlType.Group) {
                                    if (proxyIndexList.length === 0)
                                        proxyIndexList = [-1];
                                }
                            }
                            for (let k = 0, l = proxyIndexList.length; k < l; k++) {
                                let proxyIndex = proxyIndexList[k];
                                // debugger
                                formDataModel = yield call(getLinkValue, {
                                    put,
                                    formTemplateVersionId,
                                    item,
                                    formBody,
                                    formDataModel,
                                    allRelItems,
                                    allRelItemsOther,
                                    staticItems,
                                    proxyIndex,
                                    invisibleTxtInit,
                                    initial,
                                    preLoad
                                });
                            }
                        }
                        break;
                }
            }
            let newList = buildItemValus(formDataModel);
            if (newList.length > 0)
                yield put({
                    type: "setValue",
                    formTemplateVersionId,
                    list: newList,
                    initial,
                    ignoreLink: true //action.ignoreLink !== false
                });
        },
        * beginLoadExternalData(action, { select, call, put }) {
            let {
                allRelItems,
                formDataModel,
                expression,
                formTemplateVersionId,
                id,
                proxyIndex,
                autoFill,
                ignoreConditions,
                extraConditions
            } = action;
            yield put({
                type: "changeExternalLoading",
                formTemplateVersionId,
                id,
                loading: true
            });

            //如果allRelItems为空，就重新取，这个是关联数据调用的时候才会触发的情况
            let obj = yield select(state => {
                let formState = state[model].all[formTemplateVersionId];
                let formBody = formState.get("formBody");
                let proxyPool = formState.get("proxyPool");
                let allTargetId = [];
                let triggerItem = formBody.find(a => a.get("id") === id).toJS();
                expression.forEach(exp => {
                    exp.condition.forEach(con => {
                        con.where.forEach(w => {
                            if (!allTargetId.includes(w.targetId)) allTargetId.push(w.targetId);
                        });
                    });
                });
                let items = formBody
                    .filter(a => allTargetId.includes(a.get("id")))
                    .map(a => ({
                        id: a.get("id"),
                        value: a.getIn(["itemBase", "value"]),
                        text: a.getIn(["itemBase", "text"]),
                        valueType: a.get("valueType"),
                        formId: a.get("formId"),
                        delegate: a.get("delegate"),
                        container: a.get("container")
                    }));
                return {
                    allRelItems: items,
                    triggerItem,
                    formDataModel: buildFormDataModel(formBody, getAllLinkProxyDatas(formBody, proxyPool))
                };
            });
            if (allRelItems === undefined) {
                formDataModel = obj.formDataModel;
            }
            allRelItems = obj.allRelItems;
            for (let i = 0, j = expression.length; i < j; i++) {
                //let mainCondition = expression[i].condition.find(a => a.formType == 0);
                let commonCondition = [];
                // if (mainCondition) {
                //     mainCondition.where.forEach(item => {
                //         let condition = buildDataFilterCondition({ condition: { ...item, formType: 0 }, allRelItems, formDataModel, proxyIndex });
                //         if (condition)
                //             commonCondition.push(condition);
                //     });
                // }
                expression[i].condition.forEach(con => {
                    con.where.forEach(item => {
                        let condition = buildDataFilterCondition({
                            condition: { ...item, formType: con.formType },
                            allRelItems,
                            formDataModel,
                            proxyIndex
                        });
                        if (condition)
                            commonCondition.push(condition);
                    });
                });
                if (Array.isArray(extraConditions)) {
                    extraConditions.forEach(({ field, mark, formCode, formType }) => {
                        if (field !== null && mark !== null && formCode !== null && formType !== null)
                            commonCondition.push({ field, mark, formCode, formType });
                    });
                }
                for (let k = 0, l = expression[i].display.length; k < l; k++) {
                    // let condition = expression[i].condition.find(
                    //     a => a.primaryKey === expression[i].display[k].primaryKey
                    // );
                    let conditions = commonCondition.concat();
                    // if (condition) {
                    //     switch (condition.formType) {
                    //         case 0: //主表 自己的条件
                    //             break;
                    //         case 1: //子表 自己的条件外加主表条件
                    //             expression[i].condition
                    //                 .find(a => a.primaryKey === expression[i].display[k].primaryKey)
                    //                 .where.forEach(item => {
                    //                     let condition = buildDataFilterCondition({ condition: { ...item, formType: 1 }, allRelItems, formDataModel, proxyIndex });
                    //                     if (condition)
                    //                         conditions.push(condition);
                    //                 });
                    //             break;
                    //     }
                    // }

                    //conditions = conditions.filter(a => (a.Value || "") !== "");
                    let table = [],
                        fields = expression[i].display[k].list
                            .map(item => item.field)
                            .concat(expression[i].display[k].primaryKey);
                    let nodataItem = {};
                    fields.forEach(a => {
                        nodataItem[a] = null;
                    });
                    if (conditions.length > 0 || ignoreConditions) {
                        let { DataSet: dataSet, Pagination: pagination, Error: error } = yield* getExternalValue(call, {
                            type: expression[i].type
                                ? expression[i].type
                                : expression[i].display[k].formType === 0
                                    ? "search"
                                    : "data",
                            source: expression[i].source,
                            primaryKey: expression[i].display[k].primaryKey,
                            fields,
                            conditions//: conditions.filter(a => (a.Value || "") !== "")
                            // pageInfo:{PageIndex:1,PageSize:3}
                        });
                        if (error) {
                            yield put({
                                type: "loadExternalDataFailed",
                                formTemplateVersionId,
                                id,
                                error
                            });
                        } else {
                            table = dataSet.Table;
                            let emptyData = false;
                            if (table.length === 0) {
                                table.push(nodataItem);
                                if (obj.triggerItem.isSubTable)
                                    emptyData = true;
                            }
                            yield put({
                                type: "bindExternalValue",
                                formDataModel,
                                allRelItems,
                                autoFill,
                                emptyData,
                                id,
                                formTemplateVersionId,
                                list: expression[i].display[k].list,
                                formType: expression[i].display[k].formType,
                                table,
                                pagination,
                                primaryKey: expression[i].display[k].primaryKey,
                                proxyIndex
                            });
                        }
                    }
                    //若条件为空，则自制空数据
                    else {
                        table.push(nodataItem);
                        yield put({
                            type: "bindExternalValue",
                            formDataModel,
                            autoFill,
                            allRelItems,
                            emptyData: obj.triggerItem.isSubTable === true,
                            id,
                            formTemplateVersionId,
                            list: expression[i].display[k].list,
                            formType: expression[i].display[k].formType,
                            table,
                            pagination: null,
                            primaryKey: expression[i].display[k].primaryKey,
                            proxyIndex
                        });
                    }
                }
            }
            yield put({
                type: "changeExternalLoading",
                formTemplateVersionId,
                id,
                loading: false
            });
        },
        * beginLoadResourceData(action, { select, call, put }) {
            let {
                id,
                linker,
                formTemplateVersionId,
                proxyIndex,
                formDataModel,
                allRelItems,
                ignoreConditions,
                autoFill,
                extraParams,
                force = false
            } = action;
            yield put({
                type: "changeExternalLoading",
                formTemplateVersionId,
                id,
                loading: true
            });
            //如果allRelItems为空，就重新取，这个是关联数据调用的时候才会触发的情况
            let obj = yield select(state => {
                let formState = state[model].all[formTemplateVersionId];
                let formBody = formState.get("formBody");
                let proxyPool = formState.get("proxyPool");
                let allTargetId = [];
                linker.conditions.forEach(con => {
                    if (!allTargetId.includes(con.targetId)) allTargetId.push(con.targetId);
                });
                let items = formBody
                    .filter(a => allTargetId.includes(a.get("id")))
                    .map(a => ({
                        id: a.get("id"),
                        value: a.getIn(["itemBase", "value"]),
                        text: a.getIn(["itemBase", "text"]),
                        valueType: a.get("valueType"),
                        formId: a.get("formId"),
                        delegate: a.get("delegate"),
                        container: a.get("container")
                    }));
                return {
                    allRelItems: items,
                    formDataModel: buildFormDataModel(formBody, getAllLinkProxyDatas(formBody, proxyPool))
                };
            });
            if (allRelItems === undefined) {
                formDataModel = obj.formDataModel;
            }
            allRelItems = obj.allRelItems;
            if (linker.request.primaryKeyValueType === undefined) {
                let valueTypes = yield select(state => state[model].controlExtra.valueType);
                let { data } = yield call(getModifyDataSource, { EntityId: linker.request.id });
                if (data.error)
                    return;
                let arrConfiguration = JSON.parse(data.configuration || "[]");
                //数据映射规则与获取到的比较，取出共有的
                let linkerBindMapAttrs = linker.bindMap.map(a => a.requestAttr);
                let exceptAttr = [];
                linkerBindMapAttrs.forEach(attr => {
                    if (!arrConfiguration.some(a => a.id === attr)) {
                        exceptAttr.push(attr);
                    }
                });
                linker.bindMap = linker.bindMap.filter(a => exceptAttr.includes(a.requestAttr));
                //参数规则与获取到的比较，共有及请求额外的
                let linkerParams = linker.request.params.map(a => a.name);
                let exceptParams = [];
                let commonParams = [];
                linkerParams.forEach(p => {
                    let exist = data.sourceParameterActionRequests.find(a => a.name === p);
                    if (exist) {
                        let linkParam = linker.request.params.find(a => a.name === p);
                        linkParam.requestType = exist.requestType;
                        linkParam.type = exist.parameterType;
                        commonParams.push(p);
                    } else {
                        exceptParams.push(p);
                    }
                });
                linker.request.params = linker.request.params
                    .filter(a => !exceptParams.includes(a.name))
                    .concat(
                        (data.sourceParameterActionRequests || [])
                            .filter(a => !commonParams.includes(a.name))
                            .map(a => ({
                                id: a.id,
                                name: a.name,
                                type: a.parameterType,
                                requestType: a.requestType,
                                value: a.value
                            }))
                    );
                linker.request.url = data.url;
                linker.request.methodType = data.methodType;
                linker.rule = data.rule;
                linker.primaryKeyValueType = valueTypes[(JSON.parse(data.configuration || "[]").find(a => a.primary === true) || { controlType: "SingleText" }).controlType];
                yield put({
                    type: "setDataLinker",
                    id,
                    dataLinker: linker,
                    formTemplateVersionId
                });
            }
            let conditionsValue = [];
            linker.conditions.forEach(item => {
                let value = getTargetTypeValue({
                    targetType: item.targetType,
                    targetId: item.targetId,
                    targetValue: item.targetValue,
                    allRelItems: allRelItems.toJS ? allRelItems.toJS() : allRelItems,
                    formDataModel,
                    proxyIndex
                });
                conditionsValue.push({
                    field: item.field,
                    operationType: item.operationType,
                    filter: com.dealConfigArr.find(a => a.value === item.operationType).filter.bind(null, value),
                    value
                });
            });
            //conditionsValue = conditionsValue.filter(a => (a.value || '') !== '');
            if (conditionsValue.length > 0 || ignoreConditions) {
                //请求类型获取
                let method = methodTypeList.find(a => a.value === linker.request.methodType).name;
                for (let k in extraParams) {
                    if (k === "key" && linker.primaryKey !== "") {
                        let value = extraParams.key;
                        delete extraParams.key;
                        extraParams["parentId"] = value;
                    }
                }
                let { paramsUrl, paramsBody, paramsHeader } = buildThirdResourceParams(
                    linker.request.params,
                    extraParams,
                    formDataModel,
                    proxyIndex
                );
                if (linker.request.url) {
                    let result = yield call(requestData, linker.request.url, method, paramsUrl, paramsBody, paramsHeader);
                    if (result.data.error) {
                        yield put({
                            type: "loadExternalDataFailed",
                            formTemplateVersionId,
                            id,
                            error: result.data.error
                        });
                    }
                    else {
                        let exportData = exportJsonData(result.data, JSON.parse(linker.rule));
                        if (!Array.isArray(exportData)) exportData = [exportData];
                        conditionsValue.forEach(con => {
                            if ((con.value || "").toString().trim() !== "")
                                exportData = exportData.filter(a => con.filter(a[con.field].toString())); //因为valueType可能不同，所以toString后比较
                        });
                        let list = buildThirdResourceData(linker);
                        let emptyData = false;
                        if (exportData.length === 0) {
                            let nodataItem = {};
                            list.forEach(l => {
                                nodataItem[l.id] = null;
                            });
                            emptyData = true;
                            exportData.push(nodataItem);
                        }
                        yield put({
                            type: "bindExternalValue",
                            id,
                            table: exportData,
                            emptyData,
                            list,
                            formTemplateVersionId,
                            primaryKey: linker.primaryKey ? linker.primaryKey.substr(linker.primaryKey.lastIndexOf(".") + 1) : "",
                            primaryKeyValueType: linker.primaryKeyValueType,
                            proxyIndex,
                            autoFill,
                            formDataModel,
                            force
                        });
                    }
                }
            }
            else {
                yield put({
                    type: "changeExternalLoading",
                    formTemplateVersionId,
                    id,
                    loading: false
                });
            }
        },
        * validateFormValue(action, { select, call, put }) {
            let { list, formTemplateVersionId } = action;
            let { formBody, formList, proxyPool, validateRelations } = yield select(state => {
                let formState = state[model].all[formTemplateVersionId];
                return {
                    formBody: formState.get("formBody"),
                    formList: formState.get("formList"),
                    proxyPool: formState.get("proxyPool"),
                    validateRelations: formState.get("validateRelations").toJS()
                };
            });
            let formDataModel = buildFormDataModel(formBody, getAllLinkProxyDatas(formBody, proxyPool));
            // let getFormDataModel = () => {
            //     if (formDataModel === null) {
            //         let linkProxyDatas = getAllLinkProxyDatas(formBody, proxyPool);
            //         formDataModel = buildFormDataModel(formBody, linkProxyDatas);
            //     }
            //     return formDataModel;
            // };
            list = buildValidateList(validateRelations, list, formDataModel, formBody);
            let getRelationsItems = (ids) => {
                return formBody.filter(a => ids.includes(a.get("id"))).map(a => ({
                    id: a.get("id"),
                    formId: a.get("formId")
                })).toJS();
            };
            let validateList = [];
            for (let i = 0, j = list.length; i < j; i++) {
                let items = list[i].items;
                let validateItem = { proxyIndex: list[i].proxyIndex, items: [] };
                for (let k = 0, l = items.length; k < l; k++) {
                    let item = items[k];
                    let formItem = formBody.find(a => a.get("id") === item.id);
                    if (formItem) {
                        formItem = formItem.toJS();
                        let itemBase = formItem.itemBase;
                        let res = null;
                        let id = formItem.id;
                        switch (formItem.formControlType) {
                            case FormControlType.Group://控件组容器不做校验
                                break;
                            //控件组表单项验证，对相应的groupItem进行验证
                            case FormControlType.GroupItem:
                                res = { help: "" };
                                let parentGroup = formBody.find(a => a.get("id") === formItem.container).toJS();
                                if (buildControlAuthority(parentGroup.authority).hidden !== true) {
                                    itemBase = parentGroup.itemBase;
                                    id = parentGroup.id;
                                    let groupRes = [];
                                    for (let k in parentGroup.itemBase.groupItems) {
                                        let groupItem = parentGroup.itemBase.groupItems[k];
                                        if (groupItem.private) continue;
                                        if (
                                            groupItem.required === true ||
                                            groupItem.formartValue === true ||
                                            groupItem.decimal === true
                                        ) {
                                            // let grouitemValue = formBody
                                            //     .find(a => a.get("id") === groupItem.id)
                                            //     .getIn(["itemBase", "value"]);
                                            try {
                                                let r = yield call(ValidateFormNew, {
                                                    ...groupItem,
                                                    value: item.data.value === undefined ? "" : item.data.value,//grouitemValue,// || ''
                                                    formDataModel,
                                                    getRelationsItems,
                                                    formId: formItem.formId,
                                                    proxyIndex: validateItem.proxyIndex
                                                });
                                                if (
                                                    r &&
                                                    (res.help !== groupItem.help ||
                                                        res.validateStatus !== groupItem.validateStatus)
                                                ) {
                                                    if (r.help.length > 0)
                                                        r.help =
                                                            (formItem.itemBase.dicMode
                                                                ? formItem.itemBase.name
                                                                : groupItem.name.replace(/{name}/gm, parentGroup.itemBase.name)) + r.help;
                                                    groupRes.push(r);
                                                    validateItem.items.push({ id: groupItem.id, data: r });
                                                }
                                            } catch (err) {
                                                //验证逻辑报错走这里
                                                console.log(err);
                                            }
                                        }
                                    }
                                    // 控件组多个验证的时候 toString()数组转字符串的时候会添加逗号
                                    res.help = groupRes.map(a => a.help).filter(a => a !== "");
                                    if (res.help.length > 0) {
                                        res.help = `${res.help.filter(a => a !== "").join("，")}。`;
                                        res.validateStatus = "error";
                                    }
                                    else {
                                        res.validateStatus = "";
                                        res.help = "";
                                    }
                                    validateItem.items.push({ id, data: res });
                                }
                                break;
                            default:
                                if (buildControlAuthority(formItem.authority).hidden !== true) {
                                    try {
                                        res = yield call(ValidateFormNew, {
                                            ...formItem.itemBase,
                                            id: formItem.id,
                                            code: formItem.code,
                                            table: (formList.find(a => a.get("id") === formItem.formId).toJS() || { code: null }).code,
                                            value: item.data.value === undefined ? "" : item.data.value,
                                            formDataModel,
                                            getRelationsItems,
                                            formId: formItem.formId,
                                            proxyIndex: validateItem.proxyIndex
                                        });
                                    } catch (err) {
                                        //验证逻辑报错走这里
                                        console.log(err);
                                    }
                                    if (res && (res.help !== itemBase.help || res.validateStatus !== itemBase.validateStatus ||
                                        validateItem.proxyIndex > -1)) {
                                        res.help = itemBase.name + res.help;
                                        validateItem.items.push({ id, data: res });
                                    }
                                }
                                break;
                        }
                    }
                }
                validateList.push(validateItem);
            }
            let vlist = validateList.filter(a => a.items.length > 0);
            if (vlist.length > 0) {
                yield put({
                    type: "setValue",
                    formTemplateVersionId,
                    list: vlist,
                    mode: "validate"
                });
            }
        },
        * beginResetItem(action, { select, call, put }) {
            let { list, formTemplateVersionId, proxyIndex } = action;
            let { formBody, formDataModel, dataLinker, invisibleTxtInit } = yield select(state => {
                let formState = state[model].all[formTemplateVersionId];
                let formBody = formState.get("formBody");
                let dataLinker = formState.get("dataLinker").toJS();
                let invisibleTxtInit = formState.getIn(["formProperties", "invisibleTxtInit"]);
                return {
                    formBody,
                    dataLinker,
                    formDataModel: buildFormDataModel(formBody, getAllLinkProxyDatas(formBody, formState.get("proxyPool"))),
                    invisibleTxtInit
                };
            });
            let items = formBody.filter(a => list.includes(a.get("id"))).toJS();
            let allRelItemIds = new Set();
            list.forEach(id => {
                let item = formBody.find(a => a.get("id") === id);
                if (item) {
                    item = item.toJS();
                    item.dataLinker.forEach(linker => {
                        linker.relations &&
                            linker.relations.forEach(r => {
                                allRelItemIds.add(r);
                            });
                    });
                }
            });
            allRelItemIds = Array.from(allRelItemIds);
            let allRelItems = formBody
                .filter(a => allRelItemIds.includes(a.get("id")))
                .map(a => ({
                    id: a.get("id"),
                    value: a.getIn(["itemBase", "value"]),
                    text: a.getIn(["itemBase", "text"]),
                    valueType: a.get("valueType"),
                    delegate: a.get("delegate"),
                    formId: a.get("formId"),
                    container: a.get("container")
                }));
            items = orderLinkers(items, dataLinker);
            items.filter(a => {
                let authority = buildControlAuthority(a.authority);
                return (a.itemBase.required || (a.formControlType === FormControlType.GroupItem ? formBody.find(b => b.get("id") === a.container).getIn(["itemBase", "groupItems", a.itemBase.key, "required"]) : false)
                    || a.itemBase.validateCustom || authority.required && authority.hidden !== true) && a.dataLinker.length === 0;
            }).forEach(a => {
                formDataModel = updateFormDataModel({
                    id: a.id,
                    formId: a.formId,
                    formDataModel,
                    proxyIndex,
                    result: { value: null }
                });
            });
            yield put({
                type: "linkItemsValue",
                formBody,
                formTemplateVersionId,
                items,
                allRelItems,
                allRelItemsOther: [],
                staticItems: [],
                formDataModel,
                dataLinker,
                invisibleTxtInit,
                list: [],
                proxyIndex,
                ignoreLink: false,
                initial: true
            });
        },
        * bindExternalValue(action, { select, call, put }) {
            //id为datalinker所在的控件id
            //console.log("设置关联数据");
            let { id, table, list, formTemplateVersionId, primaryKey, proxyIndex, autoFill, formDataModel, emptyData, force = false } = action;
            yield put({
                type: "changeExternalLoading",
                formTemplateVersionId,
                id,
                loading: false
            });
            let formState = yield select(state => state[model].all[formTemplateVersionId]);
            let formBody = formState.get("formBody");
            let triggerItem = formBody.find(a => a.get("id") === id).toJS();
            let updateForm = formDataModel.find(a => a.formId === triggerItem.formId);
            updateForm.update = true;
            let updateItem = null,
                index = null,
                updateItemValueType = null;
            switch (triggerItem.formControlType) {
                //普通控件，说明是控件自身设置的数据联动,直接更新值
                case FormControlType.Item:
                    let value = [];
                    // let value=parseFormValue(table[0][list[0].field], triggerItem.valueType)
                    if (list[0].field instanceof Array) {
                        list[0].field.map(v => {
                            value.push(parseFormValue(table[0][v], triggerItem.valueType));
                        });
                        value = value.join("----");
                    } else {
                        value = parseFormValue(table[0][list[0].field], triggerItem.valueType);
                    }
                    switch (updateForm.formType) {
                        default:
                        case FORM_TYPE.mainForm:
                            updateItem = updateForm.values.find(a => a.id === triggerItem.id);
                            index = updateForm.values.indexOf(updateItem);
                            updateForm.values[index] = { ...updateItem, value, update: true };
                            break;
                        case FORM_TYPE.subForm:
                            let updateRow = updateForm.values[proxyIndex];
                            if (updateRow) {
                                updateItem = updateRow.list.find(a => a.id === triggerItem.id);
                                index = updateRow.list.indexOf(updateItem);
                                updateRow.list[index] = { ...updateItem, value, update: true };
                            }
                            break;
                    }
                    break;
                //如果是控件组/关联类控件  autofill确定为主动调用还是被动调用
                //true 主动调用，直接赋值到对应的控件上，被动调用，触发onLoadData回调更新props，控件自行处理
                case FormControlType.Container:
                case FormControlType.Group:
                case FormControlType.External:
                    //构建映射map
                    let childItems = getAllChildren(id, formBody.toJS()); //formBody.filter(a => a.get('container') === id).toJS();
                    // let map = { [primaryKey]: 'key' };
                    let map = [{
                        targetId: primaryKey,
                        attr: "key"
                    }];
                    let valueTypeMap = { key: action.primaryKeyValueType || "string" };
                    let labelMap = {};
                    list.forEach(a => {
                        let exist = childItems.find(b => b.itemBase.externalId === a.id);
                        if (exist) {
                            //map[a.field] = exist.id;
                            map.push({
                                targetId: a.field,
                                attr: exist.id
                            });
                            //控件组控件，系统控件类型不进行valueType转换
                            if (exist.formControlType > -1)
                                valueTypeMap[exist.id] = a.valueType || exist.valueType;
                            if (exist.event && exist.event.onBuildFormDataModel)
                                labelMap[exist.id] = (v) => exist.event.onBuildFormDataModel.call(null, v, {
                                    ...exist.itemBase,
                                    id: exist.id
                                });
                        } else {
                            //map[a.field] = a.id;
                            map.push({
                                targetId: a.field,
                                attr: a.id
                            });
                        }

                    });
                    //构建数据
                    let mapData = [];
                    if (emptyData !== true)//true 之后，不会清除之前联动的值
                        table.forEach(a => {
                            let item = {};
                            // map.forEach(mapItem => {
                            //     let value = parseFormValue(a[mapItem.targetId], valueTypeMap[mapItem.attr]);
                            //     item[mapItem.attr] = { value };
                            //     if (mapItem.attr !== "key") {
                            //         if (labelMap[mapItem.attr])
                            //             item[mapItem.attr].name = labelMap[mapItem.attr].call(null, value).toString();
                            //         else
                            //             item[mapItem.attr].name = (value || "").toString();
                            //     }
                            // });
                            map.forEach(mapItem => {
                                let value = [];
                                if (mapItem.targetId instanceof Array) {
                                    mapItem.targetId.map(v => {
                                        value.push(parseFormValue(a[v], valueTypeMap[mapItem.attr]));
                                    });
                                    value = value.join("----");
                                } else {
                                    value = parseFormValue(a[mapItem.targetId], valueTypeMap[mapItem.attr]);
                                }
                                item[mapItem.attr] = { value };
                                if (mapItem.attr !== "key") {
                                    if (labelMap[mapItem.attr])
                                        item[mapItem.attr].name = labelMap[mapItem.attr].call(null, value).toString();
                                    else
                                        item[mapItem.attr].name = (value || "").toString();
                                }
                            });
                            mapData.push(item);
                            //如果没有主键，自动创建
                            if (!item.key && isNaN(item.key)) item.key = com.Guid();
                        });
                    debugger;
                    switch (updateForm.formType) {
                        default:
                        //主表内的控件组/关联控件，
                        case FORM_TYPE.mainForm:
                            //自动填充 关联查询赋值 控件组直接赋值控件
                            if (autoFill) {
                                for (let item in mapData[0]) {
                                    updateItem = updateForm.values.find(a => a.id === item);
                                    if (updateItem) {
                                        updateItemValueType = formBody
                                            .find(a => a.get("id") === updateItem.id)
                                            .get("valueType");
                                        index = updateForm.values.indexOf(updateItem);
                                        updateForm.values[index] = {
                                            ...updateItem,
                                            value: parseFormValue(mapData[0][item].value, updateItemValueType),
                                            update: true
                                        };
                                    }
                                }
                            }
                            //调用onLoadData  关联数据 控件组类非直接赋值控件
                            else if (triggerItem.event.onLoadData) {
                                let newProps = triggerItem.event.onLoadData({
                                    data: mapData,
                                    props: { ...triggerItem.itemBase, id, proxyIndex },
                                    force
                                });
                                updateItem = updateForm.values.find(a => a.id === id);
                                if (updateItem) {
                                    index = updateForm.values.indexOf(updateItem);
                                    updateItemValueType = formBody
                                        .find(a => a.get("id") === updateItem.id)
                                        .get("valueType");
                                    updateForm.values[index] = {
                                        ...updateItem,
                                        value: parseFormValue(mapData[0][item].value, updateItemValueType),
                                        update: true
                                    };
                                } else {
                                    updateForm.values.push({ id, ...newProps, update: true });
                                }
                            }
                            break;
                        case FORM_TYPE.subForm:
                            //自动填充
                            //子表单自身
                            if (triggerItem.isSubTable) {
                                //清除原有数据
                                updateForm.values = [];
                                yield put({
                                    type: "clearSubFormData",
                                    formTemplateVersionId,
                                    id
                                });
                                //兼容老版本
                                if (triggerItem.itemBase.primaryKeyId === undefined) {
                                    triggerItem.itemBase.primaryKeyId = formBody.find(a => a.get("itemType") === "PrimaryKey" && a.get("formControlType") === FormControlType.System && a.get("container") === triggerItem.id).get("id");
                                }
                                mapData.forEach((md, i) => {
                                    if (!updateForm.values[i]) {
                                        updateForm.values[i] = { list: [], parentIndex: 0 };
                                    }
                                    for (let k in md) {
                                        let value = md[k].value;
                                        k = k === "key" ? triggerItem.itemBase.primaryKeyId : k;
                                        //子表赋值主键值不能用原始表的，否则会导致主键重复
                                        if (k === triggerItem.itemBase.primaryKeyId)
                                            value = com.Guid();
                                        let exist = updateForm.values[i].list.find(a => a.id === k);
                                        if (exist === undefined)
                                            updateForm.values[i].list.push({
                                                id: k,
                                                value,
                                                update: true
                                            });
                                        else {
                                            exist.value = value;
                                            exist.update = true;
                                        }
                                    }
                                });
                                return;
                            }
                            //自动填充
                            //子表单内的控件，更新对应代理池下对应行的值
                            if (autoFill) {
                                for (let item in mapData[0]) {
                                    updateItem = updateForm.values[proxyIndex].list.find(a => a.id === item);
                                    if (updateItem) {
                                        index = updateForm.values[proxyIndex].list.indexOf(updateItem);
                                        updateItemValueType = formBody
                                            .find(a => a.get("id") === updateItem.id)
                                            .get("valueType");
                                        updateForm.values[proxyIndex].list[index] = {
                                            ...updateItem,
                                            value: parseFormValue(mapData[0][item].value, updateItemValueType),
                                            update: true
                                        };
                                    }
                                }
                            }
                            //调用onLoadData
                            else if (triggerItem.event.onLoadData) {
                                let subTable = getFormContainerByContainerId(triggerItem.container, formBody);
                                let proxy = formState.getIn(["proxyPool", subTable.get("id")]).toJS();
                                if (isNaN(proxyIndex)) {
                                    let getProxyIndex = subTable.getIn(["proxyEvents", "getProxyIndex"]);
                                    if (getProxyIndex instanceof Function) {
                                        proxyIndex = getProxyIndex(proxy);
                                    } else {
                                        throw new error("no getProxyIndex function to be called!");
                                    }
                                }
                                let proxyData = subTable.getIn(["proxyEvents", "onLinkGet"]).call(null, {
                                    proxy,
                                    proxyIndex
                                });
                                if (proxyData.length === 0)
                                    break;
                                //将新props写入对应的控件内
                                let newProps2 = triggerItem.event.onLoadData({
                                    data: mapData,
                                    props: { ...triggerItem.itemBase, id, ...proxyData[0][triggerItem.id], proxyIndex },
                                    force
                                });
                                let exist = formDataModel.find(
                                    a => a.formId === triggerItem.formId && a.formType === FORM_TYPE.mainForm
                                );
                                if (!exist) {
                                    exist = { formId: triggerItem.formId, formType: FORM_TYPE.mainForm, values: [] };
                                    formDataModel.push(exist);
                                }
                                exist.update = true;
                                updateItem = exist.values.find(a => a.id === id);
                                if (updateItem) {
                                    index = updateForm.values.indexOf(updateItem);
                                    exist.values[index] = { ...updateItem, ...newProps2, update: true };
                                } else {
                                    exist.values.push({ id, ...newProps2, update: true });
                                }
                            }
                            break;
                    }
                    break;
            }
            let newList = buildItemValus(formDataModel);
            if (newList.length > 0) {
                yield put({
                    type: "setValue",
                    formTemplateVersionId,
                    list: newList,
                    ignoreLink: true
                });
            }
        },
        * addRowData(action, effects) {
            let { id, formTemplateVersionId, rowData, primaryKeyValue } = action;
            let formState = yield effects.select(state => state[model].all[formTemplateVersionId]);
            let formBody = formState.get("formBody");
            let proxyPool = formState.get("proxyPool");
            let instId = formState.get("instId");
            let subContainer = formBody.find(a => a.get("id") === id);
            let subContainerPrimayKeyId = formBody.find(a => a.get("container") === id &&
                a.get("itemType") === "PrimaryKey" && a.get("controlType") === ControlType.PrimaryKey).get("id");
            let proxyIndex = 0;
            let listData = [];
            let resetList = [];
            if (subContainer.has("proxyEvents")) {
                let parentProxyData = [];
                if (subContainer.getIn(["proxyEvents", "onLinkGet"]) instanceof Function) {
                    parentProxyData = subContainer.getIn(["proxyEvents", "onLinkGet"]).call(null, {
                        proxy: proxyPool.get(id).toJS()
                    });
                    let emptyRowData = buildSubFormRowDataModel(id, formBody.toJS(), instId);
                    emptyRowData[subContainerPrimayKeyId] = primaryKeyValue;
                    let proxyData = {};
                    for (let item in emptyRowData) {
                        proxyData[item] = { value: emptyRowData[item] };
                        if (rowData[item] === undefined && item !== subContainerPrimayKeyId) {
                            resetList.push(item);
                        }
                    }
                    parentProxyData.push(proxyData);
                    proxyIndex = parentProxyData.length - 1;
                }
                //代理回写
                if (subContainer.getIn(["proxyEvents", "onLinkSet"]) instanceof Function) {
                    let newProxyItem = subContainer.getIn(["proxyEvents", "onLinkSet"]).call(null, {
                        linkData: parentProxyData,
                        proxy: proxyPool.get(id).toJS()
                    });
                    yield effects.put({
                        type: "setProxy",
                        formTemplateVersionId,
                        id,
                        proxyData: newProxyItem
                    });
                }
            }
            for (let item in rowData) {
                if (rowData[item] == null)
                    continue;
                listData.push({ id: item, data: { value: rowData[item] } });
            }
            if (resetList.length > 0) {
                yield effects.put({
                    type: "beginResetItem",
                    list: resetList,
                    proxyIndex,
                    formTemplateVersionId
                });
            }
            yield effects.put({
                type: "setValue",
                formTemplateVersionId,
                list: [{ proxyIndex, items: listData }]
            });
        },
        * removeRowData(action, effects) {
            let { id, formTemplateVersionId, primaryKeyValue } = action;
            let formState = yield effects.select(state => state[model].all[formTemplateVersionId]);
            let formBody = formState.get("formBody");
            let proxyPool = formState.get("proxyPool");
            let subContainer = formBody.find(a => a.get("id") === id);
            let subContainerPrimayKeyId = formBody.find(a => a.get("container") === id &&
                a.get("itemType") === "PrimaryKey" && a.get("controlType") === ControlType.PrimaryKey).get("id");
            if (subContainer.has("proxyEvents")) {
                let parentProxyData = [];
                if (subContainer.getIn(["proxyEvents", "onLinkGet"]) instanceof Function) {
                    parentProxyData = subContainer.getIn(["proxyEvents", "onLinkGet"]).call(null, {
                        proxy: proxyPool.get(id).toJS()
                    });
                    parentProxyData = parentProxyData.filter(a => a[subContainerPrimayKeyId].value !== primaryKeyValue);
                }
                //代理回写
                if (subContainer.getIn(["proxyEvents", "onLinkSet"]) instanceof Function) {
                    let newProxyItem = subContainer.getIn(["proxyEvents", "onLinkSet"]).call(null, {
                        linkData: parentProxyData,
                        proxy: proxyPool.get(id).toJS()
                    });
                    yield effects.put({
                        type: "setProxy",
                        formTemplateVersionId,
                        id,
                        renderList: true,
                        proxyData: newProxyItem
                    });
                }
            }
        },
        * setTableLinkerValue(action, effects) {
            let { formTemplateVersionId, tableId, value, proxyIndex } = action;
            let formState = yield effects.select(state => state[model].all[formTemplateVersionId]);
            let formBody = formState.get("formBody");
            let tableLinkerItem = formBody.find(a => a.get("container") === tableId && a.get("itemType") === "TableLinker" && a.get("status") !== FORMSTATUS.Delete);
            if (tableLinkerItem) {
                yield effects.put({
                    type: "setValue",
                    formTemplateVersionId,
                    list: [{ proxyIndex, items: [{ id: tableLinkerItem.get("id"), data: { value } }] }]
                });
            }
        }
    };
}

export function reducers(renderStyle) {
    let bindComponent;
    switch (renderStyle) {
        case RenderStyle.Design:
            bindComponent = function (formItem, newItem, wrappedComponent, type) {
                formItem.Component = wrappedComponent.find(b => b.itemType === type).Component;
                formItem.WrappedComponent = initFormItem(newItem.formControlType, newItem.Component);
                formItem.event = { ...initFormItemEvent(newItem.formControlType), ...formItem.event };
            };
            break;
        default:
            bindComponent = function (formItem, newItem) {
                formItem.Component = initFormItem(newItem.formControlType, newItem.Component);
                formItem.event = { ...initFormItemEvent(newItem.formControlType), ...formItem.event };
            };
            break;
    }
    return {
        setValue(state, action) {
            console.log(action)
            //list=[{proxyIndex:0,items:[{id:'',data:{value:'',....}},{}]}]
            let { list, formTemplateVersionId, ignoreLink, loadValue, mode } = action;
            if (list.length === 0) return state;
            if (list.items && list.items.length === 0) return state;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let proxyPool = formState.get("proxyPool");
            let newProxyPool = proxyPool;
            let valueTypeMap = {};
            list.forEach(itemList => {
                let proxyIndex = itemList.proxyIndex;
                itemList.items = itemList.items.filter(a => a.id);
                if (proxyIndex < 0) {
                    itemList.items.forEach(item => {
                        let formItem = formBody.find(a => a.get("id") === item.id);
                        if (formItem) {
                            let index = formBody.indexOf(formItem);
                            let data = item.data;
                            if (data.value)
                                data.value = parseFormValue(data.value, formItem.get("valueType"));
                            formItem = formItem.set("itemBase", formItem.get("itemBase").merge(fromJS(data)));
                            if (formItem.get("status") !== FORMSTATUS.Add && loadValue !== true) {
                                formItem = formItem.set("status", FORMSTATUS.Modify);
                            }
                            if (item.authority) {
                                let authority = formItem.get("authority").toJS();
                                for (let a in item.authority) {
                                    authority[a] = { ...authority[a], ...item.authority[a] };
                                }
                                formItem = formItem.set("authority", fromJS(authority));
                            }
                            formBody = formBody.set(index, formItem);
                        }
                    });
                } else {
                    let parent = getFormContainerByContainerId(
                        formBody.find(a => a.get("id") === itemList.items[0].id).get("container"),
                        formBody
                    );
                    let parentProxyData = [];
                    if (parent.has("proxyEvents")) {
                        //获取对应的代理数据赋值 因为在编辑状态，所以代理容器只返回对应行的数据
                        if (parent.getIn(["proxyEvents", "onLinkGet"]) instanceof Function) {
                            parentProxyData = parent.getIn(["proxyEvents", "onLinkGet"]).call(null, {
                                proxy: newProxyPool.get(parent.get("id")).toJS(),
                                proxyIndex
                            });
                            itemList.items.forEach(item => {
                                let formItem = formBody.find(a => a.get("id") === item.id);
                                if (formItem) {
                                    let index = formBody.indexOf(formItem);
                                    if (formItem.get("formControlType") === FormControlType.Group) {
                                        let data = item.data;
                                        if (data.value)
                                            data.value = parseFormValue(data.value, formItem.get("valueType"));
                                        formItem = formItem.set("itemBase", formItem.get("itemBase").merge(fromJS(data)));
                                        if (formItem.get("status") !== FORMSTATUS.Add && loadValue !== true) {
                                            formItem = formItem.set("status", FORMSTATUS.Modify);
                                        }
                                    }
                                    else if (mode !== "validate") {
                                        if (!parentProxyData[0]) {
                                            parentProxyData[0] = {};
                                        }
                                        if (item.data.value) {
                                            let valueType = valueTypeMap[item.id];
                                            if (valueType === undefined)
                                                valueType = formBody.find(a => a.get("id") === item.id).get("valueType");
                                            item.data.value = parseFormValue(item.data.value, valueType);
                                        }
                                        //parentProxyData[0][item.id] = { ...parentProxyData[0][item.id], ...item.data };
                                    }
                                    parentProxyData[0][item.id] = { ...parentProxyData[0][item.id], ...item.data };
                                    if (item.authority) {
                                        let authority = formItem.get("authority").toJS();
                                        for (let a in item.authority) {
                                            authority[a] = { ...authority[a], ...item.authority[a] };
                                        }
                                        parentProxyData[0][item.id].authority = fromJS(authority);
                                        // if (buildControlAuthority(authority).hidden === false)
                                        //     formItem = formItem.set("authority", fromJS(authority));
                                    }
                                    formBody = formBody.set(index, formItem);
                                }
                            });
                        }
                        //代理回写
                        if (parent.getIn(["proxyEvents", "onLinkSet"]) instanceof Function) {//&& mode !== "validate") {
                            let newProxyItem = parent.getIn(["proxyEvents", "onLinkSet"]).call(null, {
                                linkData: parentProxyData,
                                proxy: newProxyPool.get(parent.get("id")).toJS(),
                                proxyIndex
                            });
                            newProxyPool = newProxyPool.set(parent.get("id"), fromJS(newProxyItem));
                        }
                    }
                }
            });
            // if (mode === 'validate')
            //     debugger
            // if (newProxyPool !== proxyPool) {
            formState = formState.set("proxyPool", newProxyPool);
            // }
            if (formState.get("formStatus") === FORMSTATUS.Add) {
                //新增
                all[action.formTemplateVersionId] = formState.set("formBody", formBody); //.set('renderList', fromJS(renderList));
            } else {
                //修改
                all[action.formTemplateVersionId] = formState
                    .set("formBody", formBody) //.set('renderList', fromJS(renderList))
                    .set("formStatus", ignoreLink ? formState.get("formStatus") : FORMSTATUS.Modify);
            }
            return { ...state, all };
        },

        resetForm(state, action) {
            //debugger
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            if (formState) {
                let formBody = formState.get("formBody");
                formBody = formBody.map(a => a.setIn(["itemBase", "value"], parseFormValue(null, a.get("valueType"))));
                let rootContainer = formState.get("rootContainer");
                let result = initProxyPool(formBody, FormControlList, rootContainer);
                formBody = result.formBody;
                let proxyPool = result.proxyPool;
                all[action.formTemplateVersionId] = formState.set("formBody", formBody)
                    .set("proxyPool", proxyPool).set("oldValues", fromJS([]))
                    .set("formStatus", action.formStatus)
                    .set("bussinessProxyState", fromJS([]))
                    .set("bussinessComponents", fromJS([]))
                    .set("bussinessComponentsList", fromJS([]))
                    .set("bussinessSubmitInfo", fromJS([]));
                return { ...state, all };
            }
            return state;
        },
        setProxy(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let formBody = formState.get("formBody");
            let proxyItem = formBody.find(a => a.get("id") === action.id);
            let proxyPool = formState.get("proxyPool").toJS();
            if (
                formState.get("formRenderStyle") !== RenderStyle.Design &&
                proxyItem.hasIn(["proxyEvents", "onLinkGet"])
            ) {
                let proxyDataChecker = proxyItem.getIn(["proxyEvents", "onLinkGet"])({ proxy: proxyPool[action.id] })
                    .length;
                formState = formState.setIn(["proxyChecker", action.id], proxyDataChecker);
            }
            let renderList = formState.get("renderList");
            if (action.renderList === true) {
                if (!renderList.includes(action.id))
                    renderList = renderList.push(action.id);
            }
            else {
                renderList = fromJS([action.id]);
            }
            all[action.formTemplateVersionId] = setFormProxy(formState, action).set("renderList", renderList);
            return { ...state, all };
        },
        setAnchorIndex(state, action) {
            let all = state.all;
            let formTemplateVersionId = action.payload.formTemplateVersionId;
            let formState = all[formTemplateVersionId];
            all[formTemplateVersionId] = formState.set("anchorIndex", action.payload.anchorIndex);

            return { ...state, all };
        },
        allCollapseToggle(state, action) {
            // console.log(action)
            let all = state.all;
            let { singleId, formTemplateVersionId } = action.payload;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let newBody = formBody;
            if (typeof singleId === "string") {
                //单个
                formBody.forEach((e, i) => {
                    if (e.get("id") === singleId) {
                        newBody = newBody.set(i, e.setIn(["itemBase", "collapse"], true));
                    }
                });
                all[formTemplateVersionId] = formState.set("formBody", newBody);
            } else {
                formBody
                    .filter(a => a.get("formControlType") > 0)
                    .forEach((a, ind) => {
                        if (ind > 1) {
                            let index = formBody.indexOf(a);
                            newBody = newBody.set(index, a.setIn(["itemBase", "collapse"], showCollapse));
                        }
                    });
                showCollapse = !showCollapse;
                let renderList = formBody.filter(a => a.get("formControlType") > 0).map(a => a.get("id"));
                formState = formState.set("formBody", newBody).set("renderList", renderList);
                all[formTemplateVersionId] = formState;
            }

            return { ...state, all };
        },
        changeExternalLoading(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            let key = "formBody";
            let formBody = formState.get(key);
            let item = formBody.find(a => a.get("id") === action.id);
            let index = formBody.indexOf(item);
            item = item.setIn(["itemBase", "externalLoading"], action.loading);
            formBody = formBody.set(index, item);
            formState = formState.set(key, formBody);
            all[action.formTemplateVersionId] = formState;
            return { ...state, all };
        },
        clearSubFormData(state, action) {
            let all = state.all;
            let formTemplateVersionId = action.formTemplateVersionId;
            let formState = all[formTemplateVersionId];
            let proxyPool = formState.get("proxyPool");
            let formBody = formState.get("formBody");
            let item = formBody.find(a => a.get("id") === action.id);
            if (item.getIn(["proxyEvents", "onLinkSet"]) instanceof Function) {
                let newProxyItem = item.getIn(["proxyEvents", "onLinkSet"]).call(null, {
                    linkData: [],
                    proxy: proxyPool.get(action.id).toJS()
                });
                proxyPool = proxyPool.set(action.id, fromJS(newProxyItem));
            }
            all[action.formTemplateVersionId] = formState.set("proxyPool", proxyPool).set("renderList", fromJS([action.id]));
            return { ...state, all };
        },
        initAuthority(state, action) {
            let { permission } = action;
            let all = state.all;
            let formTemplateVersionId = action.formTemplateVersionId;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            permission = permission || [];
            formBody.forEach((a, index) => {
                let authority = a.has("authority")
                    ? a.get("authority").toJS()
                    : {
                        hidden: {},
                        disabled: {},
                        readOnly: {}
                    };
                let exist = permission.find(b => b.id === a.id);
                //成员/职责/机构权限注入
                if (exist) {
                }
                //控件属性 权限注入
                if (a.getIn(["itemBase", "hidden"]) === true) {
                    authority.hidden.itemBase = true;
                }
                if (a.getIn(["itemBase", "disabled"]) === true) {
                    authority.disabled.itemBase = true;
                }
                if (a.getIn(["itemBase", "readOnly"]) === true) {
                    authority.readOnly.itemBase = true;
                }
                a = a.set("authority", fromJS(authority));
                formBody = formBody.set(index, a);
            });
            all[action.formTemplateVersionId] = formState.set("formBody", formBody);
            return { ...state, all };
        },
        setRenderList(state, action) {
            let all = state.all;
            let formTemplateVersionId = action.formTemplateVersionId;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            action.list.forEach(a => {
                let item = formBody.find(b => b.get("id") === a);
                let index = formBody.indexOf(item);
                //item = item.set('status', item.get('status') === FORMSTATUS.Add ? FORMSTATUS.Add : FORMSTATUS.Modify);
                formBody = formBody.set(index, item);
            });
            all[formTemplateVersionId] = formState.set("formBody", formBody).set("renderList", fromJS(action.list));
            return { ...state, all };
        },
        changeLoading(state, action) {
            let all = state.all;
            let formState = all[action.formTemplateVersionId];
            if (formState) {
                formState = formState.set("formLoading", action.loading);
                all[action.formTemplateVersionId] = formState;
                return { ...state, all };
            }
            return state;
        },
        getTableLinkerValueList(state, action) {
            let { id, formTemplateVersionId } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let tableLinkerNameItem = formBody.find(a => a.get("id") === id);
            let linkerFields = tableLinkerNameItem.getIn(["itemBase", "tableLinkerFields"]);
            if (linkerFields)
                linkerFields = linkerFields.toJS();
            else
                linkerFields = [];
            let eventMap = {};
            let valueMap = {};
            formBody.filter(a => linkerFields.includes(a.get("id")) && a.get("status") !== FORMSTATUS.Delete).forEach(a => {
                if (state.controlExtra.event[a.get("itemType")].onBuildFormDataModel instanceof Function) {
                    eventMap[a.get("id")] = (value) => a.getIn(["event", "onBuildFormDataModel"])(value, {
                        ...a.get("itemBase").toJS(),
                        id: a.get("id")
                    });
                }
                valueMap[a.get("id")] = state.controlExtra.valueType[a.get("itemType")];
            });
            let tableValueList = [];
            let parentTable = formBody.find(a => a.get("id") === tableLinkerNameItem.getIn(["itemBase", "tableLinkerParentId"]));
            if (parentTable.getIn(["proxyEvents", "onLinkGet"]) instanceof Function) {
                let primaryKey = formBody.find(a => a.get("container") === parentTable.get("id") && a.get("itemType") === "PrimaryKey" && a.get("status") !== FORMSTATUS).get("id");
                let proxyData = parentTable.getIn(["proxyEvents", "onLinkGet"]).call(null, {
                    proxy: formState.getIn(["proxyPool", parentTable.get("id")]).toJS()
                });
                proxyData.forEach(a => {
                    let val = [];
                    linkerFields.forEach(b => {
                        if (a[b]) {
                            let value = a[b].value;
                            if (eventMap[b])
                                value = eventMap[b](value);
                            else
                                value = parseFormValue(value, valueMap[b]);
                            val.push(value);
                        }
                    });
                    tableValueList.push({ value: a[primaryKey].value, name: val.toString() });
                });
            }
            if (tableValueList.length > 0) {
                let index = formBody.indexOf(tableLinkerNameItem);
                formBody = formBody.set(index, tableLinkerNameItem.setIn(["itemBase", "tableLinkerValueList"], tableValueList));
                all[action.formTemplateVersionId] = formState.set("formBody", formBody);
                return { ...state, all };
            }
            return state;
        },
        setTableLinkerFilterValue(state, action) {
            let { id, formTemplateVersionId, value } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let subLinkerList = formBody.filter(a => a.getIn(["itemBase", "tableLinkerParentId"]) === id && a.get("itemType") === "TableLinker").map(a => a.get("container")).toJS();
            let renderList = [];
            subLinkerList.forEach(l => {
                renderList.push(l);
                let subTable = formBody.find(a => a.get("id") === l);
                let index = formBody.indexOf(subTable);
                formBody = formBody.set(index, subTable.setIn(["itemBase", "tableLinkerFilterValue"], value));
            });
            all[action.formTemplateVersionId] = formState.set("formBody", formBody).set("renderList", fromJS(renderList));
            return { ...state, all };
        },
        applyLang(state, action) {
            let { formTemplateVersionId, lang } = action;
            let all = state.all;
            let formState = all[formTemplateVersionId];
            let formBody = formState.get("formBody");
            let renderList = [];
            formBody = formBody.map(a => {
                if (a.hasIn(["itemBase", "lang", lang])) {
                    renderList.push(a.get("id"));
                    return a.setIn(["itemBase", "name"], a.getIn(["itemBase", "lang", lang]));
                }
                return a;
            });
            all[action.formTemplateVersionId] = formState.set("formBody", formBody).set("renderList", fromJS(renderList));
            return { ...state, all };
        }
    };
}

export function buildFormBody({
    data, reg, formProperties, readOnly,
    wrappedComponent, design, renderStyle = RenderStyle.PC,
    designProps = []
}) {
    const bindComponent = design ?
        function (formItem, newItem, type) {
            formItem.Component = wrappedComponent.find(b => b.itemType === type).Component;
            formItem.WrappedComponent = initFormItem(newItem.formControlType, newItem.Component);
            formItem.event = { ...initFormItemEvent(newItem.formControlType), ...formItem.event };
            designProps.forEach(d => {
                formItem[d] = newItem[d];
            });
        }
        :
        function (formItem, newItem) {
            formItem.Component = initFormItem(newItem.formControlType, newItem.Component);
            formItem.event = { ...initFormItemEvent(newItem.formControlType), ...formItem.event };
        };
    let { border, formLayout, formControlStyleModel } = formProperties;
    let { areaActionRequests, formVersionHistoryActionRequests } = data;
    areaActionRequests = areaActionRequests.map(a => {
        return { ...a, property: JSON.parse(a.property || "{}") };
    });
    let rootArea = areaActionRequests.find(a => a.areaType === "Root");
    let otherArea = areaActionRequests.filter(a => a.areaType !== "Root");
    let formBody = [];
    //root
    formBody.push({
        id: rootArea.id,
        dataLinker: [],
        itemType: "Root",
        status: FORMSTATUS.NoChange,
        formControlType: FormControlType.Container,
        itemBase: rootArea.property,
        controlStatus: ControlStatus.Normal,
        controlType: ControlTypeTransf("None"),
        formId: rootArea.property.formId,
        authority: { hidden: { system: true }, disabled: {} },
        order: 0,
        layer: 0,
        isSubTable: true
    });
    //area载入
    otherArea.forEach(a => {
        let newItem = FormControlList.find(b => b.itemType === a.areaType);
        if (newItem) {
            let itemBase = a.property;
            if (itemBase.readyToSubmit === false) {
                delete itemBase.readyToSubmit;
            }
            let authority = {
                hidden: { system: a.isHide || false },
                readOnly: {},
                disabled: {},
                required: {}
            };
            if (itemBase.hidden === true)
                authority.hidden.itemBase = true;
            if (itemBase.disabled === true)
                authority.disabled.itemBase = true;
            if (itemBase.readOnly === true)
                authority.readOnly.itemBase = true;
            if (itemBase.required === true)
                authority.required.itemBase = true;
            let area = {
                id: a.id,
                itemType: a.areaType,
                code: a.code,
                container: a.parentId,
                itemBase,
                status: FORMSTATUS.NoChange,
                order: a.sortIndex,
                dataLinker: JSON.parse((a.dataLink || "[]").replace(reg, "\u2800")),
                formControlType: newItem.formControlType,
                controlStatus: ControlStatus.Normal,
                controlType: ControlType.Container,
                noMappad: itemBase.noMappad === true,
                //linkFormDetail: [],
                formId: getAreaFormId(a.id, areaActionRequests),
                event: newItem.event || {},
                authority,
                layer: a.layer,
                renderStyle,
                valueType: newItem.valueType,
                isSubTable: a.areaType === "SubForm",
                border, formLayout, formControlStyleModel
            };
            // if (area.formControlType === FormControlType.Group)
            //     area = {...area, ...formProperties};
            design ? bindComponent(area, newItem, a.areaType) : bindComponent(area, newItem);
            //代理控件初始化
            if (newItem.proxy instanceof Object) {
                initProxyItem(area, newItem);
            }
            formBody.push(area);
        }
    });
    //item载入
    formVersionHistoryActionRequests.forEach(a => {
        let newItem = FormControlList.find(b => b.itemType === a.controlTypeDes);
        let itemBase = JSON.parse((a.property || "{}").replace(reg, "\u2800"));
        let authority = {
            hidden: { system: a.isHide || false },
            readOnly: {},
            disabled: {},
            required: {}
        };
        if (itemBase.hidden === true)
            authority.hidden.itemBase = true;
        if (itemBase.disabled === true)
            authority.disabled.itemBase = true;
        if (itemBase.readOnly === true)
            authority.readOnly.itemBase = true;
        if (itemBase.required === true)
            authority.required.itemBase = true;
        let formItem = {
            id: a.id,
            itemBase,
            container: a.areaId,
            status: FORMSTATUS.NoChange,
            order: a.sortIndex,
            itemType: a.controlTypeDes,
            //linkFormDetail: [],
            dataLinker: JSON.parse((a.dataLink || "[]").replace(reg, "\u2800")),
            code: a.code,
            controlStatus: ControlStatus.Normal,
            controlType: ControlTypeTransf(a.controlTypeDes),
            authority,
            isHide: a.isHide,
            formVersionId: a.formVersionId,
            formId: a.formId,
            noMappad: a.noMappad
        };
        formItem.isExternal = formItem.itemBase.isExternal || false;
        if (newItem) {
            formItem = {
                ...formItem,
                renderStyle,
                formControlType: newItem.formControlType,
                event: newItem.event || {},
                valueType: newItem.valueType,
                containerMode: newItem.containerMode === true,
                border, formLayout, formControlStyleModel
            };
            design ? bindComponent(formItem, newItem, newItem.itemType, designProps) : bindComponent(formItem, newItem);
            //代理初始化
            if (newItem.proxy instanceof Object) {
                initProxyItem(formItem, newItem);
            }
        } else {
            switch (a.controlTypeDes) {
                case "None":
                    formItem.formControlType = FormControlType.GroupItem;
                    formItem.valueType = formItem.itemBase.valueType;
                    break;
                case "PrimaryKey":
                case "ForeignKey":
                case "TableLinker":
                case "BusinessKey":
                    formItem.authority.hidden.system = true;
                    formItem = {
                        ...formItem,
                        isHide: true,
                        formControlType: FormControlType.System
                    };
                    break;
            }
        }
        formBody.push(formItem);
    });
    //关联控件属性\只读权限注入
    let externalList = formBody.filter(a => a.formControlType === FormControlType.External).map(a => a.id);
    externalList = getAllChildContainer(externalList, formBody);
    formBody
        .filter(a => externalList.includes(a.container))
        .forEach(a => {
            a.isExternal = true;
            a.authority.readOnly = { ...a.authority.readOnly, external: true };
        });
    //被托管控件属性注入
    let deleagetList = formBody.filter(a => a.proxy === true).map(a => a.id);
    formBody
        .filter(a => deleagetList.includes(a.container))
        .forEach(a => {
            a.delegate = true;
        });
    formBody = formBody.sort((a, b) => {
        if (a.order > b.order) return 1;
        else if (a.order < b.order) return -1;
        else return 0;
    });
    return formBody;
}

export function* loadFormPermission({ moduleId, effects, sourceType }) {
    let { data } = yield effects.call(GetPermission, { moduleId });
    let operationPermission = [], fieldsPermission = { show: [], hidden: [], edit: [], disabled: [] };
    if (data) {
        let allAu = [...data.employeeDataPermissionActionRequests, ...data.organziationDataPermissionActionRequests, ...data.roleDataPermissionActionRequests];
        for (let a of allAu) {
            let optItem = JSON.parse(a.operation),
                formItem = JSON.parse(a.formItem);
            if (optItem.rootId) {
                let existArr = optItem[optItem.rootId];
                if (existArr) {
                    // operationPermission.push(...existArr);
                    operationPermission.push(...existArr, ...(optItem.CheckCustomButton || {}));//加入自定义按钮权限
                }
            }
            if (Array.isArray(formItem.show)) {
                fieldsPermission.show.push(...formItem.show);
            }
            if (Array.isArray(formItem.hidden)) {
                fieldsPermission.hidden.push(...formItem.hidden);
            }
            if (Array.isArray(formItem.edit)) {
                fieldsPermission.edit.push(...formItem.edit);
            }
            if (Array.isArray(formItem.disabled)) {
                if (sourceType && sourceType === "preview") {
                    fieldsPermission.disabled.push(...formItem.show);
                } else {
                    fieldsPermission.disabled.push(...formItem.disabled);
                }
            }
        }
        operationPermission = Array.from(new Set(operationPermission));
        fieldsPermission.show = Array.from(new Set(fieldsPermission.show));
        fieldsPermission.hidden = Array.from(new Set(fieldsPermission.hidden));
        fieldsPermission.edit = Array.from(new Set(fieldsPermission.edit));
        fieldsPermission.disabled = Array.from(new Set(fieldsPermission.disabled));
    }
    return { operationPermission, fieldsPermission };
}

export function buildFormList(formsActionRequests) {
    return formsActionRequests.map(a => ({
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
}

export async function getBussinessComponentsList({ bussinessComSetting, query }) {
    let bussinessComponentsList = [];
    for (const component of bussinessComponents) {
        if (component.loadCheck instanceof Function) {
            let r = await component.loadCheck({ query });
            if (r === true)
                bussinessComponentsList.push(component.key);
        }
    }
    for (const key in bussinessComSetting) {
        if (!bussinessComponentsList.includes(key))
            bussinessComponentsList.push(key);
    }
    return bussinessComponentsList;
}

export class SubFormItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { showMsg: false };
    }

    showMsg = () => {
        if (this.props.validateStatus === "error")
            this.setState({ showMsg: true });
    };
    hideMsg = () => {
        this.setState({ showMsg: false });
    };

    shouldComponentUpdate(nextProps, nextState) {
        let oldItemBase = this.props.formBody.find(a => a.get("id") === this.props.id.replace("header", "")).get("itemBase");
        let newItemBase = nextProps.formBody.find(a => a.get("id") === nextProps.id.replace("header", "")).get("itemBase");
        if (Array.isArray(this.props.value)) {
            return oldItemBase !== newItemBase || this.props.editMode !== nextProps.editMode || this.props.help !== nextProps.help ||
                this.props.authority !== nextProps.authority ||
                JSON.stringify(this.props.value) === JSON.stringify(nextProps.value) || this.state.showMsg !== nextState.showMsg;
        }
        return oldItemBase !== newItemBase || this.props.editMode !== nextProps.editMode ||
            this.props.authority !== nextProps.authority ||
            this.props.value !== nextProps.value || this.props.help !== nextProps.help ||
            this.state.showMsg !== nextState.showMsg;
    }

    render() {
        let {
            id, extraProps, value, formBody, setTableLinkerValue, getTableLinkerValueList, authority,
            proxyIndex, help, validateStatus, textAlign, editMode = false, setValue, setValueSingle, onChangeAll
        } = this.props;
        // console.log('render subitemcell', value);
        let { style, ...extra } = (extraProps || {});
        let designProps = { setValue, setValueSingle };
        let item = formBody.find(a => a.get("id") === id.replace("header", "")).toJSON();
        if (item.formControlType !== FormControlType.GroupItem && item.formControlType !== FormControlType.None) {
            let { Component, formProperties, itemBase, renderStyle, ...other } = item;
            if (item.formControlType !== FormControlType.Group)
                itemBase = itemBase.set("value", parseFormValue(value, item.valueType)).set("help", help).set("validateStatus", validateStatus);
            else
                itemBase = itemBase.set("validateStatus", validateStatus);
            if (authority)
                other.authority = fromJS(authority);
            if (other.itemType === "TableLinkerName") {
                other.setTableLinkerValue = setTableLinkerValue.bind(null, other.container, proxyIndex);
                other.getTableLinkerValueList = getTableLinkerValueList.bind(null, id);
            }
            return <td className={styles.subItem} {...extra}
                style={{ ...style, ...tdStyle, ...(validateStatus === "error" && !editMode ? errTdStyle : {}) }}
                onMouseEnter={this.showMsg} onMouseLeave={this.hideMsg}>
                <Tooltip overlayClassName={styles.tip} mouseLeaveDelay={2} placement='bottom'
                    visible={this.state.showMsg && validateStatus === "error"}
                    title={<div onMouseEnter={this.hideMsg}>{help}</div>}>
                    <Component defaultValue={value} onChangeAll={onChangeAll} mode={editMode ? "table" : "cell"} {...other} renderStyle={RenderStyle.PC}
                        itemBase={itemBase} proxyIndex={proxyIndex} {...designProps} />
                </Tooltip>
            </td>;
        }
        else {
            let parent = formBody.find(a => a.get("id") === item.container).toJSON();
            switch (parent.formControlType) {
                case FormControlType.Group:
                    if (editMode) {
                        let { Component, formProperties, itemBase, renderStyle, ...other } = parent;
                        let groupItems = parent.itemBase.get("groupItems").toJS();
                        let colSpan = 0;
                        let index = 0;
                        Object.keys(groupItems).forEach((key, i) => {
                            if (groupItems[key].private !== true)
                                colSpan++;
                            if (groupItems[key].id === item.id)
                                index = i;
                        });
                        if (index == 0)
                            return <td className={styles.subItem} {...extra} style={{ ...style, ...tdStyle, textAlign }}
                                colSpan={colSpan}
                                onMouseEnter={this.showMsg} onMouseLeave={this.hideMsg}>
                                <Tooltip overlayClassName={styles.tip} placement='bottom'
                                    visible={this.state.showMsg && validateStatus === "error"}
                                    title={<div onMouseEnter={this.hideMsg}>{parent.itemBase.get("help")}</div>}>
                                    <Component defaultValue={value} onChangeAll={onChangeAll} mode='table' {...other} renderStyle={RenderStyle.PC}
                                        itemBase={itemBase} proxyIndex={proxyIndex} {...designProps} />
                                </Tooltip>

                            </td>;
                        else
                            return null;
                    }
                    else {
                        return <td className={styles.subItem} {...extra} style={{
                            ...style, ...tdStyle,
                            textAlign, ...(validateStatus === "error" ? errTdStyle : {})
                        }}
                            onMouseEnter={this.showMsg} onMouseLeave={this.hideMsg}>
                            <Tooltip overlayClassName={styles.tip} placement='bottom'
                                visible={this.state.showMsg && validateStatus === "error"}
                                title={<div onMouseEnter={this.hideMsg}>{parent.itemBase.get("help")}</div>}>
                                {value}
                            </Tooltip>
                        </td>;
                    }

                default:
                    return null;
            }
        }
    }
}

export const FormContext = React.createContext({
    getPanelBody: null,
    getPanelChild: null,
    renderCheck: null,
    setProxyCall: null,
    getProxyStorage: null,
    renderList: null
});
