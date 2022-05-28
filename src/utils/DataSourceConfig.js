//数据格式
const formaterList = [
    { value: 0, name: '默认' },
    { value: 1, name: '数字' },
    { value: 2, name: '货币' },
    { value: 3, name: '日期' },
    { value: 4, name: '百分比' }
]
//控件类型
const controlTypeList = [
    { value: 'SingleText', name: '单行文本' },
    { value: 'MutiText', name: '多行文本' },
    { value: 'DateTime', name: '日期时间' },
    { value: 'Number', name: '数字' }
]
//请求类型
const sourceTypeList = [
    { value: 0, name: '表单' },
    { value: 1, name: '校验' }
]
//请求方式
const methodTypeList = [
    { value: 0, name: 'Get' },
    { value: 1, name: 'Post' }
]
//传输类型
const requestTypeList = [
    { value: 0, name: 'Body' },
    { value: 1, name: 'URL' },
    { value: 2, name: 'Header' }
]
//参数类型
const parameterTypeList = [
    { value: 0, name: '动态' },
    { value: 1, name: '固定' },
    { value: 2, name: '第三方系统' }
]
//接口模式
const interfaceModeList = [
    { value: 0, name: '获取' },
    { value: 1, name: '推送' },
    { value: 2, name: '校验' },
    { value: 3, name: '事件' }
]

module.exports = {
    formaterList,
    controlTypeList,
    sourceTypeList,
    methodTypeList,
    requestTypeList,
    parameterTypeList,
    interfaceModeList
}

