import React, { useCallback } from 'react';
import { Switch } from 'antd';

import { Fn } from '../../../utils'
import Attribute from './Attribute.js';

const {
    createExportInfo: curryedCreateExportInfo,
    compose,
    maybe,
    Maybe,
    id,
} = Fn

const getProps = props => ({
    onChange,
    unfoldNodeChecked: maybe(
        false, 
        id, 
        Maybe.of(props.unfoldNodeChecked)
    ),
});

const UnfoldNode = props => {
    return (<div>
        <Switch 
            onChange={useCallback(
                checked => {
                    return props.onChange({ unfoldNodeChecked: checked })
                },
                [])}
            checked={props.unfoldNodeChecked}
        />
    </div>);
};

const configPipe = compose(
    curryedCreateExportInfo(getProps),
    Attribute('展开所有节点'),
);

export default configPipe(UnfoldNode);
