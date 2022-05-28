import React from 'react';
import { Input } from 'antd';
import Attribute from './Attribute.js'
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState, convertFromRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import immutable from 'immutable'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';



@Attribute('描述信息')
class Desc extends React.Component {
    constructor(props) {
        super(props)
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
        this.onContentStateChange = this.onContentStateChange.bind(this);
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.id !== this.props.id;
    }
    onEditorStateChange(editorState) {
        // console.log('_immutable', editorState)
        // console.log('_map', editorState.getCurrentContent())
        // console.log('json', convertToRaw(editorState.getCurrentContent()))
        // console.log('dom', draftToHtml(convertToRaw(editorState.getCurrentContent())))
        // this.props.onChange({ desc: convertToRaw(editorState.getCurrentContent()) })
    }
    onContentStateChange(contentState) {
        this.props.onChange({ desc: contentState })
    };
    render() {
        return (
            <Editor
                wrapperClassName="demo-wrapper"
                editorClassName="demo-editor"
                localization={{
                    locale: 'zh',
                }}
                toolbar={{
                    // options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
                    options: ['inline', 'fontSize', 'textAlign', 'colorPicker', 'link', 'remove', 'history'],
                    inline: { inDropdown: true },
                    list: { inDropdown: true },
                    textAlign: { inDropdown: true },
                    link: { inDropdown: true, defaultTargetOption: '_blank', },
                    history: { inDropdown: true },
                    // image: { uploadCallback: uploadImageCallBack, alt: { present: true, mandatory: true } },
                }}
                // editorState={this.props.desc}
                // onEditorStateChange={this.onEditorStateChange}
                onContentStateChange={this.onContentStateChange}
                //initialContentState={this.props.desc}
                contentState={this.props.desc}
            />
            // <p>dd</p>
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
