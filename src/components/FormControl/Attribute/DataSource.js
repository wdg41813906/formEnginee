import React from 'react'
import { Button, Select, Modal, Input, Tree, Spin, Radio } from 'antd';
import Attribute from './Attribute.js'
import DataLinkerResourceModal from '../DataLinker/DataLinkerResourceModal.js';
import { getLinker, LINKTYPE, initLinker } from '../DataLinker/DataLinker.js';
import styles from './DropDownItem/DropDownItem.less';
import { exportJsonData } from '../../../utils/dynamicJson';
import { requestData } from '../../../services/FormBuilder/FormBuilder';
import { methodTypeList } from "../../../utils/DataSourceConfig";
import { RelatedCondition } from '../Attribute/RelationTable';


function appendDataToNode(treeData, nodeData, currentExpandKey) {
    let node = findNode(treeData, currentExpandKey);
    if (node)
        node.children = nodeData;
    else
        treeData = nodeData;
    return treeData;
}

function findNode(treeData, currentExpandKey) {
    let node = treeData.find(a => a.key === currentExpandKey);
    if (node === undefined) {
        let expandList = treeData.filter(a => Array.isArray(a.children));
        for (let expandNode of expandList) {
            node = findNode(expandNode.children, currentExpandKey);
            if (node)
                break;
        }
    }
    return node;
}

function getCheckedTreeData(checkedKeys, treeData) {
    let checkedTree = treeData.filter(a => checkedKeys.includes(a.key));
    let result = [];
    checkedTree.forEach(item => {
        let newItem = { title: item.title, value: item.key, isLeaf: item.isLeaf };
        if (!item.isLeaf && Array.isArray(item.children)) {
            newItem.children = getCheckedTreeData(checkedKeys, item.children);
            if (newItem.children.length === 0)
                item.isLeaf = true;
        }
        if (!Array.isArray(item.children))
            newItem.isLeaf = true;
        result.push(newItem);
    })
    return result;
}

@Attribute('数据源')
class DataSource extends React.Component {
    constructor(props) {
        super(props);
        let linkType = LINKTYPE.External;
        let dataLinker = props.dataLinker.find(a => a.linkType < 6 && a.linkType > 2);
        if (dataLinker)
            linkType = dataLinker.linkType;
        else {
            linkType = "empty";
        }
        this.state = {
            showModal: false,
            showImportModal: false,
            dataLinker: getLinker(props.dataLinker, a => a.linkType === LINKTYPE.Request),
            thirdPartyVisible: false, // 第三方显示与否
            thirdPartyId: '', // 选择的第三方ID
            currentData: {}, // 选择的第三方ID，对应ThirdPartyList存在的数据源配置数据
            requestResult: {}, // 重新请求第三方返回值
            paramsArr: [], // 关联参数 列表数据
            settingValue: null, // 联动设置、显示的值，eg：root.id
            treeData: [], // 请求第三方返回值，获得的关联字段
            selectedTreeData: [], // 选中的树字段
            checkedKeys: [],
            paramsChanged: false,
            loading: false,
            leafAttr: null,//树形请求的展开节点属性名
            linkType,
            freshFlag: true,
            formTemplateList: [],
            linkFormDetailResource: []
        };
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
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

    async showModal() {
        const { dataLinker } = this.props
        if (dataLinker.length === 0) await this.props.setDataLinker(initLinker(4, true));
        let linker = getLinker(this.props.dataLinker, a => a.linkType === LINKTYPE.Request);
        switch (linker.linkType) {
            case LINKTYPE.Resource:
            case LINKTYPE.Linker:
                this.props.buildFormDataFilter('linker');
                break;
            case LINKTYPE.Request:
                this.props.buildFormDataFilter('request');
                break;
        }
        this.setState({ dataLinker: linker, showModal: true });
    }

    // 数组去重
    unique(arr) {
        return arr.filter(function (item, index, arr) {
            //当前元素，在原始数组中的第一个索引===当前索引值，否则返回当前元素
            return arr.indexOf(item, 0) === index;
        });
    }

    async getRequestResult(url, method, paramsUrl, paramsBody, paramsHeader) {
        return await requestData(url, method, paramsUrl, paramsBody, paramsHeader)
    }
    linkSetting = (val) => {
        this.setState({ loading: true });
        this.setState({ settingValue: val }, () => { this.loadTreeData({ props: { eventKey: null } }) });
    }
    buildTreeData = (data, currentExpandKey) => {
        let treeData = this.state.treeData;
        if (currentExpandKey === null)
            treeData = data;
        else
            treeData = appendDataToNode(treeData, data, currentExpandKey);
        this.setState({ treeData: [...treeData] });
    }
    setLeafAttr = (leafAttr) => {
        this.setState({ leafAttr });
    }
    setResource = () => {
        let { checkedKeys, treeData } = this.state;
        let newTreeData = getCheckedTreeData(checkedKeys, treeData);
        this.setState({ showImportModal: false });
        this.props.onChange({ importTreeData: newTreeData });
    }
    setResourceId = async (value) => {
        const { thirdPartyList } = this.props;
        let thirdPartyListObj = thirdPartyList.find(a => a.id === value)
        this.setState({ thirdPartyId: value, currentData: { ...thirdPartyListObj }, settingValue: null })
        //this.loadTreeData({ key: null });
    }
    loadTreeData = async (node) => {
        const { thirdPartyList, parentParams } = this.props;
        let thirdPartyListObj = thirdPartyList.find(a => a.id === this.state.thirdPartyId)
        let method = methodTypeList.find(a => a.value === thirdPartyListObj.methodType).name;
        let paramsUrl = {}, paramsBody = {}, paramsHeader = {};
        thirdPartyListObj.sourceParameterViewResponses.forEach(param => {
            let exist = this.state.paramsArr.find(a => a.id === param.id)
            let val = param.name === parentParams ? (exist ? exist.value : node.props.eventKey) : (exist ? exist.value : param.value);
            switch (param.requestType) {
                case 0: //body
                    paramsBody[param.name] = val;
                    break;
                case 1: //url
                    paramsUrl[param.name] = val;
                    break;
                case 2: //header
                    paramsHeader[param.name] = val;
                    break;
            }
        });
        let { data } = await this.getRequestResult(thirdPartyListObj.url, method, paramsUrl, paramsBody, paramsHeader);
        let curThirdPartyPrimary = thirdPartyListObj.configuration.find(a => a.primary === true)
        let exportData = exportJsonData(data, JSON.parse(thirdPartyListObj.rule));
        let currentId = this.state.settingValue.split('.')[this.state.settingValue.split('.').length - 1]
        let primaryId = curThirdPartyPrimary.key.split('.')[curThirdPartyPrimary.key.split('.').length - 1]
        let nodeData = [];
        exportData.forEach(a => {
            let isLeaf = a[this.state.leafAttr] === 'true' || a[this.state.leafAttr] === true;
            nodeData.push({ title: a[currentId], key: a[primaryId], isLeaf });
        })
        this.buildTreeData(nodeData, node.props.eventKey);
        let obj = { loading: false };
        if (this.state.expandCheck === true)
            this.setState({ checkedKeys: [...this.state.checkedKeys, ...nodeData.map(a => a.key)] })
        this.setState(obj);
        return Promise.resolve();
    }
    filterOption = (input, option) => {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
    showImportModal = () => {
        this.setState({ showImportModal: true })
    }
    hideModal() {
        this.setState({ showModal: false, showImportModal: false });
    }
    setFormCol = (val, item) => {
        let { paramsArr } = this.state
        let tempParamsArr = paramsArr.find(a => a.id === item.id)
        if (tempParamsArr) tempParamsArr.value = val.target.value
        else paramsArr.push({ id: item.id, value: val.target.value })
        this.setState({ paramsArr, paramsChanged: true })
    }
    saveCheckKeys = (keys, e) => {
        this.setState({ checkedKeys: [...keys, ...e.halfCheckedKeys] });
    }
    changeParam = () => {
        if (this.state.paramsChanged && this.state.settingValue) {
            this.setState({ loading: true });
            this.loadTreeData({ props: { eventKey: null } });
        }
    }
    onExpand = (expandedKeys, target) => {
        if (target.node.props.checked) {
            this.setState({ expandCheck: true });
        }
    }
    setFormDetailResource = (linkFormDetailResource) => {
        this.setState({ linkFormDetailResource })
    }
    setSourceMode = (e) => {
        let obj = {};
        if (e.target.value === 'third')
            obj.importTreeData = null;
        else
            this.props.removeDataLinker(a => true);
        this.props.onChange({ ...obj, sourceMode: e.target.value })
    }
    render() {
        let { id, setDataLinker, getLinkFormLDetail, getLinkerParams, autoFill, currentFormData,
            width, setExternalId, thirdPartyList, extraParams, name, sourceMode } = this.props;
        const currentTitile = '关联第三方数据';
        let { showModal, dataLinker, showImportModal, thirdPartyId, currentData, paramsArr, settingValue,
            leafAttr, linkType, formTemplateList, freshFlag, linkFormDetailResource } = this.state;
        let thirdPartyListType = thirdPartyList.filter(a => a.sourceType === 0)
        let params = getLinkerParams(id);
        let formList = formTemplateList.filter(item => item.formTemplateVersionId !== this.props.formTemplateVersionId);
        let RelatedConditionAttr = {
            currentFormData,
            formTemplateList: formList,
            freshFlag,
            linkFormDetail: linkType === LINKTYPE.External ? linkFormDetail : linkFormDetailResource
        };
        return <React.Fragment>
            <Radio.Group style={{ width: "100%", padding: "5px 0" }} value={sourceMode}
                onChange={this.setSourceMode}>
                <Radio key='thirdExternal' value='third'>关联第三方数据源</Radio>
                {/* <Radio key='thirdImport' value='import'>从第三方数据源导入</Radio> */}
                <Radio key='thirdImport' value='import'>选择范围和默认值设置</Radio>
            </Radio.Group>
            {
                sourceMode === 'third' ?
                    <React.Fragment>
                        <Button style={{ width: "100%" }} onClick={this.showModal}>关联第三方数据源</Button>
                        <RelatedCondition key='condition' {...this.props} {...RelatedConditionAttr} linkType={this.state.linkType} />
                    </React.Fragment>

                    : null
            }
            {
                // sourceMode === 'import' ? <Button style={{ width: "100%", marginTop: 5 }} onClick={this.showImportModal}>第三方数据源导入</Button> : null
                sourceMode === 'import' ? <Button style={{ width: "100%", marginTop: 5 }} onClick={this.showImportModal}>选择范围和默认值设置</Button> : null
            }
            <div style={{ marginTop: 5, fontWeight: 'bold' }}>
                <p>父级id参数</p>
                <Input value={this.props.parentParams} onChange={(e) => {
                    this.props.onChange({ parentParams: e.target.value })
                }} type='text' />
            </div>
            {showModal ? <DataLinkerResourceModal
                fid={id}
                params={params}
                autoFill={autoFill}
                currentFormData={currentFormData}
                simpleMode='group'
                width={800}
                showModal={showModal}
                setExternalId={setExternalId}
                hideModal={this.hideModal}
                currentTitile={currentTitile}
                thirdPartyList={thirdPartyList}
                getLinkFormLDetail={getLinkFormLDetail}
                dataLinker={dataLinker}
                // extraBindMap={extraBindMap}
                extraParams={extraParams}
                learConditionList={this.clearConditionList}
                setFormDetailResource={this.setFormDetailResource}
                setDataLinker={setDataLinker} /> : null}
            {
                <Modal
                    maskClosable={false}
                    centered={true}
                    // title='从第三方数据源导入'
                    title='选择范围和默认值设置'
                    visible={showImportModal}
                    onOk={this.setResource}
                    width={800}
                    onCancel={this.hideModal}
                >
                    <div className={styles.title}>选择数据源</div>
                    <div className={styles.body}>
                        <Select
                            className={styles.item}
                            maxTagCount={4}
                            showSearch placeholder="请选择"
                            optionFilterProp="children"
                            filterOption={this.filterOption}
                            value={thirdPartyId}
                            onChange={this.setResourceId}
                        >
                            {thirdPartyListType.map(a => <Select.Option key={a.id} value={a.id} title={a.name}>{a.name}</Select.Option>)}
                        </Select>
                    </div>
                    {thirdPartyId ?
                        <React.Fragment>
                            <div className={styles.title}>回绑参数设置</div>
                            <div className={styles.body}>
                                <div style={{ lineHeight: '32px' }}>节点是否可以展开：</div>
                                <Select
                                    className={styles.item}
                                    showSearch placeholder="请选择"
                                    optionFilterProp="children"
                                    maxTagCount={4}
                                    value={leafAttr}
                                    onChange={this.setLeafAttr}
                                    filterOption={this.filterOption}
                                >
                                    {
                                        currentData.configuration.map(a => <Select.Option key={a.key} value={a.name || a.key} title={a.description || a.name || a.key}>{a.description || a.name || a.key}</Select.Option>)
                                    }
                                </Select>
                            </div>
                        </React.Fragment> : null
                    }
                    {
                        leafAttr ?
                            <React.Fragment>
                                {
                                    currentData.sourceParameterViewResponses && currentData.sourceParameterViewResponses.length !== 0 ? <div className={styles.title}>关联参数</div> : null
                                }
                                < div className={styles.bodyParams}>
                                    {
                                        currentData.sourceParameterViewResponses.map((item, index) => {
                                            let paramsArrInfo = paramsArr.find(a => a.id === item.id)
                                            return <div className={styles.params} key={index}>
                                                <div className={styles.inputD}>参数名称：{item.name}</div>
                                                <div className={styles.inputD}>参数值：
                                                        <Input onBlur={this.changeParam} className={styles.inputMix} value={paramsArrInfo ? paramsArrInfo.value : item.value} onChange={val => { this.setFormCol(val, item) }} />
                                                </div>
                                            </div>
                                        })
                                    }
                                </div>
                                <div className={styles.title}>联动设置</div>
                                <div className={styles.body}>
                                    <div className={styles.dis}><span>{name}</span></div>
                                    <span>联动显示</span>
                                    <Select
                                        className={styles.item}
                                        showSearch placeholder="请选择"
                                        optionFilterProp="children"
                                        maxTagCount={4}
                                        value={settingValue}
                                        onChange={this.linkSetting}
                                        filterOption={this.filterOption}
                                    >
                                        {
                                            currentData.configuration.map(a => <Select.Option key={a.key} value={a.key} title={a.description || a.name || a.key}>{a.description || a.name || a.key}</Select.Option>)
                                        }
                                    </Select>
                                    <span>的值</span>
                                </div>

                                {
                                    settingValue ? (
                                        <React.Fragment>
                                            <div className={styles.title}>关联字段</div>
                                            <Spin spinning={this.state.loading}>
                                                {
                                                    this.state.loading ? null :
                                                        <Tree checkable onCheck={this.saveCheckKeys} onExpand={this.onExpand} treeData={this.state.treeData} loadData={this.loadTreeData} ></Tree>
                                                }
                                            </Spin>
                                        </React.Fragment>
                                    ) : null
                                }
                            </React.Fragment> : null
                    }
                </Modal>
            }
        </React.Fragment>;
    }
}
// export default DataSource;

export default {
    Component: DataSource,
    getProps: (props) => {
        let {
            dataLinker, setDataLinker, autoFill, currentFormData, setExternalId, thirdPartyList, getLinkFormLDetail, conditionList,
            id, getLinkerParams, buildFormDataFilter, extraParams, name, onChange, sourceMode, removeDataLinker, parentParams
        } = props;
        return {
            dataLinker, setDataLinker, autoFill, currentFormData, setExternalId, thirdPartyList, getLinkFormLDetail, conditionList,
            id, getLinkerParams, buildFormDataFilter, extraParams, name, onChange, sourceMode, removeDataLinker, parentParams
        };
    }
};
