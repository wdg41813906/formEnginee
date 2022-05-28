import React from 'react';
import { Button, Upload, Icon, message, Modal } from 'antd';
import com from '../../utils/com'
import FORM_CONTROLLIST_GROUP from '../../enums/FormControlListGroup';
// import { fileServer } from '../../utils/config'
import Title from '../../components/FormControl/Attribute/Title.js'
import Desc from '../../components/FormControl/Attribute/Desc.js'
import VerificationPic from '../../components/FormControl/Attribute/VerificationPic.js'
import OperationPower from '../../components/FormControl/Attribute/OperationPower.js'
import Position from '../../components/FormControl/Attribute/PositionStyle';
import FormControlType from '../../enums/FormControlType';


function initFormItemBase() {
    let formItemBase = com.formItemBase()
    formItemBase.type = "Picture";
    formItemBase.typeName = "图片";
    formItemBase.name = "图片";//标题
    formItemBase.Multiple = false;//多张
    formItemBase.PreviewVisible = false;
    formItemBase.previewImage = "";
    return formItemBase;
}
class PictureMiddel extends React.PureComponent {
    Change(info) {
        let file = info.file;
        if (file.status == 'done') {
            this.props.onChange({ value: ele.fileList.length ? ele.fileList : [] });
        }
    }
    beforeUpload(file) {
        const isJPG = file.type.indexOf('image') > -1;
        if (!isJPG) {
            message.error('只能上传图片!');
        }
        return isJPG;
    }
    Preview(file) {
        this.props.onchange({ PreviewVisible: true, PreviewImage: file.url || file.thumbUrl, });
    }
    PreviewCancel() {
        this.props.onchange({ PreviewVisible: false });
    }
    render() {
        let { Multiple, PreviewVisible, PreviewImage, value, disabled ,readOnly} = this.props;
        return (
            <div className={"upLoadDiv"}>
                <Upload readOnly={readOnly} defaultFileList={value ? value : []} listType="picture"
                    onPreview={file => this.Preview(file)}
                    beforeUpload={file => this.beforeUpload(file)}
                    accept="image/png,image/gif,image/jpeg,image/tiff,image/x-ms-bmp,image/x-photo-cd,image/x-portablebitmap,image/x-portable-greymap,image/x-portable-pixmap,image/x-rgb"
                    onChange={ele => this.Change(ele)} action={`${config.fileServer}/api/FileUpload/UploadImages`} multiple={Multiple}>
                    <Button>
                        <Icon type="picture" style={{ color: "#108ee9" }} /> 选择图片
                </Button>
                </Upload>
                <Modal visible={PreviewVisible} footer={null} onCancel={e => this.PreviewCancel()}>
                    <img alt="example" style={{ width: '100%' }} src={PreviewImage} />
                </Modal>
            </div>)
    }
}
class Picture extends React.PureComponent {
    render() {
        let { mode } = this.props;
        switch (mode) {
            case 'table':
            case 'form':
                return <PictureMiddel {...this.props} />;
            case 'option':
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <Position.Component {...Position.getProps(this.props)} />
                        <VerificationPic.Component {...VerificationPic.getProps(this.props)} />
                        <OperationPower {...this.props} />
                        <Desc.Component {...Desc.getProps(this.props)} />
                    </React.Fragment>)
            default:
                return <div>控件加载失败</div>;
        }
    }
}
export default {
    itemType: "Picture",
    formControlType: FormControlType.Item,
    name: "图片",
    ico: 'picture',
    group: FORM_CONTROLLIST_GROUP.Normal,//分组
    Component: Picture,
    valueType: 'string',
    initFormItemBase
};
