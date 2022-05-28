import React from "react";
import {
    G2,
    Chart,
    Geom,
    Axis,
    Tooltip,
    Coord,
    Label,
    Legend,
    View,
    Guide,
    Shape,
    Facet,
    Util
} from "bizcharts";
import {DataFilter, MuchdImension} from './DataFilter'
import DashboardHOC from './DashboardHOC'
import BaseItem from './BaseItem'
import DataSet from "@antv/data-set";

@DashboardHOC()
export default class ReportLine extends BaseItem {
    render() {
      
  
        const {item, chartConfig, DragSource, DragItem} = this.props;
        const codeData = DragSource ? DragSource.fields : '';
        // const {Yopt, Xopt} = this.props.item;
        //console.log(`reportline${  JSON.stringify(item)}`)
        const data = [
            {
                month: "一月",
                Tokyo: 17.0,
                London: 3.9
            },
            {
                month: "二月",
                Tokyo: 16.9,
                London: 4.2
            },
            {
                month: "三月",
                Tokyo: 19.5,
                London: 5.7
            },
            {
                month: "四月",
                Tokyo: 18.5,
                London: 8.5
            },
            {
                month: "五月",
                Tokyo: 18.4,
                London: 6.9
            },
            {
                month: "六月",
                Tokyo: 21.5,
                London: 5.2
            },
            {
                month: "七月",
                Tokyo: 25.2,
                London: 7.0
            },
            {
                month: "八月",
                Tokyo: 26.5,
                London: 6.6
            },
            {
                month: "九月",
                Tokyo: 23.3,
                London: 4.2
            },
            {
                month: "十月",
                Tokyo: 18.3,
                London: 5.3
            },
            {
                month: "十一月",
                Tokyo: 16.9,
                London: 5.6
            },
            {
                month: "十二月",
                Tokyo: 19.6,
                London: 4.8,
            }
        ];
        let Yopt = []
        let Xopt = []
        let FilterData = []
        let dimensionAry = []
        let dimensionXData = []
        if (item.ChartsData && item.ChartsData.length > 0) {
            let DataFil = DataFilter(item.ChartsData, codeData, DragItem)
            FilterData = DataFil.data
            Xopt = DataFil.Xopt
            Yopt = DataFil.Yopt
            dimensionAry = DataFil.dimensionAry
        }
        if (FilterData.length > 0 && dimensionAry.length === 2) {
           // console.log(JSON.stringify(FilterData))
            let MuchI = MuchdImension(FilterData, DragItem)
            FilterData = MuchI.data
            Xopt = MuchI.Xopt
            Yopt = MuchI.Yopt
            dimensionXData = DragItem.filter(item => {
                return item.ContainerId === 'dimensionX'
            })
        }
        // console.log(FilterData)
        // let a = [{"订单日期(计数)": 10, "姓名": "李四",'code':'1'},
        //     {"订单日期(计数)": 10, "姓名": "王五",'code':'2'},
        //     {"订单日期(计数)": 8, "姓名": "张三",'code':'3'}]
        const ds = new DataSet();
        const dv = ds.createView().source(item.ChartsData ? FilterData : data);
        
        dv.transform({
            type: 'fold',
            fields: Xopt ? Xopt : [], // 展开字段集
            key: 'name', // key字段
            value: 'value', // value字段
        });
        return (
            item.ChartsData ?
                <div>
                    <Chart
                       animate={false} 
                    onPlotClick={
                        e => {
                           if(e.data){
                          this.props.DataLinkageEngineeCall(item,e.data._origin)
                          }
                        }
                     
                    }
                           padding={chartConfig.report.padding}
                        // padding={[60, 'auto', 60, 'auto']}
                            height={item.height} width={item.width} data={dv} forceFit>
                        <Axis
                            name={(dimensionAry.length === 2 ? dimensionXData[0].Name : `${Yopt}`) }
                            line={chartConfig.xLine}
                            label={
                                chartConfig.xLable
                            }


                        />
                        <Axis name="value"
                              line={chartConfig.yLine}
                             label={chartConfig.yLable}
                        />

                        <Legend marker='square' {...chartConfig.legend}/>
                        <Tooltip
                            crosshairs={{
                                type: "y"
                            }}
                        />

                        <Geom
                            type="line"
                            position={(dimensionAry.length === 2 ? dimensionXData[0].Name : `${Yopt}`) + '*value'}
                            //color={"name"}
                            color={['name', (name)=>{
                                if(chartConfig.report.geomColorCall){
                                    var result= chartConfig.report.geomColorCall(name,chartConfig.report,item)
                                    if(result){ return result; }
                                }
                              }]} 
                            size={2}
                        >
                            <Label content="value" {...chartConfig.label}/>
                        </Geom>
                        <Geom
                            type="point"
                            position={(dimensionAry.length === 2 ? dimensionXData[0].Name : `${Yopt}`) + '*value'}
                            color={"name"}
                            size={4}
                            shape={"circle"}
                            style={{
                                stroke: "#fff",
                                lineWidth: 1
                            }}
                        >

                        </Geom>
                    </Chart>
                </div> : null
        );
    }
}

