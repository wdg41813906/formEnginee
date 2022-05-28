import workFlow from "./workFlow";
import microEnterprise from "./microEnterprise";
import Voucher from "./Voucher";
//影像系统
import SysImage from "./SysImage";
import BillInfo from "./billInfo";
//花费预算
import BudgetCostResult from "./BudgetCostResult";
//预算花费申请
import BudgetApplicationResult from "./BudgetApplicationResult";
//预算调拨/申请
import BudgetAllocationResult from "./BudgetAllocationResult";
//报销科目互斥校验
import BudgetMutexResult from "./BudgetMutexResult";
//表单名称配置
import FormNameConfig from "./FormNameConfig";

export default [workFlow, SysImage, BillInfo, Voucher, BudgetCostResult, BudgetApplicationResult, BudgetAllocationResult, BudgetMutexResult, FormNameConfig];
