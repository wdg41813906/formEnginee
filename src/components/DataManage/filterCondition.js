import { Component, Fragment } from "react"
import { Icon, Select, Button, message } from "antd"
import moment from 'moment';
import styles from "./filterCondition.less"
import { List, is } from "immutable"
import { optionObj } from "../../utils/com"
import { getLocation } from "../../services/DataManage/DataManage"

import GenerateFilterCondition from "./filterHOC"
const { Option, OptGroup } = Select;
// 当 fieldNameArr 隐藏了 filterConditionArr 的 项，需要 重新初始化
const _initFilterConditionArr = (filterConditionArr, fieldNameArr) => {
    debugger
    let deleteIndex = filterConditionArr.reduce((prev, next, index) => {
        let existItem = fieldNameArr.filter(item => item.id === next.id);
        if (existItem.length && !existItem[0].show) {
            prev.push(index);
            return prev;
        } else {
            return prev;
        }
    }, []);
    //console.log(deleteIndex);
    if (!deleteIndex.length) return filterConditionArr;
    for (let i = 0; i < filterConditionArr.length; i++) {
        if (deleteIndex.indexOf(i) === -1) {
            filterConditionArr.splice(i, 1);
            i--;
        }
    }
    //console.log(filterConditionArr);
    return filterConditionArr;
}
class FilterCondition extends Component {
    constructor(props) {
        super(props);
        // console.log("props", props);
        this.state = {
            fieldNameArr: List(props.fieldNameArr).toJS(),//只有显示 出来的 字段 才能 进行 条件筛选
            isFixedFilter: props.isFixedFilter,
        }
        this.state.filterConditionArr = _initFilterConditionArr(props.filterConditionArr, props.fieldNameArr);
        const { fieldNameArr } = this.state;
        this.state.totalType = fieldNameArr.length && fieldNameArr[0]["totalType"] ? this.state.fieldNameArr[0]["totalType"] : 0;

        this.confirmOrFilter = this.confirmOrFilter.bind(this);
        this.filterRemoveValue = this.filterRemoveValue.bind(this);
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (!is(nextProps, prevState.props)) {
            return {
                props: nextProps,
                fieldNameArr: List(nextProps.fieldNameArr).toJS(),
                filterConditionArr: _initFilterConditionArr(nextProps.filterConditionArr, nextProps.fieldNameArr)
            }
        }
        return null
    }
    componentWillUnmount() {
        //console.log("页面是否销毁，销毁在这里进行 请求，判断 是否需要请求", this.state.filterConditionArr);
        const { fieldNameArr, filterConditionArr, totalType } = this.state;
        filterConditionArr.forEach(item => {
            item.totalType = totalType;
        });
        this.props.updateFilterCondition instanceof Function && this.props.updateFilterCondition(fieldNameArr, filterConditionArr);
    }
    /* componentWillReceiveProps(nextProps){
        console.log(nextProps);
        if(!is(List(nextProps.fieldNameArr),List(this.state.fieldNameArr))){
            this.state.fieldNameArr = nextProps.fieldNameArr;
        }
    } */
    async getLocationArr(tempObj) {
        let targetObj = {};
        if (tempObj.type !== "") {
            targetObj = { [tempObj.type]: tempObj.value };
        }
        let { data } = await getLocation(targetObj);
        if (data && data instanceof Array) {
            this._setLocationArr({ data, id: tempObj.id, type: tempObj.type });
        }
    }
    _setLocationArr({ data, id, type }) {
        // let filterConditionArr = List(this.state.filterConditionArr).toJS();
        let { filterConditionArr } = this.state;
        filterConditionArr.forEach(v => {
            if (v.id === id) {
                if (type === "") {
                    v.provArr = data;
                }
                if (type === "ProId") {
                    v.cityArr = data;
                }
                if (type === "CityId") {
                    v.countArr = data;
                }
            }
        });
        this.setState({ filterConditionArr });
    }
    filterFeildChange(type, id) {
        // let tempFieldNameArr = List(this.state.fieldNameArr).toJS(),tempFilterConditionArr = List(this.state.filterConditionArr).toJS();
        let { fieldNameArr: tempFieldNameArr, filterConditionArr: tempFilterConditionArr } = this.state;
        if (type == 1) {
            tempFieldNameArr.forEach(v => {
                if (v.id === id) {
                    v.isFilter = true;
                    let tempValue = "";
                    let tempObj = { ...v, value: tempValue, condition: v.type !== 'subForm' ? optionObj[v.type][0]["value"] : "" };
                    // 日期类型 对 value需要特殊处理，并且加入 provArr,cityArr,countArr 存储 省市区；
                    if (v.type == "date") {
                        tempObj.extendedType = "0";
                        tempValue = moment().format("YYYY-MM-DD HH:mm:ss");
                    }
                    if (v.type == "location") {
                        tempObj.provArr = [];
                        tempObj.cityArr = [];
                        tempObj.countArr = [];
                    }
                    tempFilterConditionArr.push(tempObj);
                }
            });
        }
        if (type == 0) {
            tempFieldNameArr.forEach(v => {
                if (v.id === id) {
                    v.isFilter = false;
                }
            });
            for (let i = 0; i < tempFilterConditionArr.length; i++) {
                let item = tempFilterConditionArr[i];
                if (item.id === id) {
                    tempFilterConditionArr.splice(i, 1);
                    break;
                }
            }
        }
        this.setState({ fieldNameArr: tempFieldNameArr, filterConditionArr: tempFilterConditionArr });
    }
    changeConditionValue(id, keyValue, callBack) {
        // let filterConditionArr = List(this.state.filterConditionArr).toJS();
        let { filterConditionArr } = this.state;
        filterConditionArr = filterConditionArr.map(v => {
            if (v.id === id) {
                v = { ...v, ...keyValue }
            }
            return v;
        })
        this.setState({ filterConditionArr }, () => {
            callBack instanceof Function && callBack();
        });
    }
    filterRemoveValue() {
        // let filterConditionArr = List(this.state.filterConditionArr).toJS();
        let { filterConditionArr } = this.state;
        filterConditionArr.forEach(v => {
            v.value = ""
        });
        this.setState({ filterConditionArr });
    }
    changeExtendedType(e) {
        this.setState({
            totalType: e
        });
    }
    confirmOrFilter(e) {
        const { fieldNameArr, filterConditionArr } = this.state;
        message.success("确定修改权限成功");

        this.props.containerClick instanceof Function && (this.props.type !== "authority" ? this.props.containerClick(e) : this.props.containerClick(fieldNameArr, filterConditionArr));
    }
    render() {
        let { isFixedFilterModal, templateId, FormTemplateVersionId, type, mainFormId } = this.props;
        let { fieldNameArr, isFixedFilter, filterConditionArr, totalType } = this.state;
        let selectFilterArr = [];
        fieldNameArr.forEach(v => {
            v.isFilter && selectFilterArr.push(v.id);
        });
        fieldNameArr = fieldNameArr.filter(v => v.type !== "boolean" && v.show);
        let subFormItems = fieldNameArr.filter(item => item.formId !== mainFormId);
        let systemFormItems = fieldNameArr.filter(item => item.sid === "system");
        let generateFilterConditionProps = {
            templateId,
            FormTemplateVersionId,
            filterConditionArr,
            changeConditionValue: this.changeConditionValue.bind(this),
            filterFeildChange: this.filterFeildChange.bind(this),
            getLocationArr: this.getLocationArr.bind(this)
        }
        return (
            <div className={`${styles.container} ${isFixedFilter ? styles.fixedContainer : ""}`}>
                {
                    type === "authority" ? null : <Fragment>
                        <Icon className={styles.affixed} type="pushpin" theme="outlined" title={isFixedFilter ? "取消固定显示" : "固定显示"} onClick={() => { isFixedFilterModal && isFixedFilterModal(); }} />
                        <div className={styles.header}>
                            筛选符合以下<Select value={totalType} className={styles.noBoderSelect} onChange={this.changeExtendedType.bind(this)}>
                                <Option value={0}>所有</Option>
                                <Option value={1}>任一</Option>
                            </Select>条件的数据
                </div>
                    </Fragment>
                }
                <div>
                    <div className={styles.filterText}>筛选条件</div>
                    <Select
                        mode="tags"
                        placeholder="添加筛选条件"
                        className={styles.filterSelect}
                        value={selectFilterArr}
                        onSelect={(e, option) => {
                            this.filterFeildChange(1, e);
                            fieldNameArr.forEach(v => {
                                if (v.id == e && v.type == "location") {
                                    this.getLocationArr({ type: "", value: "", id: e });
                                }
                            });
                        }}
                        onDeselect={(e) => { this.filterFeildChange(0, e) }}
                    >
                        {fieldNameArr.filter(item => item.formId === mainFormId).map((v, i) => {
                            if (v.type === "subform") {
                                let currentSubItems = subFormItems.filter(d => (d.formId === v.id));
                                return (
                                    <OptGroup label={v.name} key={i}>
                                        {currentSubItems.map((child, j) => (
                                            <Option key={j} value={child.id}>{child.name}</Option>
                                        ))
                                        }
                                    </OptGroup>
                                )
                            } else {
                                return <Option key={i} value={v.id}>{v.name}</Option>
                            }
                            // return <Option key={i} value={v.id}>{v.name}</Option>
                        })}
                        {fieldNameArr.filter(item => item.id === "system").map((v, i) => {
                            return (
                                <OptGroup label={v.name} key={`${v.code}${i}`}>
                                    {systemFormItems.map((child, j) => (
                                        <Option key={`${v.code}${j}`} value={child.id}>{child.name}</Option>
                                    ))
                                    }
                                </OptGroup>
                            )
                        })}
                    </Select>
                </div>
                <div className={`${styles.filterList} ${isFixedFilter ? styles.filterListFixed : styles.filterListGeneral}`}>
                    <GenerateFilterCondition {...generateFilterConditionProps} />
                </div>
                <div className={styles.filterBtn}>
                    {
                        <Button className={styles.filter} icon={type !== "authority" ? "search" : ""} type="primary" onClick={this.confirmOrFilter}>{type !== "authority" ? "筛选" : "确定"}</Button>
                    }
                    <Button className={styles.filter} icon={type !== "authority" ? "tool" : ""} onClick={this.filterRemoveValue}>
                        清除
                    </Button>
                    {
                        type !== "authority" ? <Button icon="close" onClick={this.confirmOrFilter}>关闭</Button> : null
                    }
                </div>
            </div>
        );
    }
}

export default FilterCondition;
