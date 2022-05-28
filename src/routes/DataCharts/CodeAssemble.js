import moment from 'moment'

/**
 * @return {string}
 */
function CodeTransform(code, s, e) {
    let CodeValue;
    if (s) {
        s = s.toString().split(",").map(items => {
            return `'${items}'`
        })
    }
    if (e) {
        e = e.toString().split(",").map(iteme => {
            return `'${iteme}'`
        })
    }
    switch (code) {
        case '等于':
            CodeValue = `=${s}`;
            break;
        case '大于':
            CodeValue = `>${s}`;
            break;
        case '小于':
            CodeValue = `<${s}`;
            break;
        case '大于等于':
            CodeValue = `>=${s}`;
            break;
        case '小于等于':
            CodeValue = `<=${s}`;
            break;
        case '不等于':
            CodeValue = `!=${s}`;
            break;
        case '不小于':
            CodeValue = `!<${s}`;
            break;
        case '不大于':
            CodeValue = `!>${s}`;
            break;
        case '等于任意一个':
            CodeValue = ` in (${s})`;
            break;
        case '不等于任意一个':
            CodeValue = ` not in (${s})`;
            break;
        case '为空':
            CodeValue = ` is null`;
            break;
        case '不为空':
            CodeValue = ` is not null`;
            break;
        case '选择范围':
            CodeValue = ` BETWEEN ${s} AND ${e}`;
            break;
        case '包含':
            CodeValue = ` like %${s}%`;
            break;
        case '不包含':
            CodeValue = ` not like %${s}%`;
            break
    }

    return CodeValue
}

/**
 * @return {string}
 */
function CountTime(type) {
    let CountTime;
    switch (type) {
        case '今天':
            CountTime = `=${moment.unix(moment().day(moment().day()).startOf('day').valueOf() / 1000).format('YYYY-MM-DD')}`;
            break;
        case '昨天':
            CountTime = `=${moment.unix(moment().day(moment().day() - 1).startOf('day').valueOf() / 1000).format('YYYY-MM-DD')}`;
            break;
        case '本周':
            CountTime = ` BETWEEN ${moment.unix(moment().week(moment().week()).startOf('week').valueOf() / 1000).format('YYYY-MM-DD')} AND ${moment.unix(moment().week(moment().week()).endOf('week').valueOf() / 1000).format('YYYY-MM-DD')}`;
            break;
        case '上周':
            CountTime = ` BETWEEN ${moment.unix(moment().week(moment().week() - 1).startOf('week').valueOf() / 1000).format('YYYY-MM-DD')} AND ${moment.unix(moment().week(moment().week() - 1).endOf('week').valueOf() / 1000).format('YYYY-MM-DD')}`;
            break;
        case '本月':
            CountTime = ` BETWEEN ${moment.unix(moment().month(moment().month()).startOf('month').valueOf() / 1000).format('YYYY-MM-DD')} AND ${moment.unix(moment().month(moment().month()).endOf('month').valueOf() / 1000).format('YYYY-MM-DD')}`;
            break;
        case '上月':
            CountTime = ` BETWEEN ${moment.unix(moment().month(moment().month() - 1).startOf('month').valueOf() / 1000).format('YYYY-MM-DD')} AND ${moment.unix(moment().month(moment().month() - 1).endOf('month').valueOf() / 1000).format('YYYY-MM-DD')}`;
            break

    }

    return CountTime
}

export function CodeAssemble(a) {
    let Conditions = [];
    a.map(item => {
        let Firstoption = item.Fillist[0].Firstoption;
        let Secondoption = item.Fillist[1].Secondoption;
        switch (item.ControlType) {
            case 'DateTime':
                if (Firstoption === '为空' || Firstoption === '不为空') {
                    Conditions.push(`${item.Code}${CodeTransform(Firstoption)}`)
                } else if (Firstoption === '选择范围') {
                    Conditions.push(`${item.Code}${CodeTransform(Firstoption, item.Fillist[2].Thirdoption, item.Fillist[3].Fourthoption)}`)
                } else if (Firstoption === '等于') {
                    if (Secondoption === '固定值') {
                        Conditions.push(`${item.Code}${CodeTransform(Firstoption, item.Fillist[2].Thirdoption)}`)
                    } else {
                        Conditions.push(`${item.Code}${CountTime(Secondoption)}`)
                    }
                } else {
                    Conditions.push(`${item.Code}${CodeTransform(Firstoption, item.Fillist[2].Thirdoption)}`)
                }
                break;
            case 'SingleText':
                if (Firstoption === '为空' || Firstoption === '不为空') {
                    Conditions.push(`${item.Code}${CodeTransform(Firstoption)}`)
                } else {
                    Conditions.push(`${item.Code}${CodeTransform(Firstoption, item.Fillist[1].Secondoption)}`)
                }
                break;
            case 'Number':
                if (Firstoption === '为空' || Firstoption === '不为空') {
                    Conditions.push(`${item.Code}${CodeTransform(Firstoption)}`)
                } else if (Firstoption === '选择范围') {
                    Conditions.push(`${item.Code}${CodeTransform(Firstoption, item.Fillist[1].Secondoption, item.Fillist[2].Thirdoption)}`)
                } else {
                    Conditions.push(`${item.Code}${CodeTransform(Firstoption, item.Fillist[1].Secondoption)}`)
                }

                break;
        }
    })
    return Conditions
}

//日期汇总方式
function DateTra(a) {
    let TraResult
    switch (a.CheckKey[0]) {
        case '2':
            TraResult = ` convert(nvarchar(10),YEAR(${a.Code}))+'年' as ${a.Code}`
            break;
        case '3':
            TraResult = ` convert(nvarchar(10),YEAR(${a.Code}))+'年第'+ convert(nvarchar(10),DATEPART(quarter,${a.Code}))+'季' as ${a.Code}`
            break;
        case '4':
            TraResult = ` convert(nvarchar(10),YEAR(${a.Code}))+'年'+ convert(nvarchar(10),Month(${a.Code}))+'月' as ${a.Code}`
            break;
        case '5':
            TraResult = ` convert(nvarchar(10),YEAR(${a.Code}))+'年'+ convert(nvarchar(10),DATEPART(WEEK,${a.Code}))+'周' as ${a.Code}`
            break;
        case '6':
            TraResult = ` convert(nvarchar(10),YEAR(${a.Code}))+'年'+ convert(nvarchar(10),Month(${a.Code}))+'月'+convert(nvarchar(10),Day(${a.Code}))+'日' as ${a.Code}`
            break;
    }
    return TraResult
}

//日期汇总方式与排序关联
function DateBySort(a) {
    let sort
    switch (a.CheckKey[0]) {
        case '2':
            sort = `YEAR(${a.Code})`
            break;
        case '3':
            sort = `YEAR(${a.Code}),DATEPART(quarter,${a.Code})`
            break;
        case '4':
            sort = `YEAR(${a.Code}),Month(${a.Code})`
            break;
        case '5':
            sort = `YEAR(${a.Code}),DATEPART(WEEK,${a.Code})`
            break;
        case '6':
            sort = `YEAR(${a.Code}),Month(${a.Code}),Day(${a.Code})`
            break;
    }
    return sort
}

//日期排序
function FilDate(a) {
    let sort
    switch (a.CheckKey[2]) {
        case '11':
            sort = `${DateBySort(a)}`
            break;
        case '12':
            sort = `${DateBySort(a)} asc`
            break;
        case '13':
            sort = `${DateBySort(a)} desc`
            break;
    }
    return sort
}

//其他字段排序
function FilCheckKey(i) {
    let sort
    switch (i) {
        case '11':
            sort = ''
            break;
        case '12':
            sort = 'asc'
            break;
        case '13':
            sort = 'desc'
            break;
    }
    return sort
}


export function OrderAssemble(a) {
    let CountMode = ['sum', 'avg', 'max', 'min', 'count']
    let OrderData = []
    if (Object.keys(a).length > 0) {
        if (a.ContainerId !== 'filterCondition') {//筛选非条件字段
            if (a.ControlType === 'DateTime') {
                if (a.ContainerId === 'dimensionX' || a.ContainerId === 'dimensionY') {
                    OrderData.push(`${FilDate(a)}`)
                }
                if (a.ContainerId === 'indicators') {//指标
                    OrderData.push(`count(${a.Code}) ${FilCheckKey(a.CheckKey[2])}`)
                }
            } else if (a.ControlType === 'SingleText') {
                if (a.ContainerId === 'dimensionX' || a.ContainerId === 'dimensionY') {
                    OrderData.push(`${a.Code} ${FilCheckKey(a.CheckKey[2])}`)
                }
                if (a.ContainerId === 'indicators') {//指标
                    if (Number(a.CheckKey[0]) === 0) {
                        OrderData.push(`count(${a.Code}) ${FilCheckKey(a.CheckKey[2])}`)
                    } else {
                        OrderData.push(`${CountMode[a.CheckKey[0] - 2]}(${a.Code}_Measures) ${FilCheckKey(a.CheckKey[2])}`)
                    }
                }

            } else {
                OrderData.push(`${a.Code}_Measures ${FilCheckKey(a.CheckKey[2])}`)
            }
        }
    }

    return OrderData
}

export function GroupsAssemble(a) {
    let GroupsData = []
    a.map(item => {
        GroupsData.push(DateBySort(item))
        // GroupsData.push(item.Code)
    })
    return GroupsData
}

export function DimensionsAssemble(a) {
    let AssembleData = []
    a.map(item => {
        if (item.ControlType === 'DateTime') {
            AssembleData.push(DateTra(item))
        } else {
            AssembleData.push(item.Code)
        }
    })
    return AssembleData
}


