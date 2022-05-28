import React from "react";
import { Button, Modal, Card, Switch, Select } from "antd";
import Attribute from "./Attribute.js";
import componentsList from "../../../plugins/businessComponents/componentsList.js";

const cardStyle = { marginTop: "10px" };
const checkStyle = { color: "#40a9ff" };
const empty = {};

const p = { display: "flex", lineHeight: "30px" };
const s = { flex: 1 };

function Position(props) {
    const savePostion = (position) => {
        props.saveSetting({ position });
    };
    return <div style={p}>
        控件位置：<Select style={s} onChange={savePostion} value={props.position}>
        <Select.Option key='top' value='top'>---头部---</Select.Option>
        {props.rootList.map(a => <Select.Option key={a.id} value={a.id} title={a.name}>{a.name}</Select.Option>)}
        <Select.Option key='bottom' value='bottom'>---尾部---</Select.Option>
    </Select><span style={{ padding: "0 12px" }}>之后</span>
    </div>;
}

@Attribute("业务组件")
class BusinessLoader extends React.Component {
    constructor(props) {
        super(props);
        let bussinessComSetting = props.bussinessComSetting || {};
        let enableList = [];
        for (let key in bussinessComSetting) {
            enableList.push(key);
        }
        this.state = {
            showModal: false,
            bussinessComSetting,
            enableList,
            rootList: [],
            change: true,
            CheckMenu: "workFlow"
        };
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.change) {
            let bussinessComSetting = nextProps.bussinessComSetting || {};
            let enableList = [];
            for (let key in bussinessComSetting) {
                enableList.push(key);
            }
            return { bussinessComSetting, enableList };
        }
        return null;
    }
    
    showModal = () => {
        this.props.buildFormDataFilter("bussiness");
        this.setState({ showModal: true, change: false });
        let t = this;
        this.props.getBusinessPosition((rootList) => {
            t.setState({ rootList });
        });
    };
    
    hideModal = () => {
        this.setState({
            showModal: false,
            change: true
        });
    };
    save = () => {
        let bussinessComSetting = this.state.bussinessComSetting;
        this.props.onChange({ bussinessComSetting });
        let fieldAuth = [];
        this.state.enableList.map(item => {
            if (componentsList.find(a => a.key === item) && componentsList.find(a => a.key === item).fieldAuth) {
                fieldAuth.push({
                    key: item,
                    fieldAuth: componentsList.find(a => a.key === item).fieldAuth
                });
            }
        });
        this.props.addBusiness(fieldAuth);
        this.setState({ showModal: false, change: true });
    };
    
    saveSetting = (key, info) => {
        let bussinessComSetting = this.state.bussinessComSetting;
        let oldInfo = bussinessComSetting[key];
        console.log(key, info);
        this.setState({
            bussinessComSetting: {
                ...bussinessComSetting,
                [key]: { ...oldInfo, ...info }
            }
        });
        
    };
    changeList = (item, value) => {
        let { enableList, bussinessComSetting } = this.state;
        let other = ["BudgetCostResult", "BudgetApplicationResult", "BudgetAllocationResult"];//这三个只能存在一个
        if (value) {
            enableList = [...enableList, item];
            bussinessComSetting[item] = componentsList.find(a => a.key === item).initialOptions || {};
            
            other.forEach(a => {
                if (item === a) {
                    other.forEach(b => {
                        if (enableList.indexOf(b) > -1) {
                            enableList = enableList.filter(_item => _item !== b);
                            enableList = [...enableList, item];
                        }
                    });
                }
            });
        } else {
            enableList = enableList.filter(a => a !== item);
            delete bussinessComSetting[item];
        }
        this.setState({
            enableList,
            bussinessComSetting,
            CheckMenu: item
        });
    };
    
    onOpenChange = (val) => {
        console.log(val);
        this.setState({
            CheckMenu: val
        });
    };
    
    render() {
        let { showModal, enableList, bussinessComSetting, CheckMenu } = this.state;
        let { currentFormData } = this.props;
        let formItems = currentFormData.toJS();
        return (<React.Fragment>
            <Button onClick={this.showModal} style={{ width: "100%" }}>业务组件配置</Button>
            <Modal maskClosable={false}
                   title={"业务组件配置"}
                   visible={showModal}
                   onOk={this.save}
                   onCancel={this.hideModal}
                   width={800}
                   centered={true}
                   bodyStyle={{ height: 520, padding: "0 16px" }}
            >
                <div style={{ display: "flex" }}>
                    <div style={{ width: "200px", height: "520px", overflowY: "scroll" }}>
                        {
                            componentsList.map((item, i) => {
                                    let checked = enableList.includes(item.key);
                                    let Option = item.option;
                                    let title = item.name + (checked ? "（已启用）" : "");
                                    try {
                                        if (Option instanceof Function && checked) {
                                        }
                                    }
                                    catch (e) {
                                        title = item.name + " 控件配置加载失败！";
                                        checked = false;
                                    }
                                    return <div key={i}
                                                onClick={() => {
                                                    this.onOpenChange(item.key);
                                                }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    width: "192px",
                                                    padding: "6px 3px",
                                                    lineHeight: 2,
                                                    backgroundColor: CheckMenu === item.key ? "#e6f7ff" : "",
                                                    borderRight: CheckMenu === item.key ? "2px #1890ff solid" : "1px solid #e8e8e8",
                                                    color: CheckMenu === item.key ? "#1890ff" : "",
                                                    cursor: "pointer"
                                                }}>
                                        <div>
                                            {title}
                                        </div>
                                        <Switch onChange={(value) => {
                                            this.changeList(item.key, value);
                                        }} checked={checked} size='small'/>
                                    </div>;
                                }
                            )
                        }
                    </div>
                    <div style={{ flex: "1" }}>
                        {
                            componentsList.map((item, i) => {
                                    let content = null;
                                    let checked = enableList.includes(item.key);
                                    let Option = item.option;
                                    let props = bussinessComSetting[item.key];
                                    let positoin = props ? props.position : null;
                                    let s = this.saveSetting.bind(null, item.key);
                                    try {
                                        if (Option instanceof Function && checked) {
                                            content = <div>
                                                <Option formItems={formItems} {...props} {...this.props}
                                                        saveSetting={s}/>
                                            </div>;
                                        }
                                    }
                                    catch (e) {
                                        checked = false;
                                    }
                                    return CheckMenu === item.key ?
                                        <div style={{
                                            position: "absolute",
                                            left: "216px",
                                            right: "8px",
                                            top: "54px",
                                            bottom: " 52px",
                                            overflowY: "scroll",
                                            padding: "6px"
                                        }} key={i}>
                                            <p>{item.summary}</p>
                                            {
                                                checked && item.components ?
                                                    <Position rootList={this.state.rootList} saveSetting={s}
                                                              position={positoin}/> : null
                                            }
                                            {content}
                                        </div> : null;
                                }
                            )
                        }
                    
                    </div>
                </div>
            
            </Modal>
        </React.Fragment>);
    }
}

export default {
    Component: BusinessLoader,
    getProps: (props) => {
        let { id, currentFormData, buildFormDataFilter, addBusiness, formBody } = props;
        return { id, currentFormData, buildFormDataFilter, addBusiness, formBody };
    }
};
