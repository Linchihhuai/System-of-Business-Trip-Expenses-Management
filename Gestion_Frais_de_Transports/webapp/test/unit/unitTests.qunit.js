/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"fiori/gft/Gestion_Frais_de_Transports/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});