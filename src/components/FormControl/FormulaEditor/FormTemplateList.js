import react from "react";
import { Collapse, AutoComplete, Tooltip, Icon, Spin } from "antd";
import "./FormG.less";
import _ from "underscore";
import styles from "./TemplateList.less";

const Panel = Collapse.Panel;


let lazyAction;
export default class FormTemplateList extends react.Component {
    constructor(props) {
        super(props);
        this.state = {
            formTable: [],
            stateforeignFormImu: [],
            stateforeignForm: [],
            dataSourceImu: [],
            dataSource: []
        };
        lazyAction = _.debounce(this.props.SearchForm, 300);
    }

    componentDidMount() {
        // let foreignForm = this.props.foreignForm;//.filter(a => a.formTemplateVersionId !== this.props.formTemplateVersionId);
        // console.log(foreignForm)
        // var dataSource = [];
        // var stateforeignForm = foreignForm;
        // foreignForm.forEach(item => {
        //     dataSource.push({...{value: item.id, text: item.name}, ...item})
        // })
        // this.setState({
        //     dataSource: dataSource,
        //     dataSourceImu: dataSource,
        //     stateforeignForm: stateforeignForm,
        //     stateforeignFormImu: stateforeignForm
        // })
    }

    autoSearch = (value) => {
        var list = this.state.dataSource;
        var newList = [];
        var newstateforeignForm = [];
        if (value) {
            list.forEach(ele => {
                if (ele.text.indexOf(value) > -1) {
                    newList.push(ele);
                }
            });
        } else {
            newList = this.state.dataSourceImu;
            newstateforeignForm = this.state.stateforeignFormImu;
        }
        this.setState({
            dataSource: newList,
            stateforeignForm: newstateforeignForm
        });
    };
    autoSelect = (value) => {
        var list = this.state.foreignForm;
        var whereList = _.where(list, { id: value });
        this.setState({
            stateforeignForm: whereList
        });
    };

    render() {
        let foreignForm = this.props.foreignForm;//.filter(a => a.formTemplateVersionId !== this.props.formTemplateVersionId);
        var dataSource = [];
        foreignForm.forEach(item => {
            dataSource.push({ ...{ value: item.id, text: item.name }, ...item });
        });
        return <React.Fragment>
            <AutoComplete
                dataSource={dataSource}
                style={{ width: "100%" }}
                open={false}
                onSearch={this.props.SearchForm}
                onSelect={this.autoSelect}
                placeholder="请输入表单名称"
            />
            {
                this.props.SearchCompleted ?
                    foreignForm.length > 0 ? <div className='Infinite_Scroll' style={{ height: "220px" }}>
                        <Collapse accordion style={{ overflow: "auto", height: 220 }}>
                            {
                                foreignForm.map(form =>
                                    <Panel header={form.name} key={form.id}>
                                        {
                                            form.fields.length === 0 ?
                                                <div className={styles.empty}>空</div> :
                                                form.fields.filter(a => (a.controlType !== "None" || a.groupItem === true) && a.valueType !== undefined && a.formControlType !== 1).map(field => {
                                                    let valueType = null;
                                                    switch (field.valueType) {
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
                                                    return <div key={field.id}
                                                        onClick={e => {
                                                            this.props.addFormulaElement(form, field);
                                                        }}
                                                        className={styles.item}>
                                                        <div className={styles.title} title={field.name}>{field.name}{Number(field.status) === -1 ?
                                                            <Tooltip placement="top" title='字段已删除'>
                                                                <Icon style={{ color: "#FF122D", paddingLeft: "12px" }}
                                                                    type="exclamation-circle" />
                                                            </Tooltip> : null}</div>
                                                        {valueType}
                                                    </div>;
                                                })
                                        }
                                    </Panel>
                                )
                            }
                        </Collapse>
                        {/*<div style={{textAlign: 'center', paddingTop: '10px 0'}}>表单列表加载中...</div>*/}
                    </div> : null : <div style={{ textAlign: "center", padding: "12px" }}>
                        <Spin />
                        <p style={{ color: "#1890ff", fontSize: "14px" }}>列表加载中......</p>
                    </div>
            }
        </React.Fragment>;
    }
}
