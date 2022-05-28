import React from "react";
import { Button, Table, Tag, Pagination, Modal, Menu, Dropdown, Icon } from "antd";
import TableCom from "../DataManage/TableCom";
import TableFooter from "../FormControl/common/TableFooter";
import styles from "./WebHook.less";
import AddModal from "./AddModal";
import WebHookPreview from "./WebHookPreview";
const { confirm } = Modal;

let id = 0;
class WebHook extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedRowKeys: [],
			columns: [
				{
					title: "序号",
					parentId: null,
					isData: true,
					width: 80,
					render: (text, record, index) => `${index + 1}`
				},
				{
					title: "名称",
					dataIndex: "name",
					key: "name",
					parentId: null,
					isData: true
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
									icon="edit"
									size="small"
									title="修改"
									onClick={() => {
										this.props.getModifyWebHook(record.id, "modify");
									}}
								/>
								<Button
									icon="eye"
									size="small"
									title="预览"
									onClick={() => {
										this.props.getModifyWebHook(record.id, "preview");
									}}
								/>
								<Button
									icon="delete"
									size="small"
									title="删除"
									onClick={() => {
										this.deleteWebHooke(record.id);
									}}
								/>
							</div>
						</div>
					)
				}
			]
		};
	}
	AddModelVisible = () => {
		this.props.dispatch({
			type: "webHook/addWebHook"
		});
	};
	deleteWebHooke(id) {
		let _this = this;
		confirm({
			title: "是否确认删除该条第三方系统?",
			onOk() {
				_this.props.deleteWebHooke(id);
			}
		});
	}
	componentDidMount() {
		this.props.getWebHookList({ current: 1, pageSize: 10 });
	}

	render() {
		const { columns } = this.state;
		const { data, formPageInfo, dispatch, modifyData, addModelVisible, isloading, confirmLoading, previewModelVisible, returnKey } = this.props;
		const { totalCount, pageIndex, pageSize, pageCount } = formPageInfo;
		const tableFooterPorps = {
			isSet: false,
			pageIndex,
			totalPage: pageCount,
			pageSize: pageSize,
			totalCount,
			// getPageTableData: this.getPageTableData,
			selecChange: value => {
				this.props.getWebHookList({ current: pageIndex, pageSize: value });
			},
			refresh: () => {
				this.props.getWebHookList({ current: pageIndex, pageSize: pageSize });
			}
		};
		return (
			<div className={styles.dataSource}>
				<div className={styles.btn}>
					<Button type="primary" icon="plus" onClick={this.AddModelVisible}>
						新增
					</Button>
					&nbsp;&nbsp;
				</div>
				{columns && data ? <TableCom columns={columns} tableData={data} removeHeight={`130px`} loading={isloading} /> : null}
				{JSON.stringify(formPageInfo) !== "{}" ? <TableFooter {...tableFooterPorps} /> : null}

				{addModelVisible ? (
					<AddModal
						dispatch={dispatch}
						confirmLoading={confirmLoading}
						newWebHook={this.props.newWebHook}
						addModelVisible={addModelVisible}
						requestData={this.props.requestData}
						modifyData={modifyData}
						returnKey={returnKey}
					/>
				) : null}

				{previewModelVisible ? <WebHookPreview dispatch={dispatch} previewModelVisible={previewModelVisible} modifyData={modifyData} /> : null}
			</div>
		);
	}
}

export default WebHook;
