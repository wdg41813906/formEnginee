import { Component } from "react"
import ReactDOM from 'react-dom';
import { Table, Icon, Select, Button, Input, Dropdown, Menu, Modal, message } from "antd"
import { connect } from 'dva';
import styles from "./BookAddress.less"
import { List, Map, is } from "immutable"

import Member from "../../components/BookAddress/Member"
import Manager from "../../components/BookAddress/Manager"
import Roles from "../../components/BookAddress/Roles"
import FilterPart from "../../components/BookAddress/MemberCom/FilterPart";

class BookAddress extends Component {
    constructor(props){
        super(props);
        this.state = {
            activeTabs:1
        }
        this.initData();
    }
    // 初始化 页面的 数据，包括 树的第一层
    initData(){
        this.props.dispatch({
            type:"bookAddress/getOrganazition"
        });
    }
    /* shouldComponentUpdate(nextProps = {}, nextState = {}) {
        const thisProps = this.props || {}, thisState = this.state || {};
        if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
            Object.keys(thisState).length !== Object.keys(nextState).length) {
            return true;
        }

        for (const key in nextProps) {
            if (thisProps[key] !== nextProps[key] || !is(thisProps[key], nextProps[key])) {
                return true;
            }
        }

        for (const key in nextState) {
            if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
                return true;
            }
        }
        return false;
    } */
    /* operSelectedKeys(key){
        this.props.dispatch({
            type:"bookAddress/selectedKeys",
            payload:{key}
        });
    } */
    /* rowSelection() {
        let me = this;
        return {
            fixed: true,
            onSelect: function (record, selected, selectedRows, nativeEvent) {
            
            },
            onSelectAll: function (selected, selectedRows, changeRows) {
            
            },
        }
    } */
    /* operSelectedModal(showModal){
        this.props.dispatch({
            type:"bookAddress/operSelectedModal",
            payload:{showModal}
        })
    } */
    /* operAddMemModal(showModal){
        this.props.dispatch({
            type:"bookAddress/operAddMemModal",
            payload:{showModal}
        });
    } */
    adminClick(){
        this.props.dispatch({
            type:"bookAddress/adminClick"
        })
    }
    adminUnfocus(){
        this.props.dispatch({
            type:"bookAddress/adminUnfocus"
        })
    }
    // 激活 对应的管理员
    focusManage(item){
        this.props.dispatch({
            type:"bookAddress/focusManage",
            payload:{item}
        })
    }
    // 控制 成员列表
    controlFilter({isShowModal,showFilterArr,headerTitle,singleOrMultiple,selectedData,isFilter}){
        this.props.dispatch({
            type:"bookAddress/controlFilter",
            payload:{isShowModal,showFilterArr,headerTitle,singleOrMultiple,selectedData,isFilter}
        });
    }
    // 改变职责页面 选中的 操作
    changeRolesSelectedKeys(selectedKeys){
        this.props.dispatch({
            type:"bookAddress/changeRolesSelectedKeys",
            payload:{selectedKeys}
        });
    }
    /* // 改变成员的选择部门
    changePart(selectedPartArr){
        this.props.dispatch({
            type:"bookAddress/changePart",
            payload:{selectedPartArr}
        });
    } */
    render() {
        let { treeData,/* selectedKeys, *//* selectedPartKeys,showSelectedModal,showAddMemModal, */leftManageListArr,adminMem,activeManage } = this.props.bookAddress;
        // 选择部门，成员，职责的数据
        let {/* selectedData,departArr,rolesArr,memArr,searchDataArr,materDataArr, */controlFilterPart} = this.props.bookAddress;
        // 职责需要的数据
        let {/* leftRolesListArr *//* ,rolesMainArr,rolesSelectedKeys */} = this.props.bookAddress;
        let memberProps = {
            treeData,
            // selectedKeys,
            // selectedPartKeys,
            // showSelectedModal,
            // showAddMemModal,
            // operSelectedKeys:this.operSelectedKeys.bind(this),
            // rowSelection:this.rowSelection.bind(this),
            // operSelectedModal:this.operSelectedModal.bind(this),
            // operAddMemModal:this.operAddMemModal.bind(this),
            // changePart:this.changePart.bind(this)
        }
        let managerProps = {
            leftListArr:leftManageListArr,
            adminMem,
            activeManage,
            adminClick:this.adminClick.bind(this),
            adminUnfocus:this.adminUnfocus.bind(this),
            focusManage:this.focusManage.bind(this),
            controlFilter:this.controlFilter.bind(this),
        }
        let filterPartProps = {
            /* selectedData,
            departArr:treeData,
            rolesArr,
            memArr,
            searchDataArr,
            materDataArr, */
            controlFilterPart,
            controlFilter:this.controlFilter.bind(this)
        }
        let rolesProps = {
            /* leftListArr:leftRolesListArr,
            rolesMainArr,
            activeManage,
            rolesSelectedKeys,
            focusManage:this.focusManage.bind(this),
            rowSelection:this.rowSelection.bind(this),
            changeRolesSelectedKeys:this.changeRolesSelectedKeys.bind(this), */
            controlFilterPart,
            controlFilter:this.controlFilter.bind(this),
        }
        let {activeTabs} = this.state;
        return (
            <div className={styles.container}>
                {/* 统一模态放置位置 ，放在这有问题*/}
                {/* {controlFilterPart["isShowModal"] && <FilterPart {...filterPartProps}/>} */}
                <div className={styles.tabs}>
                    <div className={activeTabs===1?styles.itemActive:""} onClick={()=>{
                        this.setState({
                            activeTabs:1
                        })
                    }}>成员</div>
                    <div className={activeTabs===2?styles.itemActive:""} onClick={()=>{
                        this.focusManage(adminMem);
                        this.setState({
                            activeTabs:2
                        })
                    }}>管理员</div>
                    <div className={activeTabs===3?styles.itemActive:""} onClick={()=>{
                        // this.focusManage(leftRolesListArr[0]);
                        this.setState({
                            activeTabs:3
                        })
                    }}>职责</div>
                </div>
                <div className={styles.mainContent}>
                    {activeTabs === 1 && treeData.length ? <Member {...memberProps}/>:""}
                    {activeTabs === 2 ? <Manager {...managerProps} />:""}
                    {activeTabs === 3 ? <Roles {...rolesProps}/>:""}
                </div>
            </div>
        );
    }
}

export default connect(({ bookAddress }) => ({ bookAddress }))(BookAddress);
