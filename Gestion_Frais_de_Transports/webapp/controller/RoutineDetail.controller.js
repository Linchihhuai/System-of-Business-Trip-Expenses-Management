sap.ui.define([
	"sap/ui/core/mvc/Controller", "../util/formatter", "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel"
], function (Controller, Formatter, Filter, FilterOperator, JSONModel) {
	"use strict";
	jQuery.sap.require("sap.ca.ui.dialog.factory");
	var Id;
	var ST = [];
	return Controller.extend("fiori.gft.Gestion_Frais_de_Transports.controller.RoutineDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.RoutineDetail
		 */

		formatter: Formatter,
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(this._onRouteMatched, this);

			var oInfo = {
				Info: {
					AddrMaison: "",
					AddrTravail: ""
				}
			};

			var oModelInfo = new JSONModel(oInfo);
			this.getView().setModel(oModelInfo, "Info");

			this.onGetTableInfo();

		},

		_onRouteMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/" + oEvent.getParameter("arguments").Id,
				model: "Routine",

			});

			Id = oEvent.getParameter("arguments").Id;
			var oTableRou = this.getView().byId("tabRou");
			var oFilterRou = new sap.ui.model.Filter("Id", "EQ", Id);
			oTableRou.getBinding("items").filter([oFilterRou]);

			setTimeout(this.checkStatus.bind(this), 1500);
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

		onNavigateToRecord: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Record");
		},

		onGetTableInfo: function () {
			var that = this;

			var oModel = this.getOwnerComponent().getModel("Sous_Trajet");
			oModel.read("/Sous_TrajetSet", {
				success: function (oData) {
					

					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].FkRoutine === Id) {
							ST.push(oData.results[i]);
						}
					}

					that.onBindTableInfo();
				},
				error: function (oError) {
					var msg = JSON.parse(oError.responseText).error.message.value;
					sap.m.MessageBox.error(msg);
				}
			});

			oModel = this.getOwnerComponent().getModel("User_Info");
			oModel.read("/User_InfoSet(Mandt='',Pernr='')", {
				success: function (oData) {
					that.getView().getModel("Info").setProperty("/Info/AddrMaison", oData.AddrMaison);
					that.getView().getModel("Info").setProperty("/Info/AddrTravail", oData.AddrTravail);

				},
				error: function (oError) {
					var msg = JSON.parse(oError.responseText).error.message.value;
					sap.m.MessageBox.error(msg);
				}
			});
		},

		onBindTableInfo: function () {
			var oSousTrajet = [];

			for (var i = 0; i < ST.length; i++) {
				oSousTrajet.push({
					Id: ST[i].Id,
					DistancePrevu: ST[i].DistancePrevu,
					Frais: ST[i].Frais,
					Transport: ST[i].Transport,
					FkRoutine: ST[i].FkRoutine

				});
			}
			var oModelSousTraj = new JSONModel(oSousTrajet);
			this.getView().setModel(oModelSousTraj, "Sous_Trajet");
		},
		
		onDetailUpdate: function () {
			var that = this;
			sap.ca.ui.dialog.confirmation.open({
				title: "Mettre à jour votre trajet routinier",
				question: "Êtes vous sûr de vouloir continuer?",
				confirmButtonLabel: "Confirmer"
			}, function (oResult) {
				//read values of trajet specifique
			
				if (oResult.isConfirmed) {
				
					var oTableTra = that.getView().byId("tabRou");
					var oEntryTra = (oTableTra.getItems() || []).map(function (oItem) {
						
						return oItem.getBindingContext("Routine").getObject();
					});

					//read values of sous trajets
					var oTableST = that.getView().byId("tabST2");
					var oEntryST = (oTableST.getItems() || []).map(function (oItem) {
						
						return oItem.getBindingContext("Sous_Trajet").getObject();
					});

					var oModel = that.getOwnerComponent().getModel("Routine");
					oModel.update("/RoutineSet(Mandt='',Pernr='" + oEntryTra[0].Pernr + "',Id='" + Id + "')", oEntryTra[0], {
						success: function (oData) {

						},
						error: function (oError) {
							var msg = JSON.parse(oError.responseText).error.message.value;
							sap.m.MessageBox.error(msg);
						}
					});

					var length = oEntryST.length;
					oModel = that.getOwnerComponent().getModel("Sous_Trajet");

					for (var i = 0; i < length; i++) {
						oModel.update("/Sous_TrajetSet(Mandt='',Id='" + oEntryST[i].Id + "',FkTrajet='',FkRoutine='" + oEntryST[i].FkRoutine + "')",
							oEntryST[i], {
								success: function (oData) {
									sap.m.MessageToast.show("Mise à jour réussi.");

								},
								error: function (oError) {
									var msg = JSON.parse(oError.responseText).error.message.value;
									sap.m.MessageBox.error(msg);
								}
							});
					}
				}

			});

		},

		submit: function () {
			var that = this;
			var remarque = this.getView().byId("remarque").getValue();
			sap.ca.ui.dialog.confirmation.open({
				title: "Soumission trajet.",
				question: "Êtes vous sûr de vouloir continuer? Vous ne pourrez plus modifier ce trajet une fois soumis!",
				confirmButtonLabel: "Confirmer"
			}, function (oResult) {
				if (oResult.isConfirmed) {
					//read values of trajet specifique
					var oTableTra = that.getView().byId("tabRou");
					var oEntryTra = (oTableTra.getItems() || []).map(function (oItem) {
					
						return oItem.getBindingContext("Routine").getObject();
					});

					//read values of sous trajets
					var oTableST = that.getView().byId("tabST2");
					var oEntryST = (oTableST.getItems() || []).map(function (oItem) {
						
						return oItem.getBindingContext("Sous_Trajet").getObject();
					});

					oEntryTra[0].Etat = "SOU";
					oEntryTra[0].RemarqueUser = remarque;

					var oModel = that.getOwnerComponent().getModel("Routine");
					oModel.update("/RoutineSet(Mandt='',Pernr='" + oEntryTra[0].Pernr + "',Id='" + Id + "')", oEntryTra[0], {
						success: function (oData) {

						},
						error: function (oError) {
							var msg = JSON.parse(oError.responseText).error.message.value;
							sap.m.MessageBox.error(msg);
						}
					});

					var length = oEntryST.length;
					
					oModel = that.getOwnerComponent().getModel("Sous_Trajet");

					for (var i = 0; i < length; i++) {
						oEntryST[i].Etat="SOU";
						oModel.update("/Sous_TrajetSet(Mandt='',Id='" + oEntryST[i].Id + "',FkTrajet='',FkRoutine='" + oEntryST[i].FkRoutine + "')",
							oEntryST[i], {
								success: function (oData) {
									sap.m.MessageToast.show("Votre trajet routinier a été soumis.");

								},
								error: function (oError) {
									var msg = JSON.parse(oError.responseText).error.message.value;
									sap.m.MessageBox.error(msg);
								}
							});
					}
					that.makeUneditable();
				}

			});

		},

		makeUneditable: function () {
			var tabRou = this.getView().byId("tabRou").getItems();
			var tabST = this.getView().byId("tabST2").getItems();
			var btn = this.getView().byId("btn");
			var textArea = this.getView().byId("remarque");
			var deleteBtn = this.getView().byId("deleteButton");
			var updateBtn = this.getView().byId("updateButton");
			tabRou.forEach(function (Field) {
				var Cells = Field.getCells();
				Cells[0].setEnabled(false);
			});
			// 
			tabST.forEach(function (Field) {
				var Cells = Field.getCells();

				for (var i = 0; i < Cells.length; i++) {
					Cells[i].setEnabled(false);
				}
			});
			deleteBtn.setEnabled(false);
			updateBtn.setEnabled(false);
			btn.setEnabled(false);
			textArea.setEnabled(false);
		},

		checkStatus: function () {
			var oTableRou = this.getView().byId("tabRou");
			var oEntryRou = (oTableRou.getItems() || []).map(function (oItem) {
			
				return oItem.getBindingContext("Routine").getObject();
			});

			if (oEntryRou[0].Etat !== "ENR") this.makeUneditable();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.RoutineDetail
		 */
		onBeforeRendering: function () {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.RoutineDetail
		 */
		onAfterRendering: function () {
			setTimeout(this.checkStatus.bind(this), 1000);
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.RoutineDetail
		 */
		//	onExit: function() {
		//
		//	}

	});

});