import LedgerConfig from './LedgerConfig/LedgerConfig'
import React, { PropTypes } from 'react';
import { Drawer } from 'antd';
export default class LedgerConfigRoute extends React.Component{
    render(){
        return(
            <Drawer
            title="仪表盘配置"
            closable={true}
            width={350}
            onClose={e=>this.props.LedgerConfigShowToggel()}
            visible={this.props.ledgerConfigShow}
            >
            <LedgerConfig {...this.props}/>
            </Drawer>
        )
    }
}
