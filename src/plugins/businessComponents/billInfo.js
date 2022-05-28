import {
    GetInvoiceFolder,
    GetTrafficTicket,
    Save,
    TrafficTicketGetList,
    InvoicePoolGetList,
    GetInvoiceCategory,
    EditCategory
} from "../../services/Invoice/Invoice";
import moment from "moment";
import debounce from 'lodash/debounce';
import styles from "./billInfo.less";
import { Button, Table, Tabs, message, Modal, Form, Input, Select, Collapse, Icon, InputNumber, Dropdown, Menu, Pagination, Switch } from "antd";//ui库
const moneyRender = val => <div style={{ textAlign: 'right' }}>{format(val)}</div>;
//格式化数字
function format(number) {
    const num = number && Number(number).toFixed(2);
    const regExpInfo = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g;
    return num ? num.replace(regExpInfo, "$1,") : null;
}

function isEmpty(obj) {
    if (typeof obj === "undefined" || obj === null || obj === "") {
        return true;
    } else {
        return false;
    }
}

const toFixed = (num, n = 2) => {
    num = Number(num);
    if (num < 0) {
        num = -num
    } else {
        return parseInt(((num * (Math.pow(10, n))) + 0.5), 10) / Math.pow(10, n)
    }
    return -(parseInt(((num * (Math.pow(10, n))) + 0.5), 10) / Math.pow(10, n))
}

// 两个浮点数求和
const add = (num1, num2) => {
    num1 = Number(num1);
    num2 = Number(num2);
    let r1, r2, m
    try {
        r1 = `${num1}`.split('.')[1].length
    } catch (e) {
        r1 = 0
    }
    try {
        r2 = `${num2}`.split('.')[1].length
    } catch (e) {
        r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    return Math.round(num1 * m + num2 * m) / m
}
// 两个浮点数相减
const sub = (num1, num2) => {
    num1 = Number(num1);
    num2 = Number(num2);
    let r1, r2, m, n
    try {
        r1 = `${num1}`.split('.')[1].length
    } catch (e) {
        r1 = 0
    }
    try {
        r2 = `${num2}`.split('.')[1].length
    } catch (e) {
        r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    n = (r1 >= r2) ? r1 : r2
    return toFixed((Math.round(num1 * m - num2 * m) / m), n)
}
// 两个浮点数相乘
const mul = (num1, num2) => {
    num1 = Number(num1);
    num2 = Number(num2);
    let m = 0, s1 = `${num1}`, s2 = `${num2}`
    try {
        m += s1.split('.')[1].length
    } catch (e) { }
    try {
        m += s2.split('.')[1].length
    } catch (e) { }
    return Number(s1.replace('.', '')) *
        Number(s2.replace('.', '')) /
        Math.pow(10, m)
}
// 两个浮点数相除
const div = (num1, num2) => {
    num1 = Number(num1);
    num2 = Number(num2);
    let t1, t2, r1, r2
    try {
        t1 = `${num1}`.split('.')[1].length
    } catch (e) {
        t1 = 0
    }
    try {
        t2 = `${num2}`.toString().split('.')[1].length
    } catch (e) {
        t2 = 0
    }
    r1 = Number(`${num1}`.replace('.', ''))
    r2 = Number(`${num2}`.toString().replace('.', ''))
    return (r1 / r2) * Math.pow(10, t2 - t1)
}

async function VerifyIsHave(params) {
    //{}
    return fetch(`${config.serverInvoiceAssistantOpenApiIp}/InvoiceAssistant/VerifyIsHave`, {
        method: 'POST',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),//{TID:string,DocumentID:string}
        headers: {
            'Content-Type': "application/json",
            // 'Authorization':
        },
    }).then(res => res.json());
}

async function BatchModifyTemporaryStatus(params) {
    //{}
    return fetch(`${config.serverInvoiceAssistantOpenApiIp}/InvoiceAssistant/BatchModifyTemporaryStatus`, {
        method: 'POST',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params),//{TID:string,DocumentID:string}
        headers: {
            'Content-Type': "application/json"
        },
    }).then(res => res.json());
}

async function bindTempDoc(params) {
    //{}
    return fetch(`${config.systemImage}/api/BindingTempDocument`, {
        method: 'POST',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params)//{TID:string,DocumentID:string}
    }).then(res => res.json());
}

async function unbindTempDoc(params) {
    //{}
    return fetch(`${config.systemImage}/api/UnBindingTempDocument`, {
        method: 'POST',
        mode: 'cors',
        traditional: true,
        body: JSON.stringify(params)//{TID:string,DocumentID:string}
    }).then(res => res.json());
}

//判断连号
function continuity(arr, dataIndex) {
    var result = [],
        i = 0;
    result[i] = [arr[0]];
    arr.reduce((prev, cur) => {
        cur[dataIndex] - prev[dataIndex] === 1 ? result[i].push(cur) : result[++i] = [cur];
        return cur;
    });
    return result.filter(e => e.length > 1);
}

const Guid = () => {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

const otherInputTypes = {
    0: '专票',
    1: '普票',
    21: '机打发票',
    22: '定额发票',
    23: '增值税（卷票）',
    50: '其他发票',
    // 99: '小票'
};

const trafficInputTypes = {
    15: '航空运输电子客票行程单',
    16: '铁路车票',
    17: '出租车票',
    18: '汽车票',
    19: '船票',
    20: '过路过桥费'
};

const inputTypes = {
    0: "移动端录入",
};

const limitDecimals = (value) => {
    const reg = /^(\-)*(\d+)\.(\d\d).*$/;
    if (typeof value === 'string') {
        if (!isNaN(Number(value))) {
            if (Number(value) > 999999999999.99) {
                value = '999999999999.99'
            }
        }
        return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
    } else if (typeof value === 'number') {
        if (value > 999999999999.99) {
            value = 999999999999.99
        }
        return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
    } else {
        return ''
    }
};



const otherColumns = [
    {
        title: "序号",
        dataIndex: "num",
        key: "num",
        render: (val, record, index) => {
            return index + 1;
        },
        align: 'center',
    },
    {
        title: "发票类别",
        dataIndex: "typeDesc",
        key: "typeDesc",
        align: 'center',
    },
    {
        title: "是否认证",
        dataIndex: "isCertification",
        key: "isCertification",
        align: 'center',
        render: (val) => isEmpty(val) ? "是" : (val ? "是" : "否")
    },
    {
        title: "发票标签",
        dataIndex: "categoryName",
        align: 'center',
        key: "categoryName",
    },
    {
        title: "发票标签ID",
        dataIndex: "category",
        align: 'center',
        key: "category",
    },
    {
        title: "商品名称",
        align: 'center',
        dataIndex: "goodsName",
        key: "goodsName",
        width: 240,
        render: (val, record) => <div style={{ textOverflow: "ellipsis", whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }} title={val || record.productName}>{val || record.productName}</div>
    },
    // {
    //     title: "规格型号",
    //     align:'center',
    //     dataIndex: "spec",
    //     key: "spec",
    // },
    {
        title: "单位",
        align: 'center',
        dataIndex: "unit",
        key: "unit",
    },
    {
        title: "数量",
        align: 'center',
        dataIndex: "quantity",
        key: "quantity",
        render: (val, record) => isEmpty(record.quanlity) ? val : record.quanlity
    },
    {
        title: "发票代码",
        dataIndex: "invoiceCode",
        key: "invoiceCode",
        align: 'center',
    },
    {
        title: "发票号",
        dataIndex: "invoiceNumber",
        key: "invoiceNumber",
        align: 'center',
    },
    {
        title: "开票日期",
        align: 'center',
        dataIndex: "invoiceDate",
        key: "invoiceDate",
        render: (val) => moment(val).format('YYYY-MM-DD'),
    },
    {
        title: "税率",
        align: 'center',
        dataIndex: "taxRate",
        key: "taxRate",
        render: (val) => val ? `${val * 100}%` : val
    },
    {
        title: "价税合计",
        dataIndex: "valueAddedTax",
        key: "valueAddedTax",
        render: moneyRender,
        align: 'center',
    },
    {
        title: "金额",
        dataIndex: "amount",
        render: moneyRender,
        key: "amount",
        align: 'center',
    },
    {
        title: "税额",
        dataIndex: "tax",
        render: moneyRender,
        align: 'center',
        key: "tax"
    },
    {
        title: "查看影像",
        dataIndex: "attachment",
        align: 'center',
        key: "attachment",
    }
];

const trafficColumns = [
    {
        title: "序号",
        dataIndex: "num",
        key: "num",
        align: 'center',
        render: (val, record, index) => {
            return index + 1;
        }
    },
    {
        title: "发票类别",
        dataIndex: "typeDesc",
        key: "typeDesc",
        align: 'center',
    },
    {
        title: "发票标签",
        dataIndex: "categoryName",
        align: 'center',
        key: "categoryName",
    },
    {
        title: "发票标签ID",
        dataIndex: "category",
        align: 'center',
        key: "category",
    },
    {
        title: "录入方式",
        dataIndex: "inputType",
        align: 'center',
        key: "inputType",
        render: (val) => inputTypes[val]
    },
    {
        title: "出发地",
        dataIndex: "origin",
        align: 'center',
        key: "origin"
    },
    {
        title: "到达地",
        align: 'center',
        dataIndex: "destination",
        key: "destination"
    },
    {
        title: "发票代码",
        dataIndex: "idCardNo",
        key: "idCardNo",
        align: 'center',
    },
    {
        title: "发票号",
        dataIndex: "ticketCode",
        align: 'center',
        key: "ticketCode"
    },
    {
        title: "日期",
        dataIndex: "invoiceDateTime",
        align: 'center',
        render: (val) => moment(val).format('YYYY-MM-DD'),
        key: "invoiceDateTime"
    },
    // {
    //     title: "税率",
    //     dataIndex: "taxRate",
    //     align: 'center',
    //     key: "taxRate",
    //     render: (val) => val ? `${val * 100}%` : val
    // },
    {
        title: "价税合计",
        dataIndex: "valueAddedTax",
        align: 'center',
        render: moneyRender,
        key: "valueAddedTax"
    },
    {
        title: "民航发展基金",
        dataIndex: "devFund",
        render: moneyRender,
        align: 'center',
        key: "devFund"
    },
    {
        title: "飞机保险费",
        align: 'center',
        dataIndex: "insurance",
        render: moneyRender,
        key: "insurance"
    },
    {
        title: "金额",
        dataIndex: "amount",
        render: moneyRender,
        align: 'center',
        key: "amount"
    },
    {
        title: "税额",
        align: 'center',
        render: moneyRender,
        dataIndex: "tax",
        key: "tax"
    },
    {
        title: "查看影像",
        dataIndex: "attachment",
        align: 'center',
        key: "attachment",
    }
];

const otherTicketsColumns = [
    {
        title: "发票类别",
        dataIndex: "typeDesc",
        align: 'center',
        key: "typeDesc",
        width: 100,
        render: (val) => <div style={{ textOverflow: "ellipsis", whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }} title={val}>{val}</div>
    },
    {
        title: "发票标签",
        dataIndex: "categoryName",
        key: "categoryName",
        align: 'center',
        width: 180,
        render: (val) => <div style={{ textOverflow: "ellipsis", whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }} title={val}>{val}</div>
    },
    // {
    //     title: "是否已引用",
    //     dataIndex: "isUsed",
    //     key: "isUsed",
    //     align: 'center',
    //     render: (val) => val ? "是" : "否",
    //     width: 100,
    // },
    {
        title: "开票日期",
        dataIndex: "invoiceDate",
        render: (val) => moment(val).format('YYYY-MM-DD'),
        align: 'center',
        key: "invoiceDate",
        width: 120
    },
    {
        title: "金额",
        dataIndex: "amount",
        align: 'center',
        key: "amount",
        render: moneyRender,
        width: 100,
    },
    {
        title: "税额",
        dataIndex: "tax",
        key: "tax",
        render: moneyRender,
        align: 'center',
        width: 100,
    },
    {
        title: "商品名称",
        dataIndex: "goodsName",
        key: "goodsName",
        align: 'center',
        width: 240,
        render: (val) => <div style={{ textOverflow: "ellipsis", whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }} title={val}>{val}</div>
    },
    {
        title: "规格型号",
        dataIndex: "spec",
        align: 'center',
        key: "spec",
        width: 200,
        render: (val) => <div style={{ textOverflow: "ellipsis", whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }} title={val}>{val}</div>
    },
    {
        title: "单位",
        dataIndex: "unit",
        key: "unit",
        align: 'center',
        width: 100,
    },
    {
        title: "数量",
        align: 'center',
        dataIndex: "quantity",
        key: "quantity",
        render: (val, record) => isEmpty(record.quanlity) ? val : record.quanlity,
        width: 100,
    },
    {
        title: "发票代码",
        dataIndex: "invoiceCode",
        key: "invoiceCode",
        align: 'center',
    },
    {
        title: "发票号",
        dataIndex: "invoiceNumber",
        key: "invoiceNumber",
        align: 'center',
        width: 100,
    },
];

const trafficTicketsColumns = [
    {
        title: "发票类别",
        dataIndex: "typeDesc",
        key: "typeDesc",
        width: 100,
        align: 'center',
        render: (val) => <div style={{ textOverflow: "ellipsis", whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }} title={val}>{val}</div>
    },
    {
        title: "姓名",
        dataIndex: "name",
        key: "name",
        width: 80,
        align: 'center',
    },
    {
        title: "出发地",
        dataIndex: "origin",
        align: 'center',
        key: "origin",
        width: 80,
    },
    {
        title: "到达地",
        dataIndex: "destination",
        key: "destination",
        align: 'center',
        width: 80,
    },
    {
        title: "出发时间",
        render: (val, record) => moment(record.invoiceDateTime).format('YYYY-MM-DD'),
        dataIndex: "startingTime",
        align: 'center',
        key: "startingTime",
        width: 110,
    },
    {
        title: "发票标签",
        dataIndex: "categoryName",
        key: "categoryName",
        align: 'center',
        width: 180,
        render: (val) => <div style={{ textOverflow: "ellipsis", whiteSpace: 'nowrap', overflow: 'hidden', width: '100%' }} title={val}>{val}</div>
    },
    // {
    //     title: "是否已引用",
    //     dataIndex: "isUsed",
    //     key: "isUsed",
    //     align: 'center',
    //     render: (val) => val ? "是" : "否",
    //     width: 90,
    // },
    {
        title: "合计金额",
        dataIndex: "valueAddedTax",
        key: "valueAddedTax",
        align: 'center',
        render: moneyRender,
        width: 100,
    },
    {
        title: "金额",
        dataIndex: "amount",
        key: "amount",
        align: 'center',
        render: moneyRender,
        width: 100,
    },
    {
        title: "税额",
        dataIndex: "tax",
        key: "tax",
        render: moneyRender,
        align: 'center',
        width: 100,
    },
    {
        title: "开票日期",
        render: (val) => moment(val).format('YYYY-MM-DD'),
        dataIndex: "invoiceDateTime",
        key: "invoiceDateTime",
        align: 'center',
        width: 110,
    },
    {
        title: "发票代码",
        dataIndex: "idCardNo",
        align: 'center',
        key: "idCardNo",
    },
    {
        title: "发票号",
        dataIndex: "ticketCode",
        key: "ticketCode",
        align: 'center',
        width: 120
    },
];

const conditionMap = {
    tab: "发票标签",
    invoiceType: "发票类型",
    name: "商品名称",
    tax: "税额",
    valueAddedTax: "价税合计金额"
};

@Form.create()
class BillInfo extends React.Component {
    constructor(props) {
        super(props);
        const { setting = {} } = this.props;
        const { otherSwitchSet = true, trafficSwitchSet = true, orderSwitchSet = true } = setting;

        let key;
        if (orderSwitchSet) {
            if (otherSwitchSet === true && trafficSwitchSet === false) {
                key = '1';
            } else if (otherSwitchSet === false && trafficSwitchSet === true) {
                key = '2';
            } else {
                key = '2';
            }
        } else {
            if (otherSwitchSet === true && trafficSwitchSet === false) {
                key = '1';
            } else if (otherSwitchSet === false && trafficSwitchSet === true) {
                key = '2';
            } else {
                key = '1';
            }
        }

        this.state = {
            splitPage: {},//拆分分页
            selectSplitKeys: {},
            cardState: true,
            categoryModal: false,//标签弹窗
            splitData: {},//拆分数据
            splitModal: false,//拆分弹窗
            currentInvoice: '',
            visible: false,//弹窗显示
            imgVisible: false,//图片弹窗显示
            imgSrc: '',//图片链接
            key: key,//tabkey
            invoiceModalList: [],//专普票弹窗列表
            trafficTicketModalList: [],//交通票弹窗列表
            selectInvoice: [],//专普票弹窗选中列表
            selectTrafficTicket: [],//交通票弹窗选中列表
            invoiceDeletekeys: [],//专普票选中删除列表
            trafficTicketDeleteKeys: [],//交通票选中删除列表
            invoiceCategoryList: [],//标签列表
            pageIndex: 1,//标签分页
            invoiceTotal: 0,
            invoiceCurrent: 1,//专普票分页
            trafficTicketTotal: 0,
            trafficTicketCurrent: 1, //交通票分页
            deg: 0,
            scale: 1,
            left: 0,
            top: 0,
            dragging: false,
            preX: 0,
            preY: 0,
            styleTop: 100,
            styleLeft: 0,
        };

        this.area = React.createRef();
        this.img = React.createRef();
    }

    splitColumns = [{
        title: "价税合计金额",
        dataIndex: "valueAddedTax",
        key: "valueAddedTax",
        width: '40%',
        render: (val, record) => record.saved ? moneyRender(val) : <InputNumber onClick={e => { e.stopPropagation() }} onChange={(val) => this.splitValChange(val, record)} formatter={limitDecimals}
            parser={limitDecimals} step={0.01} value={val} />,
        align: 'center',
    },
    {
        title: "金额",
        dataIndex: "amount",
        width: '30%',
        render: (val, record) => record.saved ? moneyRender(val) : <InputNumber onClick={e => { e.stopPropagation() }} onChange={(val) => this.splitAmountChange(val, record)} formatter={limitDecimals}
            parser={limitDecimals} step={0.01} value={val} />,
        key: "amount",
        align: 'center',
    },
    {
        title: "税额",
        dataIndex: "tax",
        width: '30%',
        render: val => val === 0 ? <div style={{ textAlign: 'right' }}>0.00</div> : moneyRender(val),
        align: 'center',
        key: "tax"
    }];

    autoCompute = () => {
        const { splitData, currentInvoice, selectInvoice } = this.state;
        const current = splitData[currentInvoice] || {};
        const currentSplitData = current.data || [];
        if (current.saved || !currentSplitData.length) return;

        const result = currentSplitData.reduce((initArray, item, xindex, array) => {
            //initArray 初始值 或者是上一次调用返回的值
            //item 数组中当前被处理的元素
            //xindex 当前元素的下标
            //array 被reduce的数组  即上面代码中的数组a
            const id = item.id;
            if (initArray[id]) {
                initArray[id].push(item)
            } else {
                initArray[id] = [item]
            }
            return initArray
        }, []);

        let resultSplitData = {};

        for (const key in result) {
            if (result.hasOwnProperty(key)) {
                const arr = result[key];
                let valueAddedTax = 0;
                let amount = 0;
                let tax = 0;
                const splitParams = selectInvoice.filter(e => e.id === key)[0];

                arr.forEach(e => {
                    valueAddedTax = add(valueAddedTax, e.valueAddedTax);
                    amount = add(amount, e.amount);
                    tax = add(tax, e.tax);
                })

                const resultValueAddedTax = sub(splitParams.valueAddedTax, valueAddedTax);
                const resultAmount = sub(splitParams.amount, amount);
                const resultTax = sub(splitParams.tax, tax);

                let lastData = arr[arr.length - 1];
                lastData = {
                    ...lastData,
                    valueAddedTax: add(lastData.valueAddedTax, resultValueAddedTax),
                    amount: add(lastData.amount, resultAmount),
                    tax: add(lastData.tax, resultTax),
                }

                resultSplitData[lastData.splitId] = lastData;
            }
        }

        this.setState({
            splitData: {
                ...splitData,
                [currentInvoice]: {
                    saved: false,
                    data: currentSplitData.map(e => resultSplitData[e.splitId] ? resultSplitData[e.splitId] : e)
                }
            }
        })
    }

    componentDidMount() {
        document.onkeyup = (e) => {
            if (e.keyCode === 119) {
                this.autoCompute()
            }
        }
        document.onmousemove = (evt) => {
            if (this.state.dragging) {
                if (!this.state.dragging) return;
                const { preX, preY, styleLeft, styleTop } = this.state;
                const left = styleLeft + (evt.pageX - preX);
                const top = styleTop + (evt.pageY - preY);

                this.setState({
                    preX: evt.pageX,
                    preY: evt.pageY,
                    styleLeft: left,
                    styleTop: top,
                })
            }
        }
        document.onmouseup = (evt) => {
            this.setState({ dragging: false })
        }
    }

    onSplitRowClick = (record) => {
        const { currentInvoice, selectSplitKeys } = this.state;
        let currentKeys = selectSplitKeys[currentInvoice] || [];
        if (currentKeys.includes(record.splitId)) {
            currentKeys = currentKeys.filter(e => e !== record.splitId);
        } else {
            currentKeys = [...currentKeys, record.splitId];
        }

        this.setState({
            selectSplitKeys: {
                ...selectSplitKeys,
                [currentInvoice]: currentKeys
            }
        })
    }

    loadImg = DocumentId => {
        this.setState({
            imgVisible: true,
            deg: 0,
            imgSrc: `${config.systemImage}/api/LoadTempImage?TId=${DocumentId}`
        });
        // fetch(`${config.systemImage}/api/LoadTempImage?TId=${DocumentId}`, {
        //     method: "GET",
        //     mode: "cors",
        //     traditional: true
        // }).then(res => {
        //     res.json().then(data => {
        //         if (data.length) {
        //             this.setState({
        //                 imgSrc: data[0].Url
        //             })
        //         }
        //     });
        // });
    }

    tabChange = (key) => {
        this.setState({
            key
        });
    };

    // shouldComponentUpdate(nextProps, nextState) {
    //     return this.state.key !== nextState.key || this.state.visible !== nextState.visible ||
    //         this.state.imgVisible !== nextState.imgVisible || this.state.imgSrc !== nextState.imgSrc ||
    //         this.state.invoiceTotal !== nextState.invoiceTotal || this.state.trafficTicketTotal !== nextState.trafficTicketTotal ||
    //         this.state.invoiceCurrent !== nextState.invoiceCurrent || this.state.trafficTicketCurrent !== nextState.trafficTicketCurrent ||
    //         this.state.deg !== nextState.deg || this.props.proxyState.invoiceList.length !== nextProps.proxyState.invoiceList.length ||
    //         this.props.trafficTicketList.length !== nextProps.trafficTicketList.length;
    //     //invoiceList, trafficTicketList
    // }shou

    onSearch = () => {
        this.props.form.validateFields(['MinValueAddedTax', 'MaxValueAddedTax', this.state.key === "1" ? "InvoiceCode" : "idCardNo", this.state.key === "1" ? "InvoiceNumber" : "ticketCode"], (err, values) => {
            if (!err) {
                if (this.state.key === "1") {
                    this.setState({ invoiceCurrent: 1, selectInvoice: [], invoiceModalList: [], modalLoading: true }, function () {
                        GetInvoiceFolder({
                            ...values,
                            pageIndex: 1,
                            pageSize: 10
                        }).then(({ data: { invoiceForderList, pagination } }) => {
                            this.setState({
                                invoiceModalList: invoiceForderList.map(a => ({ ...a, operationStatus: 1 })),
                                invoiceTotal: pagination.totalCount,
                                modalLoading: false
                            });
                        });
                    })

                } else if (this.state.key === "2") {
                    this.setState({ trafficTicketCurrent: 1, selectTrafficTicket: [], trafficTicketModalList: [], modalLoading: true }, function () {
                        GetTrafficTicket({
                            ...values,
                            pageIndex: 1,
                            pageSize: 10
                        }).then(({ data: { trafficTicketList, pagination } }) => {
                            this.setState({
                                trafficTicketModalList: trafficTicketList.map(a => ({ ...a, operationStatus: 1 })),
                                trafficTicketTotal: pagination.totalCount,
                                modalLoading: false
                            });
                        });
                    })

                }
            }
        });
    };

    getInvoiceContinuity = (newList) => {
        //根据发票代码分类
        const invoiceCodes = Array.from(new Set(newList.map(e => e.invoiceCode)));
        let invoiceCodeObj = {};
        invoiceCodes.forEach(e => {
            const invoiceCodeArr = [];
            newList.forEach(ev => {
                if (ev.invoiceCode === e) {
                    invoiceCodeArr.push(ev);
                }
            });
            invoiceCodeObj[e] = invoiceCodeArr;
        });

        //判断连号
        let invoiceContinuity = {};

        for (const key in invoiceCodeObj) {
            if (invoiceCodeObj.hasOwnProperty(key)) {
                const e = invoiceCodeObj[key];
                const continuityArr = continuity(e.sort((a, b) => a.invoiceNumber - b.invoiceNumber), "invoiceNumber");
                if (continuityArr.length) {
                    invoiceContinuity[key] = continuityArr;
                }
            }
        }
        return invoiceContinuity;
    };

    getTrafficTicketContinuity = (newList) => {
        //根据发票代码分类
        const trafficTicketCodes = Array.from(new Set(newList.map(e => e.idCardNo)));
        let trafficTicketObj = {};
        trafficTicketCodes.forEach(e => {
            const trafficTicketCodeArr = [];
            newList.forEach(ev => {
                if (ev.idCardNo === e) {
                    trafficTicketCodeArr.push(ev);
                }
            });
            trafficTicketObj[e] = trafficTicketCodeArr;
        });

        //判断连号
        let trafficTicketContinuity = {};

        for (const key in trafficTicketObj) {
            if (trafficTicketObj.hasOwnProperty(key)) {
                const e = trafficTicketObj[key];
                const continuityArr = continuity(e.sort((a, b) => a.ticketCode - b.ticketCode), "ticketCode");
                if (continuityArr.length) {
                    trafficTicketContinuity[key] = continuityArr;
                }
            }
        }
        return trafficTicketContinuity;
    };

    openCategoryModal = () => {
        // if (this.state.invoiceCategoryList.length) {
        //     this.setState({
        //         categoryModal: true
        //     });
        //     return;
        // };

        GetInvoiceCategory({
            pageIndex: 1,
            pageSize: 10
        }).then(({ data: { invoiceCategoryList, pagination } }) => {
            this.setState({
                invoiceCategoryList,
                categoryModal: true,
                pageIndex: 1
            });
        });
    }

    editCategory = () => {
        const { key, selectInvoice, selectTrafficTicket, splitData } = this.state;

        this.props.form.validateFields(['category'], (err, values) => {
            if (!err) {
                if (key === "1") {//专普票

                    const data = selectInvoice.map(e => ({ Id: e.invoiceId, Category: values.category.key, InvoiceType: e.type }));
                    EditCategory({
                        TicketCategoryActionRequests: data,
                        Platform: 'CRMG'
                    }).then(result => {
                        //改变拆分数据标签
                        const selectKeys = selectInvoice.map(e => `${e.invoiceNumber}${e.invoiceCode}`);
                        let changeSplitData = {};
                        for (const key in splitData) {
                            if (splitData.hasOwnProperty(key)) {
                                const { data, saved } = splitData[key];
                                if (selectKeys.includes(key)) {
                                    changeSplitData[key] = {
                                        saved,
                                        data: data.map(e => ({ ...e, category: values.category.key, categoryName: values.category.label }))
                                    };
                                } else {
                                    changeSplitData[key] = {
                                        saved,
                                        data
                                    };
                                }
                            }
                        }
                        this.onPageChange(this.state.invoiceCurrent, 10);
                        this.setState({
                            selectInvoice: selectInvoice.map(e => ({ ...e, category: values.category.key, categoryName: values.category.label })),
                            categoryModal: false,
                            splitData: changeSplitData
                        });
                    });
                } else if (key === "2") {//交通票
                    const data = selectTrafficTicket.map(e => ({ Id: e.id, Category: values.category.key, InvoiceType: e.invoiceType }));
                    EditCategory({
                        TicketCategoryActionRequests: data,
                        Platform: 'CRMG'
                    }).then(result => {
                        this.onPageChange(this.state.trafficTicketCurrent, 10);
                        this.setState({
                            selectTrafficTicket: selectTrafficTicket.map(e => ({ ...e, category: values.category.key, categoryName: values.category.label })),
                            categoryModal: false
                        });
                    });
                }
            }
        })

    }

    onAdd = async () => {
        const { key, selectInvoice, selectTrafficTicket, splitData } = this.state;

        const { proxyState: { invoiceList, trafficTicketList, childList, disabledInvoiceKeys, disabledTrafficTicketKeys }, setProxyState, addRowData, setting = {} } = this.props;
        const { childFormSet = [] } = setting;

        if (key === "1") {
            const newList = invoiceList.concat(selectInvoice);

            //判断连号
            const invoiceContinuity = this.getInvoiceContinuity(newList);


            // const r = await BatchModifyTemporaryStatus({
            //     TemporaryStatusActionRequests: selectInvoice.map(e => ({ id: e.invoiceDetailId || e.invoiceId, TemporaryStatus: 1, InvoiceType: e.type, })),
            //     Platform: "CRMG"
            // });

            // if (r.errorType !== 0) return;

            this.setState({
                selectInvoice: [],
            }, () => {
                if (!childFormSet.length) {
                    setProxyState({
                        invoiceList: newList,
                        invoiceContinuity,
                        disabledInvoiceKeys: disabledInvoiceKeys.concat(selectInvoice.map(e => e.id))
                    });
                    return;
                }
                ;
                let newChildList = { ...childList };

                selectInvoice.forEach(item => {
                    const splitKey = `${item.invoiceNumber}${item.invoiceCode}`;

                    let splitItems = splitData[splitKey] && splitData[splitKey].data || [];

                    splitItems = splitItems.filter(e => e.id === item.id);

                    //专普票
                    childFormSet.filter(e => e.type === 1).forEach(childForm => {
                        const { childID, fields, conditions = [], childFormID } = childForm;

                        let rowData;
                        //子组件行数据
                        if (!splitItems.length) {//无拆分数据，直接推送该发票
                            rowData = {};
                            for (const key in fields) {
                                if (fields.hasOwnProperty(key)) {
                                    const field = fields[key];
                                    rowData[key] = item[field];
                                }
                            }
                        } else {
                            rowData = splitItems.map(e => {
                                let rows = {};
                                for (const key in fields) {
                                    if (fields.hasOwnProperty(key)) {
                                        const field = fields[key];
                                        rows[key] = e[field];
                                    }
                                }
                                return rows;
                            })
                        }

                        //没有条件时全推
                        if (conditions.length === 0) {
                            if (rowData instanceof Array) {//有拆分数据
                                rowData.forEach(e => {
                                    const rowID = addRowData(childID, e);
                                    const childItem = newChildList[item.id] || {};
                                    newChildList[item.id] = { ...e, rowID: [...(childItem.rowID || []), rowID], childID: [...(childItem.childID || []), childID], childFormID };
                                })
                            } else {
                                const rowID = addRowData(childID, rowData);
                                const childItem = newChildList[item.id] || {};
                                newChildList[item.id] = { ...rowData, rowID: [...(childItem.rowID || []), rowID], childID: [...(childItem.childID || []), childID], childFormID };
                            }
                            return;
                        }

                        //有条件时判断条件
                        const isAddArr = [];
                        conditions.forEach(condition => {
                            const { dataIndex, type, value } = condition;
                            let isAdd = false;
                            switch (dataIndex) {
                                case "tab"://发票标签
                                    switch (type) {
                                        case "eq"://等于
                                            if (item.category === value.key) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "in"://包含
                                            if ((value || []).map(e => e.key).includes(item.category)) {
                                                isAdd = true;
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case "invoiceType"://发票类型
                                    switch (type) {
                                        case "eq"://等于
                                            if (item.type === value) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "in"://包含
                                            if ((value || []).includes(item.type)) {
                                                isAdd = true;
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case "name":
                                    switch (type) {
                                        case "eq"://等于
                                            if (item.goodsName === value) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "neq"://不等于
                                            if (item.goodsName !== value) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "nin"://不包含
                                            if ((item.goodsName || '').indexOf(value) === -1) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "in"://包含
                                            if ((item.goodsName || '').indexOf(value) !== -1) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "em"://为空
                                            isAdd = isEmpty(item.goodsName);
                                            break;
                                        case "nem"://不为空
                                            isAdd = !isEmpty(item.goodsName);
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case "tax":
                                    switch (type) {
                                        case "eq"://等于
                                            if (item.tax === Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "neq"://不等于
                                            if (item.tax !== Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "gt"://大于
                                            if (item.tax > Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "gtoeq"://大于等于
                                            if (item.tax >= Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "lt"://小于
                                            if (item.tax < Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "ltoeq"://小于等于
                                            if (item.tax <= Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "sc"://范围
                                            const min = value[0] && Number(value[0]) || NaN;
                                            const max = value[1] && Number(value[1]) || NaN;
                                            if (item.tax > min && item.tax < max) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "em"://为空
                                            isAdd = isEmpty(item.tax);
                                            break;
                                        case "nem"://不为空
                                            isAdd = !isEmpty(item.tax);
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case "valueAddedTax":
                                    switch (type) {
                                        case "eq"://等于
                                            if (item.valueAddedTax === Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "neq"://不等于
                                            if (item.valueAddedTax !== Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "gt"://大于
                                            if (item.valueAddedTax > Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "gtoeq"://大于等于
                                            if (item.valueAddedTax >= Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "lt"://小于
                                            if (item.valueAddedTax < Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "ltoeq"://小于等于
                                            if (item.valueAddedTax <= Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "sc"://范围
                                            const min = value[0] && Number(value[0]) || NaN;
                                            const max = value[1] && Number(value[1]) || NaN;
                                            if (item.valueAddedTax > min && item.valueAddedTax < max) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "em"://为空
                                            isAdd = isEmpty(item.valueAddedTax);
                                            break;
                                        case "nem"://不为空
                                            isAdd = !isEmpty(item.valueAddedTax);
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                default:
                                    break;
                            }

                            isAddArr.push(isAdd);
                        });

                        if (isAddArr.includes(false)) {
                            return;
                        }

                        //添加
                        if (rowData instanceof Array) {//有拆分数据
                            rowData.forEach(e => {
                                const rowID = addRowData(childID, e);
                                const childItem = newChildList[item.id] || {};
                                newChildList[item.id] = { ...e, rowID: [...(childItem.rowID || []), rowID], childID: [...(childItem.childID || []), childID], childFormID };
                            })
                        } else {
                            const rowID = addRowData(childID, rowData);
                            const childItem = newChildList[item.id] || {};
                            newChildList[item.id] = { ...rowData, rowID: [...(childItem.rowID || []), rowID], childID: [...(childItem.childID || []), childID], childFormID };
                        }

                    });
                });

                setProxyState({
                    invoiceList: newList,
                    childList: newChildList,
                    invoiceContinuity,
                    disabledInvoiceKeys: disabledInvoiceKeys.concat(selectInvoice.map(e => e.id))
                });
            });
        } else if (key === "2") {
            const newList = trafficTicketList.concat(selectTrafficTicket);

            //判断连号
            const trafficTicketContinuity = this.getTrafficTicketContinuity(newList);

            // const r = await BatchModifyTemporaryStatus({
            //     TemporaryStatusActionRequests: selectTrafficTicket.map(e => ({ id: e.invoiceId || e.id, TemporaryStatus: 1, InvoiceType: e.invoiceType, })),
            //     Platform: "CRMG"
            // });

            // if (r.errorType !== 0) return;

            this.setState({
                selectTrafficTicket: [],
            }, () => {
                if (!childFormSet.length) {
                    setProxyState({
                        trafficTicketList: newList,
                        trafficTicketContinuity,
                        disabledTrafficTicketKeys: disabledTrafficTicketKeys.concat(selectTrafficTicket.map(e => e.id))
                    });
                    return;
                }

                let newChildList = { ...childList };

                selectTrafficTicket.forEach(item => {
                    //交通票
                    childFormSet.filter(e => e.type === 2).forEach(childForm => {
                        const { childID, fields, conditions = [], childFormID } = childForm;

                        //子组件行数据
                        let rowData = {};
                        for (const key in fields) {
                            if (fields.hasOwnProperty(key)) {
                                const field = fields[key];
                                rowData[key] = item[field];
                            }
                        }

                        //没有条件时全推
                        if (conditions.length === 0) {
                            const rowID = addRowData(childID, rowData);
                            const childItem = newChildList[item.id] || {};
                            newChildList[item.id] = { ...rowData, rowID: [...(childItem.rowID || []), rowID], childID: [...(childItem.childID || []), childID], childFormID };
                            return;
                        }

                        //有条件时判断条件
                        const isAddArr = [];
                        conditions.forEach(condition => {
                            const { dataIndex, type, value } = condition;
                            let isAdd = false;

                            switch (dataIndex) {
                                case "tab"://发票标签
                                    switch (type) {
                                        case "eq"://等于
                                            if (item.category === value.key) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "in"://包含
                                            if ((value || []).map(e => e.key).includes(item.category)) {
                                                isAdd = true;
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case "invoiceType"://发票类型
                                    switch (type) {
                                        case "eq"://等于
                                            if (item.invoiceType === value) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "in"://包含
                                            if ((value || []).includes(item.invoiceType)) {
                                                isAdd = true;
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case "name":
                                    switch (type) {
                                        case "eq"://等于
                                            if (item.goodsName === value) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "neq"://不等于
                                            if (item.goodsName !== value) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "nin"://不包含
                                            if ((item.goodsName || '').indexOf(value) === -1) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "in"://包含
                                            if ((item.goodsName || '').indexOf(value) !== -1) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "em"://为空
                                            isAdd = isEmpty(item.goodsName);
                                            break;
                                        case "nem"://不为空
                                            isAdd = !isEmpty(item.goodsName);
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case "tax":
                                    switch (type) {
                                        case "eq"://等于
                                            if (item.tax === Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "neq"://不等于
                                            if (item.tax !== Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "gt"://大于
                                            if (item.tax > Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "gtoeq"://大于等于
                                            if (item.tax >= Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "lt"://小于
                                            if (item.tax < Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "ltoeq"://小于等于
                                            if (item.tax <= Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "sc"://范围
                                            const num = value || [];
                                            const min = num[0] === 0 ? 0 : Number(num[0]);
                                            const max = num[1] === 0 ? 0 : Number(num[1]);

                                            if (item.tax > min && item.tax < max) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "em"://为空
                                            isAdd = isEmpty(item.tax);
                                            break;
                                        case "nem"://不为空
                                            isAdd = !isEmpty(item.tax);
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case "valueAddedTax":
                                    switch (type) {
                                        case "eq"://等于
                                            if (item.valueAddedTax === Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "neq"://不等于
                                            if (item.valueAddedTax !== Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "gt"://大于
                                            if (item.valueAddedTax > Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "gtoeq"://大于等于
                                            if (item.valueAddedTax >= Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "lt"://小于
                                            if (item.valueAddedTax < Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "ltoeq"://小于等于
                                            if (item.valueAddedTax <= Number(value)) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "sc"://范围
                                            const min = value[0] && Number(value[0]) || NaN;
                                            const max = value[1] && Number(value[1]) || NaN;
                                            if (item.valueAddedTax > min && item.valueAddedTax < max) {
                                                isAdd = true;
                                            }
                                            break;
                                        case "em"://为空
                                            isAdd = isEmpty(item.valueAddedTax);
                                            break;
                                        case "nem"://不为空
                                            isAdd = !isEmpty(item.valueAddedTax);
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                default:
                                    break;
                            }

                            isAddArr.push(isAdd);
                        });

                        if (isAddArr.includes(false)) {
                            return;
                        }


                        //添加
                        const rowID = addRowData(childID, rowData);
                        const childItem = newChildList[item.id] || {};
                        newChildList[item.id] = { ...rowData, rowID: [...(childItem.rowID || []), rowID], childID: [...(childItem.childID || []), childID], childFormID };
                    });
                });

                setProxyState({
                    trafficTicketList: newList,
                    childList: newChildList,
                    trafficTicketContinuity,
                    disabledTrafficTicketKeys: disabledTrafficTicketKeys.concat(selectTrafficTicket.map(e => e.id))
                });
            });
        }
    };

    onSelectChange = (record, selected, rows) => {
        const { selectInvoice, selectTrafficTicket, key, splitData, currentInvoice } = this.state;
        const current = splitData[currentInvoice] || {};
        const currentSplitData = current.data || [];
        if (!current.saved && currentSplitData.length !== 0) {
            return;
        }

        let newState;
        if (key === "1") {
            if (selected) {
                newState = { currentInvoice: `${record.invoiceNumber}${record.invoiceCode}`, selectSplitKeys: {}, selectInvoice: [...selectInvoice, ...this.state.invoiceModalList.filter(a => a.invoiceCode === record.invoiceCode && a.invoiceNumber === record.invoiceNumber)] };
            } else {
                const newSelectInvoice = selectInvoice.filter(a => a.invoiceCode !== record.invoiceCode || a.invoiceNumber !== record.invoiceNumber);
                const currentInvoice = newSelectInvoice.length ? `${newSelectInvoice[0].invoiceNumber}${newSelectInvoice[0].invoiceCode}` : '';
                newState = { currentInvoice, selectSplitKeys: {}, selectInvoice: newSelectInvoice };
            }
        } else if (this.state.key === "2") {
            if (selected) {
                newState = { selectTrafficTicket: [...selectTrafficTicket, record] };
            } else {
                newState = { selectTrafficTicket: selectTrafficTicket.filter(e => e.id !== record.id) };
            }
        }
        this.setState({ ...newState });
    };

    onSelectAll = (selected, selectedRows, changeRows) => {
        const { selectInvoice, selectTrafficTicket, key } = this.state;
        let newState;
        if (key === "1") {
            if (selected) {
                let disabled = false, currentInvoice = '';
                const newSelectInvoice = [...selectInvoice, ...changeRows];
                newSelectInvoice.forEach(e => {
                    newSelectInvoice.forEach(j => {
                        if (e.invoiceNumber !== j.invoiceNumber || e.invoiceCode !== j.invoiceCode) {
                            disabled = true
                        }
                    })
                })

                if (!disabled) {
                    currentInvoice = `${newSelectInvoice[0].invoiceNumber}${newSelectInvoice[0].invoiceCode}`;
                }

                newState = { selectInvoice: newSelectInvoice, currentInvoice };
            } else {
                let newSelectInvoice = [...selectInvoice];
                changeRows.map(e => e.id).forEach(id => {
                    newSelectInvoice = newSelectInvoice.filter(e => e.id !== id);
                });
                newState = { selectInvoice: newSelectInvoice };
            }
        } else if (this.state.key === "2") {
            if (selected) {
                newState = { selectTrafficTicket: [...selectTrafficTicket, ...changeRows] };
            } else {
                let newSelectTrafficTicket = [...selectTrafficTicket];
                changeRows.map(e => e.id).forEach(id => {
                    newSelectTrafficTicket = newSelectTrafficTicket.filter(e => e.id !== id);
                });
                newState = { selectTrafficTicket: newSelectTrafficTicket };
            }
        }
        this.setState({ ...newState });
    };

    onInvoiceSelectChange = (record, selected, row) => {
        let invoiceDeletekeys = this.state.invoiceDeletekeys;
        let keys = [];
        if (selected) {
            keys = [...invoiceDeletekeys, ...this.props.proxyState.invoiceList.filter(a => a.invoiceCode === record.invoiceCode && a.invoiceNumber === record.invoiceNumber).map(a => a.id)];
        } else {
            let list = this.props.proxyState.invoiceList.filter(a => a.invoiceCode === record.invoiceCode && a.invoiceNumber === record.invoiceNumber).map(a => a.id);
            keys = invoiceDeletekeys.filter(a => !list.includes(a));
        }

        this.setState({
            invoiceDeletekeys: keys
        });
    };
    seletAllInvoice = (selected, selectedRows, changeRows) => {
        this.setState({
            invoiceDeletekeys: selectedRows.map(a => a.id),
        });
    }
    onTrafficTicketSelectChange = (keys) => {
        this.setState({
            trafficTicketDeleteKeys: keys
        });
    };

    deleteInvoice = () => {
        const { proxyState: { invoiceList, childList, disabledInvoiceKeys }, setProxyState, removeRowData } = this.props;
        const { invoiceDeletekeys, } = this.state;
        Modal.confirm({
            title: "提示",
            content: "确定删除所选项吗？",
            onOk: () => {
                let newActiveInvoiceList = [...invoiceList];
                let newDisabledInvoiceKeys = [...disabledInvoiceKeys];
                let newChildList = { ...childList };

                // BatchModifyTemporaryStatus({
                //     TemporaryStatusActionRequests: invoiceDeletekeys.map(key => {
                //         const current = newActiveInvoiceList.find(e => e.id === key);
                //         return { id: current.invoiceDetailId || current.invoiceId, TemporaryStatus: 0, InvoiceType: current.type }
                //     }),
                //     Platform: "CRMG"
                // })
                Save({
                    InvoicePoolActionRequests: invoiceDeletekeys.map(key => {
                        const current = newActiveInvoiceList.find(e => e.id === key);
                        return { ...current, operationStatus:0 }
                    }),
                    TrafficTicketActionRequests:[]
                }).then(({data}) => {
                    if (data.errorType !== 0) {
                        message.warning(data.errorMessages);
                        return;
                    };

                    invoiceDeletekeys.forEach(key => {
                        //newActiveInvoiceList = newActiveInvoiceList.filter(e => e.id !== key);
                        let ticket = newActiveInvoiceList.find(e => e.id === key);
                        if (ticket.operationStatus === 3)
                            ticket.operationStatus = 0;
                        else
                            newActiveInvoiceList.splice(newActiveInvoiceList.indexOf(ticket), 1);
                        //newActiveInvoiceList.find(e => e.id === key).operationStatus = 0;
                        newDisabledInvoiceKeys = newDisabledInvoiceKeys.filter(e => e !== key);
                        const { rowID, childID } = newChildList[key] || {};

                        if (rowID && rowID.length) {
                            rowID.forEach((id, i) => {
                                removeRowData(childID[i], id)
                            });
                        }
                        delete newChildList[key];
                    });

                    const invoiceContinuity = this.getInvoiceContinuity(newActiveInvoiceList);

                    this.setState({
                        invoiceDeletekeys: [],

                    }, () => {
                        setProxyState({
                            invoiceList: newActiveInvoiceList,
                            childList: newChildList,
                            invoiceContinuity,
                            disabledInvoiceKeys: newDisabledInvoiceKeys
                        });
                    });
                });
            }
        });
    };

    deleteTrafficTicket = () => {
        const { proxyState: { trafficTicketList, childList, disabledTrafficTicketKeys }, setProxyState, removeRowData } = this.props;
        const { trafficTicketDeleteKeys } = this.state;
        Modal.confirm({
            title: "提示",
            content: "确定删除所选项吗？",
            onOk: () => {
                let newActiveTrafficTicketList = [...trafficTicketList];
                let newDisabledTrafficTicketKeys = [...disabledTrafficTicketKeys];
                let newChildList = { ...childList };

                // BatchModifyTemporaryStatus({
                //     TemporaryStatusActionRequests: trafficTicketDeleteKeys.map(key => {
                //         const current = newActiveTrafficTicketList.find(e => e.id === key);
                //         return { id: current.invoiceId || current.id, TemporaryStatus: 0, InvoiceType: current.invoiceType }
                //     }),
                //     Platform: "CRMG"
                // }).
                Save({
                    TrafficTicketActionRequests: trafficTicketDeleteKeys.map(key => {
                        const current = newActiveTrafficTicketList.find(e => e.id === key);
                        return { ...current, operationStatus:0 }
                    }),
                    InvoicePoolActionRequests:[]
                }).then(({data}) => {
                    if (data.errorType !== 0) {
                        message.warning(data.errorMessages);
                        return;
                    };

                    trafficTicketDeleteKeys.forEach(key => {
                        //newActiveTrafficTicketList = newActiveTrafficTicketList.filter(e => e.id !== key);
                        let ticket = newActiveTrafficTicketList.find(e => e.id === key);
                        if (ticket.operationStatus === 3)
                            ticket.operationStatus = 0;
                        else
                            newActiveTrafficTicketList.splice(newActiveTrafficTicketList.indexOf(ticket), 1);
                        //newActiveTrafficTicketList.find(e => e.id === key).operationStatus = 0;
                        newDisabledTrafficTicketKeys = newDisabledTrafficTicketKeys.filter(e => e !== key);
                        const { rowID, childID } = newChildList[key] || {};

                        if (rowID && rowID.length) {
                            rowID.forEach((id, i) => {
                                removeRowData(childID[i], id);
                            });
                        }
                        delete newChildList[key];
                    });

                    const trafficTicketContinuity = this.getTrafficTicketContinuity(newActiveTrafficTicketList);

                    this.setState({
                        trafficTicketDeleteKeys: [],
                    }, () => {
                        setProxyState({
                            trafficTicketList: newActiveTrafficTicketList,
                            childList: newChildList,
                            trafficTicketContinuity,
                            disabledTrafficTicketKeys: newDisabledTrafficTicketKeys
                        });
                    });
                });
            }
        });
    };

    onPageChange = (page, pageSize) => {
        this.props.form.validateFields(['MinValueAddedTax', 'MaxValueAddedTax', this.state.key === "1" ? "InvoiceCode" : "idCardNo", this.state.key === "1" ? "InvoiceNumber" : "ticketCode"], (err, values) => {
            if (!err) {
                if (this.state.key === "1") {
                    this.setState({ invoiceCurrent: page, modalLoading: true }, function () {
                        GetInvoiceFolder({
                            ...values,
                            pageIndex: page,
                            pageSize
                        }).then(({ data: { invoiceForderList, pagination } }) => {
                            this.setState({
                                invoiceModalList: invoiceForderList.map(a => ({ ...a, operationStatus: 1 })),
                                invoiceTotal: pagination.totalCount,
                                modalLoading: false,
                            });
                        });
                    })
                } else if (this.state.key === "2") {
                    this.setState({ trafficTicketCurrent: page, modalLoading: true }, function () {
                        GetTrafficTicket({
                            ...values,
                            pageIndex: page,
                            pageSize
                        }).then(({ data: { trafficTicketList, pagination } }) => {
                            this.setState({
                                trafficTicketModalList: trafficTicketList.map(a => ({ ...a, operationStatus: 1 })),
                                trafficTicketTotal: pagination.totalCount,
                                modalLoading: false
                            });
                        });
                    });
                }
            }
        });
    };

    renderContinuity = () => {
        const { proxyState: { trafficTicketContinuity, invoiceContinuity } } = this.props;
        let continuityInfo = [];
        for (const key in trafficTicketContinuity) {
            if (trafficTicketContinuity.hasOwnProperty(key)) {
                const e = trafficTicketContinuity[key];
                const arr = e.map(ev => `当前表单中发票代码为：${key} 有${ev.length}张发票连号，发票号分别为：${ev.map(t => t.ticketCode).join(",")}`);
                continuityInfo = continuityInfo.concat(arr);
            }
        }
        for (const key in invoiceContinuity) {
            if (invoiceContinuity.hasOwnProperty(key)) {
                const e = invoiceContinuity[key];
                const arr = e.map(ev => `当前表单中发票代码为：${key} 有${ev.length}张发票连号，发票号分别为：${ev.map(t => t.invoiceNumber).join(",")}`);
                continuityInfo = continuityInfo.concat(arr);
            }
        }
        return continuityInfo;
    };

    openModal = () => {
        if (this.state.key === "1") {
            this.setState({
                visible: true,
                modalLoading: true
            }, () => {
                GetInvoiceFolder({
                    pageIndex: 1,
                    pageSize: 10
                }).then(({ data: { invoiceForderList, pagination } }) => {
                    this.setState({
                        invoiceModalList: invoiceForderList.map(a => ({ ...a, operationStatus: 1 })),
                        invoiceTotal: pagination.totalCount,
                        invoiceCurrent: pagination.pageIndex,
                        modalLoading: false
                    });
                });
            });
        } else if (this.state.key === "2") {
            this.setState({
                visible: true,
                modalLoading: true
            }, () => {
                GetTrafficTicket({
                    pageIndex: 1,
                    pageSize: 10
                }).then(({ data: { trafficTicketList, pagination } }) => {
                    this.setState({
                        trafficTicketModalList: trafficTicketList.map(a => ({ ...a, operationStatus: 1 })),
                        trafficTicketTotal: pagination.totalCount,
                        trafficTicketCurrent: pagination.pageIndex,
                        modalLoading: false
                    });
                });
            });
        }
    };

    changeCardState = () => {
        this.setState({
            cardState: !this.state.cardState
        })
    }

    openSplitModal = () => {
        this.setState({
            splitModal: true
        })
    }

    saveSplit = () => {
        const { selectInvoice, splitData, splitPage } = this.state;
        this.props.form.validateFields(['splitNum'], (err, values) => {
            if (!err) {
                const splitNum = values.splitNum;
                let allAata = [];
                const length = splitNum;//拆分次数
                selectInvoice.forEach(e => {
                    let data = [];

                    const valueAddedTax = toFixed(div(e.valueAddedTax, length));
                    const amount = toFixed(div(valueAddedTax, add(1, e.taxRate)));
                    const tax = sub(valueAddedTax, amount);

                    // const amount = toFixed(div(e.amount,length));
                    // const tax = toFixed(div(e.tax,length));

                    const resultValueAddedTax = sub(e.valueAddedTax, toFixed(mul(valueAddedTax, length)));
                    const resultAmount = sub(e.amount, toFixed(mul(amount, length)));
                    const resultTax = sub(e.tax, toFixed(mul(tax, length)));

                    for (let i = 0; i < length; i++) {
                        data.push({
                            ...e,
                            splitId: Guid(),
                            valueAddedTax,
                            amount,
                            tax,
                            saved: false
                        })
                    }

                    data[length - 1] = {
                        ...data[length - 1],
                        valueAddedTax: add(resultValueAddedTax, valueAddedTax),
                        amount: add(resultAmount, amount),
                        tax: add(resultTax, tax),
                    }

                    allAata = allAata.concat(data);
                })


                this.setState({
                    splitData: {
                        ...splitData,
                        [`${selectInvoice[0].invoiceNumber}${selectInvoice[0].invoiceCode}`]: {
                            saved: false,
                            data: allAata
                        }
                    },
                    splitPage: {
                        ...splitPage,
                        [`${selectInvoice[0].invoiceNumber}${selectInvoice[0].invoiceCode}`]: {
                            current: 1,
                            total: allAata.length
                        }
                    },
                    splitModal: false
                })
            }
        })
    }

    companyScroll = e => {
        e.persist();
        const { target } = e;
        if (this.state.invoiceCategoryList.length % this.state.pageIndex !== 0) {
            return; //数据加载完毕
        }
        if (target.scrollHeight - target.offsetHeight === Math.ceil(target.scrollTop)) {
            const { pageIndex } = this.state;
            const nextScrollPage = pageIndex + 1;
            GetInvoiceCategory({
                pageIndex: nextScrollPage,
                pageSize: 10
            }).then(({ data: { invoiceCategoryList, pagination } }) => {
                this.setState({
                    invoiceCategoryList: [...this.state.invoiceCategoryList, ...invoiceCategoryList],
                    pageIndex: nextScrollPage
                });
            });
        }
    }

    onRowClick = record => {
        const { splitData, currentInvoice } = this.state;
        const current = splitData[currentInvoice] || {};
        const currentSplitData = current.data || [];
        if (!current.saved && currentSplitData.length !== 0) {
            return;
        }
        this.setState({
            currentInvoice: `${record.invoiceNumber}${record.invoiceCode}`,
            selectSplitKeys: {},
        })
    }

    splitValChange = (val, record) => {
        const { splitData, currentInvoice } = this.state;
        const current = splitData[currentInvoice] || {};
        const currentSplitData = current.data || [];
        this.setState({
            splitData: {
                ...splitData,
                [currentInvoice]: {
                    data: currentSplitData.map(e => {
                        if (e.splitId === record.splitId) {
                            const amount = toFixed(div(val, add(1, record.taxRate)));
                            return {
                                ...e,
                                valueAddedTax: val,
                                amount,
                                tax: sub(val, amount)
                            }
                        }
                        return e;
                    }),
                    saved: current.saved
                }
            }
        })
    }

    splitAmountChange = (val, record) => {
        const { splitData, currentInvoice } = this.state;
        const current = splitData[currentInvoice] || {};
        const currentSplitData = current.data || [];
        this.setState({
            splitData: {
                ...splitData,
                [currentInvoice]: {
                    data: currentSplitData.map(e => {
                        if (e.splitId === record.splitId) {
                            // const valueAddedTax = toFixed(mul(val,add(1,record.taxRate)));
                            const valueAddedTax = record.valueAddedTax;
                            return {
                                ...e,
                                valueAddedTax: valueAddedTax,
                                amount: val,
                                tax: isEmpty(valueAddedTax) ? null : sub(valueAddedTax, val)
                            }
                        }
                        return e;
                    }),
                    saved: current.saved
                }
            }
        })
    }

    onSplitSave = () => {
        const { splitData, currentInvoice, selectInvoice, selectSplitKeys } = this.state;
        const current = splitData[currentInvoice] || {};
        const currentSplitData = (current.data || []).filter(e => {
            return e.valueAddedTax || e.tax || e.amount
        });

        //若无拆分，直接过
        if (currentSplitData.length === 0) {
            this.setState({
                splitData: {
                    ...splitData,
                    [currentInvoice]: {
                        data: currentSplitData.map(e => ({ ...e, saved: true })),
                        saved: true
                    }
                }
            })
            return;
        }
        //有拆分
        //按照拆分id归类
        const result = currentSplitData.reduce((initArray, item, xindex, array) => {
            //initArray 初始值 或者是上一次调用返回的值
            //item 数组中当前被处理的元素
            //xindex 当前元素的下标
            //array 被reduce的数组  即上面代码中的数组a
            const id = item.id;
            if (initArray[id]) {
                initArray[id].push(item)
            } else {
                initArray[id] = [item]
            }
            return initArray
        }, []);

        //判断金额
        let success = true;

        for (const key in result) {
            if (result.hasOwnProperty(key)) {
                const arr = result[key];
                let valueAddedTax = 0;
                let amount = 0;
                let tax = 0;
                const splitParams = selectInvoice.filter(e => e.id === key)[0];

                arr.forEach(e => {
                    valueAddedTax = add(valueAddedTax, e.valueAddedTax);
                    amount = add(amount, e.amount);
                    tax = add(tax, e.tax);
                })

                if (Number(valueAddedTax) !== Number(splitParams.valueAddedTax) || Number(amount) !== Number(splitParams.amount) || Number(tax) !== Number(splitParams.tax)) {
                    success = false;
                }
            }
        }

        if (!success) {
            message.warning('发票拆分后的金额与原发票金额不相等，按F8或点击金额平衡按钮进行自动计算');
            return;
        }

        this.setState({
            splitData: {
                ...splitData,
                [currentInvoice]: {
                    data: currentSplitData.map(e => ({ ...e, saved: true })),
                    saved: true
                }
            },
            selectSplitKeys: {
                ...selectSplitKeys,
                [currentInvoice]: []
            }
        })
    }

    onSplitEdit = () => {
        const { splitData, currentInvoice } = this.state;
        const current = splitData[currentInvoice] || {};
        const currentSplitData = current.data || [];
        this.setState({
            splitData: {
                ...splitData,
                [currentInvoice]: {
                    data: currentSplitData.map(e => ({ ...e, saved: false })),
                    saved: false
                }
            }
        })
    }

    onSplitAdd = () => {
        const { splitData, currentInvoice, selectSplitKeys, splitPage } = this.state;
        const current = splitData[currentInvoice] || {};
        const currentSplitData = current.data || [];
        const currentSelectKey = selectSplitKeys[currentInvoice][0];
        const selectData = currentSplitData.filter(e => e.splitId === currentSelectKey)[0];

        // const addIndex = currentSplitData.map(e=>e.id).lastIndexOf(selectData.id);

        // currentSplitData.splice(addIndex+1,0,{
        //     ...selectData,
        //     splitId:Guid(),
        //     valueAddedTax:null,
        //     amount:null,
        //     tax:null,
        //     isAdd:true,
        //     saved:false})

        this.setState({
            splitData: {
                ...splitData,
                [currentInvoice]: {
                    data: currentSplitData.concat({
                        ...selectData,
                        splitId: Guid(),
                        valueAddedTax: null,
                        amount: null,
                        tax: null,
                        isAdd: true,
                        saved: false
                    }),
                    saved: current.saved
                }
            },
            splitPage: {
                ...splitPage,
                [currentInvoice]: {
                    current: splitPage[currentInvoice].current,
                    total: currentSplitData.length + 1
                }
            },
        }, () => { message.success('新增成功') })
    }

    onSplitDel = () => {
        const { splitData, currentInvoice, selectSplitKeys, splitPage } = this.state;
        const current = splitData[currentInvoice] || {};
        const currentSplitData = current.data || [];
        const currentSelectKeys = selectSplitKeys[currentInvoice] || [];
        Modal.confirm({
            title: "提示",
            content: "确定删除所选项吗？",
            onOk: () => {
                const data = currentSplitData.filter(e => !currentSelectKeys.includes(e.splitId));

                this.setState({
                    splitData: {
                        ...splitData,
                        [currentInvoice]: {
                            data,
                            saved: current.saved
                        }
                    },
                    splitPage: {
                        ...splitPage,
                        [currentInvoice]: {
                            current: splitPage[currentInvoice].current === 1 ? 1 : (data[(splitPage[currentInvoice].current - 1) * 10] ? splitPage[currentInvoice].current : splitPage[currentInvoice].current - 1),
                            total: data.length
                        }
                    },
                    selectSplitKeys: {
                        ...selectSplitKeys,
                        [currentInvoice]: []
                    }
                })
            }
        })
    }

    onSelectSplit = (record, selected, rows) => {
        const { currentInvoice, selectSplitKeys } = this.state;
        const currentKeys = selectSplitKeys[currentInvoice] || [];

        if (selected) {
            this.setState({
                selectSplitKeys: {
                    ...selectSplitKeys,
                    [currentInvoice]: [...currentKeys, record.splitId]
                }
            })
        } else {
            this.setState({
                selectSplitKeys: {
                    ...selectSplitKeys,
                    [currentInvoice]: currentKeys.filter(e => e !== record.splitId)
                }
            })
        }
    }

    onSelectAllSplit = (selected, selectedRows, changeRows) => {
        const { currentInvoice, selectSplitKeys } = this.state;
        const currentKeys = selectSplitKeys[currentInvoice] || [];

        if (selected) {
            this.setState({
                selectSplitKeys: {
                    ...selectSplitKeys,
                    [currentInvoice]: currentKeys.concat(selectedRows.map(e => e.splitId))
                }
            })
        } else {
            const changeKeys = changeRows.map(e => e.splitId);
            this.setState({
                selectSplitKeys: {
                    ...selectSplitKeys,
                    [currentInvoice]: currentKeys.filter(e => !changeKeys.includes(e))
                }
            })
        }
    }

    validator = (rule, value, callback) => {
        if (value === null) {
            callback('请填写拆分行数');
        }
        if (value < 2) {
            callback('拆分次数必须为大于1的整数');
        }
        if (value > 100) {
            callback('拆分次数不能超过100');
        }
        if (value.toString().indexOf('.') !== -1) {
            callback('拆分次数必须为大于1的整数');
        }
        callback()
    }

    onSplitPageChange = (page, pageSize) => {
        const { splitData, currentInvoice, splitPage } = this.state;
        const current = splitData[currentInvoice] || {};
        const currentSplitData = current.data || [];
        this.setState({
            splitPage: {
                ...splitPage,
                [currentInvoice]: {
                    current: page,
                    total: currentSplitData.length
                }
            }
        })
    }

    setOffset = () => {
        if (this.state.deg / 90 % 2 !== 0) {
            const zoomLeft = this.img.current.clientWidth * this.state.scale;
            const zoomTop = this.img.current.clientHeight * this.state.scale;
            const w = zoomTop - this.area.current.clientWidth;
            const h = zoomLeft - this.area.current.clientHeight;
            this.setState({
                left: w > 0 ? w / 2 : 0,
                top: h > 0 ? h / 2 : 0
            })
        } else {
            if (this.state.scale > 1) {
                const zoomLeft = this.img.current.clientWidth * this.state.scale;
                const zoomTop = this.img.current.clientHeight * this.state.scale;
                const w = zoomLeft - this.area.current.clientWidth;
                const h = zoomTop - this.area.current.clientHeight;
                this.setState({
                    left: w > 0 ? w / 2 : 0,
                    top: h > 0 ? h / 2 : 0
                })
            } else {
                this.setState({
                    left: 0,
                    top: 0
                })
            }
        }
    }

    rotate = () => {
        let deg = this.state.deg;
        if (deg >= 360)
            deg = 90;
        else
            deg += 90;
        this.setState({ deg }, this.setOffset);
    }

    plus = () => {
        this.setState((state) => ({
            scale: state.scale === 3 ? 3 : add(state.scale, 0.2)
        }), this.setOffset)
    }

    minus = () => {
        this.setState((state) => ({
            scale: state.scale === 0.4 ? 0.4 : sub(state.scale, 0.2)
        }), this.setOffset)
    }

    handleMouseDown = (evt) => {
        this.setState({
            dragging: true,
            preX: evt.pageX,
            preY: evt.pageY,
        })
    }

    onCategorySearch = Name => {
        GetInvoiceCategory({
            pageIndex: 1,
            pageSize: 10,
            Name
        }).then(({ data: { invoiceCategoryList, pagination } }) => {
            this.setState({
                invoiceCategoryList,
                pageIndex: 1
            });
        });
    }

    render() {
        const { form: { getFieldDecorator }, proxyState: { disabledInvoiceKeys, disabledTrafficTicketKeys, invoiceList, trafficTicketList }, authority = {}, setting = {} } = this.props;
        const { otherSwitchSet = true, trafficSwitchSet = true, orderSwitchSet = true } = setting;
        //const continuityTab = this.renderContinuity();
        const authorition = authority["Invoice_Info"] || {};
        const readOnly = authorition.readOnly || authorition.disabled;
        const { imgVisible, imgSrc, visible, key, selectInvoice, selectTrafficTicket, invoiceModalList, scale, top, left, styleTop, styleLeft,
            trafficTicketModalList, invoiceDeletekeys, trafficTicketDeleteKeys, invoiceTotal, invoiceCurrent, splitPage,
            trafficTicketTotal, trafficTicketCurrent, deg, modalLoading, categoryModal, splitModal, splitData, currentInvoice, selectSplitKeys } = this.state;
        const invoiceCount = invoiceList.filter(a => a.operationStatus !== 0).length;
        const trafficCount = trafficTicketList.filter(a => a.operationStatus !== 0).length;
        const current = splitData[currentInvoice] || {};
        const currentSplitData = current.data || [];
        const currentPagination = splitPage[currentInvoice] || { total: 0, current: 1 };

        let currentDisabledInvoiceKey = '';
        invoiceList.forEach(e => {
            if (`${e.invoiceNumber}${e.invoiceCode}` === currentInvoice) {
                currentDisabledInvoiceKey = e.id;
            }
        })

        let disabled = !selectInvoice.length;

        selectInvoice.forEach(e => {
            selectInvoice.forEach(j => {
                if (e.invoiceNumber !== j.invoiceNumber || e.invoiceCode !== j.invoiceCode) {
                    disabled = true
                }
            })
        })
        const disabledSplit = key !== "1" || disabled || currentSplitData.length || !selectInvoice.map(e => `${e.invoiceNumber}${e.invoiceCode}`).includes(currentInvoice);

        const currentSelectKeys = selectSplitKeys[currentInvoice] || [];

        const trafficTab = trafficSwitchSet && (<Tabs.TabPane tab={`飞机票、火车票及其他实名制客票${trafficCount > 0 ? `(${trafficCount})` : ''}`} key="2">
            {
                readOnly ? null : <div>
                    <Button onClick={this.openModal} style={{ margin: 12 }}>添加发票</Button>
                    <Button disabled={!trafficTicketDeleteKeys.length} style={{ margin: 12 }}
                        onClick={this.deleteTrafficTicket}>删除</Button>
                    <span style={{ margin: 12 }}>合计: {trafficCount} 张</span>
                </div>
            }

            <Table
                bordered
                columns={trafficColumns.filter(e => e.dataIndex !== 'category' && e.dataIndex !== 'attachment').concat({
                    title: "查看影像",
                    dataIndex: "attachment",
                    key: "attachment",
                    render: (val) => <span onClick={() => this.loadImg(JSON.parse(val || '[]')[0])} style={{ color: '#1990ff', cursor: 'pointer' }}>查看影像</span>
                })}
                size="small"
                dataSource={trafficTicketList.filter(a => a.operationStatus !== 0)}
                pagination={false}
                rowKey="id"
                rowSelection={
                    readOnly ? null : {
                        onChange: this.onTrafficTicketSelectChange,
                        selectedRowKeys: trafficTicketDeleteKeys
                    }}
            />
        </Tabs.TabPane>) || null;

        const otherTab = otherSwitchSet && (<Tabs.TabPane tab={`专普票及其他发票${invoiceCount > 0 ? `(${invoiceCount})` : ''}`} key="1">
            {
                readOnly ? null : <div>
                    <Button onClick={this.openModal} style={{ margin: 12 }}>添加发票</Button>
                    <Button disabled={!invoiceDeletekeys.length} style={{ margin: 12 }}
                        onClick={this.deleteInvoice}>删除</Button>
                    <span style={{ margin: 12 }}>合计: {invoiceCount} 张</span>
                </div>
            }

            <Table
                columns={otherColumns.filter(e => e.dataIndex !== 'category' && e.dataIndex !== 'attachment').concat({
                    title: "查看影像",
                    dataIndex: "attachment",
                    key: "attachment",
                    render: (val) => <span onClick={() => this.loadImg(JSON.parse(val || '[]')[0])} style={{ color: '#1990ff', cursor: 'pointer' }}>查看影像</span>
                })}
                bordered
                dataSource={invoiceList.filter(a => a.operationStatus !== 0)}
                pagination={false}
                rowKey="id"
                size="small"
                rowSelection={
                    readOnly ? null : {
                        onSelect: this.onInvoiceSelectChange,
                        onSelectAll: this.seletAllInvoice,
                        selectedRowKeys: invoiceDeletekeys
                    }}
            />
        </Tabs.TabPane>) || null;

        return <React.Fragment>
            {
                authorition.hidden ? null :
                    (
                        <div className='ApprovalSteps' style={{ clear: "both" }}>
                            <Collapse onChange={this.changeCardState} expandIconPosition="right" expandIcon={() => <Icon type={this.state.cardState ? 'down' : 'left'} style={{ fontSize: "15px" }} />} defaultActiveKey={['1']} bordered={false}>
                                <Collapse.Panel header="发票信息" key="1">
                                    {
                                        orderSwitchSet ? <Tabs onChange={this.tabChange} activeKey={this.state.key}>
                                            {trafficTab}
                                            {otherTab}
                                        </Tabs>
                                            :
                                            <Tabs onChange={this.tabChange} activeKey={this.state.key}>
                                                {otherTab}
                                                {trafficTab}
                                            </Tabs>
                                    }
                                    {/* <Tabs.TabPane tab={<Badge count={continuityTab.length}>
                                            <span style={{ marginRight: 10 }}>发票连号预警信息</span>
                                        </Badge>} key="3">
                                            <div style={{ margin: 12 }}>
                                                {continuityTab.map((e, i) => <p key={i}>{e}</p>)}
                                            </div>
                                        </Tabs.TabPane> */}
                                </Collapse.Panel>
                            </Collapse>
                            <Modal
                                onCancel={() => {
                                    this.setState({ visible: false });
                                }}
                                visible={visible}
                                width='85%'
                                centered
                                bodyStyle={{ height: 480, padding: '6px 12px' }}
                                footer={<div style={{ textAlign: 'center' }}><Button onClick={() => {
                                    this.setState({ visible: false });
                                }}>关闭</Button></div>}
                                title="发票搜索-输入查询条件后选择列表添加至发票信息"
                                destroyOnClose
                            >
                                <div style={{ display: "flex", height: "100%" }}>
                                    <div style={{ flex: "0 0 280px" }}>
                                        <Form labelCol={{ span: 7 }} wrapperCol={{ span: 17 }}>
                                            <div>
                                                <div>
                                                    <Form.Item labelCol={{ span: 13 }} wrapperCol={{ span: 11 }} style={{ display: 'inline-block' }} label="合计金额">
                                                        {getFieldDecorator("MinValueAddedTax")(
                                                            <InputNumber style={{ width: 80 }} placeholder="最小值" min={0} />
                                                        )}
                                                    </Form.Item>
                                                    <span style={{ position: 'relative', top: 8, left: 24 }}>~</span>
                                                    <Form.Item style={{ display: 'inline-block', marginLeft: 40 }}>
                                                        {getFieldDecorator("MaxValueAddedTax")(
                                                            <InputNumber style={{ width: 80 }} placeholder="最大值" min={0} />
                                                        )}
                                                    </Form.Item>
                                                </div>
                                                <Form.Item label="发票代码">
                                                    {getFieldDecorator(key === "1" ? "InvoiceCode" : "idCardNo")(
                                                        <Input />
                                                    )}
                                                </Form.Item>
                                                <Form.Item label="发票号码">
                                                    {getFieldDecorator(key === "1" ? "InvoiceNumber" : "ticketCode")(
                                                        <Input />
                                                    )}
                                                </Form.Item>
                                            </div>
                                        </Form>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <Button style={{ width: 110 }} icon="search" onClick={this.onSearch}>查询</Button>
                                            <Button
                                                disabled={key === "1" ? (!selectInvoice.length || (currentSplitData.length ? !current.saved : false)) : !selectTrafficTicket.length}
                                                icon="plus" style={{ width: 110 }} onClick={this.onAdd}>添加</Button>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                                            <Button
                                                disabled={key === "1" ? !selectInvoice.length : !selectTrafficTicket.length}
                                                icon="edit" onClick={this.openCategoryModal}>更改标签</Button>
                                            <Button
                                                disabled={disabledSplit}
                                                icon="unordered-list" onClick={this.openSplitModal}>发票拆分</Button>
                                        </div>
                                    </div>
                                    <div className={styles.billInfo}>
                                        <div>
                                            <div style={{ marginBottom: 12 }}>发票信息</div>
                                            <Table
                                                size="small"
                                                bordered
                                                columns={key === "1" ? otherTicketsColumns : trafficTicketsColumns}
                                                dataSource={key === "1" ? invoiceModalList : trafficTicketModalList}
                                                pagination={false}
                                                loading={modalLoading}
                                                // pagination={{
                                                //     current: key === "1" ? invoiceCurrent : trafficTicketCurrent,
                                                //     pageSize: 10,
                                                //     onChange: this.onPageChange,
                                                //     total: key === "1" ? invoiceTotal : trafficTicketTotal
                                                // }}
                                                scroll={{ y: key === "1" ? 120 : 350, x: key === "1" ? 1580 : 1420 }}
                                                rowKey="id"
                                                rowSelection={{
                                                    fixed: true,
                                                    onSelect: this.onSelectChange,
                                                    onSelectAll: this.onSelectAll,
                                                    getCheckboxProps: (record) => {
                                                        return { disabled: key === "1" ? (disabledInvoiceKeys.includes(record.id) || record.isUsed) : (disabledTrafficTicketKeys.includes(record.id) || record.isUsed) };
                                                    },
                                                    selectedRowKeys: key === "1" ? selectInvoice.map(e => e.id) : selectTrafficTicket.map(e => e.id)
                                                }}
                                                onRow={(record, index) => ({
                                                    onClick: e => {
                                                        e.stopPropagation();
                                                        this.onRowClick(record)
                                                    }
                                                })}
                                            />
                                            <div style={{ textAlign: 'right', marginTop: '5px' }}>
                                                <Pagination
                                                    current={key === "1" ? invoiceCurrent : trafficTicketCurrent}
                                                    pageSize={10}
                                                    onChange={this.onPageChange}
                                                    total={key === "1" ? invoiceTotal : trafficTicketTotal}
                                                />
                                            </div>
                                        </div>
                                        {
                                            key === '1' && (
                                                <div>
                                                    <div style={{ margin: '12px 0', display: "flex", justifyContent: "space-between" }}>
                                                        <span>发票拆分</span>
                                                        <span>
                                                            <Button onClick={this.onSplitSave} disabled={!currentSplitData.length || current.saved} style={{ marginRight: 8 }}>保存</Button>
                                                            <Button onClick={this.onSplitEdit} disabled={!current.saved || disabledInvoiceKeys.includes(currentDisabledInvoiceKey)} style={{ marginRight: 8 }}>编辑</Button>
                                                            <Button onClick={this.onSplitAdd} disabled={currentSelectKeys.length === 1 ? false : true} style={{ marginRight: 8 }}>新增</Button>
                                                            <Button onClick={this.autoCompute} disabled={!currentSplitData.length || current.saved} style={{ marginRight: 8 }}>末行金额平衡</Button>
                                                            <Button onClick={this.onSplitDel} disabled={!currentSplitData.length || current.saved || !currentSelectKeys.length}>删除</Button>
                                                        </span>
                                                    </div>
                                                    <Table
                                                        size="small"
                                                        bordered
                                                        columns={this.splitColumns}
                                                        dataSource={currentSplitData.slice((currentPagination.current - 1) * 10, (currentPagination.current - 1) * 10 + 10)}
                                                        pagination={false}
                                                        loading={modalLoading}
                                                        scroll={{ y: 90 }}
                                                        rowKey="splitId"
                                                        onRow={(record, index) => ({
                                                            onClick: e => {
                                                                e.stopPropagation();
                                                                this.onSplitRowClick(record)
                                                            }
                                                        })}
                                                        rowSelection={{
                                                            fixed: true,
                                                            onSelect: this.onSelectSplit,
                                                            onSelectAll: this.onSelectAllSplit,
                                                            selectedRowKeys: currentSelectKeys,
                                                            getCheckboxProps: (record) => {
                                                                return { disabled: current.saved };
                                                            },
                                                        }}
                                                    />
                                                    <div style={{ textAlign: 'right', marginTop: '5px' }}>
                                                        <Pagination
                                                            {...currentPagination}
                                                            pageSize={10}
                                                            onChange={this.onSplitPageChange}
                                                        />
                                                    </div>
                                                </div>
                                            ) || null
                                        }

                                    </div>
                                </div>
                            </Modal>
                            <Modal
                                onCancel={() => {
                                    this.setState({ imgVisible: false, scale: 1, left: 0, top: 0, rotate: 0, dragging: false, preX: 0, preY: 0, styleTop: 100, styleLeft: 0, imgSrc: "" });
                                }}
                                wrapClassName={styles.imgModal}
                                width={720}
                                visible={imgVisible}
                                footer={false}
                                style={{ left: styleLeft, top: styleTop }}
                                title={<div
                                    style={{ cursor: 'move', padding: "16px 24px" }}
                                    onMouseDown={this.handleMouseDown}
                                >查看影像</div>}
                                destroyOnClose
                                bodyStyle={{ textAlign: 'center', position: 'relative', overflow: 'hidden', padding: 0, minHeight: 40 }}
                            >{
                                    imgSrc === '' ?
                                        <p style={{ padding: 12 }}>影像载入中...</p> : (imgSrc === 'error' ? <div>
                                            <div>
                                                <Icon style={{ fontSize: 48, margin: 12 }} type="close-circle" theme="twoTone" />
                                            </div>
                                            <div style={{ marginBottom: 12, color: "#1890ff" }}>
                                                暂无影像信息...
                                            </div>
                                        </div> :
                                            <div style={{ overflow: 'scroll' }}>
                                                <a href={imgSrc} target='_blank' >
                                                    <div ref={this.area} style={{ top: top, left: left, position: 'relative', height: "100%", width: '100%' }}>
                                                        <img onError={() => {
                                                            this.setState({
                                                                imgSrc: 'error'
                                                            })
                                                        }} ref={this.img} style={{ transform: `rotate(${deg}deg) scale(${scale})`, display: 'inline-block', maxWidth: '100%', maxHeight: 520 }} src={imgSrc} alt="" />
                                                    </div>
                                                </a>
                                            </div>)
                                }
                                {
                                    (imgSrc === '' || imgSrc === 'error') ? null : <React.Fragment>
                                        <Button type='primary' style={{ position: 'absolute', bottom: '5px', right: '95px' }} title='放大' onClick={this.plus} icon='plus'></Button>
                                        <Button type='primary' style={{ position: 'absolute', bottom: '5px', right: '50px' }} title='缩小' onClick={this.minus} icon='minus'></Button>
                                        <Button type='primary' style={{ position: 'absolute', bottom: '5px', right: '5px' }} title='旋转' onClick={this.rotate} icon='redo'></Button>
                                    </React.Fragment>
                                }

                            </Modal>
                            <Modal
                                onCancel={() => {
                                    this.setState({ categoryModal: false });
                                }}
                                width={480}
                                visible={categoryModal}
                                footer={<div style={{ textAlign: 'center' }}>
                                    <Button type="primary" onClick={this.editCategory}>确定</Button>
                                    <Button style={{ marginLeft: 24 }} onClick={() => {
                                        this.setState({ categoryModal: false });
                                    }}>取消</Button>
                                </div>}
                                title="更改标签"
                                destroyOnClose
                                bodyStyle={{ textAlign: 'center', position: 'relative' }}
                            >
                                <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 19 }} label="发票标签">
                                    {getFieldDecorator("category", {
                                        rules: [
                                            {
                                                required: true,
                                                message: '请选择发票标签',
                                            },
                                        ],
                                    })(
                                        <Select
                                            labelInValue
                                            onSearch={debounce(this.onCategorySearch, 300)}
                                            placeholder="请选择或输入发票标签"
                                            showSearch
                                            filterOption={false}
                                            onPopupScroll={this.companyScroll}
                                            style={{ width: '95%' }}
                                        >
                                            {
                                                this.state.invoiceCategoryList.map(e => <Select.Option title={e.name} key={e.id}
                                                    value={e.id}>{e.name}</Select.Option>)
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Modal>
                            <Modal
                                onCancel={() => {
                                    this.setState({ splitModal: false });
                                }}
                                width={480}
                                visible={splitModal}
                                footer={<div style={{ textAlign: 'center' }}>
                                    <Button type="primary" onClick={this.saveSplit}>确定</Button>
                                    <Button style={{ marginLeft: 24 }} onClick={() => {
                                        this.setState({ splitModal: false });
                                    }}>取消</Button>
                                </div>}
                                title="发票行数"
                                destroyOnClose
                                bodyStyle={{ textAlign: 'center', position: 'relative' }}
                            >
                                <Form.Item labelCol={{ span: 7 }} wrapperCol={{ span: 12 }} label="拆分行数">
                                    {getFieldDecorator("splitNum", {
                                        rules: [
                                            {
                                                validator: this.validator,
                                            }
                                        ],
                                    })(
                                        <InputNumber style={{ width: 210, marginLeft: 24 }} step={1} precision={0} />
                                    )}
                                </Form.Item>
                            </Modal>
                        </div>
                    )
            }
        </React.Fragment>;

    }
}

class SetOption extends React.Component {
    state = {
        invoiceCategoryList: [],
        pageIndex: 1
    }

    componentDidMount() {
        GetInvoiceCategory({
            pageIndex: 1,
            pageSize: 10
        }).then(({ data: { invoiceCategoryList, pagination } }) => {
            this.setState({
                invoiceCategoryList,
            });
        });
    }

    companyScroll = e => {
        e.persist();
        const { target } = e;
        if (this.state.invoiceCategoryList.length % this.state.pageIndex !== 0) {
            return; //数据加载完毕
        }

        if (target.scrollHeight - target.offsetHeight === Math.ceil(target.scrollTop)) {
            const { pageIndex } = this.state;
            const nextScrollPage = pageIndex + 1;
            GetInvoiceCategory({
                pageIndex: nextScrollPage,
                pageSize: 10
            }).then(({ data: { invoiceCategoryList, pagination } }) => {
                this.setState({
                    invoiceCategoryList: [...this.state.invoiceCategoryList, ...invoiceCategoryList],
                    pageIndex: nextScrollPage
                });
            });
        }
    }

    addChildForm = (type) => {
        const { childFormSet = [], saveSetting } = this.props;
        saveSetting({
            childFormSet: childFormSet.concat({
                key: moment().format("x"), //key
                name: `${type === 1 ? "专普票" : "交通票"}推送设置`,
                type,//1为专普票2为交通票
                childFormID: undefined, //formID
                childID: undefined,//子表单id
                fields: {},//字段对应关系
                conditions: []//需要推送的条件
            })
        });
    };

    delChildForm = (key) => {
        const { childFormSet = [], saveSetting } = this.props;
        saveSetting({ childFormSet: childFormSet.filter(e => e.key !== key) });
    };

    addType = (key, dataIndex) => {
        const { childFormSet = [], saveSetting } = this.props;
        saveSetting({
            childFormSet: childFormSet.map(e => {
                if (e.key === key) {
                    return {
                        ...e,
                        conditions: e.conditions.concat({
                            key: moment().format("x"),
                            dataIndex,
                            type: "eq",
                            value: undefined
                        })
                    };
                } else {
                    return e;
                }
            })
        });
    };

    delType = (key, index) => {
        const { childFormSet = [], saveSetting } = this.props;
        saveSetting({
            childFormSet: childFormSet.map(e => {
                if (e.key === key) {
                    return {
                        ...e,
                        conditions: e.conditions.filter((t, i) => i !== index)
                    };
                } else {
                    return e;
                }
            })
        });
    };

    onChange = (params, key, condition) => {
        const { childFormSet = [], saveSetting } = this.props;
        saveSetting({
            childFormSet: childFormSet.map(e => {
                if (e.key === key) {
                    return {
                        ...e,
                        conditions: e.conditions.map(t => {
                            if (t.key === condition.key) {
                                return {
                                    ...condition,
                                    ...params
                                };
                            } else {
                                return t;
                            }
                        })
                    };
                } else {
                    return e;
                }
            })
        });
    };

    changeField = (val, key, item) => {
        const { childFormSet = [], saveSetting } = this.props;
        saveSetting({
            childFormSet: childFormSet.map(e => {
                if (e.key === key) {
                    return {
                        ...e,
                        fields: {
                            ...e.fields,
                            [item.id]: val
                        }
                    };
                } else {
                    return e;
                }
            })
        });
    };

    changeForm = (childFormID, option, key) => {
        const { childFormSet = [], saveSetting } = this.props;

        saveSetting({
            childFormSet: childFormSet.map(e => {
                if (e.key === key) {
                    return {
                        ...e,
                        childFormID,
                        childID: option && option.key || undefined,
                        fields: {},
                        conditions: []
                    };
                } else {
                    return e;
                }
            })
        });
    };

    otherSwitchChange = checked => {
        const { saveSetting } = this.props;

        saveSetting({
            otherSwitchSet: checked
        });
    }

    trafficSwitchChange = checked => {
        const { saveSetting } = this.props;

        saveSetting({
            trafficSwitchSet: checked
        });
    }

    orderSwitchChange = checked => {
        const { saveSetting } = this.props;

        saveSetting({
            orderSwitchSet: checked
        });
    }

    changeName = (val, key) => {
        const { childFormSet = [], saveSetting } = this.props;

        saveSetting({
            childFormSet: childFormSet.map(e => {
                if (e.key === key) {
                    return {
                        ...e,
                        name: val
                    };
                } else {
                    return e;
                }
            })
        });
    };

    renderConditions = (item) => {
        const { key, conditions = [], type } = item;
        return conditions.length ? conditions.map((condition, i) => {
            let conditionValue, conditionType = [];
            switch (condition.dataIndex) {
                case "tab":
                    conditionType = [
                        { key: "eq", title: "等于" },
                        { key: "in", title: "包含" }
                    ];
                    conditionValue = <Select
                        onPopupScroll={this.companyScroll}
                        labelInValue
                        mode={condition.type === "in" ? "multiple" : null}
                        style={{ width: 210, marginLeft: 24 }} value={condition.value}
                        onChange={(val) => {
                            this.onChange({ value: val }, key, condition);
                        }}>
                        {
                            this.state.invoiceCategoryList.map(e => <Select.Option key={e.id}  title={e.name}
                                value={e.id}>{e.name}</Select.Option>)
                        }
                    </Select>;
                    break;
                case "invoiceType":
                    const inputTypes = type === 1 ? otherInputTypes : trafficInputTypes;
                    conditionType = [
                        { key: "eq", title: "等于" },
                        { key: "in", title: "包含" }
                    ];
                    conditionValue = <Select mode={condition.type === "in" ? "multiple" : null}
                        style={{ width: 210, marginLeft: 24 }} value={condition.value}
                        onChange={(val) => {
                            this.onChange({ value: val }, key, condition);
                        }}>
                        {
                            Object.keys(inputTypes).map(e => <Select.Option key={e}
                                value={Number(e)}>{inputTypes[e]}</Select.Option>)
                        }
                    </Select>;
                    break;
                case "name":
                    conditionType = [
                        { key: "eq", title: "等于" },
                        { key: "neq", title: "不等于" },
                        { key: "in", title: "包含" },
                        { key: "nin", title: "不包含" },
                        { key: "em", title: "为空" },
                        { key: "nem", title: "不为空" }
                    ];
                    switch (condition.type) {
                        case "eq":
                        case "neq":
                        case "nin":
                        case "in":
                            conditionValue = <Input style={{ width: 210, marginLeft: 24 }} value={condition.value}
                                onChange={(ev) => {
                                    this.onChange({ value: ev.target.value }, key, condition);
                                }} />;
                            break;
                        case "em":
                        case "nem":
                        default:
                            conditionValue = null;
                            break;
                    }

                    break;
                case "tax":
                case "valueAddedTax":
                    conditionType = [
                        { key: "eq", title: "等于" },
                        { key: "neq", title: "不等于" },
                        { key: "gt", title: "大于" },
                        { key: "gtoeq", title: "大于等于" },
                        { key: "lt", title: "小于" },
                        { key: "ltoeq", title: "小于等于" },
                        { key: "sc", title: "选择范围" },
                        { key: "em", title: "为空" },
                        { key: "nem", title: "不为空" }
                    ];
                    switch (condition.type) {
                        case "sc":
                            const value = condition.value || [];
                            const min = value[0] === 0 ? 0 : (value[0] || undefined);
                            const max = value[1] === 0 ? 0 : (value[1] || undefined);

                            conditionValue = <span>
                                <InputNumber placeholder="最小值" style={{ width: 115, marginLeft: 24 }} value={min}
                                    onChange={(val) => {
                                        this.onChange({ value: [val, max] }, key, condition);
                                    }} />
                                ~
                                        <InputNumber placeholder="最大值" style={{ width: 115 }} value={max}
                                    onChange={(val) => {
                                        this.onChange({ value: [min, val] }, key, condition);
                                    }} />
                            </span>;
                            break;
                        case "em":
                        case "nem":
                            conditionValue = null;
                            break;
                        default:
                            conditionValue = <InputNumber style={{ width: 210, marginLeft: 24 }} value={condition.value}
                                onChange={(val) => {
                                    this.onChange({ value: val }, key, condition);
                                }} />;
                            break;
                    }

                    break;
                default:
                    break;
            }
            return (<div key={condition.key} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8
            }}>
                <div className={styles.selectBox}>
                    <span style={{
                        width: 120,
                        display: "inline-block",
                        border: "1px solid #d9d9d9",
                        borderTopWidth: "1px",
                        borderRadius: 4,
                        padding: "5px 0 5px 12px"
                    }}
                    >
                        {
                            conditionMap[condition.dataIndex]
                        }
                    </span>
                    {
                        <Select style={{ marginLeft: 24, width: 120 }} value={condition.type} onChange={(val) => {
                            this.onChange({ type: val, value: undefined }, key, condition);
                        }}>
                            {
                                conditionType.map(e => <Select.Option key={e.key}
                                    value={e.key}>{e.title}</Select.Option>)
                            }
                        </Select>
                    }
                    {conditionValue}
                </div>
                <Icon style={{ cursor: "pointer" }} type="delete" onClick={() => {
                    this.delType(key, i);
                }} />
            </div>
            );
        }
        ) : null;
    };

    render() {
        const { formItems, childFormSet = [], otherSwitchSet = true, trafficSwitchSet = true, orderSwitchSet = true } = this.props;

        return (
            <div>
                <div style={{ padding: '24px 0 0' }}>
                    专普票TAB：<Switch checkedChildren="显示" unCheckedChildren="隐藏" checked={otherSwitchSet} onChange={this.otherSwitchChange} />
                </div>
                <div style={{ padding: '12px 0 0' }}>
                    交通票TAB：<Switch checkedChildren="显示" unCheckedChildren="隐藏" checked={trafficSwitchSet} onChange={this.trafficSwitchChange} />
                </div>
                <div style={{ padding: '12px 0 0' }}>
                    TAB顺序(默认在前)：<Switch checkedChildren="交通票" unCheckedChildren="专普票" checked={orderSwitchSet} onChange={this.orderSwitchChange} />
                </div>
                <div style={{ padding: '12px 0' }}>
                    <Button onClick={() => {
                        this.addChildForm(1);
                    }}>专普票推送</Button>
                    <Button style={{ marginLeft: 12 }} onClick={() => {
                        this.addChildForm(2);
                    }}>交通票推送</Button>
                </div>
                <Collapse defaultActiveKey={childFormSet.map(e => e.key)}>
                    {
                        childFormSet.map(item => {
                            const { key, childFormID, fields, type, conditions } = item;
                            const conditionColumns = type === 1 ? Object.keys(conditionMap) : Object.keys(conditionMap).filter(e => e !== "name");
                            return (<Collapse.Panel header={<Input onChange={(e) => {
                                this.changeName(e.target.value, key);
                            }} onClick={e => {
                                e.stopPropagation();
                            }} size="small" value={item.name} style={{
                                border: "none",
                                width: 280,
                                borderBottom: "1px dashed #d9d9d9",
                                boxShadow: "none"
                            }} />} key={key} extra={<Icon style={{ cursor: "pointer" }} type="delete" onClick={() => {
                                this.delChildForm(key);
                            }} />}>
                                <div style={{ padding: 12 }}>
                                    <p>选择子表单</p>
                                    <div>
                                        <Select style={{ width: "100%" }} defaultValue={childFormID}
                                            onChange={(childFormID, option) => {
                                                this.changeForm(childFormID, option, key);
                                            }}>
                                            {
                                                formItems.filter(e => e.formType === 1).map(item =>
                                                    <Select.Option key={item.id} value={item.formId}>
                                                        {item.name}
                                                    </Select.Option>
                                                )
                                            }
                                        </Select>
                                    </div>
                                    {
                                        childFormID && <div>
                                            <div style={{ padding: "12px 0" }}>
                                                <Dropdown
                                                    overlay={<Menu onClick={(e) => {
                                                        this.addType(key, e.key);
                                                    }}>
                                                        {
                                                            conditionColumns.map(e => <Menu.Item
                                                                disabled={conditions.map(e => e.dataIndex).includes(e)}
                                                                key={e}>{conditionMap[e]}</Menu.Item>)
                                                        }
                                                    </Menu>}
                                                >
                                                    <a className="ant-dropdown-link" href="javascript:;">
                                                        添加条件 <Icon type="down" />
                                                    </a>
                                                </Dropdown>
                                            </div>
                                            {this.renderConditions(item)}
                                            <p style={{ marginTop: "1em" }}>字段对应</p>
                                            <div>
                                                {
                                                    formItems.filter(e => e.formId === childFormID && e.type === "formItem").map(item =>
                                                        <div key={item.id} style={{ display: "flex", margin: 8 }}>
                                                            <div style={{ flex: 1 }}>
                                                                {item.name}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <Select style={{ width: "100%" }}
                                                                    defaultValue={fields[item.id]}
                                                                    onChange={(val) => {
                                                                        this.changeField(val, key, item);
                                                                    }}>
                                                                    {
                                                                        (type === 2 ? trafficColumns.filter((e, i) => i !== 0) : otherColumns.filter((e, i) => i !== 0)).map(e =>
                                                                            <Select.Option key={e.key} value={e.key}>
                                                                                {e.title}
                                                                            </Select.Option>)
                                                                    }
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    }
                                </div>
                            </Collapse.Panel>);
                        })
                    }
                </Collapse>

            </div>
        );
    }
}

export default {
    name: "发票组件",
    key: "Invoice",
    //挂载检测
    //query:object url链接参数
    //返回值 bool，true为挂载，false为不挂载
    fieldAuth: [{ name: "发票控件", key: "Invoice_Info" }],
    // loadCheck: ({ query }) => {
    //     return true;
    // },
    //表单数据加载后调用
    //query:object url链接参数
    //proxyState：object 代理存储的state
    //setPermission:function({hidden:[],show:[],disabled:[],readOnly:[]}) 设置权限
    //setSubmitInfo:function([{ name,triggerType,params }]) 设置提交按钮
    //setProxyState：function({}) 设置proxyState：object用法类似于setState
    //formDataModel:object 表单数据模型
    onLoaded: async ({
        query, proxyState, setPermission, setSubmitInfo,
        setProxyState, formDataModel, formInstanceId
    }) => {
        let data = await TrafficTicketGetList({//交通票
            formInstanceId
        });
        if (!data.data.error) {
            setProxyState({
                disabledTrafficTicketKeys: data.data.map(a => ({ ...a, operationStatus: 3 })),
                trafficTicketList: data.data.map(a => ({ ...a, operationStatus: 3 }))
            });
            data = await InvoicePoolGetList({//专普票
                formInstanceId
            });
        }
        if (!data.data.error) {
            setProxyState({
                disabledInvoiceKeys: data.data.map(a => ({ ...a, operationStatus: 3 })),
                invoiceList: data.data.map(a => ({ ...a, operationStatus: 3 }))
            });
        }
    },
    //校验回调 返回   {success::bool,msg::string}  success=false 中止提交
    onAuthority: ({ proxyState, formDataModel }) => {
        return {
            success: true
        };
    },
    //提交前回调 返回  {success::bool,msg::string}  success=false 中止提交
    //params 对应setSubmitInfo中的params
    beforeSubmit: ({ params, proxyState, formDataModel, setProxyState }) => {
        return {
            success: true
        };
    },
    //按钮回调 triggerType为 'click'
    onClick: ({ query, params, proxyState, setProxyState }) => {
    },
    //按钮回调 triggerType为 'submit' 返回  {success::bool,msg::string}  success=false 提交失败
    onSubmit: async ({ params, proxyState, submitData, query, setProxyState, formInstanceId }) => {
        const { invoiceList, trafficTicketList } = proxyState;
        const TicketVerifyActionRequests = [];

        invoiceList.forEach(e=>{
            TicketVerifyActionRequests.push({InvoiceId:e.invoiceId,InvoiceType:e.type})
        })
        trafficTicketList.forEach(e=>{
            TicketVerifyActionRequests.push({InvoiceId:e.id,InvoiceType:e.invoiceType})
        })

        const validResult = await VerifyIsHave({
            TicketVerifyActionRequests,
            Platform:"CRMG"
        })

        if(!validResult.isValid){
            return {
                success: false,
                msg: validResult.data ? `发票${validResult.data.map(e=>e.invoiceNO).join(',')}已被使用!` : '发票校验失败!'
            };
        }

        const result = await Save({
            TrafficTicketActionRequests: trafficTicketList.filter(a => a.status !== 3).map(a => ({ ...a, formInstanceId })),
            InvoicePoolActionRequests: invoiceList.filter(a => a.status !== 3).map(a => ({ ...a, formInstanceId, quantity: a.quanlity }))
        });
        return {
            success: result.data.isValid,
            msg: result.data.errorMessages || result.data.message
        };
    },
    onTempSave: async ({ params, proxyState, submitData, query, setProxyState, formInstanceId, getOtherBussinessProxyState }) => {
        const { invoiceList, trafficTicketList } = proxyState;
        const TicketVerifyActionRequests = [];

        invoiceList.forEach(e=>{
            TicketVerifyActionRequests.push({InvoiceId:e.invoiceId,InvoiceType:e.type})
        })
        trafficTicketList.forEach(e=>{
            TicketVerifyActionRequests.push({InvoiceId:e.id,InvoiceType:e.invoiceType})
        })

        const validResult = await VerifyIsHave({
            TicketVerifyActionRequests,
            Platform:"CRMG"
        })
        
        if(!validResult.isValid){
            return {
                success: false,
                msg: validResult.data ? `发票${validResult.data.map(e=>e.invoiceNO).join(',')}已被使用!` : '发票校验失败!'
            };
        }
        
        let { userName: CreateUserName, userId: CreateUserId, currentDepartmentName: DeptName,
            currentDepartmentId: DetpId, currentDeptName: OrgName, currentDeptId: OrgId } = JSON.parse(localStorage.getItem('author'));
        let bindList = trafficTicketList//.filter(a => a.status === 1)
            .concat(invoiceList)//.filter(a => a.status === 1))
            .map(a => ({
                TID: JSON.parse(a.attachment || '[]')[0],
                CreateUserId,
                CreateUserName,
                OrgId,
                OrgName,
                DetpId,
                DeptName
            }));//add
        let unbindList = trafficTicketList.filter(a => a.status === 0).concat(invoiceList.filter(a => a.status === 0).map(a => ({ ...a, quantity: a.quanlity }))).map(a => ({ TID: JSON.parse(a.attachment || '[]')[0] }));//remove
        const result = await Save({
            TrafficTicketActionRequests: trafficTicketList.filter(a => a.status !== 3).map(a => ({ ...a, formInstanceId })),
            InvoicePoolActionRequests: invoiceList.filter(a => a.status !== 3).map(a => ({ ...a, formInstanceId, quantity: a.quanlity }))
        });
        getOtherBussinessProxyState({
            businessKey: "workFlow",
            onSuccess: async ({ otherProxyState }) => {
                let DocumentID = otherProxyState.instanceID;
                let r = await bindTempDoc(bindList.map(a => ({ ...a, DocumentID })));
                r = await unbindTempDoc(unbindList.map(a => ({ ...a, DocumentID })));
            }
        });
        return {
            success: result.data.isValid,
            msg: result.data.errorMessages
        };
    },
    //需要显示在表单尾部的业务组件 proxyState将会附加到组件渲染的prop中
    components: (props) => <BillInfo {...props} />,
    option: (props) => <SetOption {...props} />,
    //初始化proxyState
    initialProxyState: {
        invoiceList: [],//专普票列表
        trafficTicketList: [],//交通票列表
        disabledInvoiceKeys: [],//专普票弹窗不能选中列表
        disabledTrafficTicketKeys: [],//交通票弹窗不能选中列表
        childList: {},//子表单数据
        invoiceContinuity: {},//连号发票信息
        trafficTicketContinuity: {}//连号发票信息
    }
};

