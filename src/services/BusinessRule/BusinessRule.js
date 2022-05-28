import request from '../../utils/request';
import qs from 'qs';
export async function SavePush(params) {
	return request(`/PushRelation/SavePush`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})

}
export async function Remove(params) {
	return request(`/PushRelation/Remove`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})
}
export async function GetFormTemplateWithFieldByIds(params) {
	return request(`/FormTemplate/GetFormTemplateWithFieldByIds`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})
}

export  function CheckPushTigger(params) {
	return request(`/PushRelation/CheckPushTigger`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})
}

export async function GetListPaged(params) {
	return request(`/PushRelation/GetListPaged`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})
}


export async function GetById(params) {
	return request(`/PushRelation/GetById`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})
}
export async function PushQueuePage(params) {
	return request(`/PushQueue/GetListPaged`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})
}
export async function SourceTypeConfigAll(params) {
//	return request(`/SourceTypeConfig/GetAllWithPush`, {
		return request(`/SourceTypeConfig/GetAllWithPush`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})
}
export async function GetAllParametersWithPush(params) {
    return request(`/SourceTypeConfig/GetAllParametersWithPush`, {
        method: "post",
        mode: 'cors',
        traditional: true,
        body:JSON.stringify(params),
        
    })
}
export async function GetFormTemplateWithFieldPaged(params) {
	//	return request(`/SourceTypeConfig/GetAllWithPush`, {
			return request(`/FormTemplate/GetFormTemplateWithFieldPaged`, {
			method: "post",
			mode: 'cors',
			traditional: true,
			body:JSON.stringify(params),
	
		})
	}


