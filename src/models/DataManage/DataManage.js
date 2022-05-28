import {Map, List, is} from 'immutable';
import moment from "moment";
import {Guid, optionObj, dealConfigArr} from "../../utils/com";
import {getLocation, getExcelSheets, getExcel, importExcelData} from "../../services/DataManage/DataManage"

import table from "../Common/table"
import excel from "../Common/excel"

export default {
    namespace: 'dataManage',
    state: {
        ...table.state,
        menuOperate: [
            {icon: "plus", name: "批量操作"},
            {icon: "plus", name: "批量导出附件"},
            {icon: "plus", name: "批量打印二维码"},
        ],
        isFixedFilter: false,
        // 导入文件一些列 数据
        ...excel.state,
        sorts: null,//排序
    },
    effects: {
        ...table.effects("dataManage"),
        * initData(action, {call, put}) {
            yield put({type: "setHeaderAndTableData",
                payload: {
                    templateId: action.payload.formTemplateId,
                    FormTemplateVersionId: action.payload.tabId,
                    moduleId: action.payload.moduleId
                }
            });
            yield put({type: "getTableHead", payload: {getTableBody: true, initFieldsArr: true, ...action.payload}});
        },
        * getLocation(action, {call, put}) {
            let tempObj = action.payload, targetObj = {};
            if (tempObj.type !== "") {
                targetObj = {[tempObj["type"]]: tempObj.value};
            }
            let {data} = yield call(getLocation, targetObj);
            if (data) {
                yield put({type: "setLocationArr", payload: {data, id: tempObj.id, type: tempObj.type}});
            }
        },
        // 导入 表格 数据
        ...excel.effects("dataManage"),
    },
    reducers: {
        ...table.reducers,
        // 对于筛选条件的逻辑
        isFixedFilterModal(state, action) {
            let {isFixedFilter} = state, {isFixed} = action.payload;
            return {...state, isFixedFilter: isFixed === undefined ? (!isFixedFilter) : isFixed};
        },
        ...excel.reducers
    }
}
