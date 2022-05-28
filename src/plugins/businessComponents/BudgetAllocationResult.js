import { BudgetAllocationResult, GetStatus } from "./BusinessServer";
import FORM_TYPE from "../../enums/FormType";
import ConfirmModal from "./confirmModal";
import { Modal } from "antd";
import { submitTree } from "../../utils/com";

export default {
    name: "预算调拨/申请",
    summary: "预算调拨/申请",
    key: "BudgetAllocationResult",
    onLoaded: async ({
                         query, proxyState, setPermission, setSubmitInfo,
                         setProxyState, readOnly, workFlowId, formInstanceId
                     }) => {
        setProxyState({
            query: query,
            formInstanceId: formInstanceId
        });
    },
    beforeSave: async ({ query, params, proxyState, setProxyState, submitData, formList, getOtherBussinessProxyState, submitName, bussinessComponentsList }) => {

        if (submitName === "暂存") {
            return {
                success: true
            };
        }
        setProxyState({
            SubmitForConfirmation: true
        });
        let { formInstanceId } = proxyState;
        let { formTemplateId } = proxyState.query;
        debugger;
        return new Promise(resolve => {
            getOtherBussinessProxyState({
                businessKey: "BudgetMutexResult",
                onSuccess: ({ otherProxyState }) => {
                    let { SubmitForConfirmation } = otherProxyState;
                    function SaveBeforeTreeData() {
                        return new Promise(_resolve => {
                            getOtherBussinessProxyState({
                                businessKey: "workFlow", onSuccess: async ({ otherProxyState }) => {
                                    var result;
                                    if (proxyState.query.sourceType && proxyState.query.sourceType === "todoTask") {
                                        let { data } = await GetStatus({
                                            EntityId: formInstanceId
                                        });
                                        result = await BudgetAllocationResult({
                                            formData: submitTree(submitData, formList, formInstanceId, data.workFlowStatus, data.workFlowId),
                                            formId: formTemplateId,
                                            formInstanceId: formInstanceId
                                        });
                                        result.instanceID = data.workFlowId;
                                    } else {
                                        result = await BudgetAllocationResult({
                                            formData: submitTree(submitData, formList, formInstanceId, 1, otherProxyState.instanceID),
                                            formId: formTemplateId,
                                            formInstanceId: formInstanceId
                                        });
                                        result.instanceID = otherProxyState.instanceID;
                                    }
                                    _resolve(result);
                                }
                            });
                        });
                    }
                    if(SubmitForConfirmation){
                        SaveBeforeTreeData().then(res => {
                            resolve(res);
                        });
                    }else {
                        Modal.confirm({
                            title: "提交确认",
                            content: "确认执行此次操作?",
                            okText: "确认",
                            cancelText: "取消",
                            onOk() {
                                SaveBeforeTreeData().then(res => {
                                    resolve(res);
                                });
                            },
                            onCancel() {
                                resolve({
                                    data: {
                                        success: false,
                                        msg: "用户取消提交",
                                        isCancel: true
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }).then(result => {
            console.log(result);
            debugger;
            if (result.data.Data) { //有数组得情况下，直接弹窗判断
                return new Promise(resolve => {
                    setProxyState({
                        resolve,
                        visible: true,
                        query,
                        result: result.data,
                        instanceID: result.instanceID,
                        bussinessComponentsList
                    });
                });
            }
            debugger;
            //无数组得情况下，成功直接提交，不成功直接失败
            if (result.data.State) {
                return {
                    success: true,
                    msg: result.data.Message
                };
            }
            debugger;
            return {
                success: false,
                isCancel: result.data.isCancel,
                msg: result.data.Message
            };
        });
    },
    //控件注入
    components: ConfirmModal,
    initialProxyState: {
        visible: false,
        SubmitForConfirmation: false,
        result: {}
    }
};
