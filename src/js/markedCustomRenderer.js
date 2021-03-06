/**
 * @fileoverview Implements markedCustomRenderer
 * @author Sungho Kim(sungho-kim@nhnent.com) FE Development Team/NHN Ent
 */

'use strict';

/**
 * markedCustomRenderer
 * @exports markedCustomRenderer
 * @augments marked.Renderer
 */
var markedCustomRenderer = new window.marked.Renderer();

var regexTaskList = /^((?:<p>|))(\[(?:x| )\]) /i;

markedCustomRenderer.listitem = function(text) {
    var cap,
        checked,
        className = '',
        output = '';

    cap = regexTaskList.exec(text);

    if (cap) {
        text = text.substring(cap[0].length);
        className = ' class="task-list-item"';
        checked = cap[2].toLowerCase() === '[x]' ? ' checked' : '';
        output += cap[1] + '<input type="checkbox" class="task-list-item-checkbox"' + checked + '> ';
    }

    return '<li' + className + '>' + output + text + '</li>\n';
};

markedCustomRenderer.code = function(code, lang, escaped) {
    var out;
    if (this.options.highlight) {
        out = this.options.highlight(code, lang);
        if (out !== null && out !== code) {
            escaped = true;
            code = out;
        }
    }

    if (!lang) {
        return '<pre><code>'
        + (escaped ? code : escape(code, true))
        + '\n</code></pre>';
    }

    return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '" data-language="' + escape(lang, true) + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};


//escape code from marekd
function escape(html, encode) {
    return html
        .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

module.exports = markedCustomRenderer;
