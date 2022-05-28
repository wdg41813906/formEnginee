import {Component} from "react"
import ReactDOM from 'react-dom';
import {connect} from 'dva';
import {Row, Col, message, Modal, Button, Icon} from 'antd';
import {Map, List} from 'immutable';
import queryString from 'query-string';
import com from '../../utils/com'
import screenfull from 'screenfull'
import StrDragSource from '../../components/DataCharts/DragSource';
import StrDropTarget from '../../components/DataCharts/DropTarget';
import InitCharts from './InitCharts';
import {CodeAssemble, OrderAssemble, GroupsAssemble, DimensionsAssemble} from './CodeAssemble'
import {CombinedData} from './CombinedData'
import PropertyOption from '../../components/DataCharts/PropertyOptions';
import Chartstyle from './DataCharts.less'
import {Config} from '../../utils/DashboardConfig'

const error = (info) => {
    message.warning(info);
};
message.config({
    top: 50,
    duration: 2
});

class DataCharts extends Component {
    constructor(props) {
        super(props)
        if (this.props.dataCharts.ChartsData.length === 0 && this.props.dataCharts.DragItem.length === 0) {
            this.props.dispatch({
                type: 'dataCharts/initLeftData',
                payload: {
                    templateId: this.props.templateId,
                    ChartsId: this.props.dataCharts.ChartsId
                },
            });
        }
        this.state = {
            canback: props.history.location.pathname === '/dataCharts',
            ChartsId: this.props.dataCharts.ChartsId,
        };
    }

    OpenScreenFull = () => {
        if (screenfull.enabled) {
            screenfull.toggle(this.refs.ScreenFull);
        }
    }

    StartDrag(data, type = null) {
        this.props.dispatch({
            type: 'dataCharts/StartDragItem',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                IsDragging: data,
                IsDraggingType: type
            }
        });
    }

    endDrag = async (data) => {
        //维度 字段名不可重复
        let RepeatStr = []
        let rowId = 'dimensionX'//维度(行)
        let colId = 'dimensionY'//维度(列)
        if (!data) { //字段限制 Number 不能是维度(除Table表格以外)
            return
        }

        //主表与子表 字段限制
        let allData = this.props.dataCharts.DragItem.concat(data)
        let dimension = allData.filter(item => {
            return item.ContainerId === 'dimensionX' || item.ContainerId === 'dimensionY'
        })
        let indicators = allData.filter(item => {
            return item.ContainerId === 'indicators'
        })
        for (let i = 0; i < dimension.length; i++) {
            for (let m = 0; m < indicators.length; m++) {
                if (Number(dimension[i].formType) === 1 && indicators[m].formType === 0) {
                    error('维度含子表单字段时，指标仅支持子表单字段，请调整')
                    return
                }
            }
        }


        if (this.props.dataCharts.ChartsType === 'Table') {
            //其中 列维度与行维度字段名亦不可重复
            if (data.ContainerId === rowId || data.ContainerId === colId) {
                RepeatStr = this.props.dataCharts.DragItem.filter(o => {
                    return (o.ContainerId === rowId || o.ContainerId === colId) && data.DragItemId === o.DragItemId
                })

            } else {
                RepeatStr = this.props.dataCharts.DragItem.filter(item => data.DragItemId === item.DragItemId && data.ContainerId === item.ContainerId)
            }
        } else {

            RepeatStr = this.props.dataCharts.DragItem.filter(item => data.DragItemId === item.DragItemId && data.ContainerId === item.ContainerId)

        }

        if (data.ChangeDrag) {// 判断Table 维度互相拖拽
            await this.endDragItem(data)
            await this.props.dispatch({//设置最新拖拽或点击的筛选字段属性
                type: 'dataCharts/setFilNewData',
                payload: {
                    ChartsId: this.props.dataCharts.ChartsId,
                    ...data
                }
            })
            // await this.DragExchangeSort(data, this.props.dataCharts.DragTarget)

            CombinedData(this.props.dataCharts, this.setDataResult, this.chartChange)
        } else {
            if (RepeatStr.length > 0) {
                error('添加失败！同一字段不能重复添加')
            } else {
                //拖拽放置 条件筛选
                if (data.Filter) {
                    if (data.ControlType === 'SingleText') {
                        // this.setFilterVisible(data, null, null, 0)
                        await this.props.dispatch({
                            type: 'dataCharts/SingleText',
                            ChartsId: this.props.dataCharts.ChartsId,
                            options: data,
                            payload: {
                                "GroupField": data.PrimaryKey, //"fld201812070956752023640938",
                                "fieldName": data.Code,
                                "pageIndex": 1,
                                "pageSize": 6,
                                "searchKey": "",
                                "formType": data.formType,
                                "tableName": this.props.dataCharts.DragSource.table//"UTb201812070956661502655077_view"
                            }
                        })
                    } else {
                        //筛选的其他类型
                        await this.endDragItem(data)
                        await this.props.dispatch({//设置最新拖拽或点击的筛选字段属性
                            type: 'dataCharts/setFilNewData',
                            payload: {
                                ChartsId: this.props.dataCharts.ChartsId,
                                FilterVisible: !this.props.dataCharts.FilterVisible,//true 设置当前筛选条件modal的隐藏与显示
                                ...data
                            }
                        })
                    }
                } else {
                    await this.endDragItem(data)
                    await this.props.dispatch({//设置最新拖拽或点击的筛选字段属性
                        type: 'dataCharts/setFilNewData',
                        payload: {
                            ChartsId: this.props.dataCharts.ChartsId,
                            ...data
                        }
                    })
                    // await this.DragExchangeSort(data, this.props.dataCharts.DragTarget)

                    CombinedData(this.props.dataCharts, this.setDataResult, this.chartChange)
                }
            }
        }
    }

    endDragItem = async (data, o) => {
        await this.props.dispatch({
            type: 'dataCharts/endDragItem',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                ...data,
            }
        })
        this.LimitChart()

    }

    CrossDragSort = (data) => {
        let DragTarget = this.props.dataCharts.DragTarget
        if (data.ContainerId === DragTarget.ContainerId && data.DragItemId === DragTarget.DragItemId) {

        } else {
            this.props.dispatch({
                type: 'dataCharts/CrossDragSort',
                payload: {
                    ChartsId: this.props.dataCharts.ChartsId,
                    ...data,
                }
            })
        }
    }

    // CombinedData(o) {
    //     //拖拽完毕之后 数据筛选
    //     let DragItem = o.DragItem
    //     let CountMode = ['sum', 'avg', 'max', 'min', 'count']
    //     let Dimensions = []
    //     let Measure = []
    //     let Measures = []
    //     let Condition = []
    //     let Groups = []
    //     DragItem.map((item, index) => {
    //         if (item.ContainerId === 'dimensionX' || item.ContainerId === 'dimensionY') {//维度
    //             Dimensions.push(item)
    //             if (item.ControlType === 'DateTime') {
    //                 Groups.push(item)
    //             }
    //         }
    //         if (item.ContainerId === 'indicators') {//指标
    //             Measure.push(item)
    //         }
    //         if (item.ContainerId === 'filterCondition') {//过滤条件
    //             Condition.push(item)
    //         }
    //     })
    //     Measure.map(i => {//指标筛选
    //         if (i.ControlType === 'Number') {
    //             if (i.CheckKey.length > 0) {
    //                 Measures.push(`${CountMode[i.CheckKey[0] - 2]}(${i.Code}) ${i.Code}_Measures`)
    //             }
    //         } else {
    //             Measures.push(`${CountMode[4]}(${i.Code}) ${i.Code}_Measures`)
    //         }
    //     })
    //     //确认维度与指标的数量
    //     let ChartsType = o.ChartsType
    //     if (ChartsType === 'Line' || ChartsType === 'Columnar' || ChartsType === 'Radar' || ChartsType === 'Bar' || ChartsType === 'Area') {
    //         if ((Dimensions.length === 1 && Measure.length > 0) || (Dimensions.length === 2 && Measure.length === 1)) {
    //             this.setDataResult({
    //                 Dimensions: Dimensions,
    //                 Measures: Measures,
    //                 Condition: Condition,
    //                 Groups: Groups
    //             })
    //         } else if (Dimensions.length > 1 && Measure.length > 1) {
    //             this.chartChange('Table')
    //             this.setDataResult({
    //                 Dimensions: Dimensions,
    //                 Measures: Measures,
    //                 Condition: Condition,
    //                 Groups: Groups
    //             })
    //         }
    //     } else if (ChartsType === 'Shape' || ChartsType === 'Number') {
    //         if (Dimensions.length === 1 && Measure.length === 1) {
    //             this.setDataResult({
    //                 Dimensions: Dimensions,
    //                 Measures: Measures,
    //                 Condition: Condition,
    //                 Groups: Groups
    //             })
    //         } else if (Dimensions.length > 1 || Measure.length > 1) {
    //             this.chartChange('Line')
    //             if (Dimensions.length !== 0 && Measure.length !== 0) {
    //                 this.setDataResult({
    //                     Dimensions: Dimensions,
    //                     Measures: Measures,
    //                     Condition: Condition,
    //                     Groups: Groups
    //                 })
    //             }
    //         }
    //     } else if (ChartsType === 'Table') {
    //         if (Dimensions.length > 0 && Measure.length > 0) {
    //             this.setDataResult({
    //                 Dimensions: Dimensions,
    //                 Measures: Measures,
    //                 Condition: Condition,
    //                 Groups: Groups
    //             })
    //         }
    //
    //     }
    // }

    setDataResult = (data, size = 100) => {
        let topSize = size
        if (this.props.dataCharts.DataPermission.find(n => n == 1)) {
            topSize = this.props.dataCharts.ShowCount
        }
        this.props.dispatch({
            type: 'dataCharts/ChartsData',
            ChartsId: this.props.dataCharts.ChartsId,
            //options: o,//暂时还没用到
            payload: {
                Top: topSize,
                FormTemplateCode: this.props.dataCharts.DragSource.table,
                Dimensions: DimensionsAssemble(data.Dimensions),//维度
                Measures: data.Measures,//指标
                Conditions: CodeAssemble(data.Condition),//筛选条件
                Orders: OrderAssemble(this.props.dataCharts.setSort),//排序
                Groups: GroupsAssemble(data.Groups),//日期类维度字段
            }
        })
    }

    setSortOption(o) {
        this.props.dispatch({//保存设置的排序字段
            type: 'dataCharts/setSortOption',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                ...o
            }
        })
    }

    //当前容器拖拽交换顺序
    ExchangeSort = async (d, h) => {
        await this.props.dispatch({//保存设置的排序字段
            type: 'dataCharts/ExchangeSort',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                DragItem: d,
                PlaceItem: h
            }
        })
        CombinedData(this.props.dataCharts, this.setDataResult, this.chartChange)
    }

    //拖拽的时候交换顺序
    DragExchangeSort = async (d, h) => {
        await this.props.dispatch({//保存设置的排序字段
            type: 'dataCharts/DragExchangeSort',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                DragItem: d,
                PlaceItem: h
            }
        })
        CombinedData(this.props.dataCharts, this.setDataResult, this.chartChange)
    }
    // //位置提醒
    // TipBorderFun = () => {
    //     this.props.dispatch({//保存设置的排序字段
    //         type: 'dataCharts/TipBorder',
    //         payload: {
    //             ChartsId: this.props.dataCharts.ChartsId
    //         }
    //     })
    // }

    setFilterVisible(o, val, item, isconfirm) {//数据  筛选条件  第一次请求 确认与取消
        if (this.props.dataCharts.FilterVisible) {
            if (isconfirm) {
                o.Fillist = val//更新选中的筛选条件
            }
            this.props.dispatch({
                type: 'dataCharts/setFilterOptions',
                payload: {
                    ChartsId: this.props.dataCharts.ChartsId,
                    ...o,
                }
            })
            this.props.dispatch({//设置最新拖拽或点击的筛选字段属性
                type: 'dataCharts/setFilNewData',
                payload: {
                    ChartsId: this.props.dataCharts.ChartsId,
                    FilterVisible: !this.props.dataCharts.FilterVisible,//true 设置当前筛选条件modal的隐藏与显示
                    ...o
                }
            })
            if (isconfirm) {
                CombinedData(this.props.dataCharts, this.setDataResult, this.chartChange)
            }
        }
        if (item) {
            this.props.dispatch({//设置最新拖拽或点击的筛选字段属性
                type: 'dataCharts/setFilNewData',
                payload: {
                    ChartsId: this.props.dataCharts.ChartsId,
                    FilterVisible: !this.props.dataCharts.FilterVisible,//true 设置当前筛选条件modal的隐藏与显示
                    ...o
                }
            })
        }

    }


    // componentDidMount() {
    //     if (this.props.dataCharts.ChartsData.length === 0 && this.props.dataCharts.DragItem.length === 0) {
    //         this.props.dispatch({
    //             type: 'dataCharts/initLeftData',
    //             payload: {
    //                 templateId: this.props.templateId,
    //                 ChartsId: this.props.dataCharts.ChartsId
    //             },
    //         });
    //     }
    // }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.dataCharts === undefined)
            return false;
        if (nextProps.dataCharts !== undefined || nextProps.ChangeDataTable !== undefined) {
            if (this.state.ChartsId === nextProps.dataCharts.ChartsId &&
                this.props.dataCharts.ChartsId === nextProps.dataCharts.ChartsId) {
                return this.props !== nextProps;
            }
        }
        return false;
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     debugger
    //     if (this.props === undefined)
    //         return false;
    //     if (nextProps !== undefined) {
    //         if (this.state.ChartsId === nextProps.dataCharts.ChartsId &&
    //             this.props.dataCharts.ChartsId === nextProps.dataCharts.ChartsId)
    //             return this.props !== nextProps;
    //     }
    //     return false;
    // }

    DeleteChild = async (DeleteId) => {
        await this.props.dispatch({
            type: 'dataCharts/DeleteChildItem',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                ...DeleteId
            }
        })
        await this.LimitChart()
        await this.props.dispatch({//删除保存设置的排序字段
            type: 'dataCharts/delSortOption',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                ...DeleteId
            }
        })


        CombinedData(this.props.dataCharts, this.setDataResult, this.chartChange)
    }

    chartChange = async (Type) => {
        if (Type === this.props.ChartsType) {
            return false
        } else {
            await this.props.dispatch({
                type: 'dataCharts/ChartChange',
                payload: {
                    ChartsId: this.props.dataCharts.ChartsId,
                    ChartsType: Type
                }
            });
            //CombinedData(this.props.dataCharts)

        }
    }

    //图表选择限制
    LimitChart = () => {
        //限制图表选择
        let {DragItem} = this.props.dataCharts
        let ChartsTypes = JSON.parse(JSON.stringify(this.props.dataCharts.ChartsTypes))
        let X = DragItem.filter(item => {
            return item.ContainerId === "dimensionX"
        })
        let XY = DragItem.filter(item => {
            return item.ContainerId === "dimensionY"
        })
        let Y = DragItem.filter(item => {
            return item.ContainerId === "indicators"
        })
        ChartsTypes.map(t => {
            if (this.props.dataCharts.ChartsType === 'Table') {
                if ((X.length + XY.length) > 1) {
                    t.isSelect = !(t.ChartsType === 'Shape' || t.ChartsType === 'Quota');
                    if (Y.length > 1) {
                        t.isSelect = t.ChartsType === 'Table';
                    }
                    if ((X.length + XY.length) > 2) {
                        t.isSelect = t.ChartsType === 'Table';
                    }
                } else if (Y.length > 1) {
                    t.isSelect = !(t.ChartsType === 'Shape' || t.ChartsType === 'Quota');
                } else {
                    t.isSelect = true
                }

            } else {
                if ((X.length === 2 && Y.length === 1) || (X.length === 1 && Y.length > 1)) {
                    t.isSelect = !(t.ChartsType === 'Shape' || t.ChartsType === 'Quota');
                }
                if ((X.length === 1 && Y.length < 2) || (X.length < 2 && Y.length === 1)) {
                    t.isSelect = true
                }
                if (X.length > 1 || Y.length > 1) {
                    t.isSelect = !(t.ChartsType === 'Shape' || t.ChartsType === 'Quota')
                }
                if ((X.length === 1 && Y.length === 0) || (X.length === 0 && Y.length === 1)) {
                    t.isSelect = true
                }
                if (X.length > 1 && Y.length > 1) {
                    t.isSelect = t.ChartsType === 'Table'
                }
            }
        })

        this.props.dispatch({
            type: 'dataCharts/SetChartTypes',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                ChartsTypes: ChartsTypes
            }
        });
    }

    // 拖拽框下拉菜单选择
    handleClick = async (e, CheckId) => {
        if (e.item.props.type) {
            await this.props.dispatch({
                type: 'dataCharts/CheckChild',
                payload: {
                    ChartsId: this.props.dataCharts.ChartsId,
                    CheckKey: e.key,
                    CheckType: e.item.props.type,
                    ...CheckId
                }
            })
            let NewFildata = this.props.dataCharts.DragItem.filter(item => {
                return item.ContainerId === CheckId.ContainerId && item.DragItemId === CheckId.DragItemId
            })
            if (e.item.props.type === 'Sort') {
                await this.setSortOption(NewFildata[0])
            }
            await this.props.dispatch({//设置最新拖拽或点击的筛选字段属性
                type: 'dataCharts/setFilNewData',
                payload: {
                    ChartsId: this.props.dataCharts.ChartsId,
                    ...NewFildata[0]
                }
            })
            CombinedData(this.props.dataCharts, this.setDataResult, this.chartChange)
        }
    }

    //数据格式设置保存
    saveSet(saveId, s, q) {
        this.props.dispatch({
            type: 'dataCharts/SaveSet',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                ...saveId
            }
        })
    }

    //修改名称
    OnEditName(EditId) {
        this.props.dispatch({
            type: 'dataCharts/EditName',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                ...EditId
            }
        })
    }

    //修改完成
    OnHandOk(EditId, NewName) {
        this.props.dispatch({
            type: 'dataCharts/OnHandOk',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                NewName: NewName,
                ...EditId
            }
        })
    }

    //保存
    saveData = () => {
        let {config, ...other} = this.props.dataCharts
        this.props.dispatch({
            type: 'dataCharts/saveData',
            payload: {
                ...other
            }
        })
    }
    ChangeDataTable = (data) => {
        this.props.dispatch({
            type: 'dataCharts/ChangeDataTable',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                ...data
            }
        })
    }
    ResetInitTable = () => {
        this.props.dispatch({
            type: 'dataCharts/InitTable',
            payload: {
                data: {}
            }
        })
    }
    ChangeSelectListItem = (templateId) => {
        this.props.dispatch({
            type: 'dataCharts/initLeftData',
            payload: {
                templateId: templateId,
                ChartsId: this.props.dataCharts.ChartsId
            },
        });
    }
    //切换数据源 重置所有设置
    AllInit = (templateId) => {
        this.props.dispatch({
            type: 'dataCharts/AllInit',
            payload: {
                ...initDataCharts(this.props.dataCharts.ChartsId, null, '朔月', templateId)
            }
        })
    }
    //数据权限选择
    onChangeCheck = (e) => {
        let topSize = 100
        if (e.find(n => n == 1)) {
            topSize = this.props.dataCharts.ShowCount
        }
        this.props.dispatch({
            type: 'dataCharts/onChangeCheck',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                data: e
            }
        })

        let data = CombinedData(this.props.dataCharts, this.setDataResult, this.chartChange, true)
        this.props.dispatch({
            type: 'dataCharts/ChartsData',
            ChartsId: this.props.dataCharts.ChartsId,
            //options: o,//暂时还没用到
            payload: {
                Top: topSize,
                FormTemplateCode: this.props.dataCharts.DragSource.table,
                Dimensions: DimensionsAssemble(data.Dimensions),//维度
                Measures: data.Measures,//指标
                Conditions: CodeAssemble(data.Condition),//筛选条件
                Orders: OrderAssemble(this.props.dataCharts.setSort),//排序
                Groups: GroupsAssemble(data.Groups),//日期类维度字段
            }
        })

    }
    NumberonChange = (e) => {
        if (Number(e) < 1) {
            message.warning('仅支持大于1的正整数')
            return
        }
        this.props.dispatch({
            type: 'dataCharts/onShowCount',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                data: e
            }
        })
        let data = CombinedData(this.props.dataCharts, this.setDataResult, this.chartChange, true)
        this.props.dispatch({
            type: 'dataCharts/ChartsData',
            ChartsId: this.props.dataCharts.ChartsId,
            //options: o,//暂时还没用到
            payload: {
                Top: Number(e),
                FormTemplateCode: this.props.dataCharts.DragSource.table,
                Dimensions: DimensionsAssemble(data.Dimensions),//维度
                Measures: data.Measures,//指标
                Conditions: CodeAssemble(data.Condition),//筛选条件
                Orders: OrderAssemble(this.props.dataCharts.setSort),//排序
                Groups: GroupsAssemble(data.Groups),//日期类维度字段
            }
        })
    }
    back = () => {
        if (this.state.canback) {
            this.props.history.goBack()
        }
    }
    editChartsTitle = (e) => {
        this.props.dispatch({
            type: 'dataCharts/editChartsTitle',
            payload: {
                ChartsId: this.props.dataCharts.ChartsId,
                value: e.target.value
            }
        })
    }
    strlen = (str) => {
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                len++;
            } else {
                len += 1.8;
            }
        }
        return len;
    }

    render() {
        return (
            <div className={Chartstyle.DataChartsContainer}>
                <div style={{
                    height: '40px',
                    display: 'flex',
                    boxShadow: '0 5px 10px -5px rgba(0,0,0,0.2)',
                    marginBottom: '10px',
                    background: "#fff",
                    lineHeight: '40px'
                }}>
                    <div style={{
                        flex: '1',
                        fontSize: '16px',
                        color: '#000',
                        padding: '0 12px',
                    }}>
                        {
                            this.state.canback ? <Icon type="left" onClick={this.back.bind(this)}/> : null
                        }
                        <input style={{
                            width: this.strlen(this.props.dataCharts.ChartsTitle) * 8.5 + 6,
                            maxWidth: '200px',
                            height: "25px",
                            border: 'none',
                            borderBottom: '1px dashed #AAAAAA',
                            fontSize: '14px',
                            paddingLeft: '6px',
                            outline: 'none'
                        }}
                               value={this.props.dataCharts.ChartsTitle}
                               onChange={(e) => this.editChartsTitle(e)}
                        />

                    </div>
                    <div style={{flex: '1', textAlign: 'right', paddingRight: '12px'}}>
                        <Button type="primary" onClick={this.saveData}>保存</Button>
                    </div>
                </div>
                <div style={{
                    display: 'flex', position: 'absolute',
                    top: this.state.canback ? 48 : 120,
                    bottom: '2px', left: '0', right: '0'
                }}>
                    <div style={{width: "242px"}} className={Chartstyle.ContainerLeft}>
                        <StrDragSource DragSourceList={this.props.dataCharts.DragSource.fields}
                                       StartDrag={this.StartDrag.bind(this)}
                                       ChangeDataTable={this.ChangeDataTable.bind(this)}
                                       title={this.props.dataCharts.ChartsTitle}
                                       ChangeTable={this.props.ChangeDataTable}
                                       ResetInitTable={this.ResetInitTable.bind(this)}
                                       templateId={this.props.templateId}
                                       ChangeSelectListItem={this.ChangeSelectListItem.bind(this)}
                                       AllInit={this.AllInit.bind(this)}
                        />

                    </div>
                    <div className={Chartstyle.ContainerCenter}
                         style={{background: "#F4F6F9", overflow: 'hidden', flex: '5'}}>

                        <StrDropTarget DeleteChild={this.DeleteChild}
                                       endDrag={this.endDrag.bind(this)}
                                       handleClick={this.handleClick.bind(this)}
                                       DragItem={this.props.dataCharts.DragItem}
                                       ChartsType={this.props.dataCharts.ChartsType}
                                       saveSet={this.saveSet.bind(this)}
                                       OnEditName={this.OnEditName.bind(this)}
                                       OnHandOk={this.OnHandOk.bind(this)}
                                       Coptions={this.props.Coptions}
                                       IsDragging={this.props.dataCharts.IsDragging}
                                       IsDraggingType={this.props.dataCharts.IsDraggingType}
                                       FilterVisible={this.props.dataCharts.FilterVisible}
                                       setFilterVisible={this.setFilterVisible.bind(this)}
                                       setFilNewData={this.props.dataCharts.setFilNewData}
                                       ExchangeSort={this.ExchangeSort.bind(this)}
                                       CrossDragSort={this.CrossDragSort}
                            // TipBorder={this.props.dataCharts.TipBorder}
                                       DragTarget={this.props.dataCharts.DragTarget}
                            // TipBorderFun={this.TipBorderFun}
                        />
                        <div ref='ScreenFull'
                             style={{
                                 position: 'absolute',
                                 background: '#fff',
                                 left: '6px',
                                 right: '6px',
                                 top: this.props.dataCharts.ChartsType === 'Table' ? '165px' : '124px',
                                 bottom: '0px'
                             }}>
                            <Icon type="fullscreen"
                                  style={{
                                      position: 'absolute',
                                      cursor: 'pointer',
                                      right: '10px',
                                      top: '10px',
                                      fontSize: '20px',
                                      zIndex: 1
                                  }}
                                  onClick={this.OpenScreenFull}/>

                            <InitCharts
                                Config={Object.keys(this.props.dataCharts.config).length > 0 ? this.props.dataCharts.config : Config} {...this.props}/>
                        </div>


                    </div>
                    <div className={Chartstyle.ContainerRight}
                         style={{overflow: 'scroll', width: '242px'}}>
                        <PropertyOption ChartsType={this.props.dataCharts.ChartsType}
                                        chartChange={this.chartChange.bind(this)}
                                        ChartsTypes={this.props.dataCharts.ChartsTypes}
                                        onChangeCheck={this.onChangeCheck.bind(this)}
                                        DataPermission={this.props.dataCharts.DataPermission}
                                        NumberonChange={this.NumberonChange.bind(this)}
                                        ShowCount={this.props.dataCharts.ShowCount}
                        />
                    </div>
                </div>
            </div>
        );
    }
}


function initDataCharts(ChartsId, type, templateId) {
    return new Object({
        templateId,
        ChartsId,
        config: {},//图表属性配置信息
        ChartsType: type ? type : 'Line',//默认显示柱状图
        ChartsTitle: '',
        IsDragging: false,//当前表单的列表字段是否正在拖动
        IsDraggingType: '',//当前正在拖动的字段类型
        FilterVisible: false,//条件筛选modal显示
        setFilNewData: {},//当前条件筛选的对
        setSort: {},//最新一次排序的属性对象
        ChartsData: [],
        // CombinedData: {},
        DragSource: {
            fields: []//当前表单全部字段属性
        },
        DragItem: [],//拖拽之后的字段
        DropOptions: {},
        DragTarget: {},//拖拽的目标
        // TipBorder: false,//拖拽位置提示
        DataPermission: [],//数据权限选择
        ShowCount: 0,//数据显示条数
        ChartsTypes: [//当前的图表类型
            {
                Name: '指标图',
                ChartsType: 'Quota',
                isSelect: true,
            },
            {
                Name: '透视表',
                ChartsType: 'Table',
                isSelect: true,
            },
            {
                Name: '折线图',
                ChartsType: 'Line',
                isSelect: true,
            },
            {
                Name: '柱状图',
                ChartsType: 'Columnar',
                isSelect: true,
            },
            {
                Name: '条形图',
                ChartsType: 'Bar',
                isSelect: true,
            },
            {
                Name: '面积图',
                ChartsType: 'Area',
                isSelect: true,
            },
            {
                Name: '饼图',
                ChartsType: 'Shape',
                isSelect: true,
            },
            {
                Name: '雷达',
                ChartsType: 'Radar',
                isSelect: true,
            }
        ]
    });
}

function mapStateToProps(state, props) {

    if (props.history.location.pathname.indexOf('/main/dataCharts') === -1 && props.history.location.pathname.indexOf('/dataCharts') === -1) {
        return {};
    }
    let query = queryString.parse(props.history.location.search)
    let dataCharts = null;
    let templateId = query.templateId;
    if (query.tabId) {
        if (!state.dataCharts.all[query.tabId]) {
            if (props.history.location.pathname === '/main/dataCharts') {
                let {appMain} = state;
                let {activeKey, panes} = appMain;
                state.dataCharts.all[query.tabId] = initDataCharts(query.tabId, query.ChartsType, templateId);
            }
            if (props.history.location.pathname === '/dataCharts') {
                state.dataCharts.all[query.tabId] = initDataCharts(query.tabId, query.ChartsType, templateId);
            }

        }
        dataCharts = state.dataCharts.all[query.tabId];
    }
    else {
        return null;
    }

    return {
        templateId: templateId,
        dataCharts: dataCharts,
        ChangeDataTable: state.dataCharts.ChangeDataTable,
        Coptions: {
            CList: state.dataCharts.CList,
            AList: state.dataCharts.AList,
            strName: state.dataCharts.strName,
            DatestrName: state.dataCharts.DatestrName,
        },
    };
}

export default connect(mapStateToProps)(DataCharts)
