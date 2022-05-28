import React from 'react';
import { Button, Menu, Dropdown } from 'antd';
import com from '../../utils/com';
import Title from './Attribute/Title';
import OperationPower from './Attribute/OperationPower';
import FormControlType from '../../enums/FormControlType';
import LinkTable from './Attribute/LinkTable';

function initFormItemBase() {
    let formItemBase = com.formItemBase()
    formItemBase.type = "TableLinkerName";
    formItemBase.typeName = "子表链接器";
    formItemBase.name = "子表链接器";//标题
    return formItemBase;
}

class TableLinkerName extends React.PureComponent {
    handleMenuClick = (e) => {
        this.props.setTableLinkerValue(e.key);
        this.props.onChange({ value: `${e.item.props.children}|${e.key}` });
    }
    getArray = () => {
        let v = this.props.value || '浏览';
        if (v === '浏览')
            return ['浏览', null];
        else
            return v.split('|');
    }
    goToParent = () => {
        let v = this.getArray();
        if (v[1]) {
            document.getElementById(v[1]).scrollIntoView();
        }
    }
    render() {
        let { mode } = this.props;
        switch (mode) {
            case 'form':
                return null;
            case 'table':
                const { tableLinkerValueList, readOnly, disabled, getTableLinkerValueList, value } = this.props;
                const menu = <Menu onClick={this.handleMenuClick}>
                    {
                        (tableLinkerValueList || []).map(a =>
                            <Menu.Item value={a.value} key={a.value}>{a.name}</Menu.Item>
                        )
                    }
                </Menu>;
                return <div>
                    <Dropdown overlay={menu} trigger={['click']}>
                        <Button onClick={getTableLinkerValueList} disabled={disabled || readOnly}>{this.getArray()[0]}</Button>
                    </Dropdown>
                </div>
            case 'cell':
                return <Button onClick={this.goToParent} disabled={disabled || readOnly}>{this.getArray()[0]}</Button>
            case 'option':
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <LinkTable.Component {...LinkTable.getProps(this.props)} />
                        <OperationPower {...this.props} />
                    </React.Fragment>)
        }
    }
}

export default {
    itemType: "TableLinkerName",
    formControlType: FormControlType.Item,
    name: "子表链接器",
    ico: 'contacts',
    Component: TableLinkerName,
    valueType: 'string',
    initFormItemBase,
    event: {
        onBuildFormDataModel: (value, props) => {
            return (value || '').split('|')[1] || '';
        },
    },
    dropCount: 1,
    __canCopy: false,
    __canDelete: false
};
