import React, { useState, useCallback } from "react";
import FormBase from "./FormBase";
import styles from "./FormItemBase.less";
import RENDERSTYLE from "../../enums/FormRenderStyle";
import { Form, Icon, Popover, Tooltip } from "antd";
import DescFormatter from "./common/DescFormatter";
import Title from "../../components/FormControl/Attribute/Title.js";
import Desc from "../../components/FormControl/Attribute/Desc.js";
import Position from "../../components/FormControl/Attribute/PositionStyle";
import FormSortDrop from "../HOC/FormSortDrop";
import FormDragSource from "../HOC/FormDragSource";
import { LINKTYPE } from "./DataLinker/DataLinker";
import OperationPower from "./Attribute/OperationPower";

const FormItem = Form.Item;
const FormItemWrapper = (props) => {
    const [showMsg, setShowMsg] = useState(false);
    const show = useCallback(
        () => {
            if (props.validateStatus === "error")
                setShowMsg(true);
        },
        [props.validateStatus]
    );
    const hide = useCallback(
        () => {
            setShowMsg(false);
        });
    let content = null;
    let titleAndDes = null;
    switch (props.renderStyle) {
        case RENDERSTYLE.Design:
        case RENDERSTYLE.PC:
            content = <FormItem style={{ marginBottom: "0px" }} validateStatus={props.validateStatus}>
                <div onMouseEnter={show} onMouseLeave={hide}>
                    <Tooltip overlayClassName={styles.tip} placement='bottom'
                             visible={showMsg && props.validateStatus === "error"}
                             title={<div onMouseEnter={hide}>{props.help}</div>}>
                        {props.children}
                    </Tooltip>
                </div>
            </FormItem>;
            break;
        case RENDERSTYLE.Mobile:
            break;
    }
    const {
        renderStyle, hidden, name, externalName, formControlStyleModel, textAlign
    } = props;
    let className = `${styles.Component} ${textAlign === "right" ? styles.right : ""}`;
    let displayName = name;
    if ((externalName || "") !== "") {
        if (renderStyle === RENDERSTYLE.Design)
            displayName = `${externalName} (${name})`;
        else
            displayName = externalName;
    }
    //console.log(parseInt(formControlStyleModel))
    switch (formControlStyleModel) {
        case 1://水平
            // if () { }
            let dis = displayName.length > 18 ? `${displayName.slice(0, 16)} ...` : displayName;
            let cls = `${styles.name} ${props.itemType === "HrLine" ? styles.HrLine : null}`;
            titleAndDes = (
                <React.Fragment>
                    {
                        (props.children.props.itemType === "HrLine" && props.children.props.AddShowType === "Show") || props.children.props.itemType !== "HrLine" ?
                            <div className={styles.Title}>
                                {props.required ? <span className={styles.Required}>*</span> : null}
                                {
                                    //props.desc.blocks[0].text == '' ?
                                    !props.desc ?
                                        // <div style={{ width: 18, height: 1 }}></div>
                                        null
                                        :
                                        <Popover content={<DescFormatter
                                            descJson={props.children.props.itemType === "HrLine" ? null : props.desc}
                                            horizontal={true}/>} title="描述信息"
                                                 trigger="hover">
                                            {
                                                props.children.props.itemType === "HrLine" ? null :
                                                    <Icon type="info-circle" className={styles.Des}/>
                                                
                                            }
                                        </Popover>
                                }
                                <span className={cls}>{dis}</span>
                                {
                                    dis.length > 0 ?
                                        <span> : </span> : null
                                }
                            </div> : null
                    }
                    <div className={className}>{content}</div>
                </React.Fragment>
            );
            break;
        case 2://垂直
            let titleCss = `${styles.Title} ${styles.vertical}`;
            titleAndDes = (
                <React.Fragment>
                    {
                        (props.children.props.itemType === "HrLine" && props.children.props.AddShowType === "Show") || props.children.props.itemType !== "HrLine" ?
                            <div className={titleCss}>
                                {props.required ? <span className={styles.Required}>*</span> : null}
                                <span className={styles.name}>{displayName}</span>
                                {
                                    displayName.length > 0 ?
                                        <span> : </span> : null
                                }
                            </div> : null
                    }
                    <DescFormatter descJson={props.children.props.itemType === "HrLine" ? null : props.desc}/>
                    <div className={className}>{content}</div>
                </React.Fragment>
            );
            break;
    }
    const css = `ControlWrapper
    ${styles.ControlWrapper}
    ${formControlStyleModel == 1 ? styles.Model : ""}
    ${(renderStyle === RENDERSTYLE.Design && /*hiddenType*/  hidden == 2) ? styles.gray : ""}
    ${(renderStyle === RENDERSTYLE.PC && /*hiddenType*/ hidden == 2) ? styles.hidden : ""}`;
    return (
        <div className={css}>
            {titleAndDes}
            {renderStyle == RENDERSTYLE.Design ? <div className={styles.Mask}></div> : null}
        </div>
    );
};
const FormTableItemWrapper = (props) => {
    let content = null;
    switch (props.renderStyle) {
        case RENDERSTYLE.Design:
            content = props.children;
            break;
        case RENDERSTYLE.PC:
            content = <FormItem style={{ marginBottom: "0px" }} validateStatus={props.validateStatus}>
                {props.children}
            </FormItem>;
        case RENDERSTYLE.Mobile:
            break;
    }
    return content;
};

function getItemDesignValue(item) {
    let dataLinker = item.dataLinker;
    if (dataLinker.toJS)
        dataLinker = dataLinker.toJS();
    if (dataLinker.length > 0) {
        //如果类型为默认值，显示默认的值
        let exist = dataLinker.find(a => a.linkType < 7);
        if (exist === undefined)
            return "";
        switch (exist.linkType) {
            case LINKTYPE.DefaultValue:
                return exist.linkValue;
            case LINKTYPE.Linker:
                return "数据联动";
            case LINKTYPE.Formula:
                return "公式计算";
            case LINKTYPE.Request:
                return "第三方数据源";
            case LINKTYPE.Resource:
                return "资源取数";
            case LINKTYPE.External:
                return "外部引用";
            case LINKTYPE.Environment:
                return "环境变量";
        }
    }
    return "";
}

//表单普通控件基类
function FormItemBase(Wrapper, designMode = false, options = {}) {
    class Item extends React.Component {
        constructor(props) {
            super(props);
            //console.log('itemBase constructor');
        }
        
        shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.mode !== this.props.mode) return true;
            switch (nextProps.mode) {
                case "tableHeader":
                case "table":
                case "form":
                case "cell":
                    return (
                        (this.props.itemBase !== nextProps.itemBase) ||
                        (this.props.dataLinker !== nextProps.dataLinker) ||
                        (this.props.FormId !== nextProps.FormId) ||
                        (this.props.FormName !== nextProps.FormName) ||
                        (this.props.border !== nextProps.border) ||
                        (this.props.formControlStyleModel !== nextProps.formControlStyleModel) ||
                        (this.props.formLayout !== nextProps.formLayout) ||
                        (this.props.invisibleTxtInit !== nextProps.invisibleTxtInit) ||
                        (this.props.renderStyle !== nextProps.renderStyle) ||
                        (this.props.hidden !== nextProps.hidden) ||
                        (this.props.disabled !== nextProps.disabled) ||
                        (this.props.mode !== nextProps.mode)
                    
                    );
                case "option":
                    return (
                        (this.props.itemBase !== nextProps.itemBase) ||
                        (this.props.dataLinker !== nextProps.dataLinker) ||
                        (this.props.currentFormData !== nextProps.currentFormData) ||
                        (this.props.foreignFormData !== nextProps.foreignFormData) ||
                        (this.props.linkFormList !== nextProps.linkFormList) ||
                        (this.props.linkFormDetail !== nextProps.linkFormDetail) ||
                        (this.props.FormId !== nextProps.FormId) ||
                        (this.props.FormName !== nextProps.FormName) ||
                        (this.props.hidden !== nextProps.hidden) ||
                        (this.props.disabled !== nextProps.disabled) ||
                        (this.props.mode !== nextProps.mode)
                    );
            }
        }
        
        render() {
            // console.log('itemBase render', this.props, this.props.itemBase);
            const { itemBase, delegateAttr, dataLinker, id, mode, onChange, renderStyle, containerMode, ...other } = this.props;
            let dataLinkerJs = dataLinker.toJS();
            let common = {
                mode,
                id,
                onChange, ...(delegateAttr ? delegateAttr.toJS() : {}),
                dataLinker: dataLinkerJs, ...other
            };
            let itemBaseJs = itemBase.toJS();
            const { help, validateStatus, externalName, name, desc, required } = itemBaseJs;
            //是否自定义赋值
            if (this.props.customVal === true) {
                itemBaseJs.initDialog = () => {
                    let options = itemBaseJs.dialogOptions || {};
                    this.props.initDialog.call(null,
                        {
                            caller: id,
                            title: options.title || itemBaseJs.name,
                            showCancel: options.showCancel,
                            cancelText: options.cancelText,
                            showOk: options.showOk,
                            okText: options.okText
                        });
                };//初始化容器
                itemBaseJs.setDialogContent = this.props.setDialogContent;//设置容器内渲染的控件
                itemBaseJs.loadDialogData = () => {
                    this.props.loadDialogData.call(null, id);
                };//加载容器请求
                itemBaseJs.setDialogRequestParams = this.props.setDialogRequestParams;//设置容器请求参数
            }
            else {
                itemBaseJs.onChange = this.props.onChange;
            }
            if (renderStyle === RENDERSTYLE.Design) {
                itemBaseJs.value = getItemDesignValue(this.props, "value");
            }
            let { textAlign, headerAlign } = itemBaseJs;
            switch (mode) {
                case "tableHeader":
                    return <div style={{ textAlign: headerAlign || "center" }}>
                        {
                            desc ? <Icon type="info-circle" style={{
                                padding: "0px 6px",
                                color: "rgb(16, 142, 233)"
                            }}/> : null
                        }
                        {(itemBaseJs.externalName || "") !== "" ? itemBaseJs.externalName : itemBaseJs.name}
                    </div>;
                case "form":
                    return containerMode == true ? <Wrapper {...itemBaseJs} {...common} renderStyle={renderStyle}/> :
                        <FormItemWrapper help={help} validateStatus={validateStatus}
                                         getFieldDecorator={this.props.getFieldDecorator} name={name}
                                         externalName={externalName}
                                         id={id} showName={this.props.showName} required={required}
                                         desc={desc} renderStyle={this.props.renderStyle}
                                         formControlStyleModel={this.props.formControlStyleModel}
                                         itemType={this.props.itemType}
                                         textAlign={textAlign}
                        >
                            <Wrapper {...itemBaseJs} {...common} renderStyle={renderStyle}/>
                        </FormItemWrapper>;
                case "table":
                    return <FormTableItemWrapper getFieldDecorator={this.props.getFieldDecorator}
                                                 validateStatus={validateStatus} renderStyle={renderStyle}>
                        <Wrapper {...itemBaseJs} {...common} renderStyle={renderStyle}/>
                    </FormTableItemWrapper>;
                case "cell":
                    switch (this.props.valueType) {
                        case "string":
                            return <div style={{ textAlign: textAlign || "left" }}>
                                {
                                    this.props.itemType !== "TableLinkerName" && this.props.itemType !== "ImageView" ? itemBaseJs.value || "" :
                                        <Wrapper {...itemBaseJs} {...common} renderStyle={renderStyle}/>
                                }
                            </div>;
                        default:
                        case "number":
                        case "datetime":
                            return <div style={{ textAlign: textAlign || "left" }}>
                                <Wrapper {...itemBaseJs} {...common} renderStyle={renderStyle}/>
                            </div>;
                    }
                case "option":
                    let p = {
                        ...itemBaseJs, ...common,
                        setDisabled: this.props.setDisabled, setHidden: this.props.setHidden,
                        getDisabled: this.props.getDisabled, getHidden: this.props.getHidden
                    };
                    if (this.props.isExternal) {
                        return <React.Fragment>
                            <Title.Component {...Title.getProps(p)} />
                            {
                                this.props.extraExternalOption ?
                                    <Wrapper {...p}
                                             mode='exOption'
                                             getLinkFormLDetail={this.props.getLinkFormLDetail}
                                             linkFormDetail={this.props.linkFormDetail}
                                             buildFormDataFilter={this.props.buildFormDataFilter}
                                             dataLinker={dataLinkerJs}
                                             setDataLinker={this.props.setDataLinker}
                                             removeDataLinker={this.props.removeDataLinker}
                                             currentFormData={this.props.currentFormData}
                                             foreignFormData={this.props.foreignFormData}/> : null
                            }
                            {
                                containerMode == true ? null :
                                    <Position.Component {...Position.getProps(p)} />
                            }
                            <OperationPower showEdiable={false} {...this.props} />
                            <Desc.Component {...Desc.getProps(p)} />
                        </React.Fragment>;
                    }
                    else
                        return <Wrapper {...p}
                                        getLinkFormLDetail={this.props.getLinkFormLDetail}
                                        linkFormDetail={this.props.linkFormDetail}
                                        buildFormDataFilter={this.props.buildFormDataFilter}
                                        dataLinker={dataLinkerJs}
                                        setDataLinker={this.props.setDataLinker}
                                        removeDataLinker={this.props.removeDataLinker}
                                        currentFormData={this.props.currentFormData}
                                        foreignFormData={this.props.foreignFormData}/>;
                default:
                    return <div>控件加载失败itemBase</div>;
            }
        }
    }
    
    return designMode ? FormBase(FormSortDrop(FormDragSource()(Item), options)) : FormBase(Item);
}

export default FormItemBase;
export const formItemBaseInitialEvent = {
    buildSubTableHeaderBase: (props) => {
        let { id, container, name, cusWidValue, cusFixedValue, externalName, valueType } = props;
        let column = {
            title: (externalName || "") !== "" ? externalName : name,
            key: id,
            dataIndex: id,
            width: cusWidValue,
            fixed: cusFixedValue,
            container,
            isGroup: false,
            valueType
        };
        return column;
    }
};
