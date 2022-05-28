import React from "react";
import { DatePicker } from "antd";
import moment from "moment";
import com from "../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import Title from "../../components/FormControl/Attribute/Title.js";
import Desc from "../../components/FormControl/Attribute/Desc.js";
import Type from "../../components/FormControl/Attribute/DateType.js";
import Verification from "../../components/FormControl/Attribute/Verification.js";
import OperationPower from "../../components/FormControl/Attribute/OperationPower.js";
import DefaultValue from "../../components/FormControl/Attribute/DefaultValueDate.js";
import Position from "../../components/FormControl/Attribute/PositionStyle";
import FormControlType from "../../enums/FormControlType";
import style from "./DateTime.less";
import VerificationCustom from "./Attribute/VerificationCustom";

// moment.suppressDeprecationWarnings = true;

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = "DateTime";
    formItemBase.typeName = "日期时间";
    formItemBase.name = "日期时间"; //标题
    formItemBase.DateType = "DateTime"; //Date日期，DateTime日期时间
    formItemBase.dateFormat = "YYYY-MM-DD HH:mm:ss";
    formItemBase.showTime = "";
    return formItemBase;
}

class DateTimeMiddel extends React.PureComponent {
    render() {
        let { value, dateFormat, DateType, disabled, readOnly, showTime } = this.props;
        value = value instanceof Date ? moment(value) : null;
        return (
            <DatePicker
                className={style.dp}
                showTime={{ format: showTime }}
                value={value}
                style={{ width: "100%", height: "30px" }}
                format={dateFormat}
                onChange={
                    readOnly
                        ? null
                        : ele => {
                            this.props.onChangeAll ? this.props.onChangeAll({ value: ele ? ele.toDate().setMilliseconds(0) : null }) : this.props.onChange({ value: ele ? ele.toDate().setMilliseconds(0) : null });
                        }
                }
                disabled={disabled || readOnly}
            />
        );
    }
}

class DateTime extends React.PureComponent {
    render() {
        let { mode } = this.props;
        switch (mode) {
            case "table":
            case "form":
                return <DateTimeMiddel {...this.props} />;
            case "option":
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <Position.Component {...Position.getProps(this.props)} />
                        <Type.Component {...Type.getProps(this.props)} />
                        <DefaultValue.Component {...DefaultValue.getProps(this.props)} />
                        <Verification.Component {...Verification.getProps(this.props)} />
                        <VerificationCustom.Component {...VerificationCustom.getProps(this.props)} />
                        <OperationPower {...this.props} />
                        <Desc.Component {...Desc.getProps(this.props)} />
                    </React.Fragment>
                );
            case "cell":
                let t = moment(this.props.value);
                return t.isValid() ? t.format(this.props.dateFormat) : null;
            case "exOption":
                return <Type.Component {...Type.getProps(this.props)} />;
            default:
                return <div>控件加载失败</div>;
        }
    }
}

export default {
    itemType: "DateTime",
    formControlType: FormControlType.Item,
    name: "日期时间",
    ico: "contacts",
    group: FORM_CONTROLLIST_GROUP.Normal, //分组
    Component: DateTime,
    valueType: "datetime",
    extraExternalOption: true,
    initFormItemBase
};
