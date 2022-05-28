import React, { PropTypes, PureComponent } from 'react'
import { Layout, Menu, Icon } from 'antd';
// import { Link } from 'dva/router';
import styles from './main.less';
// import config from '../../utils/config';
// import Immutable from "immutable";
import { connect } from 'dva';

const { Sider } = Layout;

function MenuShow({ menu, match, location, toOtherLink }) {
    return menu.map(item => {
        if (item.children.length > 0) {
            return (
                <Menu.SubMenu key={item.key} title={<span><Icon type={item.icon}></Icon><span>{item.name}</span></span>}>
                    {MenuShow({ menu: item.children, match, location, toOtherLink })}
                </Menu.SubMenu>
            )
        } else {
            // let tempLink = match.path + '/' + item.key;
            return (<Menu.Item key={item.key}>
                <div onClick={toOtherLink.bind(this, item.key)} >
                    <Icon type={item.icon} >
                    </Icon>
                    {item.name}
                </div>
                {/* {
                    location.pathname == tempLink ? (
                        <div>
                            <Icon type={item.icon} >
                            </Icon>
                            {item.name}
                        </div>
                    ) : (
                            // <Link to={tempLink} >
                            //     <Icon type={item.icon} >
                            //     </Icon>
                            //     {item.name}
                            // </Link>
                            <div onClick={toOtherLink.bind(this,item.key)} >
                                <Icon type={item.icon} >
                                </Icon>
                                {item.name}
                            </div>
                        )
                } */}

            </Menu.Item>)
        }
    })
}

class SiderBar extends React.Component {
    constructor(props) {
        super(props)
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.collapsed != this.props.collapsed ||
            nextProps.appMain.theme != this.props.appMain.theme
        )
    }
    render() {
        let { collapsed, menu, toggleCollapsed, match, location, toOtherLink, dispatch, bread, tabItems, panes, appMain } = this.props;
        let { activeKey, theme } = appMain;
        let tempActiveKey = activeKey.split("/");
        //console.log("Sider渲染", collapsed, tempActiveKey);
        return (
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme={theme}
            >
                <div className={`${styles.logo} ${collapsed ? styles.collapsed : ''} ${theme == 'light' ? styles.light : ''}`}>
                    <img src={config.logoSrc} />
                    <span className={styles.headerTitle}>{config.logoText}</span>
                </div>
                {/* <Menu mode="inline" theme={theme} inlineCollapsed={collapsed} selectedKeys={[tempActiveKey[tempActiveKey.length - 1]]}> */}
                <Menu className={styles.nav} mode="inline" theme={theme}>
                    {
                        MenuShow({ menu, match, location, toOtherLink })
                    }
                </Menu>
                <div onClick={toggleCollapsed} className={styles.siderTrigger}>
                    <Icon className="trigger" type={collapsed ? 'menu-unfold' : 'menu-fold'} />
                </div>
            </Sider>
        )
    }
}

export default connect(({ dispatch, appMain }) => ({ dispatch, appMain }))(SiderBar);;
