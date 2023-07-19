const request = require("request");
const moment = require('moment');

const template_id_list = {
    welcome:            'd-77ec5b6f99eb49d38ea93978eda2db44',
    receipt:            'd-2e46508d7bbb4df0b4c8863ebfd5465d',
    password_reset:     'd-8947b6812b1b424a98fe62c67fe2178a',
    email_verification: 'd-2bdf07a55afd4b9e9ea665b763147e40',
    withdraw:           'd-24d9431cb36247aaa7da19d1efa981ae',
    withdraw_to_admin:  'd-8280dd1a33a44e18b44b34dce8bb9f5c',
    receipt_to_admin:   'd-87e9be9e30ae4c0c89b2b06753be7921',
};

const sendEmail = (to, content, subject, template_id) => {
    const options = { 
        method: 'POST',
        url: process.env.SENDGRID_API_URL,
        headers: { 
            'content-type': 'application/json',
            authorization: 'Bearer ' + process.env.SENDGRID_API_KEY
        },
        body: {
            personalizations: [{ 
                to: to,
                dynamic_template_data: content,
                subject: subject
            }],
            from: { email: 'support@rpsbet.io', name: 'Rpsbet' },
            reply_to: { email: 'support@rpsbet.io', name: 'Rpsbet' },
            template_id: template_id
        },
        json: true 
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log("SendGrid: ", error, body);
    });
}

module.exports.sendWelcomeEmail = (email, name, verification_code) => {
    sendEmail(
        [
            {email, name},
        ],
        {
            name,
            username: name,
            verification_code,
            action_url: 'https://rpsbet.com'
        }, 
        'Welcome to RPSBET', 
        template_id_list.welcome
    );
};

module.exports.sendResetPasswordEmail = (email, name, changePasswordId) => {
    sendEmail(
        [
            {email, name},
        ],
        {
            name,
            username: name, 
            action_url: 'https://rpsbet.com/changePassword/' + changePasswordId
        }, 
        'Reset Password',
        template_id_list.password_reset
    );
};

module.exports.sendWithdrawEmail = (email, name, receipt_id, amount) => {
    const dateString = moment(new Date()).format('DD/MM/YYYY');

    sendEmail(
        [
            {email, name},
            {email: "payments@rpsbet.com", name: "rpsbet"}
        ], 
        { 
            name,
            receipt_id: receipt_id,
            date: dateString,
            receipt_details : [
                {"amount": "RPS " + amount},
            ],
            total: "RPS " + amount,
            action_url: 'https://rpsbet.com'
        },
        'Withdraw', 
        template_id_list.withdraw
    );
};

module.exports.sendReceiptEmail = (email, name, receipt_id, amount) => {
    const dateString = moment(new Date()).format('DD/MM/YYYY');

    sendEmail(
        [
            {email, name},
            {email: "payments@rpsbet.com", name: "rpsbet"},
        ], 
        { 
            name,
            receipt_id: receipt_id,
            date: dateString,
            receipt_details : [
                {"amount": "RPS " + amount},
            ],
            total: "RPS " + amount,
            action_url: 'https://rpsbet.com'
        },
        'Receipt', 
        template_id_list.receipt
    );
};

module.exports.sendWithdrawToAdminEmail = (email, username, amount, payment_method, paypal_email, bank_payee_name, bank_account_number, short_code) => {
    sendEmail(
        [
            {email: 'payments@rpsbet.com', name: 'Rpsbet'},
        ],
        {
            email,
            username,
            amount,
            is_paypal: payment_method == 'PayPal',
            paypal_email,
            bank_payee_name,
            bank_account_number,
            short_code,
            action_url: 'https://rpsbet.com'
        }, 
        'New Withdrawal Request From [' + username + ']', 
        template_id_list.withdraw_to_admin
    );
};

module.exports.sendDepositToAdminEmail = (email, username, amount, payment_method) => {
    sendEmail(
        [
            {email: 'payments@rpsbet.com', name: 'Rpsbet'},
        ],
        {
            email,
            username,
            amount,
            is_paypal: payment_method == 'PayPal',
            action_url: 'https://rpsbet.com'
        }, 
        'New Deposit From [' + username + ']', 
        template_id_list.receipt_to_admin
    );
};

