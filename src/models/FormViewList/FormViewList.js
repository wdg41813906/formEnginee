import { Map, List, is } from "immutable";
import { Modal } from "antd";
import moment from "moment";
import { Guid, optionObj } from "../../utils/com";
import {
	GetListPaged,
	dataSourceGetAll,
	getForModify,
	newSourceAcquisitionConfig,
	getByFormTemplateVersionId,
	sourceAcquisitionConfigTrigger,
	getUserFuncs
} from "../../services/FormViewList/FormViewList";

export default {
	namespace: "formViewList",
	state: {
		formViewConfig: {
			list: null,
			pageIndex: 1,
			pageCount: 0,
			pageSize: 20,
			totalCount: 0,
			loading: true
		},
		dataSource: [],
		formData: {},
		isDatapushVisible: false,
		acquisitionConfigData: {},
		confirmLoading: false,
		userFuncsVisible: false,
		userFuncsData: []
	},
	subscriptions: {},
	effects: {
		*getFormList(action, { call, put }) {
			const { pageIndex, pageSize, formName } = action.payload;
			let tempObj = {
				PageIndex: pageIndex,
				PageSize: pageSize
			};
			formName && (tempObj["formName"] = formName);
			const { data } = yield call(GetListPaged, tempObj);
			if (data) {
				let {
					formTemplateList: list,
					pagination: { pageCount, pageIndex, pageSize, totalCount }
				} = data;
				yield put({
					type: "changeFormViewConfig",
					payload: { list, pageCount, pageIndex: action.payload.pageIndex, pageSize: action.payload.pageSize, totalCount, loading: false }
				});
			}
		},
		*getForModify(action, { call, put }) {
			const { data } = yield call(getForModify, { EntityId: action.payload, Platform: "NPF" });
			const configData = yield call(getByFormTemplateVersionId, { FormTemplateVersionId: action.payload });
			if (data) {
				yield put({
					type: "setFormData",
					payload: { versionData: data, configData: configData.data }
				});
			}
		},
		*dataSourceGetAll(action, { call, put }) {
			const { data } = yield call(dataSourceGetAll);
			if (data) {
				yield put({
					type: "setDataSource",
					payload: data
				});
			}
		},
		*newSourceAcquisitionConfig(action, { call, put, select }) {
			yield put({ type: "setRequestDataLoading" });
			let { params, type } = action.payload;
			const { data } = yield call(newSourceAcquisitionConfig, params, type);
			let formPageInfo = yield select(({ formViewList }) => formViewList.formViewConfig);
			if (data.isValid) {
				yield put({ type: "cancelSourceAcquisition" });
				yield put({
					type: "getFormList",
					payload: { pageIndex: formPageInfo.pageIndex, pageSize: formPageInfo.pageSize }
				});
			} else {
				yield put({ type: "setRequestDataError" });
				Modal.error({
					title: "错误",
					content: data.errors.errorItems
						? data.errors.errorItems.map((item, index) => {
								return (
									<span key={index}>
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
		*sourceAcquisitionConfigTrigger(action, { call, put }) {
			const { data } = yield call(sourceAcquisitionConfigTrigger, {
				FormTemplateVersionId: action.payload,
				Platform: "FormEngine"
			});
			if (data.isValid) {
				Modal.info({
					title: "提示",
					content: `成功写入${data.data}条数据`
				});
			} else {
				Modal.error({
					title: "错误",
					content: data.errors.errorItems
						? data.errors.errorItems.map((item, index) => {
								return (
									<span key={index}>
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
		*getUserFuncs(action, { call, put }) {
			const { data } = yield call(getUserFuncs, {
				Platform: "NPF"
			});
			if (data) {
				yield put({ type: "setUserFuncsData", payload: data });
			} else {
				yield put({ type: "userFuncsCancel" });
				// Modal.error({
				//     title: '错误',
				//     content: data.errors.errorItems ? data.errors.errorItems.map((item, index) => {
				//         return <span key={index}>[{item.propertyName}] {item.errorMessage}<br /></span>
				//     }) : error.message,
				//     okText: '确定'
				// });
			}
		}
	},
	reducers: {
		changeFormViewConfig(state, action) {
			let { formViewConfig } = state;
			formViewConfig = { ...formViewConfig, ...action.payload };
			return { ...state, formViewConfig };
		},
		setDataSource(state, action) {
			let { dataSource, isDatapushVisible } = state;
			dataSource = action.payload;
			isDatapushVisible = true;
			return { ...state, dataSource, isDatapushVisible };
		},
		setFormData(state, action) {
			let { formData, acquisitionConfigData } = state;
			formData = action.payload.versionData;
			acquisitionConfigData = action.payload.configData;
			return { ...state, formData, acquisitionConfigData };
		},
		setSearchKey(state, { searchKey }) {
			return { ...state, searchKey };
		},
		cancelSourceAcquisition(state) {
			let { isDatapushVisible, acquisitionConfigData, formData, confirmLoading } = state;
			isDatapushVisible = false;
			acquisitionConfigData = {};
			formData = {};
			confirmLoading = false;
			return { ...state, isDatapushVisible, acquisitionConfigData, formData, confirmLoading };
		},
		setRequestDataLoading(state) {
			let { confirmLoading } = state;
			confirmLoading = true;
			return { ...state, confirmLoading };
		},
		setRequestDataError(state) {
			let { confirmLoading } = state;
			confirmLoading = false;
			return { ...state, confirmLoading };
		},
		showUserFuncsModel(state) {
			let { userFuncsVisible } = state;

			return { ...state, userFuncsVisible };
		},
		userFuncsCancel(state) {
			let { userFuncsVisible } = state;
			userFuncsVisible = false;
			return { ...state, userFuncsVisible };
		},
		setUserFuncsData(state, action) {
			let { userFuncsData, userFuncsVisible } = state;
			userFuncsVisible = true;
			userFuncsData = action.payload;
			return { ...state, userFuncsData, userFuncsVisible };
		}
	}
};
