import { Mail } from "./mail";

describe('Purchase price e2e', () => {

    let mail: Mail;

    beforeEach(() => {
        mail = new Mail();
    })

    it('given origin and destination cities are the same, then return inner city delivery price', async () => {
        const response = await mail.findDeliveryPrice({
            innerCityDeliveryPrice: 10,
            originCityName: "Fortaleza",
            products: [
                { amount: 1, weight: 1 },
                { amount: 2, weight: 0.5 }
            ],
            zipCodes: {
                destination: "60.821-700",
                origin: "60.312-060"
            }
        });

        expect(response).toEqual(10);
    })

    it('given origin and destination cities are different, then return mail delivery price', async () => {
        const response = await mail.findDeliveryPrice({
            innerCityDeliveryPrice: 10,
            originCityName: "Fortaleza",
            products: [
                { amount: 1, weight: 1 },
                { amount: 2, weight: 0.5 }
            ],
            zipCodes: {
                destination: "02860-001",
                origin: "60.312-060"
            }
        });

        expect(response).toEqual(96);
    })

})