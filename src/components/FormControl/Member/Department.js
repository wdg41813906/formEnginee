import React, { useState } from "react";
import { Icon, Button } from "antd";
import com from "../../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../../enums/FormControlListGroup";
import Title from "../Attribute/Title.js";
import Desc from "../Attribute/Desc.js";
import Position from "../Attribute/PositionStyle";
import VerificationGroup from "../Attribute/VerificationGroup.js";
import OperationPower from "../Attribute/OperationPower.js";
import DefaultValueMember from "../Attribute/DefaultValueMember.js";
import styles from "./Member.less";
import SelectMode from "./SelectMode.js";
import OptionalRange from "./OptionalRange.js";
import FormControlType from "../../../enums/FormControlType";
import DefaultUserMess from "../../../enums/DefaultUserMess";
import FORM_RENDER_STYLE from "../../../enums/FormRenderStyle";
import FilterPart from "../../BookAddress/MemberCom/FilterPart";
import EnvironmentType from "../../../enums/EnvironmentType";

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = "Department";
    formItemBase.typeName = "部门组件";
    formItemBase.name = "部门组件"; //标题
    formItemBase.isRepeat = false; //是否允许有重复值
    formItemBase.selectMode = "solo"; //选择模式
    formItemBase.dicMode = true;
    formItemBase.optionalRange = { type: 1, value: null }; //可选范围：1自定义，2由部门字段确定，3数据联动
    return formItemBase;
}

// const judgeCurrentValue = function(props) {
//     if (props.renderStyle === RENDERSTYLE.Design) return;
//     let {
//         groupValues: { name: names, value: ids }
//     } = props;
//     names = names || [];
//     ids = ids || [];
//     if (!ids.some(item => DefaultUserMess.currentDepId === item || DefaultUserMess.currentOrgId === item)) return;
//     let userMess = localStorage.getItem("author");
//     if (userMess) {
//         userMess = JSON.parse(userMess);
//         let i1 = ids.indexOf(DefaultUserMess.currentOrgId);
//         if (i1 !== -1) {
//             ids.splice(i1, 1, userMess.currentDeptId);
//             names.splice(i1, 1, userMess.currentDeptName);
//         }
//         let i2 = ids.indexOf(DefaultUserMess.currentDepId);
//         if (i2 !== -1) {
//             ids.splice(i2, 1, userMess.currentDepartmentId);
//             names.splice(i2, 1, userMess.currentDepartmentName);
//         }
//         setTimeout(() => {
//             props.setGroupItemValue("value", ids);
//             props.setGroupItemValue("name", names);
//         });
//     }
// };

const confirmSubmit = function (data, props) {
    props.setFilterValue(data);
};

const handleMemberList = function (props) {
    const { optionalRange } = props;
    // let idList = optionalRange.value ? optionalRange.value : [];
    let idList = optionalRange.value ? (optionalRange.value instanceof Array) ? optionalRange.value : [optionalRange] : [];
    let showFilterArr = [];
    if (idList.length === 0) {
        let author = JSON.parse(localStorage.getItem("author") || "{}");
        //没有限制
        showFilterArr = [
            {
                type: 0,
                name: "部门",
                idList: [author.currentDeptId]//部门只显示当前用户所在机构下的部门
                // idList: idList
                //     .filter(e => {
                //         return e.type === 0;
                //     })
                //     .map(e => {
                //         return e.value || e.id;
                //     })
            },
            { type: -2, name: "默认参数", idList: [] }
        ];
    } else {
        if (
            idList.filter(e => {
                return e.type === 0;
            }).length > 0
        ) {
            showFilterArr.push({
                type: 0,
                name: "部门",
                idList: idList
                    .filter(e => {
                        return e.type === 0;
                    })
                    .map(e => {
                        return e.value || e.id;
                    })
            });
        }
        if (
            idList.filter(e => {
                return e.type === 1;
            }).length > 0
        ) {
            showFilterArr = showFilterArr.concat(
                {
                    type: 1,
                    name: "职责",
                    idList: idList
                        .filter(e => {
                            return e.type === 1;
                        })
                        .map(e => {
                            return e.value || e.id;
                        }),
                    isTree: true
                },
                {
                    type: 2,
                    name: "成员",
                    idList: idList
                        .filter(e => {
                            return e.type === 2;
                        })
                        .map(e => {
                            return e.value || e.id;
                        }),
                    isTree: false
                }
            );
        }
        if (
            idList.filter(e => {
                return e.type === 2;
            }).length > 0
        ) {
            showFilterArr.filter(e => {
                return e.type === 2;
            }).length === 0 &&
                showFilterArr.push({
                    type: 2,
                    name: "成员",
                    idList: idList
                        .filter(e => {
                            return e.type === 2;
                        })
                        .map(e => {
                            return e.value || e.id;
                        }),
                    isTree: false
                });
        }
        showFilterArr.push({ type: -2, name: "默认参数", idList: [] });
    }
    return showFilterArr;
};

class MemberFrom extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        };
        //props.renderStyle != RENDERSTYLE.Design && judgeCurrentValue(props)
    }

    //自定义
    controlFilter = e => {
        if (this.props.disabled || this.props.readOnly) return;
        //if (this.props.design || this.props.mode === "cell") return;
        this.setState({ visible: !this.state.visible });
    };
    confirmSubmit = data => {
        if (this.props.onChangeAll) {
            this.props.onChangeAll({
                value: {
                    value: data.map(item => item.id),
                    name: data.map(item => item.name)
                },
            })
        } else {
            this.props.setGroupItemValue("value", data.map(item => item.id));
            this.props.setGroupItemValue("name", data.map(item => item.name));
        }
    };

    // componentDidUpdate() {
    //     judgeCurrentValue(this.props);
    // }

    // componentDidMount() {
    //     judgeCurrentValue(this.props);
    // }

    render() {
        let {
            disabled,
            readOnly,
            selectMode,
            optionalRange,
            defaultValue,
            groupValues,
            environmentValue
        } = this.props;
        if (defaultValue) {
            groupValues = defaultValue
        }
        let { name, value: id } = groupValues;
        name = name || [];
        id = id || [];
        let value = name.map((item, i) => ({
            name: item,
            id: id[i],
            type: id[i] === DefaultUserMess.currentMemId ? -2 : 0
        }));

        let { visible } = this.state;
        let singleOrMultiple = selectMode === "solo" ? 0 : 1;
        const showFilterArr = handleMemberList(this.props);
        let filterPartProps = {
            type: "dep",
            controlFilterPart: {
                isShowModal: visible,
                showFilterArr,
                selectedData: value && value !== "''" ? value : [],
                headerTitle: "部门列表",
                singleOrMultiple //0 为 单选，1 为 多选
                // isFilter: 0,
            },
            controlFilter: this.controlFilter,
            confirmSubmit: this.confirmSubmit
        };
        let buttonText = '点击选择部门';
        if (environmentValue && this.props.renderStyle === FORM_RENDER_STYLE.Design) {
            switch (environmentValue) {
                case EnvironmentType.currentDeptName:
                    buttonText = '当前用户所在部门';
                    break;
                case EnvironmentType.currentOrgName:
                    buttonText = '当前用户所在机构';
                    break;
            }
        }
        return (
            <div className={styles.Member} style={{ background: disabled || readOnly ? "#eee" : "" }}>
                <div
                    onClick={() => {
                        this.controlFilter(true);
                    }}
                    className={`${styles.MemberModalHandle} ${value ? "" : styles.empty}`}
                >
                    {value.length > 0 ? (
                        value.map((e, index) => (
                            <div key={index} className={styles.MemberModalBodySelectedDiv_item}>
                                <Icon className={styles.item_l} type="fork" />
                                <span className={styles.item_m}>{e.name}</span>
                            </div>
                        ))
                    ) : (
                            <p className={styles.MemberModalHandle_placeholder}>{buttonText}</p>
                        )}
                </div>
                {visible ? <FilterPart {...filterPartProps} /> : null}
            </div>
        );
    }
}

class Department extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let { mode, optionalRange } = this.props;
        switch (mode) {
            case "table":
            case "form":
                return <MemberFrom {...this.props} />;
            case "cell":
                return (this.props.groupValues.name || "").toString();
            case "groupCell":
                return (this.props.groupValue || []).toString();
            case "option":
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <Position.Component {...Position.getProps(this.props)} />
                        <SelectMode.Component {...SelectMode.getProps(this.props)} />
                        <OptionalRange {...this.props} />
                        {optionalRange.type === 3 ? null : (
                            <DefaultValueMember.Component type='dept' {...DefaultValueMember.getProps(this.props)} />
                        )}
                        <VerificationGroup.Component {...VerificationGroup.getProps(this.props)} />
                        <OperationPower {...this.props} />
                        {/* <Formart {...this.props} /> */}
                        <Desc.Component {...Desc.getProps(this.props)} />
                    </React.Fragment>
                );
        }
    }
}

export default {
    itemType: "Department",
    formControlType: FormControlType.Group,
    items: [
        { key: "name", name: "{name}", valueType: "array" },
        { key: "value", name: "{name}Id", valueType: "array", private: true }
    ],
    name: "部门组件",
    ico: "cluster",
    group: FORM_CONTROLLIST_GROUP.Department, //分组
    Component: Department,
    valueType: "array",
    initFormItemBase,
    event: {
        //获取用于参与计算引擎计算的计算元素
        onGetLinkerParams: function (props) {
            return [{ id: props.groupItems.name.id, name: props.name, valueType: "array" }];
        },
        buildSubTableHeader: props => {
            let { id, groupItems, name, container, cusWidValue } = props;
            let column = {
                title: name,
                key: id,
                dataIndex: groupItems.name.id,
                width: cusWidValue,
                container
            };
            return column;
        },
        FilterComponent: props => {
            const [visible, setVisible] = useState(false);
            let singleOrMultiple = props.selectMode === "solo" ? 0 : 1;
            let author = JSON.parse(localStorage.getItem("author") || "{}");
            let filterPartProps = {
                type: "mem",
                controlFilterPart: {
                    isShowModal: visible,
                    showFilterArr: [{
                        type: 0, name: "部门", idList: [author.currentDeptId]
                    }],
                    selectedData: props.filterValue,
                    headerTitle: "部门列表",
                    singleOrMultiple //0 为 单选，1 为 多选
                    // isFilter:2
                },
                controlFilter: () => {
                    setVisible(!visible);
                },
                confirmSubmit: data => {
                    confirmSubmit.call(this, data, props);
                }
            };
            return (
                <div className={styles["search-container"]}>
                    {props.filterValue && props.filterValue.length > 0 ? (
                        <div className={styles.member} onClick={() => setVisible(true)}>
                            {props.filterValue.map((item, index) => (
                                <div key={index} className={styles["member-name"]}>
                                    <Icon className={styles["member-icon"]} type={"fork"} />
                                    <div key={item.id}>{item.name}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                            <Button type={"ghost"} onClick={() => setVisible(true)}>
                                点击选择部门
                        </Button>
                        )}
                    {visible ? <FilterPart {...filterPartProps} /> : null}
                </div>
            );
        },
        getFilterStr: filterValue => {
            return filterValue.map(a => a.name);
        },
        getFilterComponentProps: props => {
            return {
                optionalRange: props.optionalRange,
                selectMode: props.selectMode
            };
        }
    }
};
