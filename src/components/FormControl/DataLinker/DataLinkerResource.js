import React from "react";
import styles from "./DataLinkerResource.less";
import { Select, Checkbox, Tooltip, Input, Button, message } from "antd";
import com from "../../../utils/com";
import { parameterTypeList } from "../../../utils/DataSourceConfig";
import { RelatedItem } from "../Attribute/RelationTable";

const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

class DataLinkerResource extends React.Component {
    constructor(props) {
        super(props);
        let currentData = props.thirdPartyList.find(a => a.id === props.dataLinker.request.id);
        if (currentData) {
            currentData.sourceParameterViewResponses.forEach(item => {
                props.dataLinker.request.params.forEach(ele => {
                    if (ele.id === item.id) item.value = ele.value;
                });
            });
        }
        this.state = {
            dataLinker: {
                ...props.dataLinker,
                autoFill: props.autoFill
            },
            currentData,
            paramsValue: [],
            oldId: props.dataLinker.request.id
        };
        this.setResourceId = this.setResourceId.bind(this);
        this.filterOption = this.filterOption.bind(this);
        this.setField = this.setField.bind(this);
        this.setResource = this.setResource.bind(this);
        this.linkSetting = this.linkSetting.bind(this);
        this.setFormCol = this.setFormCol.bind(this);
        this.addCondition = this.addCondition.bind(this);
        this.removeCondition = this.removeCondition.bind(this);
        this.setRelation = this.setRelation.bind(this);
        this.setTarget = this.setTarget.bind(this);
    }
    
    componentDidMount() {
        this.props.onRef(this);
    }
    
    setResourceId(value) {
        const { thirdPartyList } = this.props;
        let { dataLinker, currentData } = this.state;
        dataLinker.request.id = value;
        let conditionsData = [];
        if (dataLinker.conditions.length > 0) {
            dataLinker.conditions.map((item) => {
                item.relationId = "";
                item.field = null;
                item.formType = null;
                item.primaryKey = null;
                conditionsData.push(item);
            });
        }
        
        dataLinker.bindMap = [];
        dataLinker.conditions = conditionsData;
        dataLinker.request.params = [];
        currentData = thirdPartyList.find((a) => a.id === value);
        dataLinker.request = {
            ...dataLinker.request,
            url: currentData.url,
            methodType: currentData.methodType,
            primaryKeyValueType: currentData.configuration.some((a) => a.primary === true) ? currentData.configuration.find((a) => a.primary === true).valueType : "string"
        };
        dataLinker.rule = currentData.rule;
        currentData.sourceParameterViewResponses.map((a) => {
            dataLinker.request.params.push({
                id: a.id,
                name: a.name,
                type: a.parameterType,
                requestType: a.requestType,
                targetId: "",
                targetType: 0,
                value: a.value
            });
        });
        let primary = currentData.configuration.find((a) => a.primary === true);
        if (primary) dataLinker.primaryKey = primary.key;
        this.setState({ dataLinker, currentData, paramsValue: [] });
    }
    
    filterOption(input, option) {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
    
    setField(e) {
        let { dataLinker, currentData } = this.state;
        let bindMap = [];
        e.forEach((a) => {
            let exist = currentData.configuration.find((b) => b.key === a);
            if (exist) {
                bindMap.push({
                    targetId: com.Guid(),
                    key: exist.key,
                    requestAttr: exist.name || exist.key,
                    controlType: exist.controlType
                });
            }
        });
        dataLinker.bindMap = bindMap;
        this.setState({ dataLinker });
    }
    
    // 第三方数据源设置保存, 通过ref调用
    async setResource() {
        const { setDataLinker, simpleMode, delExFormItemBatch, exList, fid, noMappad, addEx, setExternalId, hideModal, setFormDetailResource } = this.props;
        let { dataLinker, currentData } = this.state;
        if ((dataLinker.request.id || "") === "") {
            message.warn("请设置第三方数据源！");
            return;
        }
        if (dataLinker.bindMap.length == 0) {
            message.warn("请设置关联字段！");
            return;
        }
        for (let i = 0, j = dataLinker.conditions.length; i < j; i++) {
            if (dataLinker.conditions[i].targetId === "" || dataLinker.conditions[i].relationId === "") {
                message.warn("请设置完整的关联条件！");
                return;
            }
        }
        switch (simpleMode) {
            case "group":
                dataLinker.bindMap.forEach((a) => {
                    setExternalId(a.targetId, a.targetId);
                });
                break;
            case "item":
                this.props.onChange({ externalId: dataLinker.bindMap[0].targetId });
                break;
            case "external":
                let existList = [];
                dataLinker.bindMap.forEach((map) => {
                    let exist = currentData.configuration.find((a) => a.key === map.requestAttr);
                    let name = map.requestAttr;
                    if (exist && exist.description) name = exist.description;
                    let exItem = {
                        id: map.targetId,
                        name,
                        externalId: map.targetId,
                        itemType: map.controlType,
                        container: fid,
                        formType: 0, //item.formType,
                        exContainerId: fid,
                        noMappad: noMappad === true
                    };
                    existList.push(map.targetId);
                    if (!exList.includes(map.targetId)) addEx(exItem);
                });
                delExFormItemBatch(exList.filter((a) => !existList.includes(a)));
                break;
        }
        let relations = dataLinker.relations;
        dataLinker.conditions.forEach((c) => {
            if (!relations.includes(c.targetId)) relations.push(c.targetId);
        });
        dataLinker.bindMap.forEach((c) => {
            if (c.targetId !== fid && !relations.includes(c.targetId)) relations.push(c.targetId);
        });
        dataLinker.request.params
            .filter((a) => a.type === 0)
            .forEach((c) => {
                if ((c.targetId || "") !== "" && !relations.includes(c.targetId)) relations.push(c.targetId);
            });
        dataLinker.resourceFields = currentData.configuration.map((a) => ({
            id: a.key,
            formType: 0,
            relationId: a.key,
            code: a.key.substr(a.key.lastIndexOf(".") + 1),
            name: a.name,
            valueType: a.valueType
        }));
        await setDataLinker(dataLinker);
        if (this.state.oldId !== dataLinker.request.id) {
            this.props.clearConditionList && this.props.clearConditionList();
            this.setState({ oldId: dataLinker.request.id });
        }
        if (setFormDetailResource instanceof Function) {
            setFormDetailResource(dataLinker.resourceFields);
        }
        hideModal();
    }
    
    // linkSetting(val, item) {
    //     let { dataLinker, currentData } = this.state;
    //     let curConfig = currentData.configuration.find((a) => a.key === val);
    //     let tempBindMap = dataLinker.bindMap.find((a) => a.targetId === item.id);
    //     if (tempBindMap) {
    //         let exist = dataLinker.bindMap.find((a) => a.targetId === item.id);
    //         exist.requestAttr = val;
    //         exist.controlType = curConfig.controlType;
    //     } else {
    //         dataLinker.bindMap.push({
    //             targetId: item.id,
    //             requestAttr: val,
    //             controlType: curConfig.controlType
    //         });
    //     }
    //     console.log(dataLinker, 11111111);
    //     this.setState({ dataLinker });
    // }
    
    linkSetting(val, item) {
        let { dataLinker, currentData } = this.state;
        let controlType = [];
        let curConfig = currentData.configuration.filter(a => val.indexOf(a.key) > -1);
        curConfig.map(v => {
            controlType.push(v.controlType);
        });
        // let curConfig = currentData.configuration.find((a) => a.key === val);
        let tempBindMap = dataLinker.bindMap.find((a) => a.targetId === item.id);
        if (tempBindMap) {
            let exist = dataLinker.bindMap.find((a) => a.targetId === item.id);
            exist.requestAttr = val;//[]
            exist.controlType = controlType;//[]
        } else {
            dataLinker.bindMap.push({
                targetId: item.id,
                requestAttr: val,
                controlType: controlType
            });
        }
        this.setState({ dataLinker });
    }
    
    linkBinding(val, item) {
        let { dataLinker } = this.state;
        let tempExtraBindeMap = dataLinker.extraBindMap.find((a) => a.targetId === item);
        if (tempExtraBindeMap) {
            dataLinker.extraBindMap.map((a) => {
                if (a.targetId === item) a.requestAttr = val;
            });
        } else {
            dataLinker.extraBindMap.push({
                targetId: item,
                requestAttr: val
            });
        }
        this.setState({ dataLinker });
    }
    
    setFormCol(val, item, type) {
        let { dataLinker, paramsValue, currentData } = this.state;
        let value = type === "dynamic" ? "" : val.target.value;
        currentData.sourceParameterViewResponses.map((a) => {
            if (a.id === item.id) {
                a.value = value;
            }
        });
        dataLinker.request.params.map((a) => {
            if (a.id === item.id) {
                a.name = item.name;
                a.targetId = type === "dynamic" ? val : "";
                a.type = item.parameterType;
                a.value = type === "dynamic" ? item.value : val.target.value;
            }
        });
        let params = { id: item.id, value };
        let isvalue = paramsValue.find((v) => v.id === item.id);
        if (isvalue) {
            paramsValue.forEach((v) => {
                if (v.id === item.id) v.value = value;
            });
        } else paramsValue.push(params);
        this.setState({ dataLinker, paramsValue });
    }
    
    addCondition = () => {
        let { dataLinker } = this.state;
        dataLinker.conditions.push({ targetId: "", relationId: "", field: null, formType: null, primaryKey: null });
        this.setState({ dataLinker });
    };
    
    removeCondition = (index) => {
        let { dataLinker } = this.state;
        if (index >= 0 || dataLinker.conditions.length > index) {
            dataLinker.conditions.splice(index, 1);
        }
        this.setState({ dataLinker });
    };
    
    setRelation = (index, relationId) => {
        let { dataLinker } = this.state;
        if (index < 0 || dataLinker.conditions.length - 1 < index) {
            dataLinker.conditions.push({ relationId, targetId: "" });
        } else {
            //dataLinker.conditions[index].relationId = relationId;
            dataLinker.conditions[index] = {
                ...dataLinker.conditions[index],
                relationId,
                field: relationId
                // formType,
                // primaryKey,
                // formId
            };
        }
        this.setState({ dataLinker });
    };
    
    setTarget = (index, targetId) => {
        let { dataLinker } = this.state;
        if (index < 0 || dataLinker.conditions.length - 1 < index) {
            dataLinker.conditions.push({ relationId: "", targetId });
        } else {
            dataLinker.conditions[index].targetId = targetId;
            dataLinker.conditions[index].relationId = "";
            // conditions[index].formType = '';
            // conditions[index].primaryKey = '';
            // conditions[index].formId = '';
            // conditions[index].relationId = '';
        }
        this.setState({ dataLinker });
    };
    
    render() {
        const { thirdPartyList, params, currentFormData, extraParams } = this.props;
        let { dataLinker, currentData, paramsValue } = this.state;
        let linkFormDetail =
            dataLinker.request.id && currentData ? currentData.configuration.map((a) => ({
                id: a.key,
                name: a.description || a.key,
                valueType: a.valueType
            })) : [];
        let fieldArr = dataLinker.bindMap.map((a) => a.key || a.requestAttr);
        let thirdPartyListType = thirdPartyList.filter((a) => a.sourceType === 0);
        return (
            <React.Fragment>
                <div className={styles.title}>选择数据源</div>
                <div className={styles.body}>
                    <Select
                        className={styles.item}
                        showSearch
                        placeholder="请选择"
                        optionFilterProp="children"
                        maxTagCount={4}
                        value={dataLinker.request.id && currentData ? dataLinker.request.id : null}
                        onChange={this.setResourceId}
                        filterOption={this.filterOption}
                    >
                        {thirdPartyListType.map((a) => (
                            <Option key={a.id} value={a.id} title={a.name}>
                                {a.name}
                            </Option>
                        ))}
                    </Select>
                </div>
                {dataLinker.request.id && currentData ? (
                    <React.Fragment>
                        {currentData.sourceParameterViewResponses && currentData.sourceParameterViewResponses.length !== 0 ?
                            <div className={styles.title}>关联参数</div> : null}
                        <div className={styles.bodyParams}>
                            {currentData.sourceParameterViewResponses.map((item, index) => {
                                let exist = dataLinker.request.params.find((a) => a.id === item.id);
                                let paramType = parameterTypeList.find((a) => a.value === item.parameterType).name;
                                let value = paramsValue.find((v) => v.id === item.id);
                                return (
                                    <div className={styles.params} key={index}>
                                        <span>参数名称：</span> <Input className={styles.inputMix} disabled
                                                                  value={item.name}/>
                                        <span>参数类型：</span> <Input className={styles.inputMix} disabled
                                                                  value={paramType}/>
                                        <span> 参数值：</span>
                                        {paramType === "动态" ? (
                                            <Select
                                                className={styles.select}
                                                showSearch
                                                placeholder="请选择"
                                                optionFilterProp="children"
                                                maxTagCount={4}
                                                value={exist ? exist.targetId : ""}
                                                onChange={(val) => {
                                                    this.setFormCol(val, item, "dynamic");
                                                }}
                                                filterOption={this.filterOption}
                                            >
                                                {currentFormData.map((a) => (
                                                    <Option key={a.id} title={a.name} value={a.id} title={a.name}>
                                                        {a.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        ) : (
                                            <Input
                                                className={styles.select}
                                                value={value ? value.value : item.value}
                                                onChange={(val) => {
                                                    this.setFormCol(val, item, "other");
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {Array.isArray(params) ? (
                            <React.Fragment>
                                <div className={styles.title}>联动设置</div>
                                {params.map((item, i) => {
                                    let exist = dataLinker.bindMap.find((a) => a.targetId === item.id);
                                    return (
                                        <div className={styles.body} key={item.id}>
                                            <div className={styles.dis}>
                                                <span>{item.name}</span>
                                            </div>
                                            <span>联动显示</span>
                                            <Select
                                                className={styles.item}
                                                showSearch
                                                mode="multiple"
                                                placeholder="请选择"
                                                optionFilterProp="children"
                                                maxTagCount={4}
                                                value={exist ? exist.requestAttr : []}
                                                onChange={(val) => {
                                                    this.linkSetting(val, item);
                                                }}
                                                filterOption={this.filterOption}
                                            >
                                                {currentData.configuration.map((a) => (
                                                    <Option key={a.key} title={a.description || a.name || a.key}
                                                            value={a.key}>
                                                        {a.description || a.name || a.key}
                                                    </Option>
                                                ))}
                                            </Select>
                                            <span>的值</span>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <div className={styles.title}>关联字段</div>
                                <div className={styles.body}>
                                    <CheckboxGroup style={{ width: "100%" }} value={fieldArr} onChange={this.setField}>
                                        {currentData.configuration.map((item, index) => {
                                            return (
                                                <Tooltip key={index} title={item.key} mouseEnterDelay={1}>
                                                    <Checkbox className={styles.relChk} checked value={item.key}>
                                                        {item.description || item.name || item.key}
                                                    </Checkbox>
                                                </Tooltip>
                                            );
                                        })}
                                    </CheckboxGroup>
                                </div>
                            </React.Fragment>
                        )}
                        {dataLinker.conditions && dataLinker.conditions.length !== 0 ? (
                            <div className={styles.title}>
                                关联条件
                                <Button style={{ float: "right" }} onClick={this.addCondition} size="small"
                                        type="primary" icon="plus">
                                    添加
                                </Button>
                            </div>
                        ) : null}
                        {dataLinker.conditions.map((a, i) => (
                            <RelatedItem
                                key={i}
                                index={i}
                                currentFormData={currentFormData}
                                linkFormDetail={linkFormDetail}
                                relationId={a.relationId}
                                targetId={a.targetId}
                                removeCondition={this.removeCondition}
                                setRelation={this.setRelation}
                                setTarget={this.setTarget}
                            />
                        ))}
                        {extraParams ? (
                            <React.Fragment>
                                {extraParams && extraParams.length !== 0 ?
                                    <div className={styles.title}>回绑设置</div> : null}
                                {extraParams.map((item, i) => {
                                    let exist = dataLinker.extraBindMap.find((a) => a.targetId === item);
                                    return (
                                        <div className={styles.body} key={i}>
                                            <div className={styles.dis}>
                                                <span>{item}</span>
                                            </div>
                                            <span>绑定</span>
                                            <Select
                                                className={styles.item}
                                                showSearch
                                                placeholder="请选择"
                                                optionFilterProp="children"
                                                maxTagCount={4}
                                                value={exist ? exist.requestAttr : ""}
                                                onChange={(val) => {
                                                    this.linkBinding(val, item);
                                                }}
                                                filterOption={this.filterOption}
                                            >
                                                {currentData.configuration.map((a) => (
                                                    <Option key={a.key} title={a.description || a.key} value={a.key}>
                                                        {a.description || a.key}
                                                    </Option>
                                                ))}
                                            </Select>
                                            <span>的值</span>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ) : null}
                    </React.Fragment>
                ) : null}
            </React.Fragment>
        );
    }
}

export default DataLinkerResource;
