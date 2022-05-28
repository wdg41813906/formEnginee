

var defalutTextColor = "#cccccc";
var defalutBackColor = "#293c55";
function ReportOtion() {
    this.optionBar = {
        
        title: {
            text: '',
            subtext: ''
        },
        tooltip: {
            trigger: 'axis',
            formatter: ''
        },
        backgroundColor: defalutBackColor,
        textStyle:{color :defalutTextColor},
        legend: {
            textStyle: {
                color: defalutTextColor
            },
            data: ['系列1']
        },
        grid: {
            left: '3%',
            right: '8%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            show: false,
            feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['bar'] },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        calculable: true,
        xAxis: [
            {
               
                type: 'category',
                data: ['分类1', '分类2', '分类3', '分类4', '分类5'],
                //设置坐标轴字体颜色和宽度  
                //nameTextStyle: { color: '#ccc', },
                axisLabel: {
                    show: true,
                    interval: 'auto',
                    formatter: '{value}'// '{value} %'
                },
                axisLine: {
                   
                    lineStyle: {
                        color: defalutTextColor,
                    }
                },
            }
        ],
        yAxis: [
            {
                type: 'value',
                data:[],
                //设置坐标轴字体颜色和宽度  
                //nameTextStyle: { color: '#ccc', },
                axisLabel: {
                    show: true,
                    interval: 'auto',
                   formatter:'{value}'// '{value} %'
                },
                axisLine: {
                    lineStyle: {
                        color: defalutTextColor,
                    }
                },
            }
        ],
        
        series: [
            {
                
                name: '系列1',
                type: 'bar',
                data: [2.0, 4.9, 7.0, 23.2, 25.6],
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                    },
                },
                itemStyle: {
                    normal: {
                        label: {
                            show: true,
                            position: 'top',
                            formatter:'{c}'// '{b}\n{c}%'
                        }
                    }
                }

            },
            //{
               
            //    name: '系列2',
            //    type: 'bar',
            //    data: [2.6, 5.9, 9.0, 26.4, 28.7],
            //    label: {
            //        normal: {
            //            show: true,
            //            position: 'top'
            //        }
            //    },

            //}
        ]
    };
    this.optionLine = {
        title: {
            text: '',
            subtext: ''
        },
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            left: '3%',
            right: '8%',
            bottom: '3%',
            containLabel: true
        },
        backgroundColor: defalutBackColor,
        textStyle: { color: defalutTextColor },
        legend: {
            textStyle: {
                color: defalutTextColor
            },
            data: ['系列1', '系列2']
        },
        toolbox: {
            show: false,
            feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line'] },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        calculable: true,
        xAxis: [
            {
                type: 'category',
                data: ['分类1', '分类2', '分类3', '分类4', '分类5'],
                axisLine: {
                    lineStyle: {
                        color: defalutTextColor,
                    }
                },
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLine: {

                    lineStyle: {
                        color: defalutTextColor,
                    }
                },
            }
        ],
        series: [
            {
                name: '系列1',
                type: 'line',
                data: [2.0, 4.9, 7.0, 23.2, 25.6],
               

            },
            {
                name: '系列2',
                type: 'line',
                data: [2.6, 5.9, 9.0, 26.4, 28.7],
               


            }
        ]
    };
    this.optionShape = {
        title: {
            text: '',
            subtext: '',
            x: 'center'
        },
        backgroundColor: defalutBackColor,
        textStyle: { color: defalutTextColor },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        grid: {
            left: '3%',
            right: '8%',
            bottom: '15%',
            containLabel: true
        },
        legend: {
            textStyle: {
                color: defalutTextColor
            },
            orient: 'vertical',
            left: 'left',
            data: ['系列1', '系列2', '系列3']
        },
        series: [
            {
                name: '',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data: [
                    { value: 335, name: '系列1' },
                    { value: 310, name: '系列2' },
                    { value: 234, name: '系列3' }

                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    this.optionArea = {
        title: {
            text: ''
        },
        grid: {
            left: '3%',
            right: '8%',
            bottom: '3%',
            containLabel: true
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        backgroundColor: defalutBackColor,
        textStyle: { color: defalutTextColor },
        legend: {
            textStyle: {
                color: defalutTextColor
            },
            data: ['系列1', '系列2', '系列3']
        },

        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: ['分类1', '分类2', '分类3'],
                axisLine: {

                    lineStyle: {
                        color: defalutTextColor,
                    }
                },
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLine: {

                    lineStyle: {
                        color: defalutTextColor,
                    }
                },
            }
        ],
        series: [
            {
                name: '系列1',
                type: 'line',
                stack: '总量',
                areaStyle: { normal: {} },
                data: [120, 132, 101],

            },
            {
                name: '系列2',
                type: 'line',
                stack: '总量',
                areaStyle: { normal: {} },
                data: [220, 182, 191]
            },
            {
                name: '系列3',
                type: 'line',
                stack: '总量',
                areaStyle: { normal: {} },
                data: [150, 232, 201]
            }

        ]
    };
    this.optionTable=[]


}

module.exports={
    ReportOtion:ReportOtion
}






