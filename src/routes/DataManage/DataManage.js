import {Component} from "react"
import ReactDOM from 'react-dom';
import {Table, Icon, Select, Button, Input, Dropdown, Menu, Modal, message} from "antd"
import {connect} from 'dva';
import styles from "./DataManage.less"
import {List, Map, is} from "immutable"
import queryString from 'query-string';

import SearchName from "../../components/DataManage/SearchName";
import FilterCondition from "../../components/DataManage/FilterCondition"
import ImportFile from "../../components/DataManage/ImportFile";
import TableCom from "../../components/DataManage/TableCom"
import CreditTableRow from "../../components/DataManage/CreditTableRow"
// import TableFooter from "../../components/BookAddress/MemberCom/TableFooter"
import TableFooter from "../../components/FormControl/common/TableFooter"

const Option = Select.Option;
const confirm = Modal.confirm;

class DataManage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowBatchOper: 0, // 0为隐藏 1为显示 批量操作 2为 批量删除
            allScreen: false,
            // operFeild: false,
            openCondition: false,
            selectedRows: [], //选中项数组
            isShowImportModal: false, // 是否显示 导入页面
            isShowEditModal: false, //是否显示 编辑页面
        }
        this.changeSelectedRows = this.changeSelectedRows.bind(this);
        this.changeSortsArr = this.changeSortsArr.bind(this);
        this.getPageTableData = this.getPageTableData.bind(this);
        this.selecChange = this.selecChange.bind(this);
        this.deleteOperation = this.deleteOperation.bind(this);
        this.openFormRender = this.openFormRender.bind(this);
        this.refresh = this.refresh.bind(this);
        this.onCompleted = this.onCompleted.bind(this);
        this.updateFieldTable = this.updateFieldTable.bind(this);
        this.updateColumns = this.updateColumns.bind(this);
        // 初始化数据
        props.dispatch({type: "dataManage/initData", payload: {...queryString.parse(props.history.location.search)}});
        // window.addEventListener("keydown", function (e) {
        
        // }, false);
    }

    shouldComponentUpdate(nextProps = {}, nextState = {}) {
        const thisProps = this.props || {}, thisState = this.state || {};

        if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
            Object.keys(thisState).length !== Object.keys(nextState).length) {
            return true;
        }

        for (const key in nextProps) {
            if (thisProps[key] !== nextProps[key] || !is(thisProps[key], nextProps[key])) {
                return true;
            }
        }

        for (const key in nextState) {
            if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
                return true;
            }
        }
        return false;
    }

    // 是否显示 编辑页面
    changeShowEditModalState(bool, addType, id,workFlowId) {
        this.setState({
            isShowEditModal: bool,
            type: addType,
            id,
            workFlowId
        });
    }
    // 显示批量操作列表
    handleMenuClick(e) {
        switch (e.key) {
            case "0":
                this.showBatchOper(1);
                break;
            default:
            
        }
    }

    // 批量操作
    showBatchOper(e) {
        this.setState({
            isShowBatchOper: e
        });
    }

    // 取消操作
    cancelOper() {
        this.setState({
            isShowBatchOper: 0
        });
    }

    // 全屏
    showAllScreen() {
        this.setState({
            allScreen: !this.state.allScreen
        })
    }

    // 显示筛选
    showFilterCondition(e) {
        e.stopPropagation();
        this.setState({
            openCondition: true,
            // operFeild: false
        });
    }

    // 显示字段
    showFeildNameOper(e) {
        e.stopPropagation();
        this.setState({
            // operFeild: true,
            openCondition: false
        });
    }

    deleteOperation(type) {
        let me = this;
        if (type !== "delAll" && !me.props.dataManage.tableData.filter(i => i.checked).length) {
            message.warning("请先选择删除项");
            return
        }
        confirm({
            title: '您确定清空所有数据吗？',
            content: `您当前打算${type === "delAll" ? "清空所有" : ("删除" + me.props.dataManage.tableData.filter(i => i.checked).length + "条")}数据，删除数据无法恢复`,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                let delArr = me.props.dataManage.tableData.reduce((prev, next) => {
                    if (next.del && next.checked && type === "del") {
                        prev.push(next.mainId);
                    } else if (next.del && type === "delAll") {
                        prev.push(next.mainId);
                    }
                    return prev;
                }, []);
                if (!delArr.length) return;
                me.props.dispatch({
                    type: "dataManage/deleteOperation",
                    payload: {
                        delArr
                    }
                });
            },
            onCancel() {
            
            },
        });
    }

    /* 这里 运用于 原声的 rowSelection
    // 清空所有记录
    deleteAll() {
        let me = this;
        let { dispatch } = this.props;
        confirm({
            title: '您确定清空所有数据吗？',
            content: '您当前打算清空所有数据，免费版删除数据无法恢复',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                dispatch({
                    type: "dataManage/deleteAll"
                });
            },
            onCancel() {
            
            },
        });
    }
    // 删除选中项
    deleteSelectedItem() {
        let { selectedRows } = this.state;
        let { dispatch } = this.props;
        if (!selectedRows.length) {
            message.warning("请选择需要操作的数据");
            return;
        }
        confirm({
            title: '您确定要删除选中数据吗？',
            content: `您当前删除${selectedRows.length}调数据，免费版删除数据无法恢复`,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                dispatch({
                    type: "dataManage/deleteSelectedItem",
                    payload: {
                        selectedRows
                    }
                });
            }
        });

    } */

    // 点中container
    containerClick(e) {
        e.stopPropagation();
        this.setState({
            // operFeild: false,
            openCondition: false
        });
    }

    // 更改 导入文件步骤
    changeSteps(steps) {
        this.props.dispatch({
            type: "dataManage/changeSteps",
            payload: {steps}
        });
    }

    // 选择操作
    /* rowSelection() {
        let me = this;
        return me.state.isShowBatchOper ? {
            fixed: true,
            onSelect: function (record, selected, selectedRows, nativeEvent) {
                me.setState({
                    selectedRows
                });
            },
            onSelectAll: function (selected, selectedRows, changeRows) {
                me.setState({
                    selectedRows
                });
            },
        } : undefined
    } */
    operateImportModal(boolean) {
        this.setState({
            isShowImportModal: boolean
        });
    }

    // 过滤columns,在页面的显示
    _filterColumns(columns) {
        if (!columns.length) return;
        for (let i = 0; i < columns.length; i++) {
            let item = columns[i];
            if (item.hasOwnProperty("colSpan")) {
                columns.splice(i, 1);
                i--;
                continue;
            }
            if (item.children && item.children.length) {
                this._filterColumns(item.children);
            }
        }
        return columns;
    }

    // 是否固定筛选条件
    isFixedFilterModal(isFixed) {
        this.props.dispatch({
            type: "dataManage/isFixedFilterModal",
            payload: {
                isFixed: isFixed
            }
        });
    }

    // 上传excel文件
    importExcel(data, excelName) {
        this.props.dispatch({
            type: "dataManage/importExcel",
            payload: {
                excelData: data,
                excelName
            }
        });
    }

    // 获取 excel 的 sheet
    getExcelSheets() {
        this.props.dispatch({
            type: "dataManage/getExcelSheets"
        });
    }

    // 获取 excel 的 内容
    getExcel(index, excelName) {
        this.props.dispatch({
            type: "dataManage/getExcel",
            payload: {
                index, excelName
            }
        })
    }

    updateFieldTable(objData) {
        this.props.dispatch({
            type: "dataManage/updateFieldTable",
            payload: {...objData}
        });
    }
    updateColumns(objData){
        this.props.dispatch({
            type:"dataManage/setHeaderAndTableData",
            payload:{...objData}
        })
    }

    // 对于 筛选 字段 的 反哺 的 fileNameArr 和 Column
    backNewfieldArr({fieldNameArr}) {
        this.setState({
            newFiledNameArr: fieldNameArr,
        });
    }

    // 导入 表格 数据到 表单
    importFormData() {
        this.props.dispatch({
            type: "dataManage/importFormData"
        })
    }

    // 设置 storeImportExcelResultData
    storeImportExcelResultData(importExcelResultData/* , FormTemplateVersionId */) {
        this.props.dispatch({
            type: "dataManage/storeImportExcelResultData",
            payload: {importExcelResultData/* , FormTemplateVersionId */}
        });
    }

    // 设置 新的 state
    updateFilterCondition(fieldNameArr, filterConditionArr) {
        this.props.dispatch({
            type: "dataManage/updateFilterCondition",
            payload: {fieldNameArr, filterConditionArr}
        });
    }

    /* 由于 现有的 rowSelection 不能 满足 删除的 需求，这里进行 第二种方法 实现 */

    // 改变 选中项
    changeSelectedRows({type, bool, id}) {
        let {selectedRows} = this.state;
        if (type === "item") {
            if (bool) {
                selectedRows.push({key: id});
            } else {
                let changeItem = selectedRows.filter(item => item.id === id)[0];
                const index = selectedRows.indexOf(changeItem);
                selectedRows.splice(index, 1);
            }
        }
        if (type === "all") {
            selectedRows.length = 0;
            if (bool) {

            }
        }
        this.setState({
            selectedRows
        });
    }

    /* 排序 columns 的方法 */
    changeSortsArr(columns) {
        this.props.dispatch({
            type: "dataManage/changeSortsArr",
            payload: {columns}
        });
    }

    /* 老的 分页 */
    /* getPageTableData({ type, value }) {
        let { pageIndex } = this.props.dataManage;
        if (value) {
            pageIndex = value;
        } else {
            pageIndex = type === "next" ? pageIndex - 0 + 1 : pageIndex - 0 - 1;
        }
        this.props.dispatch({
            type: "dataManage/changePage",
            payload: { pageIndex }
        });
    } */

    /* 新的分页 */
    getPageTableData(page) {
        this.props.dispatch({
            type: "dataManage/changePage",
            payload: {pageIndex: page}
        });
    }

    selecChange(value) {
        this.props.dispatch({
            type: "dataManage/changePage",
            payload: {pageSize: value}
        });
    }

    /* 数据行 点击 修改方法 */
    openFormRender(type, id,workFlowId) {
        this.changeShowEditModalState(true, type, type === "modify" ? id : null,workFlowId);
    }

    /* 刷新数据 */
    refresh() {
        this.props.dispatch({
            type: "dataManage/getTableBody"
        })
    }

    /* 编辑数据 提交 */
    onCompleted() {
        this.changeShowEditModalState(false);
        this.refresh();
    }

    render() {
        let {tableData, menuOperate, importSteps, isFixedFilter, stepsTwoTableData, excelName, excelSheetsArr, currentExcelValue, fieldNameArr, importExcelStatus, filterConditionArr, templateId, FormTemplateVersionId, columns,loading} = this.props.dataManage;
        /* 分页的数据 */
        let {pageIndex, pageSize, totalCount} = this.props.dataManage;
        // 注意深层对象引用
        // let columns = List(this.props.dataManage.columns).toJS();
        columns = this._filterColumns(columns);
        let {isShowBatchOper, allScreen, /* operFeild, */ openCondition, isShowImportModal, isShowEditModal, id, type,workFlowId} = this.state;
        let menuItem = menuOperate.map((v, i) => (
            <Menu.Item key={i} style={{fontSize: "12px"}}>
                <Icon type={v.icon}/>{v.name}
            </Menu.Item>
        ));
        let menu = (
            <Menu onClick={this.handleMenuClick.bind(this)}>
                {menuItem}
            </Menu>
        )
        // 传入 筛选 提交的 props
        let conditionProps = {
            templateId,
            FormTemplateVersionId,
            fieldNameArr,
            isFixedFilter,
            filterConditionArr,
            isFixedFilterModal: this.isFixedFilterModal.bind(this),
            containerClick: this.containerClick.bind(this),
            updateFilterCondition: this.updateFilterCondition.bind(this),
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
            changeSteps: this.changeSteps.bind(this),
            operateImportModal: this.operateImportModal.bind(this),
            importExcel: this.importExcel.bind(this),
            getExcelSheets: this.getExcelSheets.bind(this),
            getExcel: this.getExcel.bind(this),
            importFormData: this.importFormData.bind(this),
            storeImportExcelResultData: this.storeImportExcelResultData.bind(this),
            refresh: this.refresh.bind(this),
        }
        // 筛选 字段的
        let searchNameProps = {
            columns: this.props.dataManage.columns,
            fieldNameArr,
            backNewfieldArr: this.backNewfieldArr.bind(this)
        }
        // 编辑 row 的
        let creditTableRowProps = {
            ...searchNameProps,
            isShowEditModal,
            id,
            templateId,
            workFlowId,
            formTemplateType: queryString.parse(this.props.history.location.search).formTemplateType,
            moduleId: queryString.parse(this.props.history.location.search).moduleId,
            type,
            FormTemplateVersionId,
            changeShowEditModalState: this.changeShowEditModalState.bind(this),
            onCompleted: this.onCompleted,
        }
        // 分页条的 props
        /* let tableFooterPorps = {
            pageIndex,
            totalCount,
            pageSize,
            totalPage: Math.ceil(totalCount / pageSize),
            showSelect: true,
            getPageTableData: this.getPageTableData,
            selecChange: this.selecChange,
        } */
        const tableFooterPorps = {
            isSet: false,
            pageIndex,
            totalPage: Math.ceil(totalCount / pageSize),
            pageSize: pageSize,
            getPageTableData: this.getPageTableData,
            totalCount,
            selecChange: this.selecChange,
            refresh: this.refresh
        }
        return (
            <div className={styles.customContainer} id='dataPreview'>
                <div
                    className={`${styles.content} ${allScreen ? styles.fullScreen : ""} ${isFixedFilter ? styles.fixedContent : ""}`}
                    onClick={this.containerClick.bind(this)}>
                    {isShowImportModal ? <ImportFile {...importProps} /> : ""}
                    {isShowEditModal ? <CreditTableRow {...creditTableRowProps} /> : ""}
                    <div className={styles.cooperate}>
                        {
                            !isShowBatchOper ? (
                                <div className={styles.cooperateLeft}>
                                    <div className={`${styles.cooperateItem} ${styles.cooperateSpecial}`}
                                         onClick={this.openFormRender.bind(null, "add")}>
                                        <Icon type="plus"/>
                                        <span className={styles.cooperateText}>新建</span>
                                    </div>
                                    <div className={styles.cooperateItem} onClick={() => {
                                        this.operateImportModal(true);
                                    }}>
                                        <Icon type="download"/>
                                        <span className={styles.cooperateText}>导入</span>
                                    </div>
                                    <div className={styles.cooperateItem}>
                                        <Icon type="upload"/>
                                        <span className={styles.cooperateText}>导出</span>
                                    </div>
                                    <div className={styles.cooperateItem}>
                                        <Dropdown overlay={menu} trigger={['click']}>
                                            <div className="ant-dropdown-link">
                                                <Icon type="plus"/>
                                                <span className={styles.cooperateText}>批量操作</span>
                                                <Icon type="down"/>
                                            </div>
                                        </Dropdown>
                                    </div>
                                    <div className={styles.cooperateItem} onClick={this.showBatchOper.bind(this, 2)}>
                                        <Icon type="plus"/>
                                        <span className={styles.cooperateText}>删除</span>
                                    </div>
                                    <div className={styles.cooperateItem}>
                                        <Icon type="plus"/>
                                        <span className={styles.cooperateText}>数据回收站</span>
                                    </div>
                                </div>
                            ) : ""
                        }
                        {
                            isShowBatchOper ? (
                                <div className={styles.cooperateLeft}>
                                    <div className={styles.cooperateItem} onClick={this.cancelOper.bind(this)}>
                                        <span className={styles.cooperateText}>取消操作</span>
                                    </div>
                                    {isShowBatchOper == 1 && <div className={styles.cooperateItem}>
                                        <span className={styles.cooperateText}>修改选中</span>
                                    </div>}
                                    {isShowBatchOper == 1 && <div className={styles.cooperateItem}>
                                        <span className={styles.cooperateText}>修改全部</span>
                                    </div>}
                                    {isShowBatchOper == 2 && <div className={styles.cooperateItem}
                                                                  onClick={this.deleteOperation.bind(this, "del")}>
                                        <span className={styles.cooperateText}>删除选中</span>
                                    </div>}
                                    {isShowBatchOper == 2 && <div className={styles.cooperateItem}
                                                                  onClick={this.deleteOperation.bind(this, "delAll")}>
                                        <span className={styles.cooperateText}>清空全部</span>
                                    </div>}
                                </div>
                            ) : ""
                        }
                        <div className={styles.cooperateRight}>
                            <div style={{width: "4%"}} className={styles.cooperateItem}
                                 title={allScreen ? "取消全屏" : "全屏"} onClick={() => {
                                this.showAllScreen();
                                if (isFixedFilter) {
                                    this.isFixedFilterModal();
                                }
                            }}>
                                <Icon type="scan" style={{fontSize: "16px"}}/>
                            </div>
                            <div className={styles.cooperateItem} style={{position: "relative"}}
                                 onClick={this.showFeildNameOper.bind(this)}>
                                <Dropdown trigger={["click"]} overlay={<SearchName {...searchNameProps} />}
                                          overlayClassName={styles.searchOverLay} placement="bottomRight"
                                          onVisibleChange={(visible) => {
                                              let me = this;
                                              if (!visible && me.state.newFiledNameArr) {
                                                  this.updateFieldTable({fieldNameArr: me.state.newFiledNameArr});
                                              }
                                          }}>
                                    <div>
                                        <Icon type="eye"/>
                                        <span className={styles.cooperateText}>显示字段</span>
                                    </div>
                                </Dropdown>

                                {/* {operFeild && <SearchName {...searchNameProps} />} */}
                            </div>
                            {!isFixedFilter ? (
                                <div className={styles.cooperateItem} style={{position: "relative"}}
                                     onClick={this.showFilterCondition.bind(this)}>
                                    <Icon type="filter"/>
                                    <span className={styles.cooperateText}>筛选条件</span>
                                    {openCondition && <FilterCondition {...conditionProps} />}
                                </div>
                            ) : ""}
                        </div>
                    </div>
                    {
                        columns && tableData ? <TableCom resizeableCustom={true} columns={columns} tableData={tableData}
                                                         removeHeight={"96px"} loading={loading}
                                                         updateColumns={this.updateColumns}
                                                         showDelete={Boolean(isShowBatchOper)} /* rowSelection={this.rowSelection.bind(this)} */
                                                         rowClick={this.openFormRender.bind(null, "modify")}
                                                         changeSortsArr={this.changeSortsArr}/> : null
                    }
                    <TableFooter {...tableFooterPorps} />
                </div>
                {isFixedFilter && (
                    <div className={styles.fixedFilter}>
                        <FilterCondition {...conditionProps} />
                    </div>
                )}
            </div>
        );
    }
}

export default connect(({dataManage}) => ({dataManage}))(DataManage);
