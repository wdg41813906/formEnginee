import React, { PropTypes } from "react";
import { Menu, Icon, Button, Input, div } from "antd";
import queryString from "query-string";
import { Link } from "dva/router";
import styles from "./Operate.less";
// import com from "../../utils/com";
// import {publishForm, unpublishForm} from "../../services/FormViewList/FormViewList";

//
function Operate({ Preview, Refresh, Save, history }) {
    let query = queryString.parse(history.location.search);
    return (
        <div className={styles.operate}>
            <div className={styles.right}>
                <div className={`${styles.btn} ${styles.btn_1}`} onClick={ele => Preview()}>预览</div>
                {query.type === "modify" ?
                    <div className={`${styles.btn} ${styles.btn_1}`} onClick={ele => Refresh()}>刷新</div> : null}
                <div className={`${styles.btn} ${styles.btn_2}`} onClick={ele => Save()}>保存</div>
                {/*<div className={`${styles.btn} ${styles.btn_3}`} onClick={ele => Save(true)}>发布</div>*/}
            </div>
        </div>
    );
}

export default Operate;
