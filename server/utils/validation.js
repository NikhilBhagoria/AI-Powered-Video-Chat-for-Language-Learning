const Joi = require('joi');

const validateRegistration = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(6)
      .required(),
    nativeLanguage: Joi.string()
      .valid('English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi')
      .required(),
    learningLanguages: Joi.array()
      .items(Joi.string().valid('English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi'))
      .min(1)
      .required()
  });

  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .required()
  });

  return schema.validate(data);
};

module.exports = {
  validateRegistration,
  validateLogin
};