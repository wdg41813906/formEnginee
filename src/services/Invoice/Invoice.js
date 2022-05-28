import request from '../../utils/request';



//更改标签
export async function EditCategory(params) {
    return request(`${config.serverInvoiceAssistantOpenApiIp}/InvoiceAssistant/BatchModifyCategory`, {
        method: 'POST',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params)
    })
}

//获取标签
export async function GetInvoiceCategory(params) {
    params.Platform = 'NPF';
    return request(`${config.serverInvoiceAssistantApiIp}/InvoiceCategory/GetListPaged`, {
        method: 'POST',
        mode: 'cors',
        // headers: {
        //     'Authorization': 'Bearer 9S2JZjIwnQeWVxMyhz2TulWkHfT1xyi6bkmbMha9xf39i/I43dGZlFOOJTDsv2TRLhP4Cxfo2EOJtkDwg1lxpLWtz9hpte3D2RsZiEyO0WFxc39evbbiNEndHwQRNdQezSsR4LcbEWAUh126JJ28E4ijCsu4F9NAz4lNLwssOGFIz2OvE52nDLJ3Nda+MsLZNCrLLWVczNa5sPUVSr52FVWLT6fmF/zj77LHdrJdGVxkQMmoyU7CnnygHGm8P4gHlBdE1FJhR2eCVW5aNEZ0Z+w3hRz61LwUSevV6Bf5HJ2g0Co6p2ZUO8V8d8C5ine8lMZsGvS7mgJRqj60ELXaovB8xJ38svO0r3cBNAgl/nvRrj2qtxWGZnZjPqZp/Chy'
        // },
        traditional: true,
        body: JSON.stringify(params)
    })
}
//获取专普票
export async function GetInvoiceFolder(params) {
    params.Platform = 'NPF';
    return request(`${config.serverOpenApiIp}/InvoiceFolder/GetListPaged`, {
        method: 'POST',
        mode: 'cors',
        // headers: {
        //     'Authorization': 'Bearer 9S2JZjIwnQeWVxMyhz2TulWkHfT1xyi6bkmbMha9xf39i/I43dGZlFOOJTDsv2TRLhP4Cxfo2EOJtkDwg1lxpLWtz9hpte3D2RsZiEyO0WFxc39evbbiNEndHwQRNdQezSsR4LcbEWAUh126JJ28E4ijCsu4F9NAz4lNLwssOGFIz2OvE52nDLJ3Nda+MsLZNCrLLWVczNa5sPUVSr52FVWLT6fmF/zj77LHdrJdGVxkQMmoyU7CnnygHGm8P4gHlBdE1FJhR2eCVW5aNEZ0Z+w3hRz61LwUSevV6Bf5HJ2g0Co6p2ZUO8V8d8C5ine8lMZsGvS7mgJRqj60ELXaovB8xJ38svO0r3cBNAgl/nvRrj2qtxWGZnZjPqZp/Chy'
        // },
        traditional: true,
        body: JSON.stringify(params)
    })
}
//获取交通票
export async function GetTrafficTicket(params) {
    params.Platform = 'NPF';
    return request(`${config.serverOpenApiIp}/TrafficTicket/GetListPaged`, {
        method: 'POST',
        mode: 'cors',
        // headers: {
        //     'Authorization': 'Bearer 9S2JZjIwnQeWVxMyhz2TulWkHfT1xyi6bkmbMha9xf39i/I43dGZlFOOJTDsv2TRLhP4Cxfo2EOJtkDwg1lxpLWtz9hpte3D2RsZiEyO0WFxc39evbbiNEndHwQRNdQezSsR4LcbEWAUh126JJ28E4ijCsu4F9NAz4lNLwssOGFIz2OvE52nDLJ3Nda+MsLZNCrLLWVczNa5sPUVSr52FVWLT6fmF/zj77LHdrJdGVxkQMmoyU7CnnygHGm8P4gHlBdE1FJhR2eCVW5aNEZ0Z+w3hRz61LwUSevV6Bf5HJ2g0Co6p2ZUO8V8d8C5ine8lMZsGvS7mgJRqj60ELXaovB8xJ38svO0r3cBNAgl/nvRrj2qtxWGZnZjPqZp/Chy'
        // },
        traditional: true,
        body: JSON.stringify(params)
    })
}
//保存
export async function Save(params) {
    params.Platform = 'NPF';
    return request(`${config.serverOpenApiIp}/Ticket/Save`, {
        method: 'POST',
        mode: 'cors',
        // headers: {
        //     'Authorization': 'Bearer 9S2JZjIwnQeWVxMyhz2TulWkHfT1xyi6bkmbMha9xf39i/I43dGZlFOOJTDsv2TRLhP4Cxfo2EOJtkDwg1lxpLWtz9hpte3D2RsZiEyO0WFxc39evbbiNEndHwQRNdQezSsR4LcbEWAUh126JJ28E4ijCsu4F9NAz4lNLwssOGFIz2OvE52nDLJ3Nda+MsLZNCrLLWVczNa5sPUVSr52FVWLT6fmF/zj77LHdrJdGVxkQMmoyU7CnnygHGm8P4gHlBdE1FJhR2eCVW5aNEZ0Z+w3hRz61LwUSevV6Bf5HJ2g0Co6p2ZUO8V8d8C5ine8lMZsGvS7mgJRqj60ELXaovB8xJ38svO0r3cBNAgl/nvRrj2qtxWGZnZjPqZp/Chy'
        // },
        traditional: true,
        body: JSON.stringify(params)
    })
}
export async function TrafficTicketGetList(params) {
    return request(`${config.serverIp}/TrafficTicket/GetList`, {
        method: 'POST',
        mode: 'cors',
        // headers: {
        //     'Authorization': 'Bearer 9S2JZjIwnQeWVxMyhz2TulWkHfT1xyi6bkmbMha9xf39i/I43dGZlFOOJTDsv2TRLhP4Cxfo2EOJtkDwg1lxpLWtz9hpte3D2RsZiEyO0WFxc39evbbiNEndHwQRNdQezSsR4LcbEWAUh126JJ28E4ijCsu4F9NAz4lNLwssOGFIz2OvE52nDLJ3Nda+MsLZNCrLLWVczNa5sPUVSr52FVWLT6fmF/zj77LHdrJdGVxkQMmoyU7CnnygHGm8P4gHlBdE1FJhR2eCVW5aNEZ0Z+w3hRz61LwUSevV6Bf5HJ2g0Co6p2ZUO8V8d8C5ine8lMZsGvS7mgJRqj60ELXaovB8xJ38svO0r3cBNAgl/nvRrj2qtxWGZnZjPqZp/Chy'
        // },
        traditional: true,
        body: JSON.stringify(params)
    })
}
export async function InvoicePoolGetList(params) {
    return request(`${config.serverIp}/InvoicePool/GetList`, {
        method: 'POST',
        mode: 'cors',
        // headers: {
        //     'Authorization': 'Bearer 9S2JZjIwnQeWVxMyhz2TulWkHfT1xyi6bkmbMha9xf39i/I43dGZlFOOJTDsv2TRLhP4Cxfo2EOJtkDwg1lxpLWtz9hpte3D2RsZiEyO0WFxc39evbbiNEndHwQRNdQezSsR4LcbEWAUh126JJ28E4ijCsu4F9NAz4lNLwssOGFIz2OvE52nDLJ3Nda+MsLZNCrLLWVczNa5sPUVSr52FVWLT6fmF/zj77LHdrJdGVxkQMmoyU7CnnygHGm8P4gHlBdE1FJhR2eCVW5aNEZ0Z+w3hRz61LwUSevV6Bf5HJ2g0Co6p2ZUO8V8d8C5ine8lMZsGvS7mgJRqj60ELXaovB8xJ38svO0r3cBNAgl/nvRrj2qtxWGZnZjPqZp/Chy'
        // },
        traditional: true,
        body: JSON.stringify(params)
    })
}