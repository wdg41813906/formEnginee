/**
 * @file src/components/FormControl/ColorPicker.js
 * @author: fanty
 *
 * 颜色选择器控件
 */
import React from "react";
import { TwitterPicker } from "react-color";
import Attribute from "./Attribute";
import styles from "./ColorPicker.less";
import PropTypes from 'prop-types'

@Attribute("颜色选择")
export default class ColorPicker extends React.PureComponent {

    static propTypes = {
        color: PropTypes.string.isRequired, // 选择的颜色 16进制
        onChange: PropTypes.func.isRequired // 将颜色值传出去的函数
    }

    constructor(props) {
        super(props);
        this.state = {
            pickerDisplay: false
        };
    }

    handleThePicker = () => {
        this.setState({
            pickerDisplay: !this.state.pickerDisplay
        });
    };

    handClosePicker = () => {
        this.setState({
            pickerDisplay: false
        });
    };

    handleChangeColor = value => {
        this.props.onChange({ color: value.hex });
        this.handClosePicker();
    };

    render() {
        return (
            <div className={styles.container}>
                {this.state.pickerDisplay && (
                    <div className={styles["picker-container"]}>
                        <div className={styles.cover} onClick={this.handClosePicker} />
                        <TwitterPicker
                            color={this.props.color}
                            onChangeComplete={this.handleChangeColor}
                            triangle={"hidden"}
                        />
                    </div>
                )}
                <div
                    className={styles["picker-button"]}
                    style={{ backgroundColor: this.props.color }}
                    onClick={this.handleThePicker}
                />
            </div>
        );
    }
}
