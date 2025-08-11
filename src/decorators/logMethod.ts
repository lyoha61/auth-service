export function LogMethod() {
	return function (
		target: Object,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor
	) {
		const originalMethod = descriptor.value;

		console.log(originalMethod);

		return descriptor;
	}
}