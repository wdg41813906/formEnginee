import React from 'react';
import {findDOMNode} from 'react-dom'
import PropTypes from 'prop-types';
import {Menu, Dropdown, Icon, Tooltip, Input, InputNumber, Button} from 'antd';
import Drop from './Drag_Drop.less';
import {DragSource, DropTarget} from 'react-dnd';

const SubMenu = Menu.SubMenu
const specSource = {
    beginDrag(props, monitor) {

        return {
            ChangeSort: true,
            item: props.item
        }
    },
    endDrag(props, monitor) {
        //props.TipBorderFun()//拖拽完之后 删除提醒
    }
}
const specTarget = {
    drop(props, monitor, component) {
        if (!component) return
        if (monitor.getItem().ChangeSort) {
            let dragId = monitor.getItem().item.DragItemId;
            let hoverId = props.item.DragItemId;
            if (dragId === hoverId) {
                return
            } else {
                props.ExchangeSort(monitor.getItem().item, props.item)
            }

        }
    },
    hover(props, monitor, component) {
        if (!component) return
        let dragId = monitor.getItem().item.id;
        let hoverId = props.item.DragItemId;
        if (dragId === hoverId) {
            return
        } else {
            props.CrossDragSort(props.item)
        }


    },
    canDrop(props, monitor) {
        return true
    }
}

class EditName extends React.Component {
    constructor() {
        super()
        this.state = {
            onChangeValue: null
        }
    }

    onChangeValue = (e) => {
        this.setState({
            onChangeValue: e.target.value
        })
    }

    render() {
        return (
            <div
                style={{
                    zIndex: '1002',
                    marginTop: '6px',
                    position: 'absolute',
                    width: '230px',
                    height: '100px',
                    padding: '12px',
                    background: '#fff',
                    borderRadius: '7px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}>
                <Input defaultValue={this.props.Name} onChange={this.onChangeValue}/>
                <div style={{padding: '12px 0', display: 'flex', justifyContent: 'space-between'}}>
                    <Button style={{width: '90px'}} onClick={this.props.handCancel}>取消</Button>
                    <Button type="primary" onClick={() => {
                        this.props.handOk(this.state.onChangeValue)
                    }}
                            style={{width: '90px'}}>确定</Button>
                </div>
            </div>
        )
    }
}

@DragSource('StrDrag', specSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))

@DropTarget('StrDrag', specTarget, (connect) => ({
    connectDropTarget: connect.dropTarget(),
}))

class DragItemStr extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ShowEditName: false
        }
    }

    OnHandOk = (id, NewName) => {
        this.props.OnHandOk(id, NewName)
        this.props.OnEditName(id)
    }

    Meunoption = (item, props) => {
        if (item && props) {
            if (item.Filter) {
                return (
                    <Menu onClick={props.handleClick}>
                        <Menu.Item>
                            <a onClick={() => props.setFilterVisible(item, null, true)}>修改筛选条件</a>
                        </Menu.Item>
                        <Menu.Item>
                            <a onClick={(Did) => props.DeleteChild({
                                ContainerId: item.ContainerId,
                                DragItemId: item.DragItemId
                            })}>删除筛选条件</a>
                        </Menu.Item>
                    </Menu>
                )
            } else {
                if (item.ContainerId === 'dimensionX' || item.ContainerId === 'dimensionY') {//维度
                    if (item.ControlType === 'SingleText' || item.ControlType === 'DateTime') {
                        return (
                            <Menu onClick={(e) => props.handleClick(e, {
                                ContainerId: item.ContainerId,
                                DragItemId: item.DragItemId
                            })} selectedKeys={item.CheckKey}>
                                <Menu.Item>
                                    <a onClick={(id) => props.OnEditName({
                                        ContainerId: item.ContainerId,
                                        DragItemId: item.DragItemId
                                    })}>修改显示名</a>
                                </Menu.Item>
                                {
                                    item.ControlType === 'DateTime' ? <SubMenu title="汇总方式">
                                        <Menu.Item key="2" type="SumMode" value="sum"
                                                   style={{color: "#000"}}>年</Menu.Item>
                                        <Menu.Item key="3" type="SumMode" value="avg"
                                                   style={{color: "#000"}}>年-季</Menu.Item>
                                        <Menu.Item key="4" type="SumMode" value="max"
                                                   style={{color: "#000"}}>年-月</Menu.Item>
                                        <Menu.Item key="5" type="SumMode" value="min"
                                                   style={{color: "#000"}}>年-周</Menu.Item>
                                        <Menu.Item key="6" type="SumMode" value="count"
                                                   style={{color: "#000"}}>年-月-日</Menu.Item>
                                    </SubMenu> : null
                                }
                                <SubMenu title="排序">
                                    <Menu.Item key="11" type="Sort" value="默认"
                                               style={{color: "#000"}}>默认</Menu.Item>
                                    <Menu.Item key="12" type="Sort" value="升序"
                                               style={{color: "#000"}}>升序</Menu.Item>
                                    <Menu.Item key="13" type="Sort" value="降序"
                                               style={{color: "#000"}}>降序</Menu.Item>
                                </SubMenu>
                                <Menu.Item>
                                    <a onClick={(Did) => props.DeleteChild({
                                        ContainerId: item.ContainerId,
                                        DragItemId: item.DragItemId
                                    })}>删除字段</a>
                                </Menu.Item>
                            </Menu>
                        )
                    }
                }
                if (item.ContainerId === 'indicators') {//指标
                    //let {DragItem} = props
                    // for (let i = 0; i < DragItem.length; i++) {
                    //     for (let j = 0; j < i; j++) {
                    //         if (DragItem[i].DragItemId === DragItem[j].DragItemId) {
                    //
                    //             console.log(DragItem[i], DragItem[j])
                    //         }
                    //     }
                    // }
                    return (
                        <Menu selectedKeys={item.CheckKey} onClick={(e) => props.handleClick(e, {
                            ContainerId: item.ContainerId,
                            DragItemId: item.DragItemId
                        })}>
                            <Menu.Item key="1" value="修改显示名" style={{color: "#000"}}
                                       onClick={(id) => props.OnEditName({
                                           ContainerId: item.ContainerId,
                                           DragItemId: item.DragItemId
                                       })}>修改显示名</Menu.Item>
                            {
                                item.ControlType === 'Number' ? <SubMenu title="汇总方式">
                                    <Menu.Item key="2" type="SumMode" value="sum"
                                               style={{color: "#000"}}>求和</Menu.Item>
                                    <Menu.Item key="3" type="SumMode" value="avg"
                                               style={{color: "#000"}}>平均值</Menu.Item>
                                    <Menu.Item key="4" type="SumMode" value="max"
                                               style={{color: "#000"}}>最大值</Menu.Item>
                                    <Menu.Item key="5" type="SumMode" value="min"
                                               style={{color: "#000"}}>最小值</Menu.Item>
                                    <Menu.Item key="6" type="SumMode" value="count"
                                               style={{color: "#000"}}>计数</Menu.Item>
                                </SubMenu> : null
                            }

                            <SubMenu title="汇总结果显示">
                                <Menu.Item key="7" type="SumResult" value="显示为实际值"
                                           style={{color: "#000"}}>显示为实际值</Menu.Item>
                                <Menu.Item key="8" type="SumResult" value="显示为占比"
                                           style={{color: "#000"}}>显示为占比</Menu.Item>
                            </SubMenu>
                            <Menu.Item key="9" style={{color: "#000"}}
                                       onClick={(o) => props.showFormatModal(item)}>数据格式</Menu.Item>
                            <SubMenu title="排序">
                                <Menu.Item key="11" type="Sort" value="默认"
                                           style={{color: "#000"}}>默认</Menu.Item>
                                <Menu.Item key="12" type="Sort" value="升序"
                                           style={{color: "#000"}}>升序</Menu.Item>
                                <Menu.Item key="13" type="Sort" value="降序"
                                           style={{color: "#000"}}>降序</Menu.Item>
                            </SubMenu>
                            <Menu.Item key="10" style={{color: "#000"}} onClick={(Did) => props.DeleteChild({
                                ContainerId: item.ContainerId,
                                DragItemId: item.DragItemId
                            })}>删除字段</Menu.Item>
                        </Menu>
                    )

                }
            }
        } else {
            return null
        }
    }

    FilterShow = (item) => {
        let Firstoption = item.Fillist[0].Firstoption;
        let Secondoption = item.Fillist[1].Secondoption;
        let Thirdoption = item.Fillist[2].Thirdoption;
        let Fourthoption = item.Fillist[3].Fourthoption;
        return (
            <span>
                <span style={{paddingLeft: Firstoption ? '4px' : ''}}>{Firstoption}</span>

                <span style={{paddingLeft: Secondoption ? '4px' : ''}}>{Secondoption}</span>

                <span style={{paddingLeft: Thirdoption ? '4px' : ''}}>{Thirdoption}</span>

                <span style={{paddingLeft: Fourthoption ? '4px' : ''}}>{Fourthoption}</span>

            </span>
        )
    }

    SortIcon = (item) => {
        if (item.ContainerId !== 'filterCondition') {
            switch (item.CheckKey[2]) {
                case '11':
                    return null
                case '12':
                    return <Icon type="sort-descending" style={{color: "#fff"}}/>
                case '13':
                    return <Icon type="sort-ascending" style={{color: "#fff"}}/>
            }
        }
    }

    ShowStr = (item, data) => {
        if (item.ControlType === 'DateTime' && (item.ContainerId === "dimensionX" || item.ContainerId === "dimensionY")) {
            return item.CheckKey[0] === '0' ? '(年)' : `(${data.DatestrName[item.CheckKey[0] - 2]})`
        } else {
            if (item.ContainerId === "dimensionX" || item.ContainerId === "dimensionY") {
                return item.CheckKey[0] === '0' ? '' : `(${data.strName[item.CheckKey[0] - 2]})`
            } else {
                return item.CheckKey[0] === '0' ? '(计数)' : `(${data.strName[item.CheckKey[0] - 2]})`
            }

        }
    }

    render() {
        const {connectDragSource, item, connectDropTarget} = this.props
        return (
            <div>
                {
                    connectDragSource(connectDropTarget(
                        <div>
                            {/*{style={{borderLeft: (this.props.DragTarget.DragItemId === item.DragItemId) ? (this.props.TipBorder ? '2px #1890ff solid' : '') : ''}}>}*/}
                            <div className={Drop.DragItems}
                                 style={{background: item.ContainerId === 'dimensionX' || item.ContainerId === 'dimensionY' ? '#0DB3A6' : '#248AF9'}}>
                                <Tooltip placement="top" title={<a style={{color: "#fff"}}>原名：{item.Name}</a>}>
                                    <Dropdown overlay={this.Meunoption(item, this.props)} trigger={['click']}>
                                        <a className="ant-dropdown-link" href="#" style={{color: "#fff"}}>
                                            <Icon type="down" style={{color: "#fff"}}/>
                                            {
                                                this.SortIcon(item)
                                            }
                                            {item.NewName ? item.NewName : item.Name}
                                            <span style={{fontSize: '12px', color: '#fff'}}>
                                                    {
                                                        item.Filter ? this.FilterShow(item) : this.ShowStr(item, this.props.Coptions)

                                                    }
                                                </span>
                                        </a>
                                    </Dropdown>
                                    <Icon type="close-circle"
                                          onClick={(Did) => {
                                              this.props.DeleteChild({
                                                  ContainerId: item.ContainerId,
                                                  DragItemId: item.DragItemId
                                              })
                                          }}
                                          style={{color: "#fff"}}/>

                                </Tooltip>

                            </div>
                        </div>
                    ))

                }
                {/*防止拖拽时弹框出现拖拽阴影*/}
                {
                    item.ShowEditName ?
                        <EditName Name={item.Name}
                                  handCancel={(id) => this.props.OnEditName({
                                      ContainerId: item.ContainerId,
                                      DragItemId: item.DragItemId
                                  })}
                                  handOk={this.OnHandOk.bind(this, {
                                      ContainerId: item.ContainerId,
                                      DragItemId: item.DragItemId
                                  })}
                        /> : null
                }
                {
                    item.ShowEditName ? <div onClick={(id) => this.props.OnEditName({
                        ContainerId: item.ContainerId,
                        DragItemId: item.DragItemId
                    })} style={{
                        position: 'fixed',
                        background: 'rgba(0,0,0,0.1)',
                        overflow: 'auto',
                        top: '0',
                        right: '0',
                        bottom: '0',
                        left: '0',
                        zIndex: '1001'
                    }}/> : null
                }
            </div>
        )

    }
}

export default DragItemStr

