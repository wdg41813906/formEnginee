
import { Modal,Button, Card, Input, Row, Col, Menu, Dropdown, Icon, Collapse, Tabs } from 'antd';
import TriggerAction from './TriggerAction'
import ExternalInterface from './ExternalInterface/ExternalInterface'
import styles from './Operate.less'
const { Panel } = Collapse;
const { TabPane } = Tabs;

import ExecAction from './ExecAction'

// {
//     CusNameRender: ({ parentClassName }) => {
//         return <div className={parentClassName}>日期时间1</div>
//     },
//     code: "fld201908071604391492412013",
//     condition: "4",
//     controlType: "DateTime",
//     dataIndex: "dfe803f3-8d38-65c5-7641-ad53bb37fb6a",
//     extendedType: "5",
//     formId: "8b595faf-9cc5-1087-a57c-1000537a0963",
//     id: "dfe803f3-8d38-65c5-7641-ad53bb37fb6a",
//     isChangeTime: false,
//     isFilter: true,
//     isMain: true,
//     isPrimaryKey: false,
//     name: "日期时间1",
//     parentId: null,
//     show: true,
//     type: "date",
//     value: ""
// }
const menu = (
    <Menu>
        <Menu.Item key="0">
            <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
                1st menu item
      </a>
        </Menu.Item>
        <Menu.Item key="1">
            <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
                2nd menu item
      </a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3" disabled>
            3rd menu item（disabled）
    </Menu.Item>
    </Menu>
);
const FieldsMenu = ({ data }) => {
    //
    return (<Menu style={{ width: 200, border: '1px solid #ddd' }}>
        {
            data.map(ele => <Menu.Item key={ele.id}>
                <span> {ele.title}</span>
            </Menu.Item>)
        }


    </Menu>)
}
class Operate extends React.Component {
    constructor(props) {
        super(props)


    }
    componentDidMount() {
        this.props.init();
    }
    onActionChange = (e) => {
        this.setState({
            action: {
                value: e.key,
                actionDesc: e.action
            }
        })

    }
    render() {
        const {loading,exteralList,dataInterfaceList, mode, formList, form, onChangeForm, currentFormField, templateFields, templateMapFields, operateShow, formTemplateId, formTemplateVersionId, name, pushType, triggerCondition,
            onChangeTriggerType, delTriggerCondition, addTriggerCondition, modifyTriggerCondition
            , schedueList, onAddschedueList, onDelschedueList, onModifySchedueList, onModifySchedueFields, onModifySchedueMapFields
            ,getFormTemplateWithFieldPaged, formTemplateWithFields,
            formTempatePagination,formTemplateComLoading
        } = this.props;


        const TriggerActionProps = {
            mode,
            formList,
            form,
            onChangeForm,
            currentFormField,
            formTemplateId,
            formTemplateVersionId,
            pushType,
            triggerCondition,
            onChangeTriggerType,
            delTriggerCondition,
            addTriggerCondition,
            modifyTriggerCondition,
            formTemplateWithFields
          
        }
        const execActionProps = {
            mode,
            pushType,
            form,
            templateFields,
            templateMapFields,
            schedueList,
            onAddschedueList,
            onDelschedueList,
            onModifySchedueList,
            onModifySchedueFields,
            onModifySchedueMapFields,
            getFormTemplateWithFieldPaged,
            formTemplateComLoading,
            formTemplateWithFields,
            formTempatePagination,
            
        }
        const exterlProps={
            form,
            pushType,
            formTemplateId,
            templateFields,
            exteralList,
            dataInterfaceList,
            onAdddataInterfaceList:this.props.onAdddataInterfaceList,
            onModifyDataInterface:this.props.onModifyDataInterface,
            onDelDataInterface:this.props.onDelDataInterface
        }
        //const TriggerActionCom=()=><TriggerAction  {...TriggerActionProps}/>
        return (
            <div>
                <Modal
                    title="业务规则推送"
                    width='98%'
                    style={{ height: 600 }}
                    bodyStyle={{ overflow: 'hidden', padding: '0px 24px 10px' }}
                    visible={operateShow}
                    onOk={e => { this.props.SavePush() }}
                    onCancel={e => { this.props.operateShowToggle(false) }}
                    footer={[
                        <Button key="back" onClick={ e=>{this.props.operateShowToggle(false)}}>
                          取消
                        </Button>,
                        <Button key="submit" type="primary" loading={loading} onClick={this.props.SavePush }>
                          保存
                        </Button>,
                      ]}
                >
                    <Row>
                        <Col span={12} className={styles.tabWrap} style={{ borderRight: '1px solid #ddd' }}>
                            <div className={styles.itemHead}>
                                <div className={styles.itemTitle}>
                                    业务规则名称
                               </div>
                                <div className={styles.itemContent}>
                                    <Input value={name} placeholder="请填写业务规则名称" onChange={e => this.props.onChangeName(e.target.value)}
                                        style={{ width: '95%' }} />
                                </div>
                            </div>

                            {/* <Card bodyStyle={{ padding: '10px 24px' }} title="业务规则名称"
                                bordered={false} style={{ width: '100%' }}
                                extra={<Input value={name} placeholder="请填写业务规则名称" onChange={e => this.props.onChangeName(e.target.value)}
                                    style={{ width: 350 }} />}
                            >

                            </Card> */}

                            <Card title="设置触发动作"
                                headStyle={
                                    { display: 'none' }
                                }
                                bodyStyle={{ padding: '0px 24px 10px', overflow: 'hidden', height: 405 }}
                                bordered={false} style={{ width: '100%' }}>

                                <TriggerAction  {...TriggerActionProps} />

                            </Card>
                        </Col>
                        <Col className={styles.tabWrap} span={12}>
                            <Tabs defaultActiveKey="1" >
                                <TabPane tab="内部推送" key="1">
                                    <ExecAction {...execActionProps} />
                                </TabPane>
                                <TabPane tab="外部推送" key="2">
                                    <ExternalInterface  {...exterlProps}/>
                                </TabPane>

                            </Tabs>


                        </Col>
                    </Row>
                </Modal>
            </div>)
    }
}


export default Operate;