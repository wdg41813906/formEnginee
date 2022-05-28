import react  from 'react';

import BackgroundConfig from '../ConfigItem/BackgroundConfig'
import BorderConfig from '../ConfigItem/BorderConfig';
import RangeTextConfig from '../ConfigItem/RangeTextConfig';
const type='style';
export default class RangeStyleType extends react.Component{

    render(){
        const {item}=this.props;
        return(
            <div>
            <BackgroundConfig item={item} title="画布背景" type={type} {...this.props}/>
            <BorderConfig item={item} title="边框" type={type} {...this.props}/>
            <RangeTextConfig item={item} title="文本" type={type} {...this.props}/>
            </div>
        )
    }
}