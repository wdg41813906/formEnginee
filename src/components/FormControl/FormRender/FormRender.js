import React from "react";
import { Form, Spin, Select } from "antd";
import styles from "../../../routes/FormRender/FormRender.less";
import FormControlType from "../../../enums/FormControlType";
import FORMSTATUS from "../../../enums/FormStatus";
import _ from "underscore";
import { FormContext, buildControlAuthority } from "commonForm";
import AnchorCom from "./../Anchor/AnchorCom";
import TipContent from "../../../components/FormControl/TipContent/TipContent";

var lazyLayout;

//type:1预览，2提交
class FormRender extends React.Component {
    constructor(props) {
        super(props);
        this.getPanelBody = this.getPanelBody.bind(this);
        this.getPanelChild = this.getPanelChild.bind(this);
        this.renderCheck = this.renderCheck.bind(this);
        this.getItemBase = this.getItemBase.bind(this);
        this.state = {
            provider: {
                getRootFormId:this.getRootFormId,
                getPanelBody: this.getPanelBody,
                getPanelChild: this.getPanelChild,
                renderCheck: this.renderCheck,
                setProxyCall: props.setProxyCall,
                loadExternalData: props.loadExternalData,
                loadResourceData: props.loadResourceData,
                getProxyStorage: props.getProxyStorage,
                renderList: props.renderList,
                getItemBase: this.getItemBase,
                getGroupItemsValue: props.getGroupItemsValue,
                buildSubFormRowData: props.buildSubFormRowData,
                renderSubItemCell: props.renderSubItemCell,
                setTableLinker: props.setTableLinker,
                setTableLinkerFilterValue: props.setTableLinkerFilterValue,
                buildControlAuthority
            },
            visible: false,
            code: null,
            setvisible: false,
            SelectNode: null,//选择驳回的节点
            AnchorIndex: 0
        };
        // 判断当前 需不需要 获取 流水号的值，只会在 新增 且 有 流水号组件的时候才 调用
        const serialCom = props.formBody.filter(item => item.get("itemType") === "SerialNumber");
        if (serialCom.size) {
            props.getSerialNumSeed && props.getSerialNumSeed();
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.renderList.size > 0) {
            return { provider: { ...prevState.provider, renderList: nextProps.renderList } };
        }
        return null;
    }
    shouldComponentUpdate(nextProps) {
        if (this.state.provider.renderList!==nextProps.renderList){
            return true
        }
        return false;
      }

    componentDidMount() {
        this.props.form.validateFields();
        // lazyLayout = _.debounce(this._onScrollEvent, event, 1000);
    }

    handleCancel = () => {
        this.setState({
            setvisible: false
        });
    };

    _onScrollEvent = (e, top) => {
        if (e.target.id === "WindowPreview") {
            var index = 0;
            const anchorList = this.props.anchorList;
            // var top=e.target.scrollTop;
            anchorList.forEach(ele => {
                var doc = document.getElementById(ele.id + this.props.renderStyle);
                if (doc && top + 25 > doc.offsetTop) {
                    index = index + 1;
                }
            });
            if (index < 0) {
                index = 0;
            }
            if (index > anchorList.size - 1) {
                index = anchorList.size - 1;
            }
            // this.props.setAnchorIndex(index);
        }
    };

    getPanelBody(id) {
        return this.props.formBody.filter(a => a.get("container") === id).toJSON().map(a => a.toJSON());
    }

    getRootFormId = () => {
        return this.props.formBody.filter(e=>e.get('itemType')==='Root').toJSON()[0].toJSON().formId;
    }

    getPanelChild(id) {
        let l = this.props.formBody.filter(a => a.get("container") === id);
        let t = this;
        let temp = [];
        l.forEach(function(a) {
            if (a.get("formControlType") > 0) {
                temp = temp.concat(t.getPanelChild(a.get("id")));
            }
        });
        return l.toJSON().map(a => a.toJSON()).concat(temp);
    }

    renderCheck(id) {
        return this.state.provider.renderList.includes(id);
    }

    getItemBase(id) {
        return this.props.formBody.find(a => a.get("id") === id).get("itemBase");
    }

    render() {
        let {
            //anchorIndex, type, submit, anchorList, status,
            anchorIndex, anchorList,
            form, formTitle, formBody, rootContainer, formLoading,
            setValue, setValueSingle, renderStyle, reset, businessList
            //formTemplateType, taskId, optAuth, QueryResult, GetAuths,SetDynamicNodes
        } = this.props;
        const rootList = formBody.filter(a => a.get("container") == rootContainer && a.get("status") != FORMSTATUS.Delete);
        //const otherList = formBody.filter(a => a.get('container') != rootContainer && a.get('status') != FORMSTATUS.Delete);
        const { getFieldDecorator } = form;
        let formList = [];
        let usedIds = [];
        businessList.filter(a => a.position === "top").forEach(a => {
            formList.push(<div style={{ width: "100%" }} key={a.key}>{a.component}</div>);
        });
        businessList = businessList.filter(a => a.position !== "top");
        rootList.forEach((item) => {
            const C = item.toJSON();
            if (C.Component) {
                const { Component, ...other } = C;
                let pj = {
                    ...other,
                    key: C.id,
                    mode: "form",
                    getFieldDecorator,
                    renderStyle,
                    setValue,
                    setValueSingle,
                    reset
                };
                switch (C.formControlType) {
                    case FormControlType.External:
                    case FormControlType.Container:
                        pj = {
                            ...pj,
                            form
                        };
                        break;
                }
                formList.push(<C.Component {...pj} />);
                let bussinessTarget = businessList.filter(a => a.position === C.id);
                bussinessTarget.forEach(a => {
                    usedIds.push(C.id);
                    formList.push(<div style={{ width: "100%" }} key={a.key}>{a.component}</div>);
                });
            }
        });
        businessList.filter(a => !usedIds.includes(a.position)).forEach(a => {
            formList.push(<div style={{ width: "100%" }} key={a.key}>{a.component}</div>);
        });
        return <FormContext.Provider value={this.state.provider}>
            {/*onScrollCapture={e => lazyLayout(e, e.target.scrollTop)}*/}
            <Form id="formPreview"
                  className="login-form" style={{ display: "flex", flexFlow: "column", height: "100%" }}>
                <Spin spinning={formLoading} id='WindowPreview' tip='加载中...' wrapperClassName={styles.spin}>
                    {/*<TipContent />*/}
                    {
                        anchorList && anchorList.toJS().length ?
                            <AnchorCom
                                allCollapseToggle={this.props.allCollapseToggle}
                                anchorIndex={anchorIndex}
                                renderStyle={renderStyle}
                                anchorList={anchorList}
                                setAnchorIndex={this.props.setAnchorIndex}
                            >
                            </AnchorCom> : null
                    }
                    <div style={{
                        display: "flex",
                        width: " 280px",
                        position: "absolute",
                        right: "24px",
                        alignItems: "center "
                    }}>
                        {/*<div>语言切换 <span style={{ padding: "0 5px" }}> : </span></div>*/}
                        {/*<Select defaultValue={config.defaultLang || "zhcn"} style={{*/}
                        {/*width: "200px"*/}
                        {/*}}*/}
                        {/*onChange={this.props.applyLang}*/}
                        {/*>*/}
                        {/*{*/}
                        {/*config.langList.map(a => <Select.Option key={a.key}*/}
                        {/*value={a.key}>{a.name}</Select.Option>)*/}
                        {/*}*/}
                        {/*</Select>*/}
                    </div>
                    <div className={styles.wrapper}>
                        <div className={styles.form}>
                            <div className={styles.form_header}>{formTitle}</div>
                            <div className={styles.form_body} style={{
                                display: this.props.formLayout != 1 ? "flex" : ""
                            }}>
                                {formList}
                            </div>
                        </div>
                    </div>
                </Spin>
                {this.props.children}
            </Form>
        </FormContext.Provider>;
    }
}


export default Form.create()(FormRender);
