
import react from 'react';

import ReportSwitch from './ReportSwitch';
export default class CardPreview extends react.Component {

    render() {
        const { currentReportItem, reportPreviewShow,backgroundImage } = this.props;
        return (
            <div>
                {
                    reportPreviewShow ? <div style={{
                        backgroundImage:backgroundImage,
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right:0,
                        bottom:0,
                        width:'100%',
                        height:"100%",
                        zIndex: 1002
                    }}>
                        <ReportSwitch isDashbord={true} item={currentReportItem} DragSource={currentReportItem.engineeConfig.DragSource} 
                        DragItem={currentReportItem.engineeConfig.DragItem} {...this.props} />
                    </div> : undefined
                }
            </div>
        )
    }
}