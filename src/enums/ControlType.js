const ControlType = Object.freeze({
    None: -1,
    SingleText: 0,
    Number: 1,
    DateTime: 2,
    SingleRadio: 3,
    Picture: 4,
    MutiText: 5,
    CheckBoxes: 6,
    MutiDropDownList: 7,
    Location: 8,
    SingleDropDownList: 9,
    Annex: 10,
    Member: 11,
    Department: 12,
    LinkQuery: 13,
    LinkData: 14,
    SerialNumber: 15,
    HrLine: 16,
    TextSwitch: 17,
    ImageView: 18,
    TableLinker: 96,
    TableLinkerName: 97,
    BusinessKey: 98,
    Container: 99,//所有容器都是这个类型
    PrimaryKey: 100,//主键
    ForeignKey: 101//外键
});
export default ControlType;
