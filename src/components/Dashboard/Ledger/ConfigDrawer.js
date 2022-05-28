import SwichConfig from './../Config/ConfigReport/SwichConfig'
import React, { PropTypes } from 'react';
import { Drawer } from 'antd';
export default class ConfigDrawer extends React.Component{
    render(){
        const {currentConfig,item}=this.props;

        var newCurrentConfig=currentConfig.toJS()
        var newItem=item.toJS();
        return(
            <Drawer
            title={newItem.config?newItem.config.title.name:''}
            closable={true}
            width={350}
            onClose={e=>this.props.ConfigDrawerShowToggle()}
            visible={this.props.configDrawerShow}
           >

           <SwichConfig NewItem={newItem} NewCurrentConfig={newCurrentConfig} {...this.props}/>
           </Drawer>
        )
    }
}
