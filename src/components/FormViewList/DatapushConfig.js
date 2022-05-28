import { Modal, Button, Form, Select, Input, Checkbox, Row, Col, Icon } from "antd";
import { Guid } from "../../utils/com";
import styles from "./DatapushConfig.less";
const { Option } = Select;
const { TextArea } = Input;

let index = 0;
class DatapushConfig extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
			modifyassignRuleData: [],
			enabledChecked: false,
			formDatTtableHead: this.props.acquisitionConfigData && this.props.formData ? this.props.formData.formVersionHistoryActionRequests.filter(v => v.controlType < 90) : [],
			addFormData: this.props.acquisitionConfigData ? [] : this.props.formData.formVersionHistoryActionRequests.filter(v => v.controlType < 90),
			dataSource: this.props.dataSource
		};
	}
	paramsData(k, values, assignRuleData) {
		let { formsActionRequests, formVersionHistoryActionRequests } = this.props.formData;
		let FormId = values[`FormId-${k}`];
		let SourceName = values[`SourceName-${k}`];
		if (SourceName) {
			let key = SourceName.split(".");
			let formid_code = FormId.split("^");
			let formsAction = formsActionRequests.filter(v => v.id === formid_code[0]);
			let params = {
				key: SourceName,
				SourcePath: key[key.length - 2],
				SourceName: key.pop(),
				TargetName: formid_code[1]
			};
			if (assignRuleData.length > 0) {
				assignRuleData.map(item => {
					if (item.FormId === formid_code[0]) item.Rules.push(params);
				});
			}
			let formPrimaryKey = formVersionHistoryActionRequests.filter(v => v.formId === formsAction[0].id && v.controlType === 100);
			let formForignKey = formVersionHistoryActionRequests.filter(v => v.formId === formsAction[0].id && v.controlType === 101);
			let primaryKey = {
				SourceName: null,
				TargetName: formPrimaryKey[0].code,
				SpecialValue: 1
			};
			let forignKey = {
				SourceName: null,
				TargetName: formForignKey.length > 0 ? formForignKey[0].code : "",
				SpecialValue: 2
			};
			let ad = assignRuleData.filter(v => v.FormId === formid_code[0]);
			if (ad.length === 0) {
				let assignRule = {
					FormId: formid_code[0],
					FormCode: formsAction[0].code,
					Rules: []
				};
				if (formPrimaryKey.length > 0) assignRule.Rules = [primaryKey];
				if (formForignKey.length > 0) {
					assignRule.Rules = [primaryKey];
					assignRule.Rules.push(forignKey);
				}
				assignRule.Rules.push(params);
				assignRuleData.push(assignRule);
			}
		}
		return assignRuleData;
	}
	handleOk = e => {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				const { acquisitionConfigData } = this.props;
				const { formTemplateId, formvVersionId } = this.props.formDatapush;

				let data = {
					id: acquisitionConfigData ? acquisitionConfigData.id : Guid(),
					SourceTypeConfigId: values.SourceTypeConfigId,
					FormTemplateId: formTemplateId,
					FormTemplateVersionId: formvVersionId,
					CornExpression: "0 0 * * *",
					ExpressionDescription: "每天00:00",
					Enabled: this.state.enabledChecked,
					AssignRule: []
				};

				let assignRuleData = [];
				const defaultkeys = this.props.form.getFieldValue("defaultkeys");
				defaultkeys.map(k => {
					assignRuleData = this.paramsData(k, values, assignRuleData);
				});
				const keys = this.props.form.getFieldValue("keys");
				keys.map(k => {
					assignRuleData = this.paramsData(k, values, assignRuleData);
				});
				data.AssignRule = JSON.stringify(assignRuleData);
				if (!acquisitionConfigData) this.props.newSourceAcquisitionConfig(data, "new");
				else this.props.newSourceAcquisitionConfig(data, "modify");
			}
		});
	};
	removeAssociate = k => {
		const { form } = this.props;
		const keys = form.getFieldValue("keys");
		if (keys.length === 0) {
			return;
		}

		form.setFieldsValue({
			keys: keys.filter(key => key !== k)
		});
	};
	setFormData() {
		let { formDatTtableHead } = this.state;
		const { formData } = this.props;
		let data = formData.formVersionHistoryActionRequests.filter(v => v.controlType < 90);
		let arr = [...data].filter(x => [...formDatTtableHead].every(y => y.id !== x.id));
		this.setState({ addFormData: arr });
	}
	removeDefaultAssociate = (k, index) => {
		const { form, formData } = this.props;
		let { formDatTtableHead } = this.state;
		const defaultkeys = form.getFieldValue("defaultkeys");
		if (defaultkeys.length === 1) {
			return;
		}
		form.setFieldsValue({
			defaultkeys: defaultkeys.filter(key => key !== k)
		});
		formDatTtableHead.splice(index, 1);
		this.setFormData();
		this.setState({ formDatTtableHead });
	};
	addAssociate = () => {
		const { form } = this.props;
		const keys = form.getFieldValue("keys");
		const nextKeys = keys.concat(index++);
		form.setFieldsValue({
			keys: nextKeys
		});
		this.setFormData();
	};
	dataSourceOnchange = value => {
		let { dataSource } = this.state;
		let { form, acquisitionConfigData } = this.props;
		let configuration = JSON.parse(dataSource.filter(v => v.id === value)[0].configuration);
		this.setState({ configuration });
		// form.setFieldsValue({
		//     keys: []
		// })
		const keys = form.getFieldValue("keys");
		keys.map(k => {
			form.setFieldsValue({
				[`SourceName-${k}`]: undefined
			});
		});

		if (acquisitionConfigData) {
			if (acquisitionConfigData.sourceTypeConfigId === value) {
				this.setData();
			} else {
				this.setState({ modifyassignRuleData: [] });
			}
		}
	};
	onEnabledChange = e => {
		this.setState({ enabledChecked: e.target.checked });
	};
	setData() {
		let { dataSource, formDatTtableHead } = this.state;
		let { form, acquisitionConfigData, formData } = this.props;
		let modifyassignRuleData = [];
		if (acquisitionConfigData) {
			let data = dataSource.filter(v => v.id === acquisitionConfigData.sourceTypeConfigId);
			this.setState({ configuration: JSON.parse(data[0].configuration) });
			let assignRule = JSON.parse(acquisitionConfigData.assignRule);
			let nextKeys = [];
			assignRule.map(x => {
				x.Rules.map(v => {
					if (v.SourceName !== null) {
						nextKeys.push(index++);
						v.code = v.TargetName;
						v.TargetName = `${x.FormId}^${v.TargetName}`;
						modifyassignRuleData.push(v);
					}
				});
			});
			form.setFieldsValue({ defaultkeys: nextKeys });
			this.setState({ modifyassignRuleData });
		}
		if (formData) {
			// let nextKeys = [];
			// data.map(item => {
			// 	if (item.title !== "Root" && item.isData) {
			// 		formDatTtableHead.push(item);
			// 	}
			// });
			if (acquisitionConfigData) {
				formDatTtableHead = [...formDatTtableHead].filter(x => [...modifyassignRuleData].some(y => y.code === x.code));
			}
			// formDatTtableHead.map(item => {
			// 	nextKeys.push(index++);
			// 	form.setFieldsValue({ defaultkeys: nextKeys });
			// });

			this.setState({ formDatTtableHead });
		}
	}
	componentDidMount() {
		let { acquisitionConfigData } = this.props;
		this.setData();
		this.setState({ enabledChecked: acquisitionConfigData.enabled });
	}
	componentWillUnmount() {
		index = 0;
	}
	render() {
		const { formvVersionId } = this.props.formDatapush;
		let { modifyassignRuleData, configuration, enabledChecked, formDatTtableHead, addFormData, dataSource } = this.state;
		const { getFieldDecorator, getFieldValue } = this.props.form;
		const { cancelDatapushModal, isDatapushVisible, formData, acquisitionConfigData, confirmLoading } = this.props;
		let sourceTypeConfigId = acquisitionConfigData ? acquisitionConfigData.sourceTypeConfigId : undefined;
		getFieldDecorator("keys", { initialValue: [] });
		getFieldDecorator("defaultkeys", { initialValue: [] });
		const keys = getFieldValue("keys");
		const defaultkeys = getFieldValue("defaultkeys");
		const formItems = keys.map((k, index) => (
			<Row gutter={16} key={index}>
				<Col span={10}>
					<Form.Item>
						{getFieldDecorator(`FormId-${k}`, {
							rules: [{ required: true, message: "请选择表单字段" }]
						})(
							<Select placeholder="选择表单字段">
								{addFormData.length > 0
									? addFormData.map((item, index) => {
											return (
												<Option value={`${item.formId}^${item.code}`} key={index} title={item.title}>
													{item.name}
												</Option>
											);
									  })
									: null}
							</Select>
						)}
					</Form.Item>
				</Col>
				<Col span={2}>
					<span>对应</span>
				</Col>
				<Col span={10}>
					<Form.Item>
						{getFieldDecorator(`SourceName-${k}`, {
							rules: [{ required: false, message: "请选择数据源字段!" }]
						})(
							<Select placeholder="选择数据源字段">
								{configuration
									? configuration.map((item, index) => {
											return (
												<Option value={item.key} key={index} title={item.key}>
													{item.key}
												</Option>
											);
									  })
									: null}
							</Select>
						)}
					</Form.Item>
				</Col>
				<Col span={2}>{keys.length > 0 ? <Icon className="dynamic-delete-button" type="minus-circle-o" onClick={() => this.removeAssociate(k)} /> : null}</Col>
			</Row>
		));
		return (
			<div>
				<Modal title="数据生成" visible={isDatapushVisible} onOk={this.handleOk} confirmLoading={confirmLoading} onCancel={cancelDatapushModal} width={600}>
					<Form className={styles.dataform}>
						<Form.Item label="选择数据源">
							{getFieldDecorator("SourceTypeConfigId", {
								rules: [{ required: true, message: "请选择数据源" }],
								initialValue: sourceTypeConfigId
							})(
								<Select onSelect={this.dataSourceOnchange.bind(this)} placeholder="选择数据源">
									{dataSource.map((item, index) => {
										return (
											<Option value={item.id} key={index}>
												{item.name}
											</Option>
										);
									})}
								</Select>
							)}
						</Form.Item>
						<div className={styles.associate}>
							<Form.Item label="对应设置">
								{defaultkeys.length > 0
									? defaultkeys.map((k, index) => {
											return (
												<Row gutter={16} key={index}>
													<Col span={10}>
														<Form.Item>
															{getFieldDecorator(`FormId-${k}`, {
																rules: [{ required: true, message: "请选择表单字段" }],
																initialValue:
																	formDatTtableHead.length > 0 && formDatTtableHead[index]
																		? `${formDatTtableHead[index].formId}^${formDatTtableHead[index].code}`
																		: undefined
															})(
																<Select placeholder="选择表单字段">
																	{formDatTtableHead.map((item, index) => {
																		return (
																			<Option value={`${item.formId}^${item.code}`} key={index} title={item.name}>
																				{item.name}
																			</Option>
																		);
																	})}
																</Select>
															)}
														</Form.Item>
													</Col>
													<Col span={2}>
														<span>对应</span>
													</Col>
													<Col span={10}>
														<Form.Item>
															{getFieldDecorator(`SourceName-${k}`, {
																rules: [{ required: false, message: "请选择数据源字段!" }],
																initialValue:
																	modifyassignRuleData.length > 0 && modifyassignRuleData[index] ? modifyassignRuleData[index].key : undefined
															})(
																<Select placeholder="选择数据源字段">
																	{configuration
																		? configuration.map((item, index) => {
																				return (
																					<Option value={item.key} key={index} title={item.key}>
																						{item.key}
																					</Option>
																				);
																		  })
																		: null}
																</Select>
															)}
														</Form.Item>
													</Col>
													<Col span={2}>
														{defaultkeys.length > 1 ? (
															<Icon className="dynamic-delete-button" type="minus-circle-o" onClick={() => this.removeDefaultAssociate(k, index)} />
														) : null}
													</Col>
												</Row>
											);
									  })
									: null}
								{formItems}
							</Form.Item>
							<div className={styles.addoptional} onClick={this.addAssociate}>
								<Icon type="plus" />
								&nbsp;添加
							</div>
						</div>
						<Form.Item style={{ marginTop: "5px" }}>
							{getFieldDecorator("Enabled")(
								<Checkbox checked={enabledChecked} onChange={this.onEnabledChange.bind(this)}>
									是否启用定时生成(每天00:00)
								</Checkbox>
							)}
						</Form.Item>
						<Form.Item style={{ marginTop: "5px" }}>
							<Button
								type="primary"
								onClick={() => {
									this.props.sourceAcquisitionConfigTrigger(formvVersionId);
								}}
							>
								立即执行
							</Button>
						</Form.Item>

						{/* {enabledChecked ?
                            <div>
                                <Form.Item label="定时任务表达式">
                                    {getFieldDecorator('CornExpression', {
                                        initialValue: '0 0 * * *'
                                    })(
                                        <Select disabled>
                                            <Option value="0 0 * * *">每天0点</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            </div>
                            : null} */}
					</Form>
				</Modal>
			</div>
		);
	}
}
export default Form.create({})(DatapushConfig);
