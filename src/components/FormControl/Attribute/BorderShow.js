import React from 'react'
import { Button, Switch } from 'antd';
import Attribute from './Attribute.js'
import com from '../../../utils/com'
import { SketchPicker } from 'react-color'



@Attribute('字段边线')


class BorderShow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: this.props.value ? this.props.value : '#b3d3e6',
        }
        this.pickerChange = this.pickerChange.bind(this);
    }
    pickerChange(color, event) {//SliderPicker选择颜色
        this.setState({ color: color.hex })
        // this.props.onChange(color.hex)
    }
    render() {
        let { value, onChange } = this.props;
        let { color } = this.state;
        return (
            <div>
                <Switch
                    checkedChildren="显示"
                    unCheckedChildren="隐藏"
                    checked={value ? true : false}
                    onChange={(e) => { onChange(e ? '#b3d3e6' : e) }}
                    style={{ marginBottom: value ? 10 : 0 }}
                />
                {
                    !value ? null :
                        <div style={{ textAlign: 'center' }}>
                            <SketchPicker onChange={this.pickerChange} color={color} />
                            <Button type="primary" size="small" style={{ marginTop: 10 }} onClick={(e) => { this.props.onChange(color) }}>确认边框颜色</Button>
                        </div>
                }
            </div>
        );

    }
}
// export default BorderShow;

export default {
    Component: BorderShow,
    getProps: (props) => {
        let { value, onChange } = props;
        return { value, onChange };
    }
};
