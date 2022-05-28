import { Table, Button, Pagination } from 'antd';
import react from 'react';
const columns = [
  {
    title: '表单名称',
    dataIndex: 'formTemplateName',
    key: 'formTemplateName',
    render: (text) => <a >{text}</a>,
  },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    ley: 'createdTime',

  }
]
export default class StepThreeReport extends react.Component {
  constructor(props) {
    super(props);
    this.state={
      selectedRowKeys:[]
    }
    this.props.FormGetListPaged(1)
  }
  render() {
    const { formList, formPageInfo,formSelectedRowKeys} = this.props;
   // const { selectedRowKeys } = this.state
    return (
      <div>
        <Table
          size="middle"
          rowKey={record => record.id}
          bordered
          columns={columns}
          rowSelection={{
            selectedRowKeys: formSelectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              
              var list = [];
              selectedRows.forEach(ele => {
                list.push({sourceId:ele.formTemplateId,versionId:ele.id})
              })
              this.props.FormSelectedRowKeyFn( selectedRowKeys);
              this.props.FormSelect(list)
              //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
            getCheckboxProps: record => ({
              name: record.name,
            })
          }}
          dataSource={formList}
          loading={this.props.loading}

          pagination={false}
        />
        <Pagination
          showQuickJumper
          className="ant-table-pagination"
          total={formPageInfo.totalCount}
          current={formPageInfo.pageIndex}
          pageSize={this.props.pageSize}
          onChange={this.props.FormGetListPaged}
        />
        <div style={{ clear: 'both'}}></div>
        <div style={{ width: 75, margin: '0 auto' }}>
          <Button onClick={
            e=>this.props.Save()
          } type="primary">确定</Button>
        </div>
      </div>
    )

  }
}