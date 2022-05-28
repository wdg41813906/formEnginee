import { Component } from "react"
import { Modal, Icon, Upload, Button, message } from "antd"
// import config from "../../../utils/config";
import { uploadFile } from "../../../services/DataManage/DataManage"
import styles from "./ImportProcedureOne.less"

function ImportProcedureOne(props) {
    let { importSteps, changeSteps, importExcel, getExcelSheets } = props;
    return (
        <div style={{ height: "420px" }}>
            <div className={styles.alertNote}>
                <p><Icon type="exclamation" theme="outlined" />支持 2MB 以内的xls、xlsx格式文件</p>
                <p><Icon type="exclamation" theme="outlined" />文件中数据不能超过50000行、200列（如需导入为部门成员字段，则不能超过10000行、200列）</p>
                <p><Icon type="exclamation" theme="outlined" />子表单明细同样占用行数</p>
                <p><Icon type="exclamation" theme="outlined" />更多导入说明和示例，请查看 <span>帮助文档</span></p>
            </div>
            <div className={styles.mainContent}>
                <div className={styles.contentOperate}>
                    <Upload accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" showUploadList={false}
                        action={`${config.serverIp}/Files/ImportExcel`}
                        headers={{ Authorization: "Bearer so55xAzH0le6qAOpivNn2kXI3kI+29V38FvNUPiCzl/+U+mtpGjjCGbvIeQObRNd0wGB+FUWsMOQD0koTiHHivbkyrxhmwRJmUX6ajEW2qNFguLJAYoRvkf1tM0Fxb8O0C/HbM7jSjPXx0+KoM1l5iAnFlyWN+Jgm5yC7+yHWOJ1otuMAUkR0TbYMmnOkN9vK4bJujTO6orsu+qpRozy6hdWrB7FrieQKcNSKiERLzaF4LJsCahRUuGh17mtp72DWzv0gNdwAq8093Xv5U0MkALN+yugczyl4QMywhbSc6Od645G7RshFxYTa5DJawF5P3AO7W5jg/Sdd6HeaoicgcxKROc38bK7/yz4w2CJ1aK4jJV1h162KbvQaGTgEzIPHfowJXk8sv5ewTfGNoO/ZQHFPLvHpYSjWk6D9nIiots=" }}
                        /* customRequest={(e)=>{
                            console.log(e);
                            let formData = new FormData();
                            for(let key in e){
                                formData.append(key,e[key]);
                            }
                            uploadFile(formData).then(res=>{
                                console.log(res);
                            },err=>{
                                console.log(err);
                            })
                        }} */
                        onChange={(e) => {
                            console.log(e);
                            if (e["file"]["status"] === "done") {
                                const typeReg = /^(\.csv|application\/vnd.openxmlformats-officedocument.spreadsheetml\.sheet|application\/vnd\.ms-excel)$/ig;
                                if (typeReg.test(e["file"]["type"])) {
                                    importExcel(e["file"]["response"]["ExcelData"], e["file"]["response"]["FileName"]);
                                    changeSteps(importSteps + 1);
                                    getExcelSheets();
                                } else {
                                    message.config({ maxCount: 1 });
                                    message.warning("不支持选择的文件类型");
                                }
                            }
                        }}
                    >
                        <Button style={{ color: "#1990ff", border: "1px solid #1990ff", padding: "0 20px" }}>
                            <Icon type="upload"/>
                            上传文件
                        </Button>
                    </Upload>
                    <div className={styles.download}>推荐使用<span>标准模板</span>导入数据</div>
                </div>
            </div>
        </div>
    );
}

export default ImportProcedureOne;
