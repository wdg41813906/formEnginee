import { GetByWorkFlowId } from "../../services/Workflow/Workflow";
import queryString from 'query-string';

export default {
    namespace: 'BorderControls',
    state: {},
    subscriptions: {},
    effects: {
        * Security(action, { select, call, put }) {
            const { UrlData } = action.payload
            if (UrlData.sourceType) {
                const { data } = yield call(GetByWorkFlowId, {
                    workflowid: UrlData.wfInstanceId,
                    PlatForm:"NPF"
                })
                if (data.formTemplateVersionId) {
                    yield put({
                        type: 'setUrl',
                        url: `/formrelease?${queryString.stringify(UrlData)}&tabId=${data.formTemplateVersionId}&inst=${data.formInstanceId}&moduleId=${data.moduleId}&parentUrl=${action.payload.parentUrl}`
                    })
                    //yield put(routerRedux.replace(`/formrelease?${queryString.stringify(UrlData)}&tabId=${data.formTemplateVersionId}&inst=${data.formInstanceId}&moduleId=${data.moduleId}&parentUrl=${action.payload.parentUrl}`))
                    // yield put(routerRedux.replace(`/formrelease?feopapi1=${action.feopapi1}&
                    // feopapi2=${action.feopapi2}&
                    // platform=${action.platform}&
                    // formTemplateType=${action.FormTemplateType}&
                    // userId=${action.userId}&
                    // dutyId=${action.dutyId}&
                    // formTemplateId=${action.FormTemplateID}&
                    // wfInstanceId=${action.wfInstanceId}&
                    // taskId=${action.taskId}&
                    // state=${action.state}&
                    // sourceType=${action.sourceType}&tabId=${data.formTemplateVersionId}&inst=${data.formInstanceId}&moduleId=${data.moduleId}`))
                }
            } else {
                yield put({
                    type: 'setUrl',
                    url: `accountBook?${queryString.stringify(UrlData)}`
                })
                //yield put(routerRedux.replace(`accountBook?${queryString.stringify(UrlData)}`))
                // yield put(routerRedux.replace(`accountBook?tabId=${action.tabId}&formTemplateId=${action.formTemplateId}&formTemplateType=${action.formTemplateType}&moduleId=${action.moduleId}&userId=${action.userId}&userOrgDutyId=${action.userOrgDutyId}&feopapi1=${action.feopapi1}&feopapi2=${action.feopapi2}&platform=${action.platform}`))
            }
        }
    },
    reducers: {
        setUrl(state, { url }) {
            return { ...state, url }
        }
    }
}
