import React from 'react';
import {Icon} from 'antd';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import Drag from "./Drag_Drop.less";

const spec = {
    beginDrag(props, monitor) {
        props.StartDrag(true, props.options.controlType)//开始拖拽
        return {
            DragSort: true,
            item: {
                id: props.options.id,
                Name: props.options.name,
                Code: props.options.code,
                PrimaryKey: props.options.primaryKey,
                ControlType: props.options.controlType,
                formType: props.options.formType
            }
        }
    },
    endDrag(props, monitor) {
        props.StartDrag(false)//取消拖拽或拖拽结束
        //if (!monitor.didDrop()) {
        //    props.cancelMove(props.id);
        //}
    }
};

@DragSource('StrDrag', spec, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class StrDrag extends React.Component {
    constructor(props) {
        super(props)
    }

    IconType = (type) => {
        switch (type) {
            case 'DateTime':
                return <Icon style={{color: 'rgb(36, 138, 249)'}} type="pic-center"/>
            case 'Number':
                return <Icon style={{color: 'rgb(36, 138, 249)'}} type="paper-clip"/>
            case 'SingleText':
                return <Icon style={{color: 'rgb(36, 138, 249)'}} type="font-size"/>
        }
    }

    render() {
        const {connectDragSource} = this.props;
        return connectDragSource(
            <div className={Drag.disHover}>
                {
                    this.IconType(this.props.options.controlType)
                }
                <span style={{padding: '0 6px'}}>
                {this.props.options.name}
            </span>
            </div>
        )

    }

}

export default StrDrag
