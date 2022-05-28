import { Icon, Select, } from "antd"
import moment from 'moment';
import styles from "./filterCom.less"

import filterCom from "./filterCom";
import { optionObj } from "../../utils/com"
const Option = Select.Option;



function generateFilterCom(item, i, other) {
    let TempCom = filterCom[item.type]["Com"];
    let tempOptionArr = optionObj[item.type];
    let { changeConditionValue, filterFeildChange, getLocationArr, templateId, FormTemplateVersionId, layout } = other;
    const isHorizon = (layout === "horizon" || layout === 'businessRule')
    const onChange = (value) => {
        let tempData = {};
        tempData.condition = value;
        tempData.value = "";
        // 对于 日期 范围 进行特殊处理
        if (item.type === "date") {
            tempData.extendedType = "0";
            if (value === "-1") {
                tempData.value = [moment().format("YYYY-MM-DD HH:mm:ss"), moment().format("YYYY-MM-DD HH:mm:ss")];
            }
        }
        changeConditionValue(item.id, tempData)
    }
    const deleteField = () => {
        filterFeildChange instanceof Function && filterFeildChange(0, item.id);
    }
    const nameClass = `${styles.filterTitle} ${styles.inlineBlock} ${isHorizon ? styles.filterTItleH : ""}`;
    return (
        <div key={i} className={`${styles.filterContainer} ${isHorizon ? styles.filterContainerH : ""}
          ${layout === 'businessRule' ? styles.businessRuleContainer : ""}`}>
            <div className={styles.filterHeader}>
                <div className={styles.inlineBlock + " " + styles.filterHeaderDes}>
                    {item.CusNameRender instanceof Function ?
                        <item.CusNameRender parentClassName={nameClass} /> :
                        <div className={nameClass} title={item.name}>{isHorizon ? `${item.title}:` : item.name}</div>
                    }&nbsp;
                    <Select className={styles.filterCompare} onChange={onChange} value={item.condition} dropdownMatchSelectWidth={false}>
                        {tempOptionArr.map((v, i) => (
                            <Option key={i} value={v.value}>{v.name}</Option>
                        ))}
                    </Select>
                </div>
                {!isHorizon ?
                    <Icon type="delete" theme="outlined" className={styles.filterIcon} onClick={deleteField} />
                    : null
                }
            </div>
            <div className={`${styles.filterContent} ${isHorizon ? styles.filterContentH : ""}`}>
                <TempCom templateId={templateId} FormTemplateVersionId={FormTemplateVersionId} changeConditionValue={changeConditionValue} getLocationArr={getLocationArr} layout={layout} {...item} />
            </div>
            {layout === "businessRule" &&
                <Icon type="delete" theme="outlined" className={`${styles.filterIcon} ${styles.businessRuleDel}`} onClick={deleteField} />
            }
        </div>
    )
}
/**
 * 
 * filterConditionArr
 * 如果 filterConditionArr 中 又 cusNameRender 组件 方法 优先 使用 这个方法 CusNameRender*/
function GenerateFilterCondition(props) {
    let { filterConditionArr, changeConditionValue, filterFeildChange, getLocationArr, templateId, FormTemplateVersionId, layout } = props;
    const isHorizon = layout === "horizon" || 'businessRule';
    // console.log(props);
    return (
        <div className={`${isHorizon ? styles.horizonContainer : null}`}>
            {
                filterConditionArr.map((v, i) => (
                    generateFilterCom(v, i, { changeConditionValue, filterFeildChange, getLocationArr, templateId, FormTemplateVersionId, layout })
                ))
            }
        </div>
    );
}

export default GenerateFilterCondition;