import React from 'react'
import { Modal, Button } from 'antd';
import styles from './Preview.less';
import FormRender from '../FormRender/FormRender';

class Preview extends React.Component {
    render() {
        const { handleCancel, showPreview, formTitle, setProxy, getSerialNumSeed/* 先把 这个 方法 提出来，不给 预览 默认复制 */, ...other } = this.props;
        return <Modal
            width={'100%'}
            className={styles.previewModal}
            maskClosable={false}
            closable={false}
            mask={false}
            // title={formTitle}
            getContainer={() => document.getElementById('Boots')}
            visible={showPreview}
            footer={<div style={{ textAlign: 'center' }}><Button
                style={{ background: 'rgb(187, 187, 187)', border: 'none', color: "#fff" }} key="back"
                onClick={handleCancel}>关闭</Button>
            </div>}
            onCancel={handleCancel}>
            {
                showPreview ? <FormRender
                    type={1}
                    formLayout={this.props.formLayout}
                    formTitle={formTitle}
                    setProxyCall={setProxy}
                    formLoading={false}
                    businessList={[]}
                    {...other}
                /> : null
            }
        </Modal>
    }
}
export default Preview
