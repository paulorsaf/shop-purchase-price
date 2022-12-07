import { Product } from "../../types/product-type"
import { ZipCodes } from "../../types/zipcodes.type"

export type PurchasePriceDTO = {
    addresses: ZipCodes;
    innerCityDeliveryPrice: number;
    originCityName: string;
    discount: number;
    paymentFee: PaymentFee;
    products: Product[];
}

export type PaymentFee = {
    percentage: number;
    value: number;
}

export type PurchasePriceResponse = {
    productsPrice: number;
    deliveryPrice: number;
    discount: number;
    paymentFee: number;
    totalPrice: number;
    totalWithPaymentFee: number;
}