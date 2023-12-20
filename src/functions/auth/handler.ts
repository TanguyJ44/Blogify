import * as jwt from "jsonwebtoken";

const auth = async (event) => {
  const token = event.authorizationToken;

  try {
    const payload = jwt.verify(token, "123456789");

    return generatePolicy("Allow", event.methodArn, payload);
  } catch (error) {
    return generatePolicy("Deny", event.methodArn);
  }
};

function generatePolicy(effect, resource, userData?) {
  return {
    principalId: "user",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: {
      name: userData.name,
      email: userData.email,
      role: userData.role,
    },
  };
}

export const main = auth;
