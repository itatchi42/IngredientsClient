'use strict';

const AWS = require('aws-sdk'); 
const stringUtils = require('./../utils/StringUtils');


AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient(
  process.env.IS_OFFLINE ? {region: 'localhost', endpoint: 'http://localhost:8000'} : {}
);

//Get ALL ingredients
module.exports.list = (event, context, callback) => {
    var params = {
        TableName: process.env.INGREDIENT_TABLE,
        ProjectionExpression: "#key, #text, tags",
        ExpressionAttributeNames: {"#key": "key", "#text" : "text"}
    };

    console.log("Scanning Ingredient table.");
    const onScan = (err, data) => {

        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    ingredients: data.Items
                })
            });
        }

    };
    dynamoDb.scan(params, onScan);
};

//Get one specific ingredient by key
module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.INGREDIENT_TABLE,
    Key: {
      key: event.pathParameters.key,
    },
  };

  dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error('Couldn\'t fetch ingredient.'));
      return;
    });
};

//Get one specific ingredient by fuzzy key
module.exports.fuzzy = (event, context, callback) => {
  const params = {
    TableName: process.env.INGREDIENT_TABLE,
    Key: {
      key: event.pathParameters.key.toHashKey(),
    },
  };

  dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error('Couldn\'t fetch ingredient.'));
      return;
    });
};

//Submit new ingredient
module.exports.submit = (event, context, callback) => {
  console.log(event.body);
  const requestBody = JSON.parse(event.body);
  const key = requestBody.key;
  const text = requestBody.text;
  const tags = requestBody.tags;

  //TODO: Change validation of tags to type LIST <-------------------------------------

  if (typeof key != 'string' || typeof text !== 'string' || !Array.isArray(tags)) {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit ingredient because of validation errors.'));
    return;
  }

  submitIngredient(ingredientInfo(key, text, tags))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted ingredient with key ${key}`,
          key: res.key
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit ingredient with key ${key}`
        })
      })
    });
};


const submitIngredient = ingredient => {
  console.log('Submitting ingredient');
  const ingredientInfo = {
    TableName: process.env.INGREDIENT_TABLE,
    Item: ingredient,
  };
  return dynamoDb.put(ingredientInfo).promise()
    .then(res => ingredient);
};

const ingredientInfo = (key, text, tags) => {
  const timestamp = new Date().getTime();
  return {
    key: key,
    text: text,
    tags: tags,
    submittedAt: timestamp,
  };
};


/*Referemces (tutorials):
  * https://serverless.com/blog/node-rest-api-with-serverless-lambda-and-dynamodb/
  * https://dev.to/sagar/build-a-restful-api-with-the-serverless-framework-ene
  * https://medium.com/@merictaze/going-serverless-offline-8c8ecea7c65c
  * https://serverless.com/blog/serverless-express-rest-api/
*/
