import ControlHOC from './ControlHOC'
import react from 'react';
import styles from './Control.less'
import { Input, Radio, Slider, InputNumber, Col, Row } from 'antd';
@ControlHOC()
export default class SliderControl extends react.Component {
   
    render() {
        
        const {item,datakey,value,min,max} = this.props
        return (
            <Row>
                <Col span={12} style={{ marginTop: 8 }}>
                                <Slider
                                    min={min}
                                    max={max}
                                    onChange={
                                        e=>{
                                            this.props.RefreshData(item,datakey,e)
                                        }
                                    }
                                    value={value}
                                />
                            </Col>
                            <Col span={4}>
                                <InputNumber
                                    min={min}
                                    max={max}
                                    style={{ marginLeft: 16 }}
                                    value={value}
                                    onChange={e=>{
                                        this.props.RefreshData(item,datakey,e)
                                    }}
                                />
                            </Col>
                        </Row>
        )
    }
}