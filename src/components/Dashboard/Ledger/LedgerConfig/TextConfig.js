import react from 'react';
import ConfigItemHOC from './../../Config/ConfigItem/ConfigItemHOC'

import ColorControl from './../../Config/ConfigItem/Control/ColorControl';
import SliderControl from'./../../Config/ConfigItem/Control/SliderControl'
import FontFamilyControl from './../../Config/ConfigItem/Control/FontFamilyControl';
import SwitchControl from './../../Config/ConfigItem/Control/SwitchControl';
@ConfigItemHOC()
export default class TextConfig extends react.Component {
    render() {
        const { ledgerAllConfig } = this.props;
        return (
            <div>
            <FontFamilyControl name="文本字体" RefreshData={this.props.SetLedgerData} datakey={`textFontFamily`}
            value={ledgerAllConfig.textFontFamily} {...this.props} />

          <ColorControl name="文本颜色" RefreshData={this.props.SetLedgerData} datakey={`textFill`}
            value={ledgerAllConfig.textFill} {...this.props} />

          <SliderControl name="文本字号" RefreshData={this.props.SetLedgerData} datakey={`textFontSize`}
            value={ledgerAllConfig.textFontSize} {...this.props} min={8} max={24} />

          <SwitchControl name="字体加粗" RefreshData={this.props.SetLedgerData} datakey={`textFontWeight`}
            value={ledgerAllConfig.textFontWeight} {...this.props} />

           <SwitchControl name="字体斜体" RefreshData={this.props.SetLedgerData} datakey={`textItalic`}
            value={ledgerAllConfig.textItalic} {...this.props} />
            </div>
        )
    }
}