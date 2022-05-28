import react from 'react';
import BaseImmutableComponent from '../../../../components/BaseImmutableComponent'
import { Checkbox, Row } from 'antd';
import { is } from 'immutable';

export default class SearchLeft extends react.Component {
    shouldComponentUpdate(nextProps, nextState) {

        const thisProps = this.props || {};
        const thisState = this.state || {};
        nextState = nextState || {};
        nextProps = nextProps || {};

        if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
            Object.keys(thisState).length !== Object.keys(nextState).length) {
            return true;
        }
         if(nextProps.reportList.length===0){
             return true;
         }
        for (const key in nextProps.reportList) {
            if (!is(thisProps.reportList[key], nextProps.reportList[key])) {
                return true;
            }
        }
        if (!is(thisProps.reportCheckedValues, nextProps.reportCheckedValues)) {
            return true;
        }

        for (const key in nextState) {
            if (!is(thisState.reportList[key], nextState.reportList[key])) {
                return true;
            }
        }
        return false;
    }
    render() {
        return (
            <Checkbox.Group style={{ width: '100%' }}
                value={this.props.reportCheckedValues.toJS()}
                onChange={ele => this.props.ReportItemSelect(ele)}>
                {

                    this.props.reportList.map(item => {

                        var element = item.toJS();
                        return( <Row span={8} key={element.id}>
                            <Checkbox disabled={element.disabled}

                            value={element.id}>{element.title}</Checkbox>
                        </Row>
                    )

                    }
                    )
                }


            </Checkbox.Group>
        )
    }
}
