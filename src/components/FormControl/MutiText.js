import React from 'react';
import { Input } from 'antd';
import com from '../../utils/com'
import FORM_CONTROLLIST_GROUP from '../../enums/FormControlListGroup';
import Title from '../../components/FormControl/Attribute/Title.js'
import Desc from '../../components/FormControl/Attribute/Desc.js'
import Verification from '../../components/FormControl/Attribute/Verification.js'
import OperationPower from '../../components/FormControl/Attribute/OperationPower.js'
import DefaultValueMuti from '../../components/FormControl/Attribute/DefaultValueMuti'
import Position from '../../components/FormControl/Attribute/PositionStyle';
import FormControlType from '../../enums/FormControlType';
import VerificationCustom from './Attribute/VerificationCustom';

function initFormItemBase() {
    let formItemBase = com.formItemBase()
    formItemBase.type = "MutiText";
    formItemBase.typeName = "多行文本";
    formItemBase.name = "多行文本";//标题
    return formItemBase;
}

let time = null;

class MutiTextMiddel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isOnComposition: false,
            v:null
        }
    }

    handleComposition = (e) => {
        if (e.type === 'compositionend') {
            const value = e.target.value;
            this.setState({ isOnComposition: false }, () => {
                this.props.onChange({ value });
            });
        } else {
            this.setState({ isOnComposition: true });
        }
    }

    handleFixedChange = ({ target: { value } }) => {
        this.setState({
            v:value
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
        },300);
        //if (!this.state.isOnComposition)
        //保存value
    }

    render() {
        var { value, disabled, readOnly } = this.props;
        // this.props.isPreview ? (this.props.itemValue == undefined ? data.DataLinkValue : this.props.itemValue) : data.DataLinkValue
        return (<Input.TextArea value={this.state.v||value} style={{ width: '100%' }}
            disabled={disabled || readOnly}
            maxLength={1000}
            onChange={this.handleFixedChange}
            onCompositionStart={this.handleComposition}
            onCompositionUpdate={this.handleComposition}
            onCompositionEnd={this.handleComposition}
        />)
    }
}

class MutiText extends React.PureComponent {
    render() {
        let { mode } = this.props;
        switch (mode) {
            case 'table':
            case 'form':
                return <MutiTextMiddel {...this.props} />
            case 'option':
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <Position.Component {...Position.getProps(this.props)} />
                        <DefaultValueMuti.Component {...DefaultValueMuti.getProps(this.props)} />
                        <Verification.Component {...Verification.getProps(this.props)} />
                        <VerificationCustom.Component {...VerificationCustom.getProps(this.props)} />
                        <OperationPower {...this.props} />
                        <Desc.Component {...Desc.getProps(this.props)} />
                    </React.Fragment>)
            default:
                return <div>控件加载失败</div>;
        }
    }
}

export default {
    itemType: "MutiText",
    formControlType: FormControlType.Item,
    name: "多行文本",
    ico: 'contacts',
    group: FORM_CONTROLLIST_GROUP.Normal,//分组
    Component: MutiText,
    valueType: 'string',
    initFormItemBase
};
