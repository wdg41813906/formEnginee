import React from 'react'
import { Switch, Route, Redirect, Link } from 'react-router-dom'
import dynamic from 'dva/dynamic';
class Test1 extends React.Component {
    render() {
        return (<div>test1
              <Link to={{
                pathname: '/main/ledger/ledgerIndex'
            }}>to</Link>
        </div>)
    }
}
class Test2 extends React.Component {
    render() {
        return (<div>test2</div>)
    }
}

// const LedgerIndex = dynamic({
//     app,
//     namespace: 'ledgerIndex',
//     models: () => [import('../../../models/Dashboard/Ledger/LedgerIndex')],
//     component: () => import('./../Ledger/LedgerIndex'),
//   });

//   const LedgerList = dynamic({
//     app,
//     namespace: 'ledgerList',
//     models: () => [import('../../../models/Dashboard/Ledger/LedgerList')],
//     component: () => import('./LedgerList'),
//   });
const Ledger = ({match}) => {

return(
    <div>
        <Switch>
            <Route path={`${match.path}`} exact component={Test1} />
            <Route path={`${match.path}/ledgerIndex`} component={Test2} />
            <Redirect to={`${match.url}`} />
        </Switch>
    </div>
)
}

export default Ledger;