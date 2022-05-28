
import { Modal } from 'antd';
import styles from './AppView.less'
export default class Modify extends React.Component {

    render(){
        const {viewShow,currentItem}=this.props;
        return(
            <Modal
            title="预览应用"
            style={{ top: 100 }}
            visible={viewShow}
            onOk={() => this.props.ViewToggle()}
            onCancel={() => this.props.ViewToggle()}
        >

          <div className={styles.viewWrap}> 
             <div className={styles.viewItem}>
                 <div className={styles.viewTitle}>
                    应用名称
                 </div>
                 <div className={styles.viewContent}>

                 {currentItem.name}
                 </div>
             </div>
             <div className={styles.viewItem}>
                 <div className={styles.viewTitle}>
                    应用描述
                 </div>
                 <div className={styles.viewContent}>

                 {currentItem.desc}
                 </div>
             </div>
             </div>
        </Modal>
        )
    }
}