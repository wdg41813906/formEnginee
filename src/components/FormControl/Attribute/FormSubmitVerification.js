import React from 'react'
import { Button, Modal, Tabs, Select, Input, Collapse, Icon } from 'antd';
import Attribute from './Attribute.js'
import FormulaEditor from '../FormulaEditor/FormulaEditor';
import { funcFix } from '../DataLinker/DataLinker';
import styles from './FormSubmitVerification.less';
import { parameterTypeList } from "../../../utils/DataSourceConfig";
const valiSytle = { display: 'flex', padding: '5px 0', lineHeight: '32px' };
@Attribute('表单提交校验')
class FormSubmitVerification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            thirdPartyObj: [],
            currentData: [],
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let [thirdPartyArr, currentArr] = [[], []]
        if (nextProps.thirdPartyVerification && nextProps.thirdPartyVerification.length !== 0 && prevState.currentData.length === 0) {
            currentArr = nextProps.thirdPartyVerification
        }
        if (nextProps.allWithValideList.length > 0 && nextProps.thirdPartyId.length > 0) {
            nextProps.thirdPartyId.forEach(a => {
                let tempAllWithValideList = nextProps.allWithValideList.find(b => b.id === a)
                thirdPartyArr.push(tempAllWithValideList)
            })
        }
        if (currentArr.length > 0 && thirdPartyArr.length > 0) {
            return {
                thirdPartyObj: thirdPartyArr,
                currentData: currentArr
            }
        } else if (thirdPartyArr.length > 0) {
            return {
                thirdPartyObj: thirdPartyArr,
            }
        } else if (currentArr.length > 0) {
            return {
                currentData: currentArr
            }
        }
        return null
    }

    showModal = () => {
        let { buildFormDataFilter } = this.props
        buildFormDataFilter('formula');
        this.setState({ showModal: true });
    }

    initFormula = (editor, options, next) => {
        this.setState({
            editor: editor
        });
    }

    setFormular = () => {
        let { setFormProperties, onChange } = this.props
        let { currentData } = this.state
        let value = this.state.editor.getValue();
        let fixValue = funcFix(value);
        onChange(fixValue)
        setFormProperties({ thirdPartyVerification: currentData })
        this.setState({
            showModal: false
        });
    }

    hideModal = () => {
        this.setState({
            showModal: false,
            currentData: this.props.thirdPartyVerification,
        });
    }

    filterOption = (input, option) => {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }

    setResourceId = (value) => {
        let { setFormProperties } = this.props
        setFormProperties({ thirdPartyId: value })
    }

    dynamicSelect = (value, item) => {
        let { currentData } = this.state
        let tempCurrentData = currentData.filter(a => a.id !== item.id)
        this.setState({ currentData: [...tempCurrentData, { targetId: value, id: item.id, sourceTypeConfigId: item.sourceTypeConfigId, value: item.value }] })
    }

    staticInput = (e, item) => {
        let { currentData } = this.state
        let tempCurrentData = currentData.filter(a => a.id !== item.id)
        this.setState({ currentData: [...tempCurrentData, { value: e.target.value, id: item.id, sourceTypeConfigId: item.sourceTypeConfigId }] })
    }
    setMsg = ({ target: { value } }) => {
        this.props.setFormProperties({ formSubmitVerificationMsg: value })
    }
    render() {
        let { value, formTemplateVersionId, linkFormList, foreignFormData, id, thirdPartyId, currentFormData, allWithValideList, formSubmitVerificationMsg } = this.props;
        let { currentData, thirdPartyObj } = this.state
        //let current, currentTitile, linker = getLinker(dataLinker, a => a.linkType < 4);
        return (<React.Fragment>
            {/* <Select value={value} style={{ width: "100%" }} onChange={e => onChange(e)}>
                <Select.Option value="1">保持原值</Select.Option>
                <Select.Option value="2">空值</Select.Option>
                <Select.Option value="3">始终重新计算</Select.Option>
            </Select> */}
            <Button onClick={() => { this.showModal() }} style={{ width: '100%' }}>添加校验条件</Button>
            <Modal
                className={styles.checkModal}
                maskClosable={false}
                title={'表单提交校验'}
                centered={true}
                visible={this.state.showModal}
                onOk={this.setFormular}
                onCancel={this.hideModal}
                width={800}
                bodyStyle={{ height: 520 }}
            >
                <Tabs defaultActiveKey="1" className={styles.tabsContainer}>
                    <Tabs.TabPane tab="内部表单" key="1" className={styles.tabsInnerContent}>
                        <div style={valiSytle}>验证提示：<Input style={{ flex: 1 }} type='text' placeholder='请输入验证失败时提示的错误信息' onChange={this.setMsg} value={formSubmitVerificationMsg} /></div>
                        <FormulaEditor
                            fid={id}
                            value={value}
                            currentFormData={currentFormData.toJS()}
                            relations={[]}
                            relationTables={[]}
                            foreignFormData={foreignFormData}
                            foreignForm={linkFormList}
                            init={this.initFormula}
                            formTemplateVersionId={formTemplateVersionId}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="外部接口" key="2" className={styles.tabsOutContent}>
                        <div className={styles.title}>选择数据源</div>
                        <div className={styles.body}>
                            <Select className={styles.item} showSearch placeholder="请选择" optionFilterProp="children" maxTagCount={4}
                                mode="multiple"
                                value={thirdPartyId} onChange={this.setResourceId} filterOption={this.filterOption}>
                                {allWithValideList.map(a => <Select.Option key={a.id} value={a.id} title={a.name}>{a.name}</Select.Option>)}
                            </Select>
                        </div>
                        {thirdPartyId ?
                            <React.Fragment>
                                <div className={styles.title}>关联参数</div>
                                <div className={styles.paramsContainer}>
                                    <Collapse
                                        bordered={false}
                                        defaultActiveKey={['1']}
                                        expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
                                    >
                                        {thirdPartyObj.map((ele, idx) => {
                                            return (
                                                <Collapse.Panel header={ele.name} key={idx + 1}>
                                                    {
                                                        ele.sourceParameterViewResponses.map((item, index) => {
                                                            let exist = currentData.find(a => a.id === item.id);
                                                            let paramType = parameterTypeList.find(a => a.value === item.parameterType).name
                                                            return <div className={styles.params} key={index}>
                                                                <div className={styles.inputD}>参数名称: <Input className={styles.inputMix} disabled defaultValue={item.name} /></div>
                                                                <div className={styles.inputD}>参数类型: <Input className={styles.inputMix} disabled defaultValue={paramType} /></div>
                                                                {
                                                                    paramType === '动态' ?
                                                                        <div className={styles.inputD}>参数值: <Select className={styles.inputMix} showSearch placeholder="请选择" optionFilterProp="children" maxTagCount={4}
                                                                            dropdownMatchSelectWidth={false}
                                                                            value={exist ? exist.targetId : ''}
                                                                            onChange={val => { this.dynamicSelect(val, item) }}
                                                                            filterOption={this.filterOption}>
                                                                            {currentFormData.toJS().map(a => <Select.Option key={a.id} value={a.id} title={a.name}>{a.name}</Select.Option>)}
                                                                        </Select>
                                                                        </div> : <div className={styles.inputD}>参数值: <Input className={styles.inputMix} value={exist ? exist.value : item.value} onChange={(e) => this.staticInput(e, item)} /></div>
                                                                }
                                                            </div>
                                                        })
                                                    }
                                                </Collapse.Panel>
                                            )
                                        })}
                                    </Collapse>
                                </div>
                            </React.Fragment> : null
                        }
                    </Tabs.TabPane>
                </Tabs>
            </Modal>
        </React.Fragment>);
    }
}

export default {
    Component: FormSubmitVerification,
    getProps: (props) => {
        let { id, currentFormData, foreignFormData, buildFormDataFilter, formTemplateVersionId, linkFormList, value, formSubmitVerificationMsg } = props;
        return { id, currentFormData, foreignFormData, buildFormDataFilter, formTemplateVersionId, linkFormList, value, formSubmitVerificationMsg };
    }
};
