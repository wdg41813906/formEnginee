import { Component } from "react";
import { Tree, Icon, Dropdown, Menu, Input, Button, Modal } from "antd";
import styles from "./TreeCom.less";
import {
    getOrganazition,
    organazitionModify,
    newDepartment,
    deleteDepartment
} from "../../services/BookAddress/BookAddress";
import { Map, List, is, fromJS } from "immutable";
import { Guid } from "../../utils/com";
import { Permission } from "../../utils/PlatformConfig";

const TreeNode = Tree.TreeNode;
const confirm = Modal.confirm;
let newDepName = "";

const loop = ({ data, draggable, isCheck, changeReviseState, addChildDep, deleteDep, singleOrMultiple, selectedData, reviseDepName, checkboxEvent, specialTree }) => data.map((item) => {
    // console.log(data);
    const ReviseDropDown = (
        <div className={styles.reviseContainer}>
            <Input autoFocus defaultValue={item.inputValue} value={item.inputValue} onChange={(e) => {
                console.log(e.target.value);
                changeReviseState(item.key, { inputValue: e.target.value });
            }}/>
            <div className={styles.reviseEdite}>
                <Button className={styles.reviseBtn} onClick={() => {
                    let tempObj = { reviseNameState: 1, isDownVisible: false };
                    item.title !== item.inputValue && (tempObj.inputValue = item.title);
                    changeReviseState(item.key, tempObj);
                }}>取消</Button>
                <Button className={styles.reviseBtn + " " + styles.reviseConfirm} onClick={() => {
                    // changeReviseState(item["key"], { reviseNameState: 1, isDownVisible: false, title: item["inputValue"] });
                    if (!item.inputValue) return;
                    reviseDepName(item.inputValue, item.key, item.departmentId, {
                        callBack: changeReviseState, params: {
                            key: item.key,
                            config: { reviseNameState: 1, isDownVisible: false, title: item.inputValue }
                        }
                    });
                }}>确定</Button>
            </div>
        </div>
    );
    let confirmModal = (obj) => {
        let tempObj = {
            title: obj.title,
            content: obj.content,
            iconType: obj.icon,
            onOk() {
                if (obj.type === "add") {
                    let newId = Guid();
                    
                    newDepartment({
                        ParentId: item.key,
                        Id: newId,
                        DepartmentId: item.departmentId,
                        Name: newDepName,
                        Platform: Permission
                    }).then(res => {
                        console.log(res);
                        if (res.data.isValid) {
                            let childObj = { key: newId, title: newDepName };
                            // childObj.isLeaf = !item.children || !item.children.length ? true : false;
                            childObj.isLeaf = !item.children || !item.children.length ? false : true;
                            addChildDep({ parentId: item.key, childObj });
                        }
                    }, err => {
                        console.log(err);
                    });
                }
                if (obj.type === "delete") {
                    console.log("删除");
                    let tempArr = [];
                    tempArr.push(item.key);//EntityIdList
                    deleteDepartment({ EntityIdList: tempArr, Platform: Permission }).then(res => {
                        console.log(res);
                        if (res.data.isValid) {
                            deleteDep({ key: item.key });
                        }
                    }, err => {
                        console.log(err);
                    });
                }
                
            },
            onCancel() {
            
            }
        };
        confirm(tempObj);
    };
    const menu = (
        <Menu style={{ padding: 0 }} onClick={(e) => {
            let key = e.key;
            switch (key) {
                case "0":
                    changeReviseState(item.key, { reviseNameState: 2, isDownVisible: true });
                    break;
                case "1":
                    changeReviseState(item.key, { isDownVisible: false });
                    confirmModal({
                        title: "新建部门", content: <Input autoFocus onChange={(e) => {
                            newDepName = e.target.value;
                        }}/>, icon: "none", type: "add"
                    });
                    break;
                case "2":
                    changeReviseState(item.key, { isDownVisible: false });
                    confirmModal({
                        title: `您确定要删除“${item.title}”吗？`,
                        content: "删除部门会将部门所关联的权限一并删除，此操作不可逆",
                        icon: "",
                        type: "delete"
                    });
                    break;
            }
        }}>
            <Menu.Item key="0" className={styles.menuItem}>
                修改名称
            </Menu.Item>
            <Menu.Item key="1" className={styles.menuItem}>
                添加子部门
            </Menu.Item>
            <Menu.Item key="2" className={styles.menuItem}>
                删除
            </Menu.Item>
        </Menu>
    );
    if (item.key === "6735565c-e2c2-465f-805d-d4d0d4371c7f") {
        console.log(item, selectedData);
    }
    let judgeChecked = (singleOrMultiple === 0 || specialTree) ? (selectedData.length ? selectedData.some(i => i.id === item.key) : false) : item.checked;
    let customItem = (
        <span id={item.key} style={{
            position: isCheck ? "relative" : "static",
            display: "inline-block",
            paddingRight: "20px",
            width: "calc(100% - 24px)"
        }}>{item.title}
            {isCheck && <div style={{ borderRadius: singleOrMultiple === 0 ? "50%" : 0 }}
                             className={`${styles.customCheck} ${judgeChecked ? styles.customChecked : ""}`}
                             onClick={(e) => {
                                 if (!(checkboxEvent instanceof Function)) return;
                                 e.stopPropagation();
                                 checkboxEvent(item, "0", !judgeChecked);
                             }}>
                {
                    judgeChecked && <Icon type="check" theme="outlined" className={styles.checkIcon}/>
                }
            </div>}
            {draggable && item.reviseNameState === 1 &&
            <Dropdown getPopupContainer={() => document.getElementById(item.key)} visible={item.isDownVisible}
                      overlay={menu} trigger={["click"]} onVisibleChange={(visible) => {
                // console.log(visible);
                changeReviseState(item.key, { isDownVisible: visible });
            }}>
                <Icon className={styles.creditIcon} type="ellipsis" theme="outlined"/>
            </Dropdown>}
            {draggable && item.reviseNameState === 2 &&
            <Dropdown getPopupContainer={() => document.getElementById(item.key)} visible={item.isDownVisible}
                      overlay={ReviseDropDown} trigger={["click"]} onVisibleChange={(visible) => {
                let tempState = undefined, tempObj = {};
                if (item.reviseNameState === 2 && !visible) {
                    tempState = 1;
                    item.title !== item.inputValue && (tempObj.inputValue = item.title);
                }
                tempObj.reviseNameState = tempState;
                tempObj.isDownVisible = visible;
                changeReviseState(item.key, tempObj);
            }}>
                <Icon className={styles.creditIcon} type="ellipsis" theme="outlined"/>
            </Dropdown>}
        </span>
    );
    if (item.children && item.children.length) {
        return <TreeNode type={item.type} dep={item.departmentId} icon={<Icon className={styles.treeIcon}
                                                                              type={"apartment"}/*  type={item.type == "0" ? "fork" : "user"} */
                                                                              theme="outlined"/>} isLeaf={item.isLeaf}
                         key={item.key} title={customItem}>{loop({
            data: item.children,
            draggable,
            isCheck,
            changeReviseState,
            addChildDep,
            deleteDep,
            singleOrMultiple,
            selectedData,
            reviseDepName,
            checkboxEvent,
            specialTree
        })}</TreeNode>;
    }
    return <TreeNode type={item.type} dep={item.departmentId} icon={<Icon className={styles.treeIcon}
                                                                          type={"apartment"}/*  type={item.type == "0" ? "fork" : "user"} */
                                                                          theme="outlined"/>} isLeaf={item.isLeaf}
                     key={item.key} title={customItem}/>;
});

// 这里 还要 判断 对于 部门 选择时候的 初始化 状态
function changeData(treeData, selectedData) {
    treeData.forEach(v => {
        v.reviseNameState = 1;
        v.isDownVisible = false;
        v.inputValue = v.title;
        if (selectedData instanceof Array) {
            v.checked = selectedData.some(item => item.id === v.key);
        }
        if (v.children && v.children.length) {
            changeData(v.children, selectedData);
        }
    });
    return treeData;
}

function formateData(treeData) {
    if (!treeData instanceof Array || !treeData.length) return [];
    // let tempArr = [];
    treeData.forEach(v => {
        v.key = v.id;
        v.title = v.name;
        // tempArr.push({...v,key:v["id"],title:v["name"]});
        if (v.children && v.children.length) {
            formateData(v.children);
        }
    });
    return treeData;
}

// 新增删除 树节点
function reviseTreeData({ treeData, key, childObj, callback, parentItem }) {
    if (!treeData || !treeData.length) return;
    for (let i = 0; i < treeData.length; i++) {
        let v = treeData[i];
        if (v.key === key) {
            callback({ item: v, index: i, treeData, childObj, parentItem });
            break;
        }
        if (v.children && v.children.length) {
            reviseTreeData({ treeData: v.children, key, childObj, callback, parentItem: v });
        }
    }
    // console.log(treeData);
    return treeData;
}

class TreeCom extends Component {
    constructor(props) {
        super(props);
        let { treeData, selectedData, draggable } = props;
        treeData = changeData(formateData(treeData), selectedData);
        props.setTreeData && props.setTreeData(treeData);
        this.state = {
            treeData,
            loadedKeys: [],
            draggable: draggable, //动态修改 是否能拖动
            currentIsDrag: true
        };
        // 第一次的数据获取 应该放到 model中,componentWillReceiveProps这里会出问题，由于 当 props 发生变化时，treeData 会成初始化的
        // this.getOrganazitionData("","init");
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        console.log(nextProps);
        if (!is(nextProps.treeData, prevState.treeData)) {
            console.log("执行");
            return {
                treeData: changeData(formateData(nextProps.treeData), nextProps.selectedData)
            };
        }
        return null;
    }
    
    getOrganazitionData(parentId, type, dataType) {
        let me = this;
        return getOrganazition({ parentId: parentId, type: dataType ? dataType : 0 }).then(res => {
            // console.log(res);
            let newArr = formateData(res.data), dealArr = [], tempArr = me.state.loadedKeys;
            ;
            // console.log(newArr);
            type === "init" && (dealArr = changeData(newArr));
            // 对于 部门选择时候的问题(这是成员列表 选择 的 树结构用法)
            if (me.props.selectedData && me.props.selectedData.length) {
                newArr.forEach(v => {
                    me.props.selectedData.forEach(item => {
                        if (v.key === item.key) {
                            v.checked = true;
                        }
                    });
                });
            }
            if (type === "change") {
                tempArr.push(parentId);
                let addChildren = (parentId, treeData, childrenArr) => {
                    for (let i = 0; i < treeData.length; i++) {
                        let v = treeData[i];
                        if (v.key === parentId) {
                            v.children = childrenArr;
                            break;
                        }
                        if (v.children && v.children.length) {
                            addChildren(parentId, v.children, childrenArr);
                        }
                    }
                    return treeData;
                };
                dealArr = changeData(addChildren(parentId, this.state.treeData, newArr));
            }
            // 初始化 checked的 状态
            if (me.props.selectedData && me.props.selectedData.length) {
                dealArr = changeData(dealArr, me.props.selectedData);
            }
            me.setState({
                treeData: dealArr,
                loadedKeys: tempArr
            }, () => {
                me.props.setTreeData && me.props.setTreeData(dealArr);
            });
        }, err => {
            console.log(err);
        });
    }
    
    changeTreeData(treeData, resultArr) {
        let me = this;
        organazitionModify({ organizationActionRequests: resultArr, Platform: Permission }).then(res => {
            console.log(res);
            if (res.data.isValid) {
                console.log("修改成功");
                me.setState({
                    treeData
                });
            }
        }, err => {
            console.log(err);
        });
        // 这种 保证 前端 操作的流畅性，但是就是不能保证后台是否成功
        /* this.setState({
            treeData
        },()=>{
            // 给后台进行 保存
            organazitionModify(resultArr).then(res=>{
                console.log(res);
                if(res.data.isValid){
                    console.log("修改成功");
                }
            },err=>{
                console.log(err);
            });
        }); */
    }
    
    _changeState(treeData, key, propsObj) {
        treeData.forEach(v => {
            if (v.key === key) {
                let tempPropsArr = Object.keys(propsObj);
                tempPropsArr.forEach(item => {
                    propsObj[item] !== undefined && (v[item] = propsObj[item]);
                });
            }
            if (v.children && v.children.length) {
                this._changeState(v.children, key, propsObj);
            }
        });
        return treeData;
    }
    
    // 改变 数据中的 值，reviseNameState,isDownVisible等
    changeReviseState(key, propsObj) {
        let { treeData, draggable, currentIsDrag } = this.state, { isDownVisible } = propsObj;
        treeData = this._changeState(treeData, key, propsObj);
        // console.log(treeData);
        // 为了解决 在 downVisible 中 不允许 拖动的 bug
        if (draggable) {
            !isDownVisible && (currentIsDrag = true);
            isDownVisible && (currentIsDrag = false);
        }
        this.setState({
            treeData,
            currentIsDrag
        });
    }
    
    // 新增子部门
    addChildDep({ parentId, childObj }) {
        let loadedArr = this.state.loadedKeys,
            isLoaded = loadedArr.filter(v => (v === parentId)),
            treeData = this.state.treeData,
            tempArr = [];
        // console.log(isLoaded);
        if (!isLoaded.length) {
            // 如果为 子节点 并且 isLeaf 为false，需要将其该变成true；
            tempArr = reviseTreeData({
                treeData, key: parentId, callback: ({ item }) => {
                    item.isLeaf && (item.isLeaf = false);
                }
            });
        } else {
            tempArr = reviseTreeData({
                treeData, key: parentId, childObj, callback: ({ item, childObj }) => {
                    !item.children && (item.children = []);
                    item.children.push({
                        ...childObj,
                        reviseNameState: 1,
                        isDownVisible: false,
                        inputValue: childObj.title
                    });
                }
            });
        }
        this.setState({
            treeData: tempArr
        });
    }
    
    // 删除 当前部门
    deleteDep({ key }) {
        let treeData = this.state.treeData,
            loadedArr = this.state.loadedKeys,
            tempArr = [];
        tempArr = reviseTreeData({
            treeData, key, callback: ({ index, treeData, parentItem }) => {
                treeData.splice(index, 1);
                // console.log(parentItem);
                // console.log(treeData);
                if (!treeData.length) {
                    parentItem.isLeaf = true;
                    for (let i = 0; i < loadedArr.length; i++) {
                        let item = loadedArr[i];
                        if (item === parentItem.key) {
                            loadedArr.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        });
        this.setState({
            treeData: tempArr,
            loadedKeys: loadedArr
        });
    }
    
    // 修改 inputValue 的时候
    onDrop(info, treeData) {
        console.log(info, treeData);
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        const dropPos = info.node.props.pos.split("-");
        /* 判断是否 能够 进行 拖动 */
        if (treeData.filter(item => !item.parentId).some(item => (item.id === dropKey || item.id === dragKey))) return;
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);//这个值是 放入的位置是在前还是后
        let loop = (data, key, parentId = "", callback) => {
            data.forEach((v, index, arr) => {
                if (v.key === key) {
                    callback(v, index, arr, parentId);
                }
                if (v.children && v.children.length) {
                    loop(v.children, key, v.key, callback);
                }
            });
        };
        let tempObj; //拖动的项
        loop(treeData, dragKey, "", (v, index, arr) => {
            arr.splice(index, 1);
            tempObj = v;
        });
        // console.log(tempObj);
        let sortIndex = tempObj.sortIndex, name = tempObj.title, id = tempObj.key, parentId = "", prevObj = null;
        if (info.dropToGap) { //dropToGap指的是 是在 拖动 目标的 缝隙里还是在他的 上面
            let i, ar;
            loop(treeData, dropKey, "", (v, index, arr, parId) => {
                i = index;
                ar = arr;
                parentId = parId;
            });
            if (dropPosition === -1) {
                i != 0 && (prevObj = ar[i - 1]);
                ar.splice(i, 0, tempObj);
            } else {
                prevObj = ar[i];
                ar.splice(i + 1, 0, tempObj);
            }
        } else {
            loop(treeData, dropKey, "", (v) => {
                v.isLeaf = false;
                v.children = v.children || [];
                v.children.push(tempObj);
            });
            parentId = dropKey;
            // prevObj = {};
        }
        let resultArr = [];
        resultArr.push({
            SortIndex: sortIndex,
            Name: name,
            Id: id,
            ParentId: parentId,
            OperationStatus: 2
        });
        prevObj && resultArr.push({
            SortIndex: prevObj.sortIndex,
            Name: prevObj.name,
            Id: prevObj.id,
            ParentId: prevObj.parentId,
            OperationStatus: 3
        });
        this.changeTreeData(treeData, resultArr);
    }
    
    loadData(node) {
        let me = this;
        return new Promise((resolve, reject) => {
            if (node.props.children) {
                resolve();
                return;
            }
            resolve(this.getOrganazitionData(node.props.eventKey, "change", me.props.type));
        });
        // return this.getOrganazitionData(node["props"]["eventKey"],"change",this.props.type);
    }
    
    render() {
        let { selectedKeys, onSelect, /* draggable, */ isCheck, multiple, styleList, singleOrMultiple, selectedData, reviseDepName, checkboxEvent, specialTree } = this.props;
        let { treeData, loadedKeys, draggable, currentIsDrag } = this.state;
        let changeReviseState = this.changeReviseState.bind(this),
            addChildDep = this.addChildDep.bind(this),
            deleteDep = this.deleteDep.bind(this);
        return (
            <Tree
                className={`draggable-tree ${styles[styleList]} ${styles.treeScroll}`}
                draggable={draggable && currentIsDrag}
                showIcon
                multiple={multiple === undefined ? false : multiple}
                onDrop={(info) => {
                    this.onDrop(info, treeData);
                }}
                // defaultExpandedKeys={[treeData[0]["key"]]}
                loadData={this.loadData.bind(this)}
                loadedKeys={loadedKeys}
                selectedKeys={selectedKeys ? [...selectedKeys] : []} /* 这种写法是必须的，感觉内部 当 selectedKeys 的数据引用问题 */
                onSelect={(key, e) => {
                    if (e && e.selected) {
                        onSelect && onSelect(key[0], e, undefined, treeData);
                    }
                }}
            >
                {loop({
                    data: treeData,
                    draggable,
                    isCheck,
                    changeReviseState,
                    addChildDep,
                    deleteDep,
                    singleOrMultiple,
                    selectedData,
                    reviseDepName,
                    checkboxEvent,
                    specialTree
                })}
            </Tree>
        );
    }
}


export default TreeCom;
