sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/base/i18n/ResourceBundle"
], function (Controller, JSONModel, ResrouceBundle) {
	"use strict";
	var fragId = 0;
	var fragCreated = 0;
	var frags = [];
	var oToday;
	var regex = /^[0-9]+[0-9]*\.*[0-9]*$/;
	var valueCheck = true;
	var generatedCBoxes = [];
	var addedTransportType = false;
	var changefragIndex = 0;

	return Controller.extend("fiori.gft.Gestion_Frais_de_Transports.controller.Planner", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.Planner
		 */
		onInit: function () {

			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();

			oToday = (yyyy + '-' + mm + '-' + dd);

			var oTrajetSpecifique = {
				TrajetSpecifique: {
					Nom: "",
					Begda: oToday,
					Endda: "",
					RemarqueAdmin: "",
					RemarqueUser: "",
					DistancePrevu: "",
					DistanceParcouru: "",
					TempsPrevu: "",
					TempsEnMotion: "",
					MontantRembourse: "",
					Etat: "ENR",
					RaisonTrajet: "TRA",
					ModeEncodage: ""
				}
			};
			var oSousTrajet = {
				SousTrajet: {
					Depart: "",
					Destination: "",
					DistancePrevu: "0",
					DistanceParcouru: "",
					Begda: "",
					Endda: "",
					TempsPrevu: "",
					TempsEnMotion: "",
					Transport: "",
					Etat: "ENR",
					Frais: "0",
					MontantRembourse: "",
					FKRoutine: "",
					FKTrajet: ""
				}
			};

			var oModelTrajetSpecifique = new JSONModel(oTrajetSpecifique);
			this.getView().setModel(oModelTrajetSpecifique, "TrajetSpecifique");

			var oModelSousTrajet = new JSONModel(oSousTrajet);
			this.getView().setModel(oModelSousTrajet, "SousTrajet");

			generatedCBoxes.push({
				Id: "__xmlview0--transport-inner",
				FieldId: ""
			});
		},

		onNavigateToTrajets: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Trajet");
		},

		onNavigateToRecord: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Record");
		},

		onNavigateToMain: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("TargetMainView");
		},

		onNavigateToRoutinePlanner: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("RoutinePlanner");
		},

		onSavePressed: function (oEvent) {
			this.enableButton(false);
			var check = this._onSubmitCheck();

			if (check === false && valueCheck === false) {
				var oModel;
				var oEntry = {};

				oEntry.Id = "";
				oEntry.Nom = this.getView().getModel("TrajetSpecifique").getProperty("/TrajetSpecifique/Nom");
				oEntry.Begda = this.resolveTimeDifference(this.getView().byId("dateTrajet").getDateValue());

			

				oEntry.Endda = "9999-12-31T00:00:00";
				oEntry.DistancePrevu = "0.00";
				oEntry.DistanceParcouru = "0.00";
				oEntry.TempsPrevu = "PT00H00M00S";
				oEntry.TempsEnMotion = "PT00H00M00S";
				oEntry.RemarqueAdmin = " ";
				oEntry.RemarqueUser = " ";
				oEntry.MontantRembourse = "0";
				oEntry.Etat = "ENR";
				oEntry.RaisonTrajet = this.getView().getModel("TrajetSpecifique").getProperty("/TrajetSpecifique/RaisonTrajet");
				oEntry.ModeEncodage = "MAN";

				var that = this;

				//	Check necessary field
				if (oEntry.nom === "" || oEntry.Begda === "" || oEntry.RaisonTrajet === "") {
					sap.m.MessageBox.show("Il y a un champ qui n'a pas été remplis.");
					return;
				}

				oModel = this.getOwnerComponent().getModel("Trajet");
				oModel.create("/Trajet_SpecifiqueSet", oEntry, {
					success: function (oData, reponse) {
						that.onSaveSousTrajet(oData.Id);
					},
					error: function (oError) {
						var msg = JSON.parse(oError.responseText).error.message.value;
						sap.m.MessageBox.error(msg);
					}
				});
			} else {
				this.enableButton(true);
				sap.m.MessageBox.show("Il y a des champs qui ne sont pas remplis ou les valeurs entrées ne sont pas valides.");
			}

		},

		onSaveSousTrajet: function (fk) {
			var that = this;
			var index = frags.length;
			var debut = true;
			var promises = [];
			var lFragCreated = fragCreated;
			var oModel = this.getOwnerComponent().getModel("Sous_Trajet");

			for (var i = 0; i <= lFragCreated; i++) {
				var oEntry = {};
				oEntry.Begda = this.resolveTimeDifference(this.getView().byId("dateTrajet").getDateValue());
				oEntry.Endda = "9999-12-31T00:00:00";
				if (debut === true) {
					var id = generatedCBoxes[0].FieldId;
					if (id.match(/^(fragFrais).*$/)) {
						oEntry.Frais = sap.ui.getCore().byId(id + "--fraisRou").getValue();
					} else {
						oEntry.DistancePrevu = sap.ui.getCore().byId(id + "--distanceRou").getValue();
					}

					oEntry.Depart = this.getView().getModel("SousTrajet").getProperty("/SousTrajet/Depart");
					oEntry.Destination = this.getView().getModel("SousTrajet").getProperty("/SousTrajet/Destination");
					oEntry.Transport = this.getView().getModel("SousTrajet").getProperty("/SousTrajet/Transport");

					debut = false;
				} else {
					id = generatedCBoxes[index].FieldId;

					if (id.match(/^(fragFrais).*$/)) {
						oEntry.Frais = sap.ui.getCore().byId(id + "--fraisRou").getValue();
					} else {
						oEntry.DistancePrevu = sap.ui.getCore().byId(id + "--distanceRou").getValue();
					}

					oEntry.Depart = sap.ui.getCore().byId("fragTra" + frags[index - 1] + "--departTra").getValue();
					oEntry.Destination = sap.ui.getCore().byId("fragTra" + frags[index - 1] + "--destinationTra").getValue();
					oEntry.Transport = sap.ui.getCore().byId("fragTra" + frags[index - 1] + "--transportTra").getSelectedKey();
					index--;
				}
				//causes deserialization error
				oEntry.Nom = oEntry.Depart + " à " + oEntry.Destination;
				oEntry.Etat = "ENR";
				oEntry.FkTrajet = fk;
				//create and push promise
				var promise = new Promise(
					function (resolve, reject) {
						oModel.create("/Sous_TrajetSet", oEntry, {
							success: function (oData) {
								resolve(oData);
							},
							error: function (oError) {
								reject(oError);
							}
						});
					}
				);

				promises.push(promise);
			}

			//send promises when all sous_trajets are created
			Promise.all(promises).then(
				that.handlePromiseSuccess.bind(that),
				that.handlePromiseReject.bind(that, fk)
			);
			that.onClearForm();
		},

		handlePromiseSuccess: function (oValue) {
			sap.m.MessageBox.show("Encodage réussi");
			this.enableButton(true);
		},

		handlePromiseReject: function (fk, oError) {
			this.enableButton(true);
			var that = this;
			var oModelDel = that.getOwnerComponent().getModel("Trajet");
			oModelDel.remove("/Trajet_SpecifiqueSet(Mandt='',Pernr='',Id='" + fk + "')", {
				success: function (oData) {
					sap.m.MessageBox.error("Une erreur est survenue, l'encodage n'a pas réussi.");
				},
				error: function (oErrorDel) {
					sap.m.MessageBox.error("Une erreur est survenue, contactez votre IT consultant.");
				}
			});

		},

		onAddForm: function () {

			fragId++;
			fragCreated++;

			var form = this.getView().byId("form");
			var formAddPoint = form.indexOfContent(this.getView().byId("detailTB"));
			var oFragment = sap.ui.xmlfragment("fragTra" + fragId, "fiori.gft.Gestion_Frais_de_Transports.fragments.SousTrajet", this);
			var sId = fragId;
			frags.push(sId);

			var generatedCBox = {};
			oFragment.forEach(function (oElement) {

				if (oElement.getMetadata().getName() === "sap.m.ComboBox") {
					generatedCBox.Id = oElement.getId();
					generatedCBox.Change = false;
					generatedCBoxes.push(generatedCBox);
				}
				form.insertContent(oElement, formAddPoint);
				formAddPoint++;
			});
			
		},

		onDeleteForm: function () {
			if (fragCreated > 0) {
				var index = generatedCBoxes[generatedCBoxes.length - 1].Change ? 9 : 7;
				var form = this.getView().byId("form");
				var formDeletePoint = form.indexOfContent(this.getView().byId("detailTB")) - 1;

				var sc = this.getView().byId("form");
				for (var i = 0; i < index; i++) {
					sc.removeContent(formDeletePoint);
					formDeletePoint--;
				}
				fragCreated--;
				frags.pop();
				generatedCBoxes.pop();
			}

		},

		onClearForm: function () {
			var lFragCreated = fragCreated;
			var form = this.getView().byId("form");
			var transportField = this.getView().byId("transport");
			var removePoint = form.indexOfContent(transportField) + 1;
			for (var i = 0; i < lFragCreated; i++) {
				this.onDeleteForm();
			}
			this.getView().byId("depart").setValue("");
			this.getView().byId("destination").setValue("");
			this.getView().byId("transport").setSelectedKey("");
			this.getView().byId("nomTrajet").setValue("");
			this.getView().byId("raisonTrajet").setSelectedKey("TRA");
			this.getView().byId("dateTrajet").setValue(oToday);
			//remove input field and reset addedTransportType
			form.removeContent(removePoint);
			form.removeContent(removePoint);
			addedTransportType = false;
		},

		enableButton: function (boolValue) {
			var button = this.getView().byId("button");
			button.setEnabled(boolValue);
		},

		_onSubmitCheck: function () {
			var oForm = this.getView().byId("form").getContent();
			var sError = false;
			oForm.forEach(function (Field) {
				if (typeof Field.getValue === "function") {
					if (!Field.getValue() || Field.getValue().length < 1) {
						Field.setValueState("Error");
						sError = true;
						setTimeout(function () {
							Field.setValueState("None");
						}, 3000);

					} else {
						Field.setValueState("None");
					}
				}
			});
			return sError;
		},

		valueCheck: function (oEvent) {
			var input = oEvent.getSource();
			if (oEvent.getParameter("value") === "" || !oEvent.getParameter("value").match(regex)) {
				input.setValueState("Error");
				valueCheck = true;
			} else {
				input.setValueState("None");
				valueCheck = false;
			}
		},

		typeChange: function () {
			var type = this.getView().byId("transport").getSelectedKey();
			var form = this.getView().byId("form");

			var addPoint = form.indexOfContent(this.getView().byId("transport")) + 1;
			if (type !== "BUS" && type !== "TRN" && type !== "TRM" && type !== "MET") {
				//add distance input 
				if (addedTransportType === true) {
					form.removeContent(addPoint);
					form.removeContent(addPoint);
				}
				var oFragment = sap.ui.xmlfragment("fragDisTra" + changefragIndex, "fiori.gft.Gestion_Frais_de_Transports.fragments.Distance",
					this);
				oFragment.forEach(function (oElement) {
					form.insertContent(oElement, addPoint);
					addPoint++;
				});
				if (addedTransportType !== true) addedTransportType = true;
				this.updateFieldId("__xmlview0--transport-inner", "fragDisTra" + changefragIndex);
				changefragIndex++;
			
			} else {
				//add price input 
				if (addedTransportType === true) {
					form.removeContent(addPoint);
					form.removeContent(addPoint);
				}
				var oFragmentFrais = sap.ui.xmlfragment("fragFraisTra" + changefragIndex, "fiori.gft.Gestion_Frais_de_Transports.fragments.Frais",
					this);
				oFragmentFrais.forEach(function (oElement) {

					form.insertContent(oElement, addPoint);
					addPoint++;
				});
				if (addedTransportType !== true) addedTransportType = true;
				this.updateFieldId("__xmlview0--transport-inner", "fragFraisTra" + changefragIndex);
				changefragIndex++;
				

			}
		},

		typeChangeDyn: function (oEvent) {
			var form = this.getView().byId("form");
			var comboBoxId = oEvent.getSource().getId();
			var changeCheck = this.comboBoxCheck(comboBoxId);
			var combobox = sap.ui.getCore().byId(comboBoxId);
			var type = combobox.getSelectedKey();
			var addPoint = form.indexOfContent(combobox) + 1;

			if (type !== "BUS" && type !== "TRN" && type !== "TRM" && type !== "MET") {
				//add distance input 

				var oFragment = sap.ui.xmlfragment("fragDisTra" + changefragIndex, "fiori.gft.Gestion_Frais_de_Transports.fragments.Distance",
					this);

				oFragment.forEach(function (oElement) {
					if (changeCheck === true) {
						form.removeContent(addPoint);
					}
					form.insertContent(oElement, addPoint);

					addPoint++;
				});
				this.updateFieldId(comboBoxId, "fragDisTra" + changefragIndex);
				changefragIndex++;
				this.comboBoxChange(comboBoxId);
				
			} else {
				//add price input 
				var oFragmentFrais = sap.ui.xmlfragment("fragFraisTra" + changefragIndex, "fiori.gft.Gestion_Frais_de_Transports.fragments.Frais",
					this);
				oFragmentFrais.forEach(function (oElement) {
					if (changeCheck === true) {
						form.removeContent(addPoint);
					}
					form.insertContent(oElement, addPoint);

					addPoint++;
				});
				this.updateFieldId(comboBoxId, "fragFraisTra" + changefragIndex);
				changefragIndex++;
				this.comboBoxChange(comboBoxId);
			}
		},

		comboBoxCheck: function (key) {
			var bool = false;
			for (var i = 0; i < generatedCBoxes.length; i++) {
				if (generatedCBoxes[i].Id === key) {
					bool = generatedCBoxes[i].Change;
				}
			}
			return bool;
		},

		comboBoxChange: function (key) {
			for (var i = 0; i < generatedCBoxes.length; i++) {
				if (generatedCBoxes[i].Id === key) {
					generatedCBoxes[i].Change = true;
				}
			}
		},

		updateFieldId: function (key, fieldId) {
			for (var i = 0; i < generatedCBoxes.length; i++) {
				if (generatedCBoxes[i].Id === key) {
					generatedCBoxes[i].FieldId = fieldId;
				}
			}
		},

		resolveTimeDifference: function (dateTime) {

			if (dateTime !== undefined && dateTime !== null && dateTime !== "") {
				var offSet = dateTime.getTimezoneOffset();
				var offSetVal = dateTime.getTimezoneOffset() / 60;
				var h = Math.floor(Math.abs(offSetVal));
				var m = Math.floor((Math.abs(offSetVal) * 60) % 60);
				dateTime = new Date(dateTime.setHours(h, m, 0, 0));
				return dateTime;
			}
			return null;

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.Planner
		 */
		onBeforeRendering: function () {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.Planner
		 */
		onAfterRendering: function () {

		}

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.Planner
		 */
		//	onExit: function() {
		//
		//	}

	});

});