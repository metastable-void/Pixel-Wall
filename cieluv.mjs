/* -*- tab-width: 4; indent-tabs-mode: t -*- */


const srgb_reverse_gamma = u =>
	u <= 0.04045
		? u / 12.92
		: Math.pow ((u + 0.055) / 1.055, 2.4);

const srgb_gamma = u =>
	u <= 0.0031308
		? u * 12.92
		: 1.055 * Math.pow (u, 1 / 2.4) - 0.055

// r, g, b is [0, 1]
const srgb_to_xyz = (r, g, b) => {
	[r, g, b] = [r, g, b].map (srgb_reverse_gamma);
	const x = 0.4124 * r + 0.3576 * g + 0.1805 * b;
	const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	const z = 0.0193 * r + 0.1192 * g + 0.9505 * b;
	return [x, y, z];
}

// D65 is 0.9505, 1.0000, 1.0890
const xyz_to_srgb = (x, y, z) => {
	const r = 3.2406 * x - 1.5372 * y - 0.4986 * z;
	const g = -0.9689 * x + 1.8758 * y + 0.0415 * z;
	const b = 0.0557 * x - 0.2040 * y + 1.0570 * z;
	return [r, g, b].map (srgb_gamma);
};

const xyz_to_u = (x, y, z) => 4 * x / (x + 15 * y + 3 * z);
const xyz_to_v = (x, y, z) => 9 * y / (x + 15 * y + 3 * z);
const d65_xyz = [0.9504285453771807, 1.0, 1.088869977508966];

const xyz_to_luv = (x, y, z) => {
	const l = y <= 0.008856451679035631
		? 903.2962962962963 * y
		: 116 * Math.pow (y, 1 / 3) - 16;
	
	const u = 13 * l * (xyz_to_u (x, y, z) - 0.19782944951777845);
	const v = 13 * l * (xyz_to_v (x, y, z) - 0.4683321682413859);
	return [l, isNaN (u) ? 0: u, isNaN (v) ? 0 : v];
};

const luv_to_xyz = (l, u, v) => {
	u = u / 13 / l + 0.19782944951777845;
	v = v / 13 / l + 0.4683321682413859;
	const y = l <= 8
		? 0.0011070564598794539 * l
		: Math.pow ((l + 16) / 116, 3);
	
	const x = y * 9 * u / 4 / v;
	const z = y * (12 - 3 * u - 20 * v) / 4 / v;
	return [x, y, z];
};

export const srgb_to_luv = (r, g, b) => xyz_to_luv (... srgb_to_xyz (r, g, b));
export const luv_to_srgb = (l, u, v) => xyz_to_srgb (... luv_to_xyz (l, u, v));

