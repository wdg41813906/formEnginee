import { Component } from "react"
import { Modal, Input, Radio, Select, Icon, Upload, Form } from "antd"
import styles from "./AddMember.less"
import { List, Map, is } from "immutable"
import { Guid } from "../../../utils/com"
import { accountIsRepeat } from "../../../services/BookAddress/BookAddress"

const RadioGroup = Radio.Group;
const Option = Select.Option;
const FormItem = Form.Item;

// 删除 对应的部门
function changePartArr(selectedPartKeys, key) {
    let tempArr = List(selectedPartKeys).toJS();
    for (let i = 0; i < tempArr.length; i++) {
        let item = tempArr[i];
        if (item.key === key) {
            tempArr.splice(i, 1);
            break;
        }
    }
    return tempArr;
}
// 处理 selectedPartKeys为 selectedKeys
export function dealSelectedPartKeys(selectedPartKeys) {
    let tempArr = [];
    selectedPartKeys.forEach(v => {
        tempArr.push(v.key);
    });
    return tempArr;
}
// 统一化 管理 输入框的 组件
function inputConfig({ name, placeholder, isRequired }) {
    return {
        name,
        value: "",
        placeholder,
        isRequired,
        help: "",
        validateStatus: "",
    }
}
function GenerateInput({ placeholder, isRequired, ...specialObj }) {
    let itemObj = inputConfig({ placeholder, isRequired });
    itemObj["id"] = Guid();
    return {
        ...itemObj,
        ...specialObj,
        inputCom: function (props) {
            return (
                <FormItem className={styles.input} style={specialObj.style} help={props.help} validateStatus={props.validateStatus}>
                    <Input className={styles.input} style={specialObj.style} value={props.value} placeholder={itemObj.placeholder} readOnly={props.readOnly} onBlur={(e) => { props.blur && props.blur(e); }} onChange={(e) => { props.changeValue(e.target.value, props.id); }} />
                </FormItem>
            )
        }
    }
}
// 生成 inputData 的 数据
function generateInputData(editOrAdd, memDetailData) {
    console.log(memDetailData);
    let tempData = {
        name: GenerateInput({ name: "姓名", placeholder: "姓名", isRequired: true, style: { marginBottom: "10px" } }),
        anotherName: GenerateInput({ name: "别名", placeholder: "别名", isRequired: false }),
        account: GenerateInput({ name: "账号", placeholder: "成员唯一标识，设定以后不支持修改", isRequired: true }),
        tel: GenerateInput({ name: "手机", placeholder: "成员通过验证手机后可加入企业", isRequired: true, style: { width: "300px" } }),
        phone: GenerateInput({ name: "座机", placeholder: "", isRequired: false }),
        position: GenerateInput({ name: "职位", placeholder: "", isRequired: false }),
        email: GenerateInput({ name: "邮箱", placeholder: "", isRequired: true }),
        address: GenerateInput({ name: "地址", placeholder: "", isRequired: false }),
        // areaAccount: GenerateInput({ name: "域账号", placeholder: "", isRequired: false }),
        englishName: GenerateInput({ name: "英文名", placeholder: "", isRequired: false }),
    };
    let tempDealObj = {};
    tempDealObj.name = memDetailData.name;
    tempDealObj.anotherName = memDetailData.name;
    tempDealObj.account = memDetailData.userId;
    tempDealObj.tel = memDetailData.mobile;
    tempDealObj.position = memDetailData.position;
    tempDealObj.email = memDetailData.email;
    tempDealObj.address = memDetailData.workPlace;
    tempDealObj.englishName = memDetailData.englishName;
    tempDealObj.phone = memDetailData.telephone;
    if (editOrAdd === 1) {
        Object.keys(tempDealObj).forEach(v => {
            tempData[v]["value"] = tempDealObj[v];
        });
    }
    return tempData;
}


class AddMember extends Component {
    constructor(props) {
        super(props);
        let { editOrAdd, memDetailData } = props;
        this.state = {
            inputData: generateInputData(editOrAdd, memDetailData),
            gender: editOrAdd === 1 ? memDetailData.gender : 1,
        }
        this.validateItems = this.validateItems.bind(this);
    }
    changeValue(value, id) {
        let tempInputData = this.state.inputData;
        Object.keys(tempInputData).forEach(v => {
            if (tempInputData[v]["id"] === id) {
                tempInputData[v]["value"] = value;
            }
        });
        this.setState({
            inputData: tempInputData
        });
    }
    // 判断唯一性
    _isRepeat(keyWord, callBack) {
        let me = this;
        accountIsRepeat({ Jobnumber: keyWord }).then(res => {
            // console.log(res);
            callBack.call(me, res.data);
        }, err => {
            console.log(err);
        });
    }
    // 验证 账号的 唯一性
    validateAccount(value) {
        if (!this.state.inputData.account.value || this.props.editOrAdd === 1) return;
        let tempInputData = Map(this.state.inputData).toJS();
        let callBack = (boolean) => {
            if (boolean) {
                tempInputData.account.help = "";
                tempInputData.account.validateStatus = "";
            } else {
                tempInputData.account.help = "此账已存在了";
                tempInputData.account.validateStatus = "error";
            }
            this.setState({
                inputData: tempInputData
            });
        }
        this._isRepeat(this.state.inputData.account.value, callBack);
    }
    // 处理 保存的数据
    _dealSaveData() {
        let tempData = Map(this.state.inputData).toJS();
        let paramsObj = {}, depList = [];
        this.props.selectedPartKeys.forEach(v => {
            depList.push(v["key"]);
        });
        paramsObj.Name = tempData.name.value;
        paramsObj.Jobnumber = tempData.account.value;
        paramsObj.UserId = tempData.account.value;
        paramsObj.Id = this.props.editOrAdd === 0 ? Guid() : this.props.memDetailData.id;
        paramsObj.Name = tempData.name.value;
        paramsObj.Position = tempData.position.value;
        paramsObj.Mobile = tempData.tel.value;
        paramsObj.Telephone = tempData.phone.value;
        paramsObj.Email = tempData.email.value;
        paramsObj.EnglishName = tempData.englishName.value;
        paramsObj.WorkPlace = tempData.address.value;
        paramsObj.OrganizationIds = depList;
        paramsObj.Gender = this.state.gender;
        return paramsObj;
    }
    // 保存并继续添加
    saveAndAdd() {
        if(!this.validateItems())return;
        let resultObj = this._dealSaveData(), { cacheInitSelectedPartKeys } = this.props;
        this.props.newMem(resultObj, false);
        // 初始化所有数据
        let tempData = Map(this.state.inputData).toJS(), tempKey = Object.keys(tempData);
        tempKey.forEach(v => {
            tempData[v]["value"] = "";
        });
        this.setState({
            inputData: tempData,
            selectedPartKeys: [cacheInitSelectedPartKeys]
        });
    }
    /* 对于 对应的 项 进行 提交验证 */
    validateItems() {
        const { inputData } = this.state;
        Object.keys(inputData).forEach(item => {
            if (inputData[item]["isRequired"]) {
                inputData[item]["help"] = "";
                inputData[item]["validateStatus"] = "";
            }
        });
        if (!inputData.name.value) {
            inputData.name.help = "姓名必填";
            inputData.name.validateStatus = "error";
            this.setState({ inputData });
            return false;
        }
        if (!inputData.account.value) {
            inputData.account.help = "账号必填";
            inputData.account.validateStatus = "error";
            this.setState({ inputData });
            return false;
        }
        if (!(inputData.tel.value && /^1\d{10}$/.test(inputData.tel.value))) {
            if (!(inputData.email.value && /^[\S\s]+@[\S\s]+$/.test(inputData.email.value))) {
                inputData.tel.help = "请填写正确的手机号";
                inputData.tel.validateStatus = "error";
                this.setState({ inputData });
                return false;
            }
            return true;
        }
        return true;
    }
    // 只是保存
    onlySave() {
        if(!this.validateItems())return;
        let resultObj = this._dealSaveData();
        console.log(resultObj);
        this.props.editOrAdd === 0 ?this.props.newMem(resultObj, true):this.props.confirmSaveMem(resultObj,this.props.memDetailData.id);
    }
    // 改变 性别
    changeGender(gender) {
        this.setState({ gender });
    }
    render() {
        let { selectedPartKeys, operSelectedModal, showAddMemModal, operAddMemModal, changePart, editOrAdd } = this.props;
        let { inputData: InputData, gender } = this.state;
        console.log(InputData);
        // let selectedKeys = dealSelectedPartKeys(selectedPartKeys);
        let extraInputArr = ["phone", "position", "email", "address", "englishName"], changeValue = this.changeValue.bind(this);
        return (
            <Modal
                title="添加成员"
                visible={showAddMemModal}
                footer={null}
                centered={true}
                destroyOnClose={true}
                onCancel={() => { operAddMemModal(false); }}
                width={800}
                maskClosable={false}
            >
                <div className={styles.btns}>
                    {editOrAdd === 0 ? <div className={styles.specialItem} onClick={() => {
                        this.saveAndAdd();
                    }}>保存并继续添加</div> : ""}
                    <div className={editOrAdd === 1 ? styles.specialItem : ""} onClick={() => { this.onlySave(); }}>保存</div>
                    <div onClick={() => { operAddMemModal(false); }}>取消</div>
                </div>
                <div className={styles.editSpecial}>
                    <div className={styles.avator}>
                        <Upload className={styles.uploadUser}
                            showUploadList={false}
                            accept="image/*"
                            onChange={(e) => { console.log(e); }}
                        >
                            <Icon className={styles.userIcon} type="user" theme="outlined" />
                        </Upload>
                    </div>
                    <div className={styles.editContent}>
                        {
                            <InputData.name.inputCom changeValue={changeValue} id={InputData.name.id} value={InputData.name.value} help={InputData.name.help} validateStatus={InputData.name.validateStatus} />
                        }
                        <br />
                        {
                            <InputData.anotherName.inputCom value={InputData.anotherName.value} changeValue={changeValue} id={InputData.anotherName.id} />
                        }
                    </div>
                </div>
                <div className={styles.generalItem}>
                    <div className={styles.itemLeft}>
                        账号 :
                </div>
                    <div className={styles.itemRight}>
                        {
                            <InputData.account.inputCom readOnly={editOrAdd === 1 ? true : false} changeValue={changeValue} value={InputData.account.value} id={InputData.account.id} blur={(e) => { this.validateAccount(e.target.value); }} help={InputData.account.help} validateStatus={InputData.account.validateStatus} />
                        }
                    </div>
                </div>
                <div className={styles.generalItem + " " + styles.bottomBorder}>
                    <div className={styles.itemLeft}>
                        性别 :
                </div>
                    <div className={styles.itemRight}>
                        <RadioGroup value={gender} onChange={(e) => { this.changeGender(e.target.value); }}>
                            <Radio value={0}>保密</Radio>
                            <Radio value={1}>男</Radio>
                            <Radio value={2}>女</Radio>
                        </RadioGroup>
                    </div>
                </div>
                <div className={styles.generalItem}>
                    <div className={styles.itemLeft}>
                        手机 :
                    </div>
                    <div className={styles.itemRight + " " + styles.itemRightSpecial}>
                        <Select defaultValue={0} style={{ width: "80px" }}>
                            <Option value={0}>+86</Option>
                        </Select>
                        {
                            <InputData.tel.inputCom changeValue={changeValue} id={InputData.tel.id} value={InputData.tel.value} help={InputData.tel.help} validateStatus={InputData.tel.validateStatus} />
                        }
                    </div>
                </div>
                {
                    extraInputArr.map((v, i) => {
                        let TempCom = InputData[v]["inputCom"];
                        return (
                            <div key={InputData[v]["id"]} className={styles.generalItem}>
                                <div className={styles.itemLeft}>
                                    {InputData[v]["name"]} :
                                    </div>
                                <div className={styles.itemRight}>
                                    {
                                        <TempCom changeValue={changeValue} id={InputData[v]["id"]} value={InputData[v]["value"]} help={InputData[v]["help"]} validateStatus={InputData[v]["validateStatus"]} />
                                    }
                                </div>
                            </div>
                        );
                    })
                }
                <div className={styles.generalItem}>
                    <div className={styles.itemLeft}>
                        部门 :
                </div>
                    <div className={styles.itemRight} style={{ display: "flex", alignItems: "center" }}>
                        <div className={styles.parEdit}>
                            {
                                selectedPartKeys.map((v, i) => (
                                    <div key={i} className={styles.parItem}>
                                        {v.title} <Icon type="close" className={styles.deleteItem} theme="outlined" onClick={() => { changePart(changePartArr(selectedPartKeys, v.key)) }} />
                                    </div>
                                ))
                            }
                            <div className={styles.revise} onClick={() => { operSelectedModal(true); }}>修改</div>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default AddMember;