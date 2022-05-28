import ControlHOC from './ControlHOC'
import react from 'react';
import styles from './Control.less'
import { Layout } from '../../../../../utils/DashboardConfig'
import { Input } from 'antd';
@ControlHOC()
export default class TextControl extends react.Component {
   
    render() {
        
        const {item,datakey,value} = this.props
        return (
            <div>
            {value.map(ele=><span>{ele.name}</span>)}
            </div>                 
        )
    }
}