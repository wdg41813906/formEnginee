import React from 'react';
import PropTypes from 'prop-types';
import {Map, fromJS} from 'immutable'
import queryString from 'query-string';
import {connect} from 'dva';
import ReportSwitch from '../../components/Dashboard/Ledger/ReportSwitch'
import backnodata from '../../assets/backnodata.png'
import com from '../../utils/com';
import {Config} from '../../utils/DashboardConfig'

class InitCharts extends React.Component {
    constructor(props) {
        super(props);
    }

    // shouldComponentUpdate(nextProps) {
    //     debugger
    //     if (this.props.dataCharts.ChartsData.length === 0)
    //         return false;
    //     if (nextProps.dataCharts.ChartsData.length !== 0) {
    //         if (this.props.dataCharts.ChartsData.toString() === nextProps.dataCharts.ChartsData.toString() && this.props.dataCharts.DragItem.length === nextProps.dataCharts.DragItem.length) {
    //             return this.props !== nextProps;
    //         }
    //     }
    //     return false;
    // }

    render() {
        let offsetHeight = window.document.body.offsetHeight
        let ChartsOptions = fromJS({
            height: 250,
            width: 600,
            config:this.props.Config
        })
        let {ChartsData, ChartsId, DragItem, DragSource, ChartsType} = this.props.dataCharts

        let Xopt = []
        let Yopt = []
        let Yyopt = []
        if (ChartsType === 'Table') {
            DragItem.map(item => {
                if (item.ContainerId === 'indicators') {
                    Xopt.push(item)
                }
                if (item.ContainerId === 'dimensionX') {
                    Yopt.push(item)
                }
                if (item.ContainerId === 'dimensionY') {
                    Yyopt.push(item)
                }
            })

        } else {
            DragItem.map(item => {
                if (item.ContainerId === 'indicators') {
                    Xopt.push(item.Name)
                }
                if (item.ContainerId === 'dimensionX') {
                    Yopt.push(item.Name)
                }
            })
        }
        let ChartsOpt = ChartsOptions.set('title', this.props.dataCharts
            .ChartsTitle).
            set('ShowCount', this.props.dataCharts.ShowCount).
            set('DataPermission', this.props.dataCharts.DataPermission).
            set('type', this.props.dataCharts.ChartsType).
            set('ChartsData', ChartsData).set('ChartsId', ChartsId).
            set('height', window.document.body.offsetHeight - 400)
        return (
            <div style={{
                boxShadow: '0 0 10px #ECECF3',
                position: 'absolute',
                top: '0px',
                bottom: '0px',
                width: '100%',
            }}>
                {
                    // style={{height: offsetHeight - 300 + 'px', overflowY: 'auto', overflowX: 'hidden'}}
                }
                {
                    (Xopt.length > 0 && (Yopt.length > 0 || Yyopt.length > 0) && ChartsData.length > 0) ?
                        <ReportSwitch item={ChartsOpt.toJS()} DragSource={DragSource} DragItem={DragItem}/> :
                        <div style={{
                            textAlign: 'center', position: 'absolute', top: '0px',
                            bottom: '0px', width: '100%',
                        }}>
                            <img src={backnodata} alt="" style={{width: '60%', paddingTop: '30px'}}/>
                        </div>
                    // <ReportSwitch item={ChartsOpt.toJS()} DragSource={DragSource}/>
                }
            </div>
        )
    }
}


function mapStateToProps(state, props) {
    if (props.history.location.pathname.indexOf('/main/dataCharts') === -1) {
        return {};
    }
    let query = queryString.parse(props.history.location.search)
    let initCharts = null;
    if (query.tabId) {
        initCharts = state.dataCharts.all[query.tabId]
    } else {
        return null;
    }
    return {
        initCharts: initCharts
    };
}

export default InitCharts
