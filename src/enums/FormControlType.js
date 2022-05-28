//表单控件类型
const FORM_CONTROL_TYPE = Object.freeze({
    GroupItem: -3, ///表单项组成员
    None: -2, //无
    System: -1, //系统
    Item: 0, //表单项
    Group: 1, //表单项组
    Container: 2, //容器
    External: 3, //外联
    Mark: 4
});
export default FORM_CONTROL_TYPE;
