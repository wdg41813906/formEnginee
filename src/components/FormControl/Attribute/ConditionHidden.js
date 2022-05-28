import React from "react";
import { Button, Select, Modal, message } from "antd";
import Attribute from "./Attribute.js";
import FormulaEditor from "../FormulaEditor/FormulaEditor";
import { LINKTYPE, funcFix, initLinker, getLinker } from "../DataLinker/DataLinker";

@Attribute("显示")
class ConditionHidden extends React.PureComponent {
    componentDidMount() {
    }

    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        };
        this.SetModeChange = this.SetModeChange.bind(this);
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.setFormular = this.setFormular.bind(this);
        this.initFormula = this.initFormula.bind(this);
    }

    SetModeChange(e) {
        let v = null;
        switch (e) {
            case "true":
                v = true;
                this.props.setHidden(true);
                this.props.removeDataLinker(a => a.linkType === 8);
                break;
            case "false":
                v = false;
                this.props.removeDataLinker(a => a.linkType === 8);
                this.props.setHidden(false);
                break;
            default:
                v = false;
                this.props.setHidden(false);
                this.props.setDataLinker(initLinker(LINKTYPE.Display));
                break;
        }
        this.props.onChange({ hidden: v });
    }

    showModal() {
        this.props.buildFormDataFilter("display");
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
        let value = this.state.editor.getValue();
        let fixValue = funcFix(value);
        this.state.editor.setValue(fixValue);
        this.props.setDataLinker(initLinker(LINKTYPE.Display, fixValue));
        this.setState({
            showModal: false
        });
    }

    render() {
        //console.log('ConditionHidden render', this.props)
        let { dataLinker, authority, id, currentFormData, foreignFormData, formTemplateVersionId, linkFormList } = this.props;
        let current, currentTitile, linker = getLinker(dataLinker, a => a.linkType === 8);
        let value;
        if (linker.linkType !== LINKTYPE.DefaultValue) {
            //linker = initLinker(LINKTYPE.Display);
            value = "condition";
            current = <Button style={{ width: "100%" }} onClick={this.showModal}>设置显示条件</Button>;
            currentTitile = "条件显示";
        }
        else {
            value = (authority.hidden.itemBase || false).toString();
        }
        return <React.Fragment>
            <Select getPopupContainer={() => document.getElementById("KJSX")} value={value}
                style={{ width: "100%", marginBottom: 10 }} onChange={this.SetModeChange}>
                <Select.Option value={"false"}>可见</Select.Option>
                <Select.Option value={"true"}>隐藏</Select.Option>
                <Select.Option value={"condition"}>条件显示</Select.Option>
            </Select>
            {current}
            <Modal
                maskClosable={false}
                centered={true}
                title={currentTitile}
                width={800}
                bodyStyle={{ height: 520 }}
                visible={this.state.showModal}
                onOk={this.setFormular}
                onCancel={this.hideModal}>
                <FormulaEditor
                    fid={id}
                    value={linker.expression}
                    relations={linker.relations}
                    relationTables={linker.relationTables}
                    foreignData={linker.foreignData}
                    foreignRelations={linker.foreignRelations}
                    init={this.initFormula}
                    formTemplateVersionId={formTemplateVersionId}
                    foreignFormData={foreignFormData}
                    foreignForm={linkFormList}
                    currentFormData={currentFormData}
                    hideAllForm={true}
                />
            </Modal>
        </React.Fragment>;
    }
}

// export default ConditionHidden
export default {
    Component: ConditionHidden,
    getProps: (props) => {
        let {
            dataLinker, hidden, id, currentFormData, onChange, buildFormDataFilter, foreignFormData, linkFormList, removeDataLinker,
            setDataLinker, setDisabled, setHidden, getDisabled, getHidden, formTemplateVersionId, authority
        } = props;
        return {
            dataLinker,
            hidden,
            id,
            currentFormData,
            onChange,
            buildFormDataFilter,
            foreignFormData,
            linkFormList,
            removeDataLinker,
            setDataLinker,
            setDisabled,
            setHidden,
            getDisabled,
            getHidden,
            formTemplateVersionId,
            authority
        };
    }
};