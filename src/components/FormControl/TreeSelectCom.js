import React, { Component, PureComponent } from "react";
import { TreeSelect, Input } from "antd";
import com from "../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import RENDERSTYLE from "../../enums/FormRenderStyle";
import { getOrganazition } from "../../services/BookAddress/BookAddress";
import Title from "../../components/FormControl/Attribute/Title.js";
import Desc from "../../components/FormControl/Attribute/Desc.js";
import VerificationGroup from "../../components/FormControl/Attribute/VerificationGroup.js";
import OperationPower from "../../components/FormControl/Attribute/OperationPower.js";
import SelectMode from "./Member/SelectMode.js";
import Position from "../../components/FormControl/Attribute/PositionStyle";
import FormControlType from "../../enums/FormControlType";
import DataSource from "./Attribute/DataSource";
// 是否展开配置
import UnfoldNode from './Attribute/UnfoldNode';
// 默认值配置
import DefaultValueTree from './Attribute/DefaultValueTree';

const mark = "&_";
const ds = { maxHeight: "400px", overflow: "auto" };

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = "TreeSelectCom";
    formItemBase.typeName = "树形选择";
    formItemBase.name = "树形选择";
    formItemBase.dicMode = true;
    formItemBase.selectMode = "solo"; //选择模式
    formItemBase.treeData = [];
    formItemBase.configApi = getOrganazition;
    formItemBase.currentExpand = null;
    formItemBase.parentParams = "parentId";
    return formItemBase;
}

function buildLeafCheckOnly(treeData) {
    treeData.forEach(item => {
        if (item.isLeaf === false) {
            item.disabled = true;
        }
        if (Array.isArray(item.children)) {
            buildLeafCheckOnly(item.children);
        }
    })
}

class TreeSelectComMiddle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            design: props.renderStyle === RENDERSTYLE.Design,
        };
    }

    handleChange = (value, label, extra) => {
        const { selectMode } = this.props;
        if (selectMode === "solo" && value) {
            value = [value];
        }
        if(this.props.onChangeAll){
            this.props.onChangeAll({
                value:{
                    value:value,
                    name: label
                },
            })
        }else{
            this.props.setGroupItemValue("value", value);
            this.props.setGroupItemValue("name", label);
        }
    };
    loadData = item => {
        let t = this;
        return new Promise(resolve => {
            let node = { children: this.props.treeData };
            item.props.eventKey
                .split(mark)
                .slice(1)
                .forEach(p => {
                    node = node.children.find(a => a.value === p);
                });
            if (node.children === undefined) {
                this.props.onChange({ currentExpand: item.props.eventKey, currentIndex: this.props.proxyIndex });
                this.props.loadData({ [this.props.parentParams || "parentId"]: node.value });
            }
            resolve();
        });
    };

    render() {
        let {
            groupValues,
            selectMode,
            treeData,
            importTreeData,
            onFocus,
            readOnly,
            leafOnly,
            checkStrictly,
            disabled,
            key,
            defaultValue,
            // 树选择默认值
            treeDefaultValue,
            // 是否展开值
            unfoldNodeChecked
        } = this.props;

        if(defaultValue){
            groupValues = defaultValue
        }
        let { name, value } = groupValues;
        let finalData = importTreeData || treeData;
        if (leafOnly) {
            buildLeafCheckOnly(finalData)
        }
        if (Array.isArray(value) && value.length > 0) {
            value.forEach((v, i) => {
                if (findNode(finalData, v))
                    finalData = [{ title: name[i], value: v, key: v, isLeaf: true }, ...finalData];
            });
        }
        return <TreeSelect
            //treeExpandedKeys
            key={key}
            onFocus={onFocus}
            disabled={readOnly || disabled}
            treeData={finalData}
            showSearch
            loadData={importTreeData ? null : this.loadData}
            style={{ width: "100%" }}
            dropdownStyle={ds}
            value={value}
            checkStrictly={checkStrictly}
            allowClear
            multiple={selectMode !== "solo"}
            onChange={this.handleChange}
            treeNodeFilterProp={"title"}
            defaultValue={treeDefaultValue || []}
            treeDefaultExpandAll={unfoldNodeChecked}
        />;
    }
}

function findNode(treeData, value) {
    let exist = treeData.find(a => a.value === value);
    if (exist)
        return false;
    let childrenList = treeData.filter(a => Array.isArray(a.children) && a.children.length > 0);
    for (let item of childrenList) {
        let find = findNode(item.children, value);
        if (!find)
            return false;
    }
    return true;
}

function nodeCheck(treeData, newData) {
    if (newData.length > 0) {
        let checkValue = newData[0].value;
        return findNode(treeData, checkValue);
    }
    else
        return false;
}

class TreeSelectCom extends PureComponent {
    render() {
        let { mode } = this.props;
        switch (mode) {
            case "table":
            case "form":
                return <TreeSelectComMiddle {...this.props} />;
            case "option":
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <Position.Component {...Position.getProps(this.props)} />
                        <SelectMode.Component {...SelectMode.getProps(this.props)} />
                        {/* 是否在预览表单是展开所有节点的开关配置 */}
                        <UnfoldNode.Component {...this.props} />
                        <VerificationGroup.Component {...VerificationGroup.getProps(this.props)} />
                        <DataSource.Component
                            {...DataSource.getProps({ ...this.props, extraParams: ["node"] })}
                        />
                        {/* 第三方数据导入默认值配置 */}
                        {this.props.importTreeData &&
                        <DefaultValueTree.Component {...DefaultValueTree.getProps(this.props)} />
                        }
                        <OperationPower {...this.props} />
                        <Desc.Component {...Desc.getProps(this.props)} />
                    </React.Fragment>
                );
            case "cell":
                return this.props.groupValues.name || "";
            case "groupCell":
                return this.props.groupValue || "";
            default:
                return <div>控件加载失败</div>;
        }
    }
}

export default {
    itemType: "TreeSelectCom",
    formControlType: FormControlType.Group,
    items: [
        { key: "name", name: "{name}", valueType: "array" },
        { key: "value", name: "{name}Id", valueType: "array", private: true }
    ],
    name: "树形选择",
    ico: "apartment",
    group: FORM_CONTROLLIST_GROUP.Normal, //分组
    Component: TreeSelectCom,
    valueType: "array",
    event: {
        //获取用于参与计算引擎计算的计算元素
        onGetLinkerParams: function (props) {
            return [
                {
                    id: props.groupItems.name.id,
                    name: props.name,
                    valueType: "array"
                }
            ];
        },
        onLoadData: function ({ data, props, force }) {
            let { key = 1, treeData } = props;
            let parents = props.currentExpand || "";
            if (props.currentIndex !== props.proxyIndex || force)
                parents = '';
            let newData = data.filter(a => a.key.value !== undefined).map(a => {
                let item = {
                    title: a[props.groupItems.name.id].name,
                    value: a.key.value,
                    key: parents + mark + a.key.value,
                    isLeaf: a.node.value === "true" || a.node.value === true
                };
                if (item.isLeaf === false && props.leafOnly)
                    item.disabled = true;
                return item;
            });
            if (force || parents === "" || props.currentIndex !== props.proxyIndex) {
                treeData = newData;
                if (!force)
                    return { treeData };
                else
                    return { treeData, key: key + 1, currentExpand: '' };
            }
            else {
                if (nodeCheck(treeData, newData)) {
                    let node = { children: treeData };
                    parents
                        .split(mark)
                        .slice(1)
                        .forEach(p => {
                            node = node.children.find(a => a.value === p);
                        });
                    node.children = newData;
                }
                return { treeData };
            }

        },
        FilterComponent: props => {
            return (
                <Input
                    value={props.filterValue}
                    onChange={e => {
                        props.setFilterValue(e.target.value);
                    }}
                />
            );
        },
        buildSubTableHeader: props => {
            let { id, groupItems, name, container, cusWidValue } = props;
            let column = {
                title: name,
                key: id,
                dataIndex: groupItems.name.id,
                width: cusWidValue,
                container
            };
            return column;
        },
        getFilterComponentProps: props => {
            return {
                filterValue: props.filterValue
            };
        }
    },
    initFormItemBase
};
