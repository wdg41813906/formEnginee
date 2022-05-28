import React from 'react'
import {Modal, Button, Pagination, List, Radio} from 'antd';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class SelectDataSource extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                {
                    Object.keys(this.props.ChangeTable).length > 0 ?
                        < Modal
                            title="切换数据源"
                            visible={true}
                            onOk={this.props.onOk}
                            onCancel={this.props.onCancel}
                            maskClosable={false}
                        >
                            <RadioGroup style={{width: '100%'}} value={this.props.templateId}
                                        onChange={this.props.SelectListItem}>
                                {
                                    this.props.ChangeTable.formTable.map((item, index) => {
                                        return (
                                            <div key={index} style={{width: '100%'}}>
                                                <RadioButton style={{
                                                    width: '100%',
                                                    height: '42px',
                                                    lineHeight: '42px',
                                                    borderRadius: '0px',
                                                }} value={item.formTemplateId}>
                                                    {item.name}
                                                </RadioButton>
                                            </div>

                                        )
                                    })
                                }

                            </RadioGroup>


                            <Pagination
                                simple
                                onChange={(page) => {
                                    this.props.onChangetotal(page)
                                }}
                                defaultCurrent={1}
                                current={this.props.ChangeTable.pagination.pageIndex}
                                pageSize={8}
                                total={this.props.ChangeTable.pagination.totalCount}
                                style={{marginTop: '20px'}}
                            />
                        </Modal> : null
                }
            </div>
        )
    }
}

export default SelectDataSource

