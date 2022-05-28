import react from 'react';
import { Tabs ,Pagination } from 'antd';
import AppStoreList from './AppStoreList'
const TabPane = Tabs.TabPane;
function callback(key) {
  }
  function onChange(pageNumber) {
  }
export default class AppStore extends react.Component {

    constructor(props){
        super(props)
       
    }

    componentDidMount(){
        this.props.AppCateGoryGetAll()
    }
    render() {
        const {cateGoryList,appStorePageInfn}=this.props;
        return (
            <div>
                <div>
                    <Tabs defaultActiveKey="1"  onChange={e=>{
                        this.props.TabChange(e)
                    }}>
                    {
                        cateGoryList.map(ele=>
                            <TabPane tab={ele.name} key={ele.id}><AppStoreList
                             {...this.props}
                            /></TabPane>
                            )
                    }
                    
                    </Tabs>
                    <Pagination
                    showQuickJumper current={appStorePageInfn.pageIndex}
                     total={appStorePageInfn.totalCount} onChange={this.props.GetListPaged} />
               </div>
            </div>
        )
    }
}
