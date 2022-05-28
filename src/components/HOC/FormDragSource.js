import React from 'react';
import { DragSource } from 'react-dnd';
import { Icon } from 'antd';
import styles from './form.less';
import com from '../../utils/com';

const formDragType = 'FormDrag';
const spec = {
    beginDrag(props) {
        if (props.id === undefined) {
            return {
                itemType: props.itemType,
                valueType: props.valueType,
                id: com.Guid(),
            }
        }
        else {
            props.beginDrag(props.id, props.container);
            return {
                id: props.id,
                itemType: props.itemType,
                valueType: props.valueType,
                container: props.container,
                isExternal: props.isExternal,
                groupId: props.itemBase ? props.itemBase.get('groupId') : null,
                mode: props.mode
            }
        }
    },
    endDrag(props, monitor) {
        if (!monitor.didDrop()) {
            props.isCanCancelMoveFormItem && props.cancelMove({ id: props.id, isCanCancelMoveFormItem: false });
            // props.isCanCancelMoveFormItem && props.isCanCancelMoveFormItem(false);//做标记
        }
        props.endDrag({ id: monitor.getItem().id });
    }
};
function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

//表单控件拖拽支持
function FormDragSource(nm, ico) {
    return function (Component) {
        const DS = ({ isDragging, connectDragSource, dragging, select, isborder, ...other }) => {
            const opacity = isDragging || dragging ? 0.3 : 1;
            const handleClick = (e) => {
                other.setCurrent(other.id);
                e.stopPropagation();
            }
            const handleAdd = (e) => {
                other.addSimple({ itemType: other.itemType });
                e.stopPropagation();
            }
            if (Component)
                return connectDragSource(
                    <div className={(other.mode === 'tableHeader' ? styles.SubItem : styles.FormItem) + (select ? ' ' + styles.Selected : '')}
                        onClick={handleClick} style={{ opacity: opacity, height: '100%', border: isborder ? '1px solid' + isborder : 'none' }}  >
                        <Component {...other} select={select} />
                    </div>);
            else//左侧状态
                return connectDragSource(<div className={styles.leftFrame} onClick={handleAdd}><div className={styles.leftControl}>
                    <Icon className={styles.leftIcon} type={ico} />{nm}</div></div>);
        }
        return DragSource(formDragType, spec, collect)(DS);
    }
}
export default FormDragSource;