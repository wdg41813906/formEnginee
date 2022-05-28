import React from 'react';
import { Button } from 'antd';
import Exception from 'ant-design-pro/lib/Exception';


class Page404 extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        // console.log(this)
        const actions = (
            <div>
                <Button type="primary" onClick={()=>{this.props.history.replace({pathname:'/main'})}}>返回首页</Button>
            </div>
        );
        return (
            <Exception type="404" actions={actions} />

        )
    }
}
export default Page404;