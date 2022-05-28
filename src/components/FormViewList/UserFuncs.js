import { Modal, Table, Icon } from 'antd';
import styles from "./UserFuncs.less"

class UserFuncs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [
                {
                    title: '功能名称', dataIndex: 'funcName', key: 'funcName', render: (text, record) => <span>
                        {!record.children ? <Icon type="folder-open" className={styles.folderopen} /> : null}{text}
                    </span>
                },
                {
                    title: '功能编码', width: '40%', dataIndex: 'funcCode', key: 'funcCode',
                    render: (text) => <span>
                        {text}
                        {text === this.state.activefuncCode ? <Icon type="check" className={styles.iconcheck} /> : null}
                    </span>
                },
            ],
            data: [],
            activefuncCode: '',
            funcID: '',
        };
    }
    transDate(list, idstr, pidstr) {
        var result = [], temp = {};
        for (let i = 0; i < list.length; i++) {
            temp[list[i][idstr]] = list[i];
        }
        for (let j = 0; j < list.length; j++) {
            let tempVp = temp[list[j][pidstr]];
            if (tempVp) {
                if (!tempVp["children"]) tempVp["children"] = [];
                tempVp["children"].push(list[j]);
            } else {
                result.push(list[j]);
            }
        }
        return result;
    }
    clickRow = (record) => {
        let { activefuncCode, funcID } = this.state;
        activefuncCode = record.funcCode;
        funcID = record.funcId;
        this.setState({ activefuncCode, funcID });
    }
    userFuncSubmit() {
        let { funcID } = this.state;
        this.props.funcSubmit(funcID);
    }
    componentDidMount() {
        const { userFuncsData } = this.props;
        let { data } = this.state;
        let isLowestData = userFuncsData.filter(v => !v.isLowest);
        data = this.transDate(isLowestData, "funcId", "pFuncId");
        this.setState({ data });
    }
    render() {
        const { visible } = this.props;
        let { columns, data, activefuncCode } = this.state;
        return (
            <div>
                <Modal
                    width={650}
                    title="选择菜单"
                    visible={visible}
                    onOk={this.userFuncSubmit.bind(this)}
                    onCancel={this.props.userFuncsCancel}
                    className={styles.func}
                >
                    <Table
                        bordered
                        columns={columns}
                        dataSource={data}
                        rowKey={record => record.funcCode}
                        pagination={false}
                        scroll={{ y: document.body.clientHeight - 350 }}
                        rowClassName={record => { return record.funcCode === activefuncCode ? styles.foucs : "" }}
                        onRow={(record) => {
                            return {
                                onClick: this.clickRow.bind(this, record)
                            };
                        }}
                    />
                </Modal>
            </div>
        );
    }
}
export default UserFuncs;
