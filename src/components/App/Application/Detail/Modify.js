
import { Modal, Button, Form } from 'antd';
import AppInfoForm from './../Create/AppInfoForm'
class Modify extends React.Component {
    handelOk = () => {
        this.props.form.validateFields((errors) => {
            if (errors) {
                return;
            }
            const data = { ...this.props.form.getFieldsValue() }

            var newData = { ...data, icon: data.icon.file ? data.icon.file.response[0].data : data.icon };
            this.props.Modify(newData);
        })
    }
    render() {
        const { modifyShow } = this.props
        return (
            <Modal
                title="修改信息"
                style={{ top: 100 }}
                visible={modifyShow}
                onOk={() => this.handelOk()}
                onCancel={() => this.props.ModifyToggle()}
            >


                <AppInfoForm {...this.props} />

                <div style={{
                    width: 75,
                    margin: '0 auto'
                }}>
                    
                </div>
            </Modal>)
    }
}

export default Form.create()(Modify);