import ControlHOC from './ControlHOC'
import react from 'react';
import styles from './Control.less'
import { FontFamily } from '../../../../../utils/DashboardConfig'
import { Switch } from 'antd';
@ControlHOC()
export default class SwitchControl extends react.Component {
   
    render() {
        
        const {item,datakey,value} = this.props
        return (
           
            <Switch checkedChildren="是"
            onChange={e => { this.props.RefreshData(item, datakey, e) }}
            unCheckedChildren="否" checked={value} />
                              
        )
    }
}