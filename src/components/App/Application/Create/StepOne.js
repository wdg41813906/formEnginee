

import react from 'react';
import styles from './../Create.less'
import StepBox from './StepBox'
import { AppType} from '../../../../utils/AppStoreConfig';
const List = [
    {
        id: AppType.blockApp, name: '空白应用', desc: '按照企业业务搭建全新应用', icon: `${styles.blockApp}`, iconSel: `${styles.blockAppSelect}`,
        select: false, choose: false
    },
    {
        id: AppType.templateApp, name: '模板应用', desc: '从模板中启用适合您业务的应用', icon: `${styles.templateApp}`, iconSel: `${styles.templateAppSelect}`,
        select: false, choose: false
    }]
export default class StepOne extends react.Component {
    constructor(props) {
        super(props);
        this.state = {
            appList: List
        }
    }
    ItemFn = (item) => {
        var list = this.state.appList;
        list.forEach(ele => {
            if (ele.id === item.id) {
                ele.select = !ele.select;
            }
        })

        this.setState({
            appList: list
        })
    }
    ItemClick=(item)=>{
        var list = this.state.appList;
        list.forEach(ele => {
            if (ele.id === item.id) {
                ele.choose =true;
            }else{
                ele.choose=false;
            }
        })
        this.setState({
            appList: list
        })
        if(item.id===AppType.blockApp){
            this.props.Next();
        }else{
            this.props.GoTeamplateForm()
        }
    }
    render() {
        const { appList } = this.state;
        return (<div className={styles.stepItem}>
            {
                appList.map(item =>
                    <StepBox key={item.id}  item={item} ItemClick={this.ItemClick} ItemFn={this.ItemFn}></StepBox>
                )
            }

        </div>)
    }
}