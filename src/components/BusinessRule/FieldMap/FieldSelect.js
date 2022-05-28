
import { Collapse, Icon, Select, Menu, Dropdown, Tooltip } from 'antd';
import styles from './FieldSelect.less'
class FieldSelect extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            fieldList: []
        }
    }

    componentWillMount() {

    }
    render() {
        const { data } = this.props;
        const menu = (<Menu style={{ width: 200, border: '1px solid #ddd',maxHeight:'500px',overflow:'auto' }}>
            {
                data && data.map(ele => <Menu.Item disabled={ele.disable} onClick={
                    e=>{this.props.fieldChange(ele)}
                } key={ele.id} >
                    <span className={styles.itemSpan}> {ele.name}</span>
                </Menu.Item>)
            }

        </Menu>)
        return (<div >
            <Dropdown  trigger={['click']} overlay={menu} placement="topCenter">
                <p className={styles.actionText}><Icon type="plus" /> {this.props.title} </p>
            </Dropdown>
        </div>)
    }
}

export default FieldSelect;