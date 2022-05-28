import ControlHOC from './ControlHOC'
import react from 'react';
import styles from './Control.less'
import { ColorMatch } from '../../../../../utils/DashboardConfig'
import { Select } from 'antd';
const Option=Select.Option;
@ControlHOC()
export default class ColorMatchControl extends react.Component {
   
    render() {
        
        const {item,datakey,value} = this.props
        return (
           
            <Select value={value} style={{ width: '100%' }}
            onChange={e => {
                this.props.RefreshData(item, datakey, e)
            }}>
            {
                ColorMatch.map(ele =>
                    <Option value={ele.value}>{ele.name}</Option>
                )
            }
        </Select> 
                              
        )
    }
}