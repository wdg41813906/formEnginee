import { Table, Divider, Tag } from 'antd';
import { DragSource } from 'react-dnd';
const spec = {
    beginDrag(props) {
    
    },
    endDrag(props, monitor) {
      // console.log("是否在这里 加入项");
    }
};
function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        // isDragging: monitor.isDragging()
    };
}
const EditableRow = ({ children, ...other }) => {
    return <tr {...other}>{children}</tr>
};
const EditableHeader = ({ children, connectDragSource, ...other }) => {
    return connectDragSource(<th {...other}>{children}</th>)
};

class EditableCell extends React.PureComponent {
    render() {
        let { children, ...other } = this.props;
        return <td {...other}>{children}</td>
    }
}

const { Column, ColumnGroup } = Table;
let data = [{
    key: '5',
    firstName: 'John',
    lastName: 'Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
}, {
    key: '2',
    firstName: 'Jim',
    lastName: 'Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
}, {
    key: '3',
    firstName: 'Joe',
    lastName: 'Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
}];
const handleClick = (key) => {
    let item = data.filter(a => a.key === key)[0];
    item.firstName = item.firstName + '1';
}
const columnData = [
    { title: 'Age', dataIndex: 'address', key: 'age', top: true},
    { title: 'Name', group: true, top: true },
    {
        title: 'First Name', dataIndex: 'firstName', key: 'firstName', parent: 'Name'
    },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName', parent: 'Name' },

    { title: 'Address', dataIndex: 'address', key: 'address', top: true },
    // {
    //     title: 'Tags', dataIndex: 'tags', key: 'tags', top: true, render: tags => (
    //         <span>
    //             {tags.map(tag => <Tag color="blue" key={tag}>{tag}</Tag>)}
    //         </span>
    //     )
    // },
    // {
    //     title: 'Action', dataIndex: 'action', key: 'action', top: true, render: (text, record) => (
    //         <span>
    //             <a href="javascript:;">Invite {record.lastName}</a>
    //             <Divider type="vertical" />
    //             <a href="javascript:;">Delete</a>
    //         </span>
    //     )
    // },
]

const renderColumns = (title, columns) => {
    let childrenColumns = columns.filter(a => a.parent === title);
    return childrenColumns.map((a, i) => {
        let { group, top, ...other } = a;
        return group ? <ColumnGroup key={i} width={other.width} title={other.title}>
            {renderColumns(other.title, columns)}
        </ColumnGroup> :
            <Column key={i}  {...other}></Column>
    })
}
const rowSelection = (
    ()=>{
        return {
            fixed: true,
            onChange:(selectedRowKeys )=>{
            
            },
            selectedRowKeys:[]
        }
    }
)()

const buildColumns = (columns) => {
    let topColumns = columns.filter(a => a.top);
    return topColumns.map((a, i) => {
        let { group, top, ...other } = a;
        return group ? <ColumnGroup key={i} width={other.width} title={other.title}>
            {renderColumns(other.title, columns)}
        </ColumnGroup> :
            <Column key={i} {...other}></Column>
    })
}
class SubTable extends React.PureComponent {
    render() {
        return <Table bordered dataSource={this.props.dataSource} rowKey={(record)=>{return record["firstName"]}} components={{
            body: {
                //row: EditableRow,
                cell: EditableCell
            },
            header: {
                //row: EditableRow,
                cell: DragSource('test', spec, collect)(EditableHeader)
            }
        }} >
            {
                buildColumns(columnData)
            }
        </Table>
    }
}
const Welcome = <div>
    <p>12321321</p>
   <SubTable dataSource={data} />
</div>;
export default Welcome;
