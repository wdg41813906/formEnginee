import com from '../../utils/com'
import queryString from 'query-string';
import update from 'immutability-helper';
import {parse} from 'qs';
import {message} from 'antd'
import pathToRegexp from 'path-to-regexp'
import {DragSourceLiftList, CombinedData, SearchText} from '../../services/DataCharts/DataCharts';
import {GetTable} from './../../services/Dashboard/Ledger/LedgerIndex'

export default {
    namespace: 'dataCharts',
    state: {
        CList: [
            {id: 'dimensionX', title: '维度', filter: false},
            {id: 'indicators', title: '指标', filter: false},
            {id: 'filterCondition', title: '过滤条件', filter: true}
        ],
        AList: [
            {id: 'dimensionX', title: '维度（行）', filter: false},
            {id: 'dimensionY', title: '维度（列）', filter: false},
            {id: 'indicators', title: '指标', filter: false},
            {id: 'filterCondition', title: '过滤条件', filter: true},
        ],
        strName: ['求和', '平均值', '最大值', '最小值', '计数'],
        DatestrName: ['年', '年-季', '年-月', '年-周', '年-月-日'],
        ChangeDataTable: {},//切换数据源 数据
        all: {
            //DragSource
            //DragItem: [],
            //DropOptions: {}
            //ChartsType: '',
        }
    },
    subscriptions: {
        //消息订阅
        setup({dispatch, history}) {
            history.listen((location) => {
                const match = pathToRegexp('/main/dataCharts').exec(location.pathname);
                if (match) {
                    const id = match[1];

                }
            });
        },
    },
    effects: {
        * initLeftData(action, {select, call, put}) {
            const DragSourceLiftListDetail = yield call(DragSourceLiftList, {
                entityId: action.payload.templateId
            });
            yield put({
                type: 'InitDragSource',
                payload: {
                    DragSourceLiftListDetail: DragSourceLiftListDetail.data,
                    ChartsId: action.payload.ChartsId
                }
            })

        },
        * ChartsData(action, {select, call, put}) {
            const ChartsData = yield call(CombinedData, parse(action.payload))
            if (ChartsData.data.table.length === 0) {
                message.warning('暂无符合条件的数据！请修改筛选条件。');
            }
            yield put({
                type: 'InitDropTargetDetail',
                payload: {
                    CombinedData: ChartsData.data.table,//JSON.parse(JSON.stringify(table).replace(/_Measures/g, "")),
                    ChartsId: action.ChartsId
                }
            })
        },
        * SingleText(action, {select, call, put}) {
            const SingleText = yield call(SearchText, parse(action.payload));
            action.options.ChildList = SingleText.data;
            yield put({
                type: 'endDragItem',
                payload: {
                    ...action.options,
                    ChartsId: action.ChartsId
                }
            })
            yield put({
                type: 'setFilNewData',
                payload: {
                    ...action.options,
                    ChartsId: action.ChartsId,
                    FilterVisible: true
                }
            })
        },
        * ChangeDataTable(action, {select, call, put}) {
            const ChangeData = yield call(GetTable, {
                pageIndex: action.payload.pageIndex,
                pageSize: action.payload.pageSize
            });
            yield put({
                type: "InitTable",
                payload: {
                    ChartsId: action.payload.ChartsId,
                    data: ChangeData.data,
                }
            })
        },
        * getData(action, {select, call, put}) {
            action = action.payload
            if (action.engineeConfig && Object.keys(action.engineeConfig).length > 2) {
                yield put({
                    type: 'InitBeforeData',
                    payload: {
                        engineeConfig: action.engineeConfig,
                        config: action.Config
                    }
                })
            } else {
                const DragSourceLiftListDetail = yield call(DragSourceLiftList, {
                    entityId: action.templateId
                });
                yield put({
                    type: 'InitDragSource',
                    payload: {
                        DragSourceLiftListDetail: DragSourceLiftListDetail.data,
                        ChartsId: action.tabId
                    }
                })
            }
            // yield put({
            //     type: 'updateConfig',
            //     payload: {
            //         ChartsId:action.tabId,
            //         config: action.Config
            //     }
            // })
        },
        * saveData(action, {select, call, put}) {
            action = action.payload
            yield put({
                type: 'ledgerIndex/EngineeSave',
                payload: {
                    ...action
                }
            })
        },
    },
    reducers: {
        //切换数据源 重置所有设置
        AllInit(state, action) {
            action = action.payload
            let {all} = state
            all = update(all, {
                [action.ChartsId]: {
                    $apply: function () {
                        return action
                    }
                }
            });
            return {...state, all}
        },
        //上一个页面传递的数据
        InitBeforeData(state, action) {
            action = action.payload
            let {all} = state
            all = update(all, {
                [action.engineeConfig.ChartsId]: {
                    $apply: function () {
                        return Object.assign(action.engineeConfig, {config: action.config})
                    }
                }
            });
            return {...state, all}
        },
        InitTable(state, action) {
            let {ChangeDataTable} = state
            ChangeDataTable = update(ChangeDataTable, {
                $apply: function () {
                    return action.payload.data
                }
            })
            return {...state, ChangeDataTable}
        },
        InitDragSource(state, action) {
            action = action.payload
            let {all} = state
            all = update(all, {
                [action.ChartsId]: {
                    DragSource: {
                        $apply: function () {
                            return action.DragSourceLiftListDetail
                        }
                    }
                }
            });
            //设置图表标题
            all = update(all, {
                [action.ChartsId]: {
                    ChartsTitle: {
                        $apply: function () {
                            return action.DragSourceLiftListDetail.name
                        }
                    }
                }
            })


            // all = update(all, {
            //     [action.ChartsId]: {
            //         config: {
            //             $apply: function () {
            //                 return action.config
            //             }
            //         }
            //     }
            // })
            return {...state, all}
        },
        InitDropTargetDetail(state, action) {
            action = action.payload
            let {all} = state
            all = update(all, {
                [action.ChartsId]: {
                    ChartsData: {
                        $apply: function () {
                            return action.CombinedData
                        }
                    }
                }
            })
            return {...state, all}
        },
        SetChartTypes(state, action) {
            action = action.payload
            let {all} = state
            all = update(all, {
                [action.ChartsId]: {
                    ChartsTypes: {
                        $apply: function () {
                            return action.ChartsTypes
                        }
                    }
                }
            })
            return {...state, all}
        },
        StartDragItem(state, action) {
            action = action.payload
            let {all} = state;
            all = update(all, {
                [action.ChartsId]: {
                    IsDragging: {
                        $apply: function () {
                            return action.IsDragging
                        }
                    }
                }
            })
            all = update(all, {
                [action.ChartsId]: {
                    IsDraggingType: {
                        $apply: function () {
                            return action.IsDraggingType
                        }
                    }
                }
            })

            return {...state, all}
        },
        endDragItem(state, action) {
            action = action.payload
            let {all} = state
            let Data = {}

            //Table 维度互相拖拽 删除拖拽源
            if (action.ChangeDrag) {
                let DragItem = all[action.ChartsId].DragItem
                DragItem.map((item, index) => {
                    if (item.ContainerId === 'dimensionY' || item.ContainerId === 'dimensionX') {
                        all = update(all, {
                            [action.ChartsId]: {
                                DragItem: {
                                    $apply: function () {
                                        return DragItem.filter((item) => {
                                            return item.DragItemId !== action.DragItemId
                                        })
                                    }
                                }
                            }
                        })
                    }
                })
            }

            if (action.Filter) {
                Data = {
                    ContainerId: action.ContainerId,//接受拖拽字段的容器Id
                    DragItemId: action.DragItemId,//拖动之后的字段Id
                    Name: action.Name,//原始名
                    NewName: null,//重命名
                    Code: action.Code,//字段对应的Code
                    formType: action.formType,//字段对应的表
                    ControlType: action.ControlType,//字段类型
                    ShowEditName: false,//修改名称显示框
                    Filter: action.Filter,//是否 筛选条件
                    Fillist: action.Fillist,//筛选的条件
                    ChildList: action.ChildList//SingleText筛选条件选择//
                }
            } else {
                Data = {
                    ContainerId: action.ContainerId,//接受拖拽字段的容器Id
                    DragItemId: action.DragItemId,//拖动之后的字段Id
                    Name: action.Name,//原始名
                    NewName: null,//重命名
                    Code: action.Code,//字段对应的Code
                    formType: action.formType,//字段对应的表
                    ControlType: action.ControlType,//字段类型
                    CheckKey: action.Filter ? null : action.CheckKey,// (action.ControlType === 'SingleText' ? [] : action.CheckKey),//默认下拉菜单的选中项
                    ShowEditName: false,//修改名称显示框
                    Filter: action.Filter//是否 筛选条件
                }
            }

            if (action.ContainerId === "indicators") {
                Data.DataFormat = action.DataFormat
            }

            all = update(all, {
                [action.ChartsId]: {
                    DragItem: {
                        $push: [
                            Data
                        ]
                    }
                }
            });
            return {...state, all}
        },
        // //拖拽的时候交换顺序
        // DragExchangeSort(state, action) {
        //     action = action.payload;
        //     let {all} = state;
        //     let PlaceItemIndex;
        //     let DragItemIndex;
        //     let DragItem = all[action.ChartsId].DragItem;
        //     DragItem.map(item => {
        //         PlaceItemIndex = DragItem.findIndex(val => {
        //             return val.DragItemId === action.PlaceItem.DragItemId
        //         })
        //         DragItemIndex = DragItem.findIndex(val => {
        //             return val.DragItemId === action.DragItem.DragItemId
        //         })
        //     })
        //     //重置跨域排序target值
        //     all = update(all, {
        //         [action.ChartsId]: {
        //             DragTarget: {
        //                 $apply: function () {
        //                     return {}
        //                 }
        //             }
        //         }
        //     })
        //
        //     all = update(all, {
        //         [action.ChartsId]: {
        //             DragItem: {
        //                 $splice: [
        //                     [PlaceItemIndex < 0 ? DragItem.length : PlaceItemIndex, 0, action.DragItem]
        //                 ]
        //             }
        //         }
        //     });
        //
        //     all = update(all, {
        //         [action.ChartsId]: {
        //             DragItem: {
        //                 $splice: [
        //                     [DragItemIndex, 1]
        //                 ]
        //             }
        //         }
        //     });
        //     return {...state, all}
        // },

        //当前容器拖拽交换顺序
        ExchangeSort(state, action) {
            action = action.payload;
            let {all} = state;
            let PlaceItemIndex;
            let DragItemIndex;
            let DragItem = all[action.ChartsId].DragItem;
            DragItem.map(item => {
                PlaceItemIndex = DragItem.findIndex(val => {
                    return val.DragItemId === action.PlaceItem.DragItemId
                })
                DragItemIndex = DragItem.findIndex(val => {
                    return val.DragItemId === action.DragItem.DragItemId
                })
            })
            all = update(all, {
                [action.ChartsId]: {
                    DragItem: {
                        $splice: [
                            [DragItemIndex, 1]
                        ]
                    }
                }
            });
            all = update(all, {
                [action.ChartsId]: {
                    DragItem: {
                        $splice: [
                            [PlaceItemIndex, 0, action.DragItem]
                        ]
                    }
                }
            });
            return {...state, all}
        },
        //删除字段
        DeleteChildItem(state, action) {
            action = action.payload
            let {all} = state
            let DragItem = all[action.ChartsId].DragItem
            let setSort = all[action.ChartsId].setSort
            //当删除字段为最新排序字段时
            if (setSort.DragItemId === action.DragItemId && setSort.ContainerId === action.ContainerId) {
                console.log('这里报错啦!!!!,因为唯一的排序字段(排序字段只能有一个)被你删除了.....')
            }
            //删除字段
            all = update(all, {
                [action.ChartsId]: {
                    DragItem: {
                        $apply: function () {
                            return DragItem.filter((item) => {
                                return item.DragItemId !== action.DragItemId || item.ContainerId !== action.ContainerId
                            })
                        }
                    }
                }
            })
            return {...state, all}
        },
        ChartChange(state, action) {
            action = action.payload
            let {all} = state
            if (action.ChartsType === 'Table') {
            } else {
                all[action.ChartsId].DragItem.map(item => {
                    if (item.ContainerId === 'dimensionY') {
                        item.ContainerId = 'dimensionX'
                    }
                })
            }
            all = update(all, {
                [action.ChartsId]: {
                    ChartsType: {
                        $apply: function () {
                            return action.ChartsType
                        }
                    }
                }
            });
            all = update(all, {
                [action.ChartsId]: {
                    DataPermission: {
                        $apply: function () {
                            return []
                        }
                    }
                }
            });
            return {...state, all}
        },
        //汇总方式 汇总结果 排序 子选项选择
        CheckChild(state, action) {
            action = action.payload
            let {all} = state;
            all[action.ChartsId].DragItem.map((item, index) => {
                if (item.ContainerId === action.ContainerId && item.DragItemId === action.DragItemId) {
                    all = update(all, {
                        [action.ChartsId]: {
                            DragItem: {
                                [index]: {
                                    $merge: {
                                        CheckKey: [
                                            action.CheckType === 'SumMode' ? action.CheckKey : all[action.ChartsId].DragItem[index].CheckKey[0],
                                            action.CheckType === 'SumResult' ? action.CheckKey : all[action.ChartsId].DragItem[index].CheckKey[1],
                                            action.CheckType === 'Sort' ? action.CheckKey : all[action.ChartsId].DragItem[index].CheckKey[2]
                                        ]
                                    }
                                }
                            }
                        }
                    });
                }
            })

            return {...state, all}
        },
        //数据格式保存
        SaveSet(state, action) {
            action = action.payload
            let {all} = state
            return {...state}
        },
        //字段重命名
        EditName(state, action) {
            action = action.payload
            let {all} = state
            all[action.ChartsId].DragItem.map((item, index) => {
                if (item.ContainerId === action.ContainerId && item.DragItemId === action.DragItemId) {
                    all = update(all, {
                        [action.ChartsId]: {
                            DragItem: {
                                [index]: {
                                    ShowEditName: {
                                        $apply: function () {
                                            return !all[action.ChartsId].DragItem[index].ShowEditName
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            })
            return {...state, all}
        },
        //重名确定
        OnHandOk(state, action) {
            action = action.payload
            let {all} = state
            all[action.ChartsId].DragItem.map((item, index) => {
                if (item.ContainerId === action.ContainerId && item.DragItemId === action.DragItemId) {
                    all = update(all, {
                        [action.ChartsId]: {
                            DragItem: {
                                [index]: {
                                    NewName: {
                                        $apply: function () {
                                            return action.NewName
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            })
            return {...state, all}
        },
        // setFilterVisible(state, action) {//隐藏显示框状态值
        //     action = action.payload
        //     let {all} = state
        //     all = update(all, {
        //         [action.ChartsId]: {
        //             FilterVisible: {
        //                 $apply: function () {
        //                     return action.FilterVisible
        //                 }
        //             }
        //         }
        //     })
        //     return {...state, all}
        // },
        setFilNewData(state, action) {
            action = action.payload
            let {all} = state
            let setFilNewData = all[action.ChartsId].DragItem.filter((item, index) => {
                if (item.ContainerId === action.ContainerId && action.DragItemId === item.DragItemId) {
                    return item
                }
            })
            if (action.FilterVisible !== undefined) {//更新隐藏显示框状态值
                all = update(all, {
                    [action.ChartsId]: {
                        FilterVisible: {
                            $apply: function () {
                                return action.FilterVisible
                            }
                        }
                    }
                })
            }

            all = update(all, {
                [action.ChartsId]: {
                    setFilNewData: {
                        $apply: function () {
                            return setFilNewData[0]
                        }
                    }
                }
            })
            return {...state, all}
        },
        //单个保存
        // setOnSelect(state, action) {
        //     let changemode = ''
        //     if (action.actiontype === 0) {
        //         changemode = 'Firstoption'
        //     }
        //     if (action.actiontype === 1) {
        //         changemode = 'Secondoption'
        //     }
        //     if (action.actiontype === 2) {
        //         changemode = 'Thirdoption'
        //     }
        //     let {all} = state
        //     all[action.ChartsId].DragItem.map((item, index) => {
        //         if (action.ContainerId === item.ContainerId && action.DragItemId === item.DragItemId) {
        //             all = update(all, {
        //                 [action.ChartsId]: {
        //                     DragItem: {
        //                         [index]: {
        //                             Fillist: {
        //                                 [action.actiontype]: {
        //                                     [changemode]: {
        //                                         $apply: function () {
        //                                             return action.value
        //                                         }
        //                                     }
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             })
        //         }
        //     })
        //     return {...state, all}
        // },
        // 整体保存筛选字段属性值
        setFilterOptions(state, action) {
            action = action.payload
            let {all} = state
            all[action.ChartsId].DragItem.map((item, index) => {
                if (action.ContainerId === item.ContainerId && action.DragItemId === item.DragItemId) {
                    all = update(all, {
                        [action.ChartsId]: {
                            DragItem: {
                                [index]: {
                                    Fillist: {
                                        $apply: function () {
                                            return action.Fillist
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
            })
            return {...state, all}
        },
        setSortOption(state, action) {
            action = action.payload
            let {all} = state
            all[action.ChartsId].DragItem.map((item, index) => {
                if (action.ContainerId !== item.ContainerId || action.DragItemId !== item.DragItemId) {
                    all = update(all, {
                        [action.ChartsId]: {
                            DragItem: {
                                [index]: {
                                    $merge: {
                                        CheckKey: [
                                            action.CheckType === 'SumMode' ? action.CheckKey : all[action.ChartsId].DragItem[index].CheckKey[0],
                                            action.CheckType === 'SumResult' ? action.CheckKey : all[action.ChartsId].DragItem[index].CheckKey[1],
                                            '11'//重置其他排序字段
                                        ]
                                    }
                                }
                            }
                        }
                    });
                }
            })

            all = update(all, {
                [action.ChartsId]: {
                    setSort: {
                        $apply: function () {
                            return action
                        }
                    }
                }
            })
            return {...state, all}
        },
        delSortOption(state, action) {
            action = action.payload
            let {all} = state
            let setSort = all[action.ChartsId].setSort
            //当删除字段为最新排序字段时 重置setSort的属性
            if (setSort.DragItemId === action.DragItemId && setSort.ContainerId === action.ContainerId) {
                all = update(all, {
                    [action.ChartsId]: {
                        setSort: {
                            $apply: function () {
                                return {}
                            }
                        }
                    }
                })
            }
            return {...state, all}
        },
        // 拖拽位置提醒
        // TipBorder(state, action) {
        //     action = action.payload;
        //     let {all} = state
        //     all = update(all, {
        //         [action.ChartsId]: {
        //             TipBorder: {
        //                 $apply: function () {
        //                     return false
        //                 }
        //             }
        //         }
        //     })
        //     return {...state, all}
        // },
        //跨域拖拽排序
        CrossDragSort(state, action) {
            action = action.payload;
            let {all} = state
            let DragItem = all[action.ChartsId].DragItem
            let CrossDragItem = DragItem.filter(t => {
                return t.ContainerId === action.ContainerId && t.DragItemId === action.DragItemId

            })
            // 只是提醒
            // all = update(all, {
            //     [action.ChartsId]: {
            //         TipBorder: {
            //             $apply: function () {
            //                 return true
            //             }
            //         }
            //     }
            // })
            all = update(all, {
                [action.ChartsId]: {
                    DragTarget: {
                        $apply: function () {
                            return CrossDragItem[0]
                        }
                    }
                }
            })
            return {...state, all}
        },
        onChangeCheck(state, action) {
            action = action.payload;
            let {all} = state
            all = update(all, {
                [action.ChartsId]: {
                    DataPermission: {
                        $apply: function () {
                            return action.data
                        }
                    }
                }
            })
            return {...state, all}
        },
        onShowCount(state, action) {
            action = action.payload;
            let {all} = state

            all = update(all, {
                [action.ChartsId]: {
                    ShowCount: {
                        $apply: function () {
                            return action.data
                        }
                    }
                }
            })
            return {...state, all}
        },
        //修改名称
        editChartsTitle(state, action) {
            action = action.payload;
            let {all} = state
            all = update(all, {
                [action.ChartsId]: {
                    ChartsTitle: {
                        $apply: function () {
                            return action.value
                        }
                    }
                }
            })
            return {...state, all}
        }
    }
}
