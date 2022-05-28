import React, { useState, useEffect } from 'react';
import { Table, Input } from 'antd';
const headerColumn = {
    title: '序号',
    key: 'header',
    dataIndex: 'header',
    fixed: 'left',
    onHeaderCell: () => ({ colType: 'header' }),
    onCell: c => ({ colType: 'header', proxyIndex: c.index })
};

const headerIndexStyle = { padding: 6, width: 80, textAlign: 'center' };
const headerDataStyle = { padding: 6, wordBreak: 'break-all', textAlign: 'center' };
const bodyIndexStyle = { padding: 6, textAlign: 'center', fontSize: '16px', width: 80 };
const bodyDataStyle = { padding: 6, wordBreak: 'break-all' };
const searchStyle = { width: '350px', margin: '5px 0' };


const HeaderWrapper = props => {
    const ref = React.createRef();
    return <thead ref={ref} {...props} />;
};

const HeaderCell = props => {
    let { colType, onResize, sorter, onSort, sortType, onEditClick, celltextalign, ...other } = props;
    switch (colType) {
        case 'header':
            return <th style={headerIndexStyle} {...other}>
                {props.children}
            </th>;
        default:
            return <th style={headerDataStyle} {...other}>
                {props.children}
            </th>;
    }
};

const BodyCell = ({ colType, proxyIndex, value, renderSubItemCell, id, width, ...other }) => {
    switch (colType) {
        case 'formItem':
            return renderSubItemCell({
                id,
                value,
                proxyIndex,
                extraProps: { style: { ...bodyDataStyle, width } }
            });
        case 'header':
            return <td style={bodyIndexStyle} {...other}>
                {proxyIndex + 1}
            </td>;
        default:
            return <td {...other}>{other.children}</td>;
    }
};

const components = { body: { cell: BodyCell }, header: { cell: HeaderCell, wrapper: HeaderWrapper } };

function buildSubFormColumnTree(id, columns) {
    let children = columns.filter(a => a.container === id);
    children.forEach(a => {
        let subChildren = buildSubFormColumnTree(a.key, columns);
        if (subChildren.length > 0)
            a.children = (a.children || []).concat(subChildren);
    });
    return children;
}

function buildSubFormColumn({ columns, rootId, renderSubItemCell }) {
    if (columns.length > 0) {
        columns.forEach(col => {
            if (col.children) {
                col.children.forEach(c => {
                    c.onCell = column => {
                        return {
                            id: c.dataIndex,
                            //width: cellWidth,
                            colType: 'formItem',
                            value: column[c.dataIndex] ? column[c.dataIndex] : null,
                            proxyIndex: column.index,
                            renderSubItemCell,
                        };
                    };
                });
            } else {
                col.onCell = column => {
                    return {
                        id: col.dataIndex,
                        //width: compareWidth ? tempWidth || listWidth / contentCount : tempWidth || col.width,
                        colType: 'formItem',
                        value: column[col.dataIndex] ? column[col.dataIndex] : null,
                        proxyIndex: column.index,
                        renderSubItemCell,
                    };
                };
            }
        });
        return buildSubFormColumnTree(rootId, columns);
    }
    return [];
};

export default function TableView({ modalRef, columns, dataSource, rootId, renderSubItemCell, loading, selectedKeys, setSelectedKeys, relationFilterFields }) {
    const [tableColumns, setTableColumns] = useState([headerColumn]);
    const [tableSource, setTableSource] = useState(dataSource);
    const [pageSize, setPageSize] = useState(20);
    const [searchKey, setSearchKey] = useState(null);
    const rowSelection = {
        selectedRowKeys: selectedKeys,
        fixed: true,
        type: 'radio',
        onChange: setSelectedKeys
    };
    const onRow = record => {
        return {
            onClick: () => {
                setSelectedKeys([record.key])
            }
        }
    }
    useEffect(() => {
        setTableColumns([headerColumn, ...buildSubFormColumn({ columns: columns, rootId, renderSubItemCell })]);
    }, [columns]);
    useEffect(() => {
        if (Array.isArray(dataSource)) {
            if (searchKey && searchKey.toString().trim().length > 0)
                setTableSource(dataSource.filter(a => {
                    for (let key in a) {
                        if (a[key] && a[key].toString().includes(searchKey))
                            return true;
                    }
                    return false;
                }));
            else
                setTableSource(dataSource);
        }
    }, [dataSource, searchKey]);
    useEffect(() => {
        if (modalRef) {
            setPageSize(parseInt((modalRef.parentNode.parentNode.parentNode.clientHeight - 132 - 110 - 42) / 53));
        }
    }, [modalRef]);
    return <React.Fragment>
        <div style={{ textAlign: 'right' }}>
            {relationFilterFields.length === 0 ?
                <Input.Search type='text' placeholder='请输入关键字' enterButton style={searchStyle} onSearch={setSearchKey} /> : null
            }
        </div>
        <Table columns={tableColumns} loading={loading} dataSource={tableSource} components={components} bordered
            pagination={{ pageSize }} rowSelection={rowSelection} scroll={{ x: 'max-content' }} onRow={onRow}>
        </Table>
    </React.Fragment >
}

console.log(1);
setTimeout(function () {
    console.log(2);
    Promise.resolve().then(
        () => {
            console.log(6);
            setTimeout(function () {
                console.log(7);
            }, 0);
        }
    )
}, 0);
Promise.resolve().then(function () {
    console.log(3);
}).then(function () {
    console.log(5)
    setTimeout(function () {
        console.log(4);
    }, 0);
});
