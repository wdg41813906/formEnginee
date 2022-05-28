import React, { useState } from "react";
import { Icon, Button } from "antd";
import com from "../../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../../enums/FormControlListGroup";
import Title from "../../../components/FormControl/Attribute/Title.js";
import Desc from "../../../components/FormControl/Attribute/Desc.js";
import Position from "../../../components/FormControl/Attribute/PositionStyle";
import VerificationGroup from "../../../components/FormControl/Attribute/VerificationGroup.js";
import OperationPower from "../../../components/FormControl/Attribute/OperationPower.js";
import DefaultValueMember from "../../../components/FormControl/Attribute/DefaultValueMember.js";
import SelectMode from "./SelectMode.js";
import OptionalRange from "./OptionalRange.js";
import FormControlType from "../../../enums/FormControlType";
import DefaultUserMess from "../../../enums/DefaultUserMess";
import FilterPart from "../../BookAddress/MemberCom/FilterPart";
import styles from "./Member.less";
import EnvironmentType from "../../../enums/EnvironmentType";
import FORM_RENDER_STYLE from "../../../enums/FormRenderStyle";

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = "Member";
    formItemBase.typeName = "成员组件";
    formItemBase.name = "成员组件"; //标题
    formItemBase.isRepeat = false; //是否允许有重复值
    formItemBase.dicMode = true;
    formItemBase.selectMode = "solo"; //选择模式
    formItemBase.optionalRange = {
        type: 1,
        value: null
    }; //可选范围：1自定义，2由部门字段确定，3数据联动
    return formItemBase;
}

const confirmSubmit = function (data, props) {
    props.setFilterValue(data);
};

const handleMemberList = function (props) {
    const { optionalRange } = props;
    let idList = optionalRange.value ? (optionalRange.value instanceof Array) ? optionalRange.value : [optionalRange] : [];
    let showFilterArr = [];
    if (idList.length === 0) {
        //没有限制
        showFilterArr = [
            {
                type: 0,
                name: "部门",
                idList: idList
                    .filter(e => {
                        return e.type === 0;
                    })
                    .map(e => {
                        return e.value || e.id;//e.id 全部
                    }),
                isTree: true
            },
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
            // { type: 2, name: "成员", idList: idList.filter(e => { return e.type == 2 }).map(e => { return e.id }), isTree: false },
            {
                type: -2,
                name: "默认参数",
                idList: []
            }
        ];
        return showFilterArr;
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
                    }),
                isTree: true
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
                }
                // {
                //     type: 2,
                //     name: '成员',
                //     idList: idList
                //         .filter(e => {
                //             return e.type === 2;
                //         })
                //         .map(e => {
                //             return e.id;
                //         }),
                //     isTree: false
                // }
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
                        .map(e => {//这里这里这里这里这里这里这里这里这里感觉哪里不对劲
                            return props.value || e.id;//e.id
                        })[0],
                    isTree: false
                });
        }
        return showFilterArr;
    }
};

class MemberFrom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            value: props.value,
        };
    }

    //自定义
    controlFilter = e => {
        if (this.props.disabled || this.props.readOnly) return;
        this.setState({
            visible: !this.state.visible
        });
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
    render() {
        let {
            disabled,
            readOnly,
            selectMode,
            groupValues,
            defaultValue,
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
            type: id[i] === DefaultUserMess.currentMemId ? -2 : 2
        }));
        let { visible } = this.state;
        let singleOrMultiple = selectMode === "solo" ? 0 : 1;
        let buttonText = '点击选择成员';
        if (environmentValue && this.props.renderStyle === FORM_RENDER_STYLE.Design) {
            switch (environmentValue) {
                case EnvironmentType.currentUserName:
                    buttonText = '当前用户'
                    break;
            }
        }
        const showFilterArr = handleMemberList(this.props);
        let filterPartProps = {
            type: "mem",
            controlFilterPart: {
                isShowModal: visible,
                showFilterArr,
                selectedData: value,
                headerTitle: "成员列表",
                singleOrMultiple //0 为 单选，1 为 多选
                // isFilter:2
            },
            controlFilter: this.controlFilter,
            confirmSubmit: this.confirmSubmit
        };
        return (
            <div className={styles.Member} style={{ background: disabled || readOnly ? "#eee" : "" }}>
                <div
                    onClick={() => {
                        this.controlFilter(true);
                    }}
                    className={styles.MemberModalHandle}
                >
                    {value.length > 0 ? (
                        value.map(e => (
                            <div key={e.id} className={styles.MemberModalBodySelectedDiv_item}>
                                <Icon className={styles.item_l} type="user" />
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

class Member extends React.PureComponent {
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
                        <DefaultValueMember.Component {...DefaultValueMember.getProps(this.props)} />
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
    itemType: "Member",
    formControlType: FormControlType.Group,
    items: [
        {
            key: "name",
            name: "{name}",
            valueType: "array"
        },
        {
            key: "value",
            name: "{name}Id",
            valueType: "array",
            private: true
        }
    ],
    name: "成员组件",
    ico: "usergroup-add",
    group: FORM_CONTROLLIST_GROUP.Department, //分组
    Component: Member,
    valueType: "array",
    initFormItemBase,
    event: {
        //获取用于参与计算引擎计算的计算元素
        onGetLinkerParams: function (props) {
            return [
                {
                    id: props.groupItems.name.id,
                    name: props.name,
                    valueType: "array"
                }
            ];
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
            let filterPartProps = {
                type: "mem",
                controlFilterPart: {
                    isShowModal: visible,
                    showFilterArr: [{ type: 0, name: "部门", idList: [], isTree: true },
                    { type: 1, name: "职责", idList: [], isTree: true }
                    ],
                    selectedData: props.filterValue,
                    headerTitle: "成员列表",
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
                                    <Icon className={styles["member-icon"]} type={"user"} />
                                    <div key={item.id}>{item.name}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                            <Button type={"ghost"} onClick={() => setVisible(true)}>
                                点击选择成员
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
