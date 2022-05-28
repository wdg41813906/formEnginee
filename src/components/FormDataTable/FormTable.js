import React, { useState, useEffect, useMemo } from "react";
import { Table, Icon, Tooltip, Button } from "antd";
import { Resizable } from "react-resizable";

require("react-resizable/css/styles.css");
import styles from "./FormTable.less";
import AuthStatus from "../../enums/AuthorityStatus";
import { getPrintPreview } from "src/services/Print/PrintFunction";

const headerIndexStyle = { padding: 6, width: 50, textAlign: "center", fontSize: 14, fontWeight: "bold" };
const headerOperationStyle = { padding: 6, minWidth: 160, textAlign: "center", fontSize: 14, fontWeight: "bold" };
const headerDataStyle = { padding: 6, wordBreak: "break-all", textAlign: "center", fontSize: 14, fontWeight: "bold" };
const bodyIndexStyle = { padding: 6, textAlign: "center", fontSize: "16px", width: 50 };
const bodyOperationStyle = { padding: 6, textAlign: "center", fontSize: "16px", minWidth: 160 };
const bodyDataStyle = { padding: 6, wordBreak: "break-all" };

const HeaderWrapper = props => {
    const ref = React.createRef();
    return <thead ref={ref} {...props} />;
};

// const HeaderCell = props => {
//     let { colType, onResize, sorter, onSort, sortType, onEditClick, celltextalign, ...other } = props;
//     switch (colType) {
//         case 'header':
//             return (
//                 <th style={headerIndexStyle} {...other}>
//                     {props.children}
//                 </th>
//             );
//         case 'operation':
//             return (
//                 <th style={headerOperationStyle} {...other}>
//                     {props.children}
//                 </th>
//             );
//         default:
//             let upStyle = `${styles.sorterBtns} ${sortType === 0 ? styles.select : null}`;
//             let downStyle = `${styles.sorterBtns} ${sortType === 1 ? styles.select : null}`;
//             return onResize ? (
//                 <Resizable
//                     width={props.width}
//                     height={0}
//                     onResize={onResize}
//                     draggableOpts={{ enableUserSelectHack: false }}
//                     resizeHandles={['e']}
//                     axis={'x'}
//                 >
//                     <th style={headerDataStyle} {...other}>
//                         <div className={styles.headerCell}>
//                             <div>{onSort ? <React.Fragment>
//                                 <Icon
//                                     onClick={() => {
//                                         onSort(false);
//                                     }}
//                                     className={upStyle}
//                                     type="caret-up"
//                                 />
//                                 <Icon
//                                     onClick={() => {
//                                         onSort(true);
//                                     }}
//                                     className={downStyle}
//                                     type="caret-down"
//                                 /></React.Fragment> : null}
//                             </div>
//                             <div>{props.children}</div>
//                         </div>
//                     </th>
//                 </Resizable >
//             ) : (
//                     <th style={headerDataStyle} {...other}>
//                         <div className={styles.headerCell}>
//                             <div>{onSort ? <React.Fragment>
//                                 <Icon
//                                     onClick={() => {
//                                         onSort(false);
//                                     }}
//                                     className={upStyle}
//                                     type="caret-up"
//                                 />
//                                 <Icon
//                                     onClick={() => {
//                                         onSort(true);
//                                     }}
//                                     className={downStyle}
//                                     type="caret-down"
//                                 /></React.Fragment> : null}
//                             </div>
//                             <div>{props.children}</div>
//                         </div>
//                     </th>
//                 );
//     }
// };

const HeaderCell = props => {
    let { colType, onResize, onResizeStop, sorter, onSort, sortType, onEditClick, celltextalign, colSpan, rowSpan, children, width, ...other } = props;
    switch (colType) {
        case "header":
            return useMemo(() => <th style={headerIndexStyle} colSpan={colSpan} rowSpan={rowSpan} width={width}>
                {props.children}
            </th>, [children, colSpan, width]);
        case "operation":
            return useMemo(() => <th style={headerOperationStyle} colSpan={colSpan} rowSpan={rowSpan} width={width}>
                {props.children}
            </th>, [children, colSpan, width]);
        default:
            let upStyle = `${styles.sorterBtns} ${sortType === 0 ? styles.select : null}`;
            let downStyle = `${styles.sorterBtns} ${sortType === 1 ? styles.select : null}`;
            return onResize ? useMemo(() =>
                    <Resizable
                        onResizeStop={onResizeStop}
                        width={width}
                        height={0}
                        onResize={onResize}
                        draggableOpts={{ enableUserSelectHack: false }}
                        resizeHandles={["e"]}
                        axis={"x"}
                    >
                        <th style={headerDataStyle} colSpan={colSpan} rowSpan={rowSpan} width={width}>
                            <div className={styles.headerCell}>
                                <div>{onSort ? <React.Fragment>
                                    <Icon
                                        onClick={() => {
                                            onSort(false);
                                        }}
                                        className={upStyle}
                                        type="caret-up"
                                    />
                                    <Icon
                                        onClick={() => {
                                            onSort(true);
                                        }}
                                        className={downStyle}
                                        type="caret-down"
                                    /></React.Fragment> : null}
                                </div>
                                <div>{children}</div>
                            </div>
                        </th>
                    </Resizable>
                , [width, children, sortType]) : useMemo(() =>
                    <th style={headerDataStyle} colSpan={colSpan} rowSpan={rowSpan} width={width}>
                        <div className={styles.headerCell}>
                            <div>{onSort ? <React.Fragment>
                                <Icon
                                    onClick={() => {
                                        onSort(false);
                                    }}
                                    className={upStyle}
                                    type="caret-up"
                                />
                                <Icon
                                    onClick={() => {
                                        onSort(true);
                                    }}
                                    className={downStyle}
                                    type="caret-down"
                                /></React.Fragment> : null}
                            </div>
                            <div>{children}</div>
                        </div>
                    </th>
                , [width, children, sortType]);
    }
};


class BodyCell extends React.Component {
    shouldComponentUpdate(nextProps) {
        return this.props.value !== nextProps.value || this.props.width !== nextProps.width ||
            this.props.instId !== nextProps.instId || this.props.workFlowId !== nextProps.workFlowId ||
            nextProps.colType === "operation";
        
    }
    
    render() {
        let {
            colType,
            editMode,
            proxyIndex,
            value,
            renderSubItemCell,
            id,
            readOnly,
            disabled,
            width,
            saveRow,
            cancelSaveRow,
            editRow,
            removeRow,
            isSummaryRow,
            tabId,
            celltextalign,
            ...other
        } = this.props;
        switch (colType) {
            case "formItem":
                return renderSubItemCell({
                    id,
                    value,
                    proxyIndex,
                    extraProps: { style: { ...bodyDataStyle, width, textAlign: celltextalign } }
                });
            case "header":
                return (
                    <Tooltip placement="top" title={proxyIndex + 1}>
                        <td style={bodyIndexStyle} {...other}>
                            {proxyIndex + 1}
                        </td>
                    </Tooltip>
                );
            case "operation":
                let {
                    showModal,
                    workFlowId,
                    workFlowStatus,
                    instId,
                    permission,
                    cancelProcedure,
                    versionId,
                    deleteFormData,
                    ...other2
                } = other;
                return (
                    <td style={bodyOperationStyle} {...other2}>
                        <Tooltip title="打印预览">
                            <Button
                                className={styles.optBtn}
                                icon={"printer"}
                                size="small"
                                onClick={() => getPrintPreview(versionId, instId)}
                            />
                        </Tooltip>
                        {workFlowStatus === "0" || /* workFlowStatus === '1' || workFlowStatus === '5' ||*/ permission.includes(AuthStatus.edit) || workFlowId === "" ? (
                            <Tooltip title={workFlowId ? "办理" : "编辑"}>
                                <Button
                                    className={styles.optBtn}
                                    type="primary"
                                    icon="edit"
                                    size="small"
                                    onClick={() => {
                                        showModal({
                                            instId,
                                            type: "modify",
                                            renderType: "edit",
                                            workFlowId,
                                            workFlowStatus
                                        });
                                    }}
                                />
                            </Tooltip>
                        ) : null}
                        {permission.indexOf(AuthStatus.look) !== -1 || workFlowId ? (
                            <Tooltip title="查看">
                                <Button
                                    className={styles.optBtn}
                                    icon="eye"
                                    size="small"
                                    onClick={() => {
                                        showModal({
                                            instId,
                                            type: "modify",
                                            renderType: "readOnly",
                                            workFlowId,
                                            workFlowStatus
                                        });
                                    }}
                                />
                            </Tooltip>
                        ) : null}
                        {workFlowStatus === "0" ? (
                            <Tooltip title="删除">
                                <Button icon="delete" size="small" onClick={deleteFormData.bind(null, instId)}/>
                            </Tooltip>
                        ) : null}
                    </td>
                );
            default:
                return <td {...other}>{other.children}</td>;
        }
    }
}

// --流程状态：未提交-0   驳回-1  运行中-2  结束-3 未找到审批人-4  撤销-5  作废-6

function buildSubFormColumnTree(id, columns, rowLen = 0) {
    let children = columns.filter(a => a.container === id);
    if (children.length > 0)
        rowLen++;
    let finalRow = rowLen;
    children.forEach(a => {
        let { children: subChildren, rowLen: subRowLen } = buildSubFormColumnTree(a.key, columns, rowLen);
        if (subChildren.length > 0)
            a.children = (a.children || []).concat(subChildren);
        if (subRowLen > finalRow)
            finalRow = subRowLen;
    });
    return { children, rowLen: finalRow };
}

function getSortType(sorter, dataIndex) {
    let exist = sorter.find(a => a.dataIndex === dataIndex);
    if (exist) {
        return exist.type;
    }
    return null;
}

function getScrollX(params, width = 0) {
    let contentWidth = width;
    let contentCount = 0;
    params.forEach(a => {
        if (!a.width && a.valueType !== "external" && a.valueType !== "container") {
            contentWidth += 150; // 默认宽度150
            contentCount += 1;
        } else if (a.width) {
            if (a.children) {
                let tempScrollX = getScrollX(a.children);
                contentWidth += tempScrollX.contentWidth;
                contentCount += tempScrollX.contentCount;
            } else if (a.valueType !== "external" && a.valueType !== "container") {
                contentWidth += a.width;
                contentCount += 1;
            }
        }
    });
    return { contentWidth, contentCount };
}

const getFixedType = (id, leftList, rightList) => {
    if (leftList.includes(id)) return "left";
    if (rightList.includes(id)) return "right";
    return null;
};

function getShowFieldWithContainer({ showFields, columns }) {
    if (!Array.isArray(showFields))
        return showFields;
    let list = Array.from(new Set(columns.filter(a => showFields.includes(a.key)).map(a => a.container)));
    if (list[0]) {
        list = getShowFieldWithContainer({ showFields: list, columns });
    }
    return Array.from(new Set([...showFields, ...list]));
}

function getColKey(col, columns) {
    let colKey = [];
    if (col.isGroup) colKey.push(col.key);
    else {
        if (col.valueType === "container" || col.valueType === "external") {
            columns.filter(a => a.container === col.key).forEach(a => {
                let tempColKey = getColKey(a, columns);
                colKey.push.apply(colKey, tempColKey);
            });
        }
        else if (col.dataIndex) colKey.push(col.dataIndex);
    }
    return colKey;
}

const buildSubFormColumn = ({
                                columns,
                                rootId,
                                renderSubItemCell,
                                onResize,
                                onResizeStop,
                                onSort,
                                sorter,
                                tableWidth,
                                operationColumn,
                                filterTableValue
                            }) => {
    let tableHeaderShow = filterTableValue.toJS().filter(a => a.show);
    let leftFixedHeaders = tableHeaderShow.filter(a => a.freezeType === "1").map(a => a.key);
    let rightFixedHeaders = tableHeaderShow.filter(a => a.freezeType === "2").map(a => a.key);
    let showList = getShowFieldWithContainer({ showFields: tableHeaderShow.map(a => a.key), columns });
    columns = columns.filter(a => showList.includes(a.dataIndex) || showList.includes(a.key));
    let { contentWidth, contentCount } = getScrollX(columns);
    let listWidth = tableWidth - headerIndexStyle.width - headerOperationStyle.minWidth - tableStyle.margin * 2;
    let compareWidth = listWidth > contentWidth;
    if (columns.length > 0) {
        for (let i = 0; i < columns.length; i++) {
            const element = columns[i];
            if (element.fixed === "left") columns.unshift(columns.splice(i, 1)[0]);
            else if (element.fixed === "right") columns.push(columns.splice(i, 1)[0]);
        }
        columns.forEach(col => {
            if (col.children) {
                let colKeyList = getColKey(col, columns);
                let tempTableHeaderShow = tableHeaderShow.find(a => colKeyList.find(b => b === a.key));
                let tempWidth = tempTableHeaderShow ? tempTableHeaderShow.cusWidth : "";
                if (col.isGroup) {
                    col.onHeaderCell = () => ({
                        width: compareWidth ? tempWidth || listWidth / contentCount : tempWidth || col.width,
                        onResize: onResize(col.key),
                        onResizeStop: onResizeStop(col.key)
                    });
                }
                col.children.forEach(c => {
                    let cKeyList = getColKey(c, columns);
                    let tempTableHeaderShowChild = tableHeaderShow.find(a => col.isGroup ? a.key === col.key : cKeyList.find(b => b === a.key));
                    let tempChildWidth = tempTableHeaderShowChild ? tempTableHeaderShowChild.cusWidth : "";
                    let cellWidth = 0;
                    if (col.isGroup) {
                        if (compareWidth) cellWidth = tempChildWidth / col.children.length || listWidth / contentCount;
                        else cellWidth = tempChildWidth / col.children.length || c.width;
                    } else {
                        if (compareWidth) cellWidth = tempChildWidth || listWidth / contentCount;
                        else cellWidth = tempChildWidth || c.width;
                    }
                    c.onCell = column => {
                        return {
                            id: c.dataIndex,
                            width: cellWidth,
                            colType: "formItem",
                            value: column[c.dataIndex] ? column[c.dataIndex] : null,
                            proxyIndex: column.key,
                            renderSubItemCell,
                            celltextalign: c.textAlign || c.valueType === "number" ? "right" : "left"
                        };
                    };
                    c.onHeaderCell = () => ({
                        width: cellWidth,
                        onResize: col.isGroup ? null : onResize(c.dataIndex),
                        onResizeStop: onResizeStop(col.key),
                        sortType: getSortType(sorter, c.dataIndex),
                        onSort: desc => onSort(col.dataIndex, desc)
                    });
                    c.width = cellWidth;
                });
            } else {
                let colKeyList = getColKey(col, columns);
                let tempTableHeaderShow = tableHeaderShow.find(a => colKeyList.find(b => b === a.key));
                let tempWidth = tempTableHeaderShow ? tempTableHeaderShow.cusWidth : "";
                col.onCell = column => {
                    return {
                        id: col.isGroup ? col.key : col.dataIndex || "",
                        width: compareWidth ? tempWidth || listWidth / contentCount : tempWidth || col.width,
                        colType: "formItem",
                        value: column[col.dataIndex] ? column[col.dataIndex] : null,
                        proxyIndex: column.key,
                        renderSubItemCell,
                        versionId: column.versionId,
                        celltextalign: col.textAlign || col.valueType === "number" ? "right" : "left"
                    };
                };
                let w = compareWidth ? tempWidth || listWidth / contentCount : tempWidth || col.width;
                if (col.valueType === "external" || col.valueType === "container")
                    col.onHeaderCell = () => ({
                        width: w
                    });
                else
                    col.onHeaderCell = () => ({
                        width: w,
                        onResize: onResize(col.isGroup ? col.key : col.dataIndex),
                        onResizeStop: onResizeStop(col.key),
                        sortType: getSortType(sorter, col.dataIndex),
                        onSort: desc => onSort(col.dataIndex, desc)
                    });
                if (getFixedType(col.dataIndex, leftFixedHeaders, rightFixedHeaders))
                    col.fixed = getFixedType(col.dataIndex, leftFixedHeaders, rightFixedHeaders);
                col.width = w;
            }
        });
        let { children: columnsTree, rowLen } = buildSubFormColumnTree(rootId, columns);
        return { columns: [...columnsTree, operationColumn], rowLen };
    }
    return { columns: [], rowLen: 1 };
};

const headerColumn = {
    title: "序号",
    key: "header",
    dataIndex: "header",
    fixed: "left",
    onHeaderCell: () => ({ colType: "header" }),
    onCell: c => ({ colType: "header", proxyIndex: c.key })
};

const tableStyle = { margin: 10, height: "100%", cursor: "pointer" };
const components = { body: { cell: BodyCell }, header: { cell: HeaderCell, wrapper: HeaderWrapper } };
let widthInfo = [];

function findColumns(columns, id) {
    let item = columns.find(a => a.dataIndex === id || a.key === id);
    if (item === undefined) {
        let children = columns.filter(a => a.children);
        for (let child of children) {
            item = findColumns(child.children, id);
            if (item) break;
        }
    }
    return item;
}

function FormTable({
                       renderSubItemCell,
                       dataColumns,
                       rootId,
                       dataSource,
                       onSort,
                       sorter,
                       filterTableValue,
                       showModal,
                       permission,
                       cancelProcedure,
                       removeHeight,
                       deleteStatus,
                       versionId,
                       addFilterTableValue,
                       setDeleteArr,
                       setInitFilterValue,
                       setStyleStatus,
                       showFields,
                       deleteFormData,
                       selectStatus,
                       selectOperation
                   }) {
    const [columns, setColumns] = useState([headerColumn]);
    const [tableWidth, setTableWidth] = useState();
    const [tableHeight, setTableHeight] = useState();
    const [columnHeight, setColumnHeight] = useState(34);
    const [DefaultInstId, SetSelectInstId] = useState();
    
    const operationColumn = {
        title: "操作",
        colType: "operation",
        dataIndex: "operation",
        key: "operation",
        width: 200,
        fixed: "right",
        onHeaderCell: c => ({ colType: "operation" }),
        onCell: c => {
            return {
                showModal,
                cancelProcedure,
                permission,
                workFlowId: c.workFlowId,
                workFlowStatus: c.workFlowStatus,
                instId: c.instId,
                colType: "operation",
                proxyIndex: c.key,
                deleteFormData,
                versionId
            };
        }
    };
    //const [columns, setColumns] = useState([headerColumn, operationColumn]);
    //const [widthInfo, setWidthInfo] = useState([]);
    const handleResize = id => (event, { size }) => {
        let dataColumnsJS = dataColumns.toJS();
        let filterTableValueJS = filterTableValue.toJS();
        widthInfo = [...widthInfo.filter(a => a.id !== id), { id, width: size.width }];
        widthInfo.forEach(w => {
            let item = findColumns(dataColumnsJS, w.id); //dataColumnsJS.find(a => a.dataIndex === w.id);
            item.width = w.width;
            let tempFilterTableValue = filterTableValueJS.find(a => item.isGroup ? a.key === item.key : item.dataIndex ? a.key === item.dataIndex : "");
            tempFilterTableValue ? tempFilterTableValue.cusWidth = w.width : null;
        });
        //setWidthInfo(newWidthInfo);
        addFilterTableValue(filterTableValueJS, true);
        // setStyleStatus(true)
        let { columns, rowLen } = buildSubFormColumn({
            columns: dataColumnsJS,
            rootId,
            renderSubItemCell,
            onResize: handleResize,
            onResizeStop: handleResizeStop,
            onSort,
            sorter,
            filterTableValue,
            tableWidth,
            operationColumn
        });
        setColumnHeight(rowLen * 34);
        setColumns([
            headerColumn,
            ...columns
        ]);
    };
    
    function getTableContainer(ele) {
        if (!ele) return;
        setTableWidth(ele.clientWidth);
        setTableHeight(ele.clientHeight);
    }
    
    function onWindowResize(element) {
        setTableHeight(element.target.innerHeight);
    }
    
    function onClickRow(record) {
        return {
            onClick: () => {
                SetSelectInstId(dataSource.find(a => a.instId === record.instId).instId);
            }
        };
    }
    
    function setRowClassName(record) {
        return record.instId === DefaultInstId ? "Select-Row" : "";
    }
    
    const cleanup = () => {
        window.removeEventListener("resize", onWindowResize);
    };
    
    useEffect(() => {
        window.addEventListener("resize", onWindowResize);
        return cleanup;
    }, []);
    
    const handleResizeStop = id => (event, { size }) => {
        let dataColumnsJS = dataColumns.toJS();
        let filterTableValueJS = filterTableValue.toJS();
        widthInfo = [...widthInfo.filter(a => a.id !== id), { id, width: size.width }];
        widthInfo.forEach(w => {
            let item = findColumns(dataColumnsJS, w.id); //dataColumnsJS.find(a => a.dataIndex === w.id);
            item.width = w.width;
            let tempFilterTableValue = filterTableValueJS.find(a => item.isGroup ? a.key === item.key : item.dataIndex ? a.key === item.dataIndex : "");
            tempFilterTableValue ? tempFilterTableValue.cusWidth = w.width : null;
        });
        addFilterTableValue(filterTableValueJS, true);
        setStyleStatus(true);
    };
    
    useEffect(() => {
        if (dataColumns.toJS().length > 0) {
            let { columns, rowLen } = buildSubFormColumn({
                columns: dataColumns.toJS(),
                rootId,
                renderSubItemCell,
                onResize: handleResize,
                onResizeStop: handleResizeStop,
                onSort,
                sorter,
                filterTableValue,
                tableWidth,
                operationColumn
            });
            setColumnHeight(rowLen * 34);
            setColumns([
                headerColumn,
                ...columns
            ]);
        }
    }, [dataColumns, sorter, tableWidth, filterTableValue]);
    
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            selectOperation(selectedRows);//传递选中的数据行
            let arr = [];
            if (selectedRowKeys) selectedRows.forEach(a => arr.push(a.instId));
            setDeleteArr(arr);
        },
        getCheckboxProps: record => ({
            disabled: record.name === "Disabled User", // Column configuration not to be checked
            name: record.name
        })
    };
    
    useEffect(() => {
        let dataColumnsJS = dataColumns.toJS();
        if (dataColumnsJS.length > 0) {
            dataColumnsJS = dataColumnsJS.filter(a => showFields.includes(a.dataIndex) || showFields.includes(a.key));
            let { contentWidth, contentCount } = getScrollX(dataColumnsJS);
            let listWidth = tableWidth - headerIndexStyle.width - headerOperationStyle.minWidth - tableStyle.margin * 2;
            let compareWidth = listWidth > contentWidth;
            let tempWidth = listWidth / contentCount;
            let arr = [];
            if (compareWidth) {
                dataColumnsJS.forEach(a => {
                    let obj = { cusWidth: tempWidth, id: a.key };
                    arr.push(obj);
                });
            }
            setInitFilterValue(arr);
        }
    }, [dataColumns]);
    return <div
        ref={ele => getTableContainer(ele)}
        className={styles.contentTable}
        style={{ height: `calc(100% - ${removeHeight ? removeHeight : 0})` }}
    >
        <Table style={tableStyle}
               bordered
               pagination={false}
               rowSelection={deleteStatus || selectStatus ? rowSelection : null}
               columns={columns}
               components={components}
               onRow={onClickRow}
               rowClassName={setRowClassName}
               dataSource={dataSource}
               scroll={{
                   x: "max-content",
                   y: tableHeight - columnHeight - 30
               }}
        />
    </div>;
}

export default FormTable;
