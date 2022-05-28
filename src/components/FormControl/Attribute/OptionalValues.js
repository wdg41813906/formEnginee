import React from "react";
import { Button, Select, Modal, message, Transfer } from "antd";
import Attribute from "./Attribute.js";
import { LINKTYPE, initLinker, getLinker } from "../DataLinker/DataLinker";

@Attribute("可选值范围")
class OptionalValues extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      width: 600,
      FormForeignKey: null,
      targetKeys: [],
      selectedKeys: [],
    };
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  initTargetKeys = () => {
    const list = this.props.dropdownList.map((m) => m.value);
    this.setState({ targetKeys: list }, () => {
      console.log(this.state.targetKeys);
    });
  };

  showModal() {
    if (!this.props.optionalValues || this.props.optionalValues.length === 0) {
      this.props.loadRequestData();
      // this.props.setGroupItemDataLinker("autoFill", false);
    }
    this.initTargetKeys();
    this.setState({ showModal: true });
  }

  hideModal() {
    this.setState({ showModal: false });
  }

  handleChange = (nextTargetKeys, direction, moveKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
  };

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({
      selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys],
    });
  };

  onOk = () => {
    const {
      optionalValues,
      dropdownList,
      type,
      setGroupItemDataLinker,
      onChange,
    } = this.props;

    const list = this.state.targetKeys
      .map((m) =>
        (optionalValues && optionalValues.length > 0
          ? optionalValues
          : dropdownList
        ).filter((l) => m === l.value)
      )
      .flat(1);

    onChange({
      optionalValues: optionalValues
        ? optionalValues.length > 0
          ? optionalValues
          : dropdownList
        : dropdownList,
      dropdownList: list,
      defaultOptionalValue: "",
    });

    if (type == "SingleRadio" || type == "SingleDropDownList") {
      setGroupItemDataLinker("value", initLinker(LINKTYPE.DefaultValue, ""));
      setGroupItemDataLinker("name", initLinker(LINKTYPE.DefaultValue, ""));
    } else {
      setGroupItemDataLinker("value", initLinker(LINKTYPE.DefaultValue, []));
      setGroupItemDataLinker("name", initLinker(LINKTYPE.DefaultValue, []));
    }
    this.hideModal();
  };

  render() {
    const { optionalValues, dropdownList } = this.props;
    const mockData = (optionalValues && optionalValues.length > 0
      ? optionalValues
      : dropdownList
    ).map((m) => ({ title: m.name, key: m.value }));
    console.log(this.state.targetKeys);
    return (
      <React.Fragment>
        <Button style={{ width: "100%" }} onClick={this.showModal}>
          设置
        </Button>
        <Modal
          maskClosable={false}
          title={"可选范围"}
          visible={this.state.showModal}
          onOk={this.onOk}
          width={this.state.width}
          onCancel={this.hideModal}
        >
          <Transfer
            dataSource={mockData}
            titles={["不可选", "可选"]}
            targetKeys={this.state.targetKeys}
            selectedKeys={this.state.selectedKeys}
            onChange={this.handleChange}
            onSelectChange={this.handleSelectChange}
            render={(item) => item.title}
            oneWay
          />
        </Modal>
      </React.Fragment>
    );
  }
}

// export default DefaultValueDownList;
export default {
  Component: OptionalValues,
  getProps: (props) => {
    let {
      dataLinker,
      dropdownList,
      onChange,
      loadRequestData,
      optionalValues,
      type,
      setGroupItemDataLinker,
    } = props;
    return {
      dataLinker,
      dropdownList,
      onChange,
      loadRequestData,
      optionalValues,
      type,
      setGroupItemDataLinker,
    };
  },
};
