const demo = {
    "sourceId": "test1",
    "rule": {
        "path": "",
        "attr": [{ "key": "year", "name": "years", "text": "年份" },
        {
            "path": "data",
            "attr": [{ "key": "a", "name": "a", "text": "电脑" },
            { "key": "b", "name": "data_b", "text": "人数" },
            { "path": "c", "attr": [{ "key": "d", "name": "d", "text": "其他" }] }]
        }]
    },
    "groupKey": "year",
    "title": "test1-1",
    "url": "/api/test/DRTestData",
    "method": "get",
    "params": null,
    "types": ["line", "bar"]
}


//根据抽取规则导出数据源
function exportJsonData(json, rule, useFormater) {
    if (json instanceof Array) {
        let data = [];
        json.forEach(function (j) {
            let ldata = exportObjData(j, rule, useFormater);
            if (ldata instanceof Array)
                data.push(...ldata);
            else
                data.push(ldata);
        });
        return data;
    }
    else if (json instanceof Object) {
        return exportObjData(json, rule, useFormater);
    }
}

function exportObjData(obj, rule, userFormater) {
    let prejson = undefined;
    if (isNullOrEmpty(rule.path)) {
        prejson = obj[rule.path];
        //eval('prejson=obj.' + rule.path);
    }
    else
        prejson = obj;
    try {
        prejson = JSON.parse(prejson);
    }
    catch (e) { }
    if (prejson instanceof Array) {
        let datas = [];
        prejson.forEach(function (pj) {
            let data = {};
            rule.attr.forEach(function (att) {
                if (att.key) {
                    if (pj[att.key] instanceof Array) {
                        let listData = [];
                        pj[att.key].forEach(function (pv) {
                            let ldata = undefined;
                            ldata = appendObjs(data, { [att.key]: pv });
                            //eval('ldata=appendObjs(data,{' + att.key + ':pv})');
                            if (data instanceof Array)
                                listData.push(...ldata);
                            else
                                listData.push(ldata);
                        });
                    }
                    else {
                        if (data instanceof Array) {
                            data = appendObjs(data, { [att.key]: pj[att.key] });
                            //eval('data=appendObjs(data,{' + att.key + ':pj[att.key]}');
                        }
                        else
                            data[att.name] = userFormater == true ? formatData(pj[att.key], att.formater, att.formaterValue) : pj[att.key];
                    }
                }
                else if (att.path) {
                    let pdata = exportObjData(pj, att, userFormater);
                    data = appendObjs(data, pdata);

                }

            });
            if (data instanceof Array)
                datas.push(...data);
            else
                datas.push(data);

        });
        return datas;
    }
    else if (prejson instanceof Object) {
        let data = {};
        rule.attr.forEach(function (att) {
            if (att.key) {
                if (prejson[att.key] instanceof Array) {
                    let listData = [];
                    prejson[att.key].forEach(function (pv) {
                        let ldata = undefined;
                        ldata = appendObjs(data, { [att.key]: pv });
                        //eval('ldata=d.appendObjs(data,{' + att.key + ':pv})');
                        if (data instanceof Array)
                            listData.push(...ldata);
                        else
                            listData.push(ldata);
                    });
                    data = listData;
                }
                else {
                    if (data instanceof Array) {
                        data = appendObjs(data, { [att.key]: prejson[att.key] });
                        //eval('data=d.appendObjs(data,{' + att.key + ':prejson[att.key]}');
                    }
                    else
                        data[att.name] = userFormater == true ? formatData(prejson[att.key], att.formater, att.formaterValue) : prejson[att.key];
                }
            }
            else if (att.path) {
                let pdata = exportObjData(prejson, att, userFormater);
                data = appendObjs(data, pdata);
            }
        });
        return data;
    }
}

///导出抽取规则字段
function exportRuleCol(rule) {
    let data = [];
    if (rule.attr instanceof Array) {
        rule.attr.forEach(function (att) {
            if (att.key) {
                data.push(att);
            }
            else if (att.path) {
                let pdata = exportRuleCol(att);
                data.push(...pdata);
            }
        });
    }
    return data;
}

function isNullOrEmpty(str) {
    if (str != undefined && str.trim() != '' && str != null) {
        return true;
    }
    return false;

    // if (str != undefined && str.trim() != '' && str != null) {
    //     return true;
    // }
    // return false;
}
function appendObjs(obj1, obj2) {
    let list = [];
    if (obj1 instanceof Array) {
        obj1.forEach(function (item1) {
            if (obj2 instanceof Array) {
                obj2.forEach(function (item2) {
                    list.push(appendObj(item1, item2));
                });
            }
            else
                list.push(appendObj(item1, obj2));
        });
    }
    else {
        if (obj2 instanceof Array) {
            obj2.forEach(function (item2) {
                list.push(appendObj(obj1, item2));
            });
        }
        else
            return appendObj(obj1, obj2);
    }
    return list;
}
function appendObj(obj1, obj2) {
    let obj3 = copyObj(obj1);
    let obj4 = copyObj(obj2);
    let keys = Object.keys(obj4);
    for (let i = 0, j = keys.length; i < j; i++) {
        obj3[keys[i]] = obj4[keys[i]];
    }
    return obj3;
}
function copyObj(obj) {
    let keys = Object.keys(obj || {});
    let newObj = {};
    for (let i = 0, j = keys.length; i < j; i++) {
        newObj[keys[i]] = obj[keys[i]];
    }
    return newObj;
}
//格式化数据
function formatData(data, formater, formaterValue) {
    switch (formater) {
        default:
        case 0://default
            return data;
        case 1://number
            return (parseFloat(data)).toFixed(formaterValue);
        case 2://money
            return money(data, formaterValue);
        case 3://date
            return dateFormat(new Date(data), formaterValue);
        case 4://percent
            return (parseFloat(data) * (parseFloat(formaterValue.times))).toFixed(formaterValue.fixed) + '%';

    }
};
//金钱格式转换
function money(num, length) {
    if (isNaN(parseFloat(num)))
        return num;
    return (parseFloat(num).toFixed(length) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
function dateFormat(date, fmt) { //author: meizz 
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时         
        "H+": date.getHours(), //小时         
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

module.exports = {
    exportJsonData,
    exportRuleCol,
}