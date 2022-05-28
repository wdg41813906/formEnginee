import react from 'react';
import ConfigItemHOC from './../../Config/ConfigItem/ConfigItemHOC'
import SwitchControl from './../../Config/ConfigItem/Control/SwitchControl';

@ConfigItemHOC()
export default class BackImageShowConfig extends react.Component{
 

  render() {
    const { ledgerAllConfig } = this.props;
    return (
      <div>
      <SwitchControl name="是否启用"  RefreshData={this.props.SetLedgerData} datakey='backImageShow'
      value={ledgerAllConfig.backImageShow} {...this.props}/>      
      </div>

    )
  }
}