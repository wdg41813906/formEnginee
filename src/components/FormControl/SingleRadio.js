import React from 'react';
import { Radio, Select } from 'antd';
import com from '../../utils/com';
import FORM_CONTROLLIST_GROUP from '../../enums/FormControlListGroup';
import Title from '../../components/FormControl/Attribute/Title.js';
import Desc from '../../components/FormControl/Attribute/Desc.js';
import VerificationGroup from '../../components/FormControl/Attribute/VerificationGroup.js';
import OperationPower from '../../components/FormControl/Attribute/OperationPower.js';
import DefaultValueDownList from '../../components/FormControl/Attribute/DefaultValueDownList';
import Position from '../../components/FormControl/Attribute/PositionStyle';
import FormControlType from '../../enums/FormControlType';
import OptionalValues from "../../components/FormControl/Attribute/OptionalValues";
import DefaultOptionalValue from "../../components/FormControl/Attribute/DefaultOptionalValue";
import { LINKTYPE } from './DataLinker/DataLinker';

const RadioGroup = Radio.Group;
let initData = null;

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = 'SingleRadio';
    formItemBase.typeName = '单选框';
    formItemBase.name = '单选框'; //标题
    formItemBase.dicMode = true;
    formItemBase.autoFill = true;
    // formItemBase.panes = [{
    //   value: "0",
    //   text: "Option A"
    // }, {
    //   value: "1",
    //   text: "Option B"
    // }, {
    //   value: "2",
    //   text: "Option C"
    // }]
    formItemBase.dropdownList = [
        // { name: '选项1', value: com.Guid() },
        { name: '选项1', value: com.Guid() },
        { name: '选项2', value: com.Guid() },
        { name: '选项3', value: com.Guid() }
    ];
    return formItemBase;
}

class RadioMiddel extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    handleChange = (e) => {
        if (e.target.value === initData) {
            if (this.props.onChangeAll) {
                this.props.onChangeAll({
                    value: {
                        value: 'none',
                        name: ''
                    },
                })
            } else {
                this.props.setGroupItemValue('value', 'none');
                this.props.setGroupItemValue('name', '');
            }
            initData = null;
        } else {
            let fildata = this.props.dropdownList.find(item => {
                return e.target.value === item.value;
            });
            if (this.props.onChangeAll) {
                this.props.onChangeAll({
                    value: {
                        value: e.target.value,
                        name: fildata.name
                    },
                })
            } else {
                this.props.setGroupItemValue('value', e.target.value);
                this.props.setGroupItemValue('name', fildata.name);
            }
            initData = e.target.value;
        }
    }

    render() {
        let { dropdownList, groupValues, readOnly, disabled, defaultValue } = this.props;
        // if (this.props.isExternal && groupValues.name !== undefined) {
        //     dropdownList = [{ name: groupValues.name, value: groupValues.value }];
        // }
        if (defaultValue) {
            groupValues = defaultValue
        }
        let exist = groupValues.value && groupValues.value !== 'none' ? dropdownList.find(a => a.value === groupValues.value) : dropdownList.find(a => a.name === groupValues.name);
        if (!exist && groupValues.value !== 'none' && (groupValues.value || groupValues.name)) {
            dropdownList = this.props.isExternal ? [] : dropdownList;
            dropdownList.push({ name: groupValues.name, value: groupValues.value });
        }
        else if (exist) {
            groupValues.value = exist.value;
            groupValues.name = exist.name;
        }
        return (
            <RadioGroup disabled={disabled || readOnly} style={{ width: '100%' }} value={groupValues.value}>
                {dropdownList.map(item => (
                    <Radio
                        disabled={disabled || readOnly}
                        onClick={this.handleChange}
                        key={item.value}
                        value={item.value}
                    >
                        {item.name}
                    </Radio>
                ))}
            </RadioGroup>
        );
    }
}

class SingleRadio extends React.PureComponent {
    render() {
        // console.log('SingleRadio-render', this.props);
        let dataLinker = this.props.dataLinker.find(a => a.linkType < 6 && a.linkType > 2);
        let linkType;
        let isShow = false;
        if (dataLinker) {
            linkType = dataLinker.linkType;
            if (linkType === LINKTYPE.Request) {
                isShow = dataLinker.request.params ? !dataLinker.request.params.some((m) => m.type === 0) : false;
            }
            if (!this.props.groupValues.value && this.props.dropdownList.length>0) {
                this.props.setGroupItemValue('name', this.props.dropdownList[0].name);
                this.props.setGroupItemValue('value', this.props.dropdownList[0].value);
            }
        }


        let { mode } = this.props;
        switch (mode) {
            case 'table':
            case 'form':
                return <RadioMiddel {...this.props} />;
            case 'option':
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <Position.Component {...Position.getProps(this.props)} />
                        {/* <SelectionBox {...this.props} /> */}
                        <DefaultValueDownList.Component {...DefaultValueDownList.getProps(this.props)} />
                        {isShow && <OptionalValues.Component {...OptionalValues.getProps(this.props)} />}
                        {isShow && <DefaultOptionalValue.Component {...DefaultOptionalValue.getProps(this.props)} />}
                        <VerificationGroup.Component {...VerificationGroup.getProps(this.props)} />
                        <OperationPower {...this.props} />
                        {/* <Formart {...this.props} /> */}
                        <Desc.Component {...Desc.getProps(this.props)} />
                    </React.Fragment>
                );
            case 'cell':
                return this.props.groupValues.name || '';
            case 'groupCell':
                return this.props.groupValue || '';
            default:
                return <div>控件加载失败</div>;
        }
    }
}

export default {
    itemType: 'SingleRadio',
    formControlType: FormControlType.Group,
    items: [
        { key: 'name', name: '{name}', valueType: 'string' },
        { key: 'value', name: '{name}Id', valueType: 'string', private: true }
    ],
    name: '单选框',
    ico: 'check',
    group: FORM_CONTROLLIST_GROUP.Normal, //分组
    Component: SingleRadio,
    valueType: 'string',
    event: {
        //获取用于参与计算引擎计算的计算元素
        onGetLinkerParams: function (props) {
            return [
                {
                    id: props.groupItems.name.id,
                    name: props.name,
                    valueType: 'string'
                }
            ];
        },
        onLoadData: function ({ data, props }) {
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
                    style={{ width: '150px' }}
                    dropdownMatchSelectWidth={false}
                    placeholder="请选择筛选条件!"
                    value={props.filterValue}
                    onChange={e => props.setFilterValue(e)}
                >
                    {props.dropdownList.map((item, index) => (
                        <Select.Option key={index} value={item.name} title={a.name}>{item.name}</Select.Option>)
                    )}
                </Select>
            );
        },
        getFilterComponentProps: props => {
            return { dropdownList: props.dropdownList };
        }
    },
    initFormItemBase
};
