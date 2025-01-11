import React from 'react';
import { FerozLogoText } from './FerozLogoText';

export default {
  title: 'Components/FerozLogo/FerozLogoText',
  component: FerozLogoText,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

interface MantineUIVariantArgs {
  size: number;
}

export const MantineUIVariant: {
  args: MantineUIVariantArgs;
  render: (args: MantineUIVariantArgs) => JSX.Element;
} = {
  args: {
    size: 30,
  },
  render: (args) => (
    <div style={{ padding: 40 }}>
      <FerozLogoText {...args} />
    </div>
  ),
};

interface TextLogoArgs {
  size: number;
  inverted?: boolean;
  color?: string;
}

export const TextLogo: {
  args: TextLogoArgs;
  render: (args: TextLogoArgs) => JSX.Element;
} = {
  args: {
    size: 30,
  },
  render: (args) => (
    <>
      <FerozLogoText {...args} />
      <FerozLogoText {...args} inverted />
      <FerozLogoText {...args} color='cyan' />
      <FerozLogoText {...args} color='orange' />
    </>
  ),
};

export const Default = {
  args: {},
};
