import React, { Component } from 'react';
import { Select } from 'antd';
import Attribute from './Attribute.js'

const styles = {
    area: {
        display: "flex",
        alignItems: "center",
        marginBottom: "10px"
    },
    areaName: {
        width: "30%",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        overflow: "hidden"
    },
    areaContent: {
        width: "70%"
    }
}
// 如果是子表 需要 用到的 字段 汇总方式 属性
@Attribute("子表单分页", false)
class Pagination extends Component {
    render() {
        const options = [
            { name: "100条/每页", value: 100 },
            { name: "300条/每页", value: 300 },
            { name: "500条/每页", value: 500 },
            { name: "1000条/每页", value: 1000 },
        ]
        const { pageSize } = this.props;
        return (
            <div>
                <div style={styles.area}>
                    <div style={styles.areaName}>分页条数:</div>
                    <Select getPopupContainer={() => document.getElementById('KJSX')} style={styles.areaContent} value={pageSize} onChange={(e) => { this.props.onChange({ pageSize: e, pageIndex: 1 }); }}>
                        {
                            options.map(item => (
                                <Select.Option key={item["value"]} value={item["value"]}>{item["name"]}</Select.Option>
                            ))
                        }
                    </Select>
                </div>
            </div>
        );
    }
}
export default Pagination;