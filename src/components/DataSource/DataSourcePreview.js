import React from 'react';
import { Input } from 'antd';
import { exportRuleCol, exportJsonData } from "../../utils/dynamicJson";
import styles from './DataSource.less';
const { TextArea } = Input;

class DataSourcePreview extends React.Component {
    constructor(props) {
        super(props);
        this.colList = [];
        this.state = {
            data: [],
        }
    }
    remarkOnChange = (e) => {
        this.props.remarkData(e.target.value)
    }
    interfaceTest(data) {
        let { url, methodType, params } = data;
        let _methodType = methodType === 0 ? "get" : "post";
        let paramsBody = {};
        let paramsForm = {};
        let paramsHeader = {};
        params.forEach(item => {
            for (let key in item) {
                switch (item.requestType) {
                    case 0:
                        {
                            paramsBody[item.key] = item.value;
                        }
                        break;
                    case 1:
                        {
                            paramsForm[item.key] = item.value;
                        }
                        break;
                    case 2:
                        {
                            paramsHeader[item.key] = item.value;
                        }
                        break;
                }
            }
        });
        this.props.requestData(url, _methodType, paramsBody, paramsForm, paramsHeader, "", "", "", "preview");
    }
    setData(sourceData, rule) {
        console.log('rule------',rule)
        let colList = exportRuleCol(rule);
        this.colList = colList;
        let exportData = exportJsonData(sourceData, rule);
        this.setState({ data: exportData });
    }
    componentDidMount() {
        const { sourceData, rule, previewData } = this.props;
        if (sourceData && !previewData) {
            this.setData(sourceData, rule);
        } else {
            this.interfaceTest(previewData);
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.sourceData && nextProps.previewData) {
            let { rule } = this.props.previewData;
            this.setData(nextProps.sourceData, JSON.parse(rule));
        }
    }
    render() {
        let { data } = this.state;
        const { remark, previewData, sourceData } = this.props;
        let height = previewData ? 260 : 420;
        if (data instanceof Array) data = data;
        else data = [data];
        return (
            <div className={styles.previewdata}>
                {!previewData ? <span>API预览</span> : null}
                <div className={styles.preview_table} style={{ maxHeight: document.body.clientHeight - height }}>
                    <table>
                        <thead>
                            <tr>
                                {this.colList.map((item, index) => {
                                    return <th key={index}>{item.description ? item.description : item.name}({item.text ? item.text : item.name})</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => {
                                return <tr key={index}>
                                    {this.colList.map((item, v) => {
                                        return <td key={v}>{row[item.key]}</td>
                                    })}
                                </tr>
                            })}
                        </tbody>
                    </table>
                </div>
                {!previewData ?
                    <div>
                        <span>备注</span>
                        <TextArea rows={4} defaultValue={remark} onChange={this.remarkOnChange} />
                    </div>
                    : null}
            </div>
        );
    }
}

export default DataSourcePreview;
