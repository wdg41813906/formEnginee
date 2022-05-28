/**
 * @file
 * @author: fanty
 *
 * 写文件功能
 */
import { notification, message, Modal } from "antd";
import request from "utils/request";
import { GetWorkflowAuditOpinionApi } from "../../../src/services/Workflow/Workflow";
// import { serverOpenApiIp, serverIp, serverPrintIp } from '../../utils/config';
import qs from "qs";


export const GetPrintPaste = async ({ FormTemplateVersionId, FormInstanceId }) => {
    // 获取打印对象
    const print = new SYLaunch();
    console.log(FormTemplateVersionId, FormInstanceId);
    const promiseUrl = new Promise(resolve => {
        // 获取dataModal 请求
        const data = request(
            `${config.serverOpenApiIp}/PrintManage/GetPrintStickJson`,
            {
                method: "post",
                traditional: true,
                mode: "get",
                body: JSON.stringify({
                    EntityId: FormInstanceId,
                    Platform: "NPF"
                })
            }
        );
        resolve(data);
    });

    promiseUrl
        .then(result => {
            if (result.data && result.data.isValid) {
                return request(`${config.serverIp}/PrintTemplate/GetByFormTemplateVersionId`, {
                    method: "post",
                    traditional: true,
                    mode: "cors",
                    body: JSON.stringify({
                        FormTemplateVersionId
                    })
                }).then(data => {
                    return Promise.resolve({ templateParam: data, dataModelParam: result.data.data });
                });
            } else {
                message.error(result.data.errorMessages);
            }
        })
        .then(({ templateParam, dataModelParam }) => {
            // Todo (fanty): 优化一下代码，看一下双重Promise的写法，看下打印组件的问题，前后端基本没问题
            let { data } = templateParam;
            console.log("templateParam", data);
            if (data.isValid) {
                const { orgId, code, title } = data;
                const previewParam = {
                    title,
                    templateUrl: `${config.serverPrintIp}/Printshop/GetTemplateContent?Code=${config.Code}&OrgId=${config.OrgId}`,
                    opts: {
                        data: (typeof dataModelParam === "string") ? JSON.parse(dataModelParam) : dataModelParam
                    },
                    callback: getStatus
                };
                print.gppPluginPreview(previewParam);
            } else {
                message.error(data.errorMessages);
                // notification.error({
                // 	message: "该表单未创建打印模板"
                // });
            }
        });
};

export const getPrintPreview = async (FormTemplateVersionId, FormInstanceId) => {
    // 获取打印对象
    const print = new SYLaunch();

    const promiseUrl = new Promise(resolve => {
        // 获取dataModal 请求
        const data = request(
            `${config.serverOpenApiIp}/FormInstance/GetPrintDataJson?FormInstanceId=${FormInstanceId}&FormTemplateVersionId=${FormTemplateVersionId}&Platform=FormEngine`,
            {
                method: "get",
                traditional: true,
                mode: "get"
            }
        );

        resolve(data);
    });

    promiseUrl
        .then(result => {
            // 获取origId, code , title 的异步请求
            return request(`${config.serverIp}/PrintTemplate/GetByFormTemplateVersionId`, {
                method: "post",
                traditional: true,
                mode: "cors",
                body: JSON.stringify({
                    FormTemplateVersionId
                })
            }).then(data => {
                return Promise.resolve({ templateParam: data, dataModelParam: result });
            });
        })
        .then(({ templateParam, dataModelParam }) => {
            //Todo (fanty): 优化一下代码，看一下双重Promise的写法，看下打印组件的问题，前后端基本没问题
            let { data } = templateParam;
            console.log("templateParam", data);
            if (data.isValid) {
                const { orgId, code, title } = data;
                GetWorkflowAuditOpinionApi({
                    FormInstanceId: FormInstanceId,
                    Platform: "NPF"
                }).then(res => {
                    if (res.data.isValid) {
                        const previewParam = {
                            title,
                            templateUrl: `${config.serverPrintIp}/Printshop/GetTemplateContent?Code=${code}&OrgId=${orgId}`,
                            extendUrl: "",
                            opts: {
                                orgId: orgId,
                                userId: JSON.parse(localStorage.getItem("author") || "{}").userId,
                                data: dataModelParam.data,
                                subReports: [
                                    {
                                        name: "Platform_AuditOpinion",
                                        code: "Platform_AuditOpinion",
                                        data:res.data.data
                                    }
                                ]
                            },
                            callback: getStatus
                        };
                        print.gppPluginPreview(previewParam);
                    } else {
                        message.error(res.data.errorMessages);
                    }
                });
            } else {
                message.error(data.errorMessages);
                // notification.error({
                // 	message: "该表单未创建打印模板"
                // });
            }
        });
};

export const getDesigner = async FormTemplateVersionId => {
    const print = new SYLaunch();
    // 获取code和templateId的请求
    const promise = new Promise((resolve, reject) => {
        const result = request(`${config.serverIp}/PrintTemplate/GetByFormTemplateVersionId`, {
            method: "post",
            traditional: true,
            mode: "cors",
            body: JSON.stringify({
                FormTemplateVersionId
            })
        });
        resolve(result);
    });

    promise.then(result => {
        if (result.data) {
            const { orgId, code, id: templateId } = result.data;
            const params = {
                // dataUrl: `${config.serverOpenApiIp}/Api/FormInstance/GetPrintDataJson?FormTemplateVersionId=${FormTemplateVersionId}&Platform=FormEngine`,
                templateUrl: `${config.serverPrintIp}/Printshop/GetTemplateContent?Code=${code}&OrgId=${orgId}`,
                saveUrl: `"Print/Save?TemplateId=${templateId}`,
                callback: getStatus
            };
            print.gppDesigner(params);
        } else {
            notification.error({
                message: "后台请求错误"
            });
        }
    });
};

function getStatus(resStatus) {
    console.log(resStatus, "status");
    if (!resStatus.State) {
        Modal.warning({
            title: "安装插件",
            centered: true,
            content: <div>
                <div>
                    请安装系统插件(
                    <a target="_blank" href={`${config.systemImageAdd}/gpp/resoures/setup.exe`}>
                        点击下载安装包
                    </a>)。
                </div>
                如已安装可尝试在开始菜单启动该程序。
            </div>,
            okText: "确定"
        });
        // notification.error({
        // 	message: resStatus.message
        // });
    }
}
