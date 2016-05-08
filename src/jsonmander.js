//TODO: text search - rootEl.childNodes[i].textContent
(function(global) {
    //TODO: search box - fixed position?
    //TODO: multiple instance rootEl;
    var rootEl = document.createElement('ul'),
        instance = 0, _id = 0,
        originalJson, originalTree,
        escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#x27;',
            '/': '&#x2F;'
        },
        escapeString = function(str) {
            return str.replace(/[&<>'"]/g, function(c) {
                return escapeMap[c];
            });
        },
        jsonmander = function(json) {
            ++instance;
            depth = 0;
            originalJson = json;
            var rows = describe(json);
            rows = parseRows(rows);

            rootEl.className = '_jsonmander';
            rootEl.innerHTML = rows;

            originalTree = rootEl;
            rootEl.addEventListener('click', toggleFold);

            return rootEl;
        },
        parseRows = function(rows) {
            var parsedRows = [];
            rows = rows.split('&');
            for(var i = 0, l = rows.length; i < l; i++) {
                if(rows[i] !== '') {
                    if(rows[i].split('data-block-id="').length > 1) {
                        var foldID = 'jsonmander_' + rows[i].split('data-block-id="')[1].split('"')[0];
                        parsedRows.push('<li id="' + foldID + '" class="_jsonmander_row">' + rows[i] + '</li>');
                    } else {
                        parsedRows.push('<li class="_jsonmander_row">' + rows[i] + '</li>');
                    }
                }
            }

            return parsedRows.join('');
        },
        describe = function(val, index) {
            if(val !== null) {
                var type = typeof val;
                switch (type) {
                  case 'boolean':
                    return describePrimitive(val, '_json_bool', index);
                  case 'number':
                    return describePrimitive(val, '_json_number', index);
                  case 'string':
                    return describePrimitive( '"' + escapeString(val) + '"', '_json_string', index);
                  default:
                    if (val instanceof Array) {
                      return describeArray(val, index);
                    } else {
                      return describeObject(val, index);
                    }
                }
            } else {
                return describePrimitive(val, '_json_null', index);
            }
        },
        describePrimitive = function(val, className, index) {
            var content;

            if(typeof index !== 'undefined') {
                content = '<span class="_json_index">' +
                              pushRight(depth) + '[' + index + ']' +
                          '</span>' +
                          '<span class="_json_val ' + className + '">' +
                              ' ' + val +
                          '</span>';
            } else {
                content = '<span class="_json_val ' + className + '">' +
                              //pushRight(depth) + val +
                              val +
                          '</span>';
            }

            return content + '&';
        },
        describeObject = function(val, index) {
            //TODO: init fold flag?
            depth++;

            var content = Object.keys(val).map(function(key) {
                              return '<span class="_json_key">' +
                                     pushRight(depth) + '"' + escapeString(key) + '": ' +
                                     '</span>' + describe(val[key]);
                          }).join(''),
                objectID = instance + '_' + _id++;

            if(typeof index !== 'undefined') {
                content = '<span class="_json_index">' + '[' + index + ']' + '</span>' +
                          '<span class="_jsonmander_brace" data-block-id="open_' + objectID + '"> {</span>'  +
                          '<span class="_jsonmander_fold"><a href="#" class="_jsonmander_fold">-</a></span>&' +
                          content;
            } else {
                content = '<span class="_jsonmander_brace" data-block-id="open_' + objectID + '">'  +
                          '{</span><span class="_jsonmander_fold"><a href="#" class="_jsonmander_fold">-</a></span>&' +
                          content;
            }

            depth--;

            content = content + 
                      '<span class="_jsonmander_brace" data-block-id="close_' + objectID + '">'  +
                      pushRight(depth) + '}</span>&';

            return content;
        },
        describeArray = function(val, index) {
            //TODO: init fold flag?
            depth++;
            var content = '', arrayID = instance + '_' + _id++;

            for(var i = 0, l = val.length; i < l; ++i) {
                content += '<span class="_json_index">' + 
                           pushRight(depth) + '[' + i + ']: ' +
                           '</span>' + describe(val[i]);
            }

            if(typeof index !== 'undefined') {
                content = '<span class="_json_index">' + '[' + index + ']' + '</span>' +
                          '<span class="_jsonmander_bracket" data-block-id="open_' + arrayID + '"> [</span>' +
                          '<span class="_jsonmander_fold"><a href="#" class="_jsonmander_fold">-</a></span>&' +
                          content;
            } else {
                content = '<span class="_jsonmander_bracket" data-block-id="open_' + arrayID + '">' +
                          '[</span><span class="_jsonmander_fold"><a href="#" class="_jsonmander_fold">-</a></span>&' +
                          content;
            }

            depth--;

            content = content + 
                      '<span class="_jsonmander_bracket" data-block-id="close_' + arrayID + '">'  +
                      pushRight(depth) + ']</span>&';

            return content;
        },
        pushRight = function(depth) {
            return Array((depth * 2) + 1).join(' ');
        },
        toggleFold = function(e) {
            if(e.target && e.target.nodeName === 'A') {
                e.preventDefault();

                if(e.target.className.indexOf('_jsonmander_fold') > -1) {
                    fold(e.target.parentNode.parentNode);
                } else {
                    unfold(e.target.parentNode.parentNode);
                }
            }
        },
        fold = function(openLI) {
            var closeID = openLI.id.replace('open', 'close'),
                bankEl = document.createElement('ul'),
                nextLI = openLI.nextSibling,
                closeBraceSpan = document.createElement('span'),
                foldBtn = openLI.getElementsByTagName('a')[0];

            bankEl.className = '_jsonmander_bank ' + closeID;
            while (true) {
                var oldLI = nextLI;
                nextLI = nextLI.nextSibling;
                oldLI.remove();
                bankEl.appendChild(oldLI);
                if(oldLI.id === closeID) break;
            }
            rootEl.appendChild(bankEl);

            if(openLI.getElementsByClassName('_jsonmander_brace').length > 0) {
                closeBraceSpan.className = '_jsonmander_brace';
                closeBraceSpan.innerText = '}';
            } else {
                closeBraceSpan.className = '_jsonmander_bracket';
                closeBraceSpan.innerText = ']';
            }

            foldBtn.className = '_jsonmander_unfold';
            foldBtn.innerText = '+';


            openLI.appendChild(closeBraceSpan);
        },
        unfold = function(openLI) {
            var closeID = openLI.id.replace('open', 'close'),
                nextLI = openLI.nextSibling,
                bankEl = rootEl.getElementsByClassName('_jsonmander_bank ' + closeID)[0],
                foldedLIs = bankEl.childNodes,
                foldBtn = openLI.getElementsByTagName('a')[0];

            for(var i = 0, l = foldedLIs.length; i < l; ++i) {
                rootEl.insertBefore(foldedLIs[0], nextLI);
            }

            bankEl.remove();

            openLI.lastChild.remove();

            foldBtn.className = '_jsonmander_fold';
            foldBtn.innerText = '-';
        },
        depth;

    global.jsonmander = jsonmander;
})(this);
