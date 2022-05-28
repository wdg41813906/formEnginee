import React from 'react'
import { Checkbox, Card, InputNumber } from 'antd';


class DataPermission extends React.Component {
    render() {
        return (
            <div style={{ padding: '0 5px' }}>
                <Checkbox.Group style={{ width: '100%' }} onChange={this.props.onChangeCheck} value={this.props.DataPermission}>
                    <Card title="操作权限" size="small" style={{ background: '#F4F6F9' }}>
                        <Checkbox value="0" /> 可导出数据
                    </Card>
                    <Card title="数据显示" size="small" style={{ background: '#F4F6F9' }}>
                        <Checkbox value="2" /> 显示序号
                        <br />
                        <Checkbox value="1" /> 显示前 <InputNumber max={999999999999}
                            disabled={!this.props.DataPermission.find(n => n == 1)}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            style={{ width: '90px' }}
                            value={this.props.DataPermission.find(n => n == 1) === undefined ? 0 : this.props.ShowCount}
                            onChange={this.props.NumberonChange} /> 条数据
                    </Card>
                    <Card title="维度冻结" size="small" style={{ background: '#F4F6F9' }}>
                        <Checkbox value="3" /> 冻结行维度
                        <br />
                        <Checkbox value="4" /> 冻结列维度
                    </Card>
                    <Card title="图表联动设置" size="small" style={{ background: '#F4F6F9' }}>
                        <p style={{ marginBottom: '40px', color: '#989898', paddingLeft: '12px' }}>没有可以联动的图表</p>
                    </Card>
                </Checkbox.Group>
            </div>
        )
    }
}


export default DataPermission
