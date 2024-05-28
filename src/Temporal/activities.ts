// @@@SNIPSTART typescript-hello-activity
import nodemailer from "nodemailer";
import { JoinInput } from "./signal";

import { dataSource } from "@medusajs/medusa/dist/loaders/database";
import { Customer } from "@medusajs/medusa";
import { Product } from "@medusajs/medusa";
import { ProductCollection } from "@medusajs/medusa";
let io;
export function set_io(socketio) {
  io = socketio;
}
export async function inviteTosubscribe(
  name: string,
  socket: any
): Promise<string> {
  io.to(socket).emit("inviteTosubscribe");
  return `Hello , ${socket}!`;
}
async function sendMail({
  targetedProduct,
  productType,
  email,
  products,
}: {
  targetedProduct: string | null;
  productType: string | null;
  email: string | null;
  products: Product[] | null;
}) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "graristar@gmail.com",
      pass: "mitbjwkedortxewp",
    },
  });

  var mailOptions = {
    from: "graristar@gmail.com",
    to: email,
    subject: "We have recommended Products for you",
    // text: `Recommended Products :
    //       ${products.map((product) => {return product.title})}
    // `,
    html: `
    <h1>Bonjour,</h1>

      <p>Merci d'avoir choisi notre site pour votre recherche de vélos. Voici quelques recommandations basées sur la catégorie que vous avez sélectionnée :</p>

    ${products.map((product) => {
      return `<a href='http://localhost:8080/us/products/${product.handle}'>${product.title}</a>`;
    })}


    <p>Si vous avez des questions, n'hésitez pas à nous contacter</p>.

    <p>Cordialement,</p>
    <p>L'équipe de vente de vélos</p>`,
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
export async function recommendProducts({
  targetedProduct,
  productType,
  email,
}: JoinInput): Promise<string> {
  const collectionRepo = dataSource.getRepository(ProductCollection);
  const productRepo = dataSource.getRepository(Product);
  let collecitonId;
  if (targetedProduct === "BIKE") {
    collecitonId = await collectionRepo.findOne({
      where: {
        title: productType,
      },
    });
  } else {
    collecitonId = await collectionRepo.findOne({
      where: {
        title: targetedProduct,
      },
    });
  }

  const products = await productRepo.find({
    where: {
      collection_id: collecitonId.id,
    },
    take: 4,
  });

  await sendMail({ targetedProduct, productType, email, products });
  return ` `;
}

// @@@SNIPEND
