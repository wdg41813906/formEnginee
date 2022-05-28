import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";
import   './ReactGridLayout.less'
const ReactGridLayout = WidthProvider(RGL);
import ReportItem from '../DashboardItem/ReportBar'
export default class LedgerIndex1 extends React.PureComponent {
    static defaultProps = {
        className: "layout",
        items: 20,
        rowHeight: 30,
        onLayoutChange: function () { },
        cols: 12
    };

    constructor(props) {
        super(props);

        const layout = this.generateLayout();
        this.state = { layout };
    }



    generateLayout() {
        const p = this.props;
        return _.map(new Array(p.items), function (item, i) {
            const y = _.result(p, "y") || Math.ceil(Math.random() * 4) + 1;
            return {
                x: (i * 8) % 16,
                y: Math.floor(i / 2) * y,
                w: 8,
                h: 4,
                i: i.toString()
            };
        });
    }

    onLayoutChange = (arr) => {
        if (arr.length <= 0) return
          this.setState({
            layout:arr
          })
    }
    refCb = (instance) => {
        if (!instance) return
        this.setState({
            DragactWidth: instance.clientWidth
        })
    }
    render() {
        return (
            <div ref={this.refCb}>
            <ReactGridLayout

                layout={this.state.layout}
                onLayoutChange={ele => this.onLayoutChange(ele)}
                className="layout"
                autoSize={true}
                rowHeight={100}
                cols={16}
                onResizeStop={(ele, item) => {
                
                }}
            >

                {this.state.layout.map(ele => {
                    return (
                        <div key={ele.i}>
                        <ReportBar  DragactWidth={(this.state.DragactWidth/16)*8} {...ele}/>
                    </div>
                    )
                })}
            </ReactGridLayout>
            </div>
        );
    }

}
