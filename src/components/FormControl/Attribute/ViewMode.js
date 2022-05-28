import React, { Component } from 'react';
import { Input, Select } from 'antd';
import Attribute from './Attribute.js'

const Option = Select.Option;

@Attribute('视图模式', false)
class ViewMode extends React.PureComponent {
    render() {
        let { viewMode, onChange } = this.props;
        return (
            <Select value={viewMode} onChange={(e) => { onChange({ viewMode: e }) }} style={{ width: "100%", marginBottom: 10 }}>
                <Option value={0}>默认模式</Option>
                <Option value={1}>开关模式</Option>
            </Select>
        );
    }
}

export default {
    Component: ViewMode,
    getProps: (props) => {
        let { viewMode, onChange } = props;
        return { viewMode, onChange };
    }
};
