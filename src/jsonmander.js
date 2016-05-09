(function(global) {
    //TODO: search box - fixed position?
    //TODO: scroll?
    //TODO: multiple instance test
/*
    var jsonRoot = document.createElement('ul'),
        searchList = document.createElement('ul'),
        searchBox = document.createElement('input'),
*/
    var instance = 0, _id = 0,
        instanceList = [],
        originalJson,
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
        jsonmander = function(rootEl, json, doSearch) {
            var jsonRoot = document.createElement('ul'),
                searchList = document.createElement('ul'),
                searchBox = document.createElement('input'),
                originalTree, rows;
            //roots.push(rootEl); do we need?
            depth = 0;
            originalJson = json;
            rows = parseRows(describe(json));

            jsonRoot.className = '_jsonmander';
            jsonRoot.innerHTML = rows;
            jsonRoot.id = 'jsonmander_' + instance;

            searchList.className = '_jsonmander _jsonmander_search_list';
            searchList.innerHTML = '';
            searchList.id = 'jsonmander_search_' + instance;

            searchBox.type = 'text';
            searchBox.className = '_jsonmander_box';
            searchBox.id = 'jsonmander_box_' + instance;
            searchBox.placeholder = 'JSON notation or search word';
            searchBox.addEventListener('keyup', searchJSON);

            originalTree = jsonRoot.cloneNode(true);
            jsonRoot.addEventListener('click', toggleFold);

            if(doSearch) {
                rootEl.appendChild(searchBox);
            }
            rootEl.appendChild(jsonRoot);
            rootEl.appendChild(searchList);


            instanceList.push({
                jsonRoot: jsonRoot,
                searchList: searchList,
                searchBox: searchBox,
                originalTree: originalTree
            });

            clearSearch(instance++);
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
                              val +
                          '</span>';
            }

            return content + '&';
        },
        describeObject = function(val, index) {
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
                foldBtn = openLI.getElementsByTagName('a')[0],
                instanceID = openLI.id.split('jsonmander_open_')[1].split('_')[0];

            bankEl.className = '_jsonmander_bank ' + closeID;
            while (true) {
                var oldLI = nextLI;
                nextLI = nextLI.nextSibling;
                oldLI.remove();
                bankEl.appendChild(oldLI);
                if(oldLI.id === closeID) break;
            }
            instanceList[instanceID].jsonRoot.appendChild(bankEl);

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
                foldBtn = openLI.getElementsByTagName('a')[0],
                instanceID = openLI.id.split('jsonmander_open_')[1].split('_')[0],
                root = instanceList[instanceID].jsonRoot,
                bankEl = root.getElementsByClassName('_jsonmander_bank ' + closeID)[0],
                foldedLIs = bankEl.childNodes;

            for(var i = 0, l = foldedLIs.length; i < l; ++i) {
                root.insertBefore(foldedLIs[0], nextLI);
            }

            bankEl.remove();

            openLI.lastChild.remove();

            foldBtn.className = '_jsonmander_fold';
            foldBtn.innerText = '-';
        },
        searchJSON = function(e) {
            if(e.keyCode !== 13) {
                return;
            }
            var query = e.target.value.trim(),
                instanceID = parseInt(e.target.id.split('_')[2], 10);

            if(query[0] === '[' || query[0] === '.') {
                browse(query, instanceID);
            } else if(query.length === 0) {
                clearSearch(instanceID);
            } else {
                grep(query, instanceID);
            }
        },
        clearSearch = function(i) {
            instanceList[i].jsonRoot.style.display = 'block';
            instanceList[i].searchList.innerHTML = '';
            instanceList[i].searchList.style.display = 'none';
            instanceList[i].searchBox.value = '';
        },
        browse = function(objIdx, instanceID) {
            instanceList[instanceID].jsonRoot.style.display = 'none';
            instanceList[instanceID].searchList.innerHTML = '';
            instanceList[instanceID].searchList.style.display = 'block';

            var idxs = objIdx.split(/[\[\.\]]+/),
                newObj = originalJson;
            
            try {
                for(var i = 0, l = idxs.length; i < l; ++i) {
                    if(idxs[i] !== '') {
                        var numIdx = parseInt(idxs[i], 10);
                        if(numIdx + '' === idxs[i]) {
                            newObj = newObj[numIdx];
                        } else {
                            newObj = newObj[idxs[i]];
                        }
                    }
                }

                var rows = describe(newObj);
                rows = parseRows(rows);

                instanceList[instanceID].searchList.innerHTML = rows;
            } catch(e) {
                showNoResult(instanceID);
            }
        },
        grep = function(q, instanceID) {
            instanceList[instanceID].jsonRoot.style.display = 'none';
            instanceList[instanceID].searchList.innerHTML = '';
            instanceList[instanceID].searchList.style.display = 'block';

            var originalList = instanceList[instanceID].originalTree.childNodes;
            for(var i = 0, l = originalList.length; i < l; ++i) {
                if(originalList[i].textContent.indexOf(q) > -1) {
                    var foundLI = originalList[i].cloneNode(true);
                    for(var j = 0, len = foundLI.childNodes.length; j < len; ++j) {
                        foundLI.childNodes[j].innerHTML = foundLI.childNodes[j].innerHTML.replace(q, '<span class="_jsonmander_hilite">' + q + '</span>');
                    }
                    instanceList[instanceID].searchList.appendChild(foundLI);
                }
            }

            if(instanceList[instanceID].searchList.childNodes.length === 0) {
                showNoResult(instanceID);
            }
        },
        showNoResult = function(i) {
            instanceList[i].jsonRoot.style.display = 'none';
            instanceList[i].searchList.innerHTML = '<li class="_jsonmander_error">  NO RESULT TO SHOW</li>';
            instanceList[i].searchList.style.display = 'block';
        },
        depth;

    global.jsonmander = jsonmander;
})(this);
