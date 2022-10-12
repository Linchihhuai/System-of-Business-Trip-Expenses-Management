### Systeme-of-Travel-Fee-Management
![SAP](https://logos-download.com/wp-content/uploads/2016/08/SAP_logo.png)

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
You are an employee : 
1. Get updates on your compensation from the last month and see how green you have travelled.

![main page](https://i.imgur.com/ep7OV1x.jpg?5) 

2. Quickly fill out all the necessary infos of your next business trip.

![form page](https://i.imgur.com/MahGzdK.jpg)

3. Keep track of the business you have undertaken with ease.

![voyage list page](https://i.imgur.com/z5SPewX.jpg)

4. Going on foot or by bike? Use the built-in GPS to show them how dedicated to the environment (and your health!) you are !

![GPS](https://i.imgur.com/iHgWihc.jpg)

5. Transmit data to the HR.

![voyage detail page](https://i.imgur.com/SDG7afS.jpg?1)

You are the HR: 
1. Select the period and the employee whose business trip compensation needs validation.

![selection page](https://i.imgur.com/olLP9qJ.png)

2. Validate or refuse compensation with the easy-to-use interface.

![validation page](https://i.imgur.com/c4hEQFR.png)

3. Generate the month report with a click.

![report page](https://i.imgur.com/vwOpZre.png)


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
