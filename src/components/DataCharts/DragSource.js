import React from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import StrDrag from './StrDrag'
import {Icon, Select, Modal} from 'antd';
import SelectDataSource from './SelectDataSource'
import Drag from './Drag_Drop.less';
import com from '../../utils/com';

const pageSize = 8
const Option = Select.Option;


class StrDragSource extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            templateId: props.templateId,
            pageIndex: 1,
            visible: false,
            visibles: false,
            selectedOptions: '数据源表单中的全部数据',
            allValue: [{
                key: 0,
                value: '数据源表单中的全部数据'
            }, {
                key: 1,
                value: '使用成员对数据源表单的权限'
            }]
        }
    }

    ChangeDataSource = () => {
        this.props.ChangeDataTable({
            pageIndex: this.state.pageIndex,
            pageSize: 8
        })
        this.setState({
            visible: true
        })

    }
    handleOnSelect = (value) => {
        this.setState({
            selectedOptions: `${value}`
        })
    }

    onCancel = () => {
        this.setState({
            visible: false,
            templateId: this.props.templateId,
        })
        this.props.ResetInitTable()
    }
    onOk = () => {
        this.setState({
            visible: false
        })
        this.props.ChangeSelectListItem(this.state.templateId)
        this.props.AllInit(this.state.templateId)
        this.props.ResetInitTable()
    }

    onChangetotal = (value) => {
        this.props.ChangeDataTable({
            pageIndex: Number(value),
            pageSize: 8
        })
    }

    //更改数据源
    SelectListItem = (e) => {
        //console.log(e.target.value)
        this.setState({
            templateId: e.target.value
        })
    }

    handleOk = (e) => {
        //console.log(e);
        this.setState({
            visibles: false,
        });
    }

    handleCancel = (e) => {
        //console.log(e);
        this.setState({
            visibles: false,
        });
    }
    AddTarget = () => {
        this.setState({
            visibles: true
        })
    }


    render() {
        let offsetHeight = window.document.body.offsetHeight
        return (
            <div style={{padding: '6px'}}>
                <div style={{display: 'flex'}}>
                    <div style={{flex: '1', textAlign: 'left', fontSize: '14px'}}>数据源</div>
                    <div style={{color: '#A5A5A5', flex: '1', textAlign: 'right'}}>
                        <span style={{
                            fontSize: '12px',
                            cursor: 'pointer',
                            padding: '4px 12px',
                            background: '#1990ff',
                            borderRadius: '10px',
                            color: '#fff'
                        }}
                              onClick={this.ChangeDataSource}>
                            <Icon type="swap"/>更换
                        </span>
                    </div>
                </div>
                {
                    this.state.visible ?
                        <SelectDataSource pageIndex={this.state.pageIndex}
                                          onCancel={this.onCancel.bind(this)}
                                          onOk={this.onOk.bind(this)}
                                          ChangeTable={this.props.ChangeTable}
                                          onChangetotal={this.onChangetotal.bind(this)}
                                          templateId={this.state.templateId}
                                          SelectListItem={this.SelectListItem.bind(this)}
                        /> : null

                }
                <div style={{padding: '8px 0', fontSize: '12px', color: "#248AF9"}}>
                    <Icon type="file-text"/> {this.props.title}
                </div>
                <div style={{paddingTop: '10px', borderBottom: '1px solid #E9E9E9'}}>
                    <p>数据获取权限</p>

                    <Select value={this.state.selectedOptions}
                            style={{width: '100%', fontSize: '12px'}} onSelect={this.handleOnSelect}>
                        {
                            this.state.allValue.map((item, index) => {
                                return (
                                    <Option title={item.value} value={item.value} key={index}
                                            style={{fontSize: '12px'}}>{item.value}</Option>
                                )
                            })
                        }
                    </Select>
                    <p style={{
                        color: '#91a1b7',
                        fontSize: '12px',
                        padding: '8px 0',
                        margin: '0'
                    }}>用户访问组件时可以查看组件中的全部数据。</p>
                </div>
                <div>
                    <div style={{fontSize: '12px', display: 'flex', padding: '8px 0'}}>
                        <div style={{flex: '1', textAlign: 'left'}}>字段</div>
                        <div style={{flex: '1', textAlign: 'right'}}>
                            <Icon type="plus" style={{cursor: 'pointer'}} onClick={this.AddTarget}/>
                        </div>
                    </div>
                    <div style={{
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        position: 'absolute',
                        width: '95%',
                        bottom: 0,
                        top: '220px'
                    }}>
                        {
                            this.props.DragSourceList ?
                                this.props.DragSourceList.map((item, index) => {
                                    return <StrDrag key={index} options={item} StartDrag={this.props.StartDrag}/>
                                }) : null
                        }
                    </div>

                </div>
                <Modal
                    title="添加指标"
                    visible={this.state.visibles}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                >
                    <p>添加指标...</p>
                    <p>添加指标...</p>
                    <p>聚合函数.............................</p>
                </Modal>
            </div>

        )
    }
}


export default StrDragSource
