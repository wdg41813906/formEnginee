import React, { PropTypes } from 'react';
import { connect } from 'dva';
import AppStore from '../../../components/App/AppStore/AppStore';
// import { pageSize} from '../../../utils/config'
const AppStoreRoute = ({ location, dispatch, appStore }) => {
  const {
    cateGoryList,cateGoryId,appStoreList,appStorePageInfn,viewShow,currentItem
    } = appStore;
    const AppStoreProps={
    appStoreList,
    cateGoryList:cateGoryList,
    appStorePageInfn,
    viewShow,
    currentItem,
    ViewToggle(){
      dispatch({
        type:"appStore/ViewToggle",
        payload:{
        
        }
      })
    },
    GetListPaged(page){
      dispatch({
        type:"appStore/GetListPaged",
        payload:{
          pageIndex:page,pageSize:config.pageSize,appCateGoryId:cateGoryId
        }
      })
    },
    SetCurrentItem(item){
      dispatch({
        type:"appStore/SetCurrentItem",
        payload:{
         item
        }
      })
    },
    ItemOver(item){
      dispatch({
        type:"appStore/ItemOver",
        payload:{
         item
        }
      })
    },
    ItemOut(item){
      dispatch({
        type:"appStore/ItemOut",
        payload:{
         item
        }
      })
    },
    TabChange(id){
      dispatch({
        type:'appStore/SetCateGoryId',
        payload:{
          cateGoryId:id
        }
      })
      dispatch({
        type:"appStore/GetListPaged",
        payload:{
          pageIndex:1,pageSize:config.pageSize,appCateGoryId:id
        }
      })
    },
    AppCateGoryGetAll(){
      dispatch({
        type:"appStore/AppCateGoryGetAll"
      })
    }
    }
    return (
      <AppStore {...AppStoreProps}/>
    )
  
}

//监听属性，建立组件和数据的映射关系
function mapStateToProps( {appStore} ) {
  return { appStore };
}
//关联model
export default connect(mapStateToProps)(AppStoreRoute);
