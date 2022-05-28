import React from "react";
import { Button, Radio, Modal, message, Checkbox } from "antd";
import Attribute from "./Attribute.js";
import { LINKTYPE, initLinker, getLinker } from "../DataLinker/DataLinker";

@Attribute("默认值")
class DefaultOptionalValue extends React.Component {
  constructor(props) {
    super(props);
    this.isSingle =
      props.type == "SingleRadio" || props.type == "SingleDropDownList";
    this.state = {
      showModal: false,
      width: 300,
      value: this.isSingle ? "" : [],
    };
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  onChange = (e) => {
    this.isSingle
      ? this.setState({
          value: e.target.value,
        })
      : this.setState({ value: e });
  };

  onRemove = () => {
    this.setState({
      value: this.isSingle ? "" : [],
    });
  };

  initValue = () => {
    this.setState({
      value: !this.props.defaultOptionalValue
        ? this.isSingle
          ? ""
          : []
        : this.props.defaultOptionalValue,
    });
  };

  showModal() {
    this.initValue();
    this.setState({ showModal: true });
  }

  hideModal() {
    this.setState({ showModal: false });
  }

  onOk = () => {
    const initValue = this.isSingle ? "" : [];
    if (this.isSingle) {
      const item = this.props.dropdownList.find(
        (a) => a.value === this.state.value
      );

      this.props.setGroupItemDataLinker(
        "value",
        initLinker(LINKTYPE.DefaultValue, item ? item.value : initValue)
      );
      this.props.setGroupItemDataLinker(
        "name",
        initLinker(LINKTYPE.DefaultValue, item ? item.name : initValue)
      );
    } else {
      let fildata = [];
      this.props.dropdownList.map((item) => {
        this.state.value.map((_item) => {
          if (_item === item.value) {
            fildata.push(item.name);
          }
        });
      });
      this.props.setGroupItemDataLinker(
        "value",
        initLinker(LINKTYPE.DefaultValue, this.state.value)
      );
      this.props.setGroupItemDataLinker(
        "name",
        initLinker(LINKTYPE.DefaultValue, fildata)
      );
    }

    this.props.onChange({
      defaultOptionalValue: this.state.value,
    });

    this.hideModal();
  };

  render() {
    const { dropdownList, type } = this.props;

    const radioStyle = {
      display: "block",
      height: "30px",
      lineHeight: "30px",
    };
    console.log(this.state.value);
    return (
      <React.Fragment>
        <Button style={{ width: "100%" }} onClick={this.showModal}>
          设置
        </Button>
        <Modal
          maskClosable={false}
          title={"默认值"}
          visible={this.state.showModal}
          onOk={this.onOk}
          width={this.state.width}
          onCancel={this.hideModal}
        >
          <Button onClick={this.onRemove}>清除默认值</Button>
          <div style={{ height: 250 }}>
            {this.isSingle ? (
              <Radio.Group onChange={this.onChange} value={this.state.value}>
                {dropdownList.map((m) => (
                  <Radio style={radioStyle} key={m.value} value={m.value}>
                    {m.name}
                  </Radio>
                ))}
              </Radio.Group>
            ) : (
              <Checkbox.Group onChange={this.onChange} value={this.state.value}>
                {dropdownList.map((m) => (
                  <Checkbox style={radioStyle} key={m.value} value={m.value}>
                    {m.name}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            )}
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

// export default DefaultValueDownList;
export default {
  Component: DefaultOptionalValue,
  getProps: (props) => {
    let {
      dataLinker,
      dropdownList,
      onChange,
      loadRequestData,
      optionalValues,
      setGroupItemDataLinker,
      defaultOptionalValue,
      type,
    } = props;
    return {
      dataLinker,
      dropdownList,
      onChange,
      loadRequestData,
      optionalValues,
      setGroupItemDataLinker,
      defaultOptionalValue,
      type,
    };
  },
};
