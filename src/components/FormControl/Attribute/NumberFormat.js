import React from 'react'
import { Select } from 'antd';
import Attribute from './Attribute.js';
@Attribute('格式')
class NumberFormart extends React.Component {
    constructor(props) {
        super(props);
        this.SetFormart = this.SetFormart.bind(this);
    }
    SetFormart(formatterValue) {
        this.props.onChange({ formatterValue});
    }
    render() {
        let { formatterValue } = this.props;
        return <Select getPopupContainer={() => document.getElementById('KJSX')} value={formatterValue} style={{ width: "100%" }} onChange={this.SetFormart}>
            <Select.Option value="none">无</Select.Option>
            <Select.Option value="percent">百分比</Select.Option>
            <Select.Option value="dot">千分位</Select.Option>
        </Select>;
    }
}
// export default Formart;
export default {
    Component: NumberFormart,
    getProps: (props) => {
        let { formatter, onChange, formatterValue } = props;
        return { formatter, onChange, formatterValue };
    }
};
