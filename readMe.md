
# solid-ctrl-flow
Control flow components for "solid-js"

## Components

### `Case` - `When`
Allows you to not specify the full condition inside of a `Switch` component.
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

### `Debug`
Allows you to define ui section that are only visible in debug or NOT in debug
```tsx
const value = false;
return <>
  <Debug value={value}>
    {/* (A LOT OF NESTING...) */}
    <Show when={Debug.read()}>
      THIS WOULD BE VISIBLE IF "value" HAD BEEN {true}
    </Show>
  </Debug>
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

## Bindings
Functions that create bindings between `Signal`s

### `toSetter()`
Creates a full-fledged solid `Setter` from a normal one

### `toSignal()`
Creates a `Signal` from a property of an object

### `bind()`
Creates a one-way binding between two `Signal`s

### `bindTwoWay()`
Creates a two-way binding between two `Signal`s


## Utility functions
Utility functions needed for the components above

### `untrackCall()`
Calls a function untracking what happens inside of it but not what gets passed as its argument

### `memoProps()`
Creates a partial version of an object with memoized remaining properties

### `splitAndMemoProps()`
Like `splitProps()` but memoizes the whole local part

### `createOption()`
Allows you to create simple reactive contexts; For example `Debug` is made with it

### `runWithContext()`
Creates a context scope that persists for the duration of a function