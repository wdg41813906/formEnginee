import react from 'react';
import { Input, Icon, Checkbox, Row, Pagination } from 'antd';
import styles from './StringSelect.less'
import BaseImmutableComponent from '../../BaseImmutableComponent';
import SearchText from './../Operation/Search/SearchText'
const Search = Input.Search;
function onChange(checkedValues) {
    //console.log('checked = ', checkedValues);
}
export default class StringSelectPanle extends react.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageIndex: 1
        }
    }

    render() {

        const { stringSelectPosition } = this.props
        return (
            <div>

                {
                    this.props.stringSelectShow && <div id="cover" style={{
                        position: 'fixed',
                        top: '0',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        zIndex:1000
                    }} onClick={e=> {
                        this.props.StringSelectToggle(false)
                    }} />
                }
                <div
                    className={styles.searchPanle}
                    onMouseLeave={
                        e => {
                            e.stopPropagation()
                            this.props.StringSelectToggle(false)
                        }
                    }
                    onClick={
                        e => {
                            e.stopPropagation()
                        }
                    }
                    style={{
                        display: this.props.stringSelectShow ? 'block' : 'none',
                        width: stringSelectPosition.width,
                        position: 'absolute',
                        left: stringSelectPosition.left,
                        top: stringSelectPosition.top + 70,
                        zIndex: 999999,
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius:5
                    }}>
                    <SearchText {...this.props}  mode="item"/>
 {
     /*
                    <Search
                        placeholder="input search text"
                        onSearch={value => console.log(value)}
                        style={{ width: '100%' }}
                    />
                    <div className={styles.checkBoxWrap}
                        onMouseLeave={
                            e => {
                                e.stopPropagation()

                            }
                        }
                    >
                        <Checkbox> Check all  </Checkbox>
                        <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
                            <Row span={8}><Checkbox value="A">A</Checkbox></Row>
                            <Row span={8}><Checkbox value="B">B</Checkbox></Row>
                            <Row span={8}><Checkbox value="C">C</Checkbox></Row>
                            <Row span={8}><Checkbox value="D">D</Checkbox></Row>
                            <Row span={8}><Checkbox value="E">E</Checkbox></Row>


                        </Checkbox.Group>
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

                    </div>
                        */}
                </div>

            </div>
        )
    }
}
