import { Steps, Icon, Collapse, Input, Tooltip, message, Modal, Select, Switch } from "antd";
import SysImage from "../../components/FormControl/SysImage";
import { GetAuths, LaunchWorkflow, MissionSuccess, Workflow } from "../../services/Workflow/Workflow";


export default {
    name: "影像系统",
    summary: "影像系统",
    key: "SysImages",
    fieldAuth: [{ name: "查看影像", key: "SysImages_CheckImage" }, {
        name: "文件列表",
        key: "SysImages_FileList"
    }, { name: "缺少影像", key: "SysImages_Defect" }],
    onLoaded: async ({
                         query, proxyState, setPermission, setSubmitInfo,
                         setProxyState, readOnly, workFlowId, formInstanceId, instType
                     }) => {
        setProxyState({
            query: query,
            readOnly,
            instType,
            formInstanceId: formInstanceId
        });
        return new Promise(resolve => {
            fetch(`${config.systemImage}/api/LoadImages?documentid=${formInstanceId}`, {
                method: "GET",
                mode: "cors",
                traditional: true
            }).then(res => {
                if (res.ok) {
                    console.log(res.clone().json());
                    res.clone().json().then(r => {
                        r.map((item, index) => {
                            item.key = index;
                            item.order = index + 1;
                            item.FileSize = (item.FileSize || 0) / 1024;
                        });
                        resolve(r);
                    });
                }
            });
        }).then(r=>{
            setProxyState({
                SysImageData:r
            });
        })


    },
    //控件注入
    components: SysImages,
    initialProxyState: {
        SysImageData: []
    }
};


function SysImages(props) {
    return <React.Fragment>
        {
            props.proxyState.formInstanceId ?
                <SysImage authority={props.authority} SysImageData={props.proxyState.SysImageData}
                          proxyState={props.proxyState}/> : null
        }
    </React.Fragment>;
}
