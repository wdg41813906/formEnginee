import { Layout, Input, Tree, Icon, Select, Button,message } from "antd"
import styles from "./MemRightDep.less"

import TableCom from "../../DataManage/TableCom"
import TableFooter from "./TableFooter"

const Option = Select.Option;

function MemRightDep(props) {
    let { selectedName,memTableData,columns,rowSelection,tableLoad,tableFooterProps,/* operAddMemModal, */getMemDetailFun,deleteMemList,selectedMemberArr/* ,operSelectedModal */,setMixedDep,addMemClick,importFromOtherDep } = props;
    console.log(memTableData,columns);
    return (
        <div style={{height:"100%"}}>
            <div className={styles.title}>
                {selectedName}
            </div>
            {
                memTableData.length ? (
                    <div className={styles.memOper}>
                        <div className={styles.operItem} onClick={() => { addMemClick(); }}>添加成员</div>
                        <Select defaultValue={"0"} style={{ marginRight: "4px" }}>
                            <Option value="0">导入</Option>
                            <Option value="1">导出</Option>
                        </Select>
                        <div className={styles.operItem} onClick={()=>{if(!selectedMemberArr.length){
                            message.config({maxCount:1});
                            message.warning("请选择成员");
                            return;
                        };setMixedDep();}}>设置所在部门</div>
                        <div className={styles.operItem} onClick={()=>{deleteMemList(selectedMemberArr);}}>删除</div>
                    </div>
                ) : ""
            }
            {
                !memTableData.length ? (
                    <div className={styles.noMember}>
                        <div className={styles.desc}>当前部门无任何成员</div>
                        <div className={styles.noMemberEdit}>
                            <Button className={styles.btnItem} onClick={() => { addMemClick(); }}>添加成员</Button>
                            <Button className={styles.btnItem}>批量导入</Button>
                            <Button className={styles.btnItem} onClick={()=>{importFromOtherDep();}}>从其他部门移入</Button>
                        </div>
                    </div>) : ""
            }
            {
                memTableData.length ? (<TableCom columns={columns} tableData={memTableData} removeHeight={"140px"} borderd={false} rowSelection={rowSelection} loading={tableLoad} rowClick={getMemDetailFun}/>) : ""
            }
            {
                memTableData.length ? (<TableFooter {...tableFooterProps} />) : ""
            }
        </div>
    )
}

export default MemRightDep;