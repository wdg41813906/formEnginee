//import react from 'react';
import { Form, DatePicker, InputNumber, } from 'antd';
import moment from 'moment';
import { ControlType } from '../../../../utils/DashboardConfig'
import BaseImmutableComponent from '../../../../components/BaseImmutableComponent'
import SearchText from './SearchText'
import styles from './SearchRight.less'
//const type = 'string';

class SearchRight extends BaseImmutableComponent {
    constructor(props) {
        super(props);
    }
    render() {
        const { item, currentField } = this.props;

        const { getFieldDecorator, getFieldValue } = this.props.form;
        if (!currentField.controlType) {
            return <div className={styles.noneReport}>未知数据类型</div>
        } else {


            if (currentField.controlType === ControlType.DateTime) {
                if (typeof (currentField.startValue) === 'string') {
                    currentField.startValue = moment(currentField.startValue)
                }
                if (typeof (currentField.endValue) === 'string') {
                    currentField.endValue = moment(currentField.endValue)
                }
                return (
                    <div >
                        <div className={styles.item} >
                            <DatePicker value={currentField.startValue} onChange={
                                (date, dateString) =>
                                    this.props.ChangeCurrentField({ startValue: dateString })}
                                placeholder="请输入开始时间" style={{ width: '100%' }} />
                        </div>
                        <div className={styles.item} >
                            <DatePicker value={currentField.endValue} onChange={
                                (date, dateString) => this.props.ChangeCurrentField({ endValue: dateString })} placeholder="请输入结束时间" style={{ width: '100%' }} />
                        </div>
                    </div>
                )
            } else if (currentField.controlType === ControlType.Number) {
                return (
                    <div>
                        <div className={styles.item} >
                            <InputNumber value={currentField.startValue} max={999999999999}
                                onChange={e => this.props.ChangeCurrentField({ startValue: e })} placeholder="最小值" style={{ width: '100%' }} />
                        </div>
                        <div className={styles.item} >
                            <InputNumber max={999999999999} value={currentField.endValue} onChange={e => this.props.ChangeCurrentField({ endValue: e })} placeholder="最大值" style={{ width: '100%' }} />
                        </div>
                    </div>
                )
            } else if (currentField.controlType === ControlType.SingleText) {

                return (
                    <div>
                        <SearchText {...this.props} />
                    </div>
                )
            } else {
                return
                <div className={styles.noneReport}>未知数据类型</div>
            }
        }
    }
}

export default Form.create()(SearchRight);