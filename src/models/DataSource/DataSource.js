import { message, Modal } from "antd";
import {
	getDataSourceList,
	requestData,
	newDataSource,
	getModifyDataSource,
	removeDataSource,
	copyDataSource,
	publishDataSource,
	getAllWebHook,
	getDynamicValue
} from "../../services/DataSource/DataSource";
import { FormEngine } from "../../utils/PlatformConfig";

export default {
	namespace: "dataSource",
	state: {
		data: [],
		sourceData: undefined,
		formPageInfo: {},
		addSourceVisible: false,
		stepCurrent: 1,
		loading: false,
		isloading: false,
		halfCheckKeys: {},
		propsRule: {},
		modifyData: {},
		configurationData: [],
		primaryData: undefined,
		isSelectWebHokkModelVisible: false,
		isWebHokkModelconfirmLoading: false,
		webHookData: [],
		dynamicValueData: {},
		previewData: undefined,
	},
	effects: {
		*getDataSourceList(action, { call, put }) {
			yield put({ type: "dataSourceListLoading" });
			let { data } = yield call(getDataSourceList, action.payload);
			if (data) {
				yield put({
					type: "setDataSourceList",
					payload: {
						data
					}
				});
			} else {
				yield put({ type: "setNetworkRequestDataError" });
			}
		},
		*requestData(action, { call, put }) {
			yield put({ type: "setRequestDataWait" });
			const { url, method, body, form, header, interfaceMode, params, type, view } = action.payload;
			let { data } = yield call(requestData, url, method, body, form, header);
			if (interfaceMode === 2) {
				if (data instanceof Object && data.hasOwnProperty("success") && data.hasOwnProperty("msg") && data.hasOwnProperty("ableToContinue")) {
					yield put({
						type: "newDataSource",
						payload: { params, type }
					});
				} else {
					Modal.error({
						title: "错误",
						content: "校验失败！",
						okText: "确定"
					});
					yield put({ type: "setRequestDataError" });
				}
			} else {
				if (data.error) {
					yield put({ type: "setRequestDataError" });
				} else {
					yield put({
						type: "setRequestData",
						payload: { data, view }
					});
				}
			}
		},
		*newDataSource(action, { select, call, put }) {
			yield put({ type: "setRequestDataWait" });
			let { data } = yield call(newDataSource, action.payload.params, action.payload.type);
			let formPageInfo = yield select(({ dataSource }) => dataSource.formPageInfo);

			if (data.errors.isValid) {
				yield put({ type: "setNewDataSourceData" });
				message.success(`${action.payload.type === "add" ? "新增" : "修改"}数据源成功！`);
				yield put({
					type: "getDataSourceList",
					payload: { PageIndex: formPageInfo.pageIndex, PageSize: formPageInfo.pageSize }
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
				yield put({ type: "setRequestDataError" });
			}
		},

		*removeDataSource(action, { select, call, put }) {
			let { data } = yield call(removeDataSource, { EntityIdList: [action.payload] });
			let formPageInfo = yield select(({ dataSource }) => dataSource.formPageInfo);
			if (data.errors.isValid) {
				yield put({
					type: "getDataSourceList",
					payload: { PageIndex: formPageInfo.pageIndex, PageSize: formPageInfo.pageSize }
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
		*copyDataSource(action, { select, call, put }) {
			let { data } = yield call(copyDataSource, { EntityId: action.payload });
			let formPageInfo = yield select(({ dataSource }) => dataSource.formPageInfo);
			if (data.isValid) {
				yield put({
					type: "getDataSourceList",
					payload: { PageIndex: formPageInfo.pageIndex, PageSize: formPageInfo.pageSize }
				});
			}
		},
		*publishDataSource(action, { select, call, put }) {
			let { data } = yield call(publishDataSource, { EntityIdList: [action.payload.id] }, action.payload.type);
			let formPageInfo = yield select(({ dataSource }) => dataSource.formPageInfo);
			if (data.isValid) {
				yield put({
					type: "getDataSourceList",
					payload: { PageIndex: formPageInfo.pageIndex, PageSize: formPageInfo.pageSize }
				});
			}
		},
		*getModifyDataSource(action, { select, call, put }) {
			yield put({ type: "dataSourceListLoading" });
			let { data } = yield call(getModifyDataSource, { EntityId: action.payload });
			let formPageInfo = yield select(({ dataSource }) => dataSource.formPageInfo);
			if (data.isValid) {
				yield put({
					type: "setModifyDataSource",
					payload: { data }
				});
			} else {
				yield put({ type: "setNetworkRequestDataError" });
			}
			//     yield put({
			//         type: "getDataSourceList",
			//         payload: { PageIndex: formPageInfo.pageIndex, PageSize: formPageInfo.pageSize },

			//     })
		},
		*getAllWebHook(action, { call, put }) {
			let { data } = yield call(getAllWebHook);
			yield put({
				type: "setWebHookData",
				payload: { data }
			});
		},
		*getDynamicValue(action, { call, put }) {
			yield put({ type: "setDynamicValueLoading" });
			let { data } = yield call(getDynamicValue, { WebHookAppId: action.payload, Platform: FormEngine });
			if (!data.error) {
				yield put({
					type: "setDynamicValueData",
					payload: { data }
				});
			} else {
				yield put({ type: "setDynamicValueDataError" });
			}
		}
	},

	reducers: {
		setDataSourceList(state, action) {
			let { data, formPageInfo, isloading } = state;
			let { sourceTypeConfigList, pagination } = action.payload.data;
			data = sourceTypeConfigList;
			formPageInfo = pagination;
			isloading = false;
			return { ...state, data, formPageInfo, isloading };
		},
		dataSourceListLoading(state) {
			let { isloading } = state;
			isloading = true;
			return { ...state, isloading };
		},
		addSourceOnClick(state) {
			let { addSourceVisible, stepCurrent } = state;
			addSourceVisible = true;
			stepCurrent = 1;
			return { ...state, addSourceVisible, stepCurrent };
		},
		setDataSourcePreview(state, action) {
			let { addSourceVisible, stepCurrent, isloading, previewData } = state;
			let { url, methodType, params, rule } = action.payload;
			addSourceVisible = true;
			stepCurrent = 3;
			isloading = true;
			previewData = {
				url, methodType, params, rule
			}
			return { ...state, addSourceVisible, stepCurrent, isloading, previewData };
		},
		cancelDataSource(state) {
			let { addSourceVisible, modifyData, primaryData, sourceData, halfCheckKeys, propsRule, configurationData, isloading, previewData } = state;
			addSourceVisible = false;
			modifyData = {};
			primaryData = undefined;
			sourceData = undefined;
			halfCheckKeys = {};
			propsRule = {};
			configurationData = [];
			isloading = false;
			previewData = undefined;
			return {
				...state,
				addSourceVisible,
				modifyData,
				primaryData,
				sourceData,
				halfCheckKeys,
				propsRule,
				configurationData,
				isloading,
				previewData
			};
		},
		backStep(state) {
			let { stepCurrent } = state;
			stepCurrent = state.stepCurrent === 2 ? 1 : 2;
			return { ...state, stepCurrent };
		},
		nextSetp(state, action) {
			let { stepCurrent } = state;
			stepCurrent = 3;
			return { ...state, stepCurrent };
		},
		halfKeys(state, action) {
			let { halfCheckKeys } = state;
			halfCheckKeys = {
				checkedKeys: action.payload.checkedKeys,
				halfKeys: action.payload.halfKeys,
				exportDataStr: action.payload.exportDataStr
			};
			return { ...state, halfCheckKeys };
		},
		savaRule(state, action) {
			let { propsRule } = state;
			propsRule = {
				rule: action.payload.rule,
			};
			return { ...state, propsRule };
		},
		delHalfCheckKeys(state, action) {
			let { halfCheckKeys, propsRule, primaryData } = state;
			halfCheckKeys = {};
			propsRule = {};
			primaryData = undefined;
			return { ...state, halfCheckKeys, propsRule, primaryData };
		},
		setRequestData(state, action) {
			let { sourceData, stepCurrent, loading } = state;
			sourceData = action.payload.data;
			if (!action.payload.view)
				stepCurrent = 2;
			loading = false;
			return { ...state, sourceData, stepCurrent, loading };
		},
		setRequestDataWait(state) {
			let { loading } = state;
			loading = true;
			return { ...state, loading };
		},
		setRequestDataError(state) {
			let { loading } = state;
			loading = false;
			return { ...state, loading };
		},
		setNetworkRequestDataError(state) {
			let { isloading } = state;
			isloading = false;
			return { ...state, isloading };
		},
		setNewDataSourceData(state, action) {
			let { addSourceVisible, loading, propsRule, halfCheckKeys, configurationData, modifyData } = state;
			addSourceVisible = false;
			loading = false;
			propsRule = {};
			halfCheckKeys = {};
			configurationData = [];
			modifyData = {};
			return { ...state, addSourceVisible, loading, propsRule, halfCheckKeys, configurationData, modifyData };
		},
		setModifyDataSource(state, action) {
			let { addSourceVisible, stepCurrent, primaryData, modifyData, propsRule, configurationData, halfCheckKeys, isloading } = state;
			let { data } = action.payload;
			let configuration = JSON.parse(data.configuration);
			addSourceVisible = true;
			stepCurrent = 1;
			if (data.rule) {
				propsRule = {
					rule: JSON.parse(data.rule),
				};
				// primaryData = configdata ? configdata.key : undefined;
				primaryData = JSON.parse(data.rule).primaryKey;
			}

			configurationData = configuration;
			modifyData = data;
			isloading = false;
			return {
				...state,
				addSourceVisible,
				stepCurrent,
				primaryData,
				modifyData,
				propsRule,
				configurationData,
				halfCheckKeys,
				isloading
			};
		},
		setConfiguration(state, action) {
			let { configurationData } = state;
			configurationData = action.payload;
			return { ...state, configurationData };
		},
		setPrimary(state, action) {
			let { primaryData } = state;
			primaryData = action.payload;
			return { ...state, primaryData };
		},
		delPrimary(state) {
			let { primaryData } = state;
			primaryData = undefined;
			return { ...state, primaryData };
		},
		webHookSelect(state) {
			let { isSelectWebHokkModelVisible } = state;
			isSelectWebHokkModelVisible = true;
			return { ...state, isSelectWebHokkModelVisible };
		},
		cancelWebHookSelect(state) {
			let { isSelectWebHokkModelVisible } = state;
			isSelectWebHokkModelVisible = false;
			return { ...state, isSelectWebHokkModelVisible };
		},
		setWebHookData(state, action) {
			let { webHookData } = state;
			webHookData = action.payload.data;
			return { ...state, webHookData };
		},
		setDynamicValueLoading(state) {
			let { isWebHokkModelconfirmLoading } = state;
			isWebHokkModelconfirmLoading = true;
			return { ...state, isWebHokkModelconfirmLoading };
		},
		setDynamicValueDataError(state) {
			let { isWebHokkModelconfirmLoading } = state;
			isWebHokkModelconfirmLoading = false;
			return { ...state, isWebHokkModelconfirmLoading };
		},
		setDynamicValueData(state, action) {
			let { isWebHokkModelconfirmLoading, isSelectWebHokkModelVisible, dynamicValueData } = state;
			isWebHokkModelconfirmLoading = false;
			isSelectWebHokkModelVisible = false;
			dynamicValueData = action.payload.data;
			return { ...state, isWebHokkModelconfirmLoading, isSelectWebHokkModelVisible, dynamicValueData };
		},
		delDynamicValueData(state) {
			return { ...state, dynamicValueData: {} };
		}
	}
};
