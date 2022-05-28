import { Table, Button, Pagination } from 'antd';
import react from 'react';
const columns = [
  {
    title: '仪表盘名称',
    dataIndex: 'name',
    key: 'name',
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
    this.props.ReportGetListPaged(1)
  }
  render() {
    const { reportList, reportPageInfo,reportSelectedRowKeys} = this.props;
    //const { selectedRowKeys } = this.state
    return (
      <div>
        <Table
          size="middle"
          rowKey={record => record.id}
          bordered
          columns={columns}
          rowSelection={{
            selectedRowKeys: reportSelectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              var list = [];
              selectedRows.forEach(ele => {
                list.push({sourceId:ele.id,versionId:'00000000-0000-0000-0000-000000000000'})
              })
              this.props.ReportSelectedRowKeyFn( selectedRowKeys );
              this.props.ReportSelect(list)
              //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
            getCheckboxProps: record => ({
              name: record.name,
            })
          }}
          dataSource={reportList}
          loading={this.props.loading}

          pagination={false}
        />
        <Pagination
          showQuickJumper
          className="ant-table-pagination"
          total={reportPageInfo.totalCount}
          current={reportPageInfo.pageIndex}
          pageSize={this.props.pageSize}
          onChange={this.props.ReportGetListPaged}
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