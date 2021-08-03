export const isRequired = (value?: never): boolean | string => !!value || 'This field is required';
export const minLength = (minLength: number) => (value?: string): boolean | string => (!!value && value?.length >= minLength) || `Needs a minimum length of ${minLength}`;
