'use strict';

var WysiwygEditor = require('../src/js/wysiwygEditor'),
    EventManager = require('../src/js/eventManager'),
    WwListManager = require('../src/js/wwListManager');

describe('WwListManager', function() {
    var $container, em, wwe, mgr;

    beforeEach(function() {
        $container = $('<div />');

        $('body').append($container);

        em = new EventManager();

        wwe = new WysiwygEditor($container, em);

        wwe.init();

        mgr = new WwListManager(wwe);
    });

    //we need to wait squire input event process
    afterEach(function(done) {
        setTimeout(function() {
            $('body').empty();
            done();
        });
    });

    describe('_findAndRemoveEmptyList()', function() {
        it('remove ul that without li element within.', function() {
            wwe.setValue(['<ul>this will deleted</ul>',
                '<ol>and this too</ol>'].join(''));

            expect(wwe.get$Body().find('ul').length).toEqual(1);
            expect(wwe.get$Body().find('ol').length).toEqual(1);

            mgr._findAndRemoveEmptyList();

            expect(wwe.get$Body().find('ul').length).toEqual(0);
            expect(wwe.get$Body().find('ol').length).toEqual(0);
        });
        it('do not remove when ul have li element within.', function() {
            wwe.setValue(['<ul>',
                '<li><div>survived!</div></li>',
                '</ul>',
                '<ol>',
                '<li><div>me too!</div></li>',
                '</ol>'].join(''));

            expect(wwe.get$Body().find('ul').length).toEqual(1);
            expect(wwe.get$Body().find('ol').length).toEqual(1);

            mgr._findAndRemoveEmptyList();

            expect(wwe.get$Body().find('ul').length).toEqual(1);
            expect(wwe.get$Body().find('ul li').text()).toEqual('survived!');
            expect(wwe.get$Body().find('ol li').text()).toEqual('me too!');
        });
    });
});
