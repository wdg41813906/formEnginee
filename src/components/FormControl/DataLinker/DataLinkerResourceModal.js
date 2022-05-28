import React from 'react'
import { Modal } from 'antd';
import DataLinkerResource from './DataLinkerResource';
import { LINKTYPE, initLinker } from "./DataLinker";

class DataLinkerResourceModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    onOk = () => {
        this.props.onChange({
            optionalValues: [],
            dropdownList: [],
            defaultOptionalValue:'',
          });
        this.props.setGroupItemDataLinker('value', initLinker(LINKTYPE.DefaultValue, ''));
        this.props.setGroupItemDataLinker('name', initLinker(LINKTYPE.DefaultValue, ''));
        this.DataLinkerResource.setResource()
    }

    render() {
        const { currentTitile, width, showModal, hideModal } = this.props;
        return <Modal
            maskClosable={false}
            centered={true}
            title={currentTitile}
            visible={showModal}
            onOk={this.onOk}
            width={width}
            onCancel={hideModal}
        >
            <DataLinkerResource {...this.props} onRef={ref => this.DataLinkerResource = ref} />
        </Modal>
    }
}

export default DataLinkerResourceModal
