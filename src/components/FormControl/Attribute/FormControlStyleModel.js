import React from 'react'
import { Select } from 'antd';
import Attribute from './Attribute.js'



@Attribute('表单模式')
class FormControlStyleModel extends React.Component {
    componentDidMount() { }
    constructor(props) {
        super(props);
    }
    render() {
        let { value, onChange } = this.props;
        return <Select value={value || 1} style={{ width: "100%" }} onChange={onChange}>
            <Select.Option value={1}>水平</Select.Option>
            <Select.Option value={2}>垂直</Select.Option>
        </Select>;

    }
}
export default FormControlStyleModel;
