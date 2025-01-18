import { FormBuilder, FormConfig } from '@/components/common/FormBuilder/FormBuilder';

export const FormTest = () => {
  const formConfig: FormConfig = {
    title: 'Login',
    submitText: 'Sign In',
    // props: {
    //   title: {
    //     order: 1,
    //     ta: 'center',
    //   },
    // },
    sections: [
      {
        // title: 'Personal Information',
        // description: 'Please enter your personal information',
        // props: {
        //   title: {
        //     variant: 'default',
        //     classNames: { legend: 'text-left' },
        //   },
        //   description: {
        //     className: 'text-right',
        //   },
        // },
        rows: [
          // {
          //   fields: [
          //     {
          //       name: 'input1',
          //       label: 'Name',
          //       placeholder: 'Enter your name',
          //       description: 'Input description',
          //       type: 'text',
          //       colSpan: 4,
          //     },
          //     {
          //       name: 'input2',
          //       label: 'Form Input 2',
          //       placeholder: 'Enter your name',
          //       // description: 'Input description',
          //       type: 'text',
          //     },
          //   ],
          // },
          {
            fields: [
              {
                name: 'username',
                label: 'Username',
                type: 'text',
                // colSpan: 8,
              },
            ],
          },
          {
            fields: [
              {
                name: 'password',
                label: 'Password',
                type: 'password',
              },
            ],
          },
          {
            fields: [
              {
                name: 'rememberme',
                label: 'Keep me logged in',
                type: 'checkbox',
              },
            ],
          },
        ],
      },
    ],
  };
  return <FormBuilder formConfig={formConfig} />;
};
