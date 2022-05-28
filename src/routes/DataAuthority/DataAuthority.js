import { Component } from "react"
import ReactDOM from 'react-dom';
import { Radio, Button, Collapse, Select, Input, Icon } from "antd"
import { connect } from 'dva';
import styles from "./DataAuthority.less"
import { Guid } from "../../utils/com"
import { List, Map, is } from "immutable"

import AddAuthorityTeam from "../../components/DataAuthority/AddAuthorityTeam"

const configArr = [
    { title: "直接提交数据", des: "在此分组内的成员只可以填报数据，设置了页面共享的成员自动加入此分组" },
    { title: "管理全部数据", des: "在此分组内的成员可以管理全部数据、填报数据、但不可以导入数据" },
    { title: "查看全部数据", des: "在此分组内的成员可以查看所有数据" },
    { title: "管理本人数据", des: "在此分组内的成员可以管理自己填报的数据" },
]
class DataAuthority extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authorityTeamModal:false
        }
        this.changeAuthorityTeamModal = this.changeAuthorityTeamModal.bind(this);
    }
    changeAuthorityTeamModal(bool){
        this.setState({
            authorityTeamModal:bool
        });
    }
    render() {
        let {authorityTeamModal} = this.state;
        const authorityTeamProps = {
            authorityTeamModal,
            changeAuthorityTeamModal:this.changeAuthorityTeamModal
        }
        return (
            <div className={styles.container}>
                {
                    authorityTeamModal?<AddAuthorityTeam {...authorityTeamProps}/>:null
                }
                <div className={styles.des}>
                    <div className={styles.title}>
                        数据权限
                        <span>设置对应的「数据权限」，可以让团队成员管理表单搜集到的数据<a>帮助文档</a></span>
                    </div>
                    <div className={styles.titleBtn}>
                        <a><Icon type="link" className={styles.icon} />表单访问链接</a>
                        <a><Icon type="setting" className={styles.icon} />权限组移动端样式</a>
                    </div>
                </div>
                <div className={styles.subContainer}>
                    <div className={styles.addCop} onClick={this.changeAuthorityTeamModal.bind(this,true)}>
                        <Button icon="plus" className={styles.topBtn}>新建权限组</Button>
                    </div>
                    {
                        configArr.map((item, i) => (
                            <div key={i} className={styles.auItem}>
                                <div className={styles.titleItem}>
                                    <div className={styles.title}>
                                        {item.title}
                                        <span>{item.des}</span>
                                    </div>
                                    <div className={styles.auEdit}>
                                        <a>删除</a>
                                        <a>编辑</a>
                                    </div>
                                </div>
                                <div className={styles.auBtn}><a><Icon type="plus" className={styles.icon} />点击选择成员</a></div>
                            </div>))
                    }
                </div>
            </div>
        )
    }
}

export default connect(({ dataAuthority }) => ({ dataAuthority }))(DataAuthority);
