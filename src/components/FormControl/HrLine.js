/**
 * @file src/FormControl/HrLine2.js
 * @author: fanty
 *
 * 重构分割线
 */
import React from 'react';
import { Select, InputNumber } from 'antd';
import classname from 'classnames';
import com from 'src/utils/com';
import FORM_CONTROLLIST_GROUP from 'src/enums/FormControlListGroup';
import Title from 'src/components/FormControl/Attribute/Title.js';
import Desc from 'src/components/FormControl/Attribute/Desc.js';
import OperationPower from 'src/components/FormControl/Attribute/OperationPower.js';
// import HrLineShowTitle from "../../components/FormControl/Attribute/HrLineShowTitle";
import Attribute from './Attribute/Attribute';
//import draftToHtml from "draftjs-to-html";
import FormControlType from 'src/enums/FormControlType';
import styles from './HrLine.less';
import ColorPicker from './Attribute/ColorPicker';

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = 'HrLine';
    formItemBase.typeName = '分割线';
    formItemBase.name = '分割线'; //标题
    formItemBase.lineStyle = 'solid'; //分割线样式
    formItemBase.AddShowType = 'Show'; //是否显示名称
    formItemBase.labelPosition = 'left'; // 分割线标题的位置
    formItemBase.linePosition = 'left'; // 决定分割线的位置在标题的 上右下左 的位置
    formItemBase.color = '#0693E3'; // 标题边框的颜色
    formItemBase.lineWidth = '5'; // 分割线的宽度
    return formItemBase;
}

const Option = Select.Option;

// option專用
@Attribute('样式')
class LineStyle extends React.PureComponent {
    render() {
        return (
            <Select
                value={this.props.lineStyle}
                style={{ width: '100%' }}
                onChange={e => this.props.onChange({ lineStyle: e })}
            >
                <Option value="solid">实线</Option>
                <Option value="dashed">虚线</Option>
                <Option value="none">无线框</Option>
            </Select>
        );
    }
}

@Attribute('位置和宽度')
class LinePositionAndWidth extends React.PureComponent {
    render() {
        return (
            <div className={styles['line-style-setting']}>
                <Select
                    value={this.props.linePosition}
                    style={{ width: '30%' }}
                    onChange={value => this.props.onChange({ linePosition: value })}
                >
                    <Option value={'top'}>上</Option>
                    <Option value={'right'}>右</Option>
                    <Option value={'bottom'}>下</Option>
                    <Option value={'left'}>左</Option>
                </Select>
                <InputNumber
                    min={1}
                    style={{ width: '30%' }}
                    value={this.props.lineWidth}
                    onChange={value => this.props.onChange({ lineWidth: value })}
                />
                px
            </div>
        );
    }
}

@Attribute('标题位置')
class LabelPosition extends React.PureComponent {
    render() {
        return (
            <Select
                value={this.props.labelPosition}
                style={{ width: '100%' }}
                onChange={value => this.props.onChange({ labelPosition: value })}
            >
                <Option value={'left'}>左</Option>
                <Option value={'center'}>中</Option>
                <Option value={'right'}>右</Option>
            </Select>
        );
    }
}

class HrLineFrom extends React.PureComponent {
    render() {
        const { lineStyle, labelPosition, desc, name, color: lineColor, linePosition, lineWidth } = this.props;
        return (
            <div
                className={`${styles.hrLine} ${styles['hrLine-common']}
                ${
                    styles[
                        classname(
                            { 'line-one-bottom': lineStyle === 'solid' && linePosition === 'bottom' },
                            { 'line-two-bottom': lineStyle === 'dashed' && linePosition === 'bottom' },
                            { 'line-one-top': lineStyle === 'solid' && linePosition === 'top' },
                            { 'line-two-top': lineStyle === 'dashed' && linePosition === 'top' }
                        )
                    ]
                }`}
                style={{
                    borderColor: `${lineColor}`,
                    borderWidth: `${lineWidth}px`
                }}
            >
                <div
                    className={`${
                        styles[
                            labelPosition !== 'left' &&
                                (labelPosition === 'center' ? 'hrLine-title-center' : 'hrLine-title-right')
                        ]
                    }`}
                >
                    <span
                        className={`${styles['hrLine-title']}  ${
                            styles[
                                classname(
                                    { 'line-one-left': lineStyle === 'solid' && linePosition === 'left' },
                                    { 'line-two-left': lineStyle === 'dashed' && linePosition === 'left' },
                                    { 'line-one-right': lineStyle === 'solid' && linePosition === 'right' },
                                    { 'line-two-right': lineStyle === 'dashed' && linePosition === 'right' }
                                )
                            ]
                        }`}
                        style={{
                            borderColor: `${lineColor}`,
                            borderWidth: `${lineWidth}px`
                        }}
                    >
                        {name}
                    </span>
                </div>
                {desc && (
                    <div
                        className={`${styles['hrLine-txt']} ${
                            styles[
                                labelPosition !== 'left' &&
                                    (labelPosition === 'center' ? 'hrLine-title-center' : 'hrLine-title-right')
                            ]
                        }`}
                        dangerouslySetInnerHTML={{
                            __html: desc
                        }}
                    />
                )}
            </div>
        );
    }
}

class HrLine extends React.PureComponent {
    render() {
        let { mode } = this.props;
        switch (mode) {
            case 'table':
            case 'form':
                return <HrLineFrom {...this.props} />;
            case 'option':
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <LineStyle {...this.props} />
                        <LabelPosition {...this.props} />
                        <LinePositionAndWidth {...this.props} />
                        {/*<Position.Component {...Position.getProps(this.props)} />*/}
                        {/* <Verification.Component {...Verification.getProps(this.props)} /> */}
                        <OperationPower {...this.props} />
                        {/* <Formart {...this.props} /> */}
                        <ColorPicker {...this.props} />
                        <Desc.Component {...Desc.getProps(this.props)} />
                    </React.Fragment>
                );
        }
    }
}

export default {
    itemType: 'HrLine',
    formControlType: FormControlType.Mark,
    name: '分割线',
    ico: 'minus',
    group: FORM_CONTROLLIST_GROUP.Normal, //分组
    Component: HrLine,
    initFormItemBase,
    containerMode: true,
    noMappad: true,
    valueType:'mark'
};
