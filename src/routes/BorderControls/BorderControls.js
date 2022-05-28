import React from "react";
import { connect } from "dva";
import { Spin, Alert } from "antd";
import queryString from "query-string";
import { GetByWorkFlowId } from "../../services/Workflow/Workflow";
import "./BorderControls.less";

let count = 0;

export default class BorderControls extends React.Component {
    constructor(props) {
        super(props);
        let query = queryString.parse(props.history.location.search);
        if (query.sourceType) {
            window.addEventListener("message", this.eventListener, false);
        } else {
                this.props.history.push(`accountBook?${queryString.stringify(query)}`);
            
            // props.dispatch({
            //     type: "BorderControls/Security",
            //     payload: {
            //         UrlData: query
            //     }
            // });
        }
    }
    
    componentDidMount() {
    
    }
    
    // eventListener = (event) => {
    //     if (count < 3) {
    //         count++;
    //         console.log("addEventListener");
    //         let query = queryString.parse(this.props.history.location.search);
    //         this.props.dispatch({
    //             type: "BorderControls/Security",
    //             payload: {
    //                 UrlData: query,
    //                 parentUrl: event.data.parentUrl
    //             }
    //         });
    //     }
    // };
    eventListener = (event) => {
        if (count < 3) {
            count++;
            console.log("addEventListener");
            let query = queryString.parse(this.props.history.location.search);
            GetByWorkFlowId({
                workflowid: query.wfInstanceId,
                PlatForm: "NPF"
            }).then(res => {
                if (res.data.formTemplateVersionId) {
                    props.history.push(`/formrelease?${queryString.stringify(query)}&tabId=${data.formTemplateVersionId}&inst=${data.formInstanceId}&moduleId=${data.moduleId}&parentUrl=${event.data.parentUrl}`);
                }
            });
        }
    };
    
    
    render() {
        // if (this.props.BorderControls.url) {
        //     this.props.history.push(this.props.BorderControls.url);
        // }
        return <div className='BorderControls'>
            <Spin tip="加载中...">
                <Alert style={{ height: "0" }}
                    // message="当前页面会进行数据处理并跳转"
                       type="info"
                />
            </Spin>
        </div>;
    }
}


function mapStateToProps({ BorderControls }, props) {
    return { BorderControls };
}


// export default connect(mapStateToProps)(BorderControls);
