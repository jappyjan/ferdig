export const isRequired = (value?: never): boolean | string => !!value || 'This field is required';
export const minLength = (minLength: number) => (value?: string): boolean | string => (!!value && value?.length >= minLength) || `Needs a minimum length of ${minLength}`;
export const isEmail = (value: string): string | boolean => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return pattern.test(value) || 'Invalid e-mail.'
};
