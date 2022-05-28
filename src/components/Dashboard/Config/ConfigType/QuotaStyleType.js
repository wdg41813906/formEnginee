import react  from 'react';

import BackgroundConfig from '../ConfigItem/BackgroundConfig'
import BorderConfig from '../ConfigItem/BorderConfig';
import TextConfig from '../ConfigItem/TextConfig';
const type='style';
export default class QuotaStyleType extends react.Component{

    render(){
        const {item}=this.props;
        return(
            <div>
            <BackgroundConfig item={item} title="画布背景" type={type} {...this.props}/>
            <BorderConfig item={item} title="边框" type={type} {...this.props}/>
            <TextConfig item={item} title="文本" textMin={8} textMax={48} type={type} {...this.props}/>
            </div>
        )
    }
}