import { defaultSettings } from "../defaultSettings";

const saveSetting = val => {
    localStorage.setItem("setting", JSON.stringify(val));
};
const getSetting = () => {
    return localStorage.getItem("setting") ? JSON.parse(localStorage.getItem("setting")) : defaultSettings;
};

function SetCookie(name, value) {
    document.cookie = name + "=" + escape(value) + ";path=/";
}

function GetCookie(objName) {
    var arrStr = document.cookie.split("; ");
    for (var i = 0; i < arrStr.length; i++) {
        var temp = arrStr[i].split("=");
        if (temp[0] == objName) return unescape(temp[1]);
    }
    return "";
}

function Guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function IsGuid(str) {
    var reg = new RegExp("[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}");
    if (typeof str !== "string") return false;
    if (str.match(reg) != null) {
        return true;
    }
    return false;
}

function ControlFormart(type) {
    var formart = null;
    switch (type) {
        case "none":
            break;
        case "Mobile":
            formart = "/^1[3,4,5,6,7,8,9]\\d{9}$/";
            break;
        case "IdCard":
            formart = "/^[1-9]\\d{7}((0\\d)|(1[0-2]))(([0|1|2]\\d)|3[0-1])\\d{3}$|^[1-9]\\d{5}[1-9]\\d{3}((0\\d)|(1[0-2]))(([0|1|2]\\d)|3[0-1])\\d{3}([0-9]|X)$/";
            break;
        case "PostalCode":
            formart = "/^[1-9][0-9]{5}$/";
            break;
        case "Email":
            formart = "/^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$/";
            break;
        default:
            break;
    }
    return formart;
}

function getChildCList(id, list) {
    let l = list.filter(a => a.get("container") === id);
    let t = this;
    let temp = [];
    l.forEach(function(a) {
        if (a.get("formControlType") > 0) {
            temp = temp.concat(t.getChildCList(a.get("id"), list));
        }
    });
    return l
        .toJSON()
        .map(a => a.toJSON())
        .concat(temp);
}

function getCList(container, list) {
    return list
        .filter(a => a.get("container") == container)
        .toJSON()
        .map(a => a.toJSON());
}

function formItemBase() {
    return {
        type: "", //控件类型
        typeName: "", //控件类型名称
        name: null, //表单项名称
        // desc: EditorState.createEmpty(),//描述
        desc: "", //convertToRaw(EditorState.createEmpty().getCurrentContent()),
        formartText: "none", //格式
        formartValue: null,
        required: false, //必填
        hidden: false, //true隐藏，false可见
        //hiddenType: 1,//1可见,2隐藏，8条件判断
        value: null, //表单项值
        text: null, //表单项文本
        disabled: false, //可编辑
        width: 0, //组件的宽度
        left: 0, //组件向左偏移量
        right: 0, //组件向右偏移量
        positionObj: {
            //用于 位置组件偏移量配置
            widValue: 0,
            alignValue: 0,
            leftValue: 0,
            rightValue: 0
        },
        // 新添加 是否是外表数据的 加入
        externalForm: {
            formId: {},
            formFieldName: {}
        },
        // 用于 子表单 组件 的 汇总
        subformFieldGatherType: "0", //"1"求和,"2"平均,"3"最大值,"4"最小值,"5"计数
        cusWidValue: 150, //自定义宽度
        cusFixedValue: "",
        customWidth: false, //是否是自定义宽度
        help: "", //验证信息
        validateStatus: ""
        // lineStyle: 'solid',//分割线样式
        // selectMode: 'solo',//选择模式
        // optionalRange: { type: 1, value: null },//可选范围：1自定义，2由部门字段确定，3数据联动
    };
}

function formContainerBase() {
    return {
        type: "",
        typeName: "",
        // 新添加 是否是外表数据的 加入
        externalForm: {
            formId: {},
            formFieldName: {}
        },
        name: null, //容器名称
        showTitle: true, //容器标题可见
        hidden: false, //容器可见
        //hiddenType: 1,//1可见,2隐藏，8条件判断
        collapse: true //容器折叠
    };
}

// 条件筛选
const configObj = {
    // "包含": {value: "0", condition: "{0} in('value')"},
    // "不包含": {value: "1", condition: "{0} not in ('value')"},
    包含: { value: "13", condition: "{0} like '%value%'", filter: (value, target) => target.includes(value) },
    不包含: {
        value: "14",
        condition: "({0} not like '%value%' or {0} is null)",
        filter: (value, target) => !target.includes(value)
    },
    为空: { value: "2", condition: "{0} is null", filter: (value, target) => target || "" === "" },
    不为空: { value: "3", condition: "{0} is not null", filter: (value, target) => target || "" !== "" },
    等于: { value: "4", condition: "{0}='value'", filter: (value, target) => target === value },
    不等于: { value: "5", condition: "({0}<>'value' or {0} is null)", filter: (value, target) => target !== value },
    等于任意一个: { value: "6", condition: "{0} in ('value')", filter: (value, target) => value.includes(target) },
    不等于任意一个: {
        value: "7",
        condition: "({0} not in ('value') or {0} is null)",
        filter: (value, target) => !target.includes(value)
    },
    大于: {
        value: "8", condition: "{0}>'value'",
        filter: (value, target) => {
            value = parseFloat(value);
            target = parseFloat(target);
            if (isNaN(value) && isNaN(target))
                return false;
            return target > value;
        }
    },
    大于等于: {
        value: "9", condition: "{0} >='value'",
        filter: (value, target) => {
            value = parseFloat(value);
            target = parseFloat(target);
            if (isNaN(value) && isNaN(target))
                return false;
            return target >= value;
        }
    },
    小于: {
        value: "10", condition: "{0}<'value'",
        filter: (value, target) => {
            value = parseFloat(value);
            target = parseFloat(target);
            if (isNaN(value) && isNaN(target))
                return false;
            return target < value;
        }
    },
    小于等于: {
        value: "11", condition: "{0}<='value'",
        filter: (value, target) => {
            value = parseFloat(value);
            target = parseFloat(target);
            if (isNaN(value) && isNaN(target))
                return false;
            return target <= value;
        }
    },
    选择范围: { value: "12", condition: "({0} between 'value1' and 'value2')" },
    任意一个等于: { value: "13", condition: "'value' in {0}", filter: (value, target) => target.includes(value) },
    任意一个不等于: { value: "13", condition: "'value' in {0}", filter: (value, target) => !target.includes(value) }
    // "属于": {value: "13", condition: "{0} like '%value%'"},
    // "不属于": {value: "14", condition: "{0} not like '%value%'"},
};
//今天：1 ，昨天：2， 本周：3 ， 上周：4 ，本月： 5， 上月：6
const dateExtendedType = ["1", "2", "3", "4", "5", "6"];
const dealConfigArr = Object.keys(configObj).reduce((prev, next) => {
    prev.push(configObj[next]);
    return prev;
}, []);
const filterArr = {
    string: ["包含", "不包含", "为空", "不为空", "等于", "不等于", "等于任意一个", "不等于任意一个"],
    number: ["大于", "大于等于", "为空", "不为空", "等于", "不等于", "选择范围", "小于", "小于等于"],
    date: ["等于", "不等于", "大于等于", "小于等于", "选择范围", "为空", "不为空"],
    datetime: ["等于", "不等于", "大于等于", "小于等于", "选择范围", "为空", "不为空"],
    array: ["等于任意一个", "不等于任意一个", "为空", "不为空", "任意一个等于"],
    select: ["等于", "不等于", "等于任意一个", "不等于任意一个", "为空", "不为空"],
    location: ["包含", "不包含", "为空", "不为空"],
    attachment: ["为空", "不为空"],
    boolean: ["为空", "不为空"],
    member: ["等于", "不等于", "等于任意一个", "不等于任意一个", "为空", "不为空"],
    department: ["等于", "不等于", "等于任意一个", "不等于任意一个", "为空", "不为空"],
    textSwitch: ["等于", "不等于"]
    // member: ["等于", "包含"],
    // department: ["等于", "包含"],
};
const optionObj = Object.keys(filterArr).reduce((prev, next) => {
    prev[next] = filterArr[next].reduce((p, n) => {
        p.push({ name: n, ...configObj[n] });
        return p;
    }, []);
    return prev;
}, {});
const targetTypeList = [{ key: "value", name: "自定义" }, { key: "formItem", name: "当前表单字段" }, {
    key: "environment",
    name: "环境变量"
}];

//生成从minNum到maxNum的随机数
function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
}

const searchLimit = [
    { value: "0", key: "所有" },
    { value: "1", key: "任一" }
];

const freezeTypeArr = [
    { value: "1", key: "左" },
    { value: "0", key: "无" },
    { value: "2", key: "右" }
];

const proList = [
    { name: "全部流程", type: null /*-1 */ },
    { name: "运行中", type: 2 },
    { name: "驳回到开始", type: 1 },
    { name: "未提交", type: 0 },
    { name: "结束", type: 3 },
    { name: "未找到审批人", type: 4 }
    //{ name: "撤销(删除)", type: 5 }
];
const unique = (arr, u_key) => {
    let map = new Map();
    arr.forEach((item, index) => {
        if (!map.has(item[u_key])) {
            map.set(item[u_key], item);
        }
    });
    return [...map.values()];
};
const parseBoolean = value => {
    let checked = false;
    if (value === "true" || value === "false") {
        checked = JSON.parse(`${value}`);
    }
    if (value === true || value === false) {
        checked = value;
    }
    if (value === "0" || value === 0) {
        checked = false;
    }
    if (value === "1" || value === 1) {
        checked = true;
    }
    return checked;
};

//构建关系树形结构
function submitTree(submitData, formList, formInstanceId, WorkFlowStatus, WorkFlowId) {
    let list = {};
    let main = formList.find(v => v.formType === 0);
    let sub = formList.filter(v => v.formType === 1);
    let mainFields = submitData.filter(v => v.formType === 0);
    let mainList = { FormInstanceId: formInstanceId, WorkFlowStatus: WorkFlowStatus, WorkFlowId: WorkFlowId };
    mainFields.forEach(x => {
        if (x.value instanceof Array) {
            mainList[x.code] = x.value[0] === undefined ? "" : x.value[0];
        } else mainList[x.code] = x.value;
    });
    if (sub.length > 0) mainList.children = [];
    list[main.code] = [mainList];
    let children = buildChildData(formInstanceId, formList, submitData);
    if (children.length > 0) list[main.code][0].children = children;
    return list;
}

function buildChildData(tableLinkerValue, formList, submitData) {
    let children = [];
    // let tableLinkerData = submitData.filter(a => a.tableLinkerValue === tableLinkerValue);
    let tableLinkerData = submitData.filter(a => a.formInstanceId === tableLinkerValue);
    // let childFormList = Array.from(new Set(tableLinkerData.map(a => a.formId)))
    let childFormList = Array.from(new Set(tableLinkerData.map(a => a.formId))).filter(b => {
        return b !== formList.filter(c => c.formType === 0)[0].id;//筛选只含关系表的数据id
    });
    childFormList.forEach(c => {
        let childFormCode = formList.find(a => a.id === c).code;
        let childFormData = { [childFormCode]: [] };
        let childFormDataList = tableLinkerData.filter(a => a.formId === c);
        let primaryKeyValueList = Array.from(new Set(childFormDataList.map(a => a.primaryKeyValue)));
        primaryKeyValueList.forEach(p => {
            let rowData = {};
            let childRowData = childFormDataList.filter(a => a.primaryKeyValue === p);
            childRowData.forEach(b => {
                if (b.value instanceof Array) {
                    rowData[b.code] = b.value[0] === undefined ? "" : b.value[0];
                } else rowData[b.code] = b.value;
            });
            if (childRowData.length > 0) {
                let subChildList = buildChildData(childRowData[0].primaryKeyValue, formList, submitData);
                if (subChildList.length > 0) rowData.children = subChildList;
            }
            childFormData[childFormCode].push(rowData);
        });
        children.push(childFormData);
    });
    return children;
}

module.exports = {
    SetCookie,
    GetCookie,
    Guid,
    IsGuid,
    targetTypeList,
    ControlFormart,
    getChildCList,
    getCList,
    formItemBase,
    formContainerBase,
    saveSetting,
    getSetting,
    optionObj,
    configObj,
    dealConfigArr,
    randomNum,
    searchLimit,
    freezeTypeArr,
    proList,
    dateExtendedType,
    unique,
    parseBoolean,
    submitTree
};
