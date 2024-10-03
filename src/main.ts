import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { join } from "path";
import { AppModule } from "./app.module";
import { SocketIOAdapter } from "./socketIo.adapter";
import { HttpExceptionFilter } from "./utils/error-handler/http-exception.filter";
import { MyLogger } from "./utils/logger/my-logger.service";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		logger: new MyLogger(),
	});

	app.setGlobalPrefix("/api");
	app.enableCors();
	app.useGlobalFilters(new HttpExceptionFilter());
	app.useWebSocketAdapter(new SocketIOAdapter(app));
	app.useStaticAssets(join(__dirname, "..", "upload"));

	const config = new DocumentBuilder()
		.setTitle("Dating App")
		.setVersion("1.0")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
			"JWT-auth",
		)
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, document);

	await app.listen(process.env.PORT);
}
bootstrap();
