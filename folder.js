Folder = (function() {
    'use strict';

    function Folder(id, name) {
        this.id = id;
        this.name = name; // make 'new folder'
        this.children = [];

    }

    Folder.prototype.deleteChild = function (id) {
        for (var i in this.children) {
            if (this.children[i].getId() == id) {
                this.children.splice(i, 1);
                return;
            }
        }

    }

    Folder.prototype.rename = function (newName) {
        this.name = newName;
    }

    Folder.prototype.addChild = function (item) {
        this.children.push(item);
    }

    Folder.prototype.findChild = function (id) {
        for(var i = 0; i < this.children.length; i++) {
            if(this.children[i].getId() == id) {
                return this.children[i];
            }
        }
    }

    Folder.prototype.getChildren = function () {
        return this.children;
    }

    Folder.prototype.getId = function () {
        return this.id;
    }

    Folder.prototype.getType = function () {
        return 'folder';
    }

    return Folder;
})();