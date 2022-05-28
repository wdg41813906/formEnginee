import { parse } from 'qs';
import { AppTempBatchNew,UnPublish, Publish,CopyReport,CopyForm, ApplicationTemplateRemove, Modify, TemplateListByAppIdPaged, ReportListByAppIdPaged, GetForModify } from '../../../services/App/Application'
import { AppCateGoryGetAll, AppStoreCreate, RemoveByAppId } from '../../../services/App/AppStore'
import { message } from 'antd';
message.config({
  top: 10,
  duration: 3,
  maxCount: 1,
});
export default {
  namespace: 'applicationDetail',
  state: {
    currentTab: 'form',
    pageSize: 20,
    cateGoryList: [],
    appInfo: {},
    modifyShow: false,
    uploadCloudShow: false,
    addShow: false,
    formList: [],
    formKeyWord: "",
    formPageInfo: {},

    reportList: [],
    reportKeyWord: "",
    reportPageInfo: {},
    formReportType: "",

  },
  subscriptions: {

  },
  effects: {
    *AppCateGoryGetAll({ payload }, { call, put }) {
      yield put({ type: "showLoading" });
      const { data } = yield call(AppCateGoryGetAll, parse(payload));
      if (data) {
        yield put({
          type: 'AppCateGoryGetAllSuccess',
          payload: {
            data: data
          }
        })
      }

    },
    *CopyForm({ payload }, { call, put }){
       message.loading('处理中...')
      const { data } = yield call(CopyForm, payload.data);
       if(data){

        yield put({
          type: 'AppTempBatchNew',
          payload: {
            data:[{
              dataSourceId: data.id,
               applicationId: payload.query.applicationId, 
               dataSourceVersionId: data.formTemplateVersionId
              , DataSourceType: 1
            }],
            query:payload.query
          }
        })
      }
    },
     *AppTempBatchNew({ payload }, { call, put }) {
      message.loading();
      const { data } = yield call(AppTempBatchNew, payload.data)
      if (data.isValid) {


        message.success("保存成功!")
        yield put({
          type: 'GetTemplateListByAppIdPaged',
          payload: {
            ...payload.query
          }
        })
      }
    },
    *CopyReport({ payload }, { call, put }){
      message.loading('处理中...')
      const { data } = yield call(CopyReport, payload.data);
      if(data.isValid){
        yield put({
          type: 'GetReportListByAppIdPaged',
          payload: {
            ...payload.query
          }
        })
      }
    },
    *ApplicationTemplateRemove({ payload }, { call, put }) {
      message.loading('处理中...')
      const { data } = yield call(ApplicationTemplateRemove, payload.data);
      if (data) {
        message.success('处理成功!')
        if (payload.currentTab === 'form') {
          yield put({
            type: 'GetTemplateListByAppIdPaged',
            payload: {
              ...payload.query
            }
          })
        }else{
          yield put({
            type: 'GetReportListByAppIdPaged',
            payload: {
              ...payload.query
            }
          })
        }

      }
    },
    *RemoveByAppId({ payload }, { call, put }) {
      message.loading('处理中...')
      const { data } = yield call(RemoveByAppId, parse(payload));
      if (data) {
        message.success('处理成功!')
        yield put({
          type: 'SetAppInfo',
          payload: {
            isCloud: false
          }
        })
      }

    },

    *AppStoreCreate({ payload }, { call, put }) {
      message.loading('处理中...')
      const { data } = yield call(AppStoreCreate, (payload));
      if (data.isValid) {
        message.success('处理成功!')
        yield put({
          type: 'uploadCloudToggle',
          payload: {

          }
        })
        yield put({
          type: 'SetAppInfo',
          payload: {
            isCloud: true
          }
        })
      }
    },
    *Publish({ payload }, { call, put }) {
      message.loading('处理中...')
      const { data } = yield call(Publish, parse(payload));
      if (data) {
        message.success('处理成功!')
        yield put({
          type: 'SetAppInfo',
          payload: {
            publishStatus: 1
          }
        })

      }
    },
    *UnPublish({ payload }, { call, put }) {
      message.loading('处理中...')
      const { data } = yield call(UnPublish, parse(payload));
      if (data) {
        message.success('处理成功!')
        yield put({
          type: 'SetAppInfo',
          payload: {
            publishStatus: -1
          }
        })

      }
    },
    *Modify({ payload }, { call, put }) {
      message.loading('处理中...')
      const { data } = yield call(Modify, parse(payload));
      if (data) {
        message.success('修改成功!')
        yield put({
          type: 'querySuccess',
          payload: {
            data: payload
          }
        })
        yield put({
          type: 'ModifyToggle',
          payload: {

          }
        })
      }
    },
    *GetForModify({ payload }, { call, put }) {
      const { data } = yield call(GetForModify, parse(payload));
      if (data) {
        yield put({
          type: 'querySuccess',
          payload: {
            data
          }
        })
      }
    },
    *GetTemplateListByAppIdPaged({ payload }, { call, put }) {
      const { data } = yield call(TemplateListByAppIdPaged, parse(payload));
      if (data) {
        yield put({
          type: 'formSuccess',
          payload: {
            list: data.formTemplateList,
            pagination: data.pagination
          }
        })
      }
    },
    *GetReportListByAppIdPaged({ payload }, { call, put }) {
      const { data } = yield call(ReportListByAppIdPaged, parse(payload));
      if (data) {
        yield put({
          type: 'reportSuccess',
          payload: {
            list: data.reportList,
            pagination: data.pagination
          }
        })
      }
    }
  },
  reducers: {
    SetCurrentTab(state, action) {
      return { ...state, currentTab: action.payload.key }
    },
    AppCateGoryGetAllSuccess(state, action) {
      return { ...state, cateGoryList: action.payload.data }
    },
    SetAppInfo(state, action) {
      var appInfo = state.appInfo;
      var newAppInfo = { ...appInfo, ...action.payload }
      return { ...state, appInfo: newAppInfo }
    },
    querySuccess(state, action) {
      return { ...state, appInfo: action.payload.data }
    },
    AddToggle(state, action) {
      return { ...state, addShow: !state.addShow }
    },
    uploadCloudToggle(state, action) {

      return { ...state, uploadCloudShow: !state.uploadCloudShow }
    },
    ModifyToggle(state, action) {
      return { ...state, modifyShow: !state.modifyShow }
    },
    SetData(state, action) {

      return { ...state, ...action.payload.obj }
    },
    formSuccess(state, action) {
      return { ...state, formList: action.payload.list, formPageInfo: action.payload.pagination }
    },
    reportSuccess(state, action) {
      return { ...state, reportList: action.payload.list, reportPageInfo: action.payload.pagination }
    },
    SetFormReportType(state, action) {
      return { ...state, formReportType: action.payload.type }
    },
    ItemOver(state, action) {
      const { item, key } = action.payload;

      const appList = state[key];
      appList.forEach(element => {
        if (item.id === element.id) {
          element.hover = true;
        } else {
          element.hover = false;
        }
      });
      var obj = {};
      obj[key] = appList
      return { ...state, ...obj }
    },
    ItemOut(state, action) {
      const { item, key } = action.payload;
      const appList = state[key];
      appList.forEach(element => {
        if (item.id === element.id) {
          element.hover = false;
        }
      });
      var obj = {};
      obj[key] = appList
      return { ...state, appList }
    },
  }
}