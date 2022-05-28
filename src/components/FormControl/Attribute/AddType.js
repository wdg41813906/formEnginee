import React from 'react';
import { Select } from 'antd';
import Attribute from './Attribute.js'

const Option = Select.Option;

@Attribute('类型', false)
class AddType extends React.PureComponent {
    constructor(props) {
        super(props);
        this.SetAddType = this.SetAddType.bind(this);
    }
    SetAddType(type) {
        let groupItems = this.props.groupItems;
        if (type === 'Add') {
            groupItems.detail.private = true;
        }
        else {
            groupItems.detail.private = false;
        }
        this.props.onChange({
            addFormat: type,
            groupItems
        });
    }
    render() {
        return (
            <Select value={this.props.addFormat} onChange={e => this.SetAddType(e)} style={{ width: "100%", marginBottom: 10 }}>
                <Option value="Add">省-市-区</Option>
                <Option value="DetailAdd">省-市-区-详细地址</Option>
            </Select>
        );
    }
}

export default {
    Component: AddType,
    getProps: (props) => {
        let { AddShowType, onChange, groupItems, addFormat } = props;
        return { AddShowType, onChange, groupItems, addFormat };
    }
};
