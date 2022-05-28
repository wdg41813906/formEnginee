import React from 'react'
import { Button, Select, Modal, message } from 'antd';
import Attribute from './Attribute.js';
import DataLinkerEditor from '../DataLinker/DataLinkerEditor'
import DataLinkerResourceModal from '../DataLinker/DataLinkerResourceModal'
import { LINKTYPE, initLinker, getLinker } from '../DataLinker/DataLinker';
import DropDownItem from './DropDownItem/DropDownItem';
import { RelatedCondition } from '../Attribute/RelationTable';
import com from '../../../utils/com';

@Attribute('选项')
class DefaultValueDownList extends React.Component {
    constructor(props) {
        super(props);
        let linkType = LINKTYPE.External;
        let dataLinker = props.dataLinker.find(a => a.linkType < 6 && a.linkType > 2);
        if (dataLinker)
            linkType = dataLinker.linkType;
        else if (!props.isSubTable)
            dataLinker = initLinker(linkType.External);
        else {
            linkType = "empty";
        }
        this.state = {
            showModal: false,
            //foreignKeys: null,
            //dataType: null,
            dataLinker,
            linkType,
            freshFlag: true,
            formTemplateList: [],
            linkFormDetailResource: []
        };
        this.SetModeChange = this.SetModeChange.bind(this);
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.setFormular = this.setFormular.bind(this);
        this.initFormula = this.initFormula.bind(this);
        this.setDataLinker = this.setDataLinker.bind(this);
    }


    componentDidMount() {
        let exist = this.props.dataLinker.find(a => a.linkType === LINKTYPE.Request);
        if (exist) {
            this.setState({ linkFormDetailResource: exist.resourceFields || [] });
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let linker = getLinker(nextProps.dataLinker, a => a.linkType < 6 && a.linkType > 1);
        if (prevState.id !== nextProps.id ||
            prevState.dataLinker.linkType !== linker.linkType ||
            linker.linkType === LINKTYPE.DefaultValue) {
            return {
                dataLinker: linker,
                id: nextProps.id,
                linkType: linker.linkType
            }
        }
        return null;
    }
    clearConditionList = () => {
        this.props.onChange({ conditionList: null })
        this.setState({ freshFlag: !this.state.freshFlag })
    }

    SetModeChange(e) {
        let param;
        switch (e) {
            case LINKTYPE.Linker:
                param = true;
                this.props.onChange({ dropdownList: [] });
                break;
            case LINKTYPE.External:
                break;
            case LINKTYPE.Request:
                param = true;
                this.props.onChange({ dropdownList: [] });
                break;
            default:
                if (this.props.dropdownList.length === 0) {
                    this.props.onChange({
                        dropdownList:
                            [
                                { name: '选项1', value: com.Guid() },
                                { name: '选项2', value: com.Guid() },
                                { name: '选项3', value: com.Guid() }
                            ]
                    });
                }
                break;
        }
        this.props.setDataLinker(initLinker(e, param));
        this.clearConditionList();
    }

    showModal() {
        const { dataLinker } = this.state;
        switch (dataLinker.linkType) {
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
        let foreignKey = this.state.dataLinker.foreignKeys[0];
        if (foreignKey && foreignKey.foreignFormId &&
            (this.state.dataLinker.linkType === LINKTYPE.External || (
                foreignKey.formVersionHistoryId &&
                foreignKey.foreignHistoryId)) &&
            foreignKey.displayVersionHistoryId) {
            this.props.setDataLinker(this.state.dataLinker);
            this.setState({
                showModal: false
            });
        } else {
            message.error('请选择完所有选项');
        }
    }
    setFormDetailResource = (linkFormDetailResource) => {
        this.setState({ linkFormDetailResource })
    }

    setFormForeignKey = (foreignKeys) => {
        this.setState({ foreignKeys })
    }

    setDataLinker(dataLinker) {
        this.setState({ dataLinker })
    }

    render() {
        let {
            type, id, name, linkFormList, linkFormDetail, dropdownList, disabled, groupValues, onChange,
            getLinkFormLDetail, currentFormData, setExternalId, getLinkerParams,
            setGroupItemDataLinker, removeGroupItemDataLinker, autoFill, thirdPartyList, setDataLinker
            //,FormName, FormId, formTemplateVersionId, name
        } = this.props;
        let { showModal, dataLinker, formTemplateList, linkType, linkFormDetailResource } = this.state;
        let formList = formTemplateList.filter(item => item.formTemplateVersionId !== this.props.formTemplateVersionId);
        let RelatedConditionAttr = {
            currentFormData,
            formTemplateList: formList,
            freshFlag: this.state.freshFlag,
            linkFormDetail: linkType === LINKTYPE.External ? linkFormDetail : linkFormDetailResource
        };
        let current, currentTitile;
        //let self = { name, type, id, FormName, FormId };
        let params = getLinkerParams(id);
        switch (dataLinker.linkType) {
            case LINKTYPE.DefaultValue:
                current = (
                    <DropDownItem type={type} dropdownList={dropdownList} disabled={disabled}
                        groupValues={groupValues} setGroupItemDataLinker={setGroupItemDataLinker}
                        removeGroupItemDataLinker={removeGroupItemDataLinker}
                        thirdPartyList={thirdPartyList} onChange={onChange} id={id} name={name}
                    />
                )
                currentTitile = '自定义';
                break;
            case LINKTYPE.Linker:
                current = <Button style={{ width: "100%" }} onClick={this.showModal}>数据联动设置</Button>
                currentTitile = '数据联动设置';
                break;
            case LINKTYPE.External:
                current = <Button style={{ width: "100%" }} onClick={this.showModal}>关联其他表单数据</Button>
                currentTitile = '关联其他表单数据';
                break;
            case LINKTYPE.Request:
                current = <React.Fragment>
                    <Button style={{ width: "100%" }} onClick={this.showModal}>
                        {dataLinker.request.id ? thirdPartyList.filter(item => item.id === dataLinker.request.id)[0].name : '关联第三方数据'}
                    </Button>
                    <RelatedCondition key='condition' {...this.props} {...RelatedConditionAttr} linkType={this.state.linkType} />
                </React.Fragment>;
                currentTitile = '关联第三方数据';
                break;
            default:
                break;
        }
        return (
            <React.Fragment>
                <Select getPopupContainer={() => document.getElementById('KJSX')} value={dataLinker.linkType}
                    style={{ width: "100%", marginBottom: 10 }} onChange={this.SetModeChange}>
                    <Select.Option value={LINKTYPE.DefaultValue}>自定义</Select.Option>
                    <Select.Option value={LINKTYPE.Linker}>数据联动</Select.Option>
                    <Select.Option value={LINKTYPE.External}>关联其他表单数据</Select.Option>
                    <Select.Option value={LINKTYPE.Request}>关联第三方数据</Select.Option>
                </Select>
                {current}
                {dataLinker.linkType < LINKTYPE.Request ?
                    <Modal maskClosable={false} centered={true} title={currentTitile} visible={showModal}
                        onOk={this.setFormular} width={500} onCancel={this.hideModal}>
                        <DataLinkerEditor fid={id} autoFill={autoFill}
                            getLinkFormLDetail={getLinkFormLDetail} linkFormList={linkFormList}
                            linkFormDetail={linkFormDetail} setExternalId={setExternalId}
                            params={params} currentFormData={currentFormData}
                            dataLinker={dataLinker} setDataLinker={this.setDataLinker} />
                    </Modal> : <DataLinkerResourceModal
                        fid={id}
                        params={params}
                        autoFill={autoFill}
                        currentFormData={currentFormData}
                        simpleMode='group'
                        width={800}
                        showModal={showModal}
                        setExternalId={setExternalId}
                        clearConditionList={this.clearConditionList}
                        hideModal={this.hideModal}
                        currentTitile={currentTitile}
                        thirdPartyList={thirdPartyList}
                        dataLinker={dataLinker}
                        setDataLinker={setDataLinker}
                        setFormDetailResource={this.setFormDetailResource}
                        getLinkFormLDetail={getLinkFormLDetail}
                        onChange={onChange}
                        setGroupItemDataLinker={setGroupItemDataLinker} />}
            </React.Fragment>
        )
    }
}

// export default DefaultValueDownList;
export default {
    Component: DefaultValueDownList,
    getProps: (props) => {
        let {
            dataLinker, name, type, disabled, id, linkFormDetail, buildFormDataFilter, groupItems, dropdownList, getLinkerParams, setExternalId, autoFill, conditionList,
            getLinkFormLDetail, FormName, FormId, formTemplateVersionId, currentFormData, onChange, setDataLinker, linkFormList, setGroupItemDataLinker, removeGroupItemDataLinker, groupValues, thirdPartyList
        } = props;
        return {
            autoFill,
            dataLinker,
            conditionList,
            name,
            type,
            disabled,
            id,
            linkFormDetail,
            buildFormDataFilter,
            groupItems,
            dropdownList,
            getLinkerParams,
            setExternalId,
            getLinkFormLDetail,
            FormName,
            FormId,
            formTemplateVersionId,
            currentFormData,
            onChange,
            setDataLinker,
            linkFormList,
            setGroupItemDataLinker,
            removeGroupItemDataLinker,
            groupValues,
            thirdPartyList
        };
    }
};
