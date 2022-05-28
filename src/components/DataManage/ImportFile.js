import { Component } from "react"
import { Modal, Icon, Upload, Button } from "antd"
import styles from "./ImportFile.less"


// 对应步骤的组件
import ImportProcedureOne from "./ImportFileCom/ImportProcedureOne"
import ImportProcedureTwo from "./ImportFileCom/ImportProcedureTwo"
import ImportProcedureThree from "./ImportFileCom/ImportProcedureThree"

function ImportFile(props) {
    let { importSteps, changeSteps, isShowImportModal, operateImportModal, importFormData,importExcelStatus,refresh } = props;
    console.log(importExcelStatus);
    return (
        <Modal
            title="导入Excel数据"
            visible={isShowImportModal}
            footer={null}
            centered={true}
            destroyOnClose={true}
            onCancel={() => { operateImportModal(false); changeSteps(1); }}
            width={800}
            maskClosable={false}
        >
            <div className={styles.procedure}>
                <div className={`${styles.progress} ${styles.progressRight} ${styles.progressActive} ${importSteps !== 1 && styles.progressRightActive}`}>
                    <div className={styles.description}>
                        {importSteps === 1 && 1}
                        {importSteps !== 1 && <Icon type="check" theme="outlined" />}
                    </div>
                    <div className={styles.desText}>选择Execel表</div>
                </div>
                <div className={`${styles.progress} ${styles.progressLeft} ${styles.progressRight} ${importSteps >= 2 && (styles.progressActive + " " + styles.progressLeftActive)} ${importSteps > 2 && styles.progressRightActive}`}>
                    <div className={styles.description}>
                        {importSteps === 2 && 2}
                        {importSteps > 2 && <Icon type="check" theme="outlined" />}
                    </div>
                    <div className={styles.desText}>数据预览</div>
                </div>
                <div className={styles.progress + " " + styles.progressLeft + " " + styles.progressRight + `  ${importSteps >= 3 && (styles.progressActive + " " + styles.progressLeftActive)}` + `  ${importSteps > 3 && styles.progressRightActive}`}>
                    <div className={styles.description}>
                        {importSteps === 3 && 3}
                        {importSteps > 3 && <Icon type="check" theme="outlined" />}
                    </div>
                    <div className={styles.desText}>表单设置</div>
                </div>
                <div className={styles.progress + " " + styles.progressLeft + `  ${importSteps >= 4 && (styles.progressActive + " " + styles.progressLeftActive)}`}>
                    <div className={styles.description}>
                        {importSteps === 4 && 4}
                        {importSteps > 4 && <Icon type="check" theme="outlined" />}
                    </div>
                    <div className={styles.desText}>导入数据</div>
                </div>
            </div>
            {importSteps === 1 && <ImportProcedureOne {...props} />}
            {importSteps === 2 && <ImportProcedureTwo {...props} />}
            {importSteps === 3 && <ImportProcedureThree {...props} />}
            {importSteps === 4 && <div className={styles.stepsFinish}>
                <div className={styles.finishContainer}>
                    <div className={`${styles.finishIcon} ${importExcelStatus?styles.success:styles.fail}`}>
                        <Icon type={importExcelStatus?"check":"close"} theme="outlined" />
                    </div>
                    <p>{importExcelStatus?"导入成功":"导入失败，请重新导入"}</p>
                </div>
            </div>}
            {
                importSteps !== 1 && <div className={styles.procedureBtn}>
                    {importSteps !== 4 && <div className={styles.next} onClick={() => { importSteps !== 3 && changeSteps(importSteps + 1); importSteps === 3 && importFormData(); }}>{importSteps === 3 ? "导入" : "下一步"}</div>}
                    {importSteps !== 4 && <div className={styles.prev} onClick={() => { changeSteps(importSteps - 1); }}>上一步</div>}
                    {importSteps === 4 && <div className={styles.next} onClick={() => { operateImportModal(false); changeSteps(1);refresh() }}>完成</div>}
                </div>
            }
        </Modal>
    );
}

export default ImportFile;