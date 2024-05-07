// @@@SNIPSTART typescript-hello-activity
import nodemailer from "nodemailer";
import { JoinInput } from "./signal";
let io;
export function set_io(socketio) {
  io = socketio;
}
export async function inviteTosubscribe(
  name: string,
  socket: any
): Promise<string> {
  // console.log(io);

  io.to(socket).emit("inviteTosubscribe");
  return `Hello , ${socket}!`;
}
async function sendMail({ targetedProduct, productType }: JoinInput) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "graristar@gmail.com",
      pass: "mitbjwkedortxewp",
    },
  });

  var mailOptions = {
    from: "graristar@gmail.com",
    to: "abderraouf.maalim.1@ens.etsmtl.ca",
    subject: "We have recommended Products for you",
    text: `Recommended Products : 
          - ${targetedProduct}
          - ${productType}
    `,
  };
  console.log("11111111111111111111111111111111111111111111111111");

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  console.log("2222222222222222222222222222222222222222222222222");
}
export async function recommendProducts({
  targetedProduct,
  productType,
}: JoinInput): Promise<string> {
  await sendMail({ targetedProduct, productType });
  return ` `;
}

// @@@SNIPEND
