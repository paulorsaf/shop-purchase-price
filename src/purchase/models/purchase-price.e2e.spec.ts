import { PurchasePriceDTO } from "../types/purchase-price.types";
import { PurchasePrice } from "./purchase-price";

describe('Purchase price e2e', () => {

    let dto: PurchasePriceDTO;
    let purchasePrice: PurchasePrice;

    beforeEach(() => {
        dto = {
            addresses: {
                origin: '60.821-700',
                destination: '60510-290'
            },
            discount: 10,
            hasDeliveryByMail: true,
            innerCityDeliveryPrice: 10,
            originCityName: 'Fortaleza',
            paymentFee: {
                percentage: 3,
                value: 2.5
            },
            products: [{
                amount: 1,
                price: 60,
                weight: 1
            }, {
                amount: 2,
                price: 20,
                weight: 0.5
            }],
            serviceFee: 10
        }
    })

    it('given no products, then prices should be zero', async () => {
        dto.products = [];

        purchasePrice = new PurchasePrice(dto);

        const response = await purchasePrice.calculatePrice();

        expect(response).toEqual({
            productsPrice: 0,
            deliveryPrice: 0,
            discount: 0,
            paymentFee: 0,
            serviceFee: 0,
            totalPrice: 0,
            totalWithPaymentFee: 0
        });
    })

    it('given delivery inside of the same city, then prices with inner city delivery', async () => {
        purchasePrice = new PurchasePrice(dto);

        const response = await purchasePrice.calculatePrice();

        expect(response).toEqual({
            productsPrice: 100,
            deliveryPrice: 10,
            discount: 11,
            paymentFee: 5.8,
            serviceFee: 10,
            totalPrice: 109,
            totalWithPaymentFee: 114.8
        });
    })

    it('given delivery outside of the city, then prices with delivery price', async () => {
        dto.addresses.destination = "02860-001";
        purchasePrice = new PurchasePrice(dto);

        const response = await purchasePrice.calculatePrice();

        expect(response).toEqual({
            productsPrice: 100,
            deliveryPrice: 96,
            discount: 19.6,
            paymentFee: 8.38,
            serviceFee: 10,
            totalPrice: 186.4,
            totalWithPaymentFee: 194.78
        });
    })

})