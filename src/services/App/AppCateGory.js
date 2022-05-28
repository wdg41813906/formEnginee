import request from '../../utils/request';
import qs from 'qs';
export async function query(params) {
	return request(`/AppCateGory/GetListPaged`, {
		method: "post",

		body: JSON.stringify(params)

	})


}
export async function remove(params) {
	return request(`/AppCateGory/Remove`, {
		method: "post",

		body: JSON.stringify(params)
	})
	/*
	return request(`/api/Users/Delete?${qs.stringify(params)}`,{
		method:'get',

	})
	*/
}
export async function create(params) {
	return request(`/AppCateGory/New`, {
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
