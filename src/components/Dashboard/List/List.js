import React, { Component, PropTypes } from 'react';

// 采用antd的UI组件
import { Table, Message, Popconfirm, Pagination } from 'antd';
// import config from '../../../utils/config';
// 采用 stateless 的写法

class UserList extends React.Component {
  componentDidMount() {
    this.props.Init();
  }
  constructor(props) {
    super(props)
  }
  render() {
    const columns = [
      {
        title: '报表名称',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <a >{text}</a>,
      },
      {
        title: '创建人',
        dataIndex: 'createUserName',
        key: 'createUserName',
        render: (text) => <a >{text}</a>,
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: (text) => <a >{text}</a>,
      },
      {
        title: '修改时间',
        dataIndex: 'modifyTime',
        key: 'modifyTime',
        render: (text) => <a >{text}</a>,
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record) => (
          <p>
            <a onClick={() => this.props.onEditItem(record)}>编辑</a>&nbsp;&nbsp;
           <Popconfirm title='确定要删吗?' onConfirm={() => this.props.onDeleteItem(record.id)}>
              <a>删除</a>
            </Popconfirm>
          </p>
        ),
      }
    ]


    return (
      <div>
        <Table
          size="middle"
          bordered
          columns={columns}
          dataSource={this.props.dataSource}
          loading={this.props.loading}
          rowKey={record => record.Id}
          pagination={false}
        />


        <Pagination
          showQuickJumper
          className="ant-table-pagination"
          total={this.props.total}
          current={this.props.current}
          pageSize={config.pageSize}
          onChange={(page, size) => {
            this.props.onPageChange(page, size)
          }}
        />
      </div>
    )
  }
}


// UserList.propTypes = {
//   onPageChange: PropTypes.func,
//   onDeleteItem: PropTypes.func,
//   onEditItem: PropTypes.func,
// }
export default UserList;
