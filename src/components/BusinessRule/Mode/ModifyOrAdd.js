import { Icon, Tooltip } from 'antd';
import GenerateFieldMap from './../FieldMap/GenerateFieldMap'
import FieldSelect from './../FieldMap/FieldSelect'
import { fieldSelectMode } from '../../../utils/businessRuleConfig'
import styles from './Mode.less'

class ModifyOrAdd extends React.Component {

    fieldChange = (item, ele) => {
        this.props.fieldChange(item, ele)
    }
    mapFieldChange = (item, ele) => {
        this.props.mapFieldChange(item, ele)
    }
    render() {
        const { item, templateFields, templateMapFields } = this.props;
debugger
        const GenerateFieldMapProps = {
            filterValueChange: this.props.filterValueChange,
            filterTriggerChange: this.props.filterTriggerChange,
            templateFields: templateFields,
            templateMapFields,
            filterModeChange: this.props.filterModeChange,
            FilterDelete: this.props.onDelFilterConditions
        }
        const GenerateFieldMapProps2 = {
            filterValueChange: this.props.mapValueChange,
            filterTriggerChange: this.props.mapTriggerChange,
            templateFields: templateFields,
            templateMapFields,
            filterModeChange: this.props.mapModeChange,
            FilterDelete: this.props.onDelFieldMapings
        }
        const GenerateFieldMapProps3 = {
            filterValueChange: this.props.newMapValueChange,
            filterTriggerChange: this.props.newMapTriggerChange,
            templateFields: templateFields,
            templateMapFields,
            filterModeChange: this.props.newMapModeChange,
            FilterDelete: this.props.onDelFieldMapings
        }

        return (<div>
            <div className={styles.itemWrap}>
                <p className={styles.schTitle}>修改目标表单中的哪些数据
<Tooltip title="过滤条件可以限定修改目标表单中的哪些数据"><Icon className={styles.ques} type="question-circle" /> </Tooltip>
                </p>
                {/* <FieldSelect title="添加过滤条件" data={[]} />
                <GenerateFieldMap conditionText="等于" calDel={true}/> */}

                <FieldSelect title="添加过滤条件" fieldChange={(ele) => {
                    this.fieldChange(item, ele)
                }} data={item.fields.filter(ee=>{return ee.expressionType===1})} />
                {
                    item.filterConditions && item.filterConditions.map(ele => {
                        if (ele.operationStatus !== 0&&ele.expressionType===1) {
                            return <GenerateFieldMap
                                {...GenerateFieldMapProps} mode={fieldSelectMode.condition} item={item} info={ele} conditionText="等于" calDel={true} />
                        }
                    }
                    )
                }
            </div>
            <div className={styles.itemWrap}>
                <p className={styles.schTitle}>对符合过滤条件的数据，进行以下字段的修改</p>
                {/* <FieldSelect title="添加字段" data={[]} />
                <GenerateFieldMap conditionText="修改为" calDel={true}/> */}

                <FieldSelect title="添加字段" fieldChange={(ele) => {
                    this.mapFieldChange(item, ele)
                }} data={item.mapFields} />
                {
                    item.fieldMapings && item.fieldMapings.map(ele => {
                        if (ele.operationStatus !== 0) {
                            return <GenerateFieldMap {...GenerateFieldMapProps2} mode={fieldSelectMode.map} item={item} info={ele} conditionText="修改为" calDel={true} />
                        }
                    }
                    )
                }
            </div>
            <div className={styles.itemWrap} style={{borderTop:'1px solid #ddd'}}>
                
                {
                    item.formType===1&&
                    <div>
                    <p className={styles.schTitle}>选择符合条件的主表信息作为子表新增数据的关联关系</p>
                    {/* <FieldSelect title="添加过滤条件" data={[]} />
                <GenerateFieldMap conditionText="等于" calDel={true}/> */}

                    <FieldSelect title="添加过滤条件" fieldChange={(ele) => {
                        this.fieldChange(item, ele)
                    }} data={item.fields.filter(ee=>{return ee.expressionType===2})} />
                    {
                        item.filterConditions && item.filterConditions.map(ele => {
                            if (ele.operationStatus !== 0&&ele.expressionType===2) {
                                return <GenerateFieldMap
                                    {...GenerateFieldMapProps} mode={fieldSelectMode.condition} item={item} info={ele} conditionText="等于" calDel={true} />
                            }
                        }
                        )
                    }
                </div>
                }
              
                <p className={styles.schTitle}>若找不到符合过滤条件的数据，则根据以下配置在目标表单中新增数据</p>
                {/* <GenerateFieldMap conditionText="设置为" calDel={false}/> */}
                {
                    item.newfieldMapings && item.newfieldMapings.map(ele => {
                        if (ele.modeType !== 'primaryKey' && ele.operationStatus !== 0) {
                            return <GenerateFieldMap {...GenerateFieldMapProps3} mode={fieldSelectMode.map} item={item} info={ele} conditionText="设置为" calDel={false} />
                        }
                    }
                    )
                }
            </div>
        </div>)
    }
}
export default ModifyOrAdd;