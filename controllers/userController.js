const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models/models')

const generateJwt = (id, email, username) => {
  return jwt.sign(
    {id, email, username},
    process.env.SECRET_KEY,
    {expiresIn: '24h'},
  )
}
class UserController {
  async registration(req, res, next) {
    const { email, username, password } = req.body
    if (!email || !password) {
      return next(ApiError.badRequest('Некорректные данные'))
    }
    const candidate = await User.findOne({where: {email}})
    if (candidate) {
      return next(ApiError.badRequest('Пользователь с таким e-mail уже существует'))
    }
    const hashPassword = await bcrypt.hash(password, 5)
    const user = await User.create({email, username, password: hashPassword})
    const token = generateJwt(user.id, user.email, user.username)
    return res.json({token})
  }

  async login(req, res, next) {
    const {email, password} = req.body
    const user = await User.findOne({where: {email}})
    if(!user) {
      return next(new ApiError(500, 'Неверный e-mail или пароль'));
    }
    let comparePassword = bcrypt.compareSync(password, user.password)
    if(!comparePassword) {
      return next(new ApiError(500, 'Неверный e-mail или пароль'));
    }
    const token = generateJwt(user.id, user.email, user.username, user.password)
    return res.json( {token} )
  }

  async check(req, res) {
    const token = generateJwt(req.user.id, req.user.email, req.user.username, req.user.password)
    return res.json( {token} )
  }
}

module.exports = new UserController();