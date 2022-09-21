const Joi = require('joi')
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

const registrationValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        name: Joi.string().required(),
        password: joiPassword.string().minOfSpecialCharacters(1).minOfUppercase(1).minOfNumeric(1).required(),
        confirmPassword: Joi.string().required().equal(Joi.ref('password')).messages({ 'any.only': 'Password mismatch' })
    })
    return schema.validate(data)
}

module.exports = { registrationValidation }