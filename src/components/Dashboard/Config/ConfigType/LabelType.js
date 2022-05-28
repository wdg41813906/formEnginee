import react  from 'react';

import LabelConfig from '../ConfigItem/LabelConfig';
import TextConfig from '../ConfigItem/TextConfig'

const type='label';
export default class LabelType extends react.Component{

    render(){
        const {item}=this.props;
        return(
            <div>
            <LabelConfig item={item} title="标注" type={type} {...this.props}/>
            <TextConfig item={item} title="文本" type={type} {...this.props}/>
            </div>
        )
    }
}