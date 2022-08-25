sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	var startAd = "";
	var endAd = "";
	var record = true;
	var recording = false;
	var centerPos = "";
	var posV = "";
	var posR = "";
	var long = 0;
	var lat = 0;
	var long2 = 0;
	var lat2 = 0;
	var dis = 0;
	var oToday;

	return Controller.extend("fiori.gft.Gestion_Frais_de_Transports.controller.Record", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.Record
		 */
		onInit: function () {
			var that = this;
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();
			var hour = today.getHours();
			var Minutes = today.getMinutes();
			var Seconds = today.getSeconds();
			oToday = (yyyy + '-' + mm + '-' + dd + "T" + hour + ":" + Minutes + ":" + Seconds);
			window.navigator.geolocation.getCurrentPosition(
				function (value) {
					posV = value.coords.longitude + ";" + value.coords.latitude + ";" + 0;
					centerPos = value.coords.longitude + ";" + value.coords.latitude;
					long = parseFloat(value.coords.longitude);
					lat = parseFloat(value.coords.latitude);
					var pos = that.getView().byId("Spot");
					var map = that.getView().byId("map");

					pos.setPosition(posV);
					map.setCenterPosition(centerPos);
					map.setInitialZoom("17");
				
				}
			);

			var oGeoMap = this.getView().byId("map");
			var oMapConfig = {
				"MapProvider": [{
					"name": "HEREMAPS",
					"type": "",
					"description": "",
					"tileX": "256",
					"tileY": "256",
					"minLOD": "1",
					"maxLOD": "19",
					"copyright": "openstreetmap.org",
					"Source": [{
						"id": "a",
						"url": "https://a.tile.openstreetmap.org/{LOD}/{X}/{Y}.png"
					}, {
						"id": "b",
						"url": "https://b.tile.openstreetmap.org/{LOD}/{X}/{Y}.png"
					}, {
						"id": "c",
						"url": "https://c.tile.openstreetmap.org/{LOD}/{X}/{Y}.png"
					}]
				}],
				"MapLayerStacks": [{
					"name": "DEFAULT",
					"MapLayer": {
						"name": "layer1",
						"refMapProvider": "HEREMAPS",
						"opacity": "1.0",
						"colBkgnd": "RGB(255,255,255)"
					}
				}]
			};
			oGeoMap.setMapConfiguration(oMapConfig);
			oGeoMap.setRefMapLayerStack("DEFAULT");
		},

		onStartRecording: function () {
			var that = this;
			recording = !recording;
			record = !record;

			var inter1 = setInterval(function () {
				that.onColorChangeGreen();
				if (recording === false) clearInterval(inter1);
			}, 2000);
			var inter2 = setInterval(function () {
				that.onGPSTrace();
				if (recording === false) clearInterval(inter2);
			}, 1000);

			if (recording === true) {
				//get starting address
				that.onReverseGeoCodeGetStart(lat, long);
			} else if (recording === false && record === true) {
				//get ending address
				that.onReverseGeoCodeGetEnd(lat, long);
			}
		},

		onGPSTraceTest: function () {
			var that = this;
			var disText = this.getView().byId("distance");

			long2 = long + 0.001;
			lat2 = lat - 0.0001;

			posV = long2 + ";" + lat2 + ";" + "0";
			posR += posV + ";";

			var route = that.getView().byId("route");
			var pos = that.getView().byId("Spot");
			dis += that.getDistanceFromLatLonInKm(lat, long, lat2, long2);
			pos.setPosition(posV);
			
			if (recording === false) {
				route.setPosition("0;0;0;");
			} else {
				route.setPosition(posR);
			}

			dis = Math.round(dis * 100) / 100;

			disText.setText(dis);
			long = long2;
			lat = lat2;


		},

		onGPSTrace: function () {
			var that = this;
			var disText = that.getView().byId("distance");

			long2 = long;
			lat2 = lat;

			window.navigator.geolocation.getCurrentPosition(
				function (value) {
					long = parseFloat(value.coords.longitude);
					lat = parseFloat(value.coords.latitude);
					posV = long + ";" + lat + ";" + "0";
					posR += posV + ";";
					var pos = that.getView().byId("Spot");
					var route = that.getView().byId("route");
					pos.setPosition(posV);
					route.setPosition(posR);
					dis += that.getDistanceFromLatLonInKm(lat2, long2, lat, long);
					dis = Math.round(dis * 100) / 100;
					disText.setText(dis);

				}
			);
		},

		onReverseGeoCodeGetStart: function (lat, long) {
			jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: "https://api.opencagedata.com/geocode/v1/json?q=" + lat + "+" + long + "&key=0818091195b84bc5ad137dee367d5363",
				dataType: "json",
				async: true,
				success: function (data, textStatus, jqXHR) {
					startAd = data.results[0].formatted;
				}
			});
		},

		onReverseGeoCodeGetEnd: function (lat, long) {
			var that = this;

			jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: "https://api.opencagedata.com/geocode/v1/json?q=" + lat + "+" + long + "&key=0818091195b84bc5ad137dee367d5363",
				dataType: "json",
				async: true,
				success: function (data, textStatus, jqXHR) {
					endAd = data.results[0].formatted;
					that.onSaveVoyage();
				}
			});
		},

		onColorChangeGreen: function () {
			var btn = this.getView().byId("recordBtn");
			btn.setType(sap.m.ButtonType.Accept);
			setTimeout(this.onColorChangeRed.bind(this), 1000);

		},

		onColorChangeRed: function () {
			var btn = this.getView().byId("recordBtn");
			btn.setType(sap.m.ButtonType.Reject);

		},

		onRecenter: function () {
			var map = this.getView().byId("map");
			centerPos = long + ";" + lat;
			map.setCenterPosition(centerPos);
		},

		getDistanceFromLatLonInKm: function (lat1, lon1, lat2, lon2) {
			var R = 6371; // Radius of the earth in km
			var dLat = this.deg2rad(lat2 - lat1); // deg2rad below
			var dLon = this.deg2rad(lon2 - lon1);
			var a =
				Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
				Math.sin(dLon / 2) * Math.sin(dLon / 2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			var d = R * c; // Distance in km
			return d;
		},

		deg2rad: function (deg) {
			return deg * (Math.PI / 180);
		},

		onSaveVoyage: function () {
			var that = this;
			var oEntry = {};

			oEntry.Id = "";
			oEntry.Pernr = "";
			oEntry.Nom = "Mon trajet le " + oToday;
			oEntry.Begda = oToday;
			oEntry.Endda = "9999-12-31T00:00:00";
			oEntry.DistancePrevu = "0.00";
			oEntry.DistanceParcouru = "0.00";
			oEntry.TempsPrevu = "PT00H00M00S";
			oEntry.TempsEnMotion = "PT00H00M00S";
			oEntry.RemarqueAdmin = " ";
			oEntry.RemarqueUser = " ";
			oEntry.MontantRembourse = "0";
			oEntry.Etat = "ENR";
			oEntry.RaisonTrajet = this.getView().byId('raisonTrajet').getSelectedKey();
			oEntry.ModeEncodage = "ASS";

			var oModel = this.getOwnerComponent().getModel("Trajet");
			oModel.create("/Trajet_SpecifiqueSet", oEntry, {
				success: function (oData, reponse) {
					that.onSaveSubVoyage(oData.Id);
				},
				error: function (oError) {
					var msg = JSON.parse(oError.responseText).error.message.value;
					sap.m.MessageBox.error(msg);
				}
			});
		},

		onSaveSubVoyage: function (fk) {
			var that = this;
			var oEntry = {};
			var oModel = this.getOwnerComponent().getModel("Sous_Trajet");
			oEntry.Begda = oToday;
			oEntry.Endda = "9999-12-31T00:00:00";
			oEntry.Depart = startAd;
			oEntry.Destination = endAd;
		    oEntry.Etat = "ENR";	
			dis = dis + "";
		
			oEntry.DistancePrevu = dis;
			dis = 0;

			oEntry.Transport = this.getView().byId("transport").getSelectedKey();
			oEntry.FkTrajet = fk;

			oModel.create("/Sous_TrajetSet", oEntry, {
				success: function (oData, reponse) {
					var transText;
					if(oData.Transport === 'VEL'){
						transText = 'à vélo';
					}else{
						transText = 'à pied';
					}
					
					
					sap.m.MessageBox.show("Encodage réussi! Vous avez traversé "+oData.DistancePrevu+" km "+ transText+"!");
				
					var disText = that.getView().byId("distance");
					disText.setText(0);
					

				},
				error: function (oError) {
					var msg = JSON.parse(oError.responseText).error.message.value;
					sap.m.MessageBox.error(msg);
					//reset distance
					var disText = that.getView().byId("distance");
					disText.setText(0);
					var route = that.getView().byId("route");
					route.setPosition("");
				}
			});
		},

		onNavigateToTrajets: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Trajet");
		},

		onNavigateToPlanner: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			if ($.sap.routineCreated === false) {
				router.navTo("RoutinePlanner");
			} else {
				router.navTo("Planner");
			}
		},
		onNavigateToMain: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("TargetMainView");

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.Record
		 */
		onBeforeRendering: function () {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.Record
		 */
		onAfterRendering: function () {

		}

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.Record
		 */
		//	onExit: function() {
		//
		//	}

	});

});