import React, { Component } from 'react';
import { Select } from 'antd';
import Attribute from './Attribute.js'

const styles = {
    area: {
        display: "flex",
        alignItems: "center",
        marginBottom: "10px"
    },
    areaContent: {
        flex: 1
    }
}

@Attribute("对齐方式")
class TextAlign extends React.Component {
    constructor(props) {
        super(props);
        this.SetTextAlign = this.SetTextAlign.bind(this);
    }
    SetTextAlign(textAlign) {
        this.props.onChange({ textAlign });
    }
    render() {
        let { textAlign } = this.props;
        textAlign = textAlign || 'left';
        return <Select style={{ width: "100%" }} value={textAlign} onChange={this.SetTextAlign}>
            <Select.Option value="left">左对齐</Select.Option>
            <Select.Option value="center">居中</Select.Option>
            <Select.Option value="right">右对齐</Select.Option>
        </Select>;
    }
}

@Attribute('布局')
class Position extends Component {
    constructor(props) {
        super(props);
        this.state = {
            widArr: [
                { value: 0, name: "无" },
                { value: 1, name: "100%" },
                { value: 4, name: "75%" },
                { value: 2, name: "50%" },
                { value: 3, name: "25%" },
            ],
            alignArr: [
                { value: 0, name: "无" },
                { value: 1, name: "居左" },
                { value: 2, name: "居右" },
                { value: 3, name: "自定义" },
            ],
            leftOrRightArr: [
                { value: 0, name: "0%" },
                { value: 1, name: "25%" },
                { value: 2, name: "50%" },
                { value: 3, name: "75%" },
            ],
            cusWidArr: [
                { value: 150, name: '短' },
                { value: 240, name: '中' },
                { value: 360, name: '长' },
            ],
            fixedArr: [
                { value: '', name: '无' },
                { value: 'left', name: '居左' },
                { value: 'right', name: '居右' },
            ],
        };
        this.widChange = this.widChange.bind(this);
        this.alignChange = this.alignChange.bind(this);
        this.leftChange = this.leftChange.bind(this);
        this.rigthtChange = this.rigthtChange.bind(this);
        this.cusWidChange = this.cusWidChange.bind(this);
    }
    _calcValue(type, index) {
        let wid = "";
        let left = "";
        let right = "";
        switch (type) {
            case "wid":
                switch (index) {
                    case 0:
                        wid = false;
                        break;
                    case 1:
                        wid = "100%";
                        break;
                    case 2:
                        wid = "50%";
                        break;
                    case 3:
                        wid = "25%";
                        break;
                    case 4:
                        wid = "75%";
                        break;
                }
                break;
            case "align":
                switch (index) {
                    case 0:
                        left = "";
                        right = "";
                        break;
                    case 1:
                        left = "0";
                        right = "auto";
                        break;
                    case 2:
                        right = "0";
                        left = "auto";
                        break;
                    // case 2:
                    //     right = "";
                    //     left = "";
                    //     break;
                    // case 4:
                    //     left = "25%";
                    //     right = "auto";
                    //     break;
                }
                break;
            case "left":
                switch (index) {
                    case 0:
                        left = "0";
                        break;
                    case 1:
                        left = "25%";
                        break;
                    case 2:
                        left = "50%";
                        break;
                    case 3:
                        left = "75%";
                        break;
                }
                break;
            case "right":
                switch (index) {
                    case 0:
                        right = "0";
                        break;
                    case 1:
                        right = "25%";
                        break;
                    case 2:
                        right = "50%";
                        break;
                    case 3:
                        right = "75%";
                        break;
                }
        }
        return { wid, left, right }
    }
    widChange(e) {
        let tempArr = [...this.state.alignArr];
        if (e == 1) {
            let isExist = tempArr.filter(v => v.value == 4);
            !isExist.length && tempArr.splice(1, 0, { value: 4, name: "居中" });
        } else {
            tempArr.forEach((v, i) => {
                if (v.value === 4) {
                    tempArr.splice(i, 1);
                }
            });
            if (this.state.alignValue == 4) {
                let { left, right } = this._calcValue("align", 0);
                let positionObj = { ...this.props.positionObj, alignValue: 0 };
                this.props.onChange({ left, right, positionObj });
            }
        }
        let { wid } = this._calcValue("wid", e);
        let positionObj = { ...this.props.positionObj, widValue: e };
        this.props.onChange({ width: wid, positionObj });
        this.setState({
            alignArr: tempArr
        });
    }
    alignChange(e) {
        let { left, right } = this._calcValue("align", e);
        let positionObj = { ...this.props.positionObj, alignValue: e };
        this.props.onChange({ left, right, positionObj });
    }
    leftChange(e) {
        let { left } = this._calcValue("left", e);
        let positionObj = { ...this.props.positionObj, leftValue: e };
        this.props.onChange({ left, positionObj });
    }
    rigthtChange(e) {
        let { right } = this._calcValue("right", e);
        let positionObj = { ...this.props.positionObj, rightValue: e };
        this.props.onChange({ right, positionObj });
    }
    cusWidChange(e) {
        //let positionObj = { ...this.props.positionObj, cusWidValue: e };
        this.props.onChange({ cusWidValue: e });
    }
    cusFixedChange = (e) => {
        this.props.onChange({ cusFixedValue: e });
    }
    render() {
        let { widArr, alignArr, leftOrRightArr, cusWidArr, fixedArr } = this.state;
        let { positionObj: { widValue, alignValue, leftValue, rightValue }, subFormField,
            cusFixedValue, onChange, textAlign } = this.props;
        return <React.Fragment>
            <div style={styles.area}>
                <div style={styles.areaName}>宽度：</div>{
                    this.props.customWidth == true ?
                        <Select getPopupContainer={() => document.getElementById('KJSX')} style={styles.areaContent} value={this.props.cusWidValue} onChange={this.cusWidChange}>
                            {
                                cusWidArr.map((v, i) => (
                                    <Select.Option key={i} value={v.value}>{v.name}</Select.Option>
                                ))
                            }
                        </Select>
                        :
                        <Select getPopupContainer={() => document.getElementById('KJSX')} style={styles.areaContent} value={widValue} onChange={this.widChange}>
                            {
                                widArr.map((v, i) => (
                                    <Select.Option key={i} value={v.value}>{v.name}</Select.Option>
                                ))
                            }
                        </Select>
                }
            </div>
            {
                subFormField ?
                    <div style={styles.area}>
                        <div style={styles.areaName}>冻结：</div>
                        <Select getPopupContainer={() => document.getElementById('KJSX')} style={styles.areaContent} value={cusFixedValue} onChange={this.cusFixedChange}>
                            {
                                fixedArr.map((v, i) => (
                                    <Select.Option key={i} value={v.value}>{v.name}</Select.Option>
                                ))
                            }
                        </Select>
                    </div> : null
            }
            {
                this.props.customWidth != true && <div style={styles.area}>
                    <div style={styles.areaName}>位置：</div>
                    <Select getPopupContainer={() => document.getElementById('KJSX')} style={styles.areaContent} value={alignValue} onChange={this.alignChange}>
                        {
                            alignArr.map((v, i) => (
                                <Select.Option key={v.value} value={v.value}>{v.name}</Select.Option>
                            ))
                        }
                    </Select>
                </div>
            }
            {
                alignValue == 3 && <div>
                    <div style={styles.area}>
                        <div style={styles.areaName}>左偏移量：</div>
                        <Select getPopupContainer={() => document.getElementById('KJSX')} style={styles.areaContent} value={leftValue} onChange={this.leftChange}>
                            {
                                leftOrRightArr.map((v, i) => (
                                    <Select.Option key={i} value={v.value}>{v.name}</Select.Option>
                                ))
                            }
                        </Select>
                    </div>
                    <div style={styles.area}>
                        <div style={styles.areaName}>右偏移量：</div>
                        <Select getPopupContainer={() => document.getElementById('KJSX')} style={styles.areaContent} value={rightValue} onChange={this.rigthtChange}>
                            {
                                leftOrRightArr.map((v, i) => (
                                    <Select.Option key={i} value={v.value}>{v.name}</Select.Option>
                                ))
                            }
                        </Select>
                    </div>
                </div>
            }
            <TextAlign onChange={onChange} textAlign={textAlign} />
        </React.Fragment>;
    }
}
// export default Position;
export default {
    Component: Position,
    getProps: (props) => {
        let { positionObj, customWidth, cusWidValue, onChange, subFormField, cusFixedValue, textAlign } = props;
        return { positionObj, customWidth, cusWidValue, onChange, subFormField, cusFixedValue, textAlign };
    }
};
