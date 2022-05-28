import react from 'react';
import ConfigItemHOC from './ConfigItemHOC'
import ConfigItemBase from './ConfigItemBase'
import SliderControl from './Control/SliderControl'

const min=10;
const max=90;
@ConfigItemHOC()
export default class PaddingConfig extends react.Component {
    render() {
        const {type,item}=this.props
        const { config } = item;
        return (
            <div>
            <SliderControl name="上"  RefreshData={this.props.SetData} datakey={`${type}.paddingTop`}
            value={config[type].paddingTop} {...this.props}  min={min} max={max}/>

            <SliderControl name="右"  RefreshData={this.props.SetData} datakey={`${type}.paddingRight`}
            value={config[type].paddingRight} {...this.props}  min={min} max={max}/>
              
            <SliderControl name="下"  RefreshData={this.props.SetData} datakey={`${type}.paddingBottom`}
            value={config[type].paddingBottom} {...this.props}  min={min} max={max}/>

            <SliderControl name="左"  RefreshData={this.props.SetData} datakey={`${type}.paddingLeft`}
            value={config[type].paddingLeft} {...this.props}  min={min} max={max}/>
                
            </div>
        )
    }
}