import React from "react";
import FormControlType from "../../enums/FormControlType";
import FORM_RENDER_STYLE from "../../enums/FormRenderStyle";
import styles from "./FormBase.less";
import "./FormBase.less";
import { buildControlAuthority } from "commonForm";
//传递到后端的数据结构
// let a = {
//     employeeDataPermissionRequest: [{
//         id: '',
//         moduleId: '',
//         employeeId: '',//roleId organizationId
//         //操作权限
//         operation: JSON.stringify(['add', 'modify']),
//         //字段权限
//         formItem: JSON.stringify({
//             hidden: ['', '', '', '', '', '', '', '', ''],
//             disabled: ['', '', '', '', '', '', '', '', '']
//         }),
//         //数据权限
//         data: JSON.stringify([{ id: '', valueType: '', condition: '0', params: [1, 2, 3] }]),
//         dataCode: {
//             id: "7efe8d39-894e-199c-76c6-81acbc671960",//表单模板id
//             formTemplateVersionId: "4df720b6-525b-4bd3-808a-9b6b1ff9422c",//表单模板版本id
//             fieldArr: ["9c0354ef-3fe2-0da3-0a6e-1c0206137031"],//需要查询的列的id集合
//             conditionContainer: [//过滤条件集合
//                 {
//                     id: "2ab650f0-339a-d78e-9e9f-0cae90fef6c6",//需要使用条件表达式的列id。
//                     condition: "{0} > '10'",//表达式模板
//                 },
//                 {
//                     id: "9c0354ef-3fe2-0da3-0a6e-1c0206137031",
//                     condition: "{0} > '4000'",
//                     extendedType: 0//数字类型，0表示 与(and)运算，1表示或(or)运算
//                 },
//                 {
//                     id: "9c0354ef-3fe2-0da3-0a6e-1c0206137031",
//                     extendedType: 0,
//                     condition: "{0} {dynamic}", // {0}后面不加>、<、或between关键字，而是直接跟上一个{dynamic}，由后台根据传入的PeransType和Value的值来动态生成后面的语句，将{dynamic} 替换掉
//                     paramsType: 3, // 表达式操作的数据类型 0表示数字 1表示字符串 2表示bool 3表示 时间标识（近一天、近一月、近三月、近六月）4表示日期
//                     value: "6", // ParamsType指定的是时间标识，Value就是一个特殊值，后台根据Value的值计算出“上月”的时间起点和终点来生成sql语句
//                 }
//             ]
//         },
//     }],
//     organizationDataPermissionRequest: [],
//     roleDataPermissionRequest: []
// };
//前端渲染的数据结构
// let b = [{
//     id: '',//机构 职责 人员 id
//     type: 0,//0机构 1职责 2人员
//     //操作权限
//     operation: [{
//         formId: '',//表单id
//         formName: '',//表单名称
//         formType: '',//0主表 1字表
//         keys: ['add', 'modify']//包含的操作关键字
//     }],
//     //字段权限
//     formItem: [
//         {
//             id: '',
//             formId: '',
//             valueType: '',
//             name: '',
//             hidden: false,
//             disabled: false
//         }
//     ],
//     //数据权限
//     data: [{ id: '', valueType: '', condition: '0', params: [1, 2, 3] }],
// }]
// let dateValue = [{
//     title: '固定值',
//     value: "0",
//     key: '0',
// }, {
//     title: '今天',
//     value: 1,
//     key: '1',
// }, {
//     title: '昨天',
//     value: 2,
//     key: '2',
// }, {
//     title: '本周',
//     value: 3,
//     key: '3',
// }, {
//     title: '上周',
//     value: 4,
//     key: '4',
// }, {
//     title: '本月',
//     value: 5,
//     key: '5',
// }, {
//     title: '上月',
//     value: 6,
//     key: '6',
// }]

// let conditionMap = [
//     { name: ['等于任意一个'], condition: 0, valueTypes: ['string', 'select'], toCode: params => `{0} in (${params.map(a => `'${a}'`).toString()})` },
//     { name: ['不等于任意一个'], condition: 1, valueTypes: ['string', 'select'], toCode: params => `{0} not in (${params.map(a => `'${a}'`).toString()})` },
//     { name: ['为空'], condition: 2, valueTypes: ['string', 'number', 'date', 'location'], toCode: () => `{0} is null` },
//     { name: ['不为空'], condition: 3, valueTypes: ['string', 'number', 'date', 'location'], toCode: () => `{0} is not null` },
//     { name: ['等于'], condition: 4, valueTypes: ['string', 'number', 'date'], toCode: params => `{0} = ${params[0]}` },
//     { name: ['不等于'], condition: 5, valueTypes: ['string', 'number', 'date'], toCode: params => `{0} <> ${params[0]}` },
//     { name: ['大于'], condition: 6, valueTypes: ['number'], toCode: params => `{0} > ${params[0]}` },
//     { name: ['大于等于'], condition: 7, valueTypes: ['number', 'date'], toCode: params => `{0} >= ${params[0]}` },
//     { name: ['小于'], condition: 8, valueTypes: ['number'], toCode: params => `{0} < ${params[0]}` },
//     { name: ['小于等于'], condition: 9, valueTypes: ['number', 'date'], toCode: params => `{0} <= ${params[0]}` },
//     { name: ['选择范围'], condition: 10, valueTypes: ['number', 'date'], toCode: params => `{0} between '${params[0]}' and '${parms[1]}'` },
//     { name: ['包含'], condition: 11, valueTypes: ['string'], toCode: params => `{0} like %'${params[0]}'%` },
//     { name: ['不包含'], condition: 12, valueTypes: ['string'], toCode: params => `{0} not like %'${params[0]}'%` },
//     { name: ['属于'], condition: 13, valueTypes: ['location'], toCode: params => `{0} = '${params[0]}'` },
//     { name: ['不属于'], condition: 14, valueTypes: ['location'], toCode: params => `{0} <> '${params[0]}'` }
// ]


//表单控件基类
function FormBase(Wrapper) {
    class Base extends React.Component {
        constructor(props) {
            super(props);
            this.onChange = this.onChange.bind(this);
            this.setDataLinker = this.setDataLinker.bind(this);
            this.removeDataLinker = this.removeDataLinker.bind(this);
            this.setDisabled = this.setDisabled.bind(this);
            this.setHidden = this.setHidden.bind(this);
            this.getDisabled = this.getDisabled.bind(this);
            this.getHidden = this.getHidden.bind(this);
            this.getAuthority = this.getAuthority.bind(this);
        }

        onChange(data) {
            let proxyIndex = this.props.proxyIndex;
            if (isNaN(proxyIndex))
                proxyIndex = -1;
            this.props.setValueSingle(this.props.id, data, proxyIndex);
        }

        setLangValue = (lang, value) => {
            this.props.setLangValue(this.props.id, lang, value);
        };

        setDataLinker(dataLinker) {
            this.props.setDataLinker(this.props.id, dataLinker);
        }

        removeDataLinker(filter) {
            this.props.removeDataLinker(this.props.id, filter);
        }

        setDisabled(value) {
            this.props.setAuthority(this.props.id, "disabled", "itemBase", value);
        }

        setHidden(value) {
            this.props.setAuthority(this.props.id, "hidden", "itemBase", value);
        }

        getAuthority(key) {
            return this.props.authority.getIn([key, "itemBase"]) || false;
        }

        getDisabled() {
            return this.getAuthority("disabled");
        }

        getHidden() {
            return this.getAuthority("hidden");
        }

        render() {
            //console.log('formBase render', this.props, this.props.itemBase.toJS());
            let {
                setValue, setValueSingle, formControlType, setAuthority,
                border, authority, ...other
            } = this.props;
            other = { ...other, ...buildControlAuthority(authority.toJS()), buildControlAuthority };
            if (this.props.mode === "option") {
                other = {
                    ...other,
                    //linkFormList: this.props.linkFormList,
                    //thirdPartyList: this.props.thirdPartyList,
                    linkFormDetail: this.props.linkFormDetail || [],
                    currentFormData: this.props.currentFormData.toJS(),
                    //foreignFormData: this.props.foreignFormData,
                    setDataLinker: this.setDataLinker,
                    removeDataLinker: this.removeDataLinker
                };
            }
            let defaultWidth, renderStyle = other.renderStyle,
                hidden = other.hidden && renderStyle !== FORM_RENDER_STYLE.Design,
                className = renderStyle === FORM_RENDER_STYLE.Design && other.hidden ? `${styles.designHidden} designShow` : formControlType === FormControlType.Container ? "designShow" : null;
            // 临时加的，看到时候怎么改
            switch (formControlType) {
                case FormControlType.Container:
                case FormControlType.External:
                    other.setValue = setValue;
                    other.setValueSingle = setValueSingle;
                    defaultWidth = "100%";
                    break;
                case FormControlType.Group:
                    other.setValueSingle = setValueSingle;
                    if (this.props.mode === "option") {
                        other.setItemDataLinker = this.props.setDataLinker;
                        other.removeItemDataLinker = this.props.removeDataLinker;
                    }
                case FormControlType.Item:
                default:
                    switch (Number(other.formLayout)) {
                        case 1:
                            defaultWidth = "100%";
                            break;
                        case 2:
                            defaultWidth = "50%";
                            break;
                        case 3:
                            defaultWidth = "33.3%";
                            break;
                        case 4:
                            defaultWidth = "25%";
                            break;
                    }


                    // defaultWidth = other.formLayout == 1 ? "100%" : "50%";
                    break;
            }

            switch (this.props.mode) {
                case "tableHeader":
                    return hidden ? null :
                        <th style={{ padding: 0, opacity: other.hidden ? 0.5 : 1 }} colSpan={this.props.colSpan}
                            rowSpan={this.props.rowSpan}>
                            <Wrapper {...other} formControlType={formControlType} onChange={this.onChange}/></th>;
                case "form":
                    const { width, left, right } = other.itemBase.toJS();
                    return hidden ? null :
                        //分割线不受 容器模式的表单控件 单双列影响切独自占一行单收长宽设置限制
                        other.itemBase.toJS().type === "HrLine" || this.props.containerMode === true ?
                            <div id={other.id} key={other.id} style={{ width: "100%" }}>
                                <div className={className}
                                     style={other.renderStyle === FORM_RENDER_STYLE.PC || other.renderStyle === FORM_RENDER_STYLE.Design ?
                                         {
                                             width: "100%",//width || defaultWidth,
                                             marginLeft: left,
                                             marginRight: right,
                                             float: right && right == "0" ? "right" : "left",
                                             border: border ? "1px solid" + border : "none",
                                             clear: "both"
                                         } : null}>
                                    <Wrapper {...other} formControlType={formControlType} onChange={this.onChange}/>
                                </div>
                            </div> :
                            <div id={other.id} key={other.id}
                                 className={className}
                                 style={other.renderStyle === FORM_RENDER_STYLE.PC || other.renderStyle === FORM_RENDER_STYLE.Design ?
                                     {
                                         width: width || defaultWidth,
                                         marginLeft: left,
                                         marginRight: right,
                                         float: right && right == "0" ? "right" : "left",
                                         border: border ? "1px solid" + border : "none",
                                         clear: "both"
                                     } : null}>
                                <Wrapper {...other} formControlType={formControlType} onChange={this.onChange}/>
                            </div>;
                case "cell":
                case "table":
                    return hidden ? null :
                        <Wrapper {...other} formControlType={formControlType} onChange={this.onChange}/>;
                case "option":
                default:
                    return <Wrapper  {...other} authority={authority.toJS()} setDisabled={this.setDisabled}
                                     setHidden={this.setHidden}
                                     getDisabled={this.getDisabled} getHidden={this.getHidden}
                                     formControlType={formControlType} setLangValue={this.setLangValue}
                                     onChange={this.onChange}/>;
            }
        }
    }

    return Base;
}

export default FormBase;
