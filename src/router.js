import React from 'react';
import { Router, Route, Switch, Redirect } from 'dva/router';
import dynamic from 'dva/dynamic';
import HTML5Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import 'antd/dist/antd.css';  // or 'antd/dist/antd.less'
import 'ant-design-pro/dist/ant-design-pro.css';
import AuthorizedRoute from './routes/AuthorizedRoute'

window.React = React;

const Validate = function (next) {
    let token = localStorage.getItem('token'); //com.GetCookie('token');
    return token !== null;
}

function RouterConfig({ history, app }) {
    const dynamicRegRoute = ({ namespace, models, component }) => {
        return dynamic({
            app,
            namespace,
            models,
            component
        })
    }
    const FormBuilderHeader = dynamic({
        app,
        namespace: 'formBuilder',
        models: () => [import('./models/FormBuilder/FormBuilder'),import("./models/BusinessEvent/BusinessEvent"),
        import('./models/BusinessRule/BusinessRule')],
        component: () => import('./routes/FormBuilder/FormBuilderHeader'),
    });
    const Login = dynamic({
        app,
        namespace: 'login',
        models: () => [import('./models/Login')],
        component: () => import('./routes/Login'),
    });
    const Page404 = dynamic({
        app,
        namespace: 'page404',
        // models: () => [import('./models/Login')],
        component: () => import('./components/Layout/404'),
    });
    const Main = dynamic({
        app,
        namespace: 'main',
        models: () => [import('./models/Main/Main')],
        component: () => import('./routes/Main/Main'),
    });

    const User = dynamic({
        app,
        namespace: 'user',
        models: () => [import('./models/Users/User')],
        component: () => import('./routes/Users/Users'),
    });

    // const Tea = dynamic({
    //   app,
    //   namespace: 'tea',
    //   models: () => [import('./models/FormTemplate/FormTemplate')],
    //   component: () => import('./routes/FormTemplate/FormTemplate'),
    // });

    const Dic = dynamic({
        app,
        namespace: 'formBuilder',
        models: () => [import('./models/FormBuilder/FormBuilder')],
        component: () => import('./routes/FormBuilder/FormBuilder'),
    });
    const Dic2 = dynamic({
        app,
        namespace: 'formBuilder',
        models: () => [import('./models/FormBuilder/FormBuilder')],
        component: () => import('./routes/FormBuilder/FormBuilder'),
    });
    const Dic3 = dynamic({
        app,
        namespace: 'formBuilder',
        models: () => [import('./models/FormBuilder/FormBuilder')],
        component: () => import('./routes/FormBuilder/FormBuilderHeader'),
    });
    const FormRender = dynamic({
        app,
        namespace: 'formRender',
        models: () => [import('./models/FormRender/FormRender')],
        component: () => import('./routes/FormRender/FormRender'),
    });

    const FormList = dynamic({
        app,
        namespace: 'formList',
        models: () => [import('./models/FormList/FormList')],
        component: () => import('./routes/FormList/FormList'),
    });
    const DataManage = dynamic({
        app,
        namespace: "dataManage",
        models: () => [import("./models/DataManage/DataManage"), import('./models/FormRender/FormRender')],
        component: () => import("./routes/DataManage/DataManage")
    });
    const Role = dynamic({
        app,
        namespace: 'role',
        models: () => [import('./models/Role/Role')],
        component: () => import('./routes/Role/Role'),
    });
    const LedgerIndex = dynamic({
        app,
        namespace: 'ledgerIndex',
        models: () => [import('./models/Dashboard/Ledger/LedgerIndex')],
        component: () => import('./routes/Dashboard/Ledger/LedgerIndex'),
    });

    const LedgerList = dynamic({
        app,
        namespace: 'ledgerList',
        models: () => [import('./models/Dashboard/Ledger/LedgerList')],
        component: () => import('./routes/Dashboard/List/LedgerList'),
    });
    const DataCharts = dynamic({
        app,
        namespace: "dataCharts",
        models: () => [import("./models/DataCharts/DataCharts")],
        component: () => import("./routes/DataCharts/DataCharts")
    });
    const BookAddress = dynamic({
        app,
        namespace: "bookAddress",
        models: () => [import("./models/BookAddress/BookAddress")],
        component: () => import("./routes/BookAddress/BookAddress")
    });

    const AppStore = dynamic({
        app,
        namespace: "appStore",
        models: () => [import("./models/App/AppStore/AppStore")],
        component: () => import("./routes/App/AppStore/AppStore")
    });
    const AppCateGory = dynamic({
        app,
        namespace: "appCateGory",
        models: () => [import("./models/App/AppStore/AppCateGory")],
        component: () => import("./routes/App/AppStore/AppCateGory")
    });
    const Application = dynamic({
        app,
        namespace: "application",
        models: () => [import("./models/App/AppStore/Application")],
        component: () => import("./routes/App/AppStore/Application")
    });
    const ApplicationCreate = dynamic({
        app,
        namespace: "applicationCreate",
        models: () => [import("./models/App/AppStore/ApplicationCreate")],
        component: () => import("./routes/App/AppStore/ApplicationCreate")
    });

    const TableNesting = dynamic({
        app,
        namespace: "tableNesting",
        models: () => [import("./models/tableNesting/tableNesting")],
        component: () => import("./routes/tableNesting/tableNesting")
    });
    const ApplicationDetail = dynamic({
        app,
        namespace: "applicationDetail",
        models: () => [import("./models/App/AppStore/ApplicationDetail")],
        component: () => import("./routes/App/AppStore/ApplicationDetail")
    });
    const FormViewList = dynamic({
        app,
        namespace: "formViewList",
        models: () => [import("./models/FormViewList/FormViewList")],
        component: () => import("./routes/FormViewList/FormViewList")
    });
    const AccountBook = dynamic({
        app,
        namespace: "accountBook",
        models: () => [import("./models/AccountBook/AccountBook"), import('./models/FormRender/FormRender')],
        component: () => import("./routes/AccountBook/AccountBook")
    });
    const DataAuthority = dynamic({
        app,
        namespace: "dataAuthority",
        models: () => [import("./models/DataAuthority/DataAuthority")],
        component: () => import("./routes/DataAuthority/DataAuthority")
    });
    const DataAuthorityNew = dynamic({
        app,
        namespace: "dataAuthorityNew",
        models: () => [import("./models/DataAuthorityNew/DataAuthorityNew"), import('./models/FormBuilder/FormBuilder')],
        component: () => import("./routes/DataAuthorityNew/DataAuthorityNew")
    });
    const DataSource = dynamic({
        app,
        namespace: "dataSource",
        models: () => [import("./models/DataSource/DataSource")],
        component: () => import("./routes/DataSource/DataSource")
    });
    const WebHook = dynamic({
        app,
        namespace: "thirdPartySystem",
        models: () => [import("./models/WebHook/WebHook")],
        component: () => import("./routes/WebHook/WebHook")
    });
    const BorderControls = dynamic({
        app,
        namespace: "BorderControls",
        models: () => [import("./models/BorderControls/BorderControls")],
        component: () => import("./routes/BorderControls/BorderControls")
    });

    const FormDataTable = dynamic({
        app,
        namespace: 'formDataTable',
        models: () => [import("./models/FormDataTable/FormDataTable"), import('./models/FormRender/FormRender')],
        component: () => import('./routes/FormDataTable/FormDataTable'),
    });

    const Ledger = ({ match }) => {
        return <Switch>
            <Route path={`/main/ledger`} exact component={LedgerList} />
            <Route path={`/main/ledger/ledgerIndex`} component={LedgerIndex} />
            {/*<Redirect to={`${match.url}`} />*/}
        </Switch>;
    }

    const FormViewListtest = ({ match }) => {
        return <Switch>
            <Route path={`/main/formViewList`} exact component={FormViewList} />
            <Route path={`/main/formViewList/dataSource`} component={DataSource} />
            {/*<Redirect to={`${match.url}`} />*/}
        </Switch>;
    }

    const AppStoreRoute = ({ match }) => {
        return <Switch>
            <Route path={`/main/application`} exact component={Application} />
            <Route path={`/main/application/create`} component={ApplicationCreate} />
            <Route path={`/main/application/detail`} component={ApplicationDetail} />
            <Route path={`/main/application/teamplateForm`} component={AppStore} />
            <Route path={`/main/ledger/ledgerIndex`} component={LedgerIndex} />
            <Route path={`/main/formViewList/dataSource`} component={DataSource} />
            <Route path='/main/dic/init' component={Dic} />
            {/*<Redirect to={`${match.url}`} />*/}
        </Switch>;
    }
    let list = [
        { key: 'user', component: <Route path='/main/user' component={Role} /> },
        { key: 'dic', component: <Route path='/main/dic' component={FormBuilderHeader} /> },
        { key: 'show', component: <Route path='/main/show' component={FormRender} /> },
        { key: 'formList', component: <Route path='/main/formList' component={FormList} /> },
        { key: 'ledger', component: <Route path='/main/ledger' component={Ledger} /> },
        { key: 'dataManage', component: <Route path='/main/dataManage' component={DataManage} /> },
        { key: 'dataCharts', component: <Route path='/main/dataCharts' component={DataCharts} /> },
        { key: 'bookAddress', component: <Route path='/main/bookAddress' component={BookAddress} /> },
        { key: 'appCateGory', component: <Route path='/main/appCateGory' component={AppCateGory} /> },
        { key: 'appStore', component: <Route path='/main/appStore' component={AppStore} /> },
        { key: 'application', component: <Route path='/main/application' component={AppStoreRoute} /> },
        { key: 'formViewList', component: <Route path='/main/formViewList' component={FormViewListtest} /> },
        { key: 'tableNesting', component: <Route path='/main/tableNesting' component={TableNesting} /> },
        { key: 'accountBook', component: <Route path='/main/accountBook' component={AccountBook} /> },
        { key: 'dataAuthority', component: <Route path='/main/dataAuthority' component={DataAuthority} /> },
        { key: 'dataAuthorityNew', component: <Route path='/main/dataAuthorityNew' component={DataAuthorityNew} /> },
        { key: 'webHook', component: <Route path='/main/webHook' component={WebHook} /> },
    ];
    let MainRoute = (props) => {
        // console.log(props);
        return Validate() ?
            <Main {...props} dynamicRegRoute={dynamicRegRoute} withDynamicRegRoute={withDynamicRegRoute} tabItems={list}>
            </Main> :
            <Redirect to="/login" />
    };

    function withDynamicRegRoute(Wrapper) {
        return function (props) {
            return <Wrapper {...props} withDynamicRegRoute={withDynamicRegRoute} dynamicRegRoute={dynamicRegRoute} />
        }
        // return class extends React.PureComponent {
        //     render() {
        //         return <Wrapper {...this.props} withDynamicRegRoute={withDynamicRegRoute} dynamicRegRoute={dynamicRegRoute} />
        //     }
        // }
    }

    let LedgerRoute = (props) => {
        return <Main {...props} >
            <AuthorizedRoute path='/index' component={Ledger}> </AuthorizedRoute>
        </Main>

    };
    return <ConfigProvider locale={zhCN}>
        <DndProvider backend={HTML5Backend}>
            <Router history={history} >
                <Switch>
                    <Route exact path="/" component={FormViewList} />
                    {/* <Route path="/main" component={MainRoute} /> */}
                    <Route path="/ledger" component={LedgerList} />
                    <Route path="/ledgerIndex" component={LedgerIndex} />
                    <Route path="/dataCharts" component={DataCharts} />
                    <Route path="/formviewlist/dataSource" component={DataSource} />
                    <Route path="/formviewlist" component={FormViewList} />
                    <Route path="/webHook" component={WebHook} />
                    <Route path="/formbuilder" component={withDynamicRegRoute(FormBuilderHeader)} />
                    {/*<Route path="/BorderControls" component={BorderControls} />*/}
                    <Route path="/formrelease" component={FormRender} />
                    <Route path="/accountBook2" component={AccountBook} />
                    <Route path="/accountBook" component={FormDataTable} />
                    <Route path="/login" component={Login} />
                    <Route path="/404" component={Page404} />
                    <Redirect to="/404" />
                </Switch>
            </Router>
        </DndProvider>
    </ConfigProvider>
}
export default RouterConfig;
