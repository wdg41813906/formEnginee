
import styles from './Content.less'
import { Icon ,Popconfirm } from 'antd';
const Content = props => {

    return (
        <div className={styles.contentWrap}
        onClick={e=>{e.stopPropagation(); }}>
           <p className={styles.copy} onClick={ e=> { props.Copy(props.item)}}>复制</p>
           <Popconfirm title="确定删除？" onConfirm={ e=>{ props.Remove(props.item.applicationTemplateId) }}
            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
              <p className={styles.del}>删除</p>
           </Popconfirm>
       </div>
    )
}

export default Content;