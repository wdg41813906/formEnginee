import React from 'react'
import { Input, Button, } from 'antd';
import Attribute from './Attribute.js'
import {getLinker, initLinker, LINKTYPE} from "../DataLinker/DataLinker";
import DataLinkerEditor from "../DataLinker/DataLinkerEditor";
/*多文本默认值*/
@Attribute('默认值')
class DefaultValueMuti extends React.Component {
    componentDidMount() {
    }
    constructor(props) {
        super(props);
        this.SetDefaultValue = this.SetDefaultValue.bind(this);
    }
    SetDefaultValue(e) {
        this.props.setDataLinker(initLinker(LINKTYPE.DefaultValue, e.target.value));
        this.props.onChange({ value: e.target.value });
    }
    render() {
        return (<div>
            <Input.TextArea  value={getLinker(this.props.dataLinker, a => a.linkType < 4).linkValue} style={{ resize: "none" }} onChange={e => this.SetDefaultValue(e)} />
        </div>);
    }
}
// export default DefaultValueMuti;
export default {
    Component: DefaultValueMuti,
    getProps: (props) => {
        let {onChange,setDataLinker,dataLinker } = props;
        return { setDataLinker, onChange,dataLinker };
    }
};
