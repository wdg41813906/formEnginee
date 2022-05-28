import styles from "./TableFooter.less"
import { Button, Icon, Input, message, Select, Pagination, Modal, InputNumber, Switch, Radio } from "antd"
import { Component } from "react";
import { Map, List, is, fromJS } from 'immutable';

const Option = Select.Option;

const modalBody = {
    paddingBottom: "61px",
    maxHeight: "500px",
    overflowY: "auto"
}
const Setting = (props) => {
    const { settingModalVisible, operateSettingModal, filedsArr, changeAttrib, resetConfig, confirm } = props;
    // console.log(filedsArr);
    const change = (id, valueName, value) => {
        // console.log(value);
        switch (valueName) {
            case "freezeType":
                value = value.target.value;
                break;
        }
        changeAttrib({ id, valueName, value });
    }
    const confirmBtn = () => {
        confirm(filedsArr);
        operateSettingModal(false);
    }
    const cancelBtn = () => {
        operateSettingModal(false);
    }
    const resetBtn = () => {
        resetConfig();
    }
    return (
        <Modal
            title="表格配置"
            visible={settingModalVisible}
            centered={true}
            destroyOnClose={true}
            onCancel={() => { operateSettingModal(false); }}
            footer={null}
            width={720}
            maskClosable={false}
            className={styles.modal}
            bodyStyle={modalBody}
        >
            <div className={styles.container}>
                {
                    filedsArr && filedsArr.map((v, i) => (
                        <div key={i} className={styles.modalItem}>
                            <div className={styles.itemLeft}>{v.title}</div>
                            <div className={styles.itemRight}>
                                <Switch checkedChildren="开启搜索" unCheckedChildren="关闭搜索" checked={v.filterShow} onChange={change.bind(null, v.id, "filterShow")} />
                                <Switch className={styles.opr} checkedChildren="显示" unCheckedChildren="隐藏" checked={v.show} onChange={change.bind(null, v.id, "show")} />
                                <div className={styles.opr}>冻结：
                                    <Radio.Group value={v.freezeType} onChange={change.bind(null, v.id, "freezeType")} size="small">
                                        <Radio.Button value="1">左</Radio.Button>
                                        <Radio.Button value="0">无</Radio.Button>
                                        <Radio.Button value="2">右</Radio.Button>
                                    </Radio.Group>
                                </div>
                                <div className={styles.opr}>宽度：<InputNumber value={v.width ? v.width : v.cusWidth} onChange={change.bind(null, v.id, "width")} /></div>
                            </div>
                        </div>
                    ))
                }
                <div className={styles.modalFooter}>
                    <Button className={styles.btn} type="primary" onClick={resetBtn}>重置</Button>
                    <Button className={styles.btn} type="primary" onClick={confirmBtn}>确定</Button>
                    <Button className={styles.btn} onClick={cancelBtn}>取消</Button>
                </div>
            </div>
        </Modal>
    );
}
// 初始化 field 项
const initColumns = (columns) => {
    console.log(columns);
    return columns.reduce((prev, next, i) => {
        const { id, width, title, freezeType, show, filterShow, cusWidth } = next;
        if (id === "del") return prev;
        prev.push({
            id,
            width,
            cusWidth,
            title,
            freezeType: freezeType ? freezeType : "0",//0为 不固定,1为 固定在左边，2为 固定在右边
            show: show === undefined ? true : show,//显示字段
            filterShow: filterShow === undefined ? false : filterShow,//是否显示 条件
        });
        return prev;
    }, []);
}

class TableFooter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            settingModalVisible: false,
            changeFiledsObj: {},
            reset: false,
            isChange: false
        }
        if (props.isSet) {
            this.state.columns = props.columns;
            this.state.props = props;
            this.state.filedsArr = initColumns(props.columns);
        }
        this.operateSettingModal = this.operateSettingModal.bind(this);
        this.changeAttrib = this.changeAttrib.bind(this);
        this.resetConfig = this.resetConfig.bind(this);
        this.confirm = this.confirm.bind(this);
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        // console.log(nextProps.columns);
        if (!nextProps.isSet) {
            return null;
        }
        let result = {};
        if (!is(nextProps.columns, prevState.props.columns)) {
            result.props = nextProps;
            result.filedsArr = initColumns(nextProps.columns);
        }
        if (!prevState.columns.length && nextProps.columns.length) {
            result.columns = nextProps.columns;
        }
        return result;
    }
    // 操作设置模块
    operateSettingModal(bool) {
        if (!bool) {
            this.setState({
                changeFiledsObj: {}
            });
        }
        this.setState({
            settingModalVisible: bool
        });
    }
    // 在 footer 的 组件 中 属性变化的 方法
    changeAttrib({ id, valueName, value }) {
        let { filedsArr } = this.state;
        // console.log(id, valueName, value, filedsArr);
        const { changeFiledsObj } = this.state;
        // 返回给 上一级，方便于 匹配 哪些项发生了变化
        changeFiledsObj[id] = changeFiledsObj[id] ? { ...changeFiledsObj[id], [valueName]: value } : { [valueName]: value };
        valueName === "width" && (changeFiledsObj[id] = { ...changeFiledsObj[id], "cusWidth": value });
        filedsArr.forEach(item => {
            if (item.id === id) {
                item[valueName] = value;
                valueName === "width" && (item.cusWidth = value);
            }
        });
        this.setState({ filedsArr, changeFiledsObj, reset: false, isChange: true });
    }
    // 重置 配置
    resetConfig() {
        const { columns } = this.state;
        this.setState({
            filedsArr: initColumns(columns),
            changeFiledsObj: {},
            reset: true
        })
    }
    // 确定
    confirm(filedsArr) {
        let { isChange, reset } = this.state;
        if (!isChange && !reset) return;
        let ids = Object.keys(this.state.changeFiledsObj);
        if (this.props.confirmRebuild instanceof Function && (ids.length || reset)) {
            this.props.confirmRebuild({ changeFieldsObj: this.state.changeFiledsObj, reset, originColumns: this.state.columns });
        }
        this.props.setJson instanceof Function && this.props.setJson(filedsArr);
        this.setState({ reset: false });
    }
    render() {
        let { pageIndex, totalPage, getPageTableData, pageSize, selecChange, totalCount, isSet, refresh } = this.props;
        let { settingModalVisible, filedsArr } = this.state;
        // console.log(filedsArr);
        let settingProps = {
            filedsArr,
            settingModalVisible,
            changeAttrib: this.changeAttrib,
            operateSettingModal: this.operateSettingModal,
            resetConfig: this.resetConfig,
            confirm: this.confirm
        }
        return (
            <div className={styles.footer}>
                {
                    isSet ? <Setting {...settingProps} /> : null
                }
                <div className={styles.footerItem}>
                    {
                        isSet ? <Button icon="setting" className={styles.layout} onClick={this.operateSettingModal.bind(this, true)} /> : null
                    }
                    <Pagination className={styles.layout} current={pageIndex} total={totalCount} pageSize={pageSize} onChange={getPageTableData} />
                    <Select
                        className={styles.layout}
                        showSearch
                        style={{ width: 200 }}
                        onChange={(value) => { selecChange && selecChange(value); }}
                        value={pageSize}
                    >
                        <Option value={10}>10条/每页</Option>
                        <Option value={20}>20条/每页</Option>
                        <Option value={30}>30条/每页</Option>
                        <Option value={40}>40条/每页</Option>
                    </Select>
                    <Button icon="reload" title='刷新' onClick={refresh && refresh} />
                </div>
                <div className={`${styles.footerItem} ${styles.footerItemSpecail}`}>
                    <div>
                        显示 {totalCount > 0 ? (pageSize * (pageIndex - 1) + 1) : 0} - {totalCount < (pageIndex * pageSize) ? totalCount : pageIndex * pageSize}，共 {totalCount ? totalCount : totalPage * pageSize} 条
                    </div>
                </div>
            </div>
        );
    }
}
export default TableFooter;
