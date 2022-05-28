import React from 'react';
import { Switch } from 'antd';
import Attribute from './Attribute.js';

@Attribute('校验')
class Verification extends React.Component {
    componentDidMount() {
    } constructor(props) {
        super(props);
        this.SetSwitch = this.SetSwitch.bind(this);
    }
    SetSwitch(type, e) {
        this.props.onChange({ [type]: e });
    }
    render() {
        let { required, unique, type } = this.props;
        return (<React.Fragment>
            <div style={{ marginBottom: 6 }}><Switch checked={required} onChange={e => this.SetSwitch("required", e)} />&nbsp;必填</div>
            {type === "SingleText" && <div><Switch checked={unique} onChange={e => this.SetSwitch("unique", e)} />&nbsp;不允许重复值</div>}
        </React.Fragment>);

    }
}
// export default Verification;
export default {
    Component: Verification,
    getProps: (props) => {
        let { required, isRepeat, type, onChange, unique } = props;
        return { required, isRepeat, type, onChange, unique };
    }
};
