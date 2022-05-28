import ControlHOC from './ControlHOC'
import react from 'react';
import styles from './Control.less'
import { FontFamily } from '../../../../../utils/DashboardConfig'
import { Select } from 'antd';
const Option=Select.Option;
@ControlHOC()
export default class FontFamilyControl extends react.Component {
   
    render() {
        
        const {item,datakey,value} = this.props
        return (
           
            <Select value={value} style={{ width: '100%' }}
            onChange={e => {
                this.props.RefreshData(item, datakey, e)
            }}>
            {
                FontFamily.map(ele =>
                    <Option value={ele.value}>{ele.name}</Option>
                )
            }
        </Select> 
                              
        )
    }
}