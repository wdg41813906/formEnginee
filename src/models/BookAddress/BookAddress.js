import { Guid } from "../../utils/com";
import {getOrganazition} from "../../services/BookAddress/BookAddress"


// 递归便利 treeData
function operTreeData(treeData, key, callback) {
    treeData.forEach((v, i, arr) => {
        callback(v, key);
        if (v["children"] && v["children"].length) {
            operTreeData(v["children"], key, callback);
        }
    })
    return treeData;
}

export default {
    namespace: "bookAddress",
    state: {
        treeData: [
            /* {
                title: "我的团队", key: Guid(), children: [
                    { title: "总经办", key: Guid(), children: [{ title: "zaa", key: Guid() }, { title: "zbb", key: Guid() }, { title: "zcc", key: Guid() }, { title: "zdd", key: Guid() }, { title: "zee", key: Guid() }, { title: "zff", key: Guid() }] },
                    { title: "财务", key: Guid(), children: [{ title: "caa", key: Guid() }, { title: "cbb", key: Guid(), children: [{ title: "zaaa", key: Guid() }] }] }
                ]
            },
            { title: "test", key: Guid(),isLeaf: true } */
        ], //成员的 树形结构数据
        selectedKeys: [], //选中的 树形结构,这个变量 放到Member.js的组件里，这里不需要
        // selectedPartKeys: [],//选中的树形 部门，这个应该于上面的 结构不同，需要进行处理 {key,title}，这个也应该放到member组件里
        // showSelectedModal: false,//选择成员模态,这里不需要了，放到 member.js中
        // showAddMemModal: false,//添加成员模态,这里不需要了，放到 member.js中
        adminMem: { id: Guid(), name: "系统管理员", memClick: true, type: 0 },//这是系统管理员
        leftManageListArr: [
            { id: Guid(), name: "Write READMe", memHover: false, memClick: false, type: 1 },
            { id: Guid(), name: "Create some examplesfsdfsds", memHover: false, memClick: false, type: 1 },
            { id: Guid(), name: "make it generic enough", memHover: false, memClick: false, type: 1 },
            { id: Guid(), name: "spanm in", memHover: false, memClick: false, type: 1 }
        ],//这个是测试 数据
        activeManage: {},//激活的管理员类型
        // filterPart数据
        // selectedData: [],//被选择的 数据 【id,type(选择的类型),title,】
        /* departArr: [
            {
                title: "北京思源", checked: false, key: Guid(), children: [
                    { title: "总经办", checked: false, key: Guid() },
                    { title: "移动互联", checked: false, key: Guid() },
                    { title: "财务部", checked: false, key: Guid() },
                    { title: "事业部", checked: false, key: Guid() },
                ]
            },
            { title: "test", showEditMemModal: false, key: Guid() }
        ],//部门数据 */
        /* rolesArr: [
            { title: "test1", checked: false, key: Guid() },
            { title: "test2", checked: false, key: Guid() },
            { title: "test3", checked: false, key: Guid() },
            { title: "test4", checked: false, key: Guid() },
            { title: "test1", checked: false, key: Guid() },
            { title: "test2", checked: false, key: Guid() },
            { title: "test3", checked: false, key: Guid() },
            { title: "test4", checked: false, key: Guid() },
            { title: "test1", checked: false, key: Guid() },
            { title: "test2", checked: false, key: Guid() },
            { title: "test3", checked: false, key: Guid() },
            { title: "test4", checked: false, key: Guid() },
            { title: "test1", checked: false, key: Guid() },
            { title: "test2", checked: false, key: Guid() },
            { title: "test3", checked: false, key: Guid() },
            { title: "test4", checked: false, key: Guid() },
        ],//职责 数据 */
        /* memArr: [
            { title: "辜强", checked: false, key: Guid() },
            { title: "许知远", checked: false, key: Guid() },
            { title: "杜家荣", checked: false, key: Guid() },
            { title: "胡阳", checked: false, key: Guid() },
            { title: "辜强", checked: false, key: Guid() },
            { title: "许知远", checked: false, key: Guid() },
            { title: "杜家荣", checked: false, key: Guid() },
            { title: "胡阳", checked: false, key: Guid() },
            { title: "辜强", checked: false, key: Guid() },
            { title: "许知远", checked: false, key: Guid() },
            { title: "杜家荣", checked: false, key: Guid() },
            { title: "胡阳", checked: false, key: Guid() },
            { title: "辜强", checked: false, key: Guid() },
            { title: "许知远", checked: false, key: Guid() },
            { title: "杜家荣", checked: false, key: Guid() },
            { title: "胡阳", checked: false, key: Guid() },
        ],//成员数据 */
        /* searchDataArr: [
            {
                title: "部门",
                type: 0,
                children: []
            },
            {
                title: "职责",
                type: 1,
                children: []
            },
            {
                title: "成员",
                type: 2,
                children: []
            }
        ],//搜索的 数据 */
        /* materDataArr: [
            { title: "物资采购计划审批流程", key: Guid(), icon: "", checked: false },
            { title: "未命名应用", key: Guid(), icon: "", checked: false },
            { title: "简道云进销存", key: Guid(), icon: "", checked: false },
            { title: "人事管理系统", key: Guid(), icon: "", checked: false },
            { title: "仪表盘", key: Guid(), icon: "", checked: false },
        ], */
        // 控制 选择列表 的 选择项 ，这里 有多选 和 单选，成员(有可能有树形结构可能没有)和组织架构一个类型，部门 树形一种类型,职责一种类型
        controlFilterPart: {
            isShowModal: false,
            showFilterArr: [],//{type,isTree,name,idList} type: 1为 职责 ，0为 部门，2为 成员或者组织架构（这里才有isTree字段），-1为 应用 列表,idList:[] 用于存储 需要筛选的 id 值
            headerTitle: "",
            singleOrMultiple:0,//0 为 单选，1 为 多选
            controlFilter:[],
            isFilter:""
        },
        // 职责tab的左边的数据
        /* leftRolesListArr: [
            { id: Guid(), name: "test1", memHover: false, memClick: true, type: 1 },
            { id: Guid(), name: "test2", memHover: false, memClick: false, type: 1 },
            { id: Guid(), name: "test3", memHover: false, memClick: false, type: 1 },
            { id: Guid(), name: "test4", memHover: false, memClick: false, type: 1 }
        ], */
        // 职责tab的 成员数据
        /* rolesMainArr: [
            { id: Guid(), name: "李紫能", dep: "移动互联事业部" },
            { id: Guid(), name: "王小波", dep: "移动互联事业部" },
            { id: Guid(), name: "辜强", dep: "移动互联事业部" },
            { id: Guid(), name: "跟良缘", dep: "移动互联事业部" },
            { id: Guid(), name: "杜家荣", dep: "移动互联事业部" },
        ], */
        // rolesSelectedKeys:[],//被选中 需要操作的 keys
    },
    subscriptions: {

    },
    effects: {
        *getOrganazition(action,{select,put,call}){
            let {data} = yield call(getOrganazition,{parentId:"",type:0});
            if(data){
                yield put({type:"initOrganazition",payload:{data}});
            }
        }
    },
    reducers: {
        // 初始化 树 的数据
        initOrganazition(state,action){
            let {data} = action.payload;
            return {...state,treeData:data}
        },
        operMemModal(state, action) {
            let { treeData } = state, { key, callback } = action.payload;
            let tempData = operTreeData(treeData, key, callback);
            return { ...state, treeData: tempData };
        },
        /* selectedKeys(state, action) {
            let { selectedKeys } = state, { key } = action.payload;
            selectedKeys[0] = key;
            return { ...state, selectedKeys };
        }, */
        // 操作模态
        /* operSelectedModal(state, action) {
            let { showModal } = action.payload;
            return { ...state, showSelectedModal: showModal }
        }, */
        /* operAddMemModal(state, action) {
            let { showModal } = action.payload;
            return { ...state, showAddMemModal: showModal }
        }, */
        // 左边统一的 编辑框隐藏
        adminClick(state, action) {
            let { leftManageListArr, adminMem } = state;
            leftManageListArr.forEach(v => {
                v["memClick"] = false;
            });
            adminMem["memClick"] = true;
            return { ...state, leftManageListArr, adminMem }
        },
        // 让 系统管理员失去 焦点
        adminUnfocus(state, action) {
            let { adminMem } = state;
            adminMem["memClick"] = false;
            return { ...state, adminMem }
        },
        // 激活 对应的管理员
        focusManage(state, action) {
            let { activeManage } = state, { item } = action.payload;
            !activeManage["id"] && (activeManage = item);
            if (activeManage["id"] && activeManage["id"] !== item["id"]) {
                activeManage = item;
            }
            return { ...state, activeManage }
        },
        // 控制 通用 成员列表 显示
        controlFilter(state, action) {
            let { controlFilterPart } = state, { isShowModal, showFilterArr, headerTitle,singleOrMultiple,selectedData,isFilter } = action.payload;
            controlFilterPart["isShowModal"] = isShowModal;
            controlFilterPart["showFilterArr"] = showFilterArr;
            controlFilterPart["headerTitle"] = headerTitle;
            controlFilterPart["singleOrMultiple"] = singleOrMultiple;
            controlFilterPart["selectedData"] = selectedData;
            controlFilterPart["isFilter"] = isFilter;
            return { ...state, controlFilterPart }
        },
        // 职责页面的 删除
        rolesDelete(state,action){
            let {arr} = action.payload;
            let temp
        },
        // 职责 被选中 需要操作的 方法
        /* changeRolesSelectedKeys(state,action){
            let {selectedKeys} = action.payload;
            return {...state,rolesSelectedKeys:selectedKeys}
        }, */
        /* // 改变 最后 选择的部门
        changePart(state,action){
            let{selectedPartArr} = action.payload;
            return {...state,selectedPartKeys:selectedPartArr}
        }, */
    }
}
