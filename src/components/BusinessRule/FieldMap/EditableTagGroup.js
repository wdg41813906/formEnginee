import { Tag, Input, Tooltip, Icon  } from 'antd';
import styles from './EditableTagGroup.less'
import './tag.less';
class EditableTagGroup extends React.Component {
  state = {
    tags: [],
    inputVisible: false,
    inputValue: '',
  };
  constructor(props){
    super(props);
   // this.myTag=React.createRef();
  }
  
  handleClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag !== removedTag);
    this.setState({ tags });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  inputKeyDown=(e)=>{
    //keycode为8表示退格键
    if(e.keyCode===8){
        if(!this.inputValue){
          let { tags } = this.state;
          tags=tags.filter((e,i)=>{return i!==tags.length-1})
          this.setState({
            tags
          })
          this.props.onChange&&this.props.onChange(this.state.tags)
        }
    }
  }
  handleInputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags } = this.state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: '',
    });
    this.props.onChange&&this.props.onChange(this.state.tags)
  };

  saveInputRef = input => (this.input = input);

  render() {
    const { tags, inputVisible, inputValue } = this.state;
    return (
      <div className={styles.tagWrap}>
        <div className={styles.tagContent}>
          <div ref={input => this.myTag = input} className={styles.tagPos} style={{left:`-${(tags.length-2)*66}px`}}>
            {tags.map((tag, index) => {
              const isLongTag = tag.length > 20;
              const tagElem = (
                <Tooltip title={tag}>
                <Tag style={{width:58,overflow:'hidden'}} key={tag} >
                 {tag}
                </Tag></Tooltip>
              );
              return tagElem
            })}
          </div>
        </div>
        <div>
        <Input
        placeholder='添加筛选值'
        
              ref={this.saveInputRef}
              type="text"
              size="small"
              style={{ width: 100, height: 30 }}
              value={inputValue}
              onKeyDown={this.inputKeyDown}
              onChange={this.handleInputChange}
              onBlur={this.handleInputConfirm}
              onPressEnter={this.handleInputConfirm}
            />
          {/* {inputVisible && (
            <Input
              ref={this.saveInputRef}
              type="text"
              size="small"
              style={{ width: 78, height: 30 }}
              value={inputValue}
              onChange={this.handleInputChange}
              onBlur={this.handleInputConfirm}
              onPressEnter={this.handleInputConfirm}
            />
          )}
          {!inputVisible && (
            <Tag onClick={this.showInput} style={{width:78, background: '#fff', borderStyle: 'dashed' }}>
              添加筛选值
            </Tag>
          )} */}
        </div>
      </div>
    );
  }
}

export default EditableTagGroup;
