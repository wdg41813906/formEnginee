import React from "react";
import { connect } from "dva";
import queryString from "query-string";
import DataSourceListCom from "../../components/DataSource/DataSourceList";
// import Voucher from '../../plugins/businessComponents/Voucher';

function DataSource(props) {
	let { dispatch, history, dataSource, location } = props;
	let {
		data,
		sourceData,
		isList,
		formPageInfo,
		addSourceVisible,
		halfCheckKeys,
		modifyData,
		propsRule,
		configurationData,
		stepCurrent,
		loading,
		isloading,
		primaryData,
		isSelectWebHokkModelVisible,
		webHookData,
		isWebHokkModelconfirmLoading,
		dynamicValueData,
		previewData
	} = dataSource;

	const DataSourceListComProps = {
		history,
		dispatch,
		data,
		sourceData,
		isList,
		formPageInfo,
		addSourceVisible,
		stepCurrent,
		loading,
		isloading,
		halfCheckKeys,
		modifyData,
		propsRule,
		configurationData,
		primaryData,
		isSelectWebHokkModelVisible,
		isWebHokkModelconfirmLoading,
		webHookData,
		dynamicValueData,
		previewData,
		GetDataSourceList(page, params) {
			let queryJson = {
				pageIndex: page.current,
				pageSize: page.pageSize,
				name: params
			};
			dispatch({
				type: "dataSource/getDataSourceList",
				payload: queryJson
			});
		},
		AddSourceOnClick() {
			dispatch({
				type: "dataSource/addSourceOnClick"
			});
		},
		CancelDataSource() {
			dispatch({
				type: "dataSource/cancelDataSource"
			});
		},
		BackStep() {
			dispatch({
				type: "dataSource/backStep"
			});
		},
		NextSetp(data) {
			dispatch({
				type: "dataSource/nextSetp",
				payload: data
			});
		},

		RequestData(url, method, body, form, header, interfaceMode, params, type, view) {
			dispatch({
				type: "dataSource/requestData",
				payload: {
					url,
					method,
					body,
					form,
					header,
					interfaceMode,
					params,
					type,
					view
				}
			});
		},
		HalfKeys(checkedKeys, halfKeys, exportDataStr) {
			dispatch({
				type: "dataSource/halfKeys",
				payload: { checkedKeys, halfKeys, exportDataStr }
			});
		},
		SavaRule(rule, exportData) {
			dispatch({
				type: "dataSource/savaRule",
				payload: { rule, exportData }
			});
		},
		NewDataSource(params, type) {
			dispatch({
				type: "dataSource/newDataSource",
				payload: { params, type }
			});
		},
		RemoveDataSource(id) {
			dispatch({
				type: "dataSource/removeDataSource",
				payload: id
			});
		},
		CopyDataSource(id) {
			dispatch({
				type: "dataSource/copyDataSource",
				payload: id
			});
		},
		PublishDataSource(id, type) {
			dispatch({
				type: "dataSource/publishDataSource",
				payload: { id, type }
			});
		},
		DataSourcePreview(url, methodType, params, rule) {
			dispatch({
				type: "dataSource/setDataSourcePreview",
				payload: { url, methodType, params, rule }
			});
		},
		GetModifyDataSource(id) {
			dispatch({
				type: "dataSource/getModifyDataSource",
				payload: id
			});
		},
		GetAllWebHook() {
			dispatch({
				type: "dataSource/getAllWebHook"
			});
		}
	};
	return (
		<React.Fragment>
			<DataSourceListCom {...DataSourceListComProps} />
			{/* <Voucher /> */}
		</React.Fragment>
	);
}

function mapStateToProps({ dataSource }) {
	return {
		dataSource
	};
}
export default connect(mapStateToProps)(DataSource);
