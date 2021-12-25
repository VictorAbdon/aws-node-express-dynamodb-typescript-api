import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemInput, PutItemCommand } from "@aws-sdk/client-dynamodb";
import express from 'express';
import serverless from "serverless-http";
// import { DynamoDBClient, BatchExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
//import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"; // ES6 import


const app = express();

const USERS_TABLE = process.env.USERS_TABLE;


const client = new DynamoDBClient({ region: "us-east-1"});
// Bare-bones document client
//const ddbDocClient = DynamoDBDocumentClient.from(client,translateConfig);

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_lib_dynamodb.html
// https://www.npmjs.com/package/@aws-sdk/client-dynamodb
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/getitemcommand.html
//https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-table-read-write.html

// LOOK INTO https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_lib_dynamodb.html <<<<

app.use(express.json());

app.get("/users/:userId", async function (req, res) {

  const params: GetItemCommandInput = {
    TableName: USERS_TABLE,
    Key: {
      userId: { S :req.params.userId }
    }
  };


  try {
    const command = new GetItemCommand(params);
    const { Item } = await client.send(command);
    if (Item) {
      const { userId, name } = Item;
      res.json({ userId, name });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retreive user" });
  }
});

app.post("/users", async function (req, res) {
  const { userId, name } = req.body;
  if (typeof userId !== "string") {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId: { S: userId},
      name: { S: name },
    },
  };

  try {
    const command = new PutItemCommand(params);
    await client.send(command);
    res.json({ userId, name });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});


module.exports.handler = serverless(app);
