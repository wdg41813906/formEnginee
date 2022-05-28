import React from 'react';
import { Tabs, Icon } from 'antd';
import com from '../../utils/com';
import FORM_CONTROLLIST_GROUP from '../../enums/FormControlListGroup';
import TabItems from '../../components/FormControl/Attribute/TabItems';
import OperationPower from '../../components/FormControl/Attribute/OperationPower';
import FORMSTATUS from '../../enums/FormStatus';
import RENDERSTYLE from '../../enums/FormRenderStyle';
import FormControlType from '../../enums/FormControlType';
import styles from './TabPanel.less'


const TabPane = Tabs.TabPane;

function initFormItemBase() {
    let formContainerBase = com.formContainerBase();
    formContainerBase = {
        ...formContainerBase,
        type: "TabPanel",
        typeName: "标签容器",
        name: "标签容器",//标题
        configHeader: false,
        tabItems: [
            { title: '标签页1', child: [], formId: com.Guid(), status: FORMSTATUS.Add },
            { title: '标签页2', child: [], formId: com.Guid(), status: FORMSTATUS.Add }
        ],
    }
    formContainerBase.activeKey = formContainerBase.tabItems[0].formId;
    return formContainerBase;
}

class TabPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.setActiveKey = this.setActiveKey.bind(this);
    }
    setActiveKey = (activeKey) => {
        if (this.props.renderStyle != RENDERSTYLE.Design)
            return;
        this.props.onChange({ activeKey });
    }
    render() {
        //console.log('Tab-render', this.props)
        let { mode, tabItems, activeKey, panelBody, renderStyle, select, collapse, onChange } = this.props;
        //console.log('card-render', this.props, isRootContainer);
        let collapseState = collapse;
        const showTabItems = tabItems.filter(a => a.status != FORMSTATUS.Delete);
        switch (mode) {
            case 'tableHeader':
                return this.props.tabItems.find(a => a.formId === this.props.groupId).title;
            case 'form':
                const preview = (renderStyle != RENDERSTYLE.Design) ? {} : { activeKey, onChange: this.setActiveKey };
                return (
                    <Tabs
                        type="card" {...preview}
                        style={{ border: '1px solid #eee', borderRadius: 8, }}
                        className={select ? 'tabSelecting' : ''}
                        tabBarExtraContent={
                            <Icon
                                onClick={e => { onChange({ collapse: !collapseState }) }}
                                className={styles.collapseIcon}
                                type={collapse ? 'down' : 'left'}
                            />
                        }
                    >
                        {
                            showTabItems.map((tabItem, i) =>
                                <TabPane tab={tabItem.title} key={tabItem.formId} style={{ padding: '10px' }}>
                                    <div className={`${styles.tabContent} ${collapse ? styles.show : styles.none}`}>
                                        {this.props.renderChildren(panelBody.filter(a => tabItem.child.indexOf(a.id) > -1))}
                                    </div>
                                </TabPane>)
                        }
                    </Tabs>
                )
            case 'option':
                return (
                    <React.Fragment>
                        <TabItems.Component {...TabItems.getProps(this.props)} />
                        <OperationPower showEdiable={false} {...this.props} />
                    </React.Fragment>)
            default:
                return <div>控件加载失败</div>;
        }
    }
}
export default {
    itemType: "Tab",//标签容器
    formControlType: FormControlType.Container,
    name: "标签容器",
    ico: 'folder',
    group: FORM_CONTROLLIST_GROUP.Normal,//分组
    Component: TabPanel,
    initFormItemBase,
    valueType: 'container',
    dropItemValueTypes: ['string', 'number', 'external', 'group', 'boolean', 'array', 'datetime', 'subForm', 'mark', 'container'],//允许拖拽放入的控件值类型集合
    event: {
        buildSubTableHeader: (props) => {
            let { id, container, cusWidValue } = props;
            return props.tabItems.map((item, index) => ({
                title: item.title,
                key: item.formId,
                groupId: id,
                //width: cusWidValue,
                container,
                children: []
            }));
        },
        getGoupIds(props) {
            return props.tabItems.map(a => a.formId);
        },
        onAddItem: ({ itemBase, containerBase }) => {
            let { activeKey, groupId, tabItems } = containerBase;
            let { id } = itemBase;
            tabItems.find(e => e.formId == (groupId || activeKey)).child.push(id);
            return { containerBase: { tabItems }, itemBase: { groupId: groupId || activeKey } };
        },
        onRemoveItem: ({ itemBase, containerBase }) => {
            let { activeKey, groupId, tabItems } = containerBase;
            let { id } = itemBase;
            let currentChild = tabItems.find(e => e.formId == (groupId || activeKey)).child;
            currentChild.forEach((e, i) => {
                if (e == id) {
                    currentChild.splice(i, 1)
                }
            });
            console.log('onRemove!')
            return { containerBase: { tabItems }, itemBase: { groupId: null } };
        }
    }
};
