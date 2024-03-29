import * as fs from "fs";
import { join } from "path";
import Ifca from "src/types/type.api";

export default class NotiCommand {
  static config = {
    name: "joinNoti",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "Thông báo khi có thành viên mới rời nhóm chat",
  };

  constructor(private client) {}
  run(api: Ifca, event) {
    const GifPath = join(process.cwd(), "/src/db/data/join/join.gif");
    if (event.logMessageType != "log:subscribe") return;
    api.getThreadInfo(event.threadID, async (err, info) => {
      if (err) {
        console.error("Error fetching thread info:", err);
        return;
      }
      const arrPersonJoin = await event.logMessageData.addedParticipants.map(
        (item) => {
          return {
            tag: item.fullName,
            id: item.userFbId,
          };
        }
      );
      // console.log(arrPersonJoin);
      if (arrPersonJoin.includes({ id: process.env.UID_BOT })) {
        return api.sendMessage(
          `Cảm ơn bạn đã thêm bot vào nhóm\nSử dụng ${process.env.PREFIX}help để xem tất cả các lệnh!`,
          event.threadID
        );
      } else {
        const nameUsers = arrPersonJoin.map((item) => {
          return item.tag;
        });
        const msgBody =
          `Chào mừng ` +
          (nameUsers.length > 1 ? nameUsers.join(" và ") : nameUsers[0]) +
          ` đã đến với ${info.threadName}.` +
          (nameUsers.length > 1 ? ` ${nameUsers.length} bạn` : " Bạn") +
          ` là thành viên thứ ${info.participantIDs.length} của nhóm.`;
        api.sendMessage(
          {
            body: msgBody,
            mentions: arrPersonJoin,
            attachment: fs.createReadStream(GifPath),
          },
          event.threadID
        );
      }
    });
  }
}
