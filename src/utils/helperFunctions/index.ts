import axios from "axios";
import * as sharp from "sharp";

export const isNullOrUndefined = (value) => {
	return value === null || typeof value === "undefined";
};

export const getFullAddressFromLocation = async (APIkey: string, lat: string, long: string) => {
	return await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${APIkey}`);
};

export const addMinuteInDate = (date, minuteToAdd) => {
	return new Date(date.getTime() + minuteToAdd * 60000);
};

export const getAgeBasedOnDate = (date) => {
	const ageInMs = Date.now() - date.getTime();
	const ageInYears = new Date(ageInMs).getFullYear() - 1970;
	return ageInYears;
};

export const blurImageFromUrl = async (url: string, blurAmount: number): Promise<string> => {
	const imageBuffer = await axios.get(url, { responseType: "arraybuffer" });

	const sharpImage = sharp(imageBuffer.data);
	const metadata = await sharpImage.metadata();
	const blurredImage = await sharpImage
		.resize(Math.round(metadata.width / 10))
		.blur(blurAmount)
		.toBuffer();

	const base64Image = blurredImage.toString("base64");
	const mimeType = metadata.format === "png" ? "image/png" : "image/jpeg";
	return `data:${mimeType};base64,${base64Image}`;
};
