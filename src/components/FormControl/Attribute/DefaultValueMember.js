import React from "react";
import { Button, Select, Modal, message } from "antd";
import Attribute from "./Attribute.js";
import DataLinkerEditor from "../DataLinker/DataLinkerEditor";
import { LINKTYPE, initLinker, getLinker } from "../DataLinker/DataLinker";
import FilterPart from "../../BookAddress/MemberCom/FilterPart";
import DefaultUserMess from "../../../enums/DefaultUserMess";
import EnvironmentType from "../../../enums/EnvironmentType.js";


@Attribute("默认值")
class DefaultValueMember extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            width: 500,
            FormForeignKey: null
        };
        this.SetDefaultValue = this.SetDefaultValue.bind(this);
        this.SetModeChange = this.SetModeChange.bind(this);
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.setFormular = this.setFormular.bind(this);
        this.initFormula = this.initFormula.bind(this);
        this.setDataLinkerData = this.setDataLinkerData.bind(this);
        this.setEnvironmentValue = this.setEnvironmentValue.bind(this);
    }

    setEnvironmentValue(val) {
        switch (val) {
            case EnvironmentType.currentUserName:
                this.props.setGroupItemDataLinker("value", initLinker(LINKTYPE.Environment, EnvironmentType.currentUserId, true));
                this.props.setGroupItemDataLinker("name", initLinker(LINKTYPE.Environment, EnvironmentType.currentUserName, true));
                break;
            case EnvironmentType.currentOrgName:
                this.props.setGroupItemDataLinker("value", initLinker(LINKTYPE.Environment, EnvironmentType.currentOrgId, true));
                this.props.setGroupItemDataLinker("name", initLinker(LINKTYPE.Environment, EnvironmentType.currentOrgName, true));
                break;
            case EnvironmentType.currentDeptName:
                this.props.setGroupItemDataLinker("value", initLinker(LINKTYPE.Environment, EnvironmentType.currentDeptId, true));
                this.props.setGroupItemDataLinker("name", initLinker(LINKTYPE.Environment, EnvironmentType.currentDeptName, true));
                break;
        }
        this.props.onChange({ environmentValue: val })
    }

    SetModeChange(e) {
        switch (e) {
            case LINKTYPE.DefaultValue:
                this.props.removeDataLinker(a => a.linkType === LINKTYPE.Environment);
                break;
            case LINKTYPE.Linker:
                this.setState({ width: 500 });
                this.props.removeDataLinker(a => a.linkType === LINKTYPE.Environment);
                break;
            case LINKTYPE.Environment:
                this.props.removeDataLinker(a => a.linkType === LINKTYPE.Linker || a.linkType === LINKTYPE.DefaultValue);
                break;
            default:
                break;
        }
        if (e !== LINKTYPE.Environment) {
            this.props.removeGroupItemDataLinker("value");
            this.props.removeGroupItemDataLinker("name");
            this.props.onChange({ environmentValue: null })
        }
        this.props.setDataLinker(initLinker(e));
    }

    SetDefaultValue(e) {
        this.props.setDataLinker(initLinker(LINKTYPE.DefaultValue, e.target.value));
        this.props.onChange({ value: e.target.value });
    }

    showModal() {
        let { dataLinker } = this.props;
        dataLinker = getLinker(dataLinker, a => a.linkType < 4);
        switch (dataLinker.linkType) {
            case LINKTYPE.Resource:
                //this.props.buildFormDataFilter('r');
                break;
            case LINKTYPE.Linker:
                this.props.buildFormDataFilter("linker");
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
        let { dataLinker } = this.props;
        dataLinker = getLinker(dataLinker, a => a.linkType < 4);
        let foreignKey = dataLinker.foreignKeys[0];
        if (foreignKey && foreignKey.foreignFormId &&
            (dataLinker.linkType === LINKTYPE.Linker || (
                foreignKey.formVersionHistoryId &&
                foreignKey.foreignHistoryId)) &&
            foreignKey.displayVersionHistoryId) {
            this.props.setDataLinker(dataLinker);
            this.setState({
                showModal: false
            });
        } else {
            message.error("请选择完所有选项");
        }
    }

    setFormForeignKey = (FormForeignKey) => {
        this.setState({ FormForeignKey });
    };

    setDataLinkerData() {
        if (!this.state.FormForeignKey) {
            message.error("请选择完所有选项");
        } else {
            let FormForeignKey = this.state.FormForeignKey;
            let { source, field_relat, field_show, formType_relat, formType_show, primaryKey_show, primaryKey_relat, ...other } = foreignKeys;
            let expression = [{
                source,
                type: "data",
                condition: [{
                    formType: formType_relat,
                    primaryKey: primaryKey_relat,
                    where: [{
                        targetId: FormForeignKey.FormVersionHistoryId,
                        relationId: FormForeignKey.ForeignHistoryId,
                        field: field_relat
                    }]
                }],
                display: [{
                    formType: formType_show,
                    list: [{
                        field: field_show,
                        id: FormForeignKey.DisplayVersionHistoryId
                    }],
                    primaryKey: primaryKey_show
                }]
            }];
            this.props.setDataLinker({
                foreignKeys: other,
                expression,
                autoFill: this.props.autoFill,
                linkType: LINKTYPE.Linker,
                relations: [FormForeignKey.FormVersionHistoryId]
            });
            this.setState({
                showModal: false
            });
        }
    }

    setData(data) {
        this.props.onChange({ ...data });
    }

    controlFilter = (e) => {
        this.setState({ showModal: !this.state.showModal });
    };
    confirmSubmit = (data) => {
        this.props.setGroupItemDataLinker("value", initLinker(LINKTYPE.DefaultValue, data.map(item => item.id)));
        this.props.setGroupItemDataLinker("name", initLinker(LINKTYPE.DefaultValue, data.map(item => item.name)));
    };

    render() {
        console.log(this.props);
        // debugger
        let { dataLinker, setDataLinker, name, type, id, getLinkFormLDetail, currentFormData,
            FormName, FormId, selectMode, optionalRange, groupValues: { name: groupNames, value: valueIds },
            linkFormList, linkFormDetail, setExternalId, getLinkerParams, environmentValue } = this.props;
        groupNames = groupNames || []; //groupNames instanceof Array ? groupNames : (groupNames ? groupNames.split(",") : groupNames), valueIds = valueIds instanceof Array ? valueIds : (valueIds ? valueIds.split(",") : valueIds);
        let value = groupNames.map((item, i) => ({
            name: item,
            id: valueIds[i],
            type: Object.keys(DefaultUserMess).some(d => DefaultUserMess[d] === valueIds[i]) ? -2 : (type === "Member" ? 2 : 0)
        }));
        let { showModal, width } = this.state;
        let singleOrMultiple = selectMode == "solo" ? 0 : 1;
        let idList = optionalRange.value ? (optionalRange.value instanceof Array) ? optionalRange.value : [optionalRange] : [];
        let showFilterArr = [];
        if (idList.length === 0) {//没有限制
            showFilterArr = type === "Member" ? [
                {
                    type: 0, name: "部门", idList: idList.filter(e => {
                        return e.type == 0;
                    }).map(e => {
                        return e.value || e.id;
                    }), isTree: true
                },
                {
                    type: 1, name: "职责", idList: idList.filter(e => {
                        return e.type == 1;
                    }).map(e => {
                        return e.value || e.id;
                    }), isTree: true
                },
                // { type: 2, name: "成员", idList: idList.filter(e => { return e.type == 2 }).map(e => { return e.id }), isTree: false },
                //{ type: -2, name: "动态参数", idList: [] }
            ] : [
                    {
                        type: 0, name: "部门", idList: idList.filter(e => {
                            return e.type == 0;
                        }).map(e => {
                            return e.value || e.id;
                        }), isTree: false
                    },
                    //{ type: -2, name: "动态参数", idList: [] }
                ];
        } else {
            console.log(type)
            if (idList.filter(e => {
                return e.type === 0;
            }).length > 0) {
                showFilterArr.push(
                    {
                        type: 0, name: "部门", idList: idList.filter(e => {
                            return e.type == 0;
                        }).map(e => {
                            return e.value || e.id;
                        }), isTree: type === "Member"
                    }
                );
            }
            if (idList.filter(e => {
                return e.type == 1;
            }).length > 0) {
                showFilterArr = showFilterArr.concat(
                    {
                        type: 1, name: "职责", idList: idList.filter(e => {
                            return e.type == 1;
                        }).map(e => {
                            return e.value || e.id;
                        }), isTree: true
                    },
                );
            }
            if (idList.filter(e => {
                return e.type === 2;
            }).length > 0) {
                showFilterArr.filter(e => {
                    return e.type == 2;
                }).length === 0 && showFilterArr.push(
                    {
                        type: 2, name: "成员", idList: idList.filter(e => {
                            return e.type == 2;
                        }).map(e => {
                            return e.value || e.id;
                        }), isTree: false
                    }
                );
            }
            //showFilterArr.push({ type: -2, name: "动态参数", idList: [] });
        }
        console.log(singleOrMultiple);
        let filterPartProps = {
            type: "default",
            defaultType: type,
            controlFilterPart: {
                isShowModal: showModal,
                showFilterArr,
                selectedData: value && value != "''" ? value : [],
                headerTitle: type === "Member" ? "成员列表" : "部门列表",
                singleOrMultiple//0 为 单选，1 为 多选
            },
            controlFilter: this.controlFilter,
            confirmSubmit: this.confirmSubmit
        };
        //console.log('linker 7');
        let current, currentTitile, linker = getLinker(dataLinker, a => a.linkType < 7 && a.linkType !== 1);
        //let self = { name, type, id, FormName, FormId };

        switch (linker.linkType) {
            case LINKTYPE.DefaultValue:
                current = <Button style={{ width: "100%" }} onClick={() => {
                    this.controlFilter(true);
                }}>设置</Button>;
                currentTitile = "自定义";
                break;
            case LINKTYPE.Environment:
                current = <Select style={{ width: '100%' }} value={environmentValue} onChange={this.setEnvironmentValue}>{
                    type === 'Member' ?
                        <Select.Option key={EnvironmentType.currentUserName}
                            value={EnvironmentType.currentUserName}>当前用户</Select.Option> :
                        [<Select.Option key={EnvironmentType.currentDeptName}
                            value={EnvironmentType.currentDeptName}>当前用户所在部门</Select.Option>,
                        <Select.Option key={EnvironmentType.currentOrgName}
                            value={EnvironmentType.currentOrgName}>当前用户所在机构</Select.Option>]
                }
                </Select>;
                break;
            case LINKTYPE.Linker:
                current = <Button style={{ width: "100%" }} onClick={this.showModal}>数据联动设置</Button>;
                currentTitile = "数据联动设置";
                break;
            default:
                current = null;
                currentTitile = null;
                break;
        }

        return (
            <React.Fragment>
                <Select getPopupContainer={() => document.getElementById("KJSX")} value={linker.linkType}
                    style={{ width: "100%", marginBottom: 10 }} onChange={e => this.SetModeChange(e)}>
                    <Select.Option value={LINKTYPE.DefaultValue}>自定义</Select.Option>
                    <Select.Option value={LINKTYPE.Environment}>环境变量</Select.Option>
                    <Select.Option value={LINKTYPE.Linker}>数据联动</Select.Option>
                </Select>
                {current}
                {
                    linker.linkType === 0 ?
                        //自定义
                        showModal ? <FilterPart {...filterPartProps} /> : null
                        ://联动
                        <Modal maskClosable={false} title={currentTitile} visible={showModal} onOk={this.setFormular}
                            width={width} onCancel={this.hideModal}>
                            <DataLinkerEditor
                                fid={id}
                                autoFill={true}
                                getLinkFormLDetail={getLinkFormLDetail}
                                linkFormList={linkFormList}
                                linkFormDetail={linkFormDetail}
                                setExternalId={setExternalId}
                                params={getLinkerParams(id)}
                                currentFormData={currentFormData}
                                dataLinker={linker}
                                setDataLinker={setDataLinker}
                            />
                        </Modal>
                }
            </React.Fragment>
        );
    }
}

// export default DefaultValueMember;
export default {
    Component: DefaultValueMember,
    getProps: (props) => {
        //console.log(props);
        let { dataLinker, formTemplateVersionId, name, type, id, getLinkFormLDetail, currentFormData,
            FormName, FormId, selectMode, optionalRange, value, onChange, setDataLinker, removeDataLinker, setGroupItemValue,
            groupValues, setGroupItemDataLinker, linkFormList, linkFormDetail, setExternalId, getLinkerParams,
            buildFormDataFilter, removeGroupItemDataLinker, environmentValue } = props;
        return {
            dataLinker,
            formTemplateVersionId,
            name,
            type,
            id,
            getLinkFormLDetail,
            currentFormData,
            FormName,
            FormId,
            selectMode,
            optionalRange,
            value,
            onChange,
            setDataLinker,
            removeDataLinker,
            setGroupItemValue,
            groupValues,
            setGroupItemDataLinker,
            removeGroupItemDataLinker,
            linkFormList,
            linkFormDetail,
            setExternalId,
            getLinkerParams,
            buildFormDataFilter,
            environmentValue
        };
    }
};
