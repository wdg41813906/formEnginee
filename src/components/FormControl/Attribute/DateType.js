import React from "react";
import { Checkbox, Input, Button, Switch, Select } from "antd";
import Attribute from "./Attribute.js";
import com from "../../../utils/com";

@Attribute("类型")


class DateType extends React.Component {
    componentDidMount() {
    }
    
    constructor(props) {
        super(props);
        this.SetDateType = this.SetDateType.bind(this);
    }
    
    FormatType = (type) => {
        switch (type) {
            case "Date":
                return {
                    dateFormat: "YYYY-MM-DD",
                    showTime: ""
                };
            case "DateTime":
                return {
                    dateFormat: "YYYY-MM-DD HH:mm:ss",
                    showTime: "HH:mm:ss"
                };
            case "timehm":
                return {
                    dateFormat: "YYYY-MM-DD HH:mm",
                    showTime: "HH:mm"
                };
            // case "week":
            // case "month":
            // case "quarter":
            // case "year":
            //     return {
            //         dateFormat: null,
            //         showTime: null
            //     };
            
        }
    };
    
    SetDateType(type) {
        this.props.onChange({
            DateType: type,
            dateFormat: this.FormatType(type).dateFormat,
            showTime: this.FormatType(type).showTime
        });
    }
    
    render() {
        let { DateType } = this.props;
        return (<div>
            <Select value={DateType} style={{ width: "100%" }} onChange={e => this.SetDateType(e)}>
                <Select.Option value="Date">日期</Select.Option>
                <Select.Option value="timehm">日期时间(时分)</Select.Option>
                <Select.Option value="DateTime">日期时间(时分秒)</Select.Option>
                {/*<Select.Option value="week">选择周</Select.Option>*/}
                {/*<Select.Option value="month">选择月份</Select.Option>*/}
                {/*<Select.Option value="quarter">选择季度</Select.Option>*/}
                {/*<Select.Option value="year">选择年份</Select.Option>*/}
            </Select>
        </div>);
        
    }
}

// export default DateType;
export default {
    Component: DateType,
    getProps: (props) => {
        let { DateType, onChange } = props;
        return { DateType, onChange };
    }
};
