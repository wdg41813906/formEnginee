import Exception from 'ant-design-pro/lib/Exception';

const WithHocRoute = (props) => {
    let { authority, children, authSelf } = props;
    return (
        authority.indexOf(authSelf) > -1 ?
            children
            :
            <Exception type="403" actions={<div></div>} />
    )
}


export default WithHocRoute