import { Component } from "react"
import styles from "./RolesContent.less"
import { Checkbox, Icon, Modal } from "antd"
import { List, Map, is, fromJS } from "immutable"

const confirm = Modal.confirm;

class RolesContent extends Component {
    constructor(props) {
        super(props);
        let { rolesMainArr } = props;
        this.state = {
            rolesDataArr: rolesMainArr,
            selectAll: false,
        }
    }
    componentWillReceiveProps(nextProps) {
        if (!is(fromJS(nextProps.rolesMainArr), fromJS(this.state.rolesDataArr))) {
            let tempArr = List(nextProps.rolesMainArr).toJS();
            this.setState({
                rolesDataArr: tempArr,
                selectAll:false
            });
        }
    }
    changeHoverState(id, bool) {
        let { rolesDataArr: tempArr } = this.state;
        tempArr.forEach(v => {
            if (v.id === id) {
                v.hovered = bool;
            }
        })
        this.setState({
            rolesDataArr: tempArr
        });
    }
    changeCheckBox(e, type, id) {
        let me = this;
        let checked = e.target.checked;
        let { rolesDataArr: tempArr } = me.state;
        let judgeArr = (arr) => {
            for (let i = 0; i < arr.length; i++) {
                let item = arr[i];
                if (!item.checked) {
                    return false;
                }
            }
            return true;
        }
        tempArr.forEach(v => {
            if (type === 0) {
                if (v.id === id) {
                    v.checked = checked;
                    if (!checked && me.state.selectAll) {
                        me.setState({
                            selectAll: false
                        })
                    }
                    if (checked && !me.state.selectAll && judgeArr(tempArr)) {
                        me.setState({
                            selectAll: true
                        })
                    }
                }
            }
            if (type === 1) {
                v.checked = checked;
            }
        });
        if (type === 1) {
            me.setState({
                selectAll: checked
            });
        }
        me.setState({
            rolesDataArr: tempArr
        }, () => {
            let tempSelectArr = [];
            this.state.rolesDataArr.forEach(v => {
                if (v.checked) {
                    tempSelectArr.push(v.id);
                }
            });
            this.props.changeRolesSelectedKeys(tempSelectArr,tempArr);
        });
    }
    render() {
        let { rolesDataArr, selectAll } = this.state;
        let { deleteConfirm } = this.props;
        return (
            <div className={styles.container}>
                <div className={styles.item}>
                    <div className={styles.checkItem}>
                        <Checkbox checked={selectAll} onChange={(e) => { this.changeCheckBox(e, 1); }}></Checkbox>
                    </div>
                    <div className={styles.textItem}>
                        姓名
                    </div>
                    <div className={styles.textItem}>
                        部门
                    </div>
                </div>
                <div className={styles.scrollContainer}>
                    {
                        rolesDataArr.map((v, i) => (
                            <div key={v.id} className={`${styles.item} ${v.hovered ? styles.activeItem : ""}`}
                                onMouseEnter={() => { this.changeHoverState(v.id, true); }}
                                onMouseLeave={() => { this.changeHoverState(v.id, false); }}
                            >
                                {
                                    v.hovered && <Icon className={styles.deleteItem} type="minus-circle" theme="outlined" onClick={() => {
                                        deleteConfirm([v.id]);
                                    }} />
                                }
                                <div className={styles.checkItem}>
                                    <Checkbox checked={v.checked} onChange={(e) => { this.changeCheckBox(e, 0, v.id); }}></Checkbox>
                                </div>
                                <div className={styles.textItem}>
                                    {v.name}
                                </div>
                                <div className={styles.textItem}>
                                    {v.department}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}
export default RolesContent;