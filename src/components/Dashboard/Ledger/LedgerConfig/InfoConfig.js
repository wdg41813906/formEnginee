import react from 'react';
import ConfigItemHOC from './../../Config/ConfigItem/ConfigItemHOC'
import InputControl from './../../Config/ConfigItem/Control/InputControl';
import TextAreaControl from './../../Config/ConfigItem/Control/TextAreaControl';
import TextAlignControl from './../../Config/ConfigItem/Control/TextAlignControl';
@ConfigItemHOC()
export default class TitleConfig extends react.Component{
  render() {
    const { ledgerAllConfig } = this.props;
    return (
      <div>
      <InputControl name="名称"  RefreshData={this.props.SetLedgerData} datakey='name'
      value={ledgerAllConfig.name} {...this.props}/>
      <TextAreaControl  name="备注"  RefreshData={this.props.SetLedgerData} datakey='reMark'
      value={ledgerAllConfig.reMark} {...this.props} />
       <TextAlignControl name="对齐方式"  RefreshData={this.props.SetLedgerData} datakey='textAlign'
       value={ledgerAllConfig.textAlign} {...this.props}/>
      </div>

    )
  }
}