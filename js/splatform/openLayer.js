/**
 * Monitoring Map openLayer
 */

	//브이월드 WMTS API 호출
    var layers = {};
  	
  	//일반지도
    layers['vworld'] = new ol.layer.Tile({
    	preload: Infinity, //map preload 
        title : 'VWorld Map',
        visible : true,
        type : 'base',
        source : new ol.source.XYZ({
            url : 'https://api.vworld.kr/req/wmts/1.0.0/CEB52025-E065-364C-9DBA-44880E3B02B8/Base/{z}/{y}/{x}.png'
        })
    });
  	
   	//야간지도
    layers['night'] = new ol.layer.Tile({
    	preload: Infinity, //map preload
        title : 'Night Map',
        visible : true,
        type : 'base',
        source : new ol.source.XYZ({
            url : 'http://api.vworld.kr/req/wmts/1.0.0/CEB52025-E065-364C-9DBA-44880E3B02B8/midnight/{z}/{y}/{x}.png' //WMTS 배경지도 사용
        })
    });
     
    //항공지도
    layers['satellite'] = new ol.layer.Tile({
    	preload: Infinity, //map preload
        title : 'Satellite Map',
        visible : true,
        type : 'base',
        source : new ol.source.XYZ({
            url : 'http://api.vworld.kr/req/wmts/1.0.0/CEB52025-E065-364C-9DBA-44880E3B02B8/Satellite/{z}/{y}/{x}.jpeg' //WMTS 배경지도 사용
        })
    });
    
    
    /*var View = new ol.View({
    	center: ol.proj.transform([127.100616,37.402142], 'EPSG:4326', 'EPSG:900913'),
		zoom: 12, // 기본값, zoomFactor 변경으로 16->12
		zoomFactor:2.5, //확대축소 단위 변경
		maxZoom:16.5, //5m 이하 확대 방지
		minZoom:5 //100km 이상 축소 방지
    })*/
    

    //layerswitcher1 preload 필요 없는 버전
    //지도바꾸기
    /*function baseChange(data) {//baseMap 변경
        var layer = layers[data];
        if (layer) {
            layer.setOpacity(1);
            updateRenderEdgesOnLayer(layer);
            map.getLayers().setAt(0, layer);
        }
    }*/

    /*var updateRenderEdgesOnLayer = function(layer) {// 타일 변경
        if (layer instanceof ol.layer.Tile) {
            var source = layer.getSource();
        }
        
    };*/
	//필요없는 버전일 때는 map의 layers에 기본 지도만 넣어놓으면 됨
    //layerswitcher1 preload 필요 없는 버전
   
    //layerswitcher2 preload 필요한 버전
    function baseChange(data) {//baseMap 변경
        if (data == 'vworld') {
            layers['vworld'].setVisible(true);
            layers['vworld'].setOpacity(1);
            layers['night'].setVisible(false);
            layers['night'].setOpacity(0);
            layers['satellite'].setVisible(false);
            layers['satellite'].setOpacity(0);
        }
        if (data == 'night') {
            layers['night'].setVisible(true);
            layers['night'].setOpacity(1);
            layers['vworld'].setVisible(false);
            layers['vworld'].setOpacity(0);
            layers['satellite'].setVisible(false);
            layers['satellite'].setOpacity(0);
        }
        if (data == 'satellite') {
            layers['satellite'].setVisible(true);
            layers['satellite'].setOpacity(1);
            layers['night'].setVisible(false);
            layers['night'].setOpacity(0);
            layers['vworld'].setVisible(false);
            layers['vworld'].setOpacity(0);
        }
    }
    //preload 필요한 버전일 때는 map의 layers에 지도를 전부 넣어놔야함
	//layerswitcher2 preload 필요한 버전
    

    //축척바 
    var scaleLineControl = new ol.control.ScaleLine(); 
    
    //확대/축소버튼
    $('#zoom-out').on('click', function() {
         var view = map.getView();
         var zoom = view.getZoom();
         view.setZoom(zoom - 1);
     });

     $('#zoom-in').on('click', function() {
         var view = map.getView();
         var zoom = view.getZoom();
         view.setZoom(zoom + 1);
     });
    
    var vectorSource = new ol.source.Vector();
    
    var vector = new ol.layer.Vector({
    	  source: vectorSource,
    	  style: new ol.style.Style({
    	    fill: new ol.style.Fill({
    	      color: 'rgba(255, 255, 255, 0.2)'
    	    }),
    	    stroke: new ol.style.Stroke({
    	      color: '#286feb',
    	      width: 3
    	    }),
    	    image: new ol.style.Circle({
    	      radius: 7,
    	      fill: new ol.style.Fill({
    	        color: '#286feb'
    	      })
    	    })
    	  })
    	});
    
    layers['night'].setOpacity(0); //야간지도, 위성지도 visible false 처리
    layers['satellite'].setOpacity(0);
    
    
	var map = new ol.Map({
		layers: [ layers['vworld'],layers['night'],layers['satellite'],vector],
		target: 'map',
		controls : ol.control.defaults({
     	   zoom:false,
            attributionOptions:({
                collapsible:false
            })
        }).extend([
            scaleLineControl
            ]),
		view: new ol.View({
			center: ol.proj.transform([127.100616,37.402142], 'EPSG:4326', 'EPSG:900913'),
			zoomFactor: 2.5,
			zoom: 12,
			maxZoom:16.5, //5m 이하 확대 방지
			minZoom:5 //100km 이상 축소 방지
		})
	});
	
	map.addControl(new ol.control.ZoomSlider());
	
	
	var wgs84Sphere = new ol.Sphere(6378137); //계산때문에
	
	/**
     * Currently drawn feature.
     * @type {ol.Feature}
     */
    var sketch;


    /**
     * The help tooltip element.
     * @type {Element}
     */
    var helpTooltipElement;


    /**
     * Overlay to show the help messages.
     * @type {ol.Overlay}
     */
    var helpTooltip;


    /**
     * The measure tooltip element.
     * @type {Element}
     */
    var measureTooltipElement;


    /**
     * Overlay to show the measurement.
     * @type {ol.Overlay}
     */
    var measureTooltip;


    /**
     * Message to show when the user is drawing a polygon.
     * @type {string}
     */
    var continuePolygonMsg = '더블클릭하면 면적 측정이 완료됩니다';


    /**
     * Message to show when the user is drawing a line.
     * @type {string}
     */
    var continueLineMsg = '더블클릭하면 거리 측정이 완료됩니다';
     
    //var endMeasureMsg = '더블클릭하여 측정 완료';
    

    var draw; // global so we can remove it later

	

    /**
     * Handle pointer move.
     * @param {ol.MapBrowserEvent} evt The event.
     */
     var pointerMoveHandler = function(evt) {
     	if ($("#btn_line").is(':checked') == true || $("#btn_area").is(':checked') == true) {
     		if (evt.dragging) {
     	        return;
     	      }
     	      var helpMsg = '클릭하여 측정시작';

     	      if (sketch) {
     	        var geom = (sketch.getGeometry());
     	        if (geom instanceof ol.geom.Polygon) {
     	          helpMsg = continuePolygonMsg;
     	        } else if (geom instanceof ol.geom.LineString) {
     	          helpMsg = continueLineMsg;
     	        }
     	      }	  
     	      helpTooltipElement.innerHTML = helpMsg;
     	      helpTooltip.setPosition(evt.coordinate);
     	      helpTooltipElement.classList.remove('hidden');
      	}  else {
      		if ( helpTooltipElement != undefined ) {
      			helpTooltipElement.classList.add('hidden');
      		}
      	}		
     };
     
     map.on('pointermove', pointerMoveHandler);

     map.getViewport().addEventListener('mouseout', function() {
     	if ($("#btn_line").is(':checked') == true || $("#btn_area").is(':checked') == true) {
         	helpTooltipElement.classList.add('hidden');
     	}
     });


    /**
     * Format length output.
     * @param {ol.geom.LineString} line The line.
     * @return {string} The formatted length.
     */
     var formatLength = function(line) {
	     var length;
	     var coordinates = line.getCoordinates();
	     length = 0;
	     var sourceProj = map.getView().getProjection();
	     for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) { 
	       var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
	       var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
	       length += wgs84Sphere.haversineDistance(c1, c2);
	     }
	     var output;
	     if (length > 100) {
	       output = (Math.round(length / 1000 * 100) / 100) +
	           ' ' + 'km';
	     } else {
	       output = (Math.round(length * 100) / 100) +
	           ' ' + 'm';
	     }
	     return output;
     };


    /**
     * Format area output.
     * @param {ol.geom.Polygon} polygon The polygon.
     * @return {string} Formatted area.
     */
     var formatArea = function(polygon) {
         var area;
         var sourceProj = map.getView().getProjection();
         var geom = /** @type {ol.geom.Polygon} */(polygon.clone().transform(
             sourceProj, 'EPSG:4326'));
         var coordinates = geom.getLinearRing(0).getCoordinates();
         area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
         
         var output;
         if (area > 10000) {
           output = (Math.round(area / 1000000 * 100) / 100) +
               ' ' + 'km<sup>2</sup>';
         } else {
           output = (Math.round(area * 100) / 100) +
               ' ' + 'm<sup>2</sup>';
         }
         return output;
     };

    function addInteraction(type) {
   	  if(type == 'area') {  
   		  type = 'Polygon'; 
  		  }
   	  else if(type == 'length') { 
   		  type = 'LineString'; 
  		  }

      draw = new ol.interaction.Draw({
        source: vectorSource,
        type: (type),
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 5,
            stroke: new ol.style.Stroke({
              color: 'rgba(0, 0, 0, 0.7)'
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            })
          })
        })
      });
      
      if(type !== 'none') {
    	  map.addInteraction(draw);
    	  
      }
      
      createMeasureTooltip();
      createHelpTooltip();
      

      var listener;
      draw.on('drawstart',
          function(evt) {
            // set sketch
            sketch = evt.feature;

            /** @type {ol.Coordinate|undefined} */
            var tooltipCoord = evt.coordinate;

            listener = sketch.getGeometry().on('change', function(evt) {
              var geom = evt.target;
              var output;
              if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
              } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
              }
              measureTooltipElement.innerHTML = output;
              measureTooltip.setPosition(tooltipCoord);
            });
          }, this);

      draw.on('drawend',
          function() {
            measureTooltipElement.className = 'tooltip tooltip-static';
            measureTooltip.setOffset([0, -7]);
            // unset sketch
            sketch = null;
            // unset tooltip so that a new one can be created
            measureTooltipElement = null;
            createMeasureTooltip();
            ol.Observable.unByKey(listener);
          }, this);
    }


    /**
     * Creates a new help tooltip
     */
    function createHelpTooltip() {
      if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
      }
      helpTooltipElement = document.createElement('div');
      helpTooltipElement.className = 'tooltip hidden';
      helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
      });
      map.addOverlay(helpTooltip);
    }


    /**
     * Creates a new measure tooltip
     */
    function createMeasureTooltip() {
      if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
      }
      measureTooltipElement = document.createElement('div');
      measureTooltipElement.className = 'tooltip tooltip-measure';
      measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
      });
      map.addOverlay(measureTooltip);
    }


    /**
     * Let user change the geometry type.
     */

/*     typeSelect.onchange = function() {
      map.removeInteraction(draw);
      addInteraction();      
    };

    addInteraction();
     */
	var measureFeature = vectorSource.getFeatures();
	
	console.log(measureFeature)
    
    
	//feature 초기화
    $("#btn_measure_remove").on('click', function(){
    	var features = vectorSource.getFeatures();
    	//var lastFeature = features[features.length-1];
    		//vectorSource.removeFeature(index);
		for (var index in features) {
			vectorSource.removeFeature(features[index]);
		}
		
		$(".tooltip-static").parent("div").remove();
    	

    });
    
	