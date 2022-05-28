//import { GetBusinessComponent } from '../../services/MicroEnterprise/MicroEnterprise'
import { GetForModify } from "../../services/DataManage/DataManage";
//import { Select } from 'antd';

export default {
    name: '小微企业',
    summary: '台账页面字段显示应用到表单页面',
    key: 'microEnterprise',
    //挂载检测
    // loadCheck: async ({ query, ...others }) => {
    //     return false;
    //     // const { data } = await GetBusinessComponent({
    //     //     key: 'microEnterprise' // 业务组件的key
    //     // });
    //     // return data.enable;
    // },
    //表单数据加载后调用
    onLoaded: async ({ query, proxyState, setPermission, setSubmitInfo, setProxyState, readOnly, addLinker, setting }) => {
        //addLinker(setting.targetId);
        let { formTemplateId, tabId } = query;
        const type = 99
        let { data } = await GetForModify({ formTemplateVersionId: tabId, formTemplateId: formTemplateId, type })
        try {
            let tempStyle = JSON.parse(data.style)
            let permissionList = {
                hidden: tempStyle.filter(a => a.show === false).map(a => a.id),
                show: tempStyle.filter(a => a.show === true).map(a => a.id),
                edit: [],
                disabled: []
            };
            setPermission(permissionList);
        } catch (error) { }
    },
    onLink: ({ id, data, setProxyState, index, addRowData, setValue, setting }) => {
        // setValue({
        //     id: '6e580452-4f59-8627-e811-035bd1e4cd1f',//'2e3c5c60-bd74-9d76-91b6-cd8fd1da5064',
        //     value: 'onlink',
        //     index
        // });
        //setProxyState({ test: 'test' });
    },
    // components: ({ proxyState, setProxyState, addRowData, removeRowData }) => {
    //     return <div>
    //         <p>proxyState:{JSON.stringify(proxyState)}</p>
    //         <button onClick={() => {
    //             let p = addRowData('4dcf0c97-3ab5-653e-4cde-6a9818e1ff21',
    //                 {
    //                     '0a1a7323-c2ee-6102-479a-d41e49dc90b6': 1,
    //                     '873980e6-bda0-a4f7-a08f-473ace782f44': 2,
    //                     'e60819e8-1b66-226d-bfa6-a716c4fa1d0c': 3
    //                 });
    //             let pl = proxyState.pl || [];
    //             setProxyState({ pl: [...pl, p] })
    //         }}>addRow</button>
    //         <button onClick={() => {
    //             let pl = proxyState.pl;
    //             if (Array.isArray(pl) && pl.length > 0) {
    //                 removeRowData('4dcf0c97-3ab5-653e-4cde-6a9818e1ff21', pl[0]);
    //                 setProxyState({ pl: pl.slice(1) });
    //             }
    //         }} >removeRow</button>
    //         <button onClick={() => { let count = proxyState.count || 0; count++; setProxyState({ count }) }}>setProxyState</button>
    //     </div>
    // },
    // option: ({ formItems, targetId, saveSetting }) => {
    //     return <Select style={{ width: '100%' }} value={targetId} onChange={(targetId) => saveSetting({ targetId })}>
    //         {
    //             formItems.map(item =>
    //                 <Select.Option key={item.id} value={item.id}>
    //                     {item.name}
    //                 </Select.Option>
    //             )
    //         }
    //     </Select>
    // },
};

class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ct: 0
        }
    }
    render() {
        let { proxyState, setProxyState, addRowData, removeRowData } = this.props;
        let { ct } = this.state;
        return <div>
            <p>proxyState:{JSON.stringify(proxyState)}</p>
            <button onClick={() => {
                let p = addRowData('4dcf0c97-3ab5-653e-4cde-6a9818e1ff21',
                    {
                        '0a1a7323-c2ee-6102-479a-d41e49dc90b6': 1,
                        '873980e6-bda0-a4f7-a08f-473ace782f44': 2,
                        'e60819e8-1b66-226d-bfa6-a716c4fa1d0c': 3
                    });
                let pl = proxyState.pl || [];
                setProxyState({ pl: [...pl, p] })
            }}>addRow</button>
            <button onClick={() => {
                let pl = proxyState.pl;
                if (Array.isArray(pl) && pl.length > 0) {
                    removeRowData('4dcf0c97-3ab5-653e-4cde-6a9818e1ff21', pl[0]);
                    setProxyState({ pl: pl.slice(1) });
                }
            }} >removeRow</button>
            <button onClick={() => { let count = proxyState.count || 0; count++; setProxyState({ count }) }}>setProxyState</button>
        </div>
    }
}
