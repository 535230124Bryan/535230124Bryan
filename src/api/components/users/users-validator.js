const { param } = require('express/lib/router');
const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createUser: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('Password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },

  updateUser: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
    },
  },

  changePassword: {
    body: {
      password_old: joi.string().required().label('Old password'),
      password_new: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('New password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },

  buatAkunBCA: {
    body: {
      pemilik: joi.string().min(1).max(100).required().label('pemilik'),
      kode_akses: joi
        .string()
        .min(6)
        .pattern(new RegExp(/[a-zA-Z]*[0-9]+[a-zA-Z]*/))
        .required()
        .label('kode_akses'),
      PIN: joi
        .string()
        .pattern(/^[0-9]{6}$/)
        .required()
        .label('PIN'),
    },
  },

  getRekValidator: {
    id: joi.string().min(0).required().label('ID'),
  },

  updatePIN: {
    body: {
      inputPIN: joi
        .number()
        .min(6)
        .required()
        .label('inputPIN'),
      PIN_sekarang: joi
        .number()
        .min(6)
        .required()
        .label('PIN_sekarang'),
      PIN_Baru: joi
        .number()
        .min(6)
        .required()
        .label('PIN_Baru'), 
    },
  },

  deleteBCA: {
    params: {
      id: joi.string().hex().length(24).required().label('ID'),
    },
  },
};
