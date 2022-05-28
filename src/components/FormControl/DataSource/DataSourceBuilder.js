export const FORMATER_TYPE = Object.freeze({
    Default: 0,
    Number: 1,
    Money: 2,
    DateTime: 3,
    Percent: 4
});
function formatData(data, formater, formaterValue) {
    switch (formater) {
        default:
        case FORMATER_TYPE.Default:
            return data;
        case FORMATER_TYPE.Number:
            return (parseFloat(data)).toFixed(formaterValue);
        case FORMATER_TYPE.Money:
            return Money(data, formaterValue);
        case FORMATER_TYPE.DateTime:
            return (new Date(data)).Format(formaterValue);
        case FORMATER_TYPE.Percent:
            return (parseFloat(data) * (parseFloat(formaterValue.times))).toFixed(formaterValue.fixed) + '%';
    }
};

function ExportObjData(obj, rule, userFormater) {
    let prejson = undefined;
    if (IsNullOrEmpty(rule.path)) {
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
                            let ob = {};
                            ob[att.key] = pv;
                            ldata = AppendOjbs(data, ob);
                            //eval('ldata=d.AppendOjbs(data,{' + att.key + ':pv})');
                            if (data instanceof Array)
                                listData.push(...ldata);
                            else
                                listData.push(ldata);
                        });
                    }
                    else {
                        if (data instanceof Array) {
                            let ob = {};
                            data = ob[att.key] = pj[att.key];
                            //eval('data=d.AppendOjbs(data,{' + att.key + ':pj[att.key]}');
                        }
                        else
                            data[att.name] = userFormater == true ? formatData(pj[att.key], att.formater, att.formaterValue) : pj[att.key];
                    }
                }
                else if (att.path) {
                    let pdata = ExportObjData(pj, att, userFormater);
                    data = AppendOjbs(data, pdata);

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
                        let ob = {};
                        ob[att.key] = pv;
                        ldata = AppendOjbs(data, ob);
                        if (data instanceof Array)
                            listData.push(...ldata);
                        else
                            listData.push(ldata);
                    });
                    data = listData;
                }
                else {
                    if (data instanceof Array) {
                        let ob = {};
                        data = ob[att.key] = prejson[att.key];
                    }
                    else
                        data[att.name] = userFormater == true ? formatData(prejson[att.key], att.formater, att.formaterValue) : prejson[att.key];
                }
            }
            else if (att.path) {
                let pdata = ExportObjData(prejson, att, userFormater);
                data = AppendOjbs(data, pdata);
            }
        });
        return data;
    }
}
function AppendOjbs(obj1, obj2) {
    let list = [];
    if (obj1 instanceof Array) {
        obj1.forEach(function (item1) {
            if (obj2 instanceof Array) {
                obj2.forEach(function (item2) {
                    list.push(AppendObj(item1, item2));
                });
            }
            else
                list.push(AppendObj(item1, obj2));
        });
    }
    else {
        if (obj2 instanceof Array) {
            obj2.forEach(function (item2) {
                list.push(AppendObj(obj1, item2));
            });
        }
        else
            return AppendObj(obj1, obj2);
    }
    return list;
}
function AppendObj(obj1, obj2) {
    var obj3 = CopyObj(obj1);
    var obj4 = CopyObj(obj2);
    var keys = Object.keys(obj4);
    for (let i = 0, j = keys.length; i < j; i++) {
        obj3[keys[i]] = obj4[keys[i]];
    }
    return obj3;
}
function CopyObj(obj) {
    var keys = Object.keys(obj || {});
    var newObj = {};
    for (let i = 0, j = keys.length; i < j; i++) {
        newObj[keys[i]] = obj[keys[i]];
    }
    return newObj;
}
//从数据源导出数据
function ExportData(source, key) {
    var data = [];
    source.forEach(function (item) {
        if (key instanceof Array) {
            let ldata = [];
            for (let i = 0, j = key.length; i < j; i++) {
                if (typeof key[i] == 'string' && item[key[i]]) {
                    ldata.push(item[key[i]]);
                }
            }
            data.push(ldata);
        } else if (typeof key == 'string' && item[key]) {
            data.push(item[key]);
        }
    });
    return data;
}
///导出抽取规则字段
function ExportRuleCol(rule) {
    let data = [];
    if (rule.attr instanceof Array) {
        rule.attr.forEach(function (att) {
            if (att.key) {
                data.push(att);
            }
            else if (att.path) {
                let pdata = ExportRuleCol(att);
                data.push(...pdata);
            }
        });
    }
    return data;
}
function Money(num, length) {
    if (isNaN(parseFloat(num)))
        return num;
    return (parseFloat(num).toFixed(length) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
}
function IsNullOrEmpty(str) {
    if (str != undefined && str.trim() != '' && str != null) {
        return true;
    }
    return false;
}
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时         
        "H+": this.getHours(), //小时         
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
export function ExportTepmlate(json, rule, useFormater) {
    //当取数规则不存在时，返回原始值
    if ((rule || []).length == 0)
        return json;
    if (json instanceof Array) {
        let data = [];
        json.forEach(function (j) {
            let ldata = ExportObjData(j, rule, useFormater);
            if (ldata instanceof Array)
                data.push(...ldata);
            else
                data.push(ldata);
        });
        return data;
    }
    else if (json instanceof Object) {
        return ExportObjData(json, rule, useFormater);
    }
}
// const demoRequestData = [
//     {
//         "DictItemID": "E63FAD2A-BBCB-4B0A-B9BB-BCF29F4298E6",
//         "DictItemCode": "01", "DictItemName": "领导班子",
//         "DictItemFullName": "领导班子",
//         "PDictItemID": "4A5CD245-81CE-441B-8401-15EE484550F3",
//         "Lowest": "True",
//         "id": "E63FAD2A-BBCB-4B0A-B9BB-BCF29F4298E6",
//         "text": "领导班子",
//         "icon": "/icons/group-png/ext.axd",
//         "leaf": true,
//         "expanded": false
//     },
//     {
//         "DictItemID": "E3892B99-448B-44D6-900D-C4AC4DAD1454",
//         "DictItemCode": "02",
//         "DictItemName": "办公室",
//         "DictItemFullName": "办公室",
//         "PDictItemID": "4A5CD245-81CE-441B-8401-15EE484550F3",
//         "Lowest": "True", "id": "E3892B99-448B-44D6-900D-C4AC4DAD1454",
//         "text": "办公室", "icon": "/icons/group-png/ext.axd",
//         "leaf": true,
//         "expanded": false
//     },
//     {
//         "DictItemID": "AB5D6655-E3E9-4FB0-922F-8D10F0769312",
//         "DictItemCode": "03", "DictItemName": "财务部",
//         "DictItemFullName": "财务部",
//         "PDictItemID": "4A5CD245-81CE-441B-8401-15EE484550F3",
//         "Lowest": "True",
//         "id": "AB5D6655-E3E9-4FB0-922F-8D10F0769312",
//         "text": "财务部", "icon": "/icons/group-png/ext.axd",
//         "leaf": true,
//         "expanded": false
//     }];
// const demoRule = {
//     attr: [{
//         key: 'id',
//         name: 'value'
//     },
//     {
//         key: 'text',
//         name: 'text'
//     },
//     {
//         key: 'leaf',
//         name: 'leaf'
//     }
//     ]
// };
// const demoRule = {
// path: "data",
// attr: [{
//     key: "id",
//     name: "id",
//     text: "年份"
// },
// {
//     path: "data",
//     attr: [{
//         key: "a",
//         name: "a",
//         text: "电脑"
//     },
//     {
//         key: "b",
//         name: "data_b",
//         text: "人数"
//     },
//     {
//         path: "c",
//         attr: [{
//             key: "d",
//             name: "d",
//             text: "其他"
//         }]
//     }]
// }]
//};
//ExportTepmlate(demoRequestData, demoRule, false);
