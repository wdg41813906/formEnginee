import { Component } from "react"
//import ReactDOM from 'react-dom';
import { Layout, Input, Tree, Icon, Select, Button, Modal, message } from "antd"
import styles from "./Member.less"
import { Guid } from "../../utils/com";
import {
    searchDepData, getFiltermemList, getMemDetail, removeMemList, setDep, getFixedDep,
    newMember, getOrganazition, confirmImportMem, modifyMem, reviseDep, syncOrgAndUser
} from "../../services/BookAddress/BookAddress"

import AddMember from "./MemberCom/AddMember"
import TreeCom from "./TreeCom"
import SelectPart from "./MemberCom/SelectPart";
import MemRightDep from "./MemberCom/MemRightDep"
import MemRightDetail from "./MemberCom/MemRightDetail";
import { Permission } from '../../utils/PlatformConfig'
const Search = Input.Search;
const { Sider, Content } = Layout;
//const Option = Select.Option;
const confirm = Modal.confirm;
const columns = [{
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 100,
    type: "string",
    id: Guid(),
    parentId: null,
    isData: true
}, {
    title: '职务',
    dataIndex: 'position',
    key: 'position',
    width: 100,
    type: "string",
    id: Guid(),
    parentId: null,
    isData: true
}, {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    width: 175,
    type: "string",
    id: Guid(),
    parentId: null,
    isData: true
}, {
    title: '手机',
    dataIndex: 'mobile',
    key: 'mobile',
    width: 150,
    type: "string",
    id: Guid(),
    parentId: null,
    isData: true
}, {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 200,
    type: "string",
    id: Guid(),
    parentId: null,
    isData: true
}];
class Member extends Component {
    constructor(props) {
        super(props);
        let selectedKeys = [];
        selectedKeys.push(props.treeData[0]["id"]);
        this.state = {
            showSelectedModal: false,//选择成员模态
            showAddMemModal: false,//添加成员模态,
            searchDepArr: [],
            searchMemArr: [],
            pageIndex: 1,
            keyWord: "",
            selectedKeys,//memeber外面的 tree
            selectedName: props.treeData[0]["name"],
            storageSelectedName: "",//这个是 存储 在搜索之前的 名字
            selectedPartKeys: [],//部门选择 的 tree要的{key,title,新增 type}
            selectOkType: 0,//选择 部门 确认 按钮 的行为类型，0 为 设置所在部门，1 为 新增 添加成员,2 为 从其他部门移入
            // 这个是 成员table的数据
            tableLoad: true,
            memTableData: [],
            memPageSize: 20,
            memPageIndex: 1,
            memTotalPage: 0,
            // 成员详情数据
            memDetailData: "",
            // 数据显示的类型
            showListOrDetail: 0, //0表示显示 列表，1 表示详情
            searchSelectedKeys: [], //搜索是默认选中 的 keys
            selectedMemberArr: [], //选中 操作 的 成员 arr
            memAndDepTreeData: [], //这是存储 特殊的 树结构（就是有 成员 和 部门）
            editOrAdd: 0, //判断 是 编辑还是添加 成员 0 为 添加，1 为 编辑
        }
        // this._getMixedDep(["796224d8-0b66-421d-ae1e-01e509e93ec1","dcd24874-1e96-4b3d-bbf6-01e3d13fa83f","f23a1c2f-d813-4218-a8b8-046bba1e65d9"]);
        // this._getMemAndDepTree("30000000-0000-0000-0000-000000000000");
    }
    componentWillMount() {
        this._getMemDataTable();
    }
    // 修改成员 信息
    _modifyMemData(params, callBack, id) {
        let me = this;
        var newParams = { ...params, ...{ Platform: Permission } }
        modifyMem(newParams).then(res => {
            // console.log(res);
            if (res.data.isValid) {
                callBack.call(this, id);
            }
        }, err => {
            console.log(err);
        });
    }
    // 点击 打开 编辑 成员 模态
    clickEidtMemModal() {
        let me = this;
        let tempArr = [];
        me.state.memDetailData && me.state.memDetailData.organizationObjects.forEach(v => {
            tempArr.push({ type: v.type, key: v.id, title: v.name });
        });
        this.setState({
            editOrAdd: 1,
            selectOkType: 1,
            selectedPartKeys: tempArr
        }, () => {
            this.operAddMemModal(true);
        });
    }
    // 确定 编辑 成员  保存
    confirmSaveMem(params, id) {
        let me = this;
        me._modifyMemData(params, me._getMemDetailData, id);
        me.operAddMemModal(false);
    }
    // 获取 特殊的 树结构
    _getSpecialTreeData(callBack) {
        let me = this;
        getOrganazition({ parentId: "", type: 1 }).then(res => {
            // console.log(res);
            if (res.data) {
                me.setState({
                    memAndDepTreeData: res.data,
                    selectOkType: 2,
                    selectedPartKeys: []
                }, () => {
                    callBack.call(me);
                });
            }
        }, err => {
            console.log(err);
        });
    }
    // 从其他部门 移入
    importFromOtherDep() {
        let callBack = () => {
            this.operSelectedModal(true);
        }
        this._getSpecialTreeData(callBack);
    }
    // 确认 移入 的接口
    _confirmImportMemData(params, callBack) {
        let me = this;
        var newParams = { ...params, ...{ Platform: Permission } };
        confirmImportMem(newParams).then(res => {
            console.log(res);
            if (res.data.isValid) {
                me.setState({
                    memPageIndex: 1,
                    selectedMemberArr: []
                }, () => {
                    callBack.call(me)
                });
            }
        }, err => {
            console.log(err);
        });
    }
    // 确定 从 其他部门 移入
    importOtherDepData(selectedPartKeys) {
        if (!selectedPartKeys.length) return;
        let tempObj = {};
        tempObj.OrganizationIds = [],
            tempObj.EmployeeIds = [];
        tempObj.OrganizationId = this.state.selectedKeys[0];
        selectedPartKeys.forEach(v => {
            if (v.type == 0) {
                tempObj.OrganizationIds.push(v.key);
            }
            if (v.type == 1) {
                tempObj.EmployeeIds.push(v.key);
            }
        });
        this.operSelectedModal(false);
        this._confirmImportMemData(tempObj, this._getMemDataTable);
    }
    // 添加成员接口
    _newMemberData(params, callBack) {
        let me = this;

        var newParams = { ...params, ...{ Platform: Permission } }
        newMember(newParams).then(res => {
            console.log(res);
            if (res.data.isValid) {
                callBack.call(me);
            }
        }, err => {
            console.log(err);
        });
    }
    //  添加成员，初始化页面
    newMem(params, isHideModal) {
        let me = this;
        me._newMemberData(params, me._getMemDataTable);
        // isHideModal && me.operAddMemModal(false);
    }
    // 初始获取 选中成员的 交集部门
    _getMixedDep(memList, { callBack, params }) {
        let me = this;
        getFixedDep({ EntityIdList: memList || [] }).then(res => {
            console.log(res);
            if (res.data) {
                console.log("取值");
                let tempArr = [];
                res.data.forEach(v => {
                    tempArr.push({ key: v.id, title: v.name, type: 0 });
                });
                me.setState({
                    selectedPartKeys: tempArr,
                    selectOkType: 0
                }, () => {
                    callBack && callBack.call(me, params);
                });
            }
        }, err => {
            console.log(err);
        });
    }
    // 设置 所在 部门
    setMixedDep() {
        let me = this;
        me._getMixedDep(this.state.selectedMemberArr, { callBack: me.operSelectedModal, params: true });
    }
    // 重新设置 部门所在机构
    _setNewDep(memList, depList, { callBack, params }) {
        let me = this;
        let tempTepList = [];
        depList.forEach(v => {
            tempTepList.push(v.key);
        })
        setDep({ EmployeeListId: memList, OrganizationListId: tempTepList, Platform: Permission }).then(res => {
            console.log(res);
            if (res.data.isValid) {
                console.log("设置成功");
                me.setState({
                    selectedMemberArr: [],
                    selectedPartKeys: []
                }, () => {
                    callBack && callBack.call(me, params);
                    message.config({ maxCount: 1 });
                    message.info("设置成功");
                });
            }
        }, err => {
            console.log(err);
        });
    }
    // 点击 设置部门的 确定按钮
    setNewDepOk(depList) {
        let me = this;
        let callBack = (boolean) => {
            me.operSelectedModal(boolean);
            me._getMemDataTable();
        }
        me._setNewDep(me.state.selectedMemberArr, depList, { callBack, params: false });
    }
    // 添加成员 时的 确定按钮
    addMemOk(selectedPartArr) {
        this.operSelectedModal(false);
        this.changePart(selectedPartArr);
    }
    _syncOrgAndUser=() =>{
        message.loading('同步中...',0)
        let { selectDeptId, selectedKeys } = this.state;
        syncOrgAndUser({ Platform: Permission,DeptId:selectDeptId?selectDeptId:1 }).then(result => {
            message.destroy()
            const {data}=result;
            if(data.isValid){
                message.success('同步成功!')
            }
        })
    }
    // 获取 成员列表 的table
    _getMemDataTable(id) {
        let me = this;
        me.setState({
            tableLoad: true
        }, () => {
            let { memPageSize, memPageIndex, selectedKeys } = me.state;
            getFiltermemList({ OrganziationId: id || selectedKeys["0"], pageSize: memPageSize, pageIndex: memPageIndex }).then(res => {
                // console.log(res);
                me.setState({
                    tableLoad: false
                }, () => {
                    let tempDataArr = res.data.employeeList, totalPage = -1;
                    if (tempDataArr) {
                        if (memPageIndex === 1) {
                            totalPage = Math.ceil(res.data.pagination.totalCount / memPageSize);
                            me.setState({
                                memTotalPage: totalPage
                            });
                        }
                        me.setState({
                            memTableData: tempDataArr
                        });
                    }
                });
            }, err => {
                console.log(err);
                me.setState({
                    tableLoad: false
                });
            });
        });
    }
    initSearch(keyWord) {
        if (!keyWord) {
            this.setState({
                searchDepArr: [],
                searchMemArr: []
            });
            return;
        }
        if (keyWord === this.state.keyWord) return;
        this._searchDepData(keyWord);
        /* this.setState({
            pageIndex: 1,
            keyWord
        }, () => {
            this.searchDepData(keyWord, "init");
        }); */
    }
    // 删除 成员 接口，详情 和 列表通用
    _removeMember(deleteArr) {
        let me = this;
        removeMemList({ EntityIdList: deleteArr, EntityId: me.state.selectedKeys["0"], Platform: Permission }).then(res => {
            // console.log(res);
            if (res.data.isValid) {
                me._getMemDataTable();
            }
        }, err => {
            console.log(err);
        });
    }
    // 获取 成员详情
    _getMemDetailData(id) {
        let me = this;
        getMemDetail({ EntityId: id }).then(res => {
            // console.log(res);
            let tempData = res.data;
            if (tempData) {
                me.setState({
                    memDetailData: tempData
                });
            }
        }, err => {
            console.log(err);
        });
    }
    _searchDepData(keyWord) {
        let me = this;
        let { pageIndex, selectedName } = me.state;
        searchDepData({ Name: keyWord, PageINdex: pageIndex }).then(res => {
            if (res.data) {
                let { employeeList, organizationList } = res.data;
                let tempKeys = [];
                tempKeys[0] = employeeList.length ? employeeList[0]["id"] : (organizationList.length ? organizationList[0]["id"] : "");
                employeeList.length && me.getMemDetailFun(tempKeys[0]);
                organizationList.length && me._getMemDataTable(tempKeys[0]);
                if (!employeeList.length && organizationList.length) {
                    me.setState({
                        selectedName: organizationList[0]["name"],
                    });
                }
                // console.log(tempKeys);
                me.setState({
                    searchDepArr: organizationList,
                    searchMemArr: employeeList,
                    searchSelectedKeys: tempKeys,
                    storageSelectedName: selectedName
                });
            }
            /* let requestArr = res.data.organizationList,requestMemArr = res.data.employeeList, dataArr;
            if (requestArr) {
                if (type === "init") {
                    dataArr = requestArr;
                    me.setState({
                        totalPage: Math.ceil(res.data.pagination.totalCount / pageSize)
                    });
                }
                if (type === "loadMore") {
                    dataArr = me.state.searchDepArr.concat(requestArr);
                    pageIndex = pageIndex + 1;
                }
                me.setState({
                    searchDepArr: dataArr,
                    pageIndex
                });
            } */
        }, err => {
            console.log(err);
        });
    }
    // 判断当前是否触底
    scrollEvent(e) {
        // 暂时先不管分页
        /* let target = e.target;
        let clientHeight = target["clientHeight"],
            scrollHeight = target["scrollHeight"],
            scrollTop = target["scrollTop"];
        if (scrollHeight - Math.ceil(clientHeight + scrollTop) < 1) {
            console.log("触底加载数据");
            this.state.pageIndex < this.state.totalPage && this.searchDepData(this.state.keyWord, "loadMore");
        } */
    }
    // 改变 最后 选择的部门
    changePart(selectedPartArr) {
        // 这里应该调用接口，刷新页面
        this.setState({
            selectedPartKeys: selectedPartArr
        });
    }
    operSelectedKeys(key, e) {
        if (key === undefined) return;
        let { selectedKeys } = this.state, title = e["node"]["props"]["title"]["props"]["children"][0];
        selectedKeys[0] = key;
        this.setState({ selectedKeys,selectDeptId:e.node.props.dep, memPageIndex: 1, memTableData: [], selectedName: title, showListOrDetail: 0 }, () => {
            this._getMemDataTable();
        });
    }
    // 修改 部门 名称
    reviseDepName(keyword, id, departmentId, { callBack, params }) {
        reviseDep({ Name: keyword, Id: id, departmentId: departmentId, Platform: Permission }).then(res => {
            console.log(res);
            if (res.data.isValid) {
                callBack && callBack(params.key, params.config);
            }
        }, err => {
            console.log(err);
        });
    }
    // 分页
    getPageTableData({ type, value }) {
        if (value) {
            this.setState({
                memPageIndex: value
            }, () => {
                this._getMemDataTable();
            });
        } else {
            let page = this.state.memPageIndex;
            page = type === "next" ? page - 0 + 1 : page - 0 - 1;
            this.setState({
                memPageIndex: page
            }, () => {
                this._getMemDataTable();
            });
        }
    }
    // 显示成员详情
    getMemDetailFun(id) {
        this.setState({ showListOrDetail: 1 }, () => {
            this._getMemDetailData(id);
        });
    }
    // 多选 人员
    rowSelection() {
        let me = this;
        let fun = (selectedRows) => {
            let tempArr = [];
            selectedRows.forEach(v => {
                tempArr.push(v["id"]);
            });
            me.setState({
                selectedMemberArr: tempArr
            });
        }
        let selectedRowKeys = me.state.selectedMemberArr;
        return {
            selectedRowKeys,
            fixed: true,
            onSelect: function (record, selected, selectedRows, nativeEvent) {
                fun(selectedRows);
            },
            onSelectAll: function (selected, selectedRows, changeRows) {
                fun(selectedRows);
            },
        }
    }
    // 删除 成员
    deleteMemList(deleteArr) {
        let me = this;
        if (!deleteArr || !deleteArr.length) {
            message.config({ maxCount: 1 });
            message.warning("未选中任何成员");
            return;
        }
        let tempObj = {
            title: "成员删除",
            content: "删除后，成员的企业微信消息记录将完全被清除。成员的外部联系人可在“管理工具-离职成员管理”管理。",
            onOk() {
                // console.log("删除");
                me.state.showListOrDetail === 1 && me.setState({
                    showListOrDetail: 0
                }, () => {
                    me._removeMember(deleteArr);
                });
                me.state.showListOrDetail === 0 && me._removeMember(deleteArr);
            },
            onCancel() {

            },
        }
        confirm(tempObj);
    }
    // 添加成员 点击事件
    addMemClick() {
        let me = this;
        this.setState({
            selectOkType: 1,
            editOrAdd: 0,
            selectedPartKeys: [{ key: me.state.selectedKeys[0], title: me.state.selectedName, type: 0 }]
        }, () => {
            this.operAddMemModal(true);
        });
    }
    // 操作 添加 成员的 模态
    operAddMemModal(showModal) {
        this.setState({
            showAddMemModal: showModal
        });
    }
    // 操作 选择 成员的 模态
    operSelectedModal(showModal) {
        this.setState({
            showSelectedModal: showModal
        });
    }
    // 由于 异步请求数据 调用 setState 时，组件已销毁
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    // 在 详情页 返回
    goBack() {
        this.setState({
            showListOrDetail: 0,
            memDetailData: {}
        }, () => {
            this._getMemDataTable();
        });
    }
    render() {
        let { treeData, /* selectedKeys, */ /* operSelectedKeys, */ /* rowSelection, */ /* selectedPartKeys, */ operSelectedPartKeys, /* operSelectedModal, */ /* showSelectedModal, */ /* showAddMemModal, */ /* operAddMemModal *//* , changePart */ } = this.props;
        let { searchDepArr, searchMemArr, selectedKeys, selectedPartKeys, memTableData, selectedName, tableLoad, showListOrDetail, memDetailData, searchSelectedKeys, selectedMemberArr, showAddMemModal, showSelectedModal, selectOkType, memAndDepTreeData, editOrAdd, memPageSize } = this.state;
        let changePart = this.changePart.bind(this),
            operSelectedKeys = this.operSelectedKeys.bind(this),
            operAddMemModal = this.operAddMemModal.bind(this),
            operSelectedModal = this.operSelectedModal.bind(this);
        // 分页footer要的值
        let { memPageIndex, memTotalPage } = this.state;
        let treeProps = {
            treeData,
            selectedKeys,
            draggable: true,
            styleList: "memScroll",
            onSelect: (key, e) => {
                operSelectedKeys(key, e);
            },
            reviseDepName: this.reviseDepName
        }
        let AddMemberProps = {
            treeData,
            memDetailData,
            selectedPartKeys,
            operSelectedPartKeys,
            operSelectedModal,
            showSelectedModal,
            showAddMemModal,
            operAddMemModal,
            editOrAdd,
            changePart,
            cacheInitSelectedPartKeys: { title: selectedName, key: selectedKeys[0], type: "0" },
            newMem: this.newMem.bind(this),
            confirmSaveMem: this.confirmSaveMem.bind(this),
        }
        let selectPartProps = {
            treeData: selectOkType === 2 ? memAndDepTreeData : treeData,
            type: selectOkType === 2 ? 1 : 0,
            selectedPartKeys,
            showSelectedModal,
            operSelectedModal,
            changePart: selectOkType === 0 ? this.setNewDepOk.bind(this) : (selectOkType === 1 ? this.addMemOk.bind(this) : this.importOtherDepData.bind(this)),
        }
        let tableFooterProps = {
            pageIndex: memPageIndex,
            totalPage: memTotalPage,
            pageSize: memPageSize,
            getPageTableData: this.getPageTableData.bind(this)
        }
        let MemRightDepProps = {
            selectedName,
            memTableData,
            columns,
            rowSelection: this.rowSelection.bind(this),
            tableLoad,
            tableFooterProps,
            selectedMemberArr,
            addMemClick: this.addMemClick.bind(this),
            // operSelectedModal,
            getMemDetailFun: this.getMemDetailFun.bind(this),
            deleteMemList: this.deleteMemList.bind(this),
            setMixedDep: this.setMixedDep.bind(this),
            importFromOtherDep: this.importFromOtherDep.bind(this),
        }
        let memRightDetailProps = {
            memDetailData,
            goBack: this.goBack.bind(this),
            clickEidtMemModal: this.clickEidtMemModal.bind(this),
            deleteMemList: this.deleteMemList.bind(this),
        }
        // console.log(memTableData);
        memTableData.forEach(v => {
            v.key = v.id;
        });
        return (
            <div className={styles.container}>
                {/* <div className={styles.loading}>
                    <Spin className={styles.loadingMain} size="large" />
                </div> */}
                {showSelectedModal && <SelectPart {...selectPartProps} />}
                {showAddMemModal && <AddMember {...AddMemberProps} />}
                <Layout>
                    <Sider className={styles.sider}>
                        <div onClick={this._syncOrgAndUser} className={styles.memberStyle}>从企业微信同步</div>
                        <Search
                            placeholder="搜索成员、部门"
                            onSearch={value => { this.initSearch(value); }}
                            onChange={e => {
                                if (!e.target.value) {
                                    this.initSearch(e.target.value);
                                    this.setState({
                                        memPageIndex: 1, memTableData: [], showListOrDetail: 0, selectedName: this.state.storageSelectedName,
                                    }, () => {
                                        this._getMemDataTable();
                                    });

                                }
                            }}
                            style={{ width: "100%" }}
                        />
                        {
                            (searchDepArr.length || searchMemArr.length) ? <div className={styles.search}>
                                {
                                    searchMemArr.length ? (
                                        <div className={styles.searchMem}>
                                            <div className={styles.searchTitle}>成员</div>
                                            {
                                                searchMemArr.map((v, i) => (
                                                    <div key={i} className={`${styles.searchMemItem} ${searchSelectedKeys[0] === v.id ? styles.searchMemItemActive : ""}`} onClick={() => {
                                                        let tempArr = [];
                                                        tempArr[0] = v.id;
                                                        this.setState({
                                                            searchSelectedKeys: tempArr
                                                        }, () => {
                                                            this.getMemDetailFun(v.id);
                                                        });
                                                    }}>
                                                        <div>{v.name}</div>
                                                        <div>{v.department}</div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    ) : ""
                                }
                                {
                                    searchDepArr.length ? (
                                        <div className={styles.searchDep}>
                                            <div className={styles.searchTitle}>部门</div>
                                            {
                                                searchDepArr.map((v) => (
                                                    <div key={v.id} className={`${styles.searchDepItem} ${searchSelectedKeys[0] === v.id ? styles.searchMemItemActive : ""}`} onClick={() => {
                                                        if (searchSelectedKeys[0] === v.id) return;
                                                        let tempArr = [];
                                                        tempArr[0] = v.id;
                                                        this.setState({
                                                            searchSelectedKeys: tempArr,
                                                            memPageIndex: 1, memTableData: [], selectedName: v.name, showListOrDetail: 0
                                                        }, () => {
                                                            this._getMemDataTable(v.id);
                                                        });
                                                    }}>{v.name}</div>
                                                ))
                                            }
                                        </div>) : ""
                                }
                            </div> : ""
                        }
                        {treeData.length && !searchDepArr.length && !searchMemArr.length ? <TreeCom {...treeProps} /> : ""}
                    </Sider>
                    <Content className={`${styles.content} ${showListOrDetail === 1 ? styles.contentScroll : ""}`}>
                        {
                            showListOrDetail === 0 ? <MemRightDep {...MemRightDepProps} /> : <MemRightDetail {...memRightDetailProps} />
                        }
                    </Content>
                </Layout>
            </div>
        );
    }
}

export default Member;