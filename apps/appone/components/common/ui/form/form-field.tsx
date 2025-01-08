// import React from 'react';
// import { Input, Textarea, Select, Checkbox, Radio, DatePicker, SelectItem } from '@nextui-org/react';
// import {
//   FormField as FormFieldType,
//   FormDataValues,
//   FormBuilderProps,
//   FormFieldType as FormFieldTypeType,
// } from '@/components/common/ui/form/form-types';
// import { useFormContext } from 'react-hook-form';
// import { EyeFilledIcon, EyeSlashFilledIcon } from '@/components/common/ui/icons/icons';

// interface FormFieldProps {
//   field: FormFieldType;
//   variant: FormBuilderProps['variant'];
// }

// const FormField: React.FC<FormFieldProps> = ({ field, variant }) => {
//   const {
//     register,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useFormContext<FormDataValues>();
//   const [isVisible, setIsVisible] = React.useState(false);
//   const selectedValue = watch(field.name);

//   const handleClearInput = () => {
//     setValue(field.name, '');
//   };

//   const toggleVisibility = () => setIsVisible(!isVisible);

//   const commonProps = {
//     label: field.label,
//     placeholder: field.placeholder,
//     className: field.className,
//     isInvalid: !!errors[field.name],
//     errorMessage: errors[field.name]?.message?.toString(),
//     variant,
//   };

//   const renderField = () => {
//     switch (field.type) {
//       case 'textarea':
//         return <Textarea {...commonProps} {...register(field.name)} />;

//       case 'select':
//         return (
//           <div className='relative'>
//             <Select
//               {...commonProps}
//               {...register(field.name)}
//               items={field.options?.map((option) => ({
//                 key: option.value,
//                 label: option.label,
//               }))}
//               value={selectedValue as FormFieldTypeType}
//               onChange={(event) => setValue(field.name, event.target.value)}
//               // Additional Select props as needed
//             >
//               <SelectItem></SelectItem>
//             </Select>
//             {field.isClearable && selectedValue && (
//               <Button
//                 size='xs'
//                 color='error'
//                 onClick={handleClearInput}
//                 className='absolute right-2 top-2'
//                 aria-label={`Clear ${field.label}`}
//               >
//                 Clear
//               </Button>
//             )}
//           </div>
//         );

//       case 'checkbox':
//         return <Checkbox {...register(field.name)}>{field.label}</Checkbox>;

//       case 'radio':
//         return (
//           <Radio.Group {...commonProps}>
//             {field.options?.map((option) => (
//               <Radio key={option.value} value={option.value}>
//                 {option.label}
//               </Radio>
//             ))}
//           </Radio.Group>
//         );

//       case 'date':
//         return <DatePicker {...commonProps} {...register(field.name)} />;

//       case 'password':
//         return (
//           <Input
//             {...commonProps}
//             {...register(field.name)}
//             type={isVisible ? 'text' : 'password'}
//             endContent={
//               <button
//                 type='button'
//                 onClick={toggleVisibility}
//                 className='focus:outline-none'
//                 aria-label='toggle password visibility'
//               >
//                 {isVisible ? <EyeSlashFilledIcon /> : <EyeFilledIcon />}
//               </button>
//             }
//           />
//         );

//       default:
//         return (
//           <Input
//             {...commonProps}
//             {...register(field.name)}
//             type={field.type}
//             // Removed isClearable and onClear
//           />
//         );
//     }
//   };

//   return <div className='w-full'>{renderField()}</div>;
// };

// export default FormField;
