import React from 'react'
import {Select, DatePicker, Input, Modal, InputNumber, message} from 'antd'
import moment from 'moment';

const Option = Select.Option;
const Optiontype = Object.freeze({
    SingleText: [
        {name: "等于", value: "a"},
        {name: "不等于", value: "b"},
        {name: "等于任意一个", value: "c"},
        {name: "不等于任意一个", value: "d"},
        {name: "包含", value: "e"},
        {name: "不包含", value: "f"},
        {name: "为空", value: "g"},
        {name: "不为空", value: "h"}
    ],
    Number: [
        {name: "等于", value: "a"},
        {name: "不等于", value: "b"},
        {name: "大于", value: "c"},
        {name: "大于等于", value: "d"},
        {name: "小于", value: "e"},
        {name: "小于等于", value: "f"},
        {name: "选择范围", value: "g"},
        {name: "为空", value: "h"},
        {name: "不为空", value: "i"}
    ],
    DateTime: [
        {name: "等于", value: "a"},
        {name: "不等于", value: "b"},
        {name: "大于等于", value: "c"},
        {name: "小于等于", value: "d"},
        {name: "选择范围", value: "e"},
        {name: "为空", value: "f"},
        {name: "不为空", value: "g"}
    ]
})

const StrNextOption = Object.freeze({
    DateTime: [
        {name: "固定值", value: "a"},
        {name: "今天", value: "b"},
        {name: "昨天", value: "c"},
        {name: "本周", value: "d"},
        {name: "上周", value: "e"},
        {name: "本月", value: "f"},
        {name: "上月", value: "g"}
    ]
})


const error = () => {
    message.warning('过滤条件设置不正确...');
};
message.config({
    top: 50,
    duration: 1.5
});


//选择类型 //0:DateTime 1:Number 2:SingleText
class FilterCondition extends React.Component {
    constructor(props) {
        super()
        this.state = {
            Firstoption: '等于',
            Secondoption: '固定值',//DateTime 特有属性
            Thirdoption: null,
            Fourthoption: null,
        }
        this.FirstSelect = this.FirstSelect.bind(this)
        this.SecondSelect = this.SecondSelect.bind(this)
        this.ThirdSelect = this.ThirdSelect.bind(this)
        this.ThirdSelectText = this.ThirdSelectText.bind(this)
        this.ThirdSelectDate = this.ThirdSelectDate.bind(this)
        this.ThirdSelectNumber = this.ThirdSelectNumber.bind(this)
        this.FirstonSelect = this.FirstonSelect.bind(this)
        this.SecondonSelect = this.SecondonSelect.bind(this)
    }

    //componentWillMount
    componentDidMount() {
        //console.log(this.props.setFilNewData.Fillist)
        if (this.props.setFilNewData) {
            this.setState({
                Firstoption: this.props.setFilNewData.Fillist[0].Firstoption,
                Secondoption: this.props.setFilNewData.Fillist[1].Secondoption,//DateTime 特有属性
                Thirdoption: this.props.setFilNewData.Fillist[2].Thirdoption,
                Fourthoption: this.props.setFilNewData.Fillist[3].Fourthoption,
            })
        }
    }

    FirstonSelect = (value, i) => {
        if (i === 0) {
            if (value === '为空' || value === '不为空') {
                this.setState({
                    Firstoption: value,
                    Secondoption: '',
                    Thirdoption: null,
                    Fourthoption: null,
                })
            } else {
                if (value === '等于') {
                    this.setState({
                        Firstoption: value,
                        Secondoption: '固定值',
                        Thirdoption: null,
                        Fourthoption: null,
                    })
                } else {
                    this.setState({
                        Firstoption: value,
                        Secondoption: '',
                        Thirdoption: null,
                        Fourthoption: null,
                    })
                }
            }

        } else {
            this.setState({
                Firstoption: value,
                Secondoption: '',
                Thirdoption: null,
                Fourthoption: null,
            })
        }
    }

    SecondonSelect = (value, i) => {
        //console.log((typeof value), i)
        this.setState({
            // Secondoption: `${value}`,
            Secondoption: ((typeof value) === 'object' && Number(i) !== 2) ? value.target.value : `${value}`,
            Thirdoption: null,
            Fourthoption: null,
        })

    }

    SecondonChange = (value) => {
        this.setState({
            Secondoption: value,
            Thirdoption: null,
            Fourthoption: null,
        })
    }

    ThirdonChange = (value) => {
        this.setState({
            Thirdoption: value,
            Fourthoption: null,
        })
    }

    ThirdDatePicker = (value, s) => {
        if (this.state.Firstoption === '选择范围') {
            this.setState({
                Secondoption: '',
                Thirdoption: s === 0 && s !== 1 ? moment(value).format("YYYY-MM-DD") : this.state.Thirdoption,//DateTime 单选时候的值
                Fourthoption: s === 1 && s !== 0 ? moment(value).format("YYYY-MM-DD") : this.state.Fourthoption
            })
        } else if (this.state.Secondoption === '固定值') {
            this.setState({
                Thirdoption: s === 0 && s !== 1 ? moment(value).format("YYYY-MM-DD") : this.state.Thirdoption,
                Fourthoption: null
            })
        } else {
            this.setState({
                Secondoption: '',
                Thirdoption: s === 0 && s !== 1 ? moment(value).format("YYYY-MM-DD") : this.state.Thirdoption,
                Fourthoption: null
            })
        }
    }

    FirstSelect = (o) => {
        if (o.Fillist) {
            let Firstoption = this.state.Firstoption
            switch (o.ControlType) {
                case 'SingleText':
                    return (
                        <Select
                            value={Firstoption}
                            onSelect={(value) => this.FirstonSelect(value, 2)}
                            style={{width: '100%'}}>
                            {
                                Optiontype.SingleText.map((item, index) => <Option value={item.name}
                                                                                   key={index}>{item.name}</Option>)
                            }
                        </Select>
                    )
                    break
                case 'Number':
                    return (
                        <Select
                            value={Firstoption}
                            onSelect={(value) => this.FirstonSelect(value, 1)}
                            style={{width: '100%'}}>
                            {
                                Optiontype.Number.map((item, index) => <Option value={item.name}
                                                                               key={index}>{item.name}</Option>)
                            }
                        </Select>
                    )
                    break
                case 'DateTime':
                    return (
                        <Select
                            value={Firstoption}
                            onSelect={(value) => this.FirstonSelect(value, 0)}
                            style={{width: '100%'}}>
                            {
                                Optiontype.DateTime.map((item, index) => <Option value={item.name}
                                                                                 key={index}>{item.name}</Option>)
                            }
                        </Select>
                    )
                    break
            }
        }
    }

    SecondSelect = (o) => {
        if (o.Fillist) {
            let Firstoption = this.state.Firstoption
            if (Firstoption === '为空' || Firstoption === '不为空') {
                return null
            } else {
                if (o.ControlType === 'Number') {
                    if (Firstoption === '选择范围') {
                        return (
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <InputNumber placeholder="最小值" value={this.state.Secondoption}
                                             onChange={(value) => this.SecondonChange(value)}
                                             style={{width: '45%'}}/>
                                <div>~</div>
                                <InputNumber placeholder="最大值" value={this.state.Thirdoption}
                                             onChange={(value) => this.ThirdonChange(value)}
                                             style={{width: '45%'}}/>
                            </div>
                        )
                    }
                    else {
                        return (
                            <InputNumber value={this.state.Secondoption}
                                         onChange={(value) => this.SecondonChange(value)} placeholder="请输入数字..."
                                         style={{width: '100%'}}/>
                        )
                    }
                }
                if (o.ControlType === 'DateTime') {
                    if (Firstoption === '等于') {
                        return (
                            <Select
                                value={this.state.Secondoption}
                                style={{width: '100%'}} showSearch
                                onSelect={(value) => this.SecondonSelect(value, 0)}>
                                {
                                    StrNextOption.DateTime.map((item, index) => <Option value={item.name}
                                                                                        key={index}>{item.name}</Option>)
                                }
                            </Select>
                        )
                    } else {
                        return null
                    }
                }
                if (o.ControlType === 'SingleText') {
                    let ChildList = []
                    o.ChildList.map((item, index) => {
                        ChildList.push(<Option key={index} value={item}>{item}</Option>);
                    })
                    let Secondoptions = this.state.Secondoption ? this.state.Secondoption.split(",") : [];
                    if (Firstoption === '等于' || Firstoption === '不等于') {
                        return (
                            <Select value={Secondoptions} showSearch placeholder="请选择筛选内容"
                                    style={{width: '100%'}}
                                    onChange={(value) => this.SecondonSelect(value, 2)}>
                                {
                                    o.ChildList.map((item, index) => <Option value={item} key={index}>{item}</Option>)

                                }

                            </Select>
                        )
                    } else if (Firstoption === '包含' || Firstoption === '不包含') {
                        return (<Input placeholder="Please input" value={Secondoptions}
                                       onChange={(value) => this.SecondonSelect(value, 0)}/>
                        )
                    } else {
                        return (
                            <Select value={Secondoptions} mode='multiple' placeholder="请选择筛选内容"
                                    style={{width: '100%'}}
                                    onChange={(value) => this.SecondonSelect(value, 2)}>
                                {ChildList}

                            </Select>
                        )
                    }
                }
            }
        }
    }

    disabledStartDate = (startValue) => {
        const endValue = this.state.Fourthoption
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() >= moment(endValue).valueOf();
    }

    disabledEndDate = (endValue) => {
        const startValue = this.state.Thirdoption
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= moment(startValue).valueOf();
    }

    ThirdSelectDate = (o) => {
        if (o.Fillist) {
            let Firstoption = this.state.Firstoption
            let Secondoption = this.state.Secondoption
            let Thirdoption = this.state.Thirdoption
            let Fourthoption = this.state.Fourthoption
            if (Firstoption === '为空' || Firstoption === '不为空') {
                return null
            } else if (Firstoption === '选择范围') {
                return (
                    <div>
                        <div style={{marginTop: '10px'}}>
                            <DatePicker showTime disabledDate={this.disabledStartDate} placeholder="开始日期"
                                        value={Thirdoption ? moment(Thirdoption) : null}
                                        onChange={(value) => this.ThirdDatePicker(value, 0)}
                                        style={{width: '100%'}}/>
                        </div>
                        <div style={{marginTop: '10px'}}>
                            <DatePicker showTime disabledDate={this.disabledEndDate} placeholder="结束日期"
                                        value={Fourthoption ? moment(Fourthoption) : null}
                                        onChange={(value) => this.ThirdDatePicker(value, 1)}
                                        style={{width: '100%'}}/>
                        </div>
                    </div>
                )
            } else if (Firstoption === '等于') {
                return (
                    Secondoption === '固定值' ? <div style={{marginTop: '10px'}}>
                        <DatePicker value={Thirdoption ? moment(Thirdoption) : null}
                                    onChange={(value) => this.ThirdDatePicker(value, 0)}
                                    style={{width: '100%'}}/>
                    </div> : null
                )

            } else {
                return (
                    <div style={{marginTop: '10px'}}>
                        <DatePicker value={Thirdoption ? moment(Thirdoption) : null}
                                    onChange={(value) => this.ThirdDatePicker(value, 0)}
                                    style={{width: '100%'}}/>
                    </div>
                )
            }
        }
    }

    ThirdSelectText = (o) => {
        return null
    }

    ThirdSelectNumber = (o) => {
        return null
    }

    ThirdSelect = (o) => {
        switch (o.ControlType) {
            case 'SingleText':
                return this.ThirdSelectText(o)
                break
            case 'DateTime':
                return this.ThirdSelectDate(o)
                break
            case 'Number':
                return this.ThirdSelectNumber(o)
                break
        }
    }
    sendData = (o, i) => {
        this.props.setFilterVisible(o, [{
            Firstoption: this.state.Firstoption
        }, {
            Secondoption: this.state.Secondoption//DateTime 特有属性
        }, {
            Thirdoption: this.state.Thirdoption
        }, {
            Fourthoption: this.state.Fourthoption
        }], false, i === 1)

    }

    setFilterVisible = (o, i) => {//取消确定按钮回复默认值
        if (i === 1) {
            // let a = ['为空', '不为空', '选择范围', '等于', '固定值']
            // let iof = a.indexOf('不为空')
            // let state = this.state
            // if ((iof < 2 && iof >= 0) || (iof === 2 && state.Thirdoption && state.Fourthoption) || (iof > 2 && state.Thirdoption) || state.Thirdoption) {
            //     this.sendData(o)
            // } else {
            //     error()
            // }
            if (o.ControlType === "DateTime") {
                if (this.state.Firstoption === '为空' || this.state.Firstoption === '不为空') {
                    this.sendData(o, 1)
                } else if (this.state.Firstoption === '选择范围') {
                    if (this.state.Thirdoption && this.state.Fourthoption) {
                        this.sendData(o, 1)
                    } else {
                        error()
                    }
                } else if (this.state.Firstoption === '等于') {
                    if (this.state.Secondoption === '固定值') {
                        if (this.state.Thirdoption) {
                            this.sendData(o, 1)
                        } else {
                            error()
                        }
                    } else {
                        this.sendData(o, 1)
                    }
                } else {
                    if (this.state.Thirdoption) {
                        this.sendData(o, 1)
                    } else {
                        error()
                    }
                }
            }
            if (o.ControlType === "Number") {
                if (this.state.Firstoption === '为空' || this.state.Firstoption === '不为空') {
                    this.sendData(o, 1)
                } else if (this.state.Firstoption === '选择范围') {
                    if (this.state.Secondoption && this.state.Thirdoption) {
                        this.sendData(o, 1)
                    } else {
                        error()
                    }
                } else {
                    if (this.state.Secondoption) {
                        this.sendData(o, 1)
                    } else {
                        error()
                    }
                }
            }
            if (o.ControlType === "SingleText") {
                if (this.state.Firstoption === '为空' || this.state.Firstoption === '不为空') {
                    this.sendData(o, 1)
                } else {
                    if (this.state.Secondoption) {
                        this.sendData(o, 1)
                    } else {
                        error()
                    }
                }
            }
        } else {
            this.sendData(o, 0)
        }


    }


    render() {
        return (
            <Modal
                title="设置过滤条件"
                destroyOnClose={true}
                visible={this.props.FilterVisible}
                onOk={() => this.setFilterVisible(this.props.setFilNewData, 1)}
                onCancel={() => this.setFilterVisible(this.props.setFilNewData, 0)}
                maskClosable={false}
            >
                <div style={{width: '60%', margin: '0 auto'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <div style={{
                            padding: '5px',
                            wordBreak: 'keep-all',
                            whiteSpace: 'nowrap'
                        }}>{this.props.setFilNewData.Name}</div>
                        <div style={{padding: '5px', width: '100%'}}>
                            {
                                this.FirstSelect(this.props.setFilNewData)
                            }
                        </div>
                    </div>
                    <div style={{padding: '5px'}}>
                        <div>
                            {
                                this.SecondSelect(this.props.setFilNewData)
                            }
                        </div>
                        {
                            this.ThirdSelect(this.props.setFilNewData)
                        }
                    </div>

                </div>
            </Modal>
        )
    }
}

export default FilterCondition
