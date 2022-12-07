import { PurchasePriceDTO } from "../types/purchase-price.types";
import { Mail } from "../../mail/models/mail";
import { MailInterface } from "../../mail/models/mail.interface";
import { PurchasePriceResponse } from '../types/purchase-price.types'

export class PurchasePrice {

    constructor(
        private readonly dto: PurchasePriceDTO,
        private readonly mail?: MailInterface
    ){
        this.mail = mail || new Mail();
    }

    async calculatePrice(): Promise<PurchasePriceResponse> {
        if (!this.dto.products?.length) {
            return this.createEmptyPurchasePriceResponse();
        }

        const productsPrice = this.calculateProductsPrice();
        const deliveryPrice = await this.calculateDeliveryPrice();
        const {totalPrice, discount} =
            this.calculateTotalPriceAndDiscount({productsPrice, deliveryPrice});
        const paymentFee = this.calculatePaymentFee({productsPrice, deliveryPrice});
        
        return {
            productsPrice,
            deliveryPrice,
            discount,
            paymentFee,
            totalPrice,
            totalWithPaymentFee: totalPrice + paymentFee
        };
    }

    private calculateTotalPriceAndDiscount(
        {productsPrice, deliveryPrice}: ProductAndDeliveryPrice
    ): TotalPriceAndDiscount {
        let totalPrice = productsPrice + deliveryPrice;
        let discount = 0;
        if (this.dto.discount) {
            discount = (totalPrice) * (this.dto.discount/100);
            totalPrice = totalPrice - discount;
        }
        return {totalPrice, discount};
    }
    
    private calculatePaymentFee({productsPrice, deliveryPrice}: ProductAndDeliveryPrice) {
        let paymentFee = 0;
        const fee = this.dto.paymentFee;
        if (fee) {
            let totalPrice = productsPrice + deliveryPrice;
            paymentFee = (totalPrice * (fee.percentage / 100)) + fee.value;
        }
        return parseFloat(paymentFee.toFixed(2));
    }

    private async calculateDeliveryPrice() {
        let deliveryPrice = 0;
        if (this.dto.addresses?.destination) {
            deliveryPrice = await this.mail!.findDeliveryPrice({
                innerCityDeliveryPrice: this.dto.innerCityDeliveryPrice,
                originCityName: this.dto.originCityName,
                products: this.dto.products.map(p => ({
                    amount: p.amount,
                    weight: p.weight
                })),
                zipCodes: this.dto.addresses
            });
        }
        return deliveryPrice;
    }

    private calculateProductsPrice() {
        return this.dto.products.reduce((previous, current) =>
            previous + ((current.priceWithDiscount || current.price) * current.amount), 0
        )
    }

    private createEmptyPurchasePriceResponse(): PurchasePriceResponse {
        return {
            productsPrice: 0,
            deliveryPrice: 0,
            discount: 0,
            paymentFee: 0,
            totalPrice: 0,
            totalWithPaymentFee: 0
        };
    }

}

type ProductAndDeliveryPrice = {
    productsPrice: number;
    deliveryPrice: number;
}

type TotalPriceAndDiscount = {
    discount: number;
    totalPrice: number;
}