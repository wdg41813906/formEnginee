import react from 'react';
import screenfull from 'screenfull'
import LedgerTitle from './LedgerTitle'
import LedgerCompon from './LedgerCompon'
import CardPreview from './CardPreview'
import StringSelectPanle from './../DashboardItem/StringSelectPanle'
export default class LedgerPreview extends react.Component {
    OpenScreenFull = () => {
        if (screenfull.enabled) {
            screenfull.toggle(this.refs.ScreenFullLedgerPreview);
        }
    }
    componentDidMount(){
        this.OpenScreenFull()
    }
    render() {
        const {LedgerTitleProps,LedgerIndexProps,StringSelectPanleProps,CardPreviewProps}=this.props;
        return (<div ref='ScreenFullLedgerPreview' style={{position: 'relative', background: '#fff'}}>

            <LedgerTitle {...LedgerTitleProps} />
            <LedgerCompon {...LedgerIndexProps} />
            <StringSelectPanle {...StringSelectPanleProps} />

            <CardPreview {...CardPreviewProps}></CardPreview>

        </div>)
    }
}