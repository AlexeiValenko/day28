FileSystem = (function() {
    'use strict';

    var ROOT = 0;
    var SPLIT_SIGN = '/';

    var treatedNodes = 0;
    var tmpLastId = 0;
    var self;

    function FileSystem() {
        self = this;
        this.fsStorage = [];
        this.lastId = 0 ;

        readSystemFromFile();

    }

// API

    FileSystem.prototype.addFolder = function(name, parentId) {
        var parent = this.getItem(parentId);
        var name = uniqueName(parent, 'New Folder');
        var folder = new Folder(++this.lastId, name);
        if(parent) parent.addChild(folder);
        saveSystemToFile();
        return folder;
    }

    FileSystem.prototype.addFile = function(name, parentId, content) {
        var parent = this.getItem(parentId);
        var name = uniqueName(parent, 'New File');
        var file = new File(++this.lastId, name, content);
        parent.addChild(file);
        saveSystemToFile();
        return file;
    }

    FileSystem.prototype.renameItem = function(id, newName) {
        if(id == ROOT) return false;
        if(newName.indexOf('/') > -1 ) throw new Error('Contains /', 1);
        var parent = findParent(this.fsStorage, id);
        if(usedName(parent,newName)) {
            throw new Error('Used name', 2);
        }

        var item = findById(this.fsStorage, id);
        item.rename(newName);
        saveSystemToFile();
        return item;
    }

    FileSystem.prototype.deleteItem = function(id) {
        if(id == ROOT) return false;
        var parent = findParent(this.fsStorage, id);
        if(parent) parent.deleteChild(id);
        saveSystemToFile();
    }

    FileSystem.prototype.getItem = function(lookingFor) {
        if(!lookingFor) {
            return this.fsStorage[ROOT];
        }

        var id = Number(lookingFor);

        if(isNaN(id)) {
            var pathArray = lookingFor.split(SPLIT_SIGN);
            var item = getItemByPathRecursevly(pathArray,this.fsStorage[0]);
            return getItemByPathRecursevly(pathArray,this.fsStorage[0]);
        }

        var item = findById(this.fsStorage, id);
        if (item) return item;
        else return undefined;

    }

    FileSystem.prototype.getPath = function(id) {
        return findFullPathRecursevly(this.fsStorage, id);
    }

    FileSystem.prototype.getParent = function(id) {
        return findParent(this.fsStorage, id);
    }

// Inner functions

    function saveSystemToFile() {
        var flatSystem = makeSystemFlat();
        localStorage.setItem('file_system', JSON.stringify(flatSystem));
    };

    function makeSystemFlat() {
        var clone = {};
        var flatSystem = [];

        clone['id'] = ROOT;
        clone['name'] = 'root';
        clone['type'] = 'folder';
        clone['father'] = null;
        flatSystem.push(clone);
        putChildrensToFlat(flatSystem, self.fsStorage[0]);
        return flatSystem;
    }

    function putChildrensToFlat(flatSystem, father) {
        var children = father.getChildren();
        children.forEach(function (node) {
            var clone = {};
            clone['id'] = node.getId();
            clone['name'] = node.name;
            clone['type'] = node.getType();
            clone['father'] = father['id'];
            if(clone['type'] == 'file') clone['content'] = node.getContent();
            flatSystem.push(clone);
            if (node.getType() == 'folder') putChildrensToFlat(flatSystem, node);
        })
    }

    function readSystemFromFile() {
        self.fsStorage = [];
        tmpLastId = 0;
        treatedNodes = 0;

        try {
            var flatSystem = JSON.parse(localStorage.getItem('file_system'));
            checkIdsAreUnique(flatSystem);
            makeSystemTree(flatSystem);
            if (treatedNodes < flatSystem.length) throw new Error("Extra data");
            self.lastId = tmpLastId;
        } catch (e) {
            self.fsStorage = [];
            var root = new Folder(ROOT, 'root');
            self.fsStorage.push(root);
        }
    }

    function checkIdsAreUnique(flatSystem) {
        var tmp = [];
        for(var i = 0; i < flatSystem.length; i++) {
            var id = flatSystem[i].id;
            if (!id && tmp.includes(id)) throw new Error('Not unique id');
            tmp.push(id);
        }
    }

    function makeSystemTree(flatSystem) {
        if (flatSystem.length == 0) {
            throw new Error('Empty system storage');
        }

        for (var i = 0; i < flatSystem.length; i++) {
            if (flatSystem[i].id == 0) {  // find root
                nodeTreatment(self.fsStorage, flatSystem[i]);
                break;
            }
        }
        if (!self.fsStorage[0]) throw new Error('Wrong fields');
        addToSystemTreeChilds(self.fsStorage[0], flatSystem);
    }

    function nodeTreatment(container, node) {
        if (!checkFields(node)) throw new Error('Wrong fields');
        var item;
        if (node.type == 'folder') {
            item = new Folder(node.id, node.name);
        } else {
            item = new File(node.id, node.name, node.content);
        }
        container.push(item);
        updateLastId(node.id);
        treatedNodes++;
        return item;
    }

    function updateLastId(newId) {
        tmpLastId = newId > tmpLastId ? newId : tmpLastId;
    }

    function addToSystemTreeChilds(father, flatSystem) {
        flatSystem.forEach(function (child, index) {
            if (child['father'] == father.getId()) {
                var item = nodeTreatment(father.getChildren(), child);
                if (child.type == 'folder') {
                    addToSystemTreeChilds(item, flatSystem);
                }
            }
        });
    }

    function checkFields(node) {
        return 'id' in node && 'father' in node && 'type' in node && 'name' in node &&
            ((node.type == 'file' && 'content' in node ) || node.type == 'folder');
    }

    function findById(array, id) {
        var item;
        for (var i = 0; i < array.length; i++) {
            if (array[i].getId() == id) return array[i];
            if (array[i].getType() == 'folder') {
                item = findById(array[i].getChildren(), id);
                if (item) return item;
            }
        }
    }

    function findParent(array, id) {
        for (var i in array) {
            if(array[i].getType() == 'file') {
                continue;
            }
            if (haveChildWithId(array[i].getChildren(), id)) {
                return array[i];
            } else {
                var resultFromChild = findParent(array[i].getChildren(), id);
                if (resultFromChild != 0) return resultFromChild;
            }
        }
        return 0;
    }

    function haveChildWithId(array, id) {
        for (var i in array) {
            if (array[i].getId() == id) return true;
        }
        return false;
    }

    function findFullPathRecursevly(array, id) {
        for(var i = 0; i < array.length; i++ ) {
            if (array[i].getId() == id) {
                return array[i].name;
            } else {
                if(array[i].getType() == 'folder') {
                    var resultFromChild = findFullPathRecursevly(array[i].getChildren(), id);
                    if (resultFromChild != '') return array[i].name + '/' + resultFromChild;
                }
            }
        }

        return '';
    }

    function getItemByPathRecursevly(path,current) {
        if(path[0] == current.name) {
            if(path.length == 1) return current;
            path.shift();
            if(current.getType == 'file') return undefined;
            for(var i = 0; i < current.getChildren().length; i++) {
                var item = getItemByPathRecursevly(path,current.getChildren()[i]);
                return item;
            }
        }
    }

    function usedName(father, name) {
        var children = father.getChildren();
        for (var i in children) {
            if (children[i].name == name) {
                return true;
            }
        }
        return false;
    }

    function uniqueName(father, name) {
        var suffix = '';
        if (usedName(father, name)) {
            suffix = 1;
            while (usedName(father, name + suffix)) {
                suffix++;
            }
        }
        return name + suffix;
    }


    return FileSystem;
})();