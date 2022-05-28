import react from 'react';
import { Icon, Popover, Input, Pagination } from 'antd'
import styles from './../Detail.less'
import Content from './Content'
import None from './None'
const Search = Input.Search;
const formData = [1, 2, 3, 4, 5, 6, 7, 4, 7, 4, 5, 6, 3]

export default class FormList extends react.Component {

    render() {
        const { formList, formPageInfo, pageSize } = this.props
        const content = (
            <div>
                <p>复制</p>
                <p>删除</p>
            </div>
        );
        return (
            <div className={styles.powerWrap}>
                <div className={styles.formHeader}>
                    <div className={styles.powerTitle}>
                        <Search onChange={
                            e => {
                                this.props.SetData({ formKeyWord: e.target.value })
                            }
                        } style={{ width: 240 }} placeholder="请输入表单名称"
                            onSearch={value => this.props.GetTemplateListByAppIdPaged(1)} enterButton />
                    </div>
                    <p onClick={
                        e => {
                            this.props.ToAdd('form')
                        }
                    } className={styles.powerEdit}>新建表单<Icon type="diff" /></p>
                </div>
                <div className={styles.formContent}>
                    {
                        formList.map(ele =>
                            <div
                             onClick={e=>{this.props.GoForm(ele)}}
                             onMouseEnter={e=>{this.props.ItemOver(ele,'formList')}}
                                 onMouseLeave={e=>{this.props.ItemOut(ele,'formList')}}
                            key={ele.id} className={styles.formItem}>
                                {
                                    ele.hover&&<Popover content={<Content
                                     Copy={this.props.CopyForm}
                                     Remove={this.props.ApplicationTemplateRemove}
                                     item={ele} />}
                                     placement="bottom" >
                                    <div className={styles.toolIcon}> </div>
                                </Popover>
                                }
                                <Icon className={styles.formIcon} type="file-text" />
                                <p className={styles.formText}>{ele.name}</p>

                            </div>)
                    }
                    {
                        formList.length <= 0 && <None></None>
                    }

                </div>
                <Pagination showQuickJumper current={formPageInfo.pageIndex}
                    total={formPageInfo.totalCount} pageSize={pageSize} onChange={
                        this.props.GetTemplateListByAppIdPaged
                    } />
            </div>
        )
    }

}