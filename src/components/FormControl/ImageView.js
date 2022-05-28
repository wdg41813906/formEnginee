import React from "react";
import { Input, Tooltip, Modal, Button, Icon } from "antd";
import style from "./SingleText.less";
import com from "../../utils/com";
import FORM_CONTROLLIST_GROUP from "../../enums/FormControlListGroup";
import Title from "../../components/FormControl/Attribute/Title";
import Desc from "../../components/FormControl/Attribute/Desc";
import Position from "../../components/FormControl/Attribute/PositionStyle";
import FormControlType from "../../enums/FormControlType";

function initFormItemBase() {
    let formItemBase = com.formItemBase();
    formItemBase.type = "ImageView";
    formItemBase.typeName = "影像查看";
    formItemBase.name = "影像查看";//标题
    formItemBase.isRepeat = false; //是否允许有重复值
    return formItemBase;
}


class AntDraggableModal extends React.Component {
    constructor(props) {
        super(props);
        this.header = "";
        this.contain = "";
        this.modalContent = "";
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.sumX = 0;
        this.sumY = 0;
        this.simpleClass = Math.random()
            .toString(36)
            .substring(2);
    }
    
    handleMove = (event) => {
        const deltaX = event.pageX - this.mouseDownX;
        const deltaY = event.pageY - this.mouseDownY;
        
        this.deltaX = deltaX;
        this.deltaY = deltaY;
        
        this.modalContent.style.transform = `translate(${deltaX + this.sumX}px, ${deltaY + this.sumY}px)`;
    };
    
    initialEvent = (visible) => {
        const { title } = this.props;
        if (title && visible) {
            setTimeout(() => {
                window.removeEventListener("mouseup", this.removeUp, false);
                
                this.contain = document.getElementsByClassName(this.simpleClass)[0];
                this.header = this.contain.getElementsByClassName("ant-modal-header")[0];
                this.modalContent = this.contain.getElementsByClassName("ant-modal-content")[0];
                
                this.header.style.cursor = "all-scroll";
                debugger;
                this.header.onmousedown = (e) => {
                    this.mouseDownX = e.pageX;
                    this.mouseDownY = e.pageY;
                    document.body.onselectstart = () => false;
                    window.addEventListener("mousemove", this.handleMove, false);
                };
                
                window.addEventListener("mouseup", this.removeUp, false);
            }, 0);
        }
    };
    
    removeMove = () => {
        window.removeEventListener("mousemove", this.handleMove, false);
    };
    
    removeUp = () => {
        document.body.onselectstart = () => true;
        
        this.sumX = this.sumX + this.deltaX;
        this.sumY = this.sumY + this.deltaY;
        
        this.removeMove();
    };
    
    componentDidMount() {
        const { visible = false } = this.props;
        this.initialEvent(visible);
    }
    
    componentWillUnmount() {
        this.removeMove();
        window.removeEventListener("mouseup", this.removeUp, false);
    }
    
    render() {
        const { children, wrapClassName, ...other } = this.props;
        console.log(other);
        const wrapModalClassName = wrapClassName ? `${wrapClassName} ${this.simpleClass}` : `${this.simpleClass}`;
        return (
            <Modal
                {...other}
                wrapClassName={wrapModalClassName}
            >{children}</Modal>
        );
    }
}


class ImageViewFrom extends React.PureComponent {
    render() {
        const { value } = this.props;
        return <Tooltip title={value} overlayClassName={style.tip} mouseEnterDelay={1}>
            <Input style={{ width: "100%", height: "30px" }} value='影像查看'
                   disabled={true}
            />
        </Tooltip>;
    }
}

const toFixed = (num, n = 2) => {
    num = Number(num);
    if (num < 0) {
        num = -num;
    } else {
        return parseInt(((num * (Math.pow(10, n))) + 0.5), 10) / Math.pow(10, n);
    }
    return -(parseInt(((num * (Math.pow(10, n))) + 0.5), 10) / Math.pow(10, n));
};

class ImageView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            imageStatus: "影像加载中....",
            iconType: "loading",
            scale: 1,
            left: 0,
            top: 0,
            validAdd: false
        };
        this.area = React.createRef();
        this.img = React.createRef();
    }
    
    add = (num1, num2) => {
        num1 = Number(num1);
        num2 = Number(num2);
        let r1, r2, m;
        try {
            r1 = `${num1}`.split(".")[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = `${num2}`.split(".")[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        return Math.round(num1 * m + num2 * m) / m;
    };
    sub = (num1, num2) => {
        num1 = Number(num1);
        num2 = Number(num2);
        let r1, r2, m, n;
        try {
            r1 = `${num1}`.split(".")[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = `${num2}`.split(".")[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        n = (r1 >= r2) ? r1 : r2;
        return toFixed((Math.round(num1 * m - num2 * m) / m), n);
    };
    setOffset = () => {
        if (this.state.deg / 90 % 2 !== 0) {
            const zoomLeft = this.img.current.clientWidth * this.state.scale;
            const zoomTop = this.img.current.clientHeight * this.state.scale;
            const w = zoomTop - this.area.current.clientWidth;
            const h = zoomLeft - this.area.current.clientHeight;
            this.setState({
                left: w > 0 ? w / 2 : 0,
                top: h > 0 ? h / 2 : 0
            });
        } else {
            if (this.state.scale > 1) {
                const zoomLeft = this.img.current.clientWidth * this.state.scale;
                const zoomTop = this.img.current.clientHeight * this.state.scale;
                const w = zoomLeft - this.area.current.clientWidth;
                const h = zoomTop - this.area.current.clientHeight;
                this.setState({
                    left: w > 0 ? w / 2 : 0,
                    top: h > 0 ? h / 2 : 0
                });
            } else {
                this.setState({
                    left: 0,
                    top: 0
                });
            }
        }
    };
    
    rotate = () => {
        let deg = this.state.deg;
        if (deg >= 360)
            deg = 0;
        else
            deg += 90;
        this.setState({ deg });
    };
    plus = () => {
        this.setState((state) => ({
            scale: state.scale === 3 ? 3 : this.add(state.scale, 0.2)
        }), this.setOffset);
    };
    
    minus = () => {
        this.setState((state) => ({
            scale: state.scale === 0.4 ? 0.4 : this.sub(state.scale, 0.2)
        }), this.setOffset);
    };
    
    
    loadImg = DocumentId => {
        if (DocumentId) {
            this.setState({
                imgVisible: true,
                deg: 0,
                //imgSrc: "http://a0.att.hudong.com/64/76/20300001349415131407760417677.jpg"
                imgSrc: `${config.systemImage}/api/LoadTempImage?TId=${DocumentId}`
            });
        } else {
            this.setState({
                imgVisible: true,
                iconType: "close-circle",
                validAdd: false,
                imageStatus: "暂无影像信息..."
            });
        }
        
    };
    handleImageLoaded = () => {
        this.setState({
            imageStatus: "",
            iconType: "",
            validAdd: true
        });
    };
    handleImageErrored = () => {
        this.setState({
            imageStatus: "影像加载失败...",
            iconType: "warning",
            validAdd: false
        });
    };
    
    
    render() {
        let { mode, value } = this.props;
        switch (mode) {
            case "table":
            case "form":
                return <ImageViewFrom {...this.props} />;
            case "cell":
                return <div>
                <span style={{ color: "#1990ff", cursor: "pointer" }}
                      onClick={() => this.loadImg(value ? JSON.parse(value)[0] : null)}>查看影像</span>
                    {
                        this.state.imgVisible ? <AntDraggableModal
                            onCancel={() => {
                                this.setState({ imgVisible: false });
                            }}
                            width={720}
                            visible={this.state.imgVisible}
                            footer={false}
                            title="查看影像"
                            destroyOnClose
                            bodyStyle={{
                                textAlign: "center",
                                position: "relative",
                                overflow: "hidden",
                                padding: "20px",
                                minHeight: 40
                            }}
                            style={{ top: 50 }}
                        >
                            
                            <div style={{ overflow: "scroll" }}>
                                <a href={this.state.imgSrc} target='_blank'>
                                    <div ref={this.area}
                                         style={{ top: this.state.top, left: this.state.left, position: "relative" }}>
                                        <img style={{
                                            transform: `rotate(${this.state.deg}deg) scale(${this.state.scale})`,
                                            display: "block", maxWidth: "100%"
                                        }} src={this.state.imgSrc} alt="" ref={this.img}
                                             onLoad={this.handleImageLoaded}
                                             onError={this.handleImageErrored}
                                        />
                                    </div>
                                    {/*{this.state.imageStatus}*/}
                                    <div style={{ textAlign: "center" }}>
                                        <div>
                                            {
                                                this.state.iconType ?
                                                    <Icon type={this.state.iconType}
                                                          style={{ fontSize: "42px" }}/> : null
                                            }
                                        
                                        </div>
                                        <div style={{ padding: "12px" }}>
                                            {this.state.imageStatus}
                                        </div>
                                    </div>
                                </a>
                            
                            </div>
                            {
                                this.state.validAdd ?
                                    <div>
                                        <Button type='primary'
                                                style={{ position: "absolute", bottom: "5px", right: "95px" }}
                                                title='放大'
                                                onClick={this.plus} icon='plus'/>
                                        <Button type='primary'
                                                style={{ position: "absolute", bottom: "5px", right: "50px" }}
                                                title='缩小'
                                                onClick={this.minus} icon='minus'/>
                                        <Button type='primary'
                                                style={{ position: "absolute", bottom: "5px", right: "5px" }}
                                                title='旋转'
                                                onClick={this.rotate} icon='redo'/>
                                    </div> : null
                            }
                        </AntDraggableModal> : null
                    }
                </div>;
            case "option":
                return <React.Fragment>
                    <Title.Component {...Title.getProps(this.props)} />
                    <Position.Component {...Position.getProps(this.props)} />
                    <Desc.Component {...Desc.getProps(this.props)} />
                </React.Fragment>;
        }
    }
}

export default {
    itemType: "ImageView",
    formControlType: FormControlType.Item,
    name: "影像查看",
    ico: "link",
    group: FORM_CONTROLLIST_GROUP.Normal,//分组
    Component: ImageView,
    valueType: "string",
    initFormItemBase
};
