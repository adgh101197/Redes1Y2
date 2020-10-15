const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
// const saltRounds = 10 //tamaño de encriptacion
var salt = bcrypt.genSaltSync(10)

const userSchema = new mongoose.Schema({
    user: {type: String,    
                require: true,
                unique: true},
    password: {type: String, require: true}
    //last_login_date: {
    //    type: Date,
    //    default: Date.now
    //}
})

userSchema.pre('save', function(next) {
    console.log('deno1')
    if(this.isNew || this.isModified('password')) {
        const document = this;
        bcrypt.hash(document.password, salt, null, (err, hashedPassword) => {
            if(err) {
                console.log('deno' + err)
                next(err)
            } else {
                document.password = hashedPassword
                next();
            }
        });
    } else {
        next();
    }
})

userSchema.methods.isPSWcorrect = function(password, callback) {
    console.log('deno2')
    bcrypt.compare(password, this.password, function(err, same) {
        if(err) {
            callback(err)
        } else {
            callback(err, same);
        }
    });
}

module.exports = mongoose.model('users', userSchema, 'users')
