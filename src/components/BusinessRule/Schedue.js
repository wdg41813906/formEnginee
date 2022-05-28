
import { Collapse, Icon, Select, Menu, Dropdown, Tooltip } from 'antd';
import GenerateFieldMap from './FieldMap/GenerateFieldMap'
import Modify from './Mode/Modify';
import Add from './Mode/Add';
import Delete from './Mode/Delete';
import ModifyOrAdd from './Mode/ModifyOrAdd'
import FormSelect from './FormSelect/FormSelect'
import { formInit, controlGroups, ToExprssionTypeLinkMainForm, ToExprssionTypeTargetForm } from '../../utils/businessRuleConfig'
import _ from 'underscore';
import styles from './Schedue.less'
import com from '../../utils/com'
const { Panel } = Collapse;
const { Option } = Select;

const customPanelStyle = {
    background: '#fafafa',
    borderRadius: 4,
    marginBottom: 24,
    border: 0,
    overflow: 'hidden',
};
function ToDelItem(list) {
    var newList = [];
    if (list instanceof Array) {
        newList = list.filter(ele => {
            if (ele.operationStatus === 3) {
                ele.operationStatus = 0
                return ele
            }
        })
    }
    return newList;
}

const genExtra = (onDelschedueList, item) => (
    <Icon
        className={styles.del}
        type="delete"
        onClick={event => {

            onDelschedueList instanceof Function && onDelschedueList(item)
            event.stopPropagation();
        }}
    />
);
const SwichMode = ({ templateFields, templateMapFields, item,
    fieldChange, mapFieldChange, filterModeChange, onDelFilterConditions,
    filterValueChange, filterTriggerChange, mapModeChange,
    mapValueChange, mapTriggerChange, onDelFieldMapings,
    newMapTriggerChange, newMapValueChange, newMapModeChange }) => {
    //  item.filterConditions=item.filterConditions.filter(e=>{return e.operationStatus!==0})
    //  item.fieldMapings=item.fieldMapings.filter(e=>{return e.operationStatus!==0})

    const props = {
        item: item,
        templateFields: templateFields,
        templateMapFields: templateMapFields,
        fieldChange: fieldChange,
        onDelFilterConditions: onDelFilterConditions,
        mapFieldChange: mapFieldChange,
        filterModeChange: filterModeChange,
        filterValueChange: filterValueChange,
        filterTriggerChange: filterTriggerChange,
        mapModeChange: mapModeChange,
        mapValueChange: mapValueChange,
        mapTriggerChange: mapTriggerChange,
        onDelFieldMapings: onDelFieldMapings,
        newMapTriggerChange: newMapTriggerChange,
        newMapValueChange: newMapValueChange,
        newMapModeChange: newMapModeChange
    }
    switch (item.type) {
        case 'add':
            return <Add  {...props} />
        case 'modify':
            return <Modify
                {...props}
            // templateFields={templateFields}
            // item={item}
            // fieldChange={fieldChange}
            // onDelFilterConditions={onDelFilterConditions}
            // mapFieldChange={mapFieldChange}
            // filterModeChange={filterModeChange}
            // filterValueChange={filterValueChange}
            // filterTriggerChange={filterTriggerChange}
            // mapModeChange={mapModeChange}
            // mapValueChange={mapValueChange}
            // mapTriggerChange={mapTriggerChange}
            // onDelFieldMapings={onDelFieldMapings}
            />
        case 'delete':
            return <Delete  {...props} />
        case 'modifyOrAdd':
            return <ModifyOrAdd  {...props} />
        default:
            return <div></div>
    }
}
class Schedue extends React.Component {

    constructor(props) {
        super(props);
        let formList = window.localStorage.getItem('formList')
        let json = JSON.parse(formList);
        this.state = {
            targetFormTempaltes: json ? json.linkFormList : [],
            // targetForms: []
            // schedueList: [
            //     { mode: 'add', title: '新增数据' },
            //     { mode: 'modify', title: '修改已有数据' },
            //     { mode: 'delete', title: '删除已有数据' },
            //     { mode: 'modifyOrAdd', title: '修改或新增数据' }
            // ]
        }
    }
    componentDidMount() {

    }
    // formInit(templateId) {
    //     var formtemplate = _.where(this.state.targetFormTempaltes,
    //         { formTemplateId: templateId })[0];
    //     var filterFields = formtemplate.fields.filter(e => { return e.formControlType !== 1 && e.valueType })
    //     var formGroup = _.groupBy(filterFields, 'formCode');
    //     let forms = []
    //     for (let form in formGroup) {
    //         var formitem = _.where(formtemplate.fields, { formCode: form })[0]
    //         if (formitem.formType === 0) {
    //             forms.push({
    //                 name: formtemplate.name,
    //                 formId: formitem.formId,
    //                 table: formitem.formCode,
    //                 fields: formGroup[form]
    //             })
    //         } else if (formitem.formType === 1) {

    //             forms.push({
    //                 name: formitem.name.replace(/\.\S*/g, ''),
    //                 formId: formitem.formId,
    //                 table: formitem.formCode,
    //                 fields: formGroup[form]
    //             })
    //         }
    //     }
    //     return forms;
    // }
    formtemplateChange = (item, value) => {

        // var formtemplate = _.where(this.state.targetFormTempaltes, { formTemplateId: value })[0];
        var formtemplate = _.where(this.props.formTemplateWithFields, { formTemplateId: value })[0];
        var forms = formInit(formtemplate)
        // this.setState({
        //     targetForms: forms
        // })
        item.filterConditions = ToDelItem(item.filterConditions);
        item.fieldMapings = ToDelItem(item.fieldMapings);
        item.newfieldMapings = ToDelItem(item.newfieldMapings);
        this.props.onModifySchedueList(item, {
            formTemplateId: value,
            targetForms: forms,
            formId: "",
            form: "",
            formType: "",
            fields: [],
            mapFields: [],
            filterConditions: [],
            fieldMapings: [],
            newfieldMapings: item.newfieldMapings
        })
    }
    destinationFormChange = (item, value) => {
        var form = _.where(item.targetForms,
            { table: value })[0];
        let filterFields = [];
        filterFields = ToExprssionTypeTargetForm(form.fields);

        let filterConditions = ToDelItem(item.filterConditions);
        let fieldMapings = ToDelItem(item.fieldMapings);
        let newfieldMapings = ToDelItem(item.newfieldMapings);
        if (item.type === 'add' || item.type === 'modifyOrAdd') {
            //如果是子表单，获取其主表字段
            if (form.formType === 1) {
                let mainForm = _.where(item.targetForms, { formType: 0 })[0];
                let mainFormFields = ToExprssionTypeLinkMainForm(mainForm.fields)
                filterFields = filterFields.concat(mainFormFields)
            }

            form.mapFields.map(ele => {
                var newELe = this.toMapField(ele)
                newELe.type = 0;
                // this.props.mode=='add':
                newELe.operationStatus = 1;
                newfieldMapings.push(newELe)
            })
            //2019-09-04新增一行默认主键
            if (form.mapFields.length >= 0) {
                let eleMap = {};
                let mapFirst = form.mapFields[0];
                if (controlGroups.includes(mapFirst.controlType)) {
                    for (let key in mapFirst.groupItems) {
                        eleMap = mapFirst.groupItems[key];
                    }
                } else {
                    eleMap = form.mapFields[0];
                }
                eleMap = {
                    ...eleMap,
                    ...{
                        id: com.Guid(), name: "主键", type: 0, operationStatus: 1,
                        code: eleMap.primaryKey
                    }
                }
                var newEle = this.toMapField(eleMap)
                newEle.type = 0;
                newEle.operationStatus = 1;
                newEle.modeType = "primaryKey";
                newEle.sourceGroupItems = "";
                newEle.value = "null";
                newfieldMapings.push(newEle)
            }



        }
        let operationStatus = item.operationStatus === 3 ? 2 : 1;

        this.props.onModifySchedueList(item, {
            formId: form.formId,
            formType: form.formType,
            form: form.table,
            fields: filterFields,
            mapFields: form.mapFields,
            filterConditions: filterConditions,
            fieldMapings: fieldMapings,
            newfieldMapings: newfieldMapings,
            operationStatus
        })
    }
    onAddFilterConditions = (item, ele) => {

        var filterConditions = item.filterConditions ? item.filterConditions : [];
        filterConditions.push(ele);
        this.props.onModifySchedueList(item, { filterConditions: filterConditions })
    }
    onModifyFilterConditions = (item, obj, configKey) => {
        var filterConditions = item.filterConditions;
        var newFilterConditions = []
        filterConditions.map(e => {
            if (e.configKey === configKey) {
                newFilterConditions.push({ ...e, ...obj })
            } else {
                newFilterConditions.push(e)
            }
        })
        this.props.onModifySchedueList(item, { filterConditions: newFilterConditions })
    }
    onDelFilterConditions = (item, info) => {
        var filterConditions = item.filterConditions;
        debugger
        var newFilterConditions = []
        if (this.props.mode === 'add') {
            newFilterConditions = filterConditions.filter(e => {
                return e.id !== info.id
            })
        } else {
            filterConditions.map(e => {
                if (e.id === info.id) {
                    if (e.operationStatus !== 1) {
                        e.operationStatus = 0;
                        newFilterConditions.push(e);
                    }
                } else {
                    newFilterConditions.push(e);
                }
            })
        }
        this.props.onModifySchedueFields(item, info, false);
        this.props.onModifySchedueList(item, { filterConditions: newFilterConditions })
    }
    onAddFieldMapings = (item, ele) => {

        var fieldMapings = item.fieldMapings ? item.fieldMapings : [];
        fieldMapings.push(ele);
        this.props.onModifySchedueList(item, { fieldMapings: fieldMapings })
    }
    onModifyFieldMapings = (item, obj, assignKey) => {
        var fieldMapings = item.fieldMapings;
        var newFieldMapings = []
        fieldMapings.map(e => {
            if (e.assignKey === assignKey) {
                newFieldMapings.push({ ...e, ...obj })
            } else {
                newFieldMapings.push(e)
            }
        })
        this.props.onModifySchedueList(item, { fieldMapings: newFieldMapings })
    }
    onDelFieldMapings = (item, info) => {
        debugger
        var fieldMapings = item.fieldMapings;
        var newFieldMapings = []
        if (this.props.mode === 'add') {
            newFieldMapings = fieldMapings.filter(e => {
                return e.id !== info.id
            })
        } else {
            fieldMapings.map(e => {
                if (e.id === info.id) {
                    if (e.operationStatus !== 1) {
                        e.operationStatus = 0;
                        newFieldMapings.push(e)
                    }
                } else {
                    newFieldMapings.push(e)
                }
            })
        }
        this.props.onModifySchedueMapFields(item, info, false);
        this.props.onModifySchedueList(item, { fieldMapings: newFieldMapings })
    }


    onAddNewFieldMapings = (item, ele) => {

        var newfieldMapings = item.newfieldMapings ? item.newfieldMapings : [];
        newfieldMapings.push(ele);
        this.props.onModifySchedueList(item, { newfieldMapings: newfieldMapings })
    }
    onModifyNewFieldMapings = (item, obj, id) => {
        var newfieldMapings = item.newfieldMapings;
        var newNewfieldMapings = []
        newfieldMapings.map(e => {
            if (e.id === id) {
                newNewfieldMapings.push({ ...e, ...obj })
            } else {
                newNewfieldMapings.push(e)
            }
        })
        this.props.onModifySchedueList(item, { newfieldMapings: newNewfieldMapings })
    }

    /**
     *
     * @param {*} 组件内部
     */
    toMapField = (ele) => {
        var groupItems = ele.groupItems;
        if (groupItems) {
            for (let key in groupItems) {
                groupItems[key].assignKey = com.Guid();
            }
        }
        return {
            valueType: ele.valueType,
            controlType: ele.controlType,
            formCode: ele.formCode,
            targetGroupItems: groupItems,
            code: ele.code,
            id: ele.id,//com.Guid(),
            assignKey: com.Guid(),
            formItemId: ele.id,
            name: ele.name,
            modeType: 'expression',
            expressionType: 1,
            property: ele.property,
            status: ele.status,
            operator: '=', linkOperator: '0', formItem: ele.code, formId: ele.formId
        }
    }

    fieldChange = (item, ele) => {
        this.props.onModifySchedueFields(item, ele, true);
        var groupItems = ele.groupItems;
        if (groupItems) {
            for (let key in groupItems) {
                groupItems[key].configKey = com.Guid();
            }
        }
        this.onAddFilterConditions(item, {
            property: ele.property,
            status: ele.status,
            valueType: ele.valueType,
            controlType: ele.controlType,
            formCode: ele.formCode,
            code: ele.code,
            targetGroupItems: groupItems,
            id: ele.id,// com.Guid(),
            configKey: com.Guid(),
            formItemId: ele.id,
            name: ele.name,
            modeType: 'expression',
            expressionType: ele.expressionType ? ele.expressionType : 1,//1,
            operationStatus: 1,
            operator: '=', linkOperator: '0', formItem: ele.code, formId: ele.formId
        })
    }
    mapFieldChange = (item, ele) => {
        this.props.onModifySchedueMapFields(item, ele, true);
        var newELe = this.toMapField(ele)
        newELe.operationStatus = 1;
        newELe.type = 1;
        this.onAddFieldMapings(item, newELe)
    }
    filterModeChange = (item, mode, info) => {
        let express = "";
        let valueOfCom = '';
        if (mode === 'none') {
            express = '{0} is null'
        }
        else if (mode === 'custom' && info.valueType === 'boolean') {
            express = `{0}=0`
            valueOfCom = false;
        }
        let operationStatus = 1;
        if (info.operationStatus !== 1 && info.operationStatus !== 0) { operationStatus = 2 }
        this.onModifyFilterConditions(item, { modeType: mode, expression: express, value: valueOfCom, valueOfCom: valueOfCom, operationStatus: operationStatus }, info.configKey)
    }
    filterValueChange = (item, mode, value, info) => {
        let express = '';
        let valueOfCom = '';
        if (mode === 'array') {
            let inCon = '';
            value.map(e => {
                if (!inCon) { inCon = `'${e}'`; valueOfCom = `${e}` }
                else { inCon += `,'${e}'`; valueOfCom += `,${e}` }
            })
            express = `{0} in(${inCon})`
        } else if (mode === 'boolean') {
            express = `{0}=${value === true ? 1 : 0}`
            valueOfCom = value;
        }
        else {
            if (!(value === '' || value === null || value === undefined || value === 'undefined')) {
                express = `{0}='${value}'`
                valueOfCom = value;
            }
        }
        let operationStatus = 1;
        if (info.operationStatus !== 1) { operationStatus = 2 }
        this.onModifyFilterConditions(item, { expression: express, value: valueOfCom, valueOfCom: valueOfCom, operationStatus: operationStatus }, info.configKey)
    }
    filterTriggerChange = (item, mode, info, id) => {
        debugger
        var field = _.where(this.props.templateFields, { id: id })[0]

        let express = '';
        //  express = `{0} = ${info.formCode}.${fieldcode}`;
        let operationStatus = 1;
        if (! field.groupItems) {
            express = `{0} = ${field.formCode}.${field.code}`;
        }
        if (info.operationStatus !== 1) { operationStatus = 2 }
        this.onModifyFilterConditions(item, {
            expression: express,
            //formCode: field.formCode,
            //code: field.code,

            targetGroupItems: info.targetGroupItems,
            sourceGroupItems: field.groupItems,
            triggerFieldCode: id,
            operationStatus: operationStatus
        }, info.configKey)
    }

    mapModeChange = (item, mode, info) => {
        let express = "";
        let valueOfCom = '';
        if (mode === 'none') {
            express = 'null'
        }
        else if (mode === 'custom' && info.valueType === 'boolean') {
            express = `0`
            valueOfCom = false;
        }
        let operationStatus = 1;
        if (info.operationStatus !== 1 && info.operationStatus !== 0) { operationStatus = 2 }
        this.onModifyFieldMapings(item, { modeType: mode, value: express, valueOfCom: valueOfCom, operationStatus: operationStatus }, info.assignKey)
    }
    mapValueChange = (item, mode, value, info) => {
        let express = '';
        let valueOfCom = '';
        express = value;
        if (mode === 'array') {
            value.map(e => {
                if (!valueOfCom) { valueOfCom = `${e}` }
                else { valueOfCom += `,${e}` }
            })
        }

        else if (mode === 'boolean') {
            express = `${value === true ? 1 : 0}`
            valueOfCom = value;
        }
        else {

            valueOfCom = value
        }
        let operationStatus = 1;
        if (info.operationStatus !== 1) { operationStatus = 2 }
        this.onModifyFieldMapings(item, { value: express, valueOfCom: valueOfCom, operationStatus: operationStatus }, info.assignKey)
    }
    mapTriggerChange = (item, mode, info, id) => {
        let express = '';
        var field = _.where(this.props.templateMapFields, { id: id })[0]
        // express = `{0} = ${info.formCode}.${code}`;
        if (!info.targetGroupItems) {
            express = `${field.formCode}.${field.code}`;
        }
        let operationStatus = 1;

        if (info.operationStatus !== 1) { operationStatus = 2 }
        this.onModifyFieldMapings(item, {
            value: express,
            targetGroupItems: info.targetGroupItems,
            sourceGroupItems: field.groupItems,
            // formCode: field.formCode,
            // code: field.code,
            triggerFieldCode: id,
            operationStatus: operationStatus
        }, info.assignKey)
    }


    newMapModeChange = (item, mode, info) => {
        let express = "";
        let valueOfCom = '';
        if (mode === 'none') {
            express = 'null'
        }
        else if (mode === 'custom' && info.valueType === 'boolean') {
            express = `0`
            valueOfCom = false;
        }
        let operationStatus = 1;
        if (info.operationStatus !== 1) { operationStatus = 2 }
        this.onModifyNewFieldMapings(item, { modeType: mode, value: express, valueOfCom: valueOfCom, operationStatus: operationStatus }, info.id)
    }
    newMapValueChange = (item, mode, value, info) => {
        let express = '';
        let valueOfCom = '';
        express = value
        if (mode === 'array') {
            value.map(e => {
                if (!valueOfCom) { valueOfCom = `${e}` }
                else { valueOfCom += `,${e}` }
            })
        } else if (mode === 'boolean') {
            express = `${value === true ? 1 : 0}`
            valueOfCom = value;
        }
        else {

            valueOfCom = value
        }
        let operationStatus = 1;
        if (info.operationStatus !== 1) { operationStatus = 2 }
        this.onModifyNewFieldMapings(item, { value: express, valueOfCom: valueOfCom, operationStatus: operationStatus }, info.id)
    }

    newMapTriggerChange = (item, mode, info, id) => {
        let express = '';
        var field = _.where(this.props.templateMapFields, { id: id })[0]
        //express= `{0} = ${info.formCode}.${code}`;
        let operationStatus = 1;
        if (!info.targetGroupItems) {
            express = `${field.formCode}.${field.code}`;
        }
        if (info.operationStatus !== 1) { operationStatus = 2 }
        let targetGroupItem = info.targetGroupItems;

        this.onModifyNewFieldMapings(item, {
            value: express,
            targetGroupItems: targetGroupItem,
            sourceGroupItems: field.groupItems,
            //formCode: field.formCode,
            //  code: field.code,
            triggerFieldCode: id,
            operationStatus: operationStatus
        }, info.id)
    }


    /**
     *
     * @param {*} 组件内部结束
     */

    onSearch(val) {
    
    }
    render() {
        const { mode, schedueList, templateFields, templateMapFields, form, pushType } = this.props;

        debugger
        return (<div style={{ width: '100%' }}><Collapse
            accordion
            bordered={false}
            style={{ width: '100%' }}
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
        >

            {
                schedueList.map(item => {
                    if (item.operationStatus !== 0) {
                        return <Panel header={item.title} key={`${item.key}`} style={customPanelStyle}
                            extra={genExtra(this.props.onDelschedueList, item)}>
                            <div className={styles.schContent}>
                                <div className={styles.itemWrap}>
                                    <p className={styles.schTitle}>目标表单
                  <Tooltip title="目标表单是您想要通过业务规则自动新增、修改、删除数据的表单"><Icon className={styles.ques} type="question-circle" /> </Tooltip>
                                    </p>
                                    <div style={{ display: 'flex', paddingLeft: '10px' }}>
                                        <FormSelect
                                            loading={this.props.formTemplateComLoading}
                                            pagination={this.props.formTempatePagination}
                                            dataSource={this.props.formTemplateWithFields}
                                            value={item.formTemplateId}
                                            onChange={(value, ele) => { this.formtemplateChange(item, value) }}
                                            loadData={this.props.getFormTemplateWithFieldPaged} />
                                        {/* <Select showSearch value={item.formTemplateId} onSearch={this.onSearch}
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        onChange={(value, ele) => { this.formtemplateChange(item, value) }} style={{ width: 220 }}>
                                        {this.state.targetFormTempaltes.map(ele =>
                                            <Option key={ele.formTemplateId} value={ele.formTemplateId}>{ele.name}</Option>)}
                                    </Select> */}

                                        <Select value={item.form}
                                            onChange={(value, ele) => { this.destinationFormChange(item, value) }} style={{ width: 220, marginLeft: 15 }}>
                                            {item.targetForms && item.targetForms.map(ele =>
                                                <Option
                                                    disabled={(form.formType === 1 && (item.type === "add" || item.type === 'modifyOrAdd')
                                                        && ele.formType === 1)
                                                        || (form.formtemplateId === ele.formtemplateId &&
                                                            form.formType === 0 && ele.formType === 1

                                                            && (item.type === "add" || item.type === 'modifyOrAdd')
                                                            && pushType === "delete"

                                                        )
                                                    } key={ele.table} value={ele.table}>{ele.name}</Option>)}
                                        </Select>
                                    </div>
                                </div>
                                {
                                    (item.fields && item.fields.length > 0)
                                    && <SwichMode
                                        item={item}
                                        templateFields={templateFields}
                                        templateMapFields={templateMapFields}
                                        fieldChange={this.fieldChange}
                                        mapFieldChange={this.mapFieldChange}
                                        filterModeChange={this.filterModeChange}
                                        filterValueChange={this.filterValueChange}
                                        filterTriggerChange={this.filterTriggerChange}
                                        onDelFilterConditions={this.onDelFilterConditions}
                                        mapModeChange={this.mapModeChange}
                                        mapValueChange={this.mapValueChange}
                                        mapTriggerChange={this.mapTriggerChange}
                                        onDelFieldMapings={this.onDelFieldMapings}
                                        newMapModeChange={this.newMapModeChange}
                                        newMapValueChange={this.newMapValueChange}
                                        newMapTriggerChange={this.newMapTriggerChange}

                                    />
                                }


                            </div>
                        </Panel>
                    }
                }
                )
            }

        </Collapse></div>
        )
    }
}

export default Schedue;
