import { Component } from "react";
import ReactDOM from "react-dom";
import { Radio, Button, Collapse, Select, Input, Icon, Tabs, Spin, message, Modal } from "antd";
import { connect } from "dva";
import styles from "./DataAuthorityNew.less";
import { Guid } from "../../utils/com";
import { List, Map, is } from "immutable";
import queryString from "query-string";
import FormControlType from "../../enums/FormControlType";
import CooperateStatus from "../../enums/AuthorityStatus";
import {
    getFiltermemList,
    getFilterOrganaziton,
    GetConfigTarget,
    getFilterRoleList,
    searchAllList
} from "../../services/BookAddress/BookAddress";
import { GetTableHeadAll } from "../../services/DataManage/DataManage";
import { initDataAuthority, saveData } from "../../services/DataAuthorityNew/DataAuthorityNew";

import { CoperAu, FieldsAu } from "../../components/DataAuthority/dataAuthorityCom/dataAuthorityCom";
import { Department, Roles, Member } from "../../components/BookAddress/MemberCom/FilterCom/FilterCom";
import FilterCondition from "../../components/DataManage/FilterCondition";
import table from "../../models/Common/table";
import { select } from "redux-saga/effects";

const confirm = Modal.confirm;
// 对于 需要 特殊 处理 的 表头
const groupArr = ["SingleDropDownList", "SingleRadio", "CheckBoxes", "MutiDropDownList", "Member", "Department", "Cascader", "TreeSelectCom"];
const containerArr = ["Card", "Tab"];
const specialRenderArr = ["SubForm", "LinkData", "LinkQuery"];
const linkRenderArr = ["LinkData", "LinkQuery"];
const TabPane = Tabs.TabPane;
const saveStatus = Object.freeze({
    add: 1,
    modify: 2
});
const showFilterArr = [
    // {
    //     type: "0",
    //     name: "部门",
    //     idList: []
    // },
    {
        type: "1",
        name: "职责",
        idList: [],
        isTree: false
    }
    // {
    //     type: "2",
    //     name: "成员",
    //     idList: [],
    //     isTree: true
    // }
];
let systemFields = [{
    id: "system",
    name: "系统字段",
    show: true
}, {
    code: "CreateUserId",
    id: "CreateUserId",
    type: "member",
    formId: "CreateUserId",
    name: "提交人",
    sid: "system",
    show: true
}, {
    code: "OrganizationId",
    id: "OrganizationId",
    type: "department",
    formId: "OrganizationId",
    name: "提交部门",
    sid: "system",
    show: true
}, {
    code: "CreateTime",
    id: "CreateTime",
    type: "datetime",
    formId: "CreateTime",
    name: "提交时间",
    sid: "system",
    show: true
}, {
    code: "WorkFlowStatus",
    id: "WorkFlowStatus",
    type: "select",
    formId: "WorkFlowStatus",
    name: "流程状态",
    sid: "system",
    show: true
}];
/* 搜索 组件 */
const SearchCom = function(props) {
    let { searchDataArr, searchData, showFilterArr, selectedSearch, checkboxEvent } = props;
    // console.log(searchDataArr);
    const wordOnChange = (function() {
        let time;
        return function(e) {
            e.persist();
            time && clearTimeout(time);
            time = setTimeout(() => {
                let filterTypeArr = [],
                    EmployeeIdList = [],
                    OrganizationIdList = [],
                    RoleIdList = [];
                showFilterArr.forEach(v => {
                    filterTypeArr.push(v.type);
                    if (v.type === 0 && v.idList) {
                        OrganizationIdList = v.idList;
                    }
                    if (v.type === 1 && v.idList) {
                        RoleIdList = v.idList;
                    }
                    if (v.type === 2 && v.idList) {
                        EmployeeIdList = v.idList;
                    }
                });
                searchData({
                    showList: filterTypeArr,
                    keyword: e.target.value
                }, {
                    EmployeeIdList,
                    OrganizationIdList,
                    RoleIdList
                });
            }, 300);
        };
    })();
    const checkOnchange = (v, type, bool, e) => {
        e.stopPropagation();
        checkboxEvent(v, type, bool);
    };
    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchInput}>
                <Input.Search onChange={wordOnChange} autoFocus onClick={(e) => {
                    e.stopPropagation();
                }}/>
            </div>
            <div className={styles.searchContainer}>
                {
                    searchDataArr.filter(t => t.type === 1).map((item, index) => (
                        <div key={index}>
                            <div className={styles.searchTitle}>{item.name}</div>
                            {
                                item.children.length ? item.children.map((v, i) => (
                                    <div key={v.id} className={`${styles.searchResult}`}
                                         onClick={selectedSearch.bind(null, v)}>
                                        {v.name}
                                        <div
                                            className={`${styles.checkCustom} ${v.checked ? styles.customChecked : ""}`}
                                            onClick={checkOnchange.bind(null, v, v.type, !v.checked)}>
                                            {
                                                v.checked ? <Icon type="check" theme="outlined"
                                                                  className={styles.checkIcon}/> : null
                                            }
                                        </div>
                                    </div>
                                )) : (
                                    <div className={styles.searchNo}>暂无相关1{
                                        ((type) => {
                                            let name = "";
                                            switch (type) {
                                                case 0:
                                                    name = "部门";
                                                    break;
                                                case 1:
                                                    name = "职责";
                                                    break;
                                                case 2:
                                                    name = "成员";
                                                    break;
                                            }
                                            return name;
                                        })(item.type)
                                    }</div>
                                )
                            }
                        </div>
                    ))
                }
            </div>
        </div>
    );
};
const showCondArr = [
    {
        type: "0",
        name: "操作权限"
    },
    {
        type: "1",
        name: "字段权限"
    },
    {
        type: "2",
        name: "数据权限"
    }
];
// 初始化数据
const initDataFromApi = ({ data, fieldsArr, coperAuConfig, fieldNameArr }) => {
    let tempCoper = JSON.parse(data.operation),
        tempFieldsArr = JSON.parse(data.formItem),
        tempFilterCondition = JSON.parse(data.data),
        resultObj = {};
    resultObj.id = data.id;
    /* 初始化  操作权限 */
    if (Object.keys(tempCoper).length) {
        Object.keys(coperAuConfig).forEach(item => {
            if (tempCoper[item]) {
                coperAuConfig[item]["checkedArr"] = tempCoper[item];
            }
        });
        resultObj.coperAuConfig = coperAuConfig;
    }
    resultObj.CheckCustomButton = tempCoper.CheckCustomButton || [];
    /* 初始化 字段权限 */
    if (tempFieldsArr.show.length || tempFieldsArr.edit.length) {
        fieldsArr.forEach(item => {
            if (tempFieldsArr.show.indexOf(item.id) !== -1) {
                item.show = true;
            }
            if (tempFieldsArr.edit.indexOf(item.id) !== -1) {
                item.edit = true;
            }
        });
        /* 初始化 fieldNameArr,tempFilterCondition */
        // console.log(fieldNameArr, tempFilterCondition, tempFieldsArr);
        fieldNameArr.forEach(item => {
            if (item.id !== "system" && item.sid !== "system") {
                if (tempFieldsArr.show.indexOf(item.id) === -1) {
                    /* 对于 tempFilterCondition 也要处理  */
                    let existFilterItem = tempFilterCondition.filter(filter => filter.id === item.id)[0];
                    if (existFilterItem) {
                        let i = tempFilterCondition.indexOf(existFilterItem);
                        tempFilterCondition.splice(i, 1);
                    }
                    item.show = false;
                } else {
                    item.show = true;
                }
            }
        });
    }
    /* 初始化 数据权限 */
    if (tempFilterCondition.length) {
        fieldNameArr.forEach(item => {
            if (tempFilterCondition.some(child => child.id === item.id)) {
                item.isFilter = true;
            }
        });
        resultObj.fieldNameArr = fieldNameArr;
        resultObj.filterConditionArr = tempFilterCondition;
    }
    return resultObj;
};
/* 清空 初始化 状态 */
const clearItemsState = ({ fieldsArr, coperAuConfig, filterConditionArr, fieldNameArr }) => {
    fieldsArr.forEach(item => {
        item.show = false;
        item.edit = false;
    });
    Object.keys(coperAuConfig).forEach(id => {
        coperAuConfig[id]["checkedArr"].length = 0;
    });
    filterConditionArr.length = 0;
    fieldNameArr.forEach(item => {
        item.isFilter = false;
    });
    return {
        fieldsArr,
        coperAuConfig,
        filterConditionArr,
        fieldNameArr
    };
};
const getTitle = (item, anotherColumns, nameList) => {
    if (item.itemType !== "Root") nameList.unshift(item.itemBase.name);
    if (!item.container) return nameList;
    let parentColumn = anotherColumns.filter(column => column.id === item.container)[0];
    return getTitle(parentColumn, anotherColumns, nameList);
};
const initFormItems = (formBody) => {
    // formBody = formBody.filter(item => !item.itemBase.hidden);
    const rootItem = formBody.filter(item => item.itemType === "Root")[0];
    let nodes = [],
        queue = [],
        nameList = [];
    const dealGeneralGroupData = (child, formBody, nameList, containerItem) => { //处理 除了 地址以外 的 控件组 数据
        // console.log(child);
        let tempObj = {};
        // let existItem = formBody.filter(i => (i.container === child.id && i.itemBase.name === "名称"))[0];
        let existItem = formBody.filter(i => (i.container === child.id && child.itemBase.groupItems.name && child.itemBase.groupItems.name.id === i.id))[0];
        if (existItem) {
            existItem.container = child.container;
            tempObj = existItem;
        } else {
            tempObj = child;
        }
        let isSubformChild = nameList.length && !specialRenderArr.some(s => s === containerItem.itemType);
        return {
            id: tempObj.id,
            formId: isSubformChild ? nameList[0] : tempObj.container,
            name: isSubformChild ? `${getTitle(child, formBody, []).join(".")}` : child.itemBase.name,
            type: child.valueType,
            code: tempObj.code
        };
    };
    if (rootItem) {
        queue.push(rootItem);
        while (queue.length) {
            let containerItem = queue.shift();
            let exsitChildren = formBody.filter(item => item.container === containerItem.id);
            if (exsitChildren.length) {
                for (let i = 0, len = exsitChildren.length; i < len; i++) {
                    let child = exsitChildren[i];
                    let conIsSubform = specialRenderArr.some(s => s === containerItem.itemType);
                    if (child.formControlType == FormControlType.Container && (containerArr.indexOf(child.itemType) !== -1)) {
                        if (containerItem.itemType === "Root") nameList.push(containerItem.id);
                        nameList.push(child.itemBase.name);
                        queue.push(child);
                        continue;
                    } else if (child.formControlType === FormControlType.Group && (groupArr.indexOf(child.itemType) !== -1)) {
                        nodes.push(dealGeneralGroupData(child, formBody, nameList, containerItem));
                        continue;
                    } else {
                        let isSubform = specialRenderArr.some(s => s === child.itemType),
                            isLinkArr = linkRenderArr.some(s => s === child.itemType);
                        // 如果子表单 中 是 关联型数据
                        if (containerItem.itemType === "SubForm" && isLinkArr) {
                            let linkChildren = formBody.filter(c => c.container === child.id);
                            if (linkChildren.length) {
                                linkChildren = linkChildren.map(c => {
                                    let tempObj = {
                                        formId: child.container,
                                        name: `${child.itemBase.name}.${c.itemBase.name}`
                                    };
                                    let generalGroupType = c.formControlType === FormControlType.Group && (groupArr.indexOf(c.itemType) !== -1);
                                    tempObj.id = generalGroupType ? dealGeneralGroupData(c, formBody, nameList, containerItem).id : c.id;
                                    return tempObj;
                                });
                                nodes.push.call(nodes, ...linkChildren);
                            } else {
                                nodes.push({
                                    id: child.id,
                                    formId: child.container,
                                    name: child.itemBase.name,
                                    type: child.valueType,
                                    code: child.code
                                });
                            }
                        } else { //其他 普通情况
                            let tempObj = {
                                id: child.id,
                                type: child.valueType,
                                code: child.code
                            };
                            if (isSubform)
                                tempObj.type = "subform";
                            if (nameList.length) {
                                tempObj.formId = conIsSubform ? child.container : nameList[0];
                                tempObj.name = conIsSubform ? child.itemBase.name : `${getTitle(child, formBody, []).join(".")}`;
                            } else {
                                tempObj.formId = child.container;
                                tempObj.name = child.itemBase.name;
                            }
                            nodes.push(tempObj);
                            queue.push(child);
                        }
                        continue;
                    }
                }
            }
        }
    }
    return nodes;
};
const initData = (props) => {
    let formBody = props.formBody instanceof Array ? props.formBody : [],
        data = {};
    data.name = props.formTitle;
    //操作权限
    data.operation = formBody.reduce((prev, next) => {
        let filterArr = ["Root", "SubForm"];
        if (filterArr.some(item => (item === next.itemType))) {
            prev.push({
                formId: next.id,
                formName: next.itemBase.name,
                itemType: next.itemType,
                keys: []
            });
        }
        return prev;
    }, []);
    //字段权限
    data.formItem = (initFormItems(formBody)).filter(v => v.type !== "mark");
    ;
    // console.log(data.formItem);
    // 数据权限
    let query = queryString.parse(props.history.location.search);
    // data.formItem.forEach(v => {
    //     let existItem = props.formBody.filter(item => item.id === v.id)[0];
    //     if (existItem && existItem.itemType === "Cascader") {
    //         props.formBody.filter(i => i.container === existItem.id).forEach(i => {
    //             if (i.code) v.code = i.code;
    //         });
    //     }
    // });
    if (parseInt(query.formTemplateType) !== 1) {
        systemFields = systemFields.filter(v => v.id !== "WorkFlowStatus");
    }
    // let dataAuthority = JSON.parse(JSON.stringify(data.formItem)).filter(v => v.type !== "mark" && v.type !== "boolean");
    data.dataFormItem = data.formItem.concat(systemFields);
    return data;
};
const initDataAu = (props) => {
    // 初始化全选
    let data = initData(props);
    (!data.formItem.some(item => item.id === "all") && props.formBody) && data.formItem.unshift({
        id: "all",
        name: "全选", //名称
        formId: props.formBody.filter(item => item.itemType === "Root")[0]["id"]
    });
    return {
        // 数据权限数据
        coperAuConfig: data.operation.reduce((prev, next) => { //操作权限
            prev[next.formId] = {
                name: next.formName,
                checkedArr: next.keys,
                itemType: next.itemType
            };
            return prev;
        }, {}),
        fieldsArr: data.formItem, //字段权限
        fieldNameArr: data.dataFormItem.filter(v => v.id !== "all")
    };
};

// 初始化 数据 多选的 状态
function initCheckboxState(targetList, selectedData) {
    selectedData.length && targetList.forEach(v => {
        selectedData.forEach(item => {
            if (v.id === item.id) {
                v.checked = true;
            }
        });
    });
    return targetList;
}

class DataAuthorityNew extends Component {
    constructor(props) {
        super(props);
        let query = queryString.parse(props.history.location.search);
        this.state = {
            roleTabState: showFilterArr[0]["type"],
            filterTabSate: showCondArr[Number(props.formTemplateType) === 1 ? 1 : 0]["type"],
            roleLoading: false,
            filterLoading: false,
            selectedData: [],
            BeforeSelectedData: [], //上次选中的组织机构
            DelBeforeSelectedData: [],
            isSearch: false,
            // 部门 tabs
            departArr: [], //这个是 树,统一存储点
            // 职责tabs
            rolesArr: [], //职责的 统一 存储 列表
            // 成员 tabs
            memArr: [], //成员的 统一 存储列表
            
            searchDataArr: [], //搜索的数据
            updateTreeData: [], //获取 在 tree的 数据
            
            selectTreeKeys: [], //对于 树 被激活，获取 成员 的存储值
            selectRolesActive: "", //职责 被 激活的 id
            filterConditionArr: [],
            
            operationStatus: null,
            isChange: false, //简单 检查 是否 有 修改
            props,
            ...initDataAu(props),
            FormTemplateVersionId: query.tabId,
            templateId: query.formTemplateId,
            CheckCustomButton: []//自定义按钮组
        };
        this.selectTreeActive = this.selectTreeActive.bind(this);
        this.switchTab = this.switchTab.bind(this);
        this.initTabsData = this.initTabsData.bind(this);
        this.changeCoperAuChecked = this.changeCoperAuChecked.bind(this);
        this.changeFieldAuChecked = this.changeFieldAuChecked.bind(this);
        this.searchData = this.searchData.bind(this);
        this.selectedSearch = this.selectedSearch.bind(this);
        this.updateFilterCondition = this.updateFilterCondition.bind(this);
        this.initAuthority = this.initAuthority.bind(this);
        this.savePerData = this.savePerData.bind(this);
        this.selectRolesOrMem = this.selectRolesOrMem.bind(this);
        this.selectAuEvent = this.selectAuEvent.bind(this);
        this.confirmSaveData = this.confirmSaveData.bind(this);
        this.initTabsData(this.state.roleTabState, "init");
        this.GetConfigTargetData = this.GetConfigTargetData.bind(this);
        this.BeforeSelectAuEvent = this.BeforeSelectAuEvent.bind(this);
        this.GetConfigTargetData();
    }
    
    async GetConfigTargetData() {
        //初始化选择的部门 职责 成员
        let { data } = await GetConfigTarget({
            ModuleId: this.props.moduleId, // 当前表单的moduleid
            Platform: "NPF" // 传入固定值NPF即可
        });
        let { orgs, roles, employees } = data;
        // console.log(orgs, roles, employees, orgs.concat(roles.concat(employees)));
        this.setState({
            BeforeSelectedData: orgs.concat(roles.concat(employees)),
            DelBeforeSelectedData: [],
            selectedData: []
        });
    }
    ;
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if (!is(nextProps, prevState.props)) {
            return {
                props: nextProps,
                ...initDataAu(nextProps)
            };
        }
        return null;
    }
    
    // 确定 提交保存
    confirmSaveData() {
        let me = this;
        confirm({
            title: "您确定保存当前配置吗？",
            content: `${me.state.selectedData.length ? "确定批量当前选中项吗" : "确定修改当前渲染项吗"}`,
            okText: "确定",
            okType: "danger",
            cancelText: "取消",
            onOk() {
                me.savePerData();
            },
            onCancel() {
                // console.log("Cancel");
            }
        });
    }
    
    // 提交 保存 数据权限
    async savePerData() {
        if (!this.state.isChange && !this.state.selectedData.length) {
            message.warning("请修改权限后再提交");
            return;
        }
        this.setState({
            roleLoading: true,
            filterLoading: true
        });
        let { fieldsArr, coperAuConfig, filterConditionArr, roleTabState, selectTreeKeys, selectRolesActive, FormTemplateVersionId, templateId, operationStatus, fieldNameArr, id, selectedData, DelBeforeSelectedData, CheckCustomButton } = this.state,
            result = {},
            tempObj = {},
            tempData = [];
        //console.log(coperAuConfig);
        fieldsArr = fieldsArr.filter(v => v.id !== "all");
        result.moduleId = this.props.moduleId;
        tempObj.target = selectedData.length ? selectedData : [{
            id: Number(roleTabState) === 0 ? selectTreeKeys[0] : selectRolesActive,
            type: roleTabState
        }];
        //上次选中删除的
        tempObj.DeletePermissions = DelBeforeSelectedData.length ? DelBeforeSelectedData : null;
        tempObj.operation = Object.keys(coperAuConfig).reduce((prev, next) => {
            if (coperAuConfig[next]["checkedArr"].length) {
                prev[next] = coperAuConfig[next]["checkedArr"];
            }
            if (coperAuConfig[next]["itemType"] === "Root") {
                prev["rootId"] = next;
            }
            return prev;
        }, { CheckCustomButton: CheckCustomButton });
        console.log("fieldsArr", fieldsArr);
        tempObj.formItem = fieldsArr.reduce((prev, next) => {
            if (!next.show) {
                prev.hidden.push(next.id);
            } else {
                prev.show.push(next.id);
            }
            if (!next.edit) {
                prev.disabled.push(next.id);
            } else {
                prev.edit.push(next.id);
            }
            return prev;
        }, {
            hidden: [],
            show: [],
            disabled: [],
            edit: []
        });
        tempObj.operation = JSON.stringify(tempObj.operation);
        tempObj.formItem = JSON.stringify(tempObj.formItem);
        tempObj.data = JSON.stringify(filterConditionArr);
        debugger;
        tempObj.dataCode = {
            id: templateId,
            formTemplateVersionId: FormTemplateVersionId,
            fieldArr: fieldsArr.reduce((prev, next) => {
                if (next.show) {
                    /* 由于 存在 地址空间 这种特殊的 控件组，所以要特殊处理 */
                    let existItem = this.props.formBody.filter(item => item.id === next.id)[0];
                    if (existItem && existItem.itemType === "Cascader") {
                        prev = prev.concat(this.props.formBody.filter(i => i.container === existItem.id).map(i => {
                            if (i.code) return i.code;
                            let icode = fieldNameArr.filter(f => f.id === i.id)[0];
                            return icode ? icode.code : "";
                        }));
                    } else {
                        let existFiledItem = fieldNameArr.filter(f => f.id === next.id)[0];
                        if (existFiledItem && existFiledItem.code !== undefined)
                            existFiledItem && prev.push(next.code);
                    }
                }
                return prev;
            }, []),
            
            conditionContainer: filterConditionArr.length ? table.dealDataTable(filterConditionArr) : []
        };
        let { target, DeletePermissions, ...otherObj } = tempObj;
        tempData.push({
            target,
            DeletePermissions,
            permission: {
                ...otherObj
            }
        });
        result.data = tempData;
        result.Platform = "NPF";
        result.formTemplateId = this.state.templateId;
        let { data } = await saveData(result);
        data.isValid && message.success("保存成功");
        this.GetConfigTargetData();
        this.setState({
            roleLoading: false,
            filterLoading: false,
            isChange: false
        });
        this.props.updatePermission();
    }
    
    // 初始化 数据权限的 状态
    async initAuthority(id) {
        // await this.getFiledsArr("init");
        this.setState({
            filterLoading: true
        });
        let { roleTabState } = this.state,
            tempObj = {
                moduleId: this.props.moduleId,
                employeeIds: [],
                organizationIds: [],
                roleIds: []
            },
            result = null,
            updateObj = {};
        let { fieldsArr, coperAuConfig, filterConditionArr, fieldNameArr } = clearItemsState(
            {
                fieldsArr: this.state.fieldsArr,
                coperAuConfig: this.state.coperAuConfig,
                filterConditionArr: this.state.filterConditionArr,
                fieldNameArr: this.state.fieldNameArr
            });
        switch (roleTabState) {
            case "0":
                result = "organziationDataPermissionActionRequests";
                tempObj.organizationIds.length = 0;
                tempObj.organizationIds.push(id);
                break;
            case "1":
                result = "roleDataPermissionActionRequests";
                tempObj.roleIds.length = 0;
                tempObj.roleIds.push(id);
                break;
            case "2":
                result = "employeeDataPermissionActionRequests";
                tempObj.employeeIds.length = 0;
                tempObj.employeeIds.push(id);
                break;
        }
        debugger;
        let { data } = await initDataAuthority(tempObj);
        console.log(data);
        if (data.isValid) {
            debugger;
            if (data[result].length) {
                let updateData = initDataFromApi({
                    data: data[result][0],
                    fieldsArr,
                    coperAuConfig,
                    fieldNameArr
                });
                
                
                updateObj = {
                    ...updateObj, ...updateData
                };
            } else {
                fieldNameArr.forEach(item => {
                    if (item.id !== "system" && item.sid !== "system") item.show = false;
                });
                // fieldNameArr.forEach(item => {
                //     item.show = true;
                // });
                fieldsArr.forEach(item => {
                    item.show = false;
                });
                updateObj.fieldNameArr = fieldNameArr;
                updateObj.CheckCustomButton = [];
            }
            updateObj.operationStatus = !data[result].length ? saveStatus.add : saveStatus.modify;
        }
        this.setState({
            filterLoading: false,
            ...updateObj
        });
    }
    
    switchTab(type, e) {
        this.setState({
            [type === "roleType" ? "roleTabState" : "filterTabSate"]: e
        });
        if (type === "roleType") {
            this.initTabsData(e);
        }
    }
    
    // 获取 头部列表 的 fieldArr
    async getFiledsArr(type) {
        // type === "init" ? (this.state.filterLoading = true) : this.setState({ filterLoading: true });
        let { data } = await GetTableHeadAll({
            FormTemplateVersionId: this.state.FormTemplateVersionId
        });
        // this.setState({ filterLoading: false });
        if (data && data instanceof Array) {
            
            let fieldNameArr = table.getFeildName(table.initColumns(data));
            
            fieldNameArr.forEach(item => {
                item.show = true;
            });
            // console.log(fieldNameArr);
            this.setState({
                fieldNameArr
            });
        }
    }
    
    // 搜索 列表 页面 filterObj = {EmployeeIdList,OrganizationIdList,RoleIdList}
    async searchData({ showList, keyword }, filterObj) {
        let { data } = await searchAllList({
            Type: showList,
            Name: keyword, ...filterObj
        });
        if (data && data instanceof Array) {
            data = initCheckboxState(data, this.state.selectedData);
            const allSearch = (tempArr) => {
                let depList = {
                        name: "部门",
                        type: 0,
                        children: []
                    },
                    roleList = {
                        name: "职责",
                        type: 1,
                        children: []
                    },
                    memList = {
                        name: "成员",
                        type: 2,
                        children: []
                    };
                depList.children = depList.children.concat(tempArr.filter(item => Number(item.type) === 0));
                roleList.children = roleList.children.concat(tempArr.filter(item => Number(item.type) === 1));
                memList.children = memList.children.concat(tempArr.filter(item => Number(item.type) === 2));
                /* tempArr.forEach(v => {
                    if (v.type === depList.type) {
                        depList.children.push(v);
                    }
                    if (v.type === roleList.type) {
                        roleList.children.push(v);
                    }
                    if (v.type === memList.type) {
                        memList.children.push(v);
                    }
                }); */
                let tempList = [];
                
                tempList.push(depList);
                tempList.push(roleList);
                tempList.push(memList);
                return tempList;
            };
            this.setState({
                searchDataArr: allSearch(data)
            });
        }
    }
    
    // 选中 搜索项 方法
    selectedSearch(item, e) {
        e.stopPropagation();
        switch (`${item.type}`) {
            case "0":
                this.initTabsData(`${item.type}`);
                break;
            case "1":
                let { rolesArr } = this.state;
                rolesArr.length = 0;
                rolesArr.push({
                    name: item.name,
                    type: `${item.type}`,
                    id: item.id
                });
                this.setState({
                    rolesArr
                });
                break;
            case "2":
                let { memArr } = this.state;
                memArr.length = 0;
                memArr.push({
                    name: item.name,
                    type: `${item.type}`,
                    id: item.id
                });
                this.setState({
                    memArr
                });
                this._getOrganazitionList();
        }
        this.setState({
            roleTabState: `${item.type}`,
            isSearch: false
        });
    }
    
    // 传 type
    initTabsData(tabType, loadingType) {
        let me = this;
        loadingType === "init" ? (me.state.roleLoading = true) : me.setState({
            roleLoading: true
        });
        let { selectTreeKeys } = me.state;
        let params = {};
        params = showFilterArr.filter(v => v.type === tabType)[0];
        let { type, isTree, idList } = params;
        switch (type) {
            case "0":
                let callBack = ({ id }) => {
                    me.initAuthority(id);
                    selectTreeKeys.length = 0;
                    selectTreeKeys.push(id);
                    me.setState({
                        selectTreeKeys
                    });
                };
                me._getOrganazitionList({
                    list: idList
                }, !me.state.selectedData.length ? callBack : null);
                break;
            case "1":
                me._getRoleList({
                    list: idList
                }, !me.state.selectedData.length ? ({ id }) => {
                    me.initAuthority(id);
                    // console.log(id);
                    me.setState({
                        selectRolesActive: id
                    });
                } : null);
                break;
            case "2":
                if (isTree) {
                    let callBack = ({ type, id, list }) => {
                        let { selectTreeKeys } = me.state;
                        selectTreeKeys.length = 0;
                        selectTreeKeys.push(id);
                        let callBack1 = ({ type, id }) => {
                            me.initAuthority(id);
                            me.setState({
                                selectRolesActive: id
                            });
                        };
                        me._getMemList({
                            type,
                            id
                        }, !me.state.selectedData.length ? callBack1 : null);
                        me.setState({
                            selectTreeKeys
                        });
                    };
                    me._getOrganazitionList({
                        list: idList
                    }, callBack);
                } else {
                    me._getMemList({
                        type: 2,
                        list: idList
                    });
                }
        }
    }
    
    // 获取 职责 筛选列表 list就是 职责 数组
    async _getRoleList(params, callBack) {
        let tempParams = {};
        if (params.list && params.list.length) {
            tempParams.RoleIdList = params.list;
        }
        let { data } = await getFilterRoleList(tempParams);
        this.setState({
            roleLoading: false
        });
        if (data && data instanceof Array) {
            data = this.state.selectedData.length ? initCheckboxState(data, this.state.selectedData) : data;
            this.setState({
                rolesArr: data
            }, () => {
                // 获取 成员 列表，如果需要
                callBack instanceof Function && callBack.call(this, {
                    type: 1,
                    id: data[0]["id"]
                });
            });
        }
    }
    
    // 统一获取 成员 列表 {type,id,list}，type:0 为 部门 成员,1 为 职责 成员,2 为 筛选 成员列表
    async _getMemList(params, callBack) {
        let { type } = params;
        let tempParams = {};
        switch (type) {
            case "0":
                tempParams.OrganziationId = params.id;
                break;
            case "1":
                tempParams.RoleId = params.id;
                break;
            case "2":
                tempParams.EmployeeIdList = params.list;
                break;
        }
        let { data } = await getFiltermemList({
            ...tempParams,
            size: 100
        });
        this.setState({
            roleLoading: false
        });
        if (data && data.employeeList instanceof Array && data.employeeList.length) {
            data.employeeList = this.state.selectedData.length ? initCheckboxState(data.employeeList, this.state.selectedData) : data.employeeList;
            this.setState({
                memArr: data.employeeList
            }, () => {
                callBack instanceof Function && callBack.call(this, {
                    type: 2,
                    id: data["employeeList"][0]["id"]
                });
            });
        } else {
            let tempArr = this.state.memArr;
            tempArr.length = 0;
            this.setState({
                memArr: tempArr
            });
        }
    }
    
    // 获取 筛选 部门 list
    async _getOrganazitionList(params, callBack) {
        let tempParams = {};
        if (params && params.list && params.list.length) {
            tempParams.OrganizationIds = params.list;
        } else {
            tempParams.ParentId = "";
        }
        
        let { data } = await getFilterOrganaziton(tempParams);
        this.setState({
            roleLoading: false
        });
        if (data && data instanceof Array) {
            this.setState({
                departArr: data
            }, () => {
                callBack instanceof Function && callBack.call(this, {
                    type: "0",
                    id: data[0]["id"]
                });
            });
        }
    }
    
    // 树 被 激活 的 逻辑,或者被选中的 逻辑
    selectTreeActive(type, key) {
        // console.log(type, key);
        if (!key) return;
        let { selectTreeKeys } = this.state,
            tempObj = {};
        selectTreeKeys.length = 0;
        selectTreeKeys.push(key);
        tempObj.selectTreeKeys = selectTreeKeys;
        // tempObj.filterLoading = true;
        type === "0" && (tempObj.roleLoading = true);
        this.setState({
            ...tempObj
        });
        type === "0" ? this._getMemList({
            type,
            id: key
        }, ({ id }) => {
            this.setState({
                selectRolesActive: id
            });
        }) : this.initAuthority(key);
    }
    
    // 职责 和 成员 选中
    selectRolesOrMem(v) {
        let { selectRolesActive } = this.state;
        if (selectRolesActive === v) return;
        this.setState({
            selectRolesActive: v
        }, () => {
            this.initAuthority(v);
        });
    }
    
    /* 操作权限 */
    changeCoperAuChecked(id, e) {
        const { checked, value } = e.target;
        let { coperAuConfig } = this.state;
        if (checked) {
            coperAuConfig[id]["checkedArr"].push(value);
            if (value !== CooperateStatus.look && coperAuConfig[id]["checkedArr"].indexOf(CooperateStatus.look) === -1) {
                coperAuConfig[id]["checkedArr"].push(CooperateStatus.look);
            }
            if (value === CooperateStatus.import && coperAuConfig[id]["checkedArr"].indexOf(CooperateStatus.add) === -1) {
                coperAuConfig[id]["checkedArr"].push(CooperateStatus.add);
            }
        } else {
            let existIndex = coperAuConfig[id]["checkedArr"].indexOf(value),
                otherIndex;
            coperAuConfig[id]["checkedArr"].splice(existIndex, 1);
            if ((otherIndex = coperAuConfig[id]["checkedArr"].indexOf(5)) !== -1 && value === CooperateStatus.add) {
                coperAuConfig[id]["checkedArr"].splice(otherIndex, 1);
            }
            value === CooperateStatus.look && (coperAuConfig[id]["checkedArr"].length = 0);
        }
        this.setState({
            coperAuConfig,
            isChange: true
        });
    }
    
    //自定义按钮 权限
    ChangeCustomButton = (id, e) => {
        const { checked } = e.target;
        let { CheckCustomButton } = this.state;
        if (typeof CheckCustomButton === "string") {
            CheckCustomButton = JSON.parse(CheckCustomButton);
        }
        if (checked) {
            CheckCustomButton.push(id);
        } else {
            CheckCustomButton = CheckCustomButton.filter(a => a !== id);
        }
        this.setState({
            CheckCustomButton: CheckCustomButton,
            isChange: true
        });
    };
    
    /* 字段权限 操作 */
    changeFieldAuChecked(id, type, subType, e) {
        // console.log(id, type, subType, e);
        let { fieldsArr, fieldNameArr, filterConditionArr } = this.state,
            checked = e.target.checked;
        let existItem = fieldsArr.filter(item => item.id === id)[0];
        const indexOf = fieldsArr.indexOf(existItem);
        existItem[type] = checked;
        (checked && type === "edit") && (existItem.show = checked);
        (!checked && type === "show") && (existItem.edit = checked);
        fieldsArr.splice(indexOf, 1, existItem);
        /* 如果 为 子表单 的 item项，去检查当前 对应的 子表单 */
        if (subType === "child") {
            let subform = fieldsArr.filter(item => item.id === existItem.formId)[0];
            let subformIndex = fieldsArr.indexOf(subform);
            if (!checked && fieldsArr.filter(d => d.formId === existItem.formId).every(d => !d[type])) {
                subform[type] = checked;
                fieldsArr.splice(subformIndex, 1, subform);
            }
        }
        (subType === "subform" || id === "all") && fieldsArr.forEach(item => {
            if ((item.formId === id && subType === "subform") || id === "all") {
                item[type] = checked;
                (checked && type === "edit") && (item.show = checked);
                (!checked && type === "show") && (item.edit = checked);
            }
        });
        /* 这里还要 对于  fieldNameArr 需要 初始化 show的 值*/
        fieldNameArr.forEach(item => {
            let existFieldItem = fieldsArr.filter(field => field.id === item.id)[0];
            if (existFieldItem) {
                item.show = existFieldItem.show;
                if (!existFieldItem.show) {
                    item.isFilter = false;
                    /* 对于 filterConditionArr 也要处理  */
                    let existFilterItem = filterConditionArr.filter(filter => filter.id === item.id)[0];
                    if (existFilterItem) {
                        let i = filterConditionArr.indexOf(existFilterItem);
                        filterConditionArr.splice(i, 1);
                    }
                }
            }
        });
        debugger;
        this.setState({
            fieldsArr,
            isChange: true,
            fieldNameArr,
            filterConditionArr
        });
    }
    
    changeSearchState(bool, e) {
        e.stopPropagation();
        this.state.isSearch !== bool && this.setState({
            isSearch: bool
        });
    }
    
    /* 跟新 数据 权限的 值 */
    updateFilterCondition(fieldNameArr, filterConditionArr) {
        debugger;
        this.setState({
            fieldNameArr,
            filterConditionArr,
            isChange: true
        });
    }
    
    /* 多选 存储 多种 数据 类型 */
    selectAuEvent(v, type, bool) {
        //debugger;
        // console.log("触发了", v, type, bool);
        let { selectedData, searchDataArr } = this.state,
            { id, name } = v,
            changeData = [],
            changeName = "",
            result = {};
        switch (Number(type)) {
            case 0:
                changeData = this.state.departArr;
                changeName = "departArr";
                break;
            case 1:
                changeData = this.state.rolesArr;
                changeName = "rolesArr";
                break;
            case 2:
                changeData = this.state.memArr;
                changeName = "memArr";
                break;
        }
        /* 如果 在 搜索数据中 存在 对应的值 ，需要 同时操作 */
        let typeSearchArr = searchDataArr.filter(item => item.type == type)[0];
        if (typeSearchArr && typeSearchArr.children.length) {
            let typeExistItem = typeSearchArr.children.filter(item => item.id === id)[0];
            if (typeExistItem) {
                let i = typeSearchArr.children.indexOf(typeExistItem);
                typeExistItem.checked = bool;
                typeSearchArr.children.splice(i, 1, typeExistItem);
                result.typeSearchArr = typeSearchArr;
            }
        }
        // console.log(changeName, changeData, searchDataArr);
        let changeExistItem = changeData.filter(i => i.id === id)[0];
        if (changeExistItem) {
            let i = changeData.indexOf(changeExistItem);
            changeExistItem.checked = bool;
            changeData.splice(i, 1, changeExistItem);
        }
        if (bool) {
            selectedData.push({
                id,
                name,
                type
            });
        } else {
            let existItem = selectedData.filter(i => i.id === id)[0];
            if (existItem) {
                let index = selectedData.indexOf(existItem);
                selectedData.splice(index, 1);
            }
        }
        result.selectedData = selectedData;
        result[changeName] = changeData;
        this.setState(result);
    }
    
    BeforeSelectAuEvent(v, type, bool) {
        let { BeforeSelectedData } = this.state;
        let KeepBeforeSelectedData = BeforeSelectedData.filter(item => item.id !== v.id);
        let DelBeforeSelectedData = BeforeSelectedData.filter(item => item.id === v.id);
        this.setState({
            BeforeSelectedData: KeepBeforeSelectedData,
            DelBeforeSelectedData: DelBeforeSelectedData.concat(this.state.DelBeforeSelectedData)
        });
    }
    
    render() {
        let { roleTabState, filterTabSate, coperAuConfig, CheckCustomButton, fieldsArr, isSearch, selectedData, BeforeSelectedData, departArr, rolesArr, memArr, searchDataArr, selectTreeKeys, selectRolesActive, fieldNameArr, filterConditionArr, FormTemplateVersionId, templateId, roleLoading, filterLoading } = this.state;
        let { formBody, formTemplateType } = this.props;
        let depProps = {
            draggable: false,
            treeData: departArr,
            isTree: false,
            isCheck: true,
            type: roleTabState,
            selectedData,
            onSelect: this.selectTreeActive.bind(this, ""),
            singleOrMultiple: "1",
            specialTree: true,
            selectedKeys: selectTreeKeys,
            checkboxEvent: this.selectAuEvent
        };
        let rolesProps = {
            rolesArr,
            isTree: false,
            isCheck: true,
            selectRolesOrMem: this.selectRolesOrMem,
            type: roleTabState,
            singleOrMultiple: "1",
            selectedData,
            // 有 成员的时候
            memArr,
            selectRolesActive,
            selectRolesGetMem: "",
            checkboxEvent: this.selectAuEvent
        };
        let memProps = {
            memArr,
            isTree: true,
            selectRolesOrMem: this.selectRolesOrMem,
            type: roleTabState,
            singleOrMultiple: "1",
            selectedData,
            isCheck: true,
            selectRolesActive,
            checkboxEvent: this.selectAuEvent,
            // 树的 props
            treeData: departArr,
            onSelect: this.selectTreeActive.bind(this, "0"),
            selectedKeys: selectTreeKeys
        };
        const coperAuProps = {
            coperAuConfig,
            CheckCustomButton: CheckCustomButton,
            formTemplateVersionId: this.state.FormTemplateVersionId,
            changeCoperAuChecked: this.changeCoperAuChecked,
            ChangeCustomButton: this.ChangeCustomButton,
            formBody
        };
        const fieldsAuProps = {
            fieldsArr,
            mainFormId: formBody instanceof Array ? formBody.filter(item => item.itemType === "Root")[0]["id"] : "",
            changeFieldAuChecked: this.changeFieldAuChecked
        };
        const filterConProps = {
            type: "authority",
            templateId,
            FormTemplateVersionId,
            fieldNameArr,
            isFixedFilter: true,
            filterConditionArr,
            containerClick: this.updateFilterCondition,
            updateFilterCondition: this.updateFilterCondition,
            mainFormId: formBody instanceof Array ? formBody.filter(item => item.itemType === "Root")[0]["id"] : ""
        };
        const searchComProps = {
            searchDataArr,
            showFilterArr,
            searchData: this.searchData,
            selectedSearch: this.selectedSearch,
            checkboxEvent: this.selectAuEvent
        };
        return (
            <div className={styles.auContainer} onClick={this.changeSearchState.bind(this, false)}>
                <div>
                    <div className={styles.title}>1.选择部门成员</div>
                    <Spin spinning={roleLoading}>
                        <div className={styles.selectedArea}>
                            {
                                BeforeSelectedData.map(v => (
                                    <div key={v.id} className={styles.selectedItem} style={{
                                        background: "rgba(25,255,183,0.1)"
                                    }}>
                                        <Icon className={styles.iconUser}
                                              type={v.type === "0" ? "apartment" : (v.type === "2" ? "user" : "team")}
                                              theme="outlined"/>
                                        {v.name}
                                        <Icon className={styles.iconClose} type="close" theme="outlined"
                                              onClick={this.BeforeSelectAuEvent.bind(this, v, v.type, false)}/>
                                    </div>
                                ))
                            }
                            {
                                selectedData.map((v, i) => (
                                    <div key={i} className={styles.selectedItem}>
                                        <Icon className={styles.iconUser}
                                              type={v.type === "0" ? "apartment" : (v.type === "2" ? "user" : "team")}
                                              theme="outlined"/>
                                        {v.name}
                                        <Icon className={styles.iconClose} type="close" theme="outlined"
                                              onClick={this.selectAuEvent.bind(this, v, v.type, false)}/>
                                    </div>
                                ))
                            }
                        </div>
                        <div className={styles.contentContainer}>
                            {
                                isSearch ? <SearchCom {...searchComProps} /> : (
                                    <Tabs style={{
                                        height: document.body.clientHeight - 230,
                                        paddingBottom: "42px"
                                    }} activeKey={roleTabState}
                                          onChange={this.switchTab.bind(this, "roleType")}
                                          tabBarExtraContent={<a onClick={this.changeSearchState.bind(this, true)}><Icon
                                              type="search"/></a>}>
                                        {
                                            showFilterArr.map((v, i) => (
                                                <TabPane tab={v.name} key={v.type} style={{
                                                    height: "calc(100% - 5px)",
                                                    overFlow: "scroll"
                                                }}>
                                                    {Number(roleTabState) === 0 && <Department {...depProps} />}
                                                    {Number(roleTabState) === 1 && <Roles {...rolesProps} />}
                                                    {Number(roleTabState) === 2 && <Member {...memProps} />}
                                                </TabPane>
                                            ))
                                        }
                                    </Tabs>
                                )
                            }
                        </div>
                    </Spin>
                </div>
                <div>
                    <div className={styles.title}>
                        <span>2.设置权限</span>
                        <Button type="primary" className={styles.save} style={{ right: "86px" }}
                                onClick={this.savePerData}>保存</Button>
                        <Button type="primary" className={styles.save}
                                onClick={ele => this.props.Save(true)}>发布</Button>
                    </div>
                    <Spin spinning={filterLoading}>
                        <div className={styles.contentContainer}>
                            <Tabs style={{
                                height: document.body.clientHeight - 142,
                                paddingBottom: "45px"
                            }} activeKey={filterTabSate}
                                  onChange={this.switchTab.bind(this, "filterType")}>
                                {
                                    (Number(formTemplateType) === 1 ? showCondArr.slice(1) : showCondArr).map((v, i) => (
                                        <TabPane tab={v.name} key={v.type}
                                                 style={{
                                                     overflowY: "auto",
                                                     paddingLeft: "1em",
                                                     position: "relative"
                                                 }}>
                                            {Number(filterTabSate) === 0 && <CoperAu {...coperAuProps} />}
                                            {Number(filterTabSate) === 1 && <FieldsAu {...fieldsAuProps} />}
                                            {Number(filterTabSate) === 2 && <FilterCondition {...filterConProps} />}
                                        </TabPane>
                                    ))
                                }
                            </Tabs>
                        </div>
                    </Spin>
                </div>
            </div>
        );
    }
}

export default DataAuthorityNew;
