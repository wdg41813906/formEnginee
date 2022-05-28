import React from 'react';
import { is } from 'immutable';

class BaseItem extends React.Component {
    constructor(props, context, updater) {
        super(props, context, updater);
    }

    shouldComponentUpdate(nextProps, nextState) {
        
        const thisProps = this.props || {};
        const thisState = this.state || {};
        nextState = nextState || {};
        nextProps = nextProps || {};
    
        if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
            Object.keys(thisState).length !== Object.keys(nextState).length) {
            return true;
        }
    
      if(nextProps.item.searchData){
          
          if(thisProps.item.searchData.currentField!==
            nextProps.item.searchData.currentField){
              return true;

          }
          if(nextProps.item.searchData.itemField){
        if(thisProps.item.searchData.itemField.defalutValues
            !==nextProps.item.searchData.itemField.defalutValues){
                return true;
            }
        }
        }
        for (const key in nextProps.item) {
            
            if (!is(thisProps.item[key], nextProps.item[key])&&
            !(thisProps.item[key] instanceof Object)) {
                return true;
            }
        }
        for (const key in nextProps.item.config.title) {
            
            if (!is(thisProps.item.config.title[key], nextProps.item.config.title[key])) {
                return true;
            }
        }

        if (!is(thisProps.item.Yopt,nextProps.Yopt)) {
            return true;
        }
        if (!is(thisProps.item.Xopt,nextProps.Xopt)) {
            return true;
        }
        if (!is(thisProps.item.DragSource,nextProps.DragSource)) {
            return true;
        }
        if (!is(thisProps.item.DragItem,nextProps.DragItem)) {
            return true;
        }
        if (!is(thisProps.item.ChartsData,nextProps.ChartsData)) {
            return true;
        }
        
        for (const key in nextProps.item.config.report) {
            
            if (!is(thisProps.item.config.report[key], nextProps.item.config.report[key])) {
                return true;
            }
        }
        for (const key in nextProps.item.config.style) {
            
            if (!is(thisProps.item.config.style[key], nextProps.item.config.style[key])) {
                return true;
            }
        }
        for (const key in nextProps.item.config.xAxis) {
            
            if (!is(thisProps.item.config.xAxis[key], nextProps.item.config.xAxis[key])) {
                return true;
            }
        }
          for (const key in nextProps.item.config.yAxis) {
            
            if (!is(thisProps.item.config.yAxis[key], nextProps.item.config.yAxis[key])) {
                return true;
            }
        }
        for (const key in nextProps.item.config.legend) {
            
            if (!is(thisProps.item.config.legend[key], nextProps.item.config.legend[key])) {
                return true;
            }
        }
        for (const key in nextProps.item.config.label) {
            
            if (!is(thisProps.item.config.label[key], nextProps.item.config.label[key])) {
                return true;
            }
        }
        for (const key in nextState.item) {
            if (!is(thisState.item[key], nextState.item[key])) {
                return true;
            }
        }
        
        return false;
    }
}

export default BaseItem;