import { Component } from "react"
import { Button, Icon, Input, message, Select, Modal, Radio } from "antd"
import { getInterfaceConfig, saveInterfaceConfig } from "../../services/FormViewList/FormViewList"
import { Guid } from "../../utils/com"
import styles from "./InterfaceConfig.less"

const modalBody = {
    maxHeight: "40em",
    overflowY: "auto"
}

class InterfaceConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            configArr: []
        }
        this.onChange = this.onChange.bind(this);
        this.submit = this.submit.bind(this);
        this.initData();
    }
    onChange(id, type, e) {
        let { configArr } = this.state;
        let existItem = configArr.filter(item => item.id === id)[0];
        let indexOf = configArr.indexOf(existItem);
        existItem[type] = e.target.value;
        configArr.splice(indexOf, 1, existItem);
        this.setState({ configArr });
    }
    initData() {
        let me = this;
        getInterfaceConfig().then(res => {
            if (res && res.data) {
                me.setState({
                    configArr: res.data.map(item => { item.id = Guid(); return item; })
                });
            }
        });
    }
    okOrCancel(type) { // type 为 1 标识 确定
        type === 1 ? this.submit(this.props.changeInterfaceVisible) : this.props.changeInterfaceVisible(false);
    }
    submit(callback) {
        saveInterfaceConfig(this.state.configArr).then(res => {
            if (res.data && res.data.isValid) {
                callback && callback(false);
            }
        });
    }
    render() {
        const { configArr } = this.state;
        const { interfaceConfigVisible } = this.props;
        return (
            <Modal
                title="接口配置"
                visible={interfaceConfigVisible}
                // centered={true}
                destroyOnClose={true}
                width={1100}
                maskClosable={false}
                okText="确认"
                cancelText="取消"
                bodyStyle={modalBody}
                onCancel={this.okOrCancel.bind(this, 0)}
                onOk={this.okOrCancel.bind(this, 1)}
            >
                <div className={styles.item}>
                    <div className={styles.urlName}>接口名称</div>
                    <div className={styles.urlLoc}>接口地址</div>
                    <div className={styles.urlMethod}>请求方式</div>
                </div>
                {
                    configArr.length ? configArr.map((item, i) => (
                        <div className={styles.item} key={i}>
                            <div className={styles.urlName}>{item.label}</div>
                            <div className={styles.urlLoc}>
                                <Input value={item.url} onChange={this.onChange.bind(null, item.id, "url")} />
                            </div>
                            <div className={styles.urlMethod}>
                                <Radio.Group value={item.method} onChange={this.onChange.bind(null, item.id, "method")}>
                                    <Radio.Button value="POST">post</Radio.Button>
                                    <Radio.Button value="GET">get</Radio.Button>
                                </Radio.Group>
                            </div>
                        </div>
                    )) : null
                }
            </Modal>
        )
    }
}
export default InterfaceConfig;