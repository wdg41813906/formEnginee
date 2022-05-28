import React, { PropTypes } from 'react';
import { connect } from 'dva';

import LedgerIndex from '../../../components/Dashboard/Ledger/LedgerIndex';


function LedgerIndexRoute({ location, dispatch, ledgerIndex, history }) {

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
    // const { LedgerData,AddDashboardShow,TableList,SearchComShow
    // ,StringSelectPosition,StringSelectShow } = ledgerIndex.toJS();
    const LedgerIndexProps = {
        LedgerData: ledgerIndex.get('LedgerData'),
        AddDashboardShow: ledgerIndex.get('AddDashboardShow'),
        SearchComMode: ledgerIndex.get('SearchComMode'),
        TableList: ledgerIndex.get('TableList'),
        ReportList: ledgerIndex.get('ReportList'),
        ReportCheckedValues: ledgerIndex.get('ReportCheckedValues'),
        ReportFieldData: ledgerIndex.get('ReportFieldData'),
        CurrentField: ledgerIndex.get('CurrentField'),
        SearchComShow: ledgerIndex.get('SearchComShow'),
        LedgerAllConfig: ledgerIndex.get('LedgerAllConfig'),
        products: ledgerIndex.get('products'),
        StringSelectToggle:StringSelectToggle,
        StringSelectPosition:ledgerIndex.get('StringSelectPosition'),
        ConfigDrawerShow: ledgerIndex.get('ConfigDrawerShow'),
        CurrentReport: ledgerIndex.get('CurrentReport'),
        CurrentConfig: ledgerIndex.get('CurrentConfig'),

        ConfigDrawerShowToggle: ConfigDrawerShowToggle,
        LedgerConfigShow: ledgerIndex.get('LedgerConfigShow'),
        LedgerConfigShowToggel: LedgerConfigShowToggel,
        SetLedgerData(key, value) {
            dispatch({
                type: 'ledgerIndex/SetLedgerData',
                payload: { key: key, value: value }
            })
        },
        SetData(item, key, value) {
            dispatch({
                type: 'ledgerIndex/SetData',
                payload: { item: item, key: key, value: value }
            })
        },
        ConfigTypeChange(item) {
            dispatch({
                type: 'ledgerIndex/ConfigTypeChange',
                payload: { item: item }
            })
        },

        Test() {
            dispatch({
                type: 'ledgerIndex/Test',

            })
        },
       
      
        AddDashboardToggle() {
            dispatch({
                type: 'ledgerIndex/AddDashboardToggle',
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
                payload: { item: item }
            })
        },
        ReportItemSelect(item) {
            dispatch({
                type: 'ledgerIndex/ReportItemSelect',
                payload: { item: item }
            })
        },
        FieldSelect(id) {
            dispatch({
                type: 'ledgerIndex/FieldSelect',
                payload: { Id: id }
            })
        },
        ChangeCurrentField(data) {
            dispatch({
                type: 'ledgerIndex/ChangeCurrentField',
                payload: { data: data }
            })
        },
        ReportItemAdd(item) {
            dispatch({
                type: 'ledgerIndex/ReportItemAdd',
                payload: { item: item }
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
                payload: { item: item }
            })
        },
        CardMouseOver(item) {
            dispatch({
                type: 'ledgerIndex/CardMouseOver',
                payload: { item: item },
            })
        },
        CardMouseLeave(item) {
            dispatch({
                type: 'ledgerIndex/CardMouseLeave',
                payload: { item: item },
            })
        },

        OnResizeStop(data) {
            dispatch({
                type: 'ledgerIndex/OnResizeStop',
                payload: { data: data },
            })
        },
        RefInit(dragactWidth) {
            dispatch({
                type: 'ledgerIndex/RefInit',
                payload: { dragactWidth: dragactWidth },
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
                    param: { type: 'edit' }
                }
            });
        },
        SearchComEditShow(item) {

            if (DashboardConfig.ReportItemArray.indexOf(item.type) > -1) {
                let key = `ledgerIndex/dataCharts`;
                dispatch({
                    type: "appMain/toOtherLink",
                    payload: {
                        key,
                        id: item.id,
                        title: item.title,
                        history,
                        param: { type: 'edit' }
                    }
                });
            } else {
                dispatch({
                    type: 'ledgerIndex/SearchComEditShow',
                    payload: { item: item }
                })
            }

        },
        ReportItemChange(item) {
            dispatch({
                type: 'ledgerIndex/ReportItemChange',
                payload: { item: item }
            })
        },
       

    }
    
  
    return (
        <LedgerIndex {...LedgerIndexProps}/>
    )
}
//监听属性，建立组件和数据的映射关系
function mapStateToProps({ ledgerIndex }) {

    return { ledgerIndex };
}

// const mapStateToProps = state => ({
//     LedgerData: state.ledgerIndex.get('LedgerData'),
//});
//关联model
export default connect(mapStateToProps)(LedgerIndexRoute);