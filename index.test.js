const postcss = require('postcss')

const plugin = require('./index.js')

async function run (input, output, opts = { }) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}

it('will run a replacement on reference selectors', async () => {
  await run(`$simpleRefSelector {
    color: tomato;
  }
  .foo {
    @include $simpleRefSelector;
  }`,
  `._export💲simpleRefSelector {
    color: tomato;
  }
  .foo {
    color: tomato;
  }`
  );
});

it('will throw if the selector does not exist', async () => {
  expect(async () => {
    await run(`$foo {
      color: tomato;
    }
    @include $foo;`,)
  }).toThrow();
})
