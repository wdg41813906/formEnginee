import React from "react";
import { Input, Tooltip } from "antd";
import style from "./SingleText.less";
import com from "../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import Title from "../../components/FormControl/Attribute/Title";
import Desc from "../../components/FormControl/Attribute/Desc";
import Position from "../../components/FormControl/Attribute/PositionStyle";
import Verification from "../../components/FormControl/Attribute/Verification";
import OperationPower from "../../components/FormControl/Attribute/OperationPower";
import Formart from "../../components/FormControl/Attribute/Formart";
import DefaultValue from "../../components/FormControl/Attribute/DefaultValue";
import FormControlType from "../../enums/FormControlType";
import VerificationCustom from "./Attribute/VerificationCustom";
import TagText from "./Attribute/TagText";
import _ from "lodash";

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = "SingleText";
    formItemBase.typeName = "单行文本";
    formItemBase.name = "单行文本";//标题
    formItemBase.isRepeat = false; //是否允许有重复值
    return formItemBase;
}

let time = null;

class SingleTextFrom extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isOnComposition: false,
            v:null
        };
    }

    handleComposition = (e) => {
        if (e.type === "compositionend" || e.type === "compositionupdate") {
            const value = e.target.value;
            this.setState({ isOnComposition: false }, () => {
                this.props.onChange({ value });
            });
            this.props.onChange({ value });
        } else {
            this.setState({ isOnComposition: true });
        }
    };

    onChange = v => {
        this.setState({
            v
        })
        if(time){
            clearTimeout(time)
            time=null
        }
        time = setTimeout(() => {
            this.props.onChangeAll ? this.props.onChangeAll({value:this.state.v}) : this.props.onChange({ value: this.state.v})
            this.setState({
                v:undefined
            })
        },200);

        // let me = this;
        // time && clearTimeout(time);
        // if (me.state.isOnComposition) {
        //     time = setTimeout(() => {
        //         me.setState({
        //             isOnComposition: false
        //         });
        //     });
        // }
        // !me.state.isOnComposition && me.props.onChange({ value: v});
    }

    render() {
        console.log('文本来了2')
        const { value, disabled, readOnly, headTag, tailTag } = this.props;
        return <Tooltip title={value} overlayClassName={style.tip} mouseEnterDelay={1}>
            <Input addonBefore={headTag} addonAfter={tailTag} style={{ width: "100%", height: "30px" }} value={this.state.v||value}
                   disabled={disabled || readOnly}
                   onChange={e=>{
                       const v = e.target.value;
                       this.onChange(v)
                   }}
                   //onCompositionStart={this.handleComposition}
                   //onCompositionUpdate={this.handleComposition}
                   onCompositionEnd={this.handleComposition}
            />
        </Tooltip>;
    }
}

class SingleText extends React.PureComponent {
    render() {
        console.log('文本来了')
        let { mode } = this.props;
        switch (mode) {
            case "table":
            case "form":
                return <SingleTextFrom {...this.props} />;
            case "cell":
                return `${this.props.headTag || ""}${this.props.value || ""}${this.props.headTag || ""}`;
            case "option":
                return <React.Fragment>
                    <Title.Component {...Title.getProps(this.props)} />
                    <TagText.Component {...TagText.getProps(this.props)} />
                    <Position.Component {...Position.getProps(this.props)} />
                    <DefaultValue.Component {...DefaultValue.getProps(this.props)} />
                    <Verification.Component {...Verification.getProps(this.props)} />
                    <VerificationCustom.Component {...VerificationCustom.getProps(this.props)} />
                    <OperationPower {...this.props} />
                    <Formart.Component {...Formart.getProps(this.props)} />
                    <Desc.Component {...Desc.getProps(this.props)} />
                </React.Fragment>;
        }
    }
}

export default {
    itemType: "SingleText",
    formControlType: FormControlType.Item,
    name: "单行文本",
    ico: "contacts",
    group: FORM_CONTROLLIST_GROUP.Normal,//分组
    Component: SingleText,
    valueType: "string",
    initFormItemBase
};
