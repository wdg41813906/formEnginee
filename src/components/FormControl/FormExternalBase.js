import React from 'react';
import FormBase from './FormBase';
import RENDERSTYLE from '../../enums/FormRenderStyle';
import FormControlType from '../../enums/FormControlType';
import { FormContext } from 'commonForm';
import FORM_STATUS from '../../enums/FormStatus';
import { LINKTYPE } from './DataLinker/DataLinker';

//表单外联控件基类
function FormExternalBase(Wrapper) {
    class External extends React.Component {
        constructor(props) {
            super(props);
            this.renderItems = this.renderItems.bind(this);
            this.loadData = this.loadData.bind(this);
            this.delExFormItemBatch = this.delExFormItemBatch.bind(this);
            this.setProxy = this.setProxy.bind(this);
            this.state = { itemBase: props.itemBase };
        }
        static getDerivedStateFromProps(nextProps) {
            if (nextProps.renderCheck(nextProps.id))
                return { itemBase: nextProps.getItemBase(nextProps.id) }
            return null;
        }
        shouldComponentUpdate(nextProps, nextState) {
            switch (nextProps.mode) {
                case 'cell':
                case 'tableHeader':
                case 'table':
                case 'form':
                    return (this.state.itemBase !== nextState.itemBase) || this.props.mode !== nextProps.mode || (this.props.renderCheck(this.props.id));
                default:
                case 'option':
                    return this.props !== nextProps;
            }

        }
        renderItems(panelBody) {
            const { setValue, setValueSingle, mode, renderStyle, getFieldDecorator, reset,
                beginDrag, cancelMove, remove, copy, setCurrent, move, endDrag }
                = this.props;
            if ((panelBody || '') === '')
                panelBody = this.props.panelBody;
            return panelBody.filter(a => !a.isHide && a.status !== FORM_STATUS.Delete).map((C) => {
                const { Component, WrappedComponent, ...other } = C;
                let pj = {
                    mode,
                    key: C.id,
                    setValue,
                    setValueSingle,
                    reset,
                    ...other
                };
                if (renderStyle !== RENDERSTYLE.Design) {
                    pj = {
                        ...pj,
                        renderStyle,
                        getFieldDecorator: getFieldDecorator
                    }
                }
                else {
                    pj = {
                        ...pj,
                        beginDrag,
                        setCurrent,
                        cancelMove,
                        remove,
                        endDrag,
                        copy,
                        move
                    }
                }
                switch (C.formControlType) {
                    case FormControlType.Container:
                        break;
                    case FormControlType.External:
                        pj = {
                            ...pj,
                            delFormItemBatch: this.delFormItemBatch
                        };
                        break;
                }
                return <Component {...pj} />
            });
        }
        loadData(ignoreConditions = false, extraConditions = []) {
            let { id, dataLinker, proxyIndex } = this.props;
            let linker = dataLinker.toJS().find(a => a.linkType < 6);
            switch (linker.linkType) {
                case LINKTYPE.External:
                case LINKTYPE.Linker:
                    let postData = {
                        expression: linker.expression,
                        proxyIndex,
                        id
                    }
                    
                    this.props.loadExternalData(postData, ignoreConditions, extraConditions);
                    break;
                case LINKTYPE.Resource:
                case LINKTYPE.Request:
                    let postDataR = {
                        linker,
                        proxyIndex,
                        id
                    }
                    this.props.loadResourceData(postDataR, ignoreConditions);
                    break;
            }
        }
        loadThirdResourceData(ignoreConditions = false) {
            let { id, dataLinker } = this.props;
            let postData = {
                expression: dataLinker.toJS()[0]["expression"],
                id
            }
            this.props.loadThirdResourceData(postData, ignoreConditions);
        }
        delExFormItemBatch(list) {
            this.props.delExFormItemBatch(list, this.props.id)
        }
        setProxy(data) {
            this.props.setProxyCall(this.props.id, data)
        }
        render() {
            const { itemBase, id, mode, dataLinker, proxyAttr, delExFormItemBatch, ...other } = this.props;
            let common = {
                mode,
                id,
                dataLinker: dataLinker.toJS(),
                panelBody: this.props.getPanelBody(id),
                getPanelChild: this.props.getPanelChild,
                getPanelBody: this.props.getPanelBody,
                delExFormItemBatch: this.delExFormItemBatch,
            };
            let externalBaseJs = itemBase.toJS();
            let { headerAlign } = externalBaseJs
            let C = null;
            switch (mode) {
                case 'tableHeader':
                    C = <div style={{ textAlign: headerAlign || 'center' }}>
                        <Wrapper {...externalBaseJs} {...common} {...other} renderItems={this.renderItems} />
                    </div>;
                    break;
                case 'form':
                    C = <div style={{ width: '100%', margin: this.props.renderStyle === RENDERSTYLE.Design ? '' : '0 0' }}>
                        <Wrapper {...externalBaseJs} {...common} {...other} renderItems={this.renderItems}
                            loadData={this.loadData} />
                    </div>;
                    break;
                case 'cell':
                case 'table':
                    //全新的渲染方式
                    C = <div style={{ width: '100%' }}>
                        <Wrapper {...externalBaseJs} {...common} {...other} renderItems={this.renderItems}
                            loadData={this.loadData} />
                    </div>;
                    break;
                case 'option':
                    C = <Wrapper {...externalBaseJs} {...common} {...other} />;
                    break;
                default:
                    return <div>控件加载失败externalBase</div>;
            }
            return C;
        }
    }
    class ExternalWrapper extends React.PureComponent {
        render() {
            return <External {...this.props} {...this.context} />
        }
    }
    ExternalWrapper.contextType = FormContext;
    return FormBase(ExternalWrapper);
}
export default FormExternalBase;
export const formExternalBaseInitialEvent = {
    buildSubTableHeaderBase: (props) => {
        let { id, container, name, externalName, cusWidValue } = props;
        let column = {
            title: (externalName || '') !== '' ? externalName : name,
            key: id,
            //dataIndex: id,
            width: cusWidValue,
            container,
            isGroup: false,
            children: []
        };
        return column;
    }
}
