import { submitTree } from "../../utils/com";
import { Modal, Table, message } from "antd";
import { BudgetMutexResult, GetStatus } from "./BusinessServer";

const columns = [
    {
        title: "编码",
        dataIndex: "BudgetIndexCode",
        align: "center"
    },
    {
        title: "报销项目名称",
        dataIndex: "BudgetIndexName",
        align: "center"
    },
    {
        title: "与",
        dataIndex: "or",
        align: "center",
        render: () => <span>与</span>
    },
    {
        title: "编码",
        dataIndex: "MutexBudgetIndexCode",
        align: "center"
    },
    {
        title: "报销项目名称",
        dataIndex: "MutexBudgetIndexName",
        align: "center"
    }];

/**
 * @return {string}
 */
function NumFormat(num) {
    return num.toString().replace(/\d+/, function(n) {
        return n.replace(/(\d)(?=(\d{3})+$)/g, function($1) {
            return $1 + ",";
        });
    });
}

function ConfirmModal(props) {
    console.log(props);

    function onOk() {
        const { proxyState: { result, resolve }, setProxyState } = props;
        const { Message, Data = "[]" } = result;
        setProxyState({
            visible: false
        });
        resolve({
            success: false,
            msg: Message,
            isCancel: true
        });
    }

    const { proxyState: { visible, result } } = props;
    const { State, Message, Data = "[]" } = result;
    let EndData = JSON.parse(Data) || [];
    // EndData.map((item, index) => {
    //     item.key = index;
    //     item.BudgeLeaf = NumFormat(Number(item.BudgeLeaf));
    //     item.FormDataValue = NumFormat(item.FormDataValue);
    // });

    return (
        <Modal
            visible={visible}
            width='60%'
            bodyStyle={{ height: 360 }}
            maskClosable={false}
            okText="确定"
            title="提示"
            cancelButtonProps={{
                style: {
                    display: "none"
                }
            }}
            onOk={onOk}
            closable={false}
        >
            <div style={{ margin: "12px 0" }}>下列报销项目不可在同一张表单上进行报销，请拆分表单报销：</div>
            <Table
                bordered={true}
                columns={columns}
                dataSource={EndData}
                pagination={false}
                rowKey={(record, index) => index}
            />
        </Modal>
    );
}

export default {
    name: "报销科目互斥校验",
    summary: "报销科目互斥校验",
    key: "BudgetMutexResult",
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
        return new Promise(resolve => {
            let BeforeBusinessComponents;
            bussinessComponentsList.map(a => {
                ["BudgetCostResult", "BudgetApplicationResult", "BudgetAllocationResult"].map(b => {
                    if (a === b) {
                        BeforeBusinessComponents = a;
                    }
                });
            });
            getOtherBussinessProxyState({
                businessKey: BeforeBusinessComponents,
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
                                        result = await BudgetMutexResult({
                                            formData: submitTree(submitData, formList, formInstanceId, data.workFlowStatus, data.workFlowId),
                                            formId: formTemplateId,
                                            formInstanceId: formInstanceId
                                        });
                                        result.instanceID = data.workFlowId;
                                    } else {
                                        result = await BudgetMutexResult({
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

                    debugger;
                    if (SubmitForConfirmation) {
                        SaveBeforeTreeData().then(res => {
                            resolve(res);
                        });
                    } else {
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
                                        Message: "用户取消提交",
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
