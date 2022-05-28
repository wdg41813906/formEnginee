import React from 'react';
import { Checkbox, Switch, Select } from 'antd';
import com from '../../utils/com';
import FORM_CONTROLLIST_GROUP from '../../enums/FormControlListGroup';
import Title from '../../components/FormControl/Attribute/Title.js';
import Desc from '../../components/FormControl/Attribute/Desc.js';
import VerificationGroup from '../../components/FormControl/Attribute/VerificationGroup.js';
import OperationPower from '../../components/FormControl/Attribute/OperationPower.js';
import DefaultValueDownList from '../../components/FormControl/Attribute/DefaultValueDownList';
import Position from '../../components/FormControl/Attribute/PositionStyle';
import ViewMode from './Attribute/ViewMode';
import FormControlType from '../../enums/FormControlType';
import OptionalValues from "../../components/FormControl/Attribute/OptionalValues";
import DefaultOptionalValue from "../../components/FormControl/Attribute/DefaultOptionalValue";
import { LINKTYPE } from './DataLinker/DataLinker';

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = 'CheckBoxes';
    formItemBase.typeName = '复选框';
    formItemBase.name = '复选框'; //标题
    formItemBase.dicMode = true;
    formItemBase.autoFill = true;
    formItemBase.dropdownList = [
        { name: '选项1', value: com.Guid() },
        { name: '选项2', value: com.Guid() },
        { name: '选项3', value: com.Guid() }
    ];
    formItemBase.viewMode = 0;
    return formItemBase;
}

class BoxMiddel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e, n, v) {
        let { name, value } = this.props.groupValues;
        if (n && v) {
            //开关模式
            let narray = name || [],
                varray = value || [];
            if (e) {
                narray.push(n);
                varray.push(v);
            } else {
                narray.splice(narray.indexOf(n), 1);
                varray.splice(varray.indexOf(v), 1);
            }
            if(this.props.onChangeAll){
                this.props.onChangeAll({
                    value:{
                        value:varray,
                        name: narray
                    },
                })
            }else{
                this.props.setGroupItemValue('value', varray); //.toString());
                this.props.setGroupItemValue('name', narray); //.toString());
            }
        } else {
            //默认模式
            let fildata = [];
            this.props.dropdownList.map(item => {
                e.map(_item => {
                    if (_item === item.value) {
                        fildata.push(item.name);
                    }
                });
            });
            if(this.props.onChangeAll){
                this.props.onChangeAll({
                    value:{
                        value:e,
                        name: fildata
                    },
                })
            }else{
                this.props.setGroupItemValue('value', e); //.toString());
                this.props.setGroupItemValue('name', fildata); //.toString());
            }
        }
    }

    render() {
        let { dropdownList, readOnly, disabled, viewMode, groupValues, defaultValue } = this.props;
        if(defaultValue){
            groupValues = defaultValue
        }
        let { value, name } = groupValues;
        // if (this.props.isExternal && Array.isArray(name)) {
        //     dropdownList = [];
        //     name.forEach((a, i) => {
        //         dropdownList.push({ name: a, value: value[i] });
        //     });
        // }
        if (Array.isArray(value) || Array.isArray(name)) {
            let checkArray = null, checkAttr = null;
            if (Array.isArray(value)) {
                checkArray = value;
                if (!this.props.isExternal) name = [];
                checkAttr = 'value';
            }
            else {
                checkArray = name;
                if (!this.props.isExternal) value = [];
                checkAttr = 'name';
            }
            dropdownList = this.props.isExternal ? [] : dropdownList;
            checkArray.forEach((a, i) => {
                let exist = dropdownList.find(b => b[checkAttr] === a);
                if (exist) {
                    name[i] = exist.name;
                    value[i] = exist.value;
                }
                else {
                    dropdownList.push({ name: name[i], value: value[i] })
                }
            });
            // value.forEach((a, i) => {
            //     if (!dropdownList.some(b => b.value === a))
            //         dropdownList.push({ name: name[i], value: a });
            // });
        }
        return (
            <React.Fragment>
                {viewMode === 0 ? (
                    <Checkbox.Group
                        style={{ width: '100%' }}
                        value={value || []}
                        disabled={disabled || readOnly}
                        onChange={this.handleChange}
                    >
                        {dropdownList.map(item => (
                            <Checkbox value={item.value} key={item.value} style={{ marginRight: 0 }}>
                                {item.name}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                ) : (
                        dropdownList.map((item, index) => (
                            <label key={index} style={{ marginRight: '8px', cursor: 'pointer' }}>
                                <Switch
                                    size="small"
                                    checked={value && value.indexOf(item['value']) !== -1}
                                    onChange={e => {
                                        this.handleChange(e, item['name'], item['value']);
                                    }}
                                    disabled={disabled}
                                />
                                <span style={{ padding: '0 8px' }}>{item['name']}</span>
                            </label>
                        ))
                    )}
            </React.Fragment>
        );
    }
}

class CheckBoxes extends React.PureComponent {
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
            case 'table':
            case 'form':
                return <BoxMiddel {...this.props} />;
            case 'cell':
                return this.props.groupValues.name || '';
            case 'groupCell':
                return (this.props.groupValue || []).toString();
            case 'option':
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <ViewMode.Component {...ViewMode.getProps(this.props)} />
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
    itemType: 'CheckBoxes',
    formControlType: FormControlType.Group,
    items: [
        { key: 'name', name: '{name}', valueType: 'array' },
        { key: 'value', name: '{name}Id', valueType: 'array', private: true }
    ],
    name: '复选框',
    ico: 'check-square-o',
    group: FORM_CONTROLLIST_GROUP.Normal, //分组
    Component: CheckBoxes,
    valueType: 'array',
    event: {
        //获取用于参与计算引擎计算的计算元素
        onGetLinkerParams: function (props) {
            return [
                {
                    id: props.groupItems.name.id,
                    name: props.name,
                    valueType: 'array'
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
                    mode="tags"
                    style={{ width: '150px' }}
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
    initFormItemBase
};
