import SingleDropDownList from "./SingleDropDownList";
import MutiDropDownList from "./MutiDropDownList";
import Picture from "./Picture";
import Annex from "./Annex";
import NumberField from "./Number";
import DateTime from "./DateTime";
import CardPanel from "./CardPanel";
import TabPanel from "./TabPanel";
import SingleText from "./SingleText";
import MutiText from "./MutiText";
import SingleRadio from "./SingleRadio";
import CheckBoxes from "./CheckBoxes";
import HrLine from "./HrLine";
import Cascader from "./Cascader";
import SubForm from "./SubForm";
import Member from "./Member/Member";
import Department from "./Member/Department";
import LinkData from "./LinkData";
import LinkQuery from "./LinkQuery";
import SerialNumber from "./SerialNumber";
import TextSwitch from "./TextSwitch";
import TreeSelect from "./TreeSelectCom";
import TableLinkerName from "./TableLinkerName";
import ImageView from "./ImageView";
// import FORM_CONTROL_TYPE from '../../enums/FormControlType';

let list = [
    CardPanel, TabPanel,
    SingleText, MutiText,
    DateTime, NumberField,
    Annex,
    SingleRadio, CheckBoxes,
    SingleDropDownList, MutiDropDownList,
    HrLine, //
    Member, Department,
    LinkData, LinkQuery,
    SerialNumber,//, SubForm2
    TextSwitch,
    Cascader,
    TreeSelect,
    SubForm,
    TableLinkerName,
    ImageView
];
// list.forEach(control => {
//     switch (control.formControlType) {
//         case FORM_CONTROL_TYPE.Item:
//             break;
//         case FORM_CONTROL_TYPE.Container:
//             break;
//         case FORM_CONTROL_TYPE.Group:
//             break;
//     }
// });
export default list;
// , MutiText, SingleDropDownList, MutiDropDownList, Picture,
// Annex, NumberField, DateTime, SingleRadio, CheckBoxes, CardPanel, TabPanel];
