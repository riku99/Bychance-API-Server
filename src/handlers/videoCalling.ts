import Hapi from "@hapi/hapi";
import { Artifacts } from "~/auth/bearer";
import { CreateRTCTToken } from "~/routes/videoCalling/validators";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

const createRTCToken = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const requestUser = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateRTCTToken;
  const uid = Number(requestUser.id);
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const requestUserToken = RtcTokenBuilder.buildTokenWithUid(
    process.env.AGORA_APP_ID as string,
    process.env.AGORA_APP_CERTIFICATE as string,
    payload.channelName,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );

  const otherUserToken = RtcTokenBuilder.buildTokenWithUid(
    process.env.AGORA_APP_ID as string,
    process.env.AGORA_APP_CERTIFICATE as string,
    payload.channelName,
    Number(payload.otherUserId),
    RtcRole.SUBSCRIBER,
    privilegeExpiredTs
  );

  // 相手にソケットでtokenとchannelNameを送信

  return requestUserToken;
};

export const handlers = {
  createRTCToken,
};
