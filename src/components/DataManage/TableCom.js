import { Component } from "react";
import { Table, Select, Radio, Icon, Popover, Checkbox, Spin } from "antd";
import styles from "./TableCom.less";
import { is } from "immutable";
import { Resizable } from "react-resizable";
import moment from "moment";

const { ColumnGroup, Column } = Table;
const RadioGroup = Radio.Group;

// columns 的 结构 改成 一维数组结构
/*
    [
        {
            id,dataIndex,title,key,width,type,sorter:true,parentId,isData
        }
    ]
*/
const Option = Select.Option;
// 处理成 columns
const buildColumns = (columns, id) => {
    //console.log(columns);
    let topColumns = columns ? columns.filter(a => a.parentId === id) : [];
    
    return topColumns.length
        ? topColumns.map((a, i) => {
            let { isData, ...other } = a;
            // console.log(other);
            return !isData ? (
                <ColumnGroup key={i} {...other}>
                    {buildColumns(columns, a.id)}
                </ColumnGroup>
            ) : (
                <Column key={i} {...other}></Column>
            );
        })
        : [];
};

/* 自定义配置 body的 cell */
class ConfigBodyTd extends Component {
    constructor(props) {
        super(props);
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        const thisProps = this.props || {};
        nextProps = nextProps || {};
        
        if (Object.keys(thisProps).length !== Object.keys(nextProps).length) {
            return true;
        }
        for (const key in nextProps) {
            if (!is(thisProps[key], nextProps[key])) {
                return true;
            }
        }
        return false;
    }
    
    render() {
        const { children, ...other } = this.props;
        // console.log(other);
        switch (this.props.id) {
            case "del":
                return <DelBody {...this.props} />;
            default:
                return (
                    <td {...other} className={`${styles.styleTd} ${other.type === "number" ? styles.numStyle : ""}`}>
                        {children}
                    </td>
                );
        }
    }
}

function DelBody(props) {
    const { checked, changeCheckStatus, mainId, ...other } = props;
    const onChange = (id, e) => {
        changeCheckStatus(id, e.target.checked);
    };
    return (
        <td
            {...other}
            onClick={e => {
                e.stopPropagation();
            }}
            style={{ textAlign: "center" }}
        >
            {<Checkbox checked={checked} onChange={onChange.bind(null, mainId)}/>}
        </td>
    );
}

/* 表头配置 */
function DelHeader(props) {
    const { changeCheckStatus, checked, rsTableData, ...other } = props;
    let allChecked = 0;
    if (rsTableData.length) {
        if (rsTableData.every(v => v["checked"])) {
            allChecked = 2;
        } else if (rsTableData.some(v => v["checked"])) {
            allChecked = 1;
        }
    }
    const onChange = (id, e) => {
        changeCheckStatus(id, e.target.checked);
    };
    return (
        <th {...other}>
            {
                <Checkbox
                    indeterminate={allChecked === 1}
                    checked={allChecked === 2}
                    onChange={onChange.bind(null, props.id)}
                />
            }
        </th>
    );
}

function DefaultTh(props) {
    const { freezeType, isFirst, changeSort, sorterCustom, sortOrder, changeColumnFixed, ...other } = props;
    const thClick = e => {
        e.stopPropagation();
        changeSort && changeSort(other.id);
    };
    /* 冻结配置 */
    const popoverFixedContent = (
        <div>
            冻结：
            <RadioGroup onChange={changeColumnFixed.bind(null, other.id)} value={freezeType ? freezeType : "0"}>
                <Radio value={"0"}>取消冻结</Radio>
                <Radio value={"1"}>居左</Radio>
                <Radio value={"2"}>居右</Radio>
            </RadioGroup>
        </div>
    );
    return (
        <th {...other} className={styles.configContianer}>
            {isFirst ? (
                <div
                    className={styles.layout}
                    onClick={e => {
                        e.stopPropagation();
                    }}
                >
                    <Popover
                        // visible={popoverFixedVisible}
                        content={popoverFixedContent}
                        title="表格列设置"
                        trigger="click"
                    >
                        <Icon type="bars" title="配置布局格式" style={{ color: "#40a9ff" }}/>
                    </Popover>
                </div>
            ) : null}
            {sorterCustom ? (
                <div className={styles.configSort} onClick={thClick}>
                    <Icon type="caret-up" className={`${sortOrder === "ascend" ? styles.sortActive : ""}`}/>
                    <Icon type="caret-down" className={`${sortOrder === "descend" ? styles.sortActive : ""}`}/>
                </div>
            ) : null}
            
            {other.children}
        </th>
    );
}

const ConfigTh = props => {
    // 新配置 布局方式
    switch (props.id) {
        case "del":
            return <DelHeader {...props} />;
        default:
            return <DefaultTh {...props} />;
    }
};
// 可以对 header的 width 进行 拖动的
const ResizeHeaderCell = props => {
    const { onResize, width, ...restProps } = props;
    if (!width) {
        return <ConfigTh {...restProps} />;
    }
    return (
        <Resizable
            width={width}
            height={0}
            onResize={onResize}
            onClick={e => {
                e.stopPropagation();
            }}
        >
            <ConfigTh {...restProps} />
        </Resizable>
    );
};

// 获取 实际 长度
const _getActualyWidth = (columns, tableWidth) => {
    if (!columns || !columns.length) return tableWidth;
    let dataColumns = columns.filter(column => column.isData);
    //console.log(dataColumns);
    let total = dataColumns.reduce((prev, next) => {
        //console.log(next.colSpan ? next.colSpan : 1);
        return (
            prev +
            (typeof next.width === "string" ? parseInt(next.width) : next.width) * (next.colSpan ? next.colSpan : 1)
        );
    }, 0);
    //console.log(total);
    return total;
};
// 获取 表头的 高度
const _getActualyHeight = (columns, id) => {
    let num = 0;
    const _getMaxNumber = (columns, id, k) => {
        num = Math.max(num, k);
        const existColumns = columns.filter(i => i.parentId === id);
        const notColumns = columns.filter(i => i.parentId !== id);
        existColumns.forEach(item => {
            const childrenColumns = notColumns.filter(i => item.id === i.parentId);
            if (childrenColumns.length) {
                _getMaxNumber(notColumns, item.id, k + 1);
            }
        });
    };
    _getMaxNumber(columns, id, 1);
    return 40 * num + (num + 1) * 1;
};

// // 处理 固定列 的 操作 ,用 freezeType 来 判定 固定列的方式
// const _initFixedColumns = (columns, x) => {
//     let leftFixedItem = [], rightFixedItem = [];
//     let isTop = columns.filter(item => item.parentId === "");
//     let notTop = columns.filter(item => item.parentId !== "");
//     for (let i = 0; i < isTop.length; i++) {
//         let item = isTop[i];
//         switch (item.freezeType) {
//             case "1":
//                 item.fixed = x === "100%" ? null : "left";
//                 leftFixedItem = leftFixedItem.concat(isTop.splice(i, 1));
//                 i--;
//                 break;
//             case "2":
//                 item.fixed = x === "100%" ? null : "right";
//                 rightFixedItem = rightFixedItem.concat(isTop.splice(i, 1));
//                 i--;
//                 break;
//         }
//     }
//     return [...leftFixedItem, ...isTop, ...notTop, ...rightFixedItem];
// }
const _addHeaderFun = ({ columns, handleWidthResize, changeSort, changeCheckStatus, tableData, changeColumnFixed }) => {
    columns.forEach(item => {
        if (item.isData) {
            if (item.id === "del") {
                item.onHeaderCell = column => ({
                    width: column.width,
                    // isFirst: !item.parentId && item.id !== "del",
                    id: column.id,
                    changeCheckStatus,
                    checked: column.checked,
                    rsTableData: tableData.filter(item => item.del)
                });
                item.onCell = record => ({
                    mainId: record.mainId,
                    checked: record.checked,
                    id: item.id,
                    changeCheckStatus
                });
            } else {
                item.onHeaderCell = column => ({
                    width: column.width,
                    isFirst: !item.parentId && item.id !== "del" && item.id !== "coop" && item.id !== "order",
                    onResize: handleWidthResize(column.id),
                    id: column.id,
                    changeSort,
                    sorterCustom: column.sorterCustom,
                    sortOrder: column.sortOrder,
                    changeColumnFixed,
                    freezeType: item.freezeType
                });
                item.onCell = column => ({
                    type: item.type
                });
            }
        } else {
            item.onHeaderCell = column => ({
                isFirst: !item.parentId,
                changeColumnFixed,
                id: column.id,
                freezeType: item.freezeType
            });
        }
    });
    return columns;
};
const _dealColumns = columns => {
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
            if (
                isFalseItemsObj[column.id] &&
                columns.filter(item => item.parentId === column.id).length === isFalseItemsObj[column.id].length
            ) {
                column.show = false;
            } else {
                column.show = true;
            }
        }
    });
    return columns;
};
/* 初始化 固定 操作值 */
const initFixedColumns = (columns, x) => {
    let leftColumns = columns.filter(item => item.freezeType === "1");
    let rightColumns = columns.filter(item => item.freezeType === "2");
    let generalColumns = columns.filter(item => item.freezeType !== "1" && item.freezeType !== "2");
    if (x !== "100%") {
        leftColumns = leftColumns.map(item => ({
            ...item,
            fixed: "left"
        }));
        rightColumns = rightColumns.map(item => ({
            ...item,
            fixed: "right"
        }));
        generalColumns = generalColumns.map(item => ({
            ...item,
            fixed: null
        }));
    }
    return [...leftColumns, ...generalColumns, ...rightColumns];
};
const _initColumns = columns => {
    // 对于 结构 行，看子集
    columns = _dealColumns(columns);
    // resizeableCustom && (columns = _addHeaderFun(columns));
    return columns.filter(item => item.show !== false);
};
/* 自定制 固定操作 包括删除操作等 */
const _addDeleteColumn = (columns, showDelete, x) => {
    let existDelItem = columns.filter(item => item.key === "del")[0];
    if (showDelete) {
        if (!existDelItem) {
            columns.unshift({
                fixed: "left",
                dataIndex: "del",
                freezeType: "1",
                id: "del",
                key: "del",
                isData: true,
                title: <Checkbox/>,
                parentId: null,
                width: 50,
                render: columns.filter(item => item.isData)[0]["render"]
            });
        }
    } else {
        if (existDelItem) {
            let i = columns.indexOf(existDelItem);
            columns.splice(i, 1);
        }
    }
    // console.log(columns);
    return columns;
};
const _addDeleteTableBody = (tableData, showDelete, selectedRows) => {
    if (!showDelete) return tableData;
    tableData.forEach(item => {
        if (item.index === 0) {
            let findItem = selectedRows.filter(v => v.id === item.mainId)[0];
            item.del = { value: <Checkbox checked={findItem ? findItem.checked : false}/>, isMain: true };
        }
    });
    return tableData;
};
// 初始化选这项
const _initSelectedRows = (tableData, showDelete) => {
    if (!showDelete) return [];
    return tableData.reduce((prev, next) => {
        if (next.index === 0) {
            prev.push({ id: next.mainId, checked: false });
        }
        return prev;
    }, []);
};
// 初始化 components
const _initComponents = resizeableCustom => {
    // 可以 定制 header的宽度
    let components = {};
    if (resizeableCustom) {
        components.header = {
            cell: ResizeHeaderCell
        };
        components.body = {
            cell: ConfigBodyTd
        };
    }
    return components;
};
/* 是否 需要 消除 最后一个的 width */
const _delWidth = (columns, percent) => {
    let generalItems = columns.filter(item => item.fixed !== "left" && item.fixed !== "right"),
        i = -1,
        stack = [];
    /* 这里要 获取 isData为 true的 这一层的 值 */
    if (generalItems.length) {
        stack.push(generalItems);
        while (stack.length) {
            let dealGeneralItems = stack.shift();
            let topColumn = dealGeneralItems[dealGeneralItems.length - 1];
            if (topColumn.isData) {
                i = columns.indexOf(dealGeneralItems[dealGeneralItems.length - 1]);
                break;
            } else {
                let children = columns.filter(item => item.parentId === topColumn.id);
                stack.push(children);
            }
        }
    }
    if (i !== -1) {
        columns[i]["width"] = parseInt(percent) < 100 ? null : columns[i]["cusWidth"];
    }
    return columns;
};

// 如果传入的 isCustom 为 true，就是自定制 table
class TableCom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: "100%",
            y: true,
            bool: true,
            tableWidth: null,
            removeHeight: props.removeHeight,
            hoverId: null,
            showDelete: props.showDelete,
            components: _initComponents(props.resizeableCustom)
        };
        (this.state.columns = _addDeleteColumn(_initColumns(props.columns), props.showDelete, this.state.x)), // 对于 前端 进行 columns 的 操作 用的
            (this.state.selectedRows = _initSelectedRows(props.tableData, this.state.showDelete));
        this.state.tableData = _addDeleteTableBody(props.tableData, props.showDelete, this.state.selectedRows);
        this.getTableContainer = ele => {
            if (!ele) return;
            this.table = { width: ele.clientWidth, height: ele.clientHeight };
        };
        this.resize = this.resize.bind(this);
        this.handleWidthResize = this.handleWidthResize.bind(this);
        this.changeSort = this.changeSort.bind(this);
        this.changeCheckStatus = this.changeCheckStatus.bind(this);
        this.changeColumnFixed = this.changeColumnFixed.bind(this);
    }
    
    /* // 这个发生在 渲染之后，这里用来更新我的 x值
    getSnapshotBeforeUpdate(prevProps, prevState) {
        if (this.table) {
            let { columns } = prevState;
            let ActualyWidth = _getActualyWidth(columns);
            let percent = ActualyWidth / this.table.width * 100;
            return percent;
        }
        return null;
    }
    // 这个是跟上面那个生命周期一起使用
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (snapshot) {
            // console.log("更新时间",snapshot);
            this.state.x = `${snapshot < 100 ? 100 : snapshot}%`;
        }
    } */
    
    // 这个用于当 props于 state有关的时候
    static getDerivedStateFromProps(nextProps, prevState) {
        // console.log(nextProps);
        /* 需要 对于 页面 高度进行 精确 计算 */
        let tempObj = {};
        
        if (nextProps.fixedConfig && nextProps.removeHeight !== prevState.removeHeight) {
            tempObj.removeHeight = nextProps.removeHeight;
            tempObj.y = prevState.y - (parseFloat(nextProps.removeHeight) - parseFloat(prevState.removeHeight));
        }
        if (
            nextProps.tableData.length !== prevState.tableData.length ||
            !is(nextProps.tableData, prevState.tableData) ||
            nextProps.showDelete !== prevState.showDelete
        ) {
            tempObj.selectedRows = _initSelectedRows(nextProps.tableData, nextProps.showDelete);
            tempObj.tableData = _addDeleteTableBody(nextProps.tableData, nextProps.showDelete, tempObj.selectedRows);
            tempObj.showDelete = nextProps.showDelete;
            tempObj.columns = _addDeleteColumn(nextProps.columns, nextProps.showDelete, prevState.x);
        }
        if (nextProps.columns.length !== prevState.columns.length || !is(nextProps.columns, prevState.columns)) {
            let columns = _initColumns(tempObj.columns ? tempObj.columns : nextProps.columns);
            // 计算x
            let ActualyWidth = _getActualyWidth(columns, prevState.tableWidth);
            let percent = ActualyWidth && prevState.tableWidth ? (ActualyWidth / prevState.tableWidth) * 100 : 100;
            // console.log(prevState.tableWidth, ActualyWidth, percent);
            columns = _delWidth(columns, `${percent}%`);
            percent = `${percent < 100 ? 100 : percent}%`;
            // 计算y
            if (columns.length !== prevState.columns.length) {
                let headerActualyHeight = _getActualyHeight(columns, null);
                tempObj.y = prevState.tableHeight - headerActualyHeight;
            }
            tempObj.columns = initFixedColumns(columns, percent);
            tempObj.components = _initComponents(nextProps.resizeableCustom);
            tempObj.x = percent;
            return tempObj;
        }
        return tempObj;
    }
    
    /* 固定 列 操作 */
    changeColumnFixed(id, e) {
        //console.log(id, e);
        let { columns, x } = this.state,
            type = e.target.value;
        let existColumn = columns.filter(v => v.id === id)[0];
        const index = columns.indexOf(existColumn);
        existColumn.freezeType = type;
        if (x !== "100%") {
            switch (type) {
                case "0":
                    existColumn.fixed = null;
                    break;
                case "1":
                    existColumn.fixed = "left";
                    break;
                case "2":
                    existColumn.fixed = "right";
                    break;
            }
        }
        columns.splice(index, 1);
        const groupColumns = columns.filter(v =>
            type === "0" ? v.freezeType === type || !v.freezeType : v.freezeType === type
        );
        //console.log(groupColumns);
        let referIndex = type === "2" ? 0 : groupColumns.length - 1;
        const joinIndex = groupColumns.length
            ? columns.indexOf(groupColumns[referIndex])
            : type === "1"
                ? 0
                : columns.length;
        columns.splice(type === "0" ? joinIndex + 1 : joinIndex, 0, existColumn);
        /* 如果 存在 删除 item 项 时，需要 把 del 删除项 移动*/
        let delItem = columns.filter(c => c.id === "del")[0];
        if (delItem) {
            let delIndex = columns.indexOf(delItem);
            columns.splice(delIndex, 1);
            columns.unshift(delItem);
        }
        // console.log(columns);
        this.props.updateColumns instanceof Function && this.props.updateColumns({ columns });
        this.props.changeColumnFixedEmit instanceof Function && this.props.changeColumnFixedEmit(id, type);
    }
    
    /* 自定制 删除 值 */
    changeCheckStatus(id, checked) {
        let { tableData } = this.state;
        if (id === "del") {
            tableData.forEach(item => {
                item.checked = checked;
            });
        } else {
            let exsitDataRow = tableData.filter(row => row.mainId === id && row.del)[0];
            let indexOf = tableData.indexOf(exsitDataRow);
            exsitDataRow.checked = checked;
            tableData.splice(indexOf, 1, exsitDataRow);
        }
        this.setState({ tableData });
    }
    
    shouldComponentUpdate(nextProps = {}, nextState = {}) {
        const thisProps = this.props || {},
            thisState = this.state || {};
        if (nextProps.resizeableCustom) return true;
        if (
            Object.keys(thisProps).length !== Object.keys(nextProps).length ||
            Object.keys(thisState).length !== Object.keys(nextState).length
        ) {
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
    
    /* 这里 对于 监听 页面 尺寸变化没必要了，因为 在 组件  加载完成时 宽度 已经发生变化了 */
    resize() {
        const { columns, tableWidth } = this.state;
        let me = this,
            prev = +new Date(),
            time = null,
            delay = 1000,
            ActualyWidth = _getActualyWidth(columns, tableWidth);
        const callback = () => {
            this.setState(
                {
                    bool: !this.state.bool
                },
                () => {
                    this.getTableContainer = ele => {
                        if (!ele) return;
                        this.table = { width: ele.clientWidth, height: ele.clientHeight };
                    };
                    let percent = (ActualyWidth / this.table.width) * 100;
                    this.setState({
                        x: `${percent < 100 ? 100 : Math.ceil(percent)}%`
                    });
                }
            );
        };
        let now = +new Date();
        if (now - prev <= delay) {
            time && clearTimeout(time);
            time = setTimeout(() => {
                prev = now;
                callback.call(me);
            }, 500);
        } else {
            prev = now;
            callback.call(me);
        }
    }
    
    // 改变 选中项 的状态
    changeSelectedRows({ type, bool, id }) {
        let { selectedRows } = this.state;
        if (type === "item") {
            if (bool) {
                selectedRows.push({ key: id });
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
    
    // 改变 sort 以 受控 的 方式 进行 操作
    changeSort(id) {
        let { columns } = this.state;
        let existItem = columns.filter(item => item.id === id)[0];
        let sortIndexLength = columns.filter(item => item.sortOrder && item.id !== id);
        existItem.sortIndex = sortIndexLength.length;
        const index = columns.indexOf(existItem);
        switch (existItem.sortOrder) {
            case "ascend":
                existItem.sortOrder = "descend";
                break;
            case "descend":
                existItem.sortOrder = "false";
                break;
            default:
                existItem.sortOrder = "ascend";
        }
        columns.splice(index, 1, existItem);
        //console.log(columns);
        // this.props.changeSortsArr(columns);
        this.setState({ columns }, () => {
            this.props.changeSortsArr instanceof Function && this.props.changeSortsArr(columns);
        });
    }
    
    componentDidMount() {
        // console.log("table之后，这里改变了 state，是导致 两次 render 的原因");
        if (!this.table) return;
        let { columns } = this.state;
        /* const { isCustom } = this.props; */
        let ActualyWidth = _getActualyWidth(columns, this.table.width);
        //console.log(ActualyWidth);
        let percent = ActualyWidth ? (ActualyWidth / this.table.width) * 100 : 99;
        percent = `${percent < 100 ? 100 : percent}%`;
        //console.log(this.table.height);
        let headerActualyHeight = _getActualyHeight(columns, null); ///* isCustom ? null : "" */这里到时候看要改不，改成 null
        //console.log(headerActualyHeight);
        /* 这里 的 判断 是指 对于 最后一个 不固定 元素 的 width 进行 设置 */
        // console.log("执行", columns, ActualyWidth, this.table.width);
        columns = initFixedColumns(_delWidth(columns, percent), percent);
        this.setState({
            x: percent,
            y: this.table.height - headerActualyHeight,
            tableWidth: this.table.width,
            tableHeight: this.table.height,
            columns
        });
        // window.addEventListener('resize', this.resize);
    }
    
    componentWillUnmount() {
        // window.removeEventListener("resize", this.resize);
    }
    
    handleWidthResize = id => (e, { size }) => {
        let { columns } = this.state;
        let getColumns = columns => {
            columns.forEach(column => {
                if (column.id === id) {
                    column.width = size.width;
                }
            });
            return columns;
        };
        this.setState({
            columns: getColumns(columns)
        });
    };
    
    generateResultColumns() {
        const { columns } = this.state;
        return buildColumns(columns, null);
    }
    
    /* 初始化 onRow 方法 需要的 配置 */
    initOnRowConfig(record) {
        let me = this;
        const { rowClick, resizeableCustom } = me.props;
        const { hoverId } = me.state;
        let tempObj = {};
        tempObj.onClick =
            rowClick instanceof Function
                ? () => {
                    resizeableCustom ? rowClick(record.mainId, record.workFlowId) : rowClick(record.id);
                }
                : null;
        /* 这个 hover 可以先不要 */
        /* if (resizeableCustom) {
            tempObj.onMouseEnter = () => {
                if (record.mainId !== hoverId) {
                    me.setState({
                        hoverId: record.mainId
                    });
                }
            };
            tempObj.onMouseMove = () => {
                if (record.mainId !== hoverId) {
                    me.setState({
                        hoverId: record.mainId
                    });
                }
            };
            tempObj.onMouseOut = () => {
                console.log(record.mainId, hoverId);
                if (record.mainId !== hoverId) {
                    me.setState({
                        hoverId: ""
                    });
                }
            }
        } */
        return tempObj;
    }
    
    render() {
        //console.log("table", "渲染");
        let {
            /* tableData, */ rowSelection,
            /* removeHeight, */ /* isCustom, */ showHeader,
            borderd,
            loading,
            rowClick,
            expandedRowRender,
            expandChange,
            resizeableCustom
        } = this.props;
        let { columns, x, y, removeHeight, hoverId, tableData, components } = this.state;
        // 如果是 自定制 table的 操作
        // console.log(columns, tableData, x, y);
        // 可以 定制 header的宽度
        resizeableCustom &&
        (columns = _addHeaderFun({
            columns,
            handleWidthResize: this.handleWidthResize,
            changeSort: this.changeSort,
            changeCheckStatus: this.changeCheckStatus,
            tableData,
            changeColumnFixed: this.changeColumnFixed
        }));
        return (
            <div
                className={styles.contentTable}
                ref={this.getTableContainer}
                style={{ height: `calc(100% - ${removeHeight ? removeHeight : 0})` }}
            >
                <Table
                    style={{ width: "100%", height: "100%" }}
                    components={components}
                    dataSource={tableData}
                    loading={loading}
                    // columns={columns}
                    expandedRowRender={expandedRowRender}
                    bordered={borderd === undefined ? true : borderd}
                    size="small"
                    pagination={false}
                    onExpand={(expanded, record) => {
                        /* console.log(expanded, record); */
                        expandChange && expandChange(expanded, record);
                    }}
                    showHeader={showHeader === undefined ? true : showHeader}
                    scroll={{ x, y }}
                    // rowClassName={(record, index) => {
                    //     let str = ''; //styles.rowHeight;
                    //     index % 2 === 0 && (str += ` ${styles.rowEven}`);
                    //     hoverId === record.mainId && (str += ` ${styles.hoverId}`);
                    //     return `${str} ${styles.rowHover}`;
                    // }}
                    onChange={(pagination, filters, sorter, extra) => {
                        // 排序
                        //console.log(pagination, filters, sorter, extra);
                    }}
                    onRow={this.initOnRowConfig.bind(this)}
                    // 选择操作,对于 有 rowSpan 的 这个 操作 还满足不了
                    rowSelection={rowSelection && rowSelection()}
                >
                    {// buildColumns(columns, isCustom ? null : "")
                        this.generateResultColumns()}
                </Table>
            </div>
        );
    }
}

export default TableCom;
