import React from "react";
import { Tree, Input, Select, Icon, InputNumber } from "antd";
import { exportJsonData } from "../../utils/dynamicJson";
import { formaterList, controlTypeList } from "../../utils/DataSourceConfig";
import styles from "./DataSource.less";

const Option = Select.Option;
const { TreeNode, DirectoryTree } = Tree;
let demo = {
	data: {
		id: "test2",
		data: [
			{
				DePartMent: "工管事业部",
				Count: 49,
				Detail: [
					{ name: "刘明", tel: "1303270912", sex: 0, age: 26 },
					{ name: "李三", tel: "1553273913", sex: 1, age: 32 },
					{ name: "王五", tel: "1832470942", sex: 1, age: 28 },
					{ name: "张一", tel: "1503230938", sex: 0, age: 29 }
				]
			},
			{
				DePartMent: "移动事业部",
				Count: 28,
				Detail: [
					{ name: "杜小", tel: "1303240915", sex: 0, age: 24 },
					{ name: "许仙", tel: "1553273913", sex: 1, age: 30 },
					{ name: "李山", tel: "1832470942", sex: 1, age: 25 },
					{ name: "郑二", tel: "1503230938", sex: 0, age: 37 },
					{ name: "尹七", tel: "1883530948", sex: 1, age: 37 }
				]
			},
			{
				DePartMent: "财务事业部",
				Count: 68,
				Detail: [
					{ name: "罗大", tel: "1604540911", sex: 0, age: 25 },
					{ name: "陈细", tel: "1553173917", sex: 1, age: 36 },
					{ name: "苟军", tel: "1858470942", sex: 1, age: 23 },
					{ name: "廖好", tel: "1543210537", sex: 0, age: 27 },
					{ name: "胡生", tel: "1883540648", sex: 1, age: 39 }
				]
			}
		]
	}
};
let treeData = [];
let rule = {};

class ExtractData extends React.Component {
	constructor(props) {
		super(props);
		this.halfKeys = [];
		this.state = {
			nameInput: "",
			ruleInput: "",
			controlTypeSelect: "",
			formatSelect: "",
			formatInput: "",
			descriptionInput: "",
			expandedKeys: ["root"],
			autoExpandParent: true,
			checkedKeys: [],
			selectedKeys: [],
			isoption: false,
			exportDataStr: "",
			primary: this.props.primaryData ? this.props.primaryData : undefined,
			eventName: ""
		};
	}
	initTreeNode(item, parentKey = "") {
		let obj = this.getObj(item);
		let keys = Object.keys(obj);
		let nodeList = [];
		keys.map(item => {
			let node = { key: item, parentstr: `${parentKey}.${item}` };
			let ntype = "值";
			let jstr = obj[item];
			try {
				jstr = JSON.parse(obj[item]);
			} catch (e) { }
			if (jstr instanceof Array) {
				let temp = jstr[0];
				if (temp instanceof Object) {
					ntype = "对象数组";
					node.children = this.initTreeNode(jstr[0], `${parentKey}.${item}`);
				} else {
					ntype = "值数组";
					// node.children = this.initTreeNode(jstr);
				}
			} else if (jstr instanceof Object) {
				ntype = "对象";
				node.children = this.initTreeNode(jstr, `${parentKey}.${item}`);
			}
			node.title = item + " - " + ntype;
			nodeList.push(node);
		});

		return nodeList;
	}
	getObj(item) {
		if (item instanceof Array) return item[0];
		else return item;
	}
	onExpand = expandedKeys => {
		this.setState({
			expandedKeys,
			autoExpandParent: false
		});
		let { checkedKeys, exportDataStr } = this.props.halfCheckKeys;
		this.props.savehalfKeys(checkedKeys, expandedKeys, exportDataStr);
	};
	getSelectTreeNode(treeNode, selectKey, treeNodeList = []) {
		treeNode.map(x => {
			if (selectKey.includes(x.parentstr)) {
				treeNodeList.push({ key: x.key, title: x.title, pkey: x.parentstr });
				if (x.children && x.children instanceof Array) {
					this.getSelectTreeNode(x.children, selectKey, treeNodeList);
				}
			}
		});
		return treeNodeList;
	}
	getTreeNodeToRule(ruleItem, treeNodeList, path = "") {
		if (!ruleItem.children) {
			ruleItem.attr = [];
		}
		treeNodeList.map(x => {
			let p = `${path}${ruleItem.path}.`;
			let key = p + x.key;
			if (x.pkey === key && x.pkey !== x.key) {
				let item = {
					path: x.key,
					attr: []
				};
				let temp = treeNodeList.find(t => {
					return t.pkey.indexOf(key) === 0 && t.pkey.substr(key.length, 1) === ".";
				});
				if (temp) {
					ruleItem.attr.push(item);
					this.getTreeNodeToRule(item, treeNodeList, p);
				} else {
					let { configurationData: configuration } = this.props;
					let txt, formater, formaterValue, controlType, description;
					if (configuration) {
						let configdata = configuration.find(v => {
							return v.key == x.key;
						});
						if (configdata) {
							for (let i in configuration) {
								if (configuration[i].key == x.key) {
									txt = configuration[i].txt;
									formater = configuration[i].formater;
									formaterValue = configuration[i].formaterValue;
									controlType = configuration[i].controlType;
									description = configuration[i].description;
								}
							}
						}
					}
					let attrItem = {
						key: x.key,
						name: x.key,
						parentstr: x.pkey
					};
					if (txt) attrItem.text = txt;
					if (formater) attrItem.formater = formater;
					if (formaterValue) attrItem.formaterValue = formaterValue;
					if (controlType) attrItem.controlType = controlType;
					if (description) attrItem.description = description;
					ruleItem.attr.push(attrItem);
				}
			}
		});
	}
	getSelectTree(halfKeys) {
		let treeNodeList = this.getSelectTreeNode(treeData, halfKeys);
		let item = { path: treeData[0].key };
		this.getTreeNodeToRule(item, treeNodeList);
		item.path = "";
		return item;
	}
	onCheck = (checkedKeys, e) => {
		debugger;
		let { sourceData, configurationData: configuration, propsRule } = this.props;
		let halfKeys = [...checkedKeys, ...e.halfCheckedKeys];
		// this.setState({ expandedKeys: halfKeys });
		this.halfKeys = halfKeys;
		rule = this.getSelectTree(halfKeys);
		let exportData = exportJsonData(sourceData, rule);

		let check = this.ruleConversion(rule.attr);
		this.props.savehalfKeys(check.checkedKeys, check.halfKeys, JSON.stringify(exportData));
		this.setState({ checkedKeys: check.checkedKeys });

		let { eventKey } = e.node.props;
		let name = eventKey.split(".").pop();
		let _configuration = configuration || [];
		if (e.checked) {
			if (configuration && configuration.length > 0) {
				let notExist = check.checkedKeys.filter(x => configuration.every(y => y.key !== x));
				if (notExist.length > 0) {
					notExist.map(item => {
						let params = { key: item, name: item.split(".").pop(), controlType: "SingleText" };
						_configuration.push(params);
					});
				}
			} else {
				check.checkedKeys.map(item => {
					let params = { key: item, name: item.split(".").pop(), controlType: "SingleText" };
					_configuration.push(params);
				});
			}
		} else if (!e.checked) {
			// this.setState({ primary: undefined });
			// this.props.dispatch({ type: "dataSource/delPrimary" });
			_configuration = [];
		} else {
			let params = { key: eventKey, name: name, controlType: "SingleText" };
			if (configuration && configuration.length > 0) {
				let data = configuration.find(v => {
					return v.key === eventKey;
				});
				if (data && !e.checked) {
					_configuration = configuration.filter(item => item.key !== eventKey);
					this.setState({ ruleInput: name, controlTypeSelect: "SingleText", formatSelect: "默认", formatInput: "", descriptionInput: "" });
				} else if (!data && e.checked) {
					_configuration.push(params);
				}
			} else {
				_configuration.push(params);
			}
		}
		if (this.state.primary === eventKey && !e.checked) {
			this.props.dispatch({ type: "dataSource/delPrimary" });
			this.setState({ primary: undefined });
		}

		let _data = [];
		if (configuration && configuration.length > 0) {
			configuration.map(item => {
				if (check.checkedKeys.indexOf(item.key) > -1) _data.push(item);
			});
			_configuration = _data;
		}
		this.props.dispatch({
			type: "dataSource/setConfiguration",
			payload: _configuration
		});
		if (propsRule.rule)
			rule.primaryKey = propsRule.rule.primaryKey;
		this.props.savaRule(rule);
	};

	onSelect = (selectedKeys, info) => {
		let { configurationData: configuration } = this.props;
		let { eventKey, children } = info.node.props;
		let data = configuration.find(v => {
			return v.key === selectedKeys[0];
		});
		let ruleInput = eventKey.split(".").pop();

		if (data) {
			this.setState({
				ruleInput: data.name ? data.name : ruleInput,
				controlTypeSelect: data.controlType ? data.controlType : "SingleText",
				formatSelect: data.formater ? data.formater : "默认",
				formatInput: data.formaterValue ? data.formaterValue : "",
				descriptionInput: data.description ? data.description : ""
			});
			this.props.dispatch({
				type: "dataSource/setConfiguration",
				payload: configuration
			});
		} else {
			this.setState({ ruleInput, controlTypeSelect: "SingleText", formatSelect: "默认", formatInput: "", descriptionInput: "" });
		}
		this.setState({
			selectedKeys,
			nameInput: eventKey,
			isoption: children ? false : true,
			currentPathItem: selectedKeys[0],
			eventName: data ? data.name : ruleInput
		});
	};

	setConfiguration(value, type, add) {
		let { configurationData } = this.props;
		let configdata = undefined;
		let { selectedKeys } = this.state;
		let configuration = configurationData;
		if (value) {
			configdata = configuration.find(v => {
				return v.key === selectedKeys[0];
			});
			if (configdata) {
				for (let i in configuration) {
					if (configuration[i].key === selectedKeys[0]) {
						if (type === "formater" && configuration[i].formaterValue) delete configuration[i].formaterValue;
						configuration[i][type] = value;
					}
				}
			} else {
				configuration.push(add);
			}
			rule = this.getSelectTree(this.halfKeys);
			const { sourceData } = this.props;
			let exportData = exportJsonData(sourceData, rule);
			this.props.savaRule(rule);
		} else {
			for (let i in configuration) {
				if (configuration[i].key === selectedKeys[0]) {
					delete configuration[i][type];
					if (Object.keys(configuration[i]).length === 1) configuration = configuration.filter(item => item.key !== configuration[i].key);
				}
			}
		}
		this.props.dispatch({
			type: "dataSource/setConfiguration",
			payload: configuration
		});
	}
	inputChange(type, text, e) {
		let value = "";
		switch (type) {
			case "name":
				value = e === "" ? this.state.eventName : e.target.value;
				break;
			case "controlType":
				value = e;
				break;
			case "formaterValue":
				value = e && e.target ? e.target.value : e;
				break;
			case "formater":
				{
					value = e;
					this.setState({ formatInput: "" });
				}
				break;
			default:
				value = e.target.value;
				break;
		}
		this.setState({ [text]: value });
		let { selectedKeys } = this.state;
		let add = { key: selectedKeys[0], [type]: value };
		this.setConfiguration(value, type, add);
		let rule = this.props.propsRule.rule;
		if (rule && rule.attr.length > 0) {
			let path = this.state.currentPathItem.split(".").slice(1);
			let item = rule;
			path.forEach((key, index) => {
				let at = index === path.length - 1 ? "key" : "path";
				item = item.attr.find(a => a[at] === key);
			});
			item[type] = value;
			let exportData = exportJsonData(this.props.sourceData, rule);
			this.props.savaRule(rule);
			let { checkedKeys, halfKeys } = this.props.halfCheckKeys;
			let exportDataStr = JSON.stringify(exportData);
			this.props.savehalfKeys(checkedKeys, halfKeys, exportDataStr);
		}
	}
	onChangePrimary = e => {
		this.setState({ primary: e });
		this.props.dispatch({
			type: "dataSource/setPrimary",
			payload: e
		});
		let { configurationData: configuration } = this.props;
		let configdata = configuration.find(v => {
			return v.key === e;
		});
		if (configdata) {
			for (let i in configuration) {
				if (configuration[i].key === e) {
					configuration[i].primary = true;
				} else {
					delete configuration[i].primary;
				}
			}
			this.props.dispatch({
				type: "dataSource/setConfiguration",
				payload: configuration
			});
		}
		let { rule, exportData } = this.props.propsRule;
		let _rule = rule;
		_rule.primaryKey = e;
		this.props.savaRule(_rule);
	};
	ruleConversion(attr, parentKey = "root", checkedKeys = [], halfKeys = ["root"]) {
		if (attr.length > 0) {
			attr.map(item => {
				if (item.path) {
					if (halfKeys.indexOf(item.path) === -1) halfKeys.push(`${parentKey}.${item.path}`);
				} else {
					if (checkedKeys.indexOf(item.key) === -1) checkedKeys.push(`${parentKey}.${item.key}`);
				}
				if (item.attr) {
					this.ruleConversion(item.attr, `${parentKey}.${item.path}`, checkedKeys, halfKeys);
				}
			});
		}
		return { checkedKeys, halfKeys };
	}
	renderTreeNodes = data =>
		data.map(item => {
			if (item.children) {
				return (
					<TreeNode title={item.title} key={item.parentstr} dataRef={item} /*checkable={false}*/>
						{this.renderTreeNodes(item.children)}
					</TreeNode>
				);
			}
			return <TreeNode title={item.title} key={item.parentstr} icon={<Icon type="file" />} />;
		});

	componentDidMount() {
		let { sourceData, modifyData, halfCheckKeys, propsRule } = this.props;
		// let { exportDataStr } = halfCheckKeys;
		let info;
		if (JSON.stringify(modifyData) !== "{}" && modifyData.interfaceMode === 0 && modifyData.sourceType === 0) {
			// info = JSON.parse(modifyData.result);
			debugger;
			info = sourceData;
			if (JSON.stringify(propsRule) !== "{}") {
				rule = propsRule.rule;
				let exportData = exportJsonData(sourceData, rule);
				let check = this.ruleConversion(rule.attr);
				this.props.savehalfKeys(check.checkedKeys, check.halfKeys, JSON.stringify(exportData));
				this.props.savaRule(rule);
				this.setState({ checkedKeys: check.checkedKeys, expandedKeys: check.halfKeys });
			}
		} else {
			let { checkedKeys, expandedKeys } = this.state;
			info = sourceData;
			let _checkedKeys = halfCheckKeys.checkedKeys ? halfCheckKeys.checkedKeys : checkedKeys;
			let _halfKeys = halfCheckKeys.halfKeys ? halfCheckKeys.halfKeys : expandedKeys;
			this.setState({ checkedKeys: _checkedKeys, expandedKeys: _halfKeys });
		}

		let data = [{ id: 1, title: "根", key: "root", parentstr: "root", children: this.initTreeNode(info, "root") }];

		treeData = data;
	}
	render() {
		let { isoption, nameInput, ruleInput, controlTypeSelect, formatInput, formatSelect,
			descriptionInput, primary, checkedKeys, expandedKeys, exportDataStr } = this.state;
		const { sourceData, halfCheckKeys, modifyData } = this.props;
		// let _checkedKeys = halfCheckKeys.checkedKeys ? halfCheckKeys.checkedKeys : this.state.checkedKeys
		return (
			<div className={styles.extract}>
				<div>
					{/* {treeData.length ? ( */}
					<DirectoryTree
						checkable
						onExpand={this.onExpand}
						expandedKeys={expandedKeys}
						autoExpandParent={this.state.autoExpandParent}
						onCheck={this.onCheck}
						checkedKeys={checkedKeys}
						onSelect={this.onSelect}
						showIcon={true}
						style={{ maxHeight: document.body.clientHeight - 520 }}
					>
						{this.renderTreeNodes(treeData)}
					</DirectoryTree>
					{/* ) : (
						"loading tree"
					)} */}
					{isoption ? (
						<div className={styles.option}>
							<span>属性值</span>
							<Input type="text" value={nameInput} disabled title={nameInput} />
							<span>规则键值</span>
							<Input type="text" onChange={this.inputChange.bind(this, "name", "ruleInput")} value={ruleInput} />
							{/* <span>数据格式</span>
                            <Select onChange={this.inputChange.bind(this, 'formater', 'formatSelect')} className={styles.formatSelect} value={formatSelect}>
                                {formaterList.map((item, index) => {
                                    return <Option key={index} value={item.value}>{item.name}</Option>
                                })}
                            </Select> */}
							{formatSelect && formatSelect === 1 ? <InputNumber onChange={this.inputChange.bind(this, "formaterValue", "formatInput")} value={formatInput} /> : null}
							{formatSelect && formatSelect === 2 ? (
								<InputNumber
									onChange={this.inputChange.bind(this, "formaterValue", "formatInput")}
									value={formatInput}
									formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
									parser={value => value.replace(/\$\s?|(,*)/g, "")}
								/>
							) : null}
							{formatSelect && formatSelect === 3 ? (
								<Input
									onChange={this.inputChange.bind(this, "formaterValue", "formatInput")}
									value={formatInput}
									type="data"
									defaultValue="yyyy年MM月dd日"
									style={{ width: "140px" }}
								/>
							) : null}
							{formatSelect && formatSelect === 4 ? (
								<InputNumber
									onChange={this.inputChange.bind(this, "formaterValue", "formatInput")}
									value={formatInput}
									formatter={value => `${value}%`}
									parser={value => value.replace("%", "")}
								/>
							) : null}

							<span>控件类型</span>
							<Select onChange={this.inputChange.bind(this, "controlType", "controlTypeSelect")} className={styles.formatSelect} value={controlTypeSelect}>
								{controlTypeList.map((item, index) => {
									return (
										<Option key={index} value={item.value}>
											{item.name}
										</Option>
									);
								})}
							</Select>
							<span>中文描述</span>
							<Input type="text" onChange={this.inputChange.bind(this, "description", "descriptionInput")} value={descriptionInput} />
						</div>
					) : null}
					<div className={styles.primary}>
						<span>主键：</span>
						<Select onSelect={this.onChangePrimary} value={primary} style={{ width: "50%" }} placeholder="请选择主键">
							{checkedKeys.map((item, index) => {
								return (
									<Option key={index} value={item} title={item}>
										{item}
									</Option>
								);
							})}
						</Select>
					</div>

					<p className={styles.pfrist}>数据抽取预览：</p>
					<div className={`${styles.preview} ${styles.previewFrist}`}>{halfCheckKeys.exportDataStr}</div>

					<p>数据请求预览：</p>
					<div className={styles.preview}>{JSON.stringify(sourceData)}</div>
				</div>
			</div>
		);
	}
}

export default ExtractData;
