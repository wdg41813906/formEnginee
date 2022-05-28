import React, { Component } from "react"
import { Modal, Input, Checkbox, Row, Col, Layout, Menu } from "antd"
import styles from "./AddAuthorityTeam.less"
import { List, Map, is } from "immutable"
import { Guid } from "../../utils/com"

import {TitleDes,CoperAu,FieldsAu} from "./dataAuthorityCom/dataAuthorityCom"
const { Sider, Content } = Layout;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;


/* 原始值 */
const data = {
    name: '',//名称
    desc: '',//描述
    //操作权限
    operation: [{
        formId: '1',//表单id
        formName: '主表',//主表
        keys: []
    }, {
        formId: '1-1',//表单id
        formName: '子表1',//子表1
        keys: []
    }, {
        formId: '1-2',//表单id
        formName: '子表2',//子表2
        keys: []
    }],
    //字段权限
    formItem: [{
        id: Guid(),
        name: '姓名',//名称
        formId: '1',
    }, {
        id: Guid(),
        name: '性别',//名称
        formId: '1',
    }, {
        id: Guid(),
        name: '年龄',//名称
        formId: '1',
    }, {
        id: Guid(),
        name: '子表1字段1',//名称
        formId: '1-1',
    }, {
        id: "1-1",
        name: '子表1',//名称
        formId: '1',
        type: "subform"
    }, {
        id: "1-2",
        name: '子表2',//名称
        formId: '1',
        type: "subform"
    }, {
        id: Guid(),
        name: '子表1字段2',//名称
        formId: '1-1',
    }, {
        id: Guid(),
        name: '金额',//名称
        formId: '1',
    }, {
        id: Guid(),
        name: '子表2字段1',//名称
        formId: '1-2',
    }, {
        id: Guid(),
        name: '子表2字段2',//名称
        formId: '1-2',
    }, {
        id: Guid(),
        name: '子表2字段3',//名称
        formId: '1-2',
    },],
    //数据权限
    data: [{
        type: 0,//条件类型 控件 提交人 提交时间 更新时间  （根据valueType生成不同的conditionFilter）
        condition: {},
    }],
    //用户列表
    users: {
        dep: [{
            id: '',
            name: ''//名称
        }],//部门
        role: [],//职责
        member: []//成员
    }
}

const menuArr = [
    { name: "名称信息", key: "1" }, { name: "操作权限", key: "2" }, { name: "字段权限", key: "3" }, { name: "数据权限", key: "4" },
]
// /* 名称信息 */
// function TitleDes(props) {
//     const { nameMess, changeTitleDes } = props;
//     return (
//         <div>
//             <div className={styles.titleDes}>可设置权限组名称和描述信息</div>
//             <Input placeholder="填写权限组名称" value={nameMess.title} onChange={changeTitleDes.bind(null, "title")} />
//             <TextArea autosize={{ minRows: 12, maxRows: 12 }} className={styles.textarea} value={nameMess.des} onChange={changeTitleDes.bind(null, "des")} />
//         </div>
//     )
// }
// const options = Object.freeze([{ label: "添加", value: 1 }, { label: "查看", value: 2 }, { label: "编辑", value: 3 }, { label: "删除", value: 4 },
// { label: "导入", value: 5 }, { label: "导出", value: 6 }, { label: "批量打印", value: 7 },])
// /* 操作权限 */
// function CoperAu(props) {
//     const { coperAuConfig, changeCoperAuChecked } = props;
//     return (
//         <div>
//             {
//                 Object.keys(coperAuConfig).map(parent => (
//                     <div key={parent} className={styles.copItem}>
//                         <div className={styles.titleDes}>设置对{coperAuConfig[parent]["name"]}数据进行哪些操作</div>
//                         <Row>
//                             {
//                                 options.map(item => (<Col key={item.value} span={8} className={styles.copCol}><Checkbox value={item.value} checked={coperAuConfig[parent]["checkedArr"].indexOf(item.value) !== -1} onChange={changeCoperAuChecked.bind(null, parent)}>{item.label}</Checkbox></Col>))
//                             }
//                         </Row>
//                     </div>
//                 ))
//             }

//         </div>
//     )
// }
// /* 字段权限 */
// const FieldItem = React.memo((props) => {
//     const { name, type, show, edit, id, changeFieldAuChecked } = props;
//     let checkShowProps = {onChange: changeFieldAuChecked.bind(null, id, "show", type) },
//         checkEditProps = {onChange: changeFieldAuChecked.bind(null, id, "edit", type) };
//     if (type === "subform" || id === "all") {
//         checkShowProps.indeterminate = (show === 1);
//         checkShowProps.checked = (show === 2);
//         checkEditProps.indeterminate = (edit === 1);
//         checkEditProps.checked = (edit === 2);
//     } else {
//         checkShowProps.checked = show;
//         checkEditProps.checked = edit;
//     }
//     return (
//         <div className={`${styles.fieldItem} ${type === "all" || type === "isMain" ? styles.itemBoder : ""}`}>
//             <div className={styles.fields}>
//                 {
//                     type === "child" ? <span className={`${styles.itemChildField}`}>{name}</span> : name
//                 }
//             </div>
//             <div className={styles.fieldVisible}><Checkbox {...checkShowProps} /></div>
//             <div className={styles.fieldEdit}><Checkbox {...checkEditProps} /></div>
//         </div>
//     )
// });
// function FieldsAu(props) {
//     const { mainFormId, fieldsArr, changeFieldAuChecked } = props;
//     let subFormItems = fieldsArr.filter(item => item.formId !== mainFormId);
//     return (
//         <div className={styles.fieldContainer}>
//             <div className={styles.titleDes}>可以查看和编辑数据的哪些字段</div>
//             <div className={`${styles.fieldItem} ${styles.fieldHeader}  ${styles.itemBoder}`}>
//                 <div className={styles.fields}>字段</div>
//                 <div className={styles.fieldVisible}>可见</div>
//                 <div className={styles.fieldEdit}>可编辑</div>
//             </div>
//             {
//                 fieldsArr.filter(item => item.formId === mainFormId).map(item => {
//                     if (item.type === "subform") {
//                         let currentSubItems = subFormItems.filter(d => (d.formId === item.id));
//                         item.show = currentSubItems.every(d => d.show) ? 2 : (currentSubItems.some(d => d.show) ? 1 : 0);
//                         item.edit = currentSubItems.every(d => d.edit) ? 2 : (currentSubItems.some(d => d.edit) ? 1 : 0);
//                         return (
//                             <div key={item.id} className={styles.itemBoder}>
//                                 <FieldItem type={"subform"} name={item.name} show={item.show} edit={item.edit} id={item.id} changeFieldAuChecked={changeFieldAuChecked} />
//                                 {
//                                     currentSubItems.map(child => (
//                                         <FieldItem key={child.id} type="child" name={child.name} show={child.show} edit={child.edit} id={child.id} changeFieldAuChecked={changeFieldAuChecked} />
//                                     ))
//                                 }
//                             </div>
//                         )
//                     } else {
//                         if (item.id === "all") {
//                             let fieldsArrNotAll = fieldsArr.slice(1);
//                             item.show = fieldsArrNotAll.every(d => d.show) ? 2 : (fieldsArrNotAll.some(d => d.show) ? 1 : 0);
//                             item.edit = fieldsArrNotAll.every(d => d.edit) ? 2 : (fieldsArrNotAll.some(d => d.edit) ? 1 : 0);
//                         }
//                         return <FieldItem key={item.id} type="isMain" name={item.name} show={item.show} edit={item.edit} id={item.id} changeFieldAuChecked={changeFieldAuChecked} />
//                     }
//                 })
//             }
//         </div>
//     )
// }

class AddAuthorityTeam extends Component {
    constructor(props) {
        super(props);
        // 初始化全选
        (!data.formItem.some(item => item.id === "all")) && data.formItem.unshift({
            id: "all",
            name: '全选',//名称
            formId: '1',
        });
        this.state = {
            menuSelected: "1",
            nameMess: { //名称信息
                title: data.name,
                des: data.desc
            },
            coperAuConfig: data.operation.reduce((prev, next) => { //操作权限
                prev[next.formId] = {
                    name: next.formName,
                    checkedArr: next.keys
                }
                return prev;
            }, {}),
            fieldsArr: data.formItem, //字段权限

        }
        this.changeMenuActive = this.changeMenuActive.bind(this);
        this.changeCoperAuChecked = this.changeCoperAuChecked.bind(this);
        this.changeTitleDes = this.changeTitleDes.bind(this);
        this.changeFieldAuChecked = this.changeFieldAuChecked.bind(this);
    }
    changeMenuActive(e) {
        this.setState({
            menuSelected: e.key[0],
        })
    }
    /* 操作权限 */
    changeCoperAuChecked(id, e) {
        const { checked, value } = e.target;
        let { coperAuConfig } = this.state;
        if (checked) {
            coperAuConfig[id]["checkedArr"].push(value);
            if (value !== 2 && coperAuConfig[id]["checkedArr"].indexOf(2) === -1) {
                coperAuConfig[id]["checkedArr"].push(2);
            }
            if (value === 5 && coperAuConfig[id]["checkedArr"].indexOf(1) === -1) {
                coperAuConfig[id]["checkedArr"].push(1);
            }
        } else {
            let existIndex = coperAuConfig[id]["checkedArr"].indexOf(value), otherIndex;
            coperAuConfig[id]["checkedArr"].splice(existIndex, 1);
            if ((otherIndex = coperAuConfig[id]["checkedArr"].indexOf(5)) !== -1 && value === 1) {
                coperAuConfig[id]["checkedArr"].splice(otherIndex, 1);
            }
            value === 2 && (coperAuConfig[id]["checkedArr"].length = 0)
        }
        this.setState({ coperAuConfig })
    }
    /* 名称信息 */
    changeTitleDes(type, e) {
        let { nameMess } = this.state;
        nameMess[type] = e.target.value;
        this.setState({ nameMess });
    }
    /* 字段权限 操作 */
    changeFieldAuChecked(id, type, subType, e) {
        let { fieldsArr } = this.state, checked = e.target.checked;
        let existItem = fieldsArr.filter(item => item.id === id)[0];
        const indexOf = fieldsArr.indexOf(existItem);
        existItem[type] = checked;
        (checked && type === "edit") && (existItem.show = checked);
        (!checked && type === "show") && (existItem.edit = checked);
        fieldsArr.splice(indexOf, 1, existItem);
        /* 如果 为 子表单 的 item项，去检查当前 对应的 子表单 */
        if(subType === "child"){
            let subform = fieldsArr.filter(item=>item.id === existItem.formId)[0];
            let subformIndex = fieldsArr.indexOf(subform);
            if(!checked && fieldsArr.filter(d=>d.formId === existItem.formId).every(d=>!d[type])){
                subform[type] = checked;
                fieldsArr.splice(subformIndex, 1, subform);
            }
        }
        (subType === "subform" || id === "all") && fieldsArr.forEach(item => {
            if ((item.formId === id && subType === "subform") || id === "all") {
                item[type] = checked;
                (checked && type === "edit") && (item.show = checked);
                (!checked && type === "show") && (item.edit = checked);
            }
        });

        this.setState({ fieldsArr });
    }
    render() {
        const { menuSelected, coperAuConfig, nameMess, fieldsArr } = this.state;
        const {authorityTeamModal,changeAuthorityTeamModal} = this.props;
        const coperAuProps = {
            coperAuConfig,
            changeCoperAuChecked: this.changeCoperAuChecked
        }
        const titleDesProps = {
            nameMess,
            changeTitleDes: this.changeTitleDes
        }
        const fieldsAuProps = {
            fieldsArr,
            mainFormId: data.operation[0]["formId"],
            changeFieldAuChecked: this.changeFieldAuChecked
        }
        return (
            <Modal
                title="选择成员所在部门"
                visible={authorityTeamModal}
                destroyOnClose={true}
                onCancel={changeAuthorityTeamModal.bind(null,false)}
                onOk={() => { }}
                width={560}
                maskClosable={false}
                okText="保存"
                bodyStyle={{ padding: 0, height: "360px", overflow: "hidden" }}
            >
                <Layout>
                    <Sider>
                        <Menu className={styles.siderMenu} theme="light" mode="inline" selectedKeys={[menuSelected]} onClick={this.changeMenuActive}>
                            {
                                menuArr.map(item => (
                                    <Menu.Item key={item.key}>
                                        <span>{item.name}</span>
                                    </Menu.Item>
                                ))
                            }
                        </Menu>
                    </Sider>
                    <Content className={styles.content}>
                        {menuSelected === "1"?<TitleDes {...titleDesProps}/>:null}
                        {menuSelected === "2"?<CoperAu {...coperAuProps} />:null}
                        {menuSelected === "3"?<FieldsAu {...fieldsAuProps} />:null}
                        {/* <FieldsAu {...fieldsAuProps} /> */}
                    </Content>
                </Layout>
            </Modal>
        );
    }
}

export default AddAuthorityTeam;

/* {
    name: '',//名称
    desc: '',//描述
    //操作权限
    operation: [{
        formId: '',//表单id
        formName: '',//表单名称
        keys: ['add', 'modify']
    }],
    //字段权限
    formItem: [{
        id: '',
        name: '',//名称
        formId: '',
        show: false,
        edit: false
    }],
    //数据权限
    data: [{
        type: 0,//条件类型 控件 提交人 提交时间 更新时间  （根据valueType生成不同的conditionFilter）
        condition: {},
    }],
    //用户列表
    users: {
        dep: [{
            id: '',
            name: ''//名称
        }],//部门
        role: [],//职责
        member: []//成员
    }
} */
