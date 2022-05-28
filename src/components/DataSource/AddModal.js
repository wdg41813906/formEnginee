import React from "react";
import { Modal, Form, Select, Input, Switch, Icon, Tag, Button } from "antd";
import { Guid } from "../../utils/com";
import { sourceTypeList, methodTypeList, requestTypeList, parameterTypeList, interfaceModeList } from "../../utils/DataSourceConfig";
import ExtractData from "./ExtractData";
import DataSourcePreview from "./DataSourcePreview";
import WebHookModel from "./WebHookModel";
import { operatingList } from "../../utils/OperatingConfig";
import styles from "./DataSource.less";

const { Option } = Select;

let id = 0;
let parameterType_Data = [];

class AddModal extends React.Component {
	constructor(props) {
		super(props);
		this.requestValue = {};
		this.seleteParameterType = null;
		this.savaSourceParameter = this.props.modifyData.sourceParameterActionRequests;
		this.isDelete = false;
		this.pushData = [];
		this.state = {
			confirmLoading: false,
			current: 1,
			sourceData: [],
			newData: {},
			remark: "",
			loading: false,
			params: this.props.modifyData.sourceParameterActionRequests,
			requestParams: [],
			methoneTypeValue: 0,
			url: JSON.stringify(this.props.modifyData) !== "{}" ? this.props.modifyData.url : "",
			parameterTypeData: [],
			selectWebhookUrl: {},
			requestTypeListData: [],
			interfaceModeValue: 0,
			sourceTypeValue: 0,
		};
	}

	remove = (k, id) => {
		this.isDelete = true;
		this.props.dispatch({
			type: "dataSource/delDynamicValueData",
		});
		let { params } = this.state;
		let data = [];
		for (let key in params) {
			if (params[key].id !== id) {
				let info = params[key];
				data.push(info);
			}
		}
		if (this.savaSourceParameter && this.savaSourceParameter.length > 0) {
			let sourceParameter = [];
			this.savaSourceParameter.map((item) => {
				let info = item;
				if (item.id === id) info.operationStatus = operatingList.Delete;
				sourceParameter.push(info);
			});
			this.savaSourceParameter = sourceParameter;
		}

		this.setState({ params: data });
		const { form } = this.props;
		const keys = form.getFieldValue("keys");
		if (keys.length === 0) {
			return;
		}
		form.setFieldsValue({
			keys: keys.filter((key) => key !== k),
		});
		parameterType_Data = parameterType_Data.filter((v) => v.key !== k);
		this.setState({ parameterTypeData: parameterType_Data });
	};

	add = () => {
		this.props.dispatch({
			type: "dataSource/delDynamicValueData",
		});
		const { form } = this.props;
		const keys = form.getFieldValue("keys");
		const nextKeys = keys.concat(id++);
		form.setFieldsValue({
			keys: nextKeys,
		});
	};
	backStep = () => {
		this.setState({ current: this.state.current === 3 ? 2 : 1 });
	};
	remarkData(value) {
		this.setState({ remark: value });
	}
	methoneTypeChange = (value) => {
		const { setFieldsValue, getFieldValue } = this.props.form;
		const keys = getFieldValue("keys");
		keys.map((k) => {
			let params = { [`requestType-${k}`]: undefined };
			setFieldsValue(params);
		});
		switch (value) {
			case 0:
				{
					let data = requestTypeList.filter((v) => v.value !== 0);
					this.setState({ requestTypeListData: data });
				}
				break;
			case 1:
				{
					let data = requestTypeList.filter((v) => v.value !== 1);
					this.setState({ requestTypeListData: data });
				}
				break;
		}
	};

	parameterTypeSelect = (k, value) => {
		this.seleteParameterType = k;
		if (value === 2) {
			this.props.dispatch({
				type: "dataSource/webHookSelect",
			});
		} else {
			this.props.dispatch({
				type: "dataSource/delDynamicValueData",
			});
			parameterType_Data = parameterType_Data.filter((v) => v.key !== k);
			this.setState({ parameterTypeData: parameterType_Data });
		}
	};
	interfaceModeChange = (value) => {
		this.setState({ interfaceModeValue: value });
	};
	sourceTypeChange = (value) => {
		this.setState({ sourceTypeValue: value });
	};
	selectReturnKey = (params) => {
		this.setState({ selectWebhookUrl: params });
	};
	stepOne(values) {
		this.requestValue = values;
		let params = [];

		let { modifyData } = this.props;
		let paramsData = [];
		if (JSON.stringify(modifyData) !== "{}") {
			if (this.savaSourceParameter.length > 0) {
				this.savaSourceParameter.map((item) => {
					paramsData.push(item);
				});
			}
		}
		const keys = this.props.form.getFieldValue("keys");
		keys.map((k, index) => {
			if (values[`pname-${k}`]) {
				let info = {
					name: values[`pname-${k}`],
					requestType: values[`requestType-${k}`],
					parameterType: values[`parameterType-${k}`],
					value: values[`value-${k}`],
					webHoookProperty: values[`webHoookProperty-${k}`],
					valueControlProperty: "",
					// sortIndex: index,
					operationStatus: operatingList.Add,
				};
				if (JSON.stringify(modifyData) !== "{}") {
					let data = paramsData.filter((v) => v.id === values[`id-${k}`]);
					if (data.length > 0) {
						if (
							data[0].name !== values[`pname-${k}`] ||
							data[0].requestType !== values[`requestType-${k}`] ||
							data[0].parameterType !== values[`parameterType-${k}`] ||
							data[0].value !== values[`value-${k}`]
						) {
							paramsData.map((item) => {
								if (item.id === values[`id-${k}`]) {
									item.name = values[`pname-${k}`];
									item.requestType = values[`requestType-${k}`];
									item.parameterType = values[`parameterType-${k}`];
									item.value = values[`value-${k}`];
									item.operationStatus = operatingList.Update;
								}
							});
						}
					} else {
						info.id = values[`id-${k}`];
						if (values[`id-${k}`] === null || !values[`id-${k}`]) {
							info.id = Guid();
							info.operationStatus = operatingList.Add;
							info.sourceTypeConfigId = modifyData.id;
							paramsData.push(info);
							this.savaSourceParameter = paramsData;
						}
					}
				}
				params.push(info);
			}
		});
		let _data = JSON.stringify(modifyData) !== "{}" ? paramsData : params;
		this.setState({ requestParams: _data });
		this.pushData = _data;

		return _data;
	}

	nextStep = (e, params, type) => {
		let { stepCurrent } = this.props;
		switch (stepCurrent) {
			case 1:
				{
					this.interfaceTest(e, params, type, "add");
				}
				break;
			case 2:
				{
					let { propsRule, primaryData } = this.props;
					let { rule } = propsRule;
					if (JSON.stringify(propsRule) === "{}" || rule === null || (rule && rule.attr && rule.attr.length === 0)) {
						Modal.warning({
							okText: "确认",
							title: "提示",
							content: "请至少勾选一个字段生成抽取规则！",
						});
					} else if (!primaryData) {
						Modal.warning({
							okText: "确认",
							title: "提示",
							content: "请选择主键！",
						});
					} else {
						this.props.stepNext();
					}
				}
				break;
			case 3:
				{
					// this.interfaceTest()
				}
				break;
		}
	};
	interfaceTest(e, params, type, opt) {
		e.preventDefault();
		this.setState({ loading: true });
		let { interfaceModeValue } = this.state;
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				let _data = this.stepOne(values);
				let methodType = values.methodType === 0 ? "get" : "post";
				let paramsBody = {};
				let paramsForm = {};
				let paramsHeader = {};
				_data.map((item) => {
					for (let key in item) {
						switch (item.requestType) {
							case 0:
								{
									paramsBody[item.name] = item.value;
								}
								break;
							case 1:
								{
									paramsForm[item.name] = item.value;
								}
								break;
							case 2:
								{
									paramsHeader[item.name] = item.value;
								}
								break;
						}
					}
				});
				this.props.requestData(values.url, methodType, paramsBody, paramsForm, paramsHeader, interfaceModeValue, params, type);
				if (opt) {
					this.setState({ url: values.url });
					if (this.state.url !== values.url) {
						this.props.dispatch({
							type: "dataSource/delHalfCheckKeys",
						});
					}
				}
			}
		});
	}
	submit(subData) {
		let { modifyData } = this.props;
		const { exportDataStr } = this.props.halfCheckKeys;
		let { interfaceModeValue } = this.state;
		if (interfaceModeValue === 0) {
			let exportData = JSON.stringify(JSON.parse(exportDataStr)[0]);
			subData.exportData = exportData;
		}
		if (JSON.stringify(modifyData) !== "{}") {
			subData.id = modifyData.id;
			subData.publishStatus = modifyData.publishStatus;
			this.props.newDataSource(subData, "modify");
		} else this.props.newDataSource(subData, "add");
	}
	requestSubmit = (e) => {
		e.preventDefault();
		let { modifyData, propsRule } = this.props;
		let { interfaceModeValue } = this.state;
		let subData = {};
		if (interfaceModeValue !== 0) {
			this.props.form.validateFieldsAndScroll((err, values) => {
				if (!err) {
					this.stepOne(values);
					let data = {
						name: values.name,
						sourceType: values.sourceType,
						url: values.url.trim(),
						methodType: values.methodType,
						interfaceMode: values.interfaceMode,
						sourceParameterActionRequests: this.pushData,
					};
					if (interfaceModeValue === 2) {
						let isData = JSON.stringify(modifyData) !== "{}";
						let type = isData ? "modify" : "add";
						if (isData) {
							data.id = modifyData.id;
							data.publishStatus = modifyData.publishStatus;
						}
						this.nextStep(e, data, type);
					} else {
						subData = data;
						this.submit(subData);
					}
				}
			});
		} else {
			let { name, sourceType, url, methodType, interfaceMode } = this.requestValue;
			let { remark, requestParams } = this.state;
			let _remark = "";
			if (!remark && JSON.stringify(modifyData) !== "{}") _remark = modifyData.remark;
			else _remark = remark;

			let data = {
				name: name,
				sourceType: sourceType,
				url: url.trim(),
				methodType: methodType,
				interfaceMode: interfaceMode,
				// result: JSON.stringify(sourceData),
				remark: _remark,
				// exportData,
				rule: JSON.stringify(propsRule.rule),
				configuration: JSON.stringify(this.props.configurationData),
				sourceParameterActionRequests: requestParams,
			};
			subData = data;
			this.submit(subData);
		}
	};
	componentWillReceiveProps(nextProps) {
		if (JSON.stringify(nextProps.dynamicValueData) !== "{}") {
			let newdata = {
				key: this.seleteParameterType,
				dynamicValueData: nextProps.dynamicValueData,
				selectWebhookUrl: this.state.selectWebhookUrl,
			};
			let data = parameterType_Data.filter((v) => v.key === this.seleteParameterType);
			if (data.length === 0) parameterType_Data.push(newdata);
			if (parameterType_Data.length > 0) {
				parameterType_Data.map((item) => {
					if (item.key === this.seleteParameterType) {
						if (item.dynamicValueData === nextProps.dynamicValueData) return;
						else {
							item.selectWebhookUrl = this.state.selectWebhookUrl;
							item.dynamicValueData = nextProps.dynamicValueData;
						}
					}
				});
			} else parameterType_Data.push(data);

			this.setState({ parameterTypeData: parameterType_Data });
		}
	}
	setModifyData() {
		let { methoneTypeValue } = this.state;
		let { webHookData, modifyData } = this.props;
		let { sourceParameterActionRequests, interfaceMode, sourceType, methodType } = modifyData;
		if (sourceParameterActionRequests && sourceParameterActionRequests.length > 0) {
			sourceParameterActionRequests.map((item, index) => {
				if (item.webHoookProperty !== null) {
					let webhookinfo = item.webHoookProperty.split("+");
					if (webHookData.length > 0) {
						let params = { key: index, selectWebhookUrl: {} };
						let webHook = webHookData.find((v) => v.id === webhookinfo[0]);
						if (webHook) {
							params.selectWebhookUrl.webHookName = webHook.name;
							if (webHook.webHookAppViewResponses.length > 0) {
								let webHookApp = webHook.webHookAppViewResponses.find((v) => v.id === webhookinfo[1]);
								if (webHookApp) {
									params.selectWebhookUrl.name = webHookApp.name;
									params.selectWebhookUrl.url = webHookApp.url;
									params.selectWebhookUrl.webHookId = webhookinfo[0];
									params.selectWebhookUrl.id = webhookinfo[1];
								}
							}
						}
						parameterType_Data.push(params);
					}
				}
				this.add();
			});
			this.setState({ parameterTypeData: parameterType_Data });
		}
		if (methoneTypeValue === 0) {
			let data = requestTypeList.filter((v) => v.value !== 0);
			this.setState({ requestTypeListData: data });
		}
		this.setState({ interfaceModeValue: interfaceMode, sourceTypeValue: sourceType });
		switch (methodType) {
			case 0:
				{
					let data = requestTypeList.filter((v) => v.value !== 0);
					this.setState({ requestTypeListData: data });
				}
				break;
			case 1:
				{
					let data = requestTypeList.filter((v) => v.value !== 1);
					this.setState({ requestTypeListData: data });
				}
				break;
		}
	}
	componentDidMount() {
		let { modifyData } = this.props;
		if (JSON.stringify(modifyData) !== "{}") this.setModifyData();
		else {
			let data = requestTypeList.filter((v) => v.value !== 0);
			this.setState({ requestTypeListData: data });
		}
	}
	componentWillUnmount() {
		parameterType_Data = [];
		id = 0;
	}
	render() {
		const { confirmLoading, params, parameterTypeData, requestTypeListData, interfaceModeValue, sourceTypeValue } = this.state;
		const {
			visible,
			cancelDataSource,
			stepCurrent,
			sourceData,
			loading,
			previewRule,
			primaryData,
			modifyData,
			propsRule,
			dispatch,
			configurationData,
			isSelectWebHokkModelVisible,
			webHookData,
			isWebHokkModelconfirmLoading,
			previewData,
		} = this.props;
		const { getFieldDecorator, getFieldValue } = this.props.form;
		let { sourceType, name, url, methodType, interfaceMode } = this.requestValue;
		let _sourceType = sourceType === 0 ? sourceType : modifyData.sourceType ? modifyData.sourceType : 0;
		let _interfaceMode = interfaceMode === 0 ? interfaceMode : modifyData.interfaceMode ? modifyData.interfaceMode : 0;
		let _name = name || modifyData.name || "";
		let _url = url || modifyData.url || "http://api.sysdsoft.cn/api/test/DRTestData2";
		let _method = methodType || modifyData.methodType || 0;
		getFieldDecorator("keys", { initialValue: [] });

		const keys = getFieldValue("keys");
		const formItems = keys.map((k, index) => {
			let info = parameterTypeData.find((v) => v.key === k);
			let rkey = undefined;
			if (info) {
				rkey = info.dynamicValueData;
				let { returnKey } = info.selectWebhookUrl;
				if (returnKey) {
					let r = returnKey.split(".");
					r.map((v) => {
						rkey = rkey[v];
					});
				}
			}
			let isTrue = params && params[index];
			let id = this.requestValue[`id-${index}`] || (isTrue && params[index].id) || null;
			let requestValue = this.requestValue[`pname-${k}`] || (isTrue && params[index].name) || null;
			let parameterType = this.requestValue[`parameterType-${k}`] || (isTrue && params[index].parameterType);
			let requestType = this.requestValue[`requestType-${k}`] || (isTrue && params[index].requestType);
			let value = info && info.dynamicValueData ? rkey : this.requestValue[`value-${k}`] ? this.requestValue[`value-${k}`] : isTrue ? params[index].value : null;
			return (
				<Form.Item className={`${styles.params} ${styles.optionalParams}`} key={index} style={{ paddingBottom: 0 }}>
					<Form.Item style={{ width: "0" }}>
						{getFieldDecorator(`id-${k}`, {
							initialValue: id,
						})(<Input style={{ width: "0", padding: "0", border: "none" }} placeholder="id" autoComplete="off" />)}
					</Form.Item>
					<Form.Item label="参数名">
						{getFieldDecorator(`pname-${k}`, {
							rules: [{ required: true, message: "请填写参数名" }],
							initialValue: requestValue,
						})(<Input style={{ width: "130px" }} placeholder="参数名称" autoComplete="off" />)}
					</Form.Item>
					<Form.Item label="传输类型">
						{getFieldDecorator(`requestType-${k}`, {
							rules: [{ required: true, message: "请选择传输类型" }],
							initialValue: requestType,
						})(
							<Select style={{ width: "100px" }} placeholder="传输类型">
								{requestTypeListData.map((item, index) => {
									return (
										<Option value={item.value} key={index}>
											{item.name}
										</Option>
									);
								})}
							</Select>
						)}
					</Form.Item>
					<Form.Item label="参数类型">
						{getFieldDecorator(`parameterType-${k}`, {
							initialValue: parameterType,
						})(
							<Select style={{ width: "120px" }} onSelect={this.parameterTypeSelect.bind(this, k)} placeholder="参数类型">
								{parameterTypeList.map((item, index) => {
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
							// rules: [{ required: true, message: '请填写参数值!' }],
							initialValue: value,
						})(<Input placeholder="参数取值" style={{ width: "130px" }} autoComplete="off" title={value} />)}
					</Form.Item>
					<Form.Item style={{ width: "0" }}>
						{getFieldDecorator(`webHoookProperty-${k}`, {
							initialValue: info ? `${info.selectWebhookUrl.webHookId}+${info.selectWebhookUrl.id}` : null,
						})(<Input style={{ width: "0", padding: "0", border: "none" }} placeholder="id" autoComplete="off" />)}
					</Form.Item>
					{keys.length > 0 ? (
						<Icon
							className="dynamic-delete-button deleteIcon"
							type="minus-circle-o"
							onClick={() => this.remove(k, params && params[index] ? params[index].id : null)}
						/>
					) : null}
					{info ? (
						<div className={styles.webhookSelect}>
							系统名称：{info.selectWebhookUrl.webHookName} &nbsp;&nbsp;&nbsp; 接口名称：{info.selectWebhookUrl.name} &nbsp;&nbsp;&nbsp; URL地址：
							{info.selectWebhookUrl.url}
						</div>
					) : null}
				</Form.Item>
			);
		});
		let arr = [
			<Button key="back" onClick={this.props.backStep}>
				上一步
			</Button>,
			<Button
				key="next"
				type={stepCurrent === 3 ? "primary" : undefined}
				onClick={stepCurrent === 3 || interfaceModeValue !== 0 ? this.requestSubmit : this.nextStep}
				loading={loading}
			>
				{stepCurrent === 3 || interfaceModeValue !== 0 ? "完成" : "下一步"}
			</Button>,
		];
		let arrinfo = arr;
		if (interfaceModeValue !== 0) {
			arrinfo = arrinfo[1];
		} else {
			if (stepCurrent === 1) arrinfo = arrinfo[1];
			if (stepCurrent === 2) arrinfo = arr;
			if (stepCurrent === 3) arrinfo = [arr[0], arr[1]];
		}
		return (
			<Modal
				width={900}
				style={{ top: "50px" }}
				title={previewData ? "浏览API配置" : JSON.stringify(modifyData) !== "{}" ? "修改API配置" : "新增API配置"}
				visible={visible}
				onCancel={cancelDataSource}
				confirmLoading={confirmLoading}
				footer={previewData ? false : arrinfo}
				maskClosable={false}
				keyboard={false}
			>
				{stepCurrent === 1 ? (
					<Form layout="vertical" className={styles.form}>
						<Form.Item label="名称">
							{getFieldDecorator("name", {
								initialValue: _name,
								rules: [{ required: true, message: "请填写你的名称!" }],
							})(<Input placeholder="API名称" autoComplete="off" />)}
						</Form.Item>
						{/* <Form.Item label="类型">
                            {getFieldDecorator('sourceType', {
                                initialValue: _sourceType
                            })(
                                <Select style={{ width: '100%' }} onSelect={this.sourceTypeChange.bind(this)}>
                                    {sourceTypeList.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.name}</Option>
                                    })}
                                </Select>
                            )}
                        </Form.Item> */}
						<Form.Item label="URL地址">
							{getFieldDecorator("url", {
								initialValue: _url,
								rules: [
									{
										required: true,
										message: "请填写正确的URL地址!",
										pattern: /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%$#_]*)?/,
									},
								],
							})(<Input placeholder="API请求的URL地址" />)}
						</Form.Item>
						<Form.Item label="请求方式">
							{getFieldDecorator("methodType", {
								initialValue: _method,
							})(
								<Select style={{ width: "100%" }} onChange={this.methoneTypeChange.bind(this)}>
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
						<Form.Item label="API类型">
							{getFieldDecorator("interfaceMode", {
								initialValue: _interfaceMode,
							})(
								<Select style={{ width: "100%" }} onSelect={this.interfaceModeChange.bind(this)}>
									{interfaceModeList.map((item, index) => {
										return (
											<Option value={item.value} key={index}>
												{item.name}
											</Option>
										);
									})}
								</Select>
							)}
						</Form.Item>
						<span>
							<b>可选参数列表</b>
							<div className={styles.addoptional} onClick={this.add}>
								{" "}
								<Icon type="plus" />
								&nbsp;添加
							</div>
						</span>
						{formItems}
					</Form>
				) : null}
				{stepCurrent === 2 ? (
					<ExtractData
						dispatch={dispatch}
						primaryData={primaryData}
						configurationData={configurationData}
						modifyData={modifyData}
						sourceData={sourceData}
						savehalfKeys={this.props.savehalfKeys}
						halfCheckKeys={this.props.halfCheckKeys}
						savaRule={this.props.savaRule}
						propsRule={this.props.propsRule}
					/>
				) : null}
				{stepCurrent === 3 ? (
					<DataSourcePreview
						remark={modifyData.remark}
						rule={propsRule.rule}
						sourceData={sourceData}
						remarkData={this.remarkData.bind(this)}
						requestData={this.props.requestData}
						previewData={previewData}
					/>
				) : null}

				{isSelectWebHokkModelVisible ? (
					<WebHookModel
						dispatch={dispatch}
						webHookData={webHookData}
						isWebHokkModelconfirmLoading={isWebHokkModelconfirmLoading}
						selectReturnKey={this.selectReturnKey.bind(this)}
						isSelectWebHokkModelVisible={isSelectWebHokkModelVisible}
					/>
				) : null}
			</Modal>
		);
	}
}

export default Form.create({})(AddModal);
