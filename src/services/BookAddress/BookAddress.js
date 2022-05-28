import request from "../../utils/request";
import qs from "qs";
// import { serverOpenApiIp } from "../../utils/config";

const addPlatform = function(url, params) {
  params.Platform = "NPF";
  let { hideProgress, ...other } = params;
  return request(`${config.serverOpenApiIp}${url}`, {
    method: "post",
    body: JSON.stringify(other),
    hideProgress
  });
};

// 获取部门 成员 树结构
export async function getOrganazition(params) {
  return addPlatform("/Organization/GetOrganizationAndEmployeeLower", params);
}

// 重新排序
export async function organazitionModify(params) {
  return addPlatform("/Organization/Sort", params);
}

//同步
export async function syncOrgAndUser(params) {
  return addPlatform("/Organization/SyncOrgAndUser", params);
}

// 新增部门
export async function newDepartment(params) {
  return addPlatform("/Organization/New", params);
}

// 删除 部门
export async function deleteDepartment(params) {
  return addPlatform("/Organization/Remove", params);
}

// 修改 部门
export async function reviseDep(params) {
  return addPlatform("/Organization/ModifyName", params);
}

// 部门搜索
export async function searchDepData(params) {
  return addPlatform("/Organization/GetListPaged", params);
}

// // 获取 部门下的成员
// export async function getMemData(params) {
//   return addPlatform("/Employee/GetListPaged", params);
// }

// 获取成员详情  EntityId
export async function getMemDetail(params) {
  return addPlatform("/Employee/GetForModify", params);
}

// 批量删除 成员
export async function removeMemList(params) {
  return addPlatform("/Employee/Remove", params);
}

// 设置成员 所在部门
export async function setDep(params) {
  return addPlatform("/Employee/ModifyOrganizationEmployee", params);
}

// 获取 成员List 的 部门 交集
export async function getFixedDep(params) {
  return addPlatform("/Organization/GetForIntersection", params);
}

// 添加成员
export async function newMember(params) {
  return addPlatform("/Employee/New", params);
}

// 账号 唯一性 判断
export async function accountIsRepeat(params) {
  return addPlatform("/Employee/IsRepeat", params);
}

// 确认 移入 成员的 接口
export async function confirmImportMem(params) {
  return addPlatform("/Employee/Move", params);
}

// 修改 成员 信息
export async function modifyMem(params) {
  return addPlatform("/Employee/Modify", params);
}

/**
 *职责 的接口
 */
// 获取职责列表
export async function getRolesList(params) {
  return addPlatform("/Role/GetListPaged", params);
}

// 新增 职责
export async function addNewRoles(params) {
  return addPlatform("/Role/New", params);
}

// 修改名称
export async function reviseRoleName(params) {
  return addPlatform("/Role/Modify", params);
}

// 删除 职责
export async function removeRole(params) {
  return addPlatform("/Role/Remove", params);
}

// 职责 排序
export async function sortRoles(params) {
  return addPlatform("/Role/SortIndex", params);
}

// 获取 职责下 的成员
export async function getRolesMem(params) {
  return addPlatform("/Employee/GetEmployeeListByRoleIdPaged", params);
}

// 新增 职责 成员 关系
export async function createRolesAndMem(params) {
  return addPlatform("/RelationEmployeeRole/New", params);
}

// 批量 删除 职责 和 成员的关系
export async function removeRolesAndMem(params) {
  return addPlatform("/RelationEmployeeRole/Remove", params);
}

/**
 * 成员列表 筛选 页面 的  接口
 *  */
// 获取 成员 列表
export async function getFiltermemList(params) {
  return addPlatform("/Employee/GetListPaged", params);
}

// 获取 职责 列表
export async function getFilterRoleList(params) {
  return addPlatform("/Role/GetListPaged", params);
}

// 获取 筛选 的 部门 树结构
export async function getFilterOrganaziton(params) {
  return addPlatform("/Organization/GetOrganizationAndEmployeeLower", params);
}

// 查询 所有 列表的 几口
export async function searchAllList(params) {
  console.log(params)
  return addPlatform("/Employee/Search", params);
}

// 获取已选中的部门 职责 人员
export async function GetConfigTarget(params) {
  return addPlatform("/DataPermission/GetConfigedTargets ", params);
}
