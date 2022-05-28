import react from 'react';
import { Button } from 'antd'
import BaseItem from './BaseItem'

export default class SearchButton extends BaseItem {
    render() {
        const { item } = this.props;
        const { config } = item;
        const{title,style}=config
        
        return (
            <Button
            onClick={
                e=>this.props.SearchButtonCall()
            }
            style={{
                height: item.height,
                color: title.textFill,
                fontSize: title.textFontSize,
                fontFamily: title.textFontFamily,
                fontWeight: title.textFontWeight ? 'bold' : 'normal', // 文本粗细
                fontStyle: title.textItalic ? 'italic' : 'normal',//斜体

                background: style.backgroundColor,
                borderColor:style.borderColor,
                borderStyle:style.borderStyle,
                borderRadius:style.borderRadius,
            }} type="primary" block={true}>{title.name}</Button>
        )
    }
}