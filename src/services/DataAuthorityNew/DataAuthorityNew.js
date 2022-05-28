import request from '../../utils/request';
import qs from 'qs';
// import {serverPermissionApiIp,serverOpenApiIp} from '../../utils/config'

// 初始化数据权限
export async function initDataAuthority(params){
    return request(`${config.serverPermissionApiIp}/DataPermission/Get`,{
        method:"post",
        body:JSON.stringify(params)
    });
}
// 保存数据
export async function saveData(params){
    return request(`${config.serverOpenApiIp}/DataPermission/Save`,{
        method:"post",
        body:JSON.stringify(params)
    });
}
