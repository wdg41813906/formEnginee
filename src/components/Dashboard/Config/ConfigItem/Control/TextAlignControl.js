import ControlHOC from './ControlHOC'
import react from 'react';
import styles from './Control.less'
import { Layout } from '../../../../../utils/DashboardConfig'
import { Radio } from 'antd';
@ControlHOC()
export default class TextAlignControl extends react.Component {
   
    render() {
        
        const {item,datakey,value} = this.props
        return (
            <Radio.Group value={value} onChange={
                e => {
                  this.props.RefreshData(item, datakey, e.target.value)
                }
              }>
                <Radio.Button value="left">左</Radio.Button>
                <Radio.Button value="center">中</Radio.Button>
                <Radio.Button value="right">右</Radio.Button>
              </Radio.Group>
           
                            
        )
    }
}