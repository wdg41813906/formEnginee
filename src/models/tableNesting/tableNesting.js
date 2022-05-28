import { save, CreateTableView } from '../../services/tableNesting/tableNesting';



export default {
  namespace: 'tableNesting',
  state: {
    columns: [
      { title: "主表字段1", dataIndex: "name", key: "name[0]" },
      { title: "主表字段2", dataIndex: "platform", key: "platform" },
      { title: "主表字段3", dataIndex: "version", key: "version" },
      { title: "主表字段4", dataIndex: "upgradeNum", key: "upgradeNum" },
      { title: "主表字段5", dataIndex: "creator", key: "creator" },
      { title: "主表字段6", dataIndex: "createdAt", key: "createdAt" },
    ],
    columns2: [

      { title: "子表格字段1", dataIndex: "resourceID", key: "resourceID" },
      { title: "子表格字段2", dataIndex: "version", key: "version" },

    ],
    data2: [{
      key: 'id',
      name: "sdsd",
      platform: "iOS",
      version: "10.3.4.5654",
      upgradeNum: 500,
      creator: "Jack",
      createdAt: "2014-12-24 23:12:00"
    }, {
      key: 'id2',
      name: "测试自数据2",
      platform: "iOS2",
      version: "210.3.4.5654",
      upgradeNum: 500,
      creator: "J2ack",
      createdAt: "22014-12-24 23:12:00"
    }],
    data3: [{
      data: [{
        key: 'id',
        name: "sdsd",
        platform: "iOS",
        version: "10.3.4.5654",
        upgradeNum: 500,
        creator: "Jack",
        createdAt: "2014-12-24 23:12:00"
      }, {
        key: 'id',
        name: "测试自数据2",
        platform: "iOS2",
        version: "210.3.4.5654",
        upgradeNum: 500,
        creator: "J2ack",
        createdAt: "22014-12-24 23:12:00"
      }]
    }, {
      data2: [{
        key: 'id',
        name: "sdsd111111111111",
        platform: "iOS",
        version: "10.3.4.5654",
        upgradeNum: 500,
        creator: "Jack",
        createdAt: "2014-12-24 23:12:00"
      }, {
        key: 'id',
        name: "测试自数据2",
        platform: "iOS2",
        version: "210.3.4.5654",
        upgradeNum: 500,
        creator: "J2ack",
        createdAt: "22014-12-24 23:12:00"
      }]
    }],
    data: [{
      key: 'id',
      name: "Screem",
      platform: "iOS",
      version: "10.3.4.5654",
      upgradeNum: 500,
      creator: "Jack",
      createdAt: "2014-12-24 23:12:00",
      data: [{
        resourceID: "8a8f7e93680da30401680e07d4e202b0",
        version: "1.0.0.3",
        createTime: "2019-01-02 18:07:00",
        "deployTime": "2019-01-02 18:07:52",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }, {
        resourceID: "8a8f7e93680da30401680dc8f7f201a0",
        version: "1.0.0.2",
        "createTime": "2019-01-02 16:58:21",
        "deployTime": "2019-01-02 18:03:35",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }, {
        "resourceID": "8a8f7e93680da30401680dc23fef0175",
        "version": "1.0.0.1",
        "createTime": "2019-01-02 16:51:00",
        "deployTime": "2019-01-02 16:52:07",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }, {
        "resourceID": "8a8f7e93680da30401680db93a82010e",
        "version": "1.0.0.0",
        "createTime": "2019-01-02 16:41:09",
        "deployTime": "2019-01-02 16:41:14",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }]
    }, {
      key: 2,
      name: "Screem",
      platform: "iOS",
      version: "10.3.4.5654",
      upgradeNum: 500,
      creator: "Jack",
      createdAt: "2014-12-24 23:12:00", data: [{
        resourceID: "8a8f7e93680da30401680e07d4e202b0",
        version: "1.0.0.3",
        createTime: "2019-01-02 18:07:00",
        "deployTime": "2019-01-02 18:07:52",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }, {
        resourceID: "8a8f7e93680da30401680dc8f7f201a0",
        version: "1.0.0.2",
        "createTime": "2019-01-02 16:58:21",
        "deployTime": "2019-01-02 18:03:35",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }, {
        "resourceID": "8a8f7e93680da30401680dc23fef0175",
        "version": "1.0.0.1",
        "createTime": "2019-01-02 16:51:00",
        "deployTime": "2019-01-02 16:52:07",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }, {
        "resourceID": "8a8f7e93680da30401680db93a82010e",
        "version": "1.0.0.0",
        "createTime": "2019-01-02 16:41:09",
        "deployTime": "2019-01-02 16:41:14",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }]
    }, {
      key: 3,
      name: "Screem",
      platform: "iOS",
      version: "10.3.4.5654",
      upgradeNum: 500,
      creator: "Jack",
      createdAt: "2014-12-24 23:12:00", data: [{
        resourceID: "8a8f7e93680da30401680e07d4e202b0",
        version: "1.0.0.3",
        createTime: "2019-01-02 18:07:00",
        "deployTime": "2019-01-02 18:07:52",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }, {
        resourceID: "8a8f7e93680da30401680dc8f7f201a0",
        version: "1.0.0.2",
        "createTime": "2019-01-02 16:58:21",
        "deployTime": "2019-01-02 18:03:35",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }, {
        "resourceID": "8a8f7e93680da30401680dc23fef0175",
        "version": "1.0.0.1",
        "createTime": "2019-01-02 16:51:00",
        "deployTime": "2019-01-02 16:52:07",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }, {
        "resourceID": "8a8f7e93680da30401680db93a82010e",
        "version": "1.0.0.0",
        "createTime": "2019-01-02 16:41:09",
        "deployTime": "2019-01-02 16:41:14",
        "templateState": "DEPLOYED",
        "editable": true,
        "isSubOrg": false,
        "isDeleted": false
      }]
    }]
  },
  subscriptions: {

  },
  effects: {
    *getLinkFormList(action, { select, call, put }) {
      let { payload: { ...other } } = action;
      const { data } = yield call(save, { ...other });
      yield put({
        type: 'tabItemsInit',
        linkFormList: data.formTemplateVersionList,
      })
    },

  },
  reducers: {
    tabItemsInit(state, action) {
      let { linkFormList } = action;
      let { columns } = state;
      columns = linkFormList;
      return { ...state, columns }
    },
  },
};