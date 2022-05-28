import react from 'react';
import ConfigItemHOC from './ConfigItemHOC'
import ConfigItemBase from './ConfigItemBase'

import ColorControl from './Control/ColorControl'
import SliderControl from './Control/SliderControl'
import FontFamilyControl from './Control/FontFamilyControl';
import SwitchControl from './Control/SwitchControl';
import ColorMatchControl from './Control/ColorMatchControl'
@ConfigItemHOC()
export default class ReportColorConfig extends react.Component {
  render() {
    const { type, item } = this.props
    const { config } = item;
    const { textMin, textMax } = this.props;
    var statetextMin = textMin ? textMin : 8;
    var statetextMax = textMax ? textMax : 24;
    return (
      <div>
        <ColorMatchControl name="配色模式" RefreshData={this.props.SetData} datakey={`${type}.colorMatchMode`}
          value={config[type].colorMatchMode} {...this.props} />
        {
          config[type].colorMatchMode === 'custom' && (
            <div>
              <SwitchControl name="渐变" RefreshData={this.props.SetData} datakey={`${type}.colorMatchGradualChange`}
                value={config[type].colorMatchGradualChange} {...this.props} />

              <div>
                {
                 config[type].colorMatchProgrammes&& config[type].colorMatchProgrammes.map(pItem=>
                    !config[type].colorMatchGradualChange ?
                    <ColorControl name={pItem.name} RefreshData={this.props.SetColorMatchProgrammesData} datakey={`${pItem.code}_from`}
                      value={pItem.fromColor} {...this.props} /> :
                    <div>
                      <ColorControl name={`${pItem.name}(from)`} RefreshData={this.props.SetColorMatchProgrammesData} datakey={`${pItem.code}_from`}
                        value={pItem.fromColor} {...this.props} />
                      <ColorControl name={`${pItem.name}(to)`} RefreshData={this.props.SetColorMatchProgrammesData} datakey={`${pItem.code}_to`}
                         value={pItem.toColor} {...this.props} />
                    </div>
                    )
               
                }


              </div>
            </div>
          )
        }


      </div>
    )
  }
}