import React, { PropTypes } from 'react';
import {Form,Input,Modal} from 'antd';
const FormItem=Form.Item;
const formItemLayout={
	labelCol:{
		span:6,
	},
	wrapperCol:{
		span:14,
	}
}
const AppCateGoryModal=({
	visible,
	item={},
	onOk,
	onCancel,
	form:{
    getFieldDecorator,
    validateFields,
    getFieldsValue,
	},
})=>{

function handelOk(){
	//debugger
	validateFields((errors)=>{
		if(errors){
			return;
		}
		const data={...getFieldsValue(),Id:item.Id}
		onOk(data);
	})
}
function checkNumber(rule,value,callback){
	if(!value){
		callback(new Error('年龄未填写'));
	} 
	else if (!/^[\d]{1,2}$/.test(value)) {
      callback(new Error('年龄不合法'));
    } else {
      callback();
    }
}
const modalOpts={
	title:'应用类型',
	visible,
	onOk:handelOk,
	onCancel,
}

	return (
    <Modal {...modalOpts}>
          <Form horizontal>
              <FormItem 
                 label="名称:"
                 hasFeedback
                 {...formItemLayout}
              >
              {getFieldDecorator('Name',{
              		initialValue:item.name,
              		rules:[
              		{required:true,message:'名称未填写'},
              		],
              	})(
                  <Input maxLength="32" type='text' />
              	)}
              </FormItem>
            
          </Form>
    </Modal>
		)
}

export default Form.create()(AppCateGoryModal);