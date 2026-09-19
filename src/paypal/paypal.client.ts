import * as checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export const paypalEnvironment = () => {
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

    const mode = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase();

    if (mode === 'live') {
        return new checkoutNodeJssdk.core.LiveEnvironment(
            clientId,
            clientSecret,
        );
    }

    return new checkoutNodeJssdk.core.SandboxEnvironment(
        clientId,
        clientSecret,
    );
};

export const paypalClient = () => {
    return new checkoutNodeJssdk.core.PayPalHttpClient(
        paypalEnvironment(),
    );
};