import React from "react";
import { Steps, Icon, Card, Collapse, Input, Tooltip } from "antd";
import style from "./ApprovalSteps.less";

const { Step } = Steps;
const { TextArea } = Input;
const Panel = Collapse.Panel;

function StepsPopover(para) {
    return (
        <div style={{ position: "relative", paddingLeft: "8px" }}>
            <div className={style.popover_arrow}/>
            <div className={style.Popover}>
                <Tooltip title={para.time}>
                    <div style={{ flex: "2", textAlign: "left" }}>{para.time}</div>
                </Tooltip>
                <Tooltip title={para.content}>
                    <div style={{ flex: "3", textAlign: "left", color: "#000" }}>{para.content}</div>
                </Tooltip>
                <Tooltip title={para.file}>
                    <div style={{ flex: "4", color: "#1890ff" }}>{para.file}</div>
                </Tooltip>
            </div>
        </div>
    
    );
}

class ApprovalSteps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cardbodystate: true
        };
    }
    
    toggerCardbody = () => {
        this.setState({
            cardbodystate: !this.state.cardbodystate
        });
    };
    
    SetIcon = (e) => {
        switch (e) {
            case "submit":
                return "play-circle";
            case "agree":
                return "flag";
            case "dynamicReturn":
                return "close-circle";
            case "disagree":
                return "close-circle";
            case "addBeforeSign":
                return "vertical-align-bottom";
            case "addAfterSign":
                return "vertical-align-top";
            case "reSubmit":
                return "reload";
            default:
                return "pic-center";
        }
    };
    
    Setcolor = (e) => {
        switch (e) {
            case "disagree":
            case "dynamicReturn":
                return "#f25f5f";
            default:
                return "#078407";
        }
    };
    
    
    render() {
        let { QueryResult } = this.props;
        QueryResult ? QueryResult.map(item => {
            item.time = item.createTime;
            item.content = `${item.typeName}${item.comment ? "，" : ""}${item.comment || ""}`;
            item.file = `${item.deptName || ""} ${item.userName || ""}`;
        }) : null;
        return (
            <div className='ApprovalSteps' style={{ clear: "both" }}>
                <Collapse defaultActiveKey={["1"]} expandIconPosition="right" bordered={false}
                          expandIcon={() => <Icon style={{ fontSize: "15px" }}
                                                  type={this.state.cardbodystate ? "down" : "left"}/>}
                          onChange={this.toggerCardbody}>
                    <Panel header="审批意见" key="1" style={{ padding: "0px 14px" }}>
                        <Steps direction="vertical" current={3}>
                            {
                                QueryResult ? QueryResult.map((item, index) => {
                                    return <Step key={index}
                                                 icon={<Icon type={this.SetIcon(item.typeCode)}
                                                             style={{
                                                                 fontSize: "22px",
                                                                 color: this.Setcolor(item.typeCode)
                                                             }}/>}
                                                 description={<StepsPopover {...item}/>}/>;
                                }) : null
                            }
                        </Steps>
                        <div style={{ display: "flex", alignItems: "center", marginTop: "24px" }}>
                            <div style={{ width: "70px" }}>审批意见</div>
                            <TextArea rows={4} style={{ width: "100%" }} disabled={this.props.status === "readOnly"}
                                      onChange={(e) => this.props.setOpinion(e.target.value)} placeholder="请输入审批意见"/>
                        </div>
                    </Panel>
                </Collapse>
            </div>
        
        );
        
    }
}

export default ApprovalSteps;
