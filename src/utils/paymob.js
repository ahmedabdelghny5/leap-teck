export const mobileWallets = async (token, phone) => {
    const formData = {

        source: {
            identifier: phone,
            subtype: "WALLET"
        },
        payment_token: token
    }
    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    };
    let result1;
    await fetch("https://accept.paymob.com/api/acceptance/payments/pay", requestOptions).
        then(async (result) => {
            result1 = await result.json()
        }).catch(error => console.log('error', error));

    return result1;
}


export const authenticationRequest = async () => {
    const formData = {
        api_key: process.env.apiKey
    }
    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    };
    let result1;
    await fetch("https://accept.paymob.com/api/auth/tokens", requestOptions).
        then(async (result) => {
            result1 = await result.json()
        }).catch(error => console.log('error', error));

    return result1.token;

}

export const orderRegistration = async (user, auth_token, totalPrice, items) => {

    const formData = {
        auth_token,
        delivery_needed: true,
        amount_cents: totalPrice * 100,
        currency: "EGP",
        items: items
    }
    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    };
    let result1;
    await fetch("https://accept.paymob.com/api/ecommerce/orders", requestOptions).
        then(async (result) => {
            result1 = await result.json()
        }).catch(error => console.log('error', { error }));

    return result1.id;
    
}

export const paymentKey = async (body, user, auth_token, totalPrice, orderId) => {
    const formData =
    {
        auth_token,
        amount_cents: totalPrice * 100,
        expiration: 1800,
        order_id: orderId,
        billing_data: {
            email: user.email,
            first_name: user.name,
            phone_number: user.phone,
            last_name: user.name,
            street: body.street,
            building: body.building,
            floor: body.floor,
            apartment: body.apartment,
            city: body.city,
            country: body.country
        },
        currency: "EGP",
        integration_id: 3995255,
    }

    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    };
    let result1;
    await fetch("https://accept.paymob.com/api/acceptance/payment_keys", requestOptions).
        then(async (result) => {
            result1 = await result.json()
        }).catch(error => console.log('error', error));
    console.log({ result1 });
    return result1.token;
}


export const getOrderDetails = async (auth_token, orderId) => {

    const requestOptions = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth_token}`
        }
    };
    let result1;
    await fetch(`https://accept.paymob.com/api/acceptance/transactions/${orderId}`, requestOptions).
        then(async (result) => {
            result1 = await result.json()
        }).catch(error => console.log('error', error));
    return result1;
}