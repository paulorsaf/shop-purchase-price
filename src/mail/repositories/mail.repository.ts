import { calcularPrecoPrazo, PrecoPrazoResponse } from "correios-brasil/dist";
import { consultarCep } from "correios-brasil/dist";
import { ProductAmountWeight } from "../../types/product-type";
import { Address } from "../types/address.type";
import { FindDeliveryPrice } from "../types/find-delivery-price.types";
import { MailInterfaceRepository } from "./mail.repository.interface";

export class MailRepository implements MailInterfaceRepository {
    
    async findByZipCode(zipCode: string): Promise<Address> {
        return consultarCep(zipCode.replace(/[^\d]/g, '')).then((response: any) => {
            return {
                city: response.data.localidade,
                complement: response.data.complemento,
                neighborhood: response.data.bairro,
                state: response.data.uf,
                street: response.data.logradouro,
                zipCode: response.data.cep
            }
        });
    }

    async findDeliveryPrice(params: FindDeliveryPrice): Promise<number> {
        const totalWeight = this.getProductsTotalWeight(params.products);

        const args = {
            sCepOrigem: params.zipCodes.origin.replace(/[^\d]/g, ''),
            sCepDestino: params.zipCodes.destination.replace(/[^\d]/g, ''),
            nVlPeso: totalWeight.toFixed(2),
            nCdFormato: '1',
            nVlComprimento: '20',
            nVlAltura: '20',
            nVlLargura: '20',
            nCdServico: ['04014'],
            nVlDiametro: '0',
        };
          
        return calcularPrecoPrazo(args).then((response: PrecoPrazoResponse) => {
            return parseFloat(response[0].Valor.replace(',', '.'));
        });
    }

    private getProductsTotalWeight(products: ProductAmountWeight[]) {
        if (!products?.length) {
            return 1;
        }

        let total = 0;
        products.filter(p => p.amount && p.weight).forEach(p => {
            total += (p.amount * p.weight)
        });
        return total || 1;
    }

}