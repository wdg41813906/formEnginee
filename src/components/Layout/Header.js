import React, { Component } from 'react';
import { Layout, Menu, Dropdown, Icon, message, Select, Tooltip } from 'antd';
import NoticeIcon from 'ant-design-pro/lib/NoticeIcon';
import HeaderSearch from 'ant-design-pro/lib/HeaderSearch';
import avatar from '../../assets/avatar.png'

import { Link } from 'dva/router';
import styles from './main.less';


const SubMenu = Menu.SubMenu;
const { Header } = Layout;


class Head extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.MenuItemClick = this.MenuItemClick.bind(this);
        this.getNoticeData = this.getNoticeData.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.user.name !== nextProps.user.name) {
            return true;
        }
        return false;
    }
    getNoticeData(type, datas) {
        return datas.filter((e, i) => {
            return (
                e.type == type
            )
        })
    }
    MenuItemClick(item) {
        if (item.key === '3') {
            this.props.LoginOut();
        }
    }
    render() {
        const datas = [{
            id: '000000001',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
            title: '你收到了 14 份新周报',
            datetime: '2017-08-09',
            type: '通知',
        }, {
            id: '000000002',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/OKJXDXrmkNshAMvwtvhu.png',
            title: '你推荐的 曲妮妮 已通过第三轮面试',
            datetime: '2017-08-08',
            type: '通知',
        }, {
            id: '000000003',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png',
            title: '这种模板可以区分多种通知类型',
            datetime: '2017-08-07',
            read: true,
            type: '通知',
        }, {
            id: '000000004',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
            title: '左侧图标用于区分不同的类型',
            datetime: '2017-08-07',
            type: '通知',
        }, {
            id: '000000005',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
            title: '内容不要超过两行字，超出时自动截断',
            datetime: '2017-08-07',
            type: '通知',
        }, {
            id: '000000006',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
            title: '曲丽丽 评论了你',
            description: '描述信息描述信息描述信息',
            datetime: '2017-08-07',
            type: '消息',
        }, {
            id: '000000007',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
            title: '朱偏右 回复了你',
            description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
            datetime: '2017-08-07',
            type: '消息',
        }, {
            id: '000000008',
            avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
            title: '标题',
            description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
            datetime: '2017-08-07',
            type: '消息',
        }, {
            id: '000000009',
            title: '任务名称',
            description: '任务需要在 2017-01-12 20:00 前启动',
            extra: '未开始',
            status: 'todo',
            type: '待办',
        }, {
            id: '000000010',
            title: '第三方紧急代码变更',
            description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
            extra: '马上到期',
            status: 'urgent',
            type: '待办',
        }, {
            id: '000000011',
            title: '信息安全考试',
            description: '指派竹尔于 2017-01-09 前完成更新并发布',
            extra: '已耗时 8 天',
            status: 'doing',
            type: '待办',
        }, {
            id: '000000012',
            title: 'ABCD 版本发布',
            description: '冠霖提交于 2017-01-06，需在 2017-01-07 前完成代码变更任务',
            extra: '进行中',
            status: 'processing',
            type: '待办',
        }];
        const menu = (
            <Menu onClick={this.MenuItemClick}>
                <Menu.Item key="1"><Icon type="user" />个人中心</Menu.Item>
                <Menu.Item key="2"><Icon type="setting" />个人设置</Menu.Item>
                <Menu.Divider />
                <Menu.Item key="3"><Icon type="logout" />退出</Menu.Item>
            </Menu>
        )
        return (
            <Header className={`${styles.header}`}>
                <Tooltip title="搜索">
                    <div className={styles.part} style={{ paddingTop: 8 }}>
                        <HeaderSearch
                            placeholder="站内搜索"
                            dataSource={['搜索提示一', '搜索提示二', '搜索提示三']}
                            onSearch={(value) => {
                            }}
                            onPressEnter={(value) => {
                            }}
                        />
                    </div>
                </Tooltip>
                <div className={styles.part}>
                    <Tooltip title="使用文档">
                        <a target="_blank" href="http://www.sysdsoft.cn/" className={styles.icon} title="使用文档">
                            <Icon type="question-circle-o" />
                        </a>
                    </Tooltip>
                </div>
                <div className={styles.part}>
                    <NoticeIcon
                        className="notice-icon"
                        count={5}
                        // onItemClick={onItemClick}
                        // onClear={onClear}
                        popupAlign={{ offset: [20, 0] }}
                    >
                        <NoticeIcon.Tab
                            list={this.getNoticeData('通知', datas)}
                            title="通知"
                            emptyText="你已查看所有通知"
                            emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
                        />
                        <NoticeIcon.Tab
                            list={this.getNoticeData('消息', datas)}
                            title="消息"
                            emptyText="您已读完所有消息"
                            emptyImage="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
                        />
                        <NoticeIcon.Tab
                            list={this.getNoticeData('待办', datas)}
                            title="待办"
                            emptyText="你已完成所有待办"
                            emptyImage="https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg"
                        />
                    </NoticeIcon>
                </div>
                <Tooltip title="设置">
                    <div className={styles.part} onClick={this.props.toggleSetting}>
                        <Icon className={styles.icon} type='setting' />
                    </div>
                </Tooltip>
                <div className={styles.part}>
                    <Dropdown overlay={menu} placement="bottomCenter" >
                        <a className="ant-dropdown-link" href="#">
                            <div className={styles.avatar}>
                                <img src={avatar} alt="avatar" />
                                <span>{this.props.user.name}</span>
                            </div>
                        </a>
                    </Dropdown>
                </div>
            </Header>
        )
    }
}
export default Head;

