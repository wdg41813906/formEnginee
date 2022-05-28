import styles from './TriggerAction.less'
import Action from './Action'
import { Modal, Card, Input, Row, Col, Menu, Dropdown, Icon, Collapse, Select } from 'antd';
import GenerateFilterCondition from './../DataManage/filterHOC';
import _ from 'underscore'
import { triggerData, formInit, parseControlType } from '../../utils/businessRuleConfig'
import com from '../../utils/com'
const { Option } = Select;

const data = triggerData;
// [
//     { key: "add", name: "新增数据", desc: "在触发表单中填报新的数据", action: '新增的数据满足以下条件，触发执行动作', select: false },
//     { key: "modify", name: "修改数据", desc: "在触发表单中修改已有数据，如流程状态等", action: '修改后的数据满足以下条件，触发执行动作', select: false },
//     { key: "delete", name: "删除数据", desc: "在触发表单中删除某条数据，不包含批量删除", action: '删除的数据满足以下条件，触发执行动作', select: false },
// ]
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

class TriggerAction extends React.Component {
    constructor(props) {
        super(props)
        var action = _.where(data, { key: this.props.pushType })
        this.state = {
            filterArr: [],
            currentFormField: [],
            action: {
                actionDesc: action.length > 0 ? action[0].desc : ''
            }
        }

    }
    componentDidMount() {
        this.setState({
            currentFormField: this.props.currentFormField,
        })

    }
    onActionChange = (e) => {
        this.setState({
            action: {
                actionDesc: e.action
            }
        })
        this.props.onChangeTriggerType(e.key)
    }

    render() {
        const { formList, form, formTemplateId, formTemplateVersionId, formTemplateWithFields, pushType, triggerCondition } = this.props;
        let temp = _.where(formTemplateWithFields, { id: formTemplateId })[0];//getTemplate(pushRelationActionRequest.formTemplateId);
        let forms = formInit(temp);
        
        return (<div style={{ height: '388px', overflow: 'auto', width: '100%' }}>
            <div className={styles.itemWrap}>
                <div className={styles.actionHeader}>触发表单</div>
                <div className={styles.actionSel}>
                    <Select style={{ width: '100%' }} value={form.formId} onChange={
                        e => { this.props.onChangeForm(e) }
                    } placeholder='请选择触发表单'>
                        {
                            forms instanceof Array && forms.map(ele =>
                                <Option value={ele.formId}>{ele.name}</Option>)
                        }

                    </Select>
                </div>
            </div>
            {
                form.formId &&
                <div>
                    <div className={styles.actionHeader}>触发动作</div>
                    <Action actionData={data} value={pushType} onChange={
                        e => {
                            this.onActionChange(e)
                        }
                    } />

                    {
                        pushType && <TriggerActionInstance {...this.props} actionDesc={this.state.action.actionDesc} />
                    }
                </div>
            }


        </div>)
    }
}
class TriggerActionInstance extends React.Component {
    constructor(props) {
        super(props)
        var action = _.where(data, { key: this.props.pushType })
        debugger
        this.state = {
            filterArr: [],
            currentFormField: this.props.currentFormField,
            action: {
                actionDesc: action.length > 0 ? action[0].desc : ''
            }
        }

    }
    fieldClick = (ele) => {
        var filterArr = this.state.filterArr;
        var currentFormField = this.state.currentFormField;
        if (ele.controlType) {
            ele.CusNameRender = ({ parentClassName }) => {
                return <div title={`${ele.status===-1?'该字段已删除':''}`}
                style={{color:`${ele.status===-1?'#f5222d ':''}`}}
                className={`${parentClassName} ${styles.fieldName}`}>{ele.name}</div>
            };
            if(ele.groupItems){
                ele.id=ele.groupItems['name'].id
            }
            ele.name = ele.name;
            ele.configKey = com.Guid();
            ele.type = parseControlType(ele.controlType)
            if(ele.type==='textSwitch'){
                ele.value=false;
            }
            ele.condition = ele.type==='select'?'13':(ele.type==='attachment'?'2': "4"),
            // property: ele.property,
            // status:ele.status,
            
            filterArr.push(ele);
            currentFormField.forEach(item => {
                if (item.id === ele.id) {
                    item.disable = true;
                }
            })
            this.props.addTriggerCondition(ele)
        }
        this.setState({
            filterArr,
            currentFormField
        })
    }

    render() {
        const { mode, formTemplateId, formTemplateVersionId, pushType, triggerCondition } = this.props;

        const generateFilterConditionProps = {
            templateId: formTemplateId,
            FormTemplateVersionId: formTemplateVersionId,
            layout: "businessRule",//水平布局//businessRule
            filterConditionArr: triggerCondition.filter(e => { return e.operationStatus !== 0 }),
            filterFeildChange: (index, id) => {
                let { filterArr, currentFormField } = this.state;
                currentFormField.forEach(item => {
                    if (item.id === id) {
                        item.disable = false;
                    }
                })
                this.props.delTriggerCondition(id)
                this.setState({
                    currentFormField
                });
            },
            changeConditionValue: (id, keyValue, callBack) => {
                this.props.modifyTriggerCondition(id, keyValue)
            },
            getLocationArr: () => { }
        }
        const menu = (
            <Menu style={{ width: 200, border: '1px solid #ddd',maxHeight:'500px',overflow:'auto' }}>
                {
                    this.state.currentFormField.map(ele => {
                        if(ele.operationStatus!==-0){
                            return <Menu.Item disabled={ele.disable} key={ele.id}>
                            <span style={{ display: 'block' }} onClick={
                                e => { !ele.disable && this.fieldClick(ele) }
                            }> {ele.name}</span>
                        </Menu.Item>
                        }
                    })
                }


            </Menu>
        )
        return (<div>
            <div className={styles.actionHeader2}>{this.props.actionDesc}</div>
            <Dropdown trigger={['click']} overlay={menu} placement="topCenter">
                <p className={styles.actionAdd}><Icon type="plus" /> 添加触发条件 </p>
            </Dropdown>
            <GenerateFilterCondition {...generateFilterConditionProps} />
        </div>)
    }
}
export default TriggerAction;