import React, { PropTypes } from 'react'
import { Form, Input, Button, Select } from 'antd';
import styles from './Search.less';

const AppCateGorySearch = ({
    field,
    keyword,
    OnSearch,
    Setkeyword,
    OnAdd,
    form: {
        getFieldDecorator,
		validateFields,
		getFieldsValue
    }
}) => {
    function handleSubmit(e) {
            e.preventDefault();
    	//debugger
        
    	validateFields((errors)=>{
            //debugger
    		if(!!errors){
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
                           getFieldDecorator('keyWords',{
                               initialValue:keyword||'',
                               rules:[]
                           })
                           (
                                <Input type="text"  onChange={
                                    e=>{
                                       Setkeyword(e.target.value)
                                    }
                                }
                                
                                />
                           )
                       }
                    </Form.Item>
                    <Button style={{ marginRight: '10px' }} type="primary" htmlType="submit">搜索</Button>
                </Form>

             </div>   
              <div className>
                <Button type="primary " ghost={true} onClick={OnAdd}>添加</Button>
               
              </div>
       </div>
       )
}


export default Form.create()(AppCateGorySearch);