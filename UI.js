UserInterface = (function($) {
    'use strict';

    var ROOT = 0;
    var menuUl;
    var fullSystemList;
    var content;
    var currentFile = {};
    var self;


    function UserInterface(fileSystem, myHistory) {
        this.fileSystem = fileSystem;
        this.myHistory = myHistory;
        self = this;


        $(document).ready(function () {
            content = $('.content');
            content.contextmenu(showContextMenu);
            fullSystemList = $('.list');
            //context menu
            menuUl = $('ul.contextMenu');
            $('.contextMenu > #newFolder').click(clickAddFolder);
            $('.contextMenu > #newFile').click(clickAddFile);
            $('.contextMenu > #rename').click(clickRename);
            $('.contextMenu > #delete').click(clickDelete);
            $(window).click(hideContextMenu);
            // path
            $('input#go').val('root');
            $('button#go').click(clickGo);
            // history
            $('button#back').click(clickBack);
            $('button#forward').click(clickForward);
            //files three
            makeThree(self.fileSystem.getItem(ROOT), fullSystemList);

            $(this).bind("contextmenu", function(e) {
                e.preventDefault();
            });
        });


    }


//  event handlers

    function clickFileOrFolder(e) {
        e.stopPropagation();
        hideContextMenu();

        var id = $(this).data('id');
        self.myHistory.addToHistory(id);
        expand(id, true);
        showContent(id);
        return false;
    }

    function clickExpander(e) {
        expand($(this).data('id'));
        hideContextMenu();
    }

    function clickAddFile(e) {
        e.stopPropagation();
        hideContextMenu();

        var id = $('.contextMenu').data('id');

        var father = self.fileSystem.getItem(id);
        var node = self.fileSystem.addFile('', father.getId(), '');

        var upperUl = $('ul[data-id=' + id + ']');
        var li = $('<li name="node" data-id="' + node.getId() + '"></li>');
        var link = $('<a href="" data-id="' + node.getId() + '">' + node.name + '</a></li>');
        $(link).contextmenu(showContextMenu);
        $(link).click(clickFileOrFolder);
        li.appendTo(upperUl);
        li.addClass("hiden");
        li.append(link);
        showContent(id);
        return false;
    }

    function clickAddFolder(e) {
        e.stopPropagation();
        hideContextMenu();

        var id = $('.contextMenu').data('id');

        var father = self.fileSystem.getItem(id);
        var node = self.fileSystem.addFolder('', father.getId());
        var upperUl = $('ul[data-id=' + id + ']');

        var li = $('<li name="node" data-id="' + node.getId() + '"></li>');
        var link = $('<a href="" data-id="' + node.getId() + '" data-type="' + node.getType() + '">'
            + node.name + '</a></li>');
        $(link).click(clickFileOrFolder);
        $(link).contextmenu(showContextMenu);
        li.appendTo(upperUl);

        var button = $('<button class="expand" data-id="' + node.getId() + '">+</button>');
        $(button).click(clickExpander);
        li.addClass('directory');
        li.append(button).append(link);
        var ul = $('<ul data-id="' + node.getId() + '" class="hiden"></ul>');
        li.append(ul);
        showContent(id);
        return false;
    }

    function clickDelete(e) {
        e.stopPropagation();
        hideContextMenu();

        var id = $('.contextMenu').data('id');
        var parent = self.fileSystem.getParent(id).getId();

        if (id == 0) {
            alert('You can not delete root');
            return false;
        }
        self.fileSystem.deleteItem(id);
        $('li[data-id=' + id + ']').remove();
        showContent(parent);
        return false;
    }

    function clickRename(e) {
        e.stopPropagation();
        hideContextMenu();

        var id = $('.contextMenu').data('id');
        if (id == 0) {
            alert('You can not rename root');
            return false;
        }

        setTimeout(function () {
            var done = false;
            var message = 'Insert new name';
            do {
                var name;
                name = prompt(message);
                if (name == null) return false;
                try {
                    var item = self.fileSystem.renameItem(id, name);
                    done = true;
                } catch(e) {
                    if(e.id == 1) message = 'Name can not contains "/", please insert another name.'
                    else message = 'Name should be unique in a folder, please insert another name.';
                }
            } while (!done);
            $('a[data-id=' + id + ']').text(name);
            showContent(self.fileSystem.getParent(id).getId());
        }, 10);
        return false;
    }

    function clickBack() {
        hideContextMenu();
        var id = self.myHistory.goBack();
        if(id != ABSENT) showContent(id);
        return false;
    }

    function clickForward() {
        hideContextMenu();
        var id = self.myHistory.goForward();
        if(id != ABSENT) showContent(id);
        return false;
    }

    function clickGo(e) {
        hideContextMenu();
        var path = $('input#path').val();
        var id = self.fileSystem.getItem(path).getId();
        if(id == ABSENT) {
            alert('Wrong path');
            return false;
        }
        showContent(id);
    }

    function clickSave(e) {
        hideContextMenu();
        currentFile.setContent($('textarea.content').val());
    }

    function clickCancel(e) {
        hideContextMenu();
        $('textarea.content').val(currentFile.getContent());
    }

    function showContextMenu(e) {
        e.stopPropagation();
        var id = $(e.currentTarget).attr('data-id');
        var type = $(e.currentTarget).attr('data-type');
        if( id == undefined || type == undefined) return false;
        $('ul.contextMenu').css('left', e.pageX - 10 + 'px');
        $('ul.contextMenu').css('top', e.pageY - 10 + 'px');
        $('ul.contextMenu').attr('data-id', id);
        $('ul.contextMenu').data('id', id);
        $('ul.contextMenu').attr('data-type', type);
        $('ul.contextMenu').css('display', 'block');
        return false;
    }

    function hideContextMenu() {
        $(menuUl).css('display', 'none');
    }


// presentation

    function makeThree(node, upperUl) {
        var li = $('<li name="node" data-id="' + node.getId() + '"></li>');
        var link = $('<a href="" data-id="' + node.getId() + '" data-type="' + node.getType() + '">'
            + node.name + '</a></li>');
        $(link).click(clickFileOrFolder);
        $(link).contextmenu(showContextMenu);
        li.appendTo(upperUl);

        if (node.getType() == 'folder') {
            var button = $('<button class="expand" data-id="' + node.getId() + '">+</button>');
            $(button).click(clickExpander);
            li.addClass('directory');
            li.append(button).append(link);
            var ul = $('<ul data-id="' + node.getId() + '" class="hiden"></ul>');
            li.append(ul);
            if (node.getChildren().length > 0) {
                node.getChildren().forEach(function (child) {
                    makeThree(child, ul);
                });
            }
        } else {
            li.addClass("hiden");
            li.append(link);
        }
    }

    function showContent(id) {
        var path = self.fileSystem.getPath(id);
        $('input.path').val(path);

        var item = $('li[data-id=' + id + ']');

        $(content).html('');
        $(content).attr('data-type','content');
        $(content).attr('data-id',id);

        currentFile = self.fileSystem.getItem(id);

        if (item.hasClass('folder') || item.hasClass('directory')) {
            var emptyUl = $('<ul data-type="content"></ul>');
            $(content).append(content);
            var children = self.fileSystem.getItem(id).getChildren();
            children.forEach(function (child) {
                addChildToContent(content, child);
            });
        } else {
            var fileContent = currentFile.getContent();
            var text = $('<textarea name="fileContent" class="content">' + fileContent + '</textarea>');
            var buttonSave = $('<button class="content">Save</button>');
            var buttonCancel = $('<button class="content">Cancel</button>');
            $(buttonSave).click(clickSave);
            $(buttonCancel).click(clickCancel);
            $(content).append(text).append(buttonCancel).append(buttonSave);
        }
    }

    function addChildToContent(content, node) {
        var link = $('<li data-id="' + node.getId() + '"  data-type="' + node.getType() + '" class="'
            + node.getType() + '"><span>' + node.name + '</span> </li>');
        $(link).click(clickFileOrFolder);
        $(link).contextmenu(showContextMenu);
        $(content).append(link);
    }

    function expand(id, expandOnly) {
        var button = $('button[data-id=' + id + ']');
        var ul = $('ul[data-id=' + id + ']');

        if ($(ul).hasClass('hiden')) {
            $(button).text('-');
            showDir(ul);
        } else if (!expandOnly) {
            $(button).text('+');
            hideDir(ul);
        }
    }

    function showDir(ul) {
        $(ul).removeClass("hiden");
    }

    function hideDir(ul) {
        $(ul).addClass("hiden");
    }



    return UserInterface;

})(jQuery);