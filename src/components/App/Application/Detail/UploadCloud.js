
import { Form, Button, Select, Modal, Upload, Icon } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 14,
    }
}
class UploadCloud extends React.Component {
    constructor(props){
        super(props)
        this.props.AppCateGoryGetAll();
    }
    handelOk = () => {
        this.props.form.validateFields((errors) => {
            if (errors) {
                return;
            }
            const data = { ...this.props.form.getFieldsValue() }
           
            this.props.AppStoreCreate(data.name);
        })
    }
    render() {
        const {
            appInfo,
            uploadCloudShow,
            cateGoryList,
            form: {
                getFieldDecorator,
                validateFields,
                getFieldsValue,

            } } = this.props;
        return (
            <Modal
                title="上传应用中心"
                style={{ top: 100 }}
                visible={uploadCloudShow}
                onOk={() => this.handelOk()}
                onCancel={() => this.props.uploadCloudToggle()}
            >


                <Form horizontal="true">
                    <FormItem
                        label="应用类型:"
                        hasFeedback
                        {...formItemLayout}
                    >
                        {getFieldDecorator('name', {
                            initialValue: '',
                            rules: [
                                { required: true, message: '请选择应用类型' },
                            ],
                        })(
                            <Select  style={{ width: 240 }}>
                            {
                                cateGoryList.map(ele=>  
                                    <Option key={ele.id} value={ele.id}>{ele.name}</Option>)
                            }
                               
                            </Select>
                        )}
                    </FormItem>
                </Form>

            </Modal>)
    }
}

export default Form.create()(UploadCloud);