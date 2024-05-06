const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const pageNum = parseInt(request.query.pageNum) || 1;
    const pageSize = parseInt(request.query.pageSize) || 10;
    const lookingFor = request.query.lookingFor || 'email:asc';
    const urutan = request.query.urutan || '';

    const [variable, order] = lookingFor.split(':');
    const users = await usersService.getUsers(
      pageNum,
      pageSize,
      variable,
      order,
      urutan
    );

    const count = await usersService.hitungan();
    const pageTotal = Math.ceil(count / pageSize);
    const hasPreviousPage = pageNum > 1;
    const hasNextPage = pageNum < pageTotal;

    const dataPengguna = {
      pageNum,
      pageSize,
      count: users.length,
      pageTotal,
      hasPreviousPage,
      hasNextPage,
      data: users,
    };
    return response.status(200).json(dataPengguna);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */

let gagalLogin = {};
let kesempatanTerakhir = {};
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    if (password !== password_confirm) {
      if (!gagalLogin[email]) {
        gagalLogin[email] = 1;
      } else {
        gagalLogin[email]++;
      }

      if (gagalLogin[email] > 5) {
        const sekarang = new Date();

        if (
          kesempatanTerakhir[email] &&
          sekarang - kesempatanTerakhir[email] < 30 * 60 * 1000
        ) {
          return response.status(403).json({
            error: {
              code: 403,
              message: 'Too many login attempt failed',
            },
          });
        } else {
          gagalLogin[email] = new Date();
        }
      }

      kesempatanTerakhir[email] = new Date();

      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'konfirmasi password gagal'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response
      .status(200)
      .json({ name, email, password, message: 'login berhasil' });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */

async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }
    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}

async function bikinAkunBCA(request, response, next) {
  try {
    const pemilik = request.body.pemilik;
    const kode_akses = request.body.kode_akses;
    const PIN = request.body.PIN;

    return response.status(200).json({
      pemilik,
      kode_akses,
      PIN,
    });
  } catch (error) {
    return next(error);
  }
}

async function getRekeningAkun(request, response, next) {
  try {
    const id = request.params.id;

    const rekeningData = await usersService.getRekeningService(id);

    if (!rekeningData) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Gagal mendapatkan akun ID'
      );
    }

    return response.status(200).json(id);
  } catch (error) {
    next(error);
  }
}

async function updatePINBCA(request, response, next) {
  try {
    const id = request.params.id;
    const inputPIN = request.body.inputPIN;
    const PIN_sekarang = request.body.PIN_sekarang;
    const PIN_Baru = request.body.PIN_Baru;

    if (inputPIN !== PIN_sekarang) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'PIN sekarang tidak cocok'
      );
    }

    return response.status(200).json({
      PIN_Baru,
      message: 'PIN BCA berhasil digantikan oleh pihak BCA'
    });
  } catch (error) {
    next(error);
  }
}


async function deleteAkunBCA(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.hapusAkunService(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Gagal menghapus akun BCA'
      );
    }

    return response.status(200).json({ message: 'Akun BCA berhasil dihapus' });
  } catch (error) {
    return next(error);
  }
}


module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  bikinAkunBCA,
  getRekeningAkun,
  updatePINBCA,
  deleteAkunBCA,
};
