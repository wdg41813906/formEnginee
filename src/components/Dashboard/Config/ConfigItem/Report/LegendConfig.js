import react from 'react';
import ConfigItemHOC from './../ConfigItemHOC'

import ColorControl from './../Control/ColorControl';
import SliderControl from './../Control/SliderControl';
import FontFamilyControl from './../Control/FontFamilyControl';
import SwitchControl from './../Control/SwitchControl';
import PositionControl from './../Control/PositionControl';
import LayoutControl from './../Control/LayoutControl';
@ConfigItemHOC()
export default class LegendConfig extends react.Component {
   
    render() {
        
        const { type, item } = this.props
        const { config } = item;
        return (
            <div>
                <SwitchControl name="是否显示" RefreshData={this.props.SetData} datakey={`${type}.visible`}
                    value={config[type].visible} {...this.props} />
                
                <PositionControl name="位置" RefreshData={this.props.SetData} datakey={`${type}.position`}
                value={config[type].position} {...this.props} />

                <LayoutControl name="排列方式" RefreshData={this.props.SetData} datakey={`${type}.layout`}
                value={config[type].layout} {...this.props} />

                <SliderControl name="间距" RefreshData={this.props.SetData} datakey={`${type}.itemGap`}
                    value={config[type].itemGap} {...this.props} min={5} max={20} />

              

            </div>
        )
    }
}