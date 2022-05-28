import { Component } from "react"
import { Modal, Icon, Tabs, Button, Drawer, message } from "antd"
import styles from "./CreditTableRow.less"
const TabPane = Tabs.TabPane;
import FormRender from "../../routes/FormRender/FormRender";
import FilterPart from "../BookAddress/MemberCom/FilterPart";

// 右边流程组件
function RightProcedure(props) {
    let { showDrawer, changeDrawerState, getContainer } = props;
    return (
        <div className={styles.rightContainer}>
            <Tabs defaultActiveKey="1" onChange={() => {
            }}>
                <TabPane tab="审批意见" key="1" className={styles.rightTabs}>Content of Tab Pane 1</TabPane>
                <TabPane tab="流程日志" key="2" className={styles.rightTabs}>Content of Tab Pane 2</TabPane>
            </Tabs>
            <div className={styles.procedureImg} onClick={() => {
                changeDrawerState(true);
            }}>
                <Icon type="plus" />
                流转图
            </div>
            <Drawer
                title="流程版本"
                placement="right"
                closable={true}
                destroyOnClose={true}
                width={756}
                // getContainer={getContainer()}
                onClose={() => {
                    changeDrawerState(false);
                }}
                visible={showDrawer}
            >
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Drawer>
        </div>
    );
}

class CreditTableRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEdit: false,
            operFeild: false,
            showDrawer: false,
            optAuth: [],//按钮组
            visible: false,
            dynamicSignChargers: [],
            isdisabled: false
        }
    }

    getContainer(id) {
        return () => {
            if (!id || typeof document === 'undefined') return null;
            return document.getElementById(id);
        };
    }

    changeDrawerState(bool) {
        this.setState({
            showDrawer: bool
        });
    }

    transferMsg = (item) => {
        this.setState({
            optAuth: item
        })
    }

    controlFilter = () => {
        this.setState({ visible: false });
    }

    confirmSubmit = (data) => {
        console.log(JSON.stringify(data))
        let a = [],
            b = [],
            c = []
        data.map(item => {
            switch (Number(item.type)) {
                case 0:
                    a.push({
                        type: "dept", //机构类型
                        deptId: item.id,  //机构ID
                        deptName: item.name //机构名称
                    })
                    break
                case 1:
                    b.push({
                        type: "role",  //职责类型
                        deptId: "",
                        deptName: "",
                        roleId: item.id,       //职责ID
                        roleName: item.name    //职责名称
                    })
                    break
                case 2:
                    c.push({
                        type: "user",  //用户类型
                        deptId: item.rootId,
                        deptName: item.rootName,
                        userId: item.id,   //负责人ID
                        userName: item.name  //负责人姓名
                    })
                    break
            }
        })
        let bb = []
        a.map(item => {
            b.map(_item => {
                bb.push({
                    type: "role",  //职责类型
                    deptId: item.deptId,
                    deptName: item.deptName,
                    roleId: _item.roleId,       //职责ID
                    roleName: _item.roleName    //职责名称
                })
            })
        })
        if (a.length === 0) {
            message.warning('部门选项至少一个');
            this.setState({
                visible: true
            })
        } else {
            console.log(a.concat(bb.concat(c)))
            this.setState({
                visible: false,
                dynamicSignChargers: a.concat(bb.concat(c))
            }, () => {
                this.child.submit(null, this.state.dynamicSignChargers, this.state.code)
            });
        }
    }

    BottonAarry = (e) => {
        switch (e) {
            case 'submit': //提交
                this.child.submit(null, null, e)
                break
            case 'save': //暂存
                this.child.submit(null, null, e)
                break
            case 'dynamicSign': //动态会签
                this.setState({
                    visible: true,
                    code: e
                });
                break
            default:
        }
        this.props.setResetButtonattr(true)
    }

    SaveData = () => {
        this.props.setResetButtonattr(true)
        this.child.submit(null, null, null, this.props.setResetButtonattr)
    }

    render() {
        let { isEdit, showDrawer } = this.state;
        let { columns, fieldNameArr, isShowEditModal, templateId, inst, changeShowEditModalState, id, FormTemplateVersionId, type, onCompleted, formTemplateType, moduleId, renderType, workFlowId } = this.props;

        let searchNameProps = {
            columns,
            fieldNameArr,
            backNewfieldArr: () => {
            }
        }
        let rightProcedureProps = {
            showDrawer,
            changeDrawerState: this.changeDrawerState.bind(this),
            getContainer: this.getContainer.bind(this)
        }
        let formRenderProps = { renderType, workFlowId, onCompleted };
        if (type === "modify") {
            formRenderProps.inst = inst;
        }
        formRenderProps.tabId = FormTemplateVersionId;
        formRenderProps.formTemplateId = templateId
        formRenderProps.formTemplateType = formTemplateType
        formRenderProps.moduleId = moduleId
        let filterPartProps = {
            controlFilterPart: {
                isShowModal: this.state.visible,
                showFilterArr: [
                    { type: 0, name: "部门", isTree: false },
                    { type: 1, name: "职责", isTree: false },
                    { type: 2, name: "成员", isTree: true },
                ],
                selectedData: [],
                headerTitle: "成员列表",
                isFilter: "2",
                singleOrMultiple: 1,//0 为 单选，1 为 多选
            },
            controlFilter: this.controlFilter,//isShowModal
            confirmSubmit: this.confirmSubmit,
        };
        return <div className={styles.ctr}>
            <Modal
                visible={isShowEditModal}
                footer={<div style={{ textAlign: 'center' }}>
                    {
                        Number(formTemplateType) === 1 && renderType !== 'readOnly' ? (this.state.optAuth ? this.state.optAuth.map((item, index) => {
                            return <Button hidden={!item.isOpen} key={index} disabled={this.props.resetButtonattr}
                                onClick={() => this.BottonAarry(item.code)}
                                type="primary">{item.name}</Button>
                        }) : null) :
                            (renderType === 'readOnly' ? null :
                                <Button onClick={() => this.SaveData()} disabled={this.props.resetButtonattr}
                                    type="primary">保存</Button>)
                    }
                    <Button style={{ background: 'rgb(187, 187, 187)', border: 'none', color: "#fff" }} onClick={() => {
                        this.setState({ isdisabled: false });
                        changeShowEditModalState(false);
                    }}>关闭</Button>
                </div>}
                centered={true}
                closable={false}
                className={"previewModal"}
                destroyOnClose={true}
                onCancel={() => {
                    changeShowEditModalState(false);
                }}
                getContainer={() => document.getElementById('dataPreview')}
                mask={false}
                width={'100%'}
                maskClosable={false}>
                <div className={styles.container}>
                    <div className={styles.left}>
                        {/* 这里预留 编辑 页面 */}
                        <div className={`${styles.content} ${isEdit ? styles.editHeight : styles.normalHeight}`}>

                            {/*<Switch>*/}
                            {/*<Route exact path={`http://localhost:8888/#/main/dic/small/ll`} component={FormRender} />*/}
                            {/*</Switch>*/}

                            {/*<TipContent />*/}
                            {
                                this.state.visible ? <FilterPart {...filterPartProps} /> : null
                            }
                            <FormRender {...formRenderProps} onRef={(ref) => {
                                this.child = ref
                            }} transferMsg={msg => this.transferMsg(msg)} />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>;
    }
}

export default CreditTableRow;
