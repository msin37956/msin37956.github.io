/**
 * Monitor > Event Detail Set
 */
 
 	// CCTV 제어
 	// Server IP
	//const vms_server = "http://192.168.100.180:8989"; 
	const vms_server = "http://192.168.3.180:8989"; 
				
	function doSearchAddr() {
		$(".search_list").addClass('active');
		$("#btn_search_reset").addClass('active');
		searchAddr($("#form_search_addr").val());
	}
	
	// vworld 주소 검색 API 2.0
	// https://www.vworld.kr/dev/v4dv_search2_s001.do
	function searchAddr(keyword) {			
		$(".place_point").parent().children(".marker").remove();
	
		let url = "https://api.vworld.kr/req/search";
		let search_type = $("#address_search_type option:selected").val();
		let category = "";
		if ( search_type == "address") {
			category = "&category=road";
		}
		let data  = "service=search&version=2.0&request=search&key="+vwapikey;				
			data += "&format=json&size=100&page=1&type="+search_type+"&crs=EPSG:3857";
			data += "&query="+encodeURI(keyword);
			data += category;
		
		// Ajax Call
		$.ajax({
	    	type: "get",
	    	url: url,
	    	data : data,
	    	dataType: 'jsonp',
	    	async: false,
			success: function(data){
				$("#list_search_addr").empty();
			  	$.each(data.response.result.items, function(index, item){
			  		let title = (data.response.result.type=="address")? item.address.bldnm +" "+item.address.bldnmdc: item.title;
			  		addr  = "<li class=\"search_item\" onClick=\"moveMapPosition("+item.point.x+","+item.point.y+")\"\">";
			  		addr += "<em>"+title+"</em>";
			  		addr += "<span>"+item.address.road+"</span>";
			  		addr += "</li>";
			  		$("#list_search_addr").append(addr);
			  		
			  		if ( data.response.result.type == "place" ) {
			  			//let bldtype = (item.address.bldnmdc == "")?null:item.address.bldnm;
			  			let category = item.category.split(">");
			  			let bldtype = category[category.length-1].trim();
			  			console.log(bldtype);
			  			addPointMarker(item.id,item.point.x,item.point.y,"place_point",bldtype)			  			
			  		} else {
			  			addPointMarker(item.id,item.point.x,item.point.y,"place_point");
			  		}
			  	})	
			}
		});
	}
		
	// Map Add Marker
	// addMarker(event_key,event_lon,event_lat,event_type,event_icon);		
	function addMarker(event_key,event_lon,event_lat,event_type,event_icon) {		
		let marker_id = "marker_"+event_key; 			
		markerList  = "<div id=\""+marker_id+"\" class=\"marker "+event_type+" default \" >";
	    markerList += "<div class=\"area\"></div>";
	    markerList += "<div class=\"icon\">";
	    
	    if ( event_icon != "" && event_icon !== undefined) {
		   	event_icon_path = "/files/event_icon/"+event_icon;		    		
	    }else {
	    	switch(event_type) {
	    		case "evt_119": default_icon = "119.png"; break;
	    		case "evt_112": default_icon = "112.png"; break;
	    		case "evt_112_media": default_icon = "112_media.png"; break;
	    		case "evt_weak": default_icon = "weak.png"; break;
	    	}
	    	event_icon_path = "/files/default/"+default_icon;
	    }
	    
	    markerList += "<div class=\"img\" style=\"background-image: url("+event_icon_path+");\"></div>";
	    markerList += "</div>";
	    markerList += "<span class=\"badge\"></span>";
	    markerList += "</div>";
	    
	    $("#list_marker").append(markerList)
	    setEventPosition(marker_id,event_lon,event_lat);
		
		moveMarkerPosition(event_lon,event_lat)
	}

	// set Position Marker Icon
	function setEventPosition(makerId, lon, lat) {
		lat = parseFloat(lat);
		lon = parseFloat(lon);
		var markerObj = new ol.Overlay({
            position : ol.proj.fromLonLat([lon, lat]),
            offset:[-18,-44],
            //positioning : 'bottom-center',
        	element : document.getElementById(makerId)
        });
		map.addOverlay(markerObj);
	}
	
	// Map Add Marker
	// addPoint(event_key,event_lon,event_lat,event_type);		
	function addPointMarker(event_key,event_lon,event_lat,event_type,bldtype) {
		console.log("a"+bldtype);	
		let marker_id = "marker_"+event_key;
		let gisIcon = getGisIcon(bldtype);
		
		if ( bldtype != null && gisIcon != "") {		
			let gisIconUrl = "/files/gis_icon/"+gisIcon;
		
			markerList  = "<div id=\""+marker_id+"\" class=\"marker "+event_type+" default\">";
			markerList += "<div class=\"icon\">";
			markerList += "<div class=\"img\" style=\"background-image: url("+gisIconUrl+");\">";
			markerList += "</div></div></div>";			 
		} else { 			
			markerList  = "<div id=\""+marker_id+"\" class=\"marker "+event_type+" place default\" ></div>";
		}		
	    
	    //console.log(markerList);
	    $("#list_marker").append(markerList)
	    setMarkerPosition(marker_id,event_lon,event_lat);
		
		// moveMarkerPosition(event_lon,event_lat);
	}	
	
	function getGisIcon(bldtype){
		let gisIcon = "";
		$.each(dataSet.listGisIcon, function(index, item){			
			console.log(item.gis_name+":::::::::::"+bldtype);
		  	if ( bldtype == item.gis_name ) {		  	
		  		console.log(item.gis_icon);
		  		gisIcon = item.gis_icon;
		  		return false;		  		
		  	}		   				   		
		});			
		return gisIcon;  
	}
	
	// set Position Marker Icon
	function setMarkerPosition(makerId, x, y) {
		var markerObj = new ol.Overlay({
            position :[x, y],
            offset:[-18,-44],
            //positioning : 'bottom-center',
        	element : document.getElementById(makerId)
        });
		map.addOverlay(markerObj);
	}
		

	// marker position move
	function moveMarkerPosition(lon,lat) {
		lat = parseFloat(lat);
		lon = parseFloat(lon);
		var map_position = ol.proj.fromLonLat([lon,lat]);			
		var pan = ol.animation.pan({
		    source: map.getView().getCenter() 
		});
		var zoom = ol.animation.zoom({
		    resolution : map.getView().getResolution()
		});	   
				
		map.beforeRender(pan, zoom);			
		map.getView().setCenter(map_position);
		map.getView().setZoom(14);	
		
	}

	// 119 긴급출동
	const set119Detail = (data) => {
		$("#txt_event_key").text(data.event_key);
		$("#txt_h_event_code").text(data.h_event_code);
		$("#txt_h_event_state_code").text(data.h_event_state_code);
		$("#txt_h_event_date").text(data.h_event_date);
		$("#txt_h_send_system").text(data.h_send_system);
		$("#txt_h_receive_system").text(data.h_receive_system);
		$("#txt_h_msg_date").text(data.h_msg_date);
		$("#txt_h_msg_length").text(data.h_msg_length);
		$("#txt_event_type").text(data.event_type);
		$("#txt_event_type_desc").text(data.event_type_desc);
		$("#txt_event_gps_lon").text(data.event_gps_lon);
		$("#txt_event_gps_lat").text(data.event_gps_lat);
		$("#txt_event_address").text(data.event_address);
		$("#txt_event_address_code").text(data.event_address_code);
		$("#txt_event_date").text(data.event_date);
		$("#txt_sender_id").text(data.sender_id);
		$("#txt_a_date").text(data.a_date);
	}
	
	
	// 112 긴급영상
	const set112Data = (data) => {
		$("#txt_media_msg_key").text(data.msg_key);
		$("#txt_media_h_msg_code").text(data.h_msg_code);
		$("#txt_media_h_msg_state_code").text(data.h_msg_state_code);
		$("#txt_media_h_event_date").text(data.h_event_date);
		$("#txt_media_h_send_system").text(data.h_send_system);
		$("#txt_media_h_receive_system").text(data.h_receive_system);
		$("#txt_media_h_msg_date").text(data.h_msg_date);
		$("#txt_media_h_msg_length").text(data.h_msg_length);
		$("#txt_media_msg_type").text(data.msg_type);
		$("#txt_media_msg_type_desc").text(data.msg_type_desc);
		$("#txt_media_msg_key2").text(data.msg_key2);
		$("#txt_media_msg_gps_lon").text(data.msg_gps_lon);
		$("#txt_media_msg_gps_lat").text(data.msg_gps_lat);
		$("#txt_media_msg_address").text(data.msg_address);
		$("#txt_media_msg_address_code").text(data.msg_address_code);
		$("#txt_media_msg_date").text(data.msg_date);
		$("#txt_media_sender_id").text(data.sender_id);
		$("#txt_media_a_date").text(data.a_date);
	}
	
	// 112 긴급출동
	const set112SupportDetail = (data) => {
		$("#txt_evt_ocr_no").text(data.evt_ocr_no);
		$("#txt_recept_ymd").text(data.recept_ymd);
		$("#txt_mtmda_prcs_ty_cd").text(data.mtmda_prcs_ty_cd);
		$("#txt_mtmda_prcs_state").text(data.mtmda_prcs_state);
		$("#txt_title").text(data.title);
		$("#txt_img_start_ymd_hms").text(data.img_start_ymd_hms);
		$("#txt_img_end_ymd_hms").text(data.img_end_ymd_hms);
		$("#txt_point_x").text(data.point_x);
		$("#txt_point_y").text(data.point_y);
		$("#txt_adres_nm").text(data.adres_nm);
		$("#txt_conts").text(data.conts);
		$("#txt_recept_prcs_yn").text(data.recept_prcs_yn);
		$("#txt_recept_prcs_ymd_hms").text(data.recept_prcs_ymd_hms);
		$("#txt_file_id_return_ymd_hms").text(data.file_id_return_ymd_hms);
		$("#txt_rgs_date").text(data.rgs_date);
		$("#txt_recept_nm").text(data.recept_nm);
		$("#txt_recept_telno").text(data.recept_telno);
		$("#txt_recv_no").text(data.recv_no);
		$("#txt_upd_date").text(data.upd_date);
	};
	
	// 사회적 약자
	const setDscDetail = (data) => {
		$("#txt_dsc_msg_key").text(data.dsc_msg_key);
		$("#txt_dsc_h_msg_code").text(data.dsc_h_msg_code);
		$("#txt_dsc_h_msg_state_code").text(data.dsc_h_msg_state_code);
		$("#txt_dsc_h_login_date").text(data.dsc_h_login_date);
		$("#txt_dsc_h_send_system").text(data.dsc_h_send_system);
		$("#txt_dsc_h_receive_system").text(data.dsc_h_receive_system);
		$("#txt_dsc_h_msg_date").text(data.dsc_h_msg_date);
		$("#txt_dsc_h_msg_length").text(data.dsc_h_msg_length);
		$("#txt_dsc_msg_type").text(data.dsc_msg_type);
		$("#txt_dsc_msg_gps_lon").text(data.dsc_msg_gps_lon);
		$("#txt_dsc_msg_gps_lat").text(data.dsc_msg_gps_lat);
		$("#txt_dsc_msg_address").text(data.dsc_msg_address);
		$("#txt_dsc_msg_address_code").text(data.dsc_msg_address_code);
		$("#txt_dsc_ref_id").text(data.dsc_ref_id);
		$("#txt_dsc_u_name").text(data.dsc_u_name);
		$("#txt_dsc_u_phone").text(data.dsc_u_phone);
		$("#txt_dsc_u_birthday").text(data.dsc_u_birthday);
		$("#txt_dsc_u_gender").text(data.dsc_u_gender);
		$("#txt_dsc_u_address").text(data.dsc_u_address);
		$("#txt_dsc_u_guard_name").text(data.dsc_u_guard_name);
		$("#txt_dsc_u_guard_phone").text(data.dsc_u_guard_phone);
		$("#txt_dsc_u_msg_date").text(data.dsc_u_msg_date);
		$("#txt_dsc_u_image").text(data.dsc_u_image);
		$("#txt_dsc_u_info").text(data.dsc_u_info);
		$("#txt_dsc_u_report").text(data.dsc_u_report);
		$("#txt_dsc_send_id").text(data.dsc_send_id);
		$("#txt_dsc_a_date").text(data.dsc_a_date);
	}
	
	// NVR 연동
	function doPtz(pan,tilt,zoom) {
	
		let device_ip = dataSet.deviceData.device_ip;
		let channel = dataSet.deviceData.channel;			
		var objData = {
			"device_ip":device_ip,
			"channel":channel,
			"pan":pan,
			"tilt":tilt				
		}
		
		// Ajax Call
		$.ajax({
			url: vms_server+"/cctv/ptz",
			dataType: "json",
			async: false,
			data: objData,
			success: function(data){
				console.log(data);
			},
			error: function(data){
				message.warning("제어 오류", "VMS 서버를 확인하여 주세요!");	
			}
		})
	};
	
	// PTZ zoom 
	function doZoom(zoom) {
		
		let device_ip = dataSet.deviceData.device_ip;
		let channel = dataSet.deviceData.channel;			
		var objData = {
			"device_ip":device_ip,
			"channel":channel,
			"zoom":zoom
		}
		
		// Ajax Call
		$.ajax({
			url: vms_server+"/cctv/ptz",
			dataType: "json",
			async: false,
			data: objData,
		}).done(function(data){
			if (data.msgCode == "-1") {
				message.warning("오류", "CCTZ 제어를 실패하였습니다.");
			}
		})
		.fail(function() {
			message.warning("CCTV Zoom 오류", "VMS 서버를 확인하여 주세요!");	
		});
	};
