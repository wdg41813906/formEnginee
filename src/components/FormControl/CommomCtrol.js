import styles from './Attribute.less'
import { Form } from 'antd';
import React from 'react';
import RENDERSTYLE from '../../enums/FormRenderStyle';

const FormItem = Form.Item;
function CommomCtrol() {
    return function (WrappedComponent) {
        return class extends React.Component {
            render() {
                const { index, getFieldDecorator, renderStyle, ...data } = this.props;
                let content = null;
                switch (renderStyle) {
                    case RENDERSTYLE.Design:
                        content = <WrappedComponent {...this.props} />;
                        break;
                    case RENDERSTYLE.PC:
                        content = <FormItem style={{ marginBottom: "0px", }}>
                            {getFieldDecorator(index, {
                                rules: [{
                                    required: data.Required,
                                    message: data.Text + "必填",
                                }],
                            })(
                                <WrappedComponent {...this.props} />
                            )};
                </FormItem>
                        break;
                    case RENDERSTYLE.Mobile:
                        break;
                }
                return (<div key={data.Id} className={styles.ControlWrapper}>
                    <div className={styles.ctrTitle}> <span>{data.Text}</span>
                        {data.Required ? <span className={styles.ctrTitReq}>*</span> : null}</div>
                    {data.Desc ? <div className={styles.ctrDesc}> <span>{data.Desc}</span></div> : null}
                    <div className={styles.ctrComponent}>
                        {content}
                    </div>
                    {renderStyle == RENDERSTYLE.Design ?
                        <div className={styles.Mask}>
                        </div> : null}
                </div>);
            }
        }
    }
}
export default CommomCtrol;