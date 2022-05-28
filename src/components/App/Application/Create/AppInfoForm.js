import React, { PropTypes } from 'react';
import { Form, Button, Input, Modal, Upload, Icon } from 'antd';
const FormItem = Form.Item;
// import { fileServer } from '../../../../utils/config'
import customRequest from '../../../../utils/requestFile'
const formItemLayout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 14,
    }
}
const uploadButton = (
    <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传图片</div>
    </div>
);
class AppInfoForm extends React.Component {

    state = {
        previewVisible: false,
        previewImage: '',
        fileList: []

    };
    componentDidMount(){
        if(this.props.appInfo.icon){
        this.setState({
            fileList:[{
                uid: '-1',
                name: 'xxx.png',
                status: 'done',
                url: `${config.fileServer}${this.props.appInfo.icon}`,
              }]
        })
    }
    }
    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    }
    handleCancel = () => this.setState({ previewVisible: false })
    handleChange = ({ file, fileList }) => {
        if (file.status === 'done') {
        }
        this.setState({ fileList })
    }
    beforeUpload = (file) => {
        console.log(file.type)
        const isJPG = file.type.indexOf('image') > -1;

        if (!isJPG) {
            message.error('只能上传图片!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('图片大小不能超过2M!');
        }
        return isJPG && isLt2M;
    }
    render() {
        const {
            appInfo,
            form: {
                getFieldDecorator,
                validateFields,
                getFieldsValue,

            } } = this.props;

        const { previewVisible, previewImage, fileList } = this.state;
        return (
            <div >
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
                <Form horizontal>
                    <FormItem
                        label="应用名称:"
                        hasFeedback
                        {...formItemLayout}
                    >
                        {getFieldDecorator('name', {
                            initialValue: appInfo.name,
                            rules: [
                                { required: true, message: '应用名称不能为空' },
                            ],
                        })(
                            <Input type='text' maxLength={64} />
                        )}
                    </FormItem>
                    <FormItem
                        label="应用图片"
                        hasFeedback
                        {...formItemLayout}
                    >
                        {
                            getFieldDecorator('icon', {
                                initialValue: appInfo.icon,
                                rules: [
                                    { required: true, message: '请上传应用图片' },
                                ],
                            })(
                                <Upload
                                    action={`${config.fileServer}/api/FileUpload/UploadImages`}
                                    customRequest={
                                        customRequest
                                    }
                                    
                                    accept='image/*'
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={this.handlePreview}
                                    onChange={this.handleChange}

                                >
                                    {fileList.length >= 1 ? null : uploadButton}
                                </Upload>
                            )
                        }
                    </FormItem>

                    <FormItem
                        label="应用简介"
                        hasFeedback
                        {...formItemLayout}
                    >
                        {
                            getFieldDecorator('desc', {
                                initialValue: appInfo.desc,
                                rules: [
                                    { required: true, message: '应用简介不能为空' }
                                ]
                            })(
                                <Input.TextArea rows={5} style={{
                                    resize: 'none'
                                }} maxLength={256} type="address" />
                            )
                        }
                    </FormItem>
                    <div style={{
                        width: 75,
                        margin: '0 auto'
                    }}>
                    </div>
                </Form>
            </div>
        )
    }
}

export default AppInfoForm// Form.create()();
