import request from '../../utils/request';
import qs from 'qs';


let body = {
    table: "UTb201907261411361138615717", // 表Code，可为空。 如果能拿到表单Code就传，拿不到就后台通过字段自己去找
    column: "fld20190726141145833321244", // 字段code，必传
    value: "hello world" // 字段值，必传
}

//第三方系统列表
export async function checkUnique(params) {
    return request('/FormInstance/ExistsValue', {
        method: "post",
        body: JSON.stringify(params)
    });
}