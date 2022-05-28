import React, { useState, useEffect } from "react";
import { Button, Icon, Modal } from "antd";
import com from "../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import Title from "../../components/FormControl/Attribute/Title.js";
import OperationPower from "../../components/FormControl/Attribute/OperationPower.js";
import Relation from "./Attribute/RelationTable";
import FormControlType from "../../enums/FormControlType";
import CollapseCom from "./Collapse/CollapseCom";
import RENDERSTYLE from "../../enums/FormRenderStyle";
import TableView from "./TableView";
import { parseFormValue } from "commonForm";
import FORM_RENDER_STYLE from "../../enums/FormRenderStyle";
import styles from "./LinkData.less";
import { AdvancedSearch } from "../../components";

const buttonStyle = { width: "90%", margin: "0 auto", marginBottom: "10px" };
const pickStyle = {
    width: "90%",
    border: "1px solid #ddd",
    margin: "0 auto",
    marginBottom: "10px",
    textAlign: "center",
    padding: 10,
    borderRadius: "4px"
};
const iconStyle = { position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 10 };
const emptyArray = [];

//容器属性初始化
function initFormItemBase() {
    let formContainerBase = com.formContainerBase();
    formContainerBase = {
        ...formContainerBase,
        type: "LinkData",
        typeName: "关联数据",
        name: "关联数据",//标题
        selectOptions: emptyArray,
        value: null,
        tableViewSource: emptyArray,
        columns: emptyArray
    };
    return formContainerBase;
}

class LinkDataMiddle extends React.PureComponent {
    render() {
        const {
            name, extra, renderStyle, panelBody, select, collapse, formLayout,
            allCollapseToggle, onChange, disabled, readOnly, relatedButtonName
        } = this.props;
        return <CollapseCom border collapse={collapse} selecting={renderStyle == RENDERSTYLE.Design ? select : false}
                            renderStyle={renderStyle}
                            hasChildren={panelBody ? panelBody.length > 0 ? true : false : false}
                            title={name} formLayout={formLayout} allCollapseToggle={allCollapseToggle} extra={extra}
                            onChange={onChange} bordered={false} type='inner'>
            {
                renderStyle === RENDERSTYLE.PC ?
                    <Button onClick={this.props.showModal} style={buttonStyle}
                            disabled={disabled || readOnly}>{relatedButtonName || "选择数据"}</Button>
                    :
                    <p style={pickStyle}>{relatedButtonName || "选择数据"}</p>
            }
            {
                this.props.renderItems(panelBody)
            }
        </CollapseCom>;
    }
}

class LinkData extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            columnsBuild: false,
            panelChild: props.getPanelChild(props.id),
            selectedKeys: emptyArray
        };
    }
    
    buildTableViewColumn = () => {
        let formBody = this.props.panelBody;
        let buildControlAuthority = this.props.buildControlAuthority;
        let columns = [];
        formBody.filter(a => a.event && a.noMappad !== true && buildControlAuthority(a.authority.toJS()).hidden !== true)
            .forEach(item => {
                let colsBase = item.event.get("buildSubTableHeaderBase")({
                    id: item.id,
                    container: item.itemBase.get("groupId") || item.container, ...item.itemBase.toJS(),
                    headerType: "formDataTable"
                });
                let cols = {};
                if (item.event.has("buildSubTableHeader")) {
                    cols = item.event.get("buildSubTableHeader")({
                        id: item.id,
                        container: item.itemBase.get("groupId") || item.container, ...item.itemBase.toJS(),
                        headerType: "formDataTable",
                        name: (item.itemBase.get("externalName") || "") !== "" ? item.itemBase.get("externalName") : item.itemBase.get("name")
                    });
                }
                if (Array.isArray(cols)) {
                    //控件组每个控件的valueType需要取获取
                    columns = columns.concat(cols.map(a => ({
                        ...colsBase, ...a,
                        valueType: item.valueType,
                        width: null
                    })));
                }
                else {
                    let colItem = { ...colsBase, ...cols, valueType: item.valueType, width: null };
                    columns.push(colItem);
                }
                
            });
        return columns;
    };
    
    getGroupItemsValue = (id, proxyIndex) => {
        return (this.props.tableViewSource || [])[proxyIndex] ? (this.props.tableViewSource || [])[proxyIndex][id] : null;
    };
    
    setSelectedKeys = (selectedKeys) => {
        this.setState({ selectedKeys });
    };
    renderSubItemCell = ({ id, extraProps, value, proxyIndex }) => {
        let formBodyJS = this.state.panelChild;
        let item = formBodyJS.find(a => a.id === id);
        if (item.formControlType !== FormControlType.GroupItem && item.formControlType !== FormControlType.Group
            && item.formControlType !== FormControlType.None) {
            let { formProperties, itemBase, renderStyle, ...other } = item;
            let Component = item.Component;
            itemBase = itemBase.set("value", parseFormValue(value, item.valueType));
            if (other.itemType === "tableLinkerName") {
                other.setTableLinkerValue = setTableLinkerValue.bind(null, other.container, proxyIndex);
                other.getTableLinkerValueList = getTableLinkerValueList.bind(null, id);
            }
            return (
                <td {...extraProps}>
                    <Component
                        mode="cell"
                        getGroupItemsValue={this.getGroupItemsValue}
                        headerType="formDataTable"
                        {...other}
                        renderStyle={FORM_RENDER_STYLE.PC}
                        itemBase={itemBase}
                        proxyIndex={proxyIndex}
                    />
                </td>
            );
        } else {
            let parent = item.formControlType === FormControlType.Group ? item : formBodyJS.find(a => a.id === item.container);
            switch (parent.formControlType) {
                case FormControlType.Group:
                    let { formProperties, itemBase, renderStyle, ...other } = parent;
                    let Component = parent.Component;
                    itemBase = itemBase
                    //.set('groupKey', item.itemBase.get('key'))
                        .set("groupValue", parseFormValue(value, item.valueType));
                    return (
                        <td {...extraProps}>
                            <Component
                                mode="groupCell"
                                getGroupItemsValue={this.getGroupItemsValue}
                                {...other}
                                renderStyle={FORM_RENDER_STYLE.PC}
                                itemBase={itemBase}
                            />
                        </td>
                    );
                default:
                    return null;
            }
        }
    };
    setLinkDataValue = () => {
        this.hideModal();
        this.handleMenuClick(this.state.selectedKeys[0]);
    };
    getModalHeight = (ele) => {
        if (ele) {
            this.modalRef = ele;
        }
    };
    loadOptions = (extraConditions = []) => {
        this.props.onChange({ loading: true });
        this.props.loadData(true, extraConditions);
    };
    handleMenuClick = (e) => {
        let exist = this.props.selectOptions.find(a => a.value === e);
        if (exist) {
            for (let id in exist.list) {
                this.props.setValueSingle(id, { value: exist.list[id] }, this.props.proxyIndex);
            }
        }
    };
    showModal = () => {
        let obj = { modalVisible: true };
        if (this.state.columnsBuild === false) {
            obj.columns = this.buildTableViewColumn();
            obj.columnsBuild = true;
        }
        this.setState(obj);
        this.loadOptions();
    };
    hideModal = () => {
        this.setState({
            modalVisible: false
        });
        this.props.onChange({ tableViewSource: emptyArray });
    };
    
    render() {
        const { mode, ...other } = this.props;
        let modalProps = {
            modalVisible: this.state.modalVisible,
            setLinkDataValue: this.setLinkDataValue,
            hideModal: this.hideModal,
            getModalHeight: this.getModalHeight,
            columns: this.state.columns,
            relationFilterFields: other.relationFilterFields || [],
            modalRef: this.modalRef,
            id: other.id,
            loading: other.loading,
            setSelectedKeys: this.setSelectedKeys,
            selectedKeys: this.state.selectedKeys,
            tableViewSource: other.tableViewSource,
            renderSubItemCell: this.renderSubItemCell,
            panelBody: other.panelBody,
            relatedButtonName: other.relatedButtonName,
            loadData: this.loadOptions
        };
        switch (mode) {
            case "tableHeader":
                return this.props.name;
            case "form":
                return <React.Fragment>
                    <LinkDataMiddle {...other} showModal={this.showModal} handleMenuClick={this.handleMenuClick}/>
                    <LinkDataSelectModal {...modalProps} />
                </React.Fragment>;
            case "option":
                return <React.Fragment>
                    <Title.Component {...Title.getProps(this.props)} />
                    <Relation showRelationButton={true} {...other} expressionType="data"/>
                    <OperationPower showEdiable={false} {...this.props} />
                </React.Fragment>;
            case "cell":
                return null;
            case "table":
                return <div style={{ position: "relative" }}>
                    <Icon onClick={this.showModal} type="link" style={iconStyle}/>
                    <LinkDataSelectModal {...modalProps} />
                </div>;
        }
    }
}

function LinkDataSelectModal({
                                 modalVisible, setLinkDataValue, hideModal, getModalHeight, columns,
                                 relationFilterFields, modalRef, id, loading, setSelectedKeys, selectedKeys, tableViewSource,
                                 renderSubItemCell, panelBody, relatedButtonName, loadData
                             }) {
    let [filterShowList, showFields] = [[], []];
    relationFilterFields.forEach(item => {
        filterShowList.push({ filterShow: true, key: item.key });
        showFields.push(item.key);
    });
    
    function addFilterSearchValue(params) {
        let conditionContainer = [];
        params.forEach(item => {
            let Condition = "";
            const tempOptionArr = com.optionObj[item.valueType];
            if (item.code === "Cascader") {
                let tempOption = tempOptionArr.find(a => a.value === item.select);
                item.filter.forEach(a => {
                    Condition = tempOption.condition.replace(/value/g, a.address);
                    let obj = { mark: Condition, field: a.code, formCode: item.formCode, formType: item.formType };
                    conditionContainer.push(obj);
                });
            } else {
                if (item.select === "2" || item.select === "3") {
                    let tempOption = tempOptionArr.find(a => a.value === item.select);
                    Condition = tempOption.condition;
                }
                else if (!item.select || !item.filter) return;
                else if (item.select === "12") {
                    let tempOption = tempOptionArr.find(a => a.value === item.select);
                    let tempCondition = tempOption.condition.replace(/value1/g, item.filter);
                    Condition = tempCondition.replace(/value2/g, item.filterSecond);
                }
                else {
                    let tempOption = tempOptionArr.find(a => a.value === item.select);
                    Condition = tempOption.condition.replace(/value/g, item.filter);
                }
                let obj = { mark: Condition, field: item.code, formCode: item.formCode, formType: item.formType };
                conditionContainer.push(obj);
            }
        });
        //console.log(conditionContainer)
        loadData(conditionContainer);
    }
    
    return <Modal wrapClassName={styles.modal} width='auto' title={relatedButtonName || "选择数据"} visible={modalVisible}
                  onOk={setLinkDataValue} onCancel={hideModal}>
        <div ref={getModalHeight} style={{ height: "100%", overflow: "auto" }}>
            <AdvancedSearch
                filterSearchValue={[]}
                dataFilter={relationFilterFields}
                filterShowList={filterShowList}
                showFields={showFields}
                addFilterSearchValue={addFilterSearchValue}
            />
            <TableView modalRef={modalRef} rootId={id} loading={loading !== false} setSelectedKeys={setSelectedKeys}
                       selectedKeys={selectedKeys} dataSource={tableViewSource} columns={columns}
                       renderSubItemCell={renderSubItemCell} relationFilterFields={relationFilterFields}/>
        </div>
    </Modal>;
}

export default {
    itemType: "LinkData",//关联数据
    formControlType: FormControlType.External,
    name: "关联数据",
    ico: "credit-card",
    group: FORM_CONTROLLIST_GROUP.Advanced,//分组
    Component: LinkData,
    initFormItemBase,
    valueType: "external",
    event: {
        onLoadData: function({ data, props }) {
            let selectOptions = [];
            let tableViewSource = [];
            data.forEach((a, index) => {
                if (a.key) {
                    let { key, ...other } = a;
                    let list = {};
                    for (let item in other) {
                        list[item] = other[item].value;
                    }
                    selectOptions.push({
                        list,
                        value: key.value
                    });
                    tableViewSource.push({ ...list, index, key: key.value });
                }
            });
            return { selectOptions, tableViewSource, loading: false };
        },
        buildSubTableHeader: (props) => {
            let { id, container, name, cusWidValue, headerType } = props;
            let column = {
                title: name,
                key: id,
                //dataIndex: id,
                //width: 150,
                container,
                children: []
            };
            if (headerType !== "formDataTable")
                column.children.push({
                    title: "",
                    key: id + "header",
                    dataIndex: id,
                    width: 50,
                    container
                });
            return column;
        }
    }
};
