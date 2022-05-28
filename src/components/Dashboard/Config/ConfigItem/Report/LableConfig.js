import react from 'react';
import ConfigItemHOC from './../ConfigItemHOC'
import { FontFamily } from '../../../../../utils/DashboardConfig'
import { Input, Slider, InputNumber, Col, Row, Select, Switch } from 'antd';
import styles from './../ConfigItem.less'
import ColorControl from './../Control/ColorControl';
import SliderControl from './../Control/SliderControl';
import FontFamilyControl from './../Control/FontFamilyControl';
import SwitchControl from './../Control/SwitchControl';

const Option = Select.Option;
@ConfigItemHOC()
export default class LableConfig extends react.Component {
    render() {
        const { type, item } = this.props
        const { config } = item;
        return (
            <div>
                <ColorControl name="标签颜色" RefreshData={this.props.SetData} datakey={`${type}.labelTextFill`}
                    value={config[type].labelTextFill} {...this.props} />

                <SliderControl name="标签字号" RefreshData={this.props.SetData} datakey={`${type}.lableTextFontSize`}
                    value={config[type].lableTextFontSize} {...this.props} min={8} max={24} />

                <SliderControl name="旋转角度" RefreshData={this.props.SetData} datakey={`${type}.lableTextRotate`}
                    value={config[type].lableTextRotate} {...this.props} min={-90} max={90} />

                <FontFamilyControl name="文本字体" RefreshData={this.props.SetData} datakey={`${type}.labelTextFontFamily`}
                    value={config[type].labelTextFontFamily} {...this.props} />

                <SliderControl name="距轴距离" RefreshData={this.props.SetData} datakey={`${type}.labelOffset`}
                    value={config[type].labelOffset} {...this.props} min={5} max={100} />

                <SwitchControl name="字体加粗" RefreshData={this.props.SetData} datakey={`${type}.lableTextWeight`}
                    value={config[type].lableTextWeight} {...this.props} />

                <SwitchControl name="字体斜体" RefreshData={this.props.SetData} datakey={`${type}.lableTextItalic`}
                    value={config[type].lableTextItalic} {...this.props} />
            </div>
        )
    }
}