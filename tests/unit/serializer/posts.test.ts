import { serializePost } from "~/serializers/post";
import { post, clientPost } from "../../data";

describe("posts serializer", () => {
  test("clentPostを返す", () => {
    const result = serializePost({ post });

    expect(result).toEqual(clientPost);
  });
});
