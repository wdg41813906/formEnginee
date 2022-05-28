import { Button, message, Spin } from 'antd'
import List from './List'
import ActionLog from './ActionLog'
import Operate from './Operate'
import _ from 'underscore'
// import comTable from '../../models/Common/table'
import com from '../../utils/com'
import queryString from 'query-string';
import { CheckPushTigger } from '../../services/BusinessRule/BusinessRule'
import { controlGroups, controlGroupsCondition, formInit } from '../../utils/businessRuleConfig'
message.config({
    top: 200,
    duration: 2,
    maxCount: 1,
});
function BusinessRule({
    formTemplateVersionId,
    formBody,
    formBuilder,
    businessRule,
    dispatch,
    history
}) {

    const objBusiness = businessRule.toJS();
    const objFormBuilder = formBuilder.toJS();

    const { loading, pagination, pushRelationList, mode, operateShow, formList, form, currentFields, currentFormField, templateFields,
        templateMapFields, name, pushType, triggerCondition, schedueList, actionLogShow,
        currentPushRelationId,
        logPagination,
        pushQueueList, exteralList, dataInterfaceList,
        formTemplateWithFields, formTempatePagination, formTemplateComLoading,
        pushCommandActionRequests } = objBusiness;
    const { formTemplateId } = objFormBuilder;
    const operateShowToggle = (flag) => {
        dispatch({
            type: 'businessRule/operateShowToggle',
            payload: {
                formTemplateVersionId,
                flag
            }
        })
    }
    const getPushQueuePage = (id, pageIndex, pageSize) => {
        dispatch({
            type: 'businessRule/GetPushQueuePage',
            payload: {
                formTemplateVersionId,
                pushRelationId: id,
                pageIndex: pageIndex,
                pageSize: pageSize
            }
        })
    }
    const actionLogShowToggle = (flag) => {
        dispatch({
            type: 'businessRule/save',
            payload: {
                formTemplateVersionId,
                actionLogShow: flag
            }
        })
    }

    const ActionLogProps = {
        actionLogShow,
        getPushQueuePage: getPushQueuePage,
        actionLogShowToggle,
        logPagination,
        currentPushRelationId,
        pushQueueList
    }
    const ListProps = {
        getPushQueuePage,
        actionLogShowToggle,
        setCurrentPushRelationId(id) {
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    currentPushRelationId: id
                }
            })

        },
        operateShowToggle,
        ...pagination,

        pushRelationList,

        getDataSourceList(page) {
            dispatch({
                type: 'businessRule/GetListPaged',
                payload: {
                    formTemplateVersionId,
                    formTemplateId,
                    ...page

                }
            })
        },
        remove(id) {
            dispatch({
                type: 'businessRule/Remove',
                payload: {
                    entityIdList: [id],
                    formTemplateVersionId,
                    formTemplateId,
                }
            })
        },
        add() {
            debugger
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    operateShow: true,
                    mode: 'add',
                    name: "",
                    pushType: "",
                    form: { formId: "", form: "" },
                    schedueList: [],
                    triggerCondition: [],
                    dataInterfaceList: []

                }

            })
           
        },
        GetById(id) {
            // operateShowToggle(true)
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    operateShow: true,
                    mode: 'modify'
                }

            })
            dispatch({
                type: 'businessRule/GetById',
                payload: {
                    entityId: id,
                    formTemplateVersionId,
                }
            })
        },
    }
    const OperateProps = {
        loading,
        mode,
        operateShow,
        formList,
        form,
        templateFields,
        templateMapFields,
        operateShowToggle,
        currentFormField,
        //currentFormField: currentFields,
        formTemplateId,
        formTemplateVersionId,
        name,
        pushType,
        triggerCondition,
        schedueList,
        exteralList,
        dataInterfaceList,
        formTemplateComLoading,
        formTemplateWithFields,
        formTempatePagination,
        init() {
            let parames = queryString.parse(history.location.search)
            if (parames.type === 'modify') {
                // dispatch({
                //     type: 'businessRule/GetTableHeadAll',
                //     payload: { formTemplateVersionId: parames.tabId },
                // })
                dispatch({
                    type: 'businessRule/detail',
                    payload: { formTemplateVersionId: parames.tabId },
                })
                dispatch({
                    type: 'businessRule/SourceTypeConfigAll',
                    payload: {
                        formTemplateVersionId: parames.tabId,
                        formTemplateId: parames.formTemplateId,
                    },
                })

            }
        },
        GetFormTemplateWithFieldByIds() {
            dispatch({
                type: 'businessRule/GetFormTemplateWithFieldByIds',
                payload: {
                    formTemplateVersionId: formTemplateVersionId,
                    formTemplateId: formTemplateId
                },

            })
        },
        getFormTemplateWithFieldPaged(dataInfo) {
            let parames = queryString.parse(history.location.search)
            dispatch({
                type: 'businessRule/GetFormTemplateWithFieldPaged',
                payload: {
                    ...dataInfo,
                    formTemplateVersionId: formTemplateVersionId,
                    formTemplateId: formTemplateId
                },

            })
        },
        onAdddataInterfaceList(item) {
            item.operationStatus = 1;
            dataInterfaceList.push(item);
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    dataInterfaceList
                }
            })
        },
        onModifyDataInterface(item, ele, addEle) {
            let newDataInterfaceList = []
            dataInterfaceList.map(e => {

                if (item.id === e.id) {
                    e.mappingData.map(f => {
                        if (f.id === ele.id) {
                            for (let key in addEle) {
                                f[key] = addEle[key];
                            }
                        }
                    })
                }
                newDataInterfaceList.push(e)
            })
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    dataInterfaceList: newDataInterfaceList
                }
            })
        },
        onDelDataInterface(item) {
            var newDataInterfaceList = [];
            if (mode === 'add') {
                newDataInterfaceList = dataInterfaceList.filter(e => { return e.id !== item.id });
            } else {
                dataInterfaceList.map(e => {
                    if (e.id === item.id) {
                        if (e.operationStatus !== 1) {
                            e.operationStatus = 0;
                            newDataInterfaceList.push(e)
                        }
                    } else {
                        newDataInterfaceList.push(e)
                    }
                })
            }
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    dataInterfaceList: newDataInterfaceList
                }
            })
        },
        onChangeName(val) {
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    name: val
                }
            })
        },
        onChangeForm(id) {
            //var form = _.where(formList, { id })[0]
            // var formFields = _.where(currentFields, { formId: id })


            var linkFormList = formTemplateWithFields;
            var formtemplate = _.where(linkFormList, { formTemplateId: formTemplateId })[0];
            var forms = formInit(formtemplate)
            var currentForm = _.where(forms, { formId: id })[0]
            var newTriggerCondition = triggerCondition.filter(ele => {
                if (ele.operationStatus === 3) {
                    ele.operationStatus = 0
                    return ele
                } else {
                    return ele;
                }
            })
            var newSchedueList = schedueList.filter(ele => {
                if (ele.operationStatus === 3) {
                    ele.operationStatus = 0
                }
                return ele;
            })
            var newdataInterfaceList = dataInterfaceList.filter(ele => {
                if (ele.operationStatus === 3) {
                    ele.operationStatus = 0
                }
                return ele;
            })
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    form: { formId: currentForm.formId, form: currentForm.table, formType: currentForm.formType, formtemplateId: currentForm.formtemplateId },
                    pushType: '',
                    currentFormField: currentForm.fields,
                    templateFields: currentForm.fields,
                    templateMapFields: currentForm.mapFields,
                    triggerCondition: newTriggerCondition,
                    schedueList: newSchedueList,
                    dataInterfaceList: newdataInterfaceList
                }
            })
            // dispatch({
            //     type: 'businessRule/save',
            //     payload: {
            //         formTemplateVersionId,

            //     }
            // })

            // dispatch({
            //     type: 'businessRule/save',
            //     payload: {
            //         formTemplateVersionId,

            //     }
            // })
        },
        onChangeTriggerType(type) {
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    pushType: type
                }
            })
        },
        delTriggerCondition(id) {
            var newFilterArr = []
            if (mode === 'add') {
                newFilterArr = triggerCondition.filter(e => {
                    return e.id !== id;
                })
            } else {
                triggerCondition.map(e => {
                    if (e.id === id) {
                        if (e.operationStatus !== 1) {
                            e.operationStatus = 0;
                            newFilterArr.push(e);
                        }

                    } else { newFilterArr.push(e); }

                })
            }
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    triggerCondition: newFilterArr
                }
            })
        },
        addTriggerCondition(item) {
            item.operationStatus = 1;
            triggerCondition.push(item);
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    triggerCondition
                }
            })
        },
        modifyTriggerCondition(id, keyValue) {
            var conList = [];
            triggerCondition.map(ele => {
                if (ele.id === id) {
                    var v = { ...ele, ...keyValue }
                    if (v.operationStatus !== 1 && v.operationStatus !== 0) {
                        v.operationStatus = 2;
                    }
                    conList.push(v)
                }
                else {
                    conList.push(ele)
                }
            })
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    triggerCondition: conList
                }
            })
        },
        onAddschedueList(obj) {
            var newschedueList = schedueList.filter(e => { return e });
            newschedueList.push({ ...obj })
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    schedueList: newschedueList
                }
            })
        },

        onModifySchedueFields(item, ele, flag) {
            let newschedueList = []
            schedueList.map(e => {
                if (item.id === e.id) {
                    item.fields.map(f => {
                        if (f.id === ele.id) {
                            f.disable = flag;
                        }
                    })
                }
                newschedueList.push(e)
            })
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    schedueList: newschedueList
                }
            })
        },
        onModifySchedueMapFields(item, ele, flag) {
            let newschedueList = []
            schedueList.map(e => {
                if (item.id === e.id) {
                    item.mapFields.map(f => {
                        if (f.id === ele.id) {
                            f.disable = flag;
                        }
                    })
                }
                newschedueList.push(e)
            })
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    schedueList: newschedueList
                }
            })
        },
        onModifySchedueList(item, obj) {
            //fields
            let newschedueList = []
            schedueList.map(e => {
                if (item.id === e.id) {
                    var element = { ...e, ...obj }
                    newschedueList.push(element)
                }
                else { newschedueList.push(e) }
            })
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    schedueList: newschedueList
                }
            })
        },
        onDelschedueList(item) {
            var newschedueList = [];
            if (mode === 'add') {
                newschedueList = schedueList.filter(e => { return e.id !== item.id });
            } else {
                schedueList.map(e => {
                    if (e.id === item.id) {
                        if (e.operationStatus !== 1) {
                            e.operationStatus = 0;
                            newschedueList.push(e)
                        }
                    } else {
                        newschedueList.push(e)
                    }
                })
            }
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    schedueList: newschedueList
                }
            })
        },

        SavePush() {
            // Delete = 0, Add = 1,  Modify = 2, Default = 3,
            //验证
            let canSubimt = true;
            if (!objBusiness.name) {
                message.error('请填写业务规则名称！')
                return;
            }
            if (!objBusiness.form.formId) {
                message.error('请选择触发表单！')
                return;
            }
            if (!objBusiness.pushType) {
                message.error('请选择触发动作！')
                return;
            }
            var pushRelationId = mode === 'add' ? com.Guid() : objBusiness.id;
            let triggerConditionRequest = [];
            let execConditionRequest = [];
            let pushAssignmentActionRequests = [];
            objBusiness.triggerCondition.map(ele => {
                if (ele.controlType === 'DateTime') {
                    if ((ele.extendedType === '' || ele.extendedType === null || ele.extendedType === undefined || ele.extendedType === 'undefined')
                        && ele.operationStatus !== 0
                    ) {
                        message.error(`触发条件${ele.name}值为空！`)
                        canSubimt = false
                    }
                } else {
                    //条件设置为  “为空” 、“不为空”  时没有值
                    if ((ele.value === '' || ele.value === null || ele.value === undefined || ele.value === 'undefined')
                        && ele.operationStatus !== 0) {
                        if (!(ele.condition === "2" || ele.condition === "3")) {
                            message.error(`触发条件${ele.name}值为空！`)
                            canSubimt = false
                        }
                    }
                }
                var result = triggerConditionMap(ele, objBusiness.form.form, pushRelationId)
                result.operationStatus = mode === 'add' ? 1 : ele.operationStatus;
                result.scheme = getSplitStr({ form: result.form, formItem: result.formItem })
                triggerConditionRequest.push(result)
            })
            let pushCommandActionRequests = []
            if (objBusiness.schedueList.length <= 0 && objBusiness.dataInterfaceList <= 0) {
                message.error('请添加执行动作或者外部推送接口！')
                return;
            }
            objBusiness.schedueList.map(ele => {
                debugger
                if (!ele.formTemplateId) {
                    message.error(`执行动作${ele.title}没选择表单模板！`)
                    canSubimt = false
                }
                if (!ele.formId) {
                    message.error(`执行动作${ele.title}没选择表单！`)
                    canSubimt = false
                }
                if (form.formType === 1 && (ele.type === "add" || ele.type === 'modifyOrAdd')
                    && ele.formType === 1) {
                    message.error(`子表不能向子表新增`)
                    canSubimt = false
                }

                if ((form.formtemplateId === ele.formTemplateId &&
                    form.formType === 0 && ele.formType === 1

                    && (ele.type === "add" || ele.type === 'modifyOrAdd')
                    && pushType === "delete"

                )) {
                    message.error(`不能删除主表的同时新增子表！`)
                    canSubimt = false
                }
                let pushCommandId = ele.id;
                var schedue = {
                    id: pushCommandId,
                    operationStatus: mode === 'add' ? 1 : ele.operationStatus,
                    pushRelationId: pushRelationId,
                    formItemId: ele.formItemId,
                    formId: ele.formId,
                    formTemplateId: ele.formTemplateId,
                    form: ele.form,
                    type: ele.type
                };
                pushCommandActionRequests.push(schedue);


                if (ele.type === 'modify' || ele.type === 'modifyOrAdd') {
                    if (ele.filterConditions.length <= 0) {
                        message.error(`请添加过滤条件！`)
                        canSubimt = false
                    }
                    if (ele.fieldMapings.length <= 0) {
                        message.error(`请添加修改字段！`)
                        canSubimt = false
                    }
                }
                if (ele.type === 'delete') {
                    if (ele.filterConditions.length <= 0) {
                        message.error(`请添加过滤条件！`)
                        canSubimt = false
                    }
                }
                ele.filterConditions.map(fCon => {
                    if (fCon.operationStatus !== 0 && !fCon.expression && !controlGroupsCondition.includes(fCon.controlType)
                        && !fCon.sourceGroupItems) {
                        message.error(`请完善过滤条件！`)
                        canSubimt = false
                    }
                    // if (fCon.operationStatus !== 0 && controlGroupsCondition.includes(fCon.controlType) && !fCon.sourceGroupItems
                    //     && fCon.modeType !== 'none') {
                    //     message.error(`请完善过滤条件！`)
                    //     canSubimt = false
                    // }

                    //controlGroupsCondition.includes(fCon.controlType)
                    //2020-01-16 新增： 过滤条件 可以 用文本关联单选、下拉。--by lizn
                    debugger
                    if (fCon.targetGroupItems) {
                        //目标字段为控件组，但源字段为空或者   该项被删除
                        if (fCon.modeType === 'none' || fCon.operationStatus === 0) {
                            for (let key in fCon.targetGroupItems) {
                                if (key === 'value') continue
                                let target = fCon.targetGroupItems[key]
                                let expression = '{0} is null'//`{0} = ${target.formCode}.${target.code}`;
                                let scheme = getSplitStr({ formItem: target.code });
                                execConditionRequest.push({
                                    ...target, ...{
                                        id: target.configKey,
                                        //  expressionType: 1,
                                        expressionType: fCon.expressionType,
                                        form: fCon.formCode,
                                        formItem: target.code,
                                        formItemId: fCon.formItemId,
                                        linkOperator: fCon.linkOperator,
                                        operator: fCon.operator,
                                        paramsType: fCon.paramsType,
                                        expression,
                                        operationStatus: mode === 'add' ? 1 : fCon.operationStatus,
                                        valueType: fCon.modeType,
                                        pushCommandId: pushCommandId,
                                        pushRelationId: pushRelationId,
                                        scheme
                                    }
                                })
                            }
                        }
                        //目标字段  和源字段 均为控件组
                        else if (fCon.sourceGroupItems) {
                            for (let key in fCon.sourceGroupItems) {
                                if (key === 'value') continue
                                let sourceGroup = fCon.sourceGroupItems[key];
                                let target = fCon.targetGroupItems[key]
                                let expression = `{0} = ${sourceGroup.formCode}.${sourceGroup.code}`;
                                let scheme = getSplitStr({ formItem: target.code, formCode: sourceGroup.formCode, code: sourceGroup.code });
                                execConditionRequest.push({
                                    ...sourceGroup, ...{
                                        id: target.configKey,
                                        expressionType: fCon.expressionType,
                                        form: fCon.formCode,
                                        formItem: target.code,
                                        formItemId: fCon.formItemId,
                                        linkOperator: fCon.linkOperator,
                                        operator: fCon.operator,
                                        paramsType: fCon.paramsType,
                                        expression,
                                        operationStatus: mode === 'add' ? 1 : fCon.operationStatus,
                                        valueType: fCon.modeType,
                                        pushCommandId: pushCommandId,
                                        pushRelationId: pushRelationId,
                                        scheme
                                    }
                                })
                            }

                        }
                        //目标字段为控件组单源字段为普通控件
                        else if (!fCon.sourceGroupItems) {
                            for (let key in fCon.targetGroupItems) {
                                if (key === 'value') continue
                                let target = fCon.targetGroupItems[key]
                                //  let expression = '{0} is null'//`{0} = ${target.formCode}.${target.code}`;
                                let scheme = getSplitStr({ formItem: target.code, formCode: fCon.formCode, code: fCon.code, });
                                execConditionRequest.push({
                                    ...target, ...{
                                        id: target.configKey,
                                        //  expressionType: 1,
                                        expression: fCon.expression,
                                        expressionType: fCon.expressionType,
                                        form: fCon.formCode,
                                        formItem: target.code,
                                        formItemId: fCon.formItemId,
                                        linkOperator: fCon.linkOperator,
                                        operator: fCon.operator,
                                        paramsType: fCon.paramsType,
                                        //expression,
                                        operationStatus: mode === 'add' ? 1 : fCon.operationStatus,
                                        valueType: fCon.modeType,
                                        pushCommandId: pushCommandId,
                                        pushRelationId: pushRelationId,
                                        scheme
                                    }
                                })
                            }
                        }


                    } else {
                        // let expression = `{0} = ${fCon.formCode}.${fCon.code}`;
                        if (fCon.sourceGroupItems) {
                            for (let key in fCon.sourceGroupItems) {
                                if (key === 'value') continue
                                let sourceGroup = fCon.sourceGroupItems[key];
                                //let target = fCon.targetGroupItems[key]
                                let expression = `{0} = ${sourceGroup.formCode}.${sourceGroup.code}`;
                                let scheme = getSplitStr({ formCode: fCon.formCode, code: fCon.code, formItem: fCon.formItem });
                                execConditionRequest.push({
                                    ...fCon, ...{
                                        id: fCon.configKey,
                                        expressionType: fCon.expressionType,
                                        form: fCon.formCode,

                                        expression,
                                        operationStatus: mode === 'add' ? 1 : fCon.operationStatus,
                                        valueType: fCon.modeType,
                                        pushCommandId: pushCommandId,
                                        pushRelationId: pushRelationId,
                                        scheme
                                    }
                                })
                            }
                        } else {
                            let scheme = '';
                            if (fCon.modeType === 'expression' && !controlGroupsCondition.includes(fCon.controlType)) {
                                scheme = getSplitStr({ formCode: fCon.formCode, code: fCon.code, formItem: fCon.formItem });
                            }
                            if (fCon.modeType === 2 || fCon.modeType === 1 || fCon.modeType === 'none' ||
                                fCon.modeType === 'custom') {
                                scheme = fCon.formItem;
                            }

                            execConditionRequest.push({
                                ...fCon, ...{
                                    form: fCon.formCode,
                                    id: fCon.configKey,
                                    //expression,
                                    operationStatus: mode === 'add' ? 1 : fCon.operationStatus,
                                    valueType: fCon.modeType,
                                    pushCommandId: pushCommandId,
                                    pushRelationId: pushRelationId,
                                    scheme: scheme//fCon.formItem
                                }
                            })
                        }
                    }


                })
                ele.fieldMapings.map(fMap => {
                    //!fMap.value
                    if ((
                        fMap.value === '' || fMap.value === null || fMap.value === undefined || fMap.value === 'undefined'
                    ) && !controlGroups.includes(fMap.controlType)
                        && fMap.operationStatus !== 0) {
                        message.error(`请完善字段配置！`)
                        canSubimt = false
                    }
                    if (fMap.operationStatus !== 0 && controlGroups.includes(fMap.controlType) && !fMap.sourceGroupItems
                        && fMap.modeType !== 'none'
                        && fMap.modeType !== "primaryKey") {
                        message.error(`请完善字段配置！`)
                        canSubimt = false
                    }
                    // else {
                    //     if (!fMap.value) {
                    //         message.error(`请完善字段配置！`)
                    //         canSubimt = false
                    //     }
                    // }
                    //如果是控件组并且 触发条件 选择的 为空
                    if (controlGroups.includes(fMap.controlType) && fMap.modeType === 'none') {
                        if (fMap.targetGroupItems) {
                            for (let key in fMap.targetGroupItems) {
                                let targetGroup = fMap.targetGroupItems[key];
                                pushAssignmentActionRequests.push({
                                    ...targetGroup, ...{
                                        id: targetGroup.assignKey,
                                        value: fMap.value,
                                        formItem: targetGroup.code,
                                        type: 1,
                                        operationStatus: mode === 'add' ? 1 : fMap.operationStatus,
                                        valueType: fMap.modeType,
                                        pushCommandId: pushCommandId,
                                        scheme: targetGroup.code,
                                    }
                                })
                            }
                        }
                    } else {
                        if (fMap.sourceGroupItems) {
                            for (let key in fMap.sourceGroupItems) {
                                let sourceGroup = fMap.sourceGroupItems[key];
                                let target = fMap.targetGroupItems[key]
                                let expression = `${sourceGroup.formCode}.${sourceGroup.code}`;

                                let scheme = getSplitStr({ formItem: target.code, formCode: sourceGroup.formCode, code: sourceGroup.code });
                                pushAssignmentActionRequests.push({
                                    ...sourceGroup, ...{
                                        id: target.assignKey,
                                        value: expression,
                                        formItem: target.code,
                                        type: 1,
                                        operationStatus: mode === 'add' ? 1 : fMap.operationStatus,
                                        valueType: fMap.modeType,
                                        pushCommandId: pushCommandId,
                                        scheme
                                    }
                                })
                            }
                        } else {
                            let scheme = '';
                            if (fMap.modeType === 'expression' && !controlGroups.includes(fMap.controlType)) {
                                scheme = getSplitStr({ formCode: fMap.formCode, code: fMap.code, formItem: fMap.formItem });
                            }
                            if (fMap.modeType === 2 || fMap.modeType === 1 || fMap.modeType === 'none' ||
                                fMap.modeType === 'custom') {

                                scheme = fMap.formItem;
                            }
                            pushAssignmentActionRequests.push({
                                ...fMap, ...{
                                    //value:expression,
                                    id: fMap.assignKey,
                                    operationStatus: mode === 'add' ? 1 : fMap.operationStatus,
                                    valueType: fMap.modeType,
                                    pushCommandId: pushCommandId,
                                    scheme
                                }
                            })
                        }
                    }

                })
                ele.newfieldMapings.map(fMap => {
                    //!fMap.value
                    if (fMap.operationStatus !== 0 && (fMap.value === '' || fMap.value === null || fMap.value === undefined || fMap.value === 'undefined') && !controlGroups.includes(fMap.controlType)) {
                        message.error(`请完善字段配置！`)
                        canSubimt = false
                    }
                    if (fMap.operationStatus !== 0 && controlGroups.includes(fMap.controlType) && !fMap.sourceGroupItems
                        && fMap.modeType !== 'none' && fMap.modeType !== "primaryKey") {
                        message.error(`请完善字段配置！`)
                        canSubimt = false
                    }
                    // else {
                    //     if (!fMap.value) {
                    //         message.error(`请完善字段配置！`)
                    //         canSubimt = false
                    //     }
                    // }
                    //如果是控件组并且 触发条件 选择的 为空
                    if (controlGroups.includes(fMap.controlType) && fMap.modeType === 'none') {
                        if (fMap.targetGroupItems) {
                            for (let key in fMap.targetGroupItems) {
                                let targetGroup = fMap.targetGroupItems[key];
                                pushAssignmentActionRequests.push({
                                    ...targetGroup, ...{
                                        id: targetGroup.assignKey,
                                        value: fMap.value,
                                        type: 0,
                                        formItem: targetGroup.code,
                                        operationStatus: mode === 'add' ? 1 : fMap.operationStatus,
                                        valueType: fMap.modeType,
                                        pushCommandId: pushCommandId,
                                        scheme: targetGroup.code,
                                    }
                                })
                            }
                        }

                    } else {
                        if (fMap.sourceGroupItems) {
                            for (let key in fMap.sourceGroupItems) {
                                let sourceGroup = fMap.sourceGroupItems[key];
                                let target = fMap.targetGroupItems[key]
                                let expression = `${sourceGroup.formCode}.${sourceGroup.code}`;
                                let scheme = getSplitStr({ formItem: target.code, formCode: sourceGroup.formCode, code: sourceGroup.code });
                                pushAssignmentActionRequests.push({
                                    ...sourceGroup, ...{
                                        id: target.assignKey,
                                        value: expression,
                                        type: 0,
                                        formItem: target.code,
                                        operationStatus: mode === 'add' ? 1 : fMap.operationStatus,
                                        valueType: fMap.modeType,
                                        pushCommandId: pushCommandId,
                                        scheme
                                    }
                                })
                            }
                        } else {
                            let scheme = '';
                            if (fMap.modeType === 'expression' && !controlGroups.includes(fMap.controlType)) {
                                scheme = getSplitStr({ formCode: fMap.formCode, code: fMap.code, formItem: fMap.formItem });
                            }
                            if (fMap.modeType === 2 || fMap.modeType === 1 || fMap.modeType === 'none' ||
                                fMap.modeType === 'custom' || fMap.modeType === "primaryKey") {
                                scheme = fMap.formItem;
                            }
                            pushAssignmentActionRequests.push({
                                ...fMap, ...{
                                    id: fMap.modeType === "primaryKey" ? fMap.id : fMap.assignKey,
                                    operationStatus: mode === 'add' ? 1 : fMap.operationStatus,
                                    valueType: fMap.modeType,
                                    type: 0,
                                    pushCommandId: pushCommandId,
                                    scheme
                                }
                            })
                        }
                    }

                })
            })

            //远程推送接口配置
            let remotePushConfigActionRequests = [];
            //远程推送赋值规则
            let remotePushAssignmentActionRequests = [];
            objBusiness.dataInterfaceList.map(inter => {

                let remotePushConfigId = inter.id;
                let { mappingData, ...interOther } = { ...inter }
                remotePushConfigActionRequests.push({ ...interOther, ...{ pushRelationId: pushRelationId } });

                inter.mappingData.map(map => {
                    if (!map.code) {
                        message.error(`外部接口映射配置！`)
                        canSubimt = false
                    }
                    remotePushAssignmentActionRequests.push({
                        ...map,
                        ...{
                            remotePushConfigId: remotePushConfigId,
                            valueType: 0,
                            value: `${map.formCode}.${map.code}`,
                            scheme: `${map.formCode},${map.code}`
                        }
                    })
                })
            })

            //触发条件为新增，执行动作要校验 新增、修改或新增
            //触发条件为修改，执行动作要校验 修改、修改或新增
            //var execActionTypes = []
            // if (objBusiness.pushType === 'add' || objBusiness.pushType === 'modify') {
            //     execActionTypes =['modifyOrAdd']// [objBusiness.pushType]
            // }
            pushCommandActionRequests.map(ele => {
                //触发表 触发动作 与 执行表 执行动作一致
                var execActionTypes = []
                execActionTypes.push(ele.type);
                if (ele.type === 'modifyOrAdd') {
                    execActionTypes.push('add')
                    execActionTypes.push('modify')
                }
                if (ele.form === objBusiness.form.form &&
                    execActionTypes.includes(objBusiness.pushType)) {
                    message.error(`触发动作与执行动作一致!`)
                    canSubimt = false
                }
            })
            if (!canSubimt) {
                return;
            }


            var submitJson = {
                pushRelationActionRequest: {
                    id: pushRelationId,
                    operationStatus: mode === 'add' ? 1 : 2,
                    name: objBusiness.name, formTemplate: objFormBuilder.formTitle, formTemplateId: formTemplateId,
                    form: objBusiness.form.form, formId: objBusiness.form.formId, pushType: objBusiness.pushType, pushTime: 0
                },
                pushConfigActionRequests: triggerConditionRequest.concat(execConditionRequest),
                pushCommandActionRequests: pushCommandActionRequests,
                pushAssignmentActionRequests: pushAssignmentActionRequests,
                remotePushConfigActionRequests: remotePushConfigActionRequests,
                remotePushAssignmentActionRequests: remotePushAssignmentActionRequests
            }
            // return
            dispatch({
                type: 'businessRule/save',
                payload: {
                    formTemplateVersionId,
                    formTemplateId,
                    loading: true
                }
            })
            CheckPushTigger(submitJson)
                .then(result => {
                    const { data } = result;
                    if (data === true) {
                        dispatch({
                            type: 'businessRule/SavePush',
                            payload: {
                                formTemplateVersionId,
                                formTemplateId,
                                ...submitJson
                            }
                        })
                    } else {
                        dispatch({
                            type: 'businessRule/save',
                            payload: {
                                formTemplateVersionId,
                                formTemplateId,
                                loading: false
                            }
                        })
                        message.error("循环计算错误!")
                    }
                })


        }

    }
    const ListCom = () => {
        return <List {...ListProps} />
    }

    return <div>
        <ListCom />
        <ActionLog {...ActionLogProps} />
        <Operate {...OperateProps} />
    </div>;
}

export default BusinessRule;


function triggerConditionMap(keyValue, formName, pushRelationId, pushCommandId) {
    let exp = com.dealConfigArr.filter(item => item.value === keyValue.condition)[0]["condition"];
    let expression = exp;
    let regValue = '';
    if (keyValue.value instanceof Array) {
        regValue = getSplitArr(keyValue.value);
        keyValue.value.forEach((ele, index) => {
            expression = expression.replace(`value${index + 1}`, ele, '')
        })
    } else {
        regValue = keyValue.value;
        expression = exp.replace('value', keyValue.value, '')
    }

    let paramsType = 0;
    //日期控件并且选择今天：1 ，昨天：2， 本周：3 ， 上周：4 ，本月： 5， 上月：6
    if (keyValue.controlType === "DateTime"
        && com.dateExtendedType.includes(keyValue.extendedType)) {
        paramsType = 3;
        regValue = keyValue.extendedType;
        expression = "{0} {dynamic}"
    }
    let formItem = keyValue.code;
    let formId = keyValue.formId;
    if (keyValue.groupItems) {
        var current = keyValue.groupItems['name'];
        formItem = current.code;
        formId = current.formId;
    }
    return {
        id: keyValue.configKey,
        pushRelationId: pushRelationId,
        pushCommandId: pushCommandId,
        expressionType: 0,
        form: formName,
        formId: formId,// keyValue.formId,
        formItem: formItem,//keyValue.code,
        formItemId: keyValue.id,
        linkOperator: "0",
        operator: keyValue.condition,
        valueType: 'expression',
        expression: expression,//com.dealConfigArr.filter(item => item.value === keyValue.condition)[0]["condition"],
        paramsType: paramsType,// keyValue.extendedType,
        value: regValue,
        format: "",
    }
}
function getSplitArr(arr) {
    let result = '';
    if (arr instanceof Array) {
        arr.map(e => {
            if (!result) {
                result = e;
            } else {
                result += `,${e}`
            }
        })
    }
    return result;
}
function getSplitStr(obj) {
    let result = '';
    if (obj instanceof Object) {
        for (let key in obj) {
            if (!result) {
                result = obj[key];
            } else {
                result += `,${obj[key]}`
            }
        }
    }
    return result;
}
