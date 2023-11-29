
import { createOption } from "./util";

export * from "./component/case";
export * from "./component/extractor";
export * from "./util";

/** Creates a scope for the value of {@link Debug.read}, which allows you to display different things in debug mode */
export const Debug = createOption(false, true, "debug-scope");