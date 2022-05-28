import Validator from "async-validator";
import FormControlType from '../../enums/FormControlType';
import { checkUnique } from "../../services/Validate/validate";
import { getFormulaValue } from "./DataLinker/DataLinker";

function mess(type, ...another) {
    let message = "", min = "", max = "";
    // console.log(another);
    if (another.length) {
        min = another[0].min;
        max = another[0].max;
    }
    switch (type) {
        case "notEmpty":
            message = "不能为空"
            break;
        case "Mobile":
            message = "请输入正确的手机号码"
            break;
        case "IdCard":
            message = "请输入正确的身份证号码"
            break;
        case "PostalCode":
            message = "请输入正确的邮政编码"
            break;
        case "Email":
            message = "请输入正确的邮箱"
            break;
        case "Integer":
            message = "请输入正确的整数"
            break;
        case "range":
            message = "范围不对";
            if ((min || min == 0) && max === "") {
                message = `请输入大于等于${min}的数`;
            }
            if (min === "" && (max || max == 0)) {
                message = `请输入小于等于${max}的数`;
            }
            if ((min || min == 0) && (max || max == 0)) {
                message = `请输入${min}~${max}之间的数`;
            }
            break;
    }
    return message;
}
// 递归获取数据关联的id数组
export function getRelationId(id, data = {}) {
    let tempArr = [];
    if (data[id]) {
        data[id].forEach(v => {
            tempArr.push(v);
            tempArr = tempArr.concat(getRelationId(v, data));
        });
    }
    // 去重
    let tempObj = {};
    let resultArr = [];
    tempArr.forEach(v => {
        if (!tempObj[v]) {
            resultArr.push(v);
            tempObj[v] = 1;
        }
    });
    return tempArr;
}

/**
 * 校验过程的 联动数据的校验
 * @param {*} dataLinker
 * @param {*} id
 * @param {*} needValidate 满足条件才校验
 * @param {*} dataBody
 */
// export function ValidateFormNew(item, action) {
//     return ValidateMainNew(item, action);
// }
// 新的 校验逻辑
// export function ValidateMain(item, action) {
//     let { readOnly } = item;
//     let { id, data: { value } } = action;
//     let rules = {};
//     rules[id] = [];
//     const regNuber = /^-?\d+$/;
//     if (!readOnly) {
//         // 这里是rules
//         if (item["required"]) {
//             rules[id].push({ required: item.type === "Number" ? false : true, message: mess("notEmpty") });
//         }
//         if (item["formartValue"]) {
//             rules[id].push({ pattern: eval(item["formartValue"]), message: mess(item["formartText"]) });
//         }
//         if (item.hasOwnProperty("decimal") && !item["decimal"]) {
//             rules[id].push({ pattern: regNuber, message: mess("Integer") });
//         }
//         if (item.range) {
//             rules[id].push({ type: "number", min: parseFloat(item.min) || (parseFloat(item.min) == 0 ? 0 : ""), max: parseFloat(item.max) || (parseFloat(item.max) == 0 ? 0 : ""), message: mess("range", { min: parseFloat(item.min) || (parseFloat(item.min) === 0 ? 0 : ""), max: parseFloat(item.max) || (parseFloat(item.max) === 0 ? 0 : "") }) });
//         }
//     }
//     let validator = new Validator(rules);
//     return new Promise((resolve, reject) => {
//         if (!action.data.hasOwnProperty("value")) {
//             reject("value is undefined");
//             return;
//         }
//         console.log("rules", rules);
//         if (rules[id].length == 0) {
//             resolve({ help: "", validateStatus: "", id });
//             return;
//         }
//         validator.validate({ [id]: value }, rules, (err, fileds) => {
//             if (err) {
//                 if (value === null) {
//                     resolve({ help: "", validateStatus: "", id });
//                 } else {
//                     resolve({ help: err[0]["message"], validateStatus: "error", id })
//                 }
//                 return;
//             }
//             resolve({ help: "", validateStatus: "", id });
//         });
//     });
// }
export function ValidateFormNew(item) {
    let { readOnly, id, value, formId, proxyIndex, formDataModel, getRelationsItems } = item;
    let rules = {};
    rules[id] = [];
    const regNuber = /^-?\d+$/;
    if (!readOnly) {
        // 这里是rules
        if (item["required"]) {
            rules[id].push({ required: true, message: mess("notEmpty") });
        }
        if (item["formartValue"]) {
            rules[id].push({ pattern: eval(item["formartValue"]), message: mess(item["formartText"]) });
        }
        if (item.hasOwnProperty("decimal") && !item["decimal"]) {
            rules[id].push({ pattern: regNuber, message: mess("Integer") });
        }
        if (item.range) {
            rules[id].push({ type: "number", min: parseFloat(item.min) || (parseFloat(item.min) == 0 ? 0 : ""), max: parseFloat(item.max) || (parseFloat(item.max) == 0 ? 0 : ""), message: mess("range", { min: parseFloat(item.min) || (parseFloat(item.min) === 0 ? 0 : ""), max: parseFloat(item.max) || (parseFloat(item.max) === 0 ? 0 : "") }) });
        }
        if (item.unique) {
            rules[id].push({
                type: "string",
                asyncValidator: (rule, value) => {
                    if (proxyIndex > -1) {
                        //let formDataModel = getFormDataModel();
                        let otherValueList = [];
                        formDataModel.find(a => a.formId === formId).values.forEach((a, i) => {
                            if (i !== proxyIndex) {
                                let exist = a.list.find(b => b.id === id);
                                if (exist && exist.value != null) {
                                    otherValueList.push(exist.value)
                                }
                            }
                        });
                        if (Array.isArray(otherValueList) && otherValueList.includes(value)) {
                            return Promise.reject('当前值已存在！');
                        }
                    }
                    return checkUnique({
                        table: item.table,//"6/+MX9F9PnKzKgYNYc8ovi67xGXt1FonW8GxVlQJjQU=",
                        column: item.code,//"G24Fo2PQLOpTzSg4aa+at3aZ78H0UQ4lrpoRWUi+MBU=",
                        value
                    }).then(res => {
                        if (res.data === true)
                            return Promise.reject('当前值已存在！');
                        return Promise.resolve();
                    });
                }
            })
        }
        if (item.validateCustom) {
            rules[id].push({
                type: "boolean",
                asyncValidator: (rule, value) => {
                    return new Promise(function (resolve, reject) {
                        let fItems = []
                        item.validateCustom.formula.split('\u2800').forEach((e, i) => {
                            if (i % 2 == 1 && !fItems.includes(e))
                                fItems.push(e);
                        });
                        let val = getFormulaValue('boolean', formId, proxyIndex, item.validateCustom.formula, getRelationsItems(fItems), formDataModel, []);
                        let it = setInterval(() => {
                            let next = val.next();
                            if (next.done === true) {
                                clearInterval(it);
                                if (next.value === true)
                                    resolve();
                                else
                                    reject(item.validateCustom.msg || '校验失败！');
                            }
                        }, 200);
                    });
                },
            })
        }
    }
    let validator = new Validator(rules);
    return new Promise((resolve, reject) => {
        if (!item.hasOwnProperty("value")) {
            reject("value is undefined");
            return;
        }
        //console.log("rules", rules);
        if (rules[id].length === 0) {
            resolve({ help: "", validateStatus: "" });
            return;
        }
        validator.validate({ [id]: value }, rules, (err, fileds) => {
            if (err) {
                // if (value === null) {
                //     resolve({ help: "", validateStatus: "" });
                // } else {
                resolve({ help: err[0]["message"], validateStatus: "error" })
                //}
            }
            else
                resolve({ help: "", validateStatus: "" });
        });
    });
}

export function initValidateRelations(items) {
    //[{id:'',relations:[]}]
    let validateRelations = {};
    items.forEach(item => {
        Array.isArray(item.relations) && item.relations.forEach(r => {
            if (!Array.isArray(validateRelations[r]))
                validateRelations[r] = [];
            if (!validateRelations[r].includes(item.id))
                validateRelations[r].push(item.id);
        });
    });
    return validateRelations;
}
