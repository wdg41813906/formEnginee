import React from 'react';
// import config from '../../utils/config';
import { Layout } from 'antd';
import styles from './main.less';


const { Footer } = Layout;
class Foot extends React.PureComponent {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <Footer style={{ 'textAlign': 'center', "padding": "10px 0", background: "#f0f2f5" }}>
                {config.footerText}
            </Footer>
        )
    }
}

export default Foot;
