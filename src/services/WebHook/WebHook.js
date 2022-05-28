import request from "../../utils/request";
import qs from "qs";

//第三方系统列表
export async function getWebHookList(params) {
	return request("/WebHook/GetListPaged", {
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

//新增第三方系统
export async function newWebHook(params, type) {
	return request(`/WebHook/${type === "add" ? "New" : "Modify"}`, {
		method: "post",
		body: JSON.stringify(params)
	});
}

//删除单个第三方系统
export async function removeWebHook(params) {
	return request("/WebHook/Remove", {
		method: "post",
		body: JSON.stringify(params)
	});
}

//单个第三方系统源详情
export async function getModifyWebHook(params) {
	return request("/WebHook/GetForModify", {
		method: "post",
		body: JSON.stringify(params)
	});
}
