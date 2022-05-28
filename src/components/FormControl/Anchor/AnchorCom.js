import react from "react";
import { Tooltip, Icon, Steps } from "antd";
import styles from "./Anchor.less";

const { Step } = Steps;
let showCollapse = false;
export default class AnchorCom extends react.Component {
    scrollToAnchor = (id, renderStyle,index) => {
        const anchorName = "" + id + renderStyle;
        this.props.allCollapseToggle(id);
        this.props.setAnchorIndex(index)
        if (anchorName) {
            let anchorElement = document.getElementById(anchorName);
            if (anchorElement) {
                anchorElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "end"
                });
            }
        }
    };
    allCollapseToggle = () => {
        showCollapse = !showCollapse;
        this.props.allCollapseToggle();
    };

    render() {
        const { anchorList, renderStyle, anchorIndex } = this.props;
        const currentIndex = anchorIndex;
        // console.log(currentIndex)
        // console.log(`currentIndex:${anchorIndex}`, this.props)
        // console.log(anchorList.toJS())
        return (
            <div className={styles.AnchorWrap}>
                <div className={styles.AnItemContext}>
                    {
                        anchorList.map((a, index) => {
                            return (
                                <Tooltip placement="left" title={a.name} key={index}>
                                    <div onClick={e => {
                                        this.scrollToAnchor(a.id, renderStyle,index);
                                        console.log(currentIndex == index, currentIndex, index);
                                    }}
                                         className={`${styles.AnchorItem} ${currentIndex == index ? styles.select : ""}`}>
                                        {index + 1}
                                    </div>
                                    {
                                        index === anchorList.toJS().length - 1 ? null :
                                            <div style={{
                                                borderLeft: "1px #ccc solid",
                                                height: "10px",
                                                width: "1px",
                                                margin: "2px 0 0 12px"
                                            }}/>
                                    }
                                </Tooltip>
                            );
                        })
                    }
                    <Tooltip placement="left" title={!showCollapse ? "折叠模式" : "展开模式"}>
                        <div style={{ borderTop: "1px #ccc solid", height: "1px", marginTop: "6px" }}/>
                        <div onClick={this.allCollapseToggle} className={styles.AnchorItem}
                             style={{ background: "#fff", color: "#ccc", marginTop: "0px" }}>
                            <Icon type={!showCollapse ? "pic-center" : "menu"} theme='outlined'/>
                        </div>
                    </Tooltip>
                </div>
            </div>
        );
    }
}
