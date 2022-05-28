import React, { useEffect } from "react";
import {
    Workflow,
    GetFormAuths,
    ModifyWFTemplateId,
    LaunchWorkflow,
    GetAuths,
    GetQuery,
    SubmitWorkflow,
    Pause,
    FlowComplete,
    GetAddSign,
    GetClaim,
    GetDynamicNodes,
    MissionSuccess,
    GetByWorkFlowId,
    GetWFTemplateInfoByFormId,
    ReadCopyTask
} from "../../services/Workflow/Workflow";
// import config from "../../utils/config";
import { Steps, Icon, Collapse, Input, Tooltip, message, Modal, Select, Switch } from "antd";
import style from "./workFlow.less";
import FORM_TYPE from "../../enums/FormType";
import FilterPart from "../../components/BookAddress/MemberCom/FilterPart";

const { Step } = Steps;
const { TextArea } = Input;
const Panel = Collapse.Panel;

let appID = "2c91808b68eb1d7901690007b0dd0007";
let tenantID = "2c91808b68eb1d7901690007b0dd0007";
let secret = "79ec7e45-e400-402c-9867-50f13668f50a";

function StepsPopover(para) {
    return (
        <div
            style={{
                position: "relative",
                paddingLeft: "8px"
            }}
        >
            <div className={style.popover_arrow}/>
            <div className={style.Popover}>
                <Tooltip title={para.time}>
                    <div
                        style={{
                            flex: "2",
                            textAlign: "left"
                        }}
                    >
                        {para.time}
                    </div>
                </Tooltip>
                <Tooltip title={para.nodeName}>
                    <div
                        style={{
                            flex: "2",
                            textAlign: "left",
                            color: "#000"
                        }}
                    >
                        {para.nodeName}
                    </div>
                </Tooltip>

                <Tooltip title={para.content}>
                    <div
                        style={{
                            flex: "4",
                            textAlign: "left",
                            color: "#000"
                        }}
                    >
                        {para.content}
                    </div>
                </Tooltip>
                <Tooltip title={para.deptName}>
                    <div
                        style={{
                            flex: "3",
                            color: "#1890ff"
                        }}
                    >
                        {para.deptName}
                    </div>
                </Tooltip>
                <Tooltip title={para.roleName}>
                    <div
                        style={{
                            flex: "3",
                            color: "#1890ff"
                        }}
                    >
                        {para.roleName}
                    </div>
                </Tooltip>
                <Tooltip title={para.userName}>
                    <div
                        style={{
                            flex: "3",
                            color: "#1890ff"
                        }}
                    >
                        {para.userName}
                    </div>
                </Tooltip>
                <Tooltip>
                    <div
                        style={{
                            flex: "2",
                            color: "#1890ff"
                        }}
                    >
                        <img src={para.esignature ? `${config.esignatureAdd}${para.esignature}` : ""}
                             style={{ height: "26px" }}
                             alt=""/>
                    </div>
                </Tooltip>
                <Tooltip title={para.requestSource === "PC" ? "PC端审批填写" : "移动端审批填写"}>
                    <div
                        style={{
                            width: "40px",
                            color: "#1890ff"
                        }}
                    >
                        <Icon type={para.requestSource === "PC" ? "desktop" : "mobile"}/>
                    </div>
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

    SetIcon = e => {
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

    Setcolor = e => {
        switch (e) {
            case "disagree":
            case "dynamicReturn":
                return "#f25f5f";
            default:
                return "#078407";
        }
    };

    render() {
        let { QueryResult, sourceType } = this.props;
        QueryResult
            ? QueryResult.map(item => {
                item.time = item.createTime;
                item.content = `${item.typeName}${item.comment ? "，" : ""}${item.comment || ""}`;
            })
            : null;
        return (
            <div className="ApprovalSteps" style={{ clear: "both" }}>
                <Collapse
                    defaultActiveKey={["1"]}
                    expandIconPosition="right"
                    bordered={false}
                    expandIcon={() => (
                        <Icon
                            style={{
                                fontSize: "15px"
                            }}
                            type={this.state.cardbodystate ? "down" : "left"}
                        />
                    )}
                    onChange={this.toggerCardbody}
                >
                    <Panel header="审批意见" key="1">
                        <Steps direction="vertical" current={3}>
                            {QueryResult
                                ? QueryResult.map((item, index) => {
                                    return (
                                        <Step
                                            key={index}
                                            icon={
                                                <Icon
                                                    type={this.SetIcon(item.typeCode)}
                                                    style={{
                                                        fontSize: "22px",
                                                        color: this.Setcolor(item.typeCode)
                                                    }}
                                                />
                                            }
                                            description={<StepsPopover {...item} />}
                                        />
                                    );
                                })
                                : null}
                        </Steps>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: "24px"
                            }}
                        >
                            <div
                                style={{
                                    width: "70px"
                                }}
                            >
                                审批意见
                            </div>
                            <TextArea
                                rows={4}
                                style={{
                                    width: "100%"
                                }}
                                maxLength={1000}
                                disabled={this.props.status === "readOnly" || sourceType === "preview"}
                                onChange={e => this.props.setOpinion(e.target.value)}
                                placeholder="请输入审批意见"
                            />
                        </div>
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

const clickKeys = ["claim", "carbonCopy"];

function getPermissionList(filter, list) {
    let result = list.filter(filter).map(a => a.fieldId);
    list.filter(a => Array.isArray(a.data)).forEach(a => {
        result.push(...getPermissionList(filter, a.data));
    });
    return result;
}

function VersionSelection({ props, noTemplateID, formInstanceId }) {
    let SelectVal = props[0].templateID;

    function onChangeVal(val) {
        SelectVal = val;
    }

    return new Promise(resolve => {
        if (props && props.length > 1) {
            Modal.info({
                title: "选择需要加载的流程模板!!!",
                content: <React.Fragment>
                    <Select
                        showSearch
                        style={{ width: "100%" }}
                        placeholder="Select a person"
                        onChange={onChangeVal}
                        defaultValue={SelectVal}>
                        {
                            props.map((item, index) => {
                                return <Select.Option value={item.templateID}
                                                      key={index}>{item.templateName}</Select.Option>;
                            })
                        }
                    </Select>
                    <div style={{
                        color: "#faad14",
                        fontSize: "12px",
                        padding: "12px 3px",
                        lineHeight: "20px"
                    }}>
                        <p style={{ margin: 0 }}><Icon type="exclamation-circle" style={{ paddingRight: "5px" }}/>流程模板默认为当前列表第一个
                        </p>
                        <p style={{ margin: 0 }}><Icon type="exclamation-circle" style={{ paddingRight: "5px" }}/>取消状态下不加载流程,请注意!
                        </p>
                    </div>
                </React.Fragment>,
                okText: "确定",
                onOk() {
                    //如果选择流程模板被删除 重新修改修改模板
                    if (noTemplateID) {
                        ModifyWFTemplateId({
                            Id: formInstanceId,
                            TemplateId: SelectVal
                        }).then(_res => {
                            if (_res.isValid) {
                                resolve(SelectVal);
                            } else {
                                message.error(_res.errorMessages);
                            }
                        });
                    } else {
                        resolve(SelectVal);
                    }
                },
                keyboard: false
            });
        } else {
            if (noTemplateID) {
                ModifyWFTemplateId({
                    Id: formInstanceId,
                    TemplateId: SelectVal
                }).then(_res => {
                    if (_res.isValid) {
                        resolve(SelectVal);
                    } else {
                        message.error(_res.errorMessages);
                    }
                });
            } else {
                resolve(SelectVal);
            }
        }
    });
}

function MakeUpName(rulesList) {
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
}


export default {
    name: "流程",
    summary: "系统内置的流程",
    key: "workFlow",
    //挂载检测
    loadCheck: ({ query }) => {
        return query.formTemplateType === "1";
        // if (query.formTemplateType === '1') {
        //     return true;l
        //     switch (query.sourceType) {
        //         case 'todoTask':
        //             break;
        //         case 'doneTask':
        //             break;
        //     }
        // }
        // else
        //     return true;
    },
    //业务组件初始化时
    // onInit: async ({ query, proxyState, setPermission, setSubmitInfo, setProxyState }) => {
    // },
    //表单数据加载后调用
    onLoaded: async ({ query, proxyState, setPermission, setSubmitInfo, setProxyState, readOnly, formBody, workFlowId, formInstanceId }) => {
        setProxyState({
            query: query
        });
        let author = JSON.parse(localStorage.getItem("author") || "{}");
        let approveResult;
        switch (query.sourceType) {
            //待办任务
            case undefined: //新发起流程 编辑新发起的流程
                const { data } = await GetWFTemplateInfoByFormId({
                    EntityId: query.formTemplateId,
                    Platform: "NPF"
                });
                debugger;
                if (data && data.length) {
                    let templateArray = [], GetData = [];
                    if (workFlowId) {
                        GetData = await GetByWorkFlowId({
                            workflowid: workFlowId,
                            PlatForm: "NPF"
                        });
                        templateArray = data.filter(_item => _item.templateID === GetData.data.templateId);
                    }
                    return new Promise(resolve => {
                        VersionSelection({
                            props: templateArray.length === 0 ? data : templateArray,
                            noTemplateID: !!(workFlowId && templateArray.length === 0),
                            formInstanceId
                        }).then(res => {
                            let params = {
                                templateID: res,//data.data[0].templateID,
                                extensionName: "",
                                isCreateInstance: false,
                                userInfo: {
                                    userID: author.userId,
                                    userName: author.userName,
                                    deptID: author.currentDeptId,
                                    deptName: author.currentDeptName,
                                    departmentID: author.currentDepartmentId,
                                    departmentName: author.currentDepartmentName
                                },
                                tenantID: config.tenantID,
                                appID: config.appID
                                //formExtraParams: null//表单扩展字段(动态表单使用)
                            };
                            LaunchWorkflow(params).then(result => {
                                if (result.data.success) {
                                    setProxyState({
                                        templateID: result.data.data.templateID,
                                        // instanceID: workFlowId || result.data.data.instanceID,
                                        instanceID: result.data.data.instanceID,
                                        taskId: result.data.data.taskID,
                                        // extraParams: result.data.data.extraParams
                                        extraParams: result.data.success ? result.data.data.extraParams : {},
                                        todoTaskUserInfo: result.data.data.taskUserInfo || {}
                                    });
                                    let permissionList;
                                    permissionList = {
                                        hidden: getPermissionList(a => a.visible === false, result.data.data.fieldAuth),
                                        show: getPermissionList(a => a.visible === true, result.data.data.fieldAuth), //result.data.data.fieldAuth.filter(a => a.visible === true).map(a => a.fieldId),
                                        edit: getPermissionList(a => a.readOnly === false && a.disabled === false, result.data.data.fieldAuth), //result.data.data.fieldAuth.filter(a => a.readOnly === false).map(a => a.fieldId),
                                        disabled: getPermissionList(a => a.disabled === true || a.readOnly === true, result.data.data.fieldAuth),
                                        required: getPermissionList(a => a.required === true, result.data.data.fieldAuth)
                                    };
                                    if (!(query.state === "readOnly" || readOnly === true)) {
                                        let submitInfo = result.data.data.optAuth.map(item => {
                                            let { name, ...params } = item;
                                            let triggerType = clickKeys.includes(params.code) ? "click" : "submit";
                                            return {
                                                triggerType,
                                                name,
                                                params,
                                                tempSave: name === "暂存"
                                            };
                                        });
                                        setSubmitInfo(submitInfo);
                                    }
                                    //查看新发起流程
                                    if (query.state === "readOnly" || readOnly === true) {
                                        permissionList = {
                                            hidden: getPermissionList(a => a.visible === false, result.data.data.fieldAuth),
                                            show: getPermissionList(a => a.visible === true, result.data.data.fieldAuth),
                                            edit: [],
                                            disabled: result.data.data.fieldAuth.map(a => a.fieldId),
                                            required: []
                                        };
                                    }
                                    setPermission(permissionList);
                                    resolve(res);
                                }else {
                                    message.error(result.data.msg)
                                }
                            });
                        });
                    });
                } else {
                    message.error("该表单没有完整的流程实例,暂时无法使用,详情请查看说明文档");
                    return;
                }
            case "todoTask":
                //debugger;
                //查看/编辑 待办权限 和 按钮权限
                const Authsdata = await GetAuths({
                    tenantID: config.tenantID,
                    appID: config.appID,
                    taskID: query.taskId,
                    userID: author.userId
                });
                if (Authsdata.data.success) {
                    let permissionList = {
                        // show: Authsdata.data.data.fieldAuth.filter(a => a.visible === true).map(a => a.fieldId),
                        // edit: Authsdata.data.data.fieldAuth.filter(a => a.readOnly === false).map(a => a.fieldId),
                        hidden: getPermissionList(a => a.visible === false, Authsdata.data.data.fieldAuth),
                        show: getPermissionList(a => a.visible === true, Authsdata.data.data.fieldAuth), //result.data.data.fieldAuth.filter(a => a.visible === true).map(a => a.fieldId),
                        edit: getPermissionList(a => a.readOnly === false && a.disabled === false, Authsdata.data.data.fieldAuth), //result.data.data.fieldAuth.filter(a => a.readOnly === false).map(a => a.fieldId),
                        disabled: getPermissionList(a => a.disabled === true || a.readOnly === true, Authsdata.data.data.fieldAuth),
                        required: getPermissionList(a => a.required === true, Authsdata.data.data.fieldAuth)
                    };
                    if (!(query.state === "readOnly" || readOnly === true)) {
                        let submitInfo = Authsdata.data.data.optAuth.map(item => {
                            let { name, ...params } = item;
                            let triggerType = clickKeys.includes(params.code) ? "click" : "submit";
                            return {
                                triggerType,
                                name,
                                params,
                                tempSave: name === "暂存"
                            };
                        });
                        setSubmitInfo(submitInfo);
                    }

                    //查看待办任务流程
                    if (query.state === "readOnly" || readOnly === true) {
                        permissionList = {
                            hidden: getPermissionList(a => a.visible === false, Authsdata.data.data.fieldAuth),
                            show: getPermissionList(a => a.visible === true, Authsdata.data.data.fieldAuth), //result.data.data.fieldAuth.filter(a => a.visible === true).map(a => a.fieldId),
                            edit: [],
                            disabled: Authsdata.data.data.fieldAuth.map(a => a.fieldId),
                            required: []
                        };
                    }
                    setPermission(permissionList);
                }
                //获取审批意见
                approveResult = await GetQuery({
                    tenantID: config.tenantID,
                    appID: config.appID,
                    instanceID: Authsdata.data.data.instanceID
                });
                if (approveResult && approveResult.data.success) {
                    setProxyState({
                        templateID: Authsdata.data.data.templateID,
                        instanceID: Authsdata.data.data.instanceID,
                        taskId: Authsdata.data.data.taskID,
                        approveResult: approveResult.data.data,
                        // extraParams: Authsdata.data.data.extraParams,
                        extraParams: Authsdata.data.success ? Authsdata.data.data.extraParams : {},
                        todoTaskUserInfo: Authsdata.data.data.taskUserInfo
                    });
                } else {
                    message.info("审批历史加载失败！");
                }

                break;
            case "doneTask":
                //已办
                //获取审批意见
                let result = await MissionSuccess({
                    tenantID: config.tenantID,
                    appID: config.appID,
                    taskID: query.taskId
                });
                approveResult = await GetQuery({
                    tenantID: config.tenantID,
                    appID: config.appID,
                    instanceID: query.wfInstanceId//result.data.data.instanceID
                });
                if (result.data.success) {
                    let permissionList = {
                        // hidden: [],
                        hidden: getPermissionList(a => a.visible === false, result.data.data.fieldAuth),
                        show: getPermissionList(a => a.visible === true, result.data.data.fieldAuth),//result.data.data.fieldAuth.filter(a => a.visible === true).map(a => a.fieldId),
                        edit: [], //result.data.data.fieldAuth.filter(a => a.readOnly === false).map(a => a.fieldId),
                        disabled: result.data.data.fieldAuth.map(a => a.fieldId),
                        required: []
                    };
                    setPermission(permissionList);
                }

                if (approveResult && approveResult.data.success) {
                    debugger;
                    setProxyState({
                        approveResult: approveResult.data.data,
                        extraParams: result.data.success ? result.data.data.extraParams : {}
                    });
                } else {
                    message.info("审批历史加载失败！");
                }
                break;
            case "other"://通过消息通知进入的
                let FormAuths = await GetFormAuths({
                    tenantID: config.tenantID,
                    appID: config.appID,
                    instanceID: query.wfInstanceId,
                    userID: author.userId,
                    templateID: query.wfTemplateId
                });
                if (FormAuths.data.success) {
                    setProxyState({
                        templateID: FormAuths.data.data.templateID,
                        instanceID: workFlowId || FormAuths.data.data.instanceID,
                        taskId: FormAuths.data.data.taskID,
                        // extraParams: FormAuths.data.data.extraParams
                        extraParams: FormAuths.data.success ? FormAuths.data.data.extraParams : {}
                    });
                    let permissionList = {
                        hidden: getPermissionList(a => a.visible === false, FormAuths.data.data.fieldAuth),
                        show: getPermissionList(a => a.visible === true, FormAuths.data.data.fieldAuth), //result.data.data.fieldAuth.filter(a => a.visible === true).map(a => a.fieldId),
                        edit: getPermissionList(a => a.readOnly === false && a.disabled === false, FormAuths.data.data.fieldAuth), //result.data.data.fieldAuth.filter(a => a.readOnly === false).map(a => a.fieldId),
                        disabled: getPermissionList(a => a.disabled === true || a.readOnly === true, FormAuths.data.data.fieldAuth),
                        required: getPermissionList(a => a.required === true, FormAuths.data.data.fieldAuth)
                    };
                    if (!(query.state === "readOnly" || readOnly === true)) {
                        let submitInfo = FormAuths.data.data.optAuth ? FormAuths.data.data.optAuth.map(item => {
                            let { name, ...params } = item;
                            let triggerType = clickKeys.includes(params.code) ? "click" : "submit";
                            return {
                                triggerType,
                                name,
                                params,
                                tempSave: name === "暂存"

                            };
                        }) : [];
                        setSubmitInfo(submitInfo);
                    }

                    //查看待办任务流程
                    if (query.state === "readOnly" || readOnly === true) {
                        permissionList = {
                            hidden: getPermissionList(a => a.visible === false, FormAuths.data.data.fieldAuth),
                            show: getPermissionList(a => a.visible === true, FormAuths.data.data.fieldAuth), //result.data.data.fieldAuth.filter(a => a.visible === true).map(a => a.fieldId),
                            edit: [],
                            disabled: FormAuths.data.data.fieldAuth.map(a => a.fieldId),
                            required: []
                        };
                    }
                    setPermission(permissionList);
                }

                //获取审批意见
                approveResult = await GetQuery({
                    tenantID: config.tenantID,
                    appID: config.appID,
                    instanceID: FormAuths.data.data.instanceID
                });
                if (approveResult && approveResult.data.success) {
                    setProxyState({
                        approveResult: approveResult.data.data,
                        todoTaskUserInfo: FormAuths.data.data.taskUserInfo
                    });
                } else {
                    message.info("审批历史加载失败！");
                }

                break;
            case "preview":
                //表单预览
                let preview = [];
                formBody.forEach(a => {
                    preview.push({
                        fieldId: a.get("id")
                    });
                });
                approveResult = await GetQuery({
                    tenantID: config.tenantID,
                    appID: config.appID,
                    instanceID: query.wfInstanceId
                });
                let permissionList = {
                    hidden: getPermissionList(a => a.visible === false, preview),
                    show: getPermissionList(a => a.visible === true, preview),
                    edit: [],
                    disabled: preview.map(a => a.fieldId),
                    required: []
                };
                setPermission(permissionList);
                if (approveResult && approveResult.data.success) {
                    debugger;
                    setProxyState({
                        approveResult: approveResult.data.data,
                        extraParams: {}
                    });
                } else {
                    message.info("审批历史加载失败！");
                }
                break;
        }
    },
    onBuildSubmitData({ submitFormData, proxyState, query }) {
        return submitFormData.map(a => ({
            ...a,
            templateId: proxyState.templateID,
            workFlowId: proxyState.instanceID
        }));
    },
    //校验回调 返回   {success::bool,msg::string}  success=false 中止提交
    onAuthority: ({ proxyState, formDataModel }) => {
        return {
            success: true
        };
    },
    //提交前回调 返回  {success::bool,msg::string}  success=false 中止提交
    beforeSubmit: async ({ params, proxyState, formDataModel, setProxyState }) => {
        //如果审批意见为空不能提交
        debugger;
        let result = {
            success: true
        };
        switch (params.code) {
            case "agree":
                result.success = true;
                break;
            case "disagree": //不同意
            case "addBeforeSign": //动态前置加签
            case "addAfterSign": //动态后置加签
            case "dynamicReturn": //动态驳回
                debugger;
                if ((proxyState.opinion || "") === "") {
                    result.msg = "审批意见不能为空！";
                    result.success = false;
                }
                break;
        }
        if (result.success) {
            switch (params.code) {
                case "dynamicReturn": //动态驳回
                    let dynamicNodes = await GetDynamicNodes({
                        tenantID: config.tenantID,
                        appID: config.appID,
                        taskID: proxyState.taskId //任务ID
                    });
                    if (dynamicNodes && dynamicNodes.data.success) {
                        return new Promise(resolve => {
                            setProxyState({
                                resolve,
                                code: params.code,
                                Returnvisible: true,
                                dynamicNodes: dynamicNodes.data.data
                            });
                        });
                    } else {
                        return {
                            success: false,
                            msg: "驳回节点加载失败！"
                        };
                    }
                case "addBeforeSign": //动态前置加签
                case "addAfterSign": //动态后置加签
                case "dynamicSign": //动态会签
                    return new Promise(resolve => {
                        setProxyState({
                            resolve,
                            code: params.code,
                            visible: true
                        });
                    });
            }
        }
        return result;
    },
    //普通按钮回调
    onClick: async ({ query, params, proxyState, setProxyState }) => {
        debugger;
        let submitFunction = null;
        let submitOption = {};
        let author = JSON.parse(localStorage.getItem("author") || "{}");
        switch (params.code) {
            case "claim": //认领
                submitFunction = GetClaim;
                submitOption = {
                    appID: config.appID,
                    taskID: proxyState.taskId,
                    userInfo: {
                        userID: author.userId,
                        userName: author.userName,
                        deptID: author.currentDeptId,
                        deptName: author.currentDeptName
                    }
                };
                let result = await submitFunction(submitOption);
                if (result.data.success) {
                    message.success(result.data.msg);
                } else {
                    message.error(result.data.msg);
                }

                break;
            case "carbonCopy": //抄送
                setProxyState({
                    code: params.code,
                    visible: true,
                    resolve: null
                });
                break;
        }
    },
    beforeTempSave: async ({ params, proxyState }) => {
        debugger;
        let result = {
            success: true
        };
        switch (params.code) {
            case "disagree": //不同意
                debugger;
                if ((proxyState.opinion || "") === "") {
                    result.msg = "审批意见不能为空！";
                    result.success = false;
                    return result;
                }
                break;
            default:
                return result;
        }

    },
    onTempSave: async ({ params, proxyState, submitData, query, setProxyState }) => {
        debugger;
        let author = JSON.parse(localStorage.getItem("author") || "{}");
        let values = {};
        let { todoTaskUserInfo } = proxyState;
        submitData
            .filter(a => a.formType === FORM_TYPE.mainForm)
            .forEach(a => {
                values[a.code] = a.value || null;
            });
        let submitOption = {
            tenantID: config.tenantID,
            appID: config.appID,
            type: params.code, //提交类型，按钮code
            taskID: proxyState.taskId, //任务实例ID, 可以为null
            values,
            userInfo: {
                //提交人信息
                userID: author.userId, //"c86dc8a6-e70b-42a0-b082-7595a4a5ebfb",//
                userName: author.userName, //"wftest1",//
                deptID: author.currentDeptId, //"77272157-3dc0-4075-babc-d37538faff59",//
                deptName: author.currentDeptName
            },
            auditInfo: {
                comment: proxyState.opinion, //意见
                esignature: "" //电子签名图片地址
            },
            dynamicSignChargers: proxyState.dynamicSignChargers || null
        };
        switch (params.code) {
            case "disagree": //不同意
                submitOption.userInfo = {
                    //提交人信息
                    userID: author.userId, //"c86dc8a6-e70b-42a0-b082-7595a4a5ebfb",//
                    userName: author.userName, //"wftest1",//
                    deptID: todoTaskUserInfo.taskDeptID, //"77272157-3dc0-4075-babc-d37538faff59",//
                    deptName: todoTaskUserInfo.taskDeptName, //"顶级机构-北京思源时代",//
                    roleID: todoTaskUserInfo.taskRoleID,
                    roleName: todoTaskUserInfo.taskRoleName
                };
                let result = await FlowComplete(submitOption);
                if (result.data.success) {
                    //提交成功之后重置
                    setProxyState({
                        SetCarbonCopy: [],
                        dynamicSignChargers: [],
                        checkPart: []
                    });
                }
                return {
                    success: result.data.success,
                    msg: result.data.msg
                };

            default:
        }

    },
    //提交按钮回调 返回  {success::bool,msg::string}  success=false 提交失败
    onSubmit: async ({
                         params, proxyState, submitData,
                         query, formList, formInstanceId, bussinessComponentsList,
                         setProxyState, submitFormData, getOtherBussinessProxyState
                     }) => {
        debugger;
        let submitFunction = SubmitWorkflow;
        let { todoTaskUserInfo } = proxyState;
        let author = JSON.parse(localStorage.getItem("author") || "{}");
        let values = {};
        submitData
            .filter(a => a.formType === FORM_TYPE.mainForm)
            .forEach(a => {
                values[a.code] = a.value || null;
            });
        return new Promise(resolve => {
            getOtherBussinessProxyState({
                businessKey: "FormNameConfig",
                onSuccess: async ({ otherProxyState }) => {
                    let extensionName = null;
                    if (otherProxyState.FormNameConfig && Array.isArray(otherProxyState.FormNameConfig.rulesList)) {  //按条件合并表单名称
                        otherProxyState.FormNameConfig.rulesList.map(item => {
                            submitFormData.map(_item => {
                                if (item.type === _item.id) {
                                    item.value = _item.value;
                                }
                            });
                        });
                        extensionName = MakeUpName(otherProxyState.FormNameConfig.rulesList);
                    }
                    resolve(extensionName);
                }
            });
        }).then(res => {
            let submitOption = {
                tenantID: config.tenantID,
                appID: config.appID,
                type: params.code, //提交类型，按钮code
                templateID: proxyState.templateID, //模板ID，可以为null
                instanceID: proxyState.instanceID, //流程实例ID
                extensionName: res, //流程实例扩展名 可以为null
                formExtraParams: {
                    tabId: query.tabId,
                    moduleId: query.moduleId,
                    inst: formInstanceId
                },//null,//表单扩展字段(动态表单使用)
                taskID: proxyState.taskId, //任务实例ID, 可以为null
                values,
                userInfo: {
                    //提交人信息
                    userID: author.userId, //"c86dc8a6-e70b-42a0-b082-7595a4a5ebfb",//
                    userName: author.userName, //"wftest1",//
                    //审核节点操作没有这2个
                    departmentID: todoTaskUserInfo.taskDepartmentID || author.currentDepartmentId, //"bb291f11-1542-4619-9dec-14feb80a910c",//
                    departmentName: todoTaskUserInfo.taskDepartmentName || author.currentDepartmentName, // "开发部123213123123"//

                    deptID: todoTaskUserInfo.taskDeptID || author.currentDeptId,
                    deptName: todoTaskUserInfo.taskDeptName || author.currentDeptName,
                    roleID: todoTaskUserInfo.taskRoleID || author.currentDutyId,
                    roleName: todoTaskUserInfo.taskRoleName || author.currentDutyName
                },
                auditInfo: {
                    comment: proxyState.opinion, //意见
                    esignature: "" //电子签名图片地址
                },
                dynamicSignChargers: proxyState.dynamicSignChargers || null,
                //审核节点操作特有
                copyToUsers: proxyState.SetCarbonCopy || null //抄送人
            };
            debugger;
            switch (params.code) {
                case "dynamicReturn": //动态驳回
                    submitOption.returnNodeInfo = {
                        nodeID: proxyState.dynamicNode, //动态驳回到指定节点ID
                        taskID: proxyState.dynamictaskID, //驳回到节点对应任务ID
                        isReturnFrom: proxyState.isOpen || false //驳回目标节点结束后是否返回到当前节点
                    };
                    submitFunction = FlowComplete;
                    break;
                case "agree": //同意
                    if (!proxyState.opinion) {
                        submitOption.auditInfo.comment = "同意";
                    }
                    submitFunction = FlowComplete;
                    break;
                case "disagree": //不同意
                case "dynamicSign": //动态会签
                    submitOption.userInfo = {
                        userID: author.userId, //"c86dc8a6-e70b-42a0-b082-7595a4a5ebfb",//
                        userName: author.userName, //"wftest1",//
                        deptID: todoTaskUserInfo.taskDeptID,
                        deptName: todoTaskUserInfo.taskDeptName,
                        roleID: todoTaskUserInfo.taskRoleID,
                        roleName: todoTaskUserInfo.taskRoleName
                    };
                    submitFunction = FlowComplete;
                    break;
                case "addBeforeSign": //动态前置加签
                case "addAfterSign": //动态后置加签
                    submitOption = {
                        tenantID: config.tenantID,
                        appID: config.appID,
                        addSignType: params.code, //提交类型，按钮code
                        taskID: proxyState.taskId, //任务实例ID, 可以为null
                        values,
                        userInfo: {
                            //提交人信息
                            userID: author.userId, //"c86dc8a6-e70b-42a0-b082-7595a4a5ebfb",//
                            userName: author.userName, //"wftest1",//
                            deptID: todoTaskUserInfo.taskDeptID,
                            deptName: todoTaskUserInfo.taskDeptName,
                            roleID: todoTaskUserInfo.taskRoleID,
                            roleName: todoTaskUserInfo.taskRoleName
                        },
                        users: proxyState.users,
                        auditInfo: {
                            comment: proxyState.setOpinion, //意见
                            esignature: "" //电子签名图片地址
                        },
                        copyToUsers: proxyState.SetCarbonCopy || null //抄送人
                    };
                    submitFunction = GetAddSign;
                    break;
                case "pause":
                    submitFunction = Pause;
                    submitOption = {
                        tenantID: config.tenantID,
                        appID: config.appID,
                        instanceID: proxyState.instanceID,
                        userInfo: {
                            userID: author.userId, //"c86dc8a6-e70b-42a0-b082-7595a4a5ebfb",//
                            userName: author.userName, //"wftest1",//
                            deptID: todoTaskUserInfo.taskDeptID,
                            deptName: todoTaskUserInfo.taskDeptName,
                            roleID: todoTaskUserInfo.taskRoleID,
                            roleName: todoTaskUserInfo.taskRoleName
                        }
                    };
                    break;
                case "outerAudit"://外部审批
                    break;
                case "submit": //提交
                    submitFunction = SubmitWorkflow;
                    let isShowModal = [];
                    bussinessComponentsList.map(a => {
                        ["BudgetCostResult", "BudgetApplicationResult", "BudgetAllocationResult", "BudgetMutexResult"].map(b => {
                            if (a === b) {
                                isShowModal.push(b);
                            }
                        });
                    });
                    if (isShowModal.length === 0) {
                        return new Promise(resolve => {
                            Modal.confirm({
                                title: "提交确认",
                                content: "确认执行此次操作?",
                                okText: "确认",
                                cancelText: "取消",
                                onOk() {
                                    if (!proxyState.opinion) {
                                        submitOption.auditInfo.comment = "提交";
                                    }
                                    submitFunction(submitOption).then(res => {
                                        resolve(res);
                                    });
                                },
                                onCancel() {
                                    resolve({
                                        data: {
                                            success: false,
                                            msg: "用户取消提交",
                                            isCancel: true
                                        }
                                    });
                                }
                            });
                        }).then(result => {
                            if (result.data.success) {
                                //提交成功之后重置
                                setProxyState({
                                    SetCarbonCopy: [],
                                    dynamicSignChargers: [],
                                    checkPart: []
                                });
                            }
                            return {
                                success: result.data.success,
                                msg: result.data.msg,
                                isCancel: result.data.isCancel
                            };
                        });
                    }
                    break;
                case "readCopyTask"://审阅
                    submitOption = {
                        tenantID: config.tenantID,
                        appID: config.appID,
                        taskID: proxyState.taskId, //任务实例ID, 可以为null
                        userInfo: {
                            //提交人信息
                            userID: author.userId, //"c86dc8a6-e70b-42a0-b082-7595a4a5ebfb",//
                            userName: author.userName, //"wftest1",//
                            deptID: todoTaskUserInfo.taskDeptID,
                            deptName: todoTaskUserInfo.taskDeptName,
                            roleID: todoTaskUserInfo.taskRoleID,
                            roleName: todoTaskUserInfo.taskRoleName
                        }
                    };
                    submitFunction = ReadCopyTask;
                    break;
                case "save": //暂存
                    return {
                        success: true
                    };
            }
            // let result = await submitFunction(submitOption);
            return new Promise(resolve => {
                submitFunction(submitOption).then(_result => {
                    resolve(_result);
                });
            }).then(_result => {
                if (_result && _result.data.success) {
                    //提交成功之后重置
                    setProxyState({
                        SetCarbonCopy: [],
                        dynamicSignChargers: [],
                        checkPart: []
                    });
                }
                return {
                    success: _result.data.success,
                    msg: _result.data.msg
                };
            });
        });

    },
    //控件注入
    components: WorkFlowView, //ApprovalSteps,
    //初始化状态
    initialProxyState: {
        visible: false
    },
    //初始化配置
    initialOptions: {},
    //依赖
    rely: []
};

function WorkFlowView(props) {
    function hideModal(val) {
        // props.proxyState.resolve({ success: true, msg: '' });
        if (val === false) {
            props.setProxyState({
                visible: false
            });
            if (props.proxyState.resolve)
                props.proxyState.resolve({
                    success: false
                });
        }
    }

    function confirmSubmit(data) {
        let author = JSON.parse(localStorage.getItem("author") || "{}");
        props.setProxyState({
            checkPart: data
        });
        let a = [],
            b = [],
            c = [];
        // data.map(item => {
        //     switch (Number(item.type)) {
        //         case 0:
        //             a.push({
        //                 type: "dept", //机构类型
        //                 deptId: item.id,  //机构ID
        //                 deptName: item.name //机构名称
        //             })
        //             break
        //         case 1:
        //             b.push({
        //                 type: "role",  //职责类型
        //                 deptId: author.currentDeptId,//"77272157-3dc0-4075-babc-d37538faff59",//
        //                 deptName: author.currentDeptName,//"顶级机构-北京思源时代",//
        //                 roleId: item.id,       //职责ID
        //                 roleName: item.name    //职责名称
        //             })
        //             break
        //         case 2:
        //             c.push({
        //                 type: "user",  //用户类型
        //                 deptId: item.rootId,
        //                 deptName: item.rootName,
        //                 userId: item.id,   //负责人ID
        //                 userName: item.name  //负责人姓名
        //             })
        //             break
        //     }
        // })
        // let bb = []
        // a.map(item => {
        //     b.map(_item => {
        //         bb.push({
        //             type: "role",  //职责类型
        //             deptId: item.deptId,
        //             deptName: item.deptName,
        //             roleId: _item.roleId,       //职责ID
        //             roleName: _item.roleName    //职责名称
        //         })
        //     })
        // });
        data.map(item => {
            switch (Number(item.type)) {
                case 0:
                    a.push({
                        type: "dept", //机构类型
                        deptId: item.id, //机构ID
                        deptName: item.name, //机构名称
                        isAllowDynamicSign: false //item.Sign,//是否继续加签
                    });
                    break;
                case 1:
                    b.push({
                        type: "role", //职责类型
                        deptId: author.currentDeptId, //"77272157-3dc0-4075-babc-d37538faff59",//
                        deptName: author.currentDeptName, //"顶级机构-北京思源时代",//
                        roleId: item.id, //职责ID
                        roleName: item.name, //职责名称
                        isAllowDynamicSign: false //item.Sign,//是否继续加签
                    });
                    break;
                case 2:
                    c.push({
                        type: "user", //用户类型
                        deptId: item.rootId,
                        deptName: item.rootName,
                        userId: item.id, //负责人ID
                        userName: item.name, //负责人姓名
                        isAllowDynamicSign: false //item.Sign,//是否继续加签
                    });
                    break;
                default:
            }
        });

        let newProxyState = {};

        switch (props.proxyState.code) {
            case "dynamicSign":
                newProxyState.dynamicSignChargers = a.concat(b.concat(c));
                if (newProxyState.dynamicSignChargers.length === 0) {
                    message.warning("请选择会签人员");
                    return;
                }
                break;
            case "addBeforeSign":
            case "addAfterSign":
                let d = [];
                c.map(item => {
                    d.push({
                        userId: item.userId, //负责人ID
                        userName: item.userName //负责人姓名
                    });
                });
                if (d.length === 0) {
                    message.warning("请选择加签人员");
                    return;
                }
                newProxyState.users = d;
                break;
            case "carbonCopy": //抄送
                let e = [];
                c.map(item => {
                    e.push({
                        userId: item.userId, //负责人ID
                        userName: item.userName //负责人姓名
                    });
                });
                newProxyState.SetCarbonCopy = e;
                break;
        }
        filterPartProps.controlFilterPart.selectedData = [];
        props.setProxyState({
            ...newProxyState,
            visible: false
        });
        if (props.proxyState.resolve)
            props.proxyState.resolve({
                success: true
            });
    }

    let filterPartProps = {
        controlFilterPart: {
            isShowModal: props.proxyState.visible,
            showFilterArr:
                props.proxyState.code === "dynamicSign"
                    ? [
                        {
                            type: 0,
                            name: "部门",
                            isTree: false
                        },
                        {
                            type: 1,
                            name: "职责",
                            isTree: false
                        },
                        {
                            type: 2,
                            name: "成员",
                            isTree: true
                        }
                    ]
                    : [
                        // {type: 0, name: "部门", isTree: false},
                        // {type: 1, name: "职责", isTree: false},
                        {
                            type: 2,
                            name: "成员",
                            isTree: true
                        }
                    ],
            selectedData: props.proxyState.code === "carbonCopy" ? props.proxyState.checkPart : [],
            headerTitle: "成员列表",
            isFilter: "2",
            singleOrMultiple: 1 //0 为 单选，1 为 多选
        },
        controlFilter: hideModal, //isShowModal
        confirmSubmit
    };

    function setOp(opinion) {
        if (opinion.length > 998) {
            message.warning("审批意见超过最大字符1000");
        }
        props.setProxyState({
            opinion
        });
    }

    function setDynamicNode(dynamic) {
        props.setProxyState({
            dynamicNode: dynamic.nodeID,
            dynamictaskID: dynamic.taskID
        });
    }

    function SelectIsOpen(isOpen) {
        props.setProxyState({
            isOpen
        });
    }

    function setDynamicReturn() {
        if (!props.proxyState.dynamicNode) {
            message.info("请选择驳回节点！");
        } else {
            props.proxyState.resolve({
                success: true
            });
        }

    }

    function cancelDynamicReturn() {
        props.setProxyState({
            Returnvisible: false
        });
        props.proxyState.resolve({
            success: false
        });
    }

    return (
        <React.Fragment>
            {props.proxyState.visible ? <FilterPart {...filterPartProps} /> : null}
            {props.proxyState.query && props.proxyState.query.sourceType ? (
                <ApprovalSteps status={props.proxyState.query.state} sourceType={props.proxyState.query.sourceType}
                               QueryResult={props.proxyState.approveResult || []}
                               setOpinion={setOp}/>
            ) : null}
            {props.proxyState.code === "dynamicReturn" ? (
                <Modal maskClosable={false} keyboard={false} closable={false} onCancel={cancelDynamicReturn}
                       onOk={setDynamicReturn}
                       visible={props.proxyState.Returnvisible}>
                    <Select
                        style={{
                            width: "100%"
                        }}
                        defaultValue="--请选择驳回节点--"
                        onChange={setDynamicNode}
                    >
                        {(props.proxyState.dynamicNodes || []).map(item => (
                            <Select.Option key={item.nodeID} value={item}>
                                {item.nodeName}
                            </Select.Option>
                        ))}
                    </Select>
                    <div
                        style={{
                            padding: "10px 0"
                        }}
                    >
                        <div>
                            驳回目标节点结束后是否返回到当前节点
                            <Switch onChange={SelectIsOpen}/>
                        </div>
                    </div>
                </Modal>
            ) : null}
        </React.Fragment>
    );
}
