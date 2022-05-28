import ControlHOC from './ControlHOC'
import react from 'react';
import styles from './Control.less'
import { Layout } from '../../../../../utils/DashboardConfig'
import { Input } from 'antd';
@ControlHOC()
export default class InputControl extends react.Component {
   
    render() {
        
        const {item,datakey,value,maxLength} = this.props
        let max=0;
        if(!maxLength){max=512;}
        return (
            <Input value={value} maxLength="20" onChange={e => {
                this.props.RefreshData(item, datakey, e.target.value)
            }}
            />                     
        )
    }
}