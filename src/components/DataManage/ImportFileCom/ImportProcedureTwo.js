import { Component } from "react"
import { Modal, Icon, Upload, Button, Select } from "antd"
import styles from "./ImportProcedureTwo.less"
import { Guid } from "../../../utils/com"
import moment from "moment"

import TableCom from "../TableCom";
const Option = Select.Option;

function generateColumnsAndData(dataArr) {
    if (!dataArr || !dataArr.length) return { columns:[], dealData:[] };
    let dataChildArr = dataArr[0];
    let columns = [];
    dataChildArr.forEach((v, i) => {
        columns.push({
            title: `a${i}`,
            dataIndex: `a${i}`,
            key: `a${i}`,
            width: 100,
            parentId:null,
            isData:true,
            render: (value, row, index) => {
                let tempObj = {
                    props: {}
                };
                if (value.hasOwnProperty("Value")) {
                    tempObj["children"] = value["Value"];
                } else {
                    tempObj["children"] = "";
                }
                if (value.hasOwnProperty("IsRender")) {
                    if (value["IsRender"]) {
                        tempObj["props"]["rowSpan"] = value["RowSpan"];
                        tempObj["props"]["colSpan"] = value["ColumnSpan"];
                    } else {
                        tempObj["props"]["rowSpan"] = 0;
                        tempObj["props"]["colSpan"] = 0;
                    }
                } else {
                    tempObj["props"]["rowSpan"] = 1;
                    tempObj["props"]["colSpan"] = 1;
                }

                return tempObj;
            }
        });
    });
    let dealData = [];
    dataArr.forEach((v, index) => {
        let itemObj = {};
        itemObj["key"] = index;
        v.forEach((item, i) => {
            itemObj[`a${i}`] = item;
        })
        dealData.push(itemObj);
    });
    return { columns, dealData };
}
function ImportProcedureTwo(props) {
    let { stepsTwoTableData, excelName, excelSheetsArr,getExcel,currentExcelValue } = props;
    console.log(stepsTwoTableData);
    let { columns, dealData } = generateColumnsAndData(stepsTwoTableData);
    console.log(columns, dealData);
    return (
        <div style={{ height: "420px" }}>
            <div className={styles.selectSheet}>
                工作表
                <Select className={styles.customSelect} value={excelSheetsArr.length?excelSheetsArr[currentExcelValue]["name"]:""} onChange={(e)=>{getExcel(e,excelName);}}>
                    {
                        excelSheetsArr?excelSheetsArr.map((v, i) => (
                            <Option key={v["value"]}>{v["name"]}</Option>
                        )):null
                    }

                </Select>
            </div>
            <TableCom columns={columns} tableData={dealData} removeHeight={"50px"} showHeader={false} />
        </div>
    );
}

export default ImportProcedureTwo;