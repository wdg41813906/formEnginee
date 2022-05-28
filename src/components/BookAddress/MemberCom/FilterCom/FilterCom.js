import { Component,Fragment } from "react"
import { Icon } from "antd"
import styles from "./FilterCom.less"

import TreeCom from "../../TreeCom"


// 把 组件 在进行细化
// 列表选择性组件
function ListCheckedCom(props) {
    let { listArr, onSelect, type, singleOrMultiple, selectedData, isCheck, selectRolesActive,checkboxEvent } = props;
    const select = (v,type,bool)=>{
        onSelect instanceof Function &&  onSelect(v.id, type,bool);
    }
    const checkboxOnChange = (v,type,bool,e)=>{
        if(!(checkboxEvent instanceof Function))return;
        e.stopPropagation();
        checkboxEvent(v,type,bool);
    }
    return (
        <Fragment>
            {
                listArr.length ? listArr.map((v, i) => {
                    let jusdgeChecked = singleOrMultiple === 0 ? (selectedData.length ? selectedData[0]["id"] === v.id : false) : v.checked;
                    return (
                        <div key={i} className={`${styles.checkboxItem} ${selectRolesActive === v.id ? styles.checkboxItemActive : ""}`} onClick={select.bind(null,v,type,!jusdgeChecked)}>
                            {v.name}
                            {
                                isCheck ? (<div style={{ borderRadius: singleOrMultiple === 0 ? "50%" : 0 }} className={`${styles.checkCustom} ${jusdgeChecked ? styles.customChecked : ""}`} onClick={checkboxOnChange.bind(null,v,type,!jusdgeChecked)}>
                                    {
                                        jusdgeChecked && <Icon type="check" theme="outlined" className={styles.checkIcon} />
                                    }
                                </div>) : ""
                            }
                        </div>
                    )
                }) : ""
            }
        </Fragment>
    );
}
// 部门 或者是 组织架构
function Department(props) {
    // 树要的
    let { draggable, treeData, isCheck, type, selectedData, onSelect, singleOrMultiple, setTreeData, selectedKeys,checkboxEvent,specialTree } = props;
    // 右边成员要的
    let { memArr, selectRolesOrMem, isTree } = props;
    let treeProps = {
        draggable,
        treeData,
        isCheck,
        type,
        selectedData,
        onSelect,
        singleOrMultiple,
        setTreeData,
        selectedKeys,
        checkboxEvent,
        specialTree
    }
    let rightListCheckedComProps = {
        type: 2,
        listArr: memArr,
        onSelect: selectRolesOrMem,
        isCheck: true,
        singleOrMultiple,
        isTree,
        selectedData,
    }
    return (
        <div className={styles.memContainer}>
            {
                <div className={styles.memLeft}>
                    {
                        treeData.length ? <TreeCom {...treeProps} /> : ""
                    }
                </div>
            }
            {
                isTree ? (
                    <div className={styles.memRight}>
                        <ListCheckedCom {...rightListCheckedComProps} />
                    </div>
                ) : ""
            }

        </div>
    );
}
// 职责 或者 职责 下的成员 显示方式
function Roles(props) {
    let { rolesArr, selectRolesOrMem, type, singleOrMultiple, selectedData, isTree, memArr, selectRolesGetMem, selectRolesActive,isCheck,checkboxEvent } = props;
    let leftListCheckedComProps = {
        type,
        listArr: rolesArr,
        singleOrMultiple,
        selectedData,
        onSelect: isTree ? selectRolesGetMem : selectRolesOrMem,
        isCheck: isCheck !== undefined?isCheck:(isTree ? false : true),
        selectRolesActive,/* isTree ? selectRolesActive : "" */
        checkboxEvent
    }
    let rightListCheckedComProps = {
        type: 2,
        listArr: memArr,
        onSelect: selectRolesOrMem,
        isCheck: true,
        singleOrMultiple,
        selectedData,
    }
    return (
        <div className={styles.memContainer}>
            {
                <div className={styles.memLeft}>
                    <ListCheckedCom {...leftListCheckedComProps} />
                </div>
            }
            {
                isTree ? (
                    <div className={styles.memRight}>
                        <ListCheckedCom {...rightListCheckedComProps} />
                    </div>
                ) : ""
            }

        </div>
    );
}
// 成员 或者是 组织架构
function Member(props) {
    let { treeData, memArr, selectRolesOrMem, type, singleOrMultiple, isTree, selectedData, onSelect, selectedKeys,isCheck,selectRolesActive,checkboxEvent } = props;
    let memTreeProps = {
        draggable: false,
        treeData,
        onSelect,
        selectedKeys
    }
    let listCheckedComProps = {
        listArr: memArr,
        onSelect: selectRolesOrMem,
        type,
        selectedData,
        singleOrMultiple,
        isCheck: true,/*isCheck !== undefined?isCheck:(isTree ? false : true)*/
        selectRolesActive,
        checkboxEvent
    }
    return (
        <div className={styles.memContainer}>
            {
                isTree ? (
                    <div className={styles.memLeft}>
                        {treeData.length ? <TreeCom {...memTreeProps} /> : ""}
                    </div>
                ) : ""
            }
            <div className={styles.memRight}>
                <ListCheckedCom {...listCheckedComProps} />
            </div>
        </div>
    );
}
// 物料采集
function Materiel(props) {
    let { materDataArr, selectRolesOrMem, type } = props;
    return (
        <Fragment>
            {
                materDataArr.map((v, i) => (
                    <div key={i} className={styles.checkboxItem} onClick={() => {
                        selectRolesOrMem(v.id, type);
                    }}>
                        <Icon type="radar-chart" theme="outlined" className={styles.checkIcon + " " + styles.materIcon} />
                        {v.name}
                        <div className={`${styles.checkCustom} ${v.checked ? styles.customChecked : ""}`}>
                            {v.checked && <Icon type="check" theme="outlined" className={styles.checkIcon} />}
                        </div>
                    </div>
                ))
            }
        </Fragment>
    )
}
// 默认参数
function DefaultList(props){
    let { defList, selectRolesOrMem, type, singleOrMultiple, selectedData } = props;
    const listCheckedComProps = {
        listArr: defList,
        onSelect: selectRolesOrMem,
        type,
        selectedData,
        singleOrMultiple,
        isCheck: true,
    }
    return(
        <Fragment>
            <ListCheckedCom {...listCheckedComProps}/>
        </Fragment>

    )
}

export {
    Department,Roles,Member,Materiel,DefaultList
}
