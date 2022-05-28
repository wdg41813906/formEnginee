import request from '../../utils/request';
import qs from 'qs';
// import { serverOpenApiIp } from '../../utils/config'
export async function save(params, act) {
    return request(`/FormTemplate/` + act, {
        method: 'post',
        //mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
        headers: {
            //'Content-Type': 'application/json'
            //'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}
export async function detail(params) {
    params.Platform = 'NPF';
    return request(`${config.serverOpenApiIp}/FormTemplate/GetForModify?${qs.stringify(params)}`, {//formTemplateId=0514f22b-b779-eb25-694f-3d8a4ed83fc3&companyId=6EBBCF53-EC99-4380-B237-994D73E4F592`, {
        method: 'get',
        //mode: 'cors',
        traditional: true,
        //body: JSON.stringify(params),
        headers: {
            //'Content-Type': 'application/json'
            //'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}
