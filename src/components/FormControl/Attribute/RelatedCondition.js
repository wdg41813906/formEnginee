import React from 'react'
import { Button, Select, Modal, Card, Icon } from 'antd';
import Attribute from './Attribute.js';
import styles from './RelatedCondition.less';
import { LINKTYPE, getValueConditionMap } from '../DataLinker/DataLinker';
import _ from 'underscore';
import FORM_CONTROL_TYPE from '../../../enums/FormControlType.js';

@Attribute('关联条件')
class RelatedCondition extends React.PureComponent {
    constructor(props) {
        super(props);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.addCondition = this.addCondition.bind(this);
        this.removeCondition = this.removeCondition.bind(this);
        this.saveCondition = this.saveCondition.bind(this);
        this.setRelation = this.setRelation.bind(this);
        this.setTarget = this.setTarget.bind(this);
        this.state = { id: props.id, showModal: false, conditionList: props.conditionList || [], update: false };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.id != nextProps.id) {
            return { conditionList: nextProps.conditionList || [], id: nextProps.id };
        }
        return null;
    }
    show() {
        this.props.buildFormDataFilter('relation');
        this.setState({ showModal: true });
    }
    hide() {
        this.setState({ showModal: false });
    }
    setRelation(index, relationId) {
        let conditionList = this.state.conditionList;
        if (index < 0 || conditionList.length - 1 < index) {
            conditionList.push({ relationId, targetId: '' });
        }
        else {
            conditionList[index].relationId = relationId;
            let { code: field, formType, primaryKey, formId } = this.props.linkFormDetail.find(a => a.id == relationId);
            conditionList[index] = {
                ...conditionList[index],
                field,
                formType,
                primaryKey,
                formId
            }
        }
        this.setState({ conditionList, update: !this.state.update });
    }
    setTarget(index, targetId) {
        let conditionList = this.state.conditionList;
        if (index < 0 || conditionList.length - 1 < index) {
            conditionList.push({ relationId: '', targetId });
        }
        else {
            conditionList[index].targetId = targetId;
            conditionList[index].field = '';
            conditionList[index].formType = '';
            conditionList[index].primaryKey = '';
            conditionList[index].formId = '';
            conditionList[index].relationId = '';
        }
        this.setState({ conditionList, update: !this.state.update });
    }
    addCondition() {
        let conditionList = this.state.conditionList;
        conditionList.push({ targetId: '', relationId: '', field: null, formType: null, primaryKey: null });
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
        let { relationTableId, linkFormDetail, linkFormList, setDataLinker, onChange, relationColumns, expressionType, autoFill, persisted } = this.props;
        let table = linkFormList.find(a => a.id == relationTableId).table;
        let foreignKeys = [], relations = [], condition = [], fields = [], display = [];
        let conditionList = this.state.conditionList.filter(a => a.relationId.trim() !== '' && a.targetId.trim() !== '');
        relationColumns.forEach(col => {
            let exist = linkFormDetail.find(a => a.id == col.id);
            if (!exist.groupItems) {
                let { primaryKey, id, code, formType, formId, formCode, mainFormId, mainFormName, primaryKeyId } = exist;
                foreignKeys.push({
                    // FormId: rootFormId,//当前表表单Id，A
                    // FormName: rootFormName,//当前表单名称,A
                    //formVersionHistoryId,//表单版本历史Id
                    currentColumnName: '',

                    foreignFormId: mainFormId,//外键表单Id,B
                    foreignFormName: mainFormName,//B
                    foreignHistoryId: primaryKeyId,//外键表单版本历史Id
                    foreignColumnName: primaryKey,


                    displayFormId: formId,//C,若没有，则和B相同
                    displayFormName: formCode,//C
                    displayVersionHistoryId: col.id,//显示字段Id
                    displayName: code,


                    description: '',//this.props.self.id,
                    id: col.formForeignKeyId,
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
            })
        });
        let fGroups = _.groupBy(fields, a => a.formId);
        Object.keys(fGroups).forEach(formId => {
            let { formType, primaryKey } = fGroups[formId][0];
            display.push({
                primaryKey,
                formType,
                list: fGroups[formId].map(item => { return { id: item.id, field: item.field } })
            });
        })
        let expression = [{
            source: table,
            condition,
            display,
            type: expressionType ? expressionType : null
        }]
        setDataLinker({
            foreignKeys,
            expression,
            linkType: LINKTYPE.External,
            autoFill,
            persisted,
            relations
        });
        onChange({ conditionList });
        this.setState({ showModal: false, conditionList });
    }
    render() {
        let { linkFormDetail, currentFormData, ...other } = this.props;
        let r = linkFormDetail.filter(a => a.formType !== 1 && (a.groupItem === true && a.groupItemPrivate !== true && a.type !== FORM_CONTROL_TYPE.Group) || (a.groupItem !== true && a.groupItems === undefined));
        return <React.Fragment>
            <Button onClick={this.show} style={{ width: '100%' }}>设置关联条件</Button>
            <Modal maskClosable={false} centered={true} visible={this.state.showModal}
                onOk={this.saveCondition} width={500} closable={true}
                onCancel={this.hide} title={<div className={styles.ModalTitle}><div>关联条件设置</div><Button onClick={this.addCondition} size='small' type="primary" icon='plus'>添加</Button></div>}>
                <RelatedSetting
                    //{...other}
                    currentFormData={currentFormData}
                    linkFormDetail={r}
                    conditionList={this.state.conditionList}
                    update={this.state.update}
                    //addCondition={this.addCondition}
                    //setCondition={this.setCondition}
                    removeCondition={this.removeCondition}
                    setRelation={this.setRelation}
                    setTarget={this.setTarget} />
            </Modal>
        </React.Fragment>;
    }
}

class RelatedSetting extends React.PureComponent {
    render() {
        let { currentFormData, linkFormDetail, removeCondition, setRelation, setTarget, conditionList } = this.props;
        return <Card bodyStyle={{ height: '300px', overflow: 'auto', padding: '10px', display: 'block' }}>
            {
                conditionList.map((a, i) =>
                    <RelatedItem key={i} index={i} currentFormData={currentFormData} linkFormDetail={linkFormDetail}
                        relationId={a.relationId} targetId={a.targetId} removeCondition={removeCondition}
                        setRelation={setRelation} setTarget={setTarget} />)
            }
        </Card>
    }
}
const relatedFilter = (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
export const RelatedItem = ({ currentFormData, targetId, setTarget, relationId, setRelation, removeCondition, linkFormDetail, index }) => {
    let exist = currentFormData.find(a => a.id === targetId);
    let list = linkFormDetail;
    if (exist) {
        let valueMap = getValueConditionMap(exist.valueType);
        list = linkFormDetail.filter(a => valueMap.includes(a.valueType));
    }
    return <div className={styles.RelatedItem}>
        <Select showSearch placeholder='当前表单字段' optionFilterProp="children"
            filterOption={relatedFilter} value={targetId} onChange={(e) => setTarget(index, e)}>
            {
                currentFormData.map(a => <Select.Option key={a.id} value={a.id} title={a.name}>{a.name}</Select.Option>)
            }
        </Select>
        <span>等于</span>
        <Select showSearch placeholder='关联表单字段' optionFilterProp="children"
            filterOption={relatedFilter} value={relationId} onChange={(e) => setRelation(index, e)}>
            {
                list.map(a => <Select.Option key={a.id} value={a.id} title={a.name}>{a.name}</Select.Option>)
            }
        </Select>
        <Icon type="delete" onClick={() => { removeCondition(index) }} />
    </div>
}
export default {
    Component: RelatedCondition,
    getProps: (props) => {
        let { relationTableId, linkFormDetail, linkFormList, setDataLinker, onChange, conditionList,
            relationColumns, expressionType, autoFill, persisted, currentFormData, buildFormDataFilter } = props;
        return {
            relationTableId, linkFormDetail, linkFormList, setDataLinker, onChange, conditionList,
            relationColumns, expressionType, autoFill, persisted, currentFormData, buildFormDataFilter
        };
    }
};
