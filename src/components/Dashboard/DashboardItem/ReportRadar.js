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
import DataSet from "@antv/data-set";
import DashboardHOC from './DashboardHOC'
import BaseItem from './BaseItem'
import {DataFilter, MuchdImension} from './DataFilter'

@DashboardHOC()

export default class ReportRadar extends BaseItem {
    render() {
        const {item, chartConfig, DragSource, DragItem} = this.props;
        
        const codeData = DragSource ? DragSource.fields : '';
        const data = [
            {
                item: "Design",
                a: 70,
                b: 30
            },
            {
                item: "Development",
                a: 60,
                b: 70
            },
            {
                item: "Marketing",
                a: 50,
                b: 60
            },
            {
                item: "Users",
                a: 40,
                b: 50
            },
            {
                item: "Test",
                a: 60,
                b: 70
            },
            {
                item: "Language",
                a: 70,
                b: 50
            },
            {
                item: "Technology",
                a: 50,
                b: 40
            },
            {
                item: "Support",
                a: 30,
                b: 40
            },
            {
                item: "Sales",
                a: 60,
                b: 40
            },
            {
                item: "UX",
                a: 50,
                b: 60
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
            let MuchI = MuchdImension(FilterData, DragItem)
            FilterData = MuchI.data
            Xopt = MuchI.Xopt
            Yopt = MuchI.Yopt
            dimensionXData = DragItem.filter(item => {
                return item.ContainerId === 'dimensionX'
            })
        }

        const ds = new DataSet();
        const dv = ds.createView().source(item.ChartsData ? FilterData : data);
        dv.transform({
            type: "fold",
            fields: Xopt ? Xopt : [], // 展开字段集
            key: 'name', // key字段
            value: 'value', // value字段
        });
        const cols = {
            score: {
                min: 0,
                max: 80
            }
        };
        return (
            <div>
                <Chart
                onPlotClick={
                    e => {
                       if(e.data){
                      this.props.DataLinkageEngineeCall(item,e.data._origin)
                      }
                    }
                }
                    height={item.height}
                    width={item.width}
                    data={dv}
                    padding={chartConfig.report.padding}
                    // padding={[20, 'auto', 60, 'auto']}
                    animate={false} 
                    scale={cols}
                    forceFit
                >
                    <Coord type="polar" radius={0.8}/>
                    <Axis
                         name={(dimensionAry.length === 2 ? dimensionXData[0].Name : `${Yopt}`)}
                        line={chartConfig.xLine}

                        label={
                            chartConfig.xLable
                        }
                        tickLine={null}
                        grid={{
                            lineStyle: {
                                lineDash: null
                            },
                            hideFirstLine: false
                        }}
                    />
                    <Tooltip/>
                    <Axis
                         name="value"
                        line={null}
                        label={chartConfig.yLable}
                        tickLine={null}
                        grid={{
                            type: "polygon",
                            lineStyle: {
                                lineDash: null
                            },
                            alternateColor: "rgba(0, 0, 0, 0.04)"
                        }}
                    />
                    <Legend marker="circle" {...chartConfig.legend} />
                    <Geom type="line"
                          position={(dimensionAry.length === 2 ? dimensionXData[0].Name : `${Yopt}`) + '*value'}
                         // color="name"
                        color={['name', (name)=>{
                            if(chartConfig.report.geomColorCall){
                                var result= chartConfig.report.geomColorCall(name,chartConfig.report,item)
                                if(result){ return result; }
                            }
                          }]} 
                          size={2}>

                    </Geom>
                    <Geom
                        type="point"
                        position={(dimensionAry.length === 2 ? dimensionXData[0].Name : `${Yopt}`) + '*value'}
                        color="name"
                        shape="circle"
                        size={4}
                        style={{
                            stroke: "#fff",
                            lineWidth: 1,
                            fillOpacity: 1
                        }}
                    />
                </Chart>
            </div>
        );
    }
}
