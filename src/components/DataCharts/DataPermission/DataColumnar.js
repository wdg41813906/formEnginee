import React from 'react'
import {Checkbox, Card, InputNumber, Select} from 'antd';


class DataPermission extends React.Component {

    render() {

        return (
            <div style={{padding: '0 5px'}}>
                <Checkbox.Group style={{width: '100%'}} onChange={this.props.onChangeCheck}
                                value={this.props.DataPermission}>
                    <Card title="数据显示" size="small" style={{background: '#F4F6F9'}}>
                        <Checkbox value="1"/>显示前 <InputNumber max={999999999999}
                        disabled={!this.props.DataPermission.find(n => n == 1)}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        style={{width: '90px'}}
                        value={this.props.DataPermission.find(n => n == 1)===undefined ? 0 : this.props.ShowCount}
                        onChange={this.props.NumberonChange}/> 条数据
                    </Card>
                </Checkbox.Group>
            </div>
        )
    }
}


export default DataPermission
