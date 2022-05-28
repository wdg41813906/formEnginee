import react from 'react';
import _ from 'underscore';
import DashboardConfig from '../../../utils/DashboardConfig'
import ReportBar from '../DashboardItem/ReportBar';
import ReportShape from '../DashboardItem/ReportShape';
import ReportLine from '../DashboardItem/ReportLine';
import ReportArea from '../DashboardItem/ReportArea';
import ReportRadar from '../DashboardItem/ReportRadar';
import ReportColumnar from '../DashboardItem/ReportColumnar';
import SearchButton from '../DashboardItem/SearchButton';
import DateRange from '../DashboardItem/DateRange';
import NumberRange from '../DashboardItem/NumberRange';
import StringSelect from '../DashboardItem/StringSelect';
import DataTable from '../DashboardItem/DataTable';
import ReportQuota from '../DashboardItem/ReportQuota';
import ReportNone from '../DashboardItem/ReportNone';
import BaseImmutableComponent from '../../../components/BaseImmutableComponent'

export default class ReportSwitch extends react.Component {

    render() {

        const { item, DragSource, DragItem,isDashbord } = this.props;
        const { config } = item;
        const { xAxis, yAxis, legend, label, report } = config;
        var reportItem={}
        ///仪表盘页面为入口
        if(isDashbord){
            reportItem={...item.engineeConfig,config:config};
            reportItem.height=item.height;
            reportItem.width=item.width;
            reportItem.ChartsType=item.type;
        }
        //设计页面入口
        else{
            reportItem=item   
        }

        const ReportSwitchProps = {
            isPreview: this.props.isPreview,
            ReportPreviewToggle: this.props.ReportPreviewToggle,
            reportPreviewShow: this.props.reportPreviewShow,
            DataLinkageEngineeCall: this.props.DataLinkageEngineeCall
        }
        const chartConfig = {
            xLine: {
                stroke: xAxis.lineStroke
            },
            report: {
                padding: [report.paddingTop, report.paddingRight, report.paddingBottom, report.paddingLeft],
                geomColorCall:function(name,match,ele){
                    if(match.colorMatchMode==='custom'){
                       for(var i=0;i<match.colorMatchProgrammes.length;i++){
                           var item=match.colorMatchProgrammes[i];
                          if(name.indexOf(item.name)>-1){
                            if( match.colorMatchGradualChange){
                                if(ele.ChartsType==='Columnar'){
                                return `l(270) 0:${item.fromColor} 1:${item.toColor}`;
                            }else{
                                return `l(0) 0:${item.fromColor} 1:${item.toColor}`;
                            }
                                //return `${item.fromColor}-${item.toColor}`
                           }else{
                               return item.fromColor
                           }
                          }
                       }
                     
                    }
                },
                colorMatchMode:report.colorMatchMode,//配色模式
                colorMatchGradualChange: report.colorMatchGradualChange,//渐变
                colorMatchProgrammes: report.colorMatchProgrammes,////配色方案

            },
            xLable: {
                offset: xAxis.labelOffset,
                autoRotate: false,
                textStyle: {
                    textAlign: 'center', // 文本对齐方向，可取值为： start center end
                    fill: xAxis.labelTextFill, // 文本的颜色
                    fontSize: xAxis.lableTextFontSize, // 文本大小
                    fontFamily: xAxis.labelTextFontFamily,
                    fontWeight: xAxis.lableTextWeight ? 'bold' : 'normal', // 文本粗细
                    fontStyle: xAxis.lableTextItalic ? 'italic' : 'normal',//斜体
                    rotate: xAxis.lableTextRotate,
                    textBaseline: 'top' // 文本基准线，可取 top middle bottom，默认为middle
                },
            },
            yLine: {
                stroke: yAxis.lineStroke
            },
            yLable: {
                offset: yAxis.labelOffset,
                autoRotate: false,
                textStyle: {
                    textAlign: 'center', // 文本对齐方向，可取值为： start center end
                    fill: yAxis.labelTextFill, // 文本的颜色
                    fontSize: yAxis.lableTextFontSize, // 文本大小
                    fontFamily: yAxis.labelTextFontFamily,
                    fontWeight: yAxis.lableTextWeight ? 'bold' : 'normal', // 文本粗细
                    fontStyle: yAxis.lableTextItalic ? 'italic' : 'normal',//斜体
                    rotate: yAxis.lableTextRotate,
                    textBaseline: 'top' // 文本基准线，可取 top middle bottom，默认为middle
                },
            },
            legend: {
                visible: legend.visible,
                position: legend.position,
                layout: legend.layout,
                itemGap: legend.itemGap,
                textStyle: {
                    textAlign: 'middle', // 文本对齐方向，可取值为： start middle end
                    fill: legend.textFill, // 文本的颜色
                    fontFamily: legend.textFontFamily,
                    fontSize: legend.textFontSize, // 文本大小
                    fontWeight: legend.textFontWeight ? 'bold' : 'normal', // 文本粗细
                    fontStyle: legend.textItalic ? 'italic' : 'normal',//斜体
                    textBaseline: 'middle'
                }
            },
            label: {
                offset: label.offset,
                textStyle: {
                    textAlign: 'center', // 文本对齐方向，可取值为： start middle end
                    fill: label.textFill, // 文本的颜色
                    fontSize: label.textFontSize,// 文本大小
                    fontFamily: label.textFontFamily,
                    fontWeight: label.textFontWeight ? 'bold' : 'normal', // 文本粗细
                    fontStyle: label.textItalic ? 'italic' : 'normal',//斜体
                    rotate: 0,
                    textBaseline: 'top' // 文本基准线，可取 top middle bottom，默认为middle
                }
            }
        };
        if (item.type === DashboardConfig.Item.Bar) {
            return <ReportBar item={reportItem} {...ReportSwitchProps} DragSource={DragSource} DragItem={DragItem}
                chartConfig={chartConfig} />
        }
        else if (item.type === DashboardConfig.Item.Columnar) {
            return <ReportColumnar item={reportItem} {...ReportSwitchProps} DragSource={DragSource} DragItem={DragItem}
                chartConfig={chartConfig} />
        }
        else if (item.type === DashboardConfig.Item.Shape) {
            return <ReportShape item={reportItem} {...ReportSwitchProps} DragSource={DragSource} DragItem={DragItem}
                chartConfig={chartConfig} />
        }
        else if (item.type === DashboardConfig.Item.Line) {
            return <ReportLine item={reportItem} {...ReportSwitchProps} DragSource={DragSource} DragItem={DragItem}
                chartConfig={chartConfig} />
        }
        else if (item.type === DashboardConfig.Item.Area) {
            return <ReportArea item={reportItem}  {...ReportSwitchProps} DragSource={DragSource} DragItem={DragItem}
                chartConfig={chartConfig} />
        }
        else if (item.type === DashboardConfig.Item.Radar) {
            return <ReportRadar item={reportItem} {...ReportSwitchProps} DragSource={DragSource} DragItem={DragItem}
                chartConfig={chartConfig} />
        }
        else if (item.type === DashboardConfig.Item.SearchButton) {
            return <SearchButton SearchButtonCall={this.props.SearchButtonCall} item={item}  {...ReportSwitchProps} />
        }
        else if (item.type === DashboardConfig.Item.DateRange) {
            return <DateRange item={reportItem} {...ReportSwitchProps} DragSource={DragSource}
                RangeFieldChange={this.props.RangeFieldChange} />
        }
        else if (item.type === DashboardConfig.Item.NumberRange) {
            return (<NumberRange item={reportItem} {...ReportSwitchProps} DragSource={DragSource}
                RangeFieldChange={this.props.RangeFieldChange} />)
        }
        else if (item.type === DashboardConfig.Item.StringSelect) {
            return (<StringSelect item={reportItem} {...ReportSwitchProps} {...this.props} />)
        }
        else if (item.type === DashboardConfig.Item.Table) {
            return (<DataTable  item={reportItem} {...ReportSwitchProps} DragSource={DragSource} DragItem={DragItem} />)
        }
        else if (item.type === DashboardConfig.Item.Quota) {
            return (<ReportQuota item={reportItem} {...ReportSwitchProps} DragSource={DragSource} DragItem={DragItem}
                chartConfig={chartConfig} />)
        }

        else {
            return <ReportNone item={reportItem} {...ReportSwitchProps} DragSource={DragSource} DragItem={DragItem}
                chartConfig={chartConfig} />
        }

    }

}
