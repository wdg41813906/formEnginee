import fetch from 'dva/fetch';
// import config from './config.js'
import NProgress from 'nprogress';
import "nprogress/nprogress.css";
import queryString from 'query-string';
import { notification } from 'antd';

let token = null;//'Bearer so55xAzH0le6qAOpivNn2kXI3kI+29V38FvNUPiCzl/+U+mtpGjjCGbvIeQObRNd0wGB+FUWsMOQD0koTiHHivbkyrxhmwRJmUX6ajEW2qNFguLJAYoRvkf1tM0Fxb8O0C/HbM7jSjPXx0+KoM1l5iAnFlyWN+Jgm5yC7+yHWOJ1otuMAUkR0TbYMmnOkN9vK4bJujTO6orsu+qpRozy6hdWrB7FrieQKcNSKiERLzaF4LJsCahRUuGh17mtp72DWzv0gNdwAq8093Xv5U0MkALN+yugczyl4QMywhbSc6Od645G7RshFxYTa5DJawF5P3AO7W5jg/Sdd6HeaoicgcxKROc38bK7/yz4w2CJ1aK4jJV1h162KbvQaGTgEzIPHfowJXk8sv5ewTfGNoO/ZQHFPLvHpYSjWk6D9nIiots=';
// fetch(url, {
//   body: JSON.stringify(data), // must match 'Content-Type' header
//   cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//   credentials: 'same-origin', // include, same-origin, *omit
//   headers: {
//     'user-agent': 'Mozilla/4.0 MDN Example',
//     'content-type': 'application/json'
//   },
//   method: 'POST', // *GET, POST, PUT, DELETE, etc.
//   mode: 'cors', // no-cors, cors, *same-origin
//   redirect: 'follow', // manual, *follow, error
//   referrer: 'no-referrer', // *client, no-referrer
// })

let running = false;
let runningCount = 0;

function parseText(response) {
    return response.text();
}

function parseJSON(text) {
    //NProgress.done();
    try {
        return JSON.parse(text);
    }
    catch (e) {
        return text;
    }
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

function timeOutFetch(input, opts) {//定义新的fetch方法，封装原有的fetch方法
    //opts.credentials = 'include';//cookie附带：同域， include 跨域
    opts.mode = "cors";
    opts.cache = "no-cache";
    let fetchPromise = fetch(input, opts);
    let timeoutPromise = new Promise(function (resolve, reject) {
        // setTimeout(() => {
        //     reject({data: {error: '请求超时!'}})
        // }, isNaN(opts.timeOut) ? 30000 : parseInt(opts.timeOut, 10));
    });
    return Promise.race([fetchPromise, timeoutPromise]);
}

async function login(params) {
    debugger
    let loginUrl = `${config.serverOpenApiIp}/Login/login?${params}`;
    let maxRetry = 5;
    let count = 0;
    let r = false;
    while (count < maxRetry) {
        let result = await timeOutFetch(loginUrl,
            {
                method: 'post',
                traditional: true,
                body: '{}',
                headers: {
                    'Accept': 'application/json,text/plain,*/*',
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            })
            .then(checkStatus)
            .then(parseText)
            .then(parseJSON)
            .then(data => data)
            .catch((e) => {
                let error = '未知错误！';
                if (e.response) {
                    switch (e.response.status) {
                        case 401:
                            error = '验证过期！';
                            break;
                        case 404:
                            error = '请求地址无效！';
                            break;
                        case 500:
                            error = '服务器内部错误！';
                            break;
                        case 503:
                            error = '服务器连接失败！';
                            break;
                        default:
                            break;
                    }
                    ;
                }
                //报错提示:开发环境使用
                notification.error({
                    message: `请求错误 ${e.response ? e.response.status : ''}`,
                    description: error,
                });
                return { data: { error } };
            });
        if (result.success) {
            r = true;
            let { data, success, ...other } = result;
            token = 'Bearer ' + data;
            localStorage.setItem('author', JSON.stringify(other));
            localStorage.setItem('token', token);
            return true;
        }
        count++;
    }
    return new Promise((resolve, reject) => {
        r ? resolve(r) : reject(r);
    })
}

async function autoCheckLogin() {
    let query = queryString.parse(window.location.href.substr(window.location.href.indexOf('?')));
    //let query = queryString.parse('/#/accountBook?tabId=1dbf3daa-fd17-4c22-85d7-99824eb0a3db&formTemplateId=988b454e-cd85-a582-d00b-839b4a7c30b0&userId=475FC3FA-9833-416D-A1C5-E1E885E24C23&dutyId=A8123326-2BBB-477A-B768-480ED100E94F&feopapi1=userId,dutyId,platform&feopapi2=dutyId&platform=NPF');
    let toServerList = query.feopapi1 || '';
    if (toServerList === '')
        toServerList = [];
    else
        toServerList = toServerList.split(',');
    let checkList = query.feopapi2 || '';
    if (checkList === '')
        checkList = [];
    else
        checkList = checkList.split(',');
    let obj = {};
    toServerList.forEach(a => {
        obj[a] = query[a];
    });
    let r = new Promise(resolve => {
        resolve(true);
    });
    let params = queryString.stringify(obj);
    if (localStorage.getItem('token') === null) {
        r = login(params);
    }
    else {
        token = localStorage.getItem('token');
        let oldCheck = JSON.parse(localStorage.getItem('checkList') || '{}');
        checkList.forEach(a => {
            if (oldCheck[a] !== query[a]) {
                r = login(params)
            }
        });
    }
    let check = {};
    checkList.forEach(a => {
        check[a] = query[a];
    });
    localStorage.setItem('checkList', JSON.stringify(check));
    return r;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default async function request(url, options) {
    let r = await autoCheckLogin();
    // if (options.headers) {
    //     options.headers['Accept'] = 'application/json,text/plain,*/*';
    //     options.headers['Authorization'] = token;
    //     options.headers['Content-Type'] = 'application/json;charset=UTF-8';
    //     //options.headers['Content-Type'] = 'application/json;charset=UTF-8';
    // } else {
    //     options.headers = {
    //         'Accept': 'application/json,text/plain,*/*',
    //         'Content-Type': 'application/json;charset=UTF-8',//'application/json',
    //         'Authorization': token
    //     }
    // }
    options.headers = {
        'Accept': 'application/json,text/plain,*/*',
        'Authorization': token,
        'Content-Type': 'application/json;charset=UTF-8',
        ...options.headers,
    }
    let { configIp, hideProgress, ...other } = options;
    var serverip = configIp ? config[configIp] : config.serverIp;
    var httpUrl;
    if (url.indexOf('http') > -1 || url.indexOf('http') > -1) {
        httpUrl = url;
    } else {
        httpUrl = serverip + url;
    }
    if (running === false && hideProgress !== true)
        // NProgress.start();
    runningCount++;
    if (r)
        return timeOutFetch(httpUrl, other)
            .then(checkStatus)
            .then(parseText)
            .then(parseJSON)
            .then(data => ({ data }))
            .catch((e) => {
                let error = '未知错误！';
                if (e.response) {
                    switch (e.response.status) {
                        case 401:
                            error = '验证过期！';
                            break;
                        case 404:
                            error = '请求地址无效！';
                            break;
                        case 500:
                            error = '服务器内部错误！';
                            break;
                        case 503:
                            error = '服务器连接失败！';
                            break;
                        default:
                            break;
                    }
                    ;
                }
                //报错提示:开发环境使用
                notification.error({
                    message: `请求错误 ${e.response ? e.response.status : ''}`,
                    description: error,
                });
                return { data: { error } };
            })
            .finally(() => {
                runningCount--;
                if (runningCount === 0){
                    // NProgress.done();
                }
            })
    return new Promise((res, rej) => {
        res({ data: { error: '权限验证失败!' } })
    });
}
