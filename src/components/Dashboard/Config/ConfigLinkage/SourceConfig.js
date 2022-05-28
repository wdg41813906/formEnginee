import react from 'react';
import ConfigItemHOC from './../ConfigItem/ConfigItemHOC'
import TextControl from './../ConfigItem/Control/TextControl';
import HomologyControl from './../ConfigItem/Control/HomologyControl'
import NonHomologyControl from './../ConfigItem/Control/NonHomologyControl'
@ConfigItemHOC()
export default class SourceConfig extends react.Component {
    render() {
        const { type, item } = this.props
        const { config } = item;
        
        return (
            <div>
                <TextControl name="源字段" RefreshData={this.props.SetData}
                 datakey={`${type}.borderColor`}
                    value={config.linkAge.sourceFields} {...this.props} />

                 <HomologyControl  RefreshData={this.props.SetLinkageHomologyData} item={item} value={config.linkAge.homologys} name="同源关联"/>
                 <NonHomologyControl  RefreshData={this.props.SetLinkageData} item={item} value={config.linkAge.nonHomologys} name="非同源关联"/>
                 

            </div>
        )
    }
}