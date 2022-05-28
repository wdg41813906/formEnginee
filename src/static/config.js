const langList = [{
    key: "zhcn",
    name: "简体中文"
},
    {
        key: "en",
        name: "英文"
    }
];
// module.exports =
const config = Object.freeze({
    langList,
    defaultLang: "zhcn",//默认语言
    name: "表单引擎",
    footerText: "表单引擎",
    logoSrc: "https://t.alipayobjects.com/images/rmsweb/T1B9hfXcdvXXXXXXXX.svg",
    logoText: "表单引擎",
    needLogin: true,
    pageSize: 10,
    fileServer: "http://171.221.227.116:21862",
    serverInvoiceAssistantApiIp: "http://cd.sysdsoft.cn:7316/InvoiceAssistant/api",
    serverInvoiceAssistantOpenApiIp: "http://cd.sysdsoft.cn:7316/InvoiceAssistantOpenApi/api",
    //环境配置
    serverIp: "http://cd.sysdsoft.cn:7316/FormEngine/api",
    serverOpenApiIp: "http://cd.sysdsoft.cn:7316/OpenApi/api",
    serverPermissionApiIp: "http://cd.sysdsoft.cn:7316/Permission/api",
    serverPrintIp: "http://171.221.227.116:7309",
    workFlowhttp: "http://cd.sysdsoft.cn:7317",
    fileAdd: "http://171.221.227.116:7309",
    tenantID: "2c9e80826ea5c39d016ef3b1c7420010", //租户ID,
    appID: "2c9e80826ea5c39d016ef3b1c7420010", //应用ID,
    encryptionSecret: "3a4bc96847166109fbd665d46848a2ab", //密匙
  
    //业务组件
    VoucherFormserverIp: "http://171.221.227.116:7305",
    systemImage: "http://171.221.227.116:50102",//影像系统
    //影像插件下载地址
    systemImageAdd: "http://171.221.227.116:39011/",
    budgetCost: "http://171.221.227.116:7307",//预算
    MutexResult: "http://171.221.227.116:7313",//
    esignatureAdd: "http://cd.sysdsoft.cn:7309",//签名地址

    //打印粘贴单配置文件
    Code: "V1.0001",
    OrgId: "cc2a241f-66e1-4a24-b37c-10cddb83add9"
});

// serverIp: 'http://127.0.0.1:5001/api',
// serverOpenApiIp: 'http://127.0.0.1:5006/api',
// serverPermissionApiIp: 'http://127.0.0.1:5002/api',

//------sql内网--------

// serverIp: 'http://192.168.0.218:5001/api',
// serverOpenApiIp: 'http://192.168.0.218:5006/api',
// serverPermissionApiIp: 'http://192.168.0.218:5002/api',

//-------sql外网---------

// serverIp: 'http://171.221.227.116:21872/api',
// serverOpenApiIp: 'http://171.221.227.116:21874/api',
// serverPermissionApiIp: 'http://171.221.227.116:21873/api',

//-------oracle内网--------

// serverIp: 'http://192.168.0.218:5101/api',
// serverOpenApiIp: 'http://192.168.0.218:5106/api',
// serverPermissionApiIp: 'http://192.168.0.218:5102/api',

//-------oracle外网---------
// serverIp: 'http://171.221.227.116:21875/api',
// serverOpenApiIp: 'http://171.221.227.116:21877/api',
// serverPermissionApiIp: 'http://171.221.227.116:21876/api',
