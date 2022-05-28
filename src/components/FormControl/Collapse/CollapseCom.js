import react from 'react';
import { Icon } from 'antd';
import styles from './Collapse.less'
import FORM_RENDER_STYLE from '../../../enums/FormRenderStyle';

export default class CollapseCom extends react.Component {
    constructor(props) {
        super(props)
        this.state = {
            BODY_height: 0,
        }
        this.BODY = React.createRef();
        this.handleClick = this.handleClick.bind(this);
    }
    
    componentDidUpdate() {
        let height = this.BODY.current.clientHeight;
        if (height != this.state.BODY_height) {
            this.setState({ BODY_height: height })
        }
    }
    handleClick() {
        if (this.props.hasChildren) {
            this.props.onChange({
                collapse: !this.props.collapse
            })
        }
    }
    
    render() {
        //console.log('collapseCom-render', this.props)
        const { collapse, hasChildren, selecting, custom, children, onDragLeave, descRender, renderStyle } = this.props;
        let { BODY_height } = this.state;
        return <div onDragLeave={onDragLeave}
                    className={`${styles.collapseWrap} ${selecting ? styles.selecting : ''} ${custom ? styles.custom : ""}`}
                    style={{ backgroundColor: renderStyle === FORM_RENDER_STYLE.Design ? 'transparent' : null }}>
            <div
                className={`${styles.collapseHeader}`}>
                {this.props.title}
                {descRender && descRender()}
                <Icon className={`${styles.collapseIcon} ${collapse ? styles.show : styles.none}`}
                      type={'down'} onClick={this.handleClick} />
            </div>
            <div ref={this.BODY}
                 className={`
                    ${styles.collapseBody}
                    ${collapse ? styles.show : styles.none}
                    ${styles.border}
                    `}
                 style={{
                     // maxHeight: BODY_height == 0 ? 'auto' : BODY_height + 200 + 'px',
                     minHeight: hasChildren ? 0 : '80px',
                     display: this.props.formLayout != 1 ? 'flex' : ''
                 }}>
                {children}
            </div>
        </div>;
    }
}
