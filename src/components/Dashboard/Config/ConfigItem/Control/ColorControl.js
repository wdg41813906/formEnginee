import ControlHOC from './ControlHOC'
import react from 'react';
import { SketchPicker, PhotoshopPicker } from 'react-color'
import styles from './Control.less'

@ControlHOC()
export default class ColorControl extends react.Component {
    state = {
        pickerVisible: false,
        color: '#fff'
    }
    handleColorChange = ({ hex }) => {
        this.setState({
            color: hex
        })
    }
    onTogglePicker = () => {
        this.setState({ pickerVisible: !this.state.pickerVisible })
    }
    render() {

        const {item,datakey,value } = this.props
        return (
            <div>
                <div className={styles.ColorInput} onClick={e => {
                    this.onTogglePicker()
                }}>
                    <div style={{ background: value }} className={styles.ColorIcon}></div>
                    <div className={styles.ColorText}>
                        {value}
                    </div>
                </div>
                {this.state.pickerVisible && (
                    <div style={{ position: 'absolute', zIndex: 99 }} onClick={
                        e=>e.stopPropagation()
                    } onMouseLeave={
                        this.onTogglePicker
                    }>
                        <SketchPicker
                            color={value}
                            onClick={

                                e=>{

                                    e.stopPropagation()
                                }
                            }
                            onMouseLeave={this.onTogglePicker}
                            onChangeComplete={({ hex }) => {

                                this.props.RefreshData(item, datakey, hex)
                            }}
                        />

                    </div>

                )}
                {
                    this.state.pickerVisible&&  <div id="cover" style={{
                        position: 'fixed',
                        top: '0',
                        bottom: '0',
                        left: '0',
                        right: '0',
                      }} onClick={ this.onTogglePicker }/>
                }
            </div>
        )
    }
}
