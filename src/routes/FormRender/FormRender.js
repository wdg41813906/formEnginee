import React from "react";
import { connect } from "dva";
import { fromJS } from "immutable";
import { Button } from "antd";
import queryString from "query-string";
import FORMSTATUS from "../../enums/FormStatus";
import FORMRENDERSTYLE from "../../enums/FormRenderStyle";
import com from "../../utils/com";
import FormRender from "../../components/FormControl/FormRender/FormRender.js";
import controlList from "../../components/FormControl/FormControlList";
import {
    getFormContainerByContainerId,
    buildSubFormRowDataModel,
    buildControlAuthority,
    SubFormItem
} from "commonForm";
import { withRouter } from "dva/router";
import styles from "./FormRender.less";
import { getPrintPreview, GetPrintPaste } from "../../services/Print/PrintFunction";

class FormRenderWedding extends React.Component {
    constructor(props) {
        super(props);
        this.setValue = this.setValue.bind(this);
        this.setValueSingle = this.setValueSingle.bind(this);
        this.reset = this.reset.bind(this);
        this.setProxy = this.setProxy.bind(this);
        this.loadExternalData = this.loadExternalData.bind(this);
        this.loadResourceData = this.loadResourceData.bind(this);
        this.getProxyStorage = this.getProxyStorage.bind(this);
        this.getGroupItemsValue = this.getGroupItemsValue.bind(this);
        this.submit = this.submit.bind(this);
        let query = props.history ? queryString.parse(props.history.location.search) : { inst: null, tabId: null };
        let showButtonPanel = false;
        window.addEventListener("message", this.eventListener, false);
        if (props.history.location.pathname === "/formrelease") {
            props.dispatch({
                type: "formRender/beginLoadForm",
                formTemplateVersionId: query.tabId,
                hideProgress: true,
                formTemplateId: query.formTemplateId,
                ignoreLinker: true,
                instId: query.inst,
                query
            });
            showButtonPanel = true;
        }
        if (query.taskId) {
            this.state = {
                formTemplateVersionId: query.tabId,
                taskId: query.taskId,
                status: query.state,
                // parentUrl: query.parentUrl,
                showButtonPanel
            };
        } else {
            this.state = {
                formTemplateVersionId: query.tabId,
                showButtonPanel
            };
        }
    }

    eventListener = (event) => {
        if (event.data && event.data.parentUrl) {
            this.setState({
                parentUrl: event.data.parentUrl

            });
        }
    };

    componentDidMount() {
        if (this.props.onRef) {
            //通过pros接收父组件传来的方法
            this.props.onRef(this);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.formRender === undefined) {
            return !!queryString.parse(nextProps.location.search).tabId;
        }
        if (nextProps.formRender !== undefined) {
            if ((this.state.formTemplateVersionId || queryString.parse(nextProps.location.search).tabId) === nextProps.formRender.get("formTemplateVersionId") &&
                this.props.formRender.get("formTemplateVersionId") === nextProps.formRender.get("formTemplateVersionId")) {
                return this.props.formRender !== nextProps.formRender;
            }
        }

        return false;
    }

    setValue(list) {
        this.props.dispatch({
            type: "formRender/setValue",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            list//: [{ proxyIndex: -1, items: [{ id, data }] }],
        });
    }

    setValueSingle(id, data, proxyIndex = -1, preview = false) {
        this.props.dispatch({
            type: "formRender/setValue",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            list: [{ proxyIndex, items: [{ id, data }] }],
            preview
        });
    }

    applyLang = (lang) => {
        debugger;
        this.props.dispatch({
            type: "formRender/applyLang",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            lang
        });
    };

    setAnchorIndex = (index) => {
        this.props.dispatch({
            type: "formRender/setAnchorIndex",
            payload: {
                formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
                anchorIndex: index
            }
        });
    };
    allCollapseToggle = (singleId) => {
        this.props.dispatch({
            type: "formRender/allCollapseToggle",
            payload: {
                formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
                singleId
            }
        });
    };

    setProxy(id, proxyData) {
        this.props.dispatch({
            type: "formRender/setProxy",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            id,
            proxyData
        });
    }

    reset(list, proxyIndex = -1) {
        this.props.dispatch({
            type: "formRender/beginResetItem",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            list,
            proxyIndex
        });
    }

    loadExternalData(postData, ignoreConditions = false, extraConditions = []) {
        this.props.dispatch({
            type: "formRender/beginLoadExternalData",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            ignoreConditions,
            extraConditions,
            ...postData
        });
    }

    loadResourceData(postData, ignoreConditions = false) {
        this.props.dispatch({
            type: "formRender/beginLoadResourceData",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            ignoreConditions,
            ...postData
        });
    }


    setProxyState = (key, newState) => {
        this.props.dispatch({
            type: "formRender/updateBussinessProxyState",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            key,
            newState
        });
    };

    setProxyState2 = (key, formTemplateVersionId, newState) => {
        this.props.dispatch({
            type: "formRender/updateBussinessProxyState",
            formTemplateVersionId,
            key,
            newState
        });
    };

    //获取控件组值集合
    getGroupItemsValue(id, proxyIndex) {
        let groupContainer = this.props.formRender.get("formBody").find(a => a.get("id") === id);
        let items = this.props.formRender.get("formBody").filter(a => a.get("container") === id).map(a => ({
            value: a.getIn(["itemBase", "value"]) || a.getIn(["itemBase", "defaultValue"]),
            key: a.getIn(["itemBase", "key"])
        })).toJS();
        let groupValues = {};
        if (groupContainer.get("delegate") === true) {
            let proxyContainer = getFormContainerByContainerId(groupContainer.get("id"), this.props.formRender.get("formBody"));
            let proxy = this.props.formRender.getIn(["proxyPool", proxyContainer.get("id")]).toJS();
            let proxyData = proxyContainer.getIn(["proxyEvents", "onLinkGet"])({ proxy, proxyIndex })[0];
            if (proxyData) {
                let groupItems = groupContainer.getIn(["itemBase", "groupItems"]).toJS();
                Object.keys(groupItems).forEach(a => {
                    if (proxyData[groupItems[a].id])
                        groupValues[a] = proxyData[groupItems[a].id].value;
                });
            }
        }
        else {
            items.forEach(a => {
                groupValues[a.key] = a.value;
            });
        }
        return groupValues;
    }

    getFormData = (onSuccess) => {
        this.props.dispatch({
            type: "formRender/getFormData",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            onSuccess
        });
    };

    getOtherBussinessProxyState = ({ businessKey, onSuccess }) => {
        this.props.dispatch({
            type: "formRender/getOtherBussinessProxyState",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            businessKey,
            onSuccess
        });
    };

    getProxyStorage(id) {
        return this.props.formRender.getIn(["proxyPool", id]);
    }

    buildSubFormRowData = (id) => {
        return buildSubFormRowDataModel(id, this.props.formRender.get("formBody").toJS(), this.props.formRender.get("instId"));
    };
    renderSubItemCell = ({ id, extraProps, value, proxyIndex, authority, help, validateStatus, textAlign, editMode = false,onChangeAll }) => {
        return <SubFormItem id={id}  onChangeAll={onChangeAll} extraProps={extraProps} value={value} proxyIndex={proxyIndex} authority={authority}
                            help={help} validateStatus={validateStatus} textAlign={textAlign} editMode={editMode}
                            formBody={this.props.formRender.get("formBody")}
                            setTableLinkerValue={this.setTableLinkerValue}
                            setValueSingle={this.setValueSingle} setValue={this.setValue}
                            getTableLinkerValueList={this.getTableLinkerValueList}/>;
    };
    // CloseIframe = () => {
    //     console.log("closeIframe", this.state.parentUrl);
    //     window.parent.postMessage({
    //         isClose: true
    //     }, this.state.parentUrl);
    // };
    submit = ({ submitKey, submitName, params, query, tempSave = false }) => {
        this.props.dispatch({
            type: "formRender/beginSubmit",
            formTemplateVersionId: query.tabId,
            submitKey,
            submitName,
            formInstanceId: this.props.formRender.get("instId"),
            getOtherBussinessProxyState: this.getOtherBussinessProxyState,
            params,
            query,
            setProxyState: this.setProxyState2,
            onCompleted: this.CloseIframe,
            tempSave
        });
    };


    setTableLinker = (id, linker) => {
        this.props.dispatch({
            type: "formRender/setTableLinker",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            id,
            linker
        });
    };

    setTableLinkerValue = (tableId, proxyIndex, value) => {
        this.props.dispatch({
            type: "formRender/setTableLinkerValue",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            tableId,
            proxyIndex,
            value
        });
    };
    getTableLinkerValueList = (id) => {
        this.props.dispatch({
            type: "formRender/getTableLinkerValueList",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            id
        });
    };

    setTableLinkerFilterValue = (id, value) => {
        this.props.dispatch({
            type: "formRender/setTableLinkerFilterValue",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            id,
            value
        });
    };

    triggerClick = ({ submitKey, submitName, params, query }) => {
        this.props.dispatch({
            type: "formRender/triggerBussinessButton",
            formTemplateVersionId: query.tabId,
            getOtherBussinessProxyState: this.getOtherBussinessProxyState,
            submitKey,
            submitName,
            params,
            query,
            setProxyState: this.setProxyState2
        });
    };

    // buildSubmitButtons = () => {
    //     let submitInfoList = this.props.formRender.get("bussinessSubmitInfo");
    //     if (this.props.location.pathname === "/formbuilder/small") {
    //         return <Button type="primary" disabled={this.props.formRender.get("submitting")}
    //             //loading={props.formRender.get('submitting')}
    //             onClick={() => {
    //                 submit({ submitKey: null, params: { params: {} }, query });
    //             }}>
    //             保存
    //             </Button>;
    //     } else {
    //         let buttonList = [];
    //         if (Array.isArray(submitInfoList)) {
    //             submitInfoList.forEach(item => {
    //                 let submitKey = item.key;
    //                 item.list.forEach(btn => {
    //                     let { name, triggerType, ...params } = btn;
    //                     let submitFn = triggerType === "submit" ? submit : triggerClick;
    //                     if (btn.params.isOpen) {
    //                         buttonList.push(
    //                             <Button type="primary" disabled={this.props.formRender.get("formLoading")}
    //                                 //loading={props.formRender.get('submitting')}
    //                                 onClick={() => {
    //                                     submitFn({ submitKey, params, query });
    //                                 }} key={submitKey + name}>{name}</Button>
    //                         );
    //                     }
    //                 });
    //             });
    //         }
    //         if (buttonList.length === 0 && !this.props.readOnly && !this.props.formRender.get("formLoading") && Number(props.formRender.get("formTemplateType")) !== 1) {
    //             return <Button type="primary" disabled={this.props.formRender.get("submitting")}
    //                 //loading={props.formRender.get('submitting')}
    //                 onClick={() => {
    //                     submit({ submitKey: null, params: { params: {} }, query });
    //                 }}>
    //                 保存
    //                 </Button>;
    //         }
    //         return buttonList;
    //     }
    // };

    buildSubmitButtons = (submitInfoList) => {
        let query = queryString.parse(this.props.history.location.search);
        let buttonList = [];
        if (Array.isArray(submitInfoList)) {
            submitInfoList.forEach(item => {
                let submitKey = item.key;
                item.list.forEach(btn => {
                    let { name, triggerType, tempSave, ...params } = btn;
                    let submitFn = triggerType === "submit" ? this.submit : this.triggerClick;
                    if (btn.params.isOpen) {
                        buttonList.push(
                            <Button type="primary" disabled={this.props.formRender.get("BtnDisabled")||this.props.formRender.get("submitting")}
                                // loading={this.props.formRender.get('submitKey') === submitKey}
                                    onClick={() => {
                                        submitFn({ submitKey, submitName: name, params, query, tempSave });
                                    }} key={submitKey + name}>{name}</Button>
                        );
                    }
                });
            });
        }
        return buttonList;
    };
    CloseIframe = () => {
        window.parent.postMessage({
            isClose: true,
            isReload: true//是否刷新
        }, this.state.parentUrl);
    };
    //打印粘贴单
    PrintPaste = () => {
        GetPrintPaste({
            FormTemplateVersionId: queryString.parse(this.props.history.location.search).tabId,
            FormInstanceId: this.props.formRender.get("instId")
        });
    };
    addRowData = (id, rowData) => {
        let primaryKeyValue = com.Guid();
        this.props.dispatch({
            type: "formRender/addRowData",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            id,
            rowData,
            primaryKeyValue
        });
        return primaryKeyValue;
    };

    removeRowData = (id, primaryKeyValue) => {
        this.props.dispatch({
            type: "formRender/removeRowData",
            formTemplateVersionId: this.props.formRender.get("formTemplateVersionId"),
            id,
            primaryKeyValue
        });
    };

    render() {
        if (this.props.formRender) {
            let { formRender } = this.props;
            let query = queryString.parse(this.props.history.location.search);
            let {
                rootContainer, formRenderStyle, proxyPool, formTitle, anchorIndex, formBody: fb,
                renderList, Launch, formProperties, formLoading, bussinessComponents, bussinessProxyState
            } = formRender.toJSON();
            let { Print } = formProperties.toJS();
            if (this.props.transferMsg) {//按钮组向上级组件传递
                this.props.transferMsg(Launch ? Launch.optAuth : null);
            }
            let formBody = fb.filter(e => !e.get("isHide"));
            let anchorList = formBody.filter(a => a.get("container") == rootContainer && a.get("status") != FORMSTATUS.Delete && !a.getIn(["itemBase", "hidden"]) && a.get("formControlType") > 1).map(a => ({
                name: a.getIn(["itemBase", "name"]),
                id: a.get("id")
            }));
            let businessList = bussinessComponents.toJS().filter(a => a.components).map(Item => {
                let auList = fb.filter(a => a.get("itemType") === "BusinessKey" && a.getIn(["itemBase", "businessKey"]) === Item.key).toJS();
                let authority = {};
                auList.forEach(a => {
                    authority[a.itemBase.bussineskeyAuth] = buildControlAuthority(a.authority);
                });
                let proxyState = bussinessProxyState.find(a => a.get("key") === Item.key).toJS();
                let setting = formProperties.getIn(["bussinessComSetting", Item.key]);
                if (setting !== undefined)
                    setting = setting.toJS();
                else
                    setting = { position: null };
                return {
                    position: setting.position || null,
                    key: Item.key,
                    component: <Item.components key={Item.Key} {...proxyState} setProxyState={(newState) => {
                        this.setProxyState(Item.key, newState);
                    }} addRowData={this.addRowData} getFormData={this.getFormData}
                                                getOtherBussinessProxyState={this.getOtherBussinessProxyState}
                                                authority={authority}
                                                removeRowData={this.removeRowData} setting={setting}/>
                };
            });
            return <React.Fragment>
                <FormRender
                    // type={2}//type:1预览，2提交
                    formLoading={formLoading}
                    formBody={fb}//如果这里过滤掉ishide会导致兼容旧模板添加subform的primaryKey出错
                    anchorList={anchorList}
                    formTitle={formTitle}
                    formLayout={formProperties.toJS().formLayout}
                    rootContainer={rootContainer}
                    getProxyStorage={this.getProxyStorage}
                    buildSubFormRowData={this.buildSubFormRowData}
                    renderSubItemCell={this.renderSubItemCell}
                    renderList={renderList}
                    controlList={controlList}
                    setValue={this.setValue}
                    setValueSingle={this.setValueSingle}
                    renderStyle={formRenderStyle}
                    anchorIndex={anchorIndex}
                    proxyPool={proxyPool}
                    setProxyCall={this.setProxy}
                    reset={this.reset}
                    setAnchorIndex={this.setAnchorIndex}
                    allCollapseToggle={this.allCollapseToggle}
                    loadExternalData={this.loadExternalData}
                    loadResourceData={this.loadResourceData}
                    getGroupItemsValue={this.getGroupItemsValue}
                    setTableLinker={this.setTableLinker}
                    setTableLinkerFilterValue={this.setTableLinkerFilterValue}
                    applyLang={this.applyLang}
                    businessList={businessList}
                >
                    {
                        this.state.showButtonPanel ?
                            <div className={styles.buttonPanel}>
                                {
                                    this.props.formRender.get("formEnable") === true ?
                                        this.buildSubmitButtons(this.props.formRender.get("bussinessSubmitInfo")) : null
                                }
                                {
                                    (Print || []).map((a, i) => {
                                        return <Button key={i} disabled={this.props.formRender.get("submitting")}
                                                       onClick={a.key === 0 ? () => getPrintPreview(query.tabId, this.props.formRender.get("instId")) : this.PrintPaste}>{a.name}</Button>;
                                    })
                                }
                                {/*<Button key="print" disabled={this.props.formRender.get("submitting")}*/}
                                {/*onClick={() => getPrintPreview(query.tabId, this.props.formRender.get("instId"))}>打印</Button>*/}
                                {/*<Button disabled={this.props.formRender.get("submitting")}*/}
                                {/*onClick={this.PrintPaste}*/}
                                {/*>打印粘贴单</Button>*/}
                                {
                                    query.sourceType === "preview" ? null : <Button style={{
                                        background: "rgb(187, 187, 187)",
                                        marginLeft: "10px",
                                        border: "none",
                                        color: "#fff"
                                    }} disabled={this.props.formRender.get("submitting")}
                                                                                    onClick={this.CloseIframe}>关闭</Button>
                                }

                            </div> : null

                    }
                </FormRender>
            </React.Fragment>;
        }
        else {
            return null;
        }
    }
}

export function initFormBuilder(formTemplateVersionId) {
    return fromJS({
        rootContainer: com.Guid(),
        formTemplateVersionId,
        anchorIndex: 0,//锚点索引
        formTemplateId: formTemplateVersionId,
        formBody: [],
        formBodyNeed: [],
        rootFormId: com.Guid(),
        formTitle: "",//新建表单
        formList: [],
        formStatus: FORMSTATUS.Add,//1新增,2修改,0删除,3不变
        formRenderStyle: FORMRENDERSTYLE.PC,//设计时渲染的风格
        //formPreviewRenderStyle: FORMRENDERSTYLE.PC,//预览时渲染的风格
        currentIndex: -1,//当前选中的控件id
        dragIndex: -1,//当前被拖拽的控件的id
        oldContainer: null,//当前被拖拽的控件起始容器
        proxyPool: {},//代理池
        //proxyLinkData: {},//用于数据联动计算的被代理控件的值集合
        isSubmitting: false,
        currentFormData: [],
        isUsed: false,
        dataLinker: {},//数据联动关系集合
        formProperties: {//表单属性
            //dataLinker: [],
            formLayout: 2, //1单列,2双列,3三列,4四列
            formControlStyleModel: 1, //表单模式,1水平,2垂直
            border: null, //是否显示border
            invisibleTxtInit: 1, //不可见字段赋值:1原值，2空值，3始终重新计算
            formSubmitVerification: "", //表单提交校验
            thirdPartyId: [], // 第三方数据源提交校验ID
            thirdPartyVerification: [], // 第三方数据源关联参数列表
            bussinessComSetting: {},//业务组件配置
            tableLinker: {}//子表链接
        },
        bussinessProxyState: [],
        bussinessComponents: [],
        bussinessComponentsList: [],
        bussinessSubmitInfo: [],
        oldValues: [],
        updateFlag: true,
        formLoading: false,
        isCanCancelMoveFormItem: false,//是否可以CanCancelMoveFormItem
        isUpdateVersion: false,//保存使用，area,form,item新增或删除true,其他false
        //linkFormDetail: [],//选择联动表后，详细字段
        renderList: []//需要重新渲染的容器集合
    });
}

function mapStateToProps(state, props) {
    if (props.history && props.history.location.pathname.indexOf("/main/show") === -1 &&
        props.history.location.pathname.indexOf("/formrelease") === -1 &&
        props.history.location.pathname.indexOf("/small") === -1 &&
        props.history.location.pathname.indexOf("/accountBook") === -1)
        return;
    let formRender = null;
    if (props.tabId) {
        if (!state.formRender.all[props.tabId]) {
            state.formRender.all[props.tabId] = initFormBuilder(props.tabId);

        }
        formRender = state.formRender.all[props.tabId];
    } else {
        let query = queryString.parse(props.history.location.search);
        if (query.tabId) {
            if (!state.formRender.all[query.tabId]) {
                state.formRender.all[query.tabId] = initFormBuilder(query.tabId);
            }
            formRender = state.formRender.all[query.tabId];
        } else {
            return null;
        }
    }
    return { formRender, controlList };
}

export default withRouter(connect(mapStateToProps)(FormRenderWedding));
