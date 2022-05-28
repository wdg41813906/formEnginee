import ControlHOC from './ControlHOC'
import react from 'react';
import styles from './Control.less'
import { BorderStyle } from '../../../../../utils/DashboardConfig'
import { Select } from 'antd';
const Option=Select.Option;
@ControlHOC()
export default class BorderStyleControl extends react.Component {
   
    render() {
        
        const {item,datakey,value} = this.props
        return (
           
            <Select value={value} style={{ width: '100%' }}
            onChange={e => {
                this.props.RefreshData(item, datakey, e)
            }}>
            {
                BorderStyle.map(ele =>
                    <Option value={ele.value}>{ele.name}</Option>
                )
            }
        </Select> 
                              
        )
    }
}