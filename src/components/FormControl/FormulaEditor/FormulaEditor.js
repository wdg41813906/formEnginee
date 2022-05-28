import React from "react";
import { Row, Col, List, Collapse, Tabs, message, Spin } from "antd";
import formulas from "../../Hint/Formulas";
import { UnControlled as CodeEditor } from "react-codemirror2";
import FormTemplateList from "./FormTemplateList";
import { getAllFormLinkData, getAllFormTemplatePaged } from "../../../services/FormBuilder/FormBuilder";
import { initControlExtra, buildLinkFormList } from "commonForm";

require("codemirror/lib/codemirror.css");
require("codemirror/addon/hint/show-hint.css");
// require('codemirror/theme/material.css');

require("codemirror/addon/hint/show-hint.js");
require("../../../components/Hint/Formula-hint.js");
require("../../../components/Hint/Formula.js");

import styles from "./FormulaEditor.less";
//控件扩展属性映射
const controlExtraList = ["valueType", "formControlType", "event"];

const TabPane = Tabs.TabPane;
let timeout;

class FormulaEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value,
            desc: "请从左侧面板选择字段名和函数，或输入函数",
            exp: null,
            func: null,
            name: null,
            currentFuncItem: null,
            fid: this.props.fid,
            //表单列表
            FormName: "",
            pageIndex: 1,
            pageSize: 20,
            scrollLoad: true,
            completed: true,
            SearchCompleted: true,
            formTemplateList: [],
            newFormTemplateList: [],
            foreignFormData: [],
            linkFormDetail: [],
            controlExtra: initControlExtra(controlExtraList)
        };
        this.showDesc = this.showDesc.bind(this);
        this.addFormulaFunction = this.addFormulaFunction.bind(this);
    }
    
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.fid != prevState.fid)
            return { value: nextProps.value, fid: nextProps.fid };
        else
            return null;
    }
    
    formatFormula(editor) {
        let FilFormTemplateList = [];
        // console.log(this.state.formTemplateList);
        
        if (this.state.formTemplateList.length) {
            this.state.formTemplateList.forEach(item => {
                FilFormTemplateList = FilFormTemplateList.concat(item.areas.concat(item.fields).filter(item => item.status === -1));
            });
            //FilFormTemplateList = this.state.formTemplateList[0].areas.concat(this.state.formTemplateList[0].fields).filter(item => item.status === -1);
        }
        let current = this.props.currentFormData;
        let foreign = this.state.foreignFormData;
        if (editor == undefined)
            editor = this.state.editor;
        editor.getAllMarks().forEach(function(e, i) {
            e.clear();
        });
        let marks = [];
        editor.eachLine(function(line) {
            let lineNum = editor.getLineNumber(line);
            let text = line.text;
            if (text.indexOf("\u2800") > -1) {
                let ary = text.split("\u2800");
                for (let i = 0, j = ary.length; i < j; i++) {
                    if (i % 2 == 1) {
                        let bg = 0;
                        for (let k = 0; k < i; k++) {
                            bg += ary[k].length + 1;
                        }
                        let ed = bg + ary[i].length + 1;
                        marks.push({
                            begin: { line: lineNum, ch: bg - 1 },
                            end: { line: lineNum, ch: ed },
                            id: ary[i].replace("foreign", ""),
                            foreign: ary[i].indexOf("foreign") > 0
                        });
                    }
                }
            }
        });
        marks.forEach(function(e, i) {
            let sp = document.createElement("span");
            let exist = current.find(a => a.id == e.id);
            if (exist === undefined) {
                exist = foreign.find(a => a.id == e.id);
            }
            let a = `CodeMirror-FEle2`;
            let b = `CodeMirror-FEle`;
            if (FilFormTemplateList) {
                // console.log(FilFormTemplateList);
                FilFormTemplateList.forEach(_item => {
                    if (e.id === _item.id) {
                        a = `${a} Del-str`;
                        b = `${b} Del-str`;
                    }
                });
            }
            sp.className = e.foreign ? a : b;
            sp.innerText = exist ? exist.name : "...";
            editor.markText(e.begin, e.end, { replacedWith: sp });
        });
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        let v = !(
            this.state.fid == nextState.fid && this.state.desc == nextState.desc
        );
        if (v) {
            this.state.editor.preCursor = this.state.editor.getCursor();
        }
        if (!v) {
            return this.state.value === nextState.value;
        }
        return v;
    }
    
    componentDidMount() {
        if (this.props.relationTables.length > 0) {
            this.setState({
                completed: false
            });
            getAllFormLinkData({
                EntityIdList: this.props.relationTables
            }).then(res => {
                let r = buildLinkFormList(res.data, this.state.controlExtra);
                if (r.linkFormList.length > 0) {
                    this.setState({
                        newFormTemplateList: r.linkFormList,
                        formTemplateList: r.linkFormList,
                        foreignFormData: r.foreignFormData,
                        completed: true
                    });
                }
            });
        }
        // else {
        //     this.setState({
        //         formTemplateList: ["1"]
        //     });
        // }
        // getAllFormTemplatePaged({
        //     FormName: this.state.FormName,
        //     pageIndex: this.state.pageIndex,
        //     pageSize: this.state.pageSize
        // }).then(res => {
        //     let r = buildLinkFormList(res.data.formTemplateList, this.state.controlExtra);
        //     let {formTemplateList} = this.state
        //     let {linkFormList, foreignFormData} = r
        //     let hash = {};
        //     let filLinkFormList = formTemplateList.concat(linkFormList).reduce((item, next) => {
        //         hash[next.id] ? '' : hash[next.id] = true && item.push(next);
        //         return item
        //     }, [])
        //     this.setState({
        //         formTemplateList: filLinkFormList,
        //         foreignFormData: foreignFormData
        //     })
        // })
        // }
        
        
    }
    
    InitFormList = (search) => {
        this.setState({
            SearchCompleted: false
        }, () => {
            getAllFormTemplatePaged({
                FormName: this.state.FormName,
                pageIndex: this.state.pageIndex,
                pageSize: this.state.pageSize
            }).then(res => {
                let r = buildLinkFormList(res.data.formTemplateList, this.state.controlExtra);
                let { formTemplateList } = this.state;
                let { linkFormList, foreignFormData } = r;
                let hash = {};
                let filLinkFormList = formTemplateList.concat(linkFormList).reduce((item, next) => {
                    hash[next.id] ? "" : hash[next.id] = true && item.push(next);
                    return item;
                }, []);
                if (search) {
                    this.setState({
                        newFormTemplateList: linkFormList,
                        formTemplateList: formTemplateList.concat(linkFormList),
                        foreignFormData: this.state.foreignFormData.concat(foreignFormData)
                    });
                } else {
                    this.setState({
                        newFormTemplateList: filLinkFormList,
                        formTemplateList: formTemplateList.concat(filLinkFormList),
                        foreignFormData: this.state.foreignFormData.concat(foreignFormData)
                    });
                }
                this.setState({
                    SearchCompleted: true
                });
            });
        });
    };
    
    //加载更多
    handleInfiniteOnLoad = (e) => {
        let scrollTop = e.target.scrollTop,//页面上卷的高度
            selectHeight = e.target.scrollHeight,//页面底部到顶部的距离
            menuHeight = e.target.clientHeight;//页面可视区域的高度
        let { formTemplateList } = this.state;
        if (scrollTop + menuHeight > selectHeight - 20) {
            if (this.state.scrollLoad) {
                this.setState({
                    pageIndex: this.state.pageIndex + 1,
                    scrollLoad: false
                }, () => {
                    getAllFormTemplatePaged({
                        FormName: this.state.FormName,
                        pageIndex: this.state.pageIndex,
                        pageSize: this.state.pageSize
                    }).then(res => {
                        if (res.data.formTemplateList.length > this.state.pageSize - 1) {
                            let r = buildLinkFormList(res.data.formTemplateList, this.state.controlExtra);
                            let { linkFormList } = r;
                            let hash = {};
                            let filLinkFormList = formTemplateList.concat(linkFormList).reduce((item, next) => {
                                hash[next.id] ? "" : hash[next.id] = true && item.push(next);
                                return item;
                            }, []);
                            this.setState({
                                newFormTemplateList: filLinkFormList,
                                formTemplateList: filLinkFormList,
                                scrollLoad: true
                            });
                        } else {
                            this.setState({
                                scrollLoad: false
                            });
                        }
                    });
                });
            }
        }
    };
    //搜索
    SearchForm = value => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(() => {
            if (value.replace(/^\s+|\s+$/g, "")) {
                this.setState({
                    pageIndex: 1,
                    FormName: value,
                    newFormTemplateList: []
                }, () => {
                    this.InitFormList(true);
                });
            }
        }, 500);
    };
    
    
    componentDidUpdate(prevProps, prevState) {
        // console.log(prevState)
        if (this.props.fid != prevProps.fid && this.props.value != prevProps.value) {
            this.state.editor.setValue(this.props.value);
            this.state.editor.preCursor = undefined;
        }
        else if (this.state.editor.preCursor) {
            this.state.editor.setCursor(this.state.editor.preCursor);
        }
        if (prevState.value !== this.state.value)
            this.formatFormula();
    }
    
    addFormulaElement = (e) => {
        let editor = this.state.editor;
        let doc = editor.getDoc();
        let cursor = doc.getCursor();
        let mark = "\u2800" + e.id + "\u2800";
        doc.replaceRange(mark, cursor);
        let sp = document.createElement("span");
        sp.innerText = e.name;
        sp.className = "CodeMirror-FEle";
        if (this.props.relations.indexOf(e.id) == -1) {
            this.props.relations.push(e.id);
        }
        this.formatFormula();
        editor.focus();
    };
    addForeignFormulaElement = (form, e) => {
        //由于后端去除数据库视图，现跨表单取数规则修改为：不能从两个不同的子表取字段(既不能子x子y,应该主子x、主主、子x子x)。2019-10-21 updated by lizn,
        
        let editor = this.state.editor;
        let doc = editor.getDoc();
        let cursor = doc.getCursor();
        let mark = "\u2800" + e.id + "foreign" + "\u2800";
        doc.replaceRange(mark, cursor);
        let sp = document.createElement("span");
        sp.innerText = e.name;
        sp.className = "CodeMirror-FEle2";
        if (this.props.relations.indexOf(e.id) == -1) {
            this.props.relations.push(e.id);
            
        }
        let exits = this.props.foreignData.some(a => a.id === e.id);
        if (!exits.length) {
            this.props.foreignData.push({
                table: form.table,
                foreignKey: e.foreignKey,
                primaryKey: e.primaryKey,
                formCode: e.formCode,
                code: e.code,
                id: e.id.trim(),
                formType: e.formType
            });
        }
        let tableExist = this.props.relationTables.some(a => a === e.formTemplateId);
        if (!tableExist) {
            this.props.relationTables.push(e.formTemplateId);
        }
        this.formatFormula();
        editor.focus();
    };
    
    addFormulaFunction(e) {
        let editor = this.state.editor;
        this.addBrackets(editor, e.func);
        editor.focus();
    }
    
    addBrackets(editor, func) {
        let doc = editor.getDoc();
        let cursor = doc.getCursor();
        doc.replaceRange((func || "") + "()", cursor);
        cursor = doc.getCursor();
        cursor.ch--;
        doc.setCursor(cursor);
    }
    
    showDesc(desc, exp, func, name) {
        this.setState({
            desc,
            exp,
            func,
            name,
            currentFuncItem: func
        });
        this.state.editor.focus();
    }
    
    render() {
        // console.log('editor', this.props);
        // console.log(this.state.formTemplateList)
        let { formTemplateList, foreignFormData, completed, newFormTemplateList } = this.state;
        // console.log(formTemplateList);
        //let formList = formTemplateList.filter(item => item.formTemplateVersionId !== this.props.formTemplateVersionId);
        return <div className={styles.editorConainter}>
            {
                completed ? null : <div className={styles.ModalTip}>
                    <Spin tip="公式编辑表单列表加载中..."/>
                </div>
            }
            <Row>
                <Col span={24} className={styles.CodeEditor}>
                    <CodeEditor options={{
                        mode: "formula",
                        //theme: 'material',
                        lineNumbers: false,
                        lineWrapping: true,
                        autofocus: true
                    }}
                        // value={foreignFormData.length > 0 ? this.state.value : null}
                                value={this.props.relationTables.length ? (foreignFormData.length > 0 ? this.state.value : null) : (this.state.editor ? this.state.value : null)}
                                editorDidMount={((editor, next) => {
                                    this.setState({
                                        editor: editor
                                    });
                                    this.props.init(editor, next);
                                    if (this.state.linkFormDetail.length > 0) {
                                        this.formatFormula(editor);
                                    }
                                }).bind(this)}
                                onChange={(editor, data, value) => {
                                    if (formulas.formulaKeywords.indexOf(data.text[0]) > -1) {
                                        value += "()";
                                        this.addBrackets(editor);
                                    }
                                    this.setState({ value });
                                    this.formatFormula();
                                    editor.showHint({ completeSingle: false });
                                }}
                    />
                </Col>
            </Row>
            <Row className={styles.row}>
                <Col span={11} className={styles.col}>
                    <div className={styles.card_container}>
                        <Tabs defaultActiveKey="1" size='small'>
                            <TabPane tab="当前表单字段" key="1">
                                <List
                                    bordered={true}
                                    itemLayout="horizontal"
                                    dataSource={this.props.currentFormData}
                                    renderItem={item => {
                                        let valueType = null;
                                        switch ((item.valueType || "").toLowerCase()) {
                                            case "array":
                                                valueType = <div className={styles.valueArray}>数组</div>;
                                                break;
                                            case "string":
                                                valueType = <div className={styles.valueStr}>文本</div>;
                                                break;
                                            case "datetime":
                                                valueType = <div className={styles.valueDateTime}>时间</div>;
                                                break;
                                            case "number":
                                                valueType = <div className={styles.valueNum}>数字</div>;
                                                break;
                                            case "boolean":
                                                valueType = <div className={styles.valueBool}>布尔</div>;
                                                break;
                                        }
                                        return <List.Item key={item.id} value={item.id}
                                                          onClick={e => {
                                                              this.addFormulaElement(item);
                                                          }}>
                                            <div className={styles.formulaItem}>
                                                <div>{item.name}</div>
                                                {valueType}
                                            </div>
                                        </List.Item>;
                                    }}
                                />
                            </TabPane>
                            {
                                this.props.hideAllForm ? null : <TabPane tab="全部表单" key="2">
                                    <FormTemplateList formTemplateVersionId={this.props.formTemplateVersionId}
                                                      foreignForm={newFormTemplateList}
                                                      addFormulaElement={this.addForeignFormulaElement}
                                                      SearchForm={this.SearchForm}
                                                      SearchCompleted={this.state.SearchCompleted}
                                                      handleInfiniteOnLoad={this.handleInfiniteOnLoad}/>
                                </TabPane>
                            }
                        </Tabs>
                    </div>
                </Col>
                <Col span={5} className={styles.col}>
                    <p className={styles.col_title}>函数</p>
                    <div className={styles.col_body}>
                        <Collapse>
                            {formulas.formulaList.map((item) => {
                                return <Collapse.Panel key={item.groupName} header={item.groupName}>
                                    {
                                        item.groupList.map(g => {
                                            return <p key={g.func}
                                                      className={`${styles.funcItem} ${this.state.currentFuncItem == g.func ? styles.on : ""}`}
                                                      onMouseEnter={e => {
                                                          this.showDesc(g.desc, g.exp, g.func, g.name);
                                                      }}
                                                      onClick={e => {
                                                          this.addFormulaFunction(g);
                                                      }}>{g.func}</p>;
                                        })
                                    }
                                </Collapse.Panel>;
                            })}
                        </Collapse>
                    </div>
                </Col>
                <Col span={8} className={styles.col}>
                    <p className={styles.col_title}>{this.state.name ? `${this.state.name} (${this.state.func})` : "说明"}</p>
                    <div className={styles.col_body}>
                        <p className={styles.info}>{this.state.desc}</p>
                        {
                            this.state.exp ? <p className={styles.info}>用法：{this.state.exp}</p> : null
                        }
                    </div>
                </Col>
            </Row>
        </div>;
    }
}

export default FormulaEditor;
