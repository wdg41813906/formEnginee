import react from 'react';
import { Row, Col, Icon, Popover, Pagination,Popconfirm } from 'antd';
import styles from './List.less'
// import { fileServer, pageSize } from '../../../utils/config'

const data = [1, 2, 3, 5, 43, 6, 5, 5, 7, 2, 5]
const Content = props => {

    return (
        <div className={styles.contentWrap}
         onClick={e=>{e.stopPropagation(); }}>
            <p className={styles.copy} onClick={ e=> { props.Copy(props.item)}}>复制</p>
            <Popconfirm title="确定删除？" onConfirm={ e=>{ props.Remove(props.item.id) }}
             icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
               <p className={styles.del}>删除</p>
            </Popconfirm>
        </div>
    )
}
export default class List extends react.Component {
    constructor(props) {
        super(props)
        this.props.ApplicationsGetListPaged(1)
    }

    render() {
        const { appList, appPageInfo } = this.props;
        return (
            <div>

                <Row >
                    <Col span={4} >
                        <div className={styles.appItem} onClick={this.props.AddToggle}>
                            <div className={styles.appIcon}

                            ><Icon type="plus" /></div>
                            <div className={styles.appTitle}>新增应用</div>
                        </div>
                    </Col>
                    {


                        appList.map(ele =>
                            <Col span={4} >
                                <div className={styles.appItem}
                                onMouseEnter={e=>{
                                  this.props.ItemOver(ele)
                                }}
                                onMouseLeave={e=>{
                                    this.props.ItemOut(ele)
                                }}
                                onClick={
                                    e => {
                                        this.props.GoDetail(ele)
                                    }
                                }>
                                    <div className={styles.appIcon}>
                                        <img src={`${config.fileServer}${ele.icon}`}/>
                                    </div>
                                    <div className={styles.appTitle}>{ele.name}</div>

                                    {

                                        ele.hover&& <Popover content={<Content item={ele} Copy={ this.props.Copy } Remove= { this.props.Remove}  />} placement="bottom" >
                                        <div onClick={ e=>{ e.stopPropagation(); }}  className={styles.toolIcon}> </div>
                                        </Popover>
                                    }


                                  {/*
                                   {
                                       ele.hover&& <div
                                        onClick={
                                            e=>{
                                                e.stopPropagation();
                                                this.props.ItemToolShow(ele);
                                            }
                                        }
                                       className={styles.toolIcon}> </div>
                                   }
                                   {
                                       ele.show&& <div className={styles.toolWrap} onClick={
                                        e => {
                                            e.stopPropagation();
                                        }
                                    }>
                                        <div class={styles.apopoverArrow}></div>

                                        <p onClick={
                                            e=>{
                                                this.props.Copy(ele)
                                            }
                                        } className={styles.copy}>复制</p>
                                        <Popconfirm title="确定删除？"
                                        onConfirm={
                                            e=>{
                                                this.props.Remove(ele.id)
                                            }
                                        }
                                         icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                                        <p className={styles.del}>删除</p>
                                        </Popconfirm>
                                    </div>
                                   }
                                */}
                                </div>


                            </Col>)
                    }

                </Row>

                <Pagination
                    showQuickJumper
                    className="ant-table-pagination"
                    total={appPageInfo.totalCount}
                    current={appPageInfo.pageIndex}
                    pageSize={config.pageSize}
                    onChange={this.props.ApplicationsGetListPaged}
                />
            </div>
        )
    }
}
