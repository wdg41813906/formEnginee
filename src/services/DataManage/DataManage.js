import request from '../../utils/request';
// import { serverOpenApiIp, serverIp } from '../../utils/config'
import qs from 'qs';

export async function getLocation(params) {
    return request("/Location/Get", {
        method: "post",
        body: JSON.stringify(params)
    });
}

export async function uploadFile(params) {
    return request("/Files/ImportExcel", {
        method: "post",
        body: params,
        headers: {
            "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW(CRLF)"
        }
    });
}

export async function getExcelSheets(params) {
    return request(`/FileBase/GetSheetNames?${qs.stringify(params)}`, {
        method: "get",
    });
}
export async function getExcel(params) {
    return request(`/FileBase/GetExcel?${qs.stringify(params)}`, {
        method: "get",
    });
}
// 导入 表格 第三步 表单设置 的 获取
// 获取 头部 和 获取 body 数据
export async function getResultExcelHeader(params) {
    return request(`/FileBase/GetExcelHead?${qs.stringify(params)}`, {
        method: "get",
    });
}
// 导入 表格数据
export async function importExcelData(params) {
    return request("/filebase/ImportExcelData", {
        method: "post",
        body: JSON.stringify(params)
    });
}
// 获取 台帐 头部
export async function GetTableHead(params) {
    params.PlatForm = "FormEngine";
    return request(`${config.serverOpenApiIp}/FormTemplateVersion/GetTableHead`, {
        method: "post",
        body: JSON.stringify(params)
    });
}
// 权限获取 header的 code
export async function GetTableHeadAll(params) {
    return request("/FormTemplateVersion/GetTableHead", {
        method: "post",
        body: JSON.stringify(params)
    });
}
// 获取 台帐 body QueryTable
export async function GetTableBody(params, isAdmin = false) {
    params.PlatForm = "FormEngine";
    return request(`${isAdmin ? config.serverIp : config.serverOpenApiIp}/FormTemplateVersion/QueryTable`, {
        method: "post",
        body: JSON.stringify(params)
    });
}
// 条件筛选 列表 接口
export async function getFieldItem(params) {
    return request("/FormInstance/GetDataSource", {
        method: "post",
        body: JSON.stringify(params)
    });
}
// 删除选中项
export async function deleteRow(params) {
    params.PlatForm = 'NPF';
    return request(`${config.serverOpenApiIp}/FormTemplateVersion/DeleteRow`, {
        method: "post",
        body: JSON.stringify(params)
    });
}

// 获取JSON
export async function getJSON(params) {
    return request("/ViewStyle/GetForModify", {
        method: "post",
        body: JSON.stringify(params)
    });
}
// 新增JSON
export async function setJSON(params) {
    return request("/ViewStyle/New", {
        method: "post",
        body: JSON.stringify(params)
    });
}
// 修改 JSON
export async function modifyJSON(params) {
    return request("/ViewStyle/Modify", {
        method: "post",
        body: JSON.stringify(params)
    });
}
// 修改 JSON
export async function getTableHeadJSON(params) {
    return request("/FormTemplateVersion/GetFormTemplateTableHead", {
        method: "post",
        body: JSON.stringify(params)
    });
}

// 获取当前表单页脚筛选条件
export async function GetForModify(params) {
    return request(`${config.serverIp}/ViewStyle/GetForModify`, {
        method: 'POST',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}

// 修改当前表单页脚筛选条件
export async function Modify(params) {
    return request(`${config.serverIp}/ViewStyle/Modify`, {
        method: 'POST',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}

// 新增当前表单页脚筛选条件
export async function SetNew(params) {
    return request(`${config.serverIp}/ViewStyle/New`, {
        method: 'POST',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}
