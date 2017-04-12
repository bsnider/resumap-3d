define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  "dojo/_base/array",


  'dojo/dom-style',
  "dojo/dom-construct",


  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/SlideList.html',

  './SlideItem',   "esri/request"

], function(
  declare, lang, arrayUtils,
  domStyle, domConstruct,
  _WidgetBase, _TemplatedMixin, template,
  SlideItem, esriRequest
) {

  var slideList = declare('SlideList', [_WidgetBase, _TemplatedMixin], {

    declaredClass: "esri.widgets.SlideList",

    templateString: template,

    options: {
      popTemp: null,
      lyrView: null,
      scene: null,
      view: null,
      color: "#6c6c6c"
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
      var iconArray = ["Esri", "Pima", "Arizona", "DHive", "UnitedWay",    "Hillel", "SitC", "TRU", "MichDNR", "BlockM"]
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
        var iconUrl = "icons/" + iconArray[index] + ".png";
        slide.thumbnail.url = iconUrl;
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
      var result = this.features[index];
      slide.visibleLayers = this.scene.allLayers
      slide.watch('_currentAnimation', function(evt1, evt2, evt3, evt4){
        console.log(evt1, evt2, evt3, evt4)
      });

      slide.applyTo(this.view).then(function(evt){
        console.log(result);
        var vtItemId = result.attributes.label;
        var vtLayer = app.sceneView.map.findLayerById("vtId");
        var vtUrl = "https://bradjsnider.maps.arcgis.com/sharing/rest/content/items/"+ vtItemId + "/resources/styles/root.json";
        vtLayer.loadStyle(vtUrl);
      });
      console.log(index, slide);

      var slideNum = index + 1;
      console.log("show popup!");
      var slideLyr = this.view.map.layers.items;

      var actions = [{
          id: "open-website",
          image: "icons/link.png",
          title: "Info"
        }]//setActionInfo//,
      overwriteActions: true
//      console.log(slideLyr);
      this.popTemp.title = setTitleInfo();
      this.popTemp.content = setContentInfo();
      this.popTemp.actions = actions;
      this.popTemp.overwriteActions = true;


      function setTitleInfo(){
        var name = result.attributes.shortAlias;
        var position = result.attributes.position;
        var location = result.attributes.city;
        var date = result.attributes.timespan;

        return "<h4 class='popup-header'><i class='fa fa-map-pin' aria-hidden='true' style='margin-left:20px; margin-right:10px;'></i><span style='white-space: nowrap;'>" + position + " &nbsp;&nbsp; |</span> &nbsp;&nbsp; <span style='white-space: nowrap;''>" + name + "</span></h4>";

      }
      function setContentInfo() {
        console.log(result);
        var name = result.attributes.shortAlias;
        var date = result.attributes.timespan;
        var location = result.attributes.city;

        var courseList= "";
        var subjectList= "";
        var panelBullets = "";
        for (i = 1; i < 7; i++) {
          var currentBullet = result.attributes['bullet' + i];
          if (currentBullet != null) {
            var listItem = "<p class='popup-bullet'><i class='fa fa-location-arrow fa-lg' aria-hidden='true'></i>  " + currentBullet + "</p>";
            panelBullets = panelBullets + listItem;
          }
        }
        if(name == "University of Michigan"){
          var courseArray = ["Environmental and Sustainable Engineering", "Environmental Justice", "Food, Land, and Society", "Conservation of Biological Diversity"];

          arrayUtils.forEach(courseArray, function(course){
            var listItem;
            listItem = "<p class='popup-bulcourselet'><i class='fa fa-book fa-lg' aria-hidden='true'></i> " + course + "</p>";
             courseList = courseList + listItem;
          });
          courseList = "Influential courses:" + courseList;
          console.log(courseList);
        }
        else if(name == "University of Arizona"){
          var courseArray = ["Remote sensing", "Geodata management", "Cartography", "Spatial statistics", "Scripting and Web GIS"];

          arrayUtils.forEach(courseArray, function(course){
            var listItem;
            listItem = "<p class='popup-course'><i class='fa fa-book fa-lg' aria-hidden='true'></i> " + course + "</p>";
             subjectList = subjectList + listItem;
          });
          subjectList = "Influential topics:" + subjectList;
          console.log(subjectList);
        }
        else if(name == "Esri"){
          var courseArray = ["Starting	Fresh	with	JavaScript	4.x:	Esri	User	Conference,	June	2016", "Building	Native	Apps	Using	AppStudio	for	ArcGIS:	Esri	Pre-Developer	Summit Hands-on	Training,	March	2016", "Debugging	offline	editing	using	the	ArcGIS	Runtime	SDK	for	iOS:	Esri	User	Conference,	July 2015"];

          arrayUtils.forEach(courseArray, function(course){
            var listItem;
            listItem = "<p class='popup-course'><i class='fa fa-tv fa-lg' aria-hidden='true'></i> &nbsp;&nbsp;" + course + "</p>";
             subjectList = subjectList + listItem;
          });
          subjectList = "Presentations:<br><br>" + subjectList;
          console.log(subjectList);
        }

        var contentFooter = "<h5 class='popup-footer'>" + location + " &nbsp;&nbsp; | &nbsp;&nbsp; " + date + "</h5>";

        var node = domConstruct.create("div", {
          innerHTML: panelBullets + courseList + subjectList + contentFooter
        });
        console.log(node);

        return panelBullets + courseList + subjectList + contentFooter;
      }







      result.popupTemplate = this.popTemp;
      console.log(this.popTemp);
      console.log(result);
      this.view.popup.open({
        features: [result]
      });
      console.log(this.view.map);
    }

  });

  return slideList;
});
