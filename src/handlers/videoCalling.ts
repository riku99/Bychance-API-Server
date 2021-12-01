import Hapi from "@hapi/hapi";
import { Artifacts } from "~/auth/bearer";
import { CreateRTCTToken } from "~/routes/videoCalling/validators";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { videoCallingNameSpace } from "~/server";
import seedrandom from "seedrandom";

const createRTCToken = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const requestUser = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateRTCTToken;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  const requestUserIntUid = Math.abs(seedrandom(requestUser.id).int32());
  const otherUserIntUid = Math.abs(seedrandom(payload.otherUserId).int32());

  const requestUserToken = RtcTokenBuilder.buildTokenWithUid(
    process.env.AGORA_APP_ID as string,
    process.env.AGORA_APP_CERTIFICATE as string,
    payload.channelName,
    requestUserIntUid,
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );

  // 相手ユーザーがビデオ通話を許可している場合のみ実行するようにする
  if (true) {
    const otherUserToken = RtcTokenBuilder.buildTokenWithUid(
      process.env.AGORA_APP_ID as string,
      process.env.AGORA_APP_CERTIFICATE as string,
      payload.channelName,
      otherUserIntUid,
      RtcRole.SUBSCRIBER,
      privilegeExpiredTs
    );

    videoCallingNameSpace.to(payload.otherUserId).emit("startCall", {
      channelName: payload.channelName,
      token: otherUserToken,
      to: payload.otherUserId,
      intUid: otherUserIntUid,
      publisher: {
        id: requestUser.id,
        name: requestUser.name,
        image: requestUser.avatar,
      },
    });
  }

  return {
    token: requestUserToken,
    intUid: requestUserIntUid,
  };
};

export const handlers = {
  createRTCToken,
};
