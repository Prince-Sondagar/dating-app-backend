import { INestApplicationContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, ServerOptions, Socket } from "socket.io";
import { UserService } from "./user/user.service";

export type SocketWithUser = Socket & { userId: string };

export class SocketIOAdapter extends IoAdapter {
	private configService: ConfigService;
	private jwtService: JwtService;
	private userService: UserService;

	constructor(private app: INestApplicationContext) {
		super(app);
		this.userService = app.get(UserService);
		this.jwtService = app.get(JwtService);
		this.configService = app.get(ConfigService);
		this.createTokenMiddleware.bind(this);
	}

	createIOServer(port: number, options?: ServerOptions) {
		const clientPort = parseInt(this.configService.get("CLIENT_PORT"));

		const cors = {
			origin: [
				...(this.configService.get("NODE_ENV") === "prod"
					? ["tradlife.app", "www.tradlife.app"]
					: [
							`http://localhost:${clientPort}`,
							"dev.tradlife.app",
							"devapi.tradlife.app",
							new RegExp(`/^http:\/\/192\.168\.29\.([1-9]|[1-9]\d):${clientPort}$/`),
					  ]),
			],
		};

		const optionsWithCORS: ServerOptions = {
			...options,
			cors,
		};

		const server: Server = super.createIOServer(port, optionsWithCORS);
		server.use(this.createTokenMiddleware(this.userService, this.jwtService));
		server.of("message").use(this.createTokenMiddleware(this.userService, this.jwtService));

		return server;
	}

	createTokenMiddleware(userService: UserService, jwtService: JwtService) {
		return async function (socket: SocketWithUser, next) {
			const token = socket.handshake.auth.token || socket.handshake.headers["token"];
			try {
				const payload = jwtService.verify(token);
				const user = await userService.findOne({ id: payload.id });
				if (!user) throw Error("user not found");
				socket.userId = user.id;
				next();
			} catch (e: any) {
				next(new Error(e.message || "FORBIDDEN"));
			}
		};
	}
}
