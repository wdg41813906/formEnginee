import React, { Fragment } from 'react'
import { Input, Radio, Checkbox, Row, Col, Modal, message, Select, Spin } from 'antd';
import DragSourceWeddingRadioGroup from './DragSourceWeddingRadioGroup'
import com from '../../../../utils/com'
import { exportJsonData } from '../../../../utils/dynamicJson';
import { LINKTYPE, initLinker } from '../../DataLinker/DataLinker';
import styles from './DropDownItem.less';
import { parameterTypeList, methodTypeList } from "../../../../utils/DataSourceConfig";
import { requestData } from '../../../../services/FormBuilder/FormBuilder'


const { TextArea } = Input;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
let initData = null
const getNew = (arr, index) => {
    // debugger
    let newItem = `选项${index}`;
    if (arr.indexOf(newItem) > -1) {
        return getNew(arr, index + 1)
    } else {
        return newItem
    }
}

// @Attribute('下拉项')
class DropDownItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownList: this.props.dropdownList,
            visible: false,
            thirdPartyVisible: false, // 第三方显示与否
            thirdPartyId: '', // 选择的第三方ID
            currentData: {}, // 选择的第三方ID，对应ThirdPartyList存在的数据源配置数据
            requestResult: {}, // 重新请求第三方返回值
            paramsArr: [], // 关联参数 列表数据
            settingValue: null, // 联动设置、显示的值，eg：root.id
            checkArr: [], // 请求第三方返回值，获得的关联字段
            checkedArr: [], // 选中的关联字段
            isParamsChange: false, // 关联参数是否变化
            isThirdPartyId: false,
            // selectValue: ""
        };
        this.changeInput = this.changeInput.bind(this);
        this.changeOption = this.changeOption.bind(this);
        this.addItem = this.addItem.bind(this);
        this.addOtherItem = this.addOtherItem.bind(this);
    }

    // 数组去重
    unique(arr) {
        return arr.filter(function (item, index, arr) {
            //当前元素，在原始数组中的第一个索引===当前索引值，否则返回当前元素
            return arr.indexOf(item, 0) === index;
        });
    }

    async getRequestResult(thirdPartyListObj, paramsArr = thirdPartyListObj.sourceParameterViewResponses) {
        let method = methodTypeList.find(a => a.value === thirdPartyListObj.methodType).name;
        let paramsUrl = {}, paramsBody = {}, paramsHeader = {};
        paramsArr.forEach(param => {
            switch (param.requestType) {
                case 0: //body
                    paramsBody[param.name] = param.value;
                    break;
                case 1: //url
                    paramsUrl[param.name] = param.value;
                    break;
                case 2: //header
                    paramsHeader[param.name] = param.value;
                    break;
            }
        });
        this.setState({ isThirdPartyId: true })
        let data = await requestData(thirdPartyListObj.url, method, paramsUrl, paramsBody, paramsHeader)
        this.setState({ isThirdPartyId: false })
        return data
    }

    addItem() {
        let newRadios = Array.from(this.props.dropdownList);
        let newName = getNew(newRadios.map(e => e.name), newRadios.length + 1);
        let newItem = {
            name: newName,
            value: com.Guid()
        };
        newRadios.push(newItem);
        this.rightDispatch(newRadios);
    }

    addOtherItem() {
        let newRadios = Array.from(this.props.dropdownList);
        let sortlength = newRadios.filter(item => {
            return item.name === '其他'
        })
        if (sortlength.length < 1) {
            newRadios.push({
                name: '其他',
                value: com.Guid()
            });
            this.rightDispatch(newRadios);
        } else {
            message.info('该项只能存在一个');
        }
    }

    addAll = () => {
        this.setState({
            visible: true,
            dropdownList: this.props.dropdownList
        });
        this.props.onChange({
            visible: true
        });
    }

    closeModal() {
        this.setState({
            visible: false
        })
        this.props.onChange({
            visible: false
        });
    }

    changeTextAreaValue(e) {
        var valListarray = e.target.value.split("\n").map(e => ({ name: e, value: e }));
        this.setState({
            dropdownList: valListarray
        });
    }

    TextAreaOk() {//批量修改提交
        let { dropdownList } = this.state;
        let arr = [];
        let flag = true;
        //检测重复
        dropdownList.forEach(e => {
            if (arr.indexOf(e.name) == -1) {
                arr.push(e.name)
            } else {
                flag = false;
                return
            }
        })
        if (flag) {
            this.rightDispatch(dropdownList);
            this.closeModal();
        } else {
            message.error('选项名不能重复');
        }
    }

    deleteItem = (index) => {
        let newRadios = Array.from(this.props.dropdownList).filter(e => e.value != index);
        this.rightDispatch(newRadios);
    }

    changeOption(e, option) {
        let { type, dropdownList } = this.props;
        if (type == 'SingleRadio' || type == "SingleDropDownList") {//单选
            if (e.target.value == initData) {
                this.props.setGroupItemDataLinker('value', initLinker(LINKTYPE.DefaultValue, ''));
                this.props.setGroupItemDataLinker('name', initLinker(LINKTYPE.DefaultValue, ''));
                initData = null
            } else {
                let item = dropdownList.find(a => a.value === e.target.value);
                this.props.setGroupItemDataLinker('value', initLinker(LINKTYPE.DefaultValue, item.value));
                this.props.setGroupItemDataLinker('name', initLinker(LINKTYPE.DefaultValue, item.name));
                initData = e.target.value
            }

            //this.props.setDataLinker(initLinker(LINKTYPE.DefaultValue, e.target.value));
            //this.props.setDataLinker(initLinker(LINKTYPE.DefaultValue, e.target.value));
            // this.props.onChange({
            //     value: e.target.value,
            //     // selectValue: '2'
            // });
        } else {//多选
            let fildata = []
            dropdownList.map(item => {
                e.map(_item => {
                    if (_item === item.value) {
                        fildata.push(item.name)
                    }
                })
            })
            this.props.setGroupItemDataLinker('value', initLinker(LINKTYPE.DefaultValue, e));
            this.props.setGroupItemDataLinker('name', initLinker(LINKTYPE.DefaultValue, fildata));
            // this.props.onChange({
            //     value: e,
            //     // selectValue: '2'
            // });
        }
    }

    changeInput(e) {
        let newRadios = Array.from(this.props.dropdownList);
        newRadios.find(a => a.value == e.target.getAttribute("data-index")).name = e.target.value;
        this.props.onChange({
            dropdownList: newRadios
        });
    }

    rightDispatch(newRadios) {
        if (!newRadios) {
            newRadios = this.props.dropdownList
        }
        this.props.onChange({
            dropdownList: newRadios
        });
    }

    onSort = (start, end) => {
        // debugger
        let { dropdownList } = this.props;
        let item_s = JSON.parse(JSON.stringify(dropdownList.find(e => e.value == start)));
        let item_e = JSON.parse(JSON.stringify(dropdownList.find(e => e.value == end)));

        dropdownList.forEach((e, i) => {
            if (e.value == start) {
                dropdownList.splice(i, 1, item_e)
            }
            if (e.value == end) {
                dropdownList.splice(i, 1, item_s)
            }
        })
        this.props.onChange({
            dropdownList
        });
    }

    addThirdParty = () => {
        this.setState({ thirdPartyVisible: true })
    }

    verified(params) {
        if (!params.thirdPartyId) return "请选择 '数据源！'"
        else if (!params.settingValue) return "请选择 '联动设置' 的值！"
        else if (params.checkedArr.length === 0) return "请勾选 '关联字段' ！"
    }

    setResource = () => {
        let { checkedArr, checkArr, thirdPartyId, settingValue } = this.state
        const { onChange } = this.props
        const verification = this.verified({ thirdPartyId, settingValue, checkedArr })
        if (verification) {
            message.warning(verification);
            return
        }
        let arr = []
        checkedArr.forEach(a => {
            let curcheckArr = checkArr.find(b => b.value === a)
            arr.push(curcheckArr)
        })
        onChange({ dropdownList: arr });
        this.setState({ thirdPartyVisible: false })
    }

    hideModal = () => {
        this.setState({ thirdPartyVisible: false })
    }

    filterOption = (input, option) => {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }

    setResourceId = async (value) => {
        const { thirdPartyList } = this.props;
        const thirdPartyListObj = thirdPartyList.find(a => a.id === value)

        const { data } = await this.getRequestResult(thirdPartyListObj)

        this.setState({
            thirdPartyId: value,
            currentData: { ...thirdPartyListObj },
            requestResult: data,
            paramsArr: thirdPartyListObj.sourceParameterViewResponses,
            settingValue: null
        })
    }

    setFormCol = (val, item) => {
        let { paramsArr } = this.state
        let tempParamsArr = paramsArr.find(a => a.id === item.id)
        if (tempParamsArr) tempParamsArr.value = val.target.value
        else paramsArr.push({ ...item, value: val.target.value })
        this.setState({ paramsArr, isParamsChange: true })
    }

    linkSetting = (val) => {
        const { thirdPartyList } = this.props
        let { thirdPartyId, requestResult } = this.state
        let tempCheckArr = []
        let curThirdParty = thirdPartyList.find(a => a.id === thirdPartyId)
        let curThirdPartyPrimary = curThirdParty.configuration.find(a => a.primary === true)

        let exportData = exportJsonData(requestResult, JSON.parse(curThirdParty.rule));
        let currentId = val.split('.')[val.split('.').length - 1]
        let primaryId = curThirdPartyPrimary.key.split('.')[curThirdPartyPrimary.key.split('.').length - 1]

        exportData.forEach(a => {
            tempCheckArr.push({ name: a[currentId], value: a[primaryId].toString() })
        })
        let checkArr = this.unique(tempCheckArr)
        this.setState({ settingValue: val, checkArr })
    }

    changeField = (value) => {
        this.setState({ checkedArr: value })
    }



    paramsBlur = async () => {
        let { paramsArr, thirdPartyId, isParamsChange } = this.state
        const { thirdPartyList } = this.props;
        if (!isParamsChange) return

        const thirdPartyListObj = thirdPartyList.find(a => a.id === thirdPartyId)
        const { data } = await this.getRequestResult(thirdPartyListObj, paramsArr)
        this.setState({ requestResult: data })
    }

    render() {
        var ValList = ''
        const { thirdPartyVisible, thirdPartyId, currentData, paramsArr, settingValue, checkArr, isThirdPartyId } = this.state
        const { thirdPartyList, id, name } = this.props
        let thirdPartyListType = thirdPartyList.filter(a => a.sourceType === 0)
        if (this.state.dropdownList) {
            for (let i = 0; i < this.state.dropdownList.length; i++) {
                if (i == this.state.dropdownList.length - 1) {
                    ValList += `${this.state.dropdownList[i]["name"]}`
                } else {
                    ValList += `${this.state.dropdownList[i]["name"]}\n`
                }
            }
        }
        let { type, dropdownList, disabled, groupValues } = this.props;
        let radios = dropdownList.map((p) => {
            return (
                <DragSourceWeddingRadioGroup
                    p={p.name}
                    key={p.value}
                    index={p.value}
                    onSort={this.onSort}
                    onChange={this.changeInput}
                    changeOption={this.changeOption}
                    deleteItem={this.deleteItem.bind(this)}
                    type={type}
                />
            )
        });
        return (
            <div>
                {
                    type == 'SingleRadio' || type == "SingleDropDownList" ?//单选
                        <RadioGroup
                            disabled={disabled}
                            // onClick={this.changeOption}
                            value={groupValues.value}>
                            {radios}
                        </RadioGroup>
                        ://多选
                        <CheckboxGroup
                            disabled={disabled}
                            onChange={this.changeOption}
                            value={groupValues.value}>
                            {radios}
                        </CheckboxGroup>
                }

                <Row style={{ marginTop: '10px' }}>
                    <Col span={24} style={{ textAlign: 'center' }}>
                        <a type="primary" onClick={this.addItem} style={{ color: '#1890ff', marginRight: '2px' }}>新增</a>|
                        <a type="primary" onClick={this.addOtherItem}
                            style={{ color: '#1890ff', marginRight: '2px' }}> 添加其他选项</a>|
                        <a type="primary" onClick={this.addAll} style={{ color: '#1890ff' }}> 批量编辑 </a>|
                        <a type="primary" onClick={this.addThirdParty} style={{ color: '#1890ff' }}> 第三方导入</a>
                    </Col>
                </Row>
                <Modal
                    title="批量编辑"
                    visible={this.state.visible}
                    onOk={this.TextAreaOk.bind(this)}
                    onCancel={this.closeModal.bind(this)}
                >
                    <div style={{ paddingBottom: '6px' }}>每行对应一个选项</div>
                    <TextArea style={{ border: "1px #E9E9E9 solid", padding: "10px 5px" }} ref="TextChange"
                        autoSize={true} onChange={this.changeTextAreaValue.bind(this)} value={ValList}
                    >
                    </TextArea>
                </Modal>
                <Modal
                    maskClosable={false}
                    centered={true}
                    title='第三方业务数据导入'
                    visible={thirdPartyVisible}
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
                    <Spin spinning={isThirdPartyId}>
                        {
                            thirdPartyId ?
                                <React.Fragment>
                                    {
                                        currentData.sourceParameterViewResponses && currentData.sourceParameterViewResponses.length !== 0 ? <div className={styles.title}>关联参数</div> : null
                                    }
                                    < div className={styles.bodyParams}>
                                        {
                                            currentData.sourceParameterViewResponses.map((item, index) => {
                                                // let paramType = parameterTypeList.find(a => a.value === item.parameterType).name
                                                let paramsArrInfo = paramsArr.find(a => a.id === item.id)
                                                return <div className={styles.params} key={index}>
                                                    <div className={styles.inputD}>参数名称：{item.name}</div>
                                                    {/* <div className={styles.inputD}>参数类型：{paramType}</div> */}
                                                    {
                                                        <div className={styles.inputD}>参数值：
                                                        <Input
                                                                className={styles.inputMix}
                                                                value={paramsArrInfo ? paramsArrInfo.value : item.value}
                                                                onChange={val => { this.setFormCol(val, item) }}
                                                                onBlur={this.paramsBlur}
                                                            />
                                                        </div>
                                                    }
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
                                            showSearch
                                            placeholder="请选择"
                                            optionFilterProp="children"
                                            maxTagCount={4}
                                            value={settingValue}
                                            onChange={val => { this.linkSetting(val) }}
                                            filterOption={this.filterOption}
                                        >
                                            {
                                                currentData.configuration.map(a => <Select.Option key={a.key} value={a.key}>{a.description || a.name || a.key}</Select.Option>)
                                            }
                                        </Select>
                                        <span>的值</span>
                                    </div>
                                    {
                                        settingValue ? (
                                            <Fragment>
                                                <div className={styles.title}>关联字段</div>
                                                <CheckboxGroup style={{ width: '100%' }} onChange={this.changeField}>
                                                    {checkArr.map((item, index) => {
                                                        return (
                                                            <Col key={index} span={6}>
                                                                <Checkbox value={item.value}>{item.name}</Checkbox>
                                                            </Col>
                                                        )
                                                    })
                                                    }
                                                </CheckboxGroup>
                                            </Fragment>
                                        ) : null
                                    }
                                </React.Fragment> : null
                        }
                    </Spin>
                </Modal>
            </div>);
    }
}

export default DropDownItem;
