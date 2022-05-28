import react  from 'react';

import LineConfig from './../ConfigItem/Report/LineConfig'
import LableConfig from './../ConfigItem/Report/LableConfig'
const type='yAxis';
export default class YAxisType extends react.Component{

    render(){
        const {item}=this.props;
        return(
            <div>
            <LineConfig item={item} title="轴线" type={type}  {...this.props}/>
            <LableConfig item={item} title="轴标签" type={type}  {...this.props}/>
           
            </div>
        )
    }
}