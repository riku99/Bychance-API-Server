import Hapi from "@hapi/hapi";
import { Nonce } from "~/models/nonce";

type NoncePayload = { nonce: string };

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const { nonce } = req.payload as NoncePayload;

  try {
    await Nonce.create({ nonce });

    return h.response().code(200);
  } catch (err) {
    console.log(err);
  }
};

export const nonceHandler = {
  create,
};
