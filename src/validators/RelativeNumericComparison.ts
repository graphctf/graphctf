import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function relativeNumericComparisonValidatorFactory(
  name: string,
  comparer: (a: number, b: number) => boolean
) {
  return function (property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name,
        target: object.constructor,
        propertyName: propertyName,
        constraints: [property],
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            const [relatedPropertyName] = args.constraints;
            const relatedValue = (args.object as any)[relatedPropertyName];
            return typeof value === 'number' && typeof relatedValue === 'number' && comparer(value, relatedValue);
          },
        },
      });
    };
  };
}

export const GT = relativeNumericComparisonValidatorFactory('gt', (a, b) => a > b);
export const GTE = relativeNumericComparisonValidatorFactory('gte', (a, b) => a >= b);
export const LT = relativeNumericComparisonValidatorFactory('lt', (a, b) => a < b);
export const LTE = relativeNumericComparisonValidatorFactory('lte', (a, b) => a <= b);
