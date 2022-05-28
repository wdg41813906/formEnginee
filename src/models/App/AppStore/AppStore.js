import { parse } from 'qs';
import { AppCateGoryGetAll, GetListPaged } from '../../../services/App/AppStore';
// import { pageSize } from '../../../utils/config'
export default {
  namespace: 'appStore',
  state: {
    viewShow:false,
    cateGoryList: [],
    cateGoryId: "",
    appStoreList: [],
    currentItem:{},
    appStorePageInfn: {}

  },
  subscriptions: {

  },
  effects: {
    *GetListPaged({ payload }, { call, put }) {
      const { data } = yield call(GetListPaged, parse(payload));
      if (data) {
        yield put({
          type: 'GetListPagedSuccess',
          payload: {
            list: data.appStoreList,
            pagination: data.pagination
          }
        })
      }
    },
    *AppCateGoryGetAll({ payload }, { call, put }) {

      const { data } = yield call(AppCateGoryGetAll, parse(payload));
      if (data) {
        yield put({
          type: 'querySuccess',
          payload: {
            data: data
          }
        })
        if (data.length > 0) {
          yield put({
            type: 'SetCateGoryId',
            payload: {
              id: data[0].id
            }
          })
          yield put({
            type: 'GetListPaged',
            payload: {
              pageIndex: 1, pageSize: config.pageSize, appCateGoryId: data[0].id
            }
          })

        }
      }

    },
  },
  reducers: {
    querySuccess(state, action) {
      return { ...state, cateGoryList: action.payload.data }
    },
    SetCateGoryId(state, action) {
      return { ...state, cateGoryId: action.payload.id }
    },
    ViewToggle(state, action){
      return { ...state, viewShow: !state.viewShow }
    },
    SetCurrentItem(state, action){
      const { item } = action.payload;
      return { ...state, currentItem: item}
    },
    ItemOver(state, action) {
      const { item } = action.payload;
      const appStoreList = state.appStoreList;
      appStoreList.forEach(element => {
        if (item.id === element.id) {
          element.hover = true;
        } else {
          element.hover = false;
        }
      });
      return { ...state,appStoreList }
    },
    ItemOut(state, action) {
      const { item } = action.payload;
      const appStoreList = state.appStoreList;
      appStoreList.forEach(element => {
        if (item.id === element.id) {
          element.hover = false;
        }
      });
      return { ...state,appStoreList }
    },
    GetListPagedSuccess(state, action) {
      return { ...state, appStoreList: action.payload.list, appStorePageInfn: action.payload.pagination }
    }
  }
}
