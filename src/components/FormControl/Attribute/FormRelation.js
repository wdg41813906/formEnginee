import React from "react";
import { Button, Modal, Card, Switch, Tree, Icon, Select, Tag } from "antd";
import { Guid } from "../../../utils/com";
import Attribute from "./Attribute.js";
import styles from "./FormRelation.less";
import FORM_STATUS from "../../../enums/FormStatus";
import componentsList from "../../../plugins/businessComponents/componentsList.js";

const cardStyle = { marginTop: "10px" };
const checkStyle = { color: "#40a9ff" };
const empty = {};
const { TreeNode } = Tree;
const { Option } = Select;

@Attribute("表单关系")
class FormRelation extends React.Component {
    constructor(props) {
        super(props);
        this.pId = [];
        this.state = {
            showModal: false,
            dataMain: [],
            expandedKeys: [],
            selectedKeys: [],
            optionalData: [],
            selectValue: []
        };
    }

    showModal = () => {
        this.props.buildFormDataFilter("tableRelation");
        this.setState({ showModal: true });
    };
    hideModal = () => {
        this.setState({ showModal: false });
    };

    getChildrenList(list, dt) {
        if (dt && dt.children) {
            let childrenList = [];
            dt.children.forEach(x => {
                childrenList.push(x.id);
                this.getChildrenList(list, x);
            });
            list[dt.id] = childrenList;
        }
    }

    buildDataTree = (list, id = null) => {
        list.forEach(a => {
            if (a.children) {
                a.children.forEach(b => {
                    b.pid = a.formId;
                    if (b.children) {
                        this.buildDataTree(b.children, b.formId);
                    }
                });
            } else {
                a.pid = id;
            }
        });
        return list;
    };


    save = () => {
        let { dataMain } = this.state;
        let resList = {};
        this.props.buildSaveData(this.buildDataTree(dataMain));
        console.log(JSON.stringify(dataMain));
        this.getChildrenList(resList, dataMain[0]);
        this.props.onChange(resList);
        this.setState({ showModal: false });

    };
    onSelect = selectedKeys => {
        let keys = selectedKeys.length > 0 ? selectedKeys : this.pId;
        this.setState({ selectedKeys: keys });
    };
    selectChange = val => {
        let selectValue = val.split("~");
        this.setState({ selectValue });
    };

    setDataMain(dataMain, id) {
        let { optionalData } = this.state;
        if (dataMain) {
            let parmas = { id: Guid(), name: "", pid: id, formId: "" };
            dataMain.forEach(item => {
                if (item.id === id) {
                    if (item.children) {
                        item.children.push(parmas);
                    } else item.children = [parmas];
                    this.pId = [parmas.id];
                } else {
                    this.setDataMain(item.children, id);
                }
            });
        }
        return dataMain;
    }

    addNode = id => {
        let { dataMain, expandedKeys } = this.state;
        if (expandedKeys.indexOf(id) === -1) {
            expandedKeys.push(id);
        }
        let data = this.setDataMain(dataMain, id);
        this.setState({ dataMain: data });
        this.onExpand(expandedKeys);
    };

    setChildren(dataMain, pid, id, selectValue) {
        if (dataMain) {
            dataMain.forEach(item => {
                if (item.id === pid) {
                    item.children.forEach(child => {
                        if (child.name === "" && child.id === id) {
                            console.log(selectValue);
                            child.id = selectValue[0];
                            child.name = selectValue[1];
                            child.pid = item.formId;//pid;
                            child.formId = selectValue[2];
                        }
                    });
                } else {
                    this.setChildren(item.children, pid, id, selectValue);
                }
            });
        }
        return dataMain;
    }

    checkSelect = (pid, id, val) => {
        let selectValue = val.split("~");
        let { dataMain, optionalData } = this.state;
        let _dataMain = JSON.parse(JSON.stringify(dataMain));
        optionalData = optionalData.filter(v => v.id !== selectValue[0]);
        let data = this.setChildren(_dataMain, pid, id, selectValue);
        this.pId = [selectValue[0]];
        this.setState({ dataMain: data, optionalData });
    };

    spread(menus, menuArr = []) {
        for (let i = 0; i < menus.length; i++) {
            let menu = menus[i];
            menuArr.push(menu);
            if (menu && menu.children) {
                this.spread(menu.children, menuArr);
                delete menu.children;
            }
        }
        return menuArr;
    }

    removeChildren(dataMain, id) {
        debugger;
        if (dataMain && dataMain.children) {
            let data = dataMain.children;
            for (let i = 0; i < data.length; i++) {
                if (data.length === 1 && data[i].id === id) {
                    delete dataMain.children;
                } else if (data[i].id === id) {
                    data.splice(i, 1);
                } else {
                    this.removeChildren(data[i], id);
                }
            }
        }
        return dataMain;
    }

    removeTreeNode = id => {
        let { dataMain, optionalData } = this.state;
        let { currentFormData } = this.props;
        let data = this.removeChildren(dataMain[0], id);
        let spread = this.spread(JSON.parse(JSON.stringify([data])));
        let current = currentFormData.toJS();
        let arr = [...current].filter(x => [...spread].every(y => y.id !== x.id && x.type === "form"));
        this.setState({ dataMain: [data], optionalData: arr });
    };
    onExpand = expandedKeys => {
        this.setState({ expandedKeys });
    };
    renderTreeNodes = data =>
        data.map(item => {
            console.log(item);
            let { selectedKeys, optionalData } = this.state;
            let format = (
                <React.Fragment>
                    <span>
                        {item.name === "" ? (
                            <Select
                                showSearch
                                style={{ width: "180px" }}
                                placeholder="通过名称搜索"
                                onSelect={this.checkSelect.bind(this, item.pid, item.id)}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {optionalData.map((item, index) => {
                                    let value = `${item.id}~${item.name}~${item.formId}`;
                                    return (
                                        <Option key={index} value={value} title={item.name}>
                                            {item.name}
                                        </Option>
                                    );
                                })}
                            </Select>
                        ) : (
                                item.name
                            )}
                    </span>
                    {selectedKeys[0] === item.id ? (
                        <span className={styles.option}>
                            {item.name !== "" ? (
                                <Button size="small" type="primary" onClick={this.addNode.bind(this, item.id)}>
                                    新增子级
                                </Button>
                            ) : null}
                            &nbsp;&nbsp;
                            {item.formType !== 0 ? (
                                <Button size="small" onClick={this.removeTreeNode.bind(this, item.id)}>
                                    删除
                                </Button>
                            ) : null}
                        </span>
                    ) : null}
                </React.Fragment>
            );
            if (item.children) {
                return (
                    <TreeNode title={format} key={item.id} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode title={format} key={item.id} />;
        });

    buildTree(tree, treeSelect, data) {
        if (tree && treeSelect && data) {
            for (let treeSelectItem in treeSelect) {
                if (treeSelectItem == tree.id) {
                    tree.children = [];
                    treeSelect[treeSelectItem].forEach(key => {
                        data.forEach(x => {
                            if (x.id == key) {
                                this.buildTree(x, treeSelect, data);
                                tree.children.push(x);
                            }
                        });
                    });
                }
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        let { currentFormData, tableLinker, currentIndex } = nextProps;
        let formList = currentFormData.toJS();
        if (formList.length > 0) {
            let list = JSON.parse(JSON.stringify(formList));
            let tree = list.find(x => x.formType === 0);
            if (tree) {
                this.buildTree(tree, tableLinker, list);
                let spread = this.spread(JSON.parse(JSON.stringify([tree])));
                let arr = [...list].filter(x => [...spread].every(y => y.id !== x.id && x.type === "form"));
                this.setState({ dataMain: [tree], optionalData: arr });
            }
        }
    }

    render() {
        let { showModal, dataMain, expandedKeys, optionalData, selectedKeys } = this.state;
        // console.log("expandedKeys", expandedKeys, dataMain);
        return (
            <React.Fragment>
                <Button onClick={this.showModal.bind(this)} style={{ width: "100%" }}>
                    表单关系配置
                </Button>
                <Modal
                    className={styles.modal}
                    maskClosable={false}
                    title={"表单关系配置"}
                    visible={showModal}
                    onOk={this.save}
                    onCancel={this.hideModal}
                    width={800}
                    bodyStyle={{ height: 520 }}
                >
                    <Tree
                        showLine
                        defaultExpandAll
                        selectedKeys={selectedKeys}
                        expandedKeys={expandedKeys}
                        onExpand={this.onExpand.bind(this)}
                        onSelect={this.onSelect.bind(this)}
                        style={{ minHeight: "400px", maxHeight: document.body.clientHeight - 100 }}
                    >
                        {this.renderTreeNodes(dataMain)}
                    </Tree>
                </Modal>
            </React.Fragment>
        );
    }
}

export default {
    Component: FormRelation,
    getProps: props => {
        let { buildFormDataFilter, currentFormData, onChange, buildSaveData } = props;
        return { buildFormDataFilter, currentFormData, onChange, buildSaveData };
    }
};
