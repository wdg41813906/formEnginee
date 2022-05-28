import DashboardConfig from '../../../../utils/DashboardConfig'
import com from '../../../../utils/com'
import TitleType from '../ConfigType/TitleType'
import StyleType from '../ConfigType/StyleType'
import ReportType from '../ConfigType/ReportType'
import XAxisType from '../ConfigType/XAxisType';
import YAxisType from '../ConfigType/YAxisType';
import LegendType from '../ConfigType/LegendType';
import LabelType from '../ConfigType/LabelType';
import ButtonType from '../ConfigType/ButtonType';
import RangeStyleType from '../ConfigType/RangeStyleType';
import QuotaStyleType from '../ConfigType/QuotaStyleType';
import LinkageType from '../ConfigType/LinkageType' 
import SerachComStyleType from '../ConfigType/SerachComStyleType';
let ReportConfigBase = [
    {
        type: DashboardConfig.Item.Bar,
        configTypeList: [
            {
                id:com.Guid(),
                key: "TitleType",
                selected:true,
                name: "标题",
                icon: 'font-colors',
                config: [
                    {
                        Component: TitleType,
                    }

                    
                ]
            },
            {
                 id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "样式",
                icon:'font-size',
                config: [
                    {
                        Component: StyleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "图表",
                icon:'font-size',
                config: [
                    {
                        Component: ReportType,
                    
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "XAxisType",
                selected:false,
                name: "X轴",
                icon:'font-size',
                config: [
                    {
                        Component: XAxisType,
                    }
                ]
            },
              {
                id:com.Guid(),
                key: "YAxisType",
                selected:false,
                name: "Y轴",
                icon:'font-size',
                config: [
                    {
                        Component: YAxisType,
                    }
                ]
            },
             {
                id:com.Guid(),
                key: "LegendType",
                selected:false,
                name: "图例",
                icon:'font-size',
                config: [
                    {
                        Component: LegendType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LabelType",
                selected:false,
                name: "标注",
                icon:'font-size',
                config: [
                    {
                        Component: LabelType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LabelType",
                selected:false,
                name: "联动",
                icon:'font-size',
                config: [
                    {
                        Component: LinkageType,
                    }
                ]
            }
            
        ]
    },
    {
        type: DashboardConfig.Item.Columnar,
        configTypeList: [
            {
                id:com.Guid(),
                key: "TitleType",
                selected:true,
                name: "标题",
                icon: 'font-colors',
                config: [
                    {
                        Component: TitleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "样式",
                icon:'font-size',
                config: [
                    {
                        Component: StyleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "图表",
                icon:'font-size',
                config: [
                    {
                        Component: ReportType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "XAxisType",
                selected:false,
                name: "X轴",
                icon:'font-size',
                config: [
                    {
                        Component: XAxisType,
                    }
                ]
            },
              {
                id:com.Guid(),
                key: "YAxisType",
                selected:false,
                name: "Y轴",
                icon:'font-size',
                config: [
                    {
                        Component: YAxisType,
                    }
                ]
            },
             {
                id:com.Guid(),
                key: "LegendType",
                selected:false,
                name: "图例",
                icon:'font-size',
                config: [
                    {
                        Component: LegendType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LabelType",
                selected:false,
                name: "标注",
                icon:'font-size',
                config: [
                    {
                        Component: LabelType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LabelType",
                selected:false,
                name: "联动",
                icon:'font-size',
                config: [
                    {
                        Component: LinkageType,
                    }
                ]
            }
        ]
    },
    {
        type: DashboardConfig.Item.Area,
        configTypeList: [
            {
                id:com.Guid(),
                key: "TitleType",
                selected:true,
                name: "标题",
                icon: 'font-colors',
                config: [
                    {
                        Component: TitleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "样式",
                icon:'font-size',
                config: [
                    {
                        Component: StyleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "图表",
                icon:'font-size',
                config: [
                    {
                        Component: ReportType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "XAxisType",
                selected:false,
                name: "X轴",
                icon:'font-size',
                config: [
                    {
                        Component: XAxisType,
                    }
                ]
            },
              {
                id:com.Guid(),
                key: "YAxisType",
                selected:false,
                name: "Y轴",
                icon:'font-size',
                config: [
                    {
                        Component: YAxisType,
                    }
                ]
            },
             {
                id:com.Guid(),
                key: "LegendType",
                selected:false,
                name: "图例",
                icon:'font-size',
                config: [
                    {
                        Component: LegendType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LabelType",
                selected:false,
                name: "标注",
                icon:'font-size',
                config: [
                    {
                        Component: LabelType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LabelType",
                selected:false,
                name: "联动",
                icon:'font-size',
                config: [
                    {
                        Component: LinkageType,
                    }
                ]
            }
        ]
    },
    {
        type: DashboardConfig.Item.Line,
        configTypeList: [
            {
                id:com.Guid(),
                key: "TitleType",
                selected:true,
                name: "标题",
                icon: 'font-colors',
                config: [
                    {
                        Component: TitleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "样式",
                icon:'font-size',
                config: [
                    {
                        Component: StyleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "ReportType",
                selected:false,
                name: "图表",
                icon:'font-size',
                config: [
                    {
                        Component: ReportType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "XAxisType",
                selected:false,
                name: "X轴",
                icon:'font-size',
                config: [
                    {
                        Component: XAxisType,
                    }
                ]
            },
              {
                id:com.Guid(),
                key: "YAxisType",
                selected:false,
                name: "Y轴",
                icon:'font-size',
                config: [
                    {
                        Component: YAxisType,
                    }
                ]
            },
             {
                id:com.Guid(),
                key: "LegendType",
                selected:false,
                name: "图例",
                icon:'font-size',
                config: [
                    {
                        Component: LegendType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LabelType",
                selected:false,
                name: "标注",
                icon:'font-size',
                config: [
                    {
                        Component: LabelType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LabelType",
                selected:false,
                name: "联动",
                icon:'font-size',
                config: [
                    {
                        Component: LinkageType,
                    }
                ]
            }
        ]
    },
    {
        type: DashboardConfig.Item.Shape,
        configTypeList: [
            {
                id:com.Guid(),
                key: "TitleType",
                selected:true,
                name: "标题",
                icon: 'font-colors',
                config: [
                    {
                        Component: TitleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "样式",
                icon:'font-size',
                config: [
                    {
                        Component: StyleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "图表",
                icon:'font-size',
                config: [
                    {
                        Component: ReportType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LegendType",
                selected:false,
                name: "图例",
                icon:'font-size',
                config: [
                    {
                        Component: LegendType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LabelType",
                selected:false,
                name: "标注",
                icon:'font-size',
                config: [
                    {
                        Component: LabelType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LabelType",
                selected:false,
                name: "联动",
                icon:'font-size',
                config: [
                    {
                        Component: LinkageType,
                    }
                ]
            }
        ]
    },
    {
        type: DashboardConfig.Item.Radar,
        configTypeList: [
            {
                id:com.Guid(),
                key: "TitleType",
                selected:true,
                name: "标题",
                icon: 'font-colors',
                config: [
                    {
                        Component: TitleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "样式",
                icon:'font-size',
                config: [
                    {
                        Component: StyleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "XAxisType",
                selected:false,
                name: "圆轴",
                icon:'font-size',
                config: [
                    {
                        Component: XAxisType,
                    }
                ]
            },
              {
                id:com.Guid(),
                key: "YAxisType",
                selected:false,
                name: "Y轴",
                icon:'font-size',
                config: [
                    {
                        Component: YAxisType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "图表",
                icon:'font-size',
                config: [
                    {
                        Component: ReportType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "LegendType",
                selected:false,
                name: "图例",
                icon:'font-size',
                config: [
                    {
                        Component: LegendType,
                    }
                ]
            },
            // {
            //     id:com.Guid(),
            //     key: "LabelType",
            //     selected:false,
            //     name: "标注",
            //     icon:'font-size',
            //     config: [
            //         {
            //             Component: LabelType,
            //         }
            //     ]
            // },
            {
                id:com.Guid(),
                key: "LabelType",
                selected:false,
                name: "联动",
                icon:'font-size',
                config: [
                    {
                        Component: LinkageType,
                    }
                ]
            }
        ]
    },
    {
        type: DashboardConfig.Item.DateRange,
        configTypeList: [
            {
                id:com.Guid(),
                key: "TitleType",
                selected:true,
                name: "标题",
                icon: 'font-colors',
                config: [
                    {
                        Component: TitleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "样式",
                icon: 'font-colors',
                config: [
                    {
                        Component: RangeStyleType,
                    },
                   
                ]
            },
           
        ]
    },
    {
        type: DashboardConfig.Item.NumberRange,
        configTypeList: [
            {
                id:com.Guid(),
                key: "TitleType",
                selected:true,
                name: "标题",
                icon: 'font-colors',
                config: [
                    {
                        Component: TitleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "样式",
                icon: 'font-colors',
                config: [
                    {
                        Component: RangeStyleType,
                    },
                   
                ]
            },
           
        ]
    },
    {
        type: DashboardConfig.Item.StringSelect,
        configTypeList: [
            {
                id:com.Guid(),
                key: "TitleType",
                selected:true,
                name: "标题",
                icon: 'font-colors',
                config: [
                    {
                        Component: TitleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "样式",
                icon: 'font-colors',
                config: [
                    {
                        Component: RangeStyleType,
                    },
                   
                ]
            },
          
        ]
    },
    {
        type: DashboardConfig.Item.Quota,
        configTypeList: [
            {
                id:com.Guid(),
                key: "TitleType",
                selected:true,
                name: "标题",
                icon: 'font-colors',
                config: [
                    {
                        Component: TitleType,
                    }
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "样式",
                icon: 'font-colors',
                config: [
                    {
                        Component: QuotaStyleType,
                    },
                   
                ]
            },
          
        ]
    },
    {
        type: DashboardConfig.Item.SearchButton,
        configTypeList: [
            {
                id:com.Guid(),
                key: "ButtonType",
                selected:true,
                name: "内容",
                icon: 'font-colors',
                config: [
                    {
                        Component: ButtonType,
                    },
                   
                ]
            },
            {
                id:com.Guid(),
                key: "StyleType",
                selected:false,
                name: "样式",
                icon: 'font-colors',
                config: [
                    {
                        Component: StyleType,
                    },
                   
                ]
            },
           
        ]
    },
]

export default{
    ReportConfigBase:ReportConfigBase
}