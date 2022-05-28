import react from 'react';
import styles from './SearchCom.less'
import DashboardConfig  from '../../../utils/DashboardConfig'
import BaseImmutableComponent from '../../../components/BaseImmutableComponent'
import {
    Modal, List, Icon, Pagination, Checkbox, Row, Col, TreeSelect,
    Input
} from 'antd';
import { is } from 'immutable';
import SearchLeft from './Search/SearchLeft'
import SearchMiddle from './Search/SearchMiddle'
import SearchRight from './Search/SearchRight'
function showTotal(total) {
    return `Total ${total} items`;
}

export default class SearchCom extends react.Component {

    // shouldComponentUpdate(nextProps, nextState) {

    //     const thisProps = this.props || {};
    //     const thisState = this.state || {};
    //     nextState = nextState || {};
    //     nextProps = nextProps || {};

    //     if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
    //         Object.keys(thisState).length !== Object.keys(nextState).length) {
    //         return true;
    //     }

    //     for (const key in nextProps) {
    //         if (!is(thisProps[key], nextProps[key])) {
    //             return true;
    //         }
    //     }

    //     for (const key in nextState) {
    //         if (!is(thisState[key], nextState[key])) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }
    constructor(props) {
        super(props);
        this.state = {
            pageIndex: 1,
            value: undefined,
        }
    }
    onChange = (value) => {
        this.setState({ value });
    }
    render() {

        const { currentField, reportFieldData } = this.props;
        return (
            <div>
                <Modal
                    title="添加删选器"
                    centered
                    width={800}
                    maskClosable={false}
                    bodyStyle={{ height: 380, overflow: 'hidden' }}
                    visible={this.props.searchComShow}
                    onOk={() => {
           this.props.searchComMode===DashboardConfig.Mode.Add?
                        this.props.SearchComAdd():
                        this.props.SearchComEdit()
                    }}
                    onCancel={() => this.props.SearchComToggle()}
                >
                    <div className={styles.SearchWrap}>
                        <div className={`${styles.contentWrap} `}>
                            <div className={styles.title}>1.请选择需要筛选的图表</div>
                            <div className={styles.content}>
                                <SearchLeft {...this.props} />
                            </div>
                        </div>
                        <div className={styles.contentWrap}>

                            <div className={styles.title}>2.选择作为筛选项的字段</div>
                            {
                                reportFieldData.name ?
                                    <div>
                                        <div className={styles.itemTitle}>{reportFieldData.name}</div>
                                        <div className={`${styles.content} ${styles.Top}`}>
                                            <SearchMiddle {...this.props} />
                                        </div>
                                    </div> :
                                    <div className={styles.noneReport}>请选择需要筛选的图表</div>
                            }
                        </div>
                        <div className={styles.contentWrap}>
                            <div className={styles.title}>3.设置筛选器名称和默认选项</div>
                            {
                                currentField.controlType ?
                                    <div>

                                        <div className={styles.itemTitle}>筛选器名称</div>
                                        <div className={styles.itemInput}><Input onChange={ele=>this.props.ChangeCurrentField({name:ele.target.value })} value={currentField.name}/></div>
                                        <div className={styles.itemTitle}>默认值</div>
                                        <div className={`${styles.content} ${styles.Top2}`}>
                                            <SearchRight {...this.props} />
                                        </div>
                                    </div> : <div className={styles.noneReport}>请在不同表单中选择同类型的控件来设置筛选器</div>
                            }
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}
