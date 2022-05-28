import react  from 'react';
import SourceConfig from '../ConfigLinkage/SourceConfig';

const type='legend';
export default class LegendType extends react.Component{

    render(){
        const {item}=this.props;
        return(
            <div>
            <SourceConfig item={item} title="联动" type={type} {...this.props}/>
            
            </div>
        )
    }
}