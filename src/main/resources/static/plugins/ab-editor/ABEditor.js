var ABEditor = {};

ABEditor.replaceMarkDownHTMLImg = function (html) {
    var reg = /<img src="(.*?)" alt="(.*?)\s*">?/img;
    var match = null;

    while (match = reg.exec(html)) {
        if (match.length == 3) {
            var imgStr = match[0];

            var start = html.substring(0, match.index);// 截取起始部分字符串

            var end = html.substring(match.index + imgStr.length);// 截取尾部

            var imgSrc = match[1]; // 图片地址

            var imgAlt = match[2]; // 图片alt

            var imgWidth = "";// 图片宽

            var imgHeight = "";// 图片高

            if (imgAlt != '' && imgAlt.indexOf("=") != -1) {
                var strs = imgAlt.substring(imgAlt.lastIndexOf('=') + 1).split("*");

                if (strs.length == 2) {
                    imgWidth = strs[0] + "px";
                    imgHeight = strs[1] + "px";

                    imgAlt = imgAlt.substring(0, imgAlt.lastIndexOf('='));
                }

            }

            html = start + "<img src='" + imgSrc + "' alt='" + imgAlt.trim() + "' width='" + imgWidth + "' height='" + imgHeight + "' />" + end;
        }
    }

    return html;
};

(function ($) {
    $.fn.ABEditor = function (options) {

        var items = options.items;

        var editorElement = $(this);

        var width = options.width;

        var height = options.height;

        var fileUploadURL = options.url;

        var stickerGroupApi = options.sticker_group_api;

        var stickerListApi = options.sticker_list_api;

        if (!stickerGroupApi) {
            stickerGroupApi = "./api/ab-editor/sticker_group.php";
        }

        if (!stickerListApi) {
            stickerListApi = "./api/ab-editor/sticker_list.php";
        }

        if (!height) {
            height = 350;
        }

        // 绑定表情包隐藏事件,当点击到非表情包区域自动隐藏
        $(document).bind('click', function (event) {
            var e = event || window.event;
            var $element = $(e.target || e.srcElement);

            if (editorElement.find(".editor_sticker")) {
                var editorSticker = editorElement.find(".editor_sticker");

                if (editorSticker.css('display') == 'block') {
                    if ($element.attr('item-name') != 'sticker' && $element.parents().closest('.editor_sticker').length === 0) {
                        editorElement.find(".editor_sticker").hide();
                    }
                }
            }
        });

        var allItems = {
            "sticker": {
                "onclick": function (item, editor) {
                    editorElement.find(".editor_sticker").toggle();// 显示或隐藏表情包

                    /**
                     * 获取所有表情包分组信息
                     * @returns {*}
                     */
                    function getStickerGroup() {
                        var stickerGroupStr = window.localStorage.getItem('stickerGroup');

                        var stickerGroup;

                        if (!stickerGroupStr || stickerGroupStr == '' || stickerGroupStr == '[]') {
                            $.ajax({
                                url: stickerGroupApi,
                                type: "GET",
                                dataType: "json",
                                async: false,
                                success: function (data) {
                                    stickerGroup = data.data;
                                    window.localStorage.setItem("stickerGroup", JSON.stringify(stickerGroup));
                                },
                                error: function (data) {
                                    alert('请求异常!');
                                }
                            });
                        } else {
                            stickerGroup = JSON.parse(stickerGroupStr);
                        }

                        return stickerGroup;
                    };

                    /**
                     * 获取表情包所有表情列表
                     * @param stickerName 表情包名称
                     * @returns {*}
                     */
                    function getStickerList(stickerName) {
                        var stickerListStr = window.localStorage.getItem('stickerList_' + stickerName);

                        var stickerList;

                        if (!stickerListStr || stickerListStr == '' || stickerListStr == '[]') {
                            $.ajax({
                                url: stickerListApi,
                                type: "GET",
                                dataType: "json",
                                async: false,
                                data: {
                                    stickerName: stickerName
                                },
                                success: function (data) {
                                    stickerList = data.data;
                                    window.localStorage.setItem("stickerList_" + stickerName, JSON.stringify(stickerList));
                                },
                                error: function (data) {
                                    alert('请求异常!');
                                }
                            });
                        } else {
                            stickerList = JSON.parse(stickerListStr);
                        }

                        return stickerList;
                    };

                    var stickerGroup = getStickerGroup();

                    if (stickerGroup && stickerGroup.length > 0) {
                        editorElement.find('.editor_sticker_footer').html(function () {
                            var stickerGroupStr = "<ul>";
                            $.each(stickerGroup, function (idx, val) {
                                stickerGroupStr += "<li class='" + (idx == 0 ? "current" : "") + "'>" +
                                    "   <img src='" + (idx == 0 ? val.clicked_url : val.normal_url) + "' " +
                                    "title='" + val.group_name + "'" +
                                    " on-img-url='" + val.clicked_url + "'" +
                                    " out-img-url='" + val.normal_url + "'" +
                                    " stickerName='" + val.sticker_name + "' " +
                                    " img-width='" + (val.hasOwnProperty('img-width') ? val['img-width'] : "") + "'" +
                                    " img-min-width='" + (val.hasOwnProperty('img-min-width') ? val['img-min-width'] : "") + "'" +
                                    " img-height='" + (val.hasOwnProperty('img-width') ? val['img-height'] : "") + "'" +
                                    " img-min-height='" + (val.hasOwnProperty('img-min-width') ? val['img-min-height'] : "") + "'/>" +
                                    "</li>"
                            });

                            stickerGroupStr += "</ul>";

                            return stickerGroupStr;
                        });

                        var stickerGroupImg = editorElement.find('.editor_sticker_footer img');
                        stickerGroupImg.click(function () {
                            var currentStickerName = $(this).attr('stickerName');// 当前的表情包名称

                            renderSticker(currentStickerName);// 渲染表情包数据

                            $.each(stickerGroupImg, function (idx, val) {
                                val = $(val);

                                var parentLi = val.parent('li');
                                var stickerName = val.attr('stickerName');
                                var onImgUrl = val.attr('on-img-url');
                                var outImgUrl = val.attr('out-img-url');

                                if (currentStickerName == stickerName) {
                                    val.attr('src', onImgUrl);
                                    parentLi.addClass('current');
                                } else if (parentLi.hasClass('current')) {
                                    val.attr('src', outImgUrl);
                                    parentLi.removeClass('current');
                                }
                            });

                        });

                        /**
                         * 渲染表情包分页和图片列表信息
                         * @param stickerName
                         */
                        function renderSticker(stickerName) {
                            var stickerTempList = getStickerList(stickerName);

                            var pageNum = 1;// 当前页

                            var pageSize = 72; //每页显示数量

                            editorElement.find('.editor_sticker_page').html(function () {
                                var recordCount = stickerTempList.length;// 总记录数
                                var pageCount = Math.ceil(recordCount / pageSize);// 分页总数
                                var pageStr = "";

                                // 只有一页的表情包不需要分页
                                if (pageCount > 1) {

                                    for (var i = 0; i < pageCount; i++) {
                                        pageStr += "<span class='page_break " + (i == 0 ? "active" : "") + "' pageNum='" + (i + 1) + "'></span>";
                                    }

                                }

                                return pageStr;
                            });

                            editorElement.find('.editor_sticker_page span').click(function () {
                                renderStickerImages($(this).attr('pageNum'), pageSize);
                                $(this).siblings().removeClass('active');
                                $(this).addClass('active');
                            });

                            /**
                             * 分页渲染表情图片数据
                             * @param pageNum
                             * @param pageSize
                             */
                            function renderStickerImages(pageNum, pageSize) {
                                editorElement.find('.editor_sticker_images').html(function () {
                                    var stickerListStr = "";

                                    var pageStart = (pageNum - 1) * pageSize;

                                    var pageEnd = pageNum * pageSize;

                                    var recordCount = stickerTempList.length;// 总记录数

                                    var targetGroup = editorElement.find('.editor_sticker_footer img[stickername=' + stickerName + ']');

                                    var imgMinWidth = targetGroup.attr('img-min-width');

                                    var imgWidth = targetGroup.attr('img-width');

                                    var imgMinHeight = targetGroup.attr('img-min-height');

                                    var imgHeight = targetGroup.attr('img-height');

                                    var imgSizeStyle = "";

                                    if (imgMinWidth != '') {
                                        imgSizeStyle += "width:" + imgMinWidth + ";";
                                    }

                                    if (imgMinHeight != '') {
                                        imgSizeStyle += "height:" + imgMinHeight + ";";
                                    }

                                    // 分页输出表情图片
                                    for (var i = pageStart; i < (pageEnd > recordCount ? recordCount : pageEnd); i++) {
                                        var val = stickerTempList[i];

                                        stickerListStr += "<div class='sticker_face' style='" + imgSizeStyle + "'>" +
                                            "<img src='" + val.path + "' img-url='" + val.gif_path + "' img-width='" + imgWidth + "'" +
                                            " img-height='" + imgHeight + "' style='" + imgSizeStyle + "' />" +
                                            "</div>";
                                    }

                                    return stickerListStr;
                                }).find("img").mouseover(function () {
                                    setStickerUrl($(this), 'over');
                                }).mouseout(function () {
                                    setStickerUrl($(this), 'out');
                                }).click(function () {
                                    var imgWidth = $(this).attr('img-width').replace("px", "");
                                    var imgHeight = $(this).attr('img-height').replace("px", "");

                                    var imgSize = "";

                                    if (imgWidth != '' && imgHeight != '') {
                                        imgSize = "=" + imgWidth + "*" + imgHeight;
                                    }

                                    editor.replaceSelection("![" + imgSize + "]" + "(" + $(this).attr('src') + ") ");// 插入表情图片地址
                                    editorElement.find(".editor_sticker").hide();// 隐藏表情窗体
                                });

                                /**
                                 * 动态设置表情地址
                                 * @param element
                                 * @param action
                                 */
                                function setStickerUrl(element, action) {
                                    var imgUrl = element.attr('img-url');
                                    var srcURL = element.attr('src');

                                    if (imgUrl != null && imgUrl != '') {
                                        if ('over' == action) {
                                            element.height(element.height() + 5);
                                            element.width(element.width() + 5);
                                        } else {
                                            element.height(element.height() - 5);
                                            element.width(element.width() - 5);
                                        }

                                        element.attr('src', imgUrl);
                                        element.attr('img-url', srcURL);
                                    }
                                }
                            }

                            renderStickerImages(pageNum, pageSize);
                        };

                        renderSticker(stickerGroup[0].sticker_name);// 默认初始化第一个分组的表情包信息
                    }

                },
                "title": "插入表情"
            },
            "bold": {
                "onclick": function (item, editor) {
                    editor.replaceSelection("**" + editor.getSelection() + "**");
                },
                "title": "添加粗体"
            }
            ,
            "italic": {
                "onclick": function (item, editor) {
                    editor.replaceSelection("*" + editor.getSelection() + "*");
                },
                "title": "添加斜体"
            },
            "quote": {
                "onclick": function (item, editor) {
                    editor.replaceSelection("> " + editor.getSelection());
                },
                "title": "插入引用"
            },
            "link": {
                "onclick": function (item, editor) {
                    editor.replaceSelection("[" + editor.getSelection() + "](http://)");
                },
                "title": "添加链接"
            },
            "upload": {
                "title": "文件上传",
                "onclick": function (item, editor) {
                    item.find('upload input').fileupload({
                        dataType: 'json',
                        url: fileUploadURL,
                        done: function (e, resp) {
                            var data = resp.result;

                            if (data.error == 0) {
                                var prefix = data.isImage ? "!" : "";

                                var imgSize = "";

                                if (data.width && data.height) {
                                    imgSize = " =" + data.width + "*" + data.height;
                                }

                                editor.replaceSelection(prefix + "[" + data.filename + imgSize + "]" + "(" + data.url + ") ");
                            } else {
                                alert(data.message);
                            }
                        }
                    });

                    item.find('upload input')[0].click();
                }, "render": function () {
                    html += "\t\t<span item='upload' title='文件上传'>\n" +
                        "\t\t\t<upload>\n" +
                        "\t\t\t\t<svg><use xlink:href='#upload'></use></svg>\n" +
                        "\t\t\t\t<input type='file' name='file'/>" +
                        "\t\t\t</upload>\n" +
                        "\t\t</span>\n";
                }
            },
            "unordered-list": {
                "onclick": function (item, editor) {
                    editor.replaceSelection("* " + editor.getSelection());
                },
                "title": "添加无序列表"
            }
            ,
            "ordered-list": {
                "onclick": function (item, editor) {
                    editor.replaceSelection("1. " + editor.getSelection());
                },
                "title": "添加有序列表"
            },
            "view": {
                "onclick": function (item, editor) {
                    var editorInput = editorElement.find('.editor_input');
                    editorInput.toggle();
                    editorElement.find('.editor_output').css('width', editorInput.is(":hidden") ? "100%" : "50%");
                },
                "title": "预览"
            },
            "fullscreen": {
                "onclick": function (item, editor) {
                    editorElement.toggleClass('full_screen');

                    // 编辑器全屏后高度自适应
                    if (editorElement.hasClass('full_screen')) {
                        editor.setSize(editorElement.width(), editorElement.height() - item.height());
                    } else {
                        editor.setSize(width, height);
                    }
                },
                "title": "全屏"
            },
            "help": {
                "title": "帮助",
                "render": function () {
                    html += "\t\t<a title='帮助' target='_blank' href='https://www.baidu.com/s?ie=UTF-8&wd=markdown'>\n" +
                        "\t\t\t<svg><use xlink:href='#help'></use></svg>\n" +
                        "\t\t</a>\n";
                }
            }
        };

        if (!items) {
            // 默认工具栏
            items = ["sticker", "bold", "italic", "quote", "link", "upload", "unordered-list", "ordered-list", "view", "fullscreen", "help"];
        }

        editorElement.append(genSvgIcon());// 输出svg图标

        var html = "<div class='ab_editor'>\n" +
            "\t<div class='editor_toolbar'>\n";

        $.each(items, function (i, val) {
            if (allItems.hasOwnProperty(val)) {
                var item = allItems[val];

                // 单独渲染某项工具
                if (item.hasOwnProperty("render")) {
                    item['render']();
                } else {
                    html += "\t\t<span item='" + val + "' title='" + item['title'] + "'><svg item-name='" + val + "'><use item-name='" + val + "' xlink:href='#" + val + "'></use></svg></span>\n";
                }
            }
        });

        html += "\t\t<div class='editor_sticker'>\n" +
            "\t\t\t<div class='editor_sticker_images'></div>\n" +
            "\t\t\t<div class='editor_sticker_page'></div>\n" +
            "\t\t\t<div class='editor_sticker_footer'></div>\n" +
            "\t\t</div>\n";

        html += "\t</div>\n" +
            "\t<div class='editor_container'>\n";

        html += "\t\t<div class='editor_input'>\n" +
            "\t\t\t<textarea></textarea>\n" +
            "\t\t</div>\n" +
            "\t\t<div class='editor_output'></div>\n" +
            "\t</div>\n" +
            "</div>\n";

        editorElement.append(html);

        var editorToolbar = editorElement.find('.editor_toolbar');
        var toolBarItems = editorElement.find('span[item]');
        var editorArea = editorElement.find("textarea");
        var editorView = editorElement.find(".editor_output");
        var editorSticker = editorElement.find(".editor_sticker");

        editorSticker.css("top", editorToolbar.height() + 3);

        var editor = CodeMirror.fromTextArea(editorArea[0], {
            mode: 'gfm',
            lineNumbers: false,
            matchBrackets: true,
            lineWrapping: true,
            theme: 'base16-light',
            inputStyle: 'textarea',
            extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
        });

        var md = markdownit({
            html: false
        });

        function update(obj) {
            var content = obj.getValue();// 获取编辑器输入内容
            var html = md.render(content);// 获取渲染后的html代码片段

            editorView.html(ABEditor.replaceMarkDownHTMLImg(html));

            var imgs = editorView.find('img');

            imgs.load(function () {
                setMaxImageSize(this);
            });
        }

        /**
         * 图片宽高自适应，设置图片的最大宽度和高度
         * @param img
         */
        function setMaxImageSize(img) {
            var width = $(img).width() > 0 ? $(img).width() : img.naturalWidth;
            var height = $(img).height() > 0 ? $(img).height() : img.naturalHeight;
            var editorViewWidth = editorView.width();

            if (width > editorViewWidth) {
                // 计算出原图的比率
                var ratio = width / height;

                // 设置最大宽度为当前div的宽度-10
                var maxWidth = editorViewWidth - 10;

                // 用最大宽度和比率计算出最大高度
                var maxHeight = maxWidth / ratio;

                // 设置图片的最大允许宽高值
                $(img).width(maxWidth);
                $(img).height(maxHeight);
            }
        }

        editor.setSize(width, height);

        editorElement.find('.editor_output').height(height);

        editor.on('change', update);

        // 为所有的工具条的工具注册一个点击事件
        toolBarItems.click(function () {
            var itemName = $(this).attr("item");

            if (allItems.hasOwnProperty(itemName)) {
                var item = allItems[itemName];

                if (item.hasOwnProperty('onclick')) {
                    item['onclick']($(this), editor);// 触发每个工具的onclick方法
                    editor.focus();// 刷新编辑器光标位置
                }
            }
        });

        /**
         * 输出编辑器SVG图标
         * @returns {string}
         */
        function genSvgIcon() {
            return "<svg style='position: absolute; width: 0; height: 0; overflow: hidden;' version='1.1' xmlns='http://www.w3.org/2000/svg'>\n" +
                "    <defs>\n" +
                "        <symbol id='view' viewBox='0 0 32 32'>\n" +
                "            <path d='M16 7.53c-10.379 0-15.561 7.594-15.777 7.918-0.223 0.335-0.223 0.771 0 1.106 0.216 0.323 5.398 7.917 15.777 7.917s15.561-7.594 15.777-7.918c0.223-0.335 0.223-0.771 0-1.106-0.216-0.323-5.398-7.917-15.777-7.917zM16 22.477c-7.726 0-12.34-4.822-13.696-6.479 1.352-1.661 5.941-6.475 13.696-6.475 7.726 0 12.34 4.822 13.696 6.479-1.352 1.661-5.941 6.475-13.696 6.475zM16 11.516c-2.473 0-4.484 2.012-4.484 4.484s2.011 4.484 4.484 4.484 4.484-2.012 4.484-4.484-2.011-4.484-4.484-4.484zM16 18.491c-1.374 0-2.491-1.118-2.491-2.491s1.118-2.491 2.491-2.491 2.491 1.118 2.491 2.491-1.118 2.491-2.491 2.491z'></path>\n" +
                "        </symbol>\n" +
                "        <symbol id='sticker' viewBox='0 0 32 32'>\n" +
                "            <path d='M16 24.789c-3.756 0-6.911-2.254-8.188-5.559h16.376c-1.277 3.305-4.432 5.559-8.188 5.559zM10.366 14.423c-1.352 0-2.404-1.052-2.404-2.404s1.052-2.404 2.404-2.404 2.404 1.052 2.404 2.404-1.052 2.404-2.404 2.404zM21.634 14.423c-1.352 0-2.404-1.052-2.404-2.404s1.052-2.404 2.404-2.404 2.404 1.052 2.404 2.404-1.052 2.404-2.404 2.404zM16 28.845c7.061 0 12.845-5.784 12.845-12.845s-5.784-12.845-12.845-12.845-12.845 5.784-12.845 12.845 5.784 12.845 12.845 12.845zM16 0c8.864 0 16 7.136 16 16s-7.136 16-16 16-16-7.136-16-16 7.136-16 16-16z'></path>\n" +
                "        </symbol>\n" +
                "        <symbol id='fullscreen' viewBox='0 0 32 32'>\n" +
                "            <path d='M32 0v13l-5-5-6 6-3-3 6-6-5-5zM14 21l-6 6 5 5h-13v-13l5 5 6-6z'></path>\n" +
                "        </symbol>\n" +
                "        <symbol id='unordered-list' viewBox='0 0 32 32'>\n" +
                "            <path d='M12 2h20v4h-20v-4zM12 14h20v4h-20v-4zM12 26h20v4h-20v-4zM0 4c0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.209-1.791-4-4-4s-4 1.791-4 4zM0 16c0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.209-1.791-4-4-4s-4 1.791-4 4zM0 28c0 2.209 1.791 4 4 4s4-1.791 4-4c0-2.209-1.791-4-4-4s-4 1.791-4 4z'></path>\n" +
                "        </symbol>\n" +
                "        <symbol id='ordered-list' viewBox='0 0 32 32'>\n" +
                "            <path d='M11 26h20v4h-20zM11 14h20v4h-20zM11 2h20v4h-20zM5 0v8h-2v-6h-2v-2zM3 16.438v1.563h4v2h-6v-4.563l4-1.875v-1.563h-4v-2h6v4.563zM7 22v10h-6v-2h4v-2h-4v-2h4v-2h-4v-2z'></path>\n" +
                "        </symbol>\n" +
                "        <symbol id='edit' viewBox='0 0 32 32'>\n" +
                "            <path d='M5 0c-2.761 0-5 2.239-5 5 0 1.126 0.372 2.164 1 3l2 2 7-7-2-2c-0.836-0.628-1.874-1-3-1zM30 23l2 9-9-2-18.5-18.5 7-7 18.5 18.5zM9.638 11.362l14 14 1.724-1.724-14-14-1.724 1.724z'></path>\n" +
                "        </symbol>\n" +
                "        <symbol id='link' viewBox='0 0 32 32'>\n" +
                "            <path d='M29.187 2.933l-0.12-0.121c-2.813-2.812-7.415-2.812-10.228 0l-6.516 6.517c-2.812 2.812-2.812 7.415 0 10.227l0.12 0.12c0.234 0.234 0.482 0.446 0.739 0.641l2.386-2.386c-0.278-0.164-0.542-0.361-0.78-0.599l-0.121-0.121c-1.527-1.527-1.527-4.012 0-5.539l6.517-6.516c1.527-1.527 4.012-1.527 5.539 0l0.121 0.12c1.527 1.527 1.527 4.012 0 5.539l-2.948 2.948c0.512 1.264 0.754 2.611 0.733 3.955l4.559-4.559c2.812-2.812 2.812-7.415-0-10.227zM19.557 12.323c-0.234-0.234-0.482-0.446-0.739-0.641l-2.386 2.385c0.278 0.164 0.542 0.361 0.78 0.599l0.121 0.121c1.527 1.527 1.527 4.012 0 5.539l-6.517 6.517c-1.527 1.527-4.012 1.527-5.539 0l-0.121-0.121c-1.527-1.527-1.527-4.012 0-5.539l2.948-2.948c-0.512-1.264-0.754-2.611-0.733-3.955l-4.559 4.559c-2.812 2.812-2.812 7.415 0 10.228l0.12 0.12c2.813 2.812 7.415 2.812 10.228 0l6.516-6.517c2.812-2.812 2.812-7.415 0-10.228l-0.12-0.12z'></path>\n" +
                "        </symbol>\n" +
                "        <symbol id='bold' viewBox='0 0 32 32'>\n" +
                "            <path d='M22.996 15.023c1.339-1.591 2.147-3.643 2.147-5.88 0-5.041-4.102-9.143-9.143-9.143h-11.429v32h13.714c5.041 0 9.143-4.102 9.143-9.143 0-3.32-1.779-6.232-4.433-7.834zM11.429 4.571h3.625c1.999 0 3.625 2.051 3.625 4.571s-1.626 4.571-3.625 4.571h-3.625v-9.143zM17.107 27.429h-5.679v-9.143h5.679c2.087 0 3.786 2.051 3.786 4.571s-1.698 4.571-3.786 4.571z'></path>\n" +
                "        </symbol>\n" +
                "        <symbol id='italic' viewBox='0 0 32 32'>\n" +
                "            <path d='M29.714 0v2.286h-4.571l-11.429 27.429h4.571v2.286h-16v-2.286h4.571l11.429-27.429h-4.571v-2.286z'></path>\n" +
                "        </symbol>\n" +
                "        <symbol id='quote' viewBox='0 0 32 32'>\n" +
                "            <path d='M7.024 13.003c3.862 0 6.993 3.131 6.993 6.993s-3.131 6.993-6.993 6.993-6.993-3.131-6.993-6.993l-0.031-0.999c0-7.724 6.262-13.986 13.986-13.986v3.996c-2.668 0-5.177 1.039-7.064 2.926-0.363 0.363-0.695 0.75-0.994 1.156 0.357-0.056 0.723-0.086 1.096-0.086zM25.007 13.003c3.862 0 6.993 3.131 6.993 6.993s-3.131 6.993-6.993 6.993-6.993-3.131-6.993-6.993l-0.031-0.999c0-7.724 6.262-13.986 13.986-13.986v3.996c-2.668 0-5.177 1.039-7.064 2.926-0.363 0.363-0.695 0.75-0.994 1.156 0.357-0.056 0.723-0.086 1.096-0.086z'></path>\n" +
                "        </symbol>\n" +
                "        <symbol id='help' viewBox='0 0 32 32'>\n" +
                "           <path d='M14 22h4v4h-4zM22 8c1.105 0 2 0.895 2 2v6l-6 4h-4v-2l6-4v-2h-10v-4h12zM16 3c-3.472 0-6.737 1.352-9.192 3.808s-3.808 5.72-3.808 9.192c0 3.472 1.352 6.737 3.808 9.192s5.72 3.808 9.192 3.808c3.472 0 6.737-1.352 9.192-3.808s3.808-5.72 3.808-9.192c0-3.472-1.352-6.737-3.808-9.192s-5.72-3.808-9.192-3.808zM16 0v0c8.837 0 16 7.163 16 16s-7.163 16-16 16c-8.837 0-16-7.163-16-16s7.163-16 16-16z'></path>\n" +
                "        </symbol>\n" +
                "        <symbol id='upload' viewBox='0 0 32 32'>\n" +
                "            <path d='M21.334 16.532q0-0.233-0.15-0.384l-5.867-5.867q-0.15-0.15-0.384-0.15t-0.384 0.15l-5.85 5.85q-0.167 0.2-0.167 0.399 0 0.233 0.15 0.384t0.384 0.15h3.733v5.867q0 0.217 0.159 0.375t0.375 0.159h3.2q0.217 0 0.375-0.159t0.159-0.375v-5.867h3.734q0.217 0 0.375-0.159t0.159-0.375zM32 21.332q0 2.65-1.875 4.525t-4.525 1.875h-18.133q-3.083 0-5.275-2.192t-2.192-5.275q0-2.166 1.167-4t3.134-2.75q-0.034-0.5-0.034-0.717 0-3.533 2.5-6.033t6.033-2.5q2.6 0 4.759 1.45t3.142 3.849q1.184-1.033 2.767-1.033 1.767 0 3.017 1.25t1.25 3.017q0 1.267-0.683 2.3 2.166 0.516 3.558 2.258t1.392 3.975z'></path>\n" +
                "        </symbol>\n" +
                "    </defs>\n" +
                "</svg>";
        }

        return editor;
    };
})
(jQuery);