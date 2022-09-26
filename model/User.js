const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: String,
    email: String,
    initials: String,
    password: String,
    isOnline: {
      type: Boolean,
      default: false
    }
}, { timestamps: true })

userSchema.methods.toJSON = function() {
  var obj = this.toObject()
  delete obj.password
  delete obj.updatedAt
  return obj
}

module.exports = mongoose.model('User', userSchema)