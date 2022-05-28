import React from "react";
import { Button, Table, Tag, Pagination, Modal, Menu, Dropdown, Input, Icon, message } from "antd";
import TableCom from "../../components/DataManage/TableCom";
import TableFooter from "../../components/FormControl/common/TableFooter";
import styles from "./DataSource.less";
import AddModal from "./AddModal";
const Search = Input.Search;
const { confirm } = Modal;

class DataSourceList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedRowKeys: [],
			columns: [
				{
					title: "名称",
					dataIndex: "name",
					key: "name",
					parentId: null,
					isData: true
				},
				{
					title: "备注",
					dataIndex: "remark",
					key: "remark",
					parentId: null,
					isData: true,
					render: text => <span>{text && text.length > 30 ? text.substring(0, 30) + "..." : text}</span>
				},
				{
					title: "创建时间",
					dataIndex: "createTime",
					key: "createTime",
					parentId: null,
					isData: true,
					width: 180
				},
				{
					title: "修改时间",
					dataIndex: "modifyTime",
					key: "modifyTime",
					width: 180,
					isData: true,
					parentId: null
				},
				{
					title: "操作",
					key: "action",
					width: 150,
					parentId: null,
					isData: true,
					render: (text, record) => (
						<div>
							<div className={styles.dataSourceoperating}>
								<Button
									onClick={() => {
										this.props.GetModifyDataSource(record.id);
									}}
									size="small"
									icon="edit"
									title="修改"
								/>
								{record.publishStatus === 0 ? (
									<Button
										onClick={() => {
											this.publishDataSource(record.id, "publish");
										}}
										size="small"
										icon="upload"
										title="发布"
									/>
								) : (
										<Button
											className={styles.check}
											title="取消发布"
											size="small"
											icon="upload"
											onClick={() => {
												this.publishDataSource(record.id, "unpublish");
											}}
										/>
									)}
								<Button
									onClick={() => {
										this.copyDataSource(record.id);
									}}
									size="small"
									icon="copy"
									title="复制"
								/>
								{record.interfaceMode === 0 ? (
									<Button
										onClick={() => {
											this.props.DataSourcePreview(record.url, record.methodType, record.sourceParameterViewResponses, record.rule);
										}}
										size="small"
										icon="eye"
										title="预览"
									/>
								) : null}
								{/* {record.publishStatus === 0 ? ( */}
								<Button
									onClick={() => {
										this.deleteDataSource(record.id, record.publishStatus);
									}}
									size="small"
									icon="delete"
									title="删除"
								/>
								{/* ) : null} */}
							</div>
						</div>
					)
				}
			]
		};
	}
	onSelectChange = selectedRowKeys => {
		this.setState({ selectedRowKeys });
	};
	publishDataSource(id, type) {
		let _this = this;
		confirm({
			title: `是否确认${type === "publish" ? "发布" : "取消发布"}API?`,
			onOk() {
				_this.props.PublishDataSource(id, type);
			}
		});
	}
	copyDataSource(id) {
		let _this = this;
		confirm({
			title: "是否确认复制该条API?",
			onOk() {
				_this.props.CopyDataSource(id);
			}
		});
	}
	deleteDataSource(id, publishStatus) {
		if (publishStatus === 1) {
			message.warning("请先取消发布API再删除！");
		} else {
			let _this = this;
			confirm({
				title: "是否确认删除该条API?",
				onOk() {
					_this.props.RemoveDataSource(id);
				}
			});
		}
	}
	getPageTableData = page => {
		this.props.GetDataSourceList({ current: page, pageSize: this.props.formPageInfo.pageSize });
	};
	getBack() {
		this.props.history.goBack();
	}
	dataSourceSearch = (value) => {
		this.props.GetDataSourceList({ current: 1, pageSize: 10 }, value);
	}
	componentDidMount() {
		this.props.GetDataSourceList({ current: 1, pageSize: 10 });
		this.props.GetAllWebHook();
	}

	render() {
		const { columns, selectedRowKeys } = this.state;
		const {
			data,
			formPageInfo,
			CancelDataSource,
			addSourceVisible,
			propsRule,
			dispatch,
			configurationData,
			primaryData,
			isSelectWebHokkModelVisible,
			loading,
			sourceData,
			stepCurrent,
			BackStep,
			NextSetp,
			isloading,
			previewRule,
			HalfKeys,
			halfCheckKeys,
			modifyData,
			webHookData,
			isWebHokkModelconfirmLoading,
			dynamicValueData,
			previewData
		} = this.props;
		const { totalCount, pageIndex, pageSize, pageCount } = formPageInfo;
		// const rowSelection = {
		//     selectedRowKeys,
		//     onChange: this.onSelectChange,
		// };
		// const hasSelected = selectedRowKeys.length > 0;
		const tableFooterPorps = {
			isSet: false,
			pageIndex,
			totalPage: pageCount,
			pageSize: pageSize,
			totalCount,
			getPageTableData: this.getPageTableData,
			selecChange: value => {
				this.props.GetDataSourceList({ current: pageIndex, pageSize: value });
			},
			refresh: () => {
				this.props.GetDataSourceList({ current: pageIndex, pageSize: pageSize });
			}
		};
		return (
			<div className={styles.dataSource}>
				<div className={styles.btn}>
					<a
						onClick={() => {
							this.getBack();
						}}
					>
						<Icon type="left" />
						&nbsp;返回
					</a>
					<Button type="primary" icon="plus" onClick={this.props.AddSourceOnClick}>
						新增
					</Button>
					<div className={styles.cooperateItem}>
						<Search
							placeholder="请输入API名称查询"
							// value={searchKey}
							onSearch={this.dataSourceSearch}
							// onSearch={this.search}
							style={{ width: 250 }}
						/>
					</div>
				</div>

				{/* <Button type="danger" ghost onClick={() => { this.deleteDataSource('dels') }} disabled={!hasSelected}>删除</Button>
                <span style={{ marginLeft: 8 }}>
                    {hasSelected ? `选中 ${selectedRowKeys.length} 条数据` : ''}
                </span> */}
				{/* <Table
                    loading={isloading}
                    rowKey={record => record.id}
                    dataSource={data}
                    columns={columns}
                    bordered
                    // rowSelection={rowSelection}
                    pagination={{
                        total: totalCount,
                        current: pageIndex,
                        showSizeChanger: true,
                        pageSize: pageSize,
                        showTotal: totalCount => `显示1-${pageSize}，共 ${totalCount} 条`
                    }}
                    onChange={this.props.GetDataSourceList}
                /> */}

				{columns && data ? <TableCom columns={columns} tableData={data} removeHeight={`130px`} loading={isloading} /> : null}
				{JSON.stringify(formPageInfo) !== "{}" ? <TableFooter {...tableFooterPorps} /> : null}

				{addSourceVisible ? (
					<AddModal
						dispatch={dispatch}
						configurationData={configurationData}
						cancelDataSource={CancelDataSource}
						visible={addSourceVisible}
						loading={loading}
						sourceData={sourceData}
						stepCurrent={stepCurrent}
						backStep={BackStep}
						stepNext={NextSetp}
						previewRule={previewRule}
						savehalfKeys={HalfKeys}
						halfCheckKeys={halfCheckKeys}
						modifyData={modifyData}
						savaRule={this.props.SavaRule}
						propsRule={propsRule}
						primaryData={primaryData}
						newDataSource={this.props.NewDataSource}
						isSelectWebHokkModelVisible={isSelectWebHokkModelVisible}
						isWebHokkModelconfirmLoading={isWebHokkModelconfirmLoading}
						webHookData={webHookData}
						dynamicValueData={dynamicValueData}
						requestData={this.props.RequestData}
						previewData={previewData}
					/>
				) : null}
			</div>
		);
	}
}

export default DataSourceList;
