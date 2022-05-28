import react from 'react';
import styles from './Operation.less';
import {Icon} from "antd"
import AddDashboard from './AddDashboard'
import SearchCom from './SearchCom'
import {Map, List, fromJS,} from 'immutable'
import {DesignType} from '../../../utils/DashboardConfig'
import BaseImmutableComponent from '../../../components/BaseImmutableComponent'

export default class Operation extends BaseImmutableComponent {

    constructor(props) {
        super(props)

    }

    componentWillMount() {
        this.props.Init()
    }

    render() {
        return (
            <div>
                <div className={styles.cooperate} style={{top: this.props.location === '/ledgerIndex' ? 0 : 126}}>
                    <div className={styles.cooperateLeft}>
                        <div onClick={
                            ele => {
                                this.props.AddDashboardToggle({designType: DesignType.Statistic})
                            }
                        } className={`${styles.cooperateItem} ${styles.cooperateSpecial}`}>
                            <Icon type="plus"/>
                            <span className={styles.cooperateText}>统计表</span>
                        </div>
                        <div onClick={
                            ele => {
                                this.props.AddDashboardToggle({designType: DesignType.Detail})
                            }
                        } className={`${styles.cooperateItem} ${styles.cooperateSpecial}`}>
                            <Icon type="plus"/>
                            <span className={styles.cooperateText}>明细表</span>
                        </div>
                        <div onClick={
                            e => {
                                this.props.SearchComToggle();
                                this.props.ReportListInit();
                            }

                        } className={`${styles.cooperateItem} ${styles.cooperateSpecial}`}>
                            <Icon type="plus"/>
                            <span className={styles.cooperateText}>筛选组件</span>
                        </div>
                        <div onClick={
                            e => this.props.SearchButtonAdd()
                        } className={`${styles.cooperateItem} ${styles.cooperateSpecial}`}>
                            <Icon type="plus"/>
                            <span className={styles.cooperateText}>筛选按钮</span>
                        </div>
                    </div>
                    <div className={styles.cooperateRight}>
                        <div className={`${styles.cooperateItem} ${styles.cooperateSpecial}`}>

                            <span className={styles.cooperateText}>发布</span>
                        </div>
                        <div onClick={
                            e => this.props.Save()
                        } className={`${styles.cooperateItem} ${styles.cooperateSpecial}`}>

                            <span className={styles.cooperateText}>保存</span>
                        </div>
                        <div onClick={
                            e => this.props.Preview()
                        } className={`${styles.cooperateItem} ${styles.cooperateSpecial}`}>

                            <span className={styles.cooperateText}>预览</span>
                        </div>
                    </div>


                </div>
                <AddDashboard {...this.props}/>
                <SearchCom {...this.props}/>
            </div>
        )
    }
}
