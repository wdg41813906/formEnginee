import { Icon, Tooltip, Divider } from 'antd';
import GenerateFieldMap from './../FieldMap/GenerateFieldMap'
import FieldSelect from './../FieldMap/FieldSelect'
import {fieldSelectMode} from '../../../utils/businessRuleConfig'
import styles from './Mode.less'

class Add extends React.Component {
    fieldChange = (item, ele) => {
        this.props.fieldChange(item, ele)
    }
    render() {
        const { item, templateFields,templateMapFields } = this.props;
debugger
        const GenerateFieldFilterProps = {
            filterValueChange: this.props.filterValueChange,
            filterTriggerChange: this.props.filterTriggerChange,
            templateFields: templateFields,
            templateMapFields,
            filterModeChange: this.props.filterModeChange,
            FilterDelete: this.props.onDelFilterConditions
        }
        const GenerateFieldMapProps = {
            filterValueChange: this.props.newMapValueChange,
            filterTriggerChange: this.props.newMapTriggerChange,
            templateFields: templateFields,
            templateMapFields,
            filterModeChange: this.props.newMapModeChange,
            FilterDelete: this.props.onDelFieldMapings
        }
        return (<div>
            <div className={styles.itemWrap}>
                {
                     item.formType===1&&  <div>
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
                                     {...GenerateFieldFilterProps} mode={fieldSelectMode.condition} item={item} info={ele} conditionText="等于" calDel={true} />
                             }
                         }
                         )
                     }
                 </div>
                }
          
                <p className={styles.schTitle}>在目标表单中新增数据，字段值设置如下
                </p>
                {
                    item.newfieldMapings && item.newfieldMapings.map(ele =>
                        {
                            if(ele.modeType!=='primaryKey'&&ele.operationStatus!==0){
                             return   <GenerateFieldMap {...GenerateFieldMapProps} mode={fieldSelectMode.map} item={item} info={ele} conditionText="设置为" calDel={false} />
                            }
                        })
                      
                }
                <Divider />
            </div>

        </div>)
    }
}
export default Add;