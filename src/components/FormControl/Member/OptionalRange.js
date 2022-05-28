import React from "react";
import { Button, Select, Modal, Radio, message } from "antd";
import Attribute from "../Attribute/Attribute";
import DataLinkerEditor from "../DataLinker/DataLinkerEditor";
import FilterPart from "../../BookAddress/MemberCom/FilterPart";
import { getLinker, initLinker, LINKTYPE } from "../DataLinker/DataLinker";


const RadioGroup = Radio.Group;

@Attribute("可选范围")
class OptionalRange extends React.Component {
    componentDidMount() {
        this.props.buildFormDataFilter("department");
    }

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            width: 500,
            FormForeignKey: null
        };
        this.SetModeChange = this.SetModeChange.bind(this);
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.setData = this.setData.bind(this);
    }


    //自定义
    controlFilter = (e) => {
        this.setState({ showModal: !this.state.showModal });
    };
    confirmSubmit = (data) => {
        console.log(data);
        this.props.onChange({ optionalRange: { type: 1, value: data } });
    };

    //部门联动
    SetModeChange(e) {
        this.props.onChange({ optionalRange: { type: e, value: null } });
        if (Number(e) === 2) {
            this.props.buildFormDataFilter("department");
        }
        else {
            this.props.removeDataLinker(a => a.linkType === LINKTYPE.Formula || a.linkType === LINKTYPE.Clearn || a.linkType === LINKTYPE.Linker);
            if (Number(e) === 3)
                this.props.setDataLinker(initLinker(LINKTYPE.Linker));
        }
    }

    setData(type, val) {
        //console.log(type, val);
        this.props.setDataLinker(initLinker(LINKTYPE.Formula, `\u2800${val}\u2800`));
        let rel = [];
        for (let key in this.props.groupItems) {
            rel.push(this.props.groupItems[key].id);
        }
        this.props.setDataLinker(initLinker(LINKTYPE.Clearn, val, rel));
        this.props.onChange({ optionalRange: { type, value: val } });
    }
    setFormular = () => {
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

    showModal() {
        this.setState({ showModal: true });
    }

    hideModal() {
        this.setState({ showModal: false });
    }

    render() {
        // console.log('OptionalRange render', this.props)
        let { dataLinker, optionalRange, currentFormData, name, type, id, FormName, FormId, getLinkFormLDetail, formTemplateVersionId, selectMode,
            linkFormList, linkFormDetail, setExternalId, setDataLinker, getLinkerParams } = this.props;
        let { showModal } = this.state;
        console.log("linker 9");
        let current, currentTitile, linker = getLinker(dataLinker, a => a.linkType < 7 && a.linkType !== 1);
        let singleOrMultiple = selectMode === "solo" ? 0 : 1;
        let idList = optionalRange.value ? optionalRange.value : [];
        let filterPartProps = {
            controlFilterPart: {
                isShowModal: showModal,
                showFilterArr:
                    type === "Member" ?
                        [
                            { type: 0, name: "部门", isTree: false },
                            { type: 1, name: "职责", isTree: false }
                            // { type: 2, name: "成员", isTree: true },
                        ]
                        :
                        [
                            { type: 0, name: "部门", isTree: false }
                        ],
                selectedData: idList,
                headerTitle: "部门列表",
                singleOrMultiple: 1//0 为 单选，1 为 多选
            },
            controlFilter: this.controlFilter,
            confirmSubmit: this.confirmSubmit
        };
        let self = { name, type, id, FormName, FormId };
        const radioStyle = {
            display: "block",
            height: "30px",
            lineHeight: "30px"
        };

        switch (optionalRange.type) {
            case 1:
                current = <Button style={{ width: "100%" }} onClick={this.showModal}>设置</Button>;
                currentTitile = "自定义";
                break;
            case 2:
                // current = <Button style={{ width: "100%" }} onClick={this.showModal}>数据联动设置</Button>
                // currentTitile = '数据联动设置';
                break;
            case 3:
                // current = <Button style={{ width: "100%" }} onClick={this.showModal}>数据联动设置</Button>;
                // currentTitile = "数据联动设置";
                break;
            default:
                break;
        }
        return (<div>
            <Select getPopupContainer={() => document.getElementById("KJSX")} value={optionalRange.type}
                style={{ width: "100%", marginBottom: "5px" }} onChange={e => this.SetModeChange(e)}>
                <Select.Option value={1}>自定义</Select.Option>
                {
                    type === "Member" ?
                        <Select.Option value={2}>由部门字段确定</Select.Option>//成员
                        :null
                        //<Select.Option value={3}>数据联动</Select.Option>//部门
                }
            </Select>
            {current}
            {
                optionalRange.type === 1 ?//自定义
                    showModal ? <FilterPart {...filterPartProps} /> : null
                    :
                    optionalRange.type === 2 ?//由部门字段确定
                        currentFormData.length > 0 ?
                            <RadioGroup onChange={(e) => {
                                this.setData(2, e.target.value);
                            }} value={optionalRange.value}>
                                {
                                    currentFormData.map((e, i) => {
                                        return (
                                            <Radio value={e.id} key={e.id} style={radioStyle}>{e.name}</Radio>
                                        );
                                    })
                                }
                            </RadioGroup>
                            :
                            <p style={{ textAlign: "center", color: "#999", margin: 0 }}>表单中没有部门字段</p>
                        ://数据联动
                        <Modal maskClosable={false} title={currentTitile} visible={this.state.showModal}
                            onOk={this.setFormular} width={this.state.width} onCancel={this.hideModal}>
                            {/* <DataLinkerEditor
                                getLinkFormLDetail={getLinkFormLDetail}
                                setFormForeignKey={this.setFormForeignKey}
                                formTemplateVersionId={formTemplateVersionId}
                                // linkFormDetail={linkFormDetail}
                                self={self}
                                fid={id}
                                currentFormData={this.props.currentFormData}
                                // dataLinker={optionalRange.value}
                                dataLinker={linker}
                            /> */}

                            <DataLinkerEditor
                                fid={id}
                                autoFill={false}
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
        </div>);
    }
}

export default OptionalRange;

