import react  from 'react';

import ButtonContentConfig from '../ConfigItem/ButtonContentConfig';
import BackgroundConfig from '../ConfigItem/BackgroundConfig'
import TextConfig from '../ConfigItem/TextConfig'

const type='title';
export default class ButtonType extends react.Component{

    render(){
        const {item}=this.props;
        return(
            <div>
            <ButtonContentConfig item={item} title="内容" type={type}  {...this.props}/>
            <TextConfig item={item} title="文本" type={type} {...this.props}/>
            </div>
        )
    }
}