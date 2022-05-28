import request from "../../utils/request";
import queryString from "query-string";
// import { serverPermissionApiIp, workFlowhttp, encryptionSecret, appID, serverIp, serverOpenApiIp } from '../../utils/config';

// workFlow获取token
function GetInterfaceToken() {
    let faceToken = `${config.workFlowhttp}/workflow/token/apply`;
    return fetch(faceToken, {
        body: JSON.stringify({
            appID: config.appID,
            userID: JSON.parse(localStorage.getItem("author")).userId,
            encryptionSecret: config.encryptionSecret
        }),
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Accept": "application/json,text/plain,*/*",
            "Content-Type": "application/json;charset=UTF-8"
        }
    }).then(response => response.json()).then(data => {
        let { token } = data.data;
        localStorage.setItem("workFlowtoken", token);
        return { token };
    });
}


let count = 0;

function WorkflowHttp(url, params) {
    const workFlowtoken = localStorage.getItem("workFlowtoken");
    let maxRetry = 5;
    if (count < maxRetry) {
        return fetch(`${config.workFlowhttp}${url}`, {
            ...params,
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json,text/plain,*/*",
                "Content-Type": "application/json;charset=UTF-8",
                "token": workFlowtoken
            }
        }).then(response => response.json()).then(data => {
            if (!data.success && data.resultCode === -1) {
                return GetInterfaceToken().then(() => {
                    count++;
                    return WorkflowHttp(url, params);
                });
                // return new Promise((resolve, reject) => {
                //     //定时继续请求原url，如果token过期，这玩意才会执行
                //     setTimeout(function () {
                //       return GetInterfaceToken().then(() => {
                //             return resolve(WorkflowHttp(url, params))
                //         })
                //     }, 500);
                // });
            } else {
                count = 0;
                return { data };
            }
        });
    }
}


//不挂流程己方的权限
export async function GetPermission(params) {
    return request(`${config.serverPermissionApiIp}/DataPermission/GetPermission`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params),
        hideProgress: true
    });
}

//根据表单模板ID获取流程模板
export async function Workflow(params) {
    return WorkflowHttp(`/workflow/template/queryByFormID?appID=${params.appID}&tenantID=${params.tenantID}&formID=${params.formID}`, {
        method: "GET",
        mode: "cors",
        traditional: true,
        hideProgress: true
    });
    // return request(`/workflow/template/queryByFormID?appID=${params.appID}&tenantID=${params.tenantID}&formID=${params.formID}`, {
    //     method: 'GET',
    //     configIp: 'workFlowhttp',
    //     mode: 'cors',
    //     traditional: true,
    //     hideProgress: true,
    //
    // })
}

//发起流程
export async function LaunchWorkflow(params) {
    return WorkflowHttp(`/workflow/instance/launch`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params),
        hideProgress: true
    });
}

//提交表单数据
export async function SubmitWorkflow(params) {
    return WorkflowHttp(`/workflow/instance/submit`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//查询流程审批意见
export async function GetQuery(params) {
    return WorkflowHttp(`/workflow/comment/query?instanceID=${params.instanceID}&tenantID=${params.tenantID}&appID=${params.appID}`, {
        method: "GET",
        mode: "cors",
        traditional: true,
        hideProgress: true
    });
}

// 流程撤销 接口
export async function cancelProcedure(params) {
    return WorkflowHttp("/workflow/instance/delete", {
        method: "post",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//获取流程审批意见
export async function GetWorkflowAuditOpinionApi(params) {
    return request(`${config.serverOpenApiIp}/WorkFlow/GetWorkflowAuditOpinionApi`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}


// 加签 通过workFlowId获取tabid

export async function GetByWorkFlowId(params) {
    return request(`${config.serverOpenApiIp}/FormInstance/GetByWorkFlowId`, {
        method: "post",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params),
        hideProgress: true
    });
}

//获取待办任务权限
export async function GetAuths(params) {
    return WorkflowHttp(`/workflow/task/getAuths?tenantID=${params.tenantID}&taskID=${params.taskID}&appID=${params.appID}&userID=${params.userID}`, {
        method: "GET",
        mode: "cors",
        traditional: true,
        hideProgress: true
    });
}

//根据条件获取权限信息
export async function GetFormAuths(params) {
    return WorkflowHttp(`/workflow/instance/getFormAuths?${queryString.stringify(params)}`, {
        method: "GET",
        mode: "cors",
        traditional: true
    });
}

//待办任务 同意
export async function FlowComplete(params) {
    return WorkflowHttp("/workflow/task/complete", {
        method: "post",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//及加签
export async function GetAddSign(params) {
    return WorkflowHttp("/workflow/task/addSign", {
        method: "post",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//任务认领
export async function GetClaim(params) {
    return WorkflowHttp("/workflow/task/claim", {
        method: "post",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//动态驳回
export async function GetDynamicNodes(params) {
    return WorkflowHttp(`/workflow/task/getDynamicNodes?tenantID=${params.tenantID}&taskID=${params.taskID}&appID=${params.appID}`, {
        method: "GET",
        mode: "cors",
        traditional: true
    });
}
//流程挂起
export async function Pause(params) {
    return WorkflowHttp(`/workflow/instance/pause`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//审阅抄送任务
export async function ReadCopyTask(params) {
    return WorkflowHttp("/workflow/task/readCopyTask", {
        method: "post",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//获取已办任务权限
export async function MissionSuccess(params) {
    return WorkflowHttp(`/workflow/task/getDoneAuths?tenantID=${params.tenantID}&appID=${params.appID}&taskID=${params.taskID}`, {
        method: "GET",
        mode: "cors",
        traditional: true
    });
}

// 删除选中项
export async function DeleteRow(params) {
    params.PlatForm = "NPF";
    return request(`${config.serverOpenApiIp}/FormTemplateVersion/DeleteRow`, {
        method: "post",
        body: JSON.stringify(params)
    });
}

// 加载当前用户所属机构模板
export async function GetWFTemplateInfoByFormId(params) {
    return request(`${config.serverOpenApiIp}/FormTemplate/GetWFTemplateInfoByFormId`, {
        method: "POST",
        body: JSON.stringify(params)
    });
}

//修改流程模板id
export async function ModifyWFTemplateId(params) {
    return request(`${config.serverIp}/FormInstance/ModifyWFTemplateId`, {
        method: "POST",
        body: JSON.stringify(params)
    });
}







