import React from 'react'
import { Checkbox, Input, Button, Switch, Select } from 'antd';
import Attribute from './Attribute.js'
import com from '../../../utils/com'

@Attribute('不可见字段赋值')

class InvisibleTxtInit extends React.Component {
    render() {
        let { value, onChange } = this.props;
        return <Select value={value || 1} style={{ width: "100%" }} onChange={onChange}>
            <Select.Option value={1}>保持原值</Select.Option>
            <Select.Option value={2}>空值</Select.Option>
            <Select.Option value={3}>始终重新计算</Select.Option>
        </Select>;
    }
}
export default InvisibleTxtInit;
