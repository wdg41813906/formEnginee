import react  from 'react';

import TitleConfig from '../ConfigItem/TitleConfig';
import BackgroundConfig from '../ConfigItem/BackgroundConfig'
import TextConfig from '../ConfigItem/TextConfig'

const type='title';
export default class TitleType extends react.Component{

    render(){
        const {item}=this.props;
        
        
        return(
            <div>
            <TitleConfig item={item} maxLength={20} title="标题" type={type}  {...this.props}/>
            <BackgroundConfig item={item} title="背景" type={type} {...this.props}/>
            <TextConfig item={item} title="文本" type={type} {...this.props}/>
            </div>
        )
    }
}