!
function(e) {
	this.CodeMirror = e()
}(function() {
	"use strict";

	function e(i, n) {
		if (!(this instanceof e)) return new e(i, n);
		this.options = n = n ? La(n) : {}, La(Go, n, !1), f(n), e.keywords = n.keywords || [];
		var a = n.value;
		"string" == typeof a && (a = new mr(a, n.mode)), this.doc = a;
		var o = new e.inputStyles[n.inputStyle](this),
			s = this.display = new t(i, a, o);
		s.wrapper.CodeMirror = this, l(this), r(this), n.lineWrapping && (this.display.wrapper.className += " CodeMirror-wrap"), n.autofocus && !Fo && s.input.focus(), g(this), this.state = {
			keyMaps: [],
			overlays: [],
			modeGen: 0,
			overwrite: !1,
			delayingBlurEvent: !1,
			focused: !1,
			suppressEdits: !1,
			pasteIncoming: !1,
			cutIncoming: !1,
			draggingText: !1,
			highlight: new Ca,
			keySeq: null,
			specialChars: null
		};
		var d = this;
		co && fo < 11 && setTimeout(function() {
			d.display.input.reset(!0)
		}, 20), Vt(this), Ba(), yt(this), this.curOp.forceUpdate = !0, Hn(this, a), n.autofocus && !Fo || d.hasFocus() ? setTimeout(Aa(ci, this), 20) : fi(this);
		for (var u in jo) jo.hasOwnProperty(u) && jo[u](this, n[u], zo);
		F(this), n.finishInit && n.finishInit(this);
		for (var c = 0; c < Qo.length; ++c) Qo[c](this);
		xt(this), ho && n.lineWrapping && "optimizelegibility" == getComputedStyle(s.lineDiv).textRendering && (s.lineDiv.style.textRendering = "auto")
	}
	function t(e, t, i) {
		var n = this;
		this.input = i, n.scrollbarFiller = Ma("div", null, "CodeMirror-scrollbar-filler"), n.scrollbarFiller.setAttribute("cm-not-content", "true"), n.gutterFiller = Ma("div", null, "CodeMirror-gutter-filler"), n.gutterFiller.setAttribute("cm-not-content", "true"), n.lineDiv = Ma("div", null, "CodeMirror-code"), n.selectionDiv = Ma("div", null, null, "position: relative; z-index: 1"), n.cursorDiv = Ma("div", null, "CodeMirror-cursors"), n.measure = Ma("div", null, "CodeMirror-measure"), n.lineMeasure = Ma("div", null, "CodeMirror-measure"), n.lineSpace = Ma("div", [n.measure, n.lineMeasure, n.selectionDiv, n.cursorDiv, n.lineDiv], null, "position: relative; outline: none"), n.mover = Ma("div", [Ma("div", [n.lineSpace], "CodeMirror-lines")], null, "position: relative"), n.sizer = Ma("div", [n.mover], "CodeMirror-sizer"), n.sizerWidth = null, n.heightForcer = Ma("div", null, null, "position: absolute; height: " + Tr + "px; width: 1px;"), n.gutters = Ma("div", null, "CodeMirror-gutters"), n.lineGutter = null, n.scroller = Ma("div", [n.sizer, n.heightForcer, n.gutters], "CodeMirror-scroll"), n.scroller.setAttribute("tabIndex", "-1"), n.wrapper = Ma("div", [n.scrollbarFiller, n.gutterFiller, n.scroller], "CodeMirror"), co && fo < 8 && (n.gutters.style.zIndex = -1, n.scroller.style.paddingRight = 0), ho || so && Fo || (n.scroller.draggable = !0), e && (e.appendChild ? e.appendChild(n.wrapper) : e(n.wrapper)), n.viewFrom = n.viewTo = t.first, n.reportedViewFrom = n.reportedViewTo = t.first, n.view = [], n.renderedView = null, n.externalMeasured = null, n.viewOffset = 0, n.lastWrapHeight = n.lastWrapWidth = 0, n.updateLineNumbers = null, n.nativeBarWidth = n.barHeight = n.barWidth = 0, n.scrollbarsClipped = !1, n.lineNumWidth = n.lineNumInnerWidth = n.lineNumChars = null, n.alignWidgets = !1, n.cachedCharWidth = n.cachedTextHeight = n.cachedPaddingH = null, n.maxLine = null, n.maxLineLength = 0, n.maxLineChanged = !1, n.wheelDX = n.wheelDY = n.wheelStartX = n.wheelStartY = null, n.shift = !1, n.selForContextMenu = null, n.activeTouch = null, i.init(n)
	}
	function i(t) {
		t.doc.mode = e.getMode(t.options, t.doc.modeOption), n(t)
	}
	function n(e) {
		e.doc.iter(function(e) {
			e.stateAfter && (e.stateAfter = null), e.styles && (e.styles = null)
		}), e.doc.frontier = e.doc.first, De(e, 100), e.state.modeGen++, e.curOp && Nt(e)
	}
	function a(e) {
		var t = gt(e.display),
			i = e.options.lineWrapping,
			n = i && Math.max(5, e.display.scroller.clientWidth / vt(e.display) - 3);
		return function(a) {
			if (vn(e.doc, a)) return 0;
			var o = 0;
			if (a.widgets) for (var r = 0; r < a.widgets.length; r++) a.widgets[r].height && (o += a.widgets[r].height);
			return i ? o + (Math.ceil(a.text.length / n) || 1) * t : o + t
		}
	}
	function o(e) {
		var t = e.doc,
			i = a(e);
		t.iter(function(e) {
			var t = i(e);
			t != e.height && Kn(e, t)
		})
	}
	function r(e) {
		e.display.wrapper.className = e.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + e.options.theme.replace(/(^|\s)\s*/g, " cm-s-"), ot(e)
	}
	function s(e) {
		l(e), Nt(e), setTimeout(function() {
			x(e)
		}, 20)
	}
	function l(e) {
		var t = e.display.gutters,
			i = e.options.gutters;
		Da(t);
		for (var n = 0; n < i.length; ++n) {
			var a = i[n],
				o = t.appendChild(Ma("div", null, "CodeMirror-gutter " + a));
			"CodeMirror-linenumbers" == a && (e.display.lineGutter = o, o.style.width = (e.display.lineNumWidth || 1) + "px")
		}
		t.style.display = n ? "" : "none", d(e)
	}
	function d(e) {
		var t = e.display.gutters.offsetWidth;
		e.display.sizer.style.marginLeft = t + "px"
	}
	function u(e) {
		if (0 == e.height) return 0;
		for (var t, i = e.text.length, n = e; t = un(n);) n = (a = t.find(0, !0)).from.line, i += a.from.ch - a.to.ch;
		for (n = e; t = cn(n);) {
			var a = t.find(0, !0);
			i -= n.text.length - a.from.ch, i += (n = a.to.line).text.length - a.to.ch
		}
		return i
	}
	function c(e) {
		var t = e.display,
			i = e.doc;
		t.maxLine = Gn(i, i.first), t.maxLineLength = u(t.maxLine), t.maxLineChanged = !0, i.iter(function(e) {
			var i = u(e);
			i > t.maxLineLength && (t.maxLineLength = i, t.maxLine = e)
		})
	}
	function f(e) {
		var t = Xa(e.gutters, "CodeMirror-linenumbers"); - 1 == t && e.lineNumbers ? e.gutters = e.gutters.concat(["CodeMirror-linenumbers"]) : t > -1 && !e.lineNumbers && (e.gutters = e.gutters.slice(0), e.gutters.splice(t, 1))
	}
	function h(e) {
		var t = e.display,
			i = t.gutters.offsetWidth,
			n = Math.round(e.doc.height + $e(e.display));
		return {
			clientHeight: t.scroller.clientHeight,
			viewHeight: t.wrapper.clientHeight,
			scrollWidth: t.scroller.scrollWidth,
			clientWidth: t.scroller.clientWidth,
			viewWidth: t.wrapper.clientWidth,
			barLeft: e.options.fixedGutter ? i : 0,
			docHeight: n,
			scrollHeight: n + He(e) + t.barHeight,
			nativeBarWidth: t.nativeBarWidth,
			gutterWidth: i
		}
	}
	function p(e, t, i) {
		this.cm = i;
		var n = this.vert = Ma("div", [Ma("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar"),
			a = this.horiz = Ma("div", [Ma("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
		e(n), e(a), Fr(n, "scroll", function() {
			n.clientHeight && t(n.scrollTop, "vertical")
		}), Fr(a, "scroll", function() {
			a.clientWidth && t(a.scrollLeft, "horizontal")
		}), this.checkedOverlay = !1, co && fo < 8 && (this.horiz.style.minHeight = this.vert.style.minWidth = "18px")
	}
	function m() {}
	function g(t) {
		t.display.scrollbars && (t.display.scrollbars.clear(), t.display.scrollbars.addClass && Vr(t.display.wrapper, t.display.scrollbars.addClass)), t.display.scrollbars = new e.scrollbarModel[t.options.scrollbarStyle](function(e) {
			t.display.wrapper.insertBefore(e, t.display.scrollbarFiller), Fr(e, "mousedown", function() {
				t.state.focused && setTimeout(function() {
					t.display.input.focus()
				}, 0)
			}), e.setAttribute("cm-not-content", "true")
		}, function(e, i) {
			"horizontal" == i ? Zt(t, e) : Jt(t, e)
		}, t), t.display.scrollbars.addClass && Rr(t.display.wrapper, t.display.scrollbars.addClass)
	}
	function v(e, t) {
		t || (t = h(e));
		var i = e.display.barWidth,
			n = e.display.barHeight;
		y(e, t);
		for (var a = 0; a < 4 && i != e.display.barWidth || n != e.display.barHeight; a++) i != e.display.barWidth && e.options.lineWrapping && k(e), y(e, h(e)), i = e.display.barWidth, n = e.display.barHeight
	}
	function y(e, t) {
		var i = e.display,
			n = i.scrollbars.update(t);
		i.sizer.style.paddingRight = (i.barWidth = n.right) + "px", i.sizer.style.paddingBottom = (i.barHeight = n.bottom) + "px", n.right && n.bottom ? (i.scrollbarFiller.style.display = "block", i.scrollbarFiller.style.height = n.bottom + "px", i.scrollbarFiller.style.width = n.right + "px") : i.scrollbarFiller.style.display = "", n.bottom && e.options.coverGutterNextToScrollbar && e.options.fixedGutter ? (i.gutterFiller.style.display = "block", i.gutterFiller.style.height = n.bottom + "px", i.gutterFiller.style.width = t.gutterWidth + "px") : i.gutterFiller.style.display = ""
	}
	function w(e, t, i) {
		var n = i && null != i.top ? Math.max(0, i.top) : e.scroller.scrollTop;
		n = Math.floor(n - Re(e));
		var a = i && null != i.bottom ? i.bottom : n + e.wrapper.clientHeight,
			o = qn(t, n),
			r = qn(t, a);
		if (i && i.ensure) {
			var s = i.ensure.from.line,
				l = i.ensure.to.line;
			s < o ? (o = s, r = qn(t, Qn(Gn(t, s)) + e.wrapper.clientHeight)) : Math.min(l, t.lastLine()) >= r && (o = qn(t, Qn(Gn(t, l)) - e.wrapper.clientHeight), r = l)
		}
		return {
			from: o,
			to: Math.max(r, o + 1)
		}
	}
	function x(e) {
		var t = e.display,
			i = t.view;
		if (t.alignWidgets || t.gutters.firstChild && e.options.fixedGutter) {
			for (var n = C(t) - t.scroller.scrollLeft + e.doc.scrollLeft, a = t.gutters.offsetWidth, o = n + "px", r = 0; r < i.length; r++) if (!i[r].hidden) {
				e.options.fixedGutter && i[r].gutter && (i[r].gutter.style.left = o);
				var s = i[r].alignable;
				if (s) for (var l = 0; l < s.length; l++) s[l].style.left = o
			}
			e.options.fixedGutter && (t.gutters.style.left = n + a + "px")
		}
	}
	function F(e) {
		if (!e.options.lineNumbers) return !1;
		var t = e.doc,
			i = b(e.options, t.first + t.size - 1),
			n = e.display;
		if (i.length != n.lineNumChars) {
			var a = n.measure.appendChild(Ma("div", [Ma("div", i)], "CodeMirror-linenumber CodeMirror-gutter-elt")),
				o = a.firstChild.offsetWidth,
				r = a.offsetWidth - o;
			return n.lineGutter.style.width = "", n.lineNumInnerWidth = Math.max(o, n.lineGutter.offsetWidth - r) + 1, n.lineNumWidth = n.lineNumInnerWidth + r, n.lineNumChars = n.lineNumInnerWidth ? i.length : -1, n.lineGutter.style.width = n.lineNumWidth + "px", d(e), !0
		}
		return !1
	}
	function b(e, t) {
		return String(e.lineNumberFormatter(t + e.firstLineNumber))
	}
	function C(e) {
		return e.scroller.getBoundingClientRect().left - e.sizer.getBoundingClientRect().left
	}
	function _(e, t, i) {
		var n = e.display;
		this.viewport = t, this.visible = w(n, e.doc, t), this.editorIsHidden = !n.wrapper.offsetWidth, this.wrapperHeight = n.wrapper.clientHeight, this.wrapperWidth = n.wrapper.clientWidth, this.oldDisplayWidth = Ge(e), this.force = i, this.dims = A(e), this.events = []
	}
	function T(e) {
		var t = e.display;
		!t.scrollbarsClipped && t.scroller.offsetWidth && (t.nativeBarWidth = t.scroller.offsetWidth - t.scroller.clientWidth, t.heightForcer.style.height = He(e) + "px", t.sizer.style.marginBottom = -t.nativeBarWidth + "px", t.sizer.style.borderRightWidth = He(e) + "px", t.scrollbarsClipped = !0)
	}
	function S(e, t) {
		var i = e.display,
			n = e.doc;
		if (t.editorIsHidden) return Ot(e), !1;
		if (!t.force && t.visible.from >= i.viewFrom && t.visible.to <= i.viewTo && (null == i.updateLineNumbers || i.updateLineNumbers >= i.viewTo) && i.renderedView == i.view && 0 == Pt(e)) return !1;
		F(e) && (Ot(e), t.dims = A(e));
		var a = n.first + n.size,
			o = Math.max(t.visible.from - e.options.viewportMargin, n.first),
			r = Math.min(a, t.visible.to + e.options.viewportMargin);
		i.viewFrom < o && o - i.viewFrom < 20 && (o = Math.max(n.first, i.viewFrom)), i.viewTo > r && i.viewTo - r < 20 && (r = Math.min(a, i.viewTo)), Eo && (o = mn(e.doc, o), r = gn(e.doc, r));
		var s = o != i.viewFrom || r != i.viewTo || i.lastWrapHeight != t.wrapperHeight || i.lastWrapWidth != t.wrapperWidth;
		Ut(e, o, r), i.viewOffset = Qn(Gn(e.doc, i.viewFrom)), e.display.mover.style.top = i.viewOffset + "px";
		var l = Pt(e);
		if (!s && 0 == l && !t.force && i.renderedView == i.view && (null == i.updateLineNumbers || i.updateLineNumbers >= i.viewTo)) return !1;
		var d = Pa();
		return l > 4 && (i.lineDiv.style.display = "none"), N(e, i.updateLineNumbers, t.dims), l > 4 && (i.lineDiv.style.display = ""), i.renderedView = i.view, d && Pa() != d && d.offsetHeight && d.focus(), Da(i.cursorDiv), Da(i.selectionDiv), i.gutters.style.height = 0, s && (i.lastWrapHeight = t.wrapperHeight, i.lastWrapWidth = t.wrapperWidth, De(e, 400)), i.updateLineNumbers = null, !0
	}
	function X(e, t) {
		for (var i = t.viewport, n = !0;
		(n && e.options.lineWrapping && t.oldDisplayWidth != Ge(e) || (i && null != i.top && (i = {
			top: Math.min(e.doc.height + $e(e.display) - je(e), i.top)
		}), t.visible = w(e.display, e.doc, i), !(t.visible.from >= e.display.viewFrom && t.visible.to <= e.display.viewTo))) && S(e, t); n = !1) {
			k(e);
			var a = h(e);
			Ae(e), I(e, a), v(e, a)
		}
		t.signal(e, "update", e), e.display.viewFrom == e.display.reportedViewFrom && e.display.viewTo == e.display.reportedViewTo || (t.signal(e, "viewportChange", e, e.display.viewFrom, e.display.viewTo), e.display.reportedViewFrom = e.display.viewFrom, e.display.reportedViewTo = e.display.viewTo)
	}
	function E(e, t) {
		var i = new _(e, t);
		if (S(e, i)) {
			k(e), X(e, i);
			var n = h(e);
			Ae(e), I(e, n), v(e, n), i.finish()
		}
	}
	function I(e, t) {
		e.display.sizer.style.minHeight = t.docHeight + "px";
		var i = t.docHeight + e.display.barHeight;
		e.display.heightForcer.style.top = i + "px", e.display.gutters.style.height = Math.max(i + He(e), t.clientHeight) + "px"
	}
	function k(e) {
		for (var t = e.display, i = t.lineDiv.offsetTop, n = 0; n < t.view.length; n++) {
			var a, o = t.view[n];
			if (!o.hidden) {
				if (co && fo < 8) {
					var r = o.node.offsetTop + o.node.offsetHeight;
					a = r - i, i = r
				} else {
					var s = o.node.getBoundingClientRect();
					a = s.bottom - s.top
				}
				var l = o.line.height - a;
				if (a < 2 && (a = gt(t)), (l > .001 || l < -.001) && (Kn(o.line, a), L(o.line), o.rest)) for (var d = 0; d < o.rest.length; d++) L(o.rest[d])
			}
		}
	}
	function L(e) {
		if (e.widgets) for (var t = 0; t < e.widgets.length; ++t) e.widgets[t].height = e.widgets[t].node.offsetHeight
	}
	function A(e) {
		for (var t = e.display, i = {}, n = {}, a = t.gutters.clientLeft, o = t.gutters.firstChild, r = 0; o; o = o.nextSibling, ++r) i[e.options.gutters[r]] = o.offsetLeft + o.clientLeft + a, n[e.options.gutters[r]] = o.clientWidth;
		return {
			fixedPos: C(t),
			gutterTotalWidth: t.gutters.offsetWidth,
			gutterLeft: i,
			gutterWidth: n,
			wrapperWidth: t.wrapper.clientWidth
		}
	}
	function N(e, t, i) {
		function n(t) {
			var i = t.nextSibling;
			return ho && bo && e.display.currentWheelTarget == t ? t.style.display = "none" : t.parentNode.removeChild(t), i
		}
		for (var a = e.display, o = e.options.lineNumbers, r = a.lineDiv, s = r.firstChild, l = a.view, d = a.viewFrom, u = 0; u < l.length; u++) {
			var c = l[u];
			if (c.hidden);
			else if (c.node && c.node.parentNode == r) {
				for (; s != c.node;) s = n(s);
				var f = o && null != t && t <= d && c.lineNumber;
				c.changes && (Xa(c.changes, "gutter") > -1 && (f = !1), W(e, c, d, i)), f && (Da(c.lineNumber), c.lineNumber.appendChild(document.createTextNode(b(e.options, d)))), s = c.node.nextSibling
			} else {
				var h = $(e, c, d, i);
				r.insertBefore(h, s)
			}
			d += c.size
		}
		for (; s;) s = n(s)
	}
	function W(e, t, i, n) {
		for (var a = 0; a < t.changes.length; a++) {
			var o = t.changes[a];
			"text" == o ? U(e, t) : "gutter" == o ? V(e, t, i, n) : "class" == o ? P(t) : "widget" == o && R(e, t, n)
		}
		t.changes = null
	}
	function O(e) {
		return e.node == e.text && (e.node = Ma("div", null, null, "position: relative"), e.text.parentNode && e.text.parentNode.replaceChild(e.node, e.text), e.node.appendChild(e.text), co && fo < 8 && (e.node.style.zIndex = 2)), e.node
	}
	function M(e) {
		var t = e.bgClass ? e.bgClass + " " + (e.line.bgClass || "") : e.line.bgClass;
		if (t && (t += " CodeMirror-linebackground"), e.background) t ? e.background.className = t : (e.background.parentNode.removeChild(e.background), e.background = null);
		else if (t) {
			var i = O(e);
			e.background = i.insertBefore(Ma("div", null, t), i.firstChild)
		}
	}
	function D(e, t) {
		var i = e.display.externalMeasured;
		return i && i.line == t.line ? (e.display.externalMeasured = null, t.measure = i.measure, i.built) : Nn(e, t)
	}
	function U(e, t) {
		var i = t.text.className,
			n = D(e, t);
		t.text == t.node && (t.node = n.pre), t.text.parentNode.replaceChild(n.pre, t.text), t.text = n.pre, n.bgClass != t.bgClass || n.textClass != t.textClass ? (t.bgClass = n.bgClass, t.textClass = n.textClass, P(t)) : i && (t.text.className = i)
	}
	function P(e) {
		M(e), e.line.wrapClass ? O(e).className = e.line.wrapClass : e.node != e.text && (e.node.className = "");
		var t = e.textClass ? e.textClass + " " + (e.line.textClass || "") : e.line.textClass;
		e.text.className = t || ""
	}
	function V(e, t, i, n) {
		t.gutter && (t.node.removeChild(t.gutter), t.gutter = null);
		var a = t.line.gutterMarkers;
		if (e.options.lineNumbers || a) {
			var o = O(t),
				r = t.gutter = Ma("div", null, "CodeMirror-gutter-wrapper", "left: " + (e.options.fixedGutter ? n.fixedPos : -n.gutterTotalWidth) + "px; width: " + n.gutterTotalWidth + "px");
			if (e.display.input.setUneditable(r), o.insertBefore(r, t.text), t.line.gutterClass && (r.className += " " + t.line.gutterClass), !e.options.lineNumbers || a && a["CodeMirror-linenumbers"] || (t.lineNumber = r.appendChild(Ma("div", b(e.options, i), "CodeMirror-linenumber CodeMirror-gutter-elt", "left: " + n.gutterLeft["CodeMirror-linenumbers"] + "px; width: " + e.display.lineNumInnerWidth + "px"))), a) for (var s = 0; s < e.options.gutters.length; ++s) {
				var l = e.options.gutters[s],
					d = a.hasOwnProperty(l) && a[l];
				d && r.appendChild(Ma("div", [d], "CodeMirror-gutter-elt", "left: " + n.gutterLeft[l] + "px; width: " + n.gutterWidth[l] + "px"))
			}
		}
	}
	function R(e, t, i) {
		t.alignable && (t.alignable = null);
		for (var n = t.node.firstChild; n; n = a) {
			var a = n.nextSibling;
			"CodeMirror-linewidget" == n.className && t.node.removeChild(n)
		}
		B(e, t, i)
	}
	function $(e, t, i, n) {
		var a = D(e, t);
		return t.text = t.node = a.pre, a.bgClass && (t.bgClass = a.bgClass), a.textClass && (t.textClass = a.textClass), P(t), V(e, t, i, n), B(e, t, n), t.node
	}
	function B(e, t, i) {
		if (H(e, t.line, t, i, !0), t.rest) for (var n = 0; n < t.rest.length; n++) H(e, t.rest[n], t, i, !1)
	}
	function H(e, t, i, n, a) {
		if (t.widgets) for (var o = O(i), r = 0, s = t.widgets; r < s.length; ++r) {
			var l = s[r],
				d = Ma("div", [l.node], "CodeMirror-linewidget");
			l.handleMouseEvents || d.setAttribute("cm-ignore-events", "true"), G(l, d, i, n), e.display.input.setUneditable(d), a && l.above ? o.insertBefore(d, i.gutter || i.text) : o.appendChild(d), va(l, "redraw")
		}
	}
	function G(e, t, i, n) {
		if (e.noHScroll) {
			(i.alignable || (i.alignable = [])).push(t);
			var a = n.wrapperWidth;
			t.style.left = n.fixedPos + "px", e.coverGutter || (a -= n.gutterTotalWidth, t.style.paddingLeft = n.gutterTotalWidth + "px"), t.style.width = a + "px"
		}
		e.coverGutter && (t.style.zIndex = 5, t.style.position = "relative", e.noHScroll || (t.style.marginLeft = -n.gutterTotalWidth + "px"))
	}
	function j(e) {
		return Io(e.line, e.ch)
	}
	function z(e, t) {
		return ko(e, t) < 0 ? t : e
	}
	function K(e, t) {
		return ko(e, t) < 0 ? e : t
	}
	function Y(e) {
		e.state.focused || (e.display.input.focus(), ci(e))
	}
	function q(e) {
		return e.options.readOnly || e.doc.cantEdit
	}
	function Q(e, t, i, n, a) {
		var o = e.doc;
		e.display.shift = !1, n || (n = o.sel);
		var r = e.state.pasteIncoming || "paste" == a,
			s = Hr(t),
			l = null;
		r && n.ranges.length > 1 && (Lo && Lo.join("\n") == t ? l = n.ranges.length % Lo.length == 0 && Ea(Lo, Hr) : s.length == n.ranges.length && (l = Ea(s, function(e) {
			return [e]
		})));
		for (var d = n.ranges.length - 1; d >= 0; d--) {
			var u = n.ranges[d],
				c = u.from(),
				f = u.to();
			u.empty() && (i && i > 0 ? c = Io(c.line, c.ch - i) : e.state.overwrite && !r && (f = Io(f.line, Math.min(Gn(o, f.line).text.length, f.ch + Sa(s).length))));
			var h = e.curOp.updateInput,
				p = {
					from: c,
					to: f,
					text: l ? l[d % l.length] : s,
					origin: a || (r ? "paste" : e.state.cutIncoming ? "cut" : "+input")
				};
			xi(e.doc, p), va(e, "inputRead", e, p)
		}
		t && !r && Z(e, t), Ai(e), e.curOp.updateInput = h, e.curOp.typing = !0, e.state.pasteIncoming = e.state.cutIncoming = !1
	}
	function J(e, t) {
		var i = e.clipboardData && e.clipboardData.getData("text/plain");
		if (i) return e.preventDefault(), Xt(t, function() {
			Q(t, i, 0, null, "paste")
		}), !0
	}
	function Z(e, t) {
		if (e.options.electricChars && e.options.smartIndent) for (var i = e.doc.sel, n = i.ranges.length - 1; n >= 0; n--) {
			var a = i.ranges[n];
			if (!(a.head.ch > 100 || n && i.ranges[n - 1].head.line == a.head.line)) {
				var o = e.getModeAt(a.head),
					r = !1;
				if (o.electricChars) {
					for (var s = 0; s < o.electricChars.length; s++) if (t.indexOf(o.electricChars.charAt(s)) > -1) {
						r = Wi(e, a.head.line, "smart");
						break
					}
				} else o.electricInput && o.electricInput.test(Gn(e.doc, a.head.line).text.slice(0, a.head.ch)) && (r = Wi(e, a.head.line, "smart"));
				r && va(e, "electricInput", e, a.head.line)
			}
		}
	}
	function ee(e) {
		for (var t = [], i = [], n = 0; n < e.doc.sel.ranges.length; n++) {
			var a = e.doc.sel.ranges[n].head.line,
				o = {
					anchor: Io(a, 0),
					head: Io(a + 1, 0)
				};
			i.push(o), t.push(e.getRange(o.anchor, o.head))
		}
		return {
			text: t,
			ranges: i
		}
	}
	function te(e) {
		e.setAttribute("autocorrect", "off"), e.setAttribute("autocapitalize", "off"), e.setAttribute("spellcheck", "false")
	}
	function ie(e) {
		this.cm = e, this.prevInput = "", this.pollingFast = !1, this.polling = new Ca, this.inaccurateSelection = !1, this.hasSelection = !1, this.composing = null
	}
	function ne() {
		var e = Ma("textarea", null, null, "position: absolute; padding: 0; width: 1px; height: 1em; outline: none"),
			t = Ma("div", [e], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
		return ho ? e.style.width = "1000px" : e.setAttribute("wrap", "off"), xo && (e.style.border = "1px solid black"), te(e), t
	}
	function ae(e) {
		this.cm = e, this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null, this.polling = new Ca, this.gracePeriod = !1
	}
	function oe(e, t) {
		var i = Qe(e, t.line);
		if (!i || i.hidden) return null;
		var n = Gn(e.doc, t.line),
			a = Ke(i, n, t.line),
			o = Jn(n),
			r = "left";
		o && (r = no(o, t.ch) % 2 ? "right" : "left");
		var s = et(a.map, t.ch, r);
		return s.offset = "right" == s.collapse ? s.end : s.start, s
	}
	function re(e, t) {
		return t && (e.bad = !0), e
	}
	function se(e, t, i) {
		var n;
		if (t == e.display.lineDiv) {
			if (!(n = e.display.lineDiv.childNodes[i])) return re(e.clipPos(Io(e.display.viewTo - 1)), !0);
			t = null, i = 0
		} else for (n = t;; n = n.parentNode) {
			if (!n || n == e.display.lineDiv) return null;
			if (n.parentNode && n.parentNode == e.display.lineDiv) break
		}
		for (var a = 0; a < e.display.view.length; a++) {
			var o = e.display.view[a];
			if (o.node == n) return le(o, t, i)
		}
	}
	function le(e, t, i) {
		function n(t, i, n) {
			for (var a = -1; a < (u ? u.length : 0); a++) for (var o = a < 0 ? d.map : u[a], r = 0; r < o.length; r += 3) {
				var s = o[r + 2];
				if (s == t || s == i) {
					var l = Yn(a < 0 ? e.line : e.rest[a]),
						c = o[r] + n;
					return (n < 0 || s != t) && (c = o[r + (n ? 1 : 0)]), Io(l, c)
				}
			}
		}
		var a = e.text.firstChild,
			o = !1;
		if (!t || !Dr(a, t)) return re(Io(Yn(e.line), 0), !0);
		if (t == a && (o = !0, t = a.childNodes[i], i = 0, !t)) {
			var r = e.rest ? Sa(e.rest) : e.line;
			return re(Io(Yn(r), r.text.length), o)
		}
		var s = 3 == t.nodeType ? t : null,
			l = t;
		for (s || 1 != t.childNodes.length || 3 != t.firstChild.nodeType || (s = t.firstChild, i && (i = s.nodeValue.length)); l.parentNode != a;) l = l.parentNode;
		var d = e.measure,
			u = d.maps,
			c = n(s, l, i);
		if (c) return re(c, o);
		for (var f = l.nextSibling, h = s ? s.nodeValue.length - i : 0; f; f = f.nextSibling) {
			if (c = n(f, f.firstChild, 0)) return re(Io(c.line, c.ch - h), o);
			h += f.textContent.length
		}
		for (var p = l.previousSibling, h = i; p; p = p.previousSibling) {
			if (c = n(p, p.firstChild, -1)) return re(Io(c.line, c.ch + h), o);
			h += f.textContent.length
		}
	}
	function de(e, t, i, n, a) {
		function o(e) {
			return function(t) {
				return t.id == e
			}
		}
		function r(t) {
			if (1 == t.nodeType) {
				var i = t.getAttribute("cm-text");
				if (null != i) return "" == i && (i = t.textContent.replace(/​/g, "")), void(s += i);
				var d, u = t.getAttribute("cm-marker");
				if (u) {
					var c = e.findMarks(Io(n, 0), Io(a + 1, 0), o(+u));
					return void(c.length && (d = c[0].find()) && (s += jn(e.doc, d.from, d.to).join("\n")))
				}
				if ("false" == t.getAttribute("contenteditable")) return;
				for (var f = 0; f < t.childNodes.length; f++) r(t.childNodes[f]);
				/^(pre|div|p)$/i.test(t.nodeName) && (l = !0)
			} else if (3 == t.nodeType) {
				var h = t.nodeValue;
				if (!h) return;
				l && (s += "\n", l = !1), s += h
			}
		}
		for (var s = "", l = !1; r(t), t != i;) t = t.nextSibling;
		return s
	}
	function ue(e, t) {
		this.ranges = e, this.primIndex = t
	}
	function ce(e, t) {
		this.anchor = e, this.head = t
	}
	function fe(e, t) {
		var i = e[t];
		e.sort(function(e, t) {
			return ko(e.from(), t.from())
		}), t = Xa(e, i);
		for (var n = 1; n < e.length; n++) {
			var a = e[n],
				o = e[n - 1];
			if (ko(o.to(), a.from()) >= 0) {
				var r = K(o.from(), a.from()),
					s = z(o.to(), a.to()),
					l = o.empty() ? a.from() == a.head : o.from() == o.head;
				n <= t && --t, e.splice(--n, 2, new ce(l ? s : r, l ? r : s))
			}
		}
		return new ue(e, t)
	}
	function he(e, t) {
		return new ue([new ce(e, t || e)], 0)
	}
	function pe(e, t) {
		return Math.max(e.first, Math.min(t, e.first + e.size - 1))
	}
	function me(e, t) {
		if (t.line < e.first) return Io(e.first, 0);
		var i = e.first + e.size - 1;
		return t.line > i ? Io(i, Gn(e, i).text.length) : ge(t, Gn(e, t.line).text.length)
	}
	function ge(e, t) {
		var i = e.ch;
		return null == i || i > t ? Io(e.line, t) : i < 0 ? Io(e.line, 0) : e
	}
	function ve(e, t) {
		return t >= e.first && t < e.first + e.size
	}
	function ye(e, t) {
		for (var i = [], n = 0; n < t.length; n++) i[n] = me(e, t[n]);
		return i
	}
	function we(e, t, i, n) {
		if (e.cm && e.cm.display.shift || e.extend) {
			var a = t.anchor;
			if (n) {
				var o = ko(i, a) < 0;
				o != ko(n, a) < 0 ? (a = i, i = n) : o != ko(i, n) < 0 && (i = n)
			}
			return new ce(a, i)
		}
		return new ce(n || i, i)
	}
	function xe(e, t, i, n) {
		Se(e, new ue([we(e, e.sel.primary(), t, i)], 0), n)
	}
	function Fe(e, t, i) {
		for (var n = [], a = 0; a < e.sel.ranges.length; a++) n[a] = we(e, e.sel.ranges[a], t[a], null);
		Se(e, fe(n, e.sel.primIndex), i)
	}
	function be(e, t, i, n) {
		var a = e.sel.ranges.slice(0);
		a[t] = i, Se(e, fe(a, e.sel.primIndex), n)
	}
	function Ce(e, t, i, n) {
		Se(e, he(t, i), n)
	}
	function _e(e, t) {
		var i = {
			ranges: t.ranges,
			update: function(t) {
				this.ranges = [];
				for (var i = 0; i < t.length; i++) this.ranges[i] = new ce(me(e, t[i].anchor), me(e, t[i].head))
			}
		};
		return Cr(e, "beforeSelectionChange", e, i), e.cm && Cr(e.cm, "beforeSelectionChange", e.cm, i), i.ranges != t.ranges ? fe(i.ranges, i.ranges.length - 1) : t
	}
	function Te(e, t, i) {
		var n = e.history.done,
			a = Sa(n);
		a && a.ranges ? (n[n.length - 1] = t, Xe(e, t, i)) : Se(e, t, i)
	}
	function Se(e, t, i) {
		Xe(e, t, i), oa(e, e.sel, e.cm ? e.cm.curOp.id : NaN, i)
	}
	function Xe(e, t, i) {
		(Fa(e, "beforeSelectionChange") || e.cm && Fa(e.cm, "beforeSelectionChange")) && (t = _e(e, t)), Ee(e, ke(e, t, i && i.bias || (ko(t.primary().head, e.sel.primary().head) < 0 ? -1 : 1), !0)), i && !1 === i.scroll || !e.cm || Ai(e.cm)
	}
	function Ee(e, t) {
		t.equals(e.sel) || (e.sel = t, e.cm && (e.cm.curOp.updateInput = e.cm.curOp.selectionChanged = !0, xa(e.cm)), va(e, "cursorActivity", e))
	}
	function Ie(e) {
		Ee(e, ke(e, e.sel, null, !1), Xr)
	}
	function ke(e, t, i, n) {
		for (var a, o = 0; o < t.ranges.length; o++) {
			var r = t.ranges[o],
				s = Le(e, r.anchor, i, n),
				l = Le(e, r.head, i, n);
			(a || s != r.anchor || l != r.head) && (a || (a = t.ranges.slice(0, o)), a[o] = new ce(s, l))
		}
		return a ? fe(a, t.primIndex) : t
	}
	function Le(e, t, i, n) {
		var a = !1,
			o = t,
			r = i || 1;
		e.cantEdit = !1;
		e: for (;;) {
			var s = Gn(e, o.line);
			if (s.markedSpans) for (var l = 0; l < s.markedSpans.length; ++l) {
				var d = s.markedSpans[l],
					u = d.marker;
				if ((null == d.from || (u.inclusiveLeft ? d.from <= o.ch : d.from < o.ch)) && (null == d.to || (u.inclusiveRight ? d.to >= o.ch : d.to > o.ch))) {
					if (n && (Cr(u, "beforeCursorEnter"), u.explicitlyCleared)) {
						if (s.markedSpans) {
							--l;
							continue
						}
						break
					}
					if (!u.atomic) continue;
					var c = u.find(r < 0 ? -1 : 1);
					if (0 == ko(c, o) && (c.ch += r, c.ch < 0 ? c = c.line > e.first ? me(e, Io(c.line - 1)) : null : c.ch > s.text.length && (c = c.line < e.first + e.size - 1 ? Io(c.line + 1, 0) : null), !c)) {
						if (a) return n ? (e.cantEdit = !0, Io(e.first, 0)) : Le(e, t, i, !0);
						a = !0, c = t, r = -r
					}
					o = c;
					continue e
				}
			}
			return o
		}
	}
	function Ae(e) {
		e.display.input.showSelection(e.display.input.prepareSelection())
	}
	function Ne(e, t) {
		for (var i = e.doc, n = {}, a = n.cursors = document.createDocumentFragment(), o = n.selection = document.createDocumentFragment(), r = 0; r < i.sel.ranges.length; r++) if (!1 !== t || r != i.sel.primIndex) {
			var s = i.sel.ranges[r],
				l = s.empty();
			(l || e.options.showCursorWhenSelecting) && We(e, s, a), l || Oe(e, s, o)
		}
		return n
	}
	function We(e, t, i) {
		var n = ct(e, t.head, "div", null, null, !e.options.singleCursorHeightPerLine),
			a = i.appendChild(Ma("div", " ", "CodeMirror-cursor"));
		if (a.style.left = n.left + "px", a.style.top = n.top + "px", a.style.height = Math.max(0, n.bottom - n.top) * e.options.cursorHeight + "px", n.other) {
			var o = i.appendChild(Ma("div", " ", "CodeMirror-cursor CodeMirror-secondarycursor"));
			o.style.display = "", o.style.left = n.other.left + "px", o.style.top = n.other.top + "px", o.style.height = .85 * (n.other.bottom - n.other.top) + "px"
		}
	}
	function Oe(e, t, i) {
		function n(e, t, i, n) {
			t < 0 && (t = 0), t = Math.round(t), n = Math.round(n), s.appendChild(Ma("div", null, "CodeMirror-selected", "position: absolute; left: " + e + "px; top: " + t + "px; width: " + (null == i ? u - e : i) + "px; height: " + (n - t) + "px"))
		}
		function a(t, i, a) {
			function o(i, n) {
				return ut(e, Io(t, i), "div", c, n)
			}
			var s, l, c = Gn(r, t),
				f = c.text.length;
			return Ka(Jn(c), i || 0, null == a ? f : a, function(e, t, r) {
				var c, h, p, m = o(e, "left");
				if (e == t) c = m, h = p = m.left;
				else {
					if (c = o(t - 1, "right"), "rtl" == r) {
						var g = m;
						m = c, c = g
					}
					h = m.left, p = c.right
				}
				null == i && 0 == e && (h = d), c.top - m.top > 3 && (n(h, m.top, null, m.bottom), h = d, m.bottom < c.top && n(h, m.bottom, null, c.top)), null == a && t == f && (p = u), (!s || m.top < s.top || m.top == s.top && m.left < s.left) && (s = m), (!l || c.bottom > l.bottom || c.bottom == l.bottom && c.right > l.right) && (l = c), h < d + 1 && (h = d), n(h, c.top, p - h, c.bottom)
			}), {
				start: s,
				end: l
			}
		}
		var o = e.display,
			r = e.doc,
			s = document.createDocumentFragment(),
			l = Be(e.display),
			d = l.left,
			u = Math.max(o.sizerWidth, Ge(e) - o.sizer.offsetLeft) - l.right,
			c = t.from(),
			f = t.to();
		if (c.line == f.line) a(c.line, c.ch, f.ch);
		else {
			var h = Gn(r, c.line),
				p = Gn(r, f.line),
				m = hn(h) == hn(p),
				g = a(c.line, c.ch, m ? h.text.length + 1 : null).end,
				v = a(f.line, m ? 0 : null, f.ch).start;
			m && (g.top < v.top - 2 ? (n(g.right, g.top, null, g.bottom), n(d, v.top, v.left, v.bottom)) : n(g.right, g.top, v.left - g.right, g.bottom)), g.bottom < v.top && n(d, g.bottom, null, v.top)
		}
		i.appendChild(s)
	}
	function Me(e) {
		if (e.state.focused) {
			var t = e.display;
			clearInterval(t.blinker);
			var i = !0;
			t.cursorDiv.style.visibility = "", e.options.cursorBlinkRate > 0 ? t.blinker = setInterval(function() {
				t.cursorDiv.style.visibility = (i = !i) ? "" : "hidden"
			}, e.options.cursorBlinkRate) : e.options.cursorBlinkRate < 0 && (t.cursorDiv.style.visibility = "hidden")
		}
	}
	function De(e, t) {
		e.doc.mode.startState && e.doc.frontier < e.display.viewTo && e.state.highlight.set(t, Aa(Ue, e))
	}
	function Ue(e) {
		var t = e.doc;
		if (t.frontier < t.first && (t.frontier = t.first), !(t.frontier >= e.display.viewTo)) {
			var i = +new Date + e.options.workTime,
				n = Zo(t.mode, Ve(e, t.frontier)),
				a = [];
			t.iter(t.frontier, Math.min(t.first + t.size, e.display.viewTo + 500), function(o) {
				if (t.frontier >= e.display.viewFrom) {
					var r = o.styles,
						s = In(e, o, n, !0);
					o.styles = s.styles;
					var l = o.styleClasses,
						d = s.classes;
					d ? o.styleClasses = d : l && (o.styleClasses = null);
					for (var u = !r || r.length != o.styles.length || l != d && (!l || !d || l.bgClass != d.bgClass || l.textClass != d.textClass), c = 0; !u && c < r.length; ++c) u = r[c] != o.styles[c];
					u && a.push(t.frontier), o.stateAfter = Zo(t.mode, n)
				} else Ln(e, o.text, n), o.stateAfter = t.frontier % 5 == 0 ? Zo(t.mode, n) : null;
				if (++t.frontier, +new Date > i) return De(e, e.options.workDelay), !0
			}), a.length && Xt(e, function() {
				for (var t = 0; t < a.length; t++) Wt(e, a[t], "text")
			})
		}
	}
	function Pe(e, t, i) {
		for (var n, a, o = e.doc, r = i ? -1 : t - (e.doc.mode.innerMode ? 1e3 : 100), s = t; s > r; --s) {
			if (s <= o.first) return o.first;
			var l = Gn(o, s - 1);
			if (l.stateAfter && (!i || s <= o.frontier)) return s;
			var d = kr(l.text, null, e.options.tabSize);
			(null == a || n > d) && (a = s - 1, n = d)
		}
		return a
	}
	function Ve(e, t, i) {
		var n = e.doc,
			a = e.display;
		if (!n.mode.startState) return !0;
		var o = Pe(e, t, i),
			r = o > n.first && Gn(n, o - 1).stateAfter;
		return r = r ? Zo(n.mode, r) : er(n.mode), n.iter(o, t, function(i) {
			Ln(e, i.text, r);
			var s = o == t - 1 || o % 5 == 0 || o >= a.viewFrom && o < a.viewTo;
			i.stateAfter = s ? Zo(n.mode, r) : null, ++o
		}), i && (n.frontier = o), r
	}
	function Re(e) {
		return e.lineSpace.offsetTop
	}
	function $e(e) {
		return e.mover.offsetHeight - e.lineSpace.offsetHeight
	}
	function Be(e) {
		if (e.cachedPaddingH) return e.cachedPaddingH;
		var t = Ua(e.measure, Ma("pre", "x")),
			i = window.getComputedStyle ? window.getComputedStyle(t) : t.currentStyle,
			n = {
				left: parseInt(i.paddingLeft),
				right: parseInt(i.paddingRight)
			};
		return isNaN(n.left) || isNaN(n.right) || (e.cachedPaddingH = n), n
	}
	function He(e) {
		return Tr - e.display.nativeBarWidth
	}
	function Ge(e) {
		return e.display.scroller.clientWidth - He(e) - e.display.barWidth
	}
	function je(e) {
		return e.display.scroller.clientHeight - He(e) - e.display.barHeight
	}
	function ze(e, t, i) {
		var n = e.options.lineWrapping,
			a = n && Ge(e);
		if (!t.measure.heights || n && t.measure.width != a) {
			var o = t.measure.heights = [];
			if (n) {
				t.measure.width = a;
				for (var r = t.text.firstChild.getClientRects(), s = 0; s < r.length - 1; s++) {
					var l = r[s],
						d = r[s + 1];
					Math.abs(l.bottom - d.bottom) > 2 && o.push((l.bottom + d.top) / 2 - i.top)
				}
			}
			o.push(i.bottom - i.top)
		}
	}
	function Ke(e, t, i) {
		if (e.line == t) return {
			map: e.measure.map,
			cache: e.measure.cache
		};
		for (n = 0; n < e.rest.length; n++) if (e.rest[n] == t) return {
			map: e.measure.maps[n],
			cache: e.measure.caches[n]
		};
		for (var n = 0; n < e.rest.length; n++) if (Yn(e.rest[n]) > i) return {
			map: e.measure.maps[n],
			cache: e.measure.caches[n],
			before: !0
		}
	}
	function Ye(e, t) {
		var i = Yn(t = hn(t)),
			n = e.display.externalMeasured = new Lt(e.doc, t, i);
		n.lineN = i;
		var a = n.built = Nn(e, n);
		return n.text = a.pre, Ua(e.display.lineMeasure, a.pre), n
	}
	function qe(e, t, i, n) {
		return Ze(e, Je(e, t), i, n)
	}
	function Qe(e, t) {
		if (t >= e.display.viewFrom && t < e.display.viewTo) return e.display.view[Mt(e, t)];
		var i = e.display.externalMeasured;
		return i && t >= i.lineN && t < i.lineN + i.size ? i : void 0
	}
	function Je(e, t) {
		var i = Yn(t),
			n = Qe(e, i);
		n && !n.text ? n = null : n && n.changes && W(e, n, i, A(e)), n || (n = Ye(e, t));
		var a = Ke(n, t, i);
		return {
			line: t,
			view: n,
			rect: null,
			map: a.map,
			cache: a.cache,
			before: a.before,
			hasHeights: !1
		}
	}
	function Ze(e, t, i, n, a) {
		t.before && (i = -1);
		var o, r = i + (n || "");
		return t.cache.hasOwnProperty(r) ? o = t.cache[r] : (t.rect || (t.rect = t.view.text.getBoundingClientRect()), t.hasHeights || (ze(e, t.view, t.rect), t.hasHeights = !0), (o = tt(e, t, i, n)).bogus || (t.cache[r] = o)), {
			left: o.left,
			right: o.right,
			top: a ? o.rtop : o.top,
			bottom: a ? o.rbottom : o.bottom
		}
	}
	function et(e, t, i) {
		for (var n, a, o, r, s = 0; s < e.length; s += 3) {
			var l = e[s],
				d = e[s + 1];
			if (t < l ? (a = 0, o = 1, r = "left") : t < d ? o = (a = t - l) + 1 : (s == e.length - 3 || t == d && e[s + 3] > t) && (a = (o = d - l) - 1, t >= d && (r = "right")), null != a) {
				if (n = e[s + 2], l == d && i == (n.insertLeft ? "left" : "right") && (r = i), "left" == i && 0 == a) for (; s && e[s - 2] == e[s - 3] && e[s - 1].insertLeft;) n = e[2 + (s -= 3)], r = "left";
				if ("right" == i && a == d - l) for (; s < e.length - 3 && e[s + 3] == e[s + 4] && !e[s + 5].insertLeft;) n = e[(s += 3) + 2], r = "right";
				break
			}
		}
		return {
			node: n,
			start: a,
			end: o,
			collapse: r,
			coverStart: l,
			coverEnd: d
		}
	}
	function tt(e, t, i, n) {
		var a, o = et(t.map, i, n),
			r = o.node,
			s = o.start,
			l = o.end,
			d = o.collapse;
		if (3 == r.nodeType) {
			for (g = 0; g < 4; g++) {
				for (; s && Oa(t.line.text.charAt(o.coverStart + s));)--s;
				for (; o.coverStart + l < o.coverEnd && Oa(t.line.text.charAt(o.coverStart + l));)++l;
				if ((a = co && fo < 9 && 0 == s && l == o.coverEnd - o.coverStart ? r.parentNode.getBoundingClientRect() : co && e.options.lineWrapping ? (u = Nr(r, s, l).getClientRects()).length ? u["right" == n ? u.length - 1 : 0] : Oo : Nr(r, s, l).getBoundingClientRect() || Oo).left || a.right || 0 == s) break;
				l = s, s -= 1, d = "right"
			}
			co && fo < 11 && (a = it(e.display.measure, a))
		} else {
			s > 0 && (d = n = "right");
			var u;
			a = e.options.lineWrapping && (u = r.getClientRects()).length > 1 ? u["right" == n ? u.length - 1 : 0] : r.getBoundingClientRect()
		}
		if (co && fo < 9 && !s && (!a || !a.left && !a.right)) {
			var c = r.parentNode.getClientRects()[0];
			a = c ? {
				left: c.left,
				right: c.left + vt(e.display),
				top: c.top,
				bottom: c.bottom
			} : Oo
		}
		for (var f = a.top - t.rect.top, h = a.bottom - t.rect.top, p = (f + h) / 2, m = t.view.measure.heights, g = 0; g < m.length - 1 && !(p < m[g]); g++);
		var v = g ? m[g - 1] : 0,
			y = m[g],
			w = {
				left: ("right" == d ? a.right : a.left) - t.rect.left,
				right: ("left" == d ? a.left : a.right) - t.rect.left,
				top: v,
				bottom: y
			};
		return a.left || a.right || (w.bogus = !0), e.options.singleCursorHeightPerLine || (w.rtop = f, w.rbottom = h), w
	}
	function it(e, t) {
		if (!window.screen || null == screen.logicalXDPI || screen.logicalXDPI == screen.deviceXDPI || !za(e)) return t;
		var i = screen.logicalXDPI / screen.deviceXDPI,
			n = screen.logicalYDPI / screen.deviceYDPI;
		return {
			left: t.left * i,
			right: t.right * i,
			top: t.top * n,
			bottom: t.bottom * n
		}
	}
	function nt(e) {
		if (e.measure && (e.measure.cache = {}, e.measure.heights = null, e.rest)) for (var t = 0; t < e.rest.length; t++) e.measure.caches[t] = {}
	}
	function at(e) {
		e.display.externalMeasure = null, Da(e.display.lineMeasure);
		for (var t = 0; t < e.display.view.length; t++) nt(e.display.view[t])
	}
	function ot(e) {
		at(e), e.display.cachedCharWidth = e.display.cachedTextHeight = e.display.cachedPaddingH = null, e.options.lineWrapping || (e.display.maxLineChanged = !0), e.display.lineNumChars = null
	}
	function rt() {
		return window.pageXOffset || (document.documentElement || document.body).scrollLeft
	}
	function st() {
		return window.pageYOffset || (document.documentElement || document.body).scrollTop
	}
	function lt(e, t, i, n) {
		if (t.widgets) for (var a = 0; a < t.widgets.length; ++a) if (t.widgets[a].above) {
			var o = xn(t.widgets[a]);
			i.top += o, i.bottom += o
		}
		if ("line" == n) return i;
		n || (n = "local");
		var r = Qn(t);
		if ("local" == n ? r += Re(e.display) : r -= e.display.viewOffset, "page" == n || "window" == n) {
			var s = e.display.lineSpace.getBoundingClientRect();
			r += s.top + ("window" == n ? 0 : st());
			var l = s.left + ("window" == n ? 0 : rt());
			i.left += l, i.right += l
		}
		return i.top += r, i.bottom += r, i
	}
	function dt(e, t, i) {
		if ("div" == i) return t;
		var n = t.left,
			a = t.top;
		if ("page" == i) n -= rt(), a -= st();
		else if ("local" == i || !i) {
			var o = e.display.sizer.getBoundingClientRect();
			n += o.left, a += o.top
		}
		var r = e.display.lineSpace.getBoundingClientRect();
		return {
			left: n - r.left,
			top: a - r.top
		}
	}
	function ut(e, t, i, n, a) {
		return n || (n = Gn(e.doc, t.line)), lt(e, n, qe(e, n, t.ch, a), i)
	}
	function ct(e, t, i, n, a, o) {
		function r(t, r) {
			var s = Ze(e, a, t, r ? "right" : "left", o);
			return r ? s.left = s.right : s.right = s.left, lt(e, n, s, i)
		}
		function s(e, t) {
			var i = l[t],
				n = i.level % 2;
			return e == Ya(i) && t && i.level < l[t - 1].level ? (e = qa(i = l[--t]) - (i.level % 2 ? 0 : 1), n = !0) : e == qa(i) && t < l.length - 1 && i.level < l[t + 1].level && (e = Ya(i = l[++t]) - i.level % 2, n = !1), n && e == i.to && e > i.from ? r(e - 1) : r(e, n)
		}
		n = n || Gn(e.doc, t.line), a || (a = Je(e, n));
		var l = Jn(n),
			d = t.ch;
		if (!l) return r(d);
		var u = s(d, no(l, d));
		return null != Yr && (u.other = s(d, Yr)), u
	}
	function ft(e, t) {
		var i = 0,
			t = me(e.doc, t);
		e.options.lineWrapping || (i = vt(e.display) * t.ch);
		var n = Gn(e.doc, t.line),
			a = Qn(n) + Re(e.display);
		return {
			left: i,
			right: i,
			top: a,
			bottom: a + n.height
		}
	}
	function ht(e, t, i, n) {
		var a = Io(e, t);
		return a.xRel = n, i && (a.outside = !0), a
	}
	function pt(e, t, i) {
		var n = e.doc;
		if ((i += e.display.viewOffset) < 0) return ht(n.first, 0, !0, -1);
		var a = qn(n, i),
			o = n.first + n.size - 1;
		if (a > o) return ht(n.first + n.size - 1, Gn(n, o).text.length, !0, 1);
		t < 0 && (t = 0);
		for (var r = Gn(n, a);;) {
			var s = mt(e, r, a, t, i),
				l = cn(r),
				d = l && l.find(0, !0);
			if (!l || !(s.ch > d.from.ch || s.ch == d.from.ch && s.xRel > 0)) return s;
			a = Yn(r = d.to.line)
		}
	}
	function mt(e, t, i, n, a) {
		function o(n) {
			var a = ct(e, Io(i, n), "line", t, d);
			return s = !0, r > a.bottom ? a.left - l : r < a.top ? a.left + l : (s = !1, a.left)
		}
		var r = a - Qn(t),
			s = !1,
			l = 2 * e.display.wrapper.clientWidth,
			d = Je(e, t),
			u = Jn(t),
			c = t.text.length,
			f = Qa(t),
			h = Ja(t),
			p = o(f),
			m = s,
			g = o(h),
			v = s;
		if (n > g) return ht(i, h, v, 1);
		for (;;) {
			if (u ? h == f || h == oo(t, f, 1) : h - f <= 1) {
				for (var y = n < p || n - p <= g - n ? f : h, w = n - (y == f ? p : g); Oa(t.text.charAt(y));)++y;
				return ht(i, y, y == f ? m : v, w < -1 ? -1 : w > 1 ? 1 : 0)
			}
			var x = Math.ceil(c / 2),
				F = f + x;
			if (u) {
				F = f;
				for (var b = 0; b < x; ++b) F = oo(t, F, 1)
			}
			var C = o(F);
			C > n ? (h = F, g = C, (v = s) && (g += 1e3), c = x) : (f = F, p = C, m = s, c -= x)
		}
	}
	function gt(e) {
		if (null != e.cachedTextHeight) return e.cachedTextHeight;
		if (null == Ao) {
			Ao = Ma("pre");
			for (var t = 0; t < 49; ++t) Ao.appendChild(document.createTextNode("x")), Ao.appendChild(Ma("br"));
			Ao.appendChild(document.createTextNode("x"))
		}
		Ua(e.measure, Ao);
		var i = Ao.offsetHeight / 50;
		return i > 3 && (e.cachedTextHeight = i), Da(e.measure), i || 1
	}
	function vt(e) {
		if (null != e.cachedCharWidth) return e.cachedCharWidth;
		var t = Ma("span", "xxxxxxxxxx"),
			i = Ma("pre", [t]);
		Ua(e.measure, i);
		var n = t.getBoundingClientRect(),
			a = (n.right - n.left) / 10;
		return a > 2 && (e.cachedCharWidth = a), a || 10
	}
	function yt(e) {
		e.curOp = {
			cm: e,
			viewChanged: !1,
			startHeight: e.doc.height,
			forceUpdate: !1,
			updateInput: null,
			typing: !1,
			changeObjs: null,
			cursorActivityHandlers: null,
			cursorActivityCalled: 0,
			selectionChanged: !1,
			updateMaxLine: !1,
			scrollLeft: null,
			scrollTop: null,
			scrollToPos: null,
			focus: !1,
			id: ++Do
		}, Mo ? Mo.ops.push(e.curOp) : e.curOp.ownsGroup = Mo = {
			ops: [e.curOp],
			delayedCallbacks: []
		}
	}
	function wt(e) {
		var t = e.delayedCallbacks,
			i = 0;
		do {
			for (; i < t.length; i++) t[i]();
			for (var n = 0; n < e.ops.length; n++) {
				var a = e.ops[n];
				if (a.cursorActivityHandlers) for (; a.cursorActivityCalled < a.cursorActivityHandlers.length;) a.cursorActivityHandlers[a.cursorActivityCalled++](a.cm)
			}
		} while (i < t.length)
	}
	function xt(e) {
		var t = e.curOp.ownsGroup;
		if (t) try {
			wt(t)
		} finally {
			Mo = null;
			for (var i = 0; i < t.ops.length; i++) t.ops[i].cm.curOp = null;
			Ft(t)
		}
	}
	function Ft(e) {
		for (var t = e.ops, i = 0; i < t.length; i++) bt(t[i]);
		for (i = 0; i < t.length; i++) Ct(t[i]);
		for (i = 0; i < t.length; i++) _t(t[i]);
		for (i = 0; i < t.length; i++) Tt(t[i]);
		for (i = 0; i < t.length; i++) St(t[i])
	}
	function bt(e) {
		var t = e.cm,
			i = t.display;
		T(t), e.updateMaxLine && c(t), e.mustUpdate = e.viewChanged || e.forceUpdate || null != e.scrollTop || e.scrollToPos && (e.scrollToPos.from.line < i.viewFrom || e.scrollToPos.to.line >= i.viewTo) || i.maxLineChanged && t.options.lineWrapping, e.update = e.mustUpdate && new _(t, e.mustUpdate && {
			top: e.scrollTop,
			ensure: e.scrollToPos
		}, e.forceUpdate)
	}
	function Ct(e) {
		e.updatedDisplay = e.mustUpdate && S(e.cm, e.update)
	}
	function _t(e) {
		var t = e.cm,
			i = t.display;
		e.updatedDisplay && k(t), e.barMeasure = h(t), i.maxLineChanged && !t.options.lineWrapping && (e.adjustWidthTo = qe(t, i.maxLine, i.maxLine.text.length).left + 3, t.display.sizerWidth = e.adjustWidthTo, e.barMeasure.scrollWidth = Math.max(i.scroller.clientWidth, i.sizer.offsetLeft + e.adjustWidthTo + He(t) + t.display.barWidth), e.maxScrollLeft = Math.max(0, i.sizer.offsetLeft + e.adjustWidthTo - Ge(t))), (e.updatedDisplay || e.selectionChanged) && (e.preparedSelection = i.input.prepareSelection())
	}
	function Tt(e) {
		var t = e.cm;
		null != e.adjustWidthTo && (t.display.sizer.style.minWidth = e.adjustWidthTo + "px", e.maxScrollLeft < t.doc.scrollLeft && Zt(t, Math.min(t.display.scroller.scrollLeft, e.maxScrollLeft), !0), t.display.maxLineChanged = !1), e.preparedSelection && t.display.input.showSelection(e.preparedSelection), e.updatedDisplay && I(t, e.barMeasure), (e.updatedDisplay || e.startHeight != t.doc.height) && v(t, e.barMeasure), e.selectionChanged && Me(t), t.state.focused && e.updateInput && t.display.input.reset(e.typing), e.focus && e.focus == Pa() && Y(e.cm)
	}
	function St(e) {
		var t = e.cm,
			i = t.display,
			n = t.doc;
		if (e.updatedDisplay && X(t, e.update), null == i.wheelStartX || null == e.scrollTop && null == e.scrollLeft && !e.scrollToPos || (i.wheelStartX = i.wheelStartY = null), null == e.scrollTop || i.scroller.scrollTop == e.scrollTop && !e.forceScroll || (n.scrollTop = Math.max(0, Math.min(i.scroller.scrollHeight - i.scroller.clientHeight, e.scrollTop)), i.scrollbars.setScrollTop(n.scrollTop), i.scroller.scrollTop = n.scrollTop), null == e.scrollLeft || i.scroller.scrollLeft == e.scrollLeft && !e.forceScroll || (n.scrollLeft = Math.max(0, Math.min(i.scroller.scrollWidth - Ge(t), e.scrollLeft)), i.scrollbars.setScrollLeft(n.scrollLeft), i.scroller.scrollLeft = n.scrollLeft, x(t)), e.scrollToPos) {
			var a = Ei(t, me(n, e.scrollToPos.from), me(n, e.scrollToPos.to), e.scrollToPos.margin);
			e.scrollToPos.isCursor && t.state.focused && Xi(t, a)
		}
		var o = e.maybeHiddenMarkers,
			r = e.maybeUnhiddenMarkers;
		if (o) for (s = 0; s < o.length; ++s) o[s].lines.length || Cr(o[s], "hide");
		if (r) for (var s = 0; s < r.length; ++s) r[s].lines.length && Cr(r[s], "unhide");
		i.wrapper.offsetHeight && (n.scrollTop = t.display.scroller.scrollTop), e.changeObjs && Cr(t, "changes", t, e.changeObjs), e.update && e.update.finish()
	}
	function Xt(e, t) {
		if (e.curOp) return t();
		yt(e);
		try {
			return t()
		} finally {
			xt(e)
		}
	}
	function Et(e, t) {
		return function() {
			if (e.curOp) return t.apply(e, arguments);
			yt(e);
			try {
				return t.apply(e, arguments)
			} finally {
				xt(e)
			}
		}
	}
	function It(e) {
		return function() {
			if (this.curOp) return e.apply(this, arguments);
			yt(this);
			try {
				return e.apply(this, arguments)
			} finally {
				xt(this)
			}
		}
	}
	function kt(e) {
		return function() {
			var t = this.cm;
			if (!t || t.curOp) return e.apply(this, arguments);
			yt(t);
			try {
				return e.apply(this, arguments)
			} finally {
				xt(t)
			}
		}
	}
	function Lt(e, t, i) {
		this.line = t, this.rest = pn(t), this.size = this.rest ? Yn(Sa(this.rest)) - i + 1 : 1, this.node = this.text = null, this.hidden = vn(e, t)
	}
	function At(e, t, i) {
		for (var n, a = [], o = t; o < i; o = n) {
			var r = new Lt(e.doc, Gn(e.doc, o), o);
			n = o + r.size, a.push(r)
		}
		return a
	}
	function Nt(e, t, i, n) {
		null == t && (t = e.doc.first), null == i && (i = e.doc.first + e.doc.size), n || (n = 0);
		var a = e.display;
		if (n && i < a.viewTo && (null == a.updateLineNumbers || a.updateLineNumbers > t) && (a.updateLineNumbers = t), e.curOp.viewChanged = !0, t >= a.viewTo) Eo && mn(e.doc, t) < a.viewTo && Ot(e);
		else if (i <= a.viewFrom) Eo && gn(e.doc, i + n) > a.viewFrom ? Ot(e) : (a.viewFrom += n, a.viewTo += n);
		else if (t <= a.viewFrom && i >= a.viewTo) Ot(e);
		else if (t <= a.viewFrom)(o = Dt(e, i, i + n, 1)) ? (a.view = a.view.slice(o.index), a.viewFrom = o.lineN, a.viewTo += n) : Ot(e);
		else if (i >= a.viewTo) {
			var o = Dt(e, t, t, -1);
			o ? (a.view = a.view.slice(0, o.index), a.viewTo = o.lineN) : Ot(e)
		} else {
			var r = Dt(e, t, t, -1),
				s = Dt(e, i, i + n, 1);
			r && s ? (a.view = a.view.slice(0, r.index).concat(At(e, r.lineN, s.lineN)).concat(a.view.slice(s.index)), a.viewTo += n) : Ot(e)
		}
		var l = a.externalMeasured;
		l && (i < l.lineN ? l.lineN += n : t < l.lineN + l.size && (a.externalMeasured = null))
	}
	function Wt(e, t, i) {
		e.curOp.viewChanged = !0;
		var n = e.display,
			a = e.display.externalMeasured;
		if (a && t >= a.lineN && t < a.lineN + a.size && (n.externalMeasured = null), !(t < n.viewFrom || t >= n.viewTo)) {
			var o = n.view[Mt(e, t)];
			if (null != o.node) {
				var r = o.changes || (o.changes = []); - 1 == Xa(r, i) && r.push(i)
			}
		}
	}
	function Ot(e) {
		e.display.viewFrom = e.display.viewTo = e.doc.first, e.display.view = [], e.display.viewOffset = 0
	}
	function Mt(e, t) {
		if (t >= e.display.viewTo) return null;
		if ((t -= e.display.viewFrom) < 0) return null;
		for (var i = e.display.view, n = 0; n < i.length; n++) if ((t -= i[n].size) < 0) return n
	}
	function Dt(e, t, i, n) {
		var a, o = Mt(e, t),
			r = e.display.view;
		if (!Eo || i == e.doc.first + e.doc.size) return {
			index: o,
			lineN: i
		};
		for (var s = 0, l = e.display.viewFrom; s < o; s++) l += r[s].size;
		if (l != t) {
			if (n > 0) {
				if (o == r.length - 1) return null;
				a = l + r[o].size - t, o++
			} else a = l - t;
			t += a, i += a
		}
		for (; mn(e.doc, i) != i;) {
			if (o == (n < 0 ? 0 : r.length - 1)) return null;
			i += n * r[o - (n < 0 ? 1 : 0)].size, o += n
		}
		return {
			index: o,
			lineN: i
		}
	}
	function Ut(e, t, i) {
		var n = e.display;
		0 == n.view.length || t >= n.viewTo || i <= n.viewFrom ? (n.view = At(e, t, i), n.viewFrom = t) : (n.viewFrom > t ? n.view = At(e, t, n.viewFrom).concat(n.view) : n.viewFrom < t && (n.view = n.view.slice(Mt(e, t))), n.viewFrom = t, n.viewTo < i ? n.view = n.view.concat(At(e, n.viewTo, i)) : n.viewTo > i && (n.view = n.view.slice(0, Mt(e, i)))), n.viewTo = i
	}
	function Pt(e) {
		for (var t = e.display.view, i = 0, n = 0; n < t.length; n++) {
			var a = t[n];
			a.hidden || a.node && !a.changes || ++i
		}
		return i
	}
	function Vt(e) {
		function t() {
			a.activeTouch && (o = setTimeout(function() {
				a.activeTouch = null
			}, 1e3), (r = a.activeTouch).end = +new Date)
		}
		function i(e) {
			if (1 != e.touches.length) return !1;
			var t = e.touches[0];
			return t.radiusX <= 1 && t.radiusY <= 1
		}
		function n(e, t) {
			if (null == t.left) return !0;
			var i = t.left - e.left,
				n = t.top - e.top;
			return i * i + n * n > 400
		}
		var a = e.display;
		Fr(a.scroller, "mousedown", Et(e, Ht)), co && fo < 11 ? Fr(a.scroller, "dblclick", Et(e, function(t) {
			if (!wa(e, t)) {
				var i = Bt(e, t);
				if (i && !Yt(e, t) && !$t(e.display, t)) {
					yr(t);
					var n = e.findWordAt(i);
					xe(e.doc, n.anchor, n.head)
				}
			}
		})) : Fr(a.scroller, "dblclick", function(t) {
			wa(e, t) || yr(t)
		}), So || Fr(a.scroller, "contextmenu", function(t) {
			hi(e, t)
		});
		var o, r = {
			end: 0
		};
		Fr(a.scroller, "touchstart", function(e) {
			if (!i(e)) {
				clearTimeout(o);
				var t = +new Date;
				a.activeTouch = {
					start: t,
					moved: !1,
					prev: t - r.end <= 300 ? r : null
				}, 1 == e.touches.length && (a.activeTouch.left = e.touches[0].pageX, a.activeTouch.top = e.touches[0].pageY)
			}
		}), Fr(a.scroller, "touchmove", function() {
			a.activeTouch && (a.activeTouch.moved = !0)
		}), Fr(a.scroller, "touchend", function(i) {
			var o = a.activeTouch;
			if (o && !$t(a, i) && null != o.left && !o.moved && new Date - o.start < 300) {
				var r, s = e.coordsChar(a.activeTouch, "page");
				r = !o.prev || n(o, o.prev) ? new ce(s, s) : !o.prev.prev || n(o, o.prev.prev) ? e.findWordAt(s) : new ce(Io(s.line, 0), me(e.doc, Io(s.line + 1, 0))), e.setSelection(r.anchor, r.head), e.focus(), yr(i)
			}
			t()
		}), Fr(a.scroller, "touchcancel", t), Fr(a.scroller, "scroll", function() {
			a.scroller.clientHeight && (Jt(e, a.scroller.scrollTop), Zt(e, a.scroller.scrollLeft, !0), Cr(e, "scroll", e))
		}), Fr(a.scroller, "mousewheel", function(t) {
			ei(e, t)
		}), Fr(a.scroller, "DOMMouseScroll", function(t) {
			ei(e, t)
		}), Fr(a.wrapper, "scroll", function() {
			a.wrapper.scrollTop = a.wrapper.scrollLeft = 0
		}), a.dragFunctions = {
			simple: function(t) {
				wa(e, t) || xr(t)
			},
			start: function(t) {
				Qt(e, t)
			},
			drop: Et(e, qt)
		};
		var s = a.input.getField();
		Fr(s, "keyup", function(t) {
			li.call(e, t)
		}), Fr(s, "keydown", Et(e, ri)), Fr(s, "keypress", Et(e, di)), Fr(s, "focus", Aa(ci, e)), Fr(s, "blur", Aa(fi, e))
	}
	function Rt(e) {
		var t = e.display;
		t.lastWrapHeight == t.wrapper.clientHeight && t.lastWrapWidth == t.wrapper.clientWidth || (t.cachedCharWidth = t.cachedTextHeight = t.cachedPaddingH = null, t.scrollbarsClipped = !1, e.setSize())
	}
	function $t(e, t) {
		for (var i = ma(t); i != e.wrapper; i = i.parentNode) if (!i || 1 == i.nodeType && "true" == i.getAttribute("cm-ignore-events") || i.parentNode == e.sizer && i != e.mover) return !0
	}
	function Bt(e, t, i, n) {
		var a = e.display;
		if (!i && "true" == ma(t).getAttribute("cm-not-content")) return null;
		var o, r, s = a.lineSpace.getBoundingClientRect();
		try {
			o = t.clientX - s.left, r = t.clientY - s.top
		} catch (t) {
			return null
		}
		var l, d = pt(e, o, r);
		if (n && 1 == d.xRel && (l = Gn(e.doc, d.line).text).length == d.ch) {
			var u = kr(l, l.length, e.options.tabSize) - l.length;
			d = Io(d.line, Math.max(0, Math.round((o - Be(e.display).left) / vt(e.display)) - u))
		}
		return d
	}
	function Ht(e) {
		var t = this,
			i = t.display;
		if (!(i.activeTouch && i.input.supportsTouch() || wa(t, e))) if (i.shift = e.shiftKey, $t(i, e)) ho || (i.scroller.draggable = !1, setTimeout(function() {
			i.scroller.draggable = !0
		}, 100));
		else if (!Yt(t, e)) {
			var n = Bt(t, e);
			switch (window.focus(), ga(e)) {
			case 1:
				n ? Gt(t, e, n) : ma(e) == i.scroller && yr(e);
				break;
			case 2:
				ho && (t.state.lastMiddleDown = +new Date), n && xe(t.doc, n), setTimeout(function() {
					i.input.focus()
				}, 20), yr(e);
				break;
			case 3:
				So ? hi(t, e) : ui(t)
			}
		}
	}
	function Gt(e, t, i) {
		co ? setTimeout(Aa(Y, e), 0) : e.curOp.focus = Pa();
		var n, a = +new Date;
		Wo && Wo.time > a - 400 && 0 == ko(Wo.pos, i) ? n = "triple" : No && No.time > a - 400 && 0 == ko(No.pos, i) ? (n = "double", Wo = {
			time: a,
			pos: i
		}) : (n = "single", No = {
			time: a,
			pos: i
		});
		var o, r = e.doc.sel,
			s = bo ? t.metaKey : t.ctrlKey;
		e.options.dragDrop && Br && !q(e) && "single" == n && (o = r.contains(i)) > -1 && (ko((o = r.ranges[o]).from(), i) < 0 || i.xRel > 0) && (ko(o.to(), i) > 0 || i.xRel < 0) ? jt(e, t, i, s) : zt(e, t, i, n, s)
	}
	function jt(e, t, i, n) {
		var a = e.display,
			o = +new Date,
			r = Et(e, function(s) {
				ho && (a.scroller.draggable = !1), e.state.draggingText = !1, br(document, "mouseup", r), br(a.scroller, "drop", r), Math.abs(t.clientX - s.clientX) + Math.abs(t.clientY - s.clientY) < 10 && (yr(s), !n && +new Date - 200 < o && xe(e.doc, i), ho || co && 9 == fo ? setTimeout(function() {
					document.body.focus(), a.input.focus()
				}, 20) : a.input.focus())
			});
		ho && (a.scroller.draggable = !0), e.state.draggingText = r, a.scroller.dragDrop && a.scroller.dragDrop(), Fr(document, "mouseup", r), Fr(a.scroller, "drop", r)
	}
	function zt(e, t, i, n, a) {
		function o(t) {
			if (0 != ko(g, t)) if (g = t, "rect" == n) {
				for (var a = [], o = e.options.tabSize, r = kr(Gn(d, i.line).text, i.ch, o), s = kr(Gn(d, t.line).text, t.ch, o), l = Math.min(r, s), h = Math.max(r, s), p = Math.min(i.line, t.line), m = Math.min(e.lastLine(), Math.max(i.line, t.line)); p <= m; p++) {
					var v = Gn(d, p).text,
						y = _a(v, l, o);
					l == h ? a.push(new ce(Io(p, y), Io(p, y))) : v.length > y && a.push(new ce(Io(p, y), Io(p, _a(v, h, o))))
				}
				a.length || a.push(new ce(i, i)), Se(d, fe(f.ranges.slice(0, c).concat(a), c), {
					origin: "*mouse",
					scroll: !1
				}), e.scrollIntoView(t)
			} else {
				var w = u,
					x = w.anchor,
					F = t;
				if ("single" != n) {
					if ("double" == n) b = e.findWordAt(t);
					else var b = new ce(Io(t.line, 0), me(d, Io(t.line + 1, 0)));
					ko(b.anchor, x) > 0 ? (F = b.head, x = K(w.from(), b.anchor)) : (F = b.anchor, x = z(w.to(), b.head))
				}(a = f.ranges.slice(0))[c] = new ce(me(d, x), F), Se(d, fe(a, c), Er)
			}
		}
		function r(t) {
			var i = ++y,
				a = Bt(e, t, !0, "rect" == n);
			if (a) if (0 != ko(a, g)) {
				e.curOp.focus = Pa(), o(a);
				var s = w(l, d);
				(a.line >= s.to || a.line < s.from) && setTimeout(Et(e, function() {
					y == i && r(t)
				}), 150)
			} else {
				var u = t.clientY < v.top ? -20 : t.clientY > v.bottom ? 20 : 0;
				u && setTimeout(Et(e, function() {
					y == i && (l.scroller.scrollTop += u, r(t))
				}), 50)
			}
		}
		function s(e) {
			y = 1 / 0, yr(e), l.input.focus(), br(document, "mousemove", x), br(document, "mouseup", F), d.history.lastSelOrigin = null
		}
		var l = e.display,
			d = e.doc;
		yr(t);
		var u, c, f = d.sel,
			h = f.ranges;
		if (a && !t.shiftKey ? (c = d.sel.contains(i), u = c > -1 ? h[c] : new ce(i, i)) : (u = d.sel.primary(), c = d.sel.primIndex), t.altKey) n = "rect", a || (u = new ce(i, i)), i = Bt(e, t, !0, !0), c = -1;
		else if ("double" == n) {
			var p = e.findWordAt(i);
			u = e.display.shift || d.extend ? we(d, u, p.anchor, p.head) : p
		} else if ("triple" == n) {
			var m = new ce(Io(i.line, 0), me(d, Io(i.line + 1, 0)));
			u = e.display.shift || d.extend ? we(d, u, m.anchor, m.head) : m
		} else u = we(d, u, i);
		a ? -1 == c ? (c = h.length, Se(d, fe(h.concat([u]), c), {
			scroll: !1,
			origin: "*mouse"
		})) : h.length > 1 && h[c].empty() && "single" == n && !t.shiftKey ? (Se(d, fe(h.slice(0, c).concat(h.slice(c + 1)), 0)), f = d.sel) : be(d, c, u, Er) : (c = 0, Se(d, new ue([u], 0), Er), f = d.sel);
		var g = i,
			v = l.wrapper.getBoundingClientRect(),
			y = 0,
			x = Et(e, function(e) {
				ga(e) ? r(e) : s(e)
			}),
			F = Et(e, s);
		Fr(document, "mousemove", x), Fr(document, "mouseup", F)
	}
	function Kt(e, t, i, n, a) {
		try {
			var o = t.clientX,
				r = t.clientY
		} catch (t) {
			return !1
		}
		if (o >= Math.floor(e.display.gutters.getBoundingClientRect().right)) return !1;
		n && yr(t);
		var s = e.display,
			l = s.lineDiv.getBoundingClientRect();
		if (r > l.bottom || !Fa(e, i)) return pa(t);
		r -= l.top - s.viewOffset;
		for (var d = 0; d < e.options.gutters.length; ++d) {
			var u = s.gutters.childNodes[d];
			if (u && u.getBoundingClientRect().right >= o) return a(e, i, e, qn(e.doc, r), e.options.gutters[d], t), pa(t)
		}
	}
	function Yt(e, t) {
		return Kt(e, t, "gutterClick", !0, va)
	}
	function qt(e) {
		var t = this;
		if (!wa(t, e) && !$t(t.display, e)) {
			yr(e), co && (Uo = +new Date);
			var i = Bt(t, e, !0),
				n = e.dataTransfer.files;
			if (i && !q(t)) if (n && n.length && window.FileReader && window.File) for (var a = n.length, o = Array(a), r = 0, s = 0; s < a; ++s)!
			function(e, n) {
				var s = new FileReader;
				s.onload = Et(t, function() {
					if (o[n] = s.result, ++r == a) {
						var e = {
							from: i = me(t.doc, i),
							to: i,
							text: Hr(o.join("\n")),
							origin: "paste"
						};
						xi(t.doc, e), Te(t.doc, he(i, Ho(e)))
					}
				}), s.readAsText(e)
			}(n[s], s);
			else {
				if (t.state.draggingText && t.doc.sel.contains(i) > -1) return t.state.draggingText(e), void setTimeout(function() {
					t.display.input.focus()
				}, 20);
				try {
					if (o = e.dataTransfer.getData("Text")) {
						if (t.state.draggingText && !(bo ? e.altKey : e.ctrlKey)) var l = t.listSelections();
						if (Xe(t.doc, he(i, i)), l) for (s = 0; s < l.length; ++s) Si(t.doc, "", l[s].anchor, l[s].head, "drag");
						t.replaceSelection(o, "around", "paste"), t.display.input.focus()
					}
				} catch (e) {}
			}
		}
	}
	function Qt(e, t) {
		if (co && (!e.state.draggingText || +new Date - Uo < 100)) xr(t);
		else if (!wa(e, t) && !$t(e.display, t) && (t.dataTransfer.setData("Text", e.getSelection()), t.dataTransfer.setDragImage && !vo)) {
			var i = Ma("img", null, null, "position: fixed; left: 0; top: 0;");
			i.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", go && (i.width = i.height = 1, e.display.wrapper.appendChild(i), i._top = i.offsetTop), t.dataTransfer.setDragImage(i, 0, 0), go && i.parentNode.removeChild(i)
		}
	}
	function Jt(e, t) {
		Math.abs(e.doc.scrollTop - t) < 2 || (e.doc.scrollTop = t, so || E(e, {
			top: t
		}), e.display.scroller.scrollTop != t && (e.display.scroller.scrollTop = t), e.display.scrollbars.setScrollTop(t), so && E(e), De(e, 100))
	}
	function Zt(e, t, i) {
		(i ? t == e.doc.scrollLeft : Math.abs(e.doc.scrollLeft - t) < 2) || (t = Math.min(t, e.display.scroller.scrollWidth - e.display.scroller.clientWidth), e.doc.scrollLeft = t, x(e), e.display.scroller.scrollLeft != t && (e.display.scroller.scrollLeft = t), e.display.scrollbars.setScrollLeft(t))
	}
	function ei(e, t) {
		var i = Ro(t),
			n = i.x,
			a = i.y,
			o = e.display,
			r = o.scroller;
		if (n && r.scrollWidth > r.clientWidth || a && r.scrollHeight > r.clientHeight) {
			if (a && bo && ho) e: for (var s = t.target, l = o.view; s != r; s = s.parentNode) for (var d = 0; d < l.length; d++) if (l[d].node == s) {
				e.display.currentWheelTarget = s;
				break e
			}
			if (n && !so && !go && null != Vo) return a && Jt(e, Math.max(0, Math.min(r.scrollTop + a * Vo, r.scrollHeight - r.clientHeight))),
			Zt(e, Math.max(0, Math.min(r.scrollLeft + n * Vo, r.scrollWidth - r.clientWidth))),
			yr(t),
			void(o.wheelStartX = null);
			if (a && null != Vo) {
				var u = a * Vo,
					c = e.doc.scrollTop,
					f = c + o.wrapper.clientHeight;
				u < 0 ? c = Math.max(0, c + u - 50) : f = Math.min(e.doc.height, f + u + 50), E(e, {
					top: c,
					bottom: f
				})
			}
			Po < 20 && (null == o.wheelStartX ? (o.wheelStartX = r.scrollLeft, o.wheelStartY = r.scrollTop, o.wheelDX = n, o.wheelDY = a, setTimeout(function() {
				if (null != o.wheelStartX) {
					var e = r.scrollLeft - o.wheelStartX,
						t = r.scrollTop - o.wheelStartY,
						i = t && o.wheelDY && t / o.wheelDY || e && o.wheelDX && e / o.wheelDX;
					o.wheelStartX = o.wheelStartY = null, i && (Vo = (Vo * Po + i) / (Po + 1), ++Po)
				}
			}, 200)) : (o.wheelDX += n, o.wheelDY += a))
		}
	}
	function ti(e, t, i) {
		if ("string" == typeof t && !(t = tr[t])) return !1;
		e.display.input.ensurePolled();
		var n = e.display.shift,
			a = !1;
		try {
			q(e) && (e.state.suppressEdits = !0), i && (e.display.shift = !1), a = t(e) != Sr
		} finally {
			e.display.shift = n, e.state.suppressEdits = !1
		}
		return a
	}
	function ii(e, t, i) {
		for (var n = 0; n < e.state.keyMaps.length; n++) {
			var a = nr(t, e.state.keyMaps[n], i, e);
			if (a) return a
		}
		return e.options.extraKeys && nr(t, e.options.extraKeys, i, e) || nr(t, e.options.keyMap, i, e)
	}
	function ni(e, t, i, n) {
		var a = e.state.keySeq;
		if (a) {
			if (ar(t)) return "handled";
			$o.set(50, function() {
				e.state.keySeq == a && (e.state.keySeq = null, e.display.input.reset())
			}), t = a + " " + t
		}
		var o = ii(e, t, n);
		return "multi" == o && (e.state.keySeq = t), "handled" == o && va(e, "keyHandled", e, t, i), "handled" != o && "multi" != o || (yr(i), Me(e)), a && !o && /\'$/.test(t) ? (yr(i), !0) : !! o
	}
	function ai(e, t) {
		var i = or(t, !0);
		return !!i && (t.shiftKey && !e.state.keySeq ? ni(e, "Shift-" + i, t, function(t) {
			return ti(e, t, !0)
		}) || ni(e, i, t, function(t) {
			if ("string" == typeof t ? /^go[A-Z]/.test(t) : t.motion) return ti(e, t)
		}) : ni(e, i, t, function(t) {
			return ti(e, t)
		}))
	}
	function oi(e, t, i) {
		return ni(e, "'" + i + "'", t, function(t) {
			return ti(e, t, !0)
		})
	}
	function ri(e) {
		var t = this;
		if (t.curOp.focus = Pa(), !wa(t, e)) {
			co && fo < 11 && 27 == e.keyCode && (e.returnValue = !1);
			var i = e.keyCode;
			t.display.shift = 16 == i || e.shiftKey;
			var n = ai(t, e);
			go && (Bo = n ? i : null, !n && 88 == i && !jr && (bo ? e.metaKey : e.ctrlKey) && t.replaceSelection("", null, "cut")), 18 != i || /\bCodeMirror-crosshair\b/.test(t.display.lineDiv.className) || si(t)
		}
	}
	function si(e) {
		function t(e) {
			18 != e.keyCode && e.altKey || (Vr(i, "CodeMirror-crosshair"), br(document, "keyup", t), br(document, "mouseover", t))
		}
		var i = e.display.lineDiv;
		Rr(i, "CodeMirror-crosshair"), Fr(document, "keyup", t), Fr(document, "mouseover", t)
	}
	function li(e) {
		16 == e.keyCode && (this.doc.sel.shift = !1), wa(this, e)
	}
	function di(e) {
		var t = this;
		if (!($t(t.display, e) || wa(t, e) || e.ctrlKey && !e.altKey || bo && e.metaKey)) {
			var i = e.keyCode,
				n = e.charCode;
			if (go && i == Bo) return Bo = null, void yr(e);
			go && (!e.which || e.which < 10) && ai(t, e) || oi(t, e, String.fromCharCode(null == n ? i : n)) || t.display.input.onKeyPress(e)
		}
	}
	function ui(e) {
		e.state.delayingBlurEvent = !0, setTimeout(function() {
			e.state.delayingBlurEvent && (e.state.delayingBlurEvent = !1, fi(e))
		}, 100)
	}
	function ci(e) {
		e.state.delayingBlurEvent && (e.state.delayingBlurEvent = !1), "nocursor" != e.options.readOnly && (e.state.focused || (Cr(e, "focus", e), e.state.focused = !0, Rr(e.display.wrapper, "CodeMirror-focused"), e.curOp || e.display.selForContextMenu == e.doc.sel || (e.display.input.reset(), ho && setTimeout(function() {
			e.display.input.reset(!0)
		}, 20)), e.display.input.receivedFocus()), Me(e))
	}
	function fi(e) {
		e.state.delayingBlurEvent || (e.state.focused && (Cr(e, "blur", e), e.state.focused = !1, Vr(e.display.wrapper, "CodeMirror-focused")), clearInterval(e.display.blinker), setTimeout(function() {
			e.state.focused || (e.display.shift = !1)
		}, 150))
	}
	function hi(e, t) {
		$t(e.display, t) || pi(e, t) || e.display.input.onContextMenu(t)
	}
	function pi(e, t) {
		return !!Fa(e, "gutterContextMenu") && Kt(e, t, "gutterContextMenu", !1, Cr)
	}
	function mi(e, t) {
		if (ko(e, t.from) < 0) return e;
		if (ko(e, t.to) <= 0) return Ho(t);
		var i = e.line + t.text.length - (t.to.line - t.from.line) - 1,
			n = e.ch;
		return e.line == t.to.line && (n += Ho(t).ch - t.to.ch), Io(i, n)
	}
	function gi(e, t) {
		for (var i = [], n = 0; n < e.sel.ranges.length; n++) {
			var a = e.sel.ranges[n];
			i.push(new ce(mi(a.anchor, t), mi(a.head, t)))
		}
		return fe(i, e.sel.primIndex)
	}
	function vi(e, t, i) {
		return e.line == t.line ? Io(i.line, e.ch - t.ch + i.ch) : Io(i.line + (e.line - t.line), e.ch)
	}
	function yi(e, t, i) {
		for (var n = [], a = Io(e.first, 0), o = a, r = 0; r < t.length; r++) {
			var s = t[r],
				l = vi(s.from, a, o),
				d = vi(Ho(s), a, o);
			if (a = s.to, o = d, "around" == i) {
				var u = e.sel.ranges[r],
					c = ko(u.head, u.anchor) < 0;
				n[r] = new ce(c ? d : l, c ? l : d)
			} else n[r] = new ce(l, l)
		}
		return new ue(n, e.sel.primIndex)
	}
	function wi(e, t, i) {
		var n = {
			canceled: !1,
			from: t.from,
			to: t.to,
			text: t.text,
			origin: t.origin,
			cancel: function() {
				this.canceled = !0
			}
		};
		return i && (n.update = function(t, i, n, a) {
			t && (this.from = me(e, t)), i && (this.to = me(e, i)), n && (this.text = n), void 0 !== a && (this.origin = a)
		}), Cr(e, "beforeChange", e, n), e.cm && Cr(e.cm, "beforeChange", e.cm, n), n.canceled ? null : {
			from: n.from,
			to: n.to,
			text: n.text,
			origin: n.origin
		}
	}
	function xi(e, t, i) {
		if (e.cm) {
			if (!e.cm.curOp) return Et(e.cm, xi)(e, t, i);
			if (e.cm.state.suppressEdits) return
		}
		if (!(Fa(e, "beforeChange") || e.cm && Fa(e.cm, "beforeChange")) || (t = wi(e, t, !0))) {
			var n = Xo && !i && nn(e, t.from, t.to);
			if (n) for (var a = n.length - 1; a >= 0; --a) Fi(e, {
				from: n[a].from,
				to: n[a].to,
				text: a ? [""] : t.text
			});
			else Fi(e, t)
		}
	}
	function Fi(e, t) {
		if (1 != t.text.length || "" != t.text[0] || 0 != ko(t.from, t.to)) {
			var i = gi(e, t);
			na(e, t, i, e.cm ? e.cm.curOp.id : NaN), _i(e, t, i, Zi(e, t));
			var n = [];
			Bn(e, function(e, i) {
				i || -1 != Xa(n, e.history) || (ha(e.history, t), n.push(e.history)), _i(e, t, null, Zi(e, t))
			})
		}
	}
	function bi(e, t, i) {
		if (!e.cm || !e.cm.state.suppressEdits) {
			for (var n, a = e.history, o = e.sel, r = "undo" == t ? a.done : a.undone, s = "undo" == t ? a.undone : a.done, l = 0; l < r.length && (n = r[l], i ? !n.ranges || n.equals(e.sel) : n.ranges); l++);
			if (l != r.length) {
				for (a.lastOrigin = a.lastSelOrigin = null;
				(n = r.pop()).ranges;) {
					if (ra(n, s), i && !n.equals(e.sel)) return void Se(e, n, {
						clearRedo: !1
					});
					o = n
				}
				var d = [];
				ra(o, s), s.push({
					changes: d,
					generation: a.generation
				}), a.generation = n.generation || ++a.maxGeneration;
				for (var u = Fa(e, "beforeChange") || e.cm && Fa(e.cm, "beforeChange"), l = n.changes.length - 1; l >= 0; --l) {
					var c = n.changes[l];
					if (c.origin = t, u && !wi(e, c, !1)) return void(r.length = 0);
					d.push(ea(e, c));
					var f = l ? gi(e, c) : Sa(r);
					_i(e, c, f, tn(e, c)), !l && e.cm && e.cm.scrollIntoView({
						from: c.from,
						to: Ho(c)
					});
					var h = [];
					Bn(e, function(e, t) {
						t || -1 != Xa(h, e.history) || (ha(e.history, c), h.push(e.history)), _i(e, c, null, tn(e, c))
					})
				}
			}
		}
	}
	function Ci(e, t) {
		if (0 != t && (e.first += t, e.sel = new ue(Ea(e.sel.ranges, function(e) {
			return new ce(Io(e.anchor.line + t, e.anchor.ch), Io(e.head.line + t, e.head.ch))
		}), e.sel.primIndex), e.cm)) {
			Nt(e.cm, e.first, e.first - t, t);
			for (var i = e.cm.display, n = i.viewFrom; n < i.viewTo; n++) Wt(e.cm, n, "gutter")
		}
	}
	function _i(e, t, i, n) {
		if (e.cm && !e.cm.curOp) return Et(e.cm, _i)(e, t, i, n);
		if (t.to.line < e.first) Ci(e, t.text.length - 1 - (t.to.line - t.from.line));
		else if (!(t.from.line > e.lastLine())) {
			if (t.from.line < e.first) {
				var a = t.text.length - 1 - (e.first - t.from.line);
				Ci(e, a), t = {
					from: Io(e.first, 0),
					to: Io(t.to.line + a, t.to.ch),
					text: [Sa(t.text)],
					origin: t.origin
				}
			}
			var o = e.lastLine();
			t.to.line > o && (t = {
				from: t.from,
				to: Io(o, Gn(e, o).text.length),
				text: [t.text[0]],
				origin: t.origin
			}), t.removed = jn(e, t.from, t.to), i || (i = gi(e, t)), e.cm ? Ti(e.cm, t, n) : Vn(e, t, n), Xe(e, i, Xr)
		}
	}
	function Ti(e, t, i) {
		var n = e.doc,
			o = e.display,
			r = t.from,
			s = t.to,
			l = !1,
			d = r.line;
		e.options.lineWrapping || (d = Yn(hn(Gn(n, r.line))), n.iter(d, s.line + 1, function(e) {
			if (e == o.maxLine) return l = !0, !0
		})), n.sel.contains(t.from, t.to) > -1 && xa(e), Vn(n, t, i, a(e)), e.options.lineWrapping || (n.iter(d, r.line + t.text.length, function(e) {
			var t = u(e);
			t > o.maxLineLength && (o.maxLine = e, o.maxLineLength = t, o.maxLineChanged = !0, l = !1)
		}), l && (e.curOp.updateMaxLine = !0)), n.frontier = Math.min(n.frontier, r.line), De(e, 400);
		var c = t.text.length - (s.line - r.line) - 1;
		t.full ? Nt(e) : r.line != s.line || 1 != t.text.length || Pn(e.doc, t) ? Nt(e, r.line, s.line + 1, c) : Wt(e, r.line, "text");
		var f = Fa(e, "changes"),
			h = Fa(e, "change");
		if (h || f) {
			var p = {
				from: r,
				to: s,
				text: t.text,
				removed: t.removed,
				origin: t.origin
			};
			h && va(e, "change", e, p), f && (e.curOp.changeObjs || (e.curOp.changeObjs = [])).push(p)
		}
		e.display.selForContextMenu = null
	}
	function Si(e, t, i, n, a) {
		if (n || (n = i), ko(n, i) < 0) {
			var o = n;
			n = i, i = o
		}
		"string" == typeof t && (t = Hr(t)), xi(e, {
			from: i,
			to: n,
			text: t,
			origin: a
		})
	}
	function Xi(e, t) {
		if (!wa(e, "scrollCursorIntoView")) {
			var i = e.display,
				n = i.sizer.getBoundingClientRect(),
				a = null;
			if (t.top + n.top < 0 ? a = !0 : t.bottom + n.top > (window.innerHeight || document.documentElement.clientHeight) && (a = !1), null != a && !wo) {
				var o = Ma("div", "​", null, "position: absolute; top: " + (t.top - i.viewOffset - Re(e.display)) + "px; height: " + (t.bottom - t.top + He(e) + i.barHeight) + "px; left: " + t.left + "px; width: 2px;");
				e.display.lineSpace.appendChild(o), o.scrollIntoView(a), e.display.lineSpace.removeChild(o)
			}
		}
	}
	function Ei(e, t, i, n) {
		null == n && (n = 0);
		for (var a = 0; a < 5; a++) {
			var o = !1,
				r = ct(e, t),
				s = i && i != t ? ct(e, i) : r,
				l = ki(e, Math.min(r.left, s.left), Math.min(r.top, s.top) - n, Math.max(r.left, s.left), Math.max(r.bottom, s.bottom) + n),
				d = e.doc.scrollTop,
				u = e.doc.scrollLeft;
			if (null != l.scrollTop && (Jt(e, l.scrollTop), Math.abs(e.doc.scrollTop - d) > 1 && (o = !0)), null != l.scrollLeft && (Zt(e, l.scrollLeft), Math.abs(e.doc.scrollLeft - u) > 1 && (o = !0)), !o) break
		}
		return r
	}
	function Ii(e, t, i, n, a) {
		var o = ki(e, t, i, n, a);
		null != o.scrollTop && Jt(e, o.scrollTop), null != o.scrollLeft && Zt(e, o.scrollLeft)
	}
	function ki(e, t, i, n, a) {
		var o = e.display,
			r = gt(e.display);
		i < 0 && (i = 0);
		var s = e.curOp && null != e.curOp.scrollTop ? e.curOp.scrollTop : o.scroller.scrollTop,
			l = je(e),
			d = {};
		a - i > l && (a = i + l);
		var u = e.doc.height + $e(o),
			c = i < r,
			f = a > u - r;
		if (i < s) d.scrollTop = c ? 0 : i;
		else if (a > s + l) {
			var h = Math.min(i, (f ? u : a) - l);
			h != s && (d.scrollTop = h)
		}
		var p = e.curOp && null != e.curOp.scrollLeft ? e.curOp.scrollLeft : o.scroller.scrollLeft,
			m = Ge(e) - (e.options.fixedGutter ? o.gutters.offsetWidth : 0),
			g = n - t > m;
		return g && (n = t + m), t < 10 ? d.scrollLeft = 0 : t < p ? d.scrollLeft = Math.max(0, t - (g ? 0 : 10)) : n > m + p - 3 && (d.scrollLeft = n + (g ? 0 : 10) - m), d
	}
	function Li(e, t, i) {
		null == t && null == i || Ni(e), null != t && (e.curOp.scrollLeft = (null == e.curOp.scrollLeft ? e.doc.scrollLeft : e.curOp.scrollLeft) + t), null != i && (e.curOp.scrollTop = (null == e.curOp.scrollTop ? e.doc.scrollTop : e.curOp.scrollTop) + i)
	}
	function Ai(e) {
		Ni(e);
		var t = e.getCursor(),
			i = t,
			n = t;
		e.options.lineWrapping || (i = t.ch ? Io(t.line, t.ch - 1) : t, n = Io(t.line, t.ch + 1)), e.curOp.scrollToPos = {
			from: i,
			to: n,
			margin: e.options.cursorScrollMargin,
			isCursor: !0
		}
	}
	function Ni(e) {
		var t = e.curOp.scrollToPos;
		if (t) {
			e.curOp.scrollToPos = null;
			var i = ft(e, t.from),
				n = ft(e, t.to),
				a = ki(e, Math.min(i.left, n.left), Math.min(i.top, n.top) - t.margin, Math.max(i.right, n.right), Math.max(i.bottom, n.bottom) + t.margin);
			e.scrollTo(a.scrollLeft, a.scrollTop)
		}
	}
	function Wi(e, t, i, n) {
		var a, o = e.doc;
		null == i && (i = "add"), "smart" == i && (o.mode.indent ? a = Ve(e, t) : i = "prev");
		var r = e.options.tabSize,
			s = Gn(o, t),
			l = kr(s.text, null, r);
		s.stateAfter && (s.stateAfter = null);
		var d, u = s.text.match(/^\s*/)[0];
		if (n || /\S/.test(s.text)) {
			if ("smart" == i && ((d = o.mode.indent(a, s.text.slice(u.length), s.text)) == Sr || d > 150)) {
				if (!n) return;
				i = "prev"
			}
		} else d = 0, i = "not";
		"prev" == i ? d = t > o.first ? kr(Gn(o, t - 1).text, null, r) : 0 : "add" == i ? d = l + e.options.indentUnit : "subtract" == i ? d = l - e.options.indentUnit : "number" == typeof i && (d = l + i), d = Math.max(0, d);
		var c = "",
			f = 0;
		if (e.options.indentWithTabs) for (h = Math.floor(d / r); h; --h) f += r, c += "\t";
		if (f < d && (c += Ta(d - f)), c != u) return Si(o, c, Io(t, 0), Io(t, u.length), "+input"), s.stateAfter = null, !0;
		for (var h = 0; h < o.sel.ranges.length; h++) {
			var p = o.sel.ranges[h];
			if (p.head.line == t && p.head.ch < u.length) {
				be(o, h, new ce(f = Io(t, u.length), f));
				break
			}
		}
	}
	function Oi(e, t, i, n) {
		var a = t,
			o = t;
		return "number" == typeof t ? o = Gn(e, pe(e, t)) : a = Yn(t), null == a ? null : (n(o, a) && e.cm && Wt(e.cm, a, i), o)
	}
	function Mi(e, t) {
		for (var i = e.doc.sel.ranges, n = [], a = 0; a < i.length; a++) {
			for (var o = t(i[a]); n.length && ko(o.from, Sa(n).to) <= 0;) {
				var r = n.pop();
				if (ko(r.from, o.from) < 0) {
					o.from = r.from;
					break
				}
			}
			n.push(o)
		}
		Xt(e, function() {
			for (var t = n.length - 1; t >= 0; t--) Si(e.doc, "", n[t].from, n[t].to, "+delete");
			Ai(e)
		})
	}
	function Di(e, t, i, n, a) {
		function o() {
			var t = s + i;
			return t < e.first || t >= e.first + e.size ? c = !1 : (s = t, u = Gn(e, t))
		}
		function r(e) {
			var t = (a ? oo : ro)(u, l, i, !0);
			if (null == t) {
				if (e || !o()) return c = !1;
				l = a ? (i < 0 ? Ja : Qa)(u) : i < 0 ? u.text.length : 0
			} else l = t;
			return !0
		}
		var s = t.line,
			l = t.ch,
			d = i,
			u = Gn(e, s),
			c = !0;
		if ("char" == n) r();
		else if ("column" == n) r(!0);
		else if ("word" == n || "group" == n) for (var f = null, h = "group" == n, p = e.cm && e.cm.getHelper(t, "wordChars"), m = !0; !(i < 0) || r(!m); m = !1) {
			var g = u.text.charAt(l) || "\n",
				v = Na(g, p) ? "w" : h && "\n" == g ? "n" : !h || /\s/.test(g) ? null : "p";
			if (!h || m || v || (v = "s"), f && f != v) {
				i < 0 && (i = 1, r());
				break
			}
			if (v && (f = v), i > 0 && !r(!m)) break
		}
		var y = Le(e, Io(s, l), d, !0);
		return c || (y.hitSide = !0), y
	}
	function Ui(e, t, i, n) {
		var a, o = e.doc,
			r = t.left;
		if ("page" == n) {
			var s = Math.min(e.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
			a = t.top + i * (s - (i < 0 ? 1.5 : .5) * gt(e.display))
		} else "line" == n && (a = i > 0 ? t.bottom + 3 : t.top - 3);
		for (;;) {
			var l = pt(e, r, a);
			if (!l.outside) break;
			if (i < 0 ? a <= 0 : a >= o.height) {
				l.hitSide = !0;
				break
			}
			a += 5 * i
		}
		return l
	}
	function Pi(t, i, n, a) {
		e.defaults[t] = i, n && (jo[t] = a ?
		function(e, t, i) {
			i != zo && n(e, t, i)
		} : n)
	}
	function Vi(e) {
		for (var t, i, n, a, o = e.split(/-(?!$)/), e = o[o.length - 1], r = 0; r < o.length - 1; r++) {
			var s = o[r];
			if (/^(cmd|meta|m)$/i.test(s)) a = !0;
			else if (/^a(lt)?$/i.test(s)) t = !0;
			else if (/^(c|ctrl|control)$/i.test(s)) i = !0;
			else {
				if (!/^s(hift)$/i.test(s)) throw new Error("Unrecognized modifier name: " + s);
				n = !0
			}
		}
		return t && (e = "Alt-" + e), i && (e = "Ctrl-" + e), a && (e = "Cmd-" + e), n && (e = "Shift-" + e), e
	}
	function Ri(e) {
		return "string" == typeof e ? ir[e] : e
	}
	function $i(e, t, i, n, a) {
		if (n && n.shared) return Bi(e, t, i, n, a);
		if (e.cm && !e.cm.curOp) return Et(e.cm, $i)(e, t, i, n, a);
		var o = new lr(e, a),
			r = ko(t, i);
		if (n && La(n, o, !1), r > 0 || 0 == r && !1 !== o.clearWhenEmpty) return o;
		if (o.replacedWith && (o.collapsed = !0, o.widgetNode = Ma("span", [o.replacedWith], "CodeMirror-widget"), n.handleMouseEvents || o.widgetNode.setAttribute("cm-ignore-events", "true"), n.insertLeft && (o.widgetNode.insertLeft = !0)), o.collapsed) {
			if (fn(e, t.line, t, i, o) || t.line != i.line && fn(e, i.line, t, i, o)) throw new Error("Inserting collapsed marker partially overlapping an existing one");
			Eo = !0
		}
		o.addToHistory && na(e, {
			from: t,
			to: i,
			origin: "markText"
		}, e.sel, NaN);
		var s, l = t.line,
			d = e.cm;
		if (e.iter(l, i.line + 1, function(e) {
			d && o.collapsed && !d.options.lineWrapping && hn(e) == d.display.maxLine && (s = !0), o.collapsed && l != t.line && Kn(e, 0), qi(e, new zi(o, l == t.line ? t.ch : null, l == i.line ? i.ch : null)), ++l
		}), o.collapsed && e.iter(t.line, i.line + 1, function(t) {
			vn(e, t) && Kn(t, 0)
		}), o.clearOnEnter && Fr(o, "beforeCursorEnter", function() {
			o.clear()
		}), o.readOnly && (Xo = !0, (e.history.done.length || e.history.undone.length) && e.clearHistory()), o.collapsed && (o.id = ++sr, o.atomic = !0), d) {
			if (s && (d.curOp.updateMaxLine = !0), o.collapsed) Nt(d, t.line, i.line + 1);
			else if (o.className || o.title || o.startStyle || o.endStyle || o.css) for (var u = t.line; u <= i.line; u++) Wt(d, u, "text");
			o.atomic && Ie(d.doc), va(d, "markerAdded", d, o)
		}
		return o
	}
	function Bi(e, t, i, n, a) {
		(n = La(n)).shared = !1;
		var o = [$i(e, t, i, n, a)],
			r = o[0],
			s = n.widgetNode;
		return Bn(e, function(e) {
			s && (n.widgetNode = s.cloneNode(!0)), o.push($i(e, me(e, t), me(e, i), n, a));
			for (var l = 0; l < e.linked.length; ++l) if (e.linked[l].isParent) return;
			r = Sa(o)
		}), new dr(o, r)
	}
	function Hi(e) {
		return e.findMarks(Io(e.first, 0), e.clipPos(Io(e.lastLine())), function(e) {
			return e.parent
		})
	}
	function Gi(e, t) {
		for (var i = 0; i < t.length; i++) {
			var n = t[i],
				a = n.find(),
				o = e.clipPos(a.from),
				r = e.clipPos(a.to);
			if (ko(o, r)) {
				var s = $i(e, o, r, n.primary, n.primary.type);
				n.markers.push(s), s.parent = n
			}
		}
	}
	function ji(e) {
		for (var t = 0; t < e.length; t++) {
			var i = e[t],
				n = [i.primary.doc];
			Bn(i.primary.doc, function(e) {
				n.push(e)
			});
			for (var a = 0; a < i.markers.length; a++) {
				var o = i.markers[a]; - 1 == Xa(n, o.doc) && (o.parent = null, i.markers.splice(a--, 1))
			}
		}
	}
	function zi(e, t, i) {
		this.marker = e, this.from = t, this.to = i
	}
	function Ki(e, t) {
		if (e) for (var i = 0; i < e.length; ++i) {
			var n = e[i];
			if (n.marker == t) return n
		}
	}
	function Yi(e, t) {
		for (var i, n = 0; n < e.length; ++n) e[n] != t && (i || (i = [])).push(e[n]);
		return i
	}
	function qi(e, t) {
		e.markedSpans = e.markedSpans ? e.markedSpans.concat([t]) : [t], t.marker.attachLine(e)
	}
	function Qi(e, t, i) {
		if (e) for (var n, a = 0; a < e.length; ++a) {
			var o = e[a],
				r = o.marker;
			if (null == o.from || (r.inclusiveLeft ? o.from <= t : o.from < t) || o.from == t && "bookmark" == r.type && (!i || !o.marker.insertLeft)) {
				var s = null == o.to || (r.inclusiveRight ? o.to >= t : o.to > t);
				(n || (n = [])).push(new zi(r, o.from, s ? null : o.to))
			}
		}
		return n
	}
	function Ji(e, t, i) {
		if (e) for (var n, a = 0; a < e.length; ++a) {
			var o = e[a],
				r = o.marker;
			if (null == o.to || (r.inclusiveRight ? o.to >= t : o.to > t) || o.from == t && "bookmark" == r.type && (!i || o.marker.insertLeft)) {
				var s = null == o.from || (r.inclusiveLeft ? o.from <= t : o.from < t);
				(n || (n = [])).push(new zi(r, s ? null : o.from - t, null == o.to ? null : o.to - t))
			}
		}
		return n
	}
	function Zi(e, t) {
		if (t.full) return null;
		var i = ve(e, t.from.line) && Gn(e, t.from.line).markedSpans,
			n = ve(e, t.to.line) && Gn(e, t.to.line).markedSpans;
		if (!i && !n) return null;
		var a = t.from.ch,
			o = t.to.ch,
			r = 0 == ko(t.from, t.to),
			s = Qi(i, a, r),
			l = Ji(n, o, r),
			d = 1 == t.text.length,
			u = Sa(t.text).length + (d ? a : 0);
		if (s) for (g = 0; g < s.length; ++g) null == (c = s[g]).to && ((f = Ki(l, c.marker)) ? d && (c.to = null == f.to ? null : f.to + u) : c.to = a);
		if (l) for (g = 0; g < l.length; ++g) {
			var c = l[g];
			if (null != c.to && (c.to += u), null == c.from) {
				var f = Ki(s, c.marker);
				f || (c.from = u, d && (s || (s = [])).push(c))
			} else c.from += u, d && (s || (s = [])).push(c)
		}
		s && (s = en(s)), l && l != s && (l = en(l));
		var h = [s];
		if (!d) {
			var p, m = t.text.length - 2;
			if (m > 0 && s) for (g = 0; g < s.length; ++g) null == s[g].to && (p || (p = [])).push(new zi(s[g].marker, null, null));
			for (var g = 0; g < m; ++g) h.push(p);
			h.push(l)
		}
		return h
	}
	function en(e) {
		for (var t = 0; t < e.length; ++t) {
			var i = e[t];
			null != i.from && i.from == i.to && !1 !== i.marker.clearWhenEmpty && e.splice(t--, 1)
		}
		return e.length ? e : null
	}
	function tn(e, t) {
		var i = da(e, t),
			n = Zi(e, t);
		if (!i) return n;
		if (!n) return i;
		for (var a = 0; a < i.length; ++a) {
			var o = i[a],
				r = n[a];
			if (o && r) e: for (var s = 0; s < r.length; ++s) {
				for (var l = r[s], d = 0; d < o.length; ++d) if (o[d].marker == l.marker) continue e;
				o.push(l)
			} else r && (i[a] = r)
		}
		return i
	}
	function nn(e, t, i) {
		var n = null;
		if (e.iter(t.line, i.line + 1, function(e) {
			if (e.markedSpans) for (var t = 0; t < e.markedSpans.length; ++t) {
				var i = e.markedSpans[t].marker;
				!i.readOnly || n && -1 != Xa(n, i) || (n || (n = [])).push(i)
			}
		}), !n) return null;
		for (var a = [{
			from: t,
			to: i
		}], o = 0; o < n.length; ++o) for (var r = n[o], s = r.find(0), l = 0; l < a.length; ++l) {
			var d = a[l];
			if (!(ko(d.to, s.from) < 0 || ko(d.from, s.to) > 0)) {
				var u = [l, 1],
					c = ko(d.from, s.from),
					f = ko(d.to, s.to);
				(c < 0 || !r.inclusiveLeft && !c) && u.push({
					from: d.from,
					to: s.from
				}), (f > 0 || !r.inclusiveRight && !f) && u.push({
					from: s.to,
					to: d.to
				}), a.splice.apply(a, u), l += u.length - 1
			}
		}
		return a
	}
	function an(e) {
		var t = e.markedSpans;
		if (t) {
			for (var i = 0; i < t.length; ++i) t[i].marker.detachLine(e);
			e.markedSpans = null
		}
	}
	function on(e, t) {
		if (t) {
			for (var i = 0; i < t.length; ++i) t[i].marker.attachLine(e);
			e.markedSpans = t
		}
	}
	function rn(e) {
		return e.inclusiveLeft ? -1 : 0
	}
	function sn(e) {
		return e.inclusiveRight ? 1 : 0
	}
	function ln(e, t) {
		var i = e.lines.length - t.lines.length;
		if (0 != i) return i;
		var n = e.find(),
			a = t.find(),
			o = ko(n.from, a.from) || rn(e) - rn(t);
		if (o) return -o;
		var r = ko(n.to, a.to) || sn(e) - sn(t);
		return r || t.id - e.id
	}
	function dn(e, t) {
		var i, n = Eo && e.markedSpans;
		if (n) for (var a, o = 0; o < n.length; ++o)(a = n[o]).marker.collapsed && null == (t ? a.from : a.to) && (!i || ln(i, a.marker) < 0) && (i = a.marker);
		return i
	}
	function un(e) {
		return dn(e, !0)
	}
	function cn(e) {
		return dn(e, !1)
	}
	function fn(e, t, i, n, a) {
		var o = Gn(e, t),
			r = Eo && o.markedSpans;
		if (r) for (var s = 0; s < r.length; ++s) {
			var l = r[s];
			if (l.marker.collapsed) {
				var d = l.marker.find(0),
					u = ko(d.from, i) || rn(l.marker) - rn(a),
					c = ko(d.to, n) || sn(l.marker) - sn(a);
				if (!(u >= 0 && c <= 0 || u <= 0 && c >= 0) && (u <= 0 && (ko(d.to, i) > 0 || l.marker.inclusiveRight && a.inclusiveLeft) || u >= 0 && (ko(d.from, n) < 0 || l.marker.inclusiveLeft && a.inclusiveRight))) return !0
			}
		}
	}
	function hn(e) {
		for (var t; t = un(e);) e = t.find(-1, !0).line;
		return e
	}
	function pn(e) {
		for (var t, i; t = cn(e);) e = t.find(1, !0).line, (i || (i = [])).push(e);
		return i
	}
	function mn(e, t) {
		var i = Gn(e, t),
			n = hn(i);
		return i == n ? t : Yn(n)
	}
	function gn(e, t) {
		if (t > e.lastLine()) return t;
		var i, n = Gn(e, t);
		if (!vn(e, n)) return t;
		for (; i = cn(n);) n = i.find(1, !0).line;
		return Yn(n) + 1
	}
	function vn(e, t) {
		var i = Eo && t.markedSpans;
		if (i) for (var n, a = 0; a < i.length; ++a) if ((n = i[a]).marker.collapsed) {
			if (null == n.from) return !0;
			if (!n.marker.widgetNode && 0 == n.from && n.marker.inclusiveLeft && yn(e, t, n)) return !0
		}
	}
	function yn(e, t, i) {
		if (null == i.to) {
			var n = i.marker.find(1, !0);
			return yn(e, n.line, Ki(n.line.markedSpans, i.marker))
		}
		if (i.marker.inclusiveRight && i.to == t.text.length) return !0;
		for (var a, o = 0; o < t.markedSpans.length; ++o) if ((a = t.markedSpans[o]).marker.collapsed && !a.marker.widgetNode && a.from == i.to && (null == a.to || a.to != i.from) && (a.marker.inclusiveLeft || i.marker.inclusiveRight) && yn(e, t, a)) return !0
	}
	function wn(e, t, i) {
		Qn(t) < (e.curOp && e.curOp.scrollTop || e.doc.scrollTop) && Li(e, null, i)
	}
	function xn(e) {
		if (null != e.height) return e.height;
		var t = e.doc.cm;
		if (!t) return 0;
		if (!Dr(document.body, e.node)) {
			var i = "position: relative;";
			e.coverGutter && (i += "margin-left: -" + t.display.gutters.offsetWidth + "px;"), e.noHScroll && (i += "width: " + t.display.wrapper.clientWidth + "px;"), Ua(t.display.measure, Ma("div", [e.node], null, i))
		}
		return e.height = e.node.offsetHeight
	}
	function Fn(e, t, i, n) {
		var a = new ur(e, i, n),
			o = e.cm;
		return o && a.noHScroll && (o.display.alignWidgets = !0), Oi(e, t, "widget", function(t) {
			var i = t.widgets || (t.widgets = []);
			if (null == a.insertAt ? i.push(a) : i.splice(Math.min(i.length - 1, Math.max(0, a.insertAt)), 0, a), a.line = t, o && !vn(e, t)) {
				var n = Qn(t) < e.scrollTop;
				Kn(t, t.height + xn(a)), n && Li(o, null, a.height), o.curOp.forceUpdate = !0
			}
			return !0
		}), a
	}
	function bn(e, t, i, n) {
		e.text = t, e.stateAfter && (e.stateAfter = null), e.styles && (e.styles = null), null != e.order && (e.order = null), an(e), on(e, i);
		var a = n ? n(e) : 1;
		a != e.height && Kn(e, a)
	}
	function Cn(e) {
		e.parent = null, an(e)
	}
	function _n(e, t) {
		if (e) for (;;) {
			var i = e.match(/(?:^|\s+)line-(background-)?(\S+)/);
			if (!i) break;
			e = e.slice(0, i.index) + e.slice(i.index + i[0].length);
			var n = i[1] ? "bgClass" : "textClass";
			null == t[n] ? t[n] = i[2] : new RegExp("(?:^|s)" + i[2] + "(?:$|s)").test(t[n]) || (t[n] += " " + i[2])
		}
		return e
	}
	function Tn(t, i) {
		if (t.blankLine) return t.blankLine(i);
		if (t.innerMode) {
			var n = e.innerMode(t, i);
			return n.mode.blankLine ? n.mode.blankLine(n.state) : void 0
		}
	}
	function Sn(t, i, n, a) {
		for (var o = 0; o < 10; o++) {
			a && (a[0] = e.innerMode(t, n).mode);
			var r = t.token(i, n);
			if (i.pos > i.start) return r
		}
		throw new Error("Mode " + t.name + " failed to advance stream.")
	}
	function Xn(e, t, i, n) {
		function a(e) {
			return {
				start: c.start,
				end: c.pos,
				string: c.current(),
				type: o || null,
				state: e ? Zo(r.mode, u) : u
			}
		}
		var o, r = e.doc,
			s = r.mode;
		t = me(r, t);
		var l, d = Gn(r, t.line),
			u = Ve(e, t.line, i),
			c = new rr(d.text, e.options.tabSize);
		for (n && (l = []);
		(n || c.pos < t.ch) && !c.eol();) c.start = c.pos, o = Sn(s, c, u), n && l.push(a(!0));
		return n ? l : a()
	}
	function En(e, t, i, n, a, o, r) {
		var s = i.flattenSpans;
		null == s && (s = e.options.flattenSpans);
		var l, d = 0,
			u = null,
			c = new rr(t, e.options.tabSize),
			f = e.options.addModeClass && [null];
		for ("" == t && _n(Tn(i, n), o); !c.eol();) {
			if (c.pos > e.options.maxHighlightLength ? (s = !1, r && Ln(e, t, n, c.pos), c.pos = t.length, l = null) : l = _n(Sn(i, c, n, f), o), f) {
				var h = f[0].name;
				h && (l = "m-" + (l ? h + " " + l : h))
			}
			if (!s || u != l) {
				for (; d < c.start;) a(d = Math.min(c.start, d + 5e4), u);
				u = l
			}
			c.start = c.pos
		}
		for (; d < c.pos;) {
			var p = Math.min(c.pos, d + 5e4);
			a(p, u), d = p
		}
	}
	function In(e, t, i, n) {
		var a = [e.state.modeGen],
			o = {};
		En(e, t.text, e.doc.mode, i, function(e, t) {
			a.push(e, t)
		}, o, n);
		for (var r = 0; r < e.state.overlays.length; ++r) {
			var s = e.state.overlays[r],
				l = 1,
				d = 0;
			En(e, t.text, s.mode, !0, function(e, t) {
				for (var i = l; d < e;) {
					var n = a[l];
					n > e && a.splice(l, 1, e, a[l + 1], n), l += 2, d = Math.min(e, n)
				}
				if (t) if (s.opaque) a.splice(i, l - i, e, "cm-overlay " + t), l = i + 2;
				else for (; i < l; i += 2) {
					var o = a[i + 1];
					a[i + 1] = (o ? o + " " : "") + "cm-overlay " + t
				}
			}, o)
		}
		return {
			styles: a,
			classes: o.bgClass || o.textClass ? o : null
		}
	}
	function kn(e, t, i) {
		if (!t.styles || t.styles[0] != e.state.modeGen) {
			var n = In(e, t, t.stateAfter = Ve(e, Yn(t)));
			t.styles = n.styles, n.classes ? t.styleClasses = n.classes : t.styleClasses && (t.styleClasses = null), i === e.doc.frontier && e.doc.frontier++
		}
		return t.styles
	}
	function Ln(e, t, i, n) {
		var a = e.doc.mode,
			o = new rr(t, e.options.tabSize);
		for (o.start = o.pos = n || 0, "" == t && Tn(a, i); !o.eol() && o.pos <= e.options.maxHighlightLength;) Sn(a, o, i), o.start = o.pos
	}
	function An(e, t) {
		if (!e || /^\s*$/.test(e)) return null;
		var i = t.addModeClass ? hr : fr;
		return i[e] || (i[e] = e.replace(/\S+/g, "cm-$&"))
	}
	function Nn(e, t) {
		var i = Ma("span", null, "CodeMirror-line-content", ho ? "padding-right: .1px" : null),
			n = {
				pre: Ma("pre", [i], "CodeMirror-line"),
				content: i,
				col: 0,
				pos: 0,
				cm: e,
				splitSpaces: (co || ho) && e.getOption("lineWrapping")
			};
		t.measure = {};
		for (var a = 0; a <= (t.rest ? t.rest.length : 0); a++) {
			var o, r = a ? t.rest[a - 1] : t.line;
			n.pos = 0, n.addToken = Wn, ja(e.display.measure) && (o = Jn(r)) && (n.addToken = Mn(n.addToken, o)), n.map = [], Un(r, n, kn(e, r, t != e.display.externalMeasured && Yn(r))), r.styleClasses && (r.styleClasses.bgClass && (n.bgClass = Ra(r.styleClasses.bgClass, n.bgClass || "")), r.styleClasses.textClass && (n.textClass = Ra(r.styleClasses.textClass, n.textClass || ""))), 0 == n.map.length && n.map.push(0, 0, n.content.appendChild(Ga(e.display.measure))), 0 == a ? (t.measure.map = n.map, t.measure.cache = {}) : ((t.measure.maps || (t.measure.maps = [])).push(n.map), (t.measure.caches || (t.measure.caches = [])).push({}))
		}
		return ho && /\bcm-tab\b/.test(n.content.lastChild.className) && (n.content.className = "cm-tab-wrap-hack"), Cr(e, "renderLine", e, t.line, n.pre), n.pre.className && (n.textClass = Ra(n.pre.className, n.textClass || "")), n
	}
	function Wn(e, t, i, n, a, o, r, s) {
		if (t) {
			var l = e.splitSpaces ? t.replace(/ {3,}/g, On) : t,
				d = e.cm.state.specialChars,
				u = !1;
			if (d.test(t)) for (var c = document.createDocumentFragment(), f = 0;;) {
				d.lastIndex = f;
				var h = d.exec(t),
					p = h ? h.index - f : t.length - f;
				if (p) {
					var m = document.createTextNode(l.slice(f, f + p));
					co && fo < 9 ? c.appendChild(Ma("span", [m])) : c.appendChild(m), e.map.push(e.pos, e.pos + p, m), e.col += p, e.pos += p
				}
				if (!h) break;
				if (f += p + 1, "\t" == h[0]) {
					var g = e.cm.options.tabSize,
						v = g - e.col % g;
					(m = c.appendChild(Ma("span", Ta(v), "cm-tab"))).setAttribute("role", "presentation"), m.setAttribute("cm-text", "\t"), e.col += v
				} else(m = e.cm.options.specialCharPlaceholder(h[0])).setAttribute("cm-text", h[0]), co && fo < 9 ? c.appendChild(Ma("span", [m])) : c.appendChild(m), e.col += 1;
				e.map.push(e.pos, e.pos + 1, m), e.pos++
			} else {
				e.col += t.length;
				c = document.createTextNode(l);
				e.map.push(e.pos, e.pos + t.length, c), co && fo < 9 && (u = !0), e.pos += t.length
			}
			if (i || n || a || u || r || s) {
				var y = i || "";
				n && (y += n), a && (y += a);
				var w = Ma("span", [c], y, r, s);
				return o && (w.title = o), e.content.appendChild(w)
			}
			e.content.appendChild(c)
		}
	}
	function On(e) {
		for (var t = " ", i = 0; i < e.length - 2; ++i) t += i % 2 ? " " : " ";
		return t += " "
	}
	function Mn(e, t) {
		return function(i, n, a, o, r, s, l) {
			a = a ? a + " cm-force-border" : "cm-force-border";
			for (var d = i.pos, u = d + n.length;;) {
				for (var c = 0; c < t.length; c++) {
					var f = t[c];
					if (f.to > d && f.from <= d) break
				}
				if (f.to >= u) return e(i, n, a, o, r, s, l);
				e(i, n.slice(0, f.to - d), a, o, null, s, l), o = null, n = n.slice(f.to - d), d = f.to
			}
		}
	}
	function Dn(e, t, i, n) {
		var a = !n && i.widgetNode;
		a && e.map.push(e.pos, e.pos + t, a), !n && e.cm.display.input.needsContentAttribute && (a || (a = e.content.appendChild(document.createElement("span"))), a.setAttribute("cm-marker", i.id)), a && (e.cm.display.input.setUneditable(a), e.content.appendChild(a)), e.pos += t
	}
	function Un(e, t, i) {
		var n = e.markedSpans,
			a = e.text,
			o = 0;
		if (n) for (var r, s, l, d, u, c, f, h, p = a.length, m = 0, g = 1, v = "", y = 0;;) {
			if (y == m) {
				d = u = c = f = s = "", l = null, h = null, y = 1 / 0;
				for (var w = [], x = 0; x < n.length; ++x) {
					var F = n[x],
						b = F.marker;
					"bookmark" == b.type && F.from == m && b.widgetNode ? w.push(b) : F.from <= m && (null == F.to || F.to > m || b.collapsed && F.to == m && F.from == m) ? (null != F.to && F.to != m && y > F.to && (y = F.to, u = ""), b.className && (d += " " + b.className), b.attr && (l = b.attr), b.css && (s = b.css), b.startStyle && F.from == m && (c += " " + b.startStyle), b.endStyle && F.to == y && (u += " " + b.endStyle), b.title && !f && (f = b.title), b.collapsed && (!h || ln(h.marker, b) < 0) && (h = F)) : F.from > m && y > F.from && (y = F.from)
				}
				if (h && (h.from || 0) == m) {
					if (Dn(t, (null == h.to ? p + 1 : h.to) - m, h.marker, null == h.from), null == h.to) return;
					h.to == m && (h = !1)
				}
				if (!h && w.length) for (x = 0; x < w.length; ++x) Dn(t, 0, w[x])
			}
			if (m >= p) break;
			for (var C = Math.min(p, y);;) {
				if (v) {
					var _ = m + v.length;
					if (!h) {
						var T = _ > C ? v.slice(0, C - m) : v;
						t.addToken(t, T, r ? r + d : d, c, m + T.length == y ? u : "", f, s, l)
					}
					if (_ >= C) {
						v = v.slice(C - m), m = C;
						break
					}
					m = _, c = ""
				}
				v = a.slice(o, o = i[g++]), r = An(i[g++], t.cm.options)
			}
		} else for (g = 1; g < i.length; g += 2) t.addToken(t, a.slice(o, o = i[g]), An(i[g + 1], t.cm.options))
	}
	function Pn(e, t) {
		return 0 == t.from.ch && 0 == t.to.ch && "" == Sa(t.text) && (!e.cm || e.cm.options.wholeLineUpdateBefore)
	}
	function Vn(e, t, i, n) {
		function a(e) {
			return i ? i[e] : null
		}
		function o(e, i, a) {
			bn(e, i, a, n), va(e, "change", e, t)
		}
		function r(e, t) {
			for (var i = e, o = []; i < t; ++i) o.push(new cr(d[i], a(i), n));
			return o
		}
		var s = t.from,
			l = t.to,
			d = t.text,
			u = Gn(e, s.line),
			c = Gn(e, l.line),
			f = Sa(d),
			h = a(d.length - 1),
			p = l.line - s.line;
		if (t.full) e.insert(0, r(0, d.length)), e.remove(d.length, e.size - d.length);
		else if (Pn(e, t)) {
			m = r(0, d.length - 1);
			o(c, c.text, h), p && e.remove(s.line, p), m.length && e.insert(s.line, m)
		} else if (u == c) 1 == d.length ? o(u, u.text.slice(0, s.ch) + f + u.text.slice(l.ch), h) : ((m = r(1, d.length - 1)).push(new cr(f + u.text.slice(l.ch), h, n)), o(u, u.text.slice(0, s.ch) + d[0], a(0)), e.insert(s.line + 1, m));
		else if (1 == d.length) o(u, u.text.slice(0, s.ch) + d[0] + c.text.slice(l.ch), a(0)), e.remove(s.line + 1, p);
		else {
			o(u, u.text.slice(0, s.ch) + d[0], a(0)), o(c, f + c.text.slice(l.ch), h);
			var m = r(1, d.length - 1);
			p > 1 && e.remove(s.line + 1, p - 1), e.insert(s.line + 1, m)
		}
		va(e, "change", e, t)
	}
	function Rn(e) {
		this.lines = e, this.parent = null;
		for (var t = 0, i = 0; t < e.length; ++t) e[t].parent = this, i += e[t].height;
		this.height = i
	}
	function $n(e) {
		this.children = e;
		for (var t = 0, i = 0, n = 0; n < e.length; ++n) {
			var a = e[n];
			t += a.chunkSize(), i += a.height, a.parent = this
		}
		this.size = t, this.height = i, this.parent = null
	}
	function Bn(e, t, i) {
		function n(e, a, o) {
			if (e.linked) for (var r = 0; r < e.linked.length; ++r) {
				var s = e.linked[r];
				if (s.doc != a) {
					var l = o && s.sharedHist;
					i && !l || (t(s.doc, l), n(s.doc, e, l))
				}
			}
		}
		n(e, null, !0)
	}
	function Hn(e, t) {
		if (t.cm) throw new Error("This document is already in use.");
		e.doc = t, t.cm = e, o(e), i(e), e.options.lineWrapping || c(e), e.options.mode = t.modeOption, Nt(e)
	}
	function Gn(e, t) {
		if ((t -= e.first) < 0 || t >= e.size) throw new Error("There is no line " + (t + e.first) + " in the document.");
		for (var i = e; !i.lines;) for (var n = 0;; ++n) {
			var a = i.children[n],
				o = a.chunkSize();
			if (t < o) {
				i = a;
				break
			}
			t -= o
		}
		return i.lines[t]
	}
	function jn(e, t, i) {
		var n = [],
			a = t.line;
		return e.iter(t.line, i.line + 1, function(e) {
			var o = e.text;
			a == i.line && (o = o.slice(0, i.ch)), a == t.line && (o = o.slice(t.ch)), n.push(o), ++a
		}), n
	}
	function zn(e, t, i) {
		var n = [];
		return e.iter(t, i, function(e) {
			n.push(e.text)
		}), n
	}
	function Kn(e, t) {
		var i = t - e.height;
		if (i) for (var n = e; n; n = n.parent) n.height += i
	}
	function Yn(e) {
		if (null == e.parent) return null;
		for (var t = e.parent, i = Xa(t.lines, e), n = t.parent; n; t = n, n = n.parent) for (var a = 0; n.children[a] != t; ++a) i += n.children[a].chunkSize();
		return i + t.first
	}
	function qn(e, t) {
		var i = e.first;
		e: do {
			for (o = 0; o < e.children.length; ++o) {
				var n = e.children[o],
					a = n.height;
				if (t < a) {
					e = n;
					continue e
				}
				t -= a, i += n.chunkSize()
			}
			return i
		} while (!e.lines);
		for (var o = 0; o < e.lines.length; ++o) {
			var r = e.lines[o].height;
			if (t < r) break;
			t -= r
		}
		return i + o
	}
	function Qn(e) {
		for (var t = 0, i = (e = hn(e)).parent, n = 0; n < i.lines.length; ++n) {
			var a = i.lines[n];
			if (a == e) break;
			t += a.height
		}
		for (var o = i.parent; o; i = o, o = i.parent) for (n = 0; n < o.children.length; ++n) {
			var r = o.children[n];
			if (r == i) break;
			t += r.height
		}
		return t
	}
	function Jn(e) {
		var t = e.order;
		return null == t && (t = e.order = qr(e.text)), t
	}
	function Zn(e) {
		this.done = [], this.undone = [], this.undoDepth = 1 / 0, this.lastModTime = this.lastSelTime = 0, this.lastOp = this.lastSelOp = null, this.lastOrigin = this.lastSelOrigin = null, this.generation = this.maxGeneration = e || 1
	}
	function ea(e, t) {
		var i = {
			from: j(t.from),
			to: Ho(t),
			text: jn(e, t.from, t.to)
		};
		return sa(e, i, t.from.line, t.to.line + 1), Bn(e, function(e) {
			sa(e, i, t.from.line, t.to.line + 1)
		}, !0), i
	}
	function ta(e) {
		for (; e.length && Sa(e).ranges;) e.pop()
	}
	function ia(e, t) {
		return t ? (ta(e.done), Sa(e.done)) : e.done.length && !Sa(e.done).ranges ? Sa(e.done) : e.done.length > 1 && !e.done[e.done.length - 2].ranges ? (e.done.pop(), Sa(e.done)) : void 0
	}
	function na(e, t, i, n) {
		var a = e.history;
		a.undone.length = 0;
		var o, r = +new Date;
		if ((a.lastOp == n || a.lastOrigin == t.origin && t.origin && ("+" == t.origin.charAt(0) && e.cm && a.lastModTime > r - e.cm.options.historyEventDelay || "*" == t.origin.charAt(0))) && (o = ia(a, a.lastOp == n))) {
			var s = Sa(o.changes);
			0 == ko(t.from, t.to) && 0 == ko(t.from, s.to) ? s.to = Ho(t) : o.changes.push(ea(e, t))
		} else {
			var l = Sa(a.done);
			for (l && l.ranges || ra(e.sel, a.done), o = {
				changes: [ea(e, t)],
				generation: a.generation
			}, a.done.push(o); a.done.length > a.undoDepth;) a.done.shift(), a.done[0].ranges || a.done.shift()
		}
		a.done.push(i), a.generation = ++a.maxGeneration, a.lastModTime = a.lastSelTime = r, a.lastOp = a.lastSelOp = n, a.lastOrigin = a.lastSelOrigin = t.origin, s || Cr(e, "historyAdded")
	}
	function aa(e, t, i, n) {
		var a = t.charAt(0);
		return "*" == a || "+" == a && i.ranges.length == n.ranges.length && i.somethingSelected() == n.somethingSelected() && new Date - e.history.lastSelTime <= (e.cm ? e.cm.options.historyEventDelay : 500)
	}
	function oa(e, t, i, n) {
		var a = e.history,
			o = n && n.origin;
		i == a.lastSelOp || o && a.lastSelOrigin == o && (a.lastModTime == a.lastSelTime && a.lastOrigin == o || aa(e, o, Sa(a.done), t)) ? a.done[a.done.length - 1] = t : ra(t, a.done), a.lastSelTime = +new Date, a.lastSelOrigin = o, a.lastSelOp = i, n && !1 !== n.clearRedo && ta(a.undone)
	}
	function ra(e, t) {
		var i = Sa(t);
		i && i.ranges && i.equals(e) || t.push(e)
	}
	function sa(e, t, i, n) {
		var a = t["spans_" + e.id],
			o = 0;
		e.iter(Math.max(e.first, i), Math.min(e.first + e.size, n), function(i) {
			i.markedSpans && ((a || (a = t["spans_" + e.id] = {}))[o] = i.markedSpans), ++o
		})
	}
	function la(e) {
		if (!e) return null;
		for (var t, i = 0; i < e.length; ++i) e[i].marker.explicitlyCleared ? t || (t = e.slice(0, i)) : t && t.push(e[i]);
		return t ? t.length ? t : null : e
	}
	function da(e, t) {
		var i = t["spans_" + e.id];
		if (!i) return null;
		for (var n = 0, a = []; n < t.text.length; ++n) a.push(la(i[n]));
		return a
	}
	function ua(e, t, i) {
		for (var n = 0, a = []; n < e.length; ++n) {
			var o = e[n];
			if (o.ranges) a.push(i ? ue.prototype.deepCopy.call(o) : o);
			else {
				var r = o.changes,
					s = [];
				a.push({
					changes: s
				});
				for (var l = 0; l < r.length; ++l) {
					var d, u = r[l];
					if (s.push({
						from: u.from,
						to: u.to,
						text: u.text
					}), t) for (var c in u)(d = c.match(/^spans_(\d+)$/)) && Xa(t, Number(d[1])) > -1 && (Sa(s)[c] = u[c], delete u[c])
				}
			}
		}
		return a
	}
	function ca(e, t, i, n) {
		i < e.line ? e.line += n : t < e.line && (e.line = t, e.ch = 0)
	}
	function fa(e, t, i, n) {
		for (var a = 0; a < e.length; ++a) {
			var o = e[a],
				r = !0;
			if (o.ranges) {
				o.copied || ((o = e[a] = o.deepCopy()).copied = !0);
				for (s = 0; s < o.ranges.length; s++) ca(o.ranges[s].anchor, t, i, n), ca(o.ranges[s].head, t, i, n)
			} else {
				for (var s = 0; s < o.changes.length; ++s) {
					var l = o.changes[s];
					if (i < l.from.line) l.from = Io(l.from.line + n, l.from.ch), l.to = Io(l.to.line + n, l.to.ch);
					else if (t <= l.to.line) {
						r = !1;
						break
					}
				}
				r || (e.splice(0, a + 1), a = 0)
			}
		}
	}
	function ha(e, t) {
		var i = t.from.line,
			n = t.to.line,
			a = t.text.length - (n - i) - 1;
		fa(e.done, i, n, a), fa(e.undone, i, n, a)
	}
	function pa(e) {
		return null != e.defaultPrevented ? e.defaultPrevented : 0 == e.returnValue
	}
	function ma(e) {
		return e.target || e.srcElement
	}
	function ga(e) {
		var t = e.which;
		return null == t && (1 & e.button ? t = 1 : 2 & e.button ? t = 3 : 4 & e.button && (t = 2)), bo && e.ctrlKey && 1 == t && (t = 3), t
	}
	function va(e, t) {
		var i = e._handlers && e._handlers[t];
		if (i) {
			var n, a = Array.prototype.slice.call(arguments, 2);
			Mo ? n = Mo.delayedCallbacks : _r ? n = _r : (n = _r = [], setTimeout(ya, 0));
			for (var o = 0; o < i.length; ++o) n.push(function(e) {
				return function() {
					e.apply(null, a)
				}
			}(i[o]))
		}
	}
	function ya() {
		var e = _r;
		_r = null;
		for (var t = 0; t < e.length; ++t) e[t]()
	}
	function wa(e, t, i) {
		return "string" == typeof t && (t = {
			type: t,
			preventDefault: function() {
				this.defaultPrevented = !0
			}
		}), Cr(e, i || t.type, e, t), pa(t) || t.codemirrorIgnore
	}
	function xa(e) {
		var t = e._handlers && e._handlers.cursorActivity;
		if (t) for (var i = e.curOp.cursorActivityHandlers || (e.curOp.cursorActivityHandlers = []), n = 0; n < t.length; ++n) - 1 == Xa(i, t[n]) && i.push(t[n])
	}
	function Fa(e, t) {
		var i = e._handlers && e._handlers[t];
		return i && i.length > 0
	}
	function ba(e) {
		e.prototype.on = function(e, t) {
			Fr(this, e, t)
		}, e.prototype.off = function(e, t) {
			br(this, e, t)
		}
	}
	function Ca() {
		this.id = null
	}
	function _a(e, t, i) {
		for (var n = 0, a = 0;;) {
			var o = e.indexOf("\t", n); - 1 == o && (o = e.length);
			var r = o - n;
			if (o == e.length || a + r >= t) return n + Math.min(r, t - a);
			if (a += o - n, a += i - a % i, n = o + 1, a >= t) return n
		}
	}
	function Ta(e) {
		for (; Lr.length <= e;) Lr.push(Sa(Lr) + " ");
		return Lr[e]
	}
	function Sa(e) {
		return e[e.length - 1]
	}
	function Xa(e, t) {
		for (var i = 0; i < e.length; ++i) if (e[i] == t) return i;
		return -1
	}
	function Ea(e, t) {
		for (var i = [], n = 0; n < e.length; n++) i[n] = t(e[n], n);
		return i
	}
	function Ia() {}
	function ka(e, t) {
		var i;
		return Object.create ? i = Object.create(e) : (Ia.prototype = e, i = new Ia), t && La(t, i), i
	}
	function La(e, t, i) {
		t || (t = {});
		for (var n in e)!e.hasOwnProperty(n) || !1 === i && t.hasOwnProperty(n) || (t[n] = e[n]);
		return t
	}
	function Aa(e) {
		var t = Array.prototype.slice.call(arguments, 1);
		return function() {
			return e.apply(null, t)
		}
	}
	function Na(e, t) {
		return t ? !! (t.source.indexOf("\\w") > -1 && Or(e)) || t.test(e) : Or(e)
	}
	function Wa(e) {
		for (var t in e) if (e.hasOwnProperty(t) && e[t]) return !1;
		return !0
	}
	function Oa(e) {
		return e.charCodeAt(0) >= 768 && Mr.test(e)
	}
	function Ma(e, t, i, n, a) {
		var o = document.createElement(e);
		if (i && (o.className = i), n && (o.style.cssText = n), "string" == typeof t) o.appendChild(document.createTextNode(t));
		else if (t) for (var r = 0; r < t.length; ++r) o.appendChild(t[r]);
		if (a) for (var s in a) o.setAttribute(s, a[s]);
		return o
	}
	function Da(e) {
		for (var t = e.childNodes.length; t > 0; --t) e.removeChild(e.firstChild);
		return e
	}
	function Ua(e, t) {
		return Da(e).appendChild(t)
	}
	function Pa() {
		return document.activeElement
	}
	function Va(e) {
		return new RegExp("(^|\\s)" + e + "(?:$|\\s)\\s*")
	}
	function Ra(e, t) {
		for (var i = e.split(" "), n = 0; n < i.length; n++) i[n] && !Va(i[n]).test(t) && (t += " " + i[n]);
		return t
	}
	function $a(e) {
		if (document.body.getElementsByClassName) for (var t = document.body.getElementsByClassName("CodeMirror"), i = 0; i < t.length; i++) {
			var n = t[i].CodeMirror;
			n && e(n)
		}
	}
	function Ba() {
		$r || (Ha(), $r = !0)
	}
	function Ha() {
		var e;
		Fr(window, "resize", function() {
			null == e && (e = setTimeout(function() {
				e = null, $a(Rt)
			}, 100))
		}), Fr(window, "blur", function() {
			$a(fi)
		})
	}
	function Ga(e) {
		if (null == Ur) {
			var t = Ma("span", "​");
			Ua(e, Ma("span", [t, document.createTextNode("x")])), 0 != e.firstChild.offsetHeight && (Ur = t.offsetWidth <= 1 && t.offsetHeight > 2 && !(co && fo < 8))
		}
		var i = Ur ? Ma("span", "​") : Ma("span", " ", null, "display: inline-block; width: 1px; margin-right: -1px");
		return i.setAttribute("cm-text", ""), i
	}
	function ja(e) {
		if (null != Pr) return Pr;
		var t = Ua(e, document.createTextNode("AخA")),
			i = Nr(t, 0, 1).getBoundingClientRect();
		if (!i || i.left == i.right) return !1;
		var n = Nr(t, 1, 2).getBoundingClientRect();
		return Pr = n.right - i.right < 3
	}
	function za(e) {
		if (null != zr) return zr;
		var t = Ua(e, Ma("span", "x")),
			i = t.getBoundingClientRect(),
			n = Nr(t, 0, 1).getBoundingClientRect();
		return zr = Math.abs(i.left - n.left) > 1
	}
	function Ka(e, t, i, n) {
		if (!e) return n(t, i, "ltr");
		for (var a = !1, o = 0; o < e.length; ++o) {
			var r = e[o];
			(r.from < i && r.to > t || t == i && r.to == t) && (n(Math.max(r.from, t), Math.min(r.to, i), 1 == r.level ? "rtl" : "ltr"), a = !0)
		}
		a || n(t, i, "ltr")
	}
	function Ya(e) {
		return e.level % 2 ? e.to : e.from
	}
	function qa(e) {
		return e.level % 2 ? e.from : e.to
	}
	function Qa(e) {
		var t = Jn(e);
		return t ? Ya(t[0]) : 0
	}
	function Ja(e) {
		var t = Jn(e);
		return t ? qa(Sa(t)) : e.text.length
	}
	function Za(e, t) {
		var i = Gn(e.doc, t),
			n = hn(i);
		n != i && (t = Yn(n));
		var a = Jn(n),
			o = a ? a[0].level % 2 ? Ja(n) : Qa(n) : 0;
		return Io(t, o)
	}
	function eo(e, t) {
		for (var i, n = Gn(e.doc, t); i = cn(n);) n = i.find(1, !0).line, t = null;
		var a = Jn(n),
			o = a ? a[0].level % 2 ? Qa(n) : Ja(n) : n.text.length;
		return Io(null == t ? Yn(n) : t, o)
	}
	function to(e, t) {
		var i = Za(e, t.line),
			n = Gn(e.doc, i.line),
			a = Jn(n);
		if (!a || 0 == a[0].level) {
			var o = Math.max(0, n.text.search(/\S/)),
				r = t.line == i.line && t.ch <= o && t.ch;
			return Io(i.line, r ? 0 : o)
		}
		return i
	}
	function io(e, t, i) {
		var n = e[0].level;
		return t == n || i != n && t < i
	}
	function no(e, t) {
		Yr = null;
		for (var i, n = 0; n < e.length; ++n) {
			var a = e[n];
			if (a.from < t && a.to > t) return n;
			if (a.from == t || a.to == t) {
				if (null != i) return io(e, a.level, e[i].level) ? (a.from != a.to && (Yr = i), n) : (a.from != a.to && (Yr = n), i);
				i = n
			}
		}
		return i
	}
	function ao(e, t, i, n) {
		if (!n) return t + i;
		do {
			t += i
		} while (t > 0 && Oa(e.text.charAt(t)));
		return t
	}
	function oo(e, t, i, n) {
		var a = Jn(e);
		if (!a) return ro(e, t, i, n);
		for (var o = no(a, t), r = a[o], s = ao(e, t, r.level % 2 ? -i : i, n);;) {
			if (s > r.from && s < r.to) return s;
			if (s == r.from || s == r.to) return no(a, s) == o ? s : (r = a[o += i], i > 0 == r.level % 2 ? r.to : r.from);
			if (!(r = a[o += i])) return null;
			s = i > 0 == r.level % 2 ? ao(e, r.to, -1, n) : ao(e, r.from, 1, n)
		}
	}
	function ro(e, t, i, n) {
		var a = t + i;
		if (n) for (; a > 0 && Oa(e.text.charAt(a));) a += i;
		return a < 0 || a > e.text.length ? null : a
	}
	var so = /gecko\/\d/i.test(navigator.userAgent),
		lo = /MSIE \d/.test(navigator.userAgent),
		uo = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent),
		co = lo || uo,
		fo = co && (lo ? document.documentMode || 6 : uo[1]),
		ho = /WebKit\//.test(navigator.userAgent),
		po = ho && /Qt\/\d+\.\d+/.test(navigator.userAgent),
		mo = /Chrome\//.test(navigator.userAgent),
		go = /Opera\//.test(navigator.userAgent),
		vo = /Apple Computer/.test(navigator.vendor),
		yo = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(navigator.userAgent),
		wo = /PhantomJS/.test(navigator.userAgent),
		xo = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent),
		Fo = xo || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent),
		bo = xo || /Mac/.test(navigator.platform),
		Co = /win/i.test(navigator.platform),
		_o = go && navigator.userAgent.match(/Version\/(\d*\.\d*)/);
	_o && (_o = Number(_o[1])), _o && _o >= 15 && (go = !1, ho = !0);
	var To = bo && (po || go && (null == _o || _o < 12.11)),
		So = so || co && fo >= 9,
		Xo = !1,
		Eo = !1;
	p.prototype = La({
		update: function(e) {
			var t = e.scrollWidth > e.clientWidth + 1,
				i = e.scrollHeight > e.clientHeight + 1,
				n = e.nativeBarWidth;
			if (i) {
				this.vert.style.display = "block", this.vert.style.bottom = t ? n + "px" : "0";
				var a = e.viewHeight - (t ? n : 0);
				this.vert.firstChild.style.height = Math.max(0, e.scrollHeight - e.clientHeight + a) + "px"
			} else this.vert.style.display = "", this.vert.firstChild.style.height = "0";
			if (t) {
				this.horiz.style.display = "block", this.horiz.style.right = i ? n + "px" : "0", this.horiz.style.left = e.barLeft + "px";
				var o = e.viewWidth - e.barLeft - (i ? n : 0);
				this.horiz.firstChild.style.width = e.scrollWidth - e.clientWidth + o + "px"
			} else this.horiz.style.display = "", this.horiz.firstChild.style.width = "0";
			return !this.checkedOverlay && e.clientHeight > 0 && (0 == n && this.overlayHack(), this.checkedOverlay = !0), {
				right: i ? n : 0,
				bottom: t ? n : 0
			}
		},
		setScrollLeft: function(e) {
			this.horiz.scrollLeft != e && (this.horiz.scrollLeft = e)
		},
		setScrollTop: function(e) {
			this.vert.scrollTop != e && (this.vert.scrollTop = e)
		},
		overlayHack: function() {
			var e = bo && !yo ? "12px" : "18px";
			this.horiz.style.minHeight = this.vert.style.minWidth = e;
			var t = this,
				i = function(e) {
					ma(e) != t.vert && ma(e) != t.horiz && Et(t.cm, Ht)(e)
				};
			Fr(this.vert, "mousedown", i), Fr(this.horiz, "mousedown", i)
		},
		clear: function() {
			var e = this.horiz.parentNode;
			e.removeChild(this.horiz), e.removeChild(this.vert)
		}
	}, p.prototype), m.prototype = La({
		update: function() {
			return {
				bottom: 0,
				right: 0
			}
		},
		setScrollLeft: function() {},
		setScrollTop: function() {},
		clear: function() {}
	}, m.prototype), e.scrollbarModel = {
		native: p,
		null: m
	}, _.prototype.signal = function(e, t) {
		Fa(e, t) && this.events.push(arguments)
	}, _.prototype.finish = function() {
		for (var e = 0; e < this.events.length; e++) Cr.apply(null, this.events[e])
	};
	var Io = e.Pos = function(e, t) {
			if (!(this instanceof Io)) return new Io(e, t);
			this.line = e, this.ch = t
		},
		ko = e.cmpPos = function(e, t) {
			return e.line - t.line || e.ch - t.ch
		},
		Lo = null;
	ie.prototype = La({
		init: function(e) {
			function t(e) {
				if (n.somethingSelected()) Lo = n.getSelections(), i.inaccurateSelection && (i.prevInput = "", i.inaccurateSelection = !1, o.value = Lo.join("\n"), Ar(o));
				else {
					if (!n.options.lineWiseCopyCut) return;
					var t = ee(n);
					Lo = t.text, "cut" == e.type ? n.setSelections(t.ranges, null, Xr) : (i.prevInput = "", o.value = t.text.join("\n"), Ar(o))
				}
				"cut" == e.type && (n.state.cutIncoming = !0)
			}
			var i = this,
				n = this.cm,
				a = this.wrapper = ne(),
				o = this.textarea = a.firstChild;
			e.wrapper.insertBefore(a, e.wrapper.firstChild), xo && (o.style.width = "0px"), Fr(o, "input", function() {
				co && fo >= 9 && i.hasSelection && (i.hasSelection = null), i.poll()
			}), Fr(o, "paste", function(e) {
				if (J(e, n)) return !0;
				n.state.pasteIncoming = !0, i.fastPoll()
			}), Fr(o, "cut", t), Fr(o, "copy", t), Fr(e.scroller, "paste", function(t) {
				$t(e, t) || (n.state.pasteIncoming = !0, i.focus())
			}), Fr(e.lineSpace, "selectstart", function(t) {
				$t(e, t) || yr(t)
			}), Fr(o, "compositionstart", function() {
				var e = n.getCursor("from");
				i.composing = {
					start: e,
					range: n.markText(e, n.getCursor("to"), {
						className: "CodeMirror-composing"
					})
				}
			}), Fr(o, "compositionend", function() {
				i.composing && (i.poll(), i.composing.range.clear(), i.composing = null)
			})
		},
		prepareSelection: function() {
			var e = this.cm,
				t = e.display,
				i = e.doc,
				n = Ne(e);
			if (e.options.moveInputWithCursor) {
				var a = ct(e, i.sel.primary().head, "div"),
					o = t.wrapper.getBoundingClientRect(),
					r = t.lineDiv.getBoundingClientRect();
				n.teTop = Math.max(0, Math.min(t.wrapper.clientHeight - 10, a.top + r.top - o.top)), n.teLeft = Math.max(0, Math.min(t.wrapper.clientWidth - 10, a.left + r.left - o.left))
			}
			return n
		},
		showSelection: function(e) {
			var t = this.cm.display;
			Ua(t.cursorDiv, e.cursors), Ua(t.selectionDiv, e.selection), null != e.teTop && (this.wrapper.style.top = e.teTop + "px", this.wrapper.style.left = e.teLeft + "px")
		},
		reset: function(e) {
			if (!this.contextMenuPending) {
				var t, i, n = this.cm,
					a = n.doc;
				if (n.somethingSelected()) {
					this.prevInput = "";
					var o = a.sel.primary(),
						r = (t = jr && (o.to().line - o.from().line > 100 || (i = n.getSelection()).length > 1e3)) ? "-" : i || n.getSelection();
					this.textarea.value = r, n.state.focused && Ar(this.textarea), co && fo >= 9 && (this.hasSelection = r)
				} else e || (this.prevInput = this.textarea.value = "", co && fo >= 9 && (this.hasSelection = null));
				this.inaccurateSelection = t
			}
		},
		getField: function() {
			return this.textarea
		},
		supportsTouch: function() {
			return !1
		},
		focus: function() {
			if ("nocursor" != this.cm.options.readOnly && (!Fo || Pa() != this.textarea)) try {
				this.textarea.focus()
			} catch (e) {}
		},
		blur: function() {
			this.textarea.blur()
		},
		resetPosition: function() {
			this.wrapper.style.top = this.wrapper.style.left = 0
		},
		receivedFocus: function() {
			this.slowPoll()
		},
		slowPoll: function() {
			var e = this;
			e.pollingFast || e.polling.set(this.cm.options.pollInterval, function() {
				e.poll(), e.cm.state.focused && e.slowPoll()
			})
		},
		fastPoll: function() {
			function e() {
				i.poll() || t ? (i.pollingFast = !1, i.slowPoll()) : (t = !0, i.polling.set(60, e))
			}
			var t = !1,
				i = this;
			i.pollingFast = !0, i.polling.set(20, e)
		},
		poll: function() {
			var e = this.cm,
				t = this.textarea,
				i = this.prevInput;
			if (this.contextMenuPending || !e.state.focused || Gr(t) && !i || q(e) || e.options.disableInput || e.state.keySeq) return !1;
			var n = t.value;
			if (n == i && !e.somethingSelected()) return !1;
			if (co && fo >= 9 && this.hasSelection === n || bo && /[-]/.test(n)) return e.display.input.reset(), !1;
			if (e.doc.sel == e.display.selForContextMenu) {
				var a = n.charCodeAt(0);
				if (8203 != a || i || (i = "​"), 8666 == a) return this.reset(), this.cm.execCommand("undo")
			}
			for (var o = 0, r = Math.min(i.length, n.length); o < r && i.charCodeAt(o) == n.charCodeAt(o);)++o;
			var s = this;
			return Xt(e, function() {
				Q(e, n.slice(o), i.length - o, null, s.composing ? "*compose" : null), n.length > 1e3 || n.indexOf("\n") > -1 ? t.value = s.prevInput = "" : s.prevInput = n, s.composing && (s.composing.range.clear(), s.composing.range = e.markText(s.composing.start, e.getCursor("to"), {
					className: "CodeMirror-composing"
				}))
			}), !0
		},
		ensurePolled: function() {
			this.pollingFast && this.poll() && (this.pollingFast = !1)
		},
		onKeyPress: function() {
			co && fo >= 9 && (this.hasSelection = null), this.fastPoll()
		},
		onContextMenu: function(e) {
			function t() {
				if (null != r.selectionStart) {
					var e = a.somethingSelected(),
						t = "​" + (e ? r.value : "");
					r.value = "⇚", r.value = t, n.prevInput = e ? "" : "​", r.selectionStart = 1, r.selectionEnd = t.length, o.selForContextMenu = a.doc.sel
				}
			}
			function i() {
				if (n.contextMenuPending = !1, n.wrapper.style.position = "relative", r.style.cssText = d, co && fo < 9 && o.scrollbars.setScrollTop(o.scroller.scrollTop = l), null != r.selectionStart) {
					(!co || co && fo < 9) && t();
					var e = 0,
						i = function() {
							o.selForContextMenu == a.doc.sel && 0 == r.selectionStart && r.selectionEnd > 0 && "​" == n.prevInput ? Et(a, tr.selectAll)(a) : e++ < 10 ? o.detectingSelectAll = setTimeout(i, 500) : o.input.reset()
						};
					o.detectingSelectAll = setTimeout(i, 200)
				}
			}
			var n = this,
				a = n.cm,
				o = a.display,
				r = n.textarea,
				s = Bt(a, e),
				l = o.scroller.scrollTop;
			if (s && !go) {
				a.options.resetSelectionOnContextMenu && -1 == a.doc.sel.contains(s) && Et(a, Se)(a.doc, he(s), Xr);
				var d = r.style.cssText;
				if (n.wrapper.style.position = "absolute", r.style.cssText = "position: fixed; width: 30px; height: 30px; top: " + (e.clientY - 5) + "px; left: " + (e.clientX - 5) + "px; z-index: 1000; background: " + (co ? "rgba(255, 255, 255, .05)" : "transparent") + "; outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);", ho) var u = window.scrollY;
				if (o.input.focus(), ho && window.scrollTo(null, u), o.input.reset(), a.somethingSelected() || (r.value = n.prevInput = " "), n.contextMenuPending = !0, o.selForContextMenu = a.doc.sel, clearTimeout(o.detectingSelectAll), co && fo >= 9 && t(), So) {
					xr(e);
					var c = function() {
							br(window, "mouseup", c), setTimeout(i, 20)
						};
					Fr(window, "mouseup", c)
				} else setTimeout(i, 50)
			}
		},
		setUneditable: Ia,
		needsContentAttribute: !1
	}, ie.prototype), ae.prototype = La({
		init: function(e) {
			function t(e) {
				if (n.somethingSelected()) Lo = n.getSelections(), "cut" == e.type && n.replaceSelection("", null, "cut");
				else {
					if (!n.options.lineWiseCopyCut) return;
					var t = ee(n);
					Lo = t.text, "cut" == e.type && n.operation(function() {
						n.setSelections(t.ranges, 0, Xr), n.replaceSelection("", null, "cut")
					})
				}
				if (e.clipboardData && !xo) e.preventDefault(), e.clipboardData.clearData(), e.clipboardData.setData("text/plain", Lo.join("\n"));
				else {
					var i = ne(),
						a = i.firstChild;
					n.display.lineSpace.insertBefore(i, n.display.lineSpace.firstChild), a.value = Lo.join("\n");
					var o = document.activeElement;
					Ar(a), setTimeout(function() {
						n.display.lineSpace.removeChild(i), o.focus()
					}, 50)
				}
			}
			var i = this,
				n = i.cm,
				a = i.div = e.lineDiv;
			a.contentEditable = "true", te(a), Fr(a, "paste", function(e) {
				J(e, n)
			}), Fr(a, "compositionstart", function(e) {
				var t = e.data;
				if (i.composing = {
					sel: n.doc.sel,
					data: t,
					startData: t
				}, t) {
					var a = n.doc.sel.primary(),
						o = n.getLine(a.head.line).indexOf(t, Math.max(0, a.head.ch - t.length));
					o > -1 && o <= a.head.ch && (i.composing.sel = he(Io(a.head.line, o), Io(a.head.line, o + t.length)))
				}
			}), Fr(a, "compositionupdate", function(e) {
				i.composing.data = e.data
			}), Fr(a, "compositionend", function(e) {
				var t = i.composing;
				t && (e.data == t.startData || /​/.test(e.data) || (t.data = e.data), setTimeout(function() {
					t.handled || i.applyComposition(t), i.composing == t && (i.composing = null)
				}, 50))
			}), Fr(a, "touchstart", function() {
				i.forceCompositionEnd()
			}), Fr(a, "input", function() {
				i.composing || i.pollContent() || Xt(i.cm, function() {
					Nt(n)
				})
			}), Fr(a, "copy", t), Fr(a, "cut", t)
		},
		prepareSelection: function() {
			var e = Ne(this.cm, !1);
			return e.focus = this.cm.state.focused, e
		},
		showSelection: function(e) {
			e && this.cm.display.view.length && (e.focus && this.showPrimarySelection(), this.showMultipleSelections(e))
		},
		showPrimarySelection: function() {
			var e = window.getSelection(),
				t = this.cm.doc.sel.primary(),
				i = se(this.cm, e.anchorNode, e.anchorOffset),
				n = se(this.cm, e.focusNode, e.focusOffset);
			if (!i || i.bad || !n || n.bad || 0 != ko(K(i, n), t.from()) || 0 != ko(z(i, n), t.to())) {
				var a = oe(this.cm, t.from()),
					o = oe(this.cm, t.to());
				if (a || o) {
					var r = this.cm.display.view,
						s = e.rangeCount && e.getRangeAt(0);
					if (a) {
						if (!o) {
							var l = r[r.length - 1].measure,
								d = l.maps ? l.maps[l.maps.length - 1] : l.map;
							o = {
								node: d[d.length - 1],
								offset: d[d.length - 2] - d[d.length - 3]
							}
						}
					} else a = {
						node: r[0].measure.map[2],
						offset: 0
					};
					try {
						var u = Nr(a.node, a.offset, o.offset, o.node)
					} catch (e) {}
					u && (e.removeAllRanges(), e.addRange(u), s && null == e.anchorNode ? e.addRange(s) : so && this.startGracePeriod()), this.rememberSelection()
				}
			}
		},
		startGracePeriod: function() {
			var e = this;
			clearTimeout(this.gracePeriod), this.gracePeriod = setTimeout(function() {
				e.gracePeriod = !1, e.selectionChanged() && e.cm.operation(function() {
					e.cm.curOp.selectionChanged = !0
				})
			}, 20)
		},
		showMultipleSelections: function(e) {
			Ua(this.cm.display.cursorDiv, e.cursors), Ua(this.cm.display.selectionDiv, e.selection)
		},
		rememberSelection: function() {
			var e = window.getSelection();
			this.lastAnchorNode = e.anchorNode, this.lastAnchorOffset = e.anchorOffset, this.lastFocusNode = e.focusNode, this.lastFocusOffset = e.focusOffset
		},
		selectionInEditor: function() {
			var e = window.getSelection();
			if (!e.rangeCount) return !1;
			var t = e.getRangeAt(0).commonAncestorContainer;
			return Dr(this.div, t)
		},
		focus: function() {
			"nocursor" != this.cm.options.readOnly && this.div.focus()
		},
		blur: function() {
			this.div.blur()
		},
		getField: function() {
			return this.div
		},
		supportsTouch: function() {
			return !0
		},
		receivedFocus: function() {
			function e() {
				t.cm.state.focused && (t.pollSelection(), t.polling.set(t.cm.options.pollInterval, e))
			}
			var t = this;
			this.selectionInEditor() ? this.pollSelection() : Xt(this.cm, function() {
				t.cm.curOp.selectionChanged = !0
			}), this.polling.set(this.cm.options.pollInterval, e)
		},
		selectionChanged: function() {
			var e = window.getSelection();
			return e.anchorNode != this.lastAnchorNode || e.anchorOffset != this.lastAnchorOffset || e.focusNode != this.lastFocusNode || e.focusOffset != this.lastFocusOffset
		},
		pollSelection: function() {
			if (!this.composing && !this.gracePeriod && this.selectionChanged()) {
				var e = window.getSelection(),
					t = this.cm;
				this.rememberSelection();
				var i = se(t, e.anchorNode, e.anchorOffset),
					n = se(t, e.focusNode, e.focusOffset);
				i && n && Xt(t, function() {
					Se(t.doc, he(i, n), Xr), (i.bad || n.bad) && (t.curOp.selectionChanged = !0)
				})
			}
		},
		pollContent: function() {
			var e = this.cm,
				t = e.display,
				i = e.doc.sel.primary(),
				n = i.from(),
				a = i.to();
			if (n.line < t.viewFrom || a.line > t.viewTo - 1) return !1;
			var o;
			if (n.line == t.viewFrom || 0 == (o = Mt(e, n.line))) var r = Yn(t.view[0].line),
				s = t.view[0].node;
			else var r = Yn(t.view[o].line),
				s = t.view[o - 1].node.nextSibling;
			var l = Mt(e, a.line);
			if (l == t.view.length - 1) var d = t.viewTo - 1,
				u = t.lineDiv.lastChild;
			else var d = Yn(t.view[l + 1].line) - 1,
				u = t.view[l + 1].node.previousSibling;
			for (var c = Hr(de(e, s, u, r, d)), f = jn(e.doc, Io(r, 0), Io(d, Gn(e.doc, d).text.length)); c.length > 1 && f.length > 1;) if (Sa(c) == Sa(f)) c.pop(), f.pop(), d--;
			else {
				if (c[0] != f[0]) break;
				c.shift(), f.shift(), r++
			}
			for (var h = 0, p = 0, m = c[0], g = f[0], v = Math.min(m.length, g.length); h < v && m.charCodeAt(h) == g.charCodeAt(h);)++h;
			for (var y = Sa(c), w = Sa(f), x = Math.min(y.length - (1 == c.length ? h : 0), w.length - (1 == f.length ? h : 0)); p < x && y.charCodeAt(y.length - p - 1) == w.charCodeAt(w.length - p - 1);)++p;
			c[c.length - 1] = y.slice(0, y.length - p), c[0] = c[0].slice(h);
			var F = Io(r, h),
				b = Io(d, f.length ? Sa(f).length - p : 0);
			return c.length > 1 || c[0] || ko(F, b) ? (Si(e.doc, c, F, b, "+input"), !0) : void 0
		},
		ensurePolled: function() {
			this.forceCompositionEnd()
		},
		reset: function() {
			this.forceCompositionEnd()
		},
		forceCompositionEnd: function() {
			this.composing && !this.composing.handled && (this.applyComposition(this.composing), this.composing.handled = !0, this.div.blur(), this.div.focus())
		},
		applyComposition: function(e) {
			e.data && e.data != e.startData && Et(this.cm, Q)(this.cm, e.data, 0, e.sel)
		},
		setUneditable: function(e) {
			e.setAttribute("contenteditable", "false")
		},
		onKeyPress: function(e) {
			e.preventDefault(), Et(this.cm, Q)(this.cm, String.fromCharCode(null == e.charCode ? e.keyCode : e.charCode), 0)
		},
		onContextMenu: Ia,
		resetPosition: Ia,
		needsContentAttribute: !0
	}, ae.prototype), e.inputStyles = {
		textarea: ie,
		contenteditable: ae
	}, ue.prototype = {
		primary: function() {
			return this.ranges[this.primIndex]
		},
		equals: function(e) {
			if (e == this) return !0;
			if (e.primIndex != this.primIndex || e.ranges.length != this.ranges.length) return !1;
			for (var t = 0; t < this.ranges.length; t++) {
				var i = this.ranges[t],
					n = e.ranges[t];
				if (0 != ko(i.anchor, n.anchor) || 0 != ko(i.head, n.head)) return !1
			}
			return !0
		},
		deepCopy: function() {
			for (var e = [], t = 0; t < this.ranges.length; t++) e[t] = new ce(j(this.ranges[t].anchor), j(this.ranges[t].head));
			return new ue(e, this.primIndex)
		},
		somethingSelected: function() {
			for (var e = 0; e < this.ranges.length; e++) if (!this.ranges[e].empty()) return !0;
			return !1
		},
		contains: function(e, t) {
			t || (t = e);
			for (var i = 0; i < this.ranges.length; i++) {
				var n = this.ranges[i];
				if (ko(t, n.from()) >= 0 && ko(e, n.to()) <= 0) return i
			}
			return -1
		}
	}, ce.prototype = {
		from: function() {
			return K(this.anchor, this.head)
		},
		to: function() {
			return z(this.anchor, this.head)
		},
		empty: function() {
			return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch
		}
	};
	var Ao, No, Wo, Oo = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	},
		Mo = null,
		Do = 0,
		Uo = 0,
		Po = 0,
		Vo = null;
	co ? Vo = -.53 : so ? Vo = 15 : mo ? Vo = -.7 : vo && (Vo = -1 / 3);
	var Ro = function(e) {
			var t = e.wheelDeltaX,
				i = e.wheelDeltaY;
			return null == t && e.detail && e.axis == e.HORIZONTAL_AXIS && (t = e.detail), null == i && e.detail && e.axis == e.VERTICAL_AXIS ? i = e.detail : null == i && (i = e.wheelDelta), {
				x: t,
				y: i
			}
		};
	e.wheelEventPixels = function(e) {
		var t = Ro(e);
		return t.x *= Vo, t.y *= Vo, t
	};
	var $o = new Ca,
		Bo = null,
		Ho = e.changeEnd = function(e) {
			return e.text ? Io(e.from.line + e.text.length - 1, Sa(e.text).length + (1 == e.text.length ? e.from.ch : 0)) : e.to
		};
	e.prototype = {
		constructor: e,
		focus: function() {
			window.focus(), this.display.input.focus()
		},
		setOption: function(e, t) {
			var i = this.options,
				n = i[e];
			i[e] == t && "mode" != e || (i[e] = t, jo.hasOwnProperty(e) && Et(this, jo[e])(this, t, n))
		},
		getOption: function(e) {
			return this.options[e]
		},
		getDoc: function() {
			return this.doc
		},
		addKeyMap: function(e, t) {
			this.state.keyMaps[t ? "push" : "unshift"](Ri(e))
		},
		removeKeyMap: function(e) {
			for (var t = this.state.keyMaps, i = 0; i < t.length; ++i) if (t[i] == e || t[i].name == e) return t.splice(i, 1), !0
		},
		addOverlay: It(function(t, i) {
			var n = t.token ? t : e.getMode(this.options, t);
			if (n.startState) throw new Error("Overlays may not be stateful.");
			this.state.overlays.push({
				mode: n,
				modeSpec: t,
				opaque: i && i.opaque
			}), this.state.modeGen++, Nt(this)
		}),
		removeOverlay: It(function(e) {
			for (var t = this.state.overlays, i = 0; i < t.length; ++i) {
				var n = t[i].modeSpec;
				if (n == e || "string" == typeof e && n.name == e) return t.splice(i, 1), this.state.modeGen++, void Nt(this)
			}
		}),
		indentLine: It(function(e, t, i) {
			"string" != typeof t && "number" != typeof t && (t = null == t ? this.options.smartIndent ? "smart" : "prev" : t ? "add" : "subtract"), ve(this.doc, e) && Wi(this, e, t, i)
		}),
		indentSelection: It(function(e) {
			for (var t = this.doc.sel.ranges, i = -1, n = 0; n < t.length; n++) {
				var a = t[n];
				if (a.empty()) a.head.line > i && (Wi(this, a.head.line, e, !0), i = a.head.line, n == this.doc.sel.primIndex && Ai(this));
				else {
					var o = a.from(),
						r = a.to(),
						s = Math.max(i, o.line);
					i = Math.min(this.lastLine(), r.line - (r.ch ? 0 : 1)) + 1;
					for (var l = s; l < i; ++l) Wi(this, l, e);
					var d = this.doc.sel.ranges;
					0 == o.ch && t.length == d.length && d[n].from().ch > 0 && be(this.doc, n, new ce(o, d[n].to()), Xr)
				}
			}
		}),
		getTokenAt: function(e, t) {
			return Xn(this, e, t)
		},
		getLineTokens: function(e, t) {
			return Xn(this, Io(e), t, !0)
		},
		getTokenTypeAt: function(e) {
			e = me(this.doc, e);
			var t, i = kn(this, Gn(this.doc, e.line)),
				n = 0,
				a = (i.length - 1) / 2,
				o = e.ch;
			if (0 == o) t = i[2];
			else for (;;) {
				var r = n + a >> 1;
				if ((r ? i[2 * r - 1] : 0) >= o) a = r;
				else {
					if (!(i[2 * r + 1] < o)) {
						t = i[2 * r + 2];
						break
					}
					n = r + 1
				}
			}
			var s = t ? t.indexOf("cm-overlay ") : -1;
			return s < 0 ? t : 0 == s ? null : t.slice(0, s - 1)
		},
		getModeAt: function(t) {
			var i = this.doc.mode;
			return i.innerMode ? e.innerMode(i, this.getTokenAt(t).state).mode : i
		},
		getHelper: function(e, t) {
			return this.getHelpers(e, t)[0]
		},
		getHelpers: function(e, t) {
			var i = [];
			if (!Jo.hasOwnProperty(t)) return i;
			var n = Jo[t],
				a = this.getModeAt(e);
			if ("string" == typeof a[t]) n[a[t]] && i.push(n[a[t]]);
			else if (a[t]) for (r = 0; r < a[t].length; r++) {
				var o = n[a[t][r]];
				o && i.push(o)
			} else a.helperType && n[a.helperType] ? i.push(n[a.helperType]) : n[a.name] && i.push(n[a.name]);
			for (var r = 0; r < n._global.length; r++) {
				var s = n._global[r];
				s.pred(a, this) && -1 == Xa(i, s.val) && i.push(s.val)
			}
			return i
		},
		getStateAfter: function(e, t) {
			var i = this.doc;
			return e = pe(i, null == e ? i.first + i.size - 1 : e), Ve(this, e + 1, t)
		},
		cursorCoords: function(e, t) {
			var i, n = this.doc.sel.primary();
			return i = null == e ? n.head : "object" == typeof e ? me(this.doc, e) : e ? n.from() : n.to(), ct(this, i, t || "page")
		},
		charCoords: function(e, t) {
			return ut(this, me(this.doc, e), t || "page")
		},
		coordsChar: function(e, t) {
			return e = dt(this, e, t || "page"), pt(this, e.left, e.top)
		},
		lineAtHeight: function(e, t) {
			return e = dt(this, {
				top: e,
				left: 0
			}, t || "page").top, qn(this.doc, e + this.display.viewOffset)
		},
		heightAtLine: function(e, t) {
			var i, n = !1;
			if ("number" == typeof e) {
				var a = this.doc.first + this.doc.size - 1;
				e < this.doc.first ? e = this.doc.first : e > a && (e = a, n = !0), i = Gn(this.doc, e)
			} else i = e;
			return lt(this, i, {
				top: 0,
				left: 0
			}, t || "page").top + (n ? this.doc.height - Qn(i) : 0)
		},
		defaultTextHeight: function() {
			return gt(this.display)
		},
		defaultCharWidth: function() {
			return vt(this.display)
		},
		setGutterMarker: It(function(e, t, i) {
			return Oi(this.doc, e, "gutter", function(e) {
				var n = e.gutterMarkers || (e.gutterMarkers = {});
				return n[t] = i, !i && Wa(n) && (e.gutterMarkers = null), !0
			})
		}),
		clearGutter: It(function(e) {
			var t = this,
				i = t.doc,
				n = i.first;
			i.iter(function(i) {
				i.gutterMarkers && i.gutterMarkers[e] && (i.gutterMarkers[e] = null, Wt(t, n, "gutter"), Wa(i.gutterMarkers) && (i.gutterMarkers = null)), ++n
			})
		}),
		lineInfo: function(e) {
			if ("number" == typeof e) {
				if (!ve(this.doc, e)) return null;
				var t = e;
				if (!(e = Gn(this.doc, e))) return null
			} else if (null == (t = Yn(e))) return null;
			return {
				line: t,
				handle: e,
				text: e.text,
				gutterMarkers: e.gutterMarkers,
				textClass: e.textClass,
				bgClass: e.bgClass,
				wrapClass: e.wrapClass,
				widgets: e.widgets
			}
		},
		getViewport: function() {
			return {
				from: this.display.viewFrom,
				to: this.display.viewTo
			}
		},
		addWidget: function(e, t, i, n, a) {
			var o = this.display,
				r = (e = ct(this, me(this.doc, e))).bottom,
				s = e.left;
			if (t.style.position = "absolute", t.setAttribute("cm-ignore-events", "true"), this.display.input.setUneditable(t), o.sizer.appendChild(t), "over" == n) r = e.top;
			else if ("above" == n || "near" == n) {
				var l = Math.max(o.wrapper.clientHeight, this.doc.height),
					d = Math.max(o.sizer.clientWidth, o.lineSpace.clientWidth);
				("above" == n || e.bottom + t.offsetHeight > l) && e.top > t.offsetHeight ? r = e.top - t.offsetHeight : e.bottom + t.offsetHeight <= l && (r = e.bottom), s + t.offsetWidth > d && (s = d - t.offsetWidth)
			}
			t.style.top = r + "px", t.style.left = t.style.right = "", "right" == a ? (s = o.sizer.clientWidth - t.offsetWidth, t.style.right = "0px") : ("left" == a ? s = 0 : "middle" == a && (s = (o.sizer.clientWidth - t.offsetWidth) / 2), t.style.left = s + "px"), i && Ii(this, s, r, s + t.offsetWidth, r + t.offsetHeight)
		},
		triggerOnKeyDown: It(ri),
		triggerOnKeyPress: It(di),
		triggerOnKeyUp: li,
		execCommand: function(e) {
			if (tr.hasOwnProperty(e)) return tr[e](this)
		},
		triggerElectric: It(function(e) {
			Z(this, e)
		}),
		findPosH: function(e, t, i, n) {
			var a = 1;
			t < 0 && (a = -1, t = -t);
			for (var o = 0, r = me(this.doc, e); o < t && !(r = Di(this.doc, r, a, i, n)).hitSide; ++o);
			return r
		},
		moveH: It(function(e, t) {
			var i = this;
			i.extendSelectionsBy(function(n) {
				return i.display.shift || i.doc.extend || n.empty() ? Di(i.doc, n.head, e, t, i.options.rtlMoveVisually) : e < 0 ? n.from() : n.to()
			}, Ir)
		}),
		deleteH: It(function(e, t) {
			var i = this.doc.sel,
				n = this.doc;
			i.somethingSelected() ? n.replaceSelection("", null, "+delete") : Mi(this, function(i) {
				var a = Di(n, i.head, e, t, !1);
				return e < 0 ? {
					from: a,
					to: i.head
				} : {
					from: i.head,
					to: a
				}
			})
		}),
		findPosV: function(e, t, i, n) {
			var a = 1,
				o = n;
			t < 0 && (a = -1, t = -t);
			for (var r = 0, s = me(this.doc, e); r < t; ++r) {
				var l = ct(this, s, "div");
				if (null == o ? o = l.left : l.left = o, (s = Ui(this, l, a, i)).hitSide) break
			}
			return s
		},
		moveV: It(function(e, t) {
			var i = this,
				n = this.doc,
				a = [],
				o = !i.display.shift && !n.extend && n.sel.somethingSelected();
			if (n.extendSelectionsBy(function(r) {
				if (o) return e < 0 ? r.from() : r.to();
				var s = ct(i, r.head, "div");
				null != r.goalColumn && (s.left = r.goalColumn), a.push(s.left);
				var l = Ui(i, s, e, t);
				return "page" == t && r == n.sel.primary() && Li(i, null, ut(i, l, "div").top - s.top), l
			}, Ir), a.length) for (var r = 0; r < n.sel.ranges.length; r++) n.sel.ranges[r].goalColumn = a[r]
		}),
		findWordAt: function(e) {
			var t = Gn(this.doc, e.line).text,
				i = e.ch,
				n = e.ch;
			if (t) {
				var a = this.getHelper(e, "wordChars");
				(e.xRel < 0 || n == t.length) && i ? --i : ++n;
				for (var o = t.charAt(i), r = Na(o, a) ?
				function(e) {
					return Na(e, a)
				} : /\s/.test(o) ?
				function(e) {
					return /\s/.test(e)
				} : function(e) {
					return !/\s/.test(e) && !Na(e)
				}; i > 0 && r(t.charAt(i - 1));)--i;
				for (; n < t.length && r(t.charAt(n));)++n
			}
			return new ce(Io(e.line, i), Io(e.line, n))
		},
		toggleOverwrite: function(e) {
			null != e && e == this.state.overwrite || ((this.state.overwrite = !this.state.overwrite) ? Rr(this.display.cursorDiv, "CodeMirror-overwrite") : Vr(this.display.cursorDiv, "CodeMirror-overwrite"), Cr(this, "overwriteToggle", this, this.state.overwrite))
		},
		hasFocus: function() {
			return this.display.input.getField() == Pa()
		},
		scrollTo: It(function(e, t) {
			null == e && null == t || Ni(this), null != e && (this.curOp.scrollLeft = e), null != t && (this.curOp.scrollTop = t)
		}),
		getScrollInfo: function() {
			var e = this.display.scroller;
			return {
				left: e.scrollLeft,
				top: e.scrollTop,
				height: e.scrollHeight - He(this) - this.display.barHeight,
				width: e.scrollWidth - He(this) - this.display.barWidth,
				clientHeight: je(this),
				clientWidth: Ge(this)
			}
		},
		scrollIntoView: It(function(e, t) {
			if (null == e ? (e = {
				from: this.doc.sel.primary().head,
				to: null
			}, null == t && (t = this.options.cursorScrollMargin)) : "number" == typeof e ? e = {
				from: Io(e, 0),
				to: null
			} : null == e.from && (e = {
				from: e,
				to: null
			}), e.to || (e.to = e.from), e.margin = t || 0, null != e.from.line) Ni(this), this.curOp.scrollToPos = e;
			else {
				var i = ki(this, Math.min(e.from.left, e.to.left), Math.min(e.from.top, e.to.top) - e.margin, Math.max(e.from.right, e.to.right), Math.max(e.from.bottom, e.to.bottom) + e.margin);
				this.scrollTo(i.scrollLeft, i.scrollTop)
			}
		}),
		setSize: It(function(e, t) {
			function i(e) {
				return "number" == typeof e || /^\d+$/.test(String(e)) ? e + "px" : e
			}
			var n = this;
			null != e && (n.display.wrapper.style.width = i(e)), null != t && (n.display.wrapper.style.height = i(t)), n.options.lineWrapping && at(this);
			var a = n.display.viewFrom;
			n.doc.iter(a, n.display.viewTo, function(e) {
				if (e.widgets) for (var t = 0; t < e.widgets.length; t++) if (e.widgets[t].noHScroll) {
					Wt(n, a, "widget");
					break
				}++a
			}), n.curOp.forceUpdate = !0, Cr(n, "refresh", this)
		}),
		operation: function(e) {
			return Xt(this, e)
		},
		refresh: It(function() {
			var e = this.display.cachedTextHeight;
			Nt(this), this.curOp.forceUpdate = !0, ot(this), this.scrollTo(this.doc.scrollLeft, this.doc.scrollTop), d(this), (null == e || Math.abs(e - gt(this.display)) > .5) && o(this), Cr(this, "refresh", this)
		}),
		swapDoc: It(function(e) {
			var t = this.doc;
			return t.cm = null, Hn(this, e), ot(this), this.display.input.reset(), this.scrollTo(e.scrollLeft, e.scrollTop), this.curOp.forceScroll = !0, va(this, "swapDoc", this, t), t
		}),
		getInputField: function() {
			return this.display.input.getField()
		},
		getWrapperElement: function() {
			return this.display.wrapper
		},
		getScrollerElement: function() {
			return this.display.scroller
		},
		getGutterElement: function() {
			return this.display.gutters
		}
	}, ba(e);
	var Go = e.defaults = {},
		jo = e.optionHandlers = {},
		zo = e.Init = {
			toString: function() {
				return "CodeMirror.Init"
			}
		};
	Pi("value", "", function(e, t) {
		e.setValue(t)
	}, !0), Pi("mode", null, function(e, t) {
		e.doc.modeOption = t, i(e)
	}, !0), Pi("indentUnit", 2, i, !0), Pi("indentWithTabs", !1), Pi("smartIndent", !0), Pi("tabSize", 4, function(e) {
		n(e), ot(e), Nt(e)
	}, !0), Pi("specialChars", /[\t-­​-‏  ﻿]/g, function(t, i, n) {
		t.state.specialChars = new RegExp(i.source + (i.test("\t") ? "" : "|\t"), "g"), n != e.Init && t.refresh()
	}), Pi("specialCharPlaceholder", function(e) {
		var t = Ma("span", "•", "cm-invalidchar");
		return t.title = "\\u" + e.charCodeAt(0).toString(16), t.setAttribute("aria-label", t.title), t
	}, function(e) {
		e.refresh()
	}, !0), Pi("electricChars", !0), Pi("inputStyle", Fo ? "contenteditable" : "textarea", function() {
		throw new Error("inputStyle can not (yet) be changed in a running editor")
	}, !0), Pi("rtlMoveVisually", !Co), Pi("wholeLineUpdateBefore", !0), Pi("theme", "default", function(e) {
		r(e), s(e)
	}, !0), Pi("keyMap", "default", function(t, i, n) {
		var a = Ri(i),
			o = n != e.Init && Ri(n);
		o && o.detach && o.detach(t, a), a.attach && a.attach(t, o || null)
	}), Pi("extraKeys", null), Pi("lineWrapping", !1, function(e) {
		e.options.lineWrapping ? (Rr(e.display.wrapper, "CodeMirror-wrap"), e.display.sizer.style.minWidth = "", e.display.sizerWidth = null) : (Vr(e.display.wrapper, "CodeMirror-wrap"), c(e)), o(e), Nt(e), ot(e), setTimeout(function() {
			v(e)
		}, 100)
	}, !0), Pi("gutters", [], function(e) {
		f(e.options), s(e)
	}, !0), Pi("fixedGutter", !0, function(e, t) {
		e.display.gutters.style.left = t ? C(e.display) + "px" : "0", e.refresh()
	}, !0), Pi("coverGutterNextToScrollbar", !1, function(e) {
		v(e)
	}, !0), Pi("scrollbarStyle", "native", function(e) {
		g(e), v(e), e.display.scrollbars.setScrollTop(e.doc.scrollTop), e.display.scrollbars.setScrollLeft(e.doc.scrollLeft)
	}, !0), Pi("lineNumbers", !1, function(e) {
		f(e.options), s(e)
	}, !0), Pi("firstLineNumber", 1, s, !0), Pi("lineNumberFormatter", function(e) {
		return e
	}, s, !0), Pi("showCursorWhenSelecting", !1, Ae, !0), Pi("resetSelectionOnContextMenu", !0), Pi("lineWiseCopyCut", !0), Pi("readOnly", !1, function(e, t) {
		"nocursor" == t ? (fi(e), e.display.input.blur(), e.display.disabled = !0) : (e.display.disabled = !1, t || e.display.input.reset())
	}), Pi("disableInput", !1, function(e, t) {
		t || e.display.input.reset()
	}, !0), Pi("dragDrop", !0, function(t, i, n) {
		if (!i != !(n && n != e.Init)) {
			var a = t.display.dragFunctions,
				o = i ? Fr : br;
			o(t.display.scroller, "dragstart", a.start), o(t.display.scroller, "dragenter", a.simple), o(t.display.scroller, "dragover", a.simple), o(t.display.scroller, "drop", a.drop)
		}
	}), Pi("cursorBlinkRate", 530), Pi("cursorScrollMargin", 0), Pi("cursorHeight", 1, Ae, !0), Pi("singleCursorHeightPerLine", !0, Ae, !0), Pi("workTime", 100), Pi("workDelay", 100), Pi("flattenSpans", !0, n, !0), Pi("addModeClass", !1, n, !0), Pi("pollInterval", 100), Pi("undoDepth", 200, function(e, t) {
		e.doc.history.undoDepth = t
	}), Pi("historyEventDelay", 1250), Pi("viewportMargin", 10, function(e) {
		e.refresh()
	}, !0), Pi("maxHighlightLength", 1e4, n, !0), Pi("moveInputWithCursor", !0, function(e, t) {
		t || e.display.input.resetPosition()
	}), Pi("tabindex", null, function(e, t) {
		e.display.input.getField().tabIndex = t || ""
	}), Pi("autofocus", null);
	var Ko = e.modes = {},
		Yo = e.mimeModes = {};
	e.defineMode = function(t, i) {
		e.defaults.mode || "null" == t || (e.defaults.mode = t), arguments.length > 2 && (i.dependencies = Array.prototype.slice.call(arguments, 2)), Ko[t] = i
	}, e.defineMIME = function(e, t) {
		Yo[e] = t
	}, e.resolveMode = function(t) {
		if ("string" == typeof t && Yo.hasOwnProperty(t)) t = Yo[t];
		else if (t && "string" == typeof t.name && Yo.hasOwnProperty(t.name)) {
			var i = Yo[t.name];
			"string" == typeof i && (i = {
				name: i
			}), (t = ka(i, t)).name = i.name
		} else if ("string" == typeof t && /^[\w\-]+\/[\w\-]+\+xml$/.test(t)) return e.resolveMode("application/xml");
		return "string" == typeof t ? {
			name: t
		} : t || {
			name: "null"
		}
	}, e.getMode = function(t, i) {
		var i = e.resolveMode(i),
			n = Ko[i.name];
		if (!n) return e.getMode(t, "text/plain");
		var a = n(t, i);
		if (qo.hasOwnProperty(i.name)) {
			var o = qo[i.name];
			for (var r in o) o.hasOwnProperty(r) && (a.hasOwnProperty(r) && (a["_" + r] = a[r]), a[r] = o[r])
		}
		if (a.name = i.name, i.helperType && (a.helperType = i.helperType), i.modeProps) for (var r in i.modeProps) a[r] = i.modeProps[r];
		return a
	}, e.defineMode("null", function() {
		return {
			token: function(e) {
				e.skipToEnd()
			}
		}
	}), e.defineMIME("text/plain", "null");
	var qo = e.modeExtensions = {};
	e.extendMode = function(e, t) {
		La(t, qo.hasOwnProperty(e) ? qo[e] : qo[e] = {})
	}, e.defineExtension = function(t, i) {
		e.prototype[t] = i
	}, e.defineDocExtension = function(e, t) {
		mr.prototype[e] = t
	}, e.defineOption = Pi;
	var Qo = [];
	e.defineInitHook = function(e) {
		Qo.push(e)
	};
	var Jo = e.helpers = {};
	e.registerHelper = function(t, i, n) {
		Jo.hasOwnProperty(t) || (Jo[t] = e[t] = {
			_global: []
		}), Jo[t][i] = n
	}, e.registerGlobalHelper = function(t, i, n, a) {
		e.registerHelper(t, i, a), Jo[t]._global.push({
			pred: n,
			val: a
		})
	};
	var Zo = e.copyState = function(e, t) {
			if (!0 === t) return t;
			if (e.copyState) return e.copyState(t);
			var i = {};
			for (var n in t) {
				var a = t[n];
				a instanceof Array && (a = a.concat([])), i[n] = a
			}
			return i
		},
		er = e.startState = function(e, t, i) {
			return !e.startState || e.startState(t, i)
		};
	e.innerMode = function(e, t) {
		for (; e.innerMode;) {
			var i = e.innerMode(t);
			if (!i || i.mode == e) break;
			t = i.state, e = i.mode
		}
		return i || {
			mode: e,
			state: t
		}
	};
	var tr = e.commands = {
		selectAll: function(e) {
			e.setSelection(Io(e.firstLine(), 0), Io(e.lastLine()), Xr)
		},
		singleSelection: function(e) {
			e.setSelection(e.getCursor("anchor"), e.getCursor("head"), Xr)
		},
		killLine: function(e) {
			Mi(e, function(t) {
				if (t.empty()) {
					var i = Gn(e.doc, t.head.line).text.length;
					return t.head.ch == i && t.head.line < e.lastLine() ? {
						from: t.head,
						to: Io(t.head.line + 1, 0)
					} : {
						from: t.head,
						to: Io(t.head.line, i)
					}
				}
				return {
					from: t.from(),
					to: t.to()
				}
			})
		},
		deleteLine: function(e) {
			Mi(e, function(t) {
				return {
					from: Io(t.from().line, 0),
					to: me(e.doc, Io(t.to().line + 1, 0))
				}
			})
		},
		delLineLeft: function(e) {
			Mi(e, function(e) {
				return {
					from: Io(e.from().line, 0),
					to: e.from()
				}
			})
		},
		delWrappedLineLeft: function(e) {
			Mi(e, function(t) {
				var i = e.charCoords(t.head, "div").top + 5;
				return {
					from: e.coordsChar({
						left: 0,
						top: i
					}, "div"),
					to: t.from()
				}
			})
		},
		delWrappedLineRight: function(e) {
			Mi(e, function(t) {
				var i = e.charCoords(t.head, "div").top + 5,
					n = e.coordsChar({
						left: e.display.lineDiv.offsetWidth + 100,
						top: i
					}, "div");
				return {
					from: t.from(),
					to: n
				}
			})
		},
		undo: function(e) {
			e.undo()
		},
		redo: function(e) {
			e.redo()
		},
		undoSelection: function(e) {
			e.undoSelection()
		},
		redoSelection: function(e) {
			e.redoSelection()
		},
		goDocStart: function(e) {
			e.extendSelection(Io(e.firstLine(), 0))
		},
		goDocEnd: function(e) {
			e.extendSelection(Io(e.lastLine()))
		},
		goLineStart: function(e) {
			e.extendSelectionsBy(function(t) {
				return Za(e, t.head.line)
			}, {
				origin: "+move",
				bias: 1
			})
		},
		goLineStartSmart: function(e) {
			e.extendSelectionsBy(function(t) {
				return to(e, t.head)
			}, {
				origin: "+move",
				bias: 1
			})
		},
		goLineEnd: function(e) {
			e.extendSelectionsBy(function(t) {
				return eo(e, t.head.line)
			}, {
				origin: "+move",
				bias: -1
			})
		},
		goLineRight: function(e) {
			e.extendSelectionsBy(function(t) {
				var i = e.charCoords(t.head, "div").top + 5;
				return e.coordsChar({
					left: e.display.lineDiv.offsetWidth + 100,
					top: i
				}, "div")
			}, Ir)
		},
		goLineLeft: function(e) {
			e.extendSelectionsBy(function(t) {
				var i = e.charCoords(t.head, "div").top + 5;
				return e.coordsChar({
					left: 0,
					top: i
				}, "div")
			}, Ir)
		},
		goLineLeftSmart: function(e) {
			e.extendSelectionsBy(function(t) {
				var i = e.charCoords(t.head, "div").top + 5,
					n = e.coordsChar({
						left: 0,
						top: i
					}, "div");
				return n.ch < e.getLine(n.line).search(/\S/) ? to(e, t.head) : n
			}, Ir)
		},
		goLineUp: function(e) {
			e.moveV(-1, "line")
		},
		goLineDown: function(e) {
			e.moveV(1, "line")
		},
		goPageUp: function(e) {
			e.moveV(-1, "page")
		},
		goPageDown: function(e) {
			e.moveV(1, "page")
		},
		goCharLeft: function(e) {
			e.moveH(-1, "char")
		},
		goCharRight: function(e) {
			e.moveH(1, "char")
		},
		goColumnLeft: function(e) {
			e.moveH(-1, "column")
		},
		goColumnRight: function(e) {
			e.moveH(1, "column")
		},
		goWordLeft: function(e) {
			e.moveH(-1, "word")
		},
		goGroupRight: function(e) {
			e.moveH(1, "group")
		},
		goGroupLeft: function(e) {
			e.moveH(-1, "group")
		},
		goWordRight: function(e) {
			e.moveH(1, "word")
		},
		delCharBefore: function(e) {
			e.deleteH(-1, "char")
		},
		delCharAfter: function(e) {
			e.deleteH(1, "char")
		},
		delWordBefore: function(e) {
			e.deleteH(-1, "word")
		},
		delWordAfter: function(e) {
			e.deleteH(1, "word")
		},
		delGroupBefore: function(e) {
			e.deleteH(-1, "group")
		},
		delGroupAfter: function(e) {
			e.deleteH(1, "group")
		},
		indentAuto: function(e) {
			e.indentSelection("smart")
		},
		indentMore: function(e) {
			e.indentSelection("add")
		},
		indentLess: function(e) {
			e.indentSelection("subtract")
		},
		insertTab: function(e) {
			e.replaceSelection("\t")
		},
		insertSoftTab: function(e) {
			for (var t = [], i = e.listSelections(), n = e.options.tabSize, a = 0; a < i.length; a++) {
				var o = i[a].from(),
					r = kr(e.getLine(o.line), o.ch, n);
				t.push(new Array(n - r % n + 1).join(" "))
			}
			e.replaceSelections(t)
		},
		defaultTab: function(e) {
			e.somethingSelected() ? e.indentSelection("add") : e.execCommand("insertTab")
		},
		transposeChars: function(e) {
			Xt(e, function() {
				for (var t = e.listSelections(), i = [], n = 0; n < t.length; n++) {
					var a = t[n].head,
						o = Gn(e.doc, a.line).text;
					if (o) if (a.ch == o.length && (a = new Io(a.line, a.ch - 1)), a.ch > 0) a = new Io(a.line, a.ch + 1), e.replaceRange(o.charAt(a.ch - 1) + o.charAt(a.ch - 2), Io(a.line, a.ch - 2), a, "+transpose");
					else if (a.line > e.doc.first) {
						var r = Gn(e.doc, a.line - 1).text;
						r && e.replaceRange(o.charAt(0) + "\n" + r.charAt(r.length - 1), Io(a.line - 1, r.length - 1), Io(a.line, 1), "+transpose")
					}
					i.push(new ce(a, a))
				}
				e.setSelections(i)
			})
		},
		newlineAndIndent: function(e) {
			Xt(e, function() {
				for (var t = e.listSelections().length, i = 0; i < t; i++) {
					var n = e.listSelections()[i];
					e.replaceRange("\n", n.anchor, n.head, "+input"), e.indentLine(n.from().line + 1, null, !0), Ai(e)
				}
			})
		},
		toggleOverwrite: function(e) {
			e.toggleOverwrite()
		}
	},
		ir = e.keyMap = {};
	ir.basic = {
		Left: "goCharLeft",
		Right: "goCharRight",
		Up: "goLineUp",
		Down: "goLineDown",
		End: "goLineEnd",
		Home: "goLineStartSmart",
		PageUp: "goPageUp",
		PageDown: "goPageDown",
		Delete: "delCharAfter",
		Backspace: "delCharBefore",
		"Shift-Backspace": "delCharBefore",
		Tab: "defaultTab",
		"Shift-Tab": "indentAuto",
		Enter: "newlineAndIndent",
		Insert: "toggleOverwrite",
		Esc: "singleSelection"
	}, ir.pcDefault = {
		"Ctrl-A": "selectAll",
		"Ctrl-D": "deleteLine",
		"Ctrl-Z": "undo",
		"Shift-Ctrl-Z": "redo",
		"Ctrl-Y": "redo",
		"Ctrl-Home": "goDocStart",
		"Ctrl-End": "goDocEnd",
		"Ctrl-Up": "goLineUp",
		"Ctrl-Down": "goLineDown",
		"Ctrl-Left": "goGroupLeft",
		"Ctrl-Right": "goGroupRight",
		"Alt-Left": "goLineStart",
		"Alt-Right": "goLineEnd",
		"Ctrl-Backspace": "delGroupBefore",
		"Ctrl-Delete": "delGroupAfter",
		"Ctrl-S": "save",
		"Ctrl-F": "find",
		"Ctrl-G": "findNext",
		"Shift-Ctrl-G": "findPrev",
		"Shift-Ctrl-F": "replace",
		"Shift-Ctrl-R": "replaceAll",
		"Ctrl-[": "indentLess",
		"Ctrl-]": "indentMore",
		"Ctrl-U": "undoSelection",
		"Shift-Ctrl-U": "redoSelection",
		"Alt-U": "redoSelection",
		fallthrough: "basic"
	}, ir.emacsy = {
		"Ctrl-F": "goCharRight",
		"Ctrl-B": "goCharLeft",
		"Ctrl-P": "goLineUp",
		"Ctrl-N": "goLineDown",
		"Alt-F": "goWordRight",
		"Alt-B": "goWordLeft",
		"Ctrl-A": "goLineStart",
		"Ctrl-E": "goLineEnd",
		"Ctrl-V": "goPageDown",
		"Shift-Ctrl-V": "goPageUp",
		"Ctrl-D": "delCharAfter",
		"Ctrl-H": "delCharBefore",
		"Alt-D": "delWordAfter",
		"Alt-Backspace": "delWordBefore",
		"Ctrl-K": "killLine",
		"Ctrl-T": "transposeChars"
	}, ir.macDefault = {
		"Cmd-A": "selectAll",
		"Cmd-D": "deleteLine",
		"Cmd-Z": "undo",
		"Shift-Cmd-Z": "redo",
		"Cmd-Y": "redo",
		"Cmd-Home": "goDocStart",
		"Cmd-Up": "goDocStart",
		"Cmd-End": "goDocEnd",
		"Cmd-Down": "goDocEnd",
		"Alt-Left": "goGroupLeft",
		"Alt-Right": "goGroupRight",
		"Cmd-Left": "goLineLeft",
		"Cmd-Right": "goLineRight",
		"Alt-Backspace": "delGroupBefore",
		"Ctrl-Alt-Backspace": "delGroupAfter",
		"Alt-Delete": "delGroupAfter",
		"Cmd-S": "save",
		"Cmd-F": "find",
		"Cmd-G": "findNext",
		"Shift-Cmd-G": "findPrev",
		"Cmd-Alt-F": "replace",
		"Shift-Cmd-Alt-F": "replaceAll",
		"Cmd-[": "indentLess",
		"Cmd-]": "indentMore",
		"Cmd-Backspace": "delWrappedLineLeft",
		"Cmd-Delete": "delWrappedLineRight",
		"Cmd-U": "undoSelection",
		"Shift-Cmd-U": "redoSelection",
		"Ctrl-Up": "goDocStart",
		"Ctrl-Down": "goDocEnd",
		fallthrough: ["basic", "emacsy"]
	}, ir.
default = bo ? ir.macDefault:
	ir.pcDefault, e.normalizeKeyMap = function(e) {
		var t = {};
		for (var i in e) if (e.hasOwnProperty(i)) {
			var n = e[i];
			if (/^(name|fallthrough|(de|at)tach)$/.test(i)) continue;
			if ("..." == n) {
				delete e[i];
				continue
			}
			for (var a = Ea(i.split(" "), Vi), o = 0; o < a.length; o++) {
				var r, s;
				o == a.length - 1 ? (s = a.join(" "), r = n) : (s = a.slice(0, o + 1).join(" "), r = "...");
				var l = t[s];
				if (l) {
					if (l != r) throw new Error("Inconsistent bindings for " + s)
				} else t[s] = r
			}
			delete e[i]
		}
		for (var d in t) e[d] = t[d];
		return e
	};
	var nr = e.lookupKey = function(e, t, i, n) {
			var a = (t = Ri(t)).call ? t.call(e, n) : t[e];
			if (!1 === a) return "nothing";
			if ("..." === a) return "multi";
			if (null != a && i(a)) return "handled";
			if (t.fallthrough) {
				if ("[object Array]" != Object.prototype.toString.call(t.fallthrough)) return nr(e, t.fallthrough, i, n);
				for (var o = 0; o < t.fallthrough.length; o++) {
					var r = nr(e, t.fallthrough[o], i, n);
					if (r) return r
				}
			}
		},
		ar = e.isModifierKey = function(e) {
			var t = "string" == typeof e ? e : Kr[e.keyCode];
			return "Ctrl" == t || "Alt" == t || "Shift" == t || "Mod" == t
		},
		or = e.keyName = function(e, t) {
			if (go && 34 == e.keyCode && e.char) return !1;
			var i = Kr[e.keyCode],
				n = i;
			return null != n && !e.altGraphKey && (e.altKey && "Alt" != i && (n = "Alt-" + n), (To ? e.metaKey : e.ctrlKey) && "Ctrl" != i && (n = "Ctrl-" + n), (To ? e.ctrlKey : e.metaKey) && "Cmd" != i && (n = "Cmd-" + n), !t && e.shiftKey && "Shift" != i && (n = "Shift-" + n), n)
		};
	e.fromTextArea = function(t, i) {
		function n() {
			t.value = l.getValue()
		}
		if (i = i ? La(i) : {}, i.value = t.value, !i.tabindex && t.tabIndex && (i.tabindex = t.tabIndex), !i.placeholder && t.placeholder && (i.placeholder = t.placeholder), null == i.autofocus) {
			var a = Pa();
			i.autofocus = a == t || null != t.getAttribute("autofocus") && a == document.body
		}
		if (t.form && (Fr(t.form, "submit", n), !i.leaveSubmitMethodAlone)) {
			var o = t.form,
				r = o.submit;
			try {
				var s = o.submit = function() {
						n(), o.submit = r, o.submit(), o.submit = s
					}
			} catch (e) {}
		}
		i.finishInit = function(e) {
			e.save = n, e.getTextArea = function() {
				return t
			}, e.toTextArea = function() {
				e.toTextArea = isNaN, n(), t.parentNode.removeChild(e.getWrapperElement()), t.style.display = "", t.form && (br(t.form, "submit", n), "function" == typeof t.form.submit && (t.form.submit = r))
			}
		}, t.style.display = "none";
		var l = e(function(e) {
			t.parentNode.insertBefore(e, t.nextSibling)
		}, i);
		return l
	};
	var rr = e.StringStream = function(e, t) {
			this.pos = this.start = 0, this.string = e, this.tabSize = t || 8, this.lastColumnPos = this.lastColumnValue = 0, this.lineStart = 0
		};
	rr.prototype = {
		eol: function() {
			return this.pos >= this.string.length
		},
		sol: function() {
			return this.pos == this.lineStart
		},
		peek: function() {
			return this.string.charAt(this.pos) || void 0
		},
		next: function() {
			if (this.pos < this.string.length) return this.string.charAt(this.pos++)
		},
		eat: function(e) {
			var t = this.string.charAt(this.pos);
			if ("string" == typeof e) i = t == e;
			else var i = t && (e.test ? e.test(t) : e(t));
			if (i) return ++this.pos, t
		},
		eatWhile: function(e) {
			for (var t = this.pos; this.eat(e););
			return this.pos > t
		},
		eatSpace: function() {
			for (var e = this.pos;
			/[\s ]/.test(this.string.charAt(this.pos));)++this.pos;
			return this.pos > e
		},
		skipToEnd: function() {
			this.pos = this.string.length
		},
		skipTo: function(e) {
			var t = this.string.indexOf(e, this.pos);
			if (t > -1) return this.pos = t, !0
		},
		backUp: function(e) {
			this.pos -= e
		},
		column: function() {
			return this.lastColumnPos < this.start && (this.lastColumnValue = kr(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue - (this.lineStart ? kr(this.string, this.lineStart, this.tabSize) : 0)
		},
		indentation: function() {
			return kr(this.string, null, this.tabSize) - (this.lineStart ? kr(this.string, this.lineStart, this.tabSize) : 0)
		},
		match: function(e, t, i) {
			if ("string" != typeof e) {
				var n = this.string.slice(this.pos).match(e);
				return n && n.index > 0 ? null : (n && !1 !== t && (this.pos += n[0].length), n)
			}
			var a = function(e) {
					return i ? e.toLowerCase() : e
				};
			if (a(this.string.substr(this.pos, e.length)) == a(e)) return !1 !== t && (this.pos += e.length), !0
		},
		current: function() {
			return this.string.slice(this.start, this.pos)
		},
		hideFirstChars: function(e, t) {
			this.lineStart += e;
			try {
				return t()
			} finally {
				this.lineStart -= e
			}
		}
	};
	var sr = 0,
		lr = e.TextMarker = function(e, t) {
			this.lines = [], this.type = t, this.doc = e, this.id = ++sr
		};
	ba(lr), lr.prototype.clear = function() {
		if (!this.explicitlyCleared) {
			var e = this.doc.cm,
				t = e && !e.curOp;
			if (t && yt(e), Fa(this, "clear")) {
				var i = this.find();
				i && va(this, "clear", i.from, i.to)
			}
			for (var n = null, a = null, o = 0; o < this.lines.length; ++o) {
				var r = this.lines[o],
					s = Ki(r.markedSpans, this);
				e && !this.collapsed ? Wt(e, Yn(r), "text") : e && (null != s.to && (a = Yn(r)), null != s.from && (n = Yn(r))), r.markedSpans = Yi(r.markedSpans, s), null == s.from && this.collapsed && !vn(this.doc, r) && e && Kn(r, gt(e.display))
			}
			if (e && this.collapsed && !e.options.lineWrapping) for (o = 0; o < this.lines.length; ++o) {
				var l = hn(this.lines[o]),
					d = u(l);
				d > e.display.maxLineLength && (e.display.maxLine = l, e.display.maxLineLength = d, e.display.maxLineChanged = !0)
			}
			null != n && e && this.collapsed && Nt(e, n, a + 1), this.lines.length = 0, this.explicitlyCleared = !0, this.atomic && this.doc.cantEdit && (this.doc.cantEdit = !1, e && Ie(e.doc)), e && va(e, "markerCleared", e, this), t && xt(e), this.parent && this.parent.clear()
		}
	}, lr.prototype.find = function(e, t) {
		null == e && "bookmark" == this.type && (e = 1);
		for (var i, n, a = 0; a < this.lines.length; ++a) {
			var o = this.lines[a],
				r = Ki(o.markedSpans, this);
			if (null != r.from && (i = Io(t ? o : Yn(o), r.from), -1 == e)) return i;
			if (null != r.to && (n = Io(t ? o : Yn(o), r.to), 1 == e)) return n
		}
		return i && {
			from: i,
			to: n
		}
	}, lr.prototype.changed = function() {
		var e = this.find(-1, !0),
			t = this,
			i = this.doc.cm;
		e && i && Xt(i, function() {
			var n = e.line,
				a = Yn(e.line),
				o = Qe(i, a);
			if (o && (nt(o), i.curOp.selectionChanged = i.curOp.forceUpdate = !0), i.curOp.updateMaxLine = !0, !vn(t.doc, n) && null != t.height) {
				var r = t.height;
				t.height = null;
				var s = xn(t) - r;
				s && Kn(n, n.height + s)
			}
		})
	}, lr.prototype.attachLine = function(e) {
		if (!this.lines.length && this.doc.cm) {
			var t = this.doc.cm.curOp;
			t.maybeHiddenMarkers && -1 != Xa(t.maybeHiddenMarkers, this) || (t.maybeUnhiddenMarkers || (t.maybeUnhiddenMarkers = [])).push(this)
		}
		this.lines.push(e)
	}, lr.prototype.detachLine = function(e) {
		if (this.lines.splice(Xa(this.lines, e), 1), !this.lines.length && this.doc.cm) {
			var t = this.doc.cm.curOp;
			(t.maybeHiddenMarkers || (t.maybeHiddenMarkers = [])).push(this)
		}
	};
	var sr = 0,
		dr = e.SharedTextMarker = function(e, t) {
			this.markers = e, this.primary = t;
			for (var i = 0; i < e.length; ++i) e[i].parent = this
		};
	ba(dr), dr.prototype.clear = function() {
		if (!this.explicitlyCleared) {
			this.explicitlyCleared = !0;
			for (var e = 0; e < this.markers.length; ++e) this.markers[e].clear();
			va(this, "clear")
		}
	}, dr.prototype.find = function(e, t) {
		return this.primary.find(e, t)
	};
	var ur = e.LineWidget = function(e, t, i) {
			if (i) for (var n in i) i.hasOwnProperty(n) && (this[n] = i[n]);
			this.doc = e, this.node = t
		};
	ba(ur), ur.prototype.clear = function() {
		var e = this.doc.cm,
			t = this.line.widgets,
			i = this.line,
			n = Yn(i);
		if (null != n && t) {
			for (var a = 0; a < t.length; ++a) t[a] == this && t.splice(a--, 1);
			t.length || (i.widgets = null);
			var o = xn(this);
			Kn(i, Math.max(0, i.height - o)), e && Xt(e, function() {
				wn(e, i, -o), Wt(e, n, "widget")
			})
		}
	}, ur.prototype.changed = function() {
		var e = this.height,
			t = this.doc.cm,
			i = this.line;
		this.height = null;
		var n = xn(this) - e;
		n && (Kn(i, i.height + n), t && Xt(t, function() {
			t.curOp.forceUpdate = !0, wn(t, i, n)
		}))
	};
	var cr = e.Line = function(e, t, i) {
			this.text = e, on(this, t), this.height = i ? i(this) : 1
		};
	ba(cr), cr.prototype.lineNo = function() {
		return Yn(this)
	};
	var fr = {},
		hr = {};
	Rn.prototype = {
		chunkSize: function() {
			return this.lines.length
		},
		removeInner: function(e, t) {
			for (var i = e, n = e + t; i < n; ++i) {
				var a = this.lines[i];
				this.height -= a.height, Cn(a), va(a, "delete")
			}
			this.lines.splice(e, t)
		},
		collapse: function(e) {
			e.push.apply(e, this.lines)
		},
		insertInner: function(e, t, i) {
			this.height += i, this.lines = this.lines.slice(0, e).concat(t).concat(this.lines.slice(e));
			for (var n = 0; n < t.length; ++n) t[n].parent = this
		},
		iterN: function(e, t, i) {
			for (var n = e + t; e < n; ++e) if (i(this.lines[e])) return !0
		}
	}, $n.prototype = {
		chunkSize: function() {
			return this.size
		},
		removeInner: function(e, t) {
			this.size -= t;
			for (var i = 0; i < this.children.length; ++i) {
				var n = this.children[i],
					a = n.chunkSize();
				if (e < a) {
					var o = Math.min(t, a - e),
						r = n.height;
					if (n.removeInner(e, o), this.height -= r - n.height, a == o && (this.children.splice(i--, 1), n.parent = null), 0 == (t -= o)) break;
					e = 0
				} else e -= a
			}
			if (this.size - t < 25 && (this.children.length > 1 || !(this.children[0] instanceof Rn))) {
				var s = [];
				this.collapse(s), this.children = [new Rn(s)], this.children[0].parent = this
			}
		},
		collapse: function(e) {
			for (var t = 0; t < this.children.length; ++t) this.children[t].collapse(e)
		},
		insertInner: function(e, t, i) {
			this.size += t.length, this.height += i;
			for (var n = 0; n < this.children.length; ++n) {
				var a = this.children[n],
					o = a.chunkSize();
				if (e <= o) {
					if (a.insertInner(e, t, i), a.lines && a.lines.length > 50) {
						for (; a.lines.length > 50;) {
							var r = new Rn(a.lines.splice(a.lines.length - 25, 25));
							a.height -= r.height, this.children.splice(n + 1, 0, r), r.parent = this
						}
						this.maybeSpill()
					}
					break
				}
				e -= o
			}
		},
		maybeSpill: function() {
			if (!(this.children.length <= 10)) {
				var e = this;
				do {
					var t = new $n(e.children.splice(e.children.length - 5, 5));
					if (e.parent) {
						e.size -= t.size, e.height -= t.height;
						var i = Xa(e.parent.children, e);
						e.parent.children.splice(i + 1, 0, t)
					} else {
						var n = new $n(e.children);
						n.parent = e, e.children = [n, t], e = n
					}
					t.parent = e.parent
				} while (e.children.length > 10);
				e.parent.maybeSpill()
			}
		},
		iterN: function(e, t, i) {
			for (var n = 0; n < this.children.length; ++n) {
				var a = this.children[n],
					o = a.chunkSize();
				if (e < o) {
					var r = Math.min(t, o - e);
					if (a.iterN(e, r, i)) return !0;
					if (0 == (t -= r)) break;
					e = 0
				} else e -= o
			}
		}
	};
	var pr = 0,
		mr = e.Doc = function(e, t, i) {
			if (!(this instanceof mr)) return new mr(e, t, i);
			null == i && (i = 0), $n.call(this, [new Rn([new cr("", null)])]), this.first = i, this.scrollTop = this.scrollLeft = 0, this.cantEdit = !1, this.cleanGeneration = 1, this.frontier = i;
			var n = Io(i, 0);
			this.sel = he(n), this.history = new Zn(null), this.id = ++pr, this.modeOption = t, "string" == typeof e && (e = Hr(e)), Vn(this, {
				from: n,
				to: n,
				text: e
			}), Se(this, he(n), Xr)
		};
	mr.prototype = ka($n.prototype, {
		constructor: mr,
		iter: function(e, t, i) {
			i ? this.iterN(e - this.first, t - e, i) : this.iterN(this.first, this.first + this.size, e)
		},
		insert: function(e, t) {
			for (var i = 0, n = 0; n < t.length; ++n) i += t[n].height;
			this.insertInner(e - this.first, t, i)
		},
		remove: function(e, t) {
			this.removeInner(e - this.first, t)
		},
		getValue: function(e) {
			var t = zn(this, this.first, this.first + this.size);
			return !1 === e ? t : t.join(e || "\n")
		},
		setValue: kt(function(e) {
			var t = Io(this.first, 0),
				i = this.first + this.size - 1;
			xi(this, {
				from: t,
				to: Io(i, Gn(this, i).text.length),
				text: Hr(e),
				origin: "setValue",
				full: !0
			}, !0), Se(this, he(t))
		}),
		replaceRange: function(e, t, i, n) {
			Si(this, e, t = me(this, t), i = i ? me(this, i) : t, n)
		},
		getRange: function(e, t, i) {
			var n = jn(this, me(this, e), me(this, t));
			return !1 === i ? n : n.join(i || "\n")
		},
		getLine: function(e) {
			var t = this.getLineHandle(e);
			return t && t.text
		},
		getLineHandle: function(e) {
			if (ve(this, e)) return Gn(this, e)
		},
		getLineNumber: function(e) {
			return Yn(e)
		},
		getLineHandleVisualStart: function(e) {
			return "number" == typeof e && (e = Gn(this, e)), hn(e)
		},
		lineCount: function() {
			return this.size
		},
		firstLine: function() {
			return this.first
		},
		lastLine: function() {
			return this.first + this.size - 1
		},
		clipPos: function(e) {
			return me(this, e)
		},
		getCursor: function(e) {
			var t = this.sel.primary();
			return null == e || "head" == e ? t.head : "anchor" == e ? t.anchor : "end" == e || "to" == e || !1 === e ? t.to() : t.from()
		},
		listSelections: function() {
			return this.sel.ranges
		},
		somethingSelected: function() {
			return this.sel.somethingSelected()
		},
		setCursor: kt(function(e, t, i) {
			Ce(this, me(this, "number" == typeof e ? Io(e, t || 0) : e), null, i)
		}),
		setSelection: kt(function(e, t, i) {
			Ce(this, me(this, e), me(this, t || e), i)
		}),
		extendSelection: kt(function(e, t, i) {
			xe(this, me(this, e), t && me(this, t), i)
		}),
		extendSelections: kt(function(e, t) {
			Fe(this, ye(this, e))
		}),
		extendSelectionsBy: kt(function(e, t) {
			Fe(this, Ea(this.sel.ranges, e), t)
		}),
		setSelections: kt(function(e, t, i) {
			if (e.length) {
				for (var n = 0, a = []; n < e.length; n++) a[n] = new ce(me(this, e[n].anchor), me(this, e[n].head));
				null == t && (t = Math.min(e.length - 1, this.sel.primIndex)), Se(this, fe(a, t), i)
			}
		}),
		addSelection: kt(function(e, t, i) {
			var n = this.sel.ranges.slice(0);
			n.push(new ce(me(this, e), me(this, t || e))), Se(this, fe(n, n.length - 1), i)
		}),
		getSelection: function(e) {
			for (var t, i = this.sel.ranges, n = 0; n < i.length; n++) {
				var a = jn(this, i[n].from(), i[n].to());
				t = t ? t.concat(a) : a
			}
			return !1 === e ? t : t.join(e || "\n")
		},
		getSelections: function(e) {
			for (var t = [], i = this.sel.ranges, n = 0; n < i.length; n++) {
				var a = jn(this, i[n].from(), i[n].to());
				!1 !== e && (a = a.join(e || "\n")), t[n] = a
			}
			return t
		},
		replaceSelection: function(e, t, i) {
			for (var n = [], a = 0; a < this.sel.ranges.length; a++) n[a] = e;
			this.replaceSelections(n, t, i || "+input")
		},
		replaceSelections: kt(function(e, t, i) {
			for (var n = [], a = this.sel, o = 0; o < a.ranges.length; o++) {
				var r = a.ranges[o];
				n[o] = {
					from: r.from(),
					to: r.to(),
					text: Hr(e[o]),
					origin: i
				}
			}
			for (var s = t && "end" != t && yi(this, n, t), o = n.length - 1; o >= 0; o--) xi(this, n[o]);
			s ? Te(this, s) : this.cm && Ai(this.cm)
		}),
		undo: kt(function() {
			bi(this, "undo")
		}),
		redo: kt(function() {
			bi(this, "redo")
		}),
		undoSelection: kt(function() {
			bi(this, "undo", !0)
		}),
		redoSelection: kt(function() {
			bi(this, "redo", !0)
		}),
		setExtending: function(e) {
			this.extend = e
		},
		getExtending: function() {
			return this.extend
		},
		historySize: function() {
			for (var e = this.history, t = 0, i = 0, n = 0; n < e.done.length; n++) e.done[n].ranges || ++t;
			for (n = 0; n < e.undone.length; n++) e.undone[n].ranges || ++i;
			return {
				undo: t,
				redo: i
			}
		},
		clearHistory: function() {
			this.history = new Zn(this.history.maxGeneration)
		},
		markClean: function() {
			this.cleanGeneration = this.changeGeneration(!0)
		},
		changeGeneration: function(e) {
			return e && (this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null), this.history.generation
		},
		isClean: function(e) {
			return this.history.generation == (e || this.cleanGeneration)
		},
		getHistory: function() {
			return {
				done: ua(this.history.done),
				undone: ua(this.history.undone)
			}
		},
		setHistory: function(e) {
			var t = this.history = new Zn(this.history.maxGeneration);
			t.done = ua(e.done.slice(0), null, !0), t.undone = ua(e.undone.slice(0), null, !0)
		},
		addLineClass: kt(function(e, t, i) {
			return Oi(this, e, "gutter" == t ? "gutter" : "class", function(e) {
				var n = "text" == t ? "textClass" : "background" == t ? "bgClass" : "gutter" == t ? "gutterClass" : "wrapClass";
				if (e[n]) {
					if (Va(i).test(e[n])) return !1;
					e[n] += " " + i
				} else e[n] = i;
				return !0
			})
		}),
		removeLineClass: kt(function(e, t, i) {
			return Oi(this, e, "gutter" == t ? "gutter" : "class", function(e) {
				var n = "text" == t ? "textClass" : "background" == t ? "bgClass" : "gutter" == t ? "gutterClass" : "wrapClass",
					a = e[n];
				if (!a) return !1;
				if (null == i) e[n] = null;
				else {
					var o = a.match(Va(i));
					if (!o) return !1;
					var r = o.index + o[0].length;
					e[n] = a.slice(0, o.index) + (o.index && r != a.length ? " " : "") + a.slice(r) || null
				}
				return !0
			})
		}),
		addLineWidget: kt(function(e, t, i) {
			return Fn(this, e, t, i)
		}),
		removeLineWidget: function(e) {
			e.clear()
		},
		markText: function(e, t, i) {
			return $i(this, me(this, e), me(this, t), i, "range")
		},
		setBookmark: function(e, t) {
			var i = {
				replacedWith: t && (null == t.nodeType ? t.widget : t),
				insertLeft: t && t.insertLeft,
				clearWhenEmpty: !1,
				shared: t && t.shared,
				handleMouseEvents: t && t.handleMouseEvents
			};
			return e = me(this, e), $i(this, e, e, i, "bookmark")
		},
		findMarksAt: function(e) {
			var t = [],
				i = Gn(this, (e = me(this, e)).line).markedSpans;
			if (i) for (var n = 0; n < i.length; ++n) {
				var a = i[n];
				(null == a.from || a.from <= e.ch) && (null == a.to || a.to >= e.ch) && t.push(a.marker.parent || a.marker)
			}
			return t
		},
		findMarks: function(e, t, i) {
			e = me(this, e), t = me(this, t);
			var n = [],
				a = e.line;
			return this.iter(e.line, t.line + 1, function(o) {
				var r = o.markedSpans;
				if (r) for (var s = 0; s < r.length; s++) {
					var l = r[s];
					a == e.line && e.ch > l.to || null == l.from && a != e.line || a == t.line && l.from > t.ch || i && !i(l.marker) || n.push(l.marker.parent || l.marker)
				}++a
			}), n
		},
		getAllMarks: function() {
			var e = [];
			return this.iter(function(t) {
				var i = t.markedSpans;
				if (i) for (var n = 0; n < i.length; ++n) null != i[n].from && e.push(i[n].marker)
			}), e
		},
		posFromIndex: function(e) {
			var t, i = this.first;
			return this.iter(function(n) {
				var a = n.text.length + 1;
				if (a > e) return t = e, !0;
				e -= a, ++i
			}), me(this, Io(i, t))
		},
		indexFromPos: function(e) {
			var t = (e = me(this, e)).ch;
			return e.line < this.first || e.ch < 0 ? 0 : (this.iter(this.first, e.line, function(e) {
				t += e.text.length + 1
			}), t)
		},
		copy: function(e) {
			var t = new mr(zn(this, this.first, this.first + this.size), this.modeOption, this.first);
			return t.scrollTop = this.scrollTop, t.scrollLeft = this.scrollLeft, t.sel = this.sel, t.extend = !1, e && (t.history.undoDepth = this.history.undoDepth, t.setHistory(this.getHistory())), t
		},
		linkedDoc: function(e) {
			e || (e = {});
			var t = this.first,
				i = this.first + this.size;
			null != e.from && e.from > t && (t = e.from), null != e.to && e.to < i && (i = e.to);
			var n = new mr(zn(this, t, i), e.mode || this.modeOption, t);
			return e.sharedHist && (n.history = this.history), (this.linked || (this.linked = [])).push({
				doc: n,
				sharedHist: e.sharedHist
			}), n.linked = [{
				doc: this,
				isParent: !0,
				sharedHist: e.sharedHist
			}], Gi(n, Hi(this)), n
		},
		unlinkDoc: function(t) {
			if (t instanceof e && (t = t.doc), this.linked) for (var i = 0; i < this.linked.length; ++i) if (this.linked[i].doc == t) {
				this.linked.splice(i, 1), t.unlinkDoc(this), ji(Hi(this));
				break
			}
			if (t.history == this.history) {
				var n = [t.id];
				Bn(t, function(e) {
					n.push(e.id)
				}, !0), t.history = new Zn(null), t.history.done = ua(this.history.done, n), t.history.undone = ua(this.history.undone, n)
			}
		},
		iterLinkedDocs: function(e) {
			Bn(this, e)
		},
		getMode: function() {
			return this.mode
		},
		getEditor: function() {
			return this.cm
		}
	}), mr.prototype.eachLine = mr.prototype.iter;
	var gr = "iter insert remove copy getEditor constructor".split(" ");
	for (var vr in mr.prototype) mr.prototype.hasOwnProperty(vr) && Xa(gr, vr) < 0 && (e.prototype[vr] = function(e) {
		return function() {
			return e.apply(this.doc, arguments)
		}
	}(mr.prototype[vr]));
	ba(mr);
	var yr = e.e_preventDefault = function(e) {
			e.preventDefault ? e.preventDefault() : e.returnValue = !1
		},
		wr = e.e_stopPropagation = function(e) {
			e.stopPropagation ? e.stopPropagation() : e.cancelBubble = !0
		},
		xr = e.e_stop = function(e) {
			yr(e), wr(e)
		},
		Fr = e.on = function(e, t, i) {
			if (e.addEventListener) e.addEventListener(t, i, !1);
			else if (e.attachEvent) e.attachEvent("on" + t, i);
			else {
				var n = e._handlers || (e._handlers = {});
				(n[t] || (n[t] = [])).push(i)
			}
		},
		br = e.off = function(e, t, i) {
			if (e.removeEventListener) e.removeEventListener(t, i, !1);
			else if (e.detachEvent) e.detachEvent("on" + t, i);
			else {
				var n = e._handlers && e._handlers[t];
				if (!n) return;
				for (var a = 0; a < n.length; ++a) if (n[a] == i) {
					n.splice(a, 1);
					break
				}
			}
		},
		Cr = e.signal = function(e, t) {
			var i = e._handlers && e._handlers[t];
			if (i) for (var n = Array.prototype.slice.call(arguments, 2), a = 0; a < i.length; ++a) i[a].apply(null, n)
		},
		_r = null,
		Tr = 30,
		Sr = e.Pass = {
			toString: function() {
				return "CodeMirror.Pass"
			}
		},
		Xr = {
			scroll: !1
		},
		Er = {
			origin: "*mouse"
		},
		Ir = {
			origin: "+move"
		};
	Ca.prototype.set = function(e, t) {
		clearTimeout(this.id), this.id = setTimeout(t, e)
	};
	var kr = e.countColumn = function(e, t, i, n, a) {
			null == t && -1 == (t = e.search(/[^\s ]/)) && (t = e.length);
			for (var o = n || 0, r = a || 0;;) {
				var s = e.indexOf("\t", o);
				if (s < 0 || s >= t) return r + (t - o);
				r += s - o, r += i - r % i, o = s + 1
			}
		},
		Lr = [""],
		Ar = function(e) {
			e.select()
		};
	xo ? Ar = function(e) {
		e.selectionStart = 0, e.selectionEnd = e.value.length
	} : co && (Ar = function(e) {
		try {
			e.select()
		} catch (e) {}
	});
	var Nr, Wr = /[ßև֐-״؀-ۿ぀-ゟ゠-ヿ㐀-䶵一-鿌가-힯]/,
		Or = e.isWordChar = function(e) {
			return /\w/.test(e) || e > "" && (e.toUpperCase() != e.toLowerCase() || Wr.test(e))
		},
		Mr = /[̀-ͯ҃-҉֑-ׇֽֿׁׂׅׄؐ-ًؚ-ٰٞۖ-ۜ۞-۪ۤۧۨ-ܑۭܰ-݊ަ-ް߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࠭ऀ-ं़ु-ै्॑-ॕॢॣঁ়াু-ৄ্ৗৢৣਁਂ਼ੁੂੇੈੋ-੍ੑੰੱੵઁં઼ુ-ૅેૈ્ૢૣଁ଼ାିୁ-ୄ୍ୖୗୢୣஂாீ்ௗా-ీె-ైొ-్ౕౖౢౣ಼ಿೂೆೌ್ೕೖೢೣാു-ൄ്ൗൢൣ්ාි-ුූෟัิ-ฺ็-๎ັິ-ູົຼ່-ໍཱ༹༘༙༵༷-ཾྀ-྄྆྇ྐ-ྗྙ-ྼ࿆ိ-ူဲ-့္်ွှၘၙၞ-ၠၱ-ၴႂႅႆႍႝ፟ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳិ-ួំ៉-៓៝᠋-᠍ᢩᤠ-ᤢᤧᤨᤲ᤹-᤻ᨘᨗᩖᩘ-ᩞ᩠ᩢᩥ-ᩬᩳ-᩿᩼ᬀ-ᬃ᬴ᬶ-ᬺᬼᭂ᭫-᭳ᮀᮁᮢ-ᮥᮨᮩᰬ-ᰳᰶ᰷᳐-᳔᳒-᳢᳠-᳨᳭᷀-᷽ᷦ-᷿‌‍⃐-⃰⳯-⳱ⷠ-〪ⷿ-゙゚〯꙯-꙲꙼꙽꛰꛱ꠂ꠆ꠋꠥꠦ꣄꣠-꣱ꤦ-꤭ꥇ-ꥑꦀ-ꦂ꦳ꦶ-ꦹꦼꨩ-ꨮꨱꨲꨵꨶꩃꩌꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꯥꯨ꯭�-�ﬞ︀-️︠-︦ﾞﾟ]/;
	Nr = document.createRange ?
	function(e, t, i, n) {
		var a = document.createRange();
		return a.setEnd(n || e, i), a.setStart(e, t), a
	} : function(e, t, i) {
		var n = document.body.createTextRange();
		try {
			n.moveToElementText(e.parentNode)
		} catch (e) {
			return n
		}
		return n.collapse(!0), n.moveEnd("character", i), n.moveStart("character", t), n
	};
	var Dr = e.contains = function(e, t) {
			if (3 == t.nodeType && (t = t.parentNode), e.contains) return e.contains(t);
			do {
				if (11 == t.nodeType && (t = t.host), t == e) return !0
			} while (t = t.parentNode)
		};
	co && fo < 11 && (Pa = function() {
		try {
			return document.activeElement
		} catch (e) {
			return document.body
		}
	});
	var Ur, Pr, Vr = e.rmClass = function(e, t) {
			var i = e.className,
				n = Va(t).exec(i);
			if (n) {
				var a = i.slice(n.index + n[0].length);
				e.className = i.slice(0, n.index) + (a ? n[1] + a : "")
			}
		},
		Rr = e.addClass = function(e, t) {
			var i = e.className;
			Va(t).test(i) || (e.className += (i ? " " : "") + t)
		},
		$r = !1,
		Br = function() {
			if (co && fo < 9) return !1;
			var e = Ma("div");
			return "draggable" in e || "dragDrop" in e
		}(),
		Hr = e.splitLines = 3 != "\n\nb".split(/\n/).length ?
	function(e) {
		for (var t = 0, i = [], n = e.length; t <= n;) {
			var a = e.indexOf("\n", t); - 1 == a && (a = e.length);
			var o = e.slice(t, "\r" == e.charAt(a - 1) ? a - 1 : a),
				r = o.indexOf("\r"); - 1 != r ? (i.push(o.slice(0, r)), t += r + 1) : (i.push(o), t = a + 1)
		}
		return i
	} : function(e) {
		return e.split(/\r\n?|\n/)
	}, Gr = window.getSelection ?
	function(e) {
		try {
			return e.selectionStart != e.selectionEnd
		} catch (e) {
			return !1
		}
	} : function(e) {
		try {
			var t = e.ownerDocument.selection.createRange()
		} catch (e) {}
		return !(!t || t.parentElement() != e) && 0 != t.compareEndPoints("StartToEnd", t)
	}, jr = function() {
		var e = Ma("div");
		return "oncopy" in e || (e.setAttribute("oncopy", "return;"), "function" == typeof e.oncopy)
	}(), zr = null, Kr = {
		3: "Enter",
		8: "Backspace",
		9: "Tab",
		13: "Enter",
		16: "Shift",
		17: "Ctrl",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Esc",
		32: "Space",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "Left",
		38: "Up",
		39: "Right",
		40: "Down",
		44: "PrintScrn",
		45: "Insert",
		46: "Delete",
		59: ";",
		61: "=",
		91: "Mod",
		92: "Mod",
		93: "Mod",
		107: "=",
		109: "-",
		127: "Delete",
		173: "-",
		186: ";",
		187: "=",
		188: ",",
		189: "-",
		190: ".",
		191: "/",
		192: "`",
		219: "[",
		220: "\\",
		221: "]",
		222: "'",
		63232: "Up",
		63233: "Down",
		63234: "Left",
		63235: "Right",
		63272: "Delete",
		63273: "Home",
		63275: "End",
		63276: "PageUp",
		63277: "PageDown",
		63302: "Insert"
	};
	e.keyNames = Kr, function() {
		for (e = 0; e < 10; e++) Kr[e + 48] = Kr[e + 96] = String(e);
		for (e = 65; e <= 90; e++) Kr[e] = String.fromCharCode(e);
		for (var e = 1; e <= 12; e++) Kr[e + 111] = Kr[e + 63235] = "F" + e
	}();
	var Yr, qr = function() {
			function e(e) {
				return e <= 247 ? i.charAt(e) : 1424 <= e && e <= 1524 ? "R" : 1536 <= e && e <= 1773 ? n.charAt(e - 1536) : 1774 <= e && e <= 2220 ? "r" : 8192 <= e && e <= 8203 ? "w" : 8204 == e ? "b" : "L"
			}
			function t(e, t, i) {
				this.level = e, this.from = t, this.to = i
			}
			var i = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN",
				n = "rrrrrrrrrrrr,rNNmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmrrrrrrrnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmNmmmm",
				a = /[֐-״؀-ۿ܀-ࢬ]/,
				o = /[stwN]/,
				r = /[LRr]/,
				s = /[Lb1n]/,
				l = /[1n]/;
			return function(i) {
				if (!a.test(i)) return !1;
				for (var n = i.length, d = [], u = 0; u < n; ++u) d.push(m = e(i.charCodeAt(u)));
				for (var u = 0, c = "L"; u < n; ++u)"m" == (m = d[u]) ? d[u] = c : c = m;
				for (var u = 0, f = "L"; u < n; ++u)"1" == (m = d[u]) && "r" == f ? d[u] = "n" : r.test(m) && (f = m, "r" == m && (d[u] = "R"));
				for (var u = 1, c = d[0]; u < n - 1; ++u)"+" == (m = d[u]) && "1" == c && "1" == d[u + 1] ? d[u] = "1" : "," != m || c != d[u + 1] || "1" != c && "n" != c || (d[u] = c), c = m;
				for (u = 0; u < n; ++u) if ("," == (m = d[u])) d[u] = "N";
				else if ("%" == m) {
					for (g = u + 1; g < n && "%" == d[g]; ++g);
					for (var h = u && "!" == d[u - 1] || g < n && "1" == d[g] ? "1" : "N", p = u; p < g; ++p) d[p] = h;
					u = g - 1
				}
				for (var u = 0, f = "L"; u < n; ++u) {
					var m = d[u];
					"L" == f && "1" == m ? d[u] = "L" : r.test(m) && (f = m)
				}
				for (u = 0; u < n; ++u) if (o.test(d[u])) {
					for (var g = u + 1; g < n && o.test(d[g]); ++g);
					for (var v = "L" == (u ? d[u - 1] : "L"), y = "L" == (g < n ? d[g] : "L"), h = v || y ? "L" : "R", p = u; p < g; ++p) d[p] = h;
					u = g - 1
				}
				for (var w, x = [], u = 0; u < n;) if (s.test(d[u])) {
					var F = u;
					for (++u; u < n && s.test(d[u]); ++u);
					x.push(new t(0, F, u))
				} else {
					var b = u,
						C = x.length;
					for (++u; u < n && "L" != d[u]; ++u);
					for (p = b; p < u;) if (l.test(d[p])) {
						b < p && x.splice(C, 0, new t(1, b, p));
						var _ = p;
						for (++p; p < u && l.test(d[p]); ++p);
						x.splice(C, 0, new t(2, _, p)), b = p
					} else++p;
					b < u && x.splice(C, 0, new t(1, b, u))
				}
				return 1 == x[0].level && (w = i.match(/^\s+/)) && (x[0].from = w[0].length, x.unshift(new t(0, 0, w[0].length))), 1 == Sa(x).level && (w = i.match(/\s+$/)) && (Sa(x).to -= w[0].length, x.push(new t(0, n - w[0].length, n))), 2 == x[0].level && x.unshift(new t(1, x[0].to, x[0].to)), x[0].level != Sa(x).level && x.push(new t(x[0].level, n, n)), x
			}
		}();
	return e.version = "5.4.1", e
}), function(e) {
	FX.FormulaEditor = FX.extend(FX.Widget, {
		CONST: {
			NAME_FILED_CLS: "cm-field-name",
			VALUE_FIELD_CLS: "cm-field-value",
			INVALID_FIELD_CLS: "cm-field-invalid",
			DEPRECATE_FIELD_CLS: "cm-deprecate",
			NEGATIVE_FIELD_CLS: "cm-negative",
			FIELD_REG: /^\$(_widget_|_formula_|ext|createTime|updateTime|creator)/
		},
		_defaultConfig: function() {
			return e.extend(FX.FormulaEditor.superclass._defaultConfig.apply(), {
				baseCls: "x-formula-editor",
				keywords: [],
				text: i18next.t("formula"),
				hasFunction: !0,
				textField: "text",
				labelMap: null
			})
		},
		_init: function() {
			FX.FormulaEditor.superclass._init.apply(this, arguments);
			var t = this.options;
			this.element.append(e('<div class="formula-head"/>').append(e('<span class="formula-name"/>').text(t.text)).append(e('<span class="formula-equal"/>').text("="))), this.editor = CodeMirror(this.element[0], {
				keywords: t.keywords,
				textWrapping: !0,
				lineWrapping: !0,
				lineNumbers: !1,
				matchBrackets: {
					maxScanLines: 2e3,
					maxHighlightLineLength: 2e3
				},
				specialChars: /[-­‌-‏  ﻿]/,
				mode: "formula"
			}), this.editor.on("change", function(e, t) {
				CodeMirror.showHint(e, CodeMirror.formulaHint, {
					completeSingle: !1
				})
			})
		},
		_markField: function(t) {
			var i = "",
				n = {
					"data-field": t.field
				};
			t.invalid ? i = this.CONST.INVALID_FIELD_CLS : t.entry ? (i = this.CONST.NAME_FILED_CLS, n["data-entry"] = t.entry) : i = this.CONST.VALUE_FIELD_CLS, e(this.editor.markText(t.from, t.to, {
				handleMouseEvents: !0,
				atomic: !0,
				replacedWith: e('<span class="cm-field ' + i + '"/>').text(t.label)[0]
			}).widgetNode).attr(n).addClass(i)
		},
		insertFormula: function(e) {
			e = e && e.toUpperCase();
			var t = !1;
			if (FX.Utils.forEach(this.options.keywords, function(i, n) {
				if (e === n) return t = !0, !1
			}), t) {
				this.editor.focus();
				var i = this.editor.getCursor();
				this.editor.replaceSelection(e + "()"), this.editor.setCursor({
					line: i.line,
					ch: i.ch + e.length + 1
				})
			}
		},
		insertField: function(e, t) {
			var i = this.options,
				n = this.editor.getCursor();
			this.editor.replaceSelection(e[i.textField]);
			var a = {
				from: n,
				to: this.editor.getCursor(),
				field: e.name,
				entry: t ? e.id : null,
				label: e[i.textField]
			};
			this._markField(a), this.editor.focus()
		},
		checkValidate: function() {
			var t = e(this.editor.display.lineDiv);
			return t.find("span." + this.CONST.DEPRECATE_FIELD_CLS).length > 0 ? (this.setInvalidateType("deprecated field"), !1) : t.find("span." + this.CONST.INVALID_FIELD_CLS).length > 0 ? (this.setInvalidateType("invalid field"), !1) : (this.setInvalidateType(null), !0)
		},
		getValue: function() {
			var t = [],
				i = this.CONST,
				n = [],
				a = e(this.editor.display.lineDiv).find(".CodeMirror-line-content");
			return FX.Utils.forEach(a, function(a, o) {
				var r = [];
				FX.Utils.forEach(e(o).children("span"), function(t, a) {
					var o = e(a).attr("data-field"),
						s = e(a).attr("data-entry");
					if (e(a).hasClass(i.NAME_FILED_CLS)) r.push("$" + o + "#" + s);
					else if (e(a).hasClass(i.VALUE_FIELD_CLS)) r.push("$" + o + "#"), -1 === n.indexOf(o) && n.push(o);
					else {
						if (e(a).hasClass(i.DEPRECATE_FIELD_CLS) || e(a).hasClass(i.INVALID_FIELD_CLS) || e(a).hasClass(i.NEGATIVE_FIELD_CLS)) return;
						r.push(e(a).text())
					}
				});
				var s = r.join("").replace(/​/g, "").replace(/ /g, " ");
				t.push(s)
			}), {
				formula: t.join("\n"),
				relyWidgets: n
			}
		},
		setValue: function(e) {
			var t = this,
				i = this.options,
				n = [],
				a = [];
			if (e) {
				var o = e.split("\n");
				FX.Utils.forEach(o, function(e, o) {
					var r = "",
						s = o.split(/(\$[0-9a-zA-Z\._#@]+)/g);
					FX.Utils.forEach(s, function(n, o) {
						if (t.CONST.FIELD_REG.test(o)) {
							var s;
							FX.Utils.startWith(o, "$ext") ? s = i18next.t("field.ext") : i.labelMap && (s = i.labelMap[o]);
							var l = !1;
							FX.Utils.isNull(s) && (s = i18next.t("field.invalid"), l = !0);
							var d = o.replace("$", "").split("#"),
								u = d[0],
								c = d[1],
								f = CodeMirror.Pos(e, r.length);
							r += s;
							var h = CodeMirror.Pos(e, r.length);
							a.push({
								from: f,
								to: h,
								field: u,
								entry: c,
								invalid: l,
								label: s
							})
						} else r += o
					}), n.push(r)
				})
			}
			this.editor.setValue(n.join("\n")), FX.Utils.forEach(a, function(e, i) {
				t._markField(i)
			})
		}
	}), e.shortcut("formulaeditor", FX.FormulaEditor)
}(jQuery), function(e) {
	(function(e) {
		"use strict";
		var t = "CodeMirror-hint";
		var i = "CodeMirror-hint-active";
		e.showHint = function(e, t, i) {
			if (!t) return e.showHint(i);
			if (i && i.async) t.async = true;
			var n = {
				hint: t
			};
			if (i) for (var a in i) n[a] = i[a];
			return e.showHint(n)
		};
		e.defineExtension("showHint", function(t) {
			if (this.listSelections().length > 1 || this.somethingSelected()) return;
			if (this.state.completionActive) this.state.completionActive.close();
			var i = this.state.completionActive = new n(this, t);
			if (!i.options.hint) return;
			e.signal(this, "startCompletion", this);
			i.update(true)
		});

		function n(e, t) {
			this.cm = e;
			this.options = this.buildOptions(t);
			this.widget = null;
			this.debounce = 0;
			this.tick = 0;
			this.startPos = this.cm.getCursor();
			this.startLen = this.cm.getLine(this.startPos.line).length;
			var i = this;
			e.on("cursorActivity", this.activityFunc = function() {
				i.cursorActivity()
			})
		}
		var a = window.requestAnimationFrame ||
		function(e) {
			return setTimeout(e, 1e3 / 60)
		};
		var o = window.cancelAnimationFrame || clearTimeout;
		n.prototype = {
			close: function() {
				if (!this.active()) return;
				this.cm.state.completionActive = null;
				this.tick = null;
				this.cm.off("cursorActivity", this.activityFunc);
				if (this.widget && this.data) e.signal(this.data, "close");
				if (this.widget) this.widget.close();
				e.signal(this.cm, "endCompletion", this.cm)
			},
			active: function() {
				return this.cm.state.completionActive == this
			},
			pick: function(t, i) {
				var n = t.list[i];
				if (n.hint) n.hint(this.cm, t, n);
				else this.cm.replaceRange(r(n + "()"), n.from || t.from, n.to || t.to, "complete");
				var a = this.cm.getCursor();
				a.ch = a.ch - 1;
				this.cm.setCursor(a);
				e.signal(t, "pick", n);
				this.close()
			},
			cursorActivity: function() {
				if (this.debounce) {
					o(this.debounce);
					this.debounce = 0
				}
				var e = this.cm.getCursor(),
					t = this.cm.getLine(e.line);
				if (e.line != this.startPos.line || t.length - e.ch != this.startLen - this.startPos.ch || e.ch < this.startPos.ch || this.cm.somethingSelected() || e.ch && this.options.closeCharacters.test(t.charAt(e.ch - 1))) {
					this.close()
				} else {
					var i = this;
					this.debounce = a(function() {
						i.update()
					});
					if (this.widget) this.widget.disable()
				}
			},
			update: function(t) {
				if (this.tick == null) return;
				if (this.data) e.signal(this.data, "update");
				if (!this.options.hint.async) {
					this.finishUpdate(this.options.hint(this.cm, this.options), t)
				} else {
					var i = ++this.tick,
						n = this;
					this.options.hint(this.cm, function(e) {
						if (n.tick == i) n.finishUpdate(e, t)
					}, this.options)
				}
			},
			finishUpdate: function(t, i) {
				this.data = t;
				var n = this.widget && this.widget.picked || i && this.options.completeSingle;
				if (this.widget) this.widget.close();
				if (t && t.list.length) {
					if (n && t.list.length == 1) {
						this.pick(t, 0)
					} else {
						this.widget = new d(this, t);
						e.signal(t, "shown")
					}
				}
			},
			buildOptions: function(e) {
				var t = this.cm.options.hintOptions;
				var i = {};
				for (var n in u) i[n] = u[n];
				if (t) for (var n in t) if (t[n] !== undefined) i[n] = t[n];
				if (e) for (var n in e) if (e[n] !== undefined) i[n] = e[n];
				return i
			}
		};

		function r(e) {
			if (typeof e == "string") return e;
			else return e.text
		}
		function s(e, t) {
			var i = {
				Up: function() {
					t.moveFocus(-1)
				},
				Down: function() {
					t.moveFocus(1)
				},
				PageUp: function() {
					t.moveFocus(-t.menuSize() + 1, true)
				},
				PageDown: function() {
					t.moveFocus(t.menuSize() - 1, true)
				},
				Home: function() {
					t.setFocus(0)
				},
				End: function() {
					t.setFocus(t.length - 1)
				},
				Enter: t.pick,
				Tab: t.pick,
				Esc: t.close
			};
			var n = e.options.customKeys;
			var a = n ? {} : i;

			function o(e, n) {
				var o;
				if (typeof n != "string") o = function(e) {
					return n(e, t)
				};
				else if (i.hasOwnProperty(n)) o = i[n];
				else o = n;
				a[e] = o
			}
			if (n) for (var r in n) if (n.hasOwnProperty(r)) o(r, n[r]);
			var s = e.options.extraKeys;
			if (s) for (var r in s) if (s.hasOwnProperty(r)) o(r, s[r]);
			return a
		}
		function l(e, t) {
			while (t && t != e) {
				if (t.nodeName.toUpperCase() === "LI" && t.parentNode == e) return t;
				t = t.parentNode
			}
		}
		function d(n, a) {
			this.completion = n;
			this.data = a;
			this.picked = false;
			var o = this,
				d = n.cm;
			var u = this.hints = document.createElement("ul");
			u.className = "CodeMirror-hints";
			this.selectedHint = a.selectedHint || 0;
			var c = a.list;
			for (var f = 0; f < c.length; ++f) {
				var h = u.appendChild(document.createElement("li")),
					p = c[f];
				var m = t + (f != this.selectedHint ? "" : " " + i);
				if (p.className != null) m = p.className + " " + m;
				h.className = m;
				if (p.render) p.render(h, a, p);
				else h.appendChild(document.createTextNode(p.displayText || r(p)));
				h.hintId = f
			}
			var g = d.cursorCoords(n.options.alignWithWord ? a.from : null);
			var v = g.left,
				y = g.bottom,
				w = true;
			u.style.left = v + "px";
			u.style.top = y + "px";
			var x = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth);
			var F = window.innerHeight || Math.max(document.body.offsetHeight, document.documentElement.offsetHeight);
			(n.options.container || document.body).appendChild(u);
			var b = u.getBoundingClientRect(),
				C = b.bottom - F;
			if (C > 0) {
				var _ = b.bottom - b.top,
					T = g.top - (g.bottom - b.top);
				if (T - _ > 0) {
					u.style.top = (y = g.top - _) + "px";
					w = false
				} else if (_ > F) {
					u.style.height = F - 5 + "px";
					u.style.top = (y = g.bottom - b.top) + "px";
					var S = d.getCursor();
					if (a.from.ch != S.ch) {
						g = d.cursorCoords(S);
						u.style.left = (v = g.left) + "px";
						b = u.getBoundingClientRect()
					}
				}
			}
			var X = b.right - x;
			if (X > 0) {
				if (b.right - b.left > x) {
					u.style.width = x - 5 + "px";
					X -= b.right - b.left - x
				}
				u.style.left = (v = g.left - X) + "px"
			}
			d.addKeyMap(this.keyMap = s(n, {
				moveFocus: function(e, t) {
					o.changeActive(o.selectedHint + e, t)
				},
				setFocus: function(e) {
					o.changeActive(e)
				},
				menuSize: function() {
					return o.screenAmount()
				},
				length: c.length,
				close: function() {
					n.close()
				},
				pick: function() {
					o.pick()
				},
				data: a
			}));
			if (n.options.closeOnUnfocus) {
				var E;
				d.on("blur", this.onBlur = function() {
					E = setTimeout(function() {
						n.close()
					}, 100)
				});
				d.on("focus", this.onFocus = function() {
					clearTimeout(E)
				})
			}
			var I = d.getScrollInfo();
			d.on("scroll", this.onScroll = function() {
				var e = d.getScrollInfo(),
					t = d.getWrapperElement().getBoundingClientRect();
				var i = y + I.top - e.top;
				var a = i - (window.pageYOffset || (document.documentElement || document.body).scrollTop);
				if (!w) a += u.offsetHeight;
				if (a <= t.top || a >= t.bottom) return n.close();
				u.style.top = i + "px";
				u.style.left = v + I.left - e.left + "px"
			});
			e.on(u, "dblclick", function(e) {
				var t = l(u, e.target || e.srcElement);
				if (t && t.hintId != null) {
					o.changeActive(t.hintId);
					o.pick()
				}
			});
			e.on(u, "click", function(e) {
				var t = l(u, e.target || e.srcElement);
				if (t && t.hintId != null) {
					o.changeActive(t.hintId);
					if (n.options.completeOnSingleClick) o.pick()
				}
			});
			e.on(u, "mousedown", function() {
				setTimeout(function() {
					d.focus()
				}, 20)
			});
			e.signal(a, "select", c[0], u.firstChild);
			return true
		}
		d.prototype = {
			close: function() {
				if (this.completion.widget != this) return;
				this.completion.widget = null;
				this.hints.parentNode.removeChild(this.hints);
				this.completion.cm.removeKeyMap(this.keyMap);
				var e = this.completion.cm;
				if (this.completion.options.closeOnUnfocus) {
					e.off("blur", this.onBlur);
					e.off("focus", this.onFocus)
				}
				e.off("scroll", this.onScroll)
			},
			disable: function() {
				this.completion.cm.removeKeyMap(this.keyMap);
				var e = this;
				this.keyMap = {
					Enter: function() {
						e.picked = true
					}
				};
				this.completion.cm.addKeyMap(this.keyMap)
			},
			pick: function() {
				this.completion.pick(this.data, this.selectedHint)
			},
			changeActive: function(t, n) {
				if (t >= this.data.list.length) t = n ? this.data.list.length - 1 : 0;
				else if (t < 0) t = n ? 0 : this.data.list.length - 1;
				if (this.selectedHint == t) return;
				var a = this.hints.childNodes[this.selectedHint];
				a.className = a.className.replace(" " + i, "");
				a = this.hints.childNodes[this.selectedHint = t];
				a.className += " " + i;
				if (a.offsetTop < this.hints.scrollTop) this.hints.scrollTop = a.offsetTop - 3;
				else if (a.offsetTop + a.offsetHeight > this.hints.scrollTop + this.hints.clientHeight) this.hints.scrollTop = a.offsetTop + a.offsetHeight - this.hints.clientHeight + 3;
				e.signal(this.data, "select", this.data.list[this.selectedHint], a)
			},
			screenAmount: function() {
				return Math.floor(this.hints.clientHeight / this.hints.firstChild.offsetHeight) || 1
			}
		};
		e.registerHelper("hint", "auto", function(t, i) {
			var n = t.getHelpers(t.getCursor(), "hint"),
				a;
			if (n.length) {
				for (var o = 0; o < n.length; o++) {
					var r = n[o](t, i);
					if (r && r.list.length) return r
				}
			} else if (a = t.getHelper(t.getCursor(), "hintWords")) {
				if (a) return e.hint.fromList(t, {
					words: a
				})
			} else if (e.hint.anyword) {
				return e.hint.anyword(t, i)
			}
		});
		e.registerHelper("hint", "fromList", function(t, i) {
			var n = t.getCursor(),
				a = t.getTokenAt(n);
			var o = [];
			for (var r = 0; r < i.words.length; r++) {
				var s = i.words[r];
				if (s.slice(0, a.string.length) == a.string) o.push(s)
			}
			if (o.length) return {
				list: o,
				from: e.Pos(n.line, a.start),
				to: e.Pos(n.line, a.end)
			}
		});
		e.commands.autocomplete = e.showHint;
		var u = {
			hint: e.hint.auto,
			completeSingle: true,
			alignWithWord: true,
			closeCharacters: /[\s()\[\]{};:>,]/,
			closeOnUnfocus: true,
			completeOnSingleClick: false,
			container: null,
			customKeys: null,
			extraKeys: null
		};
		e.defineOption("hintOptions", null)
	})(CodeMirror)
}(), function(e) {
	(function(e) {
		var t = e.Pos;

		function i(e, t) {
			for (var i = 0, n = e.length; i < n; ++i) t(e[i])
		}
		function n(e, t) {
			if (!Array.prototype.indexOf) {
				var i = e.length;
				while (i--) {
					if (e[i] === t) {
						return true
					}
				}
				return false
			}
			return e.indexOf(t) != -1
		}
		function a(i, n, a, o) {
			var s = i.getCursor(),
				l = a(i, s);
			if (/\b(?:string)\b/.test(l.type)) {
				return
			}
			l.state = e.innerMode(i.getMode(), l.state).state;
			if (!/^[\w$_]*$/.test(l.string)) {
				l = {
					start: s.ch,
					end: s.ch,
					string: "",
					state: l.state,
					type: l.string == "." ? "property" : null
				}
			} else if (l.end > s.ch) {
				l.end = s.ch;
				l.string = l.string.slice(0, s.ch - l.start)
			}
			var d = l;
			while (d.type == "property") {
				d = a(i, t(s.line, d.start));
				if (d.string != ".") return;
				d = a(i, t(s.line, d.start));
				if (!u) var u = [];
				u.push(d)
			}
			return {
				list: r(l, u, n, o),
				from: t(s.line, l.start),
				to: t(s.line, l.end)
			}
		}
		function o(t, i) {
			return a(t, e.keywords, function(e, t) {
				return e.getTokenAt(t)
			}, i)
		}
		e.registerHelper("hint", "formula", o);

		function r(e, t, a, o) {
			var r = [],
				s = e.string.toUpperCase();
			if (!s) {
				return r
			}
			function l(e) {
				if (e.lastIndexOf(s, 0) == 0 && !n(r, e)) {
					r.push(e)
				}
			}
			if (t && t.length) {
				t.pop()
			} else {
				i(a, l)
			}
			return r
		}
	})(CodeMirror)
}(), function(e) {
	(function(e) {
		"use strict";
		e.defineMode("formula", function() {
			function t(e) {
				var t = {};
				for (var i = 0, n = e.length; i < n; ++i) t[e[i]] = true;
				return t
			}
			var i = t(["false", "true"]);
			var n = t(e.keywords);
			var a = t(["MAP"]);

			function o(e, t) {
				if (e.eatSpace()) {
					return null
				}
				var o = e.next();
				if (o === '"' || o === "'") {
					r(e, o);
					return "string"
				}
				if (/[\[\],\(\)]/.test(o)) {
					return "bracket"
				}
				if (/[+\-*\/=<>!&|]/.test(o)) {
					return "operator"
				}
				if (/\d/.test(o)) {
					e.eatWhile(/[\d\.]/);
					return "number"
				}
				e.eatWhile(/[\w]/);
				var s = e.current();
				if (i.hasOwnProperty(s)) {
					return "atom"
				}
				if (n.hasOwnProperty(s)) {
					return "keyword"
				}
				if (a.hasOwnProperty(s)) {
					return "deprecate"
				}
				return "negative"
			}
			function r(e, t) {
				var i = false,
					n;
				while ((n = e.next()) != null) {
					if (n === t && !i) {
						return false
					}
					i = !i && n === "\\"
				}
				return i
			}
			function s(e, t) {
				return (t.tokens[0] || o)(e, t)
			}
			return {
				startState: function() {
					return {
						tokens: []
					}
				},
				token: function(e, t) {
					return s(e, t)
				},
				fold: "brace"
			}
		});
		e.defineMIME("text/fx-formula", "formula")
	})(CodeMirror)
}(), function(e) {
	(function(e) {
		"use strict";
		e.defineMode("label", function() {
			function e(e, t) {
				if (e.eatSpace()) {
					return null
				}
				var i = e.next();
				return null
			}
			function t(e, t) {
				var i = false,
					n;
				while ((n = e.next()) != null) {
					if (n === t && !i) {
						return false
					}
					i = !i && n === "\\"
				}
				return i
			}
			function i(t, i) {
				return (i.tokens[0] || e)(t, i)
			}
			return {
				startState: function() {
					return {
						tokens: []
					}
				},
				token: function(e, t) {
					return i(e, t)
				},
				fold: "brace"
			}
		});
		e.defineMIME("text/fx-label", "label")
	})(CodeMirror)
}(), function(e) {
	(function(e) {
		var t = /MSIE \d/.test(navigator.userAgent) && (document.documentMode == null || document.documentMode < 8);
		var i = e.Pos;
		var n = {
			"(": ")>",
			")": "(<",
			"[": "]>",
			"]": "[<",
			"{": "}>",
			"}": "{<"
		};

		function a(e, t, a) {
			var r = e.getLineHandle(t.line),
				s = t.ch - 1;
			var l = a && a.afterCursor;
			if (l == null) l = /(^| )cm-fat-cursor($| )/.test(e.getWrapperElement().className);
			var d = !l && s >= 0 && n[r.text.charAt(s)] || n[r.text.charAt(++s)];
			if (!d) return null;
			var u = d.charAt(1) == ">" ? 1 : -1;
			if (a && a.strict && u > 0 != (s == t.ch)) return null;
			var c = e.getTokenTypeAt(i(t.line, s + 1));
			var f = o(e, i(t.line, s + (u > 0 ? 1 : 0)), u, c || null, a);
			if (f == null) return null;
			return {
				from: i(t.line, s),
				to: f && f.pos,
				match: f && f.ch == d.charAt(0),
				forward: u > 0
			}
		}
		function o(e, t, a, o, r) {
			var s = r && r.maxScanLineLength || 1e4;
			var l = r && r.maxScanLines || 1e3;
			var d = [];
			var u = r && r.bracketRegex ? r.bracketRegex : /[(){}[\]]/;
			var c = a > 0 ? Math.min(t.line + l, e.lastLine() + 1) : Math.max(e.firstLine() - 1, t.line - l);
			for (var f = t.line; f != c; f += a) {
				var h = e.getLine(f);
				if (!h) continue;
				var p = a > 0 ? 0 : h.length - 1,
					m = a > 0 ? h.length : -1;
				if (h.length > s) continue;
				if (f == t.line) p = t.ch - (a < 0 ? 1 : 0);
				for (; p != m; p += a) {
					var g = h.charAt(p);
					if (u.test(g) && (o === undefined || e.getTokenTypeAt(i(f, p + 1)) == o)) {
						var v = n[g];
						if (v.charAt(1) == ">" == a > 0) d.push(g);
						else if (!d.length) return {
							pos: i(f, p),
							ch: g
						};
						else d.pop()
					}
				}
			}
			return f - a == (a > 0 ? e.lastLine() : e.firstLine()) ? false : null
		}
		function r(e, n, o) {
			var r = e.state.matchBrackets.maxHighlightLineLength || 1e3;
			var s = [],
				l = e.listSelections();
			for (var d = 0; d < l.length; d++) {
				var u = l[d].empty() && a(e, l[d].head, o);
				if (u && e.getLine(u.from.line).length <= r) {
					var c = u.match ? "CodeMirror-matchingbracket" : "CodeMirror-nonmatchingbracket";
					s.push(e.markText(u.from, i(u.from.line, u.from.ch + 1), {
						className: c
					}));
					if (u.to && e.getLine(u.to.line).length <= r) s.push(e.markText(u.to, i(u.to.line, u.to.ch + 1), {
						className: c
					}))
				}
			}
			if (s.length) {
				if (t && e.state.focused) e.focus();
				var f = function() {
						e.operation(function() {
							for (var e = 0; e < s.length; e++) s[e].clear()
						})
					};
				if (n) setTimeout(f, 800);
				else return f
			}
		}
		var s = null;

		function l(e) {
			e.operation(function() {
				if (s) {
					s();
					s = null
				}
				s = r(e, false, e.state.matchBrackets)
			})
		}
		e.defineOption("matchBrackets", false, function(t, i, n) {
			if (n && n != e.Init) {
				t.off("cursorActivity", l);
				if (s) {
					s();
					s = null
				}
			}
			if (i) {
				t.state.matchBrackets = typeof i == "object" ? i : {};
				t.on("cursorActivity", l)
			}
		});
		e.defineExtension("matchBrackets", function() {
			r(this, true)
		});
		e.defineExtension("findMatchingBracket", function(e, t, i) {
			if (i || typeof t == "boolean") {
				if (!i) {
					t = t ? {
						strict: true
					} : null
				} else {
					i.strict = t;
					t = i
				}
			}
			return a(this, e, t)
		});
		e.defineExtension("scanForBracket", function(e, t, i, n) {
			return o(this, e, t, i, n)
		})
	})(CodeMirror)
}(), function(e) {
	FX.FieldFormulaPane = FX.extend(FX.Widget, {
		_defaultConfig: function() {
			return e.extend(FX.FieldFormulaPane.superclass._defaultConfig.apply(this, arguments), {
				formula: {},
				text: i18next.t("formula"),
				hasRemind: !0,
				hasFunction: !0,
				supportMultiForm: !0,
				availableFieldValue: FX.LimitFields.formulaValue,
				availableFieldName: FX.LimitFields.formulaName,
				formulaKeywords: Object.keys(FX.Formula).remove("MAP"),
				currentForm: null,
				currentWidget: null,
				currentSubform: null,
				entryList: null,
				onAfterFormulaEdit: null,
				labelMap: null
			})
		},
		_init: function() {
			FX.FieldFormulaPane.superclass._init.apply(this, arguments), this._createFieldSelect(), this._createEditDialog(), this.dialog.show()
		},
		_createFieldSelect: function() {
			var t = this,
				i = this.options;
			this.$fieldSelect = e('<div class="fx_formula_field_tab"/>'), e('<div class="field-label">' + i18next.t("variable") + "</div>").appendTo(this.$fieldSelect);
			var n = e('<div class="head"/>').appendTo(this.$fieldSelect),
				a = e('<div class="tab active"/>').text(i18next.t("field.rely.currentForm")).click(function() {
					l && l.removeClass("active"), a && a.addClass("active"), s && s.setVisible(!0), d && d.setVisible(!1)
				}).appendTo(n),
				o = [];
			FX.Utils.forEach(i.entryList, function(e, t) {
				if (!t.appId) return i.currentForm === t.entryId ? (o = [t], !1) : void 0
			});
			var r = [];
			i.currentWidget && r.push([i.currentWidget, i.currentForm].join(FX.CONST.FIELD.ENTRY_DELIMITER));
			var s = new FX.EntryFieldSelectPane({
				renderEl: e("<div/>").appendTo(this.$fieldSelect),
				mode: "dialog",
				customCls: "hide-menu-entry",
				fields: [],
				excludeFields: r,
				availableFields: i.availableFieldValue,
				allowMultiTable: !0,
				allowSameField: !0,
				allowMultiSubform: !0,
				entryList: o,
				hasFieldType: !0,
				isSubform: !! i.currentSubform,
				onFieldSelect: function(e) {
					t.dialog.getWidgetByName("formulaEditor").insertField(e, !1)
				},
				onFieldFilter: function(e) {
					return !(!i.currentSubform || !e.subform) && e.subform !== i.currentSubform
				}
			});
			if (i.supportMultiForm) var l = e('<div class="tab"/>').text(i18next.t("form.allFields")).click(function() {
				a && a.removeClass("active"), l && l.addClass("active"), s && s.setVisible(!1), d && d.setVisible(!0)
			}).appendTo(n),
				d = new FX.EntryFieldSelectPane({
					renderEl: e("<div/>").appendTo(this.$fieldSelect),
					mode: "dialog",
					visible: !1,
					fields: [],
					availableFields: i.availableFieldName,
					allowMultiTable: !0,
					allowSameField: !0,
					allowMultiSubform: !0,
					hasFieldType: !0,
					entryList: i.entryList,
					onFieldSelect: function(e) {
						e.appId && (e.id = [e.id, e.appId].join(FX.CONST.FIELD.DELIMITER)), t.dialog.getWidgetByName("formulaEditor").insertField(e, !0)
					}
				})
		},
		_createEditDialog: function() {
			var t = this,
				i = this.options,
				n = [190, 250],
				a = i.text;
			i.currentSubform && FX.Utils.forEach(i.entryList, function(e, t) {
				if (t.entryId === i.currentForm) return FX.Utils.forEach(t.fields, function(e, t) {
					if (t.name === i.currentSubform) return a = t.text + "." + a, !1
				}), !1
			});
			var o = [
				[{
					type: "formulaeditor",
					widgetName: "formulaEditor",
					value: i.formula.formula,
					keywords: i.formulaKeywords,
					text: a,
					hasFunction: i.hasFunction,
					labelMap: i.labelMap,
					width: 760
				}],
				[this.$fieldSelect,
				{
					type: "formulainfopane",
					widgetName: "formulaInfoPane",
					onAfterFormulaSelect: function(e) {
						t.dialog.getWidgetByName("formulaEditor").insertFormula(e)
					}
				}]
			];
			i.hasRemind && (n = [30, 160, 250], o.unshift([{
				type: "label",
				text: i18next.t("formula.valid.fail.tip"),
				width: 150
			}, {
				type: "text",
				widgetName: "remindInfo",
				value: i.formula.remind,
				width: 600
			}])), this.dialog = new FX.ConfirmDialog({
				title: i18next.t("formula.edit"),
				width: 800,
				customCls: "formula-dialog",
				contentWidget: {
					rowSize: n,
					colSize: [220, 530],
					vgap: 10,
					hgap: 10,
					items: o
				},
				onOk: function() {
					var e = t.dialog.getWidgetByName("formulaEditor");
					if (e.checkValidate()) {
						var n = t.dialog.getWidgetByName("formulaEditor").getValue(),
							a = t.dialog.getWidgetByName("remindInfo"),
							o = null;
						a && (o = a.getValue()), FX.Utils.applyFunc(t.dialog, i.onAfterFormulaEdit, [n, o], !1), t.dialog.close()
					} else {
						var r = "";
						switch (e.getInvalidateType()) {
						case "invalid field":
							r = i18next.t("formula.valid.field.tip");
							break;
						case "deprecated field":
							r = i18next.t("formula.valid.map.tip");
							break;
						default:
							r = i18next.t("formula.valid.fail")
						}
						FX.Msg.toast({
							type: "warning",
							msg: r
						})
					}
				},
				onCreateFooterLeft: function(t) {
					e('<div><div class="dialog-info"><i class="icon-function-data-remind"/><span class="info-tip">' + i18next.t("formula.inputEnglish") + "</span></div></div>").css({
						left: 20,
						right: "auto"
					}).appendTo(t)
				}
			})
		}
	})
}(jQuery), function(e) {
	FX.FormulaInfoPane = FX.extend(FX.Widget, {
		FORMULA: [{
			category: i18next.t("formula.math"),
			docUrl: "https://hc.jiandaoyun.com/doc/9035",
			contains: [{
				name: "ABS",
				intro: i18next.t("formula.abs.intro"),
				usage: i18next.t("formula.abs.usage"),
				example: i18next.t("formula.abs.example")
			}, {
				name: "AVERAGE",
				intro: i18next.t("formula.average.intro"),
				usage: i18next.t("formula.average.usage"),
				example: i18next.t("formula.average.example")
			}, {
				name: "CEILING",
				intro: i18next.t("formula.ceiling.intro"),
				usage: i18next.t("formula.ceiling.usage"),
				example: i18next.t("formula.ceiling.example")
			}, {
				name: "COUNT",
				intro: i18next.t("formula.count.intro"),
				usage: i18next.t("formula.count.usage"),
				example: i18next.t("formula.count.example")
			}, {
				name: "COUNTIF",
				intro: i18next.t("formula.countif.intro"),
				usage: i18next.t("formula.countif.usage"),
				example: i18next.t("formula.countif.example")
			}, {
				name: "FIXED",
				intro: i18next.t("formula.fixed.intro"),
				usage: i18next.t("formula.fixed.usage"),
				example: i18next.t("formula.fixed.example")
			}, {
				name: "FLOOR",
				intro: i18next.t("formula.floor.intro"),
				usage: i18next.t("formula.floor.usage"),
				example: i18next.t("formula.floor.example")
			}, {
				name: "INT",
				intro: i18next.t("formula.int.intro"),
				usage: i18next.t("formula.int.usage"),
				example: i18next.t("formula.int.example")
			}, {
				name: "LARGE",
				intro: i18next.t("formula.large.intro"),
				usage: i18next.t("formula.large.usage"),
				example: i18next.t("formula.large.example")
			}, {
				name: "LOG",
				intro: i18next.t("formula.log.intro"),
				usage: i18next.t("formula.log.usage"),
				example: i18next.t("formula.log.example")
			}, {
				name: "MAX",
				intro: i18next.t("formula.max.intro"),
				usage: i18next.t("formula.max.usage"),
				example: i18next.t("formula.max.example")
			}, {
				name: "MIN",
				intro: i18next.t("formula.min.intro"),
				usage: i18next.t("formula.min.usage"),
				example: i18next.t("formula.min.example")
			}, {
				name: "MOD",
				intro: i18next.t("formula.mod.intro"),
				usage: i18next.t("formula.mod.usage"),
				example: i18next.t("formula.mod.example")
			}, {
				name: "POWER",
				intro: i18next.t("formula.power.intro"),
				usage: i18next.t("formula.power.usage"),
				example: i18next.t("formula.power.example")
			}, {
				name: "PRODUCT",
				intro: i18next.t("formula.product.intro"),
				usage: i18next.t("formula.product.usage"),
				example: i18next.t("formula.product.example")
			}, {
				name: "ROUND",
				intro: i18next.t("formula.round.intro"),
				usage: i18next.t("formula.round.usage"),
				example: i18next.t("formula.round.example")
			}, {
				name: "SMALL",
				intro: i18next.t("formula.small.intro"),
				usage: i18next.t("formula.small.usage"),
				example: i18next.t("formula.small.example")
			}, {
				name: "SQRT",
				intro: i18next.t("formula.sqrt.intro"),
				usage: i18next.t("formula.sqrt.usage"),
				example: i18next.t("formula.sqrt.example")
			}, {
				name: "SUM",
				intro: i18next.t("formula.sum.intro"),
				usage: i18next.t("formula.sum.usage"),
				example: i18next.t("formula.sum.example")
			}, {
				name: "SUMPRODUCT",
				intro: i18next.t("formula.sumproduct.intro"),
				usage: i18next.t("formula.sumproduct.usage"),
				example: i18next.t("formula.sumproduct.example")
			}, {
				name: "RAND",
				intro: i18next.t("formula.rand.intro"),
				usage: i18next.t("formula.rand.usage"),
				example: i18next.t("formula.rand.example")
			}]
		}, {
			category: i18next.t("formula.text"),
			docUrl: "https://hc.jiandaoyun.com/doc/9034",
			contains: [{
				name: "CONCATENATE",
				intro: i18next.t("formula.concatenate.intro"),
				usage: i18next.t("formula.concatenate.usage"),
				example: i18next.t("formula.concatenate.example")
			}, {
				name: "CHAR",
				intro: i18next.t("formula.char.intro"),
				usage: i18next.t("formula.char.usage"),
				example: i18next.t("formula.char.example")
			}, {
				name: "EXACT",
				intro: i18next.t("formula.exact.intro"),
				usage: i18next.t("formula.exact.usage"),
				example: i18next.t("formula.exact.example")
			}, {
				name: "GETUSERNAME",
				intro: i18next.t("formula.getusername.intro"),
				usage: i18next.t("formula.getusername.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "IP",
				intro: i18next.t("formula.ip.intro"),
				usage: i18next.t("formula.ip.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "ISEMPTY",
				intro: i18next.t("formula.isempty.intro"),
				usage: i18next.t("formula.isempty.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "LEFT",
				intro: i18next.t("formula.left.intro"),
				usage: i18next.t("formula.left.usage"),
				example: i18next.t("formula.left.example")
			}, {
				name: "LEN",
				intro: i18next.t("formula.len.intro"),
				usage: i18next.t("formula.len.usage"),
				example: i18next.t("formula.len.example")
			}, {
				name: "LOWER",
				intro: i18next.t("formula.lower.intro"),
				usage: i18next.t("formula.lower.usage"),
				example: i18next.t("formula.lower.example")
			}, {
				name: "MID",
				intro: i18next.t("formula.mid.intro"),
				usage: i18next.t("formula.mid.usage"),
				example: i18next.t("formula.mid.example")
			}, {
				name: "REPLACE",
				intro: i18next.t("formula.replace.intro"),
				usage: i18next.t("formula.replace.usage"),
				example: i18next.t("formula.replace.example")
			}, {
				name: "REPT",
				intro: i18next.t("formula.rept.intro"),
				usage: i18next.t("formula.rept.usage"),
				example: i18next.t("formula.rept.example")
			}, {
				name: "RIGHT",
				intro: i18next.t("formula.right.intro"),
				usage: i18next.t("formula.right.usage"),
				example: i18next.t("formula.right.example")
			}, {
				name: "SEARCH",
				intro: i18next.t("formula.search.intro"),
				usage: i18next.t("formula.search.usage"),
				example: i18next.t("formula.search.example")
			}, {
				name: "SPLIT",
				intro: i18next.t("formula.split.intro"),
				usage: i18next.t("formula.split.usage"),
				example: i18next.t("formula.split.example")
			}, {
				name: "TEXT",
				intro: i18next.t("formula.text.intro"),
				usage: i18next.t("formula.text.usage"),
				example: i18next.t("formula.text.example")
			}, {
				name: "TRIM",
				intro: i18next.t("formula.trim.intro"),
				usage: i18next.t("formula.trim.usage"),
				example: i18next.t("formula.trim.example")
			}, {
				name: "UPPER",
				intro: i18next.t("formula.upper.intro"),
				usage: i18next.t("formula.upper.usage"),
				example: i18next.t("formula.upper.example")
			}, {
				name: "VALUE",
				intro: i18next.t("formula.value.intro"),
				usage: i18next.t("formula.value.usage"),
				example: i18next.t("formula.value.example")
			}]
		}, {
			category: i18next.t("formula.date"),
			docUrl: "https://hc.jiandaoyun.com/doc/9036",
			contains: [{
				name: "DATE",
				intro: i18next.t("formula.date.intro"),
				usage: i18next.t("formula.date.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "DATEDELTA",
				intro: i18next.t("formula.datedelta.intro"),
				usage: i18next.t("formula.datedelta.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "DAY",
				intro: i18next.t("formula.day.intro"),
				usage: i18next.t("formula.day.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "DAYS",
				intro: i18next.t("formula.days.intro"),
				usage: i18next.t("formula.days.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "DAYS360",
				intro: i18next.t("formula.days360.intro"),
				usage: i18next.t("formula.days360.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "HOUR",
				intro: i18next.t("formula.hour.intro"),
				usage: i18next.t("formula.hour.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "ISOWEEKNUM",
				intro: i18next.t("formula.isoweeknum.intro"),
				usage: i18next.t("formula.isoweeknum.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "MINUTE",
				intro: i18next.t("formula.minute.intro"),
				usage: i18next.t("formula.minute.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "MONTH",
				intro: i18next.t("formula.month.intro"),
				usage: i18next.t("formula.month.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "NOW",
				intro: i18next.t("formula.now.intro"),
				usage: i18next.t("formula.now.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "SECOND",
				intro: i18next.t("formula.second.intro"),
				usage: i18next.t("formula.second.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "SYSTIME",
				intro: i18next.t("formula.systime.intro"),
				usage: i18next.t("formula.systime.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "TIME",
				intro: i18next.t("formula.time.intro"),
				usage: i18next.t("formula.time.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "TIMESTAMP",
				intro: i18next.t("formula.timestamp.intro"),
				usage: i18next.t("formula.timestamp.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "TODAY",
				intro: i18next.t("formula.today.intro"),
				usage: i18next.t("formula.today.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "WEEKNUM",
				intro: i18next.t("formula.weeknum.intro"),
				usage: i18next.t("formula.weeknum.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "YEAR",
				intro: i18next.t("formula.year.intro"),
				usage: i18next.t("formula.year.usage"),
				example: i18next.t("formula.omit")
			}]
		}, {
			category: i18next.t("formula.logic"),
			docUrl: "https://hc.jiandaoyun.com/doc/9033",
			contains: [{
				name: "AND",
				intro: i18next.t("formula.and.intro"),
				usage: i18next.t("formula.and.usage"),
				example: i18next.t("formula.and.example")
			}, {
				name: "FALSE",
				intro: i18next.t("formula.false.intro"),
				usage: i18next.t("formula.false.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "IF",
				intro: i18next.t("formula.if.intro"),
				usage: i18next.t("formula.if.usage"),
				example: i18next.t("formula.if.example")
			}, {
				name: "NOT",
				intro: i18next.t("formula.not.intro"),
				usage: i18next.t("formula.not.usage"),
				example: i18next.t("formula.not.example")
			}, {
				name: "OR",
				intro: i18next.t("formula.or.intro"),
				usage: i18next.t("formula.or.usage"),
				example: i18next.t("formula.or.example")
			}, {
				name: "TRUE",
				intro: i18next.t("formula.true.intro"),
				usage: i18next.t("formula.true.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "XOR",
				intro: i18next.t("formula.xor.intro"),
				usage: i18next.t("formula.xor.usage"),
				example: i18next.t("formula.xor.example")
			}]
		}, {
			category: i18next.t("formula.advance"),
			docUrl: "https://hc.jiandaoyun.com/doc/9037",
			contains: [{
				name: "MAPX",
				intro: i18next.t("formula.mapx.intro"),
				usage: i18next.t("formula.mapx.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "RECNO",
				intro: i18next.t("formula.recno.intro"),
				usage: i18next.t("formula.recno.usage"),
				example: i18next.t("formula.omit")
			}, {
				name: "UUID",
				intro: i18next.t("formula.uuid.intro"),
				usage: i18next.t("formula.uuid.usage"),
				example: i18next.t("formula.omit")
			}]
		}],
		_defaultConfig: function() {
			return e.extend(FX.FormulaInfoPane.superclass._defaultConfig.apply(this, arguments), {
				baseCls: "fx_formula_info",
				height: 228,
				limits: null,
				onAfterFormulaSelect: null
			})
		},
		_init: function() {
			var t = this.options;
			FX.FormulaInfoPane.superclass._init.apply(this, arguments), this._initFormulaData();
			var i = e.extend(!0, [], this.FORMULA);
			FX.Utils.isArray(t.limits) && t.limits.length ? this.formula = this._filterFormulaData(i) : this.formula = i, e('<div class="formula-info-label">' + i18next.t("formula.func") + "</div>").appendTo(this.element), this.$main = e('<div class="formula-info-main"/>').appendTo(this.element), this._createFormulaMenu(), this._createIntroPane()
		},
		_initFormulaData: function() {
			FX.Utils.forEach(this.FORMULA, function(t, i) {
				FX.Utils.forEach(i.contains, function(t, n) {
					e.extend(n, {
						link: i.docUrl + "/#" + n.name.toLowerCase()
					})
				})
			})
		},
		_filterFormulaData: function(t) {
			var i = this.options;
			return t.filter(function(t) {
				var n = t.contains.filter(function(e) {
					return i.limits.indexOf(e.name) > -1
				});
				return e.extend(t, {
					contains: n
				}), t.contains.length > 1
			})
		},
		_createFormulaMenu: function() {
			this.$formulaMenu = e('<div class="formula-menu"/>').appendTo(this.$main), this._createSearchPane(), this._createFormulaList(), this._bindEvents()
		},
		_createSearchPane: function() {
			var t = this;
			this.$formulaSearch = e('<div class="formula-search"><i class="icon-search"/></div>').appendTo(this.$formulaMenu), e('<input class="search-input" placeholder="' + i18next.t("formula.search") + '"/>').on("input", function(e) {
				var i = e.target.value;
				i.trim() ? t._createSearchResultList(i) : (t._createFormulaList(), t._createIntroPane())
			}).prependTo(this.$formulaSearch)
		},
		_createFormulaList: function() {
			var t = this;
			this.$formulaList ? this.$formulaList.removeClass("search-list").empty() : this.$formulaList = e('<ul class="formula-list"/>').appendTo(this.$formulaMenu), FX.Utils.forEach(this.formula, function(i, n) {
				var a = e('<li class="formula-category"><div class="title"><i class="angle-icon icon-angleright"/>' + n.category + "</div></li>").appendTo(t.$formulaList),
					o = e('<ul class="children"/>').appendTo(a);
				FX.Utils.forEach(n.contains, function(i, n) {
					e('<li class="formula-item"/>').text(n.name).data("formula", n).on("mouseenter", function(e) {
						t._onHoverFormulaItem(e)
					}).appendTo(o)
				})
			})
		},
		_createSearchResultList: function(t) {
			this.$formulaList.addClass("search-list").empty();
			var i = this._getSearchResult(t);
			if (FX.Utils.isObjectEmpty(i)) return this._createIntroPane(), void e('<div class="search-empty">' + i18next.t("formula.empty") + "</div>").appendTo(this.$formulaList);
			var n = this;
			FX.Utils.forEach(i, function(t, i) {
				e('<li class="formula-item"><span class="key">' + i.prefix + '</span><span class="other">' + i.other + "</span></li>").data("formula", i.formula).on("mouseenter", function(e) {
					n._onHoverFormulaItem(e)
				}).appendTo(n.$formulaList)
			});
			var a = e(".formula-item", this.$formulaList).eq(0);
			a.addClass("select"), this._createIntroPane(a)
		},
		_onHoverFormulaItem: function(t) {
			e(".select", this.$formulaList).removeClass("select"), e(t.target).addClass("select"), this._createIntroPane(e(t.target))
		},
		_getSearchResult: function(e) {
			var t = [];
			return e = e.toUpperCase(), FX.Utils.forEach(this.formula, function(i, n) {
				FX.Utils.forEach(n.contains, function(i, n) {
					0 === n.name.indexOf(e) && t.push({
						formula: n,
						prefix: e,
						other: n.name.slice(e.length)
					})
				})
			}), t
		},
		_bindEvents: function() {
			var t = this,
				i = this.options;
			this.$formulaList.on("click", function(n) {
				var a = e(n.target).closest(".title");
				if (a.length > 0 && (a.parent().siblings().removeClass("expand"), a.parent().toggleClass("expand"), e(".children", t.$formulaList).css({
					height: 0
				}), a.parent().hasClass("expand"))) {
					var o = a.next(".children");
					o.css({
						height: 24 * o.children().length
					}), t.$formulaList.animate({
						scrollTop: 24 * a.parent().index()
					}, 218)
				}
				var r = e(n.target).closest(".formula-item");
				if (r.length > 0) {
					var s = r.data("formula");
					FX.Utils.applyFunc(t, i.onAfterFormulaSelect, [s.name], !1)
				}
			})
		},
		_createIntroPane: function(t) {
			if (this.$introPane ? this.$introPane.empty() : this.$introPane = e('<div class="formula-intro"/>').appendTo(this.$main), t) {
				var i = t.data("formula");
				if (i) {
					var n = new RegExp("(" + i.name + ")", "g"),
						a = new RegExp("\\{(.+?)\\}", "g"),
						o = i.intro.replace(n, '<span class="formula-name">$1</span>'),
						r = i.usage.replace(n, '<span class="formula-name">$1</span>'),
						s = i.example.replace(n, '<span class="formula-name">$1</span>').replace(a, '<span class="formula-field">$1</span>'),
						l = '<div class="formula-title">' + i.name + "</div>",
						d = '<ul class="intro-wrapper"><li class="intro">' + o + '</li><li class="usage">' + i18next.t("formula.usage") + r + '</li><li class="example">' + i18next.t("formula.example") + s + "</li></ul>",
						u = '<a class="formula-link" target="_blank" href="' + i.link + '">' + i18next.t("formula.learnMore") + "</a>";
					e(l + d + u).appendTo(this.$introPane)
				}
			} else e('<ul class="intro-wrapper default"><li>' + i18next.t("formula.input.tip") + "</li><li>" + i18next.t("formula.edit.example") + '<span class="formula-name">SUM</span>(<span class="formula-field">' + i18next.t("formula.example.baseSalary") + '</span>,<span class="formula-field">' + i18next.t("formula.example.extraSalary") + '</span>)</li></ul><div class="default-links"><a href="https://hc.jiandaoyun.com/video/10530" target="_blank" class="formula-link">' + i18next.t("formula.example.baseVideo") + '</a><a href="https://hc.jiandaoyun.com/blog/10471" target="_blank" class="formula-link">' + i18next.t("formula.example.advanceVideo") + '</a><a href="https://hc.jiandaoyun.com/doc/9031" target="_blank" class="formula-link">' + i18next.t("formula.example.doc") + "</a></div>").appendTo(this.$introPane)
		}
	}), e.shortcut("formulainfopane", FX.FormulaInfoPane)
}(jQuery), function(e) {
	FX.ValidatorPane = FX.extend(FX.Widget, {
		_defaultConfig: function() {
			return e.extend(FX.ValidatorPane.superclass._defaultConfig.apply(this, arguments), {
				baseCls: "fx_validator_pane",
				validator: [],
				entryList: [],
				entryId: "",
				onBeforeEdit: null,
				onAfterEdit: null
			})
		},
		_init: function() {
			FX.ValidatorPane.superclass._init.apply(this, arguments), this._createValidatorList(), this._createValidatorBtn()
		},
		_createValidatorBtn: function() {
			var t = this;
			new FX.Button({
				renderEl: e("<div/>").appendTo(this.element),
				type: "button",
				text: i18next.t("form.validator.add"),
				style: "white",
				height: 30,
				onClick: function() {
					t._setValidator()
				}
			})
		},
		_setValidator: function(e, t) {
			var i = this,
				n = this.options;
			FX.Utils.applyFunc(i, n.onBeforeEdit, [], !1), new FX.FieldFormulaPane({
				formula: e,
				supportMultiForm: !1,
				formulaKeywords: Object.keys(FX.Formula).remove("MAP").remove("MAPX"),
				availableFieldValue: FX.LimitFields.validate,
				entryList: n.entryList,
				currentForm: n.entryId,
				labelMap: this.labelMap,
				onAfterFormulaEdit: function(e, a) {
					t ? FX.Utils.isEmpty(e.formula) ? t.remove() : (t.data("formula", e.formula).data("remind", a), t.children("span").text(i._getTextFormFormula(e.formula))) : FX.Utils.isEmpty(e.formula) || i._createValidatorItem(e.formula, a), FX.Utils.applyFunc(i, n.onAfterEdit, [], !1)
				}
			})
		},
		_createValidatorList: function() {
			var t = this,
				i = this.options;
			this.$list = e('<ul class="validator-list">').appendTo(this.element), FX.Utils.forEach(i.validator, function(e, i) {
				t._createValidatorItem(i.formula, i.remind)
			})
		},
		_getTextFormFormula: function(e) {
			var t = [],
				i = this,
				n = e.split(/(\$[0-9a-zA-Z\._]+#[0-9A-Fa-f]*)/g);
			return FX.Utils.forEach(n, function(e, n) {
				if (FX.Utils.startWith(n, "$_widget_")) {
					var a = i._findFieldLabel(n);
					t.push(a)
				} else t.push(n)
			}), t.join("")
		},
		_findFieldLabel: function(t) {
			var i = this,
				n = this.options;
			return this.labelMap ? this.labelMap[t] : (this.labelMap = {}, FX.Utils.forEach(n.entryList, function(t, a) {
				if (a.entryId === n.entryId) return FX.Utils.forEach(a.fields, function(t, n) {
					e.extend(i.labelMap, i._getLabelMap(n))
				}), !1
			}), this.labelMap[t])
		},
		_getLabelMap: function(e) {
			var t = {};
			if ("subform" === e.type) FX.Utils.forEach(e.items, function(i, n) {
				var a = ["$", e.name, ".", n.name, "#"].join("");
				t[a] = [e.text, n.text].join(".")
			});
			else {
				var i = ["$", e.name, "#"].join("");
				t[i] = e.text
			}
			return t
		},
		_createValidatorItem: function(t, i) {
			var n = this,
				a = this.options,
				o = this._getTextFormFormula(t),
				r = e("<li/>").data("formula", t).data("remind", i).appendTo(this.$list);
			e("<span/>").text(o).appendTo(r), e('<i class="item-icon x-c-key icon-edit"/>').appendTo(r).click(function() {
				n._setValidator({
					formula: r.data("formula"),
					remind: r.data("remind")
				}, r)
			}), e('<i class="item-icon icon-trasho"/>').appendTo(r).click(function() {
				r.remove(), FX.Utils.applyFunc(n, a.onAfterEdit, [], !1)
			})
		},
		getValue: function() {
			var t = [];
			return FX.Utils.forEach(this.$list.children("li"), function(i, n) {
				var a = e(n).data("formula");
				FX.Utils.isEmpty(a) || t.push({
					formula: a,
					remind: e(n).data("remind")
				})
			}), t
		}
	}), e.shortcut("validatorpane", FX.ValidatorPane)
}(jQuery), function(e) {
	FX.AuthGroupPane = FX.extend(FX.Widget, {
		_defaultConfig: function() {
			return e.extend(FX.AuthGroupPane.superclass._defaultConfig.apply(this, arguments), {
				baseCls: "fx_auth_group",
				name: "",
				printId: null,
				groupId: 0,
				desc: "",
				tip: i18next.t("user.select"),
				members: {},
				authType: "custom",
				mode: "auth",
				onEditAuth: null,
				onEditMember: null,
				onAfterEditMember: null
			})
		},
		_init: function() {
			FX.AuthGroupPane.superclass._init.apply(this, arguments);
			var t = this,
				i = this.options;
			this.$titlePane = e('<div class="item-title-line"/>').addClass(i.authType).appendTo(this.element);
			var n = e('<div class="pane-line"/>').appendTo(this.element),
				a = i.members || {};
			this.members = new FX.LabelMemberSelectPane({
				renderEl: n,
				jsonValue: a,
				roleEnable: !0,
				msg: i.tip,
				onEdit: function() {
					FX.Utils.applyFunc(t, i.onEditMember, [t.members], !1)
				},
				onStopEdit: function(e) {
					i.members = e, FX.Utils.applyFunc(t, i.onAfterEditMember, [this.getValue(), i.groupId], !1)
				}
			});
			var o = this.$titlePane;
			e('<span class="title has-sub"/>').text(i.name).appendTo(o), e('<span class="sub-title" />').text(i.desc).appendTo(o), "default" !== i.authType && (e('<div class="title-btn style-red delete" />').text(i18next.t("delete")).appendTo(o), e('<div class="title-btn style-blue edit" />').text(i18next.t("edit")).appendTo(o)), i.groupId !== FX.CONST.AUTH_GROUP.SUBMIT && e('<div class="title-btn style-blue print-set" />').text(i18next.t("data.printTemplate.set")).appendTo(o), this._bindTitleEvent(o)
		},
		_bindTitleEvent: function(e) {
			var t = this,
				i = this.options;
			e.find(".delete").bind("click", function() {
				var e = FX.Utils.isMembersEmpty(i.members) ? "" : i18next.t("auth.group.deleteTip1");
				FX.Msg.alert({
					title: i18next.t("delete.confirm", {
						name: i.name
					}),
					msg: e + i18next.t("auth.group.deleteTip2"),
					type: "warning",
					onOk: function() {
						FX.Utils.ajax({
							url: FX.Utils.getApi(FX._API.form.auth_group.remove, FX.STATIC.APPID, FX.STATIC.ENTRYID),
							data: {
								groupId: i.groupId
							}
						}, function() {
							t.destroy()
						}, function() {
							FX.Msg.toast({
								type: "error",
								msg: i18next.t("delete.fail")
							})
						})
					}
				})
			}), e.find(".edit").bind("click", function() {
				FX.Utils.applyFunc(t, i.onEditAuth, [], !1)
			}), e.find(".print-set").bind("click", function() {
				var e = new FX.ConfirmDialog({
					title: i18next.t("data.printTemplate"),
					width: 610,
					onOk: function() {
						var t = e.getWidgetByName("ptselect");
						return FX.Utils.ajax({
							url: FX.Utils.getApi(FX._API.form.auth_group.pt_update, FX.STATIC.APPID, FX.STATIC.ENTRYID),
							data: {
								printId: t.getValue(),
								groupId: i.groupId
							}
						}, function() {
							FX.Msg.toast({
								type: "success",
								msg: i18next.t("print.usage.set")
							}), i.printId = t.getValue()
						}), !1
					},
					contentWidget: {
						rowSize: [450],
						colSize: [570],
						items: [
							[{
								widgetName: "ptselect",
								type: "printtemplateselectpane",
								appId: FX.STATIC.APPID,
								value: i.printId,
								formId: FX.STATIC.ENTRYID,
								editable: !0
							}]
						]
					}
				});
				e.show()
			})
		},
		rebuild: function() {
			var e = this.options;
			this.$titlePane.find(".title").text(e.name), this.$titlePane.find(".sub-title").text(e.desc), this.members.rebuild(e.members)
		}
	}), e.shortcut("authgrouppane", FX.AuthGroupPane)
}(jQuery), function(e) {
	FX.AuthGroupSelectPane = FX.extend(FX.BaseSelectPane, {
		_defaultConfig: function() {
			return e.extend(FX.AuthGroupSelectPane.superclass._defaultConfig.apply(this, arguments), {
				baseCls: "fx_base_select fx_authgroup_select",
				title: i18next.t("data.auth.select"),
				msg: i18next.t("data.auth.add"),
				appId: "",
				formId: "",
				value: [],
				items: null,
				editable: !1,
				onAsyncSuccess: null,
				onStopEdit: null
			})
		},
		_init: function() {
			FX.AuthGroupSelectPane.superclass._init.apply(this, arguments);
			var e = this,
				t = this.options;
			if (this.value = t.value, t.items) this.items = t.items, this._createContent();
			else {
				var i = FX.Utils.createMask(this.element, {
					isLight: !0,
					hasLoader: !0
				});
				FX.Utils.ajax({
					url: FX.Utils.getApi(FX._API.form.auth_group.list_name, t.appId, t.formId)
				}, function(n) {
					e.items = n.groups, FX.Utils.applyFunc(e, t.onAsyncSuccess, [e.items], !1), i.remove(), e._createContent()
				})
			}
		},
		_createContent: function() {
			var e = this.options;
			this._initSelectMap(), this._createSelectList(), e.editable ? this._createSelectPane() : this._bindEditEvent()
		},
		_initSelectMap: function() {
			var e = this;
			this.selectMap = this.selectMap || {}, FX.Utils.forEach(this.items, function(t, i) {
				e.selectMap[i.groupId] = i
			})
		},
		_createSelectItem: function(t) {
			var i = FX.AuthGroupSelectPane.superclass._createSelectItem.apply(this, arguments);
			i && i.attr("data-id", t.groupId).prepend(e('<i class="select-icon icon-auth-group"/>'))
		},
		_addSelectItem: function(e) {
			var t = this.value;
			t.indexOf(e.groupId) < 0 && (t.push(e.groupId), this._createSelectItem(e))
		},
		_removeSelectItem: function(e) {
			var t = this.value,
				i = t.indexOf(e.groupId);
			i > -1 && (t.splice(i, 1), this.$selectList.find("[data-id=" + e.groupId + "]").remove())
		},
		_createSelectPane: function() {
			var t = FX.AuthGroupSelectPane.superclass._createSelectPane.apply(this, arguments),
				i = this;
			e('<div class="select-btn select"/>').click(function() {
				i._createAuthGroupList()
			}).text(i18next.t("auth.group")).appendTo(t), this.$selectPane = e('<div class="select-pane"/>').appendTo(this.element), this._createAuthGroupList(), this._bindAuthListEvent()
		},
		_createSearchList: function(t) {
			var i = this;
			this.$selectPane.children().hide(), this.$searchList ? this.$searchList.empty().show() : this.$searchList = e('<div class="select-search"/>').appendTo(this.$selectPane);
			var n = this.$searchList,
				a = [],
				o = new RegExp(FX.Utils.escapeRegexp(t), "i");
			if (FX.Utils.forEach(this.items, function(e, t) {
				o.test(t.name) && a.push(t)
			}), 0 === a.length) n.append(e('<span class="search-empty"/>').text(i18next.t("auth.group.empty")));
			else {
				var r = e('<ul class="search-list"/>').appendTo(n);
				FX.Utils.forEach(a, function(t, i) {
					e("<li />").text(i.name).data("data", i).appendTo(r)
				})
			}
			n.click(function(t) {
				var a = e(t.target).closest("li"),
					o = a.data("data");
				a.length > 0 && o && (n.hide(), i.$authGroupList.show(), i._createAuthGroupList([o]))
			})
		},
		_createAuthGroupList: function(t) {
			var i = this;
			t = t || this.items, this.$authGroupList ? this.$authGroupList.empty() : this.$authGroupList = e('<ul class="select-authgroup"/>').appendTo(this.$selectPane), FX.Utils.forEach(t, function(t, n) {
				var a = e("<li/>").data("authgroup", n).append(e("<span />").text(n.name)).append(e('<div class="select-check x-check"/>').append(e('<i class="icon-blank"/>'))).appendTo(i.$authGroupList);
				i.value.indexOf(n.groupId) > -1 && a.find(".select-check").addClass("select")
			})
		},
		_bindAuthListEvent: function() {
			var t = this;
			this.$authGroupList.click(function(i) {
				var n = e(i.target).closest("li"),
					a = n.children(".select-check");
				if (n.length > 0 && a.length > 0) {
					var o = n.data("authgroup");
					a.hasClass("select") ? (a.removeClass("select"), t._removeSelectItem(o)) : (a.addClass("select"), t._addSelectItem(o))
				}
			})
		},
		_getEditConfig: function() {
			return {
				widgetName: "authgroupSelect",
				type: "authgroupselectpane",
				value: this.getValue(),
				items: this.items,
				editable: !0
			}
		},
		_onStopEdit: function(e) {
			var t = this,
				i = this.options,
				n = e.getWidgetByName("authgroupSelect").getValue();
			return FX.Utils.applyFunc(t, i.onStopEdit, [n], !1), t.rebuild(n), !1
		},
		getValue: function() {
			var t = [];
			return e(".select-item", this.$selectList).each(function(i, n) {
				var a = e(n).attr("data-id");
				t.push(parseInt(a))
			}), t
		},
		refresh: function() {
			this._createAuthGroupList()
		},
		rebuild: function(e) {
			this.value = e, this._createContent()
		}
	}), e.shortcut("authgroupselectpane", FX.AuthGroupSelectPane)
}(jQuery), function(e) {
	FX.FormSetPane = FX.extend(FX.Widget, {
		_defaultConfig: function() {
			return e.extend(FX.FormSetPane.superclass._defaultConfig.apply(this, arguments), {
				baseCls: "fx_form_set_pane",
				perPage: 20
			})
		},
		_init: function() {
			FX.FormSetPane.superclass._init.apply(this, arguments), this.pageNow = 1, this._fetchData()
		},
		_fetchData: function() {},
		_renderMain: function(t) {
			var i = this,
				n = this.options,
				a = e(".pane-main", this.element);
			t.header && this._createHeader(t.header), 0 === a.length && (a = e('<div class="pane-main"/>').appendTo(this.element));
			var o = e(".main-wrapper", a);
			0 === o.length && (o = e('<div class="main-wrapper"/>').appendTo(a)), FX.Utils.forEach(t.items, function(t, n) {
				var a = e('<div class="main-item"/>').appendTo(o);
				!1 === FX.Utils.applyFunc(this, n.onCreate, [a, n], !1) && (FX.Utils.isObjectEmpty(n.title) || a.append(i._createTitleLine(n.title)), FX.Utils.forEach(n.lines, function(e, t) {
					a.append(i._createPaneLine(t))
				}))
			}), t.items.length === n.perPage ? 0 === e(".btn-more", a).length && e('<div class="btn-more">' + i18next.t("loadMore") + "</div>").on("click", function() {
				i._loadMore()
			}).appendTo(a) : e(".btn-more", a).remove()
		},
		_createTitleLine: function(t) {
			var i = this,
				n = !FX.Utils.isObjectEmpty(t.btns),
				a = e('<div class="item-title-line"/>'),
				o = e('<div class="title"/>').text(t.name).appendTo(a);
			if (t.sub) {
				o.addClass("has-sub");
				var r = e('<div class="sub-title"/>').appendTo(a);
				!1 === FX.Utils.applyFunc(this, t.sub.onCreate, [r, t.sub], !1) && r.append("<span>" + t.sub.info + "</span>")
			}
			return n && FX.Utils.forEach(t.btns, function(n, o) {
				o.href ? a.append('<a class="title-btn style-' + o.style + '" href="' + o.href + '" target="fx_form_set">' + o.name + "</a>") : e('<div class="title-btn style-' + o.style + '">' + o.name + "</div>").on("click", function(e) {
					FX.Utils.applyFunc(i, o.onClick, [t, e], !1)
				}).appendTo(a)
			}), a
		},
		_createPaneLine: function(t) {
			var i = e('<div class="pane-line"/>');
			return !1 === FX.Utils.applyFunc(this, t.onCreate, [i, t], !1) && i.text(t.info), i
		},
		_createHeader: function(t) {
			var i = this,
				n = e(".pane-header", this.element);
			if (!(n.length > 0)) {
				var a = t.hasBorder ? "has-border" : "";
				return n = e('<div class="pane-header ' + a + '"/>').appendTo(this.element), e('<div class="header-btn x-btn style-green"><i class="icon-add"></i>' + t.text + "</div>").on("click", function() {
					FX.Utils.applyFunc(i, t.onClick, [], !1)
				}).appendTo(n), n
			}
		},
		_rebuild: function() {
			this.element.empty(), this.pageNow = 1, this._fetchData()
		},
		_showTip: function(t) {
			e(".pane-main", this.element).append(e('<div class="message-tip"/>').append(t))
		},
		_loadMore: function() {
			this.pageNow++, this._fetchData()
		}
	})
}(jQuery), function(e) {
	FX.FormSetAuthPane = FX.extend(FX.Widget, {
		_defaultConfig: function() {
			return e.extend(FX.FormSetAuthPane.superclass._defaultConfig.apply(this, arguments), {
				baseCls: "fx_form_set_auth_pane",
				mode: "auth",
				entryId: "",
				entryItems: []
			})
		},
		_init: function() {
			FX.FormSetAuthPane.superclass._init.apply(this, arguments), this.groupId = 0, this._createAuthAdd(), this._createAuthPane(), this._createGroupList()
		},
		_createAuthPane: function() {
			this.$body = e('<div class="pane-main"/>').appendTo(this.element)
		},
		_createAuthAdd: function() {
			var t = this,
				i = e('<div class="header-btn x-btn style-green"><i class="icon-add"></i>' + i18next.t("data.auth.create") + "</div>").click(function() {
					FX.Utils.dt(FX.CONST.TRACKER.AUTH_GROUP_CREATE), t._createConfigDialog()
				});
			e('<div class="pane-header has-border"></div>').append(i).appendTo(this.element)
		},
		_createAuthGroup: function(t, i) {
			var n, a = this,
				o = this.options;
			return n = "custom" === i ? e("<div/>").prependTo(this.$body) : e("<div/>").appendTo(this.$groupList), this.groupId = Math.max(this.groupId, t.groupId), new FX.AuthGroupPane(e.extend(t, {
				authType: i,
				customCls: "main-item",
				mode: o.mode,
				renderEl: n,
				onEditAuth: function() {
					var e = {
						hasMember: !1,
						hasDetail: !0
					};
					a._getAuthConfig(this, e, function(e, t) {
						a._createConfigDialog(e, t)
					})
				},
				onEditMember: function(e) {
					var t = {
						hasMember: !0,
						hasDetail: !1
					};
					a._getAuthConfig(this, t, function(t, i) {
						e.rebuild(i.members), e.createEditDialog()
					})
				},
				onAfterEditMember: function(e, t) {
					a._saveAuthGroup({
						groupId: t,
						members: e
					}, this)
				}
			}))
		},
		_createGroupList: function() {
			var t = this,
				i = this.options,
				n = "auth" === i.mode ? FX.CONST.AUTH_GROUP_CONTENT : FX.CONST.FLOW_AUTH_GROUP_CONTENT;
			this.$groupList = e('<div class="main-wrapper"/>').appendTo(this.$body), this.groupList = {}, FX.Utils.forEach(n, function(e, i) {
				t.groupList[i.groupId] = t._createAuthGroup(i, "default")
			}), FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.auth_group.list, FX.STATIC.APPID, i.entryId)
			}, function(i) {
				FX.Utils.forEach(i.authGroups, function(i, n) {
					if (n.groupId < 0) {
						var a = t.groupList[n.groupId];
						a && (e.extend(a.options, n), a.rebuild())
					} else t._createAuthGroup(n, "custom")
				})
			})
		},
		_getAttrFields: function() {
			var e = this.options;
			if (this.attrFields) return this.attrFields;
			var t = ["creator", "createTime", "updateTime"];
			e.hasExtParams && t.push("ext"), "flow" === e.mode && t.push("flowState", "chargers");
			var i = [];
			return FX.Utils.forEach(t, function(t, n) {
				var a = FX.Utils.createEntryAttributeField(n, {
					entryId: e.entryId
				});
				a && i.push({
					label: a.text,
					widget: {
						widgetName: a.name
					}
				})
			}), this.attrFields = i, i
		},
		_getAuthConfig: function(e, t, i) {
			var n = e.options.groupId;
			if (!n) return i(e);
			var a = this.options;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.auth_group.get_config, FX.STATIC.APPID, a.entryId, n),
				data: t
			}, function(t) {
				var n = t.authGroup;
				n.dataAuthFields = n.dataAuth, i(e, n)
			})
		},
		_createConfigDialog: function(e, t) {
			var i = this;
			this.options;
			t = t || {}, this.auth = t, new FX.ConfirmDialog({
				title: e ? i18next.t("data.auth.edit") : i18next.t("data.auth.add"),
				customCls: "auth-dialog",
				text4Ok: i18next.t("save"),
				width: 560,
				hasPadding: !1,
				onContentCreate: function(e) {
					i._createContent(e)
				},
				onOk: function() {
					if (!i.widgetMap.name.checkValidate()) return i._switchTab("name"), void FX.Msg.toast({
						msg: i18next.t("data.auth.required"),
						type: "warning"
					});
					if (i.widgetMap.optAuth.checkValidate()) {
						if (i.widgetMap.fieldAuth.checkValidate(!0)) {
							var n = {};
							return n.groupId = FX.Utils.isNull(t.groupId) ? ++i.groupId : t.groupId, n.dataAuth = FX.Utils.dealFormFilterCond(i.widgetMap.dataAuth.getValue()), n.name = i.widgetMap.name.getValue(), n.desc = i.widgetMap.desc.getValue(), n.dataPerms = i.widgetMap.optAuth.getValue(), n.optAuth = i.widgetMap.fieldAuth.getValue(), i._saveAuthGroup(n, e), !1
						}
						i._switchTab("fieldAuth")
					} else i._switchTab("optAuth")
				}
			}).show()
		},
		_createContent: function(e) {
			var t = this.options;
			this.widgetMap = {}, "auth" === t.mode ? this._createAuthContent().appendTo(e) : this._createFlowContent().appendTo(e), this._switchTab("name")
		},
		_createAuthContent: function() {
			var t = e('<div class="auth-content"/>'),
				i = e('<div class="auth-menu"/>').append(e('<div class="menu-item"/>').text(i18next.t("data.auth.name")).attr("role", "name")).append(e('<div class="menu-item"/>').text(i18next.t("data.auth.options")).attr("role", "optAuth")).append(e('<div class="menu-item"/>').text(i18next.t("field.auth")).attr("role", "fieldAuth")).append(e('<div class="menu-item"/>').text(i18next.t("data.auth")).attr("role", "dataAuth")).appendTo(t);
			return this._bindMenuEvent(i), this.$content = e('<div class="content-main"/>').appendTo(t), this._createNameInfo(), this._createOptAuth(), this._createFieldAuth(), this._createDataAuth(), t
		},
		_createFlowContent: function() {
			var t = e('<div class="auth-content"/>'),
				i = e('<div class="auth-menu"/>').append(e('<div class="menu-item"/>').text(i18next.t("data.auth.name")).attr("role", "name")).append(e('<div class="menu-item"/>').text(i18next.t("data.auth.options")).attr("role", "optAuth")).append(e('<div class="menu-item"/>').text(i18next.t("field.auth")).attr("role", "fieldAuth")).append(e('<div class="menu-item"/>').text(i18next.t("data.auth")).attr("role", "dataAuth")).appendTo(t);
			return this._bindMenuEvent(i), this.$content = e('<div class="content-main"/>').appendTo(t), this._createNameInfo(), this._createOptAuth(), this._createFieldAuth(), this._createDataAuth(), t
		},
		_switchTab: function(t) {
			this.options;
			switch (e(".menu-item[role=" + t + "]").addClass("select").siblings().removeClass("select"), this.$content.children().hide(), t) {
			case "name":
				this.$nameInfo.show();
				break;
			case "optAuth":
				this.$optAuth.show();
				break;
			case "fieldAuth":
				this.$fieldAuth.show();
				break;
			case "dataAuth":
				this.$dataAuth.show()
			}
		},
		_bindMenuEvent: function(t) {
			var i = this;
			t.on("click", ".menu-item", function(t) {
				var n = e(t.currentTarget);
				i._switchTab(n.attr("role"))
			})
		},
		_createNameInfo: function() {
			this.$nameInfo = e('<div class="content-pane name-info"/>').appendTo(this.$content), e('<div class="desc"/>').text(i18next.t("data.auth.name.title")).appendTo(this.$nameInfo), this.widgetMap.name = new FX.TextEditor({
				renderEl: e("<div />").appendTo(this.$nameInfo),
				customCls: "auth-item",
				waterMark: i18next.t("data.auth.name.placeholder"),
				allowBlank: !1,
				value: this.auth.name,
				width: "100%"
			}), this.widgetMap.desc = new FX.TextArea({
				renderEl: e("<div />").appendTo(this.$nameInfo),
				customCls: "auth-item",
				waterMark: i18next.t("data.auth.description.placeholder"),
				value: this.auth.desc,
				width: "100%",
				height: 265
			})
		},
		_createOptAuth: function() {
			var t = this,
				i = this.options;
			this.$optAuth = e('<div class="content-pane operation-auth"/>').appendTo(this.$content);
			var n = "";
			n = "auth" === i.mode ? i18next.t("data.auth.options.coopTitle") : i18next.t("data.auth.options.flowTitle"), e('<div class="desc"/>').text(n).appendTo(this.$optAuth), this.widgetMap.optAuth = new FX.OperationAuth({
				renderEl: e("<div />").appendTo(this.$optAuth),
				mode: i.mode,
				value: this.auth.dataPerms,
				onAfterClick: function(e, n) {
					var a = e.hasClass("select"),
						o = t.widgetMap.fieldAuth,
						r = "flow" === i.mode ? "flow_read" : "read",
						s = "flow" === i.mode ? "flow_update" : "update";
					a || n !== r || o.setSelectAll("visible", !1), a || n !== s || o.setSelectAll("enable", !1)
				}
			})
		},
		_createFieldAuth: function() {
			var t = this,
				i = this.options;
			this.$fieldAuth = e('<div class="content-pane field-auth"/>').appendTo(this.$content), e('<div class="desc"/>').text(i18next.t("data.auth.field.title")).appendTo(this.$fieldAuth), this.widgetMap.fieldAuth = new FX.FieldAuthPane({
				renderEl: e("<div />").appendTo(this.$fieldAuth),
				customCls: "no-border",
				items: i.entryItems.concat(this._getAttrFields()),
				value: this.auth.optAuth,
				mode: "auth",
				onAfterEdit: function(e, n) {
					var a = t.widgetMap.optAuth,
						o = "flow" === i.mode ? "flow_read" : "read",
						r = "flow" === i.mode ? "flow_update" : "update";
					"visible" === e && n ? a.setSelected(o) : "enable" === e && n && a.setSelected(r)
				}
			})
		},
		_createDataAuth: function() {
			var t = this.options;
			this.$dataAuth = e('<div class="content-pane field-auth"/>').appendTo(this.$content), e('<div class="desc"/>').text(i18next.t("data.auth.title")).appendTo(this.$dataAuth);
			var i = this.auth.dataAuthFields;
			this.widgetMap.dataAuth = new FX.FilterPane({
				renderEl: e("<div/>").appendTo(e('<div class="filter-pane"/>').appendTo(this.$dataAuth)),
				forms: [t.entryId],
				fields: FX.Utils.pretreatFormFilterCond(i && i.cond),
				rel: i && i.rel,
				supportSubform: !1,
				attributeFields: ["creator", "updateTime", "createTime", "flowState"],
				onGetFormFields: function(e) {
					return "flow" === t.mode && FX.Utils.forEach(e, function(e, t) {
						t.fields && t.fields.push({
							type: "flowstate",
							name: "flowState",
							text: i18next.t("field.flowState")
						})
					}), e
				}
			})
		},
		_saveAuthGroup: function(t, i) {
			var n = this,
				a = this.options;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.auth_group.update, FX.STATIC.APPID, a.entryId),
				data: t
			}, function(a, o) {
				FX.Msg.toast({
					type: "success",
					msg: i18next.t("saveInfo.success")
				}), i ? (e.extend(i.options, t), i.rebuild()) : n._createAuthGroup(t, "custom")
			}, function() {
				FX.Msg.toast({
					type: "error",
					msg: i18next.t("saveInfo.fail")
				})
			})
		}
	})
}(jQuery), function(e) {
	FX.FormSetLabelPane = FX.extend(FX.FormSetPane, {
		_fetchData: function() {
			var t = this,
				i = this.options;
			this.fieldItems = t._addSystemFields(i.formItems.slice()), FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.data_label.get, FX.STATIC.APPID, FX.STATIC.ENTRYID)
			}, function(i) {
				t.dataLabel = i;
				var n = [];
				n.push({
					lines: [{
						mode: i.mode,
						temp: i.template,
						fieldItems: t.fieldItems,
						onCreate: function(i, n) {
							t.$mode = new FX.RadioGroup({
								renderEl: e('<div class="data-label-type"/>').appendTo(i),
								items: [{
									value: "first_field",
									text: i18next.t("data.label.firstField")
								}, {
									value: "template",
									text: i18next.t("data.label.custom")
								}],
								allowDeselect: !1,
								onAfterItemSelect: function() {
									this.getValue() || this.setValue("first_field"), "template" === this.getValue() ? (t.$editor.show(), t.$addFieldBtn.show()) : (t.$editor.hide(), t.$addFieldBtn.hide())
								}
							}), t.$editor = e('<div class = "field-editor has-watermark"/>').attr("data-watermark", i18next.t("data.label.tip")).appendTo(i), t.$editMain = CodeMirror(t.$editor[0], {
								textWrapping: !0,
								lineWrapping: !0,
								lineNumbers: !1,
								specialChars: /[-­‌-‏  ﻿]/,
								mode: "label"
							}), t.$editMain.on("change", function(e) {
								var i = !1;
								FX.Utils.isEmpty(e.getValue()) && (i = !0), t.$editor.toggleClass("has-watermark", i)
							}), t.$addFieldBtn = e('<div class="add-field"><i class="icon-add"></i>' + i18next.t("data.label.add.field") + "</div>").click(function() {
								var a = e('<div class="field-select"/>').appendTo(i);
								new FX.LabelFieldSelectPane({
									renderEl: a,
									fields: [],
									availableFields: FX.LimitFields.dataLabel,
									fieldItems: n.fieldItems,
									onFieldSelect: function(e) {
										t.addField(e)
									}
								}), a.addClass("active"), e(document).bind("mousedown.field-select", function(t) {
									var i = t.target,
										n = e(i).closest(".fx_field_select_pane");
									(!n || n.length <= 0) && (a.remove(), e(document).unbind("mousedown.field-select"))
								})
							}).appendTo(i)
						}
					}]
				}, {
					lines: [{
						onCreate: function(i, n) {
							e('<div class="save-btn x-btn style-green">' + i18next.t("saveInfo.setting") + "</div>").on("click", function() {
								t.doSave(function() {
									FX.Msg.toast({
										type: "success",
										msg: i18next.t("saveInfo.success")
									})
								}, function() {
									FX.Msg.toast({
										type: "error",
										msg: i18next.t("saveInfo.fail")
									})
								})
							}).appendTo(i)
						}
					}]
				}), t._renderMain({
					items: n
				}), t.$mode.setValue(i.mode), t.setTemplate(i.template), "first_field" === t.$mode.getValue() && (t.$editor.hide(), t.$addFieldBtn.hide())
			})
		},
		checkValidate: function(e) {
			var t = !0;
			if ("template" === e.mode) if (0 === e.template.length) t = !1, FX.Msg.toast({
				msg: i18next.t("data.label.required"),
				type: "warning"
			});
			else {
				var i = e.template.match(/\${\w+}/g),
					n = i ? i.length : 0;
				n ? n > 20 && (t = !1, FX.Msg.toast({
					msg: i18next.t("data.label.fail2"),
					type: "warning"
				})) : (t = !1, FX.Msg.toast({
					msg: i18next.t("data.label.fail1"),
					type: "warning"
				}))
			}
			return t
		},
		addField: function(t) {
			this.options;
			if (t) {
				var i = "${" + t.widget.widgetName + "}",
					n = this.$editMain.getCursor();
				this.$editMain.replaceSelection(t.label);
				var a = this.$editMain.getCursor(),
					o = {
						"field-name": i
					};
				e(this.$editMain.markText(n, a, {
					handleMouseEvents: !0,
					atomic: !0,
					replacedWith: e('<span class="cm-field field-item"/>').text(t.label)[0]
				}).widgetNode).attr(o).addClass("field-item"), this.$editMain.focus()
			}
		},
		getTemplate: function() {
			var t = "",
				i = e(this.$editMain.display.lineDiv).find(".CodeMirror-line-content");
			return FX.Utils.forEach(i.contents(), function(i, n) {
				e(n).hasClass("field-item") ? t += e(n).attr("field-name") : 3 === n.nodeType && (t += n.textContent)
			}), t.trim()
		},
		setTemplate: function(e) {
			var t = this,
				i = this.options;
			if (this.$editMain.setValue(""), e.length) {
				var n = e.split(/\s+/);
				FX.Utils.forEach(n, function(e, a) {
					if (t._hasFieldItem(a)) {
						var o = /\${[^}]*}|[^\${]+/g,
							r = a.match(o);
						FX.Utils.forEach(r, function(e, n) {
							t._isFieldItem(n) ? (t._setItemMap(), t.addField(i.itemMap[n.slice(2, -1)])) : t.$editMain.replaceSelection(n)
						})
					} else t.$editMain.replaceSelection(a);
					e !== n.length - 1 && t.$editMain.replaceSelection(" ")
				})
			}
		},
		_setItemMap: function() {
			var e = this.options;
			e.itemMap || (e.itemMap = {}, FX.Utils.forEach(this.fieldItems, function(t, i) {
				e.itemMap[i.widget.widgetName] = i
			}))
		},
		compareDataLabel: function() {
			return !this.$mode || !this.dataLabel || this.$mode.getValue() === this.dataLabel.mode && this.getTemplate() === this.dataLabel.template
		},
		doSave: function(e, t) {
			var i = this,
				n = this.$mode.getValue(),
				a = this.getTemplate();
			this.setTemplate(a);
			var o = {
				mode: n,
				template: a
			};
			this.checkValidate(o) && FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.data_label.set, FX.STATIC.APPID, FX.STATIC.ENTRYID),
				data: o
			}, function() {
				i.dataLabel = o, e && e()
			}, function() {
				t && t()
			})
		},
		_hasFieldItem: function(e) {
			return /\${\w+}/.test(e)
		},
		_isFieldItem: function(e) {
			return /^\${\w+}/.test(e)
		},
		_addSystemFields: function(e) {
			var t = [{
				widget: {
					widgetName: "creator"
				},
				label: i18next.t("field.creator")
			}, {
				widget: {
					widgetName: "createTime"
				},
				label: i18next.t("field.createTime")
			}, {
				widget: {
					widgetName: "updateTime"
				},
				label: i18next.t("field.updateTime")
			}];
			return e.concat(t)
		}
	})
}(jQuery), function(e) {
	FX.FormSetSubmitPane = FX.extend(FX.FormSetPane, {
		_defaultConfig: function() {
			return e.extend(FX.FormSetSubmitPane.superclass._defaultConfig.apply(this, arguments), {
				maxImageCount: 10,
				maxWords: 200,
				defaultContent: '<p style="text-align:center;"><img src="https://images.jiandaoyun.com/FsFPoEFaKSQuwK4s8x40ZHN0EbBl" style="max-width:100%; width:130px; height:130px;"><br></p><p style="text-align:center;"><span style="font-size:22px; color:#0DB3A6;">' + i18next.t("submit.success") + "</span><br></p>"
			})
		},
		_fetchData: function() {
			var t = this,
				i = this.options;
			this.mode = "system", this.hasAddBtn = !0, this.content = "", this.fields = this._addSystemFields(i.formItems.slice()), this.imgCount = 0, this.words = 0, FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.submit_prompt.get, FX.STATIC.APPID, FX.STATIC.ENTRYID)
			}, function(n) {
				var a = [];
				t.mode = n.mode, t.hasAddBtn = n.hasAddBtn, t.content = FX.Utils.isEmpty(n.content) ? i.defaultContent : n.content, t.oriConfig = {
					mode: t.mode,
					hasAddBtn: t.hasAddBtn
				}, a.push({
					lines: [{
						onCreate: function(e) {
							t._renderEdit(e), t._setWordsText()
						}
					}]
				}, {
					lines: [{
						onCreate: function(i) {
							new FX.Button({
								renderEl: e("<div/>").appendTo(i),
								height: 30,
								width: 100,
								text: i18next.t("saveInfo.setting"),
								style: "green",
								onClick: function() {
									t.doSave()
								}
							})
						}
					}]
				}), t._renderMain({
					items: a
				})
			})
		},
		_renderEdit: function(t) {
			var i = this,
				n = this.options;
			e('<div class="line-label"/>').text(i18next.t("data.submitPrompt.label")).appendTo(t), new FX.RadioGroup({
				renderEl: e('<div class="data-label-type"/>').appendTo(t),
				allowBlank: !1,
				items: [{
					value: "system",
					text: i18next.t("data.submitPrompt.system")
				}, {
					value: "custom",
					text: i18next.t("data.submitPrompt.custom")
				}],
				value: this.mode,
				allowDeselect: !1,
				onAfterItemSelect: function() {
					var e = this.getValue();
					if (e) {
						if ("custom" === e && !FX.Vip.hasSubmitPrompt()) return FX.Vip.showUpgradeTip({
							code: FX.CONST.VIP_ERR_NAME_MAP.SUBMIT_PROMPT
						}), void this.setValue("system");
						i.mode = e, i._switchMode()
					} else this.setValue(i.mode)
				},
				onItemCreate: function(e, t) {
					"custom" === e.value && new FX.Tooltip({
						renderEl: t,
						text: i18next.t("data.submitPrompt.tip"),
						style: "info",
						tipWidth: 250
					})
				}
			}), this.$mode = e("<div/>").appendTo(t);
			var a = e("<div/>").appendTo(this.$mode);
			this.content = this._formatContent("text"), this.oriConfig.content = this.content, new FX.RichText({
				renderEl: a,
				width: 692,
				minHeight: 230,
				value: this.content,
				customInsert: {
					items: this.fields,
					btnText: i18next.t("data.submitPrompt.insert"),
					expAttr: [{
						attr: "widget-name",
						key: "value"
					}, {
						attr: "widget-type",
						key: "type"
					}]
				},
				custombar: ["field_insert"],
				onAfterEdit: function() {
					var e = i.content;
					i.content = this.getValue(), i.words = 0, i._formatContent("words"), i._setWordsText(), i.words > n.maxWords && (this.reset(), this.setValue(e))
				},
				onBeforeInsertPic: function() {
					return i.imgCount = 0, i._formatContent("img"), i.imgCount >= n.maxImageCount && (FX.Msg.toast({
						type: "warning",
						msg: i18next.t("error.3036")
					}), !0)
				}
			}), this._createFooter(a), new FX.CheckBox({
				renderEl: e("<div/>").appendTo(this.$mode),
				value: this.hasAddBtn,
				customCls: "data-label-type",
				text: i18next.t("data.submitPrompt.nextTip"),
				onStateChange: function() {
					i.hasAddBtn = this.getValue()
				}
			}), this._switchMode()
		},
		_createFooter: function(t) {
			var i = e('<div class="rich-footer"/>').appendTo(t);
			this.$footerText = e("<span/>").appendTo(i), new FX.Tooltip({
				renderEl: i,
				tipWidth: 250,
				style: "info",
				text: i18next.t("data.submitPrompt.maxWordCount")
			})
		},
		_setWordsText: function() {
			var e = this.options,
				t = Math.max(e.maxWords - this.words, 0);
			this.$footerText && this.$footerText.length && this.$footerText.text(i18next.t("data.submitPrompt.wordsCount", {
				words: t
			}))
		},
		_switchMode: function() {
			"system" === this.mode ? this.$mode.addClass("x-ui-hidden") : this.$mode.removeClass("x-ui-hidden")
		},
		doSave: function(e) {
			var t = this;
			this.checkValidate() && FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.submit_prompt.set, FX.STATIC.APPID, FX.STATIC.ENTRYID),
				data: {
					content: this._formatContent("data"),
					mode: this.mode,
					hasAddBtn: this.hasAddBtn
				}
			}, function() {
				e && e(), t.oriConfig = {
					content: t.content,
					mode: t.mode,
					hasAddBtn: t.hasAddBtn
				}, FX.Msg.toast({
					type: "success",
					msg: i18next.t("saveInfo.success")
				})
			}, function() {
				FX.Msg.toast({
					type: "error",
					msg: i18next.t("saveInfo.fail")
				})
			})
		},
		_formatContent: function(t) {
			if (this.content) {
				var i = document.createElement("div");
				return i.innerHTML = this.content, this._compileElement(i, t), e(i).html()
			}
		},
		_compileElement: function(t, i) {
			var n = t.childNodes,
				a = this;
			FX.Utils.forEach(n, function(t, n) {
				if (n.childNodes && n.childNodes.length) a._compileElement(n, i);
				else {
					var o = n.textContent,
						r = /\$\{(.*)\}/;
					if (a._isTextNode(n)) if (r.test(o)) {
						var s = e(n).closest("span");
						if (s && s.length) {
							var l = s[0];
							switch (i) {
							case "data":
								a._compileToData(l, s.html(), RegExp.$1);
								break;
							case "text":
								a._compileToText(l, s.html(), RegExp.$1);
								break;
							case "words":
								a._compileWords(l, o, RegExp.$1)
							}
						} else "words" === i && (a.words += o.length)
					} else "words" === i && (a.words += o.length)
				}
				a._isElementNode(n) && "img" === i && a._isImgNode(n) && a.imgCount++
			})
		},
		_compileToData: function(e, t, i) {
			var n = e.attributes,
				a = this;
			FX.Utils.forEach(n, function(n, o) {
				var r = o.name;
				if (a._isDirective(r)) {
					var s = o.value;
					t = t.replace("${" + i + "}", "${" + s + "}"), e.innerHTML = t, e.removeAttribute(r)
				}
			})
		},
		_compileToText: function(e, t, i) {
			var n = !1,
				a = "",
				o = "";
			if (FX.Utils.forEach(this.fields, function(e, t) {
				if (t.value === i) return a = t.label, o = t.type, n = !0, !1
			}), n) {
				var r = new RegExp(i);
				t = t.replace(r, a), e.innerHTML = t, e.setAttribute("widget-name", i), e.setAttribute("widget-type", o)
			} else / _widget_ / .test(i) && (e.innerHTML = "")
		},
		_compileWords: function(e, t, i) {
			var n = e.attributes,
				a = this;
			FX.Utils.forEach(n, function(n, o) {
				var r = o.name;
				if (a._isDirective(r)) {
					switch (e.getAttribute("widget-type")) {
					case "text":
					case "combo":
					case "radiogroup":
					case "number":
						a.words += 10;
						break;
					case "textarea":
					case "combocheck":
					case "checkboxgroup":
					case "datetime":
					case "dept":
						a.words += 20;
						break;
					case "location":
					case "address":
						a.words += 40;
						break;
					case "user":
						a.words += 8;
						break;
					case "usergroup":
					case "deptgroup":
						a.words += 30
					}
					var s = t.replace("${" + i + "}", "");
					a.words += s.length
				}
			})
		},
		_isDirective: function(e) {
			return 0 === e.indexOf("widget-name")
		},
		_isElementNode: function(e) {
			return 1 === e.nodeType
		},
		_isTextNode: function(e) {
			return 3 === e.nodeType
		},
		_isImgNode: function(e) {
			return this._isElementNode(e) && "IMG" === e.tagName
		},
		checkValidate: function() {
			return !0
		},
		_addSystemFields: function(e) {
			var t = [{
				text: "${" + i18next.t("field.creator") + "}",
				label: i18next.t("field.creator"),
				value: "creator",
				type: "user"
			}, {
				text: "${" + i18next.t("field.createTime") + "}",
				label: i18next.t("field.createTime"),
				value: "createTime",
				type: "datetime"
			}, {
				text: "${" + i18next.t("field.updateTime") + "}",
				label: i18next.t("field.updateTime"),
				value: "updateTime",
				type: "datetime"
			}],
				i = [];
			return FX.Utils.forEach(e, function(e, t) {
				FX.LimitFields.dataLabel.indexOf(t.widget.type) > -1 && i.push({
					text: "${" + t.label + "}",
					label: t.label,
					value: t.widget.widgetName,
					type: t.widget.type
				})
			}), i.concat(t)
		},
		compareCustomSubmit: function() {
			var e = this.oriConfig;
			return !e || e.mode === this.mode && e.hasAddBtn === this.hasAddBtn && e.content === this.content
		}
	})
}(jQuery), function(e) {
	FX.FormSetPrintPane = FX.extend(FX.FormSetPane, {
		_fetchData: function() {
			var t = this,
				i = this.options,
				n = (this.pageNow - 1) * i.perPage;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.print_tmp.list, FX.STATIC.APPID, FX.STATIC.ENTRYID),
				data: {
					skip: n,
					limit: i.perPage
				}
			}, function(i) {
				var n = {
					btns: {
						remove: {
							name: i18next.t("delete"),
							style: "red",
							onClick: function(e) {
								t._removeTemplate(e)
							}
						}
					}
				},
					a = [];
				FX.Utils.forEach(i.templates, function(o, r) {
					var s = [];
					s.push(n.btns.remove);
					var l = {
						name: i18next.t("edit"),
						style: "green "
					};
					i.isPrintExceed ? l.onClick = function() {
						FX.Vip.showUpgradeTip({
							code: FX.CONST.VIP_ERR_NAME_MAP.PRINT
						}, !1)
					} : l.href = "/dashboard/app/" + FX.STATIC.APPID + "/form/" + FX.STATIC.ENTRYID + "/pt/" + r.printId + "/edit", s.push(l), a.push({
						title: {
							name: r.name,
							printId: r.printId,
							btns: s
						},
						lines: [{
							temp: r,
							onCreate: function(i, n) {
								var a = n.temp,
									o = !0;
								a.active && (o = !1, e('<span class="line-btn btn-warning">' + i18next.t("form.data.manage") + "</span>").on("click", function() {
									t._showPrintView(a.printId, a.name, "data")
								}).appendTo(i)), a.flow_usage && a.flow_usage > 0 && (o = !1, e('<span class="line-btn btn-success">' + i18next.t("flow.node") + '<span class="badge">' + a.flow_usage + "</span></span>").on("click", function() {
									t._showPrintView(a.printId, a.name, "flow")
								}).appendTo(i)), a.group_usage && a.group_usage > 0 && (o = !1, e('<span class="line-btn btn-info">' + i18next.t("form.data.auth") + '<span class="badge">' + a.group_usage + "</span></span>").on("click", function() {
									t._showPrintView(a.printId, a.name, "auth")
								}).appendTo(i)), o && e('<span class="line-btn btn-default">' + i18next.t("data.printTemplate.emptyTip") + "</span>").appendTo(i)
							}
						}]
					})
				}), t._renderMain({
					header: {
						text: i18next.t("data.printTemplate.create"),
						onClick: function() {
							FX.Utils.dt(FX.CONST.TRACKER.PRINT_CREATE), t._createTemplate()
						},
						hasBorder: 0 !== i.templates.length
					},
					items: a
				})
			})
		},
		_showPrintView: function(e, t, i) {
			var n = this.options;
			new FX.PrintViewDialog({
				view: i,
				printName: t,
				currentVersion: n.currentVersion,
				versions: n.flowVersion,
				printId: e
			}).show()
		},
		_createTemplate: function() {
			var e = this;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.print_tmp.create, FX.STATIC.APPID, FX.STATIC.ENTRYID),
				data: {
					name: i18next.t("print.name")
				}
			}, function(t) {
				e._rebuild()
			}, function(e) {
				var t = e.responseJSON || {};
				FX.Vip.showUpgradeTip(t)
			})
		},
		_removeTemplate: function(e) {
			var t = this;
			FX.Msg.alert({
				msg: i18next.t("data.printTemplate.deleteMsg"),
				title: i18next.t("delete.confirm", {
					name: e.name
				}),
				onOk: function() {
					FX.Utils.ajax({
						url: FX.Utils.getApi(FX._API.form.print_tmp.remove, FX.STATIC.APPID, FX.STATIC.ENTRYID, e.printId)
					}, function(e) {
						t._rebuild()
					})
				}
			})
		}
	})
}(jQuery), function(e) {
	FX.FormSetNotifyPane = FX.extend(FX.FormSetPane, {
		_fetchData: function() {
			var e = this,
				t = this.options,
				i = (this.pageNow - 1) * t.perPage;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.notify.list, FX.STATIC.APPID, FX.STATIC.ENTRYID),
				data: {
					skip: i,
					limit: t.perPage
				}
			}, function(t) {
				var i = [],
					n = {
						header: {
							text: i18next.t("data.notify.create"),
							onClick: function() {
								e._showConfig()
							}
						}
					};
				FX.Utils.forEach(t.notify_list, function(t, n) {
					i.push(e._createItem(n))
				}), n.items = i, n.header.hasBorder = !FX.Utils.isObjectEmpty(i), e._renderMain(n)
			})
		},
		_createItem: function(e) {
			if (!FX.Utils.isObjectEmpty(e)) {
				var t = this;
				return {
					title: {
						name: e.message,
						btns: [{
							style: "red",
							name: i18next.t("delete"),
							onClick: function(i, n) {
								FX.Msg.alert({
									title: i18next.t("data.notify.delete.confirm"),
									msg: i18next.t("data.notify.delete.msg"),
									onOk: function() {
										t._remove(e, n)
									}
								})
							}
						}, {
							style: "green",
							name: i18next.t("edit"),
							onClick: function(i, n) {
								t._showConfig(e, n)
							}
						}, {
							style: "green",
							name: e.enabled ? '<i class="icon-video-pause"/>' + i18next.t("pause") : '<i class="icon-flow-start"/>' + i18next.t("enable"),
							onClick: function(i, n) {
								t._active(e, n)
							}
						}]
					},
					onCreate: function(i) {
						return t._createLineWatermark(i, e), !1
					},
					lines: t._createLines(e)
				}
			}
		},
		_createLineWatermark: function(t, i) {
			var n = i18next.t("paused"),
				a = "style-yellow";
			i.enabled && (n = i18next.t("activated"), a = "style-green"), t.addClass("custom-item").append(e('<div class="pane-watermark"><div class="text">' + n + "</div></div>").addClass(a))
		},
		_createLines: function(t) {
			var i = this,
				n = this.options,
				a = [{
					info: i18next.t("data.notify.time") + "：",
					onCreate: function(n, a) {
						var o, r = a.info;
						switch (t.mode) {
						case "create":
							r += i18next.t("data.notify.dataCreate");
							break;
						case "update":
							r += i._getUpdateNotifyText(t.modify_fields);
							break;
						case "custom":
							t.time && (r += i18next.t("data.notify.customRange", {
								time: FX.Utils.date2Str(new Date(t.time.custom), "yyyy-MM-dd HH:mm:ss")
							}), o = i._formatRepeatTime(t.time.repeat), FX.Utils.isEmpty(o) || (r += i18next.t("data.notify.customRange.repeat", {
								repeat: o,
								time: FX.Utils.date2Str(new Date(t.time.finish), "yyyy-MM-dd HH:mm:ss")
							})));
							break;
						case "widget":
							switch (r += i18next.t("data.notify.widgetLabel", {
								label: i._getWidgetLabel(t.time.widget)
							}), t.time.widget_type) {
							case "date":
								FX.Utils.isEmpty(t.time.offset) || "0" === t.time.offset ? r += i18next.t("data.notify.today") : r += i._formatOffsetTime(t.time.offset) + "，", r += i18next.t("data.notify.widgetResult", {
									time: t.time.daytime
								});
								break;
							case "datetime":
								FX.Utils.isEmpty(t.time.offset) ? r += i18next.t("data.notify.current") : r += i18next.t("data.notify.offsetTime", {
									time: i._formatOffsetTime(t.time.offset)
								})
							}
							t.time.repeat && "never" !== t.time.repeat && (r += i18next.t("data.notify.customRange.repeat", {
								repeat: i._formatRepeatTime(t.time.repeat),
								time: FX.Utils.date2Str(new Date(t.time.finish), "yyyy-MM-dd HH:mm:ss")
							}))
						}
						n.append(e('<span class="line-wrapper"/>').append(r))
					}
				}];
			return "custom" !== t.mode && "auth_group" !== t.target.type && a.push({
				info: i18next.t("data.notify.condition") + "：",
				onCreate: function(n, a) {
					var o = a.info;
					FX.Utils.isObjectEmpty(t.data_filter && t.data_filter.cond) ? o += i18next.t("data.any") : o += i._formatDataFilter(t.data_filter, n), n.append(e("<span/>").text(o))
				}
			}), a.push({
				info: i18next.t("data.notifier"),
				onCreate: function(n, a) {
					var o = a.info;
					if (t.target) switch (t.target.type) {
					case "member":
						var r = [].concat(t.target.departs, t.target.users, t.target.roles),
							s = [];
						FX.Utils.forEach(r, function(e, t) {
							t && s.push(t.name)
						});
						var l = t.target.widgets.concat(t.target.deptWidgets);
						FX.Utils.forEach(l, function(e, t) {
							s.push(i._getWidgetLabel(t))
						}), o += s.join("、");
						break;
					case "auth_group":
						var d = [];
						FX.Utils.forEach(t.target.groups, function(e, t) {
							d.push(t.name)
						}), o += d.join("、")
					}
					n.append(e("<span/>").text(o))
				}
			}), a.push({
				info: i18next.t("data.notify.type") + "：",
				onCreate: function(i, a) {
					i.append("<span>" + a.info + "</span>"), FX.Utils.forEach(t.channels, function(t, a) {
						var o = e("<i/>"),
							r = "";
						switch (a) {
						case "wechat":
							n.isWechatAdmin || n.isDingtalkAdmin || (o = e('<i class="icon-wechat style-green"></i>'), r = i18next.t("wechat"));
							break;
						case "wework":
							n.isWechatAdmin && (o = e('<i class="icon-function-qy style-cyan"></i>'), r = i18next.t("wework"));
							break;
						case "dingtalk":
							n.isDingtalkAdmin && (o = e('<i class="icon-dingtalk style-blue-dark"></i>'), r = i18next.t("dingtalk"));
							break;
						case "mail":
							o = e('<i class="icon-register-mail style-blue"></i>'), r = i18next.t("email")
						}
						o.hover(function(t) {
							FX.UI.showPopover({
								anchor: e(t.currentTarget),
								content: e("<span/>").text(r),
								type: "dark"
							})
						}, function() {
							FX.UI.closePopover()
						}).appendTo(i)
					})
				}
			}), a
		},
		_getWidgetLabel: function(e) {
			var t = this.options,
				i = "";
			return FX.Utils.forEach(t.formItems, function(t, n) {
				if (n.widget.widgetName === e) return i = n.label, !1
			}), i
		},
		_formatRepeatTime: function(e) {
			switch (e) {
			case "1d":
				return i18next.t("data.notify.everyday");
			case "1w":
				return i18next.t("data.notify.everyWeek");
			case "2w":
				return i18next.t("data.notify.everyTwiceWeek");
			case "1M":
				return i18next.t("data.notify.everyMonth");
			case "1y":
				return i18next.t("data.notify.everyYear");
			case "never":
				return "";
			default:
				var t = e.split(","),
					i = t.shift(),
					n = i.slice(-1),
					a = {
						w: {
							t: i18next.t("week"),
							m: {
								0: i18next.t("date.sunday"),
								1: i18next.t("date.monday"),
								2: i18next.t("date.tuesday"),
								3: i18next.t("date.wednesday"),
								4: i18next.t("date.thursday"),
								5: i18next.t("date.friday"),
								6: i18next.t("date.saturday")
							}
						},
						M: {
							t: i18next.t("months"),
							m: function(e) {
								return parseInt(e, 10) < 0 ? {
									"-1": i18next.t("data.notify.lastDay")
								}[e] : i18next.t("date.number", {
									number: e
								})
							}
						}
					}[n];
				if (!a) return "";
				var o = i18next.t("every") + i.replace(/[mw]/i, "") + a.t,
					r = [];
				return FX.Utils.forEach(t, function(e, t) {
					r.push(a.m[t] || a.m(t))
				}), r.length && (o += i18next.t("data.notify.repeatText", {
					repeat: r.join(",")
				})), o
			}
		},
		_formatOffsetTime: function(e) {
			if (FX.Utils.isEmpty(e)) return "";
			var t, i, n = e.charAt(0),
				a = e.charAt(e.length - 1),
				o = e.slice(1, e.length - 1);
			switch (n) {
			case "+":
				t = i18next.t("after");
				break;
			case "-":
				t = i18next.t("before")
			}
			switch (a) {
			case "d":
				i = i18next.t("date.days");
				break;
			case "m":
				i = i18next.t("date.minutes");
				break;
			case "h":
				i = i18next.t("date.hours")
			}
			return t + o + i
		},
		_formatDataFilter: function(t, i) {
			var n = this._getWidgetNameMap(),
				a = [];
			return t.cond && (FX.Utils.forEach(t.cond, function(e, t) {
				t.text = n[t.field]
			}), FX.Utils.forEach(t.cond, function(t, n) {
				var o = FX.Utils.formatDataFilter(n, function(t) {
					i.append(e("<span/>").text(t + "；"))
				});
				FX.Utils.isEmpty(o) || a.push(o + "；")
			})), a.join("")
		},
		_getUpdateNotifyText: function(e) {
			var t = [],
				i = this._getWidgetNameMap();
			return FX.Utils.forEach(e, function(e, n) {
				t.push(FX.Utils.escapeHtmlSpecialChar(i[n]))
			}), 0 === t.length ? i18next.t("data.notify.update.any") : 1 === t.length ? i18next.t("data.notify.update.detail.single", {
				field: '<span class="field-text">' + t + "</span>"
			}) : i18next.t("data.notify.update.detail.multi", {
				fields: '<span class="field-text" title="' + t.join("、") + '">' + t.join("、") + "</span>"
			})
		},
		_getWidgetNameMap: function() {
			var e = this.options;
			if (!this.widgetNameMap) {
				this.widgetNameMap = {};
				var t = this.widgetNameMap;
				t.createTime = i18next.t("field.createTime"), t.creator = i18next.t("field.creator"), t.updateTime = i18next.t("field.updateTime"), t.ext = i18next.t("form.ext");
				var i = e.formItems;
				FX.Utils.forEach(i, function(e, i) {
					t[i.widget.widgetName] = i.label
				})
			}
			return this.widgetNameMap
		},
		_remove: function(t, i) {
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.notify.remove, FX.STATIC.APPID, FX.STATIC.ENTRYID, t._id)
			}, function(t) {
				var n = e(i.target).closest(".main-item");
				n.length > 0 && (n.addClass("fade-out"), setTimeout(function() {
					n.remove()
				}, 218))
			})
		},
		_active: function(t, i) {
			if (t.target) switch (t.target.type) {
			case "auth_group":
				t.target.groups = this._format2IdArray(t.target.groups, "groupId");
				break;
			case "member":
				t.target.users = this._format2IdArray(t.target.users, "_id"), t.target.departs = this._format2IdArray(t.target.departs, "_id"), t.target.roles = this._format2IdArray(t.target.roles, "_id")
			}
			this._update({
				notifyId: t._id,
				notify: e.extend(t, {
					enabled: !t.enabled
				})
			}, i, !1)
		},
		_format2IdArray: function(e, t) {
			var i = [];
			return FX.Utils.forEach(e, function(e, n) {
				FX.Utils.isEmpty(n[t]) ? i.push(n) : i.push(n[t])
			}), i
		},
		_update: function(t, i, n, a) {
			var o = this;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.notify.update, FX.STATIC.APPID, FX.STATIC.ENTRYID, t.notifyId),
				data: t
			}, function(t) {
				if (a && a(t), n) o._rebuild();
				else {
					var r, s = o._createItem(t.notify);
					i ? (r = e(i.target).closest(".main-item")).empty() : r = e('<div class="main-item"/>').appendTo(e(".pane-main > .main-wrapper", o.element)), o._createLineWatermark(r, t.notify), r.append(o._createTitleLine(s.title)), FX.Utils.forEach(s.lines, function(e, t) {
						r.append(o._createPaneLine(t))
					})
				}
			})
		},
		_createNotify: function(e) {
			var t = this;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.notify.create, FX.STATIC.APPID, FX.STATIC.ENTRYID),
				data: {
					notify: e
				}
			}, function(e) {
				t._rebuild()
			})
		},
		_showConfig: function(t, i) {
			var n = this,
				a = this.options,
				o = new FX.Slider({
					title: i18next.t("data.notify"),
					contentWidget: {
						notify: e.extend(!0, {}, t),
						isDingtalkAdmin: a.isDingtalkAdmin,
						isWechatAdmin: a.isWechatAdmin,
						formItems: a.formItems,
						onSave: function() {
							var e = o.getContentWidget().getValue();
							FX.Utils.isObjectEmpty(t) ? n._createNotify(e) : n._update({
								notifyId: t._id,
								notify: e
							}, i, !0, function() {
								FX.Msg.toast({
									msg: i18next.t("saveInfo.success"),
									type: "success"
								})
							}), o && o.close()
						},
						type: "notifyconfigpane"
					},
					onBeforeClose: function() {
						return FX.Msg.alert({
							title: i18next.t("page.leave.confirm"),
							msg: i18next.t("data.notify.leave.msg"),
							onOk: function() {
								o.close()
							}
						}), !1
					}
				});
			o.show()
		}
	})
}(jQuery), function(e) {
	FX.FormSetApiPane = FX.extend(FX.FormSetPane, {
		_fetchData: function() {
			var e = this;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.web_hook.list, FX.STATIC.APPID, FX.STATIC.ENTRYID)
			}, function(t) {
				e.apiConfig = t;
				var i = {
					header: {
						text: i18next.t("data.api.create"),
						onClick: function() {
							e._showConfig()
						}
					}
				},
					n = [];
				FX.Utils.forEach(t.webhooks, function(t, i) {
					n.push(e._createItem(i))
				}), i.items = n.reverse(), i.header.hasBorder = !FX.Utils.isObjectEmpty(n), e._renderMain(i)
			})
		},
		_createItem: function(e) {
			if (!FX.Utils.isObjectEmpty(e)) {
				var t = this,
					i = "",
					n = FX.CONST.WEBHOOK.SERVER_TYPE;
				switch (e.mode) {
				case n.CUSTOM:
					i = i18next.t("data.api.custom");
					break;
				case n.FR:
					i = i18next.t("data.api.fr")
				}
				return {
					title: {
						name: i,
						btns: [{
							style: "btn-blue",
							name: i18next.t("data.api.log"),
							onClick: function() {
								t._showWebhookLogPane(e)
							}
						}, {
							style: "red",
							name: i18next.t("delete"),
							onClick: function(i, n) {
								FX.Msg.alert({
									title: i18next.t("data.api.deleteTitle"),
									msg: i18next.t("data.api.deleteMsg"),
									onOk: function() {
										t._removeWebhook(e, n)
									}
								})
							}
						}, {
							style: "green",
							name: i18next.t("edit"),
							onClick: function(i, n) {
								t._showConfig(e, n)
							}
						}, {
							style: "green",
							name: e.enable ? '<i class="icon-video-pause"/>' + i18next.t("pause") : '<i class="icon-flow-start"/>' + i18next.t("enable"),
							onClick: function(i, n) {
								t._activeWebhook(e, n)
							}
						}]
					},
					onCreate: function(i) {
						return t._createLineWatermark(i, e.enable), !1
					},
					lines: t._createLines(e)
				}
			}
		},
		_showWebhookLogPane: function(t) {
			if (t && t._id) {
				var i = e('<div class="webhook-log-pane"/>');
				new FX.WebhookLogPane({
					renderEl: e("<div/>").appendTo(i),
					webhook: t
				}), new FX.Slider({
					title: i18next.t("data.api.log"),
					content: i
				}).show()
			}
		},
		_createLineWatermark: function(t, i) {
			var n = i18next.t("paused"),
				a = "style-yellow";
			i && (n = i18next.t("activated"), a = "style-green"), t.addClass("custom-item").append(e('<div class="pane-watermark webhook-watermark"><div class="text">' + n + "</div></div>").addClass(a))
		},
		_createLines: function(e) {
			var t = [],
				i = FX.CONST.WEBHOOK.API_TRIGGER;
			return FX.Utils.forEach(e.triggers, function(e, n) {
				switch (n) {
				case i.CREATE:
					t.unshift(i18next.t("data.api.trigger.create"));
					break;
				case i.UPDATE:
					t.push(i18next.t("data.api.trigger.update"));
					break;
				case i.REMOVE:
					t.push(i18next.t("data.api.trigger.remove"))
				}
			}), [{
				info: i18next.t("data.api.serverUrl", {
					url: e.url
				})
			}, {
				info: i18next.t("data.api.pushTime", {
					time: t.join("，")
				})
			}]
		},
		_createHeader: function(t) {
			var i = this;
			if (this.$header = FX.FormSetApiPane.superclass._createHeader.apply(this, arguments), e('<span class="json-label">' + i18next.t("data.api.doc.title") + "</span>").append(e('<i class="icon-angledown"/>')).click(function() {
				i.$jsonExample.slideToggle("fast");
				var t = e(this).find("i");
				t.hasClass("icon-angledown") ? t.attr("class", "icon-angleup") : t.attr("class", "icon-angledown")
			}).appendTo(this.$header), this._canSetAlias()) {
				var n = e('<span class="alias-config-btn">' + i18next.t("api.alias.set") + "</span>").click(function() {
					i._showAliasConfigPane()
				}).appendTo(this.$header);
				new FX.Tooltip({
					renderEl: n,
					text: i18next.t("api.alias.set.tip")
				})
			}
			this._createJsonExample()
		},
		_canSetAlias: function() {
			if (!this.apiConfig || !this.apiConfig.hasDataApi) return !1;
			var e = this._getCanSetAliasFields();
			return !FX.Utils.isObjectEmpty(e)
		},
		_showAliasConfigPane: function() {
			var t = this,
				i = e('<div class="alias-config-slide"/>'),
				n = new FX.AliasConfigPane({
					renderEl: i,
					appId: FX.STATIC.APPID,
					entryId: FX.STATIC.ENTRYID,
					fields: this._getCanSetAliasFields(),
					onSaveSuccess: function() {
						a && a.close();
						var e = this.getAliasMap();
						t._updateConfigByAliasMap(e), t._createJsonExample()
					}
				}),
				a = new FX.Slider({
					title: i18next.t("api.alias.set"),
					content: i,
					onShow: function() {
						n.focusFirstInput()
					},
					onBeforeClose: function() {
						if (!n.isAliasChanged()) return !0;
						FX.Msg.alert({
							title: i18next.t("page.leave.confirm"),
							msg: i18next.t("api.alias.notSaveTip"),
							onOk: function() {
								a && a.close()
							}
						})
					}
				});
			a.show()
		},
		_getCanSetAliasFields: function() {
			var e = [];
			return FX.Utils.forEach(this._getFormItems(), function(t, i) {
				FX.Utils.isFieldValid(i.name) && e.push(i)
			}), e
		},
		_createJsonExample: function() {
			this.$jsonExample && this.$jsonExample.remove(), this.$jsonExample = e('<div class="json-example"/>').appendTo(this.$header).hide(), this._createFieldsTable(), this._createJsonBlock()
		},
		_updateConfigByAliasMap: function(e) {
			FX.Utils.isObjectEmpty(e) || FX.Utils.forEach(this.apiConfig.formItems, function(t, i) {
				var n = i.widget;
				if (n) {
					var a = n.type,
						o = n.widgetName;
					FX.CONST.API_VALUE_TYPE_MAP[a] && FX.Utils.isFieldValid(o) && (n.alias = e[o], "subform" === a && FX.Utils.forEach(n.items, function(t, i) {
						var n = [o, i.widget.widgetName].join(".");
						i.widget.alias = e[n]
					}))
				}
			})
		},
		_createFieldsTable: function() {
			var t = this,
				i = e('<table class="fields-table x-table x-table-bordered"/>').appendTo(this.$jsonExample);
			e("<tr><th>" + i18next.t("field.name") + "</th><th>" + i18next.t("field.idOrAlias") + "</th><th>" + i18next.t("field.type") + "</th><th>" + i18next.t("explain") + "</th></tr>").appendTo(i);
			var n = "",
				a = [{
					text: i18next.t("form.name"),
					name: "formName",
					type: "string"
				}, {
					text: i18next.t("data.id"),
					name: "_id",
					type: "string",
					explain: i18next.t("data.id.only")
				}].concat(this._getFormItems());
			FX.Utils.forEach(a, function(e, i) {
				var a = i.text,
					o = t._getItemAliasOrName(i),
					r = i.type,
					s = i.explain || "";
				n += "<tr><td>" + a + "</td><td>" + o + "</td><td>" + r + "</td><td>" + s + "</td></tr>"
			}), e(n).appendTo(i)
		},
		_getItemAliasOrName: function(e) {
			if (FX.Utils.isObjectEmpty(e)) return "";
			var t = e.alias || e.name;
			if (e.subformName) {
				var i = e.subformAlias || e.subformName;
				t = e.alias ? [i, e.alias].join(".") : [i, e.name.split(".").pop()].join(".")
			}
			return t
		},
		_getFormItems: function() {
			var e = [];
			return FX.Utils.forEach(this.apiConfig.formItems, function(t, i) {
				if (i.widget) {
					var n = i.widget.type,
						a = FX.CONST.API_VALUE_TYPE_MAP;
					if (a[n]) {
						var o = {
							text: i.label,
							name: i.widget.widgetName,
							type: a[n],
							alias: i.widget.alias
						};
						if ("flowState" === n && (o.explain = i18next.t("data.api.flowState.explain")), e.push(o), "subform" === n) {
							var r = o.name,
								s = o.text,
								l = o.alias;
							FX.Utils.forEach(i.widget.items, function(t, i) {
								var n = i.widget.widgetName,
									o = i.widget.type,
									d = i.label,
									u = i.widget.alias;
								a[o] && e.push({
									name: [r, n].join("."),
									text: [s, d].join("."),
									type: a[o],
									alias: u,
									subformAlias: l,
									subformName: r
								})
							})
						}
					}
				}
			}), e
		},
		_createJsonBlock: function() {
			var t = JSON.stringify(this._getExampleData(), null, 2).replace(/(\s+)("[^\s]*")(,?\n)/g, "$1<span class='json-string'>$2</span>$3").replace(/(\s+)(-?\d*\.?\d+)(,?\n)/g, "$1<span class='json-number'>$2</span>$3").replace(/(\s+)(false|true)(,?\n)/g, "$1<span class='json-bool'>$2</span>$3");
			e('<pre class="json-block"><code class="json-code">' + t + "</code></pre>").appendTo(this.$jsonExample)
		},
		_getExampleData: function() {
			var e = this.options,
				t = FX.MOCK_RES_DATA,
				i = {
					op: "data_create",
					data: {
						formName: e.formName || "",
						_id: t._id
					}
				};
			return FX.Utils.forEach(this.apiConfig.formItems, function(e, n) {
				var a = n.widget;
				if (a) {
					var o = a.type,
						r = a.alias || a.widgetName;
					if (o && r) if ("subform" === o) {
						var s = {};
						FX.Utils.forEach(n.widget.items, function(e, i) {
							if (i.widget) {
								var n = i.widget.alias || i.widget.widgetName,
									a = i.widget.type;
								n && a && (s[n] = t[a])
							}
						}), i.data[r] = [s]
					} else i.data[r] = t[o]
				}
			}), i
		},
		_showConfig: function(e, t) {
			if (FX.Utils.isObjectEmpty(e) && (e = {}), this.apiConfig.hasDataApi) {
				var i = this;
				this.slider = new FX.Slider({
					title: i18next.t("data.api"),
					contentWidget: {
						type: "apiconfigpane",
						webhook: e,
						onSave: function() {
							var n = i.slider.getContentWidget().getValue();
							FX.Utils.isObjectEmpty(e) ? i._createWebhook(n) : i._updateWebhook(e._id, n, t, function() {
								FX.Msg.toast({
									msg: i18next.t("saveInfo.success"),
									type: "success"
								})
							})
						}
					},
					onBeforeClose: function() {
						FX.Msg.alert({
							title: i18next.t("page.leave.confirm"),
							msg: i18next.t("data.api.leaveMsg"),
							onOk: function() {
								i.slider.close()
							}
						})
					}
				}), this.slider.show()
			} else FX.Vip.showUpgradeTip({
				code: FX.CONST.VIP_ERR_NAME_MAP.DATA_API
			})
		},
		_createWebhook: function(e) {
			var t = this;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.web_hook.create, FX.STATIC.APPID, FX.STATIC.ENTRYID),
				data: {
					webhook: e
				}
			}, function() {
				t.slider && t.slider.close(), t._rebuild()
			})
		},
		_updateWebhook: function(t, i, n, a) {
			var o = this;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.web_hook.update, FX.STATIC.APPID, FX.STATIC.ENTRYID, t),
				data: i
			}, function(t) {
				a && a(t);
				var i = o._createItem(t.webhook),
					r = e(n.target).closest(".main-item");
				r.empty(), r.append(o._createTitleLine(i.title)), FX.Utils.forEach(i.lines, function(e, t) {
					r.append(o._createPaneLine(t))
				}), o._createLineWatermark(r, t.webhook.enable), o.slider && o.slider.close()
			})
		},
		_removeWebhook: function(t, i) {
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.web_hook.remove, FX.STATIC.APPID, FX.STATIC.ENTRYID, t._id)
			}, function() {
				var t = e(i.target).closest(".main-item");
				t.length > 0 && (t.addClass("fade-out"), setTimeout(function() {
					t.remove()
				}, 218))
			})
		},
		_activeWebhook: function(t, i) {
			this._updateWebhook(t._id, e.extend(t, {
				enable: !t.enable
			}), i)
		}
	})
}(jQuery), function(e) {
	FX.NotifyConfigPane = FX.extend(FX.Widget, {
		HELP_LINK: {
			AUTH_GROUP: FX.CONFIG.HOST.HELP_DOC_HOST + "/9090",
			CHANEL: FX.CONFIG.HOST.HELP_DOC_HOST + "/9046",
			NOTIFY: FX.CONFIG.HOST.HELP_DOC_HOST + "/9045"
		},
		_defaultConfig: function() {
			return e.extend(FX.NotifyConfigPane.superclass._defaultConfig.apply(this, arguments), {
				baseCls: "fx_notify_config",
				notify: {},
				formItems: [],
				onSave: null,
				isDingtalkAdmin: !1,
				isWechatAdmin: !1,
				defaultMessage: i18next.t("data.notify.defaultMsg"),
				defaultDayTime: "09:00",
				defaultOffset: 1,
				maxOffsetCount: 999,
				maxRepeatCount: 99
			})
		},
		_init: function() {
			FX.NotifyConfigPane.superclass._init.apply(this, arguments);
			var t = this.options;
			this.notifyConfig = {}, this.notify = e.extend(!0, {}, t.notify);
			var i = [];
			FX.Utils.forEach(t.formItems, function(e, t) {
				t.widget && "datetime" === t.widget.type && i.push({
					value: t.widget.widgetName,
					text: t.label,
					format: t.widget.format
				})
			}), this.dateWidgets = i, this._createContent()
		},
		_loadNotifyConfig: function(e) {
			this.notify = this.notifyConfig[e] || {
				mode: e
			}
		},
		_saveNotifyConfig: function() {
			var e = this.notify;
			this.notifyConfig[e.mode] = e
		},
		_createContent: function() {
			this.$content = e('<div class="config-content"/>').appendTo(this.element), this._renderConfigPane(), this._renderFooter()
		},
		_renderConfigPane: function(t) {
			this.$config ? this.$config.empty() : this.$config = e('<div class="config-pane"/>').appendTo(this.$content), this._renderNotifyTime(null, t), this._renderNotifyFilter(!FX.Utils.isObjectEmpty(this.notify.data_filter && this.notify.data_filter.cond)), this._renderNotifyTarget(t), this._renderNotifyMessage(), this._renderNotifyChanel(), this._renderNotifyTip()
		},
		_renderFooter: function() {
			var t = e('<div class="config-footer"/>').appendTo(this.$content);
			this._renderNotifyBtn(t), this._renderFooterTip(t)
		},
		_renderFooterTip: function(t) {
			e('<div class="footer-tip"><a href="' + this.HELP_LINK.NOTIFY + '" target="_blank" class="link">' + i18next.t("data.notify.title") + "</a></div>").appendTo(t)
		},
		_renderNotifyBtn: function(t) {
			var i = this,
				n = this.options;
			new FX.Button({
				renderEl: e('<div class="btn"/>').appendTo(e('<div class="btn-pane"/>').appendTo(t)),
				style: "green",
				text: i18next.t("save"),
				width: 120,
				onClick: function() {
					i.checkValidate() ? (i._renderConfigPane(), FX.Utils.applyFunc(i, n.onSave, [], !1)) : i._renderConfigPane(!0)
				}
			})
		},
		_renderNotifyTarget: function(t) {
			var i = this,
				n = this.notify.target,
				a = e("<div/>").appendTo(this.$config);
			n || (n = {
				type: "member"
			}, this.notify.target = n), e('<div class="label">' + i18next.t("data.notify.target") + "</div>").appendTo(a);
			var o = [];
			FX.Utils.forEach(n.users, function(e, t) {
				o.push(t._id || t)
			}), n.users = o;
			var r = [];
			FX.Utils.forEach(n.departs, function(e, t) {
				r.push(t._id || t)
			}), n.departs = r;
			var s = [];
			FX.Utils.forEach(n.roles, function(e, t) {
				s.push(t._id || t)
			}), n.roles = s;
			var l = {};
			if ("custom" === this.notify.mode) n.widgets = void 0, n.deptWidgets = void 0;
			else {
				var d = this._getWidgets(),
					u = [];
				FX.Utils.isObjectEmpty(d.user) || u.push({
					type: "user",
					text: i18next.t("field.user")
				}), FX.Utils.isObjectEmpty(d.dept) || u.push({
					type: "dept",
					text: i18next.t("field.dept")
				}), l = {
					dynamicEnable: !0,
					dynamicWidgets: d,
					dynamicMenu: u,
					dynamicName: i18next.t("dynamicNotifier")
				}
			}
			t && FX.Utils.isMembersEmpty(n) && a.children(".label").append(e('<span class="invalid-tip">' + i18next.t("item.required") + "</span>")), new FX.MemberSelectPane(e.extend(l, {
				renderEl: e('<div class="widget"/>').appendTo(a),
				value: o.concat(r, s),
				items: i.memberItems,
				roleEnable: !0,
				jsonValue: n,
				msg: i18next.t("field.userDept.add"),
				width: 460,
				onAsyncSuccess: function(e) {
					i.memberItems = e
				},
				onStopEdit: function() {
					var t = this.getJsonValue();
					e.extend(n, {
						users: t.users,
						departs: t.departs,
						roles: t.roles,
						widgets: t.widgets,
						deptWidgets: t.deptWidgets
					}), i.memberItems = this.getItems()
				}
			}))
		},
		_renderNotifyTime: function(t, i) {
			var n = this,
				a = this.$config;
			t || (t = e("<div/>").appendTo(a));
			var o = this.notify,
				r = o.time;
			if (FX.Utils.isObjectEmpty(r) && (r = {
				repeat: "never"
			}, this.notify.time = r), FX.Utils.isNull(o.mode) && (o.mode = "create"), e('<div class="label">' + i18next.t("data.notify.mode") + "</div>").appendTo(t), new FX.ComboBox({
				renderEl: e('<div class="widget"/>').appendTo(t),
				items: [{
					value: "create",
					text: i18next.t("data.notify.dataCreate")
				}, {
					value: "update",
					text: i18next.t("data.notify.dataUpdate")
				}, {
					value: "custom",
					text: i18next.t("data.notify.custom")
				}, {
					value: "widget",
					text: i18next.t("data.notify.byWidget")
				}],
				width: 260,
				value: o.mode,
				allowBlank: !1,
				searchable: !1,
				onStopEdit: function() {
					var e = this.getValue();
					e !== o.mode && (n._saveNotifyConfig(), n._loadNotifyConfig(e), n._renderConfigPane())
				}
			}), "create" !== o.mode) switch (o.mode) {
			case "custom":
				this._renderCustomTime(t, r, i);
				break;
			case "widget":
				this._renderWidgetTime(e("<div/>").appendTo(t), r, i);
				break;
			case "update":
				this._renderModifyFields(t)
			}
		},
		_renderModifyFields: function(t) {
			var i = this,
				n = i18next.t("data.notify.update.tip");
			e('<span class="tip"/>').text(n).appendTo(t);
			var a = e('<div class="widget"/>').appendTo(t),
				o = this._getModifyFields(),
				r = FX.Utils.isObjectEmpty(o) ? "any" : "fields";
			new FX.ComboBox({
				renderEl: e("<div />").appendTo(a),
				customCls: "item-inline",
				items: [{
					value: "any",
					text: i18next.t("data.notify.update.any")
				}, {
					value: "fields",
					text: i18next.t("data.notify.update.fields")
				}],
				width: 260,
				value: r,
				allowBlank: !1,
				searchable: !1,
				onStopEdit: function() {
					"fields" === this.getValue() ? i._renderFieldsSetBtnAndTip(a, o) : (i._clearFieldsSetBtnAndTip(a), o = [], i._updateModifyFields(o))
				}
			}), "fields" === r && i._renderFieldsSetBtnAndTip(a, o)
		},
		_getModifyFields: function() {
			return (this.notify.modify_fields || []).slice(0)
		},
		_updateModifyFields: function(e) {
			this.notify.modify_fields = e
		},
		_renderFieldsSetBtnAndTip: function(t, i) {
			var n = this;
			if (!this.$fieldsSetBtn) {
				this.$fieldsSetBtn = e("<div />").appendTo(t);
				var a = i18next.t("data.notify.field.set");
				i.length && (a += "(" + i.length + ")");
				var o = new FX.Button({
					renderEl: this.$fieldsSetBtn,
					customCls: "item-inline fields-set-btn",
					text: a,
					style: "green",
					height: 30,
					onClick: function() {
						n._createFieldsSetDialog(function(e) {
							var t = i18next.t("data.notify.field.set");
							e.length && (t += "(" + e.length + ")"), o.setText(t)
						})
					}
				});
				e('<div class="update-field-tip"/>').text(i18next.t("data.notify.update.fields.tip")).appendTo(t)
			}
		},
		_clearFieldsSetBtnAndTip: function(e) {
			e.find(".fields-set-btn").remove(), e.find(".update-field-tip").remove(), this.$fieldsSetBtn = null
		},
		_createFieldsSetDialog: function(t) {
			var i = this,
				n = this._getModifyFields(),
				a = new FX.ConfirmDialog({
					title: i18next.t("data.notify.field.set"),
					customCls: "modify-field-set-dialog",
					width: 500,
					height: 500,
					hasSeparator: !0,
					text4Ok: i18next.t("save"),
					onOk: function() {
						n.length ? (i._updateModifyFields(n), a.close(), FX.Utils.applyFunc(i, t, [n], null)) : FX.Msg.toast({
							type: "warning",
							msg: i18next.t("data.notify.field.set.tip")
						})
					},
					onContentCreate: function(t) {
						e('<div class="field-tip"/>').text(i18next.t("data.notify.field.set.desc")).appendTo(t);
						var a = e('<ul class="field-list"/>').appendTo(t);
						i._getFormFields(function(e) {
							var t = [];
							FX.Utils.forEach(e, function(e, i) {
								FX.Utils.isFieldValid(i.name) && t.push(i)
							}), i._createFieldList(a, t, n)
						})
					}
				});
			a.show()
		},
		_getFormFields: function(e) {
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.app.get_form_fields, FX.STATIC.APPID),
				data: {
					formId: FX.STATIC.ENTRYID
				}
			}, function(t) {
				e && e(t.fields)
			})
		},
		_createFieldList: function(t, i, n) {
			var a = this;
			a._createFieldItem(i18next.t("selectAll"), i.length === n.length).addClass("field-all").appendTo(t), FX.Utils.forEach(i, function(e, i) {
				a._createFieldItem(i.text, n.indexOf(i.name) > -1).data("field", i.name).appendTo(t)
			}), t.on("click", ".field-item", function(a) {
				var o = e(a.currentTarget),
					r = o.find(".x-check");
				r.toggleClass("select");
				var s = r.hasClass("select");
				if (o.hasClass("field-all")) if (s) t.find(".field-item > .x-check").addClass("select"), FX.Utils.forEach(i, function(e, t) {
					n.indexOf(t.name) < 0 && n.push(t.name)
				});
				else for (t.find(".field-item > .x-check").removeClass("select"); n.length;) n.pop();
				else {
					var l = o.data("field"),
						d = t.find(".field-all > .x-check");
					s ? (n.push(l), d.toggleClass("select", n.length === i.length)) : (FX.Utils.forEach(n, function(e, t) {
						if (t === l) return n.splice(e, 1), !1
					}), d.removeClass("select"))
				}
			})
		},
		_createFieldItem: function(t, i) {
			return e('<li class="field-item"/>').append(e("<span />").text(t)).append(e('<a class="x-check"><i class="icon-blank"></i></a>').toggleClass("select", i))
		},
		_renderCustomTime: function(t, i, n) {
			var a = this,
				o = this.options,
				r = i18next.t("data.notify.custom.tip");
			t.append(e('<span class="tip">' + r + "</span>")), e('<div class="label">' + i18next.t("data.notify.time") + "</div>").appendTo(t);
			var s = e('<div class="sub-item half">').appendTo(t);
			n && FX.Utils.isEmpty(i.custom) && s.children(".sub-label").append(e('<span class="invalid-tip">' + i18next.t("item.required") + "</span>")), new FX.DateTime({
				renderEl: e('<div class="sub-widget"/>').appendTo(s),
				value: i.custom,
				width: 205,
				format: "yyyy-MM-dd HH:mm:ss",
				waterMark: i18next.t("data.notify.startTime.set"),
				onStopEdit: function() {
					var t = this.getValue();
					t !== i.custom && e.extend(i, {
						custom: t
					})
				}
			});
			var l = "custom" === i.custom_type;
			e('<div class="label">' + i18next.t("data.notify.repeatType") + "</div>").appendTo(t);
			var d = e('<div class="sub-item">').appendTo(t);
			if (new FX.ComboBox({
				renderEl: e('<div class="sub-widget"/>').appendTo(d),
				items: [{
					value: "never",
					text: i18next.t("data.notify.onlyOnce")
				}, {
					value: "1d",
					text: i18next.t("data.notify.once", {
						time: i18next.t("data.notify.everyday")
					})
				}, {
					value: "1w",
					text: i18next.t("data.notify.once", {
						time: i18next.t("data.notify.everyWeek")
					})
				}, {
					value: "2w",
					text: i18next.t("data.notify.once", {
						time: i18next.t("data.notify.everyTwiceWeek")
					})
				}, {
					value: "1M",
					text: i18next.t("data.notify.once", {
						time: i18next.t("data.notify.everyMonth")
					})
				}, {
					value: "1y",
					text: i18next.t("data.notify.once", {
						time: i18next.t("data.notify.everyYear")
					})
				}, {
					value: "custom",
					text: i18next.t("data.notify.customRepeat")
				}],
				width: 150,
				allowBlank: !1,
				searchable: !1,
				value: l ? "custom" : i.repeat,
				onStopEdit: function() {
					var n = this.getValue();
					n !== i.custom_type && n !== i.repeat && ("custom" === n ? e.extend(i, {
						custom_type: "custom",
						repeat: ""
					}) : e.extend(i, {
						repeat: n,
						custom_type: "preset"
					}), a._renderNotifyTime(t.empty()))
				}
			}), "never" !== i.repeat) {
				if (l) {
					FX.Utils.isEmpty(i.repeat) && (i.repeat = "1w" + (i.custom ? "," + new Date(i.custom).getDay() : ""));
					var u = i.repeat.split(","),
						c = u.shift(),
						f = c.slice(-1),
						h = new FX.ComboBox({
							renderEl: e('<div class="sub-widget"/>').appendTo(d),
							items: [{
								value: "w",
								text: i18next.t("data.notify.repeat.week")
							}, {
								value: "M",
								text: i18next.t("data.notify.repeat.month")
							}],
							allowBlank: !1,
							searchable: !1,
							width: 110,
							value: f,
							onStopEdit: function() {
								var e = this.getValue();
								if (e !== f) {
									var n = [];
									FX.Utils.isEmpty(i.custom) || ("M" === e ? n.push(new Date(i.custom).getDate()) : "w" === e && n.push(new Date(i.custom).getDay())), g(n), a._renderNotifyTime(t.empty())
								}
							}
						});
					e('<div class="sub-widget">' + i18next.t("every") + "</div>").appendTo(d);
					var p, m = new FX.Number({
						renderEl: e('<div class="sub-widget"/>').appendTo(d),
						allowBlank: !1,
						width: 40,
						value: parseInt(c.replace(/[mw]/i, ""), 10),
						onStopEdit: function() {
							var e = this.getValue();
							(!(e = Math.min(e, o.maxRepeatCount)) || e <= 0) && (e = o.defaultOffset), this.setValue(e), g(p.getValue())
						}
					});
					switch (f) {
					case "w":
						e('<div class="sub-widget">' + i18next.t("week") + "</div>").appendTo(d), p = new FX.ComboCheckBox({
							renderEl: e('<div class="sub-widget"/>').appendTo(d),
							items: [{
								value: "1",
								text: i18next.t("date.monday")
							}, {
								value: "2",
								text: i18next.t("date.tuesday")
							}, {
								value: "3",
								text: i18next.t("date.wednesday")
							}, {
								value: "4",
								text: i18next.t("date.thursday")
							}, {
								value: "5",
								text: i18next.t("date.friday")
							}, {
								value: "6",
								text: i18next.t("date.saturday")
							}, {
								value: "0",
								text: i18next.t("date.sunday")
							}],
							allowBlank: !1,
							searchable: !1,
							hasSelectAll: !1,
							width: 150,
							value: u,
							onStopEdit: function() {
								g(this.getValue())
							}
						});
						break;
					case "M":
						e('<div class="sub-widget">' + i18next.t("months") + "</div>").appendTo(d), p = new FX.DaysSelectPane({
							renderEl: e('<div class="sub-widget"/>').appendTo(d),
							width: 150,
							value: u,
							onStopEdit: function() {
								g(this.getValue())
							}
						})
					}
					var g = function(t) {
							var n = [m.getValue() + h.getValue()].concat(t);
							e.extend(i, {
								repeat: n.join(",")
							})
						}
				}
				e('<div class="label">' + i18next.t("data.notify.overTime") + "</div>").appendTo(t);
				var v = e('<div class="sub-item half">').appendTo(t);
				new FX.DateTime({
					renderEl: e('<div class="sub-widget"/>').appendTo(v),
					value: i.finish,
					width: 205,
					format: "yyyy-MM-dd HH:mm:ss",
					waterMark: i18next.t("data.notify.over"),
					onStopEdit: function() {
						var t = this.getValue();
						t !== i.finish && e.extend(i, {
							finish: t
						})
					}
				}), n && FX.Utils.isEmpty(i.finish) && v.children(".sub-label").append(e('<span class="invalid-tip">' + i18next.t("item.required") + "</span>"))
			}
		},
		_renderWidgetTime: function(t, i, n) {
			var a = this,
				o = this.options;
			t.empty(), e('<div class="tip"/>').text(i18next.t("data.notify.byWidget.tip")).appendTo(t), e('<div class="label">' + i18next.t("data.notify.time") + "</div>").appendTo(t);
			var r = e('<div class="sub-item half">').appendTo(t);
			if (new FX.ComboBox({
				renderEl: e('<div class="sub-widget"/>').appendTo(r),
				items: this.dateWidgets,
				width: 240,
				allowBlank: !1,
				searchable: !1,
				value: i.widget,
				waterMark: i18next.t("data.notify.byWidget.placeholder"),
				onAfterItemSelect: function(e, n) {
					i.widget = n.value, i.widget_type = "date", /[Hhms]/.test(n.format) && (i.widget_type = "datetime"), a._renderWidgetTime(t, i)
				}
			}), n && FX.Utils.isEmpty(i.widget) && r.children(".sub-label").append(e('<span class="invalid-tip">' + i18next.t("item.required") + "</span>")), i.widget) {
				i.widget_type || (i.widget_type = "date"), i.offset || (i.offset = "");
				var s = "current";
				/\+/.test(i.offset) ? s = "after" : /-/.test(i.offset) && (s = "before");
				var l = i18next.t("data.notify.currentTime");
				"date" === i.widget_type && (l = i18next.t("date.today"));
				var d = e('<div class="sub-item half">').appendTo(t);
				if (new FX.ComboBox({
					renderEl: e('<div class="sub-widget"/>').appendTo(d),
					items: [{
						value: "current",
						text: l
					}, {
						value: "before",
						text: i18next.t("data.notify.before")
					}, {
						value: "after",
						text: i18next.t("data.notify.after")
					}],
					width: 80,
					allowBlank: !1,
					value: s,
					onStopEdit: function() {
						switch (this.getValue()) {
						case "current":
							i.offset = "";
							break;
						case "before":
							i.offset = "-" + i.offset.replace(/[+-]/, "");
							break;
						case "after":
							i.offset = "+" + i.offset.replace(/[+-]/, "")
						}
						a._renderWidgetTime(t, i)
					}
				}), "current" !== s) {
					var u = i.offset.match(/[0-9]+/);
					u || (u = o.defaultOffset, i.offset += u), new FX.Number({
						renderEl: e('<div class="sub-widget"/>').appendTo(d),
						width: 50,
						allowBlank: !1,
						value: u,
						onStopEdit: function() {
							var e = this.getValue();
							(!(e = Math.min(e, o.maxOffsetCount)) || e <= 0) && (e = o.defaultOffset), e = Math.round(e), this.setValue(e), i.offset = i.offset.replace(/[\d]+([.]{1}[\d]+){0,}/, e)
						}
					});
					var c = i.offset.match(/[hmd]+/);
					"date" === i.widget_type ? (c && "d" === c || (i.offset = i.offset.replace(/[hmd]+/, "") + "d"), e('<div class="sub-widget">' + i18next.t("date.days") + "</div>").appendTo(d)) : (c || (c = "m", i.offset += c), new FX.ComboBox({
						renderEl: e('<div class="sub-widget"/>').appendTo(d),
						items: [{
							value: "m",
							text: i18next.t("date.minutes")
						}, {
							value: "h",
							text: i18next.t("date.hours")
						}, {
							value: "d",
							text: i18next.t("date.days")
						}],
						width: 100,
						allowBlank: !1,
						searchable: !1,
						value: c,
						onStopEdit: function() {
							var e = this.getValue();
							i.offset = i.offset.replace(/[mhd]/, e)
						}
					}))
				}
				if ("date" === i.widget_type) {
					i.daytime || (i.daytime = o.defaultDayTime);
					var f = new Date;
					f.setHours(i.daytime.split(":")[0]), f.setMinutes(i.daytime.split(":")[1]), new FX.DateTime({
						renderEl: e('<div class="sub-widget"/>').appendTo(d),
						format: "HH:mm",
						triggerIcon: "icon-widget-time",
						width: 100,
						allowBlank: !1,
						value: f,
						onStopEdit: function() {
							i.daytime = this.getText()
						}
					})
				}
				e('<div class="label">' + i18next.t("data.notify.repeatType") + "</div>").appendTo(t), i.repeat = i.repeat || "never";
				var h = e('<div class="sub-item"/>').appendTo(t);
				new FX.ComboBox({
					renderEl: e('<div class="sub-widget"/>').appendTo(h),
					searchable: !1,
					items: [{
						value: "never",
						text: i18next.t("data.notify.onlyOnce")
					}, {
						value: "1d",
						text: i18next.t("data.notify.once", {
							time: i18next.t("data.notify.everyday")
						})
					}, {
						value: "1w",
						text: i18next.t("data.notify.once", {
							time: i18next.t("data.notify.everyWeek")
						})
					}, {
						value: "2w",
						text: i18next.t("data.notify.once", {
							time: i18next.t("data.notify.everyTwiceWeek")
						})
					}, {
						value: "1M",
						text: i18next.t("data.notify.once", {
							time: i18next.t("data.notify.everyMonth")
						})
					}, {
						value: "1y",
						text: i18next.t("data.notify.once", {
							time: i18next.t("data.notify.everyYear")
						})
					}],
					width: 240,
					allowBlank: !1,
					value: i.repeat,
					onStopEdit: function() {
						var t = this.getValue();
						t !== i.repeat && (p.setVisible("never" !== t), e.extend(i, {
							repeat: t
						}))
					}
				});
				var p = new FX.DateTime({
					renderEl: e('<div class="sub-widget"/>').appendTo(h),
					width: 240,
					format: "yyyy-MM-dd HH:mm:ss",
					waterMark: i18next.t("data.notify.over"),
					visible: "never" !== i.repeat,
					value: i.finish,
					onStopEdit: function() {
						var t = this.getValue();
						t !== i.finish && e.extend(i, {
							finish: t
						})
					}
				})
			}
		},
		_renderNotifyFilter: function(t, i) {
			var n = this,
				a = this.$config,
				o = this.notify;
			if ("custom" !== o.mode) if (i || (i = e("<div/>").appendTo(a)), e('<div class="label">' + i18next.t("data.notify.condition") + "</div>").appendTo(i), new FX.ComboBox({
				renderEl: e('<div class="widget"/>').appendTo(i),
				items: [{
					value: !1,
					text: i18next.t("data.any")
				}, {
					value: !0,
					text: i18next.t("data.notify.accordWithCondition")
				}],
				width: 260,
				value: t,
				allowBlank: !1,
				searchable: !1,
				onStopEdit: function() {
					var e = this.getValue();
					t !== e && (t = e, n._renderNotifyFilter(t, i.empty()))
				}
			}), t) {
				var r = o.data_filter;
				new FX.FilterPane({
					renderEl: e('<div class="widget validator"/>').appendTo(i),
					text4add: i18next.t("data.notify.condition.add"),
					tip: i18next.t("data.notify.condition.addTip"),
					fields: FX.Utils.pretreatFormFilterCond(r && r.cond),
					rel: r && r.rel,
					modal: !1,
					width: 460,
					forms: [FX.STATIC.ENTRYID],
					supportCurrentDept: !1,
					supportCurrentUser: !1,
					supportSubform: !1,
					onStopEdit: function() {
						var t = FX.Utils.dealFormFilterCond(this.getValue()),
							i = {};
						t && !FX.Utils.isObjectEmpty(t.cond) && (i = t), e.extend(o, {
							data_filter: i
						})
					}
				})
			} else o.data_filter = {};
			else o.data_filter = {}
		},
		_renderNotifyMessage: function() {
			this.options;
			var t = this.notify,
				i = this.$config,
				n = e("<div/>").appendTo(i);
			e('<div class="label">' + i18next.t("data.notify.msg") + "</div>").appendTo(n), new FX.TextEditor({
				renderEl: e('<div class="widget"/>').appendTo(n),
				value: t.message || this._getDefaultMessage(),
				allowBlank: !1,
				width: 460,
				onStopEdit: function() {
					var i = this.getValue();
					i !== t.message && e.extend(t, {
						message: i
					})
				}
			})
		},
		_renderNotifyChanel: function() {
			var t = this.options,
				i = this.notify,
				n = this.$config,
				a = e("<div/>").appendTo(n);
			e('<div class="label">' + i18next.t("data.notify.type") + "</div>").appendTo(a);
			var o = [],
				r = "",
				s = [];
			t.isDingtalkAdmin ? (s = ["dingtalk"], o = [{
				value: "dingtalk",
				text: i18next.t("data.notify.corp", {
					corp: i18next.t("dingtalk")
				})
			}]) : t.isWechatAdmin ? (s = ["wework"], o = [{
				value: "wework",
				text: i18next.t("data.notify.corp", {
					corp: i18next.t("wework")
				})
			}]) : (s = ["mail"], o = [{
				value: "mail",
				text: i18next.t("data.notify.corp", {
					corp: i18next.t("email")
				})
			}, {
				value: "wechat",
				text: i18next.t("data.notify.corp", {
					corp: i18next.t("wechat")
				})
			}], r = i18next.t("data.notify.typeTip")), FX.Utils.isObjectEmpty(i.channels) && (i.channels = s);
			var l = e('<div class="widget"/>').appendTo(a);
			new FX.CheckBoxGroup({
				renderEl: l,
				items: o,
				layout: "horizontal",
				value: i.channels,
				allowBlank: !1,
				enable: o.length > 1,
				onStopEdit: function() {
					var t = this.getValue();
					FX.Utils.isObjectEmpty(t) && (t = s, this.setValue(t)), e.extend(i, {
						channels: t
					})
				}
			}), r && e('<span class="tip"/>').text(r).appendTo(l)
		},
		_renderNotifyTip: function() {
			var t = this.options;
			if (!t.isDingtalkAdmin && !t.isWechatAdmin) {
				var i = e('<div class="tip-pane"/>').appendTo(this.$config),
					n = i18next.t("data.notify.corpTip"),
					a = {
						text: i18next.t("data.notify.corpText"),
						url: this.HELP_LINK.CHANEL
					};
				i.append(e('<span class="tip">' + n + '</span><a href="' + a.url + '" class="link" target="_blank">' + a.text + "</a>"))
			}
		},
		_getWidgets: function() {
			var e = [],
				t = [];
			return FX.Utils.forEach(this.options.formItems, function(i, n) {
				if (n.widget) switch (n.widget.type) {
				case "user":
				case "usergroup":
					e.push({
						id: n.widget.widgetName,
						name: n.label,
						type: "userWidget"
					});
					break;
				case "dept":
				case "deptgroup":
					t.push({
						id: n.widget.widgetName,
						name: n.label,
						type: "deptWidget"
					})
				}
			}), {
				user: e,
				dept: t
			}
		},
		_getDefaultMessage: function() {
			var e = this,
				t = this.notify,
				i = e.defaultMessage;
			switch (t.mode) {
			case "create":
				i = i18next.t("data.notify.createMsg");
				break;
			case "custom":
				i = i18next.t("data.notify.customMsg");
				break;
			case "widget":
				i = i18next.t("data.notify.widgetMsg");
				break;
			case "update":
				i = i18next.t("data.notify.updateMsg")
			}
			return i
		},
		checkValidate: function() {
			this.options;
			var e = this.notify,
				t = !0,
				i = e.target;
			if (!(t = "member" === i.type ? t && !FX.Utils.isMembersEmpty(i) : t && !FX.Utils.isObjectEmpty(i.groups))) return FX.Msg.toast({
				msg: i18next.t("data.notify.fail1"),
				type: "warning"
			}), t;
			var n = e.time;
			if ("custom" === e.mode) {
				if (!(t = t && !FX.Utils.isEmpty(n.custom))) return FX.Msg.toast({
					msg: i18next.t("data.notify.fail2"),
					type: "warning"
				}), t;
				if ("never" !== n.repeat && (t = t && !FX.Utils.isEmpty(n.finish)), !t) return FX.Msg.toast({
					msg: i18next.t("data.notify.fail3"),
					type: "warning"
				}), t;
				if ("custom" === n.custom_type) {
					var a = n.repeat;
					if (a) {
						var o = a.split(",");
						o.shift(), FX.Utils.isObjectEmpty(o) && (t = !1)
					} else t = !1
				}
				if (!t) return FX.Msg.toast({
					msg: i18next.t("data.notify.fail5"),
					type: "warning"
				}), t
			}
			if ("widget" === e.mode) {
				if (!(t = t && !FX.Utils.isEmpty(n.widget))) return FX.Msg.toast({
					msg: i18next.t("data.notify.fail4"),
					type: "warning"
				}), t;
				if ("never" !== n.repeat && (t = t && !FX.Utils.isEmpty(n.finish)), !t) return FX.Msg.toast({
					msg: i18next.t("data.notify.fail3"),
					type: "warning"
				}), t
			}
			var r = e.message;
			return FX.Utils.isEmpty(r) && (e.message = this._getDefaultMessage()), t
		},
		getValue: function() {
			return this.notify
		}
	}), e.shortcut("notifyconfigpane", FX.NotifyConfigPane)
}(jQuery), function(e) {
	FX.ApiConfigPane = FX.extend(FX.Widget, {
		_defaultConfig: function() {
			return e.extend(FX.ApiConfigPane.superclass._defaultConfig.apply(this, arguments), {
				baseCls: "fx_api_config",
				webhook: {},
				onSave: null
			})
		},
		_init: function() {
			FX.ApiConfigPane.superclass._init.apply(this, arguments), this.$content = e('<div class="api-config-content"/>').appendTo(this.element), this._createConfigPane(), this._createBtnPane()
		},
		_createConfigPane: function() {
			var e = this.options;
			this.$apiConfigPane = new FX.TableContainer(this._getPaneConfig()), e.webhook.mode === FX.CONST.WEBHOOK.SERVER_TYPE.FR && this.$apiConfigPane.setRowVisible([5, 6], !1)
		},
		_getPaneConfig: function() {
			var t = this,
				i = FX.CONST.WEBHOOK,
				n = this.options.webhook,
				a = {
					renderEl: e('<div class="config-pane"/>').appendTo(this.$content),
					rowSize: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
					colSize: [450, 250],
					hgap: 20,
					vgap: 5,
					items: [
						[{
							type: "label",
							text: i18next.t("data.api.server"),
							customCls: "pane-label"
						}],
						[{
							widgetName: "serverType",
							type: "combo",
							allowBlank: !1,
							searchable: !1,
							value: n.mode ? n.mode : i.SERVER_TYPE.CUSTOM,
							width: 240,
							items: [{
								text: i18next.t("data.api.server.custom"),
								value: i.SERVER_TYPE.CUSTOM
							}, {
								text: i18next.t("data.api.server.fr"),
								value: i.SERVER_TYPE.FR
							}],
							onAfterItemSelect: function(e, n) {
								var a = t.$apiConfigPane.getWidgetByName("updateDataPushCheck"),
									o = t.$apiConfigPane.getWidgetByName("deleteDataPushCheck");
								switch (n.value) {
								case i.SERVER_TYPE.CUSTOM:
									a.setEnable(!0), o.setEnable(!0), t.$apiConfigPane.setRowVisible([4, 5], !0);
									break;
								case i.SERVER_TYPE.FR:
									a.setValue(!0), a.setEnable(!1), o.setValue(!0), o.setEnable(!1), t.$apiConfigPane.setRowVisible([4, 5], !1)
								}
							}
						}],
						[{
							type: "label",
							text: i18next.t("data.api.serverUrl", {
								url: ""
							}),
							customCls: "pane-label"
						}],
						[{
							widgetName: "serverUrl",
							type: "text",
							width: 450,
							value: n.url ? n.url : "",
							allowBlank: !1
						}, {
							widgetName: "testServer",
							type: "button",
							width: 150,
							style: "green",
							text: i18next.t("data.api.server.test"),
							onClick: function() {
								t._doTestServer()
							}
						}],
						[{
							type: "label",
							text: "Secret",
							customCls: "pane-label"
						}],
						[{
							widgetName: "secret",
							type: "text",
							width: 450,
							value: n.secret ? n.secret : ""
						}, {
							widgetName: "genSecret",
							type: "button",
							width: 150,
							style: "green",
							text: i18next.t("data.api.secret.create"),
							onClick: function() {
								t.$apiConfigPane.getWidgetByName("secret").setValue(FX.Utils.getRandomCode(24))
							}
						}],
						[{
							type: "label",
							text: i18next.t("data.api.pushTime"),
							customCls: "pane-label"
						}]
					]
				};
			return a.items = a.items.concat(this._getPushTimeConfig(n.triggers)), a
		},
		_doTestServer: function() {
			var e = this,
				t = this.getValue();
			if (!t.url) return FX.Msg.toast({
				type: "warning",
				msg: i18next.t("data.api.server.target")
			});
			var i = new FX.Dialog({
				height: 214,
				width: 478,
				style4Header: "white",
				customCls: "server-test-dialog",
				onContentCreate: function(e) {
					e.append('<div class="test-state"><div class="state-icon pending"><i class="icon-server"/></div><div class="state-text">' + i18next.t("data.api.server.connecting") + "</div></div>")
				}
			});
			i.show(), FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.web_hook.test, FX.STATIC.APPID, FX.STATIC.ENTRYID),
				data: {
					webhook: t
				}
			}, function(t) {
				"success" === t.status ? i.rebuildContent({
					onContentCreate: function(e) {
						e.append('<div class="test-state"><div class="state-icon success"><i class="icon-select"/></div><div class="state-text">' + i18next.t("data.api.server.connectSuccess") + "</div></div>")
					}
				}) : (i.element.addClass("test-fail-dialog"), i.rebuildHeader({
					title: i18next.t("data.api.fail"),
					style4Header: "align-left"
				}), i.rebuildContent({
					width: 600,
					height: 500,
					onContentCreate: function(e) {
						var i = FX.Utils.date2Str(new Date(1e3 * t.timestamp), "yyyy-MM-dd HH:mm:ss");
						e.append('<div class="webhook-error-detail"><div class="title">' + i18next.t("data.api.code") + '</div><div class="content error">' + (t.statusCode || "") + '</div><div class="title">' + i18next.t("data.api.logTime") + '</div><div class="content">' + i + '</div><div class="title">' + i18next.t("fail.detail") + '</div><div class="content"><pre><code>' + (t.failInfo || "") + "</code></pre></div></div>")
					}
				}), e.$apiConfigPane.getWidgetByName("serverUrl").setState(FX.States.ERROR))
			})
		},
		_getPushTimeConfig: function(e) {
			var t = this.options,
				i = FX.CONST.WEBHOOK.API_TRIGGER,
				n = [i.CREATE, i.UPDATE, i.REMOVE];
			FX.Utils.isObjectEmpty(e) && (e = n);
			var a = !0,
				o = !0;
			return t.webhook.mode === FX.CONST.WEBHOOK.SERVER_TYPE.FR && (a = !1, o = !1), [
				[{
					widgetName: "newDataPushCheck",
					type: "checkbox",
					text: i18next.t("data.api.trigger.create"),
					value: -1 !== e.indexOf(i.CREATE),
					width: 200,
					enable: !1
				}],
				[{
					widgetName: "updateDataPushCheck",
					type: "checkbox",
					text: i18next.t("data.api.trigger.update"),
					value: -1 !== e.indexOf(i.UPDATE),
					width: 200,
					enable: a
				}],
				[{
					widgetName: "deleteDataPushCheck",
					type: "checkbox",
					text: i18next.t("data.api.trigger.remove"),
					value: -1 !== e.indexOf(i.REMOVE),
					width: 200,
					enable: o
				}]
			]
		},
		_createBtnPane: function() {
			var t = this,
				i = this.options;
			this.$btnPane = e('<div class="btn-pane"/>').appendTo(this.$content), new FX.Button({
				renderEl: e('<div class="btn"/>').appendTo(this.$btnPane),
				style: "green",
				text: i18next.t("save"),
				width: 120,
				onClick: function() {
					if (!t.$apiConfigPane.getWidgetByName("serverUrl").getValue().trim()) return FX.Msg.toast({
						type: "warning",
						msg: i18next.t("data.api.server.target")
					});
					FX.Utils.applyFunc(t, i.onSave, [], !1)
				}
			})
		},
		getValue: function() {
			var e = this.$apiConfigPane.getWidgetByName("serverUrl").getValue().trim(),
				t = this.$apiConfigPane.getWidgetByName("serverType").getValue(),
				i = [],
				n = FX.CONST.WEBHOOK.API_TRIGGER;
			this.$apiConfigPane.getWidgetByName("newDataPushCheck").getValue() && i.push(n.CREATE), this.$apiConfigPane.getWidgetByName("updateDataPushCheck").getValue() && i.push(n.UPDATE), this.$apiConfigPane.getWidgetByName("deleteDataPushCheck").getValue() && i.push(n.REMOVE);
			var a = {
				url: e,
				mode: t,
				triggers: i
			};
			return t === FX.CONST.WEBHOOK.SERVER_TYPE.CUSTOM && (a.secret = this.$apiConfigPane.getWidgetByName("secret").getValue()), a
		}
	}), e.shortcut("apiconfigpane", FX.ApiConfigPane)
}(jQuery), function(e) {
	FX.PrintTemplateSelectPane = FX.extend(FX.BaseSelectPane, {
		_defaultConfig: function() {
			return e.extend(FX.PrintTemplateSelectPane.superclass._defaultConfig.apply(this, arguments), {
				baseCls: "fx_base_select fx_print_template_select",
				title: i18next.t("data.printTemplate"),
				msg: i18next.t("data.printTemplate.select"),
				appId: "",
				formId: "",
				value: null,
				editable: !1,
				items: null,
				multi: !1,
				onStopEdit: null,
				systemTemplate: {
					printId: "system",
					name: i18next.t("data.printTemplate.system")
				}
			})
		},
		_init: function() {
			FX.PrintTemplateSelectPane.superclass._init.apply(this, arguments);
			var e = this,
				t = this.options;
			if (this.value = t.value, this.value || (this.value = t.systemTemplate.printId), t.items) this.items = t.items, this._createContent();
			else {
				var i = FX.Utils.createMask(this.element, {
					isLight: !0,
					hasLoader: !0
				});
				FX.Utils.ajax({
					url: FX.Utils.getApi(FX._API.form.print_tmp.list, t.appId, t.formId)
				}, function(t) {
					e.items = t.templates, i.remove(), e._createContent()
				})
			}
		},
		_createContent: function() {
			var t = this.options;
			this._initSelectMap(), this._createSelectList(), t.editable ? (this._createSelectPane(), e('<a class="link-tip" target="jdy_doc">' + i18next.t("data.printTemplate.learnMore") + "</a>").attr("href", FX.CONFIG.HOST.HELP_DOC_HOST + "/9140").appendTo(this.element)) : this._bindEditEvent()
		},
		_createSelectList: function() {
			var t = this;
			this.options;
			if (this.$selectList ? this.$selectList.empty() : this.$selectList = e('<ul class="select-list"/>').appendTo(this.element), this.value) {
				var i = t.selectMap[this.value];
				t._createSelectItem(i)
			}
		},
		_initSelectMap: function() {
			var e = this;
			this.selectMap = this.selectMap || {}, FX.Utils.forEach(this.items, function(t, i) {
				e.selectMap[i.printId] = i
			})
		},
		_createSelectItem: function(t) {
			var i = FX.PrintTemplateSelectPane.superclass._createSelectItem.apply(this, arguments);
			i && i.attr("data-id", t.groupId).prepend(e('<i class="select-icon icon-print"/>'))
		},
		_addSelectItem: function(e) {
			this.value = e.printId, this.$selectList.empty(), this._createSelectItem(e)
		},
		_createSelectPane: function() {
			var t = FX.PrintTemplateSelectPane.superclass._createSelectPane.apply(this, arguments);
			e('<div class="select-btn select"/>').data("type", "system").text(i18next.t("data.printTemplate.system")).appendTo(t), e('<div class="select-btn"/>').data("type", "custom").text(i18next.t("data.printTemplate.custom")).appendTo(t), this.$selectPane = e('<div class="select-pane"/>').appendTo(this.element), this._createSystemTemplate(), this._bindEvent()
		},
		_createSystemTemplate: function() {
			var t = this,
				i = this.options;
			this.$selectPane.children().hide(), this.$systemList ? this.$systemList.show() : (this.$systemList = e('<ul class="list-template"/>').appendTo(this.$selectPane), t._createTemplateItem(i.systemTemplate, this.$systemList))
		},
		_createCustomsTemplates: function(t) {
			t = t || this.items;
			var i = this,
				n = this.options;
			this.$selectPane.children().hide(), this.$customList ? this.$customList.empty().show() : this.$customList = e('<ul class="list-template"/>').appendTo(this.$selectPane), 0 === FX.Vip.getPTSize() ? e('<div class="empty-tip"/>').append(e('<div class="empty-title"/>').text(i18next.t("data.printTemplate.failForFree"))).append(e('<a class="empty-link" href="/profile/packs" target="pack" />').text(i18next.t("vip.center.pack.purchase"))).appendTo(i.$customList) : (FX.Utils.forEach(t, function(e, t) {
				i._createTemplateItem(t, i.$customList)
			}), 0 === t.length && e('<div class="empty-tip"/>').append(e('<div class="empty-img"/>')).append(e('<div class="empty-title"/>').text(i18next.t("data.printTemplate.empty"))).append(e('<a class="empty-link" />').attr("target", "form-set").attr("href", "/dashboard/app/" + n.appId + "/form/" + n.formId + "/edit?action=print#/set").text(i18next.t("data.printTemplate.createCustom"))).appendTo(i.$customList))
		},
		_createTemplateItem: function(t, i) {
			var n = e('<div class="select-radio x-radio"/>').append(e('<i class="icon-blank"/>'));
			e("<li/>").data("template", t).append(e("<span />").text(t.name)).append(n).appendTo(i), this.value === t.printId && (n.addClass("select"), this._addSelectItem(t))
		},
		_createSearchList: function(t) {
			var i = this;
			this.$selectPane.children().hide(), this.$searchPane ? this.$searchPane.empty().show() : this.$searchPane = e('<div class="search-pane" />').appendTo(this.$selectPane);
			var n = this.$searchPane,
				a = [],
				o = new RegExp(FX.Utils.escapeRegexp(t), "i");
			if (FX.Utils.forEach(this.items, function(e, t) {
				o.test(t.name) && a.push(t)
			}), 0 === a.length) n.append(e('<span class="search-empty"/>').text(i18next.t("data.printTemplate.customEmpty")));
			else {
				var r = e('<ul class="list-template"/>').appendTo(n);
				FX.Utils.forEach(a, function(t, a) {
					e("<li />").text(a.name).data("data", a).on("click", function() {
						n.hide(), i._createCustomsTemplates([a])
					}).appendTo(r)
				})
			}
		},
		_bindEvent: function() {
			var t = this;
			e(".select-menu", this.element).on("click", function(i) {
				var n = e(i.target).closest(".select-btn"),
					a = n.data("type");
				n.length > 0 && (n.addClass("select").siblings().removeClass("select"), "system" === a ? t._createSystemTemplate() : t._createCustomsTemplates())
			}), e(".select-pane", this.element).on("click", function(i) {
				var n = e(i.target).closest("li"),
					a = n.children(".select-radio");
				if (n.length > 0 && a.length > 0) {
					var o = n.data("template");
					a.hasClass("select") || (e(".select-radio", t.element).removeClass("select"), a.addClass("select"), t._addSelectItem(o))
				}
			})
		},
		_getEditConfig: function() {
			var e = this.options;
			return {
				widgetName: "printTemplateSelect",
				type: "printtemplateselectpane",
				value: this.getValue(),
				items: this.items,
				appId: e.appId,
				formId: e.formId,
				editable: !0
			}
		},
		getValue: function() {
			return this.value
		}
	}), e.shortcut("printtemplateselectpane", FX.PrintTemplateSelectPane)
}(jQuery), FX.BackgroundConfigurator = FX.extend(FX.Widget, {
	_defaultConfig: function() {
		return $.extend(FX.BackgroundConfigurator.superclass._defaultConfig.apply(this, arguments), {
			baseCls: "fx_background_configurator",
			modes: ["color", "image"],
			mode: "image",
			recommendColor: null,
			value: {},
			onChange: null
		})
	},
	_init: function() {
		FX.BackgroundConfigurator.superclass._init.apply(this, arguments);
		var e = this.options;
		this.value = e.value || {}, this.mode = e.mode, this.color = this.value.color, this.image = this.value.image, this.$content = $('<div class="config-content"/>').appendTo(this.element), this._renderModeSelect(), this.$selector = $("<div/>").appendTo(this.$content), this._renderSelector(e.mode)
	},
	_renderModeSelect: function() {
		var e = this,
			t = this.options,
			i = {
				color: i18next.t("form.theme.color"),
				image: i18next.t("form.theme.image")
			},
			n = [];
		FX.Utils.forEach(t.modes, function(e, t) {
			n.push({
				text: i[t],
				value: t
			})
		}), new FX.ComboBox({
			renderEl: $("<div/>").appendTo(this.$content),
			items: n,
			value: this.mode,
			enable: n.length > 1,
			searchable: !1,
			allowBlank: !1,
			width: 100,
			minWidth4Trigger: 100,
			onStopEdit: function() {
				var i = this.getValue();
				e.mode !== i && (e.mode = i, t.recommendColor && (e.color = t.recommendColor[0]), e._renderSelector(i), FX.Utils.applyFunc(e, t.onChange, [], !1))
			}
		})
	},
	_renderSelector: function(e) {
		switch (this.$selector.empty(), e) {
		case "color":
			this._renderColorSelector(), this._clearTip();
			break;
		case "image":
			this._renderImageSelector(), this._renderTip()
		}
	},
	_renderColorSelector: function() {
		var e = this,
			t = this.options,
			i = $('<div class="selector-box"><div class="color-selector" style="background-color: ' + this.color + '"/></div>').appendTo(this.$selector);
		i.on("click", function() {
			FX.Msg.bubble({
				anchor: i,
				contentWidget: {
					type: "colorpicker",
					color: e.color,
					recommendColor: t.recommendColor,
					onChange: function(n) {
						e.color = n, $(".color-selector", i).css("background-color", e.color), FX.Utils.applyFunc(e, t.onChange, [], !1)
					}
				},
				minWidth: 250,
				hasTriangle: !1,
				hAdjust: 67,
				contentPadding: 0,
				text4Cancel: null,
				text4Ok: null
			})
		})
	},
	_renderImageSelector: function() {
		var e = this,
			t = this.options;
		new FX.ImageUpload({
			renderEl: $('<div class="image-selector"/>').appendTo(this.$selector),
			uploadToMedia: !0,
			maxLimitTip: i18next.t("image.maxLimitTip"),
			hasPreview: !1,
			hasPreviewList: !1,
			onUploadSuccess: function(i) {
				var n = i[0];
				n && (e.image = FX.CONFIG.HOST.IMAGE_HOST + "/" + n.qnKey, FX.Utils.applyFunc(e, t.onChange, [], !1))
			}
		})
	},
	_renderTip: function() {
		$('<div class="config-tip">' + i18next.t("form.theme.image.tip") + "</div>").appendTo(this.element)
	},
	_clearTip: function() {
		$(".config-tip", this.element).remove()
	},
	getValue: function() {
		var e = this.mode;
		return "image" !== e || this.image || (e = "color"), {
			mode: e,
			color: this.color,
			image: this.image
		}
	}
}), $.shortcut("backgroundconfigurator", FX.BackgroundConfigurator), FX.TextConfigurator = FX.extend(FX.Widget, {
	_defaultConfig: function() {
		return $.extend(FX.TextConfigurator.superclass._defaultConfig.apply(this, arguments), {
			baseCls: "fx_text_configurator",
			value: {},
			recommendColor: null,
			fontSizes: [16, 18, 20, 22, 24, 26, 28, 30, 32, 34],
			onChange: null
		})
	},
	_init: function() {
		FX.TextConfigurator.superclass._init.apply(this, arguments);
		var e = this.options;
		this.value = e.value || {}, this._renderAlign(), this._renderStyle()
	},
	_renderAlign: function() {
		var e = this,
			t = this.options,
			i = $('<div class="text-config"/>').appendTo(this.element),
			n = this.value["text-align"] || "left";
		new FX.Label({
			renderEl: $('<div class="config-label"/>').appendTo(i),
			text: i18next.t("form.theme.align"),
			height: 25
		}), new FX.Segment({
			renderEl: $('<div class="config-selector"/>').appendTo(i),
			items: [{
				iconCls: "icon-align-left",
				value: "left"
			}, {
				iconCls: "icon-align-center",
				value: "center"
			}, {
				iconCls: "icon-align-right",
				value: "right"
			}],
			height: 25,
			onAfterItemSelect: function() {
				$.extend(e.value, {
					"text-align": this.getValue()
				}), FX.Utils.applyFunc(e, t.onChange, [], !1)
			}
		}).setValue(n)
	},
	_renderStyle: function() {
		var e = $('<div class="text-config"/>').appendTo(this.element);
		new FX.Label({
			renderEl: $('<div class="config-label"/>').appendTo(e),
			text: i18next.t("form.theme.style"),
			height: 25
		});
		var t = $('<div class="config-selector"/>').appendTo(e);
		this._renderFontSize(t), this._renderFontAttr(t), this._renderColor(t)
	},
	_renderFontSize: function(e) {
		var t = this.options,
			i = this,
			n = this.value["font-size"] || 20,
			a = $('<div class="drop-selector"><span class="font-size">' + n + '</span><i class="icon-caret-down"/></div>').appendTo(e).on("click", function() {
				i._renderFontSizeList(a, n, function(e) {
					$.extend(i.value, {
						"font-size": e
					}), a.children(".font-size").text(e), FX.Utils.applyFunc(i, t.onChange, [], !1)
				})
			})
	},
	_renderFontAttr: function(e) {
		var t = this,
			i = this.options,
			n = this.value["font-weight"],
			a = this.value["text-decoration"] || [],
			o = this.value["font-style"];
		$('<div class="button-selector"><div role="weight" class="button-item ' + ("bold" === n ? "selected" : "") + '"><i class="icon-bold"/></div><div role="style" class="button-item ' + ("italic" === o ? "selected" : "") + '"><i class="icon-italic"/></div><div role="decoration" class="button-item ' + ("underline" === a.join("") ? "selected" : "") + '"><i class="icon-underline"/></div></div>').appendTo(e).on("click", ".button-item", function(e) {
			var n = $(e.currentTarget);
			n.toggleClass("selected");
			var a = n.hasClass("selected"),
				o = {};
			switch (n.attr("role")) {
			case "weight":
				o["font-weight"] = a ? "bold" : "normal";
				break;
			case "decoration":
				o["text-decoration"] = a ? ["underline"] : [];
				break;
			case "style":
				o["font-style"] = a ? "italic" : "normal"
			}
			$.extend(t.value, o), FX.Utils.applyFunc(t, i.onChange, [], !1)
		})
	},
	_renderColor: function(e) {
		var t = this.options,
			i = this,
			n = this.value.color,
			a = $('<div class="drop-selector"><i class="icon-color"/><i class="icon-caret-down"/></div>').appendTo(e).on("click", function() {
				FX.Msg.bubble({
					anchor: a,
					contentWidget: {
						type: "colorpicker",
						color: n,
						recommendColor: t.recommendColor,
						onChange: function(e) {
							i.value.color = e, $(".icon-color", a).css("color", e), FX.Utils.applyFunc(i, t.onChange, [], !1)
						}
					},
					minWidth: 250,
					hasTriangle: !1,
					hAdjust: 15,
					contentPadding: 0,
					text4Cancel: null,
					text4Ok: null
				})
			})
	},
	_renderFontSizeList: function(e, t, i) {
		var n = this.options,
			a = $('<ul class="fx_text_configurator_drop"/>').on("click", ".drop-item", function(e) {
				var t = $(e.currentTarget);
				i && i(parseInt(t.text())), o.close()
			});
		FX.Utils.forEach(n.fontSizes, function(e, t) {
			$('<li class="drop-item">' + t + "</li>").appendTo(a)
		});
		var o = FX.Msg.bubble({
			anchor: e,
			text4Cancel: null,
			text4Ok: null,
			minWidth: 75,
			hAdjust: 28,
			contentHTML: a,
			contentPadding: 0
		})
	},
	getValue: function() {
		return this.value
	}
}), $.shortcut("textconfigurator", FX.TextConfigurator), FX.FormThemePane = FX.extend(FX.Widget, {
	_defaultConfig: function() {
		return $.extend(FX.FormThemePane.superclass._defaultConfig.apply(), {
			baseCls: "fx_form_theme",
			theme: {
				mode: "system",
				system: FX.THEME.DEFAULT_SYSTEM_THEME
			},
			form: {}
		})
	},
	_init: function() {
		FX.FormThemePane.superclass._init.apply(this, arguments);
		var e = this.options;
		this.form = e.form, this.theme = $.extend(!0, {}, e.theme), this._initRecommendColor(), this._renderTheme(), this._renderSettings(), this._refreshTheme()
	},
	_initRecommendColor: function() {
		this.ColorStore = {
			BACKGROUND: ["#F4F9F9", "#FEF5E7", "#EDF6E7", "#FEF1D2", "#FEE9BB", "#F2EEDA", "#E9E3C1", "#D8DDDD", "#EDF1F6", "#FFECEE", "#FFDFE3", "#F7F4F4", "#ECF2FF", "#EAE5F9", "#F1EDFB"],
			TITLE: ["#00A2FF", "#0076BA", "#014D80", "#16E7CF", "#00A89D", "#007C77", "#60D937", "#1DB100", "#017101", "#FAE231", "#F9BA00", "#FF9300", "#FF634E", "#ED230D", "#B41700", "#FFFFFF", "#5E5E5E", "#1F2D3D"],
			BUTTON: ["#5EA3A3", "#0DB3A6", "#278EA5", "#5ACE48", "#38C379", "#359254", "#27B7F2", "#3D79ED", "#5254FC", "#FF8B6A", "#F47645", "#C56868", "#F6AD38", "#EC9811", "#E77E09", "#706381", "#6F4E4E", "#2D3B53"],
			BANNER: ["#0DB3A6", "#5EA3A3", "#278EA5", "#5ACE48", "#38C379", "#359254", "#27B7F2", "#3D79ED", "#5254FC", "#FF8B6A", "#F47645", "#C56868", "#F6AD38", "#EC9811", "#E77E09", "#706381", "#6F4E4E", "#2D3B53"]
		}
	},
	_renderSettings: function() {
		var e = this;
		FX.Vip.hasCustomTheme() || "custom" !== this.theme.mode || (this.theme.mode = "system", this.theme.system = FX.THEME.DEFAULT_SYSTEM_THEME), this.$settings = $('<div class="setting-pane"><div class="setting-tab"><div class="tab-item ' + ("system" === this.theme.mode ? "selected" : "") + '" role="system">' + i18next.t("form.theme.system") + '</div><div class="tab-item ' + ("custom" === this.theme.mode ? "selected" : "") + '" role="custom">' + i18next.t("form.theme.custom") + '</div></div><div class="setting-content"></div></div>').appendTo(this.element), this.$settings.on("click", ".tab-item", function(t) {
			var i = $(t.currentTarget);
			e._renderSettingContent(i.attr("role")) && i.addClass("selected").siblings().removeClass("selected")
		}), this._renderSettingContent(this.theme.mode)
	},
	_renderSettingContent: function(e) {
		switch (e) {
		case "system":
			this._renderSystemList();
			break;
		case "custom":
			if (!FX.Vip.hasCustomTheme()) return void FX.Vip.showUpgradeTip({
				code: FX.CONST.VIP_ERR_NAME_MAP.CUSTOM_THEME
			});
			this._renderCustomPane()
		}
		return !0
	},
	_renderSystemList: function() {
		var e = this,
			t = this.$settings.children(".setting-content").empty(),
			i = $('<ul class="system-theme-list">').appendTo(t),
			n = 0;
		FX.Utils.forEach(FX.THEME.EXTERNAL_FORM_THEME, function(t) {
			var a = FX.CONFIG.HOST.ASSETS_HOST + "/resources/images/theme/form/tn_" + n + ".png";
			n++;
			var o = $('<div class="system-theme"><div class="theme-background"><img src="' + a + '"/></div></div>').appendTo(i).data("theme", t);
			t === e.theme.system && o.addClass("selected")
		}), i.on("click", ".system-theme", function(t) {
			var i = $(t.currentTarget);
			i.addClass("selected").siblings().removeClass("selected"), e.theme = {
				mode: "system",
				system: i.data("theme")
			}, e._refreshTheme()
		})
	},
	_renderCustomPane: function() {
		var e = this,
			t = this.$settings.children(".setting-content").empty();
		"system" === this.theme.mode && (this.theme.mode = "custom", this.theme.custom = $.extend(!0, {}, FX.THEME.DEFAULT_FORM_THEME, FX.THEME.EXTERNAL_FORM_THEME[this.theme.system])), this.theme.custom || (this.theme.custom = {});
		var i = this.theme.custom;
		new FX.ConfigPane({
			renderEl: $('<div class="custom-theme-set"/>').appendTo(t),
			items: [{
				label: i18next.t("form.theme.background"),
				widget: {
					type: "backgroundconfigurator",
					recommendColor: e.ColorStore.BACKGROUND,
					mode: i.background && i.background.mode,
					value: {
						color: i.background && i.background.color,
						image: i.background && i.background.image
					},
					onChange: function() {
						$.extend(i, {
							background: this.getValue()
						}), e._refreshTheme()
					}
				},
				splitLine: !0
			}, {
				label: i18next.t("form.theme.banner"),
				widget: {
					type: "backgroundconfigurator",
					recommendColor: e.ColorStore.BANNER,
					mode: i.banner && i.banner.mode,
					value: {
						color: i.banner && i.banner.color,
						image: i.banner && i.banner.image
					},
					onChange: function() {
						$.extend(i, {
							banner: this.getValue()
						}), e._refreshTheme()
					}
				},
				splitLine: !0
			}, {
				label: i18next.t("form.theme.title"),
				widget: {
					type: "textconfigurator",
					recommendColor: e.ColorStore.TITLE,
					value: i.title,
					onChange: function() {
						$.extend(i, {
							title: this.getValue()
						}), e._refreshTheme()
					}
				},
				splitLine: !0
			}, {
				label: i18next.t("form.theme.button"),
				widget: {
					type: "backgroundconfigurator",
					recommendColor: e.ColorStore.BUTTON,
					mode: "color",
					modes: ["color"],
					value: {
						color: i.submit_btn && i.submit_btn["background-color"]
					},
					onChange: function() {
						$.extend(i, {
							submit_btn: {
								"background-color": this.getValue().color
							}
						}), e._refreshTheme()
					}
				},
				splitLine: !0
			}]
		})
	},
	_renderTheme: function() {
		var e = this.options,
			t = $('<div class="theme-pane"/>').appendTo(this.element),
			i = $('<div class="design-content fui-form"/>');
		this.externalForm = new FX.ExternalFormPane({
			renderEl: $('<div class="theme-content"/>').appendTo(t),
			form: e.form,
			theme: this.theme,
			hasCustomTheme: FX.Vip.hasCustomTheme(),
			content: i
		}), FX.Utils.forEach(this.form.items, function(e, t) {
			new FX.FormDesignItem({
				renderEl: $('<div class="widget-view"/>').appendTo(i),
				label: t.label,
				description: t.description,
				lineWidth: t.lineWidth,
				widget: t.widget
			})
		}), this._renderPreviewBtn(t)
	},
	_renderPreviewBtn: function(e) {
		var t = this.options.form;
		$('<a href="/_/admin/app/' + t.appId + "/form/" + t.entryId + '/preview" target="form_preview" class="preview-btn"><i class="icon-computer-phone"/>').appendTo(e)
	},
	_refreshTheme: function() {
		var e = this.options.form;
		FX.Store.set(FX.Store.getKey("formTheme"), {
			theme: this.theme,
			id: [e.entryId, e.appId].join(FX.CONST.FIELD.DELIMITER)
		}), this.externalForm.setTheme(this.theme)
	},
	getValue: function() {
		return this.theme
	}
}), $.shortcut("formthemepane", FX.FormThemePane), function(e) {
	FX.FormUtils = FX.FormUtils || {}, e.extend(FX.FormUtils, {
		doSaveFormSet: function(e, t, i, n) {
			var a = this;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.update, FX.STATIC.APPID, FX.STATIC.ENTRYID),
				data: e
			}, function(e, i) {
				FX.Utils.applyFunc(a, t, [], !1)
			}, function(e) {
				i ? FX.Utils.applyFunc(a, i, [e], !1) : FX.Msg.toast({
					type: "error",
					msg: i18next.t("saveInfo.fail")
				})
			}, function() {
				FX.Utils.applyFunc(a, n, [], !1)
			})
		},
		getAllEntryList: function(e) {
			return [FX.FormUtils.getCurrentEntry(e)].concat(e.entryList)
		},
		getCurrentEntry: function(e) {
			var t = [];
			return FX.Utils.forEach(e.formItems, function(e, i) {
				var n = FX.Utils.getFieldAttr(i);
				n && t.push(n)
			}), {
				entryId: e.entryId,
				name: e.formName,
				type: "form",
				fields: t
			}
		}
	})
}(jQuery), function(e) {
	FX.EditForm = FX.EditForm || {}, e.extend(FX.EditForm, {
		init: function(t) {
			FX.STATIC.ENTRYID = t.entryId, this.formConfig = new FX.FormConfig(t), this.$factory = e(".fx-factory"), this.$oContent = e(".form-other-content"), this._initMenu(t), this._initData(t)
		},
		_initMenu: function(t) {
			var i = this;
			this.hasCoop = t.hasCoop;
			var n = '<div class="frame-edit-navibar"><a class="nav-btn design" role="design"><i class="icon-paper"/><span>' + i18next.t("form.design") + "</span></a>";
			t.hasCoop || (n += '<a class="nav-btn flow" role="flow"><i class="icon-flowchart"/><span>' + i18next.t("flow.setting") + "</span></a>"), n += '<a class="nav-btn datamanager" role="data"><i class="icon-chart"/><span>' + i18next.t("form.data") + '</span></a><a class="nav-btn set" role="set"><i class="icon-set"/><span>' + i18next.t("form.set") + "</span></a></div>", e(n).appendTo(e("#header")), this.naviBar = new FX.NavigationBar({
				renderEl: e("<div/>").prependTo(e("#header")),
				left: {},
				right: {
					hasMobile: !0,
					hasHelp: !0,
					hasNews: !0,
					hasUser: !0,
					hasUserGuide: !0
				},
				showUserGuide: function() {
					i.showUserGuide()
				},
				page: "form_design"
			})
		},
		showUserGuide: function() {
			this.needFormGuide = !1, e(".frame-edit-navibar .design").hasClass("active") ? (FX.Cookie.set(FX.CONST.COOKIE.FORM_GUIDE.KEY, !0, {
				expires: FX.CONST.COOKIE.FORM_GUIDE.EXPIRES,
				path: "/"
			}), this.formDesign.renderAddWidgetGuide()) : (FX.Utils.redirectTo("#/"), this.needFormGuide = !0)
		},
		_initData: function() {
			var e = this;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.edit, FX.STATIC.APPID, FX.STATIC.ENTRYID)
			}, function(t) {
				e.formConfig.setConfig(t), e._initHead(), e._initRouter(), e._bindEvents()
			}, function(e) {
				var t = e.responseJSON || {};
				FX.Msg.toast({
					type: "error",
					msg: FX.Utils.getErrMsg(t) || i18next.t("form.load.fail")
				})
			})
		},
		_bindEvents: function() {
			var t = this;
			e(".frame-edit-navibar", e("#header")).on("click", function(i) {
				var n = e(i.target).closest(".nav-btn");
				if (n.length) {
					var a = n.attr("role");
					t._compareAndSaveConfirm(function() {
						t.router.setRoute("design" === a ? "/" : "/" + a)
					})
				}
			})
		},
		_initHead: function() {
			var t = this,
				i = this.formConfig.getConfig();
			new FX.EntryTitle({
				renderEl: e("<div/>").appendTo(e(".nav-left").empty()),
				appId: FX.STATIC.APPID,
				entryId: i.entryId,
				entryType: "form",
				name: i.formName,
				defaultName: i18next.t("form.defaultName"),
				onStopEdit: function(e) {
					FX.Utils.dt(FX.CONST.TRACKER.FORM_RENAME), e.name && (t.formConfig.setFormName(e.name), t.formDesign && t.formDesign.updateConfig({
						formName: e.name
					}), t.setPageTitle())
				},
				onNavHome: function() {
					t._compareAndSaveConfirm(function() {
						FX.Utils.redirectTo("/dashboard#/app/" + FX.STATIC.APPID + "/edit")
					})
				}
			})
		},
		_compareAndSaveConfirm: function(e) {
			var t = this,
				i = FX.CONST.SAVE_CONFIRM_PANE;
			switch (this.currentPane) {
			case i.FORM_DESIGN:
				this.formDesign.compareFormConfig() ? e && e() : FX.UI.showSaveConfirm({
					key: i18next.t("form.design"),
					onSave: function() {
						t.formDesign.doSave(function() {
							e && e()
						})
					},
					onCancel: function() {
						t.formDesign.clearCache(), e && e()
					}
				});
				break;
			case i.FLOW_DESIGN:
				this.formFlow.compareFlowAndSaveConfirm(function() {
					e && e()
				});
				break;
			case i.FORM_SET:
				this.formSet.compareSetAndSaveConfirm(function() {
					e && e()
				});
				break;
			default:
				e && e()
			}
		},
		_initRouter: function() {
			var e = this;
			this.router = Router({
				"/": function() {
					e._dealNaviEvent("design")
				},
				"/:target": function(t) {
					e._dealNaviEvent(t)
				}
			}), this.router.init("/")
		},
		_dealNaviEvent: function(t) {
			var i = e(".frame-edit-navibar");
			FX.Utils.removeBodyPopup();
			var n = FX.CONST.SAVE_CONFIRM_PANE;
			switch (this.currentPane = null, t) {
			case "design":
				this.setPageTitle(i18next.t("form.design")), this.currentPane = n.FORM_DESIGN, this.naviBar.setCurPage("form_design"), e(".design", i).addClass("active").siblings().removeClass("active"), this.$oContent.hide(), this.$factory.show(), this.formDesign = new FX.FormDesign(this.formConfig, this.$factory), (!FX.Utils.isRegtimeBeforeUpdate("formGuide") && !FX.Cookie.get(FX.CONST.COOKIE.FORM_GUIDE.KEY) || this.needFormGuide) && this.showUserGuide();
				break;
			case "data":
				this.setPageTitle(i18next.t("form.data")), this.naviBar.setCurPage("data_manager"), e(".datamanager", i).addClass("active").siblings().removeClass("active"), this.$factory.hide(), this.$oContent.empty().show(), new FX.FormDataManage(this.formConfig, this.$oContent);
				break;
			case "set":
				this.setPageTitle(i18next.t("form.set")), this.currentPane = n.FORM_SET, this.naviBar.setCurPage("form_set"), e(".set", i).addClass("active").siblings().removeClass("active"), this.$factory.hide(), this.$oContent.empty().show(), this.formSet = new FX.FormSet(this.formConfig, this.$oContent);
				break;
			case "flow":
				this.setPageTitle(i18next.t("flow.setting")), this.currentPane = n.FLOW_DESIGN, this.naviBar.setCurPage("flow_design"), FX.Utils.dt(FX.CONST.TRACKER.WORKFLOW), e(".flow", i).addClass("active").siblings().removeClass("active"), this.$factory.hide(), this.$oContent.empty().show(), this.formFlow = new FX.FormFlow(this.formConfig, this.$oContent)
			}
		},
		setPageTitle: function(e) {
			var t = this.formConfig.getConfig();
			this.pageTitle = e || this.pageTitle, FX.Utils.setPageTitle(i18next.t("title.form", {
				title: this.pageTitle,
				name: t.formName
			}))
		},
		getAllEntryList: function() {
			var e = this.formConfig.getConfig();
			return FX.FormUtils.getAllEntryList(e)
		},
		getEntryList: function(e) {
			var t = this.formConfig.getConfig(),
				i = [].concat(t.entryList);
			return e ? i.concat(t.aggregateList) : i
		},
		getFormLayout: function() {
			return this.formDesign ? this.formDesign.formLayout : this.formConfig.getConfig().formLayout
		},
		getFormAttr: function() {
			return this.formConfig.getConfig().formAttr
		},
		collectItems: function(e) {
			return this.formDesign ? this.formDesign.collectItems(e) : []
		},
		getConfigPane: function() {
			return this.formDesign ? this.formDesign.configPane : {}
		},
		getNextItems: function(e) {
			return this.formDesign ? this.formDesign.getNextItems(e) : []
		},
		getFieldLabelMap: function() {
			return this.formDesign ? this.formDesign.getFieldLabelMap() : {}
		}
	})
}(jQuery), function(e) {
	FX.FormConfig = function(e) {
		this.config = {
			isDingtalkAdmin: "dingtalk" === e.corpType,
			isWechatAdmin: "wechat" === e.corpType
		}
	}, e.extend(FX.FormConfig.prototype, {
		setConfig: function(t) {
			e.extend(this.config, {
				_id: t._id,
				entryId: t.entryId,
				formName: t.name,
				content: t.content,
				formItems: t.content && t.content.items || [],
				formLayout: t.content && t.content.layout || "normal",
				formSubmitRule: t.content && t.content.submitRule,
				formValidators: t.content && t.content.validators || [],
				formHasCache: t.attr && t.attr.hasCache,
				formTheme: t.attr && t.attr.theme,
				entryList: t.fields.form,
				aggregateList: t.fields.aggregate_table,
				formAttr: t.attr,
				hasSignature: FX.Vip.hasSignature()
			})
		},
		updateConfig: function(t) {
			e.extend(this.config, {
				formLayout: t.layout,
				formItems: t.items,
				formSubmitRule: t.submitRule,
				formValidators: t.validators,
				formHasCache: t.hasCache,
				formTheme: t.theme,
				formAttr: t.formAttr
			})
		},
		getConfig: function() {
			return this.config || {}
		},
		setFormName: function(t) {
			e.extend(this.config, {
				formName: t
			})
		}
	})
}(jQuery), function(e) {
	FX.FormDesign = function(e, t) {
		this.$content = t, this.formConfig = e, this.config = FX.Utils.pick(e.getConfig(), ["_id", "entryId", "formName", "formAttr", "formItems", "formLayout", "formSubmitRule", "formValidators", "formHasCache", "formTheme", "entryList", "content", "hasSignature"]), this.hasCoop = this.config.formAttr.hasCoop, this.showDesignView()
	}, e.extend(FX.FormDesign.prototype, {
		CONST: {
			widgets: [{
				category: i18next.t("form.fields.basis"),
				list: ["text", "textarea", "number", "datetime", "radiogroup", "checkboxgroup", "combo", "combocheck", "separator"]
			}, {
				category: i18next.t("form.fields.enhance"),
				list: ["address", "location", "image", "upload", "subform", "linkquery", "linkdata", "signature", "sn", "phone"]
			}, {
				category: i18next.t("form.fields.member"),
				list: ["user", "usergroup", "dept", "deptgroup"]
			}]
		},
		showDesignView: function() {
			var e = this.config;
			FX.STATIC.EntryRecNo = 1, FX.STATIC.ENTRYID = e.entryId, this._renderContainer(), this._initWrapper(), this._initFormBtns(), this._initContent(), this._initFormConfig(), this._bindEvent(), this._initFormBanner(), this._initWidgetConfig()
		},
		_initFormBanner: function() {
			if (!FX.Vip.hasSignature() && this._hasWidgetType("signature", this.config.formItems)) {
				var t = e("#form-widget-list"),
					i = '<i class="icon-warning-circle"/>',
					n = e("#fx-frame-center > .btn-bar").outerHeight();
				FX.Utils.isCorpCreator() ? i += i18next.t("form.vip.signature.admin") + '<a href="' + FX.Utils.getApi(FX.API.profile.order_compare) + '?addon=signature">' + i18next.t("vip.upgrade.yes") + "</a>" : i += i18next.t("form.vip.signature.mem");
				var a = e("<div/>");
				t.before(a), new FX.Alert({
					renderEl: a,
					closable: !0,
					type: "error",
					messageContent: i,
					onClose: function() {
						t.css("top", n)
					}
				}), t.css("top", n + a.outerHeight())
			}
		},
		_hasWidgetType: function(e, t) {
			if (!e || !t) return !1;
			var i = !1,
				n = this;
			return FX.Utils.forEach(t, function(t, a) {
				if (e.indexOf(a.widget.type) > -1) return i = !0, !1;
				"subform" !== a.widget.type || (i = n._hasWidgetType(e, a.widget.items))
			}), i
		},
		_renderContainer: function() {
			e("#fx-frame-west", this.$content).find("ul").sortable("destroy"), this.$content.empty(), this.$content.append(this._getLeftContainer()).append(this._getRightContainer()).append(this._getCenterContainer())
		},
		_getLeftContainer: function() {
			var t = this,
				i = '<div id ="fx-frame-west"><div class="frame-inner-list">';
			return FX.Utils.forEach(this.CONST.widgets, function(e, n) {
				i += t._getWidgetCateContent(n.list, n.category)
			}), e(i)
		},
		_getWidgetCateContent: function(e, t) {
			var i = '<div class="widget-cate">' + t + "</div>";
			return i += "<ul>", FX.Utils.forEach(e, function(e, t) {
				var n = FX.CONST.WIDGET_LIST[t] && FX.CONST.WIDGET_LIST[t].name;
				i += '<li class="form-edit-widget-label" xtype="' + t + '"><a><i class="icon-widget-' + t + '"/><span>' + n + "</span></a></li>"
			}), i += "</ul>"
		},
		_getRightContainer: function() {
			var t = '<div class="form-tab-select" id="fx-frame-east"><div class="config-tab"><div class="widget-tab">' + i18next.t("form.attr.field") + '</div><div class="form-tab">' + i18next.t("form.attr") + '</div></div><div class="config-content"><div id="widget-config-pane"/><div id="form-config-pane"/></div></div>';
			return e(t)
		},
		_getCenterContainer: function() {
			var t = '<div class="fui-form" id="fx-frame-center"><div class="btn-bar"/><div id="form-widget-list"><ul class="frame-inner-list"></ul><div class="form-empty"><div class="img"/><span>' + i18next.t("form.fields.add") + "</span></div></div></div>";
			return e(t)
		},
		_initWrapper: function() {
			var t = this;
			this.$configPane = e("#widget-config-pane", this.$content), this.$widgetWrapper = e("#form-widget-list", this.$content).children("ul");
			var i = e("#fx-frame-west", this.$content).find("ul");
			i.on("click", ".form-edit-widget-label", function(i) {
				var n = e(i.currentTarget),
					a = t.$widgetWrapper.children("li.widget-select");
				t._appendNewWidget(n, a)
			});
			var n = {},
				a = {};
			i.sortable({
				nested: !1,
				group: "no-drop",
				drop: !1,
				pullPlaceholder: !1,
				scroll: !0,
				onDragStart: function(e, t, i) {
					var o = e.offset(),
						r = t.rootGroup.pointer;
					a = o, n = {
						left: r.left - o.left,
						top: r.top - o.top
					}, t.options.drop ? e.hasClass("widget-view") ? t.options.nested = !1 : FX.Utils.forEach(t.group.containers, function(e, i) {
						i !== t && i.disable()
					}) : (e.clone(!0).insertAfter(e), e.width(e.width()).appendTo("body"), FX.LimitFields.subform.indexOf(e.attr("xtype")) < 0 && FX.Utils.forEach(t.group.containers, function(e, t) {
						t.options.nested = !1
					})), i(e)
				},
				onDrag: function(e, t, i) {
					e.hasClass("row-item") ? (t.left -= n.left, t.top = a.top) : e.hasClass("form-edit-widget-label") ? (t.left -= n.left, t.top -= n.top) : (t.left = 0, t.top -= n.top), i(e, t)
				},
				onDrop: function(e, i, n) {
					if (n(e), i && i.options.drop) {
						var a = i.el.closest("li.widget-view");
						e.hasClass("form-edit-widget-label") ? (a.length ? t._appendNewSubWidget(e) : t._appendNewWidget(e, e), e.remove()) : e.hasClass("row-item") && a.length && t._swapSubWidget(i, a)
					}
					i && FX.Utils.forEach(i.group.containers, function(e, t) {
						t.options.nested = !0, t.enable()
					})
				},
				onCancel: function(e) {
					e.hasClass("form-edit-widget-label") && e.remove()
				},
				getScrollEl: function(e, t) {
					return t.options.scroll ? null : t.el
				}
			}), this.$widgetWrapper.sortable({
				group: "no-drop"
			}), e("ul").sortable({
				group: "no-drop"
			}), this.$widgetWrapper.click(function(i) {
				var n = e(i.target),
					a = n.closest("li");
				if (n.hasClass("btn-delete")) {
					var o = a.data("widget");
					if (!FX.Utils.isValueWidget(o.getWidgetType())) return void t._doWidgetRemove(a);
					FX.Msg.bubble({
						anchor: n,
						contentHTML: e('<div class="delete-confirm-info"/>').text(i18next.t("form.fields.delete")),
						dockPosition: "right",
						type: "error",
						text4Ok: i18next.t("delete"),
						onOk: function() {
							t._doWidgetRemove(a)
						}
					})
				} else if (n.hasClass("btn-copy")) {
					if (n.hasClass("x-ui-disable")) return;
					t._dowWidgetCopy(a)
				} else a.length > 0 && t._setWidgetSelect(a)
			})
		},
		_appendNewWidget: function(e, t) {
			var i, n = e.attr("xtype"),
				a = e.find("span").text();
			if ("grid-2" === this.formLayout && this._isSupportGrid(n) && (i = FX.FormDesignUtils.getHalfLineWidth()), "signature" !== n || this.config.hasSignature) if ("sn" === n && this._hasWidgetType("sn", this.collectItems())) FX.Msg.toast({
				type: "warning",
				msg: i18next.t("widget.sn.oneTip")
			});
			else {
				var o = FX.FormUtils.getWidgetDefaultConfig(n);
				this.insertWidget(t, a, null, i, o), this._adjustScroll(t)
			} else FX.Vip.showUpgradeTip({
				code: FX.CONST.VIP_ERR_NAME_MAP.SIGNATURE
			})
		},
		_appendNewSubWidget: function(t) {
			var i = t.attr("xtype"),
				n = t.find("span").text(),
				a = t.index();
			if (!(FX.LimitFields.subform.indexOf(i) < 0)) {
				var o = e.extend({
					widgetName: FX.Utils.createWidgetName(),
					type: i
				}, FX.FormUtils.getWidgetDefaultConfig(i));
				this._insertSubWidget(t, n, o, a, o.widgetName)
			}
		},
		_adjustScroll: function(e) {
			if (e.length) {
				var t = e.offset().top - this.$widgetWrapper.offset().top,
					i = this.$widgetWrapper.height(),
					n = this.$widgetWrapper[0].scrollTop;
				(t < 0 || t + e.outerHeight() > i) && this.$widgetWrapper.scrollTop(n + t - 80)
			} else this.$widgetWrapper.scrollTop(this.$widgetWrapper[0].scrollHeight)
		},
		insertWidget: function(t, i, n, a, o) {
			FX.Utils.dt(FX.CONST.TRACKER.FORM_FIELD_ADD);
			var r = e('<li class="widget-view"/>');
			t.length ? r.insertAfter(t) : r.appendTo(this.$widgetWrapper), this._addWidget({
				label: i,
				description: n,
				lineWidth: a,
				widget: o
			}, r), this._setWidgetSelect(r)
		},
		_insertSubWidget: function(e, t, i, n, a) {
			var o = e.closest("li.widget-view").data("widget"),
				r = o.getOptions().widget;
			r.items.splice(n, 0, {
				label: t,
				widget: i
			}), o.updateField(r, !0);
			var s = o.getSubField(a);
			s && this._setWidgetSelect(s.element)
		},
		_swapSubWidget: function(t, i) {
			var n = i.data("widget"),
				a = n.getOptions(),
				o = [];
			FX.Utils.forEach(t.el.children("li"), function(t, i) {
				o.push(e(i).data("widget").getOptions())
			}), a.widget.items = o, n.updateField(a.widget), this._updateFormItemMap(a), this._setWidgetSelect(i)
		},
		_dowWidgetCopy: function(t) {
			var i = this,
				n = e.extend(!0, {}, t.data("widget").getOptions());
			n.widget.widgetName = FX.Utils.createWidgetName(), "subform" === n.widget.type && (n.widget.rely && (n.widget.rely = null), FX.Utils.forEach(n.widget.items, function(e, t) {
				t.widget.widgetName = FX.Utils.createWidgetName(), t.widget.rely = null
			})), n.subform ? i._insertSubWidget(t, n.label, n.widget, n.idx + 1, n.widget.widgetName) : i.insertWidget(t, n.label, n.description, n.lineWidth, n.widget)
		},
		_doWidgetRemove: function(t) {
			var i = this,
				n = t.data("widget").getOptions();
			if (n.subform) {
				var a = t.closest("li.widget-view"),
					o = a.data("widget"),
					r = o.getOptions().widget;
				r.items.splice(n.idx, 1), o.updateField(r, !0), i._setWidgetSelect(a)
			} else t.fadeOut(function() {
				if (i.$configPane.empty(), t.hasClass("widget-select")) {
					var n = t.next();
					if (n && n.length > 0) i._setWidgetSelect(n);
					else {
						var a = t.prev();
						a && a.length > 0 && i._setWidgetSelect(a)
					}
				}
				e(this).remove()
			})
		},
		_initFormBtns: function() {
			var t = e(".btn-bar", this.$content),
				i = this,
				n = this.config;
			new FX.EntryShare({
				renderEl: e('<div class="btn-share" />').appendTo(t),
				entryId: n.entryId,
				formId: n._id,
				formName: n.formName,
				hasCoop: n.formAttr.hasCoop,
				openLink: FX.Utils.pick(n.formAttr, ["publicPwd", "isPublic", "extParams", "hasExtParams"]),
				onClick: function() {
					i.doSave(), this.updateOpenLink(FX.Utils.pick(n.formAttr, ["publicPwd", "isPublic", "extParams", "hasExtParams"]))
				},
				onStopEdit: function(t) {
					var a = e.extend({}, n.formAttr, t);
					i.updateConfig({
						formAttr: a
					})
				},
				onClose: function() {
					i._renderDataManagerGuide()
				}
			}), new FX.Button({
				renderEl: e('<div class="btn-save"/>').appendTo(t),
				style: "border-green",
				text: i18next.t("save"),
				width: 80,
				height: 30,
				onClick: function() {
					i.doSave(function() {
						FX.Msg.toast({
							type: "success",
							msg: i18next.t("saveInfo.success")
						})
					})
				}
			}), new FX.Button({
				renderEl: e('<div class="btn-preview"/>').appendTo(t),
				style: "none",
				iconCls: "icon-preview",
				text: i18next.t("preview"),
				width: 60,
				height: 30,
				onClick: function() {
					i.doPreview()
				}
			})
		},
		compareFormConfig: function() {
			var e = this.collectItems(),
				t = this.config.formItems || [];
			if (e.length !== t.length) return !1;
			var i = !0;
			FX.Utils.forEach(e, function(e, n) {
				if (!FX.FormDesignUtils.compareSaveItems(n, t[e])) return i = !1, !1
			});
			var n = this.oriFormConfig;
			return i && (i = n.hasCache === this.hasCache && n.submitRule === this.submitRule && n.formLayout === this.formLayout && n.validators.length === this.validators.length && FX.Utils.skipEmptyStringify(n.validators).length === FX.Utils.skipEmptyStringify(this.validators).length && FX.Utils.skipEmptyStringify(n.formTheme) === FX.Utils.skipEmptyStringify(this.formTheme)), i
		},
		_initContent: function() {
			var t = this,
				i = this.config;
			this.formItems = e.extend(!0, [], i.formItems), this.formLayout = i.formLayout || "normal", this.submitRule = i.formSubmitRule || FX.InvisibleSubmitRules.KEEP, this.validators = i.formValidators || [], this.hasCache = !! i.formHasCache, this.formTheme = i.formTheme, this._saveOriFormConfig(), FX.Utils.forEach(this.formItems, function(i, n) {
				t._addWidget(n, e('<li class="widget-view"/>').appendTo(t.$widgetWrapper))
			}), this.$widgetWrapper.addClass("loaded")
		},
		_saveOriFormConfig: function() {
			this.oriFormConfig = {
				formLayout: this.formLayout,
				submitRule: this.submitRule,
				validators: this.validators,
				hasCache: this.hasCache,
				formTheme: this.formTheme
			}, this.clearCache()
		},
		_initFormConfig: function() {
			var t = this.config,
				i = this,
				n = {};
			n[FX.InvisibleSubmitRules.KEEP] = i18next.t("form.submit.rule.keepTip"), n[FX.InvisibleSubmitRules.NULL] = i18next.t("form.submit.rule.nullTip"), n[FX.InvisibleSubmitRules.ALWAYS] = i18next.t("form.submit.rule.alwaysTip");
			var a = new FX.ConfigPane({
				renderEl: e("<div/>").appendTo(e("#form-config-pane").empty()),
				items: [{
					label: i18next.t("form.submit.validate"),
					tooltip: t.formAttr.hasFlow && t.formAttr.flow.flowVer ? e("<span/>").text(i18next.t("form.submit.validate.flow")) : null,
					tooltip_type: "warning"
				}, {
					widget: {
						type: "validatorpane",
						entryId: FX.STATIC.ENTRYID,
						entryList: [FX.FormUtils.getCurrentEntry(t)],
						validator: this.validators,
						width: "100%",
						onBeforeEdit: function() {
							this.options.entryList = i.getAllEntryList()
						},
						onAfterEdit: function() {
							i.validators = this.getValue()
						}
					},
					splitLine: !0
				}, {
					label: i18next.t("form.layout"),
					widget: {
						type: "segment",
						items: [{
							value: "normal",
							text: i18next.t("form.layout.normal")
						}, {
							value: "grid-2",
							text: i18next.t("form.layout.dc")
						}],
						value: i.formLayout,
						onAfterItemSelect: function() {
							i.formLayout = this.getValue(), i.resetLineWidth(), i.showSelectWidgetConfigPane()
						}
					},
					splitLine: !0
				}, {
					label: i18next.t("form.submit.rule"),
					tooltip: e("<span/>").text(i18next.t("form.submit.rule.tip")),
					widget: {
						type: "combo",
						searchable: !1,
						allowBlank: !1,
						width: "100%",
						items: [{
							value: FX.InvisibleSubmitRules.KEEP,
							text: i18next.t("form.submit.rule.keep")
						}, {
							value: FX.InvisibleSubmitRules.NULL,
							text: i18next.t("emptyValue")
						}, {
							value: FX.InvisibleSubmitRules.ALWAYS,
							text: i18next.t("form.submit.rule.always")
						}],
						value: i.submitRule,
						onAfterItemSelect: function() {
							i.submitRule = this.getValue(), a.getWidgetByName("submitRuleTip").setValue(n[i.submitRule])
						}
					}
				}, {
					widget: {
						type: "label",
						customCls: "submit-rules-tip",
						widgetName: "submitRuleTip",
						text: n[i.submitRule]
					},
					splitLine: !0
				}, {
					label: i18next.t("form.cache"),
					tooltip: e("<span/>").text(i18next.t("form.cache.tip")),
					widget: {
						type: "segment",
						items: [{
							value: !0,
							text: i18next.t("enable")
						}, {
							value: !1,
							text: i18next.t("disable")
						}],
						value: this.hasCache,
						onAfterItemSelect: function() {
							i.hasCache = this.getValue()
						}
					},
					splitLine: !0
				}, {
					label: i18next.t("form.theme.external"),
					widget: {
						type: "button",
						text: i18next.t("setting"),
						style: "white",
						height: 30,
						onClick: function() {
							i._showFormTheme()
						}
					}
				}]
			})
		},
		_showFormTheme: function() {
			var e = this,
				t = this.config;
			new FX.Slider({
				title: i18next.t("form.theme.external"),
				contentWidget: {
					type: "formthemepane",
					theme: this.formTheme,
					form: {
						appId: FX.STATIC.APPID,
						entryId: t.entryId,
						title: t.formName,
						layout: this.formLayout,
						submitText: i18next.t("flow.action.forward"),
						items: this.collectItems(!0)
					}
				},
				onClose: function() {
					var t = this.getContentWidget();
					e.formTheme = t.getValue()
				}
			}).show()
		},
		_bindEvent: function() {
			var t = this;
			this.$east = e("#fx-frame-east");
			var i = this.$east.find(".widget-tab"),
				n = this.$east.find(".form-tab");
			i.click(function() {
				t.tab2WidgetConfig()
			}), n.click(function() {
				t.tab2FormConfig()
			})
		},
		tab2WidgetConfig: function() {
			this.$east.removeClass("form-tab-select")
		},
		tab2FormConfig: function() {
			this.$east.addClass("form-tab-select")
		},
		doPreview: function() {
			var t = this.config,
				i = e('<div class="x-window-mask modal light"/>').css({
					"z-index": FX.STATIC.zIndex++
				}).appendTo("body").addClass("fadein"),
				n = this.collectItems(!0);
			new FX.Form({
				renderEl: e('<div class="x-shadow-content"/>').appendTo(i),
				API: FX._API,
				title: t.formName,
				submitUrl: null,
				items: n,
				layout: this.formLayout,
				submitRule: this.submitRule,
				height: "100%",
				hasFooter: !1,
				appId: FX.STATIC.APPID,
				entryId: t.entryId,
				mode: "preview",
				onAfterCancel: function() {
					i.addClass("fadeout"), setTimeout(function() {
						i.remove()
					}, 150)
				}
			})
		},
		doSave: function(t) {
			var i = this,
				n = this.config;
			this._checkItemLink();
			var a = {
				type: "form",
				items: this.collectItems(!0, "save"),
				validators: this.validators,
				submitRule: this.submitRule,
				layout: this.formLayout
			},
				o = i.collectItems(!0);
			if (!this.ajaxLock) {
				this.ajaxLock = !0;
				var r = {
					content: a,
					hasCache: this.hasCache,
					theme: this.formTheme
				};
				FX.FormUtils.doSaveFormSet(r, function() {
					a.items = o, i.formConfig.updateConfig(e.extend(a, {
						hasCache: i.hasCache,
						theme: i.formTheme
					})), e.extend(n, {
						formItems: o
					}), i._initFormConfig(), i._saveOriFormConfig(), FX.Utils.applyFunc(i, t, [], !1), i._initWidgetConfig(), i.showSelectWidgetConfigPane()
				}, function(e) {
					var t = e.responseJSON || {};
					FX.Msg.toast({
						type: "error",
						msg: FX.Utils.getErrMsg(t) || i18next.t("saveInfo.fail")
					})
				}, function() {
					i.ajaxLock = !1
				})
			}
		},
		clearCache: function() {
			FX.Store.remove(FX.Store.getKey("formTheme"))
		},
		_checkItemLink: function() {
			var t = this;
			FX.Utils.forEach(this.$widgetWrapper.children("li"), function(i, n) {
				var a = e(n).data("widget");
				if (!(FX.LimitFields.itemLink.indexOf(a.getWidgetType()) < 0)) {
					var o = {};
					FX.Utils.forEach(t.getNextItems(e(n)), function(e, t) {
						o[t.widget.widgetName] = !0
					}), FX.Utils.forEach(a.getOptions().widget.items, function(t, i) {
						if (!FX.Utils.isObjectEmpty(i.widgetsMap)) {
							var n = [];
							FX.Utils.forEach(i.widgetsMap, function(e, t) {
								o[t] && n.push(t)
							}), e.extend(i, {
								widgetsMap: n
							})
						}
					})
				}
			})
		},
		collectItems: function(t, i) {
			var n = [];
			return FX.Utils.forEach(this.$widgetWrapper.children("li.widget-view"), function(a, o) {
				var r = e(o).data("widget").getOptions(i);
				n.push({
					widget: t ? e.extend(!0, {}, r.widget) : r.widget,
					description: r.description,
					label: r.label,
					lineWidth: r.lineWidth
				})
			}), n
		},
		resetLineWidth: function() {
			var t = this,
				i = FX.FormDesignUtils.getFullLineWidth();
			"grid-2" === this.formLayout && (i = FX.FormDesignUtils.getHalfLineWidth()), FX.Utils.forEach(this.$widgetWrapper.children("li"), function(n, a) {
				var o = e(a).data("widget"),
					r = o.getWidgetType();
				t._isSupportGrid(r) ? o.setLineWidth(i) : o.setLineWidth(FX.FormDesignUtils.getFullLineWidth())
			})
		},
		_isSupportGrid: function(e) {
			return "subform" !== e && "separator" !== e
		},
		getNextItems: function(e) {
			var t, i = [];
			do {
				if (e = e.next(".widget-view", this.$widgetWrapper), t = e.data("widget")) {
					var n = t.getOptions();
					i.push({
						widget: n.widget,
						label: n.label
					})
				}
			} while (t);
			return i
		},
		_initWidgetConfig: function() {
			var e = {};
			FX.Utils.forEach(this.config.formItems, function(t, i) {
				e[i.widget.widgetName] = i
			}), this.formItemMap = e, this.fieldLabelMap = this.getFieldLabelMap()
		},
		_updateFormItemMap: function(e) {
			this.formItemMap[e.widget.widgetName] = e
		},
		_updateSubformItem: function(t, i) {
			if (i.subform) {
				var n = t.element.closest("li.widget-view").data("widget"),
					a = n.getOptions();
				FX.Utils.forEach(a.widget.items, function(t, n) {
					if (n.widget.widgetName === i.widget.widgetName) return e.extend(n, i), !1
				}), n.updateField(a.widget), this._updateFormItemMap(a)
			}
		},
		showWidgetConfigPane: function(e) {
			this.tab2WidgetConfig(), this.renderWidgetConfigPane(e)
		},
		showSelectWidgetConfigPane: function() {
			var t = e("li.widget-select", this.$widgetWrapper);
			if (t && t.length > 0) {
				var i = t.data("widget");
				this.renderWidgetConfigPane(i)
			}
		},
		renderWidgetConfigPane: function(t) {
			var i = this;
			if (this.$configPane.empty(), t) {
				var n = t.getOptions();
				FX.createWidget(e.extend({
					renderEl: e("<div/>").appendTo(this.$configPane),
					type: n.widget.type + "_design",
					formAttr: this.config.formAttr,
					allEntryList: this.getAllEntryList(),
					entryList: this.getEntryList(!0),
					entryListWithoutAggregate: this.getEntryList(),
					fieldLabelMap: this.fieldLabelMap,
					formItems: this.formItemMap,
					formLayout: this.formLayout,
					subLink: this._getSubLink(n, t),
					nextItems: this.getNextItems(t.element.closest(".widget-view")),
					onDescriptionChange: function(e) {
						t.updateDescription(e)
					},
					onLabelChange: function(e) {
						t.updateLabel(e);
						var n = t.getOptions();
						n.subform ? i._updateSubformItem(t, n) : i._updateFormItemMap(n)
					},
					onLineWidthChange: function(e) {
						t.setLineWidth(e)
					},
					onWidgetChange: function(e) {
						t.updateWidget(this.getWidget());
						var n = t.getOptions();
						n.subform ? i._updateSubformItem(t, n) : i._updateFormItemMap(n), e && i.showWidgetConfigPane(t)
					}
				}, n))
			}
		},
		_getSubLink: function(e, t) {
			var i = null;
			if (e.subform) {
				var n = t.element.closest("li.widget-view").data("widget").widget.rely;
				i = n && n.subLink
			}
			return i
		},
		_updateWidgetEmptyValue: function(e) {
			FX.Utils.forEach(e.widget.items, function(e, t) {
				FX.Utils.isEmpty(t.value) && (t.value = t.text = i18next.t("option"))
			}), e.updateWidget(e.widget), this._updateFormItemMap(e.getOptions())
		},
		_setWidgetSelect: function(t) {
			var i = e("li.widget-select", this.$widgetWrapper);
			if (i && i.length > 0) {
				i.removeClass("widget-select");
				var n = i.data("widget");
				["radiogroup", "checkboxgroup", "combo", "combocheck"].indexOf(n.getWidgetType()) > -1 && this._updateWidgetEmptyValue(n)
			}
			if (t && t.length > 0) {
				t.addClass("widget-select");
				var a = t.data("widget");
				this.showWidgetConfigPane(a)
			}
		},
		_addWidget: function(e, t) {
			var i = new FX.FormDesignItem({
				renderEl: t,
				label: e.label,
				description: e.description,
				lineWidth: e.lineWidth,
				widget: e.widget
			});
			t.data("widget", i)
		},
		getAllEntryList: function() {
			return FX.FormUtils.getAllEntryList(this.config)
		},
		getEntryList: function(e) {
			var t = this.formConfig.getConfig(),
				i = [].concat(t.entryList);
			return e ? i.concat(t.aggregateList) : i
		},
		getFieldLabelMap: function() {
			return this.labelMap || (this.labelMap = {}), this._addFieldLabel2Map(this.getAllEntryList(), this.labelMap), this.labelMap
		},
		_addFieldLabel2Map: function(e, t) {
			var i = this.config;
			FX.Utils.forEach(e, function(e, n) {
				var a = !1,
					o = n.entryId;
				n.appId && FX.STATIC.APPID !== n.appId ? o = [n.entryId, n.appId].join(FX.CONST.FIELD.DELIMITER) : n.entryId === i.entryId && (a = !0), FX.Utils.forEach(n.fields, function(e, i) {
					if ("subform" === i.type) FX.Utils.forEach(i.items, function(e, n) {
						var r = ["$", i.name, ".", n.name, "#"].join("");
						t[r + o] = i.text + "." + n.text, a && (t[r] = i.text + "." + n.text)
					});
					else {
						var n = ["$", i.name, "#"].join("");
						t[n + o] = i.text, a && (t[n] = i.text)
					}
				})
			})
		},
		updateConfig: function(t) {
			e.extend(this.config, t), this.formConfig.updateConfig(t)
		},
		renderAddWidgetGuide: function() {
			var t = this;
			this.hasWidget = !1, e(".frame-inner-list .widget-view").length && (this.hasWidget = !0), this.hasCoop ? this.total = 6 : this.total = 8;
			var i = {
				anchor: e(".frame-inner-list .form-edit-widget-label:first"),
				msg: i18next.t("form.guide.add1"),
				vAdjust: -30,
				hAdjust: -20
			};
			this.hasWidget ? e.extend(i, {
				msg: i18next.t("form.guide.add2"),
				vAdjust: 120,
				hAdjust: 40,
				isCircleEnable: !1,
				isCircleVisible: !1,
				isTriangleVisible: !0
			}) : e("a", i.anchor).addClass("chosen"), FX.Msg.dotGuide(e.extend(i, {
				index: 1,
				total: this.total,
				hasMask: !0,
				isStepGuide: !0,
				onClose: function() {
					FX.UI.showHelpCenterGuide(), e("a", i.anchor).removeClass("chosen")
				},
				onNext: function() {
					var n = FX.CONST.COOKIE.STEP_GUIDE.VALUE.ADD_WIDGET;
					FX.Cookie.set(FX.CONST.COOKIE.STEP_GUIDE.KEY, n, {
						expires: FX.CONST.COOKIE.STEP_GUIDE.EXPIRES,
						path: "/"
					}), e("a", i.anchor).removeClass("chosen"), t.hasWidget ? e(".frame-inner-list .widget-view:first").click() : i.anchor.click(), t._renderEditWidgetGuide()
				}
			}))
		},
		_renderEditWidgetGuide: function() {
			var t = this,
				i = e(".frame-inner-list .widget-view:first");
			FX.Msg.dotGuide({
				anchor: i,
				index: 2,
				total: this.total,
				msg: i18next.t("form.guide.field"),
				vAdjust: -30,
				hAdjust: -550,
				hasMask: !0,
				isStepGuide: !0,
				isCircleEnable: !1,
				isCircleVisible: !1,
				isTriangleVisible: !0,
				trianglePos: "arrow-center",
				onClose: function() {
					FX.UI.showHelpCenterGuide()
				},
				onNext: function() {
					var e = FX.CONST.COOKIE.STEP_GUIDE.VALUE.EDIT_WIDGET;
					FX.Cookie.set(FX.CONST.COOKIE.STEP_GUIDE.KEY, e, {
						expires: FX.CONST.COOKIE.STEP_GUIDE.EXPIRES,
						path: "/"
					}), t._renderSaveFormGuide()
				}
			})
		},
		_renderSaveFormGuide: function() {
			var t = this,
				i = e(".btn-bar .btn-save");
			FX.Msg.dotGuide({
				anchor: i,
				position: "center",
				index: 3,
				total: this.total,
				msg: i18next.t("form.guide.save"),
				vAdjust: -30,
				hAdjust: -20,
				hasMask: !0,
				isStepGuide: !0,
				onClose: function() {
					FX.UI.showHelpCenterGuide()
				},
				onNext: function() {
					var e = FX.CONST.COOKIE.STEP_GUIDE.VALUE.SAVE_FORM;
					FX.Cookie.set(FX.CONST.COOKIE.STEP_GUIDE.KEY, e, {
						expires: FX.CONST.COOKIE.STEP_GUIDE.EXPIRES,
						path: "/"
					}), i.click(), t._renderShareFormGuide()
				}
			})
		},
		_renderShareFormGuide: function() {
			var t = this,
				i = e(".btn-bar .btn-share");
			FX.Msg.dotGuide({
				anchor: i,
				position: "center",
				index: 4,
				total: this.total,
				msg: i18next.t("form.guide.share"),
				vAdjust: -30,
				hAdjust: -20,
				hasMask: !0,
				isStepGuide: !0,
				style4Circle: "white",
				onClose: function() {
					FX.UI.showHelpCenterGuide()
				},
				onNext: function() {
					var e = FX.CONST.COOKIE.STEP_GUIDE.VALUE.SHARE_FORM;
					FX.Cookie.set(FX.CONST.COOKIE.STEP_GUIDE.KEY, e, {
						expires: FX.CONST.COOKIE.STEP_GUIDE.EXPIRES,
						path: "/"
					}), t.hasCoop ? i.click() : t._renderFlowDesignGuide()
				}
			})
		},
		_renderFlowDesignGuide: function() {
			var t = e(".frame-edit-navibar .flow");
			FX.Msg.dotGuide({
				anchor: t,
				index: 5,
				total: this.total,
				msg: i18next.t("form.guide.flow.design"),
				vAdjust: -30,
				hAdjust: -170,
				hasMask: !0,
				isStepGuide: !0,
				isCircleVisible: !1,
				isTriangleVisible: !0,
				trianglePos: "arrow-center",
				onClose: function() {
					FX.UI.showHelpCenterGuide()
				},
				onNext: function() {
					var e = FX.CONST.COOKIE.STEP_GUIDE.VALUE.FLOW_DESIGN;
					FX.Cookie.set(FX.CONST.COOKIE.STEP_GUIDE.KEY, e, {
						expires: FX.CONST.COOKIE.STEP_GUIDE.EXPIRES,
						path: "/"
					}), FX.Utils.redirectTo("#/flow")
				}
			})
		},
		_renderDataManagerGuide: function() {
			if (FX.Cookie.get(FX.CONST.COOKIE.STEP_GUIDE.KEY) && FX.Cookie.get(FX.CONST.COOKIE.STEP_GUIDE.KEY) == FX.CONST.COOKIE.STEP_GUIDE.VALUE.DATA_MANAGE - 1) {
				var t = e(".frame-edit-navibar .datamanager");
				FX.Msg.dotGuide({
					anchor: t,
					index: this.total,
					total: this.total,
					msg: i18next.t("form.guide.data"),
					vAdjust: -30,
					hAdjust: -130,
					hasMask: !0,
					isStepGuide: !0,
					isCircleVisible: !1,
					isTriangleVisible: !0,
					trianglePos: "arrow-center",
					onEnd: function() {
						FX.UI.showHelpCenterGuide()
					}
				})
			}
		}
	})
}(jQuery), FX.FormDesignUtils = FX.FormDesignUtils || {}, $.extend(FX.FormDesignUtils, {
	getFullLineWidth: function() {
		return FX.CONST.FIELD_LINE_WIDTH
	},
	getHalfLineWidth: function() {
		return FX.CONST.FIELD_LINE_WIDTH / 2
	},
	getWidgetSaveOptions: function(e, t) {
		var i = FX.Utils.pick(e, ["type", "widgetName", "value", "enable", "visible", "allowBlank", "rely"]);
		switch (e.type) {
		case "address":
			i.needDetail = e.needDetail;
			break;
		case "combo":
			i.noRepeat = e.noRepeat, e.async && e.async.url ? i.async = e.async : i.items = e.items;
			break;
		case "combocheck":
			e.async && e.async.url ? i.async = e.async : i.items = e.items;
			break;
		case "radiogroup":
		case "checkboxgroup":
			i.items = e.items;
			break;
		case "datetime":
			i.format = e.format;
			break;
		case "dept":
			$.extend(i, FX.Utils.pick(e, ["noRepeat", "limit", "valueOption"]), {
				value: "save" === t ? FX.FormItemUtils.parseUserDeptDefaultValue(e.value) : e.value
			});
			break;
		case "deptgroup":
			$.extend(i, FX.Utils.pick(e, ["noRepeat", "limit", "valueOption"]), {
				value: "save" === t ? FX.FormItemUtils.parseUserDeptListDefaultValue(e.value) : e.value
			});
			break;
		case "user":
			$.extend(i, FX.Utils.pick(e, ["noRepeat", "limit", "limitWidget", "valueOption"]), {
				value: "save" === t ? FX.FormItemUtils.parseUserDeptDefaultValue(e.value) : e.value
			});
			break;
		case "usergroup":
			$.extend(i, FX.Utils.pick(e, ["noRepeat", "limit", "limitWidget", "valueOption"]), {
				value: "save" === t ? FX.FormItemUtils.parseUserDeptListDefaultValue(e.value) : e.value
			});
			break;
		case "upload":
			i.maxFileCount = e.maxFileCount;
			break;
		case "image":
			$.extend(i, FX.Utils.pick(e, ["maxFileCount", "compressed", "onlyCamera", "watermark"]));
			break;
		case "linkdata":
			$.extend(i, FX.Utils.pick(e, ["linkFilter", "linkFields", "linkForm", "linkKey", "linkType", "refAppId"]));
			break;
		case "linkquery":
			$.extend(i, FX.Utils.pick(e, ["linkFilter", "linkFields", "linkForm", "refAppId"]));
			break;
		case "location":
			$.extend(i, FX.Utils.pick(e, ["adjustable", "radius", "limits", "lnglatVisible"]));
			break;
		case "number":
			$.extend(i, FX.Utils.pick(e, ["allowDecimals", "maxNumber", "minNumber"]));
			break;
		case "text":
		case "textarea":
			$.extend(i, FX.Utils.pick(e, ["regex", "noRepeat", "scan"]));
			break;
		case "separator":
			i.lineStyle = e.lineStyle;
			break;
		case "subform":
			$.extend(i, FX.Utils.pick(e, ["subform_create", "subform_edit", "subform_delete"]));
			var n = [],
				a = {};
			e.rely && e.rely.subLink && FX.Utils.forEach(e.rely.subLink, function(e, t) {
				a[t.rely] = !0
			}), FX.Utils.forEach(e.items, function(e, t) {
				var i = $.extend(FX.FormDesignUtils.getWidgetSaveOptions(t.widget), {
					fieldWidth: t.widget.fieldWidth
				});
				a[t.widget.widgetName] && (i.rely = null, i.value = null, i.limitWidget && (i.limitWidget = null)), n.push({
					label: t.label,
					widget: i
				})
			}), i.items = n;
			break;
		case "sn":
			$.extend(i, FX.Utils.pick(e, ["rules"]));
			break;
		case "phone":
			$.extend(i, FX.Utils.pick(e, ["noRepeat", "hasSmsVerify", "region"]))
		}
		return i
	},
	compareSaveItems: function(e, t) {
		var i = !0;
		if (e = $.extend({
			description: "",
			lineWidth: FX.FormDesignUtils.getFullLineWidth()
		}, e), t = $.extend({
			description: "",
			lineWidth: FX.FormDesignUtils.getFullLineWidth()
		}, t), FX.Utils.forEach(["label", "description", "lineWidth"], function(n, a) {
			if (e[a] !== t[a]) return i = !1, !1
		}), e.widget.widgetName !== t.widget.widgetName && (i = !1), i) {
			var n = FX.FormDesignUtils.getWidgetCompareKeys(e.widget.type),
				a = $.extend(FX.FormUtils.getWidgetDefaultConfig(e.widget.type), e.widget),
				o = $.extend(FX.FormUtils.getWidgetDefaultConfig(t.widget.type), t.widget);
			FX.Utils.forEach(n, function(e, t) {
				if ("subform" === a.type && "items" === t) {
					if (a[t].length !== o[t].length) return i = !1, !1;
					var n = !0;
					if (FX.Utils.forEach(a[t], function(e, i) {
						if (!FX.FormDesignUtils.compareSaveItems(i, o[t][e])) return n = !1, !1
					}), !n) return i = !1, !1
				} else if (FX.Utils.skipEmptyStringify(a[t]) !== FX.Utils.skipEmptyStringify(o[t])) return i = !1, !1
			})
		}
		return i
	},
	getWidgetCompareKeys: function(e) {
		var t = ["type", "widgetName", "value", "enable", "visible", "allowBlank", "rely", "fieldWidth"];
		switch (e) {
		case "address":
			t.push("needDetail");
			break;
		case "combo":
			t.push("noRepeat", "async", "items");
			break;
		case "combocheck":
			t.push("async", "items");
			break;
		case "radiogroup":
		case "checkboxgroup":
			t.push("format");
			break;
		case "dept":
		case "deptgroup":
			t.push("noRepeat", "limit", "valueOption");
			break;
		case "user":
		case "usergroup":
			t.push("noRepeat", "limit", "limitWidget", "valueOption");
			break;
		case "upload":
			t.push("maxFileCount");
			break;
		case "image":
			t.push("maxFileCount", "compressed", "onlyCamera", "watermark");
			break;
		case "linkdata":
			t.push("linkFilter", "linkFields", "linkForm", "linkKey", "linkType", "refAppId");
			break;
		case "linkquery":
			t.push("linkFilter", "linkFields", "linkForm", "refAppId");
			break;
		case "location":
			t.push("adjustable", "radius", "limits", "lnglatVisible");
			break;
		case "number":
			t.push("allowDecimals", "maxNumber", "minNumber");
			break;
		case "text":
		case "textarea":
			t.push("regex", "noRepeat", "scan");
			break;
		case "separator":
			t.push("lineStyle");
			break;
		case "subform":
			t.push("subform_create", "subform_edit", "subform_delete", "items");
			break;
		case "sn":
			t.push("rules");
			break;
		case "phone":
			t.push("noRepeat", "hasSmsVerify", "region")
		}
		return t
	}
}), FX.FormDesignSubform = FX.extend(FX.Widget, {
	_defaultConfig: function() {
		return $.extend(FX.FormDesignSubform.superclass._defaultConfig.apply(), {
			baseCls: "form-design-subform",
			value: [],
			items: [],
			widgetName: "",
			onBeforeWidgetCreate: null
		})
	},
	_init: function() {
		FX.FormDesignSubform.superclass._init.apply(this, arguments), this._initConfig(), this._renderContent(), this._bindEvent()
	},
	_initConfig: function() {
		var e = this.options;
		this.ps = null, this.value = e.value || [], this.items = e.items || [], this.rowCount = Math.min(this.value.length || 1, 10)
	},
	_renderContent: function() {
		var e = this,
			t = $('<div class="subform-content"/>').appendTo(this.element);
		this._renderHead(t), this.$container = $('<ul class="subform-container"/>').appendTo(t), FX.Utils.forEach(this.items, function(t, i) {
			e._renderItem(i, t)
		}), this._renderEmptyItem()
	},
	_renderHead: function(e) {
		for (var t = $('<div class="row-head"><div class="head-label"/></div>').appendTo(e), i = 1; i <= this.rowCount; i++) t.append($('<div class="row-num">' + i + "</div>"))
	},
	_renderEmptyItem: function() {
		this.$empty || (this.$empty = $('<div class="row-empty"/>').appendTo(this.$container)), FX.Utils.isObjectEmpty(this.items) ? this.$empty.removeClass("half").append("<span>" + i18next.t("widget.subform.addTip") + "</span>") : this.$empty.addClass("half").text("")
	},
	_renderItem: function(e, t) {
		var i = this.options,
			n = $('<li class="row-item"/>').appendTo(this.$container),
			a = new FX.SubformDesignItem({
				renderEl: n,
				label: e.label,
				widget: e.widget,
				rowCount: this.rowCount,
				subform: i.widgetName,
				idx: t,
				value: this.value,
				onBeforeWidgetCreate: i.onBeforeWidgetCreate
			});
		n.data("widget", a)
	},
	_bindEvent: function() {
		var e = this;
		this.element.on("mouseenter", function() {
			e.ps ? e.ps.update() : e.ps = new PerfectScrollbar(e.$container[0])
		})
	},
	rebuildField: function(e) {
		var t = this;
		this.items = e.items || [], this.$container.empty(), this.$empty = null, FX.Utils.forEach(this.items, function(e, i) {
			t._renderItem(i, e)
		}), this._renderEmptyItem()
	},
	getSubField: function(e) {
		var t = null;
		return FX.Utils.forEach(this.$container.children("li.row-item"), function(i, n) {
			var a = $(n).data("widget");
			if (a.getOptions().widget.widgetName === e) return t = a, !1
		}), t
	},
	getSortable: function() {
		return this.$container.sortable({
			group: "no-drop",
			vertical: !1
		}).data("sortable")
	}
}), $.shortcut("formdesignsubform", FX.FormDesignSubform), FX.FormDesignItem = FX.extend(FX.Widget, {
	_defaultConfig: function() {
		return $.extend(FX.FormDesignItem.superclass._defaultConfig.apply(), {
			label: "",
			description: "",
			lineWidth: FX.CONST.FIELD_LINE_WIDTH,
			widget: {}
		})
	},
	_init: function() {
		FX.FormDesignItem.superclass._init.apply(this, arguments);
		var e = this.options;
		this.label = e.label, this.description = e.description, this.lineWidth = e.lineWidth, this.widget = $.extend({}, e.widget), this._render()
	},
	_render: function() {
		var e = this.element,
			t = $('<div class="fl-label"/>').append($('<span class="label-title"/>').text(this.label)).appendTo(e),
			i = $('<div class="fl-description x-subhtml"/>').appendTo(e);
		this._addDescription(i, this.description), !1 === this.widget.allowBlank && $('<span class="label-notnull"/>').text("*").appendTo(t), "subform" === this.widget.type && e.addClass("sortable-gap"), this._renderField(e), $('<div class="form-widget-mask"/>').appendTo(e).append($('<i class="icon-trasho btn-delete"/>').attr("title", i18next.t("delete"))).append($('<i class="icon-copy btn-copy ' + (this._allowCopy() ? "" : "x-ui-hidden") + '"/>').attr("title", i18next.t("copy")))
	},
	_renderField: function(e) {
		var t = FX.createWidget($.extend({
			renderEl: $('<div class="fl-widget"/>').appendTo(e)
		}, this.widget, this._getWidgetEditConfig(this.widget.type, !0)));
		this.widget.widgetName || $.extend(this.widget, {
			widgetName: t.getWidgetName()
		}), "subform" === this.widget.type && e.data("subContainer", t.getSortable()), this.field = t
	},
	_getWidgetEditConfig: function(e, t) {
		var i = this,
			n = {
				enable: !0,
				visible: !0
			};
		switch (t && $.extend(n, FX.Utils.getNormalLayoutSize(e)), e) {
		case "user":
		case "usergroup":
		case "dept":
		case "deptgroup":
			$.extend(n, {
				dynamicType: "set"
			});
			break;
		case "subform":
			$.extend(n, {
				type: "formdesignsubform",
				onBeforeWidgetCreate: function(e) {
					$.extend(e, i._getWidgetEditConfig(e.type, !1))
				}
			});
			break;
		case "signature":
			$.extend(n, {
				allowSign: FX.Vip.hasSignature()
			});
			break;
		case "sn":
			$.extend(n, {
				waterMark: i18next.t("widget.sn.placeholder")
			})
		}
		return n
	},
	_addDescription: function(e, t) {
		e.empty().data("description", t), FX.Utils.isEmpty(t) || "<br>" === t ? e.removeClass("separator") : (e.addClass("separator"), e.append(t))
	},
	_allowCopy: function() {
		var e = !0;
		switch (this.widget.type) {
		case "signature":
			e = FX.Vip.hasSignature();
			break;
		case "sn":
			e = !1
		}
		return e
	},
	getOptions: function(e) {
		return {
			label: this.label,
			description: this.description,
			lineWidth: this.lineWidth,
			widget: FX.FormDesignUtils.getWidgetSaveOptions(this.widget, e)
		}
	},
	getWidgetType: function() {
		return this.widget.type
	},
	setLineWidth: function(e) {
		this.lineWidth = e
	},
	updateLabel: function(e) {
		this.label = e, $(".label-title", this.element).text(this.label)
	},
	updateDescription: function(e) {
		this.description = e, this._addDescription($(".fl-description", this.element), this.description)
	},
	updateWidget: function(e) {
		e && (this.widget = e, this.rebuild())
	},
	updateField: function(e, t) {
		e && (this.widget = e, t && this.field.rebuildField(e))
	},
	getSubField: function(e) {
		return this.field.getSubField(e)
	},
	rebuild: function() {
		this.element.empty(), this._render()
	}
}), FX.SubformDesignItem = FX.extend(FX.FormDesignItem, {
	_defaultConfig: function() {
		return $.extend(FX.SubformDesignItem.superclass._defaultConfig.apply(), {
			subform: "",
			label: "",
			widget: {},
			value: [],
			rowCount: 1,
			idx: 0,
			onBeforeWidgetCreate: null
		})
	},
	_init: function() {
		var e = this.options;
		this.value = e.value || [], this.rowCount = e.rowCount, FX.SubformDesignItem.superclass._init.apply(this, arguments)
	},
	_render: function() {
		var e = this.element;
		this._renderLabel(e);
		for (var t = 0; t < this.rowCount; t++) this._renderField(this.value[t], $('<div class="row-field"/>').appendTo(e));
		$('<div class="form-widget-mask"/>').appendTo(e).append($('<i class="icon-trasho btn-delete"/>').attr("title", i18next.t("delete"))).append($('<i class="icon-copy btn-copy"/>').attr("title", i18next.t("copy")))
	},
	_renderLabel: function(e) {
		var t = $('<div class="item-label">').appendTo(e);
		["linkdata", "linkquery"].indexOf(this.widget.type) > -1 && !FX.Utils.isObjectEmpty(this.widget.linkFields) ? ("linkdata" === this.widget.type && t.addClass("linkdata-label"), FX.Utils.forEach(this.widget.linkFields, function(e, i) {
			var n = FX.Utils.getSubformWidgetWidth(i);
			$('<div class="sub-label"/>').appendTo(t).text(i.text).width(n)
		})) : t.text(this.label), !1 === this.widget.allowBlank && t.append($('<span class="label-notnull">*</span>'))
	},
	_renderField: function(e, t) {
		var i = this,
			n = this.options,
			a = $.extend({}, this.widget, {
				enable: !1,
				visible: !0
			}),
			o = FX.Utils.getSubformWidgetWidth(a);
		switch (a.type) {
		case "location":
			$.extend(a, {
				locationText: i18next.t("subform.mobileLocation"),
				hasBrief: !1,
				btnWidth: "100%",
				btnHeight: 36,
				isValueVisible: !1
			});
			break;
		case "linkdata":
		case "linkquery":
			o = i._getLinkFieldWidth(a)
		}
		var r = new FX.SubformItem({
			renderEl: $("<div/>").appendTo(t),
			subform: n.widgetName,
			widget: $.extend(FX.FormUtils.getWidgetDefaultConfig(a.type), a, {
				width: o
			}),
			onBeforeWidgetCreate: function(e) {
				FX.Utils.applyFunc(this, n.onBeforeWidgetCreate, [e], !1)
			}
		});
		if (e) {
			var s = e[r.getWidgetName()];
			FX.Utils.isNull(s) || (s.hasOwnProperty("widgetType") ? r.setValue(s.data) : r.setValue(s))
		}
	},
	_getLinkFieldWidth: function(e) {
		var t = -4;
		return FX.Utils.forEach(e.linkFields, function(e, i) {
			var n = FX.Utils.getSubformWidgetWidth(i);
			t += n + 4
		}), "linkdata" === e.type && (t += 35), Math.max(t, FX.Utils.getSubformWidgetWidth({
			type: e.type
		}))
	},
	updateLabel: function(e) {
		this.label = e, $(".item-label", this.element).text(this.label)
	},
	getOptions: function(e) {
		var t = this.options;
		return {
			label: this.label,
			widget: $.extend(FX.FormDesignUtils.getWidgetSaveOptions(this.widget, e), {
				fieldWidth: this.widget.fieldWidth
			}),
			subform: t.subform,
			idx: t.idx
		}
	}
}), FX.FormDesignConfig = FX.extend(FX.Widget, {
	_defaultConfig: function() {
		return $.extend(FX.FormDesignConfig.superclass._defaultConfig.apply(), {
			allEntryList: [],
			entryList: [],
			entryListWithoutAggregate: [],
			fieldLabelMap: {},
			description: "",
			formAttr: {},
			label: "",
			lineWidth: 12,
			subform: "",
			widget: {},
			onDescriptionChange: null,
			onLabelChange: null,
			onLineWidthChange: null,
			onWidgetChange: null
		})
	},
	_init: function() {
		FX.FormDesignConfig.superclass._init.apply(this, arguments);
		var e = this.options;
		this.label = e.label, this.widget = e.widget, this.lineWidth = e.lineWidth, this.description = e.description, this._render()
	},
	_render: function() {
		var e = this.options,
			t = this._getConfigItems();
		e.subform && (t = t.concat(this._getFieldWithConfig())), this.configPane = new FX.ConfigPane({
			renderEl: $('<div class="form-item-config"/>').appendTo(this.element),
			items: t
		})
	},
	_getConfigItems: function() {
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: this.options.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig(),
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: this._createEnableConfig(),
			splitLine: !0
		}, this._createWidgetLayoutConfig()]
	},
	_isDefaultValueEnable: function() {
		var e = this,
			t = this.options,
			i = !0;
		return FX.Utils.forEach(t.subLink, function(t, n) {
			if (n.rely === e.widget.widgetName) return i = !1, !1
		}), i
	},
	_isLimitEnable: function() {
		var e = this,
			t = this.options,
			i = !0;
		return FX.Utils.forEach(t.subLink, function(t, n) {
			if (n.rely === e.widget.widgetName) return i = !1, !1
		}), i
	},
	_createDefaultValueDisableTip: function() {
		return {
			label: i18next.t("defaults"),
			widget: {
				type: "label",
				customCls: "disable-content-tip",
				text: i18next.t("field.rely.disable.default")
			},
			splitLine: !0
		}
	},
	_getFieldWithConfig: function() {
		var e = this.options,
			t = this,
			i = this.widget;
		return {
			label: i18next.t("field.width"),
			widget: {
				type: "segment",
				customCls: "field-width-config",
				items: [{
					value: FX.CONST.FIELD_WIDTH.HALF,
					text: i18next.t("field.width.half")
				}, {
					value: FX.CONST.FIELD_WIDTH.NORMAL,
					text: i18next.t("field.width.normal")
				}, {
					value: FX.CONST.FIELD_WIDTH.TWICE,
					text: i18next.t("field.width.double")
				}],
				value: i.fieldWidth || "normal",
				onAfterItemSelect: function() {
					i.fieldWidth = this.getValue(), FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
				}
			}
		}
	},
	_createTitleConfig: function() {
		var e = this,
			t = this.options;
		return {
			type: "text",
			text: this.label,
			width: "100%",
			onBeforeEdit: function(t) {
				var i = e.getWidgetType(),
					n = FX.CONST.WIDGET_LIST[i],
					a = n && n.name;
				this.getValue() === a && t.target.select()
			},
			onAfterEdit: function() {
				FX.Utils.applyFunc(e, t.onLabelChange, [this.getValue()], !1)
			},
			onStopEdit: function() {
				FX.Utils.dt(FX.CONST.TRACKER.FORM_FIELD_RENAME), FX.Utils.applyFunc(e, t.onLabelChange, [this.getValue()], !1)
			}
		}
	},
	_createWidgetTypeConfig: function() {
		var e = this.getWidgetType(),
			t = this,
			i = FX.CONST.WIDGET_LIST[e];
		if (i) {
			var n = [],
				a = this.options.subform ? i.subChangeList : i.changeList;
			FX.Utils.forEach(a, function(e, t) {
				var i = FX.CONST.WIDGET_LIST[t];
				i && n.push({
					value: t,
					text: i.name
				})
			});
			var o = $('<div class="widget_type_pane"/>').append($("<span/>").text(i.name)),
				r = $('<div class="cfg_widget_type"/>').append(o);
			if (n.length > 0) {
				o.append($('<i class="icon-angledown"/>'));
				var s = $('<ul class="widget_type_list"/>');
				r.append(s).hover(function() {
					s.empty().addClass("list_show"), FX.Utils.forEach(n, function(i, n) {
						var a = t._createWidgetTypeItem(e, n);
						a && s.append(a)
					}), r.append(s)
				}, function() {
					s.removeClass("list_show")
				})
			}
			return r
		}
	},
	_createWidgetTypeItem: function(e, t) {
		var i = this,
			n = $('<li class="widget_type_item"/>').append($("<span/>").text(t.text)),
			a = this._checkWidgetOptions(e, t.value);
		return a ? (a.result ? n.click(function() {
			i._changeWidgetType(t.value)
		}) : n.hover(function() {
			FX.UI.showPopover({
				position: "topRight",
				anchor: n,
				maxWidth: 130,
				content: $("<div />").text(a.msg)
			})
		}, function() {
			FX.UI.closePopover()
		}).addClass("item_disable"), n) : null
	},
	_checkWidgetOptions: function(e, t) {
		var i = this.widget.rely,
			n = this.widget.async;
		switch (e) {
		case "text":
			if ("radiogroup" === t && i) return {
				result: !1,
				msg: i18next.t("field.typeChange.rely")
			};
			if ("combo" === t && i && i.formula) return {
				result: !1,
				msg: i18next.t("field.typeChange.formula")
			};
			break;
		case "radiogroup":
			if ("text" === t && this._checkContactOption()) return {
				result: !1,
				msg: i18next.t("field.typeChange.contact")
			};
			break;
		case "combo":
			if ("radiogroup" === t && (i || n)) return {
				result: !1,
				msg: i18next.t("field.typeChange.async")
			};
			if ("text" === t && this._checkContactOption()) return {
				result: !1,
				msg: i18next.t("field.typeChange.contact")
			};
			break;
		case "combocheck":
			if (i || n) return {
				result: !1,
				msg: i18next.t("field.typeChange.async")
			}
		}
		return {
			result: !0
		}
	},
	_checkContactOption: function() {
		var e = !1;
		return this.widget.rely || this.widget.async ? e : (FX.Utils.forEach(this.widget.items, function(t, i) {
			if (i.widgetsMap && i.widgetsMap.length > 0) return e = !0, !1
		}), e)
	},
	_changeWidgetType: function(e) {
		var t = this.options;
		this.getWidgetType() !== e && (this.widget = $.extend(FX.FormUtils.getWidgetDefaultConfig(e), {
			widgetName: this.widget.widgetName,
			allowBlank: this.widget.allowBlank,
			visible: this.widget.visible,
			enable: this.widget.enable
		}), FX.Utils.applyFunc(this, t.onWidgetChange, [!0], !1))
	},
	_createDescriptionConfig: function() {
		var e = this,
			t = this.options;
		return {
			type: "richtext",
			width: "100%",
			minHeight: 120,
			disableResizeImage: !0,
			value: this.description,
			onAfterEdit: function() {
				var i = this.getValue();
				FX.Utils.applyFunc(e, t.onDescriptionChange, [i], !1)
			}
		}
	},
	_createAuthConfig: function(e) {
		var t = null,
			i = "",
			n = this.options.formAttr;
		return n.hasCoop || (n.hasFlow && n.flow.flowVer ? (t = $("<span/>").text(i18next.t("field.auth.flowTip.warning")), i = "warning") : (t = $("<span/>").text(i18next.t("field.auth.flowTip.info")), i = "tip")), {
			label: i18next.t("field.auth"),
			tooltip: t,
			tooltip_type: i,
			widget: this._createVisibleConfig(),
			splitLine: e
		}
	},
	_createRelyBtnConfig: function(e, t) {
		var i = this,
			n = (this.options, !0),
			a = !1,
			o = this._getRelyConfig();
		switch (t) {
		case "combo":
		case "combocheck":
		case "address":
		case "subform":
			a = !0
		}
		return e === FX.WidgetValueOption.RELY && this.widget.rely && (n = i._isRelyConfigValid(o)), {
			widget: {
				type: "button",
				visible: e === FX.WidgetValueOption.RELY,
				widgetName: "dataRely",
				onClick: function() {
					i._showRelyDialog(function() {
						i._setConfigBtnState("dataRely", !0)
					})
				},
				customCls: n ? null : "error",
				text: n ? i18next.t("field.rely.set") : i18next.t("field.rely.invalid"),
				style: "white",
				width: "100%",
				height: 30
			},
			splitLine: a
		}
	},
	_isRelyConfigValid: function(e) {
		var t = !1,
			i = !1,
			n = !1,
			a = !1,
			o = this.widget.rely;
		return FX.Utils.forEach(e.forms, function(i, n) {
			if (n.value === e.relyForm) return t = !0, !1
		}), !! t && (FX.Utils.forEach(e.widgets, function(e, t) {
			if (t.value === o.widgets[0]) return i = !0, !1
		}), !! i && (FX.Utils.forEach(this._initRelyItems(e.relyItems, e.relyType), function(e, t) {
			if (o.ref && t.value === o.ref.field) return n = !0, !1
		}), !! n && (FX.Utils.forEach(this._initRelyItems(e.relyItems, e.type, !0), function(t, i) {
			if (e.data && i.value === e.data.field) return a = !0, !1
		}), a)))
	},
	_createLinkBtnConfig: function(e, t) {
		var i = this,
			n = !0,
			a = this._getLinkConfig(e);
		return FX.Utils.isObjectEmpty(this.widget.linkFilter) || (n = this._isLinkConfigValid(a)), {
			label: i18next.t("field.linkFilter"),
			widget: {
				type: "button",
				text: n ? i18next.t("field.linkFilter.add") : i18next.t("field.linkFilter.invalid"),
				widgetName: "linkFilterBtn",
				width: "100%",
				height: 30,
				style: "white",
				customCls: n ? null : "error",
				onClick: function() {
					i.getLinkFilterConfig(e, t)
				}
			},
			splitLine: !0
		}
	},
	_isLinkConfigValid: function(e) {
		var t = !0;
		return FX.Utils.forEach(this.widget.linkFilter, function(i, n) {
			var a = !1;
			if (FX.Utils.forEach(e.relyWidgets, function(e, t) {
				if (t.name === n.rely) return a = !0, !1
			}), !a) return t = !1, !1;
			var o = !1;
			return FX.Utils.forEach(e.linkWidgets, function(e, t) {
				if (t.name === n.link) return o = !0, !1
			}), o ? void 0 : (t = !1, !1)
		}), t
	},
	_createNotNullConfig: function() {
		var e = this,
			t = this.options;
		return {
			type: "checkbox",
			text: i18next.t("required"),
			value: !1 === this.widget.allowBlank,
			onStateChange: function(i) {
				e.widget.allowBlank = !i, FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
			}
		}
	},
	_createNotRepeatConfig: function() {
		var e = this,
			t = this.options;
		return t.subform ? null : {
			type: "checkbox",
			text: i18next.t("field.noRepeat"),
			value: !0 === this.widget.noRepeat,
			onStateChange: function(i) {
				e.widget.noRepeat = i, FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
			}
		}
	},
	_createVisibleConfig: function() {
		var e = this,
			t = this.options;
		return {
			type: "checkbox",
			text: i18next.t("visible"),
			value: e.widget.visible,
			onStateChange: function(i) {
				e.widget.visible = i, FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
			}
		}
	},
	_createEnableConfig: function() {
		var e = this,
			t = this.options;
		return {
			type: "checkbox",
			text: i18next.t("editable"),
			value: this.widget.enable,
			widgetName: "enable",
			onStateChange: function(i) {
				e.widget.enable = i, FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
			}
		}
	},
	_createSubAuthConfig: function(e, t, i) {
		var n = this,
			a = this.options,
			o = this.widget;
		return {
			type: "checkbox",
			text: e,
			value: o[t],
			widgetName: t,
			customCls: "fx-layout-subform-item",
			onStateChange: function(e) {
				o[t] = e;
				var r = i.every(function(e) {
					return !n.configPane.getWidgetByName(e).getValue()
				});
				(e || r) && (n.configPane.getWidgetByName("enable").setValue(e), o.enable = e), FX.Utils.applyFunc(n, a.onWidgetChange, [], !1)
			}
		}
	},
	_createFormulaButtonConfig: function() {
		var e = this.options,
			t = this,
			i = this.widget.widgetName;
		return e.subform && (i = [e.subform, i].join(FX.CONST.FIELD.SUBFORM_DELIMITER)), {
			widget: {
				widgetName: "formulaBtn",
				type: "button",
				visible: t._getWidgetValueSourceOption() === FX.WidgetValueOption.FORMULA,
				style: "white",
				text: i18next.t("field.formula.edit"),
				iconCls: "icon-function",
				width: "100%",
				height: 30,
				onClick: function() {
					var n = t.widget.rely;
					new FX.FieldFormulaPane({
						text: t.label,
						hasRemind: !1,
						formula: n && n.formula || {},
						currentForm: FX.STATIC.ENTRYID,
						currentWidget: i,
						currentSubform: e.subform,
						entryList: e.allEntryList,
						labelMap: e.fieldLabelMap,
						onAfterFormulaEdit: function(i) {
							t._setRelyFormula(i), FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
						}
					})
				}
			},
			splitLine: !0
		}
	},
	_setRelyFormula: function(e) {
		e.formula ? (this.widget.rely = {
			widgets: e.relyWidgets,
			formula: {
				type: "formula",
				text: i18next.t("formula"),
				formula: e.formula
			}
		}, this.widget.value = null) : this.widget.rely = null
	},
	_initRelyItems: function(e, t, i) {
		var n = this,
			a = this.widget.valueOption,
			o = FX.LimitFields.link,
			r = [],
			s = {
				combo: ["combo", "text", "radiogroup", "sn"],
				combocheck: ["combocheck", "text", "checkboxgroup"],
				textarea: ["textarea"],
				text: ["text", "combo", "radiogroup", "sn"]
			};
		return i && (s = {
			combo: FX.LimitFields.combodata,
			combocheck: FX.LimitFields.combodata,
			dept: a === FX.WidgetValueOption.RELY ? null : ["dept", "deptgroup"],
			deptgroup: a === FX.WidgetValueOption.RELY ? null : ["dept", "deptgroup"],
			textarea: ["textarea"],
			text: ["text", "combo", "radiogroup", "sn"],
			subform: ["subform"]
		}), s[t] ? FX.Utils.forEach(e, function(e, i) {
			s[t].indexOf(i.type) > -1 && r.push(i)
		}) : FX.Utils.forEach(e, function(e, i) {
			o.indexOf(i.type) > -1 && n._compareDataType(i.type, t) && r.push(i)
		}), r
	},
	_compareDataType: function(e, t) {
		return FX.ValueTypeMap[e] === FX.ValueTypeMap[t]
	},
	_getRelyConfig: function() {
		var e = this,
			t = this.options,
			i = this.widget.rely || {},
			n = this.widget.rely,
			a = FX.LimitFields.rely,
			o = this.widget.widgetName,
			r = this.getWidgetType(),
			s = i18next.t("widget"),
			l = [],
			d = null,
			u = [],
			c = t.entryList,
			f = i.data && i.data.formId;
		i.data && i.data.refAppId && (f = [i.data.formId, i.data.refAppId].join(FX.CONST.FIELD.DELIMITER)), FX.Utils.forEach(c, function(t, i) {
			if ("subform" !== e.getWidgetType() || "form" === i.type) {
				var n = {};
				n.text = i.name, i.appId !== FX.STATIC.APPID ? n.value = [i.entryId, i.appId].join(FX.CONST.FIELD.DELIMITER) : n.value = i.entryId, n.children = [], FX.Utils.forEach(i.fields, function(e, t) {
					if (FX.Utils.isValueWidget(t.type)) {
						var i = {};
						i.text = t.text, i.value = t.name, i.type = t.type, "subform" === i.type && (i.items = t.items), n.children.push(i), n.value === f && (l = n.children)
					}
				}), u.push(n)
			}
		});
		var h = [];
		return FX.Utils.forEach(t.formItems, function(e, t) {
			if (t.widget.widgetName !== o) {
				if (!(a.indexOf(t.widget.type) < 0)) if ("subform" === t.widget.type) {
					var i = [],
						r = !1;
					FX.Utils.forEach(t.widget.items, function(e, l) {
						if (l.widget.widgetName === o) return s = [t.label, l.label].join("--"), void(r = !0);
						if (!(a.indexOf(l.widget.type) < 0)) {
							var u = {};
							u.text = t.label + "--" + l.label, u.value = t.widget.widgetName + "." + l.widget.widgetName, u.type = l.widget.type, "linkdata" === u.type && (u.type = l.widget.linkType), i.push(u), n && n.widgets && n.widgets[0] === u.value && (d = u.type)
						}
					}), r && (h = h.concat(i))
				} else {
					var l = {};
					l.text = t.label, l.value = t.widget.widgetName, l.type = t.widget.type, "linkdata" === l.type && (l.type = t.widget.linkType), h.push(l), n && n.widgets && n.widgets[0] === l.value && (d = l.type)
				}
			} else s = t.label
		}), {
			forms: u,
			relyForm: f,
			widgets: h,
			relyItems: l,
			relyType: d,
			widgetLabel: s,
			type: r,
			data: i.data
		}
	},
	_getLinkConfig: function(e) {
		var t = this.options,
			i = this.widget,
			n = [],
			a = i.refAppId ? [i.linkForm, i.refAppId].join(FX.CONST.FIELD.DELIMITER) : i.linkForm;
		return FX.Utils.forEach(t.formItems, function(e, a) {
			if (t.subform && t.subform === a.widget.widgetName && FX.Utils.forEach(a.widget.items, function(e, t) {
				if (!(FX.LimitFields.linkFilter.indexOf(t.widget.type) < 0 || i.widgetName === t.widget.widgetName)) {
					var o = {
						text: [a.label, t.label].join("--"),
						name: a.widget.widgetName + "." + t.widget.widgetName,
						type: t.widget.type
					};
					"linkdata" === o.type && t.widget.linkType && (o.type = t.widget.linkType), n.push(o)
				}
			}), !(FX.LimitFields.linkFilter.indexOf(a.widget.type) < 0 || i.widgetName === a.widget.widgetName)) {
				var o = {
					text: a.label,
					name: a.widget.widgetName,
					type: a.widget.type
				};
				"linkdata" === o.type && a.widget.linkType && (o.type = a.widget.linkType), n.push(o)
			}
		}), {
			relyWidgets: n,
			linkWidgets: e[a]
		}
	},
	_showRelyDialog: function(e) {
		var t = this,
			i = this.options,
			n = this.widget.rely,
			a = this._getRelyConfig(),
			o = [
				[{
					type: "label",
					text: i18next.t("field.rely.form"),
					width: 80
				}],
				[{
					type: "combo",
					widgetName: "dataForm",
					waterMark: i18next.t("field.rely.form.placeholder"),
					allowBlank: !1,
					width: 495,
					items: a.forms,
					onAfterItemSelect: function(e, i) {
						var n = r.getWidgetByName("dataField"),
							o = r.getWidgetByName("relyData");
						a.relyItems = i.children, n.options.value = null, n.rebuild(), o.options.value = null, o.rebuild(), "subform" === t.widget.type && r.getWidgetByName("subformRely").rebuild({
							linkWidgets: []
						})
					},
					value: a.relyForm
				}],
				[{
					type: "label",
					text: "subform" === this.getWidgetType() ? i18next.t("widget.subform") + i18next.t("data.rely") : i18next.t("data.rely"),
					width: 200
				}],
				[{
					type: "combo",
					widgetName: "relyWidget",
					waterMark: i18next.t("field.rely.currentForm"),
					allowBlank: !1,
					items: a.widgets,
					onAfterItemSelect: function(e, t) {
						var i = r.getWidgetByName("relyData");
						a.relyType = t.type, i.options.value = null, i.rebuild()
					},
					value: n && n.widgets[0]
				}, {
					type: "label",
					text: i18next.t("field.rely.equal"),
					customCls: ""
				}, {
					type: "combo",
					widgetName: "relyData",
					waterMark: i18next.t("field.rely.relyForm"),
					allowBlank: !1,
					onElementCreate: function() {
						return this.options.items = t._initRelyItems(a.relyItems, a.relyType), !1
					},
					value: n && n.ref && n.ref.field
				}, {
					type: "label",
					text: i18next.t("field.rely.when")
				}],
				[{
					type: "text",
					enable: !1,
					value: a.widgetLabel
				}, {
					type: "label",
					text: i18next.t("field.rely.show")
				}, {
					type: "combo",
					widgetName: "dataField",
					waterMark: i18next.t("field.rely.relyForm"),
					allowBlank: !1,
					onElementCreate: function() {
						return this.options.items = t._initRelyItems(a.relyItems, a.type, !0), !1
					},
					onAfterItemSelect: function(e, i) {
						"subform" === t.widget.type && r.getWidgetByName("subformRely").rebuild({
							linkWidgets: i.items
						})
					},
					value: a.data && a.data.field
				}, {
					type: "label",
					text: i18next.t("field.rely.result")
				}],
				[{
					type: "subformrelypane",
					widgetName: "subformRely",
					items: n && n.subLink,
					linkWidgets: this._getSubformLinkWidgets(a),
					relyItems: this.widget.items,
					visible: "subform" === this.getWidgetType()
				}]
			],
			r = new FX.ConfirmDialog({
				title: i18next.t("field.rely.set"),
				width: 605,
				contentWidget: {
					rowSize: [25, 30, 25, 30, 30, "auto"],
					colSize: [210, 60, 210, 60],
					hgap: 8,
					vgap: 15,
					items: o
				},
				hasSeparator: !0,
				onCreateFooterLeft: function(e) {
					$('<a href="https://hc.jiandaoyun.com/doc/9027" target="jdy_doc">' + i18next.t("field.rely.doc") + "</a>").appendTo(e)
				},
				onOk: function() {
					var n = this.getWidgetByName("dataForm").getValue(),
						o = this.getWidgetByName("dataField").getValue(),
						s = this.getWidgetByName("relyWidget").getValue(),
						l = this.getWidgetByName("relyData").getValue(),
						d = this.getWidgetByName("subformRely").getValue();
					if (t._checkRelyComplete(n, o, s, l, d)) {
						if (t._checkRelyValid(r, a, n)) {
							var u;
							if (new RegExp(FX.CONST.FIELD.DELIMITER).test(n)) {
								var c = n.split(FX.CONST.FIELD.DELIMITER);
								n = c[0], u = c[1]
							}
							t.widget.async = {
								url: FX.Utils.getApi(FX._API.data.distinct),
								data: {
									formId: n,
									field: o,
									refAppId: u
								}
							};
							var f;
							return l && (f = {
								formId: n,
								field: l,
								refAppId: u
							}), t.widget.rely = {
								widgets: [s],
								ref: f,
								data: {
									formId: n,
									field: o,
									refAppId: u
								}
							}, "subform" === t.widget.type && (t.widget.rely.subLink = d), t.widget.value = null, FX.Utils.applyFunc(t, e, [], !1), FX.Utils.applyFunc(t, i.onWidgetChange, [], !1), !1
						}
						FX.Msg.toast({
							msg: i18next.t("field.rely.invalid"),
							type: "warning"
						})
					} else FX.Msg.toast({
						msg: i18next.t("field.rely.msg.inComplete"),
						type: "warning"
					})
				}
			});
		r.show()
	},
	_getSubformLinkWidgets: function(e) {
		var t = [];
		return e.data && e.data.field ? (FX.Utils.forEach(e.relyItems, function(i, n) {
			if (n.value === e.data.field) return t = n.items, !1
		}), t) : null
	},
	_checkRelyComplete: function(e, t, i, n, a) {
		var o = !0;
		return e && t && i && n || (o = !1), "subform" === this.widget.type && (a && a.length ? FX.Utils.forEach(a, function(e, t) {
			if (!t.rely || !t.link) return o = !1, !1
		}) : o = !1), o
	},
	_checkRelyValid: function(e, t, i) {
		var n = !1;
		if (FX.Utils.forEach(t.forms, function(e, t) {
			if (t.value === i) return n = !0, !1
		}), n) {
			var a = ["dataField", "relyWidget", "relyData"];
			FX.Utils.forEach(a, function(t, i) {
				if (FX.Utils.isFieldValid(e.getWidgetByName(i).getText())) return n = !1, !1
			})
		}
		return n && "subform" === this.widget.type && (n = e.getWidgetByName("subformRely").checkValid()), n
	},
	_setConfigBtnState: function(e, t) {
		var i = "",
			n = "";
		switch (e) {
		case "dataRely":
			i = i18next.t("field.rely.msg.invalid"), n = i18next.t("field.rely.set");
			break;
		case "linkFilterBtn":
			i = i18next.t("field.linkFilter.msg.invalid"), n = i18next.t("field.linkFilter.add");
			break;
		default:
			return
		}
		var a = this.configPane.getWidgetByName(e);
		t ? (a.element.removeClass("error"), a.setText(n)) : FX.Msg.toast({
			msg: i,
			type: "warning"
		})
	},
	_createWidgetLayoutConfig: function() {
		var e = this.options;
		if (e.subform) return {};
		var t = "normal" !== e.formLayout;
		return {
			label: i18next.t("field.layout"),
			tooltip: $("<span/>").text(i18next.t("field.layout.tip")),
			tooltip_type: "tip",
			widget: {
				rowSize: [30],
				colSize: ["auto", 110],
				vgap: 2,
				type: "tablecontainer",
				items: [
					[{
						type: "label",
						text: i18next.t("field.layout.width")
					}, {
						type: "combo",
						searchable: !1,
						allowBlank: !1,
						enable: t,
						customCls: "fx-layout-combo",
						items: [{
							value: "6",
							text: "1/2"
						}, {
							value: "12",
							text: i18next.t("all")
						}],
						value: t ? e.lineWidth && e.lineWidth.toString() : "12",
						onStopEdit: function() {
							self.lineWidth = parseInt(this.getValue()), FX.Utils.applyFunc(self, e.onLineWidthChange, [self.lineWidth], !1)
						}
					}]
				]
			}
		}
	},
	_getWidgetValueSourceOption: function() {
		var e = this.widget.rely;
		return e ? e.data ? FX.WidgetValueOption.RELY : e.formula ? FX.WidgetValueOption.FORMULA : void 0 : FX.WidgetValueOption.CUSTOM
	},
	hasTeamManageAuth: function(e) {
		var t = this;
		FX.Utils.ajax({
			url: FX.Utils.getApi(FX.API.app.user_corps)
		}, function(i) {
			var n = !1;
			FX.Utils.forEach(i.corps, function(e, t) {
				if (t.id === FX.Utils.getCurrentCorp()) return n = t.memberManage, FX.STATIC.isSysManager = t.isSysManager, !1
			}), FX.Utils.applyFunc(t, e, [n], !1)
		})
	},
	createTeamManageSlider: function() {
		var e = new FX.TeamManagePane({
			teamId: FX.Utils.getCurrentCorp(),
			isSysManager: FX.STATIC.isSysManager
		});
		new FX.Slider({
			title: FX.Utils.getTeamManageText(),
			customCls: "slider-teammanage",
			onHeaderCreate: function(t) {
				var i = e.getHeadTabs();
				if (i.length <= 1) return !1;
				var n = $('<div class="menu-wrapper"/>').appendTo(t);
				FX.Utils.forEach(i, function(e, t) {
					var i = $('<div class="menu-tab"/>').data("tab", t).text(t.text).appendTo(n);
					0 === e && i.addClass("select")
				}), n.on("click", ".menu-tab", function(t) {
					var i = $(t.currentTarget),
						n = i.data("tab");
					i.addClass("select").siblings().removeClass("select"), e.switchTab(n.value)
				})
			},
			onContentCreate: function(t) {
				t.append(e.element)
			}
		}).show()
	},
	getLinkFilterConfig: function(e, t) {
		var i = this,
			n = this._getLinkConfig(e),
			a = new FX.ConfirmDialog({
				title: i18next.t("field.linkFilter"),
				width: 520,
				contentWidget: {
					rowSize: [320],
					colSize: [480],
					items: [
						[{
							widgetName: "linkFilter",
							type: "linkfilterpane",
							items: this.widget.linkFilter,
							relyWidgets: n.relyWidgets,
							linkWidgets: n.linkWidgets
						}]
					]
				},
				onOk: function() {
					var e = a.getWidgetByName("linkFilter"),
						n = e.getText(),
						o = !0;
					if (FX.Utils.forEach(n, function(e, t) {
						if (FX.Utils.isFieldValid(t.link)) return o = !1, !1
					}), i._setConfigBtnState("linkFilterBtn", o), o) {
						i.widget.linkFilter = e.getValue();
						var r = [];
						return FX.Utils.forEach(i.widget.linkFilter, function(e, t) {
							r.push(t.rely)
						}), i.widget.rely = {
							widgets: r
						}, t && t(), !1
					}
				}
			});
		a.show()
	},
	getWidgetType: function() {
		return this.widget.type
	},
	getWidget: function() {
		return this.widget
	},
	rebuild: function() {
		this.element.empty(), this._render()
	}
}), FX.TextDesignConfig = FX.extend(FX.FormDesignConfig, {
	_defaultConfig: function() {
		return $.extend(FX.TextDesignConfig.superclass._defaultConfig.apply(), {})
	},
	_getConfigItems: function() {
		var e = this,
			t = this.options,
			i = this.widget,
			n = FX.CONST.TEXT_TYPE_REGEXP;
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: this.options.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, {
			label: i18next.t("format"),
			widget: {
				type: "combo",
				searchable: !1,
				allowBlank: !1,
				width: "100%",
				items: [{
					text: i18next.t("nothing"),
					value: ""
				}, {
					text: i18next.t("mobileNum"),
					value: n.mobile
				}, {
					text: i18next.t("telNum"),
					value: n.tel
				}, {
					text: i18next.t("zipCode"),
					value: n.zip
				}, {
					text: i18next.t("IDNum"),
					value: n.ID
				}, {
					text: i18next.t("email"),
					value: n.email
				}],
				value: i.regex || "",
				onAfterItemSelect: function() {
					i.regex = this.getValue();
					var n = e.configPane.getWidgetByName("defaultInput");
					n && (n.options.regex = e.options.regex), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		}].concat(this._getDefaultValueConfig(), [{
			label: i18next.t("scanCode"),
			widget: {
				type: "checkbox",
				text: i18next.t("field.scan.input"),
				value: !! i.scan,
				onStateChange: function(n) {
					var a = e.configPane,
						o = a.getWidgetByName("scanEditable"),
						r = a.getWidgetByName("scanType"),
						s = e.configPane.getWidgetByName("scanInputTip");
					n ? (i.scan = {
						editable: o.getValue(),
						type: r.getValue()
					}, s.setVisible(!0)) : (i.scan = null, s.setVisible(!1)), o.setEnable(n), r.setEnable(n), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			}
		}, {
			widget: {
				type: "label",
				customCls: "effective-client-tip",
				visible: !! i.scan,
				text: i18next.t("effective.client.tip"),
				widgetName: "scanInputTip"
			}
		}, {
			widget: {
				widgetName: "scanEditable",
				type: "checkbox",
				text: i18next.t("field.scan.editable"),
				value: !(i.scan && !1 === i.scan.editable),
				enable: !! i.scan,
				onStateChange: function(n) {
					i.scan && (i.scan.editable = n), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			}
		}, {
			widget: {
				widgetName: "scanType",
				type: "combo",
				width: "100%",
				value: i.scan && i.scan.type || "barCode",
				items: [{
					text: i18next.t("field.scan.barCode"),
					value: "barCode"
				}, {
					text: i18next.t("field.scan.qrCode"),
					value: "qrCode"
				}],
				allowBlank: !1,
				searchable: !1,
				enable: !! i.scan,
				onAfterItemSelect: function() {
					i.scan && (i.scan.type = this.getValue()), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		}, {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig()
		}, {
			widget: this._createNotRepeatConfig(),
			splitLine: !0
		},
		this._createAuthConfig(),
		{
			widget: this._createEnableConfig(),
			splitLine: !0
		},
		this._createWidgetLayoutConfig()])
	},
	_getDefaultValueConfig: function() {
		if (!this._isDefaultValueEnable()) return [this._createDefaultValueDisableTip()];
		var e = this._getWidgetValueSourceOption();
		return [this._createWidgetDefaultValueConfig(e), this._createDefaultValueInput(e), this._createRelyBtnConfig(e), this._createFormulaButtonConfig()]
	},
	_createDefaultValueInput: function(e) {
		var t = this,
			i = this.options,
			n = this.widget;
		return {
			widget: {
				widgetName: "defaultInput",
				type: "text",
				value: n.value,
				regex: n.regex,
				width: "100%",
				onAfterEdit: function() {
					n.value = this.getValue(), FX.Utils.applyFunc(t, i.onWidgetChange, [], !1)
				},
				visible: e === FX.WidgetValueOption.CUSTOM
			}
		}
	},
	_createWidgetDefaultValueConfig: function(e) {
		var t = this,
			i = this.options,
			n = this.widget,
			a = [{
				value: "custom",
				text: i18next.t("custom"),
				selected: e === FX.WidgetValueOption.CUSTOM
			}, {
				value: "data-rely",
				text: i18next.t("data.rely"),
				selected: e === FX.WidgetValueOption.RELY
			}, {
				value: "formula",
				text: i18next.t("formula.edit"),
				selected: e === FX.WidgetValueOption.FORMULA
			}];
		return {
			label: i18next.t("defaults"),
			widget: {
				type: "combo",
				searchable: !1,
				allowBlank: !1,
				width: "100%",
				items: a,
				onAfterItemSelect: function() {
					var e = this.getValue(),
						a = t.configPane,
						o = a.getWidgetByName("dataRely"),
						r = a.getWidgetByName("formulaBtn"),
						s = a.getWidgetByName("defaultInput");
					switch (e) {
					case "data-rely":
						if (o.isVisible()) return;
						o.setVisible(!0), s && s.setVisible(!1), r && r.setVisible(!1), n.rely = null;
						break;
					case "formula":
						if (r.isVisible()) return;
						r.setVisible(!0), s && s.setVisible(!1), o && o.setVisible(!1), n.rely = null;
						break;
					default:
						n.async && (n.async.url = null), n.rely = null, s.setVisible(!0), o && o.setVisible(!1), r && r.setVisible(!1)
					}
					FX.Utils.applyFunc(t, i.onWidgetChange, [], !1)
				}
			}
		}
	}
}), $.shortcut("text_design", FX.TextDesignConfig), FX.NumberDesignConfig = FX.extend(FX.TextDesignConfig, {
	_getConfigItems: function() {
		var e = this,
			t = this.options,
			i = this.widget;
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! t.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}].concat(this._getDefaultValueConfig(i), [{
			label: i18next.t("validate"),
			widget: this._createNotNullConfig()
		}, {
			widget: {
				type: "checkbox",
				text: i18next.t("field.number.integer"),
				value: !i.allowDecimals,
				onStateChange: function(n) {
					i.allowDecimals = !n, i.value = e.getValue();
					var a = e.configPane.getWidgetByName("defaultInput");
					a && (a.options.allowDecimals = !n, a.options.value = a.getValue(), a.rebuild()), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			}
		}, {
			widget: {
				type: "numberrangeconfig",
				range: {
					max: i.maxNumber,
					min: i.minNumber
				},
				onChange: function(n) {
					i.maxNumber = n.max, i.minNumber = n.min, FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		},
		this._createAuthConfig(),
		{
			widget: this._createEnableConfig(),
			splitLine: !0
		},
		this._createWidgetLayoutConfig()])
	},
	_createDefaultValueInput: function(e) {
		var t = this,
			i = this.options,
			n = this.widget;
		return {
			widget: {
				type: "number",
				allowDecimals: n.allowDecimals,
				value: n.value,
				widgetName: "defaultInput",
				width: "100%",
				onAfterEdit: function() {
					n.value = this.getValue(), FX.Utils.applyFunc(t, i.onWidgetChange, [], !1)
				},
				visible: e === FX.WidgetValueOption.CUSTOM
			}
		}
	}
}), $.shortcut("number_design", FX.NumberDesignConfig), FX.NumberRangeConfig = FX.extend(FX.Widget, {
	_defaultConfig: function() {
		return $.extend(FX.NumberRangeConfig.superclass._defaultConfig.apply(), {
			baseCls: "fx_number_range_config",
			range: {},
			onChange: null
		})
	},
	_init: function() {
		FX.NumberRangeConfig.superclass._init.apply(this, arguments);
		var e = this,
			t = this.options;
		this.range = t.range;
		var i = !FX.Utils.isNull(t.range.max) || !FX.Utils.isNull(t.range.min);
		new FX.CheckBox({
			renderEl: $("<div/>").appendTo(this.element),
			text: i18next.t("field.number.range"),
			value: i,
			onStateChange: function(i) {
				e._renderRange(i), FX.Utils.applyFunc(e, t.onChange, [i ? e.range : {}], !1)
			}
		}), this._renderRange(i)
	},
	_renderRange: function(e) {
		this.$range && this.$range.remove(), e && (this.$range = $('<div class="number-range"/>').appendTo(this.element), this._createNumberInput("min"), $('<div class="range-to"/>').text("~").appendTo(this.$range), this._createNumberInput("max"))
	},
	_createNumberInput: function(e) {
		var t = this,
			i = this.options;
		$('</div><input class="range-input" placeholder="' + i18next.t("unlimited") + '" value="' + this.range[e] + '" type="number"/>').on("input", function() {
			var n = $(this).val();
			FX.Utils.isEmpty(n) ? t.range[e] = void 0 : t.range[e] = parseFloat(n), FX.Utils.applyFunc(t, i.onChange, [t._getRange()], !1)
		}).appendTo($('<div class="range-item"/>').appendTo(this.$range))
	},
	_getRange: function() {
		var e = {};
		return FX.Utils.isEmpty(this.range.max) || FX.Utils.isEmpty(this.range.min) ? FX.Utils.isEmpty(this.range.max) ? FX.Utils.isEmpty(this.range.min) || (e.min = this.range.min) : e.max = this.range.max : (e.max = Math.max(this.range.max, this.range.min), e.min = Math.min(this.range.max, this.range.min)), e
	}
}), $.shortcut("numberrangeconfig", FX.NumberRangeConfig), FX.TextAreaDesignConfig = FX.extend(FX.TextDesignConfig, {
	_getConfigItems: function() {
		var e = this.options,
			t = this.widget;
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}].concat(this._getDefaultValueConfig(t), [{
			label: i18next.t("validate"),
			widget: this._createNotNullConfig(),
			splitLine: !0
		},
		this._createAuthConfig(),
		{
			widget: this._createEnableConfig(),
			splitLine: !0
		},
		this._createWidgetLayoutConfig()])
	},
	_createDefaultValueInput: function(e) {
		var t = this,
			i = this.options,
			n = this.widget;
		return {
			widget: {
				type: "textarea",
				value: n.value,
				widgetName: "defaultInput",
				width: "100%",
				visible: e === FX.WidgetValueOption.CUSTOM,
				onAfterEdit: function() {
					n.value = this.getValue(), FX.Utils.applyFunc(t, i.onWidgetChange, [], !1)
				}
			}
		}
	}
}), $.shortcut("textarea_design", FX.TextAreaDesignConfig), FX.RadioGroupDesignConfig = FX.extend(FX.FormDesignConfig, {
	_getConfigItems: function() {
		var e = this.options,
			t = this,
			i = this.widget,
			n = function() {
				var n = this.getResults();
				i.items = n.items, FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
			};
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, {
			label: i18next.t("option"),
			widget: {
				type: "selectionpane",
				items: i.items,
				contactOption: !e.subform,
				nextItems: e.nextItems,
				onAfterDrop: n,
				onAfterItemSelect: n,
				onAfterItemRemove: n,
				onAfterItemAdd: n,
				onAfterItemEdit: n,
				onAfterWidgetsMapEdit: n
			},
			splitLine: !0
		}, {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig(),
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: this._createEnableConfig(),
			splitLine: !0
		}, this._createWidgetLayoutConfig()]
	}
}), $.shortcut("radiogroup_design", FX.RadioGroupDesignConfig), FX.CheckBoxGroupDesignConfig = FX.extend(FX.FormDesignConfig, {
	_getConfigItems: function() {
		var e = this.options,
			t = this,
			i = this.widget,
			n = function() {
				var n = this.getResults();
				i.items = n.items, FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
			};
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, {
			label: i18next.t("option"),
			widget: {
				type: "selectionpane",
				multi: !0,
				items: i.items,
				onAfterDrop: n,
				onAfterItemSelect: n,
				onAfterItemRemove: n,
				onAfterItemAdd: n,
				onAfterItemEdit: n
			},
			splitLine: !0
		}, {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig(),
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: this._createEnableConfig(),
			splitLine: !0
		}, this._createWidgetLayoutConfig()]
	}
}), $.shortcut("checkboxgroup_design", FX.CheckBoxGroupDesignConfig), FX.DateTimeDesignConfig = FX.extend(FX.FormDesignConfig, {
	_setWidget: function(e) {
		var t = this.options;
		this.widget.value = e, FX.Utils.applyFunc(this, t.onWidgetChange, [], !1)
	},
	_getConfigItems: function() {
		var e = this,
			t = this.options,
			i = this.widget;
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! t.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, {
			label: i18next.t("type"),
			widget: {
				type: "combo",
				searchable: !1,
				allowBlank: !1,
				width: "100%",
				items: [{
					text: i18next.t("date"),
					value: "yyyy-MM-dd"
				}, {
					text: i18next.t("datetime"),
					value: "yyyy-MM-dd HH:mm:ss"
				}],
				value: i.format,
				onAfterItemSelect: function() {
					i.format = this.getValue(), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1);
					var n = e.configPane.getWidgetByName("customDate");
					n.options.format = this.getValue(), n.rebuild()
				}
			},
			splitLine: !0
		}].concat(this._getDefaultValueConfig(), [{
			label: i18next.t("validate"),
			widget: this._createNotNullConfig(),
			splitLine: !0
		},
		this._createAuthConfig(),
		{
			widget: this._createEnableConfig(),
			splitLine: !0
		},
		this._createWidgetLayoutConfig()])
	},
	_getDefaultValueConfig: function() {
		if (!this._isDefaultValueEnable()) return [this._createDefaultValueDisableTip()];
		var e = this._getWidgetValueSourceOption();
		return [this._createWidgetDefaultValueConfig(e), this._createDefaultValueInput(e), this._createRelyBtnConfig(e), this._createFormulaButtonConfig()]
	},
	_createDefaultValueInput: function(e) {
		var t = this,
			i = (this.options, this.widget);
		return {
			widget: {
				type: "datetime",
				widgetName: "customDate",
				format: i.format,
				value: i.value,
				width: "100%",
				visible: e === FX.WidgetValueOption.CUSTOM && "today" !== i.value,
				onAfterEdit: function() {
					t._setWidget(this.getValue())
				}
			}
		}
	},
	_createWidgetDefaultValueConfig: function(e) {
		var t = this,
			i = this.widget;
		return {
			label: i18next.t("defaults"),
			widget: {
				type: "combo",
				widgetName: "dateCombo",
				customCls: "date-type-combo",
				searchable: !1,
				allowBlank: !1,
				width: "100%",
				items: [{
					value: "today",
					text: i18next.t("field.defaults.today"),
					selected: "today" === i.value
				}, {
					value: "custom",
					text: i18next.t("custom"),
					selected: e === FX.WidgetValueOption.CUSTOM && "today" !== i.value
				}, {
					value: "data-rely",
					text: i18next.t("data.rely"),
					selected: e === FX.WidgetValueOption.RELY
				}, {
					value: "formula",
					text: i18next.t("formula.edit"),
					selected: e === FX.WidgetValueOption.FORMULA
				}],
				onAfterItemSelect: function() {
					var e = this.getValue(),
						n = t.configPane,
						a = n.getWidgetByName("customDate");
					if ("today" === e) t._setWidget("today"), a.setVisible(!1), n.getWidgetByName("dataRely").setVisible(!1), n.getWidgetByName("formulaBtn").setVisible(!1), i.rely = null;
					else if ("custom" === e) t._setWidget(a.getValue()), a.setVisible(!0), n.getWidgetByName("dataRely").setVisible(!1), n.getWidgetByName("formulaBtn").setVisible(!1), i.rely = null;
					else if ("data-rely" === e) {
						var o = n.getWidgetByName("dataRely");
						if (o.isVisible()) return;
						t._setWidget(null), o.setVisible(!0), a.setVisible(!1), n.getWidgetByName("formulaBtn").setVisible(!1), i.rely = null
					} else if ("formula" === e) {
						var r = n.getWidgetByName("formulaBtn");
						if (r.isVisible()) return;
						t._setWidget(null), r.setVisible(!0), a.setVisible(!1), n.getWidgetByName("dataRely").setVisible(!1), i.rely = null
					}
				}
			}
		}
	}
}), $.shortcut("datetime_design", FX.DateTimeDesignConfig), FX.ComboDesignConfig = FX.extend(FX.FormDesignConfig, {
	_getConfigItems: function() {
		var e = this.options,
			t = this,
			i = this.widget;
		i.items || (i.items = FX.FormUtils.getWidgetDefaultConfig(i.type).items);
		var n = function() {
				var n = this.getResults();
				i.items = n.items, FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
			},
			a = this._getWidgetValueSourceOption();
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, this._createWidgetDefaultValueConfig(), {
			widget: {
				type: "selectionpane",
				widgetName: "itemPane",
				items: i.items,
				nextItems: e.nextItems,
				contactOption: !e.subform,
				visible: a === FX.WidgetValueOption.CUSTOM,
				onAfterDrop: n,
				onAfterItemSelect: n,
				onAfterItemRemove: n,
				onAfterItemAdd: n,
				onAfterItemEdit: n,
				onAfterWidgetsMapEdit: n
			}
		}, this._createComboTree(), this._createRelyBtnConfig(a, this.getWidgetType()), {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig()
		}, {
			widget: this._createNotRepeatConfig(),
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: this._createEnableConfig(),
			splitLine: !0
		}, this._createWidgetLayoutConfig()]
	},
	_getWidgetValueSourceOption: function() {
		var e = this.widget;
		return e.rely && e.rely.ref ? FX.WidgetValueOption.RELY : e.async ? FX.WidgetValueOption.ASYNC : FX.WidgetValueOption.CUSTOM
	},
	_createWidgetDefaultValueConfig: function() {
		var e = this,
			t = this.options,
			i = this._getWidgetValueSourceOption(),
			n = this.widget;
		return {
			label: i18next.t("option"),
			widget: {
				type: "combo",
				searchable: !1,
				allowBlank: !1,
				width: "100%",
				items: [{
					value: "custom",
					text: i18next.t("custom"),
					selected: i === FX.WidgetValueOption.CUSTOM
				}, {
					value: "async",
					text: i18next.t("field.asyncData"),
					selected: i === FX.WidgetValueOption.ASYNC
				}, {
					value: "data-rely",
					text: i18next.t("data.rely"),
					selected: i === FX.WidgetValueOption.RELY
				}],
				onAfterItemSelect: function() {
					var i = e.configPane;
					switch (this.getValue()) {
					case "custom":
						var a = i.getWidgetByName("itemPane");
						if (a.isVisible()) return;
						n.rely = null, n.async = null, a.setVisible(!0), i.getWidgetByName("dataRely").setVisible(!1), i.getWidgetByName("fieldTree").setVisible(!1);
						break;
					case "async":
						var o = i.getWidgetByName("fieldTree");
						if (o.isVisible()) return;
						n.rely = null, o.setVisible(!0), o.setValue(null), i.getWidgetByName("itemPane").setVisible(!1), i.getWidgetByName("dataRely").setVisible(!1);
						break;
					case "data-rely":
						var r = i.getWidgetByName("dataRely");
						if (r.isVisible()) return;
						n.async = null, r.setVisible(!0), i.getWidgetByName("itemPane").setVisible(!1), i.getWidgetByName("fieldTree").setVisible(!1)
					}
					FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			}
		}
	},
	_createComboTree: function() {
		var e = this,
			t = this.options,
			i = this.widget,
			n = [],
			a = i.async ? [
				[i.async.data.formId, i.async.data.refAppId || FX.STATIC.APPID].join("@"), i.async.data.field] : null;
		return FX.Utils.forEach(t.entryListWithoutAggregate, function(e, t) {
			var i = {
				name: t.name,
				entryId: t.entryId,
				appId: t.appId,
				id: [t.entryId, t.appId].join("@"),
				children: []
			};
			FX.Utils.forEach(t.fields, function(e, t) {
				if (!(FX.LimitFields.combodata.indexOf(t.type) < 0)) {
					var n = {};
					n.name = t.text, n.id = t.name, n.type = t.type, i.children.push(n)
				}
			}), i.children.length > 0 && n.push(i)
		}), {
			widget: {
				type: "combotree",
				visible: this._getWidgetValueSourceOption() === FX.WidgetValueOption.ASYNC,
				widgetName: "fieldTree",
				items: n,
				delimiter: "--",
				width: "100%",
				onAfterNodeClick: function(n) {
					var a = n.getParentNode();
					i.async = {
						url: FX.Utils.getApi(FX._API.data.distinct),
						data: {
							formId: a.entryId,
							field: n.id
						}
					}, a.appId !== FX.STATIC.APPID && (i.async.data.refAppId = a.appId), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				},
				value: a
			}
		}
	},
	_createRelyBtnConfig: function(e) {
		return this._isLimitEnable() ? FX.ComboDesignConfig.superclass._createRelyBtnConfig.apply(this, arguments) : {
			widget: {
				type: "label",
				widgetName: "dataRely",
				customCls: "disable-content-tip",
				text: i18next.t("field.rely.disable.option"),
				visible: e === FX.WidgetValueOption.RELY
			},
			splitLine: !0
		}
	}
}), $.shortcut("combo_design", FX.ComboDesignConfig), FX.ComboCheckDesignConfig = FX.extend(FX.ComboDesignConfig, {
	_getConfigItems: function() {
		var e = this.options,
			t = this,
			i = this.widget;
		i.items || (i.items = FX.FormUtils.getWidgetDefaultConfig(i.type).items);
		var n = function() {
				var n = this.getResults();
				i.items = n.items, FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
			};
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, this._createWidgetDefaultValueConfig(), {
			widget: {
				type: "selectionpane",
				widgetName: "itemPane",
				items: i.items,
				visible: !i.async,
				multi: !0,
				onAfterDrop: n,
				onAfterItemSelect: n,
				onAfterItemRemove: n,
				onAfterItemAdd: n,
				onAfterItemEdit: n
			}
		}, this._createComboTree(), this._createRelyBtnConfig(this._getWidgetValueSourceOption(), this.getWidgetType()), {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig(),
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: this._createEnableConfig(),
			splitLine: !0
		}, this._createWidgetLayoutConfig()]
	}
}), $.shortcut("combocheck_design", FX.ComboCheckDesignConfig), FX.UploadDesignConfig = FX.extend(FX.FormDesignConfig, {
	_getConfigItems: function() {
		var e = FX.CONST.UPLOAD_FILE_COUNT,
			t = this.widget,
			i = this.options,
			n = this;
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! i.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig()
		}, {
			widget: {
				type: "checkbox",
				text: i18next.t("field.file.single"),
				value: t.maxFileCount === e.SINGLE,
				onStateChange: function() {
					this.getValue() ? t.maxFileCount = e.SINGLE : t.maxFileCount = e.MULTI, FX.Utils.applyFunc(n, i.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: this._createEnableConfig(),
			splitLine: !0
		}, this._createWidgetLayoutConfig()]
	}
}), $.shortcut("upload_design", FX.UploadDesignConfig), FX.ImageDesignConfig = FX.extend(FX.UploadDesignConfig, {
	_getConfigItems: function() {
		var e = this,
			t = this.options,
			i = this.widget,
			n = FX.CONST.UPLOAD_FILE_COUNT,
			a = [{
				label: i18next.t("title"),
				widgetType: this._createWidgetTypeConfig(),
				widget: this._createTitleConfig(),
				splitLine: !0
			}, {
				label: i18next.t("description"),
				disabled: !! t.subform,
				widget: this._createDescriptionConfig(),
				splitLine: !0
			}, {
				label: i18next.t("validate"),
				widget: this._createNotNullConfig()
			}, {
				widget: {
					type: "checkbox",
					text: i18next.t("field.img.single"),
					value: i.maxFileCount === n.SINGLE,
					onStateChange: function() {
						this.getValue() ? i.maxFileCount = n.SINGLE : i.maxFileCount = n.MULTI, FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
					}
				}
			}, {
				widget: {
					rowSize: [20],
					colSize: ["auto", 20],
					type: "tablecontainer",
					widgetName: "cameraContainer",
					items: [
						[{
							type: "checkbox",
							text: i18next.t("field.img.camera"),
							value: i.onlyCamera,
							widgetName: "camera",
							onStateChange: function() {
								var n = this.getValue();
								if (e.configPane.getWidgetByName("onlyCameraTip").setVisible(n), i.onlyCamera = n, !n) {
									var a = e.configPane.getWidgetByName("watermarkContainer");
									a && (a.getWidgetByName("watermark").setValue(!1), i.watermark = !1)
								}
								FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
							}
						}]
					]
				}
			}, {
				widget: {
					type: "label",
					customCls: "effective-client-tip",
					visible: i.onlyCamera,
					text: i18next.t("effective.client.tip"),
					widgetName: "onlyCameraTip"
				},
				splitLine: !0
			}, {
				widget: {
					rowSize: [20],
					colSize: ["auto", 20],
					type: "tablecontainer",
					items: [
						[{
							type: "checkbox",
							text: i18next.t("field.img.compress"),
							value: i.compressed,
							onStateChange: function() {
								var n = this.getValue();
								i.compressed = n, e.configPane.getWidgetByName("imgCompressTip").setVisible(n), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
							}
						}]
					]
				}
			}, {
				widget: {
					type: "label",
					customCls: "effective-client-tip",
					visible: i.compressed,
					text: i18next.t("effective.client.tip"),
					widgetName: "imgCompressTip"
				},
				splitLine: !0
			},
			this._createAuthConfig(),
			{
				widget: this._createEnableConfig(),
				splitLine: !0
			},
			this._createWidgetLayoutConfig()];
		return "dingtalk" === FX.Utils.getCorpType(FX.Utils.getCurrentCorp()) && a.splice(6, 0, {
			widget: {
				rowSize: [20],
				colSize: ["auto", 20],
				type: "tablecontainer",
				widgetName: "watermarkContainer",
				items: [
					[{
						type: "checkbox",
						text: i18next.t("field.img.watermark"),
						value: i.watermark,
						widgetName: "watermark",
						onStateChange: function() {
							var n = this.getValue();
							i.watermark = n, n && (e.configPane.getWidgetByName("cameraContainer").getWidgetByName("camera").setValue(!0), i.onlyCamera = !0, e.configPane.getWidgetByName("onlyCameraTip").setVisible(!0)), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
						}
					}, {
						type: "tooltippane",
						style: "tip",
						text: i18next.t("field.img.watermarkTip")
					}]
				]
			}
		}), a
	}
}), $.shortcut("image_design", FX.ImageDesignConfig), FX.AddressDesignConfig = FX.extend(FX.FormDesignConfig, {
	_getConfigItems: function() {
		var e = this.options,
			t = this,
			i = this.widget;
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}].concat(this._getDefaultValueConfig(), [{
			label: i18next.t("validate"),
			widget: this._createNotNullConfig()
		}, {
			widget: {
				type: "checkbox",
				text: i18next.t("view.detailAddress"),
				value: i.needDetail,
				onStateChange: function() {
					i.needDetail = this.getValue(), FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		},
		this._createAuthConfig(),
		{
			widget: this._createEnableConfig(),
			splitLine: !0
		},
		this._createWidgetLayoutConfig()])
	},
	_getDefaultValueConfig: function() {
		if (!this._isDefaultValueEnable()) return [this._createDefaultValueDisableTip()];
		var e = this._getWidgetValueSourceOption();
		return [this._createWidgetDefaultValueConfig(e), this._createRelyBtnConfig(e, this.getWidgetType())]
	},
	_createWidgetDefaultValueConfig: function(e) {
		var t = this,
			i = this.options,
			n = this.widget;
		return {
			label: i18next.t("defaults"),
			widget: {
				type: "combo",
				searchable: !1,
				allowBlank: !1,
				width: "100%",
				items: [{
					value: "custom",
					text: i18next.t("nothing"),
					selected: e === FX.WidgetValueOption.CUSTOM
				}, {
					value: "data-rely",
					text: i18next.t("data.rely"),
					selected: e === FX.WidgetValueOption.RELY
				}],
				onAfterItemSelect: function() {
					var e = this.getValue(),
						a = t.configPane.getWidgetByName("dataRely");
					switch (e) {
					case "data-rely":
						if (a.isVisible()) return;
						a.setVisible(!0), n.rely = null;
						break;
					default:
						n.rely = null, a && a.setVisible(!1)
					}
					FX.Utils.applyFunc(t, i.onWidgetChange, [], !1)
				}
			}
		}
	}
}), $.shortcut("address_design", FX.AddressDesignConfig), FX.LocationDesignConfig = FX.extend(FX.FormDesignConfig, {
	_getConfigItems: function() {
		var e = this,
			t = this.options,
			i = this.widget,
			n = !FX.Utils.isObjectEmpty(i.limits);
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! t.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig()
		}, {
			widget: {
				type: "tablecontainer",
				rowSize: [20],
				colSize: ["auto", 20],
				items: [
					[{
						type: "checkbox",
						text: i18next.t("field.location.range.set"),
						value: n,
						onStateChange: function(n) {
							var a = e.configPane.getWidgetByName("locationList");
							a.setEnable(n), n || (i.limits = [], a.setValue([]), a.rebuild(), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1))
						}
					}, {
						type: "tooltippane",
						tipWidth: 250,
						text: i18next.t("field.location.range.tip")
					}]
				]
			}
		}, {
			widget: {
				widgetName: "locationList",
				type: "locationlist",
				value: i.limits,
				width: "100%",
				enable: n,
				onAfterEdit: function() {
					i.limits = this.getValue(), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		}, {
			label: i18next.t("widget.location.set"),
			widget: {
				rowSize: [20],
				colSize: ["auto", 20],
				type: "tablecontainer",
				items: [
					[{
						type: "checkbox",
						text: i18next.t("field.location.lngLat.show"),
						value: !! i.lnglatVisible,
						onStateChange: function(n) {
							i.lnglatVisible = n, FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
						}
					}, {
						type: "tooltippane",
						tipWidth: 250,
						text: i18next.t("field.location.lngLat.tip")
					}]
				]
			}
		}, {
			widget: {
				type: "checkbox",
				text: i18next.t("field.location.adjustable"),
				value: i.adjustable,
				onStateChange: function(n) {
					i.adjustable = n, n && !i.radius && (i.radius = 500), e.configPane.getWidgetByName("adjustRadius").setEnable(n), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			}
		}, {
			widget: {
				widgetName: "adjustRadius",
				width: "100%",
				type: "combo",
				allowBlank: !1,
				searchable: !1,
				enable: !! i.adjustable,
				items: [{
					text: i18next.t("meters", {
						num: 100
					}),
					value: 100
				}, {
					text: i18next.t("meters", {
						num: 500
					}),
					value: 500
				}, {
					text: i18next.t("meters", {
						num: 1e3
					}),
					value: 1e3
				}, {
					text: i18next.t("meters", {
						num: 1500
					}),
					value: 1500
				}, {
					text: i18next.t("meters", {
						num: 5e3
					}),
					value: 5e3
				}],
				value: i.radius || 500,
				onAfterItemSelect: function() {
					i.radius = this.getValue(), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: this._createEnableConfig(),
			splitLine: !0
		}, this._createWidgetLayoutConfig()]
	}
}), $.shortcut("location_design", FX.LocationDesignConfig), FX.LinkQueryDesignConfig = FX.extend(FX.FormDesignConfig, {
	_getConfigItems: function() {
		var e = this.options,
			t = this,
			i = this.widget,
			n = [],
			a = {},
			o = i.refAppId ? [i.linkForm, i.refAppId].join(FX.CONST.FIELD.DELIMITER) : i.linkForm,
			r = function() {
				FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
			},
			s = e.entryList;
		return FX.Utils.forEach(s, function(e, t) {
			var i = t.entryId;
			t.appId !== FX.STATIC.APPID && (i = [t.entryId, t.appId].join(FX.CONST.FIELD.DELIMITER)), n.push({
				text: t.name,
				value: i
			});
			var o = [];
			FX.Utils.forEach(t.fields, function(e, t) {
				var i = {
					text: t.text,
					name: t.name,
					type: t.type,
					items: t.items,
					format: t.format
				};
				if ("subform" === t.type) {
					var n = [];
					FX.Utils.forEach(t.items, function(e, t) {
						if (FX.ValueWidgets[t.type]) {
							var i = {
								type: t.type,
								widgetName: t.name,
								format: t.format
							};
							"linkdata" === t.type && (i.linkForm = t.linkForm, i.linkFields = t.linkFields, i.refAppId = t.refAppId), n.push({
								widget: i,
								label: t.text
							})
						}
					}), i.items = n
				}
				o.push(i)
			}), a[i] = o
		}), [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, {
			label: i18next.t("field.form"),
			widget: {
				type: "combo",
				allowBlank: !1,
				items: n,
				value: o,
				width: "100%",
				onAfterItemSelect: function() {
					var n = this.getValue();
					if (new RegExp(FX.CONST.FIELD.DELIMITER).test(n)) {
						if ([i.linkForm, i.refAppId].join(FX.CONST.FIELD.DELIMITER) === n) return;
						var o = n.split(FX.CONST.FIELD.DELIMITER);
						i.linkForm = o[0], i.refAppId = o[1]
					} else {
						if (i.linkForm === n) return;
						i.linkForm = n
					}
					i.linkFields = [], i.linkFilter = [];
					var r = t.configPane.getWidgetByName("linkFields");
					r.options.availableFields = a[n], r.options.fields = i.linkFields, r.rebuild(), FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		}, {
			widget: {
				type: "link_field_edit",
				title: i18next.t("field.link"),
				widgetName: "linkFields",
				availableFields: a[o],
				fields: i.linkFields,
				subform: e.subform,
				onAfterFieldAdd: r,
				onAfterFieldUpdate: r,
				onAfterFieldRemove: r,
				onAfterFieldSorted: r
			},
			splitLine: !0
		},
		this._createLinkBtnConfig(a, r), this._createAuthConfig(!0), this._createWidgetLayoutConfig()]
	},
	_getFieldWithConfig: function() {
		return []
	}
}), $.shortcut("linkquery_design", FX.LinkQueryDesignConfig), FX.LinkDataDesignConfig = FX.extend(FX.FormDesignConfig, {
	_getConfigItems: function() {
		var e = this.options,
			t = this,
			i = this.widget,
			n = [],
			a = {},
			o = {},
			r = i.refAppId ? [i.linkForm, i.refAppId].join(FX.CONST.FIELD.DELIMITER) : i.linkForm,
			s = function() {
				FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
			},
			l = e.entryList;
		return FX.Utils.forEach(l, function(e, t) {
			var i = t.entryId;
			t.appId !== FX.STATIC.APPID && (i = [t.entryId, t.appId].join(FX.CONST.FIELD.DELIMITER)), n.push({
				text: t.name,
				value: i
			});
			var r = [],
				s = [];
			FX.Utils.forEach(t.fields, function(e, t) {
				var i = {
					text: t.text,
					name: t.name,
					type: t.type,
					items: t.items,
					format: t.format
				};
				if ("subform" === t.type) {
					var n = [];
					FX.Utils.forEach(t.items, function(e, t) {
						if (FX.ValueWidgets[t.type]) {
							var i = {
								type: t.type,
								widgetName: t.name,
								format: t.format
							};
							"linkdata" === t.type && (i.linkForm = t.linkForm, i.linkFields = t.linkFields, i.refAppId = t.refAppId), n.push({
								widget: i,
								label: t.text
							})
						}
					}), i.items = n
				}
				r.push(i), FX.LimitFields.linkKey.indexOf(t.type) > -1 && s.push({
					text: t.text,
					type: t.type,
					value: t.name
				})
			}), o[i] = s, a[i] = r
		}), [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: !! e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, {
			label: i18next.t("field.form"),
			widget: {
				type: "combo",
				allowBlank: !1,
				items: n,
				value: r,
				width: "100%",
				onAfterItemSelect: function() {
					var n = this.getValue();
					if (new RegExp(FX.CONST.FIELD.DELIMITER).test(n)) {
						if ([i.linkForm, i.refAppId].join(FX.CONST.FIELD.DELIMITER) === n) return;
						var r = n.split(FX.CONST.FIELD.DELIMITER);
						i.linkForm = r[0], i.refAppId = r[1]
					} else {
						if (i.linkForm === n) return;
						i.linkForm = n, i.refAppId = null
					}
					i.linkFields = [], i.linkFilter = [], i.linkKey = null;
					var s = t.configPane.getWidgetByName("linkFields");
					s.options.availableFields = a[n], s.options.fields = i.linkFields, s.rebuild();
					var l = t.configPane.getWidgetByName("linkKey");
					l.options.items = o[n], l.rebuild(), l.setValue(null), FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		}, {
			widget: {
				type: "link_field_edit",
				title: i18next.t("field.show"),
				widgetName: "linkFields",
				availableFields: a[r],
				fields: i.linkFields,
				subform: e.subform,
				onAfterFieldAdd: s,
				onAfterFieldUpdate: s,
				onAfterFieldRemove: s,
				onAfterFieldSorted: s
			},
			splitLine: !0
		}, {
			label: i18next.t("field.key"),
			widget: {
				widgetName: "linkKey",
				type: "combo",
				value: i.linkForm ? i.linkKey : null,
				items: i.linkForm ? o[r] : [],
				width: "100%",
				onAfterItemSelect: function(e, t) {
					i.linkKey = this.getValue(), i.linkType = t ? t.type : "", s && s()
				}
			},
			splitLine: !0
		},
		this._createLinkBtnConfig(a, s),
		{
			label: i18next.t("validate"),
			widget: this._createNotNullConfig(),
			splitLine: !0
		},
		this._createAuthConfig(),
		{
			widget: this._createEnableConfig(),
			splitLine: !0
		},
		this._createWidgetLayoutConfig()]
	},
	_getFieldWithConfig: function() {
		return []
	}
}), $.shortcut("linkdata_design", FX.LinkDataDesignConfig), FX.SignatureDesignConfig = FX.extend(FX.FormDesignConfig, {}), $.shortcut("signature_design", FX.SignatureDesignConfig), FX.SeparatorDesignConfig = FX.extend(FX.FormDesignConfig, {
	_getConfigItems: function() {
		var e = this.options,
			t = this,
			i = FX.CONST.SEP_LINE_STYLE,
			n = this.widget;
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			widget: {
				type: "richtext",
				width: "100%",
				minHeight: 120,
				disableResizeImage: !0,
				value: n.value,
				customCls: "cfg_separator_richtext",
				onAfterEdit: function() {
					var i = this.getValue();
					n.value = i, FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		}, {
			label: i18next.t("field.lineType"),
			widget: {
				type: "segment",
				customCls: "line-style-segment",
				items: [{
					htmlContent: '<div class="line-mode ' + i.NONE + '">' + i18next.t("field.lineType.none") + "</div>",
					value: i.NONE
				}, {
					htmlContent: '<div class="line-mode ' + i.DASHED + '"/>',
					value: i.DASHED
				}, {
					htmlContent: '<div class="line-mode ' + i.THIN + '"/>',
					value: i.THIN
				}, {
					htmlContent: '<div class="line-mode ' + i.THICK + '"/>',
					value: i.THICK
				}],
				value: n.lineStyle || i.THIN,
				onAfterItemSelect: function() {
					n.lineStyle = this.getValue(), FX.Utils.applyFunc(t, e.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		}, this._createAuthConfig()]
	}
}), $.shortcut("separator_design", FX.SeparatorDesignConfig), FX.SubformDesignConfig = FX.extend(FX.FormDesignConfig, {
	_defaultConfig: function() {
		return $.extend(FX.SubformDesignConfig.superclass._defaultConfig.apply(), {
			onSubItemSelect: null
		})
	},
	_getConfigItems: function() {
		var e = this.widget,
			t = this,
			i = this.options,
			n = ["subform_create", "subform_edit", "subform_delete"];
		e.items = e.items || [];
		var a = this._getWidgetValueSourceOption();
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, {
			label: i18next.t("field"),
			widget: {
				type: "subformpane",
				items: e.items,
				onAfterItemAdd: function(n, a) {
					e.items.splice(a + 1, 0, n), FX.Utils.applyFunc(t, i.onWidgetChange, [], !1)
				},
				onAfterItemRemove: function(n) {
					e.items.splice(n, 1), FX.Utils.applyFunc(t, i.onWidgetChange, [], !1)
				},
				onAfterItemSelect: function(i) {
					var n = e.items[i];
					t._renderSubConfig(n)
				},
				onAfterDrop: function() {
					e.items = this.collectAllItems(), FX.Utils.applyFunc(t, i.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		}, this._createWidgetDefaultValueConfig(), {
			widget: {
				widgetName: "defaultButton",
				type: "button",
				text: i18next.t("setting"),
				width: "100%",
				height: 30,
				style: "white",
				visible: a === FX.WidgetValueOption.CUSTOM,
				onClick: function() {
					t._createDefaultValueConfig()
				}
			}
		}, this._createRelyBtnConfig(a, this.getWidgetType()), {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig(),
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: {
				rowSize: [20],
				colSize: ["auto", 20],
				type: "tablecontainer",
				items: [
					[{
						type: "checkbox",
						text: i18next.t("editable"),
						value: e.enable,
						widgetName: "enable",
						onStateChange: function(a) {
							e.enable = a, FX.Utils.forEach(n, function(i, n) {
								t.configPane.getWidgetByName(n).setValue(a), e[n] = a
							}), FX.Utils.applyFunc(t, i.onWidgetChange, [], !1)
						}
					}, {
						type: "tooltippane",
						tipWidth: 250,
						text: i18next.t("field.subform.auth.tip")
					}]
				]
			}
		}, {
			widget: this._createSubAuthConfig(i18next.t("field.subform.auth.add"), "subform_create", n)
		}, {
			widget: this._createSubAuthConfig(i18next.t("field.subform.auth.edit"), "subform_edit", n)
		}, {
			widget: this._createSubAuthConfig(i18next.t("field.subform.auth.delete"), "subform_delete", n)
		}]
	},
	_createDefaultValueConfig: function() {
		var e = this,
			t = this.options,
			i = this.widget;
		new FX.ConfirmDialog({
			title: i18next.t("defaults"),
			width: 690,
			text4Ok: i18next.t("done"),
			contentWidget: {
				type: "subform",
				noFieldText: i18next.t("field.defaults.set"),
				ignoreOptAuth: !0,
				items: i.items.slice(0),
				value: i.value,
				onBeforeWidgetCreate: function(e) {
					$.extend(e, {
						allowBlank: !0
					})
				}
			},
			onOk: function() {
				return i.value = this.container.getCacheValue(), 0 === i.value.length && (i.value = null), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1), !1
			}
		}).show()
	},
	_createWidgetDefaultValueConfig: function() {
		var e = this,
			t = this.options,
			i = this.widget,
			n = this._getWidgetValueSourceOption(),
			a = [{
				value: "custom",
				text: i18next.t("custom"),
				selected: n === FX.WidgetValueOption.CUSTOM
			}, {
				value: "data-rely",
				text: i18next.t("data.rely"),
				selected: n === FX.WidgetValueOption.RELY
			}];
		return {
			label: i18next.t("defaults"),
			widget: {
				type: "combo",
				searchable: !1,
				allowBlank: !1,
				width: "100%",
				items: a,
				onAfterItemSelect: function() {
					var n = this.getValue(),
						a = e.configPane,
						o = a.getWidgetByName("dataRely"),
						r = a.getWidgetByName("defaultButton");
					switch (n) {
					case "data-rely":
						if (o.isVisible()) return;
						o.setVisible(!0), r.setVisible(!1), i.rely = null;
						break;
					default:
						i.rely = null, r.setVisible(!0), o.setVisible(!1)
					}
					FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			}
		}
	},
	_renderSubConfig: function(e) {
		var t = this,
			i = this.options;
		this.element.children(".form-item-config").addClass("x-ui-hidden");
		var n = $('<div class="sub-item-config"/>').appendTo(this.element);
		FX.createWidget({
			renderEl: n,
			type: e.widget.type + "_design",
			formAttr: i.formAttr,
			allEntryList: i.allEntryList,
			entryList: i.entryList,
			entryListWithoutAggregate: i.entryListWithoutAggregate,
			fieldLabelMap: i.fieldLabelMap,
			formItems: i.formItems,
			label: e.label,
			subform: this.widget.widgetName,
			widget: e.widget,
			subLink: this.widget.rely && this.widget.rely.subLink,
			onLabelChange: function(n) {
				e.label = n, FX.Utils.applyFunc(t, i.onWidgetChange, [], !1)
			},
			onWidgetChange: function(n) {
				e.widget = this.getWidget(), FX.Utils.applyFunc(t, i.onWidgetChange, [], !1), n && (t.element.children(".sub-item-config").remove(), t._renderSubConfig(e))
			}
		}), $('<div class="x-btn style-green subconfig-back"/>').text(i18next.t("done")).click(function() {
			n.remove(), t.element.children(".form-item-config").removeClass("x-ui-hidden"), FX.Utils.applyFunc(t, i.onWidgetChange, [!0], !1)
		}).prependTo(n)
	}
}), $.shortcut("subform_design", FX.SubformDesignConfig), FX.UserDesignConfig = FX.extend(FX.FormDesignConfig, {
	_defaultConfig: function() {
		return $.extend(FX.UserDesignConfig.superclass._defaultConfig.apply(), {
			title: i18next.t("widget.user.listTitle")
		})
	},
	_getConfigItems: function() {
		var e = this.options;
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, this._getLimitConfig(), {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig()
		}, {
			widget: this._createNotRepeatConfig(),
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: this._createEnableConfig(),
			splitLine: !0
		}, this._createWidgetLayoutConfig()]
	},
	_getLimit: function() {
		return this.widget.limit
	},
	_setLimit: function(e) {
		this.widget.limit = e, FX.Utils.applyFunc(this, this.options.onWidgetChange, [], !1)
	},
	_getDeptWidgets: function() {
		var e = this.options,
			t = [];
		return FX.Utils.forEach(e.formItems, function(e, i) {
			i && i.widget && ("dept" !== i.widget.type && "deptgroup" !== i.widget.type || t.push({
				value: i.widget.widgetName,
				text: i.label
			}))
		}), t
	},
	_setDefaultValue: function() {
		var e = this.options,
			t = this,
			i = this.widget,
			n = new FX.ConfirmDialog({
				title: e.title,
				width: 610,
				contentWidget: {
					rowSize: [440],
					colSize: [570],
					items: [
						[{
							widgetName: i.widgetName,
							type: this.getWidgetType(),
							editable: !0,
							value: i.value,
							limit: i.limit,
							dynamicType: "set"
						}]
					]
				},
				onOk: function() {
					var a = n.getWidgetByName(i.widgetName);
					return i.value = a.getCacheValue(), FX.Utils.applyFunc(t, e.onWidgetChange, [], !1), !1
				},
				onCreateFooterLeft: function(e) {
					t.hasTeamManageAuth(function(i) {
						i && new FX.Button({
							renderEl: $("<div />").appendTo(e),
							text: FX.Utils.getTeamManageText(),
							width: 120,
							style: "white",
							onClick: function() {
								t.createTeamManageSlider()
							}
						})
					})
				}
			});
		n.show()
	},
	_getLimitConfig: function() {
		var e = this,
			t = this.options,
			i = this.widget;
		i.rely || (i.valueOption = FX.WidgetValueOption.CUSTOM);
		var n = !0;
		if (i.valueOption === FX.WidgetValueOption.RELY && i.rely) {
			var a = this._getRelyConfig();
			n = e._isRelyConfigValid(a)
		}
		return {
			label: i18next.t("field.optionalRange"),
			widget: {
				type: "deptlimitpane",
				roleEnable: !0,
				memberEnable: !0,
				items: [{
					value: "custom",
					text: i18next.t("custom")
				}, {
					value: "widgets",
					text: i18next.t("field.user.deptLimit")
				}],
				limit: this._getLimit(),
				rely: i.rely,
				isDefaultValueEnable: this._isDefaultValueEnable(),
				isLimitEnable: this._isLimitEnable(),
				isRelyValid: n,
				limitWidget: i.limitWidget,
				title: t.title,
				valueOption: i.valueOption,
				dynamicFields: [{
					id: FX.USER_ID.CurrentUser,
					name: i18next.t("widget.user.current"),
					type: "dynamic"
				}],
				onAfterLimitSet: function(t) {
					e._setLimit(t)
				},
				onAfterLimitTypeChange: function(n) {
					switch (n) {
					case "custom":
						i.rely = null, i.limitWidget = null, this.rebuildWithOpt({
							valueOption: FX.WidgetValueOption.CUSTOM,
							rely: i.rely,
							limitWidget: i.limitWidget
						});
						break;
					case "widgets":
						i.rely = null, i.limit = {}, i.value = e.getNullValue()
					}
					FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				},
				onAfterValueTypeChange: function(n) {
					i.valueOption = n, n === FX.WidgetValueOption.CUSTOM ? i.rely = null : i.value = e.getNullValue(), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				},
				onBeforeWidgetsCreate: function() {
					this.setDeptWidgets(e._getDeptWidgets())
				},
				onAfterWidgetSelect: function(n) {
					i.limitWidget = n, FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				},
				onRelySet: function() {
					e._showRelyDialog()
				},
				onSetDefaultValue: function(t) {
					var i = this;
					t === FX.WidgetValueOption.RELY ? e._showRelyDialog(function() {
						i.rebuildWithOpt({
							isRelyValid: !0,
							valueOption: FX.WidgetValueOption.RELY
						})
					}) : e._setDefaultValue()
				}
			},
			splitLine: !0
		}
	}
}), $.shortcut("user_design", FX.UserDesignConfig), FX.UserGroupDesignConfig = FX.extend(FX.UserDesignConfig, {
	_defaultConfig: function() {
		return $.extend(FX.UserGroupDesignConfig.superclass._defaultConfig.apply(), {})
	},
	_getConfigItems: function() {
		var e = this.options;
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, this._getLimitConfig(), {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig(),
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: this._createEnableConfig(),
			splitLine: !0
		}, this._createWidgetLayoutConfig()]
	}
}), $.shortcut("usergroup_design", FX.UserGroupDesignConfig), FX.DeptDesignConfig = FX.extend(FX.FormDesignConfig, {
	_defaultConfig: function() {
		return $.extend(FX.DeptDesignConfig.superclass._defaultConfig.apply(), {
			title: i18next.t("widget.dept.listTitle")
		})
	},
	_getConfigItems: function() {
		var e = this.options;
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, this._getLimitConfig(), {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig()
		}, {
			widget: this._createNotRepeatConfig(),
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: this._createEnableConfig(),
			splitLine: !0
		}, this._createWidgetLayoutConfig()]
	},
	_getLimit: function() {
		return this.widget.limit
	},
	_setLimit: function(e) {
		this.widget.limit = e, FX.Utils.applyFunc(this, this.options.onWidgetChange, [], !1)
	},
	_getDeptWidgets: function() {
		var e = this.options,
			t = [];
		return FX.Utils.forEach(e.formItems, function(e, i) {
			i && i.widget && ("dept" !== i.widget.type && "deptgroup" !== i.widget.type || t.push({
				value: i.widget.widgetName,
				text: i.label
			}))
		}), t
	},
	_setDefaultValue: function() {
		var e = this.options,
			t = this,
			i = this.widget,
			n = new FX.ConfirmDialog({
				title: e.title,
				width: 610,
				contentWidget: {
					rowSize: [440],
					colSize: [570],
					items: [
						[{
							widgetName: i.widgetName,
							type: this.getWidgetType(),
							editable: !0,
							value: i.value,
							limit: i.limit,
							dynamicType: "set"
						}]
					]
				},
				onOk: function() {
					var a = n.getWidgetByName(i.widgetName);
					return i.value = a.getCacheValue(), FX.Utils.applyFunc(t, e.onWidgetChange, [], !1), !1
				},
				onCreateFooterLeft: function(e) {
					t.hasTeamManageAuth(function(i) {
						i && new FX.Button({
							renderEl: $("<div />").appendTo(e),
							text: FX.Utils.getTeamManageText(),
							width: 120,
							style: "white",
							onClick: function() {
								t.createTeamManageSlider()
							}
						})
					})
				}
			});
		n.show()
	},
	_getLimitConfig: function() {
		var e = this,
			t = this.options,
			i = this.widget;
		i.rely || (i.valueOption = FX.WidgetValueOption.CUSTOM);
		var n = !0;
		if (i.valueOption === FX.WidgetValueOption.RELY && i.rely) {
			var a = this._getRelyConfig();
			n = e._isRelyConfigValid(a)
		}
		return {
			label: i18next.t("field.optionalRange"),
			widget: {
				type: "deptlimitpane",
				items: [{
					value: "custom",
					text: i18next.t("custom")
				}, {
					value: "rely",
					text: i18next.t("data.rely")
				}],
				limit: this._getLimit(),
				rely: i.rely,
				isDefaultValueEnable: this._isDefaultValueEnable(),
				isLimitEnable: this._isLimitEnable(),
				isRelyValid: n,
				title: t.title,
				valueOption: i.valueOption,
				dynamicFields: [{
					id: FX.CONST.DEPT_ID.CURRENT,
					name: i18next.t("dept.current"),
					type: "dynamic"
				}],
				onAfterLimitSet: function(t) {
					e._setLimit(t)
				},
				onAfterLimitTypeChange: function(n) {
					"custom" === n ? (i.rely = null, this.rebuildWithOpt({
						valueOption: FX.WidgetValueOption.CUSTOM,
						rely: i.rely
					})) : (i.limit = {}, i.value = e.getNullValue(), i.valueOption === FX.WidgetValueOption.RELY && (i.valueOption = FX.WidgetValueOption.CUSTOM, i.rely = null)), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				},
				onAfterValueTypeChange: function(n) {
					i.valueOption = n, n === FX.WidgetValueOption.CUSTOM ? i.rely = null : i.value = e.getNullValue(), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				},
				onRelySet: function() {
					e._showRelyDialog()
				},
				onSetDefaultValue: function(t) {
					i.valueOption = t;
					var n = this;
					t === FX.WidgetValueOption.RELY ? e._showRelyDialog(function() {
						n.rebuildWithOpt({
							isRelyValid: !0,
							valueOption: FX.WidgetValueOption.RELY
						})
					}) : e._setDefaultValue()
				}
			},
			splitLine: !0
		}
	}
}), $.shortcut("dept_design", FX.DeptDesignConfig), FX.DeptGroupDesignConfig = FX.extend(FX.DeptDesignConfig, {
	_defaultConfig: function() {
		return $.extend(FX.DeptGroupDesignConfig.superclass._defaultConfig.apply(), {})
	},
	_getConfigItems: function() {
		var e = this.options;
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: e.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, this._getLimitConfig(), {
			label: i18next.t("validate"),
			widget: this._createNotNullConfig(),
			splitLine: !0
		}, this._createAuthConfig(), {
			widget: this._createEnableConfig(),
			splitLine: !0
		}, this._createWidgetLayoutConfig()]
	}
}), $.shortcut("deptgroup_design", FX.DeptGroupDesignConfig), FX.SerialNumDesignConfig = FX.extend(FX.FormDesignConfig, {
	_getConfigItems: function() {
		return [{
			label: i18next.t("title"),
			widgetType: this._createWidgetTypeConfig(),
			widget: this._createTitleConfig(),
			splitLine: !0
		}, {
			label: i18next.t("description"),
			disabled: this.options.subform,
			widget: this._createDescriptionConfig(),
			splitLine: !0
		}, this._createSerialRule(), this._createAuthConfig(!0), this._createWidgetLayoutConfig()]
	},
	_getFieldList: function() {
		var e = this.options,
			t = [];
		return FX.Utils.forEach(e.formItems, function(e, i) {
			var n = FX.Utils.getFieldAttr(i, ["text", "number", "combo", "radiogroup"]);
			n && t.push({
				id: n.name,
				name: n.text
			})
		}), t
	},
	_createSerialRule: function() {
		var e = this,
			t = this.options,
			i = this.widget;
		return i.rules = i.rules || [], {
			label: i18next.t("widget.sn.rule"),
			widget: {
				type: "snrulepane",
				fieldList: this._getFieldList(),
				rules: i.rules,
				onAfterItemAdd: function(n, a) {
					i.rules.splice(a + 1, 0, n), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				},
				onAfterItemRemove: function(n) {
					i.rules.splice(n, 1), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				},
				onAfterDrop: function() {
					i.rules = this.collectAllRules(), FX.Utils.applyFunc(e, t.onWidgetChange, [], !1)
				}
			},
			splitLine: !0
		}
	}
}), $.shortcut("sn_design", FX.SerialNumDesignConfig), function(e) {
	FX.PhoneDesignConfig = FX.extend(FX.FormDesignConfig, {
		_getConfigItems: function() {
			var e = this.options;
			return [{
				label: i18next.t("title"),
				widgetType: this._createWidgetTypeConfig(),
				widget: this._createTitleConfig(),
				splitLine: !0
			}, {
				label: i18next.t("description"),
				disabled: !! e.subform,
				widget: this._createDescriptionConfig(),
				splitLine: !0
			}, {
				label: i18next.t("validate"),
				widget: this._createNotNullConfig()
			}, {
				widget: this._createNotRepeatConfig()
			}, {
				contentEl: this._createSmsVerifyCheck()
			}, {
				contentEl: this._createSmsCount(),
				splitLine: !0
			}, this._createAuthConfig(), {
				widget: this._createEnableConfig(),
				splitLine: !0
			}, this._createWidgetLayoutConfig()]
		},
		_createSmsVerifyCheck: function() {
			var t = this,
				i = this.options,
				n = e('<div class="sms-verify-check"/>'),
				a = new FX.CheckBox({
					renderEl: e("<span/>").appendTo(n),
					text: i18next.t("widget.phone.sms.verify"),
					value: this.widget.hasSmsVerify,
					onStateChange: function(e) {
						e ? t._dealSmsPurchase(function(e) {
							a.setSelected(e), t.purchaseBtn.setVisible(e), e && (t.widget.hasSmsVerify = e, FX.Utils.applyFunc(t, i.onWidgetChange, [], !1))
						}) : (t.widget.hasSmsVerify = e, t.purchaseBtn.setVisible(!1), FX.Utils.applyFunc(t, i.onWidgetChange, [], !1))
					}
				});
			return new FX.Tooltip({
				renderEl: e("<span/>").appendTo(n),
				content: e("<span>" + i18next.t("widget.phone.sms.verify.tip") + '<div><a href="https://hc.jiandaoyun.com/doc/11207" target="jdy-doc">' + i18next.t("view.helpCenter") + "</a></div></span>")
			}), n
		},
		_createSmsCount: function() {
			var t = e('<div class="phone-sms-count"/>'),
				i = this._getSmsCount();
			return e('<div class="count">' + i18next.t("widget.phone.sms.count", {
				count: i
			}) + "</div>").appendTo(t), this.purchaseBtn = new FX.Button({
				renderEl: e("<div/>").appendTo(t),
				style: "green",
				width: 124,
				height: 30,
				text: i18next.t("widget.phone.purchase.sms"),
				visible: !! this.widget.hasSmsVerify,
				onClick: function() {
					FX.Utils.isCorpCreator() ? window.open("/profile/order/create?type=amountAddon", "_blank") : FX.Msg.toast({
						type: "warning",
						msg: i18next.t("widget.phone.purchase.tip9")
					})
				}
			}), t
		},
		_dealSmsPurchase: function(t) {
			var i = this._getSmsCount();
			if (i >= 100) t && t(!0);
			else {
				var n = "",
					a = "",
					o = "",
					r = "",
					s = "",
					l = FX.Utils.isCorpCreator();
				i > 0 ? (n = "query", l ? (a = i18next.t("widget.phone.purchase.tip1"), o = i18next.t("widget.phone.purchase.tip2"), r = i18next.t("widget.phone.now.purchase"), s = i18next.t("widget.phone.not.purchase")) : (a = i18next.t("widget.phone.purchase.tip3"), o = i18next.t("widget.phone.purchase.tip4"), r = i18next.t("iSee"))) : (n = "warning", l ? (a = i18next.t("widget.phone.purchase.tip5"), o = i18next.t("widget.phone.purchase.tip6"), r = i18next.t("widget.phone.now.purchase"), s = i18next.t("widget.phone.not.purchase")) : (a = i18next.t("widget.phone.purchase.tip7"), o = i18next.t("widget.phone.purchase.tip8"), r = i18next.t("iSee")));
				var d = i > 0,
					u = {
						type: n,
						title: a,
						msg: o,
						tip: e('<a target="jdy_doc" href="https://hc.jiandaoyun.com/doc/11207">' + i18next.t("vip.advancedFeatures") + "</a>"),
						text4Cancel: s,
						text4Ok: r,
						onCancel: function() {
							t && t(d)
						}
					};
				l ? e.extend(u, {
					onOk: function() {
						return window.open("/profile/order/create?type=amountAddon", "_blank"), !1
					}
				}) : e.extend(u, {
					onOk: function() {
						t && t(d)
					}
				}), FX.Msg.alert(u)
			}
		},
		_getSmsCount: function() {
			var e = FX.Vip.getSmsPack();
			return FX.Utils.isObjectEmpty(e) ? 0 : e.total - e.used
		}
	}), e.shortcut("phone_design", FX.PhoneDesignConfig)
}(jQuery), function(e) {
	FX.FormSet = function(e, t) {
		this.$oContent = t, this.formConfig = e, this.config = FX.Utils.pick(e.getConfig(), ["_id", "entryId", "formName", "formAttr", "formItems", "isDingtalkAdmin", "isWechatAdmin"]), this.showSetView()
	}, e.extend(FX.FormSet.prototype, {
		showSetView: function() {
			var t = this,
				i = e('<div class="form-set-container"/>').appendTo(this.$oContent),
				n = e('<div class="form-set-wrapper"/>').appendTo(i),
				a = e('<div class="form-set-menu"/>').on("click", ".menu-item", function(i) {
					var n = e(i.currentTarget);
					if (n.hasClass("active")) return !1;
					t.compareSetAndSaveConfirm(function() {
						n.addClass("active").siblings().removeClass("active"), t._rebuild(s, n.attr("action"))
					})
				}).appendTo(n),
				o = FX.Utils.getUrlParameter("action"),
				r = {
					auth: {
						name: i18next.t("data.auth"),
						icon: "icon-data-auth"
					}
				};
			r.label = {
				name: i18next.t("data.label"),
				icon: "icon-price-tag"
			}, this.config.formAttr.hasCoop && (r.msg = {
				name: i18next.t("data.notify"),
				icon: "icon-news"
			}), r.public = {
				name: i18next.t("data.openLink"),
				icon: "icon-link-o",
				hasSeparator: !0
			}, r.submit = {
				name: i18next.t("data.submitPrompt"),
				icon: "icon-success"
			}, r.print = {
				name: i18next.t("data.printTemplate"),
				icon: "icon-print"
			}, r.api = {
				name: i18next.t("data.api"),
				icon: "icon-data-api"
			}, FX.Utils.isEmpty(o) ? r.auth.active = !0 : r[o].active = !0, FX.Utils.forEach(r, function(t, i) {
				var n = i.active ? "active" : "";
				a.append('<div class="menu-item ' + n + '" action="' + t + '"><i class="' + i.icon + '"></i>' + i.name + "</div>"), i.hasSeparator && e('<div class="menu-separator"/>').appendTo(a)
			});
			var s = e('<div class="form-set-pane"/>').appendTo(n);
			this._rebuild(s, o)
		},
		_rebuild: function(e, t) {
			e.empty();
			var i = FX.CONST.SAVE_CONFIRM_PANE;
			switch (this.currentPane = null, t) {
			case "auth":
				this._createAuthPane(e);
				break;
			case "print":
				this._createPrintPane(e);
				break;
			case "label":
				this.currentPane = i.DATA_LABEL, this._createLabelPane(e);
				break;
			case "msg":
				this._createMessagePane(e);
				break;
			case "public":
				this.currentPane = i.PUBLIC_LINK, this._createPublicLinkPane(e), this._createFormLinkPane(e), this._createDataLinkPane(e), this._createReferPane(e);
				break;
			case "api":
				this._createApiPane(e);
				break;
			case "submit":
				this.currentPane = i.CUSTOM_SUBMIT, this._createSubmitPane(e);
				break;
			default:
				this._createAuthPane(e)
			}
		},
		compareSetAndSaveConfirm: function(e) {
			var t = this,
				i = FX.CONST.SAVE_CONFIRM_PANE;
			switch (this.currentPane) {
			case i.DATA_LABEL:
				this.formSetDataLabel.compareDataLabel() ? e && e() : FX.UI.showSaveConfirm({
					key: i18next.t("data.label"),
					onSave: function() {
						t.formSetDataLabel.doSave(function() {
							e && e()
						})
					},
					onCancel: function() {
						e && e()
					}
				});
				break;
			case i.PUBLIC_LINK:
				this.comparePublicLink() ? e && e() : FX.UI.showSaveConfirm({
					key: i18next.t("data.openLink"),
					onSave: function() {
						t.saveQueryData(function() {
							e && e()
						})
					},
					onCancel: function() {
						e && e()
					}
				});
				break;
			case i.CUSTOM_SUBMIT:
				this.customSubmit.compareCustomSubmit() ? e && e() : FX.UI.showSaveConfirm({
					key: i18next.t("data.submitPrompt"),
					onSave: function() {
						t.customSubmit.doSave(function() {
							e && e()
						})
					},
					onCancel: function() {
						e && e()
					}
				});
				break;
			default:
				e && e()
			}
		},
		comparePublicLink: function() {
			var e = this.config.formAttr;
			if (!e.isQuery) return !0;
			var t = {
				filterFields: e.filterFields,
				queryFields: e.queryFields
			};
			FX.Utils.isNull(e.queryPwd) || (t.queryPwd = e.queryPwd);
			var i = {
				filterFields: this.queryPaneBody.getWidgetByName("filterFields").getValue(),
				queryFields: this.queryPaneBody.getWidgetByName("queryFields").getValue()
			};
			if (this.queryPaneBody.getWidgetByName("queryPassSwitch").getValue()) {
				var n = this.queryPaneBody.getWidgetByName("queryPwd");
				n.checkValidate() && (i.queryPwd = n.getValue())
			}
			return t.filterFields.length === i.filterFields.length && t.queryFields.length === i.queryFields.length && t.queryPwd === i.queryPwd && FX.Utils.skipEmptyStringify(t).length === FX.Utils.skipEmptyStringify(i).length
		},
		_createAuthPane: function(t) {
			var i = this.config,
				n = i.formAttr,
				a = e('<div class="form-set-item"/>').appendTo(t),
				o = e('<div class="pane-head "/>').append(e('<div class="title"><span>' + i18next.t("data.auth") + '</span><span class="subtitle">' + i18next.t("data.auth.subTitle") + '<a class="subtitle-link" target="fx_help" href="' + FX.CONFIG.HOST.HELP_DOC_HOST + '/9089">' + i18next.t("nav.doc") + "</a></span></div>")).appendTo(a),
				r = FX.CONFIG.HOST.SITE_SHORT_HOST + "/app/" + FX.STATIC.APPID + "/entry/" + FX.STATIC.ENTRYID;
			e('<a class="team-link-btn"><i class="icon-link-o"/>' + i18next.t("form.link") + "</a>").click(function(t) {
				e(t.currentTarget).length && FX.UI.shareUrl({
					url: r,
					title: i18next.t("form.link"),
					subTitle: i18next.t("form.link.subTitle")
				})
			}).appendTo(o), FX.Utils.dt(FX.CONST.TRACKER.AUTH_GROUPS);
			var s = n.hasCoop ? "auth" : "flow";
			new FX.FormSetAuthPane({
				renderEl: e("<div/>").appendTo(a),
				mode: s,
				hasExtParams: n.hasExtParams,
				entryItems: i.formItems,
				entryId: i.entryId
			})
		},
		_createLabelPane: function(t) {
			var i = this.config,
				n = e('<div class="form-set-item"/>').appendTo(t);
			e('<div class="pane-head"/>').append(e('<div class="title"><span>' + i18next.t("data.label") + '</span><span class="subtitle">' + i18next.t("data.label.subTitle") + '<a class="subtitle-link" target="fx_help" href="' + FX.CONFIG.HOST.HELP_DOC_HOST + '/10739">' + i18next.t("nav.doc") + "</a></span></div>")).appendTo(n), this.formSetDataLabel = new FX.FormSetLabelPane({
				renderEl: e("<div/>").appendTo(n),
				customCls: "fx-data-label",
				formItems: i.formItems
			})
		},
		_createSubmitPane: function(t) {
			var i = this.config,
				n = e('<div class="form-set-item"/>').appendTo(t);
			e('<div class="pane-head"/>').append(e('<div class="title"><span>' + i18next.t("data.submitPrompt") + '</span><span class="subtitle">' + i18next.t("data.submitPrompt.subTitle") + '<a class="subtitle-link" target="fx_help" href="' + FX.CONFIG.HOST.HELP_DOC_HOST + '/10884">' + i18next.t("nav.doc") + "</a></span></div><span/>")).appendTo(n), this.customSubmit = new FX.FormSetSubmitPane({
				renderEl: e("<div/>").appendTo(n),
				customCls: "fx_data_submit",
				formItems: i.formItems
			})
		},
		_createPublicLinkPane: function(t) {
			var i = e('<div class="form-set-item"/>').appendTo(t);
			e('<div class="pane-head"/>').append(e('<div class="title"><span>' + i18next.t("data.openLink") + '</span><span class="subtitle">' + i18next.t("data.openLink.subtitle") + '<a href="' + FX.CONFIG.HOST.HELP_DOC_HOST + '/11114" class="subtitle-link" target="_blank">' + i18next.t("link.management.specification") + "</a></span></div>")).appendTo(i)
		},
		_createFormLinkPane: function(t) {
			var i = this,
				n = this.config,
				a = n.formAttr,
				o = e('<div class="form-set-item"/>').appendTo(t),
				r = e('<div class="pane-head"/>').append(e('<div class="title"><span>' + i18next.t("form.externalLink") + '</span><span class="subtitle">' + i18next.t("form.release.link") + "</span></div>")).appendTo(o),
				s = e('<div class="head-line">').appendTo(r);
			new FX.Switch({
				renderEl: e("<div/>").appendTo(s),
				value: a.isPublic,
				customCls: "link-instruction-switch",
				onSwitch: function(e) {
					i.doSaveFormSet({
						isPublic: e
					}, function() {
						i._updateConfigAttr({
							isPublic: e
						}), e ? l.slideDown("fast") : l.slideUp("fast")
					})
				}
			});
			var l = e('<div class="pane-body"/>').appendTo(o);
			new FX.OpenLinkPane({
				renderEl: e('<div class="open-link-wrapper"/>').appendTo(l),
				entryName: n.formName,
				mode: "set",
				url: FX.CONFIG.HOST.SITE_SHORT_HOST + "/f/" + n._id,
				formId: n._id,
				publicPwd: a.publicPwd,
				extParams: a.extParams,
				hasExtParams: a.hasExtParams,
				onSave: function(e, t) {
					i.doSaveFormSet(e, function() {
						i._updateConfigAttr(e), FX.Utils.applyFunc(i, t, [], !1)
					})
				}
			}), a.isPublic || l.hide()
		},
		_createDataLinkPane: function(t) {
			var i = this,
				n = this.config,
				a = n.formAttr;
			if (a.hasCoop) {
				var o = e('<div class="form-set-item"/>').appendTo(t),
					r = e('<div class="pane-head"/>').append(e('<div class="title"><span>' + i18next.t("data.externalLink") + '</span><span class="subtitle">' + i18next.t("data.externalLink.subTitle") + "</span></div>")).appendTo(o),
					s = e('<div class="head-line">').appendTo(r);
				new FX.Switch({
					renderEl: e("<div/>").appendTo(s),
					value: a.isPublicData,
					onSwitch: function(e) {
						i.doSaveFormSet({
							isPublicData: e
						}, function() {
							i._updateConfigAttr({
								isPublicData: e
							})
						}), e ? l.slideDown("fast") : l.slideUp("fast")
					}
				});
				var l = e('<div class="pane-body"/>').appendTo(o);
				new FX.DataLinkPane({
					renderEl: e('<div class="data-link-pane"/>').appendTo(l),
					entryId: n.entryId,
					entryItems: n.formItems,
					hasExtParams: a.hasExtParams,
					publicOptAuth: a.publicOptAuth,
					onSave: function(e) {
						i.doSaveFormSet({
							publicOptAuth: e
						}, function() {
							i._updateConfigAttr({
								publicOptAuth: e
							})
						})
					}
				}), a.isPublicData || l.hide()
			}
		},
		_createReferPane: function(t) {
			var i = this,
				n = this.config,
				a = n.formAttr,
				o = [],
				r = [],
				s = FX.CONFIG.HOST.SITE_SHORT_HOST + "/q/" + n._id;
			FX.Utils.forEach(n.formItems, function(e, t) {
				FX.Utils.isValueWidget(t.widget.type) && (FX.LimitFields.queryFilter.indexOf(t.widget.type) > -1 && o.push({
					text: t.label,
					value: t.widget.widgetName,
					selected: !a.isQuery || a.filterFields && a.filterFields.indexOf(t.widget.widgetName) > -1
				}), r.push({
					text: t.label,
					value: t.widget.widgetName,
					selected: !a.isQuery || a.queryFields && a.queryFields.indexOf(t.widget.widgetName) > -1
				}))
			});
			var l = e('<div class="form-set-item"/>').appendTo(t),
				d = e('<div class="pane-head"/>').append(e('<div class="title"><span>' + i18next.t("form.query") + '</span><span class="subtitle">' + i18next.t("form.query.subTitle") + "</span></div>")).appendTo(l),
				u = e('<div class="pane-body"/>').appendTo(l),
				c = e('<div class="head-line"/>').appendTo(d);
			new FX.Switch({
				renderEl: e("<div/>").appendTo(c),
				value: a.isQuery,
				onSwitch: function(t) {
					var n = {
						isQuery: t
					};
					if (t) {
						var a = i.queryPaneBody.getWidgetByName("clipboard");
						a && a.select(), e.extend(n, {
							filterFields: i.queryPaneBody.getWidgetByName("filterFields").getValue(),
							queryFields: i.queryPaneBody.getWidgetByName("queryFields").getValue()
						})
					}
					i.doSaveFormSet(n, function() {
						i._updateConfigAttr(n), t ? u.slideDown("fast") : u.slideUp("fast")
					})
				}
			}), this.queryPaneBody = new FX.TableContainer({
				renderEl: e("<div/>").appendTo(u),
				rowSize: [30, 30, 1, 30, 30, 1, 30, 30, 1, 30, 30, 1, 30, 1, 30],
				colSize: ["100%", "auto", "auto"],
				hgap: 10,
				vgap: 10,
				padding: 20,
				items: [
					[{
						type: "label",
						text: i18next.t("query.condition"),
						baseCls: "x-label pane-label"
					}],
					[{
						type: "combocheck",
						widgetName: "filterFields",
						items: o,
						width: 300
					}],
					[e('<div class="item-separator"/>')],
					[{
						type: "label",
						text: i18next.t("form.fields.display"),
						baseCls: "x-label pane-label"
					}],
					[{
						type: "combocheck",
						items: r,
						widgetName: "queryFields",
						width: 300
					}],
					[e('<div class="item-separator"/>')],
					[{
						type: "label",
						text: i18next.t("form.public.queryLink"),
						baseCls: "x-label pane-label"
					}],
					[{
						type: "shareurlpane",
						url: s,
						width: 560
					}],
					[e('<div class="item-separator"/>')],
					[{
						type: "label",
						text: i18next.t("form.public.queryLink.needPass"),
						baseCls: "x-label pane-label"
					}],
					[{
						type: "switch",
						width: 44,
						height: 22,
						widgetName: "queryPassSwitch",
						value: !! a.queryPwd,
						onSwitch: function(e) {
							var t = i.queryPaneBody.getWidgetByName("queryPwd");
							e ? (t.setVisible(!0), t.select()) : t.setVisible(!1)
						}
					}, {
						type: "text",
						widgetName: "queryPwd",
						visible: !! a.queryPwd,
						allowBlank: !1,
						waterMark: i18next.t("query.pass.type"),
						text: a.queryPwd,
						width: 200,
						height: 30
					}],
					[e('<div class="item-separator"/>')],
					[{
						type: "label",
						text: i18next.t("form.public.queryLink.shareTo"),
						baseCls: "x-label pane-label",
						width: 80
					}, {
						type: "sharepane",
						width: 250,
						url: s,
						title: i18next.t("form.public.queryLink.shareMsg", {
							name: n.formName,
							entry: i18next.t("form")
						})
					},
					null],
					[e('<div class="item-separator"/>')],
					[{
						type: "button",
						text: i18next.t("saveInfo.setting"),
						width: 120,
						style: "green",
						onClick: function() {
							i.saveQueryData(function() {
								FX.Msg.toast({
									type: "success",
									msg: i18next.t("saveInfo.success")
								})
							})
						}
					}]
				]
			}), a.isQuery || u.hide()
		},
		saveQueryData: function(e) {
			var t = this,
				i = this.queryPaneBody.getWidgetByName("queryFields"),
				n = this.queryPaneBody.getWidgetByName("filterFields"),
				a = {
					queryFields: i.getValue(),
					filterFields: n.getValue()
				},
				o = this.queryPaneBody.getWidgetByName("queryPassSwitch").getValue(),
				r = this.queryPaneBody.getWidgetByName("queryPwd"),
				s = null,
				l = !0;
			if (o && (s = r.getValue(), !r.checkValidate())) return r.showErrorMsg(i18next.t("form.pass.required")), void(l = !1);
			l && (a.queryPwd = s), this.doSaveFormSet(a, function() {
				t._updateConfigAttr(a), e && e()
			})
		},
		_createMessagePane: function(t) {
			var i = this.config;
			if (i.formAttr.hasCoop) {
				var n = e('<div class="form-set-item"/>').appendTo(t);
				e('<div class="pane-head "/>').append(e('<div class="title"><span>' + i18next.t("data.notify") + '</span><span class="subtitle">' + i18next.t("data.notify.subTitle") + '<a class="subtitle-link" target="fx_help" href="' + FX.CONFIG.HOST.HELP_DOC_HOST + '/9044">' + i18next.t("nav.doc") + "</a></span></div>")).appendTo(n), new FX.FormSetNotifyPane({
					renderEl: e("<div />").appendTo(n),
					isDingtalkAdmin: i.isDingtalkAdmin,
					isWechatAdmin: i.isWechatAdmin,
					formItems: i.formItems
				})
			}
		},
		_createPrintPane: function(t) {
			var i = e(".print-template-item", t);
			i.length > 0 ? i.empty() : i = e('<div class="form-set-item print-template-item"/>').appendTo(t);
			var n, a = this.config.formAttr,
				o = [];
			a.hasCoop || (o = a.flow.versions.slice(), n = a.flow.flowVer), e('<div class="pane-head pane-head-border-none"/>').append(e('<div class="title"><span>' + i18next.t("data.printTemplate") + '</span><span class="subtitle">' + i18next.t("data.printTemplate.subTitle") + '<a class="subtitle-link" target="fx_help" href="' + FX.CONFIG.HOST.HELP_DOC_HOST + '/11163">' + i18next.t("nav.doc") + "</a></span></div>")).appendTo(i), new FX.FormSetPrintPane({
				renderEl: e("<div/>").appendTo(i),
				flowVersion: o,
				currentVersion: n
			})
		},
		_createApiPane: function(t) {
			var i = e('<div class="form-set-item"/>').appendTo(t);
			e('<div class="pane-head"/>').append(e('<div class="title"><span>' + i18next.t("data.api") + '</span><span class="subtitle">' + i18next.t("data.api.subTitle") + '<a class="subtitle-link" href="https://hc.jiandaoyun.com/doc/10732" target="fx_help">' + i18next.t("nav.doc") + "</a></span></div>")).appendTo(i), new FX.FormSetApiPane({
				renderEl: e("<div/>").appendTo(i),
				formName: this.config.formName
			})
		},
		doSaveFormSet: function(e, t, i) {
			FX.FormUtils.doSaveFormSet(e, t, i)
		},
		_updateConfigAttr: function(t) {
			e.extend(this.config.formAttr, t), this.formConfig.updateConfig(t)
		}
	})
}(jQuery), function(e) {
	FX.FormDataManage = function(e, t) {
		this.$oContent = t, this.formConfig = e, this.config = FX.Utils.pick(e.getConfig(), ["_id", "entryId", "formName", "formAttr", "formItems", "formLayout"]), FX.STATIC.EntryRecNo = null, this.showDataManagerView()
	}, e.extend(FX.FormDataManage.prototype, {
		showDataManagerView: function() {
			var t = this,
				i = this.config,
				n = {
					renderEl: e("<div/>").appendTo(this.$oContent),
					API: FX._API,
					appId: FX.STATIC.APPID,
					entryId: i.entryId,
					formName: i.formName,
					formItems: i.formItems,
					formAttr: {
						layout: i.formLayout
					},
					openLink: FX.Utils.pick(i.formAttr, ["publicPwd", "isPublic", "extParams", "hasExtParams"]),
					formId: i._id,
					dataPerms: {
						flow_activate: !0,
						flow_transfer: !0,
						flow_close: !0,
						create: !0,
						delete: !0,
						import: !0,
						export: !0,
						update: !0,
						flow_update: !0,
						batch_print: !0,
						flow_batch_print: !0
					},
					hasExtParams: i.formAttr.hasExtParams,
					showFields: i.formAttr.showFields,
					showFieldsMeta: i.formAttr.showFieldsMeta,
					isAdmin: !0,
					hasCoop: i.formAttr.hasCoop,
					hasDataRecycle: !0,
					isPublicData: i.formAttr.isPublicData,
					publicDataUrlPrefix: FX.CONFIG.HOST.SITE_SHORT_HOST + "/l/" + i._id,
					onDataFieldSelect: function(e) {
						t.doSaveFormSet({
							showFields: e
						}, function() {
							i.formAttr.showFields = e
						})
					},
					onDataFieldMetaChange: function(e) {
						t.doSaveFormSet({
							showFieldsMeta: e
						}, function() {
							i.formAttr.showFieldsMeta = e
						})
					}
				},
				a = new FX.DataManagePane(n);
			e(window).unbind("resize.datamanage"), e(window).bind("resize.datamanage", function() {
				a.element && a.element.is(":visible") || e(window).unbind("resize.datamanage"), t.resizeinterval && clearTimeout(t.resizeinterval), t.resizeinterval = setTimeout(function() {
					a.doResize && a.doResize()
				}, 800)
			})
		},
		doSaveFormSet: function(e, t, i) {
			FX.FormUtils.doSaveFormSet(e, t, i)
		}
	})
}(jQuery), function(e) {
	FX.FormFlow = function(e, t) {
		this.$oContent = t;
		var i = e.getConfig();
		this.config = FX.Utils.pick(i, ["_id", "entryId", "formName", "formAttr", "formItems"]), this.isDingtalkAdmin = i.isDingtalkAdmin, this.isWechatAdmin = i.isWechatAdmin, this.showFlowView()
	}, e.extend(FX.FormFlow.prototype, {
		_createFlowConfigPane: function(t) {
			var i = this;
			e('<div class="config-tab"/>').append(e('<div class="node-tab"/>').text(i18next.t("flow.node.attr"))).append(e('<div class="flow-tab"/>').text(i18next.t("flow.attr"))).appendTo(t).click(function(n) {
				var a = e(n.target).closest(".node-tab");
				a && a.length > 0 && (t.children(".config-tab").addClass("tab-select"), t.children(".config-content").removeClass("x-ui-hidden"), i.msgCfgPane.setVisible(!1));
				var o = e(n.target).closest(".flow-tab");
				o && o.length > 0 && (t.children(".config-tab").removeClass("tab-select"), t.children(".config-content").addClass("x-ui-hidden"), i.msgCfgPane.setVisible(!0))
			}), this._createEmptyFlowConfig(t), this._createFlowConfigContent(t)
		},
		_createEmptyFlowConfig: function(t) {
			t.children(".config-content").remove(), t.append(e('<div class="config-content x-ui-hidden"/>').append(e('<div class="empty-message"/>').text(i18next.t("flow.node.select"))))
		},
		_createFlowConfigContent: function(t) {
			var i = this,
				n = this.config.formAttr.flow,
				a = n.msgChannels || [],
				o = this.isDingtalkAdmin ? "dingtalk" : this.isWechatAdmin ? "wework" : "wechat",
				r = {
					dingtalk: {
						text: i18next.t("flow.msg.dingtalk"),
						value: a.indexOf("dingtalk") > -1
					},
					wework: {
						text: i18next.t("flow.msg.wework"),
						value: a.indexOf("wework") > -1
					},
					wechat: {
						text: i18next.t("flow.msg.wechat"),
						value: a.indexOf("wechat") > -1
					}
				}[o];
			this.msgCfgPane = new FX.ConfigPane({
				renderEl: e('<div class="config-message"/>').appendTo(t),
				items: [{
					label: i18next.t("flow.msg"),
					widget: {
						widgetName: "imMessageCheck",
						type: "checkbox",
						text: r.text,
						value: r.value,
						onStateChange: function(e) {
							i._updateMsgChannels(n, o, e)
						}
					}
				}, {
					widget: {
						widgetName: "mailMessageCheck",
						type: "checkbox",
						text: i18next.t("flow.msg.email"),
						value: a.indexOf("mail") > -1,
						visible: !this.isDingtalkAdmin,
						onStateChange: function(e) {
							i._updateMsgChannels(n, "mail", e)
						}
					},
					splitLine: !0
				}, {
					widget: {
						rowSize: [20],
						colSize: ["auto", 20],
						type: "tablecontainer",
						items: [
							[{
								type: "checkbox",
								text: i18next.t("flow.revoke.allow"),
								value: n.allowRevoke,
								onStateChange: function(e) {
									n.allowRevoke = e, i.doSaveFormSet({
										flow: {
											allowRevoke: n.allowRevoke
										}
									})
								}
							}, {
								type: "tooltippane",
								text: i18next.t("flow.revoke.tip")
							}]
						]
					},
					splitLine: !0
				}, {
					label: i18next.t("flow.logAndState"),
					widget: {
						rowSize: [20],
						colSize: ["auto", 20],
						type: "tablecontainer",
						items: [
							[{
								type: "checkbox",
								text: i18next.t("flow.log.enable"),
								value: n.hasLogView,
								onStateChange: function(e) {
									n.hasLogView = e, i.doSaveFormSet({
										flow: {
											hasLogView: n.hasLogView
										}
									})
								}
							}, {
								type: "tooltippane",
								text: i18next.t("flow.log.tip"),
								tipWidth: 150
							}]
						]
					},
					splitLine: !0
				}, {
					label: i18next.t("flow.version.btn"),
					widget: {
						type: "button",
						height: 30,
						style: "white",
						text: i18next.t("flow.version.manage"),
						onClick: function() {
							i._showVersionControl(t)
						}
					}
				}]
			})
		},
		_updateMsgChannels: function(e, t, i) {
			if (e.msgChannels || (e.msgChannels = []), i) e.msgChannels.push(t);
			else {
				var n = e.msgChannels.indexOf(t);
				n > -1 && e.msgChannels.splice(n, 1)
			}
			this.doSaveFormSet({
				flow: {
					msgChannels: e.msgChannels
				}
			})
		},
		_showVersionControl: function(e) {
			var t = this,
				i = this.config,
				n = i.formAttr,
				a = n.flow;
			FX.Utils.isEmpty(t.currentVersion) && (t.currentVersion = a.flowVer);
			var o = new FX.Dialog({
				title: i18next.t("flow.version.manage"),
				width: 600,
				contentWidget: {
					rowSize: [470],
					colSize: [600],
					padding: 0,
					items: [
						[{
							widgetName: "flowVersion",
							type: "flowversionpane",
							versions: a.versions,
							designVer: a.designVer,
							entryId: i.entryId,
							flowVer: a.flowVer,
							currentVersion: t.currentVersion,
							onCreateVersion: function() {
								t.compareFlowAndSaveConfirm(function() {
									t._createVersion(e), o.close()
								})
							},
							onAfterEdit: function(i) {
								t.compareFlowAndSaveConfirm(function() {
									t._changeEntryFlow(i, e, o)
								})
							}
						}]
					]
				},
				onClose: function() {
					if (a.versions.length) {
						var i = !1;
						if (FX.Utils.forEach(a.versions, function(e, n) {
							if (n.ver === t.currentVersion) return i = !0, !1
						}), !i) {
							var r = o.getWidgetByName("flowVersion").getSelectVersion();
							t.currentVersion = r, t.entryFlow.changeVersionAndInitFlow(r, a.flowVer), t.entryFlow.resetState(), t._createEmptyFlowConfig(e)
						}
					} else t.doSaveFormSet({
						hasFlow: !1
					}, function() {
						n.hasFlow = !1, t.showFlowView()
					})
				}
			});
			o.show()
		},
		_changeEntryFlow: function(t, i, n) {
			var a = this,
				o = this.config.formAttr.flow,
				r = t.version;
			t.flow && e.extend(o, t.flow), t.edit && (a.currentVersion = r, t.release ? a.entryFlow.releaseFlow(r) : a.entryFlow.changeVersionAndInitFlow(r, o.flowVer), a.entryFlow.resetState(), a._createEmptyFlowConfig(i), n && n.close())
		},
		_createFlowEmptyPane: function() {
			var t = this,
				i = this.config,
				n = i.formAttr,
				a = e('<div class="form-flow-empty"/>').appendTo(this.$oContent),
				o = new FX.Button({
					renderEl: e("<div/>").appendTo(a),
					customCls: "empty-btn",
					width: 120,
					text: i18next.t("flow.enable"),
					onClick: function() {
						FX.Utils.dt(FX.CONST.TRACKER.FLOW_FORM_INIT), o.setEnable(!1), t.doSaveFormSet({
							hasFlow: !0
						}, function() {
							n.hasFlow = !0, n.flow.versions.length <= 0 ? FX.Utils.ajax({
								url: FX.Utils.getApi(FX._API.form.workflow.create, FX.STATIC.APPID, i.entryId)
							}, function(e) {
								n.flow.versions.push({
									ver: e.newVersion
								}), n.flow.designVer.push(e.newVersion), t.showFlowView()
							}) : t.showFlowView()
						})
					}
				});
			a.append(e('<div class="empty-info"/>').text(i18next.t("flow.enable.tip"))).append(e('<div class="empty-info sub-info"/>').append(e("<span/>").text(i18next.t("flow.enable.qa"))).append(e('<a class="x-c-key" target="_blank" href="' + FX.CONFIG.HOST.HELP_DOC_HOST + '/9048"/>').text(i18next.t("helpCenter"))))
		},
		_createVersion: function(e) {
			var t = this,
				i = (this.options, FX.Utils.createMask(this.element, {
					hasLoader: !0,
					isLight: !0
				})),
				n = this.config.formAttr.flow;
			FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.workflow.create, FX.STATIC.APPID, t.config.entryId),
				data: {
					version: t.currentVersion
				}
			}, function(i) {
				var a = i.newVersion.toString();
				n.versions.push({
					ver: a
				}), n.designVer.push(a), t.currentVersion = a, t.entryFlow.changeVersionAndInitFlow(a, n.flowVer), t.entryFlow.resetState(), t._createEmptyFlowConfig(e)
			}, function() {
				FX.Msg.toast({
					type: "error",
					msg: i18next.t("flow.version.add.fail")
				})
			}, function() {
				i.remove()
			})
		},
		showFlowView: function() {
			var t = this,
				i = this.config,
				n = i.formAttr;
			if (this.$oContent.empty(), n.hasFlow) {
				var a = e('<div class="form-flow-title"/>').appendTo(this.$oContent),
					o = e('<div class="form-flow-pane"/>').appendTo(this.$oContent),
					r = e('<div class="form-flow-config"/>').appendTo(this.$oContent),
					s = [];
				n.flow && n.flow.versions && (s = n.flow.versions).length > 0 && (this.currentVersion = n.flow.flowVer || s[s.length - 1].ver), this.entryFlow = new FX.EntryFlow({
					renderEl: e("<div/>").appendTo(o),
					entryId: i.entryId,
					version: this.currentVersion,
					versions: s,
					designVer: n.flow && n.flow.designVer,
					flowVer: n.flow && n.flow.flowVer,
					entryName: i.formName,
					entryItems: i.formItems,
					configPane: r,
					async: {
						url: FX.Utils.getApi(FX._API.form.workflow.get, FX.STATIC.APPID, i.entryId)
					},
					onAffixClick: function() {
						t.compareFlowAndSaveConfirm(function() {
							t._createVersion(r)
						})
					},
					onAfterLoad: function() {
						t._renderFlowNodeGuide(), t._renderFlowChargerGuide()
					},
					onNodeClick: function() {
						r.children(".config-tab").addClass("tab-select").children(".node-tab").text(i18next.t("flow.node.attr")), t.msgCfgPane.setVisible(!1)
					},
					onConnectorClick: function() {
						r.children(".config-tab").addClass("tab-select").children(".node-tab").text(i18next.t("flow.node.path")), t.msgCfgPane.setVisible(!1)
					},
					onSelectEmpty: function() {
						r.children(".config-tab").removeClass("tab-select"), t.msgCfgPane.setVisible(!0), t._createEmptyFlowConfig(r)
					},
					onAfterRelease: function(e) {
						if (n.flow) {
							n.flow.flowVer = e;
							var t = n.flow.designVer.indexOf(e);
							t > -1 && n.flow.designVer.splice(t, 1)
						}
					},
					onInitTitle: function(t, i) {
						if (a.empty().append(t).append(i), !FX.Vip.hasSignature()) {
							var n = this.options.items,
								r = !1;
							if (FX.Utils.forEach(n, function(e, t) {
								if (t && !([FX.CONST.WORKFLOW.START_FLOW_ID, FX.CONST.WORKFLOW.END_FLOW_ID].indexOf(t.flowId) > -1) && t.flowType !== FX.CONST.WORKFLOW.FLOWTYPE.CC) return t.signature && t.signature.enable ? (r = !0, !1) : void 0
							}), e(".form-flow-pane-banner", o).remove(), o.removeClass("has-banner"), r) {
								o.addClass("has-banner");
								var s = '<i class="icon-warning-circle"/>';
								FX.Utils.isCorpCreator() ? s += i18next.t("flow.vip.signature.admin") + '<a href="' + FX.Utils.getApi(FX.API.profile.order_compare) + '?addon=signature">' + i18next.t("vip.upgrade.yes") + "</a>" : s += i18next.t("flow.vip.signature.mem"), new FX.Alert({
									renderEl: e('<div class="form-flow-pane-banner"/>').appendTo(o),
									closable: !0,
									type: "error",
									messageContent: s,
									onClose: function() {
										o.removeClass("has-banner")
									}
								})
							}
						}
					},
					onVersionCtrlClick: function() {
						t._showVersionControl(r)
					},
					onVersionItemClick: function(e) {
						t.compareFlowAndSaveConfirm(function() {
							t._changeEntryFlow(e, r)
						})
					}
				}), this._createFlowConfigPane(r), e(window).off("resize.flow"), e(window).on("resize.flow", function() {
					t.entryFlow.element && t.entryFlow.element.is(":visible") || e(window).off("resize.flow"), t.resizeinterval && clearTimeout(t.resizeinterval), t.resizeinterval = setTimeout(function() {
						t.entryFlow.doResize && t.entryFlow.doResize()
					}, 800)
				})
			} else this._createFlowEmptyPane(), this._shouldFlowNodeGuide() && e(".form-flow-empty .empty-btn").click()
		},
		_shouldFlowNodeGuide: function() {
			var e = !0;
			return FX.Cookie.get(FX.CONST.COOKIE.STEP_GUIDE.KEY) || (e = !1), FX.Cookie.get(FX.CONST.COOKIE.STEP_GUIDE.KEY) != FX.CONST.COOKIE.STEP_GUIDE.VALUE.FLOW_NODE - 1 && (e = !1), e
		},
		_renderFlowNodeGuide: function() {
			var t = this,
				i = this.entryFlow.getVersionType();
			if (this._shouldFlowNodeGuide()) {
				var n = {};
				n = "design" !== i ? {
					anchor: e(".chart-affix .add-version"),
					msg: i18next.t("form.guide.flow.version"),
					vAdjust: -30,
					isCircleEnable: !0,
					isCircleVisible: !0,
					isTriangleVisible: !1
				} : {
					anchor: e(".chart-menu .menu-move").first(),
					msg: i18next.t("form.guide.flow.node"),
					hAdjust: -74,
					isCircleEnable: !1,
					isCircleVisible: !1,
					isTriangleVisible: !0
				}, FX.Msg.dotGuide(e.extend({}, n, {
					index: 6,
					total: 8,
					hasMask: !0,
					isStepGuide: !0,
					onClose: function() {
						FX.UI.showHelpCenterGuide()
					},
					onNext: function() {
						var n = FX.CONST.COOKIE.STEP_GUIDE.VALUE.FLOW_NODE;
						FX.Cookie.set(FX.CONST.COOKIE.STEP_GUIDE.KEY, n, {
							expires: FX.CONST.COOKIE.STEP_GUIDE.EXPIRES,
							path: "/"
						}), "design" !== i ? e(".chart-affix .add-version").click() : t._renderFlowChargerGuide()
					}
				}))
			}
		},
		_renderFlowChargerGuide: function() {
			var t = this;
			if (FX.Cookie.get(FX.CONST.COOKIE.STEP_GUIDE.KEY) && FX.Cookie.get(FX.CONST.COOKIE.STEP_GUIDE.KEY) == FX.CONST.COOKIE.STEP_GUIDE.VALUE.FLOW_CHARGER - 1) {
				var i = e(".chart-content .flow-selector");
				i && i.length && (this.entryFlow.selectNode(0), FX.Msg.dotGuide({
					anchor: i.first(),
					index: 7,
					total: 8,
					msg: i18next.t("form.guide.flow.charger"),
					vAdjust: -38,
					hAdjust: -58,
					hasMask: !0,
					isStepGuide: !0,
					delay: 500,
					isCircleVisible: !0,
					isTriangleVisible: !1,
					onClose: function() {
						FX.UI.showHelpCenterGuide()
					},
					onNext: function() {
						var e = FX.CONST.COOKIE.STEP_GUIDE.VALUE.FLOW_CHARGER;
						FX.Cookie.set(FX.CONST.COOKIE.STEP_GUIDE.KEY, e, {
							expires: FX.CONST.COOKIE.STEP_GUIDE.EXPIRES,
							path: "/"
						}), t._renderFlowLaunchGuide()
					}
				}))
			}
		},
		_renderFlowLaunchGuide: function() {
			var t = e(".form-flow-title .release-btn");
			t && t.length && FX.Msg.dotGuide({
				position: "left",
				anchor: t,
				index: 8,
				total: 8,
				msg: i18next.t("form.guide.flow.launch"),
				vAdjust: -30,
				hAdjust: -18,
				hasMask: !0,
				isStepGuide: !0,
				style4Circle: "white",
				onEnd: function() {
					FX.UI.showHelpCenterGuide()
				}
			})
		},
		doSaveFormSet: function(e, t, i) {
			FX.FormUtils.doSaveFormSet(e, t, i)
		},
		compareFlowAndSaveConfirm: function(e) {
			var t = this;
			this.compareFlow() ? e && e() : FX.UI.showSaveConfirm({
				key: i18next.t("flow.setting"),
				onSave: function() {
					t.saveFlow(function() {
						e && e()
					})
				},
				onCancel: function() {
					e && e()
				}
			})
		},
		compareFlow: function() {
			return !this.entryFlow || this.entryFlow.compareFlow()
		},
		saveFlow: function(e) {
			if (!this.entryFlow) return e && e();
			this.entryFlow.saveFlow(!1, function(t) {
				t && e && e()
			})
		}
	})
}(jQuery), function(e) {
	FX.ColorPicker = FX.extend(FX.Widget, {
		_defaultConfig: function() {
			return e.extend(FX.ColorPicker.superclass._defaultConfig.apply(), {
				baseCls: "x-color-picker",
				recommendColor: null,
				color: "#FFFFFF",
				onChange: null
			})
		},
		_init: function() {
			FX.ColorPicker.superclass._init.apply(this, arguments);
			var e = this.options;
			this._initValue(), e.recommendColor && e.recommendColor.length > 0 && this._renderLeft(), this._renderRight(), this._bindEvent()
		},
		_initValue: function() {
			var e = this.options;
			this.PANEL_WIDTH = 140, this.PANEL_HEIGHT = 109;
			var t = this._hexToRGB(e.color),
				i = this._rgb2hsv(t.r, t.g, t.b);
			this.hue = i.h, this.sat = i.s, this.val = i.v
		},
		_bindEvent: function() {
			var t = this;
			e(".picker-panel", this.element).on("mousedown", function(i) {
				t._cursorChange(i), e(document).off("mousemove.pickerCursor"), e(document).on("mousemove.pickerCursor", function(e) {
					t._cursorChange(e)
				})
			}), e(".picker-liner", this.element).on("mousedown", function(i) {
				t._sliderChange(i), e(document).off("mousemove.colorSlider"), e(document).on("mousemove.colorSlider", function(e) {
					t._sliderChange(e)
				})
			}), e(document).on("mouseup", function() {
				e(document).off("mousemove.pickerCursor"), e(document).off("mousemove.colorSlider")
			})
		},
		_renderLeft: function() {
			var t = this.options,
				i = this,
				n = e('<div class="recommend-color"><p class="title">' + i18next.t("recommend.color") + "</p></div>").appendTo(this.element),
				a = "";
			FX.Utils.forEach(t.recommendColor, function(e, t) {
				"#ffffff" === t.toLowerCase() ? a += '<span class="color-item" data-color="#FFFFFF" style="background-color: #FFFFFF; border: 1px solid #D4D4D4"/>' : a += '<span class="color-item" data-color="' + t + '" style="background-color: ' + t + '"/>'
			}), e('<div class="recommend-box"/>').html(a).appendTo(n).on("click", function(n) {
				var a = e(n.target).closest(".color-item");
				if (a && a.length > 0) {
					i.color = a.data("color");
					var o = i._hexToRGB(i.color),
						r = i._rgb2hsv(o.r, o.g, o.b);
					i.hue = r.h, i.sat = r.s, i.val = r.v;
					var s = e(".picker-cursor", i.element),
						l = e(".picker-panel", i.element),
						d = e(".color-slider", i.element),
						u = e(".picker-liner", i.element),
						c = e(".picker-input", i.element);
					s.css({
						left: i.sat / 100 * l.width() - s.width() / 2,
						top: (100 - i.val) / 100 * l.height() - s.height() / 2
					}), d.css({
						left: Math.round(i.hue / 360 * u.width() - d.width() / 2)
					}), c.val(i.color), i._changePanel(), FX.Utils.applyFunc(i, t.onChange, [i.color], !1)
				}
			})
		},
		_renderRight: function() {
			var t = this.options,
				i = this;
			e('<div class="picker-divider"/>').appendTo(this.element);
			var n = e('<div class="custom-color"><p class="title">' + i18next.t("custom.color") + "</p></div>").appendTo(this.element),
				a = e('<div class="picker-box"/>').appendTo(n),
				o = this._hsv2rgb(i.hue, 100, 100),
				r = e('<div class="picker-panel"><div class="gradient-right"><div class="gradient-top"></div></div></div>').appendTo(a).css({
					background: "rgb(" + o.r + " ," + o.g + " ," + o.b + ")",
					width: this.PANEL_WIDTH,
					height: this.PANEL_HEIGHT
				}),
				s = e('<div class="picker-cursor"/>').appendTo(r);
			s.css({
				left: this.sat / 100 * this.PANEL_WIDTH - s.outerWidth() / 2,
				top: (100 - this.val) / 100 * this.PANEL_HEIGHT - s.outerHeight() / 2
			});
			var l = e('<div class="picker-liner"/>').appendTo(a),
				d = e('<span class="color-slider"/>').appendTo(l);
			d.css({
				left: Math.round(i.hue / 360 * this.PANEL_WIDTH - d.width() / 2),
				top: 1
			}), this.$pickerInput = e('<input class="picker-input"/>').appendTo(a).val(t.color).on("change", function() {
				var n = e(this).val(),
					a = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
				if (n) if (4 === n.length && (n += n.substr(1, 3)), a.test(n)) {
					i.color = n.toUpperCase(), e(this).val(i.color);
					var o = i._hexToRGB(i.color),
						u = i._rgb2hsv(o.r, o.g, o.b);
					i.hue = u.h, i.sat = u.s, i.val = u.v, s.css({
						left: i.sat / 100 * r.width() - s.width() / 2,
						top: (100 - i.val) / 100 * r.height() - s.height() / 2
					}), d.css({
						left: Math.round(i.hue / 360 * l.width() - d.width() / 2)
					}), i._changePanel(), FX.Utils.applyFunc(i, t.onChange, [i.color], !1)
				} else e(this).val("")
			})
		},
		_cursorChange: function(t) {
			var i = e(".picker-panel", this.element),
				n = e(".picker-cursor", this.element),
				a = t.pageX - i.offset().left - n.outerWidth() / 2,
				o = t.pageY - i.offset().top - n.outerHeight() / 2;
			o = Math.max(-n.outerHeight() / 2, o), o = Math.min(i.height() - n.outerHeight() / 2, o), a = Math.max(-n.outerWidth() / 2, a), a = Math.min(i.width() - n.outerWidth() / 2, a), n.css({
				left: a,
				top: o
			}), this.sat = Math.round((t.pageX - i.offset().left) / i.width() * 100), this.val = 100 - Math.round((t.pageY - i.offset().top) / i.height() * 100), this._valueChange()
		},
		_sliderChange: function(t) {
			var i = e(".picker-liner", this.element),
				n = e(".color-slider", this.element),
				a = t.pageX - i.offset().left - n.width() / 2;
			a = Math.max(-n.width() / 2, a), a = Math.min(i.width() - n.width() / 2, a), n.css({
				left: a
			}), this.hue = Math.round((a + n.width() / 2) / i.width() * 360), this._valueChange(), this._changePanel()
		},
		_changePanel: function() {
			var t = this._hsv2rgb(this.hue, 100, 100);
			e(".picker-panel", this.element).css("background", "rgb(" + t.r + " ," + t.g + " ," + t.b + ")")
		},
		_isOnePointZero: function(e) {
			return "string" == typeof e && -1 !== e.indexOf(".") && 1 === parseFloat(e)
		},
		_isPercentage: function(e) {
			return "string" == typeof e && -1 !== e.indexOf("%")
		},
		_bound01: function(e, t) {
			this._isOnePointZero(e) && (e = "100%");
			var i = this._isPercentage(e);
			return e = Math.min(t, Math.max(0, parseFloat(e))), i && (e = parseInt(e * t, 10) / 100), Math.abs(e - t) < 1e-6 ? 1 : e % t / parseFloat(t)
		},
		_hsv2rgb: function(e, t, i) {
			e = 6 * this._bound01(e, 360), t = this._bound01(t, 100), i = this._bound01(i, 100);
			var n = Math.floor(e),
				a = e - n,
				o = i * (1 - t),
				r = i * (1 - a * t),
				s = i * (1 - (1 - a) * t),
				l = n % 6,
				d = [i, r, o, o, s, i][l],
				u = [s, i, i, r, o, o][l],
				c = [o, o, s, i, i, r][l];
			return {
				r: Math.round(255 * d),
				g: Math.round(255 * u),
				b: Math.round(255 * c)
			}
		},
		_rgb2hsv: function(e, t, i) {
			e = this._bound01(e, 255), t = this._bound01(t, 255), i = this._bound01(i, 255);
			var n, a, o = Math.max(e, t, i),
				r = Math.min(e, t, i),
				s = o,
				l = o - r;
			if (a = 0 === o ? 0 : l / o, o === r) n = 0;
			else {
				switch (o) {
				case e:
					n = (t - i) / l + (t < i ? 6 : 0);
					break;
				case t:
					n = (i - e) / l + 2;
					break;
				case i:
					n = (e - t) / l + 4
				}
				n /= 6
			}
			return {
				h: Math.round(360 * n),
				s: Math.round(100 * a),
				v: Math.round(100 * s)
			}
		},
		_hexToRGB: function(e) {
			return FX.Utils.hexToRgbJson(e)
		},
		_valueChange: function() {
			var e = this.options,
				t = this._hsv2rgb(this.hue, this.sat, this.val);
			this.color = "#" + ((1 << 24) + (t.r << 16) + (t.g << 8) + t.b).toString(16).slice(1), this.$pickerInput.val(this.color.toUpperCase()), FX.Utils.applyFunc(this, e.onChange, [this.color], !1)
		}
	}), e.shortcut("colorpicker", FX.ColorPicker)
}(jQuery), function(e) {
	FX.EntryFlow = FX.extend(FX.Widget, {
		_defaultConfig: function() {
			return e.extend(FX.EntryFlow.superclass._defaultConfig.apply(), {
				baseCls: "x-entry-flow",
				entryId: "",
				version: "",
				versions: [],
				flowVer: "",
				designVer: [],
				entryName: "",
				entryItems: [],
				editable: !1,
				configPane: null,
				async: null,
				items: [],
				nodeWidth: 160,
				nodeHeight: 40,
				nodeMargin: 20,
				onAffixClick: null,
				onNodeClick: null,
				onConnectorClick: null,
				onNodeSave: null,
				onSelectEmpty: null,
				onAfterLoad: null,
				onAfterRelease: null,
				onInitTitle: null,
				onVersionCtrlClick: null,
				onVersionItemClick: null,
				normalStroke: "#0DB3A6",
				conditionStroke: "#AC92EC",
				invisibleTip: i18next.t("flow.start.auth.empty")
			})
		},
		_init: function() {
			FX.EntryFlow.superclass._init.apply(this, arguments), this._initFlow()
		},
		_initFlow: function() {
			var e = this,
				t = this.options;
			this._loadFlowNodes(function() {
				e._createFlow(), FX.Utils.applyFunc(e, t.onAfterLoad, [], !1)
			})
		},
		_createFlow: function() {
			this._initFlowNodes(), this._createFlowChart()
		},
		_initFlowTitle: function() {
			var t = this.options,
				i = this;
			t.flowVer === t.version ? this.versionType = "current" : t.editable ? this.versionType = "design" : this.versionType = "history";
			var n = e('<div class="flow-version"/>');
			new FX.FlowSwitchPane({
				renderEl: n,
				currentVersion: t.version,
				versions: t.versions,
				versionType: this.versionType,
				flowVer: t.flowVer,
				designVer: t.designVer,
				onVersionCtrlClick: t.onVersionCtrlClick,
				onVersionItemClick: t.onVersionItemClick
			});
			var a = e('<div class="btn-pane"/>');
			FX.Utils.applyFunc(this, t.onInitTitle, [n, a], !1);
			var o = "green";
			if (t.flowVer !== t.version) {
				var r = new FX.Button({
					renderEl: e('<div class="release-btn"/>').appendTo(a),
					type: "button",
					text: i18next.t("flow.release"),
					style: "green",
					width: 80,
					height: 30,
					onClick: function() {
						FX.Msg.alert({
							title: i18next.t("flow.release.confirm"),
							msg: i18next.t("flow.release.tip"),
							type: "query",
							onOk: function() {
								r.setEnable(!1), i.saveFlow(!0, function() {
									FX.Utils.dt(FX.CONST.TRACKER.FLOW_ENABLE), r.setEnable(!0)
								})
							}
						})
					}
				});
				o = "white"
			}
			var s = new FX.Button({
				renderEl: e('<div class="flow-btn"/>').appendTo(a),
				type: "button",
				text: i18next.t("save"),
				style: o,
				width: 70,
				height: 30,
				onClick: function() {
					s.setEnable(!1), i.saveFlow(!1, function() {
						s.setEnable(!0)
					})
				}
			});
			e('<div class="flow-btn btn-desc"><i class="icon-description"></i></div>').appendTo(a).on("click", function() {
				i._editVersionDesc()
			}).hover(function() {
				FX.UI.showPopover({
					position: "bottomLeft",
					anchor: e(this),
					maxWidth: 86,
					type: "dark",
					content: e("<span>" + i18next.t("flow.version.desc.edit") + "</span>")
				})
			}, function() {
				FX.UI.closePopover()
			})
		},
		_editVersionDesc: function() {
			var e = this.options,
				t = {};
			FX.Utils.forEach(e.versions, function(i, n) {
				if (n.ver === e.version) return t = n, !1
			}), FX.Utils.isObjectEmpty(t) || new FX.ConfirmDialog({
				title: i18next.t("flow.version.desc"),
				width: 560,
				text4Ok: i18next.t("save"),
				contentWidget: {
					hgap: 0,
					vgap: 30,
					rowSize: [20, 30, 190],
					colSize: [20, 80, 400],
					items: [
						[],
						[{}, {
							type: "label",
							text: i18next.t("flow.version.label")
						}, {
							type: "label",
							text: i18next.t("flow.version.name", {
								name: t.ver
							})
						}],
						[{}, {
							type: "label",
							text: i18next.t("flow.version.desc.label")
						}, {
							type: "textarea",
							widgetName: "versionDesc",
							value: t.desc
						}]
					]
				},
				onOk: function() {
					var i = this.getWidgetByName("versionDesc").getValue();
					return FX.Utils.ajax({
						url: FX.Utils.getApi(FX._API.form.workflow.config_version, FX.STATIC.APPID, e.entryId),
						data: {
							version: t.ver,
							attrs: {
								desc: i
							}
						}
					}, function() {
						t.desc = i, FX.Msg.toast({
							type: "success",
							msg: i18next.t("saveInfo.success")
						})
					}), !1
				}
			}).show()
		},
		_loadFlowNodes: function(e) {
			var t = this.options;
			t.async && t.async.url && FX.Utils.ajax({
				url: t.async.url,
				data: {
					version: t.version
				}
			}, function(i) {
				t.items = i.flows, t.editable = i.editable, e && e()
			})
		},
		_initFlowNodes: function() {
			var t = this,
				i = this.options;
			this._initFlowTitle(), this.flowMap = {}, this.lastFlowId = 0, this.orphanFlows = [], this.createdMap = {}, i.items.length <= 0 && (i.items = [{
				flowId: FX.CONST.WORKFLOW.START_FLOW_ID,
				name: i18next.t("flow.node.start"),
				parents: []
			}, {
				flowId: FX.CONST.WORKFLOW.END_FLOW_ID,
				name: i18next.t("flow.node.end"),
				parents: []
			}]), FX.Utils.forEach(i.items, function(i, n) {
				var a = n.flowId,
					o = n.parents[0];
				a === FX.CONST.WORKFLOW.START_FLOW_ID ? n.name || (n.name = i18next.t("flow.node.start")) : a === FX.CONST.WORKFLOW.END_FLOW_ID && (n.name = i18next.t("flow.node.end")), t.lastFlowId < parseInt(a) && (t.lastFlowId = parseInt(a)), t.flowMap[a] = e.extend(t.flowMap[a], n), FX.Utils.isNull(o) || o === a || a === FX.CONST.WORKFLOW.END_FLOW_ID ? t.orphanFlows.push(a) : (t.flowMap[o] = t.flowMap[o] || {}, t.flowMap[o].children || (t.flowMap[o].children = []), t.flowMap[o].children.push(a))
			}), this.flowLevel = 0, this._setNodeAreaWidth(t.flowMap[0]), this.chartOffsetX = 0, this.chartWidth = i.width, t.flowMap[0].areaWidth < i.width ? (this.chartOffsetX = (i.width - t.flowMap[0].areaWidth) / 2, this.chartWidth -= 2) : this.chartWidth = t.flowMap[0].areaWidth, this._dealNodeAttr(t.flowMap[0], this.chartOffsetX, 0), FX.Utils.forEach(t.flowMap, function(e, i) {
				t.createdMap[e] || (FX.Utils.isNull(i.flowId) ? FX.Utils.forEach(i.children, function(e, i) {
					var n = t.flowMap[i].parents;
					n.splice(n.indexOf(i), 1)
				}) : t.orphanFlows.indexOf(e) < 0 && (t.orphanFlows.push(e), i.children = []))
			}), this._dealOrphanNodes()
		},
		_createFlowChart: function() {
			var t = this.options,
				i = this;
			this.flowChart = new FX.FlowChart({
				renderEl: e("<div/>").appendTo(this.element),
				nodes: this.flowMap,
				paths: this._getFlowConnector(),
				editable: t.editable,
				nodeWidth: t.nodeWidth,
				nodeHeight: t.nodeHeight,
				versionType: this.versionType,
				hasAffix: !0,
				onAffixClick: t.onAffixClick,
				onNodeInvalid: function(t, n) {
					var a = i.invalidMsgMap[t];
					a && a.length && new FX.Tooltip({
						renderEl: n,
						style: "error",
						content: e("<div><pre>" + a.join("\n") + '</pre><a href="' + FX.CONFIG.HOST.HELP_DOC_HOST + '/10949" target="fx_help_doc">' + i18next.t("view.helpCenter") + "</a></div>")
					})
				},
				onNodeClick: function(e, t) {
					var n = e.id,
						a = e.node;
					"menu" === e.type && i._createFlowNodeSetMenu(i.flowMap[n], a.getMenu(), t), i._selectNode(a)
				},
				onPathClick: function(e, n, a) {
					var o = i.flowMap[e],
						r = i.flowMap[n];
					i.createFlowConditionPane(o, r, a), FX.Utils.applyFunc(i, t.onConnectorClick, [], !1)
				},
				onNodeCreate: function(e, t, n) {
					var a = "",
						o = "";
					switch (e) {
					case FX.CONST.WORKFLOW.FLOWTYPE.CC:
						a = FX.CONST.WORKFLOW.FLOWTYPE.CC, o = i18next.t("flow.node.cc");
						break;
					default:
						a = FX.CONST.WORKFLOW.FLOWTYPE.NORMAL, o = i18next.t("flow.node")
					}
					var r = i.newFlowNode({
						type: a,
						name: o,
						parents: [],
						x: t.x / n,
						y: t.y / n
					});
					i.refreshFlowChart(r.flowId), i.undoRedo.done("nodeCreate", {
						flowId: r.flowId
					}), FX.Utils.dt(FX.CONST.TRACKER.FLOW_NODE_ADD)
				},
				onRemove: function(e, t) {
					if ("node" === e) {
						var n = [],
							a = {};
						FX.Utils.forEach(t, function(e, t) {
							t !== FX.CONST.WORKFLOW.START_FLOW_ID ? t !== FX.CONST.WORKFLOW.END_FLOW_ID ? (n.push(t), a[t] = i.removeFlowNode({
								flowId: t
							})) : FX.Msg.toast({
								type: "warning",
								msg: i18next.t("flow.node.end.del")
							}) : FX.Msg.toast({
								type: "warning",
								msg: i18next.t("flow.node.start.del")
							})
						}), i.undoRedo.done("nodeRemove", {
							ids: n,
							childMap: a
						})
					} else if ("path" === e) {
						var o = {
							remove: t
						};
						i.updateFlowConnection(o), i.undoRedo.done("pathChange", o)
					}
					i.refreshFlowChart()
				},
				onNodeMove: function(e, t) {
					var n = [];
					FX.Utils.forEach(e, function(e, t) {
						n.push(t.getId())
					}), i.undoRedo.done("nodeMove", {
						range: n,
						move: t
					})
				},
				onMove: function(e) {
					FX.Utils.forEach(e, function(e, t) {
						i._addUpdateFlow({
							flowId: parseInt(e),
							x: t.x,
							y: t.y
						})
					})
				},
				onEquidistant: function(e) {
					var t = [];
					FX.Utils.forEach(e, function(e, n) {
						var a = n.node,
							o = a.getOffset();
						i._addUpdateFlow({
							flowId: parseInt(a.getId()),
							x: o.x,
							y: o.y
						}), t.push({
							node: a.getId(),
							move: n.move
						})
					}), i.undoRedo.done("equidistant", {
						nodes: t
					})
				},
				onSelect: function(e) {
					FX.Utils.isObjectEmpty(e) || e.length > 1 ? i._selectEmpty() : i._selectNode(e[0])
				},
				onConnect: function(e, t) {
					if (e.source && (e.source = parseInt(e.source)), e.target && (e.target = parseInt(e.target)), e.source !== t.source || e.target !== t.target || e.sp !== t.sp || e.tp !== t.tp) {
						var n = {};
						FX.Utils.isEmpty(e.source) || FX.Utils.isEmpty(e.target) || (n.remove = {
							source: e.source,
							target: e.target,
							sp: e.sp,
							tp: e.tp
						}), FX.Utils.isEmpty(t.source) || FX.Utils.isEmpty(t.target) || (n.add = {
							source: t.source,
							target: t.target,
							sp: t.sp,
							tp: t.tp
						}), i.updateFlowConnection(n), i.refreshFlowChart(), i.undoRedo.done("pathChange", n), FX.Utils.dt(FX.CONST.TRACKER.FLOW_PATH_ADD)
					}
				},
				onUndoRedo: function(e) {
					switch (e) {
					case "undo":
						i.undoRedo.undo();
						break;
					case "redo":
						i.undoRedo.redo()
					}
				}
			}), this._initUndoRedo()
		},
		_initUndoRedo: function() {
			var e = this;
			this.undoRedo = new FX.FlowUndoRedo({
				instance: this,
				onDone: function() {
					e.flowChart.setMenuEnable({
						action: "undo",
						enable: !0
					}), e.flowChart.setMenuEnable({
						action: "redo",
						enable: !1
					})
				},
				onUndo: function(t) {
					e.flowChart.setMenuEnable({
						action: "redo",
						enable: !0
					}), e.flowChart.setMenuEnable({
						action: "undo",
						enable: t
					})
				},
				onRedo: function(t) {
					e.flowChart.setMenuEnable({
						action: "undo",
						enable: !0
					}), e.flowChart.setMenuEnable({
						action: "redo",
						enable: t
					})
				}
			})
		},
		clearUndoRedo: function() {
			this.undoRedo.clear(), this.flowChart.setMenuEnable({
				action: "undo",
				enable: !1
			}), this.flowChart.setMenuEnable({
				action: "redo",
				enable: !1
			})
		},
		refreshFlowChart: function(e) {
			this._initFlowNodes(), this.flowChart.refresh({
				nodes: this.flowMap,
				paths: this._getFlowConnector(),
				selectNode: e
			})
		},
		selectNode: function(e) {
			this.flowChart.selectNode(e)
		},
		_setNodeAreaWidth: function(e) {
			var t = this,
				i = this.options,
				n = 0;
			FX.Utils.forEach(e.children, function(e, i) {
				var a = t.flowMap[i];
				t._setNodeAreaWidth(a), n += a.areaWidth
			}), n || (n = i.nodeWidth + 2 * i.nodeMargin), e.areaWidth = n
		},
		_dealNodeAttr: function(e, t, i) {
			var n = this,
				a = this.options;
			if (!this.createdMap[e.flowId]) {
				this.createdMap[e.flowId] = !0, FX.Utils.isNumber(e.x) || (a.items.length <= 2 ? e.flowId !== FX.CONST.WORKFLOW.START_FLOW_ID && e.flowId !== FX.CONST.WORKFLOW.END_FLOW_ID || (e.x = this.element.width() / 2 - a.nodeWidth / 2) : e.x = t + e.areaWidth / 2 - a.nodeWidth / 2, this._addUpdateFlow({
					flowId: e.flowId,
					x: e.x
				})), FX.Utils.isNumber(e.y) || (a.items.length <= 2 ? e.flowId === FX.CONST.WORKFLOW.START_FLOW_ID ? e.y = 50 : e.flowId === FX.CONST.WORKFLOW.END_FLOW_ID && (e.y = 350) : e.y = i * (2 * a.nodeMargin + a.nodeHeight) + a.nodeMargin, this._addUpdateFlow({
					flowId: e.flowId,
					y: e.y
				})), this.flowLevel = Math.max(this.flowLevel, i), a.editable && e.flowId !== FX.CONST.WORKFLOW.END_FLOW_ID ? e.editable = !0 : e.editable = !1, this.invalidFlowMap && this.invalidFlowMap[e.flowId] ? e.invalid = !0 : e.invalid = !1, e.flowId === FX.CONST.WORKFLOW.START_FLOW_ID ? (e.icon = "icon-flow-start green", e.source = !1, n._checkFieldVisible(e) || (e.tip = a.invisibleTip)) : e.flowId === FX.CONST.WORKFLOW.END_FLOW_ID ? (e.icon = "icon-flow-end red", e.target = !1) : e.type === FX.CONST.WORKFLOW.FLOWTYPE.CC ? (e.target = !1, e.icon = "icon-release blue", a.editable && (e.menu = "icon-flow-other")) : FX.Utils.isFlowScheduleEnable(e.schedule) ? (e.icon = "icon-widget-time orange", e.tooltip = i18next.t("flow.schedule.node.tooltip"), a.editable && (e.menu = "icon-flow-other")) : (e.icon = "icon-flow-node green", a.editable && (e.menu = "icon-flow-other"));
				var o = 0;
				FX.Utils.forEach(e.children, function(e, a) {
					var r = n.flowMap[a];
					n._dealNodeAttr(r, t + o, i + 1), o += r.areaWidth
				})
			}
		},
		_dealOrphanNodes: function() {
			for (var e = this, t = this.options, i = t.nodeWidth + 2 * t.nodeMargin, n = Math.floor(this.flowMap[0].areaWidth / i), a = 0, o = this.orphanFlows.length; a < o; a += n) {
				var r = this.orphanFlows.slice(a, a + n),
					s = this.chartOffsetX;
				r.length && this.flowLevel++, FX.Utils.forEach(r, function(t, i) {
					var n = e.flowMap[i];
					e._setNodeAreaWidth(n), e._dealNodeAttr(n, s, e.flowLevel), s += n.areaWidth
				})
			}
		},
		_getFlowConnector: function() {
			var e = this,
				t = this.options,
				i = [];
			return FX.Utils.forEach(this.flowMap, function(n, a) {
				if (a && !FX.Utils.isNull(a.flowId)) {
					var o = a.lines || {},
						r = a.condition || {};
					FX.Utils.forEach(a.parents, function(a, s) {
						var l = e.flowMap[s];
						if (l && !FX.Utils.isNull(l.flowId)) {
							var d, u = o[s] || {};
							e._isFlowConditionValid(r[s]) && (d = t.conditionStroke), i.push({
								source: {
									id: l.flowId,
									port: u.sp
								},
								target: {
									id: parseInt(n),
									port: u.tp
								},
								stroke: d
							})
						}
					})
				}
			}), i
		},
		_createFlowNodeSetMenu: function(t, i, n) {
			var a = this;
			if (this.options.editable) {
				var o = e('<div class="flow-menu-pane"><ul class="menu-pane"><li class="menu-item" role="copy">' + i18next.t("flow.node.copy") + '</li><li class="menu-item remove" role="delete">' + i18next.t("flow.node.del") + "</li></ul></div>"),
					r = FX.Msg.bubble({
						anchor: i,
						contentHTML: o,
						text4Cancel: null,
						text4Ok: null,
						minWidth: 100,
						hAdjust: 40,
						contentPadding: 0,
						edge: 100,
						zoom: n
					});
				o.bind("click", function(i) {
					var n = e(i.target).closest(".menu-item").attr("role");
					if (n) switch (r.close(), n) {
					case "delete":
						var o = {};
						o[t.flowId] = a.removeFlowNode(t), a.undoRedo.done("nodeRemove", {
							ids: [t.flowId],
							childMap: o
						}), a.refreshFlowChart();
						break;
					case "copy":
						var s = a._copyFlowNode(t);
						a.undoRedo.done("nodeCreate", {
							flowId: s.flowId
						}), a.refreshFlowChart(s.flowId)
					}
				})
			}
		},
		_createFlowNodeConfigPane: function(e, t) {
			var i = this,
				n = this.options,
				a = n.configPane,
				o = {};
			this._doFlowPath(o, [e.flowId]), e.path = this._getFlowPath(o, e);
			new FX.FlowConfigPane({
				renderEl: a.children(".config-content").empty(),
				flow: e,
				entryId: n.entryId,
				entryName: n.entryName,
				entryItems: n.entryItems,
				flowMap: this.flowMap,
				onRedirect: function(e) {
					i.saveFlow(!1, function() {
						FX.Utils.redirectTo(e)
					})
				},
				onAfterEdit: function(e, a) {
					e.flowId === FX.CONST.WORKFLOW.START_FLOW_ID && e.optAuth && t && t({
						tip: i._checkFieldVisible(e) ? "" : n.invisibleTip
					}), i._addUpdateFlow(e), a && t && t({
						name: e.name
					}), e.schedule && t && t({
						schedule: e.schedule
					})
				}
			})
		},
		_checkFieldVisible: function(e) {
			var t = !1;
			return FX.Utils.forEach(e.optAuth, function(e, i) {
				if (FX.Utils.isFieldAuthVisible(i)) return t = !0, !1
			}), t
		},
		_selectEmpty: function() {
			var e = this.options;
			FX.Utils.applyFunc(this, e.onSelectEmpty, [], !1)
		},
		_selectNode: function(e) {
			if (e) {
				var t = this.options,
					i = e.getId();
				this._createFlowNodeConfigPane(this.flowMap[i], function(t) {
					FX.Utils.isNull(t.name) || e.setName(t.name), FX.Utils.isNull(t.tip) || e.setTip(t.tip), FX.Utils.isNull(t.schedule) || (FX.Utils.isObjectEmpty(t.schedule) ? e.setIcon("icon-flow-node green", "") : e.setIcon("icon-widget-time orange", i18next.t("flow.schedule.node.tooltip")))
				}), FX.Utils.applyFunc(this, t.onNodeClick, [], !1)
			}
		},
		createFlowConditionPane: function(t, i, n) {
			var a = this,
				o = this.options,
				r = o.configPane,
				s = i.condition ? i.condition[t.flowId] : {},
				l = {
					custom: i18next.t("flow.cond.custom.tip"),
					else: i18next.t("flow.cond.else.tip")
				},
				d = s && s.isElse,
				u = new FX.ConfigPane({
					renderEl: r.children(".config-content").empty(),
					items: [{
						label: i18next.t("flow.cond"),
						widget: {
							type: "combo",
							allowBlank: !1,
							searchable: !1,
							items: [{
								text: i18next.t("flow.cond.custom"),
								value: "custom"
							}, {
								text: i18next.t("flow.cond.else"),
								value: "else"
							}],
							value: d ? "else" : "custom",
							width: "100%",
							onStopEdit: function() {
								var r = this.getValue(),
									s = {},
									d = u.getWidgetByName("conditionPane"),
									c = d.getValue();
								c && c[o.entryId] && (s = c[o.entryId]), "custom" === r ? (u.getWidgetByName("conditionTip").setValue(l.custom), d.setVisible(!0)) : (d.setVisible(!1), u.getWidgetByName("conditionTip").setValue(l.
								else), e.extend(s, {
									isElse: !0
								})), a._updateFlowCondition(t, i, s, n)
							}
						}
					}, {
						widget: {
							type: "label",
							customCls: "submit-rules-tip",
							widgetName: "conditionTip",
							value: d ? l.
							else : l.custom
						},
						splitLine: !0
					}, {
						widget: {
							widgetName: "conditionPane",
							type: "filterpane",
							customCls: "filter-pane",
							supportCurrentUser: !1,
							supportCurrentDept: !1,
							fields: FX.Utils.pretreatFormFilterCond(s && s.cond),
							rel: s && s.rel,
							text4add: i18next.t("flow.cond.add"),
							forms: [o.entryId],
							visible: !d,
							onStopEdit: function() {
								var e = FX.Utils.dealFormFilterCond(this.getValue()),
									o = null;
								a._isFlowConditionValid(e) && (o = e), a._updateFlowCondition(t, i, o, n)
							}
						}
					}]
				})
		},
		_isFlowConditionValid: function(e) {
			return !FX.Utils.isObjectEmpty(e) && (!FX.Utils.isObjectEmpty(e.cond) || e.isElse)
		},
		_copyFlowNode: function(e) {
			var t = this.options;
			return this.newFlowNode({
				name: e.name,
				chargers: e.chargers,
				allowSave: e.allowSave,
				allowBack: e.allowBack,
				allowClose: e.allowClose,
				validator: e.validator,
				approval: e.approval,
				comment: e.comment,
				optAuth: e.optAuth,
				parents: [],
				type: e.type,
				x: e.x + t.nodeWidth + t.nodeMargin,
				y: e.y
			})
		},
		newFlowNode: function(t, i) {
			var n = this,
				a = this.options;
			return t = e.extend(this._getDefaultFlowNode(), t), this.removeFlow && this.removeFlow[t.flowId] ? t = this.removeFlow[t.flowId] : (this.lastFlowId++, t.flowId = this.lastFlowId), a.items.push(t), n._addUpdateFlow(t), FX.Utils.forEach(i, function(e, i) {
				var a = (n.flowMap[i] || n.removeFlow[i]).parents || [];
				a.push(t.flowId), n._addUpdateFlow({
					flowId: i,
					parents: a
				})
			}), t
		},
		_getDefaultFlowNode: function() {
			return {
				allowSave: !0,
				allowClose: !1
			}
		},
		resetState: function() {
			this.updateFlow = {}, this.removeFlow = []
		},
		compareFlow: function() {
			return FX.Utils.isObjectEmpty(this.updateFlow) && FX.Utils.isObjectEmpty(this.removeFlow)
		},
		_doFlowPath: function(e, t) {
			var i = this;
			FX.Utils.forEach(t, function(t, n) {
				if (!e[n]) {
					e[n] = !0;
					var a = i.flowMap[n];
					a && i._doFlowPath(e, a.parents)
				}
			})
		},
		_getFlowPath: function(e, t) {
			var i = [];
			return FX.Utils.forEach(e, function(e) {
				(e = parseInt(e, 10)) !== t.flowId && i.push(e)
			}), i
		},
		releaseFlow: function(e) {
			var t = this;
			this.options.version = e, this._loadFlowNodes(function() {
				t.saveFlow(!0, null)
			})
		},
		saveFlow: function(e, t) {
			var i = this,
				n = this.options,
				a = e || "current" === this.versionType,
				o = null,
				r = {},
				s = -1,
				l = {},
				d = {};
			if (FX.Utils.forEach(n.items, function(t, n) {
				if (e && FX.Utils.isObjectEmpty(n.parents) && n.flowId !== FX.CONST.WORKFLOW.END_FLOW_ID && n.flowId !== FX.CONST.WORKFLOW.START_FLOW_ID) return o = n.flowId, !1;
				var u = {},
					c = {};
				if (FX.Utils.forEach(n.parents, function(e, t) {
					n.type === FX.CONST.WORKFLOW.FLOWTYPE.NORMAL && (r[t] = !0), n.lines && (c[t] = n.lines[t]), n.condition && (u[t] = n.condition[t])
				}), n.condition = u, n.lines = c, n.flowId === FX.CONST.WORKFLOW.END_FLOW_ID ? s = t : n.type !== FX.CONST.WORKFLOW.FLOWTYPE.NORMAL || r[n.flowId] || (r[n.flowId] = !1), n.backRule === FX.CONST.WORKFLOW.BACKRULE.RANGE_NODE && FX.Utils.isObjectEmpty(n.backNodes) && (n.backRule = FX.CONST.WORKFLOW.BACKRULE.DISALLOW), n.optAuth || (n.optAuth = {}), FX.Utils.forEach(n.condition, function(e, t) {
					t && t.isElse && (n.condition[e] = {
						isElse: !0
					})
				}), a && n.flowId !== FX.CONST.WORKFLOW.END_FLOW_ID) {
					var f = [];
					n.flowId !== FX.CONST.WORKFLOW.START_FLOW_ID && (n.type === FX.CONST.WORKFLOW.FLOWTYPE.NORMAL && FX.Utils.isMembersEmpty(n.chargers) && f.push(i18next.t("flow.node.charger.empty")), n.type === FX.CONST.WORKFLOW.FLOWTYPE.CC && FX.Utils.isMembersEmpty(n.ccUsers) && f.push(i18next.t("flow.node.cc.empty"))), i._checkFieldVisible(n) || f.push(i18next.t("flow.node.auth.empty")), n.signature && n.signature.enable && !FX.Vip.hasSignature() && f.push(i18next.t("flow.node.signature.disable")), f.length && (l[n.flowId] = !0, d[n.flowId] = f)
				}
			}), o) return FX.Msg.toast({
				type: "warning",
				msg: i18next.t("flow.node.isolated")
			}), this.invalidFlowMap = {}, this.invalidFlowMap[o] = !0, this.invalidMsgMap = {}, this.refreshFlowChart(), void(t && t());
			if (this.invalidFlowMap = l, this.invalidMsgMap = d, !FX.Utils.isObjectEmpty(l)) return FX.Msg.toast({
				type: "warning",
				msg: i18next.t("flow.node.empty")
			}), this.refreshFlowChart(), void(t && t());
			if (e && s > -1) {
				var u = [];
				FX.Utils.forEach(r, function(e, t) {
					!1 === t && u.push(parseInt(e))
				}), FX.Utils.isObjectEmpty(u) || (n.items[s].parents = n.items[s].parents.concat(u))
			}
			this.clearUndoRedo(), this.refreshFlowChart(), FX.Utils.ajax({
				url: FX.Utils.getApi(FX._API.form.workflow.update, FX.STATIC.APPID, n.entryId),
				data: {
					flows: n.items,
					version: n.version,
					inuse: e
				}
			}, function(a) {
				i.updateFlow = {}, i.removeFlow = [], n.items = a.flows, n.editable = a.editable, e && (i._changeVersion(n.version, n.version, l), i._createFlow(), FX.Utils.applyFunc(i, n.onAfterRelease, [n.version], !1)), FX.Msg.toast({
					type: "success",
					msg: i18next.t("flow.save.success")
				}), t && t(!0)
			}, function() {
				FX.Msg.toast({
					type: "error",
					msg: i18next.t("flow.save.fail")
				}), t && t(!1)
			})
		},
		removeFlowNode: function(e) {
			var t = this.options,
				i = -1,
				n = [];
			return FX.Utils.forEach(t.items, function(t, a) {
				if (a.flowId === e.flowId) i = t;
				else {
					var o = [];
					FX.Utils.forEach(a.parents, function(t, i) {
						i !== e.flowId && o.push(i)
					}), a.parents && o.length !== a.parents.length && (n.push(a.flowId), a.parents = o)
				}
			}), i > -1 && (this._addRemoveFlow(t.items[i]), t.items.splice(i, 1), FX.Utils.applyFunc(this, t.onSelectEmpty, [], !1)), n
		},
		updateFlowConnection: function(e) {
			var t, i, n = this;
			if (e.remove) {
				a = (i = n.flowMap[e.remove.target]).parents.indexOf(e.remove.source);
				i.lines = i.lines || {}, i.lines[i.source] = void 0, a > -1 && (i.parents.splice(a, 1), this._addUpdateFlow({
					flowId: i.flowId,
					parents: i.parents,
					lines: i.lines
				}), this._selectEmpty())
			}
			if (e.add) {
				var a = (t = n.flowMap[e.add.target]).parents.indexOf(e.add.source);
				t.lines = t.lines || {}, t.lines[e.add.source] = {
					sp: e.add.sp,
					tp: e.add.tp
				}, a < 0 ? (t.parents.push(e.add.source), t.condition = t.condition || {}, this._addUpdateFlow({
					flowId: t.flowId,
					condition: t.condition,
					parents: t.parents,
					lines: t.lines
				})) : this._addUpdateFlow({
					flowId: t.flowId,
					lines: t.lines
				}), i && i.connection && i.condition[e.remove.source] && (t.condition[e.add.source] = i.condition[e.remove.source], i.condition[e.remove.source] = void 0, this._addUpdateFlow({
					flowId: i.flowId,
					condition: i.condition
				}), this._selectEmpty())
			}
		},
		_updateFlowCondition: function(e, t, i, n) {
			var a = this.options;
			t.condition = t.condition || {}, t.condition[e.flowId] = i, this._isFlowConditionValid(i) ? (n.refresh({
				stroke: a.conditionStroke
			}), n.activePath(!0)) : (n.refresh({
				stroke: a.normalStroke
			}), n.activePath(!0)), this._addUpdateFlow(t)
		},
		_addUpdateFlow: function(t) {
			var i = this.options;
			this.updateFlow || (this.updateFlow = {}), t.children && (t.children = void 0), FX.Utils.forEach(i.items, function(i, n) {
				if (n.flowId === t.flowId) return n = e.extend(n, t), !1
			}), this.updateFlow[t.flowId] = e.extend(t, {
				appId: FX.STATIC.APPID,
				entryId: i.entryId
			})
		},
		_addRemoveFlow: function(e) {
			this.removeFlow || (this.removeFlow = {}), this.removeFlow[e.flowId] = e
		},
		_changeVersion: function(e, t, i) {
			if (e) {
				var n = this.options;
				n.version = e, n.flowVer = t, this.invalidFlowMap = i || {}, this.element.empty()
			}
		},
		getVersionType: function() {
			return this.versionType
		},
		changeVersionAndInitFlow: function(e, t, i) {
			this._changeVersion(e, t, i), this._initFlow()
		},
		doResize: function() {
			this.flowChart && this.flowChart.doResize()
		}
	})
}(jQuery);