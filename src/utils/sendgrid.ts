import * as sgMail from "@sendgrid/mail";
sgMail.setApiKey(<string>process.env.SENDGRID_API_KEY);

const body: { [key: string]: string } = {
  CREATE_USER: `Hey {name},
   Thanks for signing up. Please confirm your email by cliking below link.<br/><strong><a href="{link}">
  click to confirm</a></strong>`,
  FORGOT_PASSWORD: `Hey {name},
   Please click below link to reset your password.<br/><strong><a href="{link}">
   Reset password</a></strong>`
};

const getBody = (key: string, params: { [key: string]: string }) => {
  let mail_body: string = body[key];
  for (let key in params) {
    mail_body = mail_body.replace(
      new RegExp(`\{\s*${key}\s*\}`, "g"),
      params[key]
    );
  }
  return mail_body;
};

const sendMail = async (
  email: string,
  subject: string,
  from: string,
  body: string,
  params: {
    [key: string]: string;
  }
) => {
  const msg = {
    to: email,
    from,
    subject,
    html: getBody(body, params)
  };
  try {
    const [Response] = await sgMail.send(msg);
    console.log(Response.toJSON());
  } catch (err) {
    console.log(err);
  }
};

export default sendMail;
