import { calcularPrecoPrazo, CepResponse, PrecoPrazoResponse } from "correios-brasil/dist";
import { consultarCep } from "correios-brasil/dist";
import { ProductAmountWeight } from "../../types/product-type";
import { Address } from "../types/address.type";
import { FindDeliveryPrice } from "../types/find-delivery-price.types";
import { MailInterfaceRepository } from "./mail.repository.interface";

export class MailRepository implements MailInterfaceRepository {
    
    async findByZipCode(zipCode: string): Promise<Address> {
        return consultarCep(zipCode.replace(/[^\d]/g, '')).then((response: CepResponse) => {
            return {
                city: response.localidade,
                complement: response.complemento,
                neighborhood: response.bairro,
                state: response.uf,
                street: response.logradouro,
                zipCode: response.cep
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
          
        return calcularPrecoPrazo(args).then((response: PrecoPrazoResponse[]) => {
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