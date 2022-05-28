import React, {PropTypes} from 'react';
import {connect} from 'dva';
import {message} from 'antd';
import {Link, withRouter} from 'dva/router';
import LedgerCompon from '../../../components/Dashboard/Ledger/LedgerCompon'
import CardPreview from '../../../components/Dashboard/Ledger/CardPreview'
import Operation from '../../../components/Dashboard/Operation/Operation'
// import {fileServer} from '../../../utils/config'
import LedgerConfig from '../../../components/Dashboard/Ledger/LedgerConfig/LedgerConfig';
import LedgerTitle from '../../../components/Dashboard/Ledger/LedgerTitle'
import StringSelectPanle from '../../../components/Dashboard/DashboardItem/StringSelectPanle'
import LedgerIndex from '../../../components/Dashboard/Ledger/LedgerIndex';
import {FormEngine} from '../../../utils/PlatformConfig'
import ConfigDrawer from '../../../components/Dashboard/Ledger/ConfigDrawer'
import LedgerConfigRoute from '../../../components/Dashboard/Ledger/LedgerConfigRoute'
import DashboardConfig, {Item} from '../../../utils/DashboardConfig'
import queryString from 'query-string';
import styles from './LedgerIndex.less'
import _ from 'underscore';

message.config({
    top: 10,
    duration: 1,
    maxCount: 1,
});

function LedgerIndexRoute({location, dispatch, ledgerIndex, history}) {

    let query = queryString.parse(history.location.search)
    let isPreview = ledgerIndex.get('isPreview');

    // alert(query.type)
    function LedgerConfigShowToggel() {
        dispatch({
            type: 'ledgerIndex/LedgerConfigShowToggel',
        })
    }

    function ConfigDrawerShowToggle() {
        dispatch({
            type: 'ledgerIndex/ConfigDrawerShowToggle',
        })
    }

    function StringSelectToggle(flag) {
        dispatch({
            type: 'ledgerIndex/StringSelectToggle',
            payload: {
                show: flag
            }
        })
    }

    function ChangeCurrentField(data) {
        dispatch({
            type: 'ledgerIndex/ChangeCurrentField',
            payload: {data: data}
        })
    }

    function SearchText(payload) {
        dispatch({
            type: 'ledgerIndex/SearchText',
            payload: payload
        })
    }

    function Preview() {
        dispatch({
            type: 'ledgerIndex/Preview',
            payload: {}
        })
    }

    function ReportPreviewToggle() {
        dispatch({
            type: 'ledgerIndex/ReportPreviewToggle',
            payload: {}
        })
    }

    function AttachmentsGetListPaged(index) {
        dispatch({
            type: 'ledgerIndex/AttachmentsGetListPaged',
            payload: {pageIndex: index, pageSize: 20}
        })
    }

    // const { ledgerData,addDashboardShow,tableList,searchComShow
    // ,stringSelectPosition,stringSelectShow } = ledgerIndex.toJS();
    const LedgerIndexProps = {

        ledgerData: ledgerIndex.get('ledgerData'),
        ledgerConfigShow: ledgerIndex.get('ledgerConfigShow'),
        ledgerAllConfig: ledgerIndex.get('ledgerAllConfig'),
        StringSelectToggle: StringSelectToggle,

        StringSelectPositionChange(position) {
            dispatch({
                type: 'ledgerIndex/StringSelectPositionChange',
                payload: {
                    position: position
                }
            })
        },
        ReportItemRemove(item) {
            dispatch({
                type: 'ledgerIndex/ReportItemRemove',
                payload: {item: item}
            })
        },
        CardMouseOver(item) {
            dispatch({
                type: 'ledgerIndex/CardMouseOver',
                payload: {item: item},
            })
        },
        CardMouseLeave(item) {
            dispatch({
                type: 'ledgerIndex/CardMouseLeave',
                payload: {item: item},
            })
        },

        OnResizeStop(data) {
            dispatch({
                type: 'ledgerIndex/OnResizeStop',
                payload: {data: data},
            })
        },
        RefInit(dragactWidth) {
            dispatch({
                type: 'ledgerIndex/RefInit',
                payload: {dragactWidth: dragactWidth},
            })
        },
        CardEdit(item) {
            let key = `ledgerIndex/dataCharts`;
            dispatch({
                type: "appMain/toOtherLink",
                payload: {
                    key,
                    id: item.id,
                    title: item.title,
                    history,
                    param: {type: 'edit'}
                }
            });
        },
        SearchComEditShow(item, flag) {
            var designType = ledgerIndex.get('designType');
            if (DashboardConfig.ReportItemArray.indexOf(item.type) > -1) {
                setTimeout(()=>{
                    dispatch({
                        type: 'dataCharts/getData',
                        payload: Object.keys(item.engineeConfig).length > 0 ? {
                            engineeConfig:item.engineeConfig,
                            Config:item.config,
                            tabId: item.id,
                            templateId: item.formTemplateId,
                        } : {
                            tabId: item.id,
                            templateId: item.formTemplateId,
                            Config:item.config
                        }
                    })
                },2000)
                if (location.pathname === '/ledgerIndex') {
                    history.push(`/dataCharts?tabId=${item.id}&templateId=${item.formTemplateId}&ChartsType=${item.type}&type=edit&&title=${item.title}`);
                } else {
                    let key = `dataCharts`;
                    dispatch({
                        type: "appMain/toOtherLink",
                        payload: {
                            key,
                            id: item.id,
                            title: item.title,
                            history,
                            param: {templateId: item.formTemplateId, type: 'edit', ChartsType: item.type}
                        }
                    });
                }

            } else {
                dispatch({
                    type: 'ledgerIndex/SearchComEditShow',
                    payload: {item: item, flag: flag}
                })
            }

        },
        ReportItemChange(item) {
            dispatch({
                type: 'ledgerIndex/ReportItemChange',
                payload: {item: item}
            })
        },
        SearchText: SearchText,
        StringSelectFn(item) {
            dispatch({
                type: 'ledgerIndex/StringSelectFn',
                payload: {item: item}
            })
        },
        RangeFieldChange(item, obj) {
            dispatch({
                type: 'ledgerIndex/RangeFieldChange',
                payload: {item: item, obj: obj}
            })

        },
        LedgerConfigShowToggel: LedgerConfigShowToggel,
        ConfigDrawerShowToggle: ConfigDrawerShowToggle,
        ReportPreviewToggle: ReportPreviewToggle,
        reportPreviewShow: ledgerIndex.get('reportPreviewShow'),
        ReportItemPreview(item) {
            dispatch({
                type: 'ledgerIndex/ReportItemPreview',
                payload: {item: item}
            })
        },
        isPreview: isPreview,
        SearchButtonCall() {
            dispatch({
                type: 'ledgerIndex/SearchButtonCall',

            })
        },
        DataLinkageEngineeCall(item, value) {
            dispatch({
                type: 'ledgerIndex/DataLinkageEngineeCall',
                payload: {
                    item, value
                }

            })
        }

    }
    const OperationProps = {

        dashBoardPage: ledgerIndex.get('dashBoardPage'),
        addDashboardShow: ledgerIndex.get('addDashboardShow'),
        searchComMode: ledgerIndex.get('searchComMode'),
        tableList: ledgerIndex.get('tableList'),
        reportList: ledgerIndex.get('reportList'),
        reportCheckedValues: ledgerIndex.get('reportCheckedValues'),
        reportFieldData: ledgerIndex.get('reportFieldData'),
        currentField: ledgerIndex.get('currentField'),
        searchComShow: ledgerIndex.get('searchComShow'),
        currentTable: ledgerIndex.get("currentTable"),
        searchTextList: ledgerIndex.get('searchTextList'),
        Init() {
            AttachmentsGetListPaged(1)
            if (query.type == 'Modify') {
                if (ledgerIndex.get('reportId') !== query.tabId) {
                    dispatch({
                        type: "ledgerIndex/SaveReportId",
                        payload: {reportId: query.tabId}
                    })
                    dispatch({
                        type: 'ledgerIndex/GetForModify',
                        payload: {EntityId: query.tabId, Platform: FormEngine}
                    })
                }
            } else {
                // dispatch({
                //     type: 'ledgerIndex/AddInit',
                //     payload: {}
                // })
            }
        },
        Save() {
            let ledgerData = ledgerIndex.get('ledgerData');
            let ledgerAllConfig = ledgerIndex.get('ledgerAllConfig');
            let reportList = ledgerIndex.get('reportList');

            dispatch({
                type: 'ledgerIndex/Save',
                payload: {
                    history,
                    type: query.type,
                    id: query.tabId,
                    ledgerData: ledgerData,
                    ledgerAllConfig: ledgerAllConfig,
                    reportList: reportList
                }
            })
        },
        GetTable(data) {

            dispatch({
                type: 'ledgerIndex/GetTable',
                payload: data
            })


        },


        AddDashboardToggle(payload) {
            dispatch({
                type: 'ledgerIndex/AddDashboardToggle',
                payload: payload
            })
        },
        ReportListInit() {
            dispatch({
                type: 'ledgerIndex/ReportListInit',
            })
        },
        SearchComToggle() {
            dispatch({
                type: 'ledgerIndex/SearchComToggle',
            })
        },
        TableItemSelect(item) {
            dispatch({
                type: 'ledgerIndex/TableItemSelect',
                payload: {item: item}
            })
        },
        ReportItemSelect(item) {
            dispatch({
                type: 'ledgerIndex/ReportItemSelect',
                payload: {item: item}
            })
        },
        FieldSelect(id) {
            dispatch({
                type: 'ledgerIndex/FieldSelect',
                payload: {id: id}
            })
        },
        ChangeCurrentField: ChangeCurrentField,
        ReportItemAdd(item) {
            {/*
            var designType=ledgerIndex.get('designType');
            var tableList = ledgerIndex.get('tableList');
            var currentTable = _.where(tableList, { select: true });
            if (currentTable.length <= 0) {
              message.error("请选择数据表");
              return;
            }
            var item = currentTable[0];
            let key = `dataCharts`;
            dispatch({
                type: "appMain/toOtherLink",
                payload: {
                    key,
                    id: item.formTemplateId,
                    title: item.name,
                    history,
                    param: {designType, type: 'add', ChartsType: Item.Line }
                }
            });
            dispatch({
                type: 'ledgerIndex/AddDashboardToggle'
            })
        */
            }
            dispatch({
                type: 'ledgerIndex/ReportItemAdd',
                payload: {item: item}
            })
        },

        SearchComEdit() {
            dispatch({
                type: 'ledgerIndex/SearchComEdit',
                payload: {}
            })
        },
        SearchComAdd() {
            dispatch({
                type: 'ledgerIndex/SearchComAdd',
                payload: {}
            })
        },
        SearchButtonAdd() {
            dispatch({
                type: 'ledgerIndex/SearchButtonAdd',
                payload: {}
            })
        },
        Preview: Preview,
        SearchText: SearchText
    }


    var newLedgerAllConfig = ledgerIndex.get('ledgerAllConfig').toJS()
    const LedgerTitleProps = {
        ledgerAllConfig: newLedgerAllConfig,
        LedgerConfigShowToggel: LedgerConfigShowToggel,
        Preview: Preview,
        isPreview: isPreview,
    }
    const LedgerComponProps = {}
    const StringSelectPanleProps = {

        currentTable: ledgerIndex.get("currentTable"),
        stringSelectShow: ledgerIndex.get('stringSelectShow'),
        StringSelectToggle: StringSelectToggle,
        stringSelectPosition: ledgerIndex.get('stringSelectPosition'),
        currentField: ledgerIndex.get('currentField'),
        searchTextList: ledgerIndex.get('searchTextList'),
        currentReportItem: ledgerIndex.get('currentReportItem'),
        SearchText: SearchText,
        ChangeCurrentField: ChangeCurrentField,
        StringSelectField(obj) {
            dispatch({
                type: 'ledgerIndex/StringSelectField',
                payload: obj
            })
        }


    }
    const configDrawerShow = ledgerIndex.get('configDrawerShow');
    const SwichConfigProps = {
        item: ledgerIndex.get('currentReport'),

        configDrawerShow: ledgerIndex.get('configDrawerShow'),
        currentReport: ledgerIndex.get('currentReport'),
        currentConfig: ledgerIndex.get('currentConfig'),

        ConfigDrawerShowToggle: ConfigDrawerShowToggle,

        SetColorMatchProgrammesData(item, dataKey,color) {
            dispatch({
                type: 'ledgerIndex/SetColorMatchProgrammesData',
                payload: {item: item, dataKey,color}
            })
        },
        SetLinkageHomologyData(item, table) {
            dispatch({
                type: 'ledgerIndex/SetLinkageHomologyData',
                payload: {item: item, table: table}
            })
        },
        SetLinkageData(item, table, field) {
            dispatch({
                type: 'ledgerIndex/SetLinkageData',
                payload: {item: item, table: table, field: field}
            })
        },
        SetData(item, key, value) {
            dispatch({
                type: 'ledgerIndex/SetData',
                payload: {item: item, key: key, value: value}
            })
        },
        ConfigTypeChange(item) {
            dispatch({
                type: 'ledgerIndex/ConfigTypeChange',
                payload: {item: item}
            })
        },


    }
    const LedgerConfigProps = {
        ledgerAllConfig: newLedgerAllConfig,
        ledgerConfigShow: ledgerIndex.get('ledgerConfigShow'),
        backImageList: ledgerIndex.get('backImageList'),
        backImagePage: ledgerIndex.get('backImagePage'),
        LedgerConfigShowToggel: LedgerConfigShowToggel,
        BackImageAdd(image) {
            dispatch({
                type: 'ledgerIndex/BackImageAdd',
                payload: {image: image}
            })
        },
        BackImageHoverChange(item, flag) {
            dispatch({
                type: 'ledgerIndex/BackImageHoverChange',
                payload: {item: item, flag: flag}
            })
        },
        BackImageItemClick(item) {
            dispatch({
                type: 'ledgerIndex/BackImageItemClick',
                payload: {item: item}
            })
        },
        SetLedgerData(item, key, value) {
            dispatch({
                type: 'ledgerIndex/SetLedgerData',
                payload: {item: item, key: key, value: value}
            })
        },
        AttachmentsNew(payload) {
            dispatch({
                type: 'ledgerIndex/AttachmentsNew',
                payload: payload
            })

        },
        AttachmentsGetListPaged: AttachmentsGetListPaged
    }

    const CardPreviewProps = {
        reportPreviewShow: ledgerIndex.get('reportPreviewShow'),
        isPreview: isPreview,
        currentReportItem: ledgerIndex.get('currentReportItem'),
        backgroundImage: `url(${newLedgerAllConfig.backImageShow ?

            config.fileServer + newLedgerAllConfig.backImageUrl : ''})`,
        ReportPreviewToggle: ReportPreviewToggle,
    }

    return (

        <div
            onClick={
                e => {
                    // this.props.StringSelectToggle(false)
                }
            }
            id="ledgerIndex"
            style={{
                position: 'absolute',
                left: 0, right: 0,
                bottom: 0,
                top: location.pathname === '/ledgerIndex' ? 48 : 107,
                backgroundImage: `url(${newLedgerAllConfig.backImageShow ?

                    config.fileServer + newLedgerAllConfig.backImageUrl : ''})`,
                backgroundSize: 'cover',
                overflowX: 'hidden',
                overflowY: 'auto',

            }}>


            <Operation {...OperationProps} location={location.pathname}/>
            <LedgerTitle {...LedgerTitleProps} />
            <LedgerCompon {...LedgerIndexProps} />

            {
                !isPreview && <StringSelectPanle {...StringSelectPanleProps} />
            }

            <ConfigDrawer {...SwichConfigProps} />
            <LedgerConfigRoute {...LedgerConfigProps} />

            {
                isPreview && <div className={styles.preview}>
                    <div style={{
                         height:'100%',
                        backgroundImage: `url(${newLedgerAllConfig.backImageShow ?
                            config.fileServer + newLedgerAllConfig.backImageUrl : ''})`
                    }}>

                        <LedgerTitle {...LedgerTitleProps} />
                        <LedgerCompon {...LedgerIndexProps} />
                        <StringSelectPanle {...StringSelectPanleProps} />

                        <CardPreview {...CardPreviewProps}/>
                    </div>
                </div>
            }


        </div>
    )
}


//监听属性，建立组件和数据的映射关系
function mapStateToProps({ledgerIndex}) {

    return {ledgerIndex};
}


//关联model
export default withRouter(connect(mapStateToProps)(LedgerIndexRoute));
