export function DataFilter(a, b, DragItem) {
    if (a.length === 0) return
    a.map(value => {
        b.map(item => {
            Object.keys(value).map(_item => {
                if (item.code === _item) {
                    value[item.name] = value[_item]
                    delete value[_item]
                }
            })
        })
    })
    // debugger
    // for (let i = 0; i < b.length; i++) {
    //     for (let m = 0; m < a.length; m++) {
    //         let _key = a[m][b[i]["code"]];
    //
    //         if (_key) {
    //             delete a[m][b[i]["code"]];
    //             a[m][b[i]["name"]] = _key
    //         }
    //     }
    // }
    // let bb = {};
    // b.forEach(n => {
    //     bb[n.code] = n.name
    // });
    // a.forEach(n => {
    //     let i = '';
    //     for (i in n) {
    //         if (bb[i]) {
    //             n[bb[i]] = n[i];
    //             delete n[i]
    //         }
    //     }
    // })
    let Yopt = []
    let Xopt = []
    let dimensionAry = []
    let strName = ['求和', '平均值', '最大值', '最小值', '计数']
    let ChartsData = JSON.stringify(a)
    let keys = Object.keys(a[0])
    keys.map(t => {
        if (t.indexOf('_Measures') === -1) {
            Yopt.push(t)
        }
    })
    DragItem.map(e => {
        if (e.ContainerId === 'indicators') {
            if (Number(e.CheckKey[0]) !== 0) {
                ChartsData = ChartsData.replace(new RegExp(`${e.Code}_Measures`, 'g'), `${e.Name}(${strName[e.CheckKey[0] - 2]})`)
                Xopt.push(`${e.Name}(${strName[e.CheckKey[0] - 2]})`)
            } else {
                Xopt.push(`${e.Name}(计数)`)
            }
        }

        if (e.ContainerId === 'dimensionX') {
            dimensionAry.push(e)
        }

    })
    ChartsData = ChartsData.replace(/_Measures/g, '(计数)')
    b.map(d => {
        ChartsData = ChartsData.replace(new RegExp(d.code, 'g'), d.name)
    })
    return {
        data: JSON.parse(ChartsData),
        Xopt: Xopt,
        Yopt: Yopt,
        dimensionAry: dimensionAry
    }


}

export function MuchdImension(aa, bb) {
    let dimensionXData = bb.filter(item => {
        return item.ContainerId === 'dimensionX'
    })
    let indicatorsData = bb.filter(item => {
        return item.ContainerId === 'indicators'
    })
    let strName = ['求和', '平均值', '最大值', '最小值', '计数']
    let Xopt = []
    let Yopt = []
    let Ary = []
    let objs = {}
    const res = new Map()
    aa.map(item => {
        Yopt.push(item[dimensionXData[0].Name])
        Xopt.push(item[dimensionXData[1].Name])
        item[item[dimensionXData[1].Name]] = item[`${indicatorsData[0].Name}(${indicatorsData[0].CheckKey[0] === '0' ? strName[4] : strName[indicatorsData[0].CheckKey[0] - 2]})`]
        delete item[`${indicatorsData[0].Name}(${indicatorsData[0].CheckKey[0] === '0' ? strName[4] : strName[indicatorsData[0].CheckKey[0] - 2]})`]
    })
    Xopt = Xopt.filter((a) => !res.has(a) && res.set(a, 1))
    Yopt = Yopt.filter((a) => !res.has(a) && res.set(a, 1))
    Yopt.map(t => {
        let obj = {}
        aa.map(item => {
            if (t === item[dimensionXData[0].Name]) {
                obj[item[dimensionXData[1].Name]] = item[item[dimensionXData[1].Name]]
                obj[dimensionXData[0].Name] = item[dimensionXData[0].Name]
                Object.assign(objs, obj);
            }
        })
        Ary.push(obj)
    })
    return {
        data: Ary,
        Xopt: Xopt,
        Yopt: Yopt
    }
}

