import React from 'react'
import {Card} from 'antd';
import DataTable from './DataPermission/DataTable'
import DataQuota from './DataPermission/Quota'
import DataColumnar from './DataPermission/DataColumnar'


class DataPermission extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        switch (this.props.ChartsType) {
            case 'Table':
                return <DataTable onChangeCheck={this.props.onChangeCheck} NumberonChange={this.props.NumberonChange}
                                  DataPermission={this.props.DataPermission}
                                  ShowCount={this.props.ShowCount}/>
            case 'Quota':
                return <DataQuota onChangeCheck={this.props.onChangeCheck} NumberonChange={this.props.NumberonChange}
                                  DataPermission={this.props.DataPermission}
                                  ShowCount={this.props.ShowCount}/>
            case 'Columnar':
                return <DataColumnar onChangeCheck={this.props.onChangeCheck} NumberonChange={this.props.NumberonChange}
                                     DataPermission={this.props.DataPermission}
                                     ShowCount={this.props.ShowCount}/>
            case 'Bar':
                return <DataColumnar onChangeCheck={this.props.onChangeCheck} NumberonChange={this.props.NumberonChange}
                                     DataPermission={this.props.DataPermission}
                                     ShowCount={this.props.ShowCount}/>
            case 'Shape':
                return <DataColumnar onChangeCheck={this.props.onChangeCheck} NumberonChange={this.props.NumberonChange}
                                     DataPermission={this.props.DataPermission}
                                     ShowCount={this.props.ShowCount}/>
            default:
                return (
                    <Card title="图表联动设置" size="small" style={{background: '#F4F6F9'}}>
                        <p style={{marginBottom: '40px', color: '#989898', paddingLeft: '12px'}}>没有可以联动的图表</p>
                    </Card>
                )
        }
    }
}


export default DataPermission
