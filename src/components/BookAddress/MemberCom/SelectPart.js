import { Component } from "react"
import { Modal, Input, Radio, Select, Icon } from "antd"
import styles from "./SelectPart.less"
import { List, Map, is } from "immutable"
import { dealSelectedPartKeys } from "./AddMember"
import { searchDepData } from "../../../services/BookAddress/BookAddress"

import TreeCom from "../TreeCom"

/* function mapTree(key, treeData) {
    let tempArr = [];
    treeData.forEach((v, i) => {
        if (v["key"] === key) {
            tempArr.push({ key, title: v["title"] });
        }
        if (v["key"] !== key && v["children"] && v["children"].length) {
            tempArr = tempArr.concat(mapTree(key, v["children"]));
        }
    });
    return tempArr;
}
function generateParts(selectedKeys, treeData) {
    let resultArr = [];
    selectedKeys.forEach((v, i) => {
        resultArr = resultArr.concat(mapTree(v, treeData));
    })
    return resultArr;
} */
function judgeExist(targetId,testList){
    for(let l=0;l<testList.length;l++){
        let testItem = testList[l];
        if(targetId === testItem["key"]){
            return true;
        }
    }
    return false;
}
let time = ""
class SelectPart extends Component {
    constructor(props) {
        super(props);
        let { selectedPartKeys } = props;
        this.state = {
            selectedPartKeys: List(selectedPartKeys).toJS(),
            searchData: []
        }
    }
    // 搜索页面 获取 部门数据
    getSearchData(keyWord) {
        let me = this;
        searchDepData({ Name: keyWord, PageINdex: 1 }).then(res => {
            // console.log(res);
            if (res.data.organizationList) {
                me.setState({
                    searchData: res.data.organizationList
                });
            }
        }, err => {
            console.log(err);
        });
    }
    // 操作 成员选中部门
    operSelectedPartKeys(key, e, custom) {
        let { selectedPartKeys } = this.state, tempArr = [];
        // 两种写法都可以，是由于 selectedKeys 引用问题，需要 每次改变放置一个新的 数据引用
        /* let tempKey = e["node"]?e["node"]["props"]["eventKey"]:key;
        if(custom){
            for (let i = 0; i < selectedKeys.length; i++) {
                let v = selectedKeys[i];
                if (v === tempKey) {
                    selectedKeys.splice(i, 1);
                    break;
                }
            }
        }else{
            e["selectedNodes"].forEach(v=>{
                tempArr.push(v["key"]);
            })
        } */
        // console.log(e);
        let tempKey = e["node"] ? e["node"]["props"]["eventKey"] : key,
            title = custom ? e["title"] : e["node"]["props"]["title"]["props"]["children"][0],
            type = custom ? e["type"] : e["node"]["props"]["type"];
        let selected = e["selected"];
        if (selected) {
            selectedPartKeys.push({ key: tempKey, title, type });
        } else {
            for (let i = 0; i < selectedPartKeys.length; i++) {
                let v = selectedPartKeys[i];
                if (v["key"] === tempKey) {
                    selectedPartKeys.splice(i, 1);
                    break;
                }
            }
        }
        this.setState({ selectedPartKeys });
    }
    render() {
        let { treeData, showSelectedModal, operSelectedModal, changePart, type } = this.props;
        let { selectedPartKeys,searchData } = this.state;
        let treeProps = {
            treeData,
            draggable: false,
            type,
            selectedKeys: dealSelectedPartKeys(selectedPartKeys),
            multiple: true,
            onSelect: (key, e) => {
                this.operSelectedPartKeys.call(this, key, e);
            }
        }
        // let selectedArr = generateParts(selectedKeys, treeData);
        return (
            <Modal
                title="选择成员所在部门"
                visible={showSelectedModal}
                centered={true}
                destroyOnClose={true}
                onCancel={() => { operSelectedModal(false); }}
                onOk={() => {
                    let tempArr = [];
                    selectedPartKeys.forEach(v => {
                        tempArr.push({ key: v["key"], title: v["title"], type: v["type"] });
                    })
                    changePart(selectedPartKeys);
                }}
                width={600}
                maskClosable={false}
            >
                <div className={styles.container}>
                    <div className={styles.leftItem}>
                        <Input className={styles.search} placeholder="搜索部门" onChange={(e) => {
                            e.persist();
                            let me = this;
                            clearTimeout(time);
                            time = setTimeout(() => {
                                if (!e.target.value.trim()) {
                                    this.setState({
                                        searchData: []
                                    });
                                    return;
                                }else{
                                    me.getSearchData(e.target.value);
                                }
                            }, 300);
                        }}/>
                        {
                            !searchData.length ? (
                                <div className={styles.partList}>
                                    <TreeCom {...treeProps} />
                                </div>
                            ) : ""
                        }
                        {
                            searchData.length ? (
                                <div className={styles.partList}>
                                    <div className={styles.searchTitle}>部门</div>
                                    {
                                        searchData.map(v=>(
                                            <div key={v["id"]} className={`${styles.searchDepItem} ${judgeExist(v["id"],selectedPartKeys)?styles.searchMemItemActive:""}`} onClick={()=>{
                                                let bool = true;
                                                selectedPartKeys.forEach(item=>{
                                                    if(v["id"] === item["key"]){
                                                        bool = false;
                                                    }
                                                });
                                                this.operSelectedPartKeys(v["id"], { selected: bool, title: v["name"], type: 0 }, true);
                                            }}>{v["name"]}</div>
                                        ))
                                    }
                                </div>
                            ):""
                        }
                    </div>
                    <div className={styles.rightItem}>
                        <div className={styles.title}>已选择的部门</div>
                        <div className={styles.selectedList}>
                            {
                                selectedPartKeys.map((v, i) => (
                                    <div key={i} className={styles.selectedPar}>
                                        <div>
                                            <Icon type={v["type"] == "0" ? "fork" : "user"} theme="outlined" />
                                            {v["title"]}
                                        </div>
                                        <div className={styles.itemClose}>
                                            <Icon className={styles.closed} type="close" theme="outlined" onClick={() => {
                                                this.operSelectedPartKeys(v["key"], { selected: false, title: v["title"], type: v["type"] }, true);
                                            }} />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default SelectPart;