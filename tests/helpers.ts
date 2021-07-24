import util from "util";
import child_process from "child_process";

// シェルコマンド実行用関数
const exec = util.promisify(child_process.exec);

export const resetDatabase = async () => {
  const binary = "./node_modules/.bin/prisma";
  await exec(`${binary} migrate reset --force`);
};
