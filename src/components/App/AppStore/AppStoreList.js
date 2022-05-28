import react from 'react';
import { Tabs, Row, Col } from 'antd';
// import { fileServer } from '../../../utils/config'
import styles from './AppStoreList.less';
import AppView from './AppView'
import None from './../Application/Detail/None'
const data = [1, 2, 3, 4, 5, 6, 7, 8]
export default class AppStoreList extends react.Component {
    constructor(props) {
        super(props)
        //this.props.GetListPaged(1);
    }
    render() {
        const { appStoreList } = this.props
        return (
            <div>
                <AppView {...this.props} />
                <Row>

                    {
                        appStoreList.length <= 0 && <None />
                    }
                    {
                        appStoreList.map(ele =>
                            <Col key={ele.id}
                                onMouseEnter={
                                    e => {
                                        this.props.ItemOver(ele)
                                    }
                                }
                                onMouseLeave={
                                    e => {
                                        this.props.ItemOut(ele)
                                    }
                                }
                                className={styles.appItem} span={6}>
                                <div className={styles.appCard}>
                                    <div className={styles.appIcon}>
                                        <img src={`${config.fileServer}${ele.icon}`} />
                                        {
                                            ele.hover &&
                                            <div className={styles.mask}>
                                                <div onClick={
                                                    e=>{
                                                        this.props.ViewToggle()
                                                        this.props.SetCurrentItem(ele)
                                                    }
                                                } className={styles.maskContent}>
                                                    <div
                                                        style={{
                                                            backgroundPosition: '-33px -80px',
                                                            backgroundImage: `url(${require('../../../assets/icon.png')})`
                                                        }}
                                                        className={styles.maskIcon}/>
                                                    <div className={styles.appView}>
                                                        预览应用
                                                   </div>

                                                </div>
                                                <div className={styles.maskContent}>
                                                    <div className={styles.maskIcon}

                                                        style={{
                                                            backgroundPosition: '-33px -46px',
                                                            backgroundImage: `url(${require('../../../assets/icon.png')})`
                                                        }}>
                                                    </div>
                                                    <div className={styles.appView}>
                                                        安装应用
                                   </div>
                                                </div>
                                            </div>
                                        }

                                    </div>
                                    <div className={styles.title}>
                                        {ele.name}
                                    </div>
                                </div>
                            </Col>)
                    }


                </Row>
            </div>
        )
    }
}
