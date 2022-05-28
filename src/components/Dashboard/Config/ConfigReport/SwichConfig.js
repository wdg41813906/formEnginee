import react from 'react';
import { Icon } from 'antd';
import _ from 'underscore';
import {is} from 'immutable'
import styles from './SwichConfig.less'
import BaseImmutableComponent from '../../../BaseImmutableComponent'
import DashboardConfig from '../../../../utils/DashboardConfig'
import ReportConfigBase from './ReportConfigBase'
import TitleType from '../ConfigType/TitleType'
import StyleType from '../ConfigType/StyleType'
import ReportType from '../ConfigType/ReportType'


const currentReport = 'bar';

class None extends react.Component{
    render(){
        return <div>none</div>
    }
}

export default class SwichConfig extends react.Component {
     constructor(props){
        super(props)
        this.state={
            config:[
                {
                    Component:None
                }
            ]
        }
     }
     shouldComponentUpdate(nextProps, nextState) {
        
        const thisProps = this.props || {};
        const thisState = this.state || {};
        nextState = nextState || {};
        nextProps = nextProps || {};

        // if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
        //     Object.keys(thisState).length !== Object.keys(nextState).length) {
        //     return true;
        // }

        for (const key in nextProps.NewCurrentConfig) {
            if (!is(thisProps.NewCurrentConfig[key], nextProps.NewCurrentConfig[key])) {
                return true;
            }
        }
        for (const key in nextProps.NewItem) {
            if (!is(thisProps.NewItem[key], nextProps.NewItem[key])) {
                return true;
            }
        }

        // for (const key in nextState) {
        //     if (!is(thisState.currentConfig[key], nextState.currentConfig[key])) {
        //         return true;
        //     }
        // }
        return false;
    }
    render() {
        const { NewItem ,NewCurrentConfig} = this.props;
        
         // var NewCurrentConfig=currentConfig.toJS()
      
        const ComProps={
            SetData:this.props.SetData,
            SetLinkageData:this.props.SetLinkageData,
            SetLinkageHomologyData:this.props.SetLinkageHomologyData,
            SetColorMatchProgrammesData:this.props.SetColorMatchProgrammesData
        }
        //var reportConfig = _.where(ReportConfigBase.ReportConfigBase, { Type: CurrentReport.type })[0];
        
        return (
            <div className={styles.configWrap}>
                <div className={styles.configType}>
                    {
                        NewItem.ReoprtConfigType.configTypeList.map(Item => {
                            return(
                                <div onClick={
                                    e=>{
                                      this.props.ConfigTypeChange(Item)

                                       
                                    }
                                } className={`${styles.typeItem} ${Item.selected?styles.selected:''}`}>
                                 <Icon type={Item.icon}/>
                                <div>{Item.name}</div>
                            </div>
                            )
                           
                        })
                    }

                </div>
                <div className={styles.configContent}>
                    {
                        NewCurrentConfig.map(Ele=>{
                            return(
                                <Ele.Component item={NewItem} {...ComProps}/>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}
