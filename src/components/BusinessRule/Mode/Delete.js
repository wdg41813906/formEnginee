import {Icon,Tooltip } from 'antd';
import GenerateFieldMap  from './../FieldMap/GenerateFieldMap'
import FieldSelect from './../FieldMap/FieldSelect'
import {fieldSelectMode} from '../../../utils/businessRuleConfig'
import styles from './Mode.less'

class Delete extends React.Component {
    fieldChange=(item,ele)=>{
        this.props.fieldChange(item,ele)
    }
    render() {
        const { item, templateFields ,templateMapFields} = this.props;
        const GenerateFieldMapProps={
            filterValueChange:this.props.filterValueChange,
            filterTriggerChange:this.props.filterTriggerChange,
            templateFields:templateFields,
            templateMapFields,
            filterModeChange:this.props.filterModeChange,
            FilterDelete:this.props.onDelFilterConditions
        }
        return (<div>
            <div className={styles.itemWrap}>
                <p className={styles.schTitle}>删除目标表单中的哪些数据
<Tooltip title="过滤条件可以限定删除目标表单中的哪些数据"><Icon className={styles.ques} type="question-circle" /> </Tooltip>
                </p>
                {/* <FieldSelect title="添加过滤条件" data={[]} />
                <GenerateFieldMap conditionText="等于" calDel={true}/> */}


                <FieldSelect title="添加过滤条件" fieldChange={(ele)=>{
                    this.fieldChange(item,ele)
                }} data={item.fields} />
                {
                    item.filterConditions && item.filterConditions.map(ele =>{
                        if(ele.operationStatus!==0){
                            return   <GenerateFieldMap
                            {...GenerateFieldMapProps} mode={fieldSelectMode.condition} item={item} info={ele} conditionText="等于" calDel={true} />
                        }
                    }
                      
                            )
                }

            </div>
          
        </div>)
    }
}
export default Delete;