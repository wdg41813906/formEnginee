import React, { Component, useCallback } from 'react';
import { Input, Select, Tag } from 'antd';
import Attribute from './Attribute.js'
import FORM_CONTROL_TYPE from '../../../enums/FormControlType.js';

const styles = {
    area: {
        display: "flex",
        alignItems: "center",
        marginBottom: "10px"
    },
    areaName: {
        width: "30%",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        overflow: "hidden"
    },
    areaContent: {
        width: "70%"
    }
}
const LanSelect = (props) => {
    const setLang = useCallback((value, option) => {
        props.setLang(value);
    }, [props.onChange]);
    return Array.isArray(config.langList) && config.langList.length > 0 ? <Select value={props.value || 'zhcn'} onChange={setLang}>
        {
            config.langList.map(a => <Select.Option key={a.key} value={a.key}>
                {a.name}
            </Select.Option>)
        }
    </Select> : null;
}
@Attribute('标题', true)
class TitleCom extends React.PureComponent {
    constructor(props) {
        super(props);
        let currentLang = config.defaultLang || 'zhcn';
        let lang = props.lang || { zhcn: props.name };
        for (let key in lang) {
            if (props.name === lang[key]) {
                currentLang = key;
                break;
            }
        }
        this.state = {
            lang,
            currentLang
        }
    }
    setLang = (currentLang) => {
        this.setState({ currentLang });
        this.props.onChange({ name: this.state.lang[currentLang] || '' });
    }
    onChange = ({ target: { value } }) => {
        if (this.props.formControlType === FORM_CONTROL_TYPE.Group) {
            this.props.setGroupName(value);
        }
        else {
            this.props.onChange({ name: value });
        }
        let lang = this.state.lang;
        lang = { ...lang, [this.state.currentLang]: value };
        this.setState({ lang });
        this.props.setLangValue(this.state.currentLang, value)
    }
    render() {
        let { name, externalName, typeName, isExternal } = this.props;
        return (
            <React.Fragment>
                <Tag color="blue" style={{ positsion: 'absolute', top: '12px', right: '0', marginRight: '0' }}>{typeName}</Tag>
                {isExternal === true ?
                    <Input addonAfter={<LanSelect setLang={this.setLang} value={this.state.currentLang} />} value={externalName !== undefined ? externalName : name} onChange={e => this.props.onChange({ externalName: e.target.value })} style={{ marginTop: 6 }} />
                    : <Input addonAfter={<LanSelect setLang={this.setLang} value={this.state.currentLang} />} value={name} onChange={this.onChange} style={{ marginTop: 6 }} />}
            </React.Fragment>);
    }
}

@Attribute("表头对齐方式")
class HeaderAlign extends React.Component {
    constructor(props) {
        super(props);
        this.SetHeaderAlign = this.SetHeaderAlign.bind(this);
    }
    SetHeaderAlign(headerAlign) {
        this.props.onChange({ headerAlign });
    }
    render() {
        let { headerAlign } = this.props;
        headerAlign = headerAlign || 'center';
        return <Select style={{ width: "100%" }} value={headerAlign} onChange={this.SetHeaderAlign}>
            <Select.Option value="left">左对齐</Select.Option>
            <Select.Option value="center">居中</Select.Option>
            <Select.Option value="right">右对齐</Select.Option>
        </Select>;
    }
}

// 如果是子表 需要 用到的 字段 汇总方式 属性
@Attribute("子表字段", false)
class GatherType extends Component {
    render() {
        const { valueType, subformFieldGatherType } = this.props;
        const gatherTypeList = [
            { name: "无", type: "0" },
            { name: "计数", type: "5" }
        ];
        if (valueType === "number") {
            Array.prototype.push.apply(gatherTypeList, [
                { name: "求和", type: "1" },
                { name: "平均", type: "2" },
                { name: "最大值", type: "3" },
                { name: "最小值", type: "4" },
            ])
        }
        return (
            <div style={styles.area}>
                <div style={styles.areaName}>汇总方式：</div>
                <Select getPopupContainer={() => document.getElementById('KJSX')} style={styles.areaContent} value={subformFieldGatherType} onChange={e => { this.props.onChange({ subformFieldGatherType: e }) }}>
                    {
                        gatherTypeList.map(item => (
                            <Select.Option key={item["type"]} value={item["type"]} title={item.name}>{item["name"]}</Select.Option>
                        ))

                    }
                </Select>
            </div>
        );
    }
}
// 组合组件
class Title extends React.PureComponent {
    render() {
        let { valueType, subFormField, subformFieldGatherType, onChange, externalName, name, typeName,
            isExternal, setGroupName, formControlType, headerAlign, setLangValue, lang } = this.props;
        return <React.Fragment>
            <TitleCom key='title' name={name} externalName={externalName} typeName={typeName} onChange={onChange} isExternal={isExternal}
                setLangValue={setLangValue} lang={lang} setGroupName={setGroupName} formControlType={formControlType} />
            {
                subFormField ?
                    <HeaderAlign onChange={onChange} headerAlign={headerAlign} /> :
                    null
            }
            {
                subFormField && formControlType === FORM_CONTROL_TYPE.Item ?
                    <GatherType key="type" valueType={valueType} subformFieldGatherType={subformFieldGatherType} onChange={onChange} />
                    : null
            }
        </React.Fragment>;
        //,<ExternalForm key='exForm' />];
    }
}
export default {
    Component: Title,
    getProps: (props) => {
        let { valueType, subformFieldGatherType, onChange, externalName, name, subFormField, typeName, isExternal, setGroupName, formControlType, headerAlign, setLangValue, lang } = props;
        return { valueType, subformFieldGatherType, onChange, externalName, name, subFormField, typeName, isExternal, setGroupName, formControlType, headerAlign, setLangValue, lang };
    }
};
