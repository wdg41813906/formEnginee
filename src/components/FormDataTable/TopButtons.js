import React, { useEffect } from "react";
import qs from "qs";
import { Button, message } from "antd";
import styles from "./TopButtons.less";
import AuthorityStatus from "../../enums/AuthorityStatus";


function TopButtons({ onNew, onDelete, deleteStatus, onDesign, operationPermission, formTemplateType, onSelect, selectStatus, FormButtons, selectData, InitSelectData, addFilterPage, pageSize, pageIndex, formEnable }) {

    function GetRequest(params) {
        let author = JSON.parse(localStorage.getItem("author") || "{}");
        let HttpParams = {
            method: "GET",
            headers: {
                "Accept": "application/json,text/plain,*/*",
                "Content-Type": "application/json;charset=UTF-8"
            },
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            traditional: true
        };
        let SendParams = {};
        if (params && params.parmas) {
            for (let i = 0; i < params.parmas.length; i++) {
                let a = params.parmas[i];
                if (a.targetId) {
                    console.log(a.targetId);
                    debugger;
                    if (a.targetId !== "author" && !selectData) {
                        message.info("请先选择数据");
                        return;
                    }
                    switch (a.targetId) {
                        case "author":
                            SendParams[a.name] = author;
                            break;
                        case "all":
                            SendParams[a.name] = selectData;
                            break;
                        default:
                            let StrArray = [];
                            selectData.forEach(b => {
                                Object.keys(b).forEach((key) => {
                                    if (a.targetId === key) {
                                        StrArray.push(b[key]);
                                    }
                                });
                            });
                            SendParams[a.name] = StrArray;
                    }
                } else {
                    SendParams[a.name] = a.value;
                }
            }
        }
        let RequestUrl = `${params.url}?${qs.stringify(SendParams)}`;
        if (Number(params.methodType) === 1) {
            RequestUrl = params.url;
            HttpParams.body = JSON.stringify({
                ...SendParams
            });
            HttpParams.method = "POST";
        }
        fetch(RequestUrl, {
            ...HttpParams
        }).then(res => {
            console.log(res);
            res.clone().json().then(data => {
                if (data.isValid) {
                    message.info("操作成功");
                    //刷新列表
                    params.IsRefresh && addFilterPage(pageSize, pageIndex);
                } else {
                    message.error(data.errorMessages);
                }

            });
        });

    }

    function CheckVal(selectStatus) {
        if (selectStatus) {
            //取消选中时清空数据
            InitSelectData();
        }
        onSelect();
    }

    useEffect(() => {
        (FormButtons || []).map(a => {
            if (a.isPreload) {
                GetRequest(JSON.parse(a.parameterMap));
            }
        });
    }, [FormButtons]);

    return <div className={styles.topRight}>
        {
            Object.keys((FormButtons && FormButtons.find(a => a.type === 1 && (Number(formTemplateType) === 0 ? operationPermission.indexOf(a.id) !== -1 : true))) || {}).length ?
                <Button icon={selectStatus ? "menu-fold" : "menu-unfold"} type="primary" className={styles.opr}
                        onClick={() => CheckVal(selectStatus)}>
                    {selectStatus ? "取消选择" : "选择"}
                </Button> : null
        }
        {
            FormButtons ? FormButtons.map((a, index) => {
                return a.type === 1 && (Number(formTemplateType) === 0 ? operationPermission.indexOf(a.id) !== -1 : true) ?
                    <Button icon={a.icon} type="primary" key={index} className={styles.opr}
                            onClick={() => GetRequest(JSON.parse(a.parameterMap))}>
                        {a.name}
                    </Button>
                    : null;
            }) : null
        }
        {
            operationPermission.indexOf(AuthorityStatus.con) !== -1 ?
                <Button icon="layout" type="primary" className={styles.opr} onClick={onDesign}>
                    打印设计
                </Button>
                : null
        }
        {
            operationPermission.indexOf(AuthorityStatus.add) !== -1 || formTemplateType === "1" ?
                <Button icon="plus"  type="primary" className={styles.opr} onClick={onNew}
                        disabled={!formEnable}>
                    新增
                </Button>
                : null
        }
        {
            operationPermission.indexOf(AuthorityStatus.del) !== -1 && formTemplateType === "0" ?
                <Button icon="delete" type="danger" className={styles.opr} onClick={onDelete}>
                    {deleteStatus ? "取消删除" : "删除"}
                </Button>
                : null
        }
    </div>;
}

export default React.memo(TopButtons);
