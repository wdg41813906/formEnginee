import React from "react";
import { Table, Icon, Popconfirm, Modal, message,Popover, Select, Radio } from "antd";
import subStyles from "./SubForm.less";
import com from "../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import OperationPower from "./Attribute/OperationPower";
import RENDERSTYLE from "../../enums/FormRenderStyle";
import Title from "./Attribute/Title";
import Desc from "./Attribute/Desc";
import Pagination from "./Attribute/Pagination";
import FormControlType from "../../enums/FormControlType";
import CollapseCom from "./Collapse/CollapseCom";
import Relation from "./Attribute/RelationTable";
import { LINKTYPE } from "./DataLinker/DataLinker";
import { fromJS } from "immutable";
import { buildControlAuthority } from "commonForm";
import DescFormatter from "./common/DescFormatter";

const summaryRowStyle = { backgroundColor: "#fafafa" };

function initFormItemBase() {
    let formContainerBase = com.formContainerBase();
    formContainerBase = {
        ...formContainerBase,
        type: "SubFormPanel",
        typeName: "子表单",
        name: "子表单", //标题
        formId: com.Guid(),
        defaultDatasource: [],
        tableWidth: null,
        autoFill: true,
        pageIndex: 1,
        pageSize: 100,
        totalCount: 0
    };
    return formContainerBase;
}

const HeaderCell = (props) => {
    if (props.renderSubItemHeader) {
        return props.renderSubItemHeader(props.id, props.renderStyle, {
            colSpan: props.colSpan,
            rowSpan: props.rowSpan,
            style: { textAlign: props.textAlign }
        });
    } else {
        let { colType, textAlign, ...other } = props;
        switch (colType) {
            case "header":
                return <th style={{ padding: 4, width: 50, textAlign: "center" }} {...other}>{props.children}</th>;
            case "operation":
                return <th style={{ padding: 4, minWidth: 100, textAlign: "center" }} {...other}>{props.children}</th>;
            case "tableHeader":
                return <th style={{ padding: 4, textAlign }} {...other}>
                    {
                        !props.desc ?
                            null
                            :
                            <Popover content={<DescFormatter descJson={props.desc} horizontal={true}/>} title="描述信息"
                                     trigger="hover">
                                <Icon type="info-circle" style={{
                                    padding: "0 6px",
                                    color: "rgb(16, 142, 233)"
                                }}/>
                            </Popover>
                    }
                    {props.children}</th>;
            default:
                return <th style={{ padding: 4, textAlign }} {...other}>{props.children}</th>;
        }
    }
};

class BodyCell extends React.Component {
    shouldComponentUpdate(nextProps) {
        if (this.props.colType === "operation" || this.props.renderSubItemCell)
            return true;
        let v = this.props.value !== nextProps.value || this.props.editMode !== nextProps.editMode ||
            this.props.proxyIndex !== nextProps.proxyIndex || this.props.proxyIndex === "summary" ||
            this.props.disabled !== nextProps.disabled || this.props.hidden !== nextProps.hidden ||
            this.props.readOnly !== nextProps.readOnly;
        return v;
    }

    render() {
        let {
            colType, editMode, design, proxyIndex, rowIndex, value, renderSubItemCell, id, readOnly,
            selected, saveRow, cancelSaveRow, editRow, copyRow, removeRow, isSummaryRow, help, validateStatus,
            onVisible, showDeleteModal, operationRemove, operationCancel, textAlign, headerAlign, authority,
            ...other
        } = this.props;
        if (isSummaryRow) {
            switch (colType) {
                case "header":
                    return <td style={{ textAlign: "center", fontSize: "16px", width: 50, ...summaryRowStyle }}>汇总</td>;
                case "formItem":
                    return <td style={{ textAlign, ...summaryRowStyle }}>{this.props.children}</td>;
                default:
                case "operation":
                    return <td style={{ textAlign: "center", fontSize: "16px", minWidth: 100, ...summaryRowStyle }}/>;
            }
        }
        else {
            switch (colType) {
                case "formItem":
                    return this.props.renderSubItemCell({
                        id,
                        value,
                        editMode,
                        authority,
                        proxyIndex,
                        help,
                        validateStatus,
                        textAlign
                    });
                case "header":
                    return <td
                        style={{ textAlign: "center", fontSize: "16px", width: 50 }}>
                        <span id={other.rowId}>{proxyIndex + 1}</span>
                    </td>;
                case "operation":
                    const edit = () => {
                        editRow(rowIndex);
                    };
                    const copy = () => {
                        copyRow(rowIndex);
                    };
                    return <td style={{ textAlign: "center", fontSize: "16px", minWidth: 100 }} {...other}>
                        {
                            readOnly ?
                                null :
                                selected ?
                                    <React.Fragment>
                                        <a title='保存' onClick={saveRow}><Icon type='check'/></a>
                                        <a title='取消' style={{ marginLeft: 10 }} onClick={cancelSaveRow}><Icon
                                            type='close'/></a>
                                    </React.Fragment> :
                                    <React.Fragment>
                                        <a title='编辑' onClick={edit}><Icon type='edit'/></a>
                                        <a style={{ marginLeft: 10 }} title='复制' onClick={copy}><Icon type='copy'/></a>
                                        <Popconfirm title='确定删除当前行数据?'
                                                    onConfirm={operationRemove}
                                                    onCancel={operationCancel}
                                                    onVisibleChange={() => onVisible(rowIndex)}
                                                    visible={showDeleteModal}
                                        >
                                            <a title='删除' style={{ marginLeft: 10 }}><Icon type='delete'/></a>
                                        </Popconfirm>
                                    </React.Fragment>
                        }
                    </td>;
                default:
                    //console.log(other.children);
                    let st = {};
                    try {
                        st = this.props.children[2].props.children.props.rowIndex === "summary" ? summaryRowStyle : {};
                    }
                    catch (e) {

                    }
                    return <td style={{ textAlign, ...st }} {...other}>{other.children}</td>;
            }
        }
    }
}

const numberFixed = (v, decimalLen) => {
    if (isNaN(v))
        return 0;
    return decimalLen ? parseFloat(parseFloat(v).toFixed(decimalLen)) : parseFloat(v);
};

// 统计 简单的公式
//"1"求和,"2"平均,"3"最大值,"4"最小值,"5"计数
let sum = (fieldsArr, decimalLen) => {
    let v = fieldsArr.reduce((prev, next) => {
        return prev + next;
    }, 0);
    return numberFixed(v, decimalLen);
};
let average = (fieldsArr, decimalLen) => {
    const sumNumber = sum(fieldsArr);
    let v = sumNumber / fieldsArr.length;
    return numberFixed(v, decimalLen);
};
let max = (fieldsArr, decimalLen) => {
    let v = Math.max.apply(null, fieldsArr);
    return numberFixed(v, decimalLen);
};
let min = (fieldsArr, decimalLen) => {
    let v = Math.min.apply(null, fieldsArr);
    return numberFixed(v, decimalLen);
};
let num = (fieldsArr) => {
    return fieldsArr.length;
};
const calculateObj = {
    "1": sum, "2": average, "3": max, "4": min, "5": num
};

function buildSubFormColumnTree(id, columns) {
    let children = columns.filter(a => a.container === id);
    children.forEach(a => {
        let subChildren = buildSubFormColumnTree(a.key, columns);
        if (subChildren.length > 0)
            a.children = (a.children || []).concat(subChildren);
    });
    return children;
}

class SubForm extends React.Component {
    constructor(props) {
        super(props);
        let design = props.renderStyle === RENDERSTYLE.Design;
        this.state = {
            design,
            newRow: false,
            editRowIndex: -1,
            editRowDataBak: null,
            tableWidth: null,
            componentsWidth: null,
            selectedRowKeys: [],
            summaryData: {},
            tableCompoents: {
                body: { cell: BodyCell },
                header: { cell: HeaderCell }
            },
            onKeyIndex: null,
            summaryRow: true,
            dataIndex: null,
            editType: false,
            editVisible: false,
            changeValue: {}
        };
        props.setProxy({ primaryKeyId: props.primaryKeyId });
        this.addGatherFieldsRow = this.addGatherFieldsRow.bind(this);
    }

    componentDidUpdate(nextProps, prevState) {
        let { summaryRow } = this.state;
        if (summaryRow) {
            let summaryData = this.addGatherFieldsRow(nextProps);
            if (JSON.stringify(summaryData) !== JSON.stringify(prevState.summaryData)) {
                this.setState({ summaryData });
            }
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown);
    }


    onChangeAll = data => {
        this.setState({
            changeValue: data
        })
    }

    handleOk = () => {
        const { selectedRowKeys, changeValue, dataIndex, editType } = this.state;
        if(changeValue.value === undefined && editType){
            return;
        }

        const { proxyStorage: { dataSource }, getItemBase } = this.props;
        const proxyIndexs = dataSource.filter(e => selectedRowKeys.includes(e.key)).map(e => e.proxyIndex);
        const groupItems = getItemBase(dataIndex).toJS().groupItems;

        let list = [];
        if (editType) {
            if (groupItems) {
                for (const key in groupItems) {
                    const item = groupItems[key];
                    list = list.concat(proxyIndexs.map(proxyIndex => ({ proxyIndex, items: [{ id: item.id, data: { value: changeValue.value[key] } }] })))
                }
            } else {
                list = proxyIndexs.map(proxyIndex => ({ proxyIndex, items: [{ id: dataIndex, data: changeValue }] }))
            }

        } else {
            if (groupItems) {
                for (const key in groupItems) {
                    const item = groupItems[key];
                    list = list.concat(proxyIndexs.map(proxyIndex => ({ proxyIndex, items: [{ id: item.id, data: { value: undefined } }] })))
                }
            } else {
                list = proxyIndexs.map(proxyIndex => ({ proxyIndex, items: [{ id: dataIndex, data: { value: undefined } }] }))
            }
        }
        this.props.setValue(list);
        this.setState({
            editVisible: false,
            changeValue: {}
        })
    }

    onKeyDown = (e) => {
        let { onKeyIndex } = this.state;
        if (typeof onKeyIndex === "number") {
            switch (e.keyCode) {
                case 13:
                    this.removeRow(onKeyIndex);
                    this.setState({ onKeyIndex: null });
                    break;
                default:
                    // console.log(e.code, e.keyCode)
                    break;
            }
        }
    };

    getTableContainer = (ele) => {
        if (!ele) return;
        this.setState({ tableWidth: ele.clientWidth });
    };

    addRow = () => {
        let { editRowIndex, design } = this.state;
        let { onChange, primaryKeyId, setProxy, proxyStorage: { dataSource }, reset } = this.props;
        if (dataSource[editRowIndex] !== undefined) {
            this.setState({ editRowIndex: -1 });
        }
        if (editRowIndex !== -1 && dataSource[editRowIndex] !== undefined) {
            return;
        }
        let rowData = this.props.buildSubFormRowData();
        let resetList = [];
        for (let key in rowData) {
            resetList.push(key);
            rowData[key] = { value: rowData[key] };
        }
        rowData.key = rowData[primaryKeyId].value;
        dataSource.push(rowData);
        dataSource.forEach((item, i) => {
            item.proxyIndex = i;
        });
        if (design) onChange({ defaultDatasource: dataSource });
        setProxy({ dataSource, editRowIndex: rowData.key });
        reset(resetList, dataSource.length - 1);
        this.setState({ editRowIndex: rowData[primaryKeyId].value, newRow: true });
        this.props.onChange({ readyToSubmit: false });
    };

    saveRow = () => {
        let { onChange, proxyStorage: { dataSource }, setProxy } = this.props;
        if (this.state.design)
            onChange({ defaultDatasource: dataSource });
        let valid = true;
        let { key, ...other } = dataSource.find(a => a.key === this.state.editRowIndex);// [this.state.editRowIndex];
        for (let item in other) {
            if (other[item].validateStatus === "error") {
                valid = false;
                break;
            }
        }
        if (!valid) {
            message.error("保存的数据无法通过验证！");
            return;
        }
        let summaryData = this.addGatherFieldsRow();
        this.setState({ editRowIndex: -1, newRow: false, summaryData });
        setProxy({ editRowIndex: -1 });
        this.props.onChange({ readyToSubmit: true });
    };

    editRow = (editRowIndex) => {
        this.setState({
            editRowDataBak: fromJS(this.props.proxyStorage.dataSource.find(a => a.key === editRowIndex)).toJS(),
            editRowIndex
        });
        this.props.setProxy({ editRowIndex });
        this.props.onChange({ readyToSubmit: false });
    };

    copyRow = (rowIndex) => {
        let dataSource = this.props.proxyStorage.dataSource;
        let copyRowData = dataSource.find(a => a.key === rowIndex);//[proxyIndex];
        let proxyIndex = dataSource.indexOf(copyRowData);
        if (copyRowData) {
            copyRowData = fromJS(copyRowData).toJS();
            if (copyRowData[this.props.primaryKeyId])
                copyRowData[this.props.primaryKeyId] = { value: com.Guid() };
            copyRowData.key = copyRowData[this.props.primaryKeyId].value;
            dataSource.splice(proxyIndex + 1, 0, copyRowData);
            dataSource.forEach((item, i) => {
                item.proxyIndex = i;
            });
            this.props.setProxy({ dataSource: [...dataSource] });
        }
    };

    cancelSaveRow = () => {
        let dataSource;
        let { newRow, editRowIndex, editRowDataBak, design } = this.state;
        let proxy = { editRowIndex: -1 };
        if (newRow) {
            dataSource = this.props.proxyStorage.dataSource;
            let proxyRow = dataSource.find(a => a.key === editRowIndex);
            let proxyIndex = dataSource.indexOf(proxyRow);
            dataSource.splice(proxyIndex, 1);
            proxy.dataSource = dataSource;
        } else {
            dataSource = this.props.proxyStorage.dataSource;
            let proxyRow = dataSource.find(a => a.key === editRowIndex);
            let proxyIndex = dataSource.indexOf(proxyRow);
            dataSource[proxyIndex] = editRowDataBak;
            proxy.dataSource = dataSource;
        }
        if (design) this.props.onChange({ defaultDatasource: dataSource });
        this.setState({ editRowIndex: -1, newRow: false }, function() {
            this.props.onChange({ readyToSubmit: true });
            this.props.setProxy(proxy);
        });
    };

    buildSubFormColumn = (dataSource) => {
        let { tableWidth, editRowIndex, design, onKeyIndex } = this.state;
        let readOnly = this.props.readOnly || this.props.disabled && !design;
        let columns = this.props.initSubFormColumn();
        if (!design) {
            columns.filter(a => a.displayCheck).forEach(c => {
                if (c.isGroup) {
                    if (dataSource.some(a => a[c.key] && a[c.key].authority && buildControlAuthority(a[c.key].authority).hidden === false))
                        c.displayCheck = false;
                }
                else if (dataSource.some(a => buildControlAuthority(a[c.dataIndex].authority || {}).hidden === false)) {
                    c.displayCheck = false;
                }
            });
            columns = columns.filter(a => a.displayCheck !== true);
        }
        for (let i = 0; i < columns.length; i++) {
            const element = columns[i];
            if (element.fixed === "left") columns.unshift(columns.splice(i, 1)[0]);
            else if (element.fixed === "right") columns.push(columns.splice(i, 1)[0]);
        }
        columns.forEach(col => {
            if (design) {
                col.onHeaderCell = column => {
                    return {
                        id: column.key,
                        title: col.title,
                        renderSubItemHeader: this.props.renderSubItemHeader,
                        renderStyle: this.props.renderStyle,
                        textAlign: col.headerAlign,
                        colType: "tableHeader",
                        desc: col.desc
                    };
                };
            }
            else {
                col.onHeaderCell = column => {
                    return {
                        id: column.key,
                        title: col.title,
                        textAlign: col.headerAlign,
                        colType: "tableHeader",
                        desc: col.desc
                    };
                };
            }
            if (col.children) {
                col.children.forEach(c => {
                    if (design) {
                        c.onHeaderCell = a => {
                            return {
                                id: a.key,
                                title: c.title,
                                renderSubItemHeader: this.props.renderSubItemHeader,
                                renderStyle: this.props.renderStyle,
                                textAlign: col.headerAlign,
                                colType: "tableHeader",
                                desc: col.desc
                            };
                        };
                    }
                    else {
                        c.onHeaderCell = a => {
                            return {
                                id: a.key,
                                title: c.title,
                                textAlign: col.headerAlign,
                                colType: "tableHeader",
                                desc: col.desc
                            };
                        };
                    }
                    c.onCell = column => {
                        let obj = {
                            ...(column[c.key] || {
                                value: null,
                                help: column[col.dataIndex].help,
                                validateStatus: column[col.dataIndex].validateStatus
                            })
                        };
                        // if (c.key === '4ba0b173-85c0-0720-f337-6d3137570937')
                        //     debugger
                        let v = {
                            id: c.key,
                            colType: "formItem",
                            ...obj,
                            value: column[c.key] ? column[c.key].value : null,
                            validateStatus: column[c.key] ? column[c.key].validateStatus : null,
                            editMode: editRowIndex === column.key,
                            textAlign: col.textAlign,
                            proxyIndex: column.proxyIndex,
                            rowIndex: column.key,
                            renderSubItemCell: this.props.renderSubItemCell,
                            isSummaryRow: column.isSummaryRow === true
                        };
                        if (column[c.key].authority)
                            v = { ...v, ...column[c.key].authority };
                        return v;
                    };
                });
            } else {
                col.onCell = column => {
                    let obj = {
                        ...(column[col.key] || {
                            value: null,
                            help: column[col.dataIndex] ? column[col.dataIndex].help : "",
                            validateStatus: column[col.dataIndex] ? column[col.dataIndex].validateStatus : ""
                        })
                    };
                    // if (col.key === '4ba0b173-85c0-0720-f337-6d3137570937')
                    //     debugger
                    let v = {
                        id: col.key,
                        colType: "formItem",
                        ...obj,
                        value: column[col.key] ? column[col.key].value : null,
                        editMode: editRowIndex === column.key,
                        proxyIndex: column.proxyIndex,
                        rowIndex: column.key,
                        textAlign: col.textAlign,
                        renderSubItemCell: this.props.renderSubItemCell,
                        isSummaryRow: column.isSummaryRow === true
                    };
                    if (column[col.key] && column[col.key].authority)
                        v = { ...v, ...column[col.key].authority };
                    return v;
                };
            }
        });
        let columnsTree = buildSubFormColumnTree(this.props.id, columns);
        let tempWidth = this.getScrollX(columns);
        let tempFixed = false;
        columns.map(a => {
            if (a.fixed === "right") tempFixed = true;
        });
        const operationColumn = readOnly ? {} : {
            title: <a style={{ display: "block", textAlign: "center", width: "105px", fontSize: "16px" }}
                      className={this.state.selectedRowKeys.length === 0 ? subStyles.disbaled : ""}
                      onClick={this.deleteSelectedRows}><Icon type='delete'/></a>,
            colType: "operation", dataIndex: "operation", key: "operation",
            fixed: design ? tempFixed || (tempWidth > tableWidth) ? "right" : null : (tempWidth > tableWidth) ? "right" : null,
            onHeaderCell: (c) => ({ colType: "operation" }),
            onCell: (c) =>
                ({
                    colType: "operation",
                    proxyIndex: c.proxyIndex,
                    rowIndex: c.key,
                    selected: c.key === this.state.editRowIndex,
                    saveRow: this.saveRow,
                    cancelSaveRow: this.cancelSaveRow,
                    editRow: this.editRow, removeRow: this.removeRow,
                    copyRow: this.copyRow,
                    readOnly,
                    isSummaryRow: c.isSummaryRow === true,
                    onVisible: this.onVisible,
                    showDeleteModal: onKeyIndex === c.key,
                    operationRemove: this.operationRemove,
                    operationCancel: this.operationCancel
                })
        };
        const headerColumn = {
            title: this.props.dataLinker.some(a => a.linkType !== LINKTYPE.Display) || readOnly ?
                <a className={subStyles.disbaled} style={{
                    display: "block",
                    textAlign: "center",
                    width: "40px",
                    fontSize: "16px"
                }}><Icon type='plus'/></a> : <a onClick={this.addRow} style={{
                    display: "block",
                    textAlign: "center",
                    width: "40px",
                    fontSize: "16px"
                }}><Icon type='plus'/></a>,
            key: "header",
            dataIndex: "header",
            fixed: "left",
            onHeaderCell: () => ({ colType: "header", readOnly }),
            onCell: (c) =>
                //{
                //    if (c[this.props.primaryKeyId] === undefined) {
                //        console.log(this.props);
                //        debugger
                //    }
                //    return { colType: "header", proxyIndex: c.key, isSummaryRow: c.isSummaryRow === true, readOnly, rowId: c[this.props.primaryKeyId].value };
                //}
                ({
                    colType: "header",
                    proxyIndex: c.proxyIndex,
                    rowIndex: c.key,
                    isSummaryRow: c.isSummaryRow === true,
                    readOnly,
                    rowId: c[this.props.primaryKeyId].value
                })
        };
        return [headerColumn, ...columnsTree, operationColumn];
    };

    removeRow = (index) => {
        const { proxyStorage: { dataSource }, onChange, setProxy } = this.props;
        let { design } = this.state;
        let item = dataSource.find(a => a.key === index);
        index = dataSource.indexOf(item);
        dataSource.splice(index, 1);
        dataSource.forEach((e, i) => {
            e.proxyIndex = i;
        });
        if (design) onChange({ defaultDatasource: dataSource });
        setProxy({ dataSource });
        let summaryData = this.addGatherFieldsRow();
        this.setState({ summaryData });
    };

    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    deleteSelectedRows = () => {
        let _this = this;
        const { setProxy, proxyStorage: { dataSource }, readOnly } = this.props;
        const { selectedRowKeys } = this.state;
        if (!selectedRowKeys.length || readOnly) return;
        Modal.confirm({
            title: "确定要删除选择项吗",
            onOk() {
                for (let i = 0; i < dataSource.length; i++) {
                    let source = dataSource[i];
                    if (selectedRowKeys.some(key => key === source.key)) {
                        dataSource.splice(i, 1);
                        i--;
                    }
                }
                dataSource.forEach((v, key) => {
                    v.proxyIndex = key;
                });
                setProxy({ dataSource });
                _this.setState({ selectedRowKeys: [] });
                let summaryData = _this.addGatherFieldsRow();
                _this.setState({ summaryData });
            }
        });
    };

    changeEditType = e => {
        this.setState({
            editType: e.target.value
        })
    }

    changeDataIndex = (dataIndex) => {
        this.setState({
            dataIndex,
            editType: false,
        })
    }

    editSelectedRows = () => {
        const { readOnly } = this.props;
        const { selectedRowKeys } = this.state;
        if (!selectedRowKeys.length || readOnly) return;
        this.toggleVisible()
    }

    getScrollX(params, width = 0) {
        let tempWidth = width;
        params.map(a => {
            if (a.key === "header") tempWidth += 54;
            else if (a.key === "operation") tempWidth += 118;
            else if (!a.width || a.width === undefined) tempWidth += 150; // 默认宽度150, need todo
            else if (a.width) {
                if (a.children) tempWidth += this.getScrollX(a.children, tempWidth);
                else tempWidth += a.width;
            }
        });
        return tempWidth;
    }

    addGatherFieldsRow(props) {
        let p = props || this.props;
        let { id, proxyStorage, primaryKeyId } = p;
        if (!proxyStorage || !proxyStorage.dataSource || !proxyStorage.dataSource.length) return {};
        const panelChild = p.getPanelChild(id), isGatherFields = {}, { dataSource } = proxyStorage;
        panelChild.filter(a => a.itemBase.has("subformFieldGatherType")).forEach(item => {
            const subformFieldGatherType = item.itemBase.get("subformFieldGatherType");
            if (item.valueType !== "external" && subformFieldGatherType !== "0" && item.formControlType >= 0 && item.formControlType < 2) {
                isGatherFields[item.id] = {
                    subformFieldGatherType,
                    filedValueArr: []
                };
                if (item.valueType === "number" && item.itemBase.get("decimal") === true) {
                    isGatherFields[item.id].decimalLen = item.itemBase.get("decimalLen");
                }
                isGatherFields[item.id].formatterValue = item.itemBase.get("formatterValue");
            }
        });
        if (!Object.keys(isGatherFields).length) {
            this.setState({ summaryRow: false });
            return {};
        }
        const resultObj = { isSummaryRow: true, key: "summary", [primaryKeyId]: "summary" };
        dataSource.forEach(row => {
            let ids = Object.keys(row);
            ids.forEach(id => {
                if (isGatherFields[id]) isGatherFields[id]["filedValueArr"].push(row[id]["value"]);
            });
        });

        Object.keys(isGatherFields).forEach(id => {
            let Decide = !!isGatherFields[id]["subformFieldGatherType"];
            let Result = calculateObj[isGatherFields[id]["subformFieldGatherType"]](isGatherFields[id]["filedValueArr"], isGatherFields[id].decimalLen);
            switch (isGatherFields[id]["formatterValue"]) {
                default:
                case "none":
                    resultObj[id] = Decide ? Result.toFixed(isGatherFields[id].decimalLen) : "";
                    break;
                case "percent":
                    resultObj[id] = Decide ? `${parseInt(parseFloat(Result) * 100)}%` : "";
                    break;
                case "dot":
                    resultObj[id] = Decide ? (Result.toFixed(isGatherFields[id].decimalLen) + "").replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,") : "";
                    break;
            }
        });
        return resultObj;
    }

    onVisible = (e) => {
        this.setState({
            onKeyIndex: e
        });
    };

    operationRemove = () => {
        let { onKeyIndex } = this.state;
        this.removeRow(onKeyIndex);
        this.setState({ onKeyIndex: null });
    };

    operationCancel = () => {
        this.setState({ onKeyIndex: null });
    };

    toggleVisible = () => {
        this.setState({
            editVisible: !this.state.editVisible
        })
    }
    render() {
        const { mode, proxyStorage, renderStyle, select, name } = this.props;
        let { design, summaryData, tableCompoents,editVisible, dataIndex, editType, changeValue  } = this.state;
        let readOnly = this.props.readOnly || this.props.disabled;
        const rowSelection = {
            onChange: this.onSelectChange,
            getCheckboxProps: record => {
                let isSummaryRow = record.isSummaryRow === true;
                let r = {
                    //disabled: isSummaryRow, // Column configuration not to be checked
                    name: record.name
                };
                if (isSummaryRow === true) {
                    r = { ...r, style: { display: "none" } };
                }
                return r;
            },
            onSelect: (record, selected, selectedRows, nativeEvent) => {
                this.props.setTableLinkerFilterValue(selectedRows.map(a => a[this.props.primaryKeyId].value));
            },
            columnWidth: 50
        };
        //console.log("subform render", this.props);
        switch (mode) {
            case "form":
                let tmepDataSource = proxyStorage.dataSource;
                let columns = this.buildSubFormColumn(tmepDataSource);
                if (JSON.stringify(summaryData) !== "{}")
                    tmepDataSource = tmepDataSource.concat([summaryData]);
                let filterValues = this.props.tableLinkerFilterValue || [];
                // if (readOnly) {
                //     columns = columns.slice(0, columns.length - 1);
                // }
                if (filterValues.length > 0)
                    tmepDataSource = tmepDataSource.filter(a => this.props.tableLinkerFilterValue.includes(a[this.props.tableLinkerId].value));
                const column = columns.find(e => e.key === dataIndex) || {};
                return <CollapseCom collapse={this.props.collapse}
                                    selecting={design ? select : false}
                                    renderStyle={renderStyle} hasChildren={true} title={name}
                                    formLayout={this.props.formLayout}
                                    onChange={this.props.onChange} bordered={false} type='inner' custom={true}>
                    <div ref={this.getTableContainer} style={{ width: "100%" }}>
                        <Table
                            bordered
                            showHeader={true}
                            className={subStyles.subForm}
                            pagination={this.props.dataLinker.some(a => a.linkType > LINKTYPE.Linker && a.linkType <= LINKTYPE.Resource) && tmepDataSource.length > 1 ?
                                {
                                    pageSize: this.props.pageSize,
                                    showSizeChanger: true,
                                    pageSizeOptions: ["100", "300", "500", "1000"]
                                } : false}
                            rowSelection={design || readOnly ? null : rowSelection}
                            columns={columns}
                            components={tableCompoents}
                            dataSource={tmepDataSource}
                            scroll={{ x: "max-content" }}
                        />
                        <Modal
                            title="批量编辑"
                            visible={editVisible}
                            onOk={this.handleOk}
                            onCancel={this.toggleVisible}
                            width={412}
                        >
                            <div className={subStyles.editModalContent}>
                                <div>通过批量编辑可快速统一修改相同字段的数据内容</div>
                                <div style={{ marginLeft: 24 }}>
                                    <span className={subStyles.editModalTitle}>字段：</span><Select style={{ width: 180 }} onChange={this.changeDataIndex}>
                                        {
                                            columns.slice(1, columns.length - 1).map(e => <Select.Option disabled={!e.canEdit} key={e.key} value={e.key}>{e.title}</Select.Option>)
                                        }
                                    </Select>
                                </div>
                                {
                                    dataIndex && (<div style={{ marginLeft: 24 }}>
                                        <span className={subStyles.editModalTitle}>字段内容：</span><Radio.Group onChange={this.changeEditType} value={editType}>
                                            <Radio value={false}>清空内容</Radio>
                                            <Radio value={true}>修改为新值</Radio>
                                        </Radio.Group>
                                    </div>) || null
                                }
                                {
                                    editType && (<div className={subStyles.itemCell}>
                                        {
                                            this.props.renderSubItemCell({
                                                id: column.key,
                                                editMode: true,
                                                onChangeAll: this.onChangeAll,
                                                authority: column.authority,
                                                proxyIndex: column.proxyIndex,
                                                help: column.help || "",
                                                validateStatus: column.validateStatus || "",
                                                textAlign: column.textAlign,
                                                ...changeValue
                                            })
                                        }
                                    </div>) || null
                                }
                            </div>
                        </Modal>
                    </div>
                </CollapseCom>;
            case "option":
                return <React.Fragment>
                    {/* <Button onClick={() => this.props.setTableLinker('123', '321321')} >test</Button> */}
                    <Title.Component {...Title.getProps(this.props)} />
                    <Relation {...this.props} expressionType="data"/>
                    {this.props.dataLinker.some(a => a.linkType > LINKTYPE.Linker && a.linkType <= LINKTYPE.Resource) ?
                        <Pagination {...this.props} /> : null}
                    <OperationPower {...this.props} />
                    <Desc.Component {...Desc.getProps(this.props)} />
                </React.Fragment>;
            default:
                return <div>控件加载失败</div>;
        }
    }
}

export default {
    itemType: "SubForm", //子表单容器
    formControlType: FormControlType.Container,
    name: "子表单",
    ico: "folder",
    group: FORM_CONTROLLIST_GROUP.Advanced,//分组
    Component: SubForm,
    isSubTable: true,
    initFormItemBase,
    authority: { buttons: ["add", "modify", "delete", "mutiSelect", "mutiDelete"] },
    proxy: {
        attr: { customWidth: true, subFormField: true },//属性代理
        storage: () => {
            return { dataSource: [] };
        },//保存在代理池中[的默认数据
        events: {
            //获取当前焦点行索引
            getProxyIndex: (proxy) => {
                let item = proxy.dataSource.find(a => a.key === proxy.editRowIndex);
                if (item)
                    return proxy.dataSource.indexOf(item);
                else
                    return -1;
                //return proxy.editRowIndex;
            },
            //提交代理
            onSubmit: (proxy, item) => {
                return proxy.dataSource.map(e => {
                    let { key, selectedId, ...other } = e;
                    let data = {};
                    Object.keys(other).forEach(a => {
                        data[a] = other[a].value;
                    });
                    return data;
                });
            },
            //数据联动取值，用于参与表单的数据计算
            onLinkGet: function({ proxy, proxyIndex }) {
                let data = [];
                if (proxyIndex > -1 && proxy.dataSource[proxyIndex]) {
                    data = [proxy.dataSource[proxyIndex]];
                }
                else {
                    data = proxy.dataSource;
                }
                try {
                    let result = data.map(a => {
                        let { key, ...other } = a;
                        return other;
                    });
                    return result;
                }
                catch (e) {
                }
                return [];
            },
            //数据联动赋值，用于参与计算的代理控件值经过计算后返回
            onLinkSet: function({ proxy, linkData, proxyIndex }) {
                if (proxyIndex !== undefined) {
                    proxy.dataSource[proxyIndex] = {
                        ...proxy.dataSource[proxyIndex], ...linkData[0],
                        proxyIndex,
                        key: linkData[0][proxy.primaryKeyId].value
                    };
                }
                else {
                    linkData.forEach((a, i) => {
                        a.proxyIndex = i;
                        a.key = a[proxy.primaryKeyId].value;
                    });
                    proxy.dataSource = linkData;
                }
                return proxy;
            },
            //数据联动初始化赋值，用于初始化表单时计算使用
            onLinkInit: function({ proxy }) {
                if (proxy.dataSource.length > 0)
                    return proxy.dataSource[0];
                else
                    return null;
            },
            //代理初始化
            onInit: function(proxy/*, children*/) {
                let primaryKeyId = this.primaryKeyId;
                proxy.dataSource = proxy.dataSource.concat(this.defaultDatasource.map(a => {
                    let id = com.Guid();
                    a[primaryKeyId].value = id;
                    a.key = id;
                    return a;
                }));
                return proxy;
            }
        }
    },
    valueType: "subForm",
    dropItemValueTypes: ["string", "number", "external", "group", "boolean", "array", "datetime", "container", "tabcontainer"]//允许拖拽放入的控件值类型集合
};
