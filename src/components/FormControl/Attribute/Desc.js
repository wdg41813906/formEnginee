import React from "react";
import { Input } from "antd";
import Attribute from "./Attribute.js";
// 引入编辑器组件
import BraftEditor from "braft-editor";
// 引入编辑器样式
import "braft-editor/dist/index.css";
import "./DescGloabl.less";

@Attribute("描述信息")
class Desc extends React.Component {
    
    constructor(props) {
        super(props);
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
        // this.onContentStateChange = this.onContentStateChange.bind(this);
        
        const { desc } = this.props;
        this.state = {
            contentState: BraftEditor.createEditorState(desc)
        };
    }
    
    // shouldComponentUpdate(nextProps) {
    //     return nextProps.id !== this.props.id;
    // }
    onEditorStateChange(editorState) {
        // console.log('_immutable', editorState)
        // console.log('_map', editorState.getCurrentContent())
        // console.log('json', convertToRaw(editorState.getCurrentContent()))
        // console.log('dom', draftToHtml(convertToRaw(editorState.getCurrentContent())))
        // this.props.onChange({ desc: convertToRaw(editorState.getCurrentContent()) })
    }
    
    onContentStateChange = (contentState) => {
        this.setState({
            contentState
        });
        if (contentState.isEmpty()) {
            this.props.onChange({ desc: "" });
        } else {
            this.props.onChange({ desc: contentState.toHTML() });
        }
        // this.props.onChange({ descHtml: contentState.toHTML() })
    };
    
    render() {
        const { desc } = this.props;
        const { contentState } = this.state;
        return (
            <BraftEditor
                style={{ border: "1px #ccc solid" }}
                controls={["undo", "redo",
                    "font-size", "line-height", "letter-spacing",
                    "text-color", "bold", "italic", "underline", "strike-through",
                    "superscript", "subscript", "remove-styles", "text-indent", "text-align",
                    "list-ul", "list-ol", "blockquote",
                    "link", "hr",
                    "clear"]}
                value={contentState}
                onChange={this.onContentStateChange}
            />
            // <Editor
            //     wrapperClassName="demo-wrapper"
            //     editorClassName="demo-editor"
            //     localization={{
            //         locale: 'zh',
            //     }}
            //     toolbar={{
            //         options: ['inline', 'fontSize', 'textAlign', 'colorPicker', 'link', 'remove', 'history'],
            //         inline: { inDropdown: true },
            //         list: { inDropdown: true },
            //         textAlign: { inDropdown: true },
            //         link: { inDropdown: true, defaultTargetOption: '_blank', },
            //         history: { inDropdown: true },
            
            //     }}
            //     onContentStateChange={this.onContentStateChange}
            //     contentState={this.props.desc}
            // />
        );
    }
}

// export default Desc;
export default {
    Component: Desc,
    getProps: (props) => {
        let { desc, onChange, id } = props;
        return { desc, onChange, id };
    }
};
