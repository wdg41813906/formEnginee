import React from "react";
import { Select } from "antd";
import com from "../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import Title from "../../components/FormControl/Attribute/Title.js";
import Desc from "../../components/FormControl/Attribute/Desc.js";
import VerificationGroup from "../../components/FormControl/Attribute/VerificationGroup";
import OperationPower from "../../components/FormControl/Attribute/OperationPower.js";
// import MutiDropDownItem from '../../components/FormControl/Attribute/MutiDropDownItem.js'
import DefaultValueDownList from "../../components/FormControl/Attribute/DefaultValueDownList";
import Position from "../../components/FormControl/Attribute/PositionStyle";
import FormControlType from "../../enums/FormControlType";
import OptionalValues from "../../components/FormControl/Attribute/OptionalValues";
import DefaultOptionalValue from "../../components/FormControl/Attribute/DefaultOptionalValue";
import { LINKTYPE } from './DataLinker/DataLinker';

const Option = Select.Option;
const ds = { maxHeight: "400px", overflow: "auto" };

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = "MutiDropDownList";
    formItemBase.typeName = "下拉复选";
    formItemBase.name = "下拉复选";//标题
    formItemBase.dicMode = true;
    formItemBase.autoFill = false;
    // formItemBase.dropdownList = ["选项1", "选项2", "选项3"];
    formItemBase.dropdownList = [
        { name: "选项1", value: com.Guid() },
        { name: "选项2", value: com.Guid() },
        { name: "选项3", value: com.Guid() }
    ];
    return formItemBase;
}

class MutiDropDownListMiddel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(value, option) {
        let name = [];
        option.map(item => {
            name.push(item.props.children);
        });
        if(this.props.onChangeAll){
            this.props.onChangeAll({
                value:{
                    value:value,
                    name: name
                },
            })
        }else{
            this.props.setGroupItemValue("name", name);
            this.props.setGroupItemValue("value", value);
        }
    }

    render() {
        let { disabled, readOnly, dropdownList, groupValues, externalLoading, defaultValue } = this.props;
        if(defaultValue){
            groupValues = defaultValue
        }
        let { name, value } = groupValues;
        if (Array.isArray(value) || Array.isArray(name)) {
            let checkArray = Array.isArray(value) ? value : name;
            let checkAttr = Array.isArray(value) ? "value" : "name";
            dropdownList = this.props.isExternal ? [] : dropdownList;
            checkArray.forEach((a, i) => {
                let exist = dropdownList.find(b => b[checkAttr] === a);
                if (exist) {
                    if (!Array.isArray(name))
                        name = [];
                    if (!Array.isArray(value))
                        value = [];
                    name[i] = exist.name;
                    value[i] = exist.value;
                }
                else {
                    dropdownList.push({ name: name[i], value: value[i] });
                }
            });
        }
        return <Select disabled={disabled || readOnly} mode="multiple" style={{ width: "100%", height: "30px"}}
                       onFocus={this.props.onFocus} onChange={this.handleChange} value={value ? value : []}
                       showSearch dropdownStyle={ds}
                       filterOption={(input, option) =>
                           option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                       }>
            {externalLoading === true ?
                <Option key="none" value={null}>载入中...</Option> :
                dropdownList.map(e => (
                    <Option key={e.value} value={e.value} title={e.name}>
                        {e.name}
                    </Option>
                ))}
        </Select>;
    }
}

class MutiDropDownList extends React.PureComponent {
    render() {
        let dataLinker = this.props.dataLinker.find(a => a.linkType < 6 && a.linkType > 2);
        let linkType;
        let isShow = false;
        if (dataLinker) {
            linkType = dataLinker.linkType;
            if(linkType === LINKTYPE.Request){
              isShow = dataLinker.request.params ? !dataLinker.request.params.some((m) => m.type === 0) : false;
            }
        }
        let { mode } = this.props;
        switch (mode) {
            case "table":
            case "form":
                return <MutiDropDownListMiddel {...this.props} />;
            case "option":
                return <React.Fragment>
                    <Title.Component {...Title.getProps(this.props)} />
                    <Position.Component {...Position.getProps(this.props)} />
                    <DefaultValueDownList.Component {...DefaultValueDownList.getProps(this.props)} />
                    { isShow && <OptionalValues.Component {...OptionalValues.getProps(this.props)} />}
                        { isShow && <DefaultOptionalValue.Component {...DefaultOptionalValue.getProps(this.props)} />}
                    <VerificationGroup.Component {...VerificationGroup.getProps(this.props)} />
                    <OperationPower {...this.props} />
                    <Desc.Component {...Desc.getProps(this.props)} />
                </React.Fragment>;
            case "cell":
                return this.props.groupValues.name ? this.props.groupValues.name.toString() : null;
            case "groupCell":
                return (this.props.groupValue || []).toString();
            default:
                return <div>控件加载失败</div>;
        }
    }
}

export default {
    itemType: "MutiDropDownList",
    formControlType: FormControlType.Group,
    items: [{ key: "name", name: "{name}", valueType: "array" }, {
        key: "value",
        name: "{name}Id",
        valueType: "array",
        private: true
    }],
    name: "下拉复选",
    ico: "contacts",
    group: FORM_CONTROLLIST_GROUP.Normal,//分组
    Component: MutiDropDownList,
    valueType: "array",
    event: {
        //获取用于参与计算引擎计算的计算元素
        onGetLinkerParams: function(props) {
            return [{
                id: props.groupItems.name.id,
                name: props.name,
                valueType: "array"
            }];
        },
        onLoadData: function({ data, props }) {
            let dropdownList = [];
            let nameId = props.groupItems.name.id;
            data.forEach(a => {
                let { key: { value }, [nameId]: { name } } = a;
                dropdownList.push({
                    value,
                    name
                });
            });
            return { dropdownList };
        },
        buildSubTableHeader: (props) => {
            let { id, groupItems, name, container, cusWidValue } = props;
            let column = {
                title: name,
                key: id,
                dataIndex: groupItems.name.id,
                width: cusWidValue,
                container
            };
            return column;
        }
    },
    initFormItemBase
};
