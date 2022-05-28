import React from "react";
import { Modal, Form, Select, Input, Switch, Icon, Tag, Button } from "antd";
import { Guid } from "../../utils/com";
import { methodTypeList, requestTypeList } from "../../utils/DataSourceConfig";
import { operatingList } from "../../utils/OperatingConfig";

import styles from "./WebHook.less";

const { Option } = Select;

let id = 0;
let urlID = 0;
let arr = [];
class AddModal extends React.Component {
	constructor(props) {
		super(props);
		this.modifyDataValue = [];
		this.urlkeys = [];
		this.keys = [];
		this.isDelete = false;
		this.collapseArr = [];
		this.isCollapse = false;
		this.returnKey = undefined;
		this.state = {
			isCollapse: false,
			methoneTypeValue: 0,
			requestTypeListData: [],
			testReturnKey: undefined,
			vIndex: null,
			collapse: []
		};
	}
	urlRemove = (k, id) => {
		let { collapse } = this.state;
		this.isDelete = true;
		const { form } = this.props;
		const urlkeys = form.getFieldValue("urlkeys");
		if (urlkeys.length === 0) {
			return;
		}
		form.setFieldsValue({
			urlkeys: urlkeys.filter(key => key !== k)
		});
		arr = arr.filter(v => v.label !== k);
		if (id) {
			this.modifyDataValue = this.modifyDataValue.filter(v => v.id !== id);
		}
		collapse = collapse.filter(v => v !== k);
		this.setState({ collapse });
	};

	urlAdd = () => {
		let { collapse } = this.state;
		const { form, modifyData } = this.props;
		const urlkeys = form.getFieldValue("urlkeys");
		const nextKeys = urlkeys.concat(urlID++);
		form.setFieldsValue({
			urlkeys: nextKeys
		});
		let d = JSON.stringify(modifyData) === "{}";
		arr.push({ label: d ? urlID - 1 : urlID, value: [] });
		if (d) {
			let uid = urlID - 1;
			collapse.push(uid);
		} else collapse.push(urlID);
		this.setState({ collapse });
	};
	remove = (k, id, paramsid) => {
		let keys = [];
		arr.forEach(item => {
			if (item.label === id) {
				keys = item.value;
				item.value = item.value.filter(key => key !== k);
				if (item.app) {
					item.app.forEach(item => {
						if (item.id === paramsid) item.remove = true;
					});
				}
			}
		});
		const { form } = this.props;
		if (keys.length === 0) {
			return;
		}
		form.setFieldsValue({
			keys: keys.filter(key => key !== k)
		});
		if (paramsid) {
			this.modifyDataValue[id - 1].appSettingActionRequests = this.modifyDataValue[id - 1].appSettingActionRequests.filter(v => v.id !== paramsid);
		}
	};

	add = v => {
		++id;
		let keys = [];
		arr.forEach(item => {
			if (item.label === v) {
				keys = item.value;
				item.value = item.value.concat(id);
			}
		});
		const { form } = this.props;
		const nextKeys = keys.concat(id);
		form.setFieldsValue({
			keys: nextKeys
		});
	};
	backStep = () => {
		this.setState({ current: this.state.current === 3 ? 2 : 1 });
	};
	remarkData(value) {
		this.setState({ remark: value });
	}
	methoneTypeChange = value => {
		const { setFieldsValue, getFieldValue } = this.props.form;
		const keys = getFieldValue("keys");
		keys.forEach(k => {
			let params = { [`requestType-${k}`]: undefined };
			setFieldsValue(params);
		});
		switch (value) {
			case 0:
				{
					let data = requestTypeList.filter(v => v.value !== 0);
					this.setState({ requestTypeListData: data });
				}
				break;
			case 1:
				{
					let data = requestTypeList.filter(v => v.value !== 1);
					this.setState({ requestTypeListData: data });
				}
				break;
		}
	};
	getArrEqual(arr1, arr2) {
		let newArr = arr2.filter(x => arr1.every(y => y.webHookID !== x.id));
		return newArr;
	}
	requestSubmit = (e, v, type) => {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				const { modifyData } = this.props;
				let d = JSON.stringify(modifyData) === "{}";
				let data = {
					id: d ? Guid() : modifyData.id,
					name: values.xname.trim(),
					operationStatus: operatingList.Add
				};
				let webhookArr = [];
				if (!d) {
					if (values.xname !== modifyData.name) data.operationStatus = operatingList.Update;
					else data.operationStatus = this.isDelete ? operatingList.Update : operatingList.Constant;

					let newdata = this.getArrEqual(arr, modifyData.webHookAppActionRequests);
					if (newdata.length > 0) {
						newdata.forEach(item => {
							item.operationStatus = operatingList.Delete;
							if (item.appSettingActionRequests.length > 0) {
								item.appSettingActionRequests.forEach(appitem => {
									appitem.operationStatus = operatingList.Delete;
								});
							}
							webhookArr.push(item);
						});
					}
				}
				if (arr.length > 0) {
					arr.forEach((item, i) => {
						let name = values[`name-${item.label}`];
						let url = values[`url-${item.label}`];
						let methodType = values[`methodType-${item.label}`];
						let returnKey = values[`returnKey-${item.label}`];
						if (v && v.label === i && type) {
							this.returnKey = returnKey;
						}
						let webhook = {
							webHookId: data.id,
							name: name.trim(),
							url: url.trim(),
							methodType: methodType,
							sortIndex: i,
							operationStatus: operatingList.Add,
							returnKey: returnKey.trim()
						};
						if (!d) {
							let modifyInfo = modifyData.webHookAppActionRequests.filter(v => v.id === item.webHookID);
							modifyInfo.forEach(v => {
								if (v.name !== name || v.url !== url || v.methodType !== methodType || v.returnKey !== returnKey) {
									webhook.operationStatus = operatingList.Update;
								} else {
									webhook.operationStatus = this.isDelete ? operatingList.Update : operatingList.Constant;
								}
							});
						}
						if (item.webHookID) webhook.id = item.webHookID;
						else webhook.id = Guid();

						let appsettingArr = [];
						if (item.app && item.app.length > 0) {
							item.app.forEach(item => {
								if (item.remove) {
									item.appData.operationStatus = operatingList.Delete;
									appsettingArr.push(item.appData);
								}
							});
						}
						if (item.value.length > 0) {
							item.value.forEach((value, i) => {
								let requestType = values[`requestType-${value}`];
								let valuenum = values[`value-${value}`];
								let key = values[`key-${value}`];
								let appsetting = {
									webHookAppId: webhook.id,
									key: key.trim(),
									value: valuenum.trim(),
									requestType: requestType,
									operationStatus: operatingList.Add,
									sortIndex: i
								};
								if (item.app && item.app.length > 0) {
									item.app.forEach(item => {
										if (item.num === value) {
											let appData = item.appData;
											appsetting.operationStatus = this.isDelete ? operatingList.Update : operatingList.Constant;
											appsetting.id = appData.id;
											if (appData.key !== key || appData.requestType !== requestType || appData.value !== valuenum || appData.returnKey !== returnKey)
												appsetting.operationStatus = operatingList.Update;
										} else appsetting.id = Guid();
									});
								}
								if (item.app && item.app.length > 0) {
									let info = item.app.filter(v => v.num === value);
									if (info.length > 0) appsetting.id = info[0].id;
								} else {
									appsetting.id = Guid();
								}
								appsettingArr.push(appsetting);
							});
						}
						webhook.appSettingActionRequests = appsettingArr;
						webhookArr.push(webhook);
					});
					data.webHookAppActionRequests = webhookArr;
				}
				if (!type) {
					if (d) this.props.newWebHook(data, "add");
					else this.props.newWebHook(data, "modify");
				} else {
					if (v.returnKey) this.returnKey = v.returnKey;
					this.setState({ vIndex: v.label });
					this.interfaceTest(data.webHookAppActionRequests[v.label]);
				}
			}
		});
	};
	interfaceTest(data) {
		let { url, methodType, appSettingActionRequests } = data;
		let _methodType = methodType === 0 ? "get" : "post";
		let paramsBody = {};
		let paramsForm = {};
		let paramsHeader = {};
		appSettingActionRequests.forEach(item => {
			for (let key in item) {
				switch (item.requestType) {
					case 0:
						{
							paramsBody[item.key] = item.value;
						}
						break;
					case 1:
						{
							paramsForm[item.key] = item.value;
						}
						break;
					case 2:
						{
							paramsHeader[item.key] = item.value;
						}
						break;
				}
			}
		});
		this.props.requestData(url, _methodType, paramsBody, paramsForm, paramsHeader);
	}
	cancelDataSource = () => {
		this.props.dispatch({
			type: "webHook/cancelWebHook"
		});
	};
	compare(property) {
		return function(a, b) {
			var value1 = a[property];
			var value2 = b[property];
			return value1 - value2;
		};
	}
	collapseExpansion = value => {
		let info = this.collapseArr.filter(v => v.value === value);
		if (info.length > 0) {
			this.isCollapse = false;
			this.setState({ isCollapse: false });
		} else {
			this.isCollapse = true;
			this.setState({ isCollapse: true });
		}
		if (this.isCollapse) {
			if (this.collapseArr.indexOf(value)) this.collapseArr.push({ collapse: this.isCollapse, value: value });
		} else {
			this.collapseArr = this.collapseArr.filter(v => v.value !== value);
		}
	};
	collapseExpand = index => {
		let { collapse } = this.state;
		if (collapse.indexOf(index) !== -1) {
			collapse = collapse.filter(v => v !== index);
		} else {
			collapse.push(index);
		}
		this.setState({ collapse });
	};
	componentDidMount() {
		let { methoneTypeValue } = this.state;
		const { form } = this.props;
		let modifyData = JSON.stringify(this.props.modifyData) === "{}";
		let { webHookAppActionRequests } = this.props.modifyData;
		if (!modifyData && webHookAppActionRequests.length > 0) {
			this.modifyDataValue = webHookAppActionRequests;
			let collapse = [];
			webHookAppActionRequests.forEach((item, index) => {
				urlID = index;
				collapse.push(index);
				arr.push({ label: index, value: [], app: [], webHookID: item.id, returnKey: item.returnKey });
				this.urlkeys.push(index);
				if (item.appSettingActionRequests.length > 0) {
					let value = [];
					let app = [];
					item.appSettingActionRequests.forEach((item, i) => {
						id = id + 1;
						this.keys.push(id);
						value.push(id);
						arr[index].value = value;
						app.push({ num: id, id: item.id, appData: item });
						arr[index].app = app;
					});
				}
			});
			this.setState({ collapse });
			form.setFieldsValue({
				urlkeys: this.urlkeys,
				keys: this.keys
			});
		}
		if (methoneTypeValue === 0) {
			let data = requestTypeList.filter(v => v.value !== 0);
			this.setState({ requestTypeListData: data });
		}
	}

	// componentDidMount() {
	// 	let modifyData = JSON.stringify(this.props.modifyData) === "{}";
	// 	let { methoneTypeValue } = this.state;
	// 	const { form } = this.props;
	// 	form.setFieldsValue({
	// 		urlkeys: this.urlkeys,
	// 		keys: this.keys
	// 	});
	// 	if (methoneTypeValue === 0) {
	// 		let data = requestTypeList.filter(v => v.value !== 0);
	// 		this.setState({ requestTypeListData: data });
	// 	}
	// 	if (modifyData) this.urlAdd();
	// }
	componentWillReceiveProps(nextProps) {
		let { testReturnKey } = this.state;
		if (JSON.stringify(nextProps.returnKey) !== "{}") {
			let rkey = nextProps.returnKey;
			if (this.returnKey) {
				let r = this.returnKey.split(".");
				r.forEach(v => {
					rkey = rkey[v];
				});
			}
			this.setState({ testReturnKey: rkey });
		}
	}
	componentWillUnmount() {
		arr = [];
		id = 0;
		urlID = 0;
	}
	render() {
		let { isCollapse, requestTypeListData, testReturnKey, vIndex, collapse } = this.state;
		const { addModelVisible, modifyData, confirmLoading } = this.props;
		const { webHookAppActionRequests } = modifyData;
		const { getFieldDecorator, getFieldValue } = this.props.form;
		getFieldDecorator("keys", { initialValue: [] });
		getFieldDecorator("urlkeys", { initialValue: [] });
		const urlFormItems = arr.map((v, vindex) => {
			let isModifyTure = this.modifyDataValue.length > 0 && this.modifyDataValue[vindex];
			let modifyValue = this.modifyDataValue[vindex];
			return (
				<div>
					<Form.Item key={vindex} className={styles.url_main}>
						<div className={styles.urlStyle}>
							<Form.Item className={`${styles.params} ${styles.optionalParams}`}>
								<Form.Item label="URL地址">
									{getFieldDecorator(`url-${v.label}`, {
										rules: [
											{
												required: true,
												message: "请填写正确的URL地址!",
												pattern: /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%$#_]*)?/
											}
										],
										initialValue: isModifyTure ? modifyValue.url : null
									})(<Input placeholder="数据源请求的URL地址" autoComplete="off" style={{ width: "200px" }} title={isModifyTure ? modifyValue.url : null} />)}
								</Form.Item>
								<Form.Item label="请求方式">
									{getFieldDecorator(`methodType-${v.label}`, {
										initialValue: isModifyTure ? modifyValue.methodType : 0
									})(
										<Select style={{ width: "80px" }} /* onChange={this.methoneTypeChange.bind(this)}*/>
											{methodTypeList.map((item, index) => {
												return (
													<Option value={item.value} key={index}>
														{item.name}
													</Option>
												);
											})}
										</Select>
									)}
								</Form.Item>
								<Form.Item label="名称">
									{getFieldDecorator(`name-${v.label}`, {
										rules: [{ required: true, message: "请填写获取token的api名称" }],
										initialValue: isModifyTure ? modifyValue.name : null
									})(<Input placeholder="获取token的api名称" autoComplete="off" style={{ width: "120px" }} />)}
								</Form.Item>
								<Form.Item label="键名">
									{getFieldDecorator(`returnKey-${v.label}`, {
										rules: [{ required: true, message: "请填写键名" }],
										initialValue: isModifyTure ? modifyValue.returnKey : null
									})(<Input placeholder="返回的键名" autoComplete="off" style={{ width: "120px" }} />)}
								</Form.Item>
							</Form.Item>
							{arr.length > 0 ? (
								<span className={styles.del_btn}>
									<Icon onClick={this.collapseExpand.bind(this, v.label)} type={collapse.indexOf(v.label) !== -1 ? "down-circle" : "left-circle"} title="收起" />
									&nbsp;
									<Icon
										className="dynamic-delete-button"
										type="close-circle"
										title="删除"
										onClick={() => {
											this.urlRemove(v.label, modifyValue ? modifyValue.id : null);
										}}
									/>
								</span>
							) : null}
						</div>
						{collapse.indexOf(v.label) !== -1 ? (
							<div className={styles.params_main}>
								<span>
									<b>可选参数列表</b>
									<div
										className={styles.addoptional}
										onClick={() => {
											this.add(v.label);
										}}
									>
										{" "}
										<Icon type="plus" />
										&nbsp;添加
									</div>
								</span>
								{v.value.map((k, index) => {
									let isTrue = isModifyTure && this.modifyDataValue[vindex].appSettingActionRequests[index];
									let appRequests = isTrue ? this.modifyDataValue[vindex].appSettingActionRequests[index] : null;
									let key = isTrue ? appRequests.key : null;
									let requestType = isTrue ? appRequests.requestType : undefined;
									let value = isTrue ? appRequests.value : null;
									return (
										<Form.Item key={k} className={`${styles.params} ${styles.optionalParams}`}>
											<Form.Item style={{ width: "0", height: "0" }}>
												{getFieldDecorator(`id-${k}`)(<Input style={{ width: "0", padding: "0", border: "none" }} placeholder="id" autoComplete="off" />)}
											</Form.Item>
											<Form.Item label="参数名">
												{getFieldDecorator(`key-${k}`, {
													rules: [{ required: true, message: "请填写参数名" }],
													initialValue: key
												})(<Input style={{ width: "180px" }} placeholder="参数名称" autoComplete="off" title={key} />)}
											</Form.Item>
											<Form.Item label="传输类型">
												{getFieldDecorator(`requestType-${k}`, {
													rules: [{ required: true, message: "请选择传输类型" }],
													initialValue: requestType
												})(
													<Select style={{ width: "100px" }} placeholder="传输类型">
														{requestTypeList.map((item, index) => {
															return (
																<Option value={item.value} key={index}>
																	{item.name}
																</Option>
															);
														})}
													</Select>
												)}
											</Form.Item>
											<Form.Item label="参数值">
												{getFieldDecorator(`value-${k}`, {
													initialValue: value
												})(<Input style={{ width: "200px" }} placeholder="参数值" autoComplete="off" title={value} />)}
											</Form.Item>
											{v.value.length > 0 ? (
												<Icon
													className="dynamic-delete-button deleteIcon"
													type="minus-circle-o"
													onClick={() => this.remove(k, v.label, modifyValue && appRequests ? appRequests.id : null)}
												/>
											) : null}
										</Form.Item>
									);
								})}
								<div>
									<Button
										size="small"
										icon="api"
										onClick={e => {
											this.requestSubmit(e, v, "test");
										}}
									>
										测试连接
									</Button>
									{testReturnKey && typeof testReturnKey !== "object" && vIndex === v.label ? (
										<span className={styles.returnKey} title={testReturnKey}>
											返回值：{testReturnKey}
										</span>
									) : null}
								</div>
							</div>
						) : null}
					</Form.Item>
				</div>
			);
		});

		return (
			<Modal
				width={980}
				style={{ top: "50px" }}
				title={`${JSON.stringify(modifyData) !== "{}" ? "修改" : "新增"}第三方系统`}
				visible={addModelVisible}
				onCancel={this.cancelDataSource}
				confirmLoading={confirmLoading}
				maskClosable={false}
				keyboard={false}
				onOk={this.requestSubmit.bind(this)}
			>
				<Form className={styles.form}>
					<Form.Item className={`${styles.params} ${styles.optionalParams}`} style={{ marginBottom: "20px" }}>
						<Form.Item label="系统">
							{getFieldDecorator("xname", {
								rules: [{ required: true, message: "请填写你的第三方系统名称!" }],
								initialValue: modifyData.name
							})(<Input placeholder="第三方系统名称" autoComplete="off" style={{ width: "800px" }} />)}
						</Form.Item>
					</Form.Item>
					{urlFormItems}
					<Form.Item style={{ marginTop: "10px" }}>
						<Button type="primary" onClick={this.urlAdd}>
							<Icon type="plus" />
							添加URL
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}

export default Form.create({})(AddModal);
