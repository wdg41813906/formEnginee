import react from 'react';
import ConfigItemHOC from './ConfigItemHOC'
import SliderControl from './Control/SliderControl'
@ConfigItemHOC()
export default class LabelConfig extends react.Component {
    render() {
        const {type,item}=this.props
        const { config } = item;
        return (
          <SliderControl name="间距"  RefreshData={this.props.SetData} datakey={`${type}.offset`}
           value={config[type].offset} {...this.props} min={12} max={100}/>
        )
    }
}