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
                <Tooltip title={para.requestSource === "PC" ? "PC???????????????" : "?????????????????????"}>
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
                item.content = `${item.typeName}${item.comment ? "???" : ""}${item.comment || ""}`;
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
                    <Panel header="????????????" key="1">
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
                                ????????????
                            </div>
                            <TextArea
                                rows={4}
                                style={{
                                    width: "100%"
                                }}
                                maxLength={1000}
                                disabled={this.props.status === "readOnly" || sourceType === "preview"}
                                onChange={e => this.props.setOpinion(e.target.value)}
                                placeholder="?????????????????????"
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
                title: "?????????????????????????????????!!!",
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
                        <p style={{ margin: 0 }}><Icon type="exclamation-circle" style={{ paddingRight: "5px" }}/>??????????????????????????????????????????
                        </p>
                        <p style={{ margin: 0 }}><Icon type="exclamation-circle" style={{ paddingRight: "5px" }}/>??????????????????????????????,?????????!
                        </p>
                    </div>
                </React.Fragment>,
                okText: "??????",
                onOk() {
                    //????????????????????????????????? ????????????????????????
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
    name: "??????",
    summary: "?????????????????????",
    key: "workFlow",
    //????????????
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
    //????????????????????????
    // onInit: async ({ query, proxyState, setPermission, setSubmitInfo, setProxyState }) => {
    // },
    //???????????????????????????
    onLoaded: async ({ query, proxyState, setPermission, setSubmitInfo, setProxyState, readOnly, formBody, workFlowId, formInstanceId }) => {
        setProxyState({
            query: query
        });
        let author = JSON.parse(localStorage.getItem("author") || "{}");
        let approveResult;
        switch (query.sourceType) {
            //????????????
            case undefined: //??????????????? ????????????????????????
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
                                //formExtraParams: null//??????????????????(??????????????????)
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
                                                tempSave: name === "??????"
                                            };
                                        });
                                        setSubmitInfo(submitInfo);
                                    }
                                    //?????????????????????
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
                    message.error("????????????????????????????????????,??????????????????,???????????????????????????");
                    return;
                }
            case "todoTask":
                //debugger;
                //??????/?????? ???????????? ??? ????????????
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
                                tempSave: name === "??????"
                            };
                        });
                        setSubmitInfo(submitInfo);
                    }

                    //????????????????????????
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
                //??????????????????
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
                    message.info("???????????????????????????");
                }

                break;
            case "doneTask":
                //??????
                //??????????????????
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
                    message.info("???????????????????????????");
                }
                break;
            case "other"://???????????????????????????
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
                                tempSave: name === "??????"

                            };
                        }) : [];
                        setSubmitInfo(submitInfo);
                    }

                    //????????????????????????
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

                //??????????????????
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
                    message.info("???????????????????????????");
                }

                break;
            case "preview":
                //????????????
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
                    message.info("???????????????????????????");
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
    //???????????? ??????   {success::bool,msg::string}  success=false ????????????
    onAuthority: ({ proxyState, formDataModel }) => {
        return {
            success: true
        };
    },
    //??????????????? ??????  {success::bool,msg::string}  success=false ????????????
    beforeSubmit: async ({ params, proxyState, formDataModel, setProxyState }) => {
        //????????????????????????????????????
        debugger;
        let result = {
            success: true
        };
        switch (params.code) {
            case "agree":
                result.success = true;
                break;
            case "disagree": //?????????
            case "addBeforeSign": //??????????????????
            case "addAfterSign": //??????????????????
            case "dynamicReturn": //????????????
                debugger;
                if ((proxyState.opinion || "") === "") {
                    result.msg = "???????????????????????????";
                    result.success = false;
                }
                break;
        }
        if (result.success) {
            switch (params.code) {
                case "dynamicReturn": //????????????
                    let dynamicNodes = await GetDynamicNodes({
                        tenantID: config.tenantID,
                        appID: config.appID,
                        taskID: proxyState.taskId //??????ID
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
                            msg: "???????????????????????????"
                        };
                    }
                case "addBeforeSign": //??????????????????
                case "addAfterSign": //??????????????????
                case "dynamicSign": //????????????
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
    //??????????????????
    onClick: async ({ query, params, proxyState, setProxyState }) => {
        debugger;
        let submitFunction = null;
        let submitOption = {};
        let author = JSON.parse(localStorage.getItem("author") || "{}");
        switch (params.code) {
            case "claim": //??????
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
            case "carbonCopy": //??????
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
            case "disagree": //?????????
                debugger;
                if ((proxyState.opinion || "") === "") {
                    result.msg = "???????????????????????????";
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
            type: params.code, //?????????????????????code
            taskID: proxyState.taskId, //????????????ID, ?????????null
            values,
            userInfo: {
                //???????????????
                userID: author.userId, //"c86dc8a6-e70b-42a0-b082-7595a4a5ebfb",//
                userName: author.userName, //"wftest1",//
                deptID: author.currentDeptId, //"77272157-3dc0-4075-babc-d37538faff59",//
                deptName: author.currentDeptName
            },
            auditInfo: {
                comment: proxyState.opinion, //??????
                esignature: "" //????????????????????????
            },
            dynamicSignChargers: proxyState.dynamicSignChargers || null
        };
        switch (params.code) {
            case "disagree": //?????????
                submitOption.userInfo = {
                    //???????????????
                    userID: author.userId, //"c86dc8a6-e70b-42a0-b082-7595a4a5ebfb",//
                    userName: author.userName, //"wftest1",//
                    deptID: todoTaskUserInfo.taskDeptID, //"77272157-3dc0-4075-babc-d37538faff59",//
                    deptName: todoTaskUserInfo.taskDeptName, //"????????????-??????????????????",//
                    roleID: todoTaskUserInfo.taskRoleID,
                    roleName: todoTaskUserInfo.taskRoleName
                };
                let result = await FlowComplete(submitOption);
                if (result.data.success) {
                    //????????????????????????
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
    //?????????????????? ??????  {success::bool,msg::string}  success=false ????????????
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
                    if (otherProxyState.FormNameConfig && Array.isArray(otherProxyState.FormNameConfig.rulesList)) {  //???????????????????????????
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
                type: params.code, //?????????????????????code
                templateID: proxyState.templateID, //??????ID????????????null
                instanceID: proxyState.instanceID, //????????????ID
                extensionName: res, //????????????????????? ?????????null
                formExtraParams: {
                    tabId: query.tabId,
                    moduleId: query.moduleId,
                    inst: formInstanceId
                },//null,//??????????????????(??????????????????)
                taskID: proxyState.taskId, //????????????ID, ?????????null
                values,
                userInfo: {
                    //???????????????
                    userID: author.userId, //"c86dc8a6-e70b-42a0-b082-7595a4a5ebfb",//
                    userName: author.userName, //"wftest1",//
                    //???????????????????????????2???
                    departmentID: todoTaskUserInfo.taskDepartmentID || author.currentDepartmentId, //"bb291f11-1542-4619-9dec-14feb80a910c",//
                    departmentName: todoTaskUserInfo.taskDepartmentName || author.currentDepartmentName, // "?????????123213123123"//

                    deptID: todoTaskUserInfo.taskDeptID || author.currentDeptId,
                    deptName: todoTaskUserInfo.taskDeptName || author.currentDeptName,
                    roleID: todoTaskUserInfo.taskRoleID || author.currentDutyId,
                    roleName: todoTaskUserInfo.taskRoleName || author.currentDutyName
                },
                auditInfo: {
                    comment: proxyState.opinion, //??????
                    esignature: "" //????????????????????????
                },
                dynamicSignChargers: proxyState.dynamicSignChargers || null,
                //????????????????????????
                copyToUsers: proxyState.SetCarbonCopy || null //?????????
            };
            debugger;
            switch (params.code) {
                case "dynamicReturn": //????????????
                    submitOption.returnNodeInfo = {
                        nodeID: proxyState.dynamicNode, //???????????????????????????ID
                        taskID: proxyState.dynamictaskID, //???????????????????????????ID
                        isReturnFrom: proxyState.isOpen || false //??????????????????????????????????????????????????????
                    };
                    submitFunction = FlowComplete;
                    break;
                case "agree": //??????
                    if (!proxyState.opinion) {
                        submitOption.auditInfo.comment = "??????";
                    }
                    submitFunction = FlowComplete;
                    break;
                case "disagree": //?????????
                case "dynamicSign": //????????????
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
                case "addBeforeSign": //??????????????????
                case "addAfterSign": //??????????????????
                    submitOption = {
                        tenantID: config.tenantID,
                        appID: config.appID,
                        addSignType: params.code, //?????????????????????code
                        taskID: proxyState.taskId, //????????????ID, ?????????null
                        values,
                        userInfo: {
                            //???????????????
                            userID: author.userId, //"c86dc8a6-e70b-42a0-b082-7595a4a5ebfb",//
                            userName: author.userName, //"wftest1",//
                            deptID: todoTaskUserInfo.taskDeptID,
                            deptName: todoTaskUserInfo.taskDeptName,
                            roleID: todoTaskUserInfo.taskRoleID,
                            roleName: todoTaskUserInfo.taskRoleName
                        },
                        users: proxyState.users,
                        auditInfo: {
                            comment: proxyState.setOpinion, //??????
                            esignature: "" //????????????????????????
                        },
                        copyToUsers: proxyState.SetCarbonCopy || null //?????????
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
                case "outerAudit"://????????????
                    break;
                case "submit": //??????
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
                                title: "????????????",
                                content: "?????????????????????????",
                                okText: "??????",
                                cancelText: "??????",
                                onOk() {
                                    if (!proxyState.opinion) {
                                        submitOption.auditInfo.comment = "??????";
                                    }
                                    submitFunction(submitOption).then(res => {
                                        resolve(res);
                                    });
                                },
                                onCancel() {
                                    resolve({
                                        data: {
                                            success: false,
                                            msg: "??????????????????",
                                            isCancel: true
                                        }
                                    });
                                }
                            });
                        }).then(result => {
                            if (result.data.success) {
                                //????????????????????????
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
                case "readCopyTask"://??????
                    submitOption = {
                        tenantID: config.tenantID,
                        appID: config.appID,
                        taskID: proxyState.taskId, //????????????ID, ?????????null
                        userInfo: {
                            //???????????????
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
                case "save": //??????
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
                    //????????????????????????
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
    //????????????
    components: WorkFlowView, //ApprovalSteps,
    //???????????????
    initialProxyState: {
        visible: false
    },
    //???????????????
    initialOptions: {},
    //??????
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
        //                 type: "dept", //????????????
        //                 deptId: item.id,  //??????ID
        //                 deptName: item.name //????????????
        //             })
        //             break
        //         case 1:
        //             b.push({
        //                 type: "role",  //????????????
        //                 deptId: author.currentDeptId,//"77272157-3dc0-4075-babc-d37538faff59",//
        //                 deptName: author.currentDeptName,//"????????????-??????????????????",//
        //                 roleId: item.id,       //??????ID
        //                 roleName: item.name    //????????????
        //             })
        //             break
        //         case 2:
        //             c.push({
        //                 type: "user",  //????????????
        //                 deptId: item.rootId,
        //                 deptName: item.rootName,
        //                 userId: item.id,   //?????????ID
        //                 userName: item.name  //???????????????
        //             })
        //             break
        //     }
        // })
        // let bb = []
        // a.map(item => {
        //     b.map(_item => {
        //         bb.push({
        //             type: "role",  //????????????
        //             deptId: item.deptId,
        //             deptName: item.deptName,
        //             roleId: _item.roleId,       //??????ID
        //             roleName: _item.roleName    //????????????
        //         })
        //     })
        // });
        data.map(item => {
            switch (Number(item.type)) {
                case 0:
                    a.push({
                        type: "dept", //????????????
                        deptId: item.id, //??????ID
                        deptName: item.name, //????????????
                        isAllowDynamicSign: false //item.Sign,//??????????????????
                    });
                    break;
                case 1:
                    b.push({
                        type: "role", //????????????
                        deptId: author.currentDeptId, //"77272157-3dc0-4075-babc-d37538faff59",//
                        deptName: author.currentDeptName, //"????????????-??????????????????",//
                        roleId: item.id, //??????ID
                        roleName: item.name, //????????????
                        isAllowDynamicSign: false //item.Sign,//??????????????????
                    });
                    break;
                case 2:
                    c.push({
                        type: "user", //????????????
                        deptId: item.rootId,
                        deptName: item.rootName,
                        userId: item.id, //?????????ID
                        userName: item.name, //???????????????
                        isAllowDynamicSign: false //item.Sign,//??????????????????
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
                    message.warning("?????????????????????");
                    return;
                }
                break;
            case "addBeforeSign":
            case "addAfterSign":
                let d = [];
                c.map(item => {
                    d.push({
                        userId: item.userId, //?????????ID
                        userName: item.userName //???????????????
                    });
                });
                if (d.length === 0) {
                    message.warning("?????????????????????");
                    return;
                }
                newProxyState.users = d;
                break;
            case "carbonCopy": //??????
                let e = [];
                c.map(item => {
                    e.push({
                        userId: item.userId, //?????????ID
                        userName: item.userName //???????????????
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
                            name: "??????",
                            isTree: false
                        },
                        {
                            type: 1,
                            name: "??????",
                            isTree: false
                        },
                        {
                            type: 2,
                            name: "??????",
                            isTree: true
                        }
                    ]
                    : [
                        // {type: 0, name: "??????", isTree: false},
                        // {type: 1, name: "??????", isTree: false},
                        {
                            type: 2,
                            name: "??????",
                            isTree: true
                        }
                    ],
            selectedData: props.proxyState.code === "carbonCopy" ? props.proxyState.checkPart : [],
            headerTitle: "????????????",
            isFilter: "2",
            singleOrMultiple: 1 //0 ??? ?????????1 ??? ??????
        },
        controlFilter: hideModal, //isShowModal
        confirmSubmit
    };

    function setOp(opinion) {
        if (opinion.length > 998) {
            message.warning("??????????????????????????????1000");
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
            message.info("????????????????????????");
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
                        defaultValue="--?????????????????????--"
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
                            ??????????????????????????????????????????????????????
                            <Switch onChange={SelectIsOpen}/>
                        </div>
                    </div>
                </Modal>
            ) : null}
        </React.Fragment>
    );
}
