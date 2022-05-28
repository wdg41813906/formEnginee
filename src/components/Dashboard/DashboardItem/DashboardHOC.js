


import styles from './DashboardHOC.less'
import { Icon, Tooltip } from 'antd';
import BaseItem from './BaseItem';
import {ReportItemArray} from '../../../utils/DashboardConfig'
function DashboardHOC(text, canChange) {
  return function (WrappedComponent) {
    return class extends BaseItem {
      render() {
        const { config } = this.props.item;
        const {title,style}=config;
        
        return (<div className={styles.dashboardContent}>
          <div style={{
            whiteSpace:'nowrap',
            textAlign: title.textAlign,
            background: title.backgroundColor,
            color: title.textFill, 
            fontSize: title.textFontSize,
            fontFamily:title.textFontFamily,
            fontWeight:title.textFontWeight? 'bold':'normal', // 文本粗细
            fontStyle:title.textItalic?'italic':'normal',//斜体
          }} className={styles.dashboardTitle}>
            {
              !title.name ?
                this.props.item.title :
                title.name
            }
            &nbsp;
          {
              title.reMark ?
                <Tooltip title={title.reMark}>
                  <Icon style={{ cursor: 'pointer', color: '#1890ff' }} type="exclamation-circle" theme="outlined" />
                </Tooltip> : undefined
            }
           
            {
              (this.props.isPreview&&this.props.reportPreviewShow
                &&ReportItemArray.indexOf(this.props.item.type)>-1) ?
              <div  onClick={
                e=>{
                  
                  this.props.ReportPreviewToggle()
                }
              } style={{
                position:'absolute',
                right:23,
                top:2,
              }}>
                  <Tooltip placement="bottom" title="缩小">
                      <div className={styles.optItem}>
                     
                      <Icon style={{fontSize:25}} type="fullscreen-exit" />
                      </div>
                  </Tooltip>
              </div>:undefined
           }
           
          </div>
          <div style={{ background: style.backgroundColor }}>
            <WrappedComponent  {...this.props} />
          </div>

        </div>)
      }
    }
  }
}
export default DashboardHOC;