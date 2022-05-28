import request from '../../utils/request';//fetch请求库
import { } from "antd";//ui库

export default {
    name: "业务组件名称",
    key: '业务组件key',
    //挂载检测 
    //query:object url链接参数  
    //返回值 bool，true为挂载，false为不挂载
    loadCheck: ({ query }) => {
        return query.formTemplateType === "1";
    },
    //表单数据加载后调用
    //query:object url链接参数
    //proxyState：object 代理存储的state
    //setPermission:function({hidden:[],show:[],disabled:[],readOnly:[]}) 设置权限
    //setSubmitInfo:function([{ name,triggerType,params }]) 设置提交按钮
    //setProxyState：function({}) 设置proxyState：object用法类似于setState
    //formDataModel:object 表单数据模型
    onLoaded: ({ query, proxyState, setPermission, setSubmitInfo,
        setProxyState, formDataModel }) => {
    },
    //校验回调 返回   {success::bool,msg::string}  success=false 中止提交
    onAuthority: ({ proxyState, formDataModel }) => {
        return {
            success: true
        };
    },
    //提交前回调 返回  {success::bool,msg::string}  success=false 中止提交
    //params 对应setSubmitInfo中的params
    beforeSubmit: ({ params, proxyState, formDataModel, setProxyState }) => {
        return {
            success: true
        };
    },
    //按钮回调 triggerType为 'click'
    onClick: ({ query, params, proxyState, setProxyState }) => {
    },
    //按钮回调 triggerType为 'submit' 返回  {success::bool,msg::string}  success=false 提交失败
    onSubmit: async ({ params, proxyState, submitData, query, setProxyState }) => {
        return {
            success: true,
            msg: result.data.msg
        };
    },
    //需要显示在表单尾部的业务组件 proxyState将会附加到组件渲染的prop中
    components: (props)=><p>业务组件</p>, //ApprovalSteps,
    //初始化proxyState
    initialProxyState: {
        visible: false
    }
};
