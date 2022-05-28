import React, { PureComponent } from 'react';
import { Input } from 'antd';
import Attribute from './Attribute.js'
const styles = {
    area: {
        display: "flex",
        alignItems: "center",
        marginBottom: "10px"
    },
    areaContent: {
        flex: 1
    }
}

@Attribute('标签')
class TagText extends PureComponent {
    render() {
        let { onChange, headTag, tailTag } = this.props;
        return <React.Fragment>
            <div style={styles.area}>
                <div style={styles.areaName}>头部：</div>
                <div style={styles.areaContent}><Input type='text' value={headTag} placeholder='头部标签' onChange={({ target: { value } }) => { onChange({ headTag: value }) }} /></div>
            </div>
            <div style={styles.area}>
                <div style={styles.areaName}>尾部：</div>
                <div style={styles.areaContent}><Input type='text' value={tailTag} placeholder='尾部标签' onChange={({ target: { value } }) => { onChange({ tailTag: value }) }} /></div>
            </div>
        </React.Fragment>;
    }
}
// export default Position;
export default {
    Component: TagText,
    getProps: (props) => {
        let { onChange, headTag, tailTag } = props;
        return { onChange, headTag, tailTag };
    }
};
