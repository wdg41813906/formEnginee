import React from "react";
import styles from "./DataLinkerEditor.less";
import { Select, Radio, Spin, Button, Icon, Tooltip } from "antd";
import { getAllFormLinkData, getAllFormTemplatePaged } from "../../../services/FormBuilder/FormBuilder";
import com from "../../../utils/com";
import { LINKTYPE, getValueLinkMap, getValueConditionMap } from "./DataLinker";
import FORM_CONTROL_TYPE from "../../../enums/FormControlType";
import { initControlExtra, buildLinkFormList } from "commonForm";
//控件扩展属性映射
const controlExtraList = ["valueType", "formControlType", "event"];

const Option = Select.Option;
let timeout;

class DataLinkerEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      FormName: "",
      pageIndex: 1,
      pageSize: 20,
      scrollLoad: true, //防止重复请求
      showLoad: false, //加载中状态
      completed: true,
      formTemplateList: [],
      linkFormDetail: [],
      controlExtra: initControlExtra(controlExtraList)
    };
    this.filterOption = this.filterOption.bind(this);
    this.setForeignForm = this.setForeignForm.bind(this);
    this.setFormCol = this.setFormCol.bind(this);
    this.setForeignCol = this.setForeignCol.bind(this);
    this.setDisplayCol = this.setDisplayCol.bind(this);
  }

  setForeignForm(value, option) {
    //this.props.getLinkFormLDetail(value, this.props.fid);
    let dataLinker = this.props.dataLinker;
    let tableCode = this.state.formTemplateList.find(a => a.id === option.props.value).table;
    dataLinker.foreignKeys[0] = {
      ...dataLinker.foreignKeys[0],
      foreignFormId: value,
      foreignFormName: tableCode, //option.props.children,
      displayFormId: value,
      displayFormName: tableCode, //option.props.children,
      foreignHistoryId: null,
      foreignColumnName: null
    };
    this.setState({
      tableCode,
      formId: value
    });
    if (!dataLinker.foreignKeys[0].id) {
      dataLinker.foreignKeys[0].id = com.Guid();
    }

    if (dataLinker.expression.length === 0) {
      let list = this.props.params.map(() => ({
        field: null,
        id: null
      }));
      dataLinker.expression.push({
        source: null,
        type: "data",
        condition: [{
          formType: null,
          primaryKey: null,
          where: [{
            targetType: 'formItem',
            operationType: '4',
            targetId: null,
            relationId: null,
            field: null
          }]
        }],
        display: [{
          formType: null,
          primaryKey: null,
          list
        }]
      });
      //dataLinker.foreignKeys[0].description = this.props.id
    }
    let item = this.state.formTemplateList.find(e => e.id === value);
    dataLinker.expression[0].source = item.table;
    dataLinker.foreignKeys.forEach(a => {
      a.displayVersionHistoryId = null;
      a.displayName = null;
      a.foreignFormId = value;
      a.foreignFormName = this.state.formTemplateList.find(a => a.id === option.props.value).table; //option.props.children,
      a.displayFormId = value;
      a.displayFormName = this.state.formTemplateList.find(a => a.id === option.props.value).table; //option.props.children,
      a.foreignHistoryId = null;
      a.foreignColumnName = null;
    });
    dataLinker.expression[0].display[0].list.forEach(a => {
      a.field = null;
      a.id = null;
    });
    if (dataLinker.expression[0].condition[0].where) {
      dataLinker.expression[0].condition[0].where.forEach(a => {
        a.targetType = 'formItem';
        a.operationType = '4';
        a.field = null;
        a.relationId = null;
      });
    }
    this.props.setDataLinker({
      ...dataLinker,
      autoFill: this.props.autoFill === true
    });
    if (this.state.formTemplateList.length > 0) {
      let exist = this.state.formTemplateList.find(a => a.id === this.props.dataLinker.foreignKeys[0].foreignFormId);
      if (exist) {
        this.setState({
          linkFormDetail: exist.fields
        });
      }
    }
  }

  setFormCol(index, value, option) {
    let dataLinker = this.props.dataLinker;
    dataLinker.foreignKeys[index] = {
      ...dataLinker.foreignKeys[index],
      formVersionHistoryId: value,
      currentColumnName: option.props.children,
      foreignHistoryId: null,
      foreignColumnName: null
    };
    if (!dataLinker.foreignKeys[index].id) {
      dataLinker.foreignKeys[index].id = com.Guid();
    }
    dataLinker.expression[0].condition[0].where[index].targetId = value;
    dataLinker.relations = Array.from(new Set(dataLinker.foreignKeys.filter(a => a.formVersionHistoryId).map(a => a.formVersionHistoryId)));
    this.props.setDataLinker(dataLinker);
  }

  setForeignCol(index, value, option) {
    let dataLinker = this.props.dataLinker;
    dataLinker.foreignKeys[index] = {
      ...dataLinker.foreignKeys[index],
      foreignHistoryId: value,
      foreignColumnName: this.state.linkFormDetail.find(a => a.id === option.props.value).code
    };
    if (!dataLinker.foreignKeys[index].id) {
      dataLinker.foreignKeys[index].id = com.Guid();
    }
    let item = this.state.linkFormDetail.find(e => e.id === value);
    dataLinker.expression[0].condition[0].where[index] = {
      ...dataLinker.expression[0].condition[0].where[index],
      field: item.code,
      relationId: value
    };
    dataLinker.expression[0].condition[0] = {
      ...dataLinker.expression[0].condition[0],
      formType: item.formType,
      primaryKey: item.primaryKey
    };
    this.props.setDataLinker(dataLinker);
  }

  setDisplayCol(index, value, option, id) {
    let dataLinker = this.props.dataLinker;
    dataLinker.foreignKeys[index] = {
      ...dataLinker.foreignKeys[index],
      displayVersionHistoryId: value,
      displayName: this.state.linkFormDetail.find(a => a.id === option.props.value).code //option.props.children
    };
    if (!dataLinker.foreignKeys[index].id) {
      dataLinker.foreignKeys[index].id = com.Guid();
    }
    let item = this.state.linkFormDetail.find(e => e.id == value);
    dataLinker.expression[0].display[0].list[index] = {
      ...dataLinker.expression[0].display[0].list[index],
      field: item.code,
      id: value
    };
    dataLinker.expression[0].display[0] = {
      ...dataLinker.expression[0].display[0],
      formType: item.formType,
      primaryKey: item.primaryKey
    };
    //普通控件onchange，容器类setExternalId
    if (this.props.setExternalId) {
      this.props.setExternalId(id, value);
    } else {
      this.props.onChange({
        externalId: value
      });
    }
    this.props.setDataLinker(dataLinker);
  }

  filterOption(input, option) {
    if (option.props.children instanceof Array) {
      return option.props.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0;
    } else {
      return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }

  }

  componentDidMount() {
    if (this.props.dataLinker && this.props.dataLinker.foreignKeys.length > 0) {
      this.setState({
        completed: false
      }, () => {
        getAllFormLinkData({
          EntityIdList: [this.props.dataLinker.foreignKeys[0].foreignFormId]
        }).then(res => {
          if (res && res.data.length > 0) {
            let r = buildLinkFormList(res.data, this.state.controlExtra);
            this.setState({
              linkFormDetail: r.linkFormList[0].fields,
              formTemplateList: r.linkFormList,
              completed: true
            });
          } else {
            this.setState({
              completed: true
            });
          }
        });
      });
    }
  }

  InitFormList = () => {
    this.setState({
      showLoad: true
    }, () => {
      getAllFormTemplatePaged({
        FormName: this.state.FormName,
        pageIndex: this.state.pageIndex,
        pageSize: this.state.pageSize
      }).then(res => {
        let r = buildLinkFormList(res.data.formTemplateList, this.state.controlExtra);
        let { formTemplateList } = this.state;
        let { linkFormList } = r;
        let hash = {};
        let filLinkFormList = formTemplateList.concat(linkFormList).reduce((item, next) => {
          hash[next.id] ? "" : hash[next.id] = true && item.push(next);
          return item;
        }, []);
        this.setState({
          formTemplateList: filLinkFormList,
          showLoad: false
        });
      });
    });
  };

  //加载更多
  handleInfiniteOnLoad = (e) => {
    let scrollTop = e.target.scrollTop;
    let selectHeight = e.target.scrollHeight;
    let menuHeight = e.target.clientHeight; //页面可视区域的高度
    let { formTemplateList } = this.state;
    if (scrollTop + menuHeight > selectHeight - 20) {
      if (this.state.scrollLoad) {
        this.setState({
          pageIndex: this.state.pageIndex + 1,
          scrollLoad: false,
          showLoad: true
        }, () => {
          getAllFormTemplatePaged({
            FormName: this.state.FormName,
            pageIndex: this.state.pageIndex,
            pageSize: this.state.pageSize
          }).then(res => {
            if (res.data.formTemplateList.length > this.state.pageSize - 1) {
              let r = buildLinkFormList(res.data.formTemplateList, this.state.controlExtra);
              let { linkFormList } = r;
              let hash = {};
              let filLinkFormList = formTemplateList.concat(linkFormList).reduce((item, next) => {
                hash[next.id] ? "" : hash[next.id] = true && item.push(next);
                return item;
              }, []);
              this.setState({
                formTemplateList: filLinkFormList,
                scrollLoad: true,
                showLoad: false
              });
            } else {
              this.setState({
                scrollLoad: false,
                showLoad: false
              });
            }
          });
        });
      }
    }
  };
  setPageIndex = () => {
    if (this.state.FormName) {
      this.setState({
        pageIndex: 1,
        FormName: ""
      }, () => {
        this.InitFormList();
      });
    }
  };
  addCondition = () => {
    let dataLinker = this.props.dataLinker;
    dataLinker.expression = [...dataLinker.expression];
    dataLinker.expression[0].condition[0].where.push({
      targetType: 'formItem',
      operationType: '4',
      targetId: null,
      relationId: null,
      field: null
    });
    dataLinker.foreignKeys.push({
      ...dataLinker.foreignKeys[0],
      foreignFormId: this.state.formId,
      foreignFormName: this.state.tableCode, //option.props.children,
      displayFormId: this.state.formId,
      displayFormName: this.state.tableCode, //option.props.children,
      foreignHistoryId: null,
      foreignColumnName: null,
      id: com.Guid()
    });
    this.props.setDataLinker(dataLinker);
  };
  removeCondition = (index) => {
    let dataLinker = this.props.dataLinker;
    dataLinker.expression[0].condition[0].where.splice(index, 1);
    dataLinker.foreignKeys.splice(index, 1);
    dataLinker.relations = Array.from(new Set(dataLinker.foreignKeys.filter(a => a.formVersionHistoryId).map(a => a.formVersionHistoryId)));
    this.props.setDataLinker(dataLinker);
  };
  //搜索
  SearchForm = value => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      if (value.replace(/^\s+|\s+$/g, "")) {
        this.setState({
          pageIndex: 1,
          FormName: value
        }, () => {
          this.InitFormList();
        });
      }
    }, 500);
  };

  render() {
    let { formTemplateList, completed } = this.state;
    let formList = formTemplateList.filter(item => item.formTemplateVersionId !== this.props.formTemplateVersionId);
    let { dataLinker, currentFormData, params } = this.props;
    const { foreignFormId, formVersionHistoryId, foreignHistoryId } = dataLinker.foreignKeys && dataLinker.foreignKeys[0] || {};
    const loading = dataLinker.expression[0] && this.state.linkFormDetail.length > 0;
    let valueMap;
    let targetLinkList = this.state.linkFormDetail.filter(a => a.formType !== 1
      && ((a.groupItem === true && a.groupItemPrivate !== true && a.type !== FORM_CONTROL_TYPE.Group)
        || (a.groupItem !== true && a.groupItems === undefined)));
    if (dataLinker.linkType !== LINKTYPE.External) {
      let valueTarget = currentFormData.find(a => a.id === formVersionHistoryId);
      if (valueTarget) {
        valueMap = getValueConditionMap(valueTarget.valueType);
        targetLinkList = targetLinkList.filter(a => valueMap.includes(a.valueType));
      }
    }
    return <React.Fragment>
      {
        completed ? null :
          <div className={styles.ModalTip}>
            <Spin tip="联动表单加载中..." />
          </div>
      }
      <div className={styles.title}>联动表单</div>
      <div className={styles.body} style={{
        paddingRight: "30px"
      }}>
        <Select className={styles.item} showSearch placeholder="请选择" loading={this.state.showLoad}
          optionFilterProp="children"
          maxTagCount={4}
          onChange={this.setForeignForm}
          onSearch={this.SearchForm}
          onFocus={this.state.formTemplateList.length > 1 ? null : () => this.InitFormList()}
          value={this.state.formTemplateList.length > 0 ? foreignFormId : null}
          onPopupScroll={this.handleInfiniteOnLoad}>
          {
            formList.map(a => <Option key={a.id} value={a.id} title={a.name}>{a.name}</Option>)
          }
        </Select>
      </div>
      <div className={styles.title}>联动设置
      {dataLinker.linkType === LINKTYPE.External || !foreignFormId ? null :
          <Button size='small' type='primary' onClick={this.addCondition}
            style={{
              float: "right"
            }}>新增</Button>}
      </div>
      {
        dataLinker.linkType === LINKTYPE.External ? null :
          (dataLinker.expression[0] || {
            condition: [{
              where: []
            }]
          }).condition[0].where.map((c, index) => <div key={index} className={styles.body}>
            <Select className={styles.item} showSearch placeholder="请选择" optionFilterProp="children"
              maxTagCount={4}
              value={currentFormData.length > 0 ? dataLinker.foreignKeys[index].formVersionHistoryId : undefined}
              onChange={this.setFormCol.bind(this, index)} filterOption={this.filterOption}>
              {currentFormData.map(a => <Option key={a.id} value={a.id} title={a.name}>{a.name}</Option>)}
            </Select>
            <span>的值等于</span>
            <Select className={styles.item} showSearch placeholder="请选择" optionFilterProp="children"
              maxTagCount={4}
              value={this.state.formTemplateList.length > 0 ? dataLinker.foreignKeys[index].foreignHistoryId : null}
              onChange={this.setForeignCol.bind(this, index)}
              filterOption={this.filterOption}>
              {targetLinkList.map(a => <Option key={a.id} value={a.id} title={a.name}>{a.name}{Number(a.status) === -1 ?
                <Tooltip placement="top" title='字段已删除'>
                  <Icon style={{
                    color: "#FF122D",
                    paddingLeft: "12px"
                  }} type="exclamation-circle" />
                </Tooltip> : null}</Option>)}
            </Select>
            <span>的值时{index > 0 ?
              <Icon className={styles.removeIco} title='删除' onClick={this.removeCondition.bind(this, index)}
                type="delete" /> : null}</span>
          </div>)
      }
      {
        params.map((a, i) => {
          let valueMap = getValueLinkMap(a.valueType);
          let linkList = this.state.linkFormDetail.filter(a => valueMap.includes(a.valueType) && a.formType !== 1 && a.formControlType !== FORM_CONTROL_TYPE.Group);
          return <div className={styles.body} key={a.id}>
            <div className={styles.dis}><span>{a.name}</span></div>
            <span>联动显示</span>
            <Select className={styles.item} showSearch placeholder="请选择" optionFilterProp="children"
              maxTagCount={4}
              value={loading ? dataLinker.expression[0].display[0].list[i].id : undefined}
              onChange={(value, option) => {
                this.setDisplayCol(i, value, option, a.id);
              }} filterOption={this.filterOption}>
              {linkList.map(a => <Option key={a.id} value={a.id} title={a.name}>{a.name}{Number(a.status) === -1 ?
                <Tooltip placement="top" title='字段已删除'>
                  <Icon style={{
                    color: "#FF122D",
                    paddingLeft: "12px"
                  }} type="exclamation-circle" />
                </Tooltip> : null}</Option>)}
            </Select>
            <span>的值</span>
          </div>;
        })
      }
    </React.Fragment>;
  }
}

export default DataLinkerEditor;
