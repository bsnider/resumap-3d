var app;
var isMobile = false;
$(document).ready(function() {

  require(["esri/Map",
    "esri/Basemap",
    "esri/views/MapView",
    "esri/views/SceneView",

    "esri/widgets/Search",
    "esri/widgets/Zoom",
    "esri/widgets/Home",
    "esri/widgets/Locate",
    "esri/widgets/Compass",

    "esri/Camera",
    "esri/Viewpoint",
    "esri/geometry/Extent",

    "esri/core/watchUtils",
    "dojo/query",
    "esri/layers/FeatureLayer",

    "esri/layers/VectorTileLayer",
    "esri/renderers/UniqueValueRenderer",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",

    "esri/PopupTemplate",
    "esri/tasks/support/Query",

    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/kernel",
    "dojo/_base/array",
    "dojo/Deferred",
    "dojo/promise/all",

    "dojo/on",
    "dojo/query",
    "dojo/string",
    "dojo/parser",

    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",

    "dijit/registry",
    "esri/portal/Portal",
    "esri/request",
    "esri/WebScene",

    "esri/core/Scheduler",
    "application/SlideList/SlideList",
    "dijit/layout/ContentPane",

    "dojo/domReady!"
  ], function(Map, Basemap, MapView, SceneView,
    Search, Zoom, Home, Locate, Compass,
    Camera, Viewpoint, Extent,
    watchUtils, query, FeatureLayer,
    VectorTileLayer, UniqueValueRenderer, PictureMarkerSymbol, SimpleMarkerSymbol,
    PopupTemplate, Query,
    declare, lang, kernel, arrayUtils, Deferred, all,
    on, query, string, parser,
    dom, domClass, domConstruct, domStyle,
    registry, Portal, esriRequest, WebScene,
    Scheduler, SlideList, ContentPane) {

    if (/Mobi/.test(navigator.userAgent)) {
      isMobile = true;
      //  console.log("mob");
    } else {
      isMobile = false;
      //  console.log("desk");
    }

    ///////////////////////////////////////////////////////////////////////////////
    // ///////// ADD APP MAP AND SCENE /////////////////////////////////////

    // App
    app = {
      basemap: "gray",
      scale: 50000000,
      center: [-40, 40],
      popup: {
        dockEnabled: true,
        dockOptions: {
          position: "top-right",
          // Disables the dock button from the popup
          buttonEnabled: false,
          // Ignore the default sizes that trigger responsive docking
          breakpoint: false,
        }
      },
      viewPadding: {
        bottom: 0
      },
      ui: {
        components: ["zoom", "attribution"],
        padding: {
          top: 15,
          bottom: 15
        }
      },
      mapView: null,
      sceneView: null,
      activeView: null,
      searchWidgetNav: null
    };

    // Map
    var map = new Map({
      basemap: app.basemap
    });
    app.mapView = new MapView({
      container: "mapViewDiv",
      map: map,
      scale: app.scale,
      center: app.center,
      padding: app.viewPadding,
      ui: app.ui,
      popup: app.popup
    });

    // Scene
    var scene = new WebScene({
      portalItem: {
        id: "f98572a50b7f446a975faa912a2959cc" // ID of the WebScene on arcgis.com
      }
    });
    app.sceneView = new SceneView({
      container: "sceneViewDiv",
      map: scene,
      padding: app.viewPadding,
      ui: app.ui,
      popup: app.popup,
      altitude:{
        min: 680
      }
    });

    // \\\\\\\\\ ADD APP MAP AND SCENE \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
    // /////////          ////////////////////////////////////////


    app.mapView.then(function() {
      app.mapView.popup.dockOptions.position = "top-right";
      console.log("mapView!");
    });

    app.sceneView.then(function() {
      console.log("sceneView!");

      var firstTime = true;
      if (firstTime) {
        $('#aboutModal').on('hidden.bs.modal', function() {
          //setTimeout(function() {
          app.sceneView.goTo({
            position: {
              x: -96.7840531503381,
              y: 33.77014785845847,
              z: 13757098.703575026,
              spatialReference: {
                wkid: 4326
              }
            },
            heading: 0,
            tilt: 0
          }, {
            speedFactor: 0.25
          });
          //
          // .then(function() {
          //   return view.goTo(
          //   {
          //       position:{
          //         z: 13757098.703575026
          //       }
          //   });
          // });
        });
        firstTime = false;
      }


      //app.sceneView.popup.visible = true;
      var popup = app.sceneView.popup;
      popup.viewModel.on("trigger-action", function(event) {
        if (event.action.id === "open-website") {
          var attributes = popup.viewModel.selectedFeature.attributes;
          // Get the "website" field attribute
          var info = attributes.url;
          // Make sure the "website" attribute value is not null
          if (info !== null) {
            // Open up a new browser using the URL value in the 'website' field
            window.open(info.trim());
            // If the "website" value is null, open a new window and Google search the name of the brewery
          } else {
            window.open(info);
          }
        }
      });
      app.sceneView.popup.dockOptions.position = "top-right";
    });
    app.sceneView.on('click', function() {

    });

    app.activeView = app.sceneView;

    app.activeView.then(function() {
      console.log("activeView!");
      console.log(app.activeView);
      app.initialExtent = app.activeView.extent;
    });

    var loaded = false; // only execute first time layer view updates
    var featuresArray = []; // holds list of client-side graohics


    scene.then(function() {
      var vtItemId = "0da65895327a45dd91acb890c6ed7690";
      var vtUrl = "https://bradjsnider.maps.arcgis.com/sharing/rest/content/items/" + vtItemId + "/resources/styles/root.json";
      var vtLayer = new VectorTileLayer({
        // URL to the style of vector tiles
        url: vtUrl,
        id: "vtId"
      });
      vtLayer.then(function() {
        setTimeout(function() {
          $('body').addClass('loaded');
          $('h1').css('color', '#222222');
          setTimeout(function() {
            // $('#aboutModal').modal('show');
          }, 1000);
        }, 3000);
      });

      app.sceneView.map.add(vtLayer);
      console.log(scene);
      addIconLayer();
      console.log("scene load");
    });




    // \\\\\\\\\              \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
    // ///////// ADD ICON LAYER AND POPUP ////////////////////////////////////////

    function addIconLayer() {
      var picRenderer = new UniqueValueRenderer({
        field: "marker_url",
        defaultSymbol: new PictureMarkerSymbol({
          url: "icons/Arizona.png",
          width: "80px",
          height: "80px"
        })
      });
      // Create graphic symbols
      var iconArray = ["Esri", "Pima", " Arizona", "DHive", "UnitedWay", "MichDNR", "Hillel", "SitC", "TRU", "BlockM"]
      var dropdownHtml = arrayUtils.map(iconArray, function(feature) {
        var iconFile = feature + ".png";
        var iconUrl = "icons/" + feature + ".png";
        picRenderer.addUniqueValueInfo(iconFile,
          new PictureMarkerSymbol({
            url: iconUrl,
            width: "80px",
            height: "80px"
          })
        );
      });
      var template = new PopupTemplate({
        title: setTitleInfo,
        content: setContentInfo,
        actions: [{
          id: "open-website",
          image: "icons/link.png",
          title: "Info"
        }], //setActionInfo//,
        overwriteActions: true
      });
      console.log(template);
      var fl = new FeatureLayer({
        portalItem: { // autocasts as esri/portal/PortalItem
          id: "3db2518bb6b54b6d85958b3de01d10bb"
        },
        renderer: picRenderer,
        outFields: ["*"],
        elevationInfo: {
          mode: "relative-to-ground",
          offset: 5
        }
      });
      fl.popupTemplate = template;
      scene.add(fl); // adds the layer to the map

      function setTitleInfo(feature) {
        feature = feature.graphic;
        var name = feature.attributes.shortAlias;
        var position = feature.attributes.position;

        return "<h4 class='popup-header'><i class='fa fa-map-pin' aria-hidden='true' style='margin-left:20px; margin-right:10px;'></i><span style='white-space: nowrap;'>" + position + " &nbsp;&nbsp; |</span> &nbsp;&nbsp; <span style='white-space: nowrap;''>" + name + "</span></h4>";
      }

      function setContentInfo(feature) {
        feature = feature.graphic;
        console.log(feature);
        var name = feature.attributes.shortAlias;
        var date = feature.attributes.timespan;
        var location = feature.attributes.city;

        var courseList = "";
        var subjectList= "";
        var panelBullets = "";
        for (i = 1; i < 7; i++) {
          var currentBullet = feature.attributes['bullet' + i];
          if (currentBullet != null) {
            var listItem = "<p class='popup-bullet'><i class='fa fa-location-arrow fa-lg' aria-hidden='true'></i>  &nbsp;&nbsp;" + currentBullet + "</p>";
            panelBullets = panelBullets + listItem;
          }
        }
        if(name == "University of Michigan"){
          var courseArray = ["Environmental and Sustainable Engineering", "Environmental Justice", "Food, Land, and Society", "Conservation of Biological Diversity"];

          arrayUtils.forEach(courseArray, function(course){
            var listItem;
            listItem = "<p class='popup-course'><i class='fa fa-book fa-lg' aria-hidden='true'></i> &nbsp;&nbsp;" + course + "</p>";
             courseList = courseList + listItem;
          });
          courseList = "Influential courses:<br><br>" + courseList;

          console.log(courseList);
          //var relevant courses = "Environmental and Sustainable Engineering"
        }
        else if(name == "University of Arizona"){
          var courseArray = ["Remote sensing", "Geodata management", "Cartography", "Spatial statistics", "Scripting and Web GIS"];

          arrayUtils.forEach(courseArray, function(course){
            var listItem;
            listItem = "<p class='popup-course'><i class='fa fa-book fa-lg' aria-hidden='true'></i> &nbsp;&nbsp;" + course + "</p>";
             subjectList = subjectList + listItem;
          });
          subjectList = "Notable topics:<br><br>" + subjectList;
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
        console.log(setActionInfo(feature));

        return node;
      }

      function setActionInfo(feature) {
        //feature = feature.graphic;
        // feature.attributes.url
        var actions = [{
          id: "open-website",
          image: "Arizona.png",
          title: "Brewery Info"
        }];
        return actions;
      }

      app.activeView.whenLayerView(fl).then(function(lyrView) {
        lyrView.watch("updating", function(val) {
          if (!val && !loaded) { // wait for the layer view to finish updating

            app.activeView.on("click", function(response) {
              var mapPoint = {
                x: response.mapPoint.x,
                y: response.mapPoint.y
              };

              var query = new Query();
              query.geometry = pointToExtent(app.activeView, mapPoint, 40);
              lyrView.queryFeatures(query)
                .then(function(res) {
                  var geomArray = [];
                  arrayUtils.forEach(res, function(feature) {
                    console.log(feature);
                    geomArray.push(feature.geometry);
                  });
                  console.log(app.sceneView.popup.featureCount);
                  console.log(geomArray);
                  if (geomArray.length == 1){
                    // app.activeView.popup.visible = true;
                    var geom = geomArray[0].z = 680;
                    app.activeView.goTo(geomArray).then(function(){
                      var vtItemId = res[0].attributes.label;

                      var vtLayer = app.sceneView.map.findLayerById("vtId");
                      var vtUrl = "https://bradjsnider.maps.arcgis.com/sharing/rest/content/items/" + vtItemId + "/resources/styles/root.json";
                      vtLayer.loadStyle(vtUrl);
                    });
                  }
                  else{
                    app.activeView.popup.watch('featureCount', function(newValue, oldValue, property, object) {
                    //debugger;
                    console.log("New value: ", newValue,      // The new value of the property
                                 "<br>Old value: ", oldValue,  // The previous value of the changed property
                                 "<br>Watched property: ", property,  // In this example this value will always be "basemap.title"
                                 "<br>Watched object: ", object);     // In this example this value will always be the map object
                                 //app.activeView.popup.visible = false;

                    });

                    app.activeView.goTo(geomArray);
                  }
                });
            });








            lyrView.queryFeatures().then(function(results) {
              featuresArray = results;
              // prints all the client-side graphics to the console
              console.log(featuresArray);
            });
            var queryFeat = new Query();

            var template1 = new PopupTemplate();
            var options = {
              popTemp: template1,
              queryFeat: queryFeat,
              features: featuresArray,
              lyrView: lyrView,
              scene: app.sceneView.map,
              view: app.sceneView,
              color: "#6c6c6c"
            }
            var slideList = new SlideList(options, "carousel_0");
            slideList.startup();
            loaded = true;
          }
        });
      });
    }

    function pointToExtent(view, point, toleranceInPixel) {
      var pixelWidth = view.extent.width / view.width;
      var toleraceInMapCoords = toleranceInPixel * pixelWidth;
      return new Extent({
        xmin: point.x - toleraceInMapCoords,
        xmax: point.x + toleraceInMapCoords,
        ymin: point.y - toleraceInMapCoords,
        ymax: point.y + toleraceInMapCoords,
        spatialReference: 102100
      });
    }

    // \\\\\\\\\ ADD ICON LAYER AND POPUP \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
    // /////////          ////////////////////////////////////////

    // Creates a viewpoint centered on the extent of a polygon geometry

    // Home and Compass
    var homeBtnScn = new Home({
      view: app.sceneView,
      viewpoint: {
        position: {
          x: -96.7840531503381,
          y: 33.77014785845847,
          z: 13757098.703575026,
          spatialReference: {
            wkid: 4326
          }
        },
        heading: 0,
        tilt: 0
      }
    });
    var compassBtnScn = new Compass({
      view: app.sceneView
    });
    var homeBtnMap = new Home({
      view: app.mapView,
      viewpoint: {
        position: {
          x: -96.7840531503381,
          y: 33.77014785845847,
          z: 13757098.703575026,
          spatialReference: {
            wkid: 4326
          }
        },
        heading: 0,
        tilt: 0
      }
    });
    var compassBtnMap = new Compass({
      view: app.mapView
    });
    var widgetLoc = "top-left";
    app.sceneView.ui.add(homeBtnScn, widgetLoc);
    app.sceneView.ui.add(compassBtnScn, widgetLoc);
    app.mapView.ui.add(homeBtnMap, widgetLoc);
    app.mapView.ui.add(compassBtnMap, widgetLoc);

    // Search
    app.searchWidgetNav = createSearchWidget("searchNavDiv");

    function createSearchWidget(parentId) {
      var search = new Search({
        viewModel: {
          view: app.activeView,
          highlightEnabled: false,
          popupEnabled: true,
          showPopupOnSelect: true
        }
      }, parentId);
      //search.startup();
      return search;
    }

    // Views - Listen to view size changes to show/hide panels
    app.mapView.watch("size", viewSizeChange);
    app.sceneView.watch("size", viewSizeChange);

    function viewSizeChange(screenSize) {
      if (app.screenWidth !== screenSize[0]) {
        app.screenWidth = screenSize[0];
        setPanelVisibility();
      }
    }

    // Popups - Listen to popup changes to show/hide panels
    app.mapView.popup.watch(["visible", "currentDockPosition"], setPanelVisibility);
    app.sceneView.popup.watch(["visible", "currentDockPosition"], setPanelVisibility);

    // Panels - Show/hide the panel when popup is docked
    function setPanelVisibility() {
      var isMobileScreen = app.activeView.widthBreakpoint === "xsmall" || app.activeView.widthBreakpoint === "small",
        isDockedVisible = app.activeView.popup.visible && app.activeView.popup.currentDockPosition,
        isDockedBottom = app.activeView.popup.currentDockPosition && app.activeView.popup.currentDockPosition.indexOf("bottom") > -1;
      // Mobile (xsmall/small)
      if (isMobileScreen) {
        if (isDockedVisible && isDockedBottom) {
          query(".calcite-panels").addClass("invisible");
        } else {
          query(".calcite-panels").removeClass("invisible");
        }
      } else { // Desktop (medium+)
        if (isDockedVisible) {
          query(".calcite-panels").addClass("invisible");
        } else {
          query(".calcite-panels").removeClass("invisible");
        }
      }
    }

    // Panels - Dock popup when panels show (desktop or mobile)
    query(".calcite-panels .panel").on("show.bs.collapse", function(e) {
      if (app.activeView.popup.currentDockPosition || app.activeView.widthBreakpoint === "xsmall") {
        app.activeView.popup.dockEnabled = false;
      }
    });

    // Panels - Undock popup when panels hide (mobile only)
    query(".calcite-panels .panel").on("hide.bs.collapse", function(e) {
      if (app.activeView.widthBreakpoint === "xsmall") {
        app.activeView.popup.dockEnabled = true;
      }
    });

    // Tab Events (Views)
    query(".calcite-navbar li a[data-toggle='tab']").on("click", function(e) {
      syncTabs(e);
      if (e.target.text.indexOf("Map") > -1) {
        syncViews(app.sceneView, app.mapView);
        app.activeView = app.mapView;
      } else {
        syncViews(app.mapView, app.sceneView);
        app.activeView = app.sceneView;
      }
      syncSearch();
    });

    // Tab
    function syncTabs(e) {
      query(".calcite-navbar li.active").removeClass("active");
      query(e.target).addClass("active");
    }

    // View
    function syncViews(fromView, toView) {
      watchUtils.whenTrueOnce(toView, "ready").then(function(result) {
        watchUtils.whenTrueOnce(toView, "stationary").then(function(result) {
          toView.goTo(fromView.viewpoint);
          toView.popup.reposition();
        });
      });
    }

    // Search
    function syncSearch() {
      app.searchWidgetNav.viewModel.view = app.activeView;
      // Sync
      if (app.searchWidgetNav.selectedResult) {
        app.searchWidgetNav.search(app.searchWidgetNav.selectedResult.name);
      }
      app.activeView.popup.reposition();
    }

    // Basemap events
    query("#selectBasemapPanel").on("change", function(e) {
      app.mapView.map.basemap = e.target.options[e.target.selectedIndex].dataset.vector;
      app.sceneView.map.basemap = e.target.value;
    });

    // Collapsible popup (optional)
    query(".esri-popup .esri-title").on("click", function(e) {
      query(".esri-popup .esri-container").toggleClass("esri-popup-collapsed");
      app.activeView.popup.reposition();
    });

    // Home
    query(".calcite-navbar .navbar-brand").on("click", function(e) {
      app.activeView.goTo({
        target: app.initialExtent,
        rotation: 0
      });
    })


  });
});
