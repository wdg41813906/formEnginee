import React from "react";
import { Select } from "antd";
import Attribute from "./Attribute.js";

const linkTableStyle = { width: '100%' };
@Attribute("链接字段")
class LinkTableFields extends React.Component {
    setTableLinkerFields = (tableLinkerFields) => {
        this.props.onChange({ tableLinkerFields })
    }
    componentDidMount() {
        this.props.buildFormDataFilter('tablelinker');
    }
    render() {
        let { tableLinkerFields, currentFormData } = this.props;
        tableLinkerFields = tableLinkerFields || [];
        tableLinkerFields = tableLinkerFields.filter(a => currentFormData.some(b => b.id === a));
        return <Select value={tableLinkerFields} mode='multiple' style={linkTableStyle}
            onChange={this.setTableLinkerFields}>
            {
                currentFormData.map(a =>
                    <Select.Option key={a.id} value={a.id} title={a.name}>
                        {a.name}
                    </Select.Option>)
            }
        </Select>
    }
}
// export default Desc;
export default {
    Component: LinkTableFields,
    getProps: (props) => {
        let { tableLinkFields, tableLinker, setTableLinker, onChange, id, subTableList,
            getSubTableList, buildFormDataFilter, currentFormData, tableLinkerFields } = props;
        return {
            tableLinkFields, tableLinker, setTableLinker, onChange, id, subTableList,
            getSubTableList, buildFormDataFilter, currentFormData, tableLinkerFields
        };
    }
};