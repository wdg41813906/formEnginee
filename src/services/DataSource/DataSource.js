import request from '../../utils/request';
// import { serverOpenApiIp } from '../../utils/config';
import qs from 'qs';

//数据源列表
export async function getDataSourceList(params) {
    return request('/SourceTypeConfig/GetListPaged', {
        method: "post",
        body: JSON.stringify(params)
    });
}
//外部源数据
export async function requestData(url, method, body, form, headers) {
    let isForm = JSON.stringify(form) === "{}";
    let isbody = JSON.stringify(body) === "{}";
    return request(isForm ? url : `${url}?${qs.stringify(form)}`, {
        method,
        body: isbody ? undefined : JSON.stringify(body),
        headers
    });
}
//新增数据源
export async function newDataSource(params, type) {
    return request(`/SourceTypeConfig/${type === 'add' ? 'New' : 'Modify'}`, {
        method: "post",
        body: JSON.stringify(params)
    });
}
//删除单个数据源
export async function removeDataSource(params) {
    return request('/SourceTypeConfig/Remove', {
        method: "post",
        body: JSON.stringify(params)
    });
}
//复制数据源
export async function copyDataSource(params) {
	return request("/SourceTypeConfig/Copy", {
		method: "post",
		body: JSON.stringify(params)
	});
}

//发布单个数据源
export async function publishDataSource(params, type) {
    return request(`/SourceTypeConfig/${type === 'publish' ? 'Publish' : 'UNPublish'}`, {
        method: "post",
        body: JSON.stringify(params)
    });
}

//单个数据源详情
export async function getModifyDataSource(params) {
    return request('/SourceTypeConfig/GetForModify', {
        method: "post",
        body: JSON.stringify(params)
    });
}

//全部系统
export async function getAllWebHook(params) {
    return request('/WebHook/GetAll', {
        method: "post",
    });
}

//相应系统返回键值
export async function getDynamicValue(params) {
    return request(`${config.serverOpenApiIp}/WebHook/GetDynamicValue`, {
        method: "post",
        body: JSON.stringify(params),
    });
}
