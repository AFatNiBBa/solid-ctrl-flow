
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
    <Match when>Default</Match>
  </Switch>
</>
```

### `Extractor`
Friendlier version of the `Portal`.
Example:
```tsx
const e = new Extractor();
return <>
  <e.Joint>
    <div id="something">
      <e.Dest />
    </div>
    <div id="something-else">
      <e.Source>
        This text will be shown instead of `e.Dest`
      </e.Source>
    </div>
  </e.Joint>
</>
```
If a `Extractor.Dest` has no `Extractor.Source` to render (Or it isn't inside a `Extractor.Joint`), it will render whatever you pass inside the `children` attribute
<br />
Componets from different `Extractor`s don't "talk" to each other and there can be more than one source and destinations:
```tsx
const a = new Extractor(), b = new Extractor(), c = new Extractor()

function ProofThatItWorksCrossComponent() {
  return <>
    0
    {/* Sources will be sorted by the "order" attribute before being rendered inside a destination */}
    {/* The value defaults to 0 and doesn't need to be an integer */}
    <a.Source order={-1.1}>
      1
    </a.Source>
    2
  </>
}

return <>
  <a.Joint>
    <a.Dest />
    <b.Joint>
      {/* No source */}
      <b.Dest>fb</b.Dest>
      <c.Joint>
        3
        {/* Double destination */}
        <a.Dest />
        4
        <a.Source>
          5
        </a.Source>
        <c.Source>
          {/* No destination */}
          6
        </c.Source>
        <ProofThatItWorksCrossComponent />
        <c.Joint>
          {/* Inner scope for the "c" extractor */}
          <c.Dest />
          7
          <c.Source>
            8
          </c.Source>
          <c.Dest />
        </c.Joint>
      </c.Joint>
    </b.Joint>
  </a.Joint>
</>
```
The output of this code is ***1***, ***5***, ~~fb~~, 3, ***1***, ***5***, 4, 0, 2, ***8***, 7, ***8***.
<br />
You can detect the number of destinations available for a given extractor through `Extractor.getDestCount()`
```tsx
const e = new Extractor();
const [ g, s ] = createSignal(true);
return <>
  {void untrack(() => {
    // The function is `undefined` when we're not under an `Extractor.Joint`
    console.log(e.getDestCount); //→ undefined
  })}
  <e.Joint>
    {untrack(() => {
      // The founction is returned by a getter that bounds it to the current context
      const f = e.getDestCount!;
      return <>
        {untrack(() => {
          // (This scope is not reactive, so it doesn't know about the destinations that will come up later)
          console.log(f()); //→ 0
        })}

        <e.Dest />
        {untrack(() => {
          console.log(f()); //→ 1
        })}

        <e.Dest />

        <Show when={g()}>
          <e.Dest />
        </Show>

        <button onClick={() => s(x => !x)}>
          Toggle
        </button>
        <br />
        {/* This is reactive and will contain the number 2 or 3 depending on `g()` */}
        {JSON.stringify(g())} - {f()}

        <e.Joint>
          {untrack(() => {
            // Since `f()` is bound, it will return the destination count of ITS `Extractor.Joint`, not the closest one
            console.log(f()); //→ 3
            console.log(e.getDestCount!()); //→ 0
          })}
        </e.Joint>
      </>
    })}
  </e.Joint>
</>
```
You can use `Extractor.SameContextSource` to automate the process of using a `SameContext` inside a `Extractor.Source`. When in doubt, use `Extractor.SameContextSource` instead of `Extractor.Source`
```tsx
const e = new Extractor(), ctx = createContext(1);
return <>
  <e.Joint>
    <div>
      {/* This will contain "1" and "3" */}
      <e.Dest />
    </div>
    <ctx.Provider value={2}>
      <div>
        {/* This will contain "2" and "3" */}
        <e.Dest />
      </div>
      <ctx.Provider value={3}>
        <e.Source>{useContext(ctx)}</e.Source>
        <e.SameContextSource>{useContext(ctx)}</e.SameContextSource>
      </ctx.Provider>
    </ctx.Provider>
  </e.Joint>
</>
```

## Utility

### `unwrap()`
Calls an `Accessor` maintaining its reactivity at 1 level

### `memoProps()`
Memoizes the properties of an object

### `splitAndMemoProps()`
Like `splitProps()` but passes the every part except the last one to [`memoProps()`](#memoprops)

### `untrackCall()`
Calls a function untracking what happens inside of it but not what gets passed as its argument

### `registerEventListener()`
Adds an event listener and registers its removal

### `runWithContext()`
Creates a context scope that persists for the duration of a function