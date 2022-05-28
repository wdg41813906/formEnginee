import React from 'react'
import { Input, InputNumber, Button, Select, Modal, message } from 'antd';
import Attribute from './Attribute.js';
import FormulaEditor from '../FormulaEditor/FormulaEditor';
import DataLinkerEditor from '../DataLinker/DataLinkerEditor'
import { LINKTYPE, funcFix, initLinker, getLinker } from '../DataLinker/DataLinker';
import DataLinkerResourceModal from '../DataLinker/DataLinkerResourceModal.js';

@Attribute('默认值')
class DefaultValue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            width: 500,
            foreignKeys: null,
            id: props.id,
            dataLinker: getLinker(props.dataLinker, a => a.linkType < 5)
        };
        //console.log(props.dataLinker)
        this.SetDefaultValue = this.SetDefaultValue.bind(this);
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
            case LINKTYPE.Request:
            case LINKTYPE.Linker:
                param = true;
                this.setState({ width: 500 })
                break;
            case LINKTYPE.Formula:
                this.setState({ width: 800 })
                break;

            default:
                break;
        }
        this.props.setDataLinker(initLinker(e, param));
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let linker = getLinker(nextProps.dataLinker, a => a.linkType < 5);
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

    SetDefaultValue(e) {
        this.props.setDataLinker(initLinker(LINKTYPE.DefaultValue, (this.props.type === 'Number' ? e : e.target.value)));
    }

    showModal() {
        const { dataLinker } = this.state;
        switch (dataLinker.linkType) {
            case LINKTYPE.Formula:
                this.props.buildFormDataFilter('formula');
                break;
            case LINKTYPE.Linker:
                this.props.buildFormDataFilter('linker');
                break;
            case LINKTYPE.Request:
                this.props.buildFormDataFilter('request');
                break;
        }
        this.setState({
            showModal: true,
            dataLinker: getLinker(this.props.dataLinker, a => a.linkType < 5)
        });

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
        //console.log('DefaultValue render', this.props);
        let dataLinker = this.state.dataLinker;
        let {
            disabled, name, id, linkFormList, linkFormDetail, currentFormData,
            getLinkFormLDetail, foreignFormData, valueType, formTemplateVersionId,
            thirdPartyList, setExternalId, onChange
        } = this.props;
        let current, currentTitile;
        let modalContent = null;
        //let dataLinker = getLinker(this.props.dataLinker, a => a.linkType < 4);
        switch (dataLinker.linkType) {
            case LINKTYPE.DefaultValue:
                current = this.props.type === 'Number' ?
                    <InputNumber disabled={disabled} value={dataLinker.linkValue}
                        style={{ resize: "none", width: '100%' }}
                        onChange={this.SetDefaultValue} /> :
                    <Input disabled={disabled} value={dataLinker.linkValue} style={{ resize: "none" }}
                        onChange={this.SetDefaultValue} />
                break;
            case LINKTYPE.Linker:
                current = <Button style={{ width: "100%" }} onClick={this.showModal}>数据联动设置</Button>
                currentTitile = '数据联动设置';
                modalContent = <DataLinkerEditor
                    fid={id}
                    autoFill={true}
                    getLinkFormLDetail={getLinkFormLDetail}
                    linkFormList={linkFormList}
                    linkFormDetail={linkFormDetail}
                    params={[{ id, name, valueType }]}
                    currentFormData={currentFormData}
                    dataLinker={dataLinker}
                    onChange={onChange}
                    formTemplateVersionId={this.props.formTemplateVersionId}
                    setDataLinker={this.setDataLinker}
                />
                break;
            case LINKTYPE.Request:
                current = <Button style={{ width: "100%" }} onClick={this.showModal}>关联第三方数据源</Button>
                currentTitile = '关联第三方数据源设置';
                break;
            case LINKTYPE.Formula:
                current = <Button style={{ width: "100%" }} onClick={this.showModal}>编辑公式</Button>
                currentTitile = '编辑公式';
                modalContent = <FormulaEditor fid={id}
                    value={dataLinker.expression}
                    relations={dataLinker.relations}
                    relationTables={dataLinker.relationTables}
                    foreignData={dataLinker.foreignData}
                    foreignRelations={dataLinker.foreignRelations}
                    init={this.initFormula}
                    formTemplateVersionId={formTemplateVersionId}
                    foreignFormData={foreignFormData}
                    foreignForm={linkFormList}
                    currentFormData={currentFormData}
                />;
                break;
            default:
                break;
        }
        return <React.Fragment>
            <Select getPopupContainer={() => document.getElementById('KJSX')} value={dataLinker.linkType}
                style={{ width: "100%", marginBottom: 10 }} onChange={e => this.SetModeChange(e)}>
                <Select.Option value={LINKTYPE.DefaultValue}>自定义</Select.Option>
                <Select.Option value={LINKTYPE.Linker}>数据联动</Select.Option>
                <Select.Option value={LINKTYPE.Request}>关联第三方数据源</Select.Option>
                <Select.Option value={LINKTYPE.Formula}>公式编辑</Select.Option>
            </Select>
            {current}
            {dataLinker.linkType < LINKTYPE.Request ?
                <Modal maskClosable={false} centered title={currentTitile}
                    visible={this.state.showModal} onOk={this.setFormular}
                    //width={this.state.width}
                    destroyOnClose={true}
                    width={800}
                    bodyStyle={{ height: 520 }}
                    onCancel={this.hideModal}>
                    {
                        modalContent
                    }
                </Modal> :
                <DataLinkerResourceModal
                    fid={id}
                    params={[{
                        id,
                        name,
                        valueType
                    }]}
                    autoFill={true}
                    currentFormData={currentFormData}
                    simpleMode='item'
                    width={800}
                    showModal={this.state.showModal}
                    onChange={onChange}
                    setExternalId={setExternalId}
                    addEx={this.props.addEx}
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
    Component: DefaultValue,
    getProps: (props) => {
        let {
            dataLinker, disabled, name, type, id, currentFormData, foreignFormData,
            linkFormDetail, linkFormList, getLinkFormLDetail, formTemplateVersionId,
            onChange, setDataLinker, buildFormDataFilter, valueType,
            thirdPartyList, setExternalId
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
            valueType,
            thirdPartyList,
            setExternalId
        };
    }
};
