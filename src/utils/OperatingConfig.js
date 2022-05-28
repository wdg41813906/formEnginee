const operatingList = {
    Delete: 0,
    Add: 1,
    Update: 2,
    Constant: 3
};
const workflowStatus = [
    { value: 0, title: '未提交' },
    { value: 1, title: '驳回' },
    { value: 2, title: '运行中' },
    { value: 3, title: '结束' },
    { value: 4, title: '未找到审批人' },
    { value: 5, title: '撤销' },
    { value: 6, title: '作废' }
]
module.exports = {
    operatingList,
    workflowStatus
}
