
# solid-ctrl-flow
Control flow components for "solid-js".
It's always under hard development

## Components

### `Case` - `When`
Allows you to not repeat the same condition across many `Match` components.
The following code
```tsx
const value = 1;
return <>
  <Switch>
    <Case value={value}>
      <When value={1}>One</When>
      <When value={2}>Two</When>
      <When pred={(x) => `${x}`.length === 3}>Long</When>
    </Case>
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

### `Nest`
Like a `For`, but instead of putting an element after another it nests them.
The following code
```tsx
return <>
  <Nest each={[ "red", "green", "blue" ]} template={(x, y) => <div style={{ background: x, padding: "1ch" }}>{y()}</div>}>
    content
  </Nest>
</>
```
Is equivalent to this
```tsx
return <>
  <div style={{ background: "red", padding: "1ch" }}>
    <div style={{ background: "green", padding: "1ch" }}>
      <div style={{ background: "blue", padding: "1ch" }}>
        content
      </div>
    </div>
  </div>
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

## Utility

### Bindings
Functions that create bindings between `Signal`s

> #### `bind()`
> Creates a one-way binding between two `Signal`s
> 
> #### `bindTwoWay()`
> Creates a two-way binding between two `Signal`s
> 
> #### `toSetter()`
> Creates a full-fledged solid `Setter` from a normal one
> 
> #### `toSignal()`
> Creates a `Signal` from a property of an object
> 
> #### `coalesceSignal()`
> Creates a non nullable `Signal` from a nullable one

### `ReactiveContext.create()`
Method that creates a reactive version of a solid `Context` with some additional built-in functionalities
```ts
const ctx = ReactiveContext.create("SOMETHING");
const underlyingNormalContext = ctx.ctx;
const valueAccessorForTheCurrentOwner = ctx.read;
const value = ctx();
```

### `runWithContext()`
Creates a context scope that persists for the duration of a function

### `unwrap()`
Calls an `Accessor` maintaining its reactivity

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

### `refCall()`
Executes a `Ref`

### `memoProps()`
Creates a partial version of an object with memoized remaining properties

### `splitAndMemoProps()`
Like `splitProps()` but memoizes the whole local part

### `createReactiveResource()`
Like `createResource()` but the provided function will be reactive