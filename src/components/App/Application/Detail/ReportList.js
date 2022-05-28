import react from 'react';
import { Icon, Popover, Input, Pagination } from 'antd'
import None from './None'
import Content from './Content'
import styles from './../Detail.less'
const Search = Input.Search;
const formData = [1, 2, 3, 4, 5, 6, 7, 4, 7, 4, 5, 6, 3]
function onChange(pageNumber) {
    console.log('Page: ', pageNumber);
}

export default class ReportList extends react.Component {

    render() {
        const { reportList, reportPageInfo, pageSize } = this.props;

        return (
            <div className={styles.powerWrap}>
                <div className={styles.formHeader}>
                    <div className={styles.powerTitle}>
                        <Search onChange={
                            e => {
                                this.props.SetData({ reportKeyWord: e.target.value })
                            }
                        } style={{ width: 240 }} placeholder="请输入仪表盘名称"
                            onSearch={value => this.props.GetReportListByAppIdPaged(1)} enterButton />
                    </div>
                    <p onClick={
                        e => {
                            this.props.ToAdd('report')
                        }
                    } className={styles.powerEdit}>新建仪表盘<Icon type="file-add" /></p>
                </div>
                <div className={styles.formContent}>
                    {
                        reportList.map(ele =>
                            <div
                            onClick={e=>{this.props.GoReport(ele)}}
                             onMouseEnter={e=>{this.props.ItemOver(ele,'reportList')}}
                            onMouseLeave={e=>{this.props.ItemOut(ele,'reportList')}}
                             key={ele.applicationTemplateId} className={styles.formItem}>
                            
                             {
                                ele.hover&& 
                                <Popover content={<Content item={ele}
                                 Copy={this.props.CopyReport}
                                 Remove={this.props.ApplicationTemplateRemove}/>}
                                
                                placement="bottom" >
                                <div className={styles.toolIcon}> </div>
                            </Popover>
                             }
                               
                                <Icon className={styles.formIcon} type="pie-chart" />
                                <p className={styles.formText}>{ele.name}</p>

                            </div>)
                    }
                    {
                        reportList.length <= 0 && <None></None>
                    }


                </div>
                <Pagination showQuickJumper pageSize={pageSize} current={reportPageInfo.pageIndex} total={reportPageInfo.totalCount} onChange={onChange} />
            </div>
        )
    }

}