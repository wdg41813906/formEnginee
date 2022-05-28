

import { Collapse, Icon, Select, Menu, Dropdown, Tooltip } from 'antd';
import { getTemplate, formInit, controlGroupsCondition } from '../../../utils/businessRuleConfig';
import _ from 'underscore';
import styles from './DataInterface.less'
const { Panel } = Collapse;
const { Option } = Select;
const testData = [{
    title: '推送我的接口', id: '12343434', mappdingData: [
        { name: '12', id: '12334343' },
        { name: '3344', id: '54343' }
    ]
}]
const customPanelStyle = {
    background: '#fafafa',
    borderRadius: 4,
    marginBottom: 24,
    border: 0,
    overflow: 'hidden',
};
const genExtra = (onDelDataInterface, item) => (
    <Icon
        className={styles.del}
        type="delete"
        onClick={event => {
            onDelDataInterface && onDelDataInterface(item)
            event.stopPropagation();
        }}
    />
);
export default class DataInterface extends React.Component {
    constructor(props) {
        super(props)
        // var formTemplate = getTemplate(this.props.formTemplateId);
        // var forms = formInit(formTemplate);
        
        this.state = {
            targetFields:[]
        }
    }
    componentDidMount(){
        // var formTemplate = getTemplate(this.props.formTemplateId);
        // var forms = formInit(formTemplate);
        // let form = _.where(forms, { formId: this.props.form.formId })[0];
        // this.setState({
        //     targetFields: form ?form.fields : []
        // })
    }
    render() {
        const { dataInterfaceList } = this.props;
        const mappingProps = {
            onModifyDataInterface: this.props.onModifyDataInterface,
            targetFields:this.props.templateFields// this.state.targetFields,

        }
        return (<div style={{ width: '100%' }}>
            <Collapse
                accordion
                bordered={false}
                style={{ width: '100%' }}
                defaultActiveKey={['1']}
                expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
            >
                {
                    dataInterfaceList.map(item => {
                        if (item.operationStatus !== 0) {
                            return <Panel header={item.name} key={`${item.id}`} style={customPanelStyle}
                                extra={genExtra(this.props.onDelDataInterface, item)}>
                                <div className={styles.schContent}>
                                    {
                                        item.mappingData.map(ele => <Mapping key={ele.id}
                                            {...mappingProps}
                                            item={item}
                                            data={ele} />)
                                    }
                                </div>

                            </Panel>
                        }
                    }
                    )
                }


            </Collapse>
        </div>)
    }
}

class Mapping extends React.Component {

    onFieldChange = (val) => {
        let tars = this.props.targetFields;
        let field = _.where(tars, { id: val })[0];
        let addEle = {}
        addEle.formItemId = field.id;
        addEle.code = field.code;
        addEle.formCode = field.formCode;
        addEle.controlType = field.controlType;

        if (field.groupItems) {
            var groups = [];
            for (let key in field.groupItems) {
                groups.push(field.groupItems[key])
            }
            addEle.groupItems = groups;
        }

        this.props.onModifyDataInterface(this.props.item, this.props.data, addEle)
    }
    onGroupConChange = (val) => {
        this.props.onModifyDataInterface(this.props.item, this.props.data, { code: val })
    }
    render() {
        const { item, data, targetFields } = this.props;
        return (<div className={styles.wrap}>
            <div className={`${styles.fieldName} ${styles.line}`}>
                <Icon className={styles.fieldIcon} type="font-size" /> {data.name}
            </div>
            <div className={`${styles.condition} ${styles.line}`}>
                映射为
            </div>
            <div className={`${styles.line}`}>
                <Select value={data.formItemId} style={{ width: 150 }} onChange={(value) => this.onFieldChange(value)}>
                    {targetFields.map(tar => <Option key={tar.id} value={tar.id} >{tar.name}</Option>)}

                </Select>
            </div>
            {
                (data.controlType && controlGroupsCondition.includes(data.controlType))
                    ? <div className={`${styles.line}`}>
                        <Select value={data.code} onChange={(value) => { this.onGroupConChange(value) }} style={{ width: 150 }}>
                            {
                                data.groupItems && data.groupItems.map(gro =>
                                    <Option key={gro.id} value={gro.code}>{gro.key}</Option>)
                            }

                        </Select>
                    </div> : <div style={{ marginLeft: 10 }}><div style={{ width: 150 }}></div></div>
            }



        </div>)
    }
}