import * as sgMail from "@sendgrid/mail";
sgMail.setApiKey(<string>process.env.SENDGRID_API_KEY);

const sendMail = async (
  email: string,
  data: {
    name: string;
    confirmation_link: string;
  }
) => {
  const msg = {
    to: email,
    from: "me@tsserver.com",
    subject: "Confirm your email address",
    html: `Hey ${
      data.name
    }, Thanks for signing up. Please confirm your email by cliking below link.<br/><strong><a href="${
      data.confirmation_link
    }">click to confirm</a></strong>`
  };
  try {
    const [Response] = await sgMail.send(msg);
    console.log(Response.toJSON());
  } catch (err) {
    console.log(err);
  }
};

export default sendMail;
