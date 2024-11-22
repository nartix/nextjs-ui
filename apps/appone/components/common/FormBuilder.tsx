// app/(common)/components/FormBuilder.tsx
'use client';

import React from 'react';
import { Input, Button } from '@nextui-org/react';
import { ZodType } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Card, CardHeader, CardContent, CardTitle } from '@/components/common/ui/card';
import { Alert, AlertDescription } from '@/components/common/ui/alert';
import { EyeFilledIcon } from '@/components/common/ui/icons/EyeFilledIcon';
import { EyeSlashFilledIcon } from '@/components/common/ui/icons/EyeSlashFilledIcon';

export type FormField = {
  type: 'text' | 'email' | 'password' | 'textarea';
  name: string;
  label: string;
  className?: string;
  placeholder?: string;
  isClearable?: boolean;
};

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type FormBuilderProps<T = unknown> = {
  fields: FormField[];
  heading?: string;
  buttons?: ButtonProps[];
  variant?: 'bordered' | 'faded' | 'underlined' | 'flat';
  className?: string;
  action?: (data: FormDataValues, req?: Request) => Promise<ActionResponse>;
  formSchema?: ZodType<T>;
  handleRedirect?: boolean;
};

export type ButtonProps = {
  text: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  className?: string;
  onClick?: () => void;
};

export type FormDataValues = {
  [key: string]: string | number | File;
};

const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  heading,
  buttons = [{ text: 'Submit' }],
  variant = 'flat',
  className = 'items-center',
  action,
  formSchema,
  handleRedirect = false,
}) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = React.useState(false);
  const [serverMessage, setServerMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormDataValues>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
  });

  const handleClearInput = (name: keyof FormDataValues) => {
    setValue(name as string, '');
  };

  const onSubmit: SubmitHandler<FormDataValues> = async (data) => {
    setServerMessage(null);
    try {
      if (action) {
        const response = await action(data);
        if (response && response.success) {
          if (handleRedirect) {
            const next = searchParams.get('next');
            router.push(next || '/');
          }
          reset();
          return;
        } else {
          setServerMessage(response?.message || t('errors.an_error_occurred'));
        }
      } else {
        setServerMessage(t('common.no_action_provided'));
      }
    } catch {
      setServerMessage(t('errors.failed_to_submit_form'));
    }
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <Card className='border-none shadow-none'>
      {heading && (
        <CardHeader>
          <CardTitle className='text-center text-3xl font-semibold '>{heading}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {serverMessage && (
          <Alert variant='destructive' className='mb-6'>
            <AlertDescription>{serverMessage}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className={`w-full flex flex-col flex-wrap md:flex-nowrap gap-4 ${className}`}>
          {fields.map((field) => (
            <div key={field.name} className='w-64'>
              <Input
                {...register(field.name)}
                key={field.name}
                isInvalid={errors[field.name as keyof typeof errors] ? true : false}
                errorMessage={errors[field.name as keyof typeof errors]?.message?.toString()}
                variant={variant}
                label={field.label}
                placeholder={field.placeholder}
                type={field.type === 'password' && isVisible ? 'text' : field.type}
                isClearable={field.type !== 'password' && field.isClearable}
                onClear={field.type !== 'password' ? () => handleClearInput(field.name) : undefined}
                endContent={
                  field.type === 'password' && (
                    <button
                      className='focus:outline-none'
                      type='button'
                      onClick={toggleVisibility}
                      aria-label='toggle password visibility'
                    >
                      {isVisible ? (
                        <EyeSlashFilledIcon className='text-2xl text-default-400 pointer-events-none' />
                      ) : (
                        <EyeFilledIcon className='text-2xl text-default-400 pointer-events-none' />
                      )}
                    </button>
                  )
                }
              />
            </div>
          ))}
          <div className='flex gap-4'>
            {buttons.map((button, index) => (
              <Button
                key={index}
                type={button.onClick ? 'button' : 'submit'}
                className={button.className}
                color={button.color || 'primary'}
                onClick={button.onClick}
              >
                {button.text}
              </Button>
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormBuilder;
