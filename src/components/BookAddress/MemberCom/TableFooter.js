import styles from "./TableFooter.less"
import { Button, Icon, Input, message, Select } from "antd"
import { Component } from "react";
import { Map, List, is, fromJS } from 'immutable';

const Option = Select.Option;

let time = null;
class TableFooter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: props.pageIndex
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.state.inputValue !== nextProps.pageIndex) {
            this.setState({
                inputValue: nextProps.pageIndex
            })
        }
    }
    checkValue(value) {
        let me = this;
        let reg = /^\d+$/ig, totalPage = this.props.totalPage, inputValue = this.state.inputValue;
        me.setState({
            inputValue: value
        }, () => {
            console.log(inputValue);
            if (value > totalPage || !reg.test(value)) {
                message.config({ maxCount: 1, duration: 0.2 });
                message.warning("请输入符合的值");
                time = setTimeout(() => {
                    me.setState({
                        inputValue
                    })
                }, 500);
            };
            console.log(me.state.inputValue);
        });
    }
    render() {
        let { inputValue } = this.state;
        let { pageIndex, totalPage, getPageTableData, pageSize, selecChange, showSelect,totalCount } = this.props;
        return (
            <div className={styles.footer}>
                {
                    showSelect ? (
                        <div className={styles.footerItem}>
                            <Select
                                showSearch
                                style={{ width: 200 }}
                                onChange={(value) => { selecChange && selecChange(value); }}
                                value={pageSize}
                            >
                                <Option value={20}>20条/每页</Option>
                                <Option value={50}>50条/每页</Option>
                                <Option value={100}>100条/每页</Option>
                            </Select>
                            <div className={styles.footerText}>共{totalCount?totalCount:totalPage * pageSize}条</div>
                        </div>
                    ) : ""
                }

                <div className={`${styles.footerItem} ${styles.footerItemSpecail}`}>
                    <div className={styles.footerPage}>
                        <Button disabled={pageIndex <= 1} onClick={() => { getPageTableData({ type: "prev" }); }} >
                            <Icon type="left" />
                        </Button>
                        <Button disabled={pageIndex >= totalPage} onClick={() => { getPageTableData({ type: "next" }); }} >
                            <Icon type="right" />
                        </Button>
                    </div>
                    <div className={styles.footerPageNum}>
                        <Input style={{ width: "30px", height: "30px", padding: 0, textAlign: "center" }} value={inputValue} onChange={(e) => { this.checkValue(e.target.value); }} onBlur={() => { pageIndex !== inputValue && getPageTableData({ value: inputValue }); }} />
                        <span className={styles.line}>/</span>
                        <span className={styles.num}>{totalPage || totalPage === 0?totalPage:Math.ceil(totalCount/pageSize)}</span>
                    </div>
                </div>
            </div>
            // {/* <div className={styles.footer}>
            //     <div className={`${styles.footerItem} ${styles.footerItemSpecail}`}>
            //         <div className={styles.footerPage}>
            //             <Button disabled={pageIndex <= 1} onClick={() => { getPageTableData({ type: "prev" }); }} >
            //                 <Icon type="left" />
            //             </Button>
            //             <Button disabled={pageIndex >= totalPage} onClick={() => { getPageTableData({ type: "next" }); }} >
            //                 <Icon type="right" />
            //             </Button>
            //         </div>
            //         <div className={styles.footerPageNum}>
            //             <Input style={{ width: "30px", height: "30px", padding: 0, textAlign: "center" }} value={inputValue} onChange={(e) => { this.checkValue(e.target.value); }} onBlur={() => { pageIndex !== inputValue && getPageTableData({ value: inputValue }); }} />
            //             <span className={styles.line}>/</span>
            //             <span className={styles.num}>{totalPage}</span>
            //         </div>
            //     </div>
            // </div> */}
        );
    }
}
export default TableFooter;