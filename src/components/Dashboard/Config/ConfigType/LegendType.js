import react  from 'react';

import LegendConfig from '../ConfigItem/Report/LegendConfig';
import TextConfig from '../ConfigItem/TextConfig';

const type='legend';
export default class LegendType extends react.Component{

    render(){
        const {item}=this.props;
        return(
            <div>
            <LegendConfig item={item} title="图例" type={type} {...this.props}/>
            <TextConfig item={item} title="文本" type={type} {...this.props}/>
            
            </div>
        )
    }
}