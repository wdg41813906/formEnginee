import com from './com'

const Mode = {
    Add: 'Add',
    Modify: 'Modify',
    Delete: 'Delete'
}
/**
 * 设计类型
 */
const DesignType = {
    Detail: 'Detail',//明细
    Statistic: 'Statistics'//统计
}
/*
 报表类型
 */
const Item = {
    Quota: 'Quota',//指标图
    Bar: "Bar",//条形图
    Columnar: "Columnar",//柱形图
    Area: "Area",//面积图
    Line: "Line",//线图
    Table: "Table",//透视图
    Shape: "Shape",//饼图
    Radar: "Radar",//雷达图
    DateRange: "DateRange",//日期范围
    NumberRange: "NumberRange",//数字范围
    StringSelect: "StringSelect",//文本选择
    SearchButton: "SearchButton"//查询按钮

}
const ReportItemArray = [Item.Quota, Item.Table, Item.Bar, Item.Columnar, Item.Area, Item.Line, Item.Shape,
    Item.Radar]

const SearchItemArray=[Item.DateRange,Item.NumberRange,Item.StringSelect]
/*
 控件类型
 */
const ControlType = {
    SingleText: "SingleText",
    CheckBoxes: "CheckBoxes",
    MutiDropDownList: "MutiDropDownList",
    MutiText: "MutiText",
    Picture: "Picture",
    SingleRadio: "SingleRadio",
    Number: "Number",
    DateTime: "DateTime"
}
/**
 * 表单类型和报表类型映射
 */
const ControlTypeItemMapping =
    {DateTime: Item.DateRange, Number: Item.NumberRange, SingleText: Item.StringSelect}

const FontFamily = [
    {name: "微软雅黑", value: "Microsoft YaHei"},
    {name: "黑体", value: "SimHei"},
    {name: "宋体", value: "SimSun"},
    {name: "楷体", value: "KaiTi"},
    {name: "隶书", value: "LiSu"},
    {name: "幼圆", value: "YouYuan"},
    {name: "华文细黑", value: "STXihei"}
]
const LegendPosition = [
    {name: "左侧顶部", value: "left-top"},
    {name: "左侧居中", value: "left-center"},
    {name: "左侧底部", value: "left-bottom"},

    {name: "右侧顶部", value: "right-top"},
    {name: "右侧居中", value: "right-center"},
    {name: "右侧底部", value: "right-bottom"},

    {name: "顶部居左", value: "top-left"},
    {name: "顶部居中", value: "top-center"},
    {name: "顶部居右", value: "top-bottom"},

    {name: "底部居左", value: "bottom-left"},
    {name: "底部居中", value: "bottom-center"},
    {name: "底部居右", value: "bottom-right"}
]
const Layout = [
    {name: "垂直", value: "vertical"},
    {name: "水平", value: "horizontal"}
]

const ColorMatch=[
    {name: "默认配色", value: "default"},
    {name: "自定义配色", value: "custom"}
]
const DefalutColors=[
    {from:'#2b80cf',to:'#00ffcc'},
    {from:'#009387',to:'#61f5ff'},
    {from:'#3d2cda',to:'#ce90d8'},
    {from:'#2354c0',to:'#96b7ff'},
    {from:'#00c9ff',to:'#97eaa0'},

]
const allConfig = {
    name: "新建仪盘表",
    reMark: "",
    textAlign: "center",
    backImageShow: true,
    backImageUrl: "/UploadFiles/Images/2018/11/5/201811051629957089c65e24308b4b00923a5bb6d9468dc2.jpeg",
    backgroundColor: "#1890ff",//背景样式
    textFontFamily: FontFamily[0].value,
    textFill: "#fff",// 文本的颜色
    textFontSize: 14,//文本大小
    textFontWeight: false,//字体加粗
    textItalic: false,////字体斜体
}

const configObj = {
    /**
     * 标题
     */
    title: {
        name: "",//名称
        remark: "",//备注
        textAlign: "center",//对齐方式
        backgroundColor: "transparent",//背景样式

        // FontColor: "#fff",//字体颜色
        //FontSize: 14,//字号

        textFontFamily: FontFamily[0].value,
        textFill: "#000",// 文本的颜色
        textFontSize: 14,//文本大小
        textFontWeight: false,//字体加粗
        textItalic: false,////字体斜体
    },
    /**
     * 样式
     */
    style: {
        backgroundColor: "transparent",//背景样式
        borderColor: '#ccc',//边框颜色
        borderStyle: 'solid',//边框虚实
        borderRadius: 1,//边框弧度
        textFontFamily: FontFamily[0].value,
        textFill: "red",// 文本的颜色
        textFontSize: 14,//文本大小
        textFontWeight: false,//字体加粗
        textItalic: false,////字体斜体
    },
    /**
     * 图表
     * */
    report: {
        paddingTop: 20,
        paddingRight: 20,
        paddingBottom: 60,
        paddingLeft: 20,
        colorMatchMode:ColorMatch[0].value,//配色模式
        colorMatchGradualChange:false,//渐变
        colorMatchProgrammes:[],//配色方案
        
    },
    xAxis: {
        lineStroke: "#ccc",//轴线颜色
        labelTextFill: '#000',//文本的颜色
        lableTextFontSize: 12,//文本大小
        labelTextFontFamily: FontFamily[0].value,
        lableTextRotate: 0,//旋转角度
        lableTextWeight: false,//字体加粗
        lableTextItalic: false,//字体斜体
        labelOffset: 10,//设置坐标轴文本 label 距离坐标轴线的距离

    },
    yAxis: {
        lineStroke: "#ccc",//轴线颜色
        labelTextFill: '#000',//文本的颜色
        lableTextFontSize: 12,//文本大小
        labelTextFontFamily: FontFamily[0].value,
        lableTextRotate: 0,//旋转角度
        lableTextWeight: false,//字体加粗
        lableTextItalic: false,//字体斜体
        labelOffset: 10,//设置坐标轴文本 label 距离坐标轴线的距离
    },
    legend: {
        visible: true,//图例是否可见
        position: "bottom-center",//图例的显示位置
        layout: 'horizontal',//图例项的排列方式
        itemGap: 5,//图例每项之间的间距
        textFontFamily: FontFamily[0].value,
        textFill: "#000",// 文本的颜色
        textFontSize: 14,//文本大小
        textFontWeight: false,//字体加粗
        textItalic: false,////字体斜体
    },
    label: {
        offset: 45,//文本距离几何图形的的距离
        textFontFamily: FontFamily[0].value,
        textFill: "#000",// 文本的颜色
        textFontSize: 14,//文本大小
        textFontWeight: false,//字体加粗
        textItalic: false,////字体斜体
    },
    ///联动配置
    linkAge:{
        sourceFields:[],
        homologys:[],
        nonHomologys:[]
    }

}
const BorderStyle = [
    {name: "实线", value: 'solid'},
    {name: "虚线", value: 'dashed'},
    {name: "点虚状", value: 'dotted'}
]
/**
 * 报表项模板
 */
const BaseReport = [
    {
        id: com.Guid(), w: 4,
        h: 2, tableId: '', searchData: {},
        showOperate: false, type: Item.SearchButton, title: "搜索",
        config: configObj
    },
    {
        id: com.Guid(), w: 4,
        h: 2, tableId: '', searchData: {
            itemField: {},
            currentField: {}
        },
        showOperate: false, type: Item.StringSelect, title: "多选搜索",
        config: configObj
    },
    {
        id: com.Guid(), w: 4,
        h: 2, tableId: '', searchData: {
            itemField: {},
            currentField: {}
        },
        showOperate: false, type: Item.NumberRange, title: "数字范围",
        config: configObj
    },
    {
        id: com.Guid(), w: 4,
        h: 2, tableId: '', searchData: {
            itemField: {},
            currentField: {}
        },
        showOperate: false, type: Item.DateRange, title: "日期范围",
        config: configObj
    },
    {
        id: com.Guid(), w: 8,
        h: 6, tableId: 'table1',
        showOperate: false, type: Item.Quota, title: "指标图",
        config: configObj
    },

    {
        id: com.Guid(), w: 8,
        h: 8, tableId: 'table1',
        showOperate: false, type: Item.Bar, title: "条形图",
        config: configObj
    },
    {
        id: com.Guid(), w: 8,
        tableId: 'table1',
        h: 8, showOperate: false, type: Item.Columnar, title: "柱形图",
        config: configObj
    },
    {
        id: com.Guid(), w: 8,
        tableId: 'table1',
        h: 8, showOperate: false, type: Item.Area, title: "面积图",
        config: configObj
    },
    {
        id: com.Guid(), w: 8,
        tableId: 'table2',
        h: 8, showOperate: false, type: Item.Line, title: "线图",
        config: configObj
    },
    {
        id: com.Guid(), w: 8,
        tableId: 'table2',
        h: 8, showOperate: false, type: Item.Shape, title: "饼图",
        config: configObj
    },
    {
        id: com.Guid(), w: 8,
        tableId: 'table2',
        h: 8, showOperate: false, type: Item.Radar, title: "雷达图",
        config: configObj
    },
    {
        id: com.Guid(), w: 8,
        tableId: 'table2',
        h: 8, showOperate: false, type: Item.Table, title: "表格",
        config: configObj
    },


]

function ItemSytle(item, dragactWidth) {
    var _this = this;
    var result = {
        width: 0,
        height: 0,
        maxH: 1,
        maxW: 2
    }

    switch (item.type) {
        case _this.Item.SearchButton:
            result.width = item.w * 10;
            result.height = item.h == 1 ? (item.h * 40) : (item.h * 40 + 5);
            result.maxW = 4;
            result.maxH = 2;

            break;

        case _this.Item.DateRange:
        case _this.Item.NumberRange:
            result.width = item.w * 10;
            result.height = Math.round(40 * item.h + Math.max(0, item.h - 1) * 5) - 57;
            result.maxW = 4;
            result.maxH = 2;

            break;
        case _this.Item.StringSelect:
            result.width = item.w * 10;
            result.height = Math.round(40 * item.h + Math.max(0, item.h - 1) * 5) - 57;
            result.maxW = 4;
            result.maxH = 2;
            break;
        default:
            result.width = Math.round(((dragactWidth ? dragactWidth : 1500 - 5 * (16 - 1) - 5 * 2) / 16) * item.w + Math.max(0, item.w - 1) * 5);// item.w * 107 - 40;
            result.height = Math.round(40 * item.h + Math.max(0, item.h - 1) * 5) - 57;//item.h * 40-32;
            result.maxW = 8;
            result.maxH = 8;
            break
    }
    return result;
}

//colWidth=(containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols
//width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * margin[0]),
//height: h === Infinity ? h : Math.round(rowHeight * h + Math.max(0, h - 1) * margin[1])

module.exports = {
    DesignType: DesignType,
    Mode: Mode,
    Item: Item,
    AllConfig: allConfig,
    Config: configObj,
    ReportItemArray: ReportItemArray,
    SearchItemArray:SearchItemArray,
    ControlType: ControlType,
    ItemSytle: ItemSytle,
    BaseReport: BaseReport,
    BorderStyle,
    FontFamily,
    LegendPosition,
    Layout,
    ColorMatch,
    DefalutColors,
    ControlTypeItemMapping: ControlTypeItemMapping
}
