/* spellchecker: disable */

export const LookingFor = [
	"Long-term partner",
	"Long-term, open to short",
	"Short-term, open to long",
	"Short-term fun",
	"New friends",
	"Still figuring it out",
];

export enum LookingForEnum {
	LONGTERMPARTNER = "Long-term partner",
	LONGTERMOPENTOSHORT = "Long-term, open to short",
	SHORTTERMOPENTOLONG = "Short-term, open to long",
	SHORTTERMFUN = "Short-term fun",
	NEWFRIENDS = "New friends",
	STILLFIGURINGITOUT = "Still figuring it out",
}

export interface LookingForType {
	for: LookingForEnum,
	image: string
}

export const LookingForData: LookingForType[] = [{
	for: LookingForEnum['LONGTERMPARTNER'],
	image: "cupid.png"
}, {
	for: LookingForEnum['LONGTERMOPENTOSHORT'],
	image: "hearteyes.png"
}, {
	for: LookingForEnum['SHORTTERMOPENTOLONG'],
	image: "clinkingglasses.png"
}, {
	for: LookingForEnum['SHORTTERMFUN'],
	image: "tada.png"
}, {
	for: LookingForEnum['NEWFRIENDS'],
	image: "wave.png"
}, {
	for: LookingForEnum['STILLFIGURINGITOUT'],
	image: "thinkingface.png"
}]
