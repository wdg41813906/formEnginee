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
import BaseItem from './BaseItem'
import DashboardHOC from './DashboardHOC'
import {DataFilter, MuchdImension} from './DataFilter'

@DashboardHOC()
class ReportShape extends BaseItem {

    render() {
        const {DataView} = DataSet;
        const {item, chartConfig, DragSource, DragItem} = this.props;
        const codeData = DragSource ? DragSource.fields : '';
        // const {Yopt, Xopt} = this.props.item;
        //console.log(this.props.item)
        const data = [
            {
                item: "事例一",
                count: 40
            },
            {
                item: "事例二",
                count: 21
            },
            {
                item: "事例三",
                count: 17
            },
            {
                item: "事例四",
                count: 13
            },
            {
                item: "事例五",
                count: 9
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
            //console.log(JSON.stringify(FilterData))
            let MuchI = MuchdImension(FilterData, DragItem)
            FilterData = MuchI.data
            Xopt = MuchI.Xopt
            Yopt = MuchI.Yopt
            dimensionXData = DragItem.filter(item => {
                return item.ContainerId === 'dimensionX'
            })
        }

        // if (item.DataPermission && item.ShowCount) {
        //     if (item.DataPermission.find(n => n == 1)!==undefined && item.ShowCount > 0) {
        //         FilterData = FilterData.slice(0, item.ShowCount)
        //     }
        // }

        const dv = new DataView();
        //console.log(Yopt.toString(), Xopt.toString())
        dv.source(item.ChartsData ? FilterData : data).transform({
            type: "percent",
            fields: Xopt ? Xopt.toString() : "count", // 展开字段集
            dimension: Yopt ? Yopt.toString() : "item",
            as: "percent"
        });
        return (
            <div>
                <Chart
                    onPlotClick={
                        e => {
                            if (e.data) {
                                this.props.DataLinkageEngineeCall(item, e.data._origin)
                            }
                        }
                    }
                    height={item.height}
                    width={item.width}
                    data={dv}
                    padding={chartConfig.report.padding}
                    // padding={[20, 'auto', 60, 'auto']}
                    animate={true}
                    forceFit
                >
                    <Coord type="theta" radius={0.75}/>
                    <Axis name="percent"/>
                    <Legend
                        {...chartConfig.legend}
                    />
                    <Tooltip
                        showTitle={false}
                        itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
                    />
                    <Geom
                        type="intervalStack"
                        position="percent"
                       // color={Yopt.toString()}
                      color={[Yopt.toString(), (name)=>{
                        if(chartConfig.report.geomColorCall){
                            var result= chartConfig.report.geomColorCall(name,chartConfig.report,item)
                            if(result){ return result; }
                        }
                      }]}
                        tooltip={[
                            `${Yopt.toString()}*percent`,
                            (item, percent) => {
                                // percent = (percent * 100).toFixed(2) + "%";
                                FilterData.map(t => {
                                    if (t[Yopt] === item) {
                                        percent = t[Xopt]
                                    }
                                })
                                return {
                                    name: item,
                                    value: percent
                                }
                            }
                        ]}
                        style={{
                            lineWidth: 1,
                            stroke: "#fff"
                        }}
                    >
                        <Label
                            content="percent"
                            formatter={(val, item) => {
                                return item.point[Xopt] + ": " + "(" + (item.point['percent'] * 100).toFixed(2) + "%" + ")";
                            }}
                            {...chartConfig.label}
                        />
                    </Geom>
                </Chart>
            </div>
        );
    }
}

export default ReportShape;
