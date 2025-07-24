# FormBuilder

A highly configurable, modular React form builder for Mantine + React Hook Form, with full Zod validation support.

- **UI Framework:** [Mantine](https://mantine.dev/)
- **Form State:** [React Hook Form](https://react-hook-form.com/)
- **Validation:** [Zod](https://zod.dev/)

## Features

- **Declarative config:** Build complex forms from a config object or function.
- **All Mantine fields supported:** Text, textarea, select, radio, checkbox, number, password, hidden, or even custom components.
- **Sections, rows, and grid layouts:** Organize fields in sections, rows, and Mantine grids.
- **Zod validation:** Use a single schema for end-to-end validation.
- **Async handlers and server error display.**
- **Extendable & modular:** Easy to add new field types.

---

## Installation

```sh
npm install @mantine/core react-hook-form zod @hookform/resolvers
```

> **Note:** You must have Mantine v7+ and React 18+ installed.

---

## Usage

### 1. Basic Example

```tsx
import { z } from 'zod';
import { FormBuilder } from './FormBuilder';

// 1. Define Zod schema
const schema = z.object({
  username: z.string().min(3, 'Username required'),
  password: z.string().min(6, 'Password required'),
  remember: z.boolean(),
});

// 2. Build your form config
const formConfig = (methods) => ({
  title: 'Login',
  submitText: 'Sign in',
  sections: [
    {
      rows: [
        {
          fields: [
            { name: 'username', label: 'Username', type: 'text', placeholder: 'Enter your username' },
            { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' },
            { name: 'remember', label: 'Remember me', type: 'checkbox' },
          ],
        },
      ],
    },
  ],
});

// 3. Implement submit handler
const submitHandler = async (data, methods) => {
  // call your API here
  alert(JSON.stringify(data, null, 2));
};

// 4. Render in your page/component
export default function LoginForm() {
  return <FormBuilder config={formConfig} schema={schema} submitHandler={submitHandler} />;
}
```

---

## Props & API

### `<FormBuilder />`

| Prop          | Type                                  | Required | Description                                                             |
| ------------- | ------------------------------------- | -------- | ----------------------------------------------------------------------- |
| config        | `(methods) => FormConfig`             | **Yes**  | A function returning your form configuration. Receives useForm methods. |
| submitHandler | `(data, methods) => Promise<unknown>` | **Yes**  | Async function called on submit. Gets form data and useForm methods.    |
| defaultValues | `DefaultValues<T>`                    | No       | Initial/default form values.                                            |
| schema        | `ZodTypeAny`                          | No       | Zod schema for validation.                                              |
| useFormProps  | `UseFormProps<T>`                     | No       | Props passed to `useForm` (e.g. mode, criteriaMode, etc.)               |
| loading       | `boolean`                             | No       | Show submit button as loading.                                          |

---

## FormConfig Structure

```ts
interface FormConfig {
  title?: string;
  beforeSubmitText?: React.ReactNode;
  afterSubmitText?: React.ReactNode;
  submitText?: string;                // Button text
  layout?: {
    titleProps?: TitleProps;          // Mantine <Title> props
    errorAlertProps?: Record<string, unknown>; // Mantine <Alert> props
  };
  sections: FormSection[];
}

interface FormSection {
  title?: string;
  description?: string;
  rows: FormRow[];
  layout?: {
    gridProps?: Record<string, unknown>;     // Passed to <Grid>
    fieldsetProps?: Record<string, unknown>; // Passed to <Fieldset>
  };
}

interface FormRow {
  fields: FormFieldConfig[];
}

type FieldComponentFn = (methods: UseFormReturn<FieldValues>) => React.ReactNode;

interface FormFieldConfig {
  name: string;
  label?: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'password' | 'number' | 'hidden' | 'component';
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[]; // For select/radio
  component?: ReactNode | FieldComponentFn;     // For type 'component'
  onChange?: (e: React.ChangeEvent<HTMLElement>) => void | (value: string | null, option?: ComboboxItem) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  controllerProps?: Omit<ControllerProps, 'render' | 'control' | 'name'>;
  layout?: {
    props?: Record<string, unknown>;            // e.g. { withAsterisk: true }
    gridColProps?: Record<string, unknown>;     // e.g. { span: 8 }
  };
}
```

---

## Supported Field Types

- **text:** Standard text input (`TextInput`)
- **textarea:** Multiline text (`Textarea`)
- **password:** Password input (`PasswordInput`)
- **checkbox:** Checkbox
- **select:** Dropdown select (`Select`)
- **radio:** Radio group (`Radio.Group`)
- **number:** Number input (`NumberInput`)
- **hidden:** Hidden field (`<input type="hidden">`)
- **component:** Render any custom component (function or React node)

### Select/Radio options

```js
options: [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
];
```

---

## Custom Layouts

You can pass Mantine Grid props for layouts, and use `fieldsetProps`, `titleProps`, etc.

```js
{
  title: 'My Form',
  layout: { titleProps: { order: 3, align: 'left' } },
  sections: [
    {
      title: 'Personal Details',
      rows: [
        {
          fields: [
            { name: 'first', label: 'First Name', type: 'text', layout: { gridColProps: { span: 6 } } },
            { name: 'last', label: 'Last Name', type: 'text', layout: { gridColProps: { span: 6 } } },
          ]
        }
      ],
      layout: { gridProps: { gutter: 'lg' }, fieldsetProps: { mt: 'md' } }
    }
  ]
}
```

---

## Custom Field Components

Add any custom input:

```js
{
  name: 'custom',
  type: 'component',
  component: (methods) => (
    <Button onClick={() => methods.setValue('first', 'Default')}>
      Set Default
    </Button>
  )
}
```

---

## Server Error Handling

- Any error thrown in `submitHandler` will be displayed in a root error alert at the top of the form.
- You can also set custom error messages by calling `setError('root.serverError', ...)` from your `submitHandler`.

---

## Advanced: Dynamic Config & Conditional Fields

Since the config is a function receiving `useForm` methods, you can make field configs dynamic based on form state:

```js
const config = (methods) => ({
  sections: [
    {
      rows: [
        {
          fields: [
            { name: 'has_pet', label: 'Do you have pets?', type: 'checkbox' },
            ...(methods.watch('has_pet') ? [{ name: 'pet_name', label: 'Pet Name', type: 'text' }] : []),
          ],
        },
      ],
    },
  ],
});
```

---

## Best Practices & Extensions

- Use [Zod](https://zod.dev/) for schema-based validation. Pass your schema via the `schema` prop.
- For async default values (e.g. fetching initial data), you can wrap `<FormBuilder>` in your own component and use state to set `defaultValues` once fetched.
- For fully dynamic forms (fields/sections based on remote data), you can build your config in a hook or memoize with `useMemo`.

---

## Example: Full Featured Form

```tsx
const schema = z.object({
  name: z.string().min(1),
  age: z.number().int().gte(0),
  role: z.enum(['admin', 'user']),
  agree: z.boolean(),
});

const config = (methods) => ({
  title: 'User Registration',
  submitText: 'Register',
  sections: [
    {
      title: 'Personal Info',
      description: 'Please provide your details.',
      rows: [
        {
          fields: [
            { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', layout: { gridColProps: { span: 6 } } },
            { name: 'age', label: 'Age', type: 'number', placeholder: 'Your age', layout: { gridColProps: { span: 6 } } },
          ],
        },
      ],
    },
    {
      title: 'Account',
      rows: [
        {
          fields: [
            {
              name: 'role',
              label: 'Role',
              type: 'select',
              options: [
                { label: 'Admin', value: 'admin' },
                { label: 'User', value: 'user' },
              ],
            },
            { name: 'agree', label: 'I agree to terms', type: 'checkbox' },
          ],
        },
      ],
    },
  ],
});

<FormBuilder config={config} schema={schema} submitHandler={async (data) => alert(JSON.stringify(data, null, 2))} />;
```

---

## TypeScript

- The form is fully typed. You can provide your types to `FormBuilder` and `FormConfigFn` for full intellisense and type safety.

---

## FAQ

### How do I use async default values?

```tsx
const [defaults, setDefaults] = useState();

useEffect(() => {
  fetch('/api/user')
    .then((res) => res.json())
    .then(setDefaults);
}, []);

return defaults ? <FormBuilder defaultValues={defaults} {...otherProps} /> : <Loader />;
```

### How do I add a custom field type?

Extend the switch-case in `FieldRenderer` to support your own field.

---

## License

MIT

---

## Credits

- Built by [Feroz](https://github.com/your-github)
- Inspired by Mantine, React Hook Form, and Zod
