import React from 'react';
import { Modal, Table, Button } from 'antd';
import styles from './WebHookPreview.less';

class WebHookPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			columns: [
				{ title: "URL", dataIndex: "url", key: "url" },
				{ title: "接口名称", width: 150, dataIndex: "name", key: "name" },
				{
					title: "传输类型",
					width: 100,
					dataIndex: "methodType",
					key: "methodType",
					render: text => <span>{text === 0 ? "Get" : "Post"}</span>
				},
				{
					title: "参数",
					width: 80,
					render: (text, record) => <span>{record.appSettingActionRequests.length > 0 ? "有" : "无"}</span>
				}
			]
		};
    }

    cancelWebHookPreview = () => {
        this.props.dispatch({
            type: 'webHook/cancelWebHookPreview',
        })
    }
    render() {
        let { columns } = this.state;
        const { previewModelVisible, modifyData } = this.props;
        const expandedRowRender = record => {
            const columnexpanded = [
                {
                    title: '参数名',
                    dataIndex: 'key',
                    key: 'key',
                }, {
                    title: '请求方式',
                    dataIndex: 'requestType',
                    key: 'requestType',
                    render: (text) => <span>{text === 0 ? 'Body' : text === 1 ? 'Url' : 'Header'}</span>
                }, {
                    title: '参数值',
                    dataIndex: 'value',
                    key: 'value',
                },
            ];
            return (
                <Table
                    columns={columnexpanded}
                    dataSource={record.appSettingActionRequests}
                    pagination={false}
                    rowKey={record => record.id}
                />
            );
        };
        return (
            <div>
                <Modal
                    width={900}
                    title="预览第三方系统"
                    visible={previewModelVisible}
                    onCancel={this.cancelWebHookPreview}
                    footer={<Button onClick={this.cancelWebHookPreview}>关闭</Button>}
                    maskClosable={false}
                >
                    <div className={styles.preview}>
                        <p>系统名称：{modifyData.name}</p>
                        <Table
                            bordered
                            columns={columns}
                            expandedRowRender={expandedRowRender}
                            dataSource={modifyData.webHookAppActionRequests}
                            rowKey={record => record.id}
                            pagination={false}
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}

export default WebHookPreview;
