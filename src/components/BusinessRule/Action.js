
import styles from './Action.less'

import { Row, Col } from 'antd'
class Action extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: []
        }
    }
    componentDidMount() {
       

        // this.setState({
        //     data: data
        // })
    }
    setCurrent = (ele) => {
        var list = this.state.data;
        list.forEach(item => {
            if (ele.key === item.key) {
                item.select = true;
            } else {
                item.select = false;
            }
        })
        this.setState({
            data: list
        })
    }
    render() {
        const { disable } = this.props;

        var data = this.props.actionData;
        data.forEach(item => {
            if (item.key === this.props.value) {
                item.select = true;
            }else{
                item.select = false;
            }
        })
        return (<div className={styles.actionContent}>

            {data.map(ele => <div onClick={e => {
                if (disable) return;
                this.setCurrent(ele)
                if (this.props.onChange instanceof Function) {
                    this.props.onChange({ key: ele.key, action: ele.action, name: ele.name })
                }
            }} key={ele.key} className={`${styles.actionItem} ${disable ? styles.disable : ''}  ${ele.select ? styles.actionItemSelect : ''}`}>
                <span className={ele.select ? styles.spanSelect : ""}>{ele.name}</span>
                <p>{ele.desc}</p>
            </div>)}

        </div>)
    }
}

export default Action;