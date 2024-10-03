import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import userConnectedAccountEntity from "src/database/entities/userConnectedAccount.entity";
import userSpotifyAccountArtistEntity from "src/database/entities/userSpotifyArtist.entity";
import { AnthemEnum, UserAccountEnum } from "src/database/types/user-current-account";
import { IUser } from "src/user/user.type";
import { isNullOrUndefined } from "src/utils/helperFunctions";
import { Repository } from "typeorm";
import { ConnectInstagramAccount, ConnectUserAccountDto, UpdateSpotifyArtist } from "./userConnectedAccount.dto";

@Injectable()
export class UserConnectedAccountService {
	constructor(
		@InjectRepository(userConnectedAccountEntity)
		private readonly userConnectedAccount: Repository<userConnectedAccountEntity>,
		@InjectRepository(userSpotifyAccountArtistEntity)
		private readonly userSpotifyArtist: Repository<userSpotifyAccountArtistEntity>,
	) {}

	async findConnectedUser(user: IUser, type: UserAccountEnum) {
		const { id } = user;

		const getConnectedUser = await this.userConnectedAccount.find({ where: { type: type, user: { id } } });
		return getConnectedUser;
	}

	async getRedirectUrl(appType: UserAccountEnum) {
		try {
			const regex = /{([^}]+)}/g;
			let redirectUri = "";
			if (appType === UserAccountEnum.SPOTIFY) {
				redirectUri = process.env.SPOTIFY_AUTH_ENDPOINT.replace(regex, (_, p1) => {
					return process.env[p1];
				});
			}
			if (appType === UserAccountEnum.INSTAGRAM) {
				redirectUri = process.env.INSTAGRAM_AUTH_ENDPOINT.replace(regex, (_, p1) => {
					if (p1 === "INSTAGRAM_REDIRECT_URL") return encodeURIComponent(process.env[p1]);
					return process.env[p1];
				});
			}
			return redirectUri;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async connectWithSpotify(user: IUser, connectSpotify: ConnectUserAccountDto) {
		try {
			const { id } = user;
			const { code, selectedAnthem } = connectSpotify;
			const getConnectedUser: any = await this.findConnectedUser(user, UserAccountEnum.SPOTIFY);
			const getUserTokens = code ? (await this.getUserAccessToken(code))?.data : null;
			const tokens = {
				access_token: getUserTokens?.access_token || getConnectedUser?.[0]?.tokens?.access_token,
				refresh_token: getUserTokens?.refresh_token || getConnectedUser?.[0]?.tokens?.refresh_token,
			};

			let findAlreadyExistUser: any = await this.userConnectedAccount.findOne({
				where: { type: UserAccountEnum.SPOTIFY, user: { id } },
			});
			if (findAlreadyExistUser) {
				findAlreadyExistUser = {
					...findAlreadyExistUser,
					...(tokens && { tokens }),
					...(tokens
						? {
								metadata: {
									date: findAlreadyExistUser.metadata.date || new Date(),
									selectedAnthem: selectedAnthem ? selectedAnthem : {},
								},
						  }
						: {}),
				};
				return await this.userConnectedAccount.save(findAlreadyExistUser);
			}
			const createUser = await this.userConnectedAccount.create({
				type: UserAccountEnum.SPOTIFY,
				tokens: tokens,
				metadata: {
					date: new Date(),
				},
				user: { id },
			});

			return await this.userConnectedAccount.save(createUser);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async findUserSpotifyArtist(user: IUser) {
		try {
			const { id } = user;

			const getConnectedUser = await this.userConnectedAccount.findOne({
				where: { type: UserAccountEnum.SPOTIFY, user: { id } },
			});
			if (!getConnectedUser) {
				throw Error("Please first connect your tinder account with spotify.");
			}
			const checkToken = await this.checkSpotifyToken(user, getConnectedUser);

			const artistResponse = await axios.get("https://api.spotify.com/v1/search", {
				headers: {
					Authorization: `Bearer ${getConnectedUser?.tokens?.access_token}`,
				},
				params: {
					q: "b",
					type: "artist",
					limit: 20,
				},
			});
			const artist = artistResponse?.data?.artists?.items;
			return await this.saveArtistsToSecondTable(artist, user);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async getUserAccessToken(code: string) {
		const getUserTokens: any = await axios.post(
			`https://accounts.spotify.com/api/token?grant_type=authorization_code&code=${code}&redirect_uri=${process.env.SPOTIFY_REDIRECT_URL}&client_id=${process.env.SPOTIFY_CLIENT_ID}&client_secret=${process.env.SPOTIFY_CLIENT_SECRET}`,
		);
		return getUserTokens ? getUserTokens : {};
	}

	async connectWithInstagram(user: IUser, connectInstagram: ConnectInstagramAccount) {
		try {
			const { id } = user;
			const { code } = connectInstagram;
			let token;

			if (code) {
				const accessToken = await this.getInstagramAccessToken(code);
				token = accessToken;
			}

			const getConnectedUser: any = await this.findConnectedUser(user, UserAccountEnum.INSTAGRAM);
			const getInstagramUserDetail = await this.getInstagramUserName(user, token);

			const tokens = {
				access_token: token?.access_token || getConnectedUser?.[0]?.tokens?.access_token,
			};

			let findAlreadyExistUser = await this.userConnectedAccount.findOne({
				where: { type: UserAccountEnum.INSTAGRAM, user: { id } },
			});

			if (findAlreadyExistUser) {
				findAlreadyExistUser = {
					...findAlreadyExistUser,
					...(tokens && { tokens }),
					...(token ? { metadata: { id: token?.user_id, username: getInstagramUserDetail } } : {}),
				};
				return await this.userConnectedAccount.save(findAlreadyExistUser);
			}

			const createUser = await this.userConnectedAccount.create({
				type: UserAccountEnum.INSTAGRAM,
				tokens: tokens,
				metadata: {
					id: token?.user_id,
					username: getInstagramUserDetail,
				},
				user: { id },
			});

			return await this.userConnectedAccount.save(createUser);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async getInstagramAccessToken(code: string) {
		try {
			const data = {
				client_id: process.env.INSTAGRAM_CLIENT_ID,
				client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
				grant_type: "authorization_code",
				redirect_uri: process.env.INSTAGRAM_REDIRECT_URL,
				code: code,
			};

			const response = await axios.post("https://api.instagram.com/oauth/access_token", data, {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			});

			return response?.data;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async getInstagramUserName(user: IUser, token: { user_id: string; access_token: string }) {
		try {
			const getUserOfInstagram = await axios.get(
				`https://graph.instagram.com/${token?.user_id}?fields=id,username&access_token=${token?.access_token}`,
			);
			return getUserOfInstagram?.data?.username;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async checkSpotifyToken(user: IUser, getConnectedUser: userConnectedAccountEntity) {
		const { id } = user;
		try {
			const getUser = await axios.get("https://api.spotify.com/v1/me", {
				headers: {
					Authorization: `Bearer ${getConnectedUser?.tokens?.access_token}`,
				},
			});
			if (getUser.status === 200) {
				return;
			}
		} catch (error) {
			const response = await axios.post("https://accounts.spotify.com/api/token", null, {
				params: {
					grant_type: "refresh_token",
					refresh_token: getConnectedUser?.tokens?.refresh_token,
					client_id: process.env.SPOTIFY_CLIENT_ID,
					client_secret: process.env.SPOTIFY_CLIENT_SECRET,
				},
			});

			const { access_token } = response.data;
			const tokens = { access_token: access_token, refresh_token: getConnectedUser?.tokens?.refresh_token };

			let findAlreadyExistUser = await this.userConnectedAccount.findOne({
				where: { type: UserAccountEnum.SPOTIFY, user: { id } },
			});

			if (findAlreadyExistUser) {
				findAlreadyExistUser = {
					...findAlreadyExistUser,
					...(tokens && { tokens }),
				};
				return await this.userConnectedAccount.save(findAlreadyExistUser);
			}
		}
	}

	async updateUserArtist(user: IUser, updateArtist: UpdateSpotifyArtist) {
		try {
			const { id, isSelected } = updateArtist;

			let updateUserArtist = await this.userSpotifyArtist.findOne({ where: { id: id } });
			if (updateUserArtist) {
				updateUserArtist = {
					...updateUserArtist,
					...(!isNullOrUndefined(isSelected) ? { isSelected: isSelected } : {}),
				};
				return await this.userSpotifyArtist.save(updateUserArtist);
			}
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async refreshSpotifyArtist(user: IUser) {
		try {
			const { id } = user;
			let getConnectedUser = await this.userConnectedAccount.findOne({
				where: { type: UserAccountEnum.SPOTIFY, user: { id } },
			});

			if (!getConnectedUser) {
				throw Error("Please first connect your tinder account with spotify.");
			}

			const checkToken = await this.checkSpotifyToken(user, getConnectedUser);
			await this.connectWithSpotify(user, "" as any);
			const artistResponse = await axios.get("https://api.spotify.com/v1/search", {
				headers: {
					Authorization: `Bearer ${getConnectedUser?.tokens?.access_token}`,
				},
				params: {
					q: "ar	",
					type: "artist",
					limit: 20,
				},
			});
			const artist = artistResponse?.data?.artists?.items;
			return await this.saveArtistsToSecondTable(artist, user);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async fetchSpotifyAnthem(user: IUser, search: string) {
		try {
			const { id } = user;

			const getConnectedUser = await this.userConnectedAccount.findOne({
				where: { type: UserAccountEnum.SPOTIFY, user: { id } },
			});

			if (!getConnectedUser) {
				throw Error("Please first connect your tinder account with Spotify.");
			}
			const endpoint = search
				? `https://api.spotify.com/v1/search`
				: `https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF`;

			const params = {
				headers: {
					Authorization: `Bearer ${getConnectedUser?.tokens?.access_token}`,
				},
				params: {
					type: search ? "track" : undefined,
					q: search || undefined,
					limit: 20,
				},
			};

			const artistResponse = await axios.get(endpoint, params);

			const items = artistResponse.data?.tracks?.items;
			return items
				?.filter((_, index: number) => index < 20)
				?.map((item: any) => {
					const artist = search ? item?.album?.artists : item?.track?.album?.artists;
					const images = search ? item?.album?.images : item?.track?.album?.images;
					const name = search ? item?.album?.name : item?.track?.album?.name;
					const previewUrl = search ? item?.preview_url : item?.track?.preview_url;
					return { artist, images, name, previewUrl };
				});
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async selectSpotifyAnthem(user: IUser, type, connectSpotify: ConnectUserAccountDto) {
		try {
			if (type === AnthemEnum.SELECT) {
				return await this.connectWithSpotify(user, connectSpotify);
			}
			if (type === AnthemEnum.UNSELECT) {
				return await this.connectWithSpotify(user, connectSpotify);
			}
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async disconnectUserSocialMediaAccount(user: IUser, appType: UserAccountEnum) {
		try {
			const { id } = user;
			if (id) {
				await Promise.all([
					this.userConnectedAccount
						.createQueryBuilder()
						.delete()
						.where("user = :id AND type = :appType", { id, appType })
						.execute(),
					this.userSpotifyArtist.createQueryBuilder().delete().where("user = :id", { id }).execute(),
				]);
			}
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async saveArtistsToSecondTable(artists: any[], user: IUser) {
		const { id }: any = user;

		if (artists.length === 0) {
			return;
		}

		const existingArtists = await this.userSpotifyArtist.find({ where: { user: { id } } });

		const existingArtistNames = new Set(existingArtists.map((artist) => artist.artist));

		const artistsToUpdate = artists.filter((artist) => existingArtistNames.has(artist.name));
		const artistsToAdd = artists.filter((artist) => !existingArtistNames.has(artist.name));
		for (const artist of artistsToAdd) {
			const newArtistEntry: any = new userSpotifyAccountArtistEntity();
			newArtistEntry.artist = artist.name;
			newArtistEntry.image = artist?.images?.[0] ? artist?.images?.[0]?.url : "";
			newArtistEntry.user = id;
			newArtistEntry.isSelected = true;

			await this.userSpotifyArtist.save(newArtistEntry);
		}

		const artistNamesToRemove = existingArtists
			.filter((artist) => !artistsToUpdate.find((a) => a.name === artist.artist))
			.map((artist) => artist.artist);

		if (artistNamesToRemove?.length > 0) {
			await this.userSpotifyArtist
				.createQueryBuilder()
				.delete()
				.where("user = :id", { id })
				.andWhere("artist IN (:...artistNames)", { artistNames: artistNamesToRemove })
				.execute();
		}

		const availableArtist = await this.userSpotifyArtist.find({ where: { user: { id } } });
		return availableArtist;
	}
}
