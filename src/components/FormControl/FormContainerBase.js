import React from 'react';
import FormBase from './FormBase';
import RENDERSTYLE from '../../enums/FormRenderStyle';
import FormControlType from '../../enums/FormControlType';
import { FormContext } from 'commonForm';
import FORM_STATUS from '../../enums/FormStatus';
import { LINKTYPE } from './DataLinker/DataLinker';

//表单容器控件基类
function FormContainerBase(Wrapper) {
  class Container extends React.Component {
    constructor(props) {
      super(props);
      this.renderChildren = this.renderChildren.bind(this);
      // if (this.props.proxy)
      //     this.validate = this.validate.bind(this);
      this.getParentRef = this.getParentRef.bind(this);
      this.ref = React.createRef();
      this.state = { itemBase: props.itemBase };
    }
    getParentRef() {
      return this.ref;
    }
    static getDerivedStateFromProps(nextProps) {
      if (nextProps.renderCheck(nextProps.id))
        return { itemBase: nextProps.getItemBase(nextProps.id) }
      return null;
    }
    shouldComponentUpdate(nextProps, nextState) {
      return (this.state.itemBase !== nextState.itemBase) ||
        (this.props.dataLinker !== nextProps.dataLinker) ||
        (this.props.collapse !== nextProps.collapse) ||
        (this.props.mode !== nextProps.mode) ||
        (this.props.currentFormData !== nextProps.currentFormData) ||
        (this.props.renderCheck(this.props.id));
    }
    // validate({ id, value, success, error }) {
    //     let item = this.props.panelBody.find(a => a.id == id);
    //     this.props.validateFormItem(item, { id, data: { value } }).then(error).catch(success);
    // }
    renderChildren(panelBody) {
      const { setValue, setValueSingle, mode,/*parents,*/ renderStyle, getFieldDecorator, reset,
        beginDrag, cancelMove, remove, copy, changeContainer, setCurrent
        , move, endDrag/*, currentIndex*/ } = this.props;
      //const dragIndex = this.context.dragIndex;
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
            changeContainer,
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
    buildSubFormRowData = () => {
      return this.props.buildSubFormRowData(this.props.id);
    }
    loadData = (ignoreConditions = true) => {
      let { id, dataLinker } = this.props;
      let linker = dataLinker.toJS().find(a => a.linkType < 6);
      switch (linker.linkType) {
        case LINKTYPE.External:
        case LINKTYPE.Linker:
          let postData = {
            expression: linker.expression,
            id
          }
          this.props.loadExternalData(postData, ignoreConditions);
          break;
        case LINKTYPE.Resource:
        case LINKTYPE.Request:
          let postDataR = {
            linker,
            id
          }
          this.props.loadResourceData(postDataR, ignoreConditions);
          break;
      }
    }
    initSubFormColumn = () => {
      let panelBody = this.props.getPanelChild(this.props.id);
      const rootFormId = this.props.getRootFormId();
      let columns = [];
      panelBody.filter(a => a.formControlType >= FormControlType.Item && a.status !== FORM_STATUS.Delete && a.isHide !== true).forEach(item => {
        if ((this.props.buildControlAuthority(item.authority.toJS()).hidden === false || item.authority.getIn(['hidden', 'itemBase']) !== true)
          || this.props.renderStyle === RENDERSTYLE.Design) {
          const dataLinker = item.dataLinker.toJS();
          const canEdit = dataLinker.some(e => {
            if (e.linkType === 4 && e.request.params) {
              const result = e.request.params.some(r => {
                const target = panelBody.find(e => e.id === r.targetId)
                return r.type === 0 && target && target.formId !== rootFormId
              });
              return !result
            }
            return true
          })
          let colsBase = item.event.get('buildSubTableHeaderBase')({ id: item.id, container: item.itemBase.get('groupId') || item.container, ...item.itemBase.toJS() });
          colsBase.textAlign = item.itemBase.get('textAlign') || 'center';
          colsBase.headerAlign = item.itemBase.get('headerAlign') || 'center';
          colsBase.canEdit = true;
          let cols = {};
          let displayCheck = item.dataLinker.some(a => a.get('linkType') === 8)
          if (item.event.has('buildSubTableHeader')) {
            cols = item.event.get('buildSubTableHeader')({
              id: item.id,
              container: item.itemBase.get('groupId') || item.container,
              ...item.itemBase.toJS(),
              name: (item.itemBase.get('externalName') || '') !== '' ? item.itemBase.get('externalName') : item.itemBase.get('name'),
            });
          }
          if (Array.isArray(cols))
            columns = columns.concat(cols.map(a => ({ ...colsBase, ...a, displayCheck })));
          else
            columns.push({ ...colsBase, ...cols, displayCheck });
        }
      });
      return columns;
    }
    delExFormItemBatch = (list) => {
      this.props.delExFormItemBatch(list, this.props.id)
    }
    setTableLinker = (list) => {
      this.props.setTableLinker(this.props.id, list);
    }
    getSubTableList = () => {
      this.props.getSubTableList(this.props.id);
    }
    setTableLinkerFilterValue = (value) => {
      this.props.setTableLinkerFilterValue(this.props.id, value);
    }
    render() {
      //console.log("subform在这哦", this.props);
      //console.log("tab containerBase render", this.props.itemBase.toJS());
      const { id, mode, onChange, proxy, delegateAttr, setTableLinker, getSubTableList, setTableLinkerFilterValue,
        tableLinker, proxyAttr, dataLinker, renderSubItemHeader, renderSubItemCell, itemBase: pItemBase,
        buildSubFormRowData, setGroupName, delExFormItemBatch, formProperties, ...other } = this.props;
      const { itemBase } = this.state;
      const { renderStyle } = this.props;
      let common = {
        ...(delegateAttr ? delegateAttr.toJS() : {}),
        mode, id, onChange, getParentRef: this.getParentRef,
        proxy, getPanelBody: this.props.getPanelBody,
        getPanelChild: this.props.getPanelChild,
        dataLinker: dataLinker.toJS(),
        delExFormItemBatch: this.delExFormItemBatch
      };
      if (proxy) {
        common.validate = this.validate;
        common.proxyAttr = proxyAttr.toJS();
        common.proxyStorage = this.props.getProxyStorage(id).toJS();
        common.setProxy = (data) => { this.props.setProxyCall(id, data) };
      }
      let containerBaseJs = itemBase.toJS();//, newParents = null;
      let C = null;
      switch (mode) {
        case 'tableHeader':
          if (this.props.renderStyle === RENDERSTYLE.Design) {
            let headerCheck = { rightCheck: true, leftCheck: true };
            if (this.props.groupId) {
              headerCheck = { rightCheck: false, leftCheck: false };
              let groupIds = this.props.event.get('getGoupIds')({ ...this.props.itemBase.toJS(), id });
              let index = groupIds.indexOf(this.props.groupId);
              if (index === 0)
                headerCheck.leftCheck = true;
              if (index === groupIds.length - 1)
                headerCheck.rightCheck = true;
            }
            common = { ...common, ...headerCheck };
          }
          C = <Wrapper {...containerBaseJs}  {...common} {...other}
                       renderChildren={this.renderChildren}
                       panelBody={this.props.getPanelBody(id)} />;
          break;
        case 'form':
          if (this.props.isSubTable === true) {
            common.renderSubItemHeader = renderSubItemHeader;
            common.renderSubItemCell = renderSubItemCell;
            common.initSubFormColumn = this.initSubFormColumn;
            common.setTableLinkerFilterValue = this.setTableLinkerFilterValue;
            common.loadData = this.loadData;
            if (tableLinker)
              common.tableLinker = tableLinker.toJS();
            //兼容老版本
            if (containerBaseJs.primaryKeyId === undefined) {
              containerBaseJs.primaryKeyId = this.props.getPanelBody(this.props.id).find(a => a.itemType === 'PrimaryKey' && a.formControlType === FormControlType.System).id;
            }
          }
          C = <div id={id + renderStyle} ref={this.ref} style={{ width: '100%', margin: this.props.renderStyle === RENDERSTYLE.Design ? '' : '0px 0' }}>
            <Wrapper {...containerBaseJs}  {...common} {...other} buildSubFormRowData={this.buildSubFormRowData} renderChildren={this.renderChildren} panelBody={this.props.getPanelBody(id)} />
          </div>;
          break;
        case 'option':
          if (this.props.isSubTable === true) {
            common.setTableLinker = this.setTableLinker;
            common.getSubTableList = this.getSubTableList;
            common.tableLinker = [];
            if (formProperties.getIn(['tableLinker', id]))
              common.tableLinker = formProperties.getIn(['tableLinker', id]).toJS();
          }
          C = <Wrapper {...containerBaseJs} {...common} {...other} ste />;
          break;
        default:
          return <div>控件加载失败container</div>;
      }
      return C;
    }
  }
  class ContainerWrapper extends React.PureComponent {
    render() {
      return <Container {...this.props} {...this.context} />
    }
  }
  ContainerWrapper.contextType = FormContext;
  return FormBase(ContainerWrapper);
}
export default FormContainerBase;
export const formContainerBaseInitialEvent = {
  buildSubTableHeaderBase: (props) => {
    let { id, container, name, externalName, cusWidValue, cusFixedValue } = props;
    let column = {
      title: (externalName || '') !== '' ? externalName : name,
      key: id,
      //dataIndex: id,
      width: cusWidValue,
      fixed: cusFixedValue,
      container,
      isGroup: false,
      children: []
    };
    return column;
  }
}
