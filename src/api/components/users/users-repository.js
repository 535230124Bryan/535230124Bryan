const { User, Rekeningschema } = require('../../../models');
const { getRekeningBCA } = require('./users-controller');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

async function getRekening(id, rekeningID) {
  try {
    const id = request.params.id
    const rekeningID = await Rekeningschema.findById({ id });
    return rekeningID;
  } catch (error) {
    throw new Error('Gagal mendapatkan akun BCA');
  }
}

async function hapusAkunRepository(id) {
  try {
    const hasil = await User.deleteOne({ _id: id });
    return hasil.deletedCount > 0;
  } catch (error) {
    console.error('Gagal menghapus akun:', error);
    throw error;
  }
}

async function hapusAkunRepository(id) {
  try {
    return Rekeningschema.deleteOne({ _id: id });
  } catch (error) {
    throw new Error('Gagal menghapus akun');
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  getRekening,
  hapusAkunRepository,
};
