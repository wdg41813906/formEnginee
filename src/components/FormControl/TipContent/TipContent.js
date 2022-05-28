import React from 'react'
import {Tooltip, Icon} from 'antd'
import styles from "./TipContent.less";


export default class TipContent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tipWidth: true
        }
    }

    toggleTip = () => {
        this.setState({
            tipWidth: !this.state.tipWidth
        })
    }

    render() {
        return (
            <div className={styles.TipContent} style={{
                width: this.state.tipWidth ? '205px' : '35px'
            }}>
                <div className={styles.tipContent}
                     style={{width: this.state.tipWidth ? '162px' : '0'}}>
                    <Tooltip placement='bottom' title={<span>打印</span>}>
                        <div style={{display: 'flex', alignItems: 'center', height: '36px'}}>
                            <div className={styles.chlid}>
                                <Icon type="printer" className={styles.hoverIcon}/>
                            </div>
                            <div className={styles.leftborder}/>
                        </div>
                    </Tooltip>
                    <Tooltip placement='bottom' title={<span>导出</span>}>
                        <div style={{display: 'flex', alignItems: 'center', height: '36px'}}>
                            <div className={styles.chlid}>
                                <Icon type="export" className={styles.hoverIcon}/>
                            </div>
                            <div className={styles.leftborder}/>
                        </div>
                    </Tooltip>
                    <Tooltip placement='bottom' title={<span>业务流程</span>}>
                        <div className={styles.hoverIcond}>
                            <div style={{height: '42%'}}>业务</div>
                            <div style={{height: '42%'}}>流程</div>
                        </div>
                    </Tooltip>
                </div>
                <Tooltip placement='bottom'>
                    <div className={styles.shownext}>
                        <Icon type="appstore"
                              theme={this.state.tipWidth ? 'outlined' : 'filled'}
                              style={{
                                  fontSize: "24px",
                                  color: '#fff',
                                  marginTop: '6px'
                              }}
                              onClick={this.toggleTip}/>
                    </div>
                </Tooltip>
            </div>
        )
    }
}
