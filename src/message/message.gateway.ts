import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { MessageTypeEnum } from "src/database/entities/message.entity";
import { MessageService } from "src/message/message.service";
import { SocketWithUser } from "src/socketIo.adapter";
import { UserService } from "src/user/user.service";

export type MessagePayload = {
	message: string;
	threadId: string;
	type?: MessageTypeEnum;
};

export type MessageLikeUnlikePayload = {
	messageId: string;
	threadId: string;
	like?: boolean;
};

@WebSocketGateway({ namespace: "message" })
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;

	constructor(private readonly userService: UserService, private readonly messageService: MessageService) {}

	@SubscribeMessage("message")
	async handleMessage(socket: SocketWithUser, payload: string): Promise<any> {
		const body: MessagePayload = JSON.parse(payload || "{}");
		try {
			if (!body.message || !body.threadId) return socket.emit("error", "Please provide valid payload");

			const thread = await this.messageService.findThread(body.threadId, socket.userId);
			if (!thread) return socket.emit("error", "Thread not found");
			const toUserId = socket.userId === thread.userSender.id ? thread.userReceiver.id : thread.userSender.id;
			const message = await this.messageService.createMessage({
				message: body.message,
				thread: thread,
				fromUser: await this.userService.findById(socket.userId),
				toUser: await this.userService.findById(toUserId),
				type: MessageTypeEnum[(body.type ?? "STRING").toUpperCase()] || MessageTypeEnum.STRING,
			});
			const [myUnSeenMessageCount, toUserUnSeenCount] = await Promise.all([
				this.messageService.fetchUnSeenMessageCount(socket.userId),
				this.messageService.fetchUnSeenMessageCount(toUserId),
			]);
			socket.emit("unseen-message-count", myUnSeenMessageCount);
			socket.to(thread.id).emit("unseen-message-count", toUserUnSeenCount);
			socket.emit("receive-message", {
				success: true,
				id: message?.id,
				message: body.message,
				fromUser: socket.userId,
				toUser: toUserId,
				type: body.type,
			});
			socket.to(thread.id).emit("receive-message", {
				success: true,
				id: message?.id,
				message: body.message,
				fromUser: socket.userId,
				toUser: toUserId,
				type: body.type,
			});
		} catch (error) {
			socket.to(body.threadId).emit("receive-message", { success: false });
		}
	}

	@SubscribeMessage("send-like-unlike")
	async handleMessageLikeUnlike(socket: SocketWithUser, payload: string): Promise<any> {
		const body: MessageLikeUnlikePayload = JSON.parse(payload || "{}");
		try {
			const message = await this.messageService.setLikeUnlikeToMessage(
				body.threadId,
				body.messageId,
				socket.userId,
				body.like ? new Date() : null,
			);
			if (!message.affected) throw Error("Message not found");
			socket.to(body.threadId).emit("receive-like-unlike", {
				success: true,
				userId: socket.userId,
				like: body.like ? new Date() : null,
				threadId: body.threadId,
				messageId: body.messageId,
			});
		} catch {}
	}

	async handleDisconnect(socket: SocketWithUser) {
		if (socket.userId) {
			await this.userService.updateUsers({ id: socket.userId }, { isActive: false, lastActive: new Date() });
			const threads = await this.messageService.fetchMyThreads(socket.userId);
			threads.map(({ id }) => {
				socket.to(id).emit("user-offline");
			});
		}
	}

	async handleConnection(socket: SocketWithUser) {
		if (!socket.userId) return null;
		await this.userService.updateUsers({ id: socket.userId }, { isActive: true });
		const [fetchMyThreads, unSeenMessage] = await Promise.all([
			this.messageService.fetchMyThreads(socket.userId),
			this.messageService.fetchUnSeenMessageCount(socket.userId),
		]);
		socket.emit("unseen-message-count", unSeenMessage);
		fetchMyThreads.map(({ id }) => {
			socket.join(id);
			socket.to(id).emit("user-online");
		});
	}
}
