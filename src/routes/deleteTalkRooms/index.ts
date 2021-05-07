import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { createDeleteTalkRoomValidator } from "./validator";
import { deleteTalkRoomsHandler } from "~/handlers/deleteTalkRooms";

// 実際にDBから削除するわけではなく、「削除した」というデータを残すためのルート。なので DELETE /taklRooms での対応にはしない
export const deleteTalkRoomsRoute = (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/deleteTalkRoom`,
      handler: deleteTalkRoomsHandler.createDeleteTalkRoom,
      options: {
        validate: {
          payload: createDeleteTalkRoomValidator.validate.payload,
          failAction: createDeleteTalkRoomValidator.failAction,
        },
      },
    },
  ]);
};
