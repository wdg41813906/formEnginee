import React from 'react';
import styles from './Detail.less';
import { Icon, Switch, Tabs, Button, Tooltip } from 'antd';
import FormList from './Detail/FormList';
import ReportList from './Detail/ReportList';
import Modify from './Detail/Modify';
import UploadCloud from './Detail/UploadCloud';
// import { fileServer } from '../../../utils/config';
const TabPane = Tabs.TabPane;
export default class ApplicationDetail extends react.Component {
    constructor(props) {
        super(props);
        this.props.GetForModify();
        this.props.GetTemplateListByAppIdPaged(1);
        this.props.GetReportListByAppIdPaged(1);
    }
    render() {
        const { appInfo } = this.props;

        return (
            <div className={styles.appPage}>
                <Modify {...this.props} />
                <UploadCloud {...this.props} />
                <div className={styles.headerWrap}>
                    <div className={styles.headerImg}>
                        <img src={`${config.fileServer}${appInfo.icon}`} alt="" />
                    </div>
                    <div className={styles.headerRight}>
                        <h3>
                            {appInfo.name}

                            <Tooltip placement="top" title="编辑">
                                <Icon
                                    onClick={() => {
                                        this.props.ModifyToggle();
                                    }}
                                    className={styles.headerEdit}
                                    type="edit"
                                />
                            </Tooltip>

                            {appInfo.isCloud ? (
                                <Tooltip placement="top" title="撤销上传">
                                    <Icon
                                        onClick={() => {
                                            this.props.RemoveByAppId();
                                        }}
                                        type="cloud-upload"
                                        className={styles.uploadClouded}
                                    />
                                </Tooltip>
                            ) : (
                                <Tooltip placement="top" title="上传应用中心">
                                    <Icon
                                        onClick={() => {
                                            this.props.uploadCloudToggle();
                                        }}
                                        type="cloud-upload"
                                        className={styles.uploadCloud}
                                    />
                                </Tooltip>
                            )}
                        </h3>

                        <p className={styles.headerDesc}>{appInfo.desc}</p>
                    </div>
                    <div className={styles.headerTool}>
                        <div className={styles.enabledWrap}>
                            <p className={styles.enabled}>{appInfo.publishStatus === 1 ? '已启用' : '未启用'}</p>
                            <Switch
                                onChange={e => {
                                    if (e) {
                                        this.props.Publish();
                                    } else {
                                        this.props.UnPublish();
                                    }
                                }}
                                checkedChildren="是"
                                unCheckedChildren="否"
                                checked={appInfo.publishStatus === 1}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.powerWrap}>
                    <div className={styles.powerHeader}>
                        <h3 className={styles.powerTitle}>使用范围</h3>
                        <p className={styles.powerEdit}>
                            编辑
                            <Icon type="edit" />
                        </p>
                    </div>
                    <div className={styles.powerContent}>
                        <div className={styles.powerItem}>
                            <Icon type="user" className={styles.powerPerson} /> 燕麦米
                        </div>
                        <div className={styles.powerItem}>
                            <Icon type="user" className={styles.powerPerson} /> 李玉文
                        </div>
                        <div className={styles.powerItem}>
                            <Icon type="user" className={styles.powerPerson} /> 朱七七
                        </div>
                    </div>
                </div>

                <Tabs
                    activeKey={this.props.currentTab}
                    onChange={e => {
                        this.props.SetCurrentTab(e);
                    }}
                >
                    <TabPane
                        tab={
                            <span>
                                <Icon type="file-protect" />
                                表单
                            </span>
                        }
                        key="form"
                    >
                        <FormList {...this.props} />
                    </TabPane>
                    <TabPane
                        tab={
                            <span>
                                <Icon type="dashboard" />
                                仪表盘
                            </span>
                        }
                        key="report"
                    >
                        <ReportList {...this.props} />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}
