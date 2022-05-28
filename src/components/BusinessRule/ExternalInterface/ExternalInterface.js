
import { Card, Menu, Dropdown, Icon } from 'antd';

import DataInterface from './DataInterface'
import com from '../../../utils/com'
import styles from './ExternalInterface.less'
export default class ExternalInterface extends React.Component {
    constructor(props) {
        super(props)


    }
    add = (ele) => {
        let mapList = [];
        ele.sourceParameterViewResponses.forEach(map => {
            mapList.push({
                ...map,
                ...{ SourceParameterId: map.id, id: com.Guid(), operationStatus: 1 }
            })
        })

        this.props.onAdddataInterfaceList({
            id: com.Guid(),
            operationStatus: 1,
            name: ele.name,
            sourceTypeConfigId: ele.id,
            // operationStatus: 1,
            mappingData:mapList
        })
    }
    render() {
        const { formTemplateId, exteralList, dataInterfaceList,form,templateFields ,pushType} = this.props;
        const dataInterProps = {
            form,
            formTemplateId,
            dataInterfaceList,
            templateFields,
            onModifyDataInterface: this.props.onModifyDataInterface,
            onDelDataInterface: this.props.onDelDataInterface
        }
        const menu = (
            <Menu>
                {
                    exteralList.map(ele => <Menu.Item key={ele.id}>
                        <span onClick={
                            e => { this.add(ele) }
                        }>{ele.name}</span>
                    </Menu.Item>)
                }


            </Menu>
        );
        return (
            <div>
                <Card title="选择推送接口" headStyle={{ position: 'relative', zIndex: 9999 }}
                    extra={
                        <Dropdown  overlay={menu} disabled={pushType===''}>
                            <p className={styles.actionAdd}>
                                数据接口<Icon type="down" />
                            </p>
                        </Dropdown>

                    } >
                    <DataInterface {...dataInterProps} />
                </Card>
            </div>
        )
    }
}
