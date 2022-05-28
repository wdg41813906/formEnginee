import styles from "./MemRightDetail.less";

function MemRightDetail(props) {
    let {memDetailData,goBack,clickEidtMemModal,deleteMemList} = props;
    // console.log(memDetailData);
    return (
        <div>
            <div className={styles.title}>
                成员详情
            </div>
            <div className={styles.memOper}>
                <div className={styles.operItem} onClick={()=>{goBack();}}>返回</div>
                <div className={styles.operItem} onClick={()=>{clickEidtMemModal();}}>编辑</div>
                <div className={styles.operItem} onClick={()=>{
                    deleteMemList([props.memDetailData.id]);
                }}>删除</div>
            </div>
            <div className={styles.mainContent}>
                <div className={styles.detailName}>
                    <div className={styles.itemLeft}>
                        <img/>
                    </div>
                    <div className={styles.name}>
                        <div>{memDetailData["name"] || "未设置"}</div>
                        <div>账号:{memDetailData["userId"] || "未设置"}</div>
                    </div>
                </div>
                <div className={styles.item}>
                    <div className={styles.itemLeft}>手机:</div>
                    <div>{memDetailData["mobile"] || "未设置"}</div>
                </div>
                <div className={styles.item}>
                    <div className={styles.itemLeft}>座机:</div>
                    <div>{memDetailData["telephone"] || "未设置"}</div>
                </div>
                <div className={styles.item}>
                    <div className={styles.itemLeft}>邮箱:</div>
                    <div>{memDetailData["email"] || "未设置"}</div>
                </div>
                {/* <div className={styles.item}>
                    <div className={styles.itemLeft}>微信:</div>
                    <div>西安老翟律师</div>
                </div> */}
                <div className={styles.item}>
                    <div className={styles.itemLeft}>地址:</div>
                    <div>{memDetailData["workPlace"] || "未设置"}</div>
                </div>
                {/* <div className={styles.item}>
                    <div className={styles.itemLeft}>办公电话:</div>
                    <div>未设置</div>
                </div> */}
                <div className={styles.item+" "+styles.itemBoder}>
                    <div className={styles.itemLeft}>英文名:</div>
                    <div>{memDetailData["englishName"] || "未设置"}</div>
                </div>
                <div className={styles.item}>
                    <div className={styles.itemLeft+" "+styles.itemsLeftSpecial}>部门:</div>
                    <div>
                        {
                            !memDetailData["organizationObjects"]?"未设置":memDetailData["organizationObjects"].map((v,i)=>(
                                <div key={i}>{v["name"]}</div>
                            ))
                        }
                    </div>
                </div>
                <div className={styles.item}>
                    <div className={styles.itemLeft}>职务:</div>
                    <div>{memDetailData["position"] || "未设置"}</div>
                </div>
                <div className={styles.item}>
                    <div className={styles.itemLeft}>身份:</div>
                    <div>普通成员</div>
                </div>
            </div>
        </div>
    );
}

export default MemRightDetail;