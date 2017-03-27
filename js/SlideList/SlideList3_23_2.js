define([
  'dojo/_base/declare',
  'dojo/_base/lang',

  'dojo/dom-style',
  "dojo/dom-construct",


  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',

  'dojo/text!./templates/SlideList.html',

  './SlideItem',

], function(
  declare, lang,
  domStyle, domConstruct,
  _WidgetBase, _TemplatedMixin, template,
  SlideItem
) {

  var slideList = declare('SlideList', [_WidgetBase, _TemplatedMixin], {

    declaredClass: "esri.widgets.SlideList",

    templateString: template,

    options: {
      popTemp: null,
      queryFeat: null,
      features: null,
      lyrView: null,
      scene: null,
      view: null,
      color: "#05668D"
    },

    //--------------------------------------------------------------------------
    //
    //  Lifecycle
    //
    //--------------------------------------------------------------------------

    constructor: function(options, srcRefNode) {
      // mix in settings and defaults
      lang.mixin(this.options, options);
      // widget node
      this.domNode = srcRefNode;
      this.scene = this.options.scene;
      this.view = this.options.view;
      this.color = this.options.color;
    },

    postCreate: function() {
      this.inherited(arguments);
    },

    startup: function() {
      this.inherited(arguments);
      this._updateList();
    },

    destroy: function() {
      this.scene = null;
      this.inherited(arguments);
    },

    _updateList: function() {
      var slides = this.scene.presentation.slides;
      var node = this.contentNode;
      if (slides.length === 0) {
        var msg = "<span class='panelMsg'>";
        msg += "No slides";
        msg += "</span>";
        node.innerHTML = msg;
        return;
      }
      domStyle.set(node, "width", slides.length * 130 + "px");
      slides.forEach(lang.hitch(this, function(slide, index) {
        this._addSlideItem(slide, index);
      }));
    },

    _addSlideItem: function(slide, index) {
      var options = {
        scene: this.scene,
        slide: slide,
        index: index,
        color: this.color
      };
      var slideItem = new SlideItem(options);
      slideItem.on('click', lang.hitch(this, this._applySlide, slide, index));
      slideItem.placeAt(this.contentNode);
    },

    _applySlide: function(slide, index) {
      slide.visibleLayers = this.scene.allLayers
      slide.applyTo(this.view);
      console.log(index, slide);

      var slideNum = index + 1;
      console.log("show popup!");
      var slideLyr = this.view.map.layers.items;

//      console.log(slideLyr);
      var result = this.features[index];
      this.popTemp.title = setTitleInfo();
      this.popTemp.content = setContentInfo();
      this.popTemp.overwriteActions = true;

      function setTitleInfo() {
        return result.attributes.shortAlias;
      }

      function setContentInfo() {
        var name = result.attributes.name;

        var panelBullets = "";
        for (i = 1; i < 7; i++) {
          var currentBullet = result.attributes['bullet' + i];
          if (currentBullet != null) {
            var listItem = "<li class='bullet'>" + currentBullet + "</li>";
            panelBullets = panelBullets + listItem;
          }
        }

        var node = domConstruct.create("div", {
          innerHTML: "panelBullets"
        });
        console.log(node);
        return panelBullets;
      }

      result.popupTemplate = this.popTemp;
      console.log(this.popTemp);
      console.log(result);
      this.view.popup.open({
        features: [result]
      });
    }

  });

  return slideList;
});
