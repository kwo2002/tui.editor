'use strict';

var TuiEditor = require('../../src/js/editor');

describe('colorSyntax', function() {
    var ned;

    //we need to wait squire input event process
    afterEach(function(done) {
        setTimeout(function() {
            $('body').empty();
            done();
        });
    });

    describe('conversion - useCustomSyntax', function() {
        var actual, expected;

        beforeEach(function() {
            $('body').html('<div id="editSection"></div>');

            ned = new TuiEditor({
                el: $('#editSection'),
                previewStyle: 'vertical',
                height: 100,
                initialEditType: 'markdown',
                exts: ['colorSyntax'],
                colorSyntax: {
                    useCustomSyntax: true
                }
            });

            actual = null;
            expected = null;
        });

        it('convert html to color syntax', function() {
            var src = '<span class="colour" style="color:rgb(255,0,255)">test</span>';
            actual = ned.eventManager.emitReduce('convertorAfterHtmlToMarkdownConverted', src);
            expected = '{color:#ff00ff}test{color}';

            expect(actual).toEqual(expected);
        });

        it('convert multiple color html to color syntax', function() {
            var src = '<span class="colour" style="color:rgb(255,0,255)">test</span>test2<span class="colour" style="color:rgb(255,0,255)">test3</span>';
            actual = ned.eventManager.emitReduce('convertorAfterHtmlToMarkdownConverted', src);
            expected = '{color:#ff00ff}test{color}test2{color:#ff00ff}test3{color}';

            expect(actual).toEqual(expected);
        });

        it('convert color syntax to html', function() {
            var src = '{color:#ff00ff}test{color}';
            actual = ned.eventManager.emitReduce('convertorAfterMarkdownToHtmlConverted', src);
            expected = '<span style="color:#ff00ff">test</span>';

            expect(actual).toEqual(expected);
        });

        it('convert multiple color syntax to html', function() {
            var src = '{color:#ff00ff}test{color}test2{color:#ff00ff}test3{color}';
            actual = ned.eventManager.emitReduce('convertorAfterMarkdownToHtmlConverted', src);
            expected = '<span style="color:#ff00ff">test</span>test2<span style="color:#ff00ff">test3</span>';

            expect(actual).toEqual(expected);
        });
    });

    describe('conversion - dont useCustomSyntax', function() {
        var actual, expected;

        beforeEach(function() {
            $('body').html('<div id="editSection"></div>');

            ned = new TuiEditor({
                el: $('#editSection'),
                previewStyle: 'vertical',
                height: 100,
                initialEditType: 'markdown',
                exts: ['colorSyntax']
            });

            actual = null;
            expected = null;
        });

        it('do not convert color syntax to html when dont use custom syntax', function() {
            var src = '{color:#ff00ff}test{color}';

            actual = ned.eventManager.emitReduce('convertorAfterMarkdownToHtmlConverted', src);
            expected = '{color:#ff00ff}test{color}';
            expect(actual).toEqual(expected);
        });

        it('convert html to html when dont use custom syntax', function() {
            var src = '<span class="colour" style="color:rgb(255,0,255)">test</span>';

            actual = ned.eventManager.emitReduce('convertorAfterHtmlToMarkdownConverted', src);
            expected = '<span style="color:#ff00ff">test</span>';
            expect(actual).toEqual(expected);
        });
    });

    describe('commands', function() {
        beforeEach(function() {
            $('body').html('<div id="editSection"></div>');

            ned = new TuiEditor({
                el: $('#editSection'),
                previewStyle: 'vertical',
                height: 100,
                initialEditType: 'markdown',
                exts: ['colorSyntax'],
                colorSyntax: {
                    useCustomSyntax: true
                }
            });
        });
        it('add color in markdown', function() {
            ned.setValue('text');
            ned.getCodeMirror().execCommand('selectAll');
            ned.exec('color', '#f0f');

            expect(ned.getValue()).toEqual('{color:#f0f}text{color}');
        });

        it('add color in wysiwyg', function() {
            var sq, $body, selection, $span;

            ned.changeMode('wysiwyg');

            sq = ned.getSquire();
            $body = ned.wwEditor.get$Body();

            sq.setHTML('text');

            selection = sq.getSelection().cloneRange();
            selection.selectNodeContents($body.find('div')[0].childNodes[0]);
            sq.setSelection(selection);

            ned.exec('color', '#f0f');

            $span = ned.wwEditor.get$Body().find('span');

            expect($span.hasClass('colour')).toBe(true);
            expect($span.css('color')).toEqual('rgb(255, 0, 255)');
        });
    });
});
