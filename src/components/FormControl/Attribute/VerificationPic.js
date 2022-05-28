import React from 'react'
import { Checkbox, Input, Button, Switch, Select } from 'antd';
import Attribute from './Attribute.js'

@Attribute('校验')
class VerificationPic extends React.Component {
    componentDidMount() {
    } constructor(props) {
        super(props);
        this.SetSwitch = this.SetSwitch.bind(this);
    }
    SetSwitch(type, e) {
        var prop = {};
        prop[type] = e;
        this.props.onChange({ ...prop });
    }
    render() {
        let { Type, required, Multiple } = this.props;
        return (<div>
            <Switch checked={required} onChange={e => this.SetSwitch("required", e)} />&nbsp;必填
           <br />
            <div style={{ height: "5px" }}></div>
            <Switch checked={Multiple} onChange={e => this.SetSwitch("Multiple", e)} />&nbsp;{Type == 'Picture' ? "允许上传多张图片" : "允许多文件上传"}
        </div>);

    }
}
// export default VerificationPic;
export default {
    Component: VerificationPic,
    getProps: (props) => {
        let { Type, required, Multiple, onChange, } = props;
        return { Type, required, Multiple, onChange };
    }
};
