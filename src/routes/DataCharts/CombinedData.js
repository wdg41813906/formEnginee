export function CombinedData(o, setDataResult, chartChange, size) {
    //拖拽完毕之后 数据筛选
    let DragItem = o.DragItem
    let CountMode = ['sum', 'avg', 'max', 'min', 'count']
    let Dimensions = []
    let Measure = []
    let Measures = []
    let Condition = []
    let Groups = []
    DragItem.map((item, index) => {
        if (item.ContainerId === 'dimensionX' || item.ContainerId === 'dimensionY') {//维度
            Dimensions.push(item)
            if (item.ControlType === 'DateTime') {
                Groups.push(item)
            }
        }
        if (item.ContainerId === 'indicators') {//指标
            Measure.push(item)
        }
        if (item.ContainerId === 'filterCondition') {//过滤条件
            Condition.push(item)
        }
    })
    Measure.map(i => {//指标筛选
        if (i.ControlType === 'Number') {
            if (i.CheckKey.length > 0) {
                Measures.push(`${CountMode[i.CheckKey[0] - 2]}(${i.Code}) ${i.Code}_Measures`)
            }
        } else {
            Measures.push(`${CountMode[4]}(${i.Code}) ${i.Code}_Measures`)
        }
    })
    //确认维度与指标的数量
    if (!size) {
        let ChartsType = o.ChartsType
        if (ChartsType === 'Line' || ChartsType === 'Columnar' || ChartsType === 'Radar' || ChartsType === 'Bar' || ChartsType === 'Area') {
            if ((Dimensions.length === 1 && Measure.length > 0) || (Dimensions.length === 2 && Measure.length === 1)) {
                setDataResult({
                    Dimensions: Dimensions,
                    Measures: Measures,
                    Condition: Condition,
                    Groups: Groups
                })
            } else if (Dimensions.length > 1 && Measure.length > 1) {
                chartChange('Table')
                setDataResult({
                    Dimensions: Dimensions,
                    Measures: Measures,
                    Condition: Condition,
                    Groups: Groups
                })
            }
        } else if (ChartsType === 'Shape' || ChartsType === 'Quota') {
            if (Dimensions.length === 1 && Measure.length === 1) {
                setDataResult({
                    Dimensions: Dimensions,
                    Measures: Measures,
                    Condition: Condition,
                    Groups: Groups
                })
            } else if (Dimensions.length > 1 || Measure.length > 1) {
                chartChange('Line')
                if (Dimensions.length !== 0 && Measure.length !== 0) {
                    setDataResult({
                        Dimensions: Dimensions,
                        Measures: Measures,
                        Condition: Condition,
                        Groups: Groups
                    })
                }
            }
        } else if (ChartsType === 'Table') {
            if (Dimensions.length > 0 && Measure.length > 0) {
                setDataResult({
                    Dimensions: Dimensions,
                    Measures: Measures,
                    Condition: Condition,
                    Groups: Groups
                })
            }

        }
    }


    return {
        Dimensions: Dimensions,
        Measures: Measures,
        Condition: Condition,
        Groups: Groups
    }

}
