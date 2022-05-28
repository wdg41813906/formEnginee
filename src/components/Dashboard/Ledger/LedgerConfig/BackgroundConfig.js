import react from 'react';
import ConfigItemHOC from './../../Config/ConfigItem/ConfigItemHOC'

import ColorControl from './../../Config/ConfigItem/Control/ColorControl';
@ConfigItemHOC()
export default class BackgroundConfig extends react.Component {
    render() {
        const { ledgerAllConfig } = this.props;
      
        return (
          <ColorControl name="背景颜色"  RefreshData={this.props.SetLedgerData} datakey={`backgroundColor`}
           value={ledgerAllConfig.backgroundColor} {...this.props}/>
        )
    }
}