import react from 'react';
import {
    TreeSelect,
    Input
} from 'antd';
import BaseImmutableComponent from '../../../../components/BaseImmutableComponent'
const TreeNode = TreeSelect.TreeNode;

const TreeList = [
    { title: '测试但是1', value: '1', key: '1' },
    { title: '大神', value: '2', key: '2' },
    { title: '测试但是3', value: '3', key: '3' },
    { title: '测试但是5', value: '4', key: '4' },
    { title: '测试但是6', value: '5', key: '5' },
    { title: '测试但是7', value: '6', key: '6' },
    { title: '测试但是8', value: '7', key: '7' },
    { title: '测试但是9', value: '8', key: '8' },
    { title: '测试但是10', value: '9', key: '9' },
    { title: '测试但是11', value: '10', key: '10' },
    { title: '测试但是12', value: '11', key: '11' }

]
export default class SearchMiddle extends BaseImmutableComponent {
    constructor(props) {
        super(props);
        this.state = {
            treeSelect: [],
            TreeList: TreeList,
        }
    }
    onChange = (e) => {
        
        this.setState({
            treeSelect: e
        })
    }
    render() {
        return (
            <TreeSelect
                showSearch={true}

                style={{ width: 200 }}
                value={this.props.currentField.id}
                dropdownStyle={{ maxHeight: 150, overflow: 'auto' }}
                placeholder="请选择筛选内容"
                treeNodeFilterProp='title'
                allowClear
                treeDefaultExpandAll
                onChange={e=>this.props.FieldSelect(e)}

            >
            {
                this.props.reportFieldData.fields.map(ele=>
                    <TreeNode value={ele.id} title={ele.name} key={ele.id}>
                    </TreeNode>
                )
            }
           
            </TreeSelect>
        )
    }
}