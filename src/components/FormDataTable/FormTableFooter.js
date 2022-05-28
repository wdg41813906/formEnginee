import { useState, useEffect } from 'react'
import { Button, Modal, Switch, Radio, InputNumber, Pagination, Select, Collapse } from 'antd'
import styles from './FormTableFooter.less'
import { Com } from '../../utils'

function FormDataTableFooter(props) {
    const [settingModalVisible, setSettingModal] = useState(false)
    const [filterFooter, setFilterFooter] = useState([])
    const [filterShow, setFilterShow] = useState([])

    useEffect(() => {
        let filterTableValueJS = props.filterTableValue.toJS()
        if (filterTableValueJS.length > 0 && props.initFilterValue.length > 0) {
            filterTableValueJS.forEach(a => {
                if (!a.cusWidth) {
                    let tempinitFilterValue = props.initFilterValue.find(b => b.id === a.key)
                    a.cusWidth = tempinitFilterValue ? tempinitFilterValue.cusWidth : ''
                }
            })
        }
        setFilterFooter(filterTableValueJS)
        setFilterShow(props.filterShowList.toJS())
    }, [props.filterTableValue, props.filterShowList]);

    function footerSetting(id, valueName, value) {
        let filterValue = filterFooter.find(a => a.key === id)
        if (filterValue) {
            filterValue[valueName] = value
            setFilterFooter([...filterFooter])
        } else {
            let obj = {}
            obj[valueName] = value
            obj.key = id
            setFilterFooter([...filterFooter, obj])
        }
    }

    function filterShowSetting(id, valueName, value) {
        let filterValue = filterShow.find(a => a.key === id)
        if (filterValue) {
            filterValue[valueName] = value
            setFilterShow([...filterShow])
        } else {
            let obj = {}
            obj[valueName] = value
            obj.key = id
            setFilterShow([...filterShow, obj])
        }
    }

    function confirmBtn() {
        props.addFilterTableValue(filterFooter, true)
        props.addFilterShowList(filterShow, true)
        let style = []
        props.dataFilter.toJS().forEach(a => {
            if (a.isGroup) {
                let tempFilterFooter = filterFooter.find(b => b.key === a.key)
                let tempFilterShow = filterShow.find(c => c.key === a.key)
                let obj = {
                    id: a.key,
                    title: a.title,
                    cusWidth: tempFilterFooter.cusWidth,
                    width: a.width,
                    freezeType: tempFilterFooter.freezeType,
                    show: tempFilterFooter.show,
                    filterShow: tempFilterShow.filterShow
                }
                style.push(obj)
            } else {
                if (a.dataIndex) {
                    let tempFilterFooter = filterFooter.find(b => b.key === a.dataIndex)
                    let tempFilterShow = filterShow.find(c => c.key === a.dataIndex)
                    let obj = {
                        id: a.dataIndex,
                        title: a.title,
                        cusWidth: tempFilterFooter.cusWidth,
                        width: a.width,
                        freezeType: tempFilterFooter.freezeType,
                        show: tempFilterFooter.show,
                        filterShow: tempFilterShow.filterShow
                    }
                    style.push(obj)
                }
            }
        })
        props.addFooterSetting(JSON.stringify(style))
        // props.setStyleStatus(true)
        setSettingModal(false);
    }

    function cancelBtn() {
        setFilterFooter(props.filterTableValue.toJS());
        setSettingModal(false);
    }

    function resetBtn() {
        setFilterFooter(props.filterTableValue.toJS());
    }

    function settingButton() {
        setSettingModal(true)
    }

    function getPageIndex(value) {
        props.addFilterPage({
            pageIndex: value,
            pageSize: props.pageSize
        })
    }

    function getPageSize(value) {
        props.addFilterPage({
            pageIndex: props.pageIndex,
            pageSize: value
        })
    }

    function refresh() {
        props.addFilterPage({
            pageIndex: props.pageIndex,
            pageSize: props.pageSize
        })
    }

    function getColKey(col) {
        let colKey = []
        if (col.isGroup) colKey.push(col.key)
        else {
            if ((col.valueType === 'container' || col.valueType === 'external') && Array.isArray(col.children)) {
                col.children.forEach(a => {
                    let tempColKey = getColKey(a)
                    colKey.push.apply(colKey, tempColKey);
                })
            }
            else if (col.dataIndex) colKey.push(col.dataIndex)
        }
        return colKey
    }

    function buildSubFormColumnTree(id, columns, rowLen = 0) {
        let children = columns.filter(a => a.container === id);
        if (children.length > 0)
            rowLen++;
        let finalRow = rowLen;
        children.forEach(a => {
            let { children: subChildren, rowLen: subRowLen } = buildSubFormColumnTree(a.key, columns, rowLen);
            if (subChildren.length > 0)
                a.children = (a.children || []).concat(subChildren);
            if (subRowLen > finalRow)
                finalRow = subRowLen;
        });
        return { children, rowLen: finalRow };
    }

    let { children: columnsTree, rowLen } = buildSubFormColumnTree(props.rootId, props.dataColumns.toJS());

    function collapseCol(params) {
        return params.map((v, i) => {
            let [tempDataFilter, tempFilterShow] = ['', '']
            if (v.valueType !== 'external' || v.valueType !== 'container') {
                const tempColKey = getColKey(v)
                tempDataFilter = filterFooter.find(a => tempColKey.find(b => b === a.key))
                tempFilterShow = filterShow.find(a => tempColKey.find(b => b === a.key))
            }
            return (
                <Collapse
                    key={v.key}
                    bordered={false}
                    style={{ width: '100%' }}
                >
                    {
                        v.valueType === 'external' || v.valueType === 'container' ?
                            <Collapse
                                bordered={false}
                                style={{ width: '100%' }}
                            >
                                <Collapse.Panel header={<div style={{ fontSize: 16 }}>{v.title}</div>}>
                                    {v && Array.isArray(v.children) ? collapseCol(v.children) : null}
                                </Collapse.Panel>
                            </Collapse> :
                            <div className={styles.modalItem}>
                                <div className={styles.itemLeft}>{v.title}</div>
                                <div className={styles.itemRight}>
                                    <Switch checkedChildren="开启搜索" unCheckedChildren="关闭搜索" checked={tempFilterShow ? tempFilterShow.filterShow : true} onChange={e => filterShowSetting(v.isGroup ? v.key : v.dataIndex, 'filterShow', e)} />
                                    <Switch className={styles.opr} checkedChildren="显示" unCheckedChildren="隐藏" checked={tempDataFilter ? tempDataFilter.show : true} onChange={e => footerSetting(v.isGroup ? v.key : v.dataIndex, 'show', e)} />
                                    <div className={styles.opr}>冻结：
                                        <Radio.Group value={tempDataFilter ? tempDataFilter.freezeType : '0'} onChange={e => footerSetting(v.isGroup ? v.key : v.dataIndex, 'freezeType', e.target.value)} size='small'>
                                            {Com.freezeTypeArr.map((item, index) => <Radio.Button key={index} value={item.value}>{item.key}</Radio.Button>)}
                                        </Radio.Group>
                                    </div>
                                    <div className={styles.opr}>宽度：<InputNumber max={2000} value={tempDataFilter ? tempDataFilter.cusWidth || v.width : v.width} onChange={e => footerSetting(v.isGroup ? v.key : v.dataIndex, 'cusWidth', e)} /></div>
                                </div>
                            </div>

                    }
                </Collapse>
            )
        })
    }

    return (
        <div className={styles.footer}>
            <div className={styles.footerItem}>
                <Button icon="setting" className={styles.layout} onClick={() => settingButton()} />
                <Pagination
                    className={styles.layout}
                    current={props.pageIndex}
                    total={props.totalCount}
                    pageSize={props.pageSize}
                    onChange={value => getPageIndex(value)}
                />
                <Select
                    className={styles.layout}
                    showSearch
                    style={{ width: 200 }}
                    onChange={value => getPageSize(value)}
                    value={props.pageSize}
                >
                    <Select.Option value={10}>10条/每页</Select.Option>
                    <Select.Option value={20}>20条/每页</Select.Option>
                    <Select.Option value={30}>30条/每页</Select.Option>
                    <Select.Option value={40}>40条/每页</Select.Option>
                </Select>
                <Button icon="reload" title='刷新' onClick={refresh} />
            </div>
            <div className={`${styles.footerItem} ${styles.footerItemSpecail}`}>
                <div>
                    显示 {props.pageSize * (props.pageIndex - 1) + 1}-{props.totalCount < (props.pageIndex * props.pageSize) ? props.totalCount : props.pageIndex * props.pageSize}，共 {props.totalCount} 条
                </div>
            </div>
            <Modal
                title="表格配置"
                visible={settingModalVisible}
                centered={true}
                destroyOnClose={true}
                onCancel={() => { setSettingModal(false); }}
                footer={null}
                width={720}
                maskClosable={false}
                className={styles.modal}
                bodyStyle={{ marginBottom: "60px", maxHeight: "500px", overflowY: "auto" }}
            >
                <div className={styles.container}>
                    {
                        collapseCol(columnsTree)
                    }
                    <div className={styles.modalFooter}>
                        <Button className={styles.btn} type="primary" onClick={resetBtn}>重置</Button>
                        <Button className={styles.btn} type="primary" onClick={confirmBtn}>确定</Button>
                        <Button className={styles.btn} onClick={cancelBtn}>取消</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
export default FormDataTableFooter;
