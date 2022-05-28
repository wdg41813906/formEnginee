import React from 'react'
import styles from './DataLinkerResource.less'
import { Select, Checkbox, Tooltip, Input, Modal, Button } from 'antd';
import com from '../../../utils/com';
import { parameterTypeList } from "../../../utils/DataSourceConfig";
import { LINKTYPE, getValueLinkMap, getValueConditionMap } from './DataLinker';
import { RelatedItem } from '../Attribute/RelationTable';//RelatedCondition
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

class DataLinkerResource extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            resourceId: '', // 当前第三方数据ID
            curResource: {}, // 第三方数据源当前ID下, 所有的内容
            fieldIds: [],
            settingArr: [],
            valueSelected: '',
            paramArr: [],
            paramSelected: '',
            conditions: [],//当前关联条件
            update: false
        }
        this.setResourceId = this.setResourceId.bind(this)
        this.filterOption = this.filterOption.bind(this)
        this.onChange = this.onChange.bind(this)
        this.setResource = this.setResource.bind(this);
        this.setting = this.setting.bind(this);
        this.setFormCol = this.setFormCol.bind(this);
    }

    componentDidMount() {
        const { dataLinker } = this.props
        if (dataLinker.length > 0) {
            if (dataLinker[0].request.id) {
                let [arrReq, arrBind, arrIds] = [[], [], []]
                dataLinker[0].request.params.map(item => {
                    let obj = {
                        ...item,
                        name: item.name,
                        id: item.id,
                        parameterType: item.type,
                        targetId: item.targetId,
                        value: item.value
                    }
                    arrReq.push(obj)
                })
                dataLinker[0].bindMap.map(item => {
                    let obj = {
                        ...item,
                        key: item.requestAttr,
                        controlType: item.controlType
                    }
                    arrIds.push(item.requestAttr)
                    arrBind.push(obj)
                })
                this.setState({
                    curResource: {
                        sourceParameterViewResponses: arrReq,
                        configuration: arrBind,
                    },
                    resourceId: dataLinker[0].request.id,
                    fieldIds: arrIds,
                    paramArr: arrReq,
                    conditions: dataLinker[0].conditions
                })
            }
        }
    }

    setResourceId(value) {
        const { thirdPartyList } = this.props
        let obj = {}
        for (let i = 0; i < thirdPartyList.length; i++) {
            if (thirdPartyList[i].id === value) {
                obj = thirdPartyList[i]
            }
        }
        let [arr, arrTemp] = [obj.configuration, []]
        for (let i = 0; i < arr.length; i++) {
            arrTemp.push(arr[i].key)
        }
        this.setState({ curResource: obj, resourceId: value, fieldIds: arrTemp })
    }

    filterOption(input, option) {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }

    onChange(e) {
        this.setState({ fieldIds: e })
    }

    async setResource() {
        const { dataLinker, setDataLinker, simpleMode, autoFill } = this.props;
        let { resourceId, curResource, fieldIds, settingArr, paramArr, conditions } = this.state;
        let [arrParams, arrBindMap, tempDataLinker] = [[], [], {}]
        for (let i = 0; i < curResource.sourceParameterViewResponses.length; i++) {
            const element = curResource.sourceParameterViewResponses[i];
            let [obj, curStr] = [{}, '']
            paramArr.map(item => {
                if (element.name === item.name) curStr = item.targetId
            })
            obj.id = element.id
            obj.name = element.name
            obj.type = element.parameterType
            obj.targetId = curStr
            obj.targetType = 0
            obj.value = element.value
            arrParams.push(obj)
        }
        for (let i = 0; i < fieldIds.length; i++) {
            const elementI = fieldIds[i];
            let arrConfiguration = curResource.configuration
            for (let j = 0; j < arrConfiguration.length; j++) {
                const elementJ = arrConfiguration[j];
                if (elementI === elementJ.key) {
                    if (simpleMode) {
                        settingArr.map(item => {
                            if (elementI === item.value) {
                                let obj = {
                                    targetId: item.id,
                                    requestAttr: elementJ.key,
                                    controlType: elementJ.controlType,
                                    description: elementJ.description || elementJ.key
                                }
                                arrBindMap.push(obj)
                            }
                        })
                    } else {
                        let simpleObj = {
                            targetId: com.Guid(),
                            requestAttr: elementJ.key,
                            controlType: elementJ.controlType,
                            description: elementJ.description || elementJ.key
                        }
                        arrBindMap.push(simpleObj)
                    }
                }
            }
        }
        tempDataLinker = {
            ...dataLinker.find(a => a.linkType === LINKTYPE.Resource),
            request: {
                id: resourceId,
                params: arrParams,
            },
            bindMap: arrBindMap,
            conditions,
            exportData: curResource.configuration,
            autoFill: autoFill === true,
            linkType: this.props.simpleMode ? LINKTYPE.Request : LINKTYPE.Resource,
            relations: conditions.map(a => a.targetId)
        }
        if (!simpleMode) {
            this.props.delExFormItemBatch(this.props.exList);
            tempDataLinker.bindMap.forEach(map => {
                let exItem = {
                    id: map.targetId,
                    name: map.description,
                    externalId: map.targetId,
                    itemType: map.controlType,
                    container: this.props.fid,
                    formType: 0,//item.formType,
                    exContainerId: this.props.fid,
                    noMappad: this.props.noMappad === true
                }
                this.props.addEx(exItem);
            })
        }
        else {
            arrBindMap.forEach(a => {
                this.props.setExternalId(a.targetId, a.targetId);
            });
        }
        await setDataLinker(tempDataLinker);
        this.props.hideModal();
    }

    setting(value, id) {
        let { settingArr } = this.state
        if (settingArr.length > 0) {
            settingArr.map(item => {
                if (item.value === value) item.id = id
            })
        } else {
            let obj = { id, value }
            settingArr.push(obj)
        }
        this.setState({ settingArr, valueSelected: value })
    }

    setFormCol(val, value) {
        let { paramArr, curResource } = this.state
        if (paramArr.length > 0) {
            paramArr.map(item => {
                if (item.name === value.name) {
                    item.targetId = val
                } else {
                    let obj = { targetId: val, name: value.name }
                    paramArr.push(obj)
                }
            })
        } else {
            let obj = { targetId: val, name: value.name }
            paramArr.push(obj)
        }
        curResource.sourceParameterViewResponses.map(item => {
            if (item.name === value.name) {
                item.targetId = val
            }
        })
        this.setState({ paramArr, curResource, paramSelected: val })
    }


    addCondition = () => {
        let conditions = this.state.conditions;
        conditions.push({ targetId: '', relationId: '', field: null, formType: null, primaryKey: null });
        this.setState({ conditions, update: !this.state.update });
    }

    removeCondition = (index) => {
        let conditions = this.state.conditions;
        if (index >= 0 || conditions.length > index) {
            conditions.splice(index, 1);
        }
        this.setState({ conditions, update: !this.state.update });
    }

    setRelation = (index, relationId) => {
        let conditions = this.state.conditions;
        if (index < 0 || conditions.length - 1 < index) {
            conditions.push({ relationId, targetId: '' });
        }
        else {
            conditions[index].relationId = relationId;
            //let { id: field, formType, primaryKey, formId } = this.state.curResource.configuration.find(a => a.key == relationId);
            conditions[index] = {
                ...conditions[index],
                field: relationId
                // formType,
                // primaryKey,
                // formId
            }
        }
        this.setState({ conditions, update: !this.state.update });
    }

    setTarget = (index, targetId) => {
        let conditions = this.state.conditions;
        if (index < 0 || conditions.length - 1 < index) {
            conditions.push({ relationId: '', targetId });
        }
        else {
            conditions[index].targetId = targetId;
            // conditions[index].field = '';
            // conditions[index].formType = '';
            // conditions[index].primaryKey = '';
            // conditions[index].formId = '';
            // conditions[index].relationId = '';
        }
        this.setState({ conditions, update: !this.state.update });
    }

    render() {
        const { thirdPartyList, currentTitile, width, showModal, hideModal, params, currentFormData } = this.props;
        let { resourceId, curResource, fieldIds, conditions, paramSelected } = this.state;
        let linkFormDetail = resourceId ? curResource.configuration.map(a => ({ id: a.key, name: a.description || a.key, valueType: a.valueType })) : []
        return <Modal maskClosable={false} centered={true} title={currentTitile} visible={showModal}
            onOk={this.setResource} width={width} onCancel={hideModal}>
            <div className={styles.title}>选择数据源</div>
            <div className={styles.body}>
                <Select className={styles.item} showSearch placeholder="请选择" optionFilterProp="children" maxTagCount={4}
                    value={resourceId} onChange={this.setResourceId} filterOption={this.filterOption}>
                    {thirdPartyList.map(a => <Option key={a.id} value={a.id} title={a.name}>{a.name}</Option>)}
                </Select>
            </div>
            {resourceId ?
                <React.Fragment>
                    <div className={styles.title}>关联参数</div>
                    <div className={styles.bodyParams}>
                        {curResource.sourceParameterViewResponses.map((value, index) => {
                            let paramType = parameterTypeList.find(a => a.value === value.parameterType).name
                            return <div className={styles.params} key={index}>
                                <div className={styles.inputD}>参数名称: <Input className={styles.inputMix} disabled defaultValue={value.name} /></div>
                                <div className={styles.inputD}>参数类型: <Input className={styles.inputMix} disabled defaultValue={paramType} /></div>
                                {
                                    paramType === '动态' ?
                                        <div className={styles.inputD}>参数值: <Select className={styles.inputMix} showSearch placeholder="请选择" optionFilterProp="children" maxTagCount={4}
                                            value={value.targetId}
                                            onChange={val => { this.setFormCol(val, value) }}
                                            filterOption={this.filterOption}>
                                            {currentFormData.map(a => <Option key={a.id} value={a.id}>{a.name}</Option>)}
                                        </Select>
                                        </div> : <div className={styles.inputD}>参数值: <Input className={styles.inputMix} defaultValue={value.value} /></div>
                                }
                            </div>
                        }
                        )}
                    </div>
                    {
                        Array.isArray(params) ?
                            <React.Fragment>
                                <div className={styles.title}>联动设置</div>
                                {params.map((a, i) => {
                                    let { valueSelected } = this.state;
                                    curResource.configuration.map(item => {
                                        if (item.targetId === a.id) valueSelected = item.key
                                    })
                                    return <div className={styles.body} key={a.id}>
                                        <div className={styles.dis}><span>{a.name}</span></div>
                                        <span>联动显示</span>
                                        <Select className={styles.item} showSearch placeholder="请选择" optionFilterProp="children" maxTagCount={4}
                                            value={valueSelected}
                                            onChange={value => { this.setting(value, a.id) }}
                                            filterOption={this.filterOption}>
                                            {curResource.configuration.map(a => <Option key={a.key} value={a.key}>{a.description || a.key}</Option>)}
                                        </Select>
                                        <span>的值</span>
                                    </div>
                                })}
                            </React.Fragment> :
                            <React.Fragment>
                                <div className={styles.title}>关联字段</div>
                                <div className={styles.body}>
                                    <CheckboxGroup style={{ width: '100%' }} value={fieldIds} onChange={this.onChange}>
                                        {curResource.configuration.map((item, index) => {
                                            return <div key={index}>
                                                <Tooltip title={item.key} mouseEnterDelay={1}>
                                                    <Checkbox className={styles.relChk} checked value={item.key}>{item.description || item.key}</Checkbox>
                                                </Tooltip>
                                            </div>
                                        })}
                                    </CheckboxGroup>
                                </div>
                            </React.Fragment>
                    }
                    <div className={styles.title}>关联条件<Button style={{ float: 'right' }} onClick={this.addCondition} size='small' type="primary" icon='plus'>添加</Button></div>
                    {
                        conditions.map((a, i) =>
                            <RelatedItem key={i} index={i} currentFormData={currentFormData} linkFormDetail={linkFormDetail}
                                relationId={a.relationId} targetId={a.targetId} removeCondition={this.removeCondition}
                                setRelation={this.setRelation} setTarget={this.setTarget} />)
                    }
                </React.Fragment> : null}
        </Modal>
    }
}

export default DataLinkerResource
