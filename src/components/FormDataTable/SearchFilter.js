import { Select, Button, Icon } from 'antd';
import styles from './SearchFilter.less';
import { Com } from '../../utils';
import { AdvancedSearch } from '../../components'

function SearchFilter(props) {
    return (
        <div className={styles.container}>
            {props.formTemplateType === '1' ? (
                <Select
                    className={styles.proSelect}
                    onChange={props.addProcedureState}
                    dropdownMatchSelectWidth={false}
                    defaultValue={'请选择流程状态'}
                >
                    {Com.proList.map(item => (
                        <Select.Option key={item.name} value={item.type}>{item.name}</Select.Option>
                    ))}
                </Select>
            ) : null}
            {
                props.filterShowList.toJS().length !== 0 ?
                    <div
                        className={`${styles.search} ${props.showSearch ? styles.searchIconActive : ''}`}
                        onClick={() => props.setShowSearch(!props.showSearch)}
                    >
                        <Icon type={props.showSearch ? 'down' : 'up'} className={styles.searchIcon} />
                        <span>高级搜索</span>
                    </div> : null
            }
            {
                props.deleteStatus ? (
                    <span>
                        <Button disabled={props.deleteArr.length === 0} type="danger" className={styles.opr} onClick={props.deleteOperation}>删除选中</Button>
                    </span>
                ) : null
            }
            {props.showSearch ?
                <AdvancedSearch
                    filterSearchValue={props.filterSearchValue.toJS()}
                    dataFilter={props.dataFilter.toJS()}
                    filterShowList={props.filterShowList.toJS()}
                    showFields={props.showFields}
                    addFilterSearchValue={props.addFilterSearchValue}
                    pageSize={props.pageSize}
                    pageIndex={props.pageIndex}
                /> : null
            }
        </div>
    );
}

export default SearchFilter;
