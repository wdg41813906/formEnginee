import { Fragment, useState, useEffect } from "react";
import moment from "moment";
import { Select, Button, Input, InputNumber, DatePicker, message, Tooltip } from "antd";
import styles from "./AdvancedSearch.less";
import { Com } from "../../utils";

function AdvancedSearch(props) {
    const [filterValues, setFilterValue] = useState([]);
    const [extendedType, setExtendedType] = useState("0");
    
    useEffect(() => {
        let filterSearchValue = props.filterSearchValue;
        if (filterValues.length === 0) {
            let arr = [];
            let dataFilter = props.dataFilter;
            dataFilter.forEach(ele => {
                let tempOptionArr = ele.filterValueType ? ele.filterValueType.reduce((p, n) => {
                    p.push({ name: n, ...Com.configObj[n] });
                    return p;
                }, []) : Com.optionObj[ele.valueType];
                let obj = {
                    key: ele.isGroup ? ele.key : ele.dataIndex,
                    code: ele.code,
                    valueType: ele.valueType,
                    extendedType,
                    select: tempOptionArr ? tempOptionArr[0].value : "",
                    formCode: ele.formCode,
                    formType: ele.formType
                };
                arr.push(obj);
            });
            setFilterValue(arr);
        } else {
            setFilterValue(props.filterSearchValue);
        }
        if (JSON.stringify(filterSearchValue) !== "[]") setExtendedType(filterSearchValue[0].extendedType);
    }, []);
    
    function Validator() {
        if (filterValues.length === 0) return "请填写筛选条件!";
        else return null;
    }
    
    // 查询按钮点击事件
    function filterSearch() {
        let valid = Validator();
        if (valid) {
            message.error(valid);
            return;
        }
        props.addFilterSearchValue(filterValues);
    }
    
    let showDataFilter = props.dataFilter.filter(a => props.showFields.includes(a.dataIndex) || props.showFields.includes(a.key));
    
    function onFilterComponent(e, ele, methodType, id) {
        let tempObj = filterValues.find(a => ele.isGroup ? a.key === ele.key : a.key === ele.dataIndex);
        if (ele.filterComponentProps.type === "Cascader") {
            if (tempObj) {
                if (tempObj.filter) {
                    let filterObj = tempObj.filter.find(b => b.key === id);
                    if (filterObj) {
                        filterObj.address = e;
                        setFilterValue([...filterValues]);
                    } else {
                        let tempChildren = ele.children.find(a => a.key === id);
                        let tempTitle = "";
                        for (let key in ele.filterComponentProps.groupItems) {
                            if (ele.filterComponentProps.groupItems[key].id === id) tempTitle = key;
                        }
                        let tempChildrenThen = {
                            code: tempChildren.code,
                            key: tempChildren.key,
                            title: tempTitle,
                            address: e
                        };
                        tempObj[methodType].push(tempChildrenThen);
                        setFilterValue([...filterValues]);
                    }
                } else {
                    let tempChildrenThen = { address: e };
                    ele.children.forEach(a => {
                        if (a.key === id) {
                            tempChildrenThen.code = a.code;
                            tempChildrenThen.key = a.key;
                        }
                    });
                    
                    for (let key in ele.filterComponentProps.groupItems) {
                        if (ele.filterComponentProps.groupItems[key].id === id) tempChildrenThen.title = key;
                    }
                    tempObj.code = ele.filterComponentProps.type;
                    tempObj[methodType] = [tempChildrenThen];
                    setFilterValue([...filterValues]);
                }
            } else {
                let obj = {
                    key: ele.isGroup ? ele.key : ele.dataIndex,
                    extendedType,
                    code: ele.filterComponentProps.type,
                    valueType: ele.valueType
                };
                let tempChildrenThen = { address: e };
                
                ele.children.forEach(a => {
                    if (a.key === id) {
                        tempChildrenThen.code = a.code;
                        tempChildrenThen.key = a.key;
                    }
                });
                
                for (let key in ele.filterComponentProps.groupItems) {
                    if (ele.filterComponentProps.groupItems[key].id === id) tempChildrenThen.title = key;
                }
                
                obj[methodType] = [tempChildrenThen];
                setFilterValue([...filterValues, obj]);
            }
        } else {
            if (tempObj) {
                tempObj[methodType] = e;
                setFilterValue([...filterValues]);
            } else {
                let obj = {
                    key: ele.isGroup ? ele.key : ele.dataIndex,
                    code: ele.code,
                    valueType: ele.valueType,
                    extendedType
                };
                obj[methodType] = e;
                setFilterValue([...filterValues, obj]);
            }
        }
    }
    
    function GetValueCom(tempFilterValue, ele) {
        // 复杂控件 || 自定义控件, 自定义渲染
        if (ele.FilterComponent) {
            let { FilterComponent, dataIndex, filterComponentProps, isGroup, key } = ele;
            const setFilterValue = (value, id) => onFilterComponent(value, ele, "filter", id);
            let tempFilter = filterValues.find(a => isGroup ? a.key === key : a.key === dataIndex);
            let tempFilterList = {};
            if (filterComponentProps.type === "Cascader") {
                if (tempFilter && tempFilter.filter) tempFilter.filter.forEach(a => tempFilterList[a.title] = a.address);
                else tempFilterList = { province: undefined, city: undefined, area: undefined, detail: undefined };
            }
            else tempFilterList = tempFilter ? tempFilter.filter : undefined;
            return <FilterComponent {...filterComponentProps} setFilterValue={setFilterValue}
                                    filterValue={tempFilterList}/>;
        }
        
        // 默认渲染方式，为空 || 不为空的情况下, 不渲染
        if (tempFilterValue && tempFilterValue.select === "2" || tempFilterValue && tempFilterValue.select === "3") return;
        switch (ele.valueType) {
            case "number":
                return <InputNumber onChange={e => onFilterValue(e, ele, "filter")} style={{ width: 150 }}
                                    placeholder='请填写筛选内容!'/>;
            case "datetime":
                if (tempFilterValue && tempFilterValue.select === "12") return <DatePicker.RangePicker
                    onChange={date => onFilterValue(date, ele, "filter", "RangePicker")}/>;
                return <DatePicker
                    onChange={date => onFilterValue(date ? moment(date).format("YYYY-MM-DD") : null, ele, "filter")}
                    style={{ width: 150 }}/>;
            case "string":
                return <Input style={{ width: 150 }} placeholder=""
                              onChange={e => onFilterValue(e.target.value, ele, "filter")}
                              value={tempFilterValue ? tempFilterValue.filter : ""} placeholder='请填写筛选内容!'/>;
            default:
                return null;
        }
    }
    
    function onFilterValue(e, ele, methodType, inputType) { // inputType 特殊类控件判断所需字段
        let obj = {
            key: ele.isGroup ? ele.key : ele.dataIndex,
            code: ele.code,
            valueType: ele.valueType,
            extendedType
        };
        let tempObj = filterValues.find(a => ele.isGroup ? a.key === ele.key : a.key === ele.dataIndex);
        if (tempObj) {
            if (inputType === "RangePicker") {
                let [filter, filterSecond] = [moment(e[0]).format("YYYY-MM-DD"), moment(e[1]).format("YYYY-MM-DD")];
                tempObj.filter = filter;
                tempObj.filterSecond = filterSecond;
            } else {
                tempObj[methodType] = e;
            }
            setFilterValue([...filterValues]);
        } else {
            if (inputType === "RangePicker") {
                let [filter, filterSecond] = [moment(e[0]).format("YYYY-MM-DD"), moment(e[1]).format("YYYY-MM-DD")];
                obj.filter = filter;
                obj.filterSecond = filterSecond;
            } else {
                obj[methodType] = e;
            }
            setFilterValue([...filterValues, obj]);
        }
    }
    
    function setFilterExtendedType(e) {
        setExtendedType(e);
        filterValues.forEach(element => {
            element.extendedType = e;
        });
        setFilterValue([...filterValues]);
    }
    
    return (
        <div className={styles.container}>
            {showDataFilter.length > 0 ? (
                <div className={styles.filterContainer}>
                    <div className={styles.searchExtendedType}>
                        <span>筛选符合</span>
                        <Select defaultValue={extendedType} style={{ margin: "0 6px" }}
                                onChange={e => setFilterExtendedType(e)}>
                            {Com.searchLimit.map((item, i) => (
                                <Select.Option key={i} value={item.value}>{item.key}</Select.Option>
                            ))}
                        </Select>
                        <span>条件的数据</span>
                    </div>
                    <Button icon="search" type="primary" className={styles.searchBtn} onClick={() => filterSearch()}>
                        查询
                    </Button>
                    <div className={styles.filterAll}>
                        {
                            showDataFilter.map((ele, index) => {
                                let tempOptionArr = ele.filterValueType ? ele.filterValueType.reduce((p, n) => {
                                    p.push({ name: n, ...Com.configObj[n] });
                                    return p;
                                }, []) : Com.optionObj[ele.valueType];
                                let tempFilterValue = filterValues.find(a => ele.isGroup ? a.key === ele.key : a.key === ele.dataIndex);
                                let filterTable = props.filterShowList.find(a => ele.isGroup ? a.key === ele.key : a.key === ele.dataIndex);
                                return (
                                    <Fragment key={index}>
                                        {
                                            filterTable.filterShow ? (
                                                <div className={styles.filterPiece}>
                                                    <Tooltip title={ele.treeTitle}>
                                                        <div className={styles.headerTitle}>{ele.title}:</div>
                                                    </Tooltip>
                                                    <Select
                                                        dropdownMatchSelectWidth={false}
                                                        defaultActiveFirstOption={true}
                                                        className={styles.filterCompare}
                                                        onChange={e => onFilterValue(e, ele, "select")}
                                                        value={tempFilterValue ? tempFilterValue.select : ""}
                                                    >
                                                        {tempOptionArr ? tempOptionArr.map((v, i) => (
                                                            <Select.Option key={i} value={v.value}>
                                                                {v.name}
                                                            </Select.Option>
                                                        )) : null}
                                                    </Select>
                                                    {GetValueCom(tempFilterValue, ele)}
                                                </div>
                                            ) : null
                                        }
                                    </Fragment>
                                );
                            })
                        }
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default AdvancedSearch;
