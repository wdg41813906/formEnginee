import React from 'react';
import { Cascader as Cas, Input, Select } from 'antd';
import { cityArray } from "../../static/cityData";
import com from '../../utils/com';
import FORM_CONTROLLIST_GROUP from '../../enums/FormControlListGroup';
import Title from '../../components/FormControl/Attribute/Title.js';
import Desc from '../../components/FormControl/Attribute/Desc.js';
import VerificationGroup from '../../components/FormControl/Attribute/VerificationGroup.js';
import OperationPower from '../../components/FormControl/Attribute/OperationPower.js';
import Position from '../../components/FormControl/Attribute/PositionStyle';
import AddType from './Attribute/AddType';
import FormControlType from '../../enums/FormControlType';
import AddDefaultValue from './Attribute/AddDefaultValue';

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = 'Cascader';
    formItemBase.typeName = '地址';
    formItemBase.name = '地址';
    formItemBase.addFormat = 'Add';//Add 地址，DetailAdd详细地址
    //formItemBase.cityArray = cityArray;
    formItemBase.autoFill = true;
    return formItemBase;
}

class CascaderMiddel extends React.PureComponent {
    // handleChange = e => {
    //     if (e.length === 3) {
    //         this.props.setGroupItemValue('province', e[0]);
    //         this.props.setGroupItemValue('city', e[1]);
    //         this.props.setGroupItemValue('area', e[2]);
    //     } else {
    //         this.props.setGroupItemValue('detail', e.target.value);
    //     }
    // };

    handleChange = e => {
        this.props.setGroupItemValue('province', e[0]);
        this.props.setGroupItemValue('city', e[1]);
        this.props.setGroupItemValue('area', e[2]);
    };
    handleChangedetail = e => {
        this.props.setGroupItemValue('detail', e.target.value);
    }
    render() {
        let { addFormat, groupValues, disabled, readOnly } = this.props;
        return (
            <React.Fragment>
                <Cas
                    options={cityArray}
                    style={{
                        width: '100%'
                    }}
                    disabled={disabled || readOnly}
                    value={groupValues.province ? [groupValues.province, groupValues.city, groupValues.area] : null}
                    onChange={this.handleChange}
                    placeholder="省/市/区"
                />
                {addFormat === 'DetailAdd' ? (
                    <Input
                        disabled={disabled || readOnly}
                        placeholder="详细地址"
                        value={groupValues.detail ? groupValues.detail : null}
                        onChange={this.handleChangedetail}
                    />
                ) : null}
            </React.Fragment>
        );
    }
}

class Cascader extends React.PureComponent {
    render() {
        let { mode } = this.props;
        switch (mode) {
            case 'table':
            case 'form':
                return <CascaderMiddel {...this.props} />;
            case 'cell':
                return `${this.props.groupValues.province}/${this.props.groupValues.city}/${this.props.groupValues.area}
                ${this.props.groupValues.detail}`;
            case 'groupCell':
                return this.props.groupValue || '';
            case 'option':
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <AddDefaultValue.Component {...AddDefaultValue.getProps(this.props)} showThird={false} />
                        <AddType.Component {...AddType.getProps(this.props)} />
                        <Position.Component {...Position.getProps(this.props)} />
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
    itemType: 'Cascader',
    formControlType: FormControlType.Group,
    items: [
        {
            key: 'province',
            name: '省',
            valueType: 'string'
        },
        {
            key: 'city',
            name: '市',
            valueType: 'string'
        },
        {
            key: 'area',
            name: '区',
            valueType: 'string'
        },
        {
            key: 'detail',
            name: '详细地址',
            valueType: 'string',
            private: true
        }
    ],
    name: '地址',
    ico: 'environment',
    group: FORM_CONTROLLIST_GROUP.Advanced, //分组
    Component: Cascader,
    valueType: 'string',
    event: {
        //获取用于参与计算引擎计算的计算元素
        onGetLinkerParams: function (props) {
            return [
                {
                    id: props.groupItems.province.id,
                    name: props.name + '.省',
                    valueType: 'string'
                },
                {
                    id: props.groupItems.city.id,
                    name: props.name + '.市',
                    valueType: 'string'
                },
                {
                    id: props.groupItems.area.id,
                    name: props.name + '.区',
                    valueType: 'string'
                },
                {
                    id: props.groupItems.detail.id,
                    name: props.name + '.详细地址',
                    valueType: 'string'
                }
            ];
        },
        // onLoadData: function ({ data, props }) {
        //     // let addvalue = [];
        //     // let nameId = props.groupItems.name.id;
        //     // data.forEach(a => {
        //     //     let {key, [nameId]: name} = a;
        //     //     addvalue.push({
        //     //         value: key,
        //     //         name
        //     //     })
        //     // });
        //     // return {addvalue};
        //     return null;
        // },
        buildSubTableHeader: props => {
            let { groupItems, name, container, id, cusWidValue, addFormat } = props;
            let children = [
                {
                    dataIndex: groupItems.province.id,
                    key: groupItems.province.id,
                    title: groupItems.province.name,
                    width: cusWidValue
                },
                {
                    dataIndex: groupItems.city.id,
                    key: groupItems.city.id,
                    title: groupItems.city.name,
                    width: cusWidValue
                },
                {
                    dataIndex: groupItems.area.id,
                    key: groupItems.area.id,
                    title: groupItems.area.name,
                    width: cusWidValue
                }
            ];
            if (addFormat === 'DetailAdd')
                children.push({
                    dataIndex: groupItems.detail.id,
                    key: groupItems.detail.id,
                    title: groupItems.detail.name,
                    width: cusWidValue
                });
            let column = {
                title: name,
                key: id,
                width: cusWidValue,
                container,
                children
            };
            return column;
        },
        FilterComponent: (props) => {
            let { addFormat, filterValue, setFilterValue, groupItems } = props
            const onChange = (ele, address) => setFilterValue(ele, groupItems[address].id)
            let tempArrCity = cityArray.find(a => a.value === filterValue.province) || []
            let [arrCity, arrArea] = [[], []]
            if (tempArrCity.length !== 0)
                arrCity = tempArrCity.children
            if (arrCity.length !== 0)
                arrArea = arrCity[0].children
            return (
                <div>
                    <Select
                        style={{
                            width: filterValue.province ? filterValue.province.length * 30 : 100,
                            marginRight: 10
                        }}
                        dropdownMatchSelectWidth={false}
                        placeholder="省"
                        value={filterValue.province}
                        onChange={e => onChange(e, 'province')}
                    >
                        {cityArray.map((item, index) => (
                            <Select.Option key={index} value={item.value} title={item.label}>{item.label}</Select.Option>)
                        )}
                    </Select>
                    <Select
                        style={{
                            width: filterValue.city ? filterValue.city.length * 30 : 100,
                            marginRight: 10
                        }}
                        dropdownMatchSelectWidth={false}
                        placeholder="市"
                        value={filterValue.city}
                        onChange={e => onChange(e, 'city')}
                    >
                        {arrCity.map((item, index) => (
                            <Select.Option key={index} value={item.value} title={item.label}>{item.label}</Select.Option>)
                        )}
                    </Select>
                    <Select
                        style={{
                            width: filterValue.area ? filterValue.area.length * 30 : 100,
                            marginRight: 10
                        }}
                        dropdownMatchSelectWidth={false}
                        placeholder="区"
                        value={filterValue.area}
                        onChange={e => onChange(e, 'area')}
                    >
                        {arrArea.map((item, index) => (
                            <Select.Option key={index} value={item.value} title={item.label}>{item.label}</Select.Option>)
                        )}
                    </Select>
                    {
                        addFormat === 'DetailAdd' ?
                            <Input
                                style={{
                                    width: filterValue.detail ? filterValue.detail.length * 30 : 100
                                }}
                                placeholder="详细地址"
                                value={filterValue.detail || null}
                                onChange={e => onChange(e.target.value, 'detail')}
                            /> : null
                    }
                </div>
            );
        },
        getFilterComponentProps: (props) => {
            return props;
        }
    },
    initFormItemBase
};
