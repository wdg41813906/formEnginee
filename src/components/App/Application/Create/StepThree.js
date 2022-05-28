

import react from 'react';
import styles from './../Create.less';
import StepThreeForm from './StepThreeForm';
import StepThreeReport from './StepThreeReport';
import { Button } from 'antd';
import StepBox from './StepBox';
import { FormReportType } from '../../../../utils/AppStoreConfig';
import _ from 'underscore';

const List = [
    {
        id: FormReportType.blockFrom, name: '空白表单', desc: '进入后可创建全新表单', icon: `${styles.blockFrom}`, iconSel: `${styles.blockFromSelect}`,
        select: false, choose: false,type:'form'
    },
    {
        id: FormReportType.templateForm, name: '选择已有表单', desc: '从已创建表单中选择', icon: `${styles.templateForm}`, iconSel: `${styles.templateFormSelect}`,
        select: false, choose: false,type:'form'
    }, {
        id: FormReportType.blockReport, name: '空白仪表盘', desc: '进入后可创建仪表盘', icon: `${styles.blockReport}`, iconSel: `${styles.blockReportSelect}`,
        select: false, choose: false,type:'report'
    }, {
        id: FormReportType.templateReport, name: '选择已有仪表盘', desc: '从已创建仪表盘中选择', icon: `${styles.templateReport}`, iconSel: `${styles.templateReportSelect}`,
        select: false, choose: false,type:'report'
    }]

class FormReportItem extends react.Component {
    render() {
        const { formReportType } = this.props;
        if (formReportType === FormReportType.blockFrom) {
            return (<div style={{
                width:75,
                margin:'0 auto'
            }}>
                <Button type='primary' onClick={
                    e=>{
                        this.props.Save()
                    }
                }>确定</Button>
            </div>)
        }else if(formReportType===FormReportType.templateForm){
            return(
                <StepThreeForm {...this.props} />
            )
        }else if(formReportType === FormReportType.blockReport) {
            return (<div style={{
                width:75,
                margin:'0 auto'
            }}>
                <Button type="primary" onClick={
                    e=>{
                        this.props.Save()
                    }
                }>确定</Button>
            </div>)
        }
        else if(formReportType === FormReportType.templateReport){
            return(
                <StepThreeReport {...this.props} />
            )
        }else{
            return(<div></div>)
        }

    }
}
export default class StepThree extends react.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataList: List
        }
    }
    ItemFn = (item) => {
        var list = this.state.dataList;
        list.forEach(ele => {
            if (ele.id === item.id) {
                ele.select = !ele.select;
            }
        })
        this.setState({
            dataList: list
        })
    }
    ItemClick = (item) => {
        var list = this.state.dataList;
        list.forEach(ele => {
            if (ele.id === item.id) {
                ele.choose = true;
            } else {
                ele.choose = false;
            }
        })
        this.setState({
            dataList: list
        })
        this.props.SetFormReportType(item.id)
    }
    render() {
        const { dataList } = this.state;
        const {formReportType}=this.props;
        return (
            <div>
                <div className={styles.stepItem}>
                    {
                        dataList.map(item =>
                            {
                                
                          if(!this.props.hasStep&&item.type===this.props.optType)
                          { 
                            return ( <StepBox key={item.id} item={item}
                                ItemClick={this.ItemClick}
                                 ItemFn={this.ItemFn}></StepBox>)
                          }
                          if(this.props.hasStep){
                            return ( <StepBox key={item.id} item={item}
                                ItemClick={this.ItemClick}
                                 ItemFn={this.ItemFn}></StepBox>)
                          }
                            
                            }
                            
                            
                           
                        )
                    }
                </div>
                <div style={{
                    margin: '15px auto 0',
                    width: '80%',
                }}>
                  <FormReportItem {...this.props}/>
                </div>
            </div>
        )
    }
}