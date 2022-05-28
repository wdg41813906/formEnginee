import request from '../../utils/request';
//import qs from 'qs';
export async function getExternalData(params) {
    return request(`/forms/DataFilterMult`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
        hideProgress:true
        // headers: {
        //     "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        //     // 'Content-Type': 'application/json',
        //     // 'Content-Type': 'application/x-www-form-urlencoded',
        // }
    })
}