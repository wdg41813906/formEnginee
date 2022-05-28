import react from 'react';
import ConfigItemHOC from './ConfigItemHOC'
import ConfigItemBase from './ConfigItemBase'

import ColorControl from './Control/ColorControl'
import SliderControl from './Control/SliderControl'
import FontFamilyControl from './Control/FontFamilyControl';
import SwitchControl from './Control/SwitchControl';
@ConfigItemHOC()
export default class RangeTextConfig extends react.Component {
    render() {
        const { type, item } = this.props
        const { config } = item;
        return (
            <div>
            <FontFamilyControl name="文本字体" RefreshData={this.props.SetData} datakey={`${type}.textFontFamily`}
            value={config[type].textFontFamily} {...this.props} />

          <ColorControl name="文本颜色" RefreshData={this.props.SetData} datakey={`${type}.textFill`}
            value={config[type].textFill} {...this.props} />

        

          <SwitchControl name="字体加粗" RefreshData={this.props.SetData} datakey={`${type}.textFontWeight`}
            value={config[type].textFontWeight} {...this.props} />

           <SwitchControl name="字体斜体" RefreshData={this.props.SetData} datakey={`${type}.textItalic`}
            value={config[type].textItalic} {...this.props} />
            </div>
        )
    }
}