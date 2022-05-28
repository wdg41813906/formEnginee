import React from "react";
import _ from "lodash";
import { is } from 'immutable';
import RGL, { WidthProvider } from "react-grid-layout";
import Card from './Card'
import './ReactGridLayout.less'
import BaseImmutableComponent from '../../BaseImmutableComponent'
const ReactGridLayout = WidthProvider(RGL);
import ReportBar from '../DashboardItem/ReportBar'
import styles from './LedgerCompon.less'

const { Map } = require('immutable')

var ddddd;
export default class LedgerCompon extends React.Component {


    constructor(props) {
        super(props);

        //const layout = this.generateLayout();
        //this.state = { layout };
     // this.props.Init();

    }
    componentDidMount(){
     //   this.props.Init();
    }
    componentWillUnmount(){


    }
    shouldComponentUpdate(nextProps, nextState) {

        const thisProps = this.props || {};
        const thisState = this.state || {};
        nextState = nextState || {};
        nextProps = nextProps || {};

        if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
            Object.keys(thisState).length !== Object.keys(nextState).length) {
            return true;
        }

        for (const key in nextProps) {
            if (!is(thisProps[key], nextProps[key])) {
                return true;
            }
        }

        for (const key in nextState) {
            if (!is(thisState[key], nextState[key])) {
                return true;
            }
        }
        return false;
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
            layout: arr
        })
    }
    refCb=(instance) =>{

        if (!instance) return
       // debugger
        // this.setState({
        //     DragactWidth: instance.clientWidth
        // })

      this.props.RefInit(instance.clientWidth)
    }
    render() {

        const { ledgerData } = this.props;
        var newData = []
        ledgerData.forEach(ele => {

            var item = ele.toJS();
            newData.push(item);
        })
        return (
            <div

            className='resize-element'
            id='LedgerComponDiv'
                ref={this.refCb}
            >

                <ReactGridLayout

                    isDraggable={ !this.props.isPreview}
                    isResizable={!this.props.isPreview}
                    layout={newData}
                    //  onLayoutChange={data => this.props.OnLayoutChange(data)}
                    className="layout"
                    autoSize={true}
                    rowHeight={40}
                    margin={[5, 5]}
                    cols={16}
                    onResizeStop={(layout, oldLayoutItem, layoutItem, placeholder) => {
                        this.props.OnResizeStop(layoutItem)
                    }}
                    onDragStop={
                        (layout, oldLayoutItem, layoutItem, placeholder) => {

                            this.props.OnResizeStop(layoutItem)
                        }

                    }
                >

                    {newData.map(item => {

                        return (
                            <div key={item.i}>
                                <Card item={item} props={this.props} />


                            </div>

                        )
                    })}


                </ReactGridLayout>
          {
              newData.length<=0&&  <div className={styles.dasImgWrap}></div>
          }

            </div>

        );
    }

}
