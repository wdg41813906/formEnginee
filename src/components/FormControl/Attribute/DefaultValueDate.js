import React from 'react'
import { Button, Select, Modal, message, DatePicker } from 'antd';
import Attribute from './Attribute.js';
import FormulaEditor from '../FormulaEditor/FormulaEditor';
import DataLinkerEditor from '../DataLinker/DataLinkerEditor'
import { LINKTYPE, funcFix, initLinker, getLinker } from '../DataLinker/DataLinker';

@Attribute('默认值')
class DefaultValueDate extends React.Component {
    constructor(props) {
        super(props);
        let dataLinker = getLinker(props.dataLinker, a => a.linkType < 4);
        this.state = {
            showModal: false,
            width: 500,
            foreignKeys: null,
            id: props.id,
            now: dataLinker.linkType === LINKTYPE.DefaultValue && dataLinker.useFormula,
            dataLinker
        };
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
        let dataLinker;
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
            case 'now':
                e = LINKTYPE.DefaultValue
                param = this.props.DateType === 'Date' ? 'TODAY()' : 'TODAY(true)';
                dataLinker = true;
                this.setState({ now: true })
                break;
            default:
                break;
        }
        this.props.setDataLinker(initLinker(e, param, dataLinker));
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        let linker = getLinker(nextProps.dataLinker, a => a.linkType < 4);
        if (prevState.id !== nextProps.id ||
            prevState.dataLinker.linkType !== linker.linkType ||
            linker.linkType === LINKTYPE.DefaultValue) {
            return {
                dataLinker: linker,
                id: nextProps.id,
                now: linker.linkType === LINKTYPE.DefaultValue && linker.useFormula,
            }
        }
        return null;
    }
    SetDefaultValue(e) {
        let { dateFormat } = this.props;
        let value = e.format(dateFormat);
        this.props.setDataLinker(initLinker(LINKTYPE.DefaultValue, new Date(value)));
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
        let { name, id, linkFormList, linkFormDetail, currentFormData, formTemplateVersionId,
            getLinkFormLDetail, foreignFormData, valueType, DateType,showTime,dateFormat } = this.props;
        let current, currentTitile;
        let dataLinker = this.state.dataLinker;
        //let dataLinker = getLinker(this.props.dataLinker, a => a.linkType < 4);
        switch (dataLinker.linkType) {
            case LINKTYPE.DefaultValue:
                current = this.state.now ? null : <DatePicker style={{ width: "100%" }} showTime={{ format: showTime }}
                    format={dateFormat}
                    onChange={e => this.SetDefaultValue(e)} />;
                break;
            case LINKTYPE.Linker:
                current = <Button style={{ width: "100%" }} onClick={this.showModal}>数据联动设置</Button>
                currentTitile = '数据联动设置';
                break;
            case LINKTYPE.Formula:
                current = <Button style={{ width: "100%" }} onClick={this.showModal}>编辑公式</Button>
                currentTitile = '编辑公式';
                break;
            default:
                break;
        }
        return <React.Fragment>
            <Select getPopupContainer={() => document.getElementById('KJSX')} value={this.state.now ? 'now' : dataLinker.linkType}
                style={{ width: "100%", marginBottom: 10 }} onChange={e => this.SetModeChange(e)}>
                <Select.Option value={LINKTYPE.DefaultValue}>自定义</Select.Option>
                <Select.Option value={'now'}>当天</Select.Option>
                <Select.Option value={LINKTYPE.Linker}>数据联动</Select.Option>
                <Select.Option value={LINKTYPE.Formula}>公式编辑</Select.Option>
            </Select>
            {current}
            <Modal maskClosable={false} centered title={currentTitile}
                visible={this.state.showModal} onOk={this.setFormular}
                //width={this.state.width}
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
                            currentFormData={currentFormData}
                        />
                        :
                        <DataLinkerEditor
                            fid={id}
                            autoFill={true}
                            getLinkFormLDetail={getLinkFormLDetail}
                            linkFormList={linkFormList}
                            linkFormDetail={linkFormDetail}
                            params={[{ id, name, valueType }]}
                            currentFormData={currentFormData}
                            dataLinker={dataLinker}
                            onChange={this.props.onChange}
                            setDataLinker={this.setDataLinker}
                        />
                }
            </Modal>
        </React.Fragment>;
    }
}
// export default DefaultValue;
export default {
    Component: DefaultValueDate,
    getProps: (props) => {
        let { DateType,showTime,dateFormat, dataLinker, disabled, name, type, id, currentFormData, foreignFormData,
            linkFormDetail, linkFormList, getLinkFormLDetail, formTemplateVersionId,
            onChange, setDataLinker, buildFormDataFilter, getLinkerParams, valueType } = props;
        return {
            DateType,showTime,dateFormat, dataLinker, disabled, name, type, id, currentFormData, foreignFormData,
            linkFormDetail, linkFormList, getLinkFormLDetail, formTemplateVersionId,
            onChange, setDataLinker, buildFormDataFilter, getLinkerParams, valueType
        };
    }
};
