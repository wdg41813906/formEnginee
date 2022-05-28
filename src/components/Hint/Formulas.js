import _ from "underscore";
import moment from "moment";
import {
    AND,
    OR,
    TRUE,
    FALSE,
    IF,
    NOT,
    XOR,
    CONCAT,
    CHAR,
    EXACT,
    DISTINCT,
    IP,
    ISEMPTY,
    LEFT,
    LEN,
    LOWER,
    REPLACE,
    REPEAT,
    SEARCH,
    RIGHT,
    SPLIT,
    TRIM,
    UPPER,
    NUM,
    MID,
    intToChinese,
    toThousands,
    TEXT,
    NOW,
    YEARS,
    DAYS,
    DATEDIF,
    HOURS,
    MINUTES,
    ADDDAY,
    ADDMONTH,
    ADDYEAR,
    YEAR,
    MONTH,
    DAY,
    HOUR,
    MINUTE,
    QUARTER,
    TODAY,
    WEEKDAY,
    DATEDELTA,
    TIMESTAMP,
    SECOND,
    DAYS360,
    WEEKNUM,
    ABS,
    CEILING,
    FLOOR,
    INT,
    LOG,
    PRODUCT,
    SQRT,
    ROUND,
    FIXED,
    SMALL,
    LARGE,
    COUNTIF,
    COUNT,
    RAND,
    CONTAIN,
    NOTCONTAIN,
    MAX,
    MIN,
    AVERAGE, MOD, POWER, SUM, UUID, SystemDate, run, MAPX
    
    
} from "./FormulaList";

export let resultValueType = null;

function setValueType(val) {
    resultValueType = val;
}

const preContext = {
    AND,
    OR,
    TRUE,
    FALSE,
    IF,
    NOT,
    XOR,
    CONCAT,
    CHAR,
    EXACT,
    DISTINCT,
    IP,
    ISEMPTY,
    LEFT,
    LEN,
    LOWER,
    REPLACE,
    REPEAT,
    SEARCH,
    RIGHT,
    SPLIT,
    TRIM,
    UPPER,
    NUM,
    MID,
    intToChinese,
    toThousands,
    TEXT,
    NOW,
    YEARS,
    DAYS,
    DATEDIF,
    HOURS,
    MINUTES,
    ADDDAY,
    ADDMONTH,
    ADDYEAR,
    YEAR,
    MONTH,
    DAY,
    HOUR,
    MINUTE,
    QUARTER,
    TODAY,
    WEEKDAY,
    DATEDELTA,
    TIMESTAMP,
    SECOND,
    DAYS360,
    WEEKNUM,
    ABS,
    CEILING,
    FLOOR,
    INT,
    LOG,
    PRODUCT,
    SQRT,
    ROUND,
    FIXED,
    SMALL,
    LARGE,
    COUNTIF,
    COUNT,
    RAND,
    CONTAIN,
    NOTCONTAIN,
    MAX,
    MIN,
    AVERAGE,
    MOD,
    POWER,
    SUM,
    UUID,
    SystemDate,
    run,
    MAPX
};
const preContextStr = "const {AND, OR, TRUE, FALSE, IF, NOT, XOR, CONCAT, CHAR, EXACT, DISTINCT, IP, ISEMPTY, LEFT, LEN, LOWER, REPLACE, REPEAT, SEARCH, RIGHT, SPLIT, TRIM, UPPER, NUM, MID, intToChinese, toThousands, TEXT, NOW, YEARS, DAYS,DATEDIF, HOURS, MINUTES, ADDDAY, ADDMONTH, ADDYEAR, YEAR, MONTH, DAY, HOUR, MINUTE, QUARTER, TODAY, WEEKDAY, DATEDELTA, TIMESTAMP, SECOND, DAYS360, WEEKNUM, ABS, CEILING, FLOOR, INT, LOG, PRODUCT, SQRT, ROUND, FIXED, SMALL, LARGE, COUNTIF, COUNT, RAND, CONTAIN, NOTCONTAIN, MAX, MIN, AVERAGE, MOD, POWER, SUM, UUID, SystemDate, run, MAPX}=this;";

function* formulaVal(valueType, str, formData, foreignData) {
    //'MAPX()+MAX(1)'
    if (str.trim().length > 0) {
        let resStr = str;
        var mapxRes = str.match(/MAPX\([\w\W]*?\)/g);
        if (mapxRes) {
            // var mapxSets=new Set(mapxRes);
            for (var i = 0; i < mapxRes.length; i++) {
                var mapx = mapxRes[i];
                var args = mapx.match(/\([\w\W]*?\)/g);
                var res = yield* MAPX(args, formData, foreignData);
                //var regexp = new RegExp(mapx , "g" )
                resStr = `'${resStr.replace(mapx, res)}'`;
                resStr = eval(`${resStr}`);
            }
        }
        var systemDateRes = str.match(/SystemDate\(\)/g);
        if (systemDateRes) {
            for (var i = 0; i < systemDateRes.length; i++) {
                var systemDate = systemDateRes[i];
                var res = yield* SystemDate();
                resStr = `'${resStr.replace(systemDate, res)}'`;
                //var a = resStr;
            }
        }
        
        let params = [];
        let paramsVal = [];
        for (let param in formData) {
            params.push(param);
            paramsVal.push(formData[param]);
        }
        setValueType(valueType);
        let fc = new Function(...params, `${preContextStr} return ${resStr}`);
        let v = fc.apply(preContext, paramsVal);
        // let paramsStr = "";
        // debugger
        // for (let param in formData) {
        //     let Type = Object.prototype.toString.call(formData[param]).slice(8, -1);
        //     paramsStr += `setValueType('${valueType}');let ${param}=new ${Type}(${JSON.stringify(formData[param])});`;
        // }
        //
        // let s = eval(`${paramsStr}${resStr}`);
        return v;
    }
    else
        return "";
}

export default {
    formulaVal,
    formulaList: [
        {
            groupName: "逻辑函数",
            groupList: [{
                name: "并且",
                func: "AND",
                exp: "AND(arg1,arg2,arg3...)",
                desc: "如果所有参数(arg1,arg2,arg3...)全为true，返回true，否则返回false"
            }, {
                name: "或者",
                func: "OR",
                exp: "OR(arg1,arg2,arg3...)",
                desc: "如果所有参数(arg1,arg2,arg3...)全为false，返回false，否则返回true"
            }, {
                name: "假",
                func: "FALSE",
                exp: "FALSE()",
                desc: "返回false"
            }, {
                name: "真",
                func: "TRUE",
                exp: "TRUE()",
                desc: "返回true"
            }, {
                name: "如果",
                func: "IF",
                exp: "IF(logical,trueVal,falseVal)",
                desc: "如果logical为true，返回trueVal，否则返回falseVal"
            }, {
                name: "取反",
                func: "NOT",
                exp: "NOT(logical)",
                desc: "如果logical为true，返回false，否则返回true"
            }, {
                name: "异或值",
                func: "XOR",
                exp: "XOR(逻辑表达式1, 逻辑表达式2,...)",
                desc: "返回所有参数的异或值"
            }, {
                name: "包含",
                func: "CONTAIN",
                exp: "CONTAIN(...args, target,trueVal,falseVal)",
                desc: "args是否包含target，包含返回trueVal，不包含返回falseVal"
            }, {
                name: "不包含",
                func: "NOTCONTAIN",
                exp: "NOTCONTAIN(...args, target,trueVal,falseVal)",
                desc: "args是否不包含target，不包含返回trueVal，包含返回falseVal"
            }, {
                name: "去重",
                func: "DISTINCT",
                exp: "DISTINCT(array)",
                desc: "去掉数组中重复的项"
            }]
        }, {
            groupName: "文本函数",
            groupList: [{
                name: "合并",
                func: "CONCAT",
                exp: "CONCAT(arg1,arg2,arg3...)",
                desc: "将所有参数(arg1,arg2,arg3...)合并为一个文本"
            }, {
                name: "比较",
                func: "EXACT",
                exp: "EXACT(arg1,arg2)",
                desc: "比较arg1是否与arg2完全相同，相同返回true，否则返回false"
            }, {
                name: "CHAR",
                func: "CHAR",
                exp: "CHAR(arg1)",
                desc: "CHAR函数可以将计算机字符集的数字代码转换为对应字符"
                
            }, {
                name: "IP",
                func: "IP",
                exp: "IP()",
                desc: "IP函数可以获取当前用户的ip地址"
            },
                {
                    name: "空文本检测",
                    func: "ISEMPTY",
                    exp: "ISEMPTY()",
                    desc: "ISEMPTY函数可以用来判断值是否为空文本"
                },
                {
                    name: "左截取",
                    func: "LEFT",
                    exp: "LEFT(str,len)",
                    desc: "返回字符串str从左向右第1个字符开始，截取len长度的字符串"
                }, {
                    name: "长度获取",
                    func: "LEN",
                    exp: "LEN(str)",
                    desc: "返回字符串str的长度"
                }, {
                    name: "小写化",
                    func: "LOWER",
                    exp: "LOWER(str)",
                    desc: "将字符串str中大写字母全部转为小写返回"
                }, {
                    name: "替换",
                    func: "REPLACE",
                    exp: "REPLACE(str,start,len,newStr)",
                    desc: "将字符串str中从start位置开始，长度为len的字符串替换为newStr返回"
                }, {
                    name: "重复",
                    func: "REPEAT",
                    exp: "REPEAT(str,times)",
                    desc: "将字符串str重复times次返回"
                }, {
                    name: "搜索",
                    func: "SEARCH",
                    exp: "SEARCH(文本1,文本2)",
                    desc: "SEARCH函数可以获取文本1在文本2中的开始位置"
                }, {
                    name: "右截取",
                    func: "RIGHT",
                    exp: "RIGHT(str,len)",
                    desc: "返回字符串str从右向左第1个字符开始，截取len长度的字符串"
                }, {
                    name: "分组",
                    func: "SPLIT",
                    exp: "SPLIT(str,key)",
                    desc: "将字符串str以key为分隔符，分割成字符串组返回"
                }, {
                    name: "文本化",
                    func: "TEXT",
                    exp: "TEXT(val,str)",
                    desc: "将数据val（如数字）转换为字符串返回"
                }, {
                    name: "去空格",
                    func: "TRIM",
                    exp: "TRIM(str)",
                    desc: "将字符串str去除首位空格\" \"返回"
                }, {
                    name: "大写化",
                    func: "UPPER",
                    exp: "UPPER(str)",
                    desc: "将字符串str中小写字母全部转为大写返回"
                }, {
                    name: "MID",
                    func: "MID",
                    exp: "MID(文本,开始位置_数字,指定数目)",
                    desc: "MID返回文本中从指定位置开始的指定数目的字符"
                }, {
                    name: "数字化",
                    func: "NUM",
                    exp: "NUM(str)",
                    desc: "将字符串str转换为数字返回，如果str为非数字，则返回0"
                }]
        },
        {
            groupName: "日期函数",
            groupList: [
                {
                    name: "当前时间",
                    func: "NOW",
                    exp: "NOW()",
                    desc: "NOW函数可以获取当前时间"
                },
                {
                    name: "今天",
                    func: "TODAY",
                    exp: "TODAY()",
                    desc: "TODAY()函数可以获取今天日期"
                },
                {
                    name: "日期",
                    func: "DATE",
                    exp: "DATE(时间戳)",
                    desc: "DATE函数可以将时间戳转换为日期对象"
                },
                {
                    name: "YEARS",
                    func: "YEARS",
                    exp: "YEARS(end_date,start_date)",
                    desc: "返回两个日期之间的年数差值(规则为一年按照360天计算)"
                },
                {
                    name: "DAYS",
                    func: "DAYS",
                    exp: "DAYS(end_date,start_date)",
                    desc: "返回两个日期之间的天数差值"
                },
                {
                    name: "DATEDIF",
                    func: "DATEDIF",
                    exp: "DATEDIF(开始时间,结束时间,'单位')，单位可以是 y 、M、d、h、m、s。",
                    desc: "DATEDIF函数可以计算两个日期时间相差的年数、月数、天数、小时数、分钟数、秒数。"
                    
                },
                {
                    name: "HOURS",
                    func: "HOURS",
                    exp: "HOURS(end_time,start_time)",
                    desc: "返回两个小时之间的小时数"
                },
                {
                    name: "MINUTES",
                    func: "MINUTES",
                    exp: "MINUTES(end_date,start_date)",
                    desc: "返回两个日期时间之间的分钟数"
                },
                {
                    name: "ADDDAY",
                    func: "ADDDAY",
                    exp: "ADDDAY(date,days)",
                    desc: "将指定日期（date）加/减指定天数（days），注：当为负数时在date上减去此天数"
                },
                {
                    name: "ADDMONTH",
                    func: "ADDMONTH",
                    exp: "ADDMONTH(date,months)",
                    desc: "将指定日期(date)加/减指定月数(months)，注：当为负数时在此date上减去此月数"
                },
                {
                    name: "ADDYEAR",
                    func: "ADDYEAR",
                    exp: "ADDYEAR(date,years)",
                    desc: "将指定日期加/减指定年数，date为指定日期，years为指定年数，当为负数时在此date上减去此年数"
                },
                {
                    name: "YEAR",
                    func: "YEAR",
                    exp: "YEAR(date)",
                    desc: "返回日期date的年份"
                },
                {
                    name: "MONTH",
                    func: "MONTH",
                    exp: "MONTH(date)",
                    desc: "返回日期date月份，值为介于1到12之间的整数"
                },
                {
                    name: "DAY",
                    func: "DAY",
                    exp: "DAY(date)",
                    desc: "返回日期date的天数，值为介于1到31之间的整数"
                },
                {
                    name: "HOUR",
                    func: "HOUR",
                    exp: "HOUR(date)",
                    desc: "返回日期date的小时部分"
                },
                {
                    name: "MINUTE",
                    func: "MINUTE",
                    exp: "MINUTE(date)",
                    desc: "返回日期date的分钟部分"
                },
                {
                    name: "QUARTER",
                    func: "QUARTER",
                    exp: "QUARTER(date)",
                    desc: "返回日期date的所属季度，值为介于1到4的整数"
                },
                /* {
                    name:"TODAY",
                    func:"TODAY",
                    exp:"TODAY(date)",
                    desc:"返回今天的日期，格式为:yyyy-MM-dd"
                }, */
                {
                    name: "WEEKDAY",
                    func: "WEEKDAY",
                    exp: "WEEKDAY(date)",
                    desc: "返回指定日期date为星期几"
                },
                {
                    name: "DATEDELTA",
                    func: "DATEDELTA",
                    exp: "DATEDELTA(指定日期,需要加减的天数)",
                    desc: "DATEDELTA函数可以将指定日期加/减指定天数"
                },
                {
                    name: "DAYS360",
                    func: "DAYS360",
                    exp: "DAYS360(结束日期,开始日期)",
                    desc: "DAYS360按照一年 360 天的算法，返回两个日期间相差的天数"
                },
                {
                    name: "SECOND",
                    func: "SECOND",
                    exp: "SECOND(时间戳)",
                    desc: "SECOND函数可以返回某日期的秒数"
                },
                {
                    name: "TIMESTAMP",
                    func: "TIMESTAMP",
                    exp: "TIMESTAMP(日期)",
                    desc: "TIMESTAMP函数可以将日期对象转换成时间戳。"
                },
                {
                    name: "WEEKNUM",
                    func: "WEEKNUM",
                    exp: "WEEKNUM(date)",
                    desc: "返回一个数字，该数字代表指定日期date是一年中的第几周"
                }
            
            ]
        },
        {
            groupName: "数学函数",
            groupList: [
                {
                    name: "绝对值",
                    func: "ABS",
                    exp: "ABS(数字)",
                    desc: "ABS函数可以获取一个数的绝对值"
                },
                {
                    name: "保留小数位数",
                    func: "FIXED",
                    exp: "FIXED(数字,小数位数)",
                    desc: "FIXED函数可将数字舍入到指定的小数位数并输出为文本"
                },
                {
                    name: "SMALL",
                    func: "SMALL",
                    exp: "SMALL(数组,k)",
                    desc: "SMALL函数可以返回数据集中第k个最小值"
                },
                {
                    name: "LARGE",
                    func: "LARGE",
                    exp: "LARGE(数组,k)",
                    desc: "LARGE函数可以返回数据集中第k个最大值"
                    
                },
                {
                    name: "COUNTIF",
                    func: "COUNTIF",
                    exp: "COUNTIF(数组,\"条件\")",
                    desc: "COUNTIF函数可以获取数组中满足条件的参数个数"
                },
                {
                    name: "CEILING函数可以将数字增大到最接近原值的指定因数的倍数",
                    func: "CEILING",
                    exp: "CEILING(数字,因数)",
                    desc: "CEILING函数可以将数字增大到最接近原值的指定因数的倍数"
                },
                {
                    name: "FLOOR函数可将数字减小到最接近原值的指定因数的倍数",
                    func: "FLOOR",
                    exp: "FLOOR(数字,因数)",
                    desc: "FLOOR函数可将数字减小到最接近原值的指定因数的倍数"
                },
                {
                    name: "数的整数部分",
                    func: "INT",
                    exp: "INT(数字)",
                    desc: "INT函数可以获取一个数的整数部分"
                },
                {
                    name: "返回数字的对数",
                    func: "LOG",
                    exp: "LOG(数字,底数)",
                    desc: "LOG函数可以根据指定底数返回数字的对数"
                },
                {
                    name: "返回一组数值的乘积",
                    func: "PRODUCT",
                    exp: "PRODUCT(数字1,数字2,...)",
                    desc: "PRODUCT函数可以获取一组数值的乘积"
                    
                },
                {
                    name: "正平方根",
                    func: "SQRT",
                    exp: "SQRT(数字)",
                    desc: "SQRT函数可以获取一个数字的正平方根"
                },
                {
                    name: "数字四舍五入到指定的位数",
                    func: "ROUND",
                    exp: "ROUND(数字,数字位数)",
                    desc: "ROUND函数可以将数字四舍五入到指定的位数"
                },
                {
                    name: "获取参数的数量",
                    func: "COUNT",
                    exp: "COUNT(值,值,...)",
                    desc: "COUNT函数可以获取参数的数量"
                },
                {
                    name: "随机数",
                    func: "RAND",
                    exp: "RAND(小数位数)",
                    desc: "RAND函数可返回大于等于0且小于1的均匀分布随机实数"
                },
                {
                    name: "最大值",
                    func: "MAX",
                    exp: "MAX(数字1,数字2,...)",
                    desc: "MAX函数可以获取一组数值的最大值"
                },
                {
                    name: "最小值",
                    func: "MIN",
                    exp: "MIN(数字1,数字2,...)",
                    desc: "MAX函数可以获取一组数值的最小值"
                },
                {
                    name: "算术平均值",
                    func: "AVERAGE",
                    exp: "AVERAGE(数字1,数字2,...)",
                    desc: "AVERAGE函数可以获取一组数值的算术平均值"
                },
                {
                    name: "求余",
                    func: "MOD",
                    exp: "MOD(被除数,除数)",
                    desc: "MOD函数可以获取两数相除的余数"
                },
                {
                    name: "乘幂",
                    func: "POWER",
                    exp: "POWER(数字,指数)",
                    desc: "POWER函数可以获取数字乘幂的结果"
                },
                {
                    name: "总和",
                    func: "SUM",
                    exp: "SUM(数字1,数字2,...)",
                    desc: "SUM函数可以获取一组数值的总和"
                }
            
            ]
        },
        {
            groupName: "高级函数",
            groupList: [
                {
                    name: "随机码生成器",
                    func: "UUID",
                    exp: "UUID()",
                    desc: "UUID函数随机码生成器。可适用于随机流水号的使用场景等"
                },
                {
                    name: "服务器日期",
                    func: "SystemDate",
                    exp: "SystemDate()",
                    desc: "返回当前服务器时间"
                    
                },
                {
                    name: "跨表单取数",
                    func: "MAPX",
                    exp: "MAPX(operation, map_value, map_field, result_field)",
                    desc: "MAPX函数是一个可以用来进行跨表单取数的高级函数"
                }
            ]
        }
    
    ],
    formulaKeywords: ["AND", "OR", "TRUE", "FALSE", "IF", "NOT", "XOR", "CHAR", "CONCAT", "CONTAIN", "NOTCONTAIN",
        "EXACT", "IP", "ISEMPTY", "LEFT", "LEN", "LOWER", "REPLACE", "REPEAT", "SEARCH", "RIGHT", "SUM",
        "SPLIT", "TRIM", "UPPER", "MID", "TEXT", "UUID", "MAPX", "SystemDate", "NUM", "DISTINCT",
        "DATE", "NOW", "TODAY", "YEARS", "DAYS", "DATEDIF", "HOURS", "MINUTES", "ADDMONTH", "ADDYEAR", "YEAR", "MONTH", "DAY", "HOUR", "MINUTE", "QUARTER", "WEEKDAY", "WEEKNUM", "DATEDELTA", "DAYS360", "SECOND", "TIMESTAMP",
        "ABS", "FIXED", "SMALL", "LARGE", "COUNTIF", "INT", "FLOOR", "CEILING", "LOG", "PRODUCT", "SQRT", "ROUND", "COUNT", "RAND", "MAX", "MIN", "AVERAGE", "MOD", "POWER", "SUM"
    ],
    //保留关键字
    retainKeywords: [
        `'${"first"}'`, `'${"last"}'`, `'${"max"}'`, `'${"min"}'`
        , `'${"avg"}'`, `'${"sum"}'`, `'${"count"}'`
    ]
};
