import { Component } from "react"
import { Button,  Select, Icon,  Modal, Tooltip, message } from "antd"
import { connect } from 'dva';
import styles from "./AccountBook.less"
import {  is } from "immutable"
import { getLocation } from "../../services/DataManage/DataManage"
import queryString from 'query-string';
import { optionObj } from "../../utils/com"
import AuthStatus from "../../enums/AuthorityStatus"


import TableFooter from "../../components/FormControl/common/TableFooter"
import TableCom from "../../components/DataManage/TableCom"
import GenerateFilterCondition from "../../components/DataManage/filterHOC"
import ImportFile from "../../components/DataManage/ImportFile";
import CreditTableRow from "../../components/DataManage/CreditTableRow"

const confirm = Modal.confirm;
/* 对于特殊列设置 render */
const renderSpecial = (value, record, renderCom) => {
    if (!value) {
        return {
            children: "",
            props: {
                colSpan: 0,
                rowSpan: 0
            }
        }
    }
    if (value.isMain) {
        return {
            children: renderCom,
            props: {
                rowSpan: record.maxRowSpan
            }
        }
    } else {
        return {
            children: renderCom
        }
    }
}
/* 添加操作列 */
const addCooperate = (columns, operFuns, cooperateArr) => {
    if (columns.some(item => item.id === "coop")) return columns;
    operFuns = operFuns ? operFuns : {};
    let { openFormRender, cancelProcedure } = operFuns;
    columns.push({
        fixed: "right",
        dataIndex: "coop",
        id: "coop",
        key: "coop",
        isData: true,
        freezeType: "2",
        title: "操作",
        parentId: null,
        width: 140,
        show: true,
        render: (value, record) => {
            let com = (
                <div className={styles.custormEdit}>
                    {
                        ((record.workFlowId && record.workFlowStatus == "0") || cooperateArr.indexOf(AuthStatus.edit) !== -1) ? <Tooltip title={record.workFlowId ? "办理" : "编辑"}>
                            <Button type="primary" icon="edit" size="small" onClick={openFormRender instanceof Function && openFormRender.bind(null, "modify", record.mainId, "edit", record.workFlowId)} />
                        </Tooltip> : null
                    }
                    {
                        (cooperateArr.indexOf(AuthStatus.look) !== -1 || record.workFlowId) ? <Tooltip title="查看">
                            <Button icon="eye" size="small" onClick={openFormRender instanceof Function && openFormRender.bind(null, "modify", record.mainId, "readOnly", record.workFlowId)} />
                        </Tooltip> : null
                    }
                    {
                        record.workFlowId && record.workFlowStatus == "0" ? <Tooltip title="撤回">
                            <Button icon="delete" size="small"
                                onClick={cancelProcedure instanceof Function && cancelProcedure.bind(null, record.workFlowId)} />
                        </Tooltip> : null
                    }
                </div>
            )
            return renderSpecial(value, record, com)
        }
    })
    return columns;
}
/* 添加 序号列 */
const addOrder = (columns) => {
    if (columns.some(item => item.id === "order")) return columns;
    columns.unshift({
        fixed: "left",
        dataIndex: "order",
        id: "order",
        key: "order",
        isData: true,
        freezeType: "1",
        title: "序号",
        parentId: null,
        width: 50,
        show: true,
        render: (value, record) => (renderSpecial(value, record, record.orderIndex))
    })
    return columns;
}
const initColumns = (columns, operFuns, cooperateArr) => {
    // 添加查看 操作列
    if (!columns.length) return [];
    columns = addCooperate(columns, operFuns, cooperateArr);
    columns = addOrder(columns);
    columns.forEach(item => {
        if (item.isData && item.id !== "coop" && item.id !== "order") {
            item.sorterCustom = true;
        }
    });
    /* columns.unshift({
        code: "1",
        dataIndex: "1",
        formId: "174fe6d6-4892-3338-dc80-4c13f4fa7dc6",
        id: "1",
        isData: true,
        isMain: true,
        isPrimaryKey: false,
        key: "1",
        parentId: null,
        sorterCustom: true,
        title: "地址",
        type: "location",
        width: 175,
    }) */
    return columns;
}
const proList = [
    { name: "全部流程", type: null /*-1*/ },
    { name: "运行中", type: 2 },
    { name: "驳回到开始", type: 1 },
    { name: "未提交", type: 0 },
    { name: "结束", type: 3 },
    { name: "未找到审批人", type: 4 },
    //{ name: "撤销(删除)", type: 5 },
]
// 初始化 条件筛选的 的 方法
const initFilterArr = (columns, filterArr) => {
    if (filterArr.length) return filterArr;
    let filterItems = columns.filter(item => item.filterShow);
    if (!filterItems.length) return [];
    filterItems.forEach(async existItem => {
        existItem.condition = optionObj[existItem.type][0]["value"]
        if (existItem.type === "location") {
            try {
                let res = await getLocation({ type: "" });
                existItem.provArr = res.data;
                existItem.cityArr = [];
                existItem.countArr = [];
                existItem.value = ["", "", ""];
            } catch (err) {
            
            }
        } else {
            if (existItem.type === "date") {
                existItem.extendedType = "0";
                existItem.value = null;
            }
        }
        return existItem;
    });
    return filterItems;
}
class AccountBook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // collapseHeight: null,
            showSearch: false,
            // filterArr: [],
            isProcedure: queryString.parse(props.history.location.search).formTemplateType, //0不带流程，1带流程
            // procedureState: proList[0]["type"],
            isShowImportModal: false, // 是否显示 导入页面
            isShowEditModal: false,//是否 能够 编辑
        }
        // 存储 数据 操作 方法
        let me = this;
        this.state.operFuns = {
            openFormRender: this.openFormRender.bind(me),
            cancelProcedure: this.cancelProcedure.bind(me),
        }
        this.state.columns = initColumns(props.accountBook.columns, me.state.operFuns, props.accountBook.cooperateArr);
        this.state.filterArr = initFilterArr(this.state.columns, []);

        this.showSearchFilter = this.showSearchFilter.bind(this);
        this.confirmRebuild = this.confirmRebuild.bind(this);
        this.changeConditionValue = this.changeConditionValue.bind(this);
        this.getLocationArr = this.getLocationArr.bind(this);
        this.changeColumnFixedEmit = this.changeColumnFixedEmit.bind(this);
        this.updateFields = this.updateFields.bind(this);
        this.getPageTableData = this.getPageTableData.bind(this);
        this.selecChange = this.selecChange.bind(this);
        this.refresh = this.refresh.bind(this);
        this.updateFilterCondition = this.updateFilterCondition.bind(this);
        this.updateModelData = this.updateModelData.bind(this);
        this.procedureChange = this.procedureChange.bind(this);
        this.changeSteps = this.changeSteps.bind(this);
        this.operateImportModal = this.operateImportModal.bind(this);
        this.importExcel = this.importExcel.bind(this);
        this.getExcelSheets = this.getExcelSheets.bind(this);
        this.getExcel = this.getExcel.bind(this);
        this.importFormData = this.importFormData.bind(this);
        this.storeImportExcelResultData = this.storeImportExcelResultData.bind(this);
        this.cooperateDel = this.cooperateDel.bind(this);
        this.deleteOperation = this.deleteOperation.bind(this);
        this.changeSortsArr = this.changeSortsArr.bind(this);
        this.openFormRender = this.openFormRender.bind(this);
        this.changeShowEditModalState = this.changeShowEditModalState.bind(this);
        this.cancelProcedure = this.cancelProcedure.bind(this);
        this.onCompleted = this.onCompleted.bind(this);
        this.setJson = this.setJson.bind(this);


        // 初始化数据
        props.dispatch({
            type: "accountBook/initData",
            payload: { ...queryString.parse(props.history.location.search) }
        });
        /* props.dispatch({ type: "accountBook/initData", payload: { tabId: "d26289b9-3181-41e2-954e-40f708a6f4c2", formTemplateId: "af030841-9c29-583b-744a-57814e519894" } }); */
        /* this.getCollapse = ele => {
            if (!ele) return;
            this.collapse = ele.clientHeight;
        } */
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (!is(prevState.columns, nextProps.accountBook.columns)) {
            return {
                columns: initColumns(nextProps.accountBook.columns, prevState.operFuns, nextProps.accountBook.cooperateArr),
                filterArr: initFilterArr(nextProps.accountBook.columns, prevState.filterArr)
            }
        }
        return null;
    }

    operateImportModal(boolean) {
        this.setState({
            isShowImportModal: boolean
        });
    }

    showSearchFilter() {
        this.setState({
            showSearch: !this.state.showSearch
        })
    }

    updateModelData(data) {
        this.props.dispatch({
            type: "accountBook/setHeaderAndTableData",
            payload: data
        })
    }

    /* 新的分页 */
    getPageTableData(page) {
        this.props.dispatch({
            type: "accountBook/changePage",
            payload: { pageIndex: page }
        });
    }

    selecChange(value) {
        this.props.dispatch({
            type: "accountBook/changePage",
            payload: { pageSize: value }
        });
    }

    /* 刷新数据 */
    refresh() {
        this.props.dispatch({
            type: "accountBook/getTableBody"
        })
    }

    updateFilterCondition() {
        if (!this.props.accountBook.fieldNameArr.length || !this.state.filterArr.length) return;
        this.props.dispatch({
            type: "accountBook/updateFilterCondition",
            payload: { fieldNameArr: this.props.accountBook.fieldNameArr, filterConditionArr: this.state.filterArr }
        });
    }

    /* 更新 字段显示 数据 */
    updateFields(columns, changeFieldsObj) {
        if (Object.keys(changeFieldsObj).some(item => ("show" in changeFieldsObj[item]))) {
            let fieldNameArr = columns.filter(item => item.isData && item.id !== "coop");
            fieldNameArr.forEach(item => {
                if (changeFieldsObj[item.id] && ("show" in changeFieldsObj[item.id])) {
                    item.show = changeFieldsObj[item.id].show
                }
            })
            this.props.dispatch({
                type: "accountBook/updateFieldTable",
                payload: { fieldNameArr, columns: columns.slice(0, -1) }
            });
        } else {
            this.updateModelData({ columns })
        }
    }

    // 重新配置渲染
    confirmRebuild({ changeFieldsObj, reset, originColumns }) {
        let me = this;
        let { columns, filterArr } = me.state;
        /* 如果是重置 就不用 走下面了 */
        if (reset) {
            filterArr.length = 0;
            columns = initColumns(originColumns).filter(item => item.id !== "coop");
            me.setState({ filterArr });
            me.updateModelData({ columns });
            return
        }
        const ids = Object.keys(changeFieldsObj);
        if (!ids.length) return;
        columns = columns.map(item => {
            if (item.isData && changeFieldsObj[item.id]) {
                if ("freezeType" in changeFieldsObj[item.id]) {
                    switch (changeFieldsObj[item.id]["freezeType"]) {
                        case "0":
                            item.fixed = null;
                            break;
                        case "1":
                            item.fixed = "left";
                            break;
                        case "2":
                            item.fixed = "right";
                    }
                }
                item = { ...item, ...changeFieldsObj[item.id] }
            }
            /* 当对于  操作行 的 show 改成 true  */
            if (item.id === "coop" && !item.show) {
                item = { ...item, show: true }
            }
            return item;
        });
        /* 如果 在  columns 中 存在 固定列 就 进行 分组展示 */
        let noFixedArr = columns.filter(item => !item.fixed);
        let fixedArr = columns.filter(item => item.fixed)
        columns = [...fixedArr.filter(item => item.fixed === "left"), ...noFixedArr, ...fixedArr.filter(item => item.fixed === "right")];
        /* 这里的 filter 需要 合并数据 */
        let existFilterShowFieldsObj = ids.reduce((prev, next) => {
            if ("filterShow" in changeFieldsObj[next]) {
                prev[next] = changeFieldsObj[next];
            }
            return prev;
        }, {});
        Object.keys(existFilterShowFieldsObj).forEach(async (id) => {
            let item = existFilterShowFieldsObj[id];
            if (item.filterShow) {
                // 如果 在 filterArr 中已经 存在 当前项，就删除了
                let existFilterArr = filterArr.filter(item => item.id === id)[0];
                if (existFilterArr) {
                    let index = filterArr.indexOf(existFilterArr);
                    filterArr.splice(index, 1);
                }
                let existItem = columns.filter(item => item.id === id);
                existItem[0].condition = optionObj[existItem[0].type][0]["value"]
                if (existItem[0].type === "location") {
                    try {
                        let res = await getLocation({ type: "" });
                        existItem[0].provArr = res.data;
                        existItem[0].cityArr = [];
                        existItem[0].countArr = [];
                        existItem[0].value = ["", "", ""];
                    } catch (err) {
                    
                    }
                    filterArr = filterArr.concat(existItem)
                    me.setState({ filterArr });
                } else {
                    if (existItem[0].type === "date") {
                        existItem[0].extendedType = "0";
                        existItem[0].value = null;
                    }
                    filterArr = filterArr.concat(existItem)
                }
            } else {
                let existItem = filterArr.filter(item => item.id === id)[0];
                let index = filterArr.indexOf(existItem);
                filterArr.splice(index, 1);
            }
        })
        this.updateFields(columns, changeFieldsObj);
        me.setState({
            columns,
            filterArr
        });
    }

    /* 在 table 组件内 设置 列 冻结 执行 */
    changeColumnFixedEmit(id, type) {
        let { columns } = this.state;
        let existItem = columns.filter(item => item.id === id)[0];
        let i = columns.indexOf(existItem);
        existItem.freezeType = type;
        columns.splice(i, 1);
        const groupColumns = columns.filter(v => (type === "0" ? (v.freezeType === type || !v.freezeType) : v.freezeType === type));
        let referIndex = type === "2" ? 0 : (groupColumns.length - 1);
        const joinIndex = groupColumns.length ? columns.indexOf(groupColumns[referIndex]) : (type === "1" ? 0 : columns.length);
        columns.splice(type === "0" ? joinIndex + 1 : joinIndex, 0, existItem);
        /* 是如果是 序列号 也要 ,这里还要判定 是否 有 删除项 */
        /* let orderItem = columns.filter(c => c.id === "order")[0];
        if (orderItem) {
            let orderIndex = columns.indexOf(orderItem);
            columns.splice(orderIndex, 1);
            columns.unshift(orderItem);
        } */
        this.setState({ columns });
    }

    /* 搜索 内的 逻辑 */
    changeConditionValue(id, keyValue, callBack) {
        let { filterArr } = this.state;
        filterArr = filterArr.map(v => {
            if (v.id === id) {
                v = { ...v, ...keyValue }
            }
            return v;
        })
        this.setState({ filterArr }, () => {
            callBack instanceof Function && callBack();
        });
    }

    async getLocationArr(tempObj) {
        let targetObj = {}, { filterArr } = this.state;
        ;
        if (tempObj.type !== "") {
            targetObj = { [tempObj.type]: tempObj.value };
        }
        let res = await getLocation(targetObj);
        let changeFilterItem = filterArr.filter(item => item.id === tempObj.id)[0],
            index = filterArr.indexOf(changeFilterItem),
            key = "";
        switch (tempObj.type) {
            case "ProId":
                key = "cityArr";
                break;
            case "CityId":
                key = "countArr";
                break;
        }
        changeFilterItem[key] = res.data;
        filterArr.splice(index, 1, changeFilterItem);
        this.setState({ filterArr });
    }

    /* 流程状态发生变化 */
    procedureChange(e) {
        this.props.dispatch({
            type: "accountBook/changeProcedureStatus",
            payload: { procedureState: e }
        });
    }

    // 更改 导入文件步骤
    changeSteps(steps) {
        this.props.dispatch({
            type: "accountBook/changeSteps",
            payload: { steps }
        });
    }

    // 上传excel文件
    importExcel(data, excelName) {
        this.props.dispatch({
            type: "accountBook/importExcel",
            payload: {
                excelData: data,
                excelName
            }
        });
    }

    // 获取 excel 的 sheet
    getExcelSheets() {
        this.props.dispatch({
            type: "accountBook/getExcelSheets"
        });
    }

    // 获取 excel 的 内容
    getExcel(index, excelName) {
        this.props.dispatch({
            type: "accountBook/getExcel",
            payload: {
                index, excelName
            }
        })
    }

    // 导入 表格 数据到 表单
    importFormData() {
        this.props.dispatch({
            type: "accountBook/importFormData"
        })
    }

    // 设置 storeImportExcelResultData
    storeImportExcelResultData(importExcelResultData) {
        this.props.dispatch({
            type: "accountBook/storeImportExcelResultData",
            payload: { importExcelResultData }
        });
    }

    // 操作 删除模块
    cooperateDel(bool) {
        this.setState({
            showDel: bool
        });
    }

    // 删除 操作
    deleteOperation(type) {
        let me = this;
        if (type !== "delAll" && !me.props.accountBook.tableData.filter(i => i.checked).length) {
            message.warning("请先选择删除项");
            return
        }
        confirm({
            title: '您确定清空所有数据吗？',
            content: `您当前打算${type === "delAll" ? "清空所有" : ("删除" + me.props.accountBook.tableData.filter(i => i.checked).length + "条")}数据，删除数据无法恢复`,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                let delArr = me.props.accountBook.tableData.reduce((prev, next) => {
                    if (next.del && next.checked && type === "del") {
                        prev.push(next.mainId);
                    } else if (next.del && type === "delAll") {
                        prev.push(next.mainId);
                    }
                    return prev;
                }, []);
                if (!delArr.length) return;
                me.props.dispatch({
                    type: "accountBook/deleteOperation",
                    payload: {
                        delArr
                    }
                });
            },
            onCancel() {
            
            },
        });
    }

    changeSortsArr(columns) {
        this.props.dispatch({
            type: "accountBook/changeSortsArr",
            payload: { columns }
        });
    }

    /* 编辑数据 提交 */
    onCompleted() {
        this.changeShowEditModalState(false);
        this.refresh();
    }

    /* 数据行 点击 修改方法 */
    openFormRender(type, id, renderType, workFlowId) {
        this.changeShowEditModalState(true, type, type === "modify" ? id : null, renderType, workFlowId);
    }

    // 是否显示 编辑页面
    changeShowEditModalState(bool, addType, id, renderType, workFlowId) {
        this.setState({
            isShowEditModal: bool,
            type: addType,
            id,
            renderType,
            workFlowId
        });
    }

    // 撤销 表单流程
    cancelProcedure(instanceId) {
        this.props.dispatch({
            type: "accountBook/cancelProcedure",
            payload: { instanceId }
        });
    }

    // 设置 台帐配置 信息
    setJson(style) {
        this.props.dispatch({
            type: "accountBook/setAccountJson",
            payload: { style }
        });
    }

    render() {
        const {/* collapseHeight, */ showSearch, filterArr, columns, isProcedure, /* procedureState, */ isShowImportModal, showDel, isShowEditModal, id, type, renderType, workFlowId } = this.state;
        let { pageIndex, pageSize, totalCount, templateId, FormTemplateVersionId, fieldNameArr, importSteps, stepsTwoTableData, excelName, excelSheetsArr, currentExcelValue, importExcelStatus, procedureState, cooperateArr, loading, tableData, moduleId } = this.props.accountBook;
        const footerProps = {
            isSet: true,
            columns: columns.filter(item => item.isData && item.id !== "coop" && item.id !== "order"),
            pageIndex,
            totalPage: Math.ceil(totalCount / pageSize),
            pageSize: pageSize,
            getPageTableData: this.getPageTableData,
            totalCount,
            selecChange: this.selecChange,
            refresh: this.refresh,
            confirmRebuild: this.confirmRebuild,
            setJson: this.setJson
        }
        let generateFilterConditionProps = {
            templateId,
            FormTemplateVersionId,
            layout: "horizon",//水平布局
            filterConditionArr: filterArr,
            changeConditionValue: this.changeConditionValue,
            getLocationArr: this.getLocationArr
        }
        // 传入 导入文件 的 props
        let importProps = {
            fieldNameArr,
            templateId,
            FormTemplateVersionId,
            importSteps,
            isShowImportModal,
            stepsTwoTableData,
            excelName,
            excelSheetsArr,
            currentExcelValue,
            importExcelStatus,
            changeSteps: this.changeSteps,
            operateImportModal: this.operateImportModal,
            importExcel: this.importExcel,
            getExcelSheets: this.getExcelSheets,
            getExcel: this.getExcel,
            importFormData: this.importFormData,
            storeImportExcelResultData: this.storeImportExcelResultData,
            refresh: this.refresh,
        }
        // 编辑 row 的
        let creditTableRowProps = {
            isShowEditModal,
            templateId,
            id,
            type,
            moduleId: moduleId,
            formTemplateType: isProcedure,
            FormTemplateVersionId,
            renderType,
            workFlowId,
            changeShowEditModalState: this.changeShowEditModalState,
            onCompleted: this.onCompleted,
            //暂时测试
            // query:queryString.parse(this.props.history.location.search)
        }
        return (
            <div className={styles.container} id='dataPreview'>
                {isShowImportModal ? <ImportFile {...importProps} /> : ""}
                {isShowEditModal ? <CreditTableRow {...creditTableRowProps} /> : ""}
                <div className={styles.headerContainer}>
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            {
                                isProcedure === "1" ? (
                                    <Select className={styles.proSelect} value={procedureState} onChange={this.procedureChange} defaultActiveFirstOption={true}>
                                        {
                                            proList.map(item => (
                                                <Select.Option key={item.type}>{item.name}</Select.Option>
                                            ))
                                        }
                                    </Select>
                                ) : null
                            }
                            <span className={`${styles.search} ${showSearch ? styles.searchIconActive : ""}`} onClick={this.showSearchFilter}><Icon
                                type={showSearch ? "down" : "up"} className={styles.searchIcon} />高级搜索</span>
                            {
                                showDel ? (
                                    <span>
                                        <Button type="primary" className={styles.opr}
                                            onClick={this.cooperateDel.bind(this, false)}>取消删除</Button>
                                        <Button type="primary" className={styles.opr}
                                            onClick={this.deleteOperation.bind(this, "del")}>删除选中</Button>
                                        <Button type="primary" className={styles.opr}
                                            onClick={this.deleteOperation.bind(this, "delAll")}>删除全部</Button>
                                    </span>
                                ) : null
                            }
                        </div>
                        <div className={styles.headerRight}>
                            {
                                cooperateArr.indexOf(AuthStatus.add) !== -1 || isProcedure === "1" ? <Button icon="plus" type="primary" className={styles.opr} onClick={this.openFormRender.bind(null, "add")}>{isProcedure === "1" ? "新增流程" : "新增"}</Button> : null
                            }
                            {
                                cooperateArr.indexOf(AuthStatus.export) !== -1 && isProcedure !== "1" ? <Button icon="export" className={styles.opr}>导出</Button> : null
                            }
                            {
                                cooperateArr.indexOf(AuthStatus.import) !== -1 && isProcedure !== "1" ? <Button icon="import" className={styles.opr} onClick={this.operateImportModal.bind(this, true)}>导入</Button> : null
                            }
                            {
                                (showDel || isProcedure === "1") || cooperateArr.indexOf(AuthStatus.del) === -1 ? null : <Button icon="delete" type="danger" className={styles.opr} onClick={this.cooperateDel.bind(this, true)}>删除</Button>
                            }
                        </div>
                    </div>
                    {
                        showSearch ? (<div className={styles.filterContainer}>
                            <Button icon="search" type="primary" className={styles.searchBtn}
                                onClick={this.updateFilterCondition}>查询</Button>
                            <GenerateFilterCondition {...generateFilterConditionProps} />
                        </div>) : null
                    }
                </div>
                {
                    columns.length && tableData ?
                        <TableCom columns={columns} fixedConfig={true} tableData={tableData}
                            loading={loading} removeHeight={`${(showSearch ? 120 : 0) + 94}px`}
                            resizeableCustom={true} showDelete={showDel}
                            changeSortsArr={this.changeSortsArr}
                            changeColumnFixedEmit={this.changeColumnFixedEmit} /> : null
                }
                <TableFooter {...footerProps} />
            </div>
        );
    }
}

export default connect(({ accountBook }) => ({ accountBook }))(AccountBook);
