import request from '../../utils/request';
import qs from 'qs';
// import { serverOpenApiIp } from '../../utils/config'
//表单模板列表
export async function GetListPaged(params) {
    params.hideProgress = false;
    params.Platform = "FormEngine"
    return request(`${config.serverOpenApiIp}/FormTemplate/GetListWithHistory`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),

    })
}
// 删除 模板
export async function deleteFormTemplate(params) {
    return request(`/FormTemplate/Remove`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}
// 删除 版本
export async function deleteFormVersion(params) {
    return request(`/FormTemplateVersion/Remove`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}
// 表单发布
export async function publishForm(params) {
    params.Platform = "NPF";
    return request(`${config.serverOpenApiIp}/FormTemplateVersion/Publish`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}
// 取消发布
export async function unpublishForm(params) {
    params.Platform = "NPF";
    return request(`${config.serverOpenApiIp}/FormTemplateVersion/UnPublish`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}
// 接口配置信息
export async function getInterfaceConfig() {
    return request(`/RemoteConfig/GetItems`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify({}),
    })
}
// 提交 修改的接口配置信息
export async function saveInterfaceConfig(params) {
    let wrapParams = {
        Items: params,
        Platform: "FormEngine"
    }
    return request(`${config.serverOpenApiIp}/RemoteConfig/Save`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(wrapParams),
    })
}
// 全部外部数据源
export async function dataSourceGetAll() {
    return request(`/SourceTypeConfig/GetAll`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
    })
}
//获取表单模板指定版本的所有信息
export async function getForModify(params) {
    return request(`/FormTemplate/GetForModify`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}
//新增、修改抓取规则
export async function newSourceAcquisitionConfig(params, type) {
    return request(`/SourceAcquisitionConfig/${type === 'new' ? 'New' : 'Modify'}`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}
//获取抓取规则
export async function getByFormTemplateVersionId(params) {
    return request(`/SourceAcquisitionConfig/GetByFormTemplateVersionId`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}
//立即触发数据抓取
export async function sourceAcquisitionConfigTrigger(params) {
    return request(`${config.serverOpenApiIp}/SourceAcquisitionConfig/Trigger`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}

//获取当前用户菜单树接口
export async function getUserFuncs(params) {
    return request(`${config.serverOpenApiIp}/DataPermission/GetUserFuncs`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}
