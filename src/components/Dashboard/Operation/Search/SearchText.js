import react from 'react';
import _ from 'underscore';
import {

    Input, Checkbox, Row,
    Pagination
} from 'antd';
import styles from './SearchRight.less'

var lazyLayout;
export default class SearchText extends react.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageIndex: 1
        }
    }
    componentWillMount() {

        //  alert(this.state.pageIndex)

        if(this.props.searchTextList.length==0){
        // var field= _.where(  this.props.currentTable.fields,{code:this.props.currentField.code})
        // this.Search("",this.props.currentTable.table,this.props.currentField.code
        // ,this.props.currentField.primaryKey,this.props.currentField.formType
        // );
    }
        lazyLayout = _.debounce(this.InputSearch, 500);

    }
    InputSearch = (e,tableName,fieldName,GroupField) => {
        this.Search(e,tableName,fieldName,GroupField)
        this.props.ChangeCurrentField({ defalutValues: [] })
    }
    Search = (keys,tableName,fieldName,GroupField,formType) => {

        if (tableName && fieldName&&GroupField) {
            this.props.SearchText({
                pageIndex: 1,
                pageSize: 6,
                GroupField:GroupField,
                tableName: tableName,//this.props.currentTable.id,
                fieldName: fieldName,//this.props.currentField.code,
                searchKey: keys,
                formType
            })
        }
    }
    render() {
        const { currentField,currentTable, searchTextList,mode,currentReportItem } = this.props;

        return (<div>
            <Input.Search placeholder='搜索' onChange={e => {


                lazyLayout(e.target.value,this.props.currentTable.table,this.props.currentField.code,
                    this.props.currentField.primaryKey)
            }} />
            <Checkbox
                checked={currentField.defalutValues ?
                    (currentField.defalutValues.length === searchTextList.length) : false}
                onChange={
                    e => {
                        var arr = [];

                        if (e.target.checked) {
                            arr = searchTextList;
                        }
                        this.props.ChangeCurrentField({ defalutValues: arr })
                        if(mode==='item'){

                            this.props.StringSelectField({ defalutValues: arr })

                        }
                    }

                }
            >全选</Checkbox>
            <Checkbox.Group style={{ width: '100%' }}
                value={mode==='item'?(currentReportItem.searchData?currentReportItem
                    .searchData.itemField.defalutValues
                :[])

                :currentField.defalutValues}
                onChange={e =>{
                    this.props.ChangeCurrentField({ defalutValues: e })
                    if(mode==='item'){

                        this.props.StringSelectField({ defalutValues: e })

                    }

                }
            }
                >
                {
                    searchTextList.map(item =>
                        <Row span={8}><Checkbox value={item}>{item}</Checkbox></Row>)
                }




            </Checkbox.Group>
            <div className={styles.footer}>
                { /*
                <Pagination
                    showQuickJumper={true}
                    onChange={e => {
                        alert(e)
                        this.setState({
                            pageIndex: e
                        })
                    }}
                    showSizeChanger={true}
                    onShowSizeChange={e => { alert(e) }}
                    simple
                    pageSize={5}
                    current={this.state.pageIndex} total={50} />

                */}
            </div>


        </div>)

    }
}