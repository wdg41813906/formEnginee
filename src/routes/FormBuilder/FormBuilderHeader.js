import React from 'react';
import { connect } from 'dva';
import queryString from 'query-string';
import { Row, Col, Tabs, Radio, Icon, message } from 'antd';
import { Router, Route, Switch, Redirect, Link } from 'dva/router';
import FORMSTATUS from '../../enums/FormStatus';
import styles from './FormBuilder.less';

class FormBuilderHeader extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tabId: queryString.parse(props.history.location.search).tabId,
            formTemplateId: queryString.parse(props.history.location.search).formTemplateId,
            // moduleId:queryString.parse(props.history.location.search).moduleId,
            canback: props.history.location.pathname.indexOf('/formbuilder') === 0,
            FormBuilderIndex: props.dynamicRegRoute({
                namespace: 'formBuilder',
                models: () => [import('../../models/FormBuilder/FormBuilder')],
                component: () => import('../../routes/FormBuilder/FormBuilder'),
            }),
            FormDataManage: props.dynamicRegRoute({
                namespace: 'dataManage',
                models: () => [import("../../models/DataManage/DataManage"), import('../../models/FormRender/FormRender')],
                component: () => import('../../routes/DataManage/DataManage'),
            }),
            formDataTable: props.withDynamicRegRoute(props.dynamicRegRoute({
                namespace: 'formDataTable',
                models: () => [import("../../models/FormDataTable/FormDataTable"), import('../../models/FormBuilder/FormBuilder'), import('../../models/FormRender/FormRender')],
                component: () => import('../../routes/FormDataTable/FormDataTable'),
            }))
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let { tabId, formTemplateId, moduleId } = queryString.parse(nextProps.history.location.search)
        if (tabId !== prevState.tabId || formTemplateId !== prevState.formTemplateId || moduleId !== prevState.moduleId) {
            return { tabId, formTemplateId, moduleId }
        }
        return null;
    }
    handleSizeChange = (e) => {
        // let query = queryString.parse(this.props.history.location.search)
        // let formTemplateType = query.formTemplateType
        // if (e.target.value === 'large') {
        //     if (this.state.canback) {
        //         this.props.history.push(`/formbuilder/large?tabId=${this.state.tabId}&formTemplateId=${this.state.formTemplateId}&moduleId=${this.state.moduleId}&formTemplateType=${formTemplateType}&type=modify`);

        //     } else {
        //         this.props.history.push(`/main/dic/large?tabId=${this.state.tabId}&formTemplateId=${this.state.formTemplateId}&moduleId=${this.state.moduleId}&formTemplateType=${formTemplateType}&type=modify`);
        //     }
        // }
        if (e.target.value === 'small' && this.props.formBuilder && this.props.formBuilder.get('formStatus') !== FORMSTATUS.NoChange) {
            message.info('请先保存表单！');
            return;
            // if (this.state.canback) {
            //     this.props.history.push(`/formbuilder/small?tabId=${this.state.tabId}&formTemplateId=${this.state.formTemplateId}&moduleId=${this.state.moduleId}&formTemplateType=${formTemplateType}&type=modify`);
            // } else {
            //     this.props.history.push(`/main/dic/small?tabId=${this.state.tabId}&formTemplateId=${this.state.formTemplateId}&moduleId=${this.state.moduleId}&formTemplateType=${formTemplateType}&type=modify`);
            // }
        }
        this.props.history.push(`${this.props.match.path}/${e.target.value}${this.props.history.location.search}`);
    }
    SetTitle = (e) => {
        if (e.target.value.length > 100) {
            message.warning('表单名称字符长度不能超过100')
        } else {
            this.props.dispatch({
                type: 'formBuilder/setTitle',
                formTitle: e.target.value,
                formTemplateVersionId: this.state.tabId
            })
        }
    }

    goback = () => {
        if (this.state.canback) {
            // this.props.history.goBack()
            this.props.history.replace(`/formViewList`);
        }
    }
    //计算标题文字长度
    strlen = (str) => {
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                len++;
            } else {
                len += 1.8;
            }
        }
        return len;
    }


    render() {
        const formTitle = this.props.formBuilder ? this.props.formBuilder.get('formTitle') : '新建表单';
        return (
            <div style={{ height: '100%', display: 'flex', flexFlow: 'column' }}>
                <div style={{
                    height: '45px',
                    display: 'flex',
                    lineHeight: '45px',
                    boxShadow: '0 5px 10px -5px rgba(0,0,0,0.2)',
                }}>
                    <div style={{
                        flex: '1',
                        textAlign: 'left',
                        fontSize: '16px',
                        paddingLeft: '5px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        {
                            (this.props.history.location.pathname.indexOf('/main/dic/small') === 0 || this.props.history.location.pathname.indexOf('/formbuilder/small') === 0) ?
                                null :
                                <Icon type={this.state.canback ? 'left' : 'form'} onClick={this.goback} />
                        }
                        {

                            (this.props.history.location.pathname.indexOf('/main/dic/small') === 0 || this.props.history.location.pathname.indexOf('/formbuilder/small') === 0) ?
                                null :
                                <input
                                    className={styles.Hoverinput}
                                    disabled={this.props.formBuilder ? this.props.formBuilder.get('titleDisabled') : false}
                                    placeholder="表单名称"
                                    style={{ flex: 1, fontSize: 16 }}
                                    value={formTitle}
                                    onChange={e => this.SetTitle(e)}
                                />
                        }
                    </div>
                    <div style={{ flex: '3', textAlign: 'center' }}>
                        <Radio.Group buttonStyle="solid"
                            value={this.props.history.location.pathname.slice(this.props.history.location.pathname.lastIndexOf('/') + 1) === 'small' ? 'small' : 'large'}
                            onChange={this.handleSizeChange.bind(this)}>
                            <Radio.Button value="large">
                                基础设置
                            </Radio.Button>
                            {/* <Radio.Button value="default">
                                扩展功能
                            </Radio.Button> */}
                            <Radio.Button value="small">
                                数据管理
                            </Radio.Button>
                        </Radio.Group>
                    </div>
                    <div style={{ flex: '1', textAlign: 'right', fontSize: '16px' }}>

                    </div>
                </div>
                <div style={{ flex: 1, height: 0 }}>
                    <Switch>
                        <Route exact path={`${this.props.match.path}/large`} component={this.state.FormBuilderIndex} />
                        <Route exact path={`${this.props.match.path}/small2`} component={this.state.FormDataManage} />
                        <Route path={`${this.props.match.path}/small`} component={this.state.formDataTable} />
                        <Route component={this.state.FormBuilderIndex} />
                    </Switch>
                </div>
            </div>

        )
    }
}

function mapStateToProps(state, props) {
    let formBuilder = null;
    if (state.formBuilder !== undefined) {
        if (props.history.location.pathname.indexOf('/main/dic') === -1 && props.history.location.pathname.indexOf('/formbuilder') === -1)
            return;
        let query = queryString.parse(props.history.location.search);
        if (query.tabId) {
            formBuilder = state.formBuilder.all[query.tabId];
        } else {
            return null;
        }
    }
    return { formBuilder }
}

export default connect(mapStateToProps)(FormBuilderHeader)
