import React from "react";
import {
    Form,
    Button,
    Table,
    Tabs,
    Collapse,
    AutoComplete,
    Modal,
    Input,
    Spin,
    Icon,
    Row,
    Col,
    DatePicker,
    Select,
    InputNumber,
    Checkbox,
    Tooltip,
    message,
    TreeSelect
} from "antd";
import moment from "moment";
import qs from "qs";
import { DndProvider, DragSource, DropTarget } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import update from "immutability-helper";
import { submitTree } from "../../utils/com";
import request from "../../utils/request";
import styles from "./Voucher.less";

const { Option } = Select;
const { confirm } = Modal;
const { Panel } = Collapse;
const { TabPane } = Tabs;
let cloumsparams = {
    summary: "",
    acct_id: "",
    currency_id: "",
    exchange_rate: "",
    od_amount: "",
    oc_amount: "",
    rd_amount: "",
    rc_amount: "",
    is_special: false,
    is_notice: false
};
const options = [
    { label: "外币", value: "IsForeignCurrency" },
    { label: "特殊记账", value: "is_special" },
    { label: "通知书", value: "is_notice" }
];
let moneyType = [
    { type: "百", jfkey: "jftenbillion", dfkey: "dftenbillion" },
    { type: "十", jfkey: "jfbillion", dfkey: "dfbillion" },
    { type: "亿", jfkey: "jfonehundred", dfkey: "dfonehundred" },
    { type: "千", jfkey: "jftenmillion", dfkey: "dftenmillion" },
    { type: "百", jfkey: "jfmillion", dfkey: "dfmillion" },
    { type: "十", jfkey: "jftenthousand", dfkey: "dftenthousand" },
    { type: "万", jfkey: "jfonethousand", dfkey: "dfonethousand" },
    { type: "千", jfkey: "jfthousand", dfkey: "dfthousand" },
    { type: "百", jfkey: "jfhundred", dfkey: "dfhundred" },
    { type: "十", jfkey: "jften", dfkey: "dften" },
    { type: "元", jfkey: "jfyuan", dfkey: "dfyuan" },
    { type: "角", jfkey: "jfangle", dfkey: "dfangle" },
    { type: "分", jfkey: "jfminute", dfkey: "dfminute" }
];
let dragingIndex = -1;

//凭证个数
async function GetVchCount(params) {
    return request(`${config.VoucherFormserverIp}/VchApi/GetVchCount?${qs.stringify(params)}`, {
        method: "post",
        mode: "cors",
        traditional: true
    });
}

//凭证主表及分录表数据
async function GetVch(params) {
    return request(`${config.VoucherFormserverIp}/VchApi/GetVch?${qs.stringify(params)}`, {
        method: "post",
        mode: "cors",
        traditional: true
    });
}

//账套名称
async function GetAccSet(params) {
    return request(`${config.VoucherFormserverIp}/VchApi/GetAccSetList?${qs.stringify(params)}`, {
        method: "post",
        mode: "cors",
        traditional: true
    });
}

//凭证类别
async function GetVchSort(params) {
    return request(`${config.VoucherFormserverIp}/VchApi/GetVchSortList`, {
        method: "post",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//常用摘要
async function GetSummary(params) {
    return request(`${config.VoucherFormserverIp}/VchApi/GetComSummaryList?${qs.stringify(params)}`, {
        method: "post",
        mode: "cors",
        traditional: true
    });
}

//账套货币
async function GetAccSetCurrency(params) {
    return request(`${config.VoucherFormserverIp}/VchApi/GetcCurrencyList?${qs.stringify(params)}`, {
        method: "post",
        mode: "cors",
        traditional: true
    });
}

//会计科目
async function GetAcctList(params) {
    return request(`${config.VoucherFormserverIp}/VchApi/GetAcctList`, {
        method: "post",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//辅助类别
async function GetVchAsst(params) {
    return request(`${config.VoucherFormserverIp}/VchApi/GetVchAsst`, {
        method: "post",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

//辅助项目
async function GetAsstItemList(params) {
    return request(`${config.VoucherFormserverIp}/VchAsstItemApi/GetVchAsstItemResult?${qs.stringify(params)}`, {
        method: "post",
        mode: "cors",
        traditional: true
    });
}

//推送数据
async function GenerateVoucher(params) {
    return request(`${config.VoucherFormserverIp}/VchApi/GenerateVoucher`, {
        method: "post",
        mode: "cors",
        traditional: true,
        body: JSON.stringify(params)
    });
}

class BodyRow extends React.Component {
    render() {
        const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
        const style = { ...restProps.style, cursor: "move" };

        let { className } = restProps;
        if (isOver) {
            if (restProps.index > dragingIndex) {
                className += " drop-over-downward";
            }
            if (restProps.index < dragingIndex) {
                className += " drop-over-upward";
            }
        }
        return connectDragSource(connectDropTarget(<tr {...restProps} className={className} style={style}/>));
    }
}

const rowSource = {
    beginDrag(props) {
        dragingIndex = props.index;
        return {
            index: props.index
        };
    }
};

const rowTarget = {
    drop(props, monitor) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;
        if (dragIndex === hoverIndex) {
            return;
        }
        props.moveRow(dragIndex, hoverIndex);
        monitor.getItem().index = hoverIndex;
    }
};

const DragableBodyRow = DropTarget("row", rowTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
}))(
    DragSource("row", rowSource, connect => ({
        connectDragSource: connect.dragSource()
    }))(BodyRow)
);

function formatDate(date) {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-");
}

class Voucher extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModify: false,
            isLoading: false,
            isSava: false,
            isMoneyShow: false,
            preBtnLoading: false,
            isMoneyShowIndex: null,
            isMoneyShowType: "",
            filterColumns: [],
            isCol: false,
            moenyData: [],
            isOperate: false,
            hoverIndex: null,
            isSubjectDetails: false,
            fliterSummaryData: null,
            asstSelectData: [],
            asstSelectSearchData: [],
            data: [],
            vchData: [],
            vchCount: [],
            vchentryId: "",
            scrollPage: 1,
            asstItemDataConfig: [],
            asstByVchData: [],
            vchSortData: [],
            summaryData: [],
            currencyData: [],
            accData: [],
            accSetId: "",
            asstItemData: [],
            treeShow: false,
            treeSortId: "",
            vchentryIndex: null,
            cardbodystate: true,
            columns: [
                {
                    title: "序号",
                    show: true,
                    dataIndex: "row_number",
                    key: "row_number",
                    render: (text, record, index) => {
                        const obj = {
                            children: (
                                <div className={styles.dataSourceoperating}>
                                    {/* {this.state.isOperate && this.state.hoverIndex === index && this.state.isModify ? ( */}
                                    {this.state.isModify ? (
                                        <span>
                                            <Tooltip title="上移" placement="bottom">
                                                <Button
                                                    icon="vertical-align-top"
                                                    onClick={event => {
                                                        this.moveUp(event, index);
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="下移" placement="bottom">
                                                <Button
                                                    icon="vertical-align-bottom"
                                                    onClick={event => {
                                                        this.moveDown(event, index);
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="借货切换" placement="bottom">
                                                <Button
                                                    icon="swap"
                                                    onClick={event => {
                                                        this.reversing(event, index);
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="查看科目余额" placement="bottom">
                                                <Button
                                                    icon="file-text"
                                                    onClick={event => {
                                                        this.subjectDetails(event, index, record);
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="分录复制" placement="bottom">
                                                <Button
                                                    icon="copy"
                                                    onClick={event => {
                                                        this.copyCol(event, index, record);
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title="删除" placement="bottom">
                                                <Button
                                                    icon="delete"
                                                    onClick={event => {
                                                        this.delCol(event, index, record);
                                                    }}
                                                    className={styles.delete}
                                                />
                                            </Tooltip>
                                        </span>
                                    ) : (
                                        <div style={{ textAlign: "center" }}>{index + 1}</div>
                                    )}
                                </div>
                            ),
                            props: {}
                        };
                        if (index + 1 === this.state.data.length) {
                            obj.props.colSpan = 0;
                        }
                        return obj;
                    }
                },
                {
                    title: "摘要",
                    dataIndex: "summary",
                    key: "summary",
                    show: true,
                    render: (text, record, index) => {
                        let { fliterSummaryData, summaryData, isModify } = this.state;
                        let data = fliterSummaryData && fliterSummaryData.length >= 0 ? fliterSummaryData : summaryData;
                        const obj = {
                            children: isModify ? (
                                <AutoComplete value={text} onSearch={this.summarySearch.bind(this)}
                                              onChange={this.valueChange.bind(this, index, "input", "summary")}>
                                    {data
                                        ? data.map((item, key) => {
                                            return (
                                                <Option key={key} value={item.mnemonic_code}>
                                                    {item.summary}
                                                </Option>
                                            );
                                        })
                                        : null}
                                </AutoComplete>
                            ) : (
                                <span className={styles.summary_text}>{text}</span>
                            ),
                            props: {}
                        };
                        if (index + 1 === this.state.data.length) {
                            obj.children = <span className={styles.summary_text}>{text}</span>;
                            obj.props.colSpan = this.state.isCol ? 7 : 3;
                        }
                        return obj;
                    }
                },
                {
                    title: "科目",
                    dataIndex: "acct_id",
                    key: "acct_id",
                    show: true,
                    render: (text, record, index) => {
                        let { asstSelectData, asstByVchData } = this.state;
                        let defaultValue = "";
                        let d = asstByVchData.filter(v => v.acct_id === text);
                        defaultValue = d.length > 0 ? d[0].acct_full_name : "";
                        const obj = {
                            children: this.state.isModify ? (
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    onChange={this.valueChange.bind(this, index, "select", "acctFName")}
                                    style={{ width: "100%" }}
                                    onSelect={event => {
                                        this.onRowClick(record.vch_entry_id, event ? event : record.acct_id, index + 1, record.vch_date);
                                    }}
                                    onBlur={this.acctSelecBlur.bind(this)}
                                    onPopupScroll={this.onPopupScroll}
                                    value={defaultValue}
                                    onSearch={this.acctSelectSearch.bind(this)}
                                    // onPopupScroll={this.companyScroll}
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {asstSelectData
                                        ? asstSelectData.map((item, index) => {
                                            let name = `${item.acct_full_name}`;
                                            // if (index < 10)
                                            return (
                                                <Option key={index} value={item.acct_id} title={name}>
                                                    {name}
                                                </Option>
                                            );
                                        })
                                        : null}
                                </Select>
                            ) : (
                                <span className={styles.summary_text} title={defaultValue}>
                                        {defaultValue}
                                    </span>
                            ),
                            props: {}
                        };
                        if (index + 1 === this.state.data.length) obj.props.colSpan = 0;
                        return obj;
                    }
                },
                {
                    title: "原币",
                    dataIndex: "IsForeignCurrency",
                    key: "IsForeignCurrency",
                    show: false,
                    children: [
                        {
                            title: "货币",
                            dataIndex: "currency_id",
                            key: "currency_id",
                            width: 100,
                            render: (text, record, index) => {
                                let { currencyData } = this.state;
                                const obj = {
                                    children: (
                                        <Select
                                            disabled={!this.state.isModify ? true : false}
                                            onChange={this.valueChange.bind(this, index, "select", "currencyName")}
                                            style={{ width: "99px" }}
                                        >
                                            {currencyData
                                                ? currencyData.map((item, key) => {
                                                    return (
                                                        <Option key={key} value={item.currency_id}
                                                                title={item.currency_name}>
                                                            {item.currency_name}
                                                        </Option>
                                                    );
                                                })
                                                : null}
                                        </Select>
                                    ),
                                    props: {}
                                };
                                if (index + 1 === this.state.data.length) obj.props.colSpan = 0;
                                return obj;
                            }
                        },
                        {
                            title: "汇率",
                            dataIndex: "exchange_rate",
                            key: "exchange_rate",
                            width: 90,
                            render: (text, record, index) => {
                                const obj = {
                                    children: this.state.isModify ? (
                                        <InputNumber min={0} step={0.1} defaultValue={text}
                                                     onChange={this.valueChange.bind(this, index, "input", "exRate")}/>
                                    ) : (
                                        <span className={styles.summary_text}>{text}</span>
                                    ),
                                    props: {}
                                };
                                if (index + 1 === this.state.data.length) obj.props.colSpan = 0;
                                return obj;
                            }
                        },
                        {
                            title: "借方",
                            dataIndex: "od_amount",
                            key: "od_amount",
                            width: 120,
                            render: (text, record, index) => {
                                const obj = {
                                    children: this.state.isModify ? (
                                        <InputNumber
                                            onChange={this.debitOnchange.bind(this, index, record.exchange_rate, "rd_amount")}
                                            formatter={value => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            parser={value => value.replace(/\$\s?|(,*)/g, "")}
                                            value={text ? parseFloat(text.toString().replace(",", "")) : null}
                                        />
                                    ) : (
                                        <span className={styles.summary_text}>{text}</span>
                                    ),
                                    props: {}
                                };
                                if (index + 1 === this.state.data.length) obj.props.colSpan = 0;
                                return obj;
                            }
                        },
                        {
                            title: "贷方",
                            dataIndex: "oc_amount",
                            key: "oc_amount",
                            width: 120,
                            render: (text, record, index) => {
                                const obj = {
                                    children: this.state.isModify ? (
                                        <InputNumber
                                            onChange={this.debitOnchange.bind(this, index, record.exchange_rate, "rc_amount")}
                                            formatter={value => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            parser={value => value.replace(/\$\s?|(,*)/g, "")}
                                            value={text ? parseFloat(text.toString().replace(",", "")) : null}
                                        />
                                    ) : (
                                        <span className={styles.summary_text}>{text}</span>
                                    ),
                                    props: {}
                                };
                                if (index + 1 === this.state.data.length) obj.props.colSpan = 0;
                                return obj;
                            }
                        }
                    ]
                },
                {
                    title: "借方金额",
                    dataIndex: "rd_amount",
                    key: "rd_amount",
                    show: true,
                    width: 220
                },
                {
                    title: "贷方金额",
                    dataIndex: "rc_amount",
                    key: "rc_amount",
                    show: true,
                    width: 220
                },
                {
                    title: "特殊记账",
                    dataIndex: "is_special",
                    key: "is_special",
                    show: false,
                    width: 70,
                    render: (text, record, index) => {
                        const obj = {
                            children: (
                                <div className={styles.chx}>
                                    <Checkbox
                                        defaultChecked={text}
                                        disabled={!this.state.isModify ? true : false}
                                        onChange={this.valueChange.bind(this, index, "checkbox", "isSpecial")}
                                    />
                                </div>
                            ),
                            props: {}
                        };
                        if (index + 1 === this.state.data.length) {
                            obj.children = <div className={styles.chxdefault}></div>;
                            obj.props.colSpan = 1;
                        }
                        return obj;
                    }
                },
                {
                    title: "通知书",
                    dataIndex: "is_notice",
                    key: "is_notice",
                    show: false,
                    width: 60,
                    render: (text, record, index) => {
                        const obj = {
                            children: (
                                <div className={styles.chx}>
                                    <Checkbox
                                        defaultChecked={text}
                                        disabled={!this.state.isModify ? true : false}
                                        onChange={this.valueChange.bind(this, index, "checkbox", "isNotice")}
                                    />
                                </div>
                            ),
                            props: {}
                        };
                        if (index + 1 === this.state.data.length) {
                            obj.children = <div className={styles.chxdefault}></div>;
                            obj.props.colSpan = 1;
                        }
                        return obj;
                    }
                }
                //  {
                //     title: '操作',
                //     show: true,
                //     // fixed: 'right',
                //     width: 180,
                //     render: (text) => <span className={styles.dataSourceoperating}>
                //         <Tooltip title="上移" placement="bottom"><Button icon="vertical-align-top" /></Tooltip>
                //         <Tooltip title="下移" placement="bottom"><Button icon="vertical-align-bottom" /></Tooltip>
                //         <Tooltip title="借货切换" placement="bottom"><Button icon="swap" /></Tooltip>
                //         <Tooltip title="删除" placement="bottom"><Button icon="delete" /></Tooltip>
                //     </span>
                // }
            ],
            subjectDetailscolumns: [
                { title: "", width: 60, render: (text, record, index) => index + 1 },
                {
                    title: "币别",
                    dataIndex: "CurrencyName",
                    key: "CurrencyName",
                    width: 80,
                    render: text => <span>{text}</span>
                },
                {
                    title: "方向",
                    dataIndex: "direction",
                    key: "direction",
                    width: 60,
                    render: text => <span>{text}</span>
                },
                {
                    title: "初期余额",
                    dataIndex: "Initial",
                    key: "Initial",
                    width: 100,
                    render: text => <span>{text}</span>
                },
                {
                    title: "本期发生",
                    children: [
                        { title: "借方", dataIndex: "jf", key: "jf", width: 100, render: text => <span>{text}</span> },
                        { title: "贷方", dataIndex: "df", key: "df", width: 100, render: text => <span>{text}</span> }
                    ]
                },
                {
                    title: "本年累计",
                    children: [
                        { title: "借方", dataIndex: "ljf", key: "ljf", width: 100, render: text => <span>{text}</span> },
                        { title: "贷方", dataIndex: "ldf", key: "ldf", width: 100, render: text => <span>{text}</span> }
                    ]
                },
                {
                    title: "方向",
                    dataIndex: "ldirection",
                    key: "ldirection",
                    width: 60,
                    render: text => <span>{text}</span>
                },
                {
                    title: "末期余额",
                    dataIndex: "mzInitial",
                    key: "mzInitial",
                    width: 100,
                    render: text => <span>{text}</span>
                },
                {
                    title: "开累发生额",
                    children: [
                        {
                            title: "借方",
                            dataIndex: "kljf",
                            key: "kljf",
                            width: 100,
                            render: text => <span>{text}</span>
                        },
                        { title: "贷方", dataIndex: "kldf", key: "kldf", width: 100, render: text => <span>{text}</span> }
                    ]
                }
            ],
            auxiliarycolumns: [
                { title: "操作", width: 60, render: (text, record, index) => index + 1 },
                {
                    title: "辅助类别",
                    dataIndex: "asst_sort_id",
                    key: "asst_sort_id",
                    width: 300,
                    render: (text, record) => <span>{record.asst_sort_name}</span>
                },
                {
                    title: "辅助项目",
                    dataIndex: "asst_item_id",
                    key: "asst_item_id",
                    render: (text, record) => {
                        let { asstItemData, isModify, treeShow, asstItemDataConfig, treeSortId } = this.state;
                        let title = undefined;
                        asstItemDataConfig.map(item => {
                            if (item.sortid === record.asst_sort_id && item.vchentryid === record.vch_entry_id) title = item.title;
                        });
                        return treeShow && treeSortId === record.asst_sort_id ? (
                            <TreeSelect
                                showSearch
                                treeDataSimpleMode
                                placeholder="请选择"
                                value={title ? title : record.asst_item_name ? record.asst_item_name : undefined}
                                loadData={this.onLoadData.bind(this, record.asst_sort_id)}
                                treeData={asstItemData ? asstItemData : []}
                                dropdownClassName={styles.treeSelect}
                                onSelect={this.acctItemOnselect.bind(this)}
                                onSearch={event => {
                                    this.getAsstItemList(record.asst_sort_id, text, event);
                                }}
                                treeNodeFilterProp={"title"}
                                // defaultOpen={true}
                            />
                        ) : (
                            <span className={styles.summary_text}
                                  onClick={isModify ? this.showAsstTreeSelect.bind(this, record.asst_sort_id, text) : null}>
                                    {/* // <span className={styles.summary_text} onClick={this.showAsstTreeSelect.bind(this, record.asst_sort_id, text)}> */}
                                {title ? title : record.asst_item_name}
                                </span>
                        );
                    }
                }
            ]
        };
    }

    getAsstItemList(asstSortId, asstItemId, keywords) {
        //辅助项目
        let { asstItemData } = this.state;
        asstItemData = [];
        this.setData(asstSortId, asstItemId, asstItemData, keywords);
    }

    showAsstTreeSelect = (asstSortId, asstItemId) => {
        this.setState({ treeShow: true, treeSortId: asstSortId });
        this.getAsstItemList(asstSortId, asstItemId);
    };
    acctItemOnselect = (key, e) => {
        let { asstItemDataConfig } = this.state;
        let { sortid, title, vchentryid } = e.props;
        let params = { vchentryid, sortid, asstitemid: key, title };
        let data = asstItemDataConfig.filter(v => v.sortid === sortid && v.vchentryid === vchentryid);
        if (data.length === 1) {
            asstItemDataConfig.forEach(item => {
                if (item.sortid === sortid) {
                    item.asstitemid = key;
                    item.title = title;
                }
            });
        } else asstItemDataConfig.push(params);
        this.setState({ asstItemDataConfig });
    };
    onPopupScroll = e => {
        e.persist();
        const { target } = e;
        let { asstSelectData, asstSelectSearchData, asstByVchData } = this.state;
        asstSelectData = [];
        if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
            const { scrollPage } = this.state;
            const nextScrollPage = scrollPage + 1;
            if (asstSelectSearchData.length > 0) {
                asstSelectData = asstSelectSearchData.slice(0, parseInt(`${nextScrollPage}0`));
            } else {
                asstSelectData = asstByVchData.slice(0, parseInt(`${nextScrollPage}0`));
            }
            this.setState({ scrollPage: nextScrollPage, asstSelectData });
        }
    };
    acctSelectSearch = value => {
        let { asstSelectData, asstSelectSearchData, asstByVchData } = this.state;
        asstSelectData = [];
        asstSelectSearchData = asstByVchData.filter(v => v.acct_full_name && v.acct_full_name.indexOf(value) !== -1);
        asstSelectData = asstSelectSearchData.slice(0, 10);
        this.setState({ asstSelectData, scrollPage: 1, asstSelectSearchData });
    };
    acctSelecBlur = () => {
        let { asstSelectData, asstSelectSearchData, asstByVchData } = this.state;
        asstSelectData = [];
        asstSelectSearchData = [];
        if (asstByVchData) {
            asstByVchData.forEach((item, index) => {
                if (index < 10) asstSelectData.push(item);
            });
            this.setState({ asstSelectData, scrollPage: 1, asstSelectSearchData });
        }
    };
    summarySearch = searchText => {
        let { fliterSummaryData, summaryData } = this.state;
        fliterSummaryData = [];
        if (searchText !== "") {
            let data = summaryData.filter(v => v.summary.indexOf(searchText) !== -1);
            fliterSummaryData = data.length > 0 ? data : [];
        } else fliterSummaryData = null;
        this.setState({ fliterSummaryData });
    };

    Guid() {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
    }

    //添加行
    addVoucher = () => {
        let { data } = this.state;
        let params = JSON.parse(JSON.stringify(cloumsparams));
        params.Id = this.Guid();
        data.splice(data.length - 1, 0, params);
        this.setState({ isSava: true, data });
    };
    saveVoucher = () => {
        this.setState({ isSava: false });
    };

    //列显示
    changeData(value, status) {
        let { columns, filterColumns, isCol } = this.state;
        filterColumns = columns;
        filterColumns.forEach(item => {
            if (item.key === value) item.show = status;
        });
        filterColumns = filterColumns.filter(v => v.show);
        let height = filterColumns.filter(v => v.key === "IsForeignCurrency");
        isCol = height.length > 0;
        this.setState({ filterColumns, isCol });
    }

    checkboxOnChange = e => {
        options.forEach(item => {
            if (e.indexOf(item.value) > -1) this.changeData(item.value, true);
            else this.changeData(item.value, false);
        });
    };
    components = {
        body: {
            row: DragableBodyRow
        }
    };
    moveRow = (dragIndex, hoverIndex) => {
        const { data } = this.state;
        const dragRow = data[dragIndex];
        this.setState(
            update(this.state, {
                data: {
                    $splice: [
                        [dragIndex, 1],
                        [hoverIndex, 0, dragRow]
                    ]
                }
            })
        );
    };
    onMouseEnter = index => {
        this.setState({ isOperate: true, hoverIndex: index });
    };
    onMouseLeave = index => {
        this.setState({ isOperate: false, hoverIndex: null });
    };

    async onRowClick(vchentryid, acctid, index, accy) {
        let { vchentryId, accSetId } = this.state;
        this.setState({ vchentryId: vchentryid, vchentryIndex: index });
        //辅助类别
        const asstEntry = await GetVchAsst({
            accsetid: accSetId,
            vchentryid,
            acctid,
            accy: accy
        });
        let _asstEntry = asstEntry.data;
        if (_asstEntry.State === 1) {
            this.setState({
                asstEntryData: _asstEntry.Data,
                vchentryId: vchentryid
            });
        }
    }

    subjectDetails = (e, index, row) => {
        this.setState({ isSubjectDetails: true });
    };
    subjectDetailsCancel = e => {
        this.setState({ isSubjectDetails: false });
    };

    swapItems(arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    }

    //换向
    reversing = (e, index) => {
        let { data } = this.state;
        let params = data[index];
        [params.rd_amount, params.rc_amount] = [params.rc_amount, params.rd_amount];
        [params.jf, params.df] = [params.df, params.jf];
        data[index].rd_amount = params.rd_amount;
        data[index].rc_amount = params.rc_amount;
        data[index].jf = params.jf;
        data[index].df = params.df;
        this.sumSingleMoney(data);
        this.setState({ data });
    };
    //复制行
    copyCol = (e, index, record) => {
        let { data } = this.state;
        let params = JSON.parse(JSON.stringify(record));
        params.Id = this.Guid();
        data.splice(index, 0, params);
        this.sumSingleMoney(data);
        this.setState({ data });
    };
    //删除行
    delCol = (e, index) => {
        let { data } = this.state;
        data.splice(index, 1);
        this.sumSingleMoney(data);
        this.setState({ data });
    };
    //上移
    moveUp = (e, index) => {
        let { data } = this.state;
        if (data.length > 1 && index !== 0) {
            data = this.swapItems(data, index, index - 1);
        } else message.warning("已经到顶，无法再上移", 1);
        this.setState({ data });
    };
    //下移
    moveDown = (e, index) => {
        let { data } = this.state;
        if (data.length > 1 && index !== data.length - 2) {
            data = this.swapItems(data, index, index + 1);
        } else message.warning("已经到底，无法再下移", 1);
        this.setState({ data });
    };
    //文本框值改变
    valueChange = (index, type, category, e) => {
        let { data } = this.state;
        let value = e.target ? e.target.value : e;
        switch (type) {
            case "input": {
                if (category === "exRate") {
                    data[index].exchange_rate = value;
                }
                if (category === "summary") data[index].summary = value;
            }
                break;
            case "checkbox": {
                value = e.target.checked;
                if (category === "isNotice") data[index].is_notice = value;
                if (category === "isSpecial") data[index].is_special = value;
            }
                break;
            case "select": {
                if (category === "currencyName") data[index].currency_id = value;
                if (category === "acctFName") data[index].acct_id = value;
            }
        }
        this.setState({ data });
    };

    //设置借贷方金额
    setMoneyChildren(type) {
        let children = [];
        moneyType.forEach((item, i) => {
            let style = i / 2 === 1 || i / 5 === 1 || i / 8 === 1 ? styles.blueline : i / 10 === 1 ? styles.redline : i / 12 === 1 ? styles.line : styles.grayline;
            let dataIndex = type === "rd_amount" ? item.jfkey : item.dfkey;
            let key = type === "rd_amount" ? item.jfkey : item.dfkey;
            let params = {
                title: item.type,
                width: 20,
                dataIndex: dataIndex,
                key: key,
                className: style,
                render: (text, record, index) => {
                    let { moenyData, isMoneyShow, isMoneyShowIndex, isMoneyShowType, data, isModify } = this.state;
                    let arr = [];
                    let yb = "";
                    if (data[index][type] !== null && data[index][type] !== "") {
                        yb = parseFloat(data[index][type].toString().replace(",", ""));
                        arr = this.digitalConversion(yb);
                    }
                    if (key === "jftenbillion" || key === "dftenbillion") {
                        const obj = {
                            children:
                                isMoneyShow && isMoneyShowIndex === index && isMoneyShowType === type && isModify ? (
                                    <InputNumber
                                        autoFocus
                                        step={0.01}
                                        min={0}
                                        max={9999999999999}
                                        onBlur={v => {
                                            this.onBlurMoeny(v, type);
                                        }}
                                        onChange={v => {
                                            this.moneyOnchangeData(v, index, type);
                                        }}
                                        className={styles.moenyInput}
                                        formatter={value => value.toString().replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3")}
                                        parser={value => value.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3")}
                                        defaultValue={yb ? yb : null}
                                    />
                                ) : (
                                    <span
                                        className={styles.moeny}
                                        onClick={event => {
                                            this.setmoneyChange(event, index, type);
                                        }}
                                    >
                                            {arr.length > 0
                                                ? arr.map((item, i) => {
                                                    if (item !== ".") return <div key={i}>{item}</div>;
                                                })
                                                : null}
                                        </span>
                                ),

                            props: {}
                        };
                        if (index + 1 === data.length) {
                            obj.children = (
                                <span className={styles.moeny}>
                                    {moenyData.length > 0
                                        ? moenyData.map((item, v) => {
                                            if (item.label === type && item.sum) {
                                                return item.value.map((value, i) => {
                                                    if (value !== ".") return <div key={i}>{value}</div>;
                                                });
                                            }
                                        })
                                        : null}
                                </span>
                            );
                        }
                        return obj;
                    } else return <span></span>;
                }
            };
            children.push(params);
        });
        return children;
    }

    setmoneyChange = (e, index, type) => {
        this.setState({ isMoneyShow: true, isMoneyShowIndex: index, isMoneyShowType: type });
    };

    //金额转数组
    digitalConversion(e) {
        let arr = [];
        if (parseFloat(e) || parseInt(e)) {
            let value = e.toString();
            for (let i = 0; i < value.length; i++) {
                arr.push(value[i]);
            }
            if (arr.indexOf(".") === -1) arr.push(".", "0", "0");
            if (arr[arr.length - 2] === ".") arr.push("0");
        }
        return arr;
    }

    //金额转大写
    digitUppercase(n) {
        var fraction = ["角", "分"];
        var digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
        var unit = [
            ["元", "万", "亿"],
            ["", "拾", "佰", "仟"]
        ];
        var head = n < 0 ? "欠" : "";
        n = Math.abs(n);
        var s = "";
        for (var i = 0; i < fraction.length; i++) {
            s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, "");
        }
        s = s || "整";
        n = Math.floor(n);
        for (var i = 0; i < unit[0].length && n > 0; i++) {
            var p = "";
            for (var j = 0; j < unit[1].length && n > 0; j++) {
                p = digit[n % 10] + unit[1][j] + p;
                n = Math.floor(n / 10);
            }
            s = p.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][i] + s;
        }
        return (
            head +
            s
                .replace(/(零.)*零元/, "元")
                .replace(/(零.)+/g, "零")
                .replace(/^整$/, "零元整")
        );
    }

    isNumber(s) {
        var regu = "^[0-9]+.?[0-9]*$";
        var re = new RegExp(regu);
        if (re.test(s)) {
            return true;
        } else {
            return false;
        }
    }

    sumMoeny(sumybjf, sumybdf, data) {
        data.forEach(item => {
            if (item.summary && item.sum) {
                item.summary = `合计（人民币元）：${this.digitUppercase(sumybjf.toFixed(2))}`;
                item.rd_amount = sumybjf;
                item.rc_amount = sumybdf;
            }
        });
        this.setState({ data });
    }

    //原币金额变化
    debitOnchange = (index, exRate, type, e) => {
        let { data } = this.state;
        let amout = (exRate ? parseFloat(e) * exRate : parseFloat(e)).toFixed(2);
        if (type === "rd_amount") {
            data[index].oc_amount = "";
            data[index].rc_amount = "";
            data[index].rd_amount = amout;
            data[index].od_amount = e.toString();
        }
        if (type === "rc_amount") {
            data[index].od_amount = "";
            data[index].rd_amount = "";
            data[index].rc_amount = amout;
            data[index].oc_amount = e.toString();
        }
        this.sumSingleMoney(data);
        this.setState({ data });
    };

    //金额总和
    sumSingleMoney(data) {
        let { moenyData } = this.state;
        moenyData = [];
        let sumybjf = 0;
        let sumybdf = 0;
        data.forEach(item => {
            if (item.rd_amount !== null && item.rd_amount !== "" && !item.sum) {
                let value = parseFloat(item.rd_amount.toString().replace(",", ""));
                // let value = parseFloat(item.rd_amount);
                sumybjf += value;
            }
            if (item.rc_amount !== null && item.rd_amount !== "" && !item.sum) {
                let value = parseFloat(item.rc_amount.toString().replace(",", ""));
                // let value = parseFloat(item.rc_amount);
                sumybdf += value;
            }
        });
        if (sumybjf !== 0) {
            let sumybjfValue = this.digitalConversion(sumybjf.toFixed(2));
            let sumParams = { label: "rd_amount", sum: true, value: sumybjfValue };
            moenyData.push(sumParams);
        } else {
            moenyData.filter(v => v.label !== "rd_amount");
        }
        if (sumybdf !== 0) {
            let sumybdfValue = this.digitalConversion(sumybdf.toFixed(2));
            let sumParams = { label: "rc_amount", sum: true, value: sumybdfValue };
            moenyData.push(sumParams);
        } else {
            moenyData.filter(v => v.label !== "rc_amount");
        }
        this.sumMoeny(sumybjf, sumybdf, data);
        this.setState({ moenyData });
    }

    //借贷金额变化
    moneyOnchangeData = (e, index, type) => {
        let isnum = this.isNumber(e);
        if (isnum) {
            let { data } = this.state;
            if (type === "rd_amount") {
                data[index].rd_amount = e.toString();
                data[index].rc_amount = "";
            }
            if (type === "rc_amount") {
                data[index].rd_amount = "";
                data[index].rc_amount = e.toString();
            }
            this.sumSingleMoney(data);
            this.setState({ data });
        }
    };
    //输入金额失去焦点
    onBlurMoeny = (index, type) => {
        this.setState({ isMoneyShow: false });
    };

    //初始化设置金额
    setMoney(data) {
        let { columns, filterColumns, isModify, isCol } = this.state;
        columns.forEach(item => {
            if (item.key === "rd_amount") {
                let children = this.setMoneyChildren(item.key);
                item.children = children;
            }
            if (item.key === "rc_amount") {
                let children = this.setMoneyChildren(item.key);
                item.children = children;
            }
            if (item.key === "row_number") {
                item.width = isModify ? 120 : 60;
            }
        });
        filterColumns = columns;
        filterColumns = filterColumns.filter(v => v.show);
        // if (data.length === 0) {
        // 	for (let i = 1; i < 5; i++) {
        // 		let params = JSON.parse(JSON.stringify(cloumsparams));
        // 		params.vch_entry_id = this.Guid();
        // 		data.splice(data.length, 0, params);
        // 	}
        // }
        let total = {
            vch_entry_id: this.Guid(),
            sum: true,
            summary: "合计（人民币元）：",
            rd_amount: "",
            rc_amount: ""
        };
        let d = data.filter(v => v.sum);
        GetAsstItemList;
        if (d.length === 0) data.push(total);
        this.sumSingleMoney(data);
        this.setState({ filterColumns });
    }

    async accSetSelect(val, date) {
        let { vchDate } = this.state;
        this.props.form.setFieldsValue({
            VchSortName: ""
        });
        this.setState({ accSetId: val });
        let vchdate = date ? date : vchDate;
        this.commonVch(val, vchdate);
    }

    async tabCallback(key) {
        this.setState({ isLoading: true, vchentryIndex: null, asstEntryData: [] });
        const vch = await GetVch({ vchid: key });
        let _vch = vch.data;
        if (_vch.State === 1) {
            let data = _vch.Data.list_vch_entry;
            this.setState({ vchData: _vch.Data, data });
            this.setMoney(data);
            let { accset_id, vch_date } = _vch.Data;
            this.accSetSelect(accset_id, formatDate(vch_date));
        }
    }

    vchDateChange = val => {
        this.setState({ vchDate: val });
    };

    async setData(asstSortId, asstItemId, asstItemData, keywords) {
        let { accSetId, vchentryId, vchDate } = this.state;
        let params = {
            accset_id: accSetId,
            asstSortId,
            pid: asstItemId,
            startDate: vchDate,
            endDate: vchDate,
            keywords: keywords ? keywords : ""
        };
        const asstItem = await GetAsstItemList(params);
        let _asstItem = asstItem.data;

        if (_asstItem.State === 1) {
            let paramsData = [];
            _asstItem.Data.forEach(item => {
                let params = {
                    id: item.asst_item_id,
                    pId: item.parent_id,
                    value: item.asst_item_id,
                    title: item.asst_item_name,
                    sortid: item.asst_sort_id,
                    vchentryid: vchentryId,
                    isLeaf: item.is_lowest === 0 ? false : true,
                    selectable: item.is_lowest === 0 ? false : true
                };
                paramsData.push(params);
            });
            if (asstItemData.length > 0) {
                asstItemData = asstItemData.concat(paramsData);
            } else asstItemData = paramsData;
            this.setState({
                asstItemData
            });
        }
    }

    async commonVch(accSetId, vch_date) {
        let accy = moment(vch_date).format("YYYY");
        let { asstSelectData } = this.state;
        //会计科目
        const asstByVch = await GetAcctList({ accSetId, accy });
        let _asstByVch = asstByVch.data;
        if (_asstByVch.State === 1) {
            this.setState({ asstByVchData: _asstByVch.Data });
            _asstByVch.Data.forEach((item, index) => {
                if (index < 10) asstSelectData.push(item);
            });
            this.setState({ asstSelectData });
        }
        //凭证类别
        const vchShort = await GetVchSort({ accSetId, accy });
        let _vchShort = vchShort.data;
        if (_vchShort.State === 1) {
            this.setState({ vchSortData: _vchShort.Data });
        }
        //账套货币
        let vchDate = formatDate(vch_date);
        const currency = await GetAccSetCurrency({ accSetId, vchDate });
        let _currency = currency.data;
        if (_currency.State === 1) {
            this.setState({ currencyData: _currency.Data });
        }
        //常用摘要
        const summary = await GetSummary({ accSetId });
        let _summary = summary.data;
        if (_summary.State === 1) {
            this.setState({
                summaryData: _summary.Data,
                isLoading: false
            });
        }
    }

    onLoadData = (id, treeNode) =>
        new Promise(resolve => {
            const { value } = treeNode.props;
            let { asstItemData } = this.state;
            setTimeout(() => {
                this.setData(id, value, asstItemData);
                resolve();
            }, 300);
        });

    async init(vchCountData) {
        if (vchCountData && vchCountData.length > 0) {
            this.setState({ isLoading: true });
            let orgId = JSON.parse(localStorage.getItem("author")).currentDeptId;
            //分录
            const vch = await GetVch({ vchid: vchCountData[0].vch_id });
            let _vch = vch.data;
            if (_vch.State === 1) {
                let { list_vch_entry, accset_id } = _vch.Data;
                let data = list_vch_entry;
                let { columns } = this.state;
                data.forEach(item => {
                    if (item.is_special === 1) {
                        columns.forEach(item => {
                            if (item.key === "is_special")
                                item.show = true;
                        });
                        return;
                    }
                    if (item.is_notice === 1) {
                        columns.forEach(item => {
                            if (item.key === "is_notice")
                                item.show = true;
                        });
                        return;
                    }
                });
                this.setState({ vchData: _vch.Data, data, vchDate: formatDate(_vch.Data.vch_date) });
                this.setMoney(data);
                //账套名称
                const acc = await GetAccSet({ orgId: accset_id ? accset_id : orgId });
                let _acc = acc.data;
                let accSetId = _vch.Data ? accset_id : _acc.Data[0].accset_id;
                if (_acc.State === 1) {
                    this.setState({
                        accData: _acc.Data,
                        accSetId
                    });
                    this.commonVch(accSetId, _vch.Data.vch_date);
                }
            }
        } else {
            this.setState({ vchentryIndex: null, vchData: [] });
        }
    }

    componentWillReceiveProps(nextProps) {
        // let { isModify /*vchCount*/ } = this.state;
        // let {
        // 	// proxyState: { vchCountData },
        // 	authority
        // } = nextProps;
        // if (JSON.stringify(vchCount) !== JSON.stringify(vchCountData)) {
        // 	vchCount = vchCountData;
        // 	this.init(vchCountData);
        // 	this.setState({ vchCount });
        // }
        // if (authority && authority.voucher_isModify) {
        // 	let modify = authority.voucher_isModify.disabled;
        // 	if (modify !== isModify) this.setState({ isModify: modify });
        // }
    }

    toggerCardbody = () => {
        this.setState({
            cardbodystate: !this.state.cardbodystate
        });
    };

    async getVchCount(data, forminstanceid) {
        const generate = await GenerateVoucher(data);
        let _generate = generate.data;
        if (_generate.State === 1) {
            const vchCount = await GetVchCount({ forminstanceid });
            let _vchCount = vchCount.data;
            if (_vchCount.State === 1) {
                this.setState({ vchCountData: _vchCount.Data, preBtnLoading: false });
                this.init(_vchCount.Data);
            }
        } else {
            this.setState({ preBtnLoading: false });
            Modal.error({
                title: "凭证预览失败",
                content: _generate.Message,
                okText: "确定",
                onOk() {
                }
            });
        }
    }

    preview = () => {
        this.setState({ preBtnLoading: true, asstEntryData: [] });
        let t = this;
        this.props.getFormData(({ submitData, formInstanceId, formList }) => {
            t.props.getOtherBussinessProxyState({
                businessKey: "workFlow",
                onSuccess: ({ otherProxyState }) => {
                    let mainForm = formList.find(v => v.formType === 0);
                    let tree = submitTree(submitData, formList, formInstanceId);
                    let OrgId = JSON.parse(localStorage.getItem("author")).currentDeptId;
                    let extraParams = otherProxyState.extraParams;
                    let voucherTemplateId = "";
                    if (extraParams !== null && extraParams.extraDatas && extraParams.extraDatas.length > 0) {
                        extraParams.extraDatas.forEach(item => {
                            if (item.voucherTemplate) {
                                voucherTemplateId = item.voucherTemplate.ids;
                            }
                        });
                    }
                    let data = {
                        formInstanceId: formInstanceId,
                        voucherTemplateId,
                        formId: otherProxyState.query.formTemplateId,
                        OrgId,
                        isPrivew: 1, //this.state.isModify ? 0 : 1,
                        // formInstanceId: "c5f_ec01a0",
                        // voucherTemplateId: "c5f2696b-1804-4dc5-b709-0c05d7cc4775",
                        // formId: "ec01a0fe-864e-adaf-fe3e-fa798b76ace7",
                        // OrgId: "B5D77B5D-CE8C-42BF-83DE-89BD332652BB",
                        workflowid: otherProxyState.instanceID,
                        formData: tree
                    };
                    this.getVchCount(data, formInstanceId);
                }
            });
        });
    };

    render() {
        const { getFieldDecorator, setFieldsValue } = this.props.form;
        let {
            filterColumns,
            data,
            isSava,
            isCol,
            isSubjectDetails,
            subjectDetailscolumns,
            auxiliarycolumns,
            isModify,
            accData,
            vchSortData,
            vchData,
            asstEntryData,
            isLoading,
            vchentryIndex,
            cardbodystate,
            preBtnLoading
        } = this.state;
        let { readOnly } = this.props.proxyState;
        let { vchCountData, vchentryId } = this.state;
        let { authority } = this.props;
        let { accset_id, vch_date, vch_sort_id, attachments, list_vch_entry, remark } = vchData;
        let add = `${styles.btn} ${styles.add}`;
        let save = `${styles.btn} ${styles.sava}`;
        return (
            <React.Fragment>
                {authority && authority.voucher_isModify && authority.voucher_isModify.hidden === false ? (
                    <div className={styles.voucherMain}>
                        <Collapse
                            defaultActiveKey={["1"]}
                            onChange={this.toggerCardbody}
                            expandIcon={() => (
                                <Icon
                                    style={{
                                        fontSize: "15px"
                                    }}
                                    type={cardbodystate ? "down" : "left"}
                                />
                            )}
                        >
                            <Panel header="凭证信息" key="1">
                                <Button type="primary" style={{ marginBottom: "5px" }} icon="sync"
                                        onClick={this.preview} loading={preBtnLoading}
                                        disabled={authority.voucher_isModify.hidden || readOnly}>
                                    预览凭证
                                </Button>
                                {vchCountData && vchCountData.length > 0 ? (
                                    <Tabs animated={false} onChange={this.tabCallback.bind(this)}>
                                        {vchCountData.map((item, index) => {
                                            return (
                                                <TabPane tab={item.vchtitle} key={item.vch_id}>
                                                    <div className={styles.main}>
                                                        {/* {isLoading ? (
															<div>
																<div className={styles.mask}></div>
																<div className={styles.mainSpain}>
																	<Spin tip="Loading..." />
																</div>
															</div>
														) : null} */}
                                                        {/* <div className={styles.title}>凭证表单</div> */}
                                                        <Form className={styles.form}>
                                                            <Row gutter={24}>
                                                                <Col span={8}>
                                                                    <Form.Item label="账套名称">
                                                                        {getFieldDecorator("AccSetName", {
                                                                            initialValue: accData && accData[0] ? accData[0].accset_id : null
                                                                        })(
                                                                            <Select placeholder="请选择"
                                                                                    disabled={!isModify ? true : false}
                                                                                    onSelect={this.accSetSelect.bind(this)}>
                                                                                {accData
                                                                                    ? accData.map((item, index) => {
                                                                                        return (
                                                                                            <Option key={index}
                                                                                                    value={item.accset_id}>
                                                                                                {item.accset_name}
                                                                                            </Option>
                                                                                        );
                                                                                    })
                                                                                    : null}
                                                                            </Select>
                                                                        )}
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={8}>
                                                                    <Form.Item label="凭证日期">
                                                                        {getFieldDecorator("VchDate", {
                                                                            initialValue: vchData ? moment(vch_date, "YYYY-MM-DD") : moment(new Date(), "YYYY-MM-DD")
                                                                        })(
                                                                            <DatePicker
                                                                                format={"YYYY-MM-DD"}
                                                                                onChange={this.vchDateChange.bind(this)}
                                                                                disabled={!isModify ? true : false}
                                                                            />
                                                                        )}
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={8}>
                                                                    <Form.Item label="凭证类别">
                                                                        {getFieldDecorator("VchSortName", {
                                                                            initialValue: vchData ? vch_sort_id : null
                                                                        })(
                                                                            <Select placeholder="请选择"
                                                                                    disabled={!isModify ? true : false}>
                                                                                {vchSortData
                                                                                    ? vchSortData.map((item, index) => {
                                                                                        return (
                                                                                            <Option key={index}
                                                                                                    value={item.vch_sort_id}>
                                                                                                {item.vch_sort_name}
                                                                                            </Option>
                                                                                        );
                                                                                    })
                                                                                    : null}
                                                                            </Select>
                                                                        )}
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={8}>
                                                                    <Form.Item label="附件张数">
                                                                        {getFieldDecorator("Attachments", {
                                                                            initialValue: vchData ? attachments : null
                                                                        })(<InputNumber min={0}
                                                                                        readOnly={!isModify ? true : false}/>)}
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={9}>
                                                                    <Form.Item label="备注">
                                                                        {getFieldDecorator("remark", {
                                                                            initialValue: vchData ? remark : null
                                                                        })(<Input
                                                                            readOnly={!isModify ? true : false}/>)}
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={7}>
                                                                    <Form.Item>
                                                                        <div className={styles.checkbox}>
                                                                            <Checkbox.Group options={options}
                                                                                            disabled={!isModify ? true : false}
                                                                                            onChange={this.checkboxOnChange.bind(this)}/>
                                                                        </div>
                                                                    </Form.Item>
                                                                </Col>
                                                            </Row>
                                                        </Form>
                                                        <div className={styles.table}>
                                                            <div className={styles.option}>
                                                                {isModify ? (
                                                                    <div>
                                                                        <div className={add}
                                                                             onClick={this.addVoucher.bind(this)}>
                                                                            新增
                                                                        </div>
                                                                        {/* {!isSava ? <div className={`${styles.btn}`} onClick={this.modifyVoucher.bind(this)}>修改</div> : null} */}
                                                                        {isSava ? (
                                                                            <div className={save}
                                                                                 onClick={this.saveVoucher.bind(this)}>
                                                                                保存
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                ) : null}
                                                                {/* {isSava ? <div className={`${styles.btn}`} onClick={this.cancelVoucher.bind(this)}>取消</div> : null} */}
                                                                {/* <div className={styles.checkbox}>
							<Checkbox.Group options={options} defaultValue={["is_notice"]} onChange={this.checkboxOnChange.bind(this)} />
						</div> */}
                                                            </div>
                                                            <Table
                                                                columns={filterColumns}
                                                                dataSource={data}
                                                                bordered
                                                                scroll={{
                                                                    x: isCol ? 1500 : 0,
                                                                    y: data && data.length > 6 ? 300 : 0
                                                                }}
                                                                size="middle"
                                                                // footer={() => footer}
                                                                rowKey={record => record.vch_entry_id}
                                                                pagination={false}
                                                                // className={isCol ? styles.tableCol : styles.tableDefault}
                                                                className={styles.tableDefault}
                                                                // components={this.components}
                                                                onRow={(record, index) => ({
                                                                    index: data.length === index + 1 ? 0 : index,
                                                                    // moveRow: this.moveRow,
                                                                    onMouseEnter: event => {
                                                                        this.onMouseEnter(index);
                                                                    },
                                                                    onMouseLeave: event => {
                                                                        this.onMouseLeave(index);
                                                                    },
                                                                    onClick: event => {
                                                                        !isModify && data.length !== index + 1 && vchentryId !== record.vch_entry_id
                                                                            ? this.onRowClick(record.vch_entry_id, record.acct_id, index + 1, record.accy)
                                                                            : null;
                                                                    }
                                                                })}
                                                            />
                                                            <div className={styles.entry}>辅助信息{vchentryIndex ?
                                                                <span>-分录{vchentryIndex}</span> : null}</div>
                                                            <Table
                                                                size="middle"
                                                                bordered
                                                                scroll={asstEntryData && asstEntryData.length > 4 ? { y: 200 } : { y: 0 }}
                                                                dataSource={asstEntryData}
                                                                columns={auxiliarycolumns}
                                                                rowKey={record => record.asst_sort_id}
                                                                locale={{ emptyText: "暂无数据" }}
                                                                pagination={false}
                                                                className={styles.auxiliary}
                                                            />
                                                        </div>
                                                        {isSubjectDetails ? (
                                                            <Modal
                                                                width={1200}
                                                                title="科目余额"
                                                                visible={isSubjectDetails}
                                                                onCancel={this.subjectDetailsCancel}
                                                                className={styles.kemu}
                                                                cancelText="关闭"
                                                            >
                                                                <Table size="middle" bordered
                                                                       columns={subjectDetailscolumns}
                                                                       className={styles.tableDefault}
                                                                       pagination={false}/>
                                                            </Modal>
                                                        ) : null}
                                                    </div>
                                                </TabPane>
                                            );
                                        })}
                                    </Tabs>
                                ) : null}
                            </Panel>
                        </Collapse>
                    </div>
                ) : null}
            </React.Fragment>
        );
    }
}

let VoucherForm = Form.create()(Voucher);

export default {
    name: "凭证",
    key: "voucher",
    summary: "凭证",
    //挂载检测
    fieldAuth: [{ name: "凭证", key: "voucher_isModify" }],
    // loadCheck: ({ query }) => {
    // 	return true;
    // },
    //业务组件初始化时
    // onInit: async ({ query, proxyState, setPermission, setSubmitInfo, setProxyState }) => {

    // },
    //表单数据加载后调用
    onLoaded: async ({ query, proxyState, setPermission, setSubmitInfo, setProxyState, readOnly, workFlowId, formInstanceId }) => {
        // const vchCount = await GetVchCount({ forminstanceid: "865703D0-1997-4F5C-B304-6D2206C04DCC" /*formInstanceId*/ });
        // let _vchCount = vchCount.data;
        // if (_vchCount.State === 1) {
        // 	setProxyState({ vchCountData: _vchCount.Data });
        // }
        setProxyState({
            readOnly,
            query
        });
    },
    //校验回调 返回   {success::bool,msg::string}  success=false 中止提交
    onAuthority: ({ proxyState, formDataModel }) => {
        return { success: true };
    },
    //提交前回调 返回  {success::bool,msg::string}  success=false 中止提交
    beforeSubmit: async ({ params, proxyState, formDataModel, setProxyState }) => {
    },
    //普通按钮回调
    onClick: async ({ query, params, proxyState, setProxyState }) => {
    },
    //提交按钮回调 返回  {success::bool,msg::string}  success=false 提交失败
    onSubmit: async ({ params, proxyState, submitData, query }) => {
    },
    //控件注入
    components: voucher, //ApprovalSteps,
    //初始化状态
    initialProxyState: { visible: false },
    //依赖
    rely: []
};

function voucher(props) {
    // let { vchCountData } = props.proxyState;
    // async function tabCallback(key) {
    // 	const vch = await GetVch({ vchid: key });
    // 	let _vch = vch.data;
    // 	if (_vch.State === 1) {
    // 		props.setProxyState({ vchData: _vch.Data });
    // 	}
    // }
    return (
        <VoucherForm authority={props.authority} proxyState={props.proxyState} getFormData={props.getFormData}
                     getOtherBussinessProxyState={props.getOtherBussinessProxyState}/>
    );
}
