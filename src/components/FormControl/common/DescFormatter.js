import React from "react";
import { Form, Icon } from "antd";


const DescFormatter = ({ descJson, horizontal }) => {
    return (
        descJson ?
            <div style={horizontal ? {} : {
                borderTop: "dashed 1px #979797",
                fontSize: "12px",
                color: "#777",
                display: "flex"
            }}>
                {
                    horizontal ? null : <Icon type="info-circle" style={{
                        padding: "2px",
                        color: "rgb(16, 142, 233)"
                    }}/>
                }
                <span
                    dangerouslySetInnerHTML={{ __html: descJson }}
                />
            </div>
            : null
    );
};
export default DescFormatter;
