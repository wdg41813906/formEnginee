import react from 'react';
import ConfigItemHOC from './../../Config/ConfigItem/ConfigItemHOC'
import { Input, Upload, Button, Icon, message ,Pagination} from 'antd';
import { Guid } from '../../../../utils/com'
import styles from './../../Config/ConfigItem/ConfigItem.less'
// import { fileServer } from '../../../../utils/config'
import axios from 'axios';
import './BackImageConfig.less'




const props2 = {
    //action: 'http://171.221.227.116:21862/api/FileUpload/UploadImages',
    action: `${config.fileServer}/api/FileUpload/UploadImages`,
    listType: 'picture',
    defaultFileList: [],
    className: 'upload-list-inline',
};

@ConfigItemHOC()
export default class BackImageConfig extends react.Component {

    constructor(props) {
        super(props)
       // this.props.AttachmentsGetListPaged(1)
        this.state = {
            pageIndex: 1
        }
    }
    componentWillMount() {

    }
    handleSizeChange = (e) => {
        this.setState({ size: e.target.value });
    }
    HoverChange = (ele, flag) => {
        this.props.BackImageHoverChange(ele, flag)

    }
    ItemClick = (ele) => {
        this.props.BackImageItemClick(ele)
        this.props.SetLedgerData('', 'backImageUrl', ele.thumbUrl)
    }
    beforeUpload = (file) => {
        const isJPG = file.type.indexOf('image') > -1;

        if (!isJPG) {
            message.error('只能上传图片!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('图片大小不能超过2M!');
        }
        return isJPG && isLt2M;
    }

    customRequest = ({
        action,
        data,
        file,
        filename,
        headers,
        onError,
        onProgress,
        onSuccess,
        withCredentials,
    }) => {
        var _this = this;
        // EXAMPLE: post form-data with 'axios'
        const formData = new FormData();
        if (data) {
            Object.keys(data).map(key => {
                formData.append(key, data[key]);
            });
        }

        formData.append(filename, file);

        axios
            .post(action, formData, {
                withCredentials,
                headers: {
                    'Authorization': "Bearer ZZuLhOFsaPoQmSU8JmNzrForgGaGUwO7dHxlxRpiR8R6Sb8umAw2GPrn3JgkelO6Fy8gzIi1egiqqPBIc+iScL2KsJXN9DsIvQDxCZSqEd2E2q0Igs5dY6meuwA2KNT6MpxDY+0RN7ZXA316rPwJWAg1lYK50dlMQnFzAKDXLCf24MGb92/yE4G2ITEXcJUs"
                },
                onUploadProgress: ({ total, loaded }) => {
                    onProgress({ percent: Math.round(loaded / total * 100).toFixed(2) }, file);
                },
            })
            .then(({ data: response }) => {
                // var imageList = _this.state.ImageList;
                var fileRes = response[0]
                var url = fileRes.data
                _this.props.BackImageAdd({
                    Id: Guid(),
                    Src: `${config.fileServer}/${url}`
                })
                _this.props.AttachmentsNew({
                    URL: url,
                    Extension: fileRes.extension,
                    Size: fileRes.size,
                    SourceType: 0
                })
                _this.props.AttachmentsGetListPaged(1)
                onSuccess(response, file);
            })
            .catch(onError);

        return {
            abort() {
            
            },
        };
    }
    render() {
        const { ledgerAllConfig, NewBackImageList ,backImagePage} = this.props;

        return (

            <div>
                {
                    ledgerAllConfig.backImageShow ? <div>
                        <div className={styles.item}>

                            <Upload accept='image/*'
                                customRequest={
                                    this.customRequest
                                }
                                showUploadList={false}
                                beforeUpload={this.beforeUpload}
                                {...props2}>
                                <Button>
                                    <Icon type="upload" /> Upload
            </Button>
                            </Upload>
                        </div>
                        <div className={styles.imageWrap}

                        >

                            {
                                NewBackImageList.map(ele =>
                                    <div
                                        onMouseEnter={
                                            e => {
                                                this.HoverChange(ele, true)

                                            }
                                        }
                                        onMouseLeave={
                                            e => {
                                                this.HoverChange(ele, false)

                                            }
                                        }
                                        onClick={
                                            e => {
                                                this.ItemClick(ele)
                                            }
                                        }
                                        className={styles.imageItem}
                                        style={{
                                            color: "#fff",
                                            backgroundImage: `url(${config.fileServer}${ele.thumbUrl})`
                                        }}>
                                        {
                                            ele.selected ? <Icon style={{ fontSize: 24, color: '#1890ff', position: 'absolute', left: 0, top: 0 }} type="check-circle" theme="outlined" />
                                                : undefined
                                        }

                                        {
                                            ele.hover ? <Icon style={{ fontSize: 24, color: '#1890ff', position: 'absolute', right: 0, top: 0 }} type="close-circle" theme="outlined" />
                                                : undefined
                                        }
                                    </div>
                                )
                            }

                        </div>
                    </div> : undefined
                }
                <Pagination
                showQuickJumper={true}
                onChange={e => {
                    // alert(e)
                    // this.setState({
                    //     pageIndex: e
                    //})
                    this.props.AttachmentsGetListPaged(e)
                }}
                showSizeChanger={true}

                simple
                pageSize={backImagePage.pageSize}
                current={this.state.pageIndex} total={backImagePage.totalCount} />
            </div>

        )
    }
}
