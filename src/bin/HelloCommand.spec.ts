import { PlatformTest } from "@tsed/common";
import { HelloCommand } from "./HelloCommand";

describe("HelloCommand", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<HelloCommand>(HelloCommand);
    // const instance = PlatformTest.invoke<HelloCommand>(HelloCommand); // get fresh instance

    expect(instance).toBeInstanceOf(HelloCommand);
  });
});
