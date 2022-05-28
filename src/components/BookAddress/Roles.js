import { Component } from "react"
import ReactDOM from 'react-dom';
import { Layout, Input, Tree, Icon, Select, Button, Modal, message } from "antd"
import styles from "./Roles.less"
import { Guid } from "../../utils/com"
import { List, Map, is } from "immutable"
import { getRolesList, addNewRoles, reviseRoleName, removeRole, sortRoles, getRolesMem, createRolesAndMem, removeRolesAndMem } from "../../services/BookAddress/BookAddress"
import FilterPart from "./MemberCom/FilterPart";

import MemLeftCom from "./MemLeftCom";
import RolesContent from "./MemberCom/RolesContent"
import TableFooter from "./MemberCom/TableFooter"


const { Sider, Content } = Layout;
const confirm = Modal.confirm;

// let deleteConfirm = (rolesSelectedKeys, okCallback) => {
//     if (!rolesSelectedKeys.length) {
//         message.config({ maxCount: 1 });
//         message.warning("请选择要删除的人员");
//         return;
//     };
//     let deleteConfirmObj = {
//         title: '您是否要移除所选成员？',
//         content: '移除成员会同时移除所选成员的当前职责身份，但不会在通讯录中删除所选成员',
//         onOk() {
//             console.log(rolesSelectedKeys);
//             okCallback && okCallback();
//             /* return new Promise((resolve, reject) => {
//                 setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
//             }).catch(() => console.log('Oops errors!')); */
//         },
// onCancel() { },
//     }
// confirm(deleteConfirmObj);
// }

class Roles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leftListArr: [],
            activeManage: {},
            rolesSelectedKeys: [],
            // 成员分页数据
            rolesMainArr: [],
            rolesPageIndex: 1,
            rolesPageSize: 20,
            rolesTotalPage: 0
        }
        // this._rolesAddMem();
        // this._removeMem();
    }
    componentWillMount() {
        let initActiveManage = function (item) {
            this.setState({
                activeManage: { ...item }
            }, () => {
                this._getRoleMemData(item.id);
            })
        }
        this.getRolesListData(initActiveManage);
        // this.getRoleMemData();
    }
    // 分页
    getPageTableData({ type, value }) {
        if (value) {
            this.setState({
                rolesPageIndex: value
            }, () => {
                this._getRoleMemData();
            });
        } else {
            let page = this.state.rolesPageIndex;
            page = type === "next" ? page - 0 + 1 : page - 0 - 1;
            this.setState({
                rolesPageIndex: page
            }, () => {
                this._getRoleMemData();
            });
        }
    }
    // 获取 职责 下的 成员
    _getRoleMemData(roleId) {
        let me = this;
        let { rolesPageSize, rolesPageIndex } = me.state;
        getRolesMem({ RoleId: roleId ? roleId : me.state.activeManage.id, PageSize: rolesPageSize, PageIndex: rolesPageIndex }).then(res => {
            // console.log(res);
            let tempDataArr = res.data.employeeList, totalPage = -1;
            if (tempDataArr) {
                if (rolesPageIndex === 1) {
                    totalPage = Math.ceil(res.data.pagination.totalCount / rolesPageSize);
                    me.setState({
                        rolesTotalPage: totalPage
                    });
                }
                me.setState({
                    rolesMainArr: tempDataArr
                });
            }
        }, err => {
            console.log(err);
        });
    }
    // 删除职责
    removeRolesData(id) {
        let me = this;
        let tempArr = List(me.state.leftListArr).toJS();
        removeRole({ EntityIdList: [id] }).then(res => {
            // console.log(res);
            if (res.data.isValid) {
                for (let i = 0; i < tempArr.length; i++) {
                    let v = tempArr[i];
                    if (v.id === id) {
                        tempArr.splice(i, 1);
                        break;
                    }
                }
                // console.log(tempArr);
                me.setState({
                    leftListArr: tempArr
                });
            }

        }, err => {
            console.log(err);
        });
    }
    // 角色排序
    rolesSort(listId) {
        sortRoles(listId).then(res => {
            console.log(res);
        }, err => {
            console.log(err);
        });
    }
    // 修改名称
    changeRoleName(params) {
        let me = this;
        let tempArr = List(me.state.leftListArr).toJS();
        reviseRoleName(params).then(res => {
            // console.log(res);
            if (res.data.isValid) {
                let { Id: id, Name: name } = params;
                tempArr.forEach(v => {
                    if (v.id === id) {
                        v.name = name;
                    }
                });
                me.setState({
                    leftListArr: tempArr
                });
            }
        }, err => {
            console.log(err);
        });
    }
    // 获取 职责列表
    getRolesListData(callback) {
        let me = this;
        getRolesList({ RoleName: "" }).then(res => {
            // console.log(res);
            if (res.data.roleList) {
                me.setState({
                    leftListArr: res.data.roleList
                }, () => {
                    callback && callback.call(me, res.data.roleList[0]);
                });
            }
        }, err => {
            console.log(err);
        });
    }
    // 新增 职责
    newRoles(params) {
        let me = this;
        let { leftListArr } = me.state;
        addNewRoles(params).then(res => {
            // console.log(res);
            if (res.data.isValid) {
                // me.getRolesListData();
                leftListArr.push({ ...params, reviseNameState: 1, isDownVisible: false });
                me.setState({ leftListArr });
            }
        }, err => {
            console.log(err);
        });
    }
    // 激活 对应的管理员
    focusManage(item) {
        let { activeManage } = this.state;
        if(item.id === activeManage.id)return;
        !activeManage.id && (activeManage = item);
        if (activeManage.id && activeManage.id !== item.id) {
            activeManage = item;
        }
        this.setState({
            activeManage
        }, () => {
            this._getRoleMemData(item.id);
        });
    }
    // 批量删除
    deleteConfirm(rolesSelectedKeys) {
        if (!rolesSelectedKeys.length) {
            message.config({ maxCount: 1 });
            message.warning("请选择要删除的人员");
            return;
        };
        let me = this;
        let deleteConfirmObj = {
            title: '您是否要移除所选成员？',
            content: '移除成员会同时移除所选成员的当前职责身份，但不会在通讯录中删除所选成员',
            onOk() {
                console.log(rolesSelectedKeys);
                me._removeMem(rolesSelectedKeys);
            },
            onCancel() { },
        }
        confirm(deleteConfirmObj);
    }
    // 批量 删除 职责 的成员
    _removeMem(EmployeeIds) {
        // {RoleId:"bc93811e-33e5-78f3-17e8-354470c35807",EmployeeIds:["6d895daf-0157-1547-edc5-ec0d105bd15b","f22b5bb0-9dec-49eb-b7d1-002d2a2ea013"]}
        let me = this;
        removeRolesAndMem({EmployeeIds,RoleId:me.state.activeManage.id}).then(res => {
            console.log(res);
            if (res.data.isValid) {
                me.setState({
                    rolesPageIndex:1
                },()=>{
                    me._getRoleMemData();
                });
            }
        }, err => {
            console.log(err);
        });
    }
    // 职责 被选中 需要操作的 方法
    changeRolesSelectedKeys(selectedKeys,changeRoleArr) {
        this.setState({
            rolesSelectedKeys: selectedKeys,
            rolesMainArr:changeRoleArr
        });
    }
    // 职责添加 成员 接口
    _rolesAddMem(params) {
        let me = this;
        createRolesAndMem(params).then(res => {
            console.log(res);
            if (res.data.isValid) {
                me._getRoleMemData();
            }
        }, err => {
            console.log(err);
        });
    }
    // 确定 添加成员
    confirmAddMem(selectedData) {
        // console.log(selectedData);
        let tempidList = [], params = {};
        selectedData && selectedData.forEach(v => {
            tempidList.push(v.id);
        });
        params.EmployeeIds = tempidList;
        params.RoleId = this.state.activeManage.id;
        this._rolesAddMem(params);
    }
    // 由于 异步请求数据 调用 setState 时，组件已销毁
    componentWillUnmount() {
        this.setState = (state, callback) => {
            return;
        };
    }
    render() {
        let { controlFilter, controlFilterPart } = this.props;
        let { leftListArr, activeManage, rolesSelectedKeys, rolesMainArr, rolesPageIndex, rolesTotalPage,rolesPageSize } = this.state;
        let memLeftComProps = {
            activeManage,
            leftListArr,
            focusManage: this.focusManage.bind(this),
            newRoles: this.newRoles.bind(this),
            changeRoleName: this.changeRoleName.bind(this),
            removeRolesData: this.removeRolesData.bind(this),
            rolesSort: this.rolesSort.bind(this),
        }

        let rolesContentProps = {
            rolesMainArr,
            deleteConfirm:this.deleteConfirm.bind(this),
            changeRolesSelectedKeys: this.changeRolesSelectedKeys.bind(this)
        }
        let tableFooterProps = {
            pageIndex: rolesPageIndex,
            totalPage: rolesTotalPage,
            pageSize:rolesPageSize,
            getPageTableData: this.getPageTableData.bind(this)
        }
        let filterPartProps = {
            controlFilterPart,
            controlFilter,
            confirmSubmit: this.confirmAddMem.bind(this),
        }
        return (
            <div className={styles.container}>
                {controlFilterPart.isShowModal && <FilterPart {...filterPartProps} />}
                <Layout>
                    <Sider className={styles.sider}>
                        {leftListArr.length ? <MemLeftCom {...memLeftComProps} /> : ""}
                    </Sider>
                    <Content className={styles.content}>
                        <div className={styles.title}>
                            {activeManage.name}
                        </div>
                        <div className={styles.edit}>
                            <Button className={styles.btn + " " + styles.addMem} onClick={() => {
                                controlFilter({
                                    isShowModal: true,
                                    isFilter:0,
                                    showFilterArr: [
                                        /* { type: 0, name: "部门", idList:["30000000-0000-0000-0000-000000000000","20000000-0000-0000-0000-000000000000","8d1fd960-0635-5bf8-bc65-1d9e3e6dbe99"],isTree:false },
                                        { type: 1, name: "职责", idList: ["9088ac03-dfea-1e52-9700-803aecfc0564","bc93811e-33e5-78f3-17e8-354470c35807"], isTree: true }, */
                                        { type: 2, name: "成员", idList: [/* "6d895daf-0157-1547-edc5-ec0d105bd15b","c46b4676-f257-428d-8d12-0009bdab75f7","0b4bd6bf-bacc-4058-bb6a-01a07a2e51db","ced6b43f-58de-4f96-ba1a-01a9ec9e7598" */],isTree:true},
                                    ],
                                    headerTitle: "成员列表",
                                    singleOrMultiple: 1,
                                    selectedData: []/* [{ id: "bc93811e-33e5-78f3-17e8-354470c35807", name: "12", type: 1 }, { id: "6d895daf-0157-1547-edc5-ec0d105bd15b", name: "sdsd", type: "2" }, { id: "20000000-0000-0000-0000-000000000000", name: "移动互联", type: 0 }, {
                                        id: "30000000-0000-0000-0000-000000000000", name: "第三层12额额", type: 0
                                    }] */
                                });
                            }}>添加成员</Button>
                            <Button className={styles.btn + " " + styles.delete} onClick={() => { this.deleteConfirm(rolesSelectedKeys); }}>批量删除</Button>
                        </div>
                        {rolesMainArr.length ? <RolesContent {...rolesContentProps} /> : ""}
                        <TableFooter {...tableFooterProps} />
                    </Content>
                </Layout>
            </div>
        );
    }
}

export default Roles;
