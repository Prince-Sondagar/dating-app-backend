export type SuccessResponse<T = null> = {
	error: boolean;
	message: string;
	data?: T;
};
