import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Layout, Button } from 'antd';
import Exception from 'ant-design-pro/lib/Exception';
import Head from '../../components/Layout/Header';
import Foot from '../../components/Layout/Footer';
import SiderBar from '../../components/Layout/Sider';
import MainTab from '../../components/Layout/MainTab';
import queryString from 'query-string';
import MainSetting from '../../components/Layout/MainSetting/index'

//报错提示
class PotentialError extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
    this.goHome = this.goHome.bind(this);
  }
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    //此处可以上报服务器，fetch something
  }
  goHome() {
    this.setState({ error: null, errorInfo: null })
    this.props.history.push({ pathname: '/main' });
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ width: 800, margin: '0 auto' }}>
          <Exception type="500" title={'出错了'} desc={<div>问题已自动提交服务器，我们将尽快解决！</div>} actions={<Button onClick={this.goHome} type="primary">返回首页</Button>} />
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// import testPlugin from 'testPlugin';

const { Header, Content } = Layout;

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      init: false
    };
    this.props.dispatch({
      type: "appMain/QueryMenu"
    });
    this.props.dispatch({//tabItems传入model
      type: 'appMain/tabItemsInit',
      tabItems: props.tabItems
    })
    this.init(props)
  }
  init(props) {
    let history = props.history;
    let { pathname, search, hash, state } = history.location;
    let key = pathname.replace(/\/main\//, '');
    let param = queryString.parse(search.slice(1));
    let { tabId, formTemplateId, moduleId, formTemplateType, ...other } = param;
    let id = tabId ? tabId : null;
    param = other;
    if (pathname == '/main/welcome' || pathname == '/main') {//欢迎

    } else { //其他
      if (id) {
        props.dispatch({
          type: "appMain/toOtherLink",
          payload: {
            key,
            id,
            formTemplateId,
            history,
            moduleId,
            formTemplateType,
            param
          }
        });
      } else {
        props.dispatch({
          type: "appMain/toOtherLink",
          payload: {
            key,
            history,
            param
          }
        });
      }
    }
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (true || !prevState.init) {
      const { location, dispatch, appMain, history, match, tabItems } = nextProps;
      const { user, collapsed, Tabs, panes, activeKey, menu, bread } = appMain;
      const HeaderProps = {
        user: user,
        LoginOut() {
          dispatch({
            type: 'appMain/LoginOut',
            history: history
          })
        },
        toggleSetting() {
          dispatch({
            type: 'appMain/toggleSetting'
          })
        }
      }
      const SilderBarProps = {
        menu,
        match,
        panes,
        location,
        bread,
        tabItems,
        collapsed,
        toOtherLink: function (key) {
          dispatch({
            type: "appMain/toOtherLink",
            payload: {
              key,
              history
            }
          });
        },
        toggleCollapsed: function () {
          dispatch({ type: 'appMain/toggleCollapsed' })
        }
      }
      const MainTabProps = {
        history,
        match,
        panes,
        activeKey,
        onClick(key) {
          dispatch({
            type: "appMain/ChangeActiveKey",
            payload: key
          });
          if (location.pathname !== key) {
            history.push({
              pathname: key.split('?')[0],
              search: key.split('?')[1] ? '?' + key.split('?')[1] : ''
            });
          }
        },
        onEdit(targetKey, action) {
          if (action == "remove") {
            let index;
            panes.forEach((pane, i) => {
              if (pane.key === targetKey) {
                index = i;
              }
            });
            dispatch({
              type: "appMain/removeTab",
              index: index
            })
            dispatch({
              type: "appMain/ChangeActiveKey",
              payload: panes[index - 1].key
            });
            //if (activeKeyNew == panes[index].key)
            history.push(panes[index - 1].key);
          }
        }
      }
      return { HeaderProps, SilderBarProps, MainTabProps, init: true }
    }
    // else {
    //   let upDate = {};//更新数据
    //   let isDate = false;//是否更新
    //   let { HeaderProps, MainTabProps, SilderBarProps, collapsed } = prevState;//旧
    //   let { appMain } = nextProps;//新
    //   //header=====user
    //   if (HeaderProps.user.name !== appMain.user.name) {
    //     isDate = true;
    //     upDate.HeaderProps = Object.assign(HeaderProps, appMain.user)
    //   }
    //   //SilderBarProps====collapsed
    //   if (SilderBarProps.collapsed !== appMain.collapsed) {
    //     isDate = true;
    //     upDate.SilderBarProps = Object.assign(SilderBarProps, appMain.collapsed)
    //   }
    //   //MainTabProps====activeKey，panes
    //   if (MainTabProps.activeKey !== appMain.activeKey || JSON.stringify(MainTabProps.panes) !== JSON.stringify(appMain.panes)) {
    //     isDate = true;
    //     upDate.MainTabProps = Object.assign(MainTabProps, { activeKey: appMain.activeKey }, { panes: appMain.panes })
    //   }

    //   if (isDate) {
    //     return upDate
    //   } else {
    //     return null;
    //   }
    // }

  }
  render() {
    return (
      <PotentialError history={this.props.history}>
        <Layout style={this.props.appMain.colorWeak ? { filter: 'invert(80%)', height: '100%' } : { height: '100%' }}>
          {
            this.state.SilderBarProps && <SiderBar  {...this.state.SilderBarProps} />
          }
          <Layout>
            <Header>{this.state.HeaderProps && <Head {...this.state.HeaderProps} />}</Header>
            <Content style={{ marginTop: 5, position: 'relative', height: 'calc(100% - 60px)', overflow: 'auto', boxSizing: 'border-box' }}>
              {
                this.state.MainTabProps && <MainTab dynamicRegRoute={this.props.dynamicRegRoute} withDynamicRegRoute={this.props.withDynamicRegRoute} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, height: '100%', overFlow: 'auto' }} {...this.state.MainTabProps} />
              }
            </Content>
            {/* <Foot /> */}
          </Layout>
          <MainSetting {...this.props} />
        </Layout>
      </PotentialError>
    );
  }
}
Main.displayName = `这里是Main`;

function mapStateToProps({ appMain }) {
  return {
    appMain
  }
}
export default connect(mapStateToProps)(Main);
