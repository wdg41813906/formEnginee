import React from 'react'
import { DragSource, connectDragPreview, connectDropTarget, DropTarget } from 'react-dnd'
import { Input, Radio, Checkbox, Icon } from 'antd';
import styles from './radio.less'


//dropSource
const boxSource = {
    beginDrag(props, monitor, component) {
        return {
            index: props.index,
        }
    },
    endDrag(props, monitor) {
    },
}
const boxTarget = {
    drop(props, monitor, component) {
    },
    hover(props, monitor, component) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;
        if (dragIndex != hoverIndex) {
            props.onSort(dragIndex, hoverIndex)
        }
    },
    canDrop(props, monitor, component) {
    },
}
const collectSource = (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
})
const collectTarget = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
})


@DragSource(
    'box',
    boxSource,
    collectSource
)
@DropTarget(
    'box',
    boxTarget,
    collectTarget
)
export default class DragSourceWeddingRadioGroup extends React.Component {
    render() {
        const { type, isDragging, connectDragSource, connectDragPreview, connectDropTarget ,changeOption} = this.props
        return connectDragPreview(
            connectDropTarget(
                <div className={`${styles.source} ${isDragging ? styles.isDragging : ''}`} >
                    {
                        type == 'SingleRadio' || type == "SingleDropDownList" ?//单选
                            <Radio onClick={(e)=> changeOption(e)} value={this.props.index.toString()} ></Radio>
                            ://多选
                            <Checkbox style={{ marginRight: 8 }} value={this.props.index.toString()} ></Checkbox>
                    }
                    <Input
                        style={{ width: '65%' }}
                        data-index={this.props.index.toString()}
                        disabled={this.props.p == '其他' ? true : false}
                        value={this.props.p}
                        defaultValue={this.props.p}
                        onChange={this.props.onChange}
                    />
                    <Icon
                        type="minus-circle-o"
                        value={this.props.index}
                        onClick={() => { this.props.deleteItem(this.props.index) }}
                        style={{ marginLeft: "5px", fontSize: 16, color: 'red', cursor: 'pointer' }}
                    />
                    {
                        connectDragSource(
                            <div><Icon type="drag" style={{ marginLeft: "5px", fontSize: 16, color: 'red', cursor: 'n-resize' }} /></div>
                        )
                    }
                </div>
            )
        )
    }
}


