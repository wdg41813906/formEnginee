import ControlHOC from './ControlHOC'
import react from 'react';
import styles from './Control.less'
import { FontFamily } from '../../../../../utils/DashboardConfig'
import { Checkbox ,Row} from 'antd';
const CheckboxGroup = Checkbox.Group;
const plainOptions = ['Apple', 'Pear', 'Orange','1','3'];
const defaultCheckedList = ['Apple', 'Orange'];

@ControlHOC()
export default class HomologyControl extends react.Component {
    render() {
        const {item,datakey,value} = this.props
        return (
           
           <div style={{marginTop:9,marginBottom:5}}>
           {
            value.map(element=>  
                 <div key={element.id} style={{lineHeight:'30px'}}>
                     <Checkbox checked={element.checked} onChange={e=>this.props.RefreshData(item,element)}  value={element.id}>{element.name}</Checkbox>

                     </div>
               )
           }
        </div>
                              
        )
    }
}