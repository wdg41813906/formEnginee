import { Map, List, fromJS } from 'immutable'
import { message } from 'antd';
import com from '../../../utils/com'
import {
  GetTable, SearchText, New, UploadReport, GetForModify, Modify,
  GetFieldByTemplateId, AttachmentsNew, AttachmentsGetListPaged, CombinedDataService
} from '../../../services/Dashboard/Ledger/LedgerIndex'
import { parse } from 'qs';
import ReportConfigBase from '../../../components/Dashboard/Config/ConfigReport/ReportConfigBase'
import _ from 'underscore';
import { FormEngine } from '../../../utils/PlatformConfig'
import queryString from 'query-string';
import { CodeAssemble, OrderAssemble, GroupsAssemble, DimensionsAssemble } from '../../../routes/DataCharts/CodeAssemble'
import { CombinedData } from '../../../routes/DataCharts/CombinedData'
import DashboardConfig, { DefalutColors, SearchItemArray, FontFamily, DesignType, ControlType, ReportItemArray, BaseReport, Item, AllConfig } from '../../../utils/DashboardConfig'
import { EEXIST } from 'constants';

message.config({
  top: 10,
  duration: 1,
  maxCount: 1,
});
const fakeData = (list, unImutable) => {
  var newList = [];

  list.map((item, i) => {
    const y = Math.ceil(Math.random() * 4) + 1;
    var newItem = Map.isMap(item) ? item.toJS() : item;
    var itemSytle = DashboardConfig.ItemSytle(newItem);
    var model = {
      x: (i * newItem.w) % 16,
      y: Math.floor(i / 2) * y,
      moved: false,
      static: false,
      minH: 1,
      minW: 1,
      maxH: itemSytle.maxH,
      maxW: itemSytle.maxW,
      height: itemSytle.height,
      width: itemSytle.width,
      engineeConfig: newItem.engineeConfig ? newItem.engineeConfig : {},
      i: newItem.id
    }
    if (unImutable) {
      newList.push({ ...newItem, ...model });
    } else {
      newList.push(fromJS({ ...newItem, ...model }));
    }
  })
  return newList;
}
const InitData = (list) => {
  var newList = [];
  list.map((item, i) => {
    var newItem = Map.isMap(item) ? item.toJS() : item;
    newList.push(fromJS(newItem));
  })
  return newList;
}
function ColorMatchEnginee(element, oldData) {
  var indicatorsList = []
  if (element.engineeConfig.DragItem && element.engineeConfig.DragItem.length > 0) {
    element.engineeConfig.DragItem.forEach(item => {
      if (element.type === 'Shape') {
        if (item.ContainerId === "dimensionX") {
          element.engineeConfig.ChartsData.forEach((eleData, index) => {
            var indexColor = com.randomNum(0, DefalutColors.length - 1);
            var currentColor = DefalutColors[indexColor];
            var code = `${item.Code}${index}`;
            var oldColor = _.where(element.config.report.colorMatchProgrammes, { code: code });
            if (oldColor.length <= 0) {
              indicatorsList.push({ name: eleData[item.Code], code: code, fromColor: currentColor.from, toColor: currentColor.to });
            } else {
              indicatorsList.push({ name: eleData[item.Code], code: code, fromColor: oldColor[0].fromColor, toColor: oldColor[0].toColor });
            }
          })
        }
      } else {
        if (item.ContainerId === 'indicators') {
          var index = com.randomNum(0, DefalutColors.length - 1);
          var currentColor = DefalutColors[index];
          var code = item.Code;
          var oldColor = _.where(element.config.report.colorMatchProgrammes, { code: code });
          if (oldColor.length <= 0) {
            indicatorsList.push({ name: item.Name, code: item.Code, fromColor: currentColor.from, toColor: currentColor.to });
          } else {
            indicatorsList.push({ name: item.Name, code: item.Code, fromColor: oldColor[0].fromColor, toColor: oldColor[0].toColor });
          }
        }
      }

    });
  }

  element.config.report.colorMatchProgrammes = indicatorsList;
}
function LinkageEnginee(item, oldData) {
  var sourceFields = [];
  if (item.engineeConfig.DragItem && item.engineeConfig.DragItem.length > 0) {
    item.engineeConfig.DragItem.forEach(item => {
      if (item.ContainerId === 'dimensionX' || item.ContainerId === 'dimensionY') {
        sourceFields.push({ name: item.Name, code: item.Code, controlType: item.ControlType });
      }
    });
  }
  item.config.linkAge.sourceFields = sourceFields;
  var homologys = [];
  var nonHomologys = [];
  oldData.forEach(ele => {
    //var ele = element.toJS();
    //同源数据表 非同源数据表
    if (ReportItemArray.indexOf(ele.type) > -1) {
      if (ele.table === item.table) {
        if (ele.id !== item.id) {
          homologys.push({ name: ele.config.title.name, id: ele.id, checked: false });
        }
      }
      else {
        nonHomologys.push({
          name: ele.config.title.name,
          selectField: "none", id: ele.id, fields: ele.fields
        });
      }
    }
  });
  item.config.linkAge.homologys = homologys;
  item.config.linkAge.nonHomologys = nonHomologys;
}

function ReportListRefresh(oldData) {
  var reportList = [];
  oldData.forEach((item, index) => {
    var element = item.toJS();
    if (ReportItemArray.indexOf(element.type) > -1) {
      var reportItem = {
        disabled: false,
        type: element.type,
        id: element.id,
        tableId: element.tableId,
        table: element.table,
        title: element.title
      };
      //  item.set('disabled',false);
      reportList.push(Map(reportItem));
    }
  });
  return reportList;
}

function SearchEnginee(field) {
  var res = "";

  if (field.controlType === ControlType.DateTime) {
    var start = "";
    var end = "";
    if (field.startValue && typeof (field.startValue) === 'object') {
      start = field.startValue.toDate().toLocaleDateString()
    } else {
      start = field.startValue;
    }
    if (field.endValue && typeof (field.endValue) === 'object') {
      end = field.endValue.toDate().toLocaleDateString()
    } else {
      end = field.endValue;
    }
    if (start && end) {
      res = `\'${start}\' <= ${field.code} and ${field.code}<=\'${end}\'`
    }
  } else if (field.controlType === ControlType.SingleText) {
    if (field.defalutValues && field.defalutValues.length > 0) {
      var vals = "";
      field.defalutValues.forEach(ele => {
        if (vals) {
          vals += `,\'${ele}\'`
        } else {
          vals += `\'${ele}\'`
        }
      })
      res = `${field.code} in (${vals})`
    }

  } else if (field.controlType === ControlType.Number) {
    if (field.startValue && field.endValue) {
      res = `\'${field.startValue}\' <= ${field.code} and ${field.code}<=\'${field.endValue}\'`
    }
  }
  return res;
}

function GetCombinedDataTopPage(engineeConfig) {
  var page = 100;
  if (engineeConfig.DataPermission && engineeConfig.DataPermission.includes("1")) {
    page = engineeConfig.ShowCount
  }
  return page;
}
export default {
  namespace: 'ledgerIndex',
  state: Map({
    reportId: "",
    dragactWidth: 0,
    ledgerData: [],//fakeData(DashboardConfig.BaseReport),
    /** 预览 */
    isPreview: false,
    reportPreviewShow: false,
    addDashboardShow: false,
    /**明细表or统计表 */
    designType: DesignType.Statistic,
    /**页信息 */
    dashBoardPage: {
      total: 0,
      index: 1
    },
    /*数据表 */
    tableList: [],
    /**已选择数据表 */
    tableSelectedList: [],
    /*报表 */
    reportList: [],
    reportCheckedValues: fromJS([]),
    /*报表所包含数据表字段 */
    reportFieldData: {
      id: "",
      name: "",
      fields: [],
    },
    /*选中报表 */
    currentReportList: [],
    /**要筛选数据表 */
    currentTable: {},
    /**筛选选文本下拉 */
    searchTextList: [],
    /*当前选中字段 */
    currentField: {
      startValue: '',
      endValue: '',
      defalutValues: []
    },
    /**当前要修改筛选组件 */
    currentReportItem: {},
    searchComShow: false,
    searchComMode: DashboardConfig.Mode.Add,
    stringSelectPosition: {
      left: 0, width: 0, top: 0
    },
    stringSelectShow: false,
    /**抽屉配置显示 */
    configDrawerShow: false,
    /**当前报表 */
    currentReport: fromJS({

    }),
    /**
     * 当前配置类型
     */
    currentConfigTypes: [],
    /**抽屉配置 */
    currentConfig: fromJS({

    }),
    /**报表总体配置显示、隐藏 */
    ledgerConfigShow: false,
    /**报表总体配置 */
    ledgerAllConfig: Map(AllConfig),
    /**背景图片集合 */
    backImageList: fromJS([
      {
        id: com.Guid(),
        selected: false,
        hover: false,
        thumbUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      },
      {
        id: com.Guid(),
        selected: false,
        hover: false,
        thumbUrl: 'http://171.221.227.116:2180/UploadFiles/Images/20181023110501139651a55a13274d4d98e73e5a0abab0e5.jpg',
      }
    ]),
    /**背景图片分页信息 */
    backImagePage: {

    }

  }),
  subscriptions: {
    // Init({dispatch,history}) {

    //   let query = queryString.parse(history.location.search)
    //   if (query.type == 'Modify') {
    //     dispatch({
    //         type: 'ledgerIndex/GetForModify',
    //         payload: { EntityId: query.tabId,  Platform:FormEngine }
    //     })
    // } else {
    //     dispatch({
    //         type: 'ledgerIndex/AddInit',
    //         payload: {}
    //     })
    //  }
    // },
  },
  effects: {
    *GetTable({ payload, history }, { call, put }) {
      const { data } = yield call(GetTable, parse(payload));

      // const {data} =yield call(GetFieldByTemplateId,{templateId:'c6d86b98-b5ae-3ace-7bf7-2034d5b6f433'})
      yield put({
        type: "InitTable",
        payload: {
          data: data.formTable,
          page: data.pagination
        }
      })
    },

    *FieldSelect({ payload, history }, { select, call, put }) {

      yield put({
        type: 'FieldSelectSuc',
        payload: { id: payload.id }
      })


      let { ledgerIndex } = yield select((state) => { return state });
      var currentTable = ledgerIndex.get('currentTable')
      var currentField = ledgerIndex.get('currentField');
      if (currentField.controlType === ControlType.SingleText) {

        yield put({
          type: 'SearchText',
          payload: {
            pageIndex: 1,
            pageSize: 6,
            GroupField: currentField.primaryKey,
            tableName: currentTable.table,//this.props.currentTable.id,
            fieldName: currentField.code,//this.props.currentField.code,
            searchKey: "",
            formType: currentField.formType
          }
        })
      }
    },
    /**
     * 筛选选文本下拉
     * @param {*} param0
     * @param {*} param1
     */
    *SearchText({ payload, history }, { call, put }) {
      const { data } = yield call(SearchText, parse(payload))
      yield put({
        type: "searchTextStore",
        payload: {
          data: data
        }
      })



    },
    /**
     * 保存
     * @param {*} param0
     * @param {*} param1
     */
    *Save({ payload }, { call, put }) {
      var newData = []
      var ledgerAllConfig = payload.ledgerAllConfig.toJS();
      var reportList = payload.reportList;
      var code = "";
      var type = payload.type;
      payload.ledgerData.forEach(ele => {
        var item = ele.toJS();
        var newItem = {}
        if (ReportItemArray.indexOf(item.type) > -1) {
          if (code.indexOf(item.formTemplateId) <= -1) {

            if (!code) {
              code += item.formTemplateId;
            } else {
              code += ',' + item.formTemplateId;
            }
          }
        }
        for (let key in item) {
          if (key === 'ReoprtConfigType') continue
          newItem[key] = item[key];


        }
        newData.push(newItem)
      })
      //var jsonStr = JSON.stringify(newData);

      var jsonStr = JSON.stringify({ itemConfig: newData, allConfig: ledgerAllConfig });

      if (type === 'Modify') {
        const { data } = yield call(Modify, {
          Id: payload.id,
          Name: ledgerAllConfig.name,
          Code: code,
          Platform: FormEngine,
          ConfigJson: jsonStr
        })
        if (data.isValid) {

          //localStorage.setItem("dashbordStorage", jsonStr);
          message.success('修改成功!')
        }
      } else {
        var applicationTemplate = {};
        if (payload.id) {
          applicationTemplate = { ApplicationId: payload.id }
        }
        const { data } = yield call(New, parse({
          Id: com.Guid(),
          Name: ledgerAllConfig.name,
          Code: code,
          Platform: FormEngine,
          ConfigJson: jsonStr,
          applicationTemplate
        }));
        if (data.isValid) {

          //localStorage.setItem("dashbordStorage", jsonStr);
          message.success('保存成功!')
          payload.history.goBack();
        }
      }
    },
    *AttachmentsNew({ payload }, { call, put }) {
      const { data } = yield call(AttachmentsNew, parse(payload))
    },
    *AttachmentsGetListPaged({ payload }, { call, put }) {
      const { data } = yield call(AttachmentsGetListPaged, parse(payload))

      yield put({
        type: 'BackImageInit',
        payload: {
          backImageList: data.attachmentsList,
          backImagePage: data.pagination
        }
      })
    },
    /**
    * 搜索项更新选择字段
    * @param {*} state
    * @param {*} action
    */
    *StringSelectField({ payload }, { call, put, select }) {

      let { ledgerIndex } = yield select((state) => { return state });
      var item = ledgerIndex.get('currentReportItem');
      var oldData = ledgerIndex.get('ledgerData');
      // var defalutValues=defalutValues;
      var newData = [];
      var currentItem;
      oldData.forEach(ele => {
        var eleItem = ele.toJS();
        if (eleItem.id === item.id) {
          eleItem.searchData.itemField = {
            ...eleItem.searchData.itemField,
            ...payload

          }
          eleItem.searchData.currentField = {
            ...eleItem.searchData.currentField,
            ...payload

          }
          currentItem = eleItem
          newData.push(eleItem)
        } else {
          newData.push(eleItem)
        }
      })

      yield put({
        type: 'SearchEngineeCall',
        payload: {
          list: newData,
          isInit: false
        }
      })

      yield put({
        type: 'StringSelectFieldSucc',
        payload: {
          currentItem: currentItem
        }
      })

    },
    /**
   * 日期、数字范围字段更新
   */
    *RangeFieldChange({ payload }, { call, put, select }) {

      let { ledgerIndex } = yield select((state) => { return state });
      var item = payload.item;
      var obj = payload.obj;
      var oldData = ledgerIndex.get('ledgerData');
      // var defalutValues=defalutValues;

      var newData = [];
      oldData.forEach(ele => {
        var eleItem = ele.toJS();
        if (eleItem.id === item.id) {
          eleItem.searchData.currentField = {
            ...eleItem.searchData.currentField,
            ...obj

          }
          newData.push(eleItem)
        } else {
          newData.push(eleItem)
        }
      })

      yield put({
        type: 'SearchEngineeCall',
        payload: {
          list: newData,
          isInit: false
        }
      })

    },
    *SearchButtonCall({ payload }, { call, put, select }) {
      let { ledgerIndex } = yield select((state) => { return state });
      var oldData = ledgerIndex.get('ledgerData');
      var newData = [];
      oldData.forEach(ele => {
        var eleItem = ele.toJS();
        newData.push(eleItem)
      })
      yield put({
        type: 'SearchEngineeCall',
        payload: {
          list: newData,
          isInit: false
        }
      })
    },
    /**
     * 数据联动
     * @param {*} param0
     * @param {*} param1
     */
    *DataLinkageEngineeCall({ payload }, { call, put, select }) {
      var item = payload.item;
      var valueObj = payload.value;

      let { ledgerIndex } = yield select((state) => { return state });
      var oldData = ledgerIndex.get('ledgerData');
      var homologysItems = []
      var nonHomologysItems = [];
      var searchList = [];
      oldData.forEach(function (ele) {
        var element = ele.toJS()
        if (SearchItemArray.indexOf(element.type) > -1) {
          searchList.push(element);
        }
      })
      item.config.linkAge.homologys.forEach(ele => {
        if (ele.checked === true) {
          homologysItems.push(ele)
        }
      })
      item.config.linkAge.nonHomologys.forEach(ele => {
        if (ele.selectField !== 'none') {
          nonHomologysItems.push(ele);
        }
      })

      var newData = [];
      for (let i = 0; i < oldData.length; i++) {
        var element = oldData[i].toJS();
        var exitsHomology = _.where(homologysItems, { id: element.id });
        var exitsNonHomology = _.where(nonHomologysItems, { id: element.id })
        if (exitsHomology.length <= 0 && exitsNonHomology.length <= 0) {
          newData.push(element)
          continue;
        }
        var currentSearchFields = [];
        item.config.linkAge.sourceFields.forEach(ele => {
          var val = valueObj[ele.name];
          if (exitsHomology.length > 0) {
            var strWhere = `${ele.code}='${val}'`
            currentSearchFields.push(strWhere)
          }
          if (exitsNonHomology.length > 0) {
            var strWhereNonHomlogy = `${exitsNonHomology[0].selectField}='${val}'`
            currentSearchFields.push(strWhereNonHomlogy)
          }
        })

        //search begin
        var currentSearch = [];
        searchList.forEach(ele => {
          var exits = _.where(ele.searchData.currentReportList, { table: element.table });
          if (exits.length > 0) {
            currentSearch.push(ele)
          }
        })
        currentSearch.forEach(ele => {
          var fieldWhere = SearchEnginee(ele.searchData.currentField)
          if (fieldWhere) {
            currentSearchFields.push(fieldWhere)
          }
        })
        //search end
        var json = CombinedData(element.engineeConfig, function () { }, function () { })

        var page = GetCombinedDataTopPage(element.engineeConfig)
        let CombinedRes = yield call(CombinedDataService, {
          Top: page,
          FormTemplateCode: element.engineeConfig.DragSource.table,
          Dimensions: DimensionsAssemble(json.Dimensions),//维度
          Measures: json.Measures,//指标
          Conditions: currentSearchFields.concat(CodeAssemble(json.Condition)),//筛选条件
          Orders: OrderAssemble(element.engineeConfig.setSort),//排序
          Groups: GroupsAssemble(json.Groups),//日期类维度字段
        })
        element.ChartsData = CombinedRes.data.table;
        element.engineeConfig.ChartsData = CombinedRes.data.table
        newData.push(element)
      }
      yield put({
        type: 'RefreshData',
        payload: {
          list: newData
        }
      });
    },
    *SearchEngineeCall({ payload }, { call, put }) {
      //是否初始化
      var isInit = payload.isInit;
      var list = payload.list;
      var searchList = [];
      list.forEach(function (ele) {
        if (SearchItemArray.indexOf(ele.type) > -1) {
          searchList.push(ele);
        }
      })
      for (let i = 0; i < list.length; i++) {
        var element = list[i];
        // LinkageEnginee(element, list)
        if (ReportItemArray.indexOf(element.type) <= -1) continue
        var currentSearch = [];
        searchList.forEach(ele => {
          var exits = _.where(ele.searchData.currentReportList, { id: element.id });
          if (exits.length > 0) {
            currentSearch.push(ele)
          }
        })
        //初始化时，即时没有关联搜索组件也要查询api
        if (currentSearch.length <= 0 && !isInit) continue;
        var currentSearchFields = [];
        currentSearch.forEach(ele => {
          var fieldWhere = SearchEnginee(ele.searchData.currentField)
          if (fieldWhere) {
            currentSearchFields.push(fieldWhere)
          }
        })
        var json = CombinedData(element.engineeConfig, function () { }, function () { })

        var page = GetCombinedDataTopPage(element.engineeConfig)

        let CombinedRes = yield call(CombinedDataService, {
          Top: page,
          FormTemplateCode: element.engineeConfig.DragSource.table,
          Dimensions: DimensionsAssemble(json.Dimensions),//维度
          Measures: json.Measures,//指标
          Conditions: currentSearchFields.concat(CodeAssemble(json.Condition)),//筛选条件
          Orders: OrderAssemble(element.engineeConfig.setSort),//排序
          Groups: GroupsAssemble(json.Groups),//日期类维度字段
        })

        element.ChartsData = CombinedRes.data.table;
        element.engineeConfig.ChartsData = CombinedRes.data.table
        list[i] = element;
        yield put({
          type: 'RefreshData',
          payload: {
            list: list
          }
        });
      }
      // yield put({
      //   type: 'RefreshData',
      //   payload: {
      //     list: list
      //   }
      // });
    },
    *GetForModify({ payload }, { call, put }) {
      message.loading('加载中...')
      const { data } = yield call(GetForModify, parse(payload));
      message.destroy();
      // var config=JSON.parse( data.configJson);

      var configJson = JSON.parse(data.configJson);
      var list = configJson.itemConfig;
      yield put({
        type: 'Init',
        payload: {
          allConfig: configJson.allConfig,
          tableList: data.tableList,

        }
      });
      yield put({
        type: 'SearchEngineeCall',
        payload: {
          list: list,
          isInit: true
        }
      })

    },
    *CombinedDataService({ payload }, { call, put, select }) {

      var report = payload.report;

      var json = CombinedData(report, function () { })
      const { data } = yield call(CombinedDataService, {
        Top: 100,
        FormTemplateCode: report.DragSource.table,
        Dimensions: DimensionsAssemble(json.Dimensions),//维度
        Measures: json.Measures,//指标
        Conditions: CodeAssemble(json.Condition),//筛选条件
        Orders: OrderAssemble(report.setSort),//排序
        Groups: GroupsAssemble(json.Groups),//日期类维度字段
      })
    },
    /**
     * 设计引擎保存
     * @param {*} param0
     * @param {*} param1
     */
    *EngineeSave({ payload }, { call, put, select }) {
      var reportType = payload.ChartsType;
      var templateId = payload.templateId;
      const { data } = yield call(GetFieldByTemplateId, { entityId: templateId })

      if (data) {
        let { ledgerIndex } = yield select((state) => { return state });
        var ledgerData = ledgerIndex.get('ledgerData')
        //var tableList = ledgerIndex.get('tableList');

        var tableSelectedList = ledgerIndex.get('tableSelectedList');
        var item = data;
        tableSelectedList.push(item)
        var searchtItem = _.where(BaseReport, { type: reportType })[0];
        var reportItem = searchtItem;//{ ...searchtItem, ...item }
        var isHas = false;
        var oldData = [];
        var newData = []
        ledgerData.forEach(function (element) {
          var ele = element.toJS();
          oldData.push(ele);
        })
        var exits = _.where(oldData, { id: payload.ChartsId });
        if (exits.length > 0) {
          isHas = true;
        }
        if (!isHas) {
          //newData = ledgerData;
          reportItem.engineeConfig = payload;
          reportItem.tableId = item.id;
          reportItem.formTemplateId = payload.templateId;
          reportItem.title = payload.ChartsTitle;
          // reportItem.DragSource=payload.DragSource;
          // reportItem.DragItem=payload.DragItem;
          reportItem.ChartsData = payload.ChartsData;
          reportItem.id = com.Guid();
          reportItem.type = reportType;
          reportItem.i = reportItem.id;
          reportItem.engineeConfig = payload;
          reportItem.config.title.name = payload.ChartsTitle;
          LinkageEnginee(reportItem, newData)
          ColorMatchEnginee(reportItem, newData);
          oldData.push(reportItem)
          oldData = fakeData(oldData,true)
        }
        oldData.forEach(function (ele) {
          if (ele.id === payload.ChartsId) {
            // ele = { ...ele, ...reportItem };
            ele.type = reportType;
            ele.tableId = item.id;
            ele.id = payload.ChartsId;
            ele.i = payload.ChartsId;
            ele.engineeConfig = payload;
            ele.formTemplateId = payload.templateId;
            ele.title = payload.ChartsTitle;
            //  ele.DragSource=payload.DragSource;
            // ele.DragItem=payload.DragItem;
            ele.ChartsData = payload.ChartsData;
            ele.config.title.name = payload.ChartsTitle;

          }
          LinkageEnginee(ele, oldData)
          ColorMatchEnginee(ele, newData);
          newData.push(ele);
        })



        yield put({
          type: 'EngineeSaveSuccess',
          payload: {
            ledgerData: newData,
            tableSelectedList
          }
        })
      }
    }

  },
  reducers: {
    /**
     *
     * @param {*} state
     * @param {*} action
     */
    SaveReportId(state, action) {

      return state.set('reportId', action.payload.reportId)
    },
    /**
     * 设计引擎保存
     * @param {*} state
     * @param {*} action
     */
    EngineeSaveSuccess(state, action) {
      var ledgerData = action.payload.ledgerData;
      var tableSelectedList = action.payload.tableSelectedList;
      return state.set('ledgerData', InitData(ledgerData))
        .set('tableSelectedList', tableSelectedList)
    },
    /**
     * 修改初始化
     * @param {*} state
     * @param {*} action
     */
    Init(state, action) {
      var tableList = action.payload.tableList;
      var allConfig = action.payload.allConfig;
      return state
        .set('ledgerAllConfig', Map(allConfig))
        .set('tableSelectedList', tableList)

    },
    RefreshData(state, action) {
      var list = action.payload.list;
      return state.set('ledgerData', InitData(list))
    },
    /**
     * 新增初始化
     * @param {*} state
     * @param {*} action
     */
    AddInit(state, action) {
      return state.set('ledgerData', InitData([]))
        .set('ledgerAllConfig', Map(AllConfig))
      // debugger
      // return state.set('ledgerAllConfig', Map(AllConfig));
    },
    /**
     * 预览
     * @param {} state
     * @param {*} action
     */
    Preview(state, action) {

      return state.set('isPreview', !state.get('isPreview'))
    },
    HiddrenPriview(state, action){
      return state.set('isPreview', false)
    },
    /**
     * 筛选选文本下拉
     * @param {*} state
     * @param {*} action
     */
    searchTextStore(state, action) {
      return state.set("searchTextList", action.payload.data)
    },
    InitTable(state, action) {
      var page = action.payload.page;

      var newPage = {
        total: page.totalCount,
        index: 1
      }
      return state.set('tableList', action.payload.data)
        .set('dashBoardPage', newPage)
    },
    Test(state, action) {
      var foo = state.get('products')
      const newFoo = foo.setIn([2, 'name'], 'SBBBBB')

      return state.set('products', newFoo)

    },
    /*
       显示/隐藏新增图标模态窗
    */
    StringSelectToggle(state, action) {
      var flag = action.payload.show;
      return state.set('stringSelectShow', flag)

      // return { ...state, stringSelectShow: flag}
    },
    /*
       面板位置改变
    */
    StringSelectPositionChange(state, action) {
      return state.set('stringSelectPosition', action.payload.position)
      // return { ...state, stringSelectPosition: action.payload.position };
    },
    /**
     * 日期、数字范围字段更新
     */
    RangeFieldChange1(state, action) {


      return state.set('ledgerData', newData)
    },

    /**
     * 搜索项更新选择字段
     * @param {*} state
     * @param {*} action
     */
    StringSelectFieldSucc(state, action) {


      return state
        .set('currentReportItem', action.payload.currentItem)


    },
    StringSelectFn(state, action) {
      var item = action.payload.item;
      var currentReportList = item.searchData.currentReportList;
      var currentField = item.searchData.currentField;
      var tableSelectedList = state.get('tableSelectedList');
      var table = _.where(tableSelectedList, { id: currentReportList[0].tableId })[0]


      return state
        .set('currentTable', table)
        .set('currentField', currentField)
        .set('searchTextList', [])
        .set('currentReportItem', item)
    },
    /*
       显示/隐藏新增图标模态窗
    */
    AddDashboardToggle(state, action) {
      if (action.payload) {
        var designType = action.payload.designType;

        return state.set('addDashboardShow', !state.get('addDashboardShow'))
          .set('designType', designType)
      } else {
        return state.set('addDashboardShow', !state.get('addDashboardShow'))
      }
      // return { ...state, addDashboardShow: !state.addDashboardShow };
    },
    /**
     * 需要筛选的图表初始化
     * @param {*} state
     * @param {*} action
     */
    ReportListInit(state, action) {
      var oldData = state.get('ledgerData');

      var reportList = ReportListRefresh(oldData);
      return state.set('reportList', reportList)
    },
    /*
       显示/隐藏新增删选器模态窗
    */
    SearchComToggle(state, action) {
      var flag = state.get('searchComShow');
      return state.set('searchComShow', !state.get('searchComShow'))
        .set('searchComMode', DashboardConfig.Mode.Add)
        .set('reportCheckedValues', fromJS([]))
        .set('reportFieldData', {})
        .set('currentReportList', [])
        .set('currentField', {})
      //return { ...state, searchComShow: !state.searchComShow };
    },
    /*
     数据表选中
    */
    TableItemSelect(state, action) {

      var oldData = state.get('tableList');
      var newData = oldData.filter(function (ele) {
        if (ele.id === action.payload.item.id) {
          ele.select = true
        }
        else {
          ele.select = false;
        }
        return ele;
      })
      return state.set('tableList', newData)
      //return { ...state, tableList: oldData }
    },
    /**
     * 预览报表项显示、隐藏
     */
    ReportPreviewToggle(state, action) {

      return state.set('reportPreviewShow', !state.get('reportPreviewShow'))
    },
    /**
     * 预览报表项
     * @param {*} state
     * @param {*} action
     */
    ReportItemPreview(state, action) {
      var item = action.payload.item;
      //var itemSytle = DashboardConfig.ItemSytle(item);
      item.height = window.innerHeight - 100;//itemSytle.height;
      item.width = window.innerWidth;//itemSytle.width;
      return state.set('currentReportItem', item)
    },
    /**
     * 报表项选中
     * @param {*} state
     * @param {*} action
     */
    ReportItemSelect(state, action) {

      var reportData = state.get('reportList');
      // var currentReportList = state.get('currentReportList');
      var newCurrentReportList = [];
      var newReportData = []
      var fields = [];
      var item = action.payload.item
      var model;
      reportData.forEach(function (ele) {
        var element = ele.toJS();
        if (item.indexOf(element.id) > -1) {
          newCurrentReportList.push(element)
          model = element;
        }
        // var model = _.where(reportData, { id: ele })[0];

      })

      // var model = _.where(reportData, { id: item[0] })[0];
      if (model) {
        reportData.forEach(function (ele) {
          var element = ele.toJS();
          if (element.tableId === model.tableId) {
            newReportData.push(ele.set('disabled', false));
          } else {
            newReportData.push(ele.set('disabled', true))
          }

        })
        var tableSelectedList = state.get('tableSelectedList');
        var table = _.where(tableSelectedList, { id: model.tableId })[0]

        fields = table;
      } else {
        reportData.forEach(function (ele) {

          newReportData.push(ele.set('disabled', false))

        })
      }

      return state.set('reportFieldData', fields)
        .set('reportCheckedValues', fromJS(item))
        .set('reportList', newReportData)
        .set('currentField', {})
        .set('currentReportList', newCurrentReportList)
        .set("currentTable", table)

    },
    /**
     * 字段选中
     * @param {*} state
     * @param {*} action
     */
    FieldSelectSuc(state, action) {

      var reportFieldData = state.get('reportFieldData');
      var field = {}
      var id = action.payload.id;
      if (id) {
        field = _.where(reportFieldData.fields, { id: id })[0];
      }
      //如果选中字段是文本，执行删选
      // if(field.controlType===ControlType.SingleText){

      // }
      return state.set('currentField', field);
    },
    /**
     * 修改当前选中字段（名称、默认值）
     * @param {*} state
     * @param {*} action
     */
    ChangeCurrentField(state, action) {

      var currentField = state.get('currentField');
      var newField = { ...currentField, ...action.payload.data };
      return state.set('currentField', newField)
    },

    /**
     * 新增搜索按钮
     * @param {*} state
     * @param {*} action
     */
    SearchButtonAdd(state, action) {

      var ledgerData = state.get('ledgerData');
      var exits = false;
      for (var i = 0; i < ledgerData.length; i++) {
        var item = ledgerData[i].toJS();
        if (item.type === Item.SearchButton) {
          exits = true;
          break;
        }
      }
      // var exits = _.where(ledgerData, { type: DashboardConfig.Item.SearchButton })
      if (exits) {
        message.error('已经有筛选按钮!');
        return state;
      }
      var searchtItem = _.where(BaseReport,
        { type: Item.SearchButton })[0];
      var reportItem = { ...{}, ...searchtItem }
      reportItem.config.title.name = "搜索";
      ledgerData.unshift(reportItem)
      message.success('新增筛选按钮成功!');
      return state.set('ledgerData', fakeData(ledgerData));
    },
    /**
     * 新增报表
     * @param {*} state
     * @param {*} action
     */
    ReportItemAdd(state, action) {

      var ledgerData = state.get('ledgerData');
      var tableList = state.get('tableList');
      var tableSelectedList = state.get('tableSelectedList');
      var currentTable = _.where(tableList, { select: true });
      if (currentTable.length <= 0) {
        message.error("请选择数据表");
        return state;
      }

      var item = currentTable[0];//action.payload.item;
      tableSelectedList.push(item)
      var reportType = Item.Line;

      var searchtItem = _.where(BaseReport, { type: reportType })[0];
      var reportItem = { ...searchtItem, ...item }

      reportItem.tableId = item.id;
      reportItem.title = item.name;

      reportItem.id = com.Guid();
      reportItem.i = reportItem.id;
      reportItem.config.title.name = item.name;
      ledgerData.push(reportItem)

      message.success('新增报表成功!');
      return state.set('ledgerData', fakeData(ledgerData))
        .set('addDashboardShow', false)
        .set('tableSelectedList', tableSelectedList)
    },


    /**
     * 修改筛选组件
     */
    SearchComEditShow(state, action) {

      var item = action.payload.item;
      var flag = action.payload.flag;
      var currentReportList = item.searchData.currentReportList;
      var currentField = item.searchData.currentField;
      var tableSelectedList = state.get('tableSelectedList');
      var table = _.where(tableSelectedList, { id: currentReportList[0].tableId })[0]
      var fields = table;
      var checkedValues = _.pluck(currentReportList, 'id');
      var oldData = state.get('ledgerData');

      var reportList = ReportListRefresh(oldData);

      return state.set('searchComShow', flag)
        .set('currentReportItem', item)
        .set('currentTable', table)
        .set('searchComMode', DashboardConfig.Mode.Modify)
        .set('reportFieldData', fields)
        .set('reportCheckedValues', fromJS(checkedValues))
        .set('currentReportList', currentReportList)
        .set('currentField', currentField)
        .set('reportList', reportList)
    },
    /**
    * 修改筛选组件
    */
    SearchComEdit(state, action) {
      var currentReportItem = state.get('currentReportItem');
      var currentReportList = state.get('currentReportList');
      var currentField = state.get('currentField');
      // var reportData = state.get('reportList');
      if (currentReportList.length <= 0 || !currentField.name) {
        message.error('筛选项未完整!');
        return state;
      }
      currentReportItem.title = currentField.name;
      currentReportItem.searchData = {
        currentReportList,
        currentField,
        itemField: currentField
      }
      var ledgerData = state.get('ledgerData');

      var newLederData = []
      ledgerData.forEach(ele => {
        var element = ele.toJS();
        if (element.id === currentReportItem.id) {
          newLederData.push(Map(currentReportItem));
        }
        else {
          newLederData.push(ele);
        }
      })

      return state.set('ledgerData', newLederData)
        .set('reportCheckedValues', fromJS([]))
        .set('reportFieldData', {})
        .set('currentReportList', [])
        .set('currentField', {})
        .set('searchComShow', false)
    },
    /**
     * 新增筛选组件
     * @param {*} state
     * @param {*} action
     */
    SearchComAdd(state, action) {
      var currentReportList = state.get('currentReportList');
      var currentField = state.get('currentField');
      // var dragactWidth=state.get('dragactWidth');
      // var reportData = state.get('reportList');
      if (currentReportList.length <= 0 || !currentField.name) {
        message.error('筛选项未完整!');
        return state;

      }
      var ledgerData = state.get('ledgerData');
      var reportType = "";

      for (var item in DashboardConfig.ControlTypeItemMapping) {
        if (currentField.controlType === item) {
          reportType = DashboardConfig.ControlTypeItemMapping[item]
        }
      }

      var searchtItem = _.where(DashboardConfig.BaseReport, { type: reportType })[0];
      var reportItem = { ...{}, ...searchtItem }
      // var ItemSytle = DashboardConfig.ItemSytle(reportItem,dragactWidth);
      reportItem.title = currentField.name;
      reportItem.searchData = {
        currentReportList,
        currentField,
        itemField: currentField
      }
      reportItem.id = com.Guid();
      reportItem.i = reportItem.id;
      reportItem.config.title.name = currentField.name;
      ledgerData.unshift(fromJS(reportItem))
      message.success('新增筛选项成功!');
      return state
        .set('ledgerData', fakeData(ledgerData))

        .set('reportCheckedValues', fromJS([]))
        .set('reportFieldData', {})
        .set('currentReportList', [])
        .set('currentField', {})
        .set('searchComShow', false)
    },
    /**
     * 删除项
     * @param {*} state
     * @param {*} action
     */
    ReportItemRemove(state, action) {
      var item = action.payload.item;
      var oldData = state.get('ledgerData');
      var newData = [];
      oldData.forEach(ele => {
        var element = ele.toJS();
        if (item.i !== element.i) newData.push(ele);
      });
      return state.set('ledgerData', newData)
    },
    /*
    卡片鼠标覆盖
    */
    CardMouseOver(state, action) {
      var item = action.payload.item;
      var oldData = state.get('ledgerData');
      var newData = [];
      oldData.forEach(ele => {
        var element = ele.toJS(); var element = ele.toJS();
        if (item.i === element.i) {
          newData.push(ele.set('showOperate', true))
        } else {
          newData.push(ele.set('showOperate', false))
        }

      });
      return state.set('ledgerData', newData)
      //return { ...state, ledgerData: oldData }
    },
    /*
  卡片鼠标离开
  */
    CardMouseLeave(state, action) {

      var item = action.payload.item;
      var oldData = state.get('ledgerData');
      var newData = [];
      oldData.forEach(ele => {
        var element = ele.toJS();
        if (item.i === element.i) {
          newData.push(ele.set('showOperate', false))
        } else {
          newData.push(ele);
        }

      });
      return state.set('ledgerData', newData)
      //return { ...state, ledgerData: oldData }
    },
    /*
       Card拖拽完成
    */
    OnResizeStop(state, action) {
      var oldData = state.get('ledgerData');
      var dragactWidth = state.get('dragactWidth');

      var newData = [];
      var ele = action.payload.data
      oldData.forEach((item, index) => {
        var element = item.toJS();
        if (element.i === ele.i) {
          // var itemSytle = DashboardConfig.ItemSytle(element);
          var newElement = { ...element, ...ele };
          var itemSytle = DashboardConfig.ItemSytle(newElement, dragactWidth);
          var newItem = item
            .set('w', ele.w)
            .set('h', ele.h)
            .set('x', ele.x)
            .set('moved', ele.moved)
            .set('static', ele.static)
            .set('Fields', ele.Fields)
            .set('minH', itemSytle.minH)
            .set('minW', itemSytle.minW)
            .set('width', itemSytle.width)
            .set('height', itemSytle.height)

          newData.push(newItem)
        } else {
          newData.push(item)
        }
      })
      return state.set('ledgerData', newData);
    },
    /**
     * 初始化ref dragactWidth
     * @param {*} state
     * @param {*} action
     */
    RefInit(state, action) {
      var oldData = state.get('ledgerData');
      var newData = [];

      var dragactWidth = action.payload.dragactWidth
      oldData.forEach((item, index) => {
        var ele = item.toJS();

        // var itemSytle = DashboardConfig.ItemSytle(element);
        // var newElement = { ...element, ...ele };
        var itemSytle = DashboardConfig.ItemSytle(ele, dragactWidth);
        var newItem = item
          .set('w', ele.w)
          .set('h', ele.h)
          .set('x', ele.x)
          .set('moved', ele.moved)
          .set('static', ele.static)
          //.set('Fields', ele.Fields)
          .set('minH', itemSytle.minH)
          .set('minW', itemSytle.minW)
          .set('width', itemSytle.width)
          .set('height', itemSytle.height)

        newData.push(newItem)

      })
      return state.set('ledgerData', newData)
        .set('dragactWidth', dragactWidth);
    },
    /**
     * 配置显示
     * @param {*} state
     * @param {*} action
     */
    ConfigDrawerShowToggle(state, action) {
      var flag = state.get('configDrawerShow')
      return state.set('configDrawerShow', !flag)
    },
    /**
     * 报表设置选中
     * @param {*} state
     * @param {*} action
     */
    ReportItemChange(state, action) {
      var item = action.payload.item;
      var oldData = state.get('ledgerData');
      var model = _.where(ReportConfigBase.ReportConfigBase, { type: item.type })[0];
      var type = { ...model, ...item.ReoprtConfigType };
      item.ReoprtConfigType = type;
      var configTypeList = item.ReoprtConfigType.configTypeList;
      var exitsSelect = _.where(configTypeList, { selected: true });
      var config = {};
      if (exitsSelect.length > 0) {
        config = exitsSelect[0].config;
      } else {
        config = configTypeList[0].config;
      }

      var newData = [];

      // LinkageEnginee(item, oldData);
      oldData.forEach(ele => {
        var element = ele.toJS();
        if (item.i === element.i) {

          element.ReoprtConfigType = item.ReoprtConfigType;
          newData.push(fromJS(element));
        } else {
          newData.push(ele);
        }


      });

      ;
      return state.set('ledgerData', newData).set('currentReport',
        fromJS(item)).set('currentConfig', fromJS(config))
    },
    /**
     * 报表配置类型选中
     */
    ConfigTypeChange(state, action) {
      //currentConfig

      var currentReport = state.get('currentReport')

      var oldData = state.get('ledgerData');

      var oriCurrentReport = currentReport.toJS()
      var configTypeList = oriCurrentReport.ReoprtConfigType.configTypeList;
      var item = action.payload.item;
      configTypeList.forEach(function (element) {
        element.selected = false;
        if (element.id === item.id) {
          element.selected = true;
        }
      })
      oriCurrentReport.ReoprtConfigType.configTypeList = configTypeList;
      var newData = [];
      oldData.filter(ele => {
        var element = ele.toJS();
        if (oriCurrentReport.i === element.i) {

          element.ReoprtConfigType.configTypeList = configTypeList;
          newData.push(Map(element));
        } else {
          newData.push(ele);
        }

      });
      return state.set('ledgerData', newData)
        .set('currentReport', fromJS(oriCurrentReport)).set('currentConfig', fromJS(item.config));
    },
    /**
     * 更新报表 配色指标项 颜色值
     * @param {*} state
     * @param {*} action
     */
    SetColorMatchProgrammesData(state, action) {
      const { item, dataKey, color } = action.payload;
      var dataKeyList = dataKey.split('_');
      var code = dataKeyList[0];
      var forColor = dataKeyList[1];
      item.config.report.colorMatchProgrammes.forEach(ele => {
        if (code === ele.code) {
          if (forColor === 'from') {
            ele.fromColor = color;
          } else {
            ele.toColor = color;
          }
        }
      })
      var oldData = state.get('ledgerData');
      var newData = [];
      oldData.filter(ele => {
        var element = ele.toJS();
        if (item.i === element.i) {

          newData.push(fromJS(item));
        } else {
          newData.push(ele);
        }
      });
      return state
        .set('ledgerData', newData)
        .set('currentReport', fromJS(item));
    },

    /**
     * 更新联动配置---同源信息
     * @param {*} state
     * @param {*} action
     */
    SetLinkageHomologyData(state, action) {
      var item = action.payload.item;
      var table = action.payload.table;
      item.config.linkAge.homologys.forEach(ele => {
        if (table.id === ele.id) {
          ele.checked = !ele.checked;
        }
      })
      var oldData = state.get('ledgerData');
      var newData = [];
      oldData.filter(ele => {
        var element = ele.toJS();
        if (item.i === element.i) {

          newData.push(fromJS(item));
        } else {
          newData.push(ele);
        }
      });
      return state
        .set('ledgerData', newData)
        .set('currentReport', fromJS(item));
    },
    /**
     * 更新联动配置---非同源信息
     * @param {*} state
     * @param {*} action
     */
    SetLinkageData(state, action) {
      var item = action.payload.item;
      var table = action.payload.table;
      var field = action.payload.field;
      item.config.linkAge.nonHomologys.forEach(ele => {
        if (table.id === ele.id) {
          ele.selectField = field
        }
      })
      var oldData = state.get('ledgerData');
      var newData = [];
      oldData.filter(ele => {
        var element = ele.toJS();
        if (item.i === element.i) {


          newData.push(fromJS(item));
        } else {
          newData.push(ele);
        }

      });
      return state
        .set('ledgerData', newData)
        .set('currentReport', fromJS(item));
    },
    SetData(state, action) {

      var oldData = state.get('ledgerData');
      var item = action.payload.item;
      var key = action.payload.key;
      var value = action.payload.value;
      var arr = key.split('.');
      var obj = {}
      var obj2 = {}
      obj[arr[1]] = value;
      obj2[arr[0]] = obj;
      var value = action.payload.value;
      var config = item.config;
      var newObj = { ...config[arr[0]], ...obj }

      config[arr[0]] = newObj;
      item.config = config;

      var newData = [];
      oldData.filter(ele => {
        var element = ele.toJS();
        //更新联动集合对应项标题
        if (key === "title.name") {
          element.config.linkAge.homologys.forEach(hom => {
            if (item.id === hom.id) {
              hom.name = value
            }
          })
          element.config.linkAge.nonHomologys.forEach(hom => {
            if (item.id === hom.id) {
              hom.name = value
            }
          })
        }
        if (item.i === element.i) {
          if (key === "title.name") {
            element.title = value;
            // element.name=value;
          }
          element.config = config;
          newData.push(fromJS(element));
        } else {
          newData.push(fromJS(element));
        }

      });
      return state
        .set('ledgerData', newData)
        .set('currentReport', fromJS(item));;
    },
    /**
     * 报表总体配置显示、隐藏
     * @param {*} state
     * @param {*} action
     */
    LedgerConfigShowToggel(state, action) {
      var flag = state.get('ledgerConfigShow');
      return state.set('ledgerConfigShow', !flag)
    },
    /**
     * 设置总体配置
     * @param {*} state
     * @param {*} action
     */
    SetLedgerData(state, action) {
      var ledgerAllConfig = state.get('ledgerAllConfig');
      // var oldConfig=ledgerAllConfig.toJS();
      var key = action.payload.key;
      var value = action.payload.value;
      // var obj={};
      // obj[key]=value;
      // var newConfig={...oldConfig,...obj};

      var newConfig = ledgerAllConfig.set(key, value);

      return state.set('ledgerAllConfig', newConfig);
    },
    /**
      背景图片列表初始化
     */
    BackImageInit(state, action) {
      var backImageList = action.payload.backImageList;
      var backImagePage = action.payload.backImagePage;
      var list = [];
      backImageList.forEach(ele => {
        list.push({
          id: ele.id,
          selected: false,
          hover: false,
          thumbUrl: ele.url
        })
      })
      return state.set('backImageList', fromJS(list))
        .set('backImagePage', backImagePage)
    },
    BackImageAdd(state, action) {
      var imageList = state.get('backImageList').toJS();

      var image = action.payload.image;
      imageList.push({
        id: image.Id,
        selected: false,
        hover: false,
        thumbUrl: image.Src
      })
      return state.set('backImageList', fromJS(imageList))
    },
    BackImageHoverChange(state, action) {
      var imageList = state.get('backImageList').toJS();
      var item = action.payload.item;
      var flag = action.payload.flag;
      imageList.map(ele => {
        if (item.Id === ele.Id) {
          ele.Hover = flag
        }
      })
      return state.set('backImageList', fromJS(imageList))
    },
    BackImageItemClick(state, action) {
      var imageList = state.get('backImageList').toJS();
      var item = action.payload.item;
      imageList.map(ele => {
        if (item.id === ele.id) {
          ele.selected = true
        } else {
          ele.selected = false
        }
      })

      return state.set('backImageList', fromJS(imageList))
    }



  },

};

