sap.ui.define([
	"sap/ui/core/mvc/Controller", "../util/formatter", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel",
	"sap/m/Dialog", "sap/m/DialogType", "sap/m/Button", "sap/m/ButtonType", "sap/m/MessageToast", "sap/ui/core/Core"
], function (Controller, Formatter, Filter, FilterOperator, JSONModel, Dialog, DialogType, Button, ButtonType, MessageToast, Core) {
	"use strict";
	jQuery.sap.require("sap.ca.ui.dialog.factory");
	var Id;
	var ST = [];
	var btnCnt = 0;
	var combCnt = 0;
	var disCnt = 0;
	var fraisCnt = 0;
	return Controller.extend("fiori.gft.Gestion_Frais_de_Transports.controller.TrajetDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.TrajetDetail
		 */

		formatter: Formatter,
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(this._onRouteMatched, this);
			this.onGetTableInfo();

		},
		_onRouteMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/" + oEvent.getParameter("arguments").Id,
				model: "Trajet"
			});

			Id = oEvent.getParameter("arguments").Id;
			var oTableST = this.getView().byId("tabST");
			var oTableTra = this.getView().byId("tabTra");
			var oFilterST = new sap.ui.model.Filter("FkTrajet", "EQ", Id);
			var oFilterTra = new sap.ui.model.Filter("Id", "EQ", Id);
			oTableST.getBinding("items").filter([oFilterST]);
			oTableTra.getBinding("items").filter([oFilterTra]);
			this.onGetTableInfo();
			setTimeout(this.checkStatus.bind(this), 1500);

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
		onNavigateToMain: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("TargetMainView");

		},

		onGetTableInfo: function () {
			var that = this;

			var oModel = this.getOwnerComponent().getModel("Sous_Trajet");
			oModel.read("/Sous_TrajetSet", {
				success: function (oData) {
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].FkTrajet === Id) {
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
		},

		onBindTableInfo: function (oData) {
			var oSousTrajet = [];

			for (var i = 0; i < ST.length; i++) {
				oSousTrajet.push({
					Id: ST[i].Id,
					DistancePrevu: ST[i].DistancePrevu,
					Frais: ST[i].Frais,
					Transport: ST[i].Transport,
					FkTrajete: ST[i].FkTrajet
				});
			}
			var oModelSousTraj = new JSONModel(oSousTrajet);
			this.getView().setModel(oModelSousTraj, "mSous_Trajet");
		},

		onShowDetails: function (oEvent) {
			btnCnt++;
			combCnt++;
			disCnt++;
			fraisCnt++;
			var oSelectedItem = oEvent.getParameter("listItem");
			var oContext = oSelectedItem.getBindingContext("Sous_Trajet");
			var detailId = oContext.getObject().Id;
			var enabled = true;
			var oSt = {};

			if (oContext.getObject().Etat !== "ENR") enabled = false;

			for (var i = 0; i < ST.length; i++) {
				if (ST[i].Id === detailId) oSt = ST[i];
			}

			this.oSubmitDialog = new Dialog({

				type: DialogType.Message,
				title: "Détail du trajet selectionné",
				content: [
					new sap.m.Label({
						text: "Moyen de Transport"
					}),
					new sap.m.ComboBox({
						id: "comb" + combCnt,
						width: "100%",
						selectedKey: oSt.Transport,
						items: [
							new sap.ui.core.Item({
								text: "Metro",
								key: "MET"
							}),
							new sap.ui.core.Item({
								text: "Voiture",
								key: "VOI"
							}),
							new sap.ui.core.Item({
								text: "Co-Voiturage",
								key: "COV"
							}),
							new sap.ui.core.Item({
								text: "Bus",
								key: "BUS"
							}),
							new sap.ui.core.Item({
								text: "Tram",
								key: "TRM"
							}),
							new sap.ui.core.Item({
								text: "Train",
								key: "TRN"
							}),
							new sap.ui.core.Item({
								text: "A pied",
								key: "PIE"
							}),
							new sap.ui.core.Item({
								text: "Vélo",
								key: "VEL"
							})
						]
					}),
					new sap.m.Label({
						text: "Distance"
					}),
					new sap.m.Input({
						id: 'dis' + disCnt,
						value: oSt.DistancePrevu,
						width: "100%",

					}),
					new sap.m.Label({
						text: "Frais"
					}),
					new sap.m.Input({
						id: 'frais' + fraisCnt,
						value: oSt.Frais,
						width: "100%",

					})
				],
				beginButton: new Button({
					id: 'btnUpdate' + btnCnt,
					type: ButtonType.Emphasized,
					text: "Submit",
					enabled: enabled,
					press: function () {

						var oTrans = sap.ui.getCore().byId('comb' + combCnt).getSelectedKey();
						var oDis = sap.ui.getCore().byId('dis' + disCnt).getValue();
						var oFrais = sap.ui.getCore().byId('frais' + fraisCnt).getValue();
						oSt.DistancePrevu = oDis;
						oSt.Frais = oFrais;
						oSt.Transport = oTrans;
						this.onDetailUpdate(oSt);
					}.bind(this)
				}),
				endButton: new Button({
					text: "Cancel",
					press: function () {
						this.oSubmitDialog.close();
					}.bind(this)
				})
			});

			this.oSubmitDialog.open();
		},

		onDetailDelete: function () {
			var that = this;
			sap.ca.ui.dialog.confirmation.open({
				title: "Supprimer ce trajet",
				question: "Êtes vous sûr de vouloir supprimer ce trajet?",
				confirmButtonLabel: "Confirmer"
			}, function (oResult) {
				if (oResult) {

					if (oResult.isConfirmed) {

						var oModel = that.getOwnerComponent().getModel("Trajet");
						oModel.remove("/Trajet_SpecifiqueSet(Mandt='',Pernr='',Id='" + Id + "')", {
							success: function (oData) {
								sap.m.MessageToast.show("Deletion successful");
								that.onNavigateToTrajets();
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

		onDetailUpdate: function (oSt) {
			var that = this;
			//read values of trajet specifique
			var oTableTra = that.getView().byId("tabTra");
			var oEntryTra = (oTableTra.getItems() || []).map(function (oItem) {
			
				return oItem.getBindingContext("Trajet").getObject();
			});

			var oModel = that.getOwnerComponent().getModel("Trajet");

			oModel.update("/Trajet_SpecifiqueSet(Mandt='',Pernr='" + oEntryTra[0].Pernr + "',Id='" + Id + "')", oEntryTra[0], {
				success: function (oData) {

				},
				error: function (oError) {
					var msg = JSON.parse(oError.responseText).error.message.value;
					sap.m.MessageBox.error(msg);
				}
			});

			var oEntryST = {};
			oEntryST = oSt;
			oModel = that.getOwnerComponent().getModel("Sous_Trajet");

			oModel.update("/Sous_TrajetSet(Mandt='',Id='" + oEntryST.Id + "',FkTrajet='" + oEntryST.FkTrajet + "',FkRoutine='')",
				oEntryST, {
					success: function (oData) {
						sap.m.MessageToast.show("Mise à jour réussi.");

					},
					error: function (oError) {
						var msg = JSON.parse(oError.responseText).error.message.value;
						sap.m.MessageBox.error(msg);
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
				//read values of trajet specifique
				if (oResult) {
					if (oResult.isConfirmed) {
						var oTableTra = that.getView().byId("tabTra");
						var oEntryTra = (oTableTra.getItems() || []).map(function (oItem) {
							return oItem.getBindingContext("Trajet").getObject();
						});

						//read values of sous trajets
						var oTableST = that.getView().byId("tabST");
						var oEntryST = (oTableST.getItems() || []).map(function (oItem) {
							return oItem.getBindingContext("Sous_Trajet").getObject();
						});

						oEntryTra[0].Etat = "SOU";
						oEntryTra[0].RemarqueUser = remarque;

						var oModel = that.getOwnerComponent().getModel("Trajet");
						oModel.update("/Trajet_SpecifiqueSet(Mandt='',Pernr='" + oEntryTra[0].Pernr + "',Id='" + Id + "')", oEntryTra[0], {
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
							oEntryST[i].Etat = "SOU";
							oModel.update("/Sous_TrajetSet(Mandt='',Id='" + oEntryST[i].Id + "',FkTrajet='" + oEntryST[i].FkTrajet + "',FkRoutine='')",
								oEntryST[i], {
									success: function (oData) {
										sap.m.MessageToast.show("Votre trajet a été soumis");

									},
									error: function (oError) {
										var msg = JSON.parse(oError.responseText).error.message.value;
										sap.m.MessageBox.error(msg);
									}
								});
						}
						that.makeUneditable();
					}
				}

			});

		},

		makeUneditable: function () {
			var tabTra = this.getView().byId("tabTra").getItems();
			var tabST = this.getView().byId("tabST").getItems();
			var btn = this.getView().byId("btn");
			var textArea = this.getView().byId("remarque");
			var deleteBtn = this.getView().byId("deleteButton");
		

			tabTra.forEach(function (Field) {
				var Cells = Field.getCells();
				Cells[0].setEnabled(false);
			});

			tabST.forEach(function (Field) {
				var Cells = Field.getCells();

				for (var i = 0; i < Cells.length; i++) {
					Cells[i].setEnabled(false);
				}
			});

			btn.setEnabled(false);
			deleteBtn.setEnabled(false);
			textArea.setEnabled(false);

		},

		checkStatus: function () {
			var oTableTra = this.getView().byId("tabTra");
			var oFilterTra = new sap.ui.model.Filter("Id", "EQ", Id);
			oTableTra.getBinding("items").filter([oFilterTra]);
			var oEntryTra = (oTableTra.getItems() || []).map(function (oItem) {
				return oItem.getBindingContext("Trajet").getObject();
			});

			if (oEntryTra[0].Etat !== "ENR") {
				this.makeUneditable();
			} else {
				this.makeEditable();
			}
		},

		makeEditable: function () {
			var tabTra = this.getView().byId("tabTra").getItems();
			var tabST = this.getView().byId("tabST").getItems();
			var btn = this.getView().byId("btn");
			var textArea = this.getView().byId("remarque");
			var deleteBtn = this.getView().byId("deleteButton");

			tabTra.forEach(function (Field) {
				var Cells = Field.getCells();
				Cells[0].setEnabled(true);
			});

			tabST.forEach(function (Field) {
				var Cells = Field.getCells();

				for (var i = 0; i < Cells.length; i++) {
					Cells[i].setEnabled(true);
				}
			});

			btn.setEnabled(true);
			textArea.setEnabled(true);
			deleteBtn.setEnabled(true);
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.TrajetDetail
		 */
		onBeforeRendering: function () {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.TrajetDetail
		 */
		onAfterRendering: function () {
			setTimeout(this.checkStatus.bind(this), 1000);
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.TrajetDetail
		 */
		onExit: function () {

		}

	});

});