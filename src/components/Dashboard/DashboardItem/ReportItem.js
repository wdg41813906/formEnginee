import React from 'react';
import ReactEcharts from 'echarts-for-react';
import ReportOption from '../../../utils/ReportOption'
import DashboardHOC from './DashboardHOC'
let optionBar= new ReportOption.ReportOtion().optionBar
import BaseImmutableComponent from '../../../components/BaseImmutableComponent'
@DashboardHOC()
export default class ReportItem extends React.BaseImmutableComponent {

    constructor(props) {
        super(props)
    }
    render() {
        return(

        <ReactEcharts
            option={this.props.item.options}
            style={{ height: this.props.dragStyle.height-60, width: '100%' }}
            className='react_for_echarts' />
        )
    }
}