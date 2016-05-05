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
            rootEl.className = '_jsonmander';
    
            rootEl.innerHTML = describe(json);

            return rootEl;
        },
        describe = function(val, depth, index) {
            if(val !== null) {
                var type = typeof val;
                switch (type) {
                  case 'boolean':
                    return describePrimitive(val, '_json_bool', depth, index);
                  case 'number':
                    return describePrimitive(val, '_json_number', depth, index);
                  case 'string':
                    return describePrimitive(escapeString(val), '_json_string', depth, index);
                  default:
                    if (val instanceof Array) {
                      return describeArray(val, depth, indent, index);
                    } else {
                      return describeObject(val, depth, indent, index);
                    }
                }
            } else {
                return describePrimitive(val, '_json_null', depth, index);
            }
        },
        describePrimitive = function(val, className, depth, index) {
            var depth = depth ? depth: 0,
                content;

            if(typeof index !== 'undefined') {
                content = '<span class="_json_index">' +
                              pushRight(depth) + '[' + index + ']' +
                          '</span>' +
                          '<span class="_json_val ' + className + '">' +
                              ' ' + val +
                          '</span>';
            } else {
                content = '<span class="_json_val ' + className + '">' +
                              pushRight(depth) + val +
                          '</span>';
            }

            return '<li class="_jsonmander_row">' + content + '</li>';
 
        },
        describeObject = function(val, depth, index, indent) {
            //TODO: init fold flag?
            var depth = depth ? depth: 0,
                content = Object.keys(val).map(function(key) {
                              return '<div class="_json_obj"><span class="_json_key">' +
                                     pushRight(depth + 1) + '"' + key + '": ' +
                                     '</span>' + describe(val[key]);
                          }).join('</div>');
    /*
    var body = [
      _openBracket('{', indent ? depth : 0, id),
      _span(content, {id: id}),
      _closeBracket('}', depth)
    ].join('\n');
    return _span(body, {})
    */
            return content;
        },
        pushRight = function(depth) {
            return Array((depth * 2) + 1).join(' ');
        };

//    global.jsonmander = jsonmander;
//})(this);
