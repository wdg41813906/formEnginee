import React, { PropTypes } from 'react';
import { connect } from 'dva';
import {routerRedux,Router} from 'dva/router'
import UserList from '../../../components/Dashboard/List/List'
import UserSearch from '../../../components/Dashboard/List/Search';
// import config from '../../../utils/config';
const Users = ({  dispatch, ledgerList,history }) => {
  const {
    loading, list, total, current, field, keyword,
    currentItem, modalVisible, modalType, pageSize
  } = ledgerList;
  const userModalProps = {
    item: modalType === 'create' ? {} : currentItem,
    type: modalType,
    visible: modalVisible,
    onOk(data) {
      dispatch({
        type: `users/${modalType}`,
        payload: data
      })
    },
    onCancel() {
      dispatch({
        type: 'users/hideModal'
      })
    }
  };
  const ListProps = {
    dataSource: list,
    loading,
    total,
    current,
    Init() {
      dispatch({
        type: 'ledgerList/query',
        payload: { pageIndex: 1, pageSize: config.pageSize }
      })
    },
    onPageChange(pageIndex, pageSize) {

      dispatch({
        type: 'ledgerList/query',
        payload: { pageIndex: pageIndex, pageSize: pageSize }
      })
    },
    onDeleteItem(id) {

      dispatch({
        type: 'ledgerList/delete',
        payload: id
      })
    },
    onEditItem(record) {
    if(history.location.pathname==="/ledger"){
        dispatch(routerRedux.push({
            pathname:`/ledgerIndex`,
            search:`type=Modify&tabId=${record.id}`
        }))
    }else {
        dispatch({
            type:'appMain/ChangePanesActiveKey',
            payload:{
                activeKey:`/main/ledger/ledgerIndex?type=Modify&tabId=${record.id}`,
                title:record.name
            }
        })
        dispatch({
          type:'ledgerIndex/HiddrenPriview'
        })
        dispatch(routerRedux.push({
            pathname:`/main/ledger/ledgerIndex`,
            search:`type=Modify&tabId=${record.id}`
        }))
    }


    //   dispatch({
    //     type: "appMain/toOtherLink",
    //     payload: {
    //         key:'ledgerIndex',
    //         id: record.id,
    //         title: record.name,
    //         history,
    //         param: {type: 'Modify'}
    //     }
    // });

    }
  }
  const userSearchProps = {
    field,
    keyword,
    OnSearch(filedsValue) {

      dispatch({
        type: 'ledgerList/query',
        payload:{pageIndex: 1, pageSize: config.pageSize,...filedsValue} ,
      })
    },
    OnAdd() {

      dispatch({
        type:'appMain/ChangePanesActiveKey',
        payload:
        {
         activeKey:`/main/ledger/ledgerIndex?type=Add`,
         title:"新增仪表盘"
       }
      })
      dispatch({
        type:'ledgerIndex/AddInit'
      })
      dispatch({
        type:'ledgerIndex/HiddrenPriview'
      })
      
      dispatch(routerRedux.push({
        pathname:'/main/ledger/ledgerIndex',
        search:"type=Add"
      }))
   ///   history.replace({
//pathname:'/main/ledgerIndex',
  //      search:"type=Add",
    //  })
    //  location.push('#/main/ledgerIndex');
    //  location.reload()
     // history.push('ledgerIndex?type=Add')

    },

  };

  return( <div>
    <UserSearch {...userSearchProps} />
    <UserList {...ListProps} />

  </div>)
}

//监听属性，建立组件和数据的映射关系
function mapStateToProps({ ledgerList }) {
  return { ledgerList };
}

//关联model
export default connect(mapStateToProps)(Users);
