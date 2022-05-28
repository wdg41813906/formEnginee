import { Component } from "react"
import ReactDOM from 'react-dom';
import { Layout, Input, Tree, Icon, Select, Button } from "antd"
import styles from "./Manager.less"
import { Guid } from "../../utils/com"
import { List, Map, is } from "immutable"

const { Sider, Content } = Layout;

import MemLeftCom from "./MemLeftCom";
import MemRightCom from "./MemRightCom";

function Manager(props) { 
    let { leftListArr,adminMem,adminClick,adminUnfocus,activeManage,focusManage,controlFilter } = props;
    let memLeftComProps = {
        leftListArr,
        adminUnfocus,
        focusManage,
        activeManage
    }
    let adminArr = [
        {title:"创建者",content:"王小波（wangxb@sysdsoft.cn）",type:"0"},
        {title:"系统管理员",content:"点击添加管理员",type:"1"},
        {title:"应用权限",content:"具备所有应用的管理权限",type:"0"},
        {title:"功能权限",content:"具备所有功能权限",type:"0"},
        {title:"通讯录管理范围",content:"具备对所有成员的管理权限",type:"0"},
    ]
    let generalAdminArr = [
        {title:"管理员",content:"点击添加管理员",type:"1"},
        {title:"应用权限",content:"点击选择可编辑的应用",type:"1"},
        {title:"功能权限",content:[
            {title:"通讯录管理",checked:false},
            {title:"可添加/删除应用",checked:false},
        ],type:"2"},
        {title:"通讯录管理范围",content:"点击选择可管理的部门",des:"不选择任何部门时，默认可管理所有部门",type:"3"},
    ]
    let memRightProps = {
        dataArr:activeManage["type"]===0?adminArr:generalAdminArr,
        controlFilter
    }
    return (
        <div className={styles.container}>
            <Layout>
                <Sider className={styles.sider}>
                    <div className={`${styles.admin} ${adminMem["memClick"]?styles.adminActive:""}`} onClick={()=>{
                        if(adminMem["id"] !== activeManage["id"]){
                            focusManage(adminMem);
                        }
                        adminClick();
                    }}>
                        <Icon className={styles.iconColor + " " + styles.adminIcon} type="user" theme="outlined" />
                        系统管理组
                    </div>
                    <MemLeftCom {...memLeftComProps} />
                </Sider>
                <Content className={styles.content}>
                    <div className={styles.title}>
                        {activeManage["name"]}
                    </div>
                    <MemRightCom {...memRightProps}/>
                </Content>
            </Layout>
        </div>
    );
}

export default Manager;