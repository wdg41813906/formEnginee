import request from "../../utils/request";

function BudgetHttp(url, params) {
    return fetch(`${url}`, {
        ...params,
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Accept": "application/json,text/plain,*/*",
            "Content-Type": "application/json;charset=UTF-8"
        }
    }).then(response => response.json()).then(data => {
        return { data };
    });
}

// 互斥校验接口
export async function BudgetMutexResult(params) {
    return BudgetHttp(`${config.MutexResult}/Externalinterface/BudgetMutexResult`, {
        // return BudgetHttp(`http://171.221.227.116:7313/Externalinterface/BudgetMutexResult`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

// 预算花费接口
export async function BudgetCostResult(params) {
    console.log(params);
    return BudgetHttp(`${config.budgetCost}/Externalinterface/BudgetCostResult`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

// 预算申请花费
export async function BudgetApplicationResult(params) {
    return BudgetHttp(`${config.budgetCost}/Externalinterface/BudgetApplicationResult`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}


// 预算调拨/申请
export async function BudgetAllocationResult(params) {
    return BudgetHttp(`${config.budgetCost}/Externalinterface/BudgetAllocationResult`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}


//预算状态
export async function GetStatus(params) {
    return request(`${config.serverIp}/FormInstance/GetForModify`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}


// 关于预算的 取消
export async function CancelResult(params, add) {
    return BudgetHttp(`${config.budgetCost}/Externalinterface/${add}`, {
        method: "POST",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}


