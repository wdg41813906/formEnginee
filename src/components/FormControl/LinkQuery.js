import React from 'react';
import com from '../../utils/com';
import FORM_CONTROLLIST_GROUP from '../../enums/FormControlListGroup';
import Title from './Attribute/Title';
import OperationPower from '../../components/FormControl/Attribute/OperationPower';
import Relation from './Attribute/RelationTable';
import FormControlType from '../../enums/FormControlType';
import CollapseCom from './Collapse/CollapseCom'
import RENDERSTYLE from '../../enums/FormRenderStyle';

//容器属性初始化
function initFormItemBase() {
    let formContainerBase = com.formContainerBase();
    formContainerBase = {
        ...formContainerBase,
        type: "LinkQuery",
        typeName: "关联查询",
        name: "关联查询",//标题
        autoFill: true
        // formId: com.Guid()
    }
    return formContainerBase;
}
class LinkQueryMiddle extends React.PureComponent {
    render() {
        const { name, extra, panelBody, select, renderStyle } = this.props;
        return <CollapseCom border collapse={this.props.collapse}
            selecting={renderStyle == RENDERSTYLE.Design ? select : false}
            renderStyle={renderStyle} title={name}
            hasChildren={panelBody ? panelBody.length > 0 ? true : false : false}
            allCollapseToggle={this.props.allCollapseToggle}
            extra={extra} formLayout={this.props.formLayout}
            onChange={this.props.onChange} bordered={false} type='inner'>
            {this.props.renderItems(panelBody)}
        </CollapseCom>;
    }
}

class LinkQuery extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        const { mode, ...other } = this.props;
        switch (mode) {
            case 'tableHeader':
                return this.props.name;
            case 'table':
            case 'form':
                return <LinkQueryMiddle {...other} />
            case 'option':
                return <React.Fragment>
                    <Title.Component {...Title.getProps(this.props)} />
                    <Relation {...other} />
                    <OperationPower showEdiable={false} {...this.props} />
                </React.Fragment>;
        }
    }
}
export default {
    itemType: "LinkQuery",//关联查询
    formControlType: FormControlType.External,
    name: "关联查询",
    ico: 'credit-card',
    group: FORM_CONTROLLIST_GROUP.Advanced,//分组
    Component: LinkQuery,
    initFormItemBase,
    valueType: "external",
    noMappad: true
};
