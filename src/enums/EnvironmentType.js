const EnvironmentType = Object.freeze({
    currentUserId: 0,//当前用户id
    currentUserName: 1,//当前用户名
    currentRoleId: 2,//当前角色Id
    currentRoleName: 3,//当前角色名
    currentOrgId: 4,//当前机构id
    currentOrgName: 5,//当前机构名
    currentDeptId: 6,//当前部门id
    currentDeptName: 7,//当前部门名
    currentFormName:8,//当前表单名称
    currentFormInstanceId:9,//当前表单实例ID
    currentFormTempalteId:10,//当前表单模板ID
    currentFormTemplateVerionId:11,//当前表单模板版本ID

    currentLanguange: 97,//当前语言
    currentLocation: 98,//当前地区
    currentDeviceType: 99,//当前设备类型
    currentPlatform: 100,//当前平台
});

export function getEnvironmentValue(environmentType) {
    let environmentInfo = {};
    try {
        environmentInfo = JSON.parse(localStorage.getItem("author"));
    }
    catch (e) {

    }
    switch (environmentType) {
        case EnvironmentType.currentUserId:
            return environmentInfo.userId;
        case EnvironmentType.currentUserName:
            return environmentInfo.userName;
        case EnvironmentType.currentOrgId:
            return environmentInfo.currentDeptId;
        case EnvironmentType.currentOrgName:
            return environmentInfo.currentDeptName;
        case EnvironmentType.currentDeptId:
            return environmentInfo.currentDepartmentId;
        case EnvironmentType.currentDeptName:
            return environmentInfo.currentDepartmentName;
        default:
            return null;
    }
}

export const environmentList = [
    { value: 0, key: 'currentUserId', name: '当前用户id' },
    { value: 1, key: 'currentUserName', name: '当前用户名称' },
    { value: 2, key: 'currentRoleId', name: '当前角色id' },
    { value: 3, key: 'currentRoleName', name: '当前角色名称' },
    { value: 4, key: 'currentOrgId', name: '当前机构id' },
    { value: 5, key: 'currentOrgName', name: '当前机构名称' },
    { value: 6, key: 'currentDeptId', name: '当前部门id' },
    { value: 7, key: 'currentDeptName', name: '当前部门名称' },
];

export default EnvironmentType;