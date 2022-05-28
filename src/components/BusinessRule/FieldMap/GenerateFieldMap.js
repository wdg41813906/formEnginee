import { Select, Icon, Input, InputNumber, DatePicker, Switch } from 'antd';
import moment from 'moment';
import { fieldSelectMode, getControlTypeMap, getControlTypeCondition, controlGroups } from '../../../utils/businessRuleConfig'
import { parseBoolean } from '../../../utils/com'
import _ from 'underscore'
import styles from './GenerateFieldMap.less';
const { Option } = Select;
const comWidth = 180;
// class ControlTypeExport extends React.Component {
//     render() {
//         const { controlType } = this.props
//         switch (controlType) {
//             case "string":

//             case "datetime":

//             case "array":
//             case "boolean":
//             case "number":

//         }
//     }
// }
class ValueTypeExport extends React.Component {
    render() {
        const { info, mode, item } = this.props
        switch (info.valueType) {
            case "string":
                return <Input value={info.valueOfCom} onChange={e => {
                    this.props.filterValueChange(item, info.valueType, e.target.value, info)
                }} style={{ width: comWidth }}/>
            case "datetime":
                var dateVal = info.valueOfCom ? moment(info.valueOfCom) : '';
                let showTime = false;
                var dataformat = 'YYYY-MM-DD HH:mm:ss';
                if (info.property) {
                    var date = JSON.parse(info.property)
                    dataformat = date.dateFormat
                    let arr = dataformat.split(' ')
                    if (arr.length >= 2) {
                        showTime = { format: arr[1] }
                    }
                }
                return <DatePicker showTime={showTime} format={dataformat} value={dateVal} style={{
                    width: comWidth
                    , minWidth: comWidth
                }} onChange={(date, dateString) => {
                    this.props.filterValueChange(item, info.valueType, dateString, info)
                }} />
            // case "array":
            //     return (<EditableTagGroup  onChange={value=>{
            //         this.props.filterValueChange(item,info.valueType, value, info)
            //     }}/>)
            case "boolean":
                let checked = false;
                checked = parseBoolean(info.valueOfCom)
                // if(info.valueOfCom==='true'||info.valueOfCom==='false'){
                //     checked=JSON.parse(`${info.valueOfCom}`);
                // }
                // if(info.valueOfCom===true||info.valueOfCom===false){
                //     checked=info.valueOfCom;
                // }
                // if(info.valueOfCom==='0'||info.valueOfCom===0){
                //     checked=false;
                // }
                // if(info.valueOfCom==='1'||info.valueOfCom===1){
                //     checked=true;
                // }
                return <div style={{ width: comWidth }}><Switch checked={checked}
                    onChange={(checked) => { this.props.filterValueChange(item, info.valueType, checked, info) }} /></div>
            case "number":
                return <InputNumber value={info.valueOfCom} onChange={e => {
                    this.props.filterValueChange(item, info.valueType, e, info)
                }} style={{ width: comWidth }}></InputNumber >
            default:
                return <div style={{ width: comWidth }}></div>
        }
    }
}
class ValueExport extends React.Component {
    render() {
        const { mode, info, item } = this.props
        switch (mode) {
            case 'expression':
                return (
                    <Select onChange={(value) => {
                        this.props.filterTriggerChange(item, mode, info, value)
                    }} placeholder="请选择触发表单字段" value={info.triggerFieldCode} style={{ width: comWidth }} >
                        {this.props.data.map(ele =>
                            <Option title={`${ele.status === -1 ? '该字段已删除!' : ''}`} className={`${ele.status === -1 ? styles.delOption : ''}`} value={ele.id}>{ele.name}</Option>)}
                    </Select>
                )
            case 'custom':
                return <ValueTypeExport mode={mode} item={item} info={info} filterValueChange={this.props.filterValueChange} />
            //return (<EditableTagGroup />)
            // return <Input onChange={e => {
            //     this.props.filterValueChange(mode, e.target.value, info.id)
            // }} style={{ width: 120 }}></Input>
            case 'none':
            default:
                return <div style={{ width: comWidth }}></div>

        }
    }
}
class GenerateFieldMap extends React.Component {
    constructor(props) {
        super(props)

        const { info, item } = this.props;
        let filterModes = [];
        if (info.controlType === "Annex" || controlGroups.includes(info.controlType)) {
            filterModes = [
                { key: 'expression', text: '触发表单字段值' },
                { key: 'none', text: '空值' },
            ]
        } else {
            filterModes = [
                { key: 'expression', text: '触发表单字段值' },
                { key: 'custom', text: '自定义' },
                { key: 'none', text: '空值' },
            ]
        }
        this.state = {
            currentMode: 'expression',
            filterModes: filterModes
        }
    }
    filterModeChange = (value, opt) => {
        this.setState({
            currentMode: value
        })
        this.props.filterModeChange && this.props.filterModeChange(this.props.item, value, this.props.info)
    }
    render() {
        const { info, templateFields, templateMapFields, item, mode } = this.props;
        let targetFields = [];
        if (info) {
            let sourceFields = mode === fieldSelectMode.condition ? templateFields : templateMapFields;
            var tagertTypes = mode === fieldSelectMode.condition ? getControlTypeCondition(info.controlType) : getControlTypeMap(info.controlType);
            tagertTypes.map(ele => {
                targetFields = targetFields.concat(_.where(sourceFields, { controlType: ele }))
            })
        }

        return (
            <div className={styles.wrap}>

                <div title={`${info.status === -1 ? '该字段已删除' : info && info.name}`} className={`${styles.fieldName} ${styles.line}  ${info.status === -1 ? styles.delOption : ''}`} >
                    <Icon className={styles.fieldIcon} type="font-size" /> {info && info.name}
                </div>
                <div className={`${styles.condition} ${styles.line}`}>
                    {this.props.conditionText}
                </div>
                <div className={`${styles.line}`}>
                    <Select value={info.modeType} onChange={this.filterModeChange} style={{ width: 140 }}>
                        {this.state.filterModes.map(ele =>
                            <Option value={ele.key}>{ele.text}</Option>)}
                    </Select>
                </div>
                <div className={`${styles.line}`}>
                    <ValueExport mode={info.modeType}
                        filterValueChange={this.props.filterValueChange}
                        info={info} item={item} filterTriggerChange={this.props.filterTriggerChange} data={targetFields} />
                </div>
                {
                    this.props.calDel &&
                    <div onClick={e => { this.props.FilterDelete(item, info) }} className={`${styles.del} ${styles.line}`}>
                        <Icon type="delete"></Icon>
                    </div>
                }

            </div>)
    }
}

export default GenerateFieldMap;
