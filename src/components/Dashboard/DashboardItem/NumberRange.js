
import react from 'react';
import styles from './NumberRange.less';
import './DateRange.less'
import { InputNumber } from 'antd';
import DashboardHOC from './DashboardHOC'
import BaseItem from './BaseItem'
@DashboardHOC()
export default class NumberRange extends BaseItem {
    render() {
        const { item } = this.props;
        const { config, searchData } = item;
        const { currentField } = searchData
        const { style } = config;

        return (
            <div className={styles.rangeWrap} >
                <div className={styles.rangeItme}>
                    <InputNumber
                        max={999999999999}
                        onChange={
                            e =>
                                this.props.RangeFieldChange(item, { startValue: e })
                        }
                        value={currentField.startValue}
                        placeholder="最小值" style={{
                            width: '100%', height: 33,
                            background: style.backgroundColor,
                            color: style.textFill,
                            fontSize: style.textFontSize,
                            fontFamily: style.textFontFamily,
                            fontWeight: style.textFontWeight ? 'bold' : 'normal', // 文本粗细
                            fontStyle: style.textItalic ? 'italic' : 'normal',//斜体
                        }} />
                </div>
                <div style={{
                    color: style.textFill,
                }} className={`${styles.rangeItme} ${styles.limitItme}`}>
                    ~
                </div>
                <div className={styles.rangeItme}>
                    <InputNumber
                        max={999999999999}
                        onChange={
                            e =>
                                this.props.RangeFieldChange(item, { endValue: e })
                        }
                        value={currentField.endValue}
                        placeholder="最大值"
                        style={{
                            width: '100%', height: 33,
                            background: style.backgroundColor,
                            color: style.textFill,
                            fontSize: style.textFontSize,
                            fontFamily: style.textFontFamily,
                            fontWeight: style.textFontWeight ? 'bold' : 'normal', // 文本粗细
                            fontStyle: style.textItalic ? 'italic' : 'normal',//斜体
                        }} />
                </div>
            </div>
        )
    }
}