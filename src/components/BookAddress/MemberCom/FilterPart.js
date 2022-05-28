import { Component } from "react";
import { Modal, Input, Icon, Button } from "antd";
import { List } from "immutable";
import DefaultUserMess from "../../../enums/DefaultUserMess";
import {
    getFiltermemList,
    getFilterOrganaziton,
    getFilterRoleList,
    searchAllList
} from "../../../services/BookAddress/BookAddress";
import styles from "./FilterPart.less";
import search from "./search.png";

import { Department, Roles, Member, Materiel, DefaultList } from "./FilterCom/FilterCom";
import TreeCom from "../TreeCom";

// 控制 选择列表 的 选择项 ，这里 有多选 和 单选，成员(有可能有树形结构可能没有)和组织架构一个类型，部门 树形一种类型,职责一种类型
/**
 *
 * showFilterArr中是 页面肯定会渲染的 tabs，里面 的 idList 来判断是否进行 筛选，length为 0 就全部，否者按照 id 进行筛选
 *
 controlFilterPart: {
    isShowModal: false,
    showFilterArr: [],//{type,isTree,name,idList} type: 1为 职责（这里也有isTree属性） ，0为 部门，2为 成员或者组织架构（有isTree字段），-1为 应用 列表,idList:[] 用于存储 需要筛选的 id 值
    headerTitle: "",
    singleOrMultiple:0,//0 为 单选，1 为 多选
    selectedData:[],//数组对象 {type,name,id}
    isFilter:2//筛选 的 类型 数据 0 1 2
 }
 //  实例
 // 调用的参数
 controlFilter({
                type,//动态参数
                isShowModal: true,
                showFilterArr: [
                    { type: "0", name: "部门",idList:[] },
                    { type: "1", name: "职责",idList:[],isTree:false },
                    { type: "2", name: "成员",idList:[], isTree: true },
                ],
                headerTitle: "成员列表",
                singleOrMultiple: 1,
                selectedData,
                isFilter:2//筛选 的 类型 数据 0 1 2
});
 // 这是方法
 controlFilter(state, action) {
    let { controlFilterPart } = state, { isShowModal, showFilterArr, headerTitle,singleOrMultiple,selectedData,isFilter } = action.payload;
    controlFilterPart["isShowModal"] = isShowModal;
    controlFilterPart["showFilterArr"] = showFilterArr;
    controlFilterPart["headerTitle"] = headerTitle;
    controlFilterPart["singleOrMultiple"] = singleOrMultiple;
    controlFilterPart["selectedData"] = selectedData;
    controlFilterPart["isFilter"] = isFilter;
    return { ...state, controlFilterPart }
}
 */

// 这个组件 目前只需要暴露 数据，必要的接口其他逻辑在里面完成
/**
 * 递归便利 treeData
 * @param {*} treeData
 * @param {*} key
 * @param {*} callback
 */
function operTreeData(treeData, key, callback) {
    treeData.forEach((v, i, arr) => {
        callback(v, key);
        if (v.children && v.children.length) {
            operTreeData(v.children, key, callback);
        }
    });
    return treeData;
}

// 初始化 数据 多选的 状态
function initCheckboxState(targetList, selectedData) {
    selectedData.length &&
    targetList.forEach(v => {
        selectedData.forEach(item => {
            if (v.id === item.id) {
                v.checked = true;
            }
        });
    });
    return targetList;
}

const defaultObj = {
    mem: [{ name: "当前用户", id: DefaultUserMess.currentMemId }],
    dep: [
        { name: "当前用户所在部门", id: DefaultUserMess.currentDepId },
        { name: "当前用户所在机构", id: DefaultUserMess.currentOrgId }
    ]
};
let time = null;

class FilterPart extends Component {
    constructor(props) {
        super(props);
        //console.log(props);
        let {
            controlFilterPart: { showFilterArr, selectedData }
        } = this.props;
        this.state = {
            tabState: showFilterArr[0]["type"],
            isSearch: false,
            selectedData: selectedData instanceof Array ? List(selectedData).toJS() : [],
            // 部门 tabs
            departArr: [], //这个是 树,统一存储点
            // 职责tabs
            rolesArr: [], //职责的 统一 存储 列表
            // 成员 tabs
            memArr: [], //成员的 统一 存储列表
            
            searchDataArr: { isFilter: false, data: [] }, //数据重新处理
            materDataArr: [],
            updateTreeData: [], //获取 在 tree的 数据
            
            selectTreeKeys: [], //对于 树 被激活，获取 成员 的存储值
            selectRolesActive: "", //职责 被 激活的 id
            
            defList: [] //默认参数,不管是 部门还是 成员
        };
        // this._searchData({});
        /* 这里 要加入 默认 选中项 */
        if (props.type) {
            if (props.type !== "default") {
                let userMess = localStorage.getItem("author");
                if (userMess) {
                    userMess = JSON.parse(userMess);
                    if (props.type === "mem") {
                        this.state.defList.push({ id: userMess.userId, name: userMess.userName });
                    }
                    if (props.type === "dep") {
                        this.state.defList.push({ id: userMess.currentDeptId, name: userMess.currentDeptName });
                        this.state.defList.push({
                            id: userMess.currentDepartmentId,
                            name: userMess.currentDepartmentName
                        });
                    }
                }
            } else {
                if (props.defaultType === "Member") {
                    this.state.defList.push.apply(this.state.defList, defaultObj.mem);
                }
                if (props.defaultType === "Department") {
                    this.state.defList.push.apply(this.state.defList, defaultObj.dep);
                }
            }
            this.state.defList = this.state.defList.length
                ? initCheckboxState(this.state.defList, this.state.selectedData)
                : this.state.defList;
        }
    }
    
    componentDidMount() {
        console.log("componentDidMount", this.props.controlFilterPart.showFilterArr);
        let initTab = this.props.controlFilterPart.showFilterArr[0];
        this.initTabsData(initTab.type);
    }
    
    componentWillReceiveProps(nextProps) {//异步props 在更新props的时候再调用一次
        let initTab = this.props.controlFilterPart.showFilterArr[0];
        let nextPropsinitTab = nextProps.controlFilterPart.showFilterArr[0];
        if (JSON.stringify(initTab) !== JSON.stringify(nextPropsinitTab)) {
            this.initTabsData(nextPropsinitTab.type, nextProps.controlFilterPart);
        }
    }
    
    // 搜索 列表 页面 filterObj = {EmployeeIdList,OrganizationIdList,RoleIdList}
    async _searchData({ showList, keyword }, filterObj) {
        let me = this;
        let { data } = await searchAllList({ Type: showList, Name: keyword, ...filterObj });
        if (data && data instanceof Array) {
            // 是否搜索全部
            let allSearch = tempArr => {
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
                tempArr.forEach(v => {
                    if (v.type === depList.type) {
                        depList.children.push(v);
                    }
                    if (v.type === roleList.type) {
                        roleList.children.push(v);
                    }
                    if (v.type === memList.type) {
                        memList.children.push(v);
                    }
                });
                let tempList = [];
                tempList.push(depList);
                tempList.push(roleList);
                tempList.push(memList);
                return tempList;
            };
            // 判断是全搜 还是 筛选 搜索
            let tempFilterList = filterObj ? Object.keys(filterObj) : [],
                resultArr = [];
            let isFilter = tempFilterList.some(v => filterObj[v].length);
            resultArr = isFilter ? data : allSearch(data);
            let { searchDataArr } = me.state;
            searchDataArr.isFilter = isFilter;
            searchDataArr.data = resultArr;
            me.setState({
                searchDataArr
            });
        }
    }
    
    // 传 type
    initTabsData = (tabType, props) => {
        debugger;
        // type: 1为 职责(有isTree) ，0为 部门，2为 成员或者组织架构（有isTree字段），-1为 应用 列表,idList:[] 用于存储 需要筛选的 id 值
        let me = this;
        let { showFilterArr } = props ? props : me.props.controlFilterPart,
            params = {};
        params = showFilterArr.filter(v => v.type === tabType)[0];
        // console.log(showFilterArr);
        let { type, isTree, name, idList } = params;
        switch (type) {
            case 0:
                if (isTree) {
                    let callBack = ({ type, id, list }) => {
                        me._getMemList({ type, id });
                        me.setState({
                            selectTreeKeys: [id]
                        });
                    };
                    me._getOrganazitionList({ list: idList }, callBack);
                } else {
                    me._getOrganazitionList({ list: idList });
                }
                break;
            case 1:
                let callBack = isTree
                    ? ({ type, id, list }) => {
                        me._getMemList({ type, id, list });
                        me.setState({
                            selectRolesActive: id
                        });
                    }
                    : "";
                me._getRoleList({ list: idList }, callBack);
                break;
            case 2:
                debugger;
                if (isTree) {
                    let callBack = ({ type, id, list }) => {
                        me._getMemList({ type, id });
                        me.setState({
                            selectTreeKeys: [id]
                        });
                    };
                    me._getOrganazitionList({ list: idList }, callBack);
                } else {
                    debugger;
                    me._getMemList({ type: 2, list: idList });
                }
        }
    };
    
    // 获取 职责 筛选列表 list就是 职责 数组
    async _getRoleList(params, callBack) {
        let tempParams = {};
        debugger;
        if (params.list && params.list.length) {
            // tempParams.RoleIdList = params.list;
            tempParams.RoleIds = params.list;
        }
        let { data } = await getFilterRoleList(tempParams);
        if (data && data instanceof Array) {
            let tempArr = this.state.selectedData.length ? initCheckboxState(data, this.state.selectedData) : data;
            this.setState(
                {
                    rolesArr: tempArr
                },
                () => {
                    // 获取 成员 列表，如果需要
                    callBack && callBack.call(this, { type: 1, id: data[0]["id"] });
                }
            );
        }
    }
    
    // 统一获取 成员 列表 {type,id,list}，type:0 为 部门 成员,1 为 职责 成员,2 为 筛选 成员列表
    async _getMemList(params) {
        let { type } = params;
        debugger;
        let tempParams = {};
        switch (type) {
            case 0:
                tempParams.OrganziationIds = [params.id];
                break;
            case 1:
                tempParams.RoleId = params.id;
                break;
            case 2:
                //tempParams.EmployeeIdList = params.list;
                tempParams.OrganziationIds = params.list;
                break;
            default:
        }
        
        let { data } = await getFiltermemList({ ...tempParams, size: 100 });
        if (data && data.employeeList instanceof Array) {
            let tempArr = this.state.selectedData.length
                ? initCheckboxState(data.employeeList, this.state.selectedData)
                : data.employeeList;
            this.setState({
                memArr: tempArr
            });
        }
    }
    
    // 获取 筛选 部门 list
    async _getOrganazitionList(params, callBack) {
        console.log("初始化");
        let tempParams = {};
        debugger;
        if (params.list && params.list.length) {
            // tempParams.OrganizationIds = params.list;
            tempParams.ScopedOrganizationIds = params.list;
        } else {
            if (this.props.controlFilterPart.selectedData && this.props.controlFilterPart.selectedData.length) {
                debugger;
                if (this.props.type === "dep") {
                    let id = [];
                    this.props.controlFilterPart.selectedData.map(item => {
                        id.push(item.id);
                    });
                    tempParams.ParentId = "";//id.toString();
                } else {
                    tempParams.ParentId = "";
                }
            }
        }
        // if (this.props.controlFilterPart.selectedData.length) {
        //     debugger
        //     if (this.props.type === "dep") {
        //         let id = [];
        //         this.props.controlFilterPart.selectedData.map(item => {
        //             id.push(item.id);
        //         });
        //         tempParams.ParentId = id.toString();
        //     } else {
        //         tempParams.ParentId = "";
        //     }
        // } else {
        //     if (params.list && params.list.length) {
        //         // tempParams.OrganizationIds = params.list;
        //         tempParams.ScopedOrganizationIds = params.list;
        //     }
        // }
        let { data } = await getFilterOrganaziton(tempParams);
        if (data && data instanceof Array) {
            this.setState(
                {
                    departArr: data
                },
                () => {
                    callBack instanceof Function && callBack.call(this, { type: 0, id: data[0]["id"] });
                }
            );
        }
    }
    
    switchTab = (tab) => {
        if (tab === this.state.tabState) return;
        this.setState({
            tabState: tab
        });
        this.initTabsData(tab);
    };
    
    changeSearchState = (bool) => {
        this.setState({
            isSearch: bool
        });
    };
    
    // 将树 的 treeData 反哺到 这个页面
    setTreeData = (treeData) => {
        this.setState({
            updateTreeData: treeData
        });
    };
    
    // 树 被 激活 的 逻辑,或者被选中的 逻辑
    selectTreeActive = (isCheck, key, ...args) => {
        let { selectTreeKeys } = this.state;
        isCheck ? this.selectDepart(key, ...args) : (selectTreeKeys.length = 0);
        selectTreeKeys.push(key);
        this.setState(
            {
                selectTreeKeys
            },
            () => {
                !isCheck && this._getMemList({ type: 0, id: key });
            }
        );
    };
    
    // 操作方法 区分 单选还是 多选模式,这个树的 多选 逻辑
    selectDepart = (key, ...args) => {
        let { selectedData } = this.state,
            bool,
            updateTreeData,
            { singleOrMultiple } = this.props.controlFilterPart;
        if (args[args.length - 1] instanceof Array) {
            bool = args[args.length - 2];
            updateTreeData = args[args.length - 1];
        } else {
            bool = args[args.length - 1];
            updateTreeData = this.state.updateTreeData;
        }
        // 单选模式 多选模式
        // 单选模式 重新进行 存储 数组，和内部用一个变量进行操作，分开操作
        let singleModel = (selectedData, bool, updateTreeData) => {
            if (!selectedData.length) {
                let nodeObj = args[0];
                let key = nodeObj.node.props.eventKey,
                    title = nodeObj["node"]["props"]["title"]["props"]["children"][0];
                selectedData = [{ id: key, name: title, type: 0 }];
            } else {
                selectedData.forEach(v => {
                    if (v["id"] === key) {
                        selectedData.length = 0;
                    } else {
                        let nodeObj = args[0];
                        let key = nodeObj.node.props.eventKey,
                            title = nodeObj["node"]["props"]["title"]["props"]["children"][0];
                        selectedData[0] = { id: key, name: title, type: 0 };
                    }
                });
            }
            return { departArr: updateTreeData, selectedData };
        };
        // 多选模式
        let multipleModel = (selectedData, bool, updateTreeData) => {
            let departArr = operTreeData(updateTreeData, key, v => {
                if (v.id === key) {
                    v.checked = v.checked === undefined ? true : bool === undefined ? !v.checked : bool;
                    if (v.checked) {
                        selectedData.push({
                            id: v.id,
                            type: 0,
                            name: v.name
                        });
                    } else {
                        for (let i = 0; i < selectedData.length; i++) {
                            let item = selectedData[i];
                            if (item.id === v.id) {
                                selectedData.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
            });
            return { departArr, selectedData };
        };
        let { departArr, selectedData: tempSelectedData } =
            singleOrMultiple === 0
                ? singleModel(selectedData, bool, updateTreeData)
                : multipleModel(selectedData, bool, updateTreeData);
        this.setState({
            departArr,
            selectedData: tempSelectedData
        });
    };
    
    // 对于 成员 选择 获取 成员列表
    selectRolesGetMem = (id) => {
        this.setState(
            {
                selectRolesActive: id
            },
            () => {
                this._getMemList({ type: 1, id });
            }
        );
    };
    
    // 定义 在 搜索中 选择的 方法
    searchSelectRolesOrMem = (item) => {
        let { name, type, id } = item,
            { selectedData } = this.state,
            {
                controlFilterPart: { singleOrMultiple, isFilter }
            } = this.props;
        let tempArr = isFilter === 2 ? this.state.memArr : this.state.departArr;
        let isExist = selectedData.some(v => v.id === id);
        if (isExist) return;
        singleOrMultiple === 0 ? (selectedData[0] = { name, type, id }) : selectedData.push({ name, type, id });
        tempArr.forEach(v => {
            if (v.id === item.id) {
                v.checked = true;
            }
        });
        this.setState({
            selectedData,
            [isFilter === 2 ? "memArr" : "departArr"]: tempArr
        });
    };
    
    // 分 单选 和 多选模式 不用于 搜索的 操作
    selectRolesOrMem = (key, type, bool) => {
        // console.log(key, type, bool);
        let { rolesArr, selectedData, memArr, materDataArr, defList, selectTreeKeys } = this.state,
            { singleOrMultiple } = this.props.controlFilterPart;
        let tempArr = [],
            name = "",
            result = {};
        switch (type) {
            case -1:
                tempArr = materDataArr;
                name = "materDataArr";
                break;
            case 1:
                tempArr = rolesArr;
                name = "rolesArr";
                break;
            case 2:
                tempArr = memArr;
                name = "memArr";
                break;
            case -2:
                tempArr = defList;
                name = "defList";
        }
        // console.log(tempArr);
        // 单选
        let singleModle = (selectedData, key, bool) => {
            // console.log(selectedData, bool);
            selectedData.length = 0;
            if (bool) {
                let { id, name } = tempArr.filter(item => item.id === key)[0];
                selectedData.push({ id, name, type });
            }
            return { selectedData };
        };
        // 多选
        let multipleModel = (selectedData, key, bool) => {
            // console.log(selectedData, key, bool,selectTreeKeys,type);
            let existItem = tempArr.filter(item => item.id === key)[0];
            const existIndex = tempArr.indexOf(existItem);
            existItem.checked = bool;
            tempArr.splice(existIndex, 1, existItem);
            if (bool) {
                let tempResult = { ...existItem, type };
                if (type === "2") {
                    tempResult.rootId = selectTreeKeys[0];
                    let currentItem = this.state.departArr.filter(item => item.id === tempResult.rootId)[0];
                    if (currentItem) {
                        tempResult.rootName = currentItem.name;
                    }
                }
                selectedData.push(tempResult);
            } else {
                let unselectedItem = selectedData.filter(item => item.id === existItem.id)[0];
                const index = selectedData.indexOf(unselectedItem);
                selectedData.splice(index, 1);
            }
            return { selectedData };
        };
        /* 如果 是在 设置 动态 默认参数 需要用到的方法 */
        let changeDelListState = (defList, key, bool) => {
            if (bool) return defList;
            let existItem = defList.filter(item => item.id === key)[0];
            if (existItem) {
                const i = defList.indexOf(existItem);
                existItem.checked = bool;
                defList.splice(i, 1, existItem);
            }
            return defList;
        };
        let { selectedData: tempSelectedData } =
            singleOrMultiple === 0 ? singleModle(selectedData, key, bool) : multipleModel(selectedData, key, bool);
        result = {
            [name]: tempArr,
            selectedData: tempSelectedData
        };
        if (type !== -2 && this.props.type && this.props.type !== "default") {
            result["defList"] = changeDelListState(defList, key, bool);
        }
        this.setState(result);
    };
    
    render() {
        
        //console.log(this.props.controlFilterPart.showFilterArr);
        let {
            controlFilterPart: { isShowModal, showFilterArr, headerTitle, singleOrMultiple, isFilter },
            controlFilter,
            confirmSubmit
        } = this.props;
        let {
            tabState,
            isSearch,
            selectedData,
            departArr,
            rolesArr,
            memArr,
            searchDataArr,
            materDataArr,
            defList,
            selectTreeKeys,
            selectRolesActive
        } = this.state;
        // console.log(searchDataArr, memArr);
        let { selectRolesOrMem } = this;
        // 获取 成员 是否有树结构
        let memIsTree, rolesIsTree, depIsTree;
        showFilterArr.forEach(v => {
            if (v.type === 2) {
                memIsTree = v.isTree;
            }
            if (v.type === 1) {
                rolesIsTree = v.isTree;
            }
            if (v.type === 0) {
                depIsTree = v.isTree;
            }
        });
        
        let depProps = {
            draggable: false,
            treeData: departArr,
            isTree: depIsTree,
            isCheck: !!!depIsTree,
            type: tabState,
            selectedData, //初始化 选中的 部门
            onSelect: this.selectTreeActive.bind(this, !!!depIsTree),
            singleOrMultiple,
            setTreeData: this.setTreeData.bind(this),
            // 有成员 的时候
            memArr,
            selectRolesOrMem: selectRolesOrMem.bind(this),
            selectedKeys: depIsTree ? selectTreeKeys : ""
        };
        let rolesProps = {
            rolesArr,
            isTree: rolesIsTree,
            selectRolesOrMem: selectRolesOrMem.bind(this),
            type: tabState,
            singleOrMultiple,
            selectedData,
            // 有 成员的时候
            memArr,
            selectRolesActive,
            selectRolesGetMem: this.selectRolesGetMem.bind(this)
        };
        let memProps = {
            memArr,
            isTree: memIsTree,
            selectRolesOrMem: selectRolesOrMem.bind(this),
            type: tabState,
            singleOrMultiple,
            selectedData,
            // 树的 props
            treeData: departArr,
            onSelect: memIsTree ? this.selectTreeActive.bind(this, false) : "",
            selectedKeys: memIsTree ? selectTreeKeys : ""
        };
        let materProps = {
            materDataArr,
            singleOrMultiple,
            type: tabState,
            selectRolesOrMem: selectRolesOrMem.bind(this)
        };
        let defProps = {
            defList,
            selectRolesOrMem: selectRolesOrMem.bind(this),
            type: tabState,
            singleOrMultiple,
            selectedData
        };
        // console.log(this.props);
        return (
            <Modal
                title={headerTitle}
                visible={isShowModal}
                centered={true}
                destroyOnClose={true}
                style={{ height: "auto" }}
                // maskStyle={{position: "absolute"}}
                footer={null}
                // getContainer={() => document.getElementById('Boots')}
                onCancel={() => {
                    controlFilter && controlFilter(false);
                }}
                onOk={() => {
                }}
                width={620}
                maskClosable={false}
            >
                <div
                    onClick={() => {
                        this.changeSearchState(false);
                    }}
                >
                    <div className={styles.selectedArea}>
                        {selectedData.map((v, i) => {
                            let item = (
                                <div key={i} className={styles.selectedItem}>
                                    <Icon
                                        className={styles.iconUser}
                                        type={v.type === 0 ? "fork" : v.type === 2 ? "user" : "team"}
                                        theme="outlined"
                                    />
                                    {v.name}
                                    <Icon
                                        className={styles.iconClose}
                                        type="close"
                                        theme="outlined"
                                        onClick={() => {
                                            switch (v.type) {
                                                case -1:
                                                    this.selectRolesOrMem(v.id, v.type);
                                                    break;
                                                case 0:
                                                    this.selectDepart(v.id, false);
                                                    break;
                                                case 1:
                                                    this.selectRolesOrMem(v.id, v.type);
                                                    break;
                                                case 2:
                                                    this.selectRolesOrMem(v.id, v.type);
                                                    break;
                                                case -2:
                                                    this.selectRolesOrMem(v.id, v.type);
                                                    break;
                                            }
                                        }}
                                    />
                                </div>
                            );
                            if (singleOrMultiple === 0 && i === selectedData.length - 1) {
                                return item;
                            }
                            if (singleOrMultiple === 1) {
                                return item;
                            }
                        })}
                    </div>
                    {isSearch && (
                        <Input
                            autoFocus
                            onClick={e => {
                                e.stopPropagation();
                            }}
                            className={styles.searchInput}
                            onChange={e => {
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
                                    let showList = isFilter === undefined ? filterTypeArr : [isFilter];
                                    this._searchData(
                                        { showList, keyword: e.target.value },
                                        { EmployeeIdList, OrganizationIdList, RoleIdList }
                                    );
                                }, 300);
                            }}
                        />
                    )}
                    {!isSearch && tabState !== -1 && (
                        <div className={styles.tabs}>
                            {showFilterArr.map((v, i) => (
                                <div key={i}>
                                    {
                                        <div
                                            className={`${styles.tabItem} ${
                                                tabState === v.type ? styles.tabItemActive : ""
                                                }`}
                                            onClick={() => {
                                                this.switchTab(v.type);
                                            }}
                                        >
                                            {v.name}
                                        </div>
                                    }
                                </div>
                            ))}
                            <div className={styles.tabSearch}>
                                <img
                                    src={search}
                                    onClick={e => {
                                        e.stopPropagation();
                                        this.changeSearchState(true);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    {isSearch && (
                        <div className={styles.mainContent + " " + styles.mainSearch} style={{ overflowY: "auto" }}>
                            {searchDataArr.isFilter ? (
                                searchDataArr.data.length ? (
                                    searchDataArr.data.map(v => (
                                        <div
                                            key={v.id}
                                            className={styles.searchResult}
                                            onClick={() => {
                                                this.searchSelectRolesOrMem(v);
                                                !isFilter &&
                                                this.setState({
                                                    tabState: v.type
                                                });
                                            }}
                                        >
                                            {v.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.searchNo}>
                                        暂无相关
                                        {(type => {
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
                                        })(isFilter)}
                                    </div>
                                )
                            ) : (
                                searchDataArr.data.map((item, index) => (
                                    <div key={index}>
                                        <div className={styles.searchTitle}>{item.name}</div>
                                        {item.children.length ? (
                                            item.children.map((v, i) => (
                                                <div
                                                    key={v.id}
                                                    className={styles.searchResult}
                                                    onClick={() => {
                                                        this.searchSelectRolesOrMem(v);
                                                        !isFilter &&
                                                        this.setState({
                                                            tabState: item.type
                                                        });
                                                    }}
                                                >
                                                    {v.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.searchNo}>
                                                暂无相关
                                                {(type => {
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
                                                })(item.type)}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {!isSearch && (
                        <div
                            className={styles.mainContent}
                            style={{
                                overflowY: tabState === 2 ? "hidden" : "auto",
                                borderTop: tabState === -1 ? "1px solid #E0E0E0" : "none"
                            }}
                        >
                            {tabState === -1 && <Materiel {...materProps} />}
                            {tabState === 0 && <Department {...depProps} />}
                            {tabState === 1 && <Roles {...rolesProps} />}
                            {tabState === 2 && <Member {...memProps} />}
                            {tabState === -2 && <DefaultList {...defProps} />}
                        </div>
                    )}
                    <div className={styles.footer}>
                        {/* <div className={styles.footerLeft}>
                            <Button>通讯录</Button>
                        </div> */}
                        <div className={styles.footerRight}>
                            <Button
                                className={styles.footerBtn}
                                onClick={() => {
                                    // console.log('------------调试------------');
                                    // console.log(selectedData, 'selectData');
                                    // console.log('------------调试------------');
                                    // debugger;
                                    // if (!selectedData.length) return;
                                    controlFilter && controlFilter(true);
                                    confirmSubmit && confirmSubmit(selectedData);
                                }}
                            >
                                确定
                            </Button>
                            <Button
                                onClick={() => {
                                    controlFilter && controlFilter(false);
                                }}
                            >
                                取消
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default FilterPart;
