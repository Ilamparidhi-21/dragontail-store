export const PRODUCT_TYPES=['Shirts','T-shirts','Sweatshirts','Trousers'] as const;
export type ClothingType=typeof PRODUCT_TYPES[number];
export function normaliseClothingType(value:unknown):ClothingType|''{
 if(typeof value!=='string')return '';
 const key=value.trim().toLowerCase().replace(/[\s_-]/g,'');
 if(key==='shirt'||key==='shirts')return 'Shirts';
 if(key==='tshirt'||key==='tshirts')return 'T-shirts';
 if(key==='sweatshirt'||key==='sweatshirts')return 'Sweatshirts';
 if(key==='trouser'||key==='trousers')return 'Trousers';
 return '';
}
export function validProductType(category:string,value:unknown):string|null{
 if(category==='Accessories')return typeof value==='string'?value.trim().slice(0,80):'';
 return normaliseClothingType(value)||null;
}
export function matchesProductType(product:{category:string;type:string},filter:string){return filter==='All'||product.category!=='Accessories'&&normaliseClothingType(product.type)===filter;}
