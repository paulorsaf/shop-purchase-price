import { MailRepository } from "../repositories/mail.repository";
import { MailInterfaceRepository } from "../repositories/mail.repository.interface";
import { MailDelivery, MailInterface } from "./mail.interface";

export class Mail implements MailInterface {

    constructor(
        private readonly mailRepository?: MailInterfaceRepository
    ) {
        this.mailRepository = mailRepository || new MailRepository();
    }

    async findDeliveryPrice(params: MailDelivery): Promise<number> {
        const destination = await this.mailRepository.findByZipCode(params.zipCodes.destination);
        if (destination.city === params.originCityName) {
            return params.innerCityDeliveryPrice || 0;
        }
        return await this.mailRepository.findDeliveryPrice({
            products: params.products,
            zipCodes: params.zipCodes
        });
    }

}