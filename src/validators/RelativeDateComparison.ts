import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function relativeDateComparisonValidatorFactory(
  name: string,
  nullable: boolean,
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
            if (nullable && typeof relatedValue === 'undefined' || relatedValue === null) return true;
            return value instanceof Date && relatedValue instanceof Date
              && comparer(value.getTime(), relatedValue.getTime());
          },
        },
      });
    };
  };
}

export const DateGT = relativeDateComparisonValidatorFactory('dateGT', false, (a, b) => a > b);
export const DateGTE = relativeDateComparisonValidatorFactory('dateGTE', false, (a, b) => a >= b);
export const DateLT = relativeDateComparisonValidatorFactory('dateLT', false, (a, b) => a < b);
export const DateLTE = relativeDateComparisonValidatorFactory('dateLTE', false, (a, b) => a <= b);

export const DateGTNullable = relativeDateComparisonValidatorFactory('dateGT', true, (a, b) => a > b);
export const DateGTENullable = relativeDateComparisonValidatorFactory('dateGTE', true, (a, b) => a >= b);
export const DateLTNullable = relativeDateComparisonValidatorFactory('dateLT', true, (a, b) => a < b);
export const DateLTENullable = relativeDateComparisonValidatorFactory('dateLTE', true, (a, b) => a <= b);
