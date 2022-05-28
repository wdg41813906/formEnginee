import { Map, List, is } from 'immutable';
import moment from "moment";
import { Guid, optionObj } from "../../utils/com";
import { getFiltermemList, getFilterOrganaziton, getFilterRoleList, searchAllList } from "../../services/BookAddress/BookAddress"


const data = {
    name: '',//名称
    desc: '',//描述
    //操作权限
    operation: [{
        formId: '1',//表单id
        formName: '主表',//主表
        keys: []
    }, {
        formId: '1-1',//表单id
        formName: '子表1',//子表1
        keys: []
    }, {
        formId: '1-2',//表单id
        formName: '子表2',//子表2
        keys: []
    }],
    //字段权限
    formItem: [{
        id: Guid(),
        name: '姓名',//名称
        formId: '1',
    }, {
        id: Guid(),
        name: '性别',//名称
        formId: '1',
    }, {
        id: Guid(),
        name: '年龄',//名称
        formId: '1',
    }, {
        id: Guid(),
        name: '子表1字段1',//名称
        formId: '1-1',
    }, {
        id: "1-1",
        name: '子表1',//名称
        formId: '1',
        type: "subform"
    }, {
        id: "1-2",
        name: '子表2',//名称
        formId: '1',
        type: "subform"
    }, {
        id: Guid(),
        name: '子表1字段2',//名称
        formId: '1-1',
    }, {
        id: Guid(),
        name: '金额',//名称
        formId: '1',
    }, {
        id: Guid(),
        name: '子表2字段1',//名称
        formId: '1-2',
    }, {
        id: Guid(),
        name: '子表2字段2',//名称
        formId: '1-2',
    }, {
        id: Guid(),
        name: '子表2字段3',//名称
        formId: '1-2',
    },],
    //数据权限
    data: [{
        type: 0,//条件类型 控件 提交人 提交时间 更新时间  （根据valueType生成不同的conditionFilter）
        condition: {},
    }],
    //用户列表
    users: {
        dep: [{
            id: '',
            name: ''//名称
        }],//部门
        role: [],//职责
        member: []//成员
    }
}
// 搜素 的方法
let allSearch = (tempArr) => {
    let depList = {
        name: "部门",
        type: 0,
        children: []
    }, roleList = {
        name: "职责",
        type: 1,
        children: []
    }, memList = {
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
    return tempList
}
const showCondArr = [
    { type: "0", name: "操作权限", },
    { type: "1", name: "字段权限", },
    { type: "2", name: "数据权限", },
]
const showFilterArr = [
    { type: "0", name: "部门", idList: [] },
    { type: "1", name: "职责", idList: [], isTree: false },
    { type: "2", name: "成员", idList: [], isTree: true },
]
export default {
    namespace: 'dataAuthorityNew',
    state: {
        configData: data,
        roleTabState: showFilterArr[0]["type"],
        filterTabSate: showCondArr[0]["type"],
        selectedData: [],
        isSearch: false,
        // 部门 tabs
        departArr: [], //这个是 树,统一存储点
        // 职责tabs
        rolesArr: [], //职责的 统一 存储 列表
        // 成员 tabs
        memArr: [], //成员的 统一 存储列表

        searchDataArr: [],//搜索的数据
        updateTreeData: [], //获取 在 tree的 数据

        selectTreeKeys: [],//对于 树 被激活，获取 成员 的存储值
        selectRolesActive: "",//职责 被 激活的 id
        // 数据权限数据
        coperAuConfig: data.operation.reduce((prev, next) => { //操作权限
            prev[next.formId] = {
                name: next.formName,
                checkedArr: next.keys
            }
            return prev;
        }, {}),
        fieldsArr: data.formItem, //字段权限
    },
    effects: {
        *initTabsData(action, { call, put, select }) {

        },
        // 获取 筛选 部门 list
        *getOrganazitionList(action, { call, put, select }) {
            let tempParams = {};
            if (action.params && action.params.list && action.params.list.length) {
                tempParams.OrganizationIds = action.params.list;
            } else {
                tempParams.ParentId = "";
            }
            let { data } = yield getFilterOrganaziton(tempParams);
            if (data && res.data instanceof Array) {
                yield put({ type: "updateState", payload: { departArr: data } })
            }
        },
        // 获取 职责 筛选列表 list就是 职责 数组
        *getRoleList(action, { call, put, select }) {
            let tempParams = {};
            if (action.params.list && action.params.list.length) {
                tempParams.RoleIdList = action.params.list;
            }
            let { data } = yield getFilterRoleList(tempParams);
            if (data && res.data instanceof Array) {
                yield put({ type: "updateState", payload: { rolesArr: data } })
                // 获取 成员 列表，如果需要
                // callBack instanceof Function && callBack.call(me, { type: 1, id: res.data[0]["id"] });
            }
        },
        // 统一获取 成员 列表 {type,id,list}，type:0 为 部门 成员,1 为 职责 成员,2 为 筛选 成员列表
        *getMemList(action, { call, put, select }) {
            let { type, id, list } = action.params;
            let tempParams = {};
            switch (type) {
                case "0":
                    tempParams.OrganziationId = id;
                    break;
                case "1":
                    tempParams.RoleId = id;
                case "2":
                    tempParams.EmployeeIdList = list;
            }
            let { data } = yield getFiltermemList({ ...tempParams, size: 100 })
            if (data.employeeList && data.employeeList instanceof Array) {
                yield put({ type: "updateState", payload: { memArr: data.employeeList } })
            }
        },
        // 搜索 列表 页面 filterObj = {EmployeeIdList,OrganizationIdList,RoleIdList}
        *searchData(action, { call, put, select }) {
            // { showList, keyword }, filterObj
            let { data } = yield searchAllList({ Type: action.showList, Name: action.keyword, ...action.filterObj });
            if (data && data instanceof Array) {
                yield put({ type: "updateState", payload: { searchData: allSearch(data) } })
            }
        }
    },
    reducers: {
        updateState(state, action) {
            return { ...state, ...action.payload }
        }
    }
}
