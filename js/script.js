var fancyTree = (function () {
    var util = {
        /**********************************************************************************
         ** required functions 
         *********************************************************************************/
        featureInfo: {
            name: "APEX-Fancy-Tree-Select",
            info: {
                scriptVersion: "2.0",
                utilVersion: "1.3.3",
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
        isAPEX: function () {
            if (typeof (apex) !== 'undefined') {
                return true;
            } else {
                return false;
            }
        },
        varType: function (pObj) {
            if (typeof pObj === "object") {
                var arrayConstructor = [].constructor;
                var objectConstructor = ({}).constructor;
                if (pObj.constructor === arrayConstructor) {
                    return "array";
                }
                if (pObj.constructor === objectConstructor) {
                    return "json";
                }
            } else {
                return typeof pObj;
            }
        },
        debug: {
            info: function () {
                if (util.isAPEX()) {
                    var arr = Array.from(arguments);
                    arr.unshift(util.featureInfo);
                    apex.debug.info.apply(this, arr);
                }
            },
            error: function () {
                var arr = Array.from(arguments);
                arr.unshift(util.featureInfo);
                if (util.isAPEX()) {
                    apex.debug.error.apply(this, arr);
                } else {
                    console.error.apply(this, arr);
                }
            }
        },
        /**********************************************************************************
         ** optinal functions 
         *********************************************************************************/
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
                util.debug.error({
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
                    util.debug.error({
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
                util.debug.error({
                    "msg": "Error while try to merge 2 JSONs into standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.",
                    "err": e,
                    "finalConfig": finalConfig
                });
            }
            return finalConfig;
        },
        setItemValue: function (itemName, value) {
            if (util.isAPEX()) {
                if (apex.item(itemName) && apex.item(itemName).node != false) {
                    apex.item(itemName).setValue(value);
                } else {
                    util.debug.error("Please choose a set item. Because the value (" + value + ") can not be set on item (" + itemName + ")");
                }
            } else {
                util.debug.error("Error while try to call apex.item");
            }
        },
        getItemValue: function (itemName) {
            if (!itemName) {
                return "";
            }

            if (util.isAPEX()) {
                if (apex.item(itemName) && apex.item(itemName).node != false) {
                    return apex.item(itemName).getValue();
                } else {
                    util.debug.error("Please choose a get item. Because the value could not be get from item(" + itemName + ")");
                }
            } else {
                util.debug.error("Error while try to call apex.item");
            }
        },
        printDOMMessage: {
            show: function (id, text, icon, color) {
                var div = $("<div></div>")
                    .css("margin", "12px")
                    .css("text-align", "center")
                    .css("padding", "35px 0")
                    .addClass("dominfomessagediv");

                var subDiv = $("<div></div>");

                var subDivSpan = $("<span></span>")
                    .addClass("fa")
                    .addClass(icon || "fa-info-circle-o")
                    .addClass("fa-2x")
                    .css("height", "32px")
                    .css("width", "32px")
                    .css("color", "#D0D0D0")
                    .css("margin-bottom", "16px")
                    .css("color", color || "inhherit");

                subDiv.append(subDivSpan);

                var span = $("<span></span>")
                    .text(text)
                    .css("display", "block")
                    .css("color", "#707070")
                    .css("text-overflow", "ellipsis")
                    .css("overflow", "hidden")
                    .css("white-space", "nowrap")
                    .css("font-size", "12px");

                div
                    .append(subDiv)
                    .append(span);

                $(id).append(div);
            },
            hide: function (id) {
                $(id).children('.dominfomessagediv').remove();
            }
        },
        link: function (link, tabbed) {
            if (tabbed) {
                window.open(link, "_blank");
            } else {
                return window.location = link;
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
        loader: {
            start: function (id, setMinHeight) {
                if (setMinHeight) {
                    $(id).css("min-height", "100px");
                }
                if (util.isAPEX()) {
                    apex.util.showSpinner($(id));
                } else {
                    /* define loader */
                    var faLoader = $("<span></span>");
                    faLoader.attr("id", "loader" + id);
                    faLoader.addClass("ct-loader");
                    faLoader.css("text-align", "center");
                    faLoader.css("width", "100%");
                    faLoader.css("display", "block");

                    /* define refresh icon with animation */
                    var faRefresh = $("<i></i>");
                    faRefresh.addClass("fa fa-refresh fa-2x fa-anim-spin");
                    faRefresh.css("background", "rgba(121,121,121,0.6)");
                    faRefresh.css("border-radius", "100%");
                    faRefresh.css("padding", "15px");
                    faRefresh.css("color", "white");

                    /* append loader */
                    faLoader.append(faRefresh);
                    $(id).append(faLoader);
                }
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
                util.debug.error({
                    "msg": "Error while try to copy object",
                    "err": e
                });
            }
        }
    };

    return {
        initTree: function (regionID, ajaxID, noDataMessage, errMessage, udConfigJSON, items2Submit, escapeHTML, searchItemName, activeNodeItemName) {
            util.debug.info({
                "module": "initTree",
                "arguments": {
                    "regionID": regionID,
                    "ajaxID": ajaxID,
                    "noDataMessage": noDataMessage,
                    "errMessage": errMessage,
                    "udConfigJSON": udConfigJSON,
                    "items2Submit": items2Submit,
                    "escapeHTML": escapeHTML,
                    "searchItemName": searchItemName,
                    "activeNodeItemName": activeNodeItemName
                }
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
                    "hideUnmatched": true
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

            var treeSort = function (options) {
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
                },
                buildTree = function (options) {
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
                },
                getData = function (sucFunction) {
                    util.loader.start(configJSON.regionID, true);
                    try {
                        apex.server.plugin(
                            configJSON.ajaxID, {
                                pageItems: configJSON.items2Submit
                            }, {
                                success: sucFunction,
                                error: function (d) {
                                    util.loader.stop(configJSON.regionID, true);
                                    $(configJSON.regionID).empty();
                                    util.errorMessage.show(configJSON.regionID, configJSON.errMessage);
                                    util.debug.error({
                                        "featureInfo": featureInfo,
                                        "module": "getData",
                                        "msg": "Error while try to get new data",
                                        "err": d
                                    });
                                },
                                dataType: "json"
                            });
                    } catch (e) {
                        util.debug.error({
                            "featureInfo": featureInfo,
                            "module": "getData",
                            "msg": "Error while try to get new data",
                            "err": e
                        });
                    }
                },
                sortNumber = function (a, b) {
                    return a - b;
                },
                prepareData = function (data) {
                    try {
                        // lower json from sql
                        var _root = util.convertJSON2LowerCase(data.row);

                        var activeID;
                        var isActivated = false;
                        if (util.isDefinedAndNotNull(activeNodeItemName)) {
                            activeID = util.getItemValue(activeNodeItemName);
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
                        util.debug.error({
                            "featureInfo": featureInfo,
                            "module": "prepareData",
                            "msg": "Error while try to prepare data for tree",
                            "err": e
                        });
                    }
                },
                updateTree = function (data) {
                    var _root = prepareData(data);
                    var tree = $(configJSON.regionID).fancytree('getTree');
                    tree.reload(_root);

                    if (configJSON.autoExpand2Level > 0) {
                        $(configJSON.regionID).fancytree("getRootNode").visit(function (node) {
                            if (node.getLevel() < configJSON.autoExpand2Level) {
                                node.setExpanded(true);
                            }
                        });
                    }

                    if (util.isDefinedAndNotNull(searchItemName)) {
                        var startVal = util.getItemValue(searchItemName);
                        if (util.isDefinedAndNotNull(startVal) && startVal.length > 0) {
                            filterTree();
                        }
                    }

                    markNodesWihChildren();
                    openParentOfSelected();
                    util.loader.stop(configJSON.regionID, true);
                },
                drawTree = function (data) {
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
                                setItems();
                            }
                        },
                        expand: function (event, data) {
                            markNodesWihChildren();
                        },
                        // if select an item check different types from config json and set value to the items
                        select: function (event, data) {
                            util.debug.info({
                                "selectEvent": event,
                                "selectData": data
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
                        beforeActivate: function (event, data) {
                            if (data.node && data.node.data) {
                                var nodeData = data.node.data;
                                if (util.isDefinedAndNotNull(nodeData.link)) {
                                    util.link(nodeData.link);
                                }
                            }
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
                                    util.setItemValue(activeNodeItemName, nodeData.value);
                                }
                            }
                            markNodesWihChildren(true);
                        }
                    });

                    if (util.isDefinedAndNotNull(searchItemName)) {
                        $("#" + searchItemName).on("keyup change", function (e) {
                            filterTree();
                        });

                        var startVal = util.getItemValue(searchItemName);
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
                        util.debug.info("expandAll fired");
                        $(configJSON.regionID).fancytree('getTree').expandAll();
                    });

                    /* collapse tree */
                    $(eventsBindSel).on("collapseAll", function () {
                        util.debug.info("collapseAll fired");
                        $(configJSON.regionID).fancytree('getTree').expandAll(false);
                    });
                };

            function filterTree() {
                var num;
                var tree = $.ui.fancytree.getTree(configJSON.regionID);
                var sStr = util.getItemValue(searchItemName);

                util.debug.info({
                    "tree": tree,
                    "sStr": sStr
                });

                num = tree.filterBranches.call(tree, sStr);

                util.noDataMessage.hide(configJSON.regionID);
                if (num === 0) {
                    util.noDataMessage.show(configJSON.regionID, configJSON.noDataMessage);
                }

                util.debug.info({
                    "num": num
                });
            }

            function setItems() {
                if (configJSON.typeSettings) {
                    var tmpStore = [];
                    configJSON.typeSettings.forEach(function (obj) {
                        tmpStore.push(util.copyJSONObject(obj));
                    });
                    $.each($(configJSON.regionID).fancytree('getTree').getSelectedNodes(), function (i, data) {
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
                                    util.debug.error({
                                        "featureInfo": featureInfo,
                                        "module": "setItems",
                                        "msg": "type in not set in data"
                                    });
                                }
                            } else {
                                util.debug.error({
                                    "featureInfo": featureInfo,
                                    "module": "setItems",
                                    "msg": "id is not defined in config json in types. Please check help for config json."
                                });
                            }
                        });
                    });

                    tmpStore.forEach(function (obj) {
                        if (obj.storeItem) {
                            if (obj.data && obj.data.length > 0) {
                                obj.data.sort(sortNumber);
                                util.setItemValue(obj.storeItem, obj.data.join(":"));
                            } else {
                                util.setItemValue(obj.storeItem, null);
                            }

                        } else {
                            util.debug.error({
                                "featureInfo": featureInfo,
                                "module": "setItems",
                                "msg": "storeItem is not defined in config json in types. Please check help for config json."
                            });
                        }
                    });
                } else {
                    util.debug.error({
                        "featureInfo": featureInfo,
                        "module": "setItems",
                        "msg": "Types is not defined in config json but you have set setItemsOnInit: true or try to select a node. Please check help for config json."
                    });
                }
            }

            function markNodesWihChildren(removeAll) {
                if (removeAll) {
                    $(configJSON.regionID).find(".fancytree-custom-icon").removeClass(configJSON.markerModifier);
                }
                if (configJSON.markNodesWithChildren) {
                    var treeObj = $(configJSON.regionID).fancytree('getTree');
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
                    var tree = $(configJSON.regionID).fancytree('getTree').getSelectedNodes();
                    $.each(tree, function (idx, el) {
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
                    getData(updateTree);
                }
            });

            // set timer if auto refresh is set
            if (configJSON.refresh > 0) {
                setInterval(function () {
                    if ($(configJSON.regionID).children('span').length == 0) {
                        getData(updateTree);
                    }
                }, configJSON.refresh * 1000);
            }

        }
    };
})();
