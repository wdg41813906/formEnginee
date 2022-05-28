import { Button } from 'antd';
import styles from './Control.less'
function ConfigItemHOC() {
    return function (WrappedComponent) {
        return class extends React.Component {
            render() {
                return (
                    <div className={styles.item}>
                        <div className={styles.itemLeft}>
                            {this.props.name}
                         </div>
                        <div className={styles.itemRight}>
                           <WrappedComponent {...this.props}/>
                        </div>
                    </div>)
            }
        }
    }
}
export default ConfigItemHOC;