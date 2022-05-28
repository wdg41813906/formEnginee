import React from "react";
import { connect } from "dva";
import queryString from "query-string";
import BusinessEventCom from "../../components/BusinessEvent/List";

function BusinessEvent(props) {
    let { dispatch, history, businessEvent, location } = props;
    let { data, dataSource, formPageInfo, isloading, visible, btnLoading, modifyData, notifyData, notifyVisible, notifyPageInfo, retryStatus } = businessEvent;
    let query = queryString.parse(props.history.location.search);
    let formTemplateId = query.formTemplateId;

    const businessEventComProps = {
        history,
        dispatch,
        data,
        dataSource,
        formPageInfo,
        isloading,
        visible,
        formTemplateId,
        btnLoading,
        modifyData,
        notifyData,
        notifyVisible,
        notifyPageInfo,
        retryStatus,
        getBusinessEventList(params) {
            let queryJson = {
                pageIndex: params.current,
                pageSize: params.pageSize,
                formTemplateId
            };
            dispatch({
                type: "businessEvent/getBusinessEventList",
                payload: queryJson
            });
        },
        dataSourceGetAll() {
            dispatch({
                type: "businessEvent/GetAllWithEvent",
            });
        },
        showModal() {
            dispatch({
                type: "businessEvent/showModal",
            });
        },
        modifyShowModal(id) {
            dispatch({
                type: "businessEvent/modifyShowModal",
                payload: id
            });
        },
        newBusinessEvent(data, type) {
            dispatch({
                type: "businessEvent/newBusinessEvent",
                payload: { data, formTemplateId, type }
            });
        },
        delBusinessEvent(id) {
            dispatch({
                type: "businessEvent/delBusinessEvent",
                payload: { id, formTemplateId }
            });
        },
        notifyHistoryShowModal(params) {
            let queryJson = {
                pageIndex: params.current,
                pageSize: params.pageSize,
                BusinessEventId: params.id,
                show: params.show
            };
            dispatch({
                type: "businessEvent/notifyHistoryShowModal",
                payload: queryJson
            });
        },
        notifyShowModal() {
            dispatch({
                type: "businessEvent/notifyShowModal",
            });
        },
        retry(id, notifyid, params) {
            dispatch({
                type: "businessEvent/businessEventNotifyHistoryRetry",
                payload: { id, notifyid, params }
            });
        }
    };
    return (
        <React.Fragment>
            <BusinessEventCom {...businessEventComProps} />
        </React.Fragment>
    );
}

function mapStateToProps({ businessEvent }) {
    return {
        businessEvent
    };
}
export default connect(mapStateToProps)(BusinessEvent);
