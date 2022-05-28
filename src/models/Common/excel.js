import { Map, List, is } from 'immutable';
import moment from "moment";
import { getExcelSheets, getExcel, importExcelData } from "../../services/DataManage/DataManage"


const state = {
    // 导入文件一些列 数据
    importSteps: 1, //导入步骤
    stepsTwoTableData: [], //浏览步骤对应的数据
    excelName: "",//导入的excel的标识
    excelSheetsArr: [],//存储 excel 的 sheets 数组
    currentExcelValue: 0,//默认 excel 的 索引

    importExcelResultData: [], //存储 传给 后台的 数据关系
    importExcelStatus: false,//导入 excel 表格 是否成功
}

const effects = (namespace) => {
    return {
        // 导入 表格 数据
        *importFormData(action, { call, put, select }) {
            // const {payload:{importExcelResultData}} = action;
            let { excelName, currentExcelValue, importExcelResultData, FormTemplateVersionId, importSteps } = yield select((state) => {
                return state[namespace]
            });
            let data = null;
            if (importExcelResultData.length) {
                let { data: newData } = yield call(importExcelData, { FormItemValueActionRequests: importExcelResultData, FileName: excelName, Index: currentExcelValue, FormTemplateVersionId });
                data = newData;
            }
            let importExcelStatus = data ? data.isValid : false;
            yield put({ type: "changeImportExcelStatus", payload: { importExcelStatus } });
            yield put({ type: "changeSteps", payload: { steps: importSteps + 1 } })

        },
        *getExcelSheets(action, { call, put, select }) {
            let { excelName } = yield select((state) => {
                //console.log(state);
                let { excelName } = state[namespace];
                return {
                    excelName
                }
            })
            let { data } = yield call(getExcelSheets, { fileName: excelName });
            if (data) {
                yield put({ type: "storeExcelSheets", payload: { data } });
            }
        },
        *getExcel(action, { call, put, select }) {
            let { index, excelName } = action.payload;
            let { data } = yield call(getExcel, { index, fileName: excelName });
            if (data) {
                yield put({ type: "storeExcel", payload: { data: data.excelData, index: index } });
            }
        }
    }
}

const reducers = {
    changeImportExcelStatus(state, action) {
        const { importExcelStatus } = action.payload;
        return { ...state, importExcelStatus };
    },
    storeImportExcelResultData(state, action) {
        const { payload: { importExcelResultData} } = action;
        return { ...state, importExcelResultData }
    },
    // 文件引入的逻辑
    changeSteps(state, action) {
        let { steps } = action.payload;
        return { ...state, importSteps: steps }
    },
    importExcel(state, action) {
        let { excelData, excelName } = action.payload;
        return { ...state, stepsTwoTableData: JSON.parse(excelData), excelName }
    },
    // sheets 数据存储
    storeExcelSheets(state, action) {
        let { data } = action.payload;
        return { ...state, excelSheetsArr: data }
    },
    // 存储 sheets 的 data 数据
    storeExcel(state, action) {
        let { data, index } = action.payload;
        data = JSON.parse(data);
        return { ...state, stepsTwoTableData: data, currentExcelValue: index }
    }
}

export default {
    state, effects, reducers
}
