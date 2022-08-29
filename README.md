### Systeme-of-Travel-Fee-Management
![SAP](https://logos-download.com/8557-sap-logo-download.html)

### Table of Content
* [Introduction](#Introduction)
* [Using System of Travem Fee Management](#Using-System-of-Travel-Fee-Management)
* [Technology](#Technology)
* [Deployment and launch](#Deployment-and-launch)

### Introduction
My personal internship project at Haute Ecole Leonard de Vinci, Institut Paul Lambin and at the Belgian company Persolis located in Wallonia, Belgium. The original name of the project is "Système de gestion des frais de transport" in French. The project is originally named in French which is the company's professional language. In this Readme. The project will be refered to by its English name. 

System of Travel Fee Management is a SAP solution for all the enterprises that compensate their commutes to work and business trip. The app digitalizes the process of the compensation and makes process more efficient for the HR of a company.

The app belongs now to Persolis as dictated by internship accord with them. This repository serves as an example of that I am capable of developping. 

### Using System of Travel Fee Management
For an employee : 
1. Filling out necessariy informations via a form.
2. Recording commute/business via GPS with OpenStreetMap.
3. Transmitting data to the HR


For the HR: 
1. A program uses the Time Management Module of SAP ERP to determine which days in the selected range are compensable. 
2. A program determines the type of compensation (if an employee travels by car, on foot , bike or other type of public transportation) and writes the necessary data in the SAP system for compensation.


### Technology
The main technology used for the project is SAP, a human resource solution developed by a German company with the same name. SAP provides a wide range of modules for building web and mobile applications. There are the SAP modules used in my project: 

1. SAPUI5
SAPUI5 is a frontend library specifically designed for developping SAP apps. It allows developpers to quickly developpe a responsive professional grade graphical user interface for an SAP application.

2. SAP HR Time Management.
This module provides a series of software that allows the human ressource of a company to efficiently manage their employees schedules. In my project, The Time Management Module contains information about an employee's work schedule such as their work routine, holidays, and hours of work per week. In my project, the Module is used to determine if a date is compensable by checking if a day is a work day or not. An employee's commute fee is compensated by the company only if a day is a work day. 

3. SAP HR Payroll Accounting.
This module provides services that allow a company to calculate and manage its employees payment. In my project, commute/travel compensation is recorded and managed in this module. 

4. SAP HR Organizational Management.
This module allows the modelization of a company. It defines the structure of the company through organizational nodes as well as the fonctions of its employees. This module contains also a ride range of information that a company might hold. In my project, I consulted information such as a client company's address and an employee's home address. As they are information already stored in the module, there is no need to create another entity if the SAP Dictionary (Definition of a data entity) in the SAP system.

### Deployment and launch
The app is deployed via the SAP portal. 
