// AUTOCOMPLETE //
let Keys = {
    backspace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    ctrl: 17,
    alt: 18,
    pause: 19,
    capsLock: 20,
    escape: 27,
    space: 32,
    pageUp: 33,
    pageDown: 34,
    end: 35,
    home: 36,
    leftArrow: 37,
    upArrow: 38,
    rightArrow: 39,
    downArrow: 40,
    insert: 45,
    del: 46
};

function addAutoComplete(input, results, options) {

    console.log(input);
    options = options || {};

    let self = this;

    let $input = $(input);
    let $results = $(results);

    self.focus = null;

    $input.keydown(function(e) {
        switch(e.which) {
            // up
            case Keys.upArrow:
                e.preventDefault();
                self.moveFocus(-1);
                break;
            // down
            case Keys.downArrow:
                e.preventDefault();
                self.moveFocus(1);
                break;
            // accept
            case Keys.enter:
                e.preventDefault();
                if(self.focus === null || self.focus === undefined) {
                    self.handleDefaultSubmit();
                } else {
                    self.acceptFocus();
                }
                break;
            // hide dropdown
            case Keys.escape:
                e.preventDefault();
                self.hideAutocomplete();
                self.$input.blur();
                break;
        }
    });

    $input.keyup(function(e) {
        if(!!~[Keys.enter, Keys.upArrow, Keys.downArrow, Keys.escape].indexOf(e.which)) return;
        self.triggerSearch();
    });

    $input.focus(function() {
        setTimeout(() => {
            self.triggerSearch();
        }, 0);
    });

    $input.blur(function() {
        if(self.focus_lock) return;
        setTimeout(() => {
            self.hideAutocomplete();
        }, 0);
    });

    self.triggerSearch = function() {

        console.log("triggerSearch", input);
        self.showAutocomplete();

        if(self.search_timeout) {
            clearTimeout(self.search_timeout);
            delete self.search_timeout;
        }

        let criteria = self.getCriteria();

        if(self.criteriaEqual(criteria)) {
            return self.showResults(criteria);
        }

        if(!criteria) {
            $(results).empty();
        } else {
            self.search_timeout = setTimeout(() => {
                delete self.search_timeout;
                self.showResults(criteria);
            }, 800);
        }
    };

    self.showAutocomplete = function() {
        $results.show();
    };

    self.hideAutocomplete = function() {
        self.focus = null;
        $results.hide();
    };

    self.showResults = function(criteria) {

        console.log("show results", $input);
        if(self.criteriaEqual(criteria) && self.data) {
            return;
        }

        self.criteria = criteria;
        if(!criteria) return;

        console.log("getting results", $input, criteria);
        $.get('/ajax/player-player-search', criteria, function(data) {

            self.data = data;
            self.focus = null;

            let html = '';
            for(let i = 0; i < data.length; i++) {
                let player = data[i];
                console.log(JSON.stringify(player));
                let position = player.positions.join("/");
                html += '<div data-id="' + player.player_id + '">'; //'" class="team-icon team-' + player.team.toLowerCase() + '">';
                if(options.url_function){
                    html += '<a href="' + options.url_function(player) + '">' + player.name + ' (' + position + ')</a>';
                } else {
                    html += '<a href="/players/' + player.player_id + '">' + player.name + ' (' + position + ')</a>';
                }
                html += '</div>';
            }
            $(results).html(html);

            // $(results + ' div').on('click', function(e) {
            //
            //     let playerId = $(e.target).attr('data-id');
            //
            //     setTimeout(function() {
            //         self.selectItem({ playerId: playerId, name : 'todo' });
            //     }, 0);
            //
            // });
            // $(results + ' div').hover(function(e) {
            //     $(results + ' div').removeClass('highlight');
            //     $(e.target).addClass('highlight');
            // });

            $results.children('div').mousedown(function(e) {
                self.focus_lock = true;
            });

            $results.children('div').mouseup(function(e) {
                $(input).focus();
                self.focus_lock = false;
            });

        });

    };

    self.moveFocus = function(direction) {

        if(!self.data) return;
        let prev_focus = self.focus;
        if(prev_focus === null && self.data.length) {
            self.focus = (direction > 0) ? 0 : self.data.length - 1;
        } else {
            self.focus += (direction > 0) ? 1 : -1;
            if(self.focus >= self.data.length || self.focus < 0) {
                self.focus = (direction > 0) ? 0 : self.data.length - 1;
            }
        }
        if(prev_focus !== self.focus) {
            if(self.data[prev_focus]) {
                $results.children('div:nth-child(' + (prev_focus + 1) + ')').removeClass('highlight');
            }
            if(self.data[self.focus]) {
                $results.children('div:nth-child(' + (self.focus + 1) + ')').addClass('highlight');
            }
        }
    };

    self.handleDefaultSubmit = function() {
        if(self.data && self.data.length) {
            self.focus = 0;
            self.acceptFocus();
        }
    };

    self.acceptFocus = function() {

        // if someone presses, down then enter before models are loaded? Fixing client side bug (SS)
        if(!self.data) return;

        let item = self.data[self.focus];
        if(!item) return;
        self.selectItem(item);
    };

    self.selectItem = function(item) {

        console.log("select", item);
        // $('.x-add-location-container input.x-longkey').val(item.longkey);
        //
        // for(var i = 0; i < self.data.length; i++) {
        //     if(self.data[i].longkey === item.longkey) {
        //         console.log("selected", self.data[i]);
        //         $input.val(self.data[i].name);
        //         break;
        //     }
        // }
        //
        // self.hideAutocomplete();
        //
        // if(options.onSelectItem) options.onSelectItem(item, self.data);
    };

    self.getCriteria = function() {

        var criteria = {
            q: $(input).val()
        };

        console.log("get criteria", $(input).val());
        if(criteria.q.length < 3) {
            criteria = null;
        }
        return criteria;
    };

    self.criteriaEqual = function(criteria) {
        console.log("criteria equal", criteria, self.criteria);
        console.log((!self.criteria && !criteria) || (self.criteria && criteria && self.criteria.q === criteria.q));
        return (!self.criteria && !criteria) || (self.criteria && criteria && self.criteria.q === criteria.q);
    };
}