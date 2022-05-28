import { Component } from "react"
import { Input, Icon, Checkbox } from "antd"
import { connect } from "dva";
import styles from "./searchName.less"
import { List, Map, is } from "immutable"

let time = null;
// 判断是否全选了
function judgeIsAll(arr) {
    return arr.filter(item=>item.show !== false).every(a=>a.show);
}

class SearchName extends Component { 
    constructor(props) {
        super(props);
        let newFieldNameArr= List(this.props.fieldNameArr).toJS();
        this.state = {
            fieldNameArr: newFieldNameArr, //这里的 数据 结构 重写 两个 配置项 show 为 选中项 show 为 是否 显示
            isAll: judgeIsAll(newFieldNameArr),
            isSearchAll: false
        }
    }
    // 全选
    selectAll(type, e) {
        this._selectAll({
            isAll: e.target.checked,
            type,
            fieldNameArr:type==="isSearchAll"?this.state.fieldNameArr:[]
        });
        this.setState({
            [type]: !this.state[type]
        });
    }
    _selectAll({isAll,type,fieldNameArr}){
        let tempFiledNameArr = this.state.fieldNameArr;
        if(type === "isAll"){
            tempFiledNameArr.forEach(v=>{
                v.show = isAll
            });
        }
        if(type === "isSearchAll"){
            tempFiledNameArr.forEach(v=>{
                fieldNameArr.forEach(i=>{
                    if(i.name === v.name){
                        v.show = isAll;
                    }
                });
            });
        }
        this.setState({
            fieldNameArr:tempFiledNameArr,
        },()=>{
            this.props.backNewfieldArr({fieldNameArr:tempFiledNameArr});
        });
    }
    // 搜索
    searchWord(e) {
        e.stopPropagation();
        let me = this;
        let currentValue = e.target.value;
        let tempArr = this.state.fieldNameArr;
        time && clearTimeout(time);
        time = setTimeout(() => {
            tempArr.forEach(item=>{
                if(currentValue){
                    if(item["name"].indexOf(currentValue) !== -1){
                        item.show = true;
                    }else{
                        item.show = false;
                    }
                }else{
                    item.show = true;
                }
            });
            me.setState({
                fieldNameArr: tempArr,
                [currentValue?"isSearchAll":"isAll"]:judgeIsAll(tempArr)
            });
        }, 400);
    }
    // 数据管理 的 字段名选择 逻辑
    _selectFieldItem(id) {
        let tempFiledNameArr = List(this.state.fieldNameArr).toJS();
        tempFiledNameArr.forEach(v => {
            if (v["id"] === id) {
                v["show"] = !v["show"];
            }
        });
        let isAll = judgeIsAll(tempFiledNameArr);
        this.setState({
            fieldNameArr:tempFiledNameArr,
            isAll
        },()=>{
            this.props.backNewfieldArr({fieldNameArr:tempFiledNameArr});
        });
    }
    // 选择项
    selectItem(id, e) {
        this._selectFieldItem(id);
    }
    render() {
        let { fieldNameArr, isAll,isSearchAll } = this.state;
        const showType = fieldNameArr.filter(item=>item.show!==false).length === this.props.fieldNameArr.length;
        console.log(fieldNameArr);
        return (
            <div className={styles.container}>
                <Input className={styles.serachInput} onChange={this.searchWord.bind(this)} />
                <div className={styles.checkboxContainer}>
                    {
                        <Checkbox checked={showType?isAll:isSearchAll} className={`${styles.checkBox} ${styles.allCheckBox}`} onChange={this.selectAll.bind(this, showType?"isAll":"isSearchAll")}>{showType?"全选":"搜索结果全选"}</Checkbox>
                    }
                    {/* <Checkbox className={`${styles.checkBox} ${styles.checkboxTitle}`}>标题</Checkbox> */}
                    {
                        fieldNameArr.map((v, i) => (
                            <Checkbox checked={v.show} key={i} className={styles.checkBox} onChange={this.selectItem.bind(this, v["id"])}>{v["name"]}</Checkbox>
                        ))
                    }
                    {
                        !fieldNameArr.length && <div className={styles.checkBox} style={{ textAlign: "center" }}>搜索暂无内容</div>
                    }
                </div>
            </div>
        );
    }
}

export default SearchName;