const curry = fn => (...params) =>
    fn.length === params.length ?
    fn(...params) :
    (...resetParams) => curry(fn)(...params.concat(resetParams));

const compose = (...fns) => (...params) =>
    fns.reduce((acc, fn) => acc(fn(...params)));

const prop = curry((key, obj) => obj[key]);

// not :: boolean -> boolean
const not = val => !val;

const equals = curry((x, y) => x === y);

//  fmap :: Functor f => (a -> b) -> f a -> f b
const fmap = curry((f, functor) => functor.map(f));

const id = val => val;

const F = _ => false;

const T =_ => true;

const either = curry((f, g) => (...args) => f(...args) || g(...args));

const isEmpty = x => x === undefined || x === null;

const always = curry((x, _) => x);

const createExportInfo = curry((getProps, Component) => {
    return {
        Component,
        // 过滤父级解构传递props
        getProps,
    }
});

const tap = ((fn, x) => {
    fn(x)
    return x
});

// const find = (idx, list) => 


// const placeholderHof = curry((fn, ...args) => {
//     const ownPlaceholder = find({'@@functional/placeholder': true}, args)
    
// })

// const __ = ({'@@functional/placeholder': true});

// const decrease = curry((x, y) => x - y);

const head = list => list[0];

const last = list => list[compose(
    decrease(1),
    props('length')
)(list)];

// const reduce = (reducer, acc, list) => {
    
// }

// const cond = curry((predList, data) => {
//     predList.reduce((acc, params) => {
//         const [
//             predFn,
//             transFn,
//         ] = params
        
//         if(predFn(data)) {
//             return transFn(data)
//         }

//         return 
//     }, [])
// });

class Container {
    static of(val) {
        const Child = this;
        
        return new Child(val);
    }

    constructor(value) {
        this._value = value;
    }
};

class Maybe extends Container {
    isNothing = (val = this._value) => (val === null) || (val === undefined)

    map = fn => this.isNothing() ?
        Maybe.of(null) :
        compose(Maybe.of, fn)(this._value)
};

// oppose
class Left extends Container {
    map = fn => this
}

// soft
class Right extends Container {
    map = Right.of
}

class Either extends Container {
    
}

class IO extends Container {
    // this._value is function type
    map = fn => IO.of(compose(fn, this._value))
}

// maybe :: b -> (a -> b) -> Maybe a -> b
const maybe = curry((x, f, m) => m.isNothing() ?
    x :
    f(m._value));

// const either = curry((f, g, e) => )

export default {
    curry,
    compose,
    isEmpty,
    prop,
    not,
    id,
    always,
    T,
    F,
    either,
    createExportInfo,
    maybe,
    equals,
    tap,
    Maybe,
    IO,
}
