import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response: Response = ctx.getResponse();
		const request = ctx.getRequest();

		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
		const data: Object =
			exception instanceof HttpException
				? exception.getResponse()
				: { message: "Sorry, something went wrong there. Try again." };

		response.status(status).json({
			...data,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
