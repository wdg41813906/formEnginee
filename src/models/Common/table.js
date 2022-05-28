import { Map, List, is } from 'immutable';
import moment from "moment";
import { dealConfigArr } from "../../utils/com";
import { detail as getTableHeadNew } from '../../services/FormBuilder/FormBuilder';
import {
    GetTableHead,
    GetTableBody,
    deleteRow,
    getJSON,
    setJSON,
    modifyJSON,
    getTableHeadJSON
} from "../../services/DataManage/DataManage"
import { GetPermission } from '../../services/Workflow/Workflow'
import JSONType from "../../enums/GetJSONType"
import { cancelProcedure } from '../../services/Workflow/Workflow'
import { local } from 'd3-selection';
import { Guid } from "../../utils/com"
// import config from "../../utils/config";
import { message } from 'antd'

// 对于 需要 特殊 处理 的 表头
const groupArr = ["SingleDropDownList", "SingleRadio", "CheckBoxes", "MutiDropDownList", "Member", "Department", "TreeSelectCom"];
/**
 * 数据管理
 * @param {*} columns
 */
const getTitle = (item, anotherColumns, nameList) => {
    nameList.unshift(item.title);
    if (!item.parentId) return nameList;
    let parentColumn = anotherColumns.filter(column => column.id === item.parentId)[0];
    return getTitle(parentColumn, anotherColumns, nameList);
}

function getFeildName(columns) {
    let dataColumns = columns.filter(item => item.isData);
    let anotherColumns = columns.filter(item => !item.isData);
    // console.log(dataColumns);
    return dataColumns.reduce((prev, next) => {
        let nameList = getTitle(next, anotherColumns, []);
        nameList = nameList.join(".");
        prev.push({
            name: nameList,
            type: next.type,
            dataIndex: next.dataIndex,
            id: next.id,
            code: next.code,
            property: next.property,
            isMain: next.isMain,
            isPrimaryKey: next.isPrimaryKey,
            formId: next.formId,
            controlType: next.controlType,
            parentId: next.parentId
        });
        return prev;
    }, [])
}

/* 初始化 tableBody 的 数据 */
const _initTableBody = (bodyRows) => {
    let groupBodyRows = bodyRows.reduce((prev, next) => {
        const rowIndex = next.rowIndex;
        !prev[rowIndex] && (prev[rowIndex] = []);
        prev[rowIndex].push(next);
        return prev;
    }, {});
    return Object.keys(groupBodyRows).reduce((prev, next) => {
        let rows = groupBodyRows[next];
        // rows 是一个 合并的 总行数
        let resultRows = rows.reduce((cP, cN, cIndex) => {
            let tempObj = {}, { cells, formInstanceId, workFlowId, workFlowStatus } = cN;
            tempObj.key = formInstanceId + cIndex;
            tempObj.mainId = formInstanceId;
            tempObj.maxRowSpan = rows.length;
            tempObj.index = cIndex;
            tempObj.orderIndex = next;
            tempObj.workFlowId = workFlowId;
            tempObj.workFlowStatus = workFlowStatus;
            cells.forEach(item => {
                // 对于 数组型 的 类型 转换
                item.value && /^\[[\W\w]*\]$/ig.test(item.value) && (item.value = JSON.parse(item.value).join(","));
                if (item.id) {
                    if (cIndex === 0) {
                        tempObj[item.id] = { isMain: item.isMain ? item.isMain : false, value: item.value };
                    } else {
                        !item.isMain && (tempObj[item.id] = { isMain: false, value: item.value });
                    }
                }
            })
            cP.push(tempObj);
            return cP;
        }, []);
        prev = prev.concat(resultRows);
        return prev;
    }, []);
}
/* 初始化 columns 的 宽度 ，排序以及 渲染方式 */
const _initColumnsConfig = (column) => {
    let columnConfig = {};
    if (column.isData) {
        switch (column.type) {
            case "string":
                columnConfig.width = columnConfig.cusWidth = 175;
                columnConfig.sorterCustom = true;
                break;
            case "number":
                columnConfig.width = columnConfig.cusWidth = 150;
                columnConfig.sorterCustom = true;
                break;
            case "date":
                columnConfig.width = columnConfig.cusWidth = 200;
                columnConfig.sorterCustom = true;
                break;
            case "select":
                columnConfig.width = columnConfig.cusWidth = 175;
                columnConfig.sorterCustom = true;
                break;
            case "location":
                columnConfig.width = columnConfig.cusWidth = 175;
                columnConfig.sorterCustom = true;
                break;
            case "attach":
                columnConfig.width = columnConfig.cusWidth = 175;
                columnConfig.sorterCustom = true;
                break;
            default:
                columnConfig.width = columnConfig.cusWidth = 150;
                columnConfig.sorterCustom = true;
        }
        columnConfig.render = (value, row, index) => {
            if (!value) {
                return {
                    children: "",
                    props: {
                        colSpan: 0,
                        rowSpan: 0
                    }
                }
            }
            if (value["isMain"]) {
                return {
                    children: value["value"],
                    props: {
                        rowSpan: row.maxRowSpan
                    }
                }
            } else {
                return {
                    children: value["value"]
                }
            }
        }
    }
    return columnConfig;
}
/* 初始化 columns item*/
const _initColumns = (columns) => {
    const topTableColumn = columns.filter(item => !item.parentId)[0];
    const mainColumns = columns.filter(item => item.parentId);
    // 获取所有 的 普通 控件组 的 项
    const groupKeyValueItems = mainColumns.filter(item => (groupArr.indexOf(item.areaType) !== -1));
    const resultColumns = mainColumns.filter(item => !(groupKeyValueItems.filter(g => (g.id === item.parentId)).length))
    const valueItemsObj = groupKeyValueItems.reduce((prev, next) => {
        // let existItem = mainColumns.filter(item => (item.parentId === next.id && item.title === "名称"))[0];
        let existItem = mainColumns.filter(i => (i.parentId === next.id))[0];
        if (existItem) {
            existItem.title = next.title;
            existItem.parentId = next.parentId;
            prev[next.id] = existItem;
        }
        return prev;
    }, {});
    return resultColumns.reduce((prev, next) => {
        let tempObj = {}, result = valueItemsObj[next.id] ? valueItemsObj[next.id] : next;
        let { id, isData, title, parentId, type, code, isMain, isPrimaryKey, formId, controlType, show, property } = result;
        tempObj.property = property;
        tempObj.id = id;
        tempObj.dataIndex = id;
        tempObj.key = id;
        tempObj.isData = isData;
        tempObj.title = title;
        tempObj.type = type;
        tempObj.code = code;
        tempObj.show = show;
        tempObj.isMain = isMain;
        tempObj.formId = formId
        tempObj.isPrimaryKey = isPrimaryKey;
        tempObj.controlType = controlType;
        tempObj.parentId = topTableColumn.id === parentId ? null : parentId;
        tempObj = { ...tempObj, ..._initColumnsConfig(result) };
        prev.push(tempObj)
        return prev;
    }, []);
}

/* 条件筛选 tableData 处理 数据 */
/*
    {
    "包含":{value: "0", condition: "{0} in(value)" },
    "不包含":{value: "1", condition: "{0} not in (value)" },
    "为空":{value: "2", condition: "{0} is null" },
    "不为空":{value: "3", condition: "{0} is not null" },
    "等于":{ value: "4", condition: "{0}=value" },
    "不等于":{value: "5", condition: "{0}<>value" },
    "等于任意一个":{value: "6", condition: "{0} in (value)" },
    "不等于任意一个":{value: "7", condition: "{0} not in (value)" },
    "大于":{ value: "8", condition: "{0}>value" },
    "大于等于":{value: "9", condition: "{0} >=value" },
    "小于":{value: "10", condition: "{0}<value" },
    "小于等于":{value: "11", condition: "{0}<=value" },
    "选择范围":{value: "12", condition: "{0} between value and value" },
    "属于":{value: "13", condition: "{0} like '%value%'" },
    "不属于":{value: "14", condition: "{0} not like '%value%'" },
}
*/
const _dealCondition = (condition, value, type) => {
    let express = "", deepValueCopy = value instanceof Array ? List(value).toJS() : value;
    let getDetailCondition = dealConfigArr.filter(item => item.value === condition)[0]["condition"];
    (type === "member" || type === "department") && (deepValueCopy = deepValueCopy instanceof Array ? deepValueCopy.map(v => v.id) : deepValueCopy);
    if (value instanceof Array && condition !== "12") {
        if (condition === "4") {
            deepValueCopy = deepValueCopy.sort().join(",")
        } else {
            deepValueCopy = deepValueCopy.map(v => `${v}`).join(",");
        }
    }
    switch (condition) {
        case "0":
        case "1":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "10":
        case "11":
        case "13":
        case "14":
            express = getDetailCondition.replace("value", deepValueCopy);
            break;
        case "12":
            // console.log(express);
            express = getDetailCondition.replace(/(value1|value2)/ig, (value, index) => (value === "value1" ? deepValueCopy[0] : deepValueCopy[1]));
            break;
        default:
            express = getDetailCondition;
    }
    return express;
}
const _dealDataTable = (filterConditionArr) => {
    debugger
    return filterConditionArr.reduce((prev, next) => {
        if (next.value instanceof Array) {
            if (!next.value.length) return prev;
        }
        else {
            if (!next.value && next.condition !== "2" && next.condition !== "3" && (next.type === "date" || next.type === "datetime")) {
                next.extendedType == "0";
            }
        }
        let tempObj = {};
        tempObj.Id = next.code;
        if (next.sid === "system") {
            tempObj.ConditionGroup = "";
            tempObj.ParamsType = 0;
            tempObj.Value = null;
            tempObj.Format = null;
            tempObj.isSystemField = true;
        }
        if (next.type === "date" || next.type === "datetime") {
            const dateType = next.isChangeTime ? "datetime" : "date";
            tempObj.format = dateType;
            if (next.value instanceof Array) {
                next.value = next.value.map(item => (next.isChangeTime ? moment(item).format("YYYY-MM-DD HH:mm:ss") : moment(item).format("YYYY-MM-DD")));
            } else {
                next.value = next.value ? (next.isChangeTime ? moment(next.value).format("YYYY-MM-DD HH:mm:ss") : moment(next.value).format("YYYY-MM-DD")) : null;
            }
        }
        tempObj.ExtendedType = next.totalType === undefined ? "0" : next.totalType;
        tempObj.Type = next.type;
        /* if (next.type === "number" && ["8", "9", "10", "11"].indexOf(next.condition) !== -1) {
            next.value = 0;
        } */
        tempObj.Condition = _dealCondition(next.condition, next.value, next.type);
        if (next.extendedType !== "0" && (next.type === "date" || next.type === "datetime")) {
            tempObj.Condition = "{0} {dynamic}";
            tempObj.ParamsType = 3;
            tempObj.Value = next.extendedType;
        }
        // console.log(tempObj);
        prev.push(tempObj);
        return prev;
    }, []);
}
/* 处理 所有的 叶子 节点 的 显示与否 先留着 */
const dealLeafColumns = (columns, newFalseItemsObj = {}) => {
    /*以 叶子节点 为基础，找出 他的 父级，让后 把 父级 这一层 的 show 属性 高了，在以 当前 父级作为 叶子节点 往上寻找，直到 根节点 */
    let parentIds = columns.map(item => item.parentId);
    if (!parentIds.length) return;
    // 叶子节点
    let leafColumns = columns.filter(item => !parentIds.some(p => p === item.id));
    let otherColumns = columns.filter(item => parentIds.some(p => p === item.id));
    leafColumns.reduce((prev, next) => {
        if (next.show === false) {
            prev[next.parentId] = prev[next.parentId] ? prev[next.parentId] : [];
            prev[next.parentId].push(next);
        }
        return prev;
    }, newFalseItemsObj);
    otherColumns.length && dealLeafColumns(otherColumns, newFalseItemsObj);
    return newFalseItemsObj
}
/* 初始化 结构表头 */
const filterHeaderByAu = (columns, showFields) => {
    columns = columns.map(item => {
        item.isData && (item.show = showFields.some(f => f === item.id));
        return item;
    });
    const _dealColumns = (columns) => {
        if (!columns.some(item => item.show === false)) return columns;
        let isFalseItemsObj = columns.reduce((prev, next) => {
            if (next.show === false) {
                prev[next.parentId] = prev[next.parentId] ? prev[next.parentId] : [];
                prev[next.parentId].push(next);
            }

            return prev;
        }, {});
        columns.forEach(column => {
            if (!column.isData) {
                if (isFalseItemsObj[column.id] && columns.filter(item => item.parentId === column.id).length === isFalseItemsObj[column.id].length) {
                    column.show = false;
                } else {
                    column.show = true;
                }
            }
        });
        return columns;
    }
    return _dealColumns(columns).filter(item => item.show !== false);

}
/* 对于 表头 结构 ，初始化 权限 数据 */
const initAuthorityData = (authorityData) => {
    let allAu = [], resultAu = { operation: [], showFields: [] };
    if (authorityData) {
        allAu = [...authorityData.employeeDataPermissionActionRequests, ...authorityData.organziationDataPermissionActionRequests, ...authorityData.roleDataPermissionActionRequests];
        if (allAu.length) {
            allAu.reduce((prev, next) => {
                let optItem = JSON.parse(next.operation),
                    formItem = JSON.parse(next.formItem);
                if (optItem.rootId) {
                    let existArr = optItem[optItem.rootId];
                    if (existArr) {
                        prev.operation.push.call(prev.operation, ...existArr)
                    }
                }
                if (formItem.show && formItem.show.length) {
                    prev.showFields.push.call(prev.showFields, ...formItem.show);
                }
                return prev;
            }, resultAu);
            resultAu.operation = Array.from(new Set(resultAu.operation));
            resultAu.showFields = Array.from(new Set(resultAu.showFields));
        }
    }
    return resultAu;
}
const state = {
    columns: [], //这里 的 值 加上 show 字段，用于 做 伪删除；
    tableData: null,
    // 这个数据用于 条件筛选（如果 筛选 条件 不只是 对于 字段的 那在 另说），同时用于 字段显示
    fieldNameArr: [], //存储 所有的 字段,isShow来标识是否显示此字段,isFilter 标识当前字段是否 用于 条件筛选 [{name:"name",show:true,type:"string",dataIndex:"gender(这个应该是 对于 字段的唯一标识符)",isFilter:true,id:"1232-232dsfs-323"}]
    //放到 组件里去filterConditionArr:[],//存储 筛选条件的所有数据 {name:"name",show:true,type:"string",dataIndex:"gender(这个应该是 对于 字段的唯一标识符)",isFilter:true,id:"1232-232dsfs-323",value:"",condition:"",extendedType:0}//condition用于获取 对比关系,extendedType针对 日期类型 的扩展字段
    filterConditionArr: [], //需要全局存储一个
    templateId: null,
    FormTemplateVersionId: null,//表单模板版本号
    moduleId: null, //模板id
    jsonId: null, // 数据配置项的 id

    procedureState: "-1", //流程 的状态
    // 分页 的 值
    pageIndex: 1,
    pageSize: 20,
    totalCount: 0,

    loading: true,//对于 table 的 loading 加载 配置
}
const effects = (namespace) => {
    return {
        /* 删除 项 */
        * deleteOperation(action, { call, put, select }) {
            const { FormTemplateVersionId } = yield select((state) => {
                return state[namespace]
            });
            let { data } = yield call(deleteRow, { FormTemplateVersionId, FormInstanceIds: action.payload.delArr });
            if (data && data.isValid) {
                yield put({ type: "setHeaderAndTableData", payload: { pageIndex: 1, loading: true } });
                yield put({ type: "getTableBody", payload: { pageIndex: 1 } });
            }
        },
        /* 分页的 方法 */
        * changePage(action, { call, put, select }) {
            const { filterConditionArr, fieldNameArr, sorts } = yield select((state) => {
                return state[namespace]
            });
            const showFieldsIdsArr = fieldNameArr.reduce((prev, next) => {
                if (next.show) {
                    // prev.push(next.id);
                    prev.push(next.code);
                }
                return prev;
            }, []);
            yield put({ type: "setHeaderAndTableData", payload: { ...action.payload, loading: true } });
            yield put({
                type: "getTableBody",
                payload: {
                    fieldArr: showFieldsIdsArr,
                    ConditionContainer: _dealDataTable(filterConditionArr),
                    sorts, ...action.payload
                }
            });
        },
        /* 改变 字段 排序的 方式 */
        * changeSortsArr(action, { call, put, select }) {
            let sorts = action.payload.columns.reduce((prev, next) => {
                if (next.isData && next.sortOrder) {
                    prev.push({
                        Field: next.code,//next.id
                        Type: next.sortOrder === "ascend" ? 0 : 1,
                        SortIndex: next.sortIndex
                    });
                }
                return prev;
            }, []);
            // console.log(sorts);
            const { filterConditionArr, fieldNameArr } = yield select((state) => {
                return state[namespace]
            });
            const showFieldsIdsArr = fieldNameArr.reduce((prev, next) => {
                if (next.show) {
                    // prev.push(next.id);
                    prev.push(next.code);
                }
                return prev;
            }, []);
            yield put({
                type: "setHeaderAndTableData",
                payload: { columns: action.payload.columns, sorts, loading: true }
            });
            yield put({
                type: "getTableBody",
                payload: { fieldArr: showFieldsIdsArr, ConditionContainer: _dealDataTable(filterConditionArr), sorts }
            });
        },
        /* 如果是流程表单，按照流程状态进行筛选 */
        * changeProcedureStatus(action, { call, put, select }) {
            const { procedureState } = action.payload;
            const { filterConditionArr, fieldNameArr, sorts } = yield select((state) => {
                return state[namespace]
            });
            const showFieldsIdsArr = fieldNameArr.reduce((prev, next) => {
                if (next.show) {
                    // prev.push(next.id);
                    prev.push(next.code);
                }
                return prev;
            }, []);
            yield put({ type: "setHeaderAndTableData", payload: { procedureState, loading: true } });
            yield put({
                type: "getTableBody",
                payload: {
                    procedureState,
                    fieldArr: showFieldsIdsArr,
                    ConditionContainer: _dealDataTable(filterConditionArr),
                    sorts
                }
            });
        },
        /* 更新 筛选条件 */
        * updateFilterCondition(action, { call, put, select }) {
            const { fieldNameArr, filterConditionArr } = action.payload;
            const showFieldsIdsArr = fieldNameArr.reduce((prev, next) => {
                if (next.show) {
                    // prev.push(next.id);
                    prev.push(next.code);
                }
                return prev;
            }, []);
            yield put({ type: "setHeaderAndTableData", payload: { fieldNameArr, filterConditionArr, loading: true } });
            yield put({
                type: "getTableBody",
                payload: { fieldArr: showFieldsIdsArr, ConditionContainer: _dealDataTable(filterConditionArr) }
            });
        },
        // 用于 更新 显示 字段
        * updateFieldTable(action, { call, put, select }) {
            let columns = null;
            if (action.payload.columns) {
                columns = action.payload.columns;
            } else {
                let state = yield select((state) => {
                    return state[namespace]
                });
                columns = state.columns;
            }
            // console.log(columns);
            const showFieldsIdsArr = action.payload.fieldNameArr.reduce((prev, next) => {
                if (next.show !== false) {
                    // prev.push(next.id);
                    prev.push(next.code);
                }
                return prev;
            }, []);
            if (showFieldsIdsArr.length) {
                yield put({ type: "getTableBody", payload: { fieldArr: showFieldsIdsArr } });
                // 前端 操作 columns
                columns.forEach(item => {
                    // item.isData && (item.show = showFieldsIdsArr.some(v => item.id === v));
                    item.isData && (item.show = showFieldsIdsArr.some(v => item.code === v));
                });
            } else {
                columns.forEach(item => {
                    item.show = false;
                });
            }
            yield put({ type: "setHeaderAndTableData", payload: { columns, loading: true } });
        },
        // 获取 table 的 body 7efe8d39-894e-199c-76c6-81acbc671960
        * getTableBody(action, { call, put, select }) {
            const { pageIndex, pageSize, FormTemplateVersionId, templateId, fieldNameArr, moduleId, procedureState } = yield select((state) => {
                return state[namespace]
            });
            // console.log(fieldNameArr);
            let WorkFlowStatus = action.payload && action.payload.procedureState ? action.payload.procedureState : procedureState;
            WorkFlowStatus = WorkFlowStatus == "-1" ? null : WorkFlowStatus;
            const { data } = yield call(GetTableBody, {
                Id: action.payload && action.payload.templateId ? action.payload.templateId : templateId,
                FormTemplateVersionId: action.payload && action.payload.FormTemplateVersionId ? action.payload.FormTemplateVersionId : FormTemplateVersionId,
                FieldArr: action.payload && action.payload.fieldArr ? action.payload.fieldArr : null,
                ConditionContainer: action.payload && action.payload.ConditionContainer ? action.payload.ConditionContainer : null,
                Sorts: action.payload && action.payload.sorts ? action.payload.sorts : null,
                PageSize: action.payload && action.payload.pageSize ? action.payload.pageSize : pageSize,
                PageIndex: action.payload && action.payload.pageIndex ? action.payload.pageIndex : pageIndex,
                TableHead: fieldNameArr.map(item => ({
                    Id: item.id,
                    Code: item.code,
                    IsMain: item.isMain,
                    IsPrimaryKey: item.isPrimaryKey
                })),
                ModuleId: action.payload && action.payload.moduleId ? action.payload.moduleId : moduleId,
                WorkFlowStatus
            });
            // console.log(data);
            let tableData = data && data.rows ? _initTableBody(data.rows) : [];
            namespace === "accountBook" && (tableData = tableData.map(item => {
                if (item.index === 0) {
                    item.coop = { value: "coop", isMain: true };
                    item.order = { value: "order", isMain: true }
                }
                return item;
            }))
            // console.log(tableData);
            let pagination = data && data.pagination ? data.pagination : { totalCount: 0 }
            yield put({
                type: "setHeaderAndTableData",
                payload: { tableData, totalCount: pagination.totalCount, loading: false }
            });
        },
        // 获取table 的 头部
        * getTableHead(action, { call, put, select, all }) {
            // 主数据
            const { FormTemplateVersionId, templateId, moduleId } = yield select((state) => {
                return state[namespace]
            });
            // 前台 构建表头
            // 初始数据
            let requestObj = { initHeader: yield call(getTableHeadJSON, { formTemplateVersionId: FormTemplateVersionId }) },
                setResultState = {};
            namespace === "accountBook" && (requestObj.authority = yield call(GetPermission, {
                moduleId: action.payload && action.payload.moduleId ? action.payload.moduleId : moduleId,
            }))
            const allData = yield all(requestObj);
            let columnsNew = allData.initHeader.data ? allData.initHeader.data : [];
            columnsNew && action.payload.getTableBody && (yield put({
                type: "getTableBody",
                payload: { ...action.payload }
            }));
            columnsNew.length && (columnsNew = _initColumns(columnsNew));
            if (namespace === "accountBook") {
                let { operation, showFields } = initAuthorityData(allData.authority.data);
                setResultState.cooperateArr = operation;
                columnsNew = filterHeaderByAu(columnsNew, showFields);
                yield put({
                    type: "getAccountJson",
                    payload: {
                        type: JSONType.accountBookConfig,
                        FormTemplateVersionId: action.payload && action.payload.FormTemplateVersionId ? action.payload.FormTemplateVersionId : FormTemplateVersionId,
                        formTemplateId: action.payload && action.payload.templateId ? action.payload.templateId : templateId,
                        columns: columnsNew
                    }
                });
            }
            // console.log(columnsNew);
            action.payload.initFieldsArr && (yield put({ type: "initFieldsArr", payload: { columns: columnsNew } }));
            yield put({ type: "setHeaderAndTableData", payload: { columns: columnsNew, ...setResultState } });

            /* const { initHeader: { data: headerData }, authority: { data: authorityData } } = yield all({
                initHeader: yield call(getTableHeadNew, { EntityId: FormTemplateVersionId }),
                authority: yield call(GetPermission, {
                    moduleId: action.payload && action.payload.moduleId ? action.payload.moduleId : moduleId,
                })
            });
            let allAu = [], resultAu = { operation: [], showFields: [] };
            if (authorityData) {
                allAu = [...authorityData.employeeDataPermissionActionRequests, ...authorityData.organziationDataPermissionActionRequests, ...authorityData.roleDataPermissionActionRequests];
                if (allAu.length) {
                    allAu.reduce((prev, next) => {
                        let optItem = JSON.parse(next.operation),
                            formItem = JSON.parse(next.formItem);
                        if (optItem.rootId) {
                            let existArr = optItem[optItem.rootId];
                            if (existArr) {
                                prev.operation.push.call(prev.operation, ...existArr)
                            }
                        }
                        if (formItem.show && formItem.show.length) {
                            prev.showFields.push.call(prev.showFields, ...formItem.show);
                        }
                        return prev;
                    }, resultAu);
                    resultAu.operation = Array.from(new Set(resultAu.operation));
                    resultAu.showFields = Array.from(new Set(resultAu.showFields));
                }
            }
            console.log(headerData, authorityData, resultAu);
            let columnsNew = headerData && headerData.tableHead ? JSON.parse(headerData.tableHead) : [];

            columnsNew = filterHeaderByAu(columnsNew, resultAu.showFields);
            columnsNew && action.payload.getTableBody && (yield put({ type: "getTableBody", payload: { ...action.payload } }));
            // 初始化修改 columns 的 配置
            if (namespace === "accountBook" && dataNew) {
                yield put({
                    type: "getAccountJson",
                    payload: {
                        type: JSONType.accountBookConfig,
                        FormTemplateVersionId: action.payload && action.payload.FormTemplateVersionId ? action.payload.FormTemplateVersionId : FormTemplateVersionId,
                        formTemplateId: action.payload && action.payload.templateId ? action.payload.templateId : templateId,
                        columns
                    }
                });
            }
            columnsNew.length && (columnsNew = _initColumns(columnsNew));
            action.payload.initFieldsArr && (yield put({ type: "initFieldsArr", payload: { columns: columnsNew } }));
            yield put({ type: "setHeaderAndTableData", payload: { columns: columnsNew } }); */

            // 后台 构建的 表头
            /* const {data} = yield call(GetTableHead, {
                FormTemplateVersionId: action.payload && action.payload.FormTemplateVersionId ? action.payload.FormTemplateVersionId : FormTemplateVersionId,
                moduleId: action.payload.moduleId
            });
            // console.log(data);
            action.payload.getTableBody && (yield put({type: "getTableBody", payload: {...action.payload}}));
            let columns = data && data.length ? data : [];
            if (columns.length) {
                columns = _initColumns(columns);
                console.log(columns,columnsNew);
            }
            // 初始化修改 columns 的 配置
            if (namespace === "accountBook") {
                yield put({
                    type: "getAccountJson",
                    payload: {
                        type: JSONType.accountBookConfig,
                        FormTemplateVersionId: action.payload && action.payload.FormTemplateVersionId ? action.payload.FormTemplateVersionId : FormTemplateVersionId,
                        formTemplateId: action.payload && action.payload.templateId ? action.payload.templateId : templateId,
                        columns
                    }
                });
            }
            action.payload.initFieldsArr && (yield put({type: "initFieldsArr", payload: {columns}}));
            yield put({type: "setHeaderAndTableData", payload: {columns}}); */
        },
        // 如果是 挂了流程 的 表单，这个是 撤销 当前表单的 方法
        * cancelProcedure(action, { call, put }) {
            let result = {
                tenantID: config.tenantID,
                appID: config.appID,
                instanceID: action.payload.instanceId,
            };
            let userMess = localStorage.getItem("author");
            if (userMess) {
                userMess = JSON.parse(userMess);
                result.userInfo = userMess;
            }
            let { data } = yield call(cancelProcedure, result)
            // console.log(data);
            if (data.success) {
                yield put({
                    type: "getTableBody",
                    payload: {
                        fieldArr: showFieldsIdsArr,
                        ConditionContainer: _dealDataTable(filterConditionArr),
                        sorts, ...action.payload
                    }
                });
                message.success('流程撤销成功！')
            } else {
                message.error(data.msg);
            }
        },
        // 获取 台帐 的 配置 信息
        * getAccountJson(action, { call, put }) {
            let { columns, ...other } = action.payload;
            let { data } = yield call(getJSON, other);
            if (data) {
                let style = JSON.parse(data.style);
                // console.log(style);
                columns = columns.map(item => {
                    let existItem = style.filter(c => c.id === item.id)[0];
                    if (existItem) {
                        item = { ...item, ...existItem };
                    }
                    return item;
                });
                yield put({ type: "setHeaderAndTableData", payload: { columns, jsonId: data.id } });
            }
        },
        // 存储 台帐的 配置信息
        * setAccountJson(action, { call, put, select }) {
            const { FormTemplateVersionId, templateId, jsonId } = yield select((state) => {
                return state[namespace]
            });
            let API = jsonId ? modifyJSON : setJSON;
            action.payload.style = JSON.stringify(action.payload.style);
            yield call(API, {
                formTemplateVersionId: FormTemplateVersionId,
                formTemplateId: templateId,
                id: jsonId ? jsonId : Guid(),
                style: action.payload.style,
                type: JSONType.accountBookConfig
            });
        },
    }
}
const reducers = {
    /* 对于 header 和 tableData 修改时 做的事 */
    setHeaderAndTableData(state, action) {
        return { ...state, ...action.payload }
    },
    initFieldsArr(state, action) {
        // 初始化显示字段
        const { columns } = action.payload;
        let tempFiledsName = getFeildName(columns);
        tempFiledsName.length && tempFiledsName.forEach(v => {
            v.show = true;
            v.isFilter = false;
        });
        return { ...state, fieldNameArr: tempFiledsName }
    },
}
export default {
    state, effects, reducers, getFeildName, initColumns: _initColumns, dealDataTable: _dealDataTable
}

