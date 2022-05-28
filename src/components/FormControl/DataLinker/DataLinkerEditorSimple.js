import React from 'react'
import styles from './DataLinkerEditor.less'
import { Row, Col, Select, Input, Spin } from 'antd';
import { connect } from 'dva';
import com from '../../../utils/com.js'



/**
 *
 * @param {*} data 根据传入的id返回对应的选项value
 * @param {*} id
 */
function getSelected(data, id) {
    // { name: "单选2", type: "SingleRadio", id: "889097b9-9b6d-07aa-772d-c70542f30145" },
    let select = data.filter((e, i) => {
        return e.id == id
    })
    return JSON.stringify({
        type: select[0].type,
        id: select[0].id,
        name: select[0].name
    })
}

const Option = Select.Option;
//下拉选框
/**
 *
 * data 数据
 * css 样式
 * num 操作编号
 * hangleChange change事件
 */
const Choose = (props) => {
    let { data, css, handleChange, num, selected } = props;
    Array.isArray(data) && data.length > 0 && data.map((e, i) => {
        e.value = JSON.stringify({
            type: e.type,
            id: e.id,
            name: e.name
        })
    })
    let Options = !Array.isArray(data) || data.length == 0 ? null : data.map((e, i) => {
        return (
            <Option value={e.value} key={e.id} title={a.name}>{e.name}</Option>
        )
    })

    return (
        <Select
            // disabled={data && data.length > 0 ? false : true}
            showSearch
            style={css}
            placeholder="请选择"
            optionFilterProp="children"
            maxTagCount={4}
            onChange={(e) => { handleChange(e, num) }}
            value={selected}
            // onFocus={this.handleFocus}
            // onBlur={this.handleBlur}
            // onSelect={(value, option) => { console.log(value, option) }}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
            {Options}
        </Select>
    )
}

class DataLinkerEditorSimple extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: this.props.dataLinker ? true : false,
            Data1: this.props.linkFormList,
            Data3: this.props.linkFormDetail.map((e, i) => { return { name: e.name, type: e.controlType, id: e.id } }),
            Data4: this.props.self,
            DataBack: null,
            selected: {
                1: null,
                2: null,
                3: null,
                4: null,
                5: null,
            },
            FormForeignKey: {
                FormId: this.props.dataLinker ? this.props.dataLinker.FormId : '',//当前表表单Id
                FormName: this.props.dataLinker ? this.props.dataLinker.FormName : '',
                FormVersionHistoryId: this.props.dataLinker ? this.props.dataLinker.FormVersionHistoryId : '',//表单版本历史Id
                CurrentColumnName: this.props.dataLinker ? this.props.dataLinker.CurrentColumnName : '',
                ForeignFormId: this.props.dataLinker ? this.props.dataLinker.ForeignFormId : '',//外键表单Id
                ForeignFormName: this.props.dataLinker ? this.props.dataLinker.ForeignFormName : '',
                ForeignHistoryId: this.props.dataLinker ? this.props.dataLinker.ForeignHistoryId : '',//外键表单版本历史Id
                ForeignColumnName: this.props.dataLinker ? this.props.dataLinker.ForeignColumnName : '',
                DisplayVersionHistoryId: this.props.dataLinker ? this.props.dataLinker.DisplayVersionHistoryId : '',//显示字段Id
                DisplayName: this.props.dataLinker ? this.props.dataLinker.DisplayName : '',
                Description: this.props.self.id,
                Id: this.props.dataLinker.Id ? this.props.dataLinker.Id : com.Guid(),
                source: this.props.dataLinker ? this.props.dataLinker.source : '',//关联表的code
                field_relat: this.props.dataLinker ? this.props.dataLinker.field_relat : '',//关联字段的code
                field_show: this.props.dataLinker ? this.props.dataLinker.field_show : '',//显示字段的code
                formType_relat: this.props.dataLinker ? this.props.dataLinker.formType_relat : '',//关联字段的formType
                formType_show: this.props.dataLinker ? this.props.dataLinker.formType_show : '',//显示字段的formType
                primaryKey_relat: this.props.dataLinker ? this.props.dataLinker.primaryKey_relat : '',//关联字段的primaryKey
                primaryKey_show: this.props.dataLinker ? this.props.dataLinker.primaryKey_show : '',//显示字段的primaryKey
            }
        }
        this.handleChange = this.handleChange.bind(this);
    }
    // static getDerivedStateFromProps(nextProps, prevState) {//props变化，是否变化state,
    //     let returnObj = {};
    //     debugger

    //     if (nextProps.self !== prevState.Data4) {
    //         returnObj.Data4 = nextProps.self
    //     }
    //     if (nextProps.linkFormList !== prevState.Data1) {
    //         returnObj.Data1 = nextProps.linkFormList
    //     }
    //     if (nextProps.linkFormDetail !== prevState.Data3) {
    //         returnObj.Data3 = nextProps.linkFormDetail.map((e, i) => {
    //             return {
    //                 name: e.name,
    //                 type: e.controlType,
    //                 id: e.id,
    //             }
    //         })
    //     }
    //     if (nextProps.dataLinker && JSON.stringify(nextProps.dataLinker) !== JSON.stringify(prevState.FormForeignKey)) {
    //         let { ForeignFormId, FormVersionHistoryId, ForeignHistoryId, DisplayVersionHistoryId } = nextProps.dataLinker;

    //         returnObj.FormForeignKey = nextProps.dataLinker
    //         returnObj.selected = {
    //             1: getSelected(nextProps.linkFormList, ForeignFormId),
    //             // 2: getSelected(this.state.Data2, FormVersionHistoryId),
    //             3: getSelected(nextProps.linkFormDetail.map((e, i) => {
    //                 return { name: e.name, type: e.controlType, id: e.id, }
    //             }), ForeignHistoryId),
    //             // 4: null,
    //             // 5: getSelected(this.state.Data5, DisplayVersionHistoryId),
    //         }
    //     }

    //     return JSON.stringify(returnObj) == '{}' ? false : returnObj
    // }
    static getDerivedStateFromProps(nextProps, prevState) {//props变化，是否变化state,
        let returnObj = {};
        if (nextProps.linkFormDetail && nextProps.linkFormDetail.length > 0 && nextProps.linkFormDetail !== prevState.Data3) {
            let DataBack = nextProps.linkFormDetail.map((e, i) => {
                return { name: e.name, type: e.controlType, id: e.id }
            })

            if (prevState.FormForeignKey.FormVersionHistoryId) {
                let Data3 = DataBack.filter((e, i) => {
                    let Data2Select = nextProps.currentFormData.find((ee, ii) => {
                        return ee.id = prevState.FormForeignKey.FormVersionHistoryId
                    })
                    return e.type == Data2Select.type;
                })
                let Data5 = DataBack.filter((e, i) => { return e.type == nextProps.self.type });
                returnObj.Data3 = Data3;
                returnObj.Data5 = Data5;
            } else {
                returnObj.Data3 = DataBack;
                returnObj.Data5 = DataBack;
            }
        }
        return JSON.stringify(returnObj) == '{}' ? false : returnObj
    }
    handleChange(value, num) {
        let { FormForeignKey, selected } = this.state;
        let valueObj = JSON.parse(value);
        switch (num) {
            case 1:
                // const DataBack = [
                //     { name: "单选2", type: "SingleRadio", id: "889097b9-9b6d-07aa-772d-c70542f30145" },
                // ];
                this.props.getLinkFormLDetail(valueObj.id)
                FormForeignKey.ForeignFormId = valueObj.id;
                FormForeignKey.ForeignFormName = valueObj.name;
                FormForeignKey.FormId = this.props.self.FormId;
                FormForeignKey.FormName = this.props.self.FormName;
                FormForeignKey.source = this.props.linkFormList.find(e => e.id == valueObj.id).code;
                this.setState({ FormForeignKey })
                break
            // case 2:
            //     let { type, id } = JSON.parse(value);
            //     let DataBack = this.props.linkFormDetail.map((e, i) => {
            //         return {
            //             name: e.name,
            //             type: e.controlType,
            //             id: e.id,
            //         }
            //     })
            //     let Data3 = DataBack.filter((e, i) => { return e.type == type })
            //     let Data5 = DataBack.filter((e, i) => { return e.type == this.state.Data4.type });

            //     FormForeignKey.FormVersionHistoryId = JSON.parse(value).id;
            //     FormForeignKey.CurrentColumnName = JSON.parse(value).name;
            //     this.setState({ Data3, Data5, FormForeignKey })
            //     break
            case 3:
                FormForeignKey.ForeignHistoryId = valueObj.id;
                FormForeignKey.ForeignColumnName = valueObj.name;
                let item = this.props.linkFormDetail.find(e => e.id == valueObj.id);
                FormForeignKey.field_relat = item.code;
                FormForeignKey.formType_relat = item.formType;
                FormForeignKey.primaryKey_relat = item.primaryKey;

                this.setState({ FormForeignKey })
                this.props.setFormForeignKey(FormForeignKey)
                break
            // case 4:
            //     FormForeignKey.Description = JSON.parse(value).id;
            //     this.setState({ FormForeignKey })
            //     break
            // case 5:
            //     FormForeignKey.DisplayVersionHistoryId = JSON.parse(value).id;
            //     FormForeignKey.DisplayName = JSON.parse(value).name;
            //     this.setState({ FormForeignKey })
            //     this.props.setFormForeignKey(FormForeignKey)
            //     break
        }
        selected[num] = value;
        this.setState({ selected })
    }
    render() {
        const { linkFormDetail } = this.props;
        const { Data1, Data2, Data3, Data4, Data5, DataBack, selected, FormForeignKey } = this.state;
        const { ForeignFormId, FormVersionHistoryId, ForeignHistoryId, DisplayVersionHistoryId } = FormForeignKey;
        return (
            // <Spin spinning={this.state.loading}>
            <div className={styles.content}>
                <Row className={styles.part}>
                    <Col className={styles.part_title} span={24}>关联表单</Col>
                    <Col className={styles.part_body} span={24}>
                        <Choose data={Data1} num={1} selected={ForeignFormId ? getSelected(Data1, ForeignFormId) : undefined} handleChange={this.handleChange} css={{ width: '95%', marginRight: 5 }} />
                    </Col>
                </Row>
                <Row className={styles.part}>
                    <Col className={styles.part_title} span={24}>关联字段</Col>
                    <Col className={styles.part_body} span={24}>
                        <Choose data={Data3} num={3} selected={linkFormDetail.length > 0 && ForeignHistoryId ? getSelected(Data3, ForeignHistoryId) : undefined} handleChange={this.handleChange} css={{ width: '70%', marginRight: 5 }} />
                    </Col>
                </Row>
            </div>
            // </Spin>
        )
    }
}

function mapStateToProps(state, ownProps) {
    // debugger
    let { formTemplateVersionId } = ownProps;
    let linkFormDetail = state.formBuilder.all[formTemplateVersionId].get('linkFormDetail');
    return {
        linkFormList: state.formBuilder.linkFormList,
        linkFormDetail
    }
}
export default connect(mapStateToProps)(DataLinkerEditorSimple)
