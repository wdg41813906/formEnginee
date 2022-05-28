import react from 'react';
import { Icon } from 'antd'
export default class None extends react.Component {
   
    render(){
        return(
            <div style={{
                height:150,
                
            }}>
                 <div style={{
                     width:100,
                     height:80,
                     textAlign:'center',
                     margin:'80px auto 0px'
                     
                 }}>
                 <Icon style={{
                     fontSize:39
                 }}  type="file-text" />
                 <p style={{
                     fontSize:16,
                     color:'#000'
                 }}>
                   暂无
                  </p>
                 </div>
            </div>
        )
    }

}