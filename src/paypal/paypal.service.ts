import { Injectable } from '@nestjs/common';
import * as checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { paypalClient } from './paypal.client';
import { PaypalApprovalResponse } from './interfaces/paypal.interface';

@Injectable()
export class PaypalService {
    private readonly client = paypalClient();

    async createOrder(
        amount: number,
        transactionId: number,
    ): Promise<PaypalApprovalResponse> {
        const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();

        request.prefer('return=representation');

        request.requestBody({
            intent: 'CAPTURE',

            purchase_units: [
                {
                    reference_id: transactionId.toString(),

                    amount: {
                        currency_code: 'USD',
                        value: amount.toFixed(2),
                    },
                },
            ],

            application_context: {
                return_url: `${process.env.PAYPAL_RETURN_URL}?transactionId=${transactionId}`,

                cancel_url: `${process.env.PAYPAL_CANCEL_URL}?transactionId=${transactionId}`,

                landing_page: 'LOGIN',

                user_action: 'PAY_NOW',

                shipping_preference: 'NO_SHIPPING',

                brand_name: 'Backbone Data Solutions',
            },
        });

        const response = await this.client.execute(request);

        const approve = response.result.links?.find(
            (link) => link.rel === 'approve',
        );

        return {
            paymentId: response.result.id,
            approvalUrl: approve?.href ?? '',
        };
    }

    async captureOrder(orderId: string) {
        const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);

        request.requestBody({});

        const response = await this.client.execute(request);

        return response.result;
    }

    async getOrder(orderId: string) {
        const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId);

        const response = await this.client.execute(request);

        return response.result;
    }
}