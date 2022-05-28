
import styles from './List.less'
import TableFooter from "../../components/FormControl/common/TableFooter";
import { Button, Popconfirm,Card,Divider ,Switch, Radio, Icon, Row, Col,Empty  } from 'antd';
import {triggerData} from '../../utils/businessRuleConfig';

const data = [1, 2, 3, 4, 5]
const heightWin=window.innerHeight-315;
const CommandSwitch=({type,table})=>{
        switch(type){
            case 1:
                return  <p>在「{table}」中新增数据</p>;
            case 0:
                return <p>删除「{table}」的数据</p>;
            case 2:
                return <p>修改「{table}」的数据</p>;
            case 3:
                return  <p>在「{table}」中修改或新增数据</p>
            default:
                return <p></p>

        }
}
function List({ 
    operateShowToggle,
    add,
    remove,
    pageIndex,
    pageCount,
    pageSize,
    GetById,
    totalCount,
    pushRelationList,
    getDataSourceList,
    getPushQueuePage,
    actionLogShowToggle,
    setCurrentPushRelationId
}) {
    
    const tableFooterPorps = {
        
        isSet: false,
        pageIndex,
        totalPage: pageCount,
        pageSize: pageSize,
        totalCount,
        getPageTableData:  (value) => {
            getDataSourceList({ current: value, pageSize: pageSize });
        },
        selecChange: (value) => {
            getDataSourceList({ current: pageIndex, pageSize: value });
        },
        refresh: () => {
            getDataSourceList({ current: pageIndex, pageSize: pageSize });
        }
    }
    return (<div>
        <div className={styles.listHead}>
            业务规则
               <Button onClick={e=>add()} className={styles.listAdd} type="primary" shape="round" icon="plus" size="default">
                新增业务规则
             </Button>
        </div>
        {
            pushRelationList.length<=0&&<Empty  image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
        }
        <Row gutter={16} style={{height:heightWin,overflow:'auto', marginTop: 10, paddingLeft: 20, paddingRight: 20 }}>
            {
                pushRelationList.map(ele => 
                <Col key={ele} span={8} style={{paddingBottom:20}}>
                    <Card headStyle={{padding:"0 12px",minHeight:40}} bodyStyle={{padding:'0'}} title={ele.name} bordered={true}>
                        <div className={styles.ruleBody}>
                            <p>「{ele.formTemplate}」数据{ele.pushTypeName}后 </p>
                            
                             {
                                 ele.pushCommands.map(commad=><CommandSwitch type={commad.type} table={commad.name}></CommandSwitch>)
                             }
                            {
                               ele.remotePushConfigs&& ele.remotePushConfigs.map(remote=>
                                    
                                     <p>向「{remote.exteralName}」接口推送数据</p>)
                            }
                           
                        </div>
                        
                        <div className={styles.listFloot}>
                           {/* <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked /> */}
                           <div className={styles.listOp}>
                               <span onClick={e=>{
                                   actionLogShowToggle(true)
                                   getPushQueuePage(ele.id,1);
                                   setCurrentPushRelationId(ele.id)}} className={styles.op}>查看执行日志</span>
                               <span onClick={e=>GetById(ele.id)} className={styles.op}>编辑</span>
                               <Popconfirm onConfirm={e=>remove(ele.id)} title="确定删除吗？" okText="确定" cancelText="取消">
                               <span className={styles.op}>删除</span>
                               </Popconfirm>
                               </div>
                        </div>
                     </Card>
                </Col>)
            }


        </Row>
        <TableFooter {...tableFooterPorps} />
    </div>)
}

export default List;