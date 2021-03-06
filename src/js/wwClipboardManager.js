/**
 * @fileoverview Implements wysiwyg editor clipboard manager
 * @author Sungho Kim(sungho-kim@nhnent.com) FE Development Team/NHN Ent.
 */

'use strict';

var domUtils = require('./domUtils');
var WwPasteContentHelper = require('./wwPasteContentHelper');
var util = tui.util;

var isMSBrowser = util.browser.msie || /Edge\//.test(navigator.userAgent);


/**
 * WwClipboardManager
 * @exports WwClipboardManager
 * @constructor
 * @class
 * @param {WysiwygEditor} wwe WysiwygEditor instance
 */
function WwClipboardManager(wwe) {
    this.wwe = wwe;

    this._pch = new WwPasteContentHelper(this.wwe);
}

/**
 * init
 * initialize
 */
WwClipboardManager.prototype.init = function() {
    this._initSquireEvent();
};

/**
 * _initSquireEvent
 * initialize squire events
 */
WwClipboardManager.prototype._initSquireEvent = function() {
    var self = this;

    if (isMSBrowser) {
        this.wwe.getEditor().addEventListener('keydown', function(event) {
            //Ctrl+ C
            if (event.ctrlKey && event.keyCode === 67) {
                self._saveLastestClipboardRangeInfo();
            //Ctrl + X
            } else if (event.ctrlKey && event.keyCode === 88) {
                self._saveLastestClipboardRangeInfo();
                self.wwe.postProcessForChange();
            }
        });
    } else {
        this.wwe.getEditor().addEventListener('copy', function() {
            self._saveLastestClipboardRangeInfo();
        });
        this.wwe.getEditor().addEventListener('cut', function() {
            self._saveLastestClipboardRangeInfo();
            self.wwe.postProcessForChange();
        });
    }

    this.wwe.getEditor().addEventListener('willPaste', function(pasteData) {
        if (self._lastestClipboardRangeInfo
            && self._lastestClipboardRangeInfo.contents.textContent === pasteData.fragment.textContent) {
            pasteData.rangeInfo = self._lastestClipboardRangeInfo;
        }

        self._pch.preparePaste(pasteData);
        self._refineCursorWithPasteContents(pasteData.fragment);
        self.wwe.postProcessForChange();
    });
};

WwClipboardManager.prototype._refineCursorWithPasteContents = function(fragment) {
    var self = this;
    var node = fragment;
    var range = self.wwe.getEditor().getSelection().cloneRange();

    while (node.lastChild) {
        node = node.lastChild;
    }

    setTimeout(function() {
        range.setStartAfter(node);
        range.collapse(true);
        self.wwe.getEditor().setSelection(range);
    }, 0);
};

WwClipboardManager.prototype._isCopyFromEditor = function(pasteData) {
    var lastestClipboardContents;

    if (!this._lastestClipboardRangeInfo) {
        return false;
    }

    lastestClipboardContents = this._lastestClipboardRangeInfo.contents.textContent;

    return lastestClipboardContents.replace(/\s/g, '') === pasteData.fragment.textContent.replace(/\s/g, '');
};

WwClipboardManager.prototype._saveLastestClipboardRangeInfo = function() {
    var commonAncestorName;
    var range = this.wwe.getEditor().getSelection().cloneRange();

    if (range.commonAncestorContainer === this.wwe.get$Body()[0]) {
        commonAncestorName = 'BODY';
    } else {
        commonAncestorName = range.commonAncestorContainer.tagName;
    }

    this._latestClipboardRangeInfo = {
        contents: range.cloneContents(),
        commonAncestorName: commonAncestorName
    };
};

/**
 * _extendRange
 * extend range if need
 * @param {Range} range to extend
 * @returns {Range} range
 */
WwClipboardManager.prototype._extendRange = function(range) {
    //텍스트 노드이면서 모두 선택된게 아니면 레인지를 확장할 필요가 없다.
    if (domUtils.isTextNode(range.commonAncestorContainer)
        && (range.startOffset !== 0 || range.commonAncestorContainer.textContent.length !== range.endOffset)
    ) {
        return range;
    }

    if (range.startOffset === 0) {
        range = this._extendStartRange(range);
    }

    if (range.endOffset === domUtils.getOffsetLength(range.endContainer)) {
        range = this._extendEndRange(range);
    }

    //commonAncestor의 모든 컨텐츠가 선택된경우 commonAncestor로 셀렉션 변경
    if (this._isWholeCommonAncestorContainerSelected(range)) {
        range.selectNode(range.commonAncestorContainer);
    }

    return range;
};

WwClipboardManager.prototype._extendStartRange = function(range) {
    var newBound = range.startContainer;

    //레인지 확장
    while (newBound.parentNode !== range.commonAncestorContainer
            && newBound.parentNode !== this.wwe.get$Body()[0]
            && !newBound.previousSibling
          ) {
        newBound = newBound.parentNode;
    }

    //range단위를 한단계 확장 deleteContents는 start, end에 걸린 컨테이너 자체는 안지운다.
    range.setStart(newBound.parentNode, domUtils.getNodeOffsetOfParent(newBound));

    return range;
};

WwClipboardManager.prototype._extendEndRange = function(range) {
    var newBound = range.endContainer;
    var boundNext = newBound.nextSibling;

    //레인지 확장
    while (newBound.parentNode !== range.commonAncestorContainer
            && newBound.parentNode !== this.wwe.get$Body()[0]
            && (!boundNext || (domUtils.getNodeName(boundNext) === 'BR' && newBound.parentNode.lastChild === boundNext))
          ) {
        newBound = newBound.parentNode;
        boundNext = newBound.nextSibling;
    }

    //range단위를 부모래밸로 한단계 확장 deleteContents는 start, end에 걸린 컨테이너 자체는 안지운다.
    range.setEnd(newBound.parentNode, domUtils.getNodeOffsetOfParent(newBound) + 1);

    return range;
};

/**
 * _isWholeCommonAncestorContainerSelected
 * check if selection has whole commonAncestorContainter
 * 선택된 영역이 commonAncestorContainer의 모든 컨텐츠인치 체크
 * @param {Range} range range of selection
 * @returns {boolean} result
 */
WwClipboardManager.prototype._isWholeCommonAncestorContainerSelected = function(range) {
    return range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        && range.commonAncestorContainer !== this.wwe.get$Body()[0]
        && range.startOffset === 0
        && range.endOffset === range.commonAncestorContainer.childNodes.length
        && range.commonAncestorContainer === range.startContainer
        && range.commonAncestorContainer === range.endContainer;
};

module.exports = WwClipboardManager;
