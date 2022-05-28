import request from '../../../utils/request';
import qs from 'qs';
// import {fileServer,serverOpenApiIp} from '../../../utils/config'
export async function GetTable(params) {
	return request(`/Report/GetTable`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})

}


export async function AttachmentsGetListPaged(params) {
	return request(`/Attachments/GetListPaged`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})

}
export async function AttachmentsNew(params) {
	return request(`/Attachments/New`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})

}


export async function GetFieldByTemplateId(params) {
	return request(`/FormTemplate/GetFieldByTemplateId`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params)

	})

}
export async function GetForModify(params) {
	return request(`${config.serverOpenApiIp}/Report/GetForModify`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})

}
export async function Modify(params) {
	return request(`${config.serverOpenApiIp}/Report/Modify`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})

}

export async function SearchText(params) {
	return request(`/Report/SearchText`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})

}
export async function UploadReport(params) {

	return request(`${config.fileServer}/api/FileUpload/UploadReport`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})

}
export async function New(params) {
	return request(`${config.serverOpenApiIp}/Report/New`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),

	})

}


export async function CombinedDataService(params) {
    return request(`/Report/CombinedData`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}

