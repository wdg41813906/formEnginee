import react  from 'react';

import BackgroundConfig from '../ConfigItem/BackgroundConfig'
import BorderConfig from '../ConfigItem/BorderConfig'

const type='style';
export default class StyleType extends react.Component{

    render(){
        const {item}=this.props;
        return(
            <div>
            <BackgroundConfig item={item} title="画布背景" type={type} {...this.props}/>
            <BorderConfig item={item} title="边框" type={type} {...this.props}/>
            </div>
        )
    }
}