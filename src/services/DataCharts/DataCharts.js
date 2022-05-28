import request from '../../utils/request';

export async function DragSourceLiftList(params) {
    // '7EFE8D39-894E-199C-76C6-81ACBC671960'可用id
    return request(`/FormTemplate/GetFieldByTemplateId`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}

export async function SearchText(params) {
    return request(`/Report/SearchText`, {
        method: "post",
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}

export async function CombinedData(params) {
    return request(`/Report/CombinedData`, {
        method: 'post',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),
    })
}
