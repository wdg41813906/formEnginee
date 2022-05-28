import request from "../../utils/request";
import qs from "qs";

// API事件
export async function GetAllWithEvent() {
    return request(`/SourceTypeConfig/GetAllWithEvent`, {
        method: 'post',
    })
}
//流程事件列表
export async function getBusinessEventList(params) {
    return request("/BusinessEvent/GetListPaged", {
        method: "post",
        body: JSON.stringify(params)
    });
}
//新增流程事件
export async function newBusinessEvent(params, type) {
    return request(`/BusinessEvent/Save`, {
        method: "post",
        body: JSON.stringify(params)
    });
}

//删除流程事件
export async function removeBusinessEvent(params) {
    return request("/BusinessEvent/Remove", {
        method: "post",
        body: JSON.stringify(params)
    });
}

//单个流程事件详情
export async function getModifyBusinessEvent(params) {
    return request(`/BusinessEvent/Get?${qs.stringify(params)}`, {
        method: "get",
    });
}
//获取业务事件通知记录
export async function businessEventNotifyHistoryList(params) {
    return request("/BusinessEventNotifyHistory/GetListPaged", {
        method: "post",
        body: JSON.stringify(params)
    });
}
//重试失败的业务事件通知
export async function businessEventNotifyHistoryRetry(params) {
    return request(`${config.serverOpenApiIp}/BusinessEventNotifyHistory/Retry`, {
        method: "post",
        body: JSON.stringify(params)
    });
}