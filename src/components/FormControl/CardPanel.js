import React from 'react';
import com from '../../utils/com';
import FORM_CONTROLLIST_GROUP from '../../enums/FormControlListGroup';
import Title from '../../components/FormControl/Attribute/Title.js';
import OperationPower from '../../components/FormControl/Attribute/OperationPower.js';
import FormControlType from '../../enums/FormControlType';
import CollapseCom from './Collapse/CollapseCom';
import RENDERSTYLE from '../../enums/FormRenderStyle';

//容器属性初始化
function initFormItemBase() {
    let formContainerBase = com.formContainerBase();
    formContainerBase = {
        ...formContainerBase,
        type: "CardPanel",
        typeName: "卡片容器",
        name: "卡片容器",//标题
        // formId: com.Guid()
        configHeader: false
    }
    return formContainerBase;
}

class CardPanelMiddle extends React.PureComponent {
    render() {
        const { name, panelBody, select, renderStyle, collapse, allCollapseToggle, onChange } = this.props;
        return <CollapseCom
            border
            collapse={collapse}
            title={name}
            allCollapseToggle={allCollapseToggle}
            hasChildren={panelBody ? panelBody.length > 0 ? true : false : false}
            onChange={onChange}
            formLayout={this.props.formLayout}
            renderStyle={renderStyle}
            selecting={renderStyle == RENDERSTYLE.Design ? select : false}>
            {this.props.renderChildren(panelBody)}
        </CollapseCom>;
    }
}

class CardPanel extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        const { mode } = this.props;
        //console.log('card-render', this.props, isRootContainer);
        switch (mode) {
            case 'tableHeader':
                return <div style={{ textAlign: this.props.headerAlign || 'center' }}>{this.props.name}</div>;
            case 'form':
                return <CardPanelMiddle {...this.props} />
            case 'option':
                return (
                    <React.Fragment>
                        <Title.Component {...Title.getProps(this.props)} />
                        <OperationPower showEdiable={false} {...this.props} />
                    </React.Fragment>)
        }
    }
}

export default {
    itemType: "Card",//卡片容器
    formControlType: FormControlType.Container,
    name: "卡片容器",
    ico: 'credit-card',
    group: FORM_CONTROLLIST_GROUP.Normal,//分组
    Component: CardPanel,
    initFormItemBase,
    valueType: 'container',
    dropItemValueTypes: ['string', 'number', 'external', 'group', 'boolean', 'array', 'datetime', 'subForm', 'mark', 'container'],//允许拖拽放入的控件值类型集合
};
