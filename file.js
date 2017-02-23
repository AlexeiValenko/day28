File = (function() {
    'use strict';

    function File(id, name, content) {
        this.name = name;
        this.id = id;
        this.content = content;

    }

    File.prototype.rename = function (newName) {
        this.name = newName;
    }

    File.prototype.setContent = function (content) {
        this.content = content;
    }

    File.prototype.getContent = function () {
        return this.content;
    }

    File.prototype.getId = function () {
        return this.id;
    }

    File.prototype.getType = function () {
        return 'file';
    }

    return File;
})();