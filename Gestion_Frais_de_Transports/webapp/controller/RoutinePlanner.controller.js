sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (Controller, JSONModel) {
	"use strict";
	var fragId = 0;
	var fragCreated = 0;
	var oToday;
	var regex = /^[0-9]+[0-9]*\.*[0-9]*$/;
	var frags = [];
	var changefragIndex = 0;
	var addedTransportType = false;
	var checkValue = false;
	var generatedCBoxes = [];

	return Controller.extend("fiori.gft.Gestion_Frais_de_Transports.controller.RoutinePlanner", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.RoutinePlanner
		 */
		onInit: function () {

			this.getAddresses();
			var oRoutine = {
				Routine: {
					Nom: "",
					Begda: "",
					Endda: "",
					RemarqueAdmin: "",
					RemarqueUser: "",
					DistancePrevu: "",
					DistanceParcouru: "",
					TempsPrevu: "",
					TempsEnMotion: "",
					MontantRembourse: "",
					NbrRoutineRealisee: "0",
					Etat: "",
					RaisonTrajet: "",
					ModeEncodage: ""
				}
			};

			var oModelRoutinee = new JSONModel(oRoutine);
			this.getView().setModel(oModelRoutinee, "TrajetSpecifique");

			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();
			var hour = today.getHours();
			var Minutes = today.getMinutes();
			var Seconds = today.getSeconds();
			oToday = (yyyy + '-' + mm + '-' + dd + 'T' + hour + ':' + Minutes + ':' + Seconds);

			generatedCBoxes.push({
				Id: "__xmlview0--transport-inner",
				FieldId: ""
			});

		},

		onNavigateToTrajets: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Trajet");
		},

		onNavigateToMain: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("TargetMainView");
		},

		onNavigateToRecord: function () {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("Record");
		},

		onSavePressed: function (oEvent) {
			this.enableButton(false);
			var check = this._onSubmitCheck();
			var that = this;

			if (check === false && checkValue === false) {
				var oModel;
				var oEntry = {};
				oEntry.Id = "";
				oEntry.Pernr = "";
				oEntry.Nom = "Ma Routine au travail";
				oEntry.Begda = oToday;
				oEntry.Endda = "9999-12-31T00:00:00";
				oEntry.DistancePrevu = "0.00";
				oEntry.DistanceParcouru = "0.00";
				oEntry.TempsPrevu = "PT00H00M00S";
				oEntry.TempsEnMotion = "PT00H00M00S";
				oEntry.RemarqueAdmin = " ";
				oEntry.RemarqueUser = " ";
				oEntry.MontantRembourse = "0";
				oEntry.NbrRoutineRealisee = 0;
				oEntry.Etat = "ENR";
				oEntry.RaisonTrajet = "TRA";
				oEntry.ModeEncodage = "MAN";

				oModel = this.getOwnerComponent().getModel("Routine");
				oModel.create("/RoutineSet", oEntry, {
					success: function (oData, reponse){ 
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
				oEntry.Begda = oToday;
				oEntry.Endda = "9999-12-31T00:00:00";
				oEntry.Etat = "ENR";
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

					
					oEntry.Transport = sap.ui.getCore().byId("frag" + frags[index - 1] + "--transportRou").getSelectedKey();
					index--;
				}
				oEntry.Nom = "";
				oEntry.FkRoutine = fk;

				if ((oEntry.Frais === "" && oEntry.DistancePrevu === "") || oEntry.Transport === "") {

					this.enableButton(true);
					return;
				}

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
			that.onNavigateToMain();

		},

		handlePromiseSuccess: function (oValue) {
			sap.m.MessageToast.show("Encodage réussi");
			$.sap.routineCreated = true;
			this.enableButton(true);
		},

		handlePromiseReject: function (fk, oError) {
			this.enableButton(true);
			var that = this;
			var oModelDel = that.getOwnerComponent().getModel("Trajet");
			oModelDel.remove("/RoutineSet(Mandt='',Pernr='',Id='" + fk + "')", {
				success: function (oData) {
					sap.m.MessageBox.error("Une erreur a survenue, l'encodage n'a pas réussi.");
				},
				error: function (oErrorDel) {
					sap.m.MessageBox.error("Une erreur a survenue, Contactez votre IT consultat.");
				}
			});
		},

		onAddForm: function () {
			fragId++;
			fragCreated++;

			var sc = this.getView().byId("form");
			var formAddPoint = sc.indexOfContent(this.getView().byId("button"));
			var oFragment = sap.ui.xmlfragment("frag" + fragId, "fiori.gft.Gestion_Frais_de_Transports.fragments.SousTrajetRoutine", this);
			var sId = fragId;

			frags.push(sId);
			var generatedCBox = {};
			oFragment.forEach(function (oElement) {
				if (oElement.getMetadata().getName() === "sap.m.ComboBox") {
					generatedCBox.Id = oElement.getId();
					generatedCBox.Change = false;
					generatedCBoxes.push(generatedCBox);
				}
				sc.insertContent(oElement, formAddPoint);
				formAddPoint++;
			});
		
		},

		onDeleteForm: function () {

			if (fragCreated > 0) {
				var index = generatedCBoxes[generatedCBoxes.length - 1].Change ? 5 : 3;
				var sc = this.getView().byId("form");
				var formAddPoint = sc.indexOfContent(this.getView().byId("button"));

				for (var i = 0; i < index; i++) {
					sc.removeContent(formAddPoint - 1);
					formAddPoint--;
				}
				fragCreated--;
				frags.pop();

				generatedCBoxes.pop();
			}

		},

		onClearForm: function () {
			var lFragCreated = fragCreated;
			for (var i = 0; i < lFragCreated; i++) {
				this.onDeleteForm();
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
				var oFragment = sap.ui.xmlfragment("fragDis" + changefragIndex, "fiori.gft.Gestion_Frais_de_Transports.fragments.Distance", this);
				oFragment.forEach(function (oElement) {
					form.insertContent(oElement, addPoint);
					addPoint++;
				});
				if (addedTransportType != true) addedTransportType = true;
				this.updateFieldId("__xmlview0--transport-inner", "fragDis" + changefragIndex);
				changefragIndex++;
				
			} else {
				//add price input 
				if (addedTransportType === true) {
					form.removeContent(addPoint);
					form.removeContent(addPoint);
				}
				var oFragmentFrais = sap.ui.xmlfragment("fragFrais" + changefragIndex, "fiori.gft.Gestion_Frais_de_Transports.fragments.Frais",
					this);
				oFragmentFrais.forEach(function (oElement) {
				
					form.insertContent(oElement, addPoint);
					addPoint++;
				});
				if (addedTransportType != true) addedTransportType = true;
				this.updateFieldId("__xmlview0--transport-inner", "fragFrais" + changefragIndex);
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

				var oFragment = sap.ui.xmlfragment("fragDis" + changefragIndex, "fiori.gft.Gestion_Frais_de_Transports.fragments.Distance", this);
			
				oFragment.forEach(function (oElement) {
					if (changeCheck === true) {
						form.removeContent(addPoint);
					}
					form.insertContent(oElement, addPoint);

					addPoint++;
				});
				this.updateFieldId(comboBoxId, "fragDis" + changefragIndex);
				changefragIndex++;
				this.comboBoxChange(comboBoxId);
			
			} else {
				//add price input 
				var oFragmentFrais = sap.ui.xmlfragment("fragFrais" + changefragIndex, "fiori.gft.Gestion_Frais_de_Transports.fragments.Frais",
					this);
				oFragmentFrais.forEach(function (oElement) {
					if (changeCheck === true) {
						form.removeContent(addPoint);
					}
					form.insertContent(oElement, addPoint);

					addPoint++;
				});
				this.updateFieldId(comboBoxId, "fragFrais" + changefragIndex);
				changefragIndex++;
				this.comboBoxChange(comboBoxId);
			}

		},

		getAddresses: function () {
			var oSousTrajet = {
				SousTrajet: {
					Nom: "",
					Depart: "",
					Destination: "",
					DistancePrevu: "",
					DistanceParcouru: "",
					Begda: "",
					Endda: "",
					TempsPrevu: "0",
					TempsEnMotion: "",
					Transport: "",
					Frais: "0",
					MontantRembourse: "",
					FKRoutine: "",
					FKTrajet: ""
				}
			};
			var oModelSousTraj = new JSONModel(oSousTrajet);
			this.getView().setModel(oModelSousTraj, "SousTrajet");
			var that = this;
			var oModel = this.getOwnerComponent().getModel("User_Info");
			oModel.read("/User_InfoSet(Mandt='',Pernr='')", {
				success: function (oData, Response) {
					that.getView().getModel("SousTrajet").setProperty("/SousTrajet/Depart", Response.data.AddrMaison);
					that.getView().getModel("SousTrajet").setProperty("/SousTrajet/Destination", Response.data.AddrTravail);
				},
				error: function (oError) {
					var msg = JSON.parse(oError.responseText).error.message.value;
					sap.m.MessageBox.error(msg);
				}
			});
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
				checkValue = true;
			} else {
				input.setValueState("None");
				checkValue = false;
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
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.RoutinePlanner
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.RoutinePlanner
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fiori.gft.Gestion_Frais_de_Transports.view.RoutinePlanner
		 */
		//	onExit: function() {
		//
		//	}

	});

});