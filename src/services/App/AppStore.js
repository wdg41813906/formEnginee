import request from '../../utils/request';
import qs from 'qs';
export async function AppCateGoryGetAll(params) {
	return request(`/AppCateGory/GetAll`, {
		method: "post",
		body: JSON.stringify(params)
	})
}
export async function GetListPaged(params) {
	return request(`/AppStore/GetListPaged`, {
		method: "post",
		body: JSON.stringify(params)
	})
}

export async function remove(params) {
	return request(`/AppStore/Remove`, {
		method: "post",
		
		body: JSON.stringify(params)
	})
}
export async function RemoveByAppId(params) {
	return request(`/AppStore/RemoveByAppId`, {
		method: "post",
		
		body: JSON.stringify(params)
	})
}

export async function AppStoreCreate(params) {
	return request(`/AppStore/New`, {
		method: 'post',
		
		body: JSON.stringify(params),
	})
}
export async function update(params) {
	return request(`/AppCateGory/Modify`, {
		method: 'post',
		
		body: JSON.stringify(params)

	})
}