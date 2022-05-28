import { List, message, Avatar, Spin, Input,Icon } from 'antd';
import styles from './FormSelect.less'
import InfiniteScroll from 'react-infinite-scroller';
import _ from 'underscore';
let layoutFn = function () { }
function getElAbsolute(elem) {
  var t = elem.offsetTop;
  var l = elem.offsetLeft;
  var w = elem.offsetWidth;
  var h = elem.offsetHeight;
  elem = elem.offsetParent;
  while (elem) {
    t += elem.offsetTop;
    l += elem.offsetLeft;
    elem = elem.offsetParent;
  };
  return {
    top: t,
    left: l,
    width: w,
    height: h
  };
}
function getElementViewLeft(element) {
  var actualLeft = element.offsetLeft;
  var current = element.offsetParent;

  while (current !== null) {
    actualLeft += current.offsetLeft;
    current = current.offsetParent;
  }

  if (document.compatMode == "BackCompat") {
    var elementScrollLeft = document.body.scrollLeft;
  } else {
    var elementScrollLeft = document.documentElement.scrollLeft;
  }

  return actualLeft - elementScrollLeft;
}

function getElementScrollTop(element){
  var current = element;
  var top=0;
  while(current){
    if(current.scrollTop>0){
      top=current.scrollTop;
      break;
    }
    current=current.parentElement;
  }
  return top;
}

function getElementViewTop(element) {
  var actualTop = element.offsetTop;
  var current = element.offsetParent;

  while (current !== null) {
    actualTop += current.offsetTop;
    current = current.offsetParent;
  }

  if (document.compatMode == "BackCompat") {
    var elementScrollTop = document.body.scrollTop;
  } else {
    var elementScrollTop = document.documentElement.scrollTop;
  }

  return actualTop - elementScrollTop;
}
export default class FormSelect extends React.Component {
  state = {
    data: [],
    keyword: '',
    showInput: false,
    loading: false,
    hasMore: true,
    isShow: false,
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    fixedLeft: 0,
    fixedTop: 0
  };

  constructor(props) {
    super(props);
    layoutFn = _.debounce(this.setKeyWord, 300)
    this.inputRef = React.createRef();
  }
  componentDidMount() {
    this.props.loadData({
      refresh: false,
       // formTemplateVersionId: payload.formTemplateVersionId,
    })
  }
  handleInfiniteOnLoad = () => {
    const { pagination } = this.props;
    if (!this.props.loading) {
      this.props.loadData && this.props.loadData({
        refresh: false,
        pageIndex: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        formName: this.state.keyword
      })
    }
  };
  showToggle = () => {
    this.setState({
      isShow: !this.state.isShow
    })
  }
  setKeyWord = (val) => {
    this.setState({
      keyword: val
    })
    
      const { pagination } = this.props;
      this.props.loadData && this.props.loadData({
        refresh: true,
        isSearch:true,
        pageIndex: 1,
        pageSize: pagination.pageSize,
        formName: val
      })
    
  }
  render() {
    const { dataSource, pagination, value } = this.props;
    const { showInput } = this.state;

    let fromTem = _.where(dataSource, { formTemplateId: value })[0]
    const text = fromTem ? fromTem.name : "";
    return (<div onMouseLeave={e => {
      this.setState({
        isShow: false,
        showInput: false,

      })
    }}>
      <div onClick={e => {
        var _this = this;
        var pos = getElAbsolute(e.target);
        var scrollTop=getElementScrollTop(e.target);
        this.showToggle();
        this.setState({
          showInput: true,
          fixedLeft: pos.left,
          fixedTop: pos.top + pos.height -scrollTop// e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.scrollTop
        })
        setTimeout(function () { _this.inputRef.current.focus(); }, 100)
      }} className={styles.inputHeader} style={{ width: 200 }}>
        {!showInput && <div onClick={e => { }} className={styles.inputDiv}>{text}</div>}
        {<Input className={`${!showInput ? styles.none : ''}`} ref={this.inputRef} placeholder={text} onChange={e => {
          layoutFn(e.target.value)
        }

        } onClick={e => e.stopPropagation()} style={{ width: 200 }} />}
        {/* <Icon type="up" /> */}
      </div>
      <div style={{ left: this.state.fixedLeft, top: this.state.fixedTop }} className={`${styles.infiniteContainer} ${!this.state.isShow ? styles.none : ''}`}>
        <InfiniteScroll
          initialLoad={false}
          pageStart={0}
          loadMore={this.handleInfiniteOnLoad}
          hasMore={!this.state.loading && this.state.hasMore}
          useWindow={false}
        >
          <ul className={styles.selWrap}>
            {
              dataSource && dataSource.map((item, index) =>
              {
                 if(!item.isHide){
                  return  <li onClick={e => {
                
                    this.showToggle();
                    if(item.formTemplateId===value)return
                    this.props.onChange
                      && this.props.onChange(item.formTemplateId)
                  }} key={`${item.id}${index}`}  className={`${styles.selItem} ${value===item.formTemplateId?styles.selItemSel:''}`}>
                    {item.name}
                  </li>
                 }
              }
               )
            }
            {this.props.loading && this.state.hasMore && (
              <li className={styles.loadingContainer}>
                <Spin />
              </li>
            )}
          </ul>
        </InfiniteScroll>
      </div>
    </div>)
  }
}
