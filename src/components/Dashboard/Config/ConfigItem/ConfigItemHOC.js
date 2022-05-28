import { Button } from 'antd';
import styles from './ConfigItem.less'
function ConfigItemHOC(canChange) {
  return function (WrappedComponent) {
    return class extends React.Component {
      render() {
        return (<div className={styles.attrItem}>
          <div className={styles.attrTitle}>
            <div className={styles.attrTitleName}>{this.props.title}</div>
           
          </div>
          <div >
            <WrappedComponent  {...this.props} />
          </div>
        </div>)
      }
    }
  }
}
export default ConfigItemHOC;