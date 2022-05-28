import react from 'react';
import ConfigItemHOC from './../ConfigItemHOC'
import ColorControl from './../Control/ColorControl'

@ConfigItemHOC()
export default class LineConfig extends react.Component {
 
    render() {
        const {type,item}=this.props
        const { config } = item;
        return (
            <div>
            <ColorControl name="轴线颜色"  RefreshData={this.props.SetData} datakey={`${type}.lineStroke`}
            value={config[type].lineStroke} {...this.props}/>
            </div>
        )
    }
}