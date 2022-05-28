import React from 'react';
import { DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import { Icon, Popconfirm } from 'antd';
import styles from './form.less';
import FormControlType from '../../enums/FormControlType';

const dropTarget = {
    canDrop(props, monitor) {
        const item = monitor.getItem();
        if (item.isExternal === true) {
            return item.container === props.id || item.container === props.container;
        }
        if (item.id === props.id) {
            return true;
        }
        switch (props.formControlType) {
            case FormControlType.Container:
                return props.dropItemCheck(item.itemType, props.itemType) && props.dropCountCheck(item.itemType) && monitor.isOver({ shallow: true });
            case FormControlType.External:
                return false;
            default:
                return true;
        }
    },
    hover(props, monitor, component) {
        if (!monitor.isOver({ shallow: true }))
            return;
        const item = monitor.getItem();
        if (item.isExternal) {
            //console.log(1);
            if (item.container === props.container)
                moveFormItem(item, props.id, FormControlType.Item, null, props.move);
            return;
        }
        if (props.isExternal) {
            //console.log(2);
            moveFormItem(item, props.id, FormControlType.Item, null, props.move);
            return;
        }
        //如果是容器无法接受的valueType，则直接移动控件
        if (props.dropItemValueTypes && props.dropItemValueTypes.indexOf(item.valueType) < 0) {
            //console.log(3);
            moveFormItem(item, props.id, FormControlType.Item, null, props.move);
            return;
        }
        if (props.id !== item.id) {
            const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();//下面组件
            const clientOffset = monitor.getClientOffset();//拖拽组件
            if (component.props.itemType === 'SubForm') {
                //实现子表单自动滚动
                if (clientOffset.x - hoverBoundingRect.left < 99) {
                    let table = document.getElementById(component.props.id);
                    table.querySelector('.ant-table-body').scrollLeft -= 10;
                }
                else if (hoverBoundingRect.width - clientOffset.x < 110) {
                    let table = document.getElementById(component.props.id);
                    table.querySelector('.ant-table-body').scrollLeft += 10;
                }
            }
            // console.log(clientOffset.y,hoverBoundingRect.top,hoverClientY)
            //如果是容器类控件，侦测鼠标和容器边界的距离关系 来判断是上移，下移，放入
            if (props.formControlType == FormControlType.Container || props.formControlType == FormControlType.External) {
                if (props.mode === 'form') {
                    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
                    if (hoverClientY <= 25) {
                        //console.log(4);
                        if (props.formControlType == FormControlType.Container && monitor.canDrop()) {
                            props.changeContainer(item.id, props.container);
                        }
                        moveFormItem(item, props.id, FormControlType.Container, 'top', props.move);

                    }
                    else if (hoverClientY >= (hoverBoundingRect.height - 25)) {
                        if (props.formControlType == FormControlType.Container && monitor.canDrop()) {
                            props.changeContainer(item.id, props.container);
                        }
                        //console.log(5);
                        moveFormItem(item, props.id, FormControlType.Container, "bottom", props.move);
                    }
                    else if (props.formControlType === FormControlType.Container) {
                        //console.log(14);
                        const isOver = monitor.isOver({ shallow: true });
                        if ((isOver || props.proxy) && monitor.canDrop() && props.container !== item.id) {
                            //console.log(15);
                            props.changeContainer(item.id, props.id);
                        }
                    }
                }
                else {
                    const hoverClientX = clientOffset.x - hoverBoundingRect.left;
                    //console.log(props, item, hoverBoundingRect, hoverClientX);
                    // console.log(hoverClientX, props, item);
                    if (hoverClientX <= 25 && props.leftCheck === true) {
                        //console.log('left')
                        props.changeContainer(item.id, props.container, props.groupId);
                        moveFormItem(item, props.id, FormControlType.Container, 'top', props.move);
                    }
                    else if (hoverClientX >= (hoverBoundingRect.width - 25) && props.rightCheck === true) {
                        //console.log('right');
                        props.changeContainer(item.id, props.container, props.groupId);
                        moveFormItem(item, props.id, FormControlType.Container, "bottom", props.move);
                    }
                    else if (props.formControlType === FormControlType.Container) {
                        const isOver2 = monitor.isOver({ shallow: true });
                        //console.log('hovercheck', isOver2, monitor.canDrop(), props, item);
                        if ((isOver2 || props.proxy) && monitor.canDrop() && (props.id !== item.container || props.groupId)) {
                            //console.log('center');
                            props.changeContainer(item.id, props.id, props.groupId);
                        }
                    }
                }
            }
            else {
                // 如果容器不同，changeContainer,再移动
                if (monitor.canDrop()) {
                    //console.log(7);
                    props.changeContainer(item.id, props.container);
                }
                //console.log(6)
                if (item.id !== props.container)
                    moveFormItem(item, props.id, FormControlType.Item, null, props.move);
            }
        }
    }
};

function moveFormItem(item, hoverIndex, formControlType, direction, move) {
    //console.log('moveFormItem');
    if (item.hasOwnProperty("name")) {
        if (hoverIndex !== item.id) {
            move({
                to: hoverIndex,
                frm: -1,
                formControlType,
                direction
            });
        }
    }
    else if (item.hasOwnProperty("id")) {
        if (hoverIndex !== item.id) {
            move({
                to: hoverIndex,
                frm: item.id,
                formControlType,
                direction
            });
        }
    }
}

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
}

//表单项拖拽排序支持
function FormSortDrop(Component, options = {}) {
    return DropTarget("FormDrag", dropTarget, collect)(
        class extends React.Component {
            constructor(props) {
                super(props);
                this.state = {
                    onKey: false
                };
                this.remove = this.remove.bind(this);
                this.copy = this.copy.bind(this);
                this.delmotal = this.delmotal.bind(this);
                this.onCancel = this.onCancel.bind(this);
                this.onVisible = this.onVisible.bind(this);
            }

            componentDidMount() {
                document.addEventListener("keydown", this.onKeyDown);
            }

            componentWillUnmount() {
                document.removeEventListener("keydown", this.onKeyDown);
            }

            remove() {
                this.onCancel();
                this.props.remove(this.props.id);
            }

            copy(e) {
                this.props.copy(this.props.id, this.props.itemType);
                e.stopPropagation();
            }

            delmotal(e) {
                this.setState({
                    onKey: true
                });
                e.stopPropagation();
            }

            onVisible() {
                this.setState({
                    onKey: !this.state.onKey
                });
            }

            onCancel() {
                this.setState({
                    onKey: false
                });
            }

            onKeyDown = (e) => {
                if (this.state.onKey) {
                    switch (e.keyCode) {
                        case 13:
                            this.remove();
                            break;
                        default:
                            console.log("键盘错误");
                    }
                }

            };

            render() {
                const { canDrop, isOver, connectDropTarget, ...other } = this.props;
                return connectDropTarget(
                    <div className={styles.SortDrop}>
                        <Component {...other} />
                        {other.select ?
                            <div className={other.mode === "tableHeader" ? styles.subToolBar : styles.toolBar}>
                                {this.props.isExternal || options.canCopy === false ?
                                    null :
                                    <div title="复制" className={styles.toolItem} onClick={this.copy}>
                                        <Icon style={{ color: "#108ee9" }} type="copyright" />
                                    </div>}
                                {
                                    options.canDelete === false ?
                                        null :
                                        <Popconfirm title='确定要删吗?' onVisibleChange={this.onVisible} onKeyDown
                                            onCancel={this.onCancel} onConfirm={this.remove}>
                                            <div title="删除" className={styles.toolItem} onClick={this.delmotal}>
                                                <Icon style={{ color: "#d84636" }} type="delete" />
                                            </div>
                                        </Popconfirm>
                                }
                            </div> :
                            null}
                    </div>
                );
            }
        });
}

export default FormSortDrop;
