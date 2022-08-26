### Systeme-of-Travel-Fee-Management
My personal internship project at Haute Ecole Leonard de Vinci, Institut Paul Lambin and at the Belgian company Persolis located in Wallonia, Belgium. The original name of the project is "Système de gestion des frais de transport" in French. The project is originally named in French which is the company's professional language. In this Readme. The project will be refered to by its English name. It's an SAP project. The frontend is developed in SAPUI5 and the backend with Persolis' SAP system. The app aims to helps Belgian companies (or companiesthat compensate employee's travel fee) digitalise the process of travel/commute cost process.From the employee end (data collection) to the HR end (data processing). With that said, it is not a general purpose app. 

The app belongs now to Persolis as dictated by internship accord with them. This repository serves as an example of that I am capable of developping. 

### Table of Content
1. [Technology](#Technology)
2. [Deployment and launch](#Deployment-and-launch)
3. [Using System of Travem Fee Management](#Using-System-of-Travel-Fee-Management)

### Technology
The main technology used for the project is SAP, a human resource solution developed by a German company with the same name. SAP provides a wide range of modules for building web and mobile applications. There are the SAP modules used in my project: 

1. SAPUI5
SAPUI5 is a frontend library specifically designed for developping SAP apps. It allows developpers to quickly developpe a responsive professional grade graphical user interface for an SAP application.

2. SAP HR Time Management.
One of the sub modules of the Human Capital Management Module of the SAP ERP (Enterprise Resource Planning) Solution. It provides a series of software that allows the human ressource of a company to efficiently manage their employees schedules. In my project, The Time Management Module contains information about an employee's work schedule such as their work routine, holidays, and hours of work per week. In my project, the Module is used to determine if a date is compensable by checking if a day is a work day or not. An employee's commute fee is compensated by the company only if a day is a work day. 

3. SAP HR Payroll Accounting.
One of the sub modules of the Human Capital Management Module of the SAP ERP Solution. As the name suggests, this module provides services that allow a company to calculate and manage its employees payment. In my project, commute/travel compensation is recorded and managed in this module. 

4. SAP HR Organizational Management.
One of the sub modules of the Human Capital Management Module of the SAP ERP Solution. This module allows the modelization of a company. It defines the structure of the company through organizational nodes as well as the fonctions of its employees. This module contains also a ride range of information that a company might hold. In my project, I consulted information such as a client company's address and an employee's home address. As they are information already stored in the module, there is no need to create another entity if the SAP Dictionary (Definition of a data entity) in the SAP system.

### Deployment and launch
As it is an SAP app. The app is deployed via the SAP portal. 

### Using System of Travem Fee Management
For an employee, the main usage of the app is to fill out the forms that transmit their commute/travel's necessary information such as the distance (if travelling by car, bike, or on foot) or the fee (if using public transportation).
For the HR of the company, 2 programmes are developed to process the data transmitted by the employees. The first program uses the Time Management Module of SAP ERP to determine how many and which days in the selected range are compensable. The second program determines the type of compensation (if an employee travels by car, on foot , bike or other type of public transportation) and writes the necessary data in the SAP system and thus completes the cycle of usage.




