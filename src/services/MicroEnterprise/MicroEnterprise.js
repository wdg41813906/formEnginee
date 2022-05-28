import request from '../../utils/request';

// 获取是否为小微企业判定内容
export async function GetBusinessComponent(params) {
    return request('/BusinessComponent/GetBusinessComponent', {
        method: 'POST',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}
