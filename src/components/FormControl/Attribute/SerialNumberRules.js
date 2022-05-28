import React, { Component } from 'react';
import { Input, Select, Icon, Menu, Dropdown, Modal, InputNumber, Switch } from 'antd';
import Attribute from './Attribute.js'
import styles from "./SerialNumberRules.less"
import { rule } from 'postcss';
import { DragSource, DropTarget } from 'react-dnd'
import { Map, List, is, fromJS } from 'immutable';
import com from "../../../utils/com"
import moment from "moment"

const SubMenu = Menu.SubMenu;
const Option = Select.Option;
const dateSplit = [{ name: moment().format("YYYY"), value: "yyyy" }, { name: moment().format("YYYYMM"), value: "yyyyMM" },
{ name: moment().format("YYYY-MM"), value: "yyyy-MM" }, { name: moment().format("YYYY/MM"), value: "yyyy/MM" }, { name: moment().format("YYYYMMDD"), value: "yyyyMMdd" }, { name: moment().format("YYYY-MM-DD"), value: "yyyy-MM-dd" }, { name: moment().format("YYYY/MM/DD"), value: "yyyy/MM/dd" }, { name: moment().format("MMDD"), value: "MMdd" }, { name: moment().format("MM-DD"), value: "MM-dd" }, { name: moment().format("MM/DD"), value: "MM/dd" }];
const dateTypeList = dateSplit.map(v => {
    const { name, value } = v;
    return { name, value }
});
const resetConfig = [
    { name: "不自动重置", value: "0" },
    { name: "每日重置", value: "1" },
    { name: "每周重置", value: "2" },
    { name: "每月重置", value: "3" },
    { name: "每年重置", value: "4" },
]
let getFieldsList = (rootList) => {
    // 单行文本、数字、下拉框、单选按钮组 允许做为 表单字段
    let tempArr = [];
    const configArr = ["SingleText","Number","SingleDropDownList","SingleRadio"];
    rootList.forEach(v => {
        if (configArr.some(item=>item===v.itemType)) {
            tempArr.push({
                key: v.id, title: v.itemBase.name
            });
        }
    });
    return tempArr;
}

// 加上 拖动
const type = "rule";
@DragSource(type, {
    beginDrag(props, monitor, component) {
        let { v, findMess } = props;
        return {
            v,
            initialIndex: findMess(v.id)["index"]
        }
    },
    endDrag(props, monitor, component) {
        const didDrop = monitor.didDrop();
        let { findMess, operateArr } = props;
        let { v: { id: dragId }, initialIndex } = monitor.getItem();
        if (!didDrop) {
            let { index } = findMess(dragId);
            operateArr(index, initialIndex);
        }
    }
}, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    currentItem: monitor.getItem(),
    isDragging: monitor.isDragging()
}))
@DropTarget(type, {
    hover(props, monitor, component) {
        let { v: { id: targetId }, findMess, operateArr } = props;
        let { v: { id: sourceId } } = monitor.getItem();
        if (targetId !== sourceId) {
            let { index: targetIndex } = findMess(targetId);
            let { index: sourceIndex } = findMess(sourceId);
            operateArr(targetIndex, sourceIndex);
        }
    }
}, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget()
}))

class RuleItem extends Component {
    render() {
        let { connectDragSource, connectDropTarget, value, v, i, changeOperateModal, changeRulesListPropty, deleteRulesItem } = this.props;

        return (connectDropTarget(
                <div className={styles.ruleItem}>
                    <div className={styles.ruleMain}
                        onClick={() => { changeOperateModal(v.type, v, i); }}
                    >
                        <Icon type="setting" className={`${styles.setting} ${v.type === "1" || v["type"] === "2" ? styles.settingSpecial : ""}`} />
                        <div className={styles.ruleTitle}>{v.name}</div>
                        <Input
                            className={`${styles.ruleInput} ${v.active ? styles.activeSetting : ""} ${v.readOnly ? styles.cursorInput : ""}`}
                            value={value} placeholder={v.type === "3" ? "请输入内容" : ""}
                            readOnly={v.readOnly}
                            onClick={(e) => {
                                !v.readOnly && e.stopPropagation();
                            }}
                            onChange={(e) => { changeRulesListPropty(e.target.value, i) }}
                        />
                    </div>
                    {
                        connectDragSource(<div className={styles.ruleOperate}>
                            <Icon type="drag" />
                        </div>)
                    }
                    {
                        v.type !== "1" ? (<div className={styles.ruleOperate} onClick={() => { deleteRulesItem(i); }}>
                            <Icon type="delete" />
                        </div>) : ""
                    }
                </div>
            )
        );
    }
}
// 模块主要操作
class Operation extends Component {
    constructor(props) {
        super(props);
        let { currentActiveItem: { value } } = props;
        this.state = {
            value: value,//用于 存储 模块的值
        }
        this.changeValue = this.changeValue.bind(this);
    }
    changeValue(data) {
        const { value } = this.state;
        this.setState({
            value: { ...value, ...data }
        });
    }
    render() {
        let { showOperateModal, changeOperateModal, dateTypeList, resetConfig, changeRulesListPropty, currentIndex } = this.props;
        let { value } = this.state;
        return (
            <Modal
                title="数据格式"
                visible={showOperateModal !== "0"}
                destroyOnClose={true}
                onCancel={() => { changeOperateModal("0", {}); }}
                onOk={() => { changeOperateModal("0", {}); changeRulesListPropty(value, currentIndex); }}
                width={569}
                maskClosable={false}
            >
                <div>
                    {
                        showOperateModal === "2" ? (<div className={styles.configItem}>
                            提交日期显示格式 <br />
                            <Select value={value.date}
                                onChange={(e) => { e = JSON.parse(e); this.changeValue({ date: e.name, value: e.value }); }}
                                style={{ width: 250 }}>
                                {
                                    dateTypeList.map((v, i) => (
                                        <Option key={i} value={JSON.stringify(v)}>{v.name}</Option>
                                    ))
                                }
                            </Select>
                        </div>) : ""
                    }
                    {
                        showOperateModal === "1" ? (<div>
                            <div className={styles.configItem}>
                                计数位数 <br />
                                <InputNumber min={2} max={12} value={value.digit} onChange={(e) => {this.changeValue({ digit: e }); }} />
                            </div>
                            <div className={styles.configItem}>
                                重置规则 <br />
                                <Select value={value.period}
                                    onChange={(e) => {this.changeValue({ period: e }); }}
                                    style={{ width: 250 }}>
                                    {
                                        resetConfig.map(v => (
                                            <Option key={v.value} value={v.value}>{v.name}</Option>
                                        ))
                                    }
                                </Select>
                                <div className={styles.note}>每日00:00:00，自动从初始值重新开始计数。一天内如果计数达到最大值，从0开始重新计数。</div>
                            </div>
                            <div className={styles.configItem}>
                                初始值 <br />
                                <InputNumber min={0} max={Number(new Array(value.digit).fill(9).join(""))} value={value.initValue} onChange={(e) => {this.changeValue({ initValue: e }); }} />
                            </div>
                            <div className={styles.configItem}>
                                固定位数 <br />
                                <Switch checkedChildren="开" unCheckedChildren="关" checked={value.isFixedDigit} onChange={(e) => {this.changeValue({ isFixedDigit: e }); }} />
                            </div>
                        </div>) : ""
                    }
                </div>
            </Modal>
        );
    }
}
@Attribute('流水号规则', false)
class SerialNumberRules extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showOperateModal: "0", //自动计数为 1,日期格式为 2
            rulesList: props.rulesList,
            currentActiveItem: {},
            currentIndex: -1,
        }
        this.changeOperateModal = this.changeOperateModal.bind(this);
        this.addRulesItem = this.addRulesItem.bind(this);
        this.changeRulesListPropty = this.changeRulesListPropty.bind(this);
        this.deleteRulesItem = this.deleteRulesItem.bind(this);
        this.findMess = this.findMess.bind(this);
        this.operateArr = this.operateArr.bind(this);
    }
    changeOperateModal(type, activeItem, index) {
        if (type !== "1" && type !== "2" && type !== "0") return;
        this.setState({
            showOperateModal: type,
            currentActiveItem: activeItem,
            currentIndex: index
        });
    }
    // 添加 流水号 的 条件
    addRulesItem(item) {
        const { rulesList } = this.state;
        const { key: type, item: { props: { children: name } } } = item;
        switch (type) {
            case "2":
                rulesList.push({ id: com.Guid(), type, name: "提交日期", readOnly: true, value: { date: dateSplit[0]["name"], value: dateSplit[0]["value"] } });
                break;
            case "3":
                rulesList.push({ id: com.Guid(), type, name: "固定字符", readOnly: false, value: "" });
                break;
            default:
                rulesList.push({ id: com.Guid(), type, name: "表单字段", readOnly: true, value: name });
        }
        this.setState({ rulesList });
        this.props.onChange({ rulesList });
    }
    // 删除 流水号 规则
    deleteRulesItem(i) {
        const { rulesList } = this.state;
        rulesList.splice(i, 1);
        this.setState({
            rulesList
        });
        this.props.onChange({ rulesList });
    }
    // 生成 规则 类型 添加列表
    generateRulesTypeList() {
        const rootList = this.props.rootList.toJS();
        const { rulesList } = this.state;
        // 判断 日期 是否 已经存在于 rulesList 列表中
        let exsit = rulesList.filter(rule => rule.type === "2");
        let dateDisabled = exsit.length ? true : false;
        const tempRuleList = [
            { key: "2", type: "2", title: "提交日期", disabled: dateDisabled },
            { key: "3", type: "3", title: "固定字符", disabled: false },
            { key: "4", title: "表单字段", disabled: false },
        ];
        tempRuleList.forEach(rule => {
            if (rule.key === "4") {
                let filedsList = getFieldsList(rootList);
                filedsList.length ? (rule.children = filedsList) : rule.disabled = true;
            }
        });
        return (
            <Menu onClick={(e) => {this.addRulesItem(e) }}>
                {
                    tempRuleList.map(rule => {
                        let Com = rule.children && rule.children.length ? SubMenu : Menu.Item;
                        return (
                            <Com key={rule.key} disabled={rule.disabled} title={rule.title}>
                                {
                                    rule.children && rule.children.length ? (
                                        rule.children.map(subRule => (
                                            <Menu.Item key={subRule.key}>{subRule.title}</Menu.Item>
                                        ))
                                    ) : rule.title
                                }
                            </Com>
                        )
                    })
                }
            </Menu>
        );
    }
    // 固定字符 值得修改，把所有修改 值 ，写成一个方法
    changeRulesListPropty(data, i) {
        const { rulesList } = this.state;
        rulesList.forEach((v, index) => {
            if (index === i) {
                if (v.type === "1" || v.type === "2") {
                    v.value = { ...v.value, ...data };
                }
                if (v.type === "3") {
                    v.value = data;
                }
            }
        });
        this.setState({ rulesList });
        this.props.onChange({ rulesList });
    }
    generatePreview() {
        const { rulesList } = this.state;
        return rulesList.reduce((prev, rule) => {
            let tempStr;
            switch (rule.type) {
                case "1":
                    const { value: { digit, initValue, isFixedDigit } } = rule;
                    // value:{digit:2,period:"1",initValue:2,isFixedDigit:true}
                    if (isFixedDigit) {
                        let isJudgeValid = digit - (initValue + "").length;
                        let tempArr = new Array(isJudgeValid>=0?isJudgeValid:0).fill(0);
                        tempStr = tempArr.join("") + initValue;
                    } else {
                        tempStr = initValue;
                    }
                    return prev + tempStr;
                case "2":
                    tempStr = rule.value.date;
                    return prev + tempStr
                case "3":
                    tempStr = rule.value;
                    return prev + tempStr
                default:
                    tempStr = rule.value;
                    return prev + tempStr;
            }
        }, "");
    }
    // 寻找 目标item以及当前对应的 位置
    findMess(id) {
        let tempArr = List(this.state.rulesList).toJS();
        let currentItem = tempArr.find(v => v.id === id);
        return {
            index: tempArr.indexOf(currentItem)
        }
    }
    operateArr(index, inIndex) {
        let tempArr = List(this.state.rulesList).toJS();
        let deleteItem = tempArr.splice(index, 1);
        tempArr.splice(inIndex, 0, deleteItem[0]);
        this.setState({
            rulesList: tempArr
        });
        this.props.onChange({ rulesList: tempArr });
    }
    render() {
        let { showOperateModal, rulesList, currentActiveItem, currentIndex } = this.state;
        let operationProps = {
            showOperateModal,
            dateTypeList,
            resetConfig,
            currentActiveItem,
            currentIndex,
            changeOperateModal: this.changeOperateModal,
            changeRulesListPropty: this.changeRulesListPropty,
        }
        const previewNum = this.generatePreview();
        return (
            <div>
                {
                    (Object.keys(currentActiveItem).length) ? <Operation {...operationProps} /> : ""
                }
                <div className={styles.preview}>
                    流水号预览:
                    <p title={previewNum} className={styles.previewCotent}>{previewNum}</p>
                </div>
                {
                    rulesList.map((v, i) => {
                        let value = "";
                        switch (v.type) {
                            case "1":
                                value = `${v.value.digit}位数字,${resetConfig.filter(item=>item.value === v.value.period)[0]["name"]}`;
                                break;
                            case "2":
                                value = `格式:${v.value.date}`;
                                break;
                            default:
                                value = v.value
                        }
                        const ruleItemProps = {
                            value,
                            v,
                            i,
                            changeOperateModal: this.changeOperateModal,
                            changeRulesListPropty: this.changeRulesListPropty,
                            deleteRulesItem: this.deleteRulesItem,
                            findMess: this.findMess,
                            operateArr: this.operateArr,
                        }
                        return (
                            <RuleItem key={i} {...ruleItemProps} />
                        );
                    })
                }
                <Dropdown overlay={this.generateRulesTypeList()} trigger={['click']}>
                    <a className="ant-dropdown-link" href="#">
                        <Icon type="plus" /> 添加
                    </a>
                </Dropdown>
            </div>
        );
    }
}

export default SerialNumberRules;
