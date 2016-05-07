//(function(global) {
    //TODO: search box - fixed position?
    var rootEl = document.createElement('ul'),
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
            depth = 0;
            var rows = describe(json);
            rows = parseRows(rows);

            rootEl.className = '_jsonmander';
            rootEl.innerHTML = rows;

            return rootEl;
        },
        parseRows = function(rows) {
            var parsedRows = [];
            rows = rows.split('&');
            for(var i = 0, l = rows.length; i < l; i++) {
                if(rows[i] !== '') {
                    parsedRows.push('<li class="_jsonmander_row">' + rows[i] + '</li>');
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
                                     pushRight(depth) + '"' + key + '": ' +
                                     '</span>' + describe(val[key]);
                          }).join('');

            if(typeof index !== 'undefined') {
                content = '<span class="_json_index">' + '[' + index + ']' + '</span>' +
                          '<span class="_jsonmander_brace"> {</span>' +
                          '<span class="_jsonmander_fold"><a href="#">+</a></span>&' +
                          content;
            } else {
                content = '<span class="_jsonmander_brace">' +
                          '{</span><span class="_jsonmander_fold"><a href="#">+</a></span>&' +
                          content;
            }

            depth--;

            content = content + 
                      '<span class="_jsonmander_brace">'  + pushRight(depth) +
                      '}</span>&';

            return content;
        },
        describeArray = function(val, index) {
            //TODO: init fold flag?
            depth++;
            var content = '';

            for(var i = 0, l = val.length; i < l; ++i) {
                content += '<span class="_json_index">' + 
                           pushRight(depth) + '[' + i + ']: ' +
                           '</span>' + describe(val[i]);
            }

            if(typeof index !== 'undefined') {
                content = '<span class="_json_index">' + '[' + index + ']' + '</span>' +
                          '<span class="_jsonmander_brace"> [</span>' +
                          '<span class="_jsonmander_fold"><a href="#">+</a></span>&' +
                          content;
            } else {
                content = '<span class="_jsonmander_brace">' +
                          '[</span><span class="_jsonmander_fold"><a href="#">+</a></span>&' +
                          content;
            }

            depth--;

            content = content + 
                      '<span class="_jsonmander_brace">'  + pushRight(depth) +
                      ']</span>&';

            return content;
        },
        pushRight = function(depth) {
            return Array((depth * 2) + 1).join(' ');
        },
        depth;

//    global.jsonmander = jsonmander;
//})(this);
