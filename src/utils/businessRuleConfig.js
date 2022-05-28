import _ from 'underscore';
const triggerData = [
    { key: "add", value: 1, name: "新增数据", desc: "在触发表单中填报新的数据", action: '新增的数据满足以下条件，触发执行动作', select: false },
    { key: "modify", value: 2, name: "修改数据", desc: "在触发表单中修改已有数据，如流程状态等", action: '修改后的数据满足以下条件，触发执行动作', select: false },
    { key: "delete", value: 0, name: "删除数据", desc: "在触发表单中删除某条数据，不包含批量删除", action: '删除的数据满足以下条件，触发执行动作', select: false },
]
const execActionData =
    [
        { key: "add", value: 1, name: "新增数据", desc: "在目标表单中新增数据", action: '新增的数据满足以下条件，触发执行动作', select: false },
        { key: "modify", value: 2, name: "修改已有数据", desc: "在目标表单中查找某些数据并修改", action: '修改后的数据满足以下条件，触发执行动作', select: false },
        { key: "delete", value: 0, name: "删除已有数据", desc: "在目标表单中查找某些数据并删除", action: '删除的数据满足以下条件，触发执行动作', select: false },
        { key: "modifyOrAdd", value: 3, name: "修改或新增数据", desc: "查找某些数据进行修改，若找不到则新增", action: '删除的数据满足以下条件，触发执行动作', select: false },
    ]

const filterModes = [
    { key: 'expression', value: 0, text: '触发表单字段值', show: true },
    { key: 'custom', value: 1, text: '自定义', show: true },
    { key: 'none', value: 2, text: '空值', show: true },
    { key: 'primaryKey', value: 3, text: '主键', show: false }]

const getLinkFormList = () => {
    try {
        let formList = window.localStorage.getItem('formList')
        let json = JSON.parse(formList);
        return json.linkFormList
    }
    catch (ex){
        return []
    }
}
const getTemplate = (templateId) => {
    var linkFormList = getLinkFormList()
    var formtemplate = _.where(linkFormList, { formTemplateId: templateId })[0];

    return formtemplate;
}
const fieldSelectMode = {
    condition: 'condition',
    map: 'map'
}

const controlTypes = {
    'Annex': "Annex",
    'SerialNumber': "SerialNumber",
    'TextSwitch': "TextSwitch",
    'Number': "Number",
    'MutiText': "MutiText",
    'SingleText': "SingleText",
    'DateTime': "DateTime",
    'SingleRadio': "SingleRadio",
    'CheckBoxes': "CheckBoxes",
    'SingleDropDownList': "SingleDropDownList",
    'MutiDropDownList': "MutiDropDownList",
    'Cascader': "Cascader",
    'Department': 'Department',
    'Member': 'Member',
    'TreeSelectCom': 'TreeSelectCom'
}
const controlGroups = ['SingleRadio', 'CheckBoxes', 'SingleDropDownList', 'MutiDropDownList', 'Cascader', 'Department', 'Member', 'TreeSelectCom']
const controlGroupsCondition = ['SingleRadio', 'CheckBoxes', 'SingleDropDownList', 'MutiDropDownList', 'Department', 'Member', 'TreeSelectCom']
const controlTypeCondition = {
    'Annex': ['Annex'],
    "SerialNumber": ['SerialNumber'],
    'TextSwitch': ['TextSwitch'],
    'Number': ['Number'],
    'MutiText': ['MutiText', 'SingleText'],
    'SingleText': ['SingleText', 'MutiText','SingleRadio','SingleDropDownList'],
    'DateTime': ['DateTime'],
    'SingleRadio': ['SingleRadio','SingleText'],
    'CheckBoxes': ['CheckBoxes'],
    'SingleDropDownList': ['SingleDropDownList','SingleText'],
    'MutiDropDownList': ['MutiDropDownList'],
    'Cascader': ['Cascader'],
    'Department': ['Department'],
    'Member': ['Member'],
    'TreeSelectCom': ['TreeSelectCom']
}

const controlTypeMap = {
    'Annex': ['Annex'],
    "SerialNumber": ['SerialNumber'],
    'TextSwitch': ['TextSwitch'],
    'Number': ['Number'],
    'MutiText': ['MutiText', 'SingleText'],
    'SingleText': ['SingleText', 'MutiText'],
    'DateTime': ['DateTime'],
    'SingleRadio': ['SingleRadio'],
    'CheckBoxes': ['CheckBoxes'],
    'SingleDropDownList': ['SingleDropDownList'],
    'MutiDropDownList': ['MutiDropDownList'],
    'Cascader': ['Cascader'],
    'Department': ['Department'],
    'Member': ['Member'],
    'TreeSelectCom': ['TreeSelectCom']
}
const getControlTypeCondition = (controlType) => {
    var result = controlTypeCondition[controlType];
    if (!result) { return [] }
    return result;

}
const getControlTypeMap = (controlType) => {
    var result = controlTypeMap[controlType];
    if (!result) { return [] }
    return result;

}

const parseControlType=(formControlType)=>{
    var dbTypeString = "string";
    switch (formControlType)
    {
        case controlTypes.TextSwitch:
                dbTypeString = "textSwitch";
                break;
        case controlTypes.SingleText:
        case controlTypes.SerialNumber:
        case controlTypes.MutiText:
        case controlTypes.MutiDropDownList:
            dbTypeString = "string";
            break;
        case controlTypes.Number:
            dbTypeString = "number";
            break;
        case controlTypes.DateTime:
            dbTypeString = "date";
            break;
        // case controlTypes.SingleRadio:
        // case controlTypes.CheckBoxes:
      
        //     dbTypeString = "select";
        //     break;
        case controlTypes.Location:
            dbTypeString = "location";
            break;
        case controlTypes.Annex:
        case controlTypes.Picture:
            dbTypeString = "attachment";
            break;
        case controlTypes.Member:
            dbTypeString = "member";
            break;
        case controlTypes.Department:
            dbTypeString = "department";
            break;
        default:
            dbTypeString = "string";
            break;
    }
    return dbTypeString;
}


const formInit = (formtemplate,withNone) => {
    // var formtemplate = _.where(this.state.targetFormTempaltes,
    //     { formTemplateId: templateId })[0];
    // var filterFields = formtemplate.fields.filter(e => { return e.formControlType !== 1 && e.valueType })
     if(!formtemplate)return {}
    let newFields = [];
    formtemplate.fields.map(e => {
        let newEle = { ...{}, ...e }
        newFields.push(newEle)
    });
    var filterFields;
    if(withNone){
        filterFields = newFields;
    }else{  
         filterFields = newFields.filter(e => { return e.controlType !== 'None' })
    }
    var formGroup = _.groupBy(filterFields, 'formCode');
    let forms = []
    for (let form in formGroup) {

        if (form !== 'undefined' && form !== undefined) {
            var formitem = _.where(newFields, { formCode: form })[0]
            if (formitem) {
                let fields = formGroup[form].filter(e => { return e.controlType !== 'Cascader' })
                var addressControls = _.where(formGroup[form], { controlType: "Cascader" })
                addressControls.map(address => {
                    var addressList = _.where(newFields, { groupId: address.id });
                    addressList.map(e => { e.controlType = 'Cascader' })
                    fields = fields.concat(addressList)
                })
                forms.push({
                    formType:formitem.formType,
                    name: formitem.formType === 0 ? formtemplate.name : formitem.name.replace(/\.\S*/g, ''),
                    formtemplateId:formtemplate.id,
                    formId: formitem.formId,
                    table: formitem.formCode,
                    fields: fields,
                    mapFields: formGroup[form]
                })
            }
        }
    }
    return forms;
}

const getFieldByGroupItemCode = (fields, code) => {
    let field = {}
    if (fields instanceof Array) {
        fields.map(fie => {
            for (let key in fie.groupItems) {
                if (fie.groupItems[key].code === code) {
                    field = fie;
                }
            }
        })
    }
    return field;

}
function ToExprssionTypeTargetForm(fields){
    var newList=[];
    if(fields instanceof Array){
         fields.map(ele => {
            ele.expressionType=1;
            newList.push({...{}, ...ele})
            })
    }
    return newList;
}
function ToExprssionTypeLinkMainForm(fields){
    var newList=[];
    if(fields instanceof Array){
         fields.map(ele => {
            ele.expressionType=2;
            newList.push({...{}, ...ele})
            })
    }
    return newList;
}
module.exports = {
    triggerData,
    execActionData,
    filterModes,
    formInit,
    getLinkFormList,
    getTemplate,
    fieldSelectMode,
    controlTypes,
    controlGroups,
    controlGroupsCondition,
    getControlTypeMap,
    getControlTypeCondition,
    getFieldByGroupItemCode,
    parseControlType,
    ToExprssionTypeTargetForm,
    ToExprssionTypeLinkMainForm,
    
}