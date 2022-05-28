import request from "../../utils/request";
import qs from "qs";

//新增按钮
export async function NewButton(params) {
    return request(`/Button/New`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//删除按钮
export async function RemoveButton(params) {
    return request(`/Button/Remove`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}


//修改按钮
export async function ChangeButton(params) {
    return request(`/Button/Modify`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//根据主键获取按钮
export async function GetButton(params) {
    return request(`/Button/GetForModify`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//根据表单ID(formid)获取按钮列表
export async function GetButtonByFormId(params) {
    return request(`/Button/GetListPaged`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//获取表单所有按钮
export async function GetAllButton(params) {
    return request(`/Button/GetFormAllButtons`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

