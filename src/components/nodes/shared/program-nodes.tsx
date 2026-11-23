import { defineNode } from '../define-node';

export const programNodes = [
  defineNode({
    id: 'samples-node',
    title: 'Samples',
    category: 'Audio Effects',
    icon: 'Music',
    parameters: {},
    defaults: {} as {
      source?: string;
      sampleMap?: Record<string, string | string[]>;
    },
    generate: (_values, input) => input,
    component: ({ values, onChange }) => (
      <div className="flex w-80 flex-col gap-2 px-3 pb-3">
        {!values.sampleMap ? (
          <label className="text-xs">
            Sample library
            <input
              aria-label="Sample library"
              className="nodrag mt-1 w-full rounded border bg-background p-2"
              value={values.source ?? ''}
              onChange={(event) => onChange({ source: event.target.value })}
            />
          </label>
        ) : (
          Object.entries(values.sampleMap ?? {}).map(([name, urls]) => (
            <label key={name} className="text-xs">
              {name}
              <textarea
                aria-label={`Sample ${name}`}
                className="nodrag mt-1 w-full rounded border bg-background p-2"
                value={Array.isArray(urls) ? urls.join('\n') : urls}
                onChange={(event) =>
                  onChange({
                    sampleMap: {
                      ...values.sampleMap,
                      [name]: Array.isArray(urls)
                        ? event.target.value.split('\n')
                        : event.target.value,
                    },
                  })
                }
              />
            </label>
          ))
        )}
      </div>
    ),
  }),
  defineNode({
    id: 'expression-node',
    title: 'Expression',
    category: 'Instruments',
    icon: 'Code',
    parameters: {
      expression: { control: 'text', label: 'Expression', default: 'silence' },
    },
    generate: ({ expression }) => `(${expression})`,
  }),
].map((definition) => ({
  ...definition,
  menuHidden: definition.id !== 'samples-node',
}));
