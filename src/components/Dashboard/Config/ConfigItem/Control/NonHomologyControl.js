import ControlHOC from './ControlHOC'
import react from 'react';
import styles from './Control.less'
import './NonHomologyControl.less';
import { FontFamily } from '../../../../../utils/DashboardConfig'
import { Collapse, Select, Icon } from 'antd';
const plainOptions = ['Apple', 'Pear', 'Orange'];
const defaultCheckedList = ['Apple', 'Orange'];
const Panel = Collapse.Panel;
const Option = Select.Option;

class Text extends react.Component {
    render() {
        return (<div>
            {this.props.isLink?<Icon type="link" />:undefined}  {this.props.name}
            </div>)
    }
}

@ControlHOC()
export default class HomologyControl extends react.Component {
    state = {
        checkedList: defaultCheckedList,
        indeterminate: true,
        checkAll: false,
    };
    onChange = (checkedList) => {
        this.setState({
            checkedList,
            indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
            checkAll: checkedList.length === plainOptions.length,
        });
    }


    render() {

        const { item, datakey, value } = this.props
        return (

            <Collapse bordered={false} defaultActiveKey={['1']}>
                {
                    value.map(parent => <Panel header={<Text  name={parent.name} isLink={parent.selectField!=='none'}/>} key={parent.id}>

                        <Select value={parent.selectField} onChange={e=>{
                            this.props.RefreshData(item,parent,e)
                        }} style={{ width: 120 }}>
                            <Option value="none">不联动</Option>
                             {
                                parent.fields.map(ele =>
                                    <Option key={ele.code} value={ele.code}>{ele.name}</Option>)
                            }

                        </Select>
                    </Panel>)
                }


            </Collapse>

        )
    }
}