import React from 'react';
import { Modal, Button, Radio, Input } from 'antd';
import Attribute from './Attribute.js';
import FormulaEditor from '../FormulaEditor/FormulaEditor.js';

const btnStyle = { width: '100%' };
const valiSytle = { display: 'flex', padding: '5px 0', lineHeight: '32px' };

@Attribute('自定义校验')
class VerificationCustom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            validateCustom: JSON.parse(JSON.stringify(props.validateCustom || { type: 'none' })),
        }
    }
    initFormData = () => {
        switch (this.state.validateCustom.type) {
            case 'resource':
            case 'formula':
                this.props.buildFormDataFilter('validation');
                break;
            default:
                break;
        }
    }
    showModal = () => {
        this.initFormData();
        this.setState({ showModal: true });
    }
    hideModal = () => {
        this.setState({ showModal: false });
    }
    setValidateType = ({ target: { value } }) => {
        let validateCustom = this.state.validateCustom;
        validateCustom = { type: value };
        this.setState({ validateCustom }, this.initFormData);
    }
    saveValidateCustom = () => {
        let validateCustom = this.state.validateCustom;
        switch (validateCustom.type) {
            default:
            case 'none':
                break;
            case 'formula':
                let f = this.state.editor.getValue();
                validateCustom.formula = f;
                validateCustom.relations = Array.from(new Set(f.split('\u2800').filter((a, i) => i % 2 === 1 && a !== this.props.id)))
                break;
            case 'resource':
                break;
        }
        this.setState({ validateCustom })
        this.props.onChange({ validateCustom: this.state.validateCustom });
        this.hideModal();
    }
    setMsg = ({ target: { value } }) => {
        let validateCustom = this.state.validateCustom;
        validateCustom.msg = value;
        this.setState({ validateCustom }, this.initFormData);
    }
    initFormula = (editor, options, next) => {
        this.setState({ editor });
    }
    render() {
        // console.log('verification',this.props)
        let { id, currentFormData } = this.props;
        let { validateCustom } = this.state;
        let type = this.state.validateCustom.type;
        let content;
        switch (type) {
            default:
            case 'none':
                content = null;
                break;
            case 'formula':
                content = <FormulaEditor
                    fid={id}
                    value={validateCustom.formula}
                    currentFormData={currentFormData}
                    hideAllForm={true}
                    relations={[]}
                    relationTables={[]}
                    foreignFormData={[]}
                    foreignForm={[]}
                    init={this.initFormula}
                />;
                break;
            case 'resource':
                break;
        }
        return <React.Fragment>
            <Button onClick={this.showModal} style={btnStyle}>设置自定义校验</Button>
            <Modal maskClosable={false}
                title={'设置自定义校验'}
                centered={true}
                visible={this.state.showModal}
                onOk={this.saveValidateCustom}
                onCancel={this.hideModal}
                width={800}
                bodyStyle={{ height: 560 }}>
                <div style={{ display: 'flex', height: type === 'none' ? null : '100%', flexFlow: 'column' }}>
                    <div>校验方式：<Radio.Group onChange={this.setValidateType} value={type}>
                        <Radio value={'none'}>无</Radio>
                        <Radio value={'formula'}>公式计算</Radio>
                        {/* <Radio value={'resource'}>第三方数据源</Radio> */}
                    </Radio.Group> </div>
                    {type === 'none' ? null : <React.Fragment>
                        <div style={valiSytle}>验证提示：<Input style={{ flex: 1 }} type='text' placeholder='请输入验证失败时提示的错误信息' onChange={this.setMsg} value={validateCustom.msg} /></div>
                        <div style={{ flex: 1 }}>
                            {content}
                        </div>
                    </React.Fragment>}
                </div>
            </Modal>
        </React.Fragment>;
    }
}
// export default Verification;
export default {
    Component: VerificationCustom,
    getProps: (props) => {
        let { onChange, validateCustom, id, currentFormData, buildFormDataFilter } = props;
        return { onChange, validateCustom, id, currentFormData, buildFormDataFilter };
    }
};