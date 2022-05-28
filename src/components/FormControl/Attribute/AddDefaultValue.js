import React from 'react'
import { Input, Button, Select, Modal, message, Cascader } from 'antd';
import Attribute from './Attribute.js';
import FormulaEditor from '../FormulaEditor/FormulaEditor';
import DataLinkerEditor from '../DataLinker/DataLinkerEditor'
import DataLinkerResourceModal from '../DataLinker/DataLinkerResourceModal'
import { LINKTYPE, funcFix, initLinker, getLinker } from '../DataLinker/DataLinker';
import { cityArray } from "../../../static/cityData";
import FORM_CONTROL_TYPE from '../../../enums/FormControlType.js';

@Attribute('默认值')
class AddDefaultValue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            width: 500,
            foreignKeys: null,
            id: props.id,
            dataLinker: getLinker(props.dataLinker, a => a.linkType < 6)
        };
        this.SetModeChange = this.SetModeChange.bind(this);
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.setFormular = this.setFormular.bind(this);
        this.initFormula = this.initFormula.bind(this);
        this.saveDataLinker = this.saveDataLinker.bind(this);
        this.saveFormula = this.saveFormula.bind(this);
        this.setDataLinker = this.setDataLinker.bind(this);
    }

    SetModeChange(e) {
        let param;
        switch (e) {
            case LINKTYPE.DefaultValue:
                break;
            case LINKTYPE.Linker:
                param = true;
                this.setState({ width: 500 })
                break;
            case LINKTYPE.Formula:
                this.setState({ width: 800 })
                break;
            case LINKTYPE.Request:
                // this.setState({ width: 800 })
                param = true;
                break;
            default:
                break;
        }
        this.props.setDataLinker(initLinker(e, param));
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let linker = getLinker(nextProps.dataLinker, a => a.linkType < 6);
        if (prevState.id !== nextProps.id ||
            prevState.dataLinker.linkType !== linker.linkType ||
            linker.linkType === LINKTYPE.DefaultValue) {
            return {
                dataLinker: linker,
                id: nextProps.id
            }
        }
        return null;
    }

    handleChange = (e) => {
        if (e.length === 3) {
            this.props.setGroupItemValue('province', e[0]);
            this.props.setGroupItemValue('city', e[1]);
            this.props.setGroupItemValue('area', e[2]);
        } else {
            this.props.setGroupItemValue('detail', e.target.value);
        }
    }

    showModal() {
        const { dataLinker } = this.state;
        switch (dataLinker.linkType) {
            case LINKTYPE.Formula:
                this.props.buildFormDataFilter('formula');
                break;
            case LINKTYPE.Formula:
            case LINKTYPE.Resource:
            case LINKTYPE.Linker:
                this.props.buildFormDataFilter('linker');
                break;
            case LINKTYPE.Request:
                this.props.buildFormDataFilter('request');
                break;
        }
        this.setState({ showModal: true });
    }

    hideModal() {
        this.setState({ showModal: false });
    }

    initFormula(editor, options, next) {
        this.setState({
            editor: editor
        });
    }

    setFormular() {
        switch (this.state.dataLinker.linkType) {
            case LINKTYPE.Linker:
                this.saveDataLinker();
                return;
            case LINKTYPE.Formula:
                this.saveFormula();
                return;
        }
    }

    setDataLinker(dataLinker) {
        this.setState({ dataLinker })
    }

    saveFormula() {
        let value = this.state.editor.getValue();
        let fixValue = funcFix(value);
        this.state.editor.setValue(fixValue);
        this.props.setDataLinker(initLinker(LINKTYPE.Formula, fixValue, [this.state.dataLinker]));
        this.setState({
            showModal: false
        });
    }

    saveDataLinker() {
        let foreignKey = this.state.dataLinker.foreignKeys[0]
        if (foreignKey && foreignKey.foreignFormId &&
            foreignKey.formVersionHistoryId &&
            foreignKey.foreignHistoryId &&
            foreignKey.displayVersionHistoryId) {
            this.props.setDataLinker(this.state.dataLinker);
            this.setState({
                showModal: false
            });
        } else {
            message.error('请选择完所有选项');
        }
    }

    setData(data) {
        this.props.onChange({ ...data });
    }

    render() {
        let {
            id, linkFormList, linkFormDetail, currentFormData, formTemplateVersionId,
            getLinkFormLDetail, foreignFormData, AddShowType, getLinkerParams, groupValues,
            thirdPartyList, autoFill, setExternalId, showThird
        } = this.props;
        
        let { dataLinker, showModal } = this.state
        let current, currentTitile;
        switch (dataLinker.linkType) {
            case LINKTYPE.DefaultValue:
                current = <div>
                    <Cascader options={cityArray}
                        value={groupValues.province ? [groupValues.province, groupValues.city, groupValues.area] : null}
                        style={{ width: '100%', padding: '6px 0' }}
                        onChange={this.handleChange}
                        placeholder='省/市/区'
                    />
                    {
                        AddShowType === 'Add' ? null : <Input placeholder="详细地址"
                            value={groupValues.detail ? groupValues.detail : null}
                            onChange={this.handleChange} />
                    }
                </div>
                break;
            case LINKTYPE.Linker:
                current = <Button style={{ width: "100%" }} onClick={this.showModal}>数据联动设置</Button>
                currentTitile = '数据联动设置';
                break;
            case LINKTYPE.Request:
                current = <Button style={{ width: "100%" }} onClick={this.showModal}>关联第三方数据源设置</Button>
                currentTitile = '关联第三方数据源设置';
                break;
            default:
                break;
        }
        return <React.Fragment>
            <Select getPopupContainer={() => document.getElementById('KJSX')} value={dataLinker.linkType}
                style={{ width: "100%", marginBottom: 10 }} onChange={e => this.SetModeChange(e)}>
                <Select.Option value={LINKTYPE.DefaultValue}>自定义</Select.Option>
                <Select.Option value={LINKTYPE.Linker}>数据联动</Select.Option>
                {
                    showThird === false ? null :
                        <Select.Option value={LINKTYPE.Request}>关联第三方数据源</Select.Option>
                }
            </Select>
            {current}
            {dataLinker.linkType < LINKTYPE.Request ?
                <Modal maskClosable={false} centered={true} title={currentTitile}
                    visible={showModal} onOk={this.setFormular}
                    width={800}
                    bodyStyle={{ height: 520 }}
                    onCancel={this.hideModal}>
                    {
                        dataLinker.linkType === 1 ?
                            <FormulaEditor fid={id}
                                value={dataLinker.expression}
                                relations={dataLinker.relations}
                                relationTables={dataLinker.relationTables}
                                foreignData={dataLinker.foreignData}
                                foreignRelations={dataLinker.foreignRelations}
                                init={this.initFormula}
                                formTemplateVersionId={formTemplateVersionId}
                                foreignFormData={foreignFormData}
                                foreignForm={linkFormList}
                                currentFormData={currentFormData} /> :
                            <DataLinkerEditor
                                fid={id}
                                autoFill={autoFill}
                                getLinkFormLDetail={getLinkFormLDetail}
                                linkFormList={linkFormList}
                                linkFormDetail={linkFormDetail}
                                setExternalId={setExternalId}
                                params={getLinkerParams(id)}
                                currentFormData={currentFormData}
                                dataLinker={dataLinker}
                                onChange={this.props.onChange}
                                setDataLinker={this.setDataLinker} />
                    }
                </Modal> :
                <DataLinkerResourceModal
                    fid={id}
                    params={getLinkerParams(id)}
                    autoFill={autoFill}
                    currentFormData={currentFormData}
                    simpleMode='group'
                    width={800}
                    showModal={showModal}
                    addEx={this.props.addEx}
                    setExternalId={setExternalId}
                    hideModal={this.hideModal}
                    currentTitile={currentTitile}
                    thirdPartyList={thirdPartyList}
                    dataLinker={dataLinker}
                    setDataLinker={this.props.setDataLinker}
                    getLinkFormLDetail={getLinkFormLDetail} />
            }
        </React.Fragment>;
    }
}

// export default DefaultValue;
export default {
    Component: AddDefaultValue,
    getProps: (props) => {
        let {
            dataLinker, disabled, name, type, id, currentFormData, foreignFormData,
            linkFormDetail, linkFormList, getLinkFormLDetail, formTemplateVersionId,
            onChange, setDataLinker, buildFormDataFilter, getLinkerParams, valueType,
            setGroupItemValue, AddShowType, groupValues, thirdPartyList, setExternalId,
            autoFill
        } = props;
        return {
            dataLinker,
            disabled,
            name,
            type,
            id,
            currentFormData,
            foreignFormData,
            linkFormDetail,
            linkFormList,
            getLinkFormLDetail,
            formTemplateVersionId,
            onChange,
            setDataLinker,
            buildFormDataFilter,
            getLinkerParams,
            valueType,
            setGroupItemValue,
            AddShowType,
            groupValues,
            thirdPartyList,
            setExternalId,
            autoFill
        };
    }
};
