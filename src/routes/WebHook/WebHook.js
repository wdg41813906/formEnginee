import React from "react";
import { connect } from "dva";
import queryString from "query-string";
import WebHookCom from "../../components/WebHook/WebHook";

function WebHook(props) {
	let { dispatch, history, webHook, location } = props;
	let { data, formPageInfo, modifyData, isloading, addModelVisible, confirmLoading, previewModelVisible, returnKey } = webHook;

	const WebHookComProps = {
		history,
		dispatch,
		data,
		modifyData,
		formPageInfo,
		addModelVisible,
		confirmLoading,
		isloading,
		previewModelVisible,
        returnKey,
		// GetModifyDataSource(id) {
		//     dispatch({
		//         type: 'dataSource/getModifyDataSource',
		//         payload: id
		//     });
		// },
		getWebHookList(page) {
			let queryJson = {
				pageIndex: page.current,
				pageSize: page.pageSize
			};
			dispatch({
				type: "webHook/getWebHookList",
				payload: queryJson
			});
		},
		requestData(url, method, body, form, header) {
			dispatch({
				type: "webHook/requestData",
				payload: {
					url,
					method,
					body,
					form,
					header
				}
			});
		},
		newWebHook(params, type) {
			dispatch({
				type: "webHook/newWebHook",
				payload: { params, type }
			});
		},
		getModifyWebHook(id, type) {
			dispatch({
				type: "webHook/getModifyWebHook",
				payload: { id, type }
			});
		},
		deleteWebHooke(id) {
			dispatch({
				type: "webHook/removeWebHook",
				payload: id
			});
		}
	};
	return (
		<React.Fragment>
			<WebHookCom {...WebHookComProps} />
		</React.Fragment>
	);
}

function mapStateToProps({ webHook }) {
	return {
		webHook
	};
}
export default connect(mapStateToProps)(WebHook);
