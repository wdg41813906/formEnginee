
import TableFooter from "../../components/FormControl/common/TableFooter";
import { Table, Modal } from 'antd';
const columns = [

    {
        title: '执行状态',
        dataIndex: 'excuteStatus',
        width: 100,
        render(excuteStatus ) {
            var text = getExcute(excuteStatus)
            return <span>{text}</span>
        }
    },
    {
        title:'推送类型',
        dataIndex:'isRemote',
        width:100,
        render(isRemote){
            const text = isRemote?'远程接口':'内部表单'
            return <span>{text}</span>
        }
    },
    {
        title: '描述',
        dataIndex: 'remark',
    },
    {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 300,
    }
];
const getExcute = (status) => {
    let text = "";
    switch (status) {
        case 0:
            text = "待执行";
            break;
        case 1:
            text = "执行中";
            break;
        case 2:
            text = "已失败";
            break;
        case 3:
            text = "已成功";
            break;
    }

    return text;
}
const ActionLog = ({
    actionLogShow,
    actionLogShowToggle,
    logPagination,
    pushQueueList,
    getPushQueuePage,
    currentPushRelationId

}) => {
    const tableFooterPorps = {

        isSet: false,
        pageIndex: logPagination.pageIndex,
        totalPage: logPagination.pageCount,
        pageSize: logPagination.pageSize,
        totalCount: logPagination.totalCount,
         getPageTableData: (value)=>{
            getPushQueuePage(currentPushRelationId,value,logPagination.pageSize );
         },
        selecChange: (value) => {
            getPushQueuePage(currentPushRelationId,logPagination.pageIndex,value );
        },
        refresh: () => {
            getPushQueuePage( currentPushRelationId,logPagination.pageIndex, logPagination.pageSize);
        }
    }
    return (<div>
        <Modal
            title="推送日志"
            width='60%'
            style={{ height: 600 }}
            bodyStyle={{ overflow: 'hidden', padding: '0px 24px 10px' }}
            visible={actionLogShow}
            onOk={e => { actionLogShowToggle(false) }}
            onCancel={e => { actionLogShowToggle(false) }}
        >
            <Table columns={columns} dataSource={pushQueueList} pagination={false} scroll={{ y: 240 }} />
            <TableFooter {...tableFooterPorps} />
        </Modal>
    </div>)
}

export default ActionLog;