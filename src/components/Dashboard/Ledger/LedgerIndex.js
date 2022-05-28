import React, { PropTypes } from 'react';
import { Drawer } from 'antd';

import BaseImmutableComponent from '../../../components/BaseImmutableComponent'
import LedgerCompon from './LedgerCompon'
import Operation from '../Operation/Operation'
import styles from './LedgerIndex.less'
import StringSelectPanle from '../DashboardItem/StringSelectPanle'
import SwichConfig from '../Config/ConfigReport/SwichConfig'
import LedgerConfig from './LedgerConfig/LedgerConfig';
import LedgerTitle from './LedgerTitle'
import './Drawer.less'
var _this;
const { Map } = require('immutable')
export default class LedgerIndex extends BaseImmutableComponent {
    constructor(props) {
        super(props);
        _this = this;
        this.state = {
            DragactWidth: 0
        }

    }
    componentWillMount() {
    }
    componentDidMount() {
        // var ele= document.getElementById("ledgerIndex")
        // ele.addEventListener('resize',function(){

        //     debugger
        //     _this.refCb(ele)
        //    })
    }
    refCb = (instance) => {

        if (!instance) return
        // debugger
        // this.setState({
        //     DragactWidth: instance.clientWidth
        // })
        this.props.RefInit(instance.clientWidth)
    }
    render() {
        const { ConfigDrawerShow, CurrentReport, LedgerConfigShow, LedgerAllConfig } = this.props
        var newLedgerAllConfig = LedgerAllConfig.toJS()

        return (
            <div
                onClick={
                    e => {
                        // this.props.StringSelectToggle(false)
                    }
                }
                id="ledgerIndex"
                // ref={this.refCb}
                style={{
                    position: 'absolute',
                    left: 0, right: 0,
                    bottom: 0,
                    top: 107,
                    overflow: 'auto',
                    // background: '#F4F6F9',
                    backgroundImage: `url(${newLedgerAllConfig.BackImageUrl})`

                }} >
                <Operation {...this.props} />

                <LedgerTitle LedgerAllConfig={newLedgerAllConfig} LedgerConfigShowToggel={
                    this.props.LedgerConfigShowToggel
                } />

                <LedgerCompon DragactWidth={this.state.DragactWidth} {...this.props} />
                <StringSelectPanle {...this.props} />
                <Drawer
                    title="Basic Drawer"
                    closable={true}
                    width={350}
                    onClose={e => this.props.ConfigDrawerShowToggle()}
                    visible={ConfigDrawerShow}
                >

                    <SwichConfig item={CurrentReport} {...this.props} />
                </Drawer>
                <Drawer
                    title="仪表盘配置"
                    closable={true}
                    width={350}
                    onClose={e => this.props.LedgerConfigShowToggel()}
                    visible={LedgerConfigShow}
                >
                    <LedgerConfig LedgerAllConfig={newLedgerAllConfig} SetLedgerData={this.props.SetLedgerData} />
                </Drawer>
            </div>
        )
    }
}
