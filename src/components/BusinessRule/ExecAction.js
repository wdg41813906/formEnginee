
import Action from './Action'
import { Modal, Card, Input, Row, Col, Menu, Dropdown, Icon, Collapse } from 'antd';
import Schedue from './Schedue';
import com from '../../utils/com'
import { execActionData } from '../../utils/businessRuleConfig'
import styles from './ExecAction.less'
import './BusGlobal.less'
const data = execActionData
//  [
//     { key: "add", name: "新增数据", desc: "在目标表单中新增数据", action: '新增的数据满足以下条件，触发执行动作', select: false },
//     { key: "modify", name: "修改已有数据", desc: "在目标表单中查找某些数据并修改", action: '修改后的数据满足以下条件，触发执行动作', select: false },
//     { key: "delete", name: "删除已有数据", desc: "在目标表单中查找某些数据并删除", action: '删除的数据满足以下条件，触发执行动作', select: false },
//     { key: "modifyOrAdd", name: "修改或新增数据", desc: "查找某些数据进行修改，若找不到则新增", action: '删除的数据满足以下条件，触发执行动作', select: false },
// ]

class ExecAction extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            action: {
                value: 'add',
                actionDesc: ""
            }
        }

    }
    onActionChange = (e) => {
        this.setState({
            action: {
                value: e.key,
                actionDesc: e.action
            }
        })
        this.props.onAddschedueList({
            id: com.Guid(), operationStatus: 1, type: e.key, title: e.name,
            filterConditions: [],
            fieldMapings: [],
            newfieldMapings:[]
        })

    }
    render() {

        const { form,mode, pushType, templateFields, templateMapFields, schedueList, onDelschedueList, onModifySchedueList,
            onModifySchedueFields, onModifySchedueMapFields, getFormTemplateWithFieldPaged,
            formTemplateWithFields,
            formTempatePagination, formTemplateComLoading } = this.props

        const schedueProps = {
            pushType,
            form,
            mode,
            templateFields,
            templateMapFields,
            schedueList,
            onDelschedueList,
            onModifySchedueList,
            onModifySchedueFields,
            onModifySchedueMapFields,
            getFormTemplateWithFieldPaged,
            formTemplateComLoading,
            formTemplateWithFields,
            formTempatePagination,
        }
        const menu = (
            <Menu>
                {
                    data.map(ele => <Menu.Item key={ele.key}>
                        <span onClick={
                            e => {
                                this.props.onAddschedueList({
                                    id: com.Guid(),
                                    key:com.Guid(),
                                    operationStatus: 1,
                                    type: ele.key,
                                    title: ele.name,
                                    filterConditions: [],
                                    fieldMapings: [],
                                    newfieldMapings:[]
                                })
                            }
                        }>{ele.name}</span>
                    </Menu.Item>)
                }


            </Menu>
        );
        return (<div>
            <Card title="设置执行动作" headStyle={{ position: 'relative', zIndex: 9999 }}
                bodyStyle={{ padding: '10px 24px', overflowY: 'auto', height: 407 }} extra={
                    schedueList.length > 0 && <Dropdown overlay={menu}>
                        <p className={styles.actionAdd}>
                            新增执行动作<Icon type="down" />
                        </p>
                    </Dropdown>

                } bordered={false} style={{ width: '100%' }}>
                {
                    schedueList.length <= 0 &&
                    <Action disable={pushType === ''} actionData={data} value='' onChange={
                        e => {
                            this.onActionChange(e)
                        }
                    } />
                }
                <Schedue  {...schedueProps} />
            </Card>
        </div>)
    }
}

export default ExecAction;