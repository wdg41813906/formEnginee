import { browserHistory } from 'dva/router'
import { query } from '../../services/Main/Main'
import queryString from 'query-string';
import { notification, message } from 'antd';
import com from '../../utils/com'
import Welcome from '../../routes/Welcome/Welcome'
import update from 'immutability-helper';
import Immutable from "immutable";
import { getSetting, saveSetting } from '../../utils/com'
import { defaultSettings } from '../../defaultSettings'
import _ from 'underscore';

// console.log(getSetting())
export default {
    namespace: 'appMain',
    state: {
        collapsed: false,
        setting: false,//Setting
        theme: getSetting().theme,
        locale: getSetting().locale,
        MainColor: getSetting().MainColor,
        colorWeak: getSetting().colorWeak,
        user: {
            name: "lzn"
        },
        bread: [],
        menu: [],
        panes: [{ key: 'welcome', title: '欢迎', link: '/welcome', closeable: false, component: Welcome }],
        activeKey: "welcome",
        tabItems: null
    },
    subscriptions: {
        initMenu({ dispatch }) {
            //     window.less
            //     .modifyVars(
            //       {
            //         '@primary-color': getSetting().MainColor,
            //         '@link-color': getSetting().MainColor,
            //         '@btn-primary-bg': getSetting().MainColor,
            //       }
            //     )
            dispatch({
                type: "QueryMenu"
            })
        }
    },
    effects: {
        * QueryMenu({ payload }, { put, call }) {
            const data = {
                "trees":
                    [
                        // {
                        //     "id": 1, "parentId": 0, "key": "appstore", "name": "人事管理", "icon": "team",
                        //     "children": [
                        //         { "id": 2, "parentId": 1, "key": "user", "name": "学生", "icon": "smile", "children": [] },
                        //         { "id": 3, "parentId": 1, "key": "tea", "name": "教师", "icon": "user", "children": [] },
                        //         { "id": 10, "parentId": 1, "key": "role", "name": "角色", "icon": "team", "children": [] }
                        //     ]
                        // },
                        {
                            "id": 4, "parentId": 0, "key": "base", "name": "基础设置", "icon": "setting",
                            "children": [
                                { "id": 5, "parentId": 4, "key": "func", "name": "功能模块", "icon": "star", "children": [] },
                                { "id": 6, "parentId": 4, "key": "dic", "name": "字典", "icon": "eye", "children": [] },
                                {
                                    "id": 11,
                                    "parentId": 4,
                                    "key": "formList",
                                    "name": "表单管理",
                                    "icon": "eye",
                                    "children": []
                                },
                                {
                                    "id": 12,
                                    "parentId": 4,
                                    "key": "ledger",
                                    "name": "仪表盘",
                                    "icon": "eye",
                                    "children": []
                                },
                                //  { "id": 15, "parentId": 4, "key": "ledger/ledgerIndex", "name": "仪表盘设计", "icon": "eye", "children": [] },

                                {
                                    "id": 13,
                                    "parentId": 4,
                                    "key": "dataManage",
                                    "name": "数据管理",
                                    "icon": "eye",
                                    "children": []
                                },
                                //{ "id": 14, "parentId": 4, "key": "ledgerIndex/dataCharts", "name": "图表", "icon": "eye", "children": [] },
                                {
                                    "id": 14,
                                    "parentId": 4,
                                    "key": "bookAddress",
                                    "name": "通讯录",
                                    "icon": "eye",
                                    "children": []
                                },
                                {
                                    "id": 16,
                                    "parentId": 4,
                                    "key": "appCateGory",
                                    "name": "应用类型",
                                    "icon": "eye",
                                    "children": []
                                },
                                {
                                    "id": 17,
                                    "parentId": 4,
                                    "key": "appStore",
                                    "name": "应用中心",
                                    "icon": "eye",
                                    "children": []
                                },
                                {
                                    "id": 18,
                                    "parentId": 4,
                                    "key": "application",
                                    "name": "应用管理",
                                    "icon": "eye",
                                    "children": []
                                },
                                {
                                    "id": 21,
                                    "parentId": 4,
                                    "key": "formViewList",
                                    "name": "新表单列表",
                                    "icon": "eye",
                                    "children": []
                                },
                                {
                                    "id": 25,
                                    "parentId": 4,
                                    "key": "webHook",
                                    "name": "第三方系统",
                                    "icon": "eye",
                                    "children": []
                                },
                                {
                                    "id": 22,
                                    "parentId": 4,
                                    "key": "accountBook",
                                    "name": "台帐",
                                    "icon": "eye",
                                    "children": []
                                },
                                {
                                    "id": 23,
                                    "parentId": 4,
                                    "key": "dataAuthority",
                                    "name": "数据权限",
                                    "icon": "eye",
                                    "children": []
                                },
                                {
                                    "id": 24,
                                    "parentId": 4,
                                    "key": "dataAuthorityNew",
                                    "name": "新数据权限",
                                    "icon": "eye",
                                    "children": []
                                },
                            ]
                        }
                        // ,
                        // {
                        //     "id": 7, "parentId": 0, "key": "application", "name": "微应用", "icon": "filter",
                        //     "children": [
                        //         {
                        //             "id": 8, "parentId": 7, "key": "meetMange", "name": "会议管理", "icon": "key",
                        //             "children": [
                        //                 { "id": 9, "parentId": 8, "key": "meeting", "name": "会议报名", "icon": "flag", "children": [] }
                        //             ]
                        //         },
                        //         { "id": 1, "parentId": 4, "key": "tableNesting", "name": "表格展示", "icon": "eye", "children": [] }]
                        // },
                    ],
                "bread": [
                    { "id": 1, "parentId": 0, "key": "appstore", "name": "人事管理", "icon": "team", "parent": [] },
                    {
                        "id": 2,
                        "parentId": 1,
                        "key": "user",
                        "name": "学生",
                        "icon": "smile",
                        "parent": [{
                            "id": 1,
                            "parentId": 0,
                            "key": "appstore",
                            "name": "人事管理",
                            "icon": "team",
                            "parent": null
                        }]
                    },
                    {
                        "id": 3,
                        "parentId": 1,
                        "key": "tea",
                        "name": "教师",
                        "icon": "user",
                        "parent": [{
                            "id": 1,
                            "parentId": 0,
                            "key": "appstore",
                            "name": "人事管理",
                            "icon": "team",
                            "parent": null
                        }]
                    },
                    {
                        "id": 10,
                        "parentId": 1,
                        "key": "role",
                        "name": "角色",
                        "icon": "team",
                        "parent": [{
                            "id": 1,
                            "parentId": 0,
                            "key": "appstore",
                            "name": "人事管理",
                            "icon": "team",
                            "parent": null
                        }]
                    },
                    { "id": 4, "parentId": 0, "key": "base", "name": "基础设置", "icon": "setting", "parent": [] },
                    {
                        "id": 5,
                        "parentId": 4,
                        "key": "func",
                        "name": "功能模块",
                        "icon": "star",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 6,
                        "parentId": 4,
                        "key": "dic",
                        "name": "字典",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    // {
                    //     "id": 6,
                    //     "parentId": 4,
                    //     "key": "dic/default",
                    //     "name": "字典",
                    //     "icon": "eye",
                    //     "parent": [{
                    //         "id": 4,
                    //         "parentId": 0,
                    //         "key": "base",
                    //         "name": "基础设置",
                    //         "icon": "setting",
                    //         "parent": null
                    //     }]
                    // },
                    // {
                    //     "id": 6,
                    //     "parentId": 4,
                    //     "key": "dic/small",
                    //     "name": "字典",
                    //     "icon": "eye",
                    //     "parent": [{
                    //         "id": 4,
                    //         "parentId": 0,
                    //         "key": "base",
                    //         "name": "基础设置",
                    //         "icon": "setting",
                    //         "parent": null
                    //     }]
                    // },
                    {
                        "id": 11,
                        "parentId": 4,
                        "key": "formList",
                        "name": "表单管理",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 17,
                        "parentId": 4,
                        "key": "show",
                        "name": "表单提交",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },

                    {
                        "id": 12,
                        "parentId": 4,
                        "key": "ledger",
                        "name": "仪表盘",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 16,
                        "parentId": 4,
                        "key": "ledger/ledgerIndex",
                        "name": "仪表盘设计",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },


                    {
                        "id": 13,
                        "parentId": 4,
                        "key": "dataManage",
                        "name": "数据管理",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 14,
                        "parentId": 4,
                        "key": "dataCharts",
                        "name": "图表",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },

                    {
                        "id": 8,
                        "parentId": 7,
                        "key": "meetMange",
                        "name": "会议管理",
                        "icon": "key",
                        "parent": [{
                            "id": 7,
                            "parentId": 0,
                            "key": "application",
                            "name": "微应用",
                            "icon": "filter",
                            "parent": null
                        }]
                    },
                    {
                        "id": 21,
                        "parentId": 7,
                        "key": "tableNesting",
                        "name": "表格展示",
                        "icon": "key",
                        "parent": [{
                            "id": 7,
                            "parentId": 0,
                            "key": "application",
                            "name": "微应用",
                            "icon": "filter",
                            "parent": null
                        }]
                    },

                    {
                        "id": 15,
                        "parentId": 4,
                        "key": "bookAddress",
                        "name": "通讯录",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 16,
                        "parentId": 4,
                        "key": "appCateGory",
                        "name": "应用类型",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 17,
                        "parentId": 4,
                        "key": "appStore",
                        "name": "应用中心",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 18,
                        "parentId": 4,
                        "key": "application",
                        "name": "应用管理",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 19,
                        "parentId": 4,
                        "key": "application/create",
                        "name": "新增应用",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 20,
                        "parentId": 4,
                        "key": "application/detail",
                        "name": "应用详情",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 21,
                        "parentId": 4,
                        "key": "formViewList",
                        "name": "新表单列表",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 22,
                        "parentId": 4,
                        "key": "accountBook",
                        "name": "台帐",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 23,
                        "parentId": 4,
                        "key": "dataAuthority",
                        "name": "数据权限",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 24,
                        "parentId": 4,
                        "key": "dataAuthorityNew",
                        "name": "新数据权限",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 25,
                        "parentId": 4,
                        "key": "formViewList/dataSource",
                        "name": "数据源",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                    {
                        "id": 26,
                        "parentId": 4,
                        "key": "webHook",
                        "name": "第三方系统",
                        "icon": "eye",
                        "parent": [{
                            "id": 4,
                            "parentId": 0,
                            "key": "base",
                            "name": "基础设置",
                            "icon": "setting",
                            "parent": null
                        }]
                    },
                ]
            };
            //const { data, err } =yield call(query);
            //console.log("获取数据成功没");
            // console.log(data);
            // console.log(err);
            yield put({
                type: "QuerySuccess",
                payload: data
            })
        },
        * LoginOut({ history }) {
            com.SetCookie('token', '');
            history.push('/');
        },
    },
    reducers: {
        toggleCollapsed: function (state) {//展开左侧
            let newState = update(state, { collapsed: { $set: !state.collapsed } });
            // console.log(newState);
            return newState;
        },
        toggleSetting(state, action) {
            return { ...state, setting: !state.setting };
        },
        changeSetting(state, action) {
            let { key, val } = action;
            let setting = getSetting();

            setting[key] = val;
            saveSetting(setting);
            if (key == 'MainColor') {
                window.less.modifyVars(
                    {
                        '@primary-color': val,
                        '@link-color': val,
                        '@btn-primary-bg': val,
                    }
                )
                    .then(() => {
                        setTimeout(message.loading('正在编译主题！', 0), 1000);
                    })
                    .catch(error => {
                        message.error(`Failed to update theme`);
                    });
            }
            return { ...state, ...setting };
        },
        clearSetting(state, action) {
            let setting = defaultSettings;

            localStorage.removeItem('setting');
            window.less.modifyVars(
                {
                    '@primary-color': defaultSettings.MainColor,
                    '@link-color': defaultSettings.MainColor,
                    '@btn-primary-bg': defaultSettings.MainColor,
                }
            )
                .then(() => {
                    setTimeout(message.loading('正在还原主题！', 0), 1000);
                })
                .catch(error => {
                    message.error(`Failed to update theme`);
                });
            return { ...state, ...setting };
        },
        LoginChangeUser(state, payload) {
            return { ...state }
        },
        QuerySuccess(state, action) {
            return { ...state, menu: action.payload.trees, bread: action.payload.bread }
        },
        removeTab(state, action) {
            const tempPanes = update(state.panes, { $splice: [[action.index, 1]] });
            return { ...state, panes: tempPanes };
        },
        /* 添加panes */
        PanesAdd(state, action) {
            //const tempPanes = update(state.panes, { $push: [action.payload] });
            state.panes.push(action.payload)
            // console.log(tempPanes);
            return { ...state }
        },
        /* 修改 activeKey */
        ChangeActiveKey(state, action) {
            let { panes, bread, tabItems } = state;
            //debugger
            let activeKey = action.payload;
            return { ...state, activeKey: action.payload }
        },
        ChangePanesActiveKey(state, action) {
            let { panes, bread, tabItems } = state;
            //debugger
            let activeKey = action.payload.activeKey;
            let title = action.payload.title;
            panes.forEach(item => {
                if (item.key === state.activeKey) {
                    item.key = activeKey;
                    item.title = title;
                }
            })
            return { ...state, panes: panes, activeKey: activeKey }
        },

        tabItemsInit(state, action) {
            let { tabItems } = action;
            return { ...state, tabItems }
        },
        toOtherLink(state, action) {//新增或者切换TAB
            // `/main/dic/${id}`
            //console.log(action);
            let { panes, bread, tabItems } = state;
            let { key, history, id, param, title, formTemplateId, moduleId, formTemplateType } = action.payload;
            // let param = action.payload.param;
            // let id = param ? param.id : null;
            let mainKey = key.indexOf('/') > 0 ? key.substr(0, key.indexOf('/')) : key;

            let tempLink = `/main/${key}`;
            let only = id ? `${tempLink}?tabId=${id}&formTemplateId=${formTemplateId}&moduleId=${moduleId}&formTemplateType=${formTemplateType}` : tempLink;//检验唯一性
            let realPath = id ? `${only}&${queryString.stringify(param)}` : tempLink;//实际url
            let tempPanes = null;
            // 判断当前的panes是否存在当前的 item
            if (!panes.some((e, i) => {
                return e.only == only
            })) {//新增
                history.push({
                    pathname: tempLink,
                    search: realPath.replace(tempLink, '')
                    // query: {
                    //     id: id,
                    // },
                });
                //判断权限
                let breadItem = bread.filter((item) => {
                    return item.key == mainKey
                });

                if (breadItem.length) {

                    let item = tabItems.filter(a => a.key == breadItem[0].key.split('/')[0])[0];
                    console.log('item', item)
                    panes.push({
                        key: realPath,
                        only: only,
                        title: title ? title : breadItem[0].name,
                        component: item.component,
                        model: item.model,
                        closeable: true
                    });
                    // tempPanes = update(
                    //     panes,
                    //     {
                    //         $push: [{
                    //             key: realPath,
                    //             only: only,
                    //             title: title ? title : breadItem[0].name,
                    //             component: item.component,
                    //             model: item.model,
                    //             closeable: true
                    //         }]
                    //     });
                }
                return { ...state, activeKey: realPath, panes }
            } else {//跳转
                history.push({
                    pathname: tempLink,
                    search: realPath.replace(tempLink, '')
                    // query: {
                    //     id: id,
                    // },
                });
                return { ...state, activeKey: realPath }
            }
        }
    }

}
