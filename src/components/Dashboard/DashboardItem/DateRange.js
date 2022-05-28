import { DatePicker } from 'antd';

import './DateRange.less'
import styles from './NumberRange.less';
import DashboardHOC from './DashboardHOC'
import BaseItem from './BaseItem'

var moment = require('moment');

@DashboardHOC()
export default class DateRange extends BaseItem {
    render() {
        const { item } = this.props;
        const { config, searchData } = item;
        const { currentField } = searchData
        const { style } = config;
        if (typeof (currentField.startValue) === 'string') {
            currentField.startValue = moment(currentField.startValue)
        }
        if (typeof (currentField.endValue) === 'string') {
            currentField.endValue = moment(currentField.endValue)
        }
        return (
            <div className={styles.rangeWrap} >
                <div className={styles.rangeItme}>
                    <DatePicker
                        value={currentField.startValue}
                        onChange={
                            (dates, dateStrings) =>
                                this.props.RangeFieldChange(item, { startValue: dateStrings })
                        }
                        item={item} style={{
                            background: style.backgroundColor,

                            color: style.textFill,
                            fontFamily: style.textFontFamily,
                            fontWeight: style.textFontWeight ? 'bold' : 'normal', // 文本粗细
                            fontStyle: style.textItalic ? 'italic' : 'normal',//斜体
                        }} size="default" />
                </div>
                <div style={{
                    color: style.textFill,
                }} className={`${styles.rangeItme} ${styles.limitItme}`}>
                    ~
               </div>

                <div className={styles.rangeItme}>
                    <DatePicker
                        onChange={
                            (dates, dateStrings) =>
                                this.props.RangeFieldChange(item, { endValue: dateStrings })
                        }
                        value={currentField.endValue}
                        item={item} style={{
                            background: style.backgroundColor,

                            color: style.textFill,
                            fontFamily: style.textFontFamily,
                            fontWeight: style.textFontWeight ? 'bold' : 'normal', // 文本粗细
                            fontStyle: style.textItalic ? 'italic' : 'normal',//斜体
                        }} size="default" />
                </div>
            </div>
        )
    }
}