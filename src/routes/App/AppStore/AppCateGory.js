import React, { PropTypes } from 'react';
import { connect } from 'dva';
import List from '../../../components/App/AppCateGory/List';
import Search from '../../../components/App/AppCateGory/Search';
import AppCateGoryModal from '../../../components/App/AppCateGory/AppCateGoryModal';
// import config from '../../../utils/config';
const AppCateGory = ({ location, dispatch, appCateGory }) => {
  const {
    loading, list, total, current, field, keyword,
    currentItem, modalVisible, modalType, pageSize
    } = appCateGory;
  const userModalProps = {
    item: modalType === 'create' ? {} : currentItem,
    type: modalType,
    visible: modalVisible,
    onOk(data) {
      dispatch({
        type: `appCateGory/${modalType}`,
        payload: data
      })
    },
    onCancel() {
      dispatch({
        type: 'appCateGory/hideModal'
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
        type: 'appCateGory/query',
        payload: { PageIndex: 1, PageSize: config.pageSize }
      })
    },
    onPageChange(pageIndex, pageSize) {
      dispatch({
        type: 'appCateGory/query',
        payload: { PageIndex: pageIndex, PageSize: pageSize }
      })
    },
    onDeleteItem(id) {

      dispatch({
        type: 'appCateGory/delete',
        payload: id
      })
    },
    onEditItem(record) {
      dispatch({
        type: 'appCateGory/showModal',
        payload: {
          modalType: 'update',
          currentItem: record
        }
      })
    }
  }
  const userSearchProps = {
    field,
    keyword,
    Setkeyword(value){
        dispatch({
        type: 'appCateGory/Setkeyword',
        payload: { value}
      })
    },
    OnSearch(filedsValue) {

       dispatch({
        type: 'appCateGory/query',
        payload: { PageIndex: 1, PageSize: config.pageSize , ...filedsValue}
      })
      // dispatch({
      //   type: 'appCateGory/query',
      //   payload: filedsValue,
      // })
    },
    OnAdd() {
      dispatch({
        type: 'appCateGory/showModal',
        payload: {
          modalType: 'create'
        }
      })
    },

  };
  const UserModalGen = () =>
    <AppCateGoryModal {...userModalProps} />;
  return (
    <div>
      <Search {...userSearchProps} />
      <List {...ListProps} />
      <UserModalGen />
    </div>
  )
}

//监听属性，建立组件和数据的映射关系
function mapStateToProps( {appCateGory} ) {
  return { appCateGory };
}
//关联model
export default connect(mapStateToProps)(AppCateGory);
