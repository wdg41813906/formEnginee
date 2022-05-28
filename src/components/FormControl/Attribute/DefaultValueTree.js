import React, { useCallback } from 'react';
import { TreeSelect } from 'antd';

import Attribute from './Attribute';
import { Fn } from '../../../utils';

const { SHOW_PARENT } = TreeSelect;
const {
    createExportInfo,
    compose,
    maybe,
    Maybe,
    id,
} = Fn;

const DefaultValueTree = props => {
    const {
        // 已经配置的树形选择器范围
        importTreeData,
        // 配置默认值
        treeDefaultValue,
        // 通知上层数据变动
        onChange,
        selectMode,
    } = props;

    const mTreeChangeHandler = useCallback(value => {
        return onChange({
            treeDefaultValue: value,
        });
    }, [])

    const tProps = {
        treeData: importTreeData,
        value: treeDefaultValue,
        onChange: mTreeChangeHandler,
        // 搜索通过节点title过滤
        treeNodeFilterProp: "title",
        showCheckedStrategy: SHOW_PARENT,
        placeholder: '请选择默认值',
        treeCheckable: true,
        showSearch: true,
        allowClear: true,
        multiple: selectMode !== 'solo',
        treeCheckable: selectMode !== 'solo',
        style: {
            width: '100%',
        },
    };

    return (
        <div>
            <TreeSelect {...tProps} />
        </div>
    )
}

const configPipe = compose(
    createExportInfo(props => ({
        importTreeData: props.importTreeData,
        onChange: props.onChange,
        selectMode: props.selectMode,
        treeDefaultValue: maybe(
            [],
            id,
            Maybe.of(props.treeDefaultValue),
        ),
    })),
    Attribute('默认值'),
)

export default configPipe(DefaultValueTree);
