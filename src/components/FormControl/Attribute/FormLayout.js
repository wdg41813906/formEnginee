import React from 'react'
import { Select } from 'antd';
import Attribute from './Attribute.js'

@Attribute('表单布局')
class FormLayout extends React.Component {
    componentDidMount() { }
    constructor(props) {
        super(props);
    }
    render() {
        let { value, onChange } = this.props;
        return <Select value={value || 1} style={{ width: "100%" }} onChange={onChange}>
            <Select.Option value={1}>单列</Select.Option>
            <Select.Option value={2}>双列</Select.Option>
            <Select.Option value={3}>三列</Select.Option>
            <Select.Option value={4}>四列</Select.Option>
        </Select>;
    }
}
export default FormLayout;
