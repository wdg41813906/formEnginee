import React from 'react';
import { Modal, Form, Select } from 'antd';
const { Option } = Select;

class WebHookModel extends React.Component {
    constructor(props) {
        super(props);
        this.webHookId = '';
        this.state = {
            webHookAppViewData: []
        }
    }
    cancelWebHookSelect = () => {
        this.props.dispatch({
            type: 'dataSource/cancelWebHookSelect',
        })
    }
    nameChange = (value) => {
        this.webHookId = value.split('/');
        const { setFieldsValue } = this.props.form;
        const { webHookData } = this.props;
        let webHookAppViewData = webHookData.filter(v => v.id === this.webHookId[0]);
        this.setState({ webHookAppViewData: webHookAppViewData[0].webHookAppViewResponses })
        setFieldsValue({
            WebHookAppId: undefined
        })
    }
    submitWebHookSelect = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let webhook = JSON.parse(values.WebHookAppId);
                webhook.webHookId = this.webHookId[0];
                webhook.webHookName = this.webHookId[1];
                this.props.selectReturnKey(webhook)
                this.props.dispatch({
                    type: 'dataSource/getDynamicValue',
                    payload: webhook.id
                })
            }
        })
    }
    render() {
        let { webHookAppViewData } = this.state;
        const { getFieldDecorator } = this.props.form;
        const { isSelectWebHokkModelVisible, webHookData, isWebHokkModelconfirmLoading } = this.props;
        console.log('webHookData', webHookData)
        return (
            <div>
                <Modal
                    width={600}
                    title="选择第三方系统"
                    visible={isSelectWebHokkModelVisible}
                    onOk={this.submitWebHookSelect}
                    confirmLoading={isWebHokkModelconfirmLoading}
                    onCancel={this.cancelWebHookSelect}
                >
                    <Form>
                        <Form.Item label="系统" style={{ marginBottom: '5px' }}>
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: '请选择系统' }],
                            })(
                                <Select onChange={this.nameChange} placeholder="请选择系统">
                                    {webHookData.length > 0 ? webHookData.map((item, index) => {
                                        return <Option value={`${item.id}/${item.name}`} key={index}>{item.name}</Option>
                                    }) : null}

                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="URL">
                            {getFieldDecorator('WebHookAppId', {
                                rules: [{ required: true, message: '请选择URL' }],
                            })(
                                <Select placeholder="请选择URL">
                                    {webHookAppViewData.length > 0 ? webHookAppViewData.map((item, index) => {
                                        return <Option value={JSON.stringify(item)} key={index}>{item.url}</Option>
                                    }) : null}

                                </Select>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}

export default Form.create({})(WebHookModel);
