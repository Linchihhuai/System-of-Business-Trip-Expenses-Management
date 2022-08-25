sap.ui.define([
	"sap/ui/core/mvc/Controller", "../util/formatter"
], function (Controller, Formatter) {
	"use strict";

	return Controller.extend("fiori.gft.Gestion_Frais_de_Transports.controller.Trajet", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.Trajet
		 */
		formatter: Formatter,
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function (oEvent) {
			var tabTra = this.getView().byId("tabTra");
			tabTra.getBinding("items").refresh();
		
		},
		
		onNavigateToRecord: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Record");
		},
		
		onNavigateToPlanner: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			if ($.sap.routineCreated === true) {
				router.navTo("Planner");
			} else {
				router.navTo("RoutinePlanner");
			}
		},
		onNavigateToMain: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("TargetMainView");
		},
		onSelectionChange: function (oEvent) {

			var router = sap.ui.core.UIComponent.getRouterFor(this);
			var oSelectedItem = oEvent.getParameter("listItem");
			var oContext = oSelectedItem.getBindingContext("Trajet");

			router.navTo("TrajetDetail", {
				Id: oContext.getObject().Id
			});
		}


	});

});