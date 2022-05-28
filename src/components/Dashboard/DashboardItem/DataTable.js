import React from 'react'
import {Table, Icon, Divider, Tag} from 'antd';
import _ from 'underscore'

import DashboardHOC from './DashboardHOC'
import BaseItem from './BaseItem'
import './DataTable.less'


//替换key值方法写入原型链
Array.prototype.changekey = function () {
    this.forEach(item => {
        if (item.key) {
            item.key = Guid()
        }
        if (item.children) {
            item.children.changekey()
        }
    })
};
Array.prototype.ObjSet = function (arr) {
    let unique = {};
    arr.forEach((item) => {
        unique[JSON.stringify(item)] = item;//键名不会重复
        if (item.children) {
            item.children.ObjSet(item.children)
        }
    })
    arr = Object.keys(unique).map(function (u) {
        return JSON.parse(u);
    })
    return arr;
}

/**
 * @return {string}
 */
function Guid() {
    /**
     * @return {string}
     */
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}


@DashboardHOC()
class DataTable extends React.Component {
    state = {
        pagination: {
            current: 1,
            pageSize: 10,
        }
    };


    handleChange = (pagination) => {
        this.setState({
            pagination
        });
    }

    render() {
        const {item, chartConfig, DragSource, DragItem} = this.props;
        const codeData = DragSource ? DragSource.fields : '';
        let Xopt=[], Yopt=[], Yyopt=[]//指标  维度(行)  维度(列)
        DragItem.map(item => {
            if (item.ContainerId === 'indicators') {
                Xopt.push(item)
            }
            if (item.ContainerId === 'dimensionX') {
                Yopt.push(item)
            }
            if (item.ContainerId === 'dimensionY') {
                Yyopt.push(item)
            }
        })


        let data = item.ChartsData
        let IndexCode = Yopt.length > 0 ? Yopt[0].Code : null//以维度(行)第一个字段为排序依据
        data.map((_item, index) => {
            _item['key'] = index//添加数据源 key
            if (item.DataPermission.find(n => n == 2) !== undefined) {
                _item['numberKey'] = index + 1
            }
        })


        let map = {};
        let dest = [];
        for (let i = 0; i < data.length; i++) {
            let ai = data[i];
            if (!map[ai[IndexCode]]) {
                dest.push({
                    initial: ai[IndexCode],
                    busInfoList: [ai]
                });
                map[ai[IndexCode]] = ai;
            } else {
                for (let j = 0; j < dest.length; j++) {
                    let dj = dest[j];
                    if (dj.initial === ai[IndexCode]) {
                        dj.busInfoList.push(ai);
                        break;
                    }
                }
            }
        }


        //数据源排序 合并单元格
        var dataSource = []
        var columns = []
        dest.map(_item => {
            dataSource = dataSource.concat(_item.busInfoList)
        })

        // if (item.DataPermission && item.ShowCount) {
        //     if (item.DataPermission.find(n => n == 1) !== undefined && item.ShowCount > 0) {
        //         dataSource = dataSource.slice(0, item.ShowCount)
        //     }
        // }

        if (Yyopt.length === 0) {
            Yopt.concat(Xopt).map(_item => {
                columns.push({
                    title: _item.NewName ? _item.NewName : _item.Name,
                    dataIndex: _item.ContainerId === "indicators" ? `${_item.Code}_Measures` : _item.Code,
                    key: _item.ContainerId === "indicators" ? `${_item.Code}_Measures0` : _item.Code,
                    width: 120,
                    render: (val, row, index) => {
                        const {current, pageSize} = this.state.pagination;
                        const obj = {
                            children: val,
                            props: {},
                        };
                        if (_item.Code === IndexCode) {
                            let sameRowCount = 1;
                            let totalIndex = pageSize * current;
                            totalIndex = totalIndex > dataSource.length ? dataSource.length : totalIndex;
                            const fullIndex = pageSize * (current - 1) + index;

                            if (index !== 0 && dataSource[fullIndex - 1][IndexCode] === dataSource[fullIndex][IndexCode]) {
                                sameRowCount = 0;
                            } else {
                                for (let i = fullIndex + 1; i < totalIndex; i++) {
                                    if (dataSource[i][IndexCode] === dataSource[fullIndex][IndexCode]) {
                                        sameRowCount++;
                                    } else {
                                        break;
                                    }
                                }
                            }
                            obj.props.rowSpan = sameRowCount;
                        }
                        return obj;
                    }
                })
            })


            let dataSum = JSON.parse(JSON.stringify(dataSource))[dataSource.length - 1]
            dataSum['key'] = 'dataSum'
            let dataSumKey = Object.keys(dataSum)
            Yopt.concat(Yyopt).map(__item => {
                dataSumKey.map(t => {
                    if (__item.Code === t) {
                        dataSum[t] = '-'
                    }
                })

            })
            dataSum[IndexCode] = '汇总'
            Xopt.map(__item => {
                dataSumKey.map(t => {
                    if (`${__item.Code}_Measures` === t) {
                        dataSum[t] = 0
                        dataSource.map(e => {
                            dataSum[t] += Number(e[t])
                        })
                    }
                })
            })
            delete dataSum['numberKey']
            dataSource.push(dataSum)
            if (item.DataPermission.find(n => n == 2) !== undefined) {//显示序号
                columns.unshift({
                    title: "序号",
                    dataIndex: "numberKey",
                    key: "numberKey",
                    width: 50
                })
            }

        } else {
            //维度(列) 不为空时
            let DY = []
            Yyopt.map(__item => {
                let DY1 = []
                dataSource.map(_item => {
                    if (_item[__item.Code] !== '-') {
                        DY1.push(_item[__item.Code])
                    }
                })
                //去重 (去重规则为剔除相同字段,不能保证数据能全部渲染)
                // const res = new Map();
                // DY1 = DY1.filter((a) => !res.has(a) && res.set(a, 1))
                DY.push(DY1)
            })
            let a = []
            // let b = []
            // Xopt.forEach((_item, index) => {
            //     b.push({
            //         title: _item.NewName ? _item.NewName : _item.Name,
            //         dataIndex: `${_item.Code}_Measures`,//此处修改
            //         key: `${_item.Code}_Measures`,
            //     })
            // })
            var cl = DY[0].length;
            for (let j = cl - 1; j >= 0; j--) {
                var fobj = {};
                for (let i = DY.length - 1; i >= 0; i--) {
                    if (i !== DY.length - 1) {
                        fobj = {
                            title: DY[i][j],
                            children: [fobj]
                        }
                    } else {
                        let b = []
                        Xopt.forEach(_item => {
                            b.push({
                                title: _item.NewName ? _item.NewName : _item.Name,
                                dataIndex: `${_item.Code}_Measures${j}`,//此处修改
                                key: `${_item.Code}_Measures${j}`,
                                width: item.DataPermission.find(n => n == 4) !== undefined ? 120 : ''
                            })

                        })
                        fobj = {
                            title: DY[i][j],
                            children: b
                        }
                    }
                }
                a.unshift(fobj)

            }
            // a = a.ObjSet(a)
            // console.log(a)
            // console.log((item.DataPermission.find(n => n == 4) !== undefined && item.DataPermission.find(n => n == 4) !== undefined))
            let c = []
            Yopt.map(_item => {
                c.push({
                    title: _item.NewName ? _item.NewName : _item.Name,
                    dataIndex: _item.Code,
                    key: `${_item.Code}`,
                    width: (item.DataPermission.find(n => n == 4) !== undefined && item.DataPermission.find(n => n == 4) !== undefined) ? 120 : 450 / dataSource.length
                })
            })
            var d = [];
            let fobjb = {};
            for (let i = Yyopt.length - 1; i >= 0; i--) {
                if (i !== Yyopt.length - 1) {
                    fobjb = {
                        title: Yyopt[i].Name,
                        children: [fobjb],
                        fixed: Yopt.length > 0 ? item.DataPermission.find(n => n == 3) !== undefined : false
                    }

                } else {
                    if (c.length === 0) {//此处 当维度(行)为空时 判断数据列表
                        fobjb = {
                            title: Yyopt[i].Name,
                            children: [{
                                title: '-',
                                dataIndex: '-',
                                key: '-',
                            }]
                        }
                    } else {
                        fobjb = {
                            title: Yyopt[i].Name,
                            children: c,
                            fixed: Yopt.length > 0 ? item.DataPermission.find(n => n == 3) !== undefined : false
                        }
                    }

                }
            }
            d.unshift(fobjb)
            if (item.DataPermission.find(n => n == 2) !== undefined) {//显示序号
                d.push({
                    title: "序号",
                    dataIndex: "numberKey",
                    key: "numberKey",
                    width: 50,
                    fixed: item.DataPermission.find(n => n == 3) !== undefined
                })
            }

            columns = d.concat(a)

            dataSource.map((_item, index) => {
                Xopt.map(__item => {
                    _item[`${__item.Code}_Measures${index}`] = _item[`${__item.Code}_Measures`]
                    delete _item[`${__item.Code}_Measures`]
                })
            })

            //剔除维度 指标汇总
            let dataSum = {}
            dataSum['key'] = 'dataSum'
            dataSum[IndexCode] = '汇总'
            dataSource.map((_item, index) => {
                Xopt.map(__item => {
                    dataSum[`${__item.Code}_Measures${index}`] = 0
                    dataSum[`${__item.Code}_Measures${index}`] += _item[`${__item.Code}_Measures${index}`]
                })
            })

            dataSource.push(dataSum)

        }

        // key值替换
        // var allcolumns = JSON.parse(JSON.stringify(columns))
        // if (Yyopt.length === 1) {
        //     allcolumns.map(_item => {
        //         _item['children'].map(__item => {
        //             __item['key'] = Guid()
        //         })
        //     })
        // }
        //
        // if (Yyopt.length > 1) {
        //     for (let i = 0; i < Xopt.length; i++) {
        //         allcolumns.changekey()
        //     }
        // }

        //
        //console.log(JSON.stringify(columns))
        //console.log(JSON.stringify(dataSource))
        // allcolumns = [{
        //     "title": "职位",
        //     "children": [{
        //         "title": "生日",
        //         "children": [{
        //             "title": "姓名",
        //             "dataIndex": "fld201903061014951803124805",
        //             "key": "a7ee6cac-cd04-dd16-fc2a-025539dc54de",
        //             "width": 64.28571428571429
        //         }],
        //         "fixed": false
        //     }],
        //     "fixed": false
        // }, {
        //     "title": "程序员",
        //     "children": [{
        //         "title": "2019年",
        //         "children": [{
        //             "title": "工资",
        //             "dataIndex": "fld20190306101495669613355_Measures0",
        //             "key": "0fb92fd8-168b-c9b9-ee31-29659967c043"
        //         }]
        //     }]
        // }, {
        //     "title": "设计师",
        //     "children": [{
        //         "title": "1987年",
        //         "children": [{
        //             "title": "工资",
        //             "dataIndex": "fld20190306101495669613355_Measures1",
        //             "key": "19cf6c2f-4b79-33f0-4313-5e170953699b"
        //         }]
        //     }]
        // }, {
        //     "title": "运维",
        //     "children": [{
        //         "title": "1994年",
        //         "children": [{
        //             "title": "工资",
        //             "dataIndex": "fld20190306101495669613355_Measures2",
        //             "key": "69355f2a-2fbb-13f5-d1b1-32b38ae66952"
        //         }]
        //     }]
        // }, {
        //     "title": "程序员",
        //     "children": [{
        //         "title": "1990年",
        //         "children": [{
        //             "title": "工资",
        //             "dataIndex": "fld20190306101495669613355_Measures3",
        //             "key": "e2ec18bf-6b89-e309-6099-af2691b4af62"
        //         }]
        //     }]
        // }]
        // dataSource = [{
        //     "fld201903061014951803124805": "Amy",
        //     "fld201903061014951916626566": "程序员",
        //     "fld20190306101495671711127": "2019年",
        //     "fld20190306101495669613355_Measures0": 1,
        //     "key": 0
        // }, {
        //     "fld201903061014951803124805": "Bob",
        //     "fld201903061014951916626566": "程序员",
        //     "fld20190306101495671711127": "2019年",
        //     "fld20190306101495669613355_Measures0": 1200,
        //     "key": 1
        // }, {
        //     "fld201903061014951803124805": "Mike",
        //     "fld201903061014951916626566": "程序员",
        //     "fld20190306101495671711127": "2019年",
        //     "fld20190306101495669613355_Measures0": 100000,
        //     "key": 2
        // }, {
        //     "fld201903061014951803124805": "李四",
        //     "fld201903061014951916626566": "设计师",
        //     "fld20190306101495671711127": "1987年",
        //     "fld20190306101495669613355_Measures1": 13000,
        //     "key": 3
        // }, {
        //     "fld201903061014951803124805": "马云",
        //     "fld201903061014951916626566": "程序员",
        //     "fld20190306101495671711127": "2019年",
        //     "fld20190306101495669613355_Measures0": 100000,
        //     "key": 4
        // }, {
        //     "fld201903061014951803124805": "王五",
        //     "fld201903061014951916626566": "运维",
        //     "fld20190306101495671711127": "1994年",
        //     "fld20190306101495669613355_Measures2": 5000,
        //     "key": 5
        // }, {
        //     "fld201903061014951803124805": "张三",
        //     "fld201903061014951916626566": "程序员",
        //     "fld20190306101495671711127": "1990年",
        //     "fld20190306101495669613355_Measures3": 10000,
        //     "key": 6
        // }, {
        //     "key": "dataSum",
        //     "fld201903061014951803124805": "汇总",
        //     "fld20190306101495669613355_Measures0": null,
        //     "fld20190306101495669613355_Measures1": null,
        //     "fld20190306101495669613355_Measures2": null,
        //     "fld20190306101495669613355_Measures3": null,
        //     "fld20190306101495669613355_Measures4": null,
        //     "fld20190306101495669613355_Measures5": null,
        //     "fld20190306101495669613355_Measures6": null
        // }]
        return (
            <Table className='DataTable' bordered
                   columns={columns} dataSource={dataSource}
                   pagination={this.state.pagination}
                   onChange={this.handleChange}
                   size="small"
                   scroll={{
                       x: item.DataPermission.find(n => n == 3) !== undefined ? 1200 : '',
                       y: item.DataPermission.find(n => n == 4) !== undefined ? 200 : ''
                   }}
            />

        )
    }
}


export default DataTable
