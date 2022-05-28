import React from "react";
import {
    Select,
    Checkbox,
    Tooltip,
    Button,
    Modal,
    Card,
    Icon,
    Radio,
    Input,
    message,
    InputNumber,
    DatePicker
} from "antd";
import Attribute from "./Attribute.js";
import styles from "./RelationTable.less";
import { LINKTYPE, getValueConditionMap, initLinker } from "../DataLinker/DataLinker";
import com from "../../../utils/com";
import _ from "underscore";
import FORM_CONTROL_TYPE from "../../../enums/FormControlType.js";
import DataLinkerResourceModal from "../DataLinker/DataLinkerResourceModal.js";
import { getAllFormLinkData, getAllFormTemplatePaged } from "../../../services/FormBuilder/FormBuilder";
import { initControlExtra, buildLinkFormList } from "commonForm";
import { environmentList } from "../../../enums/EnvironmentType.js";

const controlExtraList = ["dropCount", "valueType", "dropItemValueTypes", "formControlType", "event"];

const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
let timeout;

@Attribute("关联表")
class RelationTable extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <Select showSearch loading={this.props.showLoad}
                    value={this.props.formTemplateList.length > 0 ? this.props.relationTableId : null}
                    style={{ width: "100%" }}
                    optionFilterProp="children"
                    maxTagCount={4}
                    onFocus={this.props.formTemplateList.length > 1 ? null : () => this.props.InitFormList()}
                    onSearch={this.props.SearchForm}
                    onChange={this.props.setRelationTable}
                    onPopupScroll={this.props.handleInfiniteOnLoad}>
                {
                    this.props.formTemplateList.length > 0 ? this.props.formTemplateList.map(e => {
                        return <Option key={e.id} value={e.id} title={e.name}>{e.name}</Option>;
                    }) : null
                }
            </Select>
        );
    }
}

@Attribute("关联字段")
class RelationColumn extends React.PureComponent {
    constructor(props) {
        super(props);
        this.setRelationColumns = this.setRelationColumns.bind(this);
    }
    
    saveCondition(relationColumns) {
        let {
            relationTableId, linkFormDetail, formTemplateList, setDataLinker, expressionType,
            autoFill, persisted, conditionList
        } = this.props;
        let code = formTemplateList.find(a => a.id === relationTableId).table;
        let foreignKeys = [], relations = [], condition = [], fields = [], display = [];
        conditionList = conditionList || [];
        relationColumns.forEach(col => {
            let exist = linkFormDetail.find(a => a.id === col.id);
            if (!exist.groupItems) {
                let { primaryKey, id, code, formType, formId, formCode, mainFormId, mainFormName, primaryKeyId } = exist;
                foreignKeys.push({
                    // FormId: rootFormId,//当前表表单Id，A
                    // FormName: rootFormName,//当前表单名称,A
                    //formVersionHistoryId,//表单版本历史Id
                    currentColumnName: "",
                    foreignFormId: mainFormId,//外键表单Id,B
                    foreignFormName: mainFormName,//B
                    foreignHistoryId: primaryKeyId,//外键表单版本历史Id
                    foreignColumnName: primaryKey,
                    
                    displayFormId: formId,//C,若没有，则和B相同
                    displayFormName: formCode,//C
                    displayVersionHistoryId: col.id,//显示字段Id
                    displayName: code,
                    
                    description: "",//this.props.self.id,
                    id: col.formForeignKeyId
                });
                fields.push({
                    id,
                    formId,
                    field: code,
                    formType,
                    primaryKey
                });
            }
        });
        conditionList.forEach(item => {
            if (relations.indexOf(item.targetId) < 0)
                relations.push(item.targetId);
        });
        
        let cGroups = _.groupBy(conditionList, a => a.formId);
        Object.keys(cGroups).forEach(formId => {
            let { formType, primaryKey } = cGroups[formId][0];
            let where = cGroups[formId].map(item => {
                let { formType, primaryKey, ...other } = item;
                return other;
            });
            condition.push({
                formType,
                primaryKey,
                where
            });
        });
        let fGroups = _.groupBy(fields, a => a.formId);
        Object.keys(fGroups).forEach(formId => {
            let { formType, primaryKey } = fGroups[formId][0];
            display.push({
                primaryKey,
                formType,
                list: fGroups[formId].map(item => {
                    return { id: item.id, field: item.field };
                })
            });
        });
        let expression = [{
            source: code,
            condition,
            display,
            type: expressionType ? expressionType : null
        }];
        setDataLinker({
            foreignKeys,
            expression,
            linkType: LINKTYPE.External,
            autoFill,
            persisted,
            relations
        });
    }
    
    setRelationColumns(e) {
        let current = this.props.relationColumns;
        let currentGroupItems = [];
        let currentGroup = [];
        e.forEach(a => {
            let item = this.props.linkFormDetail.find(b => b.id === a);
            if (item.formControlType === FORM_CONTROL_TYPE.Group) {
                for (let gItem in item.groupItems) {
                    currentGroupItems.push(item.groupItems[gItem].id);
                }
                currentGroup.push(item.id);
            }
        });
        e = e.concat(currentGroupItems);
        let addCols = e.filter(a => !current.some(b => b.id === a));
        let removCols = current.filter(a => !e.includes(a.id)).map(a => a.id);
        let removGroupItems = [];
        removCols.forEach(a => {
            let item = this.props.linkFormDetail.find(b => b.id === a);
            if (item.formControlType === FORM_CONTROL_TYPE.Group) {
                for (let gItem in item.groupItems) {
                    removGroupItems.push(item.groupItems[gItem].id);
                }
            }
        });
        let relationColumns = [];
        e.forEach(a => {
            let item = this.props.linkFormDetail.find(b => b.id === a);
            let exist = current.find(b => b.id === a);
            if (exist)
                relationColumns.push(exist);
            else {
                let rItem = { id: a };
                if (item.formControlType !== FORM_CONTROL_TYPE.Group)
                    rItem.formForeignKeyId = com.Guid();
                relationColumns.push(rItem);
            }
        });
        this.props.onChange({ relationColumns });
        this.props.delExFormItemBatch(removCols.filter(a => !removGroupItems.includes(a)));
        let t = this;
        let finalAddCols = [];
        addCols.forEach(col => {
            const item = this.props.linkFormDetail.find(a => a.id === col);
            let exItem = {
                id: com.Guid(),
                name: item.name,
                externalId: col,
                itemType: item.controlType,
                container: this.props.id,
                formType: item.formType,
                exContainerId: item.primaryKey,
                noMappad: this.props.noMappad === true
            };
            if (item.formControlType === FORM_CONTROL_TYPE.Group) {
                exItem.groupItems = item.groupItems;
                for (let key in item.groupItems) {
                    if (item.groupItems[key].primaryKey) {
                        exItem.primaryKey = item.groupItems[key].primaryKey;
                        break;
                    }
                }
            }
            if (item.formControlType !== FORM_CONTROL_TYPE.Group)
                finalAddCols.push(col);
            if (!currentGroupItems.includes(col)) {
                t.props.addEx(exItem);
            }
        });
        this.saveCondition(current.filter(a => !removCols.includes(a.id) && !currentGroup.includes(a.id)).concat(finalAddCols.map(b => ({
            id: b,
            formForeignKeyId: com.Guid()
        }))));
    }
    
    render() {
        let linkFormDetail = this.props.linkFormDetail.filter(a => a.formType === 0 && a.groupItem !== true && a.valueType !== undefined);
        return <div className={styles.relChkList}>
            <CheckboxGroup style={{ width: "100%" }} value={(this.props.relationColumns || []).map(a => a.id)}
                           onChange={this.setRelationColumns}>
                {
                    linkFormDetail.map(item => {
                        return <div key={item.id}><Tooltip title={item.name} mouseEnterDelay={1}><Checkbox
                            className={styles.relChk} value={item.id}>{item.name}{Number(item.status) === -1 ?
                            <Tooltip placement="top" title='字段已删除'>
                                <Icon style={{ color: "#FF122D", paddingLeft: "12px" }} type="exclamation-circle"/>
                            </Tooltip> : null}</Checkbox></Tooltip></div>;
                    })
                }
            </CheckboxGroup>
        </div>;
    }
}

@Attribute("查询字段")
class RelationFilterFields extends React.PureComponent {
    setFilterFields = (list) => {
        let relationFilterFields = this.props.linkFormDetail.filter(a => list.includes(a.id)).map(a => {
            let obj = {
                id: a.id,
                key: a.id,
                dataIndex: a.id,
                name: a.name,
                title: a.name,
                controlType: a.controlType,
                formCode: a.formCode,
                formType: a.formType,
                valueType: a.valueType,
                isGroup: a.formControlType === FORM_CONTROL_TYPE.Group
            };
            if (a.formControlType === FORM_CONTROL_TYPE.Group)
                obj.groupItems = a.groupItems;
            else {
                obj.code = a.code;
            }
            return obj;
        });
        this.props.onChange({ relationFilterFields });
    };
    
    render() {
        //let relationColumns = (this.props.relationColumns || []).map(a => a.id);
        debugger;
        let linkFormDetail = this.props.linkFormDetail.filter(a => a.formType === 0 && a.controlType !== "None" && a.valueType !== undefined /*&& relationColumns.includes(a.id)*/);
        return <div className={styles.relChkList}>
            <CheckboxGroup style={{ width: "100%" }}
                           value={Array.isArray(this.props.relationFilterFields) ? this.props.relationFilterFields.map(a => a.id) : []}
                           onChange={this.setFilterFields}>
                {
                    linkFormDetail.map(item => {
                        return <div key={item.id}><Tooltip title={item.name} mouseEnterDelay={1}><Checkbox
                            className={styles.relChk} value={item.id}>{item.name}{Number(item.status) === -1 ?
                            <Tooltip placement="top" title='字段已删除'>
                                <Icon style={{ color: "#FF122D", paddingLeft: "12px" }} type="exclamation-circle"/>
                            </Tooltip> : null}</Checkbox></Tooltip></div>;
                    })
                }
            </CheckboxGroup>
        </div>;
    }
}

@Attribute("关联条件")
export class RelatedCondition extends React.PureComponent {
    constructor(props) {
        super(props);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.addCondition = this.addCondition.bind(this);
        this.removeCondition = this.removeCondition.bind(this);
        this.saveCondition = this.saveCondition.bind(this);
        this.setRelation = this.setRelation.bind(this);
        this.setTarget = this.setTarget.bind(this);
        this.setTargetType = this.setTargetType.bind(this);
        this.setTargetValue = this.setTargetValue.bind(this);
        this.setOperationType = this.setOperationType.bind(this);
        this.state = {
            id: props.id, showModal: false,
            conditionList: props.conditionList || [], update: false,
            freshFlag: props.freshFlag
        };
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.id != nextProps.id) {
            return { conditionList: nextProps.conditionList || [], id: nextProps.id };
        }
        else if (nextProps.freshFlag !== prevState.freshFlag) {
            return { conditionList: nextProps.conditionList || [], freshFlag: nextProps.freshFlag };
        }
        return null;
    }
    
    show() {
        this.props.buildFormDataFilter("relation");
        this.setState({ showModal: true });
    }
    
    hide() {
        this.setState({ showModal: false });
    }
    
    setRelation(index, relationId) {
        let conditionList = this.state.conditionList;
        if (index < 0 || conditionList.length - 1 < index) {
            conditionList.push({ relationId, targetId: undefined });
        }
        else {
            conditionList[index].relationId = relationId;
            let { code: field, formType, primaryKey, formId, formCode } = this.props.linkFormDetail.find(a => a.id == relationId);
            conditionList[index] = {
                ...conditionList[index],
                formCode,
                field,
                formType,
                primaryKey,
                formId,
                targetId: undefined
            };
        }
        this.setState({ conditionList, update: !this.state.update });
    }
    
    setTargetType(index, targetType) {
        let conditionList = this.state.conditionList;
        conditionList[index].targetType = targetType;
        delete conditionList[index].targetId;
        delete conditionList[index].targetValue;
        this.setState({ conditionList, update: !this.state.update });
    }
    
    setOperationType(index, operationType) {
        let conditionList = this.state.conditionList;
        conditionList[index].operationType = operationType;
        this.setState({ conditionList, update: !this.state.update });
    }
    
    setTargetValue(index, targetValue) {
        let conditionList = this.state.conditionList;
        conditionList[index].targetValue = targetValue;
        this.setState({ conditionList, update: !this.state.update });
    }
    
    setTarget(index, targetId) {
        let conditionList = this.state.conditionList;
        if (index < 0 || conditionList.length - 1 < index) {
            conditionList.push({ relationId: undefined, targetId });
        }
        else {
            conditionList[index].targetId = targetId;
            // conditionList[index].field = "";
            // conditionList[index].formType = "";
            // conditionList[index].primaryKey = "";
            // conditionList[index].formId = "";
            //conditionList[index].relationId = undefined;
        }
        this.setState({ conditionList, update: !this.state.update });
    }
    
    addCondition() {
        let conditionList = this.state.conditionList;
        conditionList.push({
            targetId: undefined,
            relationId: undefined,
            field: null,
            formType: null,
            primaryKey: null
        });
        this.setState({ conditionList, update: !this.state.update });
    }
    
    removeCondition(index) {
        let conditionList = this.state.conditionList;
        if (index >= 0 || conditionList.length > index) {
            conditionList.splice(index, 1);
        }
        this.setState({ conditionList, update: !this.state.update });
    }
    
    saveCondition() {
        let {
            relationTableId, linkFormDetail, formTemplateList, setDataLinker, onChange,
            relationColumns, expressionType, autoFill, persisted, linkType, dataLinker
        } = this.props;
        let conditionList = this.state.conditionList.filter(a => a.relationId.trim() !== "" && a.targetType === "formItem" && a.targetId != null || a.targetType !== "formItem");
        let relations = [];
        conditionList.forEach(item => {
            if (relations.indexOf(item.targetId) < 0)
                relations.push(item.targetId);
        });
        switch (linkType) {
            case LINKTYPE.External:
                if (relationColumns.length === 0) {
                    message.error("请选择关联字段!");
                    return;
                }
                let table = formTemplateList.find(a => a.id === relationTableId).table;
                let foreignKeys = [], condition = [], fields = [], display = [];
                relationColumns.forEach(col => {
                    let exist = linkFormDetail.find(a => a.id === col.id);
                    if (!exist.groupItems) {
                        let { primaryKey, id, code, formType, formId, formCode, mainFormId, mainFormName, primaryKeyId } = exist;
                        foreignKeys.push({
                            currentColumnName: "",
                            
                            foreignFormId: mainFormId,//外键表单Id,B
                            foreignFormName: mainFormName,//B
                            foreignHistoryId: primaryKeyId,//外键表单版本历史Id
                            foreignColumnName: primaryKey,
                            
                            displayFormId: formId,//C,若没有，则和B相同
                            displayFormName: formCode,//C
                            displayVersionHistoryId: col.id,//显示字段Id
                            displayName: code,
                            
                            description: "",//this.props.self.id,
                            id: col.formForeignKeyId
                        });
                        fields.push({
                            id,
                            field: code,
                            formId,
                            formType,
                            primaryKey
                        });
                    }
                });
                let cGroups = _.groupBy(conditionList, a => a.formId);
                Object.keys(cGroups).forEach(formId => {
                    let { formType, primaryKey } = cGroups[formId][0];
                    let where = cGroups[formId].map(item => {
                        let { formType, primaryKey, ...other } = item;
                        return other;
                    });
                    condition.push({
                        formType,
                        primaryKey,
                        where
                    });
                });
                let fGroups = _.groupBy(fields, a => a.formId);
                Object.keys(fGroups).forEach(formId => {
                    let { formType, primaryKey } = fGroups[formId][0];
                    display.push({
                        primaryKey,
                        formType,
                        list: fGroups[formId].map(item => {
                            return { id: item.id, field: item.field };
                        })
                    });
                });
                let expression = [{
                    source: table,
                    condition,
                    display,
                    type: expressionType ? expressionType : null
                }];
                setDataLinker({
                    foreignKeys,
                    expression,
                    linkType,
                    autoFill,
                    persisted,
                    relations
                });
                break;
            case LINKTYPE.Resource:
                let exist = dataLinker.find(a => a.linkType === LINKTYPE.Resource);
                if (exist) {
                    exist.relations = Array.from(new Set(exist.relations.concat(relations)));
                    exist.conditions = conditionList;
                    setDataLinker(exist);
                }
                break;
            case LINKTYPE.Request:
                let exist2 = dataLinker.find(a => a.linkType === LINKTYPE.Request);
                if (exist2) {
                    exist2.relations = Array.from(new Set(exist2.relations.concat(relations)));
                    exist2.conditions = conditionList;
                    setDataLinker(exist2);
                }
                break;
        }
        onChange({ conditionList });
        this.setState({ showModal: false, conditionList });
    }
    
    render() {
        let { linkFormDetail, currentFormData, ...other } = this.props;
        let r = linkFormDetail.filter(a => ((a.groupItem === true && a.groupItemPrivate !== true && a.type !== FORM_CONTROL_TYPE.Group) || (a.groupItem !== true && a.groupItems === undefined)));
        return <React.Fragment>
            <Button onClick={this.show} style={{ width: "100%" }}>设置关联条件</Button>
            <Modal maskClosable={false} centered={true} visible={this.state.showModal}
                   onOk={this.saveCondition} width={800} closable={true}
                   onCancel={this.hide} title={<div className={styles.ModalTitle}>
                <div>关联条件设置</div>
                <Button onClick={this.addCondition} size='small' type="primary" icon='plus'>添加</Button></div>}>
                <RelatedSetting
                    //{...other}
                    currentFormData={currentFormData}
                    linkFormDetail={r}
                    conditionList={this.state.conditionList}
                    update={this.state.update}
                    //addCondition={this.addCondition}
                    //setCondition={this.setCondition}
                    setTargetType={this.setTargetType}
                    setOperationType={this.setOperationType}
                    setTargetValue={this.setTargetValue}
                    removeCondition={this.removeCondition}
                    setRelation={this.setRelation}
                    setTarget={this.setTarget}/>
            </Modal>
        </React.Fragment>;
    }
}

class RelatedSetting extends React.PureComponent {
    render() {
        let {
            currentFormData, linkFormDetail, removeCondition, setRelation, setTarget, conditionList,
            setTargetType, setOperationType, setTargetValue
        } = this.props;
        return <Card bodyStyle={{ height: "300px", overflow: "auto", padding: "10px", display: "block" }}>
            <p>添加关联条件用于限定关联数据显示的范围</p>
            {
                conditionList.map((a, i) => <RelatedItem key={i} index={i} currentFormData={currentFormData}
                                                         targetType={a.targetType}
                                                         setTargetType={setTargetType}
                                                         targetValue={a.targetValue}
                                                         setTargetValue={setTargetValue}
                                                         operationType={a.operationType}
                                                         setOperationType={setOperationType}
                                                         linkFormDetail={linkFormDetail}
                                                         relationId={a.relationId} targetId={a.targetId}
                                                         removeCondition={removeCondition}
                                                         setRelation={setRelation} setTarget={setTarget}/>)
            }
        </Card>;
    }
}

const relatedFilter = (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
const emptyCotent = <div className={styles.fx}></div>;
export const RelatedItem = ({
                                currentFormData, targetId, setTarget, relationId, targetType, setTargetType, operationType,
                                setOperationType, targetValue, setTargetValue, setRelation, removeCondition, linkFormDetail, index
                            }) => {
    let exist = linkFormDetail.find(a => a.id === relationId);
    let list = currentFormData;
    let conditions = [];
    let targetContent = emptyCotent;
    let opDisabled = operationType === "2" || operationType === "3";
    if (exist) {
        let valueMap = getValueConditionMap(exist.valueType);
        list = currentFormData.filter(a => valueMap.includes(a.valueType));
        conditions = com.optionObj[exist.valueType].filter(a => a.value !== "12");
        switch (targetType) {
            default:
                break;
            case "value":
                switch (exist.valueType) {
                    default:
                    case "string":
                        targetContent = <Input disabled={opDisabled} value={opDisabled ? "" : targetValue}
                                               onChange={({ target: { value } }) => setTargetValue(index, value)}
                                               placeholder='请输入自定义值'/>;
                        break;
                    case "number":
                        targetContent = <InputNumber disabled={opDisabled} value={opDisabled ? "" : targetValue}
                                                     onChange={value => setTargetValue(index, value)}
                                                     placeholder='请输入自定义值'/>;
                        break;
                    case "datetime":
                        targetContent = <DatePicker disabled={opDisabled} value={opDisabled ? "" : targetValue}
                                                    onChange={(e) => setTargetValue(index, e)} placeholder='请输入自定义值'/>;
                        break;
                }
                targetContent = <div className={styles.fx}>{targetContent}</div>;
                break;
            case "formItem":
                targetContent = <Select showSearch disabled={opDisabled} className={styles.fx} placeholder='当前表单字段'
                                        optionFilterProp="children"
                                        filterOption={relatedFilter} value={opDisabled ? "" : targetId}
                                        onChange={(e) => setTarget(index, e)}>
                    {
                        list.map(a => <Select.Option key={a.id} value={a.id} title={a.name}>{a.name}</Select.Option>)
                    }
                </Select>;
                break;
            case "environment":
                targetContent = <Select disabled={opDisabled} className={styles.fx} placeholder='环境变量'
                                        value={opDisabled ? "" : targetValue}
                                        onChange={(e) => setTargetValue(index, e)}>
                    {
                        environmentList.map(a => <Select.Option key={a.key} value={a.value}
                                                                title={a.name}>{a.name}</Select.Option>)
                    }
                </Select>;
                break;
        }
    }
    
    return <div className={styles.RelatedItem}>
        <Select className={styles.fx} showSearch placeholder='关联表单字段' optionFilterProp="children"
                filterOption={relatedFilter} value={relationId} onChange={(e) => setRelation(index, e)}>
            {
                linkFormDetail.map(a => <Select.Option key={a.id} value={a.id} title={a.name}>{a.name}</Select.Option>)
            }
        </Select>
        <Select style={{ width: "130px" }} placeholder='判断逻辑' value={operationType}
                onChange={(e) => setOperationType(index, e)}>
            {
                conditions.map(a => <Select.Option key={a.value} value={a.value}
                                                   title={a.name}>{a.name}</Select.Option>)
            }
        </Select>
        <React.Fragment>
            <Select disabled={opDisabled} style={{ width: "130px" }} placeholder='判断对象'
                    value={opDisabled ? "" : targetType} onChange={(e) => setTargetType(index, e)}>
                {
                    com.targetTypeList.map(a => <Select.Option key={a.key} value={a.key}
                                                               title={a.name}>{a.name}</Select.Option>)
                }
            </Select>
            {targetContent}
            <Icon type="delete" onClick={() => {
                removeCondition(index);
            }}/>
        </React.Fragment>
    </div>;
};

@Attribute("按钮文字")
class RelatedButton extends React.PureComponent {
    render() {
        let { relatedButtonName } = this.props;
        return <Input value={relatedButtonName}
                      onChange={e => this.props.onChange({ relatedButtonName: e.target.value })}
                      style={{ marginTop: 6 }}/>;
    }
}

@Attribute("关联类型")
class RelatedType extends React.PureComponent {
    render() {
        return <RadioGroup style={{ width: "100%", padding: "5px 0" }} value={this.props.linkType}
                           onChange={this.props.onChange}>
            {this.props.showNoneOption ? <Radio key='empty' value='empty'>无</Radio> : null}
            <Radio key={LINKTYPE.External} value={LINKTYPE.External}>本地数据</Radio>
            <Radio key={LINKTYPE.Resource} value={LINKTYPE.Resource}>第三方数据</Radio>
        </RadioGroup>;
    }
}

class Relation extends React.PureComponent {
    constructor(props) {
        super(props);
        let linkType = LINKTYPE.External;
        let dataLinker = props.dataLinker.find(a => a.linkType < 6 && a.linkType > 2);
        if (dataLinker)
            linkType = dataLinker.linkType;
        else if (!props.isSubTable)
            dataLinker = initLinker(linkType.External);
        else {
            linkType = "empty";
        }
        this.state = {
            linkType,
            dataLinker,
            showModal: false,
            isSubTable: props.isSubTable,
            //关联表属性
            FormName: "",
            pageIndex: 1,
            pageSize: 20,
            scrollLoad: true,//防止重复请求
            showLoad: false,//加载中状态
            formTemplateList: [],
            linkFormDetail: [],
            linkFormDetailResource: [],
            controlExtra: initControlExtra(controlExtraList),
            freshFlag: true
        };
    }
    
    componentDidMount() {
        if (this.props.relationTableId) {
            this.setState({
                showLoad: true
            }, () => {
                getAllFormLinkData({
                    EntityIdList: [this.props.relationTableId]
                }).then(res => {
                    let r = buildLinkFormList(res.data, this.state.controlExtra);
                    if (r.linkFormList.length > 0) {
                        this.setState({
                            linkFormDetail: r.linkFormList[0].fields,
                            formTemplateList: r.linkFormList,
                            showLoad: false
                        });
                    }
                });
            });
        }
        let exist = this.props.dataLinker.find(a => a.linkType === LINKTYPE.Resource);
        if (exist) {
            this.setState({ linkFormDetailResource: exist.resourceFields });
        }
    }
    
    setFormDetailResource = (linkFormDetailResource) => {
        this.setState({ linkFormDetailResource });
    };
    
    changeMode = (e) => {
        this.props.removeDataLinker(a => a.linkType < 6);
        let list = (this.props.relationColumns || []).map(a => a.id).concat(this.props.getPanelBody(this.props.id).filter(a => a.isExternal).map(a => a.id));
        this.props.delExFormItemBatch(list);
        //this.props.getLinkFormLDetail(null, this.props.id);
        this.props.onChange({ relationTableId: null, relationColumns: [] });
        if (e.target.value !== "empty") {
            let dataLinker = this.state.dataLinker;
            if (e.target.value === LINKTYPE.Resource && (dataLinker === undefined || dataLinker.linkType !== LINKTYPE.Resource)) {
                dataLinker = initLinker(LINKTYPE.Resource);
                this.setState({ dataLinker });
            }
            switch (e.target.value) {
                case LINKTYPE.External:
                    break;
                case LINKTYPE.Resource:
                    this.setState({ linkFormDetailResource: [] });
                    break;
            }
        }
        this.setState({ linkType: e.target.value });
        this.clearConditionList();
    };
    showModal = () => {
        this.setState({ showModal: true }, this.props.buildFormDataFilter("relation"));
    };
    hideModal = () => {
        this.setState({ showModal: false });
    };
    setRelationTable = (e) => {
        this.props.delExFormItemBatch((this.props.relationColumns || []).map(a => a.id));
        this.props.onChange({ relationTableId: e, relationColumns: [] });
        // this.props.getLinkFormLDetail(e, this.props.id);
        if (this.state.formTemplateList.length > 0) {
            let exist = this.state.formTemplateList.find(a => a.id === e);
            if (exist) {
                this.setState({
                    linkFormDetail: exist.fields
                });
            }
        }
    };
    
    clearConditionList = () => {
        this.props.onChange({ conditionList: null });
        this.setState({ freshFlag: !this.state.freshFlag });
    };
    
    InitFormList = () => {
        this.setState({
            showLoad: true
        }, () => {
            getAllFormTemplatePaged({
                FormName: this.state.FormName,
                pageIndex: this.state.pageIndex,
                pageSize: this.state.pageSize
            }).then(res => {
                let r = buildLinkFormList(res.data.formTemplateList, this.state.controlExtra);
                let { formTemplateList } = this.state;
                let { linkFormList } = r;
                let hash = {};
                let filLinkFormList = formTemplateList.concat(linkFormList).reduce((item, next) => {
                    hash[next.id] ? "" : hash[next.id] = true && item.push(next);
                    return item;
                }, []);
                this.setState({
                    formTemplateList: filLinkFormList,
                    showLoad: false
                });
            });
        });
    };
    
    //加载更多
    handleInfiniteOnLoad = (e) => {
        let scrollTop = e.target.scrollTop,//页面上卷的高度
            selectHeight = e.target.scrollHeight,//页面底部到顶部的距离
            menuHeight = e.target.clientHeight;//页面可视区域的高度
        let { formTemplateList } = this.state;
        if (scrollTop + menuHeight > selectHeight - 20) {
            if (this.state.scrollLoad) {
                this.setState({
                    pageIndex: this.state.pageIndex + 1,
                    scrollLoad: false,
                    showLoad: true
                }, () => {
                    getAllFormTemplatePaged({
                        FormName: this.state.FormName,
                        pageIndex: this.state.pageIndex,
                        pageSize: this.state.pageSize
                    }).then(res => {
                        if (res.data.formTemplateList.length > 19) {
                            let r = buildLinkFormList(res.data.formTemplateList, this.state.controlExtra);
                            let { linkFormList } = r;
                            let hash = {};
                            let filLinkFormList = formTemplateList.concat(linkFormList).reduce((item, next) => {
                                hash[next.id] ? "" : hash[next.id] = true && item.push(next);
                                return item;
                            }, []);
                            this.setState({
                                formTemplateList: filLinkFormList,
                                scrollLoad: true,
                                showLoad: false
                            });
                        } else {
                            this.setState({
                                scrollLoad: false,
                                showLoad: false
                            });
                        }
                    });
                });
            }
        }
    };
    SearchForm = value => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(() => {
            if (value.replace(/^\s+|\s+$/g, "")) {
                this.setState({
                    pageIndex: 1,
                    FormName: value
                }, () => {
                    this.InitFormList();
                });
            }
        }, 500);
    };
    
    
    render() {
        let { formTemplateList, linkType, linkFormDetail, showLoad, linkFormDetailResource } = this.state;
        let formList = formTemplateList.filter(item => item.formTemplateVersionId !== this.props.formTemplateVersionId);
        let RelationTableAttr = {
            SearchForm: this.SearchForm,
            handleInfiniteOnLoad: this.handleInfiniteOnLoad,
            InitFormList: this.InitFormList,
            setRelationTable: this.setRelationTable,
            formTemplateList: formList,
            linkFormDetail,
            showLoad
        };
        let RelationColumnAttr = {
            formTemplateList: formList,
            linkFormDetail
        };
        let RelatedConditionAttr = {
            formTemplateList: formList,
            freshFlag: this.state.freshFlag,
            linkFormDetail: linkType === LINKTYPE.External ? linkFormDetail : linkFormDetailResource
        };
        return this.props.isExternal ? null : <React.Fragment>
            <RelatedType linkType={this.state.linkType} onChange={this.changeMode}
                         showNoneOption={this.props.isSubTable === true}/>
            {
                this.props.showRelationButton ? <RelatedButton relatedButtonName={this.props.relatedButtonName}
                                                               onChange={this.props.onChange}/> : null
            }
            {
                this.state.linkType === LINKTYPE.External ?
                    <React.Fragment>
                        <RelationTable key='table' {...this.props} {...RelationTableAttr} />
                        <RelationColumn key='columns' {...this.props} {...RelationColumnAttr} />
                        <RelatedCondition key='condition' {...this.props} {...RelatedConditionAttr}
                                          linkType={this.state.linkType}/>
                        <RelationFilterFields key='filter' {...this.props} linkFormDetail={linkFormDetail}/>
                    </React.Fragment> : null
            }
            {
                this.state.linkType === LINKTYPE.Resource ?
                    <React.Fragment>
                        <Button style={{ width: "100%", marginTop: 10 }} onClick={this.showModal}>关联第三方数据</Button>
                        <DataLinkerResourceModal
                            fid={this.props.id}
                            autoFill={this.props.autoFill}
                            currentFormData={this.props.currentFormData}
                            simpleMode='external'
                            addEx={this.props.addEx}
                            delExFormItemBatch={this.props.delExFormItemBatch}
                            exList={this.props.getPanelBody(this.props.id).filter(a => a.isExternal).map(a => a.id)}
                            width={800}
                            showModal={this.state.showModal}
                            clearConditionList={this.clearConditionList}
                            hideModal={this.hideModal}
                            currentTitile={"设置第三方数据关联"}
                            thirdPartyList={this.props.thirdPartyList}
                            dataLinker={this.state.dataLinker}
                            setDataLinker={this.props.setDataLinker}
                            setFormDetailResource={this.setFormDetailResource}/>
                        <RelatedCondition key='condition' {...this.props} {...RelatedConditionAttr}
                                          linkType={this.state.linkType}/>
                    </React.Fragment> : null
            }
        </React.Fragment>;
    }
}

export default Relation;
