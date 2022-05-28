import React from 'react';
import { Checkbox, Input, Button, Switch, Select, message, InputNumber } from 'antd';
import Attribute from './Attribute.js';

const style = {
    rangeContainer: {
        display: 'flex',
        alignItem: 'center',
        marginTop: '5px',
        width: '70%',
        marginLeft: '17%'
    },
    rangeMiddle: {
        lineHeight: '32px',
        marginLeft: '4px',
        marginRight: '4px'
    }
};

@Attribute('校验')
class VerificationNum extends React.Component {
    componentDidMount() {}
    constructor(props) {
        super(props);
        this.SetSwitch = this.SetSwitch.bind(this);
    }
    SetSwitch(type, e) {
        this.props.onChange({ [type]: e });
    }
    changeRange(type, e) {
        const reg = /^(\-?)([1-9]\d*|0)(\.\d*)?$/;
        if (e.target.vlaue && (!reg.test(e.target.value) && e.target.value !== '-')) {
            this.setState({
                [type]: ''
            });
            message.info('请输入正确的数字');
            return;
        }
        if (type === 'firstInput') {
            this.props.onChange({
                min: e.target.value
            });
        }
        if (type === 'secondInput') {
            this.props.onChange({
                max: e.target.value
            });
        }
    }
    changeLen = e => {
        this.props.onChange({ decimalLen: e });
    };
    render() {
        let { required, decimal, range, min, max, decimalLen } = this.props;
        return (
            <React.Fragment>
                <div>
                    <Switch checked={required} onChange={e => this.SetSwitch('required', e)} />
                    &nbsp;必填
                </div>
                <div style={{ marginTop: 10 }}>
                    <Switch checked={decimal} onChange={e => this.SetSwitch('decimal', e)} />
                    &nbsp;允许小数
                    {decimal ? (
                        <div style={{ float: 'right' }}>
                            &nbsp;&nbsp;位数{' '}
                            <InputNumber
                                style={{ width: 60 }}
                                min={0}
                                max={8}
                                size="small"
                                value={decimalLen}
                                onChange={this.changeLen}
                            />
                        </div>
                    ) : null}
                </div>
                <div style={{ marginTop: 10 }}>
                    <Switch checked={range} onChange={e => this.SetSwitch('range', e)} />
                    &nbsp;限定数值范围
                </div>
                {range && (
                    <div style={style.rangeContainer}>
                        <Input value={min} onChange={this.changeRange.bind(this, 'firstInput')} />
                        <div style={style.rangeMiddle}>~</div>
                        <Input value={max} onChange={this.changeRange.bind(this, 'secondInput')} />
                    </div>
                )}
            </React.Fragment>
        );
    }
}
// export default VerificationNum;
export default {
    Component: VerificationNum,
    getProps: props => {
        let { required, decimal, range, min, max, onChange, decimalLen } = props;
        return { required, decimal, range, min, max, onChange, decimalLen };
    }
};
