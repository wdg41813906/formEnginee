import { GetTableBody, deleteRow, GetForModify, Modify, SetNew } from "../../services/DataManage/DataManage";
import { fromJS } from "immutable";
import FORM_TYPE from "../../enums/FormType";
import { Com } from "../../utils";
import { GetPermission, cancelProcedure } from "../../services/Workflow/Workflow";
// import config from "../../utils/config";
import { GetButtonByFormId } from "../../services/FormBuilder/FormButton";
import { message } from "antd";
import FORM_STATUS from "../../enums/FormStatus";

function setColumnsCode(panelBody, cols) {
    if (cols.children) {
        cols.children.forEach(c => {
            setColumnsCode(panelBody, c);
        });
    }
    else {
        let tempList = panelBody.find(a => a.id === cols.dataIndex);
        if (tempList)
            cols.code = tempList.code;
        else
            cols.code = "";
    }
}

function getTableHead(dataColumns) {
    let head = [];
    dataColumns.forEach(col => {
        if (col.dataIndex)
            head.push({
                id: col.dataIndex,
                code: col.code,
                isMain: true
            });
        else if (Array.isArray(col.children)) {
            head = head.concat(getTableHead(col.children));
        }
    });
    return head;
}

function getShowFieldWithContainer({ showFields, formBody }) {
    if (!Array.isArray(showFields))
        return showFields;
    let list = Array.from(new Set(formBody.filter(a => showFields.includes(a.id) && a.container).map(a => a.container)));
    if (list[0]) {
        list = getShowFieldWithContainer({ showFields: list, formBody });
    }
    return Array.from(new Set([...showFields, ...list]));
}

//剔除掉子级列为空的多表头
function columnCheck(columns) {
    let invalidColumns = columns.filter(a => Array.isArray(a.children) &&
        columns.some(b => b.container === a.key && b.children.some(c => c.key === a.key)))
        .map(a => a.key);
    return columns.filter(a => !invalidColumns.includes(a.key));
}

//扁平化columns
function rebuildColumns(columns) {
    let newColumns = [];
    columns.forEach(item => {
        if (!item.isGroup) {
            let { children, ...other } = item;
            newColumns.push(other);
            if (Array.isArray(children))
                newColumns.push(...rebuildColumns(children).map(a => ({ ...a, container: other.key })));
        }
        else
            newColumns.push(item);
    });
    return newColumns;
}

//添加treeTitle
function addTreeTitle(columns, dataColumns) {
    let treeTitleColumns = [];
    columns.forEach(columnsItem => {
        let arr = [columnsItem.title];
        let tempTreeTitleArr = findContainer(columnsItem.container, dataColumns);
        arr.push.apply(arr, tempTreeTitleArr);
        const treeTitle = arr.reverse().join(" . ");
        treeTitleColumns.push({ ...columnsItem, treeTitle, treeTitleArr: arr });
    });
    return treeTitleColumns;
}

function findContainer(id, dataColumns) {
    let arr = [];
    const filter = dataColumns.filter(a => a.key === id);
    if (filter.length) {
        arr.push(filter[0].title);
        const tempArr = findContainer(filter[0].container, dataColumns);
        arr.push.apply(arr, tempArr);
    }
    return arr;
}

function initSubFormColumn({ formBody, showFields, isAdmin }) {
    let columns = [];
    let showFieldsWithContainer = isAdmin ? formBody.map(a => a.id) : getShowFieldWithContainer({
        showFields,
        formBody
    });
    formBody.filter(a => a.event && a.noMappad !== true && a.status !== FORM_STATUS.Delete &&
        (Array.isArray(showFieldsWithContainer) ? showFieldsWithContainer.includes(a.id) : true))
        .forEach(item => {
            let colsBase = item.event.get("buildSubTableHeaderBase")({
                id: item.id,
                container: item.itemBase.get("groupId") || item.container, ...item.itemBase.toJS(),
                headerType: "formDataTable"
            });
            colsBase.headerAlign = item.itemBase.get("headerAlign") || "center";
            colsBase.textAlign = item.itemBase.get("textAlign") || "left";
            let cols = {};
            if (item.event.has("buildSubTableHeader")) {
                cols = item.event.get("buildSubTableHeader")({
                    id: item.id,
                    container: item.itemBase.get("groupId") || item.container,
                    ...item.itemBase.toJS(),
                    name: (item.itemBase.get("externalName") || "") !== "" ? item.itemBase.get("externalName") : item.itemBase.get("name"),
                    headerType: "formDataTable"
                });
            }
            if (Array.isArray(cols)) {
                //控件组每个控件的valueType需要取获取
                cols.forEach(a => {
                    setColumnsCode(formBody, a);
                });
                columns = columns.concat(cols.map(a => ({ ...colsBase, ...a, valueType: item.valueType })));
            }
            else {
                let colItem = { ...colsBase, ...cols, valueType: item.valueType };
                setColumnsCode(formBody, colItem);
                if (Array.isArray(colItem.children)) {
                    colItem.children.forEach(a => {
                        a.headerAlign = colsBase.headerAlign;
                        a.textAlign = colsBase.textAlign;
                    });
                }
                columns.push(colItem);
            }

        });
    let newColumns = rebuildColumns(columns);
    return newColumns;
}

function initSubFormFilter({ formBody, showFields, isAdmin, dataColumns }) {
    let columns = [];
    let showFieldsWithContainer = isAdmin ? formBody.map(a => a.id) : getShowFieldWithContainer({
        showFields,
        formBody
    });
    formBody.filter(a => a.event && a.noMappad !== true && a.status !== FORM_STATUS.Delete && a.formControlType < 2 && a.event &&
        (Array.isArray(showFieldsWithContainer) ? showFieldsWithContainer.includes(a.id) : true))
        .forEach(item => {
            let colsBase = item.event.get("buildSubTableHeaderBase")({
                id: item.id,
                container: item.itemBase.get("groupId") || item.container, ...item.itemBase.toJS(),
                headerType: "formDataTable"
            });
            let cols = {};
            if (item.event.has("buildSubTableHeader")) {
                cols = item.event.get("buildSubTableHeader")({
                    id: item.id,
                    container: item.itemBase.get("groupId") || item.container, ...item.itemBase.toJS(),
                    name: (item.itemBase.get("externalName") || "") !== "" ? item.itemBase.get("externalName") : item.itemBase.get("name"),
                    headerType: "formDataTable"
                });
            }
            if (Array.isArray(cols)) {
                //控件组每个控件的valueType需要取获取
                cols.forEach(a => {
                    setColumnsCode(formBody, a);
                });
                columns = columns.concat(cols.map(a => ({ ...colsBase, ...a, valueType: item.valueType })));
            }
            else {
                let colItem = { ...colsBase, ...cols, valueType: item.valueType };
                setColumnsCode(formBody, colItem);
                columns.push(colItem);
            }
        });
    const newColumns = rebuildColumns(columns);
    const addTreeTitleColumns = addTreeTitle(newColumns, dataColumns);
    return addTreeTitleColumns;
}

function getColKey(col) {
    let colKey = [];
    if (col.isGroup) colKey.push(col.key);
    else {
        if ((col.valueType === "container" || col.valueType === "external") && Array.isArray(col.children)) {
            col.children.forEach(a => {
                let tempColKey = getColKey(a);
                colKey.push.apply(colKey, tempColKey);
            });
        }
        else if (col.dataIndex) colKey.push(col.dataIndex);
    }
    return colKey;
}

function initSettingFilter(params, showFields) {
    let arr = [];
    let tempDataFilter = params.filter(a => showFields.includes(a.dataIndex) || showFields.includes(a.key));
    tempDataFilter.forEach(a => {
        let obj = { show: true, freezeType: "0", width: a.width };
        let tempKey = getColKey(a);
        obj.key = tempKey[0];
        arr.push(obj);
    });
    return arr;
}

function initFilterShow(params, showFields) {
    let arr = [];
    let tempDataFilter = params.filter(a => showFields.includes(a.dataIndex) || showFields.includes(a.key));
    tempDataFilter.forEach(a => {
        let obj = { filterShow: true };
        let tempKey = getColKey(a);
        obj.key = tempKey[0];
        arr.push(obj);
    });
    return arr;
}

export default {
    namespace: "formDataTable",
    // subscriptions: {
    //     init({ history, dispatch }) {
    //         // 监听 history 变化，当进入 `/` 时触发 `load` action
    //         return history.listen((location) => {
    //             if (location.pathname === '/formbuilder/small') {
    //                 dispatch({
    //                     type: 'setSource',
    //                     source: 'formBuilder'
    //                 })
    //             }
    //             else if (location.pathname === '/accountBook') {
    //                 dispatch({
    //                     type: 'setSource',
    //                     source: 'formRender'
    //                 })
    //             }
    //         });
    //     },
    // },
    state: {
        all: {},
        source: "formRender"
    },
    effects: {
        * beginLoadForm(action, effects) {
            let { formTemplateVersionId, isAdmin, ...other } = action;
            let { loaded, loading } = yield effects.select(state => {
                return {
                    loaded: state.formRender.all[formTemplateVersionId].get("loaded") === true,
                    loading: state.formRender.all[formTemplateVersionId].get("formLoading")
                };
            });
            if (loading)
                return;
            if (!loaded) {
                yield effects.put({
                    ...other,
                    formTemplateVersionId,
                    type: "formRender/beginLoadForm",
                    loadBussinessComponents: false,
                    isAdmin
                });
                yield effects.put({
                    type: "watchLoadForm",
                    formTemplateType: other.formTemplateType
                });
            }
            else {
                yield effects.put({
                    type: "buildFormDataColumns",
                    formTemplateVersionId,
                    formTemplateType: other.formTemplateType,
                    isAdmin//other.formTemplateType === '1' ? true : isAdmin
                });
            }
        },
        * watchLoadForm(action, effects) {
            let { formTemplateVersionId, isAdmin, formTemplateType, ...other } = yield effects.take(["formRender/loadForm", "formRender/endLoadForm"]);
            yield effects.put({
                type: "buildFormDataColumns",
                formTemplateVersionId,
                formTemplateType: action.formTemplateType,
                isAdmin//: formTemplateType === '1' ? true : isAdmin
            });
        },
        * cancelProcedure(action, { call, put }) {
            let { formTemplateVersionId, workFlowId } = action;
            let result = {
                tenantID: config.tenantID,
                appID: config.appID,
                instanceID: workFlowId
            };
            let userMess = localStorage.getItem("author");
            if (userMess) {
                userMess = JSON.parse(userMess);
                result.userInfo = userMess;
            }
            let { data } = yield call(cancelProcedure, result);
            if (data.success) {
                yield put({
                    type: "cancelProcedureSuccess",
                    formTemplateVersionId
                });
                message.success("流程撤销成功");
            } else {
                message.error(data.msg);
            }
        },
        * getFormTableData(action, effects) {
            const { data } = yield effects.call(GetTableBody, action.payload);
            if (data.rows.length > 0) {
                yield effects.put({
                    type: "formBuilder/setIsUsed",
                    formTemplateVersionId: action.formTemplateVersionId
                });
            }
            yield effects.put({ type: "setFormTableData", data, formTemplateVersionId: action.formTemplateVersionId });
        },
        // *loadPermission(action, effects) {
        //     let { formTemplateVersionId, moduleId } = action;
        //     let { data } = yield effects.call(GetPermission, { moduleId });
        //     debugger
        //     let permission = [], showFields = [];
        //     if (data) {
        //         let allAu = [...data.employeeDataPermissionActionRequests, ...data.organziationDataPermissionActionRequests, ...data.roleDataPermissionActionRequests];
        //         allAu.forEach(a => {
        //             let optItem = JSON.parse(a.operation),
        //                 formItem = JSON.parse(a.formItem);
        //             if (optItem.rootId) {
        //                 let existArr = optItem[optItem.rootId];
        //                 if (existArr) {
        //                     permission.push(...existArr);
        //                 }
        //             }
        //             if (Array.isArray(formItem.show)) {
        //                 showFields.push(...formItem.show);
        //             }
        //         });
        //         permission = Array.from(new Set(permission));
        //         showFields = Array.from(new Set(showFields));
        //     }
        //     yield effects.put({ type: "setPermission", permission, formTemplateVersionId });
        //     yield effects.put({ type: 'setColumnAuthority', showFields, formTemplateVersionId });
        // },
        * deleteOperation(action, effects) {
            let { formTemplateVersionId, payload } = action;
            let { data } = yield effects.call(deleteRow, { formTemplateVersionId, FormInstanceIds: payload });
            if (data && data.isValid) {
                yield effects.put({
                    type: "setDeleteOperation",
                    deleteOperation: payload,
                    formTemplateVersionId
                });
            }
        },
        * sendFooterSetting(action, effects) {
            let { formTemplateVersionId, payload } = action;
            let type = 99;
            let tempGetForModify = yield effects.call(GetForModify, {
                formTemplateVersionId,
                formTemplateId: payload.formTemplateId,
                type
            });
            if (!tempGetForModify.data) yield effects.call(SetNew, {
                ...payload,
                formTemplateVersionId,
                type,
                id: Com.Guid()
            });
            else yield effects.call(Modify, { ...payload, formTemplateVersionId, type, id: tempGetForModify.data.id });
        },
        * loadFooterSetting(action, effects) {
            let { formTemplateVersionId, formTemplateId, dataFilter, showFields } = action;
            let type = 99;
            let { data } = yield effects.call(GetForModify, { formTemplateVersionId, formTemplateId, type });
            let isStyle = false;
            if (data && data.style) {
                if (JSON.parse(data.style).length > 0) isStyle = true;
            }
            if (isStyle) {
                yield effects.put({
                    type: "setFilterId",
                    filterId: data.id,
                    formTemplateId: data.formTemplateId,
                    formTemplateVersionId
                });
                let [tempSettingFilter, tempFilterShow] = [[], []];
                JSON.parse(data.style).forEach(a => {
                    let settingObj = {
                        show: a.show,
                        freezeType: a.freezeType,
                        width: a.width,
                        key: a.id,
                        cusWidth: a.cusWidth
                    };
                    let filterShowObj = { filterShow: a.filterShow, key: a.id };
                    tempSettingFilter.push(settingObj);
                    tempFilterShow.push(filterShowObj);
                });
                yield effects.put({
                    type: "setFilterTableValue",
                    filterTableValue: tempSettingFilter,
                    formTemplateVersionId
                });
                yield effects.put({
                    type: "setFilterShowList",
                    filterShowList: tempFilterShow,
                    formTemplateVersionId
                });
            } else {
                let settingFilter = initSettingFilter(dataFilter, showFields);
                let filterShow = initFilterShow(dataFilter, showFields);
                yield effects.put({
                    type: "setFilterTableValue",
                    filterTableValue: settingFilter,
                    formTemplateVersionId
                });
                yield effects.put({
                    type: "setFilterShowList",
                    filterShowList: filterShow,
                    formTemplateVersionId
                });
            }
        },
        * buildFormDataColumns(action, effects) {
            let { formTemplateVersionId, isAdmin, formTemplateType } = action;
            //let { id: mainFormId, code: mainformCode } = formsActionRequests.find(a => a.formType === FORM_TYPE.mainForm);
            const { formBody, formTemplateId, moduleId, mainformCode, showFields, operationPermission } = yield effects.select((state) => {
                let { id: mainFormId, code: mainformCode } = state.formRender.all[formTemplateVersionId].get("formList").toJS().find(a => a.formType === FORM_TYPE.mainForm);
                return {
                    formBody: state.formRender.all[formTemplateVersionId].get("formBody").map(a => a.toJSON()).filter(a => mainFormId.includes(a.formId)).toJSON(),
                    formTemplateId: state.formRender.all[formTemplateVersionId].get("formTemplateId"),
                    moduleId: state.formRender.all[formTemplateVersionId].get("moduleId"),
                    showFields: state.formRender.all[formTemplateVersionId].get("showFields"),
                    operationPermission: state.formRender.all[formTemplateVersionId].get("operationPermission"),
                    mainFormId,
                    mainformCode,
                    source: state.formDataTable.source
                };
            });
            //记载自定义按钮
            let { data } = yield effects.call(GetButtonByFormId, {
                FormId: formBody.find(a => a.itemType === "Root").formId
            });
            yield effects.put({
                type: "SetButtonByFormId",
                formTemplateVersionId,
                data
            });

            yield effects.put.resolve({
                type: "setColumnAuthority",
                formTemplateVersionId,
                showFields
            });
            //const showFields = yield effects.select((state) => state.formDataTable.all[formTemplateVersionId].get('showFields'));
            let dataColumns = initSubFormColumn({ formBody, showFields, isAdmin });
            let dataFilter = initSubFormFilter({ formBody, showFields, isAdmin, dataColumns });
            yield effects.put({
                type: "setTableDataInfo",
                formTemplateVersionId,
                formTemplateId,
                operationPermission,
                moduleId,
                mainformCode,
                pageSize: 20,
                pageIndex: 1
            });
            yield effects.put({
                type: "setTableDataColumns",
                dataColumns,
                formTemplateVersionId,
                rootId: formBody.find(a => a.itemType === "Root").id
            });
            yield effects.put({
                type: "setTableDataFilter",
                dataFilter,
                formTemplateVersionId
            });
            yield effects.put({
                type: "loadFooterSetting",
                formTemplateVersionId,
                formTemplateId,
                dataFilter,
                showFields
            });
        },
        getWorkFlowInf: [function* (effects) {
            while (true) {
                let action = yield effects.take("formRender/SetNewformBody");
                let workFlowInfo = yield effects.select(state => state.formRender.all[action.id].get("Launch"));
                yield effects.put({
                    type: "setWorkFlowInfo",
                    formTemplateVersionId: action.id,
                    workFlowInfo
                });
            }
        }, { type: "watcher" }],
        refreshTableData: [function* (effects) {
            while (true) {
                let { formTemplateVersionId, ignore/*, ...other*/ } = yield effects.take([
                    "setSorter",
                    "setFilterTableValue",
                    "setFilterSearchValue",
                    "setFilterPage",
                    "cancelProcedureSuccess",
                    "updateOperationPermission",
                    //'setFilterShowList',
                    "setProcedureState",
                    "formRender/submitComplete",
                    "setDeleteOperation"
                ]);
                if (ignore !== true) {
                    const { formTemplateId, moduleId, sorter, dataColumns, pageSize, pageIndex, filterSearchValue, mainformCode, procedureState, i } = yield effects.select((state) => {
                        return {
                            formTemplateId: state.formDataTable.all[formTemplateVersionId].get("formTemplateId"),
                            moduleId: state.formDataTable.all[formTemplateVersionId].get("moduleId"),
                            sorter: state.formDataTable.all[formTemplateVersionId].get("sorter") || [],
                            dataColumns: state.formDataTable.all[formTemplateVersionId].get("dataColumns"),
                            dataFilter: state.formDataTable.all[formTemplateVersionId].get("dataFilter"),
                            pageSize: state.formDataTable.all[formTemplateVersionId].get("pageSize"),
                            pageIndex: state.formDataTable.all[formTemplateVersionId].get("pageIndex"),
                            mainformCode: state.formDataTable.all[formTemplateVersionId].get("mainformCode"),
                            //  高级搜索searchFilter conditionContainer数据
                            filterSearchValue: state.formDataTable.all[formTemplateVersionId].get("filterSearchValue"),
                            // 页脚设置modal, 宽度, 冻结, 显示的数据
                            filterTableValue: state.formDataTable.all[formTemplateVersionId].get("filterTableValue"),
                            // 页脚设置modal, 是否开启搜索的数据
                            filterShowList: state.formDataTable.all[formTemplateVersionId].get("filterShowList"),
                            filterId: state.formDataTable.all[formTemplateVersionId].get("filterId"),
                            // 流程状态
                            procedureState: state.formDataTable.all[formTemplateVersionId].get("procedureState")
                        };
                    });
                    let conditionContainer = [];
                    if (filterSearchValue) {
                        filterSearchValue.toJS().forEach(item => {
                            let Condition = "";
                            const tempOptionArr = Com.optionObj[item.valueType];
                            if (item.code === "Cascader") {
                                let tempOption = tempOptionArr.find(a => a.value === item.select);
                                item.filter.forEach(a => {
                                    Condition = tempOption.condition.replace(/value/g, a.address);
                                    let obj = {
                                        Condition,
                                        ExtendedType: item.extendedType,
                                        Id: a.code,
                                        Type: item.valueType
                                    };
                                    conditionContainer.push(obj);
                                });
                            } else {
                                if (item.select === "2" || item.select === "3") {
                                    let tempOption = tempOptionArr.find(a => a.value === item.select);
                                    Condition = tempOption.condition;
                                }
                                else if (!item.select || !item.filter) return;
                                else if (item.select === "12") {
                                    let tempOption = tempOptionArr.find(a => a.value === item.select);
                                    let tempCondition = tempOption.condition.replace(/value1/g, item.filter);
                                    Condition = tempCondition.replace(/value2/g, item.filterSecond);
                                }
                                else {
                                    let tempOption = tempOptionArr.find(a => a.value === item.select);
                                    Condition = tempOption.condition.replace(/value/g, item.filter);
                                }
                                let obj = {
                                    Condition,
                                    ExtendedType: item.extendedType,
                                    Id: item.code,
                                    Type: item.valueType
                                };
                                conditionContainer.push(obj);
                            }
                        });
                    }
                    let payload = {
                        conditionContainer,
                        fieldArr: [],//dataColumns.filter(a => a.has('dataIndex')).toJS().map(a => a.dataIndex),
                        formTemplateVersionId, //"b70b61ef-087c-44d3-9df5-d6e862226509",
                        id: formTemplateId, //"6a4519ab-0a65-6841-35e9-9a4b32421968",
                        moduleId,//"9e9510d8-a23c-2928-a2fd-720f20d1793e",
                        pageSize,
                        pageIndex,
                        tableName: mainformCode,
                        platForm: "FormEngine",
                        sorts: sorter,
                        workFlowStatus: procedureState,
                        tableHead: getTableHead(dataColumns.toJS())
                    };
                    let userMess = localStorage.getItem("author");
                    if (userMess) {
                        userMess = JSON.parse(userMess);
                        payload.OrganizationId = userMess.currentDeptId;
                    }
                    yield effects.put({
                        type: "getFormTableData",
                        payload,
                        formTemplateVersionId
                    });
                }
            }
        }, { type: "watcher" }],
        refreshOperationPermission: [function* (effects) {
            while (true) {
                let { formTemplateVersionId, fieldsPermission } = yield effects.take("formRender/setOperationPermission");
                const operationPermission = yield effects.select(state => state.formRender.all[formTemplateVersionId].get("operationPermission"));
                effects.put({
                    type: "updateOperationPermission",
                    formTemplateVersionId,
                    operationPermission,
                    fieldsPermission
                });
            }
        }, { type: "watcher" }]
    },
    reducers: {
        setSource(state, action) {
            return { ...state, source: action.source };
        },
        //设置台账基本信息
        setTableDataInfo(state, action) {
            let { formTemplateVersionId, formTemplateId, moduleId, pageSize, pageIndex, mainformCode, operationPermission } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("formTemplateId", formTemplateId).set("moduleId", moduleId)
                .set("pageSize", pageSize).set("pageIndex", pageIndex).set("mainformCode", mainformCode)
                .set("operationPermission", operationPermission);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        //设置台账数据
        setFormTableData(state, action) {
            let { formTemplateVersionId, data: { rows, pagination: { totalCount, pageCount } } } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            let tableData = rows.map((a, key) => {
                let obj = { key, instId: a.formInstanceId, workFlowId: a.workFlowId, workFlowStatus: a.workFlowStatus };
                a.cells.filter(a => a.id).forEach(b => {
                    obj[b.id] = b.value;
                });
                return obj;
            });
            tableState = tableState.set("tableData", tableData)//.set('pagination', pagination)
                .set("totalCount", totalCount).set("pageCount", pageCount);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        //设置排序
        setSorter(state, action) {
            let { formTemplateVersionId, sorter } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("sorter", sorter);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        //设置流程信息
        setWorkFlowInfo(state, action) {
            let { formTemplateVersionId, workFlowInfo } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("workFlowInfo", workFlowInfo);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        //设置台账表头
        setTableDataColumns(state, action) {
            let { dataColumns, formTemplateVersionId, rootId } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("dataColumns", fromJS(dataColumns)).set("rootId", rootId);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        // dataFilter Table列表数据
        setTableDataFilter(state, action) {
            let { dataFilter, formTemplateVersionId } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("dataFilter", fromJS(dataFilter));
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        // Table列表显示条件（宽度，冻结，是否显示）
        setFilterTableValue(state, action) {
            let { formTemplateVersionId, filterTableValue } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("filterTableValue", fromJS(filterTableValue));
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        // 是否开启搜索列表
        setFilterShowList(state, action) {
            let { formTemplateVersionId, filterShowList } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("filterShowList", fromJS(filterShowList));
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        // 搜索条件列表
        setFilterSearchValue(state, action) {
            let { formTemplateVersionId, filterSearchValue } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("filterSearchValue", fromJS(filterSearchValue));
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        // Table翻页，页面数据条数
        setFilterPage(state, action) {
            let { formTemplateVersionId, pageSize, pageIndex } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("pageSize", pageSize).set("pageIndex", pageIndex);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        // 设置Modify
        setFilterId(state, action) {
            let { formTemplateVersionId, filterId, formTemplateId } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("filterId", filterId).set("formTemplateId", formTemplateId);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },


        // 流程状态
        setProcedureState(state, action) {
            let { formTemplateVersionId, procedureState } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("procedureState", procedureState);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        // //设置表头权限
        // setPermission(state, action) {
        //     let { formTemplateVersionId, permission } = action;
        //     let all = state.all;
        //     let tableState = all[formTemplateVersionId] || fromJS({});
        //     tableState = tableState.set('permission', permission);
        //     state.all[formTemplateVersionId] = tableState;
        //     return { ...state, all };
        // },
        //设置表头列显示字段
        setColumnAuthority(state, action) {
            let { formTemplateVersionId, showFields } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("showFields", showFields);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        cancelProcedureSuccess(state) {
            return state;
        },
        updateOperationPermission(state, action) {
            let { formTemplateVersionId, operationPermission, updateOperationPermission } = action;
            let all = state.all;
            tableState = tableState
                .set("operationPermission", operationPermission)
                .set("showFields", updateOperationPermission.show);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        setDeleteOperation(state, action) {
            let { formTemplateVersionId, deleteOperation } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("deleteOperation", deleteOperation);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        //加载自定义按钮
        SetButtonByFormId(state, action) {
            let { formTemplateVersionId, data } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("ButtonByFormId", data.buttonList);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        },
        //添加选中数据
        SetSelectButtonData(state, action) {
            let { formTemplateVersionId, selectButtonData } = action;
            let all = state.all;
            let tableState = all[formTemplateVersionId] || fromJS({});
            tableState = tableState.set("SelectButtonData", selectButtonData);
            state.all[formTemplateVersionId] = tableState;
            return { ...state, all };
        }
    }
};
