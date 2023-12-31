
import { ReactiveContext } from "./helper/context";

export * from "./component/case";
export * from "./component/extractor";
export * from "./component/nest";
export * from "./helper/bind";
export * from "./helper/context";
export * from "./helper/unwrap";
export * from "./helper/util";

/** Built-in {@link ReactiveContext} which allows you to display different things in debug mode */
export const debug = ReactiveContext.create(false, "debug-scope");