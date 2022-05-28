import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

class AuthorizedRoute extends React.Component {

  componentWillMount() {
    //getLoggedUser()
  }

  render() {
    const { component: Component, pending, logged, ...rest } = this.props

    return (
      <Route {...rest} render={props => {
            return  <Component {...props} />
      }} />
    )
  }
}

const stateToProps = ({ ledger }) => ({
    ledger
})


export default connect(stateToProps)(AuthorizedRoute)
