import React from 'react';
import { Tooltip, Icon } from 'antd';
import style from '../main.less';

const BlockChecbox = ({ value, onChange, list }) => (
  <div className={style.BlockColor} key={value}>
    {list.map(item => (
      <Tooltip title={item.title} key={item.key}>
        <div className={style.item} style={{background:item.key}} onClick={() => onChange(item.key)}>
          <div
            className={style.selectIcon}
            style={{
              display: value === item.key ? 'block' : 'none',
            }}
          >
            <Icon type="check" />
          </div>
        </div>
      </Tooltip>
    ))}
  </div>
);

export default BlockChecbox;
