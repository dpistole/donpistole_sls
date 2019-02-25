
import httpResponseCodes from './const/httpResponseCodes';


const createResponse = (statusCode, body = null) => {

  // find the response type on the respone codes object
  const responseType = Object.keys(httpResponseCodes)
    .find(type => httpResponseCodes[type] === statusCode);

  // throw if HTTP response type is unknown
  if(responseType === undefined) {
    throw new Error(`Unknown HTTP Response Code: ${statusCode}`);
  }

  return {
    statusCode,
    body: body === null ? responseType : JSON.stringify(body),
  }
}

export default {
  createResponse,
};
