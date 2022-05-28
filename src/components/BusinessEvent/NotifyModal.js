import { Modal, Table, Icon, Pagination } from 'antd';
import TableFooter from "../../components/FormControl/common/TableFooter";
import styles from "./NotifyModal.less";

let retryArr = [];
class NotifyModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            visible: false,
            columns: [
                {
                    title: "事件名称",
                    dataIndex: "businessEventName",
                    key: "businessEventName",
                    width: 160
                }, {
                    title: "参数",
                    dataIndex: "parameters",
                    key: "parameters",
                    width: 250
                }, {
                    title: "URL",
                    dataIndex: "url",
                    key: "url",
                }, {
                    title: "创建时间",
                    dataIndex: "createTime",
                    key: "createTime",
                    width: 150
                }, {
                    title: "状态",
                    dataIndex: "notifyStatus",
                    key: "notifyStatus",
                    width: 120,
                    render: (text, record) => {
                        return retryArr.length > 0 && retryArr.indexOf(record.id) !== -1 ?
                            <span><Icon type="clock-circle" />完成</span> :
                            text === 0 ?
                                <span className={styles.warning}><Icon type="info-circle" />等待</span> :
                                text === 1 ?
                                    <span className={styles.success}><Icon type="check-circle" />成功</span> :
                                    <div>
                                        <span className={styles.error} title={record.remark}><Icon type="exclamation-circle" />失败</span>
                                        &nbsp;&nbsp;
                                        <span className={styles.error} onClick={() => { this.notifyRetry(record.id, record.businessEventNotifyId, record.parameters) }}><Icon type="play-circle" />重启</span>
                                    </div>
                    }
                }]
        }
    }
    notifyRetry = (id, notifyid, params, index) => {
        this.props.retry(id, notifyid, params);
        retryArr.push(id);
    }
    getPageTableData = page => {
        let { eventId, notifyPageInfo } = this.props;
        this.props.notifyHistoryShowModal({ id: eventId, current: page, pageSize: notifyPageInfo.pageSize, show: true });
    };
    componentWillUnmount() {
        retryArr = [];
    }
    render() {
        let { columns } = this.state;
        const { notifyVisible, notifyData, notifyPageInfo, eventId, retryStatus } = this.props;
        const { totalCount, pageIndex, pageSize, pageCount } = notifyPageInfo;
        const tableFooterPorps = {
            isSet: false,
            pageIndex,
            totalPage: pageCount,
            pageSize: pageSize,
            totalCount,
            getPageTableData: this.getPageTableData,
            selecChange: value => {
                this.props.notifyHistoryShowModal({ id: eventId, current: pageIndex, pageSize: value, show: true });
            },
            refresh: () => {
                this.props.notifyHistoryShowModal({ id: eventId, current: pageIndex, pageSize: pageSize, show: true });
            }
        };
        return (
            <div>
                <Modal
                    title="通知记录"
                    visible={notifyVisible}
                    onCancel={this.props.notifyModalCancel}
                    width="80%"
                    footer={null}
                    className={styles.notifyModel}
                >
                    <Table
                        bordered
                        rowKey={record => record.id}
                        size="middle"
                        scroll={{ y: document.body.clientHeight - 270 }}
                        columns={columns}
                        dataSource={notifyData}
                        pagination={false}
                        footer={() => JSON.stringify(notifyPageInfo) !== "{}" ?
                            <TableFooter {...tableFooterPorps} /> : null} />

                </Modal>
            </div>
        );
    }
}
export default NotifyModal;