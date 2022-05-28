import { Component } from "react"
import { Modal, Icon, Upload, Button, Select, Input, message } from "antd"
import styles from "./ImportProcedureThree.less"
import { Guid } from "../../../utils/com"
//import moment from "moment"
import { getResultExcelHeader } from "../../../services/DataManage/DataManage"
//import { LinkFormDetail } from "../../../services/FormBuilder/FormBuilder"
import { List } from "immutable"

import TableCom from "../TableCom";

const Option = Select.Option;

// 操作行的 组件
const OperateCom = (props) => {
    let { fieldsList, columnId, fieldsResultMess, onFieldChange } = props;
    let isExist = fieldsList.filter(item => (item.name === fieldsResultMess[columnId]["name"]));
    let value = null;
    if (isExist.length) {
        value = fieldsResultMess[columnId]["name"];
    } else {
        value = fieldsList.length ? fieldsList[0]["name"] : null;
    }
    return (
        <Select className={styles.operate} value={value} dropdownMatchSelectWidth={true} onChange={(e, o) => { onFieldChange({ columnId, name: e, id: o.key }); }}>
            {
                fieldsList.map(field => (
                    <Option title={field.name} key={field.id} value={field.name}>{field.name}</Option>
                ))
            }
        </Select>
    )
}
// 剔除 不渲染的项
const _bodyColumns = (tableData) => {
    return tableData.reduce((prev, next) => {
        let rowData = next.reduce((p, n, index) => {
            const { isRender, ...other } = n;
            if (isRender !== false) { p.push({ isRender, index, ...other }) };
            return p;
        }, []);
        prev.push(rowData)
        return prev;
    }, []);
}
// 处理 tableData 数据
const dealTableData = ({ tableData, columns, fieldsList, fieldsResultMess, onFieldChange }) => {
    let dataColumns = columns.filter(column => column.isData);
    const ids = dataColumns.reduce((prev, next) => {
        let tempArr = new Array(next.columnSpan).fill(next.id);
        Array.prototype.push.apply(prev, tempArr);
        return prev;
    }, []);
    let temptableData = _bodyColumns(tableData).reduce((prev, next, index) => {
        let itemObj = {};
        itemObj.key = index;
        /* let maxRowSpan = next.reduce((prev,next)=>{
            next.rowSpan = next.rowSpan?next.rowSpan:0;
            if(next.rowSpan > prev){
                prev = next.rowSpan;
            }
            return prev;
        },1); */
        next.forEach((item, i) => {
            itemObj[`${ids[item.index]}`] = item;
            // 这里 要显示 对 colSpan，和 rowSpan进行 显示声明
            itemObj.custom = { value: index + 1, index: -1, columnSpan: 1, rowSpan: 1,/* maxRowSpan */ }
        })
        prev.push(itemObj);
        return prev;
    }, []);
    // 添加 一列 操作列
    // 去重 ids
    let newIds = ["custom"];
    ids.reduce((prev, next) => {
        if (!prev[next]) {
            prev[next] = 1;
            newIds.push(next);
        }
        return prev;
    }, {});
    let operate = newIds.reduce((prev, next) => {
        if (next === "custom") {
            prev[next] = {
                value: "表单字段",
                index: -1
            }
        } else {
            let configColumn = columns.filter(item => item.id === next)[0];
            prev[next] = {
                columnSpan: configColumn.columnSpan,
                index: 0,
                isRender: true,
                rowSpan: 1,
                value: <OperateCom fieldsList={fieldsList} columnId={configColumn.id} fieldsResultMess={fieldsResultMess} onFieldChange={onFieldChange} />,
            }
        }
        return prev;
    }, { key: -1 });
    temptableData.unshift(operate);
    return temptableData
}
// 处理 columns 数据
const dealColumnsData = (columns) => {
    // 如果 header 上 有 合并 列的时候，需要 去人工加上 表头数据
    columns = columns.reduce((prev, next) => {
        if (next.isData) {
            let tempArr = [];
            tempArr.push(next);
            for (let i = 1; i < next.columnSpan; i++) {
                tempArr.push({  //这里对应的 dataIndex 为 undefined 时，他的 body的 render 的 val 就是 row的值
                    parentId: next.parentId,
                    isData: true,
                    columnSpan: 0,
                });
            }
            prev.push(...tempArr);
        } else {
            prev.push(next);
        }
        return prev;
    }, []);
    // 添加序列号 表头
    columns.unshift({
        parentId: null,
        isData: true,
        title: "",
        id: "custom",
        key: "custom",
        columnSpan: 1
    });
    columns.forEach(column => {
        column.dataIndex = column.id;
        if (column.isData) {
            column.width = 150;
            column.colSpan = column.columnSpan;
            column.render = (val, row, index) => {
                let tempObj = {
                    props: {}
                };
                if (!val) {
                    tempObj.props.rowSpan = 0;
                    tempObj.props.colSpan = 0;
                } else {
                    const { value, rowSpan, columnSpan, index } = val;
                    const boolIndex = typeof index === "number";
                    tempObj.children = value ? value : "";
                    tempObj.props.rowSpan = rowSpan ? rowSpan : (boolIndex ? 1 : 0);
                    tempObj.props.colSpan = columnSpan ? columnSpan : (boolIndex ? 1 : 0);
                }
                return tempObj;
            }
        }
    });
    return columns;
}
// 初始化 fieldsResultMess 的 值
const initFieldsResultMess = (columns, fieldsList,storeImportExcelResultData) => {
    const dataColumns = columns.filter(i => i.isData);

    let fieldsMess = dataColumns.reduce((prev, next) => {
        let existItem = fieldsList.filter(i => i.name === next.title)[0];
        prev[next.id] = { name: next.title, id: existItem ? existItem.id : "-1" };
        return prev;
    }, {});
    /* 初始化 后台 传入项的 数据 */
    if(Object.keys(fieldsMess).some(i => fieldsMess[i]["id"] !== "-1")){
        storeImportExcelResultData instanceof Function && storeImportExcelResultData(dealImportExcelResultData({ fieldsResultMess:fieldsMess, columns, fieldsList }));
    }
    return fieldsMess
}

// 处理 后台需要的数据源
const dealImportExcelResultData = ({ fieldsResultMess, columns, fieldsList }) => {
    let columnsIds = Object.keys(fieldsResultMess).filter(v => fieldsResultMess[v]["id"] !== "-1");
    let isDataColumns = columns.filter(v => v.isData);
    return columnsIds.reduce((prev, next) => {
        let columnsNameObj = isDataColumns.filter(item => next === item.id)[0];
        let fieldObj = fieldsList.filter(item => item.id === fieldsResultMess[next]["id"])[0];
        prev.push({
            IsHide: true,
            Code: fieldObj.code,
            id: Guid(),
            FormVersionHistoryId: fieldObj.id,
            FormId: fieldObj.formId,
            ColumnName: columnsNameObj.title,
            ColumnIndex: columnsNameObj.columnIndex
        });
        return prev;
    }, []);
}
class ImportProcedureThree extends Component {
    constructor(props) {
        super(props);
        let fieldsList = props.fieldNameArr.filter(item=>item.controlType !== "SerialNumber");
        fieldsList.unshift({ name: "不导入", id: "-1" });
        this.state = {
            columns: [],
            tableData: [],
            fieldsList,
            fieldsResultMess: {}, //这里存储 最后 匹配的 信息值, columnId:name
            formTemplateVersionId: props.FormTemplateVersionId, // 版本号
        }
        this.onFieldChange = this.onFieldChange.bind(this);
        this.initHeaderAndBody(fieldsList,props.storeImportExcelResultData);
        // this.getFieldName();
    }
    initHeaderAndBody(fieldsList,storeImportExcelResultData) {
        let me = this;
        const { excelName, currentExcelValue } = me.props;
        getResultExcelHeader({ index: currentExcelValue, fileName: excelName }).then(res => {
            /* if (res.data && res.data.error) {
                message.config({ maxCount: 1 });
                message.error(res.data.error);
            } */
            if (res.data && res.data.tableHeadViewResponses) {
                const columns = res.data.tableHeadViewResponses;
                me.setState({
                    columns,
                    fieldsResultMess: initFieldsResultMess(columns, fieldsList,storeImportExcelResultData)
                });
            }
            if (res.data && res.data.tableBody) {
                me.setState({
                    tableData: res.data.tableBody
                });
            }
        }, err => {
        
        });
    }
    /* getFieldName(){
        let me = this;
        LinkFormDetail({templateId:me.props.templateId}).then(res=>{
            if(res.data && res.data.fields){
                res.data.fields.unshift({name:"不导入",id:"-1"});
                me.setState({
                    fieldsList:res.data.fields,
                    formTemplateVersionId:res.data.formTemplateVersionId
                });
            }
        },err=>{
        
        })
    } */
    // 改变 配对项
    onFieldChange(field) {
        const { columnId, ...other } = field;
        const { fieldsResultMess, columns, fieldsList, formTemplateVersionId } = this.state;
        const { storeImportExcelResultData } = this.props; //设置值
        // 如果 某个 字段 进行 重复 配置时，需要还原 前一个
        let restoreId = null;
        Object.keys(fieldsResultMess).forEach(id => {
            if (fieldsResultMess[id].id === other.id) {
                restoreId = id;
            }
        });
        if (restoreId) {
            fieldsResultMess[restoreId] = { name: "不导入", id: "-1" };
        }

        fieldsResultMess[columnId] = { ...other };
        console.log(fieldsResultMess);

        this.setState({ fieldsResultMess }, () => {
            storeImportExcelResultData(dealImportExcelResultData({ fieldsResultMess, columns, fieldsList }), formTemplateVersionId);
        });
    }
    render() {
        const { excelName } = this.props;
        const { columns, tableData, fieldsList, fieldsResultMess } = this.state;
        console.log(this.state);
        let test = dealTableData({ tableData, columns, fieldsList, fieldsResultMess, onFieldChange: this.onFieldChange });
        console.log(test);
        let tempColumns = dealColumnsData(columns);
        console.log(tempColumns);
        return (
            <div style={{ height: "420px" }}>
                <div className={styles.selectSheet}>
                    表单名称
                    <Input className={styles.customSelect} readOnly={true} value={excelName} title={excelName} />
                </div>
                <TableCom columns={tempColumns} tableData={test} removeHeight={"50px"} isCustom={true} />
            </div>
        );
    }
}

export default ImportProcedureThree;
