import React, { PropTypes } from 'react'
import { Form, Input, Button, Select } from 'antd';
import styles from './Search.less';
const UserSearch = ({
    field,
    keyword,
    OnSearch,
    OnAdd,
    form: {
        getFieldDecorator,
        validateFields,
        getFieldsValue
    }
}) => {
    function handleSubmit(e) {
        e.preventDefault();


        validateFields((errors) => {
            //debugger
            if (!!errors) {
                return;
            }
            OnSearch(getFieldsValue())
        })
    }
    return (
        <div className={styles.normal}>

            <div className={styles.search}>
                <Form layout="inline" onSubmit={handleSubmit}>

                    <Form.Item>
                        {
                            getFieldDecorator('keyword', {
                                initialValue: keyword || '',

                            })
                                (
                                <Input type="text" />
                                )
                        }
                    </Form.Item>
                    <Button style={{ marginRight: '10px' ,marginTop:3}} type="primary" htmlType="submit">搜索</Button>
                    <Button type="primary " ghost={true} onClick={OnAdd}>添加</Button>
                </Form>

            </div>
            {/*<div className={styles.add}>*/}
               {/**/}

            {/*</div>*/}
        </div>
    )
}

// UserSearch.propTypes = {
//     onSearch: PropTypes.func,
//     onAdd: PropTypes.func,
//     onTest: PropTypes.func,
//     form: PropTypes.object.isRequired,

// }
export default Form.create()(UserSearch);
