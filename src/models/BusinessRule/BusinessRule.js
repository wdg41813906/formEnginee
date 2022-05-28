import { browserHistory } from 'dva/router'
import com from '../../utils/com'
import { parse } from 'qs';
import { message } from 'antd'
import { GetTableHeadAll } from '../../services/DataManage/DataManage'
import { detail } from '../../services/FormBuilder/FormBuilder'
import {
  GetFormTemplateWithFieldByIds, SavePush, GetById, GetListPaged, Remove, PushQueuePage
  , SourceTypeConfigAll, GetFormTemplateWithFieldPaged
} from '../../services/BusinessRule/BusinessRule'
import {
  parseControlType,
  triggerData, execActionData, filterModes,
  formInit, getFieldByGroupItemCode, controlGroups, ToExprssionTypeLinkMainForm, ToExprssionTypeTargetForm
} from '../../utils/businessRuleConfig';
import queryString from 'query-string';
import comTable from './../Common/table'
import _ from 'underscore'
import { initControlExtra, buildLinkFormList } from "commonForm";

message.config({
  top: 200,
  duration: 2,
  maxCount: 1,
});

function getlinkFormList(formTemplateList) {
  const controlExtraList = ['valueType', 'formControlType', 'event'];
  let controlExtra = initControlExtra(controlExtraList)
  let { linkFormList } = buildLinkFormList(formTemplateList, controlExtra)
  return linkFormList;
}

//triggerCondition:{form:'',formId:'',formItem:'',formItemId:'',linkOperator:'',operator:'',expression:'',paramsType:'',value:'',format:''}
//schedueList:[{
//type:'add',formId:'',form:'',filterConditions:[],fieldMapings:[],fields:[]
//}]
//filterConditions,fieldMapings:{formItem:'',valueType:'',value:''}

export default {
  namespace: 'businessRule',
  state: {
    all: {

    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        let parames = queryString.parse(history.location.search);
        if (pathname.indexOf('main/dic') > -1
          || pathname.indexOf('formbuilder/large') > -1) {


          if (parames.type === 'modify') {
            // dispatch({
            //   type: 'GetTableHeadAll',
            //   payload: { formTemplateVersionId: parames.tabId },
            // })
            // dispatch({
            //   type: 'detail',
            //   payload: { formTemplateVersionId: parames.tabId },
            // })
            // dispatch({
            //   type: 'SourceTypeConfigAll',
            //   payload: {
            //     formTemplateVersionId: parames.tabId,
            //     formTemplateId: parames.formTemplateId,
            //   },
            // })
          }
          //var formTemplateId = parames.formTemplateId;
          // setTimeout(() => {
          //   dispatch({
          //     type: 'InitTemplateField',
          //     payload: { formTemplateVersionId: parames.tabId, formTemplateId },
          //   })
          // }, 2000)

        }
      })

    },
  },
  effects: {
    *GetFormTemplateWithFieldPaged({ payload, history }, { call, put, select }) {
      debugger
      const { formTemplateVersionId, refresh, isSearch, ...other } = payload
      yield put({
        type: 'save',
        payload: {
          formTemplateVersionId,
          formTemplateComLoading: true,
        }
      })
      const { data } = yield call(GetFormTemplateWithFieldPaged, { ...other });
      if (data) {
        const { formTemplateList, pagination } = data;
        const businessRuleMap = yield select(({ businessRule }) => businessRule)
        const businessRule = businessRuleMap.all[payload.formTemplateVersionId].toJS()
        var linkFormList = getlinkFormList(formTemplateList)
        let formTemplateWithFields = [];
        debugger
        if (refresh) {
          if (isSearch) {
            var initFormTemplateWithFields = businessRule.initFormTemplateWithFields.filter(ele => { ele.isHide = true; return ele; });
            formTemplateWithFields = formTemplateWithFields
              .concat(initFormTemplateWithFields)
              .concat(linkFormList)
          } else {
            formTemplateWithFields = formTemplateWithFields
              .concat(businessRule.initFormTemplateWithFields)

            linkFormList.map(fele => {
              var ext = _.where(formTemplateWithFields, { id: fele.id });
              if (ext.length <= 0) {
                formTemplateWithFields.push(fele)
              }
            })
            // .concat(linkFormList)
          }

        }
        else {
          formTemplateWithFields = businessRule.formTemplateWithFields;
          formTemplateWithFields = formTemplateWithFields.concat(linkFormList)
        }
        let newFormTemplateWithFields = com.unique(formTemplateWithFields, "id")

        yield put({
          type: 'save',
          payload: {
            formTemplateVersionId,
            formTemplateComLoading: false,
            formTemplateWithFields: newFormTemplateWithFields,//formTemplateWithFields,
            formTempatePagination: pagination
          }
        })
      }

    },
    *SourceTypeConfigAll({ payload, history }, { call, put, select }) {
      const { formTemplateVersionId, formTemplateId, ...other } = payload
      const { data } = yield call(SourceTypeConfigAll, { ...other })
      if (data) {
        yield put({
          type: 'save',
          payload: {
            formTemplateVersionId,
            exteralList: data
          }
        })
        yield put({
          type: 'GetListPaged',
          payload: {
            formTemplateId: formTemplateId,
            formTemplateVersionId: formTemplateVersionId, PageIndex: 1, PageSize: 20
          },
        })
      }
    },
    *SavePush({ payload, history }, { call, put, select }) {
      // message.loading('处理中...', 0)
      const { formTemplateVersionId, formTemplateId, ...other } = payload
      const { data } = yield call(SavePush, other);
      if (data) {
        debugger
        // message.destroy();
        if (data.isValid) {
          const businessRuleMap = yield select(({ businessRule }) => businessRule)
          const businessRule = businessRuleMap.all[payload.formTemplateVersionId].toJS()
          yield put({
            type: 'save',
            payload: {

              formTemplateVersionId,
              loading: false,
              operateShow: false,
              name: "",
              pushType: "",
              form: { formId: "", form: "" },
              schedueList: [],
              triggerCondition: [],
              dataInterfaceList: []
            }
          })
          yield put({
            type: 'GetListPaged',
            payload: {
              formTemplateVersionId,
              formTemplateId,
              ...businessRule.pagination
            }
          })

          yield put({
            type: 'GetFormTemplateWithFieldByIds',
            payload: {
              formTemplateId: formTemplateId,
              formTemplateVersionId: formTemplateVersionId,
            }
          })
        } else {
          yield put({
            type: 'save',
            payload: {
              formTemplateVersionId,
              loading: false,
            }
          })
          message.error(data.errorMessages)
        }
      }
    },
    *Remove({ payload, history }, { call, put, select }) {
      message.loading('删除中...', 0);
      const { formTemplateVersionId, formTemplateId, ...other } = payload
      const { data } = yield call(Remove, other);
      if (data && data.isValid) {
        message.destroy();
        const businessRuleMap = yield select(({ businessRule }) => businessRule)
        const businessRule = businessRuleMap.all[payload.formTemplateVersionId].toJS();
        yield put({
          type: 'GetListPaged',
          payload: {
            formTemplateVersionId,
            formTemplateId,
            ...businessRule.pagination
          }
        })
        yield put({
          type: 'GetFormTemplateWithFieldByIds',
          payload: {
            formTemplateId: formTemplateId,
            formTemplateVersionId: formTemplateVersionId,
          }
        })
      }
    },
    *GetPushQueuePage({ payload, history }, { call, put, select }) {
      debugger
      const { data } = yield call(PushQueuePage, payload);
      if (data) {
        yield put({
          type: 'save',
          payload: {
            formTemplateVersionId: payload.formTemplateVersionId,
            logPagination: data.pagination,
            pushQueueList: data.pushQueueList
          }
        })
      }
    },
    *GetListPaged({ payload, history }, { call, put, select }) {
      const { data } = yield call(GetListPaged, payload);
      if (data) {

       


        yield put({
          type: 'save',
          payload: {
            formTemplateVersionId: payload.formTemplateVersionId,
            pagination: data.pagination,
            pushRelationList: data.pushRelationList,
          }
        })
        yield put({
          type: 'GetFormTemplateWithFieldByIds',
          payload: {
            formTemplateId: payload.formTemplateId,
            formTemplateVersionId: payload.formTemplateVersionId,
          }
        })
        // yield put({
        //   type: 'GetFormTemplateWithFieldPaged',
        //   payload: {
        //     refresh: false,
        //     formTemplateVersionId: payload.formTemplateVersionId,

        //   },
        // })
      }

    },
    *GetFormTemplateWithFieldByIds({ payload, history }, { call, put, select }) {
      const businessRuleMap = yield select(({ businessRule }) => businessRule)
      const businessRule = businessRuleMap.all[payload.formTemplateVersionId].toJS()
      let formTemplateIds = []
      formTemplateIds.push(payload.formTemplateId)
      businessRule.pushRelationList.map(re => {
        let fom = _.pluck(re.pushCommands, 'formTemplateId');
        // formTemplateIds.push(re.formTemplateId)
        formTemplateIds = formTemplateIds.concat(fom)
      })
      const result = yield call(GetFormTemplateWithFieldByIds, { entityIdList: Array.from(new Set(formTemplateIds)) })
      if (result) {

        businessRule.pushRelationList.map(relation => {
          let typeName = _.where(triggerData, { value: relation.pushType })[0].name;
          relation.pushTypeName = typeName;

          relation.pushCommands.map(command => {
            let temp = _.where(result.data, { formTemplateId: command.formTemplateId })[0];//getTemplate(command.formTemplateId);//
            let forms = formInit(temp, true);
            let form = _.where(forms, { table: command.form })[0];
            command.name = form.name;
          })
          relation.remotePushConfigs && relation.remotePushConfigs.map(remote => {
            let exteral = _.where(businessRule.exteralList, { id: remote.sourceTypeConfigId })[0];
            remote.exteralName = exteral.name
          })
        })
        var linkFormList = getlinkFormList(result.data)
        yield put({
          type: 'save',
          payload: {
            formTemplateVersionId: payload.formTemplateVersionId,
            formTemplateWithFields: linkFormList,
            initFormTemplateWithFields: linkFormList
          }
        })
      }
    },
    *GetById({ payload, history }, { call, put, select }) {
      message.loading('加载中...', 0)
      const { data } = yield call(GetById, { entityId: payload.entityId });
      if (data) {
        message.destroy();
        const businessRuleMap = yield select(({ businessRule }) => businessRule)
        const businessRule = businessRuleMap.all[payload.formTemplateVersionId].toJS()
        const linkFormList = businessRule.formTemplateWithFields//GetLinkFormList();
        debugger
        const { pushRelationActionRequest, pushConfigActionRequests, pushCommandActionRequests, pushAssignmentActionRequests,
          remotePushConfigActionRequests, remotePushAssignmentActionRequests } = data;
        let triggerConditionActions = _.where(pushConfigActionRequests, { expressionType: 0 });
        let triggerCondition = []

        let temp = _.where(linkFormList, { id: pushRelationActionRequest.formTemplateId })[0];//getTemplate(pushRelationActionRequest.formTemplateId);
        let forms = formInit(temp);
        let form = _.where(forms, { formId: pushRelationActionRequest.formId })[0];
        var formFields = form.fields;//_.where(forms.fields, { formId: pushRelationActionRequest.formId })
        triggerConditionActions.map(trigger => {
          debugger
          var ele = _.where(form.fields, { code: trigger.formItem })[0];
          if (!ele) {
            ele = getFieldByGroupItemCode(form.fields, trigger.formItem);
          }
          let value = "";
          //如果选择的是范围\等于任意一个\不等于任意一个
          if (trigger.operator === '12' || trigger.operator === '6' || trigger.operator === '7') {
            var arr = trigger.value.split(',');
            value = arr;

          } else {
            value = trigger.value
          }

          if (ele.groupItems) {
            ele.id = ele.groupItems['name'].id
          }
          triggerCondition.push({
            CusNameRender: ({ parentClassName }) => {
              return (<div title={`${ele.status === -1 ? '该字段已删除' : ''}`} className={`${parentClassName}`}
                style={{
                  width: 100, height: 32, lineHeight: '32px',
                  border: '1px solid #ddd', paddingLeft: 10, borderRadius: 4,
                  color: `${ele.status === -1 ? '#f5222d ' : ''}`
                }}>
                {ele.name}</div>)
            },
            configKey: trigger.id,
            operationStatus: trigger.operationStatus,
            name: ele.name,
            code: ele.code,
            formItem: trigger.formItem,
            condition: trigger.operator,
            isChangeTime: false,
            extendedType: trigger.paramsType.toString(),
            controlType: ele.controlType,
            dataIndex: ele.id,
            formId: trigger.formId,
            groupItems: ele.groupItems,
            type: parseControlType(ele.controlType),
            id: ele.id,
            // type: ele.type,
            property: ele.property,
            status: ele.status,
            value: value//trigger.value
          })
        });

        formFields.map(formField => {
          var extis = _.where(triggerCondition, { code: formField.code })[0];
          if (extis) {
            formField.disable = true;
          }
        })
        let schedueList = [];

        pushCommandActionRequests.map(ele => {
          let execAct = _.where(execActionData, { value: ele.type })[0];
          let tempalte = _.where(linkFormList, { id: ele.formTemplateId })[0]
          debugger
          let targetForms = formInit(tempalte);
          let targetForm = _.where(targetForms, { formId: ele.formId })[0];

          //let tempalteFields = _.where(tempalte.fields, { formId: ele.formId });
          let filterFields = []
          targetForms.forEach(form => {
            filterFields = filterFields.concat(form.fields)
          })
          // filterFields = targetForm.fields;//GetFilterFields(tempalteFields);

          let filterConditionAct = _.where(pushConfigActionRequests, { pushCommandId: ele.id });
          let filterConditions = []
          let filterConditionActNomals = filterConditionAct.filter(e => { return e.groupId === null })
          let filterConditionActGroups = _.groupBy(filterConditionAct.filter(e => { return e.groupId !== null }), 'groupId')
          for (let key in filterConditionActGroups) {
            let currentConditions = filterConditionActGroups[key];
            let condition = currentConditions[0];
            let sourceField = _.where(form.fields, { id: key })[0];

            let targetField = getFieldByGroupItemCode(filterFields, condition.formItem) //getFieldByGroupItemCode(targetForm.fields, condition.formItem)
            var singleField;
            debugger
            if (!sourceField) {
              singleField = _.where(form.fields, { code: condition.expression.split('.')[1] })[0]
            }
            let targetFieldGroupItem = targetField.groupItems;
            condition.configKey = com.Guid();
            currentConditions.map(con => {
              let code = con.formItem;
              for (let key in targetFieldGroupItem) {
                if (key === 'value') continue
                let item = targetFieldGroupItem[key];
                if (item.code === code) {
                  item.configKey = con.id;
                }
              }

            })
            condition.formCode = targetField.formCode;
            condition.modeType = _.where(filterModes, { value: condition.valueType })[0].key;
            condition.triggerFieldCode = condition.valueType !== 2 ? (singleField ? singleField.id : key) : '';
            condition.valueType = targetField.valueType;
            condition.controlType = targetField.controlType;
            condition.code = targetField.code;
            condition.name = targetField.name;
            condition.id = targetField.id;
            condition.property = targetField.property;
            condition.status = targetField.status;
            condition.targetGroupItems = targetFieldGroupItem;
            condition.sourceGroupItems = sourceField ? sourceField.groupItems : '';//[1,2]//filterConditionActGroups[key]
            filterConditions.push(condition)
          }

          filterConditionActNomals.map(condition => {
            //Expression = 0, Custom = 1, None = 2,
            // var code= condition.expression.spilt('.')[1];
            condition.configKey = condition.id;
            condition.modeType = _.where(filterModes, { value: condition.valueType })[0].key;
            let field = _.where(filterFields, { code: condition.formItem })[0];
            if (condition.valueType === 0) {
              let sourceCode = condition.expression.split('.')[1];
              let sourceField = _.where(form.fields, { code: sourceCode })[0]

              if (!sourceField) {
                sourceField = getFieldByGroupItemCode(form.fields, sourceCode);
              }
              condition.triggerFieldCode = sourceField.id

            }
            if (condition.valueType === 1) {
              var value = condition.expression.split('=')[1];
              condition.valueOfCom = value.replace(new RegExp(/'/g), '');
            }
            condition.formCode = field.formCode;
            condition.valueType = field.valueType;
            condition.controlType = field.controlType;
            condition.code = field.code;
            condition.name = field.name;
            condition.id = field.id;
            condition.property = field.property;
            condition.status = field.status;
            filterConditions.push(condition)
          })
          let fieldMapings = [];
          let newfieldMapings = []
          let commandAssignmentActs = _.where(pushAssignmentActionRequests, { pushCommandId: ele.id })
          let commandAssignmentActNomals = commandAssignmentActs.filter(e => { return e.groupId === null });
          let commandAssignmentActGroups = _.groupBy(commandAssignmentActs.filter(e => { return e.groupId !== null }), 'groupId');
          for (let key in commandAssignmentActGroups) {
            debugger
            let currentAssginment = commandAssignmentActGroups[key];
            let assign = currentAssginment[0];
            const field = getFieldByGroupItemCode(targetForm.mapFields, assign.formItem);
            const sourceField = _.where(form.mapFields, { id: key })[0]
            let targetFieldGroupItem = field.groupItems;
            if (assign.valueType === 0) {
              // var code = assign.value.split('.')[1];
              // var sourceField=_.where(form.fields,{code})[0]
              assign.triggerFieldCode = key;//sourceField.id;
            }
            if (assign.valueType === 1) {
              var value = assign.value;//.split('=')[1];
              assign.valueOfCom = value.replace(new RegExp(/'/g), '');
            }
            currentAssginment.map(ass => {
              var code = ass.formItem;// ass.value.split('.')[1];
              for (let key in targetFieldGroupItem) {
                let sou = targetFieldGroupItem[key];
                if (sou.code === code) {
                  sou.assignKey = ass.id;
                }
              }

            })
            // const field = _.where(targetForm.mapFields, { code: assign.formItem })[0];

            assign.modeType = _.where(filterModes, { value: assign.valueType })[0].key;
            assign.valueType = field.valueType;
            assign.controlType = field.controlType;
            // assign.code = field.code;
            assign.assignKey = com.Guid();
            assign.name = field.name;
            assign.id = field.id;
            assign.formItemId = field.id
            assign.formCode = field.formCode
            assign.property = field.property;
            assign.status = field.status;
            // assign.formId = field.formId;
            // assign.formItem = field.code,
            assign.targetGroupItems = targetFieldGroupItem;
            assign.sourceGroupItems = sourceField ? sourceField.groupItems : undefined;
            assign.operator = '=',
              assign.linkOperator = '0';
            if (assign.type === 0) {
              newfieldMapings.push(assign)
            } else {
              fieldMapings.push(assign)
            }
          }
          commandAssignmentActNomals.map(assign => {
            assign.modeType = _.where(filterModes, { value: assign.valueType })[0].key;
            if (assign.valueType !== 3) {
              //Expression = 0, Custom = 1, None = 2,
              if (assign.valueType === 0) {
                var code = assign.value.split('.')[1];
                var sourceField = _.where(form.mapFields, { code })[0]
                assign.triggerFieldCode = sourceField.id;
              }
              if (assign.valueType === 1) {
                var value = assign.value;//.split('=')[1];

                assign.valueOfCom = value.replace(new RegExp(/'/g), '');
              }

              let field = _.where(targetForm.mapFields, { code: assign.formItem })[0];
              // if (!field) {
              //   field = getFieldByGroupItemCode(targetForm.mapFields, assign.formItem);
              // }
              assign.assignKey = assign.id;
              assign.property = field.property;
              assign.status = field.status;
              assign.valueType = field.valueType;
              assign.controlType = field.controlType;
              assign.code = field.code;
              assign.id = field.id;
              assign.name = field.name;
              assign.formItemId = field.id
              assign.formCode = field.formCode
              assign.formId = field.formId;
              assign.formItem = field.code,
                assign.operator = '=',
                assign.linkOperator = '0';
            }
            if (assign.type === 0) {
              newfieldMapings.push(assign)
            } else {
              fieldMapings.push(assign)
            }

          })
          let targentFields = [];

          //targetForm.fields.map(ele => { targentFields.push({ ...{}, ...ele }) });
          targentFields = ToExprssionTypeTargetForm(targetForm.fields)
          if (targetForm.formType === 1) {
            let mainForm = _.where(targetForms, { formType: 0 })[0];
            let mainFields = ToExprssionTypeLinkMainForm(mainForm.fields)
            targentFields = targentFields.concat(mainFields)

          }
          targentFields.map(tar => {
            if (controlGroups.includes(tar.controlType)) {
              for (let key in tar.groupItems) {
                var exit = _.where(filterConditions, { formItem: tar.groupItems[key].code })[0];
                if (exit) {
                  tar.disable = true;
                }
              }
            } else {
              var exit = _.where(filterConditions, { code: tar.code })[0];
              if (exit) {
                tar.disable = true;
              }
            }
          })
          let targentMapFields = [];
          targetForm.mapFields.map(ele => { targentMapFields.push({ ...{}, ...ele }) })
          targentMapFields.map(ele => {
            if (controlGroups.includes(ele.controlType)) {
              for (let key in ele.groupItems) {
                var exit = _.where(fieldMapings, { formItem: ele.groupItems[key].code })[0];
                if (exit) {
                  ele.disable = true;
                }
              }
            } else {
              let exit = _.where(fieldMapings, { formItem: ele.code })[0];
              if (exit) {
                ele.disable = true;
              }
            }
          })
          schedueList.push({
            id: ele.id,
            key: ele.id,
            form: ele.form,
            formId: ele.formId,
            formType: targetForm.formType,
            formTemplateId: ele.formTemplateId,
            targetForms,
            type: execAct.key,
            title: execAct.name,
            fields: targentFields,//targetForm.fields,
            fieldMapings: fieldMapings,
            filterConditions: filterConditions,
            mapFields: targentMapFields,//targetForm.mapFields,
            newfieldMapings: newfieldMapings,
            operationStatus: ele.operationStatus,


          })
        });
        debugger
        //远程推送接口配置
        let dataInterfaceList = [];
        let exteralList = businessRule.exteralList;

        remotePushConfigActionRequests && remotePushConfigActionRequests.map(remoteConfig => {
          let mappingData = []
          let remoteAssignments = _.where(remotePushAssignmentActionRequests, { remotePushConfigId: remoteConfig.id });
          let exteral = _.where(exteralList, { id: remoteConfig.sourceTypeConfigId })[0];
          remoteConfig.name = exteral.name;

          remoteAssignments.map(remoteAssignment => {
            var arr = remoteAssignment.value.split('.');
            remoteAssignment.code = arr[1];
            remoteAssignment.formCode = arr[0]
            var field = _.where(form.fields, { id: remoteAssignment.formItemId })[0]
            var parameter = _.where(exteral.sourceParameterViewResponses, { id: remoteAssignment.sourceParameterId })[0]
            //  remoteAssignment.fieldId = remoteAssignment.formItemId;
            remoteAssignment.name = parameter.name;
            remoteAssignment.controlType = field.controlType;
            let groups = [];
            if (field.groupItems) {
              for (let key in field.groupItems) {
                groups.push(field.groupItems[key])
              }
            }
            remoteAssignment.groupItems = groups;
            mappingData.push(remoteAssignment)
          })
          remoteConfig.mappingData = mappingData;
          dataInterfaceList.push(remoteConfig);
        })

        yield put({
          type: 'save',
          payload: {
            formTemplateVersionId: payload.formTemplateVersionId,
            name: pushRelationActionRequest.name,
            id: pushRelationActionRequest.id,
            currentFormField: formFields,
            pushType: _.where(triggerData, { value: pushRelationActionRequest.pushType })[0].key,
            form: { form: pushRelationActionRequest.form, formId: pushRelationActionRequest.formId },
            triggerCondition: triggerCondition,
            schedueList: schedueList,
            templateFields: form.fields,
            templateMapFields: form.mapFields,
            dataInterfaceList: dataInterfaceList,
            pushCommandActionRequests
          }
        })
      }

    },
    *detail({ payload, history }, { call, put }) {

      const { data } = yield call(detail, { entityId: payload.formTemplateVersionId })
      debugger
      if (data) {
        var forms = data.formsActionRequests;
        yield put({
          type: 'save',
          payload: {
            formTemplateVersionId: payload.formTemplateVersionId,
            formList: forms
          }
        })
      }
    },
    // *InitTemplateField({ payload, history }, { call, put }) {
    //   const result = yield call(GetTemplateFields, payload.formTemplateId)
    //   if (result) {
    //     yield put({
    //       type: 'save',
    //       payload: {
    //         formTemplateVersionId: payload.formTemplateVersionId,
    //         templateFields: result
    //       }
    //     })
    //   }
    // },
    *GetTableHeadAll({ payload, history }, { call, put }) {  // eslint-disable-line
      const { data } = yield call(GetTableHeadAll, { ...payload })
      if (data) {
        var res = comTable.getFeildName(comTable.initColumns(data));
        yield put({
          type: 'save',
          payload: {
            formTemplateVersionId: payload.formTemplateVersionId,
            currentFields: res
          }
        })
      }
    },
  },
  reducers: {
    operateShowToggle(state, action) {
      let all = state.all;
      let formState = all[action.payload.formTemplateVersionId];
      all[action.payload.formTemplateVersionId] = formState.set('operateShow', action.payload.flag)
      return { ...state, all };
    },
    save(state, action) {

      let all = state.all;
      let formState = all[action.payload.formTemplateVersionId];
      var { formTemplateVersionId, ...other } = action.payload
      for (var key in other) {
        formState = formState.set(key, other[key])
      }
      all[action.payload.formTemplateVersionId] = formState
      return { ...state, all };
    }
  }
};

// async function GetTemplateFields(templateId) {
//   var linkFormList = GetLinkFormList()
//   var formtemplate = _.where(linkFormList, { formTemplateId: templateId })[0];

//   var filterFields = GetFilterFields(formtemplate.fields)//formtemplate.fields.filter(e => { return e.formControlType !== 1 && e.valueType })
//   return filterFields;
// }
function GetFilterFields(fields) {
  return fields.filter(e => { return e.formControlType !== 1 && e.valueType });
}
// function GetLinkFormList() {
//   let formList = window.localStorage.getItem('formList')
//   let json = JSON.parse(formList);
//   return json.linkFormList
// }
