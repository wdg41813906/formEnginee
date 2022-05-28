import react from 'react';
import { is } from 'immutable'
export default class ConfigItemBase extends react.Component{
    shouldComponentUpdate(nextProps, nextState) {

        const thisProps = this.props || {};
        const thisState = this.state || {};
        nextState = nextState || {};
        nextProps = nextProps || {};
    
        // for (const key in nextProps.item) {
        //   if (!is(thisProps.item[key], nextProps.item[key])) {
        //     return true;
        //   }
        // }
        for (const key in nextProps.item.config) {
          if (!is(thisProps.item.config[key], nextProps.item.config[key])) {
            return true;
          }
        }
        for (const key in nextProps.item.config.Title) {
          if (!is(thisProps.item.config.Title[key], nextProps.item.config.Title[key])) {
            return true;
          }
        }
      
    
        return false;
      }
}