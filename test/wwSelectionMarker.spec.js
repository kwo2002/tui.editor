'use strict';

var WwSelectionMarker = require('../src/js/wwSelectionMarker'),
    WysiwygEditor = require('../src/js/wysiwygEditor'),
    EventManager = require('../src/js/eventManager');

describe('WwSelectionMarker', function() {
    var $container, em, wwe, wwsm, range;

    beforeEach(function() {
        $container = $('<div />');

        $('body').append($container);

        em = new EventManager();

        wwe = new WysiwygEditor($container, em);

        wwe.init();

        wwe.setValue('<h1>hello world</h1>');
        range = wwe.getEditor().getSelection().cloneRange();

        wwsm = new WwSelectionMarker();
    });

    afterEach(function(done) {
        setTimeout(function() {
            $('body').empty();
            done();
        });
    });

    describe('insert selection marker', function() {
        it('mark non callapsed range', function() {
            range.selectNodeContents(wwe.get$Body().find('h1')[0].childNodes[0]);

            wwsm.insertMarker(range, wwe.getEditor());

            expect(range.startContainer.childNodes[range.startOffset].nodeValue).toEqual('hello world');
            expect(range.startContainer.childNodes[range.startOffset].previousSibling.tagName).toEqual('INPUT');
        });

        it('mark callapsed range', function() {
            range.setStart(wwe.get$Body().find('h1')[0].childNodes[0], 1);
            range.collapse(true);

            wwsm.insertMarker(range, wwe.getEditor());

            expect(range.startContainer.childNodes[range.startOffset].nodeValue).toEqual('ello world');
            expect(range.startContainer.childNodes[range.startOffset].previousSibling.tagName).toEqual('INPUT');
        });
    });

    describe('restore saved selection marker', function() {
        it('restore saved marker', function() {
            range.setStart(wwe.get$Body().find('h1')[0].childNodes[0], 1);
            range.collapse(true);

            wwsm.insertMarker(range, wwe.getEditor());

            range.selectNodeContents(wwe.get$Body().find('h1')[0].childNodes[0]);
            wwe.getEditor().setSelection(range);

            range = wwsm.restore(wwe.getEditor());

            expect(range.startContainer.childNodes[range.startOffset].nodeValue).toEqual('ello world');
            expect(wwe.get$Body().find('input').length).toEqual(0);
        });
    });
});
