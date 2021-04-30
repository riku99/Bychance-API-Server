import {
  user,
  clientUser,
  post,
  clientPost,
  flash,
  clientFlash,
  talkRoom,
  clientTalkRoom,
  talkRoomMessage,
  clietnTalkRoomMessage,
  readTalkRoomMessage,
} from "../../data";
import { ClientData } from "~/types/clientData";
import { createClientData } from "~/helpers/clientData";

const clientData: ClientData = {
  user: clientUser,
  posts: [clientPost],
  flashes: [clientFlash],
  rooms: [clientTalkRoom],
  messages: [clietnTalkRoomMessage],
  chatPartners: [],
};

describe("create clientData", () => {
  test("clientDataを返す", () => {
    const result = createClientData({
      user,
      posts: [post],
      flashes: [flash],
      talkRooms: [talkRoom],
      talkRoomMessages: [talkRoomMessage],
      readTalkRoomMessages: [readTalkRoomMessage],
    });

    result.flashes[0].timeStamp = "timeStamp";
    result.rooms[0].timeStamp = "timeStamp";
    result.messages[0].timeStamp = "timeStamp";

    console.log(result);
    expect(result).toEqual(clientData);
  });
});
