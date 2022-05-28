import React from "react";
import { Switch } from "antd";
import Attribute from "./Attribute.js";

@Attribute("打印配置")
class PrintConfig extends React.Component {
    constructor(props) {
        super(props);
    }
    
    
    SelectSwitch = (key, name, value) => {
        debugger;
        let Print = this.props.value || [{ key: 0, name: "打印" }];
        if (value) {
            Print.push({
                key,
                name
            });
        } else {
            Print = Print.filter(a => a.key !== key);
        }
        this.props.onChange(Print);
    };
    
    render() {
        let value = this.props.value || [{ key: 0, name: "打印" }];
        return <React.Fragment>
            <div style={{ padding: "6px" }}>
                <Switch checkedChildren="开启" unCheckedChildren="关闭"
                        checked={(value || []).filter(a => a.key === 0).length > 0}
                        onChange={(value) => this.SelectSwitch(0, "打印", value)}/><span
                style={{ padding: "0 5px" }}>打印</span>
            </div>
            <div style={{ padding: "6px" }}>
                <Switch checkedChildren="开启" unCheckedChildren="关闭"
                        checked={(value || []).filter(a => a.key === 1).length > 0}
                        onChange={(value) => this.SelectSwitch(1, "打印粘贴单", value)}/><span
                style={{ padding: "0 5px" }}>打印粘贴单</span>
            </div>
        </React.Fragment>;
    }
}

export default {
    Component: PrintConfig,
    getProps: (props) => {
        let { value, onChange } = props;
        return { value, onChange };
    }
};
