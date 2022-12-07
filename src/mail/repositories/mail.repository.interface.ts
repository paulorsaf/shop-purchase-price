import { Address } from "../types/address.type";
import { FindDeliveryPrice } from "../types/find-delivery-price.types";

export interface MailInterfaceRepository {
    
    findByZipCode(zipCode: string): Promise<Address>;
    findDeliveryPrice(params: FindDeliveryPrice): Promise<number>;

}