import react from 'react';
import { Steps, Button, message, Row, Col } from 'antd';
import styles from './Create.less'
import StepOne from './Create/StepOne';
import StepTwo from './Create/StepTwo';
import StepThree from './Create/StepThree';
const Step = Steps.Step;
const steps = [{
    title: '选择应用类型',
    content: 'First-content',
}, {
    title: '基本信息',
    content: 'Second-content',
}, {
    title: '创建表单(报表)',
    content: 'Last-content',
}];
class StepItem extends react.Component {


    render() {
        const { index } = this.props
        console.log(index)
        if (index === 0) {
            return (
                <StepOne {...this.props} />
            )
        } else if (index === 1) {
            return (
                <div>
                    <StepTwo {...this.props} />
                </div>
            )
        } else {
            return (
                <div>
                    <StepThree {...this.props} />
                </div>
            )
        }

    }
}

export default class ApplicationCreate extends react.Component {
    constructor(props) {
        super(props);
        this.props.Init();

    }
    render() {

        const { current } = this.props;
        return (

            <div style={{
                width: '90%',
                margin: '30px auto 0'
            }}>
            {
               this.props. hasStep&&  <Steps current={current}>
                {steps.map(item => <Step key={item.title} title={item.title} />)}
            </Steps>
            }
          
               
                <div className="steps-content">
                    <StepItem index={current} {...this.props} />
                </div>
            </div>


        )

    }


}