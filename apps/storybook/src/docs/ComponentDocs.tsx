import React, { useEffect, useRef, useState } from 'react';
import { useOf } from '@storybook/addon-docs/blocks';
import manifest from '@codechem/components/custom-elements.json';
import { CodeBlock } from './CodeBlock';
import { guides, type ComponentGuide } from './component-guides';

const declarations = manifest.modules.flatMap((module) => module.declarations ?? []);
const slug = (name: string) => name.toLowerCase().replaceAll(' ', '-');

function LiveExample({ guide }: { guide: ComponentGuide }) {
  const root = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('Interact with the example to inspect its events.');
  useEffect(() => {
    const element = root.current!;
    // Only trusted, checked-in examples are inserted here; never consumer input.
    element.innerHTML = guide.markup;
    guide.setup?.(element);
    const events = ['click', 'input', 'change', 'close', 'cc-close', 'remove', 'select'];
    const inspect = (event: Event) => {
      const target = event.target as HTMLElement & {
        checked?: boolean;
        value?: string;
        selected?: boolean;
        page?: number;
      };
      if (!target.localName.startsWith('cc-')) return;
      const state = target.checked ?? target.page ?? target.value ?? target.selected;
      setMessage(`${target.localName} → ${event.type}${state === undefined ? '' : `: ${JSON.stringify(state)}`}`);
    };
    // close intentionally does not bubble; capture it without changing the component.
    for (const event of events) element.addEventListener(event, inspect, true);
    return () => {
      for (const event of events) element.removeEventListener(event, inspect, true);
      element.replaceChildren();
    };
  }, [guide]);
  return (
    <div className="cc-example sb-unstyled">
      <div className="cc-example-controls" ref={root} />
      <output className="cc-example-output" aria-live="polite">
        {message}
      </output>
    </div>
  );
}

function ApiReference({ tag, guide }: { tag: string; guide: ComponentGuide }) {
  const declaration = declarations.find((item) => 'tagName' in item && item.tagName === tag);
  const ctor = customElements.get(tag) as typeof HTMLElement & {
    observedAttributes: string[];
    elementProperties: Map<string, { state?: boolean; attribute?: string | boolean }>;
  };
  if (!declaration || !ctor) return null;
  // Reading observedAttributes finalizes Lit's property metadata. The analyzer
  // currently misclassifies state fields as attributes; never publish those.
  void ctor.observedAttributes;
  const members = 'members' in declaration ? (declaration.members ?? []) : [];
  const attributes = 'attributes' in declaration ? (declaration.attributes ?? []) : [];
  const properties = [...ctor.elementProperties]
    .filter(([, options]) => !options.state)
    .map(([name, options]) => {
      const member = members.find((item) => item.name === name);
      const attribute = attributes.find((item) => item.fieldName === name);
      return {
        name,
        attribute:
          options.attribute === false
            ? 'Property only'
            : typeof options.attribute === 'string'
              ? options.attribute
              : name.toLowerCase(),
        type: member && 'type' in member ? member.type?.text : attribute?.type?.text,
        default: member && 'default' in member ? member.default : attribute?.default,
        description:
          guide.notes?.[name] ?? (member && 'description' in member ? member.description : attribute?.description),
      };
    });
  const slots = 'slots' in declaration ? (declaration.slots ?? []) : [];
  const events = 'events' in declaration ? (declaration.events ?? []) : [];
  const parts = 'cssParts' in declaration ? (declaration.cssParts ?? []) : [];
  const methods = members.filter((member) => member.kind === 'method' && member.privacy !== 'private');
  return (
    <section className="cc-api">
      <h3>{tag}</h3>
      <div className="cc-table-scroll" role="region" aria-label={`${tag} properties`} tabIndex={0}>
        <table className="cc-docs-table">
          <thead>
            <tr>
              <th scope="col">Property / attribute</th>
              <th scope="col">Type / default</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.name}>
                <td>
                  <code>{property.name}</code>
                  <small>{property.attribute}</small>
                  {property.description && <p>{property.description}</p>}
                </td>
                <td>
                  <code>{property.type ?? 'See usage'}</code>
                  <small>
                    Default: <code>{property.default ?? 'Not set'}</code>
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4>Events</h4>
      {events.length ? (
        <dl>
          {events.map((event) => (
            <React.Fragment key={event.name}>
              <dt>
                <code>{event.name}</code>
              </dt>
              <dd>{event.description ?? 'Listen with addEventListener on the component.'}</dd>
            </React.Fragment>
          ))}
        </dl>
      ) : (
        <p>No component-specific events. Interactive elements also expose standard DOM events such as click.</p>
      )}
      <h4>Slots</h4>
      {slots.length ? (
        <dl>
          {slots.map((slot) => (
            <React.Fragment key={slot.name}>
              <dt>
                <code>{slot.name || '(default)'}</code>
              </dt>
              <dd>{slot.description}</dd>
            </React.Fragment>
          ))}
        </dl>
      ) : (
        <p>No public content slots.</p>
      )}
      {methods.length > 0 && (
        <>
          <h4>Methods</h4>
          <dl>
            {methods.map((method) => (
              <React.Fragment key={method.name}>
                <dt>
                  <code>
                    {method.name}(
                    {'parameters' in method
                      ? method.parameters
                          ?.map((parameter) => `${parameter.name}${parameter.optional ? '?' : ''}`)
                          .join(', ')
                      : ''}
                    )
                  </code>
                </dt>
                <dd>
                  {method.name === 'checkValidity'
                    ? 'Returns whether the current value satisfies validity constraints.'
                    : method.name === 'reportValidity'
                      ? 'Checks validity and asks the browser to show a validation message when invalid.'
                      : method.name === 'focus'
                        ? 'Moves focus into the component. Accepts optional FocusOptions.'
                        : method.name === 'click'
                          ? 'Programmatically activates the inner control.'
                          : (method.description ?? 'Call this method on the component element.')}
                </dd>
              </React.Fragment>
            ))}
          </dl>
        </>
      )}
      {parts.length > 0 && (
        <>
          <h4>CSS parts</h4>
          <dl>
            {parts.map((part) => (
              <React.Fragment key={part.name}>
                <dt>
                  <code>::part({part.name})</code>
                </dt>
                <dd>{part.description}</dd>
              </React.Fragment>
            ))}
          </dl>
          <p>Prefer design tokens for theme changes. Use parts only for targeted overrides.</p>
        </>
      )}
    </section>
  );
}

export function ComponentDocs() {
  const { preparedMeta } = useOf('meta', ['meta']);
  const { story } = useOf('story', ['story']);
  const tag = preparedMeta.component as string;
  const guide = guides[tag];
  if (!guide)
    return (
      <>
        <h1>{preparedMeta.title}</h1>
        <p>Documentation is not yet available for this component.</p>
      </>
    );
  return (
    <article className="cc-component-docs">
      <header>
        <p className="cc-docs-path">
          Components / <code>{tag}</code>
        </p>
        <h1>{guide.name}</h1>
        <p className="cc-docs-lead">{guide.summary}</p>
      </header>
      <nav className="cc-page-nav" aria-label="On this page">
        <a href="#example">Example</a>
        <a href="#usage">Usage</a>
        <a href="#accessibility">Accessibility</a>
        <a href="#api">API reference</a>
      </nav>
      <CodeBlock language="js" code={`import '@codechem/components/${guide.entry}.js';`} />
      <section id="example">
        <h2>Example</h2>
        <LiveExample guide={guide} />
        <CodeBlock language="html" code={guide.markup} />
        {guide.javascript && <CodeBlock language="js" code={guide.javascript} />}
      </section>
      <section id="usage">
        <h2>Usage</h2>
        {guide.usage.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </section>
      <section id="accessibility">
        <h2>Accessibility</h2>
        <ul>
          {guide.accessibility.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </section>
      <section id="api">
        <h2>API reference</h2>
        <p>
          Properties, defaults, events and slots from the component manifest, with internal reactive state excluded.
          Boolean attributes are enabled by presence; use JavaScript properties for live state.
        </p>
        <ApiReference tag={tag} guide={guide} />
        {tag === 'cc-radio-group' && <ApiReference tag="cc-radio" guide={guide} />}
      </section>
      <section>
        <h2>Explore further</h2>
        <p>
          <a href={`?path=/story/${story.id}`} target="_top">
            Open the interactive playground
          </a>{' '}
          to explore variants and controls. Development stories remain in the sidebar.
        </p>
        <nav className="cc-related" aria-label="Related documentation">
          {guide.related.map((name) => (
            <a key={name} href={`?path=/docs/components-${slug(name)}--docs`} target="_top">
              {name} →
            </a>
          ))}
          <a href="?path=/docs/guides-forms-and-events--docs" target="_top">
            Forms and events →
          </a>
        </nav>
      </section>
    </article>
  );
}
