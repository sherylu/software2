module.exports.email = {
    service: 'Mailgun',
    auth: {
        user: 'postmaster@sandbox3b99ea7ab68d41ac82db6a7dc7787eeb.mailgun.org',
        pass: 'e865aefe845aee0f0b123ae1935de2f0'
    },
    templateDir: 'api/emailTemplates',
    from: 'infoFlight@SoftwareII.com',
    testMode: false,
    ssl: true
};