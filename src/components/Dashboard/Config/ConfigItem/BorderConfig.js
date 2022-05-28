import react from 'react';
import ConfigItemHOC from './ConfigItemHOC'
import ColorControl from './Control/ColorControl';
import SliderControl from './Control/SliderControl';
import BorderStyleControl from './Control/BorderStyleControl';

@ConfigItemHOC()
export default class BorderConfig extends react.Component {

    render() {
        const { type, item } = this.props
        const { config } = item;
        return (
            <div>
                <ColorControl name="边框颜色" RefreshData={this.props.SetData} datakey={`${type}.borderColor`}
                    value={config[type].borderColor} {...this.props} />

                <BorderStyleControl name="边框样式" RefreshData={this.props.SetData} datakey={`${type}.borderStyle`}
                    value={config[type].borderStyle} {...this.props} />

                <SliderControl name="边框弧形" RefreshData={this.props.SetData} datakey={`${type}.borderRadius`}
                    value={config[type].borderRadius} {...this.props} min={0} max={8} />



            </div>
        )
    }
}