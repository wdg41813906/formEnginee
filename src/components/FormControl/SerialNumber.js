import React from "react";
import { Input } from "antd";
import com from "../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import Title from "../../components/FormControl/Attribute/Title";
import Desc from "../../components/FormControl/Attribute/Desc";
import Position from "../../components/FormControl/Attribute/PositionStyle";
import OperationPower from "../../components/FormControl/Attribute/OperationPower";
import SerialNumberRules from "../../components/FormControl/Attribute/SerialNumberRules";
import FormControlType from "../../enums/FormControlType";

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = "SerialNumber";
    formItemBase.typeName = "流水号";
    formItemBase.name = "流水号";//标题
    formItemBase.readOnly = true;
    formItemBase.isRepeat = false; //是否允许有重复值
    
    formItemBase.rulesList = [ //这是 流水号规则 列表 type 规则类型（type:1为自动计数，2为日期，3 为固定字段，4 为表单字段(二级 的 type 为组件id)）,name:标题，readOnly:是否能编辑,value：存储的所有数据
        {
            id: com.Guid(),
            type: "1",
            name: "自动计数",
            readOnly: true,
            value: { digit: 2, period: "1", initValue: 1, isFixedDigit: true }
        }
    ];
    return formItemBase;
}

class SerialNumber extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    
    render() {
        let { mode, disabled } = this.props;
        const value = mode === "table" ? "" : this.props.value;
        console.log("SerialNumber render", this.props);
        switch (mode) {
            case "table":
            case "form":
                return <Input readOnly={true} disabled={disabled} placeholder="自动生成无需填写" value={value}
                              style={{ height: "30px" }}/>;
            case "option":
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <SerialNumberRules {...this.props} />
                        <Position.Component {...Position.getProps(this.props)} />
                        <OperationPower {...this.props} />
                        <Desc.Component {...Desc.getProps(this.props)} />
                    </React.Fragment>);
        }
    }
}

export default {
    itemType: "SerialNumber",
    formControlType: FormControlType.Item,
    name: "流水号",
    ico: "contacts",
    group: FORM_CONTROLLIST_GROUP.Advanced,//分组
    Component: SerialNumber,
    valueType: "string",
    initFormItemBase,
    dropCount: 1, //指定 最多能拖拽的 个数
    dropOnSubForm: false,
    __canCopy: false
    
};
