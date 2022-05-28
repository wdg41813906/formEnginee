import React from "react";
import { Button, Upload, Icon, Modal, Switch, Input, message } from "antd";
import { word, excel, ppt } from "../../assets";
// import config from '../../utils/config'
import com from "../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import Title from "../../components/FormControl/Attribute/Title.js";
import Desc from "../../components/FormControl/Attribute/Desc";
import OperationPower from "../../components/FormControl/Attribute/OperationPower.js";
import FormControlType from "../../enums/FormControlType";
import CollapseCom from "./Collapse/CollapseCom";
import RENDERSTYLE from "../../enums/FormRenderStyle";
import Attribute from "./Attribute/Attribute";
import "./Annex.less";

function initFormItemBase() {
    let formContainerBase = com.formContainerBase();
    formContainerBase = {
        ...formContainerBase,
        type: "Annex",
        typeName: "附件",
        name: "附件",//标题
        multiple: false,
        uploadText: "选择文件"
    };
    return formContainerBase;
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "column"
    },
    box: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10
    },
    fontMargin: {
        marginRight: 10
    },
    area: { flex: 1 }
};

@Attribute("上传样式")
class UploadStyle extends React.PureComponent {
    render() {
        const { multiple, uploadText, onChange } = this.props;
        return (
            <div style={styles.container}>
                <div style={styles.box}>
                    <div style={styles.area}>上传按钮文案：</div>
                    <Input style={styles.area} value={uploadText}
                           onChange={e => onChange({ uploadText: e.target.value })}/>
                </div>
                <div style={styles.box}>
                    <div style={styles.fontMargin}>是否支持多选文件：</div>
                    <Switch defaultChecked={multiple} onChange={e => onChange({ multiple: e })}/>
                </div>
            </div>
        );
    }
}

class AnnexMiddel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            firstCheck: true,
            previewVisible: false,
            previewImage: "",
            uploadList: [],
            fileLists: []
        };
    }
    
    handlePreview = file => {
        const imageFormat = ["png", "jpg", "jpeg", "gif", "bmp"];
        let fileLists = this.props.value;
        for (let i = 0; i < imageFormat.length; i++) {
            if (file.name.includes(imageFormat[i])) {
                fileLists.forEach(item => {
                    if (file.uid === item.uid) {
                        this.setState({
                            previewImage: item.thumbUrl || item.url,
                            previewVisible: true
                        });
                    }
                });
                return;
            }
        }
        message.warning("非图片文件不能预览");
    };
    downFile = (uid) => {
        let fileLists = this.props.value;
        fileLists.forEach(item => {
            if (uid === item.uid) {
                window.open(item.url);
            }
        });
    };
    mouseOverLeave = (uid) => {
        let fileLists = this.props.value;
        fileLists.forEach(item => {
            if (uid === item.uid) {
                item.isShowModal = !item.isShowModal;
            } else {
                item.isShowModal = false;
            }
        });
        this.props.onChange({ value: fileLists });
    };
    handleRemove = (uid) => {
        let fileLists = this.props.value;
        fileLists = fileLists.filter(item => item.uid !== uid);
        this.setState({
            fileLists: fileLists
        });
        this.props.onChange({ value: fileLists });
    };
    handleCancel = () => this.setState({ previewVisible: false });
    
    uploadChange = ele => {
        let { file, fileList } = ele;
        let value = this.props.value || [];
        debugger;
        if (file.status === "done" || file.status === "removed") {
            let { fileLists } = this.state;
            fileList.map(a => {
                if (a.response) {
                    if (file.uid === a.uid) {
                        let sendData = a.response.data[0];
                        fileLists.push({
                            uid: sendData._id,
                            name: sendData.fileName,
                            url: `${config.fileAdd}${sendData.fileUrl}`,
                            thumbUrl: `${config.fileAdd}${sendData.thumbnailUrl}`,//缩略图地址
                            fileId: sendData.fileId,
                            size: sendData.size,
                            isShowModal: false
                        });
                    }
                }
                // else {
                //     fileLists.push(a);
                // }
            });
            this.setState({
                fileLists: this.state.firstCheck ? value.concat(fileLists) : fileLists,
                firstCheck: false
            }, () => {
                this.props.onChange({ value: this.state.fileLists });
            });
            
        }
    };
    
    render() {
        const { name, externalName, extra, select, renderStyle, multiple, value, disabled, readOnly, uploadText } = this.props;
        let { previewImage, previewVisible } = this.state;
        if (typeof value === "object") {
            value.map(item => {
                if (item.name.includes(".doc")) item.thumbUrl = word;
                if (item.name.includes(".xls")) item.thumbUrl = excel;
                if (item.name.includes(".ppt")) item.thumbUrl = ppt;
            });
            
        }
        let ac = `${config.serverOpenApiIp}/UploadFile/Upload`;
        return (
            <CollapseCom
                border
                collapse={this.props.collapse}
                title={externalName || name}
                allCollapseToggle={this.props.allCollapseToggle}
                extra={extra}
                formLayout={this.props.formLayout}
                hasChildren={true}
                onChange={this.props.onChange}
                renderStyle={renderStyle}
                selecting={renderStyle == RENDERSTYLE.Design ? select : false}
            >
                <div className='upload-list-inline'>
                    {
                        renderStyle == RENDERSTYLE.PC ?
                            <Upload
                                action={ac}
                                headers={{
                                    Authorization: localStorage.getItem("token"),
                                    Platform: "NPF"
                                }}
                                disabled={disabled || readOnly}
                                // defaultFileList={fileList}
                                // fileList={fileList}
                                onChange={this.uploadChange}
                                multiple={multiple}
                                listType='picture'
                                // onRemove={this.handleRemove}
                            >
                                {/*<Button style={{display: 'block'}} disabled={renderStyle == 9 ? true : false}>*/}
                                <Button style={{ background: disabled ? "#eee" : "", display: "block" }}
                                        disabled={disabled || readOnly}>
                                    <Icon type="upload"/>
                                    {uploadText}
                                </Button>
                            </Upload> :
                            <p style={{
                                width: "100%",
                                border: "1px solid #ddd",
                                margin: "20px auto",
                                textAlign: "center",
                                padding: 10,
                                borderRadius: "4px"
                            }}>{uploadText}</p>
                    }
                    {
                        value && value.length > 0 ?
                            <div className='pictureList'>
                                {
                                    (value || []).map((item, index) => {
                                        return (
                                            <div className='pictureChild' key={index}>
                                                <div
                                                    style={{
                                                        position: "relative",
                                                        height: "100px",
                                                        lineHeight: "90px"
                                                    }}>
                                                    <img style={{ width: "86px", height: "auto" }}
                                                         src={item.thumbUrl} alt={item.name}
                                                         onMouseOver={() => this.mouseOverLeave(item.uid)}/>
                                                    {
                                                        item.isShowModal ? <div style={{
                                                            position: "absolute",
                                                            height: "100px ",
                                                            width: "100px",
                                                            top: 0,
                                                            left: 0,
                                                            borderRadius: "5px",
                                                            color: "#fff",
                                                            fontSize: "16px",
                                                            background: "rgba(0,0,0,0.3)"
                                                        }} onMouseLeave={() => this.mouseOverLeave(item.uid)}>
                                                            {
                                                                (disabled || readOnly) ? null :
                                                                    <Icon type="delete"
                                                                          style={{
                                                                              position: "absolute",
                                                                              top: 0,
                                                                              right: 0
                                                                          }}
                                                                          onClick={() => this.handleRemove(item.uid)}/>
                                                            }
                                                            <div style={{
                                                                display: "flex", justifyContent: "space-around",
                                                                position: "absolute",
                                                                width: "100%",
                                                                top: "43px"
                                                            }}>
                                                                <Icon type="download"
                                                                      onClick={() => this.downFile(item.uid)}/>
                                                                <Icon type="eye"
                                                                      onClick={() => this.handlePreview(item)}/>
                                                            </div>
                                                            <p style={{
                                                                fontSize: "12px",
                                                                position: "absolute",
                                                                bottom: "-35px",
                                                                left: 0,
                                                                margin: 0,
                                                                padding: 0
                                                            }}>{item.size}</p>
                                                        </div> : null
                                                    }
                                                </div>
                                                <p style={{
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis"
                                                }}>{item.name}</p>
                                            </div>
                                        );
                                    })
                                }
                            </div> : null
                    }
                    <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                        <img alt="上传文件" style={{ width: "100%" }} src={previewImage}/>
                    </Modal>
                </div>
            </CollapseCom>
        );
    }
}

class Annex extends React.PureComponent {
    render() {
        let { mode } = this.props;
        switch (mode) {
            case "table":
            case "form":
                return <AnnexMiddel {...this.props} />;
            case "groupCell":
            case "cell":
                let ShowStr = "";
                if (this.props.value) {
                    this.props.value.map(item => {
                        ShowStr += `${item.name}`;
                    });
                }
                return ShowStr;
            case "option":
                return <React.Fragment>
                    <Title.Component {...Title.getProps(this.props)} />
                    <UploadStyle {...this.props} />
                    <OperationPower {...this.props} />
                    <Desc.Component {...Desc.getProps(this.props)} />
                </React.Fragment>;
            default:
                return <div>控件加载失败</div>;
        }
    }
}

export default {
    valueType: "array",
    itemType: "Annex",
    containerMode: true,
    formControlType: FormControlType.Item,
    name: "附件",
    ico: "upload",
    event: {
        onBuildFormDataModel: (value, props) => {
            if (Array.isArray(value))
                return value.map(a => a.name);
            else
                return [];
        },
        buildSubTableHeader: (props) => {
            let { id, name, container } = props;
            let column = {
                title: name,
                key: id,
                dataIndex: id,
                width: 500,
                container
            };
            return column;
        },
        FilterComponent: () => {
            return null;
        },
        getFilterComponentProps: props => {
            return props;
        },
        filterValueType: ["为空", "不为空"] //组件在台账及数据管理页面判断search关系
    },
    group: FORM_CONTROLLIST_GROUP.Normal, // 分组
    Component: Annex,
    initFormItemBase
};
