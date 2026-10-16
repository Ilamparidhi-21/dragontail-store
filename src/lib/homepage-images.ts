export const HOME_IMAGE_KEYS=['hero','women','men','accessories','story'] as const;
export type HomeImageKey=typeof HOME_IMAGE_KEYS[number];
export type HomeImages=Record<HomeImageKey,string>;
export const DEFAULT_HOME_IMAGES:HomeImages={hero:'/images/dragontail-maroon-hero.png',women:'/images/dragontail-maroon-hero.png',men:'/images/dragontail-men-waffle.png',accessories:'/images/dragontail-scarf.png',story:'/images/dragontail-woman-scarf.png'};
export function cleanHomeImages(raw:unknown):HomeImages|null{if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;const r=raw as Record<string,unknown>;const out={...DEFAULT_HOME_IMAGES};for(const key of HOME_IMAGE_KEYS){const value=r[key];if(typeof value!=='string'||value.length>1500||!value.trim())return null;const url=value.trim();try{if(url.startsWith('/images/')){if(!/^\/images\/[a-zA-Z0-9_./-]+$/.test(url)||url.includes('..'))return null;}else if(new URL(url).protocol!=='https:')return null;}catch{return null;}out[key]=url;}return out;}
export function resolveHomeImages(raw:unknown):HomeImages{return cleanHomeImages(raw)||{...DEFAULT_HOME_IMAGES};}
