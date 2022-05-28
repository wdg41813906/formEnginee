import React from 'react'
import { Checkbox, Input, Button, Switch, Select } from 'antd';
import Attribute from './Attribute.js'
import ConditionHidden from './ConditionHidden.js'


@Attribute('操作权限')
class OperationPower extends React.Component {
    componentDidMount() {
    } constructor(props) {
        super(props);
        this.SetSwitch = this.SetSwitch.bind(this);
    }
    SetSwitch(e) {
        this.props.setDisabled(!e);
    }
    render() {
        return <React.Fragment>
            {this.props.showEdiable === false ? null :
                <div><Switch checked={!this.props.getDisabled()} onChange={this.SetSwitch} />&nbsp;可编辑</div>
            }
            <ConditionHidden.Component {...ConditionHidden.getProps(this.props)} />
        </React.Fragment>;

    }
}
export default OperationPower;
