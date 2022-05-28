import React, { Component } from "react";
import { Input, Checkbox, Row, Col } from "antd";
import styles from "./dataAuthorityCom.less";
import { List, Map, is } from "immutable";
import CooperateStatus from "../../../enums/AuthorityStatus";
import { GetAllButton } from "../../../services/FormBuilder/FormButton";

const { TextArea } = Input;

/* 名称信息 */
function TitleDes(props) {
    const { nameMess, changeTitleDes } = props;
    return (
        <div>
            <div className={styles.titleDes}>可设置权限组名称和描述信息</div>
            <Input placeholder="填写权限组名称" value={nameMess.title} onChange={changeTitleDes.bind(null, "title")}/>
            <TextArea autosize={{ minRows: 12, maxRows: 12 }} className={styles.textarea} value={nameMess.des}
                      onChange={changeTitleDes.bind(null, "des")}/>
        </div>
    );
}

const options = Object.freeze([{ label: "添加", value: CooperateStatus.add }, {
    label: "查看",
    value: CooperateStatus.look
}, { label: "编辑", value: CooperateStatus.edit }, { label: "删除", value: CooperateStatus.del },
    {
        label: "导入",
        value: CooperateStatus.import
    }/* , { label: "导出", value: CooperateStatus.export }, { label: "批量打印", value: CooperateStatus.con }, */]);

/* 操作权限 */
class CoperAu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buttonList: []
        };
        this.GetAllButton();
    }
    
    GetAllButton = () => {
        GetAllButton({ formTemplateVersionId: this.props.formTemplateVersionId }).then(res => {
            let { buttonList } = res.data;
            this.setState({
                buttonList: buttonList
            });
        });
    };
    
    render() {
        const { coperAuConfig, changeCoperAuChecked, ChangeCustomButton, formBody } = this.props;
        let CheckCustomButton = this.props.CheckCustomButton;
        if (typeof CheckCustomButton === "string") {
            CheckCustomButton = JSON.parse(CheckCustomButton);
        }
        let RootformId = formBody.filter(item => item.itemType === "Root")[0];
        let SubformId = formBody.filter(item => item.itemType === "SubForm");
        return (
            <div style={{ marginBottom: "45px" }}>
                {
                    Object.keys(coperAuConfig).map(parent => {
                        let resultOpt = options;
                        coperAuConfig[parent]["itemType"] !== "Root" && (resultOpt = resultOpt.slice(0, -1));
                        return (
                            <div key={parent} className={styles.copItem}>
                                <div className={styles.titleDes}>设置对{coperAuConfig[parent]["name"]}数据进行哪些操作</div>
                                <Row>
                                    {
                                        resultOpt.map(item => (
                                            <Col key={item.value} span={8} className={styles.copCol}><Checkbox
                                                value={item.value}
                                                checked={coperAuConfig[parent]["checkedArr"].indexOf(item.value) !== -1}
                                                onChange={changeCoperAuChecked.bind(null, parent)}>{item.label}</Checkbox></Col>))
                                    }
                                </Row>
                            </div>
                        );
                    })
                }
                {
                    this.state.buttonList.filter(item => item.formId === RootformId.formId).length ?
                        <div>
                            <div className={styles.titleDes}>设置{RootformId.itemBase.name}自定义按钮操作</div>
                            <Row>
                                {
                                    this.state.buttonList.map(item => {
                                        if (item.formId === RootformId.formId) {
                                            return <Col key={item.id} span={8} className={styles.copCol}><Checkbox
                                                checked={CheckCustomButton && CheckCustomButton.indexOf(item.id) !== -1}
                                                onChange={ChangeCustomButton.bind(null, item.id)}
                                            >{item.name}</Checkbox></Col>;
                                        }
                                    })
                                }
                            </Row>
                        </div> : null
                }
                <div>
                    {
                        SubformId.map(a => {
                            return this.state.buttonList.filter(item => item.formId === a.formId).length ?
                                <div key={a.id}>
                                    <div className={styles.titleDes}>设置{a.itemBase.name}自定义按钮操作</div>
                                    <Row>
                                        {
                                            this.state.buttonList.map(item => {
                                                if (item.formId === a.formId) {
                                                    return <Col key={item.id} span={8}
                                                                className={styles.copCol}><Checkbox
                                                        checked={CheckCustomButton && CheckCustomButton.indexOf(item.id) !== -1}
                                                        onChange={ChangeCustomButton.bind(null, item.id)}
                                                    >{item.name}</Checkbox></Col>;
                                                }
                                            })
                                        }
                                    
                                    </Row>
                                </div> : null;
                        })
                    }
                </div>
            </div>
        );
    }
    
}

// function CoperAu(props) {
//     const { coperAuConfig, changeCoperAuChecked } = props;
//     //获取自定义按钮
//     GetAllButton = () => {
//         GetAllButton({ formTemplateVersionId: this.state.FormTemplateVersionId }).then(res => {
//             let { buttonList } = res.data;
//             this.setState({
//                 buttonList: buttonList
//             });
//         });
//     };
//     return (
//         <div>
//             {
//                 Object.keys(coperAuConfig).map(parent => {
//                     let resultOpt = options;
//                     coperAuConfig[parent]["itemType"] !== "Root" && (resultOpt = resultOpt.slice(0, -1));
//                     return (
//                         <div key={parent} className={styles.copItem}>
//                             <div className={styles.titleDes}>设置对{coperAuConfig[parent]["name"]}数据进行哪些操作</div>
//                             <Row>
//                                 {
//                                     resultOpt.map(item => (
//                                         <Col key={item.value} span={8} className={styles.copCol}><Checkbox
//                                             value={item.value}
//                                             checked={coperAuConfig[parent]["checkedArr"].indexOf(item.value) !== -1}
//                                             onChange={changeCoperAuChecked.bind(null, parent)}>{item.label}</Checkbox></Col>))
//                                 }
//                             </Row>
//                         </div>
//                     );
//                 })
//             }
//             <div>
//                 <div className={styles.titleDes}>设置自定义按钮操作</div>
//                 <Row>
//                     {
//                         buttonList.length ?
//                             buttonList.map(item => (
//                                 <Col key={item.value} span={8} className={styles.copCol}><Checkbox
//                                     value={item.value}
//                                     //checked={coperAuConfig[parent]["checkedArr"].indexOf(item.value) !== -1}
//                                     //onChange={changeCoperAuChecked.bind(null, parent)}
//                                 >{item.name}</Checkbox></Col>)) : null
//                     }
//                 </Row>
//             </div>
//         </div>
//     );
//
// }

/* 字段权限 */
const FieldItem = React.memo((props) => {
    const { name, type, show, edit, id, changeFieldAuChecked } = props;
    let checkShowProps = { onChange: changeFieldAuChecked.bind(null, id, "show", type) },
        checkEditProps = { onChange: changeFieldAuChecked.bind(null, id, "edit", type) };
    if (type === "subform" || id === "all") {
        checkShowProps.indeterminate = (show === 1);
        checkShowProps.checked = (show === 2);
        checkEditProps.indeterminate = (edit === 1);
        checkEditProps.checked = (edit === 2);
    } else {
        checkShowProps.checked = show;
        checkEditProps.checked = edit;
    }
    return (
        <div className={`${styles.fieldItem} ${type === "all" || type === "isMain" ? styles.itemBoder : ""}`}>
            <div className={styles.fields}>
                {
                    type === "child" ? <span className={`${styles.itemChildField}`}>{name}</span> : name
                }
            </div>
            <div className={styles.fieldVisible}><Checkbox {...checkShowProps} /></div>
            <div className={styles.fieldEdit}><Checkbox {...checkEditProps} /></div>
        </div>
    );
});

function FieldsAu(props) {
    debugger;
    const { mainFormId, fieldsArr, changeFieldAuChecked } = props;
    let subFormItems = fieldsArr.filter(item => item.formId !== mainFormId);
    return (
        <div className={styles.fieldContainer}>
            <div className={styles.titleDes}>可以查看和编辑数据的哪些字段</div>
            <div className={`${styles.fieldItem} ${styles.fieldHeader}  ${styles.itemBoder}`}>
                <div className={styles.fields}>字段</div>
                <div className={styles.fieldVisible}>可见</div>
                <div className={styles.fieldEdit}>可编辑</div>
            </div>
            {
                fieldsArr.filter(item => item.formId === mainFormId).map(item => {
                    if (item.type === "subform") {
                        let currentSubItems = subFormItems.filter(d => (d.formId === item.id));
                        if (currentSubItems.length) {
                            item.show = currentSubItems.every(d => d.show) ? 2 : (currentSubItems.some(d => d.show) ? 1 : 0);
                            item.edit = currentSubItems.every(d => d.edit) ? 2 : (currentSubItems.some(d => d.edit) ? 1 : 0);
                        } else {
                            item.show = item.show ? 2 : 0;
                            item.edit = item.edit ? 2 : 0;
                        }
                        return (
                            <div key={item.id} className={styles.itemBoder}>
                                <FieldItem type={"subform"} name={item.name} show={item.show} edit={item.edit}
                                           id={item.id} changeFieldAuChecked={changeFieldAuChecked}/>
                                {
                                    currentSubItems.map(child => (
                                        <FieldItem key={child.id} type="child" name={child.name} show={child.show}
                                                   edit={child.edit} id={child.id}
                                                   changeFieldAuChecked={changeFieldAuChecked}/>
                                    ))
                                }
                            </div>
                        );
                    } else {
                        if (item.id === "all") {
                            let fieldsArrNotAll = fieldsArr.slice(1);
                            if (fieldsArrNotAll.length) {
                                item.show = fieldsArrNotAll.every(d => d.show) ? 2 : (fieldsArrNotAll.some(d => d.show) ? 1 : 0);
                                item.edit = fieldsArrNotAll.every(d => d.edit) ? 2 : (fieldsArrNotAll.some(d => d.edit) ? 1 : 0);
                            }
                        }
                        return <FieldItem key={item.id} type="isMain" name={item.name} show={item.show} edit={item.edit}
                                          id={item.id} changeFieldAuChecked={changeFieldAuChecked}/>;
                    }
                })
            }
        </div>
    );
}

export {
    TitleDes,
    CoperAu,
    FieldsAu
};
