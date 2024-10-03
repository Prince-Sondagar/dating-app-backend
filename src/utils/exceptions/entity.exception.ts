import { HttpException, HttpStatus } from '@nestjs/common';

export class EntityNotExistException extends HttpException {
	constructor(data: any, message: string = 'Bad Request!') {
		super({ statusCode: 400, meta: data, message }, HttpStatus.BAD_REQUEST);
	}
}

export class EntityAlreadyExistException extends HttpException {
	constructor(data: any, message: string = 'Bad Request!') {
		super({ statusCode: 400, meta: data, message }, HttpStatus.BAD_REQUEST);
	}
}
