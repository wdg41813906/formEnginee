import React, { PropTypes } from 'react';
import { connect } from 'dva';
import ApplicationCreate from '../../../components/App/Application/ApplicationCreate';
import { routerRedux, Router } from 'dva/router';
import { Guid } from '../../../utils/com';
import queryString from 'query-string';
import { FormReportType } from '../../../utils/AppStoreConfig'
const ApplicationCreateRoute = ({ history, dispatch, applicationCreate }) => {
  const {
    current, pageSize, loading, appInfo, formReportType, formList, formSelectList,
    formPageInfo, formSelectedRowKeys,hasStep
    , reportPageInfo, reportList, reportSelectList, reportSelectedRowKeys
  } = applicationCreate;
  let query = queryString.parse(history.location.search)

  
  const ApplicationProps = {
    current: current,
    pageSize: pageSize,
    loading: loading,
    appInfo: appInfo,
    formList: formList,
    formSelectList: formSelectList,
    formPageInfo: formPageInfo,
    hasStep,
    formSelectedRowKeys,
    reportPageInfo,
    reportList,
    reportSelectList,
    reportSelectedRowKeys,
    formReportType: formReportType,
    optType:query.type,
    Init(){
      if(query.tabId){
        dispatch({
          type: 'applicationCreate/CurrentThree',
        })
      }else{
        dispatch({
          type: 'applicationCreate/Init',
        })
      }
    
    },
    FormGetListPaged(pageIndex) {
      dispatch({
        type: 'applicationCreate/FormGetListPaged',
        payload: { pageIndex: pageIndex, pageSize: pageSize }
      })
    },
    ReportGetListPaged(pageIndex) {
      dispatch({
        type: 'applicationCreate/ReportGetListPaged',
        payload: { pageIndex: pageIndex, pageSize: pageSize }
      })
    },
    ReportSelectedRowKeyFn(data) {
      dispatch({
        type: 'applicationCreate/ReportSelectedRowKeyFn',
        payload: { data }
      })
    },
    ReportSelect(data) {
      dispatch({
        type: 'applicationCreate/ReportSelect',
        payload: { data }
      })
    },
    FormSelect(data) {
      dispatch({
        type: 'applicationCreate/FormSelect',
        payload: { data }
      })
    },
    FormSelectedRowKeyFn(data) {
      dispatch({
        type: 'applicationCreate/FormSelectedRowKeyFn',
        payload: { data }
      })
    },
    Save() {

      var appId=query.tabId?query.tabId:Guid();

     

      let appTemplateList = [];
      if (formReportType === FormReportType.templateForm) {
        formSelectList.forEach(ele => {
          appTemplateList.push(
            {
              dataSourceId: ele.sourceId, applicationId: appId, dataSourceVersionId: ele.versionId
              , DataSourceType: 1
            })
        })
      } else if (formReportType === FormReportType.templateReport) {
        reportSelectList.forEach(ele => {
          appTemplateList.push(
            {
              dataSourceId: ele.sourceId, applicationId: appId, dataSourceVersionId: ele.versionId
              , DataSourceType: 2
            })
        })
      }
      if(query.tabId){
        
            dispatch({
              type:'applicationCreate/AppTempBatchNew',
              payload:{
                history,
                formReportType,
                appId,
                data:appTemplateList
              }
            })
      }
      else{
     
      
      dispatch({
        type: 'applicationCreate/Save',
        payload: {
          history,
          formReportType,
          appId,
          data: {
            id: appId,
            name: appInfo.name,
            icon: appInfo.icon,
            desc: appInfo.desc,
            type: 0,
            publishStatus: 0,
            applicationTemplateActionRequests: appTemplateList
          }

        }
      })
    }
    },
    SetData(data) {
      dispatch({
        type: 'applicationCreate/SetData',
        payload: {
          appInfo: data
        }
      })
    },
    SetFormReportType(type) {
      dispatch({
        type: 'applicationCreate/SetFormReportType',
        payload: {
          type: type
        }
      })
    },
    Next() {
      dispatch({
        type: 'applicationCreate/Next'
      })
    },
    Prev() {
      dispatch({
        type: 'applicationCreate/Prev'
      })
    },
    GoTeamplateForm() {
      dispatch(routerRedux.push({
        pathname: `/main/application/teamplateForm`,
        search: `type=Modify&tabId=1`
      }))
    }

  }
  return (
    <ApplicationCreate {...ApplicationProps} />
  )

}

//监听属性，建立组件和数据的映射关系
function mapStateToProps({ applicationCreate }) {
  return { applicationCreate };
}
//关联model
export default connect(mapStateToProps)(ApplicationCreateRoute);