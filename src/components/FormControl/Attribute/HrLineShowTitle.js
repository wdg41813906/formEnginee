import React, {Component} from 'react';
import {Input, Select} from 'antd';
import Attribute from './Attribute.js'

const Option = Select.Option;

@Attribute('是否显示标题')
class HrLineShowTitle extends React.PureComponent {
    constructor(props) {
        super(props);
        this.SetAddType = this.SetAddType.bind(this)
    }

    SetAddType(type) {
        this.props.onChange({
            AddShowType: type,
            addFormat: type === "Show" ? 'Show' : 'Hidden',
        });
    }

    render() {
        let { AddShowType } = this.props;
        return (
            <Select value={AddShowType} onChange={e => this.SetAddType(e)} style={{width: '100%'}}>
                <Option value="Show">显示</Option>
                <Option value="Hidden">隐藏</Option>
            </Select>
        );
    }
}

export default {
    Component: HrLineShowTitle,
    getProps: (props) => {
        let {AddShowType, onChange} = props;
        return {AddShowType, onChange};
    }
};
