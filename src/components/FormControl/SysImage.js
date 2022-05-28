import React from "react";
import { Icon, Collapse, Input, Checkbox, Button, List, Table, Divider, Modal, message } from "antd";
import { SysImages } from "../../services/Workflow/Workflow";

const { TextArea } = Input;
const Panel = Collapse.Panel;


function CheckDetailImage(props) {
    return <Modal
        title="查看影像详情"
        visible={props.visible}
        onOk={props.handleOk}
        onCancel={props.handleOk}
    >
        <img src={props.targetImage.length ? props.targetImage[0].Url : null} style={{ width: "100%" }} alt=""/>
    </Modal>;
}


class SysImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cardbodystate: true,
            showFile: false,
            CheckDetail: false,
            SysImageData: [],
            targetImage: [],
            visible: false
        };
    }

    componentDidMount() {
        this.setState({
            proxyState: this.props.proxyState,
            SysImageData:this.props.SysImageData
        });
        // if (this.props.proxyState.instType === "modify") {
        //     this.GetFile({ DocumentId: this.props.proxyState.formInstanceId });
        // }

    }

    GetFile = (params) => {
        fetch(`${config.systemImage}/api/LoadImages?documentid=${params.DocumentId}`, {
            method: "GET",
            mode: "cors",
            traditional: true
        }).then(res => {
            if (res.ok) {
                console.log(res.clone().json());
                res.clone().json().then(r => {
                    r.map((item, index) => {
                        item.key = index;
                        item.order = index + 1;
                        item.FileSize = (item.FileSize || 0) / 1024;
                    });
                    this.setState({
                        SysImageData: r
                    });
                });
            }
        });
    };

    toggerCardbody = () => {
        this.setState({
            cardbodystate: !this.state.cardbodystate
        });
    };
    showFile = () => {
        this.setState({
            showFile: !this.state.showFile
        });
    };
    CheckImage = () => {
        const { proxyState } = this.state;
        const { authority, proxyState: { query: { sourceType } } } = this.props;
        let author = JSON.parse(localStorage.getItem("author") || "{}");
        let disabled = authority["SysImages_CheckImage"].disabled || authority["SysImages_CheckImage"].readOnly;
        let CheckUrl = null;
        if (disabled) {
            //let ImageUrl = `${config.systemImage}影像地址/Viewer/Shot?CreateUserId=上传人Id&DocumentId=表单Id&BusinessSystem=系统标识&DeptId=部门ID&OrgID=机构Id&DocumentName=表单名称&DocumentCode=单据编号&CreateUserName=上传人姓名&DeptName=部门名称&OrgName=机构名称&BusinessType=null&LoadDocumentInfoUrl=null&allowSupplement=true&SharingCenterHost=null&UpLoad=true&Sharing=true&InvoiceType=是否ocr`;
            //let SelImageUrl = `${config.systemImage}/Viewer/DocumentView?CreateUserId={1}&DocumentId={2}&BusinessSystem={3}&DeptId={4}&OrgID={5}&DocumentName={6}&DocumentCode={7}&CreateUserName={8}&DeptName={9}&OrgName={10}&BusinessType={11}&LoadDocumentInfoUrl={12}&allowSupplement={13}&SharingCenterHost={14}`;
            CheckUrl = `${config.systemImage}/Viewer/DocumentView?CreateUserId=${author.userId}&DocumentId=${proxyState.formInstanceId}&BusinessSystem=system_wangbao&DeptId=${author.currentDepartmentId}&OrgID=${author.currentDeptId}&DocumentName=核算单元附件信息&DocumentCode=null&CreateUserName=${author.userName}&DeptName=${author.currentDepartmentName}&OrgName=${author.currentDeptName}&BusinessType=null&UpLoad=TRUE&Sharing=true&allowSupplement=false`;
        } else {
            CheckUrl = `${config.systemImage}/Viewer/Shot?CreateUserId=${author.userId}&DocumentId=${proxyState.formInstanceId}&BusinessSystem=system_wangbao&DeptId=${author.currentDepartmentId}&OrgID=${author.currentDeptId}&DocumentName=核算单元附件信息&DocumentCode=null&CreateUserName=${author.userName}&DeptName=${author.currentDepartmentName}&OrgName=${author.currentDeptName}&BusinessType=null&UpLoad=TRUE&Sharing=true&allowSupplement=${!!sourceType}`;
        }
        console.log(CheckUrl);
        var parmas = {
            url: CheckUrl,//`${config.systemImage}//Viewer/Shot?CreateUserId=${author.userId}&DocumentId=${proxyState.formInstanceId}&BusinessSystem=system_wangbao&DeptId=${author.currentDepartmentId}&OrgID=${author.currentDeptId}&DocumentName=核算单元附件信息&DocumentCode=null&CreateUserName=${author.userName}&DeptName=${author.currentDepartmentName}&OrgName=${author.currentDeptName}&BusinessType=null&UpLoad=TRUE&Sharing=true`,
            callback: (data) => {
                this.GetFile({ DocumentId: this.props.proxyState.formInstanceId });
                if(data.State===false){
                  Modal.warning({
                    title: "安装插件",
                    content: <div>
                      <div>
                        请安装系统插件(<a target="_blank" href={`${config.systemImageAdd}/gpp/resoures/setup.exe`}
                                   style={{ color: "#1890ff" }}>点击下载安装包</a>)。
                      </div>
                      如已安装可尝试在开始菜单启动该程序。
                    </div>,
                    okText: "确定"
                  });
                }
            }
        };
        var launch = new SYLaunch();
        // var callback = () => {
        //
        // };

        // launch.prestart(callback);
        launch.iamge(parmas);
    };
    CheckDetail = (key) => {
        debugger;
        const { SysImageData } = this.state;
        let targetImage = SysImageData.filter(item => item.key === key);
        this.setState({
            targetImage: targetImage,
            visible: true
        });
    };
    handleOk = () => {
        this.setState({
            visible: false
        });
    };
    Resources = (url) => {
        return new Promise(resolve => {
            const x = new XMLHttpRequest();
            // x.open("GET", targetImage[0].ThumbUrl, true);
            x.open("GET", url, true);
            x.responseType = "blob";
            x.onload = () => {
                if (x.status === 200) {
                    resolve(x.response);
                }
                // var url = window.URL.createObjectURL(x.response);
                // var a = document.createElement("a");
                // a.href = url;
                // a.download = "";
                // a.click();
            };
            x.send();
        });
    };
    changeName = (blob, filename) => {
        if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement("a");
            const body = document.querySelector("body");

            link.href = window.URL.createObjectURL(blob);
            link.download = filename;

            // fix Firefox
            link.style.display = "none";
            body.appendChild(link);

            link.click();
            body.removeChild(link);

            window.URL.revokeObjectURL(link.href);
        }
    };
    DownLoad = (key, filename) => {
        const { SysImageData } = this.state;
        let targetImage = SysImageData.filter(item => item.key === key);
        let url = targetImage[0].ThumbUrl;
        this.Resources(url).then(blob => {
            this.changeName(blob, targetImage[0].FileName);
        });
    };

    render() {

        const columns = [
            {
                title: "序号",
                dataIndex: "order",
                key: "order"
            },
            {
                title: "文件名称",
                dataIndex: "FileName",
                key: "FileName"
            },
            {
                title: "文件大小/KB",
                dataIndex: "FileSize",
                key: "FileSize"
            }, {
                title: "操作",
                dataIndex: "action",
                key: "action",
                render: (text, record) => {
                    return <span>
                        <a onClick={() => this.CheckDetail(record.key)}>打开</a>
                        <Divider type="vertical"/>
                        <a onClick={() => this.DownLoad(record.key)}>下载</a>
                    </span>;
                }
            }
        ];
        const { authority, proxyState: { query: { formTemplateType }, readOnly } } = this.props;
        return (
            <div className='ApprovalSteps' style={{ clear: "both" }}>
                <Collapse defaultActiveKey={["1"]} expandIconPosition="right" bordered={false}
                          expandIcon={() => <Icon style={{ fontSize: "15px" }}
                                                  type={this.state.cardbodystate ? "down" : "left"}/>}
                          onChange={this.toggerCardbody}>
                    <Panel header="影像系统" key="1" style={{ padding: "0px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "24px" }}>
                            <div>
                                已上传影像数{this.state.SysImageData.length}/张
                            </div>
                            {/*<div>*/}
                            {/**/}
                            {/*{*/}
                            {/*authority["SysImages_Defect"] ? authority["SysImages_Defect"].hidden ? null :*/}
                            {/*<Checkbox*/}
                            {/*disabled={authority["SysImages_Defect"].disabled || authority["SysImages_Defect"].readOnly}>是否缺少影像</Checkbox> : null*/}
                            {/*}*/}

                            {/*</div>*/}
                            <div>
                                {
                                    Object.keys(authority).length ? <div>
                                        {
                                            authority["SysImages_CheckImage"] && authority["SysImages_CheckImage"].hidden ? null :
                                                <Button type="primary"
                                                        disabled={Number(formTemplateType) === 0 ? (authority["SysImages_CheckImage"].disabled || authority["SysImages_CheckImage"].readOnly) : readOnly === true}
                                                        style={{ margin: "0 12px" }}
                                                        onClick={this.CheckImage}>影像信息</Button>
                                        }
                                        {
                                            authority["SysImages_FileList"] && authority["SysImages_FileList"].hidden ? null :
                                                <Button type="primary"
                                                        disabled={authority["SysImages_FileList"].disabled || authority["SysImages_FileList"].readOnly}
                                                        style={{ margin: "0 12px" }}
                                                        onClick={this.showFile}>文件列表</Button>
                                        }
                                    </div> : null
                                }


                            </div>
                        </div>
                        {
                            this.state.visible ? <CheckDetailImage targetImage={this.state.targetImage}
                                                                   visible={this.state.visible}
                                                                   handleOk={this.handleOk}/> : null
                        }

                        {
                            this.state.showFile ?
                                <Table size="small" style={{ marginTop: "12px" }} columns={columns}
                                       dataSource={this.state.SysImageData}/> : null
                        }
                    </Panel>
                </Collapse>
            </div>
        );

    }
}

export default SysImage;
