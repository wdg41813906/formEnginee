import React from 'react';
import {Card, Tooltip} from 'antd';
import PropTypes from 'prop-types';
import Property from './Drag_Drop.less';
import DataPermission from './DataPermission'
import chartType from '../../assets/dash_chart_type.png'
import com from '../../utils/com';

class PropertyOption extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ChartsTypesExplain: [//当前的图表类型
                {
                    explain: (
                        <div>
                            <div>指标图</div>
                            <div>0个维度，1个指标</div>
                            <div>1个维度，1个指标</div>
                        </div>
                    )
                },
                {
                    explain: (
                        <div>
                            <div>透视图</div>
                            <div>1个维度，1个或多个指标</div>
                            <div>多个维度，1个或多个指标</div>
                        </div>
                    )
                },
                {
                    explain: (
                        <div>
                            <div>折线图</div>
                            <div>1个维度，1个或多个指标</div>
                            <div>2个维度，1个指标</div>
                        </div>
                    )
                },
                {
                    explain: (
                        <div>
                            <div>柱状图</div>
                            <div>1个维度，1个或多个指标</div>
                            <div>2个维度，1个指标</div>
                        </div>

                    )
                },
                {
                    explain: (
                        <div>
                            <div>条形图</div>
                            <div>1个维度，1个或多个指标</div>
                            <div>2个维度，1个指标</div>
                        </div>)
                },
                {
                    explain: (
                        <div>
                            <div>面积图</div>
                            <div>1个维度，1个指标</div>
                            <div>2个维度，1个指标</div>
                        </div>)
                },
                {
                    explain: (<div>
                        <div>饼图</div>
                        <div>1个维度，1个指标</div>
                    </div>)
                },
                {
                    explain: (
                        <div>
                            <div>雷达</div>
                            <div>1个维度，1个或多个指标</div>
                            <div>2个维度，1个指标</div>
                        </div>)
                }
            ]
        }
    }

    render() {
        return (
            <div className='PropertyOptions'>
                <Card size="small" title="图表类型" style={{background: '#F4F6F9'}}>
                    {
                        this.props.ChartsTypes.map((item, index) => {
                            return (
                                <Tooltip placement="left" mouseLeaveDelay={0} key={index}
                                         title={this.state.ChartsTypesExplain[index].explain}>
                                    <Card.Grid
                                        className={`${Property.CardGrid} ${this.props.ChartsType === item.ChartsType ? Property.CheckChart : Property.unCheckChart}`}
                                        style={{
                                            backgroundImage: `url(${chartType})`,
                                            backgroundPosition: item.isSelect ? `-${71 * index}px -66px` : `-${71 * index}px 0px`
                                        }}
                                        onClick={(type) => item.isSelect ? this.props.chartChange(item.ChartsType) : ''}/>
                                </Tooltip>
                            )
                        })
                    }
                </Card>
                <div>
                    <DataPermission ChartsType={this.props.ChartsType} onChangeCheck={this.props.onChangeCheck}
                                    DataPermission={this.props.DataPermission}
                                    NumberonChange={this.props.NumberonChange}
                                    ShowCount={this.props.ShowCount}
                    />
                </div>
            </div>
        )
    }

}

export default PropertyOption
