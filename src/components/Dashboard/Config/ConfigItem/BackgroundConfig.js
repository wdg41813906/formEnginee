import react from 'react';
import ConfigItemHOC from './ConfigItemHOC'
import ColorControl from './Control/ColorControl'
@ConfigItemHOC()
export default class BackgroundConfig extends react.Component {
    render() {
        
        const {type,item}=this.props
        const { config } = item;
        return (
          <ColorControl name="背景颜色"  RefreshData={this.props.SetData} datakey={`${type}.backgroundColor`}
           value={config[type].backgroundColor} {...this.props}/>
        )
    }
}