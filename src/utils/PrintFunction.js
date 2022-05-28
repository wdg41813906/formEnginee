/**
 * @file
 * @author: fanty
 *
 *  返回打印的接口
 */
/**
 * 打印预览封装的函数
 * @constructor
 */
export const PrintPreview = () => {
    const print = new SYLaunch();
    print.gppPluginPreview();
};

export const PrintDesign = () => {
    const print = new SYLaunch();
    print.gppDesigner();
};
