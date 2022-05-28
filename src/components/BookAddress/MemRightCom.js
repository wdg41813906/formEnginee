import { Component } from "react"
import { Icon, Button, Switch } from "antd"
import { Guid } from "../../utils/com"
import styles from "./MemRightCom.less"

function GeneralTypeCom(props) {
    let { content } = props;
    return (
        <div className={styles.item}>
            <div className={styles.leftItem}>{content["title"]}</div>
            <div>
                {content["content"]}
            </div>
        </div>
    )
}

function ModalTypeCom(props) {
    let { content, controlFilter } = props;
    return (
        <div className={styles.item}>
            <div className={styles.leftItem}>{content["title"]}</div>
            <div className={styles.rightModal} onClick={() => {
                let [tempShowFilter, title] = content["content"] === "点击选择可编辑的应用" ? [[{ type: -1, name: "应用" }], "应用列表"] : [[{ type: 2, name: "成员", isTree: true }], "成员列表"];
                controlFilter(
                    {
                        isShowModal: true,
                        showFilterArr: tempShowFilter,
                        headerTitle: title,
                        singleOrMultiple: 0
                    }
                );
            }}>
                <Icon className={styles.rightIcon} type="plus" theme="outlined" />
                {content["content"]}
            </div>
        </div>
    );
}

function SwitchTypeCom(props) {
    let { content } = props;
    return (
        <div className={styles.item}>
            <div className={styles.leftItem}>{content["title"]}</div>
            <div className={styles.switchModal}>
                {
                    content["content"].map((v, i) => (
                        <div key={i} className={styles.switchItem}>
                            <div>{v["title"]}</div>
                            <div>
                                <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={v["checked"]} />
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

function SwiGenerTypeCom(props) {
    let { content, controlFilter } = props;
    return (
        <div className={styles.item}>
            <div className={styles.leftItem}>{content["title"]}</div>
            <div>
                <div className={styles.rightModal} onClick={() => {
                    controlFilter(
                        {
                            isShowModal: true,
                            showFilterArr: [
                                { type: 0, name: "部门" },
                            ],
                            headerTitle: "部门列表",
                            singleOrMultiple: 0
                        }
                    );
                }}>
                    <Icon className={styles.rightIcon} type="plus" theme="outlined" />
                    {content["content"]}
                </div>
                <div className={styles.rightDes}>{content["des"]}</div>
            </div>
        </div>
    )
}

function MemRightCom(props) {
    let { dataArr, controlFilter } = props;

    return (
        <div>
            {dataArr.map((v, i) => {
                let Com = null, props = { content: v, controlFilter };
                switch (v["type"]) {
                    case "0":
                        Com = GeneralTypeCom
                        break;
                    case "1":
                        Com = ModalTypeCom
                        break;
                    case "2":
                        Com = SwitchTypeCom
                        break;
                    case "3":
                        Com = SwiGenerTypeCom
                        break;
                }
                return <Com key={i} {...props} />
            })}
        </div>
    );
}

export default MemRightCom;