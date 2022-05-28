import request from '../../../utils/request';
import qs from 'qs';
export async function query(params) {

	//return request(`/api/users?${qs.stringify(params)}`)
//debugger
	return request(`/Report/GetListPaged`, {
		method: "post",
		body: JSON.stringify(params)
	})


}
export async function Remove(params) {
	return request(`/Report/Remove`, {
		method: "post",
		mode: 'cors',
        traditional: true,
		body:JSON.stringify(params),
		
	})
	
}
