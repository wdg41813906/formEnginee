
(function () {
    var root = this;
    var d = function (obj) {
        if (obj instanceof d) return obj;
        if (!(this instanceof d)) return new d(obj);
    };
    if (typeof define === 'function' && define.amd) {
        define('DReport', [], function () {
            return d;
        });
    }
    d.load = function (source, config, id) {
        config.dataSource = d.ExportTepmlate(source, config.rule);
        config.colList = d.ExportRuleCol(config.rule);
        config.group = _.filter(config.colList, function (item) { return item.key == config.groupKey })[0];//分组字段
        if (!(config.showList instanceof Array))
            config.showList = _.filter(config.colList, function (item) { return item.key != config.groupKey });//显示字段
        d.SourceList[config.sourceId] = config;
        let options = d.InitChartOption(config);
        let chart = echarts.init(document.getElementById(id));
        chart.setOption(options);
        d.ChartList.push({ chart: chart, config: config });
        window.onresize = function () {
            for (let i = 0, j = d.ChartList.length; i < j; i++) {
                d.ChartList[i].chart.resize();
            }
        }
    }
    //数据格式
    d.formaterList = [{ value: 0, name: '默认' }, { value: 1, name: '数字' }, { value: 2, name: '货币' }, { value: 3, name: '日期' }, { value: 4, name: '百分比' }];
    d.SourceList = {};//数据源集合
    d.ChartList = [];//报表实例/对应配置集合
    ///根据抽取规则导出数据源
    d.ExportTepmlate = function (json, rule, useFormater) {
        if (json instanceof Array) {
            let data = [];
            json.forEach(function (j) {
                let ldata = d.ExportObjData(j, rule, useFormater);
                if (ldata instanceof Array)
                    data.push(...ldata);
                else
                    data.push(ldata);
            });
            return data;
        }
        else if (json instanceof Object) {
            return d.ExportObjData(json, rule, useFormater);
        }
    }
    function formatData(data, formater, formaterValue) {
        switch (formater) {
            default:
            case 0://default
                return data;
            case 1://number
                return (parseFloat(data)).toFixed(formaterValue);
            case 2://money
                return Money(data, formaterValue);
            case 3://date
                return (new Date(data)).Format(formaterValue);
            case 4://percent
                return (parseFloat(data) * (parseFloat(formaterValue.times))).toFixed(formaterValue.fixed) + '%';

        }
    };
    //根据规则导出相应的数据
    d.ExportObjData = function (obj, rule, userFormater) {
        let prejson = undefined;
        if (d.IsNullOrEmpty(rule.path))
            eval('prejson=obj.' + rule.path);
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
                                eval('ldata=d.AppendObjs(data,{' + att.key + ':pv})');
                                if (data instanceof Array)
                                    listData.push(...ldata);
                                else
                                    listData.push(ldata);
                            });
                        }
                        else {
                            if (data instanceof Array) {
                                eval('data=d.AppendObjs(data,{' + att.key + ':pj[att.key]}');
                            }
                            else
                                data[att.name] = userFormater == true ? formatData(pj[att.key], att.formater, att.formaterValue) : pj[att.key];
                        }
                    }
                    else if (att.path) {
                        let pdata = d.ExportObjData(pj, att, userFormater);
                        data = d.AppendObjs(data, pdata);

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
                            eval('ldata=d.AppendObjs(data,{' + att.key + ':pv})');
                            if (data instanceof Array)
                                listData.push(...ldata);
                            else
                                listData.push(ldata);
                        });
                        data = listData;
                    }
                    else {
                        if (data instanceof Array) {
                            eval('data=d.AppendObjs(data,{' + att.key + ':prejson[att.key]}');
                        }
                        else
                            data[att.name] = userFormater == true ? formatData(prejson[att.key], att.formater, att.formaterValue) : prejson[att.key];
                    }
                }
                else if (att.path) {
                    let pdata = d.ExportObjData(prejson, att, userFormater);
                    data = d.AppendObjs(data, pdata);
                }
            });
            return data;
        }
    }
    d.IsNullOrEmpty = function (str) {
        if (str != undefined && str.trim() != '' && str != null) {
            return true;
        }
        return false;
    }
    d.AppendObjs = function (obj1, obj2) {
        let list = [];
        if (obj1 instanceof Array) {
            obj1.forEach(function (item1) {
                if (obj2 instanceof Array) {
                    obj2.forEach(function (item2) {
                        list.push(d.AppendObj(item1, item2));
                    });
                }
                else
                    list.push(d.AppendObj(item1, obj2));
            });
        }
        else {
            if (obj2 instanceof Array) {
                obj2.forEach(function (item2) {
                    list.push(d.AppendObj(obj1, item2));
                });
            }
            else
                return d.AppendObj(obj1, obj2);
        }
        return list;
    }
    d.AppendObj = function (obj1, obj2) {
        var obj3 = d.CopyObj(obj1);
        var obj4 = d.CopyObj(obj2);
        var keys = Object.keys(obj4);
        for (let i = 0, j = keys.length; i < j; i++) {
            obj3[keys[i]] = obj4[keys[i]];
        }
        return obj3;
    }
    d.CopyObj = function (obj) {
        var keys = Object.keys(obj);
        var newObj = {};
        for (let i = 0, j = keys.length; i < j; i++) {
            newObj[keys[i]] = obj[keys[i]];
        }
        return newObj;
    }
    ///从数据源导出数据
    d.ExportData = function (source, key) {
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
    d.ExportRuleCol = function (rule) {
        let data = [];
        if (rule.attr instanceof Array) {
            rule.attr.forEach(function (att) {
                if (att.key) {
                    data.push(att);
                }
                else if (att.path) {
                    let pdata = d.ExportRuleCol(att);
                    data.push(...pdata);
                }
            });
        }
        return data;
    }
    ///生成Echats的option
    d.InitChartOption = function (config) {
        let source = config.dataSource;
        let title = config.title;
        let showList = config.showList;
        let group = config.group;
        let types = config.types;
        let seriesTypes = [];
        if (types instanceof Array)
            seriesTypes = types;
        else if (typeof types == "string")
            seriesTypes.push(types)
        else
            seriesTypes.push('line');
        let groupData = _.groupBy(source, group.name);
        let legendData = Object.keys(groupData);
        let xData = _.pluck(showList, 'text');
        let seriesData = [];
        for (let i = 0, j = legendData.length; i < j; i++) {
            let seriesItem = { name: legendData[i].toString(), type: seriesTypes.length - 1 >= i ? seriesTypes[i] : seriesTypes[0], data: [] };
            for (let m = 0, n = showList.length; m < n; m++) {
                let cDatas = d.ExportData(groupData[legendData[i]], showList[m].key);
                seriesItem.data.push(_.reduce(cDatas, function (memo, num) { return memo + num; }, 0));
            }
            seriesData.push(seriesItem);
        }
        let option = {
            title: {
                text: title
            },
            tooltip: {
                trigger: types.indexOf('line') >= 0 ? 'axis' : 'item',//item axis在type为line是效果较好，其他不建议
                //formatter:'{a0}{a1}'
            },
            legend: {
                data: legendData
            },
            xAxis: {
                type: "category",//time,value
                data: xData
            },
            yAxis: {},
            series: seriesData
        };
        return option;
    }
    root.DReport = d;

    function Money(num, length) {
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
}.call(this));