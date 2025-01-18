import React from 'react';
import { BaseContainer } from '@/components/common/BaseContainer/BaseContainer';
import { Layout } from '@/components/common/Layout/Layout';
import { FormTest } from './FormTest';

// Optional: Only if you want to log actions (e.g., from '@storybook/addon-actions'):
// import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/FormBuilder/FormTest',
  component: FormTest,
  // This component will have an automatically generated Autodocs entry
  // if you're on Storybook 7+ and have Autodocs configured.
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  // If you needed to pass any callbacks for demonstration, you could define them here:
  /*
  args: {
    onSomeEvent: action('some-event'), 
  },
  */
};

const Template = () => {
  return (
    <Layout>
      <BaseContainer>
        <FormTest />
      </BaseContainer>
    </Layout>
  );
};

export const Default = {
  args: {},
  render: Template,
};
