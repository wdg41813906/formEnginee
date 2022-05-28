import react  from 'react';

import PaddingConfig from '../ConfigItem/PaddingConfig'
import ReportColorConfig from '../ConfigItem/ReportColorConfig';
const type="report";
export default class ReportType extends react.Component{

    render(){
        const {item}=this.props;
        return(
            <div>
            <PaddingConfig item={item} title="边距" type={type} {...this.props}/>
            <ReportColorConfig item={item} title="图表配色" type={type}  {...this.props}/>
            </div>
        )
    }
}