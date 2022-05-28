import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import { Menu, Dropdown, Icon, Tooltip, Modal, Radio, Checkbox, Input, InputNumber, Button, message } from 'antd';
import FilterCondition from "../DataCharts/FilterCondition"
import DragItemStr from './DragItem'
import Drop from './Drag_Drop.less';
import com from '../../utils/com';


const RadioGroup = Radio.Group;

const spec = {
    drop(props, monitor, component) {
        if (!component) return
        if (monitor.getItem().ChangeSort) {
            if (props.ChartsType === 'Table') {
                let NotFilData = {//非筛选条件state
                    ContainerId: props.ContainerId,
                    Filter: props.filter,
                    DragItemId: monitor.getItem().item.DragItemId,
                    Name: monitor.getItem().item.Name,
                    Code: monitor.getItem().item.Code,
                    formType: monitor.getItem().item.formType,
                    ControlType: monitor.getItem().item.ControlType,
                    CheckKey: monitor.getItem().item.ControlType === 'DateTime' ? ['2', '0', '11'] : ['0', '0', '11'],//Table 维度之间拖拽重置下拉菜单选中项
                    ChangeDrag: true,//Table 维度之间拖拽特有属性
                }
                if (monitor.getItem().item.ContainerId === 'dimensionX' && props.ContainerId === 'dimensionY') {
                    props.endDrag(NotFilData)
                    //console.log('维度列拖向维度行')
                }
                if (monitor.getItem().item.ContainerId === 'dimensionY' && props.ContainerId === 'dimensionX') {
                    props.endDrag(NotFilData)
                    //console.log('维度行拖向维度列')
                }

            }
        } else {
            let NotFilData
            if (props.ContainerId === 'dimensionX' || props.ContainerId === 'dimensionY') {
                if (monitor.getItem().item.ControlType === 'Number') {
                    message.info('Number类型字段不可拖放至维度');
                } else {
                    NotFilData = {//非筛选条件state
                        ContainerId: props.ContainerId,
                        Filter: props.filter,
                        DragItemId: monitor.getItem().item.id,
                        Name: monitor.getItem().item.Name,
                        Code: monitor.getItem().item.Code,
                        formType: monitor.getItem().item.formType,
                        ControlType: monitor.getItem().item.ControlType,
                        PrimaryKey: monitor.getItem().item.PrimaryKey,
                        CheckKey: monitor.getItem().item.ControlType === 'DateTime' ? ['2', '0', '11'] : ['0', '0', '11']//默认下拉菜单的选中项(维度)
                    }
                }

            } else {
                NotFilData = {//非筛选条件state
                    ContainerId: props.ContainerId,
                    Filter: props.filter,
                    DragItemId: monitor.getItem().item.id,
                    Name: monitor.getItem().item.Name,
                    Code: monitor.getItem().item.Code,
                    formType: monitor.getItem().item.formType,
                    ControlType: monitor.getItem().item.ControlType,
                    PrimaryKey: monitor.getItem().item.PrimaryKey,
                    CheckKey: props.filter ? null : (monitor.getItem().item.ControlType === 'Number' ? ['2', '7', '11'] : ['0', '7', '11'])//默认下拉菜单的选中项(指标)
                }
                if (props.ContainerId === "indicators") {
                    NotFilData.DataFormat = [{ 'Parent': 0 }, { 'Sub': 1 }]
                }
            }
            let FilData = {//筛选条件state
                ContainerId: props.ContainerId,
                Filter: props.filter,
                DragItemId: monitor.getItem().item.id,
                Name: monitor.getItem().item.Name,
                Code: monitor.getItem().item.Code,
                ControlType: monitor.getItem().item.ControlType,
                PrimaryKey: monitor.getItem().item.PrimaryKey,
                ChildList: [],//第二个显示框数据来源
                Fillist: [{
                    Firstoption: '等于',
                }, {
                    Secondoption: monitor.getItem().item.ControlType === 'DateTime' ? '固定值' : ''//(固定值)DateTime 特有属性
                }, {
                    Thirdoption: null
                }, {
                    Fourthoption: null
                }],
                formType: monitor.getItem().item.formType
            }
            props.endDrag(props.filter ? FilData : NotFilData)

        }


    },
    hover(props, monitor, component) {
        if (!component) return
        // props.CrossDragSort(props.item)

    },
    canDrop(props, monitor) {
        return true
    }
}

@DropTarget('StrDrag', spec, (connect) => ({
    connectDropTarget: connect.dropTarget()
}))
class StrDrop extends React.Component {
    constructor(props) {
        super(props)
    }

    componentWillUpdate() {
        //console.log('更新...')
    }

    render() {
        const { connectDropTarget, DragItem, IsDragging, IsDraggingType } = this.props
        let drag;
        if (IsDraggingType === 'Number') {
            drag = !(this.props.ContainerId === 'dimensionX' || this.props.ContainerId === 'dimensionY');
        } else {
            drag = true
        }
        return connectDropTarget(
            <div className={Drop.DropTargetContainer}
                style={{
                    border: IsDragging && drag ? '0.5px #0DB3A6 dashed' : '',
                    backgroundColor: IsDragging && drag ? '#DCEEF0' : '#fff',
                    borderRadius: '2px',
                    position: 'relative',
                }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        lineHeight: '34px',
                        color: '#000',
                        width: '80px',
                        whiteSpace: 'nowrap'
                    }}>{this.props.title}</div>
                {
                    DragItem.length > 0 ? null :
                        <div style={{
                            width: '100%',
                            position: 'absolute',
                            lineHeight: '34px',
                            left: '80px',
                            fontSize: '12px'
                        }}>
                            拖动左侧字段到此处来添加{this.props.title}</div>
                }
                <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}>
                    {
                        DragItem.map((item, index) => {
                            if (item.ContainerId === this.props.ContainerId) {
                                return (
                                    <DragItemStr key={index} item={item} {...this.props} />
                                )
                            }
                        })
                    }
                </div>
            </div>
        )
    }
}

class StrDropTarget extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            CurrentId: {},
            DataFormatVisible: false,//数据格式Modal
            valueRadio: 0,
            valueCheckboxs: ['C']
        }
    }

    onChangeCheckbox = (checkedValues) => {
        this.setState({
            valueCheckboxs: checkedValues,
        });
    }

    handleOk = (e) => {
        this.setState({
            DataFormatVisible: false,
        });
        this.props.saveSet(this.state.CurrentId, this.state.valueRadio, this.state.valueCheckboxs)
    }

    handleCancel = (e) => {
        this.setState({
            DataFormatVisible: false
        });
    }
    onChangeRadio = (e) => {
        this.setState({
            valueRadio: e.target.value,
        });
    }

    showFormatModal = (item) => {
        this.setState({
            DataFormatVisible: true,
            CurrentId: {
                ContainerId: item.ContainerId,
                DragItemId: item.DragItemId
            }
        });
    }

    render() {
        return (
            <div>
                {
                    (this.props.ChartsType === 'Table' ? this.props.Coptions.AList : this.props.Coptions.CList).map((item, index) =>
                        <StrDrop  {...this.props} key={index} ContainerId={item.id} title={item.title}
                            filter={item.filter} showFormatModal={this.showFormatModal.bind(this)} />)
                }


                <Modal
                    destroyOnClose={true}
                    title="数据格式"
                    visible={this.state.DataFormatVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                >
                    <div style={{ width: "100%" }}>
                        <RadioGroup onChange={this.onChangeRadio} value={this.state.valueRadio} style={{ width: "100%" }}>
                            <div>
                                <Radio value={0}>预定义格式</Radio>
                                <div style={{ padding: "12px 20px" }}>
                                    <Checkbox.Group style={{ width: '100%', height: '42px', lineHeight: '42px' }}
                                        disabled={this.state.valueRadio !== 0}
                                        value={this.state.valueCheckboxs}
                                        onChange={this.onChangeCheckbox}>
                                        <Checkbox value="A">千分符</Checkbox>
                                        <Checkbox value="B">百分比</Checkbox>
                                        <Checkbox value="C">小数位数</Checkbox><InputNumber min={1} defaultValue={1} max={20}
                                            style={{ display: this.state.valueCheckboxs.find((n) => n == 'C') ? "" : "none" }} />
                                    </Checkbox.Group>
                                    <div
                                        style={{
                                            padding: "12px 8px",
                                            marginTop: "12px",
                                            height: "80px",
                                            background: "#F4F5F5"
                                        }}>
                                        效果预览
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Radio value={1}>自定义格式</Radio>
                                <div style={{ padding: "12px 20px" }}>
                                    <Input placeholder="自定义格式" disabled={this.state.valueRadio === 0} />
                                </div>
                            </div>
                        </RadioGroup>
                    </div>
                </Modal>

                {
                    this.props.FilterVisible ? <FilterCondition {...this.props} /> : null

                }

            </div>
        );
    }
}


export default StrDropTarget
