import React from 'react';
import { Input, Switch, Select } from 'antd';
import com from '../../utils/com';
import FORM_CONTROLLIST_GROUP from '../../enums/FormControlListGroup';
import Title from '../../components/FormControl/Attribute/Title';
import Desc from '../../components/FormControl/Attribute/Desc';
import Position from '../../components/FormControl/Attribute/PositionStyle';
import Verification from '../../components/FormControl/Attribute/Verification';
import OperationPower from '../../components/FormControl/Attribute/OperationPower';
import FormControlType from '../../enums/FormControlType';
import Attribute from './Attribute/Attribute'

function initFormItemBase() {
    let formItemBase = com.formItemBase()
    formItemBase.type = "TextSwitch";
    formItemBase.typeName = "开关";
    formItemBase.name = "开关";//标题
    formItemBase.isRepeat = false; //是否允许有重复值
    formItemBase.disabled = false; //开关是否可编辑
    formItemBase.size = 'default'; //开关大小
    formItemBase.checkedValue = '开'; //开关选中时的内容
    formItemBase.unCheckedValue = '关'; //开关非选中时的内容
    return formItemBase;
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    box: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    fontMargin: {
        marginRight: 10
    },
    area: { flex: 1 }
}

const Option = Select.Option;

@Attribute('开关样式')
class SwitchStyle extends React.PureComponent {
    render() {
        const { size, disabled, onChange, checkedValue, unCheckedValue } = this.props
        return (
            <div style={styles.container}>
                <div style={styles.box}>
                    <div style={styles.fontMargin}>大小：</div>
                    <Select defaultValue={size} onChange={e => onChange({ size: e })}>
                        <Option value="default">默认</Option>
                        <Option value="small">小</Option>
                    </Select>
                </div>
                {/* <div style={styles.box}>
                    <div style={styles.fontMargin}>是否禁用：</div>
                    <Switch defaultChecked={disabled} onChange={e => onChange({ disabled: e })} />
                </div> */}
                <div style={styles.box}>
                    <div style={styles.area}>选中时的内容：</div>
                    <Input style={styles.area} value={checkedValue}
                        onChange={e => onChange({ checkedValue: e.target.value })} />
                </div>
                <div style={styles.box}>
                    <div style={styles.area}>非选中时的内容：</div>
                    <Input style={styles.area} value={unCheckedValue}
                        onChange={e => onChange({ unCheckedValue: e.target.value })} />
                </div>
            </div>
        );
    }
}

class TextSwitchFrom extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    handleChange = (e) => {
        this.props.onChangeAll ? this.props.onChangeAll({value:e}) :  this.props.onChange({ value: e })
    }

    render() {
        const { disabled, readOnly, size, checkedValue, unCheckedValue, value } = this.props;
        return <Switch checkedChildren={checkedValue} unCheckedChildren={unCheckedValue}
            onChange={this.handleChange} checked={!!value} disabled={disabled || readOnly}
            size={size} />;
    }
}

class TextSwitch extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let { mode } = this.props;
        switch (mode) {
            case 'table':
            case 'form':
                return <TextSwitchFrom {...this.props} />;
            case 'cell':
                return <TextSwitchFrom {...this.props} readOnly={true} />;
            case 'option':
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <Position.Component {...Position.getProps(this.props)} />
                        {/* <Verification.Component {...Verification.getProps(this.props)} /> */}
                        <SwitchStyle {...this.props} />
                        <OperationPower {...this.props} />
                        <Desc.Component {...Desc.getProps(this.props)} />
                    </React.Fragment>)
        }
    }
}

export default {
    itemType: "TextSwitch",
    formControlType: FormControlType.Item,
    name: "开关",
    ico: 'contacts',
    group: FORM_CONTROLLIST_GROUP.Normal,//分组
    Component: TextSwitch,
    valueType: 'boolean',
    initFormItemBase
};
