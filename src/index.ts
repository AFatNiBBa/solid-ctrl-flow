
import { createOption } from "./helper/util";

export * from "./helper/bind";
export * from "./helper/util";
export * from "./component/case";
export * from "./component/extractor";

/** Creates a scope for the value of {@link Debug.read}, which allows you to display different things in debug mode */
export const Debug = createOption(false, true, "debug-scope");