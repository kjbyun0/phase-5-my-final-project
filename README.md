# Phase 5 Final Project: Fake Amazon App

## Project Description
This application is a simplified version of the e-commerce site. There are two types of user account, seller and customer. The seller account is to register a new product or update a product, to view a list of orders need to be shipped, and to check the seller's sales performanace. And the customer account is to view a list of products, to move products to cart, to order products and to review purchased products. 

The frontend application is developed using react, formik, yup, react-dropzone, cloudinary and semantic ui react, and the backend application is developed using Flask, SQLite/Postgres and Elastic Search engine.

## Installation
- Clone this project repository, https://github.com/kjbyun0/phase-5-my-final-project
- Flask App(Backend): <br>
 . $ pipenv install && pipenv shell<br>
 . $ cd server<br>
 . $ flask db upgrade<br>
 . $ python seed.py<br>
 . $ python init_index.py<br>
 . $ python app.py<br>
- React(Frontend): <br>
 . $ npm install --prefix client<br>
 . $ npm run start --prefix client<br>

## Demo
![](https://github.com/kjbyun0/phase-5-my-final-project/blob/main/ForREADME.gif)

## Credits
I reviewed Amazon site and tried to follow its main designs.


