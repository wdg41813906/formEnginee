import react from 'react';
import { icon } from 'antd';
import com from '../../../../utils/com'
import _ from 'underscore';
import { is, fromJS } from 'immutable'
import InfoConfig from './InfoConfig';
import TextConfig from './TextConfig';
import BackgroundConfig from './BackgroundConfig';
import BackImageConfig from './BackImageConfig';
import BackImageShowConfig from './BackImageShowConfig';

import styles from '../../Config/ConfigReport/SwichConfig.less'
class None extends react.Component {
    render() {
        return <div>none</div>
    }
}
const ConfigTypeList = [
    {
        id: com.Guid(),
        key: "TitleType",
        selected: true,
        name: "报表信息",
        icon: 'font-colors',
        config: [
            {
                title: "标题",
                Component: InfoConfig,
            },
            {
                title: "背景",
                Component: BackgroundConfig,
            },
            {
                title: "文本",
                Component: TextConfig,
            },

        ]
    },
    {
        id: com.Guid(),
        key: "StyleType",
        selected: false,
        name: "背景图片",
        icon: 'font-size',
        config: [
            {
                title: "背景图片",
                Component: BackImageShowConfig,
            },
            {
                title: "自定义背景",
                Component: BackImageConfig,
            }
        ]
    }
]
export default class LedgerConfig extends react.Component {
    constructor(props) {
        super(props)
        this.state = {
            ConfigTypeList: fromJS(ConfigTypeList),
            config: ConfigTypeList[0].config
        }
    }
    shouldComponentUpdate(nextProps, nextState) {

        const thisProps = this.props || {};
        const thisState = this.state || {};
        nextState = nextState || {};
        nextProps = nextProps || {};
        for (var key in nextProps.ledgerAllConfig) {
            if (!is(thisProps.ledgerAllConfig[key], nextProps.ledgerAllConfig[key])) {
                return true;
            }
        }
        var nextStateConfigTypeList = nextState.ConfigTypeList.toJS()
        var thisStateConfigTypeList = thisState.ConfigTypeList.toJS()
        for (var i = 0; i < nextStateConfigTypeList.length; i++) {
            var item = nextStateConfigTypeList[i];
            if (!is(item.selected, thisStateConfigTypeList[i].selected)) {
                return true;
            }
        }

        if (!is(thisProps.backImageList, nextProps.backImageList)) {
                    return true;
                }
        // for (const key in nextState.ConfigTypeList) {

        //     if (!is(thisState.ConfigTypeList[key], thisState.ConfigTypeList[key])) {
        //         return true;
        //     }
        // }
        return false;
    }

    ConfigTypeChange = (item) => {
        ConfigTypeList.forEach(function (ele) {
            ele.selected = ele.id === item.id;
        })
        this.setState({
            ConfigTypeList: fromJS(ConfigTypeList),
            config: item.config
        })
    }
    render() {
        const { ledgerAllConfig ,backImageList} = this.props;
        const { ConfigTypeList } = this.state;
        var newBackImageList=backImageList.toJS();
        const newConfigTypeList = ConfigTypeList.toJS();
        return (
            <div className={styles.configWrap}>
                <div className={styles.configType}>
                    {
                        newConfigTypeList.map(Item => {
                            return (
                                <div onClick={
                                    e => {
                                        this.ConfigTypeChange(Item)


                                    }
                                } className={`${styles.typeItem} ${Item.selected ? styles.selected : ''}`}>
                                    <icon type={Item.icon} />
                                    <div>{Item.name}</div>
                                </div>
                            )

                        })
                    }

                </div>
                <div className={styles.configContent}>
                    {
                        this.state.config.map(Ele => {
                            return (
                                <Ele.Component title={Ele.title}
                                    NewBackImageList={newBackImageList}
                                    {...this.props}
                                    />
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}
