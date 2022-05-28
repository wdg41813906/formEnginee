import react from 'react';
import ReportBar from '../DashboardItem/ReportBar'
import styles from './Card.less';
import {Icon, Tooltip} from 'antd';
import ReportSwitch from './ReportSwitch';
import screenfull from 'screenfull'
import DashboardConfig, {ReportItemArray} from '../../../utils/DashboardConfig'


class Card extends react.Component {

    OpenScreenFull = (item) => {
        //if (screenfull.enabled) {
        screenfull.toggle(this.refs[`ScreenFull${item.id}`]);
        //}
    }

    render() {
        const {item} = this.props;
        const {config} = item;
        const {style} = config;
        const {props} = this.props
        return (
            <div
                className={`${styles.cardWrap} ${item.type === DashboardConfig.Item.SearchButton ? styles.button : ''}`}
                style={{
                    background: 'transparent',
                    borderRadius: style.borderRadius,
                    borderColor: style.borderColor,
                    borderStyle: style.borderStyle
                }}
                onMouseLeave={
                    ele => {
                        props.CardMouseLeave(item)
                    }

                }
                onMouseEnter={
                    e => {
                        props.CardMouseOver(item)
                    }
                }>
                {

                    (item.showOperate && props.isPreview && (ReportItemArray.indexOf(item.type) > -1)) ?
                        <div onClick={
                            e => {

                                this.OpenScreenFull(item)
                                // props.ReportItemPreview(item);
                                // props.ReportPreviewToggle();

                            }
                        } className={styles.operate}>
                            <Tooltip placement="bottom" title="放大">
                                <div className={styles.optItem}>
                                    <Icon type="fullscreen"/>
                                </div>
                            </Tooltip>
                        </div> : undefined
                }


                {item.showOperate && !props.isPreview ?
                    <div className={styles.operate}>
                        {
                            item.type !== DashboardConfig.Item.SearchButton ?

                                <Tooltip placement="bottom" title="编辑">
                                    <div onClick={
                                        e => props.SearchComEditShow(item, true)
                                    } className={styles.optItem}>
                                        <Icon type="edit"/>
                                    </div>
                                </Tooltip>


                                : undefined
                        }
                        <Tooltip placement="bottom" title="设置">
                            <div onClick={
                                e => {
                                    props.ConfigDrawerShowToggle(item)
                                    props.ReportItemChange(item)
                                }

                            } className={styles.optItem}>
                                <Icon type="setting" theme="outlined"/>
                            </div>
                        </Tooltip>


                        <Tooltip placement="bottom" title="删除">
                            <div onClick={
                                e =>
                                    props.ReportItemRemove(item)
                            } className={`${styles.optItem}`}>
                                <Icon type="delete" theme="outlined"/>
                            </div>
                        </Tooltip>
                    </div> : undefined}

                <div ref={`ScreenFull${item.id}`} style={{position: 'relative', background: '#fff', top: 0, bottom: 0}}>
                    <ReportSwitch
                        isDashbord={true}
                        item={item} DragSource={item.engineeConfig.DragSource}
                        DragItem={item.engineeConfig.DragItem} {...props} />
                </div>

            </div>
        )
    }
}

// const Card = ({ item, provided, props }) => {

//     const { config } = item;
//     const { style } = config;


// }
export default Card;
