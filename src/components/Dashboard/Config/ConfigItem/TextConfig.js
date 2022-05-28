import react from 'react';
import ConfigItemHOC from './ConfigItemHOC'
import ConfigItemBase from './ConfigItemBase'

import ColorControl from './Control/ColorControl'
import SliderControl from './Control/SliderControl'
import FontFamilyControl from './Control/FontFamilyControl';
import SwitchControl from './Control/SwitchControl';
@ConfigItemHOC()
export default class TextConfig extends react.Component {
    render() {
        const { type, item } = this.props
        const { config } = item;
        const { textMin,textMax}=this.props;
       var statetextMin=textMin ?textMin: 8;
       var statetextMax=textMax ?textMax: 24;
        return (
            <div>
            <FontFamilyControl name="文本字体" RefreshData={this.props.SetData} datakey={`${type}.textFontFamily`}
            value={config[type].textFontFamily} {...this.props} />

          <ColorControl name="文本颜色" RefreshData={this.props.SetData} datakey={`${type}.textFill`}
            value={config[type].textFill} {...this.props} />

          <SliderControl name="文本字号" RefreshData={this.props.SetData} datakey={`${type}.textFontSize`}
            value={config[type].textFontSize} {...this.props} min={statetextMin} max={statetextMax} />

          <SwitchControl name="字体加粗" RefreshData={this.props.SetData} datakey={`${type}.textFontWeight`}
            value={config[type].textFontWeight} {...this.props} />

           <SwitchControl name="字体斜体" RefreshData={this.props.SetData} datakey={`${type}.textItalic`}
            value={config[type].textItalic} {...this.props} />
            </div>
        )
    }
}