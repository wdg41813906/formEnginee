import React from 'react'
import { Checkbox, Input, Button, Switch, Select } from 'antd';
import Attribute from './Attribute.js'
import com from '../../../utils/com'
@Attribute('格式')
class Formart extends React.Component {
    componentDidMount() {
    } constructor(props) {
        super(props);
        this.SetFormart = this.SetFormart.bind(this);
    }
    SetFormart(type) {
        var formart = com.ControlFormart(type);
        this.props.onChange({ formartValue: formart, formartText: type });
    }
    render() {
        let { formartText } = this.props;
        return <Select getPopupContainer={() => document.getElementById('KJSX')} value={formartText} style={{ width: "100%" }} onChange={this.SetFormart}>
            <Select.Option value="none">无</Select.Option>
            <Select.Option value="Mobile">手机号码</Select.Option>
            <Select.Option value="IdCard">身份证号码</Select.Option>
            <Select.Option value="PostalCode">邮政编码</Select.Option>
            <Select.Option value="Email">邮箱</Select.Option>
        </Select>;
    }
}
// export default Formart;
export default {
    Component: Formart,
    getProps: (props) => {
        let { formartText, onChange, } = props;
        return { formartText, onChange };
    }
};
