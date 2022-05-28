
import react from 'react';
import styles from './StringSelect.less'
import { Input, Icon, Checkbox, Row } from 'antd';
import DashboardHOC from './DashboardHOC'
import BaseItem from './BaseItem'
import { is } from 'immutable';

@DashboardHOC()
export default class StringSelect extends BaseItem {


    render() {

        const { item } = this.props;
        const { config } = item;
        const { style } = config;
        var defalutValues = item.searchData.itemField.defalutValues;
        var searchValue="";
        if (defalutValues) {
            for (var i = 0; i < defalutValues.length; i++) {
                if (!searchValue) {
                    searchValue += defalutValues[i];
                } else {
                    searchValue = searchValue+","+defalutValues[i];
                }
            }
        }
        return (<div style={{ height: 33 }}>
            <div style={{
                height: 30, width: '97%',
                lineHeight: '30px',
                paddingLeft:10,
                color: style.textFill,
                fontSize: style.textFontSize,
                fontFamily: style.textFontFamily,
                fontWeight: style.textFontWeight ? 'bold' : 'normal', // 文本粗细
                fontStyle: style.textItalic ? 'italic' : 'normal',//斜体
            }} className={styles.input}
                onClick={
                    e => {
                        e.stopPropagation()

                        //e.target.parentElement.parentElement.parentElement.parentElement.parentElement
                        var pannle = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.style;

                        var transform = pannle.transform;
                        var width = pannle.width;
                        var array = transform.replace(/[^0-9\-,]/g, '').split(',');
                        this.props.StringSelectToggle(true)
                        this.props.StringSelectPositionChange({
                            left: Number(array[0]),
                            top: Number(array[1]) + 61,
                            width: width

                        })
                        this.props.StringSelectFn(item, false);

                        this.props.SearchText({
                            pageIndex: 1,
                            pageSize: 6,
                            searchKey: "",

                            tableName: item.searchData.currentReportList[0].table,
                            fieldName: item.searchData.currentField.code,
                            GroupField:item.searchData.currentField.primaryKey,
                            formType:item.searchData.currentField.formType
                        })
                    }

                }>
                   {searchValue}
                <Icon className={styles.icon} type="down" theme="outlined" />
            </div>



        </div>)
    }
}
