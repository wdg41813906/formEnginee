import React, { PropTypes, Layout } from 'react';
import { connect } from 'dva';
import { Card, Col, Row, Icon } from 'antd';
import styles from './FormList.less'
import com from '../../utils/com';
import WithHocRoute from '../../components/HOC/WithHocRoute'

function FormList(props) {
    let { formList, dispatch, history, match } = props;
    let { linkFormList } = formList;
    const toOtherLink = (title, id) => {
        let key = `dic`;
        if (id) {
            dispatch({
                type: "appMain/toOtherLink",
                payload: {
                    key,
                    id,
                    title,
                    history,
                    param: { type: 'modify' }
                }
            });
        } else {
            dispatch({
                type: "appMain/toOtherLink",
                payload: {
                    key,
                    id: com.Guid(),
                    title,
                    history,
                    param: { type: 'add' }
                }
            });
        }
    }
    return (
        <WithHocRoute authority={['1', '2', '3', '4', '5']} authSelf={'1'}>
            <div className={styles.content}>
                <Row>
                    <Col span={6}>
                        <Card
                            title='新增一个表单'
                            id=''
                            className={styles.card}
                            onClick={() => { toOtherLink('新表单') }}
                        >
                            <p className={styles.add}>
                                <Icon type="file-add" />
                            </p>
                        </Card>
                    </Col>
                    {
                        !linkFormList ? '出错了，其他表单已失联...' : linkFormList.map((e, i) => {
                            return (
                                <Col key={i} span={6}>
                                    <Card
                                        title={e.formTemplateName}
                                        id={e.id}
                                        onClick={() => { toOtherLink(e.formTemplateName, e.id) }}
                                        extra={<span>{e.createdTime || '2018-01-01'}</span>}
                                        className={styles.card}
                                    >
                                        <p>{e.desc || '描述描述描述。。。'}</p>
                                    </Card>
                                </Col>
                            )
                        })
                    }
                </Row>
            </div>
        </WithHocRoute>
    )
}

function mapStateToProps({ formList }) {
    return { formList }
}

export default connect(mapStateToProps)(FormList)
