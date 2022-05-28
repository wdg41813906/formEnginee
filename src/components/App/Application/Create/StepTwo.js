import React from 'react';
import { Form, Button, Input, Modal, Upload, Icon } from 'antd';
import AppInfoForm from './AppInfoForm'

class StepTwo extends React.Component {

    handelOk = () => {
        this.props.form.validateFields((errors) => {
            if (errors) {
                return;
            }
            const data = { ...this.props.form.getFieldsValue() }

            var newData = { ...data, icon: data.icon.file.response[0].data };
            this.props.SetData(newData);
            this.props.Next()
            //onOk(data);
        })
    }
    render() {
        return (
            <div style={{
                width: '60%',
                margin: '0 auto'
            }}>
                <AppInfoForm {...this.props} />
                <div style={{
                    width: 75,
                    margin: '0 auto'
                }}>
                <Button onClick={this.handelOk} type="primary">下一步</Button>
                </div>

            </div>
        )
    }
}
export default Form.create()(StepTwo);