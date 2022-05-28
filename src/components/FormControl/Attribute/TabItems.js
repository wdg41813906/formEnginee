import React from 'react'
import { Input, Select, Icon, Row, Col, Modal, Tooltip, Popconfirm } from 'antd';
import Attribute from './Attribute.js'
import com from '../../../utils/com';
import FORMSTATUS from '../../../enums/FormStatus';
import immutable, { Map, List } from 'immutable';


@Attribute('标签项')
class TabItems extends React.PureComponent {
    constructor(props) {
        super(props);
        this.addItem = this.addItem.bind(this);
        this.changeInput = this.changeInput.bind(this);
        this.delItem = this.delItem.bind(this);
    }
    addItem() {
        let newTabs = Array.from(this.props.tabItems);
        newTabs.push({ title: `标签页${this.props.tabItems.length + 1}`, child: [], formId: com.Guid(), status: FORMSTATUS.Add });
        this.props.onChange({ tabItems: newTabs });
    }
    delItem(e) {
        let tabItems = this.props.tabItems;
        let delItem = null;
        let exist = tabItems.find(a => a.formId === e.formId);
        let index = tabItems.indexOf(exist);
        delItem = tabItems.splice(index, 1);
        // tabItems.forEach((a, index) => {
        //     if (a.FormId == e.FormId) {
        //         delItem = tabItems.splice(index, 1);
        //     }
        // })
        let list = delItem[0].child;
        this.props.onChange({ tabItems, activeKey: tabItems[0].formId });
        this.props.delFormItemBatch(list);
    }
    changeInput(e) {
        let newTabs = Array.from(this.props.tabItems);
        newTabs[e.target.getAttribute("data-index")].title = e.target.value;
        if (newTabs[e.target.getAttribute("data-index")].status != FORMSTATUS.Add)
            newTabs[e.target.getAttribute("data-index")].status = FORMSTATUS.Modify;
        // let index = e.target.getAttribute("data-index");
        // let newTabs = this.props.tabItems.setIn([index, 'title'], e.target.value);
        // if (newTabs.getIn([index, 'status']) != FORMSTATUS.Add) {
        //     newTabs.setIn([index, 'status'], FORMSTATUS.Modify)
        // }
        this.props.onChange({ tabItems: newTabs });
    }
    render() {
        return <div>{
            this.props.tabItems.map((p, index) => {
                return <div key={index} style={{ marginTop: 5 }}>
                    <Input style={{ width: '85%' }} data-index={index.toString()} value={p.title} onChange={this.changeInput} />
                    {index > 0 ?
                        <Popconfirm title='容器内的控件也会删除，确定要删吗?' onConfirm={(e) => { this.delItem(p) }}>
                            <Icon type="minus-circle-o" style={{ marginLeft: "5px", fontSize: 16, color: 'red' }} />
                        </Popconfirm> : null}
                </div>
            })}
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <a type="primary" onClick={this.addItem}>新增</a>
            </div>
        </div>;
    }
}
// export default TabItems;
export default {
    Component: TabItems,
    getProps: (props) => {
        let { tabItems, delFormItemBatch, onChange, } = props;
        return { tabItems, delFormItemBatch, onChange, };
    }
};
