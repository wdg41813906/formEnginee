import React from 'react';
import {DropTarget} from 'react-dnd';
import PropTypes from 'prop-types';
import styles from './form.less'

const dropTarget = {
    canDrop(props, monitor) {
        //console.log(props)
        let item = monitor.getItem();
        //const isOver = monitor.isOver();//{ shallow: true });
        return monitor.isOver() && props.dropCountCheck(item.itemType) && item.isExternal !== true;

    },
    hover(props, monitor) {
        const item = monitor.getItem();
        if (monitor.canDrop()) {
            if (item.hasOwnProperty('itemType') && props.dragIndex === -1) {
                props.add({
                    container: props.container,
                    ...item,
                    isCanCancelMoveFormItem: true//做标记
                });
            }
            //子表单表头自己的拖拽忽略   关联控件拖拽忽略
            if (item.isExternal) {
                return;
            }
            else {
                //浅表面
                const isOver = monitor.isOver({shallow: true});
                if (isOver) {
                    //console.log('fromdroptarget changecontainer');
                    props.changeContainer(item.id, props.container);
                }
            }
        }
    }
};
//表单项放置支持
@DropTarget('FormDrag', dropTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
}))
export default class FormDropTarget extends React.Component {
    static propTypes = {
        connectDropTarget: PropTypes.func.isRequired,
        isOver: PropTypes.bool.isRequired,
        canDrop: PropTypes.bool.isRequired,
    };

    render() {
        const {/*canDrop, isOver,*/ connectDropTarget} = this.props;
        return connectDropTarget(
            <div style={{display: this.props.formLayout != 1 ? 'flex' : ''}} className={styles.DropTarget}>
                {
                    this.props.children.length === 0 ?
                        <img src='https://assets.jiandaoyun.com/v222/resources/images/form_empty.png' alt=""
                             style={{width: '40%', paddingTop: '30px', margin: '0 auto'}}/>
                        : this.props.children
                }
            </div>
        );
    }
}
