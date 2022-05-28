import dva from 'dva';
import { browserHistory } from 'dva/router';
import './index.css';
import createLoading from 'dva-loading';
import RouterConfig from './router'
Number.prototype.toFixed = function (n) {
    if (n > 20 || n < 0) {
        throw new RangeError('toFixed() digits argument must be between 0 and 20');
    }
    const number = this;
    if (isNaN(number) || number >= Math.pow(10, 21)) {
        return number.toString();
    }
    if (typeof (n) === 'undefined' || n === 0) {
        return (Math.round(number)).toString();
    }
    
    let result = number.toString();
    const arr = result.split('.');
    
    // 整数的情况
    if (arr.length < 2) {
        result += '.';
        for (let i = 0; i < n; i += 1) {
            result += '0';
        }
        return result;
    }
    
    const integer = arr[0];
    const decimal = arr[1];
    if (decimal.length === n) {
        return result;
    }
    if (decimal.length < n) {
        for (let i = 0; i < n - decimal.length; i += 1) {
            result += '0';
        }
        return result;
    }
    result = integer + '.' + decimal.substr(0, n);
    const last = decimal.substr(n, 1);
    
    // 四舍五入，转换为整数再处理，避免浮点数精度的损失
    if (parseInt(last, 10) >= 5) {
        const x = Math.pow(10, n);
        result = (Math.round((parseFloat(result) * x)) + 1) / x;
        result = result.toFixed(n);
    }
    return result;
};



// 1. Initialize
//const app = dva();
const app = dva({
  initialState: {},
  history: browserHistory,
  //initialState: { cache: {} },
  onError(e, dispatch) {
    console.log(e)
  },
  // onReducer: reducer => {
  //   return (state, action) => {
  //     console.log(reducer);
  //     let newState = reducer(state, action);
  //     return { ...newState, cache: true };
  //   };
  // }
});
app.use(createLoading());
// 2. Plugins
// app.use({});

// 3. Model
//app.model(require('./models/Login'));
//app.model(require('./models/Main/Main'));
//app.model(require('./models/Users/User'));
// 4. Router
app.router(RouterConfig);

// 5. Start
app.start('#root');

export default app._store;
