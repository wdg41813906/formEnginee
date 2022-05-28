import React from 'react'
import { Switch } from 'antd';
import Attribute from './Attribute.js'

@Attribute('校验')
class VerificationGroup extends React.Component {
    componentDidMount() {
    } constructor(props) {
        super(props);
        this.setSwitch = this.setSwitch.bind(this);
    }
    setSwitch(key, type, e) {
        let groupItems = this.props.groupItems;
        groupItems[key][type] = e;
        let obj = { groupItems };
        if (type === 'required') {
            if (e === true)
                obj.required = e;
            else {
                let r = false;
                for (let k in groupItems) {
                    if (groupItems[k].required === true) {
                        r = true;
                        break;
                    }
                }
                obj.required = r;
            }
        }
        this.props.onChange(obj);
    }
    render() {
        let { groupItems, dicMode } = this.props;
        return Object.keys(groupItems).map(key => {
            let a = groupItems[key];
            if (a.private === true)
                return null;
            let content = null;
            switch (a.valueType) {
                case 'number':
                    content = <React.Fragment>
                        <div style={{ marginTop: 10 }}><Switch checked={decimal} onChange={e => this.setSwitch(key, "decimal", e)} />&nbsp;允许小数</div>
                        <div style={{ marginTop: 10 }}><Switch checked={range} onChange={e => this.setSwitch(key, "range", e)} />&nbsp;限定数值范围</div>
                    </React.Fragment>
                    break;
                default:
                    break;
            }
            return <React.Fragment key={key}>
                {dicMode ? null : <div>{a.name}</div>}
                <div style={{ marginBottom: 6 }}><Switch checked={a.required} onChange={e => this.setSwitch(key, "required", e)} />&nbsp;必填</div>
                {content}
            </React.Fragment>
        });

    }
}
// export default Verification;
export default {
    Component: VerificationGroup,
    getProps: (props) => {
        let { groupItems, onChange, dicMode } = props;
        return { groupItems, onChange, dicMode };
    }
};
