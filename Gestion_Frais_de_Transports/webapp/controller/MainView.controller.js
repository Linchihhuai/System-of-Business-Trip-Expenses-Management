sap.ui.define([
	"sap/ui/core/mvc/Controller", "../util/formatter", "sap/ui/model/json/JSONModel"
], function (Controller, Formatter, JSONModel) {
	"use strict";
	var gST = [];
	var cerealsSvg = "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"" +
		"viewBox=\"6.951000213623047 0.7209998965263367 15.062000274658203 29.104000091552734\" xml:space=\"preserve\">" +
		"<path data-shape-id=\"cereal-1\" d=\"M14.664,29.825c-0.133,0-0.217-0.004-0.236-0.005l-0.202-0.01l-0.032-0.2" +
		"c-0.021-0.137-0.515-3.368,1.238-5.323c1.754-1.954,5.02-1.814,5.158-1.806l0.202,0.01l0.032,0.2" +
		"c0.021,0.137,0.516,3.368-1.238,5.323C18.082,29.69,15.467,29.825,14.664,29.825z\" />" +
		"<path data-shape-id=\"cereal-2\" d=\"M13.626,25.116c-0.803,0-3.417-0.135-4.922-1.811c-1.753-1.955-1.26-5.186-1.238-5.322l0.032-0.2l0.202-0.01" +
		"c0.14-0.004,3.404-0.148,5.158,1.806l0,0c1.754,1.955,1.26,5.186,1.238,5.323l-0.032,0.2l-0.202,0.01" +
		"C13.843,25.112,13.759,25.116,13.626,25.116z\" />" +
		"<path data-shape-id=\"cereal-3\" d=\"M15.337,21.752c-0.133,0-0.217-0.004-0.236-0.005l-0.202-0.01l-0.032-0.2" +
		"c-0.021-0.137-0.515-3.368,1.238-5.323c1.754-1.954,5.018-1.813,5.158-1.806l0.202,0.01l0.032,0.2" +
		"c0.021,0.137,0.516,3.368-1.238,5.323C18.755,21.617,16.14,21.752,15.337,21.752z \" />" +
		"<path data-shape-id=\"cereal-4\" d=\"M13.626,17.432c-0.803,0-3.417-0.135-4.922-1.811c-1.753-1.955-1.26-5.186-1.238-5.322l0.032-0.2l0.202-0.01" +
		"c0.14-0.005,3.404-0.148,5.158,1.806l0,0c1.754,1.955,1.26,5.186,1.238,5.323l-0.032,0.2l-0.202,0.01" +
		"C13.843,17.428,13.759,17.432,13.626,17.432z\" />" +
		"<path data-shape-id=\"cereal-5\" d=\"M15.337,14.068c-0.133,0-0.217-0.004-0.236-0.005l-0.202-0.01l-0.032-0.2" +
		"c-0.021-0.137-0.515-3.368,1.238-5.323c1.754-1.954,5.018-1.814,5.158-1.806l0.202,0.01l0.032,0.2" +
		"c0.021,0.137,0.516,3.368-1.238,5.323C18.755,13.933,16.14,14.068,15.337,14.068z \" />" +
		"<path data-shape-id=\"cereal-6\" d=\"M13.107,10.54l-0.164-0.119c-0.112-0.081-2.747-2.017-2.889-4.64c-0.143-2.623,2.268-4.832,2.37-4.924" +
		"l0.15-0.136l0.164,0.119c0.112,0.081,2.746,2.017,2.888,4.64c0.143,2.623-2.267,4.832-2.369,4.924L13.107,10.54z \" />" +
		"</svg>";

	return Controller.extend("fiori.gft.Gestion_Frais_de_Transports.controller.MainView", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.MainView
		 */
		formatter: Formatter,
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(this._onRouteMatched, this);

			var oCustomShape = this.getView().byId("cShape");
			oCustomShape.setDefinition(cerealsSvg);

			this.getGreenscore();
			this.getSousTrajets();

			setTimeout(this.checkMainTab.bind(this), 1000);
		},

		_onRouteMatched: function (oEvent) {
			var tabMain = this.getView().byId("tab");
			tabMain.getBinding("items").refresh();
		},

		onNavigateToTrajets: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Trajet");
		},

		onNavigateToRecord: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Record");
		},

		onNavigateToPlanner: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			if ($.sap.routineCreated === false) {
				router.navTo("RoutinePlanner");
			} else {
				router.navTo("Planner");
			}
		},

		getSousTrajets: function () {
			var that = this;
			var oModel = that.getOwnerComponent().getModel("Sous_Trajet");
			var ST = [];
			oModel.read("/Sous_TrajetSet", {
				success: function (oData) {
					for (var i = 0; i < oData.results.length; i++) {

						if ((oData.results[i].Etat === 'REM' || oData.results[i].Etat === 'REJ') && oData.results[i].FkTrajet !== "00000000") {
							ST.push(oData.results[i]);
						}
					}
					that.fillGST(ST);
					
					// compare date
					ST = [];
					var month = new Date().getMonth()+ 1;
					var year = new Date().getYear()+1900+"";
						switch (month) {
						case 1:
							month = 'Jan';
							break;
						case 2:
							month = 'Feb';
							break;
						case 3:
							month = 'Mar';
							break;
						case 4:
							month = 'Apr';
							break;

						case 5:
							month = 'May';
							break;
						case 6:
							month = 'Jun';
							break;
						case 7:
							month = 'Jul';
							break;
						case 8:
							month = 'Aug';
							break;
						case 9:
							month = 'Sep';
							break;
						case 10:
							month = 'Oct';
							break;
						case 11:
							month = 'Nov';
							break;
						case 12:
							month = 'Doc';
							break;
						}
					for(var j=0;j<gST.length;j++){
						var oMonth = gST[j].Begda.toString().split(' ')[1];
						var oYear = gST[j].Begda.toString().split(' ')[3];
						
						if(year === oYear && oMonth===month){
							ST.push(gST[j]);
						}
					}
					
					that.onBindTableInfo(ST);

				},
				error: function (oError) {
					var msg = JSON.parse(oError.responseText).error.message.value;
					sap.m.MessageBox.error(msg);
				}
			});
		},

		getGreenscore: function () {
			var that = this;
			var model = this.getOwnerComponent().getModel("Greenscore");
			model.read("/GreenscoreSet(Mandt='',Pernr='')", {
				success: function (oData) {
					var gs = that.getView().byId("greenscore");
					gs.setValue(oData.Score);
				},
				error: function () {

				}
			});

		},

		checkMainTab: function () {
			var tab = this.getView().byId("tab");
			var oEntry = (tab.getItems() || []).map(function (oItem) {
				// assuming that you are using the default model  
				return oItem.getBindingContext("Routine").getObject();
			});

			if (oEntry.length === 0) {
				$.sap.routineCreated = false;
			} else {
				$.sap.routineCreated = true;
			}
		},

		onSelectionChangeRoutine: function (oEvent) {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			var oSelectedItem = oEvent.getParameter("listItem");
			var oContext = oSelectedItem.getBindingContext("Routine");
			router.navTo("RoutineDetail", {
				Id: oContext.getObject().Id
			});
		},

		fillGST: function (ST) {
			gST = ST;

		},

		onBindTableInfo: function (ST) {
			var oSousTrajet = [];

			for (var i = 0; i < ST.length; i++) {
				oSousTrajet.push({
					Id: ST[i].Id,
					Begda: ST[i].Begda,
					Nom: ST[i].Nom,
					DistancePrevu: ST[i].DistancePrevu,
					Frais: ST[i].Frais,
					Etat: ST[i].Etat,
					Transport: ST[i].Transport,
					FkRoutine: ST[i].FkRoutine

				});
			}
			var oModelSousTraj = new JSONModel(oSousTrajet);
			this.getView().setModel(oModelSousTraj, "mainSous_Trajet");
		},

		onDateFilter: function () {
			var date = this.getView().byId('date').getDateValue().toString();
			var month = date.split(' ')[1];
			var year = date.split(' ')[3];
			
		

			var STMonth;
			var STYear;
			var STTemp = [];

			for (var i = 0; i < gST.length; i++) {
				STMonth = gST[i].Begda.toString().split(' ')[1];

				STYear = gST[i].Begda.toString().split(' ')[3];
				
			
			

				if (month === STMonth && year === STYear) {
					STTemp.push(gST[i]);
				}
			}

			this.onBindTableInfo(STTemp);
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.MainView
		 */
		onBeforeRendering: function () {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.MainView
		 */
		onAfterRendering: function () {

		}

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.MainView
		 */
		//	onExit: function() {
		//
		//	}

	});

});