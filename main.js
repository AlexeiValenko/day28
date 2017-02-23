(function() {
    'use strict';

    var fileSystem = new FileSystem();
    var myHistory = new History(fileSystem);

    var ui = new UserInterface(fileSystem, myHistory);

})();