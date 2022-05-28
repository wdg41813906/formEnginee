import { Component } from "react"
import { Icon, Button, Menu, Dropdown, Input, Modal, message } from "antd"
import { Guid } from "../../utils/com"
import styles from "./MemLeftCom.less"
import { DragSource, DropTarget } from 'react-dnd'
// import { config } from "rxjs";
import { Map, List, is, fromJS } from 'immutable';

const confirm = Modal.confirm;
const type = "member";
@DragSource(type, {
    beginDrag(props, monitor, component) {
        let { item, findMess } = props;
        return {
            item,
            initialIndex: findMess(item.id)["index"]
        }
    },
    endDrag(props, monitor, component) {
        const didDrop = monitor.didDrop();
        let { findMess, operateArr } = props;
        let { item: { id: dragId }, initialIndex } = monitor.getItem();
        if (!didDrop) {
            let { index } = findMess(dragId);
            operateArr(index, initialIndex);
        }
    }
}, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    currentItem: monitor.getItem(),
    isDragging: monitor.isDragging()
}))
@DropTarget(type, {
    hover(props, monitor, component) {
        let { item: { id: targetId }, findMess, operateArr } = props;
        let { item: { id: sourceId } } = monitor.getItem();
        if (targetId !== sourceId) {
            let { index: targetIndex } = findMess(targetId);
            let { index: sourceIndex } = findMess(sourceId);
            operateArr(targetIndex, sourceIndex);
        }
    }
}, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget()
}))
class MemItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: props.item.name
        }
    }
    changeInputValue(value) {
        this.setState({
            inputValue: value
        })
    }
    deleteRoles({ name, id }) {
        let me = this;
        let configObj = {
            title: `您是否要删除“${name}”？`,
            content: '删除职责会同时删除该职责的权限，但不会删除此职责中包含的通讯录成员',
            onOk() {
                console.log("删除");
                me.props.removeRolesData(id);
            },
        }
        confirm(configObj);
    }
    render() {
        let { connectDragSource, connectDropTarget, item, currentItem, isDnd, changeActiveClass, adminUnfocus, focusManage, changeReviseState,activeManage,changeRoleName } = this.props;
        let { inputValue } = this.state;
        const ReviseDropDown = (
            <div className={styles.reviseContainer}>
                <Input autoFocus defaultValue={item.name} value={inputValue} onChange={(e) => { e.persist(); this.changeInputValue(e.target.value); }} />
                <div className={styles.reviseEdite}>
                    <Button className={styles.reviseBtn} onClick={() => {
                        changeReviseState(item.id, { reviseNameState: 1, isDownVisible: false });
                        if (inputValue !== item.name) {
                            this.changeInputValue(item.name);
                        }
                    }}>取消</Button>
                    <Button className={styles.reviseBtn + " " + styles.reviseConfirm} onClick={() => {
                        changeReviseState(item.id, { reviseNameState: 1, isDownVisible: false, name: inputValue });
                        changeRoleName({Id:item.id,Name:inputValue});
                    }}>确定</Button>
                </div>
            </div>
        );
        const menu = (
            <Menu onClick={(e) => {
                // console.log(e);
                let key = e.key;
                switch (key) {
                    case "0":
                        changeReviseState(item.id, { reviseNameState: 2, isDownVisible: true });
                        break;
                    case "1":
                        changeReviseState(item.id, { reviseNameState: 1, isDownVisible: false });
                        this.deleteRoles({ name: item.name, id: item.id });
                        break;
                }
            }}>
                <Menu.Item key="0">
                    修改名称
                </Menu.Item>
                <Menu.Item key="1">
                    删除
                </Menu.Item>
            </Menu>
        );
        return (
            <div>
                {
                    isDnd ? (connectDropTarget(connectDragSource(
                        <div style={{ opacity: (currentItem && currentItem.id === item.id) ? .5 : 1 }} className={styles.admin + " " + styles.paddingLeft}>
                            <div className={styles.memText}>{item.name}</div>
                            <Icon className={styles.memIcon} type="drag" theme="outlined" />
                        </div>
                    ))) : (
                            <div
                                id={item.id}
                                onMouseEnter={() => {
                                    changeActiveClass(item.id, "memHover", true);
                                }}
                                onMouseLeave={() => {
                                    changeActiveClass(item.id, "memHover", false);
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    focusManage && focusManage(item);
                                    adminUnfocus && adminUnfocus();
                                    // changeActiveClass(item["id"], "memClick", true);
                                }}
                                className={`${styles.admin} ${styles.paddingLeft} ${(item.memHover || item.id===activeManage.id) ? styles.adminActive : ""}`}>
                                <div className={styles.memText}>{item.name}</div>
                                {
                                    (item.memHover || item.id===activeManage.id) && item.reviseNameState === 1 && <Dropdown placement="bottomRight" getPopupContainer={() => document.getElementById(item.id)} overlay={menu} trigger={['click']} visible={item.isDownVisible} onVisibleChange={(visible) => {
                                        // console.log(visible);
                                        changeReviseState(item.id, { isDownVisible: visible });
                                    }}>
                                        <Icon className={styles.memIcon} type="ellipsis" theme="outlined" />
                                    </Dropdown>
                                }
                                {
                                    (item.memHover || item.id===activeManage.id) && item.reviseNameState === 2 && <Dropdown placement="bottomRight" getPopupContainer={() => document.getElementById(item.id)} overlay={ReviseDropDown} trigger={['click']} visible={item.isDownVisible} onVisibleChange={(visible) => {
                                        // console.log(visible);
                                        let tempState = undefined;
                                        if (item.reviseNameState === 2 && !visible) {
                                            tempState = 1;
                                            inputValue !== item.name && this.changeInputValue(item.name);
                                        }
                                        changeReviseState(item.id, { reviseNameState: tempState, isDownVisible: visible });
                                    }}>
                                        <Icon className={styles.memIcon} type="ellipsis" theme="outlined" />
                                    </Dropdown>
                                }
                            </div>
                        )
                }
            </div>
        )
    }
}

let addRoleInputValue = "";
class MemLeftCom extends Component {
    constructor(props) {
        super(props);
        let { leftListArr } = props;
        leftListArr.forEach(v => {
            v.reviseNameState = 1;
            v.isDownVisible = false;
        })
        this.state = {
            arr: leftListArr,//JSON.parse(JSON.stringify(leftListArr))
            isDnd: false,
        }
    }
    componentWillReceiveProps(nextProps) {
        if(this.state.arr.length !== nextProps.leftListArr.length){
            let tempArr = nextProps.leftListArr;
            tempArr.forEach(v => {
                v.reviseNameState = 1;
                v.isDownVisible = false;
            })
            this.setState({
                arr: tempArr
            })
        }
    }
    _changeState(arr, id, propsObj) {
        arr.forEach(v => {
            if (v.id === id) {
                let tempPropsArr = Object.keys(propsObj);
                tempPropsArr.forEach(item => {
                    propsObj[item] !== undefined && (v[item] = propsObj[item]);
                })
                // reviseNameState !== undefined && (v["reviseNameState"] = reviseNameState);
                // isDownVisible !== undefined && (v["isDownVisible"] = isDownVisible);
            }
        });
        return arr;
    }
    // 改变 对应项的 属性值 reviseNameState, isDownVisible等
    changeReviseState(id, propsObj) {
        let { arr } = this.state;
        arr = this._changeState(arr, id, propsObj);
        this.setState({
            arr
        });
    }
    // 修改样式
    changeActiveClass(id, type, bool) {
        let tempArr = this.state.arr;
        tempArr.forEach(v => {
            if (v.id === id) {
                v[type] = bool;
            } else {
                if (type === "memClick") {
                    v.memClick = false;
                }
            }
        });
        this.setState({
            arr: tempArr,
        });
    }
    // 显示 操作模态框
    showEditModal(id) {
        let tempArr = this.state.arr;
        tempArr.forEach(v => {
            if (v.id === id) {
                v.showModal = true;
            } else {
                v.showModal = false;
            }
        })
        this.setState({
            arr: tempArr
        });
    }
    // 寻找 目标item以及当前对应的 位置
    findMess(id) {
        let tempArr = [...this.state.arr];
        let currentItem = tempArr.filter(v => v.id === id)[0];
        return {
            index: tempArr.indexOf(currentItem)
        }
    }
    operateArr(index, inIndex) {
        let tempArr = [...this.state.arr];
        let deleteItem = tempArr.splice(index, 1);
        tempArr.splice(inIndex, 0, deleteItem[0]);
        this.setState({
            arr: tempArr
        });
    }
    render() {
        let { isDnd } = this.state;
        let { adminUnfocus, focusManage, newRoles,changeRoleName,removeRolesData,rolesSort,activeManage } = this.props;
        let memItemProps = {
            activeManage,
            isDnd,
            adminUnfocus,
            focusManage,
            changeRoleName,
            removeRolesData,
            findMess: this.findMess.bind(this),
            operateArr: this.operateArr.bind(this),
            changeActiveClass: this.changeActiveClass.bind(this),
            showEditModal: this.showEditModal.bind(this),
            changeReviseState: this.changeReviseState.bind(this)
        }
        return (
            <div className={styles.container}>
                <div className={styles.admin} style={{ paddingRight: 0 }}>
                    <div style={{ flex: 6 }}>
                        <Icon className={styles.iconColor + " " + styles.adminIcon} type="team" theme="outlined" />
                        普通管理组
                    </div>
                    <div style={{ flex: 4, textAlign: "right" }}>
                        {!isDnd && <Icon onClick={() => {
                            this.setState({
                                isDnd: true
                            });
                        }} className={styles.iconColor + " " + styles.adminIcon} type="swap" theme="outlined" />}
                        {!isDnd && <Icon className={styles.iconColor + " " + styles.adminIcon} type="plus" theme="outlined" onClick={() => {
                            confirm({
                                title: '新建管理组',
                                content: <Input autoFocus onChange={(e) => {
                                    addRoleInputValue = e.target.value;
                                }} />,
                                iconType: "null",
                                onOk() {
                                    // console.log(addRoleInputValue);
                                    if (!addRoleInputValue) {
                                        message.config({ maxCount: 1 });
                                        message.warning("请填写名称再提交");
                                        return;
                                    }
                                    newRoles({ name: addRoleInputValue, id: Guid() });
                                },
                                onCancel() { },
                            });
                        }} />}
                        {isDnd && <Button size="small" type="primary" onClick={() => {
                            this.setState({
                                isDnd: false
                            },()=>{
                                let listId = [];
                                // console.log(this.props.leftListArr);
                                // console.log(this.state.arr);
                                this.state.arr.forEach((v,i)=>{
                                    listId.push({Id:v.id,SortIndex:i});
                                })
                                rolesSort(listId);
                            });
                        }}>完成</Button>}
                    </div>
                </div>
                <div style={{height:"calc(100% - 40px)",overflowY:"scroll"}}>
                    {
                        this.state.arr.map((v, i) => (
                            <MemItem key={v.id} item={v} {...memItemProps} />
                        ))
                    }
                </div>
            </div>
        );
    }
}

export default MemLeftCom;
