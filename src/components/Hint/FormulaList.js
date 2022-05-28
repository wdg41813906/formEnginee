import com, { IsGuid } from "../../utils/com";
import { FromulacalSystemDate, FormulaCal } from "../../services/FormBuilder/FormBuilder";
import Big from "big.js";
import { resultValueType } from "./Formulas";
import moment from "moment";

function parseNumberToOther(valueType, num) {
    switch (valueType) {
        case "number":
            return num;
        case "string":
            return num.toString();
        case "boolean":
            return num !== 0;
    }
}

function parseStringToOther(valueType, str) {
    switch (valueType) {
        case "number":
            let num = (new Number(str)).valueOf();
            return isNaN(num) ? 0 : num;
        case "string":
            return str;
        case "boolean":
            str = str.trim().toLocaleLowerCase();
            let n = (new Number(str)).valueOf();
            if (!isNaN(n))
                return n !== 0;
            else if (str === "true")
                return true;
            return false;
    }
}

function parseBooleanToOther(valueType, bool) {
    switch (valueType) {
        case "number":
            return bool ? 1 : 0;
        case "string":
            return bool.toString();
        case "boolean":
            return bool;
    }
}

function parseEmptyToOther(valueType) {
    switch (valueType) {
        case "number":
            return null;
        case "string":
            return null;
        case "boolean":
            return false;
    }
}

export function getValueTypeVal(valueType, value) {
    switch (typeof value) {
        case "number":
            return parseNumberToOther(valueType, value);
        case "boolean":
            return parseBooleanToOther(valueType, value);
        case "string":
            return parseStringToOther(valueType, value);
        case "object":
        case "undefined":
            return parseEmptyToOther(valueType);
        default:
            return "";
    }
}

function buildFormulaParams(args, ignoreValueType = false) {
    let params = [];
    if (Array.isArray(args)) {
        if (ignoreValueType)
            return args;
        for (let i = 0, j = args.length; i < j; i++) {
            let arg = args[i];
            if (!SiJia.isEmpty(arg)) {
                if (Array.isArray(arg))
                    params = params.concat(buildFormulaParams(arg));
                else
                    params.push(arg);
            }
        }
        let valueTypeParams = [];
        params.forEach(a => {
            valueTypeParams.push(getValueTypeVal(resultValueType, a));
        });
        return valueTypeParams;
    }
    return ignoreValueType ? [args] : [getValueTypeVal(resultValueType, args)];
}

let SiJia = {
    isNull: function(t) {
        return null === t;
    },
    isDate: function(t) {
        return t instanceof Date;
    },
    isString: function(t) {
        return "string" == typeof t;
    },
    flatten: function(t, e, i) {
        if (i || (i = []), t)
            for (var a = 0, s = t.length; a < s; a++) {
                var n = t[a];
                Array.isArray(n) ? SiJia.flatten(n, e, i) : e && !e(n) || i.push(n);
            }
        return i;
    },
    isNumber: function(t) {
        return typeof Number(t) === "number" && isFinite(t);
    },
    isObjectEmpty: function(t) {
        if (null == t) return !0;
        if (t.length > 0) return !1;
        if (0 === t.length) return !0;
        for (var e in t)
            if (hasOwnProperty.call(t, e)) return !1;
        return isNaN(t);
    },
    parseNumber: function(t) {
        var e = parseFloat(t);
        return !isNaN(e) && isFinite(e) ? e : null;
    },
    isEmpty: function(t) {
        return "" === t || SiJia.isNull(t);
    },
    ROUND: function(t, e) {
        if (t = SiJia.parseNumber(t), e = SiJia.parseNumber(e), SiJia.isNull(t) || SiJia.isNull(e)) return null;
        var i = t * Math.pow(10, e);
        return Number(new Big(i).round(0).toString()) / Math.pow(10, e);
    },
    fixDecimalPrecision: function(t, e) {
        var i, a, n = "";
        return e = e || 8,
        this.isEmpty(t) || (i = parseFloat(t),
        isNaN(i) || (n = (a = (i + "").split(".")[1]) && a.length > e ? parseFloat(SiJia.toFixed(i, e)) : i,
        6 < e && Math.abs(n) < 1 && /e-/.test(n + "") && (n = parseFloat(SiJia.toFixed(i, 6))))), n;
    },
    date2Str: function(t, e) {
        if (!t) return "";
        var i = (e = e || "yyyy-MM-dd").length,
            a = "";
        if (i > 0) {
            for (var s = e.charAt(0), n = 0, o = s, r = 1; r < i; r++) {
                var l = e.charAt(r);
                s !== l ? (a += SiJia._compileDateFormat({
                    char: s,
                    str: o,
                    len: r - n
                }, t), n = r, o = s = l) : o += l;
            }
            a += SiJia._compileDateFormat({
                char: s,
                str: o,
                len: i - n
            }, t);
        }
        return a;
    },
    _compileDateFormat: function(t, e) {
        var i = t.str,
            a = t.len;
        switch (t.char) {
            case "E":
                i = a > 2 ? "星期" + "日一二三四五六".charAt(e.getDay()) : a > 1 ? "日一二三四五六".charAt(e.getDay()) : e.getDay() + "";
                break;
            case "y":
                i = a <= 3 ? (e.getFullYear() + "").slice(2, 4) : e.getFullYear();
                break;
            case "M":
                i = a > 2 ? ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"][Number(e.getMonth())] + "月" : a < 2 ? e.getMonth() + 1 : SiJia.leftPad(e.getMonth() + 1 + "", 2, "0");
                break;
            case "d":
                i = a > 1 ? SiJia.leftPad(e.getDate() + "", 2, "0") : e.getDate();
                break;
            case "h":
                var s = e.getHours() % 12;
                0 === s && (s = 12), i = a > 1 ? SiJia.leftPad(s + "", 2, "0") : s;
                break;
            case "H":
                i = a > 1 ? SiJia.leftPad(e.getHours() + "", 2, "0") : e.getHours();
                break;
            case "m":
                i = a > 1 ? SiJia.leftPad(e.getMinutes() + "", 2, "0") : e.getMinutes();
                break;
            case "s":
                i = a > 1 ? SiJia.leftPad(e.getSeconds() + "", 2, "0") : e.getSeconds();
                break;
            case "a":
                i = e.getHours() < 12 ? "am" : "pm";
                break;
            default:
                i = t.str;
        }
        return i;
    },
    num2Str: function(t, e) {
        e = e || "";
        if (SiJia.isEmpty(t)) return "";
        var i = t + "";
        if (SiJia.isEmpty(e)) return i;
        var a = /\[Num0\]/;
        if (a.test(e)) return e.replace(a, i);
        if ((a = /\[Num1\]/).test(e)) return e.replace(a, SiJia._num2CN(i, !1));
        if ((a = /\[Num2\]/).test(e)) return e.replace(a, SiJia._num2CN(i, !0));
        a = /[#0]+,?[#0]*\.?[#0]*%?/;
        var s = e.match(a);
        if (s && s.length > 0) {
            var n = s[0];
            return i = SiJia._numberFormat(t, n), e.replace(a, i);
        }
        return e;
    },
    toFixed: function(t, e) {
        return Number(t).toFixed(e).toString();
    },
    _numberFormat: function(t, e) {
        var i = "",
            a = t + "";
        if (/%$/.test(e)) {
            i = "%", t *= 100, e = e.replace("%", "");
            var s = a.indexOf(".");
            if (s > -1) {
                var n = a.length - 3 - s;
                n = n < 0 ? 0 : n > 8 ? 8 : n, t = parseFloat(t.toFixed(n));
            }
            a = t + "";
        }
        var o = e.split("."),
            r = o[0],
            l = o[1];
        if ("" !== l) {
            for (var d = l ? l.length : 0, c = (a = SiJia.toFixed(parseFloat(t), d)).split(""), u = d; u > 0 && "#" === l.charAt(u - 1); u--) {
                var h = c.pop();
                if ("0" !== h) {
                    c.push(h);
                    break;
                }
            }
            var p = c.pop();
            "." === p && (p = ""), a = c.join("") + p;
        }
        var f = a.split("."),
            m = f[0];
        if (/,/.test(r))
            f[0] = m.replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,");
        else {
            var g = r.match(/[0]+[0#]*$/);
            g && g.length > 0 && (f[0] = SiJia.leftPad(m, g[0].length, "0"));
        }
        return f.join(".") + i;
    },
    leftPad: function(t, e, i) {
        var a = String(t);
        for (i || (i = " "); a.length < e;) a = i + a;
        return a.toString();
    },
    _num2CN: function(t, e) {
        var i = "〇一二三四五六七八九",
            a = "个十百千万亿";
        e && (i = "零壹贰叁肆伍陆柒捌玖", a = "个拾佰仟万亿");
        var s = Math.floor(Math.abs(t)),
            n = Math.abs(t).toString(),
            o = n.replace(/\..*$/, ""),
            r = n.split("."),
            l = i,
            d = a,
            c = l[0],
            u = new RegExp(l[0] + "*$"),
            h = new RegExp(l[0] + "+", "g"),
            p = "",
            f = "";
        if (p = t < 0 ? "-."[0] : "", r.length >= 2) {
            var m = r[1];
            if (m) {
                f = "-."[1];
                for (var g = 0; g < m.length; g++) f += l[+m[g]];
            }
        }
        if (1 == o.length) return p + l[s] + f;
        if (o.length <= 5) {
            for (var F = "", v = 0, s = o.length; s--;) {
                var _ = +o[v];
                F += this._num2CN(o[v], e) + (_ && s ? d[s] : ""), v++;
            }
            return F = F.replace(h, c), F = F.replace(u, ""), p + F + f;
        }
        for (var b = o.length / 4 >> 0, y = o.length % 4, F = ""; 0 == y || !d[3 + b];) y += 4, b--;
        if (+o.substr(0, y)) {
            F = this._num2CN(o.substr(0, y), e) + d[3 + b];
            var w = o.substr(y);
            "0" === w[0] && (F += l[0]), F += this._num2CN(w, e);
        } else
            F = this._num2CN(o.substr(0, y), e) + this._num2CN(o.substr(y), e);
        return F = F.replace(h, c), F = F.replace(u, ""), p + F + f;
    }
};


//逻辑函数
export function AND() {
    let params = arguments;
    let val = true;
    for (let arg of params) {
        if (val && !arg)
            return false;
    }
    return val;
}

export function OR(...args) {
    let params = arguments;
    let val = false;
    for (let arg of params) {
        if (val || arg)
            return true;
    }
    return val;
}

export function TRUE() {
    return true;
}

export function FALSE() {
    return false;
}

export function IF(logical, trueVal, falseVal) {
    return logical ? trueVal : falseVal;
}

export function NOT(logical) {
    return !logical;
}

export function XOR(logical1, ...logicals) {
    let val = 0;
    let v = logical1;
    for (let logical of logicals) {
        if (v == logical)
            val = 0;
        else
            val = 1;
        v = logical;
    }
    return val;
}

//文本函数
export function CONCAT() {
    for (var t = SiJia.flatten(arguments), e = 0;
         (e = t.indexOf(!0)) > -1;) t[e] = "TRUE";
    for (var i = 0;
         (i = t.indexOf(!1)) > -1;) t[i] = "FALSE";
    if (t.join("").indexOf("undefined") > -1) {
        return "";
    } else {
        return t.join("");
    }
}

export function CHAR(t) {
    return 9 === t || 10 === t || 34 === t || 39 === t || 92 === t ? String.fromCharCode(t) : "";
}

export function EXACT(text1, text2) {
    return text1 === text2;
}

export function DISTINCT(array) {
    if (Array.isArray(array)) {
        return Array.from(new Set(array));
    }
    return array;
}

export function IP() {
    // returnCitySN["cip"]+','+returnCitySN["cname"]
    return "";// returnCitySN["cip"]
}

export function ISEMPTY(t) {
    return SiJia.isObjectEmpty(t);
}

export function LEFT(text, num) {
    return text.substr(0, num);
}

export function LEN(text) {
    return text.length;
}

export function LOWER(text) {
    return text.toLocaleLowerCase();
}


export function REPLACE(old, start, num, newText) {
    // debugger
    let array = [];
    for (let t of old) {
        array.push(t);
    }
    array.splice(start, num, newText);
    let val = "";
    for (let t of array) {
        val += t;
    }
    return val;
}

export function REPEAT(text, num) {
    let val = "";
    for (let i = 0; i < num; i++) {
        val += text;
    }
    return val;
}

// export function SEARCH(key, text, start) {
//     return text.indexOf(key, start) + 1;
// }
export function SEARCH(t, e, i) {
    return SiJia.isString(t) && SiJia.isString(e) ? (i = SiJia.isNull(i) ? 0 : i, e.toLowerCase().indexOf(t.toLowerCase(), i - 1) + 1) : 0;
}

export function RIGHT(text, num) {
    return text.substr(text.length - num);
}

export function SPLIT(t, e) {
    return SiJia.isString(t) ? t.split(e) : [];
}

export function TRIM(text) {
    let textTrim = text.trim();
    let regEx = /\s+/g;
    return textTrim.replace(regEx, " ");
}

export function UPPER(text) {
    return text.toLocaleUpperCase();
}

export function NUM(text) {
    // debugger
    let val = Number(text);
    if (isNaN(val))
        return "0";
    else {
        return val;
    }
}

export function MID(t, e, i) {
    return t = t || "", SiJia.isNumber(e) && SiJia.isNumber(i) ? t.substr(e - 1, i) : t;
}

export function intToChinese(str, type) {
    str = str + "";
    var len = str.length - 1;
    var idxs = ["", "十", "百", "千", "万", "十", "百", "千", "亿", "十", "百", "千", "万", "十", "百", "千", "亿"];
    var num = type === "big" ? ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"] : ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

    return str.replace(/([1-9]|0+)/g, function($, $1, idx, full) {
            var pos = 0;
            if ($1[0] != "0") {
                pos = len - idx;
                if (idx == 0 && $1[0] == 1 && idxs[len - idx] == "十") {
                    return idxs[len - idx];
                }
                return num[$1[0]] + idxs[len - idx];
            } else {
                var left = len - idx;
                var right = len - idx + $1.length;
                if (Math.floor(right / 4) - Math.floor(left / 4) > 0) {
                    pos = left - left % 4;
                }
                if (pos) {
                    return idxs[pos] + num[$1[0]];
                } else if (idx + $1.length >= len) {
                    return "";
                } else {
                    return num[$1[0]];
                }
            }
        }
    )
        ;
}

export function toThousands(num) {
    var result = [],
        counter = 0;
    num = (num || 0).toString().split("");
    for (var i = num.length - 1; i >= 0; i--) {
        counter++;
        result.unshift(num[i]);
        if (!(counter % 3) && i != 0) {
            result.unshift(",");
        }
    }
    return result.join("");
}

/**
 * @return {string}
 */
export function TEXT(t, e) {
    return SiJia.isNull(t) ? "" : SiJia.isDate(t) && !SiJia.isEmpty(e) ? SiJia.date2Str(t, e) : SiJia.num2Str(t, e);
}

//日期函数
export function NOW() {
    return new Date();
}

/* export function TODAY() {
    let t = new Date();
    return `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`;
} */
/**
 * @return {string}
 */
export function DATE() {
    return 6 === arguments.length ? new Date(parseInt(arguments[0], 10), parseInt(arguments[1], 10) - 1, parseInt(arguments[2], 10), parseInt(arguments[3], 10), parseInt(arguments[4], 10), parseInt(arguments[5], 10)) : 3 === arguments.length ? new Date(parseInt(arguments[0], 10), parseInt(arguments[1], 10) - 1, parseInt(arguments[2], 10)) : new Date(arguments[0]);

}

// 生成 年、天、时、分的统一函数
function generate(end, start, type) {
    console.log(end, start);
    let paramesDivider = -1,
        paramesFormat = 100;
    if (end && start) {
        switch (type) {
            case "YEARS":
                paramesDivider = 24 * 60 * 60 * 1000 * 360 / (paramesFormat ? paramesFormat : 1);
                break;
            case "DAYS":
                paramesDivider = 24 * 60 * 60 * 1000 / (paramesFormat ? paramesFormat : 1);
                break;
            case "HOURS":
                paramesDivider = 60 * 60 * 1000 / (paramesFormat ? paramesFormat : 1);
                break;
            case "MINUTES":
                paramesDivider = 60 * 1000 / (paramesFormat ? paramesFormat : 1);
                break;
        }
        return Math.ceil((+new Date(end) - (+new Date(start))) / paramesDivider) / (paramesFormat === -1 ? 1 : paramesFormat);
    } else {
        return 0;
    }

}


export function YEARS(end_date, start_date) {
    end_date = end_date ? ((moment(end_date, "YYYY-MM-DD", true).isValid()) ? moment(end_date).format(`YYYY-MM-DD ${moment().format("HH:mm:ss")}`) : end_date) : "";
    start_date = start_date ? ((moment(start_date, "YYYY-MM-DD", true).isValid()) ? moment(start_date).format(`YYYY-MM-DD ${moment().format("HH:mm:ss")}`) : start_date) : "";
    return generate(end_date, start_date, "YEARS");
}

export function DATEDIF(t, e, i) {
    var a = parseDate(e);
    if (!SiJia.isNull(a)) {
        var n, s = parseDate(t);
        if (!(SiJia.isNull(s) || e < t)) {
            switch (i) {
                case "y":
                    n = (e - t) / 31536e6;
                    break;
                case "M":
                    n = (e - t) / 2592e6;
                    break;
                case "d":
                    n = (e - t) / 864e5;
                    break;
                case "h":
                    n = (e - t) / 36e5;
                    break;
                case "m":
                    n = (e - t) / 6e4;
                    break;
                case "s":
                    n = (e - t) / 1e3;
                    break;
                default:
                    n = (e - t) / 864e5;
            }
            return SiJia.fixDecimalPrecision(n);
        }
    }
}

export function DAYS(end_date, start_date) {
    end_date = end_date ? ((moment(end_date, "YYYY-MM-DD", true).isValid()) ? moment(end_date).format(`YYYY-MM-DD ${moment().format("HH:mm:ss")}`) : end_date) : "";
    start_date = start_date ? ((moment(start_date, "YYYY-MM-DD", true).isValid()) ? moment(start_date).format(`YYYY-MM-DD ${moment().format("HH:mm:ss")}`) : start_date) : "";
    return generate(end_date, start_date, "DAYS");
}

export function HOURS(end_time, start_time) {
    end_time = end_time ? ((moment(end_time, "YYYY-MM-DD", true).isValid()) ? moment(end_time).format(`YYYY-MM-DD ${moment().format("HH:mm:ss")}`) : end_time) : "";
    start_time = start_time ? ((moment(start_time, "YYYY-MM-DD", true).isValid()) ? moment(start_time).format(`YYYY-MM-DD ${moment().format("HH:mm:ss")}`) : start_time) : "";
    return generate(end_time, start_time, "HOURS");
}

export function MINUTES(end_date, start_date) {
    end_date = end_date ? ((moment(end_date, "YYYY-MM-DD", true).isValid()) ? moment(end_date).format(`YYYY-MM-DD ${moment().format("HH:mm:ss")}`) : end_date) : "";
    start_date = start_date ? ((moment(start_date, "YYYY-MM-DD", true).isValid()) ? moment(start_date).format(`YYYY-MM-DD ${moment().format("HH:mm:ss")}`) : start_date) : "";
    return generate(end_date, start_date, "MINUTES");
}

export function ADDDAY(date, days = 0) {
    return moment(date ? date : new Date()).add(days, "d").format("YYYY-MM-DD");
}

export function ADDMONTH(date, months = 0) {
    return moment(date ? date : new Date()).add(months, "M").format("YYYY-MM-DD");
}

export function ADDYEAR(date, years = 0) {
    return moment(date ? date : new Date()).add(years, "y").format("YYYY-MM-DD");
}

export function YEAR(date) {
    return moment(date ? date : new Date()).format("YYYY");
}

export function MONTH(date) {
    return moment(date ? date : new Date()).format("MM");
}

export function DAY(date) {
    return moment(date ? date : new Date()).format("DD");
}

export function HOUR(date) {
    return moment(date ? date : new Date()).format("HH");
}

export function MINUTE(date) {
    return moment(date ? date : new Date()).format("mm");
}

export function QUARTER(date) {
    return moment(date ? date : new Date()).quarter();
}

export function TODAY(dateTime = false) {
    let result = new Date();
    if (dateTime === false) {
        result.setMinutes(0);
        result.setHours(0);
        result.setMilliseconds(0);
    }
    return result;
}

export function WEEKDAY(date) {
    return moment(date ? date : new Date()).format("dddd");
}


function parseDate(t) {
    if (SiJia.isNull(t)) return null;
    if (SiJia.isNumber(t)) return new Date(t);
    if (SiJia.isString(t)) {
        var e = moment(t).format("YYYY-MM-DD HH:mm:ss").match(/^(\d{4})-?(\d{1,2})-?(\d{0,2})(.*?(\d{1,2}):(\d{1,2}):(\d{1,2}))?.?(\d{1,3})?$/);
        return e ? new Date(e[1], e[2] - 1, e[3], e[5] || 0, e[6] || 0, e[7] || 0, e[8] || 0) : null;
    }
    return new Date(t);
}


export function DATEDELTA(t, e) {
    t = parseDate(t);
    if (!(null == t)) return SiJia.isNumber(e) || (e = 0), new Date(t.getTime() + 864e5 * e);
}

export function TIMESTAMP(t) {
    t = parseDate(t);
    if (!(null == t)) return new Date(t).getTime() / 1000;
}

export function SECOND(t) {
    t = parseDate(t);
    if (!(null == t)) return t.getSeconds();
}

export function DAYS360(t, e, i) {
    t = parseDate(t);
    if (!(null == t)) {
        e = parseDate(e);
        if (!(null == t)) {
            var a,
                s,
                n = e.getMonth(),
                o = t.getMonth();
            if (i) a = 31 === e.getDate() ? 30 : e.getDate(), s = 31 === t.getDate() ? 30 : t.getDate();
            else {
                var r = new Date(e.getFullYear(), n + 1, 0).getDate(),
                    l = new Date(t.getFullYear(), o + 1, 0).getDate();
                a = e.getDate() === r ? 30 : e.getDate(), t.getDate() === l ? a < 30 ? (o++, s = 1) : s = 30 : s = t.getDate();
            }
            return 360 * (t.getFullYear() - e.getFullYear()) + 30 * (o - n) + (s - a);
        }
    }
}

//WEEKNUM 函数计算
export function WEEKNUM(t, e) {
    t = parseDate(t);
    if (!(null == t)) {
        var i = 2 === e ? 1 : 0,
            a = new Date(t.getFullYear(), 0, 1),
            s = (i + 7 - a.getDay()) % 7,
            n = s > 0 ? 1 : 0,
            o = a.getTime() + 24 * s * 60 * 60 * 1e3;
        return Math.floor((t.getTime() - o) / 864e5 / 7 + 1) + n;
    }
}

//数学函数
export function ABS(t) {
    return SiJia.isNumber(t) ? Math.abs(t) : 0;
}


export function CEILING(t, e) {
    if (t = SiJia.parseNumber(t), e = SiJia.parseNumber(e), SiJia.isNull(t) || SiJia.isNull(e)) return null;
    if (0 === e) return 0;
    var i = e < 0 ? -1 : 0,
        a = (e = Math.abs(e)) - Math.floor(e),
        s = 0;
    return a > 0 && (s = -Math.floor(Math.log(a) / Math.log(10))), t >= 0 ? SiJia.ROUND(Math.ceil(t / e) * e, s) : 0 === i ? -SiJia.ROUND(Math.floor(Math.abs(t) / e) * e, s) : -SiJia.ROUND(Math.ceil(Math.abs(t) / e) * e, s);

}

export function FLOOR(t, e) {
    if (t = SiJia.parseNumber(t), e = SiJia.parseNumber(e), SiJia.isNull(t) || SiJia.isNull(e)) return null;
    if (0 === e) return 0;
    if (!(t > 0 && e > 0 || t < 0 && e < 0)) return 0;
    var i = (e = Math.abs(e)) - Math.floor(e),
        a = 0;
    return i > 0 && (a = -Math.floor(Math.log(i) / Math.log(10))), t >= 0 ? SiJia.ROUND(Math.floor(t / e) * e, a) : -SiJia.ROUND(Math.floor(Math.abs(t) / e) * e, a);
}

export function INT(t) {
    return SiJia.isNumber(t) ? Math.floor(t) : 0;
}

export function LOG(t, e) {
    return e = void 0 === e ? 10 : e, SiJia.isNumber(e) ? Math.log(t) / Math.log(e) : 0;
}

export function PRODUCT() {
    let product = 1;
    for (let i = 0; i < arguments.length; i++) {
        if ((typeof arguments[i] === "number" && isFinite(arguments[i]))) {
            product *= arguments[i];
        } else {
            return "请按格式要求输入";
        }
    }
    return product;
}

export function SQRT(t) {
    return t < 0 ? 0 : Math.sqrt(t);
}

export function ROUND(num, len) {
    return Number(num).toFixed(len);
}

export function FIXED(num, fix) {
    return Number(num).toFixed(fix);
}

export function SMALL(t, e) {
    return ((t = SiJia.flatten(t, function(t) {
        return SiJia.isNumber(t);
    })).sort(function(t, e) {
        return t - e;
    })[e - 1]);
}

export function LARGE(a, s) {
    return ((a = SiJia.flatten(a, function(a) {
        return SiJia.isNumber(a);
    })).sort(function(a, s) {
        return s - a;
    })[s - 1]);
}


export function COUNTIF() {
    function flatten(t, e, i) {
        if (i || (i = []), t)
            for (var a = 0, s = t.length; a < s; a++) {
                var n = t[a];
                Array.isArray(n) ? flatten(n, e, i) : e && !e(n) || i.push(n);
            }
        return i;
    }

    var len = arguments.length,
        criteria = arguments[len - 1];
    /[<>=!]/.test(criteria) || (criteria = "==\"" + criteria + "\"");
    for (var args = flatten(Array.prototype.slice.call(arguments, 0, len - 1)), matches = 0, i = 0; i < args.length; i++) "string" != typeof args[i] ? eval(args[i] + criteria) && matches++ : eval("\"" + args[i] + "\"" + criteria) && matches++;
    return matches;
}


export function COUNT() {
    return arguments[0] ? SiJia.flatten(arguments).length : 0;

}

export function RAND(fix) {
    if (fix) {
        return Math.random().toFixed(fix);
    } else {
        return Math.random();
    }
}

export function CONTAIN(arg, target, trueVal, falseVal) {
    let params = buildFormulaParams(arg, true);
    if (Array.isArray(target)) {
        for (let t of target) {
            for (let item of params) {
                if (item == null)
                    item = "";
                if (item.toString() === t.toString())
                    return trueVal;
            }
        }
    }
    else {
        for (let item of params) {
            if (item == null)
                item = "";
            if (item.toString() === target.toString())
                return trueVal;
        }
    }
    return falseVal;
}

export function NOTCONTAIN(arg, target, trueVal, falseVal) {
    let params = buildFormulaParams(arg);
    if (Array.isArray(target)) {
        for (let t of target) {
            for (let item of params) {
                if (item.toString() === t.toString())
                    return falseVal;
            }
        }
    }
    else {
        for (let item of params) {
            if (item.toString() === target.toString())
                return falseVal;
        }
    }
    return trueVal;
}

export function MAX(...args) {
    let params = buildFormulaParams(args);
    if (params.length == 0)
        return null;
    return Math.max(...params);
}

export function MIN(...args) {
    let params = buildFormulaParams(args);
    if (params.length == 0)
        return null;
    return Math.min(...params);
}

export function AVERAGE(...args) {
    let params = buildFormulaParams(args);
    return SUM(...params) / params.length;
}

export function MOD(a, b) {
    return parseInt(a) % parseInt(b);
}

export function POWER(num, level) {
    return Math.pow(num, level);
}

export function SUM(...args) {
    let params = buildFormulaParams(args);
    if (params.length > 0) {
        let result = params[0];
        params = params.slice(1);
        // result += new Big(result).plus(a);
        params.forEach(a => {
            if (!SiJia.isEmpty(a))
                result += a;
            //result = new Big(result).plus(a);
        });
        return result;
    }
    else
        return null;
}


//高级函数
export function UUID() {
    return com.Guid();
}


export function run(generator, res) {
    var result = generator.next(res);
    if (result.done) return result.value;
    result.value.then((res) => {
        run(generator, res);
    });
}

export function* SystemDate() {
    const { data } = yield FromulacalSystemDate();
    return data;
}

export function* MAPX(arg, formData, foreignData) {
    if (arg.length <= 0) {
        return yield 0;
    }
    var args = "";
    // ('count',⠀436c68f5-09b6-f8dd-9bd5-dd9a34eb7e4c⠀,⠀9814613d-d2aa-64fd-ac40-f8dd1f96e853⠀,⠀cb3c491f-024f-dba0-1297-db548c9878e0⠀)
    args = arg[0].replace("(", "").replace(")", "").replace(new RegExp(`foreign`, "gm"), "");
    var argsList = args.split(",");
    if (argsList.length < 3) {
        return yield 0;
    } else {
        var newArgs = [];
        argsList.forEach(ele => {
            ele = ele.replace(new RegExp(`⠀`, "gm"), "");
            var formItem = _.where(foreignData, {
                id: ele
            });
            if (formItem.length > 0) {
                newArgs.push(formItem[0].code);
            } else {
                newArgs.push(ele);
            }
        });

        var viewName = "";
        var type = 1;
        var view = _.where(foreignData, {
            code: newArgs[2]
        })[0];
        var typeObj = _.where(foreignData, {
            code: newArgs[3]
        })[0];
        // if (view.length > 0) {
        //     viewName = view[0].table;
        // }
        // if (typeObj.length > 0) {
        //     type = typeObj[0].formType
        //     if (!viewName) {
        //         viewName = typeObj[0].table;
        //     }
        // }
        var parames = {
            Operation: newArgs[0].replace(new RegExp(`'`, "gm"), ""),
            MapValue: formData[newArgs[1].replace(new RegExp(`'`, "gm"), "")],
            MapTable: view.formCode,
            MapField: newArgs[2],
            MapFieldType: view.formType,
            MapPrimaryKey: view.primaryKey,
            MapForeignKey: view.foreignKey,

            ResultTable: typeObj.formCode,
            ResultField: newArgs[3],
            ResultFieldType: typeObj.formType,
            ResultPrimaryKey: typeObj.primaryKey,
            ResultForeignKey: typeObj.foreignKey,
            viewName: view.table
        };

        const { data } = yield FormulaCal(parames);
        return data;

    }
}
