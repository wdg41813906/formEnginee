import { message, Modal } from "antd";
import com from "../../utils/com";
import queryString from "query-string";
import {
	GetAllWithEvent,
	getBusinessEventList,
	newBusinessEvent,
	getModifyBusinessEvent,
	removeBusinessEvent,
	businessEventNotifyHistoryList,
	businessEventNotifyHistoryRetry,
} from "../../services/BusinessEvent/BusinessEvent";

export default {
	namespace: "businessEvent",
	state: {
		dataSource: [],
		data: [],
		formPageInfo: {},
		notifyPageInfo: {},
		isloading: false,
		btnLoading: false,
		visible: false,
		modifyData: null,
		notifyVisible: false,
		notifyData: [],
		retryStatus: false,
	},
	subscriptions: {},
	effects: {
		*GetAllWithEvent(action, { call, put }) {
			const { data } = yield call(GetAllWithEvent);
			if (data) {
				yield put({
					type: "setDataSource",
					payload: data,
				});
			}
		},
		*getBusinessEventList(action, { select, call, put }) {
			let params = action.payload;
			console.log("params", params);
			params.Type = 0;
			yield put({ type: "setNetworkLoading" });
			const { data } = yield call(getBusinessEventList, params);
			if (data) {
				yield put({
					type: "setDataList",
					payload: data,
				});
				yield put({ type: "setNetworkLoading" });
			} else {
				yield put({ type: "setNetworkLoading" });
			}
		},
		*newBusinessEvent(action, { select, call, put }) {
			yield put({ type: "setBtnLoading" });
			const { data } = yield call(newBusinessEvent, action.payload.data);
			if (data.errors.isValid) {
				yield put({
					type: "getBusinessEventList",
					payload: { formTemplateId: action.payload.formTemplateId },
				});
				yield put({ type: "showModal" });
				yield put({ type: "setBtnLoading" });
			} else {
				Modal.error({
					title: "错误",
					content: data.errorMessages,
					okText: "确定",
				});
				yield put({ type: "setBtnLoading" });
			}
		},
		*modifyShowModal(action, { select, call, put }) {
			yield put({ type: "setNetworkLoading" });
			const { data } = yield call(getModifyBusinessEvent, { id: action.payload });
			if (data.isValid) {
				yield put({ type: "setModifyData", payload: data });
				yield put({ type: "showModal" });
				yield put({ type: "setNetworkLoading" });
			} else {
				Modal.error({
					title: "错误",
					content: data.errorMessages,
					okText: "确定",
				});
				yield put({ type: "setNetworkLoading" });
			}
		},
		*delBusinessEvent(action, { select, call, put }) {
			const { data } = yield call(removeBusinessEvent, { entityIdList: action.payload.id });
			if (data.isValid) {
				yield put({
					type: "getBusinessEventList",
					payload: { formTemplateId: action.payload.formTemplateId },
				});
			} else {
				Modal.error({
					title: "错误",
					content: data.errorMessages,
					okText: "确定",
				});
			}
		},
		*notifyHistoryShowModal(action, { select, call, put }) {
			let { show, ...params } = action.payload;
			const { data } = yield call(businessEventNotifyHistoryList, params);
			if (data) {
				yield put({
					type: "setNotifyDataList",
					payload: data,
				});
				if (!show) yield put({ type: "notifyShowModal" });
			} else {
				Modal.error({
					title: "错误",
					content: data.errors.errorItems.map((item, index) => {
						return (
							<span key={index}>
								[{item.propertyName}] {item.errorMessage}
								<br />
							</span>
						);
					}),
					okText: "确定",
				});
			}
		},
		*businessEventNotifyHistoryRetry(action, { select, call, put }) {
			let { id, notifyid, params } = action.payload;
			let paramsdata = {
				BusinessEventNotifyHistoryId: id,
				businessEventNotifyId: notifyid,
				Parameters: params,
				Platform: "FormEngine",
			};
			const { data } = yield call(businessEventNotifyHistoryRetry, paramsdata);
			if (data.errors.isValid) {
				yield put({
					type: "setNotifyRetry",
				});
			} else {
				Modal.error({
					title: "错误",
					content: data.errorMessages,
					okText: "确定",
				});
			}
		},
	},
	reducers: {
		setDataList(state, action) {
			let { data, formPageInfo } = state;
			let { businessEventList, pagination } = action.payload;
			data = businessEventList;
			formPageInfo = pagination;
			return { ...state, data, formPageInfo };
		},
		setNetworkLoading(state) {
			let { isloading } = state;
			isloading = !isloading;
			return { ...state, isloading };
		},
		setDataSource(state, action) {
			let { dataSource } = state;
			dataSource = action.payload;
			return { ...state, dataSource };
		},
		showModal(state) {
			let { visible, modifyData } = state;
			visible = !visible;
			if (!visible) modifyData = null;
			return { ...state, visible, modifyData };
		},
		notifyShowModal(state) {
			let { notifyVisible } = state;
			notifyVisible = !notifyVisible;
			return { ...state, notifyVisible };
		},
		setBtnLoading(state) {
			let { btnLoading } = state;
			btnLoading = !btnLoading;
			return { ...state, btnLoading };
		},
		setModifyData(state, action) {
			let { modifyData } = state;
			modifyData = action.payload;
			return { ...state, modifyData };
		},
		setNotifyDataList(state, action) {
			let { notifyData, notifyPageInfo } = state;
			let { businessEventNotifyHistoryList, pagination } = action.payload;
			notifyData = businessEventNotifyHistoryList;
			notifyPageInfo = pagination;
			return { ...state, notifyData, notifyPageInfo };
		},
		setNotifyRetry(state) {
			let { retryStatus } = state;
			retryStatus = true;
			return { ...state, retryStatus };
		},
	},
};
