import { Map, List, is } from 'immutable';
import moment from "moment";
import { GetPermission } from '../../services/Workflow/Workflow'


import table from "../Common/table"
import excel from "../Common/excel"

export default {
    namespace: 'accountBook',
    state: {
        ...table.state,
        ...excel.state,
        cooperateArr: [], //存储 初始化的 操作 权限
    },
    effects: {
        ...table.effects("accountBook"),
        *initData(action, { call, put }) {
            yield put({ type: "setHeaderAndTableData", payload: { templateId: action.payload.formTemplateId, FormTemplateVersionId: action.payload.tabId, moduleId: action.payload.moduleId } });
            yield put({ type: "getPermission", payload: { moduleId: action.payload.moduleId } });
            yield put({ type: "getTableHead", payload: { getTableBody: true, initFieldsArr: true, ...action.payload } });
        },
        /* 这里要 在 table.js 中 进行 操作，不 单独 存在 */
        *getPermission(action, { call, put }) {
            let { data } = yield call(GetPermission, { moduleId: action.payload.moduleId });
            let allAu = [];
            if (data) {
                allAu = [...data.employeeDataPermissionActionRequests, ...data.organziationDataPermissionActionRequests, ...data.roleDataPermissionActionRequests];
                if (allAu.length) {
                    allAu = allAu.reduce((prev, next) => {
                        let optItem = JSON.parse(next.operation);
                        if (optItem.rootId) {
                            let existArr = optItem[optItem.rootId];
                            if (existArr) {
                                prev.push.call(prev, ...existArr)
                            }
                        }
                        return prev;
                    }, []);
                    // 去重
                    allAu = Array.from(new Set(allAu));
                    yield put({ type: "setHeaderAndTableData", payload: { cooperateArr: allAu } });
                }
            }
        },
        ...excel.effects("accountBook"),
    },
    reducers: {
        ...table.reducers,
        ...excel.reducers
    }
}
