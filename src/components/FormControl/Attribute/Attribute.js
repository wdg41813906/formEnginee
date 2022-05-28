import React from 'react'
import { Button } from 'antd';
import styles from '../../../components/FormControl/Attribute.less'
function Attribute(text, canChange) {
  return function (WrappedComponent) {
    return class extends React.PureComponent {
      render() {
        return (<div className={styles.attrItem}>
          <div className={styles.attrTitle}>
            <span className={styles.attrTitleName}>{text}</span>
            {/* {canChange ? <Button type="primary">{this.props.typeName}</Button> : ""} */}
          </div>
          <div >
            <WrappedComponent  {...this.props} />
          </div>
        </div>)
      }
    }
  }
}
export default Attribute;
