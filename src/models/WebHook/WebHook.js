import { Map, List, is } from "immutable";
import moment from "moment";
import { message, Modal } from "antd";
import { Guid, optionObj } from "../../utils/com";
import { getWebHookList, newWebHook, removeWebHook, getModifyWebHook, requestData } from "../../services/WebHook/WebHook";

export default {
	namespace: "webHook",
	state: {
		data: [],
		formPageInfo: {},
		isloading: false,
		addModelVisible: false,
		confirmLoading: false,
		modifyData: {},
		previewModelVisible: false,
		returnKey: {}
	},
	subscriptions: {},
	effects: {
		*getWebHookList(action, { call, put }) {
			yield put({ type: "dataWebHookLoading" });
			let { data } = yield call(getWebHookList, action.payload);
			if (data) {
				yield put({
					type: "setWebHookList",
					payload: {
						data
					}
				});
			}
		},
		*requestData(action, { call, put }) {
			yield put({ type: "setRequestDataWait" });
			const { url, method, body, form, header } = action.payload;
			let { data } = yield call(requestData, url, method, body, form, header);
			if (!data.error) {
				message.info("连接成功！");
				yield put({ type: "setReturnWebHookData", payload: data });
			} else {
				message.error("连接失败！");
			}
		},
		*newWebHook(action, { call, put, select }) {
			yield put({ type: "setNewWebHookLoading" });
			let { params, type } = action.payload;
			const { data } = yield call(newWebHook, params, type);
			let formPageInfo = yield select(({ webHook }) => webHook.formPageInfo);
			if (data.errors.isValid) {
				yield put({ type: "setNewWebHookData" });
				message.success(`新增数据源成功！`);
				yield put({
					type: "getWebHookList",
					payload: { PageIndex: formPageInfo.pageIndex, PageSize: formPageInfo.pageSize }
				});
			} else {
				Modal.error({
					title: "错误",
					content: data.errors.errorItems
						? data.errors.errorItems.map(item => {
								return (
									<span>
										[{item.propertyName}] {item.errorMessage}
										<br />
									</span>
								);
						  })
						: error.message,
					okText: "确定"
				});
				yield put({ type: "setNewWebHookError" });
			}
		},
		*removeWebHook(action, { select, call, put }) {
			let { data } = yield call(removeWebHook, { EntityIdList: [action.payload] });
			let formPageInfo = yield select(({ webHook }) => webHook.formPageInfo);
			if (data.errors.isValid) {
				yield put({
					type: "getWebHookList",
					payload: { PageIndex: formPageInfo.pageIndex, PageSize: formPageInfo.pageSize }
				});
			} else {
				Modal.error({
					title: "错误",
					content: data.errors.errorItems
						? data.errors.errorItems.map(item => {
								return (
									<span>
										[{item.propertyName}] {item.errorMessage}
										<br />
									</span>
								);
						  })
						: error.message,
					okText: "确定"
				});
			}
		},
		*getModifyWebHook(action, { select, call, put }) {
			yield put({ type: "dataWebHookLoading" });
			let { id, type } = action.payload;
			let { data } = yield call(getModifyWebHook, { EntityId: id });
			// let formPageInfo = yield select(({ dataSource }) => dataSource.formPageInfo)
			if (data.isValid) {
				if (type === "modify") {
					yield put({
						type: "setModifyWebHook",
						payload: { data }
					});
				} else {
					yield put({
						type: "setWebHookPreview",
						payload: { data }
					});
				}
			} else {
				yield put({ type: "setNetworkRequestDataError" });
			}
		}
	},
	reducers: {
		setWebHookList(state, action) {
			let { data, formPageInfo, isloading } = state;
			data = action.payload.data.webHookList;
			formPageInfo = action.payload.data.pagination;
			isloading = false;
			return { ...state, data, formPageInfo, isloading };
		},
		setReturnWebHookData(state, action) {
			let { returnKey } = state;
			returnKey = action.payload;
			return { ...state, returnKey };
		},
		dataWebHookLoading(state) {
			let { isloading } = state;
			isloading = true;
			return { ...state, isloading };
		},
		addWebHook(state) {
			let { addModelVisible } = state;
			addModelVisible = true;
			return { ...state, addModelVisible };
		},
		cancelWebHook(state) {
			let { addModelVisible, modifyData } = state;
			addModelVisible = false;
			modifyData = {};
			return { ...state, addModelVisible, modifyData };
		},
		setNewWebHookLoading(state) {
			let { confirmLoading } = state;
			confirmLoading = true;
			return { ...state, confirmLoading };
		},
		setNewWebHookData(state) {
			let { addModelVisible, confirmLoading } = state;
			addModelVisible = false;
			confirmLoading = false;
			return { ...state, addModelVisible, confirmLoading };
		},
		setNewWebHookError(state) {
			let { confirmLoading } = state;
			confirmLoading = false;
			return { ...state, confirmLoading };
		},
		setNetworkRequestDataError(state) {
			let { isloading } = state;
			isloading = false;
			return { ...state, isloading };
		},
		changeFormViewConfig(state, action) {
			// let {formViewConfig} = state;
			// formViewConfig = {...formViewConfig,...action.payload};
			return { ...state };
		},
		setModifyWebHook(state, action) {
			let { modifyData, addModelVisible, isloading } = state;
			modifyData = action.payload.data;
			addModelVisible = true;
			isloading = false;
			return { ...state, modifyData, addModelVisible, isloading };
		},
		setWebHookPreview(state, action) {
			let { modifyData, previewModelVisible, isloading } = state;
			modifyData = action.payload.data;
			previewModelVisible = true;
			isloading = false;
			return { ...state, modifyData, previewModelVisible, isloading };
		},
		cancelWebHookPreview(state) {
			let { modifyData, previewModelVisible } = state;
			modifyData = {};
			previewModelVisible = false;
			return { ...state, previewModelVisible, modifyData };
		}
	}
};
