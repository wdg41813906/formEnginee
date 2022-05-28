import React, { useState, useCallback } from 'react';
import FormBase from './FormBase';
import styles from './FormGroupBase.less';
import RENDERSTYLE from '../../enums/FormRenderStyle';
import { Form, Icon, Popover, Tooltip } from 'antd';
import DescFormatter from './common/DescFormatter'
import FormSortDrop from '../HOC/FormSortDrop';
import FormDragSource from '../HOC/FormDragSource';
import { FormContext } from 'commonForm';
import { LINKTYPE } from './DataLinker/DataLinker';

const FormItem = Form.Item;
const formItemStyle = { marginBottom: 0 };
const FormItemWrapper = (props) => {
    const [showMsg, setShowMsg] = useState(false)
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
            content = <FormItem style={formItemStyle} validateStatus={props.validateStatus}>
                <div onMouseEnter={show} onMouseLeave={hide}>
                    <Tooltip overlayClassName={styles.tip} placement='bottom' visible={showMsg && props.validateStatus === "error"} title={<div onMouseEnter={hide}>{props.help}</div>}>
                        {props.children}
                    </Tooltip>
                </div>
            </FormItem>;
            break;
        case RENDERSTYLE.Mobile:
            break;
    }
    const { renderStyle, hidden, name, externalName, formControlStyleModel, required, desc, textAlign } = props;
    let className = `${styles.Component} ${textAlign === 'right' ? styles.right : ''}`
    let displayName = name;
    if ((externalName || '') !== '') {
        if (renderStyle === RENDERSTYLE.Design)
            displayName = `${externalName} (${name})`;
        else
            displayName = externalName;
    }

    switch (formControlStyleModel) {
        case 1://水平
            // if () { }
            let dis = displayName.length > 18 ? `${displayName.slice(0, 16)} ...` : displayName;
            titleAndDes = (
                <React.Fragment>
                    <div className={styles.Title}>
                        {required ? <span className={styles.Required}>*</span> : null}
                        {
                            !desc ?
                                null
                                :
                                <Popover content={<DescFormatter descJson={desc} horizontal={true} />} title="描述信息" trigger="hover">
                                    <Icon type="info-circle" className={styles.Des} />
                                </Popover>
                        }
                        <span className={styles.name}>{dis}</span>
                        <span> : </span>
                    </div>
                    <div className={className}>{content}</div>
                </React.Fragment>
            );
            break;
        case 2://垂直
            let titleCss = `${styles.Title} ${styles.vertical}`
            titleAndDes = (
                <React.Fragment>
                    <div className={titleCss}>
                        {required ? <span className={styles.Required}>*</span> : null}
                        <span className={styles.name}>{displayName}</span>
                        <span> : </span>
                    </div>
                    <DescFormatter descJson={desc} />
                    <div className={className}>{content}</div>
                </React.Fragment>
            )
            break;
    }
    const css = `ControlWrapper
    ${styles.ControlWrapper}
    ${formControlStyleModel == 1 ? styles.Model : ''}
    ${(renderStyle === RENDERSTYLE.Design && hidden == 2) ? styles.gray : ''}
    ${(renderStyle === RENDERSTYLE.PC && hidden == 2) ? styles.hidden : ''}`;
    return <div className={css}>
        {titleAndDes}
        {renderStyle == RENDERSTYLE.Design ? <div className={styles.Mask}></div> : null}
    </div>;
}
const FormTableItemWrapper = (props) => {
    let content = null;
    switch (props.renderStyle) {
        case RENDERSTYLE.Design:
            content = props.children;
            break;
        case RENDERSTYLE.PC:
            content = <FormItem style={{ marginBottom: "0px", }} validateStatus={props.validateStatus}>
                {props.children}
            </FormItem>;
        case RENDERSTYLE.Mobile:
            break;
    }
    return content;
}
//表单控件组基类
function FormGroupBase(Wrapper, designMode = false, options = {}) {
    class Group extends React.Component {
        constructor(props) {
            super(props);
            this.setGroupItemValue = this.setGroupItemValue.bind(this);
            this.setGroupItemDataLinker = this.setGroupItemDataLinker.bind(this);
            this.removeGroupItemDataLinker = this.removeGroupItemDataLinker.bind(this);
            this.loadData = this.loadData.bind(this);
            this.loadRequestData = this.loadRequestData.bind(this);
            this.state = { itemBase: this.props.itemBase, loaded: false };
            if (props.renderStyle !== RENDERSTYLE.Design && props.mode !== 'groupCell') {
                let linker = props.dataLinker.toJS().find(a => a.linkType < 7 && a.autoFill === true && !(props.itemBase.has('optionalValues') && props.itemBase.get('optionalValues').size>0));
                if (linker) {
                    let { id } = props;
                    switch (linker.linkType) {
                        case LINKTYPE.External:
                        case LINKTYPE.Linker:
                            let postData = {
                                expression: linker.expression,
                                id
                            }
                            props.loadExternalData(postData, true);
                            break;
                        case LINKTYPE.Resource:
                        case LINKTYPE.Request:
                            let postDataR = {
                                linker,
                                id
                            }
                            props.loadResourceData(postDataR, true);
                            break;
                    }
                }
            }
        }
        loadData(extraParams = {}) {
            let linker = this.props.dataLinker.toJS().find(a => a.linkType < 6 && a.autoFill !== true);
            if (linker) {
                let { id } = this.props;
                switch (linker.linkType) {
                    case LINKTYPE.External:
                    case LINKTYPE.Linker:
                        let postData = {
                            expression: linker.expression,
                            extraParams,
                            proxyIndex: this.props.proxyIndex,
                            id
                        }
                        this.props.loadExternalData(postData, true);
                        break;
                    case LINKTYPE.Resource:
                    case LINKTYPE.Request:
                        let postDataR = {
                            linker,
                            extraParams,
                            proxyIndex: this.props.proxyIndex,
                            id
                        }
                        this.props.loadResourceData(postDataR, true);
                        break;
                }
            }
        }
        loadRequestData(extraParams = {}) {
            let linker = this.props.dataLinker.toJS().find((a) => a.linkType === LINKTYPE.Request);
            if (linker) {
              let { id } = this.props;
              let postDataR = {
                linker,
                extraParams,
                proxyIndex: this.props.proxyIndex,
                id,
              };
              this.props.loadResourceData(postDataR, true);
            }
          }
        static getDerivedStateFromProps(nextProps) {
            if (nextProps.mode !== 'cell' && nextProps.mode !== 'groupCell'
                && nextProps.renderCheck(nextProps.id))
                return { itemBase: nextProps.itemBase }; //nextProps.getItemBase(nextProps.id) }
            return null;
        }
        shouldComponentUpdate(nextProps, nextState) {
            if (nextProps.mode === 'cell' || nextProps.mode === 'groupCell' || nextProps.mode === 'table')
                return true;
            return (this.state.itemBase !== nextState.itemBase) ||
                (this.props.dataLinker !== nextProps.dataLinker) ||
                (this.props.renderCheck(this.props.id) || this.props.mode !== nextProps.mode) ||
                this.props.itemBase !== nextProps.itemBase;
        }
        setGroupItemValue(key, value) {
            this.props.setValueSingle(this.props.itemBase.getIn(['groupItems', key, 'id']), { value }, this.props.proxyIndex);// || -1)
        }
        setGroupItemDataLinker(key, dataLinker) {
            this.props.setItemDataLinker(this.props.itemBase.getIn(['groupItems', key, 'id']), dataLinker);
        }
        removeGroupItemDataLinker(key, filter = a => true) {
            this.props.removeItemDataLinker(this.props.itemBase.getIn(['groupItems', key, 'id']), filter);
        }
        setGroupName = (name) => {
            return this.props.setGroupName(this.props.id, name);
        }
        onFocus = () => {
            if (!this.props.design && ((!this.state.loaded || this.props.itemBase.get('currentIndex') !== this.props.proxyIndex) && this.props.autoFill !== true)) {
                this.setState({ loaded: true })
                //if (this.props.itemBase.get('currentIndex') !== this.props.proxyIndex) {
                this.props.onChange({ currentExpand: '' });
                //}
                this.loadData();
            }
        }
        render() {
            const { itemBase, delegateAttr, dataLinker, id, mode, onChange, renderStyle, getGroupItemsValue,
                setValueSingle, loadResourceData, loadExternalData, setGroupName, ...other } = this.props;
            let dataLinkerJs = dataLinker.toJS();
            let common = {
                mode, id, onChange, ...(delegateAttr ? delegateAttr.toJS() : {}), dataLinker: dataLinkerJs,
                ...other, onFocus: this.onFocus,
                setGroupItemValue: this.setGroupItemValue, setGroupItemDataLinker: this.setGroupItemDataLinker,
                removeGroupItemDataLinker: this.removeGroupItemDataLinker, loadData: this.loadData, loadRequestData: this.loadRequestData
            };
            let itemBaseJs = itemBase.toJS();
            let { textAlign, headerAlign } = itemBaseJs;
            common.groupValues = getGroupItemsValue(this.props.id, this.props.proxyIndex);
            const { help, validateStatus, externalName, name, desc, groupItems } = itemBaseJs;
            let required = false;
            for (let key in groupItems) {
                if (groupItems[key].required === true) {
                    required = true;
                    break;
                }
            }
            switch (mode) {
                case 'tableHeader':
                    return <div style={{ textAlign: headerAlign || 'center' }}>
                        {
                            desc ? <Icon type="info-circle" style={{
                                padding: "0px 6px",
                                color: "rgb(16, 142, 233)"
                            }}/> : null
                        }
                        {(itemBaseJs.externalName || '') !== '' ? itemBaseJs.externalName : itemBaseJs.name}
                    </div>;
                case 'form':
                    return <FormItemWrapper help={help} validateStatus={validateStatus}
                        getFieldDecorator={this.props.getFieldDecorator} name={name}
                        externalName={externalName} textAlign={textAlign}
                        id={id} showName={this.props.showName} required={required}
                        desc={desc} renderStyle={this.props.renderStyle}
                        formControlStyleModel={this.props.formControlStyleModel}>
                        <Wrapper {...itemBaseJs} {...common} renderStyle={renderStyle} />
                    </FormItemWrapper>;
                case 'cell':
                case 'groupCell':
                    return <div style={{ textAlign: textAlign || 'left' }}>
                        <Wrapper {...itemBaseJs} {...common} renderStyle={renderStyle} />
                    </div>;
                case 'table':
                    return <FormTableItemWrapper getFieldDecorator={this.props.getFieldDecorator}
                        validateStatus={validateStatus} renderStyle={renderStyle}>
                        <Wrapper {...itemBaseJs} {...common} renderStyle={renderStyle} />
                    </FormTableItemWrapper>;
                case 'option':
                    return <Wrapper {...itemBaseJs}
                        getLinkFormLDetail={this.props.getLinkFormLDetail}
                        linkFormDetail={this.props.linkFormDetail}
                        buildFormDataFilter={this.props.buildFormDataFilter}
                        dataLinker={dataLinkerJs}
                        setDataLinker={this.props.setDataLinker}
                        currentFormData={this.props.currentFormData}
                        foreignFormData={this.props.foreignFormData}
                        setGroupName={this.setGroupName}
                        {...common} />;
                default:
                    return <div>控件加载失败groupBase</div>;
            }
        }
    }
    class GroupWrapper extends React.PureComponent {
        render() {
            return <Group {...this.props} {...this.context} />
        }
    }
    GroupWrapper.contextType = FormContext;
    return designMode ? FormBase(FormSortDrop(FormDragSource()(GroupWrapper), options)) : FormBase(GroupWrapper);
}
export default FormGroupBase;
export const formGroupBaseInitialEvent = {
    buildSubTableHeaderBase: (props) => {
        let { id, container, name, externalName, cusWidValue } = props;
        let column = {
            title: (externalName || '') !== '' ? externalName : name,
            key: id,
            //dataIndex: id,
            width: cusWidValue,
            container,
            isGroup: true,
            //children: []
        };
        return column;
    }
}
