import react from 'react';
import ConfigItemHOC from './ConfigItemHOC'

import ConfigItemBase from './ConfigItemBase'

import InputControl from './Control/InputControl';
import TextAreaControl from './Control/TextAreaControl';
import TextAlignControl from './Control/TextAlignControl';

@ConfigItemHOC()
export default class TitleConfig extends ConfigItemBase {
  render() {
    
    const { item,type } = this.props;
    const { Title } = item.config;
    const { config } = item;
    
    return (
      <div>

      <InputControl name="名称"  RefreshData={this.props.SetData} datakey={`${type}.name`}
      value={config[type].name} {...this.props}/>
      </div>

    )
  }
}