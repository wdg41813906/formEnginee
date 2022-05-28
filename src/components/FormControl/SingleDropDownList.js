import React from "react";
import { Select } from "antd";
import com from "../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import Title from "../../components/FormControl/Attribute/Title.js";
import Desc from "../../components/FormControl/Attribute/Desc.js";
import VerificationGroup from "../../components/FormControl/Attribute/VerificationGroup";
import OperationPower from "../../components/FormControl/Attribute/OperationPower.js";
import Position from "../../components/FormControl/Attribute/PositionStyle";
import FormControlType from "../../enums/FormControlType";
import DefaultValueDownList from "../../components/FormControl/Attribute/DefaultValueDownList";
import OptionalValues from "../../components/FormControl/Attribute/OptionalValues";
import DefaultOptionalValue from "../../components/FormControl/Attribute/DefaultOptionalValue";
import { LINKTYPE } from './DataLinker/DataLinker';

const Option = Select.Option;
const ds = { maxHeight: "400px", overflow: "auto" };

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = "SingleDropDownList";
    formItemBase.typeName = "下拉列表";
    formItemBase.name = "下拉列表"; //标题
    formItemBase.dicMode = true;
    formItemBase.autoFill = false;
    formItemBase.dropdownList = [
        { name: "选项1", value: com.Guid() },
        { name: "选项2", value: com.Guid() },
        { name: "选项3", value: com.Guid() }
    ];
    formItemBase.selectIndex = -1;
    return formItemBase;
}

class SingleDropDownListMiddel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(value, option) {
        if (value === null) {
            if(this.props.onChangeAll){
                this.props.onChangeAll({
                    value:{
                        value:undefined,
                        name: undefined
                    },
                })
            }else{
                this.props.setGroupItemValue("name", undefined);
                this.props.setGroupItemValue("value", undefined);
            }
        } else {
            if(this.props.onChangeAll){
                this.props.onChangeAll({
                    value:{
                        value:value,
                        name: option.props.children
                    },
                })
            }else{
                this.props.setGroupItemValue("name", option.props.children);
                this.props.setGroupItemValue("value", value);
            }

        }
    }

    render() {
        let { dropdownList, disabled, readOnly, groupValues, externalLoading, defaultValue } = this.props;
        if(defaultValue){
            groupValues = defaultValue
        }
        let exist = groupValues.value ? dropdownList.find(a => a.value === groupValues.value) : dropdownList.find(a => a.name === groupValues.name);
        if (!exist && (groupValues.value || groupValues.name)) {
            dropdownList = this.props.isExternal ? [] : dropdownList;
            dropdownList.push({ name: groupValues.name, value: groupValues.value });
        }
        else if (exist) {
            groupValues.value = exist.value;
            groupValues.name = exist.name;
        }
        return <Select
            onFocus={(this.props.optionalValues && this.props.dropdownList.length>0) ? ()=>void 0 : this.props.onFocus}
            disabled={disabled || readOnly}
            style={{ width: "100%", height: "30px" }}
            onChange={this.handleChange}
            value={groupValues.value}
            showSearch
            dropdownStyle={ds}
            filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
        >
            <Option key="none" value={null}>
                {externalLoading === true ? "载入中..." : "--请选择--"}
            </Option>
            {externalLoading === true ? null : dropdownList.map(e => (
                <Option key={e.value} value={e.value} title={e.name}>
                    {e.name}
                </Option>
            ))}
        </Select>;
    }
}

class SingleDropDownList extends React.PureComponent {
    render() {
        let dataLinker = this.props.dataLinker.find(a => a.linkType < 6 && a.linkType > 2);
        let linkType;
        let isShow = false;
        if (dataLinker) {
            linkType = dataLinker.linkType;
            if(linkType === LINKTYPE.Request){
              isShow = dataLinker.request.params ? !dataLinker.request.params.some((m) => m.type === 0) : false;
            }
            if (!this.props.groupValues.value && this.props.dropdownList.length>0) {
                this.props.setGroupItemValue('name', this.props.dropdownList[0].name);
                this.props.setGroupItemValue('value', this.props.dropdownList[0].value);
            }
        }

        let { mode } = this.props;
        switch (mode) {
            case "table":
            case "form":
                return <SingleDropDownListMiddel {...this.props} />;
            case "cell":
                return this.props.groupValues.name || "";
            case "groupCell":
                return this.props.groupValue || "";
            case "option":
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <Position.Component {...Position.getProps(this.props)} />
                        <DefaultValueDownList.Component {...DefaultValueDownList.getProps(this.props)} />
                        { isShow && <OptionalValues.Component {...OptionalValues.getProps(this.props)} />}
                        { isShow && <DefaultOptionalValue.Component {...DefaultOptionalValue.getProps(this.props)} />}
                        <VerificationGroup.Component {...VerificationGroup.getProps(this.props)} />
                        <OperationPower {...this.props} />
                        <Desc.Component {...Desc.getProps(this.props)} />
                    </React.Fragment>
                );
            default:
                return <div>控件加载失败</div>;
        }
    }
}

export default {
    itemType: "SingleDropDownList",
    formControlType: FormControlType.Group,
    items: [
        { key: "name", name: "{name}", valueType: "string" },
        { key: "value", name: "{name}Id", valueType: "string", private: true }
    ],
    name: "下拉列表",
    ico: "contacts",
    group: FORM_CONTROLLIST_GROUP.Normal, //分组
    Component: SingleDropDownList,
    event: {
        //获取用于参与计算引擎计算的计算元素
        onGetLinkerParams: function(props) {
            return [{ id: props.groupItems.name.id, name: props.name, valueType: "string" }];
        },
        //数据联动/关联其他表，请求获取到数据后触发，返回的object会放到props上
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
        buildSubTableHeader: props => {
            let { id, groupItems, name, container, cusWidValue } = props;
            let column = {
                title: name,
                key: id,
                dataIndex: groupItems.name.id,
                width: cusWidValue,
                container
            };
            return column;
        },
        FilterComponent: props => {
            return (
                <Select
                    mode="multiple"
                    style={{ width: "150px" }}
                    dropdownMatchSelectWidth={false}
                    placeholder="请选择筛选内容"
                    value={props.filterValue}
                    onChange={e => props.setFilterValue(e)}
                >
                    {props.dropdownList.map((item, index) => (
                        <Select.Option key={index} value={item.value} title={item.name}>
                            {item.name}
                        </Select.Option>
                    ))}
                </Select>
            );
        },
        getFilterComponentProps: props => {
            return { dropdownList: props.dropdownList };
        }
    },
    valueType: "string",
    initFormItemBase
};
