//import mongoose from 'mongoose';
const mongoose = require('mongoose');

const homeSchema = mongoose.Schema({
    houseName: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    rating: { type: Number, required: true },
    photo: String,
    rulesPDF: String,
    description: String,
})


//homeSchema.pre() is used to create a Mongoose pre middleware (pre-hook)
//Run some code BEFORE a particular Mongoose operation happens.


// homeSchema.pre('findByIdAndDelete', async function() {
//     console.log("Pre hook called for findOneAndDelete");
//     const homeId = this.getQuery()["_id"];
//     await favourite.deleteMany({homeId : homeId});
// });

//mongoose.model('Home', homeSchema);  // this will create a collection called homes in the database, and it will use the homeSchema to define the structure of the documents in that collection
//Mongoose will automatically pluralize the model name to create the collection name. In this case, the model name is 'Home', so the collection name will be 'homes'.
module.exports = mongoose.model('Home', homeSchema);


