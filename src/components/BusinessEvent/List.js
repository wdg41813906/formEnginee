import React from "react";
import { Button, Table, Modal } from "antd";
import NewBusinessEvent from "./NewBusinessEvent";
import NotifyModal from "./NotifyModal";
import TableFooter from "../../components/FormControl/common/TableFooter";
import styles from "./List.less";
const { confirm } = Modal;

class List extends React.Component {
    constructor(props) {
        super(props);
        this.eventId = '';
        this.state = {
            selectedRowKeys: [],
            visible: false,
            columns: [
                {
                    title: "事件名称",
                    dataIndex: "name",
                    key: "name",
                },
                {
                    title: "事件类型",
                    dataIndex: "type",
                    key: "type",
                    render: text => <span>{text === 0 ? '流程事件' : text}</span>
                },
                {
                    title: "创建时间",
                    dataIndex: "createTime",
                    key: "createTime",
                },
                {
                    title: "操作",
                    key: "action",
                    width: 100,
                    render: (text, record) => (
                        <div>
                            <div className={styles.dataSourceoperating}>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon="edit"
                                    title="修改"
                                    onClick={() => { this.props.modifyShowModal(record.id) }}
                                />&nbsp;&nbsp;
                                <Button
                                    size="small"
                                    icon="notification"
                                    title="通知"
                                    onClick={() => { this.notifyHistoryShowModal(record.id) }}
                                />
                            </div>
                        </div>
                    )
                }
            ]
        };
    }
    notifyHistoryShowModal = (id) => {
        this.eventId = id;
        let params = { id, current: 1, pageSize: 10, show: false };
        this.props.notifyHistoryShowModal(params);
    }
    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    };
    delBusinessEvent = () => {
        let _this = this;
        confirm({
            title: '是否确认删除业务事件?',
            okType: 'danger',
            onOk() {
                _this.props.delBusinessEvent(_this.state.selectedRowKeys);
                _this.setState({ selectedRowKeys: [] });
            },

        });
    };
    getPageTableData = page => {
        let { pageSize } = this.props.formPageInfo;
        this.props.getBusinessEventList({ current: page, pageSize });
    };
    componentDidMount() {
        this.props.getBusinessEventList({ current: 1, pageSize: 10 });
        this.props.dataSourceGetAll();
    }
    render() {
        const { columns, selectedRowKeys } = this.state;
        const { data, isloading, formPageInfo, visible, dataSource, formTemplateId, btnLoading, modifyData, notifyVisible,
            notifyData, notifyPageInfo, retryStatus } = this.props;
        const { totalCount, pageIndex, pageSize, pageCount } = formPageInfo;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        const tableFooterPorps = {
            isSet: false,
            pageIndex,
            totalPage: pageCount,
            pageSize: pageSize,
            totalCount,
            getPageTableData: this.getPageTableData,
            selecChange: value => {
                this.props.getBusinessEventList({ current: pageIndex, pageSize: value });
            },
            refresh: () => {
                this.props.getBusinessEventList({ current: pageIndex, pageSize: pageSize });
            }
        };
        return (
            <div className={styles.event}>
                <div className={styles.listHead}>
                    业务事件
                    <div className={styles.operatBtn}>
                        <Button onClick={this.delBusinessEvent} type="danger" shape="round" disabled={!hasSelected}>
                            删除
                        </Button>&nbsp;&nbsp;
                        <Button className={styles.listAdd} onClick={this.props.showModal} type="primary" shape="round" icon="plus" size="default">
                            新增业务事件
                        </Button>
                    </div>
                </div>
                <div className={styles.table}>
                    <Table bordered rowKey={record => record.id} rowSelection={rowSelection} columns={columns}
                        dataSource={data} loading={isloading} pagination={false} />
                </div>
                {JSON.stringify(formPageInfo) !== "{}" ? <TableFooter {...tableFooterPorps} /> : null}
                {visible ?
                    <NewBusinessEvent
                        visible={visible}
                        handleCancel={this.props.showModal}
                        dataSource={dataSource}
                        newBusinessEvent={this.props.newBusinessEvent}
                        btnLoading={btnLoading}
                        formTemplateId={formTemplateId}
                        modifyData={modifyData} /> : null}
                {notifyVisible ?
                    <NotifyModal
                        notifyVisible={notifyVisible}
                        notifyModalCancel={this.props.notifyShowModal}
                        notifyData={notifyData}
                        notifyPageInfo={notifyPageInfo}
                        eventId={this.eventId}
                        retryStatus={retryStatus}
                        retry={this.props.retry}
                        notifyHistoryShowModal={this.props.notifyHistoryShowModal} />
                    : null}

            </div>
        );
    }
}

export default List;
