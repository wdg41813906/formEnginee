import React from 'react';
import { Select, Checkbox } from 'antd';
import Attribute from '../Attribute/Attribute'

const Option = Select.Option;

function leafCheck(disabled, treeData) {
    if (!Array.isArray(treeData))
        return;
    treeData.filter(a => a.isLeaf).forEach(item => {
        if (item.isLeaf === false) {
            item.disabled = disabled;
        }
        leafCheck(disabled, item.children);
    });
    return treeData;
}

@Attribute('选择模式')
class SelectMode extends React.PureComponent {
    render() {
        let { selectMode, onChange, leafOnly, importTreeData } = this.props;
        return <React.Fragment>
            <Select
                value={selectMode}
                onChange={e => {
                    onChange({ selectMode: e });
                    // setGroupItemDataLinker('value', initLinker(LINKTYPE.DefaultValue, []));
                    // setGroupItemDataLinker('name', initLinker(LINKTYPE.DefaultValue, []))
                }}
                style={{ marginTop: 6, width: '100%' }}>
                <Option value="solo">单选</Option>
                <Option value="noSolo">多选</Option>
            </Select>
            <Checkbox checked={leafOnly} onChange={({ target: { checked } }) => {
                onChange({ leafOnly: checked, importTreeData: leafCheck(checked, importTreeData) })
            }} style={{ marginTop: '10px' }}>只能选中末级</Checkbox>
        </React.Fragment>;
    }
}

export default {
    Component: SelectMode,
    getProps: (props) => {
        let { valueType, onChange, typeName, selectMode, leafOnly, importTreeData } = props;
        return { valueType, onChange, typeName, selectMode, leafOnly, importTreeData };
    }
};
