var fancyTree = function (apex, $) {
    "use strict";
    var util = {
        featureDetails: {
            name: "APEX-Fancy-Tree-Select",
            info: {
                scriptVersion: "2.1.4.5",
                utilVersion: "1.4",
                url: "https://github.com/RonnyWeiss",
                license: "MIT"
            }
        },
        isDefinedAndNotNull: function (pInput) {
            if (typeof pInput !== "undefined" && pInput !== null && pInput != "") {
                return true;
            } else {
                return false;
            }
        },
        convertJSON2LowerCase: function (obj) {
            try {
                var output = {};
                for (var i in obj) {
                    if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
                        output[i.toLowerCase()] = util.convertJSON2LowerCase(obj[i]);
                    } else if (Object.prototype.toString.apply(obj[i]) === '[object Array]') {
                        output[i.toLowerCase()] = [];
                        output[i.toLowerCase()].push(util.convertJSON2LowerCase(obj[i][0]));
                    } else {
                        output[i.toLowerCase()] = obj[i];
                    }
                }

                return output;
            } catch (e) {
                apex.debug.error({
                    "module": "util.js",
                    "msg": "Error while to lower json",
                    "err": e
                });
                return;
            }
        },
        jsonSaveExtend: function (srcConfig, targetConfig) {
            var finalConfig = {};
            var tmpJSON = {};
            /* try to parse config json when string or just set */
            if (typeof targetConfig === 'string') {
                try {
                    tmpJSON = JSON.parse(targetConfig);
                } catch (e) {
                    apex.debug.error({
                        "module": "util.js",
                        "msg": "Error while try to parse targetConfig. Please check your Config JSON. Standard Config will be used.",
                        "err": e,
                        "targetConfig": targetConfig
                    });
                }
            } else {
                tmpJSON = $.extend(true, {}, targetConfig);
            }
            /* try to merge with standard if any attribute is missing */
            try {
                finalConfig = $.extend(true, {}, srcConfig, tmpJSON);
            } catch (e) {
                finalConfig = $.extend(true, {}, srcConfig);
                apex.debug.error({
                    "module": "util.js",
                    "msg": "Error while try to merge 2 JSONs into standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.",
                    "err": e,
                    "finalConfig": finalConfig
                });
            }
            return finalConfig;
        },
        printDOMMessage: {
            show: function (id, text, icon, color) {
                if ($(id).height() >= 150) {
                    var div = $("<div></div>")
                        .css("margin", "12px")
                        .css("text-align", "center")
                        .css("padding", "10px 0")
                        .addClass("dominfomessagediv");

                    var subDiv = $("<div></div>");

                    var iconSpan = $("<span></span>")
                        .addClass("fa")
                        .addClass(icon || "fa-info-circle-o")
                        .addClass("fa-2x")
                        .css("height", "32px")
                        .css("width", "32px")
                        .css("margin-bottom", "16px")
                        .css("color", color || "#D0D0D0");

                    subDiv.append(iconSpan);

                    var textSpan = $("<span></span>")
                        .text(text)
                        .css("display", "block")
                        .css("color", "#707070")
                        .css("text-overflow", "ellipsis")
                        .css("overflow", "hidden")
                        .css("white-space", "nowrap")
                        .css("font-size", "12px");

                    div
                        .append(subDiv)
                        .append(textSpan);
                } else {
                    var div = $("<div></div>")
                        .css("margin", "10px")
                        .css("text-align", "center")
                        .addClass("dominfomessagediv");

                    var iconSpan = $("<span></span>")
                        .addClass("fa")
                        .addClass(icon || "fa-info-circle-o")
                        .css("font-size", "22px")
                        .css("line-height", "26px")
                        .css("margin-right", "5px")
                        .css("color", color || "#D0D0D0");

                    var textSpan = $("<span></span>")
                        .text(text)
                        .css("color", "#707070")
                        .css("text-overflow", "ellipsis")
                        .css("overflow", "hidden")
                        .css("white-space", "nowrap")
                        .css("font-size", "12px")
                        .css("line-height", "20px");

                    div
                        .append(iconSpan)
                        .append(textSpan);
                }
                $(id).append(div);
            },
            hide: function (id) {
                $(id).children('.dominfomessagediv').remove();
            }
        },
        noDataMessage: {
            show: function (id, text) {
                util.printDOMMessage.show(id, text, "fa-search");
            },
            hide: function (id) {
                util.printDOMMessage.hide(id);
            }
        },
        errorMessage: {
            show: function (id, text) {
                util.printDOMMessage.show(id, text, "fa-exclamation-triangle", "#FFCB3D");
            },
            hide: function (id) {
                util.printDOMMessage.hide(id);
            }
        },
        link: function (link, tabbed) {
            if (tabbed) {
                window.open(link, "_blank");
            } else {
                return window.parent.location.href = link;
            }
        },
        loader: {
            start: function (id, setMinHeight) {
                if (setMinHeight) {
                    $(id).css("min-height", "100px");
                }
                apex.util.showSpinner($(id));
            },
            stop: function (id, removeMinHeight) {
                if (removeMinHeight) {
                    $(id).css("min-height", "");
                }
                $(id + " > .u-Processing").remove();
                $(id + " > .ct-loader").remove();
            }
        },
        copyJSONObject: function (object) {
            try {
                var objectCopy = {};
                var key;

                for (key in object) {
                    objectCopy[key] = object[key];
                }
                return objectCopy;
            } catch (e) {
                apex.debug.error({
                    "module": "util.js",
                    "msg": "Error while try to copy object",
                    "err": e
                });
            }
        },
        debounce: function (pFunction, pWaitTime, pImmediate) {
            var timeout;
            return function () {
                var context = this,
                    args = arguments;
                var later = function () {
                    timeout = null;
                    if (!pImmediate) pFunction.apply(context, args);
                };
                var callNow = pImmediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, pWaitTime || 300);
                if (callNow) pFunction.apply(context, args);
            };
        },
        localStorage: {
            check: function () {
                if (typeof (Storage) !== "undefined") {
                    return true;
                } else {
                    apex.debug.info({
                        "module": "util.js",
                        msg: "Your browser does not support local storage"
                    });
                    return false;
                }
            },
            set: function (pKey, pStr, pType) {
                try {
                    if (util.localStorage.check) {
                        if (pType === "permanent") {
                            localStorage.setItem(pKey, pStr);
                        } else {
                            sessionStorage.setItem(pKey, pStr);
                        }
                    }
                } catch (e) {
                    apex.debug.error({
                        "module": "util.js",
                        "msg": "Error while try to save item to local Storage. Confirm that you not exceed the storage limit of 5MB.",
                        "err": e
                    });
                }
            },
            get: function (pKey, pType) {
                try {
                    if (util.localStorage.check) {
                        if (pType === "permanent") {
                            return localStorage.getItem(pKey);
                        } else {
                            return sessionStorage.getItem(pKey);
                        }
                    }
                } catch (e) {
                    apex.debug.error({
                        "module": "util.js",
                        "msg": "Error while try to read item from local Storage",
                        "err": e
                    });
                }
            },
            remove: function (pKey, pType) {
                try {
                    if (util.localStorage.check) {
                        if (pType === "permanent") {
                            localStorage.removeItem(pKey);
                        } else {
                            sessionStorage.removeItem(pKey);
                        }
                    }
                } catch (e) {
                    apex.debug.error({
                        "module": "util.js",
                        "msg": "Error while try remove item from local Storage",
                        "err": e
                    });
                }
            }
        }
    };

    return {
        initTree: function (regionID, ajaxID, noDataMessage, errMessage, udConfigJSON, items2Submit, escapeHTML, searchItemName, activeNodeItemName, pLocalStorage, pLocalStorageVersion, pExpandedNodesItem) {
            apex.debug.info({
                "fct": util.featureDetails.name + " - " + "initTree",
                "arguments": {
                    "regionID": regionID,
                    "ajaxID": ajaxID,
                    "noDataMessage": noDataMessage,
                    "errMessage": errMessage,
                    "udConfigJSON": udConfigJSON,
                    "items2Submit": items2Submit,
                    "escapeHTML": escapeHTML,
                    "searchItemName": searchItemName,
                    "activeNodeItemName": activeNodeItemName,
                    "pLocalStorage": pLocalStorage,
                    "pLocalStorageVersion": pLocalStorageVersion,
                    "pExpandedNodesItem": pExpandedNodesItem
                },
                "featureDetails": util.featureDetails
            });

            var configJSON = {};
            var stdConfigJSON = {
                "animationDuration": 200,
                "autoExpand2Level": 0,
                "checkbox": "fa-square-o",
                "checkboxSelected": "fa-check-square",
                "checkboxUnknown": "fa-square",
                "enableCheckBox": true,
                "enableKeyBoard": true,
                "enableQuicksearch": true,
                "forceSelectionSet": true,
                "markNodesWithChildren": false,
                "markerModifier": "fam-plus fam-is-info",
                "openParentOfActiveNode": true,
                "openParentOfSelected": true,
                "refresh": 0,
                "search": {
                    "autoExpand": true,
                    "leavesOnly": false,
                    "highlight": true,
                    "counter": true,
                    "hideUnmatched": true,
                    "debounce": {
                        "enabled": true,
                        "time": 400
                    }
                },
                "selectMode": 2,
                "setActiveNode": true,
                "setItemsOnInit": false
            };

            //extend configJSON with iven attributes
            configJSON = util.jsonSaveExtend(stdConfigJSON, udConfigJSON);
            configJSON.regionID = regionID;
            configJSON.ajaxID = ajaxID;
            configJSON.noDataMessage = noDataMessage;
            configJSON.errMessage = errMessage;
            configJSON.items2Submit = items2Submit;
            configJSON.expandedNodesItem = pExpandedNodesItem;
            configJSON.localStorage = {};
            configJSON.localStorage.enabled = (pLocalStorage === 'Y') ? true : false;

            if (configJSON.localStorage.enabled) {
                configJSON.session = apex.item("pInstance").getValue();
                configJSON.version = pLocalStorageVersion;
                configJSON.localStorage.key = regionID;
                configJSON.localStorage.type = "session";

                configJSON.localStorage.keyFinal = JSON.stringify({
                    "key": configJSON.localStorage.key,
                    "plugin": util.featureDetails.name,
                    "session": configJSON.session,
                    "version": configJSON.version
                }, null, 0);

                /* cleanup old storage sessions */
                if (util.localStorage.check) {
                    $.each(sessionStorage, function (i, d) {
                        if (i.substring(0, 1) === "{") {
                            try {
                                var dat = JSON.parse(i);
                                if (dat.plugin == util.featureDetails.name && dat.key == configJSON.localStorage.key && (dat.session != configJSON.session || dat.version != configJSON.version)) {
                                    util.localStorage.remove(i);
                                }
                            } catch (e) {
                                apex.debug.error({
                                    "fct": util.featureDetails.name + " - " + "initTree",
                                    "msg": "Error while try to parse local storage key json",
                                    "err": e,
                                    "featureDetails": util.featureDetails
                                });
                            }
                        }
                    });
                }
            }

            if (!isNaN(configJSON.animationDuration) && configJSON.animationDuration >= 0) {
                configJSON.animationDuration = {
                    effect: "slideToggle",
                    duration: configJSON.animationDuration
                };
            } else {
                configJSON.animationDuration = false;
            }

            if (escapeHTML !== false) {
                configJSON.escapeHTML = true;
            }

            function getTree() {
                return $(configJSON.regionID).fancytree('getTree');
            }

            function treeSort(options) {
                var cfi, e, i, id, o, pid, rfi, ri, thisid, _i, _j, _len, _len1, _ref, _ref1;
                id = options.id || "id";
                pid = options.parent_id || "parent_id";
                ri = [];
                rfi = {};
                cfi = {};
                o = [];
                _ref = options.q;
                for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                    e = _ref[i];
                    rfi[e[id]] = i;
                    if (cfi[e[pid]] == null) {
                        cfi[e[pid]] = [];
                    }
                    cfi[e[pid]].push(options.q[i][id]);
                }
                _ref1 = options.q;
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    e = _ref1[_j];
                    if (rfi[e[pid]] == null) {
                        ri.push(e[id]);
                    }
                }
                while (ri.length) {
                    thisid = ri.splice(0, 1);
                    o.push(options.q[rfi[thisid]]);
                    if (cfi[thisid] != null) {
                        ri = cfi[thisid].concat(ri);
                    }
                }
                return o;
            }
            function buildTree(options) {
                var children, e, id, o, pid, temp, _i, _len, _ref;
                id = options.id || "id";
                pid = options.parent_id || "parent_id";
                children = options.children || "children";
                temp = {};
                o = [];
                _ref = options.q;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    e = _ref[_i];
                    e[children] = [];
                    temp[e[id]] = e;
                    if (temp[e[pid]] != null) {
                        temp[e[pid]][children].push(e);
                    } else {
                        o.push(e);
                    }
                }
                return o;
            }

            function getData(sucFunction, isUpdate) {
                util.loader.start(configJSON.regionID, true);
                try {
                    if (configJSON.localStorage.enabled) {
                        var storedStr = util.localStorage.get(configJSON.localStorage.keyFinal, configJSON.localStorage.type);
                        if (storedStr) {
                            var decompressedStr = LZString.decompress(storedStr);
                            var data = JSON.parse(decompressedStr);
                            apex.debug.info({
                                "fct": util.featureDetails.name + " - " + "getData",
                                "msg": "Read string from local storage",
                                "localStorageKey": configJSON.localStorage.keyFinal,
                                "localStorageStr": decompressedStr,
                                "localStorageCompressedStr": storedStr,
                                "featureDetails": util.featureDetails
                            });
                            sucFunction(data);
                            if (isUpdate) {
                                $(eventsBindSel).trigger("apexafterrefresh", data);
                            }
                            return;
                        }
                    }

                    apex.server.plugin(
                        configJSON.ajaxID, {
                        pageItems: configJSON.items2Submit
                    }, {
                        success: function (pData) {
                            sucFunction(pData);
                            if (configJSON.localStorage.enabled) {
                                try {
                                    var str = JSON.stringify(pData, null, 0);
                                    var cStr = LZString.compress(str);
                                    util.localStorage.set(configJSON.localStorage.keyFinal, cStr, configJSON.localStorage.type);
                                    apex.debug.info({
                                        "fct": util.featureDetails.name + " - " + "getData",
                                        "msg": "Write string to local storage",
                                        "localStorageKey": configJSON.localStorage.keyFinal,
                                        "localStorageStr": str,
                                        "localStorageCompressedStr": cStr,
                                        "featureDetails": util.featureDetails
                                    });
                                } catch (e) {
                                    apex.debug.error({
                                        "fct": util.featureDetails.name + " - " + "getData",
                                        "msg": "Error while try to store local cache. This could be because local cache is disabled in your browser or maximum sotrage of 5MB is exceeded.",
                                        "err": e,
                                        "featureDetails": util.featureDetails
                                    });
                                }
                            }
                            if (isUpdate) {
                                $(eventsBindSel).trigger("apexafterrefresh", pData);
                            }
                        },
                        error: function (d) {
                            util.loader.stop(configJSON.regionID, true);
                            $(configJSON.regionID).empty();
                            util.errorMessage.show(configJSON.regionID, configJSON.errMessage);
                            apex.debug.error({
                                "fct": util.featureDetails.name + " - " + "getData",
                                "msg": "Error while try to get new data",
                                "err": d,
                                "featureDetails": util.featureDetails
                            });
                            if (isUpdate) {
                                $(eventsBindSel).trigger("apexafterrefresh");
                            }
                        },
                        dataType: "json"
                    });
                } catch (e) {
                    apex.debug.error({
                        "fct": util.featureDetails.name + " - " + "getData",
                        "msg": "Error while try to get new data",
                        "err": e,
                        "featureDetails": util.featureDetails
                    });
                    if (isUpdate) {
                        $(eventsBindSel).trigger("apexafterrefresh");
                    }
                }
            }

            function sortNumber(a, b) {
                return a - b;
            }
            function prepareData(data) {
                try {
                    // lower json from sql
                    var _root = util.convertJSON2LowerCase(data.row);

                    var activeID;
                    var isActivated = false;
                    if (util.isDefinedAndNotNull(activeNodeItemName)) {
                        activeID = apex.item(activeNodeItemName).getValue();
                    } else {
                        configJSON.setActiveNode = false;
                    }

                    // fill up icons
                    $.each(_root, function (i, val) {
                        if (configJSON.typeSettings) {
                            configJSON.typeSettings.forEach(function (obj) {
                                if (obj.id == val.type) {
                                    if (!val.icon || val.icon.length == 0) {
                                        val.icon = "fa " + obj.icon;
                                    }
                                }
                            });
                        }

                        if (!isActivated && activeID && (val.id == activeID)) {
                            val.active = 1;
                            /* only one node can be active */
                            isActivated = true;
                        }
                    });

                    // restructure json for fancyTree
                    var dataArr = [];

                    for (var i in _root) {
                        dataArr.push(_root[i]);
                    }
                    _root = treeSort({
                        q: dataArr
                    });

                    _root = buildTree({
                        q: _root
                    });

                    if (data.row && data.row.length > 0) {
                        util.noDataMessage.hide(configJSON.regionID);
                    } else {
                        util.noDataMessage.hide(configJSON.regionID);
                        util.noDataMessage.show(configJSON.regionID, configJSON.noDataMessage);
                    }

                    return _root;

                } catch (e) {
                    util.loader.stop(configJSON.regionID, true);
                    $(configJSON.regionID).empty();
                    util.errorMessage.show(configJSON.regionID, configJSON.errMessage);
                    apex.debug.error({
                        "fct": util.featureDetails.name + " - " + "prepareData",
                        "msg": "Error while try to prepare data for tree",
                        "err": e,
                        "featureDetails": util.featureDetails
                    });
                }
            }

            function updateTree(data) {
                var _root = prepareData(data);
                var tree = getTree();
                tree.reload(_root);

                if (configJSON.autoExpand2Level > 0) {
                    $(configJSON.regionID).fancytree("getRootNode").visit(function (node) {
                        if (node.getLevel() < configJSON.autoExpand2Level) {
                            node.setExpanded(true);
                        }
                    });
                }

                if (util.isDefinedAndNotNull(searchItemName)) {
                    var startVal = apex.item(searchItemName).getValue();
                    if (util.isDefinedAndNotNull(startVal) && startVal.length > 0) {
                        filterTree();
                    }
                }

                markNodesWihChildren();
                openParentOfSelected();
                util.loader.stop(configJSON.regionID, true);
            }

            function saveExpandedNodes() {
                if (util.isDefinedAndNotNull(configJSON.expandedNodesItem)) {
                    var root = getTree().getRootNode();
                    var arr = [];
                    root.visit(function (node) {
                        if (node.expanded) {
                            arr.push(node.data.id);
                        }
                    });

                    apex.item(configJSON.expandedNodesItem).setValue(arr.join(":"));
                }
            }

            function drawTree(data) {
                var _root = prepareData(data);

                // draw fancyTree
                $(configJSON.regionID).fancytree({
                    extensions: ["glyph", "filter"],
                    quicksearch: true,
                    clones: {
                        highlightClones: true
                    },
                    nodata: false,
                    activeVisible: configJSON.openParentOfActiveNode,
                    escapeTitles: configJSON.escapeHTML,
                    focusOnSelect: true,
                    titlesTabbable: true,
                    checkbox: configJSON.enableCheckBox,
                    toggleEffect: configJSON.animationDuration,
                    selectMode: configJSON.selectMode,
                    debugLevel: 0, // 0:quiet, 1:normal, 2:debug
                    keyboard: configJSON.enableKeyBoard, // Support keyboard navigation.
                    quicksearch: configJSON.enableQuicksearch, // Navigate to next node by typing the first letters.
                    glyph: {
                        preset: "awesome4",
                        map: {
                            _addClass: "fa",
                            checkbox: configJSON.checkbox,
                            checkboxSelected: configJSON.checkboxSelected,
                            checkboxUnknown: configJSON.checkboxUnknown,
                            dragHelper: "fa-arrow-right",
                            dropMarker: "fa-long-arrow-right",
                            error: "fa-warning",
                            expanderClosed: "fa-caret-right",
                            expanderLazy: "fa-angle-right",
                            expanderOpen: "fa-caret-down",
                            loading: "fa-spinner fa-pulse",
                            nodata: "fa-meh-o",
                            noExpander: "",
                            radio: "fa-circle-thin",
                            radioSelected: "fa-circle",
                            doc: "fa-file-o",
                            docOpen: "fa-file-o",
                            folder: "fa-folder-o",
                            folderOpen: "fa-folder-open-o"
                        }
                    },
                    filter: {
                        autoApply: true, // Re-apply last filter if lazy data is loaded
                        autoExpand: configJSON.search.autoExpand, // Expand all branches that contain matches while filtered
                        counter: configJSON.search.counter, // Show a badge with number of matching child nodes near parent icons
                        fuzzy: false, // Match single characters in order, e.g. 'fb' will match 'FooBar'
                        hideExpandedCounter: true, // Hide counter badge if parent is expanded
                        hideExpanders: false, // Hide expanders if all child nodes are hidden by filter
                        highlight: configJSON.search.highlight, // Highlight matches by wrapping inside <mark> tags
                        leavesOnly: configJSON.search.leavesOnly, // Match end nodes only
                        nodata: false, // Display a 'no data' status node if result is empty
                        mode: configJSON.search.hideUnmatched ? "hide" : "dimm" // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
                    },
                    source: _root,
                    init: function (event, data) {
                        markNodesWihChildren();
                        openParentOfSelected();
                        if (configJSON.setItemsOnInit) {
                            saveExpandedNodes();
                            setItems();
                        }
                    },
                    collapse: function (event, data) {
                        saveExpandedNodes();
                        $(eventsBindSel).trigger("collapsed", data.node);
                    },
                    expand: function (event, data) {
                        markNodesWihChildren();
                        saveExpandedNodes();
                        $(eventsBindSel).trigger("expanded", data.node);
                    },
                    // if select an item check different types from config json and set value to the items
                    select: function (event, data) {
                        apex.debug.info({
                            "fct": util.featureDetails.name + " - " + "drawTree",
                            "selectEvent": event,
                            "selectData": data,
                            "featureDetails": util.featureDetails
                        });
                        markNodesWihChildren(true);
                        if (data.node.extraClasses != '') {
                            if ($(data.node.li).find('.fancytree-node').hasClass('fancytree-selected'))
                                $('.' + data.node.extraClasses).addClass('fancytree-selected');
                            else
                                $('.' + data.node.extraClasses).removeClass('fancytree-selected');
                        }
                        setItems();
                    },
                    click: function (event, data) {
                        if (data.targetType === "title" || data.targetType === "icon") {
                            if (data.node && data.node.data) {
                                var nodeData = data.node.data;
                                if (util.isDefinedAndNotNull(nodeData.link)) {
                                    util.link(nodeData.link);
                                } else if (data.node.checkbox === 1) {
                                    data.node.toggleSelected();
                                }
                            }
                        }
                    },
                    beforeActivate: function (event, data) {
                        if (configJSON.setActiveNode) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    activate: function (event, data) {
                        if (data.node && data.node.data) {
                            var nodeData = data.node.data;
                            if (util.isDefinedAndNotNull(nodeData.value)) {
                                apex.item(activeNodeItemName).setValue(nodeData.value);
                            }
                        }
                        markNodesWihChildren(true);
                    }
                });

                if (util.isDefinedAndNotNull(searchItemName)) {
                    if (configJSON.search.debounce.enabled) {
                        $("#" + searchItemName).keyup(util.debounce(function () {
                            filterTree();
                        }, configJSON.search.debounce.time));
                    } else {
                        $("#" + searchItemName).keyup(function () {
                            filterTree();
                        });
                    }

                    $("#" + searchItemName).on("change", function (e) {
                        filterTree();
                    });

                    var startVal = apex.item(searchItemName).getValue();
                    if (util.isDefinedAndNotNull(startVal) && startVal.length > 0) {
                        filterTree();
                    }
                }

                if (configJSON.autoExpand2Level > 0) {
                    $(configJSON.regionID).fancytree("getRootNode").visit(function (node) {
                        if (node.getLevel() < configJSON.autoExpand2Level) {
                            node.setExpanded(true);
                        }
                    });
                }

                util.loader.stop(configJSON.regionID, true);

                /* expand tree */
                $(eventsBindSel).on("expandAll", function () {
                    apex.debug.info({
                        "fct": util.featureDetails.name + " - " + "drawTree",
                        "msg": "expandAll fired",
                        "featureDetails": util.featureDetails
                    });
                    getTree().expandAll();
                });

                /* collapse tree */
                $(eventsBindSel).on("collapseAll", function () {
                    apex.debug.info({
                        "fct": util.featureDetails.name + " - " + "drawTree",
                        "msg": "collapseAll fired",
                        "featureDetails": util.featureDetails
                    });
                    getTree().expandAll(false);
                });

                /* selectAll tree */
                $(eventsBindSel).on("selectAll", function () {
                    apex.debug.info({
                        "fct": util.featureDetails.name + " - " + "drawTree",
                        "msg": "selectAll fired",
                        "featureDetails": util.featureDetails
                    });
                    getTree().selectAll(true);
                });

                /* unselectAll tree */
                $(eventsBindSel).on("unselectAll", function () {
                    apex.debug.info({
                        "fct": util.featureDetails.name + " - " + "drawTree",
                        "msg": "unselectAll fired",
                        "featureDetails": util.featureDetails
                    });
                    getTree().selectAll(false);
                });

                /* expandSelected tree */
                $(eventsBindSel).on("expandSelected", function () {
                    apex.debug.info({
                        "fct": util.featureDetails.name + " - " + "drawTree",
                        "msg": "expandSelected fired",
                        "featureDetails": util.featureDetails
                    });
                    openParentOfSelected();
                });
            };

            function filterTree() {
                var num;
                var tree = getTree();
                var sStr = apex.item(searchItemName).getValue();

                num = tree.filterBranches.call(tree, sStr);

                util.noDataMessage.hide(configJSON.regionID);
                if (num === 0) {
                    util.noDataMessage.show(configJSON.regionID, configJSON.noDataMessage);
                }
            }

            function setItems() {
                if (configJSON.typeSettings) {
                    var tmpStore = [];
                    configJSON.typeSettings.forEach(function (obj) {
                        tmpStore.push(util.copyJSONObject(obj));
                    });

                    var selNodes = getTree().getSelectedNodes();

                    $.each(selNodes, function (i, data) {
                        tmpStore.forEach(function (obj, idx) {
                            if (obj.id) {
                                if (data.type) {
                                    if (data.type == obj.id) {
                                        if (tmpStore[idx].data === undefined) {
                                            tmpStore[idx].data = [];
                                        }
                                        if (tmpStore[idx].data.indexOf(data.data.value) === -1) {
                                            if ((data.data.value && configJSON.selectMode != 3) || data.parent.selected === false || data.parent.li === null || configJSON.forceSelectionSet === true) {
                                                tmpStore[idx].data.push(data.data.value);
                                            }
                                        }
                                    }
                                } else {
                                    apex.debug.error({
                                        "fct": util.featureDetails.name + " - " + "setItems",
                                        "msg": "type in not set in data",
                                        "featureDetails": util.featureDetails
                                    });
                                }
                            } else {
                                apex.debug.error({
                                    "fct": util.featureDetails.name + " - " + "setItems",
                                    "msg": "id is not defined in config json in types. Please check help for config json.",
                                    "featureDetails": util.featureDetails
                                });
                            }
                        });
                    });

                    tmpStore.forEach(function (obj) {
                        if (obj.storeItem) {
                            if (obj.data && obj.data.length > 0) {
                                obj.data.sort(sortNumber);
                                apex.item(obj.storeItem).setValue( obj.data.join(":"));
                            } else {
                                apex.item(obj.storeItem).setValue(null);
                            }

                        } else {
                            apex.debug.error({
                                "fct": util.featureDetails.name + " - " + "setItems",
                                "msg": "storeItem is not defined in config json in types. Please check help for config json.",
                                "featureDetails": util.featureDetails
                            });
                        }
                    });
                } else {
                    apex.debug.error({
                        "fct": util.featureDetails.name + " - " + "setItems",
                        "msg": "Types is not defined in config json but you have set setItemsOnInit: true or try to select a node. Please check help for config json.",
                        "featureDetails": util.featureDetails
                    });
                }
            }

            function markNodesWihChildren(removeAll) {
                if (configJSON.markNodesWithChildren) {
                    if (removeAll) {
                        $(configJSON.regionID).find(".fancytree-custom-icon").removeClass(configJSON.markerModifier);
                    }

                    var treeObj = getTree();
                    var selectedNodes = treeObj.getSelectedNodes();
                    $.each(selectedNodes, function (idx, el) {
                        $.each(el.getParentList(true), function (idxN, suEl) {
                            $(suEl.span).find(".fancytree-custom-icon").addClass(configJSON.markerModifier);
                        });
                    });

                    var activeNode = treeObj.getActiveNode();
                    if (util.isDefinedAndNotNull(activeNode)) {
                        $.each(activeNode.getParentList(true), function (idxN, suEl) {
                            $(suEl.span).find(".fancytree-custom-icon").addClass(configJSON.markerModifier);
                        });
                    }
                }
            }

            function openParentOfSelected() {
                if (configJSON.openParentOfSelected) {
                    var selNodes = getTree().getSelectedNodes();
                    $.each(selNodes, function (idx, el) {
                        $.each(el.getParentList(true), function (idxN, suEl) {
                            suEl.setExpanded(true);
                        })
                    });
                }
            }

            var eventsBindSel = "#" + regionID.substring(4);

            getData(drawTree);

            // bind dynamic action refresh
            $(eventsBindSel).bind("apexrefresh", function () {
                if ($(configJSON.regionID).children('span').length == 0) {
                    if (configJSON.localStorage.enabled) {
                        util.localStorage.remove(configJSON.localStorage.keyFinal, configJSON.localStorage.type);
                    }
                    getData(updateTree, true);
                }
            });

            // set timer if auto refresh is set
            if (configJSON.refresh > 0) {
                setInterval(function () {
                    if ($(configJSON.regionID).children('span').length == 0) {
                        if (configJSON.localStorage.enabled) {
                            util.localStorage.remove(configJSON.localStorage.keyFinal, configJSON.localStorage.type);
                        }
                        getData(updateTree, true);
                    }
                }, configJSON.refresh * 1000);
            }

        }
    };
};
