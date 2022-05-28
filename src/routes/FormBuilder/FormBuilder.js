import React from "react";
import { connect } from "dva";
import { Tabs, message, Spin, Alert, Modal } from "antd";
import styles from "./FormBuilder.less";
import FormDropTarget from "../../components/HOC/FormDropTarget";
import Operate from "../../components/FormControl/Operate.js";
import Preview from "../../components/FormControl/Preview/Preview.js";
import FORMSTATUS from "../../enums/FormStatus";
import FormProperties from "../../components/FormControl/Attribute/FormProperties";
import queryString from "query-string";
import FormControlType from "../../enums/FormControlType";
import controlList from "../../components/FormControl/FormControlList";
import BusinessRule from "../../components/BusinessRule/BusinessRule";
import BusinessEvent from "../BusinessEvent/BusinessEvent";
import UserFuncs from "../../components/FormViewList/UserFuncs";
import {
    getFormContainerByContainerId,
    initForm,
    initBusinessRule,
    FormContext,
    buildSubFormRowDataModel,
    SubFormItem,
    buildControlAuthority
} from "commonForm";
import DataAuthorityNew from "../DataAuthorityNew/DataAuthorityNew";

const TabPane = Tabs.TabPane;
const None = () => null;

class FormBuilder extends React.Component {
    constructor(props) {
        super(props);
        this.setValue = this.setValue.bind(this);
        this.setValueSingle = this.setValueSingle.bind(this);
        this.setCurrent = this.setCurrent.bind(this);
        this.delFormItemBatch = this.delFormItemBatch.bind(this);
        this.delExFormItemBatch = this.delExFormItemBatch.bind(this);
        this.beginDrag = this.beginDrag.bind(this);
        this.endDrag = this.endDrag.bind(this);
        this.isCanCancelMoveFormItem = this.isCanCancelMoveFormItem.bind(this);
        this.cancelMove = this.cancelMove.bind(this);
        this.remove = this.remove.bind(this);
        this.copy = this.copy.bind(this);
        this.changeContainer = this.changeContainer.bind(this);
        this.move = this.move.bind(this);
        this.addEx = this.addEx.bind(this);
        this.add = this.add.bind(this);
        this.addSimple = this.addSimple.bind(this);
        this.setDataLinker = this.setDataLinker.bind(this);
        this.removeDataLinker = this.removeDataLinker.bind(this);
        this.previewShow = this.previewShow.bind(this);
        this.refresh = this.refresh.bind(this);
        // this.ReleaseForm = this.ReleaseForm.bind(this);
        this.previewHide = this.previewHide.bind(this);
        this.setProxy = this.setProxy.bind(this);
        this.save = this.save.bind(this);
        this.getLinkFormList = this.getLinkFormList.bind(this);
        this.getLinkFormLDetail = this.getLinkFormLDetail.bind(this);
        this.setFormProperties = this.setFormProperties.bind(this);
        this.reset = this.reset.bind(this);
        this.getProxyStorage = this.getProxyStorage.bind(this);
        this.allCollapseToggle = this.allCollapseToggle.bind(this);
        this.getItemBase = this.getItemBase.bind(this);
        this.getPanelBody = this.getPanelBody.bind(this);
        this.getPanelChild = this.getPanelChild.bind(this);
        this.renderCheck = this.renderCheck.bind(this);
        this.setAnchorIndex = this.setAnchorIndex.bind(this);
        this.buildFormDataFilter = this.buildFormDataFilter.bind(this);
        this.dropCountCheck = this.dropCountCheck.bind(this);
        this.dropItemCheck = this.dropItemCheck.bind(this);
        this.loadExternalData = this.loadExternalData.bind(this);
        this.loadResourceData = this.loadResourceData.bind(this);
        this.setAuthority = this.setAuthority.bind(this);
        this.addToModify = this.addToModify.bind(this);
        this.getGroupItemsValue = this.getGroupItemsValue.bind(this);
        this.getLinkerParams = this.getLinkerParams.bind(this);
        this.setExternalId = this.setExternalId.bind(this);
        // 新增 流水号
        this.getSerialNumSeed = this.getSerialNumSeed.bind(this);
        this.saveStatus = this.saveStatus.bind(this);
        if (this.props.type === "modify")
            this.props.dispatch({
                type: "formBuilder/beginLoadForm",
                id: this.props.formBuilder.get("formTemplateVersionId")
            });
        this.state = {
            size: "large",
            Tabskey: "1",
            formTemplateVersionId: props.formBuilder.get("formTemplateVersionId"),
            provider: {
                getRootFormId: this.getRootFormId,
                getPanelBody: this.getPanelBody,
                getPanelChild: this.getPanelChild,
                renderCheck: this.renderCheck,
                setProxyCall: this.setProxy,
                dropItemCheck: this.dropItemCheck,
                dropCountCheck: this.dropCountCheck,
                getProxyStorage: this.getProxyStorage,
                loadExternalData: this.loadExternalData,
                loadResourceData: this.loadResourceData,
                delFormItemBatch: this.delFormItemBatch,
                renderList: props.formBuilder.get("renderList"),
                getItemBase: this.getItemBase,
                getGroupItemsValue: this.getGroupItemsValue,
                getLinkerParams: this.getLinkerParams,
                renderSubItemHeader: this.renderSubItemHeader,
                renderSubItemCell: this.renderSubItemCell,
                buildSubFormRowData: this.buildSubFormRowData,
                buildFormDataFilter: this.buildFormDataFilter,
                setTableLinker: this.setTableLinker,
                getSubTableList: this.getSubTableList,
                setTableLinkerFilterValue: this.setTableLinkerFilterValue,
                buildControlAuthority
            },
            saveStatus: false,
            Release: null
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.formBuilder && nextProps.formBuilder.get("renderList").size > 0) {
            return { provider: { ...prevState.provider, renderList: nextProps.formBuilder.get("renderList") } };
        }
        return null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.size !== undefined) {
            if (this.state.size !== nextState.size || this.state.Tabskey !== nextState.Tabskey) {
                return true;
            }
        }
        if (nextState.saveStatus !== undefined) return true;
        if (this.props.formBuilder === undefined) return false;
        if (nextProps.formBuilder !== undefined) {
            if (this.state.formTemplateVersionId === nextProps.formBuilder.get("formTemplateVersionId")) {
                return (
                    this.props.formBuilder !== nextProps.formBuilder ||
                    this.props.businessRule !== nextProps.businessRule
                );
            }
        }
        return false;
    }

    // componentWillUnmount() {
    //     this.props.dispatch({
    //         type: 'formBuilder/unload',
    //         formTemplateVersionId: this.props.formBuilder.get('formTemplateVersionId')
    //     });
    // }

    setAuthority(id, attr, key, value) {
        this.props.dispatch({
            type: "formBuilder/setAuthority",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            attr,
            key,
            value
        });
    }

    setTableLinker = (id, linker) => {
        this.props.dispatch({
            type: "formBuilder/setTableLinker",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            linker
        });
    };


    setTableLinkerFilterValue = (id, value) => {
        this.props.dispatch({
            type: "formBuilder/setTableLinkerFilterValue",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            value
        });
    };

    getTableLinkerValueList = (id) => {
        this.props.dispatch({
            type: "formBuilder/getTableLinkerValueList",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id
        });
    };

    setLangValue = (id, lang, value) => {
        this.props.dispatch({
            type: "formBuilder/setLangValue",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            lang,
            value
        });
    };

    setValue(list) {
        this.props.dispatch({
            type: "formBuilder/setValue",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            list
        });
    }

    setValueSingle(id, data, proxyIndex = -1) {
        this.props.dispatch({
            type: "formBuilder/setValue",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            list: [{ proxyIndex, items: [{ id, data }] }]
        });
    }

    delFormItemBatch(list) {
        this.props.dispatch({
            type: "formBuilder/removeFormItemBatch",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            list
        });
    }

    delExFormItemBatch(list, id) {
        this.props.dispatch({
            type: "formBuilder/removeFormExternalItemBatch",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            list,
            id
        });
    }

    addEx(obj) {
        this.props.dispatch({
            type: "formBuilder/addExternalFormItem",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            ...obj
        });
    }

    add(obj) {
        this.props.dispatch({
            type: "formBuilder/addFormItem",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            ...obj
        });
    }

    addSimple(obj) {
        debugger;
        this.props.dispatch({
            type: "formBuilder/addFormItemSimple",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            ...obj
        });
    }

    beginDrag(id, container) {
        this.props.dispatch({
            type: "formBuilder/beginDragItem",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            container
        });
    }

    endDrag(obj) {
        this.props.dispatch({
            type: "formBuilder/endDragItem",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            ...obj
        });
    }

    isCanCancelMoveFormItem(flag) {
        this.props.dispatch({
            type: "formBuilder/isCanCancelMoveFormItem",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            flag
        });
    }

    getSubTableList = (id) => {
        this.props.dispatch({
            type: "formBuilder/getSubTableList",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id
        });
    };

    cancelMove(obj) {
        this.props.dispatch({
            type: "formBuilder/cancelMoveFormItem",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            ...obj
        });
    }

    remove(id) {
        this.props.dispatch({
            type: "formBuilder/removeFormItem",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id
        });
    }

    copy(id, itemType) {
        this.props.dispatch({
            type: "formBuilder/copyFormItem",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            itemType
        });
    }

    changeContainer(id, to, groupId, itemType) {
        this.props.dispatch({
            type: "formBuilder/changeContainer",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            to,
            groupId,
            itemType
        });
    }

    move({ frm, to, formControlType, direction }) {
        this.props.dispatch({
            type: "formBuilder/moveFormItem",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            to,
            frm,
            formControlType,
            direction
        });
    }

    previewShow() {
        this.props.dispatch({
            type: "formBuilder/PreviewShowFn",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId")
        });
    }

    refresh() {
        this.props.dispatch({
            type: "formBuilder/refresh",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId")
        });
        this.props.dispatch({
            type: "formBuilder/beginLoadForm",
            id: this.props.formBuilder.get("formTemplateVersionId")
        });
    }

    // ReleaseForm() {
    //     this.props.dispatch({
    //         type: "formBuilder/SendPublishForm",
    //         formTemplateVersionId: this.props.formBuilder.get('formTemplateVersionId'),
    //     });
    // }

    previewHide() {
        this.props.dispatch({
            type: "formBuilder/PreviewHideFn",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId")
        });
        this.setAnchorIndex(0);
    }

    setDataLinker(id, dataLinker) {
        this.props.dispatch({
            type: "formBuilder/setDataLinker",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            dataLinker
        });
    }

    removeDataLinker(id, filter) {
        this.props.dispatch({
            type: "formBuilder/removeDataLinker",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            filter
        });
    }

    setProxy(id, proxyData, preview = false) {
        this.props.dispatch({
            type: "formBuilder/setProxy",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            proxyData,
            preview
        });
    }

    setExternalId(id, externalId) {
        this.props.dispatch({
            type: "formBuilder/setExternalId",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            externalId
        });
    }

    //新增 流水号方法
    getSerialNumSeed() {
        const { formTemplateVersionId, serialNumSeedActionRequest } = this.props.formBuilder.toJSON();
        const id = serialNumSeedActionRequest ? serialNumSeedActionRequest.id : null;
        id &&
            this.props.dispatch({
                type: "formBuilder/GetSerialNumSeed",
                id,
                formTemplateVersionId
            });
    }

    saveStatus(status) {
        this.setState({
            saveStatus: status
        });
    }

    savePublic(funcId) {
        this.saveStatus(true);
        let { Release } = this.state;
        let {
            formTemplateVersionId
        } = this.props.formBuilder.toJSON();
        this.props.dispatch({
            type: "formBuilder/beginSave",
            formTemplateVersionId,
            addToModify: this.addToModify,
            Release,
            funcId,
            saveStatus: this.saveStatus
        });
    }

    save(Release) {
        //保存之前校验表单关系配置
        let { BuildContactData, formList } = this.props.formBuilder.toJS();
        let hasSubForm = formList.filter(a => a.formType === 1).filter(b => b.operationStatus !== FORMSTATUS.Delete);
        if (hasSubForm.length) {
            if (BuildContactData) {
                if (BuildContactData[0].children.length === 0) {
                    message.error("保存或发布表单之前，请配置表单关系!!!");
                    return;
                }
            } else {
                message.error("保存或发布表单之前，请配置表单关系!!!");
                return;
            }
        }
        this.saveStatus(true);
        this.setState({ Release });
        if (Release) {
            this.props.dispatch({
                type: "formBuilder/getUserFuncs",
                formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId")
            });
        } else {
            this.savePublic(Release);
        }
    }


    //构建表单关系配置
    buildSaveData = (dataMain) => {
        this.props.dispatch({
            type: "formBuilder/buildSaveData",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            dataMain
        });
    };


    userFuncsCancel = () => {
        this.setState({ Release: null });
        this.props.dispatch({
            type: "formBuilder/userFuncsCancel",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            saveStatus: this.saveStatus
        });
    };

    setFormProperties(data) {
        this.props.dispatch({
            type: "formBuilder/setFormProperties",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            data
        });
    }

    userFuncSubmit = (funcId) => {
        if (funcId) {
            this.saveStatus(true);
            this.props.dispatch({
                type: "formBuilder/userFuncsCancel",
                formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
                saveStatus: this.saveStatus
            });
            this.savePublic(funcId);
        } else {
            message.warning("必须要选中一个菜单");
        }
    };

    setCurrent(id) {
        this.props.dispatch({
            type: "formBuilder/setCurrent",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id
        });
    }

    getLinkFormList() {
        this.props.dispatch({
            type: "formBuilder/getLinkFormList"
            // formTemplateVersionId: this.props.formBuilder.get('formTemplateVersionId'),
        });
    }

    getLinkFormLDetail(id, saveTo) {
        // this.props.dispatch({
        //     type: 'formBuilder/getLinkFormLDetail',
        //     formTemplateVersionId: this.props.formBuilder.get('formTemplateVersionId'),
        //     id,
        //     saveTo
        // });
    }

    reset(list, proxyIndex = -1) {
        this.props.dispatch({
            type: "formBuilder/beginResetItem",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            list,
            proxyIndex
        });
    }

    setAnchorIndex(index) {
        this.props.dispatch({
            type: "formBuilder/setAnchorIndex",
            payload: {
                formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
                anchorIndex: index
            }
        });
    }

    allCollapseToggle(singleId) {
        this.props.dispatch({
            type: "formBuilder/allCollapseToggle",
            payload: {
                formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
                singleId
            }
        });
    }

    buildFormDataFilter(filter) {
        this.props.dispatch({
            type: "formBuilder/buildFormDataFilter",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            filter
        });
    }

    addBusiness = (fieldAuth) => {
        this.props.dispatch({
            type: "formBuilder/addBusiness",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            fieldAuth
        });
    };

    loadExternalData(postData, ignoreConditions = false, extraConditions = []) {
        this.props.dispatch({
            type: "formBuilder/beginLoadExternalData",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            ignoreConditions,
            extraConditions,
            ...postData
        });
    }

    loadResourceData(postData, ignoreConditions = false) {
        this.props.dispatch({
            type: "formBuilder/beginLoadResourceData",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            ignoreConditions,
            ...postData
        });
    }


    getProxyStorage(id) {
        return this.props.formBuilder.getIn(["proxyPool", id]);
    }

    getPanelBody(id) {
        return this.props.formBuilder
            .get("formBody")
            .filter(
                a => a.get("container") == id
                //&& !a.get('isHide')
            )
            .toJSON()
            .map(a => a.toJSON());
    }

    getItemBase(id) {
        return this.props.formBuilder
            .get("formBody")
            .find(a => a.get("id") === id)
            .get("itemBase");
    }

    getRootFormId = () => {
        return this.props.formBuilder.get("formBody").filter(e => e.get('itemType') === 'Root').toJSON()[0].toJSON().formId;
    }

    getPanelChild(id) {
        let l = this.props.formBuilder.get("formBody").filter(a => a.get("container") === id); // && !a.get('isHide'));
        let temp = [];
        l.forEach(a => {
            if (a.get("formControlType") > 0) {
                temp = temp.concat(this.getPanelChild(a.get("id")));
            }
        });
        return l
            .toJSON()
            .map(a => a.toJSON())
            .concat(temp);
    }

    renderCheck(id) {
        return this.state.provider.renderList.includes(id);
    }

    dropCountCheck(itemType) {
        let count = parseInt(this.props.controlExtra.dropCount[itemType]);
        if (!isNaN(count)) {
            let dragIndex = this.props.formBuilder.get("dragIndex");
            let v =
                this.props.formBuilder
                    .get("formBody")
                    .filter(
                        a =>
                            a.get("itemType") === itemType &&
                            a.get("status") !== FORMSTATUS.Delete &&
                            a.get("id") !== dragIndex &&
                            a.get("isExternal") !== true
                    ).size < count;
            return v;
        }
        return true;
    }

    dropItemCheck(dragItemType, dropItemType) {
        if (this.props.controlExtra.dropOnSubForm[dragItemType] === false && this.props.controlExtra.isSubTable[dropItemType] === true)
            return false;
        if (this.props.controlExtra.dropItemValueTypes[dropItemType] === undefined)
            return true;
        return (
            this.props.controlExtra.dropItemValueTypes[dropItemType].indexOf(
                this.props.controlExtra.valueType[dragItemType]
            ) > -1
        );
    }

    setTitleDisabled = (titleDisabled) => {
        this.props.dispatch({
            type: "formBuilder/setTitleDisabled",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            titleDisabled
        });
    };

    callback = key => {
        let { formStatus } = this.props.formBuilder.toJSON();
        if (formStatus !== FORMSTATUS.NoChange) {
            message.info("请先保存表单！");
            return;
        }
        this.setTitleDisabled(key !== "1");
        this.setState({
            Tabskey: key
        });
    };

    //新增模板后转换为修改模板需要的准备
    addToModify(formTemplateId, versionId, moduleId) {
        let query = queryString.parse(this.props.history.location.search);
        query.tabId = versionId;
        query.type = "modify";
        query.formTemplateId = formTemplateId;
        query.moduleId = moduleId;
        //console.log(query);
        this.setState({
            formTemplateVersionId: versionId
        });
        this.props.history.replace({
            pathname: this.props.location.pathname,
            search: queryString.stringify(query)
        });
    }

    //获取控件组值集合
    getGroupItemsValue(id, proxyIndex) {
        let groupContainer = this.props.formBuilder.get("formBody").find(a => a.get("id") === id);
        let items = this.props.formBuilder
            .get("formBody")
            .filter(a => a.get("container") === id)
            .map(a => ({
                value: a.getIn(["itemBase", "value"]) || a.getIn(["itemBase", "defaultValue"]),
                key: a.getIn(["itemBase", "key"])
            }))
            .toJS();
        let groupValues = {};
        if (groupContainer.get("delegate") === true) {
            let proxyContainer = getFormContainerByContainerId(
                groupContainer.get("id"),
                this.props.formBuilder.get("formBody")
            );
            let proxy = this.props.formBuilder.getIn(["proxyPool", proxyContainer.get("id")]).toJS();
            let proxyData = proxyContainer.getIn(["proxyEvents", "onLinkGet"])({ proxy, proxyIndex })[0];
            if (proxyData) {
                let groupItems = groupContainer.getIn(["itemBase", "groupItems"]).toJS();
                Object.keys(groupItems).forEach(a => {
                    if (proxyData[groupItems[a].id]) groupValues[a] = proxyData[groupItems[a].id].value;
                });
            }
        } else {
            items.forEach(a => {
                groupValues[a.key] = a.value;
            });
        }
        return groupValues;
    }

    //获取控件计算元素
    getLinkerParams(id) {
        let item = this.props.formBuilder.get("formBody").find(a => a.get("id") === id);
        if (item.hasIn(["event", "onGetLinkerParams"]))
            return item.getIn(["event", "onGetLinkerParams"])({ ...item.get("itemBase").toJS(), id });
        return [];
    }

    MouseMove = e => {
        if (e.pageY + 20 > e.currentTarget.clientHeight) {
            //console.log(e.currentTarget.clientHeight)
            e.currentTarget.scrollTop += 15;
        }
        if (e.pageY < 120) {
            // console.log(e.currentTarget.clientHeight)
            e.currentTarget.scrollTop -= 15;
        }
    };
    setGroupName = (id, name) => {
        this.props.dispatch({
            type: "formBuilder/setGroupName",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            id,
            name
        });
    };
    setTableLinkerValue = (tableId, proxyIndex, value) => {
        this.props.dispatch({
            type: "formBuilder/setTableLinkerValue",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            tableId,
            proxyIndex,
            value
        });
    };

    getBusinessPosition = (onSuccess) => {
        this.props.dispatch({
            type: "formBuilder/getBusinessPosition",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            onSuccess
        });
    };

    updatePermission = () => {
        this.props.dispatch({
            type: "formRender/refreshPermission",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId")
        });
    };
    applyLang = (lang) => {
        console.log(lang);
        debugger;
        this.props.dispatch({
            type: "formBuilder/applyLang",
            formTemplateVersionId: this.props.formBuilder.get("formTemplateVersionId"),
            lang
        });
    };
    renderSubItemHeader = (id, renderStyle, extraProps) => {
        let {
            setValue,
            setValueSingle,
            setCurrent,
            reset,
            beginDrag,
            isCanCancelMoveFormItem,
            cancelMove,
            remove,
            copy,
            endDrag,
            changeContainer,
            move,
            setLangValue
        } = this;
        let designProps = {
            setValue,
            setValueSingle,
            setLangValue,
            setCurrent,
            reset,
            beginDrag,
            isCanCancelMoveFormItem,
            cancelMove,
            remove,
            copy,
            endDrag,
            changeContainer,
            move
        };
        if (id.indexOf("header") < 0) {
            let item = this.props.formBuilder.get("formBody").find(a => a.get("id") === id);
            if (!item) {
                item = this.props.formBuilder
                    .get("formBody")
                    .filter(a => a.hasIn(["itemBase", "tabItems"]))
                    .find(a => a.getIn(["itemBase", "tabItems"]).some(b => b.get("formId") === id))
                    .toJSON();
                let tabItem = item.itemBase
                    .get("tabItems")
                    .find(a => a.get("formId") === id)
                    .toJS();
                item.itemBase = item.itemBase.set("name", tabItem.title);
                item.groupId = id;
                //return <th>{tabItem.title}</th>
            }
            else
                item = item.toJSON();
            const { Component, WrappedComponent, formProperties, ...other } = item;
            if (Component) {
                return (
                    <Component
                        mode="tableHeader"
                        {...other}
                        {...designProps}
                        {...extraProps}
                        renderStyle={renderStyle}
                    />
                );
            }
            return <th {...extraProps}>{item.itemBase.get("name")}</th>;
        }
        return <th {...extraProps}>{extraProps.title}</th>;
    };

    renderSubItemCell = ({ id, extraProps, value, proxyIndex, authority, help, validateStatus, textAlign, editMode = false }) => {
        return <SubFormItem id={id} extraProps={extraProps} value={value} proxyIndex={proxyIndex} authority={authority}
                            help={help} onChangeAll={onChangeAll} validateStatus={validateStatus} textAlign={textAlign} editMode={editMode}
                            formBody={this.props.formBuilder.get("formBody")}
                            setTableLinkerValue={this.setTableLinkerValue}
                            setValueSingle={this.setValueSingle} setValue={this.setValue}
                            getTableLinkerValueList={this.getTableLinkerValueList}/>;
    };

    buildSubFormRowData = id => {
        return buildSubFormRowDataModel(id, this.props.formBuilder.get("formBody").toJS());
    };

    render() {
        console.log("formBuilder render!", this.props.formBuilder.toJS());
        // console.log('formBuilder render!', this.props);
        let {
            currentIndex,
            showPreview,
            isSubmitting,
            dragIndex,
            anchorIndex,
            renderList,
            rootContainer,
            formPreviewRenderStyle,
            currentFormData, //linkFormDetail,
            formTemplateVersionId,
            formTitle,
            formBody,
            formProperties,
            proxyPool,
            moduleId,
            userFuncsVisible,
            userFuncsData,
            formTemplateType //0 没有流程 1 加载流程
        } = this.props.formBuilder.toJSON();
        console.log(formBody.toJS());
        let orignFormBody = formBody;
        formBody = formBody.filter(e => !e.get("isHide") || e.get("itemType") === "BusinessKey");

        let { linkFormList, thirdPartyList, leftListGroup, foreignFormData, allWithValideList } = this.props;
        let {
            beginDrag,
            endDrag,
            isCanCancelMoveFormItem,
            cancelMove,
            remove,
            copy,
            setAuthority,
            buildSubFormRowData,
            changeContainer,
            move,
            add,
            addEx,
            setValue,
            setValueSingle,
            setLangValue,
            setCurrent,
            addSimple,
            renderSubItemCell,
            reset,
            setAnchorIndex,
            getProxyStorage,
            renderCheck,
            setFormProperties,
            getGroupItemsValue,
            removeDataLinker,
            loadExternalData,
            loadResourceData,
            delFormItemBatch,
            delExFormItemBatch,
            setDataLinker,
            allCollapseToggle
        } = this;
        let anchorList = formBody
            .filter(
                a =>
                    a.get("container") == rootContainer &&
                    a.get("status") != FORMSTATUS.Delete &&
                    a.get("formControlType") > 1 && !a.getIn(["itemBase", "hidden"])
            )
            .map(a => ({
                name: a.getIn(["itemBase", "name"]),
                id: a.get("id")
            }));
        const OperateProps = {
            Preview: this.previewShow,
            Refresh: this.refresh,
            Save: this.save,
            history: this.props.history
        };
        const PreviewProps = {
            formTitle: formTitle,
            anchorList,
            anchorIndex,
            formBody: orignFormBody,
            controlList,
            renderList,
            getProxyStorage,
            loadExternalData,
            loadResourceData,
            renderCheck,
            showPreview,
            setAnchorIndex,
            allCollapseToggle,
            renderStyle: formPreviewRenderStyle,
            rootContainer,
            setValue,
            buildSubFormRowData,
            renderSubItemCell,
            setValueSingle,
            handleCancel: this.previewHide,
            proxyPool,
            getGroupItemsValue,
            reset,
            //setTableLinkerValue,
            setTableLinkerFilterValue: this.setTableLinkerFilterValue,
            setProxy: (id, data) => {
                this.setProxy(id, data, true);
            },
            history: this.props.history,
            getSerialNumSeed: this.getSerialNumSeed,
            applyLang: this.applyLang
        };
        const FormProps = {
            formProperties,
            setFormProperties,
            // formBody,
            currentIndex,
            currentFormData,
            getBusinessPosition: this.getBusinessPosition,
            foreignFormData,
            buildFormDataFilter: this.buildFormDataFilter,
            allWithValideList: allWithValideList || [],
            addBusiness: this.addBusiness,
            buildSaveData: this.buildSaveData,
            formBody,
            thirdPartyList,
            tabId: queryString.parse(this.props.history.location.search).tabId
        };
        let Current = { WrappedComponent: None };
        if (currentIndex != -1) {
            let exsit = formBody.find(a => a.get("id") === currentIndex);
            if (exsit) Current = exsit.toJSON();
        }
        const rootList = formBody.filter(
            a => a.get("container") == rootContainer && a.get("status") != FORMSTATUS.Delete
        );
        let { WrappedComponent, dragging, ...rightCurrent } = Current;

        //console.log(rightCurrent, rootList);
        switch (Current.formControlType) {
            case FormControlType.Container:
                rightCurrent = {
                    ...rightCurrent,
                    delFormItemBatch,
                    delExFormItemBatch,
                    addEx
                    //isRootContainer: Current.container === rootContainer
                };
                if (rightCurrent.isSubTable)
                    rightCurrent.formProperties = formProperties;
                break;
            case FormControlType.Item:
                break;
            case FormControlType.External:
                rightCurrent = {
                    ...rightCurrent,
                    delExFormItemBatch,
                    addEx
                };
                break;
            case FormControlType.Group:
                rightCurrent = { ...rightCurrent, getGroupItemsValue: this.getGroupItemsValue };
                break;
            default:
                break;
        }
        // 暂时写在这，获得 流水号 的 列表
        if (rightCurrent["itemType"] === "SerialNumber") {
            rightCurrent["rootList"] = formBody;
        }
        let formList = [];
        rootList.forEach(item => {
            const C = item.toJSON();
            const { Component, WrappedComponent, formProperties, ...other } = C;
            if (C.Component) {
                let pj = {
                    ...other,
                    key: C.id,
                    mode: "form",
                    setValue,
                    setValueSingle,
                    setCurrent,
                    reset,
                    beginDrag,
                    isCanCancelMoveFormItem,
                    cancelMove,
                    remove,
                    copy,
                    endDrag,
                    changeContainer,
                    move
                };
                formList.push(<C.Component {...pj} />);
            }
        });
        return (
            <div style={{ height: "100%", display: "flex", flexFlow: "column" }} id="Boots">
                <div className='saveStatus'>
                    {
                        this.state.saveStatus ?
                            <Spin tip="Loading..."
                                  style={{
                                      position: "fixed",
                                      maxHeight: "100%",
                                      zIndex: "1000",
                                      background: "rgba(72,169,255,0.1)"
                                  }}>
                                <Alert/>
                            </Spin> : null
                    }
                </div>
                <div style={{ flex: 1, height: 0 }}>
                    <Tabs
                        className="formTab"
                        activeKey={this.state.Tabskey}
                        tabBarExtraContent={Number(this.state.Tabskey) === 1 ? <Operate {...OperateProps} /> : null}
                        onChange={this.callback}
                    >
                        <TabPane
                            tab={
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <div
                                        className={`${styles.grayIcon}`}
                                        style={{ background: Number(this.state.Tabskey) === 1 ? "#40a9ff" : "" }}
                                    >1
                                    </div>
                                    <div style={{ paddingLeft: "3px" }}>表单设计</div>
                                </div>
                            }
                            key="1"
                        >
                            <FormContext.Provider value={this.state.provider}>
                                <Preview {...PreviewProps} formLayout={formProperties.toJS().formLayout}/>
                                <div className={styles.designTab}>
                                    <div style={{ width: "240px" }}>
                                        {leftListGroup.map((e, index) => (
                                            <div key={index} className={styles.ControlContent_card}>
                                                <p className={styles.ControlContentCard_header}>{e.name}</p>
                                                <div className={styles.ControlContentCard_body}>
                                                    {e.group.map(function(C, i) {
                                                        let p = {
                                                            itemType: C.itemType,
                                                            isCanCancelMoveFormItem,
                                                            cancelMove,
                                                            endDrag,
                                                            addSimple,
                                                            valueType: C.valueType
                                                        };
                                                        return <C.Component key={i} {...p} />;
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ flex: 1 }} onDragOver={this.MouseMove}>
                                        {showPreview ? null : (
                                            <FormDropTarget
                                                dropCountCheck={this.dropCountCheck}
                                                dragIndex={dragIndex}
                                                container={rootContainer}
                                                add={add}
                                                isCanCancelMoveFormItem={isCanCancelMoveFormItem}
                                                changeContainer={changeContainer}
                                                id={rootContainer}
                                                endDrag={endDrag}
                                                formLayout={formProperties.toJS().formLayout}
                                            >
                                                {formList}
                                            </FormDropTarget>
                                        )}
                                    </div>
                                    <div style={{ width: "300px", paddingBottom: "50px" }}>
                                        <Tabs
                                            activeKey={currentIndex != -1 ? "1" : "2"}
                                            onTabClick={e => {
                                                if (e == 2) {
                                                    this.setCurrent(-1);
                                                }
                                            }}
                                            className={`${styles.ControlTab} ControlTab`}
                                        >
                                            <TabPane tab="控件属性" key="1">
                                                <div id="KJSX" className={styles.ControllAttrWrapper}>
                                                    {//待优化
                                                        //根据不同类型动态设置props
                                                        !showPreview && currentIndex != -1 ? (
                                                            <Current.WrappedComponent
                                                                buildFormDataFilter={this.buildFormDataFilter}
                                                                currentFormData={currentFormData}
                                                                foreignFormData={foreignFormData}
                                                                getLinkFormLDetail={this.getLinkFormLDetail}
                                                                setValueSingle={setValueSingle}
                                                                setLangValue={setLangValue}
                                                                linkFormList={linkFormList}
                                                                thirdPartyList={thirdPartyList}
                                                                formTemplateVersionId={formTemplateVersionId}
                                                                setDataLinker={setDataLinker}
                                                                removeDataLinker={removeDataLinker}
                                                                setAuthority={setAuthority}
                                                                setGroupName={this.setGroupName}
                                                                setExternalId={this.setExternalId}
                                                                {...rightCurrent}
                                                                mode="option"
                                                            />
                                                        ) : null}
                                                </div>
                                            </TabPane>
                                            <TabPane tab="表单属性" key="2">
                                                <div className={styles.ControllAttrWrapper}>
                                                    {<FormProperties {...FormProps} />}
                                                </div>
                                            </TabPane>
                                        </Tabs>
                                    </div>
                                </div>
                            </FormContext.Provider>
                        </TabPane>
                        <TabPane
                            tab={
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <div
                                        className={`${styles.grayIcon}`}
                                        style={{ background: this.state.Tabskey == "3" ? "#40a9ff" : "" }}
                                    >
                                        2
                                    </div>
                                    <div style={{ paddingLeft: "3px" }}>分配权限</div>
                                </div>
                            }
                            key="3"
                        >
                            {this.state.Tabskey === "3" ? (
                                <DataAuthorityNew
                                    formBody={formBody.filter(a => a.get("status") != FORMSTATUS.Delete).toJS()}
                                    formTitle={formTitle}
                                    history={this.props.history}
                                    moduleId={moduleId}
                                    formTemplateType={formTemplateType}
                                    updatePermission={this.updatePermission}
                                    Save={this.save}
                                />
                            ) : null}
                        </TabPane>
                        <TabPane
                            tab={
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <div
                                        className={`${styles.grayIcon}`}
                                        style={{ background: this.state.Tabskey == "4" ? "#40a9ff" : "" }}
                                    >
                                        3
                                    </div>
                                    <div style={{ paddingLeft: "3px" }}>业务规则</div>
                                </div>
                            }
                            key="4"
                        >
                            {this.state.Tabskey === "4" ?
                                <BusinessRule
                                    formBody={formBody.filter(a => a.get("status") != FORMSTATUS.Delete).toJS()}
                                    dispatch={this.props.dispatch}
                                    businessRule={this.props.businessRule}
                                    formBuilder={this.props.formBuilder}
                                    formTemplateVersionId={this.props.formBuilder.get("formTemplateVersionId")}
                                    formTitle={formTitle}
                                    history={this.props.history}
                                    moduleId={moduleId}
                                    formTemplateType={formTemplateType}
                                />
                                : null}
                        </TabPane>
                        <TabPane
                            tab={
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <div
                                        className={`${styles.grayIcon}`}
                                        style={{ background: this.state.Tabskey == "5" ? "#40a9ff" : "" }}
                                    >
                                        4
                                    </div>
                                    <div style={{ paddingLeft: "3px" }}>业务事件</div>
                                </div>
                            }
                            key="5"
                        >
                            {this.state.Tabskey === "5" ?
                                <BusinessEvent dispatch={this.props.dispatch} history={this.props.history}/>
                                : null}
                        </TabPane>
                    </Tabs>
                </div>
                {userFuncsVisible ? <UserFuncs
                    visible={userFuncsVisible}
                    userFuncsData={userFuncsData}
                    funcSubmit={this.userFuncSubmit.bind(this)}
                    userFuncsCancel={this.userFuncsCancel.bind(this)}
                /> : null}
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    if (
        props.history.location.pathname.indexOf("/main/dic") === -1 &&
        props.history.location.pathname.indexOf("/formbuilder") === -1
    )
        return;
    let query = queryString.parse(props.history.location.search);
    let { linkFormList, foreignFormData, thirdPartyList, allWithValideList } = state.formBuilder;
    let formBuilder = null;
    let businessRule = null;
    if (query.tabId) {
        if (!state.formBuilder.all[query.tabId]) {
            state.formBuilder.all[query.tabId] = initForm(query.tabId, query.formTemplateType);
        }
        formBuilder = state.formBuilder.all[query.tabId];

        if (!state.businessRule.all[query.tabId])
            state.businessRule.all[query.tabId] = initBusinessRule(query.tabId, query.formTemplateType);
        businessRule = state.businessRule.all[query.tabId];
    }
    else return null;

    let data = {
        controlList,
        linkFormList,
        thirdPartyList,
        foreignFormData,
        leftListGroup: state.formBuilder.leftListGroup,
        controlExtra: state.formBuilder.controlExtra,
        type: query.type,
        allWithValideList
    };
    return { formBuilder, businessRule, ...data };
}

export default connect(mapStateToProps)(FormBuilder);
