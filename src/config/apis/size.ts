// 許容データサイズの変更 https://stackoverflow.com/questions/45627919/how-to-set-max-image-size-in-joi-hapi
// 画像は1MBまでなので1MBで制限すると動画のデータ送れなくなるので余裕持って制限
export const maxBytes = 1000 * 1000 * 100;
