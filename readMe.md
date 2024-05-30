
# solid-ctrl-flow
Control flow components for "solid-js".
It's always under hard development

## Components

### `SameContext`
Makes its children inherit the `Context`s of the provided `Owner`
```tsx
const owner = ...;
return <>
  <SameContext owner={owner}>
    ...
  </SameContext>
</>
```

### `Enfold`
Eventually wraps its content into a template if a certain condition is met.
The following code
```tsx
const value = true;
return <>
  <Enfold when={value} template={c => <div style={{ background: "red" }}>{c()}</div>}>
    CONTENT
  </Enfold>
</>
```
Is equivalent to this
```tsx
return <>
  <div style={{ background: "red" }}>
    CONTENT
  </div>
</>
```
And if `value` was falsish, it would have been equivalent to this
```tsx
return <>CONTENT</>
```
If you are NOT wrapping the content with a context provider you can set the `recycled` attribute to `true` in order to NOT run again the whole content each time its template gets added/removed, in this case the `Owner` of the content won't be child of the template one
```tsx
return <>
  <Enfold recycled when={value} template={c => <ctx.Provider value={2} children={c()} />}>
    {/* This won't be 2 */}
    {useContext(ctx)}
  </Enfold>
</>
```

### `On` - `Case`
Allows you to not repeat the same condition across many `Match` components.
The following code
```tsx
const value = 1;
return <>
  <Switch>
    <On value={value}>
      <Case value={1}>One</Case>
      <Case value={2}>Two</Case>
      <Case pred={x => `${x}`.length === 3}>Long</Case>
    </On>
    <Match when>Default</Match>
  </Switch>
</>
```
Is equivalent to this
```tsx
const value = 1;
return <>
  <Switch>
    <Match when={value === 1}>One</Match>
    <Match when={value === 2}>Two</Match>
    <Match when={`${value}`.length === 3}>Long</Match>
    <Match when>Default</Match>
  </Switch>
</>
```

### `createExtractor()`
Creates a context for components that may need to be out of their parent in certain conditions.
If you have this component
```tsx
const myCustomExtractor = createExtractor();

function MyCustomComponent() {
  return <>
    1
    <myCustomExtractor.Source>
      2 {/* THIS WILL BE MOVED INSIDE THE "Dest" */}
    </myCustomExtractor.Source>
    3
  </>
}
```
If you use it normally it will output `4`, ***`1`***, ***`2`***, ***`3`***, `5`
```tsx
return <>
  4
  <MyCustomComponent />
  5
</>
```
But if you use it together with a `Dest` and a `Joint` it will output `6`, `7`, `8`, ***`2`***, `9`, `10`, `11`, ***`1`***, ***`3`***, `12`, `13`, `14`
```tsx
return <>
  6
  <myCustomExtractor.Joint>
    7
    <div>
      8
      <myCustomExtractor.Dest /> {/* THE CONTENT OF "Source" WILL BE MOVED HERE */}
      9
    </div>
    10
    <div>
      11
      <MyCustomComponent />
      12
    </div>
    13
  </myCustomExtractor.Joint>
  14
</>
```
The `Joint` component is necessary for the `Source` and the `Dest` to communicate with each other.
For example this will output `15`, `16`, `17`, `18`, `19`, ***`1`***, ***`2`***, ***`3`***, `20`, `21`
```tsx
return <>
  15
  <div>
    16
    <myCustomExtractor.Dest />
    17
  </div>
  18
  <div>
    19
    <MyCustomComponent />
    20
  </div>
  21
</>
```
Notice that you can use a `Source` component without adding it to the DOM:
```tsx
<myCustomExtractor.Source>
  {/* This doesn't get returned, but still gets shown if there is an available "Dest" */}
  Something
</myCustomExtractor.Source>
return <>Something else</>
```
When something gets moved from a `Source` to a `Dest`, it will inherit contexts from its destination, UNLESS you use the `sameContext` attribute
```tsx
return <>
  <myCustomExtractor.Source sameContext>
    ...
  </myCustomExtractor.Source>
</>
```

## Utility

### `Atom`s
Customizable and simplified wrappers for reactive states

> #### `new Atom()`
> Creates an `Atom` with custom getter and setter
> 
> #### `Atom.update()`
> Like the `Setter` overload of a `Signal` that takes a function with the previous value
> 
> #### `Atom.convert()`
> Creates a new `Atom` that applies a conversion to the current one
> 
> #### `Atom.unwrap()`
> An `Atom`-specific (optimized) version of `unwrap()` that allows the destructuring of its result
> 
> #### `Atom.from()`
> Creates an `Atom` from a `Signal`
>
> #### `Atom.source()`
> Similiar to `Atom.unwrap()`, but if the `Accessor` doesn't return anything it automatically creates an internal `Signal` in which to store the value

### `ReactiveContext.create()`
Method that creates a reactive version of a solid `Context` with some additional built-in functionalities
```ts
const ctx = ReactiveContext.create("SOMETHING");
const underlyingNormalContext = ctx.ctx;
const valueAccessorForTheCurrentOwner = ctx.get;
const value = ctx();
```

### `runWithContext()`
Creates a context scope that persists for the duration of a function

### `unwrap()`
Calls an `Accessor` maintaining its reactivity at 1 level

### `debug()`
Allows you to define ui section that are only visible in debug or NOT in debug
```tsx
const value = false;
return <>
  <debug.Provider value={value}>
    {/* (A LOT OF NESTING...) */}
    <Show when={debug()}>
      THIS WOULD BE VISIBLE IF "value" HAD BEEN {true}
    </Show>
  </debug.Provider>
</>
```

### `untrackCall()`
Calls a function untracking what happens inside of it but not what gets passed as its argument

### `memoProps()`
Creates a partial version of an object with memoized remaining properties

### `splitAndMemoProps()`
Like `splitProps()` but memoizes the whole local part