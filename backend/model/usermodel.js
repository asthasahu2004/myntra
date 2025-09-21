const mongoose = require('mongoose')
const validator = require('validator')
const jwtToken = require('jsonwebtoken')


const usermodel = new mongoose.Schema({
    phonenumber : {
        type:Number,
        unique:true,
        require:[true, "Error: Enter Phone Number Above"]
    },
    verify : {
        type: String,
        required: true,
        default: "unverified"
    },
    email:{
        type:String,
        validate:[validator.isEmail, 'Please enter valid Email ID ']
        
    },

    password:{
        type:String
    },

    otp:{
        type:Number,
        createdAt: {
            type: Date,
            required: true,
            default: Date.now,
            index: { expires: '1m' }
          }
        
    },

    name:{
        type:String
    },
   gender:{
       type:String
   },
   DOB:{
       type:Date
   },
   address:{
       pincode:{
           type:Number
       },
       
       address1:{
           type:String
       },
       address2:{
        type:String
        },
        citystate:{
            type:String
        },  
   },
   TOA:{
       type:String
   },
   // Friends-related fields
   selectedContacts: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Contact'
   }],
   friendsFeeds: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'FriendsFeed'
   }],
   dataUploads: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'DataUpload'
   }],
   friendsPreferences: {
       defaultContactCount: {
           type: Number,
           default: 10,
           min: 10
       },
       autoRefreshFeed: {
           type: Boolean,
           default: false
       },
       feedSortBy: {
           type: String,
           enum: ['relevance', 'price', 'brand', 'category', 'date'],
           default: 'relevance'
       }
   }
    

}, {
    timestamps: true
})

usermodel.methods.getJWTToken = function () {
   
    return jwtToken.sign({id:this._id}, process.env.SECRETID, {expiresIn: '2d'})
}

module.exports = mongoose.model('MynUser', usermodel)