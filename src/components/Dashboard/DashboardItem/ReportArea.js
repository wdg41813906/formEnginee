import react from "react";
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
import BaseItem from './BaseItem'
import DashboardHOC from './DashboardHOC';
import {is} from 'immutable';
import DataSet from "@antv/data-set";
import {COPYFILE_FICLONE_FORCE} from "constants";
import {DataFilter, MuchdImension} from './DataFilter'


@DashboardHOC()
export default class ReportArea extends BaseItem {
    render() {
        const {item, chartConfig, DragSource, DragItem} = this.props;
        const codeData = DragSource ? DragSource.fields : '';
        // const {Yopt} = this.props.item;

        const data = [
            {
                year: "1996",
                north: 322,
                south: 162
            },
            {
                year: "1997",
                north: 324,
                south: 90
            },
            {
                year: "1998",
                north: 329,
                south: 50
            },
            {
                year: "1999",
                north: 342,
                south: 77
            },
            {
                year: "2000",
                north: 348,
                south: 35
            },
            {
                year: "2001",
                north: 334,
                south: 45
            },
            {
                year: "2002",
                north: 325,
                south: 88
            },
            {
                year: "2003",
                north: 316,
                south: 120
            },
            {
                year: "2004",
                north: 318,
                south: 156
            },
            {
                year: "2005",
                north: 330,
                south: 123
            },
            {
                year: "2006",
                north: 355,
                south: 88
            },
            {
                year: "2007",
                north: 366,
                south: 66
            },
            {
                year: "2008",
                north: 337,
                south: 45
            },
            {
                year: "2009",
                north: 352,
                south: 29
            },
            {
                year: "2010",
                north: 377,
                south: 45
            },
            {
                year: "2011",
                north: 383,
                south: 88
            },
            {
                year: "2012",
                north: 344,
                south: 132
            },
            {
                year: "2013",
                north: 366,
                south: 146
            },
            {
                year: "2014",
                north: 389,
                south: 169
            },
            {
                year: "2015",
                north: 334,
                south: 184
            }
        ]

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
            type: 'fold',
            fields: Xopt ? Xopt : [], // 展开字段集
            key: 'name', // key字段
            value: 'value', // value字段
        });

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
                    animate={false}
                    padding={chartConfig.report.padding}
                    height={item.height} width={item.width}
                    // padding={[20, 'auto', 60, 'auto']}
                    data={dv} forceFit>
                    <Axis
                         name={(dimensionAry.length === 2 ? dimensionXData[0].Name : `${Yopt}`)}
                        line={chartConfig.xLine}
                        label={chartConfig.xLable}
                        />
                    <Axis name="value"
                        line={chartConfig.yLine}
                        label={chartConfig.yLable}
                    />

                    <Legend marker='square' {...chartConfig.legend}/>
                    <Tooltip
                        crosshairs={{
                            type: "line"
                        }}
                    />
                    <Geom type="area"
                          position={(dimensionAry.length === 2 ? dimensionXData[0].Name : `${Yopt}`) + '*value'}
                         // color={"name"}
                        color={['name', (name)=>{
                            if(chartConfig.report.geomColorCall){
                                var result= chartConfig.report.geomColorCall(name,chartConfig.report,item)
                                if(result){ return result; }
                            }
                          }]} 
                         >
                        <Label content="value" {...chartConfig.label}/>
                    </Geom>
                    <Geom type="line"
                          position={(dimensionAry.length === 2 ? dimensionXData[0].Name : `${Yopt}`) + '*value'}
                          color={"name"} size={2}>

                    </Geom>
                </Chart>
            </div>
        );
    }
}
