import React, { useEffect, useState, useCallback, useMemo } from "react";
import { connect } from "dva";
import { fromJS } from "immutable";
import { Tooltip } from "antd";
import moment from "moment";
import queryString from "query-string";
import styles from "./FormDataTable.less";
import SearchFilter from "../../components/FormDataTable/SearchFilter";
import TopButtons from "../../components/FormDataTable/TopButtons";
import FormTableFooter from "../../components/FormDataTable/FormTableFooter";
import FormTable from "../../components/FormDataTable/FormTable";
import FormControlType from "../../enums/FormControlType";
import FORM_STATUS from "../../enums/FormStatus";
import FORMRENDERSTYLE from "../../enums/FormRenderStyle";
import { Modal, Button } from "antd";
import { parseFormValue } from "commonForm";
import { getDesigner } from "src/services/Print/PrintFunction";
import FormRender, { initFormBuilder } from "../FormRender/FormRender";
import { getPrintPreview, GetPrintPaste } from "src/services/Print/PrintFunction";


function loadForm(props) {
    let query = props.history ? queryString.parse(props.history.location.search) : { inst: null, tabId: null };
    let tabId = query.tabId;
    props.dispatch({
        type: "formDataTable/beginLoadForm",
        formTemplateVersionId: tabId,
        tabId,
        hideProgress: true,
        formTemplateId: query.formTemplateId, //this.props.formRender.get('formTemplateId'),
        formTemplateType: query.formTemplateType, //是否挂载流程  0不挂载 1挂载
        ignoreLinker: true,
        isAdmin: props.history.location.pathname === "/formbuilder/small",
        query
    });
}

//let styleOptions = null;
let tempStyleStatus = false;

const filter = a => a.status !== FORM_STATUS.Delete;
const empty = [];
const emptyDataColumns = fromJS([]);
const tdStyle = { padding: "6px 10px" };

function FormDataTable(props) {
    //styleOptions = props.formDataTable.toJS();
    const [formDataTable, setFormDataTable] = useState(props.formDataTable);
    const [modalVisible, setModalVisible] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const query = queryString.parse(props.history.location.search);
    const [readOnly, setReadOnly] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState(false);
    const [deleteArr, setDeleteArr] = useState([]);
    const [initFilterValue, setInitFilterValue] = useState([]);
    const [styleStatus, setStyleStatus] = useState(false);
    const [formHeader, setFormHeader] = useState(props[props.source]
        .get("formBody")
        .map(a => a.toJSON())
        .toJSON()
        .filter(filter));
    tempStyleStatus = styleStatus;
    const [selectStatus, setSelectStatus] = useState(false);
    // const [formStatus, setExtraParamsType] = useState(FORM_STATUS.Modify);
    
    const buildSubmitButtons = useCallback(
        () => {
            if (props.formRender.get("formEnable") !== true)
                return null;
            if (props.location.pathname === "/formbuilder/small") {
                return <Button type="primary" disabled={props.formRender.get("submitting")}
                    //loading={props.formRender.get('submitting')}
                               onClick={() => {
                                   submit({ submitKey: null, params: { params: {} }, query });
                               }}>
                    保存
                </Button>;
            } else {
                let submitInfoList = props.formRender.get("bussinessSubmitInfo");
                let buttonList = [];
                if (Array.isArray(submitInfoList)) {
                    submitInfoList.forEach(item => {
                        let submitKey = item.key;
                        item.list.forEach(btn => {
                            let { name, triggerType, tempSave, ...params } = btn;
                            let submitFn = triggerType === "submit" ? submit : triggerClick;
                            if (btn.params.isOpen) {
                                buttonList.push(
                                    <Button type="primary" disabled={props.formRender.get("formLoading")}
                                        //loading={props.formRender.get('submitting')}
                                            onClick={() => {
                                                submitFn({ submitKey, submitName: name, params, query, tempSave });
                                            }} key={submitKey + name}>{name}</Button>
                                );
                            }
                        });
                    });
                }
                if (buttonList.length === 0 && !readOnly && !props.formRender.get("formLoading") && Number(props.formTemplateType) === 0) {
                    return <Button type="primary" disabled={props.formRender.get("submitting")}
                        //loading={props.formRender.get('submitting')}
                                   onClick={() => {
                                       submit({ submitKey: null, params: { params: {} }, query });
                                   }}>
                        保存
                    </Button>;
                }
                return buttonList;
            }
        },
        [props.formRender.get("bussinessSubmitInfo"), props.formRender.get("formLoading"), props.formRender.get("submitting"), props.formRender.get("bussinessSubmitInfo"), props.formRender.get("formEnable")]
    );
    useEffect(() => {
        setFormHeader(props[props.source].get("formBody").map(a => a.toJSON()).toJSON().filter(filter));
    }, [props[props.source].get("formBody")]);
    
    useEffect(() => {
        //console.log('setFormDataTable');
        setFormDataTable(props.formDataTable);
    }, [props.formDataTable]);
    useEffect(() => {
        // componmentDidMount
        loadForm(props);
    }, []);
    useEffect(() => {
        return () => {
            let style = [];
            if (!tempStyleStatus) return;
            let dataFilter = formDataTable.get("dataFilter").toJS();
            let filterTableValue = formDataTable.get("filterTableValue").toJS();
            let filterShowList = formDataTable.get("filterShowList").toJS();
            dataFilter.forEach(a => {
                let colKeyList = getColKey(a);
                let tempFilterFooter = filterTableValue.find(b => colKeyList.find(c => c === b.key));
                let tempFilterShow = filterShowList.find(c => a.isGroup ? c.key === a.key : c.key === a.dataIndex);
                let obj = {
                    id: a.key,
                    title: a.title,
                    cusWidth: tempFilterFooter.cusWidth,
                    width: a.width,
                    freezeType: tempFilterFooter.freezeType,
                    show: tempFilterFooter.show,
                    filterShow: tempFilterShow.filterShow
                };
                style.push(obj);
            });
            addFooterSetting(JSON.stringify(style));
            setStyleStatus(false);
        };
    }, [formDataTable.get("dataFilter"), formDataTable.get("filterShowList"), formDataTable.get("filterTableValue")]);
    
    function addFilterPage({ pageSize, pageIndex }) {
        props.dispatch({
            type: "formDataTable/setFilterPage",
            pageSize,
            pageIndex,
            formTemplateVersionId: props.tabId
        });
    }
    
    function addFilterTableValue(params, ignore = false) {
        props.dispatch({
            type: "formDataTable/setFilterTableValue",
            filterTableValue: params,
            formTemplateVersionId: props.tabId,
            ignore
        });
    }
    
    function cancelProcedure(workFlowId) {
        props.dispatch({
            type: "formDataTable/cancelProcedure",
            formTemplateVersionId: props.tabId,
            workFlowId
        });
    }
    
    function addFilterShowList(params) {
        props.dispatch({
            type: "formDataTable/setFilterShowList",
            filterShowList: params,
            formTemplateVersionId: props.tabId
        });
    }
    
    function addFilterSearchValue(params) {
        props.dispatch({
            type: "formDataTable/setFilterSearchValue",
            filterSearchValue: params,
            formTemplateVersionId: props.tabId
        });
    }
    
    function addFooterSetting(style) {
        let source = props.source;
        props.dispatch({
            type: "formDataTable/sendFooterSetting",
            payload: {
                id: props.formDataTable.get("filterId"),
                formTemplateId: props[source].get("formTemplateId"),
                style
            },
            formTemplateVersionId: props.tabId
        });
    }
    
    function addProcedureState(params) {
        props.dispatch({
            type: "formDataTable/setProcedureState",
            procedureState: params,
            formTemplateVersionId: props.tabId
        });
    }
    
    function deleteFormData(id) {
        Modal.confirm({
            title: "提示",
            content: `您确定删除当前数据吗？删除数据无法恢复！`,
            okText: "确定",
            okType: "danger",
            cancelText: "取消",
            async onOk() {
                await props.dispatch({
                    type: "formDataTable/deleteOperation",
                    payload: [id],
                    formTemplateVersionId: props.tabId
                });
                ;
            }
        });
    }
    
    function deleteOperation() {
        Modal.confirm({
            title: "提示",
            content: `您当前打算删除${deleteArr.length}条数据，且删除数据无法恢复！`,
            okText: "确定",
            okType: "danger",
            cancelText: "取消",
            async onOk() {
                await props.dispatch({
                    type: "formDataTable/deleteOperation",
                    payload: deleteArr,
                    formTemplateVersionId: props.tabId
                });
                setDeleteArr([]);
                setDeleteStatus(false);
            }
            // onCancel() {
            //     // console.log('Cancel');
            // }
        });
    }
    
    // 选择选中
    function selectOperation(val) {
        // console.log(deleteArr);
        // let deleteAllArr = [];
        // formDataTable.toJS().tableData.forEach(a => {
        //     if (deleteArr.includes(a.instId)) {
        //         deleteAllArr.push(a);
        //     }
        // });
        props.dispatch({
            type: "formDataTable/SetSelectButtonData",
            formTemplateVersionId: props.formRender.get("formTemplateVersionId"),
            selectButtonData: val
        });
    }
    
    //初始化选中数据航
    function InitSelectData() {
        props.dispatch({
            type: "formDataTable/SetSelectButtonData",
            formTemplateVersionId: props.formRender.get("formTemplateVersionId"),
            selectButtonData: null
        });
    }
    
    const setTableLinkerValue = (tableId, proxyIndex, value) => {
        props.dispatch({
            type: "formRender/setTableLinkerValue",
            formTemplateVersionId: props.formRender.get("formTemplateVersionId"),
            tableId,
            proxyIndex,
            value
        });
    };
    
    const getTableLinkerValueList = (id) => {
        props.dispatch({
            type: "formRender/getTableLinkerValueList",
            formTemplateVersionId: props.formRender.get("formTemplateVersionId"),
            id
        });
    };
    
    function renderSubItemCell({ id, extraProps, value, proxyIndex, textAlign }) {
        let source = props.source;
        let item = formHeader.find(a => a.id === id.replace("header", ""));
        let { style, ...extra } = extraProps;
        if (item.formControlType !== FormControlType.GroupItem && item.formControlType !== FormControlType.Group
            && item.formControlType !== FormControlType.None) {
            let { formProperties, itemBase, renderStyle, ...other } = item;
            let Component = source === "formBuilder" ? item.WrappedComponent : item.Component;
            itemBase = itemBase.set("value", parseFormValue(value, item.valueType));
            //台账页面所有条件隐藏的判断都显示
            if (other.authority.getIn(["hidden", "formula"]) === true)
                other.authority = other.authority.setIn(["hidden", "formula"], false);
            if (other.itemType === "tableLinkerName") {
                other.setTableLinkerValue = setTableLinkerValue.bind(null, other.container, proxyIndex);
                other.getTableLinkerValueList = getTableLinkerValueList.bind(null, id);
            }
            return (
                <Tooltip placement="top"
                         title={item.valueType === "datetime" ? (value ? moment(value).format(itemBase.get("dateFormat")) : "") : value}>
                    <td {...extra} style={{ ...style, ...tdStyle, textAlign }}>
                        <Component
                            mode="cell"
                            getGroupItemsValue={getGroupItemsValue}
                            headerType="formDataTable"
                            {...other}
                            renderStyle={FORMRENDERSTYLE.PC}
                            itemBase={itemBase}
                            proxyIndex={proxyIndex}
                        />
                    </td>
                </Tooltip>
            );
        } else {
            let parent = item.formControlType === FormControlType.Group ? item : props[source].get("formBody").find(a => a.get("id") === item.container).toJSON();
            switch (parent.formControlType) {
                case FormControlType.Group:
                    let { formProperties, itemBase, renderStyle, ...other } = parent;
                    let Component = source === "formBuilder" ? parent.WrappedComponent : parent.Component;
                    itemBase = itemBase.set("groupValue", parseFormValue(value, item.valueType));
                    return (
                        <Tooltip placement="top"
                                 title={item.valueType === "datetime" ? (value ? moment(value).format(itemBase.get("dateFormat")) : "") : value}>
                            <td {...extra} style={{ ...style, ...tdStyle, textAlign }}>
                                <Component
                                    mode="groupCell"
                                    getGroupItemsValue={getGroupItemsValue}
                                    {...other}
                                    renderStyle={FORMRENDERSTYLE.PC}
                                    itemBase={itemBase}
                                />
                            </td>
                        </Tooltip>
                    );
                default:
                    return null;
            }
        }
    }
    
    function getGroupItemsValue(id, proxyIndex) {
        let source = props.source;
        let items = props[source]
            .get("formBody")
            .filter(a => a.get("container") === id)
            .map(a => ({
                value: a.getIn(["itemBase", "value"]) || a.getIn(["itemBase", "defaultValue"]),
                key: a.getIn(["itemBase", "key"])
            }))
            .toJS();
        let groupValues = {};
        let tableData = props.formDataTable.get("tableData") || [];
        items.forEach(a => {
            groupValues[a.key] = tableData[proxyIndex] ? tableData[proxyIndex][a.key] : null;
        });
        return groupValues;
    }
    
    function handleSort(dataIndex, desc = false) {
        let exist = (props.formDataTable.get("sorter") || empty).find(a => a.dataIndex === dataIndex);
        if (exist) {
            let type = desc ? 1 : 0;
            if (type === exist.type) {
                removeSorter(dataIndex);
            } else {
                addSorter(dataIndex, desc);
            }
        } else addSorter(dataIndex, desc);
    }
    
    function addSorter(dataIndex, desc = false) {
        props.dispatch({
            type: "formDataTable/setSorter",
            sorter: [
                ...(props.formDataTable.get("sorter") || empty).filter(a => a.dataIndex !== dataIndex),
                {
                    dataIndex,
                    field: (props.formDataTable.get("dataColumns") || emptyDataColumns)
                        .find(a => a.get("dataIndex") === dataIndex)
                        .get("code"),
                    sortIndex: 1,
                    type: desc ? 1 : 0
                }
            ],
            formTemplateVersionId: props.tabId
        });
    }
    
    function removeSorter(dataIndex) {
        props.dispatch({
            type: "formDataTable/setSorter",
            sorter: [...(props.formDataTable.get("sorter") || empty).filter(a => a.dataIndex !== dataIndex)],
            formTemplateVersionId: props.tabId
        });
    }
    
    function showModal({ instId, renderType, workFlowId, ...extraParams }) {
        setModalVisible(true);
        props.dispatch({
            type: "formRender/beginLoadForm",
            formStatus: extraParams.type === "add" ? FORM_STATUS.Add : FORM_STATUS.Modify,
            formTemplateVersionId: query.tabId,
            instId,
            readOnly: renderType === "readOnly",
            workFlowId,
            query
        });
        // setExtraParamsType(extraParams.type === "add" ? FORM_STATUS.Add : FORM_STATUS.Modify);
        setReadOnly(renderType === "readOnly");
    }
    
    function hideModal(val) {
        //关闭模态框之后刷新列表
        props.dispatch({
            type: "formRender/submitComplete",
            formTemplateVersionId: query.tabId
        });
        setModalVisible(false);
        
    }
    
    function setProxyState(key, formTemplateVersionId, newState) {
        props.dispatch({
            type: "formRender/updateBussinessProxyState",
            formTemplateVersionId,
            key,
            newState
        });
    }
    
    function getOtherBussinessProxyState({ businessKey, onSuccess }) {
        props.dispatch({
            type: "formRender/getOtherBussinessProxyState",
            formTemplateVersionId: query.tabId,
            businessKey,
            onSuccess
        });
    };
    
    function submit({ submitKey, submitName, params, query, tempSave = false }) {
        props.dispatch({
            type: "formRender/beginSubmit",
            formTemplateVersionId: query.tabId,
            submitKey,
            submitName,
            formInstanceId: props.formRender.get("instId"),
            params,
            getOtherBussinessProxyState,
            query,
            setProxyState,
            onCompleted: hideModal,
            tempSave
            // formStatus
        });
        // Modal.confirm({
        //     title: "提交确认!!",
        //     content: "确认执行此次操作?",
        //     okText: "确认",
        //     cancelText: "取消",
        //     onOk() {
        //         props.dispatch({
        //             type: "formRender/beginSubmit",
        //             formTemplateVersionId: query.tabId,
        //             submitKey,
        //             submitName,
        //             formInstanceId: props.formRender.get("instId"),
        //             params,
        //             getOtherBussinessProxyState,
        //             query,
        //             setProxyState,
        //             onCompleted: hideModal,
        //             tempSave
        //         });
        //     },
        //     onCancel() {
        //
        //     }
        // });
        
    }
    
    function triggerClick({ submitKey, submitName, params, query }) {
        props.dispatch({
            type: "formRender/triggerBussinessButton",
            formTemplateVersionId: query.tabId,
            getOtherBussinessProxyState,
            submitKey,
            submitName,
            params,
            setProxyState
        });
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
    
    let removeHeight = `${(showSearch ? 120 : 0) + 94}px`;
    
    let headerContent = useMemo(() => {
        return <div style={{ position: "relative", margin: "10px 10px 0" }}>
            <SearchFilter
                showSearch={showSearch}
                setShowSearch={setShowSearch}
                filterTableValue={props.formDataTable.get("filterTableValue") || emptyDataColumns}
                showFields={props.formDataTable.get("showFields") || emptyDataColumns}
                filterShowList={props.formDataTable.get("filterShowList") || emptyDataColumns}
                filterSearchValue={props.formDataTable.get("filterSearchValue") || emptyDataColumns}
                dataFilter={props.formDataTable.get("dataFilter") || emptyDataColumns}
                addFilterSearchValue={addFilterSearchValue}
                formTemplateType={props.formTemplateType}
                addProcedureState={addProcedureState}
                procedureState={props.formDataTable.get("procedureState")}
                deleteStatus={deleteStatus}
                deleteArr={deleteArr}
                deleteOperation={deleteOperation}
                pageSize={props.formDataTable.get("pageSize") || 0}
                pageIndex={props.formDataTable.get("pageIndex") || 0}
                selectStatus={selectStatus}
            />
            <TopButtons
                operationPermission={props.formDataTable.get("operationPermission") || emptyDataColumns}
                formTemplateType={props.formTemplateType}
                onNew={() => showModal({ type: "add", renderType: "edit" })}
                onDelete={() => setDeleteStatus(!deleteStatus)}
                onDesign={() => {
                    getDesigner(query.tabId);
                }}
                deleteStatus={deleteStatus}
                selectStatus={selectStatus}
                onSelect={() => setSelectStatus(!selectStatus)}
                FormButtons={props.formDataTable.get("ButtonByFormId")}
                selectData={props.formDataTable.get("SelectButtonData")}
                InitSelectData={InitSelectData}
                addFilterPage={addFilterPage}
                pageSize={props.formDataTable.get("pageSize") || 0}
                pageIndex={props.formDataTable.get("pageIndex") || 0}
                formEnable={props.formRender.get("formEnable")}
            />
        </div>;
    }, [showSearch, formDataTable.get("operationPermission"), formDataTable.get("showFields"),
        formDataTable.get("filterTableValue"), formDataTable.get("filterShowList"),
        formDataTable.get("filterSearchValue"), formDataTable.get("dataFilter"),
        formDataTable.get("pageSize"), formDataTable.get("pageIndex"),
        formDataTable.get("procedureState"), deleteStatus, deleteArr, selectStatus]);
    
    
    const tableContent = useMemo(() => {
            return modalVisible ? null : <FormTable
                modalVisible={modalVisible}
                versionId={props.tabId}
                showModal={showModal}
                hideModal={hideModal}
                permission={props.formDataTable.get("permission") || empty}
                removeHeight={removeHeight}
                dataSource={props.formDataTable.get("tableData") || empty}
                renderSubItemCell={renderSubItemCell}
                cancelProcedure={cancelProcedure}
                filterTableValue={props.formDataTable.get("filterTableValue") || emptyDataColumns}
                dataColumns={props.formDataTable.get("dataColumns") || emptyDataColumns}
                showFields={props.formDataTable.get("showFields") || emptyDataColumns}
                rootId={props.formDataTable.get("rootId")}
                sorter={props.formDataTable.get("sorter") || empty}
                onSort={handleSort}
                deleteFormData={deleteFormData}
                deleteStatus={deleteStatus}
                setDeleteArr={setDeleteArr}
                addFilterTableValue={addFilterTableValue}
                setInitFilterValue={setInitFilterValue}
                setStyleStatus={setStyleStatus}
                selectStatus={selectStatus}
                selectOperation={selectOperation}
            />;
        }
        , [formDataTable.get("permission"), formDataTable.get("tableData"),
            formDataTable.get("dataColumns"), formDataTable.get("showFields"),
            formDataTable.get("rootId"), formDataTable.get("sorter"),
            formDataTable.get("filterTableValue"), deleteStatus, removeHeight,
            modalVisible, selectStatus]);
    
    const footerContent = useMemo(() => {
        return <FormTableFooter
            dataFilter={props.formDataTable.get("dataFilter") || emptyDataColumns}
            dataColumns={props.formDataTable.get("dataColumns") || emptyDataColumns}
            showFields={props.formDataTable.get("showFields") || emptyDataColumns}
            filterTableValue={props.formDataTable.get("filterTableValue") || emptyDataColumns}
            filterShowList={props.formDataTable.get("filterShowList") || emptyDataColumns}
            addFilterTableValue={addFilterTableValue}
            addFilterShowList={addFilterShowList}
            totalCount={props.formDataTable.get("totalCount") || 0}
            pageCount={props.formDataTable.get("pageCount") || 0}
            addFilterPage={addFilterPage}
            pageSize={props.formDataTable.get("pageSize") || 0}
            pageIndex={props.formDataTable.get("pageIndex") || 0}
            addFooterSetting={addFooterSetting}
            initFilterValue={initFilterValue}
            setStyleStatus={setStyleStatus}
            rootId={props.formDataTable.get("rootId")}
        />;
    }, [formDataTable.get("dataFilter"), formDataTable.get("showFields"),
        formDataTable.get("filterTableValue"), formDataTable.get("filterShowList"),
        formDataTable.get("totalCount"), formDataTable.get("pageCount"),
        formDataTable.get("pageSize"), formDataTable.get("pageIndex")
    ]);
    // let optAuth = props.formDataTable.get("workFlowInfo") ? props.formDataTable.get("workFlowInfo").optAuth : []
    let { Print } = props.formRender.get("formProperties").toJS();
    return <div id="dataPreview" className={styles.container}>
        <Modal visible={modalVisible} onCancel={hideModal} width='100%'
               className={styles.formRenderModal} getContainer={() => document.getElementById("dataPreview")}
               mask={false} maskClosable={false}
               footer={
                   <div style={{ textAlign: "center" }}>
                       {
                           props.source === "formRender" ?
                               buildSubmitButtons() : null
                       }
                       {/*<Button key="print" disabled={props[props.source].get("submitting")}*/}
                       {/*onClick={() => getPrintPreview(props.tabId, props.formRender.get("instId"))}>打印</Button>*/}
                       {/*<Button disabled={props.formRender.get("submitting")}*/}
                       {/*onClick={() => GetPrintPaste({*/}
                       {/*FormTemplateVersionId: props.tabId,*/}
                       {/*FormInstanceId: props.formRender.get("instId")*/}
                       {/*})}*/}
                       {/*>打印粘贴单</Button>*/}
                       {
                           (Print || []).map((a, i) => {
                               return <Button key={i} disabled={props[props.source].get("submitting")}
                                              onClick={() => a.key === 0 ? getPrintPreview(props.tabId, props.formRender.get("instId")) : GetPrintPaste({
                                                  FormTemplateVersionId: props.tabId,
                                                  FormInstanceId: props.formRender.get("instId")
                                              })}>{a.name}</Button>;
                           })
                       }
                       <Button key="back" disabled={props[props.source].get("submitting")}
                               onClick={hideModal}>关闭</Button>
                   </div>
               }>
            {
                modalVisible ?
                    <FormRender/> : null
            }
        </Modal>
        {headerContent}
        {tableContent}
        {footerContent}
    </div>;
}

function mapStateToProps(state, props) {
    let query = queryString.parse(props.history.location.search);
    let formDataTable = state.formDataTable;
    let source = formDataTable.source;
    let formSource = state[source];
    if (query.tabId) {
        if (!formSource.all[query.tabId]) {
            formSource.all[query.tabId] = initFormBuilder(query.tabId, query.formTemplateType);
        }
        formSource = formSource.all[query.tabId];
        formDataTable = formDataTable.all[query.tabId] || fromJS({});
    }
    return {
        source,
        [source]: formSource,
        formDataTable,
        tabId: query.tabId,
        formTemplateType: query.formTemplateType
    };
}

export default connect(mapStateToProps)(FormDataTable);
