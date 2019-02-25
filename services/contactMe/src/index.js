import AWS from 'aws-sdk';
import uuidv4 from 'uuid/v4';
import middy from 'middy';
import { cors } from 'middy/middlewares';

import httpService from 'httpService';
import {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
} from 'httpService/const/httpResponseCodes';

import _ from 'lodash';
import debug from 'debug'
const log = debug(process.env.DEBUG_TAG);

const sendDataAsSMS = (data) => {
  // init sns client
  const snsClient = new AWS.SNS();

  const snsMessage = `
    donpistole.com
    Contact Me Submission
    Name: ${data.name}
    Phone: ${data.phone}
    Email: ${data.email}
    Notes: ${data.notes}
  `;

  const snsParams = {
    Message: snsMessage,
    PhoneNumber: process.env.CONTACT_SMS_ENDPOINT,
  }

  log(`sending SMS to ${process.env.CONTACT_SMS_ENDPOINT}...`);
  // return promise that will send message
  return snsClient.publish(snsParams).promise()
    .then((response) => {
      log(`...SMS successful.`);
    })
    .catch((err) => {
      log(err);
      log(`...SMS failed.`);
    });
}

/**
 * Handler for contact API Submission
 * @param {*} event
 * @param {*} context
 */
export const create = async (event, context) => {
  log('initializing handler...');
  let data;

  // parse json from request body
  try {
    const body = JSON.parse(event.body);
    data = body.data;
  } catch (err) {
    log('...unable to parse request data');
    return httpService.createResponse(HTTP_BAD_REQUEST, {
      success: false,
      error: "Unable to parse request data.",
    });
  }

  const now = new Date().getTime();
  // create the record
  const record = {
    id: uuidv4(),
    createdAt: now,
    ...data,
  };

  if(process.env.SEND_SMS_ON_SUBMIT) {
    await sendDataAsSMS(data);
  }

  log(`writing record to ${process.env.DB_TABLE}...`);
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const documentParams = {
    TableName: process.env.DB_TABLE,
    Item: record,
  };
  return await documentClient.put(documentParams).promise()
    .then(() => {
      log('...write successful.');
      return httpService.createResponse(
        HTTP_OK,
        {
          success: true,
          data: record,
        },
      );
    })
    .catch((err) => {
      log('...write failed.');
      log(err);
      return httpService.createResponse(HTTP_INTERNAL_SERVER_ERROR, {
        success: false,
        error: "Failed to write data.",
      });
    });
};

export default middy(create)
  .use(cors());
