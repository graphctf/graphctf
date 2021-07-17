import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidateIf,
} from 'class-validator';

export function IIF (
  condition: (object: any, value: any) => boolean,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    // Prevents additional validators (i.e. Min()) from running if we are specifically not supposed to have
    // a value (i.e. if IIF condition is false), and no value was provided.
    ValidateIf((self, value) => {
      // If we have a value, it should always be validated. (If the value SHOULD be there, this will run normal
      // validators, and if it SHOULDN'T be there, it will fail our validator below.)
      if (typeof value !== 'undefined' && value !== null) return true;

      // We don't have a value, but if we should have one, validate so that our validator below fails.
      return condition(self as any, value);
    })(object, propertyName);

    registerDecorator({
      name: 'iif',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const hasProperty = typeof value !== 'undefined' && value !== null;
          return condition(args.object as any, value) ? hasProperty : !hasProperty;
        },
      },
    });
  };
};
