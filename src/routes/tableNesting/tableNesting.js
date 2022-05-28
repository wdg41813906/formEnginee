import React from 'react'
import {
    Table, Badge, Menu, Dropdown, Icon,
} from 'antd';
import { connect } from 'dva';

import Item from 'antd/lib/list/Item';
import { height } from 'window-size';


class TableQianTao extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}

    }
    componentDidMount() {
        // this.props.dispatch({
        //     type: 'tableNesting/getLinkFormList',
        //     payload: {
        //         PageIndex: 1,
        //         PageSize: 100,
        //     }
        // })
    }

    render(record) {
        return <Table
        style={{width:'100%',height:'100%',overflow:'auto'}}
            className="components-table-demo-nested"
            columns={this.props.tableNesting.columns}
            expandRowByClick={true}
            rowClassName={() => "测试"}
            expandedRowRender={record => {
                let columnsitem = [];
                record.data[0] ? Object.keys(record.data[0]).forEach(function (key) {
                    columnsitem.push({ title: key, dataIndex: key, key: key })


                }) : [];
                //code something


                return (<Table
                    style={{width:'100%',height:'100%'}}
                    columns={

                        columnsitem
                    }

                    dataSource={record.data}
                    bordered={true}
                    pagination={false}
                />)
            }}
            dataSource={this.props.tableNesting.data}
        />

    }

}



function mapStateToProps(state) {
    return {
        tableNesting: state.tableNesting
    }
}

export default connect(mapStateToProps)(TableQianTao);
