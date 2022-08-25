sap.ui.define([], function () {
	"use strict";
	return {
		formatEtat: function (etat) {
			if (etat !== null) {
				if (etat === "ENR") {
					return "Enregistré";
				} else if (etat === "SOU") {
					return "Soumis";
				} else if (etat === "REJ") {
					return "Réjeté";
				} else if(etat==="APP"){
					return "Approbation termninée";
				}else if(etat==="REM"){
					return "Remboursé";
				}
				
			}
			return "";
		},
		formatRaison: function (raison) {
			if (raison !== null) {
				if (raison === "TRA") {
					return "Travail";
				} else if (raison === "FOR") {
					return "Formation";
				}
				return "Réunion Client";
			}
			return "";
		}
	};
});