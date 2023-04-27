 # Apex-Fancy-Tree-Select
 
![](https://img.shields.io/badge/ORACLE-APEX-success.svg) ![](https://img.shields.io/badge/Plug--in_Type-Region-orange.svg) ![](https://img.shields.io/badge/Avaiable%20for%20APEX-5.1.3%20or%20above-blue)

![Screenshot](https://github.com/RonnyWeiss/Apex-Fancy-Tree-Select/blob/master/screenshot.gif?raw=true)

This Plug-in is used to draw a FancyTree with select option. Selected nodes can be set into different APEX items. It has also the option to use it as read only tree and you can cache large trees in local storage on the client to save loading the data each time you refresh a page with the same tree. It's also possible to filter the tree with a search field.

The Plug-ins also supports different events:

*   **Expand Parents of selected Nodes all:** $("#static-tree-region-id-of-the-tree-region").trigger("expandSelected");
*   **Expand all:** $("#static-tree-region-id-of-the-tree-region").trigger("expandAll");
*   **Collapse all:** $("#static-tree-region-id-of-the-tree-region").trigger("collapseAll");
*   **Select all:** $("#static-tree-region-id-of-the-tree-region").trigger("selectAll");
*   **Unselect all:** $("#static-tree-region-id-of-the-tree-region").trigger("unselectAll");
*   **expand Tree to a specific Level (When you left data then configJSON is used):** $("#static-tree-region-id-of-the-tree-region").trigger("expandToLevel", 3);

The tree also supports apexbeforerefresh and apexafterefresh event that are available in dynamic actions.

For working Demo just click on:

https://apex.oracle.com/pls/apex/f?p=103428

If you like my stuff, donate me a coffee

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.me/RonnyW1)

**Important clarification: My work in the development team of Oracle APEX is in no way related to my open source projects or the plug-ins on apex.world! All plug-ins are built in my spare time and are not supported by Oracle!**