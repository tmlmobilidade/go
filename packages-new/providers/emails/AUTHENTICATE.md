
# Authenticate using OAuth2 with Microsoft 365

At the end of this guide you will have generated the necessary refresh token to be used in the nodemailer package.
To do this you need to have a Client ID, a Client Secret and an Access URL to authorize against.


### 1. Authorization Request

In a broswer, go to the following URL, replacing the necessary variables:

`https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/authorize?client_id={CLIENT_ID}&response_type=code&response_mode=query&scope=openid%20profile%20offline_access%20https://outlook.office365.com/.default&redirect_uri=http://localhost`

The app needs to be configured to accept the `redirect_uri="http://localhost"`. This means the authorize endpoint will redirect the page to `http://localhost/?code=your_new_code`. You then need to grab this code and use it in the next step.


### 2. Authorization Request

Using Postman, make a `POST` request to this URL: `https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token`

Using the `x-www-form-urlencoded` body type to include the necessary parameters:

- `client_id`: Your application ID
- `client_secret`: Your application secret
- `code`: The code from the previous step
- `grant_type`: `authorization_code`
- `redirect_uri`: `http://localhost`
- `scope`: `openid profile offline_access https://outlook.office365.com/.default`

If the request is successful, the response will be a JSON with a `refresh_token` value.