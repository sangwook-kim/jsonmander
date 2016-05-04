//(function(global) {
    var rootEl = document.createElement('ul'),
        jsonmander = function(json) {
            rootEl.className = '_jsonmander';
    
            console.log( describe(json, 0) );
    
            rootEl.innerHTML = JSON.stringify(json);
            return rootEl;
        },
        describe = function(val, depth) {
            if(val !== null) {
            } else {
                return describeNull(indent ? depth: 0);
            }
        },
        describeNull = function(depth, index) {
            var row = getRow(),
                content;

            if(typeof index !== 'undefined') {
            } else {
            }
            return row;
        },
        getRow = function(depth) {
            var rowEl = document.creatElement('li');
            rowEl.className = '_jsonmander_row';

            return rowEl;
        },
        pushRight = function(depth) {
            return Array((depth * 2) + 1).join(' ');
        };

//    global.jsonmander = jsonmander;
//})(this);
