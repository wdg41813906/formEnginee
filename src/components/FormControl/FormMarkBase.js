/**
 * @file src/components/FormControl/FormMarkBase.js
 * @author: fanty
 *
 * 无值占位符基类
 */
import React from 'react'
import FormBase from './FormBase';
import styles from './FormMarkBase.less';


function FormMarkBase(Wrapper) {
    class MarkItem extends React.Component {
        render(){
            const { itemBase, delegateAttr, dataLinker, id, mode, onChange, renderStyle, containerMode, ...other } = this.props;
            let common = {
                mode,
                id,
                onChange, ...(delegateAttr ? delegateAttr.toJS() : {}),
                ...other
            };
            let itemBaseJs = itemBase.toJS();
            return (
                <div className={styles.container}>
                    <Wrapper {...common} {...itemBaseJs} />
                </div>
            )
        }
    }
    return FormBase(MarkItem)
}

export default FormMarkBase

export const formMarkBaseInitialEvent = {
    buildSubTableHeaderBase: (props) => {
        return null
    }
}
