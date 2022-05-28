import React from "react";
import { Steps, Icon, Menu, Dropdown, Select, Input, Modal } from "antd";
import { Map, List, is, fromJS } from "immutable";
import { DragSource, DropTarget } from "react-dnd";
import styles from "../../components/FormControl/Attribute/SerialNumberRules.less";
import moment from "moment";
import com from "../../utils/com";

const SubMenu = Menu.SubMenu;
const Option = Select.Option;
const dateSplit = [{ name: moment().format("YYYY"), value: "yyyy" }, {
    name: moment().format("YYYYMM"),
    value: "yyyyMM"
},
    { name: moment().format("YYYY-MM"), value: "yyyy-MM" }, {
        name: moment().format("YYYY/MM"),
        value: "yyyy/MM"
    }, { name: moment().format("YYYYMMDD"), value: "yyyyMMdd" }, {
        name: moment().format("YYYY-MM-DD"),
        value: "yyyy-MM-dd"
    }, { name: moment().format("YYYY/MM/DD"), value: "yyyy/MM/dd" }, {
        name: moment().format("MMDD"),
        value: "MMdd"
    }, { name: moment().format("MM-DD"), value: "MM-dd" }, { name: moment().format("MM/DD"), value: "MM/dd" }];
const dateTypeList = dateSplit.map(v => {
    const { name, value } = v;
    return { name, value };
});

export default {
    name: "表单名称配置",
    summary: "表单名称配置",
    key: "FormNameConfig",
    fieldAuth: [],
    onLoaded: async ({
                         query, proxyState, setPermission, setSubmitInfo,
                         setProxyState, readOnly, workFlowId, formInstanceId, setting
                     }) => {
        setProxyState({
            query: query,
            formInstanceId: formInstanceId,
            FormNameConfig: setting//用户配置的自定义表单名称
        });
    },
    //控件注入
    option: (props) => <FormNameConfig {...props}/>
};

let getFieldsList = (rootList) => {
    // 单行文本、数字、下拉框、单选按钮组 流水号 允许做为 表单字段
    let tempArr = [];
    const configArr = ["SingleText", "Number", "SingleDropDownList", "SingleRadio", "SerialNumber"];
    rootList.forEach(v => {
        if (configArr.some(item => item === v.itemType)) {
            tempArr.push({
                key: v.id, title: v.name
            });
        }
    });
    return tempArr;
};


class FormNameConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rulesList: (props.rulesList && props.rulesList instanceof Array) ? props.rulesList : [],
            showOperateModal: "0", //日期格式为 2
            currentActiveItem: {},
            currentIndex: -1
        };
    }

    //生成规则类型
    generateRulesTypeList = () => {
        let formBody = this.props.formBody.toJS();
        // let a = formBody.filter(item => item.itemType === "Root");
        // let FilAry = formBody.filter(item => {
        //     let isOpen = true;
        //     a.forEach(_item => {
        //         if (_item.formId !== item.formId) isOpen = false;
        //     });
        //     return isOpen;
        // });
        let formItems = this.props.formItems;
        formItems.map(item => {
            formBody.map(_item => {
                if (item.id === _item.id) {
                    item.itemType = _item.itemType;
                }
            });
        });

        let ChildForm = formItems.filter(item => item.formType === 1);
        let FilAry = formItems.filter(item => {
            let isOpen = true;
            ChildForm.forEach(_item => {
                if (_item.formId === item.formId) isOpen = false;
            });
            return isOpen;
        });
        const { rulesList } = this.state;
        // 判断 日期 是否 已经存在于 rulesList 列表中
        let exsit = rulesList.filter(rule => rule.type === "2");
        let dateDisabled = !!exsit.length;
        const tempRuleList = [
            { key: "2", type: "2", title: "提交日期", disabled: dateDisabled },
            { key: "3", type: "3", title: "固定字符", disabled: false },
            { key: "4", title: "表单字段", disabled: false }
        ];
        tempRuleList.forEach(rule => {
            if (rule.key === "4") {
                let filedsList = getFieldsList(FilAry);
                filedsList.length ? (rule.children = filedsList) : rule.disabled = true;
            }
        });

        return (
            <Menu onClick={(e) => {
                this.addRulesItem(e);
            }}>
                {
                    tempRuleList.map(rule => {
                        let Com = rule.children && rule.children.length ? SubMenu : Menu.Item;
                        return (
                            <Com key={rule.key} disabled={rule.disabled}
                                 title={rule.title}>
                                {
                                    rule.children && rule.children.length ? (
                                        rule.children.map(subRule => (
                                            <Menu.Item key={subRule.key}>{subRule.title}</Menu.Item>
                                        ))
                                    ) : rule.title
                                }
                            </Com>
                        );
                    })
                }
            </Menu>
        );
    };

    changeOperateModal = (type, activeItem, index) => {
        if (type !== "2" && type !== "0") return;
        this.setState({
            showOperateModal: type,
            currentActiveItem: activeItem,
            currentIndex: index
        });
    };

    // 添加表单名称类别
    addRulesItem = (item) => {
        const { rulesList } = this.state;
        const { key: type, item: { props: { children: name } } } = item;
        switch (type) {
            case "2":
                rulesList.push({
                    id: com.Guid(),
                    type,
                    name: "提交日期",
                    readOnly: true,
                    value: { date: dateSplit[0]["name"], value: dateSplit[0]["value"] }
                });
                break;
            case "3":
                rulesList.push({ id: com.Guid(), type, name: "固定字符", readOnly: false, value: "" });
                break;
            default:
                rulesList.push({ id: com.Guid(), type, name: "表单字段", readOnly: true, value: name });
        }
        this.setState({ rulesList });
        this.props.saveSetting({ rulesList: rulesList });
    };

    // 删除 流水号 规则
    deleteRulesItem = (i) => {
        const { rulesList } = this.state;
        rulesList.splice(i, 1);
        this.setState({
            rulesList
        });
        this.props.saveSetting({ rulesList: rulesList });
    };

    // 固定字符 值得修改，把所有修改 值 ，写成一个方法
    changeRulesListPropty = (data, i) => {
        const { rulesList } = this.state;
        rulesList.forEach((v, index) => {
            if (index === i) {
                if (v.type === "2") {
                    v.value = { ...v.value, ...data };
                }
                if (v.type === "3") {
                    v.value = data;
                }
            }
        });
        this.setState({ rulesList });
        this.props.saveSetting({ rulesList: rulesList });
    };

    generatePreview = () => {
        const { rulesList } = this.state;
        return rulesList.reduce((prev, rule) => {
            let tempStr;
            switch (rule.type) {
                case "2":
                    tempStr = rule.value.date;
                    return prev + tempStr;
                case "3":
                    tempStr = rule.value;
                    return prev + tempStr;
                default:
                    tempStr = rule.value;
                    return prev + tempStr;
            }
        }, "");
    };

    // 寻找 目标item以及当前对应的 位置
    findMess = (id) => {
        let tempArr = List(this.state.rulesList).toJS();
        let currentItem = tempArr.find(v => v.id === id);
        return {
            index: tempArr.indexOf(currentItem)
        };
    };

    operateArr = (index, inIndex) => {
        let tempArr = List(this.state.rulesList).toJS();
        let deleteItem = tempArr.splice(index, 1);
        tempArr.splice(inIndex, 0, deleteItem[0]);
        this.setState({
            rulesList: tempArr
        });
        this.props.saveSetting({ rulesList: tempArr });
    };

    render() {
        let { showOperateModal, rulesList, currentActiveItem, currentIndex } = this.state;
        let operationProps = {
            showOperateModal,
            dateTypeList,
            currentActiveItem,
            currentIndex,
            changeOperateModal: this.changeOperateModal,
            changeRulesListPropty: this.changeRulesListPropty
        };
        const previewNum = this.generatePreview();
        return <React.Fragment>
            {
                (Object.keys(currentActiveItem).length) ? <Operation {...operationProps} /> : ""
            }
            <div className={styles.preview}>
                表单名称预览:
                <p title={previewNum} className={styles.previewCotent}>表单名称{previewNum}</p>
            </div>
            {
                rulesList.map((v, i) => {
                    let value = "";
                    switch (v.type) {
                        case "2":
                            value = `格式:${v.value.date}`;
                            break;
                        default:
                            value = v.value;
                    }
                    const ruleItemProps = {
                        value,
                        v,
                        i,
                        changeOperateModal: this.changeOperateModal,
                        changeRulesListPropty: this.changeRulesListPropty,
                        deleteRulesItem: this.deleteRulesItem,
                        findMess: this.findMess,
                        operateArr: this.operateArr
                    };
                    return (
                        <RuleItem key={i} {...ruleItemProps} />
                    );
                })
            }
            <Dropdown overlay={this.generateRulesTypeList()} trigger={["click"]}>
                <a className="ant-dropdown-link" href="#">
                    <Icon type="plus"/> 添加
                </a>
            </Dropdown>
        </React.Fragment>;
    }
}


// 拖动
const type = "rule";

@DragSource(type, {
    beginDrag(props, monitor, component) {
        let { v, findMess } = props;
        return {
            v,
            initialIndex: findMess(v.id)["index"]
        };
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
class RuleItem extends React.Component {
    render() {
        let { connectDragSource, connectDropTarget, value, v, i, changeOperateModal, changeRulesListPropty, deleteRulesItem } = this.props;

        return (connectDropTarget(
                <div className={styles.ruleItem}>
                    <div className={styles.ruleMain}
                         onClick={() => {
                             changeOperateModal(v.type, v, i);
                         }}
                    >
                        <Icon type="setting"
                              className={`${styles.setting} ${v["type"] === "2" ? styles.settingSpecial : ""}`}/>
                        <div className={styles.ruleTitle}>{v.name}</div>
                        <Input
                            className={`${styles.ruleInput} ${v.active ? styles.activeSetting : ""} ${v.readOnly ? styles.cursorInput : ""}`}
                            value={value} placeholder={v.type === "3" ? "请输入内容" : ""}
                            readOnly={v.readOnly}
                            onClick={(e) => {
                                !v.readOnly && e.stopPropagation();
                            }}
                            onChange={(e) => {
                                changeRulesListPropty(e.target.value, i);
                            }}
                        />
                    </div>
                    {
                        connectDragSource(<div className={styles.ruleOperate}>
                            <Icon type="drag"/>
                        </div>)
                    }
                    <div className={styles.ruleOperate} onClick={() => {
                        deleteRulesItem(i);
                    }}>
                        <Icon type="delete"/>
                    </div>
                </div>
            )
        );
    }
}

// 模块主要操作
class Operation extends React.Component {
    constructor(props) {
        super(props);
        let { currentActiveItem: { value } } = props;
        this.state = {
            value: value//用于 存储 模块的值
        };
        this.changeValue = this.changeValue.bind(this);
    }

    changeValue(data) {
        const { value } = this.state;
        this.setState({
            value: { ...value, ...data }
        });
    }

    render() {
        let { showOperateModal, changeOperateModal, dateTypeList, changeRulesListPropty, currentIndex } = this.props;
        let { value } = this.state;
        return (
            <Modal
                title="数据格式"
                visible={showOperateModal !== "0"}
                destroyOnClose={true}
                onCancel={() => {
                    changeOperateModal("0", {});
                }}
                onOk={() => {
                    changeOperateModal("0", {});
                    changeRulesListPropty(value, currentIndex);
                }}
                width={569}
                maskClosable={false}
            >
                <div>
                    {
                        showOperateModal === "2" ? (<div className={styles.configItem}>
                            提交日期显示格式 <br/>
                            <Select value={value.date}
                                    onChange={(e) => {
                                        e = JSON.parse(e);
                                        this.changeValue({ date: e.name, value: e.value });
                                    }}
                                    style={{ width: 250 }}>
                                {
                                    dateTypeList.map((v, i) => (
                                        <Option key={i} value={JSON.stringify(v)}>{v.name}</Option>
                                    ))
                                }
                            </Select>
                        </div>) : ""
                    }
                </div>
            </Modal>
        );
    }
}
