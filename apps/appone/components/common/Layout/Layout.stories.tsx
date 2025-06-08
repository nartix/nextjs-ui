import { Layout } from './Layout';

// Optional: Only if you want to log actions (e.g., from '@storybook/addon-actions'):
// import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/Layout/Layout',
  component: Layout,
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

export const Default = {
  args: {},
};
