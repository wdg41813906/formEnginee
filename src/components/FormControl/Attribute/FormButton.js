import React from "react";
import { Button, Modal, Card, Switch, Tree, Icon, Select, Table, message } from "antd";
import EditableTable from "./EditableTable";
import Attribute from "./Attribute.js";


@Attribute("自定义业务操作")
class FormButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        };
    }
    
    showModal = () => {
        
        this.setState({ showModal: true }, this.props.buildFormDataFilter("relation"));
    };
    onOk = () => {
        this.EditableTable.setFormular().then(res => {
            if (!res) {
                message.info("请先保存按钮配置");
            } else {
                this.setState({ showModal: false });
            }
        });
    };
    hideModal = () => {
        this.setState({ showModal: false });
    };
    
    render() {
        let { showModal } = this.state;
        return (
            <React.Fragment>
                <Button onClick={this.showModal.bind(this)} style={{ width: "100%" }}>
                    业务操作配置
                </Button>
                <Modal
                    maskClosable={false}
                    title={"业务操作配置"}
                    visible={showModal}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    onOk={this.onOk}
                    width={800}
                    centered={true}
                    bodyStyle={{ maxHeight: 520, minHeight: 520 }}
                >
                    <EditableTable {...this.props} onRef={ref => this.EditableTable = ref}/>
                </Modal>
            </React.Fragment>
        );
    }
}

export default {
    Component: FormButton,
    // getProps: {}
    getProps: props => {
        let { thirdPartyList, buildFormDataFilter, currentFormData, buildSaveData, formBody, tabId } = props;
        return {
            thirdPartyList,
            buildFormDataFilter,
            currentFormData,
            buildSaveData,
            formBody,
            tabId
        };
    }
};
