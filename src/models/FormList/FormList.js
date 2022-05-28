import { message } from 'antd';
import com from '../../utils/com';
import queryString from 'query-string';
import { GetListPaged } from '../../services/FormBuilder/FormBuilder';

export default {
    namespace: 'formList',
    state: {
        linkFormList: [
            // { name: '单行', id: '39dc0e99-e93c-4eca-a6e2-e784e9301c26', createTime: '2018-01-01', desc: '表单可用来搜集数据，并带有数据协作功能，适合进行数据上报' },
        ]
    },
    subscriptions: {
        Open({ dispatch, history }) {
            dispatch({
                type: 'getLinkFormList',
            })
        }
    },
    effects: {
        *getLinkFormList(action, { select, call, put }) {
            const { data } = yield call(GetListPaged, {
                PageIndex: 1,
                PageSize: 500,
            });
            yield put({
                type: 'setLinkFormList',
                linkFormList: data.formTemplateVersionList,
            })
        },

    },
    reducers: {
        setLinkFormList(state, action) {
            let linkFormList = JSON.parse(JSON.stringify(state.linkFormList));
            linkFormList = action.linkFormList;
            return { ...state, linkFormList };
        },

    }
}