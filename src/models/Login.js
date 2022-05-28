import { browserHistory } from 'dva/router'
import com from '../utils/com'
import { parse } from 'qs';
import { Test } from '../services/Login'

export default {
  namespace: 'login',
  state: {},
  subscriptions: {
    sb: function () {
    }
  },
  effects: {
    *LoginOn({ payload,history }, { call, put }) {  // eslint-disable-line
      localStorage.setItem('token','Bearer so55xAzH0le6qAOpivNn2kXI3kI+29V38FvNUPiCzl/+U+mtpGjjCGbvIeQObRNd0wGB+FUWsMOQD0koTiHHivbkyrxhmwRJmUX6ajEW2qNFguLJAYoRvkf1tM0Fxb8O0C/HbM7jSjPXx0+KoM1l5iAnFlyWN+Jgm5yC7+yHWOJ1otuMAUkR0TbYMmnOkN9vK4bJujTO6orsu+qpRozy6hdWrB7FrieQKcNSKiERLzaF4LJsCahRUuGh17mtp72DWzv0gNdwAq8093Xv5U0MkALN+yugczyl4QMywhbSc6Od645G7RshFxYTa5DJawF5P3AO7W5jg/Sdd6HeaoicgcxKROc38bK7/yz4w2CJ1aK4jJV1h162KbvQaGTgEzIPHfowJXk8sv5ewTfGNoO/ZQHFPLvHpYSjWk6D9nIiots=');
      //com.SetCookie('token', payload.username)
      //const { data } = yield call(Test, parse(payload))
      //window.location.assign('/main');
      history.push('/main');
      //    browserHistory.push('/')
      //  yield put({ type: 'appMain/LoginChangeUser',payload });
    },
  },
  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    }
  }
};
