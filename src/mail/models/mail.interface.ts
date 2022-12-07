export interface MailInterface {

    findDeliveryPrice(params: MailDelivery): Promise<number>;

}

export type MailDelivery = {
    originCityName: string;
    innerCityDeliveryPrice: number;
    products: ProductMail[];
    zipCodes: ZipCodes;
}

type ProductMail = {
    amount: number;
    weight: number;
}

type ZipCodes = {
    destination: string;
    origin: string;
}