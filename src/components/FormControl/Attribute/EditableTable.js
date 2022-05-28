import React from "react";
import com from "./../../../utils/com";
import { Table, Input, Button, Popconfirm, Select, Icon, Switch, Collapse, message, Spin } from "antd";
import "./EditableTable.less";
import {
    NewButton,
    ChangeButton,
    RemoveButton,
    GetButton, GetAllButton
} from "./../../../services/FormBuilder/FormButton";
import { GetAllParametersWithPush } from "./../../../services/BusinessRule/BusinessRule";
import styles from "./FormSubmitVerification.less";
import { parameterTypeList } from "../../../utils/DataSourceConfig";

const { Panel } = Collapse;

const icon = ["question-circle", "check", "warning", "issues-close", "stop", "delete", "edit", "zoom-out", "sort-ascending", "step-backward", "swap", "up-square", "logout", "border-inner", "ic-right", "fullscreen", "step-forward", "fast-backward", "fast-forward", "unordered-list", "pie-chart", "bar-chart", "dot-chart", "line-chart", "radar-chart", "fall", "rise", "apple", "android"];

export default class EditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isNew: false,
            FormSelect: [],
            thirdPartyList: [],//props.thirdPartyList,
            dataSource: [],//props.formButtonSetting.formButtonSetting || [],
            count: 1,
            spinning: true,
            changeSave: false,
            columns: [
                {
                    title: "按钮名称",
                    dataIndex: "name",
                    width: 100,
                    align: "center",
                    render: (text, record) =>
                        this.state.dataSource.length > 0 ? (
                            <Input disabled={record.disabled} value={record.name}
                                   onChange={(value) => this.ChangeValue("name", value.target.value, record)}
                                   placeholder="请输入按钮名称"/>
                        ) : null
                },
                // {
                //     title: "按钮类型",
                //     width: 120,
                //     dataIndex: "type",
                //     align: "center",
                //     render: (text, record) =>
                //         this.state.dataSource.length > 0 ? (
                //             <Select
                //                 onChange={(value) => this.ChangeValue("type", value, record)}
                //                 style={{ width: 100 }}
                //                 value={record.type}
                //                 disabled={true}//record.disabled
                //                 placeholder="请选择按钮类型"
                //             >
                //                 <Select.Option value={1}>台账按钮</Select.Option>
                //                 <Select.Option value={2}>行内按钮</Select.Option>
                //             </Select>
                //         ) : null
                // },
                {
                    title: "按钮图标",
                    width: 200,
                    dataIndex: "icon",
                    align: "center",
                    render: (text, record) => {
                        return this.state.dataSource.length > 0 ? (
                            <Select
                                onChange={(value) => this.ChangeValue("icon", value, record)}
                                style={{ width: 190 }}
                                value={record.icon}
                                disabled={record.disabled}
                                placeholder="请选择图标"
                            >
                                {
                                    icon.map((item, index) => {
                                        return <Select.Option key={index} value={item}><Icon type={item}
                                                                                             style={{
                                                                                                 padding: "0 3px",
                                                                                                 color: "#1890ff"
                                                                                             }}/> {item}
                                        </Select.Option>;
                                    })
                                }
                            </Select>
                        ) : null;
                    }

                },
                // {
                //     title: "内建按钮",
                //     width: 100,
                //     dataIndex: "IsInbuilt",
                //     align: "center",
                //     render: (text, record) => {
                //         return this.state.dataSource.length > 0 ? (
                //             <Select
                //                 onChange={(value) => this.ChangeValue("IsInbuilt", value, record)}
                //                 style={{ width: 80 }}
                //                 value={Number(record.IsInbuilt)}
                //                 disabled={true}//record.disabled 现阶段只提供非内建按钮
                //                 placeholder="请选择"
                //             >
                //                 <Select.Option value={1}>是</Select.Option>
                //                 <Select.Option value={0}>否</Select.Option>
                //             </Select>
                //         ) : null;
                //     }
                // },
                {
                    title: "表单选择",
                    width: 200,
                    dataIndex: "FormId",
                    align: "center",
                    render: (text, record) =>
                        this.state.dataSource.length > 0 ? (
                            <Select
                                onChange={(value) => this.ChangeValue("FormId", value, record)}
                                style={{ width: 190 }}
                                value={record.FormId}
                                disabled={record.disabled}
                                placeholder="请选择按钮对应的表单"
                            >
                                {
                                    this.state.FormSelect && this.state.FormSelect.length ?
                                        this.state.FormSelect.map(a => {
                                            return <Select.Option value={a.formId}
                                                                  key={a.formId}>{a.name}</Select.Option>;
                                        }) : null
                                }
                            </Select>
                        ) : null
                }
            ]
        };
    }

    //筛选主子表formId
    SplitFormBody = (formBody) => {
        formBody = formBody.toJS();
        let FormSelect = [];
        formBody.map(a => {
            if (a.itemType === "Root") {
                FormSelect.push({
                    itemType: a.itemType,
                    name: a.itemBase.name,
                    formId: a.formId
                });
            }
            // if (a.itemType === "SubForm") {
            //     FormSelect.push({
            //         itemType: a.itemType,
            //         name: a.itemBase.name,
            //         formId: a.formId
            //     });
            // }
        });
        this.setState({
            FormSelect: FormSelect
        });
    };

    componentDidMount() {
        GetAllParametersWithPush().then(res => {
            this.setState({
                thirdPartyList: res.data
            });
        });
        GetAllButton({ formTemplateVersionId: this.props.tabId }).then(res => {
            let { buttonList } = res.data;
            let dataSource = [];
            if (buttonList.length) {
                buttonList.map(a => {
                    let parameterMap = JSON.parse(a.parameterMap);
                    dataSource.push({
                        currentData: { sourceParameterViewResponses: parameterMap.parmas },
                        Table: [{
                            key: a.key,
                            name: a.name,
                            type: a.type,
                            icon: a.icon,
                            IsInbuilt: a.IsInbuilt ? 1 : 0,
                            FormId: a.formId,
                            disabled: true,
                            isPreload: a.isPreload
                        }],
                        // primaryKeyValueType: parameterMap.primaryKeyValueType,
                        url: parameterMap.url,
                        SourceTypeConfigId: a.sourceTypeConfigId,
                        isNew: false,
                        isPreload: a.isPreload,
                        IsRefresh: parameterMap.IsRefresh,
                        Id: a.id,
                        methodType: parameterMap.methodType,
                        disabled: true
                    });
                });
                this.setState({
                    dataSource: dataSource
                });
            }
            this.setState({
                spinning: false
            });
        });

        this.SplitFormBody(this.props.formBody);
        this.props.onRef(this);
    }

    ChangeValue = (name, val, value) => {
        let dataSource = [...this.state.dataSource];
        dataSource.map(item => {
            item.Table.map(_item => {
                if (_item.key === value.key) {
                    _item[name] = val;
                }
            });
        });
        this.setState({
            dataSource: dataSource
        });
    };

    handleDelete = (event, record) => {
        event.stopPropagation();
        let dataSource = [...this.state.dataSource];
        let isNew = false;
        dataSource.map(a => {
            if (a.Id === record.Id) {
                isNew = a.isNew;
            }
        });
        if (isNew) {
            this.setState({ dataSource: dataSource.filter(item => item.Id !== record.Id) });
        } else {
            RemoveButton({
                EntityIdList: [record.Id]
            }).then(res => {
                if (res.data.isValid) {
                    this.setState({ dataSource: dataSource.filter(item => item.Id !== record.Id) });
                    message.success("自定义按钮删除成功");
                }
            });
        }
    };
    handleEdit = async (event, record, about) => {
        event.stopPropagation();
        this.setState({
            changeSave: true
        });
        let dataSource = [...this.state.dataSource];
        let Table = record.Table[0];
        let isPreload = false;
        let result = null;
        let isNew = false;
        let ParameterMap = {
            parmas: [],
            url: "",
            methodType: 0,
            IsRefresh: false
            // primaryKeyValueType: ""
        };
        if (!record.SourceTypeConfigId) {
            message.info("请选择数据源");
            return;
        }
        //能否进行预加载功能判定
        let filSource = this.state.thirdPartyList.filter(a => a.id === record.SourceTypeConfigId);
        let { sourceParameterViewResponses } = filSource[0];
        let EndData = sourceParameterViewResponses.filter(a => a.value === null);
        let abc = [];
        dataSource.map(a => {
            if (a.Id === record.Id) {
                if (EndData.length === 0) {
                    isPreload = a.isPreload;
                } else {
                    a.currentData.sourceParameterViewResponses.map(item => {
                        if (item.targetId && item.targetId === "author") {
                            abc.push(item);
                        }
                    });
                    if (abc.length !== EndData.length) {
                        a.isPreload = false;
                        isPreload = false;
                    } else {
                        isPreload = a.isPreload;
                    }
                }
            }
        });


        dataSource.map(a => {
            if (a.Id === record.Id) {
                isNew = a.isNew;
                if (!Table.IsInbuilt) {
                    ParameterMap.url = a.url;
                    ParameterMap.methodType = a.methodType;
                    // ParameterMap.primaryKeyValueType = a.primaryKeyValueType;
                    ParameterMap.parmas = a.currentData.sourceParameterViewResponses;
                    ParameterMap.IsRefresh = a.IsRefresh;
                }
            }
        });

        let RequestHtt = isNew ? NewButton : ChangeButton;
        if (!about) {
            result = await RequestHtt({
                Id: record.Id,
                Name: Table.name,
                Type: Table.type,//"按钮类型：1.台账按钮 2.行内按钮,用于确定按钮展示位置",
                Icon: Table.icon,
                SourceTypeConfigId: record.SourceTypeConfigId,
                FormId: Table.FormId,
                Key: record.Id,
                IsInbuilt: Table.IsInbuilt !== 0,
                isPreload: isPreload,
                ParameterMap: Table.IsInbuilt ? "" : JSON.stringify(ParameterMap)
            });
        }
        if (result && !result.data.isValid) {
            this.setState({
                changeSave: false
            });
            message.info(result.data.errorMessages);
            return;
        }
        if (result && result.data.isValid) {
            message.success(isNew ? "自定义按钮创建成功" : "自定义按钮修改成功");
        }
        dataSource.map(item => {
            if (item.Id === record.Id) {
                item.isNew = false;
                item.Table.map(_item => {
                    return _item.disabled = !_item.disabled;
                });
                return item.disabled = !item.disabled;

            }
        });
        this.setState({
            dataSource: dataSource,
            changeSave: false
        });
    };

    handleAdd = () => {
        const { count, dataSource } = this.state;
        const newData = {
            IsRefresh: false,
            isNew: true,
            Id: com.Guid(),
            currentData: {},
            Table: [{
                key: com.Guid(),
                name: `提交${count}`,
                type: 1,
                icon: icon[Math.floor(Math.random() * icon.length)],
                IsInbuilt: 0,
                isPreload: false,
                FormId: "",
                disabled: false
            }],
            disabled: false,
            SourceTypeConfigId: ""
        };
        this.setState({
            dataSource: [...dataSource, newData],
            count: count + 1
        });
    };
    IsRefresh = (value, e, record) => {
        e.stopPropagation();
        let dataSource = [...this.state.dataSource];
        console.log(dataSource);
        dataSource.map(a => {
            if (a.Id === record.Id) {
                a.IsRefresh = value;
            }
        });
        this.setState({
            dataSource
        });
    };
    IsPreload = (value, e, record) => {
        e.stopPropagation();
        let dataSource = [...this.state.dataSource];
        console.log(dataSource);
        dataSource.map(a => {
            if (a.Id === record.Id) {
                a.isPreload = value;
            }
        });
        this.setState({
            dataSource
        });
        console.log(dataSource);
    };


    setResourceId = (value, items) => {
        // console.log(value, items);
        const { thirdPartyList, dataSource } = this.state;
        let thirdPartyListObj = thirdPartyList.find(a => a.id === value);
        dataSource.map(item => {
            if (item.Id === items.Id) {
                item.currentData.sourceParameterViewResponses = thirdPartyListObj.sourceParameterViewResponses;
                item.url = thirdPartyListObj.url;
                item.methodType = thirdPartyListObj.methodType;
                // item.primaryKeyValueType = thirdPartyListObj.configuration.some(a => a.primary === true) ? thirdPartyListObj.configuration.find(a => a.primary === true).valueType : "string";
                item.SourceTypeConfigId = value;

            }
        });
        this.setState({ dataSource });
    };

    filterOption = (input, option) => {
        return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    };

    setFormCol(val, item, type, items) {
        let { dataSource } = this.state;
        let FildataSource = JSON.parse(JSON.stringify(dataSource));
        let currentData = FildataSource.find(a => a.Id === items.Id).currentData;
        console.log(FildataSource, item, currentData);
        currentData.sourceParameterViewResponses.map(a => {
            if (a.id === item.id) {
                a.name = item.name;
                a.targetId = type === "dynamic" ? val : "";
                a.type = item.parameterType;
                a.value = type === "dynamic" ? item.value : val.target.value;
            }
        });
        dataSource.map(a => {
            if (a.Id === items.Id) {
                item.currentData = { ...currentData };
            }
        });

        this.setState({
            dataSource: FildataSource
        });

    }

    //保存数据
    setFormular = () => {
        return new Promise(resolve => {
            let formButtonSetting = this.state.dataSource;
            let DataSub = formButtonSetting.filter(a => !a.disabled);
            if (DataSub.length > 0) {
                resolve(false);
                return;
            }
            resolve(true);
            // this.props.onChange({ formButtonSetting });
        });
    };

    extra = (data) => {
        let record = data.Table[0];
        console.log(data);
        return <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            width: "400px"
        }}>
            <div>
                是否预加载：
                <Switch disabled={record.disabled} checked={data.isPreload} checkedChildren="是" unCheckedChildren="否"
                        onChange={(e, value) => this.IsPreload(e, value, data)}/>
            </div>
            <div>
                是否刷新列表：
                <Switch disabled={record.disabled} checked={data.IsRefresh} checkedChildren="是" unCheckedChildren="否"
                        onChange={(e, value) => this.IsRefresh(e, value, data)}/>
            </div>
            <Icon type={record.disabled ? "edit" : "check"}
                  style={{ color: "#1890ff", padding: "0 6px", fontSize: "18px" }}
                  onClick={(e) => this.handleEdit(e, data, record.disabled)}/>
            <Icon type="delete" style={{ color: "#1890ff", padding: "0 6px", fontSize: "18px" }}
                  onClick={(e) => this.handleDelete(e, data)}/>
        </div>;
    };


    render() {
        // console.log(this.props);
        let { currentFormData } = this.props;
        const { dataSource, thirdPartyList, FormSelect, spinning, changeSave } = this.state;//currentData
        // let thirdPartyListType = thirdPartyList.filter(a => a.sourceType === 0);
        // console.log(thirdPartyList,thirdPartyListType)
        return (
            <Spin spinning={spinning} tip="按钮列表加载中...">
                {
                    changeSave ? <Spin indicator={<Icon type="loading"/>} tip="按钮保存中..."/> : null
                }
                <div className="EditableTable">
                    <Button onClick={this.handleAdd} type="primary">
                        新增按钮
                    </Button>
                    <Collapse expandIcon={({ isActive }) => null}
                              defaultActiveKey={["0", "1", "2", "3", "4", "5", "6", "7"]}
                              style={{ marginTop: "6px" }}>
                        {
                            FormSelect && FormSelect.length ?
                                dataSource.map((items, index) => {
                                    console.log(items);
                                    let equal = FormSelect.find(a => a.formId === items.Table[0].FormId);
                                    return <Panel key={index} extra={this.extra(items)}
                                                  header={`${items.Table[0].name}------>${equal ? equal.name : ""}`}>
                                        <Table
                                            rowClassName={() => "editable-row"}
                                            bordered
                                            size="small"
                                            pagination={false}
                                            dataSource={items.Table}
                                            columns={this.state.columns}
                                        />
                                        {
                                            Number(items.Table[0].IsInbuilt) === 0 ?
                                                <div style={{ marginTop: "6px" }}>
                                                    <div style={{ width: "100px" }}>选择数据源:</div>
                                                    <Select style={{ width: "100%", padding: "5px 0" }} showSearch
                                                            placeholder="请选择"
                                                            optionFilterProp="children"
                                                            disabled={items.disabled}
                                                            value={items.SourceTypeConfigId}
                                                            onChange={(value) => this.setResourceId(value, items)}
                                                            filterOption={this.filterOption}>
                                                        {thirdPartyList.map(a => <Select.Option key={a.id} value={a.id}
                                                                                                title={a.name}>{a.name}</Select.Option>)}
                                                    </Select>
                                                    {items.SourceTypeConfigId ?
                                                        <React.Fragment>
                                                            {
                                                                items.currentData && items.currentData.sourceParameterViewResponses && items.currentData.sourceParameterViewResponses.length !== 0 ?
                                                                    <div className={styles.title}>关联参数:</div> : null
                                                            }
                                                            < div className={styles.bodyParams}>
                                                                {
                                                                    items.currentData.sourceParameterViewResponses.map((item, index) => {
                                                                        let paramType = parameterTypeList.find(a => a.value === item.parameterType).name;
                                                                        return <div style={{
                                                                            width: "100%",
                                                                            display: "flex",
                                                                            justifyContent: "space-between",
                                                                            marginBottom: "10px",
                                                                            alignItems: "center"
                                                                        }} key={index}>
                                                                            <div style={{
                                                                                whiteSpace: "nowrap",
                                                                                margin: "0 5px"
                                                                            }}>参数名称：
                                                                            </div>
                                                                            <Input disabled value={item.name}/>
                                                                            <div style={{
                                                                                whiteSpace: "nowrap",
                                                                                margin: "0 5px"
                                                                            }}>参数类型：
                                                                            </div>
                                                                            <Input disabled value={paramType}/>
                                                                            <div style={{
                                                                                whiteSpace: "nowrap",
                                                                                margin: "0 5px"
                                                                            }}> 参数值：
                                                                            </div>
                                                                            {
                                                                                paramType === "动态" ?
                                                                                    <Select
                                                                                        style={{ minWidth: 300 }}
                                                                                        showSearch placeholder="请选择"
                                                                                        optionFilterProp="children"
                                                                                        maxTagCount={4}
                                                                                        disabled={items.disabled}
                                                                                        value={item.targetId}
                                                                                        onChange={val => {
                                                                                            this.setFormCol(val, item, "dynamic", items);
                                                                                        }}
                                                                                        filterOption={this.filterOption}>
                                                                                        <Select.Option
                                                                                            value="all">当前表单主表数据</Select.Option>
                                                                                        <Select.Option
                                                                                            value="author">环境变量</Select.Option>
                                                                                        {currentFormData.map(a =>
                                                                                            <Select.Option
                                                                                                key={a.id}
                                                                                                title={a.name}
                                                                                                value={a.id}>{a.name}</Select.Option>)}
                                                                                    </Select>
                                                                                    :
                                                                                    <Input style={{ minWidth: 300 }}
                                                                                           value={item.value}
                                                                                           disabled={items.disabled}
                                                                                           onChange={val => {
                                                                                               this.setFormCol(val, item, "other", items);
                                                                                           }}/>
                                                                            }
                                                                        </div>;
                                                                    })
                                                                }
                                                            </div>
                                                        </React.Fragment> : null
                                                    }
                                                </div> : null
                                        }
                                    </Panel>;
                                }) : null
                        }
                    </Collapse>
                </div>
            </Spin>

        );
    }
}
