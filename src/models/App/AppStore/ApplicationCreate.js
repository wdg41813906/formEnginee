import { parse } from 'qs';
import { New, FormGetListPaged, AppTempBatchNew, ReportGetListPaged } from '../../../services/App/Application';
import { Map, List, fromJS } from 'immutable'
import { FormReportType } from '../../../utils/AppStoreConfig'
import { message } from 'antd';
message.config({
  top: 10,
  duration: 3,
  maxCount: 1,
});

function GoNext(payload,next){
  if(payload.formReportType===FormReportType.blockFrom){
    payload.history.replace({
      pathname: '/main/dic',
      search:`tabId=${payload.appId}&type=Add`,
    }) 

  }else if(payload.formReportType===FormReportType.blockReport){
    payload.history.replace({
      pathname: '/main/ledger/ledgerIndex',
      search:`tabId=${payload.appId}&type=Add`,
    }) 

  }else{
    next();
  }
}
export default {
  namespace: 'applicationCreate',
  state: {
    current: 0,
    pageSize: 5,
    loading: false,
    hasStep: true,
    appInfo: {
      name: "",
      icon: "",
      desc: ""
    },
    formReportType: "",
    /** */
    formSelectedRowKeys: [],
    formList: [],
    formPageInfo: {},
    formSelectList: [],

    /** */
    reportSelectedRowKeys: [],
    reportList: [],
    reportPageInfo: {},
    reportSelectList: []

  },
  subscriptions: {

  },
  effects: {
    *AppTempBatchNew({ payload }, { call, put }) {
      message.loading();
      const { data } = yield call(AppTempBatchNew, payload.data)
      if (data.isValid) {


        message.success("保存成功!")
      
        GoNext(payload,function(){
          payload.history.goBack();
        })
       
      }
    },
    *ReportGetListPaged({ payload }, { call, put }) {
      yield put({
        type: 'Loading'
      })
      const { data } = yield call(ReportGetListPaged, parse(payload));
      if (data) {
        yield put({
          type: 'ReportGetSuccess',
          payload: {
            pagination: data.pagination,
            list: data.reportList
          }
        })
        yield put({
          type: 'Loading'
        })
      }
    },
    *FormGetListPaged({ payload }, { call, put }) {
      yield put({
        type: 'Loading'
      })
      const { data } = yield call(FormGetListPaged, parse(payload));
      if (data) {
        yield put({
          type: 'FormGetSuccess',
          payload: {
            pagination: data.pagination,
            list: data.formTemplateVersionList
          }
        })
        yield put({
          type: 'Loading'
        })
      }
    },

    *Save({ payload }, { call, put }) {
      message.loading();
      const { data } = yield call(New, parse(payload.data))
      if (data.isValid) {
        message.success("保存成功!")

        // if(payload.formReportType===FormReportType.blockFrom){
        //   payload.history.replace({
        //     pathname: '/main/dic',
        //     search:`tabId=${payload.data.id}&type=Add`,
        //   }) 

        // }else if(payload.formReportType===FormReportType.blockReport){
        //   payload.history.replace({
        //     pathname: '/main/ledger/ledgerIndex',
        //     search:`tabId=${payload.data.id}&type=Add`,
        //   }) 

        // }else{
        
          GoNext(payload,function(){
            payload.history.push({
              pathname: '/main/application',
              // search: realPath.replace(tempLink, '')
            })
          })
      
      //}
      }
    }
  },
  reducers: {
    Clear(state){
      return {...state,current:0,appInfo:{ name: "", icon: "",desc: ""} }
    },
    Loading(state, action) {

      return { ...state, loading: !state.loading }
    },
    ReportGetSuccess(state, action) {
      return { ...state, reportList: action.payload.list, reportPageInfo: action.payload.pagination }
    },

    FormGetSuccess(state, action) {
      return { ...state, formList: action.payload.list, formPageInfo: action.payload.pagination }
    },
    ReportSelectedRowKeyFn(state, action) {
      return { ...state, reportSelectedRowKeys: action.payload.data }
    },
    ReportSelect(state, action) {
 
      var reportSelectedRowKeys=state.reportSelectedRowKeys;
      var reportSelectList=state.reportSelectList;

      var list=action.payload.data ;
      var concatList=reportSelectList.concat(list);
      var newList=[]
      concatList.forEach(ele=>{
        if(reportSelectedRowKeys.indexOf(ele.sourceId)>-1){
         newList.push(ele)
        }
      })
      return { ...state, reportSelectList:newList }
    },


    FormSelectedRowKeyFn(state, action) {
      return { ...state, formSelectedRowKeys: action.payload.data }
    },
    FormSelect(state, action) {
      
         var formSelectedRowKeys=state.formSelectedRowKeys;
         var formSelectList=state.formSelectList;

         var list=action.payload.data ;
         var concatList=formSelectList.concat(list);
         var newList=[]
         concatList.forEach(ele=>{
           if(formSelectedRowKeys.indexOf(ele.versionId)>-1){
            newList.push(ele)
           }
         })

      return { ...state, formSelectList: newList }
    },
    SetData(state, action) {
      return { ...state, appInfo: action.payload.appInfo }
    },
    SetFormReportType(state, action) {
      return { ...state, formReportType: action.payload.type }
    },
    Init(state, action) {
      return { ...state, current: 0, hasStep: true }
    },
    CurrentThree(state, action) {
      return { ...state, current: 2, hasStep: false }
    },

    Next(state, action) {
      const current = state.current + 1;

      return { ...state, current: current }
    },

    Prev(state, action) {
      const current = state.current - 1;

      return { ...state, current: current }
    },
    AddToggle(state, action) {
      return { ...state, addShow: !state.addShow }
    },
  }
}