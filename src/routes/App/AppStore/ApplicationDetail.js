import React, { PropTypes } from 'react';
import { connect } from 'dva';
import queryString from 'query-string';
import ApplicationDetail from '../../../components/App/Application/ApplicationDetail';
import {routerRedux,Router} from 'dva/router';
const ApplicationDetailRoute = ({ history, dispatch, applicationDetail }) => {
  const {
    currentTab,appInfo,cateGoryList,addShow,modifyShow,uploadCloudShow,pageSize,formList,formKeyWord,formPageInfo,reportList,reportPageInfo,reportKeyWord
  } = applicationDetail;
  let query = queryString.parse(history.location.search)
  const ApplicationProps = {
    currentTab,
    appInfo,
    cateGoryList,
    addShow,
    modifyShow,
    uploadCloudShow,
    pageSize,
    formList,
    formPageInfo,
    reportList,
    reportPageInfo,
    SetCurrentTab(key){
      dispatch({
        type: "applicationDetail/SetCurrentTab",
        payload:{
          key
        }
      })
    },
    AppCateGoryGetAll(){
      dispatch({
        type: "applicationDetail/AppCateGoryGetAll",
      })
    },
    AppStoreCreate(typeId){
      dispatch({
        type: "applicationDetail/AppStoreCreate",
        payload:{
          AppCateGoryId:typeId,ApplicationId:appInfo.id,
        }
      })
    },
    CopyForm(item){
       var queryJson={
         applicationId: query.tabId,
          pageIndex:formPageInfo.pageIndex,
          pageSize:pageSize,
          keyWord:formKeyWord
       }
       dispatch({
        type: "applicationDetail/CopyForm",
        payload:{
          data:{
            entityId:item.id,
          
          },
          query:queryJson
        }
        
        })
    },
    CopyReport(item){
      var queryJson={ applicationId: query.tabId,pageIndex:reportPageInfo.pageIndex,pageSize:pageSize,
        keyWord:reportKeyWord};
      dispatch({
        type: "applicationDetail/CopyReport",
        payload:{
          data:{
            appTemplateRequest:{id:item.applicationTemplateId,DataSourceId:item.id,ApplicationId:query.tabId}
           
          },
           query:queryJson

          
        }
      })
    },
    ApplicationTemplateRemove(id){
      var queryJson={};
      if(currentTab==='form'){
        queryJson={applicationId: query.tabId,
            pageIndex:formPageInfo.pageIndex,
            pageSize:pageSize,
            keyWord:formKeyWord}
      }else{
        queryJson={ applicationId: query.tabId,pageIndex:reportPageInfo.pageIndex,pageSize:pageSize,
          keyWord:reportKeyWord}
      }
      dispatch({
        type: "applicationDetail/ApplicationTemplateRemove",
        payload:{
          data:{
            entityIdList:[id],
          },
          currentTab,
           query:queryJson

          
        }
      })
    },
    RemoveByAppId(){
      dispatch({
        type: "applicationDetail/RemoveByAppId",
        payload:{
          appId:appInfo.id,
        }
      })
    },
    
    ToAdd(type){
      dispatch(routerRedux.push({
        pathname:`/main/application/create`,
        search:`type=${type}&tabId=${query.tabId}`
      }))
    },
    ModifyToggle(){
      dispatch({
        type: "applicationDetail/ModifyToggle",
      })
    },
    uploadCloudToggle(){
      dispatch({
        type: "applicationDetail/uploadCloudToggle",
      })
    },
    
    SetData(obj){
      dispatch({
        type: "applicationDetail/SetData",
        payload: {
          obj
        }
      })
    },
    Publish(){
      dispatch({
        type: "applicationDetail/Publish",
        payload: {
          entityIdList:[appInfo.id]
        }
      })
    },
    UnPublish(){
      dispatch({
        type: "applicationDetail/UnPublish",
        payload: {
          entityIdList:[appInfo.id]
        }
      })
    },
    Modify(data){
      dispatch({
        type: "applicationDetail/Modify",
        payload: {
          id: query.tabId,...data
        }
      })
    },
    GetForModify() {
      dispatch({
        type: "applicationDetail/GetForModify",
        payload: {
          entityId: query.tabId
        }
      })
    },
    GetTemplateListByAppIdPaged(page){
      
      dispatch({
        type: "applicationDetail/GetTemplateListByAppIdPaged",
        payload: {
          applicationId: query.tabId,
          pageIndex:page,
          pageSize:pageSize,
          keyWord:formKeyWord
        }
      })
    },
    GetReportListByAppIdPaged(page){
      dispatch({
        type: "applicationDetail/GetReportListByAppIdPaged",
        payload: {
          applicationId: query.tabId,pageIndex:page,pageSize:pageSize,
          keyWord:reportKeyWord
        }
      })
    },
    ItemOver(item,key){
      dispatch({
        type: "applicationDetail/ItemOver",
        payload: {
          item:item,key
        }
      })
    },
    ItemOut(item,key){
      dispatch({
        type: "applicationDetail/ItemOut",
        payload: {
          item:item,key
        }
      })
    },
    GoReport(item){
      dispatch(routerRedux.push({
        pathname:`/main/ledger/ledgerIndex`,
        search:`type=Modify&tabId=${item.id}`
      }))
    },
     GoForm(item){
      dispatch(routerRedux.push({
        pathname:`/main/dic`,
        search:`type=modify&tabId=${item.id}`
      }))
    },
    

  }
  return (
    <ApplicationDetail {...ApplicationProps} />
  )

}

//监听属性，建立组件和数据的映射关系
function mapStateToProps({ applicationDetail }) {
  return { applicationDetail };
}
//关联model
export default connect(mapStateToProps)(ApplicationDetailRoute);