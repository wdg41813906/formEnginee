import ControlHOC from './ControlHOC'
import react from 'react';
import styles from './Control.less'
import { Layout } from '../../../../../utils/DashboardConfig'
import { Input } from 'antd';
@ControlHOC()
export default class TextAreaControl extends react.Component {
   
    render() {
        
        const {item,datakey,value} = this.props
        return (
            <Input.TextArea maxLength="128"   style={{ resize: 'none' ,height:48}} value={value} onChange={e => {
                
                this.props.RefreshData(item, datakey, e.target.value)
            }}
            />                     
        )
    }
}