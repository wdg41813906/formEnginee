import react from 'react';
import {Table, Divider, Tag} from 'antd';
import DashboardHOC from './DashboardHOC'
import {DataFilter, MuchdImension} from "./DataFilter";


@DashboardHOC()
export default class ReportNone extends react.Component {
    constructor(props) {
        super(props)
        this.state = {
            current: 1
        }
    }

    changePage = (page) => {
        this.setState({
            current: page,
        })
    }

    render() {
        const {item, chartConfig, DragSource, DragItem} = this.props;
        const codeData = DragSource ? DragSource.fields : '';
        let Yopt = []
        let Xopt = []
        let FilterData = []
        let dimensionAry = []
        let dimensionXData = []
        if (item.ChartsData && item.ChartsData.length > 0) {
            let DataFil = DataFilter(item.ChartsData, codeData, DragItem)
            FilterData = DataFil.data
            Xopt = DataFil.Xopt
            Yopt = DataFil.Yopt
            dimensionAry = DataFil.dimensionAry
        }
        if (FilterData.length > 0 && dimensionAry.length === 2) {
            let MuchI = MuchdImension(FilterData, DragItem)
            FilterData = MuchI.data
            Xopt = MuchI.Xopt
            Yopt = MuchI.Yopt
            dimensionXData = DragItem.filter(item => {
                return item.ContainerId === 'dimensionX'
            })
        }
        let contentcount = 0
        let data = []
        FilterData.map((t, i) => {
            contentcount += Number(t[Xopt])
            data.push({
                key: i,
                count: t[Yopt],
                content: t[Xopt],
            })
        })

        const columns = [{
            title: '总计',
            dataIndex: 'count',
            key: 'count',
        }, {
            title: contentcount ? contentcount : "0",
            dataIndex: 'content',
            key: 'content',
        }];

        return (
            <div>
                <div>
                    <Table columns={columns} dataSource={data} pagination={{
                        current: this.state.current,
                        total: FilterData.length,
                        pageSize: 3,
                        onChange: this.changePage,
                    }}/>
                </div>
            </div>
        )
    }
}
