import { ProductAmountWeight } from "../../types/product-type";
import { ZipCodes } from "../../types/zipcodes.type";

export type FindDeliveryPrice = {
    products: ProductAmountWeight[];
    zipCodes: ZipCodes;
}