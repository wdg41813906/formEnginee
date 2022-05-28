import react from 'react';
import { Icon, Tooltip } from 'antd';
import styles from './LedgerIndex.less'
export default class LedgerTitle extends react.Component{

    render(){
        const {ledgerAllConfig,isPreview}=this.props;
        return(
            <div 
           style={{textAlign:ledgerAllConfig.textAlign,
              background:ledgerAllConfig.backgroundColor,
              color:ledgerAllConfig.textFill,
              paddingLeft:10,
              paddingRight:10,
              fontSize:ledgerAllConfig.textFontSize,
              fontFamily:ledgerAllConfig.textFontFamily,
              fontWeight:ledgerAllConfig.textFontWeight? 'bold':'normal', // 文本粗细
              fontStyle:ledgerAllConfig.textItalic?'italic':'normal',//斜体
              position:'relative'
            }}
            onClick={
                e=>{
                    if(!isPreview){
                        this.props.LedgerConfigShowToggel()
                    }
                }
            } className={styles.ledgerTitle}>
               {ledgerAllConfig.name}
               &nbsp;
               {
                ledgerAllConfig.reMark?
                 <Tooltip title={ ledgerAllConfig.reMark} placement="bottom">
                 <Icon  style={{cursor:'pointer',color:'#000'}} 
                 type="exclamation-circle" theme="outlined" />
               </Tooltip>:undefined
               }

             {
                isPreview&&
                <Tooltip title='退出预览' placement="leftBottom">
                <Icon  
                  onClick={
                      e=>{
                      e.stopPropagation();
                        this.props.Preview();
                      }
                  }
                type="close"  style={{fontSize:20,color:'#000',position:'absolute',right:20,top:16}}/>

                </Tooltip>
             }  
            </div>
        )
    }
}