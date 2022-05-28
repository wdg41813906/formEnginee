import React from "react";
import { InputNumber } from "antd";
import com from "../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import Title from "../../components/FormControl/Attribute/Title.js";
import Desc from "../../components/FormControl/Attribute/Desc.js";
import Verification from "../../components/FormControl/Attribute/VerificationNum.js";
import OperationPower from "../../components/FormControl/Attribute/OperationPower.js";
import DefaultValue from "../../components/FormControl/Attribute/DefaultValue.js";
import Position from "../../components/FormControl/Attribute/PositionStyle";
import FormControlType from "../../enums/FormControlType";
import NumberFormat from "./Attribute/NumberFormat";
import VerificationCustom from "./Attribute/VerificationCustom";
import _ from "lodash";

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = "Number";
    formItemBase.typeName = "数字";
    formItemBase.name = "数字";//标题
    formItemBase.decimal = true;
    formItemBase.decimalLen = 2;
    formItemBase.range = false;
    formItemBase.min = "";
    formItemBase.max = "";
    return formItemBase;
}

function getFormatedValue(value, decimal, decimalLen) {
    let len = 2;
    if (!isNaN(decimalLen) && decimalLen >= 0 && decimalLen <= 8)
        len = decimalLen;
    return isNaN(parseFloat(value)) ? null : (decimal ? parseFloat(parseFloat(value).toFixed(len)) : value);
   // return isNaN(parseFloat(value)) ? null : (decimal ? parseFloat(parseFloat(value).toFixed(len + 1).slice(0, -1)) : value);
}

class NumberMiddel extends React.PureComponent {
    onChange = e => {
        this.props.onChangeAll ? this.props.onChangeAll({value:e}) : this.props.onChange({ value: e})
    }

    render() {
        console.log('数字来了2')
        let { value, disabled, readOnly, decimal, decimalLen, formatterValue } = this.props;
        let formatter = null;
        let parser = v => v;
        switch (formatterValue) {
            default:
            case "none":
                formatter = null;
                break;
            case "percent":
                formatter = value => {
                    //console.log(value);
                    if (isNaN(value))
                        return "";
                    let v = `${value || ""}`;
                    if (v === "")
                        return v;
                    return `${parseInt(parseFloat(v) * 100)}%`;
                };
                parser = value => {
                    //console.log(value);
                    let v = `${value || ""}`;
                    if (v === "")
                        return v;
                    return (parseFloat(value.replace("%", "")) / 100).toFixed(2);
                };
                break;
            case "dot":
                formatter = value => `${value || ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                parser = value => `${value}`.replace(/\,/gm, "");
                break;
        }

        return <InputNumber formatter={formatter} parser={parser} style={{ width: "100%", height: "30px" }}
                            max={999999999999}
                            value={getFormatedValue(value, decimal, decimalLen)} disabled={disabled || readOnly}
                            onChange={_.debounce(this.onChange,200)} precision={decimal ? decimalLen || 2 : 0}/>;
    }
}

class Number extends React.PureComponent {
    render() {
        let { mode } = this.props;
        console.log('数字来了')
        switch (mode) {
            case "table":
            case "form":
                return <NumberMiddel {...this.props} />;
            case "cell":
                let { value, decimal, decimalLen, formatterValue } = this.props;
                let v = getFormatedValue(value, decimal, decimalLen);
                if (v && decimal) {
                    v = parseFloat(v).toFixed(decimalLen);
                }
                if (v == null)
                    return "";
                if (this.props.formatter instanceof Function)
                    v = parseFloat(this.props.formatter(v));
                switch (formatterValue) {
                    default:
                    case "none":
                        return v;
                    case "percent":
                        if (!isNaN(v))
                            return `${parseInt(v * 100)}%`;
                        break;
                    case "dot":
                        if (!isNaN(v))
                            return (v + "").replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
                        break;
                }
                return "";
            case "option":
                return <React.Fragment>
                    <Title.Component {...Title.getProps(this.props)} />
                    <DefaultValue.Component {...DefaultValue.getProps(this.props)} />
                    <NumberFormat.Component {...NumberFormat.getProps(this.props)} />
                    <Verification.Component {...Verification.getProps(this.props)} />
                    <VerificationCustom.Component {...VerificationCustom.getProps(this.props)} />
                    <Position.Component {...Position.getProps(this.props)} />
                    <OperationPower {...this.props} />
                    <Desc.Component {...Desc.getProps(this.props)} />
                </React.Fragment>;
            case "exOption":
                return <NumberFormat.Component {...NumberFormat.getProps(this.props)} />;
            default:
                return <div>控件加载失败</div>;
        }
    }
}

export default {
    itemType: "Number",
    formControlType: FormControlType.Item,
    name: "数字",
    ico: "contacts",
    group: FORM_CONTROLLIST_GROUP.Normal,//分组
    Component: Number,
    valueType: "number",
    extraExternalOption: true,
    initFormItemBase
};
