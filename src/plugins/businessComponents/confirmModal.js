import { Modal, Table, message } from "antd";
import {
    CancelResult
} from "./BusinessServer";
import styles from "./confirmModal.less";
import "./confirmModal.less";

const moneyRender = val => <div style={{ textAlign: 'right' }}>{format(val)}</div>;
//格式化数字
function format(number) {
    const num = number && Number(number).toFixed(2);
    const regExpInfo = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g;
    return num ? num.replace(regExpInfo, "$1,") : null;
}

const columns = [{
    title: "预算年度",
    dataIndex: "BudgetYear",
    align: "center",
    key: "BudgetYear"
},
    {
        title: "预算部门名称",
        dataIndex: "OrgName",
        align: "center",
        key: "OrgName"
    },
    {
        title: "预算科目名称",
        dataIndex: "BudgetIndexName",
        align: "center",
        key: "BudgetIndexName"
    },
    {
        title: "预算科目余额",
        dataIndex: "BudgeLeaf",
        key: "BudgeLeaf",
        align: "center",
        className: "align-right",
        render: moneyRender,
    },
    {
        title: "提交金额",
        dataIndex: "FormDataValue",
        key: "FormDataValue",
        align: "center",
        className: "align-right",
        render: moneyRender,
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
    function onOk() {
        const { proxyState: { result, resolve }, setProxyState } = props;
        const { Message, Data = "[]" } = result;
        let EndData = JSON.parse(Data);
        setProxyState({
            visible: false
        });
        let Stop = EndData.find(a => a.ErrorType === "RigidOver") || {};
        resolve({
            success: Object.keys(Stop).length === 0,//true,
            msg: Message
        });
    }


    function onCancel() {
        const { proxyState: { result, resolve, bussinessComponentsList, instanceID, query }, setProxyState } = props;
        const { Message, Data = "[]" } = result;
        let EndData = JSON.parse(Data);
        let author = JSON.parse(localStorage.getItem("author") || "{}");
        let other = ["BudgetCostResult", "BudgetApplicationResult", "BudgetAllocationResult"];
        let Requst = ["COSTProcessUndo", "BUDGET_ALLOCATIONProcessUndo", "APPLY_COSTProcessUndo"];
        setProxyState({
            visible: false
        });
        let Stop = EndData.find(a => a.ErrorType === "RigidOver") || {};
        if (Object.keys(Stop).length === 0) {
            if (!query.sourceType) {
                bussinessComponentsList.map(a => {
                    other.map((b, index) => {
                        if (b === a) {
                            CancelResult({
                                instanceID: instanceID,
                                userInfo: {
                                    userID: author.userId,
                                    userName: author.userName,
                                    deptID: author.currentDeptId,
                                    deptName: author.currentDeptName
                                },
                                auditInfo: {
                                    esignature: null
                                }
                            }, Requst[index]).then(res => {
                                if (res.data.success) {
                                    message.success("预算金额释放成功!");
                                } else {
                                    message.error("预算金额释放失败!");
                                }
                            });
                        }
                    });
                });
            }
        }
        resolve({
            success: false,
            msg: Message,
            isCancel: true
        });
    }

    const { proxyState: { visible, result } } = props;
    const { State, Message, Data = "[]" } = result;
    let EndData = JSON.parse(Data);
    EndData.map((item, index) => {
        item.key = index;
        // item.BudgeLeaf = NumFormat(Number(item.BudgeLeaf));
        // item.FormDataValue = NumFormat(item.FormDataValue);
    });

    return (
        <Modal
            visible={visible}
            width='60%'
            bodyStyle={{ height: 360 }}
            maskClosable={false}
            okText="继续提交"
            cancelText="取消"
            title="预算校验结果"
            okButtonProps={{
                style: {
                    display: Object.keys(EndData.find(a => a.ErrorType === "RigidOver") || {}).length ? "none" : "inline"
                }
            }}
            onOk={onOk}
            onCancel={onCancel}
        >
            <Table
                bordered={true}
                columns={columns}
                dataSource={EndData}
                rowClassName={record => record.ErrorType === "RigidOver" ? styles.red : styles.yellow}
                pagination={false}
            />
            <p style={{ color: "#ff6666", margin: "1em 0" }}>
                {
                    Message
                }
            </p>
        </Modal>
    );
}

export default ConfirmModal;
