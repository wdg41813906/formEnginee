import react from 'react';
import styles from './AddDashboard.less'
import { is } from 'immutable';

import { Modal, List, Icon, Pagination,Button } from 'antd';
import BaseImmutableComponent from '../../../components/BaseImmutableComponent'

const size=8;
export default class AddDashboard extends BaseImmutableComponent {

  constructor(props){
  super(props);
  this.state={
    pageIndex:1
  }
  this.Init(1)
  }
  Init=(index)=>{
    this.props.GetTable({
      pageIndex:index,
      pageSize:size
    })
  }
  render() {
    const { tableList,dashBoardPage } = this.props;
    
    return (
      <div>
        <Modal
          title="添加图表"
          centered
          maskClosable={false}
          visible={this.props.addDashboardShow}
          onOk={() =>
            
            
            this.props.ReportItemAdd()
          
          }
          onCancel={() => this.props.AddDashboardToggle()}
        >
          <div className={styles.TableWrap}>
            {
              tableList.map((ele,index) => <div key={index} onClick={
                item => { this.props.TableItemSelect(ele) }
              } className={`${styles.TableItem} ${ele.select ? styles.selected : ''}`}>
                <span>{ele.name}</span>
                {
                  ele.select ? <Icon style={{ position: 'absolute', right: 10, color: '#1890ff' }} type="check-circle" theme="twoTone" /> :
                    undefined
                }

              </div>
              )
            }
            <div className={styles.TableItem}>
              <Pagination
                showQuickJumper={{ goButton: <Button>Go</Button> }}
                onChange={e => { 
                 this.Init(e)
                  this.setState({
                  pageIndex:e
                }) }}
                
                total={dashBoardPage.total}
                showSizeChanger
                onShowSizeChange={e => { alert(e) }}
                simple
                pageSize={size}
                current={this.state.pageIndex}  />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
