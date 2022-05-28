import { parse } from 'qs';
import { query, remove, create, update } from '../../../services/App/AppCateGory';
// import config from '../../../utils/config';
export default {
    namespace: 'appCateGory',
    state: {
        keyword: '',
        list: [],
        total: null,
        loading: false,
        current: null,
        pageSize: null,
        currentItem: {},
        modalVisible: false,
        modalType: 'create'
    },
    subscriptions: {
        sb({ history, dispatch }) {
            // 监听 history 变化，当进入 `/` 时触发 `load` action
            return history.listen(({ pathname }) => {
                if (pathname === '/') {
                    dispatch({ type: 'load' });
                }
            });
        }
    },
    effects: {
        *query({ payload }, { call, put }) {
            yield put({ type: 'showLoading' });
            const { data } = yield call(query, parse(payload));
            if (data) {
                yield put({
                    type: 'querySuccess',
                    payload: {
                        list: data.appCateGoryList,
                        total: data.pagination.totalCount,
                        current: data.pagination.pageIndex
                    }
                });
            }
        },
        *create({ payload }, { select, call, put }) {
            yield put({ type: 'hideModal' });
            yield put({ type: 'showLoading' });
            //debugger
            const { data } = yield call(create, payload);
            const pageIndex = yield select(({ appCateGory }) => appCateGory.current);
            var _this = this;
            if (data && data.isValid) {
                //debugger
                yield put({
                    type: 'query',
                    payload: { PageIndex: pageIndex, PageSize: config.pageSize }
                });
            }
        },
        *delete({ payload }, { select, call, put }) {
            //debugger
            yield put({ type: 'showLoading' });
            const { data } = yield call(remove, { EntityIdList: [payload] });
            const pageIndex = yield select(({ appCateGory }) => appCateGory.current);
            if (data && data.isValid) {
                yield put({
                    type: 'query',
                    payload: { PageIndex: pageIndex, PageSize: config.pageSize }
                });
                /*yield put({
         type: 'deleteSuccess',
         payload,
       });*/
            }
        },
        *update({ payload }, { select, call, put }) {
            yield put({ type: 'hideModal' });
            yield put({ type: 'showLoading' });
            //debugger
            const id = yield select(({ appCateGory }) => appCateGory.currentItem.id);
            const pageIndex = yield select(({ appCateGory }) => appCateGory.current);
            const newUser = { ...payload, id };
            const { data } = yield call(update, newUser);
            if (data && data.isValid) {
                yield put({
                    type: 'query',
                    payload: { PageIndex: pageIndex, PageSize: config.pageSize }
                });
                /*
         yield put({
           type:'updateSuccess',
           payload:newUser,
         })
         */
            }
        }
    },
    reducers: {
        showLoading(state, action) {
            return { ...state, loading: true };
        }, // 控制加载状态的 reducer
        showModal(state, action) {
            return { ...state, ...action.payload, modalVisible: true };
        }, // 控制 Modal 显示状态的 reducer
        hideModal(state, action) {
            return { ...state, modalVisible: false };
        },
        querySuccess(state, action) {
            //debugger
            return { ...state, ...action.payload, loading: false };
        },
        createSuccess(state, action) {
            return { ...state, ...action.payload, loading: false };
        },
        deleteSuccess(state, action) {
            const id = action.payload;
            const newList = state.list.filter(user => user.id !== id);
            return { ...state, list: newList, loading: false };
        },
        Setkeyword(state, action) {
            return { ...state, keyword: action.payload.value };
        },
        updateSuccess(state, action) {
            const updateUser = action.payload;
            const newList = state.list.map(user => {
                if (user.id === updateUser.id) {
                    return { ...user, ...updateUser };
                }
                return user;
            });
            return { ...state, list: newList, loading: false };
        }
    }
};
