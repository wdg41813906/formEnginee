import Formulas from "../../Hint/Formulas";
import { getExternalData } from "../../../services/DataLinker/DataLinker";
import _ from "underscore";
import FORM_TYPE from "../../../enums/FormType";

export const LINKTYPE = Object.freeze({
    //这些类型的联动关系不能并存
    DefaultValue: 0,//默认值
    Formula: 1,//公式计算
    Linker: 2,//数据联动
    External: 3,//外部引用
    Request: 4,//数据请求
    Resource: 5,//其他资源


    //以下联动关系独立存在
    Environment: 6,//环境变量
    Clearn: 7,//自动清除
    Display: 8,//显示
    Custom: 9//自定义
});

//关联条件的valuType可用映射图
const valueLinkMap = [{
    source: "string",
    target: ["string", "number", "datetime", "array"]
}, {
    source: "number",
    target: ["number"]
}, {
    source: "datetime",
    target: ["number", "datetime"]
},
    {
        source: "array",
        target: ["string", "number", "datetime", "array"]
    },
    {
        source: "boolean",
        target: ["boolean"]
    }
];
//关联条件可用的映射
const valueConditionMap = [{
    source: "string",
    target: ["string", "number", "datetime"]
}, {
    source: "number",
    target: ["number"]
}, {
    source: "datetime",
    target: ["number", "datetime"]
},
    {
        source: "array",
        target: ["array"]
    }];
const valueTypeConditionMap = [{
    source: "string",
    conditions: ["equal", "contains", "notEqual", "notContains"]
}, {
    source: "number",
    conditions: ["equal", "greaterThan", "lessThan", "greaterThanEqual", "lessThanEqual", "notEqual"]
}, {
    source: "dateTime",
    conditions: ["equal", "greaterThan", "lessThan", "greaterThanEqual", "lessThanEqual", "notEqual", "between"]
}, {
    source: "array",
    conditions: ["contains", "notContains"]
}];
const conditionMap = [{
    key: "equal",
    name: "等于"
}, {
    key: "notEqual",
    name: "不等于"
}, {
    key: "contains",
    name: "包含"
}, {
    key: "notContains",
    name: "不包含"
}, {
    key: "greaterThan",
    name: "大于"
}, {
    key: "greaterThanEqual",
    name: "大于等于"
}, {
    key: "lessThan",
    name: "小于"
}, {
    key: "lessThanEqual",
    name: "小于等于"
}, {
    key: "between",
    name: "范围"
}];

export function getValueConditionMap(valueType) {
    let exist = valueConditionMap.find(a => a.source === valueType);
    if (exist)
        return exist.target;
    else
        return [valueType];
}

export function getValueTypeConditionMap(valueType) {
    let exist = valueTypeConditionMap.find(a => a.source === valueType);
    if (exist)
        return conditionMap.filter(a => exist.conditions.includes(a.key));
    else
        return [{
            key: "equal",
            name: "等于"
        }, {
            key: "notEqual",
            name: "不等于"
        }];
}

export function getValueLinkMap(valueType) {
    let exist = valueLinkMap.find(a => a.source === valueType);
    if (exist)
        return exist.target;
    else
        return [valueType];
}

//初始化表单项数据关联
export function initDataLinker(itemList) {
    let externalList = itemList.filter(a => a.getIn(["itemBase", "externalId"])).map(a => ({
        id: a.get("id"),
        externalId: a.getIn(["itemBase", "externalId"]),
        container: a.get("container")
    }));
    let formItems = itemList.filter(a => a.has("dataLinker") && a.get("dataLinker").size > 0);
    let relationList = {};
    formItems.forEach(function(item) {
        let id = item.get("id");
        item.get("dataLinker").forEach((linker) => {
            switch (linker.get("linkType")) {
                case LINKTYPE.External:
                    linker.get("expression").forEach(ex => {
                        ex.get("display").forEach(d => {
                            d.get("list").forEach(l => {
                                let r = externalList.find(a => a.externalId === l.get("id"));
                                if (r) {
                                    let exist = formItems.filter(a => a.get("dataLinker").filter(b => b.has("relations") && b.get("relations").includes(r.id)));
                                    if (exist.size > 0) {
                                        let rParent = itemList.find(a => a.get("id") === r.container);
                                        while (rParent.get("delegate") === true) {
                                            rParent = itemList.find(a => a.get("id") === rParent.get("container"));
                                        }
                                        if (!(relationList[rParent.get("id")] instanceof Array)) {
                                            relationList[rParent.get("id")] = [];
                                        }
                                        if (!relationList[rParent.get("id")].includes(r.id))
                                            relationList[rParent.get("id")].push(r.id);
                                    }
                                }
                            });
                        });
                    });
                case LINKTYPE.Linker:
                case LINKTYPE.Display:
                case LINKTYPE.Formula:
                case LINKTYPE.Request:
                    linker.get("relations").forEach(function(l, i) {
                        if (!Array.isArray(relationList[l])) {
                            relationList[l] = [];
                        }
                        relationList[l].push(id);
                    });
                    break;
                case LINKTYPE.Clearn:
                case LINKTYPE.Resource:
                    linker.get("relations").forEach(function(l, i) {
                        if (!Array.isArray(relationList[id])) {
                            relationList[id] = [];
                        }
                        relationList[id].push(l);
                    });
                    break;
                case LINKTYPE.Custom:
                    break;
                case LINKTYPE.DefaultValue:
                    break;
            }
        });
    });
    let { dataLinker, valid } = dataLinkerCheck(relationList);
    let validList = itemList.filter(a => valid.includes(a.get("id"))).map(a => ({
        id: a.get("id"),
        name: a.getIn(["itemBase", "name"])
    })).toJS();
    return { dataLinker, valid: validList };
}

function getInValidLinker(id, dataLinker) {
    let list = [];
    if (Array.isArray(dataLinker[id])) {
        dataLinker[id].forEach(l => {
            list = getInvalid(id, l, dataLinker);
        });
    }
    return list;
}

function getInvalid(id, linkerId, dataLinker) {
    let list = [];
    if (Array.isArray(dataLinker[linkerId])) {
        if (dataLinker[linkerId].includes(id))
            list.push(linkerId);
        dataLinker[linkerId].filter(a => a !== id).forEach(a => {
            list = list.concat(getInvalid(id, a, dataLinker));
        });
    }
    return Array.from(new Set(list));
}

//dataLinkerRelation合法性检测
function dataLinkerCheck(dataLinkerRelations) {
    let valid = [];
    for (let key in dataLinkerRelations) {
        valid = valid.concat(getInValidLinker(key, dataLinkerRelations));
    }
    for (let id of valid) {
        dataLinkerRelations[id] = dataLinkerRelations[id].filter(a => !valid.includes(a));
    }
    return { dataLinker: dataLinkerRelations, valid };
}

//获取某个表单项的值
function getLinkItemValue(valueType, triggerFormId, proxyIndex, item, formDataModel) {
    let value = null;
    let formData = formDataModel.find(a => a.formId === item.formId);
    switch (formData.formType) {
        //如果是主表字段，直接获取返回
        case FORM_TYPE.mainForm:
            value = formData.values.find(a => a.id === item.id).value;
            break;
        //如果是子表字段，如果和触发源不是同一个form，则返回该字段值集合，否则返回对应proxyIndex的值
        case FORM_TYPE.subForm:
            if (item.formId !== triggerFormId) {
                value = [];
                formData.values.forEach(a => {
                    value.push(a.list.find(b => b.id === item.id).value);
                });
            }
            else {
                value = formData.values[proxyIndex].list.find(a => a.id === item.id).value;
            }
            break;
    }
    if (value === null || value === undefined)
        switch (valueType) {
            default:
            case "string":
                value = "";
                break;
            case "number":
                value = null;
                break;
            case "bool":
                value = false;
                break;
            case "array":
                value = [];
                break;
            case "datetime":
                value = null;
                break;
        }
    return value;
}

//获取公式计算值
export function* getFormulaValue(valueType, formId, proxyIndex, formula, relationsItems, formDataModel, foreignData) {
    let relationValues = {};
    let f = (formula === null || formula === undefined) ? "" : formula.toString();
    let fItems = [];
    f.split("\u2800").forEach((e, i) => {
        if (i % 2 == 1 && fItems.indexOf(e) < 0)
            fItems.push(e);
    });
    relationsItems.forEach(function(item, index) {
        let id = item.id;
        fItems.filter(a => a.includes(id)).forEach(() => {
            try {
                relationValues[`param${index}`] = getLinkItemValue(valueType, formId, proxyIndex, item, formDataModel);
            }
            catch (e) {
                relationValues[`param${index}`] = "";
            }
            f = f.replace(new RegExp(`\u2800${id}\u2800`, "gm"), `param${index}`);
        });
    });
    try {
        let val = yield* Formulas.formulaVal(valueType, f, relationValues, foreignData);
        switch (valueType) {
            case "number":
                if (val === null)
                    return val;
                if (typeof val === "string" && val.trim() === "")
                    return null;
                let n = new Number(val);
                return isNaN(n) ? null : n.valueOf();
            case "string":
                return val === undefined || val === null ? null : val.toString();
            case "datetime":
                if (val === null || val === undefined)
                    return null;
                let date = new Date(val);
                if (date instanceof Date && !isNaN(date.getTime()))
                    return date;
                else
                    return null;
            default:
                return val;
        }
    }
    catch (e) {
        // debugger
        // console.log(e);
        return "formula error!";
    }
}

//获取联动表单值
export function* getExternalValue(call, { type, source, primaryKey, fields, conditions, pageInfo }) {
    let postData = {
        AssociatedTpye: type,//'data',
        ViewName: source,//'UTb201811191458171181457707_view',
        GroupByField: primaryKey,//'fld201811191458291950283617',
        Fields: fields,//['fld20181119145829308637650','fld20181119145829953997031','fld201811191458292082353351'],
        Conditions: conditions,//[{Field:'fld20181119145829308637650',Value:'0002'}],
        PageRequest: pageInfo//{PageIndex:1,PageSize:3}
    };
    const { data } = yield call(getExternalData, postData);
    if (data.error) {
        return { Error: data.error };
    }
    return data;
}

//对用户输入的公式进行修正，只保留数字、运算符、函数关键字 目前会把字符串一起屏蔽掉，需要修正
export function funcFix(fun) {
    let keys = Formulas.formulaKeywords.toString().replace(/\,/g, "|");
    let retainKeywords = Formulas.retainKeywords.toString().replace(/\,/g, "|");
    let mark = "\u2800";
    let list = fun.split(mark);
    let rex = new RegExp(`[^(${keys}|${retainKeywords}|\%|\,|\\-*|\'d\'*|\h*|\:|\'\S*\'|\"\S*\"|\'\u4e00-\u9fa5\'|\(\)|\\[\\]|\=|\!|\.|\+|\-|\*|\>|\<|\/|(a-z)|\#|\¥|\（|\）|\$|(0-9)|\\s*)]`, "g");
    let rex2 = new RegExp("[^(\-|(0-9)|(a-z)|(A-Z))|'|\,|\(|\))*]", "g");
    let final = "";
    let len = list.length;
    list.forEach(function(e, i) {
        let r;
        console.log(i);
        if (i % 2 === 0)
            r = rex;
        else
            r = rex2;
        final += e.replace(r, "");
        if (i < len - 1)
            final += mark;
    });
    //debugger
    return final;
}

//筛选出公式中所有的关联表单项id
export function getRelations(expression, isForeign) {
    let relations = [], sp = "\u2800";
    if (expression.indexOf(sp) > -1) {
        let list = expression.split(sp);
        list.map(function(item, index) {
            if (index % 2 == 1 && relations.indexOf(item) == -1) {
                if (isForeign && item.indexOf("foreign") > -1) {
                    relations.push(item.replace("foreign", ""));
                }
                if (!isForeign && item.indexOf("foreign") <= -1) {
                    relations.push(item);
                }
            }
        });
    }
    ;
    return relations;
}

//初始化数据联动项
export function initLinker(linkType, param = null, dataLinker = []) {
    let linker = { linkType };
    switch (linkType) {
        case LINKTYPE.Formula:
        case LINKTYPE.Display:
            if (param == null)
                linker = {
                    ...linker,
                    foreignData: [],
                    foreignRelations: [],
                    relations: [],
                    expression: null,
                    relationTables: []
                };
            else {
                let fixExpression = funcFix(param);
                let { foreignData, relationTables } = dataLinker.find(a => a.linkType === linkType) || {
                    foreignData: [],
                    relationTables: []
                };
                linker = {
                    ...linker, expression: fixExpression, foreignData: foreignData,
                    foreignRelations: getRelations(fixExpression, true), relations: getRelations(fixExpression, false),
                    relationTables
                };
            }
            break;
        case LINKTYPE.External:
        case LINKTYPE.Linker:
            linker = {
                ...linker,
                foreignKeys: [],
                expression: [],
                autoFill: param === true,
                relations: [],
                relationTables: []
            };
            break;
        case LINKTYPE.Custom:
            break;
        case LINKTYPE.Request:
        case LINKTYPE.Resource:
            linker = {
                ...linker,
                request: {
                    // url: '',
                    // method: '',
                    // rule: '',
                    id: "",
                    params: [
                        // {
                        //     id: '',
                        //     name: '',
                        //     type: '',//默认类型有值,但也可以修改 动态类型,取表单项对应targetId的值  当前用户信息,从localStorage里面的auth获取 比如姓名,所在部门,所属职责
                        //     //requestType: '',
                        //     targetId: '',//动态参数时, 需要在表单项取值的ID
                        //     targetType: 0,//0取表单项上的值  1去当前用户相关配置
                        //     value: '',
                        // }
                    ]
                },
                bindMap: [
                    // {
                    //     targetId: '',//要绑定的表单项id
                    //     requestAttr: '',//抽取的JSON对象数组对应的属性值
                    //     controlType: '',
                    // }
                ],
                extraBindMap: [
                    // {
                    //     targetId:'node',
                    //     requestAttr:'',
                    // }
                ],
                conditions: [],//关联条件
                relations: [],//关联条件内包含的控件id
                relationTables: [],
                realtionResouces: [],
                exportData: "",//模板数据
                primaryKey: "",
                autoFill: param === true
            };
            break;
        case LINKTYPE.Environment:
            linker = { ...linker, relations: [], environmentValue: param, initial: dataLinker === true };
            break;
        case LINKTYPE.Clearn:
            linker = { ...linker, triggerId: param, relations: Array.isArray(dataLinker) ? dataLinker : [] };
            break;
        case LINKTYPE.DefaultValue:
        default:
            linker = { ...linker, linkValue: param, useFormula: dataLinker === true, relations: [] };
            break;
    }
    return linker;
}

//根据条件获取linker
export function getLinker(dataLinker, lambda, linkType = LINKTYPE.DefaultValue) {
    try {
        let exist = dataLinker.filter(lambda);
        if (exist.length > 0) {
            return exist[0];
        }
        else {
            return initLinker(linkType);
        }
    }
    catch (e) {
        return initLinker(linkType);
    }
}

//获取所有子级联动关系，并按照触发顺序重排
export function getLinkRelations(ids, dataLinker) {
    let rel = [];
    ids.forEach(id => {
        if (dataLinker[id]) {
            let list = dataLinker[id];
            let newAdd = list.filter(a => !rel.includes(a));
            let refresh = list.filter(a => rel.includes(a));
            refresh.forEach(r => {
                let index = rel.indexOf(r);
                rel.splice(index, 1);
            });
            rel = rel.concat(list);
            rel = rel.concat(getLinkRelations(newAdd, dataLinker));
        }
    });
    return rel;
}

//获取所有的关系
export function getAllRelations(ids, dataLinker) {
    let rel = [];
    let list;
    if (!(ids instanceof Array)) {
        list = [ids];
    }
    else {
        list = ids;
    }
    list.forEach(id => {
        if (dataLinker.hasOwnProperty(id))
            rel = rel.concat(dataLinker[id].filter(a => !rel.includes(a)));
        rel.forEach(e => {
            let childRel = getAllRelations(e, dataLinker).filter(a => !rel.includes(a));
            rel = rel.concat(childRel.filter(a => !rel.includes(a)));
        });
    });
    return rel;
}
