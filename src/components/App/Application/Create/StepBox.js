
import react from 'react';
import styles from './../Create.less'
export default class StepBox extends react.Component {

    render(){
        const {item}=this.props;
        return(
            <div className={`${styles.stepBox} ${(item.select||item.choose) ? styles.stepBoxSelect : ''}`}
            onClick={e=>
            this.props.ItemClick(item)}
            onMouseOut={
                e => {
                    this.props.ItemFn(item)
                }
            }
            onMouseOver={
                e => {
                    this.props.ItemFn(item)
                }
            }>
            <div className={styles.stepWrap}>
                <div className={`${styles.reprtIcon} ${(item.select||item.choose) ?
                    item.iconSel : item.icon}`}>
                   {item.choose&& <div className={styles.reprtIconChoose}></div>}
                </div>
                <div className={styles.stepContent}>
                    <div className={styles.stepTitle}>
                        {item.name}
                    </div>
                    <div className={styles.stepDesc}>
                        {item.desc}
                    </div>
                </div>
            </div>
        </div>
        )
    }
}