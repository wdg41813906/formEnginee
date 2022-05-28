import { Button, Form, Icon, Input, Modal, Select } from 'antd';
import { Guid } from "../../utils/com";
import { operatingList, workflowStatus } from "../../utils/OperatingConfig";
import styles from "./List.less";
const { Option } = Select;

let id = 0;
class NewBusinessEvent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modifyDataSoure: []
        }
    }
    handleOk = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let { modifyDataSoure } = this.state;
                const { modifyData } = this.props;
                let status = modifyData ? operatingList.Update : operatingList.Add;
                let data = {
                    id: modifyData ? modifyData.id : Guid(),
                    name: values.name,
                    type: values.type,
                    formTemplateId: this.props.formTemplateId,
                    condition: JSON.stringify({ workflowstatus: values.condition }),
                    operationStatus: status
                }
                let businessEventNotifyList = [];
                if (values.sourceTypeConfigId.length > 0) {
                    values.sourceTypeConfigId.forEach((item) => {
                        let isStatus = modifyDataSoure.find(v => v.sourceTypeConfigId === item)
                        let params = {
                            id: Guid(),
                            businessEventId: data.id,
                            sourceTypeConfigId: item,
                            operationStatus: isStatus ? operatingList.Constant : operatingList.Add
                        };
                        businessEventNotifyList.push(params);
                    })
                }
                let delData = modifyDataSoure.filter(v => v.operationStatus === 0)
                businessEventNotifyList = businessEventNotifyList.concat(delData);
                data.businessEventNotifyList = businessEventNotifyList;
                this.props.newBusinessEvent(data);
            }
        });
    };
    remove = k => {
        let { modifyDataSoure } = this.state;
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        if (keys.length === 1) {
            return;
        }
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
        modifyDataSoure.forEach((item, index) => {
            if (index === k)
                item.operationStatus = 0;
        })
        this.setState({ modifyDataSoure })
    };

    add = () => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(id++);
        form.setFieldsValue({
            keys: nextKeys,
        });
    };
    componentDidMount() {
        const { modifyData } = this.props;
        if (modifyData) {
            modifyData.businessEventNotifyList.forEach((item) => {
                this.add();
            })
            this.setState({ modifyDataSoure: modifyData.businessEventNotifyList })
        } else {
            this.add();
        }
    }
    componentWillUnmount() {
        id = 0;
    }

    render() {
        let { modifyDataSoure } = this.state;
        const { visible, dataSource, btnLoading, modifyData } = this.props;
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const formItemLayout = {
            labelCol: { xs: { span: 24 }, sm: { span: 5 }, },
            wrapperCol: { xs: { span: 24 }, sm: { span: 18 }, },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: { span: 24, offset: 0, },
                sm: { span: 18, offset: 5, },
            },
        };
        getFieldDecorator('keys', { initialValue: [] });
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => {
            return <Form.Item
                label="事件"
                key={k}
            >
                {getFieldDecorator(`sourceTypeConfigId[${k}]`, {
                    rules: [{ required: true, message: "请选择事件" }],
                    initialValue: modifyDataSoure[k] && modifyDataSoure[k].operationStatus !== 0 ? modifyDataSoure[k].sourceTypeConfigId : undefined
                })(<Select placeholder="选择事件">
                    {dataSource ? dataSource.map((item, index) => {
                        // if (item.interfaceMode === 3)
                        return <Option value={item.id} key={index}>{item.name}</Option>
                    }) : null}
                </Select>)}
                {keys.length > 1 ? (
                    <Icon
                        className={styles.delete}
                        type="minus-circle-o"
                        onClick={() => this.remove(k)}
                    />
                ) : null}
            </Form.Item>
        });
        return (
            <Modal
                title="新增业务事件"
                visible={visible}
                onOk={this.handleOk}
                onCancel={this.props.handleCancel}
                className={styles.eventModel}
                confirmLoading={btnLoading}
            >
                <Form {...formItemLayout}>
                    <Form.Item label="事件名称">
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: '请输入事件名称' }],
                            initialValue: modifyData && modifyData.name || undefined
                        })(<Input placeholder="事件名称" />)}
                    </Form.Item>
                    <Form.Item label="事件类型">
                        {getFieldDecorator('type', {
                            initialValue: 0
                        })(
                            <Select placeholder="选择事件类型">
                                <Option value={0}>流程事件</Option>
                            </Select>)}
                    </Form.Item>
                    <Form.Item label="流程状态">
                        {getFieldDecorator('condition', {
                            rules: [{ required: true, message: '请选择流程状态' }],
                            initialValue: modifyData && modifyData.condition !== null ? JSON.parse(modifyData.condition).workflowstatus : undefined
                        })(
                            <Select placeholder="选择流程状态">
                                {workflowStatus.map((item, index) => {
                                    return <Option key={index} value={item.value}>{item.title}</Option>
                                })}
                            </Select>)}
                    </Form.Item>
                    {formItems}
                    <Form.Item {...tailFormItemLayout}>
                        <Button type="dashed" onClick={this.add}>
                            <Icon type="plus" />添加API
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

export default Form.create({})(NewBusinessEvent);